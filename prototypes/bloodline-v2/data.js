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
const FOOD_MAX_BASIC = 10;  // FOOD-02 (#1, 2026-06-29): cap que assoleix l'assecat bàsic; més enllà = upgrades futurs (fins FOOD_MAX)
const FOOD_MAX_START = 6;   // FOOD-02 (2026-06-28): cap inicial 6; assecat bàsic puja fins ~10; més via upgrades
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
    id: 'token', emoji: '🔵', label: 'Tokens', section: 'resources',
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
    glossaryDesc: "Eines fabricades. Cada branca fabrica la seva (llança, estri, garbell o ungüent) i només pots fer la de la teva branca activa. Tenir-ne no fa res per si sol: es GASTEN en accions concretes (p.ex. Caça amb Llança o Recol·lectar amb Garbell) per obtenir un rendiment molt superior. Cap: 3.",
  },
  // Era 2+: descomenta per afegir nous recursos al top bar, estat i glossari
  // { id: 'happiness', emoji: '✨', label: 'Benestar', section: 'resources', startVal: 50, max: 100, upkeep: null, showMax: false, rateType: false, era: 2, color: 'var(--purple)', borderColor: 'rgba(168,85,247,0.3)', glossaryDesc: "Satisfacció general. Si cau molt baix, penalitza els resultats de les accions." },
];

// --- Destresa Definitions ---
// action_id: which action must be used DESTRESA_THRESHOLD times to unlock (in addition to inclination condition)
const DESTRESA_DEFS = [
  { id: "d_rastreig",    name: "Rastreig",       action_id: "act_espiar_ramat",        conditions: [{ axis: "impuls",         min: 0.10 }] },
  { id: "d_botanica",    name: "Botànica",        action_id: "act_recollectar_arrels",  conditions: [{ axis: "intel·lecte",    min: 0.10 }] },
  { id: "d_talla_silex", name: "Talla de Sílex",  action_id: "act_recollectar_pedra",    conditions: [{ axis: "intel·lecte",    min: 0.15 }] },
  { id: "d_custodi_foc", name: "Custodi del Foc", action_id: "act_ritual_foc",          conditions: [{ axis: "espiritualitat", min: 0.10 }] },
];

// --- Aprenentatge Definitions ---
// Aprenentatges: bonus permanents adquirits de dues maneres (fins a 2 per personatge):
//   1. Via act_ensenyar: el pare transmet UN dels seus aprenentatges al fill (charState.ensenyat = 1)
//   2. Via descoberta durant la partida: accions o events específics els desbloquegen
// Un cop adquirit, l'aprenentatge pertany al personatge (no al llinatge) — no s'hereta automàticament.
// El fill rep UN aprenentatge ensenyat (si el pare va executar act_ensenyar) i pot descobrir el segon durant la seva vida.
// discoveryChance: probabilitat per tirada (quan s'han fet >= APRENENTATGE_THRESHOLD usos d'una discovery_action_id)
// effect.type: "bonus_action_output" (bonus a una acció concreta) | "food_upkeep_reduction" | "token_bonus" (global, totes les accions)
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
    discovery_action_ids: ["act_torrar_llavors", "act_ahumar_carn", "act_assecar_provisions"],
    effect: { type: "food_upkeep_reduction", value: 0.5, desc: "−0.5 aliment/torn en upkeep" }
  },
  {
    id: "apr_orientacio", name: "Orientació", icon: "🧭",
    description: "Llegeixes el terreny i les estrelles amb naturalitat. Explorar rendeix molt més.",
    discoveryChance: 0.25,
    discovery_action_ids: ["act_explorar_voltants", "act_rastreig_rutes", "act_transit_nocturn"],
    effect: { type: "bonus_action_output", action_id: "act_explorar_voltants", output_min_bonus: 1, output_max_bonus: 2, desc: "+1/+2 token en explorar" }
  },
  {
    id: "apr_treball_pedra", name: "Treball de la Pedra", icon: "🪨",
    description: "Tries el millor sílex i calcules l'angle de talla. L'artesania de pedra dona molt més.",
    discoveryChance: 0.30,
    discovery_action_ids: ["act_recollectar_pedra", "act_faonar_eines"],
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
    description: "Saps quines plantes i bolets curen, nodreixen i calmen. La recollida del bosc rendeix més i és més sana.",
    discoveryChance: 0.30,
    discovery_action_ids: ["act_recollectar_arrels", "act_assecament_plantes", "act_preparar_ungüent"],
    // APR-01 (2026-06-28): diferenciat de la destresa Botànica (que dona +food a arrels). Aquí, medicinal →
    // buffa la recollida de bolets (food + salut), no arrels: evita el doble stacking i el rol és distint.
    effect: { type: "bonus_action_output", action_id: "act_recollida_bolets", output_min_bonus: 1, output_max_bonus: 1, desc: "+1 recol·lecció de bolets (plantes que nodreixen i curen)" }
  },
  {
    id: "apr_veu_clan", name: "La Veu del Clan", icon: "🗣️",
    description: "Saps transmetre, inspirar i mediar. Les teves paraules generen recursos allà on les llances no arriben.",
    discoveryChance: 0.20,
    discovery_action_ids: ["act_narrar_llegendes", "act_explicar_orígens", "act_cants_grup"],
    effect: { type: "token_bonus", value: 1, desc: "+1 token a totes les accions" }
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
    id: "tdb_01", name: "Els Rastres del Món", emoji: "👣",
    universal_prereq: null,
    inclination_conditions: { operator: "OR", conditions: [
      { axis: "impuls", min: 0.12 }, { axis: "intel·lecte", min: 0.12 },
      { axis: "espiritualitat", min: 0.12 }, { axis: "sociabilitat", min: 0.12 }
    ]},
    narrative: "El món parla constantment — petjades, brots, vetes, ocells — i qui aprèn a llegir-lo deixa de vagar a cegues.",
    unlocks_action_ids: ["act_caca_aguait","act_seguir_ramat","act_mapa_verd","act_collita_guiada","act_llegir_veta","act_triar_fibra","act_llegir_presagis","act_cami_ocells"]
  },
  {
    id: "tdb_02", name: "La Pedra que Talla", emoji: "🪨",
    universal_prereq: null,
    inclination_conditions: { operator: "OR", conditions: [
      { axis: "impuls", min: 0.15 }, { axis: "intel·lecte", min: 0.15 },
      { axis: "espiritualitat", min: 0.15 }, { axis: "sociabilitat", min: 0.15 }
    ]},
    narrative: "Una vora esmolada canvia la relació amb el món: el que abans s'arrencava, ara es talla.",
    unlocks_action_ids: ["act_esquarterar","act_punta_crua","act_pelar_escorca","act_partir_fruits","act_tallar_ascles","act_bescanviar_ascles","act_gravar_amulet","act_pedra_guardiana"]
  },
  {
    id: "tdb_03", name: "El Cercle del Foc", emoji: "🔥",
    universal_prereq: "ut_foc",
    inclination_conditions: { operator: "OR", conditions: [
      { axis: "impuls", min: 0.20 }, { axis: "intel·lecte", min: 0.20 },
      { axis: "espiritualitat", min: 0.20 }, { axis: "sociabilitat", min: 0.20 }
    ]},
    narrative: "El foc no només escalfa: transforma l'aliment, reuneix el clan i redefineix què és possible.",
    unlocks_action_ids: ["act_rostir_caca","act_foc_batuda","act_pedres_bullir","act_cercle_vespre","act_endurir_puntes","act_dominar_brasa","act_vetlla_flames","act_cendres_sagrades"]
  },
  {
    id: "tdb_04", name: "La Nit Domada", emoji: "🌒",
    universal_prereq: "ut_foc",
    inclination_conditions: { operator: "OR", conditions: [
      { axis: "impuls", min: 0.20 }, { axis: "intel·lecte", min: 0.20 },
      { axis: "espiritualitat", min: 0.20 }, { axis: "sociabilitat", min: 0.20 }
    ]},
    narrative: "Amb el foc, la nit deixa de ser temps perdut. El dia s'allarga per a qui s'atreveix a usar-lo.",
    unlocks_action_ids: ["act_aguait_nocturn","act_torxa_persecucio","act_feina_llum","act_vigilar_brases","act_taller_nocturn","act_reparar_vora","act_dansa_ombres","act_somnis_guiats"]
  },
  {
    id: "tdb_05", name: "La Mà que Transforma", emoji: "🔧",
    universal_prereq: "ut_eines",
    inclination_conditions: { operator: "OR", conditions: [
      { axis: "impuls", min: 0.25 }, { axis: "intel·lecte", min: 0.25 },
      { axis: "espiritualitat", min: 0.25 }, { axis: "sociabilitat", min: 0.25 }
    ]},
    narrative: "L'eina deixa de ser una pedra trobada i esdevé un objecte pensat: mànec, lligadura, propòsit.",
    unlocks_action_ids: ["act_llanca_emmanegada","act_desollar_traca","act_basto_cavador","act_espremer_fruits","act_taller_percussio","act_encarrecs","act_basto_esperits","act_foragitar_pors"]
  },
  {
    id: "tdb_06", name: "El Pes i la Palanca", emoji: "⚖️",
    universal_prereq: "ut_eines",
    inclination_conditions: { operator: "OR", conditions: [
      { axis: "impuls", min: 0.25 }, { axis: "intel·lecte", min: 0.25 },
      { axis: "espiritualitat", min: 0.25 }, { axis: "sociabilitat", min: 0.25 }
    ]},
    narrative: "El descobriment que la força es pot enganyar: un tronc, un punt de suport, i el món pesa menys.",
    unlocks_action_ids: ["act_fossa_parany","act_encerclar_presa","act_perxa_llarga","act_arrossegar_troncs","act_palanca_pedrera","act_llosa_llar","act_pedra_dreta","act_ofrena_feixuga"]
  },
  {
    id: "tdb_07", name: "Els Símbols a la Pedra", emoji: "🎨",
    universal_prereq: "ut_art",
    inclination_conditions: { operator: "OR", conditions: [
      { axis: "impuls", min: 0.30 }, { axis: "intel·lecte", min: 0.30 },
      { axis: "espiritualitat", min: 0.30 }, { axis: "sociabilitat", min: 0.30 }
    ]},
    narrative: "Una marca que perdura val més que mil paraules dites: el clan comença a escriure's al món.",
    unlocks_action_ids: ["act_marcar_territori","act_mural_gesta","act_senyals_cami","act_comptar_osques","act_gravar_patrons","act_pedres_bescanvi","act_pintar_esperits","act_ocre_sagrat"]
  },
  {
    id: "tdb_08", name: "La Veu que Perdura", emoji: "🗣️",
    universal_prereq: "ut_art",
    inclination_conditions: { operator: "OR", conditions: [
      { axis: "impuls", min: 0.30 }, { axis: "intel·lecte", min: 0.30 },
      { axis: "espiritualitat", min: 0.30 }, { axis: "sociabilitat", min: 0.30 }
    ]},
    narrative: "Relats, cants i noms: el coneixement aprèn a viatjar entre generacions sense tocar de peus a terra.",
    unlocks_action_ids: ["act_relat_gesta","act_crits_caca","act_canco_collita","act_veus_bosc","act_nom_eines","act_memoria_ofici","act_cant_ancestres","act_lletania_clan"]
  },
  {
    id: "tdb_09", name: "La Segona Pell", emoji: "🧵",
    universal_prereq: "ut_vestimenta",
    inclination_conditions: { operator: "OR", conditions: [
      { axis: "impuls", min: 0.35 }, { axis: "intel·lecte", min: 0.35 },
      { axis: "espiritualitat", min: 0.35 }, { axis: "sociabilitat", min: 0.35 }
    ]},
    narrative: "Cobrir el cos canvia el mapa del possible: el fred deixa de ser mur i esdevé estació.",
    unlocks_action_ids: ["act_adobar_pell","act_caca_hivern","act_capes_trenades","act_collir_fred","act_agulla_os","act_vestits_bescanvi","act_mantell_ritual","act_embolcallar_nadons"]
  },
  {
    id: "tdb_10", name: "El Camí Llarg", emoji: "🥾",
    universal_prereq: "ut_vestimenta",
    inclination_conditions: { operator: "OR", conditions: [
      { axis: "impuls", min: 0.35 }, { axis: "intel·lecte", min: 0.35 },
      { axis: "espiritualitat", min: 0.35 }, { axis: "sociabilitat", min: 0.35 }
    ]},
    narrative: "Protegit del fred i carregat de provisions, el clan descobreix que el món és més gran que l'horitzó.",
    unlocks_action_ids: ["act_expedicio","act_obrir_cami","act_intercanvi_llunya","act_rutes_fruita","act_pedres_llunyanes","act_lligar_carregues","act_pelegrinatge","act_terres_esperits"]
  },
  {
    id: "tdb_11", name: "El Nus que Reté", emoji: "🪢",
    universal_prereq: "ut_corda",
    inclination_conditions: { operator: "OR", conditions: [
      { axis: "impuls", min: 0.38 }, { axis: "intel·lecte", min: 0.38 },
      { axis: "espiritualitat", min: 0.38 }, { axis: "sociabilitat", min: 0.38 }
    ]},
    narrative: "La corda captura el que les mans no poden retenir: preses, peixos, càrregues, records.",
    unlocks_action_ids: ["act_parar_llacos","act_xarxa_ocells","act_xarxa_riu","act_lligar_farcells","act_trenar_corda","act_nusos_mesura","act_nusos_memoria","act_lligar_mals"]
  },
  {
    id: "tdb_12", name: "Els Fils del Clan", emoji: "🤝",
    universal_prereq: "ut_corda",
    inclination_conditions: { operator: "OR", conditions: [
      { axis: "impuls", min: 0.38 }, { axis: "intel·lecte", min: 0.38 },
      { axis: "espiritualitat", min: 0.38 }, { axis: "sociabilitat", min: 0.38 }
    ]},
    narrative: "El clan descobreix que ell mateix és un teixit: junts, els individus fan coses que sols no podrien.",
    unlocks_action_ids: ["act_cacera_conjunta","act_repartir_boti","act_teixir_cercle","act_taula_comuna","act_aprenents","act_obrar_plegats","act_ritu_pas","act_cercle_dol"]
  },
  {
    id: "tdb_13", name: "El Vas que Guarda", emoji: "🏺",
    universal_prereq: "ut_ceramica",
    inclination_conditions: { operator: "OR", conditions: [
      { axis: "impuls", min: 0.42 }, { axis: "intel·lecte", min: 0.42 },
      { axis: "espiritualitat", min: 0.42 }, { axis: "sociabilitat", min: 0.42 }
    ]},
    narrative: "El recipient de fang trenca la tirania del present: el que avui sobra ja no es perd.",
    unlocks_action_ids: ["act_greix_vas","act_provisions_caca","act_gerres_gra","act_aigua_guardada","act_modelar_vasos","act_segellar_vasos","act_vas_ofrenes","act_urna_ancestres"]
  },
  {
    id: "tdb_14", name: "El Fang i el Forn", emoji: "♨️",
    universal_prereq: "ut_ceramica",
    inclination_conditions: { operator: "OR", conditions: [
      { axis: "impuls", min: 0.42 }, { axis: "intel·lecte", min: 0.42 },
      { axis: "espiritualitat", min: 0.42 }, { axis: "sociabilitat", min: 0.42 }
    ]},
    narrative: "El forn concentra el foc i el fa precís: cocció, fum controlat i el fang tornat pedra.",
    unlocks_action_ids: ["act_fumador","act_coure_moll","act_torrar_llavors","act_olla_foc","act_forn_terra","act_coure_fang","act_figures_fang","act_forn_visions"]
  },
  {
    id: "tdb_15", name: "La Llavor Confiada", emoji: "🌱",
    universal_prereq: "ut_agricultura",
    inclination_conditions: { operator: "OR", conditions: [
      { axis: "impuls", min: 0.45 }, { axis: "intel·lecte", min: 0.45 },
      { axis: "espiritualitat", min: 0.45 }, { axis: "sociabilitat", min: 0.45 }
    ]},
    narrative: "Enterrar menjar avui creient que en sortirà més demà: l'acte de fe que canviarà el món.",
    unlocks_action_ids: ["act_atraure_ramat","act_tanca_bestiar","act_hort_clan","act_triar_llavors","act_aixada","act_obrir_solcs","act_beneir_camps","act_primera_espiga"]
  },
  {
    id: "tdb_16", name: "El Cicle de les Estacions", emoji: "🌗",
    universal_prereq: "ut_agricultura",
    inclination_conditions: { operator: "OR", conditions: [
      { axis: "impuls", min: 0.45 }, { axis: "intel·lecte", min: 0.45 },
      { axis: "espiritualitat", min: 0.45 }, { axis: "sociabilitat", min: 0.45 }
    ]},
    narrative: "El clan aixeca la vista i veu l'any sencer: qui entén el cicle, deixa de reaccionar i comença a planificar.",
    unlocks_action_ids: ["act_llegir_migracions","act_darrera_cacera","act_calendari_collita","act_rebost_hivern","act_eines_temps","act_llegat_taller","act_festa_solstici","act_roda_any"]
  }
];


// ─── Requisits d'inclinació per acció ─────────────────────────────────────────
// Les accions BASE de supervivència no tenen requisits (visibles sempre).
// Les accions de branca o pont requereixen cert perfil d'inclinació.
// Format: { [axis]: { min?, max? } }  — totes les condicions son AND.
// Consultat per getActionVisibility() com a fallback si l'acció no té inclination_requirements propi.
const ACTION_INCLINATION_REQUIREMENTS = {
  // Standalones (conservats)
  act_ritual_foc:          { espiritualitat: { min: 0.05 } },
  act_caca_llanca:         { impuls: { min: 0.15 } },
  act_ahumar_carn:         { impuls: { max: 0.35 } },
  act_gran_ritual:         { espiritualitat: { min: 0.10 } },

  // TdB 1 — Els Rastres del Món
  act_caca_aguait:         { impuls: { min: 0.10 } },
  act_seguir_ramat:        { impuls: { min: 0.10 } },
  act_mapa_verd:           { sociabilitat: { min: 0.10 } },
  act_collita_guiada:      { sociabilitat: { min: 0.10 } },
  act_llegir_veta:         { "intel·lecte": { min: 0.10 } },
  act_triar_fibra:         { "intel·lecte": { min: 0.10 } },
  act_llegir_presagis:     { espiritualitat: { min: 0.10 } },
  act_cami_ocells:         { espiritualitat: { min: 0.10 } },

  // TdB 2 — La Pedra que Talla
  act_esquarterar:         { impuls: { min: 0.10 } },
  act_punta_crua:          { impuls: { min: 0.10 } },
  act_pelar_escorca:       { sociabilitat: { min: 0.10 } },
  act_partir_fruits:       { sociabilitat: { min: 0.10 } },
  act_tallar_ascles:       { "intel·lecte": { min: 0.10 } },
  act_bescanviar_ascles:   { "intel·lecte": { min: 0.10 } },
  act_gravar_amulet:       { espiritualitat: { min: 0.10 } },
  act_pedra_guardiana:     { espiritualitat: { min: 0.10 } },

  // TdB 3 — El Cercle del Foc
  act_rostir_caca:         { impuls: { min: 0.10 } },
  act_foc_batuda:          { impuls: { min: 0.10 } },
  act_pedres_bullir:       { sociabilitat: { min: 0.10 } },
  act_cercle_vespre:       { sociabilitat: { min: 0.10 } },
  act_endurir_puntes:      { "intel·lecte": { min: 0.10 } },
  act_dominar_brasa:       { "intel·lecte": { min: 0.10 } },
  act_vetlla_flames:       { espiritualitat: { min: 0.10 } },
  act_cendres_sagrades:    { espiritualitat: { min: 0.10 } },

  // TdB 4 — La Nit Domada
  act_aguait_nocturn:      { impuls: { min: 0.10 } },
  act_torxa_persecucio:    { impuls: { min: 0.10 } },
  act_feina_llum:          { sociabilitat: { min: 0.10 } },
  act_vigilar_brases:      { sociabilitat: { min: 0.10 } },
  act_taller_nocturn:      { "intel·lecte": { min: 0.10 } },
  act_reparar_vora:        { "intel·lecte": { min: 0.10 } },
  act_dansa_ombres:        { espiritualitat: { min: 0.10 } },
  act_somnis_guiats:       { espiritualitat: { min: 0.10 } },

  // TdB 5 — La Mà que Transforma
  act_llanca_emmanegada:   { impuls: { min: 0.10 } },
  act_desollar_traca:      { impuls: { min: 0.10 } },
  act_basto_cavador:       { sociabilitat: { min: 0.10 } },
  act_espremer_fruits:     { sociabilitat: { min: 0.10 } },
  act_taller_percussio:    { "intel·lecte": { min: 0.10 } },
  act_encarrecs:           { "intel·lecte": { min: 0.10 } },
  act_basto_esperits:      { espiritualitat: { min: 0.10 } },
  act_foragitar_pors:      { espiritualitat: { min: 0.10 } },

  // TdB 6 — El Pes i la Palanca
  act_fossa_parany:        { impuls: { min: 0.10 } },
  act_encerclar_presa:     { impuls: { min: 0.10 } },
  act_perxa_llarga:        { sociabilitat: { min: 0.10 } },
  act_arrossegar_troncs:   { sociabilitat: { min: 0.10 } },
  act_palanca_pedrera:     { "intel·lecte": { min: 0.10 } },
  act_llosa_llar:          { "intel·lecte": { min: 0.10 } },
  act_pedra_dreta:         { espiritualitat: { min: 0.10 } },
  act_ofrena_feixuga:      { espiritualitat: { min: 0.10 } },

  // TdB 7 — Els Símbols a la Pedra
  act_marcar_territori:    { impuls: { min: 0.10 } },
  act_mural_gesta:         { impuls: { min: 0.10 } },
  act_senyals_cami:        { sociabilitat: { min: 0.10 } },
  act_comptar_osques:      { sociabilitat: { min: 0.10 } },
  act_gravar_patrons:      { "intel·lecte": { min: 0.10 } },
  act_pedres_bescanvi:     { "intel·lecte": { min: 0.10 } },
  act_pintar_esperits:     { espiritualitat: { min: 0.10 } },
  act_ocre_sagrat:         { espiritualitat: { min: 0.10 } },

  // TdB 8 — La Veu que Perdura
  act_relat_gesta:         { impuls: { min: 0.10 } },
  act_crits_caca:          { impuls: { min: 0.10 } },
  act_canco_collita:       { sociabilitat: { min: 0.10 } },
  act_veus_bosc:           { sociabilitat: { min: 0.10 } },
  act_nom_eines:           { "intel·lecte": { min: 0.10 } },
  act_memoria_ofici:       { "intel·lecte": { min: 0.10 } },
  act_cant_ancestres:      { espiritualitat: { min: 0.10 } },
  act_lletania_clan:       { espiritualitat: { min: 0.10 } },

  // TdB 9 — La Segona Pell
  act_adobar_pell:         { impuls: { min: 0.10 } },
  act_caca_hivern:         { impuls: { min: 0.10 } },
  act_capes_trenades:      { sociabilitat: { min: 0.10 } },
  act_collir_fred:         { sociabilitat: { min: 0.10 } },
  act_agulla_os:           { "intel·lecte": { min: 0.10 } },
  act_vestits_bescanvi:    { "intel·lecte": { min: 0.10 } },
  act_mantell_ritual:      { espiritualitat: { min: 0.10 } },
  act_embolcallar_nadons:  { espiritualitat: { min: 0.10 } },

  // TdB 10 — El Camí Llarg
  act_expedicio:           { impuls: { min: 0.10 } },
  act_obrir_cami:          { impuls: { min: 0.10 } },
  act_intercanvi_llunya:   { sociabilitat: { min: 0.10 } },
  act_rutes_fruita:        { sociabilitat: { min: 0.10 } },
  act_pedres_llunyanes:    { "intel·lecte": { min: 0.10 } },
  act_lligar_carregues:    { "intel·lecte": { min: 0.10 } },
  act_pelegrinatge:        { espiritualitat: { min: 0.10 } },
  act_terres_esperits:     { espiritualitat: { min: 0.10 } },

  // TdB 11 — El Nus que Reté
  act_parar_llacos:        { impuls: { min: 0.10 } },
  act_xarxa_ocells:        { impuls: { min: 0.10 } },
  act_xarxa_riu:           { sociabilitat: { min: 0.10 } },
  act_lligar_farcells:     { sociabilitat: { min: 0.10 } },
  act_trenar_corda:        { "intel·lecte": { min: 0.10 } },
  act_nusos_mesura:        { "intel·lecte": { min: 0.10 } },
  act_nusos_memoria:       { espiritualitat: { min: 0.10 } },
  act_lligar_mals:         { espiritualitat: { min: 0.10 } },

  // TdB 12 — Els Fils del Clan
  act_cacera_conjunta:     { impuls: { min: 0.10 } },
  act_repartir_boti:       { impuls: { min: 0.10 } },
  act_teixir_cercle:       { sociabilitat: { min: 0.10 } },
  act_taula_comuna:        { sociabilitat: { min: 0.10 } },
  act_aprenents:           { "intel·lecte": { min: 0.10 } },
  act_obrar_plegats:       { "intel·lecte": { min: 0.10 } },
  act_ritu_pas:            { espiritualitat: { min: 0.10 } },
  act_cercle_dol:          { espiritualitat: { min: 0.10 } },

  // TdB 13 — El Vas que Guarda
  act_greix_vas:           { impuls: { min: 0.10 } },
  act_provisions_caca:     { impuls: { min: 0.10 } },
  act_gerres_gra:          { sociabilitat: { min: 0.10 } },
  act_aigua_guardada:      { sociabilitat: { min: 0.10 } },
  act_modelar_vasos:       { "intel·lecte": { min: 0.10 } },
  act_segellar_vasos:      { "intel·lecte": { min: 0.10 } },
  act_vas_ofrenes:         { espiritualitat: { min: 0.10 } },
  act_urna_ancestres:      { espiritualitat: { min: 0.10 } },

  // TdB 14 — El Fang i el Forn
  act_fumador:             { impuls: { min: 0.10 } },
  act_coure_moll:          { impuls: { min: 0.10 } },
  act_torrar_llavors:      { sociabilitat: { min: 0.10 } },
  act_olla_foc:            { sociabilitat: { min: 0.10 } },
  act_forn_terra:          { "intel·lecte": { min: 0.10 } },
  act_coure_fang:          { "intel·lecte": { min: 0.10 } },
  act_figures_fang:        { espiritualitat: { min: 0.10 } },
  act_forn_visions:        { espiritualitat: { min: 0.10 } },

  // TdB 15 — La Llavor Confiada
  act_atraure_ramat:       { impuls: { min: 0.10 } },
  act_tanca_bestiar:       { impuls: { min: 0.10 } },
  act_hort_clan:           { sociabilitat: { min: 0.10 } },
  act_triar_llavors:       { sociabilitat: { min: 0.10 } },
  act_aixada:              { "intel·lecte": { min: 0.10 } },
  act_obrir_solcs:         { "intel·lecte": { min: 0.10 } },
  act_beneir_camps:        { espiritualitat: { min: 0.10 } },
  act_primera_espiga:      { espiritualitat: { min: 0.10 } },

  // TdB 16 — El Cicle de les Estacions
  act_llegir_migracions:   { impuls: { min: 0.10 } },
  act_darrera_cacera:      { impuls: { min: 0.10 } },
  act_calendari_collita:   { sociabilitat: { min: 0.10 } },
  act_rebost_hivern:       { sociabilitat: { min: 0.10 } },
  act_eines_temps:         { "intel·lecte": { min: 0.10 } },
  act_llegat_taller:       { "intel·lecte": { min: 0.10 } },
  act_festa_solstici:      { espiritualitat: { min: 0.10 } },
  act_roda_any:            { espiritualitat: { min: 0.10 } },
};


// output_resource: "food" (default) | "token" | "health"  — ha de coincidir amb id de RESOURCE_DEFS
// side_effects: array de side-effects [{ resource: 'health'|'food'|..., delta: N }] — s'apliquen genèricament
// stat_key: "forca" | "enginy" | "vincle" — which stat multiplies output + grows on use
// stat_gain: how much the stat grows per execution
// destresa_id/name/threshold: personal skill discovered after N uses of this action
// is_upgrade / upgrades_action_id: substitutory improved action, replaces base when purchased
// minAge / maxAge: character age gates (edat del personatge, no cicle d'era)
const ACTIONS = [
  // BASE
  {
    id: "act_espiar_ramat", name: "Abatre una Presa", is_base: true, zona: "Planes",
    description: "Segueixes el ramat, esculls el moment i abats una presa a mans nues. Molt menjar, però risc de ferides — una pedra a la mà ho fa menys perillós.",
    execute_cost: 0, output_resource: "food", output_min: 3, output_max: 8,
    token_min: 2, token_max: 4,
    side_effects: [{ resource: 'health', delta: -5 }],
    assist: { resource: 'pedra', min: 1, consume: 1, health_delta: 1, desc: '🪨 Gastes una pedra com a arma: menys risc (−4 en lloc de −5).' },
    stat_key: "forca", stat_gain: 0.10,
    destresa_id: "d_rastreig",
    inclination_deltas: { impuls: +0.05, "intel·lecte": +0.03, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca"
  },
  {
    id: "act_recollectar_arrels", name: "Recol·lectar Arrels", is_base: true, zona: "Planes",
    description: "Busques arrels i baies comestibles sense allunyar-te. Segur però rendiment moderat — amb fibres pots fer un cistell improvisat i recollir-ne més.",
    execute_cost: 0, output_resource: "food", output_min: 1, output_max: 3,
    token_min: 2, token_max: 3,
    assist: { resource: 'branques', min: 1, consume: 1, output_delta: 1, desc: '🌿 Gastes fibres per fer un cistell: +1 de recollida.' },
    stat_key: "forca", stat_gain: 0.10,
    destresa_id: "d_botanica",
    inclination_deltas: { impuls: -0.02, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.05 },
    event_pool_id: "pool_recollecta"
  },
  {
    id: "act_ritual_foc", name: "Vetlla al Foc", is_base: false, zona: "Campament",
    description: "El clan es reuneix al voltant del foc. El caliu compartit cura TOT el grup (més que la contemplació en solitari) i enforteix els llaços; els cants travessen la nit.",
    purchase_cost: 4, execute_cost: 0, output_resource: "health", output_min: 5, output_max: 8,
    stat_key: "vincle", stat_gain: 0.12,
    destresa_id: "d_custodi_foc",
    // ACT-DIFF-01 (2026-06-28): acció SOCIAL (Recol·lector) que cura més però requereix foc + compra,
    // a diferència de Contemplació (lliure, petita, espiritual/Místic).
    inclination_deltas: { impuls: 0, "intel·lecte": -0.01, espiritualitat: 0, sociabilitat: +0.08 },
    event_pool_id: "pool_ritual"
  },
  {
    id: "act_contemplacio", name: "Contemplació", is_base: true, zona: "Campament",
    description: "T'asseus en silenci i observes el món. Cures i, sobretot, inclines el llinatge cap a l'espiritualitat (Místic). És el descans del Místic; Vigilar el Campament és l'equivalent per a qui tendeix al social.",
    execute_cost: 0, output_resource: "health", output_min: 2, output_max: 4,
    stat_key: "vincle", stat_gain: 0.05,
    inclination_deltas: { impuls: -0.02, "intel·lecte": 0, espiritualitat: +0.08, sociabilitat: +0.04 },
    event_pool_id: "pool_ritual"
  },
  {
    id: "act_explorar_voltants", name: "Explorar els Voltants", is_base: true, zona: "Planes",
    description: "T'aventures més lluny del campament. Cada intent augmenta la probabilitat de descobrir zones noves.",
    execute_cost: 1,
    character_effect: { type: 'explore_zone' },
    token_min: 2, token_max: 4,
    inclination_deltas: { impuls: +0.04, "intel·lecte": -0.02, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: null
  },
  {
    id: "act_recollectar_pedra", name: "Recollir Pedra", is_base: true, zona: "Planes",
    description: "Recolliu sílex i pedra calcària per als vostres estris. La pedra és el fonament de tot.",
    execute_cost: 0, output_resource: "pedra", output_min: 1, output_max: 3,
    token_min: 1, token_max: 2,
    stat_key: "forca", stat_gain: 0.05,
    inclination_deltas: { impuls: +0.01, "intel·lecte": +0.02, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: null
  },
  {
    id: "act_recollir_branques", name: "Recollir Fibres", is_base: true, zona: "Bosc",
    description: "Al bosc trobes escorces, branques flexibles i fibres que al camp escassegen. La base de tot cordill, mànec i cistell.",
    execute_cost: 0, output_resource: "branques", output_min: 2, output_max: 4,
    token_min: 1, token_max: 2,
    stat_key: "enginy", stat_gain: 0.05,
    inclination_deltas: { impuls: -0.02, "intel·lecte": +0.02, espiritualitat: 0, sociabilitat: +0.02 },
    event_pool_id: "pool_recollecta"
  },
  // act_preparar_eina retirat (D1, 2026-06-22): fabricar eines és exclusiu de branca; cap acció base universal en fa

  // FAMILY — zona Campament (cercar parella) i Llar (tenir fills, ensenyar)
  {
    id: "act_cercar_parella", name: "Cercar Parella", is_base: true, zona: "Campament",
    description: "Busques company/a entre els grups veïns. Sense parella no hi ha successió ni Llar.",
    minAge: 5, maxAge: 14,
    requires: [{ state: 'parella', max: 0 }],
    character_effect: { type: 'find_partner', failure_chance: 0.05 },
    token_min: 1, token_max: 2,
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
    token_min: 1, token_max: 3,
    stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_social"
  },
  {
    id: "act_ensenyar", name: "Ensenyar el Fill", is_base: true, zona: "Llar",
    description: "Transmets un dels teus aprenentatges (a l'atzar) a un fill que encara no n'hagi après cap; el rebrà en nàixer. Quan tots els fills ja han après, l'acció es deshabilita.",
    always_show_locked: true,
    minAge: 8,
    requires: [{ type: 'has_untaught_child' }, { type: 'has_any_aprenentatge' }],
    character_effect: { type: 'teach_child' },
    token_min: 1, token_max: 2,
    stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: -0.02, "intel·lecte": 0, espiritualitat: +0.03, sociabilitat: +0.05 },
    event_pool_id: "pool_familia"
  },

  // DISCOVERY
  {
    id: "act_escoltar_estrangers", name: "Escoltar els Estrangers", is_base: false, is_discovery_action: true, zona: "Campament",
    description: "Passes estona amb visitants d'un altre clan i n'aprens una tècnica nova (habilitat de branca). Cal una inclinació prou marcada cap a una branca: aquí es desbloquegen les habilitats.",
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
  // ── TdB 1 — Els Rastres del Món ──────────────────────────────────────────────
  {
    id: "act_caca_aguait", name: "Caça a l'Aguait", is_base: false, zona: "Planes",
    purchase_cost: 3, execute_cost: 0, output_resource: "food", output_min: 4, output_max: 8,
    side_effects: [{ resource: 'health', delta: -3 }],
    token_min: 2, token_max: 4, stat_key: "forca", stat_gain: 0.12,
    inclination_deltas: { impuls: +0.06, "intel·lecte": +0.02, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca",
    description: "Esperes immòbil on el rastre diu que passarà. La presa fa la feina per tu."
  },
  {
    id: "act_seguir_ramat", name: "Seguir el Ramat", is_base: false, zona: "Planes",
    purchase_cost: 3, execute_cost: 1, output_resource: "food", output_min: 2, output_max: 5,
    token_min: 3, token_max: 5, stat_key: "forca", stat_gain: 0.08,
    inclination_deltas: { impuls: +0.04, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca",
    description: "Camines dies rere les petjades. El ramat t'alimenta sense saber que existeixes."
  },
  {
    id: "act_mapa_verd", name: "El Mapa Verd", is_base: false, zona: "Bosc",
    purchase_cost: 3, execute_cost: 0, output_resource: "food", output_min: 3, output_max: 6,
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.05 },
    event_pool_id: "pool_recollecta",
    description: "Recordeu entre tots on madura cada fruit. El bosc deixa de tenir secrets."
  },
  {
    id: "act_collita_guiada", name: "Collita Guiada", is_base: false, zona: "Planes",
    is_upgrade: true, upgrades_action_id: "act_recollectar_arrels",
    purchase_cost: 3, execute_cost: 0, output_resource: "food", output_min: 2, output_max: 5,
    side_effects: [{ resource: 'branques', delta: 1 }],
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.08,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.02, espiritualitat: 0, sociabilitat: +0.04 },
    event_pool_id: "pool_recollecta",
    description: "Ja no caves a l'atzar: caves on la planta t'ho diu. I res no es llença."
  },
  {
    id: "act_llegir_veta", name: "Llegir la Veta", is_base: false, zona: "Planes",
    is_upgrade: true, upgrades_action_id: "act_recollectar_pedra",
    purchase_cost: 3, execute_cost: 0, output_resource: "pedra", output_min: 2, output_max: 4,
    token_min: 2, token_max: 4, stat_key: "enginy", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.05, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania",
    description: "Copeges la roca i escoltes. La que sona neta, trenca neta."
  },
  {
    id: "act_triar_fibra", name: "Triar la Fibra Justa", is_base: false, zona: "Bosc",
    purchase_cost: 3, execute_cost: 0, output_resource: "branques", output_min: 3, output_max: 5,
    token_min: 2, token_max: 4, stat_key: "enginy", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.04, espiritualitat: 0, sociabilitat: +0.02 },
    event_pool_id: "pool_artesania",
    description: "No totes les escorces serveixen. Les teves mans ja saben quina cedirà bé."
  },
  {
    id: "act_llegir_presagis", name: "Llegir els Presagis", is_base: false, zona: "Campament",
    purchase_cost: 3, execute_cost: 0, output_resource: "health", output_min: 3, output_max: 5,
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.06, sociabilitat: 0 },
    event_pool_id: "pool_ritual",
    description: "El fum s'inclina, l'ocell calla. Qui sap què vindrà, dorm més tranquil."
  },
  {
    id: "act_cami_ocells", name: "El Camí dels Ocells", is_base: false, zona: "Planes",
    purchase_cost: 3, execute_cost: 0, output_resource: "food", output_min: 2, output_max: 4,
    token_min: 3, token_max: 5, stat_key: "vincle", stat_gain: 0.08,
    inclination_deltas: { impuls: +0.02, "intel·lecte": 0, espiritualitat: +0.04, sociabilitat: 0 },
    event_pool_id: "pool_ritual",
    description: "Segueixes els ocells fins on ells mengen. Els esperits assenyalen amb ales."
  },

  // ── TdB 2 — La Pedra que Talla ────────────────────────────────────────────────
  {
    id: "act_esquarterar", name: "Esquarterar amb Vora", is_base: false, zona: "Planes",
    purchase_cost: 4, execute_cost: 0, output_resource: "food", output_min: 5, output_max: 9,
    side_effects: [{ resource: 'health', delta: -4 }, { resource: 'eina', delta: -1 }],
    token_min: 2, token_max: 4, stat_key: "forca", stat_gain: 0.15,
    inclination_deltas: { impuls: +0.05, "intel·lecte": +0.02, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca",
    description: "Amb tall, cap presa es desaprofita. La vora es gasta; la panxa, s'omple."
  },
  {
    id: "act_punta_crua", name: "La Punta Crua", is_base: false, zona: "Campament",
    purchase_cost: 3, execute_cost: 0, output_resource: "eina", output_min: 1, output_max: 1,
    side_effects: [{ resource: 'pedra', delta: -2 }],
    token_min: 2, token_max: 3, stat_key: "enginy", stat_gain: 0.10,
    inclination_deltas: { impuls: +0.02, "intel·lecte": +0.04, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania",
    description: "No és bonica ni durarà, però és teva i talla. El caçador no espera ningú."
  },
  {
    id: "act_pelar_escorca", name: "Pelar l'Escorça", is_base: false, zona: "Bosc",
    is_upgrade: true, upgrades_action_id: "act_recollir_branques",
    purchase_cost: 3, execute_cost: 0, output_resource: "branques", output_min: 4, output_max: 6,
    side_effects: [{ resource: 'pedra', delta: -1 }],
    token_min: 2, token_max: 4, stat_key: "enginy", stat_gain: 0.08,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.02, espiritualitat: 0, sociabilitat: +0.04 },
    event_pool_id: "pool_recollecta",
    description: "La vora llisca sota l'escorça i surt en tires llargues, senceres, dòcils."
  },
  {
    id: "act_partir_fruits", name: "Partir els Fruits Durs", is_base: false, zona: "Bosc",
    purchase_cost: 3, execute_cost: 0, output_resource: "food", output_min: 3, output_max: 5,
    side_effects: [{ resource: 'pedra', delta: -1 }],
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.08,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.04 },
    event_pool_id: "pool_recollecta",
    description: "El que abans es trencava a cops ara s'obre net. Dins hi havia menjar tot aquest temps."
  },
  {
    id: "act_tallar_ascles", name: "Tallar Ascles", is_base: false, zona: "Campament",
    purchase_cost: 4, execute_cost: 0, output_resource: "eina", output_min: 1, output_max: 1,
    side_effects: [{ resource: 'pedra', delta: -2 }],
    token_min: 2, token_max: 4, stat_key: "enginy", stat_gain: 0.20,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.06, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania",
    description: "Un cop precís i la pedra revela la vora que amagava. Has fet la teva primera eina."
  },
  {
    id: "act_bescanviar_ascles", name: "Bescanviar Ascles", is_base: false, zona: "Campament",
    purchase_cost: 3, execute_cost: 0, output_resource: "token", output_min: 4, output_max: 6,
    side_effects: [{ resource: 'eina', delta: -1 }],
    token_min: 0, token_max: 0, stat_key: "vincle", stat_gain: 0.08,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.03, espiritualitat: 0, sociabilitat: +0.03 },
    event_pool_id: "pool_artesania",
    description: "Tothom vol una vora i pocs saben fer-la. El teu ofici comença a tenir preu."
  },
  {
    id: "act_gravar_amulet", name: "Gravar un Amulet", is_base: false, zona: "Campament",
    purchase_cost: 4, execute_cost: 0, output_resource: "health", output_min: 4, output_max: 6,
    side_effects: [{ resource: 'pedra', delta: -1 }],
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.06, sociabilitat: 0 },
    event_pool_id: "pool_ritual",
    description: "Rasques el senyal a la pedra i la penges al coll. Qui la duu, camina protegit."
  },
  {
    id: "act_pedra_guardiana", name: "La Pedra Guardiana", is_base: false, zona: "Campament",
    purchase_cost: 3, execute_cost: 0, output_resource: "health", output_min: 2, output_max: 4,
    token_min: 2, token_max: 3, stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.04, sociabilitat: +0.02 },
    event_pool_id: "pool_ritual",
    description: "Una pedra dreta a l'entrada del campament. Els mals esperits no travessen el llindar."
  },

  // ── TdB 3 — El Cercle del Foc ─────────────────────────────────────────────────
  {
    id: "act_rostir_caca", name: "Rostir la Caça", is_base: false, zona: "Campament",
    purchase_cost: 4, execute_cost: 0, output_resource: "food", output_min: 4, output_max: 7,
    side_effects: [{ resource: 'health', delta: 2 }],
    token_min: 2, token_max: 3, stat_key: "enginy", stat_gain: 0.08,
    inclination_deltas: { impuls: +0.03, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.02 },
    event_pool_id: "pool_caca",
    description: "La carn al foc alimenta el doble i el clan s'hi asseu al voltant. Bon negoci."
  },
  {
    id: "act_foc_batuda", name: "La Batuda amb Foc", is_base: false, zona: "Planes",
    purchase_cost: 5, execute_cost: 1, output_resource: "food", output_min: 7, output_max: 12,
    side_effects: [{ resource: 'health', delta: -5 }],
    token_min: 3, token_max: 5, stat_key: "forca", stat_gain: 0.18,
    inclination_deltas: { impuls: +0.08, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca",
    description: "Cales foc a l'herba seca i corres amb les flames. El ramat fuig cap on tu vols."
  },
  {
    id: "act_pedres_bullir", name: "Bullir amb Pedres Roents", is_base: false, zona: "Campament",
    purchase_cost: 4, execute_cost: 0, output_resource: "food", output_min: 3, output_max: 6,
    side_effects: [{ resource: 'health', delta: 1 }, { resource: 'pedra', delta: -1 }],
    token_min: 2, token_max: 3, stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.04 },
    event_pool_id: "pool_recollecta",
    description: "Pedres roents dins l'aigua i les arrels dures es rendeixen. Tot es torna menjable."
  },
  {
    id: "act_cercle_vespre", name: "El Cercle del Vespre", is_base: false, zona: "Campament",
    purchase_cost: 3, execute_cost: 0, output_resource: "health", output_min: 3, output_max: 5,
    side_effects: [{ resource: 'food', delta: -1 }],
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.06 },
    event_pool_id: "pool_social",
    description: "Al voltant del foc, el clan comparteix el dia. Els cossos descansen; els llaços, creixen."
  },
  {
    id: "act_endurir_puntes", name: "Endurir Puntes al Foc", is_base: false, zona: "Campament",
    purchase_cost: 4, execute_cost: 0, output_resource: "eina", output_min: 1, output_max: 1,
    side_effects: [{ resource: 'branques', delta: -1 }, { resource: 'pedra', delta: -1 }],
    token_min: 2, token_max: 3, stat_key: "enginy", stat_gain: 0.18,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.05, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania",
    description: "La punta que passa per la brasa torna més dura que l'os. El foc també és eina."
  },
  {
    id: "act_dominar_brasa", name: "Dominar la Brasa", is_base: false, zona: "Campament",
    purchase_cost: 3, execute_cost: 0, output_resource: "food", output_min: 3, output_max: 5,
    side_effects: [{ resource: 'pedra', delta: -1 }],
    token_min: 2, token_max: 3, stat_key: "enginy", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.04, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania",
    description: "Sobre lloses roents, cous el que sigui sense cremar-ho. Precisió, no força."
  },
  {
    id: "act_vetlla_flames", name: "La Vetlla de les Flames", is_base: false, zona: "Campament",
    is_upgrade: true, upgrades_action_id: "act_contemplacio",
    purchase_cost: 4, execute_cost: 0, output_resource: "health", output_min: 5, output_max: 8,
    side_effects: [{ resource: 'food', delta: -1 }],
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.07, sociabilitat: 0 },
    event_pool_id: "pool_ritual",
    description: "Passes la nit parlant amb el foc. A l'alba, el cos pesa menys i els mals han fugit."
  },
  {
    id: "act_cendres_sagrades", name: "Les Cendres Sagrades", is_base: false, zona: "Campament",
    purchase_cost: 3, execute_cost: 0, output_resource: "health", output_min: 3, output_max: 5,
    token_min: 2, token_max: 3, stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.05, sociabilitat: 0 },
    event_pool_id: "pool_ritual",
    description: "La cendra del foc vetllat guareix ferides i marca la pell dels protegits."
  },

  // ── TdB 4 — La Nit Domada ─────────────────────────────────────────────────────
  {
    id: "act_aguait_nocturn", name: "Aguait Nocturn", is_base: false, zona: "Planes",
    purchase_cost: 5, execute_cost: 0, output_resource: "food", output_min: 6, output_max: 10,
    side_effects: [{ resource: 'health', delta: -6 }],
    token_min: 3, token_max: 5, stat_key: "forca", stat_gain: 0.18,
    inclination_deltas: { impuls: +0.08, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca",
    description: "Surts quan tothom torna. La foscor amaga la presa, però també t'amaga a tu."
  },
  {
    id: "act_torxa_persecucio", name: "Perseguir amb Torxa", is_base: false, zona: "Planes",
    purchase_cost: 4, execute_cost: 0, output_resource: "food", output_min: 5, output_max: 8,
    side_effects: [{ resource: 'health', delta: -4 }, { resource: 'branques', delta: -1 }],
    token_min: 3, token_max: 4, stat_key: "forca", stat_gain: 0.14,
    inclination_deltas: { impuls: +0.06, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca",
    description: "La flama enlluerna la presa i li roba la nit. Corre espantada cap al teu parany."
  },
  {
    id: "act_feina_llum", name: "Feina a la Llum", is_base: false, zona: "Campament",
    purchase_cost: 3, execute_cost: 0, output_resource: "branques", output_min: 3, output_max: 5,
    token_min: 3, token_max: 5, stat_key: "vincle", stat_gain: 0.08,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.02, espiritualitat: 0, sociabilitat: +0.04 },
    event_pool_id: "pool_artesania",
    description: "Mentre el clan dorm, les teves mans trenen. Cada nit, un cistell més."
  },
  {
    id: "act_vigilar_brases", name: "Vigilar les Brases", is_base: false, zona: "Campament",
    purchase_cost: 3, execute_cost: 0, output_resource: "health", output_min: 2, output_max: 4,
    token_min: 3, token_max: 4, stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.05 },
    event_pool_id: "pool_social",
    description: "Qui vetlla el foc del clan es guanya el respecte de tots. I dorm prop de l'escalfor."
  },
  {
    id: "act_taller_nocturn", name: "El Taller de Nit", is_base: false, zona: "Campament",
    purchase_cost: 4, execute_cost: 0, output_resource: "token", output_min: 4, output_max: 7,
    side_effects: [{ resource: 'pedra', delta: -1 }],
    token_min: 0, token_max: 0, stat_key: "enginy", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.05, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania",
    description: "Les hores que el sol no dona, el foc les presta. El teu ofici avança mentre tothom dorm."
  },
  {
    id: "act_reparar_vora", name: "Reparar a la Vora del Foc", is_base: false, zona: "Campament",
    purchase_cost: 3, execute_cost: 0, output_resource: "eina", output_min: 1, output_max: 1,
    side_effects: [{ resource: 'branques', delta: -1 }],
    token_min: 1, token_max: 2, stat_key: "enginy", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.04, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania",
    description: "L'eina esquerdada no es llença: es reviu. Manteniment barat per a mans pacients."
  },
  {
    id: "act_dansa_ombres", name: "La Dansa de les Ombres", is_base: false, zona: "Campament",
    purchase_cost: 4, execute_cost: 0, output_resource: "health", output_min: 4, output_max: 6,
    side_effects: [{ resource: 'food', delta: -1 }],
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.05, sociabilitat: +0.03 },
    event_pool_id: "pool_ritual",
    description: "Les ombres ballen a la paret quan tu balles davant del foc. El clan mira i sana."
  },
  {
    id: "act_somnis_guiats", name: "Els Somnis Guiats", is_base: false, zona: "Campament",
    purchase_cost: 3, execute_cost: 0, output_resource: "health", output_min: 3, output_max: 5,
    token_min: 3, token_max: 5, stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.06, sociabilitat: 0 },
    event_pool_id: "pool_ritual",
    description: "Abans de dormir, demanes el somni que vols. De vegades, els esperits l'envien."
  },

  // ── TdB 5 — La Mà que Transforma ──────────────────────────────────────────────
  {
    id: "act_llanca_emmanegada", name: "La Llança Emmanegada", is_base: false, zona: "Planes",
    is_upgrade: true, upgrades_action_id: "act_caca_llanca",
    purchase_cost: 5, execute_cost: 0, output_resource: "food", output_min: 6, output_max: 12,
    side_effects: [{ resource: 'health', delta: -6 }, { resource: 'eina', delta: -1 }],
    token_min: 3, token_max: 5, stat_key: "forca", stat_gain: 0.20,
    inclination_deltas: { impuls: +0.08, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca",
    description: "Punta, mànec i lligadura: la primera arma pensada. La presa cau abans d'olorar-te."
  },
  {
    id: "act_desollar_traca", name: "Desollar amb Traça", is_base: false, zona: "Planes",
    purchase_cost: 4, execute_cost: 0, output_resource: "food", output_min: 4, output_max: 7,
    side_effects: [{ resource: 'branques', delta: 1 }],
    token_min: 2, token_max: 4, stat_key: "forca", stat_gain: 0.12,
    inclination_deltas: { impuls: +0.04, "intel·lecte": +0.03, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca",
    description: "Carn, pell i tendons: ara res no es queda al terra. La presa sencera torna a casa."
  },
  {
    id: "act_basto_cavador", name: "El Bastó Cavador", is_base: false, zona: "Planes",
    is_upgrade: true, upgrades_action_id: "act_collita_guiada",
    purchase_cost: 4, execute_cost: 0, output_resource: "food", output_min: 4, output_max: 7,
    side_effects: [{ resource: 'eina', delta: -1 }],
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.05 },
    event_pool_id: "pool_recollecta",
    description: "El bastó entra on els dits no arriben. La terra cedeix les arrels sense discutir."
  },
  {
    id: "act_espremer_fruits", name: "Esprémer els Fruits", is_base: false, zona: "Bosc",
    purchase_cost: 4, execute_cost: 0, output_resource: "food", output_min: 3, output_max: 6,
    side_effects: [{ resource: 'health', delta: 1 }],
    token_min: 2, token_max: 4, stat_key: "enginy", stat_gain: 0.08,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.04 },
    event_pool_id: "pool_recollecta",
    description: "Entre dues pedres llises, el fruit dona fins a l'última gota. Dolçor que reconforta."
  },
  {
    id: "act_taller_percussio", name: "El Taller de Percussió", is_base: false, zona: "Campament",
    is_upgrade: true, upgrades_action_id: "act_tallar_ascles",
    purchase_cost: 5, execute_cost: 0, output_resource: "eina", output_min: 1, output_max: 1,
    side_effects: [{ resource: 'pedra', delta: -1 }, { resource: 'branques', delta: -1 }],
    token_min: 3, token_max: 4, stat_key: "enginy", stat_gain: 0.20,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.06, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania",
    description: "Percussor a la dreta, nucli a l'esquerra, mètode al cap. Cada cop és on ha de ser."
  },
  {
    id: "act_encarrecs", name: "Els Encàrrecs", is_base: false, zona: "Campament",
    purchase_cost: 4, execute_cost: 0, output_resource: "token", output_min: 5, output_max: 8,
    side_effects: [{ resource: 'eina', delta: -1 }],
    token_min: 0, token_max: 0, stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.04, espiritualitat: 0, sociabilitat: +0.03 },
    event_pool_id: "pool_artesania",
    description: "El clan fa cua davant del teu taller. Cada eina que surt de les teves mans té un preu."
  },
  {
    id: "act_basto_esperits", name: "El Bastó dels Esperits", is_base: false, zona: "Campament",
    purchase_cost: 5, execute_cost: 0, output_resource: "health", output_min: 6, output_max: 9,
    side_effects: [{ resource: 'eina', delta: -1 }, { resource: 'food', delta: -1 }],
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.08, sociabilitat: 0 },
    event_pool_id: "pool_ritual",
    description: "Alces el bastó coronat i el clan calla. Quan colpeja el terra, els mals marxen."
  },
  {
    id: "act_foragitar_pors", name: "Foragitar les Pors", is_base: false, zona: "Llar",
    purchase_cost: 4, execute_cost: 0, output_resource: "health", output_min: 4, output_max: 6,
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.05, sociabilitat: +0.03 },
    event_pool_id: "pool_familia",
    description: "T'asseus amb qui no dorm i li treus la por amb paraules i fum. La llar respira."
  },

  // ── TdB 6 — El Pes i la Palanca ───────────────────────────────────────────────
  {
    id: "act_fossa_parany", name: "La Fossa Parany", is_base: false, zona: "Planes",
    purchase_cost: 5, execute_cost: 1, output_resource: "food", output_min: 5, output_max: 10,
    side_effects: [{ resource: 'health', delta: -2 }],
    token_min: 3, token_max: 4, stat_key: "enginy", stat_gain: 0.12,
    inclination_deltas: { impuls: +0.05, "intel·lecte": +0.03, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca",
    description: "Caves, cobreixes, esperes. La presa cau pel seu propi pes. Tu només mires."
  },
  {
    id: "act_encerclar_presa", name: "Encerclar la Presa", is_base: false, zona: "Planes",
    purchase_cost: 4, execute_cost: 0, output_resource: "food", output_min: 4, output_max: 8,
    side_effects: [{ resource: 'health', delta: -3 }],
    token_min: 2, token_max: 4, stat_key: "forca", stat_gain: 0.12,
    inclination_deltas: { impuls: +0.05, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca",
    description: "L'empenys cap al barranc, pas a pas. El terreny és el teu segon caçador."
  },
  {
    id: "act_perxa_llarga", name: "La Perxa Llarga", is_base: false, zona: "Bosc",
    purchase_cost: 4, execute_cost: 0, output_resource: "food", output_min: 3, output_max: 6,
    side_effects: [{ resource: 'branques', delta: 1 }],
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.08,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.04 },
    event_pool_id: "pool_recollecta",
    description: "Els fruits de dalt de tot, els que ningú tocava, cauen ara a la teva falda."
  },
  {
    id: "act_arrossegar_troncs", name: "Arrossegar Troncs", is_base: false, zona: "Bosc",
    purchase_cost: 4, execute_cost: 0, output_resource: "branques", output_min: 4, output_max: 7,
    side_effects: [{ resource: 'health', delta: -2 }],
    token_min: 2, token_max: 4, stat_key: "forca", stat_gain: 0.10,
    inclination_deltas: { impuls: +0.02, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.03 },
    event_pool_id: "pool_recollecta",
    description: "Amb corrons i esforç compartit, el bosc sencer viatja fins al campament."
  },
  {
    id: "act_palanca_pedrera", name: "La Palanca de la Pedrera", is_base: false, zona: "Planes",
    is_upgrade: true, upgrades_action_id: "act_llegir_veta",
    purchase_cost: 4, execute_cost: 0, output_resource: "pedra", output_min: 3, output_max: 6,
    token_min: 2, token_max: 4, stat_key: "enginy", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.05, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania",
    description: "Falques el tronc, carregues el pes, i la llosa es desprèn. La muntanya negocia."
  },
  {
    id: "act_llosa_llar", name: "Alçar la Llosa de la Llar", is_base: false, zona: "Campament",
    purchase_cost: 4, execute_cost: 0, output_resource: "health", output_min: 2, output_max: 4,
    side_effects: [{ resource: 'pedra', delta: -2 }],
    token_min: 4, token_max: 6, stat_key: "enginy", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.04, espiritualitat: 0, sociabilitat: +0.02 },
    event_pool_id: "pool_artesania",
    description: "Una llosa ben posada al centre del campament: taula, altar i orgull de l'ofici."
  },
  {
    id: "act_pedra_dreta", name: "Dreçar la Pedra", is_base: false, zona: "Campament",
    purchase_cost: 5, execute_cost: 0, output_resource: "health", output_min: 3, output_max: 5,
    side_effects: [{ resource: 'pedra', delta: -2 }],
    token_min: 4, token_max: 6, stat_key: "vincle", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.06, sociabilitat: +0.02 },
    event_pool_id: "pool_ritual",
    description: "El clan sencer estira les cordes i la pedra s'alça. Ara el cel sap que hi sou."
  },
  {
    id: "act_ofrena_feixuga", name: "Portar l'Ofrena Feixuga", is_base: false, zona: "Planes",
    purchase_cost: 4, execute_cost: 0, output_resource: "health", output_min: 4, output_max: 6,
    side_effects: [{ resource: 'food', delta: -1 }],
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.05, sociabilitat: 0 },
    event_pool_id: "pool_ritual",
    description: "Portes l'ofrena fins al lloc alt, pas a pas. El cansament és part del pagament."
  },

  // ── TdB 7 — Els Símbols a la Pedra ───────────────────────────────────────────
  {
    id: "act_marcar_territori", name: "Marcar el Territori", is_base: false, zona: "Planes",
    purchase_cost: 5, execute_cost: 0, output_resource: "food", output_min: 5, output_max: 9,
    token_min: 3, token_max: 5, stat_key: "forca", stat_gain: 0.12,
    inclination_deltas: { impuls: +0.05, "intel·lecte": 0, espiritualitat: +0.02, sociabilitat: 0 },
    event_pool_id: "pool_caca",
    description: "Els teus senyals a les roques guarden els millors llocs de caça. Ningú més no hi va."
  },
  {
    id: "act_mural_gesta", name: "El Mural de la Gesta", is_base: false, zona: "Campament",
    purchase_cost: 4, execute_cost: 0, output_resource: "token", output_min: 5, output_max: 8,
    side_effects: [{ resource: 'pedra', delta: -1 }],
    token_min: 0, token_max: 0, stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: +0.03, "intel·lecte": 0, espiritualitat: +0.04, sociabilitat: 0 },
    event_pool_id: "pool_artesania",
    description: "Pintes la cacera a la paret. Cada visitant que la mira fa créixer el teu nom."
  },
  {
    id: "act_senyals_cami", name: "Senyals al Camí", is_base: false, zona: "Bosc",
    purchase_cost: 5, execute_cost: 0, output_resource: "food", output_min: 4, output_max: 7,
    token_min: 3, token_max: 4, stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.05 },
    event_pool_id: "pool_recollecta",
    description: "Les osques als troncs guien el clan als llocs bons. Ningú no es perd; res no es perd."
  },
  {
    id: "act_comptar_osques", name: "Comptar amb Osques", is_base: false, zona: "Campament",
    purchase_cost: 4, execute_cost: 0, output_resource: "token", output_min: 4, output_max: 7,
    token_min: 0, token_max: 0, stat_key: "enginy", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.04, espiritualitat: 0, sociabilitat: +0.03 },
    event_pool_id: "pool_artesania",
    description: "Una osca per cistell, una ratlla per lluna. El clan comença a saber quant té."
  },
  {
    id: "act_gravar_patrons", name: "Gravar Patrons", is_base: false, zona: "Campament",
    is_upgrade: true, upgrades_action_id: "act_endurir_puntes",
    purchase_cost: 4, execute_cost: 0, output_resource: "eina", output_min: 1, output_max: 1,
    side_effects: [{ resource: 'pedra', delta: -1 }],
    token_min: 2, token_max: 3, stat_key: "enginy", stat_gain: 0.18,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.06, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania",
    description: "El patró no és adorn: és mesura i mètode. Les teves eines ja es reconeixen de lluny."
  },
  {
    id: "act_pedres_bescanvi", name: "Pedres de Bescanvi", is_base: false, zona: "Campament",
    purchase_cost: 5, execute_cost: 0, output_resource: "token", output_min: 6, output_max: 9,
    side_effects: [{ resource: 'pedra', delta: -2 }],
    token_min: 0, token_max: 0, stat_key: "vincle", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.04, espiritualitat: 0, sociabilitat: +0.03 },
    event_pool_id: "pool_artesania",
    description: "Pedres gravades amb el teu senyal: tothom sap qui les fa i tothom en vol una."
  },
  {
    id: "act_pintar_esperits", name: "Pintar els Esperits", is_base: false, zona: "Campament",
    purchase_cost: 5, execute_cost: 0, output_resource: "health", output_min: 6, output_max: 10,
    side_effects: [{ resource: 'food', delta: -2 }],
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.18,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.08, sociabilitat: 0 },
    event_pool_id: "pool_ritual",
    description: "L'esperit pintat a la roca vetlla el clan dia i nit. La paret sencera protegeix."
  },
  {
    id: "act_ocre_sagrat", name: "L'Ocre Sagrat", is_base: false, zona: "Bosc",
    purchase_cost: 4, execute_cost: 0, output_resource: "health", output_min: 4, output_max: 6,
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.06, sociabilitat: 0 },
    event_pool_id: "pool_ritual",
    description: "Vas al bosc a buscar la terra roja. Qui es pinta amb ocre duu la vida a la pell."
  },

  // ── TdB 8 — La Veu que Perdura ────────────────────────────────────────────────
  {
    id: "act_relat_gesta", name: "El Relat de la Gesta", is_base: false, zona: "Campament",
    purchase_cost: 4, execute_cost: 0, output_resource: "token", output_min: 5, output_max: 8,
    side_effects: [{ resource: 'health', delta: 1 }],
    token_min: 0, token_max: 0, stat_key: "vincle", stat_gain: 0.12,
    inclination_deltas: { impuls: +0.03, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.04 },
    event_pool_id: "pool_social",
    description: "Expliques la cacera i creixes amb cada paraula. El clan escolta; el nom, s'escampa."
  },
  {
    id: "act_crits_caca", name: "Els Crits de Caça", is_base: false, zona: "Planes",
    purchase_cost: 5, execute_cost: 0, output_resource: "food", output_min: 5, output_max: 9,
    side_effects: [{ resource: 'health', delta: -3 }],
    token_min: 3, token_max: 4, stat_key: "forca", stat_gain: 0.14,
    inclination_deltas: { impuls: +0.06, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.02 },
    event_pool_id: "pool_caca",
    description: "Cada crit té un significat: ara, aquí, encercla. La colla caça com un sol cos."
  },
  {
    id: "act_canco_collita", name: "La Cançó de la Collita", is_base: false, zona: "Campament",
    purchase_cost: 4, execute_cost: 0, output_resource: "food", output_min: 3, output_max: 6,
    token_min: 3, token_max: 5, stat_key: "vincle", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.06 },
    event_pool_id: "pool_recollecta",
    description: "La cançó diu quan madura cada cosa. Qui la canta, mai no torna de buit."
  },
  {
    id: "act_veus_bosc", name: "Les Veus del Bosc", is_base: false, zona: "Bosc",
    purchase_cost: 4, execute_cost: 0, output_resource: "branques", output_min: 4, output_max: 7,
    side_effects: [{ resource: 'health', delta: 1 }],
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.05 },
    event_pool_id: "pool_recollecta",
    description: "Treballeu cantant, a torns de veu. Les mans no es cansen si la cançó no s'atura."
  },
  {
    id: "act_nom_eines", name: "Donar Nom a les Eines", is_base: false, zona: "Campament",
    purchase_cost: 4, execute_cost: 0, output_resource: "token", output_min: 4, output_max: 7,
    token_min: 0, token_max: 0, stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.05, espiritualitat: 0, sociabilitat: +0.02 },
    event_pool_id: "pool_artesania",
    description: "L'eina amb nom té història, i la història té valor. El teu taller ja té llegenda."
  },
  {
    id: "act_memoria_ofici", name: "La Memòria de l'Ofici", is_base: false, zona: "Llar",
    purchase_cost: 4, execute_cost: 0, output_resource: "token", output_min: 4, output_max: 6,
    side_effects: [{ resource: 'health', delta: 1 }],
    token_min: 0, token_max: 0, stat_key: "vincle", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.04, espiritualitat: 0, sociabilitat: +0.03 },
    event_pool_id: "pool_familia",
    description: "Cantes el mètode al fill mentre treballes: cop, gir, cop. L'ofici ja no morirà amb tu."
  },
  {
    id: "act_cant_ancestres", name: "El Cant dels Ancestres", is_base: false, zona: "Llar",
    purchase_cost: 5, execute_cost: 0, output_resource: "health", output_min: 5, output_max: 8,
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.18,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.07, sociabilitat: 0 },
    event_pool_id: "pool_familia",
    description: "Cantes els noms dels que ja no hi són, i la llar s'omple de presències que curen."
  },
  {
    id: "act_lletania_clan", name: "La Lletania del Clan", is_base: false, zona: "Campament",
    purchase_cost: 4, execute_cost: 0, output_resource: "health", output_min: 4, output_max: 6,
    side_effects: [{ resource: 'food', delta: -1 }],
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.05, sociabilitat: +0.03 },
    event_pool_id: "pool_ritual",
    description: "Tot el clan repeteix les paraules velles alhora. Cent veus, un sol cos que sana."
  },

  // ── TdB 9 — La Segona Pell ────────────────────────────────────────────────────
  {
    id: "act_adobar_pell", name: "Adobar la Pell", is_base: false, zona: "Campament",
    purchase_cost: 4, execute_cost: 0, output_resource: "health", output_min: 4, output_max: 6,
    side_effects: [{ resource: 'food', delta: -1 }],
    token_min: 2, token_max: 4, stat_key: "enginy", stat_gain: 0.10,
    inclination_deltas: { impuls: +0.03, "intel·lecte": +0.03, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania",
    description: "Rasques, estires, untes. La pell de la presa vençuda ara et guarda del fred."
  },
  {
    id: "act_caca_hivern", name: "La Caça d'Hivern", is_base: false, zona: "Planes",
    purchase_cost: 5, execute_cost: 0, output_resource: "food", output_min: 7, output_max: 12,
    side_effects: [{ resource: 'health', delta: -4 }],
    token_min: 3, token_max: 5, stat_key: "forca", stat_gain: 0.18,
    inclination_deltas: { impuls: +0.07, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca",
    description: "La neu delata cada petjada i tu ja no tens fred. L'hivern és el teu aliat nou."
  },
  {
    id: "act_capes_trenades", name: "Capes de Fibra Trenada", is_base: false, zona: "Campament",
    purchase_cost: 4, execute_cost: 0, output_resource: "health", output_min: 3, output_max: 5,
    side_effects: [{ resource: 'branques', delta: -2 }],
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.05 },
    event_pool_id: "pool_artesania",
    description: "Capa sobre capa de fibra trenada. El clan sencer vesteix el treball de les teves mans."
  },
  {
    id: "act_collir_fred", name: "Collir sota el Fred", is_base: false, zona: "Bosc",
    purchase_cost: 5, execute_cost: 0, output_resource: "food", output_min: 5, output_max: 8,
    side_effects: [{ resource: 'branques', delta: -1 }],
    token_min: 3, token_max: 4, stat_key: "vincle", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.05 },
    event_pool_id: "pool_recollecta",
    description: "Abrigat, arribes on abans no arribaves: baies tardanes, arrels d'hivern, bosc buit de rivals."
  },
  {
    id: "act_agulla_os", name: "L'Agulla d'Os", is_base: false, zona: "Campament",
    purchase_cost: 4, execute_cost: 0, output_resource: "eina", output_min: 1, output_max: 1,
    side_effects: [{ resource: 'branques', delta: -2 }],
    token_min: 2, token_max: 3, stat_key: "enginy", stat_gain: 0.18,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.06, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania",
    description: "Un os polit amb un ull al capdamunt. L'eina més petita que has fet, i la que més canvia."
  },
  {
    id: "act_vestits_bescanvi", name: "Vestits de Bescanvi", is_base: false, zona: "Campament",
    purchase_cost: 5, execute_cost: 0, output_resource: "token", output_min: 6, output_max: 10,
    side_effects: [{ resource: 'branques', delta: -2 }, { resource: 'eina', delta: -1 }],
    token_min: 0, token_max: 0, stat_key: "vincle", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.04, espiritualitat: 0, sociabilitat: +0.03 },
    event_pool_id: "pool_artesania",
    description: "Els teus vestits cosits viatgen més lluny que tu. Tothom vol dur la teva feina."
  },
  {
    id: "act_mantell_ritual", name: "El Mantell Ritual", is_base: false, zona: "Campament",
    purchase_cost: 5, execute_cost: 0, output_resource: "health", output_min: 6, output_max: 9,
    side_effects: [{ resource: 'branques', delta: -2 }, { resource: 'food', delta: -1 }],
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.08, sociabilitat: 0 },
    event_pool_id: "pool_ritual",
    description: "Quan et poses el mantell, ja no ets tu qui parla. El clan ho sap i escolta."
  },
  {
    id: "act_embolcallar_nadons", name: "Embolcallar els Nadons", is_base: false, zona: "Llar",
    purchase_cost: 4, execute_cost: 0, output_resource: "health", output_min: 4, output_max: 6,
    side_effects: [{ resource: 'branques', delta: -1 }],
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.05, sociabilitat: +0.03 },
    event_pool_id: "pool_familia",
    description: "Cada nadó embolcallat amb el senyal del clan. Els esperits sabran de qui és fill."
  },

  // ── TdB 10 — El Camí Llarg ────────────────────────────────────────────────────
  {
    id: "act_expedicio", name: "L'Expedició", is_base: false, zona: "Planes",
    purchase_cost: 6, execute_cost: 1, output_resource: "food", output_min: 8, output_max: 14,
    side_effects: [{ resource: 'health', delta: -8 }],
    token_min: 3, token_max: 5, stat_key: "forca", stat_gain: 0.20,
    inclination_deltas: { impuls: +0.08, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca",
    description: "Tres dies de camí fins on els ramats no coneixen la por. Tornes carregat o no tornes."
  },
  {
    id: "act_obrir_cami", name: "Obrir Camí", is_base: false, zona: "Planes",
    purchase_cost: 5, execute_cost: 0, output_resource: "food", output_min: 5, output_max: 8,
    side_effects: [{ resource: 'health', delta: -3 }],
    token_min: 4, token_max: 6, stat_key: "forca", stat_gain: 0.14,
    inclination_deltas: { impuls: +0.05, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.02 },
    event_pool_id: "pool_caca",
    description: "Vas al davant, marcant el pas i el perill. El clan et segueix; el mèrit és teu."
  },
  {
    id: "act_intercanvi_llunya", name: "L'Intercanvi Llunyà", is_base: false, zona: "Planes",
    purchase_cost: 5, execute_cost: 0, output_resource: "token", output_min: 6, output_max: 10,
    side_effects: [{ resource: 'food', delta: -2 }],
    token_min: 0, token_max: 0, stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.07 },
    event_pool_id: "pool_social",
    description: "Carregues el que sobra i tornes amb el que falta. Els estranys ja et saluden pel nom."
  },
  {
    id: "act_rutes_fruita", name: "Les Rutes de la Fruita", is_base: false, zona: "Bosc",
    purchase_cost: 5, execute_cost: 1, output_resource: "food", output_min: 6, output_max: 9,
    token_min: 3, token_max: 4, stat_key: "vincle", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.05 },
    event_pool_id: "pool_recollecta",
    description: "Un circuit de dies per tots els llocs bons, en l'ordre just. La ruta és el tresor."
  },
  {
    id: "act_pedres_llunyanes", name: "Pedres de Lluny", is_base: false, zona: "Planes",
    purchase_cost: 5, execute_cost: 1, output_resource: "pedra", output_min: 4, output_max: 7,
    token_min: 2, token_max: 4, stat_key: "enginy", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.05, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania",
    description: "El sílex bo és a dues jornades. Hi vas, en tornes carregat, i el taller ho nota."
  },
  {
    id: "act_lligar_carregues", name: "Lligar les Càrregues", is_base: false, zona: "Planes",
    purchase_cost: 4, execute_cost: 0, output_resource: "pedra", output_min: 3, output_max: 5,
    side_effects: [{ resource: 'branques', delta: -1 }],
    token_min: 2, token_max: 4, stat_key: "enginy", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.04, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania",
    description: "Amb el farcell ben lligat a l'esquena, cada viatge porta el doble. Enginy pur."
  },
  {
    id: "act_pelegrinatge", name: "El Pelegrinatge", is_base: false, zona: "Bosc",
    purchase_cost: 6, execute_cost: 0, output_resource: "health", output_min: 7, output_max: 11,
    side_effects: [{ resource: 'food', delta: -3 }],
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.18,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.08, sociabilitat: 0 },
    event_pool_id: "pool_ritual",
    description: "Camines fins al lloc on l'invisible pesa. En tornes buidat de mals i ple de força."
  },
  {
    id: "act_terres_esperits", name: "Les Terres dels Esperits", is_base: false, zona: "Bosc",
    purchase_cost: 5, execute_cost: 1, output_resource: "health", output_min: 5, output_max: 8,
    token_min: 3, token_max: 5, stat_key: "vincle", stat_gain: 0.14,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.06, sociabilitat: 0 },
    event_pool_id: "pool_ritual",
    description: "Coneixes els llocs on cal aturar-se, callar i deixar alguna cosa. Ells ho retornen."
  },

  // ── TdB 11 — El Nus que Reté ──────────────────────────────────────────────────
  {
    id: "act_parar_llacos", name: "Parar Llaços", is_base: false, zona: "Planes",
    purchase_cost: 5, execute_cost: 0, output_resource: "food", output_min: 5, output_max: 9,
    side_effects: [{ resource: 'branques', delta: -2 }],
    token_min: 3, token_max: 4, stat_key: "enginy", stat_gain: 0.14,
    inclination_deltas: { impuls: +0.04, "intel·lecte": +0.03, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca",
    description: "Pares el llaç al pas del rastre i te'n vas. La presa es caça sola. Cap ferida, tota la carn."
  },
  {
    id: "act_xarxa_ocells", name: "La Xarxa d'Ocells", is_base: false, zona: "Planes",
    purchase_cost: 4, execute_cost: 0, output_resource: "food", output_min: 4, output_max: 7,
    side_effects: [{ resource: 'branques', delta: -1 }],
    token_min: 2, token_max: 4, stat_key: "enginy", stat_gain: 0.10,
    inclination_deltas: { impuls: +0.04, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca",
    description: "La xarxa alçada entre dos pals, al pas del vol baix. El cel també es pot collir."
  },
  {
    id: "act_xarxa_riu", name: "La Xarxa del Riu", is_base: false, zona: "Planes",
    purchase_cost: 5, execute_cost: 0, output_resource: "food", output_min: 5, output_max: 9,
    side_effects: [{ resource: 'branques', delta: -2 }],
    token_min: 3, token_max: 4, stat_key: "vincle", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.05 },
    event_pool_id: "pool_recollecta",
    description: "La calaix al riu al vespre; al matí, plena. El corrent treballa per al clan."
  },
  {
    id: "act_lligar_farcells", name: "Lligar Farcells", is_base: false, zona: "Bosc",
    purchase_cost: 4, execute_cost: 0, output_resource: "branques", output_min: 5, output_max: 8,
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.04 },
    event_pool_id: "pool_recollecta",
    description: "Amb corda, cada viatge al bosc porta el triple. Les esquenes ho agraeixen."
  },
  {
    id: "act_trenar_corda", name: "Trenar Cordam", is_base: false, zona: "Campament",
    purchase_cost: 3, execute_cost: 0, output_resource: "eina", output_min: 1, output_max: 1,
    side_effects: [{ resource: 'branques', delta: -3 }],
    token_min: 1, token_max: 2, stat_key: "enginy", stat_gain: 0.14,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.05, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania",
    description: "Tres cordills es tornen un; el que era herba ara aguanta el pes d'un home."
  },
  {
    id: "act_nusos_mesura", name: "Els Nusos de Mesura", is_base: false, zona: "Campament",
    purchase_cost: 5, execute_cost: 0, output_resource: "token", output_min: 5, output_max: 8,
    side_effects: [{ resource: 'branques', delta: -1 }],
    token_min: 0, token_max: 0, stat_key: "enginy", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.05, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania",
    description: "Una corda amb nusos a distàncies iguals: ara pots mesurar, comparar, cobrar just."
  },
  {
    id: "act_nusos_memoria", name: "Els Nusos de la Memòria", is_base: false, zona: "Campament",
    purchase_cost: 5, execute_cost: 0, output_resource: "token", output_min: 5, output_max: 8,
    side_effects: [{ resource: 'branques', delta: -1 }],
    token_min: 0, token_max: 0, stat_key: "vincle", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.02, espiritualitat: +0.05, sociabilitat: 0 },
    event_pool_id: "pool_ritual",
    description: "Cada nus, un nom; cada tram, una generació. El llinatge sencer cap en una corda."
  },
  {
    id: "act_lligar_mals", name: "Lligar els Mals", is_base: false, zona: "Campament",
    purchase_cost: 5, execute_cost: 0, output_resource: "health", output_min: 6, output_max: 9,
    side_effects: [{ resource: 'branques', delta: -2 }],
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.07, sociabilitat: 0 },
    event_pool_id: "pool_ritual",
    description: "Nuses el mal dins la corda i l'enterres lluny. El malalt es lleva lleuger."
  },

  // ── TdB 12 — Els Fils del Clan ────────────────────────────────────────────────
  {
    id: "act_cacera_conjunta", name: "La Cacera Conjunta", is_base: false, zona: "Planes",
    purchase_cost: 5, execute_cost: 0, output_resource: "food", output_min: 7, output_max: 12,
    side_effects: [{ resource: 'health', delta: -3 }],
    token_min: 4, token_max: 6, stat_key: "forca", stat_gain: 0.16,
    inclination_deltas: { impuls: +0.05, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.04 },
    event_pool_id: "pool_caca",
    description: "Deu llances, un sol pla. La presa gran cau i el risc es reparteix entre tots."
  },
  {
    id: "act_repartir_boti", name: "Repartir el Botí", is_base: false, zona: "Campament",
    purchase_cost: 5, execute_cost: 0, output_resource: "token", output_min: 6, output_max: 9,
    side_effects: [{ resource: 'food', delta: -2 }],
    token_min: 0, token_max: 0, stat_key: "vincle", stat_gain: 0.12,
    inclination_deltas: { impuls: +0.02, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.05 },
    event_pool_id: "pool_social",
    description: "Reparteixes les millors parts amb les teves mans. Qui dona la carn, mana al clan."
  },
  {
    id: "act_teixir_cercle", name: "Teixir en Cercle", is_base: false, zona: "Campament",
    purchase_cost: 5, execute_cost: 0, output_resource: "branques", output_min: 4, output_max: 7,
    side_effects: [{ resource: 'health', delta: 1 }],
    token_min: 3, token_max: 4, stat_key: "vincle", stat_gain: 0.14,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.06 },
    event_pool_id: "pool_social",
    description: "El cercle de teixidores parla, riu i produeix. La feina surt sola quan es fa en companyia."
  },
  {
    id: "act_taula_comuna", name: "La Taula Comuna", is_base: false, zona: "Campament",
    purchase_cost: 4, execute_cost: 0, output_resource: "health", output_min: 4, output_max: 6,
    side_effects: [{ resource: 'food', delta: -2 }],
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.06 },
    event_pool_id: "pool_social",
    description: "Tot el que hi ha, es posa al mig. Ningú menja sol; ningú passa gana sol."
  },
  {
    id: "act_aprenents", name: "Els Aprenents", is_base: false, zona: "Campament",
    purchase_cost: 5, execute_cost: 0, output_resource: "token", output_min: 5, output_max: 8,
    token_min: 0, token_max: 0, stat_key: "vincle", stat_gain: 0.14,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.04, espiritualitat: 0, sociabilitat: +0.04 },
    event_pool_id: "pool_artesania",
    description: "Quatre mans joves repeteixen els teus gestos. El taller produeix el doble i aprèn."
  },
  {
    id: "act_obrar_plegats", name: "Obrar Plegats", is_base: false, zona: "Campament",
    is_upgrade: true, upgrades_action_id: "act_taller_percussio",
    purchase_cost: 5, execute_cost: 0, output_resource: "eina", output_min: 1, output_max: 1,
    side_effects: [{ resource: 'pedra', delta: -1 }, { resource: 'branques', delta: -1 }],
    token_min: 3, token_max: 4, stat_key: "enginy", stat_gain: 0.18,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.05, espiritualitat: 0, sociabilitat: +0.02 },
    event_pool_id: "pool_artesania",
    description: "Un talla, l'altre poleix, el tercer lliga. La cadena de mans fa eines millors que cap mà sola."
  },
  {
    id: "act_ritu_pas", name: "El Ritu de Pas", is_base: false, zona: "Llar",
    purchase_cost: 5, execute_cost: 0, output_resource: "health", output_min: 5, output_max: 8,
    side_effects: [{ resource: 'food', delta: -2 }],
    token_min: 3, token_max: 5, stat_key: "vincle", stat_gain: 0.16,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.07, sociabilitat: +0.02 },
    event_pool_id: "pool_familia",
    description: "El jove entra nen al cercle i en surt membre del clan. Tots en sortiu més forts."
  },
  {
    id: "act_cercle_dol", name: "El Cercle del Dol", is_base: false, zona: "Campament",
    purchase_cost: 4, execute_cost: 0, output_resource: "health", output_min: 5, output_max: 7,
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.14,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.06, sociabilitat: +0.03 },
    event_pool_id: "pool_ritual",
    description: "Quan algú marxa, el clan es tanca en cercle i plora junt. El dolor compartit pesa la meitat."
  },

  // ── TdB 13 — El Vas que Guarda ────────────────────────────────────────────────
  {
    id: "act_greix_vas", name: "Greix al Vas", is_base: false, zona: "Campament",
    purchase_cost: 5, execute_cost: 0, output_resource: "food", output_min: 5, output_max: 8,
    side_effects: [{ resource: 'health', delta: 1 }],
    token_min: 2, token_max: 4, stat_key: "enginy", stat_gain: 0.10,
    inclination_deltas: { impuls: +0.03, "intel·lecte": +0.03, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania",
    description: "Fons el greix i el segelles dins el vas. L'hivern ja no fa tanta por."
  },
  {
    id: "act_provisions_caca", name: "Provisions de Caça", is_base: false, zona: "Planes",
    purchase_cost: 5, execute_cost: 0, output_resource: "food", output_min: 6, output_max: 10,
    side_effects: [{ resource: 'health', delta: -2 }],
    token_min: 3, token_max: 5, stat_key: "forca", stat_gain: 0.16,
    inclination_deltas: { impuls: +0.06, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca",
    description: "Surts amb el vas ple i tornes quan vols, no quan la gana mana. Caceres més llargues, preses millors."
  },
  {
    id: "act_gerres_gra", name: "Gerres de Gra", is_base: false, zona: "Campament",
    obsoletes_action_id: "act_pedres_bullir",
    purchase_cost: 5, execute_cost: 0, output_resource: "food", output_min: 6, output_max: 9,
    token_min: 3, token_max: 4, stat_key: "vincle", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.05 },
    event_pool_id: "pool_recollecta",
    description: "Files de gerres plenes a la vora de la llar. El clan compta l'abundància amb els dits."
  },
  {
    id: "act_aigua_guardada", name: "L'Aigua Guardada", is_base: false, zona: "Campament",
    purchase_cost: 4, execute_cost: 0, output_resource: "health", output_min: 4, output_max: 6,
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.02, espiritualitat: 0, sociabilitat: +0.04 },
    event_pool_id: "pool_recollecta",
    description: "Aigua neta al campament, sempre. Els vells i els nadons ho noten primer."
  },
  {
    id: "act_modelar_vasos", name: "Modelar Vasos", is_base: false, zona: "Campament",
    purchase_cost: 5, execute_cost: 0, output_resource: "token", output_min: 6, output_max: 10,
    side_effects: [{ resource: 'pedra', delta: -1 }],
    token_min: 0, token_max: 0, stat_key: "enginy", stat_gain: 0.16,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.06, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania",
    description: "Les teves mans donen forma al fang i el fang dona forma al teu prestigi."
  },
  {
    id: "act_segellar_vasos", name: "Segellar els Vasos", is_base: false, zona: "Campament",
    purchase_cost: 4, execute_cost: 0, output_resource: "food", output_min: 4, output_max: 6,
    side_effects: [{ resource: 'branques', delta: -1 }],
    token_min: 2, token_max: 3, stat_key: "enginy", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.04, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania",
    description: "Tapa de pell, corda i resina: el que entra al vas, no es fa malbé. Res no es llença."
  },
  {
    id: "act_vas_ofrenes", name: "El Vas de les Ofrenes", is_base: false, zona: "Campament",
    purchase_cost: 5, execute_cost: 0, output_resource: "health", output_min: 6, output_max: 9,
    side_effects: [{ resource: 'food', delta: -2 }],
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.15,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.07, sociabilitat: 0 },
    event_pool_id: "pool_ritual",
    description: "El vas sagrat rep la part dels esperits. Mentre sigui ple, el clan estarà protegit."
  },
  {
    id: "act_urna_ancestres", name: "L'Urna dels Ancestres", is_base: false, zona: "Campament",
    purchase_cost: 5, execute_cost: 0, output_resource: "health", output_min: 5, output_max: 8,
    side_effects: [{ resource: 'pedra', delta: -1 }],
    token_min: 3, token_max: 5, stat_key: "vincle", stat_gain: 0.14,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.07, sociabilitat: 0 },
    event_pool_id: "pool_ritual",
    description: "Les cendres dels avis reposen dins l'urna, al centre del campament. Ja no marxaran mai."
  },

  // ── TdB 14 — El Fang i el Forn ────────────────────────────────────────────────
  {
    id: "act_fumador", name: "El Fumador", is_base: false, zona: "Campament",
    is_upgrade: true, upgrades_action_id: "act_ahumar_carn",
    purchase_cost: 5, execute_cost: 0, output_resource: "food", output_min: 6, output_max: 9,
    token_min: 2, token_max: 4, stat_key: "enginy", stat_gain: 0.12,
    inclination_deltas: { impuls: +0.03, "intel·lecte": +0.03, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania",
    description: "El fum tancat amb la carn a dins: ni una brasa perduda, ni un tall florit."
  },
  {
    id: "act_coure_moll", name: "Coure el Moll de l'Os", is_base: false, zona: "Campament",
    purchase_cost: 5, execute_cost: 0, output_resource: "food", output_min: 5, output_max: 8,
    side_effects: [{ resource: 'health', delta: 2 }],
    token_min: 2, token_max: 3, stat_key: "enginy", stat_gain: 0.10,
    inclination_deltas: { impuls: +0.03, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania",
    description: "Els ossos que abans llençàveu bullen ara dins l'olla. El moll dona força als febles."
  },
  {
    id: "act_torrar_llavors", name: "Torrar les Llavors", is_base: false, zona: "Campament",
    purchase_cost: 5, execute_cost: 0, output_resource: "food", output_min: 5, output_max: 8,
    token_min: 3, token_max: 4, stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.05 },
    event_pool_id: "pool_recollecta",
    description: "Al forn suau, les llavors s'obren i perfumen el campament. Durar i agradar alhora."
  },
  {
    id: "act_olla_foc", name: "L'Olla al Foc", is_base: false, zona: "Campament",
    purchase_cost: 5, execute_cost: 0, output_resource: "food", output_min: 4, output_max: 7,
    side_effects: [{ resource: 'health', delta: 2 }],
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.05 },
    event_pool_id: "pool_recollecta",
    description: "L'olla bull sola mentre feu altra feina. El brou calent cura més que moltes paraules."
  },
  {
    id: "act_forn_terra", name: "El Forn de Terra", is_base: false, zona: "Campament",
    is_upgrade: true, upgrades_action_id: "act_obrar_plegats",
    purchase_cost: 6, execute_cost: 0, output_resource: "eina", output_min: 1, output_max: 1,
    side_effects: [{ resource: 'pedra', delta: -2 }],
    token_min: 3, token_max: 5, stat_key: "enginy", stat_gain: 0.20,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.07, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania",
    description: "El forn cou el fang, endureix la fusta i trempa la pedra. El taller definitiu de l'Era."
  },
  {
    id: "act_coure_fang", name: "Coure el Fang", is_base: false, zona: "Campament",
    purchase_cost: 5, execute_cost: 0, output_resource: "token", output_min: 7, output_max: 11,
    side_effects: [{ resource: 'pedra', delta: -1 }, { resource: 'branques', delta: -1 }],
    token_min: 0, token_max: 0, stat_key: "enginy", stat_gain: 0.14,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.05, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania",
    description: "Cada fornada surt amb el teu segell. Els clans veïns paguen bé pel fang tornat pedra."
  },
  {
    id: "act_figures_fang", name: "Figures de Fang", is_base: false, zona: "Campament",
    purchase_cost: 5, execute_cost: 0, output_resource: "health", output_min: 5, output_max: 8,
    token_min: 3, token_max: 5, stat_key: "vincle", stat_gain: 0.14,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.07, sociabilitat: 0 },
    event_pool_id: "pool_ritual",
    description: "Modeles l'esperit amb les mans i el forn el fa etern. La figura vetlla des de la llar."
  },
  {
    id: "act_forn_visions", name: "El Forn de les Visions", is_base: false, zona: "Campament",
    purchase_cost: 6, execute_cost: 0, output_resource: "health", output_min: 7, output_max: 10,
    side_effects: [{ resource: 'food', delta: -2 }],
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.16,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.08, sociabilitat: 0 },
    event_pool_id: "pool_ritual",
    description: "El fum d'herbes dins l'espai tancat obre portes. En surts havent vist; en surts curat."
  },

  // ── TdB 15 — La Llavor Confiada ───────────────────────────────────────────────
  {
    id: "act_atraure_ramat", name: "Atraure el Ramat", is_base: false, zona: "Planes",
    purchase_cost: 6, execute_cost: 0, output_resource: "food", output_min: 7, output_max: 12,
    side_effects: [{ resource: 'health', delta: -3 }],
    token_min: 3, token_max: 5, stat_key: "forca", stat_gain: 0.18,
    inclination_deltas: { impuls: +0.06, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca",
    description: "Deixes farratge on tu vols i el ramat s'acostuma a venir. La caça comença a ser cita."
  },
  {
    id: "act_tanca_bestiar", name: "La Tanca del Bestiar", is_base: false, zona: "Planes",
    purchase_cost: 6, execute_cost: 0, output_resource: "food", output_min: 6, output_max: 10,
    side_effects: [{ resource: 'branques', delta: -2 }],
    token_min: 3, token_max: 4, stat_key: "enginy", stat_gain: 0.14,
    inclination_deltas: { impuls: +0.04, "intel·lecte": +0.04, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca",
    description: "Pals i corda tanquen el que abans calia perseguir. La carn espera dreta al costat de casa."
  },
  {
    id: "act_hort_clan", name: "L'Hort del Clan", is_base: false, zona: "Campament",
    purchase_cost: 6, execute_cost: 1, output_resource: "food", output_min: 7, output_max: 11,
    token_min: 3, token_max: 5, stat_key: "vincle", stat_gain: 0.14,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.06 },
    event_pool_id: "pool_recollecta",
    description: "Els teus rengs verds al costat del campament. Cada matí, el clan es lleva més ric."
  },
  {
    id: "act_triar_llavors", name: "Triar les Llavors", is_base: false, zona: "Campament",
    purchase_cost: 5, execute_cost: 0, output_resource: "food", output_min: 5, output_max: 8,
    token_min: 3, token_max: 4, stat_key: "vincle", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.03, espiritualitat: 0, sociabilitat: +0.04 },
    event_pool_id: "pool_recollecta",
    description: "Guardes la llavor de la planta més grossa, any rere any. Les collites t'obeeixen a poc a poc."
  },
  {
    id: "act_aixada", name: "L'Aixada", is_base: false, zona: "Campament",
    purchase_cost: 5, execute_cost: 0, output_resource: "eina", output_min: 1, output_max: 1,
    side_effects: [{ resource: 'pedra', delta: -1 }, { resource: 'branques', delta: -1 }],
    token_min: 2, token_max: 3, stat_key: "enginy", stat_gain: 0.18,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.06, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania",
    description: "Fulla de pedra, mànec corbat: l'eina que obre la terra. El camp sencer depèn del teu taller."
  },
  {
    id: "act_obrir_solcs", name: "Obrir els Solcs", is_base: false, zona: "Planes",
    purchase_cost: 5, execute_cost: 0, output_resource: "food", output_min: 6, output_max: 9,
    side_effects: [{ resource: 'eina', delta: -1 }],
    token_min: 3, token_max: 4, stat_key: "forca", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.05, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania",
    description: "L'aixada mossega la terra en línies rectes. On passes tu, després hi creix menjar."
  },
  {
    id: "act_beneir_camps", name: "Beneir els Camps", is_base: false, zona: "Campament",
    purchase_cost: 5, execute_cost: 0, output_resource: "food", output_min: 4, output_max: 8,
    side_effects: [{ resource: 'health', delta: 2 }],
    token_min: 2, token_max: 4, stat_key: "vincle", stat_gain: 0.14,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.07, sociabilitat: 0 },
    event_pool_id: "pool_ritual",
    description: "Camines els solcs cantant i deixant ofrenes. La terra beneïda dona amb més ganes."
  },
  {
    id: "act_primera_espiga", name: "La Primera Espiga", is_base: false, zona: "Campament",
    purchase_cost: 6, execute_cost: 0, output_resource: "health", output_min: 6, output_max: 9,
    side_effects: [{ resource: 'food', delta: -2 }],
    token_min: 4, token_max: 6, stat_key: "vincle", stat_gain: 0.16,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.08, sociabilitat: 0 },
    event_pool_id: "pool_ritual",
    description: "La primera espiga de cada collita crema a l'altar. El clan celebra i el cel pren nota."
  },

  // ── TdB 16 — El Cicle de les Estacions ───────────────────────────────────────
  {
    id: "act_llegir_migracions", name: "Llegir les Migracions", is_base: false, zona: "Planes",
    obsoletes_action_id: "act_seguir_ramat",
    purchase_cost: 6, execute_cost: 0, output_resource: "food", output_min: 8, output_max: 13,
    side_effects: [{ resource: 'health', delta: -2 }],
    token_min: 3, token_max: 5, stat_key: "forca", stat_gain: 0.18,
    inclination_deltas: { impuls: +0.07, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca",
    description: "Saps on serà el ramat abans que el ramat ho decideixi. Ja no el segueixes: l'esperes."
  },
  {
    id: "act_darrera_cacera", name: "La Darrera Cacera", is_base: false, zona: "Planes",
    purchase_cost: 6, execute_cost: 1, output_resource: "food", output_min: 9, output_max: 15,
    side_effects: [{ resource: 'health', delta: -7 }, { resource: 'eina', delta: -1 }],
    token_min: 4, token_max: 6, stat_key: "forca", stat_gain: 0.20,
    inclination_deltas: { impuls: +0.08, "intel·lecte": 0, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_caca",
    description: "La presa més gran de la teva vida, al final de la temporada. La gesta que et sobreviurà."
  },
  {
    id: "act_calendari_collita", name: "El Calendari de la Collita", is_base: false, zona: "Campament",
    obsoletes_action_id: "act_canco_collita",
    purchase_cost: 6, execute_cost: 0, output_resource: "food", output_min: 7, output_max: 10,
    token_min: 3, token_max: 5, stat_key: "vincle", stat_gain: 0.14,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.06 },
    event_pool_id: "pool_recollecta",
    description: "Osques, cançons i llunes reunides en un sol saber. El clan menja tot l'any sense ensurt."
  },
  {
    id: "act_rebost_hivern", name: "El Rebost d'Hivern", is_base: false, zona: "Campament",
    purchase_cost: 5, execute_cost: 0, output_resource: "food", output_min: 6, output_max: 9,
    side_effects: [{ resource: 'health', delta: 1 }],
    token_min: 3, token_max: 4, stat_key: "vincle", stat_gain: 0.12,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.05 },
    event_pool_id: "pool_recollecta",
    description: "Gerres, farcells i carn fumada, comptats i endreçats abans del fred. Que vingui l'hivern."
  },
  {
    id: "act_eines_temps", name: "Les Eines de Cada Temps", is_base: false, zona: "Campament",
    purchase_cost: 6, execute_cost: 0, output_resource: "eina", output_min: 1, output_max: 1,
    side_effects: [{ resource: 'pedra', delta: -1 }],
    token_min: 4, token_max: 6, stat_key: "enginy", stat_gain: 0.18,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.06, espiritualitat: 0, sociabilitat: 0 },
    event_pool_id: "pool_artesania",
    description: "A l'hivern fas les eines de l'estiu; a l'estiu, les de l'hivern. El taller viu avançat a l'any."
  },
  {
    id: "act_llegat_taller", name: "El Llegat del Taller", is_base: false, zona: "Llar",
    purchase_cost: 6, execute_cost: 0, output_resource: "token", output_min: 7, output_max: 11,
    side_effects: [{ resource: 'eina', delta: -1 }],
    token_min: 0, token_max: 0, stat_key: "vincle", stat_gain: 0.16,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.05, espiritualitat: 0, sociabilitat: +0.03 },
    event_pool_id: "pool_familia",
    description: "Poses la teva millor eina a les mans del fill i li expliques per què és la millor. Això no té preu — o el té tot."
  },
  {
    id: "act_festa_solstici", name: "La Festa del Solstici", is_base: false, zona: "Campament",
    purchase_cost: 6, execute_cost: 0, output_resource: "health", output_min: 8, output_max: 12,
    side_effects: [{ resource: 'food', delta: -3 }],
    token_min: 3, token_max: 5, stat_key: "vincle", stat_gain: 0.20,
    inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.08, sociabilitat: 0 },
    event_pool_id: "pool_ritual",
    description: "El dia més llarg, el foc més gran, el clan sencer ballant. Tothom en surt renovat per dins."
  },
  {
    id: "act_roda_any", name: "La Roda de l'Any", is_base: false, zona: "Campament",
    purchase_cost: 6, execute_cost: 0, output_resource: "health", output_min: 6, output_max: 9,
    side_effects: [{ resource: 'food', delta: -2 }],
    token_min: 4, token_max: 6, stat_key: "vincle", stat_gain: 0.16,
    inclination_deltas: { impuls: 0, "intel·lecte": +0.02, espiritualitat: +0.07, sociabilitat: 0 },
    event_pool_id: "pool_ritual",
    description: "Un ritual per a cada frontissa de l'any. El clan ja no tem el temps: hi balla a dins."
  },

  // STANDALONES (no TdB — purchasables directes)
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
    purchase_cost: 5, execute_cost: 0,
    food_cap_delta: 2, max_executions: 2,
    token_min: 1, token_max: 2,
    stat_key: "enginy", stat_gain: 0.08,
    inclination_deltas: { impuls: -0.01, "intel·lecte": +0.02, espiritualitat: +0.01, sociabilitat: 0 },
    event_pool_id: "pool_artesania"
  },
  {
    id: "act_gran_ritual", name: "Gran Ritual", is_upgrade: true, upgrades_action_id: "act_ritual_foc", zona: "Campament",
    description: "El ritual s'extén a tota la nit. Cohesió màxima i regeneració profunda.",
    requires: [{ type: 'has_destresa', id: 'd_custodi_foc' }],
    purchase_cost: 6, execute_cost: 0, side_effects: [{ resource: 'health', delta: +10 }],
    stat_key: "vincle", stat_gain: 0.10,
    inclination_deltas: { impuls: -0.02, "intel·lecte": 0, espiritualitat: +0.06, sociabilitat: +0.05 },
    event_pool_id: "pool_ritual"
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
      discovery_skill_id: "tdb_01",
      text: "Mentre espies el ramat, veus un caçador d'un altre grup llançar una pedra amb un pal llarg. Abat la presa des d'una distància increïble.",
      options: [
        { text: "Apropar-te a observar (−2 Aliment)", food_delta: -2, discovers: true },
        { text: "Seguir el teu camí", food_delta: +2, discovers: false }
      ]
    },
    {
      id: "ev_desc_trampes", is_discovery_event: true, is_single_use: true,
      discovery_skill_id: "tdb_01",
      text: "Trobes un grup de recol·lectors que han deixat llaços de fibra vegetal en llocs de pas. Quan tornes, n'hi ha un de ple.",
      options: [
        { text: "Demanar-los que t'ensenyin (−2 Aliment)", food_delta: -2, discovers: true },
        { text: "Continuar amb la teva caça", food_delta: +2, discovers: false }
      ]
    },
    {
      id: "ev_desc_marques", is_discovery_event: true, is_single_use: true,
      discovery_skill_id: "tdb_10",
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
      discovery_skill_id: "tdb_02",
      text: "Recolles arrels prop d'un grup estranger. Una dona rasca una arrel amb un fragment de sílex molt fi que mai no havies vist — surt una polpa perfecta.",
      options: [
        { text: "Preguntar-li com ho fa (−2 Aliment)", food_delta: -2, discovers: true },
        { text: "Continuar amb la teva tècnica", food_delta: +2, discovers: false }
      ]
    },
    {
      id: "ev_desc_coneixement_plantes", is_discovery_event: true, is_single_use: true,
      discovery_skill_id: "tdb_04",
      text: "Un ancià del grup proper recol·lecta plantes amb una precisió inusual, triant-les una a una. Sembla que coneix cada fulla pel nom.",
      options: [
        { text: "Seguir-lo i aprendre (−2 Aliment)", food_delta: -2, discovers: true },
        { text: "Continuar recol·lectant pel teu compte", food_delta: +1, discovers: false }
      ]
    },
    {
      id: "ev_desc_llavor", is_discovery_event: true, is_single_use: true,
      discovery_skill_id: "tdb_15",
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
        { text: "Endinsar-m'hi directe, cos endavant",       food_delta: +3, health_delta: -1, discovers: false },
        { text: "Agafar una branca llarga i sacsejar",        food_delta: +1, discovers: false },
        { text: "Voltar fins a trobar un pas entre branques", food_delta: +2, health_delta: +1, discovers: false }
      ]
    }
  ],
  pool_artesania: [
    { id: "ev_eina_trencada", text: "L'eina es trenca durant la feina. Cal refer-la.", effects: { eina: -1 }, blocked_if: [{ type: "stat_min", stat: "enginy", min: 3.5 }] },
    { id: "ev_eina_trencada", text: "L'eina es trenca en plena feina i, en saltar, s'endú la pedra que treballaves.", effects: { eina: -1, pedra: -1 }, blocked_if: [{ type: "stat_min", stat: "enginy", min: 4.0 }] },
    { id: "ev_tecnica_nova",     text: "Un descobriment accidental millora la tècnica.",               effects: { food: +1 } },
    { id: "ev_intercanvi_eines", text: "Un grup veí demana eines a canvi de provisions.",              effects: { food: +2 } },
    {
      id: "ev_desc_agulla", is_discovery_event: true, is_single_use: true,
      discovery_skill_id: "tdb_09",
      text: "Mentre talles os, un fragment llarg i fi queda perfectament fi com una agulla. Un membre del grup el recull pensatiu: \"Amb un forat aquí, podríem cosir pells...\"",
      options: [
        { text: "Experimentar plegats (−2 Aliment)", food_delta: -2, discovers: true },
        { text: "Deixar-ho per a un altre moment", food_delta: +1, discovers: false }
      ]
    },
    {
      id: "ev_desc_buri", is_discovery_event: true, is_single_use: true,
      discovery_skill_id: "tdb_07",
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
        { text: "Forçar l'angle: aprofitar la fissura com a guia natural.", discovers: false },
        { text: "Canviar el tall: deixo que la pedra decideixi la forma.",  discovers: false },
        { text: "Descartar. Camino fins al jaç de sílex a cercar un bloc millor.", food_delta: -1, discovers: false }
      ]
    },
    {
      id: "ev_aprenent_observa",
      text: "Un infant s'ha aturat darrere meu i mira com treballo la pedra. No fa soroll. Observa on cau el rebuig i segueix el moviment de la meva mà. Podria deixar-lo quedar i anar explicant en veu baixa, fer-lo marxar ara i ensenyar-lo quan tingui temps, o donar-li els fragments petits perquè s'hi entreni.",
      options: [
        { text: "Deixar-lo quedar. Parlo mentre treballo, sense aturar-me.", discovers: false },
        { text: "Fer-lo marxar. Li diré que torni quan acabi aquesta peça.",  discovers: false },
        { text: "Donar-li el rebuig. Que aprengui amb els fragments que jo no vull.", health_delta: +1, discovers: false }
      ]
    },
    {
      id: "ev_fulla_prestada",
      text: "El company s'atura al costat meu i mostra la seva presa. Ha anat bé, però la seva fulla ha quedat embotida dins la bèstia i l'ha perduda. M'allarga la mà. La meva fulla és bona, però no en tinc cap altra avui. Decideixo ràpidament.",
      options: [
        { text: "Donar-li la meva fulla. Ell torna amb menjar per als dos.", food_delta: +2, discovers: false },
        { text: "Donar-li un fragment de rebuig. Serveix per netejar, si va amb compte.", food_delta: +1, discovers: false },
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
      discovery_skill_id: "tdb_03",
      text: "Durant el ritual, un vell crema certes herbes que mai no has vist. Olora diferent. Algú amb mal de ventre s'ha millorat, i ningú no entén per qué.",
      options: [
        { text: "Demanar-li que t'ho expliqui", food_delta: -2, discovers: true },
        { text: "Observar en silenci", food_delta: +1, discovers: false }
      ]
    },
    {
      id: "ev_desc_pintura", is_discovery_event: true, is_single_use: true,
      discovery_skill_id: "tdb_08",
      text: "En un moment de silenci prop d'una paret de roca, el foc projecta ombres que semblen animals movent-se. Per un instant, sents que podries fixar-les.",
      options: [
        { text: "Intentar dibuixar les formes amb fang", food_delta: -1, discovers: true },
        { text: "Guardar el moment per tu", food_delta: 0, discovers: false }
      ]
    },
    {
      id: "ev_desc_calendari", is_discovery_event: true, is_single_use: true,
      discovery_skill_id: "tdb_16",
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
        { text: "Enterrar-lo fondo. Posar-hi l'ocre i el cargol.", food_delta: 0, health_delta: +2, discovers: false },
        { text: "Cavar just el que cal. Cobrir-lo i continuar.",   food_delta: 0, health_delta:  0, discovers: false },
        { text: "Deixar-lo a l'aire. El vent i les bèsties fan la seva feina.", food_delta: 0, health_delta: -1, discovers: false }
      ]
    },
    {
      id: "ev_figura_venus",
      text: "Tens un tros d'ivori a les mans. La forma surt sola — corbes, volum, pes. El clan s'ha aturat a mirar. No sé si és jo qui la faig o ella que es deixa fer.",
      options: [
        { text: "Acabar-la i posar-la al centre del campament.", food_delta: 0, health_delta: +1, discovers: false },
        { text: "Acabar-la i guardar-la. Aquesta és meva.",       food_delta: 0, health_delta: +2, discovers: false },
        { text: "Colpejar el bloc fins que es trenqui.",          food_delta: 0, health_delta:  0, discovers: false }
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
        { text: "Deixar que ho faci el vell. Donar-li una ofrena.",        food_delta:  0, health_delta: +2, discovers: false }
      ]
    }
  ],
  pool_social: [
    { id: "ev_dispute_interna",  text: "Una disputa interna distreu el grup.",                       effects: { health: -2 } },
    { id: "ev_aliat_nou",        text: "Un grup veí ofereix col·laboració temporal.",               effects: { food: +2 } },
    { id: "ev_lider_respectat",  text: "El respecte augmenta. El grup treballa millor.",            effects: { health: +3 } },
    {
      id: "ev_desc_ornaments", is_discovery_event: true, is_single_use: true,
      discovery_skill_id: "tdb_12",
      text: "L'estranger que ha visitat el campament porta closques foradades lligades al coll. Tothom els mira. L'home somriu i te n'ofereix una.",
      options: [
        { text: "Acceptar-la i preguntar-li (−3 Aliment)", food_delta: -3, discovers: true },
        { text: "Agrair-ho però declinar", food_delta: +1, discovers: false }
      ]
    },
    {
      id: "ev_desc_domini_terra", is_discovery_event: true, is_single_use: true,
      discovery_skill_id: "tdb_10",
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
        { text: "Els acollim: dormen sota el meu sostre i mengen a la meva taula.", food_delta: -2, discovers: false },
        { text: "Proposo que el clan reparteixi la càrrega entre tots.",            food_delta: -1, discovers: false },
        { text: "Faig veure que no he vist res i continuo amb el meu treball.",     discovers: false }
      ]
    },
    {
      id: "ev_rancor_ancians",
      text: "Dos dels homes vells del clan s'han encarar a crits davant tothom. La disputa és per la queixalada millor d'un cérvol abatut ahir. Ningú s'atreveix a intervenir, però tots m'estan mirant.",
      options: [
        { text: "Prenc part pel que crec que té raó i li cedeixo el que li toca.", health_delta: +2, discovers: false },
        { text: "Proposo dividir la peça de manera que cap dels dos surti guanyador.", discovers: false },
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
        { text: "Contribueixo amb les meves provisions al ritual i m'assec prop de la família.", food_delta: -1, health_delta: +1, requires_children: true, discovers: false },
        { text: "Deixo una part de les meves provisions per ajudar a cobrir el ritual.", food_delta: -1, requires_no_children: true, discovers: false },
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
        { text: "Crido l'ancià del ritual. Que ell s'en faci càrrec.", food_delta: 0, health_delta: +1, discovers: false }
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
