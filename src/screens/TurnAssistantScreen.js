import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal,
} from 'react-native';
import { useCharacter } from '../context/CharacterContext';
import { HAND_SLOTS, EQUIP_LABELS, computeDefenseTotals } from '../data/initialCharacter';
import { TRAILS_ARMAS, TRAILS_MAGIAS } from '../data/trailsData';
import { TITLE_BY_ID } from '../data/titlesData';

// ─── Constantes ───────────────────────────────────────────────────────────────

const RANGED_CATEGORIES = ['ARCOS'];
const MAGIC_WEAPON_CATEGORIES = ['CETROS MÁGICOS', 'VARINHAS', 'SUPORTE DE CAMPO', 'SUPORTE MÁGICO', 'SUPORTE CERIMONIAL'];

const DEFAULT_MANA_COST   = { 1: 2, 2: 3, 3: 5 };
const DEFAULT_DIFICULDADE = { 1: 15, 2: 25, 3: 30 };
const DEFAULT_DURACAO     = {
  1: '1 cena / 3 turnos',
  2: 'Semanas / 5 turnos',
  3: 'Anos / 10 turnos',
};

// Títulos que conferem reações
const REACTION_TITLES = {
  conjurador_tatico: 'Uma vez por turno: pode usar uma magia em si mesmo ao ser atacado (custa ação normal)',
  moldador_do_tempo: 'Ao ser alvo de uma fonte: pode usar uma magia em resposta (não custa ação)',
  ilusionista:       'Ao ser alvo de uma fonte: pode usar uma magia em resposta (não custa ação)',
  executor:          'Ao abater um alvo ou zerar sua vida: ganha 1 ação extra este turno',
};

// Títulos que modificam conjuração
const CAST_BONUS_TITLES  = ['aprendiz_de_conjurador', 'conjurador_tatico', 'seguidor_da_magia'];
const MANA_REDUCE_TITLES = ['feiticeiro'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function trailById(id) {
  return TRAILS_ARMAS.find(t => t.id === id) ?? null;
}

function isRanged(tipoId) {
  return RANGED_CATEGORIES.includes(trailById(tipoId)?.categoria ?? '');
}

function isMagicWeapon(tipoId) {
  return MAGIC_WEAPON_CATEGORIES.includes(trailById(tipoId)?.categoria ?? '');
}

// Retorna skills adquiridas da trilha da arma equipada
function getWeaponSkills(tipoId, acquiredTrails) {
  if (!tipoId || !acquiredTrails?.[tipoId]) return [];
  const trail = TRAILS_ARMAS.find(t => t.id === tipoId);
  if (!trail) return [];
  const trailData = acquiredTrails[tipoId];
  return trail.skills
    .map(sk => ({ nome: sk.nome, level: trailData.skills?.[sk.id] ?? 0 }))
    .filter(sk => sk.level > 0);
}

// Retorna todas as magias adquiridas
function getAcquiredMagicSpells(acquiredTrails) {
  const out = [];
  for (const trail of TRAILS_MAGIAS) {
    const trailData = acquiredTrails?.[trail.id];
    if (!trailData) continue;
    for (const skill of trail.skills) {
      const lvl = trailData.skills?.[skill.id] ?? 0;
      if (lvl < 1) continue;
      const nd = skill.niveis[String(lvl)];
      out.push({
        trailId:   trail.id,
        trailNome: trail.nome,
        skillId:   skill.id,
        skillNome: skill.nome,
        level:     lvl,
        custo:     nd?.custo    ?? DEFAULT_MANA_COST[lvl],
        alcance:   nd?.alcance  ?? null,
        raio:      nd?.raio     ?? null,
        efeito:    nd?.efeito   ?? '',
        dificuldade: DEFAULT_DIFICULDADE[lvl],
        duracao:     DEFAULT_DURACAO[lvl],
      });
    }
  }
  return out;
}

// ─── Painel de Ataque ─────────────────────────────────────────────────────────
function AttackPanel({ actionsLeft, onConfirm }) {
  const { character, dispatch } = useCharacter();
  const { attributes: attrs, skills } = character;
  const forca    = attrs?.robustez?.forca     ?? 0;
  const destreza = attrs?.robustez?.destreza  ?? 0;
  const armasBrancas = skills?.armasBrancas   ?? 0;
  const armasRange   = skills?.armasRange     ?? 0;

  const [selSlot, setSelSlot]   = useState(null);
  const [twoHand, setTwoHand]   = useState(false);
  const [selSkills, setSelSkills] = useState([]);

  const weapons = HAND_SLOTS
    .map(k => ({ key: k, label: EQUIP_LABELS[k], equip: character.equipment[k] }))
    .filter(w => w.equip.tipo || w.equip.nome);

  const weapon = weapons.find(w => w.key === selSlot)?.equip ?? null;
  const nivel  = weapon?.nivel ?? 1;

  const ranged = weapon ? isRanged(weapon.tipo) : false;
  const magicW = weapon ? isMagicWeapon(weapon.tipo) : false;

  // Fórmula de dano
  let formula = null;
  if (weapon) {
    if (ranged) {
      formula = {
        partes: [
          { label: 'Armas Range', val: armasRange },
          { label: 'Destreza', val: destreza },
          { label: `Nível (${nivel})`, val: nivel },
        ],
        total: armasRange + destreza + nivel,
      };
    } else if (twoHand) {
      formula = {
        partes: [
          { label: `Nível×3 (${nivel}×3)`, val: nivel * 3 },
          { label: `Força×2 (${forca}×2)`, val: forca * 2 },
        ],
        total: nivel * 3 + forca * 2,
      };
    } else {
      formula = {
        partes: [
          { label: 'Armas Brancas', val: armasBrancas },
          { label: 'Força', val: forca },
          { label: `Nível (${nivel})`, val: nivel },
        ],
        total: armasBrancas + forca + nivel,
      };
    }
  }

  const acquiredSkills = weapon ? getWeaponSkills(weapon.tipo, character.skillTree?.acquiredTrails) : [];

  function toggleSkill(nome) {
    setSelSkills(prev =>
      prev.includes(nome) ? prev.filter(s => s !== nome) : [...prev, nome]
    );
  }

  function confirm() {
    if (!weapon || actionsLeft < 1) return;
    // Desconta 1 energia
    dispatch({ type: 'CHANGE_STATUS', key: 'energia', delta: -1 });
    onConfirm();
    setSelSkills([]);
  }

  return (
    <View>
      {weapons.length === 0 ? (
        <View style={s.emptyCard}>
          <Text style={s.emptyText}>Nenhuma arma equipada. Configure na aba Equip.</Text>
        </View>
      ) : (
        <>
          <Text style={s.subLabel}>Arma</Text>
          <View style={s.chipRow}>
            {weapons.map(w => (
              <TouchableOpacity
                key={w.key}
                style={[s.chip, selSlot === w.key && s.chipActive]}
                onPress={() => { setSelSlot(w.key); setTwoHand(false); setSelSkills([]); }}
              >
                <Text style={[s.chipText, selSlot === w.key && s.chipTextActive]}>
                  {w.equip.nome || w.label}
                </Text>
                <Text style={[s.chipSub, selSlot === w.key && s.chipSubActive]}>
                  {w.label} • Nv {w.equip.nivel}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {weapon && !ranged && !magicW && (
        <>
          <Text style={s.subLabel}>Empunhadura</Text>
          <View style={s.chipRow}>
            <TouchableOpacity style={[s.chip, !twoHand && s.chipActive]} onPress={() => setTwoHand(false)}>
              <Text style={[s.chipText, !twoHand && s.chipTextActive]}>Uma mão</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.chip, twoHand && s.chipActive]} onPress={() => setTwoHand(true)}>
              <Text style={[s.chipText, twoHand && s.chipTextActive]}>Duas mãos</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {formula && (
        <View style={s.formulaCard}>
          <Text style={s.formulaTitle}>⚔️ Dano Base</Text>
          <View style={s.formulaParts}>
            {formula.partes.map((p, i) => (
              <React.Fragment key={i}>
                {i > 0 && <Text style={s.formulaOp}>+</Text>}
                <View style={s.formulaPart}>
                  <Text style={s.formulaVal}>{p.val}</Text>
                  <Text style={s.formulaLbl}>{p.label}</Text>
                </View>
              </React.Fragment>
            ))}
            <Text style={s.formulaOp}>=</Text>
            <View style={[s.formulaPart, s.formulaTotal]}>
              <Text style={s.formulaTotalVal}>{formula.total}</Text>
              <Text style={s.formulaLbl}>Total</Text>
            </View>
          </View>
          <Text style={s.formulaNote}>+ d20 de acerto (role separado)</Text>
        </View>
      )}

      {acquiredSkills.length > 0 && (
        <>
          <Text style={s.subLabel}>Habilidades da Arma</Text>
          <Text style={s.hint}>Selecione as que irá aplicar neste ataque</Text>
          {acquiredSkills.map(sk => (
            <TouchableOpacity
              key={sk.nome}
              style={[s.skillRow, selSkills.includes(sk.nome) && s.skillRowActive]}
              onPress={() => toggleSkill(sk.nome)}
            >
              <View style={[s.skillCheck, selSkills.includes(sk.nome) && s.skillCheckActive]}>
                {selSkills.includes(sk.nome) && <Text style={s.skillCheckMark}>✓</Text>}
              </View>
              <Text style={[s.skillName, selSkills.includes(sk.nome) && s.skillNameActive]}>
                {sk.nome}
              </Text>
              <Text style={s.skillLevel}>Nv {sk.level}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      {selSkills.length > 0 && (
        <View style={s.effectsNote}>
          <Text style={s.effectsLabel}>Efeitos ativos:</Text>
          <Text style={s.effectsList}>{selSkills.join(', ')}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[s.confirmBtn, (!weapon || actionsLeft < 1) && s.confirmBtnDisabled]}
        onPress={confirm}
        disabled={!weapon || actionsLeft < 1}
      >
        <Text style={s.confirmBtnText}>Confirmar Ataque  −1 Ação  −1 Energia</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Painel de Defesa ─────────────────────────────────────────────────────────
function DefendPanel({ actionsLeft, onConfirm }) {
  const { character, dispatch } = useCharacter();
  const { skills } = character;
  const reflexo   = skills?.reflexo   ?? 0;
  const esportes  = skills?.esportes  ?? 0;
  const [mode, setMode] = useState('bloquear');

  const { totalArmadura } = computeDefenseTotals(character.equipment, character.accessories);

  function confirm() {
    if (actionsLeft < 1) return;
    if (mode === 'esquivar') {
      dispatch({ type: 'CHANGE_STATUS', key: 'energia', delta: -1 });
    }
    onConfirm();
  }

  return (
    <View>
      <View style={s.chipRow}>
        <TouchableOpacity style={[s.chip, mode === 'bloquear' && s.chipActive]} onPress={() => setMode('bloquear')}>
          <Text style={[s.chipText, mode === 'bloquear' && s.chipTextActive]}>🛡 Bloquear</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.chip, mode === 'esquivar' && s.chipActive]} onPress={() => setMode('esquivar')}>
          <Text style={[s.chipText, mode === 'esquivar' && s.chipTextActive]}>💨 Esquivar</Text>
        </TouchableOpacity>
      </View>

      {mode === 'bloquear' ? (
        <View style={s.formulaCard}>
          <Text style={s.formulaTitle}>🛡️ Bloqueio</Text>
          <View style={s.statLine}>
            <Text style={s.statLineLabel}>Armadura Total</Text>
            <Text style={s.statLineVal}>{totalArmadura}</Text>
          </View>
          <Text style={s.formulaNote}>Reduz dano recebido pelo valor de armadura</Text>
        </View>
      ) : (
        <View style={s.formulaCard}>
          <Text style={s.formulaTitle}>💨 Esquiva</Text>
          <View style={s.formulaParts}>
            <View style={s.formulaPart}>
              <Text style={s.formulaVal}>{reflexo}</Text>
              <Text style={s.formulaLbl}>Reflexo</Text>
            </View>
            <Text style={s.formulaOp}>+</Text>
            <View style={s.formulaPart}>
              <Text style={s.formulaVal}>{esportes}</Text>
              <Text style={s.formulaLbl}>Esportes</Text>
            </View>
            <Text style={s.formulaOp}>+</Text>
            <View style={s.formulaPart}>
              <Text style={s.formulaVal}>d20</Text>
              <Text style={s.formulaLbl}>Dado</Text>
            </View>
          </View>
          <Text style={s.formulaNote}>Soma total vs dificuldade do ataque</Text>
        </View>
      )}

      <TouchableOpacity
        style={[s.confirmBtn, actionsLeft < 1 && s.confirmBtnDisabled]}
        onPress={confirm}
        disabled={actionsLeft < 1}
      >
        <Text style={s.confirmBtnText}>
          {mode === 'esquivar'
            ? 'Confirmar Esquiva  −1 Ação  −1 Energia'
            : 'Confirmar Bloqueio  −1 Ação'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Painel de Magia ──────────────────────────────────────────────────────────
function MagicPanel({ actionsLeft, onConfirm }) {
  const { character, dispatch } = useCharacter();
  const { attributes: attrs, skills } = character;
  const raciocinio = attrs?.concentracao?.raciocinio ?? 0;
  const magia      = skills?.magia                  ?? 0;
  const manaAtual  = character.status?.mana?.current ?? 0;

  const acquiredTitles = character.titles?.acquired ?? [];
  const castBonus = CAST_BONUS_TITLES.some(id => acquiredTitles.includes(id)) ? 4 : 0;
  const manaReduce = MANA_REDUCE_TITLES.some(id => acquiredTitles.includes(id)) ? 1 : 0;

  const spells = getAcquiredMagicSpells(character.skillTree?.acquiredTrails);
  const [selSpell, setSelSpell] = useState(null);
  const [doubleFaixo, setDoubleAlcance] = useState(false);
  const [expanded, setExpanded]   = useState(null);

  const spell = spells.find(sp => sp.skillId === selSpell) ?? null;
  const custoBruto = spell ? Math.max(1, spell.custo - manaReduce) : 0;
  const custoFinal = custoBruto + (doubleFaixo ? 1 : 0);
  const podeUsarMana = custoFinal <= manaAtual;

  function confirm() {
    if (!spell || !podeUsarMana || actionsLeft < 1) return;
    dispatch({ type: 'CHANGE_STATUS', key: 'mana', delta: -custoFinal });
    onConfirm();
    setSelSpell(null);
    setDoubleAlcance(false);
  }

  if (spells.length === 0) {
    return (
      <View style={s.emptyCard}>
        <Text style={s.emptyText}>Nenhuma magia adquirida. Aprenda magias na aba Habilidades.</Text>
      </View>
    );
  }

  return (
    <View>
      {/* Fórmula de conjuração */}
      <View style={s.formulaCard}>
        <Text style={s.formulaTitle}>🔮 Teste de Conjuração</Text>
        <View style={s.formulaParts}>
          <View style={s.formulaPart}>
            <Text style={s.formulaVal}>{raciocinio}</Text>
            <Text style={s.formulaLbl}>Raciocínio</Text>
          </View>
          <Text style={s.formulaOp}>+</Text>
          <View style={s.formulaPart}>
            <Text style={s.formulaVal}>{magia}</Text>
            <Text style={s.formulaLbl}>Magia</Text>
          </View>
          {castBonus > 0 && (
            <>
              <Text style={s.formulaOp}>+</Text>
              <View style={s.formulaPart}>
                <Text style={[s.formulaVal, { color: '#a6e3a1' }]}>{castBonus}</Text>
                <Text style={s.formulaLbl}>Bônus Título</Text>
              </View>
            </>
          )}
          <Text style={s.formulaOp}>+</Text>
          <View style={s.formulaPart}>
            <Text style={s.formulaVal}>d20</Text>
            <Text style={s.formulaLbl}>Dado</Text>
          </View>
        </View>
        <Text style={s.formulaNote}>Base: {raciocinio + magia + castBonus} + d20 vs dificuldade</Text>
      </View>

      {/* Lista de magias */}
      <Text style={s.subLabel}>Selecione a Magia</Text>
      {spells.map(sp => {
        const custo = Math.max(1, sp.custo - manaReduce);
        const semMana = custo > manaAtual;
        const isSelected = selSpell === sp.skillId;
        const isExpanded = expanded === sp.skillId;

        return (
          <View key={sp.skillId} style={[s.spellCard, isSelected && s.spellCardActive, semMana && s.spellCardNoMana]}>
            <TouchableOpacity
              style={s.spellHeader}
              onPress={() => {
                setSelSpell(isSelected ? null : sp.skillId);
                setDoubleAlcance(false);
              }}
              onLongPress={() => setExpanded(isExpanded ? null : sp.skillId)}
              activeOpacity={0.8}
            >
              <View style={s.spellTitleRow}>
                <Text style={[s.spellName, isSelected && s.spellNameActive]}>{sp.skillNome}</Text>
                <View style={[s.levelBadge, isSelected && s.levelBadgeActive]}>
                  <Text style={[s.levelBadgeText, isSelected && s.levelBadgeTextActive]}>Nv {sp.level}</Text>
                </View>
              </View>
              <Text style={s.spellTrail}>{sp.trailNome}</Text>
              <View style={s.spellStats}>
                <Text style={[s.spellStat, semMana && { color: '#f38ba8' }]}>🔵 {custo} mana</Text>
                <Text style={s.spellStat}>🎯 {sp.dificuldade}</Text>
                {sp.alcance != null && <Text style={s.spellStat}>📏 {sp.alcance}m</Text>}
                {sp.raio != null && <Text style={s.spellStat}>💫 Raio {sp.raio}m</Text>}
                <Text style={s.spellStat}>⏱ {sp.duracao}</Text>
              </View>
              {semMana && <Text style={s.noManaHint}>Mana insuficiente</Text>}
            </TouchableOpacity>

            {(isExpanded || isSelected) && sp.efeito ? (
              <View style={s.spellEfeito}>
                <Text style={s.spellEfeitoText}>{sp.efeito}</Text>
              </View>
            ) : null}

            {isSelected && !semMana && (
              <View style={s.spellActions}>
                {sp.alcance != null && (
                  <TouchableOpacity
                    style={[s.spellActionBtn, doubleFaixo && s.spellActionBtnActive]}
                    onPress={() => setDoubleAlcance(v => !v)}
                  >
                    <Text style={[s.spellActionText, doubleFaixo && s.spellActionTextActive]}>
                      Dobrar alcance +1 mana → {sp.alcance * 2}m
                    </Text>
                  </TouchableOpacity>
                )}
                <View style={s.custoRow}>
                  <Text style={s.custoLabel}>Custo final:</Text>
                  <Text style={s.custoVal}>{custoFinal} mana</Text>
                  <Text style={s.custoMana}>(você tem {manaAtual})</Text>
                </View>
              </View>
            )}
          </View>
        );
      })}

      {spell && (
        <TouchableOpacity
          style={[s.confirmBtn, (!podeUsarMana || actionsLeft < 1) && s.confirmBtnDisabled]}
          onPress={confirm}
          disabled={!podeUsarMana || actionsLeft < 1}
        >
          <Text style={s.confirmBtnText}>
            Conjurar {spell.skillNome}  −1 Ação  −{custoFinal} Mana
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Painel de Reações ────────────────────────────────────────────────────────
function ReactionsPanel() {
  const { character } = useCharacter();
  const acquiredTitles = character.titles?.acquired ?? [];

  const reactions = Object.entries(REACTION_TITLES)
    .filter(([id]) => acquiredTitles.includes(id))
    .map(([id, desc]) => ({ id, nome: TITLE_BY_ID[id]?.nome ?? id, desc }));

  if (reactions.length === 0) {
    return (
      <View style={s.emptyCard}>
        <Text style={s.emptyText}>
          Nenhuma reação disponível. Títulos como Conjurador Tático, Moldador do Tempo, Ilusionista e Executor conferem reações.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={s.hint}>Reações ocorrem fora do seu turno. Não consomem sua ação.</Text>
      {reactions.map(r => (
        <View key={r.id} style={s.reactionCard}>
          <Text style={s.reactionNome}>{r.nome}</Text>
          <Text style={s.reactionDesc}>{r.desc}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Tela Principal ───────────────────────────────────────────────────────────
const TABS = ['Atacar', 'Defender', 'Magia', 'Reações'];

export default function TurnAssistantScreen() {
  const { character } = useCharacter();
  const [tab, setTab]         = useState('Atacar');
  const [actions, setActions] = useState(2);
  const [turn, setTurn]       = useState(1);

  const manaAtual    = character.status?.mana?.current    ?? 0;
  const energiaAtual = character.status?.energia?.current ?? 0;

  function spendAction() {
    setActions(a => Math.max(0, a - 1));
  }

  function nextTurn() {
    setActions(2);
    setTurn(t => t + 1);
  }

  function resetCombat() {
    setActions(2);
    setTurn(1);
  }

  return (
    <View style={s.screen}>
      {/* Header do turno */}
      <View style={s.turnHeader}>
        <View style={s.turnInfo}>
          <Text style={s.turnLabel}>TURNO</Text>
          <Text style={s.turnNum}>{turn}</Text>
        </View>

        <View style={s.actionsBlock}>
          <Text style={s.actionsLabel}>AÇÕES</Text>
          <View style={s.actionsDots}>
            {[0, 1].map(i => (
              <View key={i} style={[s.actionDot, i < actions ? s.actionDotActive : s.actionDotEmpty]} />
            ))}
          </View>
          <Text style={s.actionsNum}>{actions}/2</Text>
        </View>

        <View style={s.resourceMini}>
          <Text style={s.resMiniItem}>⚡ {energiaAtual}</Text>
          <Text style={s.resMiniItem}>🔵 {manaAtual}</Text>
        </View>

        <TouchableOpacity style={s.nextTurnBtn} onPress={nextTurn}>
          <Text style={s.nextTurnText}>Próximo{'\n'}Turno ▶</Text>
        </TouchableOpacity>
      </View>

      {actions === 0 && (
        <View style={s.noActionsBanner}>
          <Text style={s.noActionsText}>Ações esgotadas — aguarde o próximo turno</Text>
          <TouchableOpacity style={s.resetBtn} onPress={resetCombat}>
            <Text style={s.resetBtnText}>Reiniciar Combate</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tabs */}
      <View style={s.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity key={t} style={[s.tabBtn, tab === t && s.tabBtnActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.body} contentContainerStyle={s.bodyContent}>
        {tab === 'Atacar'  && <AttackPanel  actionsLeft={actions} onConfirm={spendAction} />}
        {tab === 'Defender' && <DefendPanel  actionsLeft={actions} onConfirm={spendAction} />}
        {tab === 'Magia'   && <MagicPanel   actionsLeft={actions} onConfirm={spendAction} />}
        {tab === 'Reações' && <ReactionsPanel />}
      </ScrollView>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#11111b' },

  // Header turno
  turnHeader: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1e1e2e', padding: 12, gap: 10,
    borderBottomWidth: 1, borderBottomColor: '#2e2e4e',
  },
  turnInfo:   { alignItems: 'center', minWidth: 40 },
  turnLabel:  { color: '#6c7086', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  turnNum:    { color: '#cdd6f4', fontSize: 22, fontWeight: 'bold' },

  actionsBlock: { alignItems: 'center' },
  actionsLabel: { color: '#6c7086', fontSize: 9, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  actionsDots:  { flexDirection: 'row', gap: 6, marginBottom: 2 },
  actionDot:      { width: 14, height: 14, borderRadius: 7 },
  actionDotActive:{ backgroundColor: '#89b4fa' },
  actionDotEmpty: { backgroundColor: '#313244', borderWidth: 1, borderColor: '#45475a' },
  actionsNum:   { color: '#89b4fa', fontSize: 12, fontWeight: '700' },

  resourceMini:   { flex: 1, gap: 2 },
  resMiniItem:    { color: '#6c7086', fontSize: 12 },

  nextTurnBtn: {
    backgroundColor: '#313244', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center',
  },
  nextTurnText: { color: '#89b4fa', fontSize: 11, fontWeight: '700', textAlign: 'center' },

  noActionsBanner: {
    backgroundColor: '#45273a', padding: 10, alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#f38ba8', gap: 6,
  },
  noActionsText: { color: '#f38ba8', fontSize: 13, fontWeight: '600' },
  resetBtn:      { backgroundColor: '#313244', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 4 },
  resetBtnText:  { color: '#cdd6f4', fontSize: 12 },

  // Tabs
  tabBar: {
    flexDirection: 'row', backgroundColor: '#181825',
    borderBottomWidth: 1, borderBottomColor: '#2e2e4e',
  },
  tabBtn:       { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: '#89b4fa' },
  tabText:      { color: '#6c7086', fontSize: 12, fontWeight: '600' },
  tabTextActive:{ color: '#89b4fa' },

  // Body
  body:        { flex: 1 },
  bodyContent: { padding: 14, paddingBottom: 40 },

  subLabel: { color: '#6c7086', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, marginTop: 10 },
  hint:     { color: '#45475a', fontSize: 12, fontStyle: 'italic', marginBottom: 8 },

  emptyCard: { backgroundColor: '#1e1e2e', borderRadius: 10, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#2e2e4e' },
  emptyText: { color: '#6c7086', fontSize: 13, textAlign: 'center', lineHeight: 20 },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip:    { backgroundColor: '#1e1e2e', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#2e2e4e', minWidth: 80 },
  chipActive:       { backgroundColor: '#1e3a5f', borderColor: '#89b4fa' },
  chipText:         { color: '#6c7086', fontSize: 13, fontWeight: '600' },
  chipTextActive:   { color: '#89b4fa' },
  chipSub:          { color: '#45475a', fontSize: 10, marginTop: 2 },
  chipSubActive:    { color: '#7db8f7' },

  // Fórmula
  formulaCard:  { backgroundColor: '#1e1e2e', borderRadius: 10, padding: 14, marginVertical: 8, borderWidth: 1, borderColor: '#2e2e4e' },
  formulaTitle: { color: '#cdd6f4', fontSize: 13, fontWeight: '700', marginBottom: 10 },
  formulaParts: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  formulaPart:  { alignItems: 'center', minWidth: 50 },
  formulaVal:   { color: '#cdd6f4', fontSize: 20, fontWeight: 'bold' },
  formulaLbl:   { color: '#6c7086', fontSize: 10, textAlign: 'center' },
  formulaOp:    { color: '#45475a', fontSize: 18, fontWeight: 'bold', alignSelf: 'center' },
  formulaTotal: { backgroundColor: '#1e3a5f', borderRadius: 8, padding: 6 },
  formulaTotalVal: { color: '#89b4fa', fontSize: 22, fontWeight: 'bold' },
  formulaNote:  { color: '#45475a', fontSize: 11, marginTop: 8, fontStyle: 'italic' },
  statLine:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  statLineLabel:{ color: '#6c7086', fontSize: 13 },
  statLineVal:  { color: '#cdd6f4', fontSize: 20, fontWeight: 'bold' },

  // Habilidades de arma
  skillRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#1e1e2e', borderRadius: 8, padding: 10, marginBottom: 4, borderWidth: 1, borderColor: '#2e2e4e' },
  skillRowActive: { borderColor: '#a6e3a1', backgroundColor: '#1a2e1a' },
  skillCheck:     { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: '#45475a', alignItems: 'center', justifyContent: 'center' },
  skillCheckActive: { backgroundColor: '#a6e3a1', borderColor: '#a6e3a1' },
  skillCheckMark: { color: '#11111b', fontSize: 12, fontWeight: 'bold' },
  skillName:      { color: '#6c7086', fontSize: 13, flex: 1 },
  skillNameActive:{ color: '#a6e3a1' },
  skillLevel:     { color: '#45475a', fontSize: 11 },

  effectsNote:  { backgroundColor: '#1a2e1a', borderRadius: 8, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: '#a6e3a1' },
  effectsLabel: { color: '#a6e3a1', fontSize: 11, fontWeight: '700', marginBottom: 2 },
  effectsList:  { color: '#cdd6f4', fontSize: 12 },

  // Magias
  spellCard:       { backgroundColor: '#1e1e2e', borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#2e2e4e', overflow: 'hidden' },
  spellCardActive: { borderColor: '#cba6f7' },
  spellCardNoMana: { opacity: 0.55 },
  spellHeader:     { padding: 12 },
  spellTitleRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  spellName:       { color: '#cdd6f4', fontSize: 14, fontWeight: '700', flex: 1 },
  spellNameActive: { color: '#cba6f7' },
  spellTrail:      { color: '#45475a', fontSize: 11, marginBottom: 6 },
  spellStats:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  spellStat:       { color: '#6c7086', fontSize: 12 },
  noManaHint:      { color: '#f38ba8', fontSize: 11, marginTop: 4 },
  levelBadge:      { backgroundColor: '#313244', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  levelBadgeActive:{ backgroundColor: '#4a3060' },
  levelBadgeText:  { color: '#6c7086', fontSize: 11, fontWeight: '700' },
  levelBadgeTextActive: { color: '#cba6f7' },
  spellEfeito:     { backgroundColor: '#181825', padding: 12, borderTopWidth: 1, borderTopColor: '#2e2e4e' },
  spellEfeitoText: { color: '#a6adc8', fontSize: 12, lineHeight: 18 },
  spellActions:    { backgroundColor: '#181825', padding: 10, borderTopWidth: 1, borderTopColor: '#2e2e4e', gap: 6 },
  spellActionBtn:  { backgroundColor: '#313244', borderRadius: 6, padding: 8 },
  spellActionBtnActive: { backgroundColor: '#4a3060', borderWidth: 1, borderColor: '#cba6f7' },
  spellActionText: { color: '#6c7086', fontSize: 12 },
  spellActionTextActive: { color: '#cba6f7', fontWeight: '600' },
  custoRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  custoLabel:      { color: '#6c7086', fontSize: 12, flex: 1 },
  custoVal:        { color: '#cba6f7', fontSize: 16, fontWeight: 'bold' },
  custoMana:       { color: '#45475a', fontSize: 11 },

  // Reações
  reactionCard: { backgroundColor: '#1e1e2e', borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#f9e2af40' },
  reactionNome: { color: '#f9e2af', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  reactionDesc: { color: '#a6adc8', fontSize: 13, lineHeight: 19 },

  // Confirmar
  confirmBtn:         { backgroundColor: '#89b4fa', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 12 },
  confirmBtnDisabled: { backgroundColor: '#313244' },
  confirmBtnText:     { color: '#11111b', fontSize: 14, fontWeight: '700' },
});
