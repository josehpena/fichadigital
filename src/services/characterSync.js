import { supabase } from '../lib/supabase';

let _debounceTimer = null;

/**
 * Upload (upsert) a character sheet to Supabase.
 * sheetId is the local AsyncStorage key id used as the remote id.
 */
export async function uploadCharacter(sheetId, data, userId) {
  if (!supabase || !userId) return;
  const { error } = await supabase
    .from('characters')
    .upsert(
      {
        id: sheetId,
        owner_id: userId,
        name: data.name ?? 'Personagem',
        data,
      },
      { onConflict: 'id' }
    );
  if (error) console.warn('[characterSync] uploadCharacter error:', error.message);
}

/**
 * Download a character sheet from Supabase by its id.
 * Returns the data jsonb field or null on error.
 */
export async function downloadCharacter(characterId) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('characters')
    .select('data')
    .eq('id', characterId)
    .single();
  if (error) {
    console.warn('[characterSync] downloadCharacter error:', error.message);
    return null;
  }
  return data?.data ?? null;
}

/**
 * Debounced sync: waits 2 seconds after the last call before uploading.
 * Safe to call on every reducer dispatch.
 */
export function syncOnChange(sheetId, characterData, userId) {
  if (!supabase || !userId) return;
  if (_debounceTimer) clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(() => {
    uploadCharacter(sheetId, characterData, userId);
    _debounceTimer = null;
  }, 2000);
}
