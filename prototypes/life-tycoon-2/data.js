// PROTOTYPE - NOT FOR PRODUCTION
// Question: Does inclination-driven action visibility + branch tech discovery + succession feel engaging?
// Date: 2026-05-26

'use strict';

const UNIVERSAL_TECHS = [
  { id: "ut_talla_laminar", name: "Talla Laminar", description: "Tècnica de talla de sílex per làmines primes i regulars.", cycle: 2 },
  { id: "ut_vestimenta", name: "Confecció de Vestimentes", description: "Costura amb agulles d'os per unir pells.", cycle: 4 },
  { id: "ut_art_simbolic", name: "Art Simbòlic", description: "Representació simbòlica: gravats, pintures, figuretes.", cycle: 6 }
];

const BRANCH_TECHS = [
  {
    id: "bt_cacera_coordinada", name: "Caça Coordinada",
    universal_prereq: "ut_talla_laminar",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "impuls", min: 0.15 }, { axis: "sociabilitat", min: 0.10 }] },
    unlocks_action_ids: ["act_cacera_gran", "act_trampes_avancades"]
  },
  {
    id: "bt_punt_llanca", name: "Punta de Llança Composta",
    universal_prereq: "ut_talla_laminar",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "impuls", min: 0.25 }, { axis: "sociabilitat", max: 0.20 }] },
    unlocks_action_ids: ["act_caca_solitaria", "act_territori"]
  },
  {
    id: "bt_agulla_os", name: "Agulla d'Os i Costura de Pell",
    universal_prereq: "ut_vestimenta",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "intel·lecte", min: 0.15 }, { axis: "impuls", max: 0.20 }] },
    unlocks_action_ids: ["act_confeccio_roba", "act_utensilis_os"]
  },
  {
    id: "bt_curar_herbes", name: "Coneixement d'Herbes Medicinals",
    universal_prereq: "ut_vestimenta",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "espiritualitat", min: 0.20 }, { axis: "intel·lecte", min: 0.10 }] },
    unlocks_action_ids: ["act_curar_grup", "act_herbes_toxiques"]
  },
  {
    id: "bt_pintura_rupestre", name: "Pintura Rupestre",
    universal_prereq: "ut_art_simbolic",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "espiritualitat", min: 0.30 }, { axis: "sociabilitat", min: 0.20 }] },
    unlocks_action_ids: ["act_ritual_caca", "act_narracio_llegendes"]
  },
  {
    id: "bt_figuretes_venus", name: "Figuretes i Talismans",
    universal_prereq: "ut_art_simbolic",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "intel·lecte", min: 0.20 }, { axis: "espiritualitat", min: 0.25 }] },
    unlocks_action_ids: ["act_talismans", "act_bescanvi_simbolic"]
  }
];

const ACTIONS = [
  // BASE (always active, start purchased)
  {
    id: "act_espiar_ramat", name: "Espiar el Ramat", is_base: true,
    description: "Observes els moviments d'un ramat des d'un lloc cobert. Segur i eficaç.",
    execute_cost: 1, output_min: 2, output_max: 5,
    inclination_deltas: { impuls: +0.02, "intel·lecte": +0.01, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca"
  },
  {
    id: "act_recollectar_arrels", name: "Recol·lectar Arrels", is_base: true,
    description: "Busques arrels i baies comestibles al voltant del campament. Tranquil.",
    execute_cost: 1, output_min: 2, output_max: 4,
    inclination_deltas: { impuls: -0.01, "intel·lecte": +0.01, espiritualitat: 0, sociabilitat: +0.01 },
    event_pool_id: "pool_recollecta"
  },
  {
    id: "act_tallar_pedra", name: "Tallar Pedra", is_base: true,
    description: "Treballes el sílex amb cura per fer eines per al clan. Precís i meticulós.",
    execute_cost: 1, output_min: 1, output_max: 3,
    inclination_deltas: { impuls: -0.01, "intel·lecte": +0.02, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },
  {
    id: "act_ritual_foc", name: "Ritual del Foc", is_base: true,
    description: "Celebres el ritual diari del foc sagrat. Enforteix els vincles del grup.",
    execute_cost: 1, output_min: 1, output_max: 3,
    inclination_deltas: { impuls: 0, "intel·lecte": -0.01, espiritualitat: +0.03, sociabilitat: +0.02 },
    event_pool_id: "pool_ritual"
  },
  {
    id: "act_vigilar_campament", name: "Vigilar el Campament", is_base: true,
    description: "Protegeixes el campament i observes els voltants. Responsabilitat compartida.",
    execute_cost: 1, output_min: 2, output_max: 4,
    inclination_deltas: { impuls: +0.01, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.01 },
    event_pool_id: "pool_social"
  },

  // FAMILY ACTIONS (base, sequential: partner first, then children)
  {
    id: "act_cercar_parella", name: "Cercar Parella", is_base: true,
    description: "Busques company/a entre els grups veïns. Sense parella no hi ha successió.",
    execute_cost: 1, output_min: 0, output_max: 2,
    inclination_deltas: { impuls: -0.01, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.04 },
    event_pool_id: "pool_social"
  },
  {
    id: "act_tenir_fills", name: "Tenir Fills", is_base: true,
    description: "Formeu família. Els fills hereten coneixement i inclinació del llinatge.",
    execute_cost: 2, output_min: 0, output_max: 1,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.02, sociabilitat: +0.03 },
    event_pool_id: "pool_social"
  },

  // DISCOVERY ACTION (visible only when branch techs are eligible)
  {
    id: "act_escoltar_estrangers", name: "Escoltar els Estrangers", is_base: false, is_discovery_action: true,
    description: "Passes estona amb visitants d'un altre clan. Podries aprendre tècniques que no coneixies.",
    execute_cost: 0, output_min: 0, output_max: 0,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: null
  },

  // HUNTER branch
  {
    id: "act_cacera_gran", name: "Caça Gran", is_base: false,
    description: "El clan ataca preses grans en formació. Risc elevat, gran recompensa.",
    purchase_cost: 4, execute_cost: 2, output_min: 5, output_max: 12,
    inclination_requirements: { impuls: { min: 0.10, max: 1.0 } },
    inclination_deltas: { impuls: +0.05, "intel·lecte": -0.01, espiritualitat: 0, sociabilitat: +0.02 },
    event_pool_id: "pool_caca"
  },
  {
    id: "act_trampes_avancades", name: "Trampes Avançades", is_base: false,
    description: "Poseu trampes en llocs estratègics. Coordinació que multiplica el rendiment.",
    purchase_cost: 3, execute_cost: 1, output_min: 3, output_max: 8,
    inclination_requirements: { impuls: { min: 0.10, max: 1.0 }, sociabilitat: { min: 0.05, max: 1.0 } },
    inclination_deltas: { impuls: +0.02, "intel·lecte": +0.02, espiritualitat: 0, sociabilitat: +0.01 },
    event_pool_id: "pool_caca"
  },
  {
    id: "act_caca_solitaria", name: "Caça Solitària", is_base: false,
    description: "Surts sol al territori. Ràpid, independent i sense frens.",
    purchase_cost: 3, execute_cost: 2, output_min: 4, output_max: 10,
    inclination_requirements: { impuls: { min: 0.20, max: 1.0 }, sociabilitat: { min: -1.0, max: 0.25 } },
    inclination_deltas: { impuls: +0.06, "intel·lecte": 0, espiritualitat: 0, sociabilitat: -0.02 },
    event_pool_id: "pool_caca"
  },
  {
    id: "act_territori", name: "Marcar Territori", is_base: false,
    description: "Marques els límits del territori amb senyals clares. Dissuadeix grups rivals.",
    purchase_cost: 3, execute_cost: 1, output_min: 2, output_max: 5,
    inclination_requirements: { impuls: { min: 0.20, max: 1.0 } },
    inclination_deltas: { impuls: +0.03, "intel·lecte": 0, espiritualitat: 0, sociabilitat: -0.01 },
    event_pool_id: "pool_social"
  },

  // CRAFTSMAN branch
  {
    id: "act_confeccio_roba", name: "Confecció de Roba", is_base: false,
    description: "Cosius pells amb agulles d'os per fer roba duradora per al clan.",
    purchase_cost: 4, execute_cost: 2, output_min: 2, output_max: 6,
    inclination_requirements: { "intel·lecte": { min: 0.10, max: 1.0 } },
    inclination_deltas: { impuls: -0.02, "intel·lecte": +0.04, espiritualitat: 0, sociabilitat: +0.01 },
    event_pool_id: "pool_artesania"
  },
  {
    id: "act_utensilis_os", name: "Utensilis d'Os", is_base: false,
    description: "Crafteges eines de gran precisió amb fragments d'os i asta.",
    purchase_cost: 3, execute_cost: 1, output_min: 2, output_max: 5,
    inclination_requirements: { "intel·lecte": { min: 0.10, max: 1.0 }, impuls: { min: -1.0, max: 0.25 } },
    inclination_deltas: { impuls: -0.01, "intel·lecte": +0.03, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },

  // MYSTIC branch
  {
    id: "act_curar_grup", name: "Curar el Grup", is_base: false,
    description: "Prepareu remeis d'herbes per als membres malalts o ferits del clan.",
    purchase_cost: 3, execute_cost: 1, output_min: 2, output_max: 5,
    inclination_requirements: { espiritualitat: { min: 0.15, max: 1.0 } },
    inclination_deltas: { impuls: -0.01, "intel·lecte": +0.01, espiritualitat: +0.03, sociabilitat: +0.03 },
    event_pool_id: "pool_ritual"
  },
  {
    id: "act_herbes_toxiques", name: "Herbes Tòxiques", is_base: false,
    description: "Elabores extractes perillosos per capturar preses o defensar el grup.",
    purchase_cost: 3, execute_cost: 2, output_min: 3, output_max: 7,
    inclination_requirements: { espiritualitat: { min: 0.20, max: 1.0 }, "intel·lecte": { min: 0.05, max: 1.0 } },
    inclination_deltas: { impuls: +0.01, "intel·lecte": +0.02, espiritualitat: +0.02, sociabilitat: -0.01 },
    event_pool_id: "pool_ritual"
  },
  {
    id: "act_ritual_caca", name: "Ritual de Caça", is_base: false,
    description: "Invoqueu els esperits de la caça perquè guiïn les llances del clan.",
    purchase_cost: 3, execute_cost: 1, output_min: 1, output_max: 4,
    inclination_requirements: { espiritualitat: { min: 0.25, max: 1.0 }, sociabilitat: { min: 0.15, max: 1.0 } },
    inclination_deltas: { impuls: +0.01, "intel·lecte": 0, espiritualitat: +0.04, sociabilitat: +0.02 },
    event_pool_id: "pool_ritual"
  },
  {
    id: "act_narracio_llegendes", name: "Narrar les Llegendes", is_base: false,
    description: "Expliques les gestes i llegendes del llinatge davant del foc del campament.",
    purchase_cost: 3, execute_cost: 1, output_min: 1, output_max: 4,
    inclination_requirements: { espiritualitat: { min: 0.25, max: 1.0 }, sociabilitat: { min: 0.20, max: 1.0 } },
    inclination_deltas: { impuls: -0.01, "intel·lecte": 0, espiritualitat: +0.03, sociabilitat: +0.04 },
    event_pool_id: "pool_social"
  },
  {
    id: "act_talismans", name: "Crear Talismans", is_base: false,
    description: "Esculpiu figures propiciatòries que els membres del clan porten com a protecció.",
    purchase_cost: 4, execute_cost: 2, output_min: 2, output_max: 5,
    inclination_requirements: { "intel·lecte": { min: 0.15, max: 1.0 }, espiritualitat: { min: 0.20, max: 1.0 } },
    inclination_deltas: { impuls: -0.01, "intel·lecte": +0.03, espiritualitat: +0.03, sociabilitat: +0.01 },
    event_pool_id: "pool_artesania"
  },
  {
    id: "act_bescanvi_simbolic", name: "Bescanvi Simbòlic", is_base: false,
    description: "Intercanvieu objectes simbòlics amb grups veïns. Obren aliances i coneixement.",
    purchase_cost: 3, execute_cost: 1, output_min: 2, output_max: 5,
    inclination_requirements: { sociabilitat: { min: 0.10, max: 1.0 }, espiritualitat: { min: 0.15, max: 1.0 } },
    inclination_deltas: { impuls: -0.01, "intel·lecte": +0.01, espiritualitat: +0.02, sociabilitat: +0.04 },
    event_pool_id: "pool_social"
  }
];

const EVENT_POOLS = {
  pool_caca: [
    { id: "ev_rastre_fresc",    text: "Rastres frescos! El grup segueix la pista i torna amb extra.", effects: { food: +3 } },
    { id: "ev_bestia_ferida",   text: "Una bèstia ferida ataca. El caçador resulta ferit lleu.",      effects: { food: -1 } },
    { id: "ev_ramat_migracio",  text: "El ramat migra cap al nord. Les preses escassegen.",           effects: { food: -2 } },
    { id: "ev_caca_abundant",   text: "Temporada de caça abundant. Reserves extra per a la família.", effects: { food: +5 } },
    {
      id: "ev_desc_llancador", is_discovery_event: true, is_single_use: true,
      discovery_branch_tech_id: "bt_punt_llanca",
      text: "Mentre espies el ramat, veus un caçador d'un altre grup llançar una pedra amb un pal llarg. Abat la presa des d'una distància increïble.",
      options: [
        { text: "Apropar-te a observar (−2 Aliment)", food_delta: -2, discovers: true },
        { text: "Seguir el teu camí", food_delta: +2, discovers: false }
      ]
    },
    {
      id: "ev_desc_caca_coord", is_discovery_event: true, is_single_use: true,
      discovery_branch_tech_id: "bt_cacera_coordinada",
      text: "Trobes un grup de caçadors forans que encerclen una presa tots junts, amb senyals silenciosos. Cap dels teus no havia vist una coordinació així.",
      options: [
        { text: "Quedar-te a observar i aprendre (−2 Aliment)", food_delta: -2, discovers: true },
        { text: "Continuar amb la teva caça", food_delta: +2, discovers: false }
      ]
    }
  ],
  pool_recollecta: [
    { id: "ev_fruits_madurs",    text: "Fruits silvestres madurs. Una troballa inesperada.",            effects: { food: +3 } },
    { id: "ev_plantes_toxiques", text: "Algunes plantes eren tòxiques. Malestars al grup.",            effects: { food: -2 } },
    { id: "ev_bolets_rars",      text: "Bolets estranys però comestibles. Extra de provisions.",       effects: { food: +2 } }
  ],
  pool_artesania: [
    { id: "ev_eina_trencada",    text: "L'eina es trenca durant la feina. Cal refer-la.",              effects: { food: -1 } },
    { id: "ev_tecnica_nova",     text: "Un descobriment accidental millora la tècnica.",               effects: { food: +1 } },
    { id: "ev_intercanvi_eines", text: "Un grup veí demana eines a canvi de provisions.",              effects: { food: +2 } },
    {
      id: "ev_desc_agulla", is_discovery_event: true, is_single_use: true,
      discovery_branch_tech_id: "bt_agulla_os",
      text: "Mentre talles os, un fragment llarg i fi queda perfectament aguillonat. Un membre del grup el recull pensatiu: \"Amb un forat aquí, podríem cosir pells...\"",
      options: [
        { text: "Experimentar plegats (−2 Aliment)", food_delta: -2, discovers: true },
        { text: "Deixar-ho per a un altre moment", food_delta: +1, discovers: false }
      ]
    }
  ],
  pool_ritual: [
    { id: "ev_visio_profunda",   text: "Una visió durant el ritual guia el grup cap a recursos amagats.", effects: { food: +2 } },
    { id: "ev_ritual_cohesio",   text: "El ritual reforça la cohesió del grup.",                          effects: { food: +1 } },
    { id: "ev_espiritocontent",  text: "Els esperits estan contents. El grup se sent protegit.",          effects: { food: +1 } },
    {
      id: "ev_desc_herbes", is_discovery_event: true, is_single_use: true,
      discovery_branch_tech_id: "bt_curar_herbes",
      text: "Durant el ritual, un vell crema certes herbes que mai no has vist. Olora diferent. Algú amb mal de ventre s'ha millorat, i ningú no entén per qué.",
      options: [
        { text: "Demanar-li que t'ho expliqui", food_delta: 0, discovers: true },
        { text: "Observar en silenci", food_delta: +1, discovers: false }
      ]
    },
    {
      id: "ev_desc_pintura", is_discovery_event: true, is_single_use: true,
      discovery_branch_tech_id: "bt_pintura_rupestre",
      text: "En un moment de silenci prop d'una paret de roca, el foc projecta ombres que semblen animals movent-se. Per un instant, sents que podries fixar-les.",
      options: [
        { text: "Intentar dibuixar les formes amb fang", food_delta: -1, discovers: true },
        { text: "Guardar el moment per tu", food_delta: 0, discovers: false }
      ]
    }
  ],
  pool_social: [
    { id: "ev_dispute_interna",  text: "Una disputa interna distreu el grup.",                       effects: { food: -1 } },
    { id: "ev_aliat_nou",        text: "Un grup veí ofereix col·laboració temporal.",               effects: { food: +2 } },
    { id: "ev_lider_respectat",  text: "El respecte augmenta. El grup treballa millor.",            effects: { food: +1 } },
    {
      id: "ev_desc_figuretes", is_discovery_event: true, is_single_use: true,
      discovery_branch_tech_id: "bt_figuretes_venus",
      text: "Un visitant porta una petita figura d'os que representa una dona. Tothom la mira fascinat. Diu que porta sort i protecció.",
      options: [
        { text: "Demanar-li que t'ensenyi a fer-ne (−3 Aliment)", food_delta: -3, discovers: true },
        { text: "Admirar-la i tornar a la teva feina", food_delta: +1, discovers: false }
      ]
    }
  ]
};

const BRANCHES = [
  {
    id: "branch_hunter",   name: "Caçador",
    conditions: { operator: "AND", conditions: [{ axis: "impuls", min: 0.30 }, { axis: "sociabilitat", max: 0.30 }] }
  },
  {
    id: "branch_gatherer", name: "Recol·lector",
    conditions: { operator: "AND", conditions: [{ axis: "impuls", max: 0.10 }, { axis: "intel·lecte", max: 0.10 }] }
  },
  {
    id: "branch_craftsman", name: "Artesà",
    conditions: { operator: "AND", conditions: [{ axis: "intel·lecte", min: 0.25 }, { axis: "impuls", max: 0.20 }] }
  },
  {
    id: "branch_mystic",   name: "Místic",
    conditions: { operator: "AND", conditions: [{ axis: "espiritualitat", min: 0.30 }, { axis: "sociabilitat", min: 0.25 }] }
  }
];
