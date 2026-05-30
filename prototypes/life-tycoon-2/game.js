// PROTOTYPE - NOT FOR PRODUCTION
// Question: Does inclination-driven action visibility + branch tech discovery + succession feel engaging?
// Date: 2026-05-26

'use strict';

// --- Logic Constants (mechanics parameters — design data is in data.js) ---
const INERTIA_FACTOR          = 2.0;
const BRANCH_INHERITANCE_RATE = 0.65;
const FADE_MARGIN             = 0.05;
const DEBUG_MODE              = false;
const EVENT_TRIGGER_CHANCE    = 0.6;
const INCL_DOT_VALUES         = [-1.0, -0.5, 0.0, 0.5, 1.0];

// --- Derived Lookups (from data.js defs) ---
const AXES        = AXIS_DEFS.map(a => a.id);
const AXIS_LABELS = Object.fromEntries(AXIS_DEFS.map(a => [a.id, { left: a.left, right: a.right }]));
const ZONE_ORDER  = ZONE_DEFS.map(z => z.id);

// Returns health lost this cycle due to aging — accelerates exponentially past AGING_THRESHOLD
function getAgingLoss(cycle) {
  const excess = Math.max(0, cycle - AGING_THRESHOLD);
  return AGING_BASE + Math.floor(Math.pow(excess, AGING_POWER) * AGING_SCALE);
}

// --- Game State ---
let state = null;
let zoneFilters = Object.fromEntries(ZONE_DEFS.map(z => [z.id, 'active']));

function createCharacter(inheritedInclination, inheritedPurchasedIds, inheritedBranchTechIds, inheritedStats, inheritedDestreses) {
  return {
    inclination: { ...inheritedInclination },
    purchasedActionIds: new Set(inheritedPurchasedIds),
    unlockedBranchTechIds: new Set(inheritedBranchTechIds),
    stats: inheritedStats ? { ...inheritedStats } : Object.fromEntries(STAT_DEFS.map(s => [s.id, STAT_STARTING_VALUE])),
    destreses: new Set(inheritedDestreses),
    actionUseCounts: {},
    firedSingleUseEventIds: new Set(),
    hasPartner: false,
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

  if (tech.effect && tech.effect.healthBonus) {
    state.health = Math.min(HEALTH_MAX, state.health + tech.effect.healthBonus);
    addLog(`✨ ${tech.effect.desc}`);
  }

  render();
}

// Auto-applies any universal techs whose cycle has been reached (no render — callers handle it).
function autoDiscoverUniversalTechs() {
  for (const tech of getDiscoverableTechs()) {
    state.discoveredUniversalTechIds.add(tech.id);
    addLog(`${tech.icon} Descoberta: ${tech.name}`);
    if (tech.effect && tech.effect.healthBonus) {
      state.health = Math.min(HEALTH_MAX, state.health + tech.effect.healthBonus);
      addLog(`✨ ${tech.effect.desc}`);
    }
  }
}

// --- Branch Tech Discovery ---

function getEligibleBranchTechs() {
  return BRANCH_TECHS.filter(bt =>
    !bt.is_hidden &&
    state.discoveredUniversalTechIds.has(bt.universal_prereq) &&
    !state.character.unlockedBranchTechIds.has(bt.id) &&
    evaluateConditions(bt.inclination_conditions)
  );
}

function getBranchTechMaturity(bt) {
  let score = 0;
  for (const cond of bt.inclination_conditions.conditions) {
    const val = state.character.inclination[cond.axis];
    if (cond.min !== undefined) score += Math.max(0, val - cond.min);
    if (cond.max !== undefined) score += Math.max(0, cond.max - val);
  }
  return score;
}

function unlockBranchTech(bt) {
  if (state.character.unlockedBranchTechIds.has(bt.id)) return;
  state.character.unlockedBranchTechIds.add(bt.id);
  addLog(`Nova habilitat: ${bt.name}`);
  const pe = bt.passive_effect;
  if (pe) {
    if (pe.type === 'one_time_health')    state.health    = Math.min(HEALTH_MAX, state.health + pe.amount);
    if (pe.type === 'one_time_materials') state.materials += pe.amount;
    if (pe.type === 'unlock_zone')        state.discoveredZoneIds.add(pe.zone_id);
    if (pe.desc) addLog(`Efecte passiu: ${pe.desc}`);
  }
  const newActions = ACTIONS.filter(a => bt.unlocks_action_ids.includes(a.id));
  state.lastResult = newActions.length > 0
    ? `Habilitat nova: ${bt.name} · Pots aprendre: ${newActions.map(a => a.name).join(', ')}`
    : `Habilitat nova apresa: ${bt.name}`;
}

function performDiscoveryAction(chosenBtId) {
  const eligible = getEligibleBranchTechs();
  if (eligible.length === 0) {
    addLog("No hi ha tècniques noves a descobrir ara.");
    render();
    return;
  }
  const chosen = chosenBtId
    ? (eligible.find(bt => bt.id === chosenBtId) ?? eligible[0])
    : eligible.reduce((a, b) => getBranchTechMaturity(a) >= getBranchTechMaturity(b) ? a : b);
  unlockBranchTech(chosen);
  state.cycle++;
  autoDiscoverUniversalTechs();
  state.food   = Math.max(0, state.food   - FOOD_UPKEEP);
  state.health = Math.max(0, state.health - getAgingLoss(state.cycle));

  if (state.cycle >= LIFE_EXPECTANCY || state.health <= 0) {
    if (!state.pendingEvent) triggerSuccession();
  }
  render();
}

// Filter a pool to only eligible events (excludes discovery events whose conditions aren't met)
function getEligiblePoolEvents(pool) {
  return pool.filter(ev => {
    if (ev.is_single_use && state.character.firedSingleUseEventIds.has(ev.id)) return false;
    if (!ev.is_discovery_event) return true;
    const btId = ev.discovery_branch_tech_id;
    if (state.character.unlockedBranchTechIds.has(btId)) return false;
    const bt = BRANCH_TECHS.find(t => t.id === btId);
    if (!bt) return false;
    if (!state.discoveredUniversalTechIds.has(bt.universal_prereq)) return false;
    return evaluateConditions(bt.inclination_conditions);
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
  if (state.materials < action.purchase_cost) {
    addLog(`Provisions insuficients per aprendre ${action.name}.`);
    render();
    return;
  }

  state.materials -= action.purchase_cost;
  state.character.purchasedActionIds.add(actionId);

  // Transfer destresa progress from base action when purchasing upgrade
  if (action.is_upgrade && action.upgrades_action_id) {
    const baseCount = state.character.actionUseCounts[action.upgrades_action_id] || 0;
    if (baseCount > 0) state.character.actionUseCounts[actionId] = baseCount;
  }

  addLog(`Après: ${action.name} (−${action.purchase_cost} 🧠)`);
  render();
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

  if (actionId === 'act_tenir_fills' && (!state.character.hasPartner || state.character.children.length >= MAX_CHILDREN)) {
    render();
    return;
  }

  state.food -= action.execute_cost;

  // Track use count for destresa discovery
  state.character.actionUseCounts[actionId] = (state.character.actionUseCounts[actionId] || 0) + 1;

  // Roll output: stat multiplier + destresa flat bonus
  const destresaBonus = (action.destresa_id && state.character.destreses.has(action.destresa_id))
    ? DESTRESA_BONUS : 0;
  const outputMinBonus = [...state.character.unlockedBranchTechIds].reduce((sum, btId) => {
    const bt = BRANCH_TECHS.find(t => t.id === btId);
    return (bt?.passive_effect?.type === 'action_output_bonus' && bt.passive_effect.action_id === actionId)
      ? sum + bt.passive_effect.output_min_bonus : sum;
  }, 0);
  const output = Math.round(randInt(action.output_min + outputMinBonus, action.output_max) * getStatMultiplier(action)) + destresaBonus;
  const outRes = action.output_resource || 'food';
  if (outRes === 'eines') {
    state.materials += output;
  } else if (outRes === 'health') {
    state.health = Math.min(HEALTH_MAX, state.health + output);
  } else {
    state.food = Math.min(FOOD_MAX, state.food + output);
  }

  // Side-effect health delta (risky / restorative actions)
  if (action.health_delta) {
    state.health = Math.max(0, Math.min(HEALTH_MAX, state.health + action.health_delta));
  }

  // Apply inclination deltas
  applyInclinationDeltas(action.inclination_deltas);

  // Grow the relevant stat
  if (action.stat_key && action.stat_gain) {
    state.character.stats[action.stat_key] = Math.min(STAT_MAX,
      state.character.stats[action.stat_key] + action.stat_gain);
  }

  // Check destresa discovery
  if (action.destresa_id && !state.character.destreses.has(action.destresa_id)
      && state.character.destreses.size < DESTRESA_MAX) {
    const threshold = action.destresa_threshold || DESTRESA_THRESHOLD;
    if (state.character.actionUseCounts[actionId] >= threshold) {
      state.character.destreses.add(action.destresa_id);
      addLog(`⭐ Destresa: ${action.destresa_name}`);
      state.lastResult = `Has après la destresa "${action.destresa_name}" per experiència acumulada.`;
    }
  }
  // For upgrades: continue counting toward the base action's destresa
  if (action.is_upgrade && action.upgrades_action_id && state.character.destreses.size < DESTRESA_MAX) {
    const baseAction = ACTIONS.find(a => a.id === action.upgrades_action_id);
    if (baseAction?.destresa_id && !state.character.destreses.has(baseAction.destresa_id)) {
      const threshold = baseAction.destresa_threshold || DESTRESA_THRESHOLD;
      if (state.character.actionUseCounts[actionId] >= threshold) {
        state.character.destreses.add(baseAction.destresa_id);
        addLog(`⭐ Destresa: ${baseAction.destresa_name}`);
        state.lastResult = `Has après la destresa "${baseAction.destresa_name}" per experiència acumulada.`;
      }
    }
  }

  // Advance cycle
  state.cycle++;
  autoDiscoverUniversalTechs();

  const resLabel = outRes === 'eines' ? 'Provisions' : outRes === 'health' ? 'Salut' : 'Aliment';
  if (output > 0) addLog(`[${state.cycle}] ${action.name}: +${output} ${resLabel}`);
  if (output > 0) state.lastResult = `Cicle ${state.cycle} — ${action.name}: +${output} ${resLabel}`;

  if (action.unlocks_zone && !state.discoveredZoneIds.has(action.unlocks_zone)) {
    state.discoveredZoneIds.add(action.unlocks_zone);
    addLog(`Nova zona descoberta: ${action.unlocks_zone}`);
    state.pendingZoneDiscovery = action.unlocks_zone;
    state.lastResult = null;
  }

  // Special one-time family actions
  if (actionId === 'act_cercar_parella' && !state.character.hasPartner) {
    state.character.hasPartner = true;
    state.lastResult = `Has trobat parella. Ara podeu tenir fills.`;
    addLog(`Parella trobada.`);
  }
  if (actionId === 'act_tenir_fills' && state.character.hasPartner && state.character.children.length < MAX_CHILDREN) {
    const child = { id: `child_${state.generation}_${state.cycle}`, label: `Fill (cicle ${state.cycle})` };
    state.character.children.push(child);
    const n = state.character.children.length;
    state.lastResult = n === 1
      ? `Primer fill nascut. La successió és assegurada.`
      : `${n}è fill nascut. Podreu triar successor.`;
    addLog(`Fill nascut (${n}/${MAX_CHILDREN}).`);
  }

  // Upkeep (food + health lost to survival and aging)
  const agingLoss = getAgingLoss(state.cycle);
  state.food   = Math.max(0, state.food   - FOOD_UPKEEP);
  state.health = Math.max(0, state.health - agingLoss);
  if (state.food   === 0) addLog(`⚠ Provisions crítiques.`);
  if (state.health === 0) addLog(`💀 Salut crítica.`);
  if (state.cycle === AGING_THRESHOLD + 1) addLog(`L'envelliment s'accelera.`);

  // Trigger event — only fires EVENT_TRIGGER_CHANCE of the time
  if (action.event_pool_id && EVENT_POOLS[action.event_pool_id] && Math.random() < EVENT_TRIGGER_CHANCE) {
    const pool = getEligiblePoolEvents(EVENT_POOLS[action.event_pool_id]);
    if (pool.length > 0) {
      state.pendingEvent = pool[Math.floor(Math.random() * pool.length)];
    }
  }

  // Check succession: end of life OR health depleted
  if (state.cycle >= LIFE_EXPECTANCY || state.health <= 0) {
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
  if (state.cycle >= LIFE_EXPECTANCY || state.health <= 0) triggerSuccession();
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

  if (opt.discovers && ev.discovery_branch_tech_id) {
    const bt = BRANCH_TECHS.find(t => t.id === ev.discovery_branch_tech_id);
    if (bt) unlockBranchTech(bt);
  }

  if (ev.is_single_use) state.character.firedSingleUseEventIds.add(ev.id);
  state.pendingEvent = null;
  if (state.cycle >= LIFE_EXPECTANCY || state.health <= 0) triggerSuccession();
  render();
}

function triggerSuccession() {
  if (state.generation >= MAX_GENERATIONS) {
    state.gameOver = true;
    state.gameOverReason = 'max_generations';
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
    AXES.map(a => [a, state.character.inclination[a] * BRANCH_INHERITANCE_RATE])
  );
  const parentStats = state.character.stats;
  const inheritedStats = Object.fromEntries(
    STAT_DEFS.map(s => [s.id, parentStats[s.id] * BRANCH_INHERITANCE_RATE + STAT_STARTING_VALUE * (1 - BRANCH_INHERITANCE_RATE)])
  );
  const inheritedPurchased    = new Set(state.character.purchasedActionIds);
  const inheritedBranchTechs  = new Set(state.character.unlockedBranchTechIds);
  const inheritedDestreses    = new Set(state.character.destreses);

  const childSuccessors = children.map(c => ({
    ...c,
    is_sibling: false,
    inheritedInclination,
    inheritedStats,
    inheritedPurchased,
    inheritedBranchTechs,
    inheritedDestreses,
  }));

  const siblingSuccessors = siblings.map(s => ({ ...s, is_sibling: true }));

  state.pendingSuccession = {
    generation: state.generation,
    cyclesLived: state.cycle,
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
  // Remove chosen sibling from pool; keep remaining siblings + add unchosen children
  state.siblingPool = [
    ...unchosenChildren,
    ...state.siblingPool.filter(sib => sib.id !== successorId),
  ];

  state.pendingSuccession = null;
  for (const res of RESOURCE_DEFS) state[res.id] = res.startVal;
  state.generation++;
  state.cycle = 0;
  state.character = createCharacter(
    chosen.inheritedInclination,
    chosen.inheritedPurchased,
    chosen.inheritedBranchTechs,
    chosen.inheritedStats,
    chosen.inheritedDestreses
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
  document.getElementById("cycle-counter").textContent = `Cicle ${state.cycle}`;
  document.getElementById("gen-counter").textContent = `Gen ${state.generation}/${MAX_GENERATIONS}`;

  const vitalsEl    = document.getElementById("top-vitals");
  const resourcesEl = document.getElementById("top-resources");
  vitalsEl.innerHTML    = "";
  resourcesEl.innerHTML = "";

  const agingNow = getAgingLoss(state.cycle);
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
    <span class="family-badge ${state.character.hasPartner ? 'achieved' : ''}">Parella</span>
    <span class="family-badge ${state.character.children.length > 0 ? 'achieved' : ''}">Fills (${state.character.children.length}/${MAX_CHILDREN})</span>
    ${state.siblingPool.length > 0 ? `<span class="family-badge achieved" style="background:rgba(245,166,35,0.15);border-color:rgba(245,166,35,0.3)">Germans (${state.siblingPool.length})</span>` : ''}
  `;
  if (!state.character.hasPartner && !state.gameOver) {
    const hintEl = document.createElement("div");
    hintEl.className = "dim incl-hint";
    hintEl.textContent = `Busca parella i tingues fills abans del cicle ${LIFE_EXPECTANCY}`;
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
  if (state.character.unlockedBranchTechIds.size === 0) {
    btEl.innerHTML = '<div class="dim">Cap habilitat desblocada</div>';
  } else {
    for (const btId of state.character.unlockedBranchTechIds) {
      const bt = BRANCH_TECHS.find(t => t.id === btId);
      if (!bt) continue;
      const div = document.createElement("div");
      div.className = "skill-item";
      div.textContent = bt.name;
      // S2-03: warn if all actions from this tech are in undiscovered zones
      const btActions = ACTIONS.filter(a => bt.unlocks_action_ids.includes(a.id));
      const allLocked = btActions.length > 0 && btActions.every(a => !state.discoveredZoneIds.has(a.zona));
      if (allLocked) {
        const hint = document.createElement("span");
        hint.className = "skill-zone-hint";
        hint.title = `Zona necessària: ${btActions[0].zona}`;
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
      const srcAction = ACTIONS.find(a => a.destresa_id === destId);
      const name = srcAction ? srcAction.destresa_name : destId;
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
  const cyclesLeft = LIFE_EXPECTANCY - state.cycle;
  const hasHeir = state.character.children.length > 0 || state.siblingPool.length > 0;
  if (!state.gameOver) {
    let warnText = '';
    if (cyclesLeft <= 6 && !hasHeir) {
      warnText = `⚠ Queden ${cyclesLeft} cicle${cyclesLeft === 1 ? '' : 's'}. Cal tenir fills per assegurar la successió.`;
    }
    if (cyclesLeft <= 3 && state.materials > 0) {
      const mWarn = `🧠 ${state.materials} Provisions sense gastar — compra accions ara, no passen a la generació!`;
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
  } else if (getEligibleBranchTechs().length > 0) {
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
  for (const btId of state.character.unlockedBranchTechIds) {
    const bt = BRANCH_TECHS.find(t => t.id === btId);
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
  hint.textContent = "Zona no explorada";
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
  const hasEligibleBranchTechs = getEligibleBranchTechs().length > 0;

  const active = [], buy = [], other = [];

  // Discovery action appears in Campament active tab
  if (zona === 'Campament' && hasEligibleBranchTechs) {
    const disc = ACTIONS.find(a => a.is_discovery_action);
    if (disc) active.push({ action: disc, purchased: true, vis: "ACTIVE", isDiscovery: true });
  }

  for (const action of ACTIONS) {
    if (action.zona !== zona) continue;
    if (action.is_discovery_action) continue;
    if (action.id === 'act_cercar_parella' && state.character.hasPartner) continue;
    if (action.id === 'act_tenir_fills' && (!state.character.hasPartner || state.character.children.length >= MAX_CHILDREN)) continue;

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
  if (action.health_delta && action.health_delta < 0) {
    const risk = document.createElement("span");
    risk.className = "zar-risk";
    risk.textContent = ` ⚠${action.health_delta}❤️`;
    nameEl.appendChild(risk);
  }
  row.appendChild(nameEl);

  if (!isDiscovery) {
    // Meta: cost → output · stat · inclination hint · destresa
    const outRes = action.output_resource || 'food';
    const resIcon = outRes === 'eines' ? '🧠' : outRes === 'health' ? '❤️' : '🌾';
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

    // Destresa progress — also for upgrades that carry base action's destresa
    const destresaSrc = action.destresa_id ? action
      : (isUpgrade && action.upgrades_action_id
          ? ACTIONS.find(a => a.id === action.upgrades_action_id) : null);
    if (destresaSrc?.destresa_id && purchased) {
      const count = state.character.actionUseCounts[action.id] || 0;
      const thr = destresaSrc.destresa_threshold || DESTRESA_THRESHOLD;
      const achieved = state.character.destreses.has(destresaSrc.destresa_id);
      if (achieved || state.character.destreses.size < DESTRESA_MAX) {
        const destRow = document.createElement("div");
        destRow.className = "zar-destresa";
        if (achieved) {
          destRow.innerHTML = `<span class="zar-destresa-name">⭐ ${destresaSrc.destresa_name}</span>`;
        } else {
          const pct = Math.min(100, count / thr * 100).toFixed(1);
          destRow.innerHTML =
            `<span class="zar-destresa-bar-track"><span class="zar-destresa-bar-fill" style="width:${pct}%"></span></span>` +
            `<span class="zar-destresa-count">${count}/${thr}</span>`;
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
    const eligible = getEligibleBranchTechs();
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
        btn.textContent = bt.name;
        btn.onclick = () => performDiscoveryAction(bt.id);
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
    const bt = BRANCH_TECHS.find(b => b.unlocks_action_ids.includes(action.id));
    if (!bt) {
      infoEl.textContent = "Origen desconegut";
    } else if (!state.discoveredUniversalTechIds.has(bt.universal_prereq)) {
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
      const sibTag = successor.is_sibling ? '<span class="succ-tag-sibling">Germà</span>' : '';
      const item = document.createElement("div");
      item.className = "succ-option" + (successor.is_sibling ? " succ-sibling" : "");
      item.innerHTML =
        `<div class="succ-option-info">
          <span class="succ-option-label">${successor.label}</span>${sibTag}
          <span class="succ-option-incl">${axisLabel}: ${Math.abs(dominantVal).toFixed(2)}</span>
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
      max_generations: "Cinc generacions han passat. El coneixement del teu llinatge queda gravat a les roques.",
      no_heir: "El personatge ha mort sense fills. El llinatge s'extingeix en aquesta generació.",
    };
    document.getElementById("gameover-text").textContent =
      reasons[state.gameOverReason] || reasons.max_generations;
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
  const eligibleBranchTechs = getEligibleBranchTechs();
  const pct               = Math.round(BRANCH_INHERITANCE_RATE * 100);

  let html = '';

  // 1 — Recursos
  html += sec('Recursos', [
    ...RESOURCE_DEFS.map(res => {
      const val = state[res.id];
      const rateStr = res.rateType === 'aging' ? ` Ara: −${getAgingLoss(state.cycle)}/torn.` : '';
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

  // 5 — Tecnologies de Branca (Habilitats)
  const unlockedCount = state.character.unlockedBranchTechIds.size;
  html += sec(`Tecnologies de Branca — Habilitats (${unlockedCount}/${BRANCH_TECHS.length} desblocades)`,
    BRANCH_TECHS.map(bt => {
      const unlocked  = state.character.unlockedBranchTechIds.has(bt.id);
      const eligible  = eligibleBranchTechs.some(e => e.id === bt.id);
      const prereqMet = state.discoveredUniversalTechIds.has(bt.universal_prereq);
      const prereqTech = UNIVERSAL_TECHS.find(t => t.id === bt.universal_prereq);
      const prereqName = prereqTech ? prereqTech.name : bt.universal_prereq;

      let badge;
      if (unlocked)       badge = bdg('✓ Desblocada', 'green');
      else if (eligible)  badge = bdg('Elegible — descobrir!', 'yellow');
      else if (prereqMet) badge = bdg('Inclinació insuficient', 'orange');
      else                badge = bdg(`Espera: ${prereqName}`, 'grey');

      const dimmed = !unlocked && !eligible;
      return row('', bt.name,
        `Prereq: ${prereqName}. Condicions: ${fmtConds(bt.inclination_conditions)}.`,
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
    const srcAction = ACTIONS.find(a => a.destresa_id === destId);
    return srcAction ? srcAction.destresa_name : destId;
  });
  const destresesDesc = (destresesNames.length > 0 ? `Actuals: ${destresesNames.join(', ')}. ` : 'Cap destresa encara. ') +
    `Llindar: ${DESTRESA_THRESHOLD} usos d'una acció. Màxim ${DESTRESA_MAX}. Heretades 100%.`;
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
