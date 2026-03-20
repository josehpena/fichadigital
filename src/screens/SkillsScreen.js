import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useCharacter } from '../context/CharacterContext';
import { SKILL_CATEGORIES, SKILL_LABELS } from '../data/initialCharacter';

const CATEGORY_COLORS = {
  Físicos:  '#f38ba8',
  Sociais:  '#fab387',
  Mentais:  '#89dceb',
};

const MAX_SKILL = 5;

function SkillRow({ skill }) {
  const { character, dispatch } = useCharacter();
  const value = character.skills[skill] ?? 0;

  return (
    <View style={styles.skillRow}>
      <Text style={styles.skillLabel}>{SKILL_LABELS[skill]}</Text>
      <View style={styles.dotsRow}>
        {Array.from({ length: MAX_SKILL }).map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() =>
              dispatch({
                type: 'CHANGE_SKILL',
                skill,
                delta: (i + 1) === value ? -1 : (i + 1) - value,
              })
            }
          >
            <View style={[styles.dot, i < value ? styles.dotFilled : styles.dotEmpty]} />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.skillValue}>{value}</Text>
    </View>
  );
}

function CategorySection({ category, skills, color }) {
  const [expanded, setExpanded] = useState(true);
  const { character } = useCharacter();
  const total = skills.reduce((sum, s) => sum + (character.skills[s] ?? 0), 0);

  return (
    <View style={[styles.categoryCard, { borderLeftColor: color }]}>
      <TouchableOpacity
        style={styles.categoryHeader}
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.7}
      >
        <View style={[styles.dot16, { backgroundColor: color }]} />
        <Text style={[styles.categoryName, { color }]}>{category}</Text>
        <Text style={styles.totalPoints}>{total} pts</Text>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.skillList}>
          {skills.map((s) => (
            <SkillRow key={s} skill={s} />
          ))}
        </View>
      )}
    </View>
  );
}

export default function SkillsScreen() {
  const { character } = useCharacter();
  const allSkills = Object.values(character.skills);
  const totalSpent = allSkills.reduce((sum, v) => sum + v, 0);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>Perícias</Text>
        <View style={styles.totalBadge}>
          <Text style={styles.totalBadgeText}>{totalSpent} pontos gastos</Text>
        </View>
      </View>
      <Text style={styles.hint}>
        Toque nos pontos para alocar (0–5). Toque no mesmo ponto para zerar.
      </Text>

      {Object.entries(SKILL_CATEGORIES).map(([cat, skills]) => (
        <CategorySection
          key={cat}
          category={cat}
          skills={skills}
          color={CATEGORY_COLORS[cat]}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#11111b' },
  content: { padding: 16, paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  pageTitle: {
    color: '#cdd6f4',
    fontSize: 22,
    fontWeight: 'bold',
  },
  totalBadge: {
    backgroundColor: '#1e1e2e',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  totalBadgeText: {
    color: '#89b4fa',
    fontSize: 13,
    fontWeight: '600',
  },
  hint: {
    color: '#6c7086',
    fontSize: 12,
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#2e2e4e',
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  dot16: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  totalPoints: {
    color: '#6c7086',
    fontSize: 13,
    marginRight: 4,
  },
  chevron: {
    color: '#6c7086',
    fontSize: 11,
  },
  skillList: {
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: '#2e2e4e',
  },
  skillLabel: {
    color: '#cdd6f4',
    fontSize: 13,
    flex: 1,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 7,
    marginRight: 8,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  dotFilled: {
    backgroundColor: '#89b4fa',
    borderColor: '#89b4fa',
  },
  dotEmpty: {
    backgroundColor: 'transparent',
    borderColor: '#45475a',
  },
  skillValue: {
    color: '#6c7086',
    fontSize: 12,
    width: 16,
    textAlign: 'right',
  },
});
