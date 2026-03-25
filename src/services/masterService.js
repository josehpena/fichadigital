import { supabase } from '../lib/supabase';

// ── Campanhas do mestre ────────────────────────────────────────────────────
export async function getMasterCampaigns(masterId) {
  if (!supabase || !masterId) return [];
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('master_id', masterId)
    .order('created_at', { ascending: false });
  if (error) { console.warn('[masterService]', error.message); return []; }
  return data ?? [];
}

export async function createCampaign(masterId, name, description) {
  if (!supabase || !masterId) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('campaigns')
    .insert({ master_id: masterId, name, description: description ?? null })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ── Jogadores de uma campanha ──────────────────────────────────────────────
export async function getCampaignPlayers(campaignId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('campaign_players')
    .select(`
      id, player_id, character_id, joined_at,
      profiles ( username ),
      characters ( id, name, data )
    `)
    .eq('campaign_id', campaignId)
    .order('joined_at', { ascending: true });
  if (error) { console.warn('[masterService]', error.message); return []; }
  return data ?? [];
}

export async function removePlayerFromCampaign(campaignId, playerId) {
  if (!supabase) throw new Error('Not authenticated');
  const { error } = await supabase
    .from('campaign_players')
    .delete()
    .eq('campaign_id', campaignId)
    .eq('player_id', playerId);
  if (error) throw new Error(error.message);
}

// ── Ações do mestre ────────────────────────────────────────────────────────
export async function dispatchMasterAction(campaignId, masterId, targetPlayerId, actionType, payload) {
  if (!supabase) throw new Error('Not authenticated');
  const { error } = await supabase.from('master_actions').insert({
    campaign_id: campaignId,
    master_id: masterId,
    target_player_id: targetPlayerId,
    action_type: actionType,
    payload,
  });
  if (error) throw new Error(error.message);
}

// ── Itens ──────────────────────────────────────────────────────────────────
export async function getCampaignItems(campaignId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('items_catalog')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });
  if (error) { console.warn('[masterService]', error.message); return []; }
  return data ?? [];
}

export async function createItem(campaignId, masterId, item) {
  if (!supabase) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('items_catalog')
    .insert({ ...item, campaign_id: campaignId, created_by: masterId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteItem(itemId) {
  if (!supabase) throw new Error('Not authenticated');
  const { error } = await supabase.from('items_catalog').delete().eq('id', itemId);
  if (error) throw new Error(error.message);
}

export async function grantItem(campaignId, masterId, playerId, itemId) {
  if (!supabase) throw new Error('Not authenticated');
  const { error } = await supabase.from('item_grants').insert({
    campaign_id: campaignId,
    from_master_id: masterId,
    to_player_id: playerId,
    item_id: itemId,
  });
  if (error) throw new Error(error.message);
}
