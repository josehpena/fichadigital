import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useCharacter } from '../context/CharacterContext';
import { STATUS_COLORS, STATUS_LABELS } from '../data/initialCharacter';

const QUICK_DELTAS = [-5, -1, +1, +5];

export default function StatusCard({ statusKey }) {
  const { character, dispatch } = useCharacter();
  const s = character.status[statusKey];
  const color = STATUS_COLORS[statusKey];
  const label = STATUS_LABELS[statusKey];
  const pct = s.max > 0 ? Math.min(s.current / s.max, 1) : 0;

  const change = (delta) =>
    dispatch({ type: 'CHANGE_STATUS', statusKey, field: 'current', delta });

  const changeMax = (delta) =>
    dispatch({ type: 'CHANGE_STATUS', statusKey, field: 'max', delta });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={styles.label}>{label}</Text>
        <View style={styles.maxRow}>
          <TouchableOpacity onPress={() => changeMax(-1)} style={styles.maxBtn}>
            <Text style={styles.maxBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.maxText}>/ {s.max}</Text>
          <TouchableOpacity onPress={() => changeMax(+1)} style={styles.maxBtn}>
            <Text style={styles.maxBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>

      {/* Current value big */}
      <Text style={[styles.currentValue, { color }]}>{s.current}</Text>

      {/* Quick delta buttons */}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  label: {
    color: '#cdd6f4',
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
  },
  maxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  maxBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#313244',
    alignItems: 'center',
    justifyContent: 'center',
  },
  maxBtnText: {
    color: '#cdd6f4',
    fontSize: 14,
    lineHeight: 18,
  },
  maxText: {
    color: '#6c7086',
    fontSize: 13,
    marginHorizontal: 4,
  },
  barBg: {
    height: 6,
    backgroundColor: '#313244',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  currentValue: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  btn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnNeg: {
    backgroundColor: '#45273a',
  },
  btnPos: {
    backgroundColor: '#1e3a2f',
  },
  btnText: {
    color: '#cdd6f4',
    fontWeight: '600',
    fontSize: 13,
  },
});
