// PROTOTYPE - NOT FOR PRODUCTION
// Question: Does inclination-driven action visibility + branch tech discovery + succession feel engaging?
// Date: 2026-05-26

'use strict';

const UNIVERSAL_TECHS = [
  {
    id: "ut_talla_laminar", name: "Talla en Làmines", icon: "🪨", cycle: 2,
    description: "Làmines de sílex primes permeten eines i armes molt més eficaces.",
    effect: null
  },
  {
    id: "ut_vestimenta", name: "Cosit i Vestimenta", icon: "🧵", cycle: 4,
    description: "Agulles d'os per cosir pells d'animal. Permet colonitzar climes freds.",
    effect: { healthBonus: 2, desc: "+2 Salut permanent" }
  },
  {
    id: "ut_art_simbolic", name: "Art i Símbol", icon: "🎨", cycle: 6,
    description: "Art rupestre i objectes simbòlics. L'inici del pensament abstracte.",
    effect: null
  },
  {
    id: "ut_recollida_sistematica", name: "Recol·lecció Sistemàtica", icon: "🌿", cycle: 9,
    description: "Mòlta de plantes salvatges i emmagatzematge. Predecessor de l'agricultura.",
    effect: null
  },
  {
    id: "ut_conreu_incipient", name: "Conreu Incipient", icon: "🌾", cycle: 12,
    description: "Primera sembra intencional. Transició cap al Neolític.",
    effect: null
  }
];

const BRANCH_TECHS = [
  {
    id: "bt_punta_llanca", name: "Punta de Llança",
    universal_prereq: "ut_talla_laminar",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "impuls", min: 0.25 }, { axis: "sociabilitat", max: 0.30 }] },
    unlocks_action_ids: ["act_caca_llanca", "act_emboscada_nocturna"],
    passive_effect: null,
    is_hidden: false
  },
  {
    id: "bt_rasclador_fi", name: "Rasclador Fi",
    universal_prereq: "ut_talla_laminar",
    inclination_conditions: { operator: "OR", conditions: [{ axis: "impuls", max: 0.10 }, { axis: "intel·lecte", min: 0.20 }] },
    unlocks_action_ids: ["act_molda_grans", "act_faonar_eines"],
    passive_effect: { type: "action_output_bonus", action_id: "act_recollectar_arrels", output_min_bonus: 1, desc: "+1 mínim recol·lecta" },
    is_hidden: false
  },
  {
    id: "bt_buri", name: "Burí i Gravat",
    universal_prereq: "ut_talla_laminar",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "intel·lecte", min: 0.25 }, { axis: "impuls", max: 0.20 }] },
    unlocks_action_ids: ["act_gravar_os", "act_intercanviar_eines"],
    passive_effect: null,
    is_hidden: false
  },
  {
    id: "bt_agulla_os", name: "Agulla d'Os",
    universal_prereq: "ut_vestimenta",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "intel·lecte", min: 0.20 }, { axis: "impuls", max: 0.20 }] },
    unlocks_action_ids: ["act_cosir_pells", "act_construir_refugi"],
    passive_effect: { type: "one_time_health", amount: 3, desc: "+3 Salut (vestimenta)" },
    is_hidden: false
  },
  {
    id: "bt_trampes", name: "Trampes i Llaços",
    universal_prereq: "ut_vestimenta",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "impuls", min: 0.10 }] },
    unlocks_action_ids: ["act_parar_trampes"],
    passive_effect: null,
    is_hidden: false
  },
  {
    id: "bt_guariment_plantes", name: "Guariment amb Plantes",
    universal_prereq: "ut_vestimenta",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "espiritualitat", min: 0.25 }, { axis: "sociabilitat", min: 0.20 }] },
    unlocks_action_ids: ["act_curar_herbes"],
    passive_effect: { type: "event_block", event_id: "pe_malaltia", desc: "Bloqueja la Febre del Campament" },
    is_hidden: true
  },
  {
    id: "bt_pintura_rupestre", name: "Pintura Rupestre",
    universal_prereq: "ut_art_simbolic",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "espiritualitat", min: 0.30 }, { axis: "sociabilitat", min: 0.20 }] },
    unlocks_action_ids: ["act_pintar_parets", "act_narrar_llegendes"],
    passive_effect: { type: "unlock_zone", zone_id: "Ritual", desc: "Desbloqueja el Lloc Sagrat" },
    is_hidden: false
  },
  {
    id: "bt_marques_territori", name: "Marques de Territori",
    universal_prereq: "ut_art_simbolic",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "impuls", min: 0.20 }, { axis: "intel·lecte", min: 0.05 }] },
    unlocks_action_ids: ["act_marcar_territori", "act_rastreig_rutes"],
    passive_effect: null,
    is_hidden: false
  },
  {
    id: "bt_ornaments", name: "Ornaments i Adorn",
    universal_prereq: "ut_art_simbolic",
    inclination_conditions: { operator: "OR", conditions: [{ axis: "espiritualitat", min: 0.20 }, { axis: "sociabilitat", min: 0.25 }] },
    unlocks_action_ids: ["act_ornamentar_se", "act_consagrar_ornaments"],
    passive_effect: null,
    is_hidden: false
  },
  {
    id: "bt_coneixement_plantes", name: "Coneixement de Plantes",
    universal_prereq: "ut_recollida_sistematica",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "intel·lecte", max: 0.05 }, { axis: "impuls", max: 0.10 }] },
    unlocks_action_ids: ["act_recollida_bolets", "act_assecament_plantes"],
    passive_effect: null,
    is_hidden: false
  },
  {
    id: "bt_calendari_natural", name: "Calendari Natural",
    universal_prereq: "ut_recollida_sistematica",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "espiritualitat", min: 0.20 }, { axis: "intel·lecte", max: 0.05 }] },
    unlocks_action_ids: ["act_observar_cel", "act_transit_nocturn"],
    passive_effect: { type: "one_time_materials", amount: 2, desc: "+2 Provisions (previsió de cicles)" },
    is_hidden: true
  },
  {
    id: "bt_llavor_selectiva", name: "Llavor Selectiva",
    universal_prereq: "ut_conreu_incipient",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "intel·lecte", max: 0.05 }, { axis: "impuls", max: 0.10 }] },
    unlocks_action_ids: ["act_seleccionar_llavors"],
    passive_effect: null,
    is_hidden: false
  },
  {
    id: "bt_domini_terra", name: "Domini de la Terra",
    universal_prereq: "ut_conreu_incipient",
    inclination_conditions: { operator: "OR", conditions: [{ axis: "impuls", min: 0.10 }, { axis: "intel·lecte", max: 0.05 }] },
    unlocks_action_ids: ["act_control_territori"],
    passive_effect: { type: "one_time_health", amount: 2, desc: "+2 Salut (domini del territori)" },
    is_hidden: false
  }
];

// output_resource: "food" (default) | "eines" | "health"
// health_delta: side-effect on health (negative = risky, positive = restorative)
// stat_key: "forca" | "enginy" | "vincle" — which stat multiplies output + grows on use
// stat_gain: how much the stat grows per execution
// destresa_id/name/threshold: personal skill discovered after N uses of this action
// is_upgrade / upgrades_action_id: substitutory improved action, replaces base when purchased
const ACTIONS = [
  // BASE
  {
    id: "act_espiar_ramat", name: "Espiar el Ramat", is_base: true, zona: "Planes",
    description: "Observes els moviments d'un ramat des d'un lloc cobert. Segur i eficaç.",
    execute_cost: 1, output_resource: "food", output_min: 2, output_max: 5,
    stat_key: "forca", stat_gain: 0.10,
    destresa_id: "d_rastreig", destresa_name: "Rastreig", destresa_threshold: 5,
    inclination_deltas: { impuls: +0.02, "intel·lecte": +0.01, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca"
  },
  {
    id: "act_recollectar_arrels", name: "Recol·lectar Arrels", is_base: true, zona: "Planes",
    description: "Busques arrels i baies comestibles al voltant del campament. Tranquil.",
    execute_cost: 1, output_resource: "food", output_min: 2, output_max: 4,
    stat_key: "forca", stat_gain: 0.10,
    destresa_id: "d_botanica", destresa_name: "Botànica", destresa_threshold: 5,
    inclination_deltas: { impuls: -0.01, "intel·lecte": +0.01, espiritualitat: 0, sociabilitat: +0.01 },
    event_pool_id: "pool_recollecta"
  },
  {
    id: "act_tallar_pedra", name: "Tallar Pedra", is_base: true, zona: "Campament",
    description: "Treballes el sílex amb cura per fer eines per al clan. Precís i meticulós.",
    execute_cost: 0, output_resource: "eines", output_min: 1, output_max: 3,
    stat_key: "enginy", stat_gain: 0.10,
    destresa_id: "d_talla_silex", destresa_name: "Talla de Sílex", destresa_threshold: 5,
    inclination_deltas: { impuls: -0.01, "intel·lecte": +0.02, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },
  {
    id: "act_ritual_foc", name: "Ritual del Foc", is_base: true, zona: "Campament",
    description: "Celebres el ritual diari del foc sagrat. Enforteix els vincles del grup.",
    execute_cost: 1, output_resource: "food", output_min: 1, output_max: 3, health_delta: +1,
    stat_key: "vincle", stat_gain: 0.10,
    destresa_id: "d_custodi_foc", destresa_name: "Custodi del Foc", destresa_threshold: 4,
    inclination_deltas: { impuls: 0, "intel·lecte": -0.01, espiritualitat: +0.03, sociabilitat: +0.02 },
    event_pool_id: "pool_ritual"
  },
  {
    id: "act_vigilar_campament", name: "Vigilar el Campament", is_base: true, zona: "Campament",
    description: "Protegeixes el campament i observes els voltants. Responsabilitat compartida.",
    execute_cost: 1, output_resource: "food", output_min: 2, output_max: 4,
    stat_key: "vincle", stat_gain: 0.10,
    destresa_id: "d_guardia", destresa_name: "Guàrdia", destresa_threshold: 5,
    inclination_deltas: { impuls: +0.01, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.01 },
    event_pool_id: "pool_social"
  },
  {
    id: "act_explorar_voltants", name: "Explorar els Voltants", is_base: true, zona: "Planes",
    description: "T'aventures més lluny del campament. El que trobes pot canviar-ho tot.",
    execute_cost: 1, output_resource: "food", output_min: 1, output_max: 3,
    unlocks_zone: "Bosc",
    stat_key: "enginy", stat_gain: 0.10,
    inclination_deltas: { impuls: +0.01, "intel·lecte": -0.01, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca"
  },

  // FAMILY
  {
    id: "act_cercar_parella", name: "Cercar Parella", is_base: true, zona: "Campament",
    description: "Busques company/a entre els grups veïns. Sense parella no hi ha successió.",
    execute_cost: 1, output_resource: "food", output_min: 0, output_max: 2,
    stat_key: "vincle", stat_gain: 0.20,
    inclination_deltas: { impuls: -0.01, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.04 },
    event_pool_id: "pool_social"
  },
  {
    id: "act_tenir_fills", name: "Tenir Fills", is_base: true, zona: "Campament",
    description: "Formeu família. Els fills hereten coneixement i inclinació del llinatge.",
    execute_cost: 0, output_resource: "food", output_min: 0, output_max: 1,
    stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.02, sociabilitat: +0.03 },
    event_pool_id: "pool_social"
  },

  // DISCOVERY
  {
    id: "act_escoltar_estrangers", name: "Escoltar els Estrangers", is_base: false, is_discovery_action: true, zona: "Campament",
    description: "Passes estona amb visitants d'un altre clan. Podries aprendre tècniques que no coneixies.",
    execute_cost: 0, output_resource: "food", output_min: 0, output_max: 0,
    stat_key: "enginy", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: null
  },

  // HUNTER branch — bt_punta_llanca
  {
    id: "act_caca_llanca", name: "Caça amb Llança", is_base: false, zona: "Planes",
    description: "Llances una pedra punxeguda des d'una distància que la presa no esperava. Alt risc, alt reward.",
    purchase_cost: 4, execute_cost: 2, output_resource: "food", output_min: 5, output_max: 12, health_delta: -2,
    stat_key: "forca", stat_gain: 0.20,
    inclination_deltas: { impuls: +0.05, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca"
  },
  {
    id: "act_emboscada_nocturna", name: "Emboscada Nocturna", is_base: false, zona: "Planes",
    description: "La foscor és el teu aliat. Atacs per sorpresa quan la presa dorm. Molt perillós però molt rendible.",
    purchase_cost: 5, execute_cost: 2, output_resource: "food", output_min: 6, output_max: 15, health_delta: -3,
    stat_key: "forca", stat_gain: 0.20,
    inclination_deltas: { impuls: +0.07, "intel·lecte": 0, espiritualitat: 0, sociabilitat: -0.02 },
    event_pool_id: "pool_caca"
  },

  // HUNTER branch — bt_marques_territori
  {
    id: "act_marcar_territori", name: "Marcar Territori", is_base: false, zona: "Planes",
    description: "Senyals als arbres i roques que indiquen que aquest territori és del teu clan.",
    purchase_cost: 3, execute_cost: 1, output_resource: "food", output_min: 2, output_max: 4, health_delta: -1,
    stat_key: "forca", stat_gain: 0.15,
    inclination_deltas: { impuls: +0.03, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_social"
  },
  {
    id: "act_rastreig_rutes", name: "Rastreig de Rutes", is_base: false, zona: "Bosc",
    description: "Segueixes les pistes dels animals per aprendre els seus camins. Coneixement que es converteix en provisions.",
    purchase_cost: 3, execute_cost: 1, output_resource: "food", output_min: 3, output_max: 6,
    stat_key: "forca", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.02, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca"
  },

  // GATHERER branch — bt_rasclador_fi
  {
    id: "act_molda_grans", name: "Mòlta de Grans", is_base: false, zona: "Campament",
    description: "Raspes grans silvestres amb el raspador fi per obtenir farina primitiva. Estable i nutritiu.",
    purchase_cost: 3, execute_cost: 1, output_resource: "food", output_min: 3, output_max: 7,
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": -0.01, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_recollecta"
  },

  // GATHERER branch — bt_trampes (shared with hunter)
  {
    id: "act_parar_trampes", name: "Parar Trampes", is_base: false, zona: "Planes",
    description: "Col·loques llaços i trampes en llocs de pas. La caça passiva allibera temps per a altres tasques.",
    purchase_cost: 3, execute_cost: 1, output_resource: "food", output_min: 2, output_max: 6,
    stat_key: "forca", stat_gain: 0.15,
    inclination_deltas: { impuls: -0.01, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca"
  },

  // GATHERER branch — bt_coneixement_plantes
  {
    id: "act_recollida_bolets", name: "Recollida de Bolets", is_base: false, zona: "Bosc",
    description: "Coneixes quins bolets del bosc son comestibles i quins cal evitar. Provisions i salut.",
    purchase_cost: 3, execute_cost: 1, output_resource: "food", output_min: 2, output_max: 5, health_delta: +1,
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": -0.01, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_recollecta"
  },
  {
    id: "act_assecament_plantes", name: "Assecament de Plantes", is_base: false, zona: "Campament",
    description: "Asseques les plantes recol·lectades per conservar-les. Reserves que aguanten setmanes.",
    purchase_cost: 3, execute_cost: 0, output_resource: "food", output_min: 2, output_max: 4,
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": -0.01, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_recollecta"
  },

  // GATHERER branch — bt_llavor_selectiva
  {
    id: "act_seleccionar_llavors", name: "Seleccionar Llavors", is_base: false, zona: "Campament",
    description: "Tries les millors llavors de la collita. Les plantes del proper cicle donaran més.",
    purchase_cost: 4, execute_cost: 0, output_resource: "food", output_min: 3, output_max: 8,
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.02, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_recollecta"
  },

  // CRAFTSMAN branch — bt_rasclador_fi
  {
    id: "act_faonar_eines", name: "Façonar Eines", is_base: false, zona: "Campament",
    description: "Produeixes eines de sílex de qualitat superior. El rasclador fi permet formes impossibles abans.",
    purchase_cost: 3, execute_cost: 0, output_resource: "eines", output_min: 2, output_max: 5,
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.03, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },

  // CRAFTSMAN branch — bt_buri
  {
    id: "act_gravar_os", name: "Gravar Os i Ivori", is_base: false, zona: "Campament",
    description: "El burí permet gravar formes en os i ivori. Art i eina, alhora.",
    purchase_cost: 4, execute_cost: 0, output_resource: "eines", output_min: 2, output_max: 4,
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.02, espiritualitat: +0.01, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },
  {
    id: "act_intercanviar_eines", name: "Intercanviar Eines", is_base: false, zona: "Planes",
    description: "Les eines gravades criden l'atenció dels grups veïns. Els intercanvis obren aliances.",
    purchase_cost: 3, execute_cost: 1, output_resource: "eines", output_min: 2, output_max: 5,
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.03 },
    event_pool_id: "pool_social"
  },

  // CRAFTSMAN branch — bt_agulla_os
  {
    id: "act_cosir_pells", name: "Cosir Pells", is_base: false, zona: "Campament",
    description: "Cosius pells amb agulles d'os per fer roba que protegeix del fred. Eines i comoditat.",
    purchase_cost: 3, execute_cost: 0, output_resource: "eines", output_min: 2, output_max: 4,
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.02, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },
  {
    id: "act_construir_refugi", name: "Construir Refugi", is_base: false, zona: "Campament",
    description: "Construcció d'un aixoplug millor amb pells cosides i branques. Protecció per a tots.",
    purchase_cost: 4, execute_cost: 1, output_resource: "eines", output_min: 3, output_max: 6,
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.02, espiritualitat: 0, sociabilitat: +0.01 },
    event_pool_id: "pool_artesania"
  },

  // MYSTIC branch — bt_guariment_plantes
  {
    id: "act_curar_herbes", name: "Curar amb Herbes", is_base: false, zona: "Campament",
    description: "Prepareu infusions i cataplasmes d'herbes per als membres malalts o ferits.",
    purchase_cost: 3, execute_cost: 2, output_resource: "health", output_min: 3, output_max: 7,
    stat_key: "vincle", stat_gain: 0.20,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.03, sociabilitat: 0 },
    event_pool_id: "pool_ritual"
  },

  // MYSTIC branch — bt_pintura_rupestre
  {
    id: "act_pintar_parets", name: "Pintar les Parets", is_base: false, zona: "Ritual",
    description: "Fixes les visions en les parets de roca. Els animals pintats semblen moure's amb el foc.",
    purchase_cost: 4, execute_cost: 1, output_resource: "food", output_min: 1, output_max: 3, health_delta: +1,
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.04, sociabilitat: 0 },
    event_pool_id: "pool_ritual"
  },
  {
    id: "act_narrar_llegendes", name: "Narrar les Llegendes", is_base: false, zona: "Campament",
    description: "Expliques les gestes i llegendes del llinatge davant del foc del campament.",
    purchase_cost: 3, execute_cost: 0, output_resource: "eines", output_min: 1, output_max: 3,
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.03, sociabilitat: +0.04 },
    event_pool_id: "pool_social"
  },

  // MYSTIC branch — bt_ornaments (shared with gatherer)
  {
    id: "act_ornamentar_se", name: "Ornamentar-se", is_base: false, zona: "Campament",
    description: "Et poses les closques, dents i pedres que has recollit. El grup et mira diferent.",
    purchase_cost: 3, execute_cost: 0, output_resource: "food", output_min: 1, output_max: 2, health_delta: +1,
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.02, sociabilitat: +0.02 },
    event_pool_id: "pool_social"
  },
  {
    id: "act_consagrar_ornaments", name: "Consagrar Ornaments", is_base: false, zona: "Ritual",
    description: "Passes els ornaments pel fum del ritual. Queden carregats de significat per al clan.",
    purchase_cost: 4, execute_cost: 1, output_resource: "food", output_min: 1, output_max: 3,
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.03, sociabilitat: +0.02 },
    event_pool_id: "pool_ritual"
  },

  // MYSTIC branch — bt_calendari_natural (shared with gatherer)
  {
    id: "act_observar_cel", name: "Observar el Cel Nocturn", is_base: false, zona: "Ritual",
    description: "Segueixes els moviments de la lluna i les estrelles. Els cicles del cel anuncien els cicles de la terra.",
    purchase_cost: 3, execute_cost: 0, output_resource: "food", output_min: 1, output_max: 2,
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.01, espiritualitat: +0.03, sociabilitat: 0 },
    event_pool_id: "pool_ritual"
  },
  {
    id: "act_transit_nocturn", name: "Trànsit Nocturn", is_base: false, zona: "Ritual",
    description: "Et mous de nit seguint els senyals del cel. Perillós, però els que tornen parlen de visions.",
    purchase_cost: 4, execute_cost: 1, output_resource: "food", output_min: 1, output_max: 3, health_delta: -1,
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.05, sociabilitat: 0 },
    event_pool_id: "pool_ritual"
  },

  // SHARED (hunter + gatherer) — bt_domini_terra
  {
    id: "act_control_territori", name: "Control del Territori", is_base: false, zona: "Planes",
    description: "Coordines el clan per controlar les zones de caça i recol·lecció. El territori és vostre.",
    purchase_cost: 5, execute_cost: 1, output_resource: "food", output_min: 3, output_max: 7, health_delta: -1,
    stat_key: "forca", stat_gain: 0.15,
    inclination_deltas: { impuls: +0.02, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.01 },
    event_pool_id: "pool_social"
  },

  // (old branch tech actions removed — replaced by new actions under 13 branch techs)

  // UPGRADES — substitutory improved actions, purchased with Saber, replace the base action
  {
    id: "act_aguait_coordinat", name: "Aguait Coordinat", is_upgrade: true, upgrades_action_id: "act_espiar_ramat", zona: "Planes",
    description: "Senyal coordinat amb el grup. La presa no pot fugir. Rendiment molt superior.",
    purchase_cost: 5, execute_cost: 1, output_resource: "food", output_min: 3, output_max: 8,
    stat_key: "forca", stat_gain: 0.10,
    inclination_deltas: { impuls: +0.03, "intel·lecte": +0.01, espiritualitat: 0, sociabilitat: +0.02 },
    event_pool_id: "pool_caca"
  },
  {
    id: "act_recollecta_metodica", name: "Recol·lecta Metòdica", is_upgrade: true, upgrades_action_id: "act_recollectar_arrels", zona: "Planes",
    description: "Apliques coneixement acumulat: zones, estació, plantes. Rendiment molt superior.",
    purchase_cost: 4, execute_cost: 1, output_resource: "food", output_min: 4, output_max: 7,
    stat_key: "enginy", stat_gain: 0.10,
    inclination_deltas: { impuls: -0.01, "intel·lecte": +0.02, espiritualitat: +0.01, sociabilitat: +0.01 },
    event_pool_id: "pool_recollecta"
  },
  {
    id: "act_talla_avancada", name: "Talla Avançada", is_upgrade: true, upgrades_action_id: "act_tallar_pedra", zona: "Campament",
    description: "Eines de qualitat superior. Menys rebuig, formes més precises.",
    purchase_cost: 5, execute_cost: 0, output_resource: "eines", output_min: 3, output_max: 6,
    stat_key: "enginy", stat_gain: 0.10,
    inclination_deltas: { impuls: -0.01, "intel·lecte": +0.03, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },
  {
    id: "act_gran_ritual", name: "Gran Ritual", is_upgrade: true, upgrades_action_id: "act_ritual_foc", zona: "Campament",
    description: "El ritual s'extén a tota la nit. Cohesió màxima i regeneració profunda.",
    purchase_cost: 4, execute_cost: 1, output_resource: "food", output_min: 2, output_max: 5, health_delta: +2,
    stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: -0.01, "intel·lecte": 0, espiritualitat: +0.04, sociabilitat: +0.03 },
    event_pool_id: "pool_ritual"
  },
  {
    id: "act_defensa_activa", name: "Defensa Activa", is_upgrade: true, upgrades_action_id: "act_vigilar_campament", zona: "Campament",
    description: "Distribuïu rols i torns de guàrdia. El campament queda segur i el grup rendeix més.",
    purchase_cost: 5, execute_cost: 1, output_resource: "food", output_min: 3, output_max: 6,
    stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: +0.01, "intel·lecte": +0.01, espiritualitat: 0, sociabilitat: +0.02 },
    event_pool_id: "pool_social"
  }
];

const EVENT_POOLS = {
  pool_caca: [
    { id: "ev_rastre_fresc",    text: "Rastres frescos! El grup segueix la pista i torna amb extra.", effects: { food: +3 } },
    { id: "ev_bestia_ferida",   text: "Una bèstia ferida ataca. El caçador resulta ferit lleu.",      effects: { food: -1, health: -1 } },
    { id: "ev_ramat_migracio",  text: "El ramat migra cap al nord. Les preses escassegen.",           effects: { food: -2 } },
    { id: "ev_caca_abundant",   text: "Temporada de caça abundant. Reserves extra per a la família.", effects: { food: +5 } },
    {
      id: "ev_desc_llancador", is_discovery_event: true, is_single_use: true,
      discovery_branch_tech_id: "bt_punta_llanca",
      text: "Mentre espies el ramat, veus un caçador d'un altre grup llançar una pedra amb un pal llarg. Abat la presa des d'una distància increïble.",
      options: [
        { text: "Apropar-te a observar (−2 Aliment)", food_delta: -2, discovers: true },
        { text: "Seguir el teu camí", food_delta: +2, discovers: false }
      ]
    },
    {
      id: "ev_desc_trampes", is_discovery_event: true, is_single_use: true,
      discovery_branch_tech_id: "bt_trampes",
      text: "Trobes un grup de recol·lectors que han deixat llaços de fibra vegetal en llocs de pas. Quan tornes, n'hi ha un de ple.",
      options: [
        { text: "Demanar-los que t'ensenyin (−2 Aliment)", food_delta: -2, discovers: true },
        { text: "Continuar amb la teva caça", food_delta: +2, discovers: false }
      ]
    },
    {
      id: "ev_desc_marques", is_discovery_event: true, is_single_use: true,
      discovery_branch_tech_id: "bt_marques_territori",
      text: "Trobes incisions en l'escorça d'un arbre que marquen clarament el límit d'un altre clan. La idea és senzilla i poderosa.",
      options: [
        { text: "Estudiar les marques de prop (−1 Aliment)", food_delta: -1, discovers: true },
        { text: "Retirar-te per respecte", food_delta: +1, discovers: false }
      ]
    }
  ],
  pool_recollecta: [
    { id: "ev_fruits_madurs",    text: "Fruits silvestres madurs. Una troballa inesperada.",            effects: { food: +3 } },
    { id: "ev_plantes_toxiques", text: "Algunes plantes eren tòxiques. Malestars al grup.",            effects: { food: -2, health: -1 } },
    { id: "ev_bolets_rars",      text: "Bolets estranys però comestibles. Extra de provisions.",       effects: { food: +2 } },
    {
      id: "ev_desc_rasclador", is_discovery_event: true, is_single_use: true,
      discovery_branch_tech_id: "bt_rasclador_fi",
      text: "Recolles arrels prop d'un grup estranger. Una dona rasca una arrel amb un fragment de sílex molt fi que mai no havies vist — surt una polpa perfecta.",
      options: [
        { text: "Preguntar-li com ho fa (−2 Aliment)", food_delta: -2, discovers: true },
        { text: "Continuar amb la teva tècnica", food_delta: +2, discovers: false }
      ]
    },
    {
      id: "ev_desc_coneixement_plantes", is_discovery_event: true, is_single_use: true,
      discovery_branch_tech_id: "bt_coneixement_plantes",
      text: "Un ancià del grup proper recol·lecta plantes amb una precisió inusual, triant-les una a una. Sembla que coneix cada fulla pel nom.",
      options: [
        { text: "Seguir-lo i aprendre (−2 Aliment)", food_delta: -2, discovers: true },
        { text: "Continuar recol·lectant pel teu compte", food_delta: +1, discovers: false }
      ]
    },
    {
      id: "ev_desc_llavor", is_discovery_event: true, is_single_use: true,
      discovery_branch_tech_id: "bt_llavor_selectiva",
      text: "Mentre mols grans, notes que alguns son més grossos i més pesats. Et preguntes si sembrant-los sortirien plantes millors.",
      options: [
        { text: "Apartar-los i experimentar (−2 Aliment)", food_delta: -2, discovers: true },
        { text: "Mòlts tots igual", food_delta: +1, discovers: false }
      ]
    }
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
    },
    {
      id: "ev_desc_buri", is_discovery_event: true, is_single_use: true,
      discovery_branch_tech_id: "bt_buri",
      text: "Un artesà d'un grup veí grava línies en un fragment d'os amb una eina punxeguda molt fina. El resultat és inusitadament precís.",
      options: [
        { text: "Demanar-li que t'ensenyi (−2 Aliment)", food_delta: -2, discovers: true },
        { text: "Admirar la feina i continuar", food_delta: +1, discovers: false }
      ]
    }
  ],
  pool_ritual: [
    { id: "ev_visio_profunda",   text: "Una visió durant el ritual guia el grup cap a recursos amagats.", effects: { food: +2 } },
    { id: "ev_ritual_cohesio",   text: "El ritual reforça la cohesió del grup.",                          effects: { food: +1 } },
    { id: "ev_espiritocontent",  text: "Els esperits estan contents. El grup se sent protegit.",          effects: { health: +1 } },
    {
      id: "ev_desc_herbes", is_discovery_event: true, is_single_use: true,
      discovery_branch_tech_id: "bt_guariment_plantes",
      text: "Durant el ritual, un vell crema certes herbes que mai no has vist. Olora diferent. Algú amb mal de ventre s'ha millorat, i ningú no entén per qué.",
      options: [
        { text: "Demanar-li que t'ho expliqui", food_delta: -2, discovers: true },
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
    },
    {
      id: "ev_desc_calendari", is_discovery_event: true, is_single_use: true,
      discovery_branch_tech_id: "bt_calendari_natural",
      text: "Mentre fas el ritual, notes que la lluna ha tornat al mateix punt que fa molts dies. Alguna cosa en tu comença a comptar.",
      options: [
        { text: "Marcar el cicle en un os (−1 Aliment)", food_delta: -1, discovers: true },
        { text: "Continuar el ritual sense aturar-te", food_delta: 0, discovers: false }
      ]
    }
  ],
  pool_social: [
    { id: "ev_dispute_interna",  text: "Una disputa interna distreu el grup.",                       effects: { food: -1 } },
    { id: "ev_aliat_nou",        text: "Un grup veí ofereix col·laboració temporal.",               effects: { food: +2 } },
    { id: "ev_lider_respectat",  text: "El respecte augmenta. El grup treballa millor.",            effects: { food: +1 } },
    {
      id: "ev_desc_ornaments", is_discovery_event: true, is_single_use: true,
      discovery_branch_tech_id: "bt_ornaments",
      text: "L'estranger que ha visitat el campament porta closques foradades lligades al coll. Tothom els mira. L'home somriu i te n'ofereix una.",
      options: [
        { text: "Acceptar-la i preguntar-li (−3 Aliment)", food_delta: -3, discovers: true },
        { text: "Agrair-ho però declinar", food_delta: +1, discovers: false }
      ]
    },
    {
      id: "ev_desc_domini_terra", is_discovery_event: true, is_single_use: true,
      discovery_branch_tech_id: "bt_domini_terra",
      text: "Un clan veí i el teu han recol·lectat a la mateixa zona fins que l'han esgotada. Si s'hagués repartit el territori, tots haurien menjat millor.",
      options: [
        { text: "Proposar un acord de zones (−2 Aliment)", food_delta: -2, discovers: true },
        { text: "Marxar a buscar una altra zona", food_delta: +1, discovers: false }
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
