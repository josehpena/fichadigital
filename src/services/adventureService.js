import { supabase } from './supabase';

// Lista todas as aventuras abertas + flag se o personagem ativo participa
export async function listAdventures(userId, sheetId) {
  const { data: adventures, error: errAdv } = await supabase
    .from('adventures')
    .select('id, title, status, master_id, created_by, default_time_skip_days, total_time_skip_days, updated_at')
    .eq('status', 'open')
    .order('updated_at', { ascending: false });
  if (errAdv) throw errAdv;

  const ids = (adventures ?? []).map(a => a.id);
  if (ids.length === 0) return [];

  const { data: parts } = await supabase
    .from('adventure_participants')
    .select('adventure_id, user_id, character_sheet_id, last_read_post_id')
    .in('adventure_id', ids);

  const partsByAdv = {};
  for (const p of parts ?? []) {
    if (!partsByAdv[p.adventure_id]) partsByAdv[p.adventure_id] = [];
    partsByAdv[p.adventure_id].push(p);
  }

  return adventures.map(a => {
    const list = partsByAdv[a.id] ?? [];
    const mine = list.find(p => p.user_id === userId && p.character_sheet_id === sheetId);
    return {
      ...a,
      participants: list,
      joined: !!mine,
      last_read_post_id: mine?.last_read_post_id ?? null,
    };
  });
}

export async function createAdventure({ userId, title, defaultSkipDays }) {
  const { data, error } = await supabase
    .from('adventures')
    .insert({
      title: title.trim(),
      master_id: userId,
      created_by: userId,
      default_time_skip_days: Math.max(0, parseInt(defaultSkipDays) || 5),
      status: 'open',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function joinAdventure({ adventureId, userId, sheetId, sheetName }) {
  const { error } = await supabase
    .from('adventure_participants')
    .upsert({
      adventure_id: adventureId,
      user_id: userId,
      character_sheet_id: sheetId,
      character_name: sheetName ?? '',
    }, { onConflict: 'adventure_id,character_sheet_id' });
  if (error) throw error;
}

export async function listParticipants(adventureId) {
  const { data, error } = await supabase
    .from('adventure_participants')
    .select('user_id, character_sheet_id, character_name')
    .eq('adventure_id', adventureId);
  if (error) return [];
  return data ?? [];
}

export async function sendPost({
  adventureId, userId, sheetId, sheetName,
  realName, role, body, timeSkipDays, visibility, visibleTo,
}) {
  const { error } = await supabase.from('adventure_posts').insert({
    adventure_id: adventureId,
    author_user_id: userId,
    author_character_sheet_id: role === 'master' ? null : sheetId,
    author_character_name: role === 'master' ? '' : (sheetName ?? ''),
    author_real_name: realName ?? '',
    author_role: role,
    body: body.trim(),
    time_skip_days: role === 'master' ? Math.max(0, parseInt(timeSkipDays) || 0) : 0,
    visibility: visibility ?? 'public',
    visible_to: visibility === 'private' ? (visibleTo ?? []) : [],
  });
  if (error) throw error;
}

export async function setMaster({ adventureId, newMasterId }) {
  const { error } = await supabase
    .from('adventures')
    .update({ master_id: newMasterId, updated_at: new Date().toISOString() })
    .eq('id', adventureId);
  if (error) throw error;
}

// Carrega o nome real de uma lista de user_ids (mapa user_id → real_name).
export async function fetchRealNames(userIds) {
  const unique = [...new Set(userIds.filter(Boolean))];
  if (unique.length === 0) return {};
  const { data, error } = await supabase
    .from('user_profiles')
    .select('user_id, real_name')
    .in('user_id', unique);
  if (error) return {};
  const map = {};
  for (const p of data ?? []) map[p.user_id] = p.real_name ?? '';
  return map;
}
