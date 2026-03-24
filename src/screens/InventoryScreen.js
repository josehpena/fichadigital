import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Switch, Alert, Modal,
} from 'react-native';
import { useCharacter } from '../context/CharacterContext';

// ── Item Slot ─────────────────────────────────────────────────────────────────
function ItemSlot({ index, item, section, storageId, placeholder }) {
  const { dispatch } = useCharacter();
  const [showEquip, setShowEquip] = useState(false);
  const isEmpty = !item.nome;

  function equipTo(slot) {
    if (storageId) {
      dispatch({ type: 'EQUIP_FROM_INVENTORY', storageId, index, slot });
    } else {
      dispatch({ type: 'EQUIP_FROM_INVENTORY', section, index, slot });
    }
    setShowEquip(false);
  }

  function setField(field, value) {
    if (storageId) {
      dispatch({ type: 'INVENTORY_SET_STORAGE_ITEM', storageId, index, field, value });
    } else {
      dispatch({ type: 'INVENTORY_SET_ITEM', section, index, field, value });
    }
  }

  return (
    <View style={[styles.slot, isEmpty && styles.slotEmpty]}>
      <TextInput
        style={styles.slotInput}
        value={item.nome}
        placeholder={placeholder ?? `Item ${index + 1}`}
        placeholderTextColor="#313244"
        onChangeText={v => setField('nome', v)}
      />
      {!isEmpty && (
        <>
          {item.weaponData && (
            <Text style={styles.weaponTag}>
              ⚔{item.weaponData.nivel > 1 ? ` Nv ${item.weaponData.nivel}` : ''}
              {item.weaponData.tiras?.length > 0 ? `  🪢 ${item.weaponData.tiras.length}` : ''}
            </Text>
          )}
          {!item.weaponData && (
            <TextInput
              style={styles.slotObs}
              value={item.obs}
              placeholder="obs..."
              placeholderTextColor="#313244"
              onChangeText={v => setField('obs', v)}
            />
          )}
          {showEquip ? (
            <View style={styles.equipRow}>
              <TouchableOpacity style={styles.equipHandBtn} onPress={() => equipTo('maoDireita')}>
                <Text style={styles.equipHandBtnText}>Mão D</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.equipHandBtn} onPress={() => equipTo('maoEsquerda')}>
                <Text style={styles.equipHandBtnText}>Mão E</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowEquip(false)}>
                <Text style={styles.equipCancelText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.equipBtn} onPress={() => setShowEquip(true)}>
              <Text style={styles.equipBtnText}>⚔ Equipar</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

// ── Coin Button ───────────────────────────────────────────────────────────────
function CoinBtn({ delta, color, onPress }) {
  const label = delta > 0 ? `+${delta}` : `${delta}`;
  return (
    <TouchableOpacity
      style={[styles.coinBtn, { borderColor: color }]}
      onPress={() => onPress(delta)}
    >
      <Text style={[styles.coinBtnText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Custom Storage Section ────────────────────────────────────────────────────
function StorageSection({ storage, dispatch }) {
  const [editing, setEditing] = useState(false);
  const [editNome, setEditNome]   = useState(storage.nome);
  const [editIcone, setEditIcone] = useState(storage.icone);

  const slots = storage.itens.slice(0, storage.capacidade);

  function saveEdit() {
    dispatch({ type: 'INVENTORY_RENAME_STORAGE', storageId: storage.id, nome: editNome, icone: editIcone });
    setEditing(false);
  }

  function confirmDelete() {
    Alert.alert(
      'Remover armazenamento',
      `"${storage.nome}" será removido permanentemente. Continuar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => dispatch({ type: 'INVENTORY_REMOVE_STORAGE', storageId: storage.id }) },
      ]
    );
  }

  function changeCapacity(delta) {
    const lastItem = storage.itens[storage.capacidade - 1];
    if (delta < 0 && lastItem?.nome) {
      Alert.alert('Slot ocupado', 'Esvazie o último slot antes de diminuir.');
      return;
    }
    dispatch({ type: 'INVENTORY_SET_STORAGE_CAPACITY', storageId: storage.id, delta });
  }

  return (
    <View style={styles.storageSection}>
      {/* Header */}
      {editing ? (
        <View style={styles.editRow}>
          <TextInput
            style={styles.editIconInput}
            value={editIcone}
            onChangeText={setEditIcone}
            maxLength={2}
          />
          <TextInput
            style={[styles.editNameInput, { flex: 1 }]}
            value={editNome}
            onChangeText={setEditNome}
            autoFocus
          />
          <TouchableOpacity style={styles.editSaveBtn} onPress={saveEdit}>
            <Text style={styles.editSaveBtnText}>✓</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setEditing(false)} style={{ padding: 6 }}>
            <Text style={{ color: '#45475a', fontSize: 14 }}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{storage.icone} {storage.nome}</Text>
          <View style={styles.sectionRight}>
            <Text style={styles.capacityText}>{storage.capacidade} espaços</Text>
            <TouchableOpacity style={styles.smallBtn} onPress={() => changeCapacity(-1)}>
              <Text style={styles.smallBtnText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.smallBtn} onPress={() => changeCapacity(1)}>
              <Text style={styles.smallBtnText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editBtn} onPress={() => { setEditNome(storage.nome); setEditIcone(storage.icone); setEditing(true); }}>
              <Text style={styles.editBtnText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
              <Text style={styles.deleteBtnText}>🗑</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Grid */}
      <View style={styles.grid}>
        {slots.map((item, i) => (
          <ItemSlot
            key={i}
            index={i}
            item={item}
            storageId={storage.id}
            placeholder={`Slot ${i + 1}`}
          />
        ))}
      </View>
    </View>
  );
}

// ── New Storage Modal ─────────────────────────────────────────────────────────
const PRESET_ICONS = ['📦', '🎒', '🧳', '💼', '🗃', '🛍', '🏺', '⚗️', '🗝', '🧰'];

function NewStorageModal({ visible, onClose, dispatch }) {
  const [nome, setNome]     = useState('');
  const [icone, setIcone]   = useState('📦');
  const [cap, setCap]       = useState('6');

  function handleCreate() {
    const capacidade = Math.max(1, Math.min(40, parseInt(cap, 10) || 6));
    dispatch({
      type: 'INVENTORY_ADD_STORAGE',
      nome: nome.trim() || 'Armazenamento',
      icone,
      capacidade,
    });
    setNome(''); setIcone('📦'); setCap('6');
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Novo Armazenamento</Text>

          <Text style={styles.modalLabel}>Ícone</Text>
          <View style={styles.iconRow}>
            {PRESET_ICONS.map(ic => (
              <TouchableOpacity
                key={ic}
                style={[styles.iconBtn, icone === ic && styles.iconBtnActive]}
                onPress={() => setIcone(ic)}
              >
                <Text style={styles.iconBtnText}>{ic}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.modalLabel}>Nome</Text>
          <TextInput
            style={styles.modalInput}
            value={nome}
            onChangeText={setNome}
            placeholder="Ex: Mochila de Couro..."
            placeholderTextColor="#45475a"
            autoFocus
          />

          <Text style={styles.modalLabel}>Capacidade inicial</Text>
          <TextInput
            style={styles.modalInput}
            value={cap}
            onChangeText={setCap}
            keyboardType="number-pad"
            placeholder="6"
            placeholderTextColor="#45475a"
          />

          <View style={styles.modalBtns}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleCreate}>
              <Text style={styles.confirmBtnText}>Criar →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function InventoryScreen() {
  const { character, dispatch } = useCharacter();
  const [showNewStorage, setShowNewStorage] = useState(false);

  const inv = character.inventory ?? {
    bolsa: { capacidade: 6, itens: [] },
    moedas: 0,
    cinto: { ativo: false, itens: [] },
    storages: [],
  };

  const bolsaSlots = inv.bolsa.itens.slice(0, inv.bolsa.capacidade);
  const cintoSlots = inv.cinto.itens;
  const moedas     = inv.moedas ?? 0;
  const storages   = inv.storages ?? [];

  const changeMoedas = delta => dispatch({ type: 'INVENTORY_CHANGE_MOEDAS', delta });

  function shrinkBolsa() {
    const lastItem = inv.bolsa.itens[inv.bolsa.capacidade - 1];
    if (lastItem?.nome) {
      Alert.alert('Slot ocupado', 'Esvazie o último slot da bolsa antes de diminuir.');
      return;
    }
    dispatch({ type: 'INVENTORY_SHRINK_BOLSA' });
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>

      {/* ── Bolsa ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🎒 Bolsa</Text>
        <View style={styles.sectionRight}>
          <Text style={styles.capacityText}>{inv.bolsa.capacidade} espaços</Text>
          <TouchableOpacity style={styles.smallBtn} onPress={shrinkBolsa}>
            <Text style={styles.smallBtnText}>−</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.expandBtn}
            onPress={() => dispatch({ type: 'INVENTORY_EXPAND_BOLSA' })}
          >
            <Text style={styles.expandBtnText}>+ Expandir</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.grid}>
        {bolsaSlots.map((item, i) => (
          <ItemSlot key={i} index={i} item={item} section="bolsa" />
        ))}
      </View>

      <View style={styles.divider} />

      {/* ── Saco de Moedas ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>💰 Moedas</Text>
        <Text style={styles.moedasTotal}>{moedas}</Text>
      </View>

      <View style={styles.coinRow}>
        <CoinBtn delta={-100} color="#f38ba8" onPress={changeMoedas} />
        <CoinBtn delta={-50}  color="#f38ba8" onPress={changeMoedas} />
        <CoinBtn delta={-10}  color="#f38ba8" onPress={changeMoedas} />
        <View style={styles.coinSep} />
        <CoinBtn delta={10}   color="#a6e3a1" onPress={changeMoedas} />
        <CoinBtn delta={50}   color="#a6e3a1" onPress={changeMoedas} />
        <CoinBtn delta={100}  color="#a6e3a1" onPress={changeMoedas} />
      </View>

      <View style={styles.divider} />

      {/* ── Cinto de Utilidades ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🔧 Cinto de Utilidades</Text>
        <Switch
          value={inv.cinto.ativo}
          onValueChange={() => dispatch({ type: 'INVENTORY_TOGGLE_CINTO' })}
          trackColor={{ false: '#313244', true: '#1d4d3a' }}
          thumbColor={inv.cinto.ativo ? '#a6e3a1' : '#6c7086'}
        />
      </View>

      {inv.cinto.ativo && (
        <View style={styles.grid}>
          {cintoSlots.map((item, i) => (
            <ItemSlot key={i} index={i} item={item} section="cinto" placeholder={`Slot ${i + 1}`} />
          ))}
        </View>
      )}

      <View style={styles.divider} />

      {/* ── Armazenamentos customizados ── */}
      {storages.map(storage => (
        <StorageSection key={storage.id} storage={storage} dispatch={dispatch} />
      ))}

      <TouchableOpacity style={styles.newStorageBtn} onPress={() => setShowNewStorage(true)}>
        <Text style={styles.newStorageBtnText}>+ Novo Armazenamento</Text>
      </TouchableOpacity>

      <NewStorageModal
        visible={showNewStorage}
        onClose={() => setShowNewStorage(false)}
        dispatch={dispatch}
      />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: '#11111b' },
  content: { padding: 14, paddingBottom: 48 },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: { color: '#cdd6f4', fontSize: 16, fontWeight: '700' },
  sectionRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  capacityText: { color: '#6c7086', fontSize: 12 },

  smallBtn: {
    width: 28, height: 28, borderRadius: 6, backgroundColor: '#2a2a3e',
    borderWidth: 1, borderColor: '#45475a',
    alignItems: 'center', justifyContent: 'center',
  },
  smallBtnText: { color: '#cdd6f4', fontSize: 16, fontWeight: '700', lineHeight: 20 },

  expandBtn: {
    backgroundColor: '#1d3052', borderRadius: 7, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: '#89b4fa',
  },
  expandBtnText: { color: '#89b4fa', fontSize: 11, fontWeight: '700' },

  divider: { height: 1, backgroundColor: '#2e2e4e', marginVertical: 18 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  slot: {
    width: '47.5%', backgroundColor: '#1e1e2e',
    borderRadius: 8, borderWidth: 1, borderColor: '#313244',
    padding: 8,
  },
  slotEmpty: { borderStyle: 'dashed', borderColor: '#2e2e4e' },
  slotInput: { color: '#cdd6f4', fontSize: 13, padding: 0, fontWeight: '600' },
  slotObs:   { color: '#6c7086', fontSize: 10, padding: 0, marginTop: 2 },
  weaponTag:       { color: '#fab387', fontSize: 10, fontWeight: '600', marginTop: 2, marginBottom: 2 },
  equipBtn:        { marginTop: 5, backgroundColor: '#1d3052', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 3, alignSelf: 'flex-start' },
  equipBtnText:    { color: '#89b4fa', fontSize: 10, fontWeight: '700' },
  equipRow:        { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  equipHandBtn:    { backgroundColor: '#1d3a2f', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  equipHandBtnText:{ color: '#a6e3a1', fontSize: 10, fontWeight: '700' },
  equipCancelText: { color: '#45475a', fontSize: 13, paddingHorizontal: 4 },

  moedasTotal: {
    color: '#f9e2af', fontSize: 26, fontWeight: 'bold', letterSpacing: 1,
  },

  coinRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  coinSep: { flex: 1 },
  coinBtn: {
    borderRadius: 8, borderWidth: 1.5,
    paddingHorizontal: 11, paddingVertical: 8,
    backgroundColor: '#1e1e2e',
  },
  coinBtnText: { fontSize: 13, fontWeight: '700' },

  // Custom storages
  storageSection: { marginBottom: 18 },

  editRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  editIconInput: {
    width: 40, height: 36, backgroundColor: '#1e1e2e',
    borderRadius: 6, borderWidth: 1, borderColor: '#313244',
    color: '#cdd6f4', fontSize: 18, textAlign: 'center', padding: 0,
  },
  editNameInput: {
    height: 36, backgroundColor: '#1e1e2e',
    borderRadius: 6, borderWidth: 1, borderColor: '#313244',
    color: '#cdd6f4', fontSize: 14, paddingHorizontal: 10,
  },
  editSaveBtn: {
    backgroundColor: '#1d4d3a', borderRadius: 6,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  editSaveBtnText: { color: '#a6e3a1', fontSize: 14, fontWeight: '700' },
  editBtn:      { padding: 4 },
  editBtnText:  { fontSize: 16 },
  deleteBtn:    { padding: 4 },
  deleteBtnText:{ fontSize: 16 },

  newStorageBtn: {
    marginTop: 6, borderRadius: 12, borderWidth: 1.5,
    borderColor: '#6c7086', borderStyle: 'dashed',
    paddingVertical: 14, alignItems: 'center',
  },
  newStorageBtnText: { color: '#6c7086', fontSize: 14, fontWeight: '700' },

  // New storage modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center', padding: 24,
  },
  modalSheet:   { backgroundColor: '#1e1e2e', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#313244' },
  modalTitle:   { color: '#cdd6f4', fontSize: 20, fontWeight: '800', marginBottom: 16 },
  modalLabel:   { color: '#6c7086', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  modalInput: {
    backgroundColor: '#181825', borderRadius: 10, borderWidth: 1, borderColor: '#313244',
    color: '#cdd6f4', fontSize: 15, padding: 12, marginBottom: 14,
  },
  iconRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  iconBtn:  {
    width: 42, height: 42, borderRadius: 10, backgroundColor: '#181825',
    borderWidth: 1, borderColor: '#313244',
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnActive: { borderColor: '#89b4fa', backgroundColor: '#1d3052' },
  iconBtnText:   { fontSize: 20 },
  modalBtns:     { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn:     { flex: 1, backgroundColor: '#313244', borderRadius: 10, padding: 13, alignItems: 'center' },
  cancelBtnText: { color: '#6c7086', fontSize: 14, fontWeight: '600' },
  confirmBtn:    { flex: 2, backgroundColor: '#89b4fa', borderRadius: 10, padding: 13, alignItems: 'center' },
  confirmBtnText:{ color: '#11111b', fontSize: 14, fontWeight: '700' },
});
