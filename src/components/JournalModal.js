import React, { useState, useMemo } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, FlatList, Alert, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useCharacter } from '../context/CharacterContext';

const JOURNAL_CATEGORIES = [
  { id: 'npc',    label: 'NPCs',    icone: '\u{1F464}', cor: '#fab387', placeholder: 'Nome do NPC...' },
  { id: 'local',  label: 'Locais',  icone: '\u{1F4CD}', cor: '#89b4fa', placeholder: 'Nome do local...' },
  { id: 'missao', label: 'Miss\u00f5es', icone: '\u2694\uFE0F', cor: '#f38ba8', placeholder: 'Nome da miss\u00e3o...' },
  { id: 'lore',   label: 'Lore',    icone: '\u{1F4DC}', cor: '#cba6f7', placeholder: 'T\u00edtulo...' },
  { id: 'nota',   label: 'Notas',   icone: '\u{1F4DD}', cor: '#a6e3a1', placeholder: 'T\u00edtulo da nota...' },
];

const MISSAO_STATUS = [
  { id: 'ativa',    label: 'Ativa',    cor: '#f9e2af' },
  { id: 'completa', label: 'Completa', cor: '#a6e3a1' },
  { id: 'falhada',  label: 'Falhada',  cor: '#f38ba8' },
];

function formatDate(ts) {
  const d = new Date(ts);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
}

// ─── Entry Card ──────────────────────────────────────────────────────────────

function JournalEntryCard({ entry }) {
  const { dispatch } = useCharacter();
  const [expanded, setExpanded] = useState(false);
  const [editingTitulo, setEditingTitulo] = useState(false);
  const [tituloVal, setTituloVal] = useState(entry.titulo);
  const [conteudoVal, setConteudoVal] = useState(entry.conteudo);
  const [tagsVal, setTagsVal] = useState((entry.tags ?? []).join(', '));

  const cat = JOURNAL_CATEGORIES.find(c => c.id === entry.categoria);
  const cor = cat?.cor ?? '#6c7086';

  function saveTitulo() {
    dispatch({ type: 'JOURNAL_UPDATE', id: entry.id, field: 'titulo', value: tituloVal.trim() });
    setEditingTitulo(false);
  }

  function saveConteudo() {
    dispatch({ type: 'JOURNAL_UPDATE', id: entry.id, field: 'conteudo', value: conteudoVal });
  }

  function saveTags() {
    const tags = tagsVal.split(',').map(t => t.trim()).filter(Boolean);
    dispatch({ type: 'JOURNAL_UPDATE', id: entry.id, field: 'tags', value: tags });
  }

  function confirmDelete() {
    Alert.alert('Deletar nota', `"${entry.titulo}" ser\u00e1 removida.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Deletar', style: 'destructive', onPress: () => dispatch({ type: 'JOURNAL_DELETE', id: entry.id }) },
    ]);
  }

  return (
    <TouchableOpacity
      style={[styles.entryCard, { borderLeftColor: cor }]}
      onPress={() => setExpanded(v => !v)}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.entryHeader}>
        <Text style={{ fontSize: 14 }}>{cat?.icone}</Text>
        {editingTitulo ? (
          <TextInput
            style={styles.entryTituloInput}
            value={tituloVal}
            onChangeText={setTituloVal}
            onBlur={saveTitulo}
            onSubmitEditing={saveTitulo}
            autoFocus
          />
        ) : (
          <Text style={[styles.entryTitulo, { color: cor }]} numberOfLines={1}>
            {entry.titulo || 'Sem t\u00edtulo'}
          </Text>
        )}
        {entry.pinned && <Text style={styles.pinIcon}>{'\u{1F4CC}'}</Text>}
        {entry.categoria === 'missao' && entry.status && (
          <View style={{
            backgroundColor: (MISSAO_STATUS.find(s => s.id === entry.status)?.cor ?? '#6c7086') + '22',
            borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
          }}>
            <Text style={{
              color: MISSAO_STATUS.find(s => s.id === entry.status)?.cor,
              fontSize: 10, fontWeight: '700',
            }}>
              {MISSAO_STATUS.find(s => s.id === entry.status)?.label}
            </Text>
          </View>
        )}
        <Text style={styles.chevron}>{expanded ? '\u25B2' : '\u25BC'}</Text>
      </View>

      {/* Preview (collapsed) */}
      {!expanded && entry.conteudo ? (
        <Text style={styles.entryPreview} numberOfLines={2}>{entry.conteudo}</Text>
      ) : null}

      {/* Tags (collapsed) */}
      {(entry.tags ?? []).length > 0 && !expanded && (
        <View style={styles.tagsRow}>
          {entry.tags.map((tag, i) => (
            <View key={i} style={styles.tagChip}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Expanded body */}
      {expanded && (
        <View style={styles.entryBody}>
          <TextInput
            style={styles.entryConteudoInput}
            value={conteudoVal}
            onChangeText={setConteudoVal}
            onBlur={saveConteudo}
            placeholder="Descri\u00e7\u00e3o, detalhes, observa\u00e7\u00f5es..."
            placeholderTextColor="#45475a"
            multiline
          />

          <View style={styles.tagsEditRow}>
            <Text style={styles.tagsEditLabel}>Tags:</Text>
            <TextInput
              style={styles.tagsEditInput}
              value={tagsVal}
              onChangeText={setTagsVal}
              onBlur={saveTags}
              placeholder="aliado, comerciante, quest..."
              placeholderTextColor="#45475a"
            />
          </View>

          {entry.categoria === 'missao' && (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status:</Text>
              {MISSAO_STATUS.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.statusChip, entry.status === s.id && { backgroundColor: s.cor + '22', borderColor: s.cor }]}
                  onPress={() => dispatch({ type: 'JOURNAL_UPDATE', id: entry.id, field: 'status', value: s.id })}
                >
                  <Text style={[styles.statusChipText, entry.status === s.id && { color: s.cor }]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.entryActions}>
            <TouchableOpacity style={styles.entryActionBtn} onPress={() => dispatch({ type: 'JOURNAL_TOGGLE_PIN', id: entry.id })}>
              <Text style={styles.entryActionText}>{entry.pinned ? '\u{1F4CC} Desafixar' : '\u{1F4CC} Fixar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.entryActionBtn} onPress={() => { setTituloVal(entry.titulo); setEditingTitulo(true); }}>
              <Text style={styles.entryActionText}>{'\u270F\uFE0F'} Renomear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.entryActionBtn, styles.entryActionDanger]} onPress={confirmDelete}>
              <Text style={[styles.entryActionText, { color: '#f38ba8' }]}>{'\u{1F5D1}'} Deletar</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.entryTimestamp}>
            Criado {formatDate(entry.createdAt)}
            {entry.updatedAt !== entry.createdAt ? ` \u00b7 Editado ${formatDate(entry.updatedAt)}` : ''}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── New Entry Modal ─────────────────────────────────────────────────────────

function NewEntryModal({ visible, onClose }) {
  const { dispatch } = useCharacter();
  const [categoria, setCategoria] = useState('nota');
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('ativa');

  const cat = JOURNAL_CATEGORIES.find(c => c.id === categoria);

  function save() {
    if (!titulo.trim()) return;
    dispatch({
      type: 'JOURNAL_ADD',
      entry: {
        categoria,
        titulo: titulo.trim(),
        conteudo,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        status: categoria === 'missao' ? status : null,
      },
    });
    setTitulo(''); setConteudo(''); setTags(''); setCategoria('nota'); setStatus('ativa');
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.newEntryOverlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.newEntrySheet}>
          <View style={styles.newEntryHeader}>
            <Text style={styles.newEntryTitle}>Nova Entrada</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.journalClose}>{'\u2715'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {JOURNAL_CATEGORIES.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.filterChip, categoria === c.id && { backgroundColor: c.cor + '22', borderColor: c.cor }]}
                onPress={() => setCategoria(c.id)}
              >
                <Text style={[styles.filterChipText, categoria === c.id && { color: c.cor }]}>
                  {c.icone} {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TextInput
            style={styles.newEntryInput}
            value={titulo}
            onChangeText={setTitulo}
            placeholder={cat?.placeholder ?? 'T\u00edtulo...'}
            placeholderTextColor="#45475a"
            autoFocus
          />

          <TextInput
            style={[styles.newEntryInput, { minHeight: 80, textAlignVertical: 'top' }]}
            value={conteudo}
            onChangeText={setConteudo}
            placeholder="Descri\u00e7\u00e3o, detalhes..."
            placeholderTextColor="#45475a"
            multiline
          />

          <TextInput
            style={styles.newEntryInput}
            value={tags}
            onChangeText={setTags}
            placeholder="Tags (separadas por v\u00edrgula)..."
            placeholderTextColor="#45475a"
          />

          {categoria === 'missao' && (
            <View style={[styles.statusRow, { marginBottom: 12 }]}>
              <Text style={styles.statusLabel}>Status:</Text>
              {MISSAO_STATUS.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.statusChip, status === s.id && { backgroundColor: s.cor + '22', borderColor: s.cor }]}
                  onPress={() => setStatus(s.id)}
                >
                  <Text style={[styles.statusChipText, status === s.id && { color: s.cor }]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, !titulo.trim() && { opacity: 0.4 }]}
            onPress={save}
            disabled={!titulo.trim()}
          >
            <Text style={styles.saveBtnText}>Salvar</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ─── Main Journal Modal ──────────────────────────────────────────────────────

export default function JournalModal({ visible, onClose }) {
  const { character: state } = useCharacter();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);
  const [showNewEntry, setShowNewEntry] = useState(false);

  const entries = state.journal?.entries ?? [];

  const filtered = useMemo(() => {
    let list = [...entries];

    if (activeFilter) {
      list = list.filter(e => e.categoria === activeFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(e =>
        e.titulo.toLowerCase().includes(q) ||
        e.conteudo.toLowerCase().includes(q) ||
        (e.tags ?? []).some(t => t.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.updatedAt - a.updatedAt;
    });

    return list;
  }, [entries, activeFilter, search]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modal}>
        {/* Header */}
        <View style={styles.journalHeader}>
          <View style={styles.journalTitleRow}>
            <Text style={styles.journalTitle}>{'\u{1F4D3}'} Di\u00e1rio</Text>
            <Text style={styles.journalCount}>{entries.length} notas</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.journalClose}>{'\u2715'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por nome, conte\u00fado ou tag..."
              placeholderTextColor="#45475a"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={styles.searchClear}>{'\u2715'}</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, !activeFilter && styles.filterChipActive]}
              onPress={() => setActiveFilter(null)}
            >
              <Text style={[styles.filterChipText, !activeFilter && styles.filterChipTextActive]}>
                Todos
              </Text>
            </TouchableOpacity>
            {JOURNAL_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.filterChip, activeFilter === cat.id && { backgroundColor: cat.cor + '22', borderColor: cat.cor }]}
                onPress={() => setActiveFilter(activeFilter === cat.id ? null : cat.id)}
              >
                <Text style={[styles.filterChipText, activeFilter === cat.id && { color: cat.cor }]}>
                  {cat.icone} {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* List */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>{'\u{1F4D3}'}</Text>
            <Text style={styles.emptyText}>
              {search
                ? 'Nenhuma nota encontrada para essa busca.'
                : 'Seu di\u00e1rio est\u00e1 vazio.\nToque + para anotar algo!'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <JournalEntryCard entry={item} />}
            contentContainerStyle={{ padding: 12 }}
            keyboardShouldPersistTaps="handled"
          />
        )}

        {/* FAB */}
        <TouchableOpacity style={styles.fab} onPress={() => setShowNewEntry(true)}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>

        {/* New Entry Modal */}
        <NewEntryModal visible={showNewEntry} onClose={() => setShowNewEntry(false)} />
      </View>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  modal: { flex: 1, backgroundColor: '#11111b' },

  journalHeader: { paddingTop: 50, paddingHorizontal: 16, paddingBottom: 10, backgroundColor: '#1e1e2e', borderBottomWidth: 1, borderBottomColor: '#2e2e4e' },
  journalTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  journalTitle: { color: '#cdd6f4', fontSize: 20, fontWeight: '800', flex: 1 },
  journalCount: { color: '#6c7086', fontSize: 12, marginRight: 12 },
  journalClose: { color: '#6c7086', fontSize: 20, padding: 4 },

  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#181825', borderRadius: 10, borderWidth: 1, borderColor: '#313244', paddingHorizontal: 12, marginBottom: 10 },
  searchInput: { flex: 1, color: '#cdd6f4', fontSize: 14, paddingVertical: 10 },
  searchClear: { color: '#45475a', fontSize: 16, padding: 4 },

  filterRow: { marginBottom: 4 },
  filterChip: { backgroundColor: '#181825', borderRadius: 8, borderWidth: 1, borderColor: '#313244', paddingHorizontal: 12, paddingVertical: 6, marginRight: 6 },
  filterChipActive: { backgroundColor: '#313244', borderColor: '#89b4fa' },
  filterChipText: { color: '#6c7086', fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: '#89b4fa' },

  entryCard: { backgroundColor: '#1e1e2e', borderRadius: 10, borderWidth: 1, borderColor: '#2e2e4e', borderLeftWidth: 3, marginBottom: 8, overflow: 'hidden' },
  entryHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  entryTitulo: { fontSize: 14, fontWeight: '700', flex: 1 },
  entryTituloInput: { flex: 1, color: '#cdd6f4', fontSize: 14, fontWeight: '700', borderBottomWidth: 1, borderBottomColor: '#89b4fa', paddingVertical: 2 },
  pinIcon: { fontSize: 12 },
  chevron: { color: '#45475a', fontSize: 11 },

  entryPreview: { color: '#6c7086', fontSize: 12, paddingHorizontal: 12, paddingBottom: 8, lineHeight: 17 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, paddingHorizontal: 12, paddingBottom: 8 },
  tagChip: { backgroundColor: '#313244', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { color: '#89b4fa', fontSize: 10, fontWeight: '600' },

  entryBody: { paddingHorizontal: 12, paddingBottom: 12, gap: 10 },
  entryConteudoInput: { color: '#cdd6f4', fontSize: 13, backgroundColor: '#181825', borderRadius: 8, borderWidth: 1, borderColor: '#313244', padding: 10, minHeight: 80, textAlignVertical: 'top' },

  tagsEditRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tagsEditLabel: { color: '#6c7086', fontSize: 11, fontWeight: '700' },
  tagsEditInput: { flex: 1, color: '#89b4fa', fontSize: 12, backgroundColor: '#181825', borderRadius: 6, borderWidth: 1, borderColor: '#313244', paddingHorizontal: 8, paddingVertical: 6 },

  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusLabel: { color: '#6c7086', fontSize: 11, fontWeight: '700' },
  statusChip: { borderRadius: 6, borderWidth: 1, borderColor: '#313244', paddingHorizontal: 10, paddingVertical: 4 },
  statusChipText: { color: '#6c7086', fontSize: 11, fontWeight: '600' },

  entryActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  entryActionBtn: { backgroundColor: '#313244', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
  entryActionDanger: { backgroundColor: '#2d1b1b' },
  entryActionText: { color: '#6c7086', fontSize: 11, fontWeight: '600' },

  entryTimestamp: { color: '#45475a', fontSize: 10, fontStyle: 'italic', marginTop: 4 },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyIcon: { fontSize: 48, opacity: 0.5 },
  emptyText: { color: '#45475a', fontSize: 14, textAlign: 'center', lineHeight: 22 },

  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#89b4fa', alignItems: 'center', justifyContent: 'center', shadowColor: '#89b4fa', shadowOpacity: 0.4, shadowRadius: 12, elevation: 5 },
  fabText: { color: '#11111b', fontSize: 28, fontWeight: '300', lineHeight: 32 },

  // New Entry Modal
  newEntryOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  newEntrySheet: { backgroundColor: '#1e1e2e', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '85%' },
  newEntryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  newEntryTitle: { color: '#cdd6f4', fontSize: 18, fontWeight: '700' },
  newEntryInput: { color: '#cdd6f4', fontSize: 14, backgroundColor: '#181825', borderRadius: 8, borderWidth: 1, borderColor: '#313244', padding: 12, marginBottom: 10 },
  saveBtn: { backgroundColor: '#89b4fa', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: '#11111b', fontSize: 15, fontWeight: '700' },
});
