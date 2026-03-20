import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, StyleSheet,
  TouchableOpacity, Modal, Alert,
} from 'react-native';
import { useCharacter } from '../context/CharacterContext';
import StatusCard from '../components/StatusCard';

const STATUS_KEYS = ['vida', 'energia', 'mana', 'forcaDeVontade', 'humanidade', 'xp'];

export default function HomeScreen() {
  const { character, dispatch } = useCharacter();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(character.name);

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

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Character name */}
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

      {/* Racial traits */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Características Raciais</Text>
        <TextInput
          style={styles.racialInput}
          multiline
          value={character.racialTraits}
          onChangeText={(v) => dispatch({ type: 'SET_RACIAL_TRAITS', value: v })}
          placeholder="Descreva as características raciais..."
          placeholderTextColor="#6c7086"
        />
      </View>

      {/* Status cards */}
      <Text style={styles.sectionTitle}>Status</Text>
      {STATUS_KEYS.map((key) => (
        <StatusCard key={key} statusKey={key} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#11111b',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  nameText: {
    color: '#cdd6f4',
    fontSize: 22,
    fontWeight: 'bold',
  },
  nameTap: {
    color: '#6c7086',
    fontSize: 11,
    marginTop: 2,
  },
  nameInput: {
    color: '#cdd6f4',
    fontSize: 22,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#89b4fa',
    minWidth: 180,
    paddingVertical: 2,
  },
  resetBtn: {
    backgroundColor: '#45273a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resetText: {
    color: '#f38ba8',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionBox: {
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2e2e4e',
  },
  sectionTitle: {
    color: '#89b4fa',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  racialInput: {
    color: '#cdd6f4',
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
});
