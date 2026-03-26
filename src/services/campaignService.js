import { supabase } from '../lib/supabase';

/**
 * Join a campaign using its invite code.
 * Returns { campaign, membership } or throws.
 */
export async function joinCampaign(inviteCode, userId) {
  if (!supabase || !userId) throw new Error('Not authenticated');

  // Lookup campaign by invite code
  const { data: campaign, error: campErr } = await supabase
    .from('campaigns')
    .select('id, name, invite_code')
    .eq('invite_code', inviteCode.toUpperCase())
    .eq('is_active', true)
    .single();
  if (campErr || !campaign) throw new Error('Campanha não encontrada ou código inválido.');

  // Insert player into campaign_players (ignore conflict if already joined)
  const { data: membership, error: joinErr } = await supabase
    .from('campaign_players')
    .upsert(
      { campaign_id: campaign.id, player_id: userId },
      { onConflict: 'campaign_id,player_id', ignoreDuplicates: true }
    )
    .select()
    .single();
  if (joinErr) throw new Error(joinErr.message);

  return { campaign, membership };
}

/**
 * Leave a campaign.
 */
export async function leaveCampaign(campaignId, userId) {
  if (!supabase || !userId) throw new Error('Not authenticated');
  const { error } = await supabase
    .from('campaign_players')
    .delete()
    .eq('campaign_id', campaignId)
    .eq('player_id', userId);
  if (error) throw new Error(error.message);
}

/**
 * Get all campaigns the user is a player in.
 * Returns array of { campaign_id, character_id, joined_at, campaigns: { id, name, invite_code, master_id } }
 */
export async function getMyCampaigns(userId) {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase
    .from('campaign_players')
    .select(`
      id,
      campaign_id,
      character_id,
      joined_at,
      campaigns (
        id,
        name,
        description,
        invite_code,
        master_id,
        is_active
      )
    `)
    .eq('player_id', userId)
    .order('joined_at', { ascending: false });
  if (error) {
    console.warn('[campaignService] getMyCampaigns error:', error.message);
    return [];
  }
  return data ?? [];
}

/**
 * Link a character sheet to a campaign membership.
 */
export async function linkCharacter(campaignId, characterId, userId) {
  if (!supabase || !userId) throw new Error('Not authenticated');
  const { error } = await supabase
    .from('campaign_players')
    .update({ character_id: characterId })
    .eq('campaign_id', campaignId)
    .eq('player_id', userId);
  if (error) throw new Error(error.message);
}

/**
 * Unlink the character sheet from a campaign membership.
 */
export async function unlinkCharacter(campaignId, userId) {
  if (!supabase || !userId) throw new Error('Not authenticated');
  const { error } = await supabase
    .from('campaign_players')
    .update({ character_id: null })
    .eq('campaign_id', campaignId)
    .eq('player_id', userId);
  if (error) throw new Error(error.message);
}
