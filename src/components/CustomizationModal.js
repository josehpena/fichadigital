import React from 'react';
import {
  Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useCharacter } from '../context/CharacterContext';
import { STATUS_LABELS, STATUS_COLORS } from '../data/initialCharacter';

const ATTR_GROUPS = [
  { key: 'robustez',    label: 'Robustez',     color: '#f38ba8' },
  { key: 'reputacao',   label: 'Reputação',    color: '#fab387' },
  { key: 'concentracao',label: 'Concentração', color: '#89dceb' },
];

const SKILL_CATS = [
  { key: 'Físicos', color: '#f38ba8' },
  { key: 'Sociais', color: '#fab387' },
  { key: 'Mentais', color: '#89dceb' },
];

export default function CustomizationModal({ visible, onClose }) {
  const { character, dispatch } = useCharacter();
  const { statusOrder, xpCosts } = character.settings;

  const moveStatus = (key, dir) => dispatch({ type: 'MOVE_STATUS', key, direction: dir });
  const changeXp   = (key, d)   => dispatch({ type: 'CHANGE_XP_COST', key, delta: d * 5 });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>

          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>✏️  Personalização</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

            {/* ── Ordem dos Status ─────────────────────────────────── */}
            <Text style={styles.sectionTitle}>Ordem dos Status</Text>
            <Text style={styles.sectionHint}>Arraste com ▲▼ para reordenar os cards na tela de status</Text>

            {statusOrder.map((key, idx) => (
              <View key={key} style={styles.orderRow}>
                <View style={[styles.orderDot, { backgroundColor: STATUS_COLORS[key] }]} />
                <Text style={styles.orderLabel}>{STATUS_LABELS[key]}</Text>
                <View style={styles.arrowGroup}>
                  <TouchableOpacity
                    style={[styles.arrowBtn, idx === 0 && styles.arrowDisabled]}
                    onPress={() => moveStatus(key, 'up')}
                    disabled={idx === 0}
                  >
                    <Text style={[styles.arrowText, idx === 0 && styles.arrowTextDim]}>▲</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.arrowBtn, idx === statusOrder.length - 1 && styles.arrowDisabled]}
                    onPress={() => moveStatus(key, 'down')}
                    disabled={idx === statusOrder.length - 1}
                  >
                    <Text style={[styles.arrowText, idx === statusOrder.length - 1 && styles.arrowTextDim]}>▼</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* ── Custo XP – Atributos ────────────────────────────── */}
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Custo XP por Atributo</Text>
            <Text style={styles.sectionHint}>Custo para subir ao nível N = N × custo/nível</Text>

            {ATTR_GROUPS.map(({ key, label, color }) => {
              const cost = xpCosts[key] ?? 10;
              return (
                <View key={key} style={styles.costRow}>
                  <View style={[styles.costDot, { backgroundColor: color }]} />
                  <Text style={styles.costLabel}>{label}</Text>
                  <View style={styles.costControls}>
                    <TouchableOpacity style={styles.costBtn} onPress={() => changeXp(key, -1)}>
                      <Text style={styles.costBtnText}>−5</Text>
                    </TouchableOpacity>
                    <Text style={styles.costValue}>{cost}</Text>
                    <TouchableOpacity style={styles.costBtn} onPress={() => changeXp(key, +1)}>
                      <Text style={styles.costBtnText}>+5</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.xpTag}>XP/nível</Text>
                </View>
              );
            })}

            {/* ── Custo XP – Perícias ─────────────────────────────── */}
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Custo XP por Perícia</Text>
            <Text style={styles.sectionHint}>Custo para subir ao nível N = N × custo/nível</Text>

            {SKILL_CATS.map(({ key, color }) => {
              const cost = xpCosts[key] ?? 5;
              return (
                <View key={key} style={styles.costRow}>
                  <View style={[styles.costDot, { backgroundColor: color }]} />
                  <Text style={styles.costLabel}>{key}</Text>
                  <View style={styles.costControls}>
                    <TouchableOpacity style={styles.costBtn} onPress={() => changeXp(key, -1)}>
                      <Text style={styles.costBtnText}>−5</Text>
                    </TouchableOpacity>
                    <Text style={styles.costValue}>{cost}</Text>
                    <TouchableOpacity style={styles.costBtn} onPress={() => changeXp(key, +1)}>
                      <Text style={styles.costBtnText}>+5</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.xpTag}>XP/nível</Text>
                </View>
              );
            })}

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#181825',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '88%',
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2e2e4e',
  },
  modalTitle: { color: '#cdd6f4', fontSize: 18, fontWeight: '700' },
  closeBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#313244', alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { color: '#cdd6f4', fontSize: 16, lineHeight: 20 },

  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },

  sectionTitle: {
    color: '#89b4fa', fontSize: 12, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4,
  },
  sectionHint: { color: '#45475a', fontSize: 11, marginBottom: 12 },

  // Ordem dos status
  orderRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1e1e2e', borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 14,
    marginBottom: 6, borderWidth: 1, borderColor: '#2e2e4e',
  },
  orderDot:   { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  orderLabel: { color: '#cdd6f4', fontSize: 14, flex: 1 },
  arrowGroup: { flexDirection: 'row', gap: 6 },
  arrowBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: '#313244', alignItems: 'center', justifyContent: 'center',
  },
  arrowDisabled: { opacity: 0.3 },
  arrowText:    { color: '#89b4fa', fontSize: 13 },
  arrowTextDim: { color: '#45475a' },

  // Custos XP
  costRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1e1e2e', borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 14,
    marginBottom: 6, borderWidth: 1, borderColor: '#2e2e4e',
  },
  costDot:  { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  costLabel:{ color: '#cdd6f4', fontSize: 14, flex: 1 },
  costControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  costBtn: {
    paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: '#313244', borderRadius: 7,
  },
  costBtnText: { color: '#cdd6f4', fontSize: 13, fontWeight: '600' },
  costValue:   { color: '#f5c2e7', fontSize: 16, fontWeight: '700', minWidth: 30, textAlign: 'center' },
  xpTag:       { color: '#45475a', fontSize: 11, marginLeft: 6, width: 48 },
});
