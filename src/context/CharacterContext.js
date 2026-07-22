import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { queueSync, uploadSheet, isOnline } from '../services/syncService';
import {
  INITIAL_CHARACTER,
  COMPUTED_STATUS_KEYS,
  computeMaxValues,
  SKILL_CATEGORIES,
  ARMOR_SLOTS,
  HAND_SLOTS,
  xpCostForRange,
} from '../data/initialCharacter';
import { findTrail, findCategoryTrails, TRAILS_MAGIAS } from '../data/trailsData';
import { findTitleById } from '../data/titlesData';
import { SUBRACE_BY_ID, raceTrailDiscountedCost } from '../data/racesData';

// Descobre a categoria de uma perícia
function getSkillCategory(skill) {
  for (const [cat, skills] of Object.entries(SKILL_CATEGORIES)) {
    if (skills.includes(skill)) return cat;
  }
  return null;
}

const STORAGE_KEY = '@fichadigital_v2';

const CharacterContext = createContext(null);

function clamp(value, min = 0, max = Infinity) {
  return Math.max(min, Math.min(max, value));
}

// Desconto racial de XP para aquisição de trilhas (ver racesData.js)
function applyRaceTrailDiscount(state, trailId, baseCost) {
  return raceTrailDiscountedCost(state.race, state.skillTree.acquiredTrails, trailId, baseCost);
}

// Impacto de cada subatributo nos tetos de status
const ATTR_STATUS_IMPACT = {
  forca:        { vida: 1, forcaDeVontade: 1 },
  destreza:     { vida: 1 },
  vigor:        { vida: 1, energia: 2 },
  manha:        {},
  carisma:      { forcaDeVontade: 1 },
  etiqueta:     { mana: 1 },
  percepcao:    { energia: 2 },
  raciocinio:   {},
  inteligencia: { mana: 1 },
};

// Bônus de status vindos de tiras 'status' em equipamentos e acessórios equipados
function computeEquipTirasBonuses(equipment = {}, accessories = []) {
  const result = {};
  for (const slot of [...ARMOR_SLOTS, ...HAND_SLOTS]) {
    const item = equipment[slot];
    if (!item || item.durabilidade === 0) continue;
    for (const t of (item.tiras ?? [])) {
      if (t.tipo === 'status' && t.statusKey && t.valor) {
        result[t.statusKey] = (result[t.statusKey] || 0) + t.valor;
      }
    }
  }
  for (const acc of accessories) {
    for (const t of (acc.tiras ?? [])) {
      if (t.tipo === 'status' && t.statusKey && t.valor) {
        result[t.statusKey] = (result[t.statusKey] || 0) + t.valor;
      }
    }
  }
  return result;
}

// Computa todos os bônus de status a partir de um objeto character/state
function computeAllStatusBonuses(char) {
  const equipTiras = computeEquipTirasBonuses(char.equipment ?? {}, char.accessories ?? []);
  const merged = { ...(char.titles?.statusBonuses ?? {}) };
  for (const [k, v] of Object.entries(equipTiras)) merged[k] = (merged[k] || 0) + v;
  // Bônus de raça (Elfos da Lua: +5 mana, etc.)
  for (const [k, v] of Object.entries(char.race?.statusBonuses ?? {})) {
    merged[k] = (merged[k] || 0) + v;
  }
  return totalStatusBonuses(
    merged,
    char.narrativeEffects ?? [],
    char.titles?.skillBonuses ?? [],
    char.skills ?? {},
    char.titles?.attrBonuses ?? [],
    char.attributes ?? {},
  );
}

// Computa bônus numéricos de status dos efeitos narrativos
function computeNarrativeBonuses(narrativeEffects = []) {
  const result = {};
  for (const ef of narrativeEffects) {
    for (const linha of ef.linhas ?? []) {
      if (linha.tipo === 'status' && linha.statusKey && linha.delta) {
        result[linha.statusKey] = (result[linha.statusKey] || 0) + linha.delta;
      } else if (linha.tipo === 'atributo' && linha.subAttr && linha.delta) {
        const impacts = ATTR_STATUS_IMPACT[linha.subAttr] ?? {};
        for (const [statusKey, mult] of Object.entries(impacts)) {
          result[statusKey] = (result[statusKey] || 0) + linha.delta * mult;
        }
      }
    }
  }
  return result;
}

// Bônus de max que escalam com o valor atual de uma perícia
function computeTitleSkillBonuses(skillBonuses = [], skills = {}) {
  const result = {};
  for (const { status, skill } of skillBonuses) {
    result[status] = (result[status] || 0) + (skills[skill] || 0);
  }
  return result;
}

// Bônus condicionais por atributo atingir um threshold (ex: Encouraçado)
function computeTitleAttrBonuses(attrBonuses = [], attrs = {}) {
  const result = {};
  for (const { status, group, subAttr, threshold, delta } of attrBonuses) {
    if ((attrs[group]?.[subAttr] ?? 0) >= threshold) {
      result[status] = (result[status] || 0) + delta;
    }
  }
  return result;
}

// Mescla bônus de títulos, narrativos, skill-based e attr-based
function totalStatusBonuses(titleBonuses = {}, narrativeEffects = [], skillBonuses = [], skills = {}, attrBonuses = [], attrs = {}) {
  const narrative  = computeNarrativeBonuses(narrativeEffects);
  const skillDelta = computeTitleSkillBonuses(skillBonuses, skills);
  const attrDelta  = computeTitleAttrBonuses(attrBonuses, attrs);
  const merged = { ...titleBonuses };
  for (const [k, v] of Object.entries(narrative))  merged[k] = (merged[k] || 0) + v;
  for (const [k, v] of Object.entries(skillDelta)) merged[k] = (merged[k] || 0) + v;
  for (const [k, v] of Object.entries(attrDelta))  merged[k] = (merged[k] || 0) + v;
  return merged;
}

// Recalcula os tetos de status e clipa os valores atuais
// statusBonuses: bônus fixos de títulos adquiridos, ex: { vida: 10 }
function applyComputedMaxes(status, attrs, statusBonuses = {}) {
  const newMax = computeMaxValues(attrs);
  const updated = { ...status };
  COMPUTED_STATUS_KEYS.forEach((key) => {
    const s = status[key];
    const max = newMax[key] + (statusBonuses[key] || 0);
    updated[key] = { ...s, max, current: Math.min(s.current, max) };
  });
  return updated;
}

function reducer(state, action) {
  switch (action.type) {

    case 'LOAD': {
      const p = action.payload;
      if (p.attributes?.reputacao?.manha == null) return INITIAL_CHARACTER;
      const status = applyComputedMaxes(p.status, p.attributes, computeAllStatusBonuses(p));
      // Mescla settings: preserva customizações salvas, garante campos novos
      const savedSettings = p.settings ?? {};
      const settings = {
        ...INITIAL_CHARACTER.settings,
        ...savedSettings,
        xpCosts: { ...INITIAL_CHARACTER.settings.xpCosts, ...(savedSettings.xpCosts ?? {}) },
        statusOrder: savedSettings.statusOrder ?? INITIAL_CHARACTER.settings.statusOrder,
      };
      // Migração: garante array de acessórios com slots suficientes (min 11)
      const emptyAcc = () => ({ nome: '', armadura: 0, resMagica: 0, reputacao: 0, efeitos: '', tiras: [] });
      const loadedAcc = p.accessories ?? INITIAL_CHARACTER.accessories;
      const accessories = loadedAcc.length >= 11
        ? loadedAcc
        : [...loadedAcc, ...Array.from({ length: 11 - loadedAcc.length }, emptyAcc)];

      // Migração: preserva skillBonuses e attrBonuses vindos do save
      const titles = p.titles
        ? {
            ...INITIAL_CHARACTER.titles,
            ...p.titles,
            skillBonuses: p.titles.skillBonuses ?? [],
            attrBonuses:  p.titles.attrBonuses  ?? [],
          }
        : INITIAL_CHARACTER.titles;

      return {
        ...INITIAL_CHARACTER,
        ...p,
        status,
        equipment:        p.equipment        ?? INITIAL_CHARACTER.equipment,
        accessories,
        skillTree:        p.skillTree        ?? INITIAL_CHARACTER.skillTree,
        titles,
        inventory:        p.inventory        ?? INITIAL_CHARACTER.inventory,
        narrativeEffects: p.narrativeEffects ?? INITIAL_CHARACTER.narrativeEffects,
        journal:          p.journal          ?? INITIAL_CHARACTER.journal,
        pets:             p.pets             ?? INITIAL_CHARACTER.pets,
        settings,
      };
    }

    case 'SET_NAME':
      return { ...state, name: action.value };

    case 'SET_RACIAL_TRAITS':
      return { ...state, racialTraits: action.value };

    // { raceId, subraceId, skillBoostSkill?, startingMagicTrail?, startingMagicSkills? }
    // Aplica raça à ficha: bônus de status, perícia escolhida (até 8) e magias iniciais.
    case 'SET_RACE': {
      if (state.race) return state; // raça é escolhida apenas na criação da ficha
      const sub = SUBRACE_BY_ID[action.subraceId];
      if (!sub) return state;

      // 1) Aplica status bonuses da subraça (somando aos existentes)
      const raceStatusBonuses = {};
      for (const b of (sub.statusBonuses ?? [])) {
        raceStatusBonuses[b.status] = (raceStatusBonuses[b.status] || 0) + b.delta;
      }

      const newRace = {
        raceId: action.raceId,
        subraceId: action.subraceId,
        skillBoostSkill: action.skillBoostSkill ?? null,
        startingMagicTrail: action.startingMagicTrail ?? null,
        statusBonuses: raceStatusBonuses,
      };

      let newState = { ...state, race: newRace };

      // 2) Magias iniciais (Wanderstein): adiciona trilha + skills escolhidas ao skillTree
      if (sub.startingMagic && action.startingMagicTrail && action.startingMagicSkills?.length) {
        const trail = TRAILS_MAGIAS.find(t => t.id === action.startingMagicTrail);
        if (trail) {
          const existing = state.skillTree?.acquiredTrails?.[trail.id];
          const newSkills = { ...(existing?.skills ?? {}) };
          for (const skillId of action.startingMagicSkills) {
            newSkills[skillId] = Math.max(newSkills[skillId] ?? 0, sub.startingMagic.nivel);
          }
          newState = {
            ...newState,
            skillTree: {
              ...newState.skillTree,
              acquiredTrails: {
                ...(newState.skillTree?.acquiredTrails ?? {}),
                [trail.id]: { cost: existing?.cost ?? 0, skills: newSkills },
              },
              trailCount: (newState.skillTree?.trailCount ?? 0) + (existing ? 0 : 1),
            },
          };
        }
      }

      // 3) Recalcula tetos de status considerando os novos bônus da raça
      const newStatus = applyComputedMaxes(
        newState.status, newState.attributes, computeAllStatusBonuses(newState)
      );
      // Adiciona o delta ao current dos status com bonus positivo
      let finalStatus = newStatus;
      for (const [statusKey, delta] of Object.entries(raceStatusBonuses)) {
        if (delta > 0 && COMPUTED_STATUS_KEYS.includes(statusKey)) {
          const s = finalStatus[statusKey];
          finalStatus = { ...finalStatus, [statusKey]: { ...s, current: Math.min(s.current + delta, s.max) } };
        }
      }
      return { ...newState, status: finalStatus };
    }

    // { statusKey, field: 'current'|'max', delta }
    case 'CHANGE_STATUS': {
      // Não deixa alterar o max dos status calculados
      if (action.field === 'max' && COMPUTED_STATUS_KEYS.includes(action.statusKey)) {
        return state;
      }
      const s = state.status[action.statusKey];
      const updated = {
        ...s,
        [action.field]: clamp(
          s[action.field] + action.delta,
          0,
          action.field === 'current' ? s.max : 999
        ),
      };
      if (action.field === 'max' && updated.current > updated.max) {
        updated.current = updated.max;
      }
      return {
        ...state,
        status: { ...state.status, [action.statusKey]: updated },
      };
    }

    // { group, subAttr, delta }
    case 'CHANGE_ATTRIBUTE': {
      const group    = state.attributes[action.group];
      const curVal   = group[action.subAttr] || 0;
      const newVal   = clamp(curVal + action.delta, 1, 5);
      const newAttrs = {
        ...state.attributes,
        [action.group]: { ...group, [action.subAttr]: newVal },
      };
      const newStatus = applyComputedMaxes(
        state.status, newAttrs,
        computeAllStatusBonuses({ ...state, attributes: newAttrs })
      );

      if (newVal > curVal) {
        const xpCost  = state.settings.xpCosts[action.group] ?? 10;
        const cost    = xpCostForRange(curVal, newVal, xpCost);
        if (state.status.xp.current < cost) return state; // XP insuficiente
        newStatus.xp  = { ...newStatus.xp, current: newStatus.xp.current - cost };
      }

      return { ...state, attributes: newAttrs, status: newStatus };
    }

    // { skill, delta }
    case 'CHANGE_SKILL': {
      const curVal = state.skills[action.skill] || 0;
      const skillMax = state.race?.skillBoostSkill === action.skill ? 8 : 5;
      const newVal = clamp(curVal + action.delta, 0, skillMax);
      const newSkills = { ...state.skills, [action.skill]: newVal };

      // Se algum título escala com esta perícia, recalcula tetos de status
      const skillBonuses = state.titles?.skillBonuses ?? [];
      const affectsMax = skillBonuses.some(b => b.skill === action.skill);
      const newStatus = affectsMax
        ? applyComputedMaxes(state.status, state.attributes,
            computeAllStatusBonuses({ ...state, skills: newSkills }))
        : state.status;

      if (newVal > curVal) {
        const cat    = getSkillCategory(action.skill);
        const xpCost = state.settings.xpCosts[cat] ?? 5;
        const cost   = xpCostForRange(curVal, newVal, xpCost);
        if (state.status.xp.current < cost) return state; // XP insuficiente
        const xpBase = affectsMax ? newStatus : state.status;
        const newXp  = { ...xpBase.xp, current: xpBase.xp.current - cost };
        return { ...state, skills: newSkills, status: { ...newStatus, xp: newXp } };
      }

      return { ...state, skills: newSkills, status: newStatus };
    }

    // ── Equipamento ──────────────────────────────────────────────────────────

    // { slot, field, value }  — field = 'armadura'|'resMagica'|'efeitos'|'nome'|'dano'|'durabilidadeMax'
    case 'SET_EQUIP_FIELD': {
      const slot = state.equipment[action.slot];
      return {
        ...state,
        equipment: {
          ...state.equipment,
          [action.slot]: { ...slot, [action.field]: action.value },
        },
      };
    }

    // { slot, tira }  — adiciona tira de couro ao slot
    case 'ADD_EQUIP_TIRA': {
      const slot = state.equipment[action.slot];
      const newEquip = { ...state.equipment, [action.slot]: { ...slot, tiras: [...(slot.tiras ?? []), action.tira] } };
      const newState = { ...state, equipment: newEquip };
      return { ...newState, status: applyComputedMaxes(state.status, state.attributes, computeAllStatusBonuses(newState)) };
    }

    // { slot, index }  — remove tira de couro do slot
    case 'REMOVE_EQUIP_TIRA': {
      const slot = state.equipment[action.slot];
      const tiras = (slot.tiras ?? []).filter((_, i) => i !== action.index);
      const newEquip = { ...state.equipment, [action.slot]: { ...slot, tiras } };
      const newState = { ...state, equipment: newEquip };
      return { ...newState, status: applyComputedMaxes(state.status, state.attributes, computeAllStatusBonuses(newState)) };
    }

    // { slot, delta }  — altera durabilidade atual
    case 'CHANGE_EQUIP_DURABILITY': {
      const slot = state.equipment[action.slot];
      const newDur = clamp(slot.durabilidade + action.delta, 0, slot.durabilidadeMax);
      return {
        ...state,
        equipment: {
          ...state.equipment,
          [action.slot]: { ...slot, durabilidade: newDur },
        },
      };
    }

    // { slot, delta }  — altera durabilidade de uma arma (hand slot)
    case 'CHANGE_WEAPON_DURABILITY': {
      const slot = state.equipment[action.slot];
      const newDur = Math.max(0, Math.min((slot.durabilidade ?? 10) + action.delta, slot.durabilidadeMax ?? 10));
      return {
        ...state,
        equipment: { ...state.equipment, [action.slot]: { ...slot, durabilidade: newDur } },
      };
    }

    // { delta }  — altera durabilidade de todas as armaduras ao mesmo tempo
    case 'CHANGE_ALL_ARMOR_DURABILITY': {
      const newEquipment = { ...state.equipment };
      for (const k of ARMOR_SLOTS) {
        const sl = newEquipment[k];
        newEquipment[k] = { ...sl, durabilidade: Math.max(0, Math.min(sl.durabilidade + action.delta, sl.durabilidadeMax)) };
      }
      return { ...state, equipment: newEquipment };
    }

    // { section?: 'bolsa'|'cinto', storageId?: string, index, slot: 'maoDireita'|'maoEsquerda' }
    case 'EQUIP_FROM_INVENTORY': {
      let item, newInventory;
      if (action.storageId) {
        // Item em armazenamento customizado
        const storages = (state.inventory.storages ?? []).map(s => {
          if (s.id !== action.storageId) return s;
          item = s.itens[action.index];
          const newItens = [...s.itens];
          newItens[action.index] = { nome: '', obs: '' };
          return { ...s, itens: newItens };
        });
        if (!item?.nome) return state;
        newInventory = { ...state.inventory, storages };
      } else {
        const inv = state.inventory[action.section];
        item = inv.itens[action.index];
        if (!item?.nome) return state;
        const newItens = [...inv.itens];
        newItens[action.index] = { nome: '', obs: '' };
        newInventory = { ...state.inventory, [action.section]: { ...inv, itens: newItens } };
      }
      const handSlot = state.equipment[action.slot];
      const newHandSlot = item.weaponData
        ? { ...handSlot, nome: item.nome, ...item.weaponData }
        : { ...handSlot, nome: item.nome };
      return {
        ...state,
        inventory: newInventory,
        equipment: { ...state.equipment, [action.slot]: newHandSlot },
      };
    }

    // { slot: ARMOR_SLOT }  — move peça de armadura para bolsa preservando todos os dados
    case 'UNEQUIP_ARMOR_TO_INVENTORY': {
      const armorSlot = state.equipment[action.slot];
      if (!armorSlot?.nome) return state;
      const bolsa = state.inventory.bolsa;
      const emptyIdx = bolsa.itens.findIndex((it, i) => !it.nome && i < bolsa.capacidade);
      if (emptyIdx === -1) return state; // bolsa cheia
      const newItens = [...bolsa.itens];
      newItens[emptyIdx] = {
        nome: armorSlot.nome,
        obs: '',
        armorData: {
          slot:            action.slot,
          armadura:        armorSlot.armadura        ?? 0,
          resMagica:       armorSlot.resMagica       ?? 0,
          reputacao:       armorSlot.reputacao       ?? 0,
          efeitos:         armorSlot.efeitos         ?? '',
          nivel:           armorSlot.nivel           ?? 1,
          tiras:           armorSlot.tiras           ?? [],
          durabilidade:    armorSlot.durabilidade    ?? 10,
          durabilidadeMax: armorSlot.durabilidadeMax ?? 10,
        },
      };
      const emptyArmor = { nome: '', armadura: 0, resMagica: 0, reputacao: 0, efeitos: '', nivel: 1, tiras: [], durabilidade: 10, durabilidadeMax: 10 };
      return {
        ...state,
        inventory: { ...state.inventory, bolsa: { ...bolsa, itens: newItens } },
        equipment: { ...state.equipment, [action.slot]: emptyArmor },
      };
    }

    // { section?, storageId?, index, slot: ARMOR_SLOT }  — equipa armadura do inventário
    case 'EQUIP_ARMOR_FROM_INVENTORY': {
      let item, newInventory;
      if (action.storageId) {
        const storages = (state.inventory.storages ?? []).map(s => {
          if (s.id !== action.storageId) return s;
          item = s.itens[action.index];
          const newItens = [...s.itens];
          newItens[action.index] = { nome: '', obs: '' };
          return { ...s, itens: newItens };
        });
        if (!item?.nome) return state;
        newInventory = { ...state.inventory, storages };
      } else {
        const inv = state.inventory[action.section];
        item = inv.itens[action.index];
        if (!item?.nome) return state;
        const newItens = [...inv.itens];
        newItens[action.index] = { nome: '', obs: '' };
        newInventory = { ...state.inventory, [action.section]: { ...inv, itens: newItens } };
      }
      const current = state.equipment[action.slot];
      const newArmorSlot = item.armorData
        ? { ...current, nome: item.nome, ...item.armorData, slot: undefined }
        : { ...current, nome: item.nome };
      return {
        ...state,
        inventory: newInventory,
        equipment: { ...state.equipment, [action.slot]: newArmorSlot },
      };
    }

    // { slot: 'maoDireita'|'maoEsquerda' }  — move arma para bolsa preservando tiras e nível
    case 'UNEQUIP_TO_INVENTORY': {
      const handSlot = state.equipment[action.slot];
      if (!handSlot?.nome) return state;
      const bolsa = state.inventory.bolsa;
      const emptyIdx = bolsa.itens.findIndex((it, i) => !it.nome && i < bolsa.capacidade);
      if (emptyIdx === -1) return state; // bolsa cheia
      const newItens = [...bolsa.itens];
      // Guarda todos os dados da arma no item de inventário
      newItens[emptyIdx] = {
        nome: handSlot.nome,
        obs: '',
        weaponData: {
          tipo:            handSlot.tipo            ?? '',
          tipo2:           handSlot.tipo2           ?? '',
          dano:            handSlot.dano            ?? '',
          efeitos:         handSlot.efeitos         ?? '',
          nivel:           handSlot.nivel           ?? 1,
          tiras:           handSlot.tiras           ?? [],
          durabilidade:    handSlot.durabilidade    ?? 10,
          durabilidadeMax: handSlot.durabilidadeMax ?? 10,
        },
      };
      const emptyHand = { tipo: '', tipo2: '', nome: '', dano: '', efeitos: '', nivel: 1, tiras: [], durabilidade: 10, durabilidadeMax: 10 };
      return {
        ...state,
        inventory: { ...state.inventory, bolsa: { ...bolsa, itens: newItens } },
        equipment: { ...state.equipment, [action.slot]: emptyHand },
      };
    }

    // { index }  — move acessório para bolsa preservando todos os dados
    case 'UNEQUIP_ACCESSORY_TO_INVENTORY': {
      const acc = state.accessories[action.index];
      if (!acc?.nome) return state;
      const bolsa = state.inventory.bolsa;
      const emptyIdx = bolsa.itens.findIndex((it, i) => !it.nome && i < bolsa.capacidade);
      if (emptyIdx === -1) return state;
      const newItens = [...bolsa.itens];
      newItens[emptyIdx] = {
        nome: acc.nome,
        obs: '',
        accessoryData: {
          armadura:  acc.armadura  ?? 0,
          resMagica: acc.resMagica ?? 0,
          reputacao: acc.reputacao ?? 0,
          efeitos:   acc.efeitos   ?? '',
          tiras:     acc.tiras     ?? [],
        },
      };
      const accessories = [...state.accessories];
      accessories[action.index] = { nome: '', armadura: 0, resMagica: 0, reputacao: 0, efeitos: '', tiras: [] };
      return {
        ...state,
        inventory: { ...state.inventory, bolsa: { ...bolsa, itens: newItens } },
        accessories,
      };
    }

    // { section?, storageId?, index, accIndex }  — equipa acessório do inventário
    case 'EQUIP_ACCESSORY_FROM_INVENTORY': {
      let item, newInventory;
      if (action.storageId) {
        const storages = (state.inventory.storages ?? []).map(s => {
          if (s.id !== action.storageId) return s;
          item = s.itens[action.index];
          const newItens = [...s.itens];
          newItens[action.index] = { nome: '', obs: '' };
          return { ...s, itens: newItens };
        });
        if (!item?.nome) return state;
        newInventory = { ...state.inventory, storages };
      } else {
        const inv = state.inventory[action.section];
        item = inv.itens[action.index];
        if (!item?.nome) return state;
        const newItens = [...inv.itens];
        newItens[action.index] = { nome: '', obs: '' };
        newInventory = { ...state.inventory, [action.section]: { ...inv, itens: newItens } };
      }
      const accessories = [...state.accessories];
      accessories[action.accIndex] = item.accessoryData
        ? { nome: item.nome, ...item.accessoryData }
        : { nome: item.nome, armadura: 0, resMagica: 0, reputacao: 0, efeitos: item.obs ?? '', tiras: [] };
      return { ...state, inventory: newInventory, accessories };
    }

    // ── Acessórios ───────────────────────────────────────────────────────────

    // { index, field, value }
    case 'SET_ACCESSORY': {
      const accessories = [...state.accessories];
      accessories[action.index] = {
        ...accessories[action.index],
        [action.field]: action.value,
      };
      return { ...state, accessories };
    }

    // { index, tira }  — adiciona tira a um acessório
    case 'ADD_ACC_TIRA': {
      const accessories = [...state.accessories];
      accessories[action.index] = { ...accessories[action.index], tiras: [...(accessories[action.index].tiras ?? []), action.tira] };
      const newState = { ...state, accessories };
      return { ...newState, status: applyComputedMaxes(state.status, state.attributes, computeAllStatusBonuses(newState)) };
    }

    // { index, tiraIndex }  — remove tira de um acessório
    case 'REMOVE_ACC_TIRA': {
      const accessories = [...state.accessories];
      accessories[action.index] = { ...accessories[action.index], tiras: (accessories[action.index].tiras ?? []).filter((_, i) => i !== action.tiraIndex) };
      const newState = { ...state, accessories };
      return { ...newState, status: applyComputedMaxes(state.status, state.attributes, computeAllStatusBonuses(newState)) };
    }

    // ── Efeitos Narrativos ───────────────────────────────────────────────────

    // { effect: { nome, linhas: [{tipo:'status',statusKey,delta}|{tipo:'texto',texto}] } }
    case 'ADD_NARRATIVE_EFFECT': {
      const newEffects = [...(state.narrativeEffects ?? []), action.effect];
      let newStatus = applyComputedMaxes(
        state.status, state.attributes,
        computeAllStatusBonuses({ ...state, narrativeEffects: newEffects })
      );
      // Aumenta current para bônus positivos de status
      for (const linha of action.effect.linhas ?? []) {
        if (linha.tipo === 'status' && linha.delta > 0 && COMPUTED_STATUS_KEYS.includes(linha.statusKey)) {
          const s = newStatus[linha.statusKey];
          newStatus = { ...newStatus, [linha.statusKey]: { ...s, current: Math.min(s.current + linha.delta, s.max) } };
        }
      }
      return { ...state, narrativeEffects: newEffects, status: newStatus };
    }

    // { index }
    case 'REMOVE_NARRATIVE_EFFECT': {
      const newEffects = (state.narrativeEffects ?? []).filter((_, i) => i !== action.index);
      const newStatus = applyComputedMaxes(
        state.status, state.attributes,
        computeAllStatusBonuses({ ...state, narrativeEffects: newEffects })
      );
      return { ...state, narrativeEffects: newEffects, status: newStatus };
    }

    // { efeitos: [{ tipo:'status', statusKey, delta }] }
    case 'USE_POTION_RECOVERY': {
      let newStatus = { ...state.status };
      for (const ef of action.efeitos ?? []) {
        if (ef.tipo === 'status' && ef.delta > 0) {
          const s = newStatus[ef.statusKey];
          if (s) {
            const max = s.max ?? Infinity;
            newStatus = { ...newStatus, [ef.statusKey]: { ...s, current: Math.min(s.current + ef.delta, max) } };
          }
        }
      }
      return { ...state, status: newStatus };
    }

    // { key: 'vida'|'energia'|..., direction: 'up'|'down' }
    case 'MOVE_STATUS': {
      const order = [...state.settings.statusOrder];
      const idx = order.indexOf(action.key);
      if (action.direction === 'up' && idx > 0) {
        [order[idx], order[idx - 1]] = [order[idx - 1], order[idx]];
      } else if (action.direction === 'down' && idx < order.length - 1) {
        [order[idx], order[idx + 1]] = [order[idx + 1], order[idx]];
      }
      return { ...state, settings: { ...state.settings, statusOrder: order } };
    }

    // { key: 'robustez'|'Físicos'|..., delta: +5|-5 }
    case 'CHANGE_XP_COST': {
      const cur = state.settings.xpCosts[action.key] ?? 5;
      const next = Math.max(5, cur + action.delta);
      return {
        ...state,
        settings: {
          ...state.settings,
          xpCosts: { ...state.settings.xpCosts, [action.key]: next },
        },
      };
    }

    // { trailId }
    case 'ACQUIRE_TRAIL': {
      if (state.skillTree.acquiredTrails[action.trailId]) return state; // already acquired
      const trail = findTrail(action.trailId);
      if (!trail) return state;
      const baseCost = 40 + state.skillTree.trailCount * 20;
      const nextCost = applyRaceTrailDiscount(state, action.trailId, baseCost);
      if (state.status.xp.current < nextCost) return state;
      const newXp = { ...state.status.xp, current: state.status.xp.current - nextCost };
      return {
        ...state,
        status: { ...state.status, xp: newXp },
        skillTree: {
          ...state.skillTree,
          trailCount: state.skillTree.trailCount + 1,
          acquiredTrails: {
            ...state.skillTree.acquiredTrails,
            [action.trailId]: { cost: nextCost, skills: {} },
          },
        },
      };
    }

    // { trailId, skillId, targetLevel }
    case 'LEARN_SKILL': {
      const trail = findTrail(action.trailId);
      if (!trail) return state;
      const skill = trail.skills.find(s => s.id === action.skillId);
      if (!skill) return state;

      // Auto-adquire a trilha na primeira compra de habilidade
      let trailData = state.skillTree.acquiredTrails[action.trailId];
      let newSkillTree = state.skillTree;
      if (!trailData) {
        // Se pertence a uma categoria, reutiliza o custo de outra trilha já adquirida
        let nextCost = 40 + state.skillTree.trailCount * 20;
        if (trail.categoria) {
          const catTrails = findCategoryTrails(trail.categoria);
          const existing = catTrails.find(ct => state.skillTree.acquiredTrails[ct.id]);
          if (existing) nextCost = state.skillTree.acquiredTrails[existing.id].cost;
        }
        // Respeita custo personalizado definido antes da aquisição
        if (!trail.categoria || !nextCost) {
          nextCost = state.skillTree.customCosts?.[action.trailId] ?? nextCost;
        }
        // Desconto racial (Azunam): só aplica se não veio de categoria/customCost,
        // pois esses já trazem um custo decidido pelo jogador.
        if (!trail.categoria && !state.skillTree.customCosts?.[action.trailId]) {
          nextCost = applyRaceTrailDiscount(state, action.trailId, nextCost);
        }

        trailData = { cost: nextCost, skills: {} };
        newSkillTree = {
          ...state.skillTree,
          trailCount: state.skillTree.trailCount + 1,
          acquiredTrails: {
            ...state.skillTree.acquiredTrails,
            [action.trailId]: trailData,
          },
        };

        // Adquire todas as outras trilhas da mesma categoria no mesmo custo
        // (não incrementa trailCount por categoria — a "slot" já foi contada acima)
        if (trail.categoria) {
          const catTrails = findCategoryTrails(trail.categoria);
          for (const catTrail of catTrails) {
            if (catTrail.id !== action.trailId && !newSkillTree.acquiredTrails[catTrail.id]) {
              newSkillTree = {
                ...newSkillTree,
                acquiredTrails: {
                  ...newSkillTree.acquiredTrails,
                  [catTrail.id]: { cost: nextCost, skills: {} },
                },
              };
            }
          }
        }
      }

      const curLevel = trailData.skills[action.skillId] ?? 0;
      if (action.targetLevel <= curLevel || action.targetLevel > skill.maxLevel) return state;
      const cost = xpCostForRange(curLevel, action.targetLevel, trailData.cost);
      if (state.status.xp.current < cost) return state;
      const newXp = { ...state.status.xp, current: state.status.xp.current - cost };
      return {
        ...state,
        status: { ...state.status, xp: newXp },
        skillTree: {
          ...newSkillTree,
          acquiredTrails: {
            ...newSkillTree.acquiredTrails,
            [action.trailId]: {
              ...trailData,
              skills: { ...trailData.skills, [action.skillId]: action.targetLevel },
            },
          },
        },
      };
    }

    // { trailId, skillId } — downgrade skill by 1 (no XP refund)
    case 'UNLEARN_SKILL': {
      const trailData = state.skillTree.acquiredTrails[action.trailId];
      if (!trailData) return state;
      const curLevel = trailData.skills[action.skillId] ?? 0;
      if (curLevel <= 0) return state;
      const newLevel = curLevel - 1;
      const newSkills = { ...trailData.skills };
      if (newLevel === 0) delete newSkills[action.skillId];
      else newSkills[action.skillId] = newLevel;
      return {
        ...state,
        skillTree: {
          ...state.skillTree,
          acquiredTrails: {
            ...state.skillTree.acquiredTrails,
            [action.trailId]: { ...trailData, skills: newSkills },
          },
        },
      };
    }

    // { trailId, cost } — edita o custo XP/nível de uma trilha
    case 'SET_TRAIL_COST': {
      const cost = Math.max(1, parseInt(action.cost) || 1);
      const existing = state.skillTree.acquiredTrails[action.trailId];
      if (existing) {
        return {
          ...state,
          skillTree: {
            ...state.skillTree,
            acquiredTrails: {
              ...state.skillTree.acquiredTrails,
              [action.trailId]: { ...existing, cost },
            },
          },
        };
      }
      // Trilha ainda não adquirida — salva em customCosts
      return {
        ...state,
        skillTree: {
          ...state.skillTree,
          customCosts: { ...(state.skillTree.customCosts ?? {}), [action.trailId]: cost },
        },
      };
    }

    // { titleId }
    case 'ACQUIRE_TITLE': {
      const acquired = state.titles?.acquired ?? [];
      if (acquired.includes(action.titleId)) return state;
      const title = findTitleById(action.titleId);
      if (!title) return state;

      const newBonuses = { ...(state.titles?.statusBonuses ?? {}) };
      for (const ef of title.efeitos ?? []) {
        newBonuses[ef.status] = (newBonuses[ef.status] || 0) + ef.delta;
      }

      // Acumula skill-based e attr-based bonuses do título
      const newSkillBonuses = [...(state.titles?.skillBonuses ?? []), ...(title.skillEfeitos ?? [])];
      const newAttrBonuses  = [...(state.titles?.attrBonuses  ?? []), ...(title.attrEfeitos  ?? [])];

      let newStatus = applyComputedMaxes(
        state.status, state.attributes,
        computeAllStatusBonuses({ ...state, titles: { ...state.titles, statusBonuses: newBonuses, skillBonuses: newSkillBonuses, attrBonuses: newAttrBonuses } })
      );
      // Aumenta o current proporcional ao bônus positivo (estático)
      for (const ef of title.efeitos ?? []) {
        if (ef.delta > 0 && COMPUTED_STATUS_KEYS.includes(ef.status)) {
          const s = newStatus[ef.status];
          newStatus = { ...newStatus, [ef.status]: { ...s, current: Math.min(s.current + ef.delta, s.max) } };
        }
      }
      // Aumenta o current para bônus de skill (valor atual da perícia)
      for (const { status, skill } of title.skillEfeitos ?? []) {
        const delta = state.skills?.[skill] ?? 0;
        if (delta > 0 && COMPUTED_STATUS_KEYS.includes(status)) {
          const s = newStatus[status];
          newStatus = { ...newStatus, [status]: { ...s, current: Math.min(s.current + delta, s.max) } };
        }
      }
      // Aumenta o current para bônus de attr já atendidos
      for (const { status, group, subAttr, threshold, delta } of title.attrEfeitos ?? []) {
        if ((state.attributes[group]?.[subAttr] ?? 0) >= threshold && COMPUTED_STATUS_KEYS.includes(status)) {
          const s = newStatus[status];
          newStatus = { ...newStatus, [status]: { ...s, current: Math.min(s.current + delta, s.max) } };
        }
      }

      const newBindings = { ...(state.titles?.bindings ?? {}) };
      if (action.boundSkills?.length > 0) {
        newBindings[action.titleId] = action.boundSkills; // [{trailId, skillId, nome}]
      }

      return {
        ...state,
        status: newStatus,
        titles: {
          acquired: [...acquired, action.titleId],
          statusBonuses: newBonuses,
          skillBonuses: newSkillBonuses,
          attrBonuses: newAttrBonuses,
          bindings: newBindings,
        },
      };
    }

    // { titleId, boundSkills } — re-vincula habilidades a um título já adquirido.
    // Usado quando o título foi adquirido sem binding ou para trocar a maestria
    // escolhida (ex: trocar a maestria do +4 do Aprendiz de Conjurador).
    case 'REBIND_TITLE_SKILLS': {
      if (!(state.titles?.acquired ?? []).includes(action.titleId)) return state;
      const oldBindings = state.titles?.bindings ?? {};
      const newBindings = { ...oldBindings };
      if (action.boundSkills?.length > 0) {
        newBindings[action.titleId] = action.boundSkills;
      } else {
        delete newBindings[action.titleId];
      }
      return {
        ...state,
        titles: { ...state.titles, bindings: newBindings },
      };
    }

    // ── Inventário ────────────────────────────────────────────────────────────

    // { section: 'bolsa'|'cinto', index, field: 'nome'|'obs', value }
    case 'INVENTORY_SET_ITEM': {
      const section = state.inventory[action.section];
      const newItens = [...section.itens];
      newItens[action.index] = { ...newItens[action.index], [action.field]: action.value };
      return { ...state, inventory: { ...state.inventory, [action.section]: { ...section, itens: newItens } } };
    }

    // Expande a bolsa em 1 slot (até o max pré-alocado)
    case 'INVENTORY_EXPAND_BOLSA': {
      const { bolsa } = state.inventory;
      if (bolsa.capacidade >= bolsa.itens.length) return state;
      return { ...state, inventory: { ...state.inventory, bolsa: { ...bolsa, capacidade: bolsa.capacidade + 1 } } };
    }

    // Diminui a bolsa em 1 slot (mínimo 1; só se o último slot estiver vazio)
    case 'INVENTORY_SHRINK_BOLSA': {
      const { bolsa } = state.inventory;
      if (bolsa.capacidade <= 1) return state;
      const lastItem = bolsa.itens[bolsa.capacidade - 1];
      if (lastItem?.nome) return { ...state, _shrinkBlocked: true }; // slot ocupado
      return { ...state, inventory: { ...state.inventory, bolsa: { ...bolsa, capacidade: bolsa.capacidade - 1 } } };
    }

    // { nome, icone, capacidade, tipo? } — tipo 'aljava' cria armazenamento de munições
    case 'INVENTORY_ADD_STORAGE': {
      const id = `storage_${Date.now()}`;
      const newStorage = action.tipo === 'aljava'
        ? {
            id,
            nome: action.nome ?? 'Aljava',
            icone: action.icone ?? '🏹',
            tipo: 'aljava',
            capacidade: action.capacidade ?? 20, // máximo de unidades somando todas as munições
            municoes: [], // [{ id, nome, nivel, quantidade, efeito, venenoSlots: [{nome, efeito}|null] }]
          }
        : {
            id,
            nome: action.nome ?? 'Armazenamento',
            icone: action.icone ?? '📦',
            capacidade: action.capacidade ?? 6,
            itens: Array.from({ length: 40 }, () => ({ nome: '', obs: '' })),
          };
      const storages = [...(state.inventory.storages ?? []), newStorage];
      return { ...state, inventory: { ...state.inventory, storages } };
    }

    // { storageId }
    case 'INVENTORY_REMOVE_STORAGE': {
      const storages = (state.inventory.storages ?? []).filter(s => s.id !== action.storageId);
      return { ...state, inventory: { ...state.inventory, storages } };
    }

    // { storageId, nome?, icone? }
    case 'INVENTORY_RENAME_STORAGE': {
      const storages = (state.inventory.storages ?? []).map(s => {
        if (s.id !== action.storageId) return s;
        return {
          ...s,
          ...(action.nome  !== undefined ? { nome: action.nome }   : {}),
          ...(action.icone !== undefined ? { icone: action.icone } : {}),
        };
      });
      return { ...state, inventory: { ...state.inventory, storages } };
    }

    // { storageId, delta }
    case 'INVENTORY_SET_STORAGE_CAPACITY': {
      const storages = (state.inventory.storages ?? []).map(s => {
        if (s.id !== action.storageId) return s;
        if (s.tipo === 'aljava') {
          // Capacidade em unidades de munição; não reduz abaixo do total atual
          const total = (s.municoes ?? []).reduce((sum, m) => sum + (m.quantidade || 0), 0);
          const cap = Math.max(1, Math.min(99, (s.capacidade ?? 20) + action.delta));
          if (action.delta < 0 && cap < total) return s;
          return { ...s, capacidade: cap };
        }
        const cap = Math.max(1, Math.min(40, s.capacidade + action.delta));
        // Se está diminuindo, bloqueia se o último slot estiver ocupado
        if (action.delta < 0 && s.itens[s.capacidade - 1]?.nome) return s;
        return { ...s, capacidade: cap };
      });
      return { ...state, inventory: { ...state.inventory, storages } };
    }

    // { storageId, index, field: 'nome'|'obs', value }
    case 'INVENTORY_SET_STORAGE_ITEM': {
      const storages = (state.inventory.storages ?? []).map(s => {
        if (s.id !== action.storageId) return s;
        const newItens = [...s.itens];
        newItens[action.index] = { ...newItens[action.index], [action.field]: action.value };
        return { ...s, itens: newItens };
      });
      return { ...state, inventory: { ...state.inventory, storages } };
    }

    // { from: { section?|storageId?, index }, to: { section?|storageId? } }
    // Move um item para o primeiro slot livre do destino (bolsa ou armazenamento padrão)
    case 'INVENTORY_MOVE_ITEM': {
      const inv = state.inventory;
      const readLoc = (loc) => {
        if (loc.storageId) {
          const st = (inv.storages ?? []).find(s => s.id === loc.storageId);
          return st ? { itens: st.itens ?? [], cap: st.capacidade ?? 0 } : null;
        }
        const sec = inv[loc.section];
        return sec ? { itens: sec.itens ?? [], cap: sec.capacidade ?? (sec.itens?.length ?? 0) } : null;
      };
      const src = readLoc(action.from);
      const dst = readLoc(action.to);
      if (!src || !dst) return state;

      const item = src.itens[action.from.index];
      if (!item?.nome) return state;

      let free = -1;
      for (let i = 0; i < dst.cap; i++) {
        if (!dst.itens[i]?.nome) { free = i; break; }
      }
      if (free < 0) return state; // destino cheio

      const emptyItem = { nome: '', obs: '' };
      const writeLoc = (invAcc, loc, itens) => {
        if (loc.storageId) {
          return { ...invAcc, storages: (invAcc.storages ?? []).map(s => s.id === loc.storageId ? { ...s, itens } : s) };
        }
        return { ...invAcc, [loc.section]: { ...invAcc[loc.section], itens } };
      };

      const sameContainer = (action.from.storageId ?? action.from.section) === (action.to.storageId ?? action.to.section);
      let newInv;
      if (sameContainer) {
        const itens = [...src.itens];
        itens[free] = { ...item };
        itens[action.from.index] = emptyItem;
        newInv = writeLoc(inv, action.from, itens);
      } else {
        const srcItens = [...src.itens];
        srcItens[action.from.index] = emptyItem;
        const dstItens = [...dst.itens];
        dstItens[free] = { ...item };
        newInv = writeLoc(writeLoc(inv, action.from, srcItens), action.to, dstItens);
      }
      return { ...state, inventory: newInv };
    }

    // ── Aljava (munições) ─────────────────────────────────────────────────────

    // { storageId, municao: { nome, nivel, quantidade, efeito, venenoSlots } }
    case 'ALJAVA_ADD_MUNICAO': {
      const storages = (state.inventory.storages ?? []).map(s => {
        if (s.id !== action.storageId) return s;
        const cap   = s.capacidade ?? 20;
        const total = (s.municoes ?? []).reduce((sum, m) => sum + (m.quantidade || 0), 0);
        const municao = {
          id: `mun_${Date.now()}`,
          nome: 'Munição', nivel: 1, quantidade: 0, efeito: '', venenoSlots: [],
          ...action.municao,
        };
        // Quantidade limitada ao espaço livre da aljava
        municao.quantidade = Math.max(0, Math.min(municao.quantidade || 0, cap - total));
        return { ...s, municoes: [...(s.municoes ?? []), municao] };
      });
      return { ...state, inventory: { ...state.inventory, storages } };
    }

    // { storageId, municaoId, changes }
    case 'ALJAVA_UPDATE_MUNICAO': {
      const storages = (state.inventory.storages ?? []).map(s => {
        if (s.id !== action.storageId) return s;
        const cap   = s.capacidade ?? 20;
        const total = (s.municoes ?? []).reduce((sum, m) => sum + (m.quantidade || 0), 0);
        const municoes = (s.municoes ?? []).map(m => {
          if (m.id !== action.municaoId) return m;
          const next = { ...m, ...action.changes };
          if (action.changes.quantidade !== undefined) {
            // Espaço livre desconsiderando a própria munição
            const maxQtd = Math.max(0, cap - (total - (m.quantidade || 0)));
            next.quantidade = Math.max(0, Math.min(next.quantidade || 0, maxQtd));
          }
          return next;
        });
        return { ...s, municoes };
      });
      return { ...state, inventory: { ...state.inventory, storages } };
    }

    // { storageId, municaoId }
    case 'ALJAVA_REMOVE_MUNICAO': {
      const storages = (state.inventory.storages ?? []).map(s => {
        if (s.id !== action.storageId) return s;
        return { ...s, municoes: (s.municoes ?? []).filter(m => m.id !== action.municaoId) };
      });
      return { ...state, inventory: { ...state.inventory, storages } };
    }

    // { storageId, municaoId, delta }
    case 'ALJAVA_CHANGE_QTY': {
      const storages = (state.inventory.storages ?? []).map(s => {
        if (s.id !== action.storageId) return s;
        const cap   = s.capacidade ?? 20;
        const total = (s.municoes ?? []).reduce((sum, m) => sum + (m.quantidade || 0), 0);
        const livre = Math.max(0, cap - total);
        const municoes = (s.municoes ?? []).map(m => {
          if (m.id !== action.municaoId) return m;
          let q = Math.max(0, (m.quantidade || 0) + action.delta);
          // Aumentos limitados ao espaço livre da aljava
          if (action.delta > 0) q = Math.min(q, (m.quantidade || 0) + livre);
          return { ...m, quantidade: q };
        });
        return { ...s, municoes };
      });
      return { ...state, inventory: { ...state.inventory, storages } };
    }

    case 'INVENTORY_TOGGLE_CINTO': {
      const { cinto } = state.inventory;
      return { ...state, inventory: { ...state.inventory, cinto: { ...cinto, ativo: !cinto.ativo } } };
    }

    // { delta }
    case 'INVENTORY_CHANGE_MOEDAS': {
      const novas = Math.max(0, (state.inventory.moedas || 0) + action.delta);
      return { ...state, inventory: { ...state.inventory, moedas: novas } };
    }

    // { nome, obs, price } — compra na loja: encontra slot vazio na bolsa,
    // grava o item e desconta as moedas. Falha silenciosa se cheio ou sem moedas.
    case 'INVENTORY_BUY_ITEM': {
      const { bolsa, moedas } = state.inventory;
      if ((moedas || 0) < action.price) return state;
      const idx = bolsa.itens.findIndex(
        (it, i) => i < bolsa.capacidade && !it?.nome
      );
      if (idx < 0) return state;
      const newItens = [...bolsa.itens];
      newItens[idx] = { nome: action.nome, obs: action.obs || '' };
      return {
        ...state,
        inventory: {
          ...state.inventory,
          moedas: (moedas || 0) - action.price,
          bolsa: { ...bolsa, itens: newItens },
        },
      };
    }

    // { entry: { categoria, titulo, conteudo, tags?, status? } }
    case 'JOURNAL_ADD': {
      const entry = {
        id: `note_${Date.now()}`,
        categoria: action.entry.categoria ?? 'nota',
        titulo: action.entry.titulo ?? '',
        conteudo: action.entry.conteudo ?? '',
        tags: action.entry.tags ?? [],
        pinned: false,
        status: action.entry.status ?? null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return {
        ...state,
        journal: {
          ...state.journal,
          entries: [entry, ...(state.journal?.entries ?? [])],
        },
      };
    }

    // { id, field, value }
    case 'JOURNAL_UPDATE': {
      const entries = (state.journal?.entries ?? []).map(e =>
        e.id === action.id
          ? { ...e, [action.field]: action.value, updatedAt: Date.now() }
          : e
      );
      return { ...state, journal: { ...state.journal, entries } };
    }

    // { id }
    case 'JOURNAL_DELETE': {
      const entries = (state.journal?.entries ?? []).filter(e => e.id !== action.id);
      return { ...state, journal: { ...state.journal, entries } };
    }

    // { id } — toggle pin
    case 'JOURNAL_TOGGLE_PIN': {
      const entries = (state.journal?.entries ?? []).map(e =>
        e.id === action.id ? { ...e, pinned: !e.pinned, updatedAt: Date.now() } : e
      );
      return { ...state, journal: { ...state.journal, entries } };
    }

    // ── Pets ──────────────────────────────────────────────────────────────────

    // { pet: { nome, icone, tipo } } — cria um novo pet com defaults
    case 'PET_ADD': {
      const pet = {
        id: `pet_${Date.now()}`,
        nome: 'Pet',
        icone: '🐾',
        tipo: 'domado',        // 'domado' | 'alma'
        invocado: false,
        vida: { current: 10, max: 10 },
        mana: { current: 0, max: 0 },
        caracteristicas: [],
        equipamentos: [],
        bolsas: [],
        obs: '',
        ...action.pet,
      };
      return { ...state, pets: [...(state.pets ?? []), pet] };
    }

    // { petId, changes } — merge raso no pet (usado para status, listas aninhadas, etc.)
    case 'PET_UPDATE': {
      const pets = (state.pets ?? []).map(p =>
        p.id === action.petId ? { ...p, ...action.changes } : p
      );
      return { ...state, pets };
    }

    // { petId }
    case 'PET_REMOVE':
      return { ...state, pets: (state.pets ?? []).filter(p => p.id !== action.petId) };

    case 'RESET':
      return INITIAL_CHARACTER;

    default:
      return state;
  }
}

export function CharacterProvider({ children, sheetId, userId, sheetName }) {
  const storageKey = sheetId ? `@fichadigital_v2_${sheetId}` : STORAGE_KEY;
  const [character, dispatch] = useReducer(reducer, INITIAL_CHARACTER);
  const loadedRef = useRef(false);
  const syncTimerRef = useRef(null);

  useEffect(() => {
    AsyncStorage.getItem(storageKey).then((raw) => {
      if (raw) {
        try { dispatch({ type: 'LOAD', payload: JSON.parse(raw) }); } catch (_) {}
      }
      loadedRef.current = true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    if (!loadedRef.current) return;

    // Salva localmente (sempre funciona, mesmo offline)
    AsyncStorage.setItem(storageKey, JSON.stringify(character));

    // Debounce sync remoto: espera 2s de inatividade antes de enviar
    if (userId && sheetId) {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      syncTimerRef.current = setTimeout(async () => {
        const online = await isOnline();
        if (online) {
          try {
            await uploadSheet(userId, sheetId, character, { name: sheetName });
          } catch {
            // Falhou — coloca na fila para tentar depois
            await queueSync({ type: 'upsert', sheetId, name: sheetName });
          }
        } else {
          await queueSync({ type: 'upsert', sheetId, name: sheetName });
        }
      }, 2000);
    }

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [character, storageKey, userId, sheetId, sheetName]);

  return (
    <CharacterContext.Provider value={{ character, dispatch }}>
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacter() {
  const ctx = useContext(CharacterContext);
  if (!ctx) throw new Error('useCharacter must be inside CharacterProvider');
  return ctx;
}
