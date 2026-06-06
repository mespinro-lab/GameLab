// PROTOTYPE - NOT FOR PRODUCTION
// Visual: Life Tycoon UI shell — Bloodline mechanics
'use strict';

// ═══════════════════════════════════════════════════════════ ENGINE CONSTANTS
const INERTIA_FACTOR = 2.0;
// FADE_MARGIN is defined in data.js

// ═══════════════════════════════════════════════════════════ DERIVED LOOKUPS
const AXES        = AXIS_DEFS.map(a => a.id);
const AXIS_LABELS = Object.fromEntries(AXIS_DEFS.map(a => [a.id, { left: a.left, right: a.right }]));

// ═══════════════════════════════════════════════════════════ ZONE MAP CONFIG
const ZONE_POS = {
  'Campament': { left: 63, top: 74 },
  'Planes':    { left: 80, top: 32 },
  'Bosc':      { left: 20, top: 35 },
  'Ritual':    { left: 23, top: 76 },
};
const ZONE_IMG = {
  'Campament': 'HOME',
  'Planes':    'WILD',
  'Bosc':      'FOREST',
  'Ritual':    'TOWN',
};
const ZONE_ICONS = {
  'Campament': '🏕️',
  'Planes':    '🌾',
  'Bosc':      '🌲',
  'Ritual':    '🌀',
};

// ═══════════════════════════════════════════════════════════ ACTION ICONS
const ACTION_ICONS = {
  act_espiar_ramat:       '👁️',
  act_recollectar_arrels: '🌿',
  act_tallar_pedra:       '🪨',
  act_ritual_foc:         '🔥',
  act_contemplacio:       '🌙',
  act_vigilar_campament:  '🛡️',
  act_explorar_voltants:  '🧭',
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
};
function getActionIcon(action) {
  return ACTION_ICONS[action.id] ||
    (action.output_resource === 'material' ? '🪨' :
     action.output_resource === 'health'   ? '💊' : '🌾');
}

// ═══════════════════════════════════════════════════════════ DOM HELPERS
function el(id) { return document.getElementById(id); }
function show(id) { const e = el(id); if (e) e.classList.remove('hidden'); }
function hide(id) { const e = el(id); if (e) e.classList.add('hidden'); }

// ═══════════════════════════════════════════════════════════ GAME STATE
let state = null;

// ═══════════════════════════════════════════════════════════ SAVE / LOAD
const SAVE_KEY = 'bloodline_save_v2';

function saveGame() {
  if (!state) return;
  try {
    const d = {
      dynastyName: state.dynastyName, race: state.race, gender: state.gender,
      cycle: state.cycle, generation: state.generation,
      food: state.food, health: state.health, material: state.material, reputacio: state.reputacio,
      character: {
        birthCycle: state.character.birthCycle, label: state.character.label,
        inclination: { ...state.character.inclination },
        purchasedActionIds: [...state.character.purchasedActionIds],
        unlockedSkillIds:   [...state.character.unlockedSkillIds],
        stats:    { ...state.character.stats },
        destreses: [...state.character.destreses],
        charState: { ...state.character.charState },
        children: state.character.children,
      },
      discoveredUniversalTechIds: [...state.discoveredUniversalTechIds],
      discoveredZoneIds:          [...state.discoveredZoneIds],
      firedSingleUseEventIds:     [...state.firedSingleUseEventIds],
      eventStats: state.eventStats || { positive: 0, negative: 0, neutral: 0 },
      log: state.log,
      genealogy: state.genealogy,
      siblingPool: state.siblingPool.map(s => ({
        ...s,
        inheritedPurchased:  [...(s.inheritedPurchased  || [])],
        inheritedSkills:     [...(s.inheritedSkills     || [])],
        inheritedDestreses:  [...(s.inheritedDestreses  || [])],
      })),
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
      food: d.food, health: d.health, material: d.material, reputacio: d.reputacio || 0,
      character: {
        birthCycle: d.character.birthCycle, label: d.character.label,
        inclination: { ...d.character.inclination },
        purchasedActionIds: new Set(d.character.purchasedActionIds),
        unlockedSkillIds:   new Set(d.character.unlockedSkillIds),
        stats:    { ...d.character.stats },
        destreses: new Set(d.character.destreses),
        charState: { ...d.character.charState },
        children: d.character.children || [],
      },
      discoveredUniversalTechIds: new Set(d.discoveredUniversalTechIds),
      discoveredZoneIds:          new Set(d.discoveredZoneIds),
      firedSingleUseEventIds:     new Set(d.firedSingleUseEventIds || []),
      eventStats: d.eventStats || { positive: 0, negative: 0, neutral: 0 },
      log: d.log || [], genealogy: d.genealogy || [],
      siblingPool: (d.siblingPool || []).map(s => ({
        ...s,
        inheritedPurchased:  new Set(s.inheritedPurchased  || []),
        inheritedSkills:     new Set(s.inheritedSkills     || []),
        inheritedDestreses:  new Set(s.inheritedDestreses  || []),
      })),
      pendingEvent: null, pendingSuccession: null, pendingDeath: null, pendingNewGen: null,
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
  // Only age-based decay from cycle 11 onward; starvation handled separately
  return age >= 11 ? 2 : 0;
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

function createCharacter(inheritedInclination, inheritedPurchasedIds, inheritedSkillIds, inheritedStats, inheritedDestreses, birthCycle = 0, label = '') {
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
    charState: Object.fromEntries(CHARACTER_STATE_DEFS.map(d => [d.id, d.startVal])),
    children: [],
  };
}

function freshInclination() {
  return Object.fromEntries(AXIS_DEFS.map(a => [a.id, 0.0]));
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
    character: createCharacter(inclination, basePurchased, new Set(), null, new Set(), 0, CHILD_NAMES[0]),
    discoveredUniversalTechIds: new Set(),
    discoveredZoneIds: new Set(ZONE_DEFS.filter(z => z.starts_discovered).map(z => z.id)),
    firedSingleUseEventIds: new Set(),
    eventStats: { positive: 0, negative: 0, neutral: 0 },
    log: [],
    genealogy: [],
    siblingPool: [],
    pendingEvent: null,
    pendingSuccession: null,
    pendingDiscoveries: [],
    pendingBirths: [],
    pendingDeath: null,
    pendingNewGen: null,
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
  if (!action.inclination_requirements) return 'ACTIVE';
  for (const [axis, range] of Object.entries(action.inclination_requirements)) {
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
  return BRANCHES.filter(b => evaluateConditions(b.conditions));
}

// ═══════════════════════════════════════════════════════════ TECH DISCOVERY
function getDiscoverableTechs() {
  return UNIVERSAL_TECHS.filter(t =>
    state.cycle >= t.cycle && !state.discoveredUniversalTechIds.has(t.id)
  );
}
function applyUniversalTechEffect(tech) {
  if (!tech.effect) return;
  if (tech.effect.healthBonus) state.health = Math.min(HEALTH_MAX, state.health + tech.effect.healthBonus);
}
function autoDiscoverUniversalTechs() {
  for (const tech of getDiscoverableTechs()) {
    state.discoveredUniversalTechIds.add(tech.id);
    addLog(`${tech.icon} Descoberta: ${tech.name}`);
    applyUniversalTechEffect(tech);
    state.pendingDiscoveries.push({ ...tech, _isTech: true });
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
  const pe = bt.passive_effect;
  if (pe) {
    if (pe.type === 'grant_health')   state.health    = Math.min(HEALTH_MAX, state.health + pe.amount);
    if (pe.type === 'grant_material') state.material += pe.amount;
    if (pe.type === 'unlock_zone')    state.discoveredZoneIds.add(pe.unlocks_zone);
  }
}

// ═══════════════════════════════════════════════════════════ DESTRESA DISCOVERY
function checkDestresesAfterAction() {
  if (state.character.destreses.size >= DESTRESA_MAX) return;
  for (const def of DESTRESA_DEFS) {
    if (state.character.destreses.has(def.id)) continue;
    const met = def.conditions.every(c => {
      const val = state.character.inclination[c.axis] ?? 0;
      return (c.min === undefined || val >= c.min) && (c.max === undefined || val <= c.max);
    });
    if (met) {
      state.character.destreses.add(def.id);
      addLog(`⭐ Destresa: ${def.name}`);
      state.pendingDiscoveries.push({ _isDestresa: true, icon: '⭐', name: def.name, desc: `Has après la destresa "${def.name}" per la teva inclinació vital.`, effect: null });
    }
  }
}

// ═══════════════════════════════════════════════════════════ CHARACTER STATE
function evaluateCharacterRequires(action) {
  if (!action.requires || action.requires.length === 0) return true;
  return action.requires.every(req => {
    if (req.type === 'has_any_skill') return state.character.unlockedSkillIds.size > 0;
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
  if (eff.type === 'add_child') {
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
  const score = (fx.food || 0) + (fx.health || 0);
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
    return { ev, weight: 1 + debt * EVENT_BALANCE_WEIGHT };
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
    if (cond.type === 'has_skill')      return state.character.unlockedSkillIds.has(cond.id);
    if (cond.type === 'not_has_skill')  return !state.character.unlockedSkillIds.has(cond.id);
    if (cond.type === 'has_destresa')   return state.character.destreses.has(cond.id);
    if (cond.type === 'stat_min')       return (state.character.stats[cond.stat] || 0) >= cond.min;
    if (cond.type === 'axis_above')     return (state.character.inclination[cond.axis] || 0) >= cond.value;
    if (cond.type === 'resource_below') return (state[cond.resource] || 0) < cond.value;
    return false;
  });
}

// ═══════════════════════════════════════════════════════════ SUCCESSION
function triggerSuccession() {
  if (state.cycle >= ERA_CYCLES) { state.gameOver = true; state.gameOverReason = 'era_complete'; return; }
  const children = state.character.children;
  const siblings = state.siblingPool;
  if (children.length === 0 && siblings.length === 0) {
    state.gameOver = true; state.gameOverReason = 'no_heir'; return;
  }
  const topAxis = AXES.reduce((a, b) =>
    Math.abs(state.character.inclination[a]) > Math.abs(state.character.inclination[b]) ? a : b
  );
  const inheritedInclination = Object.fromEntries(
    AXES.map(a => [a, state.character.inclination[a] * INCLINATION_INHERITANCE_RATE])
  );
  const inheritedStats = Object.fromEntries(
    STAT_DEFS.map(s => [s.id,
      state.character.stats[s.id] * INCLINATION_INHERITANCE_RATE +
      STAT_STARTING_VALUE * (1 - INCLINATION_INHERITANCE_RATE)
    ])
  );
  const inheritedPurchased = new Set(state.character.purchasedActionIds);
  const inheritedSkills    = new Set(state.character.unlockedSkillIds);
  const inheritedDestreses = new Set(state.character.destreses);
  const hasEnsenyat        = state.character.charState.ensenyat === 1;
  const childSuccessors = children.map(c => ({
    ...c, is_sibling: false,
    inheritedInclination, inheritedStats, inheritedPurchased, inheritedSkills, inheritedDestreses, hasEnsenyat,
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
    if (!res.persistent)             state[res.id] = res.startVal;
    else if (res.inheritDecay != null) state[res.id] = Math.floor((state[res.id] || 0) * res.inheritDecay);
  }
  state.generation++;
  const teachingBonus = chosen.hasEnsenyat ? TEACHING_BONUS : 0;
  const inheritedSkills = new Set();
  for (const skillId of chosen.inheritedSkills) {
    const bt = SKILL_DEFS.find(t => t.id === skillId);
    const rate = Math.min(1, (bt ? (bt.inheritanceRate || 0) : 0) + teachingBonus);
    if (Math.random() < rate) inheritedSkills.add(skillId);
  }
  const gender = Math.random() < 0.5 ? 'M' : 'F';
  state.gender = gender;
  state.character = createCharacter(
    chosen.inheritedInclination,
    chosen.inheritedPurchased,
    inheritedSkills,
    chosen.inheritedStats,
    chosen.inheritedDestreses,
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
  const childUpkeep = state.character.children.length;
  const totalUpkeep = FOOD_UPKEEP + childUpkeep;
  const prevFood = state.food;
  state.food = Math.max(0, state.food - totalUpkeep);
  if (prevFood < totalUpkeep) {
    state.health = Math.max(0, state.health - 10);
  }
  state.health = Math.max(0, state.health - getAgingLoss(characterAge()));
}

// ═══════════════════════════════════════════════════════════ ACTION EXECUTION
function executeAction(actionId) {
  if (state.pendingEvent || state.pendingSuccession || state.gameOver) return;
  const action = ACTIONS.find(a => a.id === actionId);
  if (!action || !state.character.purchasedActionIds.has(actionId)) return;
  if (getActionVisibility(action) !== 'ACTIVE') return;
  const age = characterAge();
  if (action.minAge !== undefined && age < action.minAge) return;
  if (action.maxAge !== undefined && age > action.maxAge) return;
  if (!evaluateCharacterRequires(action)) return;

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
      state.cycle++;
      autoDiscoverUniversalTechs();
      applyTurnUpkeep();
      applyFxFloaters(snap);
      addLog(`[${state.cycle}] ${action.name}`);
      if (characterAge() >= LIFE_EXPECTANCY || state.health <= 0) triggerSuccession();
      renderAll();
    });
    return;
  }

  // Normal action execution
  hide('overlay-zone-actions');
  showDonutAnimation(action, null, () => {
    const snap = snapshotNums();
    // Output resource
    const destresaBonus = (action.destresa_id && state.character.destreses.has(action.destresa_id)) ? DESTRESA_BONUS : 0;
    const outMinBonus = [...state.character.unlockedSkillIds].reduce((s, sid) => {
      const bt = SKILL_DEFS.find(t => t.id === sid);
      return bt?.passive_effect?.type === 'bonus_action_output' && bt.passive_effect.action_id === actionId
        ? s + (bt.passive_effect.output_min_bonus || 0) : s;
    }, 0);
    const outMaxBonus = [...state.character.unlockedSkillIds].reduce((s, sid) => {
      const bt = SKILL_DEFS.find(t => t.id === sid);
      return bt?.passive_effect?.type === 'bonus_action_output' && bt.passive_effect.action_id === actionId
        ? s + (bt.passive_effect.output_max_bonus || 0) : s;
    }, 0);
    const output = Math.round(randInt(action.output_min + outMinBonus, action.output_max + outMaxBonus) * getStatMultiplier(action)) + destresaBonus;
    const outRes = action.output_resource || 'food';
    const outDef = RESOURCE_DEFS.find(r => r.id === outRes);
    if (outDef) {
      const newVal = (state[outRes] || 0) + output;
      state[outRes] = outDef.max != null ? Math.min(outDef.max, newVal) : newVal;
    }
    // Side effects
    if (action.side_effects) {
      for (const se of action.side_effects) {
        const resDef = RESOURCE_DEFS.find(r => r.id === se.resource);
        if (!resDef) continue;
        const newVal = (state[se.resource] || 0) + se.delta;
        state[se.resource] = resDef.max != null
          ? Math.max(0, Math.min(resDef.max, newVal))
          : Math.max(0, newVal);
      }
    }
    // Inclination
    applyInclinationDeltas(action.inclination_deltas);
    // Stat growth
    if (action.stat_key && action.stat_gain) {
      state.character.stats[action.stat_key] = Math.min(STAT_MAX, state.character.stats[action.stat_key] + action.stat_gain);
    }
    // Reputation
    if (action.reputation_gain) state.reputacio = (state.reputacio || 0) + action.reputation_gain;
    // Character state
    applyCharacterEffect(action);
    // Destresa check
    checkDestresesAfterAction();
    // Zone unlock
    if (action.unlocks_zone && !state.discoveredZoneIds.has(action.unlocks_zone)) {
      state.discoveredZoneIds.add(action.unlocks_zone);
      addLog(`Nova zona: ${action.unlocks_zone}!`);
      state.pendingDiscoveries.push({
        _isZone: true, icon: ZONE_ICONS[action.unlocks_zone] || '🗺️',
        name: action.unlocks_zone, desc: `Has descobert ${action.unlocks_zone}. Ara apareix al teu mapa.`,
      });
    }
    // Cycle advance + upkeep
    state.cycle++;
    autoDiscoverUniversalTechs();
    applyTurnUpkeep();
    // Log
    if (output > 0) addLog(`[${state.cycle}] ${action.name}: +${output} ${outDef?.label || outRes}`);
    else            addLog(`[${state.cycle}] ${action.name}`);
    // Floaters + resource balls
    spawnResBalls(snap);
    applyFxFloaters(snap);
    // Event (balanced selection)
    if (action.event_pool_id && EVENT_POOLS[action.event_pool_id] && Math.random() < EVENT_TRIGGER_CHANCE) {
      const eligible = getEligiblePoolEvents(EVENT_POOLS[action.event_pool_id]);
      if (eligible.length > 0) state.pendingEvent = selectBalancedEvent(eligible);
    }
    // Succession check
    if (characterAge() >= LIFE_EXPECTANCY || state.health <= 0) {
      if (!state.pendingEvent) triggerSuccession();
    }
    renderAll();
    saveGame();
  });
}

// ═══════════════════════════════════════════════════════════ ANIMATION SYSTEM

// Snapshot current numeric values
function snapshotNums() {
  return {
    food:      state.food,
    health:    state.health,
    material:  state.material,
    reputacio: state.reputacio,
    forca:  state.character.stats['forca'],
    enginy: state.character.stats['enginy'],
    vincle: state.character.stats['vincle'],
  };
}

// Floating +/- numbers near UI elements
function applyFxFloaters(before) {
  const cur = snapshotNums();
  const anchorMap = {
    food:      'hex-food',
    health:    'hex-health',
    material:  'tok-material-val',
    reputacio: 'tok-reputacio-val',
    forca:     'hex-forca',
    enginy:    'hex-enginy',
    vincle:    'hex-vincle',
  };
  for (const [k, anchorId] of Object.entries(anchorMap)) {
    const delta = (cur[k] || 0) - (before[k] || 0);
    if (Math.abs(delta) < 0.001) continue;
    const anchor = el(anchorId);
    if (!anchor) continue;
    const rect = anchor.getBoundingClientRect();
    const div = document.createElement('div');
    div.className = `float-num ${delta > 0 ? 'pos' : 'neg'}`;
    div.textContent = (delta > 0 ? '+' : '') + (Number.isInteger(delta) ? delta : delta.toFixed(1));
    div.style.left = (rect.left + rect.width / 2 - 14) + 'px';
    div.style.top  = rect.top + 'px';
    document.body.appendChild(div);
    div.addEventListener('animationend', () => div.remove());
  }
}

// Resource balls flying from donut to top bar
function spawnResBalls(before) {
  const cur = snapshotNums();
  const resConfig = [
    { key: 'material',  targetId: 'tok-material',  valId: 'tok-material-val'  },
    { key: 'reputacio', targetId: 'tok-reputacio', valId: 'tok-reputacio-val' },
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
            valEl.textContent = parseInt(valEl.textContent || '0') + amount;
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
    { key: 'food',   id: 'hex-food',   fmt: v => Math.round(v) },
    { key: 'health', id: 'hex-health', fmt: v => Math.round(v) },
    { key: 'reputacio', id: 'hex-reputation', fmt: v => Math.round(v) },
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
  const icon = getActionIcon(action);
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
    ring.style.transition      = `stroke-dasharray 1.8s linear`;
    ring.style.strokeDasharray = `${C} 0`;
  }));
  setTimeout(() => {
    hide('exec-donut-overlay');
    ring.style.transition      = 'none';
    ring.style.strokeDasharray = `0 ${C}`;
    document.body.classList.remove('donut-active');
    onComplete();
  }, 1950);
}

// ═══════════════════════════════════════════════════════════ ZONE MAP RENDERING
function renderZoneNodes() {
  const mapZone = el('map-zone');
  mapZone.innerHTML = '';
  for (const zoneDef of ZONE_DEFS) {
    if (!state.discoveredZoneIds.has(zoneDef.id)) continue;
    const pos = ZONE_POS[zoneDef.id] || { left: 50, top: 50 };
    const imgCode = ZONE_IMG[zoneDef.id] || zoneDef.id.toUpperCase();
    const node = document.createElement('button');
    node.className    = 'zone-node';
    node.dataset.zone = zoneDef.id;
    node.style.left   = pos.left + '%';
    node.style.top    = pos.top  + '%';
    const imgSrc = `../../design/life-tycoon/zones/ZONA-PRE-${imgCode}.png`;
    node.innerHTML = `
      <img class="zone-node-img" src="${imgSrc}" alt=""
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="zone-node-icon" style="display:none;font-size:3rem">${ZONE_ICONS[zoneDef.id] || '❓'}</div>
      <span class="zone-node-name">${zoneDef.label || zoneDef.id}</span>`;
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
}

// ═══════════════════════════════════════════════════════════ CAROUSEL
const CAROUSEL = { actions: [], idx: 0, zoneId: null, dragStartX: 0, dragDelta: 0, dragging: false, didDrag: false };
const CAROUSEL_STEP = 110;

function getZoneActions(zoneId) {
  const base = ACTIONS.filter(a => {
    if (a.zona !== zoneId) return false;
    if (!state.character.purchasedActionIds.has(a.id)) return false;
    const age = characterAge();
    if (a.minAge !== undefined && age < a.minAge) return false;
    if (a.maxAge !== undefined && age > a.maxAge) return false;
    if (!evaluateCharacterRequires(a)) return false;
    return true;
  });
  // Show discovery action if eligible skills exist
  const disc = ACTIONS.find(a => a.is_discovery_action && a.zona === zoneId);
  if (disc && getEligibleSkills().length > 0) base.unshift(disc);
  return base;
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

function buildCarouselItems() {
  const vp = el('zone-carousel-viewport');
  vp.innerHTML = '';
  CAROUSEL.actions.forEach((action, i) => {
    const blocked = getActionVisibility(action) !== 'ACTIVE';
    const item = document.createElement('div');
    item.className = 'zc-item' + (blocked ? ' zc-blocked' : '');
    item.dataset.idx = i;
    item.innerHTML = `<span class="zc-icon">${getActionIcon(action)}</span><button class="zc-info-btn" aria-label="Info">ⓘ</button>`;
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
    el('zc-name').textContent     = 'Cap acció disponible';
    el('zc-benefits').textContent = '';
    el('zc-desc').textContent     = 'Desbloqueja accions aprenent habilitats.';
    return;
  }
  const action  = actions[idx];
  const blocked = getActionVisibility(action) !== 'ACTIVE';
  const outIcons = { food: '🌾', material: '🧠', health: '❤️', reputacio: '🏛️' };
  const parts = [];
  if (!blocked && action.output_resource && action.output_min != null) {
    const icon = outIcons[action.output_resource] || '📦';
    parts.push(`${icon} ${action.output_min}–${action.output_max}`);
  }
  if (action.side_effects) {
    for (const se of action.side_effects) {
      const icon = outIcons[se.resource] || '📦';
      parts.push(`${icon} ${se.delta > 0 ? '+' : ''}${se.delta}`);
    }
  }
  el('zc-name').textContent     = action.name;
  el('zc-benefits').textContent = parts.join('  ');
  el('zc-desc').textContent     = blocked
    ? '🔒 Inclinació insuficient'
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
  // Bust
  el('char-bust-img').src    = bustImgSrc();
  el('char-name-inlay').textContent = state.character.label || state.dynastyName || '—';
  el('char-age-inlay').textContent  = `${characterAge()} cicles · Gen ${state.generation}`;

  // Left column: Aliment / Salut / Reputació
  el('hex-food').textContent       = Math.round(state.food);
  el('hex-health').textContent     = Math.round(state.health);
  el('hex-reputation').textContent = Math.round(state.reputacio || 0);

  // Right column: Força / Enginy / Vincle
  el('hex-forca').textContent  = (state.character.stats['forca']  || 0).toFixed(1);
  el('hex-enginy').textContent = (state.character.stats['enginy'] || 0).toFixed(1);
  el('hex-vincle').textContent = (state.character.stats['vincle'] || 0).toFixed(1);

  // Branch badges
  const branchEl = el('branch-badges');
  branchEl.innerHTML = '';
  const activeBranches = getActiveBranches();
  for (const b of activeBranches) {
    const pill = document.createElement('span');
    pill.className   = 'branch-pill';
    pill.textContent = b.name;
    branchEl.appendChild(pill);
  }

  // Skill pills
  const skillEl = el('skill-badges');
  skillEl.innerHTML = '';
  for (const skillId of state.character.unlockedSkillIds) {
    const bt = SKILL_DEFS.find(t => t.id === skillId);
    if (!bt) continue;
    const pill = document.createElement('span');
    pill.className   = 'skill-pill';
    pill.textContent = bt.name;
    skillEl.appendChild(pill);
  }
}

// ═══════════════════════════════════════════════════════════ TOP BAR
function renderTopBar() {
  el('tok-material-val').textContent  = Math.round(state.material || 0);
  el('tok-reputacio-val').textContent = Math.round(state.reputacio || 0);
}

// ═══════════════════════════════════════════════════════════ BOTTOM PANEL
function renderBottomPanel() {
  // Cycle counter
  el('panel-turn-info').textContent = `Cicle ${state.cycle}/${ERA_CYCLES}`;
  // Food with max and dynamic upkeep rate
  const childUpkeep = state.character.children.length;
  el('panel-food-val').textContent = `${Math.round(state.food)}/${FOOD_MAX}`;
  el('panel-food-fc').textContent  = `-${FOOD_UPKEEP + childUpkeep}/t`;
  // Time pips: show 5 life-stage pips
  const pips = el('time-pips');
  pips.innerHTML = '';
  const lifePct = Math.min(1, characterAge() / LIFE_EXPECTANCY);
  for (let i = 0; i < 5; i++) {
    const pip = document.createElement('div');
    pip.className = 'time-pip' + (i < Math.ceil(lifePct * 5) ? ' active' : '');
    pips.appendChild(pip);
  }
  // Log
  const logEl = el('session-log-list');
  logEl.innerHTML = '';
  for (const msg of state.log) {
    const li = document.createElement('li');
    li.textContent = msg;
    logEl.appendChild(li);
  }
}

// ═══════════════════════════════════════════════════════════ IN-MAP OVERLAYS
function renderInMapOverlay() {
  // Pending discoveries (tech / skill / zone / destresa)
  if (state.pendingDiscoveries.length > 0) {
    const disc = state.pendingDiscoveries[0];
    el('disc-icon').textContent  = disc.icon;
    el('disc-name').textContent  = disc.name;
    el('disc-badge').textContent = disc._isDestresa ? '⭐ Nova destresa' : disc._isZone ? '🗺️ Zona descoberta' : disc._isTech ? '✦ DESCOBRIMENT ✦' : '✨ Nou descobriment';
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
    el('birth-virtue').textContent = birth.n === 1
      ? 'La successió és assegurada.'
      : `${birth.n}è fill. Podreu triar successor.`;
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
    if (ev.options && ev.options.length > 0) {
      dismissBtn.style.display = 'none';
      for (let i = 0; i < ev.options.length; i++) {
        const opt = ev.options[i];
        const btn = document.createElement('button');
        btn.className = 'ev-choice-btn';
        const fxParts = [];
        if (opt.food_delta)     fxParts.push(`${opt.food_delta > 0 ? '+' : ''}${opt.food_delta}🌾`);
        if (opt.health_delta)   fxParts.push(`${opt.health_delta > 0 ? '+' : ''}${opt.health_delta}❤️`);
        if (opt.material_delta) fxParts.push(`${opt.material_delta > 0 ? '+' : ''}${opt.material_delta}🧠`);
        const fxHint = fxParts.length ? `<span class="ev-choice-fx">${fxParts.join('  ')}</span>` : '';
        btn.innerHTML = `<span class="ev-choice-name">${opt.text}</span>${fxHint}`;
        btn.dataset.idx = i;
        btn.addEventListener('click', () => resolveDiscoveryOption(i));
        choicesEl.appendChild(btn);
      }
    } else {
      dismissBtn.style.display = '';
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
  state.pendingDiscoveries.shift();
  renderAll();
}
function dismissBirth() {
  state.pendingBirths.shift();
  renderAll();
}
function dismissEvent() {
  const ev = state.pendingEvent;
  if (!ev) return;
  if (ev.is_single_use) state.firedSingleUseEventIds.add(ev.id);
  trackEventFired(ev);
  if (ev.effects) {
    if (ev.effects.food)   state.food   = Math.max(0, Math.min(FOOD_MAX, state.food + ev.effects.food));
    if (ev.effects.health) state.health = Math.max(0, Math.min(HEALTH_MAX, state.health + ev.effects.health));
  }
  state.pendingEvent = null;
  if (characterAge() >= LIFE_EXPECTANCY || state.health <= 0) triggerSuccession();
  renderAll();
  saveGame();
}
function resolveDiscoveryOption(optionIndex) {
  const ev = state.pendingEvent;
  if (!ev || !ev.options) return;
  const opt = ev.options[optionIndex];
  if (opt.food_delta)     state.food     = Math.max(0, Math.min(FOOD_MAX, state.food + opt.food_delta));
  if (opt.material_delta) state.material = Math.max(0, state.material + opt.material_delta);
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
  if (healthDelta !== 0) state.health = Math.max(0, Math.min(HEALTH_MAX, state.health + healthDelta));
  if (opt.discovers && ev.discovery_skill_id) {
    const bt = SKILL_DEFS.find(t => t.id === ev.discovery_skill_id);
    if (bt) unlockSkill(bt);
  }
  if (ev.is_single_use) state.firedSingleUseEventIds.add(ev.id);
  trackEventFired(ev);
  state.pendingEvent = null;
  if (characterAge() >= LIFE_EXPECTANCY || state.health <= 0) triggerSuccession();
  renderAll();
  saveGame();
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
    const list = el('succ-children-list');
    list.innerHTML = '';
    for (const c of s.successors) {
      const btn = document.createElement('button');
      btn.className = 'succ-child-btn';
      const dominant = c.inheritedInclination
        ? AXES.reduce((a, b) => Math.abs(c.inheritedInclination[a]||0) > Math.abs(c.inheritedInclination[b]||0) ? a : b)
        : null;
      btn.innerHTML = `<span class="succ-child-name">${c.label} ${state.dynastyName}</span><span class="succ-child-sub">${c.is_sibling ? 'Germà' : 'Fill'} · ${dominant ? `Inclinació: ${dominant}` : ''}</span>`;
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

  // Branches
  const activeBranches = getActiveBranches();
  const brEl = el('test-branches');
  brEl.innerHTML = activeBranches.length
    ? activeBranches.map(b => `<span class="test-badge test-badge-branch">${b.name}</span>`).join('')
    : '<span style="font-size:0.7rem;color:var(--text-dim)">Cap</span>';

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
  const cycles   = state.cycle;
  const gens     = state.genealogy.length;
  const techs    = state.discoveredUniversalTechIds.size;
  const skills   = state.genealogy.reduce((s, g) => s + (g.skills || 0), 0);
  const branches = new Set(state.genealogy.flatMap(g => g.branches || [])).size;
  const reputacio = state.reputacio || 0;
  const total = cycles * 2 + gens * 50 + techs * 100 + skills * 30 + branches * 40 + reputacio;
  return { total, cycles, gens, techs, skills, branches, reputacio };
}

function getDynastyTitle(score) {
  if (score >= 1500) return 'Llegenda de l\'Era';
  if (score >= 900)  return 'Llinatge Llegendari';
  if (score >= 550)  return 'Clan Respectat';
  if (score >= 250)  return 'Tribu Establerta';
  return 'Supervivents del Paleolític';
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

  // Score breakdown
  const breakdownEl = el('end-score-breakdown') || (() => {
    const d = document.createElement('div');
    d.id = 'end-score-breakdown';
    el('end-stats-row').insertAdjacentElement('afterend', d);
    return d;
  })();
  breakdownEl.innerHTML = [
    score.gens     > 0 ? `${score.gens}G × 50 = ${score.gens * 50}` : null,
    score.techs    > 0 ? `${score.techs}T × 100 = ${score.techs * 100}` : null,
    score.skills   > 0 ? `${score.skills}H × 30 = ${score.skills * 30}` : null,
    score.branches > 0 ? `${score.branches}B × 40 = ${score.branches * 40}` : null,
    score.reputacio > 0 ? `${score.reputacio} Reputació` : null,
    `${score.cycles}C × 2 = ${score.cycles * 2}`,
  ].filter(Boolean).map(t => `<span class="score-line">${t}</span>`).join('');

  const isGood = isEraEnd;
  const taglineMsg = isExtinct
    ? 'El llinatge s\'ha extingit sense hereus.'
    : isEraEnd
    ? `L'era de la Prehistòria ha finalitzat. ${score.gens} generació${score.gens !== 1 ? 'ns' : ''} han viscut.`
    : `La partida ha acabat al cicle ${score.cycles}.`;
  if (el('end-result-msg')) el('end-result-msg').textContent = taglineMsg;

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
  renderZoneNodes();
  renderInMapOverlay();

  // Update testing panel if open
  if (!el('overlay-test-panel').classList.contains('hidden')) {
    renderTestingPanel();
  }
}

// ═══════════════════════════════════════════════════════════ EVENT LISTENERS
function setupEventListeners() {
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

}

function showActionInfo(action) {
  if (!action) return;
  el('ai-icon').textContent = getActionIcon(action);
  el('ai-name').textContent = action.name;
  el('ai-desc').textContent = action.description || '';
  const outIcons = { food: '🌾', material: '🧠', health: '❤️', reputacio: '🏛️' };
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
