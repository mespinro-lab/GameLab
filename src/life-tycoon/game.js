'use strict';

// ── Helpers ───────────────────────────────────────────────────────────────────
const lerp  = (a, b, t) => a + (b - a) * Math.max(0, Math.min(1, t));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const rand  = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick  = arr => arr[rand(0, arr.length - 1)];

function el(id) { return document.getElementById(id); }
function show(id) { el(id).classList.remove('hidden'); }
function hide(id) { el(id).classList.add('hidden'); }

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
    sliders: { physical: 3, intelligence: 2, social: 3, risk: 2 },
    activeProject: null,
    pendingEvent: null,
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
  const w = proj.sliderWeights;
  const s = S.sliders;

  // Base weighted score (0-1)
  let score = (
    s.physical    * (w.physical    || 0) +
    s.intelligence * (w.intelligence || 0) +
    s.social      * (w.social      || 0) +
    s.risk        * (w.risk        || 0)
  ) / 10;

  // Stat modifier
  const statMap = { physical: S.char.physical, intelligence: S.char.intelligence, social: S.char.social, risk: 1 };
  const dominantStat = statMap[proj.dominantSlider] || 1;
  const statMod = clamp(0.65 + (dominantStat - 1) * 0.12, 0.5, 1.8);

  // Knowledge bonus
  let knowMod = 1.0;
  for (const kId of (proj.knowledgeBonus || [])) {
    if (hasKnowledge(kId)) knowMod += 0.15;
  }

  let finalScore = clamp(score * statMod * knowMod, 0, 1);

  // Risk variance
  let riskTag = '';
  if (s.risk >= 5) {
    const failChance = (s.risk - 4) * 0.07;
    if (Math.random() < failChance) {
      riskTag = 'fail';
    } else if (s.risk >= 7) {
      riskTag = 'crit';
    }
  }

  // Build fx
  const fx = {};
  for (const [key, range] of Object.entries(proj.baseOutput || {})) {
    let val = Math.round(lerp(range.min, range.max, finalScore));
    if (riskTag === 'fail' && key === 'wealth') val = Math.round(val * 0.15);
    if (riskTag === 'fail' && key === 'health')  val = (val || 0) - 12;
    if (riskTag === 'crit' && key === 'wealth') val = Math.round(val * 1.8);
    fx[key] = val;
  }

  // Stat gains
  for (const [stat, gain] of Object.entries(proj.statGain || {})) {
    fx['_gain_' + stat] = gain;
  }

  const quality = finalScore > 0.65 ? 'good' : finalScore > 0.3 ? 'ok' : 'poor';
  const texts = quality === 'poor' ? proj.failTexts : proj.successTexts;
  const narrative = texts && texts.length ? pick(texts) : '';

  return { fx, score: finalScore, riskTag, quality, narrative };
}

function applyFx(fx) {
  const c = S.char;
  for (const [k, v] of Object.entries(fx)) {
    if (k.startsWith('_gain_')) {
      const stat = k.slice(6);
      c[stat] = +(c[stat] + v).toFixed(1);
    } else if (k === 'health') {
      c.health = clamp(c.health + v, 0, c.maxHealth);
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

  // Subsistence cost
  const cost = GAME_DATA.era.subsistenceCostPerCycle;
  S.char.wealth = Math.max(0, S.char.wealth - cost);
  if (S.char.wealth === 0) S.char.health = clamp(S.char.health - 8, 0, S.char.maxHealth);

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
  renderHealth();
  renderStats();
  renderScene();
  renderKnowledge();
  renderPartner();
  renderPhase();
}

function renderHeader() {
  el('hdr-name').textContent = S.char.name;
  el('hdr-age').textContent = `· ${S.char.age} anys`;
  el('hdr-gen').textContent = `Gen. ${S.generation}`;
  el('hdr-c').textContent = S.cycle;
  el('hdr-mc').textContent = S.maxCycles;
}

function renderHealth() {
  const pct = (S.char.health / S.char.maxHealth) * 100;
  const fill = el('health-bar-fill');
  fill.style.width = pct + '%';
  fill.style.background = pct > 50 ? '#27ae60' : pct > 25 ? '#e67e22' : '#e74c3c';
  el('health-val').textContent = Math.round(S.char.health);
}

function renderStats() {
  el('s-wealth').textContent = S.char.wealth;
  el('s-phys').textContent   = S.char.physical.toFixed(1);
  el('s-intel').textContent  = S.char.intelligence.toFixed(1);
  el('s-social').textContent = S.char.social.toFixed(1);
  el('s-hap').textContent    = Math.round(S.char.happiness);
  el('s-rep').textContent    = Math.round(S.char.familyReputation);
}

function renderScene() {
  const zoneMap = { home: 'zone-home', gather: 'zone-gather', hunt: 'zone-hunt' };
  Object.values(zoneMap).forEach(id => el(id).classList.remove('active'));

  let activeZone = null;
  if (S.phase === 'sliders' && S.activeProject) {
    activeZone = zoneMap[S.activeProject.zone];
  } else if (S.phase === 'result' && S.activeProject) {
    activeZone = zoneMap[S.activeProject.zone];
  }
  if (activeZone) el(activeZone).classList.add('active');
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
  const panes = ['pane-select','pane-sliders','pane-result','pane-event','pane-ev-result'];
  panes.forEach(p => hide(p));

  const overlays = ['overlay-succession','overlay-gameover','overlay-end','overlay-milestones'];
  overlays.forEach(o => hide(o));

  switch (S.phase) {
    case 'select':     renderSelectPane(); show('pane-select'); break;
    case 'sliders':    renderSlidersPane(); show('pane-sliders'); break;
    case 'result':     renderResultPane(); show('pane-result'); break;
    case 'event':      renderEventPane(); show('pane-event'); break;
    case 'succession': renderSuccessionOverlay(); show('overlay-succession'); break;
    case 'gameover':   renderGameOverOverlay(); show('overlay-gameover'); break;
    case 'end':        renderEndOverlay(); show('overlay-end'); break;
  }
}

// ── Select pane ───────────────────────────────────────────────────────────────
function renderSelectPane() {
  el('select-header').textContent = `Cicle ${S.cycle} — Escull una activitat`;
  const grid = el('projects-grid');
  grid.innerHTML = '';

  for (const proj of GAME_DATA.projects) {
    const unlocked = isProjectUnlocked(proj);
    const card = document.createElement('div');
    card.className = 'proj-card' + (unlocked ? '' : ' locked');

    const reason = unlocked ? '' : lockedReason(proj);
    card.innerHTML = `
      <span class="proj-icon">${proj.icon}</span>
      <span class="proj-name">${proj.name}</span>
      <span class="proj-desc">${proj.description}</span>
      ${reason ? `<span class="proj-req">${reason}</span>` : ''}
    `;

    if (unlocked) {
      card.addEventListener('click', () => selectProject(proj.id));
    }
    grid.appendChild(card);
  }
}

function selectProject(projId) {
  S.activeProject = getProject(projId);
  S.phase = 'sliders';
  renderAll();
}

// ── Sliders pane ──────────────────────────────────────────────────────────────
function renderSlidersPane() {
  const proj = S.activeProject;
  el('sl-proj-icon').textContent = proj.icon;
  el('sl-proj-name').textContent = proj.name;
  renderSliderValues();
}

function renderSliderValues() {
  const keys = ['physical', 'intelligence', 'social', 'risk'];
  const total = keys.reduce((s, k) => s + S.sliders[k], 0);
  const remaining = 10 - total;

  for (const k of keys) {
    el('slv-' + k).textContent = S.sliders[k];
  }
  el('sl-remaining').textContent = remaining;
  el('btn-execute').disabled = remaining !== 0;

  // Highlight dominant slider for active project
  const dominant = S.activeProject?.dominantSlider;
  keys.forEach(k => {
    const row = document.querySelector(`.slider-row:has(#slv-${k})`);
    if (row) row.style.borderColor = k === dominant ? 'var(--gold)' : '';
  });

  // Zone highlight based on highest slider
  const topSlider = keys.reduce((best, k) => S.sliders[k] > S.sliders[best] ? k : best, keys[0]);
  const zoneForSlider = { physical: 'zone-hunt', intelligence: 'zone-gather', social: 'zone-home', risk: 'zone-hunt' };
  ['zone-home','zone-gather','zone-hunt'].forEach(z => el(z).classList.remove('active'));
  el(zoneForSlider[topSlider] || 'zone-gather').classList.add('active');
}

function adjustSlider(key, dir) {
  const keys = ['physical','intelligence','social','risk'];
  const total = keys.reduce((s, k) => s + S.sliders[k], 0);
  const val = S.sliders[key];
  if (dir === 1 && total >= 10) return;
  if (dir === -1 && val <= 0) return;
  S.sliders[key] = val + dir;
  renderSliderValues();
}

// ── Execute ───────────────────────────────────────────────────────────────────
function executeProject() {
  const proj = S.activeProject;
  const result = calcResult(proj);
  applyFx(result.fx);

  // Track hunt count
  if (proj.id === 'hunt' && result.quality !== 'poor') S.char.huntCount++;

  // Generate partner
  if (proj.generatesPartner && result.quality !== 'poor' && !S.char.partner) {
    S.char.partner = generatePartner();
  }

  // Generate child
  if (proj.generatesChild && result.quality !== 'poor' && S.char.partner) {
    const maxC = Math.max(1, Math.round(GAME_DATA.era.maxChildren.base + S.char.wealth * GAME_DATA.era.maxChildren.perWealthUnit));
    if (S.char.children.length < maxC) {
      const child = generateChild();
      S.char.children.push(child);
    }
  }

  // Discover knowledge
  const discovered = tryDiscoverKnowledge(proj, result.score);

  S.lastResult = { proj, result, discovered };

  // Try event
  const event = tryTriggerEvent(proj, result.quality);
  if (event) {
    S.pendingEvent = event;
    S.phase = 'result';
  } else {
    S.phase = 'result';
  }

  renderAll();
}

// ── Result pane ───────────────────────────────────────────────────────────────
function renderResultPane() {
  const { proj, result, discovered } = S.lastResult;
  el('result-proj-label').textContent = proj.icon + ' ' + proj.name;
  el('result-score-fill').style.width = Math.round(result.score * 100) + '%';
  el('result-narrative').textContent = result.narrative || '';

  const fxList = el('result-fx-list');
  fxList.innerHTML = '';
  const labels = { wealth: '💰 Riquesa', health: '❤️ Salut', happiness: '😊 Felicitat', familyReputation: '🏛️ Reputació' };
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

  // Risk tag
  if (result.riskTag === 'fail') {
    const div = document.createElement('div');
    div.className = 'fx-line';
    div.innerHTML = `<span class="fx-neg">⚠️ Risc alt — resultat dolent</span>`;
    fxList.appendChild(div);
  } else if (result.riskTag === 'crit') {
    const div = document.createElement('div');
    div.className = 'fx-line';
    div.innerHTML = `<span class="fx-pos">🎯 Risc alt — resultat crític!</span>`;
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

  // Discoveries
  const discEl = el('result-discoveries');
  discEl.innerHTML = '';
  for (const k of discovered) {
    discEl.innerHTML += `✨ Has descobert: ${k.icon} <strong>${k.name}</strong>! `;
  }
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
  renderHealth();
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
    const labels = { wealth: '💰', health: '❤️', happiness: '😊', familyReputation: '🏛️' };
    return `<span class="${v > 0 ? 'fx-pos' : 'fx-neg'}">${labels[k] || k} ${v > 0 ? '+' : ''}${v}</span>`;
  }).join('  ');

  setTimeout(() => {
    endCycle();
  }, 1800);
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
  el('btn-back-sliders').addEventListener('click', () => { S.phase = 'select'; renderAll(); });
  el('btn-next-cycle').addEventListener('click', () => {
    if (S.pendingEvent) {
      S.phase = 'event';
      renderAll();
    } else {
      endCycle();
    }
  });
  el('btn-milestones').addEventListener('click', () => { renderMilestonesOverlay(); });
  el('btn-close-milestones').addEventListener('click', () => hide('overlay-milestones'));
  el('btn-restart').addEventListener('click', () => { hide('overlay-end'); startGame(); });

  // Slider +/- buttons (event delegation)
  document.getElementById('sliders-area').addEventListener('click', e => {
    const btn = e.target.closest('.sl-btn');
    if (!btn) return;
    adjustSlider(btn.dataset.sl, parseInt(btn.dataset.dir, 10));
  });
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
