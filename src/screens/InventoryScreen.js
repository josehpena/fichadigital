import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Switch, Alert, Modal,
} from 'react-native';
import { useCharacter } from '../context/CharacterContext';
import { ARMOR_SLOTS, EQUIP_LABELS } from '../data/initialCharacter';
import { TRAILS_ARMAS } from '../data/trailsData';

// Agrupa trilhas por categoria (igual ao EquipmentScreen)
const WEAPONS_BY_CAT = TRAILS_ARMAS.reduce((map, t) => {
  if (!map[t.categoria]) map[t.categoria] = [];
  map[t.categoria].push(t);
  return map;
}, {});
function isMachadoId(id) { return WEAPONS_BY_CAT['MACHADOS']?.some(t => t.id === id) ?? false; }

const ITEM_TYPES = [
  { id: 'pocao',       label: 'Poção',       icon: '🧪' },
  { id: 'arma',        label: 'Arma',         icon: '⚔️' },
  { id: 'equipamento', label: 'Equipamento',  icon: '🛡' },
  { id: 'acessorio',   label: 'Acessório',    icon: '💍' },
];

function inferType(item) {
  if (item.weaponData) return 'arma';
  if (item.armorData)  return 'equipamento';
  return 'pocao'; // genérico / poção / acessório → tratados igual por ora
}

// ── Stepper numérico reutilizável ──────────────────────────────────────────────
function NumStepper({ label, value, onChange, min = 0 }) {
  return (
    <View style={styles.stepperRow}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <TouchableOpacity style={styles.stepperBtn} onPress={() => onChange(Math.max(min, value - 1))}>
          <Text style={styles.stepperBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.stepperVal}>{value}</Text>
        <TouchableOpacity style={styles.stepperBtn} onPress={() => onChange(value + 1)}>
          <Text style={styles.stepperBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Item Modal (criação + edição) ──────────────────────────────────────────────
function ItemModal({ visible, item, index, section, storageId, onClose }) {
  const { dispatch } = useCharacter();
  const isNew = !item.nome;

  // Passo: 'type' (só na criação) | 'form'
  const [step,  setStep]  = useState('type');
  const [tipo,  setTipo]  = useState('pocao');

  // Campos comuns
  const [nome,    setNome]    = useState('');
  const [obs,     setObs]     = useState('');
  // Arma
  const [wTrail,  setWTrail]  = useState('');          // trail id
  const [wNivel,  setWNivel]  = useState(1);
  const [wDurMax, setWDurMax] = useState(10);
  const [wEfeitos,setWEfeitos]= useState('');
  // Equipamento
  const [eArmadura,setEArmadura] = useState(0);
  const [eResMag,  setEResMag]   = useState(0);
  const [eRep,     setERep]      = useState(0);
  const [eNivel,   setENivel]    = useState(1);
  const [eDurMax,  setEDurMax]   = useState(10);
  const [eEfeitos, setEEfeitos]  = useState('');

  // Seleção de slot para equipar (edição)
  const [showEquip, setShowEquip] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setShowEquip(false);
    if (isNew) {
      setStep('type'); setTipo('pocao');
      setNome(''); setObs('');
      setWTrail(''); setWNivel(1); setWDurMax(10); setWEfeitos('');
      setEArmadura(0); setEResMag(0); setERep(0); setENivel(1); setEDurMax(10); setEEfeitos('');
    } else {
      const t = inferType(item);
      setTipo(t); setStep('form');
      setNome(item.nome);
      setObs(item.obs ?? '');
      if (item.weaponData) {
        const wd = item.weaponData;
        setWTrail(wd.tipo ?? '');
        setWNivel(wd.nivel ?? 1);
        setWDurMax(wd.durabilidadeMax ?? 10);
        setWEfeitos(wd.efeitos ?? '');
      }
      if (item.armorData) {
        const ad = item.armorData;
        setEArmadura(ad.armadura ?? 0);
        setEResMag(ad.resMagica ?? 0);
        setERep(ad.reputacao ?? 0);
        setENivel(ad.nivel ?? 1);
        setEDurMax(ad.durabilidadeMax ?? 10);
        setEEfeitos(ad.efeitos ?? '');
      }
    }
  }, [visible]);

  function dispatchItem(field, value) {
    dispatch(storageId
      ? { type: 'INVENTORY_SET_STORAGE_ITEM', storageId, index, field, value }
      : { type: 'INVENTORY_SET_ITEM', section, index, field, value });
  }

  function save() {
    dispatchItem('nome', nome.trim());
    if (tipo === 'arma') {
      const tipo2 = isMachadoId(wTrail) ? 'machado_do_sul' : '';
      dispatchItem('weaponData', {
        tipo: wTrail, tipo2,
        dano: '', nivel: wNivel,
        durabilidade: wDurMax, durabilidadeMax: wDurMax,
        efeitos: wEfeitos, tiras: [],
      });
      dispatchItem('armorData', null);
      dispatchItem('obs', '');
    } else if (tipo === 'equipamento') {
      dispatchItem('armorData', {
        armadura: eArmadura, resMagica: eResMag, reputacao: eRep,
        nivel: eNivel, durabilidade: eDurMax, durabilidadeMax: eDurMax,
        efeitos: eEfeitos, tiras: [],
      });
      dispatchItem('weaponData', null);
      dispatchItem('obs', '');
    } else {
      dispatchItem('obs', obs);
      dispatchItem('weaponData', null);
      dispatchItem('armorData', null);
    }
    onClose();
  }

  function clear() {
    ['nome','obs','weaponData','armorData'].forEach(f => dispatchItem(f, f === 'nome' || f === 'obs' ? '' : null));
    onClose();
  }

  function equipWeaponTo(slot) {
    dispatch(storageId
      ? { type: 'EQUIP_FROM_INVENTORY', storageId, index, slot }
      : { type: 'EQUIP_FROM_INVENTORY', section,   index, slot });
    onClose();
  }

  function equipArmorTo(slot) {
    dispatch(storageId
      ? { type: 'EQUIP_ARMOR_FROM_INVENTORY', storageId, index, slot }
      : { type: 'EQUIP_ARMOR_FROM_INVENTORY', section,   index, slot });
    onClose();
  }

  const canSave = nome.trim().length > 0;
  const typeLabel = ITEM_TYPES.find(t => t.id === tipo)?.label ?? '';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.itemModalOverlay}>
        <View style={styles.itemModalSheet}>

          {/* Cabeçalho */}
          <View style={styles.itemModalHeader}>
            {step === 'form' && !isNew && <Text style={styles.itemModalTitle}>Editar {typeLabel}</Text>}
            {step === 'form' &&  isNew && (
              <TouchableOpacity onPress={() => setStep('type')} style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 6 }}>
                <Text style={{ color: '#6c7086', fontSize: 16 }}>‹</Text>
                <Text style={styles.itemModalTitle}>
                  {ITEM_TYPES.find(t => t.id === tipo)?.icon} Novo {typeLabel}
                </Text>
              </TouchableOpacity>
            )}
            {step === 'type' && <Text style={styles.itemModalTitle}>Tipo de Item</Text>}
            <TouchableOpacity onPress={onClose}><Text style={styles.itemModalClose}>✕</Text></TouchableOpacity>
          </View>

          {/* ── Passo 1: seleção de tipo ── */}
          {step === 'type' && (
            <View style={styles.typeGrid}>
              {ITEM_TYPES.map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={styles.typeBtn}
                  onPress={() => { setTipo(t.id); setStep('form'); }}
                >
                  <Text style={styles.typeBtnIcon}>{t.icon}</Text>
                  <Text style={styles.typeBtnLabel}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ── Passo 2: formulário ── */}
          {step === 'form' && (
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              {/* Nome */}
              <Text style={styles.itemModalLabel}>Nome</Text>
              <TextInput
                style={styles.itemModalInput}
                value={nome}
                onChangeText={setNome}
                placeholder={`Nome d${tipo === 'arma' ? 'a arma' : tipo === 'equipamento' ? 'o equipamento' : tipo === 'acessorio' ? 'o acessório' : 'a poção'}...`}
                placeholderTextColor="#45475a"
                autoFocus={isNew}
              />

              {/* Campos específicos por tipo */}
              {(tipo === 'pocao' || tipo === 'acessorio') && (
                <>
                  <Text style={styles.itemModalLabel}>Observação</Text>
                  <TextInput
                    style={[styles.itemModalInput, styles.itemModalInputObs]}
                    value={obs}
                    onChangeText={setObs}
                    placeholder="Descrição, quantidade, efeito..."
                    placeholderTextColor="#45475a"
                    multiline
                  />
                </>
              )}

              {tipo === 'arma' && (
                <>
                  <Text style={styles.itemModalLabel}>Tipo de Arma</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                    {Object.entries(WEAPONS_BY_CAT).map(([cat, trails]) => {
                      if (cat === 'MACHADOS') {
                        const active = isMachadoId(wTrail);
                        return (
                          <TouchableOpacity
                            key={cat}
                            style={[styles.trailChip, active && styles.trailChipActive]}
                            onPress={() => setWTrail(active ? '' : 'machado_do_norte')}
                          >
                            <Text style={[styles.trailChipText, active && styles.trailChipTextActive]}>Machado</Text>
                          </TouchableOpacity>
                        );
                      }
                      return trails.map(t => {
                        const active = wTrail === t.id;
                        return (
                          <TouchableOpacity
                            key={t.id}
                            style={[styles.trailChip, active && styles.trailChipActive]}
                            onPress={() => setWTrail(active ? '' : t.id)}
                          >
                            <Text style={[styles.trailChipText, active && styles.trailChipTextActive]}>{t.nome}</Text>
                          </TouchableOpacity>
                        );
                      });
                    })}
                  </ScrollView>
                  <NumStepper label="Nível"          value={wNivel}  onChange={setWNivel}  min={1} />
                  <NumStepper label="Durabilidade máx" value={wDurMax} onChange={setWDurMax} min={1} />
                  <Text style={styles.itemModalLabel}>Efeitos</Text>
                  <TextInput
                    style={[styles.itemModalInput, styles.itemModalInputObs]}
                    value={wEfeitos}
                    onChangeText={setWEfeitos}
                    placeholder="Efeitos especiais..."
                    placeholderTextColor="#45475a"
                    multiline
                  />
                </>
              )}

              {tipo === 'equipamento' && (
                <>
                  <NumStepper label="Nível"          value={eNivel}    onChange={setENivel}    min={1} />
                  <NumStepper label="Armadura"        value={eArmadura} onChange={setEArmadura} />
                  <NumStepper label="Res. Mágica"     value={eResMag}   onChange={setEResMag}   />
                  <NumStepper label="Reputação"       value={eRep}      onChange={setERep}      />
                  <NumStepper label="Durabilidade máx" value={eDurMax}  onChange={setEDurMax}   min={1} />
                  <Text style={styles.itemModalLabel}>Efeitos</Text>
                  <TextInput
                    style={[styles.itemModalInput, styles.itemModalInputObs]}
                    value={eEfeitos}
                    onChangeText={setEEfeitos}
                    placeholder="Efeitos especiais..."
                    placeholderTextColor="#45475a"
                    multiline
                  />
                </>
              )}

              {/* Botão Equipar (só na edição de arma/equipamento) */}
              {!isNew && (tipo === 'arma' || tipo === 'equipamento') && (
                showEquip ? (
                  <View style={styles.equipRowModal}>
                    {tipo === 'equipamento' ? (
                      ARMOR_SLOTS.map(slot => (
                        <TouchableOpacity key={slot} style={styles.equipHandBtn} onPress={() => equipArmorTo(slot)}>
                          <Text style={styles.equipHandBtnText}>{EQUIP_LABELS[slot]}</Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <>
                        <TouchableOpacity style={styles.equipHandBtn} onPress={() => equipWeaponTo('maoDireita')}>
                          <Text style={styles.equipHandBtnText}>Mão D</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.equipHandBtn} onPress={() => equipWeaponTo('maoEsquerda')}>
                          <Text style={styles.equipHandBtnText}>Mão E</Text>
                        </TouchableOpacity>
                      </>
                    )}
                    <TouchableOpacity onPress={() => setShowEquip(false)}>
                      <Text style={styles.equipCancelText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.equipBtnModal} onPress={() => setShowEquip(true)}>
                    <Text style={styles.equipBtnText}>{tipo === 'equipamento' ? '🛡 Equipar' : '⚔ Equipar'}</Text>
                  </TouchableOpacity>
                )
              )}

              {/* Ações */}
              <View style={styles.itemModalActions}>
                {!isNew && (
                  <TouchableOpacity style={styles.itemModalClearBtn} onPress={clear}>
                    <Text style={styles.itemModalClearText}>Limpar</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.itemModalSaveBtn, !canSave && styles.itemModalSaveBtnDisabled]}
                  onPress={save}
                  disabled={!canSave}
                >
                  <Text style={styles.itemModalSaveText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ── Item Slot ─────────────────────────────────────────────────────────────────
function ItemSlot({ index, item, section, storageId, placeholder }) {
  const [editing, setEditing] = useState(false);
  const isEmpty  = !item.nome;
  const isArmor  = !!item.armorData;
  const isWeapon = !!item.weaponData;

  return (
    <>
      <TouchableOpacity
        style={[styles.slot, isEmpty && styles.slotEmpty]}
        onPress={() => setEditing(true)}
        activeOpacity={0.7}
      >
        {isEmpty ? (
          <Text style={styles.slotPlaceholder}>{placeholder ?? '+'}</Text>
        ) : (
          <>
            <Text style={styles.slotName} numberOfLines={2}>{item.nome}</Text>
            {isWeapon && (
              <Text style={styles.weaponTag}>
                ⚔{item.weaponData.nivel > 1 ? ` Nv ${item.weaponData.nivel}` : ''}
                {item.weaponData.tiras?.length > 0 ? `  🪢 ${item.weaponData.tiras.length}` : ''}
              </Text>
            )}
            {isArmor && (
              <Text style={styles.armorTag}>
                🛡{item.armorData.armadura > 0 ? ` ${item.armorData.armadura}` : ''}
                {item.armorData.resMagica > 0 ? `  ✨ ${item.armorData.resMagica}` : ''}
                {item.armorData.nivel > 1 ? `  Nv ${item.armorData.nivel}` : ''}
                {item.armorData.tiras?.length > 0 ? `  🪢 ${item.armorData.tiras.length}` : ''}
              </Text>
            )}
            {!isWeapon && !isArmor && item.obs ? (
              <Text style={styles.slotObs} numberOfLines={1}>{item.obs}</Text>
            ) : null}
          </>
        )}
      </TouchableOpacity>
      <ItemModal
        visible={editing}
        item={item}
        index={index}
        section={section}
        storageId={storageId}
        onClose={() => setEditing(false)}
      />
    </>
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
        <Text style={styles.sectionTitle}>💰 Gargas</Text>
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
    padding: 8, minHeight: 52,
  },
  slotEmpty:       { borderStyle: 'dashed', borderColor: '#2e2e4e', justifyContent: 'center', alignItems: 'center' },
  slotPlaceholder: { color: '#313244', fontSize: 22, fontWeight: '300' },
  slotName:        { color: '#cdd6f4', fontSize: 13, fontWeight: '600' },
  slotObs:         { color: '#6c7086', fontSize: 10, marginTop: 2 },
  weaponTag:       { color: '#fab387', fontSize: 10, fontWeight: '600', marginTop: 2 },
  armorTag:        { color: '#89b4fa', fontSize: 10, fontWeight: '600', marginTop: 2 },

  // Item modal
  itemModalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  itemModalSheet: {
    backgroundColor: '#1e1e2e', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 36, maxHeight: '85%',
    borderTopWidth: 1, borderColor: '#313244',
  },
  itemModalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  itemModalTitle:  { color: '#cdd6f4', fontSize: 16, fontWeight: '700', flex: 1 },
  itemModalClose:  { color: '#6c7086', fontSize: 18, padding: 4 },

  // Seleção de tipo
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  typeBtn: {
    width: '47%', backgroundColor: '#181825', borderRadius: 12,
    borderWidth: 1, borderColor: '#313244',
    paddingVertical: 20, alignItems: 'center', gap: 6,
  },
  typeBtnIcon:  { fontSize: 28 },
  typeBtnLabel: { color: '#cdd6f4', fontSize: 14, fontWeight: '600' },

  // Formulário
  itemModalLabel: { color: '#6c7086', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  itemModalInput: {
    backgroundColor: '#181825', borderRadius: 8, borderWidth: 1, borderColor: '#313244',
    color: '#cdd6f4', fontSize: 15, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 14,
  },
  itemModalInputObs: { minHeight: 64, textAlignVertical: 'top' },

  // Trail chips (seleção de arma)
  trailChip: {
    backgroundColor: '#181825', borderRadius: 8, borderWidth: 1, borderColor: '#313244',
    paddingHorizontal: 12, paddingVertical: 6, marginRight: 6,
  },
  trailChipActive:    { backgroundColor: '#1d3a2f', borderColor: '#a6e3a1' },
  trailChipText:      { color: '#6c7086', fontSize: 12, fontWeight: '600' },
  trailChipTextActive:{ color: '#a6e3a1' },

  // Stepper numérico
  stepperRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  stepperLabel:   { color: '#cdd6f4', fontSize: 14, flex: 1 },
  stepperControls:{ flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepperBtn:     { backgroundColor: '#313244', borderRadius: 6, width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  stepperBtnText: { color: '#cdd6f4', fontSize: 16, fontWeight: '700', lineHeight: 20 },
  stepperVal:     { color: '#cdd6f4', fontSize: 15, fontWeight: '700', minWidth: 24, textAlign: 'center' },

  // Ações
  itemModalActions:{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  itemModalClearBtn: {
    borderRadius: 8, borderWidth: 1, borderColor: '#45273a',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  itemModalClearText: { color: '#f38ba8', fontSize: 14, fontWeight: '600' },
  itemModalSaveBtn: {
    backgroundColor: '#1d4d3a', borderRadius: 8,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  itemModalSaveBtnDisabled: { opacity: 0.4 },
  itemModalSaveText: { color: '#a6e3a1', fontSize: 14, fontWeight: '700' },

  equipBtnModal:   { marginTop: 4, marginBottom: 12, backgroundColor: '#1d3052', borderRadius: 5, paddingHorizontal: 8, paddingVertical: 5, alignSelf: 'flex-start' },
  equipBtnText:    { color: '#89b4fa', fontSize: 11, fontWeight: '700' },
  equipRowModal:   { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 12 },
  equipHandBtn:    { backgroundColor: '#1d3a2f', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 4 },
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
