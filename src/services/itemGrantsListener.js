import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

/**
 * Subscribe to item_grants for a player in a campaign via Supabase Realtime.
 * When a pending grant arrives:
 *   - Shows an Alert asking Accept / Reject
 *   - On accept: dispatches INVENTORY_ADD_GRANTED_ITEM and updates grant status to 'received'
 *   - On reject: updates grant status to 'rejected'
 *
 * Returns an unsubscribe function.
 */
export function subscribeToGrants(campaignId, playerId, dispatch) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`item_grants:${campaignId}:${playerId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'item_grants',
        filter: `campaign_id=eq.${campaignId}`,
      },
      async (payload) => {
        const grant = payload.new;
        if (grant.to_player_id !== playerId) return;
        if (grant.status !== 'pending') return;

        // Fetch item details
        const { data: item } = await supabase
          .from('items_catalog')
          .select('name, description, type, weight, properties')
          .eq('id', grant.item_id)
          .single();

        const itemName = item?.name ?? 'Item desconhecido';
        const itemDesc = item?.description ? `\n${item.description}` : '';

        Alert.alert(
          'Item Recebido!',
          `O mestre enviou: ${itemName}${itemDesc}\n\nDeseja aceitar?`,
          [
            {
              text: 'Rejeitar',
              style: 'destructive',
              onPress: () => updateGrantStatus(grant.id, 'rejected'),
            },
            {
              text: 'Aceitar',
              onPress: () => {
                // INVENTORY_ADD_GRANTED_ITEM finds the first empty slot automatically
                dispatch({
                  type: 'INVENTORY_ADD_GRANTED_ITEM',
                  nome: itemName,
                  obs: item?.description ?? '',
                });
                updateGrantStatus(grant.id, 'received');
              },
            },
          ]
        );
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

async function updateGrantStatus(grantId, status) {
  if (!supabase) return;
  const update = { status };
  if (status === 'received') update.received_at = new Date().toISOString();
  const { error } = await supabase
    .from('item_grants')
    .update(update)
    .eq('id', grantId);
  if (error) console.warn('[itemGrantsListener] updateGrantStatus error:', error.message);
}
