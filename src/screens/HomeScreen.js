import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, StyleSheet,
  TouchableOpacity, Alert, Modal,
} from 'react-native';
import { useCharacter } from '../context/CharacterContext';
import StatusCard from '../components/StatusCard';
import { computeDefenseTotals, COMPUTED_STATUS_KEYS, STATUS_LABELS } from '../data/initialCharacter';
import { TITLE_BY_ID } from '../data/titlesData';

// ─── Modal de Efeito Narrativo ────────────────────────────────────────────────
const STATUS_KEYS_SELECTABLE = COMPUTED_STATUS_KEYS; // vida, energia, mana, forcaDeVontade

function NarrativeEffectModal({ visible, onClose }) {
  const { dispatch } = useCharacter();
  const [nome, setNome]       = useState('');
  const [tab, setTab]         = useState('status'); // status | texto
  const [selStatus, setSelStatus] = useState(STATUS_KEYS_SELECTABLE[0]);
  const [delta, setDelta]     = useState(1);
  const [texto, setTexto]     = useState('');
  const [linhas, setLinhas]   = useState([]);

  function addLinha() {
    if (tab === 'status') {
      setLinhas(l => [...l, { tipo: 'status', statusKey: selStatus, delta }]);
    } else if (tab === 'texto' && texto.trim()) {
      setLinhas(l => [...l, { tipo: 'texto', texto: texto.trim() }]);
      setTexto('');
    }
  }

  function removeLinha(i) {
    setLinhas(l => l.filter((_, idx) => idx !== i));
  }

  function save() {
    if (!nome.trim() && linhas.length === 0) return;
    dispatch({ type: 'ADD_NARRATIVE_EFFECT', effect: { nome: nome.trim() || 'Efeito', linhas } });
    setNome(''); setLinhas([]); setTab('status'); setDelta(1); setTexto('');
    onClose();
  }

  function linhaLabel(l) {
    if (l.tipo === 'status') return `${STATUS_LABELS[l.statusKey]} ${l.delta > 0 ? '+' : ''}${l.delta}`;
    return l.texto;
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={ne.overlay}>
        <ScrollView style={ne.sheet} contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
          <View style={ne.header}>
            <Text style={ne.title}>✨ Novo Efeito Narrativo</Text>
            <TouchableOpacity onPress={onClose}><Text style={ne.closeBtn}>✕</Text></TouchableOpacity>
          </View>

          {/* Nome do efeito */}
          <Text style={ne.label}>Nome / Origem</Text>
          <TextInput
            style={ne.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Ex: Bênção do Clérigo, Poção..."
            placeholderTextColor="#45475a"
          />

          {/* Linhas adicionadas */}
          {linhas.length > 0 && (
            <View style={ne.linhaList}>
              {linhas.map((l, i) => (
                <View key={i} style={ne.linhaRow}>
                  <Text style={ne.linhaText}>{linhaLabel(l)}</Text>
                  <TouchableOpacity style={ne.removeBtn} onPress={() => removeLinha(i)}>
                    <Text style={ne.removeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Tabs */}
          <View style={ne.tabs}>
            <TouchableOpacity style={[ne.tab, tab === 'status' && ne.tabActive]} onPress={() => setTab('status')}>
              <Text style={[ne.tabText, tab === 'status' && ne.tabTextActive]}>Status</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[ne.tab, tab === 'texto' && ne.tabActive]} onPress={() => setTab('texto')}>
              <Text style={[ne.tabText, tab === 'texto' && ne.tabTextActive]}>Texto livre</Text>
            </TouchableOpacity>
          </View>

          {tab === 'status' ? (
            <View style={ne.addSection}>
              {/* Seleção do status */}
              <View style={ne.chipRow}>
                {STATUS_KEYS_SELECTABLE.map(k => (
                  <TouchableOpacity
                    key={k}
                    style={[ne.chip, selStatus === k && ne.chipActive]}
                    onPress={() => setSelStatus(k)}
                  >
                    <Text style={[ne.chipText, selStatus === k && ne.chipTextActive]}>
                      {STATUS_LABELS[k]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {/* Delta */}
              <View style={ne.deltaRow}>
                <Text style={ne.deltaLabel}>Valor:</Text>
                <TouchableOpacity style={ne.numBtn} onPress={() => setDelta(v => v - 1)}>
                  <Text style={ne.numBtnTxt}>−</Text>
                </TouchableOpacity>
                <Text style={ne.deltaVal}>{delta > 0 ? `+${delta}` : delta}</Text>
                <TouchableOpacity style={ne.numBtn} onPress={() => setDelta(v => v + 1)}>
                  <Text style={ne.numBtnTxt}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={ne.addSection}>
              <TextInput
                style={ne.textInput}
                value={texto}
                onChangeText={setTexto}
                placeholder="Ex: +5 dano cortante, voo por 1h..."
                placeholderTextColor="#45475a"
                multiline
              />
            </View>
          )}

          <TouchableOpacity style={ne.addBtn} onPress={addLinha}>
            <Text style={ne.addBtnText}>+ Adicionar linha</Text>
          </TouchableOpacity>

          <TouchableOpacity style={ne.saveBtn} onPress={save}>
            <Text style={ne.saveBtnText}>Salvar Efeito</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}


export default function HomeScreen() {
  const { character, dispatch } = useCharacter();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput]     = useState(character.name);
  const [showEffectModal, setShowEffectModal] = useState(false);

  const saveName = () => {
    dispatch({ type: 'SET_NAME', value: nameInput.trim() || 'Personagem' });
    setEditingName(false);
  };

  const confirmReset = () =>
    Alert.alert(
      'Resetar Ficha',
      'Todos os dados serão apagados. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Resetar', style: 'destructive', onPress: () => dispatch({ type: 'RESET' }) },
      ]
    );

  const { totalArmadura, totalResMagica, totalReputacao } = computeDefenseTotals(
    character.equipment,
    character.accessories
  );
  const reputacaoBase =
    character.attributes.reputacao.manha +
    character.attributes.reputacao.carisma +
    character.attributes.reputacao.etiqueta;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Nome */}
      <View style={styles.nameRow}>
        {editingName ? (
          <TextInput
            style={styles.nameInput}
            value={nameInput}
            onChangeText={setNameInput}
            onSubmitEditing={saveName}
            onBlur={saveName}
            autoFocus
            placeholder="Nome do personagem"
            placeholderTextColor="#6c7086"
          />
        ) : (
          <TouchableOpacity onPress={() => { setNameInput(character.name); setEditingName(true); }}>
            <Text style={styles.nameText}>{character.name}</Text>
            <Text style={styles.nameTap}>Toque para editar</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={confirmReset} style={styles.resetBtn}>
          <Text style={styles.resetText}>Resetar</Text>
        </TouchableOpacity>
      </View>

      {/* Defesa (totais do equipamento) */}
      <View style={styles.defenseRow}>
        <View style={styles.defenseBadge}>
          <Text style={styles.defenseIcon}>🛡️</Text>
          <Text style={styles.defenseLabel}>Armadura</Text>
          <Text style={styles.defenseValue}>{totalArmadura}</Text>
        </View>
        <View style={styles.defenseBadge}>
          <Text style={styles.defenseIcon}>✨</Text>
          <Text style={styles.defenseLabel}>Res. Mágica</Text>
          <Text style={styles.defenseValue}>{totalResMagica}</Text>
        </View>
        <View style={styles.defenseBadge}>
          <Text style={styles.defenseIcon}>🎭</Text>
          <Text style={styles.defenseLabel}>Reputação</Text>
          <Text style={styles.defenseValue}>{reputacaoBase + totalReputacao}</Text>
          {totalReputacao > 0 && (
            <Text style={styles.defenseBonus}>+{totalReputacao} equip.</Text>
          )}
        </View>
      </View>

      {/* Características */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Características</Text>

        {/* Benefícios dos títulos adquiridos */}
        {(character.titles?.acquired ?? []).map(titleId => {
          const title = TITLE_BY_ID[titleId];
          if (!title?.beneficios?.length) return null;
          return (
            <View key={titleId} style={styles.titleBlock}>
              <Text style={styles.titleBlockName}>{title.nome}</Text>
              {title.beneficios.map((b, i) => (
                <Text key={i} style={styles.beneficioText}>• {b}</Text>
              ))}
            </View>
          );
        })}

        {/* Campo livre (racial, dons, etc.) */}
        <TextInput
          style={styles.racialInput}
          multiline
          value={character.racialTraits}
          onChangeText={(v) => dispatch({ type: 'SET_RACIAL_TRAITS', value: v })}
          placeholder="Características adicionais (raça, dons...)..."
          placeholderTextColor="#6c7086"
        />
      </View>

      {/* Efeitos Narrativos */}
      <View style={styles.sectionBox}>
        <View style={styles.effectsTitleRow}>
          <Text style={styles.sectionTitle}>Efeitos Narrativos</Text>
          <TouchableOpacity style={styles.addEffectBtn} onPress={() => setShowEffectModal(true)}>
            <Text style={styles.addEffectBtnText}>+ Adicionar</Text>
          </TouchableOpacity>
        </View>
        {(character.narrativeEffects ?? []).length === 0 && (
          <Text style={styles.emptyEffects}>Nenhum efeito ativo</Text>
        )}
        {(character.narrativeEffects ?? []).map((ef, i) => (
          <View key={i} style={styles.effectCard}>
            <View style={styles.effectHeader}>
              <Text style={styles.effectNome}>{ef.nome}</Text>
              <TouchableOpacity
                style={styles.effectRemove}
                onPress={() => dispatch({ type: 'REMOVE_NARRATIVE_EFFECT', index: i })}
              >
                <Text style={styles.effectRemoveText}>✕</Text>
              </TouchableOpacity>
            </View>
            {(ef.linhas ?? []).map((l, j) => (
              <Text key={j} style={styles.effectLinha}>
                {l.tipo === 'status'
                  ? `• ${STATUS_LABELS[l.statusKey]} ${l.delta > 0 ? '+' : ''}${l.delta}`
                  : `• ${l.texto}`}
              </Text>
            ))}
          </View>
        ))}
      </View>

      {/* Status – ordem customizável */}
      <Text style={styles.sectionTitle}>Status</Text>
      {character.settings.statusOrder.map((key) => (
        <StatusCard key={key} statusKey={key} />
      ))}

      <NarrativeEffectModal visible={showEffectModal} onClose={() => setShowEffectModal(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: '#11111b' },
  content: { padding: 16, paddingBottom: 40 },

  nameRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  nameText:  { color: '#cdd6f4', fontSize: 22, fontWeight: 'bold' },
  nameTap:   { color: '#6c7086', fontSize: 11, marginTop: 2 },
  nameInput: {
    color: '#cdd6f4', fontSize: 22, fontWeight: 'bold',
    borderBottomWidth: 1, borderBottomColor: '#89b4fa',
    minWidth: 180, paddingVertical: 2,
  },
  resetBtn:  { backgroundColor: '#45273a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  resetText: { color: '#f38ba8', fontSize: 13, fontWeight: '600' },

  defenseRow: {
    flexDirection: 'row', gap: 10, marginBottom: 12,
  },
  defenseBadge: {
    flex: 1,
    backgroundColor: '#1e1e2e',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2e2e4e',
  },
  defenseIcon:  { fontSize: 16, marginBottom: 2 },
  defenseLabel: { color: '#6c7086', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  defenseValue: { color: '#cdd6f4', fontSize: 22, fontWeight: 'bold' },
  defenseBonus: { color: '#a6e3a1', fontSize: 10, marginTop: 1 },

  sectionBox: {
    backgroundColor: '#1e1e2e', borderRadius: 12, padding: 12,
    marginBottom: 16, borderWidth: 1, borderColor: '#2e2e4e',
  },
  sectionTitle: {
    color: '#89b4fa', fontSize: 13, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
  },
  titleBlock:     { marginBottom: 8 },
  titleBlockName: { color: '#f9e2af', fontSize: 12, fontWeight: '700', marginBottom: 3 },
  beneficioText:  { color: '#cdd6f4', fontSize: 13, lineHeight: 19, paddingLeft: 4 },
  racialInput:    { color: '#a6adc8', fontSize: 13, minHeight: 40, textAlignVertical: 'top', marginTop: 6 },

  effectsTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  addEffectBtn:    { backgroundColor: '#313244', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  addEffectBtnText:{ color: '#89b4fa', fontSize: 12, fontWeight: '700' },
  emptyEffects:    { color: '#45475a', fontSize: 12, fontStyle: 'italic', marginBottom: 4 },
  effectCard:      { backgroundColor: '#181825', borderRadius: 8, padding: 10, marginBottom: 6 },
  effectHeader:    { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  effectNome:      { color: '#f9e2af', fontSize: 13, fontWeight: '700', flex: 1 },
  effectRemove:    { width: 22, height: 22, borderRadius: 11, backgroundColor: '#45273a', alignItems: 'center', justifyContent: 'center' },
  effectRemoveText:{ color: '#f38ba8', fontSize: 12 },
  effectLinha:     { color: '#cdd6f4', fontSize: 12, marginBottom: 2 },
});

// ─── Estilos do modal de efeito narrativo ─────────────────────────────────────
const ne = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet:   { backgroundColor: '#1e1e2e', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' },
  header:  { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  title:   { color: '#cdd6f4', fontSize: 17, fontWeight: '700', flex: 1 },
  closeBtn:{ color: '#6c7086', fontSize: 18, padding: 4 },

  label: { color: '#6c7086', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6, marginTop: 4 },
  input: { color: '#cdd6f4', fontSize: 13, borderWidth: 1, borderColor: '#313244', borderRadius: 8, padding: 10, marginBottom: 10, backgroundColor: '#181825' },

  linhaList: { backgroundColor: '#181825', borderRadius: 8, padding: 8, marginBottom: 10 },
  linhaRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 3 },
  linhaText: { color: '#cdd6f4', fontSize: 13, flex: 1 },
  removeBtn: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#45273a', alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { color: '#f38ba8', fontSize: 11 },

  tabs:        { flexDirection: 'row', gap: 6, marginBottom: 10 },
  tab:         { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: '#181825', alignItems: 'center' },
  tabActive:   { backgroundColor: '#313244' },
  tabText:     { color: '#6c7086', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#cdd6f4' },

  addSection: { marginBottom: 10 },
  chipRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  chip:       { backgroundColor: '#181825', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#313244' },
  chipActive: { backgroundColor: '#89b4fa', borderColor: '#89b4fa' },
  chipText:   { color: '#6c7086', fontSize: 12 },
  chipTextActive: { color: '#11111b', fontWeight: '700' },

  deltaRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  deltaLabel:{ color: '#6c7086', fontSize: 12, flex: 1 },
  deltaVal:  { color: '#cdd6f4', fontSize: 18, fontWeight: 'bold', minWidth: 40, textAlign: 'center' },
  numBtn:    { width: 32, height: 32, borderRadius: 16, backgroundColor: '#313244', alignItems: 'center', justifyContent: 'center' },
  numBtnTxt: { color: '#cdd6f4', fontSize: 18, lineHeight: 22 },

  textInput: { color: '#cdd6f4', fontSize: 13, borderWidth: 1, borderColor: '#313244', borderRadius: 8, padding: 10, minHeight: 70, textAlignVertical: 'top', backgroundColor: '#181825' },

  addBtn:     { backgroundColor: '#313244', borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 8 },
  addBtnText: { color: '#89b4fa', fontSize: 14, fontWeight: '600' },
  saveBtn:    { backgroundColor: '#89b4fa', borderRadius: 10, padding: 12, alignItems: 'center' },
  saveBtnText:{ color: '#11111b', fontSize: 14, fontWeight: '700' },
});
