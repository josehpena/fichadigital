import React from 'react';
import {
  Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCharacter } from '../context/CharacterContext';
import {
  ATTRIBUTE_LABELS, SKILL_CATEGORIES, SKILL_LABELS,
  STATUS_LABELS, STATUS_COLORS, COMPUTED_STATUS_KEYS,
} from '../data/initialCharacter';

const ATTR_GROUPS = [
  { group: 'robustez',     subAttrs: ['forca', 'destreza', 'vigor'],              color: '#f38ba8' },
  { group: 'reputacao',    subAttrs: ['manha', 'carisma', 'etiqueta'],            color: '#fab387' },
  { group: 'concentracao', subAttrs: ['percepcao', 'raciocinio', 'inteligencia'], color: '#89dceb' },
];

const SKILL_CAT_COLORS = { Físicos: '#f38ba8', Sociais: '#fab387', Mentais: '#89dceb' };

const MAX_ATTR = 5;
const DEFAULT_MAX_SKILL = 5;

// Célula compacta: nome, valor e custo do próximo nível
function StatCell({ label, value, max, nextCost, currentXp, boosted }) {
  const atMax = value >= max;
  const afford = nextCost == null || nextCost <= currentXp;
  return (
    <View style={s.cell}>
      <Text style={s.cellLabel} numberOfLines={1}>
        {label}{boosted ? ' ★' : ''}
      </Text>
      <View style={s.cellRight}>
        <Text style={s.cellValue}>{value}</Text>
        {atMax ? (
          <Text style={s.cellMax}>MÁX</Text>
        ) : (
          <Text style={[s.cellCost, !afford && s.cellCostOff]}>{nextCost} XP</Text>
        )}
      </View>
    </View>
  );
}

export default function OverviewModal({ visible, onClose }) {
  const insets = useSafeAreaInsets();
  const { character } = useCharacter();
  if (!visible) return null;

  const currentXp = character.status?.xp?.current ?? 0;
  const xpCosts   = character.settings?.xpCosts ?? {};

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={[s.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>📊 Resumo</Text>
          <View style={s.headerRight}>
            <Text style={s.xpBadge}>{currentXp} XP</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={s.close}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={s.content}>
          {/* Status */}
          <View style={s.statusStrip}>
            {COMPUTED_STATUS_KEYS.map(key => {
              const st = character.status?.[key];
              if (!st) return null;
              return (
                <View key={key} style={s.statusPill}>
                  <Text style={[s.statusPillLabel, { color: STATUS_COLORS[key] }]}>{STATUS_LABELS[key]}</Text>
                  <Text style={s.statusPillVal}>{st.current}/{st.max}</Text>
                </View>
              );
            })}
          </View>

          {/* Atributos */}
          <Text style={s.sectionTitle}>Atributos</Text>
          {ATTR_GROUPS.map(({ group, subAttrs, color }) => {
            const xpCost = xpCosts[group] ?? 10;
            const total = subAttrs.reduce((sum, sa) => sum + (character.attributes?.[group]?.[sa] ?? 0), 0);
            return (
              <View key={group} style={s.groupBox}>
                <View style={s.groupHeader}>
                  <Text style={[s.groupTitle, { color }]}>{ATTRIBUTE_LABELS[group]}</Text>
                  <Text style={s.groupMeta}>total {total} · {xpCost} XP/nível</Text>
                </View>
                <View style={s.grid}>
                  {subAttrs.map(sa => {
                    const value = character.attributes?.[group]?.[sa] ?? 0;
                    const nextCost = value < MAX_ATTR ? (value + 1) * xpCost : null;
                    return (
                      <StatCell
                        key={sa}
                        label={ATTRIBUTE_LABELS[sa]}
                        value={value}
                        max={MAX_ATTR}
                        nextCost={nextCost}
                        currentXp={currentXp}
                      />
                    );
                  })}
                </View>
              </View>
            );
          })}

          {/* Perícias */}
          <Text style={s.sectionTitle}>Perícias</Text>
          {Object.entries(SKILL_CATEGORIES).map(([cat, skills]) => {
            const xpCost = xpCosts[cat] ?? 5;
            return (
              <View key={cat} style={s.groupBox}>
                <View style={s.groupHeader}>
                  <Text style={[s.groupTitle, { color: SKILL_CAT_COLORS[cat] ?? '#89b4fa' }]}>{cat}</Text>
                  <Text style={s.groupMeta}>{xpCost} XP/nível</Text>
                </View>
                <View style={s.grid}>
                  {skills.map(skill => {
                    const value    = character.skills?.[skill] ?? 0;
                    const boosted  = character.race?.skillBoostSkill === skill;
                    const maxSkill = boosted ? 8 : DEFAULT_MAX_SKILL;
                    const nextCost = value < maxSkill ? (value + 1) * xpCost : null;
                    return (
                      <StatCell
                        key={skill}
                        label={SKILL_LABELS[skill]}
                        value={value}
                        max={maxSkill}
                        nextCost={nextCost}
                        currentXp={currentXp}
                        boosted={boosted}
                      />
                    );
                  })}
                </View>
              </View>
            );
          })}

          <Text style={s.footnote}>★ perícia com teto estendido (nível 8) pela raça</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#11111b' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#2e2e4e', backgroundColor: '#1e1e2e',
  },
  title: { color: '#cdd6f4', fontSize: 17, fontWeight: '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  xpBadge: { color: '#94e2d5', fontSize: 14, fontWeight: '700' },
  close:   { color: '#6c7086', fontSize: 18, fontWeight: '600' },

  content: { padding: 12, paddingBottom: 40 },

  statusStrip: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  statusPill: {
    flexGrow: 1, minWidth: '23%', backgroundColor: '#1e1e2e', borderRadius: 8,
    borderWidth: 1, borderColor: '#2e2e4e', paddingVertical: 6, paddingHorizontal: 8, alignItems: 'center',
  },
  statusPillLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  statusPillVal:   { color: '#cdd6f4', fontSize: 14, fontWeight: 'bold', marginTop: 1 },

  sectionTitle: {
    color: '#89b4fa', fontSize: 12, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1, marginTop: 14, marginBottom: 8,
  },

  groupBox: {
    backgroundColor: '#1e1e2e', borderRadius: 10, padding: 10,
    marginBottom: 8, borderWidth: 1, borderColor: '#2e2e4e',
  },
  groupHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  groupTitle:  { fontSize: 13, fontWeight: '700' },
  groupMeta:   { color: '#6c7086', fontSize: 11 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: {
    width: '48.5%', backgroundColor: '#181825', borderRadius: 8,
    borderWidth: 1, borderColor: '#313244',
    paddingHorizontal: 10, paddingVertical: 7,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  cellLabel: { color: '#cdd6f4', fontSize: 12, fontWeight: '600', flex: 1, marginRight: 6 },
  cellRight: { alignItems: 'flex-end' },
  cellValue: { color: '#cdd6f4', fontSize: 18, fontWeight: 'bold', lineHeight: 20 },
  cellMax:   { color: '#a6e3a1', fontSize: 9, fontWeight: '700' },
  cellCost:  { color: '#6c7086', fontSize: 10 },
  cellCostOff: { color: '#f38ba8' },

  footnote: { color: '#45475a', fontSize: 11, fontStyle: 'italic', marginTop: 10, textAlign: 'center' },
});
