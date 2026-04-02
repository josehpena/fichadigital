import AsyncStorage from '@react-native-async-storage/async-storage';
import { queueSync, isOnline, deleteRemoteSheet } from '../services/syncService';

const SHEETS_LIST_KEY = '@fichadigital_sheets_v1';
const SHEET_PREFIX    = '@fichadigital_v2_';
const LEGACY_KEY      = '@fichadigital_v2';

export async function loadSheetsList() {
  try {
    const raw = await AsyncStorage.getItem(SHEETS_LIST_KEY);
    if (raw) return JSON.parse(raw);

    // Migracao: se existir a ficha legada unica, converte para multi-ficha
    const legacy = await AsyncStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const sheet = { id: 'sheet_legacy', name: 'Personagem', createdAt: Date.now() };
      await AsyncStorage.setItem(`${SHEET_PREFIX}sheet_legacy`, legacy);
      await AsyncStorage.setItem(SHEETS_LIST_KEY, JSON.stringify([sheet]));
      return [sheet];
    }

    return [];
  } catch {
    return [];
  }
}

async function saveList(list) {
  await AsyncStorage.setItem(SHEETS_LIST_KEY, JSON.stringify(list));
}

export async function createSheet(name) {
  const id    = `sheet_${Date.now()}`;
  const sheet = { id, name: name.trim() || 'Personagem', createdAt: Date.now() };
  const list  = await loadSheetsList();
  await saveList([...list, sheet]);
  // Enfileira sync da nova ficha
  await queueSync({ type: 'upsert', sheetId: id, name: sheet.name });
  return sheet;
}

export async function deleteSheet(sheetId, userId) {
  const list = await loadSheetsList();
  await saveList(list.filter(s => s.id !== sheetId));
  await AsyncStorage.removeItem(`${SHEET_PREFIX}${sheetId}`);

  // Remove do remoto
  if (userId) {
    const online = await isOnline();
    if (online) {
      try { await deleteRemoteSheet(userId, sheetId); } catch {}
    } else {
      await queueSync({ type: 'delete', sheetId });
    }
  }
}

export async function renameSheet(sheetId, newName) {
  const list = await loadSheetsList();
  await saveList(list.map(s => s.id === sheetId ? { ...s, name: newName.trim() || s.name } : s));
  // Enfileira sync com nome atualizado
  await queueSync({ type: 'upsert', sheetId, name: newName.trim() });
}
