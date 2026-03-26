import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCharacter } from '../context/CharacterContext';
import {
  getMyCampaigns,
  joinCampaign,
  leaveCampaign,
  linkCharacter,
  unlinkCharacter,
} from '../services/campaignService';
import { subscribeToActions } from '../services/masterActionsListener';
import { subscribeToGrants } from '../services/itemGrantsListener';
import { loadSheetsList } from '../utils/sheetsManager';

export default function CampaignScreen() {
  const { user, profile } = useAuth();
  const { dispatch } = useCharacter();
  const [campaigns, setCampaigns]     = useState([]);
  const [loading, setLoading]         = useState(false);
  const [inviteCode, setInviteCode]   = useState('');
  const [joining, setJoining]         = useState(false);
  const [sheets, setSheets]           = useState([]);
  const [linkingFor, setLinkingFor]   = useState(null); // campaignId waiting for sheet selection

  // Holds all active unsubscribe functions so we can clean up
  const unsubscribersRef = useRef([]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [camps, sheetList] = await Promise.all([
      getMyCampaigns(user.id),
      loadSheetsList(),
    ]);
    setCampaigns(camps);
    setSheets(sheetList);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // Re-subscribe whenever campaigns list changes
  useEffect(() => {
    if (!user || !dispatch) return;

    // Tear down previous subscriptions
    unsubscribersRef.current.forEach(fn => fn());
    unsubscribersRef.current = [];

    // Subscribe only for campaigns that have a linked character
    campaigns
      .filter(cp => cp.character_id)
      .forEach(cp => {
        const unsubActions = subscribeToActions(cp.campaign_id, user.id, dispatch);
        const unsubGrants  = subscribeToGrants(cp.campaign_id, user.id, dispatch);
        unsubscribersRef.current.push(unsubActions, unsubGrants);
      });

    return () => {
      unsubscribersRef.current.forEach(fn => fn());
      unsubscribersRef.current = [];
    };
  }, [campaigns, user, dispatch]);

  async function handleJoin() {
    if (!inviteCode.trim()) return;
    setJoining(true);
    try {
      await joinCampaign(inviteCode.trim(), user.id);
      setInviteCode('');
      await load();
    } catch (e) {
      Alert.alert('Erro ao entrar', e.message);
    } finally {
      setJoining(false);
    }
  }

  async function handleLeave(campaignId, campaignName) {
    Alert.alert(
      'Sair da campanha',
      `Deseja sair de "${campaignName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair', style: 'destructive',
          onPress: async () => {
            try {
              await leaveCampaign(campaignId, user.id);
              await load();
            } catch (e) {
              Alert.alert('Erro', e.message);
            }
          },
        },
      ]
    );
  }

  async function handleLinkSheet(campaignId, sheetId) {
    try {
      if (sheetId) {
        await linkCharacter(campaignId, sheetId, user.id);
      } else {
        await unlinkCharacter(campaignId, user.id);
      }
      setLinkingFor(null);
      await load();
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Faça login para acessar campanhas.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Join by invite code */}
      <View style={styles.joinBox}>
        <Text style={styles.sectionTitle}>Entrar em uma campanha</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Código de convite (ex: A3F9K2)"
            placeholderTextColor="#6c7086"
            autoCapitalize="characters"
            value={inviteCode}
            onChangeText={setInviteCode}
          />
          <TouchableOpacity
            style={[styles.joinBtn, joining && styles.btnDisabled]}
            onPress={handleJoin}
            disabled={joining}
          >
            {joining
              ? <ActivityIndicator color="#1e1e2e" size="small" />
              : <Text style={styles.joinBtnText}>Entrar</Text>
            }
          </TouchableOpacity>
        </View>
      </View>

      {/* Campaigns list */}
      <Text style={styles.sectionTitle}>Minhas Campanhas</Text>
      {loading
        ? <ActivityIndicator color="#89b4fa" style={{ marginTop: 20 }} />
        : (
          <FlatList
            data={campaigns}
            keyExtractor={item => item.id}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Você ainda não está em nenhuma campanha.</Text>
            }
            renderItem={({ item }) => {
              const camp = item.campaigns;
              const linked = sheets.find(s => s.id === item.character_id);
              return (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{camp?.name}</Text>
                    <TouchableOpacity onPress={() => handleLeave(item.campaign_id, camp?.name)}>
                      <Text style={styles.leaveBtn}>Sair</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.cardMeta}>Código: {camp?.invite_code}</Text>

                  {item.character_id && (
                    <Text style={[styles.cardMeta, styles.activeTag]}>
                      Ouvindo ações do mestre
                    </Text>
                  )}

                  <View style={styles.sheetRow}>
                    <Text style={styles.cardMeta}>
                      Ficha: {linked ? linked.name : 'Nenhuma vinculada'}
                    </Text>
                    <TouchableOpacity
                      style={styles.linkBtn}
                      onPress={() => setLinkingFor(linkingFor === item.campaign_id ? null : item.campaign_id)}
                    >
                      <Text style={styles.linkBtnText}>
                        {linkingFor === item.campaign_id ? 'Cancelar' : 'Vincular'}
                      </Text>
                    </TouchableOpacity>
                    {item.character_id && (
                      <TouchableOpacity
                        style={[styles.linkBtn, { marginLeft: 6, backgroundColor: '#313244' }]}
                        onPress={() => handleLinkSheet(item.campaign_id, null)}
                      >
                        <Text style={styles.linkBtnText}>Desvincular</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Sheet picker */}
                  {linkingFor === item.campaign_id && (
                    <View style={styles.sheetPicker}>
                      {sheets.map(sheet => (
                        <TouchableOpacity
                          key={sheet.id}
                          style={styles.sheetOption}
                          onPress={() => handleLinkSheet(item.campaign_id, sheet.id)}
                        >
                          <Text style={styles.sheetOptionText}>{sheet.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            }}
          />
        )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#11111b', padding: 16 },
  center:       { flex: 1, backgroundColor: '#11111b', alignItems: 'center', justifyContent: 'center' },
  joinBox:      { backgroundColor: '#1e1e2e', borderRadius: 10, padding: 14, marginBottom: 20 },
  sectionTitle: { color: '#cdd6f4', fontSize: 14, fontWeight: '700', marginBottom: 10, letterSpacing: 0.5 },
  row:          { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1, backgroundColor: '#313244', color: '#cdd6f4',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
    fontSize: 14, fontWeight: '600',
  },
  joinBtn:      { backgroundColor: '#89b4fa', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8, justifyContent: 'center' },
  joinBtnText:  { color: '#1e1e2e', fontWeight: '700', fontSize: 14 },
  btnDisabled:  { opacity: 0.6 },
  emptyText:    { color: '#6c7086', textAlign: 'center', marginTop: 20, fontSize: 13 },
  card:         { backgroundColor: '#1e1e2e', borderRadius: 10, padding: 14, marginBottom: 12 },
  cardHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle:    { color: '#cdd6f4', fontSize: 16, fontWeight: '700' },
  cardMeta:     { color: '#a6adc8', fontSize: 12, marginTop: 2 },
  activeTag:    { color: '#a6e3a1', fontSize: 11, marginTop: 4 },
  leaveBtn:     { color: '#f38ba8', fontSize: 12, fontWeight: '600' },
  sheetRow:     { flexDirection: 'row', alignItems: 'center', marginTop: 8, flexWrap: 'wrap', gap: 6 },
  linkBtn:      { backgroundColor: '#89b4fa', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  linkBtnText:  { color: '#1e1e2e', fontSize: 11, fontWeight: '700' },
  sheetPicker:  { marginTop: 8, backgroundColor: '#313244', borderRadius: 8, padding: 8 },
  sheetOption:  { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#45475a' },
  sheetOptionText: { color: '#cdd6f4', fontSize: 14 },
});
