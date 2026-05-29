// PROTOTYPE - NOT FOR PRODUCTION
// Question: Does inclination-driven action visibility + branch tech discovery + succession feel engaging?
// Date: 2026-05-26

'use strict';

// --- Constants ---
const INERTIA_FACTOR = 2.0;
const BRANCH_INHERITANCE_RATE = 0.65;
const FADE_MARGIN = 0.10;
const LIFE_EXPECTANCY = 14; // cycles before succession
const MAX_GENERATIONS = 5;
const STARTING_FOOD = 15;

const AXES = ["impuls", "intel·lecte", "espiritualitat", "sociabilitat"];
const FOOD_UPKEEP    = 1;  // food consumed per cycle
const HEALTH_UPKEEP  = 1;  // health lost per cycle (aging)
const STARTING_HEALTH = 20;
const HEALTH_MAX      = 20;
const STAT_MAX           = 5.0;
const STAT_STARTING_VALUE = 1.0;
const STAT_OUTPUT_FACTOR  = 0.15;  // output multiplier per stat point above baseline
const DESTRESA_THRESHOLD  = 5;     // default uses needed to discover a destresa
const DESTRESA_MAX        = 2;     // max destreses per character
const DESTRESA_BONUS      = 1;     // flat output bonus when destresa is active

// --- Game State ---
let state = null;

function createCharacter(inheritedInclination, inheritedPurchasedIds, inheritedBranchTechIds, inheritedStats, inheritedDestreses) {
  return {
    inclination: { ...inheritedInclination },
    purchasedActionIds: new Set(inheritedPurchasedIds),
    unlockedBranchTechIds: new Set(inheritedBranchTechIds),
    stats: inheritedStats ? { ...inheritedStats } : { forca: STAT_STARTING_VALUE, enginy: STAT_STARTING_VALUE, vincle: STAT_STARTING_VALUE },
    destreses: new Set(inheritedDestreses),
    actionUseCounts: {},
    hasPartner: false,
    hasChildren: false,
  };
}

function freshInclination() {
  return { impuls: 0.0, "intel·lecte": 0.0, espiritualitat: 0.0, sociabilitat: 0.0 };
}

function initState() {
  const inclination = freshInclination();
  // Base actions are purchased from the start
  const basePurchased = new Set(ACTIONS.filter(a => a.is_base).map(a => a.id));

  state = {
    cycle: 0,
    generation: 1,
    food: STARTING_FOOD,
    health: STARTING_HEALTH,
    materials: 0,
    character: createCharacter(inclination, basePurchased, new Set()),
    discoveredUniversalTechIds: new Set(),
    log: [],
    lastResult: null,
    gameOverReason: null,
    pendingEvent: null,
    pendingSuccession: null,
    gameOver: false,
  };
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

// --- Branch Tech Discovery ---

function getEligibleBranchTechs() {
  return BRANCH_TECHS.filter(bt =>
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
  state.character.unlockedBranchTechIds.add(bt.id);
  addLog(`Nova habilitat: ${bt.name}`);
}

function performDiscoveryAction() {
  const eligible = getEligibleBranchTechs();
  if (eligible.length === 0) {
    addLog("No hi ha tècniques noves a descobrir ara.");
    render();
    return;
  }
  const best = eligible.reduce((a, b) =>
    getBranchTechMaturity(a) >= getBranchTechMaturity(b) ? a : b
  );
  unlockBranchTech(best);
  state.lastResult = `Habilitat nova apresa: ${best.name}`;
  state.cycle++;

  if (state.cycle >= LIFE_EXPECTANCY && !state.pendingEvent) triggerSuccession();
  render();
}

// Filter a pool to only eligible events (excludes discovery events whose conditions aren't met)
function getEligiblePoolEvents(pool) {
  return pool.filter(ev => {
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
    addLog(`Saber insuficient per aprendre ${action.name}.`);
    render();
    return;
  }

  state.materials -= action.purchase_cost;
  state.character.purchasedActionIds.add(actionId);
  addLog(`Après: ${action.name} (−${action.purchase_cost} 🧠)`);
  render();
}

function executeAction(actionId) {
  const action = ACTIONS.find(a => a.id === actionId);
  if (!action) return;
  if (!state.character.purchasedActionIds.has(actionId)) return;

  const vis = getActionVisibility(action);
  if (vis !== "ACTIVE") {
    addLog(`${action.name} no és executable en l'estat actual.`);
    return;
  }
  if (state.food < action.execute_cost) {
    addLog(`Aliment insuficient per executar ${action.name}.`);
    render();
    return;
  }

  state.food -= action.execute_cost;

  // Track use count for destresa discovery
  state.character.actionUseCounts[actionId] = (state.character.actionUseCounts[actionId] || 0) + 1;

  // Roll output: stat multiplier + destresa flat bonus
  const destresaBonus = (action.destresa_id && state.character.destreses.has(action.destresa_id))
    ? DESTRESA_BONUS : 0;
  const output = Math.round(randInt(action.output_min, action.output_max) * getStatMultiplier(action)) + destresaBonus;
  const outRes = action.output_resource || 'food';
  if (outRes === 'eines') {
    state.materials += output;
  } else if (outRes === 'health') {
    state.health = Math.min(HEALTH_MAX, state.health + output);
  } else {
    state.food += output;
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

  // Advance cycle
  state.cycle++;

  const resLabel = outRes === 'eines' ? 'Saber' : outRes === 'health' ? 'Salut' : 'Aliment';
  addLog(`[${state.cycle}] ${action.name}: +${output} ${resLabel}`);
  state.lastResult = `Cicle ${state.cycle} — ${action.name}: +${output} ${resLabel}`;

  // Special one-time family actions
  if (actionId === 'act_cercar_parella' && !state.character.hasPartner) {
    state.character.hasPartner = true;
    state.lastResult = `Has trobat parella. Ara podeu tenir fills.`;
    addLog(`Parella trobada.`);
  }
  if (actionId === 'act_tenir_fills' && !state.character.hasChildren) {
    state.character.hasChildren = true;
    state.lastResult = `Fills nascuts. La successió del llinatge és assegurada.`;
    addLog(`Fills nascuts. Successió assegurada.`);
  }

  // Upkeep (food + health lost to survival and aging)
  state.food   = Math.max(0, state.food   - FOOD_UPKEEP);
  state.health = Math.max(0, state.health - HEALTH_UPKEEP);
  if (state.food   === 0) addLog(`⚠ Provisions crítiques.`);
  if (state.health === 0) addLog(`💀 Salut crítica.`);

  // Trigger event
  if (action.event_pool_id && EVENT_POOLS[action.event_pool_id]) {
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

  if (ev.effects) {
    if (ev.effects.food)   { state.food   = Math.max(0, state.food   + ev.effects.food);   addLog(`Esdeveniment: ${ev.effects.food   >= 0 ? '+' : ''}${ev.effects.food} Aliment`); }
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
    state.food += opt.food_delta;
    addLog(`Esdeveniment: ${opt.food_delta >= 0 ? '+' : ''}${opt.food_delta} Aliment`);
  }

  if (opt.discovers && ev.discovery_branch_tech_id) {
    const bt = BRANCH_TECHS.find(t => t.id === ev.discovery_branch_tech_id);
    if (bt) unlockBranchTech(bt);
  }

  state.pendingEvent = null;
  if (state.cycle >= LIFE_EXPECTANCY || state.health <= 0) triggerSuccession();
  render();
}

function triggerSuccession() {
  if (!state.character.hasChildren) {
    state.gameOver = true;
    state.gameOverReason = 'no_heir';
    return;
  }
  if (state.generation >= MAX_GENERATIONS) {
    state.gameOver = true;
    state.gameOverReason = 'max_generations';
    return;
  }

  // Build succession summary
  const topAxis = AXES.reduce((a, b) =>
    Math.abs(state.character.inclination[a]) > Math.abs(state.character.inclination[b]) ? a : b
  );

  state.pendingSuccession = {
    generation: state.generation,
    cyclesLived: state.cycle,
    topAxis,
    topAxisVal: state.character.inclination[topAxis].toFixed(2),
  };
}

function continueSuccession() {
  if (!state.pendingSuccession) return;
  state.pendingSuccession = null;

  // Inherited inclination with decay
  const newInclination = {};
  for (const axis of AXES) {
    newInclination[axis] = state.character.inclination[axis] * BRANCH_INHERITANCE_RATE;
  }

  // Carry over purchased actions and branch techs
  const inheritedPurchased = new Set(state.character.purchasedActionIds);
  const inheritedBranchTechs = new Set(state.character.unlockedBranchTechIds);

  // Inherit stats with decay toward baseline
  const parentStats = state.character.stats;
  const inheritedStats = {};
  for (const k of ['forca', 'enginy', 'vincle']) {
    inheritedStats[k] = parentStats[k] * BRANCH_INHERITANCE_RATE + 1.0 * (1 - BRANCH_INHERITANCE_RATE);
  }

  const inheritedDestreses = new Set(state.character.destreses);

  state.generation++;
  state.cycle = 0;
  state.character = createCharacter(newInclination, inheritedPurchased, inheritedBranchTechs, inheritedStats, inheritedDestreses);

  state.lastResult = null;
  addLog(`--- Generació ${state.generation} ---`);
  render();
}

function restartGame() {
  initState();
  render();
}

// --- Helpers ---
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addLog(msg) {
  state.log.unshift(msg);
  if (state.log.length > 8) state.log.length = 8;
}

// --- Rendering ---

const AXIS_LABELS = {
  impuls:         { left: "Reflexiu",  right: "Impulsiu"  },
  "intel·lecte":  { left: "Instintiu", right: "Analític"  },
  espiritualitat: { left: "Pragmàtic", right: "Espiritual" },
  sociabilitat:   { left: "Solitari",  right: "Social"    }
};

const FOOD_MAX_DISPLAY = 30;

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
  document.getElementById("food-counter").textContent = `🌾 ${state.food}`;
  document.getElementById("materials-counter").textContent = `🧠 ${state.materials}`;
}

function renderProfilePanel() {
  // Profile label — dominant branch name or default
  const activeBranchesNow = getActiveBranches();
  document.getElementById("profile-label").textContent =
    activeBranchesNow.length > 0 ? activeBranchesNow[0].name : "Explorador";

  // Stats (Força / Enginy / Vincle)
  const statsEl = document.getElementById("stats-display");
  statsEl.innerHTML = "";
  const statDefs = [
    { key: "forca",  label: "Força" },
    { key: "enginy", label: "Enginy" },
    { key: "vincle", label: "Vincle" }
  ];
  for (const { key, label } of statDefs) {
    const val = state.character.stats[key];
    const pct = Math.min(100, Math.max(0, (val - 1.0) / (STAT_MAX - 1.0) * 100));
    const row = document.createElement("div");
    row.className = "stat-row";
    row.innerHTML = `<span class="stat-name">${label}</span>` +
      `<div class="stat-bar-track"><div class="stat-bar-fill" style="width:${pct.toFixed(1)}%"></div></div>` +
      `<span class="stat-value">${val.toFixed(1)}</span>`;
    statsEl.appendChild(row);
  }

  // Health bar
  const hfill = document.getElementById("health-bar-fill");
  document.getElementById("health-count").textContent = state.health;
  hfill.style.width = Math.min(100, Math.max(0, (state.health / HEALTH_MAX) * 100)) + "%";
  hfill.style.background = state.health <= 4 ? "var(--accent)" : state.health <= 8 ? "#f59e0b" : "var(--green)";

  // Inclination dots
  const inclEl = document.getElementById("inclination-rows");
  inclEl.innerHTML = "";
  for (const axis of AXES) {
    const val = state.character.inclination[axis];
    const labels = AXIS_LABELS[axis];
    const activeDot = inclinationToDotIndex(val);

    const row = document.createElement("div");
    row.className = "incl-row";

    const leftLbl = document.createElement("span");
    leftLbl.className = "incl-pole";
    leftLbl.textContent = labels.left;

    const dotsEl = document.createElement("span");
    dotsEl.className = "incl-dots";
    for (let i = 0; i < 5; i++) {
      const dot = document.createElement("span");
      dot.className = "incl-dot";
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

  // Family status
  const famEl = document.getElementById("family-status");
  famEl.innerHTML = `
    <span class="family-badge ${state.character.hasPartner ? 'achieved' : ''}">Parella</span>
    <span class="family-badge ${state.character.hasChildren ? 'achieved' : ''}">Fills</span>
  `;

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

  // Succession warning (approaching end of life without children)
  const warnEl = document.getElementById("succession-warning");
  const cyclesLeft = LIFE_EXPECTANCY - state.cycle;
  if (cyclesLeft <= 4 && !state.character.hasChildren && !state.gameOver) {
    warnEl.textContent = `⚠ Queden ${cyclesLeft} cicle${cyclesLeft === 1 ? '' : 's'}. Cal tenir fills per assegurar la successió.`;
    warnEl.classList.remove("hidden");
  } else {
    warnEl.classList.add("hidden");
  }

  // Discovery notification
  const notifEl = document.getElementById("discovery-notification");
  if (getEligibleBranchTechs().length > 0) {
    notifEl.textContent = "Hi ha estrangers al poblat que expliquen tècniques noves.";
    notifEl.classList.remove("hidden");
  } else {
    notifEl.classList.add("hidden");
  }

  renderUniversalTechs();
  renderActions();
  renderLog();
}

function renderUniversalTechs() {
  const section = document.getElementById("universal-techs-section");
  const el = document.getElementById("universal-techs-list");
  el.innerHTML = "";

  const discoverable = getDiscoverableTechs();
  if (discoverable.length === 0) {
    section.classList.add("empty");
    return;
  }
  section.classList.remove("empty");

  for (const tech of discoverable) {
    const card = document.createElement("div");
    card.className = "tech-card";

    const info = document.createElement("div");
    info.className = "tech-info";
    const effectText = tech.effect ? `<span class="tech-effect">${tech.effect.desc}</span>` : '';
    info.innerHTML = `<div class="tech-name">${tech.icon || ''} ${tech.name}${effectText}</div><div class="tech-desc">${tech.description}</div>`;

    const btn = document.createElement("button");
    btn.className = "btn-discover-tech";
    btn.textContent = "Descobrir";
    btn.onclick = () => discoverTech(tech.id);

    card.appendChild(info);
    card.appendChild(btn);
    el.appendChild(card);
  }
}

function renderActions() {
  const el = document.getElementById("actions-list");
  el.innerHTML = "";

  const purchasableActionIds = new Set();
  for (const btId of state.character.unlockedBranchTechIds) {
    const bt = BRANCH_TECHS.find(t => t.id === btId);
    if (!bt) continue;
    for (const aid of bt.unlocks_action_ids) purchasableActionIds.add(aid);
  }

  // Base actions superseded by a purchased upgrade
  const upgradedBaseActionIds = new Set();
  for (const a of ACTIONS) {
    if (a.is_upgrade && state.character.purchasedActionIds.has(a.id)) {
      upgradedBaseActionIds.add(a.upgrades_action_id);
    }
  }

  const toShow = [];
  const hasEligibleBranchTechs = getEligibleBranchTechs().length > 0;

  for (const action of ACTIONS) {
    // Family actions: one-time, shown only when conditions met
    if (action.id === 'act_cercar_parella' && state.character.hasPartner) continue;
    if (action.id === 'act_tenir_fills' && (!state.character.hasPartner || state.character.hasChildren)) continue;

    if (action.is_discovery_action) {
      if (hasEligibleBranchTechs) toShow.push({ action, purchased: true, vis: "ACTIVE", isDiscovery: true });
      continue;
    }

    // Upgrade actions: visible only when base is owned
    if (action.is_upgrade) {
      if (!state.character.purchasedActionIds.has(action.upgrades_action_id)) continue;
      const purchased = state.character.purchasedActionIds.has(action.id);
      const vis = getActionVisibility(action);
      if (purchased) {
        if (vis !== "HIDDEN") toShow.push({ action, purchased, vis, isUpgrade: true });
      } else {
        if (vis === "ACTIVE") toShow.push({ action, purchased: false, vis, isUpgrade: true });
      }
      continue;
    }

    // Skip base actions replaced by a purchased upgrade
    if (upgradedBaseActionIds.has(action.id)) continue;

    const purchased = state.character.purchasedActionIds.has(action.id);
    const vis = getActionVisibility(action);
    if (purchased) {
      if (vis === "HIDDEN") continue;
      toShow.push({ action, purchased, vis });
    } else {
      if (!purchasableActionIds.has(action.id)) continue;
      if (vis !== "ACTIVE") continue;
      toShow.push({ action, purchased, vis });
    }
  }

  if (toShow.length === 0) {
    el.innerHTML = '<div class="dim">Cap acció disponible</div>';
    return;
  }

  const actionScore = item => {
    if (item.isDiscovery) return -1;
    if (item.purchased && item.vis === "ACTIVE") return 0;
    if (item.purchased && item.vis === "FADED")  return 1;
    return 2;
  };
  toShow.sort((a, b) => actionScore(a) - actionScore(b));

  // Group by zone
  const ZONE_ORDER = ["Bosc", "Planes", "Campament", "Ritual"];
  const byZone = {};
  for (const item of toShow) {
    const z = item.action.zona || "Campament";
    if (!byZone[z]) byZone[z] = [];
    byZone[z].push(item);
  }

  for (const zona of ZONE_ORDER) {
    if (!byZone[zona]) continue;
    const hdr = document.createElement("div");
    hdr.className = `zone-section-header zone-${zona.toLowerCase()}`;
    hdr.textContent = zona;
    el.appendChild(hdr);
    for (const item of byZone[zona]) {
      el.appendChild(buildActionCard(item));
    }
  }
}

function buildActionCard({ action, purchased, vis, isDiscovery, isUpgrade }) {
  const card = document.createElement("div");
  card.className = `action-card${vis === "FADED" ? " faded" : ""}${isDiscovery ? " discovery" : ""}${isUpgrade ? " upgrade" : ""}`;

  const nameEl = document.createElement("div");
  nameEl.className = "action-name";
  nameEl.textContent = isUpgrade ? `↑ ${action.name}` : action.name;
  card.appendChild(nameEl);

  if (action.description) {
    const descEl = document.createElement("div");
    descEl.className = "action-desc";
    descEl.textContent = action.description;
    card.appendChild(descEl);
  }

  const hint = getInclinationHint(action);
  if (hint && !isDiscovery) {
    const hintEl = document.createElement("div");
    hintEl.className = "action-incl-hint";
    hintEl.textContent = hint;
    card.appendChild(hintEl);
  }

  if (action.health_delta && action.health_delta < 0) {
    const riskEl = document.createElement("div");
    riskEl.className = "action-risk";
    riskEl.textContent = `⚠ ${action.health_delta} Salut`;
    card.appendChild(riskEl);
  }

  // Destresa progress (only on purchased non-upgrade actions with a destresa_id)
  if (action.destresa_id && purchased && !isUpgrade) {
    const count = state.character.actionUseCounts[action.id] || 0;
    const threshold = action.destresa_threshold || DESTRESA_THRESHOLD;
    if (state.character.destreses.has(action.destresa_id)) {
      const d = document.createElement("div");
      d.className = "destresa-achieved";
      d.textContent = `⭐ ${action.destresa_name}`;
      card.appendChild(d);
    } else if (state.character.destreses.size < DESTRESA_MAX) {
      const d = document.createElement("div");
      d.className = "destresa-progress";
      d.textContent = `⭐ ${count}/${threshold}`;
      card.appendChild(d);
    }
  }

  const footer = document.createElement("div");
  footer.className = "action-footer";

  const metaEl = document.createElement("div");
  metaEl.className = "action-meta";

  const btnArea = document.createElement("div");

  const outRes   = action.output_resource || 'food';
  const resShort = outRes === 'eines' ? 'saber' : outRes === 'health' ? 'salut' : 'alim.';
  const resClass = outRes === 'eines' ? 'reward reward-eines' : outRes === 'health' ? 'reward reward-health' : 'reward';
  const costLabel = action.execute_cost > 0 ? `${action.execute_cost} alim. ` : '';

  if (isDiscovery) {
    const btn = document.createElement("button");
    btn.className = "btn-discovery";
    btn.textContent = "Escoltar";
    btn.onclick = () => performDiscoveryAction();
    btnArea.appendChild(btn);
  } else if (purchased && vis === "ACTIVE") {
    metaEl.innerHTML = `${costLabel}<span class="${resClass}">+${action.output_min}–${action.output_max} ${resShort}</span>`;
    const btn = document.createElement("button");
    btn.className = "btn-execute";
    btn.textContent = action.execute_cost > 0 ? `Executar (−${action.execute_cost})` : `Executar`;
    btn.onclick = () => executeAction(action.id);
    btnArea.appendChild(btn);
  } else if (purchased && vis === "FADED") {
    metaEl.innerHTML = `${costLabel}<span class="${resClass}">+${action.output_min}–${action.output_max} ${resShort}</span>`;
    const note = document.createElement("span");
    note.className = "faded-note";
    note.textContent = "Fora de rang";
    btnArea.appendChild(note);
  } else {
    metaEl.innerHTML = `${action.purchase_cost} saber <span class="${resClass}">+${action.output_min}–${action.output_max} ${resShort}</span>`;
    const btn = document.createElement("button");
    btn.className = "btn-buy";
    btn.textContent = isUpgrade ? `Millorar (−${action.purchase_cost} 🧠)` : `Aprendre (−${action.purchase_cost} 🧠)`;
    btn.onclick = () => purchaseAction(action.id);
    btnArea.appendChild(btn);
  }

  footer.appendChild(metaEl);
  footer.appendChild(btnArea);
  card.appendChild(footer);
  return card;
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
      document.getElementById("event-effect").textContent =
        fx && fx.food ? `Efecte: ${fx.food >= 0 ? "+" : ""}${fx.food} provisions` : "";
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
    document.getElementById("succ-axis").textContent = `${s.topAxis} (${s.topAxisVal})`;
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

// --- Boot ---
document.addEventListener("DOMContentLoaded", () => {
  // Wire modal buttons
  document.getElementById("btn-dismiss-event").onclick = dismissEvent;
  document.getElementById("btn-continue-succession").onclick = continueSuccession;
  document.getElementById("btn-restart").onclick = restartGame;

  // Wire profile tabs
  document.getElementById("tab-joc").onclick = () => {
    document.getElementById("panel-joc").classList.remove("hidden");
    document.getElementById("panel-personatge").classList.add("hidden");
    document.getElementById("tab-joc").classList.add("active");
    document.getElementById("tab-personatge").classList.remove("active");
  };
  document.getElementById("tab-personatge").onclick = () => {
    document.getElementById("panel-personatge").classList.remove("hidden");
    document.getElementById("panel-joc").classList.add("hidden");
    document.getElementById("tab-personatge").classList.add("active");
    document.getElementById("tab-joc").classList.remove("active");
  };

  initState();
  render();
});
