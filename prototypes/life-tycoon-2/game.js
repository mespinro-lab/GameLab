// PROTOTYPE - NOT FOR PRODUCTION
// Question: Does inclination-driven action visibility + branch tech discovery + succession feel engaging?
// Date: 2026-05-26

'use strict';

// --- Logic Constants (engine behaviour — design values live in data.js) ---
const INERTIA_FACTOR  = 2.0;
const DEBUG_MODE      = false;
const INCL_DOT_VALUES = [-1.0, -0.5, 0.0, 0.5, 1.0];

// --- Derived Lookups (from data.js defs) ---
const AXES        = AXIS_DEFS.map(a => a.id);
const AXIS_LABELS = Object.fromEntries(AXIS_DEFS.map(a => [a.id, { left: a.left, right: a.right }]));
const ZONE_ORDER  = ZONE_DEFS.map(z => z.id);

// Returns health lost this cycle due to aging — accelerates exponentially past AGING_THRESHOLD
function getAgingLoss(cycle) {
  const excess = Math.max(0, cycle - AGING_THRESHOLD);
  return AGING_BASE + Math.floor(Math.pow(excess, AGING_POWER) * AGING_SCALE);
}

function characterAge() {
  return state.cycle - (state.character.birthCycle || 0);
}

// --- Game State ---
let state = null;
let zoneFilters = Object.fromEntries(ZONE_DEFS.map(z => [z.id, 'active']));

function createCharacter(inheritedInclination, inheritedPurchasedIds, inheritedSkillIds, inheritedStats, inheritedDestreses, birthCycle = 0) {
  return {
    birthCycle,
    inclination: { ...inheritedInclination },
    purchasedActionIds: new Set(inheritedPurchasedIds),
    unlockedSkillIds: new Set(inheritedSkillIds),
    stats: inheritedStats ? { ...inheritedStats } : Object.fromEntries(STAT_DEFS.map(s => [s.id, STAT_STARTING_VALUE])),
    destreses: new Set(inheritedDestreses),
    firedSingleUseEventIds: new Set(),
    charState: Object.fromEntries(CHARACTER_STATE_DEFS.map(d => [d.id, d.startVal])),
    children: [],
  };
}

function freshInclination() {
  return Object.fromEntries(AXIS_DEFS.map(a => [a.id, 0.0]));
}

function initState() {
  const inclination = freshInclination();
  // Base actions are purchased from the start
  const basePurchased = new Set(ACTIONS.filter(a => a.is_base).map(a => a.id));

  state = {
    cycle: 0,
    generation: 1,
    ...Object.fromEntries(RESOURCE_DEFS.map(r => [r.id, r.startVal])),
    character: createCharacter(inclination, basePurchased, new Set()),
    discoveredUniversalTechIds: new Set(),
    discoveredZoneIds: new Set(ZONE_DEFS.filter(z => z.starts_discovered).map(z => z.id)),
    log: [],
    lastResult: null,
    gameOverReason: null,
    pendingEvent: null,
    pendingSuccession: null,
    pendingZoneDiscovery: null,
    siblingPool: [],
    gameOver: false,
    onboardingDismissed: localStorage.getItem('lt2_skip_onboarding') === '1',
  };
}

function dismissOnboarding(skip) {
  state.onboardingDismissed = true;
  if (skip) localStorage.setItem('lt2_skip_onboarding', '1');
  render();
}

// --- Inclination Logic ---
function applyDelta(current, delta) {
  const deltaEfectiu = delta / (1 + Math.abs(current) * INERTIA_FACTOR);
  return Math.max(-1.0, Math.min(1.0, current + deltaEfectiu));
}

function applyInclinationDeltas(deltas) {
  for (const axis of AXES) {
    const d = deltas[axis] || 0;
    if (d !== 0) {
      state.character.inclination[axis] = applyDelta(state.character.inclination[axis], d);
    }
  }
}

// --- Action Visibility ---
// Returns "ACTIVE", "FADED", or "HIDDEN"
function getActionVisibility(action) {
  if (!action.inclination_requirements) return "ACTIVE";

  for (const [axis, range] of Object.entries(action.inclination_requirements)) {
    const val = state.character.inclination[axis];
    const min = range.min !== undefined ? range.min : -Infinity;
    const max = range.max !== undefined ? range.max : Infinity;

    const inRange = val >= min && val <= max;
    if (inRange) continue; // this axis is fine

    // Out of range — check FADE_MARGIN
    const tooLow = range.min !== undefined && val < range.min;
    const tooHigh = range.max !== undefined && val > range.max;

    const nearLow  = tooLow  && (val >= range.min - FADE_MARGIN);
    const nearHigh = tooHigh && (val <= range.max + FADE_MARGIN);

    if (nearLow || nearHigh) return "FADED";
    return "HIDDEN";
  }
  return "ACTIVE";
}

// --- Branch Conditions ---
function evaluateConditions(condObj, inclination) {
  if (!condObj) return true;
  const inc = inclination || state.character.inclination;
  const results = condObj.conditions.map(cond => {
    const val = inc[cond.axis];
    const okMin = cond.min === undefined || val >= cond.min;
    const okMax = cond.max === undefined || val <= cond.max;
    return okMin && okMax;
  });
  if (condObj.operator === "AND") return results.every(Boolean);
  return results.some(Boolean); // OR
}

function getActiveBranches() {
  return BRANCHES.filter(b => evaluateConditions(b.conditions));
}

function getStatMultiplier(action) {
  if (!action.stat_key) return 1;
  return 1 + (state.character.stats[action.stat_key] - STAT_STARTING_VALUE) * STAT_OUTPUT_FACTOR;
}

// --- Universal Tech Discovery ---
function getDiscoverableTechs() {
  return UNIVERSAL_TECHS.filter(t =>
    state.cycle >= t.cycle && !state.discoveredUniversalTechIds.has(t.id)
  );
}

function discoverTech(techId) {
  if (state.discoveredUniversalTechIds.has(techId)) return;
  state.discoveredUniversalTechIds.add(techId);
  const tech = UNIVERSAL_TECHS.find(t => t.id === techId);
  addLog(`${tech.icon} Descoberta: ${tech.name}`);
  applyUniversalTechEffect(tech);
  render();
}

// Auto-applies any universal techs whose cycle has been reached (no render — callers handle it).
function autoDiscoverUniversalTechs() {
  for (const tech of getDiscoverableTechs()) {
    state.discoveredUniversalTechIds.add(tech.id);
    addLog(`${tech.icon} Descoberta: ${tech.name}`);
    applyUniversalTechEffect(tech);
  }
}

function applyUniversalTechEffect(tech) {
  if (!tech.effect) return;
  if (tech.effect.healthBonus) {
    state.health = Math.min(HEALTH_MAX, state.health + tech.effect.healthBonus);
  }
  if (tech.effect.desc) addLog(`✨ ${tech.effect.desc}`);
}

// --- Branch Tech Discovery ---

function getEligibleSkills() {
  return SKILL_DEFS.filter(skill =>
    !skill.is_hidden &&
    (!skill.universal_prereq || state.discoveredUniversalTechIds.has(skill.universal_prereq)) &&
    !state.character.unlockedSkillIds.has(skill.id) &&
    evaluateConditions(skill.inclination_conditions)
  );
}

function getSkillMaturity(skill) {
  let score = 0;
  for (const cond of skill.inclination_conditions.conditions) {
    const val = state.character.inclination[cond.axis];
    if (cond.min !== undefined) score += Math.max(0, val - cond.min);
  }
  return score;
}

function unlockSkill(skill) {
  if (state.character.unlockedSkillIds.has(skill.id)) return;
  state.character.unlockedSkillIds.add(skill.id);
  addLog(`Nova habilitat: ${skill.name}`);
  const pe = skill.passive_effect;
  if (pe) {
    if (pe.type === 'grant_health')    state.health    = Math.min(HEALTH_MAX, state.health + pe.amount);
    if (pe.type === 'grant_material') state.material += pe.amount;
    if (pe.type === 'unlock_zone')        state.discoveredZoneIds.add(pe.unlocks_zone);
    if (pe.desc) addLog(`Efecte passiu: ${pe.desc}`);
  }
  const newActions = ACTIONS.filter(a => skill.unlocks_action_ids.includes(a.id));
  if (newActions.length > 0) {
    const byZone = {};
    for (const a of newActions) {
      (byZone[a.zona] = byZone[a.zona] || []).push(a.name);
    }
    const parts = Object.entries(byZone).map(([z, names]) => `${z}: ${names.join(', ')}`);
    state.lastResult = `Habilitat nova: ${skill.name} · Noves accions — ${parts.join('; ')}. Ves a 'Aprendre' per comprar-les.`;
  } else {
    state.lastResult = `Habilitat nova apresa: ${skill.name}`;
  }
}

function performDiscoveryAction(chosenBtId) {
  const eligible = getEligibleSkills();
  if (eligible.length === 0) {
    addLog("No hi ha tècniques noves a descobrir ara.");
    render();
    return;
  }
  const chosen = chosenBtId
    ? (eligible.find(bt => bt.id === chosenBtId) ?? eligible[0])
    : (() => {
        const maxScore = Math.max(...eligible.map(bt => getSkillMaturity(bt)));
        const top = eligible.filter(bt => getSkillMaturity(bt) === maxScore);
        return top[Math.floor(Math.random() * top.length)];
      })();
  unlockSkill(chosen);
  state.cycle++;
  autoDiscoverUniversalTechs();
  state.food   = Math.max(0, state.food   - FOOD_UPKEEP);
  state.health = Math.max(0, state.health - getAgingLoss(characterAge()));

  if (characterAge() >= LIFE_EXPECTANCY || state.health <= 0) {
    if (!state.pendingEvent) triggerSuccession();
  }
  render();
}

function evaluateBlockedIf(conditions) {
  if (!conditions || conditions.length === 0) return false;
  return conditions.some(cond => {
    if (cond.type === 'has_skill') return state.character.unlockedSkillIds.has(cond.id);
    if (cond.type === 'has_destresa')    return state.character.destreses.has(cond.id);
    if (cond.type === 'stat_min')        return (state.character.stats[cond.stat] || 0) >= cond.min;
    return false;
  });
}

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
    if (eff.message) {
      state.lastResult = eff.message;
      addLog(eff.message.split('.')[0]);
    }
  }
  if (eff.type === 'add_child') {
    const nameIdx = (state.generation * 7 + state.character.children.length * 3) % CHILD_NAMES.length;
    const child = { id: `child_${state.generation}_${state.cycle}`, label: CHILD_NAMES[nameIdx] };
    state.character.children.push(child);
    state.character.charState.fills = state.character.children.length;
    const n = state.character.children.length;
    state.lastResult = n === 1
      ? `Primer fill nascut. La successió és assegurada.`
      : `${n}è fill nascut. Podreu triar successor.`;
    addLog(`Fill nascut (${n}/${MAX_CHILDREN}).`);
  }
}

// Filter a pool to only eligible events (excludes discovery events whose conditions aren't met)
function getEligiblePoolEvents(pool) {
  return pool.filter(ev => {
    if (ev.is_single_use && state.character.firedSingleUseEventIds.has(ev.id)) return false;
    if (ev.blocked_if && evaluateBlockedIf(ev.blocked_if)) return false;
    if (!ev.is_discovery_event) return true;
    const skillId = ev.discovery_skill_id;
    if (state.character.unlockedSkillIds.has(skillId)) return false;
    const bt = SKILL_DEFS.find(t => t.id === skillId);
    if (!bt) return false;
    if (!state.discoveredUniversalTechIds.has(skill.universal_prereq)) return false;
    return evaluateConditions(skill.inclination_conditions);
  });
}

// --- Action Purchase & Execute ---
function purchaseAction(actionId) {
  const action = ACTIONS.find(a => a.id === actionId);
  if (!action || action.is_base) return;
  if (state.character.purchasedActionIds.has(actionId)) return;

  const vis = getActionVisibility(action);
  if (vis !== "ACTIVE") {
    addLog("Acció no disponible en l'estat actual.");
    return;
  }
  if (state.material < action.purchase_cost) {
    addLog(`Provisions insuficients per aprendre ${action.name}.`);
    render();
    return;
  }

  state.material -= action.purchase_cost;
  state.character.purchasedActionIds.add(actionId);

  addLog(`Après: ${action.name} (−${action.purchase_cost} 🧠)`);
  render();
}

function checkDestresesAfterAction() {
  if (state.character.destreses.size >= DESTRESA_MAX) return;
  for (const def of DESTRESA_DEFS) {
    if (state.character.destreses.has(def.id)) continue;
    const met = def.conditions.every(c => {
      const val = state.character.inclination[c.axis] ?? 0;
      if (c.min !== undefined && val < c.min) return false;
      if (c.max !== undefined && val > c.max) return false;
      return true;
    });
    if (met) {
      state.character.destreses.add(def.id);
      addLog(`⭐ Destresa: ${def.name}`);
      state.lastResult = `Has après la destresa "${def.name}" per la teva inclinació vital.`;
    }
  }
}

function executeAction(actionId) {
  const action = ACTIONS.find(a => a.id === actionId);
  if (!action) return;
  if (!state.character.purchasedActionIds.has(actionId)) return;
  state.pendingZoneDiscovery = null;

  const vis = getActionVisibility(action);
  if (vis !== "ACTIVE") {
    addLog(`${action.name} no és executable en l'estat actual.`);
    render();
    return;
  }
  if (state.food < action.execute_cost) {
    addLog(`Aliment insuficient per executar ${action.name}.`);
    render();
    return;
  }

  const age = characterAge();
  if (action.minAge !== undefined && age < action.minAge) {
    addLog(`${action.name} requereix edat mínima ${action.minAge}.`);
    render();
    return;
  }
  if (action.maxAge !== undefined && age > action.maxAge) {
    addLog(`${action.name} no disponible passats ${action.maxAge} cicles.`);
    render();
    return;
  }

  if (!evaluateCharacterRequires(action)) {
    render();
    return;
  }

  state.food -= action.execute_cost;

  // Roll output: stat multiplier + destresa flat bonus
  const destresaBonus = (action.destresa_id && state.character.destreses.has(action.destresa_id))
    ? DESTRESA_BONUS : 0;
  const outputMinBonus = [...state.character.unlockedSkillIds].reduce((sum, skillId) => {
    const bt = SKILL_DEFS.find(t => t.id === skillId);
    return (bt?.passive_effect?.type === 'bonus_action_output' && skill.passive_effect.action_id === actionId)
      ? sum + skill.passive_effect.output_min_bonus : sum;
  }, 0);
  const output = Math.round(randInt(action.output_min + outputMinBonus, action.output_max) * getStatMultiplier(action)) + destresaBonus;
  const outRes = action.output_resource || 'food';
  const outResDef = RESOURCE_DEFS.find(r => r.id === outRes);
  if (outResDef) {
    const newVal = (state[outRes] || 0) + output;
    state[outRes] = outResDef.max != null ? Math.min(outResDef.max, newVal) : newVal;
  }

  // Side-effects (risky / restorative actions)
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

  // Apply inclination deltas
  applyInclinationDeltas(action.inclination_deltas);

  // Grow the relevant stat
  if (action.stat_key && action.stat_gain) {
    state.character.stats[action.stat_key] = Math.min(STAT_MAX,
      state.character.stats[action.stat_key] + action.stat_gain);
  }

  // Check destresa discovery by inclination conditions
  checkDestresesAfterAction();

  // Advance cycle
  state.cycle++;
  autoDiscoverUniversalTechs();

  const resLabel = outResDef ? outResDef.label : outRes;
  if (output > 0) addLog(`[${state.cycle}] ${action.name}: +${output} ${resLabel}`);
  if (output > 0) state.lastResult = `Cicle ${state.cycle} — ${action.name}: +${output} ${resLabel}`;

  if (action.unlocks_zone && !state.discoveredZoneIds.has(action.unlocks_zone)) {
    state.discoveredZoneIds.add(action.unlocks_zone);
    addLog(`Nova zona descoberta: ${action.unlocks_zone}`);
    state.pendingZoneDiscovery = action.unlocks_zone;
    state.lastResult = null;
  }

  // Apply character state effects and reputation
  applyCharacterEffect(action);
  if (action.reputation_gain) state.reputacio = (state.reputacio || 0) + action.reputation_gain;

  // Upkeep (food + health lost to survival and aging)
  const agingLoss = getAgingLoss(characterAge());
  state.food   = Math.max(0, state.food   - FOOD_UPKEEP);
  state.health = Math.max(0, state.health - agingLoss);
  if (state.food   === 0) addLog(`⚠ Provisions crítiques.`);
  if (state.health === 0) addLog(`💀 Salut crítica.`);
  if (characterAge() === AGING_THRESHOLD + 1) addLog(`L'envelliment s'accelera.`);

  // Trigger event — only fires EVENT_TRIGGER_CHANCE of the time
  if (action.event_pool_id && EVENT_POOLS[action.event_pool_id] && Math.random() < EVENT_TRIGGER_CHANCE) {
    const pool = getEligiblePoolEvents(EVENT_POOLS[action.event_pool_id]);
    if (pool.length > 0) {
      state.pendingEvent = pool[Math.floor(Math.random() * pool.length)];
    }
  }

  // Check succession: end of life OR health depleted
  if (characterAge() >= LIFE_EXPECTANCY || state.health <= 0) {
    if (!state.pendingEvent) triggerSuccession();
  }

  render();
}

function dismissEvent() {
  const ev = state.pendingEvent;
  if (!ev) return;
  if (ev.is_single_use) state.character.firedSingleUseEventIds.add(ev.id);

  if (ev.effects) {
    if (ev.effects.food)   { state.food   = Math.max(0, Math.min(FOOD_MAX, state.food + ev.effects.food));   addLog(`Esdeveniment: ${ev.effects.food   >= 0 ? '+' : ''}${ev.effects.food} Aliment`); }
    if (ev.effects.health) { state.health = Math.max(0, Math.min(HEALTH_MAX, state.health + ev.effects.health)); addLog(`Esdeveniment: ${ev.effects.health >= 0 ? '+' : ''}${ev.effects.health} Salut`); }
  }

  state.pendingEvent = null;
  if (characterAge() >= LIFE_EXPECTANCY || state.health <= 0) triggerSuccession();
  render();
}

function resolveDiscoveryOption(optionIndex) {
  const ev = state.pendingEvent;
  if (!ev || !ev.options) return;
  const opt = ev.options[optionIndex];

  if (opt.food_delta !== 0) {
    state.food = Math.max(0, state.food + opt.food_delta);
    addLog(`Esdeveniment: ${opt.food_delta >= 0 ? '+' : ''}${opt.food_delta} Aliment`);
  }

  if (opt.discovers && ev.discovery_skill_id) {
    const bt = SKILL_DEFS.find(t => t.id === ev.discovery_skill_id);
    if (bt) unlockSkill(bt);
  }

  if (ev.is_single_use) state.character.firedSingleUseEventIds.add(ev.id);
  state.pendingEvent = null;
  if (characterAge() >= LIFE_EXPECTANCY || state.health <= 0) triggerSuccession();
  render();
}

function triggerSuccession() {
  if (state.cycle >= ERA_CYCLES) {
    state.gameOver = true;
    state.gameOverReason = 'era_complete';
    return;
  }

  const children   = state.character.children;
  const siblings   = state.siblingPool;

  if (children.length === 0 && siblings.length === 0) {
    state.gameOver = true;
    state.gameOverReason = 'no_heir';
    return;
  }

  const topAxis = AXES.reduce((a, b) =>
    Math.abs(state.character.inclination[a]) > Math.abs(state.character.inclination[b]) ? a : b
  );

  // Pre-compute inheritance from current character (same for all children)
  const inheritedInclination = Object.fromEntries(
    AXES.map(a => [a, state.character.inclination[a] * INCLINATION_INHERITANCE_RATE])
  );
  const parentStats = state.character.stats;
  const inheritedStats = Object.fromEntries(
    STAT_DEFS.map(s => [s.id, parentStats[s.id] * INCLINATION_INHERITANCE_RATE + STAT_STARTING_VALUE * (1 - INCLINATION_INHERITANCE_RATE)])
  );
  const inheritedPurchased   = new Set(state.character.purchasedActionIds);
  const inheritedSkills = new Set(state.character.unlockedSkillIds);
  const inheritedDestreses   = new Set(state.character.destreses);
  const hasEnsenyat          = state.character.charState.ensenyat === 1;

  const childSuccessors = children.map(c => ({
    ...c,
    is_sibling: false,
    inheritedInclination,
    inheritedStats,
    inheritedPurchased,
    inheritedSkills,
    inheritedDestreses,
    hasEnsenyat,
  }));

  const siblingSuccessors = siblings.map(s => ({ ...s, is_sibling: true }));

  state.pendingSuccession = {
    generation: state.generation,
    cyclesLived: characterAge(),
    topAxis,
    topAxisVal: state.character.inclination[topAxis].toFixed(2),
    successors: [...childSuccessors, ...siblingSuccessors],
  };
}

function continueSuccession(successorId) {
  if (!state.pendingSuccession) return;
  const s = state.pendingSuccession;

  const chosen = s.successors.find(c => c.id === successorId);
  if (!chosen) return;

  // Unchosen children become siblings for the next generation
  const unchosenChildren = s.successors.filter(c => !c.is_sibling && c.id !== successorId);
  state.siblingPool = [
    ...unchosenChildren,
    ...state.siblingPool.filter(sib => sib.id !== successorId),
  ];

  state.pendingSuccession = null;

  // Reset non-persistent resources; apply inheritDecay on persistent ones that define it
  for (const res of RESOURCE_DEFS) {
    if (!res.persistent) {
      state[res.id] = res.startVal;
    } else if (res.inheritDecay != null) {
      state[res.id] = Math.floor((state[res.id] || 0) * res.inheritDecay);
    }
  }

  state.generation++;
  // state.cycle does NOT reset — it is an era-wide counter

  // Probabilistic branch tech inheritance (parent teaching bonus applied)
  const teachingBonus = chosen.hasEnsenyat ? TEACHING_BONUS : 0;
  const inheritedSkills = new Set();
  for (const skillId of chosen.inheritedSkills) {
    const bt = SKILL_DEFS.find(t => t.id === skillId);
    const rate = Math.min(1, (bt ? (skill.inheritanceRate || 0) : 0) + teachingBonus);
    if (Math.random() < rate) inheritedSkills.add(skillId);
  }

  state.character = createCharacter(
    chosen.inheritedInclination,
    chosen.inheritedPurchased,
    inheritedSkills,
    chosen.inheritedStats,
    chosen.inheritedDestreses,
    state.cycle  // birthCycle = current era cycle
  );

  state.lastResult = null;
  state.pendingZoneDiscovery = null;
  addLog(`--- Generació ${state.generation} ---`);
  render();
}

function restartGame() {
  initState();
  render();
}

// --- Helpers ---
function randInt(min, max) {
  if (min > max) return min;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addLog(msg) {
  state.log.unshift(msg);
  if (state.log.length > 8) state.log.length = 8;
}

// --- Rendering ---


function getInclinationHint(action) {
  const deltas = action.inclination_deltas;
  const hints = Object.entries(deltas)
    .filter(([, d]) => Math.abs(d) >= 0.01)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 2)
    .map(([axis, d]) => {
      const labels = AXIS_LABELS[axis];
      return d > 0 ? labels.right : labels.left;
    });
  return hints.length ? '→ ' + hints.join(' · ') : '';
}

function inclinationToDotIndex(val) {
  if (val < -0.5) return 0;
  if (val < -0.1) return 1;
  if (val <=  0.1) return 2;
  if (val <=  0.5) return 3;
  return 4;
}

function render() {
  renderTopBar();
  renderProfilePanel();
  renderActionsPanel();
  renderModals();
}

function renderTopBar() {
  document.getElementById("cycle-counter").textContent = `Era ${state.cycle}/${ERA_CYCLES}`;
  document.getElementById("gen-counter").textContent = `Gen ${state.generation} · Edat ${characterAge()}`;

  const vitalsEl    = document.getElementById("top-vitals");
  const resourcesEl = document.getElementById("top-resources");
  vitalsEl.innerHTML    = "";
  resourcesEl.innerHTML = "";

  const agingNow = getAgingLoss(characterAge());
  for (const res of RESOURCE_DEFS) {
    const val  = state[res.id];
    const pill = document.createElement("span");
    pill.id    = `${res.id}-counter`;

    let inner = `${res.emoji} ${val}`;
    if (res.showMax)              inner += `/<span class="stat-cap">${res.max}</span>`;
    if (res.rateType === 'fixed') inner += `<span class="stat-rate">-${res.upkeep}/t</span>`;
    if (res.rateType === 'aging') inner += `<span class="stat-rate">-${agingNow}/t</span>`;
    pill.innerHTML = inner;

    if (res.color)       pill.style.color       = res.color;
    if (res.borderColor) pill.style.borderColor = res.borderColor;

    let cls = `stat-pill stat-${res.id}`;
    if (res.critAt !== undefined && val <= res.critAt)      cls += ' stat-critical';
    else if (res.warnAt !== undefined && val <= res.warnAt) cls += ' stat-warning';
    if (res.rateType === 'aging' && agingNow >= 10)         cls += ' aging-fast';
    pill.className = cls;

    (res.section === 'vitals' ? vitalsEl : resourcesEl).appendChild(pill);
  }
}

function renderProfilePanel() {
  // Profile label — dominant branch name or default
  const activeBranchesNow = getActiveBranches();
  document.getElementById("profile-label").textContent =
    activeBranchesNow.length > 0 ? activeBranchesNow[0].name : "Explorador";

  // Stats (Força / Enginy / Vincle)
  const statsEl = document.getElementById("stats-display");
  statsEl.innerHTML = "";
  for (const { id, label } of STAT_DEFS) {
    const val = state.character.stats[id];
    const pct = Math.min(100, Math.max(0, (val - STAT_STARTING_VALUE) / (STAT_MAX - STAT_STARTING_VALUE) * 100));
    const row = document.createElement("div");
    row.className = "stat-row";
    row.innerHTML = `<span class="stat-name">${label}</span>` +
      `<div class="stat-bar-track"><div class="stat-bar-fill" style="width:${pct.toFixed(1)}%"></div></div>` +
      `<span class="stat-value">${val.toFixed(1)}</span>`;
    statsEl.appendChild(row);
  }

  // Inclination dots
  const inclEl = document.getElementById("inclination-rows");
  inclEl.innerHTML = "";
  for (const axis of AXES) {
    const val = state.character.inclination[axis];
    const labels = AXIS_LABELS[axis];
    const activeDot = inclinationToDotIndex(val);

    const row = document.createElement("div");
    row.className = "incl-row";
    row.dataset.axis = axis;

    const leftLbl = document.createElement("span");
    leftLbl.className = "incl-pole";
    leftLbl.textContent = labels.left;

    const dotsEl = document.createElement("span");
    dotsEl.className = "incl-dots";
    for (let i = 0; i < 5; i++) {
      const dot = document.createElement("span");
      dot.className = "incl-dot";
      dot.dataset.idx = i;
      if (i === activeDot) {
        dot.classList.add(i < 2 ? "active-left" : i === 2 ? "active-center" : "active-right");
      }
      dotsEl.appendChild(dot);
    }

    const rightLbl = document.createElement("span");
    rightLbl.className = "incl-pole right";
    rightLbl.textContent = labels.right;

    row.appendChild(leftLbl);
    row.appendChild(dotsEl);
    row.appendChild(rightLbl);
    inclEl.appendChild(row);
  }
  const inclHintEl = document.createElement("div");
  inclHintEl.className = "dim incl-hint";
  inclHintEl.textContent = "Les accions mouen la inclinació → desbloquegen branques";
  inclEl.appendChild(inclHintEl);

  // Family status
  const famEl = document.getElementById("family-status");
  famEl.innerHTML = `
    <span class="family-badge ${state.character.charState.parella ? 'achieved' : ''}">Parella</span>
    <span class="family-badge ${state.character.children.length > 0 ? 'achieved' : ''}">Fills (${state.character.children.length}/${MAX_CHILDREN})</span>
    ${state.siblingPool.length > 0 ? `<span class="family-badge achieved" style="background:rgba(245,166,35,0.15);border-color:rgba(245,166,35,0.3)">Germans (${state.siblingPool.length})</span>` : ''}
    ${state.character.charState.ensenyat ? `<span class="family-badge achieved" style="background:rgba(168,85,247,0.15);border-color:rgba(168,85,247,0.3)">Ensenyat ✓</span>` : ''}
  `;
  if (!state.gameOver) {
    const cyclesRem = LIFE_EXPECTANCY - characterAge();
    const hintEl = document.createElement("div");
    hintEl.className = "dim incl-hint";
    hintEl.textContent = `Queden ${cyclesRem} cicle${cyclesRem === 1 ? '' : 's'}. Assegura la successió.`;
    famEl.appendChild(hintEl);
  }

  // Branches
  const branchesEl = document.getElementById("active-branches");
  branchesEl.innerHTML = "";
  const activeBranches = getActiveBranches();
  if (activeBranches.length === 0) {
    branchesEl.innerHTML = '<span class="no-branch">Cap branca activa</span>';
  } else {
    for (const b of activeBranches) {
      const chip = document.createElement("span");
      chip.className = "branch-chip";
      chip.textContent = b.name;
      branchesEl.appendChild(chip);
    }
  }

  // Branch tech skills
  const btEl = document.getElementById("unlocked-branch-techs");
  btEl.innerHTML = "";
  if (state.character.unlockedSkillIds.size === 0) {
    btEl.innerHTML = '<div class="dim">Cap habilitat desblocada</div>';
  } else {
    for (const skillId of state.character.unlockedSkillIds) {
      const bt = SKILL_DEFS.find(t => t.id === skillId);
      if (!bt) continue;
      const div = document.createElement("div");
      div.className = "skill-item";
      div.textContent = skill.name;
      // S2-03: warn if all actions from this tech are in undiscovered zones
      const skillActions = ACTIONS.filter(a => skill.unlocks_action_ids.includes(a.id));
      const allLocked = skillActions.length > 0 && skillActions.every(a => !state.discoveredZoneIds.has(a.zona));
      if (allLocked) {
        const hint = document.createElement("span");
        hint.className = "skill-zone-hint";
        hint.title = `Zona necessària: ${skillActions[0].zona}`;
        hint.textContent = " 🔒";
        div.appendChild(hint);
      }
      btEl.appendChild(div);
    }
  }

  // Destreses
  const destEl = document.getElementById("destreses-display");
  destEl.innerHTML = "";
  if (state.character.destreses.size === 0) {
    destEl.innerHTML = `<div class="dim">Cap destresa (màx ${DESTRESA_MAX})</div>`;
  } else {
    for (const destId of state.character.destreses) {
      const def = DESTRESA_DEFS.find(d => d.id === destId);
      const name = def ? def.name : destId;
      const div = document.createElement("div");
      div.className = "skill-item destresa-item";
      div.textContent = `⭐ ${name}`;
      destEl.appendChild(div);
    }
    if (state.character.destreses.size < DESTRESA_MAX) {
      const note = document.createElement("div");
      note.className = "dim";
      note.textContent = `${state.character.destreses.size}/${DESTRESA_MAX} — en pots aprendre ${DESTRESA_MAX - state.character.destreses.size} més`;
      destEl.appendChild(note);
    }
  }
}

function renderActionsPanel() {
  // Last result
  const lrEl = document.getElementById("last-result");
  if (state.lastResult) {
    lrEl.innerHTML = `<div class="last-result-label">Últim resultat</div><div class="last-result-text">${state.lastResult}</div>`;
    lrEl.classList.remove("hidden");
  } else {
    lrEl.classList.add("hidden");
  }

  // Succession warning
  const warnEl = document.getElementById("succession-warning");
  const cyclesLeft = LIFE_EXPECTANCY - characterAge();
  const hasHeir = state.character.children.length > 0 || state.siblingPool.length > 0;
  if (!state.gameOver) {
    let warnText = '';
    if (cyclesLeft <= 6 && !hasHeir) {
      warnText = `⚠ Queden ${cyclesLeft} cicle${cyclesLeft === 1 ? '' : 's'} de vida. Cal tenir fills per assegurar la successió.`;
    }
    if (cyclesLeft <= 3 && state.material > 0) {
      const mWarn = `🧠 ${state.material} Provisions sense gastar — compra accions ara, no passen a la generació!`;
      warnText = warnText ? warnText + ' · ' + mWarn : `⚠ ${mWarn}`;
    }
    if (warnText) {
      warnEl.textContent = warnText;
      warnEl.classList.remove("hidden");
    } else {
      warnEl.classList.add("hidden");
    }
  } else {
    warnEl.classList.add("hidden");
  }

  // Discovery notification — zone discovery takes priority over branch tech hint
  const notifEl = document.getElementById("discovery-notification");
  if (state.pendingZoneDiscovery) {
    notifEl.textContent = `🗺️ Nova zona descoberta: ${state.pendingZoneDiscovery}! Ara apareix al teu mapa.`;
    notifEl.classList.remove("hidden");
  } else if (getEligibleSkills().length > 0) {
    notifEl.textContent = "Hi ha estrangers al poblat que expliquen tècniques noves.";
    notifEl.classList.remove("hidden");
  } else {
    notifEl.classList.add("hidden");
  }

  // Onboarding panel
  const onbEl = document.getElementById("onboarding-panel");
  if (state.cycle === 0 && !state.onboardingDismissed) {
    onbEl.classList.remove("hidden");
  } else {
    onbEl.classList.add("hidden");
  }

  renderUniversalTechs();
  renderTechStrip();
  renderZoneGrid();
  renderLog();
}

function renderUniversalTechs() {
  // Techs auto-discover via autoDiscoverUniversalTechs() — no player action needed.
  // Section stays hidden; the tech strip and log show discovery status.
  document.getElementById("universal-techs-section").classList.add("empty");
}

function renderTechStrip() {
  const el = document.getElementById("tech-status-strip");
  el.innerHTML = "";
  for (const tech of UNIVERSAL_TECHS) {
    const discovered = state.discoveredUniversalTechIds.has(tech.id);
    const available  = !discovered && state.cycle >= tech.cycle;
    const pill = document.createElement("div");
    pill.className = "ts-pill" + (discovered ? " ts-discovered" : available ? " ts-available" : " ts-pending");
    const cycleStr = !discovered ? ` <span class="ts-cycle">c${tech.cycle}</span>` : '';
    pill.innerHTML = `${tech.icon ? `<span>${tech.icon}</span>` : ''}<span class="ts-name">${tech.name}</span>${cycleStr}`;
    el.appendChild(pill);
  }
}

// --- Zone Grid (debug layout) ---

function buildLookupTables() {
  const purchasableActionIds = new Set();
  for (const skillId of state.character.unlockedSkillIds) {
    const bt = SKILL_DEFS.find(t => t.id === skillId);
    if (!bt) continue;
    for (const aid of bt.unlocks_action_ids) purchasableActionIds.add(aid);
  }
  const upgradedBaseActionIds = new Set();
  for (const a of ACTIONS) {
    if (a.is_upgrade && state.character.purchasedActionIds.has(a.id)) {
      upgradedBaseActionIds.add(a.upgrades_action_id);
    }
  }
  return { purchasableActionIds, upgradedBaseActionIds };
}

function buildUndiscoveredCard(zona) {
  const card = document.createElement("div");
  card.className = "zone-card zone-undiscovered";
  const header = document.createElement("div");
  header.className = "zone-header";
  header.innerHTML = `<span class="zone-name zone-undiscovered-name">🔒 ${zona}</span>`;
  const hint = document.createElement("div");
  hint.className = "zone-undiscovered-hint";

  const lockedHere = ACTIONS.filter(a =>
    a.zona === zona && !a.is_base && !a.is_discovery_action &&
    [...state.character.unlockedSkillIds].some(skillId => {
      const bt = SKILL_DEFS.find(t => t.id === skillId);
      return bt?.unlocks_action_ids.includes(a.id);
    })
  );
  const discoverAction = ACTIONS.find(a => a.unlocks_zone === zona);

  if (lockedHere.length > 0 && discoverAction) {
    hint.textContent = `Zona no explorada · ${lockedHere.length} acció${lockedHere.length > 1 ? 'ns' : ''} disponible${lockedHere.length > 1 ? 's' : ''} quan la descobreixis · Requereix: "${discoverAction.name}"`;
  } else {
    hint.textContent = "Zona no explorada";
  }

  card.appendChild(header);
  card.appendChild(hint);
  return card;
}

function renderZoneGrid() {
  const grid = document.getElementById("zone-grid");
  grid.innerHTML = "";
  const tables = buildLookupTables();
  for (const zona of ZONE_ORDER) {
    if (state.discoveredZoneIds.has(zona)) {
      grid.appendChild(buildZoneCard(zona, tables));
    } else {
      grid.appendChild(buildUndiscoveredCard(zona));
    }
  }
}

function buildZoneCard(zona, { purchasableActionIds, upgradedBaseActionIds }) {
  const hasEligibleSkills = getEligibleSkills().length > 0;

  const active = [], buy = [], other = [];

  const currentAge = characterAge();

  // Discovery action appears in whichever zone it declares
  if (hasEligibleSkills) {
    const disc = ACTIONS.find(a => a.is_discovery_action && a.zona === zona);
    if (disc) active.push({ action: disc, purchased: true, vis: "ACTIVE", isDiscovery: true });
  }

  for (const action of ACTIONS) {
    if (action.zona !== zona) continue;
    if (action.is_discovery_action) continue;
    if (action.minAge !== undefined && currentAge < action.minAge) continue;
    if (action.maxAge !== undefined && currentAge > action.maxAge) continue;
    if (!evaluateCharacterRequires(action)) continue;

    if (upgradedBaseActionIds.has(action.id)) continue; // replaced by upgrade

    if (action.is_upgrade) {
      if (!state.character.purchasedActionIds.has(action.upgrades_action_id)) continue;
      const purchased = state.character.purchasedActionIds.has(action.id);
      const vis = getActionVisibility(action);
      if (purchased) {
        active.push({ action, purchased, vis, isUpgrade: true });
      } else {
        buy.push({ action, purchased: false, vis, isUpgrade: true });
      }
      continue;
    }

    const purchased = state.character.purchasedActionIds.has(action.id);
    const vis = getActionVisibility(action);

    if (purchased) {
      if (vis === "HIDDEN") {
        other.push({ action, purchased, blocked: "inclination" });
      } else {
        active.push({ action, purchased, vis });
      }
    } else {
      if (purchasableActionIds.has(action.id)) {
        buy.push({ action, purchased: false, vis });
      } else {
        other.push({ action, purchased: false, blocked: "locked" });
      }
    }
  }

  // Build card
  const card = document.createElement("div");
  card.className = "zone-card";
  card.dataset.zona = zona;

  // Header
  const hdr = document.createElement("div");
  hdr.className = `zone-card-header zone-${zona.toLowerCase()}`;
  hdr.innerHTML =
    `<span class="zone-card-title">${zona}</span>` +
    `<span class="zone-card-summary">` +
    `<span class="zcs-active">${active.length}▶</span> ` +
    `<span class="zcs-buy">${buy.length}🧠</span> ` +
    `<span class="zcs-other">${other.length}🔒</span>` +
    `</span>`;
  card.appendChild(hdr);

  // Filter tabs
  const currentFilter = zoneFilters[zona] || 'active';
  const tabs = document.createElement("div");
  tabs.className = "zone-filter-tabs";
  for (const [fkey, flabel] of [
    ['active', `Actives (${active.length})`],
    ['buy',    `Aprendre (${buy.length})`],
    ['other',  `Bloq. (${other.length})`],
  ]) {
    const btn = document.createElement("button");
    btn.className = `zone-filter-btn${currentFilter === fkey ? ' active' : ''}`;
    btn.dataset.filter = fkey;
    btn.textContent = flabel;
    tabs.appendChild(btn);
  }
  card.appendChild(tabs);

  // Content
  const content = document.createElement("div");
  content.className = "zone-content";
  const items = { active, buy, other }[currentFilter] || active;

  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "dim zone-empty";
    empty.textContent = "Cap acció en aquesta categoria";
    content.appendChild(empty);
  } else {
    for (const item of items) {
      content.appendChild(
        currentFilter === 'other' ? buildBlockedRow(item) : buildZoneActionRow(item)
      );
    }
  }
  card.appendChild(content);
  return card;
}

function buildZoneActionRow({ action, purchased, vis, isUpgrade, isDiscovery }) {
  const row = document.createElement("div");
  row.className = `zone-action-row` +
    (vis === "FADED" ? " faded" : "") +
    (isUpgrade ? " upgrade" : "") +
    (isDiscovery ? " discovery" : "");
  row.dataset.actionId = action.id;

  // Name
  const nameEl = document.createElement("div");
  nameEl.className = "zar-name";
  nameEl.textContent = isUpgrade ? `↑ ${action.name}` : action.name;
  if (action.unlocks_zone && !state.discoveredZoneIds.has(action.unlocks_zone)) {
    const zoneHint = document.createElement("span");
    zoneHint.className = "zar-zone-hint";
    zoneHint.title = `Descobreix ${action.unlocks_zone}`;
    zoneHint.textContent = " 🗺️";
    nameEl.appendChild(zoneHint);
  }
  const negSideEffects = (action.side_effects || []).filter(se => se.delta < 0);
  if (negSideEffects.length > 0) {
    const risk = document.createElement("span");
    risk.className = "zar-risk";
    const riskRes = RESOURCE_DEFS.find(r => r.id === negSideEffects[0].resource);
    risk.textContent = ` ⚠${negSideEffects[0].delta}${riskRes ? riskRes.emoji : ''}`;
    nameEl.appendChild(risk);
  }
  row.appendChild(nameEl);

  if (!isDiscovery) {
    // Meta: cost → output · stat · inclination hint · destresa
    const outRes = action.output_resource || 'food';
    const resIcon = (RESOURCE_DEFS.find(r => r.id === outRes) || RESOURCE_DEFS[0]).emoji;
    const costStr = action.execute_cost > 0 ? `${action.execute_cost}🌾→` : '';
    const statStr = action.stat_key
      ? `${action.stat_key.charAt(0).toUpperCase() + action.stat_key.slice(1)} ${state.character.stats[action.stat_key].toFixed(1)}`
      : '';
    const inclHint = getInclinationHint(action);
    const metaEl = document.createElement("div");
    metaEl.className = "zar-meta";
    metaEl.textContent =
      `${costStr}+${action.output_min}–${action.output_max}${resIcon}` +
      (statStr ? ` · ${statStr}` : '') +
      (inclHint ? ` · ${inclHint}` : '');
    row.appendChild(metaEl);

    // Destresa progress — based on inclination proximity to conditions
    const destresaSrcId = action.destresa_id
      ?? (isUpgrade && action.upgrades_action_id
          ? ACTIONS.find(a => a.id === action.upgrades_action_id)?.destresa_id : null);
    if (destresaSrcId && purchased) {
      const def = DESTRESA_DEFS.find(d => d.id === destresaSrcId);
      const achieved = state.character.destreses.has(destresaSrcId);
      if (def && (achieved || state.character.destreses.size < DESTRESA_MAX)) {
        const destRow = document.createElement("div");
        destRow.className = "zar-destresa";
        if (achieved) {
          destRow.innerHTML = `<span class="zar-destresa-name">⭐ ${def.name}</span>`;
        } else {
          const pct = Math.min(100, ...def.conditions.map(c => {
            const val = state.character.inclination[c.axis] ?? 0;
            return c.min !== undefined ? (val / c.min * 100) : 100;
          })).toFixed(1);
          destRow.innerHTML =
            `<span class="zar-destresa-bar-track"><span class="zar-destresa-bar-fill" style="width:${pct}%"></span></span>` +
            `<span class="zar-destresa-count">${def.name}: ${pct}%</span>`;
        }
        row.appendChild(destRow);
      }
    }

    // Faded reason
    if (vis === "FADED" && action.inclination_requirements) {
      const issues = getInclinationIssues(action);
      if (issues.length) {
        const noteEl = document.createElement("div");
        noteEl.className = "zar-faded-note";
        noteEl.textContent = "Fora de rang: " + issues.join(", ");
        row.appendChild(noteEl);
      }
    }
  }

  // Button
  if (isDiscovery) {
    const eligible = getEligibleSkills();
    if (eligible.length === 1) {
      const btn = document.createElement("button");
      btn.className = "btn-discovery btn-small";
      btn.textContent = `Escoltar: ${eligible[0].name}`;
      btn.onclick = () => performDiscoveryAction(eligible[0].id);
      row.appendChild(btn);
    } else {
      const wrap = document.createElement("div");
      wrap.className = "discovery-choices";
      for (const bt of eligible) {
        const btn = document.createElement("button");
        btn.className = "btn-discovery btn-small";
        btn.textContent = skill.name;
        btn.onclick = () => performDiscoveryAction(skill.id);
        wrap.appendChild(btn);
      }
      row.appendChild(wrap);
    }
  } else if (purchased && vis !== "FADED") {
    const btn = document.createElement("button");
    btn.className = "btn-execute btn-small";
    btn.textContent = action.execute_cost > 0 ? `Executar (−${action.execute_cost}🌾)` : "Executar";
    btn.onclick = () => executeAction(action.id);
    row.appendChild(btn);
  } else if (!purchased) {
    const btn = document.createElement("button");
    btn.className = "btn-buy btn-small";
    btn.textContent = isUpgrade
      ? `Millorar (−${action.purchase_cost}🧠)`
      : `Aprendre (−${action.purchase_cost}🧠)`;
    btn.onclick = () => purchaseAction(action.id);
    row.appendChild(btn);
  }

  return row;
}

function buildBlockedRow({ action, purchased, blocked }) {
  const row = document.createElement("div");
  row.className = "zone-blocked-row";

  const nameEl = document.createElement("div");
  nameEl.className = "zbr-name";
  nameEl.textContent = `🔒 ${action.name}`;
  row.appendChild(nameEl);

  const infoEl = document.createElement("div");
  infoEl.className = "zbr-reason";

  if (blocked === "inclination" && purchased) {
    // Owned but hidden due to inclination
    const issues = getInclinationIssues(action);
    infoEl.textContent = "Ocult per inclinació: " + (issues.length ? issues.join(" · ") : "?");
  } else {
    // Locked behind branch tech
    const bt = SKILL_DEFS.find(b => b.unlocks_action_ids.includes(action.id));
    if (!bt) {
      infoEl.textContent = "Origen desconegut";
    } else if (bt.universal_prereq && !state.discoveredUniversalTechIds.has(bt.universal_prereq)) {
      const ut = UNIVERSAL_TECHS.find(t => t.id === bt.universal_prereq);
      infoEl.textContent = `Via: ${bt.name} → Requereix: ${ut ? ut.name : bt.universal_prereq} (Cicle ${ut ? ut.cycle : '?'}, ara: ${state.cycle})`;
    } else {
      // Universal met, inclination not
      const conds = bt.inclination_conditions?.conditions || [];
      const lines = conds.map(c => {
        const val = state.character.inclination[c.axis];
        if (c.min !== undefined && val < c.min) {
          return `${c.axis} ≥${c.min} (ara ${val.toFixed(2)}, falta +${(c.min - val).toFixed(2)})`;
        }
        if (c.max !== undefined && val > c.max) {
          return `${c.axis} ≤${c.max} (ara ${val.toFixed(2)}, excés +${(val - c.max).toFixed(2)})`;
        }
        return `${c.axis} ✓`;
      });
      infoEl.innerHTML = `Via: <strong>${bt.name}</strong><br>${lines.join('<br>')}`;
    }
  }
  row.appendChild(infoEl);
  return row;
}

function getInclinationIssues(action) {
  if (!action.inclination_requirements) return [];
  const issues = [];
  for (const [axis, range] of Object.entries(action.inclination_requirements)) {
    const val = state.character.inclination[axis];
    if (range.min !== undefined && val < range.min)
      issues.push(`${axis} < ${range.min} (${val.toFixed(2)})`);
    if (range.max !== undefined && val > range.max)
      issues.push(`${axis} > ${range.max} (${val.toFixed(2)})`);
  }
  return issues;
}

function renderLog() {
  const el = document.getElementById("action-log");
  el.innerHTML = "";
  if (state.log.length === 0) {
    el.innerHTML = '<div class="dim">Cap entrada</div>';
    return;
  }
  for (const entry of state.log) {
    const div = document.createElement("div");
    div.className = "log-entry";
    div.textContent = entry;
    el.appendChild(div);
  }
}

function renderModals() {
  // Event modal
  const eventModal = document.getElementById("event-modal");
  if (state.pendingEvent) {
    const ev = state.pendingEvent;
    document.getElementById("event-text").textContent = ev.text;
    const choicesEl = document.getElementById("event-choices");
    const dismissBtn = document.getElementById("btn-dismiss-event");

    if (ev.options) {
      dismissBtn.classList.add("hidden");
      choicesEl.innerHTML = "";
      choicesEl.classList.remove("hidden");
      ev.options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.className = "btn-choice";
        btn.textContent = opt.text;
        btn.onclick = () => resolveDiscoveryOption(i);
        choicesEl.appendChild(btn);
      });
      document.getElementById("event-effect").textContent = "";
    } else {
      dismissBtn.classList.remove("hidden");
      choicesEl.classList.add("hidden");
      const fx = ev.effects;
      const fxParts = [];
      if (fx && fx.food)   fxParts.push(`${fx.food >= 0 ? "+" : ""}${fx.food} Aliment`);
      if (fx && fx.health) fxParts.push(`${fx.health >= 0 ? "+" : ""}${fx.health} Salut`);
      document.getElementById("event-effect").textContent = fxParts.length ? `Efecte: ${fxParts.join(' · ')}` : "";
    }
    eventModal.classList.remove("hidden");
  } else {
    eventModal.classList.add("hidden");
  }

  // Succession modal
  const succModal = document.getElementById("succession-modal");
  if (state.pendingSuccession && !state.gameOver) {
    const s = state.pendingSuccession;
    document.getElementById("succ-gen").textContent = s.generation;
    document.getElementById("succ-cycles").textContent = s.cyclesLived;
    const topLabel = parseFloat(s.topAxisVal) >= 0 ? AXIS_LABELS[s.topAxis].right : AXIS_LABELS[s.topAxis].left;
    document.getElementById("succ-axis").textContent = `${topLabel} (${s.topAxisVal})`;

    const succList = document.getElementById("succ-successors");
    succList.innerHTML = "";
    for (const successor of s.successors) {
      const incl = successor.inheritedInclination ?? {};
      const dominantAxis = AXES.reduce((a, b) =>
        Math.abs(incl[a] ?? 0) > Math.abs(incl[b] ?? 0) ? a : b
      );
      const dominantVal = incl[dominantAxis] ?? 0;
      const axisLabel = dominantVal >= 0
        ? AXIS_LABELS[dominantAxis].right
        : AXIS_LABELS[dominantAxis].left;
      const phrase = Math.abs(dominantVal) < 0.1
        ? SUCCESSION_PHRASES.neutral
        : (SUCCESSION_PHRASES[dominantAxis]?.[dominantVal >= 0 ? 'pos' : 'neg'] ?? axisLabel);
      const sibTag = successor.is_sibling ? '<span class="succ-tag-sibling">Germà</span>' : '';
      const item = document.createElement("div");
      item.className = "succ-option" + (successor.is_sibling ? " succ-sibling" : "");
      item.innerHTML =
        `<div class="succ-option-info">
          <span class="succ-option-label">${successor.label}</span>${sibTag}
          <span class="succ-option-phrase">${phrase}</span>
          <span class="succ-option-axis">${axisLabel}</span>
        </div>
        <button class="btn-succ-choose" onclick="continueSuccession('${successor.id}')">Tria</button>`;
      succList.appendChild(item);
    }

    succModal.classList.remove("hidden");
  } else {
    succModal.classList.add("hidden");
  }

  // Game over modal
  const gameOverModal = document.getElementById("gameover-modal");
  if (state.gameOver) {
    const reasons = {
      era_complete: `L'era de la Prehistòria ha acabat. ${state.generation} generació${state.generation > 1 ? 's' : ''} de llinatge queden gravades a les roques.`,
      no_heir: "El personatge ha mort sense fills. El llinatge s'extingeix en aquesta generació.",
    };
    document.getElementById("gameover-text").textContent =
      reasons[state.gameOverReason] || reasons.era_complete;
    gameOverModal.classList.remove("hidden");
  } else {
    gameOverModal.classList.add("hidden");
  }
}

// --- Glossary ---
function showGlossary() {
  // Helpers
  function fmtConds(condObj) {
    if (!condObj || !condObj.conditions.length) return '—';
    return condObj.conditions.map(c => {
      const n = c.axis.charAt(0).toUpperCase() + c.axis.slice(1);
      if (c.min !== undefined && c.max !== undefined) return `${c.min} ≤ ${n} ≤ ${c.max}`;
      if (c.min !== undefined) return `${n} ≥ ${c.min}`;
      return `${n} ≤ ${c.max}`;
    }).join(condObj.operator === 'AND' ? ' · ' : ' o ');
  }

  function bdg(label, color) {
    const colors = {
      green:  'background:rgba(74,222,128,0.15);color:#4ade80;border:1px solid rgba(74,222,128,0.3)',
      yellow: 'background:rgba(245,166,35,0.15);color:#f5a623;border:1px solid rgba(245,166,35,0.3)',
      blue:   'background:rgba(96,165,250,0.15);color:#60a5fa;border:1px solid rgba(96,165,250,0.3)',
      orange: 'background:rgba(251,146,60,0.15);color:#fb923c;border:1px solid rgba(251,146,60,0.3)',
      grey:   'background:rgba(107,110,133,0.10);color:#6b6e85;border:1px solid rgba(107,110,133,0.2)',
    };
    return `<span class="glossary-badge" style="${colors[color] || colors.grey}">${label}</span>`;
  }

  function row(icon, name, desc, badge, dimmed = false) {
    return `<div class="glossary-item${dimmed ? ' pending' : ''}">
      <span class="glossary-icon">${icon}</span>
      <div class="glossary-info"><strong>${name}</strong><span>${desc}</span></div>
      ${badge}
    </div>`;
  }

  function sec(title, rows) {
    return `<div class="glossary-section">
      <div class="glossary-section-title">${title}</div>${rows.join('')}
    </div>`;
  }

  const activeBranches    = getActiveBranches();
  const eligibleSkills = getEligibleSkills();
  const pct               = Math.round(INCLINATION_INHERITANCE_RATE * 100);

  let html = '';

  // 1 — Recursos
  html += sec('Recursos', [
    ...RESOURCE_DEFS.map(res => {
      const val = state[res.id];
      const rateStr = res.rateType === 'aging' ? ` Ara: −${getAgingLoss(characterAge())}/torn.` : '';
      const valStr  = res.showMax ? ` Actual: ${val}/${res.max}.` : ` Actual: ${val}.`;
      return row(res.emoji, res.label, res.glossaryDesc + rateStr + valStr, bdg('Actiu', 'green'));
    }),
    row('🦌', 'Pells (Era 1 — proposta)', 'Generat per caça i trampatge. Gastat en cosit i intercanvi. Decisió de disseny pendent (C3-03).', bdg('Pendent', 'grey'), true),
  ]);

  // 2 — Inclinació
  html += sec('Inclinació (4 eixos, -1 a +1)', [
    row('', 'Com funciona', `Una acció és ACTIVA si la inclinació cau dins del seu rang · FADED (visible però no executable) si sobrepassa el llindar en ≤${FADE_MARGIN} · OCULTA si el supera en >${FADE_MARGIN}. Les accions comprades mai es perden: es reactiven si la inclinació torna.`, bdg('Actiu', 'green')),
    ...AXES.map(axis => {
      const labels = AXIS_LABELS[axis];
      const val    = state.character.inclination[axis];
      const valStr = val.toFixed(2);
      const color  = Math.abs(val) >= 0.3 ? (val > 0 ? 'green' : 'orange') : 'grey';
      return row('', `${axis.charAt(0).toUpperCase() + axis.slice(1)}`,
        `${labels.left} (−1) ↔ ${labels.right} (+1). Valors possibles: −1 · −0.5 · 0 · +0.5 · +1 (5 posicions). Actual: ${valStr}.`,
        bdg(valStr, color));
    }),
  ]);

  // 3 — Branques
  html += sec('Branques (Era 1 — 4 definides)', BRANCHES.map(b => {
    const isActive = activeBranches.some(ab => ab.id === b.id);
    return row('', b.name,
      `Condicions: ${fmtConds(b.conditions)}.`,
      isActive ? bdg('Activa', 'green') : bdg('Inactiva', 'grey'), !isActive);
  }));

  // 4 — Tecnologies Universals
  html += sec(`Tecnologies Universals (${state.discoveredUniversalTechIds.size}/${UNIVERSAL_TECHS.length} descobertes)`,
    UNIVERSAL_TECHS.map(ut => {
      const discovered = state.discoveredUniversalTechIds.has(ut.id);
      const effectStr  = ut.effect ? ` Efecte: ${ut.effect.desc}.` : ' Sense efecte directe.';
      return row(ut.icon || '🔬', ut.name,
        `${ut.description}${effectStr}`,
        discovered ? bdg(`✓ Descoberta · c${ut.cycle}`, 'green') : bdg(`Cicle ${ut.cycle}`, 'grey'),
        !discovered);
    })
  );

  // 5 — Habilitats
  const unlockedCount = state.character.unlockedSkillIds.size;
  html += sec(`Habilitats (${unlockedCount}/${SKILL_DEFS.length} desblocades)`,
    SKILL_DEFS.map(bt => {
      const unlocked  = state.character.unlockedSkillIds.has(skill.id);
      const eligible  = eligibleSkills.some(e => e.id === skill.id);
      const prereqMet = !skill.universal_prereq || state.discoveredUniversalTechIds.has(skill.universal_prereq);
      const prereqTech = skill.universal_prereq ? UNIVERSAL_TECHS.find(t => t.id === skill.universal_prereq) : null;
      const prereqName = prereqTech ? prereqTech.name : (skill.universal_prereq || '—');

      let badge;
      if (unlocked)       badge = bdg('✓ Desblocada', 'green');
      else if (eligible)  badge = bdg('Elegible — descobrir!', 'yellow');
      else if (prereqMet) badge = bdg('Inclinació insuficient', 'orange');
      else                badge = bdg(`Espera: ${prereqName}`, 'grey');

      const dimmed = !unlocked && !eligible;
      return row('', skill.name,
        `Prereq: ${prereqName}. Condicions: ${fmtConds(skill.inclination_conditions)}.`,
        badge, dimmed);
    })
  );

  // 6 — Zones
  html += sec(`Zones (${state.discoveredZoneIds.size}/${ZONE_ORDER.length} descobertes)`,
    ZONE_DEFS.map(z => {
      const disc = state.discoveredZoneIds.has(z.id);
      return row('', z.label, z.description,
        disc ? bdg('Descoberta', 'green') : bdg('No descoberta', 'grey'), !disc);
    })
  );

  // 7 — Atributs
  html += sec('Atributs del Personatge', STAT_DEFS.map(s => {
    const val = state.character.stats[s.id].toFixed(2);
    return row('', s.label,
      `${s.description} Rang: ${STAT_STARTING_VALUE.toFixed(1)}–${STAT_MAX.toFixed(1)}. Hereta al ${pct}%. Actual: ${val}.`,
      bdg(val, 'blue'));
  }));

  // 8 — Destreses
  const destresesNames = [...state.character.destreses].map(destId => {
    const def = DESTRESA_DEFS.find(d => d.id === destId);
    return def ? def.name : destId;
  });
  const destresesDesc = (destresesNames.length > 0 ? `Actuals: ${destresesNames.join(', ')}. ` : 'Cap destresa encara. ') +
    `Es descobreixen quan la inclinació compleix les condicions de cada destresa. Màxim ${DESTRESA_MAX}. Heretades 100%.`;
  html += sec('Destreses', [
    row('⭐', `Destreses (${state.character.destreses.size}/${DESTRESA_MAX})`, destresesDesc,
      bdg(`${state.character.destreses.size}/${DESTRESA_MAX}`, state.character.destreses.size > 0 ? 'green' : 'grey')),
  ]);

  // 9 — Llinatge i Successió
  const childLabels  = state.character.children.map(c => c.label).join(', ') || 'Cap fill nascut';
  html += sec('Llinatge i Successió', [
    row('', `Fills (${state.character.children.length}/${MAX_CHILDREN})`,
      `${childLabels}. Heretaran inclinació al ${pct}%, atributs al ${pct}%, habilitats 100%, destreses 100%.`,
      bdg(`${state.character.children.length}/${MAX_CHILDREN}`, state.character.children.length > 0 ? 'green' : 'grey')),
    row('', `Germans disponibles (${state.siblingPool.length})`,
      state.siblingPool.length > 0
        ? `Fills no escollits de generacions anteriors: ${state.siblingPool.map(s => s.label).join(', ')}.`
        : 'Cap germà disponible. Si el personatge mor sense fills, serà game over.',
      bdg(`${state.siblingPool.length}`, state.siblingPool.length > 0 ? 'yellow' : 'grey'),
      state.siblingPool.length === 0),
    row('', 'Crònica del Llinatge', 'Narració generada automàticament a partir de les decisions del jugador. Exportable al final de l\'era.', bdg('Pendent', 'grey'), true),
  ]);

  document.getElementById("glossary-content").innerHTML = html;
  document.getElementById("glossary-modal").classList.remove("hidden");
}

// --- Boot ---
document.addEventListener("DOMContentLoaded", () => {
  // Wire modal buttons
  document.getElementById("btn-dismiss-event").onclick = dismissEvent;
  document.getElementById("btn-restart").onclick = restartGame;
  document.getElementById("btn-glossary").onclick = showGlossary;
  document.getElementById("btn-close-glossary").onclick = () =>
    document.getElementById("glossary-modal").classList.add("hidden");

  // Zone grid filter — event delegation (survives re-renders)
  const zoneGridEl = document.getElementById("zone-grid");
  zoneGridEl.addEventListener("click", e => {
    const btn = e.target.closest(".zone-filter-btn");
    if (!btn) return;
    const card = btn.closest(".zone-card");
    if (!card) return;
    zoneFilters[card.dataset.zona] = btn.dataset.filter;
    renderZoneGrid();
  });

  // Inclination dot editor — debug only; disabled in normal play
  if (DEBUG_MODE) {
    document.getElementById("inclination-rows").addEventListener("click", e => {
      const dot = e.target.closest(".incl-dot[data-idx]");
      if (!dot) return;
      const row = dot.closest(".incl-row[data-axis]");
      if (!row) return;
      state.character.inclination[row.dataset.axis] = INCL_DOT_VALUES[parseInt(dot.dataset.idx, 10)];
      render();
    });
  }

  // Inclination delta tooltip — show on hover over action rows
  const tooltipEl = document.getElementById("incl-tooltip");
  zoneGridEl.addEventListener("mouseover", e => {
    const row = e.target.closest("[data-action-id]");
    if (!row) { tooltipEl.classList.add("hidden"); return; }
    const action = ACTIONS.find(a => a.id === row.dataset.actionId);
    if (!action || !action.inclination_deltas) { tooltipEl.classList.add("hidden"); return; }
    const lines = Object.entries(action.inclination_deltas)
      .filter(([, d]) => Math.abs(d) >= 0.001)
      .map(([axis, d]) => {
        const labels = AXIS_LABELS[axis];
        return d > 0 ? `+${d.toFixed(3)} ${labels.right}` : `${d.toFixed(3)} ${labels.left}`;
      });
    if (!lines.length) { tooltipEl.classList.add("hidden"); return; }
    tooltipEl.textContent = lines.join("  ·  ");
    tooltipEl.classList.remove("hidden");
    tooltipEl.style.left = (e.clientX + 14) + "px";
    tooltipEl.style.top  = (e.clientY - 32) + "px";
  });
  zoneGridEl.addEventListener("mousemove", e => {
    if (!tooltipEl.classList.contains("hidden")) {
      tooltipEl.style.left = (e.clientX + 14) + "px";
      tooltipEl.style.top  = (e.clientY - 32) + "px";
    }
  });
  zoneGridEl.addEventListener("mouseleave", () => tooltipEl.classList.add("hidden"));

  initState();
  render();
});
