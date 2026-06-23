import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator, Pressable,
  StyleSheet, SafeAreaView, Modal, ScrollView,
} from 'react-native';
import { supabase } from '../services/supabase';
import { listParticipants, setMaster, sendPost, fetchRealNames } from '../services/adventureService';

const VISIBILITY_OPTIONS = [
  { id: 'public',  icon: '🌐', label: 'Todos', desc: 'Qualquer participante vê' },
  { id: 'master',  icon: '⚔️', label: 'Mestre', desc: 'Só o mestre atual vê' },
  { id: 'private', icon: '🔒', label: 'Selecionados', desc: 'Você escolhe quem vê' },
];

export default function AdventureThreadScreen({
  adventure: adv0, userId, sheetId, sheetName, realName, onClose,
}) {
  const [adventure, setAdventure] = useState(adv0);
  const isMaster = adventure.master_id === userId;

  const [posts, setPosts]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [body, setBody]                 = useState('');
  const [sending, setSending]           = useState(false);
  const [error, setError]               = useState(null);
  const [asMaster, setAsMaster]         = useState(false);
  const [skipDays, setSkipDays]         = useState(String(adventure.default_time_skip_days ?? 0));

  const [visibility, setVisibility]     = useState('public');
  const [visibleTo, setVisibleTo]       = useState([]);
  const [showVisModal, setShowVisModal] = useState(false);
  const [showMaster, setShowMaster]     = useState(false);

  const [participants, setParticipants] = useState([]);
  const [profiles, setProfiles]         = useState({}); // user_id → real_name

  const flatRef = useRef(null);

  const reloadProfiles = useCallback(async (userIds) => {
    const map = await fetchRealNames(userIds);
    setProfiles(prev => ({ ...prev, ...map }));
  }, []);

  const loadParticipants = useCallback(async () => {
    const list = await listParticipants(adventure.id);
    setParticipants(list);
    await reloadProfiles(list.map(p => p.user_id).concat([adventure.master_id]).filter(Boolean));
  }, [adventure.id, adventure.master_id, reloadProfiles]);

  const markRead = useCallback(async (lastPostId) => {
    if (!lastPostId) return;
    await supabase
      .from('adventure_participants')
      .update({ last_read_post_id: lastPostId })
      .eq('adventure_id', adventure.id)
      .eq('user_id', userId)
      .eq('character_sheet_id', sheetId);
  }, [adventure.id, userId, sheetId]);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('adventure_posts')
      .select('*')
      .eq('adventure_id', adventure.id)
      .order('created_at', { ascending: true });
    if (!err && data) {
      setPosts(data);
      if (data.length > 0) await markRead(data[data.length - 1].id);
    }
    setLoading(false);
  }, [adventure.id, markRead]);

  useEffect(() => {
    loadPosts();
    loadParticipants();
  }, [loadPosts, loadParticipants]);

  // Realtime: novos posts e mudanças na aventura (master_id)
  useEffect(() => {
    const channel = supabase
      .channel(`adv_thread:${adventure.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'adventure_posts', filter: `adventure_id=eq.${adventure.id}` },
        (payload) => {
          const newPost = payload.new;
          setPosts((prev) => {
            if (prev.some((p) => p.id === newPost.id)) return prev;
            markRead(newPost.id);
            return [...prev, newPost];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'adventures', filter: `id=eq.${adventure.id}` },
        (payload) => setAdventure(prev => ({ ...prev, ...payload.new })),
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [adventure.id, markRead]);

  useEffect(() => {
    if (posts.length > 0) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [posts.length]);

  async function handleSend() {
    if (!body.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      await sendPost({
        adventureId: adventure.id,
        userId, sheetId, sheetName,
        realName,
        role: asMaster && isMaster ? 'master' : 'player',
        body,
        timeSkipDays: skipDays,
        visibility,
        visibleTo,
      });
      setBody('');
    } catch {
      setError('Erro ao enviar. Tente novamente.');
    } finally {
      setSending(false);
    }
  }

  async function handleTakeMaster() {
    try {
      await setMaster({ adventureId: adventure.id, newMasterId: userId });
      setAdventure(prev => ({ ...prev, master_id: userId }));
      setShowMaster(false);
    } catch {
      setError('Não foi possível alterar o mestre.');
    }
  }

  async function handleGiveMaster(targetUserId) {
    try {
      await setMaster({ adventureId: adventure.id, newMasterId: targetUserId });
      setAdventure(prev => ({ ...prev, master_id: targetUserId }));
      setShowMaster(false);
    } catch {
      setError('Não foi possível alterar o mestre.');
    }
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  function authorLabel(post) {
    const real = post.author_real_name || profiles[post.author_user_id] || '';
    if (post.author_role === 'master') {
      return `⚔️ Mestre${real ? ` · ${real}` : ''}`;
    }
    const char = post.author_character_name || (post.author_user_id === userId ? sheetName : '');
    const parts = [];
    if (real) parts.push(real);
    if (char) parts.push(char);
    return `🧙 ${parts.join(' · ') || 'Jogador'}`;
  }

  function visBadge(v) {
    if (v === 'public' || !v) return null;
    const opt = VISIBILITY_OPTIONS.find(o => o.id === v);
    return (
      <View style={styles.visBadge}>
        <Text style={styles.visBadgeText}>{opt?.icon} {opt?.label}</Text>
      </View>
    );
  }

  const isMyPost = (post) => post.author_user_id === userId;
  const masterRealName = profiles[adventure.master_id] || '';
  const visOpt = VISIBILITY_OPTIONS.find(o => o.id === visibility);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.back}>‹ Aventuras</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{adventure.title}</Text>
          <TouchableOpacity onPress={() => setShowMaster(true)}>
            <Text style={styles.masterTitle} numberOfLines={1}>
              ⚔️ Mestre: {masterRealName || (isMaster ? 'você' : '—')}  ›
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Days counter */}
      <View style={styles.daysBar}>
        <Text style={styles.daysText}>
          ⏳ {adventure.total_time_skip_days} dias avançados na aventura
        </Text>
      </View>

      {/* Posts */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#89b4fa" size="large" />
        </View>
      ) : (
        <FlatList
          ref={flatRef}
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const mine = isMyPost(item);
            return (
              <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
                <View style={styles.bubbleHeaderRow}>
                  <Text style={[styles.bubbleAuthor, mine ? styles.authorMine : styles.authorOther]}>
                    {authorLabel(item)}
                  </Text>
                  {visBadge(item.visibility)}
                </View>
                {item.time_skip_days > 0 && (
                  <View style={styles.skipBadge}>
                    <Text style={styles.skipText}>+{item.time_skip_days} dias</Text>
                  </View>
                )}
                <Text style={styles.bubbleBody}>{item.body}</Text>
                <Text style={styles.bubbleTime}>{formatDate(item.created_at)}</Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Nenhuma mensagem ainda.</Text>
            </View>
          }
        />
      )}

      {/* Input */}
      {adventure.status === 'open' && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={90}
        >
          {/* Mode bar */}
          {isMaster && (
            <View style={styles.modeBar}>
              <TouchableOpacity
                onPress={() => setAsMaster(false)}
                style={[styles.modeBtn, !asMaster && styles.modeBtnActive]}
              >
                <Text style={[styles.modeBtnText, !asMaster && styles.modeBtnTextActive]}>
                  🧙 {sheetName}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAsMaster(true)}
                style={[styles.modeBtn, asMaster && styles.modeBtnMasterActive]}
              >
                <Text style={[styles.modeBtnText, asMaster && styles.modeBtnMasterTextActive]}>
                  ⚔️ Mestre
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Visibility chip */}
          <View style={styles.visRow}>
            <TouchableOpacity style={styles.visChip} onPress={() => setShowVisModal(true)}>
              <Text style={styles.visChipText}>
                {visOpt.icon} {visOpt.label}
                {visibility === 'private' && visibleTo.length > 0 ? ` (${visibleTo.length})` : ''}
              </Text>
              <Text style={styles.visChipChevron}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Master skip days */}
          {asMaster && isMaster && (
            <View style={styles.skipRow}>
              <Text style={styles.skipLabel}>Avançar dias:</Text>
              <TouchableOpacity
                onPress={() => setSkipDays(String(Math.max(0, (parseInt(skipDays) || 0) - 1)))}
                style={styles.skipStepper}
              >
                <Text style={styles.skipStepperText}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.skipInput}
                keyboardType="number-pad"
                value={skipDays}
                onChangeText={(v) => setSkipDays(v.replace(/[^0-9]/g, ''))}
                maxLength={3}
              />
              <TouchableOpacity
                onPress={() => setSkipDays(String((parseInt(skipDays) || 0) + 1))}
                style={styles.skipStepper}
              >
                <Text style={styles.skipStepperText}>+</Text>
              </TouchableOpacity>
              <Text style={styles.skipHint}>(padrão: {adventure.default_time_skip_days})</Text>
            </View>
          )}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder={asMaster && isMaster ? 'Narrar como Mestre…' : `Responder como ${sheetName}…`}
              placeholderTextColor="#6c7086"
              value={body}
              onChangeText={setBody}
              multiline
              maxLength={2000}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!body.trim() || sending}
              style={[
                styles.sendBtn,
                asMaster && isMaster ? styles.sendBtnMaster : null,
                (!body.trim() || sending) && styles.sendBtnDisabled,
              ]}
            >
              {sending
                ? <ActivityIndicator color="#1e1e2e" size="small" />
                : <Text style={styles.sendIcon}>↑</Text>}
            </TouchableOpacity>
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </KeyboardAvoidingView>
      )}

      {adventure.status !== 'open' && (
        <View style={styles.closedBanner}>
          <Text style={styles.closedText}>Esta aventura foi encerrada.</Text>
        </View>
      )}

      <VisibilityModal
        visible={showVisModal}
        onClose={() => setShowVisModal(false)}
        visibility={visibility}
        setVisibility={setVisibility}
        visibleTo={visibleTo}
        setVisibleTo={setVisibleTo}
        participants={participants}
        profiles={profiles}
        userId={userId}
      />
      <MasterPickerModal
        visible={showMaster}
        onClose={() => setShowMaster(false)}
        adventure={adventure}
        participants={participants}
        profiles={profiles}
        userId={userId}
        isMaster={isMaster}
        onTake={handleTakeMaster}
        onGive={handleGiveMaster}
      />
    </SafeAreaView>
  );
}

// ─── Visibility Modal ─────────────────────────────────────────────────────────
function VisibilityModal({ visible, onClose, visibility, setVisibility, visibleTo, setVisibleTo, participants, profiles, userId }) {
  const others = participants.filter(p => p.user_id !== userId);

  function toggle(uId) {
    setVisibleTo(prev =>
      prev.includes(uId) ? prev.filter(x => x !== uId) : [...prev, uId]
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={modalStyles.overlay} onPress={onClose}>
        <Pressable style={modalStyles.sheet} onPress={() => {}}>
          <View style={modalStyles.handle} />
          <Text style={modalStyles.title}>Quem vê este post?</Text>

          {VISIBILITY_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.id}
              style={[modalStyles.option, visibility === opt.id && modalStyles.optionActive]}
              onPress={() => setVisibility(opt.id)}
            >
              <Text style={modalStyles.optionIcon}>{opt.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[modalStyles.optionLabel, visibility === opt.id && { color: '#89b4fa' }]}>
                  {opt.label}
                </Text>
                <Text style={modalStyles.optionDesc}>{opt.desc}</Text>
              </View>
              {visibility === opt.id && <Text style={modalStyles.check}>✓</Text>}
            </TouchableOpacity>
          ))}

          {visibility === 'private' && (
            <>
              <Text style={modalStyles.subLabel}>Quem pode ver:</Text>
              <ScrollView style={{ maxHeight: 220 }}>
                {others.length === 0 ? (
                  <Text style={modalStyles.empty}>Nenhum outro participante ainda.</Text>
                ) : (
                  others.map(p => {
                    const selected = visibleTo.includes(p.user_id);
                    const real = profiles[p.user_id] || '';
                    return (
                      <TouchableOpacity
                        key={`${p.user_id}:${p.character_sheet_id}`}
                        style={[modalStyles.participant, selected && modalStyles.participantSelected]}
                        onPress={() => toggle(p.user_id)}
                      >
                        <View style={[modalStyles.checkBox, selected && modalStyles.checkBoxOn]}>
                          {selected && <Text style={modalStyles.checkMark}>✓</Text>}
                        </View>
                        <Text style={modalStyles.participantText}>
                          {real || 'Jogador'}{p.character_name ? ` · ${p.character_name}` : ''}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            </>
          )}

          <TouchableOpacity style={modalStyles.doneBtn} onPress={onClose}>
            <Text style={modalStyles.doneText}>Pronto</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Master Picker Modal ──────────────────────────────────────────────────────
function MasterPickerModal({ visible, onClose, participants, profiles, userId, isMaster, onTake, onGive }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={modalStyles.overlay} onPress={onClose}>
        <Pressable style={modalStyles.sheet} onPress={() => {}}>
          <View style={modalStyles.handle} />
          <Text style={modalStyles.title}>Mestre da aventura</Text>
          <Text style={modalStyles.hint}>
            Qualquer participante pode assumir ou repassar o papel de mestre.
          </Text>

          {!isMaster && (
            <TouchableOpacity style={modalStyles.takeBtn} onPress={onTake}>
              <Text style={modalStyles.takeText}>⚔️ Tornar-me Mestre</Text>
            </TouchableOpacity>
          )}

          {isMaster && (
            <>
              <Text style={modalStyles.subLabel}>Passar para outro participante:</Text>
              <ScrollView style={{ maxHeight: 280 }}>
                {participants.filter(p => p.user_id !== userId).length === 0 ? (
                  <Text style={modalStyles.empty}>Nenhum outro participante.</Text>
                ) : (
                  participants.filter(p => p.user_id !== userId).map(p => {
                    const real = profiles[p.user_id] || '';
                    return (
                      <TouchableOpacity
                        key={`${p.user_id}:${p.character_sheet_id}`}
                        style={modalStyles.participant}
                        onPress={() => onGive(p.user_id)}
                      >
                        <Text style={modalStyles.participantText}>
                          {real || 'Jogador'}{p.character_name ? ` · ${p.character_name}` : ''}
                        </Text>
                        <Text style={modalStyles.giveChevron}>›</Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            </>
          )}

          <TouchableOpacity style={modalStyles.doneBtn} onPress={onClose}>
            <Text style={modalStyles.doneText}>Fechar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#11111b' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#2e2e4e', backgroundColor: '#1e1e2e', gap: 12,
  },
  back: { color: '#89b4fa', fontSize: 16, fontWeight: '600' },
  title: { color: '#cdd6f4', fontSize: 15, fontWeight: '700' },
  masterTitle: { color: '#cba6f7', fontSize: 11, marginTop: 2 },

  daysBar: { backgroundColor: '#181825', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#2e2e4e' },
  daysText: { color: '#fab387', fontSize: 12, fontWeight: '600' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText: { color: '#6c7086', fontSize: 14 },
  list: { padding: 16, gap: 12 },
  bubble: { maxWidth: '88%', borderRadius: 14, padding: 12, gap: 4 },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: '#1e3a5f', borderBottomRightRadius: 4 },
  bubbleOther: { alignSelf: 'flex-start', backgroundColor: '#1e1e2e', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#2e2e4e' },

  bubbleHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bubbleAuthor: { fontSize: 11, fontWeight: '700', marginBottom: 2, flex: 1 },
  authorMine: { color: '#89b4fa' },
  authorOther: { color: '#cba6f7' },

  visBadge: { backgroundColor: '#45475a', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1, marginLeft: 4 },
  visBadgeText: { color: '#f9e2af', fontSize: 9, fontWeight: '700' },

  skipBadge: { alignSelf: 'flex-start', backgroundColor: '#fab38733', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 4 },
  skipText: { color: '#fab387', fontSize: 11, fontWeight: '700' },
  bubbleBody: { color: '#cdd6f4', fontSize: 14, lineHeight: 20 },
  bubbleTime: { color: '#6c7086', fontSize: 10, alignSelf: 'flex-end', marginTop: 4 },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    padding: 12, borderTopWidth: 1, borderTopColor: '#2e2e4e', backgroundColor: '#1e1e2e',
  },
  input: {
    flex: 1, backgroundColor: '#181825', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, color: '#cdd6f4', fontSize: 14, maxHeight: 120,
    borderWidth: 1, borderColor: '#2e2e4e',
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#89b4fa', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#2e2e4e' },
  sendBtnMaster: { backgroundColor: '#cba6f7' },
  sendIcon: { color: '#1e1e2e', fontSize: 18, fontWeight: '900' },

  modeBar: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 4, backgroundColor: '#1e1e2e', borderTopWidth: 1, borderTopColor: '#2e2e4e' },
  modeBtn: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center', backgroundColor: '#181825', borderWidth: 1, borderColor: '#2e2e4e' },
  modeBtnActive: { borderColor: '#89b4fa', backgroundColor: '#89b4fa22' },
  modeBtnMasterActive: { borderColor: '#cba6f7', backgroundColor: '#cba6f722' },
  modeBtnText: { color: '#6c7086', fontSize: 13, fontWeight: '600' },
  modeBtnTextActive: { color: '#89b4fa' },
  modeBtnMasterTextActive: { color: '#cba6f7' },

  visRow: { paddingHorizontal: 12, paddingTop: 8, backgroundColor: '#1e1e2e' },
  visChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#181825', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#45475a', alignSelf: 'flex-start' },
  visChipText: { color: '#f9e2af', fontSize: 12, fontWeight: '600' },
  visChipChevron: { color: '#6c7086', marginLeft: 6, fontSize: 14 },

  skipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#1e1e2e' },
  skipLabel: { color: '#cba6f7', fontSize: 13, fontWeight: '600' },
  skipStepper: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#181825', borderWidth: 1, borderColor: '#45475a', alignItems: 'center', justifyContent: 'center' },
  skipStepperText: { color: '#cdd6f4', fontSize: 18, fontWeight: '700', lineHeight: 22 },
  skipInput: { width: 52, height: 32, borderRadius: 8, backgroundColor: '#181825', borderWidth: 1, borderColor: '#45475a', color: '#cba6f7', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  skipHint: { color: '#6c7086', fontSize: 11, flex: 1 },

  errorText: { color: '#f38ba8', fontSize: 12, textAlign: 'center', paddingBottom: 8, paddingHorizontal: 16, backgroundColor: '#1e1e2e' },
  closedBanner: { backgroundColor: '#2e2e4e', padding: 14, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#45475a' },
  closedText: { color: '#6c7086', fontSize: 13, fontStyle: 'italic' },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#181825', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 32, maxHeight: '85%' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#45475a', alignSelf: 'center', marginBottom: 14 },
  title: { color: '#cdd6f4', fontSize: 17, fontWeight: '700', marginBottom: 12 },
  hint: { color: '#6c7086', fontSize: 12, marginBottom: 14 },
  subLabel: { color: '#6c7086', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginTop: 14, marginBottom: 8 },
  empty: { color: '#45475a', textAlign: 'center', padding: 16 },

  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, backgroundColor: '#1e1e2e', marginBottom: 8, borderWidth: 1, borderColor: '#2e2e4e' },
  optionActive: { borderColor: '#89b4fa', backgroundColor: '#1d3052' },
  optionIcon: { fontSize: 20 },
  optionLabel: { color: '#cdd6f4', fontSize: 14, fontWeight: '600' },
  optionDesc: { color: '#6c7086', fontSize: 11, marginTop: 2 },
  check: { color: '#89b4fa', fontSize: 18, fontWeight: 'bold' },

  participant: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10, backgroundColor: '#1e1e2e', marginBottom: 6, borderWidth: 1, borderColor: '#2e2e4e' },
  participantSelected: { borderColor: '#89b4fa' },
  participantText: { color: '#cdd6f4', fontSize: 13, flex: 1 },
  checkBox: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#45475a', alignItems: 'center', justifyContent: 'center' },
  checkBoxOn: { borderColor: '#89b4fa', backgroundColor: '#89b4fa' },
  checkMark: { color: '#11111b', fontSize: 11, fontWeight: 'bold' },
  giveChevron: { color: '#6c7086', fontSize: 18 },

  takeBtn: { backgroundColor: '#1d3052', borderRadius: 10, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#cba6f7' },
  takeText: { color: '#cba6f7', fontSize: 14, fontWeight: '700' },

  doneBtn: { backgroundColor: '#89b4fa', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 16 },
  doneText: { color: '#1e1e2e', fontSize: 14, fontWeight: '700' },
});
