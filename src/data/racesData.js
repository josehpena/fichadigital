// ─── Raças e Subraças ─────────────────────────────────────────────────────────
// Cada subraça pode ter:
//   skillBoost?:     { categorias: ['Físicos'|'Sociais'|'Mentais'] }
//   startingMagic?:  { quantidade, nivel } — jogador escolhe a trilha + N magias
//   statusBonuses?:  [{ status, delta }] — bônus mecânico aplicado ao adquirir
//   caracteristicas: [{ texto, condicao? }] — bullets em Características.
//     condicao detectável pelo sistema:
//       'vida_completa' → vida.current === vida.max
//       'tem_armadura'  → tem ao menos 1 peça de armadura com durabilidade > 0

import { ARMOR_SLOTS } from './initialCharacter';

export const RACES = [
  {
    id: 'humanos',
    nome: 'Humanos',
    intro: 'Criaturas com maior presença dentro de todo o universo. Praticamente em todas as cidades existirão humanos. Seja como líderes ou como escravos eles são certamente a raça conhecida por todos os demais.\n\nComparado a outras criaturas suas habilidades costumam ser neutras, porém sua capacidade de se integrar é fortemente conhecida, isso se deve ao fato de se adaptarem facilmente com a cultura e linguística de outras raças e povos.',
    subracas: [
      {
        id: 'wanderstein',
        nome: 'Wanderstein',
        elements: '40% Trovão · 30% Luz · 15% Aurora · 5% qualquer outro',
        background: 'Quando se deparar com um humano de corpo esbelto, loiro e que provavelmente conduz a prática de magias e proteção, estará diante de um Wanderstein. Cidades com templos os tem guiado por milênios. Eles são um povo antigo e que adora um bom mistério com histórias que se perdem na noite dos tempos. Conhecidos por sua habilidade com a magia, riqueza e nobreza faz com que a grande parte de seus membros tenha a aparência e mentais elevados.',
        skillBoost: { categorias: ['Mentais', 'Sociais'] },
        startingMagic: { quantidade: 3, nivel: 1 },
        caracteristicas: [
          { texto: 'Pode adicionar Cultura em qualquer confronto de teste social' },
        ],
      },
      {
        id: 'maera',
        nome: 'Maera',
        elements: '30% Água · 30% Terra · 15% Vento · 10% Metal · 10% Gelo · 5% qualquer outro',
        background: 'Dizem que o primeiro Maera foi um mago que se refugiou em uma ilha solitária que, com o passar dos anos, foi povoada originando a cultura que hoje conhecemos. Caelin é uma grande ilha rochosa que agrega muito conhecimento de seu povo recluso e acolhedor.',
        skillBoost: { categorias: ['Físicos', 'Sociais', 'Mentais'] },
        caracteristicas: [
          { texto: 'Encantamentos em seus equipamentos não são interrompidos por colisão entre encantamentos' },
          { texto: 'Análise pode ser adicionada em testes de Ofícios' },
        ],
      },
      {
        id: 'azunam',
        nome: 'Azunam',
        elements: '60% Fogo/Água/Terra · 20% Lava · 15% Metal · 5% qualquer outro',
        background: 'RANKAI é um dos maiores territórios de MIDAHRIA. Planícies férteis próximas a um grande vulcão, florestas místicas ao sul, desertos rodeados por montanhas mortas. Tradicionalmente são uma família abençoada com pelo menos 3 das 8 trilhas de magias, usadas para fortalecer suas armas, armaduras e para lançar feitiços em batalha.',
        skillBoost: { categorias: ['Sociais', 'Mentais'] },
        caracteristicas: [
          { texto: 'Podem pagar metade do custo em EXP para adquirir MAESTRIAS de profissões' },
          { texto: 'Se a sua primeira e segunda MAESTRIA for de magia, os custos serão de primeira maestria' },
        ],
      },
      {
        id: 'salumare',
        nome: 'Salumare',
        elements: '30% Vento · 30% Terra · 15% Areia · 10% Madeira · 10% Metal · 5% qualquer outro',
        background: 'Um povo nômade que vive dentre as montanhas de um deserto gigantesco de areia dourada. São fortes e resilientes, acostumados a lidarem com as adversidades do clima e da escassez de recursos. Orgulhosos e independentes, os Salumare valorizam a liberdade e a família.',
        skillBoost: { categorias: ['Físicos', 'Sociais', 'Mentais'] },
        caracteristicas: [
          { texto: 'Podem ficar até 1 dia sem se alimentar, não precisam realizar testes de auto controle para comer coisas estranhas; se alimentar recupera o dobro do que normalmente recuperaria' },
          { texto: 'Cartografia pode ser adicionada em testes de Investigação' },
        ],
      },
      {
        id: 'farenheit',
        nome: 'Farenheit',
        elements: '60% Vento/Água/Terra · 20% Areia · 10% Metal · 5% Madeira · 5% qualquer outro',
        background: 'Nascer um Farenheit é nascer com a lâmina e o estandarte em suas mãos. A maior família militar que, junto com os Alabastre, governam sem restrições o império de NAMUR. São conhecidos por sua eximia capacidade física e militar, sua devoção a ordem, harmonia e vida.',
        skillBoost: { categorias: ['Físicos', 'Sociais', 'Mentais'] },
        caracteristicas: [
          { texto: 'Enquanto com a vida completa, não sofrem envenenamento ou sangramento daquele golpe', condicao: 'vida_completa' },
          { texto: 'Enquanto estiver equipado, sua Robustez é somada em armadura', condicao: 'tem_armadura' },
        ],
      },
      {
        id: 'shikigame',
        nome: 'Shikigame',
        elements: '60% Vento/Trovão · 10% Cristal · 10% Luz · 5% qualquer outro',
        background: 'Forçados a abandonar sua terra natal por causa de guerras e conflitos, desenvolveram uma cultura guerreira como forma de sobreviver baseada em uma rica diversidade de criaturas mitológicas. Em poucos séculos esse pequeno povoado que buscou abrigo dentre ilhas do arquipélago sul, tornou-se um Império.',
        skillBoost: { categorias: ['Físicos'] },
        caracteristicas: [
          { texto: 'Em testes de iniciativa pode adicionalmente considerar a perícia Instinto. Pode realizar uma ação adicional "Self" física em uma cena (tomar uma poção, trocar uma arma, apanhar um item na bag, esconder algo)' },
          { texto: 'A dedicação dos Shikigames os permite continuar seus treinos de MAESTRIA sozinhos desde que tenham obtido pelo menos 1 sucesso de treino observando o uso de uma MAESTRIA fora de condição de combate' },
        ],
      },
      {
        id: 'alabastre',
        nome: 'Alabastre',
        elements: '15% Água · 15% Terra · 15% Vento · 15% Fogo · 15% Trovão · 20% Luz · 5% qualquer outro',
        background: 'Sobre o trono de ouro, eu governo toda região de Endoras. Ao centro, Namur é nossa casa, os Farenheit nossos irmãos e os demais súditos que devem ser protegidos. Apesar de segurar lanças e escudos, preferem organizar as nações, priorizar os recursos e planejar seu sucesso.',
        skillBoost: { categorias: ['Físicos', 'Sociais', 'Mentais'] },
        caracteristicas: [
          { texto: 'A beleza cativante e sua ancestralidade impõem uma presença que impede oponentes de usar habilidades sociais contra o mesmo a não ser que paguem 2 de força de vontade' },
          { texto: 'Sucesso em teste social recupera 1 força de vontade' },
        ],
      },
    ],
  },
  {
    id: 'elf',
    nome: 'Elf',
    intro: 'Sábios, milenares, astutos, habilidosos. Sua singularidade é notável por todas as regiões e, por isso mesmo, foram tão temidos e subjugados. Hoje existem poucos locais onde os elfos podem ser encontrados de forma livre. Na grande maioria dos reinos são tidos como escravos, lacaios ou fugitivos. Escolher um elfo como personagem é sem dúvidas um desafio social — porém, conseguem adquirir acesso as trilhas mágicas e sabedoria ancestral com maior facilidade do que qualquer outra criatura.',
    subracas: [
      {
        id: 'elfos_da_lua',
        nome: 'Elfos da Lua',
        elements: '35% Água · 20% Madeira · 20% Metal · 20% Aurora · 5% qualquer outro',
        background: 'Banidos das Ilhas Falmari quando a supremacia dos Elfos do Sol reinou sob o conselho, esses elfos cultuam o místico e a magia rejeitada. Próximos da natureza e longe da moral convencional, esses elfos transcendem a razão e trazem uma nova perspectiva sobre a existência e o todo.',
        statusBonuses: [{ status: 'mana', delta: 5 }],
        caracteristicas: [
          { texto: 'Enquanto exposto à Lua, pode se esforçar para somar INSTINTO em qualquer teste ao custo de 2 força de vontade' },
          { texto: 'Se por algum instante fugir da visão (percepção em geral) de um ou mais alvos, fica instantaneamente furtivo e tem 5 sucessos de vantagem para ser percebido ou para se manter furtivo durante a cena' },
        ],
      },
      {
        id: 'elfos_do_sol',
        nome: 'Elfos do Sol',
        elements: '60% Fogo · 35% Lava · 5% qualquer outro',
        background: 'O orgulho dos elfos em um só lugar. Adeptos ao pé da letra no que se refere a costumes, cultura e legado da raça. Militares exemplares.',
        statusBonuses: [{ status: 'energia', delta: 5 }],
        caracteristicas: [
          { texto: 'Enquanto exposto à luz do Sol, pode se esforçar para somar INSTINTO em qualquer teste ao custo de 2 força de vontade' },
          { texto: 'Enquanto exposto à luz do Sol, não sofre efeitos de magias MENTAIS e ESPECTRAIS a não ser que deseje. Ainda tem 1 grau de vantagem em testes sociais' },
        ],
      },
      {
        id: 'elfos_da_floresta',
        nome: 'Elfos da Floresta',
        elements: '35% Trovão · 20% Água · 20% Fogo · 20% Metal · 5% qualquer outro',
        background: 'Já foram por muito tempo os elfos em maior número no conselho de Falmari. Isso os proporcionou desenvolvimento de uma sociedade forte dentre os elfos desenvolvendo-os além da magia e cultura tradicional para também áreas de profissões e refinamento.',
        statusBonuses: [
          { status: 'mana', delta: 3 },
          { status: 'energia', delta: 3 },
          { status: 'forcaDeVontade', delta: 3 },
        ],
        caracteristicas: [
          { texto: 'Enquanto em terreno de densa floresta ou em contato com a madeira, pode somar INSTINTO em qualquer teste ao custo de 2 de força de vontade' },
          { texto: 'Coletor nato — não precisa de ferramentas ou teste para coletar. Sentidos dobrados podendo adicionar CULTURA em qualquer teste que envolva utilizar algum dos 5 sentidos' },
        ],
      },
      {
        id: 'elfos_de_prata',
        nome: 'Elfos de Prata',
        elements: '35% Trovão · 20% Água · 20% Fogo · 20% Metal · 5% qualquer outro',
        background: 'Já foram por muito tempo os elfos em maior número no conselho de Falmari. Isso os proporcionou desenvolvimento de uma sociedade forte dentre os elfos desenvolvendo-os além da magia e cultura tradicional para também áreas de profissões e refinamento.',
        statusBonuses: [{ status: 'forcaDeVontade', delta: 5 }],
        caracteristicas: [
          { texto: 'Enquanto exposto à prata, pode se esforçar para somar INSTINTO em qualquer teste ao custo de 2 força de vontade' },
          { texto: 'Todo item feito por um elfo de prata é um item melhorado, está 1 nível acima dos ingredientes utilizados' },
        ],
      },
    ],
  },
];

// Mapa rápido por id
export const SUBRACE_BY_ID = {};
export const RACE_BY_ID = {};
for (const race of RACES) {
  RACE_BY_ID[race.id] = race;
  for (const sub of race.subracas) {
    SUBRACE_BY_ID[sub.id] = { ...sub, raceId: race.id, raceNome: race.nome };
  }
}

// Determina se uma condição está ativa dado o estado do character.
// Retorna:
//   true  → condição ativa (renderizar destacada)
//   false → condição inativa
//   null  → condição não detectável (narrativa) → renderizar normal sem destaque
export function isConditionActive(condicao, character) {
  if (!condicao) return null;
  if (condicao === 'vida_completa') {
    const v = character?.status?.vida;
    return !!v && v.current === v.max && v.max > 0;
  }
  if (condicao === 'tem_armadura') {
    return ARMOR_SLOTS.some(k => (character?.equipment?.[k]?.durabilidade ?? 0) > 0);
  }
  return null;
}

// Bônus de armadura derivado da raça (ex.: Farenheit soma Robustez enquanto equipado).
// Retorna { val, label } ou null.
export function computeRaceArmorBonus(character) {
  if (character?.race?.subraceId !== 'farenheit') return null;
  if (!isConditionActive('tem_armadura', character)) return null;
  const r = character?.attributes?.robustez ?? {};
  const val = (r.forca ?? 0) + (r.destreza ?? 0) + (r.vigor ?? 0);
  return val > 0 ? { val, label: 'Robustez (Farenheit)' } : null;
}
