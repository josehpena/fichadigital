export const INITIAL_CHARACTER = {
  name: 'Personagem',
  race: '',
  racialTraits: '',

  // --- Status (valor atual / máximo) ---
  status: {
    vida:           { current: 10, max: 10 },
    energia:        { current: 10, max: 10 },
    mana:           { current: 10, max: 10 },
    forcaDeVontade: { current: 10, max: 10 },
    humanidade:     { current: 10, max: 10 },
    xp:             { current: 0,  max: 100 },
  },

  // --- Atributos ---
  // Cada grupo soma automaticamente seus sub-atributos
  attributes: {
    robustez: {
      forca:    1,
      destreza: 1,
      vigor:    1,
    },
    reputacao: {
      carisma:     1,
      manipulacao: 1,
      aparencia:   1,
    },
    concentracao: {
      percepcao:    1,
      inteligencia: 1,
      raciocinio:   1,
    },
  },

  // --- Perícias (0-5 pontos cada) ---
  skills: {
    // Físicos
    atletismo:       0,
    briga:           0,
    armasBrancas:    0,
    armasDeArremesso:0,
    furtividade:     0,
    conducao:        0,
    sobrevivencia:   0,

    // Sociais
    empatia:         0,
    intimidacao:     0,
    persuasao:       0,
    lideranca:       0,
    performance:     0,
    seducao:         0,
    subterfugio:     0,

    // Mentais
    investigacao:    0,
    medicina:        0,
    ocultismo:       0,
    tecnologia:      0,
    ciencias:        0,
    prontidao:       0,
    financas:        0,
  },
};

export const SKILL_CATEGORIES = {
  Físicos: [
    'atletismo',
    'briga',
    'armasBrancas',
    'armasDeArremesso',
    'furtividade',
    'conducao',
    'sobrevivencia',
  ],
  Sociais: [
    'empatia',
    'intimidacao',
    'persuasao',
    'lideranca',
    'performance',
    'seducao',
    'subterfugio',
  ],
  Mentais: [
    'investigacao',
    'medicina',
    'ocultismo',
    'tecnologia',
    'ciencias',
    'prontidao',
    'financas',
  ],
};

export const SKILL_LABELS = {
  atletismo:        'Atletismo',
  briga:            'Briga',
  armasBrancas:     'Armas Brancas',
  armasDeArremesso: 'Armas de Arremesso',
  furtividade:      'Furtividade',
  conducao:         'Condução',
  sobrevivencia:    'Sobrevivência',
  empatia:          'Empatia',
  intimidacao:      'Intimidação',
  persuasao:        'Persuasão',
  lideranca:        'Liderança',
  performance:      'Performance',
  seducao:          'Sedução',
  subterfugio:      'Subterfúgio',
  investigacao:     'Investigação',
  medicina:         'Medicina',
  ocultismo:        'Ocultismo',
  tecnologia:       'Tecnologia',
  ciencias:         'Ciências',
  prontidao:        'Prontidão',
  financas:         'Finanças',
};

export const ATTRIBUTE_LABELS = {
  robustez:     'Robustez',
  reputacao:    'Reputação',
  concentracao: 'Concentração',
  forca:        'Força',
  destreza:     'Destreza',
  vigor:        'Vigor',
  carisma:      'Carisma',
  manipulacao:  'Manipulação',
  aparencia:    'Aparência',
  percepcao:    'Percepção',
  inteligencia: 'Inteligência',
  raciocinio:   'Raciocínio',
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
  vida:           '#e74c3c',
  energia:        '#f39c12',
  mana:           '#3498db',
  forcaDeVontade: '#9b59b6',
  humanidade:     '#2ecc71',
  xp:             '#1abc9c',
};
