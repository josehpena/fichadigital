import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useCharacter } from '../context/CharacterContext';
import {
  STATUS_COLORS, STATUS_LABELS, COMPUTED_STATUS_KEYS, NO_MAX_STATUS_KEYS,
  ATTRIBUTE_LABELS, ARMOR_SLOTS, HAND_SLOTS,
} from '../data/initialCharacter';
import { TITLE_BY_ID } from '../data/titlesData';

const QUICK_DELTAS    = [-5, -1, +1, +5];
const XP_QUICK_DELTAS = [-100, -10, +10, +25, +50, +100];
const COUNTER_TIMEOUT = 5000;

// Quais sub-atributos contribuem para cada status calculado
const STATUS_FORMULA = {
  vida:           [['robustez', 'forca'], ['robustez', 'destreza'], ['robustez', 'vigor']],
  energia:        [['robustez', 'vigor'], ['concentracao', 'percepcao']],
  mana:           [['concentracao', 'inteligencia'], ['reputacao', 'etiqueta']],
  forcaDeVontade: [['robustez', 'forca'], ['reputacao', 'carisma']],
};

const STATUS_BASE = { vida: 10 };

// Sub-atributos relevantes por status (para filtrar tiras)
const STATUS_ATTR_DEPS = {
  vida:           ['forca', 'destreza', 'vigor'],
  energia:        ['vigor', 'percepcao'],
  mana:           ['inteligencia', 'etiqueta'],
  forcaDeVontade: ['forca', 'carisma'],
};

function getStatusBreakdown(statusKey, character) {
  const parts = [];

  // ── Fórmula de atributos ─────────────────────────────────────────────────
  const formula = STATUS_FORMULA[statusKey];
  if (formula) {
    for (const [grupo, sub] of formula) {
      const val = character.attributes[grupo]?.[sub] ?? 0;
      parts.push({ label: ATTRIBUTE_LABELS[sub] ?? sub, val, source: 'atributo' });
    }
    const base = STATUS_BASE[statusKey];
    if (base) parts.push({ label: 'Base', val: base, source: 'base' });
  }

  // ── Bônus de títulos ─────────────────────────────────────────────────────
  for (const titleId of (character.titles?.acquired ?? [])) {
    const title = TITLE_BY_ID?.[titleId];
    if (!title) continue;
    for (const ef of (title.efeitos ?? [])) {
      if (ef.status === statusKey && ef.delta !== 0) {
        parts.push({ label: title.nome, val: ef.delta, source: 'titulo' });
      }
    }
  }

  // ── Tiras de couro (atributo) em itens equipados ──────────────────────────
  const deps = STATUS_ATTR_DEPS[statusKey] ?? [];
  if (deps.length > 0) {
    const allSlots = [...ARMOR_SLOTS, ...HAND_SLOTS];
    for (const slotKey of allSlots) {
      const slot = character.equipment?.[slotKey];
      if (!slot) continue;
      const tiras = slot.tiras ?? [];
      for (const t of tiras) {
        if (t.tipo === 'atributo' && deps.includes(t.subAttr) && t.valor) {
          const itemName = slot.nome || slotKey;
          parts.push({
            label: `${itemName} (${ATTRIBUTE_LABELS[t.subAttr] ?? t.subAttr})`,
            val: t.valor,
            source: 'tira',
          });
        }
      }
    }
  }

  return parts;
}

export default function StatusCard({ statusKey }) {
  const { character, dispatch } = useCharacter();
  const s     = character.status[statusKey];
  const color = STATUS_COLORS[statusKey];
  const label = STATUS_LABELS[statusKey];
  const pct   = s.max > 0 ? Math.min(s.current / s.max, 1) : 0;
  const isComputed = COMPUTED_STATUS_KEYS.includes(statusKey);
  const noMax      = NO_MAX_STATUS_KEYS.includes(statusKey);

  const [deltaAcc, setDeltaAcc] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const timerRef = useRef(null);

  const change = useCallback((delta) => {
    dispatch({ type: 'CHANGE_STATUS', statusKey, field: 'current', delta });
    setDeltaAcc((prev) => prev + delta);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDeltaAcc(0), COUNTER_TIMEOUT);
  }, [dispatch, statusKey]);

  const changeMax = (delta) => dispatch({ type: 'CHANGE_STATUS', statusKey, field: 'max', delta });

  const showCounter = deltaAcc !== 0;
  const counterColor = deltaAcc > 0 ? '#a6e3a1' : '#f38ba8';
  const counterText  = deltaAcc > 0 ? `+${deltaAcc}` : `${deltaAcc}`;

  const breakdown = getStatusBreakdown(statusKey, character);
  const hasBreakdown = breakdown.length > 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={styles.label}>{label}</Text>

        {!noMax && (
          <View style={styles.maxRow}>
            {isComputed ? (
              <TouchableOpacity
                onPress={() => setShowBreakdown(v => !v)}
                style={styles.computedMaxBtn}
              >
                <Text style={styles.computedMaxLabel}>
                  / {s.max} {showBreakdown ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity onPress={() => changeMax(-1)} style={styles.maxBtn}>
                  <Text style={styles.maxBtnText}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => hasBreakdown && setShowBreakdown(v => !v)}
                  disabled={!hasBreakdown}
                >
                  <Text style={styles.maxText}>
                    / {s.max}{hasBreakdown ? (showBreakdown ? ' ▲' : ' ▼') : ''}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => changeMax(+1)} style={styles.maxBtn}>
                  <Text style={styles.maxBtnText}>+</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {noMax && hasBreakdown && (
          <TouchableOpacity onPress={() => setShowBreakdown(v => !v)} style={styles.infoBtn}>
            <Text style={styles.infoBtnText}>{showBreakdown ? '▲' : 'ℹ'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Breakdown expandível */}
      {showBreakdown && hasBreakdown && (
        <View style={styles.breakdown}>
          {breakdown.map((p, i) => {
            const isLast = i === breakdown.length - 1;
            const sourceColor =
              p.source === 'titulo' ? '#f9e2af' :
              p.source === 'tira'   ? '#94e2d5' :
              p.source === 'base'   ? '#6c7086' :
              '#a6adc8';
            return (
              <View key={i} style={[styles.breakdownRow, isLast && styles.breakdownRowLast]}>
                <Text style={[styles.breakdownLabel, { color: sourceColor }]}>{p.label}</Text>
                <Text style={[styles.breakdownVal, { color: sourceColor }]}>
                  {p.val > 0 ? `+${p.val}` : p.val}
                </Text>
              </View>
            );
          })}
          <View style={styles.breakdownTotal}>
            <Text style={styles.breakdownTotalLabel}>Total máx</Text>
            <Text style={[styles.breakdownTotalVal, { color }]}>{s.max}</Text>
          </View>
        </View>
      )}

      {!noMax && (
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
        </View>
      )}

      <View style={styles.valueRow}>
        <Text style={[styles.currentValue, { color }]}>{s.current}</Text>
        {showCounter && (
          <Text style={[styles.deltaCounter, { color: counterColor }]}>{counterText}</Text>
        )}
      </View>

      <View style={styles.btnRow}>
        {(statusKey === 'xp' ? XP_QUICK_DELTAS : QUICK_DELTAS).map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.btn, d < 0 ? styles.btnNeg : styles.btnPos]}
            onPress={() => change(d)}
          >
            <Text style={styles.btnText}>{d > 0 ? `+${d}` : d}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2e2e4e',
  },
  header:   { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  dot:      { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  label:    { color: '#cdd6f4', fontWeight: '600', fontSize: 14, flex: 1 },
  maxRow:   { flexDirection: 'row', alignItems: 'center' },
  maxBtn:   {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#313244', alignItems: 'center', justifyContent: 'center',
  },
  maxBtnText:       { color: '#cdd6f4', fontSize: 14, lineHeight: 18 },
  maxText:          { color: '#6c7086', fontSize: 13, marginHorizontal: 4 },
  computedMaxBtn:   { paddingHorizontal: 4 },
  computedMaxLabel: { color: '#45475a', fontSize: 12, fontStyle: 'italic' },
  infoBtn:          { paddingHorizontal: 6, paddingVertical: 2 },
  infoBtnText:      { color: '#45475a', fontSize: 13 },

  // Breakdown
  breakdown: {
    backgroundColor: '#181825',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#313244',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#2e2e4e',
  },
  breakdownRowLast: { borderBottomWidth: 0 },
  breakdownLabel:   { fontSize: 12, flex: 1 },
  breakdownVal:     { fontSize: 12, fontWeight: '700' },
  breakdownTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#45475a',
  },
  breakdownTotalLabel: { color: '#6c7086', fontSize: 12, fontStyle: 'italic' },
  breakdownTotalVal:   { fontSize: 12, fontWeight: '800' },

  barBg: {
    height: 6, backgroundColor: '#313244', borderRadius: 3,
    overflow: 'hidden', marginBottom: 6,
  },
  barFill: { height: 6, borderRadius: 3 },

  valueRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'center', marginBottom: 8, gap: 8,
  },
  currentValue: { fontSize: 28, fontWeight: 'bold' },
  deltaCounter: {
    fontSize: 16, fontWeight: '700',
    marginBottom: 4,
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 8, backgroundColor: '#313244',
    overflow: 'hidden',
  },

  btnRow:  { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  btn:     { flex: 1, paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  btnNeg:  { backgroundColor: '#45273a' },
  btnPos:  { backgroundColor: '#1e3a2f' },
  btnText: { color: '#cdd6f4', fontWeight: '600', fontSize: 13 },
});
