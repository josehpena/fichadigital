// Skill tree data — auto-generated from user JSON

export const TRAILS_PROFISSOES = [
  {
    "id": "sabio_do_caldeirao",
    "nome": "SÁBIO DO CALDEIRÃO",
    "skills": [
      {
        "id": "mestre_de_pocoes",
        "nome": "MESTRE DE POÇÕES",
        "tipo": "produtor",
        "descricao": "Especialista na criação de poções. Produz efeitos diretos e rápidos que podem ser usados em combate ou suporte.",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "Produz 2 poções que podem conter até 3 PASTAS por POÇÃO",
            "•POÇÃO DE CURA",
            "• POÇÃO DE REGENERAÇÃO DE ENERGIA",
            "• POÇÃO DE REGENERAÇÃO DE FORÇA DE FORÇA VONTADE",
            "• POÇÃO DE MANA",
            "• POÇÃO MIXMAXIMA"
          ],
          "2": [
            "Pode adicionar até 5 PASTAS por POÇÃO"
          ],
          "3": [
            "Cria genialidades com ingredientes de outras profissões"
          ]
        }
      },
      {
        "id": "misturador_de_raizes",
        "nome": "MISTURADOR DE RAIZES",
        "tipo": "ingredientista",
        "descricao": "Especialista no processamento de ingredientes naturais como ervas, raízes, frutas, flores e cogumelos, transformando-os em pastas alquímicas. Essas pastas podem ser usadas diretamente como pomadas ou servir como ingredientes de fabricação em outras profissões (como tintas ou receitas culinárias). Cria 1 ingrediente de:",
        "maxLevel": 2,
        "niveis": {
          "1": [
            "• PASTA CICATRIZANTE",
            "• VENENO",
            "• PASTA DE ERVA DE CURA (INGR.)",
            "• PASTA DE ERVA ESTIMULANTE (INGR.)",
            "• PASTA DE ERVA DE REVIGORANTE (INGR.)",
            "• PASTA DE ERVA MÍSTICA (INGR.)",
            "• PASTA DE ERVA DESINFECTANTE (INGR.)",
            "• PERFUMES"
          ],
          "2": [
            "Produz o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE"
          ]
        }
      },
      {
        "id": "herbalista",
        "nome": "HERBALISTA",
        "tipo": "coletor",
        "descricao": "Coleta 5 un. recursos e diminui em 1 grau a dificuldade em procurar estes recursos. Especialista na identificação de propriedades e na coleta de;",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "1 MAÇO DE ERVAS"
          ],
          "2": [
            "Coleta o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE. Coleta recursos de level 2 sem testes"
          ],
          "3": [
            "1x por dia, coleta 1 ingrediente de nível superior. Coleta recursos de level 3 ou mais"
          ]
        }
      },
      {
        "id": "xama",
        "nome": "XAMÃ",
        "tipo": "produtor",
        "descricao": "Mestre da destilação alquímica, transforma ingredientes crus e preparados em elixires poderosos. Seus efeitos envolvem alterações profundas no corpo, mente e espírito. Requer maior preparo e domínio. Produz 2 elixires com efeitos mágicos e extraordinários",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "• TRANSFIGURAÇÃO ANIMAL/BESTIAL TOTAL",
            "• TRANSFIGURAÇÃO ANIMAL/BESTIAL PARCIAL"
          ],
          "2": [
            "Aumenta a duração dos elixir em até 1 semana"
          ],
          "3": [
            "Cria genialidades com ingredientes de outras profissões"
          ]
        }
      },
      {
        "id": "destilador",
        "nome": "DESTILADOR",
        "tipo": "ingredientista",
        "descricao": "Especialista em extrair a essência líquida de criaturas mortas para criar destilados usados como ingredientes em outros processos (elixires, poções, tintas, bebidas e etc). Cria 1 ingrediente de:",
        "maxLevel": 2,
        "niveis": {
          "1": [
            "• VAPOR ALTRAL PURO (INGR.)",
            "• VAPOR ALTRAL FRAGMENTADO (INGR.)"
          ],
          "2": [
            "Produz o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE"
          ]
        }
      },
      {
        "id": "canalizador_de_essencias",
        "nome": "CANALIZADOR DE ESSÊNCIAS",
        "tipo": "coletor",
        "descricao": "Especialista na identificação de propriedades e na coleta de;",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "• ESSÊNCIA ANIMAL/BESTIAL PURA",
            "• ESSÊNCIA ANIMAL/BESTIAL FRAGMENTADA"
          ],
          "2": [
            "Coleta o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE. Coleta recursos de level 2 sem testes"
          ],
          "3": [
            "1x por dia, coleta 1 ingrediente de nível superior. Coleta recursos de level 3 ou mais"
          ]
        }
      }
    ]
  },
  {
    "id": "chefe_da_cacada",
    "nome": "CHEFE DA CAÇADA",
    "skills": [
      {
        "id": "armadilheiro",
        "nome": "ARMADILHEIRO",
        "tipo": "produtor",
        "descricao": "Cria 1 unidade de diversos tipos de armadilha de diferentes tamanhos e funções",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "Armadilhas pequena até 0,5m",
            "• Armadilha de alarme"
          ],
          "2": [
            "• Arapuca",
            "• Cesto de peixes",
            "Armadilhas medias até 2m",
            "• Armadilha de laços"
          ],
          "3": [
            "• Armadilha de punki (buraco de estacas)",
            "• Armadilha de gatilho",
            "Armadilhas grandes para captura acima de 2m",
            "• Armadilha de rede"
          ]
        }
      },
      {
        "id": "artesao_selvagem",
        "nome": "ARTESÃO SELVAGEM",
        "tipo": "ingredientista",
        "descricao": "Cria 1 ingrediente de diversos tipos de ingredientes para armadilhas e marcações de animais",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "itens de sobrevivencia pequenos até 0,5m",
            "Conj de ESTACAS (Ingr)",
            "PEÇA DURA ENTALHADA (Ingr)"
          ],
          "2": [
            "Talismã de Ossos",
            "Produz o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE",
            "itens de sobrevivencia médios até 1m"
          ],
          "3": [
            "Broche de Marcação",
            "itens de sobrevivencia grandes acima de 1m"
          ]
        }
      },
      {
        "id": "carniceiro",
        "nome": "CARNICEIRO",
        "tipo": "coletor",
        "descricao": "Especialista na identificação de propriedaes e em coleta de PEÇA DURAS de CRIATURAS. Coleta 1 recurso de:",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "CASCO",
            "CARAPAÇA",
            "CHIFRE",
            "OSSOS",
            "PRESSA",
            "GARRA"
          ],
          "2": [
            "Coleta o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE. Coleta recursos de level 2 sem testes"
          ],
          "3": [
            "1x por dia, coleta 1 ingrediente de nível superior. Coleta recursos de level 3 ou mais"
          ]
        }
      },
      {
        "id": "peador_de_bichao",
        "nome": "PEADOR DE BICHÃO",
        "tipo": "produtor",
        "descricao": "Cria 1 unidade de diversos tipos de itens para adestramento e montaria de criaturas",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "Correia de Fixação",
            "Coleira Marcada"
          ],
          "2": [
            "Alforge de Couro",
            "Estribos e redeas",
            "Focinheira de Ossos",
            "Sela"
          ],
          "3": [
            "Estrutura de Arrasto – feita para mover corpos ou cargas no mato."
          ]
        }
      },
      {
        "id": "tracador_de_emboscada",
        "nome": "TRAÇADOR DE EMBOSCADA",
        "tipo": "ingredientista",
        "descricao": "Cria 1 ingrediente de diversos tipos de itens com couro, principalmente utilizando cordas e amarras",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "• CORDA (item final ou ingr)",
            "• COURO CURTIDO (ingr)",
            "• CALTIL PEQUENO 3 GOLES",
            "COBERTOR RUSTICO"
          ],
          "2": [
            "Produz o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE",
            "CANTIL GRANDE 6 GOLES",
            "Gancho de Osso com Corda"
          ],
          "3": [
            "• TENDA"
          ]
        }
      },
      {
        "id": "esfolador",
        "nome": "ESFOLADOR",
        "tipo": "coletor",
        "descricao": "Especialista na identificação de propriedades e em esfolamento de couros. Coelta 1 unidade de:",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "COURO"
          ],
          "2": [
            "Coleta o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE. Coleta recursos de level 2 sem testes"
          ],
          "3": [
            "1x por dia, coleta 1 ingrediente de nível superior. Coleta recursos de level 3 ou mais"
          ]
        }
      }
    ]
  },
  {
    "id": "grao_mestre_dos_talheres",
    "nome": "GRÃO MESTRE DOS TALHERES",
    "skills": [
      {
        "id": "cozinheiro",
        "nome": "COZINHEIRO",
        "tipo": "produtor",
        "descricao": "Cria 5 unidade de diversos tipos de refeições que auxiliam em regenerações de recursos",
        "maxLevel": 2,
        "niveis": {
          "1": [
            "• CARNE ENSOPADA",
            "• CARNE ASSADA"
          ],
          "2": [
            "Produz o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE",
            "• CARNE FRITA",
            "• CARNE AGRIDOCE",
            "• LINGUIÇA"
          ]
        }
      },
      {
        "id": "defumador",
        "nome": "DEFUMADOR",
        "tipo": "ingredientista",
        "descricao": "Cria 5 ingredientes de diversos tipos depreparados culinários para consumo direto ou para refeições mais robustas",
        "maxLevel": 2,
        "niveis": {
          "1": [
            "• CARNE DEFUMADA (item final ou ingrediente)",
            "• ISCA PARA CAÇADORES (item final)",
            "• ÓLEO (item final ou ingrediente)",
            "• TRIPA (ingrediente)"
          ],
          "2": [
            "Produz o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE"
          ]
        }
      },
      {
        "id": "acougueiro",
        "nome": "AÇOUGUEIRO",
        "tipo": "coletor",
        "descricao": "Especialista na identificação de propriedades de carnes e visseras. Coelta 5 unidade de:",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "• CARNE",
            "• VISSERAS",
            "• GORDURA"
          ],
          "2": [
            "Coleta o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE. Coleta recursos de level 2 sem testes"
          ],
          "3": [
            "1x por dia, coleta 1 ingrediente de nível superior. Coleta recursos de level 3 ou mais"
          ]
        }
      },
      {
        "id": "fermentador",
        "nome": "FERMENTADOR",
        "tipo": "produtor",
        "descricao": "Cria 5 unidade de diversos tipos de bebidas que auxiliam em regenerações de recursos. A condição MOTIVADO não se acumula por tomar mais de uma bebida",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "• ÁGUA DOCE",
            "• SUCO DE POUPA"
          ],
          "2": [
            "Produz o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE",
            "• HONEY BEER",
            "• VINHO SUAVE"
          ],
          "3": [
            "• HIDROMEL"
          ]
        }
      },
      {
        "id": "confeiteiro",
        "nome": "CONFEITEIRO",
        "tipo": "ingredientista",
        "descricao": "Produz 5 INGREDIENTES como geleias, doces QUE PODEM SER CONSUMIDOS OU USADOS COMO INGREDIENTES",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "• GELEIA (item final E INGR)",
            "• VELA (item final)",
            "• IMPERMEABILIZANTE (item final)",
            "• COMPOSTO DOCE (INGR)"
          ],
          "2": [
            "Produz 2 un. no mesmo tempo e com os mesmos ingredientes do LV 1.",
            "• VINHO SECO (Item final)",
            "• PERFUME(item final)"
          ],
          "3": [
            "• TONICO DE MONSTRÃO"
          ]
        }
      },
      {
        "id": "coletor_silvestre",
        "nome": "COLETOR SILVESTRE",
        "tipo": "coletor",
        "descricao": "Especialista na identificação de propriedades de FRUTAS, MEL E AFINS. Coleta 5 unidade de:",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "• MEL",
            "• PRÓPOLIS",
            "• CERA DE ABELHA",
            "• FRUTAS"
          ],
          "2": [
            "Coleta o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE. Coleta recursos de level 2 sem testes"
          ],
          "3": [
            "1x por dia, coleta 1 ingrediente de nível superior. Coleta recursos de level 3 ou mais"
          ]
        }
      }
    ]
  },
  {
    "id": "grao_mestre_fiandeiro",
    "nome": "GRÃO MESTRE FIANDEIRO",
    "skills": [
      {
        "id": "alfaiate",
        "nome": "ALFAIATE",
        "tipo": "produtor",
        "descricao": "Cria1 unidade de diversos tipos de trajes, vestimentas, e capas. São acessórios",
        "maxLevel": 3,
        "niveis": {
          "2": [
            "Produz o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE",
            "• TRAJE ELITE",
            "• CAPA DE TECIDO",
            "• VESTIDO"
          ],
          "3": [
            "• EMBLEMA  (titulos de classe e clãs)"
          ]
        }
      },
      {
        "id": "modista",
        "nome": "MODISTA",
        "tipo": "ingredientista",
        "descricao": "Cria1 unidade de diversos tipos de TECIDOS. São ingredientes",
        "maxLevel": 3,
        "niveis": {
          "2": [
            "Produz o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE",
            "• COBERTA (Item final)",
            "• SACO DE DORMIR (Item final)"
          ],
          "3": [
            "TECIDO ORNAMENTAL"
          ]
        }
      },
      {
        "id": "tosquiador",
        "nome": "TOSQUIADOR",
        "tipo": "coletor",
        "descricao": "Especialista na identificação de propriedades dePELO, PENA, ESCAMAS. Coleta 1 unidade de:",
        "maxLevel": 3,
        "niveis": {
          "3": [
            "• PELO",
            "• PENAS",
            "• ESCAMA",
            "1x por dia, coleta 1 ingrediente de nível superior."
          ],
          "2": [
            "Coleta o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE. Coleta recursos de level 2 sem testes"
          ]
        }
      },
      {
        "id": "costureiro",
        "nome": "COSTUREIRO",
        "tipo": "produtor",
        "descricao": "Cria1 unidade de diversos tipos COMO TENDAS, ALJAVAS, BOLSAS. Alguns intes são acessórios",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "• BOLSA",
            "• COBERTA",
            "• ALJAVA (acessório)"
          ],
          "2": [
            "Produz o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE",
            "• MOCHILA (acessório)",
            "• BAINHA (acessório)",
            "• TENDA pequena"
          ],
          "3": [
            "• TENDA grande"
          ]
        }
      },
      {
        "id": "curtidor",
        "nome": "CURTIDOR",
        "tipo": "ingredientista",
        "descricao": "Cria1 unidade de diversos itens como cantis, tiras de couro e cintos. Alguns intes são acessórios",
        "maxLevel": 2,
        "niveis": {
          "1": [
            "• COURO CURTIDO (Ingr)",
            "• TIRA DE COURO (aprimoramento)"
          ],
          "2": [
            "Produz o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE",
            "• CINTO DE FERRAMENTAS/DARDOS/POÇÕES (Item final)",
            "• CANTIL"
          ]
        }
      },
      {
        "id": "esfolador",
        "nome": "ESFOLADOR",
        "tipo": "coletor",
        "descricao": "Especialista na identificação de propriedades e em esfolamento de couros. Coelta 1 unidade de:",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "COURO"
          ],
          "2": [
            "Coleta o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE. Coleta recursos de level 2 sem testes"
          ],
          "3": [
            "1x por dia, coleta 1 ingrediente de nível superior. Coleta recursos de level 3 ou mais"
          ]
        }
      }
    ]
  },
  {
    "id": "roedor_de_minerios",
    "nome": "ROEDOR DE MINÉRIOS",
    "skills": [
      {
        "id": "alquimista",
        "nome": "ALQUIMISTA",
        "tipo": "produtor",
        "descricao": "Cria1 unidade de diversos ITENS alquimicos usados ofensivamente ou táticamente dependendo da málicia e inteligência de cada um.",
        "maxLevel": 2,
        "niveis": {
          "1": [
            "PÓ DO VERDADEIRO NOME",
            "PÓ DA MEMÓRIA ANCESTRAL",
            "FOGO DO INTERIOR GÉLIDO",
            "ESSÊNCIA DE CHAMA VIVA",
            "LÍQUIDO DE DUPLICAÇÃO"
          ],
          "2": [
            "Produz o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE"
          ]
        }
      },
      {
        "id": "misturador",
        "nome": "MISTURADOR",
        "tipo": "ingredientista",
        "descricao": "Cria1 unidade de diversos ITENS alquimicos usados ofensivamente ou táticamente dependendo da málicia e inteligência de cada um.",
        "maxLevel": 2,
        "niveis": {
          "1": [
            "RESINA DE LUAR",
            "ÓLEO DE PEDRA",
            "MARCA DA ALMA SILENCIOSA",
            "ESSÊNCIA DE PRATA",
            "NÉVOA DAS ILUSÕES"
          ],
          "2": [
            "Produz o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE"
          ]
        }
      },
      {
        "id": "coletor_etereo",
        "nome": "COLETOR ETÉREO",
        "tipo": "coletor",
        "descricao": "Especialista em extrair resíduos minerais mágicos, seivas minerais raras, vapores e lodos etéreos encontrados em fendas, cavernas profundas ou áreas instáveis magicamente. Recolhe elementos que não são minérios metálicos comuns, mas sim subprodutos místicos e instáveis da geologia mágica. Coleta 1 recurso:",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "• SAL ONÍRICO",
            "• CRISTAL LUNAR",
            "• PICHE NEGRO",
            "• ORVALHO MORTO",
            "• PRATA ANCESTRAL"
          ],
          "2": [
            "Coleta o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE. Coleta recursos de level 2 sem testes"
          ],
          "3": [
            "1x por dia, coleta 1 ingrediente de nível superior."
          ]
        }
      },
      {
        "id": "ferreiro",
        "nome": "FERREIRO",
        "tipo": "produtor",
        "descricao": "Cria 1 unidade de diversos EQUIPAMENTOS usados para se proteger. Cada equipamentos aceita um aprimoramento por nível.",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "pequenas até 0,5m (EX; ELMOS, BRACELETES, OMBREIRAS, BOTAS, PEÇAS)"
          ],
          "2": [
            "médias até 1,5m (EX; CALÇAS, PEITORAIS, ARMAS)"
          ],
          "3": [
            "Grandes acima de 1,5m  (ARMADURAS PARA ANIMAIS, MOBS, PORTAS, ESTRUTURAS)"
          ]
        }
      },
      {
        "id": "forjador",
        "nome": "FORJADOR",
        "tipo": "ingredientista",
        "descricao": "Cria 1 unidade de diversos EQUIPAMENTOS usados para se proteger. Cada equipamentos aceita um aprimoramento por nível.",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "• LINGOTE DE METAL (ing)",
            "• KIT DE FERRAMENTA DE PROFISSÃO",
            "• APRIMORAMENTO DE DURABILIDADE, ARMADURAS e outros PARA ARMADURAS E ARMAS",
            "• LINGUOTE de AÇO",
            "• APRIMORAMENTO DE DANO PARA ARMAS"
          ],
          "2": [
            "• FECHADURA, TACHOS, TALHERES e itens médios de até 0,50cm",
            "Produz 2 un. no mesmo tempo e com os mesmos ingredientes do LV 1.",
            "• GRADES, PÉ DE CABRA, e itens médios de até 1,50m",
            "• LINGUOTE de MITHRIL"
          ],
          "3": [
            "• LINGUOTE de ADAMANTIUM"
          ]
        }
      },
      {
        "id": "coletor_etereo_minerios",
        "nome": "COLETOR ETÉREO (MINÉRIOS)",
        "tipo": "coletor",
        "descricao": "Coleta 1m² de PEDRAS E MINÉRIO suficiente para produzir 1 LINGOTE, 5 PEDRAS ESCULPIDAS e 1 porção de BRITA;S",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "• FERRO",
            "• BRONZE",
            "• PRATA",
            "• TITÂNIO"
          ],
          "2": [
            "Coleta 1m² de PEDRAS E MINÉRIO suficiente para produzir 2 LINGOTE, 10 PEDRAS ESCULPIDAS e 2 porções de BRITAS"
          ],
          "3": [
            "1x por dia, coleta 1 ingrediente de nível superior."
          ]
        }
      }
    ]
  },
  {
    "id": "joalheiro",
    "nome": "JOALHEIRO",
    "skills": [
      {
        "id": "ourives",
        "nome": "OURIVES",
        "tipo": "produtor",
        "descricao": "Cria 1 unidade de diversos ACESSÓRIOS usados para agregar reputação dentre outras melhorias como aprimoramento elemental. Cada acessório aceita um aprimoramento por nível. Cria também dispositivos elementais para diversos fins",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "• COLAR, BRINCO, ANEL, BROCHE entre outras joias(acessórios)"
          ],
          "2": [
            "Dispositivos médios"
          ],
          "3": [
            "Grandes dispositivos"
          ]
        }
      },
      {
        "id": "lapidador",
        "nome": "LAPIDADOR",
        "tipo": "ingredientista",
        "descricao": "Produz/Lapida transformando em 1un. de gema trabalhada e 1 porção de pó alquimíco(ao mesmo tempo, pó alquimico sobra da lapidação da gema)",
        "maxLevel": 2,
        "niveis": {
          "1": [
            "• GEMA LAPIDADA / PÓ ALQUIMICO"
          ],
          "2": [
            "Produz o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE"
          ]
        }
      },
      {
        "id": "coletor_etereo_gemas",
        "nome": "COLETOR ETÉREO (GEMAS)",
        "tipo": "coletor",
        "descricao": "Coleta 1m² de PEDRAS E MINÉRIO suficiente para produzir 1 GEMA LAPIDADA, 5 PEDRAS ESCULPIDAS e 1 porção de BRITAS. Abaixo seguem efeitos das GEMAS quando lapidados/ pó alquimico",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "• RUBI",
            "• JADE",
            "• ESMERALDA",
            "• OPALA",
            "• SAFIRA",
            "• AZURITA",
            "• TURMALINA",
            "•  CRISTAL",
            "• DIAMANTE",
            "• AMBAR",
            "• AMETISTA",
            "• CITRINO",
            "• ONIX"
          ],
          "2": [
            "Coleta o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE. Coleta recursos de level 2 sem testes"
          ],
          "3": [
            "1x por dia, coleta 1 ingrediente de nível superior."
          ]
        }
      },
      {
        "id": "ourives_talismas",
        "nome": "OURIVES (TALISMÃS)",
        "tipo": "produtor",
        "descricao": "Produz 1 TALISMÃ, utilizada para fazer uma magia sem a necessidade de aprender a magia",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "• TALISMÃ (EQUIVALENTE A TRILHA USADA NA RECEITA)"
          ],
          "2": [
            "• TALISMÃ (EQUIVALENTE A TRILHA USADA NA RECEITA)"
          ],
          "3": [
            "• TALISMÃ (EQUIVALENTE A TRILHA USADA NA RECEITA)"
          ]
        }
      },
      {
        "id": "canalizador_de_essencia",
        "nome": "CANALIZADOR DE ESSÊNCIA",
        "tipo": "ingredientista",
        "descricao": "Produz 1 foco de magia, fragmentos de orbs e outros. Normalemnte de usos primarios para conjuradores ou como estrátegia adicional para lutadores físicos.",
        "maxLevel": 2,
        "niveis": {
          "1": [
            "• FOCO DE MÁGIA (EQUIVALENTE A TRILHA USADA NA RECEITA) (aprimoramento)",
            "• FRAGMENTO DE ORBE (EQUIVALENTE A TRILHA USADA NA RECEITA) (aprimoramento)"
          ],
          "2": [
            "Produz o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE"
          ]
        }
      },
      {
        "id": "rastreador_de_fluxo",
        "nome": "RASTREADOR DE FLUXO",
        "tipo": "coletor",
        "descricao": "Coleta 1 un. recursos ao transformar 5 de mana de um ser/criatura ou ambiente em essência. Qualquer ser vivo/que ainda possua um espírito possui mana e está tem caracteristicas mais marcantes de tipo para cada ser, apesar de existirem variantes.",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "• ESSÊNCIA MÁGICA ARCANA",
            "• ESSÊNCIA MÁGICA DISTORÇÃO",
            "• ESSÊNCIA MÁGICA DIVINO",
            "• ESSÊNCIA MÁGICA ELEMENTAL",
            "• ESSÊNCIA MÁGICA ESPECTRAL",
            "• ESSÊNCIA MÁGICA MENTAL",
            "• ESSÊNCIA MÁGICA PROFANO",
            "• ESSÊNCIA MÁGICA TEMPORAL"
          ],
          "2": [
            "Coleta o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE. Coleta recursos de level 2 sem testes"
          ],
          "3": [
            "1x por dia, coleta 1 ingrediente de nível superior."
          ]
        }
      }
    ]
  },
  {
    "id": "senhor_dos_registros",
    "nome": "SENHOR DOS REGISTROS",
    "skills": [
      {
        "id": "escriba",
        "nome": "ESCRIBA",
        "tipo": "produtor",
        "descricao": "Cria 1 documento ou mapa OFICIAL (reconhecimento de profissões, atividades, registros em guilds)",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "Contrato de Maldição - Toque de Vilis",
            "Contrato de Firmamento",
            "Papiro de Tradução Instantânea",
            "Papiro gêmeo"
          ],
          "2": [
            "Mapa Oficial",
            "Papiro de Selamento de Criatura",
            "Contrato de Maldição - Razaketh"
          ],
          "3": [
            "Papilesco de Memória"
          ]
        }
      },
      {
        "id": "papirador",
        "nome": "PAPIRADOR",
        "tipo": "ingredientista",
        "descricao": "Cria 1 documento ou mapa ORDINÁRIO.",
        "maxLevel": 2,
        "niveis": {
          "1": [
            "• PAPIRO ORDINÁRIO (ingrediente)",
            "Papiro de Mapeamento",
            "Papiro de Vedação",
            "Iscas de Combustão",
            "• PAPIRO MÁGICO (ingrediente)"
          ],
          "2": [
            "Papiro de Fibra de Monstro"
          ]
        }
      },
      {
        "id": "coletor_silvestre_plantas",
        "nome": "COLETOR SILVESTRE (PLANTAS)",
        "tipo": "coletor",
        "descricao": "Existem vários tipos de ervas. Cada bioma terá uma proporção diferente desses tipos. Diminui em 1 grau a dificuldade em procurar estes recursos. Coleta 5 unidades",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "• ERVAS",
            "• ERVAS MAGICAS"
          ],
          "2": [
            "Coleta o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE. Coleta recursos de level 2 sem testes"
          ],
          "3": [
            "1x por dia, coleta 1 ingrediente de nível superior. Coleta recursos de level 3 ou mais"
          ]
        }
      },
      {
        "id": "ritualista",
        "nome": "RITUALISTA",
        "tipo": "produtor",
        "descricao": "Cria 1 Tatuagens magicas e pergaminhos com finalidades magias e de invocações",
        "maxLevel": 2,
        "niveis": {
          "1": [
            "Tatuagens Rúnicas temporárias (1 semana)",
            "PERGAMINHO DE INVOCAÇÃO DE OBJETOS",
            "Tatuagem do Sangue de Troll",
            "Tatuagem da sereia de Nah'dor"
          ],
          "2": [
            "Produz o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE",
            "PERGAMINHO DE INVOCAÇÃO MAGICO"
          ]
        }
      },
      {
        "id": "boticario",
        "nome": "BOTICÁRIO",
        "tipo": "ingredientista",
        "descricao": "Cria 1 TINTAS e VENENOScom finalidades magicas.",
        "maxLevel": 2,
        "niveis": {
          "1": [
            "• TINTA",
            "• TINTA MÁGICA",
            "Nanquim do sangue fervilhante",
            "Pigmento de olho de Gorgona",
            "Extrato de Medula de Predador"
          ],
          "2": [
            "• VENENO",
            "Produz o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE"
          ]
        }
      },
      {
        "id": "coletor_da_seiva_matre",
        "nome": "COLETOR DA SEIVA MATRE",
        "tipo": "coletor",
        "descricao": "Existem vários tipos de ervas. Cada bioma terá uma proporção diferente desses tipos. Diminui em 1 grau a dificuldade em procurar estes recursos. Coleta 5 unidades",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "• SANGUE",
            "• SEIVAS"
          ],
          "2": [
            "Coleta o dobro de itens do lvl 1 com apenas 1 FORÇA DE VONTADE. Coleta recursos de level 2 sem testes"
          ],
          "3": [
            "1x por dia, coleta 1 ingrediente de nível superior. Coleta recursos de level 3 ou mais"
          ]
        }
      }
    ]
  },
  {
    "id": "construtor",
    "nome": "CONSTRUTOR",
    "skills": [
      {
        "id": "carpinteiro",
        "nome": "CARPINTEIRO",
        "tipo": "produtor_final",
        "descricao": "Tipo: Produção de item final",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "Produz 1un. de madeira pequeno até 0,5 M² como;"
          ],
          "2": [
            "Produz 1 un. de madeira médio até 2,0m² como;"
          ],
          "3": [
            "Produz 1 un. de madeira grande acima de 2m² como;"
          ]
        }
      },
      {
        "id": "pedreiro",
        "nome": "PEDREIRO",
        "tipo": "produtor_final",
        "descricao": "Tipo: Produção de item final",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "Produz 1un. de pedra pequeno até 0,5 M² como;"
          ],
          "2": [
            "Produz 1 un. de pedra médio até 2,0m² como;"
          ],
          "3": [
            "Produz 1 un. de madeira grande acima de 2m² como; \n• Moinho\n• Represa\n• Construções que envolvam engrenagens e dispositivos dinâmicos de engenharia"
          ]
        }
      },
      {
        "id": "artesao",
        "nome": "ARTESÃO",
        "tipo": "fabricacao",
        "descricao": "Tipo: item de fabricação",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "Produz 1un. de;",
            "• TABUA",
            "• VIGA",
            "• COLUNA",
            "• PREPARADO DE RESINA",
            "• ESCULTURAS e itens pequenos até 0,5m²"
          ],
          "2": [
            "Produz 2 un. no mesmo tempo e com os mesmos ingredientes do LV 1.",
            "• ESCULTURAS e itens medios até 1,5m²"
          ],
          "3": [
            "• ESCULTURAS e itens grandes acima 1,5m²"
          ]
        }
      },
      {
        "id": "escultor",
        "nome": "ESCULTOR",
        "tipo": "fabricacao",
        "descricao": "Tipo: item de fabricação",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "Produz unidades de;",
            "• 5 unidades de PEDRA ESCULPIDA",
            "• MASSA DE ACENTAMENTO",
            "• ESCULTURAS e itens pequenos até 0,5m²"
          ],
          "2": [
            "Produz 2 un. no mesmo tempo e com os mesmos ingredientes do LV 1.",
            "• ESCULTURAS e itens medios até 1,5m²"
          ],
          "3": [
            "• ESCULTURAS e itens grandes acima 1,5m²"
          ]
        }
      },
      {
        "id": "lenhador",
        "nome": "LENHADOR",
        "tipo": "coletor",
        "descricao": "Tipo: Coletor de recurso",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "• TORA",
            "• RESINA"
          ],
          "2": [
            "Coleta 10 un. recursos no mesmo tempo do lvl 1."
          ],
          "3": [
            "1x por dia, coleta 1 ingrediente de nível superior."
          ]
        }
      },
      {
        "id": "minerador_de_pedras",
        "nome": "MINERADOR DE PEDRAS",
        "tipo": "coletor",
        "descricao": "Tipo: Coletor de recurso",
        "maxLevel": 3,
        "niveis": {
          "1": [
            "Coleta 1m² de PEDRAS E MINÉRIO suficiente para produzir 1 LINGOTE, 5 PEDRAS ESCULPIDAS e 1 porção de BRITAS;",
            "• PREDRA BRUTA",
            "• BRITAS"
          ],
          "2": [
            "Coleta 1m² de PEDRAS E MINÉRIO suficiente para produzir 2 LINGOTE, 10 PEDRAS ESCULPIDAS e 2 porções de BRITAS;"
          ],
          "3": [
            "1x por dia, coleta 1 ingrediente de nível superior."
          ]
        }
      }
    ]
  }
];

export const TRAILS_ARMAS = [
  {
    "id": "espada_longa",
    "nome": "ESPADA LONGA",
    "categoria": "ESPADAS",
    "skills": [
      {
        "id": "estocada",
        "nome": "ESTOCADA",
        "maxLevel": 3,
        "niveis": {
          "1": "Só pode ser bloqueado por escudos, 1 de alcance e perfura o alvo de trás se estiver no alcance",
          "2": "2 de pressão, se for bloqueado ou acerto contra esquiva causa 4 de pressão",
          "3": "Dobra os efeitos de pressão dessa arma"
        }
      },
      {
        "id": "devastador",
        "nome": "DEVASTADOR",
        "maxLevel": 3,
        "niveis": {
          "1": "Acerta 2 casas proximas de alcance em sua volta por golpe",
          "2": "Acerta 3 casas proximas em sua volta por golpe. Somente Escudos podem parar a execução completa dessa habilidade",
          "3": "Giro em volta de si, acerta todos em sua volta por ação de ataque"
        }
      },
      {
        "id": "manobra",
        "nome": "MANOBRA",
        "maxLevel": 3,
        "niveis": {
          "1": "Ao realizar uma ação de bloqueio você pode ativar a habilidade ESTOCADA e usar contra um outro alvo dentro de seu alcance",
          "2": "Ao realizar uma ação de bloqueio você pode ativar a habilidade DEVASTADOR e usar contra um outro alvo dentro de seu alcance",
          "3": "Não é necessário gasto de energia para utilizar esta habilidade e habilidades ativadas através dela"
        }
      }
    ]
  },
  {
    "id": "espada_curta",
    "nome": "ESPADA CURTA",
    "categoria": "ESPADAS",
    "skills": [
      {
        "id": "aparar",
        "nome": "APARAR",
        "maxLevel": 3,
        "niveis": {
          "1": "Se um bloqueio for acontecer, o poderdo bloqueio do adversário é cortado pela metade. Todos os demais efeitos de contato são considerados",
          "2": "Soma ESPORTES em acertos e esquiva sobre um oponente que aparou nessa cena",
          "3": "Aparar um golpe lhe consede uma ação de ataque com essa arma que acontece na mesma ação"
        }
      },
      {
        "id": "ataque_sorrateiro",
        "nome": "ATAQUE SORRATEIRO",
        "maxLevel": 3,
        "niveis": {
          "1": "Se realizar uma esquiva com sucesso nesse turno, seu ataque não pode ser bloqueado por esse oponente neste turno",
          "2": "Alem de nao poder bloquear, sua esquiva confunde o alvo que nao pode te ter como alvo nesse turno",
          "3": "Esquivar de um golpe lhe consede uma ação de ataque com essa arma que acontecem na mesma ação"
        }
      },
      {
        "id": "galantear",
        "nome": "GALANTEAR",
        "maxLevel": 3,
        "niveis": {
          "1": "3 bloqueios contra o mesmo alvo na mesma cena pode lançar sua arma a 3 metros de distância",
          "2": "Redireciona o ataque de um oponente a outro alvo que não seja ele mesmo",
          "3": "Você tem o custo de 1 de ENERGIA para ativar todas as habilidades da Maestria Espada curta por ação"
        }
      }
    ]
  },
  {
    "id": "escudo_largo",
    "nome": "ESCUDO LARGO",
    "categoria": "ESCUDOS",
    "skills": [
      {
        "id": "confronto",
        "nome": "CONFRONTO",
        "maxLevel": 3,
        "niveis": {
          "1": "Soma Vigor no bloqueio e causa 2 de pressão",
          "2": "Se estiver perdendo no bloqueio, soma Robustez",
          "3": "Se perder no bloqueio, soma a diferença do resultado em seus bloquios durante cena. O limite maximo dessa diferença que pode ser somada é sua Robustez"
        }
      },
      {
        "id": "bloqueador",
        "nome": "BLOQUEADOR",
        "maxLevel": 3,
        "niveis": {
          "1": "Pode bloquear ataques realizados pelas costas e soma briga no bloqueio se este for menor.",
          "2": "Tem uma ação extra de bloqueio por turno com esta arma.",
          "3": "Golpes recebidos no corpo podem contar como bloqueio se estiver de armadura"
        }
      },
      {
        "id": "estabilizar",
        "nome": "ESTABILIZAR",
        "maxLevel": 3,
        "niveis": {
          "1": "Causa 5 de penalidade para a proxima ação do alvo bloqueado e causa 2 de pressão",
          "2": "Se o seu bloqueio for maior o oponente sofre 2 de pressão e cai no chão",
          "3": "Ganhar um bloqueio de um alvo reduz uma ação desse alvo nesse turno."
        }
      }
    ]
  },
  {
    "id": "escudo_tatico",
    "nome": "ESCUDO TATICO",
    "categoria": "ESCUDOS",
    "skills": [
      {
        "id": "empurrar",
        "nome": "EMPURRAR",
        "maxLevel": 3,
        "niveis": {
          "1": "Depois do bloquio, empurra o alvo 4 metros na direcao do golpe, aplica 2 de pressão",
          "2": "Se o oponente se chocar com algum obstaculo, o derruba e aplica 2 de pressão",
          "3": "Sempre derruba o alvo, o mesmo não se move por 3 turnos."
        }
      },
      {
        "id": "estabilizar",
        "nome": "ESTABILIZAR",
        "maxLevel": 3,
        "niveis": {
          "1": "Causa 5 de penalidade para a proxima ação do alvo bloqueado e causa 2 de pressão",
          "2": "Se o seu bloqueio for maior o oponente sofre 2 de pressão e cai no chão",
          "3": "Ganhar um bloqueio de um alvo reduz uma ação desse alvo nesse turno."
        }
      },
      {
        "id": "escudeiro",
        "nome": "ESCUDEIRO",
        "maxLevel": 3,
        "niveis": {
          "1": "Impossibilita o oponente de esquivar no turno, se o resultado dessa ação for realizar um bloqueio nesse turno, ganha 3 de movimento.",
          "2": "Faz com que o alvo bloqueado tenha 10 de penalidade para esquivar ou conjurar magias na cena",
          "3": "Enquanto tiver ações que permitam bloquear no turno, o movimento não é um impeditivo para que alcance e bloqueie um alvo."
        }
      }
    ]
  },
  {
    "id": "machado_do_norte",
    "nome": "MACHADO DO NORTE",
    "categoria": "MACHADOS",
    "skills": [
      {
        "id": "fatiador",
        "nome": "FATIADOR",
        "maxLevel": 3,
        "niveis": {
          "1": "Soma no Dano/Bloqueio sua armas brancas. Causa 2 de pressão",
          "2": "Causa 2 de pressão. No turno em que os equipamento de um alvo quebrar a armadura nao e considerada",
          "3": "Duplica os efeitos dos niveis 1 e 2"
        }
      },
      {
        "id": "confronto",
        "nome": "CONFRONTO",
        "maxLevel": 3,
        "niveis": {
          "1": "Soma Vigor no bloqueio e causa 2 de pressão",
          "2": "Se estiver perdendo no bloqueio, soma Robustez",
          "3": "Se perder no bloqueio, soma a diferença do resultado em seus bloqueios durante cena. O limite maximo dessa diferença que pode ser somada é sua Robustez"
        }
      },
      {
        "id": "empurrar",
        "nome": "EMPURRAR",
        "maxLevel": 3,
        "niveis": {
          "1": "Depois do bloquio, empurra o alvo 4 metros na direcao do golpe, aplica 2 de pressão",
          "2": "Se o oponente se chocar com algum obstaculo, o derruba e aplica 2 de pressão",
          "3": "Sempre derruba o alvo, o mesmo não se move por 3 turnos."
        }
      }
    ]
  },
  {
    "id": "machado_do_sul",
    "nome": "MACHADO DO SUL",
    "categoria": "MACHADOS",
    "skills": [
      {
        "id": "aparar",
        "nome": "APARAR",
        "maxLevel": 3,
        "niveis": {
          "1": "Se um bloqueio for acontecer, o poderdo bloqueio do adversário é cortado pela metade. Todos os demais efeitos de contato são considerados",
          "2": "Soma ESPORTES em acertos e esquiva sobre um oponente que aparou nessa cena",
          "3": "Aparar um golpe lhe consede uma ação de ataque com essa arma que acontece na mesma ação"
        }
      },
      {
        "id": "estabilizar",
        "nome": "ESTABILIZAR",
        "maxLevel": 3,
        "niveis": {
          "1": "Causa 5 de penalidade para a proxima ação do alvo bloqueado e causa 2 de pressão",
          "2": "Se o seu bloqueio for maior o oponente sofre 2 de pressão e cai no chão",
          "3": "Ganhar um bloqueio de um alvo reduz uma ação desse alvo nesse turno."
        }
      },
      {
        "id": "arremessador",
        "nome": "ARREMESSADOR",
        "maxLevel": 3,
        "niveis": {
          "1": "Se o dano a vida do alvo for igual a 0, aplica 2 de pressão. Soma armas brancas em teste de arremessos.",
          "2": "Causa sangramento mesmo sem causar dano desde que acerte o alvo",
          "3": "Causa +20 de Dano corpo a corpo, -2 de dano por metro"
        }
      }
    ]
  },
  {
    "id": "lanca",
    "nome": "LANÇA",
    "categoria": "ARMAS LONGAS",
    "skills": [
      {
        "id": "estocada",
        "nome": "ESTOCADA",
        "maxLevel": 3,
        "niveis": {
          "1": "Só pode ser bloqueado por escudos, 1 de alcance e perfura o alvo de trás se estiver no alcance",
          "2": "2 de pressão, se for bloqueado ou acerto contra esquiva causa 4 de pressão",
          "3": "Dobra os efeitos de pressão dessa arma"
        }
      },
      {
        "id": "empurrar",
        "nome": "EMPURRAR",
        "maxLevel": 3,
        "niveis": {
          "1": "Depois do bloquio, empurra o alvo 4 metros na direcao do golpe, aplica 2 de pressão",
          "2": "Se o oponente se chocar com algum obstaculo, o derruba e aplica 2 de pressão",
          "3": "Sempre derruba o alvo, o mesmo não se move por 3 turnos."
        }
      },
      {
        "id": "lancelot",
        "nome": "LANCELOT",
        "maxLevel": 3,
        "niveis": {
          "1": "Com a mesma arma pode-se atacar um alvo e se defender de outro no mesmo turno",
          "2": "Consede 1 de alcance e aumenta o dano em 5 para cada metros de distancia. Pode usar armas brancas para arremesso a distancia",
          "3": "Duplica os efeitos dos niveis anteriores"
        }
      }
    ]
  },
  {
    "id": "correntes",
    "nome": "CORRENTES",
    "categoria": "ARMAS LONGAS",
    "skills": [
      {
        "id": "agarrar",
        "nome": "AGARRAR",
        "maxLevel": 3,
        "niveis": {
          "1": "Instantaneamente agarra o alvo, toda vez que o alvo tentar remover aplica 2 de pressão em todos os equipamentos. O alvo não pode se mover enquanto agarrado",
          "2": "Soma Esporte no duelo fisico, aplica 2 de pressão. O alvo tem 10 de penalidade para outras ações que não tentar se soltar.",
          "3": "Depois de 3 turnos em que o alvo tentar se soltar ou não, ele recebe os status DESMAIADO"
        }
      },
      {
        "id": "alcance",
        "nome": "ALCANCE",
        "maxLevel": 3,
        "niveis": {
          "1": "Fornece +5 de alcance",
          "2": "Soma Investigação em testes de acerto para alvos que já foram acertados nessa cena e Instinto para alvos que ainda não foram.",
          "3": "Possibilita atingir alvo atras de obstaculos simples, defensores e afins. Recebe + 5 de alcance"
        }
      },
      {
        "id": "devastador",
        "nome": "DEVASTADOR",
        "maxLevel": 3,
        "niveis": {
          "1": "Acerta 2 casas proximas de alcance em sua volta por golpe",
          "2": "Acerta 3 casas proximas em sua volta por golpe. Somente Escudos podem parar a execução completa dessa habilidade",
          "3": "Giro em volta de si, acerta todos em sua volta por ação de ataque"
        }
      }
    ]
  },
  {
    "id": "arco_longo",
    "nome": "ARCO LONGO",
    "categoria": "ARCOS",
    "skills": [
      {
        "id": "foco",
        "nome": "FOCO",
        "maxLevel": 3,
        "niveis": {
          "1": "25% de chance de encontrar brecha na armadura do oponente",
          "2": "Aumenta para 50% efeito do nivel 1 e amplifica em 2 de efeito de sangramento e duração de veneno",
          "3": "Aumenta para 100% efeito do nivel 1 / +10 sucessos contra alvos que nao estejam cientes da sua presença"
        }
      },
      {
        "id": "alcance",
        "nome": "ALCANCE",
        "maxLevel": 3,
        "niveis": {
          "1": "Fornece +5 de alcance",
          "2": "Soma Investigação em testes de acerto para alvos que já foram acertados nessa cena e Instinto para alvos que ainda não foram.",
          "3": "Possibilita atingir alvo atras de obstaculos simples, defensores e afins. Recebe + 5 de alcance"
        }
      },
      {
        "id": "quick_draw",
        "nome": "QUICK DRAW",
        "maxLevel": 3,
        "niveis": {
          "1": "Possibilita dois ATKs no mesmo alvo / turno",
          "2": "Você pode fazer uso de itens da bag como ação adicional no mesmo turno",
          "3": "Possibilita dois ATKs em alvos diferentes / turno"
        }
      }
    ]
  },
  {
    "id": "besta",
    "nome": "BESTA",
    "categoria": "ARCOS",
    "skills": [
      {
        "id": "atirador",
        "nome": "ATIRADOR",
        "maxLevel": 3,
        "niveis": {
          "1": "Se o dano a vida do alvo for igual a 0, aplica 2 de pressão. Soma armas brancas em teste de arremessos.",
          "2": "Desde que acerte o alvo, causa sangramento e evenenamento mesmo sem causar dano",
          "3": "Causa +20 de Dano corpo a corpo, -2 de dano por metro"
        }
      },
      {
        "id": "foco",
        "nome": "FOCO",
        "maxLevel": 3,
        "niveis": {
          "1": "25% de chance de encontrar brecha na armadura do oponente",
          "2": "Aumenta para 50% efeito do nivel 1 e amplifica em 2 de efeito de sangramento e duração de veneno",
          "3": "Aumenta para 100% efeito do nivel 1 / +10 sucessos contra alvos que nao estejam cientes da sua presença"
        }
      },
      {
        "id": "perfurador",
        "nome": "PERFURADOR",
        "maxLevel": 3,
        "niveis": {
          "1": "Ignora 10 de Armor",
          "2": "Causa dano total ao alvo detras do alvo acertado",
          "3": "Ignora 40 de armor"
        }
      }
    ]
  },
  {
    "id": "adaga",
    "nome": "ADAGA",
    "categoria": "ARMAS CURTAS",
    "skills": [
      {
        "id": "foco",
        "nome": "FOCO",
        "maxLevel": 3,
        "niveis": {
          "1": "25% de chance de encontrar brecha na armadura do oponente",
          "2": "Aumenta para 50% efeito do nivel 1 e amplifica em 2 de efeito de sangramento e duração de veneno",
          "3": "Aumenta para 100% efeito do nivel 1 / Dobra efeito de veneno e quantidade de sangramento do alvo."
        }
      },
      {
        "id": "critico",
        "nome": "CRITICO",
        "maxLevel": 3,
        "niveis": {
          "1": "Acertar um alvo causa 1 sangramento adicional. Você soma 2 para cada 1 de sangramento ou envenenamento em testes de DESTREZA contra um alvo que esteja sob essas condições.",
          "2": "Se acertar pelas costas, aplica efeito de contato novamente (físicos e magicos)",
          "3": "Você adquire os benefícios do level 1 dessa habilidade considerando a soma de condições de todos os alvos das cena e durante toda a cena."
        }
      },
      {
        "id": "ataque_sorrateiro",
        "nome": "ATAQUE SORRATEIRO",
        "maxLevel": 3,
        "niveis": {
          "1": "Se realizar uma esquiva com sucesso nesse turno, seu ataque não pode ser bloqueado por esse oponente neste turno",
          "2": "Alem de nao poder bloquear, sua esquiva confunde o alvo que nao pode te ter como alvo nesse turno",
          "3": "Esquivar de um golpe lhe consede uma ação de ataque com essa arma que acontecem na mesma ação"
        }
      }
    ]
  },
  {
    "id": "luvas_de_batalha",
    "nome": "LUVAS DE BATALHA",
    "categoria": "ARMAS CURTAS",
    "skills": [
      {
        "id": "fighter",
        "nome": "FIGHTER",
        "maxLevel": 3,
        "niveis": {
          "1": "Permite o equipamento de uma arma na bota que realiza ações normalmente, inclusive habilidades da arma equipada. Não concede ação extra.",
          "2": "Soma Briga em testes de esquiva, acerto e dano. Possibilita canalizar um golpe gastando 2 ações consecutivas. Esta concede 3x o dano final.",
          "3": "Possibilita cancelar uma ação após mesmo depois da escolha do oponente, ambos perdem aquela ação"
        }
      },
      {
        "id": "agarrar",
        "nome": "AGARRAR",
        "maxLevel": 3,
        "niveis": {
          "1": "Instantaneamente agarra o alvo, toda vez que o alvo tentar remover aplica 2 de pressão em todos os equipamentos. O alvo não pode se mover enquanto agarrado",
          "2": "Soma Esporte no duelo fisico, aplica 2 de pressão. O alvo tem 10 de penalidade para outras ações que não tentar se soltar.",
          "3": "Depois de 3 turnos em que o alvo tentar se soltar ou não, ele recebe os status DESMAIADO"
        }
      },
      {
        "id": "fatiador",
        "nome": "FATIADOR",
        "maxLevel": 3,
        "niveis": {
          "1": "Soma no Dano/Bloqueio sua armas brancas. Causa 2 de pressão",
          "2": "Causa 2 de pressão. No turno em que os equipamento de um alvo quebrar a armadura nao e considerada",
          "3": "Duplica os efeitos dos niveis 1 e 2"
        }
      }
    ]
  },
  {
    "id": "cetro_aghanim",
    "nome": "CETRO AGHANIM",
    "categoria": "CETROS MÁGICOS",
    "skills": [
      {
        "id": "incursao",
        "nome": "INCURSÃO",
        "maxLevel": 3,
        "niveis": {
          "1": "Em duelo magico soma Clarividência, o oponente perde 1 MANA e 1 ENERGIA",
          "2": "Possibilita conjurar uma magia que não sera usada naquele momento e poderá ser utilizada posteriormente com uma ação extra. A magia utilizada dessa forma dura quanto ela poderia durar normalmente.",
          "3": "Se uma magia que tem um alvo possui INTENSIDADE a mais do que o necessário para executar sua tarefa, ela pode na mesma ação ter outro alvo e o atingir com esse restante de intensidade até que sua intensidade seja totalmente usada."
        }
      },
      {
        "id": "ascensao",
        "nome": "ASCENSÃO",
        "maxLevel": 3,
        "niveis": {
          "1": "Soma inteligência na intensidade magica.",
          "2": "Adiciona um circulo na proxima magia (pode dobrar o alcance ou dobrar a intensidade)",
          "3": "Replica uma magia utilizada na cena com mesma intensidade e efeito"
        }
      },
      {
        "id": "serenidade",
        "nome": "SERENIDADE",
        "maxLevel": 3,
        "niveis": {
          "1": "O próximo teste MENTAL utiliza CONCENTRAÇÃO",
          "2": "Adiciona 3 durações na proxima magia e alcance de 10 metros",
          "3": "Aumenta em 5 metros o raio da próxima magia"
        }
      }
    ]
  },
  {
    "id": "bastao_natural",
    "nome": "BASTÃO NATURAL",
    "categoria": "CETROS MÁGICOS",
    "skills": [
      {
        "id": "serenidade",
        "nome": "SERENIDADE",
        "maxLevel": 3,
        "niveis": {
          "1": "O próximo teste MENTAL utiliza CONCENTRAÇÃO",
          "2": "Adiciona 3 durações na proxima magia e alcance de 10 metros",
          "3": "Aumenta em 5 metros o raio da próxima magia"
        }
      },
      {
        "id": "beleza_magica",
        "nome": "BELEZA MAGICA",
        "maxLevel": 3,
        "niveis": {
          "1": "MANA e FORÇA DE VONTADE podem ser utilizados da mesma maneira",
          "2": "Sua MAGIAS aplicam + 10 de DETERMINAÇÃO",
          "3": "Aumenta em 3 graus a resistência a testes SOCIAS e a condição IMUNIDADE MAGICA"
        }
      },
      {
        "id": "canalizar",
        "nome": "CANALIZAR",
        "maxLevel": 3,
        "niveis": {
          "1": "Transfere 1 de mana por nível do item entre dois alvos ao toque e pode trocar o tipo de elemento de um alvo por outro que controle.",
          "2": "Consegue utilizar o nível anterior a distância igual a sua CLARIVIDÊNCIA + MAGIA. Absorve magia a transformando em MANA igual ao custo da mesma para ser conjurada.",
          "3": "Transfere mana de multiplos alvos com total e número de alvos igual a sua INTELIGÊNCIA"
        }
      }
    ]
  },
  {
    "id": "varinha_ifurita",
    "nome": "VARINHA IFURITA",
    "categoria": "VARINHAS",
    "skills": [
      {
        "id": "potencia",
        "nome": "POTENCIA",
        "maxLevel": 3,
        "niveis": {
          "1": "sua magia causa 2 de pressão e remove encantamentos",
          "2": "Suas magias que não imobilizam ou controlam um alvo o arremessam igual a sua intensidade. Se for maior que 3 o alvo cai.",
          "3": "Causa 20 de Dano corpo a corpo, -2 de dano por metro afastado."
        }
      },
      {
        "id": "ascensao",
        "nome": "ASCENSÃO",
        "maxLevel": 3,
        "niveis": {
          "1": "Soma magia na intensidade magica.",
          "2": "Adiciona um circulo na proxima magia (pode dobrar o alcance ou dobrar a intensidade)",
          "3": "Replica uma magia utilizada na cena com mesma intensidade e efeito"
        }
      },
      {
        "id": "master_casting",
        "nome": "MASTER CASTING",
        "maxLevel": 3,
        "niveis": {
          "1": "Magias não necessitam de gestos ou frases para conjuração",
          "2": "Ganha uma ação extra para conjurar uma magia",
          "3": "Uma magia pode ter um alvo adicional ou a magia pode ter 1 de raio adicional"
        }
      }
    ]
  },
  {
    "id": "varinha_retorcida",
    "nome": "VARINHA RETORCIDA",
    "categoria": "VARINHAS",
    "skills": [
      {
        "id": "canalizar",
        "nome": "CANALIZAR",
        "maxLevel": 3,
        "niveis": {
          "1": "Transfere 1 de mana por nível do item entre dois alvos ao toque e pode trocar o tipo de elemento de um alvo por outro que controle.",
          "2": "Consegue utilizar o nível anterior a distância igual a sua CLARIVIDÊNCIA + MAGIA. Absorve magia a transformando em MANA igual ao custo da mesma para ser conjurada.",
          "3": "Transfere mana de multiplos alvos com total e número de alvos igual a sua INTELIGÊNCIA"
        }
      },
      {
        "id": "incursao",
        "nome": "INCURSÃO",
        "maxLevel": 3,
        "niveis": {
          "1": "Em duelo magico soma Clarividência, o oponente perde 1 MANA e 1 ENERGIA",
          "2": "Possibilita conjurar uma magia que não sera usada naquele momento e poderá ser utilizada posteriormente com uma ação extra. A magia utilizada dessa forma dura quanto ela poderia durar normalmente.",
          "3": "Se uma magia que tem um alvo possui INTENSIDADE a mais do que o necessário para executar sua tarefa, ela pode na mesma ação ter outro alvo e o atingir com esse restante de intensidade até que sua intensidade seja totalmente usada."
        }
      },
      {
        "id": "master_casting",
        "nome": "MASTER CASTING",
        "maxLevel": 3,
        "niveis": {
          "1": "Magias não necessitam de gestos ou frases para conjuração",
          "2": "Ganha uma ação extra para conjurar uma magia",
          "3": "Uma magia pode ter um alvo adicional ou a magia pode ter 1 de raio adicional"
        }
      }
    ]
  },
  {
    "id": "guia_do_instrutor",
    "nome": "GUIA DO INSTRUTOR",
    "categoria": "SUPORTE DE CAMPO",
    "skills": [
      {
        "id": "analista",
        "nome": "ANALISTA",
        "maxLevel": 3,
        "niveis": {
          "1": "Analisa materias sabendo seu nível e valores. Soma CIÊNCIAS em testes de OFÍCIOS",
          "2": "Se tiver sucesso em um teste social contra um alvo, diminui a dificuldade em 2 graus para outros testes sociais contra esse mesmo alvo durante a cena",
          "3": "Durante esse turno, sempre que um aliado tem sucesso em um teste esse sucesso é um crítico, sempre que ele erra o teste o próximo teste da mesma natureza soma 5 sucessos."
        }
      },
      {
        "id": "viajante",
        "nome": "VIAJANTE",
        "maxLevel": 3,
        "niveis": {
          "1": "Testes para encontrar comida, abrigo, direção ou um alvo que se tem uma pista são sempre o mínimo.",
          "2": "Reconhece atalhos podendo reduzir encontros e tempo de viagem pela metade.",
          "3": "Se um aliado tivesse uma falha crítica em testes de INVESTIGAÇÃO, PERFORMANCE ou OFÍCIOS ele se torna apenas um fracasso. Todos os testes de OFÍCIOS produzem o dobro de recursos"
        }
      },
      {
        "id": "pesquisador",
        "nome": "PESQUISADOR",
        "maxLevel": 3,
        "niveis": {
          "1": "Analisa propriedades de itens identificando quais são os ingredientes e habilidades (necessário ter o level de maestria)",
          "2": "Consegue executar produtos da profissão 1 nível acima do seu nível atual. É necessário ao menos ter o nível 1.",
          "3": "Ao executar uma criação de profissão o item recebe uma habilidade adicional e única."
        }
      }
    ]
  },
  {
    "id": "luvas_precisas_do_artesao",
    "nome": "LUVAS PRECISAS DO ARTESÃO",
    "categoria": "SUPORTE DE CAMPO",
    "skills": [
      {
        "id": "construtor",
        "nome": "CONSTRUTOR",
        "maxLevel": 3,
        "niveis": {
          "1": "Esta arma é um canivete de ferramentas que funciona para qualquer profissão.",
          "2": "Por 1 de custo, trabalha, colheta ou cria 2 itens de uma mesma profissão. Nunca perde ingredientes em sua construção, recupera todos os itens em reforja",
          "3": "Na criação de um item considera o ingrediente de level mais alto"
        }
      },
      {
        "id": "pesquisador",
        "nome": "PESQUISADOR",
        "maxLevel": 3,
        "niveis": {
          "1": "Analisa propriedades de itens identificando quais são os ingredientes e habilidades (necessário ter o level de maestria)",
          "2": "Consegue executar produtos da profissão 1 nível acima do seu nível atual. É necessário ao menos ter o nível 1.",
          "3": "Ao executar uma criação de profissão o item recebe uma habilidade adicional e única."
        }
      },
      {
        "id": "agarrar",
        "nome": "AGARRAR",
        "maxLevel": 3,
        "niveis": {
          "1": "Instantaneamente agarra o alvo, toda vez que o alvo tentar remover aplica 2 de pressão em todos os equipamentos. O alvo não pode se mover enquanto agarrado",
          "2": "Soma Esporte no duelo fisico, aplica 2 de pressão. O alvo tem 10 de penalidade para outras ações que não tentar se soltar.",
          "3": "Depois de 3 turnos em que o alvo tentar se soltar ou não, ele recebe os status DESMAIADO"
        }
      }
    ]
  },
  {
    "id": "teremim_runico",
    "nome": "TEREMIM RUNICO",
    "categoria": "SUPORTE MÁGICO",
    "skills": [
      {
        "id": "analista",
        "nome": "ANALISTA",
        "maxLevel": 3,
        "niveis": {
          "1": "Analisa materias sabendo seu nível e valores. Soma CIÊNCIAS em testes de OFÍCIOS",
          "2": "Se tiver sucesso em um teste social contra um alvo, diminui a dificuldade em 2 graus para outros testes sociais contra esse mesmo alvo durante a cena",
          "3": "Durante esse turno, sempre que um aliado tem sucesso em um teste esse sucesso é um crítico, sempre que ele erra o teste o próximo teste da mesma natureza soma 5 sucessos."
        }
      },
      {
        "id": "cancao_de_galar_que_inveja_os_infieis",
        "nome": "CANÇÃO DE GALAR, que inveja os infiéis",
        "maxLevel": 3,
        "niveis": {
          "1": "Se vencer um teste social contra um alvo, esse oponente só pode ter um único alvo como foco que é escolhido por você. O oponente pode testar com uma ação sua DETERMINAÇÃO para sair desse transe",
          "2": "Todos os alvos Se tornam MOTIVADOS ou INTERESSADOS se já estiverem PERSUADIDOS. A resistência SOCIAL de todos é reduzida em 2 graus. Alvos devem testar DETERMINAÇÃO para atacar ou causar dano em outros. Alguem que sofre dano cancela esse efeito",
          "3": "Alvos MOTIVADOS ou INTERESSADOS recebem bonus em todos os testes igual a sua EXPRESSÃO + EMPATIA"
        }
      },
      {
        "id": "beleza_magica",
        "nome": "BELEZA MAGICA",
        "maxLevel": 3,
        "niveis": {
          "1": "MANA e FORÇA DE VONTADE podem ser utilizados da mesma maneira",
          "2": "Sua MAGIAS aplicam + 10 de DETERMINAÇÃO",
          "3": "Aumenta em 3 graus a resistência a testes SOCIAS e a condição IMUNIDADE MAGICA"
        }
      }
    ]
  },
  {
    "id": "diapasao_runico",
    "nome": "DIAPASÃO RUNICO",
    "categoria": "SUPORTE MÁGICO",
    "skills": [
      {
        "id": "viajante",
        "nome": "VIAJANTE",
        "maxLevel": 3,
        "niveis": {
          "1": "Testes para encontrar comida, abrigo, direção ou um alvo que se tem uma pista são sempre o mínimo.",
          "2": "Reconhece atalhos podendo reduzir encontros e tempo de viagem pela metade.",
          "3": "Se um aliado tivesse uma falha crítica em testes de INVESTIGAÇÃO, PERFORMANCE ou OFÍCIOS ele se torna apenas um fracasso. Todos os testes de OFÍCIOS produzem o dobro de recursos"
        }
      },
      {
        "id": "canalizar",
        "nome": "CANALIZAR",
        "maxLevel": 3,
        "niveis": {
          "1": "Transfere 1 de mana entre dois alvos ao toque e pode trocar o tipo de elemento de um alvo por outro que controle.",
          "2": "Consegue utilizar o nível anterior a distância igual a sua CLARIVIDÊNCIA + MAGIA. Absorve magia a transformando em MANA igual ao custo da mesma para ser conjurada.",
          "3": "Transfere mana de multiplos alvos com total e número de alvos igual a sua INTELIGÊNCIA"
        }
      },
      {
        "id": "cancao_do_soberano",
        "nome": "CANÇÃO DO SOBERANO",
        "maxLevel": 3,
        "niveis": {
          "1": "Consegue convocar montarias a mais de 10km e encantar animais proximos para executar ações simples. Consegue realizar testes sociais com animais irracionais",
          "2": "Um animal hostil pode se tornar neutro se vencer um teste social. O mesmo vale de neutro para pacifico. Pode dar ordens simples de uma palavra, mas jamais o alvo se colocará em risco por você. Dura 1 dia",
          "3": "Um alvo animal comprende o dialeto dos sons emitidos por você e, se ele for capaz, consegue executar ordens complexas. Ele obedece a ordens moderadas se colocando em algum risco. Dura 1 dia"
        }
      }
    ]
  },
  {
    "id": "cordas_angelicais",
    "nome": "CORDAS ANGELICAIS",
    "categoria": "SUPORTE CERIMONIAL",
    "skills": [
      {
        "id": "cancao_de_calor_que_encanta_o_coracao",
        "nome": "CANÇÃO DE CALOR, que encanta o coração",
        "maxLevel": 3,
        "niveis": {
          "1": "Consede 5 de DETERMINAÇÃO e recupera 1 FV de outros membros do grupo e concede a condição MOTIVADO",
          "2": "Aumenta uma perícia de um alvo/aliados por uma cena igual a sua Empatia. Remove a condição CANSADO de aliados por um turno",
          "3": "Usado pela manhã, torna os alvos MOTIVADOS, usado a tarde mata a fome (só pode ser usado novamente depois do alvo se alimentar), usado a noite dobra as regenerações."
        }
      },
      {
        "id": "cancao_de_galar_que_inveja_os_infieis",
        "nome": "CANÇÃO DE GALAR, que inveja os infiéis",
        "maxLevel": 3,
        "niveis": {
          "1": "Se vencer um teste social contra um alvo, esse oponente só pode ter um único alvo como foco que é escolhido por você. O oponente pode testar com uma ação sua DETERMINAÇÃO para sair desse transe",
          "2": "Todos os alvos Se tornam MOTIVADOS ou INTERESSADOS se já estiverem PERSUADIDOS. A resistência SOCIAL de todos é reduzida em 2 graus. Alvos devem testar DETERMINAÇÃO para atacar ou causar dano em outros. Alguem que sofre dano cancela esse efeito",
          "3": "Alvos MOTIVADOS ou INTERESSADOS recebem bonus em todos os testes igual a sua EXPRESSÃO + EMPATIA"
        }
      },
      {
        "id": "cancao_da_majestade",
        "nome": "CANÇÃO DA MAJESTADE",
        "maxLevel": 3,
        "niveis": {
          "1": "Soma SUA linguistica em testes sociais dos outros membros do grupo/ altera em 1 grau a resistência SOCIAL de um alvo. Sua DETERMINAÇÃO se torna a determinação de um alvo",
          "2": "Nesse turno aliados/alvo podem usar FV para ativar habilidades/magias. Você pode usar a sua FV para que aliados ativem suas habilidades/magias",
          "3": "Aumenta ou diminui a em 5 graus a resistência SOCIAL de um alvo. Aumenta ou diminui a resistência de todos os alvos em 3"
        }
      }
    ]
  },
  {
    "id": "sopros_falenos",
    "nome": "SOPROS FALENOS",
    "categoria": "SUPORTE CERIMONIAL",
    "skills": [
      {
        "id": "cancao_amarga_que_causa_tristeza_e_solidao",
        "nome": "CANÇÃO AMARGA, que causa tristeza e solidão",
        "maxLevel": 3,
        "niveis": {
          "1": "Causa a condição DESMOTIVADO em todos os alvos na cena. Alvos que já estiverem INFECTADOS ou CANSADOS podem até mesmo ADOECER",
          "2": "Causa perda de FV igual a HUMANIDADE do alvo. Causa em um alvo a condição INTIMIDADO. Este tende a fugir do evento. Este pode testar DETERMINAÇÃO para ignorar ou gastar 1 FV",
          "3": "Encerra conflitos sociais e condições sociais em todos alvos os tornando neutros ou causa terror aplicando a condição ATERRORIZADO em todos que já possuirem a condição IMTIMIDADO por pelos menos 2 turnos"
        }
      },
      {
        "id": "cancao_de_ninar_que_acalma_a_mente",
        "nome": "CANÇÃO DE NINAR, que acalma a mente",
        "maxLevel": 3,
        "niveis": {
          "1": "Acalma o alvo ou alvos neutralizando efeitos positivos ou negativos de qualquer origem que afetem condições SOCIAIS. Se usado em funerais pode recuperar HUMANIDADE dos arrependidos.",
          "2": "Causa a um alvo a condição DESMOTIVADO. Alvos que perderem toda a FV entram em um sono tendo que testar 1x a cada turno sua CONSCIÊNCIA para voltar a si",
          "3": "Alvos que dormem delicadamente com essa musíca podem escolher um recursos dentre ENERGIA, MANA ou FV para recuperar 100% desde que tenha se alimentado nesse dia."
        }
      },
      {
        "id": "cancao_do_soberano",
        "nome": "CANÇÃO DO SOBERANO",
        "maxLevel": 3,
        "niveis": {
          "1": "Consegue convocar montarias a mais de 10km e encantar animais proximos para executar ações simples. Consegue realizar testes sociais com animais irracionais",
          "2": "Um animal hostil pode se tornar neutro se vencer um teste social. O mesmo vale de neutro para pacifico. Pode dar ordens simples de uma palavra, mas jamais o alvo se colocará em risco por você. Dura 1 dia",
          "3": "Um alvo animal comprende o dialeto dos sons emitidos por você e, se ele for capaz, consegue executar ordens complexas. Ele obedece a ordens moderadas se colocando em algum risco. Dura 1 dia"
        }
      }
    ]
  }
];

export const TRAILS_MAGIAS = [
  {
    "id": "arcano",
    "nome": "ARCANO",
    "skills": [
      {
        "id": "orientacao",
        "nome": "ORIENTAÇÃO",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 10,
            "raio": null,
            "efeito": "O conjurador sabe imediatamente a direção do Norte verdadeiro, horário do dia e sentido dos ventos, direção mais rápida para chegar ao mar e coisas do tipo. Tem facilidades ainda em focar suas buscas quando estiver procurando por comida, rastros, água, objetos ou até pessoas. Dessa forma pode somar CIÊNCIAS em testes de INVESTIGAÇÃO. Além disso ele pode ver no escuro."
          },
          "2": {
            "custo": 3,
            "alcance": 100,
            "raio": null,
            "efeito": "Agora os sentidos do conjurador tem influência em testes sociais para esconder informações ou ler seus adversários Tendo vantagens em 1 grau e dando desvantagem de 1 grau a seus oponentes que o tem como alvo. Seu sentido é tão apurado que sempre terá prioridade em iniciativa de ações quando desejar, ou seja, realizará sua ação antes de todos."
          },
          "3": {
            "custo": 5,
            "alcance": 10000,
            "raio": null,
            "efeito": "O conjurador aprimora seus sentidos diminuindo em 2 graus a dificuldade de qualquer teste envolvendo percepção ou o uso dos sentidos para busca. Em locais em que não detem seus sentidos em plenitude ainda consegue obter infomação sobre a direção a seguir desde que consiga alguma informação para se orientar (sons, iluminação, estrelas, ruido, aromas ou afins). Pode sentir odores e rastreá-los por quilometros assim como ouvir ruídos específicos caso saiba o que procurar. Apesar disso, só consegue entender palavras com precisão em até 500 metros."
          }
        }
      },
      {
        "id": "anular",
        "nome": "ANULAR",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": "Cria um manto magico visível, quase transparente que ao entrar em contato com outra magia ambas se anulam instantaneamente. Além disso, alvos, criaturas, pessoas ou quaisquer objetos encantados com elementos que atravessarem esse manto de anulação são instantaneamente desencantados enquanto o manto prevalece ativo. O manto pode permanecer estatico onde foi conjurado ou simplesmente envolver um alvo especifico que, se em movimento, acompanha o movimento do alvo que foi envolto."
          },
          "2": {
            "custo": 3,
            "alcance": 10,
            "raio": 1,
            "efeito": "Nesse nível o conjurador consegue envolver os alvos em um raio de até 1. Porém o manto anula até 3 magias antes de ser desfeito (3 cargas de anulação). Além disso encantamentos elementais são anulados sem que o manto seja danificado ou perca suas cargas de anulação. Testes sociais realizados contra alguém protegido pelo manto tem seu grau de dificuldade aumento em 1. Os mantos agora são invisíveis."
          },
          "3": {
            "custo": 5,
            "alcance": 20,
            "raio": 2,
            "efeito": "O conjurador consegue agora, com apenas 1 ação escolher até 3 alvos/ áreas que serão protegidos pelos mantos, um mesmo alvo pode ser protegido as 3 vezes. Esses mantos em 5 cargas de anulação e tornam os objetos dentro deles invisíveis."
          }
        }
      },
      {
        "id": "revigorar",
        "nome": "REVIGORAR",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": "Uma energia mágia envolve um alvo antes de ser absorvida por ele garantindo resistência a sangramentos, venenos e efeitos elementais, não os anula se já estiver sob algum desses efeitos. Além disso aumenta seu deslocamento e testes em esportes em 3. Anula a condição CANSADO por uma cena e Aumenta sua resistência contra testes sociais em 1 grau."
          },
          "2": {
            "custo": 3,
            "alcance": 5,
            "raio": null,
            "efeito": "A energia agora encanta um alvo fortalecendo sua próxima magia com 1 circulo magico que pode ser usado para dobrar o alcance ou aumentar sua intensidade. Anula a condição DOENTE por uma cena e finaliza as condições INTIMIDADO, PERSUADIDO ou ENGANADO. Deslocamento e testes em esportes são agora aumentados em 10"
          },
          "3": {
            "custo": 5,
            "alcance": 10,
            "raio": null,
            "efeito": "Durante a cena em que o alvo recebe a energia é adquirido uma vontade indomável podendo usar VIDA ao invés de ENERGIA, FORÇA DE VONTADE ou MANA para usar suas habilidaes, porém nenhuma fonte pode causar a ele recuperação de VIDA enquanto durar esse efeito. Além disso o alvo usa ROBUSTEZ para testes físicos, DETERMINAÇÃO para testes sociais e CONCIÊNCIA para testes mentais. Nenhuma CONDIÇÃO negativa pode ser adquirida e se houvesse alguma é anulada instântaneamente. Se a VIDA do alvo chegar a zero a magia perde o efeito. O alvo perde 5 de VIDA por turno"
          }
        }
      },
      {
        "id": "aura_notavel",
        "nome": "AURA NOTÁVEL",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": "Uma aura envolve um alvo enaltecendo sua beleza e causando uma atração ou repulsão sobrenatural a outros individuos. Estes evitam atacar ou atacam impulsivamente dependendo da natureza da aura escolhida no momento da conjuração. Em situações sociais os individuos tendem a dar atenção e se esforçar para se relacionar com o individuo ou serem repulsivos ao mesmo (aumenta ou diminui em um grau os testes sociais). Criaturas neutras ou hostis tendem a seguir a tendencia da aura escolhida. Caso oponentes afetados queiram contrariar a ação da aura, devem gastar 1 FV e superar um teste resistido de PERCEPÇÃO + CLARIVIDÊNCIA contra a conjuração do usuário para realizar suas ações normalmente."
          },
          "2": {
            "custo": 3,
            "alcance": 5,
            "raio": null,
            "efeito": "A aura notável ganha ainda mais poder e notoriedade garantindo que o alvo encantado possa somar MAGIA em testes sociais e oferece proteção magica cancelando encantamentos elementais caso tenha contato físico com os mesmos. Sua resisntência social agora aumenta em 2 graus a dificuldade de testes contra você, o mesmo vale para sua influência que facilita seus testes sociais em 2 graus. A resisntência para contrariar o efeito de atração ou repulsão agora tem o custo de 2 de FORÇA DE VONTADE."
          },
          "3": {
            "custo": 5,
            "alcance": 10,
            "raio": null,
            "efeito": "A aura alcança sua máxima magnitude forçando 3 de FORÇA DE VONTADE para as resisntências de seus efeitos e concedendo ao alvo da conjuração SEMPRE a resisntência máxima de dificuldade de testes realizados contra ele, assim como acertos físicos ou conjuração de magias que o tenham como alvo."
          }
        }
      },
      {
        "id": "energia_arcana",
        "nome": "ENERGIA ARCANA",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": 1,
            "efeito": "O conjurador canaliza e molda uma quantidade de energia magica em física que pode ter diversas formas e fins, mas que ainda sofre os efeitos físicos do plano terreste. Essa energia moldada pode ser utilizada para lançar projéteis contra alvos, criar passsarela, barreiras, ferramentas, etc. A mesma tem sua resistência e confere dano igual a intensidade no momento de sua conjuração (RACIOCÍNIO + MAGIA + DADO)/5."
          },
          "2": {
            "custo": 3,
            "alcance": 10,
            "raio": 2,
            "efeito": "Nesse nível alcance, raio e intensidade são ampliados. A energia ainda pode conceder a função de alarme emitindo luz não ofuscante ou ruído quando algo toca ou atravessa a mesma indepenedente do sentido e a gosto do conjurador. A Intensidade agora é o resultado final + 5"
          },
          "3": {
            "custo": 5,
            "alcance": 100,
            "raio": 2,
            "efeito": "Nesse nível o criador arcano dificilmente encontra limites para sua criação. Com alcance incrivel, 2 de raio de ação da magia e intensidade final agora + 10 suas criações são extremamente perigosas e quase inquebráveis."
          }
        }
      },
      {
        "id": "fortalecer_minguar",
        "nome": "FORTALECER/MINGUAR",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": "Magicamente um alvo altera seu tamanho aumentando/diminuindo seu tamanho e também 1 perícia fisica baseado na intensidade da magia no momento da conjuração. Além disso altera o tamanho do alvo. Quando AUMENTADO dobra seu tamanho original e multiplica seu peso em 8x. Quando DIMINUIDO reduz pela metade o tamnho do alvo e reduz seu peso em 8x. Quando o aumento do alvo é realizado em um ser vivo a magia ainda causa aumento em +2 de sua locomoção e dobra sua vida máxima. Diminuir um alvo diminui em 2 sua locomoção e aumenta em 5 sua furtividade."
          },
          "2": {
            "custo": 3,
            "alcance": 5,
            "raio": null,
            "efeito": "Agora o conjurador pode escolher até 1 perícia FÍSICA, 1 SOCIAL e 1 MENTAL para alterar positivamente ou negativamente de um único alvo. Além disso se majoritariamente os efeitos forem positivos causa a condição INSPIRADO, se negativo causa a condição CANSADO."
          },
          "3": {
            "custo": 5,
            "alcance": 10,
            "raio": null,
            "efeito": "Nesse nível as transformações já são assustadores triplicando a altura original de um alvo ou o diminuindo em 1/3 do mesmo. Ao aumentar seu peso aumenta em 27X, a mesma proporção ao diminuir. Além disso a ROBUSTEZ passa a ser a FORÇA do alvo e sua vida aumenta em 3x a original. Seu peso porem é tão grande que seu deslocamento é 1, assim como sua DESTREZA. Ao diminuir, a ROBUSTEZ passa a ser a DESTREZA do alvo. Ele é tão leve que seu deslocamento final recebe + 5 e não recebe dano de queda."
          }
        }
      },
      {
        "id": "reorientar",
        "nome": "REORIENTAR",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 10,
            "raio": null,
            "efeito": "O conjurador invoca um feixe magico que, ao atingir um alvo que seja magico ou que esteja sob um efeito de uma magia, pode ser ser controlado por esse conjurador. O alcance do alvo controlado é até o alcance dessa magia a intensidade é a original da magia que está sendo controlada. Alguns alvos podem sofrer resistencia ao controle. Se houver resistência aplica-se briga mágica ou física dependendo do alvo que resiste ao controle."
          },
          "2": {
            "custo": 3,
            "alcance": 20,
            "raio": 1,
            "efeito": "Agora com 1 de raio de área até 9 alvos magicos podem ser controlados, porem eles sempre tem o mesmo destino/ação que o conjurador escolher por ação. Ele pode diferenciar a ação para cada objeto ou lote de objetos dentre aqueles que estão sobre seu controle, porém essas serão feitas com ações distintas do conjurador. Em resistências ao controle pode somar + 5"
          },
          "3": {
            "custo": 5,
            "alcance": 100,
            "raio": 2,
            "efeito": "O ápice dessa magia permite que o conjurador aplique até por ação até 2 diferentes ordens por lote de objetos. Além disso em testes de resistência ao controle pode somar + 10."
          }
        }
      }
    ]
  },
  {
    "id": "distorcao",
    "nome": "DISTORÇÃO",
    "skills": [
      {
        "id": "torcer_a_materia",
        "nome": "TORCER A MATERIA",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": "O conjurador toca materia sem energia espíritual ou morta modelando-a instântaneamente por tempo determinado. Seu alcance é de até 2m3. A materia torcida retorna a forma original após 1 cena em conjuração normal ou sob estresse de batalha tem sua duração de 3 turnos. Todo dano recebido após a transformação é calculado normalmente e se mantém quando o objeto voltar a forma original. A modelagem altera a durabilidade de materias enquanto ativa (para mais ou para menos, com o minimo de 1) igual a intensidade de sua conjuração. A modelagem a desejo do conjurador só acontece quando a soma das alterações que consegue causar for superior toda a durabilidade do alvo. Sem o estresse de batalha considera-se 10 como base dessa magia para alteração da durabilidade de materiais."
          },
          "2": {
            "custo": 3,
            "alcance": 5,
            "raio": 1,
            "efeito": "Nesse nível o conjurador ao causar alteração de durabilidade de um material recebe + 10 para qualquer situação e tem base de alteração 20 quando a magia for realizada sem o estresse de batalha."
          },
          "3": {
            "custo": 5,
            "alcance": 10,
            "raio": 2,
            "efeito": "Nesse nível o conjurador ao causar alteração de durabilidade de um material recebe + 20 para qualquer situação e tem base de alteração 50 quando a magia for realizada sem o estresse de batalha."
          }
        }
      },
      {
        "id": "despedacar_reparar",
        "nome": "DESPEDAÇAR / REPARAR",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": "Uma energia nítida é emitida pelo conjurador. Esta magia tende a separar ou juntar quase que instantaneamente materias de naturezas iguais ou diferentes respeitando suas propriedades, texturas, durabilidade, entre outros (a ação só é concretizada quando ultrapassa a durabilidade ou a vida dos materiais e a durabilidade nova é a média dos materiais utilizados). Comumente utilizado para realizar pequenos reparos em equipamentos, fechar buracos, juntar peças umas as outras, criar artifícios e bugigangas para completar algum desafio temporariamente. Antagonista a reparos, pode ser utilizado também para romper rodas de carroças, fechaduras, armas, equipamentos, ferramentas, criar fissuras, abrir passagens, entre outros. Ferir ou modificar alvos vivos também é possível obedecendo as regras de ferimentos e vida para que a ação seja completa. Altera durabilidade de materiais e/ou vida para alvos orgânicos baseado na intensidade da magia conjurada. Ou seja, um reparo de um material nível baixo será reparado ou destruido mais rápido do que materiais de nívell superior, o mesmo vale para a interação de com alvos vivos."
          },
          "2": {
            "custo": 3,
            "alcance": 5,
            "raio": 1,
            "efeito": "Com 1 de raio superior e com reparo/destruição base de 10 nesse nível o conjurador praticamente tem domínio total sobre reparos e destruição. Agora ao realizar reparos com materiais de diferentes naturezas e propriedades prevalecem as caracteristicas do que tiver maior volume. A destruição de um alvo, quando completa, o fragmenta em partes tão pequenas tornando impossível o reparo do mesmo. Magias ou outras habilidades não conseguem mais dar alvo em um alvo que foi fragmentado dessa maneira."
          },
          "3": {
            "custo": 5,
            "alcance": 10,
            "raio": 2,
            "efeito": "Nesse nível com alcance e raio de atuação desequilibrados com a realidade, o conjurador tem em suas mãos o poder de erguer vilas ou extinguílas. Considerar reparo/destruição base 20. Este nível consegue reparar alvos que foram fragmentados ou que sofreram qualquer outro tipo de destruição. Reparar um alvo que foi vivo, mas morreu restitui sua materia, mas não o tráz de volta a vida."
          }
        }
      },
      {
        "id": "animar_a_materia",
        "nome": "ANIMAR A MATERIA",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": "Um objeto sem energia espíritual ou morto com tamanho definido proximo de 2m3 é envolto pela magia do conjurador e animado magicamente ganhando movimentos e ações. Seu animador pode dar uma ordem de uma frase para que será cumprida ou, tentará ser cumprida, enqaunto durar a magia, a duração do evento, até que o objetivo da ordem seja cumprido ou durante todo o evento se for uma ordem ativa continua. Alguns exemplos de ordem: A porta se abrirá quando alguem se aproximar, essa carroça deve seguir até o destino tal (o destino deve ser conhecido pelo animador), essa pedra rolará seguindo o alvo até atingi-lo, essas pedras formação mensagem tal e saltarão fazendo barulho evidenciando sua posição. Os objetos animados conseguem desafiar a gravidade com intensidade relativa a conjuração do usuário."
          },
          "2": {
            "custo": 3,
            "alcance": 5,
            "raio": 1,
            "efeito": "Nesse nível o conjurador consegue impregnar a magia no objeto de modo que ela passa a fazer parte dele, dessa maneira não poderá ser cancelado com a magia ANULAR ou percebido magicamente que o alvo está sob um efeito magico."
          },
          "3": {
            "custo": 5,
            "alcance": 10,
            "raio": 2,
            "efeito": "No ápice dessa magia o conjurador possui um limite do alcance da mesma para a matéria animada porém não possui um limite para que novas ordens sejam dadas a um objeto sob os efeitos dessa magia. Dessa forma, em qualquer momento o conjurador ao usar uma nova ação dessa magia poderá alterar ordens em alvos que previamente foram encantados e que ainda estiverem sob o efeito da magia."
          }
        }
      },
      {
        "id": "mesclar_o_espaco",
        "nome": "MESCLAR O ESPAÇO",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 3,
            "alcance": 1,
            "raio": 1,
            "efeito": "O conjurador com sua energia magica consegue distorcer o espaço em uma área específica de 2m3 invocando temporariamente uma mescla de outra dimensão que se mistura com a dimensão atual colocando tudo dentro da área da magia dentro dessa mescla. A nova dimensão escolhida é visivel assim como tudo que agora esta dentro dela. A mesma deve ser conhecida e nomeada, caso não aconteça é invocada a dimensão de maior afinidade do conjurador, ainda que ele não conheça nenhuma (diferente da que estão no momento). A área afetada não tem uma forma definida podendo ser uma esfera ou se ajustando a vontade do conjurador respeitando o limite da magia. Enquanto na mescla os alvos não são atingidos por qualquer interações de alvos ou objetos de fora da área afetada no momento da invocação. Quem estiver dentro da área afetada pode fazer ações livremente dentro desse novo plano e interagem somente dentro do mesmo."
          },
          "2": {
            "custo": 3,
            "alcance": 5,
            "raio": 1,
            "efeito": "Nesse nível a afinidade da mescla aumenta concedendo ao conjurador acesso a uma mescla diferente chamada TREVEHRA. Ao Invocar essa nova mescla o conjurador ou os objetos na área de atuação da magia simplesmente somem aos olhos dos demais. No entanto quem está no novo plano consegue ver os demais do outro lado da mescla. TREVEHRA é exatamente igual ao plano anterior com a exceção da luz se propragar de forma diferente. Isso causa menor iluminação e todas as consequencias a vida vinculadas a isso. Estar em TREVEHRA consome 2 VIDA, 1 FORÇA DE VONTADE, 1 MANA e 1 ENERGIA por período de todos os seres que não são de lá e não estão adaptados a esse plano."
          },
          "3": {
            "custo": 5,
            "alcance": 10,
            "raio": 2,
            "efeito": "O conjurador passa agora a caminha pelos planos e mesclas com maior afinidade. Ele agora consegue sentir os outros planos, ver magicamente portais ou vendas que uma vez já foram abertas em algum lugar e deixaram seus rastros magicos, independente se estiverem ativos ou não. Além disso ele passa a conhecer pelo menos mais 2 planos. VALINOR, terra dos imortais, seres ancestrais onde muitos dizem ser o paraíso, terra das fadas, terra dos Deuses, entre outros. BALEMUR, confins do desconhecido, onde as criaturas horrendas ganham força e forma, origem do terror e pesadelos."
          }
        }
      },
      {
        "id": "criar_a_fenda",
        "nome": "CRIAR A FENDA",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 5,
            "raio": null,
            "efeito": "Essa magia abre uma pequena fenda no espaço com tamanho de 1m2 para este nível da magia. O mesmo permite a passagem de objetos, criaturas, entre outros, de um lugar de origem a outro, vulgo portal dimensional. Para que a magia tenha sucesso SEMPRE 2 fendas devem ser abertas. A passagem é realizada atravéz das 2 fendas criadas considerado como local de origem e destino, o custo da magia é aplicado somente 1 vez para abrir as 2 fendas. Essa pratica é utilizada para usos repentinos e usos unicos, ou seja, logo que a duração da magia acaba as fendas desaparecem."
          },
          "2": {
            "custo": 3,
            "alcance": 10,
            "raio": 1,
            "efeito": "O conjurador agora consegue conectar a fenda a objetos ou alvos os teletransportando até o alcance de sua magia. Além disso o conjurador precisa conhecer relativamente bem o destino final ou estar em seu campo de visão para que tenha sucesso na acertividade da magia. Alvos podem resistir instantâneamente a esse efeito gastando 2 MANA ou testando sua CONCIÊNCIA contra essa conjuração. Alguns usos comuns dessa magia são: trocar de lugar, trocar objetos de lugar, trazer um objeto até sua mão, deslocar alguem de um lugar para o outro."
          },
          "3": {
            "custo": 10,
            "alcance": 20,
            "raio": 2,
            "efeito": "Neste nível da magia o conjurador pode realizar fendas duradouras através de um RITUAL chamdado de FENDA NOMINAL, uma vez dado um nome a este portal ele poderá sempre ser usado como destino de um conjurador. Uma vez criada a magia e conhecendo o nome dessa FENDA NOMINAL o conjurador consegue acessar esse destino atravéz de outros portais. Além disso esta magia pode abrir uma fenda que esteja em outra dimensão ou mesmo em outro planeta. Então o correto ao nomear um portal é entoar a dimensão de destino, o planeta e somente então a \"chave\" final (nome do portal). Somente dessa forma o usuário pode garantir que está indo para o destino correto. Se o conjurador não conhecer outras dimensões ou planetas provavelmente não conseguirá acessar portais das mesmas, então é natural que um usuário dessa magia somente utilize a \"chave\" em seus portais nominais. RITUAL - Ao juntar os ingredientes e realizar o ritual arquitetonico junto a esta magia, cria um portal permanente (pode ser aberto mediante a menção da palavra escolhida e utilizando este nível da magia). Este é perpétuo enquanto a arquitetura de preparação existir. INGREDIENTES - 5 pedras elementais, estrutura que irá uni-las em forma e tamanho do portal que deseja (de madeira, metal, rocha, etc)."
          }
        }
      },
      {
        "id": "implodir_explodir",
        "nome": "IMPLODIR/ EXPLODIR",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 5,
            "raio": 1,
            "efeito": "O conjurador cria um centro de energia que atua em uma área específica não ocupada ou sobre um alvo que possa ver (nesse caso o alvo não sobre os efeitos da magia). Essa energia pode ATRAIR ou REPELIR objetos físicos e criaturas com intensidade iguais a sua conjuração (raciocinio + magia + d20), no momento da conjuração o primeiro estrondo sempre causa um som esntrondoso de explosão. Esse centro de magia causa atração/repulsão uma vez por turno caunsando dano de esmagamento se atingirem seu centro enquanto a magia permanecer ativa. Objetos e alvos sem resistência são deslocados quase que instantaneamente. A critério do mestre, objetos podem colidir com outros alvos causando dano adicional, se for o caso, considerar que o dano causado igual ao dano de queda que esse objeto receberia. A título de comparação a gravidade natural da Terra tem intensidade 6."
          },
          "2": {
            "custo": 3,
            "alcance": 10,
            "raio": 2,
            "efeito": "Nesse nível o conjurado domina o poder a ponto de que o centro de energia agora ATRAI ou REPELE também fontes magias ou magias além das demais coisas, ele também tem controle sobre a forma da área de atuação com o limite de sua capacidade (pode ser um atuando somente em um corredor de uma viela, ou o centro de energia pode estrar na extremidade da área de ataução da magia). Na pratica, magias lançadas contra um campo de energia REPELIR devem ter sua intensidade de conjuração superior a este para poder atravessa-lo. Por outro lado uma magia que adentra o campo de energia ATRAIR é acelerado. Além disso, na mesma conjuração, porém gastando uma ação, o conjurador pode alternar o centro de energia criado entre ATRAIR ou REPELIR enquanto a magia estiver ativa. Elém disso a intensidade base da magia é 5."
          },
          "3": {
            "custo": 5,
            "alcance": 20,
            "raio": 3,
            "efeito": ""
          }
        }
      }
    ]
  },
  {
    "id": "divino",
    "nome": "DIVINO",
    "skills": [
      {
        "id": "luz_da_alma",
        "nome": "LUZ DA ALMA",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 5,
            "raio": 3,
            "efeito": "O conjurador transforma sua mana em luz podendo encantar objetos, alvos, criaturas ou mesmo criar uma esfera de mana pura que emana luz. Esta Ilumina um ambiente onde foi conjurada. Como uma esfera ela pode ser lançada ou carregada. Essa luz também revela objetos magicamente escondidos com um brilho mais intenso que o normal e auxilia em testes de investigação fazendo com que seja 1 grau de dificuldade a menos. A luz magica por esta magia encanta com o elemento LUZ aqueles que entrar em contato com a mesma prevalecendo nos mesmos enquanto magia durar."
          },
          "2": {
            "custo": 3,
            "alcance": 10,
            "raio": 3,
            "efeito": "Libera um feixe de luz do céu a terra em volta do alvo com iluminação e calor como se fosse o própior Sol. Dentro desse santuário de luz seres espirituais não podem entrar ou sair, efeitos causados por elementos de quaisquer natureza são instântaneamente neutralizados. Enquanto dentro do feixe de luz, dificulta ações de acerto de quaisquer alvos que vizem um alvo dentro do feixe ou vice-versa. Essa dificuldade adicional é de 1 grau."
          },
          "3": {
            "custo": 5,
            "alcance": 20,
            "raio": 3,
            "efeito": "Nesse nível a luz da alma se trona tão intensa que passa a executar os profanadores da fé. Além dos efeitos anteriores agora qualquer alvo dentro do feixe ou tocado por ele recebe dano igual a 10x HUMANIDADE perdida. Espíritos ou formas espirituais recebem dano magico igual a 10x dano da conjuração. Os alvos ainda perdem 5 de MANA por turno que estiverem sob a ação dessa luz."
          }
        }
      },
      {
        "id": "curar_as_cinzas",
        "nome": "CURAR AS CINZAS",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": "É uma magia que exala uma aura relaxante e envolve um alvo lhe concedendo VONTADE. Alguem que possui VONTADE não desmaia ao ter sua vida zerada ou sofrer condições que o fariam desmaiar. Se o alvo estiver desmaiado, independente do motivo, esse alvo poderá despertar imediatamente. Além disso essa magia auxilia na recuperação da condição INFECTADO, remove sangramentos e envenenamentos."
          },
          "2": {
            "custo": 3,
            "alcance": 5,
            "raio": 1,
            "efeito": "A VONTADE adqurida dessa maneira fica impregnada na alma do alvo durante 7 dias. Mesmo que a magia acaba a VONTADE ainda irá durar esse período . Além disso regenera a condição DOENTE, ossos quebrados e cicatriza feridas mais profundas e mais permanentes como cegueiras, paralizias e doenças crônicas."
          },
          "3": {
            "custo": 5,
            "alcance": 10,
            "raio": 2,
            "efeito": "Nesse nível a regeneração é tamanha que é capaz de restaurar por completo um ser a partir de uma fração de seu corpo. Porém se o ser já é vivo em outro corpo essa magia simplesmente se transforma em energia e se dicipa ao final de sua conjuração. Apesar de restaurar por completo um corpo ou ser vivo, essa amgia não torna vivo uma criatura que não esboça mais vida."
          }
        }
      },
      {
        "id": "exaltar",
        "nome": "EXALTAR",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 5,
            "raio": null,
            "efeito": "O Alvo é encantado com uma aura sobrenatural lhe concedendo confiança e coragem. Remove também quaisquer efeito de condições PERSUADIDO, ENGANADO, AMEDONTRADO imediatamente e o deixa imune contra essas condições. Além disso lhe concede sucessos em testes sociais e recupera a CONCENTRAÇÃO e FORÇA DE VONTADE igual a intensidade de conjuração dessa magia."
          },
          "2": {
            "custo": 3,
            "alcance": 10,
            "raio": null,
            "efeito": "Nesse nível o alvo que tiver sido exaltado causa uma sensação agrávél aos demais ao ser visto, um semblante mistico o envolve possibilitando que ao toque possa retirar condições sociais de primeiro estágio de outros alvos, sejam benéficas ou não. O mesmo semblante tem uma energia tão singular que atrai espíritos das proximidades que podem ser visivéis ao tocar essa aura do conjurador. Além disso pode consumir essa aura para utilizar 2 magias (que não seja EXALTAR) sem pagar seu custo neste turno, utilizar a nova magia ainda lhe custará 1 AÇÃO."
          },
          "3": {
            "custo": 5,
            "alcance": 20,
            "raio": 2,
            "efeito": "A aura que envolve o alvo ganha dimensões gigantes atraindo espíritos por quilometros. Porém a energia desses agora é alterada causando efeitos aos que adentrarem o campo de ação dessa aura. Alvos hostis tem sua MANA e FORÇA DE VONTADE drenadas igual a intensidade de conjuração da magia. Demais alvos Recuperam ENERGIA e FORÇA DE VONTADE com a mesma intensidade. Essa intensidade pode variar se o local tiver mais ou menos espíritos. Dentro do alcance da aura qualquer teste SOCIAL contra o alvo da magia é impossibilidado pelo semblante da aura. Enquanto houver espíritos ou outros seres dentro da aura o portador gasta 2 MANA a menos para conjurar magias."
          }
        }
      },
      {
        "id": "abencoar",
        "nome": "ABENÇOAR",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": "Provavelmente a magia mais cobiçada dentre os conjuradores divinos. Um toque bem executado dessa magia e o alvo sentirá uma sensação de coragem fora do normal. Alguem abençoado pode somar 1 sucesso em qualquer teste e realizar 1 vez durante este efeito de magia uma rolagem adicional para substituir um teste de D20 (um erro crítico NÃO pode ser substituido). Em situações normais a magia poderá acontecer com simples gestos e um único toque, poré m sobre o estresse de batalha deverá ser feito de maneira mais brusca como por exemplo: um dano causado por uma adaga, ósculo sagrado ou tendo sucesso em um teste social."
          },
          "2": {
            "custo": 3,
            "alcance": 5,
            "raio": 1,
            "efeito": "Alvos abençoados agora tem o grau de dificuldade de seus testes, que não de batalha/confronto, diminuidos em 1. Po exemplo: encontrar comida, saltar de um lado da ponte a outro, tocar um soneto, pilotar uma carruagem, encontro aleatório, raridade de prêmio em encontros, etc."
          },
          "3": {
            "custo": 5,
            "alcance": 10,
            "raio": 1,
            "efeito": "O glorioso poderá rolar uma segunda vez qualquer teste realizado, para vários testes diferentes, durante a duração da magia. Ele deverá obrigatóriamente substituir pelo novo resultado se optar pela segunda rolagem."
          }
        }
      },
      {
        "id": "purificar",
        "nome": "PURIFICAR",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": "O conjurador invoca uma brisa magica purificadora em um alvo ou espaço vazio que anula temporariamente efeitos elementais e maldições. Além disso ela causa dano em espíritos igual 5x HUMANIDADE perdida. Essa magia ainda pode ser usada para purificar alimentos, água que outrora estiveram envenenados ou tornar comestivél algo que já estava podre. Um espírito que que recebe dano acima de sua resistência total é exilado desse plano de vez tomando seu caminho, independente de qual seja. A brisa purificadora pode ser usada para encantar objetos e alvos."
          },
          "2": {
            "custo": 3,
            "alcance": 5,
            "raio": 1,
            "efeito": "Nesse nível o conjurado consegue atingir até mesmo os níveis mais profundos da alma de seus alvos, sua HUMANIDADE. Com isso ele é capaz de erradicar a consciência ruim de um alvo limpando aquela humanidade perdida, sempre o pior nível dela. Para tal o alvo que terá sua HUMANIDADE restituiuda precisará abrir mão de um conhecimento equivalente. Se uma HUMANIDADE a ser restaurada é de 3 grau, uma habilidade de maestria de nível 3 deverá ser sacrificada dessa maneira. Se um alvo tem 4 ou mais de HUMANIDADE perdida essa magia não tem efeito. Sob o estresse de batalha essa magia causa dano ao conjurador e ao alvo igual 5x HUMANIDADE a ser restaurada, metade para os demais casos. Dano ao conjurador só é causado em caso de um alvo não ser conivente ao efeito da magia."
          },
          "3": {
            "custo": 5,
            "alcance": 10,
            "raio": 2,
            "efeito": ""
          }
        }
      },
      {
        "id": "congregar",
        "nome": "CONGREGAR",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": 2,
            "efeito": "Os seres encantados com o elemento luz (dentro do raio desta magia) ou aqueles que utilizarem suas ações para acompanhar o mantra entoado pelo usuário (que ouvem o usuário) poderão durante a duração desta magia receber todos os benefíficos que o conjurador receber quando utilizar em si a magia LUZ DA ALMA e CURAR AS CINZAS."
          },
          "2": {
            "custo": 3,
            "alcance": 1,
            "raio": 3,
            "efeito": "Agora, aqueles que congregarem não sofrem os efeitos negativos casados pela fome ou sede durante 1 dia. Além disso, poderão durante a duração desta magia receber todos os benefíficos que o conjurador receber quando utilizar em si a magia EXALTAR e ABENÇOAR."
          },
          "3": {
            "custo": 5,
            "alcance": 1,
            "raio": 4,
            "efeito": ""
          }
        }
      }
    ]
  },
  {
    "id": "elemental",
    "nome": "ELEMENTAL",
    "skills": [
      {
        "id": "taumaturgia_de_fogo",
        "nome": "TAUMATURGIA DE FOGO",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 5,
            "raio": 1,
            "efeito": "O Conjurador utiliza seu poder magico para moldar os diferentes elementos em sua volta podendo move-los e mudar sua forma dentro de seu raio de ação mágica. Por exemplo transformar uma fogueira em uma lança de fogo. O usuário ainda pode mover esse elemento dentro do alcance de sua magia. Os detalhes e exatidão das transformações são simples e arcaicas, mas podem ser melhoradas com o aperfeiçoamento da magia e conhecimento em ofícios ou ciência do usuário. Todas as modificações realizadas com essa magia são permanentes ao ambiente e obedecem as leis da fisíca depois que seu conjurador deixa de controlar aquele elemento. A magia persiste durante a sua duração, porém o conjurador pode gastar uma ação para alterar a forma ou ação do elemento que estiver utilizando. Se dano for causado essa quantidade é a intensidade da conjuração da magia + possivel interação natual do elemento. Ex: queimaduras ou intensidade extra se o mestre achar pertinente pelo tamanho original das chamas, muitas áreas afetadas pelas chamas, entre outros."
          },
          "2": {
            "custo": 3,
            "alcance": 10,
            "raio": 2,
            "efeito": "Nesse nível de conjuração se adquire ainda mais poder de manipulação e diversidade quando dominada outras Trilhas da taumaturgia. Taumaturgia de RELÂMPAGO = LAVA e de TERRA = METAL. Além disso o conjurador nesse nível conta com a taumaturgia de LUZ. A intensidade de dano agora tem base 2 para cada nível 2 em taumaturgia + a intensidade da conjuração."
          },
          "3": {
            "custo": 5,
            "alcance": 20,
            "raio": 3,
            "efeito": "Nesse nível o conjurador consegue converter um elemento que esta manipulando em outro elemento que pode manipular. Essa transformação gasta uma ação e é limitada a elementos que não façam parte de serem vivos. Quando o efeito da magia acaba um elemento volta a sua natureza original, porém as modificações causadas a ele e al ambiente permanecem. A intensidade de dano agora tem base 10 para cada nível de taumaturgia + a intensidade da conjuração."
          }
        }
      },
      {
        "id": "taumaturgia_de_agua",
        "nome": "TAUMATURGIA DE ÁGUA",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 5,
            "raio": 1,
            "efeito": "O Conjurador utiliza seu poder magico para moldar os diferentes elementos em sua volta podendo move-los e mudar sua forma dentro de seu raio de ação mágica. Por exemplo dividir uma fração da água de um rio para formar uma passagem. O usuário ainda pode mover esse elemento dentro do alcance de sua magia. Os detalhes e exatidão das transformações são simples e arcaicas, mas podem ser melhoradas com o aperfeiçoamento da magia e conhecimento em ofícios ou ciência do usuário. Todas as modificações realizadas com essa magia são permanentes ao ambiente e obedecem as leis da fisíca depois que seu conjurador deixa de controlar aquele elemento. A magia persiste durante a sua duração, porém o conjurador pode gastar uma ação para alterar a forma ou ação do elemento que estiver utilizando. Se dano for causado essa quantidade é a intensidade da conjuração da magia + possível interação com o elemento. Ex: um grande volume de água que cai sobre alguem sob ação da gravidade ou objetos dentro da água que se chovam com alvos enqaunto a mesma está em movimento."
          },
          "2": {
            "custo": 3,
            "alcance": 10,
            "raio": 2,
            "efeito": "Nesse nível de conjuração se adquire ainda mais poder de manipulação e diversidade quando dominada outras Trilhas da taumaturgia. Taumaturgia de TERRA = MADEIRA, RELÂMPAGO = CRISTAL e VENTO = GELO. A intensidade de dano agora tem base 2 para cada nível 2 em taumaturgia + a intensidade da conjuração."
          },
          "3": {
            "custo": 5,
            "alcance": 20,
            "raio": 3,
            "efeito": "Nesse nível o conjurador consegue converter um elemento que esta manipulando em outro elemento que pode manipular. Essa transformação gasta uma ação e é limitada a elementos que não façam parte de serem vivos. Quando o efeito da magia acaba um elemento volta a sua natureza original, porém as modificações causadas a ele e al ambiente permanecem. A intensidade de dano agora tem base 10 para cada nível de taumaturgia + a intensidade da conjuração."
          }
        }
      },
      {
        "id": "taumaturgia_de_vento",
        "nome": "TAUMATURGIA DE VENTO",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 5,
            "raio": 1,
            "efeito": "O Conjurador utiliza seu poder magico para moldar os diferentes elementos em sua volta podendo move-los e mudar sua forma dentro de seu raio de ação mágica. Por exemplo direcionar uma rajada de vento para mudar a direção de flechas. O usuário ainda pode mover esse elemento dentro do alcance de sua magia. Os detalhes e exatidão das transformações são simples e arcaicas, mas podem ser melhoradas com o aperfeiçoamento da magia e conhecimento em ofícios ou ciência do usuário. Todas as modificações realizadas com essa magia são permanentes ao ambiente e obedecem as leis da fisíca depois que seu conjurador deixa de controlar aquele elemento. A magia persiste durante a sua duração, porém o conjurador pode gastar uma ação para alterar a forma ou ação do elemento que estiver utilizando. Se dano for causado essa quantidade é a intensidade da conjuração da magia."
          },
          "2": {
            "custo": 3,
            "alcance": 10,
            "raio": 2,
            "efeito": "Nesse nível de conjuração se adquire ainda mais poder de manipulação e diversidade quando dominada outras Trilhas da taumaturgia. Taumaturgia de ÁGUA = GELO, RELÂMPAGO = AURORA e TERRA = AREIA. A intensidade de dano agora tem base 2 para cada nível 2 em taumaturgia + a intensidade da conjuração."
          },
          "3": {
            "custo": 5,
            "alcance": 20,
            "raio": 3,
            "efeito": "Nesse nível o conjurador consegue converter um elemento que esta manipulando em outro elemento que pode manipular. Essa transformação gasta uma ação e é limitada a elementos que não façam parte de serem vivos. Quando o efeito da magia acaba um elemento volta a sua natureza original, porém as modificações causadas a ele e al ambiente permanecem. A intensidade de dano agora tem base 10 para cada nível de taumaturgia + a intensidade da conjuração."
          }
        }
      },
      {
        "id": "taumaturgia_de_terra",
        "nome": "TAUMATURGIA DE TERRA",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 5,
            "raio": 1,
            "efeito": "O Conjurador utiliza seu poder magico para moldar os diferentes elementos em sua volta podendo move-los e mudar sua forma dentro de seu raio de ação mágica. Por exemplo criar passagens ou um abrigo em uma motanha deslocando a terra. O usuário ainda pode mover esse elemento dentro do alcance de sua magia. Os detalhes e exatidão das transformações são simples e arcaicas, mas podem ser melhoradas com o aperfeiçoamento da magia e conhecimento em ofícios ou ciência do usuário. Todas as modificações realizadas com essa magia são permanentes ao ambiente e obedecem as leis da fisíca depois que seu conjurador deixa de controlar aquele elemento. A magia persiste durante a sua duração, porém o conjurador pode gastar uma ação para alterar a forma ou ação do elemento que estiver utilizando. Se dano for causado essa quantidade é a intensidade da conjuração da magia."
          },
          "2": {
            "custo": 3,
            "alcance": 10,
            "raio": 2,
            "efeito": "Nesse nível de conjuração se adquire ainda mais poder de manipulação e diversidade quando dominada outras Trilhas da taumaturgia. Taumaturgia de VENTO = AREIA, FOGO = METAL e ÁGUA = MADEIRA. A intensidade de dano agora tem base 2 para cada nível 2 em taumaturgia + a intensidade da conjuração."
          },
          "3": {
            "custo": 5,
            "alcance": 20,
            "raio": 3,
            "efeito": "Nesse nível o conjurador consegue converter um elemento que esta manipulando em outro elemento que pode manipular. Essa transformação gasta uma ação e é limitada a elementos que não façam parte de serem vivos. Quando o efeito da magia acaba um elemento volta a sua natureza original, porém as modificações causadas a ele e al ambiente permanecem. A intensidade de dano agora tem base 10 para cada nível de taumaturgia + a intensidade da conjuração."
          }
        }
      },
      {
        "id": "taumaturgia_de_relampago",
        "nome": "TAUMATURGIA DE RELÂMPAGO",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 5,
            "raio": 1,
            "efeito": "O Conjurador utiliza seu poder magico para moldar os diferentes elementos em sua volta podendo move-los e mudar sua forma dentro de seu raio de ação mágica. Por exemplo alterar a trajetória de relâmpagos. O usuário ainda pode mover esse elemento dentro do alcance de sua magia. Os detalhes e exatidão das transformações são simples e arcaicas, mas podem ser melhoradas com o aperfeiçoamento da magia e conhecimento em ofícios ou ciência do usuário. Todas as modificações realizadas com essa magia são permanentes ao ambiente e obedecem as leis da fisíca depois que seu conjurador deixa de controlar aquele elemento. A magia persiste durante a sua duração, porém o conjurador pode gastar uma ação para alterar a forma ou ação do elemento que estiver utilizando. Se dano for causado essa quantidade é a intensidade da conjuração da magia."
          },
          "2": {
            "custo": 3,
            "alcance": 10,
            "raio": 2,
            "efeito": "Nesse nível de conjuração se adquire ainda mais poder de manipulação e diversidade quando dominada outras Trilhas da taumaturgia. Taumaturgia de ÁGUA = CRISTAL, FOGO = LAVA e VENTO = AURORA. A intensidade de dano agora tem base 2 para cada nível 2 em taumaturgia + a intensidade da conjuração."
          },
          "3": {
            "custo": 5,
            "alcance": 20,
            "raio": 3,
            "efeito": "Nesse nível o conjurador consegue converter um elemento que esta manipulando em outro elemento que pode manipular. Essa transformação gasta uma ação e é limitada a elementos que não façam parte de serem vivos. Quando o efeito da magia acaba um elemento volta a sua natureza original, porém as modificações causadas a ele e al ambiente permanecem. A intensidade de dano agora tem base 10 para cada nível de taumaturgia + a intensidade da conjuração."
          }
        }
      },
      {
        "id": "energia_elemental",
        "nome": "ENERGIA ELEMENTAL",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 5,
            "raio": null,
            "efeito": "O conjurador pode encantar objetos com poder mágico como naturalmente qualquer criatura pode fazer, porém esse encatamento dura por uma cena inteira, mesmo sob estresse de batalha e não desaparece se sofrer colisões com outros encantamentos como normalmente acontece. Os objetos encantados são envoltos com a propriedade elemental do encantamento causando efeitos relacionados ao mesmo. Um objeto encantado dessa forma passa a ser considerado como um objeto mágico. Um objeto encantado não sofre dano de contato que o elemento causa. (verificar as atribuições de encantamentos elementais na TABELA DE ELEMENTOS)"
          },
          "2": {
            "custo": 3,
            "alcance": 10,
            "raio": 1,
            "efeito": "O conjurador canaliza molda uma quantidade de mana em energia elemental que pode ter diversas formas e fins, mas que ainda sofre os efeitos físicos do plano terreste. Essa energia moldada pode ser utilizada para lançar projéteis contra alvos, criar passsarela, barreiras, ferramentas, etc. Vários elementos podem ser utilizados dessa maneira bastando que o conjurador possua em seu canalizador (normalmente uma arma) ou o elemento de sua DÁDIVA ELEMENTAL. Todo e qualquer elemento criado dessa maneira é magico e temporário. A mesma tem sua resistência e confere dano igual a intensidade no momento de sua conjuração (RACIOCÍNIO + MAGIA + DADO)/5."
          },
          "3": {
            "custo": 5,
            "alcance": 20,
            "raio": 2,
            "efeito": "Transforma seu corpo parcialmente o mesclando com uma forma elemental que pode ser usado para diversos fins. Nessa forma seu toque físico aplica efeitos elementais aos alvos de acordo com o elemento utilizado. Seus atributos mentais são utilizados em testes físicos como correr, acerto, esquiva, entre outros. A forma elemental não se restringe a forma do conjurador. Uma vez transformado o mesmo pode adaptar sua forma como bem desejar respeitando seu volume original."
          }
        }
      },
      {
        "id": "moldar_o_clima",
        "nome": "MOLDAR O CLIMA",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": null,
            "raio": null,
            "efeito": "O conjurador cria sinergia com o ambiente e natureza fazendo com que sua energia altere algumas caracteristicas desse ambiente podendo torná-lo mais quente ou frio sempre proximos, mas inferiores, de temperáturas das estações do ano do local. Pode até mesmo criar uma alteração tamanho que dias de Sol podem se tornar chuvosos e o contrário também é verdadeiro. O alcance dessa magia é de 1km e a intensidade da magia determina quantas horas irá durar."
          },
          "2": {
            "custo": 3,
            "alcance": null,
            "raio": null,
            "efeito": "Nesse nível o conjurador consegue replicar as estações e interpéries climáticos da região com exatidão. Consegue ainda criar fenômenos como granizos e rajadas de vento o suficiente para manter animais e pessoas preocupados e impedir atividades padrão dos mesmo. O alcance dessa magia é de 10km e a intensidade da magia determina quantos dias irá durar."
          },
          "3": {
            "custo": 5,
            "alcance": null,
            "raio": null,
            "efeito": "Nesse nível o conjurador conseguemoldar as estações e interpéries climáticos da região além do que convencionalmente pode existir ali. Consegue ainda criar fenômenos como nevascas, secas e furações locais o suficiente para manter animais e pessoas preocupados e impedir atividades padrão dos mesmo. O alcance dessa magia é de até 100km e a intensidade da magia determina quantos anos irá durar."
          }
        }
      }
    ]
  },
  {
    "id": "espectral",
    "nome": "ESPECTRAL",
    "skills": [
      {
        "id": "ligacao_magica",
        "nome": "LIGAÇÃO MAGICA",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": "Uma energia vísivel envolve um alvo até desaparecer criando um vínculo temporário, voce e o alvo podem utilizar magias uns nos outros como se estivesse usando em si mesmo. Se a ligação for realizada com espíritos, temporariamente espiritos se sentem emocionalmente ligados a você podendo seguir instruções e até mesmo protegendo-o dependendo de sua interação social com eles durante a cena. O alcance desse benefício é de até 20 metros"
          },
          "2": {
            "custo": 3,
            "alcance": 5,
            "raio": 1,
            "efeito": "Nesse nível os alvos e conjurador partilham custos de MANA e FORÇA DE VONTADE. Um custo dessa maneira pode ser partilhado dentre os alvos, porém todos que partilharem um custo específico pagam pelo menos 1 desse custo. O conjurador pode também encantar um objeto de vinculo pessoal. Alguem que porta o objetvo encantado e, enquanto durar a magia, tem os benefícios dessa magia. O alcance desse benefício é de até 100 metros."
          },
          "3": {
            "custo": 5,
            "alcance": 10,
            "raio": 2,
            "efeito": "Agora o conjurador e os alvos dentro dessa ligação podem utilizar as magias dos demais sem restrição. A resistência contra testes sociais sempre será o máximo de 3 ou mais alvos estiverem vinculados nessa magia e dificuldade de conjuração de qualquer magia será o mínimo."
          }
        }
      },
      {
        "id": "infusao",
        "nome": "INFUSÃO",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": "O conjurador envolve um objeto não vivo em sua magia podendo mantê-lo temporariamente escondido dentro de outro objeto com limite de um ser o dobro do tamanho do outro, quando escondida não pode ser notada a olho nu, mas exala energia mágica de mesma forma do objeto escondido . Este fica escondido magicamente ate ser retirado pelo conjurador (sem custo) ou até que a magia acabe. A infusão pode se tornar permanente pelo custo de 5 MANA no momento da conjuração. Dessa maneira o objeto pode ser escondido e retirado quantas vezes forem necessárias com custo adicional de 1 MANA por vez. Se um objeto com uma infusão é destruído a infusão deixa de estar escondida e surge em sua forma original. O máximo de infusões em um alvo é de 1."
          },
          "2": {
            "custo": 3,
            "alcance": 5,
            "raio": 1,
            "efeito": "O conjurador agora consegue realizar a infusão em si mesmo escondendo objetos em seu corpo ou utilizar seu corpo e esconde-lo em outro objeto. O máximo de infusões em um alvo é de 3. Além disso todas as infusões nesse nível podem ser considerada permanentes ainda possuindo o custo 1 de MANA para esconder ou conjurar um alvo. Se o conjurador se utilizar como uma infusão é como se ele estivesse em plano espectral não podendo interagir com objetos do plano normal."
          },
          "3": {
            "custo": 5,
            "alcance": 10,
            "raio": 2,
            "efeito": "O conjurador agora consegue realizar a infusão de seres vivos e também em seres vivos. O máximo de infusões em um alvo é de 10. Além disso todas as infusões nesse nível podem ser considerada permanentes ainda e sem custo de MANA para esconder ou conjurar um alvo."
          }
        }
      },
      {
        "id": "sentir_o_alem",
        "nome": "SENTIR O ALEM",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": 2,
            "efeito": "O conurador tem sua clarividência aprimorada ao empregnar sua magia em si, em algum alvo ou em um espaço. Ele enxerga com os olhos da mente, não com sua visão natural. Enquanto sob o efeito dessa magia ele tem visão plena daquela área, pode ver magicas e também espiritos que possam existir. Caso esteja procurando por algum objeto específico (mesmo que estejam atrás de outros objetos, paredes, escondidos em bolsos, ou afins) o conjurador poderá somar a intensidade de sua conjuração para encontrá-los. Pode ainda detectar origem de uma fonte magica e saber qual a trilha magica foi utilizada."
          },
          "2": {
            "custo": 3,
            "alcance": 5,
            "raio": 3,
            "efeito": "Nesse nível a sensibilidade é aumentada exepcional de forma que, se um alvo ou objeto é procurado dentro do alcance dessa magia e se ele estiver lá, o conjurador saberá sua posição exata. Sua percepção está aguçada e poderá somar sua MAGIA em todos os testes de PERCEPÇÃO e RACIOCÍNIO. Além disso consegue distinguir o humor de espíritos e ver aproximadamente a quantidade de MANA de todos os alvos no alcance dessa magia."
          },
          "3": {
            "custo": 5,
            "alcance": 10,
            "raio": 4,
            "efeito": "Nesse nível o conjurador, sempre que desejar, terá a vantagem em INICIATIVA de ação. Além disso ele pode sentir o fluxo de MANA de objetos e demais seres com tanta exatidão a ponto de conseguir atingi-los. Dessa forma o conjurador pode com uma ação absorver, utilizar ou mover MANA de um objeto para outro com o limite de qauntidade igual a sua CLARIVIDÊNCIA."
          }
        }
      },
      {
        "id": "caminhar_no_espectro",
        "nome": "CAMINHAR NO ESPECTRO",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": "O conjuado se envolve com sua magia ficando na eminência entre o plano espectral e o real. Ele experimenta ambos, mas não interage com nenhum. Fica parcialmente invisivel como se fosse um fantasma ignorando assim a gravidade e podendo atravessar objetos físicos do plano comum. Ele ainda pode se comunicar e compreender o que acontece em ambos os planos. Nesse intervalo e enqaunto estiver nele o conjurador não experimenta as sensações de necessidades básicas como fome, cansaço ou falta de ar."
          },
          "2": {
            "custo": 3,
            "alcance": 5,
            "raio": null,
            "efeito": "O conjurador acessa o plano espectral se tornando invisível aos demais do plano natural. Ele ainda consegue ver naturalmente os eventos do plano natural, mas não interage com os mesmos, somente com seres do plano espectral. Nesse plano os atributos MENTAIS são utilizados quando desejar realizar testes que seriam naturalmente FÍSICOS como correr, agarrar algo ou coisa do tipo. Além disso é possível agora utilizar essa magia em outros objetos ou seres vivos."
          },
          "3": {
            "custo": 5,
            "alcance": 10,
            "raio": 1,
            "efeito": "Nesse nível é possível trazer alvos do plano espectral para o natural. Eles assumem forma compatível a do plano natural. Por exemplo um espírito de um humano se torna um humano em seu corpo natural, uma criatura réptil da mesma maneira ou um vaso de barro assume suas propriedades originais. Se o alvo do plano espectral for algo que não é original do pralo natural sua composição se torna proxima do que seria natural a esse plano. Além disso, com uma ação o conjurador pode alternar entre os planos os alvos que foram encantados com essa magia."
          }
        }
      },
      {
        "id": "desejo_espectral",
        "nome": "DESEJO ESPECTRAL",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": null,
            "raio": null,
            "efeito": "O conjurador utiliza sua magia para espalhar sua mana e atrair espíritos das proximidades (até 1 Km) e interagir socialmente com eles, eles conseguirão ouvi-lo e você poderá ouvi-los além de ve-los com perfeição. Alternativamente você consegue fazer com que um espírito tome seu corpo pela duração padrão ou você pode trocar de corpo com outra criatura desde que seja consensual, você pode fazer testes sociais para isso tendo que somar pelo menos 2 sucessos se o alvo for neutro com relação a você. O usuário pode também realizar pequenas ações sobrenaturais como: mover temporariamente e sutilmente um pano, cadeira, ou apagar uma vela, gestos simples que um fantasma próximo pudesse fazer por você."
          },
          "2": {
            "custo": 3,
            "alcance": null,
            "raio": null,
            "efeito": "Nesse nível a atração por sua mana é tão intensa que o alcance é de 10 Km e os espíritos não serão hostis a você inicialmente. Porém essa intensidade pode atrair espíritos que estão além do plano natural faznedo com que espíritos ou criaturas indesejadas atravessem o plano espectral para o natural. O conjurador pode solicitar auxílio temporário externo a esses espíritos ou mesmo ser incorporado pelo mesmo adquirindo assim possíveis habilidades ou magias que ele pudesse ter assim como alguns traços físicos. Trocar de corpo com outra criatura agora tem o grau de dificuldade diminuida em 1."
          },
          "3": {
            "custo": null,
            "alcance": null,
            "raio": null,
            "efeito": ""
          }
        }
      },
      {
        "id": "lamina_espiritual",
        "nome": "LÂMINA ESPIRITUAL",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": "O conjurador envolve um alvo, elemento ou objeto com um encantamento espectral visível que consegue tocar espíritos e energia espiritual (MANA). Encantado com a mesma o alvo consegue tocar e interagir físicamente com elementos, alvos, seres, do plano espectral, ou seja, tocar, carregar e dar dano agora é possível contra espíritos e alvos do plano Espectral. Alvos do plano físico que sofrem dano por essa fonte perdem a mesma quantidade de VIDA em MANA. Outras magias e encantamentos que entrarem em contato com esta causa a anulação de ambas."
          },
          "2": {
            "custo": 3,
            "alcance": 1,
            "raio": 1,
            "efeito": "A intensidade do encantamento se eleva causando também dano adicional baseado na intensidade da conjuração. Além disso, ao contato com seres do plano físico, a perda de MANA é causada mesmo que o alvo não sofra dano em sua VIDA."
          },
          "3": {
            "custo": 3,
            "alcance": 1,
            "raio": null,
            "efeito": ""
          }
        }
      },
      {
        "id": "vinculo_espiritual",
        "nome": "VINCULO ESPIRITUAL",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": "O conjurador com sua magia consegue vincular um espírito a um objeto sendo esse seu novo lar ou uma prisão. Se for de forma pacífica nenhum teste é exigido, mas via de regra nenhum espírito deseja ser aprisionado, sendo assim testes SOCIAIS extras precisarão ser concluídos para que a magia seja finalizada, ou se preferir, 1 HUMANIDADE pode ser paga pelo conjurador para que a magia seja concluída instantâneamente. Um objeto com um espírito vinculado a ele pode externálizar o poder do espírito. A intensidade desse poder depende do poder do espírito, do material do objeto utilizado e do vínculo criado entre portador do objeto e quem o estiver utilizando. Somente 1 espírito pode ser vinculado a 1 objeto por vez."
          },
          "2": {
            "custo": 3,
            "alcance": 1,
            "raio": 1,
            "efeito": "O vinculo pode agora ser usado em um ser vivo além de qualquer objeto. O espírito tem uma atuação maior podendo se comunicar com o mundo e realizar movimentos dependendo da naruteza do objeto em que foi preso e sua força espiritual. Quando vinculado em um ser vivo, se este dividir o corpo com outro espírito, consegue tomar controle do mesmo em situações de inconciencia do ser vivo ou quando este estiver dormindo. Nesse estado, ambos hospedeiro e espírito poderão ter acesso as habilidades e magias um do outro. A principio as personalidades serão distintas, mas com o tempo ou eventos específicos os espíritos se fundirão em um só ser. Testes SOCIAIS ou de CONSCIÊNCIA podem ser requisitados para se manter o controle."
          },
          "3": {
            "custo": null,
            "alcance": null,
            "raio": null,
            "efeito": ""
          }
        }
      }
    ]
  },
  {
    "id": "mental",
    "nome": "MENTAL",
    "skills": [
      {
        "id": "levitar",
        "nome": "LEVITAR",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 5,
            "raio": null,
            "efeito": "O conjurador canaliza sua energia invisível em alvos podendo movê-los contra a gravidade ou em qualquer sentido e até mesmo realizar resistência de projéteis ou alvos que estejam em movimento. O limite de peso a ser carregado dessa maneira é de 5kg X intensidade de conjuração da magia."
          },
          "2": {
            "custo": 3,
            "alcance": 10,
            "raio": 1,
            "efeito": "Nesse nível pode-se mover tudo que estiver dentro do raio da magia com limite de peso igual a 20Kg X intensidade de conjuração. No momento da conjuração pode ser escolhido diferentes alvos ou ações para os objetos manipulados dessa forma. Ao custo de uma ação pode ser alterado o trajeto dos objetos que estão sendo movidos."
          },
          "3": {
            "custo": 5,
            "alcance": 20,
            "raio": 2,
            "efeito": "A intensidade nesse nível da magia é de 100Kg x a intensidade de conjuração e o conjurador pode realizar até 2 alterações nos movimentos dos alvos por ação."
          }
        }
      },
      {
        "id": "ocultar",
        "nome": "OCULTAR",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": "O usuario passa despercebido em situacoes comuns, tende a ser ultimo alvo em batalhas"
          },
          "2": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": "O usuario passa despercebido em situacoes comuns e magias, tende a ser ultimo alvo em batalhas"
          },
          "3": {
            "custo": 2,
            "alcance": 2,
            "raio": null,
            "efeito": "O alvo passa despercebido em situacoes comuns e magias, tende a ser ultimo alvo em batalhas"
          }
        }
      },
      {
        "id": "iludir",
        "nome": "ILUDIR",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 3,
            "alcance": 5,
            "raio": 1,
            "efeito": "Altera os sentidos de um alvo com uma ilusão que pode envolver 1 ou mais sentidos e pode ser resistida se sua origem lhe parecer absurda ou se os alvos tiverem sucesso em teste de percepção + ciência. Enquanto sob efeito da ilusão, o mestre pode considerar vantagens ou desvantagens em testes em que o alvo afetado estiver. Duração de uma cena ou 3 turnos sob estresse de batalha"
          },
          "2": {
            "custo": 3,
            "alcance": null,
            "raio": null,
            "efeito": "Altera os sentidos de um alvo com uma ilusão de 1 de raio sob visão"
          },
          "3": {
            "custo": 3,
            "alcance": null,
            "raio": null,
            "efeito": "Altera os sentidos de alvos em 3 de raio com uma ilusão de 3 de raio sob visão"
          }
        }
      },
      {
        "id": "telepatia",
        "nome": "TELEPATIA",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": null,
            "raio": null,
            "efeito": "O usuário pode se comunicar com alguém que possui contato visual sem mover seus lábios ou entoar palavras. Ele o faz usando seu pensamento. Somente o alvo te escuta, mas pode gastar 1 de mana adicional para cada alvo extra que deseja se comunicar com aquela mensagem. Feito isso pode aplicar uma ORDEM como se fosse um teste social. ORDEM (Teste CARISMA + LABIA), alvo resiste pagando 1FV (Teste RACIOCINIO + INSTINTO)"
          },
          "2": {
            "custo": 3,
            "alcance": null,
            "raio": null,
            "efeito": "Se comunica com alguém que já utilizou magia anteriormente sem necessidade contato visual, pode aplicar ORDEM (Se contato visual +2 sucessos)"
          },
          "3": {
            "custo": 3,
            "alcance": null,
            "raio": null,
            "efeito": "Pode realizar um ritual com o qual mantem contato permanente com o alvo podendo usar a magia para se comunicar quando quiser, pode aplicar ORDEM (Se contato visual +4 sucessos, sob ritual +5)"
          }
        }
      },
      {
        "id": "remanejar_pensamentos",
        "nome": "REMANEJAR PENSAMENTOS",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 3,
            "alcance": null,
            "raio": null,
            "efeito": "Altera/insere/apaga uma memoria curta de 1 alvo que possa ver ou que possa ouvi-lo. Essa memória está aflorada e tem interferencia imeditata dentro dos interesses e decisões que esse alvo possa tomar dali para frente. Após o termino da magia, se a memória for muito forte o alvo saberá que estava sob influência de uma magia e poderá ser hostil a isso."
          },
          "2": {
            "custo": 3,
            "alcance": null,
            "raio": null,
            "efeito": "Altera/insere/apaga memoria de 1 alvo sob visão"
          },
          "3": {
            "custo": 3,
            "alcance": null,
            "raio": null,
            "efeito": "Altera/insere/apaga memoria de alvos em 2 de raio sob visão"
          }
        }
      },
      {
        "id": "induzir_sentimentos",
        "nome": "INDUZIR SENTIMENTOS",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": null,
            "raio": null,
            "efeito": "O conjurador se encanta com sua magia adquirindo características encantadoras. Então, com um olhar penetrante e palavras sutis o usuário pode induzir sentimentos e sensações intensas no alvo/alvos que estiverem no alcance dessa magia. A mesma pode criar uma ótima sensação de riso e conforto como também um terror momentânio sufocante. Consede 1 Grau de resistência a testes SOCIAIS e se vencer testes sociais impede o alvo de realziar o primeiro teste de resistência contra essa vitória. Qualquer novo teste SOCIAL sobre um alvo afetado pela magia causa o cancelamento desta."
          },
          "2": {
            "custo": 3,
            "alcance": null,
            "raio": 1,
            "efeito": ""
          },
          "3": {
            "custo": null,
            "alcance": null,
            "raio": null,
            "efeito": ""
          }
        }
      },
      {
        "id": "compreensao_de_simbolos_e_expressoes",
        "nome": "COMPREENSÃO DE SIMBOLOS E EXPRESSÕES",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": null,
            "raio": null,
            "efeito": "O usuário é um interpretador nato, ele consegue ler nas entrelinhas, perceber e decifrar simbolos, frases, desenhos, sorrisos, gestos e expressões de modo a se adaptar facilmente e conseguir se comunicar em quaisquer linguas que tiverem uma lógica. Com essa vantagem qualquer teste SOCIAL que realizar terá 1 grau de facilidade."
          },
          "2": {
            "custo": 3,
            "alcance": 5,
            "raio": 1,
            "efeito": "Agora o conjurador ou os alvos em que utilizar essa magia poderão também ler, escrever sem dificuldades em outras linguas desde que tenham estimulos para isso: alguem falando a lingua, lendo em algum lugar, entre outros. Poderão também criar um dialeto próprio seja baseado em escrita, mímica, sons, etc. Além disso a percepção é tão apurada que poderá antecipar movimentos adquirindo vantagem em testes de iniciativa podendo somar 5 sucessos."
          },
          "3": {
            "custo": null,
            "alcance": null,
            "raio": null,
            "efeito": ""
          }
        }
      }
    ]
  },
  {
    "id": "profano",
    "nome": "PROFANO",
    "skills": [
      {
        "id": "trilha_da_sombra",
        "nome": "TRILHA DA SOMBRA",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": 2,
            "efeito": "O conjurador canaliza uma esfera magica em um espaço vazio ou em um alvo criando a partir desta uma névoa que se espalha causando uma penumbra com características atípicas, apesar de se comportar como uma névoa é apenas o efeito da magia e não deve ser tratada físicamente com uma névoa. O conjurador pode alterar sua densidade ao ser conjurada podendo escolher se dentro dessa penumbra o som ficará abafado ou se existirá visibilidade dentro da mesma, mas sempre será impossível em condições normais alguem que está fora da área da magia enxergar qualquer alvo ou estrutura que estiver na área da penumbra. Todas as caracteríscas da penumbra afetas quaisquer seres incluindo o conjurador. Qualquer teste de acerto, conjuração que tenha um alvo ou de percepção é tratado no mímino com 1 grau a mais de dificuldade, na sorte ou a critário do mestre."
          },
          "2": {
            "custo": 3,
            "alcance": 10,
            "raio": 3,
            "efeito": "Agora o conjurador faz da penumbra seu território podendo ver com perfeição dentro do mesmo ou em demais locais em que a luz natural não seja o suficiente para iluminar. Este ainda pode fazer com que parte de seu corpo tenha interação com as sombras podendo se mover com o dobro de deslocamento em áreas que sua sombra se conectar com outras. O mesmo vale para testes de acerto físico e esquivas concedendo 5 sucessos adicionais enqaunto estiver nas sombras."
          },
          "3": {
            "custo": 1,
            "alcance": 3,
            "raio": null,
            "efeito": ""
          }
        }
      },
      {
        "id": "consulta_profana",
        "nome": "CONSULTA PROFANA",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": null,
            "raio": null,
            "efeito": "O conjurador, com uma amostra de sangue, consegue utilizar sua magia para obter informações da amostra. Com isso é possível saber caracteríticass aproximadas do alvo como: Idade, sexo, altura, aparencia e algumas maestrias dependendo da intensidade da conjuração. Adicionalmente é possível saber a condição atual do alvo, distancia aproximada se estiver a menos de 10km e ter algumas sensações do mesmo nesse instante (em fuga, em luta, sob prazer, entre outros)."
          },
          "2": {
            "custo": 3,
            "alcance": null,
            "raio": null,
            "efeito": "Nesse nível a ligação entre conjurador e alvo se tronam profundas de modo que é possível se comunicar com o alvo falando em sua mente, ouvir o que ele fala, vê e sente. O acesso a suas maestrias é total podendo utiliza-las e, possivelmente adquiri-las dessa maneira como se estivesse recebendo treinamento. O limite para a interação dessa magia agora é de 100km."
          },
          "3": {
            "custo": 1,
            "alcance": 1,
            "raio": null,
            "efeito": ""
          }
        }
      },
      {
        "id": "sentenca_profana",
        "nome": "SENTENÇA PROFANA",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": "Essa magia também conta como uma MALDIÇÃO. Ao aplicar a sentença contra o alvo o conjurador escolhe uma perícia do alvo, a magia causa debilidade da mesma o impedindo de realizar testes com a mesma. Além disso ainda causa no alvo perda temporária de algum sentido baseado em algumas situações e de forma cumulativa. Se o alvo não se alimentou naquele dia: causa perda de paladar. Se o alvo na cena perceu ou perder vida = causa perda de tato. Se o alvo perdeu ou perder energia: causa perda da audição. Se o alvo perdeu ou perder mana: causa perda de olfato. Se o alvo perdeu os 4 sentidos na mesma cena, ele perde também a visão durante a cena."
          },
          "2": {
            "custo": 3,
            "alcance": 5,
            "raio": 1,
            "efeito": "Agora 3 perícias podem ser debilitadas e um contrato pode ser firmado. Se exisitr concentimento nenhum teste precisa ser realizado, do contrário o alvo precisará sem convencido socialmente e isso custará 1 HUMANIDADE. O contrato deve ter obrigações de ambas as partes, duração de pelo menos 1 dia e a sentença para a parte que não cumprir será sempre a morte (desde que a magia esteja ativa quando o contrato for quebrado. O conjurador não pode cancelar a magia a sua vontade."
          },
          "3": {
            "custo": 1,
            "alcance": 3,
            "raio": null,
            "efeito": ""
          }
        }
      },
      {
        "id": "marca_da_maldicao",
        "nome": "MARCA DA MALDIÇÃO",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": "O conjurador aplica uma marca como uma tatuagem mágica em um alvo, essa marca permanece durante toda uma cena identificando o usuario com uma aura sinistra deixando evidente sua localização quando comparado a alvos comuns. Ela possui um simbolo específico que causa diferentes efeitos. Um alvo com uma madição não sofre morte final. Isso não evita que ele desmaie, adquira condições ou perca seus membros, mas permanece com vida até que se recupere ou que a marca da maldição deixe de existir. Somente uma única marca por vez pode existir em um alvo. Marca do COIOTE: mover-se em um turno consome 1 ENERGIA. Marca da ANTA: qualquer teste mental precisa consumir 1 MANA adicional para ser realizado. Marca do COELHO: é prejudicado em 1 grau em todos os testes sociais. Marca do ELEFANTE: não é possível realizar teste de furtividade."
          },
          "2": {
            "custo": 3,
            "alcance": 5,
            "raio": 1,
            "efeito": "Novas marcas são adquiridas. Marca do FAIZÃO: habilidades de armas custam 5 VIDA adicional. Marca do LOBO: ao sofrer dano, perde 2x desse dano e não pode ser curado. Marca da CAPIVARA: adquire a condição cansado. Marca do COBRA: adquire a condição sangramento 2 ou envenenado 2. Marca do CARNEIRO: não se recupera de condições."
          },
          "3": {
            "custo": 1,
            "alcance": 4,
            "raio": null,
            "efeito": ""
          }
        }
      },
      {
        "id": "mancha_mental",
        "nome": "MANCHA MENTAL",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": 2,
            "efeito": "O conjurador canaliza e lança uma esfera de magia que tem ação em uma área específica criando nesta uma região de antimagia de que torna impossível a conjuração de 1 de qualquer magia que você possua conhecimento ou que já fora utilizada nessa cena. Além disso, toda vez que um conjurador utilizar alguma magia da mesma MAESTRIA da magia escolhida ele consome 1 MANA adicional e o conjurador dessa magia recupera 1 de MANA."
          },
          "2": {
            "custo": 2,
            "alcance": 10,
            "raio": 3,
            "efeito": ""
          },
          "3": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": ""
          }
        }
      },
      {
        "id": "transfigurar",
        "nome": "TRANSFIGURAR",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": "O conjurador utiliza sua magia para transfigurar um alvo para a forma de uma criatura TEMPORARIAMENTE. Para tal ele deve ter provado parte de seu corpo (sangue, carne, mana, unha, etc) e a partir disso poderá pelo prazo de 24h utilizar a transfiguração. Essa transfiguração, depois de utilizada a magia, é instantânea e lhe consegue aparência perfeita alé da voz, gestos e outros hábitos. Pórem não concede conhecimento, habilidades magias, de profissão ou físicas."
          },
          "2": {
            "custo": 3,
            "alcance": 5,
            "raio": null,
            "efeito": "Nesse nível o conjurador pode também transfigurar PERMANENTEMENTE um alvo. Para tal um vinculo deve ser criado banhando todo seu corpo com sangue da criatura ou absorvendo 10 pontos de MANA do mesmo. Além disso, o processo afeta a alma do conjurador lhe causando a perda de 1 HUMANIDADE. Além das caracteríticas padrão assumidas, o alvo transfigurado agora tem acesso as habilidades físicas, magias e profissões da nova forma assumida."
          },
          "3": {
            "custo": 5,
            "alcance": 1,
            "raio": null,
            "efeito": ""
          }
        }
      },
      {
        "id": "invocacao",
        "nome": "INVOCAÇÃO",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": "O conjurador encanta seres que uma vez perderam suas vidas. Essa conjuração é TEMPORÁRIA. Criaturas que receberem sangue do conjurador ( 1 VIDA) poderão ser erguidas dessa maneira. Esta volta a vida obedecendo ordens do invocador incondicionalmente, porém em seu estado físico atual. Depois que recebida a ordem, se na criatura prevalece seus instintos ela faz seu melhor para cumprir a tarefa, caso na criatura prevaleça a racionalidade, ela pode dialogar e chegar em soluções melhores para a resolução do problema. Ao acabar a magia os corpos simplesmente voltam a perder suas vidas e cair ao chão. A invocação dura enquanto o invocador permitir, pela duração máxima da magia ou tiver mana para mante-la. Custo 1 de mana por turno."
          },
          "2": {
            "custo": 3,
            "alcance": 5,
            "raio": 1,
            "efeito": "O conjurador invoca seres que uma vez perderam suas vidas. Essa invocação é PERMANENTE: Cria um vinculo com uma criatura ao comer seu coração, se a critaura não era conivente com o ato um custo de 1 HUMANIDADE é cobrato pelo ritual. Esta pode ser invocada posteriomente obedecendo ordens do invocador incondicionalmente. Uma criatura PERMANENTE desaparece magicamente quando a magia acaba, mas pode ser materializada posteriormente pelo conjurador ao reutilizar essa magia. Se essa criatura sofre uma segunda morte, esse ritual se desfaz e a existência da criatura some. A invocação dura enquanto o invocador permitir, sua duração máxima ou tiver mana para mante-la. Custo 1 de mana por turno. Não existe um limite de criaturas permanentes."
          },
          "3": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": ""
          }
        }
      }
    ]
  },
  {
    "id": "temporal",
    "nome": "TEMPORAL",
    "skills": [
      {
        "id": "esmoris",
        "nome": "ESMORIS",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": "O conjurador primeiro canaliza sua magia em um alvo que recebe o nome PORTADOR, depois cria um vinculo magico em um ponto do espaço que esteja desocupado ou em um alvo, recebe o nome DESTINO. O DESTINO passa ser o ponto focal da magia. Depois de 3 turnos o PORTADOR retorna magicamente ao local de DESTINO."
          },
          "2": {
            "custo": 3,
            "alcance": 5,
            "raio": 1,
            "efeito": "Nesse nível o conjurador consegue realizar no momento da conjuração a criação de 2 DESTINOS. Os DESTINOS devem ser escolhidos no momento da conjuração e, ao final da magia o conjurador pode escolher em qual destino retornará. Adicionalmente o conjurador pode antecipar o momento de retorno ao DESTINO ou aguardar até 5 turnos."
          },
          "3": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": ""
          }
        }
      },
      {
        "id": "reverberus",
        "nome": "REVERBERUS",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": "O conjurador canaliza sua magia em um alvo/área de até 2m3 retrocedendo o tempo e todas as condições do mesmo exatamente com estavam em até 1 minuto atrás. Um alvo que sofreu ação dessa magia não consegue ser alvo da mesma pelas proximas 24h. (A alteração se aplica em durabilidade, condições e recursos que estiverem sendo afetadas nesse momento. O alvo não muradá de local, ou pertences que não estiverem sendo alvos das magia são reaparecerão, tampouco atributos, perícias ou EXP sofrerão alterações)."
          },
          "2": {
            "custo": 3,
            "alcance": 5,
            "raio": 1,
            "efeito": "Nesse nível o conjurador consegue retornar as condições de um alvo no tempo em até 10 dias e a penalidade para uso posterior da magia no mesmo alvo cai para uma cena."
          },
          "3": {
            "custo": 3,
            "alcance": 5,
            "raio": null,
            "efeito": ""
          }
        }
      },
      {
        "id": "rapidez",
        "nome": "RAPIDEZ",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": "Possibilita realizar uma ação de movimento/ação física instantâneamente que aparenta ser teletransporte. O limite de movimento de um conjurador é sua movimentação padrão. Seus ataques e esquivas ainda necessitam de um lance de dados e somam 10 sucessos nos mesmos."
          },
          "2": {
            "custo": 3,
            "alcance": null,
            "raio": null,
            "efeito": "Dobra o deslocamento do alvo e suas esquivas são automáticas enquanto durar a magia. Esta magia tem um custo adicional de 1 MANA por turno."
          },
          "3": {
            "custo": null,
            "alcance": null,
            "raio": null,
            "efeito": ""
          }
        }
      },
      {
        "id": "visao",
        "nome": "VISÃO",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": null,
            "raio": null,
            "efeito": "Ao tocar um objeto, se concentrar dentro de um cômodo ou referência do tipo, o conjurador consegue obter informações com visões daquele local que ocorreram ali. Ao buscar especificamente sobre algo obtem mais chances de sucesso de ter precisão nas visões, caso contrário terá informações genéricas sobre as visões. A intensidade da magia modula o limite de informações que consegue obter. O de tempo limite que consegue navegar na visão é de até 1 semana."
          },
          "2": {
            "custo": 3,
            "alcance": null,
            "raio": null,
            "efeito": "Nesse nível o conjurador conseguirá ter visões de anos atrás limitado a intensidade de sua conjuração. Cada intensidade te consede informações adicionais ou 1 ano adicional que consegue viajar no passado em sua percepção. Além disso sua percpção fica tão apurada que, mesmo que não estiver usando esta magia, poderá realizar ações antes que qualquer outro em previsão daquele evento. Essa capacidade tem prioridade mesmo antes de testes de iniciativa."
          },
          "3": {
            "custo": null,
            "alcance": null,
            "raio": null,
            "efeito": ""
          }
        }
      },
      {
        "id": "previsao",
        "nome": "PREVISÃO",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": "O conjurador pode sentir a sensação do clima em até 1 dia de precisão no que se refere a alterações climáticas. Saberá se vai chover, nevar, se estará quente, etc. O alcance dessa previsão é de até 70km (1 dia de viagem). A analise pode sofrer nuancias de acordo com o relevo e alteração natural do clima, mas sob condições normais é possível sentir que o clima irá alterar. O Conjurador pode também, ao realizar a magia em um alvo, ter uma sensação, em um local específico de até 1km, de energias do universo e traços temporais que o fazem acreditar que provavelmente terão mais sorte ou azar em eventos que acontecerão por ali com precisão de até 1 dia. Não se sabe a hora exata do evento, mas ele provavelmente acontecerá dentro desse limite de tempo. Nunca se tem ideia do que será o evento, só se sabe se trará mais sorte ou azar para aquele no qual a magia está sendo utilizada."
          },
          "2": {
            "custo": 3,
            "alcance": null,
            "raio": null,
            "efeito": "O conjurador agora pode sentir a condição do clima com até 3 dias de antecedência. Saberá se vai chover, nevar, se estará quente, etc. Consegue agora ter a noção de eventos mais promissores a sorte ou de extremo azar com exatidão maior do local, limitado a um raio de 100m e quando acontecerá com exatidão de até 1 hora para mais ou para menos do momento exato do evento. Exemplo: Em 2 dias nessa cidade algo terrivél irá acontecer proximo do meio dia nos arredores da catedral."
          },
          "3": {
            "custo": null,
            "alcance": null,
            "raio": null,
            "efeito": ""
          }
        }
      },
      {
        "id": "lapso_temporal",
        "nome": "LAPSO TEMPORAL",
        "maxLevel": 3,
        "niveis": {
          "1": {
            "custo": 2,
            "alcance": 1,
            "raio": null,
            "efeito": "Conjura uma área de 2m3 com distorção temporal causando lentidão/aceleração em um alvo por 1 turno. Dentro da área o alvo tem a mobilidade reduzida/aumentada para 3 e perde/ganha uma ação. Testes de destreza podem ser substituidos por força ou visse versa enquanto durar a magia e estiver na área de efeito. O mesmo se aplica a objetos e projéteis dentros da área afetada."
          },
          "2": {
            "custo": 3,
            "alcance": 5,
            "raio": 1,
            "efeito": "Nesse nível a mobilidade do alvo é alterada em até 10 e seus testes de DESTREZA e RACIOCÍNIO tem alteração igual a intensidade da conjuração."
          },
          "3": {
            "custo": null,
            "alcance": null,
            "raio": null,
            "efeito": ""
          }
        }
      }
    ]
  }
];

export const ALL_TRAILS = {
  profissoes: TRAILS_PROFISSOES,
  armas: TRAILS_ARMAS,
  magias: TRAILS_MAGIAS,
};

export function findTrail(trailId) {
  for (const trails of Object.values(ALL_TRAILS)) {
    const found = trails.find(t => t.id === trailId);
    if (found) return found;
  }
  return null;
}

// Retorna todas as trilhas da mesma categoria (para armas agrupadas)
export function findCategoryTrails(categoria) {
  return TRAILS_ARMAS.filter(t => t.categoria === categoria);
}