import React, { createContext, useContext, useReducer, useEffect } from 'react';
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

// Computa bônus numéricos de status dos efeitos narrativos
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

// Bônus de max que escalam com o valor atual de uma perícia
function computeTitleSkillBonuses(skillBonuses = [], skills = {}) {
  const result = {};
  for (const { status, skill } of skillBonuses) {
    result[status] = (result[status] || 0) + (skills[skill] || 0);
  }
  return result;
}

// Mescla bônus de títulos, narrativos e skill-based
function totalStatusBonuses(titleBonuses = {}, narrativeEffects = [], skillBonuses = [], skills = {}) {
  const narrative = computeNarrativeBonuses(narrativeEffects);
  const skillDelta = computeTitleSkillBonuses(skillBonuses, skills);
  const merged = { ...titleBonuses };
  for (const [k, v] of Object.entries(narrative)) {
    merged[k] = (merged[k] || 0) + v;
  }
  for (const [k, v] of Object.entries(skillDelta)) {
    merged[k] = (merged[k] || 0) + v;
  }
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
      if (!p.attributes?.reputacao?.manha) return INITIAL_CHARACTER;
      const status = applyComputedMaxes(
        p.status, p.attributes,
        totalStatusBonuses(p.titles?.statusBonuses ?? {}, p.narrativeEffects ?? [], p.titles?.skillBonuses ?? [], p.skills ?? {})
      );
      // Mescla settings: preserva customizações salvas, garante campos novos
      const savedSettings = p.settings ?? {};
      const settings = {
        ...INITIAL_CHARACTER.settings,
        ...savedSettings,
        xpCosts: { ...INITIAL_CHARACTER.settings.xpCosts, ...(savedSettings.xpCosts ?? {}) },
        statusOrder: savedSettings.statusOrder ?? INITIAL_CHARACTER.settings.statusOrder,
      };
      return {
        ...INITIAL_CHARACTER,
        ...p,
        status,
        equipment:        p.equipment        ?? INITIAL_CHARACTER.equipment,
        accessories:      p.accessories      ?? INITIAL_CHARACTER.accessories,
        skillTree:        p.skillTree        ?? INITIAL_CHARACTER.skillTree,
        titles:           p.titles           ?? INITIAL_CHARACTER.titles,
        inventory:        p.inventory        ?? INITIAL_CHARACTER.inventory,
        narrativeEffects: p.narrativeEffects ?? INITIAL_CHARACTER.narrativeEffects,
        settings,
      };
    }

    case 'SET_NAME':
      return { ...state, name: action.value };

    case 'SET_RACIAL_TRAITS':
      return { ...state, racialTraits: action.value };

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
      const newVal   = clamp(curVal + action.delta, 1, 10);
      const newAttrs = {
        ...state.attributes,
        [action.group]: { ...group, [action.subAttr]: newVal },
      };
      const newStatus = applyComputedMaxes(
        state.status, newAttrs,
        totalStatusBonuses(state.titles?.statusBonuses ?? {}, state.narrativeEffects ?? [], state.titles?.skillBonuses ?? [], state.skills ?? {})
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
      const newVal = clamp(curVal + action.delta, 0, 5);
      const newSkills = { ...state.skills, [action.skill]: newVal };

      // Se algum título escala com esta perícia, recalcula tetos de status
      const skillBonuses = state.titles?.skillBonuses ?? [];
      const affectsMax = skillBonuses.some(b => b.skill === action.skill);
      const newStatus = affectsMax
        ? applyComputedMaxes(state.status, state.attributes,
            totalStatusBonuses(state.titles?.statusBonuses ?? {}, state.narrativeEffects ?? [], skillBonuses, newSkills))
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
      return {
        ...state,
        equipment: {
          ...state.equipment,
          [action.slot]: { ...slot, tiras: [...(slot.tiras ?? []), action.tira] },
        },
      };
    }

    // { slot, index }  — remove tira de couro do slot
    case 'REMOVE_EQUIP_TIRA': {
      const slot = state.equipment[action.slot];
      const tiras = (slot.tiras ?? []).filter((_, i) => i !== action.index);
      return {
        ...state,
        equipment: { ...state.equipment, [action.slot]: { ...slot, tiras } },
      };
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
      const acc = accessories[action.index];
      accessories[action.index] = { ...acc, tiras: [...(acc.tiras ?? []), action.tira] };
      return { ...state, accessories };
    }

    // { index, tiraIndex }  — remove tira de um acessório
    case 'REMOVE_ACC_TIRA': {
      const accessories = [...state.accessories];
      const acc = accessories[action.index];
      accessories[action.index] = { ...acc, tiras: (acc.tiras ?? []).filter((_, i) => i !== action.tiraIndex) };
      return { ...state, accessories };
    }

    // ── Efeitos Narrativos ───────────────────────────────────────────────────

    // { effect: { nome, linhas: [{tipo:'status',statusKey,delta}|{tipo:'texto',texto}] } }
    case 'ADD_NARRATIVE_EFFECT': {
      const newEffects = [...(state.narrativeEffects ?? []), action.effect];
      let newStatus = applyComputedMaxes(
        state.status, state.attributes,
        totalStatusBonuses(state.titles?.statusBonuses ?? {}, newEffects, state.titles?.skillBonuses ?? [], state.skills ?? {})
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
        totalStatusBonuses(state.titles?.statusBonuses ?? {}, newEffects, state.titles?.skillBonuses ?? [], state.skills ?? {})
      );
      return { ...state, narrativeEffects: newEffects, status: newStatus };
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
      const nextCost = 40 + state.skillTree.trailCount * 20;
      if (state.status.xp.current < nextCost) return state;
      const newXp = { ...state.status.xp, current: state.status.xp.current - nextCost };
      return {
        ...state,
        status: { ...state.status, xp: newXp },
        skillTree: {
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

        trailData = { cost: nextCost, skills: {} };
        newSkillTree = {
          trailCount: state.skillTree.trailCount + 1,
          acquiredTrails: {
            ...state.skillTree.acquiredTrails,
            [action.trailId]: trailData,
          },
        };

        // Adquire todas as outras trilhas da mesma categoria no mesmo custo
        if (trail.categoria) {
          const catTrails = findCategoryTrails(trail.categoria);
          for (const catTrail of catTrails) {
            if (catTrail.id !== action.trailId && !newSkillTree.acquiredTrails[catTrail.id]) {
              newSkillTree = {
                trailCount: newSkillTree.trailCount + 1,
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

      // Acumula skill-based bonuses do título
      const newSkillBonuses = [...(state.titles?.skillBonuses ?? []), ...(title.skillEfeitos ?? [])];

      let newStatus = applyComputedMaxes(
        state.status, state.attributes,
        totalStatusBonuses(newBonuses, state.narrativeEffects ?? [], newSkillBonuses, state.skills ?? {})
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
          bindings: newBindings,
        },
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

    // { nome, icone, capacidade }
    case 'INVENTORY_ADD_STORAGE': {
      const id = `storage_${Date.now()}`;
      const cap = action.capacidade ?? 6;
      const newStorage = {
        id,
        nome: action.nome ?? 'Armazenamento',
        icone: action.icone ?? '📦',
        capacidade: cap,
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

    case 'INVENTORY_TOGGLE_CINTO': {
      const { cinto } = state.inventory;
      return { ...state, inventory: { ...state.inventory, cinto: { ...cinto, ativo: !cinto.ativo } } };
    }

    // { delta }
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
  const [character, dispatch] = useReducer(reducer, INITIAL_CHARACTER);

  useEffect(() => {
    AsyncStorage.getItem(storageKey).then((raw) => {
      if (raw) {
        try { dispatch({ type: 'LOAD', payload: JSON.parse(raw) }); } catch (_) {}
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    AsyncStorage.setItem(storageKey, JSON.stringify(character));
  }, [character, storageKey]);

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
