// PROTOTYPE - NOT FOR PRODUCTION
// Question: Does inclination-driven action visibility + branch tech discovery + succession feel engaging?
// Date: 2026-05-26

'use strict';

// --- Game Design Parameters ---
const ERA_CYCLES      = 100;  // Cicles totals de l'era; no es reinicia entre generacions
const LIFE_EXPECTANCY = 20;   // Durada esperada d'un personatge; calibra la fórmula d'envelliment
const MAX_CHILDREN    = 3;

const STARTING_FOOD = 4;
const FOOD_MAX      = 20;
const FOOD_MAX_START = 8;   // Capacitat inicial; creix amb assecar_provisions
const FOOD_UPKEEP   = 2;

const STARTING_HEALTH      = 30;
const HEALTH_MAX           = 40;
const HEALTH_FIRE_BONUS    = 0.25;  // +25% salut immediata en descobrir el foc
const HEALTH_POST_FIRE     = 50;    // pic de salut de gens posteriors al foc

// Corba de salut: creix de HEALTH_CAP_START fins a pic en HEALTH_GROW_TURNS,
// estable HEALTH_STABLE_TURNS, llavors decau exponencialment.
const HEALTH_CAP_START    = 30;
const HEALTH_GROW_TURNS   = 4;
const HEALTH_STABLE_TURNS = 4;
const HEALTH_DECAY_SCALE  = 0.27;
const HEALTH_DECAY_POWER  = 2;

const AGING_BASE      = 3;
const AGING_THRESHOLD = 10;
const AGING_POWER     = 1.8;
const AGING_SCALE     = 0.35;

const STAT_MAX            = 5.0;
const STAT_STARTING_VALUE = 1.0;
const STAT_OUTPUT_FACTOR  = 0.15;

const DESTRESA_THRESHOLD     = 5;
const DESTRESA_MAX           = 4;
const DESTRESA_BONUS         = 1;
const APRENENTATGE_THRESHOLD = 4;  // usos mínims d'una acció de descoberta per poder aprendre
const APRENENTATGE_MAX       = 2;  // màxim per personatge (1 ensenyat + 1 descobert)

// Herència de destreses: 1 del pare (tirada aleatòria entre les seves) + 1 aleatòria del pool global

// Estats del personatge — inicialitzats a startVal, resetejats en successió
// Usats com a prerequisits (requires) i efectes (character_effect) de les accions
const CHARACTER_STATE_DEFS = [
  { id: 'parella',  startVal: 0, max: 1            },
  { id: 'fills',    startVal: 0, max: MAX_CHILDREN },
  { id: 'ensenyat', startVal: 0, max: 1            },
];

const INCLINATION_INHERITANCE_RATE = 0.85;  // 85%: identitat de llinatge sense bloqueig complet des de gen 1
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
    glossaryDesc: `Es consumeix -${FOOD_UPKEEP}/torn. Si s'esgota, Salut decreix. Cap inicial: ${FOOD_MAX_START} (creix fins a ${FOOD_MAX} amb Assecar Provisions).`,
  },
  {
    id: 'health', emoji: '❤️', label: 'Salut', section: 'vitals',
    startVal: STARTING_HEALTH, max: HEALTH_MAX, upkeep: null,
    showMax: false, rateType: 'aging', critAt: 15, warnAt: 25,
    color: 'var(--green)', borderColor: 'rgba(74,222,128,0.3)',
    glossaryDesc: `Estat físic. Neix amb ${STARTING_HEALTH}, creix fins a ${HEALTH_MAX} en ${HEALTH_GROW_TURNS} torns, estable ${HEALTH_STABLE_TURNS} torns, llavors decau. A 0 el personatge mor.`,
  },
  {
    id: 'material', emoji: '🔵', label: 'Tokens', section: 'resources',
    startVal: 0, max: 35, upkeep: null, showMax: true, rateType: false,
    persistent: true, inheritDecay: 0.3,
    color: 'var(--blue)', borderColor: 'rgba(96,165,250,0.3)',
    glossaryDesc: "Derivat automàtic de tota acció executada. Gastat per comprar noves accions al Mercat. Persisteix entre generacions.",
  },
  {
    id: 'pedra', emoji: '🪨', label: 'Pedra', section: 'resources',
    startVal: 0, max: 10, upkeep: null, showMax: true, rateType: false,
    persistent: true, inheritDecay: 1.0,
    color: '#9ca3af', borderColor: 'rgba(156,163,175,0.3)',
    glossaryDesc: "Sílex i pedra calcària recollida als voltants. Necessària per fabricar eines.",
  },
  {
    id: 'branques', emoji: '🌿', label: 'Fibres', section: 'resources',
    startVal: 0, max: 8, upkeep: null, showMax: true, rateType: false,
    persistent: true, inheritDecay: 1.0,
    color: '#86efac', borderColor: 'rgba(134,239,172,0.3)',
    glossaryDesc: "Fibres vegetals, escorces i fusta prima recollida al bosc. Necessària per fabricar eines orgàniques (garbell, talisman) i eines compostes (llança, estri).",
  },
  {
    id: 'eina', emoji: '🔧', label: 'Eines', section: 'resources',
    startVal: 0, max: 3, upkeep: null, showMax: true, rateType: false,
    persistent: true, inheritDecay: 0.3,
    color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)',
    glossaryDesc: "Eines fabricades. Cada branca crea la seva: llança (Caçador), estri (Artesà), garbell (Recol·lector), talisman (Místic). Cap: 3.",
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
];

// --- Aprenentatge Definitions ---
// Aprenentatges: bonus permanents adquirits de dues maneres (fins a 2 per personatge):
//   1. Via act_ensenyar: el pare transmet UN dels seus aprenentatges al fill (charState.ensenyat = 1)
//   2. Via descoberta durant la partida: accions o events específics els desbloquegen
// Un cop adquirit, l'aprenentatge pertany al personatge (no al llinatge) — no s'hereta automàticament.
// El fill rep UN aprenentatge ensenyat (si el pare va executar act_ensenyar) i pot descobrir el segon durant la seva vida.
// discoveryChance: probabilitat per tirada (quan s'han fet >= APRENENTATGE_THRESHOLD usos d'una discovery_action_id)
// effect.type: "bonus_action_output" (bonus a una acció concreta) | "food_upkeep_reduction" | "material_bonus" (global, totes les accions)
const APRENENTATGE_DEFS = [
  {
    id: "apr_cures_basiques", name: "Cures Bàsiques", icon: "🩹",
    description: "Saps aplicar remeis senzills: compreses d'arrels i embenats. Curar és ara molt més eficaç.",
    discoveryChance: 0.30,
    discovery_action_ids: ["act_curar_herbes", "act_preparar_ungüent", "act_contemplacio"],
    effect: { type: "bonus_action_output", action_id: "act_curar_herbes", output_min_bonus: 2, output_max_bonus: 2, desc: "+2 Salut en curar amb herbes" }
  },
  {
    id: "apr_conservar_provisions", name: "Conservació", icon: "🧂",
    description: "Saps assecar i preservar. L'aliment del clan es malgasta menys cada dia.",
    discoveryChance: 0.30,
    discovery_action_ids: ["act_assecament_plantes", "act_ahumar_carn", "act_assecar_provisions"],
    effect: { type: "food_upkeep_reduction", value: 0.5, desc: "−0.5 aliment/torn en upkeep" }
  },
  {
    id: "apr_orientacio", name: "Orientació", icon: "🧭",
    description: "Llegeixes el terreny i les estrelles amb naturalitat. Explorar rendeix molt més.",
    discoveryChance: 0.25,
    discovery_action_ids: ["act_explorar_voltants", "act_rastreig_rutes", "act_transit_nocturn"],
    effect: { type: "bonus_action_output", action_id: "act_explorar_voltants", output_min_bonus: 1, output_max_bonus: 2, desc: "+1/+2 material en explorar" }
  },
  {
    id: "apr_treball_pedra", name: "Treball de la Pedra", icon: "🪨",
    description: "Tries el millor sílex i calcules l'angle de talla. L'artesania de pedra dona molt més.",
    discoveryChance: 0.30,
    discovery_action_ids: ["act_tallar_pedra", "act_recollectar_pedra", "act_faonar_eines"],
    effect: { type: "bonus_action_output", action_id: "act_faonar_eines", output_min_bonus: 2, output_max_bonus: 2, desc: "+2 eines en façonar estris" }
  },
  {
    id: "apr_lectura_senyals", name: "Lectura de Senyals", icon: "👣",
    description: "Rastre, excrement, mossegades: el bosc t'explica on han passat els animals. La caça és molt menys incerta.",
    discoveryChance: 0.30,
    discovery_action_ids: ["act_espiar_ramat", "act_rastreig_rutes", "act_marcar_territori"],
    effect: { type: "bonus_action_output", action_id: "act_espiar_ramat", output_min_bonus: 1, output_max_bonus: 2, desc: "+1/+2 aliment en espiar el ramat" }
  },
  {
    id: "apr_plantes_medicinals", name: "Plantes Medicinals", icon: "🌿",
    description: "Saps quines arrels curen, nodreixen i calmen. Cada recol·lecta dona una mica més.",
    discoveryChance: 0.30,
    discovery_action_ids: ["act_recollectar_arrels", "act_assecament_plantes", "act_preparar_ungüent"],
    effect: { type: "bonus_action_output", action_id: "act_recollectar_arrels", output_min_bonus: 1, output_max_bonus: 2, desc: "+1/+2 aliment en recol·lectar arrels" }
  },
  {
    id: "apr_veu_clan", name: "La Veu del Clan", icon: "🗣️",
    description: "Saps transmetre, inspirar i mediar. Les teves paraules generen recursos allà on les llances no arriben.",
    discoveryChance: 0.20,
    discovery_action_ids: ["act_narrar_llegendes", "act_explicar_orígens", "act_cants_grup"],
    effect: { type: "material_bonus", value: 1, desc: "+1 material a totes les accions" }
  },
  {
    id: "apr_guardia", name: "Guàrdia", icon: "🛡️",
    description: "Has après a coordinar torns de vigilància i distribuir rols de defensa. El campament es manté segur i el grup rendeix millor.",
    discoveryChance: 0.30,
    discovery_action_ids: ["act_vigilar_campament"],
    effect: { type: "bonus_action_output", action_id: "act_vigilar_campament", output_min_bonus: 1, output_max_bonus: 2, desc: "+1/+2 salut en vigilar el campament" }
  },
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
    description: "El clan sempre ha conegut el foc; ara sap fer-lo néixer. Sílex i pirita arrenquen espurnes a voluntat: cuina, calor, llum i protecció ja no depenen de cap brasa heretada.",
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
    id: "ut_ceramica", name: "La Ceràmica", icon: "🏺", cycle: 70,
    description: "L'argila passada pel foc es torna pedra. Primer figures que expliquen el món; després, els primers vasos que guarden el que abans es perdia.",
    effect: null
  },
  {
    id: "ut_agricultura", name: "El Primer Conreu", icon: "🌾", cycle: 85,
    description: "Llavors triades i sembrades a posta. Encara no hi ha camps — hi ha un gest nou que canviarà totes les eres que vindran.",
    effect: null
  }
];

// inheritanceRate: camp llegat, no utilitzat. Les habilitats s'hereten sempre al 100% (pertanyen al llinatge, no al personatge).
const SKILL_DEFS = [
  {
    id: "bt_punta_llanca", name: "Punta de Llança",
    inheritanceRate: 0.45,
    universal_prereq: "ut_eines",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "impuls", min: 0.25 }, { axis: "sociabilitat", max: 0.30 }] },
    unlocks_action_ids: ["act_caca_llanca", "act_emboscada_nocturna", "act_forjar_punta"],
    passive_effect: { type: "bonus_action_output", action_id: "act_espiar_ramat", output_min_bonus: 1, desc: "+1 mínim espiar ramat (la punta millora la caça base)" },
    is_hidden: false
  },
  {
    id: "bt_rasclador_fi", name: "Rasclador Fi",
    inheritanceRate: 0.35,
    universal_prereq: "ut_eines",
    inclination_conditions: { operator: "OR", conditions: [{ axis: "intel·lecte", min: 0.18 }, { axis: "sociabilitat", min: 0.18 }] },
    unlocks_action_ids: ["act_molda_grans", "act_faonar_eines", "act_treballar_estris"],
    passive_effect: { type: "bonus_action_output", action_id: "act_recollectar_arrels", output_min_bonus: 1, desc: "+1 mínim recol·lecta" },
    is_hidden: false
  },
  {
    id: "bt_buri", name: "Burí i Gravat",
    inheritanceRate: 0.40,
    universal_prereq: "ut_eines",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "intel·lecte", min: 0.25 }, { axis: "impuls", max: 0.20 }] },
    unlocks_action_ids: ["act_gravar_os", "act_intercanviar_eines"],
    passive_effect: { type: "bonus_action_output", action_id: "act_faonar_eines", output_min_bonus: 1, desc: "+1 eina en façonar estris (el burí permet formes més precises)" },
    is_hidden: false
  },
  {
    id: "bt_eines_cerimonials", name: "Eines Cerimonials",
    inheritanceRate: 0.40,
    universal_prereq: "ut_eines",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "espiritualitat", min: 0.18 }, { axis: "sociabilitat", min: 0.15 }] },
    unlocks_action_ids: ["act_ofrena_eines", "act_cerimonia_eines", "act_crear_talisman"],
    passive_effect: { type: "grant_material", amount: 2, desc: "+2 Material (les eines cerimonials reforcen l'estatus del clan)" },
    is_hidden: false
  },
  {
    id: "bt_musica_os", name: "Flautes d'Os",
    inheritanceRate: 0.40,
    universal_prereq: "ut_eines",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "intel·lecte", min: 0.15 }, { axis: "espiritualitat", min: 0.15 }] },
    unlocks_action_ids: ["act_tallar_flauta", "act_musica_vetlla"],
    passive_effect: { type: "grant_health", amount: 5, desc: "+5 Salut (la música calma el clan a les nits llargues)" },
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
    inheritanceRate: 0.45,
    universal_prereq: "ut_corda",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "sociabilitat", min: 0.10 }] },
    unlocks_action_ids: ["act_parar_trampes", "act_revisar_trampes"],
    passive_effect: { type: "bonus_action_output", action_id: "act_parar_trampes", output_min_bonus: 1, desc: "+1 mínim parar trampes (les trampes de corda son més eficaces)" },
    is_hidden: false
  },
  // ── El Foc ──────────────────────────────────────────────────────────────────
  {
    id: "bt_cuina_conservacio", name: "Cuina i Conservació",
    inheritanceRate: 0.45,
    universal_prereq: "ut_foc",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "intel·lecte", min: 0.15 }, { axis: "impuls", max: 0.20 }] },
    unlocks_action_ids: ["act_cocinar_arrels", "act_ahumar_carn"],
    passive_effect: { type: "grant_material", amount: 2, desc: "+2 Material (la cuina millora el rendiment dels recursos)" },
    is_hidden: false
  },
  {
    id: "bt_guardia_flama", name: "Guàrdia de la Flama",
    inheritanceRate: 0.40,
    universal_prereq: "ut_foc",
    inclination_conditions: { operator: "OR", conditions: [{ axis: "impuls", min: 0.15 }, { axis: "intel·lecte", min: 0.15 }, { axis: "sociabilitat", min: 0.15 }] },
    unlocks_action_ids: ["act_alimentar_foc", "act_torxa_escolta"],
    passive_effect: { type: "grant_health", amount: 5, desc: "+5 Salut (el foc protegeix el campament a la nit)" },
    is_hidden: false
  },
  {
    id: "bt_guariment_plantes", name: "Rituals de la Flama",
    inheritanceRate: 0.45,
    universal_prereq: "ut_foc",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "espiritualitat", min: 0.20 }, { axis: "intel·lecte", min: 0.10 }] },
    unlocks_action_ids: ["act_curar_herbes", "act_preparar_ungüent"],
    passive_effect: { type: "grant_health", amount: 8, desc: "+8 Salut (les infusions amb calor curen ferides i malalties)" },
    is_hidden: false
  },
  {
    id: "bt_adhesius", name: "Adhesius i Emmanegament",
    inheritanceRate: 0.35,
    universal_prereq: "ut_foc",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "intel·lecte", min: 0.20 }, { axis: "impuls", max: 0.20 }] },
    unlocks_action_ids: ["act_destillar_quitra", "act_emmanegar_eines"],
    passive_effect: { type: "grant_material", amount: 2, desc: "+2 Material (les eines compostes duren més)" },
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
    inheritanceRate: 0.40,
    universal_prereq: "ut_art",
    inclination_conditions: { operator: "OR", conditions: [{ axis: "impuls", min: 0.20 }, { axis: "intel·lecte", min: 0.18 }] },
    unlocks_action_ids: ["act_marcar_territori", "act_rastreig_rutes"],
    passive_effect: { type: "unlock_zone", unlocks_zone: "Bosc", desc: "Les marques revelen camins al Bosc" },
    is_hidden: false
  },
  {
    id: "bt_ornaments", name: "Ornaments i Adorn",
    inheritanceRate: 0.35,
    universal_prereq: "ut_art",
    inclination_conditions: { operator: "OR", conditions: [{ axis: "espiritualitat", min: 0.20 }, { axis: "sociabilitat", min: 0.25 }] },
    unlocks_action_ids: ["act_ornamentar_se", "act_consagrar_ornaments", "act_ritual_talisman"],
    passive_effect: { type: "grant_material", amount: 3, desc: "+3 Provisions (els ornaments reforcen la identitat del clan)" },
    is_hidden: false
  },
  {
    id: "bt_narracio_oral", name: "Narració Oral",
    inheritanceRate: 0.50,
    universal_prereq: "ut_art",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "sociabilitat", min: 0.20 }] },
    unlocks_action_ids: ["act_explicar_orígens", "act_cants_grup"],
    passive_effect: { type: "grant_material", amount: 2, desc: "+2 Material (la narració transmet coneixement entre generacions)" },
    is_hidden: false
  },
  // ── La Vestimenta ────────────────────────────────────────────────────────────
  {
    id: "bt_adobament_pells", name: "Adobament de Pells",
    inheritanceRate: 0.40,
    universal_prereq: "ut_vestimenta",
    inclination_conditions: { operator: "OR", conditions: [{ axis: "impuls", min: 0.15 }, { axis: "intel·lecte", min: 0.20 }] },
    unlocks_action_ids: ["act_preparar_cuiro", "act_roba_hivern"],
    passive_effect: { type: "grant_health", amount: 8, desc: "+8 Salut (la roba de cuir protegeix de les ferides i el fred)" },
    is_hidden: false
  },
  {
    id: "bt_pigments_tintures", name: "Pigments i Tintures",
    inheritanceRate: 0.35,
    universal_prereq: "ut_vestimenta",
    inclination_conditions: { operator: "OR", conditions: [{ axis: "espiritualitat", min: 0.18 }, { axis: "sociabilitat", min: 0.18 }] },
    unlocks_action_ids: ["act_decorar_cos", "act_tenyir_pells"],
    passive_effect: { type: "grant_material", amount: 2, desc: "+2 Material (els pigments reforcen la identitat del clan)" },
    is_hidden: false
  },
  // ── La Corda ─────────────────────────────────────────────────────────────────
  {
    id: "bt_arc_fletxes", name: "Arc i Fletxes",
    inheritanceRate: 0.45,
    universal_prereq: "ut_corda",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "impuls", min: 0.20 }, { axis: "intel·lecte", min: 0.10 }] },
    unlocks_action_ids: ["act_caçar_amb_arc", "act_practicar_tir"],
    passive_effect: { type: "bonus_action_output", action_id: "act_espiar_ramat", output_min_bonus: 2, desc: "+2 mínim caça (l'arc permet atacar des de la distància)" },
    is_hidden: false
  },
  {
    id: "bt_coneixement_plantes", name: "Coneixement de Plantes",
    inheritanceRate: 0.45,
    universal_prereq: "ut_corda",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "sociabilitat", min: 0.10 }] },
    unlocks_action_ids: ["act_recollida_bolets", "act_assecament_plantes", "act_trenar_garbell"],
    passive_effect: { type: "bonus_action_output", action_id: "act_recollida_bolets", output_max_bonus: 2, desc: "+2 màxim recollida de bolets (coneixes quins valen la pena)" },
    is_hidden: false
  },
  {
    id: "bt_nusos_sagrats", name: "Nusos Sagrats",
    inheritanceRate: 0.40,
    universal_prereq: "ut_corda",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "espiritualitat", min: 0.15 }, { axis: "sociabilitat", min: 0.15 }] },
    unlocks_action_ids: ["act_ritual_nusos", "act_tela_sagrada"],
    passive_effect: { type: "grant_health", amount: 8, desc: "+8 Salut (els nusos sagrats uneixen el clan i milloren la cohesió)" },
    is_hidden: false
  },
  {
    id: "bt_pesca", name: "Pesca amb Arpó i Xarxa",
    inheritanceRate: 0.45,
    universal_prereq: "ut_corda",
    inclination_conditions: { operator: "OR", conditions: [{ axis: "impuls", min: 0.12 }, { axis: "sociabilitat", min: 0.12 }] },
    unlocks_action_ids: ["act_pescar_riu", "act_xarxa_pesca"],
    passive_effect: { type: "bonus_action_output", action_id: "act_pescar_riu", output_min_bonus: 1, desc: "+1 mínim pesca (coneixes els passos del riu)" },
    is_hidden: false
  },
  {
    id: "bt_calendari_natural", name: "Calendari Natural",
    inheritanceRate: 0.40,
    universal_prereq: "ut_art",
    inclination_conditions: { operator: "OR", conditions: [{ axis: "intel·lecte", min: 0.18 }, { axis: "espiritualitat", min: 0.20 }] },
    unlocks_action_ids: ["act_observar_cel", "act_transit_nocturn"],
    passive_effect: { type: "grant_material", amount: 2, desc: "+2 Provisions (previsió de cicles)" },
    is_hidden: false
  },
  {
    id: "bt_llavor_selectiva", name: "Llavor Selectiva",
    inheritanceRate: 0.35,
    universal_prereq: "ut_ceramica",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "sociabilitat", min: 0.15 }] },
    unlocks_action_ids: ["act_seleccionar_llavors", "act_preparar_terreny", "act_recollectar_garbell"],
    passive_effect: { type: "bonus_action_output", action_id: "act_seleccionar_llavors", output_min_bonus: 2, desc: "+2 mínim selecció de llavors (les millors llavors formen part de la cultura del clan)" },
    is_hidden: false
  },
  {
    id: "bt_domini_terra", name: "Domini de la Terra",
    inheritanceRate: 0.40,
    universal_prereq: "ut_ceramica",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "impuls", min: 0.12 }, { axis: "sociabilitat", min: 0.12 }] },
    unlocks_action_ids: ["act_control_territori", "act_negociar_pastures"],
    passive_effect: { type: "grant_health", amount: 10, desc: "+10 Salut (domini del territori)" },
    is_hidden: false
  },
  {
    id: "bt_intercanvi_troc", name: "Intercanvi i Troc",
    inheritanceRate: 0.45,
    universal_prereq: "ut_ceramica",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "sociabilitat", min: 0.20 }] },
    unlocks_action_ids: ["act_fira_intercanvi", "act_ceramica_regalada"],
    passive_effect: { type: "grant_material", amount: 3, desc: "+3 Material (la ceràmica és moneda d'intercanvi)" },
    is_hidden: false
  },
  {
    id: "bt_terrissa", name: "Terrissa",
    inheritanceRate: 0.35,
    universal_prereq: "ut_ceramica",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "intel·lecte", min: 0.22 }, { axis: "impuls", max: 0.20 }] },
    unlocks_action_ids: ["act_modelar_argila", "act_coure_ceramica"],
    passive_effect: { type: "grant_material", amount: 3, desc: "+3 Material (els vasos conserven el que abans es perdia)" },
    is_hidden: false
  },
  // ── L'Agricultura ────────────────────────────────────────────────────────────
  {
    id: "bt_sembra_collita", name: "Sembra i Collita",
    inheritanceRate: 0.40,
    universal_prereq: "ut_agricultura",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "intel·lecte", min: 0.20 }, { axis: "impuls", max: 0.15 }] },
    unlocks_action_ids: ["act_sembrar_llavors", "act_collita_sistematica"],
    passive_effect: { type: "bonus_action_output", action_id: "act_recollectar_arrels", output_min_bonus: 2, desc: "+2 mínim recol·lecta (la sembra sistemàtica augmenta el rendiment)" },
    is_hidden: false
  },
  {
    id: "bt_domesticacio_animals", name: "Domesticació d'Animals",
    inheritanceRate: 0.40,
    universal_prereq: "ut_agricultura",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "impuls", min: 0.10 }, { axis: "sociabilitat", min: 0.15 }] },
    unlocks_action_ids: ["act_amansar_animal", "act_pasturar_bestiar"],
    passive_effect: { type: "bonus_action_output", action_id: "act_espiar_ramat", output_min_bonus: 2, desc: "+2 mínim caça (els animals domesticats faciliten la caça)" },
    is_hidden: false
  },
  {
    id: "bt_construccio_refugis", name: "Construcció de Refugis",
    inheritanceRate: 0.45,
    universal_prereq: "ut_agricultura",
    inclination_conditions: { operator: "OR", conditions: [{ axis: "intel·lecte", min: 0.20 }, { axis: "impuls", min: 0.20 }] },
    unlocks_action_ids: ["act_edificar_cabana", "act_reforçar_palissada"],
    passive_effect: { type: "grant_health", amount: 12, desc: "+12 Salut (els refugis permanents protegeixen de les inclemències)" },
    is_hidden: false
  },
  {
    id: "bt_ritus_sembra", name: "Ritus de la Sembra",
    inheritanceRate: 0.40,
    universal_prereq: "ut_agricultura",
    inclination_conditions: { operator: "AND", conditions: [{ axis: "espiritualitat", min: 0.25 }, { axis: "sociabilitat", min: 0.15 }] },
    unlocks_action_ids: ["act_ofrena_terra", "act_danses_fertilitat"],
    passive_effect: { type: "grant_material", amount: 3, desc: "+3 Material (els ritus col·lectius enforteixen la cohesió del clan)" },
    is_hidden: false
  }
];

// ─── Requisits d'inclinació per acció ─────────────────────────────────────────
// Les accions BASE de supervivència no tenen requisits (visibles sempre).
// Les accions de branca o pont requereixen cert perfil d'inclinació.
// Format: { [axis]: { min?, max? } }  — totes les condicions son AND.
// Consultat per getActionVisibility() com a fallback si l'acció no té inclination_requirements propi.
const ACTION_INCLINATION_REQUIREMENTS = {
  // ── Vetlla al Foc (universal/foc) — lleu toc espiritual ──
  act_ritual_foc:              { espiritualitat: { min: 0.05 } },

  // ══ CAÇADOR ══════════════════════════════════════════════
  act_forjar_punta:            { impuls: { min: 0.12 } },                              // creació llança
  act_caca_llanca:             { impuls: { min: 0.15 }, sociabilitat: { max: 0.45 } },
  act_emboscada_nocturna:      { impuls: { min: 0.20 }, sociabilitat: { max: 0.30 } },
  act_rastreig_rutes:          { impuls: { min: 0.10 } },
  act_caçar_amb_arc:           { impuls: { min: 0.15 } },
  act_amansar_animal:          { sociabilitat: { min: 0.05 } },     // transició cap a social
  act_pasturar_bestiar:        { impuls: { min: 0.05 } },           // pont caçador/social
  act_control_territori:       { impuls: { min: 0.08 }, sociabilitat: { min: 0.08 } },
  act_aguait_coordinat:        { impuls: { min: 0.10 } },           // upgrade espiar_ramat

  // ══ RECOL·LECTOR ═════════════════════════════════════════
  act_recollir_branques:       { impuls: { max: 0.45 } },                              // base Bosc; Caçador pur (>45%) no recull fibres
  act_trenar_garbell:          { impuls: { max: 0.20 } },                              // creació garbell
  act_recollectar_garbell:     { impuls: { max: 0.25 } },                              // consum garbell
  act_molda_grans:             { impuls: { max: 0.30 } },
  act_parar_trampes:           { impuls: { max: 0.35 } },           // pont recol·lector/caçador
  act_revisar_trampes:         { impuls: { max: 0.35 } },
  act_recollida_bolets:        { impuls: { max: 0.20 } },
  act_assecament_plantes:      { impuls: { max: 0.20 } },
  act_seleccionar_llavors:     { "intel·lecte": { min: 0.08 }, impuls: { max: 0.20 } },
  act_preparar_terreny:        { impuls: { max: 0.25 } },
  act_recollecta_metodica:     { impuls: { max: 0.25 } },           // upgrade recollectar_arrels

  // ══ ARTESÀ ═══════════════════════════════════════════════
  act_treballar_estris:        { "intel·lecte": { min: 0.10 } },                      // consum estri
  act_faonar_eines:            { "intel·lecte": { min: 0.10 } },
  act_gravar_os:               { "intel·lecte": { min: 0.15 } },
  act_intercanviar_eines:      { "intel·lecte": { min: 0.08 } },    // pont artesà/social
  act_cosir_pells:             { "intel·lecte": { min: 0.12 } },
  act_construir_refugi:        { "intel·lecte": { min: 0.08 } },
  act_destillar_quitra:        { "intel·lecte": { min: 0.15 }, impuls: { max: 0.30 } },
  act_emmanegar_eines:         { "intel·lecte": { min: 0.12 } },
  act_coure_ceramica:          { "intel·lecte": { min: 0.15 } },
  act_sembrar_llavors:         { "intel·lecte": { min: 0.12 }, impuls: { max: 0.20 } },
  act_collita_sistematica:     { "intel·lecte": { min: 0.10 } },
  act_talla_avancada:          { "intel·lecte": { min: 0.10 } },    // upgrade tallar_pedra
  act_edificar_cabana:         { "intel·lecte": { min: 0.10 } },

  // ══ MÍSTIC ════════════════════════════════════════════════
  act_crear_talisman:          { espiritualitat: { min: 0.10 }, sociabilitat: { min: 0.08 } }, // creació talisman
  act_ritual_talisman:         { espiritualitat: { min: 0.15 } },                             // consum talisman
  act_curar_herbes:            { espiritualitat: { min: 0.10 } },
  act_pintar_parets:           { espiritualitat: { min: 0.20 }, sociabilitat: { min: 0.10 } },
  act_narrar_llegendes:        { espiritualitat: { min: 0.10 }, sociabilitat: { min: 0.10 } },
  act_ornamentar_se:           { espiritualitat: { min: 0.05 } },   // accessible (pont)
  act_consagrar_ornaments:     { espiritualitat: { min: 0.15 }, sociabilitat: { min: 0.08 } },
  act_transit_nocturn:         { espiritualitat: { min: 0.20 } },
  act_ofrena_eines:            { espiritualitat: { min: 0.12 }, sociabilitat: { min: 0.08 } },
  act_cerimonia_eines:         { espiritualitat: { min: 0.12 }, sociabilitat: { min: 0.10 } },
  act_tallar_flauta:           { "intel·lecte": { min: 0.08 }, espiritualitat: { min: 0.05 } },
  act_musica_vetlla:           { espiritualitat: { min: 0.08 } },
  act_ritual_nusos:            { espiritualitat: { min: 0.10 } },
  act_tela_sagrada:            { espiritualitat: { min: 0.08 } },
  act_ofrena_terra:            { espiritualitat: { min: 0.15 }, sociabilitat: { min: 0.08 } },
  act_danses_fertilitat:       { espiritualitat: { min: 0.12 }, sociabilitat: { min: 0.12 } },
  act_gran_ritual:             { espiritualitat: { min: 0.10 } },   // upgrade ritual_foc

  // ══ PONT / SOCIAL / COMPARTIT ═════════════════════════════
  act_cocinar_arrels:          { impuls: { max: 0.30 } },           // recol·lector/artesà
  act_ahumar_carn:             { impuls: { max: 0.30 } },
  act_torxa_escolta:           { impuls: { min: 0.05 } },
  act_roba_hivern:             { "intel·lecte": { min: 0.05 } },
  act_decorar_cos:             { espiritualitat: { min: 0.05 }, sociabilitat: { min: 0.05 } },
  act_tenyir_pells:            { espiritualitat: { min: 0.05 } },
  act_xarxa_pesca:             { "intel·lecte": { min: 0.05 } },
  act_fira_intercanvi:         { sociabilitat: { min: 0.10 } },
  act_ceramica_regalada:       { sociabilitat: { min: 0.08 } },
  act_negociar_pastures:       { sociabilitat: { min: 0.08 } },
  act_explicar_orígens:        { sociabilitat: { min: 0.10 } },
  act_cants_grup:              { sociabilitat: { min: 0.08 } },
  act_reforçar_palissada:      { impuls: { min: 0.05 } },
  act_defensa_activa:          { sociabilitat: { min: 0.05 } },     // upgrade vigilar_campament
};

// output_resource: "food" (default) | "material" | "health"  — ha de coincidir amb id de RESOURCE_DEFS
// side_effects: array de side-effects [{ resource: 'health'|'food'|..., delta: N }] — s'apliquen genèricament
// stat_key: "forca" | "enginy" | "vincle" — which stat multiplies output + grows on use
// stat_gain: how much the stat grows per execution
// destresa_id/name/threshold: personal skill discovered after N uses of this action
// is_upgrade / upgrades_action_id: substitutory improved action, replaces base when purchased
// minAge / maxAge: character age gates (edat del personatge, no cicle d'era)
const ACTIONS = [
  // BASE
  {
    id: "act_espiar_ramat", name: "Espiar el Ramat", is_base: true, zona: "Planes",
    description: "Segueixes el ramat de prop i tries el moment de caçar. Molt menjar, però hi ha risc de ferides.",
    execute_cost: 0, output_resource: "food", output_min: 3, output_max: 8,
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
    execute_cost: 0, output_resource: "food", output_min: 1, output_max: 3,
    material_min: 2, material_max: 3,
    side_effects: [{ resource: 'branques', delta: +1 }],
    stat_key: "forca", stat_gain: 0.10,
    destresa_id: "d_botanica",
    inclination_deltas: { impuls: -0.02, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.05 },
    event_pool_id: "pool_recollecta"
  },
  {
    id: "act_tallar_pedra", name: "Tallar Pedra", is_base: true, zona: "Campament",
    description: "Talles sílex per fabricar eines bàsiques. Gasta pedra, produeix eines.",
    execute_cost: 0,
    requires: [{ resource: 'pedra', min: 1 }],
    side_effects: [{ resource: 'pedra', delta: -1 }, { resource: 'eina', delta: 1 }],
    material_min: 1, material_max: 2,
    stat_key: "enginy", stat_gain: 0.10,
    destresa_id: "d_talla_silex",
    inclination_deltas: { impuls: -0.03, "intel·lecte": +0.05, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },
  {
    id: "act_ritual_foc", name: "Vetlla al Foc", is_base: false, universal_prereq: "ut_foc", zona: "Campament",
    description: "El clan es reuneix al voltant del foc. El caliu compartit enforteix els llaços i els cants travessen la nit.",
    purchase_cost: 4, execute_cost: 0, side_effects: [{ resource: 'health', delta: +5 }],
    stat_key: "vincle", stat_gain: 0.12,
    destresa_id: "d_custodi_foc",
    inclination_deltas: { impuls: 0, "intel·lecte": -0.01, espiritualitat: +0.02, sociabilitat: +0.06 },
    event_pool_id: "pool_ritual"
  },
  {
    id: "act_contemplacio", name: "Contemplació", is_base: true, zona: "Campament",
    description: "T'asseus en silenci i observes el món. La quietud obre la ment a allò invisible.",
    execute_cost: 0, output_resource: "health", output_min: 3, output_max: 6,
    stat_key: "vincle", stat_gain: 0.05,
    inclination_deltas: { impuls: -0.02, "intel·lecte": 0, espiritualitat: +0.08, sociabilitat: +0.04 },
    event_pool_id: "pool_ritual"
  },
  {
    id: "act_vigilar_campament", name: "Vigilar el Campament", is_base: true, zona: "Campament",
    description: "Protegeixes el campament i observes els voltants. Responsabilitat compartida.",
    execute_cost: 0, output_resource: "health", output_min: 2, output_max: 4,
    stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: +0.03, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.04 },
    event_pool_id: "pool_social"
  },
  {
    id: "act_explorar_voltants", name: "Explorar els Voltants", is_base: true, zona: "Planes",
    description: "T'aventures més lluny del campament. Cada intent augmenta la probabilitat de descobrir zones noves.",
    execute_cost: 1,
    character_effect: { type: 'explore_zone' },
    material_min: 2, material_max: 4,
    inclination_deltas: { impuls: +0.04, "intel·lecte": -0.02, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: null
  },
  {
    id: "act_recollectar_pedra", name: "Recollir Pedra", is_base: true, zona: "Planes",
    description: "Recolliu sílex i pedra calcària per als vostres estris. La pedra és el fonament de tot.",
    execute_cost: 0, output_resource: "pedra", output_min: 1, output_max: 3,
    material_min: 1, material_max: 2,
    stat_key: "forca", stat_gain: 0.05,
    inclination_deltas: { impuls: +0.01, "intel·lecte": +0.02, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: null
  },
  {
    id: "act_recollir_branques", name: "Recollir Fibres", is_base: true, zona: "Bosc",
    description: "Al bosc trobes escorces, branques flexibles i fibres que al camp escassegen. La base de tot cordill, mànec i cistell.",
    execute_cost: 0, output_resource: "branques", output_min: 2, output_max: 4,
    material_min: 1, material_max: 2,
    stat_key: "enginy", stat_gain: 0.05,
    inclination_deltas: { impuls: -0.02, "intel·lecte": +0.02, espiritualitat: 0, sociabilitat: +0.02 },
    event_pool_id: "pool_recollecta"
  },
  {
    id: "act_preparar_eina", name: "Preparar una Eina", is_base: true, universal_prereq: "ut_eines", zona: "Campament",
    description: "Treballes la pedra amb precisió per crear una eina útil. Si l'enginy és baix, la pedra pot trencar-se.",
    execute_cost: 0,
    requires: [{ resource: 'pedra', min: 1 }],
    character_effect: { type: 'make_tool', pedra_cost: 1 },
    material_min: 1, material_max: 2,
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: -0.02, "intel·lecte": +0.05, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
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
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
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
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_social"
  },
  {
    id: "act_ensenyar", name: "Ensenyar el Fill", is_base: true, zona: "Llar",
    description: "Passes temps transmetent al fill un dels teus aprenentatges. El fill el rebrà en nàixer.",
    always_show_locked: true,
    minAge: 8,
    requires: [{ state: 'fills', min: 1 }, { state: 'ensenyat', max: 0 }, { type: 'has_any_aprenentatge' }],
    character_effect: { type: 'delta', state: 'ensenyat', delta: 1 },
    material_min: 1, material_max: 2,
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
    requires: [{ resource: 'eina', min: 1 }],
    purchase_cost: 4, execute_cost: 0, output_resource: "food", output_min: 5, output_max: 12, side_effects: [{ resource: 'health', delta: -7 }, { resource: 'eina', delta: -1 }],
    stat_key: "forca", stat_gain: 0.20,
    inclination_deltas: { impuls: +0.08, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca"
  },
  {
    id: "act_emboscada_nocturna", name: "Emboscada Nocturna", is_base: false, zona: "Planes",
    description: "La foscor és el teu aliat. Atacs per sorpresa quan la presa dorm. Molt perillós però molt rendible.",
    maxAge: 12,
    purchase_cost: 5, execute_cost: 0, output_resource: "food", output_min: 10, output_max: 16, side_effects: [{ resource: 'health', delta: -14 }],
    stat_key: "forca", stat_gain: 0.20,
    inclination_deltas: { impuls: +0.10, "intel·lecte": 0, espiritualitat: 0, sociabilitat: -0.08 },
    event_pool_id: "pool_caca"
  },

  // HUNTER branch — bt_punta_llanca (creació llança)
  {
    id: "act_forjar_punta", name: "Forjar Punta de Llança", is_base: false, zona: "Campament",
    description: "Troceges el sílex fins que la punta queda lleugera i esmolada. La llança que fabriques és més mortal que la que trobes.",
    purchase_cost: 3, execute_cost: 0,
    requires: [{ resource: 'pedra', min: 2 }, { resource: 'branques', min: 1 }],
    output_resource: "eina", output_min: 2, output_max: 3,
    side_effects: [{ resource: 'pedra', delta: -2 }, { resource: 'branques', delta: -1 }],
    material_min: 1, material_max: 2,
    stat_key: "forca", stat_gain: 0.15,
    inclination_deltas: { impuls: +0.05, "intel·lecte": +0.03, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },

  // HUNTER branch — bt_marques_territori
  {
    id: "act_marcar_territori", name: "Marcar Territori", is_base: false, zona: "Planes",
    description: "Senyals als arbres i roques que indiquen que aquest territori és del teu clan.",
    purchase_cost: 3, execute_cost: 0, output_resource: "food", output_min: 1, output_max: 3, side_effects: [{ resource: 'health', delta: -3 }],
    stat_key: "forca", stat_gain: 0.15,
    inclination_deltas: { impuls: +0.05, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_social"
  },
  {
    id: "act_rastreig_rutes", name: "Rastreig de Rutes", is_base: false, zona: "Bosc",
    description: "Segueixes les pistes dels animals per aprendre els seus camins. Coneixement que es converteix en provisions.",
    purchase_cost: 3, execute_cost: 0, output_resource: "food", output_min: 3, output_max: 6,
    stat_key: "forca", stat_gain: 0.15,
    inclination_deltas: { impuls: +0.03, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca"
  },

  // GATHERER branch — bt_rasclador_fi
  {
    id: "act_molda_grans", name: "Mòlta de Grans", is_base: false, zona: "Campament",
    description: "Raspes grans silvestres amb el raspador fi per obtenir farina primitiva. Estable i nutritiu.",
    purchase_cost: 3, execute_cost: 0, output_resource: "food", output_min: 3, output_max: 7,
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: -0.01, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.03 },
    event_pool_id: "pool_recollecta"
  },

  // GATHERER branch — bt_coneixement_plantes (creació garbell)
  {
    id: "act_trenar_garbell", name: "Trenar un Garbell", is_base: false, zona: "Campament",
    description: "Entrellaçes fibres vegetals i una vora de pedra fins a crear un tamís. La bona llavor es separa sola de la terra i la palla.",
    purchase_cost: 3, execute_cost: 0,
    requires: [{ resource: 'branques', min: 2 }, { resource: 'pedra', min: 1 }],
    output_resource: "eina", output_min: 1, output_max: 2,
    side_effects: [{ resource: 'branques', delta: -2 }, { resource: 'pedra', delta: -1 }],
    material_min: 1, material_max: 2,
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.04, espiritualitat: +0.02, sociabilitat: 0 },
    event_pool_id: "pool_recollecta"
  },

  // GATHERER branch — bt_trampes
  {
    id: "act_parar_trampes", name: "Parar Trampes", is_base: false, zona: "Planes",
    description: "Col·loques llaços i trampes en llocs de pas. La caça passiva allibera temps per a altres tasques.",
    purchase_cost: 3, execute_cost: 0, output_resource: "food", output_min: 2, output_max: 6,
    requires: [{ resource: 'material', min: 1 }], side_effects: [{ resource: 'material', delta: -1 }],
    stat_key: "forca", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.03 },
    event_pool_id: "pool_caca"
  },
  {
    id: "act_revisar_trampes", name: "Revisar les Trampes", is_base: false, zona: "Bosc",
    description: "Fas la ronda matinal per les trampes. Algunes han funcionat. Una t'ha agafat el dit.",
    purchase_cost: 3, execute_cost: 0, output_resource: "food", output_min: 1, output_max: 4, side_effects: [{ resource: 'health', delta: -3 }],
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: -0.01, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.03 },
    event_pool_id: "pool_caca"
  },

  // GATHERER branch — bt_llavor_selectiva (consum garbell → menjar millorat)
  {
    id: "act_recollectar_garbell", name: "Recol·lectar amb Garbell", is_base: false, zona: "Planes",
    description: "El garbell separa les llavors bones de la terra i la palla. Treballes el doble de ràpid i els resultats es veuen.",
    purchase_cost: 3, execute_cost: 0,
    requires: [{ resource: 'eina', min: 1 }],
    output_resource: "food", output_min: 4, output_max: 8,
    side_effects: [{ resource: 'eina', delta: -1 }],
    material_min: 1, material_max: 2,
    stat_key: "forca", stat_gain: 0.10,
    inclination_deltas: { impuls: -0.02, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.04 },
    event_pool_id: "pool_recollecta"
  },

  // GATHERER branch — bt_coneixement_plantes
  {
    id: "act_recollida_bolets", name: "Recollida de Bolets", is_base: false, zona: "Bosc",
    description: "Coneixes quins bolets del bosc són comestibles i quins cal evitar. Provisions i salut.",
    purchase_cost: 3, execute_cost: 0, output_resource: "food", output_min: 2, output_max: 5, side_effects: [{ resource: 'health', delta: +5 }, { resource: 'branques', delta: +1 }],
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.03 },
    event_pool_id: "pool_recollecta"
  },
  {
    id: "act_assecament_plantes", name: "Assecament de Plantes", is_base: false, zona: "Campament",
    description: "Asseques les plantes recol·lectades per conservar-les. Reserves que aguanten setmanes.",
    purchase_cost: 3, execute_cost: 0, output_resource: "food", output_min: 1, output_max: 3,
    side_effects: [{ resource: 'material', delta: -1 }],
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: -0.01, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.03 },
    event_pool_id: "pool_recollecta"
  },

  // GATHERER branch — bt_llavor_selectiva
  {
    id: "act_seleccionar_llavors", name: "Seleccionar Llavors", is_base: false, zona: "Campament",
    description: "Tries les millors llavors de la collita. Les plantes del proper cicle donaran més.",
    purchase_cost: 4, execute_cost: 0, output_resource: "food", output_min: 3, output_max: 6,
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: -0.01, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.03 },
    event_pool_id: "pool_recollecta"
  },
  {
    id: "act_preparar_terreny", name: "Preparar el Terreny", is_base: false, zona: "Planes",
    description: "Neteges una petita parcel·la de pedres i males herbes. El terra nu et sembla prometedor.",
    purchase_cost: 4, execute_cost: 0, output_resource: "food", output_min: 2, output_max: 4, side_effects: [{ resource: 'health', delta: -5 }],
    stat_key: "forca", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.04 },
    event_pool_id: "pool_recollecta"
  },

  // CRAFTSMAN branch — bt_rasclador_fi
  {
    id: "act_faonar_eines", name: "Façonar Estris", is_base: false, zona: "Campament",
    description: "Treballes el sílex fins a donar-li la forma exacta que cal. Els estris precisos fan possible el que les mans soles no podrien.",
    purchase_cost: 3, execute_cost: 0,
    requires: [{ resource: 'pedra', min: 2 }, { resource: 'branques', min: 1 }],
    output_resource: "eina", output_min: 2, output_max: 3,
    side_effects: [{ resource: 'pedra', delta: -2 }, { resource: 'branques', delta: -1 }],
    material_min: 1, material_max: 2,
    stat_key: "enginy", stat_gain: 0.15,
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
    purchase_cost: 3, execute_cost: 0, output_resource: "food", output_min: 2, output_max: 4,
    requires: [{ resource: 'eina', min: 1 }], side_effects: [{ resource: 'eina', delta: -1 }],
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
    purchase_cost: 4, execute_cost: 0, output_resource: "health", output_min: 4, output_max: 8,
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
    description: "Recorres els marges del bosc collint resines, escorces i fibres que coneixes una a una. En tornes carregat de matèria que pocs sabrien trobar: la base de tot ungüent —i de tota corda i mànec.",
    purchase_cost: 3, execute_cost: 0, output_resource: "branques", output_min: 2, output_max: 3,
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.03, espiritualitat: +0.03, sociabilitat: 0 },
    event_pool_id: "pool_ritual"
  },

  // MYSTIC branch — bt_pintura_rupestre
  {
    id: "act_pintar_parets", name: "Pintar les Parets", is_base: false, zona: "Bosc",
    description: "Cerques els jaciments d'ocre i manganès que només tu reconeixes, i en mols els minerals fins a fer pols de color. Les visions queden fixades a la roca —i a la teva bossa, la pedra que no has gastat.",
    purchase_cost: 4, execute_cost: 0, output_resource: "pedra", output_min: 2, output_max: 3,
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.03, espiritualitat: +0.05, sociabilitat: 0 },
    event_pool_id: "pool_ritual"
  },
  {
    id: "act_narrar_llegendes", name: "Narrar les Llegendes", is_base: false, zona: "Campament",
    description: "La veu pren força davant del foc. Dins de cada llegenda hi ha un mapa: on beure a l'estiu, quin arbust dona cordell, on creix la fibra que no es trenca. El clan escolta, i demà surt a trobar-la.",
    purchase_cost: 3, execute_cost: 0, output_resource: "branques", output_min: 2, output_max: 3,
    material_min: 1, material_max: 2,
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.05, sociabilitat: +0.05 },
    event_pool_id: "pool_social"
  },

  // MYSTIC branch — bt_ornaments (consum talisman → salut alta)
  {
    id: "act_ritual_talisman", name: "Ritual del Talisman", is_base: false, zona: "Campament",
    description: "Cremes encens i entones les paraules antigues mentre el talisman s'escalfa al foc. La protecció que ofereix és real i immediata.",
    purchase_cost: 4, execute_cost: 0,
    requires: [{ resource: 'eina', min: 1 }],
    output_resource: "health", output_min: 8, output_max: 14,
    side_effects: [{ resource: 'eina', delta: -1 }],
    material_min: 1, material_max: 2,
    stat_key: "vincle", stat_gain: 0.20,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.08, sociabilitat: +0.03 },
    event_pool_id: "pool_ritual"
  },

  // MYSTIC branch — bt_ornaments
  {
    id: "act_ornamentar_se", name: "Ornamentar-se", is_base: false, zona: "Campament",
    description: "El ritual de preparar-se i posar-se les marques t'ancora. El grup et mira diferent i tu et sents diferent.",
    purchase_cost: 3, execute_cost: 0, output_resource: "health", output_min: 2, output_max: 4,
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.02, sociabilitat: +0.02 },
    event_pool_id: "pool_social"
  },
  {
    id: "act_consagrar_ornaments", name: "Consagrar Ornaments", is_base: false, zona: "Campament",
    description: "Passes la nit amb les peces al costat del foc, entonant pregàries. Quan surt el sol, els ornaments porten la protecció dels avantpassats.",
    purchase_cost: 4, execute_cost: 0, output_resource: "health", output_min: 5, output_max: 9,
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.05, sociabilitat: +0.03 },
    event_pool_id: "pool_ritual"
  },

  // MYSTIC branch — bt_calendari_natural
  {
    id: "act_observar_cel", name: "Observar el Cel Nocturn", is_base: false, zona: "Planes",
    description: "Nit rere nit fixes la marxa dels astres en la memòria. Quan la lluna i les estrelles s'alineen com aquell any, ho saps: és el dia que baixa el salmó, que cau el fruit, que passa la manada. El cel et diu quan menjar.",
    purchase_cost: 3, execute_cost: 0, output_resource: "food", output_min: 4, output_max: 7,
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.04, espiritualitat: +0.04, sociabilitat: 0 },
    event_pool_id: "pool_ritual"
  },
  {
    id: "act_transit_nocturn", name: "Trànsit Nocturn", is_base: false, zona: "Bosc",
    description: "Surts a la nit guiat pels astres, on els altres no gosen. El fred, la por i l'esgotament són reals —però qui supera l'ordalia torna amb la presa que la foscor amagava. El cos paga, el clan menja.",
    purchase_cost: 4, execute_cost: 0, output_resource: "food", output_min: 6, output_max: 12, side_effects: [{ resource: 'health', delta: -5 }],
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: +0.06, "intel·lecte": 0, espiritualitat: +0.08, sociabilitat: 0 },
    event_pool_id: "pool_caca"
  },

  // SHARED — bt_domini_terra
  {
    id: "act_control_territori", name: "Control del Territori", is_base: false, zona: "Planes",
    description: "Coordines el clan per controlar les zones de caça i recol·lecció. El territori és vostre.",
    minAge: 8,
    purchase_cost: 5, execute_cost: 0, output_resource: "food", output_min: 3, output_max: 7, side_effects: [{ resource: 'health', delta: -5 }],
    stat_key: "forca", stat_gain: 0.15,
    inclination_deltas: { impuls: +0.02, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.02 },
    event_pool_id: "pool_social"
  },
  {
    id: "act_negociar_pastures", name: "Negociar les Pastures", is_base: false, zona: "Planes",
    description: "Trobes els rastres d'un altre grup a les teves zones. T'aproximes amb gestos oberts. Acabeu repartint el territori.",
    purchase_cost: 5, execute_cost: 0, output_resource: "food", output_min: 3, output_max: 6, side_effects: [{ resource: 'health', delta: +3 }],
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.03 },
    event_pool_id: "pool_social"
  },

  // ── bt_cuina_conservacio (El Foc — Recol·lector/Artesà) ─────────────────────
  {
    id: "act_cocinar_arrels", name: "Cuinar Arrels", is_base: false, zona: "Campament",
    description: "Coues arrels i tubercles al foc fins que es tornen tous i digeribles. El foc multiplica el valor dels aliments.",
    purchase_cost: 3, execute_cost: 0, output_resource: "food", output_min: 3, output_max: 6,
    stat_key: "enginy", stat_gain: 0.10,
    inclination_deltas: { impuls: -0.01, "intel·lecte": +0.02, espiritualitat: 0, sociabilitat: +0.02 },
    event_pool_id: "pool_recollecta"
  },
  {
    id: "act_ahumar_carn", name: "Ahumar Carn", is_base: false, zona: "Campament",
    description: "Pengeu la carn sobre el fum del foc durant hores. La carn fumada dura dies i els guanya temps.",
    purchase_cost: 4, execute_cost: 1, output_resource: "food", output_min: 4, output_max: 8,
    requires: [{ resource: 'food', min: 2 }],
    stat_key: "enginy", stat_gain: 0.10,
    inclination_deltas: { impuls: -0.02, "intel·lecte": +0.03, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },
  {
    id: "act_assecar_provisions", name: "Assecar Provisions", is_base: false, zona: "Campament",
    description: "Poses a assecar carn i arrels sobre la calor del foc. Les provisions aguanten molt més temps: el magatzem s'amplia en +2.",
    universal_prereq: "ut_foc",
    purchase_cost: 5, execute_cost: 0,
    food_cap_delta: 2, max_executions: 3,
    material_min: 1, material_max: 2,
    stat_key: "enginy", stat_gain: 0.08,
    inclination_deltas: { impuls: -0.01, "intel·lecte": +0.02, espiritualitat: +0.01, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },
  // CRAFTSMAN branch — bt_rasclador_fi (consum estri → menjar)
  {
    id: "act_treballar_estris", name: "Treballar amb Estris", is_base: false, zona: "Campament",
    description: "Amb els estris adequats, el procés de conservació és més precís. Les provisions rinden molt més del que esperaves.",
    purchase_cost: 4, execute_cost: 0,
    requires: [{ resource: 'eina', min: 1 }],
    output_resource: "food", output_min: 4, output_max: 8,
    side_effects: [{ resource: 'eina', delta: -1 }],
    material_min: 1, material_max: 2,
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: -0.02, "intel·lecte": +0.04, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },

  // ── bt_adhesius (El Foc — Artesà) ────────────────────────────────────────────
  {
    id: "act_destillar_quitra", name: "Destil·lar Quitrà", is_base: false, zona: "Campament",
    description: "Cous escorça de bedoll sota brases tapades fins que en regalima una pasta negra i enganxosa. El que s'enganxa, no es perd.",
    purchase_cost: 4, execute_cost: 0, material_min: 2, material_max: 4,
    side_effects: [{ resource: 'health', delta: -2 }],
    stat_key: "enginy", stat_gain: 0.20,
    inclination_deltas: { impuls: -0.02, "intel·lecte": +0.05, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },
  {
    id: "act_emmanegar_eines", name: "Emmanegar Eines", is_base: false, zona: "Campament",
    description: "Fixes una fulla de sílex a un mànec de fusta amb quitrà i tendons. L'eina composta multiplica la força de la mà.",
    purchase_cost: 4, execute_cost: 0,
    requires: [{ resource: 'pedra', min: 1 }],
    character_effect: { type: 'make_tool', pedra_cost: 1 },
    material_min: 2, material_max: 3,
    stat_key: "enginy", stat_gain: 0.20,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.05, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },
  // ── bt_guardia_flama (El Foc — Caçador/Artesà/Recol·lector/Místic) ──────────
  {
    id: "act_alimentar_foc", name: "Alimentar el Foc", is_base: false, zona: "Campament",
    description: "Mantens el foc viu tota la nit amb fusta seca i cendra. El campament dorm segur i sa.",
    purchase_cost: 3, execute_cost: 0, output_resource: "health", output_min: 3, output_max: 5,
    side_effects: [{ resource: 'material', delta: -1 }],
    stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.03, sociabilitat: +0.03 },
    event_pool_id: "pool_ritual"
  },
  {
    id: "act_torxa_escolta", name: "Torxa d'Escolta", is_base: false, zona: "Campament",
    description: "Fabriques una torxa i recorres el perímetre del campament a la nit. La foscor no és del clan, és del que l'amenaça.",
    purchase_cost: 3, execute_cost: 0, output_resource: "health", output_min: 2, output_max: 5,
    requires: [{ resource: 'material', min: 1 }], side_effects: [{ resource: "health", delta: -3 }, { resource: 'material', delta: -1 }],
    stat_key: "forca", stat_gain: 0.10,
    inclination_deltas: { impuls: +0.04, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.02 },
    event_pool_id: "pool_social"
  },
  // ── bt_adobament_pells (La Vestimenta — Caçador/Artesà/Recol·lector) ─────────
  {
    id: "act_preparar_cuiro", name: "Preparar Cuiro", is_base: false, zona: "Campament",
    description: "Estires i asseques la pell fins que queda rígida i dura. Material resistent per a roba i estris.",
    purchase_cost: 3, execute_cost: 0, material_min: 2, material_max: 4,
    stat_key: "forca", stat_gain: 0.10,
    inclination_deltas: { impuls: +0.02, "intel·lecte": +0.05, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },
  {
    id: "act_roba_hivern", name: "Roba d'Hivern", is_base: false, zona: "Campament",
    description: "Cousis diverses pells adobades formant una capa gruixuda. El fred ja no penetra com abir.",
    purchase_cost: 4, execute_cost: 0, output_resource: "health", output_min: 4, output_max: 8,
    requires: [{ resource: 'material', min: 2 }], side_effects: [{ resource: 'material', delta: -2 }],
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: -0.02, "intel·lecte": +0.03, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },
  // ── bt_pigments_tintures (La Vestimenta — Místic) ────────────────────────────
  {
    id: "act_decorar_cos", name: "Decorar el Cos", is_base: false, zona: "Campament",
    description: "Abans de la cerimònia recorres el bosc collint les fibres, escorces i tintures que el ritual demana. Les mans se't tenyeixen, i en tornes amb un feix de matèria viva: la decoració comença molt abans del foc.",
    purchase_cost: 3, execute_cost: 0, output_resource: "branques", output_min: 2, output_max: 3,
    stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: -0.02, "intel·lecte": -0.02, espiritualitat: +0.04, sociabilitat: +0.04 },
    event_pool_id: "pool_social"
  },
  {
    id: "act_tenyir_pells", name: "Tenyir Pells", is_base: false, zona: "Campament",
    description: "Immergeixes les pells en una solució de plantes i argila fins que agafen color. Símbol d'identitat del clan.",
    purchase_cost: 3, execute_cost: 0, material_min: 1, material_max: 3,
    stat_key: "enginy", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.02, espiritualitat: +0.03, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },
  // ── bt_arc_fletxes (La Corda — Caçador/Artesà) ───────────────────────────────
  {
    id: "act_caçar_amb_arc", name: "Caçar amb Arc", is_base: false, zona: "Planes",
    description: "L'arc permet atacar des de la distància segura. La presa no pot fugir del que no ha vist venir.",
    purchase_cost: 4, execute_cost: 0, output_resource: "food", output_min: 4, output_max: 9,
    side_effects: [{ resource: "health", delta: -4 }],
    stat_key: "forca", stat_gain: 0.20,
    inclination_deltas: { impuls: +0.06, "intel·lecte": +0.02, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca"
  },
  {
    id: "act_practicar_tir", name: "Practicar el Tir", is_base: false, zona: "Planes",
    description: "Practiques la tècnica de tir fins que el moviment es torna automàtic. La repetició és el mestre invisible.",
    purchase_cost: 3, execute_cost: 0, material_min: 1, material_max: 2,
    stat_key: "enginy", stat_gain: 0.20,
    inclination_deltas: { impuls: +0.05, "intel·lecte": +0.03, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },
  // ── bt_narracio_oral (L'Art — Místic/social) ─────────────────────────────────
  {
    id: "act_explicar_orígens", name: "Explicar els Orígens", is_base: false, zona: "Campament",
    description: "Expliques com va néixer el clan, d'on vénen i per qué fan el que fan. El grup escolta en silenci.",
    purchase_cost: 3, execute_cost: 0, side_effects: [{ resource: "health", delta: +3 }],
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.02, espiritualitat: +0.03, sociabilitat: +0.04 },
    event_pool_id: "pool_social"
  },
  {
    id: "act_cants_grup", name: "Cants de Grup", is_base: false, zona: "Campament",
    description: "La veu compartida tanca les nafres que el silenci deixa obertes. Qui canta amb el clan no carrega sol: la fatiga i la por es dissolen en el ritme col·lectiu.",
    purchase_cost: 3, execute_cost: 0, output_resource: "health", output_min: 3, output_max: 5,
    stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.04, sociabilitat: +0.05 },
    event_pool_id: "pool_ritual"
  },
  // MYSTIC branch — bt_eines_cerimonials (creació talisman)
  {
    id: "act_crear_talisman", name: "Tallar un Talisman", is_base: false, zona: "Campament",
    description: "Passes hores gravant símbols en una pedra plana. Fibres i pedra s'uneixen en un objecte que el clan reconeix com a protecció.",
    purchase_cost: 3, execute_cost: 0,
    requires: [{ resource: 'branques', min: 2 }, { resource: 'pedra', min: 1 }],
    output_resource: "eina", output_min: 1, output_max: 1,
    side_effects: [{ resource: 'branques', delta: -2 }, { resource: 'pedra', delta: -1 }],
    material_min: 1, material_max: 2,
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.03, espiritualitat: +0.06, sociabilitat: +0.02 },
    event_pool_id: "pool_ritual"
  },

  // ── bt_eines_cerimonials (Les Eines — Místic) ────────────────────────────────
  {
    id: "act_ofrena_eines", name: "Ofrena d'Eines", is_base: false, zona: "Campament",
    description: "Ofreneu eines de sílex al foc com a ofrena als esperits de la terra. El que es dóna torna multiplicat.",
    purchase_cost: 3, execute_cost: 0, requires: [{ resource: 'pedra', min: 1 }],
    side_effects: [{ resource: "health", delta: +5 }, { resource: "pedra", delta: -1 }],
    stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.05, sociabilitat: +0.03 },
    event_pool_id: "pool_ritual"
  },
  {
    id: "act_cerimonia_eines", name: "Cerimònia de les Eines", is_base: false, zona: "Campament",
    description: "Celebres una cerimònia col·lectiva on les eines passen de mà en mà. Cada nus de coneixement reforça el clan.",
    purchase_cost: 4, execute_cost: 0, side_effects: [{ resource: "health", delta: +3 }],
    stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.04, sociabilitat: +0.05 },
    event_pool_id: "pool_ritual"
  },
  // ── bt_musica_os (Les Eines — pont Artesà/Místic) ────────────────────────────
  {
    id: "act_tallar_flauta", name: "Tallar una Flauta d'Os", is_base: false, zona: "Campament",
    description: "Forades un os d'ala de voltor amb el burí, forat a forat. Quan hi bufes, en surt una veu que no és de ningú.",
    purchase_cost: 4, execute_cost: 0, material_min: 1, material_max: 2,
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.03, espiritualitat: +0.03, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },
  {
    id: "act_musica_vetlla", name: "Música a la Vetlla", is_base: false, zona: "Campament",
    description: "Toques la flauta quan el campament es recull. Els infants s'adormen abans i els vells parlen més fluix.",
    purchase_cost: 3, execute_cost: 0, output_resource: "health", output_min: 3, output_max: 5,
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: -0.02, "intel·lecte": 0, espiritualitat: +0.03, sociabilitat: +0.04 },
    event_pool_id: "pool_ritual"
  },
  // ── bt_nusos_sagrats (La Corda — Místic) ─────────────────────────────────────
  {
    id: "act_ritual_nusos", name: "Ritual dels Nusos", is_base: false, zona: "Campament",
    description: "Fas nusos específics en presència del clan. Cada nus és un vincle invisible entre el passat i el futur.",
    purchase_cost: 3, execute_cost: 0, side_effects: [{ resource: "health", delta: +5 }],
    stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.05, sociabilitat: +0.04 },
    event_pool_id: "pool_ritual"
  },
  {
    id: "act_tela_sagrada", name: "Tela Sagrada", is_base: false, zona: "Campament",
    description: "Treballes fils i fibres en patrons complexos que el clan reconeix com a símbols de protecció.",
    purchase_cost: 3, execute_cost: 0, material_min: 1, material_max: 3,
    stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.04, sociabilitat: +0.03 },
    event_pool_id: "pool_ritual"
  },
  // ── bt_pesca (La Corda — pont Caçador/Recol·lector) ──────────────────────────
  {
    id: "act_pescar_riu", name: "Pescar al Riu", is_base: false, zona: "Bosc",
    description: "T'esperes immòbil al gual amb l'arpó alçat. El riu dona menjar sense exigir sang a canvi.",
    purchase_cost: 3, execute_cost: 0, output_resource: "food", output_min: 3, output_max: 6,
    stat_key: "forca", stat_gain: 0.10,
    inclination_deltas: { impuls: +0.02, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.02 },
    event_pool_id: "pool_caca"
  },
  {
    id: "act_xarxa_pesca", name: "Calar la Xarxa", is_base: false, zona: "Bosc",
    description: "Cales la xarxa de fibra entre dues roques del riu i tornes l'endemà. La corda treballa mentre dorms.",
    purchase_cost: 5, execute_cost: 1, output_resource: "food", output_min: 4, output_max: 9,
    side_effects: [{ resource: 'health', delta: -2 }],
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: +0.01, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.04 },
    event_pool_id: "pool_caca"
  },
  // ── bt_intercanvi_troc (La Ceràmica — Místic/social) ─────────────────────────
  {
    id: "act_fira_intercanvi", name: "Fira d'Intercanvi", is_base: false, zona: "Planes",
    description: "Organitzes una trobada on diversos clans intercanvien ceràmica, pells i provisions. Tothom torna amb alguna cosa.",
    purchase_cost: 4, execute_cost: 1, material_min: 3, material_max: 6,
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.06 },
    event_pool_id: "pool_social"
  },
  {
    id: "act_ceramica_regalada", name: "Ceràmica Regalada", is_base: false, zona: "Planes",
    description: "Offereixes una peça de ceràmica decorada a un grup veí com a gest d'aliança. La bellesa és la primera moneda.",
    purchase_cost: 3, execute_cost: 0, output_resource: "food", output_min: 2, output_max: 4,
    side_effects: [{ resource: "material", delta: -1 }],
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.02, sociabilitat: +0.05 },
    event_pool_id: "pool_social"
  },
  // ── bt_terrissa (La Ceràmica — Artesà) ───────────────────────────────────────
  {
    id: "act_modelar_argila", name: "Modelar Argila", is_base: false, zona: "Campament",
    description: "Pastes argila humida i en surten formes: una dona, un bisó, un ós. Quan passen pel foc, es tornen pedra.",
    purchase_cost: 4, execute_cost: 0, material_min: 2, material_max: 4,
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.04, espiritualitat: +0.02, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },
  {
    id: "act_coure_ceramica", name: "Coure Vasos d'Argila", is_base: false, zona: "Campament",
    description: "Cous els vasos a la fossa del foc tota la nit. El que abans es feia malbé ara espera, tranquil, dins l'argila.",
    purchase_cost: 5, execute_cost: 0, output_resource: "food", output_min: 2, output_max: 4,
    material_min: 0, material_max: 0,
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: -0.02, "intel·lecte": +0.04, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },
  // ── bt_sembra_collita (L'Agricultura — Artesà/Recol·lector) ──────────────────
  {
    id: "act_sembrar_llavors", name: "Sembrar Llavors", is_base: false, zona: "Planes",
    description: "Plantes llavors seleccionades en la parcel·la preparada. Un gest petit que canviarà el món.",
    purchase_cost: 4, execute_cost: 1, output_resource: "food", output_min: 3, output_max: 7,
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: -0.02, "intel·lecte": +0.04, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_recollecta"
  },
  {
    id: "act_collita_sistematica", name: "Collita Sistemàtica", is_base: false, zona: "Planes",
    description: "Colles la parcel·la amb ordre, reserves una part per sembrar i distribueixes la resta al clan.",
    purchase_cost: 5, execute_cost: 0, output_resource: "food", output_min: 5, output_max: 9,
    stat_key: "forca", stat_gain: 0.10,
    inclination_deltas: { impuls: -0.01, "intel·lecte": +0.03, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_recollecta"
  },
  // ── bt_domesticacio_animals (L'Agricultura — Caçador/social) ─────────────────
  {
    id: "act_amansar_animal", name: "Amansar un Animal", is_base: false, zona: "Planes",
    description: "Dediques temps a guanyar-te la confiança d'un animal jove. La paciència és la teva arma.",
    purchase_cost: 4, execute_cost: 2, output_resource: "food", output_min: 2, output_max: 5,
    side_effects: [{ resource: "health", delta: -2 }],
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: -0.02, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.04 },
    event_pool_id: "pool_caca"
  },
  {
    id: "act_pasturar_bestiar", name: "Pasturar el Bestiar", is_base: false, zona: "Planes",
    description: "Cuides i condueixes el bestiar domesticat cap a bons prats. Els animals confiats donen més.",
    purchase_cost: 3, execute_cost: 0, output_resource: "food", output_min: 3, output_max: 7,
    stat_key: "forca", stat_gain: 0.10,
    inclination_deltas: { impuls: +0.02, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.03 },
    event_pool_id: "pool_caca"
  },
  // ── bt_construccio_refugis (L'Agricultura — Artesà/Caçador) ──────────────────
  {
    id: "act_edificar_cabana", name: "Edificar una Cabana", is_base: false, zona: "Campament",
    description: "Construeixes una cabana de pals i fulles per al clan. Quatre parets que valen per totes les nits que vindran.",
    purchase_cost: 5, execute_cost: 0, output_resource: "health", output_min: 5, output_max: 10,
    requires: [{ resource: 'material', min: 2 }], side_effects: [{ resource: 'material', delta: -2 }],
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.05, espiritualitat: 0, sociabilitat: +0.02 },
    event_pool_id: "pool_artesania"
  },
  {
    id: "act_reforçar_palissada", name: "Reforçar la Palissada", is_base: false, zona: "Campament",
    description: "Claveu estacades afilades al voltant del campament. El que és de fora sap que aquí hi ha clan.",
    purchase_cost: 4, execute_cost: 0, output_resource: "health", output_min: 3, output_max: 6,
    requires: [{ resource: 'material', min: 1 }], side_effects: [{ resource: 'material', delta: -1 }],
    stat_key: "forca", stat_gain: 0.15,
    inclination_deltas: { impuls: +0.03, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.02 },
    event_pool_id: "pool_artesania"
  },
  // ── bt_ritus_sembra (L'Agricultura — Místic) ─────────────────────────────────
  {
    id: "act_ofrena_terra", name: "Ofrena a la Terra", is_base: false, zona: "Campament",
    description: "Ofreneu llavors i pigments a la terra abans de sembrar. El que es dóna a la terra torna en abundància.",
    purchase_cost: 4, execute_cost: 1, side_effects: [{ resource: "health", delta: +5 }],
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.06, sociabilitat: +0.04 },
    event_pool_id: "pool_ritual"
  },
  {
    id: "act_danses_fertilitat", name: "Danses de Fertilitat", is_base: false, zona: "Campament",
    description: "Organitzes danses rituals per cridar l'abundància. El ritme dels peus és la pregunta que la terra respon.",
    purchase_cost: 3, execute_cost: 0, output_resource: "health", output_min: 2, output_max: 4,
    side_effects: [{ resource: "food", delta: -1 }],
    stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.05, sociabilitat: +0.05 },
    event_pool_id: "pool_ritual"
  },

  // UPGRADES
  // B-01: Acció exclusiva branca Recol·lector — payoff tangible Gen 1
  {
    id: "act_aguait_coordinat", name: "Aguait Coordinat", is_upgrade: true, upgrades_action_id: "act_espiar_ramat", zona: "Planes",
    description: "Senyal coordinat amb el grup. La presa no pot fugir. Rendiment molt superior.",
    requires: [{ type: 'has_destresa', id: 'd_rastreig' }],
    purchase_cost: 8, execute_cost: 0, output_resource: "food", output_min: 5, output_max: 10,
    material_min: 1, material_max: 2,
    stat_key: "forca", stat_gain: 0.10,
    inclination_deltas: { impuls: +0.05, "intel·lecte": +0.02, espiritualitat: 0, sociabilitat: +0.03 },
    event_pool_id: "pool_caca"
  },
  {
    id: "act_recollecta_metodica", name: "Recol·lecta Metòdica", is_upgrade: true, upgrades_action_id: "act_recollectar_arrels", zona: "Planes",
    description: "Apliques coneixement acumulat: zones, estació, plantes. Rendiment molt superior.",
    requires: [{ type: 'has_destresa', id: 'd_botanica' }],
    purchase_cost: 6, execute_cost: 0, output_resource: "food", output_min: 4, output_max: 7,
    material_min: 1, material_max: 2,
    stat_key: "enginy", stat_gain: 0.10,
    inclination_deltas: { impuls: -0.02, "intel·lecte": +0.03, espiritualitat: +0.02, sociabilitat: +0.02 },
    event_pool_id: "pool_recollecta"
  },
  {
    id: "act_talla_avancada", name: "Talla Avançada", is_upgrade: true, upgrades_action_id: "act_tallar_pedra", zona: "Campament",
    description: "Eines de sílex de qualitat superior. Millora totes les accions que usen eines.",
    quality_tools: true,
    requires: [{ type: 'has_destresa', id: 'd_talla_silex' }, { resource: 'pedra', min: 1 }],
    purchase_cost: 8, execute_cost: 0,
    side_effects: [{ resource: 'pedra', delta: -1 }, { resource: 'eina', delta: 2 }],
    material_min: 1, material_max: 2,
    stat_key: "enginy", stat_gain: 0.15,
    inclination_deltas: { impuls: -0.02, "intel·lecte": +0.05, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },
  {
    id: "act_gran_ritual", name: "Gran Ritual", is_upgrade: true, upgrades_action_id: "act_ritual_foc", zona: "Campament",
    description: "El ritual s'extén a tota la nit. Cohesió màxima i regeneració profunda.",
    requires: [{ type: 'has_destresa', id: 'd_custodi_foc' }],
    purchase_cost: 6, execute_cost: 0, universal_prereq: "ut_foc", side_effects: [{ resource: 'health', delta: +10 }],
    stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: -0.02, "intel·lecte": 0, espiritualitat: +0.06, sociabilitat: +0.05 },
    event_pool_id: "pool_ritual"
  },
  {
    id: "act_defensa_activa", name: "Defensa Activa", is_upgrade: true, upgrades_action_id: "act_vigilar_campament", zona: "Campament",
    description: "Distribuïu rols i torns de guàrdia. El campament queda segur i el grup rendeix més.",
    requires: [{ type: 'has_aprenentatge', id: 'apr_guardia' }],
    purchase_cost: 8, execute_cost: 0, output_resource: "health", output_min: 3, output_max: 6,
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
        { text: "Marco els tubercles, agafo les baies peribles i marxo", food_delta: +2, health_delta: +1, requires_skill: "bt_coneixement_plantes", discovers: false }
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
    { id: "ev_eina_trencada", text: "L'eina es trenca durant la feina. Cal refer-la.", effects: { eina: -1 }, blocked_if: [{ type: "stat_min", stat: "enginy", min: 3.5 }] },
    { id: "ev_eina_trencada_material", text: "L'eina es trenca i arrossega part del material. La pedra també s'ha perdut.", effects: { eina: -1, pedra: -1 }, blocked_if: [{ type: "stat_min", stat: "enginy", min: 4.0 }] },
    { id: "ev_tecnica_nova",     text: "Un descobriment accidental millora la tècnica.",               effects: { food: +1 } },
    { id: "ev_intercanvi_eines", text: "Un grup veí demana eines a canvi de provisions.",              effects: { food: +2 } },
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
        { text: "Canviar el tall: deixo que la pedra decideixi la forma.",  discovers: false },
        { text: "Descartar. Camino fins al jaç de sílex a cercar un bloc millor.", food_delta: -1, material_delta: -1, discovers: false }
      ]
    },
    {
      id: "ev_aprenent_observa",
      text: "Un infant s'ha aturat darrere meu i mira com treballo la pedra. No fa soroll. Observa on cau el rebuig i segueix el moviment de la meva mà. Podria deixar-lo quedar i anar explicant en veu baixa, fer-lo marxar ara i ensenyar-lo quan tingui temps, o donar-li els fragments petits perquè s'hi entreni.",
      options: [
        { text: "Deixar-lo quedar. Parlo mentre treballo, sense aturar-me.", material_delta: -1, discovers: false },
        { text: "Fer-lo marxar. Li diré que torni quan acabi aquesta peça.",  discovers: false },
        { text: "Donar-li el rebuig. Que aprengui amb els fragments que jo no vull.", health_delta: +1, material_delta: -1, discovers: false }
      ]
    },
    {
      id: "ev_fulla_prestada",
      text: "El company s'atura al costat meu i mostra la seva presa. Ha anat bé, però la seva fulla ha quedat embotida dins la bèstia i l'ha perduda. M'allarga la mà. La meva fulla és bona, però no en tinc cap altra avui. Decideixo ràpidament.",
      options: [
        { text: "Donar-li la meva fulla. Ell torna amb menjar per als dos.", food_delta: +2, material_delta: -2, discovers: false },
        { text: "Donar-li un fragment de rebuig. Serveix per netejar, si va amb compte.", food_delta: +1, material_delta: -1, discovers: false },
        { text: "Dir-li que no. Avui la necessito.", food_delta: -1, discovers: false }
      ]
    },
    {
      id: "ev_tecnica_subtil",
      blocked_if: [{ type: "not_has_skill", id: "bt_buri" }],
      text: "He notat que quan inclino el burí uns dits cap a l'esquerra, el solc surt net i sense esclats. Un artesà que no havia vist mai s'ha assegut al costat i treballa amb el burí inclinat, exactament com ho he provat jo. Sembla que ja ho sap des de fa temps.",
      options: [
        { text: "Preguntar-li directament: mostro el meu solc i el seu, i espero.", health_delta: +1, discovers: false },
        { text: "No dir res. Segueixo experimentant sol fins que ho entenc del tot.", discovers: false },
        { text: "Ensenyar-li el que he descobert jo primer, abans de preguntar-li res.", health_delta: +2, discovers: false }
      ]
    }
  ],
  pool_ritual: [
    {
      id: "pe_malaltia", is_single_use: true,
      text: "Una febre s'escampa pel campament. Alguns membres cauen malalts i les reserves s'esgoten. Com actuaràs?",
      options: [
        {
          text: "Aplica les herbes guaridores que coneixes.",
          requires_skill: "bt_guariment_plantes",
          food_delta: -1, health_delta: -3, discovers: false
        },
        {
          text: "Aïllar els malalts i racionar les reserves.",
          food_delta: -3, health_delta: -15, discovers: false
        }
      ]
    },
    { id: "ev_visio_profunda",   text: "Una visió durant el ritual guia el grup cap a recursos amagats.", effects: { health: +2 } },
    { id: "ev_ritual_cohesio",   text: "El ritual reforça la cohesió del grup.",                          effects: { health: +3 } },
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
    { id: "ev_dispute_interna",  text: "Una disputa interna distreu el grup.",                       effects: { health: -2 } },
    { id: "ev_aliat_nou",        text: "Un grup veí ofereix col·laboració temporal.",               effects: { food: +2 } },
    { id: "ev_lider_respectat",  text: "El respecte augmenta. El grup treballa millor.",            effects: { health: +3 } },
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
        { text: "Prenc part pel que crec que té raó i li cedeixo el que li toca.", health_delta: +2, discovers: false },
        { text: "Proposo dividir la peça de manera que cap dels dos surti guanyador.", material_delta: -1, discovers: false },
        { text: "M'allunyo. Que ho resolguin ells.", discovers: false }
      ]
    },
    {
      id: "ev_estrany_a_la_vora",
      blocked_if: [{ type: "resource_below", resource: "health", value: 3 }],
      text: "Un home s'acosta al campament arrossegant els peus. No és del clan. Porta una bossa de cuir amb pedres que no he vist mai per aquí. Té els llavis secs i els ulls enfonsats de caminada llarga.",
      options: [
        { text: "L'invito a seure i li ofereixo menjar. Acabem bescanviant pedres.", food_delta: -1, health_delta: +2, discovers: false },
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
        { text: "\"Perquè cal fer-ho\". Li ensenyaré quan sigui gran.", discovers: false },
        { text: "Li deixo que ho provi ell mateix. Superviso des de lluny.", food_delta: -1, discovers: false }
      ]
    },
    {
      id: "ev_fill_aprenentatge",
      text: "El fill ha reproduït, sense que li ho diguessis, una tècnica que li vas ensenyar fa setmanes. No era perfecta, però la intuïció hi era. Es gira a mirar-te.",
      options: [
        { text: "El felicito davant del grup. Que tothom ho vegi.", food_delta: 0, health_delta: +2, discovers: false },
        { text: "Li dic on ha fallat i com millorar-ho. Aprenentatge primer.", food_delta: 0, health_delta: +1, discovers: false },
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
      effects: { health: +3 }
    }
  ]
};

// Thresholds ×0.73 (playtest 2026-06-06) — branques més assolibles
const BRANCHES = [
  {
    id: "branch_hunter",   name: "Caçador",
    desc: "Caçador ràpid i decisiu. Fort en impuls, lliure de lligams socials. Domina la caça i el risc.",
    conditions: { operator: "AND", conditions: [{ axis: "impuls", min: 0.18 }, { axis: "sociabilitat", max: 0.40 }] }
  },
  {
    id: "branch_gatherer", name: "Recol·lector",
    desc: "Recol·lector pacient i reflexiu. Coneix les plantes i el territori. Sostenible i segur.",
    conditions: { operator: "AND", conditions: [{ axis: "impuls", max: 0.10 }, { axis: "intel·lecte", min: 0.15 }] }
  },
  {
    id: "branch_craftsman", name: "Artesà",
    desc: "Artesà analític i meticulós. Crea eines i estructures. L'intel·lecte guia les mans.",
    conditions: { operator: "AND", conditions: [{ axis: "intel·lecte", min: 0.18 }, { axis: "impuls", max: 0.20 }] }
  },
  {
    id: "branch_mystic",   name: "Místic",
    desc: "Místic espiritual i social. Manté la cohesió del clan amb rituals i paraules. Pont entre el visible i l'invisible.",
    conditions: { operator: "AND", conditions: [{ axis: "espiritualitat", min: 0.22 }, { axis: "sociabilitat", min: 0.19 }] }
  }
];

// Events fired when exploring fails to discover a new zone (50% chance)
// 2/3 positive, 1/3 negative
const EXPLORATION_EVENTS = [
  { id: "expl_rastre_animal",   text: "Trobes un rastre d'animals que porten a una font d'aigua fresca. El grup torna animat.", effects: { food: +2 }, positive: true },
  { id: "expl_herbes_fragants", text: "La brisa porta una olor de plantes aromàtiques. El grup recull alguns feixos pel camí.",  effects: { food: +1, health: +3 }, positive: true },
  { id: "expl_vista_panoramica",text: "Des d'un turó, divises una plana extensa. El retorn et fa veure la zona diferent.",       effects: { health: +2 }, positive: true },
  { id: "expl_roca_estable",    text: "Trobes un aflorament de pedra bona. Valores la zona per tornar-hi.",                     effects: { pedra: +1 }, positive: true },
  { id: "expl_sendera_desconeguda", text: "Una senda estreta puja entre les roques. Segueixes uns passos però la llum minva.", effects: { health: -3 }, positive: false },
  { id: "expl_animal_ferotge",  text: "Un animal territorial et sorprèn a mig camí. Tornes amb un tall al braç.",               effects: { food: -1, health: -5 }, positive: false },
  { id: "expl_tempesta_sobtada",text: "Una tempesta esclata sense avís. El grup es refugia però perd provisions mullades.",     effects: { food: -2 }, positive: false }
];
