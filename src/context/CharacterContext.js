import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_CHARACTER } from '../data/initialCharacter';

const STORAGE_KEY = '@fichadigital_character';

const CharacterContext = createContext(null);

function clamp(value, min = 0, max = Infinity) {
  return Math.max(min, Math.min(max, value));
}

function reducer(state, action) {
  switch (action.type) {

    case 'LOAD':
      return action.payload;

    case 'SET_NAME':
      return { ...state, name: action.value };

    case 'SET_RACIAL_TRAITS':
      return { ...state, racialTraits: action.value };

    // action: { statusKey, field: 'current'|'max', delta }
    case 'CHANGE_STATUS': {
      const s = state.status[action.statusKey];
      const updated = {
        ...s,
        [action.field]: clamp(
          s[action.field] + action.delta,
          0,
          action.field === 'current' ? s.max : 999
        ),
      };
      // Ensure current never exceeds max
      if (action.field === 'max' && updated.current > updated.max) {
        updated.current = updated.max;
      }
      return {
        ...state,
        status: { ...state.status, [action.statusKey]: updated },
      };
    }

    // action: { statusKey, field, value }
    case 'SET_STATUS': {
      const s = state.status[action.statusKey];
      const val = clamp(Number(action.value) || 0, 0, 999);
      const updated = { ...s, [action.field]: val };
      if (updated.current > updated.max) updated.current = updated.max;
      return {
        ...state,
        status: { ...state.status, [action.statusKey]: updated },
      };
    }

    // action: { group, subAttr, delta }
    case 'CHANGE_ATTRIBUTE': {
      const group = state.attributes[action.group];
      const newVal = clamp((group[action.subAttr] || 0) + action.delta, 1, 10);
      return {
        ...state,
        attributes: {
          ...state.attributes,
          [action.group]: { ...group, [action.subAttr]: newVal },
        },
      };
    }

    // action: { skill, delta }
    case 'CHANGE_SKILL': {
      const newVal = clamp((state.skills[action.skill] || 0) + action.delta, 0, 5);
      return {
        ...state,
        skills: { ...state.skills, [action.skill]: newVal },
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

  // Load from storage on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          dispatch({ type: 'LOAD', payload: JSON.parse(raw) });
        } catch (_) {}
      }
    });
  }, []);

  // Persist on every change
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
