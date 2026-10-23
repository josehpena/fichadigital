import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Modal, Alert,
} from 'react-native';
import { useCharacter } from '../context/CharacterContext';

const PET_ICONS = ['🐾', '🐺', '🦅', '🐍', '🐉', '🐴', '🐆', '🦊', '🕷️', '🦂', '🐻', '🦇', '🐗', '🦌', '👻', '💀'];

const TIPOS = {
  selvagem: { label: 'Selvagem', hint: 'Ainda não domado', icon: '🌿', color: '#fab387' },
  domado:   { label: 'Domado',   hint: 'Pet vivo domado', icon: '🐾', color: '#a6e3a1' },
  alma:     { label: 'Alma',     hint: 'Alma de um pet morto', icon: '👻', color: '#cba6f7' },
};

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

// ── Stepper de status (atual / máx) ──────────────────────────────────────────
function StatEditor({ icon, label, color, stat, onChange }) {
  const cur = stat?.current ?? 0;
  const max = stat?.max ?? 0;

  const setCur = (v) => onChange({ current: clamp(v, 0, max), max });
  const setMax = (v) => {
    const nm = Math.max(0, v);
    onChange({ current: clamp(cur, 0, nm), max: nm });
  };

  return (
    <View style={s.statRow}>
      <Text style={[s.statLabel, { color }]}>{icon} {label}</Text>
      <View style={s.statSteppers}>
        <TouchableOpacity style={s.statBtn} onPress={() => setCur(cur - 1)}>
          <Text style={s.statBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={[s.statVal, { color }]}>{cur}</Text>
        <TouchableOpacity style={s.statBtn} onPress={() => setCur(cur + 1)}>
          <Text style={s.statBtnText}>+</Text>
        </TouchableOpacity>

        <Text style={s.statSlash}>/</Text>

        <TouchableOpacity style={s.statBtnSm} onPress={() => setMax(max - 1)}>
          <Text style={s.statBtnTextSm}>−</Text>
        </TouchableOpacity>
        <Text style={s.statMax}>{max}</Text>
        <TouchableOpacity style={s.statBtnSm} onPress={() => setMax(max + 1)}>
          <Text style={s.statBtnTextSm}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Modal de item simples (nome + obs) — usado em equipamentos e itens de bolsa ──
function ItemEditModal({ visible, initial, title, onSave, onDelete, onClose }) {
  const [nome, setNome] = useState('');
  const [obs, setObs]   = useState('');

  useEffect(() => {
    if (visible) {
      setNome(initial?.nome ?? '');
      setObs(initial?.obs ?? '');
    }
  }, [visible, initial]);

  const hasInitial = !!initial?.nome;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={s.modalSheet}>
          <Text style={s.modalTitle}>{title}</Text>

          <Text style={s.modalLabel}>Nome</Text>
          <TextInput
            style={s.modalInput}
            value={nome}
            onChangeText={setNome}
            placeholder="Ex: Coleira de Aço..."
            placeholderTextColor="#45475a"
            autoFocus
          />

          <Text style={s.modalLabel}>Observação</Text>
          <TextInput
            style={[s.modalInput, { minHeight: 60, textAlignVertical: 'top' }]}
            value={obs}
            onChangeText={setObs}
            placeholder="Efeitos, detalhes..."
            placeholderTextColor="#45475a"
            multiline
          />

          <View style={s.modalBtns}>
            {hasInitial && onDelete && (
              <TouchableOpacity style={s.deleteBtn} onPress={() => { onDelete(); onClose(); }}>
                <Text style={s.deleteBtnText}>🗑</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
              <Text style={s.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.confirmBtn, !nome.trim() && { opacity: 0.4 }]}
              disabled={!nome.trim()}
              onPress={() => { onSave({ nome: nome.trim(), obs: obs.trim() }); onClose(); }}
            >
              <Text style={s.confirmBtnText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Bolsa do pet ─────────────────────────────────────────────────────────────
function PetBolsa({ bolsa, onChange, onRemove }) {
  const [slotModal, setSlotModal] = useState(null); // { index, item }
  const cap = bolsa.capacidade ?? 4;
  const itens = bolsa.itens ?? [];
  const slots = Array.from({ length: cap }, (_, i) => itens[i] ?? { nome: '', obs: '' });

  const setCap = (delta) => {
    const nc = clamp(cap + delta, 1, 20);
    if (delta < 0 && itens[cap - 1]?.nome) {
      Alert.alert('Slot ocupado', 'Esvazie o último slot antes de diminuir.');
      return;
    }
    onChange({ ...bolsa, capacidade: nc });
  };

  const setSlot = (index, item) => {
    const next = [...slots];
    next[index] = item;
    onChange({ ...bolsa, itens: next });
  };

  return (
    <View style={s.bolsaBox}>
      <View style={s.bolsaHeader}>
        <Text style={s.bolsaNome}>{bolsa.icone} {bolsa.nome}</Text>
        <View style={s.bolsaHeaderRight}>
          <Text style={s.bolsaCap}>{cap}</Text>
          <TouchableOpacity style={s.miniBtn} onPress={() => setCap(-1)}>
            <Text style={s.miniBtnText}>−</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.miniBtn} onPress={() => setCap(1)}>
            <Text style={s.miniBtnText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.miniBtn} onPress={onRemove}>
            <Text style={s.miniBtnText}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={s.bolsaGrid}>
        {slots.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[s.bolsaSlot, !item.nome && s.bolsaSlotEmpty]}
            onPress={() => setSlotModal({ index: i, item })}
          >
            {item.nome ? (
              <>
                <Text style={s.bolsaSlotName} numberOfLines={1}>{item.nome}</Text>
                {!!item.obs && <Text style={s.bolsaSlotObs} numberOfLines={1}>{item.obs}</Text>}
              </>
            ) : (
              <Text style={s.bolsaSlotPlus}>+</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ItemEditModal
        visible={!!slotModal}
        initial={slotModal?.item}
        title="Item da bolsa"
        onSave={(it) => setSlot(slotModal.index, it)}
        onDelete={() => setSlot(slotModal.index, { nome: '', obs: '' })}
        onClose={() => setSlotModal(null)}
      />
    </View>
  );
}

// ── Card de um pet ───────────────────────────────────────────────────────────
function PetCard({ pet, dispatch }) {
  const [expanded, setExpanded] = useState(false);
  const [caracInput, setCaracInput] = useState('');
  const [equipModal, setEquipModal] = useState(null); // { equip } | { equip: null }
  const [editName, setEditName]     = useState(false);
  const [nameInput, setNameInput]   = useState(pet.nome);
  const [iconPicker, setIconPicker] = useState(false);

  const tipo = TIPOS[pet.tipo] ?? TIPOS.domado;
  const update = (changes) => dispatch({ type: 'PET_UPDATE', petId: pet.id, changes });

  const caracteristicas = pet.caracteristicas ?? [];
  const equipamentos    = pet.equipamentos ?? [];
  const bolsas          = pet.bolsas ?? [];

  function addCarac() {
    const t = caracInput.trim();
    if (!t) return;
    update({ caracteristicas: [...caracteristicas, { id: `c_${Date.now()}`, texto: t }] });
    setCaracInput('');
  }
  function removeCarac(id) {
    update({ caracteristicas: caracteristicas.filter(c => c.id !== id) });
  }

  function saveEquip(equip, data) {
    if (equip) {
      update({ equipamentos: equipamentos.map(e => e.id === equip.id ? { ...e, ...data } : e) });
    } else {
      update({ equipamentos: [...equipamentos, { id: `eq_${Date.now()}`, ...data }] });
    }
  }
  function removeEquip(id) {
    update({ equipamentos: equipamentos.filter(e => e.id !== id) });
  }

  function addBolsa() {
    const bolsa = { id: `b_${Date.now()}`, nome: 'Bolsa', icone: '🎒', capacidade: 4, itens: [] };
    update({ bolsas: [...bolsas, bolsa] });
  }
  function changeBolsa(bolsaId, next) {
    update({ bolsas: bolsas.map(b => b.id === bolsaId ? next : b) });
  }
  function removeBolsa(bolsaId) {
    update({ bolsas: bolsas.filter(b => b.id !== bolsaId) });
  }

  function confirmDelete() {
    Alert.alert('Remover pet', `"${pet.nome}" será removido. Continuar?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => dispatch({ type: 'PET_REMOVE', petId: pet.id }) },
    ]);
  }

  function saveName() {
    update({ nome: nameInput.trim() || 'Pet' });
    setEditName(false);
  }

  return (
    <View style={[s.petCard, pet.invocado && s.petCardActive]}>
      {/* Header */}
      <View style={s.petHeader}>
        <TouchableOpacity onPress={() => setIconPicker(v => !v)}>
          <Text style={s.petIcon}>{pet.icone}</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          {editName ? (
            <TextInput
              style={s.petNameInput}
              value={nameInput}
              onChangeText={setNameInput}
              onSubmitEditing={saveName}
              onBlur={saveName}
              autoFocus
            />
          ) : (
            <TouchableOpacity onPress={() => setExpanded(v => !v)} onLongPress={() => { setNameInput(pet.nome); setEditName(true); }}>
              <Text style={s.petName}>{pet.nome}</Text>
            </TouchableOpacity>
          )}
          <View style={s.petMeta}>
            <Text style={[s.petTipoBadge, { color: tipo.color, borderColor: tipo.color + '66' }]}>
              {tipo.icon} {tipo.label}
            </Text>
            <Text style={s.petHpHint}>❤️ {pet.vida?.current ?? 0}/{pet.vida?.max ?? 0}   🔵 {pet.mana?.current ?? 0}/{pet.mana?.max ?? 0}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[s.invocarBtn, pet.invocado && s.invocarBtnOn]}
          onPress={() => update({ invocado: !pet.invocado })}
        >
          <Text style={[s.invocarBtnText, pet.invocado && s.invocarBtnTextOn]}>
            {pet.invocado ? 'Invocado' : 'Invocar'}
          </Text>
        </TouchableOpacity>
      </View>

      {iconPicker && (
        <View style={s.iconRow}>
          {PET_ICONS.map(ic => (
            <TouchableOpacity
              key={ic}
              style={[s.iconBtn, pet.icone === ic && s.iconBtnActive]}
              onPress={() => { update({ icone: ic }); setIconPicker(false); }}
            >
              <Text style={s.iconBtnText}>{ic}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity style={s.expandToggle} onPress={() => setExpanded(v => !v)}>
        <Text style={s.expandToggleText}>{expanded ? 'Ocultar detalhes ▲' : 'Ver detalhes ▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={s.petBody}>
          {/* Tipo */}
          <View style={s.tipoRow}>
            {Object.entries(TIPOS).map(([key, t]) => (
              <TouchableOpacity
                key={key}
                style={[s.tipoBtn, pet.tipo === key && { borderColor: t.color, backgroundColor: t.color + '22' }]}
                onPress={() => update({ tipo: key })}
              >
                <Text style={[s.tipoBtnText, pet.tipo === key && { color: t.color }]}>{t.icon} {t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Status */}
          <Text style={s.sectionLabel}>Status</Text>
          <StatEditor icon="❤️" label="Vida" color="#f38ba8" stat={pet.vida} onChange={(v) => update({ vida: v })} />
          <StatEditor icon="🔵" label="Mana" color="#89b4fa" stat={pet.mana} onChange={(v) => update({ mana: v })} />

          {/* Características */}
          <Text style={s.sectionLabel}>Características especiais</Text>
          {caracteristicas.length === 0 && <Text style={s.emptyHint}>Nenhuma característica</Text>}
          {caracteristicas.map(c => (
            <View key={c.id} style={s.caracRow}>
              <Text style={s.caracText}>• {c.texto}</Text>
              <TouchableOpacity onPress={() => removeCarac(c.id)}>
                <Text style={s.caracRemove}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          <View style={s.caracAddRow}>
            <TextInput
              style={s.caracInput}
              value={caracInput}
              onChangeText={setCaracInput}
              placeholder="Ex: Voo, visão noturna, +2 mordida..."
              placeholderTextColor="#45475a"
              onSubmitEditing={addCarac}
            />
            <TouchableOpacity style={s.caracAddBtn} onPress={addCarac}>
              <Text style={s.caracAddBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Equipamentos */}
          <Text style={s.sectionLabel}>Equipamentos</Text>
          {equipamentos.length === 0 && <Text style={s.emptyHint}>Nenhum equipamento</Text>}
          {equipamentos.map(e => (
            <TouchableOpacity key={e.id} style={s.equipRow} onPress={() => setEquipModal({ equip: e })}>
              <View style={{ flex: 1 }}>
                <Text style={s.equipName}>🛡️ {e.nome}</Text>
                {!!e.obs && <Text style={s.equipObs}>{e.obs}</Text>}
              </View>
              <Text style={s.equipEdit}>✏️</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={s.addLineBtn} onPress={() => setEquipModal({ equip: null })}>
            <Text style={s.addLineBtnText}>+ Adicionar equipamento</Text>
          </TouchableOpacity>

          {/* Bolsas */}
          <Text style={s.sectionLabel}>Bolsas</Text>
          {bolsas.length === 0 && <Text style={s.emptyHint}>Nenhuma bolsa</Text>}
          {bolsas.map(b => (
            <PetBolsa
              key={b.id}
              bolsa={b}
              onChange={(next) => changeBolsa(b.id, next)}
              onRemove={() => removeBolsa(b.id)}
            />
          ))}
          <TouchableOpacity style={s.addLineBtn} onPress={addBolsa}>
            <Text style={s.addLineBtnText}>+ Adicionar bolsa</Text>
          </TouchableOpacity>

          {/* Observações */}
          <Text style={s.sectionLabel}>Observações</Text>
          <TextInput
            style={[s.modalInput, { minHeight: 50, textAlignVertical: 'top', marginBottom: 12 }]}
            value={pet.obs ?? ''}
            onChangeText={(v) => update({ obs: v })}
            placeholder="Anotações sobre o pet..."
            placeholderTextColor="#45475a"
            multiline
          />

          <TouchableOpacity style={s.petDeleteBtn} onPress={confirmDelete}>
            <Text style={s.petDeleteBtnText}>Remover pet</Text>
          </TouchableOpacity>
        </View>
      )}

      <ItemEditModal
        visible={!!equipModal}
        initial={equipModal?.equip}
        title={equipModal?.equip ? 'Editar equipamento' : 'Novo equipamento'}
        onSave={(data) => saveEquip(equipModal?.equip ?? null, data)}
        onDelete={() => equipModal?.equip && removeEquip(equipModal.equip.id)}
        onClose={() => setEquipModal(null)}
      />
    </View>
  );
}

// ── Modal de novo pet ────────────────────────────────────────────────────────
function NewPetModal({ visible, onClose, dispatch }) {
  const [nome, setNome]   = useState('');
  const [tipo, setTipo]   = useState('selvagem');
  const [icone, setIcone] = useState('🐾');

  useEffect(() => {
    if (visible) { setNome(''); setTipo('selvagem'); setIcone('🐾'); }
  }, [visible]);

  function create() {
    dispatch({
      type: 'PET_ADD',
      pet: {
        nome: nome.trim() || (tipo === 'alma' ? 'Alma' : 'Pet'),
        tipo,
        icone,
      },
    });
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={s.modalSheet}>
          <Text style={s.modalTitle}>Novo Pet</Text>

          <Text style={s.modalLabel}>Origem</Text>
          <View style={s.tipoRow}>
            {Object.entries(TIPOS).map(([key, t]) => (
              <TouchableOpacity
                key={key}
                style={[s.tipoBtnBig, tipo === key && { borderColor: t.color, backgroundColor: t.color + '22' }]}
                onPress={() => { setTipo(key); if (key === 'alma' && icone === '🐾') setIcone('👻'); if (key !== 'alma' && icone === '👻') setIcone('🐾'); }}
              >
                <Text style={s.tipoBtnBigIcon}>{t.icon}</Text>
                <Text style={[s.tipoBtnBigLabel, tipo === key && { color: t.color }]}>{t.label}</Text>
                <Text style={s.tipoBtnBigHint}>{t.hint}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.modalLabel}>Ícone</Text>
          <View style={s.iconRow}>
            {PET_ICONS.map(ic => (
              <TouchableOpacity
                key={ic}
                style={[s.iconBtn, icone === ic && s.iconBtnActive]}
                onPress={() => setIcone(ic)}
              >
                <Text style={s.iconBtnText}>{ic}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.modalLabel}>Nome</Text>
          <TextInput
            style={s.modalInput}
            value={nome}
            onChangeText={setNome}
            placeholder={tipo === 'alma' ? 'Ex: Alma do Lobo...' : 'Ex: Rex...'}
            placeholderTextColor="#45475a"
            autoFocus
          />

          <View style={s.modalBtns}>
            <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
              <Text style={s.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.confirmBtn} onPress={create}>
              <Text style={s.confirmBtnText}>Criar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Tela principal ───────────────────────────────────────────────────────────
export default function PetsScreen() {
  const { character, dispatch } = useCharacter();
  const [showNew, setShowNew] = useState(false);

  const pets = character.pets ?? [];
  const invocados = pets.filter(p => p.invocado).length;

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <View style={s.headerRow}>
        <Text style={s.pageTitle}>Pets</Text>
        <View style={s.badge}>
          <Text style={s.badgeLabel}>Invocados</Text>
          <Text style={s.badgeValue}>{invocados}/{pets.length}</Text>
        </View>
      </View>

      {pets.length === 0 && (
        <Text style={s.emptyScreen}>
          Nenhum pet ainda.{'\n'}Dome um pet vivo ou tome a alma de um pet morto.
        </Text>
      )}

      {pets.map(pet => (
        <PetCard key={pet.id} pet={pet} dispatch={dispatch} />
      ))}

      <TouchableOpacity style={s.newBtn} onPress={() => setShowNew(true)}>
        <Text style={s.newBtnText}>+ Novo Pet</Text>
      </TouchableOpacity>

      <NewPetModal visible={showNew} onClose={() => setShowNew(false)} dispatch={dispatch} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: '#11111b' },
  content: { padding: 14, paddingBottom: 48 },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  pageTitle: { color: '#cdd6f4', fontSize: 22, fontWeight: 'bold' },
  badge:      { backgroundColor: '#1e1e2e', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignItems: 'center' },
  badgeLabel: { color: '#6c7086', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  badgeValue: { color: '#89b4fa', fontSize: 14, fontWeight: 'bold' },

  emptyScreen: { color: '#45475a', fontSize: 13, fontStyle: 'italic', textAlign: 'center', lineHeight: 20, marginVertical: 30 },

  // Pet card
  petCard: {
    backgroundColor: '#1e1e2e', borderRadius: 12, padding: 12,
    marginBottom: 12, borderWidth: 1, borderColor: '#2e2e4e',
  },
  petCardActive: { borderColor: '#89b4fa', backgroundColor: '#18213a' },

  petHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  petIcon:   { fontSize: 32 },
  petName:   { color: '#cdd6f4', fontSize: 17, fontWeight: '700' },
  petNameInput: { color: '#cdd6f4', fontSize: 17, fontWeight: '700', borderBottomWidth: 1, borderBottomColor: '#89b4fa', paddingVertical: 2 },
  petMeta:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3, flexWrap: 'wrap' },
  petTipoBadge: { fontSize: 10, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  petHpHint: { color: '#6c7086', fontSize: 11 },

  invocarBtn:      { backgroundColor: '#313244', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#45475a' },
  invocarBtnOn:    { backgroundColor: '#1d3052', borderColor: '#89b4fa' },
  invocarBtnText:  { color: '#6c7086', fontSize: 12, fontWeight: '700' },
  invocarBtnTextOn:{ color: '#89b4fa' },

  expandToggle:     { marginTop: 10, alignItems: 'center' },
  expandToggleText: { color: '#6c7086', fontSize: 11, fontWeight: '600' },

  petBody: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#2e2e4e', paddingTop: 12 },

  sectionLabel: { color: '#89b4fa', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 14, marginBottom: 8 },
  emptyHint:    { color: '#45475a', fontSize: 12, fontStyle: 'italic', marginBottom: 6 },

  // Status editor
  statRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  statLabel:    { fontSize: 14, fontWeight: '700' },
  statSteppers: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statBtn:      { width: 32, height: 32, borderRadius: 8, backgroundColor: '#2a2a3e', borderWidth: 1, borderColor: '#45475a', alignItems: 'center', justifyContent: 'center' },
  statBtnText:  { color: '#cdd6f4', fontSize: 18, fontWeight: '700', lineHeight: 22 },
  statVal:      { fontSize: 17, fontWeight: 'bold', minWidth: 26, textAlign: 'center' },
  statSlash:    { color: '#45475a', fontSize: 14, marginHorizontal: 2 },
  statBtnSm:    { width: 26, height: 26, borderRadius: 6, backgroundColor: '#181825', borderWidth: 1, borderColor: '#313244', alignItems: 'center', justifyContent: 'center' },
  statBtnTextSm:{ color: '#6c7086', fontSize: 14, fontWeight: '700', lineHeight: 16 },
  statMax:      { color: '#6c7086', fontSize: 14, fontWeight: '600', minWidth: 22, textAlign: 'center' },

  // Características
  caracRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#181825', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 7, marginBottom: 5 },
  caracText:   { color: '#cdd6f4', fontSize: 13, flex: 1 },
  caracRemove: { color: '#f38ba8', fontSize: 14, paddingLeft: 8 },
  caracAddRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  caracInput:  { flex: 1, backgroundColor: '#181825', borderRadius: 8, borderWidth: 1, borderColor: '#313244', color: '#cdd6f4', fontSize: 13, paddingHorizontal: 10, paddingVertical: 8 },
  caracAddBtn: { width: 38, height: 38, borderRadius: 8, backgroundColor: '#1d3a2f', borderWidth: 1, borderColor: '#a6e3a1', alignItems: 'center', justifyContent: 'center' },
  caracAddBtnText: { color: '#a6e3a1', fontSize: 20, fontWeight: '700', lineHeight: 24 },

  // Equipamentos
  equipRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#181825', borderRadius: 8, borderWidth: 1, borderColor: '#313244', paddingHorizontal: 12, paddingVertical: 10, marginBottom: 6 },
  equipName: { color: '#cdd6f4', fontSize: 13, fontWeight: '600' },
  equipObs:  { color: '#6c7086', fontSize: 11, marginTop: 2 },
  equipEdit: { fontSize: 14 },

  addLineBtn:     { borderRadius: 8, borderWidth: 1, borderColor: '#45475a', borderStyle: 'dashed', paddingVertical: 9, alignItems: 'center', marginTop: 2 },
  addLineBtnText: { color: '#6c7086', fontSize: 12, fontWeight: '700' },

  // Bolsa
  bolsaBox:    { backgroundColor: '#181825', borderRadius: 8, borderWidth: 1, borderColor: '#313244', padding: 10, marginBottom: 8 },
  bolsaHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  bolsaNome:   { color: '#cdd6f4', fontSize: 13, fontWeight: '700' },
  bolsaHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bolsaCap:    { color: '#6c7086', fontSize: 12, marginRight: 2 },
  miniBtn:     { width: 26, height: 26, borderRadius: 6, backgroundColor: '#2a2a3e', borderWidth: 1, borderColor: '#45475a', alignItems: 'center', justifyContent: 'center' },
  miniBtnText: { color: '#cdd6f4', fontSize: 12, fontWeight: '700' },
  bolsaGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  bolsaSlot:   { width: '48%', minHeight: 44, backgroundColor: '#1e1e2e', borderRadius: 6, borderWidth: 1, borderColor: '#313244', padding: 7, justifyContent: 'center' },
  bolsaSlotEmpty: { borderStyle: 'dashed', borderColor: '#2e2e4e', alignItems: 'center' },
  bolsaSlotName:  { color: '#cdd6f4', fontSize: 12, fontWeight: '600' },
  bolsaSlotObs:   { color: '#6c7086', fontSize: 10, marginTop: 1 },
  bolsaSlotPlus:  { color: '#313244', fontSize: 18, fontWeight: '300' },

  petDeleteBtn:     { marginTop: 16, backgroundColor: '#45273a', borderRadius: 8, paddingVertical: 11, alignItems: 'center' },
  petDeleteBtnText: { color: '#f38ba8', fontSize: 13, fontWeight: '700' },

  // Icon picker
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, marginBottom: 4 },
  iconBtn: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#181825', borderWidth: 1, borderColor: '#313244', alignItems: 'center', justifyContent: 'center' },
  iconBtnActive: { borderColor: '#89b4fa', backgroundColor: '#1d3052' },
  iconBtnText: { fontSize: 20 },

  // Tipo selector
  tipoRow:    { flexDirection: 'row', gap: 8, marginBottom: 8 },
  tipoBtn:    { flex: 1, backgroundColor: '#181825', borderRadius: 8, borderWidth: 1, borderColor: '#313244', paddingVertical: 8, alignItems: 'center' },
  tipoBtnText:{ color: '#6c7086', fontSize: 12, fontWeight: '600' },
  tipoBtnBig: { flex: 1, backgroundColor: '#181825', borderRadius: 12, borderWidth: 1, borderColor: '#313244', paddingVertical: 14, alignItems: 'center', gap: 3 },
  tipoBtnBigIcon:  { fontSize: 26 },
  tipoBtnBigLabel: { color: '#cdd6f4', fontSize: 13, fontWeight: '700' },
  tipoBtnBigHint:  { color: '#6c7086', fontSize: 10, textAlign: 'center' },

  newBtn:     { marginTop: 6, borderRadius: 12, borderWidth: 1.5, borderColor: '#6c7086', borderStyle: 'dashed', paddingVertical: 14, alignItems: 'center' },
  newBtnText: { color: '#6c7086', fontSize: 14, fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: 20 },
  modalSheet:   { backgroundColor: '#1e1e2e', borderRadius: 20, padding: 22, borderWidth: 1, borderColor: '#313244' },
  modalTitle:   { color: '#cdd6f4', fontSize: 20, fontWeight: '800', marginBottom: 16 },
  modalLabel:   { color: '#6c7086', fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 4 },
  modalInput:   { backgroundColor: '#181825', borderRadius: 10, borderWidth: 1, borderColor: '#313244', color: '#cdd6f4', fontSize: 15, padding: 12, marginBottom: 10 },
  modalBtns:    { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn:    { flex: 1, backgroundColor: '#313244', borderRadius: 10, padding: 13, alignItems: 'center' },
  cancelBtnText:{ color: '#6c7086', fontSize: 14, fontWeight: '600' },
  confirmBtn:   { flex: 2, backgroundColor: '#89b4fa', borderRadius: 10, padding: 13, alignItems: 'center' },
  confirmBtnText:{ color: '#11111b', fontSize: 14, fontWeight: '700' },
  deleteBtn:     { flex: 1, backgroundColor: '#45273a', borderRadius: 10, padding: 13, alignItems: 'center' },
  deleteBtnText: { color: '#f38ba8', fontSize: 14, fontWeight: '700' },
});
