import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Switch, Alert, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCharacter } from '../context/CharacterContext';
import { ARMOR_SLOTS, EQUIP_LABELS, ATTRIBUTE_LABELS, SKILL_LABELS } from '../data/initialCharacter';
import { TRAILS_ARMAS } from '../data/trailsData';
import ShopModal from '../components/ShopModal';

const ATTR_SUB_KEYS = ['forca','destreza','vigor','manha','carisma','etiqueta','percepcao','raciocinio','inteligencia'];
const RECOVERY_STATUS_KEYS = ['vida','energia','mana','forcaDeVontade','humanidade'];
const RECOVERY_STATUS_LABELS = { vida:'Vida', energia:'Energia', mana:'Mana', forcaDeVontade:'Força de Vontade', humanidade:'Humanidade' };

function formatPocaoEfeitoLabel(e) {
  if (e.tipo === 'status')    return `${RECOVERY_STATUS_LABELS[e.statusKey] ?? e.statusKey} +${e.delta}`;
  if (e.tipo === 'atributo')  return `${ATTRIBUTE_LABELS[e.subAttr] ?? e.subAttr} +${e.delta}`;
  if (e.tipo === 'texto')     return e.texto ?? '';
  return '';
}
const SKILL_KEYS    = Object.keys(SKILL_LABELS);
function tiraLabel(t) {
  if (t.tipo === 'atributo') return `${ATTRIBUTE_LABELS[t.subAttr] ?? t.subAttr} +${t.valor}`;
  if (t.tipo === 'pericia')  return `${SKILL_LABELS[t.skill]   ?? t.skill}   +${t.valor}`;
  return t.texto || '—';
}

// Agrupa trilhas por categoria (igual ao EquipmentScreen)
const WEAPONS_BY_CAT = TRAILS_ARMAS.reduce((map, t) => {
  if (!map[t.categoria]) map[t.categoria] = [];
  map[t.categoria].push(t);
  return map;
}, {});
function isMachadoId(id) { return WEAPONS_BY_CAT['MACHADOS']?.some(t => t.id === id) ?? false; }

const ITEM_TYPES = [
  { id: 'pocao',       label: 'Poção',       icon: '🧪' },
  { id: 'especial',    label: 'Item Especial',icon: '✨' },
  { id: 'arma',        label: 'Arma',         icon: '⚔️' },
  { id: 'equipamento', label: 'Equipamento',  icon: '🛡' },
  { id: 'acessorio',   label: 'Acessório',    icon: '💍' },
];

function inferType(item) {
  if (item.weaponData)    return 'arma';
  if (item.armorData)     return 'equipamento';
  if (item.accessoryData) return 'acessorio';
  if (item.especialData)  return 'especial';
  return 'pocao';
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
  const { character, dispatch } = useCharacter();
  const insets = useSafeAreaInsets();
  const isNew = !item.nome;

  // Passo: 'type' (só na criação) | 'form'
  const [step, setStep] = useState('type');
  const [tipo, setTipo] = useState('pocao');

  // Campos comuns
  const [nome, setNome] = useState('');
  const [obs,  setObs]  = useState('');

  // Arma
  const [wTrail,   setWTrail]   = useState('');
  const [wNivel,   setWNivel]   = useState(1);
  const [wDurMax,  setWDurMax]  = useState(10);
  const [wEfeitos, setWEfeitos] = useState('');
  const [wTiras,   setWTiras]   = useState([]);

  // Equipamento
  const [eSlot,     setESlot]     = useState('');
  const [eArmadura, setEArmadura] = useState(0);
  const [eResMag,   setEResMag]   = useState(0);
  const [eRep,      setERep]      = useState(0);
  const [eNivel,    setENivel]    = useState(1);
  const [eDurMax,   setEDurMax]   = useState(10);
  const [eEfeitos,  setEEfeitos]  = useState('');
  const [eTiras,    setETiras]    = useState([]);

  // Acessório
  const [aArmadura, setAArmadura] = useState(0);
  const [aResMag,   setAResMag]   = useState(0);
  const [aRep,      setARep]      = useState(0);
  const [aEfeitos,  setAEfeitos]  = useState('');
  const [aTiras,    setATiras]    = useState([]);

  // Poção e Item Especial (compartilham estrutura de efeitos)
  const [pSubtipo,   setPSubtipo]   = useState('recuperacao');
  const [pEfeitos,   setPEfeitos]   = useState([]);
  const [pDuracao,   setPDuracao]   = useState('');
  const [pFormKey,   setPFormKey]   = useState('');
  const [pFormVal,   setPFormVal]   = useState(1);
  const [pFormTexto, setPFormTexto] = useState('');
  const [pFormOpen,  setPFormOpen]  = useState(false);
  // Item Especial
  const [eDesc,      setEDesc]      = useState('');
  // form de nova tira (compartilhado para arma/equip/acessório)
  const [tiraTab,   setTiraTab]   = useState('atributo');
  const [tiraKey,   setTiraKey]   = useState('');
  const [tiraVal,   setTiraVal]   = useState(1);
  const [tiraTexto, setTiraTexto] = useState('');
  // qual campo de tiras está ativo ('wTiras' | 'eTiras' | 'aTiras')
  const [tiraTarget, setTiraTarget] = useState('aTiras');

  // Seleção de slot para equipar
  const [showEquip, setShowEquip] = useState(false);

  function resetTiraForm() { setTiraKey(''); setTiraVal(1); setTiraTexto(''); }

  function addTira() {
    let tira = null;
    if (tiraTab === 'atributo' && tiraKey) tira = { tipo: 'atributo', subAttr: tiraKey, valor: tiraVal };
    else if (tiraTab === 'pericia' && tiraKey) tira = { tipo: 'pericia', skill: tiraKey, valor: tiraVal };
    else if (tiraTab === 'narrativa' && tiraTexto.trim()) tira = { tipo: 'narrativa', texto: tiraTexto.trim() };
    if (!tira) return;
    if (tiraTarget === 'wTiras') setWTiras(a => [...a, tira]);
    else if (tiraTarget === 'eTiras') setETiras(a => [...a, tira]);
    else setATiras(a => [...a, tira]);
    resetTiraForm();
  }

  function removeTira(target, i) {
    if (target === 'wTiras') setWTiras(a => a.filter((_, j) => j !== i));
    else if (target === 'eTiras') setETiras(a => a.filter((_, j) => j !== i));
    else setATiras(a => a.filter((_, j) => j !== i));
  }

  useEffect(() => {
    if (!visible) return;
    setShowEquip(false); resetTiraForm();
    setPFormKey(''); setPFormVal(1); setPFormTexto(''); setPFormOpen(false);
    if (isNew) {
      setStep('type'); setTipo('pocao');
      setNome(''); setObs('');
      setWTrail(''); setWNivel(1); setWDurMax(10); setWEfeitos(''); setWTiras([]);
      setESlot(''); setEArmadura(0); setEResMag(0); setERep(0); setENivel(1); setEDurMax(10); setEEfeitos(''); setETiras([]);
      setAArmadura(0); setAResMag(0); setARep(0); setAEfeitos(''); setATiras([]);
      setPSubtipo('recuperacao'); setPEfeitos([]); setPDuracao('');
      setEDesc('');
    } else {
      const t = inferType(item);
      setTipo(t); setStep('form'); setNome(item.nome); setObs(item.obs ?? '');
      if (item.weaponData) {
        const wd = item.weaponData;
        setWTrail(wd.tipo ?? ''); setWNivel(wd.nivel ?? 1);
        setWDurMax(wd.durabilidadeMax ?? 10); setWEfeitos(wd.efeitos ?? '');
        setWTiras(wd.tiras ?? []);
      }
      if (item.armorData) {
        const ad = item.armorData;
        setESlot(ad.slot ?? ''); setEArmadura(ad.armadura ?? 0); setEResMag(ad.resMagica ?? 0);
        setERep(ad.reputacao ?? 0); setENivel(ad.nivel ?? 1);
        setEDurMax(ad.durabilidadeMax ?? 10); setEEfeitos(ad.efeitos ?? '');
        setETiras(ad.tiras ?? []);
      }
      if (item.accessoryData) {
        const ac = item.accessoryData;
        setAArmadura(ac.armadura ?? 0); setAResMag(ac.resMagica ?? 0); setARep(ac.reputacao ?? 0);
        setAEfeitos(ac.efeitos ?? ''); setATiras(ac.tiras ?? []);
      }
      if (t === 'pocao') {
        const pd = item.pocaoData;
        setPSubtipo(pd?.tipo ?? 'recuperacao');
        setPEfeitos(pd?.efeitos ?? []);
        setPDuracao(pd?.duracao ?? '');
      }
      if (t === 'especial') {
        const ed = item.especialData;
        setPSubtipo(ed?.tipo ?? 'narrativo');
        setPEfeitos(ed?.efeitos ?? []);
        setPDuracao(ed?.duracao ?? '');
        setEDesc(ed?.desc ?? '');
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
      dispatchItem('weaponData', {
        tipo: wTrail, tipo2: isMachadoId(wTrail) ? 'machado_do_sul' : '',
        dano: '', nivel: wNivel, durabilidade: wDurMax, durabilidadeMax: wDurMax,
        efeitos: wEfeitos, tiras: wTiras,
      });
      dispatchItem('armorData', null); dispatchItem('accessoryData', null);
      dispatchItem('especialData', null); dispatchItem('pocaoData', null); dispatchItem('obs', '');
    } else if (tipo === 'equipamento') {
      dispatchItem('armorData', {
        slot: eSlot, armadura: eArmadura, resMagica: eResMag, reputacao: eRep,
        nivel: eNivel, durabilidade: eDurMax, durabilidadeMax: eDurMax,
        efeitos: eEfeitos, tiras: eTiras,
      });
      dispatchItem('weaponData', null); dispatchItem('accessoryData', null);
      dispatchItem('especialData', null); dispatchItem('pocaoData', null); dispatchItem('obs', '');
    } else if (tipo === 'acessorio') {
      dispatchItem('accessoryData', {
        armadura: aArmadura, resMagica: aResMag, reputacao: aRep,
        efeitos: aEfeitos, tiras: aTiras,
      });
      dispatchItem('weaponData', null); dispatchItem('armorData', null);
      dispatchItem('especialData', null); dispatchItem('pocaoData', null); dispatchItem('obs', '');
    } else if (tipo === 'especial') {
      dispatchItem('especialData', { tipo: pSubtipo, efeitos: pEfeitos, duracao: pDuracao, desc: eDesc });
      dispatchItem('weaponData', null); dispatchItem('armorData', null); dispatchItem('accessoryData', null);
      dispatchItem('pocaoData', null); dispatchItem('obs', '');
    } else {
      dispatchItem('obs', obs);
      dispatchItem('pocaoData', pEfeitos.length > 0 ? { tipo: pSubtipo, efeitos: pEfeitos, duracao: pDuracao } : null);
      dispatchItem('weaponData', null); dispatchItem('armorData', null); dispatchItem('accessoryData', null);
      dispatchItem('especialData', null);
    }
    onClose();
  }

  function clear() {
    ['nome','obs','weaponData','armorData','accessoryData','pocaoData','especialData']
      .forEach(f => dispatchItem(f, f === 'nome' || f === 'obs' ? '' : null));
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

  function equipAccessoryTo(accIndex) {
    dispatch(storageId
      ? { type: 'EQUIP_ACCESSORY_FROM_INVENTORY', storageId, index, accIndex }
      : { type: 'EQUIP_ACCESSORY_FROM_INVENTORY', section,   index, accIndex });
    onClose();
  }

  // UI de tiras inline (arma, equipamento, acessório)
  function TirasSection({ target, tiras }) {
    const keys   = tiraTab === 'atributo' ? ATTR_SUB_KEYS : SKILL_KEYS;
    const labels = tiraTab === 'atributo' ? ATTRIBUTE_LABELS : SKILL_LABELS;
    const isActive = tiraTarget === target;
    return (
      <View style={styles.tirasSection}>
        <Text style={styles.itemModalLabel}>Bônus (Tiras de Couro)</Text>
        {tiras.map((t, i) => (
          <View key={i} style={styles.tiraRow}>
            <Text style={styles.tiraText}>{tiraLabel(t)}</Text>
            <TouchableOpacity onPress={() => removeTira(target, i)}>
              <Text style={styles.tiraRemove}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        {isActive ? (
          <>
            <View style={styles.tiraTabs}>
              {['atributo','pericia','narrativa'].map(t => (
                <TouchableOpacity key={t} style={[styles.tiraTab, tiraTab === t && styles.tiraTabActive]}
                  onPress={() => { setTiraTab(t); setTiraKey(''); }}>
                  <Text style={[styles.tiraTabText, tiraTab === t && styles.tiraTabTextActive]}>
                    {t === 'atributo' ? 'Atrib.' : t === 'pericia' ? 'Perícia' : 'Narrativa'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {tiraTab === 'narrativa' ? (
              <TextInput
                style={[styles.itemModalInput, { marginBottom: 8 }]}
                value={tiraTexto} onChangeText={setTiraTexto}
                placeholder="Ex: +5 dano cortante" placeholderTextColor="#45475a"
              />
            ) : (
              <>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                  {keys.map(k => (
                    <TouchableOpacity key={k} style={[styles.trailChip, tiraKey === k && styles.trailChipActive]}
                      onPress={() => setTiraKey(k)}>
                      <Text style={[styles.trailChipText, tiraKey === k && styles.trailChipTextActive]}>{labels[k] ?? k}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <NumStepper label="Bônus" value={tiraVal} onChange={setTiraVal} min={1} />
              </>
            )}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              <TouchableOpacity style={styles.tiraAddBtn} onPress={addTira}>
                <Text style={styles.tiraAddBtnText}>+ Adicionar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tiraCancelBtn} onPress={() => { setTiraTarget(''); resetTiraForm(); }}>
                <Text style={styles.tiraCancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TouchableOpacity style={styles.tiraOpenBtn}
            onPress={() => { setTiraTarget(target); setTiraTab('atributo'); resetTiraForm(); }}>
            <Text style={styles.tiraOpenBtnText}>+ Tira de bônus</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const canSave = nome.trim().length > 0;
  const typeLabel = ITEM_TYPES.find(t => t.id === tipo)?.label ?? '';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.itemModalOverlay}>
        <View style={[styles.itemModalSheet, insets.bottom > 0 && { paddingBottom: 36 + insets.bottom }]}>

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
                placeholder={`Nome d${tipo === 'arma' ? 'a arma' : tipo === 'equipamento' ? 'o equipamento' : tipo === 'acessorio' ? 'o acessório' : tipo === 'especial' ? 'o item' : 'a poção'}...`}
                placeholderTextColor="#45475a"
                autoFocus={isNew}
              />

              {/* ── Poção ── */}
              {tipo === 'pocao' && (
                <>
                  {/* Sub-tipo */}
                  <Text style={styles.itemModalLabel}>Tipo de Poção</Text>
                  <View style={styles.slotChipRow}>
                    {[
                      { id: 'recuperacao', label: '💊 Recuperação' },
                      { id: 'buff',        label: '⚗️ Buff' },
                      { id: 'narrativo',   label: '📖 Narrativo' },
                    ].map(t => (
                      <TouchableOpacity key={t.id}
                        style={[styles.trailChip, pSubtipo === t.id && styles.trailChipActive]}
                        onPress={() => { setPSubtipo(t.id); setPFormKey(''); setPFormOpen(false); }}>
                        <Text style={[styles.trailChipText, pSubtipo === t.id && styles.trailChipTextActive]}>{t.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Lista de efeitos */}
                  <Text style={styles.itemModalLabel}>Efeitos</Text>
                  {pEfeitos.map((e, i) => (
                    <View key={i} style={styles.tiraRow}>
                      <Text style={styles.tiraText}>{formatPocaoEfeitoLabel(e)}</Text>
                      <TouchableOpacity onPress={() => setPEfeitos(a => a.filter((_, j) => j !== i))}>
                        <Text style={styles.tiraRemove}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* Form de adicionar efeito */}
                  {pFormOpen ? (
                    <>
                      {pSubtipo === 'recuperacao' && (
                        <>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                            {RECOVERY_STATUS_KEYS.map(k => (
                              <TouchableOpacity key={k}
                                style={[styles.trailChip, pFormKey === k && styles.trailChipActive]}
                                onPress={() => setPFormKey(k)}>
                                <Text style={[styles.trailChipText, pFormKey === k && styles.trailChipTextActive]}>{RECOVERY_STATUS_LABELS[k]}</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                          <NumStepper label="Quantidade" value={pFormVal} onChange={setPFormVal} min={1} />
                        </>
                      )}
                      {pSubtipo === 'buff' && (
                        <>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                            {ATTR_SUB_KEYS.map(k => (
                              <TouchableOpacity key={k}
                                style={[styles.trailChip, pFormKey === k && styles.trailChipActive]}
                                onPress={() => setPFormKey(k)}>
                                <Text style={[styles.trailChipText, pFormKey === k && styles.trailChipTextActive]}>{ATTRIBUTE_LABELS[k] ?? k}</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                          <NumStepper label="Bônus" value={pFormVal} onChange={setPFormVal} min={1} />
                        </>
                      )}
                      {pSubtipo === 'narrativo' && (
                        <TextInput
                          style={[styles.itemModalInput, { marginBottom: 8 }]}
                          value={pFormTexto} onChangeText={setPFormTexto}
                          placeholder="Descreva o efeito narrativo..." placeholderTextColor="#45475a"
                        />
                      )}
                      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                        <TouchableOpacity style={styles.tiraAddBtn} onPress={() => {
                          let ef = null;
                          if (pSubtipo === 'recuperacao' && pFormKey) ef = { tipo: 'status', statusKey: pFormKey, delta: pFormVal };
                          else if (pSubtipo === 'buff' && pFormKey)   ef = { tipo: 'atributo', subAttr: pFormKey, delta: pFormVal };
                          else if (pSubtipo === 'narrativo' && pFormTexto.trim()) ef = { tipo: 'texto', texto: pFormTexto.trim() };
                          if (!ef) return;
                          setPEfeitos(a => [...a, ef]);
                          setPFormKey(''); setPFormVal(1); setPFormTexto('');
                        }}>
                          <Text style={styles.tiraAddBtnText}>+ Adicionar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.tiraCancelBtn} onPress={() => { setPFormOpen(false); setPFormKey(''); setPFormVal(1); setPFormTexto(''); }}>
                          <Text style={styles.tiraCancelBtnText}>Cancelar</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <TouchableOpacity style={styles.tiraOpenBtn} onPress={() => setPFormOpen(true)}>
                      <Text style={styles.tiraOpenBtnText}>+ Adicionar efeito</Text>
                    </TouchableOpacity>
                  )}

                  {/* Duração (buff e narrativo) */}
                  {(pSubtipo === 'buff' || pSubtipo === 'narrativo') && (
                    <>
                      <Text style={styles.itemModalLabel}>Duração (opcional)</Text>
                      <TextInput
                        style={styles.itemModalInput}
                        value={pDuracao} onChangeText={setPDuracao}
                        placeholder="Ex: 3 rodadas, 1 cena..." placeholderTextColor="#45475a"
                      />
                    </>
                  )}

                  {/* Observação livre */}
                  <Text style={styles.itemModalLabel}>Observação</Text>
                  <TextInput
                    style={[styles.itemModalInput, styles.itemModalInputObs]}
                    value={obs} onChangeText={setObs}
                    placeholder="Quantidade, notas extras..." placeholderTextColor="#45475a" multiline
                  />
                </>
              )}

              {/* ── Arma ── */}
              {tipo === 'arma' && (
                <>
                  <Text style={styles.itemModalLabel}>Tipo de Arma</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                    {Object.entries(WEAPONS_BY_CAT).map(([cat, trails]) => {
                      if (cat === 'MACHADOS') {
                        const active = isMachadoId(wTrail);
                        return (
                          <TouchableOpacity key={cat}
                            style={[styles.trailChip, active && styles.trailChipActive]}
                            onPress={() => setWTrail(active ? '' : 'machado_do_norte')}>
                            <Text style={[styles.trailChipText, active && styles.trailChipTextActive]}>Machado</Text>
                          </TouchableOpacity>
                        );
                      }
                      return trails.map(t => {
                        const active = wTrail === t.id;
                        return (
                          <TouchableOpacity key={t.id}
                            style={[styles.trailChip, active && styles.trailChipActive]}
                            onPress={() => setWTrail(active ? '' : t.id)}>
                            <Text style={[styles.trailChipText, active && styles.trailChipTextActive]}>{t.nome}</Text>
                          </TouchableOpacity>
                        );
                      });
                    })}
                  </ScrollView>
                  <NumStepper label="Nível"            value={wNivel}  onChange={setWNivel}  min={1} />
                  <NumStepper label="Durabilidade máx"  value={wDurMax} onChange={setWDurMax} min={1} />
                  <Text style={styles.itemModalLabel}>Efeitos</Text>
                  <TextInput
                    style={[styles.itemModalInput, styles.itemModalInputObs]}
                    value={wEfeitos} onChangeText={setWEfeitos}
                    placeholder="Efeitos especiais..." placeholderTextColor="#45475a" multiline
                  />
                  <TirasSection target="wTiras" tiras={wTiras} />
                </>
              )}

              {/* ── Equipamento ── */}
              {tipo === 'equipamento' && (
                <>
                  <Text style={styles.itemModalLabel}>Slot</Text>
                  <View style={styles.slotChipRow}>
                    {ARMOR_SLOTS.map(s => (
                      <TouchableOpacity key={s}
                        style={[styles.trailChip, eSlot === s && styles.trailChipActive]}
                        onPress={() => setESlot(eSlot === s ? '' : s)}>
                        <Text style={[styles.trailChipText, eSlot === s && styles.trailChipTextActive]}>{EQUIP_LABELS[s]}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <NumStepper label="Nível"            value={eNivel}    onChange={setENivel}    min={1} />
                  <NumStepper label="Armadura"          value={eArmadura} onChange={setEArmadura} />
                  <NumStepper label="Res. Mágica"       value={eResMag}   onChange={setEResMag}   />
                  <NumStepper label="Reputação"          value={eRep}      onChange={setERep}      />
                  <NumStepper label="Durabilidade máx"  value={eDurMax}   onChange={setEDurMax}   min={1} />
                  <Text style={styles.itemModalLabel}>Efeitos</Text>
                  <TextInput
                    style={[styles.itemModalInput, styles.itemModalInputObs]}
                    value={eEfeitos} onChangeText={setEEfeitos}
                    placeholder="Efeitos especiais..." placeholderTextColor="#45475a" multiline
                  />
                  <TirasSection target="eTiras" tiras={eTiras} />
                </>
              )}

              {/* ── Acessório ── */}
              {tipo === 'acessorio' && (
                <>
                  <Text style={styles.itemModalLabel}>Observação</Text>
                  <TextInput
                    style={[styles.itemModalInput, styles.itemModalInputObs]}
                    value={aEfeitos} onChangeText={setAEfeitos}
                    placeholder="Descrição, efeito narrativo..." placeholderTextColor="#45475a" multiline
                  />
                  <NumStepper label="Armadura"    value={aArmadura} onChange={setAArmadura} />
                  <NumStepper label="Res. Mágica" value={aResMag}   onChange={setAResMag}   />
                  <NumStepper label="Reputação"   value={aRep}      onChange={setARep}      />
                  <TirasSection target="aTiras" tiras={aTiras} />
                </>
              )}

              {/* ── Item Especial ── */}
              {tipo === 'especial' && (
                <>
                  <Text style={styles.itemModalLabel}>Características</Text>
                  <View style={styles.slotChipRow}>
                    {[
                      { id: 'narrativo', label: '📖 Narrativo' },
                      { id: 'buff',      label: '⚗️ Bônus' },
                    ].map(t => (
                      <TouchableOpacity key={t.id}
                        style={[styles.trailChip, pSubtipo === t.id && styles.trailChipActive]}
                        onPress={() => { setPSubtipo(t.id); setPFormKey(''); setPFormOpen(false); }}>
                        <Text style={[styles.trailChipText, pSubtipo === t.id && styles.trailChipTextActive]}>{t.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Descrição do item */}
                  <Text style={styles.itemModalLabel}>Descrição</Text>
                  <TextInput
                    style={[styles.itemModalInput, styles.itemModalInputObs]}
                    value={eDesc} onChangeText={setEDesc}
                    placeholder="Ex: Dente de lobo, Escama de dragão, Orbe iluminado..." placeholderTextColor="#45475a" multiline
                  />

                  {/* Efeitos */}
                  <Text style={styles.itemModalLabel}>Efeitos</Text>
                  {pEfeitos.map((e, i) => (
                    <View key={i} style={styles.tiraRow}>
                      <Text style={styles.tiraText}>{formatPocaoEfeitoLabel(e)}</Text>
                      <TouchableOpacity onPress={() => setPEfeitos(a => a.filter((_, j) => j !== i))}>
                        <Text style={styles.tiraRemove}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* Form de adicionar efeito */}
                  {pFormOpen ? (
                    <>
                      {pSubtipo === 'buff' && (
                        <>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                            {ATTR_SUB_KEYS.map(k => (
                              <TouchableOpacity key={k}
                                style={[styles.trailChip, pFormKey === k && styles.trailChipActive]}
                                onPress={() => setPFormKey(k)}>
                                <Text style={[styles.trailChipText, pFormKey === k && styles.trailChipTextActive]}>{ATTRIBUTE_LABELS[k] ?? k}</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                          <NumStepper label="Bônus" value={pFormVal} onChange={setPFormVal} min={1} />
                        </>
                      )}
                      {pSubtipo === 'narrativo' && (
                        <TextInput
                          style={[styles.itemModalInput, { marginBottom: 8 }]}
                          value={pFormTexto} onChangeText={setPFormTexto}
                          placeholder="Descreva o efeito..." placeholderTextColor="#45475a"
                        />
                      )}
                      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                        <TouchableOpacity style={styles.tiraAddBtn} onPress={() => {
                          let ef = null;
                          if (pSubtipo === 'buff' && pFormKey)   ef = { tipo: 'atributo', subAttr: pFormKey, delta: pFormVal };
                          else if (pSubtipo === 'narrativo' && pFormTexto.trim()) ef = { tipo: 'texto', texto: pFormTexto.trim() };
                          if (!ef) return;
                          setPEfeitos(a => [...a, ef]);
                          setPFormKey(''); setPFormVal(1); setPFormTexto('');
                        }}>
                          <Text style={styles.tiraAddBtnText}>+ Adicionar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.tiraCancelBtn} onPress={() => { setPFormOpen(false); setPFormKey(''); setPFormVal(1); setPFormTexto(''); }}>
                          <Text style={styles.tiraCancelBtnText}>Cancelar</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <TouchableOpacity style={styles.tiraOpenBtn} onPress={() => setPFormOpen(true)}>
                      <Text style={styles.tiraOpenBtnText}>+ Adicionar efeito</Text>
                    </TouchableOpacity>
                  )}

                  {/* Duração (quando ativado) */}
                  <Text style={styles.itemModalLabel}>Duração ao ativar (opcional)</Text>
                  <TextInput
                    style={styles.itemModalInput}
                    value={pDuracao} onChangeText={setPDuracao}
                    placeholder="Ex: 3 rodadas, 1 cena..." placeholderTextColor="#45475a"
                  />
                </>
              )}

              {/* ── Botão Equipar ── */}
              {!isNew && (
                showEquip ? (
                  <View style={styles.equipRowModal}>
                    {tipo === 'equipamento' ? (
                      ARMOR_SLOTS.map(slot => (
                        <TouchableOpacity key={slot} style={styles.equipHandBtn} onPress={() => equipArmorTo(slot)}>
                          <Text style={styles.equipHandBtnText}>{EQUIP_LABELS[slot]}</Text>
                        </TouchableOpacity>
                      ))
                    ) : tipo === 'acessorio' ? (
                      character.accessories.slice(0, character.titles?.acquired?.includes('recruta') ? 11 : 10).map((acc, i) => (
                        <TouchableOpacity key={i} style={styles.equipHandBtn} onPress={() => equipAccessoryTo(i)}>
                          <Text style={styles.equipHandBtnText}>{i + 1}{acc.nome ? ` · ${acc.nome}` : ''}</Text>
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
                ) : (tipo === 'arma' || tipo === 'equipamento' || tipo === 'acessorio') ? (
                  <TouchableOpacity style={styles.equipBtnModal} onPress={() => setShowEquip(true)}>
                    <Text style={styles.equipBtnText}>
                      {tipo === 'equipamento' ? '🛡 Equipar' : tipo === 'acessorio' ? '💍 Equipar' : '⚔ Equipar'}
                    </Text>
                  </TouchableOpacity>
                ) : null
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
  const { character, dispatch } = useCharacter();
  const [editing,    setEditing]    = useState(false);
  const [showEquip,  setShowEquip]  = useState(false);
  const isEmpty     = !item.nome;
  const isWeapon    = !!item.weaponData;
  const isArmor     = !!item.armorData;
  const isAccessory = !!item.accessoryData;
  const isEspecial  = !!item.especialData;
  const isPocaoAtiva = !isWeapon && !isArmor && !isAccessory && !isEspecial && !!item.pocaoData;

  function usarPocao() {
    const pd = item.pocaoData;
    if (!pd) return;
    if (pd.tipo === 'recuperacao') {
      dispatch({ type: 'USE_POTION_RECOVERY', efeitos: pd.efeitos ?? [] });
    } else {
      dispatch({ type: 'ADD_NARRATIVE_EFFECT', effect: {
        nome: item.nome,
        duracao: pd.duracao || '',
        linhas: pd.efeitos ?? [],
      }});
    }
  }

  function ativarEspecial() {
    const ed = item.especialData;
    if (!ed || ed.efeitos?.length === 0) return;
    dispatch({ type: 'ADD_NARRATIVE_EFFECT', effect: {
      nome: item.nome,
      duracao: ed.duracao || '',
      linhas: ed.efeitos ?? [],
    }});
  }

  function equipWeapon(slot) {
    dispatch(storageId
      ? { type: 'EQUIP_FROM_INVENTORY', storageId, index, slot }
      : { type: 'EQUIP_FROM_INVENTORY', section,   index, slot });
    setShowEquip(false);
  }
  function equipArmor(slot) {
    dispatch(storageId
      ? { type: 'EQUIP_ARMOR_FROM_INVENTORY', storageId, index, slot }
      : { type: 'EQUIP_ARMOR_FROM_INVENTORY', section,   index, slot });
    setShowEquip(false);
  }
  function equipAccessory(accIndex) {
    dispatch(storageId
      ? { type: 'EQUIP_ACCESSORY_FROM_INVENTORY', storageId, index, accIndex }
      : { type: 'EQUIP_ACCESSORY_FROM_INVENTORY', section,   index, accIndex });
    setShowEquip(false);
  }

  const designatedSlot = item.armorData?.slot; // slot definido na criação

  return (
    <>
      <TouchableOpacity
        style={[styles.slot, isEmpty && styles.slotEmpty]}
        onPress={() => { if (!showEquip) setEditing(true); }}
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
            {isAccessory && (
              <Text style={styles.accessoryTag}>
                💍{item.accessoryData.armadura > 0 ? ` 🛡${item.accessoryData.armadura}` : ''}
                {item.accessoryData.resMagica > 0 ? ` ✨${item.accessoryData.resMagica}` : ''}
                {item.accessoryData.tiras?.length > 0 ? `  🪢 ${item.accessoryData.tiras.length}` : ''}
              </Text>
            )}
            {isEspecial ? (
              <Text style={styles.slotObs} numberOfLines={2}>
                ✨{item.especialData.desc ? ` ${item.especialData.desc}` : ''}
                {item.especialData.efeitos?.length > 0 ? `  ${item.especialData.efeitos.map(e => formatPocaoEfeitoLabel(e)).join(', ')}` : ''}
              </Text>
            ) : !isWeapon && !isArmor && !isAccessory && item.pocaoData && item.pocaoData.efeitos?.length > 0 ? (
              <Text style={styles.slotObs} numberOfLines={1}>
                {item.pocaoData.tipo === 'recuperacao' ? '💊' : item.pocaoData.tipo === 'buff' ? '⚗️' : '📖'}{' '}
                {item.pocaoData.efeitos.map(e => formatPocaoEfeitoLabel(e)).join(', ')}
              </Text>
            ) : !isWeapon && !isArmor && !isAccessory && item.obs ? (
              <Text style={styles.slotObs} numberOfLines={1}>{item.obs}</Text>
            ) : null}

            {/* ── Botão usar poção inline ── */}
            {isPocaoAtiva && (
              <TouchableOpacity style={styles.usarPocaoBtn} onPress={usarPocao}>
                <Text style={styles.usarPocaoBtnText}>🧪 Usar</Text>
              </TouchableOpacity>
            )}
            {/* ── Botão ativar item especial inline ── */}
            {isEspecial && item.especialData?.efeitos?.length > 0 && (
              <TouchableOpacity style={styles.ativarEspecialBtn} onPress={ativarEspecial}>
                <Text style={styles.ativarEspecialBtnText}>✨ Ativar</Text>
              </TouchableOpacity>
            )}

            {/* ── Botões de equipar inline ── */}
            {(isWeapon || isArmor || isAccessory) && (
              showEquip ? (
                <View style={styles.inlineEquipRow}>
                  {isWeapon && (
                    <>
                      <TouchableOpacity style={styles.inlineEquipBtn} onPress={() => equipWeapon('maoDireita')}>
                        <Text style={styles.inlineEquipBtnText}>Mão D</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.inlineEquipBtn} onPress={() => equipWeapon('maoEsquerda')}>
                        <Text style={styles.inlineEquipBtnText}>Mão E</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {isArmor && ARMOR_SLOTS.map(slot => (
                    <TouchableOpacity
                      key={slot}
                      style={[styles.inlineEquipBtn, designatedSlot === slot && styles.inlineEquipBtnHighlight]}
                      onPress={() => equipArmor(slot)}
                    >
                      <Text style={[styles.inlineEquipBtnText, designatedSlot === slot && styles.inlineEquipBtnTextHighlight]}>
                        {EQUIP_LABELS[slot]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {isAccessory && [0,1,2,3,4,5,6,7,8,9].map(i => (
                    <TouchableOpacity key={i} style={styles.inlineEquipBtn} onPress={() => equipAccessory(i)}>
                      <Text style={styles.inlineEquipBtnText}>{i + 1}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity onPress={() => setShowEquip(false)}>
                    <Text style={styles.inlineEquipCancel}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.inlineEquipToggle}
                  onPress={() => setShowEquip(true)}
                >
                  <Text style={styles.inlineEquipToggleText}>
                    {isArmor && designatedSlot
                      ? `🛡 ${EQUIP_LABELS[designatedSlot]}`
                      : isArmor ? '🛡 Equipar'
                      : isWeapon ? '⚔ Equipar'
                      : '💍 Equipar'}
                  </Text>
                </TouchableOpacity>
              )
            )}
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
  const [showShop, setShowShop]             = useState(false);

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

      {/* ── Botão de Lojas ── */}
      <TouchableOpacity style={styles.shopBtn} onPress={() => setShowShop(true)}>
        <Text style={styles.shopBtnIcon}>🛒</Text>
        <Text style={styles.shopBtnText}>Lojas</Text>
        <Text style={styles.shopBtnHint}>catálogo · {moedas} 🪙</Text>
      </TouchableOpacity>
      <ShopModal visible={showShop} onClose={() => setShowShop(false)} />

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

  shopBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#1e1e2e', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    marginBottom: 14, borderWidth: 1, borderColor: '#89b4fa55',
  },
  shopBtnIcon: { fontSize: 20 },
  shopBtnText: { color: '#89b4fa', fontSize: 14, fontWeight: '700', flex: 1 },
  shopBtnHint: { color: '#6c7086', fontSize: 11 },

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
  weaponTag:    { color: '#fab387', fontSize: 10, fontWeight: '600', marginTop: 2 },
  armorTag:     { color: '#89b4fa', fontSize: 10, fontWeight: '600', marginTop: 2 },
  accessoryTag: { color: '#cba6f7', fontSize: 10, fontWeight: '600', marginTop: 2 },

  slotChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },

  // Tiras inline
  tirasSection:   { marginBottom: 14 },
  tiraRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#181825', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 4 },
  tiraText:       { color: '#cdd6f4', fontSize: 12, flex: 1 },
  tiraRemove:     { color: '#f38ba8', fontSize: 14, paddingLeft: 8 },
  tiraTabs:       { flexDirection: 'row', gap: 6, marginBottom: 8 },
  tiraTab:        { flex: 1, backgroundColor: '#181825', borderRadius: 6, paddingVertical: 6, alignItems: 'center', borderWidth: 1, borderColor: '#313244' },
  tiraTabActive:  { backgroundColor: '#1d3a2f', borderColor: '#a6e3a1' },
  tiraTabText:    { color: '#6c7086', fontSize: 11, fontWeight: '600' },
  tiraTabTextActive: { color: '#a6e3a1' },
  tiraAddBtn:     { flex: 1, backgroundColor: '#1d4d3a', borderRadius: 7, paddingVertical: 8, alignItems: 'center' },
  tiraAddBtnText: { color: '#a6e3a1', fontSize: 13, fontWeight: '700' },
  tiraCancelBtn:  { backgroundColor: '#313244', borderRadius: 7, paddingVertical: 8, paddingHorizontal: 16, alignItems: 'center' },
  tiraCancelBtnText: { color: '#6c7086', fontSize: 13 },
  tiraOpenBtn:    { borderRadius: 7, borderWidth: 1, borderColor: '#313244', borderStyle: 'dashed', paddingVertical: 8, alignItems: 'center', marginBottom: 8 },
  tiraOpenBtnText:{ color: '#6c7086', fontSize: 12, fontWeight: '600' },

  // Equip inline no slot
  inlineEquipToggle:         { marginTop: 6, alignSelf: 'flex-start', backgroundColor: '#1d3052', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  inlineEquipToggleText:     { color: '#89b4fa', fontSize: 10, fontWeight: '700' },
  usarPocaoBtn:              { marginTop: 6, alignSelf: 'flex-start', backgroundColor: '#1a3828', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  usarPocaoBtnText:          { color: '#a6e3a1', fontSize: 10, fontWeight: '700' },
  ativarEspecialBtn:         { marginTop: 6, alignSelf: 'flex-start', backgroundColor: '#2a2040', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  ativarEspecialBtnText:     { color: '#cba6f7', fontSize: 10, fontWeight: '700' },
  inlineEquipRow:            { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6, alignItems: 'center' },
  inlineEquipBtn:            { backgroundColor: '#1d3a2f', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 3 },
  inlineEquipBtnHighlight:   { backgroundColor: '#2d5a3a', borderWidth: 1, borderColor: '#a6e3a1' },
  inlineEquipBtnText:        { color: '#a6e3a1', fontSize: 10, fontWeight: '700' },
  inlineEquipBtnTextHighlight: { color: '#a6e3a1' },
  inlineEquipCancel:         { color: '#45475a', fontSize: 13, paddingHorizontal: 4 },

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
