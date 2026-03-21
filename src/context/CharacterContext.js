import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  INITIAL_CHARACTER,
  COMPUTED_STATUS_KEYS,
  computeMaxValues,
  SKILL_CATEGORIES,
  xpCostForRange,
} from '../data/initialCharacter';
import { findTrail } from '../data/trailsData';

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

// Recalcula os tetos de status e clipa os valores atuais
function applyComputedMaxes(status, attrs) {
  const newMax = computeMaxValues(attrs);
  const updated = { ...status };
  COMPUTED_STATUS_KEYS.forEach((key) => {
    const s = status[key];
    const max = newMax[key];
    updated[key] = { ...s, max, current: Math.min(s.current, max) };
  });
  return updated;
}

function reducer(state, action) {
  switch (action.type) {

    case 'LOAD': {
      const p = action.payload;
      if (!p.attributes?.reputacao?.manha) return INITIAL_CHARACTER;
      const status = applyComputedMaxes(p.status, p.attributes);
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
        equipment:   p.equipment   ?? INITIAL_CHARACTER.equipment,
        accessories: p.accessories ?? INITIAL_CHARACTER.accessories,
        skillTree:   p.skillTree   ?? INITIAL_CHARACTER.skillTree,
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
      const newStatus = applyComputedMaxes(state.status, newAttrs);

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

      if (newVal > curVal) {
        const cat    = getSkillCategory(action.skill);
        const xpCost = state.settings.xpCosts[cat] ?? 5;
        const cost   = xpCostForRange(curVal, newVal, xpCost);
        if (state.status.xp.current < cost) return state; // XP insuficiente
        const newXp  = { ...state.status.xp, current: state.status.xp.current - cost };
        return { ...state, skills: { ...state.skills, [action.skill]: newVal }, status: { ...state.status, xp: newXp } };
      }

      return { ...state, skills: { ...state.skills, [action.skill]: newVal } };
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
        const nextCost = 40 + state.skillTree.trailCount * 20;
        trailData = { cost: nextCost, skills: {} };
        newSkillTree = {
          trailCount: state.skillTree.trailCount + 1,
          acquiredTrails: {
            ...state.skillTree.acquiredTrails,
            [action.trailId]: trailData,
          },
        };
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

    case 'RESET':
      return INITIAL_CHARACTER;

    default:
      return state;
  }
}

export function CharacterProvider({ children }) {
  const [character, dispatch] = useReducer(reducer, INITIAL_CHARACTER);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try { dispatch({ type: 'LOAD', payload: JSON.parse(raw) }); } catch (_) {}
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(character));
  }, [character]);

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
