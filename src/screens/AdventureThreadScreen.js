import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { supabase } from '../services/supabase';

const ROLE_LABELS = {
  master: '⚔️ Mestre',
};

export default function AdventureThreadScreen({ adventure, userId, sheetId, sheetName, onClose }) {
  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [body, setBody]           = useState('');
  const [sending, setSending]     = useState(false);
  const [error, setError]         = useState(null);
  const flatRef                   = useRef(null);

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

    const channel = supabase
      .channel(`adv_posts_player:${adventure.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'adventure_posts',
          filter: `adventure_id=eq.${adventure.id}`,
        },
        (payload) => {
          const newPost = payload.new;
          setPosts((prev) => {
            if (prev.some((p) => p.id === newPost.id)) return prev;
            markRead(newPost.id);
            return [...prev, newPost];
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [adventure.id, loadPosts, markRead]);

  useEffect(() => {
    if (posts.length > 0) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [posts.length]);

  async function handleSend() {
    if (!body.trim() || sending) return;
    setSending(true);
    setError(null);
    const { error: err } = await supabase.from('adventure_posts').insert({
      adventure_id: adventure.id,
      author_user_id: userId,
      author_character_sheet_id: sheetId,
      author_role: 'player',
      body: body.trim(),
      time_skip_days: 0,
    });
    if (err) {
      setError('Erro ao enviar. Tente novamente.');
    } else {
      setBody('');
    }
    setSending(false);
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  function authorLabel(post) {
    if (post.author_role === 'master') return ROLE_LABELS.master;
    return `🧙 ${sheetName}`;
  }

  const isMyPost = (post) => post.author_user_id === userId;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.back}>‹ Aventuras</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{adventure.title}</Text>
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
                <Text style={[styles.bubbleAuthor, mine ? styles.authorMine : styles.authorOther]}>
                  {authorLabel(item)}
                </Text>

                {/* Time-skip badge */}
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
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder={`Responder como ${sheetName}…`}
              placeholderTextColor="#6c7086"
              value={body}
              onChangeText={setBody}
              multiline
              maxLength={2000}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!body.trim() || sending}
              style={[styles.sendBtn, (!body.trim() || sending) && styles.sendBtnDisabled]}
            >
              {sending
                ? <ActivityIndicator color="#1e1e2e" size="small" />
                : <Text style={styles.sendIcon}>↑</Text>
              }
            </TouchableOpacity>
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </KeyboardAvoidingView>
      )}

      {adventure.status !== 'open' && (
        <View style={styles.closedBanner}>
          <Text style={styles.closedText}>Esta aventura foi encerrada pelo mestre.</Text>
        </View>
      )}
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2e2e4e',
    backgroundColor: '#1e1e2e',
    gap: 12,
  },
  back: {
    color: '#89b4fa',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#cdd6f4',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  daysBar: {
    backgroundColor: '#181825',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2e2e4e',
  },
  daysText: {
    color: '#fab387',
    fontSize: 12,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#6c7086',
    fontSize: 14,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  bubble: {
    maxWidth: '88%',
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  bubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: '#1e3a5f',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: '#1e1e2e',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#2e2e4e',
  },
  bubbleAuthor: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  authorMine: {
    color: '#89b4fa',
  },
  authorOther: {
    color: '#cba6f7',
  },
  skipBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fab38733',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
  },
  skipText: {
    color: '#fab387',
    fontSize: 11,
    fontWeight: '700',
  },
  bubbleBody: {
    color: '#cdd6f4',
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTime: {
    color: '#6c7086',
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#2e2e4e',
    backgroundColor: '#1e1e2e',
  },
  input: {
    flex: 1,
    backgroundColor: '#181825',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#cdd6f4',
    fontSize: 14,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#2e2e4e',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#89b4fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#2e2e4e',
  },
  sendIcon: {
    color: '#1e1e2e',
    fontSize: 18,
    fontWeight: '900',
  },
  errorText: {
    color: '#f38ba8',
    fontSize: 12,
    textAlign: 'center',
    paddingBottom: 8,
    paddingHorizontal: 16,
    backgroundColor: '#1e1e2e',
  },
  closedBanner: {
    backgroundColor: '#2e2e4e',
    padding: 14,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#45475a',
  },
  closedText: {
    color: '#6c7086',
    fontSize: 13,
    fontStyle: 'italic',
  },
});
