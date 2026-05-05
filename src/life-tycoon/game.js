'use strict';

// ── Helpers ───────────────────────────────────────────────────────────────────
const lerp  = (a, b, t) => a + (b - a) * Math.max(0, Math.min(1, t));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const rand  = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick  = arr => arr[rand(0, arr.length - 1)];

function el(id) { return document.getElementById(id); }
function show(id) { el(id).classList.remove('hidden'); }
function hide(id) { el(id).classList.add('hidden'); }

// ── Timer ─────────────────────────────────────────────────────────────────────
let _timer = null;

function gameDelay(ms, fn) {
  clearTimeout(_timer);
  _timer = setTimeout(fn, ms);
}

// ── State ─────────────────────────────────────────────────────────────────────
let S = {};

function initState() {
  const st = GAME_DATA.era.startingStats;
  S = {
    phase: 'select',
    cycle: 1,
    maxCycles: GAME_DATA.era.cyclesPerLife.base,
    generation: 1,
    dynastyName: '',
    char: {
      name: '',
      gender: 'M',
      age: 15,
      health: st.health, maxHealth: 100,
      food: st.food,
      physical: st.physical,
      intelligence: st.intelligence,
      social: st.social,
      wealth: st.wealth,
      happiness: st.happiness,
      familyReputation: st.familyReputation,
      knowledgeIds: [],
      partner: null,
      children: [],
      huntCount: 0,
    },
    intensity: 2,
    timeTotal: GAME_DATA.era.timeTotal,
    timeLeft: GAME_DATA.era.timeTotal,
    activeProject: null,
    pendingEvent: null,
    pendingDiscoveries: [],
    pendingFloaters: {},
    lastResult: null,
    genealogy: [],
    milestones: [],
    totalWealth: 0,
  };
}

// ── Name generation ───────────────────────────────────────────────────────────
function randomName(gender, exclude) {
  const pool = gender === 'M' ? GAME_DATA.namesMasc : GAME_DATA.namesFem;
  const filtered = pool.filter(n => n !== exclude);
  return pick(filtered);
}

function dynastyName(firstName) {
  const suffixes = ['de la Roca', 'del Foc', 'de la Tribu', 'del Vent', 'de les Cavernes'];
  return firstName + ' ' + pick(suffixes);
}

// ── Project helpers ───────────────────────────────────────────────────────────
function getProject(id) { return GAME_DATA.projects.find(p => p.id === id); }
function getKnowledge(id) { return GAME_DATA.knowledge.find(k => k.id === id); }
function hasKnowledge(id) { return S.char.knowledgeIds.includes(id); }

function isProjectUnlocked(proj) {
  const r = proj.requirements || {};
  if (r.physical && S.char.physical < r.physical) return false;
  if (r.intelligence && S.char.intelligence < r.intelligence) return false;
  if (r.social && S.char.social < r.social) return false;
  if (r.health && S.char.health < r.health) return false;
  if (r.requiresPartner && !S.char.partner) return false;
  if (r.knowledgeIds) {
    for (const k of r.knowledgeIds) { if (!hasKnowledge(k)) return false; }
  }
  if (proj.requiresNoPartner && S.char.partner) return false;
  return true;
}

function lockedReason(proj) {
  const r = proj.requirements || {};
  if (r.physical && S.char.physical < r.physical) return `Físic ${r.physical}+`;
  if (r.intelligence && S.char.intelligence < r.intelligence) return `Intel ${r.intelligence}+`;
  if (r.social && S.char.social < r.social) return `Social ${r.social}+`;
  if (r.health && S.char.health < r.health) return `Salut ${r.health}+`;
  if (r.requiresPartner && !S.char.partner) return 'Necessites parella';
  if (r.knowledgeIds) {
    for (const k of r.knowledgeIds) {
      if (!hasKnowledge(k)) {
        const kd = getKnowledge(k);
        return `Necessites: ${kd ? kd.name : k}`;
      }
    }
  }
  if (proj.requiresNoPartner && S.char.partner) return 'Ja tens parella';
  return '';
}

// ── Formula ───────────────────────────────────────────────────────────────────
function calcResult(proj) {
  const mult     = [0.5, 1.1, 1.8][S.intensity - 1];
  const riskMult = [0.4, 1.0, 2.2][S.intensity - 1];
  const statVal  = S.char[proj.statKey] || 1;
  const statMod  = clamp(0.65 + (statVal - 1) * 0.12, 0.5, 1.8);
  let knowMod = 1.0;
  for (const kId of (proj.knowledgeBonus || [])) { if (hasKnowledge(kId)) knowMod += 0.15; }
  const finalMult = mult * statMod * knowMod;

  const fx = {};
  for (const [key, val] of Object.entries(proj.outputs || {})) {
    fx[key] = Math.round(val * (val < 0 ? mult : finalMult));
  }

  let riskFailed = false;
  if (proj.healthRisk > 0) {
    let effectiveRisk = proj.healthRisk;
    for (const [kId, reduction] of Object.entries(proj.riskReductions || {})) {
      if (hasKnowledge(kId)) effectiveRisk = Math.round(effectiveRisk * (1 - reduction));
    }
    const failChance = [0.15, 0.3, 0.55][S.intensity - 1] / Math.max(1, statMod);
    if (Math.random() < failChance) {
      fx.health = (fx.health || 0) - Math.round(effectiveRisk * riskMult);
      riskFailed = true;
    }
  }

  for (const [stat, gain] of Object.entries(proj.statGain || {})) {
    fx['_gain_' + stat] = gain;
  }

  const quality = finalMult > 1.0 ? 'good' : finalMult > 0.6 ? 'ok' : 'poor';
  const texts = quality === 'poor' ? proj.failTexts : proj.successTexts;
  return { fx, finalMult, riskFailed, quality, narrative: texts ? pick(texts) : '' };
}

function applyFx(fx) {
  const c = S.char;
  for (const [k, v] of Object.entries(fx)) {
    if (k.startsWith('_gain_')) {
      const stat = k.slice(6);
      c[stat] = +(c[stat] + v).toFixed(1);
    } else if (k === 'health') {
      c.health = clamp(c.health + v, 0, c.maxHealth);
    } else if (k === 'food') {
      c.food = clamp(c.food + v, 0, 100);
    } else if (k === 'happiness') {
      c.happiness = clamp(c.happiness + v, 0, 100);
    } else if (k === 'familyReputation') {
      c.familyReputation = clamp(c.familyReputation + v, 0, 100);
    } else if (k === 'wealth') {
      c.wealth = Math.max(0, Math.round(c.wealth + v));
    }
  }
  if (c.wealth > S.totalWealth) S.totalWealth = c.wealth;
}

// ── Floating numbers ──────────────────────────────────────────────────────────
function showFxFloaters(fx) {
  const fxMap  = { health: 'chip-health', food: 'chip-food', wealth: 's-wealth', happiness: 's-hap', familyReputation: 's-rep' };
  const gainMap = { physical: 's-phys', intelligence: 's-intel', social: 's-social' };
  for (const [k, v] of Object.entries(fx)) {
    if (v === 0) continue;
    const anchorId = k.startsWith('_gain_') ? gainMap[k.slice(6)] : fxMap[k];
    if (!anchorId) continue;
    const anchor = el(anchorId);
    if (!anchor) continue;
    const rect = anchor.getBoundingClientRect();
    const div = document.createElement('div');
    div.className = `float-num ${v > 0 ? 'pos' : 'neg'}`;
    div.textContent = (v > 0 ? '+' : '') + (Number.isInteger(v) ? v : v.toFixed(1));
    div.style.left = (rect.left + rect.width / 2 - 14) + 'px';
    div.style.top = rect.top + 'px';
    document.body.appendChild(div);
    div.addEventListener('animationend', () => div.remove());
  }
}

// ── Knowledge discovery ───────────────────────────────────────────────────────
function tryDiscoverKnowledge(proj, score) {
  const discovered = [];
  for (const kId of (proj.knowledgeDiscovery || [])) {
    if (hasKnowledge(kId)) continue;
    const k = getKnowledge(kId);
    if (!k || score < 0.3) continue;
    if (Math.random() < k.discoveryChance) {
      S.char.knowledgeIds.push(kId);
      for (const [stat, bonus] of Object.entries(k.statBonus || {})) {
        if (stat === 'health') S.char.health = clamp(S.char.health + bonus, 0, S.char.maxHealth);
        else S.char[stat] = +(S.char[stat] + bonus).toFixed(1);
      }
      discovered.push(k);
      if (kId === 'fire') earnMilestone('first_fire');
      if (S.char.knowledgeIds.length >= 3) earnMilestone('all_knowledge');
    }
  }
  return discovered;
}

// ── Milestones ────────────────────────────────────────────────────────────────
function earnMilestone(id) {
  if (!S.milestones.includes(id)) { S.milestones.push(id); return true; }
  return false;
}

function checkMilestones() {
  if (S.char.age >= 40) earnMilestone('long_lived');
  if (S.char.familyReputation >= 50) earnMilestone('tribe_respected');
  if (S.char.wealth >= 100) earnMilestone('wealthy');
  if (S.char.huntCount >= 5) earnMilestone('great_hunter');
  if (S.char.partner && S.char.children.length >= 2) earnMilestone('family_complete');
}

// ── Partner generation ────────────────────────────────────────────────────────
function generatePartner() {
  const gender = S.char.gender === 'M' ? 'F' : 'M';
  const name = randomName(gender, S.char.name);
  const base = Math.max(1, Math.round(S.char.social / 1.5));
  return {
    name,
    gender,
    stats: {
      physical:     rand(base - 1, base + 2),
      intelligence: rand(base - 1, base + 2),
      social:       rand(base,     base + 3),
    },
  };
}

// ── Child generation ──────────────────────────────────────────────────────────
function generateChild() {
  const gender = Math.random() > 0.5 ? 'M' : 'F';
  const name = randomName(gender, S.char.name);
  const ps = S.char.partner?.stats || { physical: 2, intelligence: 2, social: 2 };

  const physical     = clamp(Math.round((S.char.physical     + ps.physical)     / 2 + rand(-1, 1)), 1, 8);
  const intelligence = clamp(Math.round((S.char.intelligence + ps.intelligence) / 2 + rand(-1, 1)), 1, 8);
  const social       = clamp(Math.round((S.char.social       + ps.social)       / 2 + rand(-1, 1)), 1, 8);

  const inheritedKnowledge = S.char.knowledgeIds.filter(kId => {
    const k = getKnowledge(kId);
    return k && Math.random() < k.inheritanceRate;
  });

  const dominantKey = [
    { k: 'physical', v: physical },
    { k: 'intelligence', v: intelligence },
    { k: 'social', v: social },
  ].sort((a, b) => b.v - a.v)[0].k;
  const diff = Math.max(physical, intelligence, social) - Math.min(physical, intelligence, social);
  const virtueKey = diff <= 1 ? 'balanced' : dominantKey;
  const virtueLabel = pick(GAME_DATA.virtueLabels[virtueKey]);

  return {
    name, gender, physical, intelligence, social, virtueLabel,
    knowledgeIds: inheritedKnowledge,
    wealth: Math.round(S.char.wealth * 0.4),
    familyReputation: S.char.familyReputation,
  };
}

function childAvatar(child) {
  const emojis = { M: ['👦', '🧒', '👦'], F: ['👧', '🧒', '👧'] };
  return pick(emojis[child.gender] || ['🧒']);
}

function virtueForChar(c) {
  const dominant = [
    { k: 'physical', v: c.physical },
    { k: 'intelligence', v: c.intelligence },
    { k: 'social', v: c.social },
  ].sort((a, b) => b.v - a.v)[0].k;
  const diff = Math.max(c.physical, c.intelligence, c.social) - Math.min(c.physical, c.intelligence, c.social);
  const key = diff <= 1 ? 'balanced' : dominant;
  return pick(GAME_DATA.virtueLabels[key]);
}

// ── Event system ──────────────────────────────────────────────────────────────
function tryTriggerEvent(proj, quality) {
  if (quality === 'poor') return null;
  const pool = proj.eventPool || [];
  for (const eId of pool) {
    const ev = GAME_DATA.events.find(e => e.id === eId);
    if (ev && Math.random() < 0.28) return ev;
  }
  // Global events (harsher conditions)
  if (S.cycle >= 4 && Math.random() < 0.1) {
    const globals = ['harsh_winter', 'tribe_conflict'];
    const eId = pick(globals);
    return GAME_DATA.events.find(e => e.id === eId) || null;
  }
  return null;
}

// ── End of cycle ──────────────────────────────────────────────────────────────
function endCycle() {
  S.char.age += 2;

  // Food cost proportional to time used
  const timeUsed = S.timeTotal - S.timeLeft;
  const foodCost = Math.round(timeUsed * GAME_DATA.era.foodPerTimePoint);
  S.char.food = Math.max(0, S.char.food - foodCost);
  if (S.char.food === 0) S.char.health = clamp(S.char.health - 8, 0, S.char.maxHealth);

  // Aging penalty (after 70% of max lifespan)
  const agePct = S.char.age / GAME_DATA.era.lifeExpectancy.max;
  if (agePct > 0.7) S.char.health = clamp(S.char.health - Math.round(agePct * 3), 0, S.char.maxHealth);

  // Happiness drift
  S.char.happiness = clamp(S.char.happiness - 3, 20, 100);

  checkMilestones();

  if (S.char.health <= 0 || S.cycle >= S.maxCycles) {
    triggerDeath();
    return;
  }

  S.timeLeft = S.timeTotal;
  S.cycle++;
  S.phase = 'select';
  renderAll();
}

function triggerDeath() {
  S.char.health = 0;

  S.genealogy.push({
    name: S.char.name,
    gender: S.char.gender,
    age: S.char.age,
    generation: S.generation,
    era: GAME_DATA.era.name,
    cause: S.cycle >= S.maxCycles ? 'Mort natural' : 'Salut esgotada',
    knowledgeIds: [...S.char.knowledgeIds],
    wealth: S.char.wealth,
  });

  if (S.char.children.length > 0) {
    S.phase = 'succession';
    renderAll();
  } else {
    S.phase = 'gameover';
    renderAll();
  }
}

// ── Succession ────────────────────────────────────────────────────────────────
function doSuccession(child) {
  S.generation++;
  earnMilestone('dynasty_founded');

  S.char = {
    name: child.name,
    gender: child.gender,
    age: 15,
    health: 80, maxHealth: 100,
    food: GAME_DATA.era.startingStats.food,
    physical:     child.physical,
    intelligence: child.intelligence,
    social:       child.social,
    wealth:       child.wealth,
    happiness: 60,
    familyReputation: child.familyReputation,
    knowledgeIds: child.knowledgeIds,
    partner: null,
    children: [],
    huntCount: 0,
  };

  S.timeLeft = S.timeTotal;
  S.cycle = 1;
  S.maxCycles = GAME_DATA.era.cyclesPerLife.base + Math.round(S.char.physical * 0.3);
  S.phase = 'select';
  renderAll();
}

// ── Scoring ───────────────────────────────────────────────────────────────────
function calcScore() {
  let score = 0;
  score += S.generation * 400;
  score += S.totalWealth * 2;
  score += S.char.familyReputation * 5;
  score += S.char.knowledgeIds.length * 100;
  for (const mId of S.milestones) {
    const m = GAME_DATA.milestones.find(x => x.id === mId);
    if (m) score += m.points;
  }
  return Math.round(score);
}

function dynastyTitle() {
  const m = S.milestones;
  if (m.length >= 5) return 'Llegenda Viva';
  if (m.includes('dynasty_founded') && m.includes('wealthy')) return 'Constructors d\'Imperis';
  if (m.includes('all_knowledge')) return 'La Línia dels Savis';
  if (m.includes('great_hunter')) return 'Guerrers de la Prehistòria';
  if (m.includes('family_complete')) return 'La Família Completa';
  return 'Fills de la Terra';
}

// ── Rendering ─────────────────────────────────────────────────────────────────
function renderAll() {
  renderHeader();
  renderStats();
  renderKnowledge();
  renderPartner();
  renderPhase();
}

function renderCycleForecast() {
  const timeUsed  = S.timeTotal - S.timeLeft;
  const foodCost  = Math.round(S.timeTotal * GAME_DATA.era.foodPerTimePoint);
  const agePct    = S.char.age / GAME_DATA.era.lifeExpectancy.max;
  const ageLoss   = agePct > 0.7 ? Math.round(agePct * 3) : 0;

  // Food — always show full-cycle projected cost
  const fcFood = el('fc-food');
  const danger = S.char.food - foodCost < 15;
  fcFood.textContent = `(-${foodCost})`;
  fcFood.className = 'fc-delta' + (danger ? ' danger' : '');

  // Happiness always -3
  el('fc-hap').textContent = '(-3)';
  el('fc-hap').className = 'fc-delta';

  // Health: only if aging penalty or starvation risk
  const fcHealth = el('fc-health');
  const willStarve = S.char.food - foodCost <= 0;
  const totalHealthLoss = ageLoss + (willStarve ? 8 : 0);
  if (totalHealthLoss > 0) {
    fcHealth.textContent = `(-${totalHealthLoss})`;
    fcHealth.className = 'fc-delta danger';
  } else {
    fcHealth.textContent = '';
  }
}

function renderHeader() {
  el('hdr-name').textContent = S.char.name;
  el('hdr-age').textContent = `· ${S.char.age} anys`;
  el('hdr-gen').textContent = `Gen. ${S.generation}`;
  el('hdr-c').textContent = S.cycle;
  el('hdr-mc').textContent = S.maxCycles;
}

function renderStats() {
  const hp = S.char.health;
  el('s-health').textContent = Math.round(hp);
  el('chip-health').classList.toggle('low',      hp < 40 && hp >= 20);
  el('chip-health').classList.toggle('critical', hp < 20);

  const food = S.char.food;
  el('s-food').textContent = Math.round(food);
  el('chip-food').classList.toggle('low',      food < 30 && food >= 15);
  el('chip-food').classList.toggle('critical', food < 15);

  el('s-wealth').textContent = S.char.wealth;
  el('s-hap').textContent    = Math.round(S.char.happiness);
  el('s-rep').textContent    = Math.round(S.char.familyReputation);
  el('s-phys').textContent   = S.char.physical.toFixed(1);
  el('s-intel').textContent  = S.char.intelligence.toFixed(1);
  el('s-social').textContent = S.char.social.toFixed(1);
  renderCycleForecast();
}

function renderKnowledge() {
  const row = el('knowledge-row');
  row.innerHTML = '';
  if (S.char.knowledgeIds.length === 0) {
    row.innerHTML = '<span style="font-size:0.7rem;color:var(--text-dim)">Cap coneixement descobert</span>';
    return;
  }
  for (const kId of S.char.knowledgeIds) {
    const k = getKnowledge(kId);
    if (!k) continue;
    const pill = document.createElement('div');
    pill.className = 'know-pill';
    pill.textContent = k.icon + ' ' + k.name;
    row.appendChild(pill);
  }
}

function renderPartner() {
  const row = el('partner-row');
  if (S.char.partner) {
    row.classList.remove('hidden');
    el('partner-label').textContent = `💑 Parella: ${S.char.partner.name} · ${S.char.children.length} fill${S.char.children.length !== 1 ? 's' : ''}`;
  } else {
    row.classList.add('hidden');
  }
}

function renderPhase() {
  const panes = ['pane-select','pane-sliders','pane-executing','pane-result','pane-discovery','pane-event','pane-ev-result'];
  panes.forEach(p => hide(p));

  const overlays = ['overlay-succession','overlay-gameover','overlay-end','overlay-milestones'];
  overlays.forEach(o => hide(o));

  switch (S.phase) {
    case 'select':     renderSelectPane(); show('pane-select'); break;
    case 'intensity':  renderIntensityPane(); show('pane-sliders'); break;
    case 'executing':  renderExecutingPane(); show('pane-executing'); break;
    // 'result' phase retired — go directly to discovery/event/select
    case 'discovery':  renderDiscoveryPane(); show('pane-discovery'); break;
    case 'event':      renderEventPane(); show('pane-event'); break;
    case 'succession': renderSuccessionOverlay(); show('overlay-succession'); break;
    case 'gameover':   renderGameOverOverlay(); show('overlay-gameover'); break;
    case 'end':        renderEndOverlay(); show('overlay-end'); break;
  }
}

// ── Zone definitions ──────────────────────────────────────────────────────────
const ZONE_DEFS = {
  home:   { icon: '🏠', name: 'Llar',   hint: 'Descansa i cuida la família' },
  town:   { icon: '🏛️', name: 'Poblat', hint: 'Socialitza i fabrica' },
  wild:   { icon: '🌿', name: 'Camp',   hint: 'Recol·lecta i observa la natura' },
  forest: { icon: '🌲', name: 'Bosc',   hint: 'Caça i explora terres llunyanes' },
};

// ── Select pane ───────────────────────────────────────────────────────────────
function renderExecutingPane() {
  const proj = S.activeProject;
  el('exec-project-label').textContent = proj.icon + ' ' + proj.name;
  const fill = el('exec-progress-fill');
  fill.style.transition = 'none';
  fill.style.width = '0%';
  el('exec-status-text').textContent = 'Executant...';
}

function renderSelectPane() {
  const actionsLeft = S.timeLeft < S.timeTotal ? Math.floor(S.timeLeft / 2) : 0;
  const timeStr = actionsLeft > 0 ? ` · ${actionsLeft} acció${actionsLeft > 1 ? 'ns' : ''} més` : '';
  el('select-header').textContent = `Cicle ${S.cycle}${timeStr} — On vas?`;

  const container = el('zone-cards');
  container.innerHTML = '';

  for (const [zoneId, zone] of Object.entries(ZONE_DEFS)) {
    const zoneProjects = GAME_DATA.projects.filter(p => p.zone === zoneId);
    const availCount = zoneProjects.filter(p => isProjectUnlocked(p)).length;
    const card = document.createElement('div');
    card.className = 'zone-card';
    card.innerHTML = `
      <span class="zone-card-icon">${zone.icon}</span>
      <div class="zone-card-info">
        <span class="zone-card-name">${zone.name}</span>
        <span class="zone-card-hint">${zone.hint}</span>
      </div>
      <span class="zone-card-count">${availCount} activ.</span>
    `;
    card.addEventListener('click', () => openZoneSheet(zoneId));
    container.appendChild(card);
  }
}

function openZoneSheet(zoneId) {
  const zone = ZONE_DEFS[zoneId];
  el('zone-sheet-icon').textContent = zone.icon;
  el('zone-sheet-name').textContent = zone.name;

  const grid = el('zone-sheet-grid');
  grid.innerHTML = '';

  for (const proj of GAME_DATA.projects.filter(p => p.zone === zoneId)) {
    const unlocked = isProjectUnlocked(proj);
    const card = document.createElement('div');
    card.className = 'proj-card' + (unlocked ? '' : ' locked');
    const reason = unlocked ? '' : lockedReason(proj);
    const riskHtml = (unlocked && proj.healthRisk > 0) ? `<div class="proj-impact"><span class="impact-tag risk">⚠️ Risc</span></div>` : '';
    const reqHtml  = reason ? `<span class="proj-req">${reason}</span>` : '';
    card.innerHTML = `
      <span class="proj-icon">${proj.icon}</span>
      <span class="proj-name">${proj.name}</span>
      <span class="proj-desc">${proj.description}</span>
      ${riskHtml}${reqHtml}
    `;
    if (unlocked) {
      card.addEventListener('click', () => {
        hide('overlay-zone-actions');
        selectProject(proj.id);
      });
    }
    grid.appendChild(card);
  }
  show('overlay-zone-actions');
}

function selectProject(projId) {
  S.activeProject = getProject(projId);
  S.phase = 'intensity';
  renderAll();
}

// ── Intensity pane ────────────────────────────────────────────────────────────
function renderIntensityPane() {
  const proj = S.activeProject;
  el('sl-proj-icon').textContent = proj.icon;
  el('sl-proj-name').textContent = proj.name;

  const costs = [2, 4, 6];
  const names = ['🌱 Suau', '⚡ Normal', '🔥 Intens'];

  // Auto-downgrade if current intensity not affordable
  if (costs[S.intensity - 1] > S.timeLeft) {
    S.intensity = costs.findIndex(c => c <= S.timeLeft) + 1 || 1;
  }

  document.querySelectorAll('.int-btn').forEach(b => {
    const intVal = +b.dataset.int;
    const cost = costs[intVal - 1];
    const unavail = cost > S.timeLeft;
    b.textContent = `${names[intVal - 1]} · ${cost}⏱`;
    b.disabled = unavail;
    b.classList.toggle('active', intVal === S.intensity);
    b.classList.toggle('unavail', unavail);
  });

  renderImpactPreview(proj);
}

function setIntensity(n) {
  if ([2, 4, 6][n - 1] > S.timeLeft) return;
  S.intensity = n;
  document.querySelectorAll('.int-btn').forEach(b => {
    b.classList.toggle('active', +b.dataset.int === n);
  });
  if (S.activeProject) renderImpactPreview(S.activeProject);
}

function calcImpactPreview(proj, intensity) {
  const mult    = [0.5, 1.1, 1.8][intensity - 1];
  const statVal = S.char[proj.statKey] || 1;
  const statMod = clamp(0.65 + (statVal - 1) * 0.12, 0.5, 1.8);
  let knowMod = 1.0;
  for (const kId of (proj.knowledgeBonus || [])) { if (hasKnowledge(kId)) knowMod += 0.15; }
  const finalMult = mult * statMod * knowMod;
  const preview = {};
  for (const [key, val] of Object.entries(proj.outputs || {})) {
    preview[key] = Math.round(val * (val < 0 ? mult : finalMult));
  }
  let effectiveRisk = proj.healthRisk;
  for (const [kId, reduction] of Object.entries(proj.riskReductions || {})) {
    if (hasKnowledge(kId)) effectiveRisk = Math.round(effectiveRisk * (1 - reduction));
  }
  return { preview, hasRisk: effectiveRisk > 0, riskReduced: effectiveRisk < proj.healthRisk };
}

function renderImpactPreview(proj) {
  const container = el('impact-preview');
  container.innerHTML = '';
  const { preview, hasRisk, riskReduced } = calcImpactPreview(proj, S.intensity);
  const labels = { food: '🍖 Aliment', wealth: '💰 Riquesa', health: '❤️ Salut', happiness: '😊 Felicitat', familyReputation: '🏛️ Reputació' };
  for (const [key, val] of Object.entries(preview)) {
    if (val === 0) continue;
    const row = document.createElement('div');
    row.className = 'preview-row';
    row.innerHTML = `<span>${labels[key] || key}</span><span class="preview-val ${val > 0 ? 'pos' : 'neg'}">${val > 0 ? '+' : ''}${val}</span>`;
    container.appendChild(row);
  }
  if (hasRisk) {
    const chances = ['15%', '30%', '55%'];
    const row = document.createElement('div');
    row.className = 'preview-row';
    const note = riskReduced ? ' ↓ eines' : '';
    row.innerHTML = `<span>⚠️ Risc lesió${note}</span><span class="preview-val risk">${chances[S.intensity - 1]}</span>`;
    container.appendChild(row);
  }
}

// ── Execute ───────────────────────────────────────────────────────────────────
function executeProject() {
  const proj = S.activeProject;
  S.phase = 'executing';
  renderAll();

  // Animate progress bar — double-rAF ensures transition applies after the 0% reset
  const fill = el('exec-progress-fill');
  const dur = 1000;
  requestAnimationFrame(() => {
    fill.style.transition = `width ${dur}ms linear`;
    requestAnimationFrame(() => { fill.style.width = '100%'; });
  });

  gameDelay(dur + 100, () => {
    const result = calcResult(proj);
    applyFx(result.fx);
    accumulateFloaters(result.fx);

    if (proj.id === 'hunt' && result.quality !== 'poor') S.char.huntCount++;
    if (proj.generatesPartner && result.quality !== 'poor' && !S.char.partner) S.char.partner = generatePartner();
    if (proj.generatesChild && result.quality !== 'poor' && S.char.partner) {
      const maxC = Math.max(1, Math.round(GAME_DATA.era.maxChildren.base + S.char.wealth * GAME_DATA.era.maxChildren.perWealthUnit));
      if (S.char.children.length < maxC) S.char.children.push(generateChild());
    }

    const timeCost = [2, 4, 6][S.intensity - 1];
    S.timeLeft = Math.max(0, S.timeLeft - timeCost);

    const discovered = tryDiscoverKnowledge(proj, result.finalMult);
    const event = tryTriggerEvent(proj, result.quality);
    if (discovered.length > 0) S.pendingDiscoveries.push(...discovered);
    if (event) S.pendingEvent = event;

    if (S.pendingDiscoveries.length > 0) {
      S.phase = 'discovery';
      renderAll();
    } else if (S.pendingEvent) {
      S.phase = 'event';
      renderAll();
    } else {
      afterNotifications();
    }
  });
}

// ── Discovery & notification helpers ─────────────────────────────────────────
function afterNotifications() {
  if (S.timeLeft > 0) {
    S.phase = 'select';
    renderAll();
    const floaters = S.pendingFloaters;
    S.pendingFloaters = {};
    requestAnimationFrame(() => showFxFloaters(floaters));
  } else {
    S.pendingFloaters = {};
    endCycle();
  }
}

function accumulateFloaters(fx) {
  for (const [k, v] of Object.entries(fx)) {
    if (typeof v === 'number') {
      S.pendingFloaters[k] = (S.pendingFloaters[k] || 0) + v;
    }
  }
}

function renderDiscoveryPane() {
  const k = S.pendingDiscoveries[0];
  el('disc-icon').textContent = k.icon;
  el('disc-name').textContent = k.name;
  el('disc-desc').textContent = k.description;

  const efxEl = el('disc-effects');
  efxEl.innerHTML = '';
  const statLabels = { health: '❤️ Salut', physical: '💪 Físic', intelligence: '🧠 Intel·ligència', social: '👥 Social' };
  for (const [stat, val] of Object.entries(k.statBonus || {})) {
    if (!val) continue;
    const div = document.createElement('div');
    div.className = 'fx-line';
    div.innerHTML = `<span>${statLabels[stat] || stat}</span><span class="fx-pos">+${val} permanent</span>`;
    efxEl.appendChild(div);
  }
  for (const projId of (k.unlocksProjectIds || [])) {
    const proj = getProject(projId);
    if (!proj) continue;
    const div = document.createElement('div');
    div.className = 'fx-line';
    div.innerHTML = `<span>🔓 Desbloqueja</span><span class="fx-pos">${proj.icon} ${proj.name}</span>`;
    efxEl.appendChild(div);
  }
}

function advanceFromDiscovery() {
  S.pendingDiscoveries.shift();
  if (S.pendingDiscoveries.length > 0) {
    renderAll();
  } else if (S.pendingEvent) {
    S.phase = 'event';
    renderAll();
  } else {
    afterNotifications();
  }
}

// ── Result pane ───────────────────────────────────────────────────────────────
function renderResultPane() {
  const { proj, result } = S.lastResult;
  el('result-proj-label').textContent = proj.icon + ' ' + proj.name;
  const barPct = result.quality === 'good' ? 80 : result.quality === 'ok' ? 50 : 20;
  el('result-score-fill').style.width = barPct + '%';
  el('result-narrative').textContent = result.narrative || '';

  const fxList = el('result-fx-list');
  fxList.innerHTML = '';
  const labels = { food: '🍖 Aliment', wealth: '💰 Riquesa', health: '❤️ Salut', happiness: '😊 Felicitat', familyReputation: '🏛️ Reputació' };
  for (const [key, val] of Object.entries(result.fx)) {
    if (key.startsWith('_gain_') || val === 0) continue;
    const label = labels[key] || key;
    const div = document.createElement('div');
    div.className = 'fx-line';
    const valSpan = document.createElement('span');
    valSpan.className = val > 0 ? 'fx-pos' : 'fx-neg';
    valSpan.textContent = (val > 0 ? '+' : '') + val;
    div.innerHTML = `<span>${label}</span>`;
    div.appendChild(valSpan);
    fxList.appendChild(div);
  }
  // Stat gains
  for (const [key, val] of Object.entries(result.fx)) {
    if (!key.startsWith('_gain_')) continue;
    const stat = key.slice(6);
    const statLabels = { physical: '💪 Físic', intelligence: '🧠 Intel', social: '👥 Social' };
    const div = document.createElement('div');
    div.className = 'fx-line';
    div.innerHTML = `<span>${statLabels[stat] || stat}</span><span class="fx-pos">+${val}</span>`;
    fxList.appendChild(div);
  }

  if (result.riskFailed) {
    const div = document.createElement('div');
    div.className = 'fx-line';
    div.innerHTML = `<span class="fx-neg">⚠️ Lesió durant l'activitat!</span>`;
    fxList.appendChild(div);
  }

  // Partner
  if (proj.generatesPartner && S.char.partner) {
    const div = document.createElement('div');
    div.className = 'fx-line';
    div.innerHTML = `<span>💑 Parella trobada: <strong>${S.char.partner.name}</strong></span>`;
    fxList.appendChild(div);
  }

  // Children
  if (proj.generatesChild && S.char.children.length > 0) {
    const last = S.char.children[S.char.children.length - 1];
    const div = document.createElement('div');
    div.className = 'fx-line';
    div.innerHTML = `<span>👶 Nou fill/a: <strong>${last.name}</strong></span>`;
    fxList.appendChild(div);
  }

  el('result-discoveries').innerHTML = '';

  const nextBtn = el('btn-next-cycle');
  const goNext = () => {
    if (S.pendingDiscoveries.length > 0) {
      S.phase = 'discovery'; renderAll();
    } else if (S.pendingEvent) {
      S.phase = 'event'; renderAll();
    } else if (S.timeLeft > 0) {
      S.phase = 'select'; renderAll();
    } else {
      endCycle();
    }
  };

  if (S.pendingDiscoveries.length > 0) {
    nextBtn.textContent = '✨ Descobriment! →';
  } else if (S.pendingEvent) {
    nextBtn.textContent = '⚡ Event! →';
  } else if (S.timeLeft > 0) {
    const n = Math.floor(S.timeLeft / 2);
    nextBtn.textContent = `Altra acció (${n} disp.) →`;
  } else {
    nextBtn.textContent = 'Cicle següent →';
  }
  nextBtn.onclick = goNext;
}

// ── Event pane ────────────────────────────────────────────────────────────────
function renderEventPane() {
  const ev = S.pendingEvent;
  el('ev-icon').textContent = ev.icon;
  el('ev-name').textContent = ev.name;
  el('ev-text').textContent = ev.text;

  const choices = el('ev-choices');
  choices.innerHTML = '';
  for (const opt of ev.options) {
    const locked = opt.requiresStat && S.char[Object.keys(opt.requiresStat)[0]] < Object.values(opt.requiresStat)[0];
    const btn = document.createElement('button');
    btn.className = 'ev-choice-btn';
    btn.innerHTML = `
      <span class="ev-choice-name">${opt.name}${locked ? ' 🔒' : ''}</span>
      <span class="ev-choice-desc">${opt.desc || ''}</span>
    `;
    btn.disabled = locked;
    btn.addEventListener('click', () => resolveEvent(ev, opt.id));
    choices.appendChild(btn);
  }
}

function resolveEvent(ev, optId) {
  const opt = ev.options.find(o => o.id === optId);
  if (!opt) return;

  let fx = {};
  let success = true;

  if (opt.successChance !== undefined) {
    const statKey = opt.requiresStat ? Object.keys(opt.requiresStat)[0] : null;
    const statBonus = statKey ? (S.char[statKey] - (opt.requiresStat[statKey] || 0)) * 0.04 : 0;
    success = Math.random() < Math.min(0.92, opt.successChance + statBonus);
    fx = success ? (opt.fx?.onSuccess || {}) : (opt.fx?.onFailure || {});
  } else {
    fx = opt.fx?.always || {};
  }

  applyFx(fx);
  accumulateFloaters(fx);
  renderStats();

  // Show brief result
  S.pendingEvent = null;
  S.phase = 'ev-result';

  const evr = el('pane-ev-result');
  ['pane-select','pane-sliders','pane-result','pane-event'].forEach(p => hide(p));
  show('pane-ev-result');

  el('evr-icon').textContent = success ? '✅' : '❌';
  el('evr-text').textContent = success ? `${opt.name}: èxit.` : `${opt.name}: ha fallat.`;
  const fxLines = Object.entries(fx).filter(([k]) => !k.startsWith('_gain_'));
  el('evr-fx').innerHTML = fxLines.map(([k, v]) => {
    const labels = { food: '🍖', wealth: '💰', health: '❤️', happiness: '😊', familyReputation: '🏛️' };
    return `<span class="${v > 0 ? 'fx-pos' : 'fx-neg'}">${labels[k] || k} ${v > 0 ? '+' : ''}${v}</span>`;
  }).join('  ');

  el('btn-dismiss-ev-result').onclick = afterNotifications;
}

// ── Succession overlay ────────────────────────────────────────────────────────
function renderSuccessionOverlay() {
  const last = S.genealogy[S.genealogy.length - 1];
  el('succ-death-msg').innerHTML = `
    <strong>${last.name}</strong> ha mort als <strong>${last.age} anys</strong>.<br>
    <em>${last.cause}.</em>
  `;

  const child = S.char.children[S.char.children.length - 1];
  el('succ-title').textContent = S.char.children.length > 1
    ? `El Llinatge Continua (${S.char.children.length} fills)`
    : 'El Llinatge Continua';

  const card = el('succ-child-card');
  card.innerHTML = `
    <span class="succ-child-avatar">${childAvatar(child)}</span>
    <span class="succ-child-name">${child.name}</span>
    <span class="succ-child-virtue">"${child.virtueLabel}"</span>
    <div class="succ-child-stats">
      <span>💪${child.physical}</span>
      <span>🧠${child.intelligence}</span>
      <span>👥${child.social}</span>
    </div>
    ${child.knowledgeIds.length > 0
      ? `<span class="succ-child-knowledge">Hereta: ${child.knowledgeIds.map(k => getKnowledge(k)?.icon || k).join(' ')}</span>`
      : ''}
  `;

  el('btn-succession').textContent = `Continua amb ${child.name} →`;
  el('btn-succession').onclick = () => doSuccession(child);
}

// ── Game Over overlay ─────────────────────────────────────────────────────────
function renderGameOverOverlay() {
  el('go-text').textContent = `${S.char.name} ha mort sense descendència. El llinatge s'extingeix.`;
  el('btn-go-end').onclick = () => {
    S.phase = 'end';
    renderAll();
  };
}

// ── End overlay ───────────────────────────────────────────────────────────────
function renderEndOverlay() {
  const score = calcScore();
  const title = dynastyTitle();

  if (!S.dynastyName) S.dynastyName = dynastyName(S.genealogy[0]?.name || S.char.name);

  el('end-dynasty').textContent = S.dynastyName;
  el('end-tagline').textContent = `"${title}"`;

  const grid = el('end-stats-grid');
  grid.innerHTML = `
    <div class="end-stat"><span>Generacions</span><span class="end-stat-val">${S.generation}</span></div>
    <div class="end-stat"><span>Riquesa màx.</span><span class="end-stat-val">${S.totalWealth}</span></div>
    <div class="end-stat"><span>Reputació</span><span class="end-stat-val">${Math.round(S.char.familyReputation)}</span></div>
    <div class="end-stat"><span>Coneixements</span><span class="end-stat-val">${S.char.knowledgeIds.length}/3</span></div>
  `;

  const msRow = el('end-milestones-row');
  msRow.innerHTML = '';
  for (const mId of S.milestones) {
    const m = GAME_DATA.milestones.find(x => x.id === mId);
    if (!m) continue;
    const badge = document.createElement('div');
    badge.className = 'end-milestone';
    badge.textContent = m.icon + ' ' + m.name;
    msRow.appendChild(badge);
  }

  const genList = el('end-genealogy-list');
  genList.innerHTML = '<strong style="font-size:0.75rem;color:var(--text-dim)">Llinatge:</strong>';
  for (const g of S.genealogy) {
    const div = document.createElement('div');
    div.className = 'gen-entry';
    div.innerHTML = `<span>Gen.${g.generation}</span><span class="gen-name">${g.name}</span><span>${g.age}a · ${g.cause}</span>`;
    genList.appendChild(div);
  }

  el('end-score-total').textContent = `🏆 ${score.toLocaleString()} pts`;
}

// ── Milestones overlay ────────────────────────────────────────────────────────
function renderMilestonesOverlay() {
  const list = el('milestones-list');
  list.innerHTML = '';
  for (const m of GAME_DATA.milestones) {
    const earned = S.milestones.includes(m.id);
    const row = document.createElement('div');
    row.className = 'milestone-row ' + (earned ? 'earned' : 'locked');
    row.innerHTML = `<span class="ms-icon">${earned ? m.icon : '⬜'}</span><span><strong>${m.name}</strong><br><small>${m.desc}</small></span>`;
    list.appendChild(row);
  }
  show('overlay-milestones');
}

// ── Event listeners ───────────────────────────────────────────────────────────
function bindEvents() {
  el('btn-new-game').addEventListener('click', startGame);
  el('btn-execute').addEventListener('click', executeProject);
  el('btn-back-sliders').addEventListener('click', () => {
    S.phase = 'select';
    renderAll();
    openZoneSheet(S.activeProject.zone);
  });

  // Intensity buttons
  el('intensity-selector').addEventListener('click', e => {
    const btn = e.target.closest('.int-btn');
    if (!btn) return;
    setIntensity(+btn.dataset.int);
  });

  el('btn-dismiss-discovery').addEventListener('click', advanceFromDiscovery);
  el('btn-dismiss-ev-result').addEventListener('click', () => afterNotifications());

  // Zone sheet
  el('btn-close-zone-sheet').addEventListener('click', () => hide('overlay-zone-actions'));
  el('overlay-zone-actions').addEventListener('click', e => {
    if (e.target === el('overlay-zone-actions')) hide('overlay-zone-actions');
  });

  el('btn-milestones').addEventListener('click', () => { renderMilestonesOverlay(); });
  el('btn-close-milestones').addEventListener('click', () => hide('overlay-milestones'));
  el('btn-restart').addEventListener('click', () => { hide('overlay-end'); startGame(); });
}

// ── Start ─────────────────────────────────────────────────────────────────────
function startGame() {
  initState();
  const gender = Math.random() > 0.5 ? 'M' : 'F';
  S.char.gender = gender;
  S.char.name = randomName(gender, '');
  S.dynastyName = dynastyName(S.char.name);
  S.phase = 'select';
  hide('overlay-menu');
  renderAll();
}

document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  // Menu is visible by default (no class="hidden" on it)
});
