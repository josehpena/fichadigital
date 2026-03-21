import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, StyleSheet,
  TouchableOpacity, Alert,
} from 'react-native';
import { useCharacter } from '../context/CharacterContext';
import StatusCard from '../components/StatusCard';
import { computeDefenseTotals } from '../data/initialCharacter';
import { TITLE_BY_ID } from '../data/titlesData';


export default function HomeScreen() {
  const { character, dispatch } = useCharacter();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput]     = useState(character.name);

  const saveName = () => {
    dispatch({ type: 'SET_NAME', value: nameInput.trim() || 'Personagem' });
    setEditingName(false);
  };

  const confirmReset = () =>
    Alert.alert(
      'Resetar Ficha',
      'Todos os dados serão apagados. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Resetar', style: 'destructive', onPress: () => dispatch({ type: 'RESET' }) },
      ]
    );

  const { totalArmadura, totalResMagica, totalReputacao } = computeDefenseTotals(
    character.equipment,
    character.accessories
  );
  const reputacaoBase =
    character.attributes.reputacao.manha +
    character.attributes.reputacao.carisma +
    character.attributes.reputacao.etiqueta;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Nome */}
      <View style={styles.nameRow}>
        {editingName ? (
          <TextInput
            style={styles.nameInput}
            value={nameInput}
            onChangeText={setNameInput}
            onSubmitEditing={saveName}
            onBlur={saveName}
            autoFocus
            placeholder="Nome do personagem"
            placeholderTextColor="#6c7086"
          />
        ) : (
          <TouchableOpacity onPress={() => { setNameInput(character.name); setEditingName(true); }}>
            <Text style={styles.nameText}>{character.name}</Text>
            <Text style={styles.nameTap}>Toque para editar</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={confirmReset} style={styles.resetBtn}>
          <Text style={styles.resetText}>Resetar</Text>
        </TouchableOpacity>
      </View>

      {/* Defesa (totais do equipamento) */}
      <View style={styles.defenseRow}>
        <View style={styles.defenseBadge}>
          <Text style={styles.defenseIcon}>🛡️</Text>
          <Text style={styles.defenseLabel}>Armadura</Text>
          <Text style={styles.defenseValue}>{totalArmadura}</Text>
        </View>
        <View style={styles.defenseBadge}>
          <Text style={styles.defenseIcon}>✨</Text>
          <Text style={styles.defenseLabel}>Res. Mágica</Text>
          <Text style={styles.defenseValue}>{totalResMagica}</Text>
        </View>
        <View style={styles.defenseBadge}>
          <Text style={styles.defenseIcon}>🎭</Text>
          <Text style={styles.defenseLabel}>Reputação</Text>
          <Text style={styles.defenseValue}>{reputacaoBase + totalReputacao}</Text>
          {totalReputacao > 0 && (
            <Text style={styles.defenseBonus}>+{totalReputacao} equip.</Text>
          )}
        </View>
      </View>

      {/* Características */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Características</Text>

        {/* Benefícios dos títulos adquiridos */}
        {(character.titles?.acquired ?? []).map(titleId => {
          const title = TITLE_BY_ID[titleId];
          if (!title?.beneficios?.length) return null;
          return (
            <View key={titleId} style={styles.titleBlock}>
              <Text style={styles.titleBlockName}>{title.nome}</Text>
              {title.beneficios.map((b, i) => (
                <Text key={i} style={styles.beneficioText}>• {b}</Text>
              ))}
            </View>
          );
        })}

        {/* Campo livre (racial, dons, etc.) */}
        <TextInput
          style={styles.racialInput}
          multiline
          value={character.racialTraits}
          onChangeText={(v) => dispatch({ type: 'SET_RACIAL_TRAITS', value: v })}
          placeholder="Características adicionais (raça, dons...)..."
          placeholderTextColor="#6c7086"
        />
      </View>

      {/* Status – ordem customizável */}
      <Text style={styles.sectionTitle}>Status</Text>
      {character.settings.statusOrder.map((key) => (
        <StatusCard key={key} statusKey={key} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: '#11111b' },
  content: { padding: 16, paddingBottom: 40 },

  nameRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  nameText:  { color: '#cdd6f4', fontSize: 22, fontWeight: 'bold' },
  nameTap:   { color: '#6c7086', fontSize: 11, marginTop: 2 },
  nameInput: {
    color: '#cdd6f4', fontSize: 22, fontWeight: 'bold',
    borderBottomWidth: 1, borderBottomColor: '#89b4fa',
    minWidth: 180, paddingVertical: 2,
  },
  resetBtn:  { backgroundColor: '#45273a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  resetText: { color: '#f38ba8', fontSize: 13, fontWeight: '600' },

  defenseRow: {
    flexDirection: 'row', gap: 10, marginBottom: 12,
  },
  defenseBadge: {
    flex: 1,
    backgroundColor: '#1e1e2e',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2e2e4e',
  },
  defenseIcon:  { fontSize: 16, marginBottom: 2 },
  defenseLabel: { color: '#6c7086', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  defenseValue: { color: '#cdd6f4', fontSize: 22, fontWeight: 'bold' },
  defenseBonus: { color: '#a6e3a1', fontSize: 10, marginTop: 1 },

  sectionBox: {
    backgroundColor: '#1e1e2e', borderRadius: 12, padding: 12,
    marginBottom: 16, borderWidth: 1, borderColor: '#2e2e4e',
  },
  sectionTitle: {
    color: '#89b4fa', fontSize: 13, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
  },
  titleBlock:     { marginBottom: 8 },
  titleBlockName: { color: '#f9e2af', fontSize: 12, fontWeight: '700', marginBottom: 3 },
  beneficioText:  { color: '#cdd6f4', fontSize: 13, lineHeight: 19, paddingLeft: 4 },
  racialInput:    { color: '#a6adc8', fontSize: 13, minHeight: 40, textAlignVertical: 'top', marginTop: 6 },
});
