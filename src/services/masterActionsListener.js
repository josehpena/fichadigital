import { supabase } from '../lib/supabase';

/**
 * Subscribe to master_actions for a player in a campaign via Supabase Realtime.
 * When an unapplied action arrives, calls onAction(action) and marks it as applied.
 *
 * Mapping of action_type to CharacterContext reducer action:
 *   damage        -> CHANGE_STATUS { statusKey, field: 'current', delta: -amount }
 *   heal          -> CHANGE_STATUS { statusKey, field: 'current', delta: +amount }
 *   grant_xp      -> CHANGE_STATUS { statusKey: 'xp', field: 'current', delta: +amount }
 *   add_effect    -> ADD_NARRATIVE_EFFECT { effect }
 *   remove_effect -> REMOVE_NARRATIVE_EFFECT { index }
 *
 * Returns an unsubscribe function.
 */
export function subscribeToActions(campaignId, playerId, dispatch) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`master_actions:${campaignId}:${playerId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'master_actions',
        filter: `campaign_id=eq.${campaignId}`,
      },
      async (payload) => {
        const action = payload.new;
        if (action.target_player_id !== playerId) return;
        if (action.applied) return;

        // Map to reducer action and dispatch
        const reducerAction = mapToReducerAction(action);
        if (reducerAction) dispatch(reducerAction);

        // Acknowledge to Supabase
        await supabase
          .from('master_actions')
          .update({ applied: true })
          .eq('id', action.id);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

function mapToReducerAction(action) {
  const { action_type, payload } = action;
  switch (action_type) {
    case 'damage':
      return {
        type: 'CHANGE_STATUS',
        statusKey: payload.statusKey ?? 'vida',
        field: 'current',
        delta: -(Math.abs(payload.amount ?? 0)),
      };
    case 'heal':
      return {
        type: 'CHANGE_STATUS',
        statusKey: payload.statusKey ?? 'vida',
        field: 'current',
        delta: Math.abs(payload.amount ?? 0),
      };
    case 'grant_xp':
      return {
        type: 'CHANGE_STATUS',
        statusKey: 'xp',
        field: 'current',
        delta: Math.abs(payload.amount ?? 0),
      };
    case 'add_effect':
      return {
        type: 'ADD_NARRATIVE_EFFECT',
        effect: payload.effect,
      };
    case 'remove_effect':
      return {
        type: 'REMOVE_NARRATIVE_EFFECT',
        index: payload.index,
      };
    default:
      console.warn('[masterActionsListener] Unknown action_type:', action_type);
      return null;
  }
}
