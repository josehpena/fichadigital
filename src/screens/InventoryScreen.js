import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Switch, Alert,
} from 'react-native';
import { useCharacter } from '../context/CharacterContext';

// ── Item Slot ─────────────────────────────────────────────────────────────────
function ItemSlot({ index, item, section, placeholder }) {
  const { dispatch } = useCharacter();
  const [showEquip, setShowEquip] = useState(false);
  const isEmpty = !item.nome;

  function equipTo(slot) {
    dispatch({ type: 'EQUIP_FROM_INVENTORY', section, index, slot });
    setShowEquip(false);
  }

  return (
    <View style={[styles.slot, isEmpty && styles.slotEmpty]}>
      <TextInput
        style={styles.slotInput}
        value={item.nome}
        placeholder={placeholder ?? `Item ${index + 1}`}
        placeholderTextColor="#313244"
        onChangeText={v => dispatch({ type: 'INVENTORY_SET_ITEM', section, index, field: 'nome', value: v })}
      />
      {!isEmpty && (
        <>
          <TextInput
            style={styles.slotObs}
            value={item.obs}
            placeholder="obs..."
            placeholderTextColor="#313244"
            onChangeText={v => dispatch({ type: 'INVENTORY_SET_ITEM', section, index, field: 'obs', value: v })}
          />
          {showEquip ? (
            <View style={styles.equipRow}>
              <TouchableOpacity style={styles.equipHandBtn} onPress={() => equipTo('maoDireita')}>
                <Text style={styles.equipHandBtnText}>Mão D</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.equipHandBtn} onPress={() => equipTo('maoEsquerda')}>
                <Text style={styles.equipHandBtnText}>Mão E</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowEquip(false)}>
                <Text style={styles.equipCancelText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.equipBtn} onPress={() => setShowEquip(true)}>
              <Text style={styles.equipBtnText}>⚔ Equipar</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

// ── Coin Button ───────────────────────────────────────────────────────────────
function CoinBtn({ delta, color, onPress }) {
  const label = delta > 0 ? `+${delta}` : `${delta}`;
  return (
    <TouchableOpacity
      style={[styles.coinBtn, { borderColor: color }]}
      onPress={() => onPress(delta)}
    >
      <Text style={[styles.coinBtnText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function InventoryScreen() {
  const { character, dispatch } = useCharacter();
  const inv = character.inventory ?? {
    bolsa: { capacidade: 6, itens: [] },
    moedas: 0,
    cinto: { ativo: false, itens: [] },
  };

  const bolsaSlots = inv.bolsa.itens.slice(0, inv.bolsa.capacidade);
  const cintoSlots = inv.cinto.itens;
  const moedas     = inv.moedas ?? 0;

  const changeMoedas = delta => dispatch({ type: 'INVENTORY_CHANGE_MOEDAS', delta });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>

      {/* ── Bolsa ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🎒 Bolsa</Text>
        <View style={styles.sectionRight}>
          <Text style={styles.capacityText}>{inv.bolsa.capacidade} espaços</Text>
          <TouchableOpacity
            style={styles.expandBtn}
            onPress={() => dispatch({ type: 'INVENTORY_EXPAND_BOLSA' })}
          >
            <Text style={styles.expandBtnText}>+ Expandir</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.grid}>
        {bolsaSlots.map((item, i) => (
          <ItemSlot key={i} index={i} item={item} section="bolsa" />
        ))}
      </View>

      <View style={styles.divider} />

      {/* ── Saco de Moedas ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>💰 Moedas</Text>
        <Text style={styles.moedasTotal}>{moedas}</Text>
      </View>

      <View style={styles.coinRow}>
        <CoinBtn delta={-100} color="#f38ba8" onPress={changeMoedas} />
        <CoinBtn delta={-50}  color="#f38ba8" onPress={changeMoedas} />
        <CoinBtn delta={-10}  color="#f38ba8" onPress={changeMoedas} />
        <View style={styles.coinSep} />
        <CoinBtn delta={10}   color="#a6e3a1" onPress={changeMoedas} />
        <CoinBtn delta={50}   color="#a6e3a1" onPress={changeMoedas} />
        <CoinBtn delta={100}  color="#a6e3a1" onPress={changeMoedas} />
      </View>

      <View style={styles.divider} />

      {/* ── Cinto de Utilidades ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🔧 Cinto de Utilidades</Text>
        <Switch
          value={inv.cinto.ativo}
          onValueChange={() => dispatch({ type: 'INVENTORY_TOGGLE_CINTO' })}
          trackColor={{ false: '#313244', true: '#1d4d3a' }}
          thumbColor={inv.cinto.ativo ? '#a6e3a1' : '#6c7086'}
        />
      </View>

      {inv.cinto.ativo && (
        <View style={styles.grid}>
          {cintoSlots.map((item, i) => (
            <ItemSlot key={i} index={i} item={item} section="cinto" placeholder={`Slot ${i + 1}`} />
          ))}
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: '#11111b' },
  content: { padding: 14, paddingBottom: 48 },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: { color: '#cdd6f4', fontSize: 16, fontWeight: '700' },
  sectionRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  capacityText: { color: '#6c7086', fontSize: 12 },
  expandBtn: {
    backgroundColor: '#1d3052', borderRadius: 7, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: '#89b4fa',
  },
  expandBtnText: { color: '#89b4fa', fontSize: 11, fontWeight: '700' },

  divider: { height: 1, backgroundColor: '#2e2e4e', marginVertical: 18 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  slot: {
    width: '47.5%', backgroundColor: '#1e1e2e',
    borderRadius: 8, borderWidth: 1, borderColor: '#313244',
    padding: 8,
  },
  slotEmpty: { borderStyle: 'dashed', borderColor: '#2e2e4e' },
  slotInput: { color: '#cdd6f4', fontSize: 13, padding: 0, fontWeight: '600' },
  slotObs:   { color: '#6c7086', fontSize: 10, padding: 0, marginTop: 2 },
  equipBtn:        { marginTop: 5, backgroundColor: '#1d3052', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 3, alignSelf: 'flex-start' },
  equipBtnText:    { color: '#89b4fa', fontSize: 10, fontWeight: '700' },
  equipRow:        { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  equipHandBtn:    { backgroundColor: '#1d3a2f', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  equipHandBtnText:{ color: '#a6e3a1', fontSize: 10, fontWeight: '700' },
  equipCancelText: { color: '#45475a', fontSize: 13, paddingHorizontal: 4 },

  moedasTotal: {
    color: '#f9e2af', fontSize: 26, fontWeight: 'bold', letterSpacing: 1,
  },

  coinRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  coinSep: { flex: 1 },
  coinBtn: {
    borderRadius: 8, borderWidth: 1.5,
    paddingHorizontal: 11, paddingVertical: 8,
    backgroundColor: '#1e1e2e',
  },
  coinBtnText: { fontSize: 13, fontWeight: '700' },
});
