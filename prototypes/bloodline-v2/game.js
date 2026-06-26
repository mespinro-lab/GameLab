// PROTOTYPE - NOT FOR PRODUCTION
// Visual: Life Tycoon UI shell — Bloodline mechanics
'use strict';

// ═══════════════════════════════════════════════════════════ ENGINE CONSTANTS
const INERTIA_FACTOR   = 2.0;
const BASE_LIFE_INC    = 1 / LIFE_EXPECTANCY; // per turn at healthy/young baseline
// FADE_MARGIN is defined in data.js

function agingFactor(age) {
  if (age <= 5)  return 1.0;
  if (age <= 10) return 1.2;
  return 1.5;
}
function healthPenalty(health) {
  if (health >= 30) return 1.0;
  if (health >= 15) return 1.3;
  return 1.8;
}
function lifeIncPerTurn() {
  return BASE_LIFE_INC * agingFactor(characterAge()) * healthPenalty(state.health);
}

// ═══════════════════════════════════════════════════════════ DERIVED LOOKUPS
const AXES        = AXIS_DEFS.map(a => a.id);
const AXIS_LABELS = Object.fromEntries(AXIS_DEFS.map(a => [a.id, { left: a.left, right: a.right }]));

// ═══════════════════════════════════════════════════════════ BRANCH SYSTEM
// Each branch maps 1:1 to its primary axis. Activation threshold = 34% of normalized total.
const BRANCH_ACTIVATION_PCT = 0.34;
const BRANCH_AXIS = {
  'branch_hunter':   'impuls',
  'branch_gatherer': 'sociabilitat',
  'branch_craftsman': 'intel·lecte',
  'branch_mystic':   'espiritualitat',
};

function getBranchPct() {
  const inc = state.character.inclination;
  const vals = {};
  let total = 0;
  for (const ax of AXES) {
    vals[ax] = Math.max(0, inc[ax] ?? 0);
    total += vals[ax];
  }
  if (total === 0) return Object.fromEntries(AXES.map(a => [a, 0.25]));
  return Object.fromEntries(AXES.map(a => [a, vals[a] / total]));
}

// ═══════════════════════════════════════════════════════════ ZONE MAP CONFIG
const ZONE_POS = {
  'Planes':    { left: 79, top: 52 },
  'Bosc':      { left: 18, top: 60 },
  'Mercat':    { left: 53, top: 66 },
  'Campament': { left: 76, top: 76 },
  'Llar':      { left: 30, top: 78 },
};
const ZONE_IMG = {
  'Campament': 'HOME',
  'Planes':    'WILD',
  'Bosc':      'FOREST',
  'Llar':      'HOME',
};
const ZONE_ICONS = {
  'Campament': '🏕️',
  'Planes':    '🌾',
  'Bosc':      '🌲',
  'Llar':      '🏠',
  'Mercat':    '🏪',
};

// ═══════════════════════════════════════════════════════════ ACTION ICONS
const ACTION_ICONS = {
  act_espiar_ramat:         '👁️',
  act_recollectar_arrels:   '🌿',
  act_tallar_pedra:         '🪨',
  act_ritual_foc:           '🔥',
  act_assecar_provisions:   '🥩',
  act_contemplacio:       '🌙',
  act_vigilar_campament:  '🛡️',
  act_explorar_voltants:  '🧭',
  act_recollectar_pedra:  '🗿',
  act_preparar_eina:      '⚒️',
  act_cercar_parella:     '💕',
  act_tenir_fills:        '👶',
  act_ensenyar:           '📖',
  act_escoltar_estrangers:'👥',
  act_caca_llanca:        '🏹',
  act_emboscada_nocturna: '🌑',
  act_marcar_territori:   '⛰️',
  act_rastreig_rutes:     '🦶',
  act_molda_grans:        '🌾',
  act_parar_trampes:      '🪤',
  act_revisar_trampes:    '🔍',
  act_faonar_eines:       '⚒️',
  act_gravar_os:          '🦴',
  act_intercanviar_eines: '🤝',
  act_cosir_pells:        '🧵',
  act_construir_refugi:   '🏗️',
  act_curar_herbes:       '🌱',
  act_preparar_ungüent:   '💊',
  act_pintar_parets:      '🎨',
  act_narrar_llegendes:   '📜',
  act_ornamentar_se:      '✨',
  act_consagrar_ornaments:'🌟',
  act_recollida_bolets:   '🍄',
  act_assecament_plantes: '🍃',
  act_seleccionar_llavors:'🌰',
  act_preparar_terreny:   '⛏️',
  act_observar_cel:       '🌌',
  act_transit_nocturn:    '🌃',
  act_gran_ritual:        '🔮',
  act_defensa_activa:     '⚔️',
  act_aguait_coordinat:   '🎯',
  act_recollecta_metodica:'🌿',
  act_talla_avancada:     '💎',
  act_recollecta_avancada:'🌾',
  act_control_territori:  '🗺️',
  act_negociar_pastures:  '🕊️',
};
function statGainTriangles(gain) {
  if (!gain) return { text: '', neg: false };
  const abs = Math.abs(gain);
  const n = abs >= 0.15 ? 3 : abs >= 0.10 ? 2 : 1;
  return { text: (gain < 0 ? '▼' : '▲').repeat(n), neg: gain < 0 };
}
function getActionIcon(action) {
  return ACTION_ICONS[action.id] ||
    (action.output_resource === 'material' ? '🔵' :
     action.output_resource === 'health'   ? '💊' : '🌾');
}

// ═══════════════════════════════════════════════════════════ DOM HELPERS
function el(id) { return document.getElementById(id); }
function show(id) { const e = el(id); if (e) e.classList.remove('hidden'); }
function hide(id) { const e = el(id); if (e) e.classList.add('hidden'); }

// ═══════════════════════════════════════════════════════════ GAME STATE
let state = null;

// ═══════════════════════════════════════════════════════════ SAVE / LOAD
const SAVE_KEY = 'bloodline_v2_save';

function saveGame() {
  if (!state) return;
  try {
    const d = {
      dynastyName: state.dynastyName, race: state.race, gender: state.gender,
      cycle: state.cycle, generation: state.generation,
      food: state.food, health: state.health, material: state.material, pedra: state.pedra || 0, eina: state.eina || 0, branques: state.branques || 0,
      character: {
        birthCycle: state.character.birthCycle, label: state.character.label,
        inclination: { ...state.character.inclination },
        purchasedActionIds:  [...state.character.purchasedActionIds],
        unlockedSkillIds:    [...state.character.unlockedSkillIds],
        stats:    { ...state.character.stats },
        destreses:           [...state.character.destreses],
        aprenentatges:       [...(state.character.aprenentatges || [])],
        charState: { ...state.character.charState },
        actionUseCounts: { ...state.character.actionUseCounts },
        partnerName: state.character.partnerName || null,
        children: state.character.children,
      },
      discoveredUniversalTechIds: [...state.discoveredUniversalTechIds],
      discoveredZoneIds:          [...state.discoveredZoneIds],
      firedSingleUseEventIds:     [...state.firedSingleUseEventIds],
      recentEventIds:             state.recentEventIds || [],
      eventStats: state.eventStats || { positive: 0, negative: 0, neutral: 0 },
      log: state.log,
      turnHistory: state.turnHistory || [],
      genealogy: state.genealogy,
      siblingPool: state.siblingPool.map(s => ({
        ...s,
        inheritedPurchased:      [...(s.inheritedPurchased      || [])],
        inheritedSkills:         [...(s.inheritedSkills         || [])],
        inheritedDestreses:      [...(s.inheritedDestreses      || [])],
        inheritedAprenentatges:  [...(s.inheritedAprenentatges  || [])],
      })),
      nextGenHealthMax: state.nextGenHealthMax,
      currentHealthMax: state.currentHealthMax,
      explorationAttempts: state.explorationAttempts || 0,
      foodUpkeepReduction: state.foodUpkeepReduction || 0,
      foodMax: state.foodMax ?? FOOD_MAX_START,
      lifeProgress: state.lifeProgress || 0,
      gameOver: state.gameOver, gameOverReason: state.gameOverReason,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(d));
  } catch (e) { console.warn('[Save] write failed', e); }
}

function hasSave() { return !!localStorage.getItem(SAVE_KEY); }
function clearSave() { localStorage.removeItem(SAVE_KEY); }

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  try {
    const d = JSON.parse(raw);
    state = {
      dynastyName: d.dynastyName, race: d.race, gender: d.gender,
      cycle: d.cycle, generation: d.generation,
      food: d.food, health: d.health, material: d.material, pedra: d.pedra || 0, eina: d.eina || 0, branques: d.branques || 0,
      character: {
        birthCycle: d.character.birthCycle, label: d.character.label,
        inclination: { ...d.character.inclination },
        purchasedActionIds:  new Set(d.character.purchasedActionIds),
        unlockedSkillIds:    new Set(d.character.unlockedSkillIds),
        stats:    { ...d.character.stats },
        destreses:           new Set(d.character.destreses),
        aprenentatges:       new Set(d.character.aprenentatges || []),
        charState: { ...d.character.charState },
        actionUseCounts: { ...(d.character.actionUseCounts || {}) },
        partnerName: d.character.partnerName || null,
        children: d.character.children || [],
      },
      discoveredUniversalTechIds: new Set(d.discoveredUniversalTechIds),
      discoveredZoneIds:          new Set(d.discoveredZoneIds),
      firedSingleUseEventIds:     new Set(d.firedSingleUseEventIds || []),
      recentEventIds:             d.recentEventIds || [],
      eventStats: d.eventStats || { positive: 0, negative: 0, neutral: 0 },
      log: d.log || [],
      turnHistory: d.turnHistory || [],
      _pendingTurnEntry: null,
      genealogy: d.genealogy || [],
      siblingPool: (d.siblingPool || []).map(s => ({
        ...s,
        inheritedPurchased:     new Set(s.inheritedPurchased     || []),
        inheritedSkills:        new Set(s.inheritedSkills        || []),
        inheritedDestreses:     new Set(s.inheritedDestreses     || []),
        inheritedAprenentatges: new Set(s.inheritedAprenentatges || []),
      })),
      nextGenHealthMax: d.nextGenHealthMax || null,
      currentHealthMax: d.currentHealthMax || (d.nextGenHealthMax || HEALTH_MAX),
      explorationAttempts: d.explorationAttempts || 0,
      foodUpkeepReduction: d.foodUpkeepReduction || 0,
      foodMax: d.foodMax ?? FOOD_MAX_START,
      lifeProgress: d.lifeProgress || 0,
      pendingEvent: null, pendingActionResult: null, pendingSuccession: null, pendingDeath: null, pendingNewGen: null,
      pendingDiscoveries: [], pendingBirths: [],
      gameOver: d.gameOver || false, gameOverReason: d.gameOverReason || null,
    };
    return true;
  } catch (e) {
    console.warn('[Save] load failed', e);
    clearSave();
    return false;
  }
}

function getAgingLoss(age) {
  if (age < AGING_THRESHOLD) return 0;
  return AGING_BASE + Math.round(AGING_SCALE * Math.pow(age - AGING_THRESHOLD, AGING_POWER));
}
function characterAge() { return state.cycle - (state.character.birthCycle || 0); }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function addLog(msg) {
  state.log.unshift(msg);
  if (state.log.length > 8) state.log.length = 8;
}

const RANDOM_NAMES = [
  "Braven", "Dorna", "Hellra", "Kael", "Lysara",
  "Morveth", "Niela", "Ostara", "Praxa", "Ruvek",
];
function randomDynastyName() {
  return RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
}

// Assigns the 2 innate destreses a character is born with:
// 1 inherited from the parent's pool (random pick), 1 random from the global DESTRESA_DEFS pool.
// If parentDestreses is empty (Gen 1), both are random.
function pickInitialDestreses(parentDestreses) {
  const allIds = DESTRESA_DEFS.map(d => d.id);
  const result = new Set();
  const parentArr = [...parentDestreses];
  if (parentArr.length > 0) {
    result.add(parentArr[Math.floor(Math.random() * parentArr.length)]);
  }
  // Always pick at least 2 random destreses total (first character gets 2 random)
  let pool = allIds.filter(id => !result.has(id));
  while (result.size < 2 && pool.length > 0) {
    const pick = pool[Math.floor(Math.random() * pool.length)];
    result.add(pick);
    pool = pool.filter(id => id !== pick);
  }
  return result;
}

function createCharacter(inheritedInclination, inheritedPurchasedIds, inheritedSkillIds, inheritedStats, inheritedDestreses, inheritedAprenentatges, birthCycle = 0, label = '') {
  return {
    birthCycle,
    label,
    inclination: { ...inheritedInclination },
    purchasedActionIds: new Set(inheritedPurchasedIds),
    unlockedSkillIds: new Set(inheritedSkillIds),
    stats: inheritedStats
      ? { ...inheritedStats }
      : Object.fromEntries(STAT_DEFS.map(s => [s.id, STAT_STARTING_VALUE])),
    destreses: new Set(inheritedDestreses),
    aprenentatges: new Set(inheritedAprenentatges),
    charState: Object.fromEntries(CHARACTER_STATE_DEFS.map(d => [d.id, d.startVal])),
    actionUseCounts: {},
    children: [],
  };
}

function freshInclination() {
  // START-01: dona a sociabilitat un valor inicial petit perquè Recol·lector
  // sigui la branca activa des del torn 1 de manera determinista (Gen 1 només;
  // els hereus hereten la inclinació del pare via createCharacter).
  const inc = Object.fromEntries(AXIS_DEFS.map(a => [a.id, 0.0]));
  inc['sociabilitat'] = 0.05;
  return inc;
}

function initState(dynastyName, race) {
  const inclination = freshInclination();
  const basePurchased = new Set(ACTIONS.filter(a => a.is_base).map(a => a.id));
  state = {
    dynastyName: dynastyName || randomDynastyName(),
    race: race || 'MED',
    gender: Math.random() < 0.5 ? 'M' : 'F',
    cycle: 0,
    generation: 1,
    ...Object.fromEntries(RESOURCE_DEFS.map(r => [r.id, r.startVal])),
    character: createCharacter(inclination, basePurchased, new Set(), null, pickInitialDestreses(new Set()), new Set(), 0, CHILD_NAMES[0]),
    discoveredUniversalTechIds: new Set(),
    discoveredZoneIds: new Set(ZONE_DEFS.filter(z => z.starts_discovered).map(z => z.id)),
    firedSingleUseEventIds: new Set(),
    recentEventIds: [],
    eventStats: { positive: 0, negative: 0, neutral: 0 },
    log: [],
    turnHistory: [],
    _pendingTurnEntry: null,
    genealogy: [],
    siblingPool: [],
    pendingEvent: null,
    pendingActionResult: null,
    pendingSuccession: null,
    pendingDiscoveries: [],
    pendingBirths: [],
    pendingEndOfTurn: false,
    pendingDeath: null,
    pendingNewGen: null,
    nextGenHealthMax: null,
    currentHealthMax: HEALTH_MAX,
    explorationAttempts: 0,
    foodUpkeepReduction: 0,
    foodMax: FOOD_MAX_START,
    lifeProgress: 0,
    gameOver: false,
    gameOverReason: null,
  };
}

// ═══════════════════════════════════════════════════════════ INCLINATION LOGIC
function applyDelta(current, delta) {
  const effective = delta / (1 + Math.abs(current) * INERTIA_FACTOR);
  return Math.max(-1.0, Math.min(1.0, current + effective));
}
function applyInclinationDeltas(deltas) {
  for (const axis of AXES) {
    const d = deltas[axis] || 0;
    if (d !== 0) state.character.inclination[axis] = applyDelta(state.character.inclination[axis], d);
  }
}

// ═══════════════════════════════════════════════════════════ ACTION VISIBILITY
function getActionVisibility(action) {
  if (action.universal_prereq && !state.discoveredUniversalTechIds.has(action.universal_prereq)) return 'HIDDEN';
  // Accions d'eina: només es mostra la de la branca primària (substitució automàtica, D3)
  if (action.is_tool_action && action.tool_branch) {
    const primaryToolId = getPrimaryToolActionId();
    if (primaryToolId && action.id !== primaryToolId) return 'HIDDEN';
  }
  const reqs = action.inclination_requirements || ACTION_INCLINATION_REQUIREMENTS[action.id];
  if (!reqs) return 'ACTIVE';
  for (const [axis, range] of Object.entries(reqs)) {
    const val = state.character.inclination[axis];
    const min = range.min !== undefined ? range.min : -Infinity;
    const max = range.max !== undefined ? range.max : Infinity;
    if (val >= min && val <= max) continue;
    const tooLow  = range.min !== undefined && val < range.min;
    const tooHigh = range.max !== undefined && val > range.max;
    if ((tooLow  && val >= range.min - FADE_MARGIN) ||
        (tooHigh && val <= range.max + FADE_MARGIN)) return 'FADED';
    return 'HIDDEN';
  }
  return 'ACTIVE';
}

// ═══════════════════════════════════════════════════════════ BRANCH CONDITIONS
function evaluateConditions(condObj, inclination) {
  if (!condObj) return true;
  const inc = inclination || state.character.inclination;
  const results = condObj.conditions.map(cond => {
    const val = inc[cond.axis];
    return (cond.min === undefined || val >= cond.min) &&
           (cond.max === undefined || val <= cond.max);
  });
  return condObj.operator === 'AND' ? results.every(Boolean) : results.some(Boolean);
}
function getActiveBranches() {
  const pct = getBranchPct();
  const active = BRANCHES.filter(b => {
    const axis = BRANCH_AXIS[b.id];
    return axis !== undefined && pct[axis] >= BRANCH_ACTIVATION_PCT;
  });
  if (active.length > 0) return active;
  // Fallback: highest-% branch is considered active when none reach threshold
  const candidates = BRANCHES.filter(b => BRANCH_AXIS[b.id] !== undefined);
  if (candidates.length === 0) return [];
  const maxPct = Math.max(...candidates.map(b => pct[BRANCH_AXIS[b.id]]));
  const tied = candidates.filter(b => pct[BRANCH_AXIS[b.id]] === maxPct);
  return [tied[Math.floor(Math.random() * tied.length)]];
}

function getPrimaryBranch() {
  const active = getActiveBranches();
  if (active.length === 0) return null;
  if (active.length === 1) return active[0];
  const pct = getBranchPct();
  return active.reduce((a, b) =>
    (pct[BRANCH_AXIS[a.id]] || 0) >= (pct[BRANCH_AXIS[b.id]] || 0) ? a : b
  );
}

// ── Rol d'eina de branca (D3, 2026-06-22): substitució automàtica en canviar de branca ──
// L'acció d'eina visible/usable és sempre la de la branca primària. Posseir el rol d'eina
// (haver comprat l'acció d'eina de qualsevol branca) el manté disponible en canviar de branca,
// sense recomprar-lo.
function getPrimaryToolActionId() {
  const primary = getPrimaryBranch();
  if (!primary) return null;
  const a = ACTIONS.find(x => x.is_tool_action && x.tool_branch === primary.id);
  return a ? a.id : null;
}
function ownsBranchToolRole() {
  return ACTIONS.some(a => a.is_tool_action && state.character.purchasedActionIds.has(a.id));
}
function isActionOwned(action) {
  if (!action) return false;
  if (state.character.purchasedActionIds.has(action.id)) return true;
  if (action.is_tool_action && ownsBranchToolRole()) return true;
  return false;
}

function getHealthCap(age) {
  const peakCap = state?.currentHealthMax ?? HEALTH_MAX;
  if (age <= HEALTH_GROW_TURNS) {
    const t = age / HEALTH_GROW_TURNS;
    return Math.round(HEALTH_CAP_START + t * (peakCap - HEALTH_CAP_START));
  }
  const stableEnd = HEALTH_GROW_TURNS + HEALTH_STABLE_TURNS;
  if (age <= stableEnd) return peakCap;
  const decay = HEALTH_DECAY_SCALE * Math.pow(age - stableEnd, HEALTH_DECAY_POWER);
  return Math.max(1, Math.round(peakCap - decay));
}
function healthMax() { return state ? getHealthCap(characterAge()) : HEALTH_MAX; }
function materialMax() { return RESOURCE_DEFS.find(r => r.id === 'material')?.max ?? Infinity; }
function foodMax()     { return state ? Math.min(FOOD_MAX, state.foodMax ?? FOOD_MAX_START) : FOOD_MAX_START; }

// ═══════════════════════════════════════════════════════════ TECH DISCOVERY
function getDiscoverableTechs() {
  return UNIVERSAL_TECHS.filter(t =>
    state.cycle >= t.cycle && !state.discoveredUniversalTechIds.has(t.id)
  );
}
function applyUniversalTechEffect(tech) {
  if (!tech.effect) return;
  if (tech.effect.healthBonus) {
    state.health = Math.min(healthMax(), state.health + tech.effect.healthBonus);
  }
  if (tech.effect.healthPctBonus) {
    if (tech.effect.nextGenHealthMax) state.currentHealthMax = tech.effect.nextGenHealthMax;
    const bonus = Math.round(state.health * tech.effect.healthPctBonus);
    state.health = Math.min(healthMax(), state.health + bonus);
  }
  if (tech.effect.nextGenHealthMax) {
    state.nextGenHealthMax = tech.effect.nextGenHealthMax;
  }
}
function autoDiscoverUniversalTechs() {
  for (const tech of getDiscoverableTechs()) {
    state.discoveredUniversalTechIds.add(tech.id);
    addLog(`${tech.icon} Descoberta: ${tech.name}`);
    applyUniversalTechEffect(tech);
    state.pendingDiscoveries.push({ ...tech, _isTech: true });
    if (state._turnDiscoveries) state._turnDiscoveries.push(`${tech.icon || '✦'} ${tech.name}`);
  }
}

// ═══════════════════════════════════════════════════════════ SKILL (BRANCH TECH) LOGIC
function getEligibleSkills() {
  return SKILL_DEFS.filter(bt =>
    !bt.is_hidden &&
    (!bt.universal_prereq || state.discoveredUniversalTechIds.has(bt.universal_prereq)) &&
    !state.character.unlockedSkillIds.has(bt.id) &&
    evaluateConditions(bt.inclination_conditions)
  );
}
function getSkillMaturity(bt) {
  let score = 0;
  for (const cond of bt.inclination_conditions.conditions) {
    const val = state.character.inclination[cond.axis];
    if (cond.min !== undefined) score += Math.max(0, val - cond.min);
  }
  return score;
}
function unlockSkill(bt) {
  if (state.character.unlockedSkillIds.has(bt.id)) return;
  state.character.unlockedSkillIds.add(bt.id);
  addLog(`Nova habilitat: ${bt.name}`);
  if (state._turnSkills) state._turnSkills.push(bt.name);
  if (bt.unlocks_action_ids) {
    // D4 (2026-06-22): les accions amb cost es compren al mercat un cop desbloquejada la tech;
    // només les gratuïtes (sense purchase_cost) es concedeixen directament en desbloquejar-la.
    for (const aid of bt.unlocks_action_ids) {
      const act = ACTIONS.find(a => a.id === aid);
      if (act && !act.purchase_cost) state.character.purchasedActionIds.add(aid);
    }
  }
  const pe = bt.passive_effect;
  if (pe) {
    if (pe.type === 'grant_health')   state.health    = Math.min(healthMax(), state.health + pe.amount);
    if (pe.type === 'grant_material') state.material = Math.min(materialMax(), state.material + pe.amount);
    if (pe.type === 'unlock_zone')    state.discoveredZoneIds.add(pe.unlocks_zone);
  }
  state.pendingDiscoveries.push({
    _isSkill: true, icon: '🧩', name: bt.name,
    desc: bt.unlocks_action_ids?.length
      ? `Desbloqueja: ${bt.unlocks_action_ids.map(id => {
          const a = ACTIONS.find(x => x.id === id);
          if (!a) return id;
          const zoneOk = !a.zona || state.discoveredZoneIds.has(a.zona);
          return zoneOk ? a.name : `${a.name} (${ZONE_ICONS[a.zona] || '📍'} ${a.zona} — zona pendent)`;
        }).join(', ')}.`
      : 'Nova tècnica del llinatge.',
    effect: pe?.desc ? { desc: pe.desc } : null,
  });
}

// ═══════════════════════════════════════════════════════════ DESTRESA DISCOVERY
function checkDestresesAfterAction(executedActionId) {
  if (state.character.destreses.size >= DESTRESA_MAX) return;
  for (const def of DESTRESA_DEFS) {
    if (state.character.destreses.has(def.id)) continue;
    const inclinationMet = def.conditions.every(c => {
      const val = state.character.inclination[c.axis] ?? 0;
      return (c.min === undefined || val >= c.min) && (c.max === undefined || val <= c.max);
    });
    const usesForAction = state.character.actionUseCounts[def.action_id] || 0;
    const usesMet = !def.action_id || usesForAction >= DESTRESA_THRESHOLD;
    const met = inclinationMet && usesMet;
    if (met) {
      state.character.destreses.add(def.id);
      addLog(`⭐ Destresa: ${def.name}`);
      const linkedAction = ACTIONS.find(a => a.destresa_id === def.id);
      state.pendingDiscoveries.push({
        _isDestresa: true, icon: '⭐', name: def.name,
        desc: `Has despertat la capacitat innata de "${def.name}". Es manifesta per la teva inclinació.`,
        effect: linkedAction ? { desc: `+${DESTRESA_BONUS} a "${linkedAction.name}"` } : null,
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════ APRENENTATGE DISCOVERY
function checkAprenentagesAfterAction(executedActionId) {
  if (state.character.aprenentatges.size >= APRENENTATGE_MAX) return;
  for (const def of APRENENTATGE_DEFS) {
    if (state.character.aprenentatges.size >= APRENENTATGE_MAX) break;
    if (state.character.aprenentatges.has(def.id)) continue;
    if (!def.discovery_action_ids.includes(executedActionId)) continue;
    const uses = state.character.actionUseCounts[executedActionId] || 0;
    if (uses < APRENENTATGE_THRESHOLD) continue;
    if (Math.random() >= def.discoveryChance) continue;
    state.character.aprenentatges.add(def.id);
    addLog(`📖 Aprenentatge: ${def.name}`);
    state.pendingDiscoveries.push({
      _isAprenentatge: true, icon: def.icon, name: def.name,
      desc: `Has après "${def.name}". ${def.effect.desc}`,
      effect: { desc: def.effect.desc },
    });
  }
}

// ═══════════════════════════════════════════════════════════ CHARACTER STATE
function evaluateCharacterRequires(action) {
  if (!action.requires || action.requires.length === 0) return true;
  return action.requires.every(req => {
    if (req.type === 'has_any_skill')        return state.character.unlockedSkillIds.size > 0;
    if (req.type === 'has_any_aprenentatge') return state.character.aprenentatges.size > 0;
    if (req.type === 'has_destresa')     return state.character.destreses.has(req.id);
    if (req.type === 'has_aprenentatge') return state.character.aprenentatges.has(req.id);
    if (req.resource !== undefined) {
      const val = state[req.resource] ?? 0;
      if (req.min !== undefined && val < req.min) return false;
    }
    if (req.state) {
      const val = state.character.charState[req.state] ?? 0;
      if (req.min !== undefined && val < req.min) return false;
      if (req.max !== undefined && val > req.max) return false;
      if (req.lt_max) {
        const def = CHARACTER_STATE_DEFS.find(d => d.id === req.state);
        if (def && val >= def.max) return false;
      }
    }
    return true;
  });
}
function applyCharacterEffect(action) {
  const eff = action.character_effect;
  if (!eff) return;
  if (eff.type === 'delta') {
    const def = CHARACTER_STATE_DEFS.find(d => d.id === eff.state);
    const cur = state.character.charState[eff.state] ?? 0;
    const newVal = cur + eff.delta;
    state.character.charState[eff.state] = def?.max != null
      ? Math.min(def.max, Math.max(0, newVal))
      : newVal;
  }
  if (eff.type === 'find_partner') {
    const failureChance = eff.failure_chance ?? 0.05;
    if (Math.random() < failureChance) {
      addLog('Recerca sense èxit. Intenteu-ho de nou.');
      state.pendingDiscoveries.push({ _isEvent: true, icon: '💔', name: 'Sense parella', desc: 'No heu trobat la persona adequada. Podeu tornar-ho a intentar.' });
      return;
    }
    state.character.charState.parella = 1;
    const partnerNames = ['Lyra', 'Kael', 'Miran', 'Sura', 'Bran', 'Elia', 'Torn', 'Vael', 'Deva', 'Rand'];
    const partnerName = partnerNames[Math.floor(Math.random() * partnerNames.length)];
    state.character.partnerName = partnerName;
    if (!state.discoveredZoneIds.has('Llar')) {
      state.discoveredZoneIds.add('Llar');
    }
    addLog(`💑 Parella trobada: ${partnerName}. La Llar ara és vostra.`);
    state.pendingDiscoveries.push({ _isPartner: true, icon: '💑', name: `${state.character.label} & ${partnerName}`, desc: `Heu trobat company/a de vida. La Llar s'obre. Ara podeu tenir fills i construir el llinatge.` });
  }
  if (eff.type === 'make_tool') {
    const enginy = state.character.stats['enginy'] ?? STAT_STARTING_VALUE;
    // Break risk: 40% at enginy=1, 5% at enginy=5 (linear decay)
    const breakRisk = Math.max(0.05, 0.40 - (enginy - 1) * (0.35 / 4));
    if (Math.random() < breakRisk) {
      // Eina broke — pedra used in attempt is lost; 50% chance extra pedra shatters
      state.pedra = Math.max(0, (state.pedra || 0) - 1);
      if (Math.random() < 0.5) {
        state.pedra = Math.max(0, (state.pedra || 0) - 1);
        addLog('⚒️ L\'eina s\'ha trencat i la pedra s\'ha perdut!');
        state.pendingDiscoveries.push({ _isEvent: true, icon: '⚒️', name: 'Eina trencada', desc: 'La peça no ha aguantat. Has perdut la pedra i el torn. L\'enginy ajuda a evitar-ho.' });
      } else {
        addLog('⚒️ L\'eina s\'ha trencat!');
        state.pendingDiscoveries.push({ _isEvent: true, icon: '⚒️', name: 'Eina trencada', desc: 'La peça no ha aguantat. Has perdut el torn. L\'enginy ajuda a evitar-ho.' });
      }
      return;
    }
    // Success: consume pedra, gain eina
    state.pedra = Math.max(0, (state.pedra || 0) - 1);
    const einaDef = RESOURCE_DEFS.find(r => r.id === 'eina');
    const maxEina = einaDef?.max ?? 3;
    state.eina = Math.min(maxEina, (state.eina || 0) + 1);
    addLog('⚒️ Eina fabricada.');
  }
  if (eff.type === 'explore_zone') {
    const attempts = state.explorationAttempts || 0;
    const discoverChance = Math.min(0.95, 0.20 + attempts * 0.15);
    const orderedZones = ZONE_DEFS.filter(z => !z.starts_discovered && !state.discoveredZoneIds.has(z.id) && z.id !== 'Llar');
    if (orderedZones.length === 0) {
      addLog('🧭 Totes les zones ja descobertes.');
    } else if (Math.random() < discoverChance) {
      const zone = orderedZones[0];
      state.discoveredZoneIds.add(zone.id);
      state.explorationAttempts = 0;
      addLog(`🧭 Nova zona descoberta: ${zone.id}!`);
      state.pendingDiscoveries.push({
        _isZone: true, icon: ZONE_ICONS[zone.id] || '🗺️',
        name: zone.id, desc: `Has descobert ${zone.id}. Ara apareix al teu mapa.`,
      });
    } else {
      state.explorationAttempts = attempts + 1;
      // Always fire an exploration event (2:1 positive/negative ratio)
      if (EXPLORATION_EVENTS && EXPLORATION_EVENTS.length > 0) {
        const positive = EXPLORATION_EVENTS.filter(e => e.positive);
        const negative = EXPLORATION_EVENTS.filter(e => !e.positive);
        const usePositive = Math.random() < 2 / 3;
        const pool = usePositive ? positive : negative;
        const ev = pool[Math.floor(Math.random() * pool.length)];
        if (ev) {
          applyEventEffects(ev.effects);
          addLog(`🧭 Exploració: ${ev.text}`);
          state.pendingDiscoveries.push({ _isEvent: true, icon: '🧭', name: 'Exploració', desc: ev.text });
        }
      } else {
        addLog(`🧭 Explorant... (intent ${state.explorationAttempts})`);
      }
    }
  }
  if (eff.type === 'add_child' || eff.type === 'add_child_with_risk') {
    // Health-based success probability (higher health = more likely)
    const healthRatio = state.health / healthMax();
    const successChance = Math.max(0.25, Math.min(0.95, 0.30 + healthRatio * 0.65));
    if (Math.random() > successChance) {
      addLog('Pèrdua de l\'embaràs.');
      const atMaxHealth = state.health >= healthMax();
      const desc = atMaxHealth
        ? `L'embaràs no ha seguit endavant. La salut no garanteix l'èxit (${Math.round(successChance*100)}% de probabilitat). Podeu tornar-ho a intentar.`
        : `La salut baixa ha complicat l'embaràs. Milloreu la salut per augmentar les probabilitats d'èxit (${Math.round(successChance*100)}% ara).`;
      state.pendingDiscoveries.push({ _isEvent: true, icon: '🕯️', name: 'Pèrdua', desc });
      return;
    }
    const nameIdx = (state.generation * 7 + state.character.children.length * 3) % CHILD_NAMES.length;
    const childLabel = CHILD_NAMES[nameIdx];
    const child = { id: `child_${state.generation}_${state.cycle}`, label: childLabel };
    state.character.children.push(child);
    state.character.charState.fills = state.character.children.length;
    const n = state.character.children.length;
    state.pendingBirths.push({ childLabel, n });
    addLog(`Fill nascut (${n}/${MAX_CHILDREN}).`);
  }
}

// ═══════════════════════════════════════════════════════════ EVENT SYSTEM

function classifyEvent(ev) {
  if (ev.is_discovery_event) return 'positive';
  if (ev.options) return 'neutral'; // player-choice events: neutral for balancing
  const fx = ev.effects || {};
  const score = (fx.food || 0) + (fx.health || 0) * 0.5 + (fx.material || 0) * 0.5;
  return score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
}

function trackEventFired(ev) {
  const c = classifyEvent(ev);
  if (!state.eventStats) state.eventStats = { positive: 0, negative: 0, neutral: 0 };
  state.eventStats[c] = (state.eventStats[c] || 0) + 1;
}

function selectBalancedEvent(eligible) {
  if (eligible.length <= 1) return eligible[0] ?? null;
  const age = characterAge();
  const progress = Math.min(1, age / LIFE_EXPECTANCY);
  const expPos = Math.round(EVENT_TARGET_POSITIVE * progress);
  const expNeg = Math.round(EVENT_TARGET_NEGATIVE * progress);
  const stats  = state.eventStats || { positive: 0, negative: 0 };
  const posDebt = Math.max(0, expPos - (stats.positive || 0));
  const negDebt = Math.max(0, expNeg - (stats.negative || 0));

  const weighted = eligible.map(ev => {
    const type = classifyEvent(ev);
    const debt = type === 'positive' ? posDebt : type === 'negative' ? negDebt : 0;
    return { ev, weight: Math.max(0.1, 1 + debt * EVENT_BALANCE_WEIGHT) };
  });
  const total = weighted.reduce((s, w) => s + w.weight, 0);
  let r = Math.random() * total;
  for (const w of weighted) {
    r -= w.weight;
    if (r <= 0) return w.ev;
  }
  return weighted[weighted.length - 1].ev;
}

function getEligiblePoolEvents(pool) {
  return pool.filter(ev => {
    if (ev.is_single_use && state.firedSingleUseEventIds.has(ev.id)) return false;
    if (!ev.is_single_use && (state.recentEventIds || []).includes(ev.id)) return false;
    if (ev.blocked_if && evaluateBlockedIf(ev.blocked_if)) return false;
    if (!ev.is_discovery_event) return true;
    const bt = SKILL_DEFS.find(t => t.id === ev.discovery_skill_id);
    if (!bt) return false;
    if (!state.discoveredUniversalTechIds.has(bt.universal_prereq)) return false;
    return evaluateConditions(bt.inclination_conditions);
  });
}
function evaluateBlockedIf(conditions) {
  if (!conditions || conditions.length === 0) return false;
  return conditions.some(cond => {
    if (cond.type === 'has_skill')        return state.character.unlockedSkillIds.has(cond.id);
    if (cond.type === 'not_has_skill')    return !state.character.unlockedSkillIds.has(cond.id);
    if (cond.type === 'has_destresa')     return state.character.destreses.has(cond.id);
    if (cond.type === 'has_aprenentatge') return state.character.aprenentatges.has(cond.id);
    if (cond.type === 'stat_min')       return (state.character.stats[cond.stat] || 0) >= cond.min;
    if (cond.type === 'axis_above')     return (state.character.inclination[cond.axis] || 0) >= cond.value;
    if (cond.type === 'resource_below') return (state[cond.resource] || 0) < cond.value;
    return false;
  });
}

// ═══════════════════════════════════════════════════════════ SUCCESSION
function triggerSuccession() {
  const children = state.character.children;
  const siblings = state.siblingPool;
  if (state.cycle >= ERA_CYCLES) {
    const topAxis = AXES.reduce((a, b) =>
      Math.abs(state.character.inclination[a]) > Math.abs(state.character.inclination[b]) ? a : b
    );
    state.genealogy.push({
      label: state.character.label || `Gen ${state.generation}`,
      generation: state.generation,
      age: characterAge(),
      cause: state.health <= 0 ? 'Salut esgotada' : 'Era finalitzada',
      topAxis,
      branches: getActiveBranches().map(b => b.name),
      skills: state.character.unlockedSkillIds.size,
      aprenentatges: state.character.aprenentatges.size,
      hadHeir: children.length > 0 || siblings.length > 0,
    });
    state.gameOver = true; state.gameOverReason = 'era_complete'; return;
  }
  if (children.length === 0 && siblings.length === 0) {
    const topAxis = AXES.reduce((a, b) =>
      Math.abs(state.character.inclination[a]) > Math.abs(state.character.inclination[b]) ? a : b
    );
    state.genealogy.push({
      label: state.character.label || `Gen ${state.generation}`,
      generation: state.generation,
      age: characterAge(),
      cause: 'Extinció del llinatge',
      topAxis,
      branches: getActiveBranches().map(b => b.name),
      skills: state.character.unlockedSkillIds.size,
      aprenentatges: state.character.aprenentatges.size,
      hadHeir: false,
    });
    state.gameOver = true; state.gameOverReason = 'no_heir'; return;
  }
  const topAxis = AXES.reduce((a, b) =>
    Math.abs(state.character.inclination[a]) > Math.abs(state.character.inclination[b]) ? a : b
  );
  // Inclination: 85% heretada — identitat de llinatge però amb marge de variació per generació
  const inheritedInclination = Object.fromEntries(
    AXES.map(a => [a, state.character.inclination[a] * INCLINATION_INHERITANCE_RATE])
  );
  // Stats: 50% heretats (per evitar runaway exponencial entre generacions)
  const inheritedStats = Object.fromEntries(
    STAT_DEFS.map(s => [s.id,
      state.character.stats[s.id] * STAT_INHERITANCE_RATE +
      STAT_STARTING_VALUE * (1 - STAT_INHERITANCE_RATE)
    ])
  );
  const inheritedPurchased    = new Set(state.character.purchasedActionIds);
  // Habilitats: sempre heretades al 100% — pertanyen al llinatge, no al personatge
  const inheritedSkills       = new Set(state.character.unlockedSkillIds);
  // Destreses: 1 del pare (tirada aleatòria entre les seves) + 1 aleatòria del pool global
  const inheritedDestreses    = pickInitialDestreses(state.character.destreses);
  // Aprenentatges: el fill rep UN del pare si va executar act_ensenyar (tirada aleatòria entre els del pare)
  const hasEnsenyat            = state.character.charState.ensenyat === 1;
  const inheritedAprenentatges = new Set();
  if (hasEnsenyat && state.character.aprenentatges.size > 0) {
    const aprArr = [...state.character.aprenentatges];
    inheritedAprenentatges.add(aprArr[Math.floor(Math.random() * aprArr.length)]);
  }
  const childSuccessors = children.map(c => ({
    ...c, is_sibling: false,
    inheritedInclination, inheritedStats, inheritedPurchased, inheritedSkills, inheritedDestreses, inheritedAprenentatges, hasEnsenyat,
  }));
  const siblingSuccessors = siblings.map(s => ({ ...s, is_sibling: true }));
  // Siblings only offered if the character leaves no children (PT-10)
  const successors = childSuccessors.length > 0 ? childSuccessors : siblingSuccessors;
  const successionPayload = {
    generation: state.generation,
    successors,
  };
  state.genealogy.push({
    label:      state.character.label || `Gen ${state.generation}`,
    generation: state.generation,
    age:        characterAge(),
    cause:      state.health <= 0 ? 'Salut esgotada' : 'Vida complerta',
    topAxis,
    branches:   getActiveBranches().map(b => b.name),
    skills:     state.character.unlockedSkillIds.size,
    aprenentatges: state.character.aprenentatges.size,
    hadHeir:    children.length > 0 || siblings.length > 0,
  });

  state.pendingDeath = {
    label: state.character.label || `Gen ${state.generation}`,
    age: characterAge(),
    cause: state.health <= 0 ? 'Salut esgotada' : 'Vida complerta',
    topAxis,
    successionPayload,
  };
}

function continueSuccession(successorId) {
  if (!state.pendingSuccession) return;
  const s = state.pendingSuccession;
  const chosen = s.successors.find(c => c.id === successorId);
  if (!chosen) return;
  const unchosen = s.successors.filter(c => !c.is_sibling && c.id !== successorId);
  state.siblingPool = [
    ...unchosen,
    ...state.siblingPool.filter(sib => sib.id !== successorId),
  ];
  state.pendingSuccession = null;
  for (const res of RESOURCE_DEFS) {
    if (!res.persistent) {
      // Always start health at startVal; fire tech raises the peak during play
      if (res.id === 'health' && state.nextGenHealthMax) {
        state.currentHealthMax = state.nextGenHealthMax;
      }
      state[res.id] = res.startVal;
    } else if (res.inheritDecay != null) {
      state[res.id] = Math.floor((state[res.id] || 0) * res.inheritDecay);
    }
  }
  // Reset per-generation state
  state.explorationAttempts = 0;
  state.lifeProgress = 0;
  state.generation++;
  const gender = Math.random() < 0.5 ? 'M' : 'F';
  state.gender = gender;
  state.character = createCharacter(
    chosen.inheritedInclination,
    chosen.inheritedPurchased,
    chosen.inheritedSkills,
    chosen.inheritedStats,
    chosen.inheritedDestreses,
    chosen.inheritedAprenentatges || new Set(),
    state.cycle,
    chosen.label
  );
  addLog(`--- Generació ${state.generation} ---`);
  state.pendingNewGen = { label: chosen.label, generation: state.generation };
  state.eventStats = { positive: 0, negative: 0, neutral: 0 };
  renderAll();
}

// ═══════════════════════════════════════════════════════════ STAT MULTIPLIER
function getStatMultiplier(action) {
  if (!action.stat_key) return 1;
  return 1 + (state.character.stats[action.stat_key] - STAT_STARTING_VALUE) * STAT_OUTPUT_FACTOR;
}

// ═══════════════════════════════════════════════════════════ TURN UPKEEP
function applyTurnUpkeep() {
  const age = characterAge();
  const cap = getHealthCap(age);
  // Youth passive growth: durant el creixement la salut puja 1/torn cap al cap natural,
  // però NO retallem la salut ja guanyada per accions si ja supera el cap jove (decisió 2a, 2026-06-26).
  if (age <= HEALTH_GROW_TURNS && state.health < cap) {
    state.health = Math.min(cap, state.health + 1);
  }
  // Food upkeep
  const childUpkeep = state.character.children.length;
  const aprUpkeepReduction = [...state.character.aprenentatges].reduce((s, aid) => {
    const apr = APRENENTATGE_DEFS.find(a => a.id === aid);
    return apr?.effect?.type === 'food_upkeep_reduction' ? s + apr.effect.value : s;
  }, 0);
  const totalUpkeep = Math.max(0.5, FOOD_UPKEEP - (state.foodUpkeepReduction || 0) - aprUpkeepReduction) + childUpkeep;
  const prevFood = state.food;
  state.food = Math.max(0, state.food - totalUpkeep);
  if (prevFood < totalUpkeep) {
    state.health = Math.max(0, state.health - 10);
  }
  state.health = Math.max(0, state.health - getAgingLoss(age));
  // Enforce health cap: en creixement/estabilitat permetem fins al pic (no clawback de la salut
  // guanyada per accions, decisió 2a); només la fase de declivi retalla cap avall.
  const peakCap = state.currentHealthMax ?? HEALTH_MAX;
  const stableEnd = HEALTH_GROW_TURNS + HEALTH_STABLE_TURNS;
  state.health = Math.min(age > stableEnd ? cap : peakCap, state.health);
  // Life progress (health-speed model — advances faster when ill or old)
  state.lifeProgress = Math.min(1, (state.lifeProgress || 0) + lifeIncPerTurn());
}

// ═══════════════════════════════════════════════════════════ END-OF-TURN PHASE
// Called after action effects (if no event) OR after event resolves.
// Shows its own donut, then applies cycle/upkeep, then checks succession.
function beginEndOfTurnPhase() {
  // SEQ-01: NO fem clearFloaters() aquí — els floaters d'acció ja s'hauran extingit
  // durant el donut (1.25s animació > 1.4s durada floater). Netejar aquí els esborrava
  // abans que el jugador els veiés.
  const ring = el('exec-donut-ring');
  if (ring) ring.style.stroke = '#888';
  showDonutAnimation({ _icon: '🌙', id: '_eot', name: 'Fi de torn' }, null, () => {
    if (ring) ring.style.stroke = 'var(--gold)';
    const snapEot = snapshotNums();
    state.cycle++;
    autoDiscoverUniversalTechs();
    applyTurnUpkeep();
    applyFxFloaters(snapEot);
    // Age-gate notifications
    for (const a of ACTIONS.filter(x => x.is_base && x.minAge)) {
      const alreadyNotified = state.pendingDiscoveries.some(d => d._isEvent && d.name === a.name);
      const requiresSatisfied = !a.requires?.[0]?.state || !state.character.charState[a.requires[0].state];
      if (characterAge() === a.minAge && requiresSatisfied && !alreadyNotified) {
        state.pendingDiscoveries.push({ _isEvent: true, icon: getActionIcon(a), name: a.name, desc: `Ja tens edat per "${a.name}". ${a.description || ''}` });
      }
    }
    // Partner warning (only if still alive)
    if (state.health > 0 && characterAge() === 12 && state.character.charState.parella === 0) {
      const alreadyWarned = state.pendingDiscoveries.some(d => d._isPartnerWarning);
      if (!alreadyWarned) {
        state.pendingDiscoveries.push({ _isPartnerWarning: true, icon: '💑', name: 'Edat per a la parella s\'acaba', desc: 'Tens 2 cicles per cercar parella (l\'acció s\'esgota a edat 14). Sense parella, no hi ha successió possible.' });
      }
    }
    // Complete turn history entry
    if (state._pendingTurnEntry) {
      const foodDelta   = Math.round(state.food)   - Math.round(snapEot.food);
      const healthDelta = Math.round(state.health) - Math.round(snapEot.health);
      const parts = [];
      if (foodDelta   !== 0) parts.push(`${foodDelta   > 0 ? '+' : ''}${foodDelta}🌾`);
      if (healthDelta !== 0) parts.push(`${healthDelta > 0 ? '+' : ''}${healthDelta}❤️`);
      state._pendingTurnEntry.upkeep = parts.join(' ') || '—';
      // LOG-01: adjunta descobriments i habilitats acumulats durant el torn (bucket transitori)
      state._pendingTurnEntry.discoveries = (state._turnDiscoveries || []).slice();
      state._pendingTurnEntry.skills = (state._turnSkills || []).slice();
      state.turnHistory.unshift(state._pendingTurnEntry);
      if (state.turnHistory.length > 10) state.turnHistory.length = 10;
      state._pendingTurnEntry = null;
      state._turnDiscoveries = [];
      state._turnSkills = [];
    }
    // Succession / death check
    if (characterAge() >= LIFE_EXPECTANCY || state.health <= 0 || state.lifeProgress >= 1) {
      triggerSuccession();
    }
    renderAll();
    saveGame();
  });
}

// ── Gate de final de torn (punt 1, 2026-06-22) ──────────────────────────────
// L'EOT espera que es resolguin TOTS els descobriments/events/naixements generats per
// l'acció (p.ex. el resultat d'"Explorar els Voltants") abans de córrer (cycle++, upkeep).
// No es desa en diferir: el torn és atòmic i només es desa quan l'EOT acaba.
function proceedToEndOfTurn() {
  if (state.pendingEvent || state.pendingDiscoveries.length > 0 || state.pendingBirths.length > 0) {
    state.pendingEndOfTurn = true;
    renderAll();
    return;
  }
  state.pendingEndOfTurn = false;
  beginEndOfTurnPhase();
}
function afterDismiss() {
  if (state.pendingEndOfTurn &&
      !state.pendingEvent &&
      state.pendingDiscoveries.length === 0 &&
      state.pendingBirths.length === 0) {
    state.pendingEndOfTurn = false;
    beginEndOfTurnPhase();
  } else {
    renderAll();
  }
}

// ═══════════════════════════════════════════════════════════ ACTION EXECUTION
function executeAction(actionId) {
  if (state.pendingEvent || state.pendingSuccession || state.gameOver) return;
  const action = ACTIONS.find(a => a.id === actionId);
  if (!action || !isActionOwned(action)) return;
  if (getActionVisibility(action) !== 'ACTIVE') return;
  const age = characterAge();
  if (isActionTooYoung(action)) return; // blocked — shown but not executable
  if (action.maxAge !== undefined && age > action.maxAge) return;
  if (!evaluateCharacterRequires(action)) return;

  // LOG-01 (2026-06-26): bucket transitori de descobriments/habilitats d'aquest torn;
  // s'adjunta a l'entrada d'historial al fi de torn (timing-safe, independent del cicle de vida de l'entrada).
  state._turnDiscoveries = [];
  state._turnSkills = [];

  // Handle discovery action (learn a branch tech)
  if (action.is_discovery_action) {
    const eligible = getEligibleSkills();
    if (eligible.length === 0) { addLog('No hi ha tècniques noves ara.'); renderAll(); return; }
    const maxScore = Math.max(...eligible.map(bt => getSkillMaturity(bt)));
    const top = eligible.filter(bt => getSkillMaturity(bt) === maxScore);
    const chosen = top[Math.floor(Math.random() * top.length)];
    hide('overlay-zone-actions');
    showDonutAnimation(action, null, () => {
      const snap = snapshotNums();
      unlockSkill(chosen);
      applyFxFloaters(snap);
      addLog(`[${state.cycle + 1}] ${action.name}`);
      state._pendingTurnEntry = { cycle: state.cycle + 1, action: { name: action.name, delta: '' }, events: [], upkeep: null };
      proceedToEndOfTurn();
    });
    return;
  }

  // Normal action execution
  if ((action.execute_cost || 0) > 0 && state.food < action.execute_cost) {
    addLog('No tens prou provisions');
    renderAll();
    return;
  }
  hide('overlay-zone-actions');
  showDonutAnimation(action, null, () => {
    // ── FASE COST: cost immediate + estat intern ──────────────────────────
    const snapCost = snapshotNums();
    if (action.execute_cost) state.food = Math.max(0, state.food - action.execute_cost);
    // Material universal — sempre immediat (moneda de compra)
    const elderBonus = characterAge() >= 11 ? 1 : 0;
    if (elderBonus && !(state.character.charState.loggedElder)) {
      state.character.charState.loggedElder = 1;
      addLog('Sàvia experiència: els ancians generen +1 token per acció');
    }
    const matMin = (action.material_min ?? 2) + elderBonus;
    const matMax = (action.material_max ?? 3) + elderBonus;
    const aprMatBonus = [...state.character.aprenentatges].reduce((s, aid) => {
      const apr = APRENENTATGE_DEFS.find(a => a.id === aid);
      return apr?.effect?.type === 'material_bonus' ? s + apr.effect.value : s;
    }, 0);
    state.material = Math.min(materialMax(), state.material + randInt(matMin, matMax) + aprMatBonus);
    // Reducció upkeep i ampliació cap — immediats (efecte permanent)
    if (action.food_upkeep_delta) {
      const prevCount = state.character.actionUseCounts[actionId] || 0;
      if (prevCount < (action.max_executions || 99)) {
        state.foodUpkeepReduction = Math.min(FOOD_UPKEEP - 0.5, (state.foodUpkeepReduction || 0) + Math.abs(action.food_upkeep_delta));
        addLog(`Conservació millorada: upkeep −${(state.foodUpkeepReduction).toFixed(1)}/torn`);
      }
    }
    if (action.food_cap_delta) {
      const prevCount = state.character.actionUseCounts[actionId] || 0;
      if (prevCount < (action.max_executions || 99)) {
        state.foodMax = Math.min(FOOD_MAX, (state.foodMax ?? FOOD_MAX_START) + action.food_cap_delta);
        addLog(`Emmagatzematge ampliat: cap. → ${state.foodMax}`);
      }
    }
    // Estat intern — inclinació, stats, efecte personatge, comptadors, destreses, zones
    applyInclinationDeltas(action.inclination_deltas);
    if (action.stat_key && action.stat_gain) {
      state.character.stats[action.stat_key] = Math.min(STAT_MAX, state.character.stats[action.stat_key] + action.stat_gain);
    }
    applyCharacterEffect(action);
    state.character.actionUseCounts[actionId] = (state.character.actionUseCounts[actionId] || 0) + 1;
    checkDestresesAfterAction(actionId);
    checkAprenentagesAfterAction(actionId);
    if (action.unlocks_zone && !state.discoveredZoneIds.has(action.unlocks_zone)) {
      state.discoveredZoneIds.add(action.unlocks_zone);
      addLog(`Nova zona: ${action.unlocks_zone}!`);
      if (state._turnDiscoveries) state._turnDiscoveries.push(`${ZONE_ICONS[action.unlocks_zone] || '🗺️'} ${action.unlocks_zone}`);
      state.pendingDiscoveries.push({
        _isZone: true, icon: ZONE_ICONS[action.unlocks_zone] || '🗺️',
        name: action.unlocks_zone, desc: `Has descobert ${action.unlocks_zone}. Ara apareix al teu mapa.`,
      });
    }
    // Floaters de la fase cost (cost execute + material)
    spawnResBalls(snapCost);
    applyFxFloaters(snapCost);

    // ── CÀLCUL OUTPUT (no aplicat encara) ────────────────────────────────
    const destresaBonus = (action.destresa_id && state.character.destreses.has(action.destresa_id)) ? DESTRESA_BONUS : 0;
    const outMinBonus = [...state.character.unlockedSkillIds].reduce((s, sid) => {
      const bt = SKILL_DEFS.find(t => t.id === sid);
      return bt?.passive_effect?.type === 'bonus_action_output' && bt.passive_effect.action_id === actionId
        ? s + (bt.passive_effect.output_min_bonus || 0) : s;
    }, 0) + [...state.character.aprenentatges].reduce((s, aid) => {
      const apr = APRENENTATGE_DEFS.find(a => a.id === aid);
      return apr?.effect?.type === 'bonus_action_output' && apr.effect.action_id === actionId
        ? s + (apr.effect.output_min_bonus || 0) : s;
    }, 0);
    const outMaxBonus = [...state.character.unlockedSkillIds].reduce((s, sid) => {
      const bt = SKILL_DEFS.find(t => t.id === sid);
      return bt?.passive_effect?.type === 'bonus_action_output' && bt.passive_effect.action_id === actionId
        ? s + (bt.passive_effect.output_max_bonus || 0) : s;
    }, 0) + [...state.character.aprenentatges].reduce((s, aid) => {
      const apr = APRENENTATGE_DEFS.find(a => a.id === aid);
      return apr?.effect?.type === 'bonus_action_output' && apr.effect.action_id === actionId
        ? s + (apr.effect.output_max_bonus || 0) : s;
    }, 0);
    const outRes = action.output_resource;
    let output = 0, outDef = null;
    if (outRes && action.output_min != null) {
      const _qualBonus = (state.character.purchasedActionIds.has('act_talla_avancada') && action.requires?.some(r => r.resource === 'eina')) ? 1.3 : 1.0;
      output = Math.round(randInt(action.output_min + outMinBonus, Math.round((action.output_max + outMaxBonus) * _qualBonus)) * getStatMultiplier(action)) + destresaBonus;
      outDef = RESOURCE_DEFS.find(r => r.id === outRes);
    }
    // Log (inclou output calculat fins i tot si es difereix)
    const actionLabel = output > 0 ? `${action.name}: +${output} ${outDef?.label || outRes}` : action.name;
    addLog(`[${state.cycle + 1}] ${actionLabel}`);
    // LOG-01: entrada estructurada — delta propi de l'acció (output + side_effects)
    const actionDeltaPairs = [];
    if (output > 0 && outRes) actionDeltaPairs.push([outRes, output]);
    if (action.side_effects) for (const se of action.side_effects) actionDeltaPairs.push([se.resource, se.delta]);
    state._pendingTurnEntry = { cycle: state.cycle + 1, action: { name: action.name, delta: fmtPairs(actionDeltaPairs) }, events: [], upkeep: null };

    // ── COMPROVACIÓ EVENT ─────────────────────────────────────────────────
    if (action.event_pool_id && EVENT_POOLS[action.event_pool_id] && Math.random() < EVENT_TRIGGER_CHANCE) {
      const eligible = getEligiblePoolEvents(EVENT_POOLS[action.event_pool_id]);
      if (eligible.length > 0) state.pendingEvent = selectBalancedEvent(eligible);
    }
    // Mort per cost (execute_cost) — salta event i EOT
    if (state.health <= 0) {
      state._pendingTurnEntry = null;
      state.pendingEvent = null;
      triggerSuccession();
      renderAll();
      saveGame();
      return;
    }
    // ── SEQ-01: apliquem output + side_effects SEMPRE aquí (al fi d'acció) ──
    // Tant si vindrà event com si no, l'output de l'acció és visible en acabar
    // el donut d'ACCIÓ. L'event és un beat separat posterior.
    const snapOut = snapshotNums();
    if (outDef && output > 0) {
      const newVal = (state[outRes] || 0) + output;
      state[outRes] = outRes === 'food' ? Math.min(foodMax(), newVal) : outDef.max != null ? Math.min(outDef.max, newVal) : newVal;
    }
    if (action.side_effects) {
      for (const se of action.side_effects) {
        const resDef = RESOURCE_DEFS.find(r => r.id === se.resource);
        if (!resDef) continue;
        const newVal = (state[se.resource] || 0) + se.delta;
        state[se.resource] = resDef.max != null ? Math.max(0, Math.min(resDef.max, newVal)) : Math.max(0, newVal);
      }
    }
    applyFxFloaters(snapOut);
    // renderAll perquè els comptadors del panell reflecteixin el canvi JA
    renderAll();
    if (state.health <= 0) {
      state._pendingTurnEntry = null;
      triggerSuccession();
      renderAll();
      saveGame();
      return;
    }
    if (state.pendingEvent) {
      // SEQ-01: l'output ja s'ha aplicat; aquí NOMÉS esperem que el jugador
      // resolgui l'event (beat separat). No hi ha pendingActionResult.
      // 200ms de pausa abans de mostrar l'event
      setTimeout(() => { renderAll(); saveGame(); }, 200);
      return;
    }
    // 200ms de pausa i llavors donut de final de torn
    setTimeout(() => proceedToEndOfTurn(), 200);
  });
}

// ═══════════════════════════════════════════════════════════ ANIMATION SYSTEM

// Snapshot current numeric values
function snapshotNums() {
  return {
    food:     state.food,
    health:   state.health,
    material: state.material,
    forca:    state.character.stats['forca'],
    enginy:   state.character.stats['enginy'],
    vincle:   state.character.stats['vincle'],
  };
}

// Floating +/- numbers near UI elements
function applyFxFloaters(before) {
  const cur = snapshotNums();
  const anchorMap = {
    food:    'hex-food',
    health:  'hex-health',
    material:'tok-material-val',
    forca:   'hex-forca',
    enginy:  'hex-enginy',
    vincle:  'hex-vincle',
  };
  for (const [k, anchorId] of Object.entries(anchorMap)) {
    const delta = (cur[k] || 0) - (before[k] || 0);
    if (Math.abs(delta) < 0.001) continue;
    const anchor = el(anchorId);
    if (!anchor) continue;
    // Flash the parent vital-cell or attr-chip
    const flashTarget = anchor.closest('.vital-cell') || anchor.closest('.attr-chip') || anchor.closest('.meta-chip');
    if (flashTarget) { flashTarget.classList.remove('lit-flash'); void flashTarget.offsetWidth; flashTarget.classList.add('lit-flash'); }
    const rect = anchor.getBoundingClientRect();
    const div = document.createElement('div');
    div.className = `float-num ${delta > 0 ? 'pos' : 'neg'}`;
    const isStatKey = ['forca', 'enginy', 'vincle'].includes(k);
    if (isStatKey) {
      div.textContent = delta > 0 ? '+' : '−';
    } else {
      div.textContent = (delta > 0 ? '+' : '') + (Number.isInteger(delta) ? delta : delta.toFixed(1));
    }
    div.style.left = (rect.left + rect.width / 2 - 14) + 'px';
    div.style.top  = rect.top + 'px';
    document.body.appendChild(div);
    div.addEventListener('animationend', () => div.remove());
  }
}

// Elimina floaters de número que encara s'estiguin animant (separa fases visualment)
function clearFloaters() {
  document.querySelectorAll('.float-num').forEach(n => n.remove());
}

// Resource balls flying from donut to top bar
function spawnResBalls(before) {
  const cur = snapshotNums();
  const resConfig = [
    { key: 'material', targetId: 'tok-material', valId: 'tok-material-val' },
  ];
  const sourceEl = el('exec-donut-wrap');
  if (!sourceEl) return;
  const srcRect = sourceEl.getBoundingClientRect();
  const srcCX = srcRect.left + srcRect.width / 2;
  const srcCY = srcRect.top  + srcRect.height / 2;

  resConfig.forEach(({ key, targetId, valId }) => {
    const delta = Math.round((cur[key] || 0) - (before[key] || 0));
    if (delta <= 0) return;
    const targetEl = el(targetId);
    const valEl    = el(valId);
    if (!targetEl || !valEl) return;
    const tRect = targetEl.getBoundingClientRect();
    const tCX = tRect.left + tRect.width / 2;
    const tCY = tRect.top  + tRect.height / 2;
    const count  = Math.min(delta, 5);
    const perBall = Math.floor(delta / count);
    for (let i = 0; i < count; i++) {
      const amount = i === count - 1 ? delta - perBall * (count - 1) : perBall;
      setTimeout(() => {
        const ball = document.createElement('div');
        ball.className = `res-ball res-ball-${key}`;
        ball.style.left = srcCX + 'px';
        ball.style.top  = srcCY + 'px';
        document.body.appendChild(ball);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          ball.style.transition = 'left 0.5s cubic-bezier(0.2,0.8,0.4,1), top 0.5s cubic-bezier(0.2,0.8,0.4,1), opacity 0.2s ease 0.35s';
          ball.style.left    = tCX + 'px';
          ball.style.top     = tCY + 'px';
          ball.style.opacity = '0';
          setTimeout(() => {
            ball.remove();
            targetEl.classList.remove('tok-bump');
            void targetEl.offsetWidth;
            targetEl.classList.add('tok-bump');
          }, 560);
        }));
      }, i * 80);
    }
  });
}

// Animated counter tick for char panel stats
function animateCounters(before) {
  const cur = snapshotNums();
  const targets = [
    { key: 'food',   id: 'hex-food',   fmt: v => `${Math.round(v)}/${foodMax()}` },
    { key: 'health', id: 'hex-health', fmt: v => Math.round(v) },
    { key: 'forca',  id: 'hex-forca',  fmt: v => v.toFixed(1) },
    { key: 'enginy', id: 'hex-enginy', fmt: v => v.toFixed(1) },
    { key: 'vincle', id: 'hex-vincle', fmt: v => v.toFixed(1) },
  ];
  const anyChange = targets.some(t => Math.abs((cur[t.key]||0) - (before[t.key]||0)) > 0.001);
  if (!anyChange) return;
  const start = performance.now();
  const dur   = 500;
  function tick(now) {
    const t    = Math.min(1, (now - start) / dur);
    const ease = 1 - Math.pow(1 - t, 3);
    for (const { key, id, fmt } of targets) {
      const e = el(id);
      if (!e) continue;
      const from = before[key] || 0;
      const to   = cur[key]    || 0;
      e.textContent = fmt(from + (to - from) * ease);
    }
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// Donut animation over the map zone
function showDonutAnimation(action, label, onComplete) {
  const icon = action._icon || getActionIcon(action);
  el('exec-donut-icon').textContent = icon;
  const labelEl = el('exec-donut-label');
  if (labelEl) labelEl.textContent = label || action.name || '';
  const ring = el('exec-donut-ring');
  const C    = 106.8;
  ring.style.stroke          = 'var(--gold)';
  ring.style.transition      = 'none';
  ring.style.strokeDasharray = `0 ${C}`;
  show('exec-donut-overlay');
  document.body.classList.add('donut-active');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    ring.style.transition      = `stroke-dasharray 1.1s linear`;
    ring.style.strokeDasharray = `${C} 0`;
  }));
  setTimeout(() => {
    hide('exec-donut-overlay');
    ring.style.transition      = 'none';
    ring.style.strokeDasharray = `0 ${C}`;
    document.body.classList.remove('donut-active');
    onComplete();
  }, 1250);
}

// ═══════════════════════════════════════════════════════════ SKY / SUN / LIFE
function computeLifeProgress() {
  return Math.min(1, state?.lifeProgress || 0);
}

function getSkyStage(progress) {
  if (progress < 0.25) return 'sky-albada';
  if (progress < 0.60) return 'sky-dia';
  if (progress < 0.85) return 'sky-ocas';
  return 'sky-nit';
}

function bezierArcPoint(t) {
  const x = (1 - t) * (1 - t) * 5 + 2 * (1 - t) * t * 50 + t * t * 95;
  const y = (1 - t) * (1 - t) * 27 + 2 * (1 - t) * t * 8 + t * t * 27;
  return { x, y };
}

const SKY_LABELS = { 'sky-albada': 'Albada', 'sky-dia': 'Dia', 'sky-ocas': 'Ocàs', 'sky-nit': 'Nit' };
const SKY_ICONS  = { 'sky-albada': '🌅', 'sky-dia': '☀️', 'sky-ocas': '🌆', 'sky-nit': '🌙' };

function renderSky() {
  const progress = computeLifeProgress();
  const skyEl = el('layer-sky');
  const stage = getSkyStage(progress);
  if (skyEl) {
    skyEl.className = stage;
    skyEl.setAttribute('aria-label', `Etapa de vida: ${SKY_LABELS[stage]}`);
  }
  const stageLabel = el('sky-stage-label');
  if (stageLabel) stageLabel.textContent = `${SKY_ICONS[stage]} ${SKY_LABELS[stage]}`;

  // Animate SVG sky gradient to match life stage
  const SVG_SKY_STOPS = {
    'sky-albada': ['#e8a0c0', '#f0cdb0', '#e8dfc0'],
    'sky-dia':    ['#77b3d6', '#a6cdd2', '#dbe5c4'],
    'sky-ocas':   ['#2a2a60', '#6a4a72', '#c06040'],
    'sky-nit':    ['#101230', '#1e1840', '#2a1c0e'],
  };
  const stops = SVG_SKY_STOPS[stage];
  if (stops) {
    const sTop = document.getElementById('wg-sky-top');
    const sMid = document.getElementById('wg-sky-mid');
    const sBot = document.getElementById('wg-sky-bot');
    if (sTop) sTop.setAttribute('stop-color', stops[0]);
    if (sMid) sMid.setAttribute('stop-color', stops[1]);
    if (sBot) sBot.setAttribute('stop-color', stops[2]);
  }

  const t = Math.min(0.985, progress);
  const sunPos = bezierArcPoint(t);

  const sunCore = el('sun-core');
  const sunGlow = el('sun-glow');
  if (sunCore) { sunCore.setAttribute('cx', sunPos.x.toFixed(2)); sunCore.setAttribute('cy', sunPos.y.toFixed(2)); }
  if (sunGlow) { sunGlow.setAttribute('cx', sunPos.x.toFixed(2)); sunGlow.setAttribute('cy', sunPos.y.toFixed(2)); }

  const traveledPath = el('sun-traveled');
  if (traveledPath && t > 0.01) {
    const cp = { x: 5 + t * 45, y: 27 - t * 19 };
    traveledPath.setAttribute('d', `M 5 27 Q ${cp.x.toFixed(1)} ${cp.y.toFixed(1)} ${sunPos.x.toFixed(1)} ${sunPos.y.toFixed(1)}`);
  }

  const deathLine = el('sun-death-line');
  if (deathLine) {
    deathLine.setAttribute('x1', sunPos.x.toFixed(2));
    deathLine.setAttribute('y1', sunPos.y.toFixed(2));
    deathLine.setAttribute('x2', '95');
    deathLine.setAttribute('y2', '27');
  }

}

// ═══════════════════════════════════════════════════════════ FORMING BRANCH PILL
function getFormingBranch() {
  const activeBranches = new Set(getActiveBranches().map(b => b.id));
  const pct = getBranchPct();
  let best = null;
  let bestRawPct = 0.20;
  for (const branch of BRANCHES) {
    if (activeBranches.has(branch.id)) continue;
    const axis = BRANCH_AXIS[branch.id];
    if (!axis) continue;
    const rawPct = pct[axis];
    if (rawPct > bestRawPct) {
      bestRawPct = rawPct;
      best = {
        branch,
        axis,
        rawPct,
        pct: rawPct / BRANCH_ACTIVATION_PCT,  // 0–1 progress toward activation
        atRisk: false,
      };
    }
  }
  return best;
}

function showFormingBranchTooltip(forming) {
  const existing = document.getElementById('forming-tooltip');
  if (existing) existing.remove();

  // Cerca acció disponible que millori l'eix principal
  let suggAction = null;
  let bestDelta = 0;
  for (const action of ACTIONS) {
    const delta = action.inclination_deltas?.[forming.axis] ?? 0;
    if (delta > bestDelta) { bestDelta = delta; suggAction = action; }
  }

  const rawInt   = Math.round(forming.rawPct * 100);
  const threshInt = Math.round(BRANCH_ACTIVATION_PCT * 100);
  const tip = document.createElement('div');
  tip.id = 'forming-tooltip';
  tip.className = 'forming-tooltip';
  tip.innerHTML = [
    `<strong>${forming.branch.name}</strong>`,
    `${rawInt}% / ${threshInt}% — cal ${threshInt - rawInt}% més`,
    suggAction ? `Acció: <em>${suggAction.name}</em>` : null,
  ].filter(Boolean).join('<br>');

  document.body.appendChild(tip);
  const autoClose = setTimeout(() => tip.remove(), 3500);
  tip.addEventListener('click', () => { clearTimeout(autoClose); tip.remove(); });
}

function showPillInfoTooltip(title, body) {
  const existing = document.getElementById('pill-info-tooltip');
  if (existing) existing.remove();
  const tip = document.createElement('div');
  tip.id = 'pill-info-tooltip';
  tip.className = 'pill-info-tooltip';
  tip.innerHTML = `<strong>${title}</strong><br>${body}`;
  document.body.appendChild(tip);
  const autoClose = setTimeout(() => tip.remove(), 3500);
  tip.addEventListener('click', () => { clearTimeout(autoClose); tip.remove(); });
}

// ═══════════════════════════════════════════════════════════ ZONE MAP RENDERING
function renderZoneNodes() {
  const mapZone = el('layer-nodes');
  mapZone.innerHTML = '';
  for (const zoneDef of ZONE_DEFS) {
    if (!state.discoveredZoneIds.has(zoneDef.id)) continue;
    const pos = ZONE_POS[zoneDef.id] || { left: 50, top: 50 };
    const node = document.createElement('button');
    node.className    = 'zone-node';
    node.dataset.zone = zoneDef.id;
    node.style.left   = pos.left + '%';
    node.style.top    = pos.top  + '%';
    // Zone info chips
    let chipHtml = '';
    if (zoneDef.id === 'Campament' && ((state.pedra || 0) > 0 || (state.eina || 0) > 0)) {
      const pedraChip = (state.pedra || 0) > 0 ? `<span>🪨 ${state.pedra}</span>` : '';
      const einaChip  = (state.eina  || 0) > 0 ? `<span>⚒️ ${state.eina}</span>` : '';
      chipHtml = `<div class="zone-chip">${pedraChip}${einaChip}</div>`;
    }
    if (zoneDef.id === 'Llar' && state.character.partnerName) {
      const fills = state.character.children.length;
      const fillsChip = fills > 0 ? `<span>👶×${fills}</span>` : '';
      chipHtml = `<div class="zone-chip"><span>💑 ${state.character.partnerName}</span>${fillsChip}</div>`;
    }
    node.innerHTML = `<span class="zone-node-name">${zoneDef.label || zoneDef.id}</span>${chipHtml}`;
    node.addEventListener('touchstart', e => { e.preventDefault(); node.classList.add('zone-node-pressed'); }, { passive: false });
    node.addEventListener('touchend', e => {
      e.preventDefault();
      node.classList.remove('zone-node-pressed');
      if (document.querySelector('#overlay-zone-actions:not(.hidden), #overlay-action:not(.hidden)')) return;
      openZoneSheet(zoneDef.id);
    });
    node.addEventListener('touchcancel', () => node.classList.remove('zone-node-pressed'));
    node.addEventListener('mousedown',   () => node.classList.add('zone-node-pressed'));
    node.addEventListener('mouseup', () => {
      node.classList.remove('zone-node-pressed');
      if (document.querySelector('#overlay-zone-actions:not(.hidden), #overlay-action:not(.hidden)')) return;
      openZoneSheet(zoneDef.id);
    });
    node.addEventListener('mouseleave', () => node.classList.remove('zone-node-pressed'));
    mapZone.appendChild(node);
  }

  // Zones no descobertes amb starts_discovered:false — mostrar com a blocat
  for (const zoneDef of ZONE_DEFS) {
    if (zoneDef.starts_discovered !== false) continue;
    if (state.discoveredZoneIds.has(zoneDef.id)) continue;
    const pos = ZONE_POS[zoneDef.id] || { left: 50, top: 50 };
    const locked = document.createElement('div');
    locked.className = 'zone-node zone-node-locked';
    locked.style.left = pos.left + '%';
    locked.style.top  = pos.top  + '%';
    locked.innerHTML  = `<span class="zone-node-name" style="opacity:.4">🔒 ${zoneDef.label || zoneDef.id}</span>`;
    mapZone.appendChild(locked);
  }

  // Shop node — always visible
  const shopPos = ZONE_POS['Mercat'] || { left: 50, top: 52 };
  const shopNode = document.createElement('button');
  shopNode.className  = 'zone-node zone-node-shop';
  shopNode.style.left = shopPos.left + '%';
  shopNode.style.top  = shopPos.top  + '%';
  shopNode.innerHTML  = `
    <div class="zone-node-icon" style="font-size:3rem">🏪</div>
    <span class="zone-node-name">Mercat</span>`;
  shopNode.addEventListener('touchstart', e => { e.preventDefault(); shopNode.classList.add('zone-node-pressed'); }, { passive: false });
  shopNode.addEventListener('touchend', e => {
    e.preventDefault();
    shopNode.classList.remove('zone-node-pressed');
    if (document.querySelector('#overlay-zone-actions:not(.hidden), #overlay-action:not(.hidden)')) return;
    openShop();
  });
  shopNode.addEventListener('touchcancel', () => shopNode.classList.remove('zone-node-pressed'));
  shopNode.addEventListener('mousedown',   () => shopNode.classList.add('zone-node-pressed'));
  shopNode.addEventListener('mouseup', () => {
    shopNode.classList.remove('zone-node-pressed');
    if (document.querySelector('#overlay-zone-actions:not(.hidden), #overlay-action:not(.hidden)')) return;
    openShop();
  });
  shopNode.addEventListener('mouseleave', () => shopNode.classList.remove('zone-node-pressed'));
  mapZone.appendChild(shopNode);
}


// ═══════════════════════════════════════════════════════════ CAROUSEL
const CAROUSEL = { actions: [], idx: 0, zoneId: null, dragStartX: 0, dragDelta: 0, dragging: false, didDrag: false };
const CAROUSEL_STEP = 110;

function getZoneActions(zoneId) {
  const age = characterAge();
  const base = ACTIONS.filter(a => {
    if (a.zona !== zoneId) return false;
    if (!isActionOwned(a)) return false;
    if (getActionVisibility(a) === 'HIDDEN') return false;
    if (a.maxAge !== undefined && age > a.maxAge) return false;
    // always_show_locked: include even when character requirements not met (shown as unavailable)
    if (!evaluateCharacterRequires(a) && !a.always_show_locked) return false;
    // Hide base action when a purchased upgrade supersedes it
    if (ACTIONS.some(u => u.is_upgrade && u.upgrades_action_id === a.id && state.character.purchasedActionIds.has(u.id))) return false;
    return true; // include even if minAge not met — shown as tooYoung
  });
  // Show discovery action if eligible skills exist
  const disc = ACTIONS.find(a => a.is_discovery_action && a.zona === zoneId);
  if (disc && getEligibleSkills().length > 0) base.unshift(disc);
  return base;
}

function isActionTooYoung(action) {
  return action.minAge !== undefined && characterAge() < action.minAge;
}

function openZoneSheet(zoneId) {
  const zoneDef = ZONE_DEFS.find(z => z.id === zoneId);
  if (!zoneDef) return;
  el('zone-sheet-icon').textContent = ZONE_ICONS[zoneId] || '📍';
  el('zone-sheet-name').textContent = zoneDef.label || zoneId;
  CAROUSEL.actions   = getZoneActions(zoneId);
  CAROUSEL.idx       = 0;
  CAROUSEL.zoneId    = zoneId;
  CAROUSEL.dragDelta = 0;
  CAROUSEL.didDrag   = false;
  buildCarouselItems();
  updateCarouselPositions(0);
  updateCarouselInfo();
  show('overlay-zone-actions');
}

function getActionUpgrade(actionId) {
  if (state.character.purchasedActionIds.has(actionId)) return null;
  return ACTIONS.find(a =>
    a.is_upgrade &&
    a.upgrades_action_id === actionId &&
    !state.character.purchasedActionIds.has(a.id) &&
    evaluateCharacterRequires(a) &&
    (a.universal_prereq ? state.discoveredUniversalTechIds.has(a.universal_prereq) : true)
  ) || null;
}

function buildCarouselItems() {
  const vp = el('zone-carousel-viewport');
  vp.innerHTML = '';
  CAROUSEL.actions.forEach((action, i) => {
    const vis     = getActionVisibility(action);
    const faded   = vis === 'FADED';
    const blocked = vis !== 'ACTIVE';
    const unavail = !blocked && !evaluateCharacterRequires(action);
    const upgrade = getActionUpgrade(action.id);
    const item = document.createElement('div');
    item.className = 'zc-item' + (faded ? ' zc-faded' : blocked ? ' zc-blocked' : unavail ? ' zc-unavailable' : '');
    item.dataset.idx = i;
    const upgradeBtn = upgrade
      ? `<button class="zc-upgrade-btn" data-action-id="${action.id}" aria-label="Upgrade disponible">↑</button>`
      : '';
    const tri = statGainTriangles(action.stat_gain);
    const statOverlay = tri.text ? `<span class="zc-stat-ind${tri.neg ? ' neg' : ''}">${tri.text}</span>` : '';
    item.innerHTML = `<span class="zc-icon-wrap"><span class="zc-icon">${getActionIcon(action)}</span>${statOverlay}</span><button class="zc-info-btn" aria-label="Info">ⓘ</button>${upgradeBtn}`;
    vp.appendChild(item);
  });
  const dotsEl = el('zc-dots');
  dotsEl.innerHTML = '';
  if (CAROUSEL.actions.length > 1) {
    CAROUSEL.actions.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'zc-dot' + (i === 0 ? ' active' : '');
      dotsEl.appendChild(d);
    });
  }
}

function applyCarouselItem(item, offset, dragPx) {
  const x       = offset * CAROUSEL_STEP + dragPx;
  const absNorm = Math.abs(x) / CAROUSEL_STEP;
  const scale   = Math.max(0.48, 1 - Math.min(absNorm, 2) * 0.26);
  const rotY    = -(x / CAROUSEL_STEP) * 18;
  const opacity = Math.max(0.35, 1 - absNorm * 0.25);
  const zi      = Math.max(0, Math.round(10 - Math.abs(x) / 18));
  item.style.transition = dragPx !== 0 ? 'none' : 'transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.3s';
  item.style.transform  = `translateX(${x}px) scale(${scale}) rotateY(${rotY}deg)`;
  item.style.opacity    = opacity;
  item.style.zIndex     = zi;
  item.classList.toggle('zc-active', Math.abs(x) < 5 && dragPx === 0);
}

function updateCarouselPositions(dragPx) {
  const n = CAROUSEL.actions.length;
  Array.from(el('zone-carousel-viewport').querySelectorAll('.zc-item')).forEach(item => {
    let offset = parseInt(item.dataset.idx) - CAROUSEL.idx;
    if (n > 1) {
      while (offset >  n / 2) offset -= n;
      while (offset < -n / 2) offset += n;
    }
    applyCarouselItem(item, offset, dragPx);
  });
  Array.from(el('zc-dots').children).forEach((d, i) => d.classList.toggle('active', i === CAROUSEL.idx));
}

function springEffect(dir) {
  const n = CAROUSEL.actions.length;
  if (n <= 1) return;
  const items = Array.from(el('zone-carousel-viewport').querySelectorAll('.zc-item'));
  if (!items.length) return;
  const wrappedOffset = i => {
    let o = i - CAROUSEL.idx;
    while (o >  n / 2) o -= n;
    while (o < -n / 2) o += n;
    return o;
  };
  items.forEach(item => {
    item.style.transition = 'none';
    applyCarouselItem(item, wrappedOffset(parseInt(item.dataset.idx)), dir * 14);
  });
  requestAnimationFrame(() => requestAnimationFrame(() =>
    items.forEach(item => applyCarouselItem(item, wrappedOffset(parseInt(item.dataset.idx)), 0))
  ));
}

function carouselNavigate(newIdx) {
  const n = CAROUSEL.actions.length;
  if (n === 0) return;
  const dir = newIdx > CAROUSEL.idx ? 1 : -1;
  CAROUSEL.idx = ((newIdx % n) + n) % n;
  updateCarouselPositions(0);
  updateCarouselInfo();
  springEffect(dir);
}

function updateCarouselInfo() {
  const { actions, idx } = CAROUSEL;
  if (!actions.length) {
    el('zc-name').textContent  = 'Cap acció disponible';
    el('zc-benefits').innerHTML = '';
    el('zc-desc').textContent     = 'Desbloqueja accions aprenent habilitats.';
    return;
  }
  const action   = actions[idx];
  const tooYoung = isActionTooYoung(action);
  const vis      = getActionVisibility(action);
  const faded    = !tooYoung && vis === 'FADED';
  const blocked  = tooYoung || vis !== 'ACTIVE';
  const outIcons = { food: '🌾', material: '🔵', health: '❤️', pedra: '🪨', eina: '⚒️', branques: '🌿' };
  const parts = [];
  const _resTri = (mag, pos) => { const n = mag >= 8 ? 3 : mag > 4 ? 2 : 1; return (pos ? '▲' : '▼').repeat(n); };
  if ((action.execute_cost || 0) > 0) {
    parts.push(`<span class="benefit-stat-badge neg">🌾<span class="bsb-tri neg">▼</span></span>`);
  }
  if (!blocked && action.output_resource && action.output_min != null) {
    const icon = outIcons[action.output_resource] || '📦';
    const tri = _resTri(action.output_max, true);
    parts.push(`<span class="benefit-stat-badge">${icon}<span class="bsb-tri">${tri}</span></span>`);
  }
  if (action.side_effects) {
    for (const se of action.side_effects) {
      const icon = outIcons[se.resource] || '📦';
      const abs = Math.abs(se.delta);
      const tri = _resTri(abs, se.delta > 0);
      const cls = se.delta < 0 ? ' neg' : '';
      parts.push(`<span class="benefit-stat-badge${cls}">${icon}<span class="bsb-tri${cls}">${tri}</span></span>`);
    }
  }

  if (action.food_cap_delta) {
    parts.push(`<span class="benefit-stat-badge">📦<span class="bsb-tri">+${action.food_cap_delta}</span></span>`);
  }
  if (action.character_effect?.type === 'explore_zone') {
    parts.push(`<span class="benefit-stat-badge">🗺️<span class="bsb-tri">?</span></span>`);
  }
  if (state.character.purchasedActionIds.has('act_talla_avancada') && action.requires?.some(r => r.resource === 'eina')) {
    parts.push('⭐ eines qualitat');
  }
  if (action.stat_key && action.stat_gain) {
    const statEmoji = { forca: '💪', enginy: '🧠', vincle: '🔗' };
    const abs = Math.abs(action.stat_gain);
    const triCount = abs <= 0.07 ? 1 : abs <= 0.12 ? 2 : 3;
    const triChar = action.stat_gain > 0 ? '▲' : '▽';
    const negClass = action.stat_gain < 0 ? ' neg' : '';
    parts.push(`<span class="benefit-stat-badge">${statEmoji[action.stat_key] || '⬆️'}<span class="bsb-tri${negClass}">${triChar.repeat(triCount)}</span></span>`);
  }
  // Show resource requirements
  const resourceReqMet = evaluateCharacterRequires(action);
  el('zc-name').textContent = action.name;
  el('zc-benefits').innerHTML = parts.join('  ');
  el('zc-desc').textContent     = tooYoung
    ? 'No tens edat per a això'
    : faded
    ? '〰 La branca s\'allunya — acció al límit de la inclinació'
    : blocked
    ? '🔒 Inclinació insuficient'
    : !resourceReqMet
    ? (() => {
        const unmet = (action.requires || []).filter(r => r.resource && (state[r.resource] || 0) < r.min);
        return unmet.map(r => `⛔ Necessites ${r.min} ${outIcons[r.resource] || r.resource}`).join(' · ');
      })()
    : (action.description || '');
}

function carouselOpenCurrent() {
  const action = CAROUSEL.actions[CAROUSEL.idx];
  if (!action) return;
  executeAction(action.id);
}

// ═══════════════════════════════════════════════════════════ CHARACTER PANEL
function bustImgSrc() {
  const race   = state.race   || 'MED';
  const gender = state.gender || 'M';
  return `../../design/life-tycoon/characters/PRE-${race}-${gender}-BUST.png`;
}

function renderCharPanel() {
  // Portrait
  el('char-bust-img').src = bustImgSrc();
  el('char-name-inlay').textContent = state.character.label || state.dynastyName || '—';
  el('char-gen-inlay').textContent  = `Generació ${state.generation} · ${characterAge()} cicles`;

  // Attrs (right column of left half)
  el('hex-forca').textContent  = (state.character.stats['forca']  || 0).toFixed(1);
  el('hex-enginy').textContent = (state.character.stats['enginy'] || 0).toFixed(1);
  el('hex-vincle').textContent = (state.character.stats['vincle'] || 0).toFixed(1);

  // Vital: food
  el('hex-food').textContent = `${Math.round(state.food)}/${foodMax()}`;
  const childUpkeep  = state.character.children.length;
  const aprUpkeepRed = [...state.character.aprenentatges].reduce((s, aid) => {
    const a = APRENENTATGE_DEFS.find(d => d.id === aid);
    return a?.effect?.type === 'food_upkeep_reduction' ? s + a.effect.value : s;
  }, 0);
  const foodUpkeep   = Math.max(0.5, FOOD_UPKEEP - (state.foodUpkeepReduction || 0) - aprUpkeepRed) + childUpkeep;
  const foodDanger   = state.food < foodUpkeep;
  const foodRateEl   = el('hex-food-rate');
  if (foodRateEl) {
    const fVal = foodUpkeep % 1 === 0 ? foodUpkeep : foodUpkeep.toFixed(1);
    foodRateEl.textContent = '↓' + fVal;
    foodRateEl.className   = 'vital-rate vital-rate-neg' + (foodDanger ? ' vital-rate-danger' : '');
  }
  const vitalFood = el('vital-food');
  if (vitalFood) vitalFood.classList.toggle('pulse', foodDanger);

  // Vital: health
  el('hex-health').textContent = Math.round(state.health);
  const age = characterAge();
  const healthRateEl = el('hex-health-rate');
  if (healthRateEl) {
    let hDelta = 0;
    if (age <= HEALTH_GROW_TURNS) { hDelta = 1; }
    else if (age > HEALTH_GROW_TURNS + HEALTH_STABLE_TURNS) { hDelta = -getAgingLoss(age); }
    if (hDelta !== 0) {
      const hDanger = hDelta < 0 && state.health <= Math.abs(hDelta);
      healthRateEl.textContent = (hDelta > 0 ? '↑' : '↓') + Math.abs(hDelta);
      healthRateEl.className   = 'vital-rate ' + (hDelta > 0 ? 'vital-rate-pos' : 'vital-rate-neg') + (hDanger ? ' vital-rate-danger' : '');
    } else {
      healthRateEl.textContent = '';
      healthRateEl.className   = 'vital-rate';
    }
  }

  // Vital warn badges (! blinking inside each vital cell)
  const agingLoss  = getAgingLoss(age);
  const foodPenalty = foodDanger ? 10 : 0;
  const totalHLoss  = foodPenalty + agingLoss;
  const willDie     = state.health <= totalHLoss;
  const foodWarnEl  = el('vital-warn-food');
  const hlthWarnEl  = el('vital-warn-health');
  if (foodWarnEl)  foodWarnEl.classList.toggle('hidden', !foodDanger);
  const healthCrit = willDie;
  if (hlthWarnEl)  hlthWarnEl.classList.toggle('hidden', !healthCrit);

  // Branch badges + forming pill
  const branchEl = el('branch-badges');
  branchEl.innerHTML = '';
  const activeBranches = getActiveBranches();
  const primaryBranch  = getPrimaryBranch();
  for (const b of activeBranches) {
    const isPrimary = activeBranches.length === 1 || b.id === primaryBranch?.id;
    const pill = document.createElement('span');
    pill.className   = isPrimary ? 'pill-branch' : 'pill-branch pill-branch-secondary';
    pill.textContent = isPrimary ? b.name : b.name + ' ✦';
    pill.title       = isPrimary ? 'Branca principal — accions i eina' : 'Branca secundària — accions (sense eina)';
    pill.style.cursor = 'pointer';
    pill.addEventListener('click', () => showPillInfoTooltip(b.name, b.desc || ''));
    branchEl.appendChild(pill);
  }
  // Forming branch pill (ghost) — mostra sempre, fins i tot si ja hi ha branques actives
  {
    const forming = getFormingBranch();
    if (forming) {
      const pct = Math.min(1, forming.pct);
      const isNear = pct >= 0.8;
      const pill = document.createElement('span');
      const isAtRisk = !!forming.atRisk;
      const stage = forming.rawPct >= 0.27 ? 'stage-colored' : 'stage-early';
      pill.className = 'pill-forming ' + stage + (isNear ? ' near' : '') + (isAtRisk ? ' at-risk' : '');
      pill.style.pointerEvents = 'all';
      pill.style.cursor = 'pointer';
      const fillDiv = document.createElement('div');
      fillDiv.className = 'form-fill';
      fillDiv.style.width = (pct * 100).toFixed(0) + '%';
      const label = document.createElement('span');
      label.textContent = (isAtRisk ? '⚠ ' : isNear ? '✦ ' : '') + forming.branch.name + ' ⓘ';
      pill.appendChild(fillDiv);
      pill.appendChild(label);
      pill.addEventListener('click', () => showFormingBranchTooltip(forming));
      branchEl.appendChild(pill);
    }
  }

  // Skill pills
  const skillEl = el('skill-badges');
  skillEl.innerHTML = '';
  for (const skillId of state.character.unlockedSkillIds) {
    const bt = SKILL_DEFS.find(t => t.id === skillId);
    if (!bt) continue;
    const pill = document.createElement('span');
    pill.className   = 'pill-skill';
    pill.textContent = bt.name;
    skillEl.appendChild(pill);
  }

  // Destresa pills
  const destreseEl = el('destresa-badges');
  if (destreseEl) {
    destreseEl.innerHTML = '';
    for (const dId of state.character.destreses) {
      const def = DESTRESA_DEFS.find(d => d.id === dId);
      if (!def) continue;
      const pill = document.createElement('span');
      pill.className   = 'pill-destresa';
      pill.textContent = '⭐ ' + def.name;
      const linkedAction = ACTIONS.find(a => a.id === def.action_id);
      pill.addEventListener('click', () => showPillInfoTooltip(
        '⭐ ' + def.name,
        `Capacitat innata. Millora "${linkedAction?.name || def.action_id}" en +${DESTRESA_BONUS} al resultat.`
      ));
      destreseEl.appendChild(pill);
    }
  }

  // Aprenentatge pills
  const aprEl = el('aprenentatge-badges');
  if (aprEl) {
    aprEl.innerHTML = '';
    for (const aId of state.character.aprenentatges) {
      const def = APRENENTATGE_DEFS.find(d => d.id === aId);
      if (!def) continue;
      const pill = document.createElement('span');
      pill.className   = 'pill-aprenentatge';
      pill.textContent = def.icon + ' ' + def.name;
      const aprDesc = [def.description, def.effect?.desc ? `Efecte: ${def.effect.desc}` : ''].filter(Boolean).join('\n');
      pill.addEventListener('click', () => showPillInfoTooltip(
        def.icon + ' ' + def.name,
        aprDesc
      ));
      aprEl.appendChild(pill);
    }
  }
}

// ═══════════════════════════════════════════════════════════ TOP BAR
function renderTopBar() {
  const matDef = RESOURCE_DEFS.find(r => r.id === 'material');
  const matMax = matDef?.max;
  el('tok-material-val').textContent = matMax ? `${Math.round(state.material || 0)}/${matMax}` : Math.round(state.material || 0);
}

// ═══════════════════════════════════════════════════════════ BOTTOM PANEL
function renderBottomPanel() {
  el('panel-turn-info').textContent = `Cicle ${state.cycle}/${ERA_CYCLES}`;
  const logEl = el('session-log-list');
  logEl.innerHTML = '';
  for (const msg of state.log) {
    const li = document.createElement('li');
    li.textContent = msg;
    logEl.appendChild(li);
  }
}

// ═══════════════════════════════════════════════════════════ TURN HISTORY OVERLAY
// LOG-01: format de deltes de recursos per a l'historial de torns.
const RES_ICON = { food: '🌾', health: '❤️', material: '🔵', pedra: '🪨', eina: '⚒️' };
function fmtPairs(pairs) {
  return pairs.filter(([, d]) => d).map(([r, d]) => `${d > 0 ? '+' : ''}${d}${RES_ICON[r] || ''}`).join(' ');
}
function openTurnHistory() {
  const hist = state.turnHistory || [];
  const listEl = el('th-list');
  if (!listEl) return;
  listEl.innerHTML = '';
  if (hist.length === 0) {
    listEl.innerHTML = '<li class="th-empty">Cap torn registrat encara.</li>';
  } else {
    for (const entry of hist) {
      const li = document.createElement('li');
      li.className = 'th-entry';
      // Acció: nou esquema { name, delta } o llegat (string)
      const actName  = typeof entry.action === 'object' ? (entry.action?.name || '—') : (entry.action || '—');
      const actDelta = (typeof entry.action === 'object' && entry.action?.delta) ? ` <span class="th-delta">${entry.action.delta}</span>` : '';
      // Events: nou (array) o llegat (entry.event / eventChoice)
      const evs = Array.isArray(entry.events) ? entry.events
                : entry.event ? [{ name: entry.event, choice: entry.eventChoice, delta: '' }] : [];
      const evLine = evs.map(e =>
        `<span class="th-event">⚡ ${e.name}</span>${e.choice ? `<span class="th-choice">→ ${e.choice}</span>` : ''}${e.delta ? ` <span class="th-delta">${e.delta}</span>` : ''}`
      ).join('');
      const discLine  = (entry.discoveries || []).map(d => `<span class="th-disc">✦ ${d}</span>`).join('');
      const skillLine = (entry.skills || []).map(s => `<span class="th-skill">🧩 ${s}</span>`).join('');
      li.innerHTML = `<span class="th-cycle">C${entry.cycle}</span>`
        + `<span class="th-action">${actName}${actDelta}</span>`
        + evLine + discLine + skillLine
        + `<span class="th-upkeep">${entry.upkeep || ''}</span>`;
      listEl.appendChild(li);
    }
  }
  show('overlay-turn-history');
}

// ═══════════════════════════════════════════════════════════ IN-MAP OVERLAYS
function renderInMapOverlay() {
  // Pending discoveries (tech / skill / zone / destresa)
  if (state.pendingDiscoveries.length > 0) {
    const disc = state.pendingDiscoveries[0];
    el('disc-icon').textContent  = disc.icon;
    el('disc-name').textContent  = disc.name;
    el('disc-badge').textContent = disc._isPartner ? '💑 Nova parella' : disc._isSkill ? '🧩 Nova tècnica' : disc._isDestresa ? '⭐ Nova destresa' : disc._isZone ? '🗺️ Zona descoberta' : disc._isTech ? '✦ DESCOBRIMENT ✦' : disc._isAction ? '🛒 Nova acció' : '✨ Nou descobriment';
    el('disc-desc').textContent  = disc.description || disc.desc || '';
    if (disc.effect?.desc) {
      el('disc-effects').textContent = disc.effect.desc;
    } else {
      el('disc-effects').textContent = '';
    }
    const pane = el('pane-discovery');
    pane.classList.toggle('discovery-tech', !!disc._isTech);
    showPane('pane-discovery');
    return;
  }
  // Pending births
  if (state.pendingBirths.length > 0) {
    const birth = state.pendingBirths[0];
    el('birth-avatar').textContent = '👶';
    el('birth-name').textContent   = birth.childLabel;
    const fills = state.character.children.length;
    const childUpkeepNew = fills;
    const aprUpkeepRedNew = [...state.character.aprenentatges].reduce((s, aid) => {
      const a = APRENENTATGE_DEFS.find(d => d.id === aid);
      return a?.effect?.type === 'food_upkeep_reduction' ? s + a.effect.value : s;
    }, 0);
    const newUpkeep = (Math.max(0.5, FOOD_UPKEEP - (state.foodUpkeepReduction || 0) - aprUpkeepRedNew) + childUpkeepNew).toFixed(1);
    el('birth-virtue').textContent = birth.n === 1
      ? `La successió és assegurada. Consum de menjar ara: −${newUpkeep}/torn.`
      : `${birth.n}è fill. Podreu triar successor. Consum de menjar ara: −${newUpkeep}/torn.`;
    showPane('pane-birth');
    return;
  }
  // Pending event
  if (state.pendingEvent) {
    const ev = state.pendingEvent;
    el('ev-icon').textContent = '⚡';
    el('ev-name').textContent = 'Esdeveniment';
    el('ev-text').textContent = ev.text || '';
    const choicesEl = el('ev-choices');
    choicesEl.innerHTML = '';
    const dismissBtn = el('btn-dismiss-event');
    // EVT-01 fix (2026-06-26): neteja qualsevol impacte ranci d'un event anterior abans de
    // decidir si AQUEST event en mostra un. Sense això, un event amb opcions heretava el
    // "+N" d'un event previ sense opcions (bug del fong: "+3❤️" fantasma).
    const staleImpact = el('ev-impact-hint');
    if (staleImpact) staleImpact.style.display = 'none';

    // EVT-01: helper per construir la línia d'impacte numèric d'un efecte
    function buildImpactHint(fx) {
      if (!fx) return '';
      const parts = [];
      if (fx.food   != null && fx.food   !== 0) parts.push(`${fx.food   > 0 ? '+' : ''}${fx.food}🌾`);
      if (fx.health != null && fx.health !== 0) parts.push(`${fx.health > 0 ? '+' : ''}${fx.health}❤️`);
      if (fx.material != null && fx.material !== 0) parts.push(`${fx.material > 0 ? '+' : ''}${fx.material}🔵`);
      if (fx.pedra != null && fx.pedra !== 0) parts.push(`${fx.pedra > 0 ? '+' : ''}${fx.pedra}🪨`);
      if (fx.eina  != null && fx.eina  !== 0) parts.push(`${fx.eina  > 0 ? '+' : ''}${fx.eina}⚒️`);
      return parts.join('  ');
    }

    if (ev.options && ev.options.length > 0) {
      dismissBtn.style.display = 'none';
      const hasChildren = (state.character.children?.length || 0) > 0;
      const visibleOptions = ev.options
        .map((opt, i) => ({ opt, i }))
        .filter(({ opt }) => {
          if (opt.requires_children && !hasChildren) return false;
          if (opt.requires_no_children && hasChildren) return false;
          if (opt.requires_skill && !state.character.unlockedSkillIds.has(opt.requires_skill)) return false;
          return true;
        });
      visibleOptions.forEach(({ opt, i }) => {
        const btn = document.createElement('button');
        btn.className = 'ev-choice-btn';
        // EVT-01: impacte numèric per opció (food_delta, health_delta)
        const fxParts = [];
        if (opt.food_delta)   fxParts.push(`${opt.food_delta   > 0 ? '+' : ''}${opt.food_delta}🌾`);
        if (opt.health_delta) fxParts.push(`${opt.health_delta > 0 ? '+' : ''}${opt.health_delta}❤️`);
        // Si hi ha skill_modifier, indica que el resultat varia
        if (opt.skill_modifier) fxParts.push('(varia per habilitat)');
        const fxHint = fxParts.length ? `<span class="ev-choice-fx">${fxParts.join('  ')}</span>` : '';
        btn.innerHTML = `<span class="ev-choice-name">${opt.text}</span>${fxHint}`;
        btn.dataset.idx = i;
        btn.addEventListener('click', () => resolveDiscoveryOption(i));
        choicesEl.appendChild(btn);
      });
      // Safety: if all options filtered out, show dismiss
      if (visibleOptions.length === 0) dismissBtn.style.display = '';
    } else {
      dismissBtn.style.display = '';
      // EVT-01: per events de descartar i "troballa", mostra l'impacte numèric
      // directament a la targeta (sota el text de l'event)
      const impactHint = buildImpactHint(ev.effects);
      if (impactHint) {
        // Afegeix o actualitza el div d'impacte dins pane-event
        let impactEl = el('ev-impact-hint');
        if (!impactEl) {
          impactEl = document.createElement('div');
          impactEl.id = 'ev-impact-hint';
          impactEl.className = 'ev-impact-hint';
          // Insereix just abans del botó de descartar
          dismissBtn.insertAdjacentElement('beforebegin', impactEl);
        }
        impactEl.textContent = impactHint;
        impactEl.style.display = '';
      } else {
        const existing = el('ev-impact-hint');
        if (existing) existing.style.display = 'none';
      }
    }
    showPane('pane-event');
    return;
  }
  hide('overlay-action');
}

function showPane(paneId) {
  show('overlay-action');
  ['pane-event', 'pane-discovery', 'pane-birth'].forEach(id => {
    el(id).classList.toggle('hidden', id !== paneId);
  });
}

function dismissDiscovery() {
  // LOG-01: registra el descobriment/event al torn history si és rellevant
  const disc = state.pendingDiscoveries[0];
  if (disc && state._pendingTurnEntry) {
    if (disc._isEvent || disc._isSkill || disc._isTech || disc._isZone || disc._isDestresa || disc._isAprenentatge || disc._isPartner) {
      const prevEvent = state._pendingTurnEntry.event;
      const label = disc.name || disc.icon || 'Event';
      if (!prevEvent) {
        state._pendingTurnEntry.event = label.slice(0, 50);
      }
      // Si ja hi havia un event, afegim-lo com a nota addicional
    }
  }
  state.pendingDiscoveries.shift();
  afterDismiss();
}
function dismissBirth() {
  state.pendingBirths.shift();
  afterDismiss();
}
function applyEventEffects(fx) {
  if (!fx) return;
  if (fx.food)      state.food      = Math.max(0, Math.min(foodMax(), state.food + fx.food));
  if (fx.health)    state.health    = Math.max(0, Math.min(healthMax(), state.health + fx.health));
  if (fx.material)  state.material  = Math.max(0, Math.min(materialMax(), state.material + fx.material));
  if (fx.pedra !== undefined) {
    const def = RESOURCE_DEFS.find(r => r.id === 'pedra');
    state.pedra = Math.max(0, Math.min(def?.max ?? 10, (state.pedra || 0) + fx.pedra));
  }
  if (fx.eina !== undefined) {
    const def = RESOURCE_DEFS.find(r => r.id === 'eina');
    state.eina = Math.max(0, Math.min(def?.max ?? 3, (state.eina || 0) + fx.eina));
  }
}

function applyPendingActionResult() {
  const res = state.pendingActionResult;
  if (!res) return;
  state.pendingActionResult = null;
  if (res.outDef && res.output > 0) {
    const newVal = (state[res.outRes] || 0) + res.output;
    state[res.outRes] = res.outRes === 'food'
      ? Math.min(foodMax(), newVal)
      : res.outDef.max != null ? Math.min(res.outDef.max, newVal) : newVal;
  }
  for (const se of (res.side_effects || [])) {
    const resDef = RESOURCE_DEFS.find(r => r.id === se.resource);
    if (!resDef) continue;
    const newVal = (state[se.resource] || 0) + se.delta;
    state[se.resource] = resDef.max != null ? Math.max(0, Math.min(resDef.max, newVal)) : Math.max(0, newVal);
  }
}

function dismissEvent() {
  const ev = state.pendingEvent;
  if (!ev) return;
  if (ev.is_single_use) state.firedSingleUseEventIds.add(ev.id);
  if (!ev.is_single_use) {
    state.recentEventIds = [...(state.recentEventIds || []), ev.id].slice(-4);
  }
  trackEventFired(ev);
  // SEQ-01: l'output de l'acció JA s'ha aplicat al fi d'acció; aquí apliquem
  // NOMÉS els efectes propis de l'event (beat separat).
  const snapDismiss = snapshotNums();
  applyEventEffects(ev.effects);
  spawnResBalls(snapDismiss);
  applyFxFloaters(snapDismiss);
  // LOG-01: registra l'event al torn (array, amb el seu delta propi)
  if (state._pendingTurnEntry) {
    if (!state._pendingTurnEntry.events) state._pendingTurnEntry.events = [];
    state._pendingTurnEntry.events.push({ name: ev.text.slice(0, 50), choice: '(continua)', delta: fmtPairs(Object.entries(ev.effects || {})) });
  }
  state.pendingEvent = null;
  if (state.health <= 0 || state.lifeProgress >= 1) {
    state._pendingTurnEntry = null;
    triggerSuccession();
    renderAll();
    saveGame();
    return;
  }
  renderAll();
  saveGame();
  // 200ms de pausa abans del donut de final de torn
  setTimeout(() => proceedToEndOfTurn(), 200);
}
function resolveDiscoveryOption(optionIndex) {
  const ev = state.pendingEvent;
  if (!ev || !ev.options) return;
  const opt = ev.options[optionIndex];

  const snapDisc = snapshotNums();
  // SEQ-01: l'output de l'acció JA s'ha aplicat al fi d'acció (no hi ha pendingActionResult).
  // Aquí apliquem NOMÉS els efectes propis de l'opció escollida.

  // Direct resource deltas
  if (opt.food_delta) state.food = Math.max(0, Math.min(foodMax(), state.food + opt.food_delta));

  // Health (may be modified by skill_modifier)
  let healthDelta = opt.health_delta ?? 0;
  if (opt.skill_modifier) {
    const hasSk = state.character.unlockedSkillIds.has(opt.skill_modifier.skill_id);
    if (!hasSk && opt.skill_modifier.absent_health_options) {
      const roll = Math.random();
      healthDelta = opt.skill_modifier.absent_health_options[Math.floor(roll * opt.skill_modifier.absent_health_options.length)];
    } else if (!hasSk) {
      healthDelta = opt.skill_modifier.absent_health_delta ?? healthDelta;
    } else {
      healthDelta = opt.skill_modifier.present_health_delta ?? healthDelta;
    }
  }
  if (healthDelta !== 0) state.health = Math.max(0, Math.min(healthMax(), state.health + healthDelta));

  // Discovery
  if (opt.discovers && ev.discovery_skill_id) {
    const bt = SKILL_DEFS.find(t => t.id === ev.discovery_skill_id);
    if (bt) unlockSkill(bt);
  }
  spawnResBalls(snapDisc);
  applyFxFloaters(snapDisc);

  // Only consume single-use if the player accepted the discovery — declining lets it re-fire in future gens
  if (ev.is_single_use && opt.discovers !== false) state.firedSingleUseEventIds.add(ev.id);
  if (!ev.is_single_use) {
    state.recentEventIds = [...(state.recentEventIds || []), ev.id].slice(-4);
  }
  trackEventFired(ev);
  if (state._pendingTurnEntry) {
    if (!state._pendingTurnEntry.events) state._pendingTurnEntry.events = [];
    const optPairs = [];
    if (opt.food_delta) optPairs.push(['food', opt.food_delta]);
    if (healthDelta)    optPairs.push(['health', healthDelta]);
    state._pendingTurnEntry.events.push({ name: ev.text.slice(0, 50), choice: opt.text.slice(0, 35), delta: fmtPairs(optPairs) });
  }
  state.pendingEvent = null;
  if (state.health <= 0 || state.lifeProgress >= 1) {
    state._pendingTurnEntry = null;
    triggerSuccession();
    renderAll();
    saveGame();
    return;
  }
  renderAll();
  saveGame();
  // 200ms de pausa abans del donut de final de torn
  setTimeout(() => proceedToEndOfTurn(), 200);
}

// ═══════════════════════════════════════════════════════════ FULL-SCREEN OVERLAYS
function renderSuccessionOverlays() {
  hide('overlay-death-summary');
  hide('overlay-succession');
  hide('overlay-new-gen');
  hide('overlay-gameover');
  // Death summary → show before succession choice
  if (state.pendingDeath) {
    const d = state.pendingDeath;
    el('ds-bust').src         = bustImgSrc();
    el('ds-name').textContent = `${d.label} ${state.dynastyName}`;
    el('ds-subtitle').textContent = `Generació ${d.successionPayload.generation} · ${d.age} cicles`;
    el('ds-cause').textContent    = d.cause;
    show('overlay-death-summary');
    return;
  }
  // Succession choice
  if (state.pendingSuccession) {
    const s = state.pendingSuccession;
    el('succ-death-msg').textContent = `El llinatge ${state.dynastyName} continua.`;
    const inheritNote = el('succ-inherit-note');
    if (inheritNote) inheritNote.textContent = `El successor hereta ${Math.round(INCLINATION_INHERITANCE_RATE * 100)}% de la inclinació · ${Math.round(STAT_INHERITANCE_RATE * 100)}% dels atributs · totes les habilitats · 1 destresa innata + 1 nova`;
    const list = el('succ-children-list');
    list.innerHTML = '';
    for (const c of s.successors) {
      const btn = document.createElement('button');
      btn.className = 'succ-child-btn';
      const dominant = c.inheritedInclination
        ? AXES.reduce((a, b) => Math.abs(c.inheritedInclination[a]||0) > Math.abs(c.inheritedInclination[b]||0) ? a : b)
        : null;
      const destresesTags = [...(c.inheritedDestreses || [])].map(did => {
        const d = DESTRESA_DEFS.find(x => x.id === did);
        return d ? `⭐ ${d.name}` : did;
      }).join('  ');
      const aprTags = [...(c.inheritedAprenentatges || [])].map(aid => {
        const a = APRENENTATGE_DEFS.find(x => x.id === aid);
        return a ? `${a.icon} ${a.name}` : aid;
      }).join('  ');
      const tagLine = [destresesTags, aprTags].filter(Boolean).join('  |  ');
      btn.innerHTML = `<span class="succ-child-name">${c.label} ${state.dynastyName}</span><span class="succ-child-sub">${c.is_sibling ? 'Germà' : 'Fill'} · ${dominant ? `Inclinació: ${dominant}` : ''}</span>${tagLine ? `<span class="succ-child-skills">${tagLine}</span>` : ''}`;
      btn.addEventListener('click', () => {
        hide('overlay-succession');
        continueSuccession(c.id);
      });
      list.appendChild(btn);
    }
    show('overlay-succession');
    return;
  }
  // New generation presentation
  if (state.pendingNewGen) {
    const ng = state.pendingNewGen;
    el('new-gen-bust').src    = bustImgSrc();
    el('new-gen-name').textContent    = `${ng.label} ${state.dynastyName}`;
    el('new-gen-subtitle').textContent = `Generació ${ng.generation}`;
    const ngSkillsEl = el('new-gen-skills');
    if (ngSkillsEl) {
      const destrTags = [...state.character.destreses].map(did => {
        const d = DESTRESA_DEFS.find(x => x.id === did);
        return d ? `⭐ ${d.name}` : did;
      });
      const aprTags = [...state.character.aprenentatges].map(aid => {
        const a = APRENENTATGE_DEFS.find(x => x.id === aid);
        return a ? `${a.icon} ${a.name}` : aid;
      });
      ngSkillsEl.textContent = [...destrTags, ...aprTags].join('  ') || '';
    }
    const ring = el('new-gen-ring');
    const C    = 106.8;
    ring.style.transition      = 'none';
    ring.style.strokeDasharray = `0 ${C}`;
    show('overlay-new-gen');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      ring.style.transition      = `stroke-dasharray 1.2s linear`;
      ring.style.strokeDasharray = `${C} 0`;
    }));
    return;
  }
  // Game over — pantalla de fi completa
  if (state.gameOver) {
    renderEndScreen();
    show('overlay-gameover');
    return;
  }
  // Hide all succession overlays if nothing pending
  hide('overlay-death-summary');
  hide('overlay-succession');
  hide('overlay-new-gen');
  hide('overlay-gameover');
}

// ═══════════════════════════════════════════════════════════ TESTING PANEL
function renderTestingPanel() {
  const incl = state.character.inclination;
  const inclEl = el('test-incl-rows');
  inclEl.innerHTML = '';
  for (const axis of AXES) {
    const val    = incl[axis] || 0;
    const labels = AXIS_LABELS[axis];
    const row    = document.createElement('div');
    row.className = 'incl-row';
    const pct    = Math.abs(val) * 50;
    row.innerHTML = `
      <span class="incl-pole">${labels.left}</span>
      <div class="incl-track">
        <div class="incl-center-tick"></div>
        <div class="incl-fill-neg" style="width:${val < 0 ? pct : 0}%"></div>
        <div class="incl-fill-pos" style="width:${val > 0 ? pct : 0}%"></div>
      </div>
      <span class="incl-pole right">${labels.right}</span>
      <span class="incl-val">${val.toFixed(2)}</span>`;
    inclEl.appendChild(row);
  }

  // Branches with pct display
  const activeBranches = getActiveBranches();
  const branchPct = getBranchPct();
  const brEl = el('test-branches');
  brEl.innerHTML = BRANCHES.map(b => {
    const axis = BRANCH_AXIS[b.id];
    const p = axis ? Math.round((branchPct[axis] || 0) * 100) : 0;
    const active = activeBranches.some(ab => ab.id === b.id);
    return `<span class="test-badge test-badge-branch${active ? '' : ' locked'}">${b.name} ${p}%</span>`;
  }).join('');

  // Skills
  const skEl = el('test-skills');
  skEl.innerHTML = SKILL_DEFS.map(bt => {
    const have = state.character.unlockedSkillIds.has(bt.id);
    return `<span class="test-badge test-badge-skill${have ? '' : ' locked'}">${have ? '✓' : '○'} ${bt.name}</span>`;
  }).join('');

  // Destreses
  const dsEl = el('test-destreses');
  dsEl.innerHTML = DESTRESA_DEFS.map(d => {
    const have = state.character.destreses.has(d.id);
    return have
      ? `<span class="test-badge test-badge-destresa">⭐ ${d.name}</span>`
      : `<span class="test-badge test-badge-skill locked">○ ${d.name}</span>`;
  }).join('');

  // Aprenentatges
  const aprTestEl = el('test-aprenentatges');
  if (aprTestEl) {
    aprTestEl.innerHTML = APRENENTATGE_DEFS.map(a => {
      const have = state.character.aprenentatges.has(a.id);
      return have
        ? `<span class="test-badge test-badge-destresa">${a.icon} ${a.name}</span>`
        : `<span class="test-badge test-badge-skill locked">○ ${a.name}</span>`;
    }).join('');
  }

  // Zones
  const zoEl = el('test-zones');
  zoEl.innerHTML = ZONE_DEFS.map(z => {
    const have = state.discoveredZoneIds.has(z.id);
    return `<span class="test-badge test-badge-zone ${have ? 'yes' : 'no'}">${have ? '✓' : '○'} ${z.id}</span>`;
  }).join('');

  // Universal techs
  const utEl = el('test-utechs');
  utEl.innerHTML = UNIVERSAL_TECHS.map(t => {
    const have = state.discoveredUniversalTechIds.has(t.id);
    return `<span class="test-badge test-badge-skill${have ? '' : ' locked'}">${t.icon} ${t.name}${have ? '' : ` (c${t.cycle})`}</span>`;
  }).join('');

  // Char state
  const csEl = el('test-charstate');
  csEl.innerHTML = Object.entries(state.character.charState).map(([k, v]) =>
    `<div class="test-kv">${k} <span>${v}</span></div>`
  ).join('') +
  `<div class="test-kv">fills <span>${state.character.children.length}/${MAX_CHILDREN}</span></div>` +
  `<div class="test-kv">germans pool <span>${state.siblingPool.length}</span></div>`;

  // Log
  const lgEl = el('test-log');
  lgEl.innerHTML = state.log.map(m => `<div class="test-log-item">${m}</div>`).join('');
}

// ═══════════════════════════════════════════════════════════ SCORING
function calculateScore() {
  const cycles    = state.cycle;
  const gens      = state.genealogy.length;
  const techs     = state.discoveredUniversalTechIds.size;
  const skills    = state.genealogy.reduce((s, g) => s + (g.skills || 0), 0);
  const branches  = new Set(state.genealogy.flatMap(g => g.branches || [])).size;
  const aprs      = state.genealogy.reduce((s, g) => s + (g.aprenentatges || 0), 0);
  const heirBonus = state.genealogy.filter(g => g.hadHeir).length * 20;
  // Gen score weighted by age lived — discourages deliberate early death
  const genScore  = state.genealogy.reduce((s, g) => {
    const lifePct = Math.min(1, (g.age || 0) / LIFE_EXPECTANCY);
    return s + Math.round(60 * lifePct);
  }, 0);
  // Bonus per gen que va viure >= 85% de la vida esperada
  const fullLifeBonus = state.genealogy.filter(g => (g.age || 0) >= LIFE_EXPECTANCY * 0.85).length * 30;
  // PT-16:A — bonus per cada cicle viscut més enllà de l'edat base (incentiu per no morir aviat)
  const longLifeBonus = state.genealogy.reduce((s, g) => s + Math.max(0, ((g.age || 0) - 8) * 5), 0);
  const total = cycles * 2 + genScore + longLifeBonus + techs * 100 + skills * 30 + branches * 40 + aprs * 50 + heirBonus + fullLifeBonus;
  return { total, cycles, gens, genScore, techs, skills, branches, aprs, heirBonus, fullLifeBonus, longLifeBonus };
}

const DYNASTY_TITLES = {
  impuls: [
    'Supervivents del Paleolític',
    'El Clan dels Caçadors',
    'El Llinatge de l\'Impuls',
    'Els Caçadors Llegendaris',
    'La Gran Cacera del Temps',
  ],
  'intel·lecte': [
    'Supervivents del Paleolític',
    'El Clan dels Artesans',
    'El Llinatge de la Pedra',
    'Els Mestres de la Talla',
    'La Gran Obra del Llinatge',
  ],
  espiritualitat: [
    'Supervivents del Paleolític',
    'El Clan dels Rituals',
    'El Llinatge dels Esperits',
    'Els Xamans del Clan',
    'La Veu dels Avantpassats',
  ],
  sociabilitat: [
    'Supervivents del Paleolític',
    'El Clan dels Recol·lectors',
    'El Llinatge del Vincle',
    'Els Guardians de la Llar',
    'La Gran Aliança del Temps',
  ],
};

function getAchievementBadges(score) {
  const badges = [];
  if (score.aprs >= 3)
    badges.push({ icon: '📖', name: 'El Gran Transmissor', desc: '3+ aprenentatges acumulats al llinatge' });
  if (state.discoveredZoneIds.size >= 5)
    badges.push({ icon: '🗺️', name: 'Exploradors del Món', desc: 'Totes les zones descobertes' });
  if (score.gens >= 4)
    badges.push({ icon: '🌿', name: 'La Memòria del Llinatge', desc: '4 o més generacions viscudes' });
  if (score.techs >= UNIVERSAL_TECHS.length)
    badges.push({ icon: '🔮', name: 'La Saviesa de les Eres', desc: 'Totes les tecnologies universals descobertes' });
  if (score.fullLifeBonus >= 60)
    badges.push({ icon: '🦴', name: "L'Ancià del Llinatge", desc: '2+ personatges que han viscut fins al límit', secret: false });
  // Secret: finish the era with only 1 generation (no succession)
  if (state.gameOverReason === 'era_complete' && score.gens <= 1)
    badges.push({ icon: '⚡', name: "L'Invicte Solitari", desc: 'Completada l\'era sense successió', secret: true });
  return badges;
}

function getDynastyTitle(score) {
  const tier = score >= 2000 ? 4 : score >= 1200 ? 3 : score >= 650 ? 2 : score >= 300 ? 1 : 0;
  // Dominant axis across all generations
  const axisCounts = {};
  for (const g of state.genealogy) {
    if (g.topAxis) axisCounts[g.topAxis] = (axisCounts[g.topAxis] || 0) + 1;
  }
  const domAxis = Object.keys(axisCounts).sort((a, b) => axisCounts[b] - axisCounts[a])[0];
  const titles = DYNASTY_TITLES[domAxis] || DYNASTY_TITLES['impuls'];
  return titles[tier];
}

// ═══════════════════════════════════════════════════════════ END SCREEN
function renderEndScreen() {
  const isExtinct = state.gameOverReason === 'no_heir';
  const isEraEnd  = state.gameOverReason === 'era_complete';
  const score     = calculateScore();
  const title     = getDynastyTitle(score.total);

  el('end-icon').textContent         = isExtinct ? '💀' : isEraEnd ? '🏆' : '🦴';
  el('end-dynasty-name').textContent  = `${state.dynastyName}`;
  el('end-tagline').textContent       = title;

  el('end-stats-row').innerHTML = `
    <div class="end-stat"><span class="end-stat-val">${score.total}</span><span class="end-stat-label">Punts</span></div>
    <div class="end-stat"><span class="end-stat-val">${score.cycles}</span><span class="end-stat-label">Cicles</span></div>
    <div class="end-stat"><span class="end-stat-val">${score.gens}</span><span class="end-stat-label">Gens.</span></div>
    <div class="end-stat"><span class="end-stat-val">${score.techs}/${UNIVERSAL_TECHS.length}</span><span class="end-stat-label">Techs</span></div>
  `;

  const taglineMsg = isExtinct
    ? 'El llinatge s\'ha extingit sense hereus.'
    : isEraEnd
    ? `L'era de la Prehistòria ha finalitzat. ${score.gens} generació${score.gens !== 1 ? 'ns' : ''} han viscut.`
    : `La partida ha acabat al cicle ${score.cycles}.`;

  // Score breakdown (create once, update every call)
  let breakdownEl = el('end-score-breakdown');
  if (!breakdownEl) {
    breakdownEl = document.createElement('div');
    breakdownEl.id = 'end-score-breakdown';
    el('end-stats-row').insertAdjacentElement('afterend', breakdownEl);
  }
  breakdownEl.innerHTML = [
    score.genScore > 0 ? `${score.gens} generació${score.gens !== 1 ? 'ns' : ''} (per edat) = <b>${score.genScore}</b>` : null,
    score.techs    > 0 ? `${score.techs} techs × 100 = <b>${score.techs * 100}</b>` : null,
    score.skills   > 0 ? `${score.skills} habilitats × 30 = <b>${score.skills * 30}</b>` : null,
    score.branches > 0 ? `${score.branches} branques × 40 = <b>${score.branches * 40}</b>` : null,
    score.aprs     > 0 ? `${score.aprs} aprenentatges × 50 = <b>${score.aprs * 50}</b>` : null,
    score.heirBonus > 0 ? `Hereus deixats: <b>+${score.heirBonus}</b>` : null,
    score.fullLifeBonus > 0 ? `Vides completes × 30: <b>+${score.fullLifeBonus}</b>` : null,
    score.longLifeBonus > 0 ? `Longevitat (+5/cicle > 8): <b>+${score.longLifeBonus}</b>` : null,
    `${score.cycles} cicles × 2 = <b>${score.cycles * 2}</b>`,
  ].filter(Boolean).map(t => `<div class="score-line">${t}</div>`).join('');

  const achievements = getAchievementBadges(score);
  let achieveEl = el('end-achievements');
  if (!achieveEl) {
    achieveEl = document.createElement('div');
    achieveEl.id = 'end-achievements';
    breakdownEl.insertAdjacentElement('afterend', achieveEl);
  }
  if (achievements.length > 0) {
    achieveEl.innerHTML = `<div class="achieve-title">Assoliments</div>` +
      achievements.map(b =>
        `<div class="achieve-badge${b.secret ? ' secret' : ''}"><span class="achieve-icon">${b.icon}</span><span class="achieve-name">${b.name}</span></div>`
      ).join('');
  } else {
    achieveEl.innerHTML = '';
  }

  let resultEl = el('end-result-msg');
  if (!resultEl) {
    resultEl = document.createElement('p');
    resultEl.id = 'end-result-msg';
    achieveEl.insertAdjacentElement('afterend', resultEl);
  }
  resultEl.textContent = taglineMsg;

  const genoEl = el('end-genealogy');
  genoEl.innerHTML = '';
  state.genealogy.forEach((g, i) => {
    const row = document.createElement('div');
    row.className = `end-gen-row${i === 0 ? ' gen-first' : ''}`;
    const branchStr = g.branches?.length ? g.branches.join(', ') : '—';
    row.innerHTML = `
      <span class="end-gen-num">G${g.generation}</span>
      <span class="end-gen-name">${g.label} ${state.dynastyName}</span>
      <span class="end-gen-detail">${g.age} cicles · <span class="end-gen-branch">${branchStr}</span></span>`;
    genoEl.appendChild(row);
  });
}

// ═══════════════════════════════════════════════════════════ RENDER ALL
function renderAll() {
  // Guard: hide succession overlays if nothing pending
  const anyFullscreen = state.pendingDeath || state.pendingSuccession || state.pendingNewGen || state.gameOver;
  if (anyFullscreen) {
    renderSuccessionOverlays();
    renderTopBar();
    renderCharPanel();
    return;
  }
  hide('overlay-death-summary');
  hide('overlay-succession');
  hide('overlay-new-gen');
  hide('overlay-gameover');

  renderTopBar();
  renderCharPanel();
  renderBottomPanel();
  renderSky();
  renderZoneNodes();
  renderInMapOverlay();

  // Update testing panel if open
  if (!el('overlay-test-panel').classList.contains('hidden')) {
    renderTestingPanel();
  }
}

// ═══════════════════════════════════════════════════════════ SHOP
function getBuyableActions() {
  return ACTIONS.filter(a => {
    if (!a.purchase_cost) return false;
    if (a.is_base) return false;
    if (a.is_discovery_action) return false;
    if (a.is_upgrade) return false;
    if (isActionOwned(a)) return false;
    if (!state.discoveredZoneIds.has(a.zona)) return false;
    if (a.universal_prereq && !state.discoveredUniversalTechIds.has(a.universal_prereq)) return false;
    // D4: si una branch tech desbloqueja aquesta acció, cal tenir la tech desbloquejada per comprar-la
    const unlockingSkill = SKILL_DEFS.find(bt => (bt.unlocks_action_ids || []).includes(a.id));
    if (unlockingSkill && !state.character.unlockedSkillIds.has(unlockingSkill.id)) return false;
    return true;
  });
}

function openShop() {
  renderShop();
  show('overlay-shop');
}

function renderShop() {
  const list = el('shop-list');
  list.innerHTML = '';
  const mat = state.material ?? 0;
  const buyable = getBuyableActions();

  if (buyable.length === 0) {
    list.innerHTML = '<p style="text-align:center;opacity:.6;padding:1.5rem">No hi ha accions disponibles. Explora noves zones per ampliar l\'oferta.</p>';
    return;
  }

  const byZone = {};
  buyable.forEach(a => { (byZone[a.zona] = byZone[a.zona] || []).push(a); });
  const ZONE_LABEL = { Campament:'🏕️ Campament', Planes:'🌾 Planes', Bosc:'🌲 Bosc', Llar:'🏠 Llar' };

  Object.entries(byZone).forEach(([zona, actions]) => {
    const label = document.createElement('div');
    label.className = 'shop-zone-label';
    label.textContent = ZONE_LABEL[zona] || zona;
    list.appendChild(label);

    actions.forEach(action => {
      const canAfford = mat >= action.purchase_cost;
      const upgradeBase = action.upgrades_action_id
        ? ACTIONS.find(a => a.id === action.upgrades_action_id)
        : null;
      const upgradeNote = upgradeBase
        ? `<span class="shop-upgrade-note">↑ Substitueix: ${upgradeBase.name}</span>`
        : '';
      const row = document.createElement('div');
      row.className = 'shop-row' + (canAfford ? '' : ' shop-row-disabled');
      row.innerHTML = `
        <span class="shop-icon">${getActionIcon(action)}</span>
        <div class="shop-info">
          <span class="shop-name">${action.name || action.id}</span>
          <span class="shop-desc">${action.description || ''}${upgradeNote}</span>
        </div>
        <button class="shop-buy-btn" ${canAfford ? '' : 'disabled'} data-id="${action.id}">
          🔵${action.purchase_cost}
        </button>`;
      list.appendChild(row);
    });
  });

  list.querySelectorAll('.shop-buy-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => buyAction(btn.dataset.id));
  });
}

function buyAction(actionId) {
  const action = ACTIONS.find(a => a.id === actionId);
  if (!action || !action.purchase_cost) return;
  const mat = state.material ?? 0;
  if (mat < action.purchase_cost) return;
  state.material = mat - action.purchase_cost;
  state.character.purchasedActionIds.add(actionId);
  addLog(`Has comprat: ${action.name || action.id}`);
  const outIcons = { food: '🌾', material: '🔵', health: '❤️', pedra: '🪨', eina: '⚒️', branques: '🌿' };
  const parts = [];
  if (action.output_resource && action.output_min != null) {
    parts.push(`${outIcons[action.output_resource] || '📦'} ${action.output_min}–${action.output_max}`);
  }
  if (action.side_effects) {
    for (const se of action.side_effects) {
      parts.push(`${outIcons[se.resource] || '📦'} ${se.delta > 0 ? '+' : ''}${se.delta}`);
    }
  }
  const upgradeBase = action.upgrades_action_id
    ? ACTIONS.find(a => a.id === action.upgrades_action_id)
    : null;
  const effectDesc = [
    parts.join('  '),
    upgradeBase ? `Substitueix: "${upgradeBase.name}"` : null,
  ].filter(Boolean).join(' · ');
  state.pendingDiscoveries.push({
    _isAction: true, icon: getActionIcon(action), name: action.name,
    desc: action.description || '',
    effect: effectDesc ? { desc: effectDesc } : null,
  });
  hide('overlay-shop');
  renderAll();
  saveGame();
}


// ═══════════════════════════════════════════════════════════ COL-STAT TOOLTIP
function showColStatTooltip(stat, anchorEl) {
  let tip = el('col-stat-tooltip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'col-stat-tooltip';
    document.body.appendChild(tip);
  }
  const lines = [];
  if (stat === 'food') {
    const childUp = state.character.children.length;
    const aprRed  = [...state.character.aprenentatges].reduce((s, aid) => {
      const a = APRENENTATGE_DEFS.find(d => d.id === aid);
      return a?.effect?.type === 'food_upkeep_reduction' ? s + a.effect.value : s;
    }, 0);
    const base    = Math.max(0.5, FOOD_UPKEEP - (state.foodUpkeepReduction || 0) - aprRed);
    const total   = base + childUp;
    lines.push('Consum de menjar per torn:');
    lines.push('  Base: −' + FOOD_UPKEEP);
    if (state.foodUpkeepReduction > 0) lines.push('  Conservació: +' + state.foodUpkeepReduction.toFixed(1));
    if (aprRed > 0) lines.push('  Aprenentatge: +' + aprRed.toFixed(1));
    if (childUp > 0) lines.push('  Fills (' + childUp + '): −' + childUp);
    lines.push('  Total: −' + (total % 1 === 0 ? total : total.toFixed(1)));
    lines.push('Quedarà: ' + Math.max(0, state.food - total).toFixed(1) + '/' + foodMax());
  } else if (stat === 'health') {
    const age = characterAge();
    if (age <= HEALTH_GROW_TURNS) {
      lines.push('Fase de creixement: +1/torn');
    } else if (age > HEALTH_GROW_TURNS + HEALTH_STABLE_TURNS) {
      const loss = getAgingLoss(age);
      lines.push('Envelliment (edat ' + age + '): −' + loss + '/torn');
      lines.push('Quedarà: ' + Math.max(0, state.health - loss).toFixed(0));
    } else {
      lines.push('Salut estable aquest torn.');
    }
    if (state.food < Math.max(0.5, FOOD_UPKEEP - (state.foodUpkeepReduction||0)) + state.character.children.length) {
      lines.push('⚠️ Menjar insuficient: −10 salut');
    }
  } else if (stat === 'forca' || stat === 'enginy' || stat === 'vincle') {
    const statLabel = { forca: 'Força', enginy: 'Enginy', vincle: 'Vincle' };
    const val = (state.character.stats[stat] || 0).toFixed(2);
    lines.push(statLabel[stat] + ': ' + val);
    lines.push('Creix executant accions relacionades.');
    lines.push('Hereta al ' + Math.round(STAT_INHERITANCE_RATE * 100) + '%.');
  }
  tip.innerHTML = lines.join('<br>');
  tip.classList.remove('hidden');
  const rect = anchorEl.getBoundingClientRect();
  tip.style.left = Math.min(rect.left, window.innerWidth - 220) + 'px';
  tip.style.top  = (rect.bottom + 6) + 'px';
  const dismiss = () => { tip.classList.add('hidden'); document.removeEventListener('click', dismiss); };
  setTimeout(() => document.addEventListener('click', dismiss), 50);
}

// ═══════════════════════════════════════════════════════════ EVENT LISTENERS
function setupEventListeners() {
  // Logbar → turn history overlay
  const logbarEl = el('logbar');
  if (logbarEl) logbarEl.addEventListener('click', openTurnHistory);
  const thCloseEl = el('btn-close-turn-history');
  if (thCloseEl) thCloseEl.addEventListener('click', () => hide('overlay-turn-history'));

  // Menu
  el('btn-open-menu').addEventListener('click', () => show('overlay-menu'));
  el('btn-continue-game').addEventListener('click', () => { hide('overlay-menu'); renderAll(); });
  el('btn-new-game').addEventListener('click', () => { clearSave(); hide('overlay-menu'); show('overlay-new-game'); });

  // New game form
  el('btn-start-new-game').addEventListener('click', () => {
    const name  = el('input-dynasty-name').value.trim() || randomDynastyName();
    const race  = document.querySelector('.race-btn.active')?.dataset.race || 'MED';
    hide('overlay-new-game');
    initState(name, race);
    renderAll();
  });
  el('btn-cancel-new-game').addEventListener('click', () => { hide('overlay-new-game'); show('overlay-menu'); });
  document.querySelectorAll('.race-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.race-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Menu overlay click-outside
  el('overlay-menu').addEventListener('click', e => {
    if (e.target === el('overlay-menu')) hide('overlay-menu');
  });

  // Shop overlay
  el('btn-close-shop').addEventListener('click', () => hide('overlay-shop'));
  el('overlay-shop').addEventListener('click', e => {
    if (e.target === el('overlay-shop')) hide('overlay-shop');
  });

  // Zone carousel
  el('btn-close-zone-sheet').addEventListener('click', () => hide('overlay-zone-actions'));
  el('overlay-zone-actions').addEventListener('click', e => {
    if (e.target === el('overlay-zone-actions')) hide('overlay-zone-actions');
  });

  // Carousel touch
  const carVp = el('zone-carousel-viewport');
  carVp.addEventListener('touchstart', e => {
    CAROUSEL.dragStartX = e.touches[0].clientX;
    CAROUSEL.dragDelta  = 0;
    CAROUSEL.didDrag    = false;
    CAROUSEL.dragging   = true;
  }, { passive: true });
  carVp.addEventListener('touchmove', e => {
    if (!CAROUSEL.dragging) return;
    CAROUSEL.dragDelta = e.touches[0].clientX - CAROUSEL.dragStartX;
    if (Math.abs(CAROUSEL.dragDelta) > 8) CAROUSEL.didDrag = true;
    updateCarouselPositions(CAROUSEL.dragDelta);
  }, { passive: true });
  carVp.addEventListener('touchend', () => {
    if (!CAROUSEL.dragging) return;
    CAROUSEL.dragging = false;
    const dx = CAROUSEL.dragDelta;
    if (!CAROUSEL.didDrag) return;
    if (dx < -50)     carouselNavigate(CAROUSEL.idx + 1);
    else if (dx > 50) carouselNavigate(CAROUSEL.idx - 1);
    else              updateCarouselPositions(0);
  });
  carVp.addEventListener('click', e => {
    if (CAROUSEL.didDrag) { CAROUSEL.didDrag = false; return; }
    if (e.target.closest('.zc-info-btn')) {
      const item = e.target.closest('.zc-item');
      if (item) showActionInfo(CAROUSEL.actions[parseInt(item.dataset.idx)]);
      return;
    }
    const item = e.target.closest('.zc-item');
    if (!item) return;
    const i = parseInt(item.dataset.idx);
    if (i !== CAROUSEL.idx) carouselNavigate(i);
    else carouselOpenCurrent();
  });
  // Mouse drag (desktop)
  let _carMouse = false;
  carVp.addEventListener('mousedown', e => {
    _carMouse = true;
    CAROUSEL.dragStartX = e.clientX;
    CAROUSEL.dragDelta  = 0;
    CAROUSEL.didDrag    = false;
  });
  carVp.addEventListener('mousemove', e => {
    if (!_carMouse) return;
    CAROUSEL.dragDelta = e.clientX - CAROUSEL.dragStartX;
    if (Math.abs(CAROUSEL.dragDelta) > 8) CAROUSEL.didDrag = true;
    updateCarouselPositions(CAROUSEL.dragDelta);
  });
  const carMouseEnd = () => {
    if (!_carMouse) return;
    _carMouse = false;
    const dx = CAROUSEL.dragDelta;
    if (!CAROUSEL.didDrag) return;
    if (dx < -50)     carouselNavigate(CAROUSEL.idx + 1);
    else if (dx > 50) carouselNavigate(CAROUSEL.idx - 1);
    else              updateCarouselPositions(0);
  };
  carVp.addEventListener('mouseup', carMouseEnd);
  carVp.addEventListener('mouseleave', carMouseEnd);

  // Action info overlay
  el('btn-close-action-info').addEventListener('click', () => hide('overlay-action-info'));
  el('overlay-action-info').addEventListener('click', e => {
    if (e.target === el('overlay-action-info')) hide('overlay-action-info');
  });

  // In-map overlay buttons
  el('btn-dismiss-discovery').addEventListener('click', dismissDiscovery);
  el('btn-dismiss-birth').addEventListener('click', dismissBirth);
  el('btn-dismiss-event').addEventListener('click', dismissEvent);

  // Death summary → succession choice
  el('ds-btn-continue').addEventListener('click', () => {
    hide('overlay-death-summary');
    state.pendingSuccession = state.pendingDeath.successionPayload;
    state.pendingDeath = null;
    renderAll();
  });

  // New gen dismiss
  el('btn-new-gen-continue').addEventListener('click', () => {
    state.pendingNewGen = null;
    hide('overlay-new-gen');
    renderAll();
  });

  // Game over restart
  el('btn-go-restart').addEventListener('click', () => {
    clearSave();
    hide('overlay-gameover');
    initState();
    el('btn-continue-game').disabled = true;
    show('overlay-menu');
    renderAll();
  });

  // Testing panel
  el('btn-test-panel').addEventListener('click', () => {
    renderTestingPanel();
    show('overlay-test-panel');
  });
  el('btn-close-test-panel').addEventListener('click', () => hide('overlay-test-panel'));
  el('test-close-area').addEventListener('click', () => hide('overlay-test-panel'));

  // Carousel upgrade button
  el('zone-carousel-viewport').addEventListener('click', e => {
    const btn = e.target.closest('.zc-upgrade-btn');
    if (btn) { e.stopPropagation(); openUpgradeOverlay(btn.dataset.actionId); }
  });

  // Upgrade overlay
  el('btn-close-upgrade').addEventListener('click', () => hide('overlay-upgrade'));
  el('upgrade-backdrop').addEventListener('click', () => hide('overlay-upgrade'));
  el('btn-do-upgrade').addEventListener('click', e => doUpgrade(e.currentTarget.dataset.id));

  // Stat tooltip
  el('stat-tooltip-backdrop').addEventListener('click', () => hide('overlay-stat-tooltip'));
  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-stat]');
    if (trigger) { e.stopPropagation(); showStatTooltip(trigger.dataset.stat); }
  });

  // Char detail
  el('portrait-wrap').addEventListener('click', () => openCharDetail());
  el('btn-close-char-detail').addEventListener('click', () => hide('overlay-char-detail'));
  el('char-detail-backdrop').addEventListener('click', () => hide('overlay-char-detail'));

  // Sun cap: show life stats tooltip
  const sunCapEl = el('sun-cap');
  if (sunCapEl) {
    sunCapEl.addEventListener('click', e => {
      e.stopPropagation();
      showColStatTooltip('health', sunCapEl);
    });
  }

}

function showActionInfo(action) {
  if (!action) return;
  el('ai-icon').textContent = getActionIcon(action);
  el('ai-name').textContent = action.name;
  el('ai-desc').textContent = action.description || '';
  const outIcons = { food: '🌾', material: '🔵', health: '❤️', pedra: '🪨', eina: '⚒️', branques: '🌿' };
  const parts = [];
  if (action.output_resource && action.output_min != null) {
    parts.push(`${outIcons[action.output_resource] || '📦'} ${action.output_min}–${action.output_max}`);
  }
  if (action.side_effects) {
    for (const se of action.side_effects) {
      parts.push(`${outIcons[se.resource] || '📦'} ${se.delta > 0 ? '+' : ''}${se.delta}`);
    }
  }
  el('ai-benefits').innerHTML = parts.map(p => `<span class="impact-tag">${p}</span>`).join(' ');
  show('overlay-action-info');
}

// ═══════════════════════════════════════════════════════════ UPGRADE OVERLAY
function actionStatSummary(action) {
  const outIcons = { food: '🌾', material: '🔵', health: '❤️', pedra: '🪨', eina: '⚒️', branques: '🌿' };
  const parts = [];
  if (action.output_resource && action.output_min != null) {
    parts.push(`${outIcons[action.output_resource] || '📦'} ${action.output_min}–${action.output_max}`);
  }
  if (action.side_effects) {
    for (const se of action.side_effects) {
      parts.push(`${outIcons[se.resource] || '📦'} ${se.delta > 0 ? '+' : ''}${se.delta}`);
    }
  }
  if (action.stat_key && action.stat_gain) parts.push(`${action.stat_key} +${action.stat_gain}`);
  return parts.join('  ') || '—';
}

function openUpgradeOverlay(baseActionId) {
  const base = ACTIONS.find(a => a.id === baseActionId);
  const upgrade = getActionUpgrade(baseActionId);
  if (!base || !upgrade) return;
  el('upg-base-icon').textContent  = getActionIcon(base);
  el('upg-base-name').textContent  = base.name;
  el('upg-base-stats').textContent = actionStatSummary(base);
  el('upg-upg-icon').textContent   = getActionIcon(upgrade);
  el('upg-upg-name').textContent   = upgrade.name;
  el('upg-upg-stats').textContent  = actionStatSummary(upgrade);
  const mat = state.material ?? 0;
  const canAfford = mat >= upgrade.purchase_cost;
  el('upg-cost').textContent = `🔵 ${upgrade.purchase_cost}`;
  el('btn-do-upgrade').disabled = !canAfford;
  el('btn-do-upgrade').dataset.id = upgrade.id;
  el('upg-req-text').textContent = canAfford ? '' : `Necessites ${upgrade.purchase_cost} 🔵 (tens ${mat})`;
  show('overlay-upgrade');
}

function doUpgrade(upgradeId) {
  const upgrade = ACTIONS.find(a => a.id === upgradeId);
  if (!upgrade || !upgrade.purchase_cost) return;
  if ((state.material ?? 0) < upgrade.purchase_cost) return;
  state.material -= upgrade.purchase_cost;
  state.character.purchasedActionIds.add(upgradeId);
  addLog(`Upgrade: ${upgrade.name}`);
  const outIcons = { food: '🌾', material: '🔵', health: '❤️', pedra: '🪨', eina: '⚒️', branques: '🌿' };
  const parts = [];
  if (upgrade.output_resource && upgrade.output_min != null) {
    parts.push(`${outIcons[upgrade.output_resource] || '📦'} ${upgrade.output_min}–${upgrade.output_max}`);
  }
  const base = ACTIONS.find(a => a.id === upgrade.upgrades_action_id);
  state.pendingDiscoveries.push({
    _isAction: true, icon: getActionIcon(upgrade), name: upgrade.name,
    desc: upgrade.description || '',
    effect: base ? { desc: `Substitueix: "${base.name}"` } : null,
  });
  hide('overlay-upgrade');
  renderAll();
  saveGame();
}

// ═══════════════════════════════════════════════════════════ STAT TOOLTIP
function showStatTooltip(statId) {
  const resDef = RESOURCE_DEFS.find(r => r.id === statId);
  const statDef = STAT_DEFS ? STAT_DEFS.find(s => s.id === statId) : null;
  let emoji, name, value, desc;
  if (statId === 'food') {
    emoji = '🌾'; name = 'Menjar';
    value = `${Math.round(state.food)}/${foodMax()}`;
    const childCount = state.character.children.length;
    const aprUpkeepRed = [...state.character.aprenentatges].reduce((s, aid) => {
      const a = APRENENTATGE_DEFS.find(d => d.id === aid);
      return a?.effect?.type === 'food_upkeep_reduction' ? s + a.effect.value : s;
    }, 0);
    const base = FOOD_UPKEEP;
    const reduction = state.foodUpkeepReduction || 0;
    const upkeep = Math.max(0.5, base - reduction - aprUpkeepRed) + childCount;
    const upkeepStr = upkeep % 1 === 0 ? upkeep : upkeep.toFixed(1);
    const lines = [`Consum base: −${base}/t`];
    if (reduction > 0 || aprUpkeepRed > 0) lines.push(`Reducció: +${(reduction + aprUpkeepRed).toFixed(1)}/t`);
    if (childCount > 0) lines.push(`Fills: −${childCount}/t`);
    lines.push(`Total: −${upkeepStr}/t`);
    lines.push(`Emmagatzematge: ${Math.round(state.food)}/${foodMax()}`);
    const agL = getAgingLoss(characterAge());
    const fDanger = state.food < upkeep;
    const fPenalty = fDanger ? 10 : 0;
    const wDie = state.health <= fPenalty + agL;
    if (wDie) {
      lines.push(''); lines.push('💀 Mort al fi de torn');
      lines.push('"Pren bé la darrera decisió i preparat, la teva hora s\'acosta."');
    } else if (fDanger) {
      lines.push(''); lines.push('⚠️ Menjar insuficient — perdràs 10 salut al fi de torn');
    }
    desc = lines.join('\n');
  } else if (statId === 'health') {
    emoji = '❤️'; name = 'Salut';
    value = `${Math.round(state.health)}/${healthMax()}`;
    const age = characterAge();
    const lines = [];
    if (age <= HEALTH_GROW_TURNS) {
      lines.push(`+1/t creixement (edat ≤ ${HEALTH_GROW_TURNS})`);
    } else if (age > HEALTH_GROW_TURNS + HEALTH_STABLE_TURNS) {
      const loss = getAgingLoss(age);
      lines.push(`−${loss}/t envelliment (edat ${age})`);
    } else {
      lines.push('Estable (sense canvi per edat)');
    }
    const childCount = state.character.children.length;
    const aprUpkeepRed = [...state.character.aprenentatges].reduce((s, aid) => {
      const a = APRENENTATGE_DEFS.find(d => d.id === aid);
      return a?.effect?.type === 'food_upkeep_reduction' ? s + a.effect.value : s;
    }, 0);
    const base = FOOD_UPKEEP;
    const reduction = state.foodUpkeepReduction || 0;
    const upkeep = Math.max(0.5, base - reduction - aprUpkeepRed) + childCount;
    const fDanger = state.food < upkeep;
    if (fDanger) lines.push('⚠️ Menjar insuficient: −10 salut addicional');
    const agL = getAgingLoss(age);
    const wDie = state.health <= (fDanger ? 10 : 0) + agL;
    if (wDie) {
      lines.push(''); lines.push('💀 Mort al fi de torn');
      lines.push('"Pren bé la darrera decisió i preparat, la teva hora s\'acosta."');
    } else if (agL > 0 && state.health <= agL + 5) {
      lines.push(''); lines.push('⚠️ Salut molt baixa — risc de mort proper');
    }
    desc = lines.join('\n');
  } else if (resDef) {
    emoji = resDef.emoji;
    name  = resDef.label;
    const displayMax = resDef.max;
    value = displayMax != null ? `${Math.round(state[statId] || 0)}/${displayMax}` : Math.round(state[statId] || 0);
    desc  = resDef.glossaryDesc || '';
  } else if (statDef) {
    emoji = statDef.emoji || '📊';
    name  = statDef.label || statId;
    value = (state.character.stats[statId] || 0).toFixed(1);
    desc  = statDef.description || statDef.desc || '';
  } else return;
  el('stt-emoji').textContent = emoji;
  el('stt-name').textContent  = name;
  el('stt-value').textContent = value;
  el('stt-desc').textContent  = desc;
  show('overlay-stat-tooltip');
}

// ═══════════════════════════════════════════════════════════ CHAR DETAIL
function openCharDetail() {
  const c = state.character;
  el('cd-name').textContent = c.label || state.dynastyName;
  el('cd-meta').textContent = `Generació ${state.generation} · ${characterAge()} cicles`;
  el('cd-bust').src = bustImgSrc();

  // Stats list (food, health, rep, forca, enginy, vincle)
  const statsEl = el('cd-stats-list');
  const hp = Math.round(state.health || 0);
  const food = Math.round(state.food || 0);
  const statRows = [
    { label: '🌾 Menjar',  val: `${food}/${foodMax()}`,          pct: food / foodMax() * 100,              color: '#f39c12' },
    { label: '❤️ Salut',   val: hp,                              pct: hp / healthMax() * 100,              color: '#e74c3c' },
    { label: '💪 Força',   val: (c.stats.forca  || 0).toFixed(1), pct: (c.stats.forca  || 0) / STAT_MAX * 100, color: '#e67e22' },
    { label: '🧠 Enginy',  val: (c.stats.enginy || 0).toFixed(1), pct: (c.stats.enginy || 0) / STAT_MAX * 100, color: '#a29bfe' },
    { label: '🔗 Vincle',  val: (c.stats.vincle || 0).toFixed(1), pct: (c.stats.vincle || 0) / STAT_MAX * 100, color: '#5dade2' },
  ];
  statsEl.innerHTML = statRows.map(r => `
    <div class="cd-stat-row">
      <span class="cd-stat-label">${r.label}</span>
      <span class="cd-stat-val">${r.val}</span>
      <div class="cd-stat-bar"><div class="cd-stat-fill" style="width:${Math.min(100,r.pct).toFixed(1)}%;background:${r.color}"></div></div>
    </div>`).join('');

  // Inclination axes
  const axesEl = el('cd-axes-list');
  axesEl.innerHTML = AXIS_DEFS.map(ax => {
    const v = c.inclination[ax.id] ?? 0;
    return `<div class="incl-row">
      <span class="incl-pole">${ax.left}</span>
      <div class="incl-track">
        <div class="incl-fill-neg" style="width:${v < 0 ? Math.abs(v)*50 : 0}%"></div>
        <div class="incl-fill-pos" style="width:${v > 0 ? v*50 : 0}%"></div>
        <div class="incl-center-tick"></div>
      </div>
      <span class="incl-pole right">${ax.right}</span>
    </div>`;
  }).join('');

  // Family
  const famEl = el('cd-family-list');
  if (famEl) {
    const parts = [];
    if (c.charState.parella) parts.push(`<span class="cd-pill-skill">💑 ${c.partnerName || 'Parella'}</span>`);
    for (const ch of c.children) parts.push(`<span class="cd-pill-skill">👶 ${ch.label}</span>`);
    famEl.innerHTML = parts.length ? parts.join('') : '<span class="cd-empty">Sense família</span>';
  }

  // Skills
  const skillsEl = el('cd-skills-list');
  if (c.unlockedSkillIds.size === 0) {
    skillsEl.innerHTML = '<span class="cd-empty">Cap habilitat encara</span>';
  } else {
    skillsEl.innerHTML = [...c.unlockedSkillIds].map(sid => {
      const bt = SKILL_DEFS.find(t => t.id === sid);
      return bt ? `<span class="cd-pill-skill">${bt.name}</span>` : '';
    }).join('');
  }

  // Destreses
  const destresaEl = el('cd-destreses-list');
  if (c.destreses.size === 0) {
    destresaEl.innerHTML = '<span class="cd-empty">Cap destresa (innata)</span>';
  } else {
    destresaEl.innerHTML = [...c.destreses].map(did => {
      const d = DESTRESA_DEFS.find(x => x.id === did);
      return `<span class="cd-pill-destresa">⭐ ${d ? d.name : did}</span>`;
    }).join('');
  }

  // Aprenentatges
  const aprListEl = el('cd-aprenentatges-list');
  if (aprListEl) {
    if (!c.aprenentatges || c.aprenentatges.size === 0) {
      aprListEl.innerHTML = '<span class="cd-empty">Cap aprenentatge encara</span>';
    } else {
      aprListEl.innerHTML = [...c.aprenentatges].map(aid => {
        const a = APRENENTATGE_DEFS.find(x => x.id === aid);
        return a ? `<span class="cd-pill-aprenentatge">${a.icon} ${a.name}</span>` : '';
      }).join('');
    }
  }

  show('overlay-char-detail');
}

// ═══════════════════════════════════════════════════════════ INIT
window.addEventListener('DOMContentLoaded', () => {
  const hasSavedGame = hasSave();
  if (hasSavedGame) {
    loadGame();
  } else {
    initState();
  }
  setupEventListeners();
  el('btn-continue-game').disabled = !hasSavedGame;
  show('overlay-menu');
  renderAll();
});
