import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal, View, Text, TouchableOpacity, FlatList, TextInput,
  ActivityIndicator, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { isOnline } from '../services/syncService';
import { listAdventures, createAdventure, joinAdventure } from '../services/adventureService';
import AdventureThreadScreen from './AdventureThreadScreen';
import RealNameModal from '../components/RealNameModal';

export default function AdventuresScreen({ visible, onClose, userId, sheetId, sheetName }) {
  const { realName } = useAuth();
  const [adventures, setAdventures] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [offline, setOffline]       = useState(false);
  const [selected, setSelected]     = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showName, setShowName]     = useState(false);
  const [filter, setFilter]         = useState('todas'); // 'todas' | 'minhas'

  const load = useCallback(async () => {
    if (!visible || !userId || !sheetId) return;
    setLoading(true);
    const online = await isOnline();
    if (!online) { setOffline(true); setLoading(false); return; }
    setOffline(false);
    try {
      const data = await listAdventures(userId, sheetId);
      setAdventures(data);
    } catch {
      setAdventures([]);
    }
    setLoading(false);
  }, [visible, userId, sheetId]);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'minhas'
    ? adventures.filter(a => a.joined)
    : adventures;

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

  async function handleJoin(adv) {
    try {
      await joinAdventure({ adventureId: adv.id, userId, sheetId, sheetName });
      await load();
      setSelected({ ...adv, joined: true });
    } catch (e) {
      // silent fail; ui ainda reflete o estado
    }
  }

  if (selected) {
    return (
      <AdventureThreadScreen
        adventure={selected}
        userId={userId}
        sheetId={sheetId}
        sheetName={sheetName}
        realName={realName}
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
        <View style={styles.header}>
          <Text style={styles.title}>🗺️  Aventuras</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Nome real + filtros */}
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.nameChip} onPress={() => setShowName(true)}>
            <Text style={styles.nameChipLabel}>Você</Text>
            <Text style={styles.nameChipValue} numberOfLines={1}>
              {realName ? realName : 'Definir nome ›'}
            </Text>
          </TouchableOpacity>
          <View style={styles.filterRow}>
            {['todas', 'minhas'].map(k => (
              <TouchableOpacity
                key={k}
                style={[styles.filterBtn, filter === k && styles.filterBtnActive]}
                onPress={() => setFilter(k)}
              >
                <Text style={[styles.filterText, filter === k && styles.filterTextActive]}>
                  {k === 'todas' ? 'Todas' : 'Minhas'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
        ) : filtered.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyIcon}>🏕️</Text>
            <Text style={styles.emptyTitle}>Nenhuma aventura {filter === 'minhas' ? 'em que você participa' : 'em aberto'}</Text>
            <Text style={styles.emptyText}>Crie uma para começar.</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const isMaster = item.master_id === userId;
              return (
                <View style={[styles.card, item.joined && styles.cardJoined]}>
                  <TouchableOpacity
                    onPress={() => setSelected(item)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.cardRow}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                      {isMaster && <Text style={styles.masterTag}>⚔️ Mestre</Text>}
                    </View>
                    <View style={styles.cardFooter}>
                      <Text style={styles.cardDays}>
                        ⏳ {item.total_time_skip_days} dias · {item.participants.length} participantes
                      </Text>
                      <Text style={styles.cardTime}>{timeAgo(item.updated_at)}</Text>
                    </View>
                  </TouchableOpacity>
                  {!item.joined && (
                    <TouchableOpacity style={styles.joinBtn} onPress={() => handleJoin(item)}>
                      <Text style={styles.joinText}>Entrar como {sheetName}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
          />
        )}

        {/* FAB Criar */}
        {!offline && !loading && (
          <TouchableOpacity style={styles.fab} onPress={() => setShowCreate(true)}>
            <Text style={styles.fabText}>+ Nova Aventura</Text>
          </TouchableOpacity>
        )}

        <CreateAdventureModal
          visible={showCreate}
          onClose={() => setShowCreate(false)}
          onCreated={async (adv) => {
            setShowCreate(false);
            // Master entra automaticamente como participante
            await joinAdventure({ adventureId: adv.id, userId, sheetId, sheetName }).catch(() => {});
            await load();
            setSelected({ ...adv, joined: true, participants: [] });
          }}
          userId={userId}
        />
        <RealNameModal visible={showName} onClose={() => setShowName(false)} />
      </SafeAreaView>
    </Modal>
  );
}

function CreateAdventureModal({ visible, onClose, onCreated, userId }) {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [skipDays, setSkipDays] = useState('5');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible) { setTitle(''); setSkipDays('5'); setError(null); }
  }, [visible]);

  async function submit() {
    if (!title.trim() || busy) return;
    setBusy(true); setError(null);
    try {
      const adv = await createAdventure({ userId, title, defaultSkipDays: skipDays });
      onCreated(adv);
    } catch (e) {
      setError('Não foi possível criar a aventura.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={cStyles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable style={cStyles.overlayPress} onPress={onClose}>
          <Pressable style={[cStyles.sheet, insets.bottom > 0 && { paddingBottom: 32 + insets.bottom }]} onPress={() => {}}>
            <View style={cStyles.handle} />
            <Text style={cStyles.title}>Nova aventura</Text>
            <Text style={cStyles.label}>Título</Text>
            <TextInput
              style={cStyles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: A Cripta de Khorrad"
              placeholderTextColor="#45475a"
              autoFocus
              maxLength={80}
            />
            <Text style={cStyles.label}>Dias padrão por turno do mestre</Text>
            <TextInput
              style={cStyles.input}
              value={skipDays}
              onChangeText={v => setSkipDays(v.replace(/[^0-9]/g, '').slice(0, 3))}
              keyboardType="number-pad"
              maxLength={3}
            />
            {error && <Text style={cStyles.error}>{error}</Text>}
            <View style={cStyles.btnRow}>
              <TouchableOpacity style={cStyles.cancelBtn} onPress={onClose} disabled={busy}>
                <Text style={cStyles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[cStyles.saveBtn, (!title.trim() || busy) && cStyles.saveBtnOff]}
                disabled={!title.trim() || busy}
                onPress={submit}
              >
                {busy ? <ActivityIndicator color="#1e1e2e" size="small" />
                      : <Text style={cStyles.saveText}>Criar</Text>}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#11111b' },
  header:       {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#2e2e4e', backgroundColor: '#1e1e2e',
  },
  title:        { color: '#cdd6f4', fontSize: 18, fontWeight: '700' },
  close:        { color: '#6c7086', fontSize: 18, fontWeight: '600' },

  toolbar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, backgroundColor: '#181825',
    borderBottomWidth: 1, borderBottomColor: '#2e2e4e',
  },
  nameChip: {
    flex: 1, backgroundColor: '#1e1e2e', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: '#2e2e4e',
  },
  nameChipLabel: { color: '#6c7086', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  nameChipValue: { color: '#89b4fa', fontSize: 13, fontWeight: '600', marginTop: 2 },
  filterRow: { flexDirection: 'row', backgroundColor: '#1e1e2e', borderRadius: 10, padding: 2 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  filterBtnActive: { backgroundColor: '#313244' },
  filterText: { color: '#6c7086', fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: '#89b4fa' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  offlineIcon: { fontSize: 48, marginBottom: 12 },
  emptyIcon:   { fontSize: 48, marginBottom: 12 },
  emptyTitle:  { color: '#cdd6f4', fontSize: 16, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  emptyText:   { color: '#6c7086', fontSize: 14, textAlign: 'center', lineHeight: 20 },

  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#1e1e2e', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#2e2e4e',
  },
  cardJoined: { borderColor: '#89b4fa' },
  cardRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardTitle:  { color: '#cdd6f4', fontSize: 15, fontWeight: '700', flex: 1 },
  masterTag:  { color: '#cba6f7', fontSize: 11, fontWeight: '700' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDays:   { color: '#fab387', fontSize: 12 },
  cardTime:   { color: '#6c7086', fontSize: 12 },
  joinBtn: {
    marginTop: 10, backgroundColor: '#1d3052',
    borderRadius: 8, paddingVertical: 9, alignItems: 'center',
    borderWidth: 1, borderColor: '#89b4fa',
  },
  joinText: { color: '#89b4fa', fontSize: 13, fontWeight: '700' },

  fab: {
    position: 'absolute', right: 16, bottom: 24,
    backgroundColor: '#89b4fa', borderRadius: 28,
    paddingHorizontal: 18, paddingVertical: 14,
    shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  fabText: { color: '#1e1e2e', fontWeight: '800' },
});

const cStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)' },
  overlayPress: { flex: 1, justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#181825', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 32 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#45475a', alignSelf: 'center', marginBottom: 14 },
  title: { color: '#cdd6f4', fontSize: 18, fontWeight: '700', marginBottom: 14 },
  label: { color: '#6c7086', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: '#1e1e2e', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    color: '#cdd6f4', fontSize: 15, borderWidth: 1, borderColor: '#45475a',
  },
  error: { color: '#f38ba8', fontSize: 12, marginTop: 8 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelBtn: { flex: 1, backgroundColor: '#313244', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  cancelText: { color: '#6c7086', fontWeight: '600' },
  saveBtn: { flex: 1, backgroundColor: '#89b4fa', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  saveBtnOff: { backgroundColor: '#2e2e4e' },
  saveText: { color: '#1e1e2e', fontWeight: '700' },
});
