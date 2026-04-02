import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Modal, Alert, ActivityIndicator,
} from 'react-native';
import { loadSheetsList, createSheet, deleteSheet } from '../utils/sheetsManager';

export default function SheetSelectScreen({ onSelect, onNew, userId, onSignOut }) {
  const [sheets, setSheets]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [newName, setNewName]       = useState('');
  const [creating, setCreating]     = useState(false);

  useEffect(() => {
    loadSheetsList().then(list => {
      setSheets(list);
      setLoading(false);
    });
  }, []);

  async function handleCreate() {
    if (creating) return;
    setCreating(true);
    const sheet = await createSheet(newName);
    setShowModal(false);
    setNewName('');
    setCreating(false);
    onNew(sheet);
  }

  async function handleDelete(sheet) {
    Alert.alert(
      'Deletar Ficha',
      `"${sheet.name}" será apagada permanentemente. Continuar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar', style: 'destructive',
          onPress: async () => {
            await deleteSheet(sheet.id, userId);
            setSheets(s => s.filter(x => x.id !== sheet.id));
          },
        },
      ]
    );
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleDateString('pt-BR');
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>Ficha Digital</Text>
        <Text style={styles.appSub}>Escolha sua ficha</Text>
        {onSignOut && (
          <TouchableOpacity style={styles.signOutBtn} onPress={onSignOut}>
            <Text style={styles.signOutText}>Sair da conta</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de fichas */}
      <ScrollView contentContainerStyle={styles.list}>
        {loading ? (
          <ActivityIndicator color="#89b4fa" style={{ marginTop: 40 }} />
        ) : sheets.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma ficha ainda.{'\n'}Crie sua primeira abaixo!</Text>
        ) : (
          sheets.map(sheet => (
            <View key={sheet.id} style={styles.sheetCard}>
              <TouchableOpacity style={styles.sheetInfo} onPress={() => onSelect(sheet)}>
                <Text style={styles.sheetName}>{sheet.name}</Text>
                <Text style={styles.sheetDate}>Criada em {formatDate(sheet.createdAt)}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.selectBtn} onPress={() => onSelect(sheet)}>
                <Text style={styles.selectBtnText}>Jogar →</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(sheet)}>
                <Text style={styles.deleteBtnText}>🗑</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Botão nova ficha */}
      <TouchableOpacity style={styles.newBtn} onPress={() => setShowModal(true)}>
        <Text style={styles.newBtnText}>+ Nova Ficha</Text>
      </TouchableOpacity>

      {/* Modal criação */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Nova Ficha</Text>
            <Text style={styles.modalSub}>Configure seu setup</Text>
            <TextInput
              style={styles.nameInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Nome do personagem..."
              placeholderTextColor="#45475a"
              autoFocus
              onSubmitEditing={handleCreate}
              returnKeyType="done"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setShowModal(false); setNewName(''); }}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleCreate}>
                <Text style={styles.confirmBtnText}>Criar →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#11111b' },

  header: {
    paddingTop: 64, paddingBottom: 28, paddingHorizontal: 24, alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#2e2e4e',
  },
  appTitle: { color: '#cdd6f4', fontSize: 34, fontWeight: '800', letterSpacing: 1 },
  appSub:   { color: '#6c7086', fontSize: 14, marginTop: 4 },
  signOutBtn:  { marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#313244' },
  signOutText: { color: '#f38ba8', fontSize: 13, fontWeight: '600' },

  list:      { padding: 16, paddingBottom: 120 },
  emptyText: { color: '#45475a', textAlign: 'center', marginTop: 48, fontSize: 15, lineHeight: 24 },

  sheetCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1e1e2e', borderRadius: 14,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#2e2e4e',
  },
  sheetInfo: { flex: 1 },
  sheetName: { color: '#cdd6f4', fontSize: 16, fontWeight: '700' },
  sheetDate: { color: '#45475a', fontSize: 11, marginTop: 2 },

  selectBtn: {
    backgroundColor: '#1d4d3a', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, marginLeft: 8,
  },
  selectBtnText: { color: '#a6e3a1', fontSize: 13, fontWeight: '700' },
  deleteBtn:     { padding: 8, marginLeft: 4 },
  deleteBtnText: { fontSize: 18 },

  newBtn: {
    position: 'absolute', bottom: 36, left: 24, right: 24,
    backgroundColor: '#89b4fa', borderRadius: 16, padding: 17, alignItems: 'center',
    shadowColor: '#89b4fa', shadowOpacity: 0.3, shadowRadius: 12, elevation: 4,
  },
  newBtnText: { color: '#11111b', fontSize: 16, fontWeight: '800' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center', padding: 24,
  },
  modalSheet:  { backgroundColor: '#1e1e2e', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#313244' },
  modalTitle:  { color: '#cdd6f4', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  modalSub:    { color: '#6c7086', fontSize: 13, marginBottom: 20 },
  nameInput:   {
    backgroundColor: '#181825', borderRadius: 10, borderWidth: 1, borderColor: '#313244',
    color: '#cdd6f4', fontSize: 15, padding: 12, marginBottom: 20,
  },
  modalBtns:     { flexDirection: 'row', gap: 10 },
  cancelBtn:     { flex: 1, backgroundColor: '#313244', borderRadius: 10, padding: 13, alignItems: 'center' },
  cancelBtnText: { color: '#6c7086', fontSize: 14, fontWeight: '600' },
  confirmBtn:    { flex: 2, backgroundColor: '#89b4fa', borderRadius: 10, padding: 13, alignItems: 'center' },
  confirmBtnText:{ color: '#11111b', fontSize: 14, fontWeight: '700' },
});
