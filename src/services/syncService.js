import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from './supabase';

const PENDING_KEY = '@fichadigital_pending_sync';
const SHEET_PREFIX = '@fichadigital_v2_';
const SHEETS_LIST_KEY = '@fichadigital_sheets_v1';

// ── Fila de operacoes pendentes (offline) ────────────────────────────────────

async function getPendingOps() {
  try {
    const raw = await AsyncStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function savePendingOps(ops) {
  await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(ops));
}

// Adiciona uma operacao na fila para sincronizar depois
export async function queueSync(op) {
  const ops = await getPendingOps();
  // Substitui operacao anterior do mesmo sheetId (evita acumular)
  const filtered = ops.filter(o => !(o.type === op.type && o.sheetId === op.sheetId));
  filtered.push({ ...op, queuedAt: Date.now() });
  await savePendingOps(filtered);
}

// ── Verificacao de conexao ───────────────────────────────────────────────────

export async function isOnline() {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable !== false;
  } catch {
    return false;
  }
}

// ── Upload: envia ficha local para Supabase ─────────────────────────────────

export async function uploadSheet(userId, sheetId, sheetData, sheetMeta) {
  const { error } = await supabase
    .from('character_sheets')
    .upsert({
      user_id: userId,
      sheet_id: sheetId,
      name: sheetMeta?.name ?? 'Personagem',
      data: sheetData,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,sheet_id' });

  if (error) throw error;
}

// ── Download: baixa fichas do Supabase ──────────────────────────────────────

export async function downloadAllSheets(userId) {
  const { data, error } = await supabase
    .from('character_sheets')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ── Delete remoto ───────────────────────────────────────────────────────────

export async function deleteRemoteSheet(userId, sheetId) {
  const { error } = await supabase
    .from('character_sheets')
    .delete()
    .eq('user_id', userId)
    .eq('sheet_id', sheetId);

  if (error) throw error;
}

// ── Sincronizacao completa ──────────────────────────────────────────────────

export async function fullSync(userId) {
  const online = await isOnline();
  if (!online) return { synced: false, reason: 'offline' };

  // 1) Processa fila de pendentes
  const pending = await getPendingOps();
  const failed = [];

  for (const op of pending) {
    try {
      if (op.type === 'upsert') {
        const raw = await AsyncStorage.getItem(`${SHEET_PREFIX}${op.sheetId}`);
        if (raw) {
          await uploadSheet(userId, op.sheetId, JSON.parse(raw), { name: op.name });
        }
      } else if (op.type === 'delete') {
        await deleteRemoteSheet(userId, op.sheetId);
      }
    } catch {
      failed.push(op);
    }
  }
  await savePendingOps(failed);

  // 2) Baixa fichas remotas e mescla com locais (remote wins se mais recente)
  try {
    const remoteSheets = await downloadAllSheets(userId);
    const localListRaw = await AsyncStorage.getItem(SHEETS_LIST_KEY);
    const localList = localListRaw ? JSON.parse(localListRaw) : [];
    const localMap = {};
    for (const s of localList) localMap[s.id] = s;

    let merged = [...localList];

    for (const remote of remoteSheets) {
      const localKey = `${SHEET_PREFIX}${remote.sheet_id}`;
      const localRaw = await AsyncStorage.getItem(localKey);

      // Se nao existe localmente, cria
      if (!localMap[remote.sheet_id]) {
        merged.push({
          id: remote.sheet_id,
          name: remote.name,
          createdAt: new Date(remote.updated_at).getTime(),
        });
      }

      // Sobrescreve local com remoto (remote eh a fonte de verdade apos sync)
      if (remote.data) {
        await AsyncStorage.setItem(localKey, JSON.stringify(remote.data));
      }

      // Atualiza nome na lista
      merged = merged.map(s =>
        s.id === remote.sheet_id ? { ...s, name: remote.name } : s
      );
    }

    // 3) Envia fichas locais que nao existem no remoto
    const remoteIds = new Set(remoteSheets.map(r => r.sheet_id));
    for (const local of merged) {
      if (!remoteIds.has(local.id)) {
        const raw = await AsyncStorage.getItem(`${SHEET_PREFIX}${local.id}`);
        if (raw) {
          try {
            await uploadSheet(userId, local.id, JSON.parse(raw), { name: local.name });
          } catch {
            // Silencioso — tentara novamente na proxima sync
          }
        }
      }
    }

    await AsyncStorage.setItem(SHEETS_LIST_KEY, JSON.stringify(merged));
    return { synced: true, sheetCount: merged.length };
  } catch (err) {
    return { synced: false, reason: err.message };
  }
}

// ── Listener de reconexao ───────────────────────────────────────────────────

let unsubscribeNetInfo = null;

export function startNetworkListener(getUserId) {
  if (unsubscribeNetInfo) return; // ja ativo

  unsubscribeNetInfo = NetInfo.addEventListener(async (state) => {
    if (state.isConnected && state.isInternetReachable !== false) {
      const userId = getUserId();
      if (userId) {
        await fullSync(userId);
      }
    }
  });
}

export function stopNetworkListener() {
  if (unsubscribeNetInfo) {
    unsubscribeNetInfo();
    unsubscribeNetInfo = null;
  }
}
