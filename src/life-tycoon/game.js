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
      happiness: st.happiness,
      familyReputation: st.familyReputation,
      knowledgeIds: [],
      partner: null,
      children: [],
      huntCount: 0,
      learnedSkillIds: [],
      traitIds: [],
      teachSkillId: null,
      teachChildIndices: [],
      traitAgingResist: false,
      traitDiscoveryBonus: 0,
      traitStatGainBonus: 0,
      bornEraCycle: 0,
    },
    intensity: 2,
    timeTotal: GAME_DATA.era.timeTotal,
    timeLeft: GAME_DATA.era.timeTotal,
    eraCycle: 0,
    toolProgress: 0,
    activeProject: null,
    pendingEvent: null,
    pendingDiscoveries: [],
    pendingDeaths: [],
    pendingFloaters: {},
    lastResult: null,
    genealogy: [],
    milestones: [],
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
function getProject(id)   { return GAME_DATA.projects.find(p => p.id === id); }
function getKnowledge(id) { return GAME_DATA.knowledge.find(k => k.id === id); }
function getTrait(id)     { return GAME_DATA.traits.find(t => t.id === id); }
function getSkill(id)     { return GAME_DATA.learnedSkills.find(s => s.id === id); }
function hasKnowledge(id) { return S.char.knowledgeIds.includes(id); }
function hasSkill(id)     { return S.char.learnedSkillIds.includes(id); }

function generateTrait(statKey, exclude = null) {
  const pool = GAME_DATA.traits.filter(t => t.statKey === statKey && t.id !== exclude);
  if (pool.length > 0) return pick(pool).id;
  const fallback = GAME_DATA.traits.filter(t => t.id !== exclude);
  return fallback.length > 0 ? pick(fallback).id : pick(GAME_DATA.traits).id;
}

function applyTrait(traitId) {
  const t = getTrait(traitId);
  if (!t) return;
  const e = t.effect;
  if (e.maxHealth)      { S.char.maxHealth += e.maxHealth; }
  if (e.stat)           { S.char[e.stat] = +(S.char[e.stat] + e.value).toFixed(1); }
  if (e.agingResist)    { S.char.traitAgingResist = true; }
  if (e.discoveryBonus) { S.char.traitDiscoveryBonus = e.discoveryBonus; }
  if (e.statGainBonus)  { S.char.traitStatGainBonus = e.statGainBonus; }
}

function isProjectUnlocked(proj) {
  const r = proj.requirements || {};
  if (r.physical && S.char.physical < r.physical) return false;
  if (r.intelligence && S.char.intelligence < r.intelligence) return false;
  if (r.social && S.char.social < r.social) return false;
  if (r.health && S.char.health < r.health) return false;
  if (r.requiresPartner && !S.char.partner) return false;
  if (r.requiresChild && S.char.children.length === 0) return false;
  if (r.requiresLearnedSkill) {
    const teachable = S.char.learnedSkillIds.filter(sId =>
      S.char.children.some(c => (c.learnedSkillIds || []).length < 2 && !(c.learnedSkillIds || []).includes(sId))
    );
    if (teachable.length === 0) return false;
  }
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
  if (r.requiresChild && S.char.children.length === 0) return 'Necessites un fill';
  if (r.requiresLearnedSkill && S.char.learnedSkillIds.length === 0) return 'No tens habilitats per ensenyar';
  if (r.requiresLearnedSkill) return 'Els fills ja saben tot el que els pots ensenyar';
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

  // Tool progress from crafting
  if (proj.toolProgressGain) fx.toolProgress = S.intensity;

  // Skill/knowledge percentage bonuses — base captured before stacking
  const baseFoodGather = fx.food || 0;
  if (hasSkill('fishing')  && proj.id === 'gather')  fx.food = baseFoodGather + Math.round(baseFoodGather * 0.5);
  if (hasSkill('tracking') && (proj.id === 'hunt' || proj.id === 'explore')) {
    for (const k of Object.keys(fx)) { if (fx[k] > 0) fx[k] = Math.round(fx[k] * 1.2); }
  }
  // Stone tools: +30% gather food (knowledgeBonus already adds +15% mult on hunt/explore)
  if (hasKnowledge('stone_tools') && proj.id === 'gather') fx.food = (fx.food || 0) + Math.round(baseFoodGather * 0.3);

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

  const gainMult = 1 + (S.char.traitStatGainBonus || 0);
  for (const [stat, gain] of Object.entries(proj.statGain || {})) {
    fx['_gain_' + stat] = +(gain * gainMult).toFixed(2);
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
    } else if (k === 'toolProgress') {
      S.toolProgress += v;
    }
  }
}

// ── Floating numbers ──────────────────────────────────────────────────────────
function showFxFloaters(fx) {
  const fxMap  = { health: 'chip-health', food: 'chip-food', happiness: 's-hap', familyReputation: 's-rep' };
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
    const reqKnowledge = k.requires?.knowledgeIds || [];
    if (reqKnowledge.some(rId => !hasKnowledge(rId))) continue;
    if (Math.random() < k.discoveryChance + (S.char.traitDiscoveryBonus || 0)) {
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

function tryDiscoverSkill(proj, score) {
  const discovered = [];
  for (const sId of (proj.skillDiscovery || [])) {
    if (S.char.learnedSkillIds.length >= 2) break;
    if (hasSkill(sId)) continue;
    const s = getSkill(sId);
    if (!s || score < 0.3) continue;
    const reqKnowledge = s.requires?.knowledgeIds || [];
    if (reqKnowledge.some(kId => !hasKnowledge(kId))) continue;
    if (Math.random() < s.discoveryChance) {
      S.char.learnedSkillIds.push(sId);
      discovered.push({ ...s, _type: 'skill' });
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
  const usedNames = new Set([S.char.name, ...S.char.children.map(c => c.name)]);
  const pool = (gender === 'M' ? GAME_DATA.namesMasc : GAME_DATA.namesFem).filter(n => !usedNames.has(n));
  const name = pick(pool.length > 0 ? pool : (gender === 'M' ? GAME_DATA.namesMasc : GAME_DATA.namesFem));
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

  // Tret 1 (heretat): del pare si l'herència té èxit, si no, aleatori
  const parentTrait = getTrait(S.char.traitIds[0]);
  const inheritedTraitId = (parentTrait && Math.random() < parentTrait.inheritChance)
    ? parentTrait.id
    : generateTrait(pick(['physical', 'intelligence', 'social', 'balanced']));

  // Tret 2 (propi): del stat dominant del fill, sempre diferent del primer
  const ownTraitId = generateTrait(virtueKey, inheritedTraitId);

  return {
    name, gender, physical, intelligence, social, virtueLabel,
    knowledgeIds: inheritedKnowledge,
    learnedSkillIds: [],
    familyReputation: S.char.familyReputation,
    traitIds: [inheritedTraitId, ownTraitId],
    bornCycle: S.cycle,
    bornEraCycle: S.eraCycle,
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

// ── Tool progression ──────────────────────────────────────────────────────────
function checkToolUnlock() {
  for (const tier of (GAME_DATA.era.toolTiers || [])) {
    if (hasKnowledge(tier.knowledgeId)) continue;
    if (S.eraCycle < tier.earliest) continue;
    if (S.toolProgress >= tier.progressThreshold || S.eraCycle >= tier.auto) {
      S.char.knowledgeIds.push(tier.knowledgeId);
      const k = getKnowledge(tier.knowledgeId);
      if (k) S.pendingDiscoveries.push({ ...k, _type: 'technology' });
    }
  }
}

// ── Time total (grows with grown children) ────────────────────────────────────
function calcTimeTotal() {
  const grownCount = S.char.children.filter(c => S.cycle - (c.bornCycle || 0) >= 3).length;
  const grownBonus  = Math.min(grownCount, 2) * 2;
  const familyBonus = S.char.children.length >= 3 ? 2 : 0; // T5: large family unlocks 2nd action
  return GAME_DATA.era.timeTotal + grownBonus + familyBonus;
}

// ── End of cycle ──────────────────────────────────────────────────────────────
function endCycle() {
  S.char.age += 2;

  // Medicinal plants: % regen before food/aging checks
  if (hasSkill('medicinal_plants')) {
    const regen = Math.round(S.char.maxHealth * 0.05);
    S.char.health = clamp(S.char.health + regen, 0, S.char.maxHealth);
  }

  // Food cost: full time budget + 2 per child, reduced by cooking technology
  const baseFoodCost = Math.round(S.timeTotal * GAME_DATA.era.foodPerTimePoint) + S.char.children.length * 2;
  const foodCost   = hasKnowledge('cooking') ? Math.round(baseFoodCost * 0.8) : baseFoodCost;
  S.char.food = Math.max(0, S.char.food - foodCost);
  if (S.char.food === 0) {
    S.char.health = clamp(S.char.health - 8, 0, S.char.maxHealth);
    S.char.maxHealth = Math.max(30, S.char.maxHealth - 5);
    S.pendingDeaths.push({ _isFamine: true }); // always show famine notification
    if (S.char.children.length > 0) {
      const youngest = S.char.children.reduce((a, b) =>
        (b.bornCycle || 0) > (a.bornCycle || 0) ? b : a
      );
      S.char.children = S.char.children.filter(c => c !== youngest);
      S.char.familyReputation = clamp(S.char.familyReputation - 5, 0, 100);
      S.pendingDeaths.push(youngest);
    }
  }

  // Aging penalty (after 70% of max lifespan), reduced by traits/skills
  const agePct = S.char.age / GAME_DATA.era.lifeExpectancy.max;
  if (agePct > 0.7) {
    let ageLoss = Math.round(agePct * 3);
    if (S.char.traitAgingResist)          ageLoss = Math.round(ageLoss * 0.5);
    if (hasSkill('weaving'))              ageLoss = Math.round(ageLoss * 0.75);
    S.char.health = clamp(S.char.health - ageLoss, 0, S.char.maxHealth);
  }

  // Happiness drift
  S.char.happiness = clamp(S.char.happiness - 3, 20, 100);

  // Family reputation bonus for 2+ children
  if (S.char.children.length >= 2) S.char.familyReputation = clamp(S.char.familyReputation + 2, 0, 100);

  checkMilestones();

  if (S.char.health <= 0 || S.cycle >= S.maxCycles) {
    triggerDeath();
    return;
  }

  S.cycle++;
  S.eraCycle++;
  S.timeTotal = calcTimeTotal();
  S.timeLeft = S.timeTotal;
  checkToolUnlock();

  // Cycle bump animation (triggers after renderAll sets the new cycle number)
  requestAnimationFrame(() => {
    const hdrC = el('hdr-c');
    hdrC.classList.remove('cycle-bump');
    void hdrC.offsetWidth;
    hdrC.classList.add('cycle-bump');
  });

  if (S.pendingDeaths.length > 0) {
    showNextDeath();
  } else {
    S.phase = S.pendingDiscoveries.length > 0 ? 'discovery' : 'select';
    renderAll();
  }
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
    happiness: 60,
    familyReputation: child.familyReputation,
    knowledgeIds: [...new Set([
      ...child.knowledgeIds,
      ...S.char.knowledgeIds.filter(kId => { const k = getKnowledge(kId); return k?.inheritanceRate === 1.0; }),
    ])],
    partner: null,
    children: [],
    huntCount: 0,
    learnedSkillIds: child.learnedSkillIds || [],
    traitIds: child.traitIds || [],
    traitAgingResist: false,
    traitDiscoveryBonus: 0,
    traitStatGainBonus: 0,
    bornEraCycle: child.bornEraCycle || 0,
  };
  for (const tId of S.char.traitIds) applyTrait(tId);

  S.cycle = 1;
  S.timeTotal = GAME_DATA.era.timeTotal;
  S.timeLeft = S.timeTotal;
  S.maxCycles = GAME_DATA.era.cyclesPerLife.base + Math.round(S.char.physical * 0.3);
  S.phase = 'select';
  renderAll();
}

// ── Scoring ───────────────────────────────────────────────────────────────────
function calcScore() {
  let score = 0;
  score += S.generation * 400;
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
  if (m.includes('dynasty_founded') && m.includes('tribe_respected')) return 'Constructors d\'Imperis';
  if (m.includes('all_knowledge')) return 'La Línia dels Savis';
  if (m.includes('great_hunter')) return 'Guerrers de la Prehistòria';
  if (m.includes('family_complete')) return 'La Família Completa';
  return 'Fills de la Terra';
}

// ── Rendering ─────────────────────────────────────────────────────────────────
function renderAll() {
  renderHeader();
  renderStats();
  renderTraits();
  renderPartner();
  renderPhase();
}

function renderCycleForecast() {
  const baseProjected = Math.round(S.timeTotal * GAME_DATA.era.foodPerTimePoint) + S.char.children.length * 2;
  const projectedFood = hasKnowledge('cooking') ? Math.round(baseProjected * 0.8) : baseProjected;
  const agePct        = S.char.age / GAME_DATA.era.lifeExpectancy.max;
  const ageLoss       = agePct > 0.7 ? Math.round(agePct * 3) : 0;

  // Food — full-cycle cost + children upkeep, always visible
  const fcFood = el('fc-food');
  fcFood.textContent = `(-${projectedFood})`;
  fcFood.className = 'fc-delta' + (S.char.food - projectedFood < 15 ? ' danger' : '');

  // Happiness always -3
  el('fc-hap').textContent = '(-3)';
  el('fc-hap').className = 'fc-delta';

  // Health: only if aging penalty or starvation risk
  const fcHealth = el('fc-health');
  const willStarve = S.char.food - projectedFood <= 0;
  const totalHealthLoss = ageLoss + (willStarve ? 8 : 0);
  if (totalHealthLoss > 0) {
    fcHealth.textContent = `(-${totalHealthLoss})`;
    fcHealth.className = 'fc-delta danger';
    fcHealth.title = willStarve ? 'Fam: -8 salut i -5 salut màxima permanent' : 'Envelliment';
  } else {
    fcHealth.textContent = '';
    fcHealth.title = '';
  }
}

function renderHeader() {
  el('hdr-name').textContent = S.char.name;
  el('hdr-age').textContent = `· ${S.char.age} anys`;
  el('hdr-gen').textContent = `Gen. ${S.generation}`;
  el('hdr-c').textContent = S.cycle;
  el('hdr-mc').textContent = S.maxCycles;
  el('hdr-ec').textContent = S.eraCycle;
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

  el('s-hap').textContent    = Math.round(S.char.happiness);
  el('s-rep').textContent    = Math.round(S.char.familyReputation);
  el('s-phys').textContent   = S.char.physical.toFixed(1);
  el('s-intel').textContent  = S.char.intelligence.toFixed(1);
  el('s-social').textContent = S.char.social.toFixed(1);
  renderCycleForecast();
}

function showPillDetail(icon, name, desc, bonusLines) {
  el('pill-det-icon').textContent = icon;
  el('pill-det-name').textContent = name;
  el('pill-det-desc').textContent = desc;
  el('pill-det-bonus').innerHTML = bonusLines.map(l =>
    `<div class="fx-line"><span>${l}</span></div>`
  ).join('');
  show('overlay-pill');
}

function renderTraits() {
  const row = el('knowledge-row');
  row.innerHTML = '';
  for (const tId of S.char.traitIds) {
    const t = getTrait(tId);
    if (!t) continue;
    const pill = document.createElement('div');
    pill.className = 'trait-pill';
    pill.textContent = t.icon + ' ' + t.name;
    pill.onclick = () => {
      const lines = [];
      if (t.effect?.stat)            lines.push(`${t.effect.stat} +${t.effect.value}`);
      if (t.effect?.statGainBonus)   lines.push(`Guanys d'habilitats +${Math.round(t.effect.statGainBonus * 100)}%`);
      if (t.effect?.discoveryBonus)  lines.push(`Probabilitat descobriments +${Math.round(t.effect.discoveryBonus * 100)}%`);
      if (t.effect?.maxHealth)       lines.push(`Salut màxima +${t.effect.maxHealth}`);
      showPillDetail(t.icon, t.name, t.desc, lines);
    };
    row.appendChild(pill);
  }
  for (const sId of S.char.learnedSkillIds) {
    const s = getSkill(sId);
    if (!s) continue;
    const pill = document.createElement('div');
    pill.className = 'skill-pill';
    pill.textContent = s.icon + ' ' + s.name;
    pill.onclick = () => {
      const lines = s.transversal === false
        ? ['Era: Prehistòria · No es transfereix als cicles futurs']
        : s.transversal ? ['Habilitat transversal · Útil a totes les eres'] : [];
      showPillDetail(s.icon, s.name, s.effectDesc, lines);
    };
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
  const panes = ['pane-select','pane-sliders','pane-executing','pane-result','pane-discovery','pane-event','pane-ev-result','pane-teach'];
  panes.forEach(p => hide(p));

  const overlays = ['overlay-succession','overlay-gameover','overlay-end','overlay-milestones'];
  overlays.forEach(o => hide(o));

  switch (S.phase) {
    case 'select':     renderSelectPane(); show('pane-select'); break;
    case 'intensity':  renderIntensityPane(); show('pane-sliders'); break;
    case 'executing':  renderExecutingPane(); show('pane-executing'); break;
    case 'result':     renderResultPane();    show('pane-result');    break;
    case 'ev-result':  show('pane-ev-result'); break;
    case 'teach':      renderTeachPane();     show('pane-teach');     break;
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
  const showFamilyBonus = S.char.children.length >= 3 && S.timeLeft === S.timeTotal;
  const familyStr = showFamilyBonus ? ' · 👨‍👩‍👧‍👦 +2⏱' : '';
  el('select-header').textContent = `Cicle ${S.cycle}${timeStr}${familyStr} — On vas?`;

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
    const statIcons = { physical: '💪', intelligence: '🧠', social: '👥' };
    const gainParts = Object.entries(proj.statGain || {}).map(([s, v]) => `${statIcons[s] || s}+${v}`);
    const gainHtml  = gainParts.length > 0 ? `<span class="proj-stat-gain">${gainParts.join(' ')}</span>` : '';
    card.innerHTML = `
      <span class="proj-icon">${proj.icon}</span>
      <span class="proj-name">${proj.name}</span>
      <span class="proj-desc">${proj.description}</span>
      ${gainHtml}${riskHtml}${reqHtml}
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
  if (S.activeProject.teachesSkill) {
    S.char.teachSkillId = null;
    S.char.teachChildIndices = [];
    S.phase = 'teach';
  } else {
    S.phase = 'intensity';
  }
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
  const mults = { intensity: mult, stat: statMod, knowledge: knowMod, final: finalMult };
  const preview = {};
  for (const [key, val] of Object.entries(proj.outputs || {})) {
    preview[key] = Math.round(val * (val < 0 ? mult : finalMult));
  }
  // Percentage bonuses (mirrors calcResult) — base captured before stacking
  const flatBonuses = {};
  const baseFood = preview.food || 0;
  if (hasSkill('fishing') && proj.id === 'gather') {
    const b = Math.round(baseFood * 0.5);
    flatBonuses.food = (flatBonuses.food || 0) + b;
    preview.food = (preview.food || 0) + b;
  }
  if (hasKnowledge('stone_tools') && proj.id === 'gather') {
    const b = Math.round(baseFood * 0.3);
    flatBonuses.food = (flatBonuses.food || 0) + b;
    preview.food = (preview.food || 0) + b;
  }
  const hasTracking = hasSkill('tracking') && (proj.id === 'hunt' || proj.id === 'explore');
  let effectiveRisk = proj.healthRisk;
  for (const [kId, reduction] of Object.entries(proj.riskReductions || {})) {
    if (hasKnowledge(kId)) effectiveRisk = Math.round(effectiveRisk * (1 - reduction));
  }
  return { preview, flatBonuses, hasTracking, mults, hasRisk: effectiveRisk > 0, riskReduced: effectiveRisk < proj.healthRisk };
}

function renderImpactPreview(proj) {
  const container = el('impact-preview');
  container.innerHTML = '';
  const { preview, flatBonuses, hasTracking, mults, hasRisk, riskReduced } = calcImpactPreview(proj, S.intensity);
  const labels = { food: '🍖 Aliment', health: '❤️ Salut', happiness: '😊 Felicitat', familyReputation: '🏛️ Reputació' };
  for (const [key, val] of Object.entries(preview)) {
    if (val === 0) continue;
    const row = document.createElement('div');
    row.className = 'preview-row';
    const bonus = flatBonuses[key];
    const base  = val - (bonus || 0);
    const valStr = bonus
      ? `<span class="preview-val pos">+${base}</span> <span class="preview-bonus">+${bonus}</span>`
      : `<span class="preview-val ${val > 0 ? 'pos' : 'neg'}">${val > 0 ? '+' : ''}${val}</span>`;
    row.innerHTML = `<span>${labels[key] || key}</span>${valStr}`;
    container.appendChild(row);
  }
  if (hasTracking) {
    const row = document.createElement('div');
    row.className = 'preview-row';
    row.innerHTML = `<span>🐾 Rastre</span><span class="preview-bonus">+20% tot</span>`;
    container.appendChild(row);
  }
  if (proj.toolProgressGain) {
    const gain = S.intensity;
    const remaining = Math.max(0, (GAME_DATA.era.toolTiers?.[0]?.progressThreshold || 15) - S.toolProgress - gain);
    const row = document.createElement('div');
    row.className = 'preview-row';
    const suffix = hasKnowledge('stone_tools') ? '' : ` (${remaining} per desbloquejar)`;
    row.innerHTML = `<span>🪨 Progrés eines</span><span class="preview-val pos">+${gain}${suffix}</span>`;
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

  // U3: expandable multiplier detail
  const detailToggle = document.createElement('button');
  detailToggle.className = 'preview-detail-toggle';
  detailToggle.textContent = '⌄ Detall';
  const detailBox = document.createElement('div');
  detailBox.className = 'preview-detail hidden';
  const intNames = ['Suau ×0.5', 'Normal ×1.1', 'Intens ×1.8'];
  const statLabel = { physical: '💪 Físic', intelligence: '🧠 Intel·l.', social: '👥 Social' };
  detailBox.innerHTML = `
    <div class="detail-row"><span>Intensitat</span><span>${intNames[S.intensity - 1]}</span></div>
    <div class="detail-row"><span>${statLabel[proj.statKey] || proj.statKey} ${(S.char[proj.statKey] || 1).toFixed(1)}</span><span>×${mults.stat.toFixed(2)}</span></div>
    ${mults.knowledge > 1 ? `<div class="detail-row"><span>Coneixement</span><span>×${mults.knowledge.toFixed(2)}</span></div>` : ''}
    <div class="detail-row detail-total"><span>Multiplicador final</span><span>×${mults.final.toFixed(2)}</span></div>
  `;
  detailToggle.onclick = () => {
    const hidden = detailBox.classList.toggle('hidden');
    detailToggle.textContent = hidden ? '⌄ Detall' : '⌃ Tancar';
  };
  container.appendChild(detailToggle);
  container.appendChild(detailBox);
}

// ── Execute ───────────────────────────────────────────────────────────────────
function executeProject() {
  const proj = S.activeProject;
  const timeCostCheck = [2, 4, 6][S.intensity - 1];
  if (S.timeLeft < timeCostCheck) return;
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
      if (S.char.children.length < GAME_DATA.era.maxChildren) S.char.children.push(generateChild());
    }

    const timeCost = [2, 4, 6][S.intensity - 1];
    S.timeLeft = Math.max(0, S.timeLeft - timeCost);

    const discovered = [
      ...tryDiscoverKnowledge(proj, result.finalMult).map(k => ({ ...k, _type: 'knowledge' })),
      ...tryDiscoverSkill(proj, result.finalMult),
    ];
    const event = tryTriggerEvent(proj, result.quality);
    if (discovered.length > 0) S.pendingDiscoveries.push(...discovered);
    if (event) S.pendingEvent = event;

    S.lastResult = { proj, result };
    S.phase = 'result';
    renderAll();

    const floaters = S.pendingFloaters;
    S.pendingFloaters = {};
    requestAnimationFrame(() => showFxFloaters(floaters));
  });
}

// ── Teach pane ────────────────────────────────────────────────────────────────
function calcTeachCost(n) {
  let cost = 0;
  for (let i = 0; i < n; i++) cost += 2 + i;
  return cost;
}

function renderTeachPane() {
  const c = S.char;
  if (!c.teachChildIndices) c.teachChildIndices = [];
  const n = c.teachChildIndices.length;
  const cost = calcTeachCost(Math.max(1, n));
  const costBreakdown = n > 1
    ? Array.from({ length: n }, (_, i) => 2 + i).join('+') + ` = ${calcTeachCost(n)}`
    : n === 1 ? '2' : '2 per fill';
  el('teach-cost-label').textContent = `Cost: ${costBreakdown} · Temps: ${S.timeLeft}`;

  // Skill picker
  const skillList = el('teach-skill-list');
  skillList.innerHTML = '';
  for (const sId of c.learnedSkillIds) {
    const s = getSkill(sId);
    if (!s) continue;
    const teachable = c.children.some(ch => (ch.learnedSkillIds || []).length < 2 && !(ch.learnedSkillIds || []).includes(sId));
    if (!teachable) continue;
    const btn = document.createElement('button');
    btn.className = 'teach-skill-btn' + (c.teachSkillId === sId ? ' active' : '');
    btn.textContent = s.icon + ' ' + s.name + ' — ' + s.effectDesc;
    btn.onclick = () => { c.teachSkillId = sId; c.teachChildIndices = []; renderTeachPane(); };
    skillList.appendChild(btn);
  }

  // Child picker
  const childSection = el('teach-child-section');
  const childList = el('teach-child-list');
  childList.innerHTML = '';
  const eligibleChildren = c.children.filter(ch =>
    c.teachSkillId && (ch.learnedSkillIds || []).length < 2 && !(ch.learnedSkillIds || []).includes(c.teachSkillId)
  );

  if (!c.teachSkillId) {
    childSection.style.display = 'none';
  } else if (eligibleChildren.length === 1) {
    childSection.style.display = 'block';
    const ch0 = eligibleChildren[0];
    const idx0 = c.children.indexOf(ch0);
    if (!c.teachChildIndices.includes(idx0)) c.teachChildIndices = [idx0];
    const bornInfo0 = ch0.bornEraCycle != null ? ` · cicle era ${ch0.bornEraCycle}` : '';
    childList.innerHTML = `<p style="font-size:0.82rem;color:var(--text)">${childAvatar(ch0)} ${ch0.name}${bornInfo0} aprendrà l'habilitat.</p>`;
  } else {
    childSection.style.display = 'block';
    for (const child of eligibleChildren) {
      const idx = c.children.indexOf(child);
      const selected = c.teachChildIndices.includes(idx);
      const btn = document.createElement('button');
      btn.className = 'teach-child-btn' + (selected ? ' active' : '');
      const bornInfo = child.bornEraCycle != null ? ` · era ${child.bornEraCycle}` : '';
      btn.textContent = childAvatar(child) + ' ' + child.name + bornInfo;
      btn.onclick = () => {
        const i = c.teachChildIndices.indexOf(idx);
        if (i === -1) {
          const nextCost = calcTeachCost(c.teachChildIndices.length + 1);
          if (nextCost <= S.timeLeft) c.teachChildIndices.push(idx);
        } else {
          c.teachChildIndices.splice(i, 1);
        }
        renderTeachPane();
      };
      childList.appendChild(btn);
    }
  }

  const canTeach = c.teachSkillId !== null && c.teachChildIndices.length > 0 &&
    calcTeachCost(c.teachChildIndices.length) <= S.timeLeft;
  el('btn-confirm-teach').disabled = !canTeach;
}

function executeTeach() {
  const c = S.char;
  const indices = c.teachChildIndices || [];
  if (c.teachSkillId === null || indices.length === 0) return;
  const cost = calcTeachCost(indices.length);
  if (S.timeLeft < cost) return;

  for (const idx of indices) {
    const child = c.children[idx];
    if (!child) continue;
    if (!child.learnedSkillIds) child.learnedSkillIds = [];
    if (!child.learnedSkillIds.includes(c.teachSkillId)) {
      child.learnedSkillIds.push(c.teachSkillId);
    }
  }

  const n = indices.length;
  const fx = { happiness: 8 * n, familyReputation: 3, '_gain_social': 0.2, '_gain_intelligence': 0.1 };
  applyFx(fx);
  accumulateFloaters(fx);

  S.timeLeft = Math.max(0, S.timeLeft - cost);
  c.teachSkillId = null;
  c.teachChildIndices = [];

  afterNotifications();
}

// ── Discovery & notification helpers ─────────────────────────────────────────
function showNextDeath() {
  const item = S.pendingDeaths.shift();
  if (item._isFamine) {
    el('evr-icon').textContent = '🍖';
    el('evr-text').textContent = 'La fam arriba al campament. No hi ha prou menjar per a tothom.';
    el('evr-fx').innerHTML = `
      <div class="fx-line"><span>Salut</span><span class="fx-neg">-8</span></div>
      <div class="fx-line"><span>Salut màxima (permanent)</span><span class="fx-neg">-5</span></div>
    `;
  } else {
    el('evr-icon').textContent = childAvatar(item);
    el('evr-text').textContent = `${item.name} no ha sobreviscut a la fam. La família porta el dol.`;
    el('evr-fx').innerHTML = '<div class="fx-line"><span>Reputació familiar</span><span class="fx-neg">-5</span></div>';
  }
  S._showingDeath = true;
  S.phase = 'ev-result';
  renderAll();
}

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
  const noFloat = new Set(['toolProgress']);
  for (const [k, v] of Object.entries(fx)) {
    if (typeof v === 'number' && !noFloat.has(k)) {
      S.pendingFloaters[k] = (S.pendingFloaters[k] || 0) + v;
    }
  }
}

function renderDiscoveryPane() {
  const item = S.pendingDiscoveries[0];
  el('disc-icon').textContent = item.icon;
  el('disc-name').textContent = item.name;
  el('disc-desc').textContent = item.description;

  const isSkill = item._type === 'skill';
  el('disc-badge').textContent = isSkill ? '📚 Nova habilitat apresa' : '✨ Nova tecnologia descoberta';

  const efxEl = el('disc-effects');
  efxEl.innerHTML = '';

  if (isSkill) {
    const div = document.createElement('div');
    div.className = 'fx-line';
    div.innerHTML = `<span>Efecte</span><span class="fx-pos">${item.effectDesc}</span>`;
    efxEl.appendChild(div);
  } else {
    if (item.effectDesc) {
      const div = document.createElement('div');
      div.className = 'fx-line';
      div.innerHTML = `<span>Efecte</span><span class="fx-pos">${item.effectDesc}</span>`;
      efxEl.appendChild(div);
    }
    const statLabels = { health: '❤️ Salut', physical: '💪 Físic', intelligence: '🧠 Intel·ligència', social: '👥 Social' };
    for (const [stat, val] of Object.entries(item.statBonus || {})) {
      if (!val) continue;
      const div = document.createElement('div');
      div.className = 'fx-line';
      div.innerHTML = `<span>${statLabels[stat] || stat}</span><span class="fx-pos">+${val} permanent</span>`;
      efxEl.appendChild(div);
    }
    for (const projId of (item.unlocksProjectIds || [])) {
      const proj = getProject(projId);
      if (!proj) continue;
      const div = document.createElement('div');
      div.className = 'fx-line';
      div.innerHTML = `<span>🔓 Desbloqueja</span><span class="fx-pos">${proj.icon} ${proj.name}</span>`;
      efxEl.appendChild(div);
    }
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
  const labels = { food: '🍖 Aliment', health: '❤️ Salut', happiness: '😊 Felicitat', familyReputation: '🏛️ Reputació' };
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
    const labels = { food: '🍖', health: '❤️', happiness: '😊', familyReputation: '🏛️' };
    return `<span class="${v > 0 ? 'fx-pos' : 'fx-neg'}">${labels[k] || k} ${v > 0 ? '+' : ''}${v}</span>`;
  }).join('  ');

  el('btn-dismiss-ev-result').onclick = afterNotifications;
}

// ── Succession overlay ────────────────────────────────────────────────────────
function buildChildCard(child, showChooseBtn) {
  const skillsHtml = (child.learnedSkillIds || []).map(sId => {
    const s = getSkill(sId); return s ? `<span class="skill-pill">${s.icon} ${s.name}</span>` : '';
  }).join('');
  const knowHtml = child.knowledgeIds.length > 0
    ? `<span class="succ-child-knowledge">Tecnologia: ${child.knowledgeIds.map(k => getKnowledge(k)?.icon || k).join(' ')}</span>`
    : '';
  const card = document.createElement('div');
  card.className = 'succ-child-card';
  const bornLabel = child.bornEraCycle != null ? `Nascut/da al cicle d'era ${child.bornEraCycle}` : '';
  card.innerHTML = `
    <span class="succ-child-avatar">${childAvatar(child)}</span>
    <span class="succ-child-name">${child.name}</span>
    <span class="succ-child-virtue">"${child.virtueLabel}"</span>
    ${bornLabel ? `<span class="succ-child-born-era">${bornLabel}</span>` : ''}
    <div class="succ-child-stats">
      <span>💪${child.physical}</span>
      <span>🧠${child.intelligence}</span>
      <span>👥${child.social}</span>
    </div>
    <div class="succ-child-traits">
      ${(child.traitIds || []).map(id => { const t = getTrait(id); return t ? `<span class="trait-pill">${t.icon} ${t.name}</span>` : ''; }).join('')}
      ${skillsHtml}
    </div>
    ${knowHtml}
    ${showChooseBtn ? `<button class="btn-choose-child">Triar ${child.name} →</button>` : ''}
  `;
  if (showChooseBtn) {
    card.querySelector('.btn-choose-child').onclick = () => doSuccession(child);
  }
  return card;
}

function renderSuccessionOverlay() {
  const last = S.genealogy[S.genealogy.length - 1];
  el('succ-death-msg').innerHTML = `
    <strong>${last.name}</strong> ha mort als <strong>${last.age} anys</strong>.<br>
    <em>${last.cause}.</em>
  `;

  const children = S.char.children;
  const multi = children.length > 1;
  el('succ-title').textContent = multi
    ? `Tria el Successor (${children.length} fills)`
    : 'El Llinatge Continua';

  const list = el('succ-children-list');
  list.innerHTML = '';
  for (const child of children) {
    list.appendChild(buildChildCard(child, multi));
  }

  const btn = el('btn-succession');
  if (multi) {
    btn.classList.add('hidden');
  } else {
    btn.classList.remove('hidden');
    btn.textContent = `Continua amb ${children[0].name} →`;
    btn.onclick = () => doSuccession(children[0]);
  }
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
    <div class="end-stat"><span>Fills totals</span><span class="end-stat-val">${S.char.children.length}</span></div>
    <div class="end-stat"><span>Reputació</span><span class="end-stat-val">${Math.round(S.char.familyReputation)}</span></div>
    <div class="end-stat"><span>Coneixements</span><span class="end-stat-val">${S.char.knowledgeIds.length}/${GAME_DATA.knowledge.length}</span></div>
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

// ── Technology overlay ────────────────────────────────────────────────────────
function knowledgeEffectDesc(k) {
  const parts = [];
  if (k.effectDesc) parts.push(k.effectDesc);
  for (const [stat, val] of Object.entries(k.statBonus || {})) {
    const labels = { health: 'Salut', social: 'Social', physical: 'Físic', intelligence: 'Intel·ligència' };
    parts.push(`+${val} ${labels[stat] || stat}`);
  }
  for (const projId of (k.unlocksProjectIds || [])) {
    const p = getProject(projId);
    parts.push(`Desbloqueja "${p?.name || projId}"`);
  }
  for (const proj of GAME_DATA.projects) {
    if (proj.riskReductions?.[k.id]) {
      parts.push(`-${Math.round(proj.riskReductions[k.id] * 100)}% risc a ${proj.name}`);
    }
  }
  return parts.join(' · ') || k.description;
}

function renderTechOverlay() {
  const list = el('tech-list');
  list.innerHTML = '';
  if (S.char.knowledgeIds.length === 0) {
    list.innerHTML = '<p style="color:var(--text-dim);font-size:0.8rem;padding:0.5rem 0">Cap coneixement descobert encara.</p>';
  } else {
    for (const kId of S.char.knowledgeIds) {
      const k = getKnowledge(kId);
      if (!k) continue;
      const row = document.createElement('div');
      row.className = 'tech-row';
      row.innerHTML = `
        <span class="tech-icon">${k.icon}</span>
        <div class="tech-info">
          <strong>${k.name}</strong>
          <small>${knowledgeEffectDesc(k)}</small>
        </div>
      `;
      list.appendChild(row);
    }
  }

  // Tool progress for locked tiers
  for (const tier of (GAME_DATA.era.toolTiers || [])) {
    if (hasKnowledge(tier.knowledgeId)) continue;
    const pct = Math.min(100, Math.round(S.toolProgress / tier.progressThreshold * 100));
    const k = getKnowledge(tier.knowledgeId);
    const wrap = document.createElement('div');
    wrap.className = 'tech-progress-wrap';
    wrap.innerHTML = `
      <div class="tech-progress-label">${k ? k.icon + ' ' + k.name : tier.knowledgeId}: ${S.toolProgress}/${tier.progressThreshold}</div>
      <div class="tech-progress-bar"><div class="tech-progress-fill" style="width:${pct}%"></div></div>
      <div class="tech-progress-hint">Auto-desbloqueig al cicle d'era ${tier.auto}</div>
    `;
    list.appendChild(wrap);
  }

  show('overlay-tech');
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

  el('btn-back-teach').addEventListener('click', () => {
    S.phase = 'select'; renderAll();
    openZoneSheet(S.activeProject.zone);
  });
  el('btn-confirm-teach').addEventListener('click', executeTeach);
  el('btn-dismiss-discovery').addEventListener('click', advanceFromDiscovery);
  el('btn-dismiss-ev-result').addEventListener('click', () => {
    if (S._showingDeath) {
      S._showingDeath = false;
      if (S.pendingDeaths.length > 0) {
        showNextDeath();
      } else {
        S.phase = S.pendingDiscoveries.length > 0 ? 'discovery' : 'select';
        renderAll();
      }
    } else {
      afterNotifications();
    }
  });

  // Zone sheet
  el('btn-close-zone-sheet').addEventListener('click', () => hide('overlay-zone-actions'));
  el('overlay-zone-actions').addEventListener('click', e => {
    if (e.target === el('overlay-zone-actions')) hide('overlay-zone-actions');
  });

  el('btn-close-pill').addEventListener('click', () => hide('overlay-pill'));
  el('btn-milestones').addEventListener('click', () => { renderMilestonesOverlay(); });
  el('btn-close-milestones').addEventListener('click', () => hide('overlay-milestones'));
  el('btn-tech').addEventListener('click', () => { renderTechOverlay(); });
  el('btn-close-tech').addEventListener('click', () => hide('overlay-tech'));
  el('btn-restart').addEventListener('click', () => { hide('overlay-end'); startGame(); });
}

// ── Start ─────────────────────────────────────────────────────────────────────
function startGame() {
  initState();
  const gender = Math.random() > 0.5 ? 'M' : 'F';
  S.char.gender = gender;
  S.char.name = randomName(gender, '');
  S.dynastyName = dynastyName(S.char.name);
  // Primer personatge: 2 trets aleatoris de pools independents
  const t1 = generateTrait(pick(['physical', 'intelligence', 'social', 'balanced']));
  const t2 = generateTrait(pick(['physical', 'intelligence', 'social', 'balanced']), t1);
  S.char.traitIds = [t1, t2];
  applyTrait(t1);
  applyTrait(t2);
  S.phase = 'select';
  hide('overlay-menu');
  renderAll();
}

document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  // Menu is visible by default (no class="hidden" on it)
});
