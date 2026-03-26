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

// Tipo de dano por categoria de arma
const WEAPON_DAMAGE_TYPES = {
  'ESPADAS':            ['Cortante'],
  'MACHADOS':           ['Cortante'],
  'ARMAS LONGAS':       ['Perfurante'],
  'ARCOS':              ['Perfurante'],
  'ARMAS CURTAS':       ['Cortante', 'Perfurante'],
  'CETROS MÁGICOS':     ['Contundente', 'Mágico'],
  'VARINHAS':           ['Mágico'],
  'ESCUDOS':            ['Contundente'],
  'SUPORTE DE CAMPO':   ['Suporte'],
  'SUPORTE MÁGICO':     ['Mágico'],
  'SUPORTE CERIMONIAL': ['Suporte'],
};

const DAMAGE_TYPE_COLORS = {
  Cortante:    '#f38ba8',
  Perfurante:  '#fab387',
  Contundente: '#a6e3a1',
  Mágico:      '#cba6f7',
  Suporte:     '#89b4fa',
};

// Palavras-chave de efeitos nos textos das habilidades

function getWeaponDamageTypes(tipoId) {
  const trail = trailById(tipoId);
  return WEAPON_DAMAGE_TYPES[trail?.categoria ?? ''] ?? [];
}


// ─── Dados de Mira ────────────────────────────────────────────────────────────

const ALVOS_HUMANOIDE = [
  {
    id: 'membros',
    label: 'Membros',
    dificuldade: 20,
    cortanteOnly: false,
    efeitos: [
      { hits: 1, efeito: '+5 dificuldade em ações na cena' },
      { hits: 2, efeito: '+10 dificuldade em ações na cena' },
      { hits: 3, efeito: 'Perde função do membro até se recuperar' },
      { hits: 4, efeito: 'Decepação do membro' },
    ],
    nota: 'Efeito acumula a cada acerto consecutivo no mesmo membro',
  },
  {
    id: 'orgaos',
    label: 'Órgãos',
    dificuldade: 25,
    cortanteOnly: true,
    efeito: 'Causa 3 de Sangramento (requer dano Cortante)',
  },
  {
    id: 'coracao',
    label: 'Coração',
    dificuldade: 30,
    cortanteOnly: true,
    efeito: 'Causa 6 de Sangramento (requer dano Cortante)',
  },
  {
    id: 'cabeca',
    label: 'Cabeça',
    dificuldade: 35,
    cortanteOnly: false,
    efeito: 'Desmaio. Alvo faz 1 teste/turno para despertar (Concentração + d20 ≥ 50 − Vida máxima); falha reduz dificuldade em 5 no próximo',
  },
];

const ALVOS_OBJETO_TAMANHO = ['Grande', 'Médio', 'Pequeno'];
const ALVOS_OBJETO_VELOC   = ['Normal', 'Rápido/Assimétrico'];
const OBJETO_DIFICULDADE   = {
  'Grande-Normal': 20, 'Médio-Normal': 20, 'Pequeno-Normal': 20,
  'Grande-Rápido/Assimétrico': 25,
  'Médio-Rápido/Assimétrico':  30,
  'Pequeno-Rápido/Assimétrico': 35,
};

const TAMANHO_VOLUME = { Grande: 'acima de 2m³', Médio: 'entre 1-2m³', Pequeno: 'abaixo de 1m³' };

// ─── Componente de Mira ───────────────────────────────────────────────────────
function MiraPanel({ damageTypes }) {
  const [tipoAlvo, setTipoAlvo]   = useState(null);  // 'humanoide' | 'objeto'
  const [alvoId, setAlvoId]       = useState(null);
  const [objTam, setObjTam]       = useState('Médio');
  const [objVeloc, setObjVeloc]   = useState('Normal');

  const dificuldadeObj = OBJETO_DIFICULDADE[`${objTam}-${objVeloc}`] ?? 20;
  const alvoHum = ALVOS_HUMANOIDE.find(a => a.id === alvoId);
  const isCortante = damageTypes.includes('Cortante');

  return (
    <View style={s.miraBox}>
      <Text style={s.subLabel}>Mira (opcional)</Text>

      {/* Tipo de alvo */}
      <View style={s.chipRow}>
        {[['humanoide', '🧍 Humanoide'], ['objeto', '📦 Objeto']].map(([id, lbl]) => (
          <TouchableOpacity
            key={id}
            style={[s.chip, tipoAlvo === id && s.chipActive]}
            onPress={() => { setTipoAlvo(tipoAlvo === id ? null : id); setAlvoId(null); }}
          >
            <Text style={[s.chipText, tipoAlvo === id && s.chipTextActive]}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Humanoide: partes do corpo */}
      {tipoAlvo === 'humanoide' && (
        <>
          <View style={s.chipRow}>
            {ALVOS_HUMANOIDE.map(a => {
              const bloqueado = a.cortanteOnly && !isCortante;
              return (
                <TouchableOpacity
                  key={a.id}
                  style={[s.chip, alvoId === a.id && s.chipActive, bloqueado && s.chipDisabled]}
                  onPress={() => !bloqueado && setAlvoId(alvoId === a.id ? null : a.id)}
                  disabled={bloqueado}
                >
                  <Text style={[s.chipText, alvoId === a.id && s.chipTextActive, bloqueado && s.chipTextDisabled]}>
                    {a.label}
                  </Text>
                  <Text style={[s.chipSub, alvoId === a.id && s.chipSubActive, bloqueado && s.chipTextDisabled]}>
                    {bloqueado ? 'requer Cortante' : `dif. ${a.dificuldade}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {alvoHum && (
            <View style={s.miraResult}>
              <View style={s.miraDifRow}>
                <Text style={s.miraDifLabel}>Dificuldade do acerto</Text>
                <Text style={s.miraDifVal}>{alvoHum.dificuldade}</Text>
              </View>
              {'efeitos' in alvoHum ? (
                <>
                  {alvoHum.efeitos.map(e => (
                    <View key={e.hits} style={s.miraEfeitoRow}>
                      <Text style={s.miraEfeitoHits}>{e.hits}×</Text>
                      <Text style={s.miraEfeitoText}>{e.efeito}</Text>
                    </View>
                  ))}
                  {alvoHum.nota && <Text style={s.miraNota}>{alvoHum.nota}</Text>}
                </>
              ) : (
                <Text style={s.miraEfeitoSingle}>{alvoHum.efeito}</Text>
              )}
            </View>
          )}
        </>
      )}

      {/* Objeto: tamanho + velocidade */}
      {tipoAlvo === 'objeto' && (
        <>
          <Text style={s.miraSubLabel}>Tamanho</Text>
          <View style={s.chipRow}>
            {ALVOS_OBJETO_TAMANHO.map(t => (
              <TouchableOpacity key={t} style={[s.chip, objTam === t && s.chipActive]} onPress={() => setObjTam(t)}>
                <Text style={[s.chipText, objTam === t && s.chipTextActive]}>{t}</Text>
                <Text style={[s.chipSub, objTam === t && s.chipSubActive]}>{TAMANHO_VOLUME[t]}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.miraSubLabel}>Velocidade</Text>
          <View style={s.chipRow}>
            {ALVOS_OBJETO_VELOC.map(v => (
              <TouchableOpacity key={v} style={[s.chip, objVeloc === v && s.chipActive]} onPress={() => setObjVeloc(v)}>
                <Text style={[s.chipText, objVeloc === v && s.chipTextActive]}>{v}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.miraResult}>
            <View style={s.miraDifRow}>
              <Text style={s.miraDifLabel}>Dificuldade do acerto</Text>
              <Text style={s.miraDifVal}>{dificuldadeObj}</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}


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

// Habilidades que adicionam stats ao BLOQUEIO
// confronto Nv1 = vigor incondicional; Nv2 = robustez condicional (mostramos mas não somamos)
// bloqueador Nv1 = briga condicional
// fatiador Nv1 = armasBrancas (dano E bloqueio)
const WEAPON_SKILL_BLOCK_MODS = {
  fatiador:  { minLevel: 1, statKey: 'armasBrancas', statLabel: 'Armas Brancas',
    multiplier: (selLv) => selLv >= 3 ? 2 : 1, unconditional: true },
  confronto: { minLevel: 1, statKey: 'vigor',        statLabel: 'Vigor',
    multiplier: () => 1, unconditional: true },
};

// Retorna as skills de bloqueio de TODAS as armas equipadas (escudos + outras)
function getAllBlockSkills(equipment, acquiredTrails) {
  const out = []; // [{ weaponNome, slotKey, skills }]
  for (const slotKey of HAND_SLOTS) {
    const eq = equipment[slotKey];
    if (!eq?.tipo && !eq?.nome) continue;
    const isShield = trailById(eq.tipo)?.categoria === 'ESCUDOS';
    const wSkills = getWeaponSkills(eq.tipo, acquiredTrails, eq.tipo2);
    // Para escudos: todas as skills são relevantes para bloqueio
    // Para outras armas: só as que têm block mod
    const relevant = isShield
      ? wSkills
      : wSkills.filter(sk => WEAPON_SKILL_BLOCK_MODS[sk.id]);
    if (relevant.length > 0) {
      out.push({ slotKey, weaponNome: eq.nome || eq.tipo || slotKey, isShield, skills: relevant });
    }
  }
  return out;
}

function getBlockBonuses(blockWeapons, allLevels, characterSkills) {
  const bonuses = [];
  for (const { skills } of blockWeapons) {
    for (const sk of skills) {
      const mod = WEAPON_SKILL_BLOCK_MODS[sk.id];
      if (!mod || !mod.unconditional) continue;
      const selLv = allLevels[sk.id] ?? 0;
      if (selLv < mod.minLevel) continue;
      const val = (characterSkills[mod.statKey] ?? 0) * mod.multiplier(selLv);
      bonuses.push({ label: mod.statLabel, val });
    }
  }
  return bonuses;
}

// ─── Modificadores numéricos por habilidade de arma ───────────────────────────

// Habilidades que adicionam uma perícia ao dano (e eventualmente ao acerto)
// minLevel = nível mínimo selecionado para o bônus entrar
// tripleInTwoHand = true para respeitar a regra "perícia×3 em 2 mãos"
const WEAPON_SKILL_DAMAGE_MODS = {
  // fatiador (machado_do_norte + luvas_de_batalha): "Soma armas brancas no dano"
  // Nv3 duplica efeitos do Nv1 → multiplicador 2 quando selLv >= 3
  fatiador: { minLevel: 1, statKey: 'armasBrancas', label: 'Armas Brancas', tripleInTwoHand: true,
    multiplier: (selLv) => selLv >= 3 ? 2 : 1 },
  // fighter (luvas_de_batalha) Nv2: "Soma Briga em acerto e dano"
  fighter:  { minLevel: 2, statKey: 'briga', label: 'Briga', tripleInTwoHand: true,
    multiplier: () => 1, acerto: true },
};

// Retorna bonuses de dano de habilidades selecionadas
// Retorna [{ label, val, tripleInTwoHand, acerto }]
function getSkillDamageBonuses(acquiredSkills, skillLevels, characterSkills) {
  const out = [];
  for (const sk of acquiredSkills) {
    const mod = WEAPON_SKILL_DAMAGE_MODS[sk.id];
    if (!mod) continue;
    const selLv = skillLevels[sk.id] ?? 0;
    if (selLv < mod.minLevel) continue;
    const baseVal = characterSkills[mod.statKey] ?? 0;
    const mult    = mod.multiplier(selLv);
    out.push({ label: mod.label, val: baseVal * mult,
               tripleInTwoHand: mod.tripleInTwoHand, acerto: mod.acerto ?? false });
  }
  return out;
}

// Extrai efeitos com quantidade dos textos das habilidades selecionadas
const EFFECT_PARSERS = [
  { re: /(\d+)\s*de\s*pressão/i,     label: 'Pressão' },
  { re: /(\d+)\s*de\s*sangramento/i, label: 'Sangramento' },
  { re: /(\d+)\s*de\s*veneno/i,      label: 'Veneno' },
  { re: /perfura|penetra/i,          label: 'Penetração', fixed: 1 },
  { re: /engajado/i,                 label: 'Engajado',   fixed: 1 },
  { re: /desmaio|desmaia/i,          label: 'Desmaio',    fixed: 1 },
  { re: /deslocamento/i,             label: 'Deslocamento', fixed: 1 },
];

function extractEffectsWithQty(skills, skillLevels) {
  const totals = {};
  for (const sk of skills) {
    const selLv = skillLevels[sk.id] ?? 0;
    // fatiador Nv3 duplica efeitos
    const mult = (sk.id === 'fatiador' && selLv >= 3) ? 2 : 1;
    for (let lv = 1; lv <= selLv; lv++) {
      const desc = typeof sk.niveis[String(lv)] === 'string' ? sk.niveis[String(lv)] : '';
      for (const p of EFFECT_PARSERS) {
        const m = p.re.exec(desc);
        if (m) {
          const qty = p.fixed ?? parseInt(m[1]);
          totals[p.label] = (totals[p.label] ?? 0) + qty * mult;
        }
      }
    }
  }
  return Object.entries(totals).map(([label, qty]) => ({ label, qty }));
}

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

// Retorna skills adquiridas da trilha da arma equipada com descrições por nível
function getWeaponSkills(tipoId, acquiredTrails, tipo2Id) {
  function skillsForTrail(id) {
    if (!id || !acquiredTrails?.[id]) return [];
    const trail = TRAILS_ARMAS.find(t => t.id === id);
    if (!trail) return [];
    const trailData = acquiredTrails[id];
    return trail.skills
      .map(sk => ({
        id:     sk.id,
        nome:   sk.nome,
        level:  trailData.skills?.[sk.id] ?? 0,
        niveis: sk.niveis ?? {},
      }))
      .filter(sk => sk.level > 0);
  }
  const primary   = skillsForTrail(tipoId);
  const secondary = skillsForTrail(tipo2Id);
  // Mescla sem duplicatas (prioriza o nível mais alto se a mesma skill aparecer nas duas trilhas)
  const merged = [...primary];
  for (const sk of secondary) {
    const existing = merged.find(s => s.id === sk.id);
    if (!existing) merged.push(sk);
    else if (sk.level > existing.level) existing.level = sk.level;
  }
  return merged;
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
function AttackPanel({ actionsLeft, onConfirm, blockedThisTurn }) {
  const { character, dispatch } = useCharacter();
  const { attributes: attrs, skills } = character;
  const forca        = attrs?.robustez?.forca    ?? 0;
  const destreza     = attrs?.robustez?.destreza ?? 0;
  const armasBrancas = skills?.armasBrancas      ?? 0;
  const armasRange   = skills?.armasRange        ?? 0;
  const esportes     = skills?.esportes          ?? 0;

  const acquiredTitles = character.titles?.acquired ?? [];
  const hasBarbaro = acquiredTitles.includes('barbaro');
  const hasAlgoz   = acquiredTitles.includes('algoz');
  const hasSoldado = acquiredTitles.includes('soldado');
  const vidaAtual  = character.status?.vida?.current ?? 0;
  const vidaMax    = character.status?.vida?.max     ?? 0;
  const vidaPerdida = Math.max(0, vidaMax - vidaAtual);

  const [selSlot,   setSelSlot]   = useState(null);
  const [twoHand,   setTwoHand]   = useState(false);
  // { [skillId]: selectedLevel }  — 0 = não usar
  const [skillLevels, setSkillLevels] = useState({});

  const weapons = HAND_SLOTS
    .map(k => ({ key: k, label: EQUIP_LABELS[k], equip: character.equipment[k] }))
    .filter(w => w.equip.tipo || w.equip.nome);

  const weapon = weapons.find(w => w.key === selSlot)?.equip ?? null;
  const nivel  = weapon?.nivel ?? 1;
  const ranged = weapon ? isRanged(weapon.tipo) : false;
  const magicW = weapon ? isMagicWeapon(weapon.tipo) : false;

  // Fórmula de dano base
  let formula = null;
  let acertoFormula = null; // separado para armas de distância
  if (weapon) {
    if (ranged) {
      acertoFormula = {
        partes: [
          { label: 'Armas Range', val: armasRange },
          { label: 'Destreza', val: destreza },
          { label: 'd20', val: 'd20', dado: true },
        ],
        total: armasRange + destreza,
      };
      formula = {
        partes: [
          { label: `Nível (${nivel})`, val: nivel },
          { label: 'Força', val: forca },
        ],
        total: nivel + forca,
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

  const acquiredSkills = weapon
    ? getWeaponSkills(weapon.tipo, character.skillTree?.acquiredTrails, weapon.tipo2)
    : [];

  // Bônus de dano de habilidades selecionadas
  const skillDamageBonuses = getSkillDamageBonuses(acquiredSkills, skillLevels, skills ?? {});

  // Adiciona bônus de habilidades à fórmula
  if (formula && skillDamageBonuses.length > 0) {
    for (const bonus of skillDamageBonuses) {
      const effectiveVal = (twoHand && bonus.tripleInTwoHand) ? bonus.val * 3 : bonus.val;
      const lbl = (twoHand && bonus.tripleInTwoHand) ? `${bonus.label}×3 (${bonus.val}×3)` : bonus.label;
      formula.partes.push({ label: lbl, val: effectiveVal });
      formula.total += effectiveVal;
    }
  }

  // Título Bárbaro: soma Esportes ao dano quando há vida perdida (ataques físicos)
  if (formula && !ranged && hasBarbaro && vidaPerdida > 0 && esportes > 0) {
    formula.partes.push({ label: `Esportes (Bárbaro)`, val: esportes });
    formula.total += esportes;
  }
  // Título Algoz: soma vida perdida ao dano em ataques com 2 mãos
  if (formula && twoHand && hasAlgoz && vidaPerdida > 0) {
    formula.partes.push({ label: `Vida perdida (Algoz)`, val: vidaPerdida });
    formula.total += vidaPerdida;
  }
  // Título Soldado: soma Armas Brancas ao dano se bloqueou neste turno
  if (formula && !ranged && hasSoldado && blockedThisTurn && armasBrancas > 0) {
    formula.partes.push({ label: `Armas Brancas (Soldado)`, val: armasBrancas });
    formula.total += armasBrancas;
  }

  // Energia total = 1 (ataque) + soma dos níveis selecionados de habilidades
  const skillEnergyCost = Object.values(skillLevels).reduce((acc, lv) => acc + lv, 0);
  const totalEnergy = 1 + skillEnergyCost;
  const energiaAtual = character.status?.energia?.current ?? 0;
  const actionCost = twoHand ? 2 : 1;
  const podeAtacar = !!weapon && actionsLeft >= actionCost && energiaAtual >= totalEnergy;

  function setSkillLevel(skillId, lv) {
    setSkillLevels(prev => ({ ...prev, [skillId]: lv }));
  }

  function confirm() {
    if (!podeAtacar) return;
    dispatch({ type: 'CHANGE_STATUS', statusKey: 'energia', field: 'current', delta: -totalEnergy });
    onConfirm();
    if (twoHand) onConfirm(); // 2ª ação gasta
    setSkillLevels({});
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
                onPress={() => { setSelSlot(w.key); setTwoHand(false); setSkillLevels({}); }}
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

      {acertoFormula && (
        <View style={s.formulaCard}>
          <Text style={s.formulaTitle}>🎯 Teste de Acerto</Text>
          <View style={s.formulaParts}>
            {acertoFormula.partes.map((p, i) => (
              <React.Fragment key={i}>
                {i > 0 && <Text style={s.formulaOp}>+</Text>}
                <View style={s.formulaPart}>
                  <Text style={p.dado ? s.formulaValDado : s.formulaVal}>{p.val}</Text>
                  <Text style={s.formulaLbl}>{p.label}</Text>
                </View>
              </React.Fragment>
            ))}
            <Text style={s.formulaOp}>=</Text>
            <View style={[s.formulaPart, s.formulaTotal]}>
              <Text style={s.formulaTotalVal}>{acertoFormula.total} + d20</Text>
              <Text style={s.formulaLbl}>Base</Text>
            </View>
          </View>
        </View>
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
          {!ranged && <Text style={s.formulaNote}>+ d20 de acerto (role separado)</Text>}
        </View>
      )}

      {acquiredSkills.length > 0 && (
        <>
          <Text style={s.subLabel}>Habilidades da Arma</Text>
          <Text style={s.hint}>Escolha o nível a aplicar — cada nível custa 1 Energia</Text>
          {acquiredSkills.map(sk => {
            const selLv = skillLevels[sk.id] ?? 0;
            return (
              <View key={sk.id} style={[s.skillCard, selLv > 0 && s.skillCardActive]}>
                {/* Header: nome + seletor de nível */}
                <View style={s.skillCardHeader}>
                  <Text style={[s.skillName, selLv > 0 && s.skillNameActive]}>{sk.nome}</Text>
                  <View style={s.lvlPicker}>
                    {/* Botão "não usar" */}
                    <TouchableOpacity
                      style={[s.lvlBtn, selLv === 0 && s.lvlBtnOff]}
                      onPress={() => setSkillLevel(sk.id, 0)}
                    >
                      <Text style={[s.lvlBtnText, selLv === 0 && s.lvlBtnTextOff]}>—</Text>
                    </TouchableOpacity>
                    {Array.from({ length: sk.level }, (_, i) => i + 1).map(lv => (
                      <TouchableOpacity
                        key={lv}
                        style={[s.lvlBtn, selLv >= lv && s.lvlBtnActive]}
                        onPress={() => setSkillLevel(sk.id, lv)}
                      >
                        <Text style={[s.lvlBtnText, selLv >= lv && s.lvlBtnTextActive]}>
                          {lv}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    {selLv > 0 && (
                      <Text style={s.lvlCost}>−{selLv}⚡</Text>
                    )}
                  </View>
                </View>

                {/* Descrição dos níveis selecionados */}
                {selLv > 0 && Array.from({ length: selLv }, (_, i) => i + 1).map(lv => {
                  const desc = sk.niveis[String(lv)];
                  if (!desc) return null;
                  return (
                    <View key={lv} style={s.lvlDesc}>
                      <Text style={s.lvlDescBadge}>Nv {lv}</Text>
                      <Text style={s.lvlDescText}>{desc}</Text>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </>
      )}

      {/* Mira */}
      {weapon && (
        <MiraPanel damageTypes={getWeaponDamageTypes(weapon.tipo)} />
      )}

      {/* Efeitos aplicados */}
      {weapon && (() => {
        const dmgTypes    = getWeaponDamageTypes(weapon.tipo);
        const skillFx     = extractEffectsWithQty(acquiredSkills, skillLevels);
        if (dmgTypes.length === 0 && skillFx.length === 0) return null;
        return (
          <View style={s.effectsBox}>
            <Text style={s.effectsBoxLabel}>Efeitos aplicados:</Text>
            <View style={s.effectsTags}>
              {dmgTypes.map(t => (
                <View key={t} style={[s.effectTag, { borderColor: DAMAGE_TYPE_COLORS[t] ?? '#6c7086' }]}>
                  <Text style={[s.effectTagText, { color: DAMAGE_TYPE_COLORS[t] ?? '#6c7086' }]}>{t}</Text>
                </View>
              ))}
              {skillFx.map(({ label, qty }) => (
                <View key={label} style={[s.effectTag, s.effectTagSkill]}>
                  <Text style={s.effectTagTextSkill}>{label} +{qty}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      })()}

      {/* Resumo de energia */}
      {weapon && (
        <View style={[s.energySummary, !podeAtacar && energiaAtual < totalEnergy && s.energySummaryWarn]}>
          <Text style={s.energySummaryLabel}>Custo total de Energia:</Text>
          <Text style={s.energySummaryVal}>
            1 ataque{skillEnergyCost > 0 ? ` + ${skillEnergyCost} habilidades` : ''} = {totalEnergy}⚡
          </Text>
          <Text style={s.energySummaryCur}>(você tem {energiaAtual})</Text>
        </View>
      )}

      <TouchableOpacity
        style={[s.confirmBtn, !podeAtacar && s.confirmBtnDisabled]}
        onPress={confirm}
        disabled={!podeAtacar}
      >
        <Text style={s.confirmBtnText}>Confirmar Ataque  −{actionCost} {actionCost === 2 ? 'Ações' : 'Ação'}  −{totalEnergy} Energia</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Painel de Defesa ─────────────────────────────────────────────────────────
function SkillLevelPicker({ sk, selLv, onChange }) {
  return (
    <View style={[s.skillCard, selLv > 0 && s.skillCardActive]}>
      <View style={s.skillCardHeader}>
        <Text style={[s.skillName, selLv > 0 && s.skillNameActive]}>{sk.nome}</Text>
        <View style={s.lvlPicker}>
          <TouchableOpacity style={[s.lvlBtn, selLv === 0 && s.lvlBtnOff]} onPress={() => onChange(sk.id, 0)}>
            <Text style={[s.lvlBtnText, selLv === 0 && s.lvlBtnTextOff]}>—</Text>
          </TouchableOpacity>
          {Array.from({ length: sk.level }, (_, i) => i + 1).map(lv => (
            <TouchableOpacity key={lv} style={[s.lvlBtn, selLv >= lv && s.lvlBtnActive]} onPress={() => onChange(sk.id, lv)}>
              <Text style={[s.lvlBtnText, selLv >= lv && s.lvlBtnTextActive]}>{lv}</Text>
            </TouchableOpacity>
          ))}
          {selLv > 0 && <Text style={s.lvlCost}>−{selLv}⚡</Text>}
        </View>
      </View>
      {selLv > 0 && Array.from({ length: selLv }, (_, i) => i + 1).map(lv => {
        const desc = sk.niveis[String(lv)];
        return desc ? (
          <View key={lv} style={s.lvlDesc}>
            <Text style={s.lvlDescBadge}>Nv {lv}</Text>
            <Text style={s.lvlDescText}>{desc}</Text>
          </View>
        ) : null;
      })}
    </View>
  );
}

function DefendPanel({ actionsLeft, onConfirm, onBlock }) {
  const { character, dispatch } = useCharacter();
  const { skills } = character;
  const reflexo  = skills?.reflexo  ?? 0;
  const esportes = skills?.esportes ?? 0;
  const [mode, setMode]       = useState('bloquear');
  const [blockLevels, setBlockLevels] = useState({}); // { skillId: level }

  const { totalArmadura } = computeDefenseTotals(character.equipment, character.accessories);

  // Todas as armas com habilidades relevantes para bloqueio
  const blockWeapons = getAllBlockSkills(character.equipment, character.skillTree?.acquiredTrails);

  // Bônus numéricos incondicionais ao bloqueio
  const blockBonuses  = getBlockBonuses(blockWeapons, blockLevels, skills ?? {});
  const blockBonusTotal = blockBonuses.reduce((a, b) => a + b.val, 0);
  const blockTotal    = totalArmadura + blockBonusTotal;

  // Efeitos especiais
  const allBlockSkills = blockWeapons.flatMap(w => w.skills);
  const blockEffects   = extractEffectsWithQty(allBlockSkills, blockLevels);

  const blockSkillCost = Object.values(blockLevels).reduce((a, v) => a + v, 0);
  const energiaAtual   = character.status?.energia?.current ?? 0;
  const energyCost     = mode === 'esquivar' ? 1 : blockSkillCost;
  const podeDefender   = actionsLeft >= 1 && energiaAtual >= energyCost;

  function setLevel(skillId, lv) {
    setBlockLevels(prev => ({ ...prev, [skillId]: lv }));
  }

  function confirm() {
    if (!podeDefender) return;
    if (energyCost > 0) dispatch({ type: 'CHANGE_STATUS', statusKey: 'energia', field: 'current', delta: -energyCost });
    if (mode === 'bloquear') onBlock?.();
    onConfirm();
    setBlockLevels({});
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
          <View style={s.formulaParts}>
            <View style={s.formulaPart}>
              <Text style={s.formulaVal}>{totalArmadura}</Text>
              <Text style={s.formulaLbl}>Armadura</Text>
            </View>
            {blockBonuses.map(b => (
              <React.Fragment key={b.label}>
                <Text style={s.formulaOp}>+</Text>
                <View style={s.formulaPart}>
                  <Text style={s.formulaVal}>{b.val}</Text>
                  <Text style={s.formulaLbl}>{b.label}</Text>
                </View>
              </React.Fragment>
            ))}
            {blockBonuses.length > 0 && (
              <>
                <Text style={s.formulaOp}>=</Text>
                <View style={[s.formulaPart, s.formulaTotal]}>
                  <Text style={s.formulaTotalVal}>{blockTotal}</Text>
                  <Text style={s.formulaLbl}>Total</Text>
                </View>
              </>
            )}
          </View>
          <Text style={s.formulaNote}>Reduz dano recebido pelo valor de bloqueio</Text>
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

      {/* Habilidades de bloqueio de todas as armas */}
      {mode === 'bloquear' && blockWeapons.length > 0 && (
        <>
          <Text style={s.subLabel}>Habilidades de Bloqueio</Text>
          <Text style={s.hint}>Escolha o nível — cada nível custa 1 Energia</Text>
          {blockWeapons.map(w => (
            <View key={w.slotKey}>
              <Text style={s.weaponGroupLabel}>
                {w.isShield ? '🛡' : '⚔️'} {w.weaponNome}
              </Text>
              {w.skills.map(sk => (
                <SkillLevelPicker
                  key={sk.id}
                  sk={sk}
                  selLv={blockLevels[sk.id] ?? 0}
                  onChange={setLevel}
                />
              ))}
            </View>
          ))}
        </>
      )}

      {/* Efeitos especiais do bloqueio */}
      {mode === 'bloquear' && blockEffects.length > 0 && (
        <View style={s.effectsBox}>
          <Text style={s.effectsBoxLabel}>Efeitos do bloqueio:</Text>
          <View style={s.effectsTags}>
            {blockEffects.map(({ label, qty }) => (
              <View key={label} style={[s.effectTag, s.effectTagSkill]}>
                <Text style={s.effectTagTextSkill}>{label} +{qty}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[s.confirmBtn, !podeDefender && s.confirmBtnDisabled]}
        onPress={confirm}
        disabled={!podeDefender}
      >
        <Text style={s.confirmBtnText}>
          {mode === 'esquivar'
            ? 'Confirmar Esquiva  −1 Ação  −1 Energia'
            : `Confirmar Bloqueio  −1 Ação${blockSkillCost > 0 ? `  −${blockSkillCost} Energia` : ''}`}
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
    dispatch({ type: 'CHANGE_STATUS', statusKey: 'mana', field: 'current', delta: -custoFinal });
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
  const [tab, setTab]                   = useState('Atacar');
  const [actions, setActions]           = useState(2);
  const [turn, setTurn]                 = useState(1);
  const [blockedThisTurn, setBlockedThisTurn] = useState(false);

  const manaAtual    = character.status?.mana?.current    ?? 0;
  const energiaAtual = character.status?.energia?.current ?? 0;

  function spendAction() {
    setActions(a => Math.max(0, a - 1));
  }

  function nextTurn() {
    setActions(2);
    setTurn(t => t + 1);
    setBlockedThisTurn(false);
  }

  function resetCombat() {
    setActions(2);
    setTurn(1);
    setBlockedThisTurn(false);
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
        {tab === 'Atacar'  && <AttackPanel  actionsLeft={actions} onConfirm={spendAction} blockedThisTurn={blockedThisTurn} />}
        {tab === 'Defender' && <DefendPanel  actionsLeft={actions} onConfirm={spendAction} onBlock={() => setBlockedThisTurn(true)} />}
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
  formulaVal:     { color: '#cdd6f4', fontSize: 20, fontWeight: 'bold' },
  formulaValDado: { color: '#f9e2af', fontSize: 20, fontWeight: 'bold', fontStyle: 'italic' },
  formulaLbl:   { color: '#6c7086', fontSize: 10, textAlign: 'center' },
  formulaOp:    { color: '#45475a', fontSize: 18, fontWeight: 'bold', alignSelf: 'center' },
  formulaTotal: { backgroundColor: '#1e3a5f', borderRadius: 8, padding: 6 },
  formulaTotalVal: { color: '#89b4fa', fontSize: 22, fontWeight: 'bold' },
  formulaNote:  { color: '#45475a', fontSize: 11, marginTop: 8, fontStyle: 'italic' },
  statLine:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  statLineLabel:{ color: '#6c7086', fontSize: 13 },
  statLineVal:  { color: '#cdd6f4', fontSize: 20, fontWeight: 'bold' },

  // Habilidades de arma (level picker)
  skillCard:       { backgroundColor: '#1e1e2e', borderRadius: 10, padding: 10, marginBottom: 6, borderWidth: 1, borderColor: '#2e2e4e' },
  skillCardActive: { borderColor: '#a6e3a1', backgroundColor: '#111f11' },
  skillCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  skillName:       { color: '#6c7086', fontSize: 13, fontWeight: '600', flex: 1 },
  skillNameActive: { color: '#a6e3a1' },

  lvlPicker:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lvlBtn:       { width: 28, height: 28, borderRadius: 6, backgroundColor: '#313244', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#45475a' },
  lvlBtnOff:    { backgroundColor: '#1e1e2e', borderColor: '#313244' },
  lvlBtnActive: { backgroundColor: '#a6e3a1', borderColor: '#a6e3a1' },
  lvlBtnText:       { color: '#6c7086', fontSize: 13, fontWeight: '700' },
  lvlBtnTextOff:    { color: '#45475a' },
  lvlBtnTextActive: { color: '#11111b' },
  lvlCost:      { color: '#a6e3a1', fontSize: 12, fontWeight: '700', marginLeft: 4 },

  lvlDesc:      { flexDirection: 'row', gap: 6, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#2e2e4e' },
  lvlDescBadge: { color: '#a6e3a1', fontSize: 11, fontWeight: '700', minWidth: 28 },
  lvlDescText:  { color: '#a6adc8', fontSize: 12, lineHeight: 17, flex: 1 },

  energySummary:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1e1e2e', borderRadius: 8, padding: 10, marginTop: 8, borderWidth: 1, borderColor: '#2e2e4e' },
  energySummaryWarn: { borderColor: '#f38ba8' },
  energySummaryLabel:{ color: '#6c7086', fontSize: 12 },
  energySummaryVal:  { color: '#cdd6f4', fontSize: 13, fontWeight: '700', flex: 1 },
  energySummaryCur:  { color: '#45475a', fontSize: 11 },

  miraBox:        { marginTop: 8 },
  miraSubLabel:   { color: '#45475a', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, marginTop: 6 },
  chipDisabled:       { opacity: 0.4 },
  chipTextDisabled:   { color: '#45475a' },
  miraResult:     { backgroundColor: '#181825', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#fab38740', marginTop: 4 },
  miraDifRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  miraDifLabel:   { color: '#6c7086', fontSize: 12, flex: 1 },
  miraDifVal:     { color: '#fab387', fontSize: 22, fontWeight: 'bold' },
  miraEfeitoRow:  { flexDirection: 'row', gap: 8, marginBottom: 4 },
  miraEfeitoHits: { color: '#fab387', fontSize: 12, fontWeight: '700', minWidth: 24 },
  miraEfeitoText: { color: '#cdd6f4', fontSize: 12, lineHeight: 17, flex: 1 },
  miraEfeitoSingle: { color: '#cdd6f4', fontSize: 12, lineHeight: 18 },
  miraNota:       { color: '#45475a', fontSize: 11, fontStyle: 'italic', marginTop: 6 },

  effectsBox:      { backgroundColor: '#1e1e2e', borderRadius: 8, padding: 10, marginTop: 8, borderWidth: 1, borderColor: '#2e2e4e' },
  effectsBoxLabel: { color: '#6c7086', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  effectsTags:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  effectTag:       { borderRadius: 6, borderWidth: 1.5, paddingHorizontal: 8, paddingVertical: 3 },
  effectTagText:   { fontSize: 12, fontWeight: '700' },
  effectTagSkill:      { borderColor: '#f9e2af' },
  effectTagTextSkill:  { color: '#f9e2af', fontSize: 12, fontWeight: '700' },

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
