import React from 'react';
import {
  Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCharacter } from '../context/CharacterContext';
import {
  ATTRIBUTE_LABELS, SKILL_CATEGORIES, SKILL_LABELS,
  ARMOR_SLOTS, HAND_SLOTS,
} from '../data/initialCharacter';

const ATTR_GROUPS = [
  { group: 'robustez',     subAttrs: ['forca', 'destreza', 'vigor'],              color: '#f38ba8' },
  { group: 'reputacao',    subAttrs: ['manha', 'carisma', 'etiqueta'],            color: '#fab387' },
  { group: 'concentracao', subAttrs: ['percepcao', 'raciocinio', 'inteligencia'], color: '#89dceb' },
];

const SKILL_CAT_COLORS = { Físicos: '#f38ba8', Sociais: '#fab387', Mentais: '#89dceb' };

// Soma das tiras de atributo e de perícia em equipamentos (com durabilidade) e acessórios
function computeTiraBonuses(character) {
  const attr = {};
  const skill = {};
  const add = (t) => {
    if (!t?.valor) return;
    if (t.tipo === 'atributo' && t.subAttr)    attr[t.subAttr] = (attr[t.subAttr] || 0) + t.valor;
    else if (t.tipo === 'pericia' && t.skill)  skill[t.skill]  = (skill[t.skill]  || 0) + t.valor;
  };
  for (const slotKey of [...ARMOR_SLOTS, ...HAND_SLOTS]) {
    const slot = character.equipment?.[slotKey];
    if (!slot || slot.durabilidade === 0) continue;
    for (const t of (slot.tiras ?? [])) add(t);
  }
  for (const acc of (character.accessories ?? [])) {
    for (const t of (acc.tiras ?? [])) add(t);
  }
  return { attr, skill };
}

// Célula: nome + valor efetivo (natural + tiras)
function StatCell({ label, natural, bonus }) {
  const total = natural + bonus;
  return (
    <View style={s.cell}>
      <Text style={s.cellLabel} numberOfLines={1}>{label}</Text>
      <View style={s.cellRight}>
        <Text style={s.cellValue}>{total}</Text>
        {bonus > 0 && <Text style={s.cellBonus}>{natural}+{bonus}</Text>}
      </View>
    </View>
  );
}

export default function OverviewModal({ visible, onClose }) {
  const insets = useSafeAreaInsets();
  const { character } = useCharacter();
  if (!visible) return null;

  const tiras = computeTiraBonuses(character);

  // Totais por grupo (natural + tiras)
  const groupData = ATTR_GROUPS.map(({ group, subAttrs, color }) => {
    let natural = 0, bonus = 0;
    for (const sa of subAttrs) {
      natural += character.attributes?.[group]?.[sa] ?? 0;
      bonus   += tiras.attr[sa] ?? 0;
    }
    return { group, subAttrs, color, natural, bonus };
  });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={[s.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>📊 Resumo</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={s.close}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.content}>
          {/* Totais dos três grupos */}
          <View style={s.totalsRow}>
            {groupData.map(({ group, color, natural, bonus }) => (
              <View key={group} style={s.totalBadge}>
                <Text style={[s.totalLabel, { color }]}>{ATTRIBUTE_LABELS[group]}</Text>
                <Text style={s.totalValue}>{natural + bonus}</Text>
                {bonus > 0 && <Text style={s.totalBonus}>{natural}+{bonus}</Text>}
              </View>
            ))}
          </View>

          {/* Atributos */}
          <Text style={s.sectionTitle}>Atributos</Text>
          {groupData.map(({ group, subAttrs, color }) => (
            <View key={group} style={s.groupBox}>
              <Text style={[s.groupTitle, { color }]}>{ATTRIBUTE_LABELS[group]}</Text>
              <View style={s.grid}>
                {subAttrs.map(sa => (
                  <StatCell
                    key={sa}
                    label={ATTRIBUTE_LABELS[sa]}
                    natural={character.attributes?.[group]?.[sa] ?? 0}
                    bonus={tiras.attr[sa] ?? 0}
                  />
                ))}
              </View>
            </View>
          ))}

          {/* Perícias */}
          <Text style={s.sectionTitle}>Perícias</Text>
          {Object.entries(SKILL_CATEGORIES).map(([cat, skills]) => (
            <View key={cat} style={s.groupBox}>
              <Text style={[s.groupTitle, { color: SKILL_CAT_COLORS[cat] ?? '#89b4fa' }]}>{cat}</Text>
              <View style={s.grid}>
                {skills.map(skill => (
                  <StatCell
                    key={skill}
                    label={SKILL_LABELS[skill]}
                    natural={character.skills?.[skill] ?? 0}
                    bonus={tiras.skill[skill] ?? 0}
                  />
                ))}
              </View>
            </View>
          ))}

          <Text style={s.footnote}>Valores já incluem as tiras (natural+tira)</Text>
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
  close: { color: '#6c7086', fontSize: 18, fontWeight: '600' },

  content: { padding: 12, paddingBottom: 40 },

  // Três totais no topo
  totalsRow: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  totalBadge: {
    flex: 1, backgroundColor: '#1e1e2e', borderRadius: 10, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: '#2e2e4e',
  },
  totalLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
  totalValue: { color: '#cdd6f4', fontSize: 26, fontWeight: 'bold', marginTop: 2 },
  totalBonus: { color: '#a6e3a1', fontSize: 10, marginTop: 1 },

  sectionTitle: {
    color: '#89b4fa', fontSize: 12, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1, marginTop: 16, marginBottom: 8,
  },

  groupBox: {
    backgroundColor: '#1e1e2e', borderRadius: 10, padding: 10,
    marginBottom: 8, borderWidth: 1, borderColor: '#2e2e4e',
  },
  groupTitle: { fontSize: 13, fontWeight: '700', marginBottom: 8 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: {
    width: '48.5%', backgroundColor: '#181825', borderRadius: 8,
    borderWidth: 1, borderColor: '#313244',
    paddingHorizontal: 10, paddingVertical: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  cellLabel: { color: '#cdd6f4', fontSize: 12, fontWeight: '600', flex: 1, marginRight: 6 },
  cellRight: { alignItems: 'flex-end' },
  cellValue: { color: '#cdd6f4', fontSize: 18, fontWeight: 'bold', lineHeight: 20 },
  cellBonus: { color: '#a6e3a1', fontSize: 9, fontWeight: '600' },

  footnote: { color: '#45475a', fontSize: 11, fontStyle: 'italic', marginTop: 10, textAlign: 'center' },
});
