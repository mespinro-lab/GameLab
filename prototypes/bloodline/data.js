// PROTOTYPE - NOT FOR PRODUCTION
// Question: Does inclination-driven action visibility + branch tech discovery + succession feel engaging?
// Date: 2026-05-26

'use strict';

// --- Game Design Parameters ---
const ERA_CYCLES      = 100;  // Cicles totals de l'era; no es reinicia entre generacions
const LIFE_EXPECTANCY = 20;   // Durada esperada d'un personatge; calibra la fórmula d'envelliment
const MAX_CHILDREN    = 3;

const STARTING_FOOD = 12;
const FOOD_MAX      = 20;
const FOOD_UPKEEP   = 2;

const STARTING_HEALTH      = 40;
const HEALTH_MAX           = 40;
const HEALTH_FIRE_BONUS    = 0.25;  // +25% salut immediata en descobrir el foc
const HEALTH_POST_FIRE     = 50;    // salut màxima i inicial de gens posteriors al foc

const AGING_BASE      = 3;
const AGING_THRESHOLD = 10;
const AGING_POWER     = 1.8;
const AGING_SCALE     = 0.35;

const STAT_MAX            = 5.0;
const STAT_STARTING_VALUE = 1.0;
const STAT_OUTPUT_FACTOR  = 0.15;

const DESTRESA_THRESHOLD = 5;
const DESTRESA_MAX       = 3;
const DESTRESA_BONUS     = 1;

const REPUTACIO_PER_CHAR_CAP = 20;  // Max reputació acumulable per personatge (anti-spam)

const TEACHING_BONUS         = 0.5;  // S'afegeix a inheritanceRate de cada tech quan el pare ha ensenyat
const FAMILY_REP_INHERITANCE = 0.6;  // (reservat) fracció de reputació que passa a la gen. següent

// Estats del personatge — inicialitzats a startVal, resetejats en successió
// Usats com a prerequisits (requires) i efectes (character_effect) de les accions
const CHARACTER_STATE_DEFS = [
  { id: 'parella',  startVal: 0, max: 1            },
  { id: 'fills',    startVal: 0, max: MAX_CHILDREN },
  { id: 'ensenyat', startVal: 0, max: 1            },
];

const INCLINATION_INHERITANCE_RATE = 1.00;  // inclinació heretada al 100% (les branques són del llinatge)
const STAT_INHERITANCE_RATE        = 0.50;  // stats heretats al 50% (per evitar runaway cross-gens)
const EVENT_TRIGGER_CHANCE         = 0.6;   // probabilitat base que una acció dispari un event
const FADE_MARGIN                  = 0.05;  // marge d'inclinació per mostrar una acció com "difosa" en lloc d'oculta

// Event balancing: objectius per personatge (LIFE_EXPECTANCY cicles)
const EVENT_TARGET_POSITIVE = 5;   // events positius esperats per vida
const EVENT_TARGET_NEGATIVE = 4;   // events negatius esperats per vida
const EVENT_BALANCE_WEIGHT  = 0.6; // multiplicador de pes per deute (0 = sense balanceig, 1 = fort)

// --- Resource Definitions ---
// Afegir un recurs aquí = apareix al top bar, s'inicialitza a l'estat i apareix al glossari.
// id:          clau a state[id]
// section:     'vitals' | 'resources' — secció del top bar
// rateType:    'fixed' (mostra upkeep/t) | 'aging' (mostra taxa envelliment) | false (sense taxa)
// showMax:     true = "val/max" | false = "val"
// persistent:  true = NO es reinicia en successió (es manté entre generacions)
// color/borderColor: color del pill (CSS variable o valor directe)
// critAt/warnAt: llindars per a classes CSS d'avís
// glossaryDesc: descripció estàtica per al glossari
const RESOURCE_DEFS = [
  {
    id: 'food', emoji: '🌾', label: 'Aliment', section: 'vitals',
    startVal: STARTING_FOOD, max: FOOD_MAX, upkeep: FOOD_UPKEEP,
    showMax: true, rateType: 'fixed', critAt: 4, warnAt: 8,
    color: 'var(--gold)', borderColor: 'rgba(245,166,35,0.3)',
    glossaryDesc: `Es consumeix -${FOOD_UPKEEP}/torn. Si s'esgota, Salut decreix. Cap: ${FOOD_MAX} (el menjar es fa malbé).`,
  },
  {
    id: 'health', emoji: '❤️', label: 'Salut', section: 'vitals',
    startVal: STARTING_HEALTH, max: HEALTH_MAX, upkeep: null,
    showMax: false, rateType: 'aging', critAt: 20, warnAt: 40,
    color: 'var(--green)', borderColor: 'rgba(74,222,128,0.3)',
    glossaryDesc: `Estat físic. A 0 el personatge mor i es produeix la successió. Decreix per envelliment: ${AGING_BASE}/torn en joventut, s'accelera a partir de l'edat ${AGING_THRESHOLD}.`,
  },
  {
    id: 'material', emoji: '🪨', label: 'Material', section: 'resources',
    startVal: 0, max: null, upkeep: null, showMax: false, rateType: false,
    persistent: true, inheritDecay: 0.5,
    color: 'var(--blue)', borderColor: 'rgba(96,165,250,0.3)',
    glossaryDesc: "Acumulat per qualsevol acció. Gastat per comprar noves accions. Persisteix entre generacions.",
  },
  {
    id: 'reputacio', emoji: '🏛️', label: 'Reputació', section: 'resources',
    startVal: 0, max: null, upkeep: null, showMax: false, rateType: false,
    persistent: true, inheritDecay: FAMILY_REP_INHERITANCE,
    color: '#a855f7', borderColor: 'rgba(168,85,247,0.3)',
    glossaryDesc: "Persistent entre generacions — no es reinicia en successió. Acumulada per accions socials. Cada punt millora la probabilitat d'esdeveniments positius (+10% de pes, màx +40%).",
  },
  // Era 2+: descomenta per afegir nous recursos al top bar, estat i glossari
  // { id: 'happiness', emoji: '✨', label: 'Benestar', section: 'resources', startVal: 50, max: 100, upkeep: null, showMax: false, rateType: false, era: 2, color: 'var(--purple)', borderColor: 'rgba(168,85,247,0.3)', glossaryDesc: "Satisfacció general. Si cau molt baix, penalitza els resultats de les accions." },
];

// --- Destresa Definitions ---
// action_id: which action must be used DESTRESA_THRESHOLD times to unlock (in addition to inclination condition)
const DESTRESA_DEFS = [
  { id: "d_rastreig",    name: "Rastreig",       action_id: "act_espiar_ramat",        conditions: [{ axis: "impuls",         min: 0.10 }] },
  { id: "d_botanica",    name: "Botànica",        action_id: "act_recollectar_arrels",  conditions: [{ axis: "intel·lecte",    min: 0.10 }] },
  { id: "d_talla_silex", name: "Talla de Sílex",  action_id: "act_tallar_pedra",        conditions: [{ axis: "intel·lecte",    min: 0.15 }] },
  { id: "d_custodi_foc", name: "Custodi del Foc", action_id: "act_ritual_foc",          conditions: [{ axis: "espiritualitat", min: 0.10 }] },
  { id: "d_guardia",     name: "Guàrdia",         action_id: "act_vigilar_campament",   conditions: [{ axis: "sociabilitat",   min: 0.10 }] },
];

// --- Zone Definitions ---
// Zona Ritual eliminada (playtest 2026-06-06): accions redistribuïdes a Bosc/Campament/Planes
const ZONE_DEFS = [
  { id: 'Bosc',      label: 'Bosc',      description: "Recol·lecta avançada i plantes. Es descobreix explorant les Planes.",  starts_discovered: false },
  { id: 'Planes',    label: 'Planes',    description: "Caça, exploració i recol·lecta exterior. Disponible des del principi.", starts_discovered: true  },
  { id: 'Campament', label: 'Campament', description: "Supervivència base i artesania. Disponible des del principi.",          starts_discovered: true  },
  { id: 'Llar',      label: 'Llar',      description: "Espai familiar. Apareix quan tens parella.",                            starts_discovered: false },
];

// --- Axis Definitions ---
const AXIS_DEFS = [
  { id: 'impuls',         left: 'Reflexiu',  right: 'Impulsiu'  },
  { id: "intel·lecte",    left: 'Instintiu', right: 'Analític'  },
  { id: 'espiritualitat', left: 'Pragmàtic', right: 'Espiritual' },
  { id: 'sociabilitat',   left: 'Solitari',  right: 'Social'    },
];

// --- Stat Definitions ---
const STAT_DEFS = [
  { id: 'forca',  label: 'Força',  description: "Millora outputs d'accions físiques (caça, territori)." },
  { id: 'enginy', label: 'Enginy', description: "Millora outputs d'accions d'eines i artesania." },
  { id: 'vincle', label: 'Vincle', description: "Millora outputs d'accions socials i rituals." },
];

// --- Successió: noms i frases narratives ---
const CHILD_NAMES = [
  "Auri", "Brant", "Cels", "Dorma", "Elva",
  "Fura", "Gall", "Hern", "Ibra", "Jord",
  "Kela", "Llor", "Marn", "Nela", "Orx",
  "Pell", "Raul", "Sena", "Tirsa", "Ursa",
];

const SUCCESSION_PHRASES = {
  impuls: {
    pos: "Nascut per liderar la caça. La seva determinació és inusual en un infant.",
    neg: "Observa on d'altres actuen. Una prudència que sovint salva vides.",
  },
  "intel·lecte": {
    pos: "La seva ment construeix connexions que d'altres no veuen.",
    neg: "Confia en els instints del cos on d'altres dubten.",
  },
  espiritualitat: {
    pos: "Sent la presència dels avantpassats. El foc li parla, i el clan l'escolta.",
    neg: "Els seus peus sempre toquen terra. El clan sobreviu gràcies a ell.",
  },
  sociabilitat: {
    pos: "El seu somriure obre portes que les llances no podrien.",
    neg: "Troba en la solitud la força que d'altres busquen al grup.",
  },
  neutral: "Un caràcter obert. Qualsevol camí podria ser el seu.",
};

const UNIVERSAL_TECHS = [
  {
    id: "ut_foc", name: "El Foc", icon: "🔥", cycle: 10,
    description: "Fabricació intencional del foc amb sílex i pirita. Cuina, calor, llum i protecció nocturna.",
    effect: { healthPctBonus: HEALTH_FIRE_BONUS, nextGenHealthMax: HEALTH_POST_FIRE, desc: `+${Math.round(HEALTH_FIRE_BONUS*100)}% Salut immediata · Gens posteriors inicien amb ${HEALTH_POST_FIRE}❤️` }
  },
  {
    id: "ut_eines", name: "Les Eines", icon: "🪨", cycle: 16,
    description: "Fulloles de sílex de precisió: formes especialitzades per a caça, tall i gravat.",
    effect: null
  },
  {
    id: "ut_art", name: "L'Art", icon: "🎨", cycle: 36,
    description: "Pintures a les roques, figurines d'ivori, flautes d'os. El clan comença a explicar el món.",
    effect: null
  },
  {
    id: "ut_vestimenta", name: "La Vestimenta", icon: "🧵", cycle: 50,
    description: "Agulles d'os per cosir pells. Roba que protegeix del fred i permet explorar climes extrems.",
    effect: { healthBonus: 15, desc: "+15 Salut (abric del fred)" }
  },
  {
    id: "ut_corda", name: "La Corda", icon: "🪢", cycle: 65,
    description: "Fibres vegetals trenzades. Trampes, cistelles, arcs i balses transformen el territori.",
    effect: null
  },
  {
    id: "ut_ceramica", name: "La Ceràmica", icon: "🏺", cycle: 80,
    description: "Argila cuita al foc. Emmagatzematge, cocció avançada i conservació de provisions.",
    effect: null
  },
  {
    id: "ut_agricultura", name: "L'Agricultura", icon: "🌾", cycle: 92,
    description: "Primera sembra intencional i selecció de llavors. L'era prehistòrica arriba al seu límit.",
    effect: null
  }
];

// inheritanceRate: probabilitat base que un fill hereti aquesta habilitat sense ensenyança explícita.
// Amb act_ensenyar, s'afegeix TEACHING_BONUS a cada rate (fins a màx 0.95).
// Baixa = habilitat física difícil de transmetre. Alta = coneixement oral transmissible.
const SKILL_DEFS = [
  {
    id: "bt_punta_llanca", name: "Punta de Llança",
    inheritanceRate: 0.20,
    universal_prereq: "ut_eines",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "impuls", min: 0.25 }, { axis: "sociabilitat", max: 0.30 }] },
    unlocks_action_ids: ["act_caca_llanca", "act_emboscada_nocturna"],
    passive_effect: { type: "bonus_action_output", action_id: "act_espiar_ramat", output_min_bonus: 1, desc: "+1 mínim espiar ramat (la punta millora la caça base)" },
    is_hidden: false
  },
  {
    id: "bt_rasclador_fi", name: "Rasclador Fi",
    inheritanceRate: 0.35,
    universal_prereq: "ut_eines",
    inclination_conditions: { operator: "OR", conditions: [{ axis: "impuls", max: 0.10 }, { axis: "intel·lecte", min: 0.20 }] },
    unlocks_action_ids: ["act_molda_grans", "act_faonar_eines"],
    passive_effect: { type: "bonus_action_output", action_id: "act_recollectar_arrels", output_min_bonus: 1, desc: "+1 mínim recol·lecta" },
    is_hidden: false
  },
  {
    id: "bt_buri", name: "Burí i Gravat",
    inheritanceRate: 0.30,
    universal_prereq: "ut_eines",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "intel·lecte", min: 0.25 }, { axis: "impuls", max: 0.20 }] },
    unlocks_action_ids: ["act_gravar_os", "act_intercanviar_eines"],
    passive_effect: { type: "bonus_action_output", action_id: "act_faonar_eines", output_min_bonus: 1, desc: "+1 mínim façonar eines (el burí permet formes més precises)" },
    is_hidden: false
  },
  {
    id: "bt_agulla_os", name: "Agulla d'Os",
    inheritanceRate: 0.35,
    universal_prereq: "ut_vestimenta",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "intel·lecte", min: 0.20 }, { axis: "impuls", max: 0.20 }] },
    unlocks_action_ids: ["act_cosir_pells", "act_construir_refugi"],
    passive_effect: { type: "grant_health", amount: 15, desc: "+15 Salut (vestimenta)" },
    is_hidden: false
  },
  {
    id: "bt_trampes", name: "Trampes i Llaços",
    inheritanceRate: 0.25,
    universal_prereq: "ut_corda",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "impuls", min: 0.10 }] },
    unlocks_action_ids: ["act_parar_trampes", "act_revisar_trampes"],
    passive_effect: { type: "bonus_action_output", action_id: "act_parar_trampes", output_min_bonus: 1, desc: "+1 mínim parar trampes (les trampes de corda son més eficaces)" },
    is_hidden: false
  },
  {
    id: "bt_guariment_plantes", name: "Guariment amb Plantes",
    inheritanceRate: 0.45,
    universal_prereq: "ut_foc",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "espiritualitat", min: 0.25 }, { axis: "sociabilitat", min: 0.20 }] },
    unlocks_action_ids: ["act_curar_herbes", "act_preparar_ungüent"],
    passive_effect: { type: "grant_health", amount: 8, desc: "+8 Salut (el primer guariment és per a un mateix)" },
    is_hidden: false
  },
  {
    id: "bt_pintura_rupestre", name: "Pintura Rupestre",
    inheritanceRate: 0.40,
    universal_prereq: "ut_art",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "espiritualitat", min: 0.30 }, { axis: "sociabilitat", min: 0.20 }] },
    unlocks_action_ids: ["act_pintar_parets", "act_narrar_llegendes"],
    passive_effect: { type: "grant_material", amount: 2, desc: "+2 Provisions (les pintures enforteixen la identitat del clan)" },
    is_hidden: false
  },
  {
    id: "bt_marques_territori", name: "Marques de Territori",
    inheritanceRate: 0.30,
    universal_prereq: "ut_art",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "impuls", min: 0.20 }, { axis: "intel·lecte", min: 0.05 }] },
    unlocks_action_ids: ["act_marcar_territori", "act_rastreig_rutes"],
    passive_effect: { type: "unlock_zone", unlocks_zone: "Bosc", desc: "Les marques revelen camins al Bosc" },
    is_hidden: false
  },
  {
    id: "bt_ornaments", name: "Ornaments i Adorn",
    inheritanceRate: 0.35,
    universal_prereq: "ut_art",
    inclination_conditions: { operator: "OR", conditions: [{ axis: "espiritualitat", min: 0.20 }, { axis: "sociabilitat", min: 0.25 }] },
    unlocks_action_ids: ["act_ornamentar_se", "act_consagrar_ornaments"],
    passive_effect: { type: "grant_material", amount: 3, desc: "+3 Provisions (els ornaments reforcen la identitat del clan)" },
    is_hidden: false
  },
  {
    id: "bt_coneixement_plantes", name: "Coneixement de Plantes",
    inheritanceRate: 0.45,
    universal_prereq: "ut_corda",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "intel·lecte", min: 0.10 }, { axis: "impuls", max: 0.20 }] },
    unlocks_action_ids: ["act_recollida_bolets", "act_assecament_plantes"],
    passive_effect: { type: "bonus_action_output", action_id: "act_recollida_bolets", output_max_bonus: 2, desc: "+2 màxim recollida de bolets (coneixes quins valen la pena)" },
    is_hidden: false
  },
  {
    id: "bt_calendari_natural", name: "Calendari Natural",
    inheritanceRate: 0.40,
    universal_prereq: "ut_ceramica",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "espiritualitat", min: 0.20 }, { axis: "sociabilitat", min: 0.10 }] },
    unlocks_action_ids: ["act_observar_cel", "act_transit_nocturn"],
    passive_effect: { type: "grant_material", amount: 2, desc: "+2 Provisions (previsió de cicles)" },
    is_hidden: false
  },
  {
    id: "bt_llavor_selectiva", name: "Llavor Selectiva",
    inheritanceRate: 0.35,
    universal_prereq: "ut_ceramica",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "intel·lecte", min: 0.10 }, { axis: "impuls", max: 0.20 }] },
    unlocks_action_ids: ["act_seleccionar_llavors", "act_preparar_terreny"],
    passive_effect: { type: "bonus_action_output", action_id: "act_seleccionar_llavors", output_min_bonus: 2, desc: "+2 mínim selecció de llavors (les millors llavors formen part de la cultura del clan)" },
    is_hidden: false
  },
  {
    id: "bt_domini_terra", name: "Domini de la Terra",
    inheritanceRate: 0.25,
    universal_prereq: "ut_ceramica",
    inclination_conditions: { operator: "OR", conditions: [{ axis: "impuls", min: 0.10 }, { axis: "sociabilitat", min: 0.10 }] },
    unlocks_action_ids: ["act_control_territori", "act_negociar_pastures"],
    passive_effect: { type: "grant_health", amount: 10, desc: "+10 Salut (domini del territori)" },
    is_hidden: false
  }
];

// output_resource: "food" (default) | "material" | "health"  — ha de coincidir amb id de RESOURCE_DEFS
// side_effects: array de side-effects [{ resource: 'health'|'food'|..., delta: N }] — s'apliquen genèricament
// stat_key: "forca" | "enginy" | "vincle" — which stat multiplies output + grows on use
// stat_gain: how much the stat grows per execution
// destresa_id/name/threshold: personal skill discovered after N uses of this action
// is_upgrade / upgrades_action_id: substitutory improved action, replaces base when purchased
// minAge / maxAge: character age gates (edat del personatge, no cicle d'era)
// reputation_gain: adds to state.reputacio (persistent across generations)
const ACTIONS = [
  // BASE
  {
    id: "act_espiar_ramat", name: "Espiar el Ramat", is_base: true, zona: "Planes",
    description: "Segueixes el ramat de prop i tries el moment de caçar. Molt menjar, però hi ha risc de ferides.",
    execute_cost: 1, output_resource: "food", output_min: 3, output_max: 8,
    material_min: 2, material_max: 4,
    side_effects: [{ resource: 'health', delta: -5 }],
    stat_key: "forca", stat_gain: 0.10,
    destresa_id: "d_rastreig",
    inclination_deltas: { impuls: +0.05, "intel·lecte": +0.03, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca"
  },
  {
    id: "act_recollectar_arrels", name: "Recol·lectar Arrels", is_base: true, zona: "Planes",
    description: "Busques arrels i baies comestibles sense allunyar-te. Segur però rendiment moderat.",
    execute_cost: 1, output_resource: "food", output_min: 1, output_max: 3,
    material_min: 2, material_max: 3,
    stat_key: "forca", stat_gain: 0.10,
    destresa_id: "d_botanica",
    inclination_deltas: { impuls: -0.03, "intel·lecte": +0.04, espiritualitat: 0, sociabilitat: +0.03 },
    event_pool_id: "pool_recollecta"
  },
  {
    id: "act_tallar_pedra", name: "Tallar Pedra", is_base: true, zona: "Campament",
    description: "Treballes el sílex per fer eines per al clan. Millora l'enginy i les tècniques artesanals.",
    execute_cost: 0,
    material_min: 2, material_max: 3,
    stat_key: "enginy", stat_gain: 0.15,
    destresa_id: "d_talla_silex",
    inclination_deltas: { impuls: -0.03, "intel·lecte": +0.05, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },
  {
    id: "act_ritual_foc", name: "Ritual del Foc", is_base: true, universal_prereq: "ut_foc", zona: "Campament",
    description: "Celebres el ritual diari del foc sagrat. Enforteix els vincles del grup.",
    execute_cost: 1, output_resource: "reputacio", output_min: 1, output_max: 2, side_effects: [{ resource: 'health', delta: +5 }],
    stat_key: "vincle", stat_gain: 0.10,
    destresa_id: "d_custodi_foc",
    inclination_deltas: { impuls: 0, "intel·lecte": -0.02, espiritualitat: +0.05, sociabilitat: +0.03 },
    event_pool_id: "pool_ritual"
  },
  {
    id: "act_contemplacio", name: "Contemplació", is_base: true, zona: "Campament",
    description: "T'asseus en silenci i observes el món. La quietud obre la ment a allò invisible.",
    execute_cost: 1, output_resource: "health", output_min: 3, output_max: 6,
    stat_key: "vincle", stat_gain: 0.05,
    inclination_deltas: { impuls: -0.02, "intel·lecte": 0, espiritualitat: +0.08, sociabilitat: +0.04 },
    event_pool_id: "pool_ritual"
  },
  {
    id: "act_vigilar_campament", name: "Vigilar el Campament", is_base: true, zona: "Campament",
    description: "Protegeixes el campament i observes els voltants. Responsabilitat compartida.",
    execute_cost: 1, output_resource: "reputacio", output_min: 1, output_max: 2,
    stat_key: "vincle", stat_gain: 0.10,
    destresa_id: "d_guardia",
    inclination_deltas: { impuls: +0.03, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.04 },
    event_pool_id: "pool_social"
  },
  {
    id: "act_explorar_voltants", name: "Explorar els Voltants", is_base: true, zona: "Planes",
    description: "T'aventures més lluny del campament. El que trobes pot canviar-ho tot.",
    execute_cost: 1,
    unlocks_zone: "Bosc",
    material_min: 3, material_max: 5,
    stat_key: "forca", stat_gain: 0.10,
    inclination_deltas: { impuls: +0.04, "intel·lecte": -0.02, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca"
  },

  // FAMILY — zona Campament (cercar parella) i Llar (tenir fills, ensenyar)
  {
    id: "act_cercar_parella", name: "Cercar Parella", is_base: true, zona: "Campament",
    description: "Busques company/a entre els grups veïns. Sense parella no hi ha successió ni Llar.",
    minAge: 5, maxAge: 14,
    requires: [{ state: 'parella', max: 0 }],
    character_effect: { type: 'find_partner', failure_chance: 0.05 },
    material_min: 1, material_max: 2,
    stat_key: "vincle", stat_gain: 0.20,
    inclination_deltas: { impuls: -0.02, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.06 },
    event_pool_id: "pool_social"
  },
  {
    id: "act_tenir_fills", name: "Tenir Fills", is_base: true, zona: "Llar",
    description: "Formeu família. L'èxit depèn de la salut. Els fills hereten la inclinació del llinatge.",
    maxAge: 15,
    requires: [{ state: 'parella', min: 1 }, { state: 'fills', lt_max: true }],
    character_effect: { type: 'add_child_with_risk' },
    material_min: 1, material_max: 3,
    stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.03, sociabilitat: +0.05 },
    event_pool_id: "pool_social"
  },
  {
    id: "act_ensenyar", name: "Ensenyar el Fill", is_base: true, zona: "Llar",
    description: "Passes temps transmetent al fill les tècniques que has après. Millora la taxa d'herència.",
    minAge: 8,
    requires: [{ state: 'fills', min: 1 }, { state: 'ensenyat', max: 0 }, { type: 'has_any_skill' }],
    character_effect: { type: 'delta', state: 'ensenyat', delta: 1 },
    material_min: 1, material_max: 2,
    reputation_gain: 3,
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: -0.02, "intel·lecte": 0, espiritualitat: +0.03, sociabilitat: +0.05 },
    event_pool_id: "pool_familia"
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
    maxAge: 15,
    purchase_cost: 4, execute_cost: 2, output_resource: "food", output_min: 5, output_max: 12, side_effects: [{ resource: 'health', delta: -10 }],
    stat_key: "forca", stat_gain: 0.20,
    inclination_deltas: { impuls: +0.08, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca"
  },
  {
    id: "act_emboscada_nocturna", name: "Emboscada Nocturna", is_base: false, zona: "Planes",
    description: "La foscor és el teu aliat. Atacs per sorpresa quan la presa dorm. Molt perillós però molt rendible.",
    maxAge: 12,
    purchase_cost: 5, execute_cost: 2, output_resource: "food", output_min: 8, output_max: 16, side_effects: [{ resource: 'health', delta: -20 }],
    stat_key: "forca", stat_gain: 0.20,
    inclination_deltas: { impuls: +0.10, "intel·lecte": 0, espiritualitat: 0, sociabilitat: -0.08 },
    event_pool_id: "pool_caca"
  },

  // HUNTER branch — bt_marques_territori
  {
    id: "act_marcar_territori", name: "Marcar Territori", is_base: false, zona: "Planes",
    description: "Senyals als arbres i roques que indiquen que aquest territori és del teu clan.",
    purchase_cost: 3, execute_cost: 1, output_resource: "reputacio", output_min: 1, output_max: 3, side_effects: [{ resource: 'health', delta: -3 }],
    stat_key: "forca", stat_gain: 0.15,
    inclination_deltas: { impuls: +0.05, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_social"
  },
  {
    id: "act_rastreig_rutes", name: "Rastreig de Rutes", is_base: false, zona: "Bosc",
    description: "Segueixes les pistes dels animals per aprendre els seus camins. Coneixement que es converteix en provisions.",
    purchase_cost: 3, execute_cost: 1, output_resource: "food", output_min: 3, output_max: 6,
    stat_key: "forca", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.03, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca"
  },

  // GATHERER branch — bt_rasclador_fi
  {
    id: "act_molda_grans", name: "Mòlta de Grans", is_base: false, zona: "Campament",
    description: "Raspes grans silvestres amb el raspador fi per obtenir farina primitiva. Estable i nutritiu.",
    purchase_cost: 3, execute_cost: 1, output_resource: "food", output_min: 3, output_max: 7,
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": -0.02, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_recollecta"
  },

  // GATHERER branch — bt_trampes
  {
    id: "act_parar_trampes", name: "Parar Trampes", is_base: false, zona: "Planes",
    description: "Col·loques llaços i trampes en llocs de pas. La caça passiva allibera temps per a altres tasques.",
    purchase_cost: 3, execute_cost: 1, output_resource: "food", output_min: 2, output_max: 6,
    stat_key: "forca", stat_gain: 0.15,
    inclination_deltas: { impuls: -0.02, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca"
  },
  {
    id: "act_revisar_trampes", name: "Revisar les Trampes", is_base: false, zona: "Bosc",
    description: "Fas la ronda matinal per les trampes. Algunes han funcionat. Una t'ha agafat el dit.",
    purchase_cost: 3, execute_cost: 0, output_resource: "food", output_min: 1, output_max: 4, side_effects: [{ resource: 'health', delta: -3 }],
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: -0.02, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca"
  },

  // GATHERER branch — bt_coneixement_plantes
  {
    id: "act_recollida_bolets", name: "Recollida de Bolets", is_base: false, zona: "Bosc",
    description: "Coneixes quins bolets del bosc són comestibles i quins cal evitar. Provisions i salut.",
    purchase_cost: 3, execute_cost: 1, output_resource: "food", output_min: 2, output_max: 5, side_effects: [{ resource: 'health', delta: +5 }],
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": -0.02, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_recollecta"
  },
  {
    id: "act_assecament_plantes", name: "Assecament de Plantes", is_base: false, zona: "Campament",
    description: "Asseques les plantes recol·lectades per conservar-les. Reserves que aguanten setmanes.",
    purchase_cost: 3, execute_cost: 0, output_resource: "food", output_min: 2, output_max: 4,
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": -0.02, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_recollecta"
  },

  // GATHERER branch — bt_llavor_selectiva
  {
    id: "act_seleccionar_llavors", name: "Seleccionar Llavors", is_base: false, zona: "Campament",
    description: "Tries les millors llavors de la collita. Les plantes del proper cicle donaran més.",
    purchase_cost: 4, execute_cost: 1, output_resource: "food", output_min: 3, output_max: 6,
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_recollecta"
  },
  {
    id: "act_preparar_terreny", name: "Preparar el Terreny", is_base: false, zona: "Planes",
    description: "Neteges una petita parcel·la de pedres i males herbes. El terra nu et sembla prometedor.",
    purchase_cost: 4, execute_cost: 1, output_resource: "food", output_min: 2, output_max: 4, side_effects: [{ resource: 'health', delta: -5 }],
    stat_key: "forca", stat_gain: 0.15,
    inclination_deltas: { impuls: +0.02, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_recollecta"
  },

  // CRAFTSMAN branch — bt_rasclador_fi
  {
    id: "act_faonar_eines", name: "Façonar Eines", is_base: false, zona: "Campament",
    description: "Produeixes eines de sílex de qualitat superior. Millora enginy i obre noves possibilitats artesanals.",
    purchase_cost: 3, execute_cost: 0, material_min: 2, material_max: 4,
    stat_key: "enginy", stat_gain: 0.20,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.05, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },

  // CRAFTSMAN branch — bt_buri
  {
    id: "act_gravar_os", name: "Gravar Os i Ivori", is_base: false, zona: "Campament",
    description: "El burí permet gravar formes en os i ivori. Art i eina, alhora. Millora enginy i espiritualitat.",
    purchase_cost: 4, execute_cost: 0, material_min: 2, material_max: 3,
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.03, espiritualitat: +0.02, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },
  {
    id: "act_intercanviar_eines", name: "Intercanviar Eines", is_base: false, zona: "Planes",
    description: "Intercanvies eines de qualitat per provisions i aliances. Sociabilitat i menjar a canvi de feina artesanal.",
    purchase_cost: 3, execute_cost: 1, output_resource: "food", output_min: 2, output_max: 4,
    material_min: 1, material_max: 2,
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.05 },
    event_pool_id: "pool_social"
  },

  // CRAFTSMAN branch — bt_agulla_os
  {
    id: "act_cosir_pells", name: "Cosir Pells", is_base: false, zona: "Campament",
    description: "Cosius pells amb agulles d'os. La roba que protegeixes millora la salut de tot el clan.",
    purchase_cost: 3, execute_cost: 0, output_resource: "health", output_min: 3, output_max: 6,
    material_min: 1, material_max: 2,
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.03, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },
  {
    id: "act_construir_refugi", name: "Construir Refugi", is_base: false, zona: "Campament",
    description: "Construcció d'un aixopluc millor. El grup descansa protegit i recupera salut.",
    purchase_cost: 4, execute_cost: 1, output_resource: "health", output_min: 4, output_max: 8,
    material_min: 1, material_max: 3,
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.03, espiritualitat: 0, sociabilitat: +0.02 },
    event_pool_id: "pool_artesania"
  },

  // MYSTIC branch — bt_guariment_plantes
  {
    id: "act_curar_herbes", name: "Curar amb Herbes", is_base: false, zona: "Campament",
    description: "Prepareu infusions i cataplasmes d'herbes per als membres malalts o ferits.",
    purchase_cost: 3, execute_cost: 2, output_resource: "health", output_min: 8, output_max: 14,
    stat_key: "vincle", stat_gain: 0.20,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.05, sociabilitat: 0 },
    event_pool_id: "pool_ritual"
  },
  {
    id: "act_preparar_ungüent", name: "Preparar un Ungüent", is_base: false, zona: "Campament",
    description: "Maceres arrels i fulles fins que la pasta agafa color. Dures hores, però el resultat guareix.",
    purchase_cost: 3, execute_cost: 1, output_resource: "health", output_min: 6, output_max: 10,
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.03, espiritualitat: +0.03, sociabilitat: 0 },
    event_pool_id: "pool_ritual"
  },

  // MYSTIC branch — bt_pintura_rupestre
  {
    id: "act_pintar_parets", name: "Pintar les Parets", is_base: false, zona: "Bosc",
    description: "Fixes les visions en les parets de roca del bosc. Els animals pintats semblen moure's amb el foc.",
    purchase_cost: 4, execute_cost: 1, output_resource: "reputacio", output_min: 1, output_max: 3, side_effects: [{ resource: 'health', delta: +5 }],
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.05, sociabilitat: 0 },
    event_pool_id: "pool_ritual"
  },
  {
    id: "act_narrar_llegendes", name: "Narrar les Llegendes", is_base: false, zona: "Campament",
    description: "Expliques les gestes i llegendes del llinatge davant del foc del campament.",
    reputation_gain: 2,
    purchase_cost: 3, execute_cost: 0, material_min: 1, material_max: 2,
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.05, sociabilitat: +0.05 },
    event_pool_id: "pool_social"
  },

  // MYSTIC branch — bt_ornaments
  {
    id: "act_ornamentar_se", name: "Ornamentar-se", is_base: false, zona: "Campament",
    description: "Et poses les closques, dents i pedres que has recollit. El grup et mira diferent.",
    reputation_gain: 1,
    purchase_cost: 3, execute_cost: 0, side_effects: [{ resource: 'health', delta: +5 }],
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.02, sociabilitat: +0.02 },
    event_pool_id: "pool_social"
  },
  {
    id: "act_consagrar_ornaments", name: "Consagrar Ornaments", is_base: false, zona: "Campament",
    description: "Passes els ornaments pel fum del foc del campament. Queden carregats de significat per al clan.",
    reputation_gain: 2,
    purchase_cost: 4, execute_cost: 1, output_resource: "reputacio", output_min: 2, output_max: 4,
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.05, sociabilitat: +0.03 },
    event_pool_id: "pool_ritual"
  },

  // MYSTIC branch — bt_calendari_natural
  {
    id: "act_observar_cel", name: "Observar el Cel Nocturn", is_base: false, zona: "Planes",
    description: "Segueixes els moviments de la lluna i les estrelles des de les planes obertes. Els cicles del cel anuncien els cicles de la terra.",
    purchase_cost: 3, execute_cost: 0, output_resource: "health", output_min: 2, output_max: 4,
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.05, sociabilitat: 0 },
    event_pool_id: "pool_ritual"
  },
  {
    id: "act_transit_nocturn", name: "Trànsit Nocturn", is_base: false, zona: "Bosc",
    description: "Et mous de nit pel bosc seguint els senyals del cel. Perillós, però els que tornen parlen de visions.",
    purchase_cost: 4, execute_cost: 1, output_resource: "reputacio", output_min: 2, output_max: 4, side_effects: [{ resource: 'health', delta: -5 }],
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.08, sociabilitat: 0 },
    event_pool_id: "pool_ritual"
  },

  // SHARED — bt_domini_terra
  {
    id: "act_control_territori", name: "Control del Territori", is_base: false, zona: "Planes",
    description: "Coordines el clan per controlar les zones de caça i recol·lecció. El territori és vostre.",
    minAge: 8,
    purchase_cost: 5, execute_cost: 1, output_resource: "food", output_min: 3, output_max: 7, side_effects: [{ resource: 'health', delta: -5 }],
    stat_key: "forca", stat_gain: 0.15,
    inclination_deltas: { impuls: +0.02, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.02 },
    event_pool_id: "pool_social"
  },
  {
    id: "act_negociar_pastures", name: "Negociar les Pastures", is_base: false, zona: "Planes",
    description: "Trobes els rastres d'un altre grup a les teves zones. T'aproximes amb gestos oberts. Acabeu repartint el territori.",
    purchase_cost: 5, execute_cost: 1, output_resource: "food", output_min: 3, output_max: 6, side_effects: [{ resource: 'health', delta: +3 }],
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.03 },
    event_pool_id: "pool_social"
  },

  // UPGRADES
  // B-01: Acció exclusiva branca Recol·lector — payoff tangible Gen 1
  {
    id: "act_recollecta_avancada", name: "Recol·lecta Avançada", is_base: false, zona: "Planes",
    description: "Apliques el coneixement acumulat del territori: zones òptimes, plantes seleccionades, ritme natural. La millor collita amb el mínim esforç.",
    purchase_cost: 3, execute_cost: 1, output_resource: "food", output_min: 4, output_max: 8,
    inclination_requirements: { "intel·lecte": { min: 0.15 } },
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: -0.02, "intel·lecte": +0.03, espiritualitat: 0, sociabilitat: +0.02 },
    event_pool_id: "pool_recollecta"
  },
  {
    id: "act_aguait_coordinat", name: "Aguait Coordinat", is_upgrade: true, upgrades_action_id: "act_espiar_ramat", zona: "Planes",
    description: "Senyal coordinat amb el grup. La presa no pot fugir. Rendiment molt superior.",
    purchase_cost: 5, execute_cost: 1, output_resource: "food", output_min: 3, output_max: 8,
    stat_key: "forca", stat_gain: 0.10,
    inclination_deltas: { impuls: +0.05, "intel·lecte": +0.02, espiritualitat: 0, sociabilitat: +0.03 },
    event_pool_id: "pool_caca"
  },
  {
    id: "act_recollecta_metodica", name: "Recol·lecta Metòdica", is_upgrade: true, upgrades_action_id: "act_recollectar_arrels", zona: "Planes",
    description: "Apliques coneixement acumulat: zones, estació, plantes. Rendiment molt superior.",
    purchase_cost: 4, execute_cost: 1, output_resource: "food", output_min: 4, output_max: 7,
    stat_key: "enginy", stat_gain: 0.10,
    inclination_deltas: { impuls: -0.02, "intel·lecte": +0.03, espiritualitat: +0.02, sociabilitat: +0.02 },
    event_pool_id: "pool_recollecta"
  },
  {
    id: "act_talla_avancada", name: "Talla Avançada", is_upgrade: true, upgrades_action_id: "act_tallar_pedra", zona: "Campament",
    description: "Eines de qualitat superior. Menys rebuig, formes més precises.",
    purchase_cost: 5, execute_cost: 0, material_min: 3, material_max: 5,
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: -0.02, "intel·lecte": +0.05, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },
  {
    id: "act_gran_ritual", name: "Gran Ritual", is_upgrade: true, upgrades_action_id: "act_ritual_foc", zona: "Campament",
    description: "El ritual s'extén a tota la nit. Cohesió màxima i regeneració profunda.",
    purchase_cost: 4, execute_cost: 1, output_resource: "reputacio", output_min: 2, output_max: 4, universal_prereq: "ut_foc", side_effects: [{ resource: 'health', delta: +10 }],
    stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: -0.02, "intel·lecte": 0, espiritualitat: +0.06, sociabilitat: +0.05 },
    event_pool_id: "pool_ritual"
  },
  {
    id: "act_defensa_activa", name: "Defensa Activa", is_upgrade: true, upgrades_action_id: "act_vigilar_campament", zona: "Campament",
    description: "Distribuïu rols i torns de guàrdia. El campament queda segur i el grup rendeix més.",
    purchase_cost: 5, execute_cost: 1, output_resource: "reputacio", output_min: 2, output_max: 4,
    stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: +0.02, "intel·lecte": +0.02, espiritualitat: 0, sociabilitat: +0.03 },
    event_pool_id: "pool_social"
  }
];

// blocked_if: array de condicions — si QUALSEVOL es compleix, l'event no dispara
//   { type: "has_skill", id: "bt_xxx" }
//   { type: "has_destresa",    id: "d_xxx"  }
//   { type: "stat_min",        stat: "vincle", min: 3.0 }
const EVENT_POOLS = {
  pool_caca: [
    { id: "ev_rastre_fresc",    text: "Rastres frescos! El grup segueix la pista i torna amb extra.", effects: { food: +3 } },
    { id: "ev_bestia_ferida",   text: "Una bèstia ferida ataca. El caçador resulta ferit lleu.",      effects: { food: -1, health: -5 } },
    { id: "ev_ramat_migracio",  text: "El ramat migra cap al nord. Les preses escassegen.",           effects: { food: -2 } },
    { id: "ev_caca_abundant",   text: "Temporada de caça abundant. Reserves extra per a la família.", effects: { food: +5 } },
    {
      id: "ev_desc_llancador", is_discovery_event: true, is_single_use: true,
      discovery_skill_id: "bt_punta_llanca",
      text: "Mentre espies el ramat, veus un caçador d'un altre grup llançar una pedra amb un pal llarg. Abat la presa des d'una distància increïble.",
      options: [
        { text: "Apropar-te a observar (−2 Aliment)", food_delta: -2, discovers: true },
        { text: "Seguir el teu camí", food_delta: +2, discovers: false }
      ]
    },
    {
      id: "ev_desc_trampes", is_discovery_event: true, is_single_use: true,
      discovery_skill_id: "bt_trampes",
      text: "Trobes un grup de recol·lectors que han deixat llaços de fibra vegetal en llocs de pas. Quan tornes, n'hi ha un de ple.",
      options: [
        { text: "Demanar-los que t'ensenyin (−2 Aliment)", food_delta: -2, discovers: true },
        { text: "Continuar amb la teva caça", food_delta: +2, discovers: false }
      ]
    },
    {
      id: "ev_desc_marques", is_discovery_event: true, is_single_use: true,
      discovery_skill_id: "bt_marques_territori",
      text: "Trobes incisions en l'escorça d'un arbre que marquen clarament el límit d'un altre clan. La idea és senzilla i poderosa.",
      options: [
        { text: "Estudiar les marques de prop (−1 Aliment)", food_delta: -1, discovers: true },
        { text: "Retirar-te per respecte", food_delta: +1, discovers: false }
      ]
    },
    {
      id: "ev_bison_ferit",
      text: "La sang és fresca — el rastre no té més d'una hora. El flac esquerra del bisont gota a cada pas. La llum s'esmuny entre els pins i el bosc s'endensa. Si m'atura la nit, el perdo.",
      options: [
        { text: "Seguir ara, en la foscor",          food_delta: +8, health_delta: -4, discovers: false },
        { text: "Acampar aquí, esperar l'alba",       food_delta: +3, health_delta:  0, discovers: false },
        { text: "Deixar-ho anar, cercar presa nova",  food_delta: -1, health_delta: +1, discovers: false }
      ]
    },
    {
      id: "ev_grup_estrany",
      text: "El fum puja recte, tranquil. Un altre grup ha fet foc a la baixada del torrent, just on jo pensava anar avui. Són dos o tres, potser més. No sé si m'han vist.",
      options: [
        { text: "Apropar-me, fer gestos de pau", food_delta: +2, health_delta: +1, discovers: false },
        { text: "Retirar-me sense fer soroll",   food_delta: -2, health_delta:  0, discovers: false },
        { text: "Quedar-me quiet i observar",    food_delta: -1, health_delta:  0, discovers: false }
      ]
    },
    {
      id: "ev_mamut_sol",
      text: "Vell. Les defenses desgastades, els costats enfonsats. S'ha quedat enrere del ramat — potser fa dies. A cent passos. El cor em batega fort i fort.",
      options: [
        {
          text: "Atac directe amb llances",
          food_delta: +12, health_delta: -6, discovers: false,
          skill_modifier: { skill_id: "bt_punta_llanca", absent_health_delta: -12 }
        },
        { text: "Conduir-lo cap al barranc",   food_delta: +10, health_delta: -1, discovers: false },
        { text: "Deixar-lo, seguir un rens",   food_delta:  +2, health_delta:  0, discovers: false }
      ]
    },
    {
      id: "ev_trampa_rival",
      text: "El rens jeu quiet, enredat al llaç. No és el meu llaç. Les marques als arbres propers no em diuen res — no reconec el clan. Qui hagi posat la trampa pot tornar en qualsevol moment.",
      options: [
        { text: "Agafar-ho tot i marxar de pressa",            food_delta: +6, health_delta: -2, discovers: false },
        { text: "No tocar-ho, allunyar-me en silenci",         food_delta:  0, health_delta:  0, discovers: false },
        { text: "Agafar la meitat, deixar senyal de retorn",   food_delta: +3, health_delta: +1, discovers: false }
      ]
    }
  ],
  pool_recollecta: [
    { id: "ev_fruits_madurs",    text: "Fruits silvestres madurs. Una troballa inesperada.",            effects: { food: +3 } },
    { id: "ev_plantes_toxiques", text: "Algunes plantes eren tòxiques. Malestars al grup.",            effects: { food: -2, health: -5 } },
    { id: "ev_bolets_rars",      text: "Bolets estranys però comestibles. Extra de provisions.",       effects: { food: +2 } },
    {
      id: "ev_desc_rasclador", is_discovery_event: true, is_single_use: true,
      discovery_skill_id: "bt_rasclador_fi",
      text: "Recolles arrels prop d'un grup estranger. Una dona rasca una arrel amb un fragment de sílex molt fi que mai no havies vist — surt una polpa perfecta.",
      options: [
        { text: "Preguntar-li com ho fa (−2 Aliment)", food_delta: -2, discovers: true },
        { text: "Continuar amb la teva tècnica", food_delta: +2, discovers: false }
      ]
    },
    {
      id: "ev_desc_coneixement_plantes", is_discovery_event: true, is_single_use: true,
      discovery_skill_id: "bt_coneixement_plantes",
      text: "Un ancià del grup proper recol·lecta plantes amb una precisió inusual, triant-les una a una. Sembla que coneix cada fulla pel nom.",
      options: [
        { text: "Seguir-lo i aprendre (−2 Aliment)", food_delta: -2, discovers: true },
        { text: "Continuar recol·lectant pel teu compte", food_delta: +1, discovers: false }
      ]
    },
    {
      id: "ev_desc_llavor", is_discovery_event: true, is_single_use: true,
      discovery_skill_id: "bt_llavor_selectiva",
      text: "Mentre mols grans, notes que alguns son més grossos i més pesats. Et preguntes si sembrant-los sortirien plantes millors.",
      options: [
        { text: "Apartar-los i experimentar (−2 Aliment)", food_delta: -2, discovers: true },
        { text: "Mòl-los tots igual", food_delta: +1, discovers: false }
      ]
    },
    {
      id: "ev_pluja_tardor",
      text: "El cel s'ha tornat groguenc i l'aire pesa. Sento la primera frescor a la nuca — la tempesta és propera. La meva cistella és a la meitat. Cada gota que cau ja em renta les mans.",
      options: [
        { text: "Seguir recollint fins que truoni",          food_delta: +3, health_delta: -1, discovers: false },
        { text: "Arreplegar el que tinc i córrer",           food_delta: +1, health_delta: +1, discovers: false },
        { text: "Marco els tubercles, agafo les baies peribles i marxo", food_delta: +2, health_delta: +1, material_delta: +1, requires_skill: "bt_coneixement_plantes", discovers: false }
      ]
    },
    {
      id: "ev_ossa_amb_cries",
      text: "L'ossa és al roure que volia collir. Les cries s'enganxen al tronc i piulen. Em veu però no s'ha mogut — m'estudia. El meu cor bat fort i lent a la vegada.",
      options: [
        { text: "Recular a poc a poc, sense girar l'esquena", food_delta: -1, health_delta: +2, discovers: false },
        { text: "Fer soroll fort i moure els braços",          food_delta: +2, health_delta: -2, discovers: false },
        { text: "Ajupir-me darrere les mates i esperar",      food_delta: +1, health_delta: +1, discovers: false }
      ]
    },
    {
      id: "ev_fong_blanc",
      text: "El fong és gran, blanc, amb el capell pàl·lid com os sec. No el conec. El grup porta hores sense menjar i ningú diu res, però tothom me'l mira.",
      options: [
        { text: "Agafar-lo i repartir-lo",       food_delta: +3, health_delta: -3, discovers: false },
        { text: "Deixar-lo estar, seguim",        discovers: false },
        { text: "Observo el peu, l'olor, el color de les làmines — decideixo", food_delta: +2, health_delta: +1, requires_skill: "bt_coneixement_plantes", discovers: false }
      ]
    },
    {
      id: "ev_arbust_espinos",
      text: "Les baies son gruixudes i morades, perfectament madures. Però l'esbarzer les tanca per tots costats. Demà potser ja no hi seran — els ocells ho saben.",
      options: [
        { text: "Endinsar-m'hi directe, cos endavant",       food_delta: +3, health_delta: -1, material_delta: -1, discovers: false },
        { text: "Agafar una branca llarga i sacsejar",        food_delta: +1, discovers: false },
        { text: "Voltar fins a trobar un pas entre branques", food_delta: +2, health_delta: +1, discovers: false }
      ]
    }
  ],
  pool_artesania: [
    { id: "ev_eina_trencada",    text: "L'eina es trenca durant la feina. Cal refer-la.",              effects: { material: -1 } },
    { id: "ev_tecnica_nova",     text: "Un descobriment accidental millora la tècnica.",               effects: { material: +1 } },
    { id: "ev_intercanvi_eines", text: "Un grup veí demana eines a canvi de provisions.",              effects: { food: +1, material: +1 } },
    {
      id: "ev_desc_agulla", is_discovery_event: true, is_single_use: true,
      discovery_skill_id: "bt_agulla_os",
      text: "Mentre talles os, un fragment llarg i fi queda perfectament fi com una agulla. Un membre del grup el recull pensatiu: \"Amb un forat aquí, podríem cosir pells...\"",
      options: [
        { text: "Experimentar plegats (−2 Aliment)", food_delta: -2, discovers: true },
        { text: "Deixar-ho per a un altre moment", food_delta: +1, discovers: false }
      ]
    },
    {
      id: "ev_desc_buri", is_discovery_event: true, is_single_use: true,
      discovery_skill_id: "bt_buri",
      text: "Un artesà d'un grup veí grava línies en un fragment d'os amb una eina punxeguda molt fina. El resultat és inusitadament precís.",
      options: [
        { text: "Demanar-li que t'ensenyi (−2 Aliment)", food_delta: -2, discovers: true },
        { text: "Admirar la feina i continuar", food_delta: +1, discovers: false }
      ]
    },
    {
      id: "ev_fissura_pedra",
      text: "El cop de percussor ha obert una fissura que no havia vist. La pedra cruix lleugerament sota els dits. La línia corre en diagonal, cap a la part que volia conservar. Puc seguir tallant per aquí, adaptar el tall a on la roca vol anar, o llençar-ho i buscar un altre bloc.",
      options: [
        { text: "Forçar l'angle: aprofitar la fissura com a guia natural.", material_delta: -4, discovers: false },
        { text: "Canviar el tall: deixo que la pedra decideixi la forma.",  material_delta: +1, discovers: false },
        { text: "Descartar. Camino fins al jaç de sílex a cercar un bloc millor.", food_delta: -1, material_delta: -1, discovers: false }
      ]
    },
    {
      id: "ev_aprenent_observa",
      text: "Un infant s'ha aturat darrere meu i mira com treballo la pedra. No fa soroll. Observa on cau el rebuig i segueix el moviment de la meva mà. Podria deixar-lo quedar i anar explicant en veu baixa, fer-lo marxar ara i ensenyar-lo quan tingui temps, o donar-li els fragments petits perquè s'hi entreni.",
      options: [
        { text: "Deixar-lo quedar. Parlo mentre treballo, sense aturar-me.", material_delta: -1, discovers: false },
        { text: "Fer-lo marxar. Li diré que torni quan acabi aquesta peça.",  material_delta: +1, discovers: false },
        { text: "Donar-li el rebuig. Que aprengui amb els fragments que jo no vull.", health_delta: +1, material_delta: -1, discovers: false }
      ]
    },
    {
      id: "ev_fulla_prestada",
      text: "El company s'atura al costat meu i mostra la seva presa. Ha anat bé, però la seva fulla ha quedat embotida dins la bèstia i l'ha perduda. M'allarga la mà. La meva fulla és bona, però no en tinc cap altra avui. Decideixo ràpidament.",
      options: [
        { text: "Donar-li la meva fulla. Ell torna amb menjar per als dos.", food_delta: +2, material_delta: -2, discovers: false },
        { text: "Donar-li un fragment de rebuig. Serveix per netejar, si va amb compte.", food_delta: +1, material_delta: -1, discovers: false },
        { text: "Dir-li que no. Avui la necessito.", food_delta: -1, material_delta: +1, discovers: false }
      ]
    },
    {
      id: "ev_tecnica_subtil",
      blocked_if: [{ type: "not_has_skill", id: "bt_buri" }],
      text: "He notat que quan inclino el burí uns dits cap a l'esquerra, el solc surt net i sense esclats. Un artesà que no havia vist mai s'ha assegut al costat i treballa amb el burí inclinat, exactament com ho he provat jo. Sembla que ja ho sap des de fa temps.",
      options: [
        { text: "Preguntar-li directament: mostro el meu solc i el seu, i espero.", health_delta: +1, material_delta: +1, discovers: false },
        { text: "No dir res. Segueixo experimentant sol fins que ho entenc del tot.", discovers: false },
        { text: "Ensenyar-li el que he descobert jo primer, abans de preguntar-li res.", health_delta: +2, material_delta: +1, discovers: false }
      ]
    }
  ],
  pool_ritual: [
    {
      id: "pe_malaltia",
      text: "Una febre s'escampa pel campament. Alguns membres cauen malalts i les reserves s'esgoten.",
      effects: { food: -3, health: -15 },
      blocked_if: [
        { type: "has_skill", id: "bt_guariment_plantes" }
      ]
    },
    { id: "ev_visio_profunda",   text: "Una visió durant el ritual guia el grup cap a recursos amagats.", effects: { health: +2 } },
    { id: "ev_ritual_cohesio",   text: "El ritual reforça la cohesió del grup.",                          effects: { reputacio: +1 } },
    { id: "ev_espiritocontent",  text: "Els esperits estan contents. El grup se sent protegit.",          effects: { health: +5 } },
    {
      id: "ev_desc_herbes", is_discovery_event: true, is_single_use: true,
      discovery_skill_id: "bt_guariment_plantes",
      text: "Durant el ritual, un vell crema certes herbes que mai no has vist. Olora diferent. Algú amb mal de ventre s'ha millorat, i ningú no entén per qué.",
      options: [
        { text: "Demanar-li que t'ho expliqui", food_delta: -2, discovers: true },
        { text: "Observar en silenci", food_delta: +1, discovers: false }
      ]
    },
    {
      id: "ev_desc_pintura", is_discovery_event: true, is_single_use: true,
      discovery_skill_id: "bt_pintura_rupestre",
      text: "En un moment de silenci prop d'una paret de roca, el foc projecta ombres que semblen animals movent-se. Per un instant, sents que podries fixar-les.",
      options: [
        { text: "Intentar dibuixar les formes amb fang", food_delta: -1, discovers: true },
        { text: "Guardar el moment per tu", food_delta: 0, discovers: false }
      ]
    },
    {
      id: "ev_desc_calendari", is_discovery_event: true, is_single_use: true,
      discovery_skill_id: "bt_calendari_natural",
      text: "Mentre fas el ritual, notes que la lluna ha tornat al mateix punt que fa molts dies. Alguna cosa en tu comença a comptar.",
      options: [
        { text: "Marcar el cicle en un os (−1 Aliment)", food_delta: -1, discovers: true },
        { text: "Continuar el ritual sense aturar-te", food_delta: 0, discovers: false }
      ]
    },
    {
      id: "ev_dol_enterrament",
      text: "Un membre del clan ha mort al matí. Hi ha ocre vermell al sac, i un cargol marí que ningú no ha volgut tocar. El cos és allà. Ningú no sap ben bé quant de temps podem esperar.",
      options: [
        { text: "Enterrar-lo fondo. Posar-hi l'ocre i el cargol.", food_delta: 0, health_delta: +2, material_delta: -2, discovers: false },
        { text: "Cavar just el que cal. Cobrir-lo i continuar.",   food_delta: 0, health_delta:  0, material_delta:  0, discovers: false },
        { text: "Deixar-lo a l'aire. El vent i les bèsties fan la seva feina.", food_delta: 0, health_delta: -1, material_delta: 0, discovers: false }
      ]
    },
    {
      id: "ev_figura_venus",
      text: "Tens un tros d'ivori a les mans. La forma surt sola — corbes, volum, pes. El clan s'ha aturat a mirar. No sé si és jo qui la faig o ella que es deixa fer.",
      options: [
        { text: "Acabar-la i posar-la al centre del campament.", food_delta: 0, health_delta: +1, material_delta: -1, discovers: false },
        { text: "Acabar-la i guardar-la. Aquesta és meva.",       food_delta: 0, health_delta: +2, material_delta: -1, discovers: false },
        { text: "Colpejar el bloc fins que es trenqui.",          food_delta: 0, health_delta:  0, material_delta:  0, discovers: false }
      ]
    },
    {
      id: "ev_transicio_xaman",
      blocked_if: [{ type: "axis_above", axis: "impuls", value: 0.70 }],
      text: "Fa dies que veig coses. Formes a les pedres, veus que no venen de cap boca. L'ancià m'ha mirat diferent. Diu que és el senyal. Puc entrar-hi o deixar-ho passar.",
      options: [
        { text: "Tres nits sol a la caverna. Res a menjar.", food_delta: -2, health_delta: -1, discovers: false },
        { text: "Fer-ho amb l'ancià i el clan a prop.",      food_delta: -1, health_delta:  0, discovers: false }
      ]
    },
    {
      id: "ev_planta_amarga",
      text: "Un infant crema de febre des de fa dos dies. Un vell s'acosta amb una rel negra que no he vist mai. Diu que funciona. No en sé res, però el nen empitjora.",
      options: [
        {
          text: "Provar la rel a dosi petita. Veure com respon.",
          food_delta: 0, discovers: false,
          skill_modifier: {
            skill_id: "bt_guariment_plantes",
            present_health_delta: +3,
            absent_health_options: [+1, -2]
          }
        },
        { text: "Continuar amb el que conec. Carn bullida, caliu, repòs.", food_delta: -1, health_delta: +1, discovers: false },
        { text: "Deixar que ho faci el vell. Donar-li una ofrena.",        food_delta:  0, health_delta: +2, material_delta: -1, discovers: false }
      ]
    }
  ],
  pool_social: [
    { id: "ev_dispute_interna",  text: "Una disputa interna distreu el grup.",                       effects: { reputacio: -1 } },
    { id: "ev_aliat_nou",        text: "Un grup veí ofereix col·laboració temporal.",               effects: { reputacio: +2 } },
    { id: "ev_lider_respectat",  text: "El respecte augmenta. El grup treballa millor.",            effects: { reputacio: +1 } },
    {
      id: "ev_desc_ornaments", is_discovery_event: true, is_single_use: true,
      discovery_skill_id: "bt_ornaments",
      text: "L'estranger que ha visitat el campament porta closques foradades lligades al coll. Tothom els mira. L'home somriu i te n'ofereix una.",
      options: [
        { text: "Acceptar-la i preguntar-li (−3 Aliment)", food_delta: -3, discovers: true },
        { text: "Agrair-ho però declinar", food_delta: +1, discovers: false }
      ]
    },
    {
      id: "ev_desc_domini_terra", is_discovery_event: true, is_single_use: true,
      discovery_skill_id: "bt_domini_terra",
      text: "Un clan veí i el teu han recol·lectat a la mateixa zona fins que l'han esgotada. Si s'hagués repartit el territori, tots haurien menjat millor.",
      options: [
        { text: "Proposar un acord de zones (−2 Aliment)", food_delta: -2, discovers: true },
        { text: "Marxar a buscar una altra zona", food_delta: +1, discovers: false }
      ]
    },
    {
      id: "ev_fill_orfe",
      blocked_if: [{ type: "resource_below", resource: "food", value: 3 }],
      text: "Una dona del clan s'acosta amb dos infants agafats a la seva roba. El seu home no ha tornat de la darrera cacera. Em mira sense dir res, però l'enteneixo. El clan observa des de lluny com reacciono.",
      options: [
        { text: "Els acollim: dormen sota el meu sostre i mengen a la meva taula.", food_delta: -2, material_delta: -1, discovers: false },
        { text: "Proposo que el clan reparteixi la càrrega entre tots.",            food_delta: -1, discovers: false },
        { text: "Faig veure que no he vist res i continuo amb el meu treball.",     discovers: false }
      ]
    },
    {
      id: "ev_rancor_ancians",
      text: "Dos dels homes vells del clan s'han encarar a crits davant tothom. La disputa és per la queixalada millor d'un cérvol abatut ahir. Ningú s'atreveix a intervenir, però tots m'estan mirant.",
      options: [
        { text: "Prenc part pel que crec que té raó i li cedeixo el que li toca.", material_delta: +1, discovers: false },
        { text: "Proposo dividir la peça de manera que cap dels dos surti guanyador.", material_delta: -1, discovers: false },
        { text: "M'allunyo. Que ho resolguin ells.", discovers: false }
      ]
    },
    {
      id: "ev_estrany_a_la_vora",
      blocked_if: [{ type: "resource_below", resource: "health", value: 3 }],
      text: "Un home s'acosta al campament arrossegant els peus. No és del clan. Porta una bossa de cuir amb pedres que no he vist mai per aquí. Té els llavis secs i els ulls enfonsats de caminada llarga.",
      options: [
        { text: "L'invito a seure i li ofereixo menjar. Acabem bescanviant pedres.", food_delta: -1, material_delta: +2, discovers: false },
        { text: "Li dono una mica de menjar i li indico el camí per on ha de seguir.", food_delta: -1, discovers: false },
        { text: "No el deixo apropar-se. Protegeixo els meus primer.", requires_children: true, discovers: false }
      ]
    },
    {
      id: "ev_criatura_dificil",
      text: "Un infant del clan fa mesos que hauria d'haver parlat i no ho fa. La mare cada nit li posa la mà al pit i espera. Alguns volen cridar el vell que fa els rituals; d'altres diuen que és qüestió d'alimentar-lo millor.",
      options: [
        { text: "Contribueixo als materials del ritual i m'assec prop de la família.", food_delta: -1, health_delta: +1, material_delta: -1, requires_children: true, discovers: false },
        { text: "Deixo una part de les meves provisions per ajudar a cobrir el ritual.", food_delta: -1, material_delta: -1, requires_no_children: true, discovers: false },
        { text: "Porto menjar a la família i dic a la mare que els infants a vegades triguen.", food_delta: -2, health_delta: +1, requires_children: true, discovers: false },
        { text: "Porto el que puc de menjar i els dic que l'infant trobarà la veu quan estigui llest.", food_delta: -1, health_delta: +1, requires_no_children: true, discovers: false },
        { text: "No és assumpte meu. Cada família resol les seves coses.", discovers: false }
      ]
    }
  ],
  pool_familia: [
    {
      id: "ev_fill_pregunta",
      text: "El fill s'ha assegut al teu costat mentre treballes. \"Per què fem això?\", pregunta, assenyalant les teves mans. La pregunta és senzilla però no trobes una resposta fàcil.",
      options: [
        { text: "Li explico pas a pas, amb paciència. Parem de fer feina una estona.", food_delta: -1, health_delta: +2, discovers: false },
        { text: "\"Perquè cal fer-ho\". Li ensenyaré quan sigui gran.", material_delta: +1, discovers: false },
        { text: "Li deixo que ho provi ell mateix. Superviso des de lluny.", food_delta: -1, material_delta: +1, discovers: false }
      ]
    },
    {
      id: "ev_fill_aprenentatge",
      text: "El fill ha reproduït, sense que li ho diguessis, una tècnica que li vas ensenyar fa setmanes. No era perfecta, però la intuïció hi era. Es gira a mirar-te.",
      options: [
        { text: "El felicito davant del grup. Que tothom ho vegi.", food_delta: 0, health_delta: +2, discovers: false },
        { text: "Li dic on ha fallat i com millorar-ho. Aprenentatge primer.", food_delta: 0, material_delta: +1, discovers: false },
        { text: "Faig veure que no l'he vist. Vull que ho descobreixi sol.", food_delta: 0, health_delta: +1, discovers: false }
      ]
    },
    {
      id: "ev_fill_rebel",
      text: "El fill ha marxat a jugar just quan l'havies posat a aprendre. Ha tornat tard, amb les mans brutes, però amb els ulls lluminosos. No sap el que s'ha perdut.",
      options: [
        { text: "Castigo sever. Perd el sopar i l'explico les conseqüències.", food_delta: +1, health_delta: -1, discovers: false },
        { text: "Li pregunto on ha anat. Escolto. Potser ha après alguna cosa diferent.", food_delta: -1, health_delta: +1, discovers: false },
        { text: "Ho deixo passar. La infància és curta.", food_delta: 0, discovers: false }
      ]
    },
    {
      id: "ev_fill_malalt",
      text: "El fill porta dos dies amb febre. Menja poc, dorm malament, crida de nit. Cap de les coses que fas sembla que funcioni. Els membres del grup t'observen.",
      options: [
        {
          text: "Cerco les herbes que he vist usar a la curandera. Ho provaré.",
          food_delta: -1, discovers: false,
          skill_modifier: { skill_id: "bt_guariment_plantes", present_health_delta: +4, absent_health_delta: +1 }
        },
        { text: "Repòs, caliu i carn bullida fins que millori.", food_delta: -2, health_delta: +2, discovers: false },
        { text: "Crido l'ancià del ritual. Que ell s'en faci càrrec.", food_delta: 0, health_delta: +1, material_delta: -1, discovers: false }
      ]
    },
    {
      id: "ev_llegat_familiar",
      text: "Mentre ensenyes el fill, reconeixes un gest de la teva mare. La manera de subjectar l'eina, l'angle del colze. No ho vas aprendre conscientment — hi era.",
      effects: { health: +3, reputacio: +1 }
    }
  ]
};

// Thresholds ×0.73 (playtest 2026-06-06) — branques més assolibles
const BRANCHES = [
  {
    id: "branch_hunter",   name: "Caçador",
    conditions: { operator: "AND", conditions: [{ axis: "impuls", min: 0.22 }, { axis: "sociabilitat", max: 0.30 }] }
  },
  {
    id: "branch_gatherer", name: "Recol·lector",
    conditions: { operator: "AND", conditions: [{ axis: "impuls", max: 0.10 }, { axis: "intel·lecte", min: 0.15 }] }
  },
  {
    id: "branch_craftsman", name: "Artesà",
    conditions: { operator: "AND", conditions: [{ axis: "intel·lecte", min: 0.18 }, { axis: "impuls", max: 0.20 }] }
  },
  {
    id: "branch_mystic",   name: "Místic",
    conditions: { operator: "AND", conditions: [{ axis: "espiritualitat", min: 0.22 }, { axis: "sociabilitat", min: 0.19 }] }
  }
];
