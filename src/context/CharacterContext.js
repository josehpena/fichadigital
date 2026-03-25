import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  INITIAL_CHARACTER,
  COMPUTED_STATUS_KEYS,
  computeMaxValues,
  SKILL_CATEGORIES,
  ARMOR_SLOTS,
  xpCostForRange,
} from '../data/initialCharacter';
import { findTrail, findCategoryTrails } from '../data/trailsData';
import { findTitleById } from '../data/titlesData';
import { syncOnChange } from '../services/characterSync';

// Lazy-load AuthContext to avoid circular dependency
let _useAuth = null;
function getAuth() {
  if (!_useAuth) {
    try { _useAuth = require('./AuthContext').useAuth; } catch (_) {}
  }
  return _useAuth;
}

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

function computeNarrativeBonuses(narrativeEffects = []) {
  const result = {};
  for (const ef of narrativeEffects) {
    for (const linha of ef.linhas ?? []) {
      if (linha.tipo === 'status' && linha.statusKey && linha.delta) {
        result[linha.statusKey] = (result[linha.statusKey] || 0) + linha.delta;
      }
    }
  }
  return result;
}

function computeTitleSkillBonuses(skillBonuses = [], skills = {}) {
  const result = {};
  for (const { status, skill } of skillBonuses) {
    result[status] = (result[status] || 0) + (skills[skill] || 0);
  }
  return result;
}

function computeTitleAttrBonuses(attrBonuses = [], attrs = {}) {
  const result = {};
  for (const { status, group, subAttr, threshold, delta } of attrBonuses) {
    if ((attrs[group]?.[subAttr] ?? 0) >= threshold) {
      result[status] = (result[status] || 0) + delta;
    }
  }
  return result;
}

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
      if (!p.attributes?.reputacao?.manha) return INITIAL_CHARACTER;
      const status = applyComputedMaxes(
        p.status, p.attributes,
        totalStatusBonuses(p.titles?.statusBonuses ?? {}, p.narrativeEffects ?? [], p.titles?.skillBonuses ?? [], p.skills ?? {}, p.titles?.attrBonuses ?? [], p.attributes ?? {})
      );
      const savedSettings = p.settings ?? {};
      const settings = {
        ...INITIAL_CHARACTER.settings,
        ...savedSettings,
        xpCosts: { ...INITIAL_CHARACTER.settings.xpCosts, ...(savedSettings.xpCosts ?? {}) },
        statusOrder: savedSettings.statusOrder ?? INITIAL_CHARACTER.settings.statusOrder,
      };
      const emptyAcc = () => ({ nome: '', armadura: 0, resMagica: 0, reputacao: 0, efeitos: '', tiras: [] });
      const loadedAcc = p.accessories ?? INITIAL_CHARACTER.accessories;
      const accessories = loadedAcc.length >= 11
        ? loadedAcc
        : [...loadedAcc, ...Array.from({ length: 11 - loadedAcc.length }, emptyAcc)];

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
        settings,
      };
    }

    case 'SET_NAME':
      return { ...state, name: action.value };

    case 'SET_RACIAL_TRAITS':
      return { ...state, racialTraits: action.value };

    case 'CHANGE_STATUS': {
      if (action.field === 'max' && COMPUTED_STATUS_KEYS.includes(action.statusKey)) return state;
      const s = state.status[action.statusKey];
      const updated = {
        ...s,
        [action.field]: clamp(
          s[action.field] + action.delta,
          0,
          action.field === 'current' ? s.max : 999
        ),
      };
      if (action.field === 'max' && updated.current > updated.max) updated.current = updated.max;
      return { ...state, status: { ...state.status, [action.statusKey]: updated } };
    }

    case 'CHANGE_ATTRIBUTE': {
      const group    = state.attributes[action.group];
      const curVal   = group[action.subAttr] || 0;
      const newVal   = clamp(curVal + action.delta, 1, 10);
      const newAttrs = { ...state.attributes, [action.group]: { ...group, [action.subAttr]: newVal } };
      const newStatus = applyComputedMaxes(
        state.status, newAttrs,
        totalStatusBonuses(state.titles?.statusBonuses ?? {}, state.narrativeEffects ?? [], state.titles?.skillBonuses ?? [], state.skills ?? {}, state.titles?.attrBonuses ?? [], newAttrs)
      );
      if (newVal > curVal) {
        const xpCost = state.settings.xpCosts[action.group] ?? 10;
        const cost   = xpCostForRange(curVal, newVal, xpCost);
        if (state.status.xp.current < cost) return state;
        newStatus.xp = { ...newStatus.xp, current: newStatus.xp.current - cost };
      }
      return { ...state, attributes: newAttrs, status: newStatus };
    }

    case 'CHANGE_SKILL': {
      const curVal = state.skills[action.skill] || 0;
      const newVal = clamp(curVal + action.delta, 0, 5);
      const newSkills = { ...state.skills, [action.skill]: newVal };
      const skillBonuses = state.titles?.skillBonuses ?? [];
      const affectsMax = skillBonuses.some(b => b.skill === action.skill);
      const newStatus = affectsMax
        ? applyComputedMaxes(state.status, state.attributes,
            totalStatusBonuses(state.titles?.statusBonuses ?? {}, state.narrativeEffects ?? [], skillBonuses, newSkills, state.titles?.attrBonuses ?? [], state.attributes))
        : state.status;
      if (newVal > curVal) {
        const cat    = getSkillCategory(action.skill);
        const xpCost = state.settings.xpCosts[cat] ?? 5;
        const cost   = xpCostForRange(curVal, newVal, xpCost);
        if (state.status.xp.current < cost) return state;
        const xpBase = affectsMax ? newStatus : state.status;
        const newXp  = { ...xpBase.xp, current: xpBase.xp.current - cost };
        return { ...state, skills: newSkills, status: { ...newStatus, xp: newXp } };
      }
      return { ...state, skills: newSkills, status: newStatus };
    }

    case 'SET_EQUIP_FIELD': {
      const slot = state.equipment[action.slot];
      return { ...state, equipment: { ...state.equipment, [action.slot]: { ...slot, [action.field]: action.value } } };
    }

    case 'ADD_EQUIP_TIRA': {
      const slot = state.equipment[action.slot];
      return { ...state, equipment: { ...state.equipment, [action.slot]: { ...slot, tiras: [...(slot.tiras ?? []), action.tira] } } };
    }

    case 'REMOVE_EQUIP_TIRA': {
      const slot = state.equipment[action.slot];
      const tiras = (slot.tiras ?? []).filter((_, i) => i !== action.index);
      return { ...state, equipment: { ...state.equipment, [action.slot]: { ...slot, tiras } } };
    }

    case 'CHANGE_EQUIP_DURABILITY': {
      const slot = state.equipment[action.slot];
      const newDur = clamp(slot.durabilidade + action.delta, 0, slot.durabilidadeMax);
      return { ...state, equipment: { ...state.equipment, [action.slot]: { ...slot, durabilidade: newDur } } };
    }

    case 'CHANGE_WEAPON_DURABILITY': {
      const slot = state.equipment[action.slot];
      const newDur = Math.max(0, Math.min((slot.durabilidade ?? 10) + action.delta, slot.durabilidadeMax ?? 10));
      return { ...state, equipment: { ...state.equipment, [action.slot]: { ...slot, durabilidade: newDur } } };
    }

    case 'CHANGE_ALL_ARMOR_DURABILITY': {
      const newEquipment = { ...state.equipment };
      for (const k of ARMOR_SLOTS) {
        const sl = newEquipment[k];
        newEquipment[k] = { ...sl, durabilidade: Math.max(0, Math.min(sl.durabilidade + action.delta, sl.durabilidadeMax)) };
      }
      return { ...state, equipment: newEquipment };
    }

    case 'EQUIP_FROM_INVENTORY': {
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
      const handSlot = state.equipment[action.slot];
      const newHandSlot = item.weaponData
        ? { ...handSlot, nome: item.nome, ...item.weaponData }
        : { ...handSlot, nome: item.nome };
      return { ...state, inventory: newInventory, equipment: { ...state.equipment, [action.slot]: newHandSlot } };
    }

    case 'UNEQUIP_TO_INVENTORY': {
      const handSlot = state.equipment[action.slot];
      if (!handSlot?.nome) return state;
      const bolsa = state.inventory.bolsa;
      const emptyIdx = bolsa.itens.findIndex((it, i) => !it.nome && i < bolsa.capacidade);
      if (emptyIdx === -1) return state;
      const newItens = [...bolsa.itens];
      newItens[emptyIdx] = {
        nome: handSlot.nome, obs: '',
        weaponData: {
          tipo: handSlot.tipo ?? '', tipo2: handSlot.tipo2 ?? '',
          dano: handSlot.dano ?? '', efeitos: handSlot.efeitos ?? '',
          nivel: handSlot.nivel ?? 1, tiras: handSlot.tiras ?? [],
          durabilidade: handSlot.durabilidade ?? 10, durabilidadeMax: handSlot.durabilidadeMax ?? 10,
        },
      };
      const emptyHand = { tipo: '', tipo2: '', nome: '', dano: '', efeitos: '', nivel: 1, tiras: [], durabilidade: 10, durabilidadeMax: 10 };
      return {
        ...state,
        inventory: { ...state.inventory, bolsa: { ...bolsa, itens: newItens } },
        equipment: { ...state.equipment, [action.slot]: emptyHand },
      };
    }

    case 'SET_ACCESSORY': {
      const accessories = [...state.accessories];
      accessories[action.index] = { ...accessories[action.index], [action.field]: action.value };
      return { ...state, accessories };
    }

    case 'ADD_ACC_TIRA': {
      const accessories = [...state.accessories];
      const acc = accessories[action.index];
      accessories[action.index] = { ...acc, tiras: [...(acc.tiras ?? []), action.tira] };
      return { ...state, accessories };
    }

    case 'REMOVE_ACC_TIRA': {
      const accessories = [...state.accessories];
      const acc = accessories[action.index];
      accessories[action.index] = { ...acc, tiras: (acc.tiras ?? []).filter((_, i) => i !== action.tiraIndex) };
      return { ...state, accessories };
    }

    case 'ADD_NARRATIVE_EFFECT': {
      const newEffects = [...(state.narrativeEffects ?? []), action.effect];
      let newStatus = applyComputedMaxes(
        state.status, state.attributes,
        totalStatusBonuses(state.titles?.statusBonuses ?? {}, newEffects, state.titles?.skillBonuses ?? [], state.skills ?? {}, state.titles?.attrBonuses ?? [], state.attributes)
      );
      for (const linha of action.effect.linhas ?? []) {
        if (linha.tipo === 'status' && linha.delta > 0 && COMPUTED_STATUS_KEYS.includes(linha.statusKey)) {
          const s = newStatus[linha.statusKey];
          newStatus = { ...newStatus, [linha.statusKey]: { ...s, current: Math.min(s.current + linha.delta, s.max) } };
        }
      }
      return { ...state, narrativeEffects: newEffects, status: newStatus };
    }

    case 'REMOVE_NARRATIVE_EFFECT': {
      const newEffects = (state.narrativeEffects ?? []).filter((_, i) => i !== action.index);
      const newStatus = applyComputedMaxes(
        state.status, state.attributes,
        totalStatusBonuses(state.titles?.statusBonuses ?? {}, newEffects, state.titles?.skillBonuses ?? [], state.skills ?? {}, state.titles?.attrBonuses ?? [], state.attributes)
      );
      return { ...state, narrativeEffects: newEffects, status: newStatus };
    }

    case 'MOVE_STATUS': {
      const order = [...state.settings.statusOrder];
      const idx = order.indexOf(action.key);
      if (action.direction === 'up' && idx > 0) [order[idx], order[idx - 1]] = [order[idx - 1], order[idx]];
      else if (action.direction === 'down' && idx < order.length - 1) [order[idx], order[idx + 1]] = [order[idx + 1], order[idx]];
      return { ...state, settings: { ...state.settings, statusOrder: order } };
    }

    case 'CHANGE_XP_COST': {
      const cur  = state.settings.xpCosts[action.key] ?? 5;
      const next = Math.max(5, cur + action.delta);
      return { ...state, settings: { ...state.settings, xpCosts: { ...state.settings.xpCosts, [action.key]: next } } };
    }

    case 'ACQUIRE_TRAIL': {
      if (state.skillTree.acquiredTrails[action.trailId]) return state;
      const trail = findTrail(action.trailId);
      if (!trail) return state;
      const nextCost = 40 + state.skillTree.trailCount * 20;
      if (state.status.xp.current < nextCost) return state;
      const newXp = { ...state.status.xp, current: state.status.xp.current - nextCost };
      return {
        ...state,
        status: { ...state.status, xp: newXp },
        skillTree: { trailCount: state.skillTree.trailCount + 1, acquiredTrails: { ...state.skillTree.acquiredTrails, [action.trailId]: { cost: nextCost, skills: {} } } },
      };
    }

    case 'LEARN_SKILL': {
      const trail = findTrail(action.trailId);
      if (!trail) return state;
      const skill = trail.skills.find(s => s.id === action.skillId);
      if (!skill) return state;
      let trailData = state.skillTree.acquiredTrails[action.trailId];
      let newSkillTree = state.skillTree;
      if (!trailData) {
        let nextCost = 40 + state.skillTree.trailCount * 20;
        if (trail.categoria) {
          const catTrails = findCategoryTrails(trail.categoria);
          const existing = catTrails.find(ct => state.skillTree.acquiredTrails[ct.id]);
          if (existing) nextCost = state.skillTree.acquiredTrails[existing.id].cost;
        }
        trailData = { cost: nextCost, skills: {} };
        newSkillTree = { trailCount: state.skillTree.trailCount + 1, acquiredTrails: { ...state.skillTree.acquiredTrails, [action.trailId]: trailData } };
        if (trail.categoria) {
          const catTrails = findCategoryTrails(trail.categoria);
          for (const catTrail of catTrails) {
            if (catTrail.id !== action.trailId && !newSkillTree.acquiredTrails[catTrail.id]) {
              newSkillTree = { trailCount: newSkillTree.trailCount + 1, acquiredTrails: { ...newSkillTree.acquiredTrails, [catTrail.id]: { cost: nextCost, skills: {} } } };
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
        skillTree: { ...newSkillTree, acquiredTrails: { ...newSkillTree.acquiredTrails, [action.trailId]: { ...trailData, skills: { ...trailData.skills, [action.skillId]: action.targetLevel } } } },
      };
    }

    case 'UNLEARN_SKILL': {
      const trailData = state.skillTree.acquiredTrails[action.trailId];
      if (!trailData) return state;
      const curLevel = trailData.skills[action.skillId] ?? 0;
      if (curLevel <= 0) return state;
      const newLevel = curLevel - 1;
      const newSkills = { ...trailData.skills };
      if (newLevel === 0) delete newSkills[action.skillId];
      else newSkills[action.skillId] = newLevel;
      return { ...state, skillTree: { ...state.skillTree, acquiredTrails: { ...state.skillTree.acquiredTrails, [action.trailId]: { ...trailData, skills: newSkills } } } };
    }

    case 'ACQUIRE_TITLE': {
      const acquired = state.titles?.acquired ?? [];
      if (acquired.includes(action.titleId)) return state;
      const title = findTitleById(action.titleId);
      if (!title) return state;
      const newBonuses = { ...(state.titles?.statusBonuses ?? {}) };
      for (const ef of title.efeitos ?? []) newBonuses[ef.status] = (newBonuses[ef.status] || 0) + ef.delta;
      const newSkillBonuses = [...(state.titles?.skillBonuses ?? []), ...(title.skillEfeitos ?? [])];
      const newAttrBonuses  = [...(state.titles?.attrBonuses  ?? []), ...(title.attrEfeitos  ?? [])];
      let newStatus = applyComputedMaxes(state.status, state.attributes, totalStatusBonuses(newBonuses, state.narrativeEffects ?? [], newSkillBonuses, state.skills ?? {}, newAttrBonuses, state.attributes));
      for (const ef of title.efeitos ?? []) {
        if (ef.delta > 0 && COMPUTED_STATUS_KEYS.includes(ef.status)) {
          const s = newStatus[ef.status];
          newStatus = { ...newStatus, [ef.status]: { ...s, current: Math.min(s.current + ef.delta, s.max) } };
        }
      }
      for (const { status, skill } of title.skillEfeitos ?? []) {
        const delta = state.skills?.[skill] ?? 0;
        if (delta > 0 && COMPUTED_STATUS_KEYS.includes(status)) {
          const s = newStatus[status];
          newStatus = { ...newStatus, [status]: { ...s, current: Math.min(s.current + delta, s.max) } };
        }
      }
      for (const { status, group, subAttr, threshold, delta } of title.attrEfeitos ?? []) {
        if ((state.attributes[group]?.[subAttr] ?? 0) >= threshold && COMPUTED_STATUS_KEYS.includes(status)) {
          const s = newStatus[status];
          newStatus = { ...newStatus, [status]: { ...s, current: Math.min(s.current + delta, s.max) } };
        }
      }
      const newBindings = { ...(state.titles?.bindings ?? {}) };
      if (action.boundSkills?.length > 0) newBindings[action.titleId] = action.boundSkills;
      return {
        ...state,
        status: newStatus,
        titles: { acquired: [...acquired, action.titleId], statusBonuses: newBonuses, skillBonuses: newSkillBonuses, attrBonuses: newAttrBonuses, bindings: newBindings },
      };
    }

    case 'INVENTORY_SET_ITEM': {
      const section = state.inventory[action.section];
      const newItens = [...section.itens];
      newItens[action.index] = { ...newItens[action.index], [action.field]: action.value };
      return { ...state, inventory: { ...state.inventory, [action.section]: { ...section, itens: newItens } } };
    }

    // Adds an item received from the master to the first empty bolsa slot
    case 'INVENTORY_ADD_GRANTED_ITEM': {
      const { bolsa } = state.inventory;
      const emptyIdx = bolsa.itens.findIndex((it, i) => !it.nome && i < bolsa.capacidade);
      if (emptyIdx === -1) return state; // bolsa cheia — item descartado
      const newItens = [...bolsa.itens];
      newItens[emptyIdx] = { nome: action.nome, obs: action.obs ?? '' };
      return { ...state, inventory: { ...state.inventory, bolsa: { ...bolsa, itens: newItens } } };
    }

    case 'INVENTORY_EXPAND_BOLSA': {
      const { bolsa } = state.inventory;
      if (bolsa.capacidade >= bolsa.itens.length) return state;
      return { ...state, inventory: { ...state.inventory, bolsa: { ...bolsa, capacidade: bolsa.capacidade + 1 } } };
    }

    case 'INVENTORY_SHRINK_BOLSA': {
      const { bolsa } = state.inventory;
      if (bolsa.capacidade <= 1) return state;
      const lastItem = bolsa.itens[bolsa.capacidade - 1];
      if (lastItem?.nome) return { ...state, _shrinkBlocked: true };
      return { ...state, inventory: { ...state.inventory, bolsa: { ...bolsa, capacidade: bolsa.capacidade - 1 } } };
    }

    case 'INVENTORY_ADD_STORAGE': {
      const id = `storage_${Date.now()}`;
      const cap = action.capacidade ?? 6;
      const newStorage = { id, nome: action.nome ?? 'Armazenamento', icone: action.icone ?? '📦', capacidade: cap, itens: Array.from({ length: 40 }, () => ({ nome: '', obs: '' })) };
      return { ...state, inventory: { ...state.inventory, storages: [...(state.inventory.storages ?? []), newStorage] } };
    }

    case 'INVENTORY_REMOVE_STORAGE': {
      const storages = (state.inventory.storages ?? []).filter(s => s.id !== action.storageId);
      return { ...state, inventory: { ...state.inventory, storages } };
    }

    case 'INVENTORY_RENAME_STORAGE': {
      const storages = (state.inventory.storages ?? []).map(s => {
        if (s.id !== action.storageId) return s;
        return { ...s, ...(action.nome !== undefined ? { nome: action.nome } : {}), ...(action.icone !== undefined ? { icone: action.icone } : {}) };
      });
      return { ...state, inventory: { ...state.inventory, storages } };
    }

    case 'INVENTORY_SET_STORAGE_CAPACITY': {
      const storages = (state.inventory.storages ?? []).map(s => {
        if (s.id !== action.storageId) return s;
        const cap = Math.max(1, Math.min(40, s.capacidade + action.delta));
        if (action.delta < 0 && s.itens[s.capacidade - 1]?.nome) return s;
        return { ...s, capacidade: cap };
      });
      return { ...state, inventory: { ...state.inventory, storages } };
    }

    case 'INVENTORY_SET_STORAGE_ITEM': {
      const storages = (state.inventory.storages ?? []).map(s => {
        if (s.id !== action.storageId) return s;
        const newItens = [...s.itens];
        newItens[action.index] = { ...newItens[action.index], [action.field]: action.value };
        return { ...s, itens: newItens };
      });
      return { ...state, inventory: { ...state.inventory, storages } };
    }

    case 'INVENTORY_TOGGLE_CINTO': {
      const { cinto } = state.inventory;
      return { ...state, inventory: { ...state.inventory, cinto: { ...cinto, ativo: !cinto.ativo } } };
    }

    case 'INVENTORY_CHANGE_MOEDAS': {
      const novas = Math.max(0, (state.inventory.moedas || 0) + action.delta);
      return { ...state, inventory: { ...state.inventory, moedas: novas } };
    }

    case 'RESET':
      return INITIAL_CHARACTER;

    default:
      return state;
  }
}

export function CharacterProvider({ children, sheetId }) {
  const storageKey = sheetId ? `@fichadigital_v2_${sheetId}` : STORAGE_KEY;
  const [character, dispatchBase] = useReducer(reducer, INITIAL_CHARACTER);
  const userIdRef = useRef(null);

  const dispatch = (action) => dispatchBase(action);

  useEffect(() => {
    AsyncStorage.getItem(storageKey).then((raw) => {
      if (raw) {
        try { dispatchBase({ type: 'LOAD', payload: JSON.parse(raw) }); } catch (_) {}
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    AsyncStorage.setItem(storageKey, JSON.stringify(character));
    if (userIdRef.current && sheetId) {
      syncOnChange(sheetId, character, userIdRef.current);
    }
  }, [character, storageKey, sheetId]);

  return (
    <CharacterContext.Provider value={{ character, dispatch, userIdRef }}>
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacter() {
  const ctx = useContext(CharacterContext);
  if (!ctx) throw new Error('useCharacter must be inside CharacterProvider');
  return ctx;
}
