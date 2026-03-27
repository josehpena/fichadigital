import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  Modal, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCharacter } from '../context/CharacterContext';
import {
  ARMOR_SLOTS, HAND_SLOTS, EQUIP_LABELS, computeDefenseTotals,
  ATTRIBUTE_LABELS, SKILL_LABELS,
} from '../data/initialCharacter';
import { TRAILS_ARMAS } from '../data/trailsData';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Agrupa trilhas de arma por categoria para exibição no picker
function getWeaponsByCat() {
  const map = {};
  for (const trail of TRAILS_ARMAS) {
    if (!map[trail.categoria]) map[trail.categoria] = [];
    map[trail.categoria].push(trail);
  }
  return map;
}
const WEAPONS_BY_CAT = getWeaponsByCat();

// Lookup de nome de trilha pelo id
function trailName(id) {
  if (!id) return '';
  for (const trails of Object.values(WEAPONS_BY_CAT)) {
    const t = trails.find(t => t.id === id);
    if (t) return t.nome;
  }
  return id;
}

// Verifica se um trail ID pertence à categoria MACHADOS
function isMachadoId(id) {
  return WEAPONS_BY_CAT['MACHADOS']?.some(t => t.id === id) ?? false;
}

const ATTR_SUB_KEYS = ['forca', 'destreza', 'vigor', 'manha', 'carisma', 'etiqueta', 'percepcao', 'raciocinio', 'inteligencia'];
const SKILL_KEYS    = Object.keys(SKILL_LABELS);

// ─── Tira Label ───────────────────────────────────────────────────────────────
function tiraLabel(t) {
  if (t.tipo === 'atributo') return `${ATTRIBUTE_LABELS[t.subAttr] ?? t.subAttr} +${t.valor}`;
  if (t.tipo === 'pericia')  return `${SKILL_LABELS[t.skill] ?? t.skill} +${t.valor}`;
  return t.texto || '—';
}

// ─── Modal de Tiras de Couro ──────────────────────────────────────────────────
// slotKey: chave do slot de equipamento (se for equipamento)
// accIndex: índice do acessório (se for acessório)
function TirasModal({ visible, slotKey, accIndex, tiras, onClose }) {
  const { dispatch } = useCharacter();
  const insets = useSafeAreaInsets();
  const [tab, setTab]         = useState('atributo'); // atributo | pericia | narrativa
  const [selKey, setSelKey]   = useState('');
  const [valor, setValor]     = useState('1');
  const [texto, setTexto]     = useState('');

  const isAcc = accIndex !== undefined;

  function addTira() {
    let tira = null;
    if (tab === 'atributo' && selKey) {
      tira = { tipo: 'atributo', subAttr: selKey, valor: parseInt(valor) || 1 };
    } else if (tab === 'pericia' && selKey) {
      tira = { tipo: 'pericia', skill: selKey, valor: parseInt(valor) || 1 };
    } else if (tab === 'narrativa' && texto.trim()) {
      tira = { tipo: 'narrativa', texto: texto.trim() };
    }
    if (!tira) return;
    if (isAcc) {
      dispatch({ type: 'ADD_ACC_TIRA', index: accIndex, tira });
    } else {
      dispatch({ type: 'ADD_EQUIP_TIRA', slot: slotKey, tira });
    }
    setSelKey(''); setValor('1'); setTexto('');
  }

  function removeTira(i) {
    if (isAcc) {
      dispatch({ type: 'REMOVE_ACC_TIRA', index: accIndex, tiraIndex: i });
    } else {
      dispatch({ type: 'REMOVE_EQUIP_TIRA', slot: slotKey, index: i });
    }
  }

  const keys = tab === 'atributo' ? ATTR_SUB_KEYS : SKILL_KEYS;
  const labels = tab === 'atributo' ? ATTRIBUTE_LABELS : SKILL_LABELS;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={ms.overlay}>
        <View style={[ms.sheet, { paddingBottom: 20 + insets.bottom }]}>
          <View style={ms.sheetHeader}>
            <Text style={ms.sheetTitle}>🪢 Tiras de Couro</Text>
            <TouchableOpacity onPress={onClose}><Text style={ms.closeBtn}>✕</Text></TouchableOpacity>
          </View>

          {/* Lista de tiras existentes */}
          {tiras.length > 0 && (
            <View style={ms.tiraList}>
              {tiras.map((t, i) => (
                <View key={i} style={ms.tiraRow}>
                  <Text style={ms.tiraLabel}>{tiraLabel(t)}</Text>
                  <TouchableOpacity
                    style={ms.removeBtn}
                    onPress={() => removeTira(i)}
                  >
                    <Text style={ms.removeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Tabs de tipo */}
          <View style={ms.tabs}>
            {['atributo', 'pericia', 'narrativa'].map(t => (
              <TouchableOpacity
                key={t} style={[ms.tab, tab === t && ms.tabActive]}
                onPress={() => { setTab(t); setSelKey(''); }}
              >
                <Text style={[ms.tabText, tab === t && ms.tabTextActive]}>
                  {t === 'atributo' ? 'Atributo' : t === 'pericia' ? 'Perícia' : 'Narrativa'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {tab === 'narrativa' ? (
            <View style={ms.addSection}>
              <TextInput
                style={ms.narrativaInput}
                value={texto}
                onChangeText={setTexto}
                placeholder="Descreva o efeito narrativo..."
                placeholderTextColor="#45475a"
                multiline
              />
            </View>
          ) : (
            <View style={ms.addSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={ms.keyPicker}>
                {keys.map(k => (
                  <TouchableOpacity
                    key={k} style={[ms.keyChip, selKey === k && ms.keyChipActive]}
                    onPress={() => setSelKey(k)}
                  >
                    <Text style={[ms.keyChipText, selKey === k && ms.keyChipTextActive]}>
                      {labels[k] ?? k}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={ms.valorRow}>
                <Text style={ms.valorLabel}>Bônus:</Text>
                <TouchableOpacity style={ms.numBtn} onPress={() => setValor(v => String(Math.max(1, parseInt(v) - 1)))}>
                  <Text style={ms.numBtnTxt}>−</Text>
                </TouchableOpacity>
                <Text style={ms.valorVal}>{valor}</Text>
                <TouchableOpacity style={ms.numBtn} onPress={() => setValor(v => String(parseInt(v) + 1))}>
                  <Text style={ms.numBtnTxt}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity style={ms.addBtn} onPress={addTira}>
            <Text style={ms.addBtnText}>+ Adicionar Tira</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Modal de Arma (mão) ──────────────────────────────────────────────────────
function WeaponModal({ visible, slotKey, onClose }) {
  const { character, dispatch } = useCharacter();
  const insets = useSafeAreaInsets();
  const equip = character.equipment[slotKey];
  const [showTiras, setShowTiras] = useState(false);

  const setField = (field, value) =>
    dispatch({ type: 'SET_EQUIP_FIELD', slot: slotKey, field, value });
  const changeDur = (delta) =>
    dispatch({ type: 'CHANGE_WEAPON_DURABILITY', slot: slotKey, delta });

  function selectTrail(trail) {
    if (trail.categoria === 'MACHADOS') {
      // Machado é sempre duplo: norte + sul
      if (isMachadoId(equip.tipo)) {
        // Já selecionado — deseleciona
        setField('tipo', '');
        setField('tipo2', '');
      } else {
        setField('tipo', 'machado_do_norte');
        setField('tipo2', 'machado_do_sul');
        if (!equip.nome) setField('nome', 'Machado');
      }
    } else {
      setField('tipo', trail.id);
      setField('tipo2', '');
      if (!equip.nome) setField('nome', trail.nome);
    }
  }

  const dur    = equip.durabilidade ?? 10;
  const durMax = equip.durabilidadeMax ?? 10;
  const durPct = durMax > 0 ? dur / durMax : 0;
  const broken = dur === 0;

  if (showTiras) {
    return (
      <TirasModal
        visible={visible}
        slotKey={slotKey}
        tiras={equip.tiras ?? []}
        onClose={() => setShowTiras(false)}
      />
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={ms.overlay}>
        <ScrollView style={ms.sheet} contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}>
          <View style={ms.sheetHeader}>
            <Text style={ms.sheetTitle}>{EQUIP_LABELS[slotKey]}</Text>
            {broken && <View style={ms.brokenBadge}><Text style={ms.brokenText}>QUEBRADA</Text></View>}
            <TouchableOpacity onPress={onClose}><Text style={ms.closeBtn}>✕</Text></TouchableOpacity>
          </View>

          {/* Tipo de arma — agrupado por categoria */}
          <Text style={ms.sectionLabel}>Tipo de Arma</Text>
          {Object.entries(WEAPONS_BY_CAT).map(([cat, trails]) => {
            if (cat === 'MACHADOS') {
              const isActive = isMachadoId(equip.tipo);
              return (
                <View key={cat} style={ms.catGroup}>
                  <Text style={ms.catGroupLabel}>{cat}</Text>
                  <View style={ms.catGroupRow}>
                    <TouchableOpacity
                      style={[ms.catChip, isActive && ms.catChipActive]}
                      onPress={() => selectTrail(trails[0])}
                    >
                      <Text style={[ms.catChipText, isActive && ms.catChipTextActive]}>Machado</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }
            return (
              <View key={cat} style={ms.catGroup}>
                <Text style={ms.catGroupLabel}>{cat}</Text>
                <View style={ms.catGroupRow}>
                  {trails.map(trail => {
                    const isActive = equip.tipo === trail.id;
                    return (
                      <TouchableOpacity
                        key={trail.id}
                        style={[ms.catChip, isActive && ms.catChipActive]}
                        onPress={() => selectTrail(trail)}
                      >
                        <Text style={[ms.catChipText, isActive && ms.catChipTextActive]}>
                          {trail.nome}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}

          {/* Nome personalizado */}
          <Text style={ms.sectionLabel}>Nome</Text>
          <TextInput
            style={ms.input}
            value={equip.nome}
            onChangeText={v => setField('nome', v)}
            placeholder="Nome da arma..."
            placeholderTextColor="#45475a"
          />

          {/* Nível */}
          <Text style={ms.sectionLabel}>Nível</Text>
          <View style={ms.levelRow}>
            <TouchableOpacity style={ms.numBtn} onPress={() => setField('nivel', Math.max(1, (equip.nivel ?? 1) - 1))}>
              <Text style={ms.numBtnTxt}>−</Text>
            </TouchableOpacity>
            <Text style={ms.levelVal}>{equip.nivel ?? 1}</Text>
            <TouchableOpacity style={ms.numBtn} onPress={() => setField('nivel', (equip.nivel ?? 1) + 1)}>
              <Text style={ms.numBtnTxt}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Durabilidade */}
          <Text style={ms.sectionLabel}>Durabilidade</Text>
          <View style={ms.durRow}>
            <TouchableOpacity style={ms.numBtn} onPress={() => changeDur(-1)}><Text style={ms.numBtnTxt}>−</Text></TouchableOpacity>
            <View style={ms.durBarWrap}>
              <View style={[ms.durBar, { width: `${durPct * 100}%`, backgroundColor: broken ? '#f38ba8' : '#a6e3a1' }]} />
            </View>
            <Text style={ms.durVal}>{dur}/{durMax}</Text>
            <TouchableOpacity style={ms.numBtn} onPress={() => changeDur(+1)}><Text style={ms.numBtnTxt}>+</Text></TouchableOpacity>
          </View>
          <View style={ms.durMaxRow}>
            <Text style={ms.durMaxLabel}>Máximo:</Text>
            <TouchableOpacity style={ms.numBtnSm} onPress={() => setField('durabilidadeMax', Math.max(1, durMax - 1))}><Text style={ms.numBtnTxt}>−</Text></TouchableOpacity>
            <Text style={ms.durMaxVal}>{durMax}</Text>
            <TouchableOpacity style={ms.numBtnSm} onPress={() => setField('durabilidadeMax', durMax + 1)}><Text style={ms.numBtnTxt}>+</Text></TouchableOpacity>
          </View>

          {/* Efeitos */}
          <Text style={ms.sectionLabel}>Efeitos</Text>
          <TextInput
            style={[ms.input, ms.multilineInput]}
            value={equip.efeitos}
            onChangeText={v => setField('efeitos', v)}
            placeholder="Efeitos especiais..."
            placeholderTextColor="#45475a"
            multiline
          />

          {/* Tiras de couro */}
          <TouchableOpacity style={ms.tirasBtn} onPress={() => setShowTiras(true)}>
            <Text style={ms.tirasBtnText}>🪢 Tiras de Couro</Text>
            {(equip.tiras?.length ?? 0) > 0 && (
              <View style={ms.tirasBadge}>
                <Text style={ms.tirasBadgeText}>{equip.tiras.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          {(equip.tiras?.length ?? 0) > 0 && (
            <View style={ms.tirasPreview}>
              {equip.tiras.map((t, i) => (
                <Text key={i} style={ms.tirasPreviewItem}>• {tiraLabel(t)}</Text>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Modal de Armadura ────────────────────────────────────────────────────────
function ArmorModal({ visible, slotKey, onClose }) {
  const { character, dispatch } = useCharacter();
  const insets = useSafeAreaInsets();
  const equip = character.equipment[slotKey];
  const broken = equip.durabilidade === 0;
  const [showTiras, setShowTiras] = useState(false);

  const setField = (field, value) =>
    dispatch({ type: 'SET_EQUIP_FIELD', slot: slotKey, field, value });
  const changeDur = (delta) =>
    dispatch({ type: 'CHANGE_EQUIP_DURABILITY', slot: slotKey, delta });

  const durPct = equip.durabilidadeMax > 0 ? equip.durabilidade / equip.durabilidadeMax : 0;

  if (showTiras) {
    return (
      <TirasModal
        visible={visible}
        slotKey={slotKey}
        tiras={equip.tiras ?? []}
        onClose={() => setShowTiras(false)}
      />
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={ms.overlay}>
        <View style={[ms.sheet, { paddingBottom: 20 + insets.bottom }]}>
          <View style={ms.sheetHeader}>
            <Text style={ms.sheetTitle}>{EQUIP_LABELS[slotKey]}</Text>
            {broken && <View style={ms.brokenBadge}><Text style={ms.brokenText}>QUEBRADO</Text></View>}
            <TouchableOpacity onPress={onClose}><Text style={ms.closeBtn}>✕</Text></TouchableOpacity>
          </View>

          {/* Nome */}
          <Text style={ms.sectionLabel}>Nome</Text>
          <TextInput
            style={ms.input}
            value={equip.nome ?? ''}
            onChangeText={v => setField('nome', v)}
            placeholder="Nome da peça..."
            placeholderTextColor="#45475a"
          />

          {/* Nível */}
          <Text style={ms.sectionLabel}>Nível</Text>
          <View style={ms.levelRow}>
            <TouchableOpacity style={ms.numBtn} onPress={() => setField('nivel', Math.max(1, (equip.nivel ?? 1) - 1))}>
              <Text style={ms.numBtnTxt}>−</Text>
            </TouchableOpacity>
            <Text style={ms.levelVal}>{equip.nivel ?? 1}</Text>
            <TouchableOpacity style={ms.numBtn} onPress={() => setField('nivel', (equip.nivel ?? 1) + 1)}>
              <Text style={ms.numBtnTxt}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={ms.statRow3}>
            <View style={ms.statCell}>
              <Text style={ms.sectionLabel}>Armadura</Text>
              <View style={ms.levelRow}>
                <TouchableOpacity style={ms.numBtn} onPress={() => setField('armadura', Math.max(0, equip.armadura - 1))}><Text style={ms.numBtnTxt}>−</Text></TouchableOpacity>
                <Text style={ms.levelVal}>{equip.armadura}</Text>
                <TouchableOpacity style={ms.numBtn} onPress={() => setField('armadura', equip.armadura + 1)}><Text style={ms.numBtnTxt}>+</Text></TouchableOpacity>
              </View>
            </View>
            <View style={ms.statCell}>
              <Text style={ms.sectionLabel}>Res. Mágica</Text>
              <View style={ms.levelRow}>
                <TouchableOpacity style={ms.numBtn} onPress={() => setField('resMagica', Math.max(0, equip.resMagica - 1))}><Text style={ms.numBtnTxt}>−</Text></TouchableOpacity>
                <Text style={ms.levelVal}>{equip.resMagica}</Text>
                <TouchableOpacity style={ms.numBtn} onPress={() => setField('resMagica', equip.resMagica + 1)}><Text style={ms.numBtnTxt}>+</Text></TouchableOpacity>
              </View>
            </View>
            <View style={ms.statCell}>
              <Text style={ms.sectionLabel}>Reputação</Text>
              <View style={ms.levelRow}>
                <TouchableOpacity style={ms.numBtn} onPress={() => setField('reputacao', Math.max(0, (equip.reputacao || 0) - 1))}><Text style={ms.numBtnTxt}>−</Text></TouchableOpacity>
                <Text style={ms.levelVal}>{equip.reputacao || 0}</Text>
                <TouchableOpacity style={ms.numBtn} onPress={() => setField('reputacao', (equip.reputacao || 0) + 1)}><Text style={ms.numBtnTxt}>+</Text></TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Efeitos */}
          <Text style={ms.sectionLabel}>Efeitos</Text>
          <TextInput
            style={[ms.input, ms.multilineInput]}
            value={equip.efeitos}
            onChangeText={v => setField('efeitos', v)}
            placeholder="Efeitos especiais..."
            placeholderTextColor="#45475a"
            multiline
          />

          {/* Durabilidade */}
          <Text style={ms.sectionLabel}>Durabilidade</Text>
          <View style={ms.durRow}>
            <TouchableOpacity style={ms.numBtn} onPress={() => changeDur(-1)}><Text style={ms.numBtnTxt}>−</Text></TouchableOpacity>
            <View style={ms.durBarWrap}>
              <View style={[ms.durBar, { width: `${durPct * 100}%`, backgroundColor: broken ? '#f38ba8' : '#a6e3a1' }]} />
            </View>
            <Text style={ms.durVal}>{equip.durabilidade}/{equip.durabilidadeMax}</Text>
            <TouchableOpacity style={ms.numBtn} onPress={() => changeDur(+1)}><Text style={ms.numBtnTxt}>+</Text></TouchableOpacity>
          </View>
          <View style={ms.durMaxRow}>
            <Text style={ms.durMaxLabel}>Máximo:</Text>
            <TouchableOpacity style={ms.numBtnSm} onPress={() => setField('durabilidadeMax', Math.max(1, equip.durabilidadeMax - 1))}><Text style={ms.numBtnTxt}>−</Text></TouchableOpacity>
            <Text style={ms.durMaxVal}>{equip.durabilidadeMax}</Text>
            <TouchableOpacity style={ms.numBtnSm} onPress={() => setField('durabilidadeMax', equip.durabilidadeMax + 1)}><Text style={ms.numBtnTxt}>+</Text></TouchableOpacity>
          </View>

          {/* Tiras de couro */}
          <TouchableOpacity style={ms.tirasBtn} onPress={() => setShowTiras(true)}>
            <Text style={ms.tirasBtnText}>🪢 Tiras de Couro</Text>
            {(equip.tiras?.length ?? 0) > 0 && (
              <View style={ms.tirasBadge}>
                <Text style={ms.tirasBadgeText}>{equip.tiras.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          {(equip.tiras?.length ?? 0) > 0 && (
            <View style={ms.tirasPreview}>
              {equip.tiras.map((t, i) => (
                <Text key={i} style={ms.tirasPreviewItem}>• {tiraLabel(t)}</Text>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Card de arma (mão) ───────────────────────────────────────────────────────
function HandSlotCard({ slotKey }) {
  const { character, dispatch } = useCharacter();
  const equip = character.equipment[slotKey];
  const [open, setOpen] = useState(false);

  const dur    = equip.durabilidade ?? 10;
  const durMax = equip.durabilidadeMax ?? 10;
  const durPct = durMax > 0 ? dur / durMax : 0;
  const broken = dur === 0;

  return (
    <>
      <TouchableOpacity style={[styles.card, styles.cardHand, broken && styles.cardBroken]} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <View style={styles.cardRow}>
          <Text style={[styles.slotName, broken && styles.textDim]}>{EQUIP_LABELS[slotKey]}</Text>
          {broken && <View style={styles.brokenBadge}><Text style={styles.brokenText}>QUEBRADA</Text></View>}
          {equip.tipo ? (
            <Text style={styles.typeBadge}>
              {isMachadoId(equip.tipo) ? 'Machado' : trailName(equip.tipo)}
            </Text>
          ) : null}
          {(equip.nivel ?? 1) > 1 && <Text style={styles.levelBadge}>Nv {equip.nivel}</Text>}
          <Text style={styles.editHint}>✏️</Text>
        </View>
        {equip.nome ? (
          <Text style={[styles.equipName, broken && styles.textDim]}>{equip.nome}</Text>
        ) : (
          <Text style={styles.emptyHint}>Toque para configurar…</Text>
        )}
        {equip.nome && (
          <View style={styles.durBarWrapSm}>
            <View style={[styles.durBarSm, { width: `${durPct * 100}%`, backgroundColor: broken ? '#f38ba8' : '#a6e3a1' }]} />
          </View>
        )}
        {equip.nome && (
          <View style={styles.quickDurRow}>
            <TouchableOpacity
              style={styles.quickDurBtn}
              onPress={() => dispatch({ type: 'CHANGE_WEAPON_DURABILITY', slot: slotKey, delta: -1 })}
            >
              <Text style={styles.quickDurBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.durValSm}>{dur}/{durMax}</Text>
            <TouchableOpacity
              style={[styles.quickDurBtn, styles.quickDurBtnPos]}
              onPress={() => dispatch({ type: 'CHANGE_WEAPON_DURABILITY', slot: slotKey, delta: +1 })}
            >
              <Text style={styles.quickDurBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
        {(equip.tiras?.length ?? 0) > 0 && (
          <Text style={styles.tirasCount}>🪢 {equip.tiras.length} tira{equip.tiras.length > 1 ? 's' : ''}</Text>
        )}
        {equip.nome && (
          <TouchableOpacity
            style={styles.unequipBtn}
            onPress={() => dispatch({ type: 'UNEQUIP_TO_INVENTORY', slot: slotKey })}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.unequipBtnText}>→ Inventário</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      <WeaponModal visible={open} slotKey={slotKey} onClose={() => setOpen(false)} />
    </>
  );
}

// ─── Card de armadura ─────────────────────────────────────────────────────────
function ArmorSlotCard({ slotKey }) {
  const { character, dispatch } = useCharacter();
  const equip = character.equipment[slotKey];
  const broken = equip.durabilidade === 0;
  const durPct = equip.durabilidadeMax > 0 ? equip.durabilidade / equip.durabilidadeMax : 0;
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={[styles.card, broken && styles.cardBroken]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <View style={styles.cardRow}>
          <Text style={[styles.slotName, broken && styles.textDim]}>{EQUIP_LABELS[slotKey]}</Text>
          {broken && <View style={styles.brokenBadge}><Text style={styles.brokenText}>QUEBRADO</Text></View>}
          {equip.nivel > 1 && <Text style={styles.levelBadge}>Nv {equip.nivel}</Text>}
          <Text style={styles.editHint}>✏️</Text>
        </View>
        {equip.nome ? <Text style={[styles.equipName, broken && styles.textDim]}>{equip.nome}</Text> : null}
        <View style={styles.armorStats}>
          {equip.armadura > 0 && <Text style={styles.armorStat}>🛡 {equip.armadura}</Text>}
          {equip.resMagica > 0 && <Text style={styles.armorStat}>✨ {equip.resMagica}</Text>}
          {(equip.reputacao || 0) > 0 && <Text style={styles.armorStat}>🎭 {equip.reputacao}</Text>}
        </View>
        <View style={styles.durBarWrapSm}>
          <View style={[styles.durBarSm, { width: `${durPct * 100}%`, backgroundColor: broken ? '#f38ba8' : '#a6e3a1' }]} />
        </View>
        <View style={styles.quickDurRow}>
          <TouchableOpacity
            style={styles.quickDurBtn}
            onPress={() => dispatch({ type: 'CHANGE_EQUIP_DURABILITY', slot: slotKey, delta: -1 })}
          >
            <Text style={styles.quickDurBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.durValSm}>{equip.durabilidade}/{equip.durabilidadeMax}</Text>
          <TouchableOpacity
            style={[styles.quickDurBtn, styles.quickDurBtnPos]}
            onPress={() => dispatch({ type: 'CHANGE_EQUIP_DURABILITY', slot: slotKey, delta: +1 })}
          >
            <Text style={styles.quickDurBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        {(equip.tiras?.length ?? 0) > 0 && (
          <Text style={styles.tirasCount}>🪢 {equip.tiras.length} tira{equip.tiras.length > 1 ? 's' : ''}</Text>
        )}
        {equip.nome && (
          <TouchableOpacity
            style={styles.unequipBtn}
            onPress={() => dispatch({ type: 'UNEQUIP_ARMOR_TO_INVENTORY', slot: slotKey })}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.unequipBtnText}>→ Inventário</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      <ArmorModal visible={open} slotKey={slotKey} onClose={() => setOpen(false)} />
    </>
  );
}

// ─── Acessório ────────────────────────────────────────────────────────────────
function AccessoryCard({ index }) {
  const { character, dispatch } = useCharacter();
  const acc = character.accessories[index];
  const [expanded, setExpanded] = useState(false);
  const [showTiras, setShowTiras] = useState(false);

  const setField = (field, value) =>
    dispatch({ type: 'SET_ACCESSORY', index, field, value });

  const tiras = acc.tiras ?? [];
  const hasData = acc.nome || acc.armadura || acc.resMagica || acc.reputacao || acc.efeitos || tiras.length > 0;

  if (showTiras) {
    return (
      <TirasModal
        visible={true}
        accIndex={index}
        tiras={tiras}
        onClose={() => setShowTiras(false)}
      />
    );
  }

  return (
    <View style={styles.accCard}>
      <TouchableOpacity style={styles.accHeader} onPress={() => setExpanded(v => !v)} activeOpacity={0.7}>
        <Text style={styles.accIndex}>{index + 1}</Text>
        <Text style={styles.accName} numberOfLines={1}>{acc.nome || 'Acessório vazio'}</Text>
        {hasData && (
          <View style={styles.accBadgeRow}>
            {acc.armadura > 0         && <Text style={styles.accBadge}>🛡 {acc.armadura}</Text>}
            {acc.resMagica > 0        && <Text style={styles.accBadge}>✨ {acc.resMagica}</Text>}
            {(acc.reputacao || 0) > 0 && <Text style={styles.accBadge}>🎭 {acc.reputacao}</Text>}
            {tiras.length > 0         && <Text style={styles.accBadge}>🪢 {tiras.length}</Text>}
          </View>
        )}
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.accBody}>
          <TextInput
            style={styles.textField}
            value={acc.nome}
            onChangeText={v => setField('nome', v)}
            placeholder="Nome do acessório..."
            placeholderTextColor="#45475a"
          />
          <View style={styles.statRow}>
            <NumField label="Armadura"    value={acc.armadura}       onChange={v => setField('armadura', v)} />
            <NumField label="Res. Mágica" value={acc.resMagica}      onChange={v => setField('resMagica', v)} />
            <NumField label="Reputação"   value={acc.reputacao || 0} onChange={v => setField('reputacao', v)} />
          </View>
          <TextInput
            style={styles.efectosInput}
            value={acc.efeitos}
            onChangeText={v => setField('efeitos', v)}
            placeholder="Efeito narrativo..."
            placeholderTextColor="#45475a"
            multiline
          />
          {/* Tiras de couro */}
          <TouchableOpacity style={styles.tirasBtn} onPress={() => setShowTiras(true)}>
            <Text style={styles.tirasBtnText}>🪢 Outros Bônus (Tiras)</Text>
            {tiras.length > 0 && (
              <View style={styles.tirasBadge}>
                <Text style={styles.tirasBadgeText}>{tiras.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          {tiras.length > 0 && (
            <View style={styles.tirasPreview}>
              {tiras.map((t, i) => (
                <Text key={i} style={styles.tirasPreviewItem}>• {tiraLabel(t)}</Text>
              ))}
            </View>
          )}
          {acc.nome && (
            <TouchableOpacity
              style={[styles.unequipBtn, { marginTop: 8 }]}
              onPress={() => dispatch({ type: 'UNEQUIP_ACCESSORY_TO_INVENTORY', index })}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.unequipBtnText}>→ Inventário</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Campo numérico com +/- ───────────────────────────────────────────────────
function NumField({ label, value, onChange }) {
  return (
    <View style={styles.numField}>
      <Text style={styles.numLabel}>{label}</Text>
      <View style={styles.numControls}>
        <TouchableOpacity style={styles.numBtn} onPress={() => onChange(Math.max(0, value - 1))}>
          <Text style={styles.numBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.numValue}>{value}</Text>
        <TouchableOpacity style={styles.numBtn} onPress={() => onChange(value + 1)}>
          <Text style={styles.numBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function EquipmentScreen() {
  const { character, dispatch } = useCharacter();
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
      {/* Totais */}
      <View style={styles.totalsRow}>
        <View style={styles.totalBadge}>
          <Text style={styles.totalIcon}>🛡️</Text>
          <Text style={styles.totalLabel}>Armadura</Text>
          <Text style={styles.totalValue}>{totalArmadura}</Text>
        </View>
        <View style={styles.totalBadge}>
          <Text style={styles.totalIcon}>✨</Text>
          <Text style={styles.totalLabel}>Res. Mágica</Text>
          <Text style={styles.totalValue}>{totalResMagica}</Text>
        </View>
        <View style={styles.totalBadge}>
          <Text style={styles.totalIcon}>🎭</Text>
          <Text style={styles.totalLabel}>Reputação</Text>
          <Text style={styles.totalValue}>{reputacaoBase + totalReputacao}</Text>
          {totalReputacao > 0 && (
            <Text style={styles.totalBonus}>+{totalReputacao} equip.</Text>
          )}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Empunhadura</Text>
      {HAND_SLOTS.map(k => <HandSlotCard key={k} slotKey={k} />)}

      <Text style={styles.sectionTitle}>Armadura</Text>
      {/* Controle global de durabilidade */}
      <View style={styles.globalDurRow}>
        <Text style={styles.globalDurLabel}>Durabilidade de todas:</Text>
        <TouchableOpacity style={styles.globalDurBtn} onPress={() => dispatch({ type: 'CHANGE_ALL_ARMOR_DURABILITY', delta: -1 })}>
          <Text style={styles.globalDurBtnText}>−1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.globalDurBtn} onPress={() => dispatch({ type: 'CHANGE_ALL_ARMOR_DURABILITY', delta: +1 })}>
          <Text style={styles.globalDurBtnText}>+1</Text>
        </TouchableOpacity>
      </View>
      {ARMOR_SLOTS.map(k => <ArmorSlotCard key={k} slotKey={k} />)}

      <Text style={styles.sectionTitle}>Acessórios</Text>
      {character.accessories
        .slice(0, character.titles?.acquired?.includes('recruta') ? 11 : 10)
        .map((_, i) => <AccessoryCard key={i} index={i} />)}
    </ScrollView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: '#11111b' },
  content: { padding: 16, paddingBottom: 40 },

  sectionTitle: {
    color: '#89b4fa', fontSize: 13, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1,
    marginBottom: 10, marginTop: 6,
  },

  totalsRow:  { flexDirection: 'row', gap: 8, marginBottom: 16 },
  totalBadge: {
    flex: 1, backgroundColor: '#1e1e2e', borderRadius: 10,
    padding: 8, alignItems: 'center', borderWidth: 1, borderColor: '#2e2e4e',
  },
  totalIcon:  { fontSize: 16, marginBottom: 2 },
  totalLabel: { color: '#6c7086', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  totalValue: { color: '#cdd6f4', fontSize: 20, fontWeight: 'bold' },
  totalBonus: { color: '#a6e3a1', fontSize: 9, marginTop: 1 },

  globalDurRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  globalDurLabel: { color: '#6c7086', fontSize: 12, flex: 1 },
  globalDurBtn: { backgroundColor: '#313244', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  globalDurBtnText: { color: '#cdd6f4', fontSize: 13, fontWeight: '700' },

  unequipBtn: { marginTop: 6, alignSelf: 'flex-start', backgroundColor: '#1d3a2f', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  unequipBtnText: { color: '#a6e3a1', fontSize: 11, fontWeight: '600' },

  quickDurRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  quickDurBtn: { backgroundColor: '#313244', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3 },
  quickDurBtnPos: { backgroundColor: '#1d3a2f' },
  quickDurBtnText: { color: '#cdd6f4', fontSize: 14, fontWeight: '700' },

  card: {
    backgroundColor: '#1e1e2e', borderRadius: 12,
    padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: '#2e2e4e',
  },
  cardHand:   { borderLeftWidth: 3, borderLeftColor: '#fab387' },
  cardBroken: { borderColor: '#45273a', opacity: 0.85 },

  cardRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  slotName:   { color: '#cdd6f4', fontSize: 14, fontWeight: '700', flex: 1 },
  textDim:    { color: '#45475a' },
  editHint:   { fontSize: 14 },

  typeBadge:  {
    backgroundColor: '#313244', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  levelBadge: {
    backgroundColor: '#1e3a5f', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  brokenBadge: { backgroundColor: '#45273a', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  brokenText:  { color: '#f38ba8', fontSize: 10, fontWeight: '700' },

  equipName:  { color: '#cdd6f4', fontSize: 13, marginBottom: 2 },
  equipStat:  { color: '#fab387', fontSize: 12 },
  emptyHint:  { color: '#45475a', fontSize: 12, fontStyle: 'italic' },
  tirasCount: { color: '#cba6f7', fontSize: 11, marginTop: 3 },

  armorStats:    { flexDirection: 'row', gap: 8, marginBottom: 4 },
  armorStat:     { color: '#89b4fa', fontSize: 12 },
  durBarWrapSm:  { height: 4, backgroundColor: '#313244', borderRadius: 2, overflow: 'hidden', marginTop: 4 },
  durBarSm:      { height: 4, borderRadius: 2 },
  durValSm:      { color: '#45475a', fontSize: 10, marginTop: 2 },

  statRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  numField:    { flex: 1 },
  numLabel:    { color: '#6c7086', fontSize: 11, marginBottom: 4, textTransform: 'uppercase' },
  numControls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  numBtn:      {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#313244', alignItems: 'center', justifyContent: 'center',
  },
  numBtnText:  { color: '#cdd6f4', fontSize: 16, lineHeight: 20 },
  numValue:    { color: '#cdd6f4', fontSize: 16, fontWeight: '700', minWidth: 28, textAlign: 'center' },

  efectosInput: {
    color: '#cdd6f4', fontSize: 13,
    borderWidth: 1, borderColor: '#313244',
    borderRadius: 6, padding: 8, minHeight: 40,
    textAlignVertical: 'top', marginBottom: 8,
  },
  textField: {
    color: '#cdd6f4', fontSize: 13,
    borderWidth: 1, borderColor: '#313244',
    borderRadius: 6, padding: 8, marginBottom: 8,
  },

  accCard:     { backgroundColor: '#1e1e2e', borderRadius: 10, marginBottom: 6, borderWidth: 1, borderColor: '#2e2e4e', overflow: 'hidden' },
  accHeader:   { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 8 },
  accIndex:    { color: '#45475a', fontSize: 12, fontWeight: '700', width: 18 },
  accName:     { color: '#cdd6f4', fontSize: 13, flex: 1 },
  accBadgeRow: { flexDirection: 'row', gap: 6 },
  accBadge:    { color: '#89b4fa', fontSize: 12 },
  chevron:     { color: '#45475a', fontSize: 11 },
  accBody:     { paddingHorizontal: 12, paddingBottom: 10 },

  tirasBtn:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#181825', borderRadius: 8, borderWidth: 1, borderColor: '#cba6f7', padding: 10, marginTop: 6, gap: 8 },
  tirasBtnText:     { color: '#cba6f7', fontSize: 13, fontWeight: '600', flex: 1 },
  tirasBadge:       { backgroundColor: '#cba6f7', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  tirasBadgeText:   { color: '#11111b', fontSize: 10, fontWeight: '700' },
  tirasPreview:     { marginTop: 4 },
  tirasPreviewItem: { color: '#cba6f7', fontSize: 12, marginBottom: 2 },
});

// ─── Estilos do modal ─────────────────────────────────────────────────────────
const ms = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet:     {
    backgroundColor: '#1e1e2e', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: '90%',
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sheetTitle:  { color: '#cdd6f4', fontSize: 17, fontWeight: '700', flex: 1 },
  closeBtn:    { color: '#6c7086', fontSize: 18, padding: 4 },

  sectionLabel: { color: '#6c7086', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6, marginTop: 10 },
  emptyHint:    { color: '#45475a', fontSize: 12, fontStyle: 'italic', marginBottom: 8 },

  input: {
    color: '#cdd6f4', fontSize: 13,
    borderWidth: 1, borderColor: '#313244',
    borderRadius: 8, padding: 10, marginBottom: 2,
    backgroundColor: '#181825',
  },
  multilineInput: { minHeight: 60, textAlignVertical: 'top' },

  levelRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 2 },
  levelVal:  { color: '#cdd6f4', fontSize: 22, fontWeight: 'bold', minWidth: 30, textAlign: 'center' },
  numBtn:    {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#313244', alignItems: 'center', justifyContent: 'center',
  },
  numBtnSm:  {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#313244', alignItems: 'center', justifyContent: 'center',
  },
  numBtnTxt: { color: '#cdd6f4', fontSize: 18, lineHeight: 22 },

  catGroup:      { marginBottom: 8 },
  catGroupLabel: { color: '#45475a', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  catGroupRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dualTrailHint: { color: '#f9e2af', fontSize: 12, marginBottom: 8, fontStyle: 'italic' },

  catPicker: { flexDirection: 'row', marginBottom: 2 },
  catChip:   {
    backgroundColor: '#313244', borderRadius: 6, paddingHorizontal: 10,
    paddingVertical: 6, marginRight: 6,
  },
  catChipActive:     { backgroundColor: '#fab387' },
  catChipText:       { color: '#6c7086', fontSize: 12, fontWeight: '600' },
  catChipTextActive: { color: '#11111b' },

  durRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  durBarWrap:  { flex: 1, height: 8, backgroundColor: '#313244', borderRadius: 4, overflow: 'hidden' },
  durBar:      { height: 8, borderRadius: 4 },
  durVal:      { color: '#cdd6f4', fontSize: 12, minWidth: 36, textAlign: 'center' },
  durMaxRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  durMaxLabel: { color: '#45475a', fontSize: 11, flex: 1 },
  durMaxVal:   { color: '#cdd6f4', fontSize: 13, minWidth: 24, textAlign: 'center' },

  brokenBadge: { backgroundColor: '#45273a', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginRight: 8 },
  brokenText:  { color: '#f38ba8', fontSize: 10, fontWeight: '700' },

  statRow3:  { flexDirection: 'row', gap: 10 },
  statCell:  { flex: 1 },

  tirasBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#181825', borderRadius: 10, borderWidth: 1, borderColor: '#cba6f7',
    padding: 12, marginTop: 12, gap: 8,
  },
  tirasBtnText: { color: '#cba6f7', fontSize: 14, fontWeight: '600', flex: 1 },
  tirasBadge:   { backgroundColor: '#cba6f7', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  tirasBadgeText: { color: '#11111b', fontSize: 11, fontWeight: '700' },
  tirasPreview: { marginTop: 6 },
  tirasPreviewItem: { color: '#cba6f7', fontSize: 12, marginBottom: 2 },

  // TirasModal
  tiraList: {
    backgroundColor: '#181825', borderRadius: 8, padding: 8, marginBottom: 10,
  },
  tiraRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  tiraLabel: { color: '#cdd6f4', fontSize: 13, flex: 1 },
  removeBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#45273a', alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { color: '#f38ba8', fontSize: 12 },

  tabs:        { flexDirection: 'row', gap: 6, marginBottom: 10 },
  tab:         { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: '#181825', alignItems: 'center' },
  tabActive:   { backgroundColor: '#313244' },
  tabText:     { color: '#6c7086', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#cdd6f4' },

  addSection: { marginBottom: 10 },
  keyPicker:  { marginBottom: 8 },
  keyChip:    { backgroundColor: '#181825', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, marginRight: 6, borderWidth: 1, borderColor: '#313244' },
  keyChipActive:     { backgroundColor: '#89b4fa', borderColor: '#89b4fa' },
  keyChipText:       { color: '#6c7086', fontSize: 12 },
  keyChipTextActive: { color: '#11111b', fontWeight: '700' },

  valorRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  valorLabel: { color: '#6c7086', fontSize: 12, flex: 1 },
  valorVal:  { color: '#cdd6f4', fontSize: 18, fontWeight: 'bold', minWidth: 30, textAlign: 'center' },

  narrativaInput: {
    color: '#cdd6f4', fontSize: 13,
    borderWidth: 1, borderColor: '#313244',
    borderRadius: 8, padding: 10, minHeight: 80,
    textAlignVertical: 'top', backgroundColor: '#181825',
  },

  addBtn:     { backgroundColor: '#89b4fa', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 4 },
  addBtnText: { color: '#11111b', fontSize: 14, fontWeight: '700' },
});
