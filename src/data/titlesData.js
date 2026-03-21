// ── Raw categories data ────────────────────────────────────────────────────────
const CATEGORIAS_RAW = [
  {
    categoria: 'MILITAR',
    subcategorias: [
      {
        subcategoria: 'MÁGICA',
        descricao: 'Títulos voltados para conjuração, magias, mana e habilidades místicas',
        titulos: [
          { id: 'aprendiz_de_conjurador', nome: 'Aprendiz de Conjurador', ordem: 1,
            beneficios: ['4 de bônus em testes de magia daquela maestria', 'Quando dormir for causar regeneração de mana, essa quantidade é dobrada'],
            requisitos: ['3 magias level 1 de uma mesma Maestria'] },
          { id: 'seguidor_da_magia', nome: 'Seguidor da Magia', ordem: 1,
            beneficios: ['4 de bônus em testes de magia daquela maestria', 'Faça um teste de conjuração. Esse resultado do teste pode ser usado no próximo teste de magia'],
            requisitos: ['3 magias level 1 de uma mesma Maestria'] },
          { id: 'conjurador_tatico', nome: 'Conjurador Tático', ordem: 1,
            beneficios: ['4 de bônus em testes de magia daquela maestria', 'Uma vez por turno, se você for o alvo de alguém, pode usar uma magia adicional em você mesmo'],
            requisitos: ['3 magias level 1 de uma mesma Maestria'] },
          { id: 'feiticeiro', nome: 'Feiticeiro', ordem: 2,
            beneficios: ['Aumenta a INTENSIDADE de suas magias em 1', 'Reduz o custo de mana das magias em 1. O custo mínimo de uma magia é 1'],
            requisitos: ['3 magias level 2 da Maestria Taumaturgia', 'Seguidor da Magia', 'Vencer um duelo na guilda'] },
          { id: 'transmutador', nome: 'Transmutador', ordem: 2,
            beneficios: ['Ativo: Aumenta o RAIO de suas magias em 1', 'Ativo: Suas magias adquirem duração extra. 1 turno sob estresse de batalha ou 1 cena sob condições normais'],
            requisitos: ['3 magias level 2 da Maestria Distorção', 'Seguidor da Magia'] },
          { id: 'moldador_do_tempo', nome: 'Moldador do Tempo', ordem: 2,
            beneficios: ['Aumenta a DURAÇÃO de suas magias. 1 turno sob estresse de batalha ou 1 cena sob condições normais', 'Ativo: Se você estiver sendo o alvo de alguma fonte, pode usar uma magia em resposta a essa fonte'],
            requisitos: ['3 magias level 2 da Maestria Temporal', 'Seguidor da Magia'] },
          { id: 'clerigo', nome: 'Clérigo', ordem: 2,
            beneficios: ['Aumenta as CURAS e REGENERAÇÕES mágicas geradas por você em 1', 'Aumenta a capacidade de mana somando sua CLARIVIDÊNCIA'],
            requisitos: ['3 magias level 2 da Maestria Divina', 'Aprendiz de Conjurador'] },
          { id: 'ilusionista', nome: 'Ilusionista', ordem: 2,
            beneficios: ['Suas magias causam DANO também à DETERMINAÇÃO dos alvos', 'Ativo: Se você estiver sendo o alvo de alguma fonte, pode usar uma magia em resposta a essa fonte'],
            requisitos: ['3 magias level 2 da Maestria Mental', 'Aprendiz de Conjurador'] },
          { id: 'mago', nome: 'Mago', ordem: 2,
            beneficios: ['Aumenta o ALCANCE de suas magias em 5 metros', 'Aumenta a capacidade de mana somando sua CLARIVIDÊNCIA'],
            requisitos: ['3 magias level 2 da Maestria Arcana', 'Aprendiz de Conjurador'] },
          { id: 'bruxo', nome: 'Bruxo', ordem: 2,
            beneficios: ['Ativo: Conjura uma magia a custo 1 de mana. Pode usar essa habilidade 1 vez ao dia', 'Ativo: Suas magias adquirem duração extra. 1 turno sob estresse de batalha ou 1 cena sob condições normais'],
            requisitos: ['3 magias level 2 da Maestria Espectral', 'Conjurador Tático'] },
          { id: 'necromante', nome: 'Necromante', ordem: 2,
            beneficios: ['O custo de VIDA para conjuração é pago somente 1 vez por turno', 'Magias iguais utilizadas no mesmo turno adquirem 1 círculo de magia'],
            requisitos: ['3 magias level 2 da Maestria Profana', 'Conjurador Tático'] },
          { id: 'elemental', nome: 'Elemental', ordem: 3,
            beneficios: ['4 de bônus em testes de magia de ELEMENTAL', 'Ativo: Essa habilidade pode ser ativada 1 vez ao dia. Suas próximas 3 magias tem custo ZERO de mana'],
            requisitos: ['2 magias de level 3', 'Feiticeiro'] },
          { id: 'iluminado', nome: 'Iluminado', ordem: 3,
            beneficios: ['4 de bônus em testes de magia DIVINA', 'Ativo: Ao meditar por pelo menos 1 hora, o conjurador recupera sua mana igual a sua clarividência'],
            requisitos: ['2 magias de level 3', 'Clérigo'] },
          { id: 'manipulador', nome: 'Manipulador', ordem: 3,
            beneficios: ['4 de bônus em testes de magia MENTAL', 'Ativo: Ao meditar por pelo menos 1 hora, o conjurador recupera sua mana igual a sua clarividência'],
            requisitos: ['2 magias de level 3', 'Ilusionista'] },
          { id: 'arquimago', nome: 'Arquimago', ordem: 3,
            beneficios: ['4 de bônus em testes de magia ARCANA', 'Ativo: Essa habilidade pode ser ativada 1 vez ao dia. Suas próximas 3 magias tem custo ZERO de mana'],
            requisitos: ['2 magias de level 3', 'Mago'] },
          { id: 'lich', nome: 'Lich', ordem: 3,
            beneficios: ['4 de bônus em testes de magia PROFANA', 'Ativo: Suas magias podem possuir até 2 de raio adicional ao ser conjurada'],
            requisitos: ['2 magias de level 3', 'Necromante'] },
          { id: 'disruptor', nome: 'Disruptor', ordem: 3,
            beneficios: ['4 de bônus em testes de magia de DISTORÇÃO', 'Ativo: Suas magias podem possuir até 2 de raio adicional ao ser conjurada'],
            requisitos: ['2 magias de level 3', 'Transmutador'] },
          { id: 'atemporal', nome: 'Atemporal', ordem: 3,
            beneficios: ['4 de bônus em testes de magia TEMPORAL', 'Ativo: Se um teste de conjuração tiver resultado entre 2 e 9, troque esse resultado por 10'],
            requisitos: ['2 magias de level 3', 'Moldador do Tempo'] },
          { id: 'espectro', nome: 'Espectro', ordem: 3,
            beneficios: ['4 de bônus em testes de magia ESPECTRAL', 'Ativo: Se um teste de conjuração tiver resultado entre 2 e 9, troque esse resultado por 10'],
            requisitos: ['2 magias de level 3', 'Bruxo'] },
        ],
      },
      {
        subcategoria: 'FÍSICA',
        descricao: 'Títulos voltados para combate físico, armas, resistência e habilidades corporais',
        titulos: [
          { id: 'rufiao', nome: 'Rufião', ordem: 1,
            efeitos: [{ status: 'vida', delta: 10 }],
            beneficios: ['Adiciona +10 Vida', 'Escolhe uma Maestria de arma; essa maestria possui custo x20 de EXP para ser aprimorada'],
            requisitos: ['3 habilidades de Armas level 1 de uma mesma Maestria'] },
          { id: 'guerreiro', nome: 'Guerreiro', ordem: 1,
            beneficios: ['Após uma esquiva com sucesso pode realizar uma ação de deslocamento adicional', 'Pode ter a ação de esquiva contra projéteis que normalmente não poderiam ser esquivados'],
            requisitos: ['3 habilidades de Armas level 1 de uma mesma Maestria'] },
          { id: 'recruta', nome: 'Recruta', ordem: 1,
            beneficios: ['1 espaço de acessório extra', 'Ativo: Se o resultado de uma ação for um BLOQUEIO o oponente estará ENGAJADO. Enquanto engajado o oponente não poderá se mover e turno a turno o BLOQUEIO será repetido. Para desengajar o oponente gasta 2 ENERGIA'],
            requisitos: ['3 habilidades de Armas level 1 de uma mesma Maestria'] },
          { id: 'gatuno', nome: 'Gatuno', ordem: 1,
            beneficios: ['Seu deslocamento é igual a (DESTREZA + ESPORTES + CULTURA)/2', 'Qualquer teste para permanecer oculto tem no máximo dificuldade 16'],
            requisitos: ['3 habilidades de Armas level 1 de uma mesma Maestria'] },
          { id: 'barbaro', nome: 'Bárbaro', ordem: 2,
            beneficios: ['Após um abate, pode amedrontar um alvo', 'Soma ESPORTES em dano quando possuir vida perdida'],
            requisitos: ['3 habilidades de espada pesada, lança ou machado', 'Rufião'] },
          { id: 'algoz', nome: 'Algoz', ordem: 3,
            beneficios: ['Em golpe com 2 mãos, adiciona sua vida perdida ao DANO', 'Ativo: Soma BRIGA a 2 atributos físicos por 1 turno'],
            requisitos: ['3 habilidades de espada pesada, lança ou machado e Robustez 15', 'Bárbaro'] },
          { id: 'soldado', nome: 'Soldado', ordem: 2,
            beneficios: ['Após realizar um bloqueio, seus ataques nesse turno somam ARMAS BRANCAS ao dano', 'Ativo: Soma BRIGA a 1 atributo físico por 1 turno'],
            requisitos: ['2 habilidades de arma lvl 2', 'Recruta'] },
          { id: 'cavaleiro', nome: 'Cavaleiro', ordem: 3,
            beneficios: ['O custo total para ativação de habilidades de uma mesma maestria de arma é 1 de ENERGIA por turno', 'Ativo: Ignora efeitos mágicos, sociais ou causados por magia que estejam em você'],
            requisitos: ['2 habilidades de arma lvl 3', 'Soldado'] },
          { id: 'mercenario', nome: 'Mercenário', ordem: 2,
            beneficios: ['Quando seus acertos causarem sangramento ou envenenamento, aumenta o efeito em 1 e marca aquele alvo', 'Atingir um alvo marcado causa dano igual ao sangramento/envenenamento do mesmo'],
            requisitos: ['DESTREZA 4 e 2 habilidades de espada leve, arco, besta ou adaga lvl 2', 'Guerreiro'] },
          { id: 'executor', nome: 'Executor', ordem: 3,
            beneficios: ['Atingir um alvo marcado causa 3 de sangramento. Rolagens de acerto D18 e D19 contam como D20', 'Ativo: Matar um alvo ou fazer com que sua vida chegue a zero te possibilita fazer uma ação extra'],
            requisitos: ['2 habilidades de espada leve, arco, besta ou adaga lvl 3', 'Mercenário'] },
          { id: 'defensor', nome: 'Defensor', ordem: 2,
            beneficios: ['Não sofre deslocamento ou queda causados por MAGIA ou habilidades/ações FÍSICAS. Soma ESPORTES na capacidade máxima de ENERGIA', 'Ativo: Soma ROBUSTEZ nas ações de bloqueio, porém perde chance de mover-se no turno'],
            requisitos: ['VIGOR 4 e 2 habilidades de escudo lvl 2', 'Recruta'] },
          { id: 'encouracado', nome: 'Encouraçado', ordem: 3,
            beneficios: ['Ganha +10 de VIDA MÁXIMA para cada atributo FÍSICO lvl 5', 'Ativo: Soma sua ARMADURA no bloqueio desse turno'],
            requisitos: ['2 habilidades de escudo lvl 3', 'Defensor'] },
          { id: 'patrulheiro', nome: 'Patrulheiro', ordem: 2,
            beneficios: ['Uma criatura que sofreu dano deixa rastros que não podem ser ocultados de um PATRULHEIRO. Em viagens os custos de energia são reduzidos em 1', 'Ativo: Soma a DESTREZA de uma criatura ao ACERTO se estiver montado. Soma CULTURA em todos os testes de INVESTIGAÇÃO e EMPATIA'],
            requisitos: ['2 habilidades de arco, besta ou adaga e PILOTEIRO 4', 'Gatuno'] },
          { id: 'guardiao', nome: 'Guardião', ordem: 3,
            beneficios: ['Qualquer fonte que o tenha como alvo tem PILOTEIRO + FORÇA da montaria a mais de dificuldade enquanto permanecer montado', 'Pode usar 1 ação para dar 2 ordens a uma criatura adestrada ou montaria. Soma FORÇA da montaria no DANO em ataques corpo a corpo'],
            requisitos: ['2 habilidades de arco, besta ou adaga lvl 2', 'Patrulheiro'] },
          { id: 'lutador', nome: 'Lutador', ordem: 2,
            beneficios: ['Ativo: Possibilita esquivar-se mesmo que não possua mais ações e soma REFLEXO em testes de esquiva', 'Ativo: Se não possuir equipamentos sua ROBUSTEZ conta como uma armadura'],
            requisitos: ['VIGOR 4 e 3 habilidades lvl 1 em mãos livres', 'Guerreiro'] },
          { id: 'monge', nome: 'Monge', ordem: 3,
            beneficios: ['Escolhe uma maestria de arma ao adquirir esse título. Pode treinar e usar as habilidades dessa maestria sem portar uma arma', 'Ativo: Durante esse turno você não possui custos de ativação de ENERGIA'],
            requisitos: ['FORÇA e DESTREZA 4, 3 habilidades em mãos livres lvl 2', 'Lutador'] },
          { id: 'ladino', nome: 'Ladino', ordem: 2,
            beneficios: ['Ativo: Tocar um alvo possibilita fazer um teste de DESTREZA + OCULTAÇÃO. Se tiver sucesso adquire um item visível que não seja um equipamento do alvo', 'Ativo: Soma OCULTAÇÃO em testes de ESPORTES ou EXPRESSÃO'],
            requisitos: ['Ocultação 4', 'Gatuno'] },
          { id: 'espiao', nome: 'Espião', ordem: 3,
            beneficios: ['Rolagens do D20 para ações FÍSICAS ou SOCIAIS contra um alvo tem valor mínimo de 10 enquanto permanecer oculto para esse alvo', 'Ativo: Os oponentes gastam 1 de FORÇA DE VONTADE para realizar testes sociais contra você'],
            requisitos: ['3 habilidades de profissões ou armas lvl 2', 'Ladino'] },
          { id: 'capitao', nome: 'Capitão', ordem: 2,
            beneficios: ['Não pode ser alvo de testes SOCIAIS ou FÍSICOS caso esteja na presença de ao menos 2 aliados ou em número maior que seus oponentes', 'Ativo: Para ser alvo na cena é necessário pagar 3 de Força de Vontade. Para não o ter como alvo precisa pagar 3 de Força de Vontade'],
            requisitos: ['2 Títulos de classe Militares lvl 3', 'Membro da GUILDA de Aventureiros'] },
          { id: 'domador_de_feras', nome: 'Domador de Feras', ordem: 1,
            beneficios: ['Soma EMPATIA em testes Sociais contra criaturas irracionais', 'Mesmo quando falhar em teste para domar criaturas, a fera não fica hostil por mais um turno'],
            requisitos: ['Profissão CHARCUTEIRO e CAÇADOR'] },
        ],
      },
    ],
  },
  {
    categoria: 'OFICIAL',
    descricao: 'Títulos ligados a guildas, ofícios, comércio e habilidades civis',
    titulos: [
      { id: 'membro_guilda_aventureiros', nome: 'Membro da GUILDA de Aventureiros', ordem: 1,
        beneficios: ['Ganha 10 de EXP a mais por noite quando enfrentarem e derrotam uma criatura aleatória naquele dia', 'Ativo: Se um golpe o fizer perder toda a VIDA quando ainda tinha 50% da VIDA máxima, ao invés disso fica com 1 de VIDA e exausto. Só pode ser usado 1 vez por dia por alvo'],
        requisitos: ['3 habilidades de PROFISSÃO lvl 1'] },
      { id: 'membro_guilda_mercadores', nome: 'Membro da GUILDA de Mercadores', ordem: 1,
        beneficios: ['Ganha 10 de EXP a mais por noite quando fizer um negócio com um desconhecido naquele dia', 'Ativo: Ter um sucesso social sobre alguém em uma barganha aumenta seu prêmio em 20%. Só pode ser usado 1 vez por dia por alvo. O alvo entende que o valor é justo'],
        requisitos: [] },
      { id: 'farejador', nome: 'Farejador', ordem: 1,
        beneficios: ['Seus testes resistidos de controle mágico aumentam igual a Análise / testes social igual a linguística', 'Ativo: Pode somar INSTINTO em testes seguindo um rastro. Em caso de sucesso, consegue mais informações sobre o alvo'],
        requisitos: [] },
      { id: 'bardo', nome: 'Bardo', ordem: 1,
        beneficios: ['Aumenta a capacidade de Força de Vontade baseado em Expressão', 'Ativo: Testes sociais realizados com um instrumento recuperam 1 ou causam a perda de 1 de FORÇA DE VONTADE de todos os que ouvem a melodia. Exceto você'],
        requisitos: [] },
      { id: 'piloto_mor', nome: 'Piloto Mor', ordem: 1,
        beneficios: ['Qualquer teste de PILOTEIRO é um sucesso se a criatura for adestrada', 'Ativo: Testes de ataque, magia, ferramenta ou qualquer outro tem 1 GRAU de dificuldade a menos se estiver montado'],
        requisitos: [] },
      { id: 'mensageiro', nome: 'Mensageiro', ordem: 2,
        beneficios: ['Sucesso em um teste SOCIAL sobre um ou mais alvos causam neles a condição MOTIVADO ou DESMOTIVADO', 'Ativo: Melhora o humor de um alvo tornando-o mais amigável por uma cena'],
        requisitos: ['2 habilidades de PROFISSÃO lvl 2', 'Bardo'] },
      { id: 'mercador_do_burgo', nome: 'Mercador do Burgo', ordem: 2,
        beneficios: ['Ter sucesso social sobre alguém que tem um acordo lhe garante receber 50% de sua parte adiantada', 'Ativo: Ter um sucesso social sobre alguém em uma barganha aumenta seu prêmio em 40%. Só pode ser usado 1 vez por dia por alvo. O alvo entende que o valor é justo'],
        requisitos: ['2 habilidades de PROFISSÃO lvl 2', 'Membro da GUILDA de Mercadores'] },
      { id: 'transportador', nome: 'Transportador', ordem: 2,
        beneficios: ['Se tiver visão do Sol, do Mar, das Estrelas ou puder sentir o Vento saberá sua posição estimada e orientação de rota', 'Ativo: Soma CULTURA em testes de investigação, ocultação, análise e instinto'],
        requisitos: ['Piloto Mor'] },
      { id: 'profissional_dente_de_leite', nome: 'Profissional Dente de Leite', ordem: 2,
        beneficios: ['Não perde os ingredientes ao falhar em um teste de PROFISSÃO'],
        requisitos: ['Membro da GUILDA de Mercadores'] },
      { id: 'celebridade', nome: 'Celebridade', ordem: 3,
        beneficios: ['Não pode ser alvo de testes SOCIAIS enquanto sua Força de Vontade for superior a 10', 'Ativo: Se venceu um teste social contra um ou mais alvos não pode ser alvo de ataques ou magias desses alvos a menos que percam 3 FORÇA DE VONTADE para isso'],
        requisitos: ['Mensageiro'] },
      { id: 'profissional_de_elite', nome: 'Profissional de Elite', ordem: 2,
        beneficios: ['Ativo: Tem 25% de chance (rolar d20) de transformar 1 item de level superior ao que está trabalhando no momento', 'Ativo: Ter um sucesso social sobre alguém em uma barganha aumenta seu prêmio em 60%. Só pode ser usado 1 vez por dia por alvo. O alvo entende que o valor é justo'],
        requisitos: ['1 habilidade de PROFISSÃO lvl 3', 'Mercador do Burgo'] },
      { id: 'curandeiro', nome: 'Curandeiro', ordem: 3,
        beneficios: ['Ativo: Identifica e consegue produzir antídotos e remédios contra quaisquer condições se tiver sucesso no teste INTELIGÊNCIA + ANÁLISE diante da amostra', 'Todas as suas criações que geram CURAS ou REGENERAÇÕES somam CIÊNCIA em testes e resultados'],
        requisitos: ['Profissão MESTRE DE POÇÕES ou MAESTRIA DIVINA', 'Membro da GUILDA de Mercadores'] },
    ],
  },
  {
    categoria: 'NOBRE',
    descricao: 'Títulos de nobreza, hierarquia política e poder territorial.',
    aviso: 'Títulos de nobreza são concedidos pelos Deuses em guildas sagradas, não por homens.',
    titulos: [
      { id: 'burgomestre', nome: 'Burgomestre', ordem: 1, beneficios: [], requisitos: ['3 patentes de profissão', '3 estabelecimentos'] },
      { id: 'conselheiro', nome: 'Conselheiro', ordem: 1, beneficios: [], requisitos: [] },
      { id: 'juiz', nome: 'Juiz', ordem: 1, beneficios: [], requisitos: [] },
      { id: 'executor_real', nome: 'Executor Real', ordem: 2, beneficios: [], requisitos: ['2 patentes lvl 2'] },
      { id: 'paladino', nome: 'Paladino', ordem: 2, beneficios: [], requisitos: ['Patente militar 2'] },
      { id: 'comandante', nome: 'Comandante', ordem: 2, beneficios: [], requisitos: ['Patente militar 2', 'Aliados de fé/militares'] },
      { id: 'sacerdote', nome: 'Sacerdote', ordem: 2, descricao: 'Aquele que abençoa', beneficios: [], requisitos: [] },
      { id: 'bispo', nome: 'Bispo', ordem: 3, beneficios: [], requisitos: ['Clérigo', 'Aliados de fé/militares'] },
      { id: 'cajado_do_rei', nome: 'Cajado do Rei', ordem: 3, beneficios: [], requisitos: ['3 patentes mágicas', 'Aliados de fé/militares'] },
      { id: 'conde', nome: 'Conde', ordem: 3, beneficios: [], requisitos: ['Dono de terras'] },
      { id: 'marques', nome: 'Marquês', ordem: 3, beneficios: [], requisitos: ['Dono de terras', 'Protetor do reino'] },
      { id: 'duque', nome: 'Duque', ordem: 3, beneficios: [], requisitos: ['Dono de terras', 'Protetor do reino', 'Comercial'] },
      { id: 'principe', nome: 'Príncipe', ordem: 4, beneficios: [], requisitos: ['Casamento', 'Detentor militar e de terras de uma grande região'] },
    ],
  },
];

// ── Build maps ─────────────────────────────────────────────────────────────────
function buildMaps() {
  const all = [];
  for (const cat of CATEGORIAS_RAW) {
    if (cat.subcategorias) {
      for (const sub of cat.subcategorias) {
        for (const t of sub.titulos) {
          all.push({ ...t, categoria: cat.categoria, subcategoria: sub.subcategoria });
        }
      }
    } else {
      for (const t of cat.titulos) {
        all.push({ ...t, categoria: cat.categoria });
      }
    }
  }

  const byId = {};
  const nameToId = {};
  all.forEach(t => {
    byId[t.id] = t;
    nameToId[t.nome.toLowerCase().trim()] = t.id;
  });

  // prereqs[id] = [ids of titles that are prerequisites for this title]
  // unlocks[id] = [ids of titles that this title unlocks]
  const prereqs = {};
  const unlocks = {};
  all.forEach(title => {
    title.requisitos.forEach(req => {
      const reqId = nameToId[req.toLowerCase().trim()];
      if (reqId && reqId !== title.id) {
        if (!prereqs[title.id]) prereqs[title.id] = [];
        if (!prereqs[title.id].includes(reqId)) prereqs[title.id].push(reqId);
        if (!unlocks[reqId]) unlocks[reqId] = [];
        if (!unlocks[reqId].includes(title.id)) unlocks[reqId].push(title.id);
      }
    });
  });

  return { all, byId, prereqs, unlocks };
}

const { all: ALL_TITLES, byId: TITLE_BY_ID, prereqs: TITLE_PREREQS, unlocks: TITLE_UNLOCKS } = buildMaps();

export { CATEGORIAS_RAW, ALL_TITLES, TITLE_BY_ID, TITLE_PREREQS, TITLE_UNLOCKS };
export function findTitleById(id) { return TITLE_BY_ID[id]; }
