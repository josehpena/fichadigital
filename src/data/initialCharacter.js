// ─── Fórmulas de teto ────────────────────────────────────────────────────────
export function computeMaxValues(attrs) {
  const r   = attrs.robustez;
  const rep = attrs.reputacao;
  const c   = attrs.concentracao;
  return {
    vida:           r.forca + r.destreza + r.vigor + 10,
    energia:        (r.vigor + c.percepcao) * 2,
    forcaDeVontade: r.forca + rep.carisma,
    mana:           c.inteligencia + rep.etiqueta,
  };
}

// ─── Atributos iniciais ───────────────────────────────────────────────────────
const INITIAL_ATTRIBUTES = {
  robustez:    { forca: 1, destreza: 1, vigor: 1 },
  reputacao:   { manha: 1, carisma: 1, etiqueta: 1 },
  concentracao:{ percepcao: 1, raciocinio: 1, inteligencia: 1 },
};

const initMax = computeMaxValues(INITIAL_ATTRIBUTES);

// ─── Equipamentos iniciais ────────────────────────────────────────────────────
const emptyArmorSlot = () => ({
  nome: '', armadura: 0, resMagica: 0, reputacao: 0, efeitos: '',
  durabilidade: 10, durabilidadeMax: 10, nivel: 1, tiras: [],
});
const basicArmorSlot = (nome) => ({
  nome, armadura: 5, resMagica: 0, reputacao: 0, efeitos: '',
  durabilidade: 10, durabilidadeMax: 10, nivel: 1, tiras: [],
});
const emptyHandSlot = () => ({ tipo: '', tipo2: '', nome: '', dano: '', efeitos: '', nivel: 1, tiras: [], durabilidade: 10, durabilidadeMax: 10 });
const emptyAccessory = () => ({ nome: '', armadura: 0, resMagica: 0, reputacao: 0, efeitos: '', tiras: [] });

// ─── Personagem inicial ───────────────────────────────────────────────────────
export const INITIAL_CHARACTER = {
  name: 'Personagem',
  racialTraits: '',

  status: {
    vida:           { current: initMax.vida,           max: initMax.vida           },
    energia:        { current: initMax.energia,        max: initMax.energia        },
    mana:           { current: initMax.mana,           max: initMax.mana           },
    forcaDeVontade: { current: initMax.forcaDeVontade, max: initMax.forcaDeVontade },
    humanidade:     { current: 10, max: 10  },
    xp:             { current: 0,  max: 20000 },
  },

  attributes: INITIAL_ATTRIBUTES,

  skills: {
    // Físicos
    reflexo:       0,
    esportes:      0,
    briga:         0,
    piloteiro:     0,
    armasBrancas:  0,
    armasRange:    0,
    // Sociais
    empatia:       0,
    instinto:      0,
    oficios:       0,
    linguistica:   0,
    ocultacao:     0,
    expressao:     0,
    // Mentais
    analise:       0,
    clarividencia: 0,
    investigacao:  0,
    cultura:       0,
    ciencias:      0,
    magia:         0,
  },

  equipment: {
    peiteira:    basicArmorSlot('Peiteira Simples'),
    ombreira:    basicArmorSlot('Ombreira Simples'),
    luvas:       basicArmorSlot('Luvas Simples'),
    calcas:      basicArmorSlot('Calças Simples'),
    botas:       basicArmorSlot('Botas Simples'),
    maoDireita:  emptyHandSlot(),
    maoEsquerda: emptyHandSlot(),
  },

  accessories: Array.from({ length: 11 }, emptyAccessory),

  narrativeEffects: [],
  // [{ nome: string, linhas: [{ tipo: 'status', statusKey, delta } | { tipo: 'texto', texto }] }]

  skillTree: {
    trailCount: 0,
    acquiredTrails: {},
    // acquiredTrails format: { trailId: { cost: number, skills: { skillId: level } } }
    customCosts: {},
    // customCosts format: { trailId: number } — custo XP/nível personalizado antes de adquirir
  },

  titles: {
    acquired: [],       // [titleId, ...]
    statusBonuses: {},  // { vida: 10, ... } — soma dos efeitos dos títulos adquiridos
    skillBonuses: [],   // [{ status, skill }] — bônus de max que escalam com valor de perícia
    attrBonuses: [],    // [{ status, group, subAttr, threshold, delta }] — bônus condicionais por atributo
    bindings: {},       // { titleId: [{trailId, skillId, nome}] } — habilidades vinculadas
  },

  inventory: {
    bolsa: {
      capacidade: 6,
      itens: Array.from({ length: 40 }, () => ({ nome: '', obs: '' })),
    },
    moedas: 0,
    cinto: {
      ativo: false,
      itens: Array.from({ length: 10 }, () => ({ nome: '', obs: '' })),
    },
    storages: [], // armazenamentos customizados: [{ id, nome, icone, capacidade, itens }]
  },

  settings: {
    statusOrder: ['vida', 'energia', 'mana', 'forcaDeVontade', 'humanidade', 'xp'],
    xpCosts: {
      robustez:    10,
      reputacao:   10,
      concentracao:10,
      Físicos:     5,
      Sociais:     5,
      Mentais:     5,
    },
  },
};

// ─── Categorias e labels ──────────────────────────────────────────────────────
export const SKILL_CATEGORIES = {
  Físicos:  ['reflexo', 'esportes', 'briga', 'piloteiro', 'armasBrancas', 'armasRange'],
  Sociais:  ['empatia', 'instinto', 'oficios', 'linguistica', 'ocultacao', 'expressao'],
  Mentais:  ['analise', 'clarividencia', 'investigacao', 'cultura', 'ciencias', 'magia'],
};

export const SKILL_LABELS = {
  reflexo:       'Reflexo',
  esportes:      'Esportes',
  briga:         'Briga',
  piloteiro:     'Piloteiro',
  armasBrancas:  'Armas Brancas',
  armasRange:    'Armas Range',
  empatia:       'Empatia',
  instinto:      'Instinto',
  oficios:       'Ofícios',
  linguistica:   'Linguística',
  ocultacao:     'Ocultação',
  expressao:     'Expressão',
  analise:       'Análise',
  clarividencia: 'Clarividência',
  investigacao:  'Investigação',
  cultura:       'Cultura',
  ciencias:      'Ciências',
  magia:         'Magia',
};

export const ATTRIBUTE_LABELS = {
  robustez:     'Robustez',
  reputacao:    'Reputação',
  concentracao: 'Concentração',
  forca:        'Força',
  destreza:     'Destreza',
  vigor:        'Vigor',
  manha:        'Manha',
  carisma:      'Carisma',
  etiqueta:     'Etiqueta',
  percepcao:    'Percepção',
  raciocinio:   'Raciocínio',
  inteligencia: 'Inteligência',
};

export const STATUS_LABELS = {
  vida:           'Vida',
  energia:        'Energia',
  mana:           'Mana',
  forcaDeVontade: 'Força de Vontade',
  humanidade:     'Humanidade',
  xp:             'XP',
};

export const STATUS_COLORS = {
  vida:           '#f38ba8',
  energia:        '#fab387',
  mana:           '#89b4fa',
  forcaDeVontade: '#cba6f7',
  humanidade:     '#a6e3a1',
  xp:             '#94e2d5',
};

export const ARMOR_SLOTS  = ['peiteira', 'ombreira', 'luvas', 'calcas', 'botas'];
export const HAND_SLOTS   = ['maoDireita', 'maoEsquerda'];
export const EQUIP_LABELS = {
  peiteira:    'Peiteira',
  ombreira:    'Ombreira',
  luvas:       'Luvas',
  calcas:      'Calças',
  botas:       'Botas',
  maoDireita:  'Mão Direita',
  maoEsquerda: 'Mão Esquerda',
};

// Statuses cujo max é calculado automaticamente
export const COMPUTED_STATUS_KEYS = ['vida', 'energia', 'mana', 'forcaDeVontade'];
export const NO_MAX_STATUS_KEYS   = ['xp'];

// Custo total de XP para subir do nível `from` até o nível `to`
// Cada nível intermediário custa: novoNível × costPerLevel
export function xpCostForRange(fromLevel, toLevel, costPerLevel) {
  let total = 0;
  for (let lvl = fromLevel + 1; lvl <= toLevel; lvl++) {
    total += lvl * costPerLevel;
  }
  return total;
}

// Cálculo dos totais de defesa (apenas peças com durabilidade > 0)
export function computeDefenseTotals(equipment, accessories) {
  const armorBase = ARMOR_SLOTS.reduce((s, k) => {
    const e = equipment[k];
    return e.durabilidade > 0
      ? { a: s.a + e.armadura, m: s.m + e.resMagica, r: s.r + (e.reputacao || 0) }
      : s;
  }, { a: 0, m: 0, r: 0 });
  const accBonus = accessories.reduce(
    (s, a) => ({ a: s.a + (a.armadura || 0), m: s.m + (a.resMagica || 0), r: s.r + (a.reputacao || 0) }),
    { a: 0, m: 0, r: 0 }
  );
  return {
    totalArmadura:  armorBase.a + accBonus.a,
    totalResMagica: armorBase.m + accBonus.m,
    totalReputacao: armorBase.r + accBonus.r,
  };
}
