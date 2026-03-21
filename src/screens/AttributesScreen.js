import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useCharacter } from '../context/CharacterContext';
import { ATTRIBUTE_LABELS } from '../data/initialCharacter';

const GROUPS = [
  { group: 'robustez',    subAttrs: ['forca', 'destreza', 'vigor'],              color: '#f38ba8' },
  { group: 'reputacao',   subAttrs: ['manha', 'carisma', 'etiqueta'],            color: '#fab387' },
  { group: 'concentracao',subAttrs: ['percepcao', 'raciocinio', 'inteligencia'], color: '#89dceb' },
];

function SubAttrRow({ group, subAttr, xpCost }) {
  const { character, dispatch } = useCharacter();
  const value = character.attributes[group][subAttr];
  const nextLevelCost = (value + 1) * xpCost;

  return (
    <View style={styles.subRow}>
      <Text style={styles.subLabel}>{ATTRIBUTE_LABELS[subAttr]}</Text>
      <View style={styles.dotsRow}>
        {Array.from({ length: 10 }).map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() =>
              dispatch({
                type: 'CHANGE_ATTRIBUTE',
                group,
                subAttr,
                delta: (i + 1) - value,
              })
            }
          >
            <View style={[styles.dot, i < value ? styles.dotFilled : styles.dotEmpty]} />
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.subRight}>
        <Text style={styles.subValue}>{value}</Text>
        {value < 10 && (
          <Text style={styles.xpHint}>{nextLevelCost} XP</Text>
        )}
      </View>
    </View>
  );
}

function AttributeGroup({ group, subAttrs, color }) {
  const { character } = useCharacter();
  const total = subAttrs.reduce((sum, s) => sum + (character.attributes[group][s] || 0), 0);
  const xpCost = character.settings.xpCosts[group] ?? 10;

  return (
    <View style={[styles.groupCard, { borderLeftColor: color }]}>
      <View style={styles.groupHeader}>
        <Text style={[styles.groupName, { color }]}>{ATTRIBUTE_LABELS[group]}</Text>
        <View style={styles.groupRight}>
          <Text style={styles.xpCostTag}>{xpCost} XP/nível</Text>
          <View style={[styles.totalBadge, { backgroundColor: color + '33' }]}>
            <Text style={[styles.totalText, { color }]}>{total}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.totalHint}>Soma dos sub-atributos · custo lvl N = N × {xpCost}</Text>
      {subAttrs.map((s) => (
        <SubAttrRow key={s} group={group} subAttr={s} xpCost={xpCost} />
      ))}
    </View>
  );
}

export default function AttributesScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Atributos</Text>
      <Text style={styles.hint}>Toque nos pontos para definir o valor (1–10)</Text>
      {GROUPS.map((g) => (
        <AttributeGroup key={g.group} {...g} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: '#11111b' },
  content: { padding: 16, paddingBottom: 40 },
  pageTitle: { color: '#cdd6f4', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  hint:      { color: '#6c7086', fontSize: 12, marginBottom: 16 },

  groupCard: {
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#2e2e4e',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  groupName:  { fontSize: 17, fontWeight: 'bold' },
  groupRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  xpCostTag:  { color: '#6c7086', fontSize: 11, fontStyle: 'italic' },
  totalBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  totalText:  { fontSize: 18, fontWeight: 'bold' },
  totalHint:  { color: '#6c7086', fontSize: 11, marginBottom: 12 },

  subRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  subLabel: { color: '#cdd6f4', fontSize: 13, width: 95 },
  dotsRow:  { flexDirection: 'row', flex: 1, gap: 5, alignItems: 'center' },
  dot:      { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5 },
  dotFilled:{ backgroundColor: '#89b4fa', borderColor: '#89b4fa' },
  dotEmpty: { backgroundColor: 'transparent', borderColor: '#45475a' },

  subRight:  { alignItems: 'flex-end', minWidth: 42 },
  subValue:  { color: '#6c7086', fontSize: 12 },
  xpHint:    { color: '#45475a', fontSize: 10 },
});
