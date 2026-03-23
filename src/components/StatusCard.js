import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useCharacter } from '../context/CharacterContext';
import { STATUS_COLORS, STATUS_LABELS, COMPUTED_STATUS_KEYS, NO_MAX_STATUS_KEYS } from '../data/initialCharacter';

const QUICK_DELTAS = [-5, -1, +1, +5];
const COUNTER_TIMEOUT = 5000;

export default function StatusCard({ statusKey }) {
  const { character, dispatch } = useCharacter();
  const s     = character.status[statusKey];
  const color = STATUS_COLORS[statusKey];
  const label = STATUS_LABELS[statusKey];
  const pct   = s.max > 0 ? Math.min(s.current / s.max, 1) : 0;
  const isComputed = COMPUTED_STATUS_KEYS.includes(statusKey);
  const noMax      = NO_MAX_STATUS_KEYS.includes(statusKey);

  const [deltaAcc, setDeltaAcc] = useState(0);
  const timerRef = useRef(null);

  const change = useCallback((delta) => {
    dispatch({ type: 'CHANGE_STATUS', statusKey, field: 'current', delta });

    setDeltaAcc((prev) => prev + delta);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDeltaAcc(0);
    }, COUNTER_TIMEOUT);
  }, [dispatch, statusKey]);

  const changeMax = (delta) => dispatch({ type: 'CHANGE_STATUS', statusKey, field: 'max', delta });

  const showCounter = deltaAcc !== 0;
  const counterColor = deltaAcc > 0 ? '#a6e3a1' : '#f38ba8';
  const counterText  = deltaAcc > 0 ? `+${deltaAcc}` : `${deltaAcc}`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={styles.label}>{label}</Text>

        {!noMax && (
          <View style={styles.maxRow}>
            {isComputed ? (
              <Text style={styles.computedMaxLabel}>/ {s.max} auto</Text>
            ) : (
              <>
                <TouchableOpacity onPress={() => changeMax(-1)} style={styles.maxBtn}>
                  <Text style={styles.maxBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.maxText}>/ {s.max}</Text>
                <TouchableOpacity onPress={() => changeMax(+1)} style={styles.maxBtn}>
                  <Text style={styles.maxBtnText}>+</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>

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
        {QUICK_DELTAS.map((d) => (
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
  computedMaxLabel: { color: '#45475a', fontSize: 12, fontStyle: 'italic' },
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
