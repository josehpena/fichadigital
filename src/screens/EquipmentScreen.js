import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useCharacter } from '../context/CharacterContext';
import {
  ARMOR_SLOTS, HAND_SLOTS, EQUIP_LABELS, computeDefenseTotals,
} from '../data/initialCharacter';

// ─── Slot de armadura ─────────────────────────────────────────────────────────
function ArmorSlotCard({ slotKey }) {
  const { character, dispatch } = useCharacter();
  const equip = character.equipment[slotKey];
  const broken = equip.durabilidade === 0;

  const setField = (field, value) =>
    dispatch({ type: 'SET_EQUIP_FIELD', slot: slotKey, field, value });
  const changeDur = (delta) =>
    dispatch({ type: 'CHANGE_EQUIP_DURABILITY', slot: slotKey, delta });

  const durPct = equip.durabilidadeMax > 0
    ? equip.durabilidade / equip.durabilidadeMax
    : 0;

  return (
    <View style={[styles.card, broken && styles.cardBroken]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.slotName, broken && styles.textDim]}>
          {EQUIP_LABELS[slotKey]}
        </Text>
        {broken && (
          <View style={styles.brokenBadge}>
            <Text style={styles.brokenText}>QUEBRADO</Text>
          </View>
        )}
      </View>

      {/* Armadura, Res. Mágica e Reputação */}
      <View style={styles.statRow}>
        <NumField
          label="Armadura"
          value={equip.armadura}
          dimmed={broken}
          onChange={(v) => setField('armadura', v)}
        />
        <NumField
          label="Res. Mágica"
          value={equip.resMagica}
          dimmed={broken}
          onChange={(v) => setField('resMagica', v)}
        />
        <NumField
          label="Reputação"
          value={equip.reputacao || 0}
          dimmed={broken}
          onChange={(v) => setField('reputacao', v)}
        />
      </View>

      {/* Efeitos */}
      <TextInput
        style={styles.efectosInput}
        value={equip.efeitos}
        onChangeText={(v) => setField('efeitos', v)}
        placeholder="Efeitos..."
        placeholderTextColor="#45475a"
        multiline
      />

      {/* Durabilidade */}
      <View style={styles.durRow}>
        <Text style={styles.durLabel}>Durabilidade</Text>
        <TouchableOpacity onPress={() => changeDur(-1)} style={styles.durBtn}>
          <Text style={styles.durBtnText}>−</Text>
        </TouchableOpacity>
        <View style={styles.durBarWrap}>
          <View style={[styles.durBar, { width: `${durPct * 100}%`, backgroundColor: broken ? '#f38ba8' : '#a6e3a1' }]} />
        </View>
        <Text style={styles.durVal}>{equip.durabilidade}/{equip.durabilidadeMax}</Text>
        <TouchableOpacity onPress={() => changeDur(+1)} style={styles.durBtn}>
          <Text style={styles.durBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Max durabilidade */}
      <View style={styles.durMaxRow}>
        <Text style={styles.durMaxLabel}>Dur. máx:</Text>
        <TouchableOpacity
          style={styles.durMaxBtn}
          onPress={() => setField('durabilidadeMax', Math.max(1, equip.durabilidadeMax - 1))}
        >
          <Text style={styles.durBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.durMaxVal}>{equip.durabilidadeMax}</Text>
        <TouchableOpacity
          style={styles.durMaxBtn}
          onPress={() => setField('durabilidadeMax', equip.durabilidadeMax + 1)}
        >
          <Text style={styles.durBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Slot de mão (arma) ───────────────────────────────────────────────────────
function HandSlotCard({ slotKey }) {
  const { character, dispatch } = useCharacter();
  const equip = character.equipment[slotKey];

  const setField = (field, value) =>
    dispatch({ type: 'SET_EQUIP_FIELD', slot: slotKey, field, value });

  return (
    <View style={[styles.card, styles.cardHand]}>
      <Text style={styles.slotName}>{EQUIP_LABELS[slotKey]}</Text>
      <TextInput
        style={styles.textField}
        value={equip.nome}
        onChangeText={(v) => setField('nome', v)}
        placeholder="Nome da arma..."
        placeholderTextColor="#45475a"
      />
      <TextInput
        style={styles.textField}
        value={equip.dano}
        onChangeText={(v) => setField('dano', v)}
        placeholder="Dano (ex: 1d8+Força)..."
        placeholderTextColor="#45475a"
      />
      <TextInput
        style={styles.efectosInput}
        value={equip.efeitos}
        onChangeText={(v) => setField('efeitos', v)}
        placeholder="Efeitos..."
        placeholderTextColor="#45475a"
        multiline
      />
    </View>
  );
}

// ─── Acessório ────────────────────────────────────────────────────────────────
function AccessoryCard({ index }) {
  const { character, dispatch } = useCharacter();
  const acc = character.accessories[index];
  const [expanded, setExpanded] = useState(false);

  const setField = (field, value) =>
    dispatch({ type: 'SET_ACCESSORY', index, field, value });

  const hasData = acc.nome || acc.armadura || acc.resMagica || acc.reputacao || acc.efeitos;

  return (
    <View style={styles.accCard}>
      <TouchableOpacity
        style={styles.accHeader}
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.7}
      >
        <Text style={styles.accIndex}>{index + 1}</Text>
        <Text style={styles.accName} numberOfLines={1}>
          {acc.nome || 'Acessório vazio'}
        </Text>
        {hasData && (
          <View style={styles.accBadgeRow}>
            {acc.armadura > 0        && <Text style={styles.accBadge}>🛡 {acc.armadura}</Text>}
            {acc.resMagica > 0       && <Text style={styles.accBadge}>✨ {acc.resMagica}</Text>}
            {(acc.reputacao || 0) > 0 && <Text style={styles.accBadge}>🎭 {acc.reputacao}</Text>}
          </View>
        )}
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.accBody}>
          <TextInput
            style={styles.textField}
            value={acc.nome}
            onChangeText={(v) => setField('nome', v)}
            placeholder="Nome do acessório..."
            placeholderTextColor="#45475a"
          />
          <View style={styles.statRow}>
            <NumField label="Armadura"    value={acc.armadura}          onChange={(v) => setField('armadura', v)} />
            <NumField label="Res. Mágica" value={acc.resMagica}         onChange={(v) => setField('resMagica', v)} />
            <NumField label="Reputação"   value={acc.reputacao || 0}    onChange={(v) => setField('reputacao', v)} />
          </View>
          <TextInput
            style={styles.efectosInput}
            value={acc.efeitos}
            onChangeText={(v) => setField('efeitos', v)}
            placeholder="Efeito narrativo..."
            placeholderTextColor="#45475a"
            multiline
          />
        </View>
      )}
    </View>
  );
}

// ─── Campo numérico com +/- ───────────────────────────────────────────────────
function NumField({ label, value, onChange, dimmed }) {
  return (
    <View style={styles.numField}>
      <Text style={[styles.numLabel, dimmed && styles.textDim]}>{label}</Text>
      <View style={styles.numControls}>
        <TouchableOpacity
          style={styles.numBtn}
          onPress={() => onChange(Math.max(0, value - 1))}
        >
          <Text style={styles.numBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={[styles.numValue, dimmed && styles.textDim]}>{value}</Text>
        <TouchableOpacity style={styles.numBtn} onPress={() => onChange(value + 1)}>
          <Text style={styles.numBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function EquipmentScreen() {
  const { character } = useCharacter();
  const { totalArmadura, totalResMagica } = computeDefenseTotals(
    character.equipment,
    character.accessories
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Totais */}
      <View style={styles.totalsRow}>
        <View style={styles.totalBadge}>
          <Text style={styles.totalIcon}>🛡️</Text>
          <Text style={styles.totalLabel}>Armadura Total</Text>
          <Text style={styles.totalValue}>{totalArmadura}</Text>
        </View>
        <View style={styles.totalBadge}>
          <Text style={styles.totalIcon}>✨</Text>
          <Text style={styles.totalLabel}>Res. Mágica Total</Text>
          <Text style={styles.totalValue}>{totalResMagica}</Text>
        </View>
      </View>

      {/* Armas */}
      <Text style={styles.sectionTitle}>Empunhadura</Text>
      {HAND_SLOTS.map((k) => <HandSlotCard key={k} slotKey={k} />)}

      {/* Armadura */}
      <Text style={styles.sectionTitle}>Armadura</Text>
      {ARMOR_SLOTS.map((k) => <ArmorSlotCard key={k} slotKey={k} />)}

      {/* Acessórios */}
      <Text style={styles.sectionTitle}>Acessórios</Text>
      {character.accessories.map((_, i) => (
        <AccessoryCard key={i} index={i} />
      ))}
    </ScrollView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: '#11111b' },
  content: { padding: 16, paddingBottom: 40 },

  sectionTitle: {
    color: '#89b4fa', fontSize: 13, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1,
    marginBottom: 10, marginTop: 6,
  },

  totalsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  totalBadge: {
    flex: 1, backgroundColor: '#1e1e2e', borderRadius: 10,
    padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#2e2e4e',
  },
  totalIcon:  { fontSize: 18, marginBottom: 2 },
  totalLabel: { color: '#6c7086', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  totalValue: { color: '#cdd6f4', fontSize: 24, fontWeight: 'bold' },

  card: {
    backgroundColor: '#1e1e2e', borderRadius: 12,
    padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: '#2e2e4e',
  },
  cardBroken: { borderColor: '#45273a', opacity: 0.85 },
  cardHand:   { borderLeftWidth: 3, borderLeftColor: '#fab387' },

  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  slotName:   { color: '#cdd6f4', fontSize: 15, fontWeight: '700', flex: 1 },
  textDim:    { color: '#45475a' },

  brokenBadge: {
    backgroundColor: '#45273a', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  brokenText: { color: '#f38ba8', fontSize: 10, fontWeight: '700' },

  statRow:    { flexDirection: 'row', gap: 10, marginBottom: 8 },
  numField:   { flex: 1 },
  numLabel:   { color: '#6c7086', fontSize: 11, marginBottom: 4, textTransform: 'uppercase' },
  numControls:{ flexDirection: 'row', alignItems: 'center', gap: 6 },
  numBtn:     {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#313244', alignItems: 'center', justifyContent: 'center',
  },
  numBtnText: { color: '#cdd6f4', fontSize: 16, lineHeight: 20 },
  numValue:   { color: '#cdd6f4', fontSize: 16, fontWeight: '700', minWidth: 28, textAlign: 'center' },

  efectosInput: {
    color: '#cdd6f4', fontSize: 13,
    borderWidth: 1, borderColor: '#313244',
    borderRadius: 6, padding: 8, minHeight: 40,
    textAlignVertical: 'top', marginBottom: 8,
  },
  textField: {
    color: '#cdd6f4', fontSize: 13,
    borderWidth: 1, borderColor: '#313244',
    borderRadius: 6, padding: 8, marginBottom: 8,
  },

  durRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  durLabel: { color: '#6c7086', fontSize: 11, textTransform: 'uppercase', width: 72 },
  durBtn: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#313244', alignItems: 'center', justifyContent: 'center',
  },
  durBtnText: { color: '#cdd6f4', fontSize: 14, lineHeight: 18 },
  durBarWrap: { flex: 1, height: 6, backgroundColor: '#313244', borderRadius: 3, overflow: 'hidden' },
  durBar:     { height: 6, borderRadius: 3 },
  durVal:     { color: '#6c7086', fontSize: 11, minWidth: 30, textAlign: 'center' },

  durMaxRow:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  durMaxLabel:{ color: '#45475a', fontSize: 11, flex: 1 },
  durMaxBtn:  {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#1e1e2e', borderWidth: 1, borderColor: '#313244',
    alignItems: 'center', justifyContent: 'center',
  },
  durMaxVal:  { color: '#45475a', fontSize: 12, minWidth: 20, textAlign: 'center' },

  accCard: {
    backgroundColor: '#1e1e2e', borderRadius: 10,
    marginBottom: 6, borderWidth: 1, borderColor: '#2e2e4e', overflow: 'hidden',
  },
  accHeader: {
    flexDirection: 'row', alignItems: 'center',
    padding: 10, gap: 8,
  },
  accIndex:    { color: '#45475a', fontSize: 12, fontWeight: '700', width: 18 },
  accName:     { color: '#cdd6f4', fontSize: 13, flex: 1 },
  accBadgeRow: { flexDirection: 'row', gap: 6 },
  accBadge:    { color: '#89b4fa', fontSize: 12 },
  chevron:     { color: '#45475a', fontSize: 11 },
  accBody:     { paddingHorizontal: 12, paddingBottom: 10 },
});
