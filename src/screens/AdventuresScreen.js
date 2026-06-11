import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal, View, Text, TouchableOpacity, FlatList,
  ActivityIndicator, StyleSheet, SafeAreaView,
} from 'react-native';
import { supabase } from '../services/supabase';
import { isOnline } from '../services/syncService';
import AdventureThreadScreen from './AdventureThreadScreen';

export default function AdventuresScreen({ visible, onClose, userId, sheetId, sheetName }) {
  const [adventures, setAdventures]         = useState([]);
  const [loading, setLoading]               = useState(false);
  const [offline, setOffline]               = useState(false);
  const [selectedAdventure, setSelected]    = useState(null);

  const load = useCallback(async () => {
    if (!visible || !userId || !sheetId) return;
    setLoading(true);

    const online = await isOnline();
    if (!online) { setOffline(true); setLoading(false); return; }
    setOffline(false);

    const { data, error } = await supabase
      .from('adventures')
      .select(`
        id, title, status, master_id, default_time_skip_days, total_time_skip_days,
        updated_at, campaign_id,
        campaigns ( name ),
        adventure_participants!inner ( character_sheet_id, last_read_post_id )
      `)
      .eq('adventure_participants.user_id', userId)
      .eq('adventure_participants.character_sheet_id', sheetId)
      .eq('status', 'open')
      .order('updated_at', { ascending: false });

    if (!error) setAdventures(data ?? []);
    setLoading(false);
  }, [visible, userId, sheetId]);

  useEffect(() => { load(); }, [load]);

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 2)   return 'agora';
    if (mins < 60)  return `há ${mins}min`;
    if (hours < 24) return `há ${hours}h`;
    return `há ${days}d`;
  }

  function hasUnread(adv) {
    const part = adv.adventure_participants?.[0];
    return part && part.last_read_post_id === null;
  }

  if (selectedAdventure) {
    return (
      <AdventureThreadScreen
        adventure={selectedAdventure}
        userId={userId}
        sheetId={sheetId}
        sheetName={sheetName}
        onClose={() => { setSelected(null); load(); }}
      />
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🗺️  Aventuras</Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {offline ? (
          <View style={styles.center}>
            <Text style={styles.offlineIcon}>📡</Text>
            <Text style={styles.emptyTitle}>Sem conexão</Text>
            <Text style={styles.emptyText}>Aventuras ficam indisponíveis offline.</Text>
          </View>
        ) : loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#89b4fa" size="large" />
          </View>
        ) : adventures.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyIcon}>🏕️</Text>
            <Text style={styles.emptyTitle}>Nenhuma aventura em aberto</Text>
            <Text style={styles.emptyText}>O mestre precisa te adicionar a uma aventura.</Text>
          </View>
        ) : (
          <FlatList
            data={adventures}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const unread = hasUnread(item);
              return (
                <TouchableOpacity
                  style={[styles.card, unread && styles.cardUnread]}
                  onPress={() => setSelected(item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardRow}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                    {unread && <View style={styles.badge} />}
                  </View>
                  <Text style={styles.cardCampaign} numberOfLines={1}>
                    {item.campaigns?.name ?? '—'}
                  </Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardDays}>
                      ⏳ {item.total_time_skip_days} dias passados
                    </Text>
                    <Text style={styles.cardTime}>{timeAgo(item.updated_at)}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#11111b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2e2e4e',
    backgroundColor: '#1e1e2e',
  },
  title: {
    color: '#cdd6f4',
    fontSize: 18,
    fontWeight: '700',
  },
  close: {
    color: '#6c7086',
    fontSize: 18,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  offlineIcon: { fontSize: 48, marginBottom: 12 },
  emptyIcon:   { fontSize: 48, marginBottom: 12 },
  emptyTitle:  { color: '#cdd6f4', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptyText:   { color: '#6c7086', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2e2e4e',
  },
  cardUnread: {
    borderColor: '#89b4fa',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    color: '#cdd6f4',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#89b4fa',
    marginLeft: 8,
  },
  cardCampaign: {
    color: '#6c7086',
    fontSize: 12,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDays: {
    color: '#fab387',
    fontSize: 12,
  },
  cardTime: {
    color: '#6c7086',
    fontSize: 12,
  },
});
