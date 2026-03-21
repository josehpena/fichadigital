import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useCharacter } from '../context/CharacterContext';
import {
  CATEGORIAS_RAW, TITLE_BY_ID, TITLE_PREREQS, TITLE_UNLOCKS,
} from '../data/titlesData';

// Colors per category/subcategory
const CAT_COLOR = {
  'MILITAR/MÁGICA':  '#cba6f7',
  'MILITAR/FÍSICA':  '#f38ba8',
  'OFICIAL':         '#fab387',
  'NOBRE':           '#f9e2af',
};
function getColor(cat, sub) {
  return sub ? CAT_COLOR[`${cat}/${sub}`] : CAT_COLOR[cat] ?? '#89b4fa';
}

const TIER_LABEL = { 1: 'Nível 1', 2: 'Nível 2', 3: 'Nível 3', 4: 'Nível 4' };

// ── Title Card ────────────────────────────────────────────────────────────────
function TitleCard({ title, color }) {
  const { character, dispatch } = useCharacter();
  const [expanded, setExpanded] = useState(false);

  const acquired = character.titles?.acquired?.includes(title.id) ?? false;

  // Check if title-based prerequisites are met
  const prereqIds = TITLE_PREREQS[title.id] ?? [];
  const prereqsMet = prereqIds.every(id => character.titles?.acquired?.includes(id));
  const canAcquire = !acquired && prereqsMet;

  // What this title unlocks (next in chain)
  const unlocksIds = TITLE_UNLOCKS[title.id] ?? [];
  const unlocksNames = unlocksIds.map(id => TITLE_BY_ID[id]?.nome).filter(Boolean);

  // What titles are prerequisites (previous in chain)
  const prereqNames = prereqIds.map(id => TITLE_BY_ID[id]?.nome).filter(Boolean);

  return (
    <View style={[styles.card, acquired && { borderLeftColor: color }]}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => setExpanded(v => !v)}
        activeOpacity={0.7}
      >
        <View style={[styles.cardDot, { backgroundColor: acquired ? color : '#45475a' }]} />
        <Text style={[styles.cardName, acquired && { color }]}>{title.nome}</Text>
        {acquired && <Text style={[styles.acquiredBadge, { color }]}>✓</Text>}
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.cardBody}>
          {/* Benefícios */}
          {title.beneficios.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Benefícios</Text>
              {title.beneficios.map((b, i) => (
                <Text key={i} style={styles.bullet}>• {b}</Text>
              ))}
            </View>
          )}

          {/* Requisitos */}
          {title.requisitos.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Requisitos</Text>
              {title.requisitos.map((r, i) => (
                <Text key={i} style={styles.bullet}>• {r}</Text>
              ))}
            </View>
          )}

          {/* Chain: desbloqueado por / desbloqueia */}
          {(prereqNames.length > 0 || unlocksNames.length > 0) && (
            <View style={styles.chainRow}>
              {prereqNames.length > 0 && (
                <View style={styles.chainItem}>
                  <Text style={styles.chainLabel}>↑ Requer título</Text>
                  {prereqNames.map((n, i) => (
                    <Text key={i} style={[styles.chainName, { color }]}>{n}</Text>
                  ))}
                </View>
              )}
              {unlocksNames.length > 0 && (
                <View style={styles.chainItem}>
                  <Text style={styles.chainLabel}>↓ Desbloqueia</Text>
                  {unlocksNames.map((n, i) => (
                    <Text key={i} style={[styles.chainName, { color }]}>{n}</Text>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Acquire button */}
          {!acquired && (
            <TouchableOpacity
              style={[styles.acquireBtn, !canAcquire && styles.acquireBtnOff]}
              disabled={!canAcquire}
              onPress={() => dispatch({ type: 'ACQUIRE_TITLE', titleId: title.id })}
            >
              <Text style={[styles.acquireBtnText, !canAcquire && styles.acquireBtnTextOff]}>
                {canAcquire ? 'Adquirir Título' : prereqIds.length > 0 ? 'Requer título anterior' : 'Adquirir Título'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

// ── Tier Group ────────────────────────────────────────────────────────────────
function TierGroup({ tier, titles, color }) {
  return (
    <View style={styles.tierGroup}>
      <View style={styles.tierHeader}>
        <View style={[styles.tierLine, { backgroundColor: color + '44' }]} />
        <Text style={[styles.tierLabel, { color }]}>{TIER_LABEL[tier] ?? `Nível ${tier}`}</Text>
        <View style={[styles.tierLine, { backgroundColor: color + '44' }]} />
      </View>
      {titles.map(t => <TitleCard key={t.id} title={t} color={color} />)}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function TitlesScreen() {
  const { character } = useCharacter();
  const [activeCat, setActiveCat]  = useState(0); // index into CATEGORIAS_RAW
  const [activeSub, setActiveSub]  = useState(0); // index into subcategorias

  const cat = CATEGORIAS_RAW[activeCat];
  const hasSubs = !!cat.subcategorias;
  const sub = hasSubs ? cat.subcategorias[activeSub] : null;
  const titulos = sub ? sub.titulos : cat.titulos;
  const color = getColor(cat.categoria, sub?.subcategoria);

  // Group by ordem
  const tiers = {};
  titulos.forEach(t => {
    if (!tiers[t.ordem]) tiers[t.ordem] = [];
    tiers[t.ordem].push(t);
  });

  const totalAcquired = (character.titles?.acquired ?? []).length;

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>Títulos</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>Adquiridos</Text>
          <Text style={styles.badgeValue}>{totalAcquired}</Text>
        </View>
      </View>

      {/* Category tabs */}
      <View style={styles.tabRow}>
        {CATEGORIAS_RAW.map((c, i) => {
          const col = getColor(c.categoria);
          return (
            <TouchableOpacity
              key={c.categoria}
              style={[styles.tab, activeCat === i && { borderBottomColor: col, borderBottomWidth: 2 }]}
              onPress={() => { setActiveCat(i); setActiveSub(0); }}
            >
              <Text style={[styles.tabLabel, activeCat === i && { color: col }]}>{c.categoria}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Subcategory tabs (MILITAR only) */}
      {hasSubs && (
        <View style={styles.subTabRow}>
          {cat.subcategorias.map((s, i) => {
            const col = getColor(cat.categoria, s.subcategoria);
            return (
              <TouchableOpacity
                key={s.subcategoria}
                style={[styles.subTab, activeSub === i && { backgroundColor: col + '22', borderColor: col }]}
                onPress={() => setActiveSub(i)}
              >
                <Text style={[styles.subTabLabel, activeSub === i && { color: col }]}>{s.subcategoria}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Aviso NOBRE */}
      {cat.aviso && (
        <View style={styles.avisoBox}>
          <Text style={styles.avisoText}>{cat.aviso}</Text>
        </View>
      )}

      {/* Titles list */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {Object.keys(tiers).sort((a, b) => +a - +b).map(tier => (
          <TierGroup key={tier} tier={+tier} titles={tiers[tier]} color={color} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#11111b' },

  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
  },
  pageTitle: { color: '#cdd6f4', fontSize: 22, fontWeight: 'bold' },
  badge: {
    backgroundColor: '#1e1e2e', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4, alignItems: 'center',
  },
  badgeLabel: { color: '#6c7086', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  badgeValue: { color: '#89b4fa', fontSize: 14, fontWeight: 'bold' },

  tabRow: {
    flexDirection: 'row', backgroundColor: '#1e1e2e',
    borderBottomWidth: 1, borderBottomColor: '#2e2e4e',
  },
  tab: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabLabel: { color: '#6c7086', fontSize: 12, fontWeight: '700' },

  subTabRow: { flexDirection: 'row', gap: 8, padding: 10, backgroundColor: '#181825' },
  subTab: {
    flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 8,
    borderWidth: 1, borderColor: '#2e2e4e',
  },
  subTabLabel: { color: '#6c7086', fontSize: 12, fontWeight: '600' },

  avisoBox: {
    margin: 12, backgroundColor: '#2d2d1e', borderRadius: 8, padding: 10,
    borderLeftWidth: 3, borderLeftColor: '#f9e2af',
  },
  avisoText: { color: '#f9e2af', fontSize: 11, lineHeight: 16 },

  list: { flex: 1 },
  listContent: { padding: 12, paddingBottom: 40 },

  tierGroup: { marginBottom: 12 },
  tierHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  tierLine: { flex: 1, height: 1 },
  tierLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

  card: {
    backgroundColor: '#1e1e2e', borderRadius: 12, marginBottom: 6,
    borderWidth: 1, borderColor: '#2e2e4e', borderLeftWidth: 3, borderLeftColor: '#2e2e4e',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, gap: 8,
  },
  cardDot: { width: 9, height: 9, borderRadius: 5 },
  cardName: { flex: 1, color: '#cdd6f4', fontSize: 13, fontWeight: '700' },
  acquiredBadge: { fontSize: 14, fontWeight: 'bold' },
  chevron: { color: '#6c7086', fontSize: 11 },

  cardBody: { paddingHorizontal: 14, paddingBottom: 12, gap: 8 },

  section: { gap: 3 },
  sectionLabel: { color: '#6c7086', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
  bullet: { color: '#cdd6f4', fontSize: 12, lineHeight: 18 },

  chainRow: { flexDirection: 'row', gap: 12, marginTop: 2 },
  chainItem: { flex: 1, gap: 2 },
  chainLabel: { color: '#45475a', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  chainName: { fontSize: 11, fontWeight: '700' },

  acquireBtn: {
    marginTop: 6, backgroundColor: '#1d3052', borderRadius: 8,
    paddingVertical: 9, alignItems: 'center',
    borderWidth: 1, borderColor: '#89b4fa',
  },
  acquireBtnOff: { backgroundColor: '#1e1e2e', borderColor: '#2e2e4e' },
  acquireBtnText: { color: '#89b4fa', fontSize: 13, fontWeight: '700' },
  acquireBtnTextOff: { color: '#3d3d5c' },
});
