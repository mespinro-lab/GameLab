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

// ── Save / Load ───────────────────────────────────────────────────────────────
const SAVE_KEY = 'lifetycoon_autosave';

function cleanStateForSave() {
  const keepPhase = ['succession', 'gameover'].includes(S.phase) ? S.phase : 'select';
  return { ...S, phase: keepPhase, pendingDeaths: [], pendingBirths: [],
    pendingDiscoveries: [], pendingEvent: null, pendingFloaters: {}, _showingDeath: false };
}

function updateContinueBtn() {
  el('btn-continue-game').disabled = !hasSave();
}

function saveGame() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(cleanStateForSave())); } catch(e) {}
}

function hasSave() {
  return !!localStorage.getItem(SAVE_KEY);
}

function loadSavedGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    S = JSON.parse(raw);
    hide('overlay-menu');
    renderAll();
    return true;
  } catch(e) { return false; }
}

function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

function exportSaveCode() {
  try { return btoa(encodeURIComponent(JSON.stringify(cleanStateForSave()))); } catch(e) { return null; }
}

function importSaveCode(code) {
  try {
    S = JSON.parse(decodeURIComponent(atob(code.trim())));
    saveGame();
    hide('overlay-save');
    hide('overlay-menu');
    renderAll();
    return true;
  } catch(e) { return false; }
}

// ── State ─────────────────────────────────────────────────────────────────────
let S = {};

function initState() {
  const startEra = GAME_DATA.eras[0];
  const st = startEra.startingStats;
  S = {
    phase: 'select',
    cycle: 1,
    maxCycles: startEra.cyclesPerLife.base,
    generation: 1,
    dynastyName: '',
    resources: Object.fromEntries(
      GAME_DATA.resources.map(r => [r.id, { value: r.initial, max: r.max, preserveBonus: 0 }])
    ),
    char: {
      name: '',
      gender: 'M',
      age: 15,
      physical: st.physical,
      intelligence: st.intelligence,
      social: st.social,
      knowledgeIds: [],
      partner: null,
      children: [],
      huntCount: 0,
      learnedSkillIds: [],
      traitIds: [],
      teachSkillId: null,
      teachChildIndices: [],
      traitAgingResist: 0,
      traitDiscoveryBonus: 0,
      traitStatGainBonus: 0,
      traitOutputBonuses: {},
      bornEraCycle: 0,
      statGained: { physical: 0, intelligence: 0, social: 0 },
    },
    intensity: 2,
    timeTotal: startEra.timeTotal,
    timeLeft: startEra.timeTotal,
    eraCycle: 0,
    actionMastery: {},
    activeProject: null,
    pendingEvent: null,
    pendingDiscoveries: [],
    discoveredZoneIds: [],
    unlockedSkillIds: [],
    pendingDeaths: [],
    pendingBirths: [],
    pendingFloaters: {},
    lastResult: null,
    genealogy: [],
    milestones: [],
    currentEraId: startEra.id,
    pendingEraTransition: null,
    _victoryEnding: false,
  };
}

// ── Name generation ───────────────────────────────────────────────────────────
function randomName(gender, exclude) {
  const pool = gender === 'M' ? GAME_DATA.namesMasc : GAME_DATA.namesFem;
  const filtered = pool.filter(n => n !== exclude);
  return pick(filtered);
}

function dynastyName(firstName) {
  return firstName + ' ' + pick(currentEra().dynastySuffixes);
}

// ── Project helpers ───────────────────────────────────────────────────────────
function getProject(id)   { return currentEra().actions.find(p => p.id === id); }
function getKnowledge(id) { return currentEra().techs.find(k => k.id === id); }
function getTrait(id)     { return GAME_DATA.traits.find(t => t.id === id); }
function getSkill(id)     { return currentEra().destreses.find(s => s.id === id); }
function hasKnowledge(id) { return S.char.knowledgeIds.includes(id); }
function hasSkill(id)     { return S.char.learnedSkillIds.includes(id); }

function getSkillGlobal(id) {
  for (const era of GAME_DATA.eras) {
    const s = era.destreses?.find(s => s.id === id);
    if (s) return s;
  }
  return null;
}
function skillEffectSum(effectKey) {
  return S.char.learnedSkillIds.reduce((total, sId) => {
    return total + (getSkillGlobal(sId)?.effect?.[effectKey] || 0);
  }, 0);
}

function currentEra() { return GAME_DATA.eras.find(e => e.id === S.currentEraId) || GAME_DATA.eras[0]; }

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
  if (e.maxHealth) { S.resources.health.max += e.maxHealth; }
  if (e.stat) {
    if (e.stat in S.resources) {
      S.resources[e.stat].value = clamp(S.resources[e.stat].value + e.value, 0, S.resources[e.stat].max);
    } else {
      S.char[e.stat] = +(S.char[e.stat] + e.value).toFixed(1);
    }
  }
  if (e.agingResistFactor) { S.char.traitAgingResist = e.agingResistFactor; }
  if (e.discoveryBonus) { S.char.traitDiscoveryBonus = e.discoveryBonus; }
  if (e.statGainBonus)  { S.char.traitStatGainBonus = e.statGainBonus; }
  if (e.outputBonusStat) {
    if (!S.char.traitOutputBonuses) S.char.traitOutputBonuses = {};
    const k = e.outputBonusStat;
    S.char.traitOutputBonuses[k] = (S.char.traitOutputBonuses[k] || 0) + e.outputBonusPct;
  }
}

function isProjectUnlocked(proj) {
  const r = proj.requirements || {};
  if (r.physical && S.char.physical < r.physical) return false;
  if (r.intelligence && S.char.intelligence < r.intelligence) return false;
  if (r.social && S.char.social < r.social) return false;
  if (r.health && S.resources.health.value < r.health) return false;
  if (r.requiresPartner && !S.char.partner) return false;
  if (r.requiresChild && S.char.children.length === 0) return false;
  if (proj.generatesChild && S.char.children.length >= (currentEra().maxChildren || 99)) return false;
  if (r.requiresLearnedSkill) {
    const teachable = S.char.learnedSkillIds.filter(sId =>
      S.char.children.some(c => (c.learnedSkillIds || []).length < 2 && !(c.learnedSkillIds || []).includes(sId))
    );
    if (teachable.length === 0) return false;
  }
  if (r.knowledgeIds) {
    for (const k of r.knowledgeIds) { if (!hasKnowledge(k)) return false; }
  }
  if (proj.requiresTech && !hasKnowledge(proj.requiresTech)) return false;
  if (proj.requiresSkill && !hasUnlockedSkill(proj.requiresSkill)) return false;
  if (proj.requiresNoPartner && S.char.partner) return false;
  return true;
}

function lockedReason(proj) {
  const r = proj.requirements || {};
  if (r.physical && S.char.physical < r.physical) return `Físic ${r.physical}+`;
  if (r.intelligence && S.char.intelligence < r.intelligence) return `Intel ${r.intelligence}+`;
  if (r.social && S.char.social < r.social) return `Social ${r.social}+`;
  if (r.health && S.resources.health.value < r.health) return `Salut ${r.health}+`;
  if (r.requiresPartner && !S.char.partner) return 'Necessites parella';
  if (r.requiresChild && S.char.children.length === 0) return 'Necessites un fill';
  if (proj.generatesChild && S.char.children.length >= (currentEra().maxChildren || 99)) return `Màxim de fills assolit (${currentEra().maxChildren})`;
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
  if (proj.requiresTech && !hasKnowledge(proj.requiresTech)) {
    const t = getKnowledge(proj.requiresTech);
    return `Necessites: ${t ? t.name : proj.requiresTech}`;
  }
  if (proj.requiresSkill && !hasUnlockedSkill(proj.requiresSkill)) {
    const sk = getGameSkill(proj.requiresSkill);
    return `Necessites habilitat: ${sk ? sk.name : proj.requiresSkill}`;
  }
  if (proj.requiresNoPartner && S.char.partner) return 'Ja tens parella';
  return '';
}

function blockedReason(proj) {
  const pct = S.cycle / S.maxCycles;
  if (proj.minCyclePct && pct < proj.minCyclePct) return '🌱 Massa jove per a aquesta acció';
  if (proj.maxCyclePct && pct > proj.maxCyclePct) return '🌿 Massa gran per a aquesta acció';
  if (proj.requiresMinHappiness && S.resources.happiness.value < proj.requiresMinHappiness)
    return `😔 Felicitat insuficient (cal ${proj.requiresMinHappiness}+)`;
  if (proj.requiresMinFamilyReputation && S.resources.familyReputation.value < proj.requiresMinFamilyReputation)
    return `🏛️ Reputació insuficient (cal ${proj.requiresMinFamilyReputation}+)`;
  return null;
}

// ── Formula ───────────────────────────────────────────────────────────────────
function calcResult(proj) {
  const M = currentEra().mechanics;
  const mult     = M.intensityOutputMults[S.intensity - 1];
  const riskMult = M.intensityRiskMults[S.intensity - 1];
  const statVal  = S.char[proj.statKey] || 1;
  const statMod  = clamp(M.statModBase + (statVal - 1) * M.statModPerStat, M.statModMin, M.statModMax);
  let knowMod = 1.0;
  for (const kId of (proj.knowledgeBonus || [])) { if (hasKnowledge(kId)) knowMod += M.knowledgeBonusPerTech; }
  const traitBonus = (S.char.traitOutputBonuses || {});
  const traitMult = 1 + (traitBonus[proj.statKey] || 0) + (traitBonus['all'] || 0);
  const masteryMult = 1 + getMasteryLevel(proj.id) * MASTERY_BONUS_LEVEL;
  const finalMult = mult * statMod * knowMod * traitMult * masteryMult;

  const fx = {};
  for (const [key, val] of Object.entries(proj.outputs || {})) {
    fx[key] = Math.round(val * (val < 0 ? mult : finalMult));
  }

  // Skill/knowledge percentage bonuses — base captured before stacking
  const baseFoodGather = fx.food || 0;
  const gatherPct = skillEffectSum('gatherFoodPct');
  if (gatherPct > 0 && proj.id === 'gather') fx.food = baseFoodGather + Math.round(baseFoodGather * gatherPct);
  const farmPct = skillEffectSum('farmFoodPct');
  if (farmPct > 0 && proj.zone === 'fields' && (fx.food || 0) > 0) fx.food = (fx.food || 0) + Math.round((fx.food || 0) * farmPct);
  const huntMult = 1 + skillEffectSum('huntMultBonus');
  if (huntMult > 1 && (proj.id === 'hunt' || proj.id === 'explore')) {
    for (const k of Object.keys(fx)) { if (fx[k] > 0) fx[k] = Math.round(fx[k] * huntMult); }
  }
  for (const [techId, bonus] of Object.entries(proj.techBonuses || {})) {
    if (hasKnowledge(techId) && bonus.foodPct) {
      fx.food = (fx.food || 0) + Math.round(baseFoodGather * bonus.foodPct);
    }
  }

  let riskFailed = false;
  if (proj.healthRisk > 0) {
    let effectiveRisk = proj.healthRisk;
    for (const [kId, reduction] of Object.entries(proj.riskReductions || {})) {
      if (hasKnowledge(kId)) effectiveRisk = Math.round(effectiveRisk * (1 - reduction));
    }
    const failChance = M.intensityFailChances[S.intensity - 1] / Math.max(1, statMod);
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
      const caps = currentEra().mechanics.statGainCaps || {};
      const cap = caps[stat] ?? Infinity;
      const gained = (c.statGained && c.statGained[stat]) || 0;
      const actual = Math.max(0, Math.min(v, cap - gained));
      if (actual > 0) {
        c[stat] = +(c[stat] + actual).toFixed(4);
        if (c.statGained) c.statGained[stat] = +(gained + actual).toFixed(4);
      }
    } else if (k === 'preserveFood') {
      const M = currentEra().mechanics;
      const maxBonus = M.maxFoodPreserve || 60;
      S.resources.food.preserveBonus = Math.min((S.resources.food.preserveBonus || 0) + v, maxBonus);
    } else if (k in S.resources) {
      const res = S.resources[k];
      if (k === 'familyReputation' && v > 0) {
        const repPct = skillEffectSum('familyRepPct');
        res.value = clamp(res.value + Math.round(v * (1 + repPct)), 0, res.max);
      } else if (k === 'food') {
        const foodMax = res.max + (res.preserveBonus || 0);
        res.value = clamp(res.value + v, 0, foodMax);
      } else {
        res.value = clamp(res.value + v, 0, res.max);
      }
    }
  }
}

// ── Floating numbers ──────────────────────────────────────────────────────────
function showFxFloaters(fx) {
  const fxMap  = { health: 'chip-health', food: 'chip-food', happiness: 'chip-happiness', familyReputation: 'chip-familyReputation' };
  const gainMap = { physical: 'chip-stat-physical', intelligence: 'chip-stat-intelligence', social: 'chip-stat-social' };
  for (const [k, v] of Object.entries(fx)) {
    if (v === 0) continue;
    const anchorId = k.startsWith('_gain_') ? gainMap[k.slice(6)] : fxMap[k];
    if (!anchorId) continue;
    const anchor = el(anchorId);
    if (!anchor || anchor.classList.contains('hidden')) continue;
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

// ── Destresa discovery (random) ───────────────────────────────────────────────
function tryDiscoverSkill(proj, score) {
  const M = currentEra().mechanics;
  const discovered = [];
  for (const sId of (proj.destreseDiscovery || [])) {
    if (S.char.learnedSkillIds.length >= M.maxLearnedSkills) break;
    if (hasSkill(sId)) continue;
    const s = getSkill(sId);
    if (!s || score < M.skillDiscoveryMinScore) continue;
    const reqTechs = s.requires?.techIds || [];
    if (reqTechs.some(tId => !hasKnowledge(tId))) continue;
    if (Math.random() < s.discoveryChance + (S.char.traitDiscoveryBonus || 0)) {
      S.char.learnedSkillIds.push(sId);
      discovered.push({ ...s, _type: 'skill' });
    }
  }
  return discovered;
}

// ── Action mastery (dynasty-level, persistent) ────────────────────────────────
const MASTERY_THRESHOLDS  = [5, 12, 25];
const MASTERY_BONUS_LEVEL = 0.20;

function getMasteryLevel(actionId) {
  const uses = (S.actionMastery || {})[actionId] || 0;
  let level = 0;
  for (const t of MASTERY_THRESHOLDS) { if (uses >= t) level++; }
  return level;
}
function getMasteryUses(actionId) { return (S.actionMastery || {})[actionId] || 0; }

// ── Milestones ────────────────────────────────────────────────────────────────
function earnMilestone(id) {
  if (!S.milestones.includes(id)) { S.milestones.push(id); return true; }
  return false;
}

function checkMilestones() {
  for (const m of GAME_DATA.milestones) {
    if (!m.check || S.milestones.includes(m.id)) continue;
    const { type, key, value } = m.check;
    if (type === 'char'     && S.char[key] >= value)                              earnMilestone(m.id);
    if (type === 'resource' && S.resources[key]?.value >= value)                  earnMilestone(m.id);
    if (type === 'family'   && S.char.partner && S.char.children.length >= value) earnMilestone(m.id);
  }
}

// ── Partner generation ────────────────────────────────────────────────────────
function generatePartner() {
  const M = currentEra().mechanics;
  const gender = S.char.gender === 'M' ? 'F' : 'M';
  const name = randomName(gender, S.char.name);
  const base = Math.max(1, Math.round(S.char.social / M.partnerStatDivisor));
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
    familyReputation: S.resources.familyReputation.value,
    traitIds: [inheritedTraitId, ownTraitId],
    bornCycle: S.cycle,
    bornEraCycle: S.eraCycle,
    bornEraId: S.pendingEraTransition || S.currentEraId,
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
  const M = currentEra().mechanics;
  if (quality === 'poor') return null;
  const pool = proj.eventPool || [];
  for (const eId of pool) {
    const ev = currentEra().events.find(e => e.id === eId);
    if (ev && Math.random() < M.eventTriggerChance) return ev;
  }
  if (S.cycle >= M.globalEventMinCycle && Math.random() < M.globalEventChance) {
    const globals = currentEra().globalEvents;
    const eId = pick(globals);
    return currentEra().events.find(e => e.id === eId) || null;
  }
  return null;
}

// ── Technology auto-unlock (worldwide, fixed era cycle) ───────────────────────
function checkTechUnlock() {
  for (const tech of currentEra().techs) {
    if (hasKnowledge(tech.id)) continue;
    if (S.eraCycle < tech.eraCycleAppears) continue;
    S.char.knowledgeIds.push(tech.id);
    for (const [stat, bonus] of Object.entries(tech.statBonus || {})) {
      if (stat === 'health') {
        S.resources.health.max += bonus;
        S.resources.health.value = clamp(S.resources.health.value + bonus, 0, S.resources.health.max);
      } else if (stat in S.resources) {
        S.resources[stat].value = clamp(S.resources[stat].value + bonus, 0, S.resources[stat].max);
      } else {
        S.char[stat] = +(S.char[stat] + bonus).toFixed(1);
      }
    }
    S.pendingDiscoveries.push({ ...tech, _type: 'technology' });
    if (tech.id === 'fire') earnMilestone('first_fire');
    if (tech.isGateTech && !S.pendingEraTransition) { S.pendingEraTransition = tech.nextEra; earnMilestone('era_transition'); }
    if (S.char.knowledgeIds.length >= currentEra().techs.length) earnMilestone('all_knowledge');
  }
  checkSkillUnlock();
  checkZoneDiscoveries();
}

// ── Skill unlock (optional, lineage-persistent, condition-based) ───────────────
function getGameSkill(id)    { return (currentEra().skills || []).find(s => s.id === id); }
function hasUnlockedSkill(id){ return S.unlockedSkillIds.includes(id); }

function checkSkillUnlock() {
  for (const skill of (currentEra().skills || [])) {
    if (hasUnlockedSkill(skill.id)) continue;
    if (skill.requiresTech && !hasKnowledge(skill.requiresTech)) continue;
    if (skill.requiresMinStat) {
      const unmet = Object.entries(skill.requiresMinStat).some(([k, v]) => (S.char[k] || 0) < v);
      if (unmet) continue;
    }
    S.unlockedSkillIds.push(skill.id);
    S.pendingDiscoveries.push({ ...skill, _type: 'habilitat' });
  }
}

// ── Zone discovery ────────────────────────────────────────────────────────────
function zoneHasAvailableAction(zoneId) {
  return currentEra().actions.some(p => p.zone === zoneId && isProjectUnlocked(p));
}

function initDiscoveredZones() {
  for (const zone of currentEra().zones) {
    if (!S.discoveredZoneIds.includes(zone.id) && zoneHasAvailableAction(zone.id)) {
      S.discoveredZoneIds.push(zone.id);
    }
  }
}

function checkZoneDiscoveries() {
  for (const zone of currentEra().zones) {
    if (S.discoveredZoneIds.includes(zone.id)) continue;
    if (zoneHasAvailableAction(zone.id)) {
      S.discoveredZoneIds.push(zone.id);
      S.pendingDiscoveries.push({ ...zone, _type: 'zone' });
    }
  }
}

// ── Time total ────────────────────────────────────────────────────────────────
function calcTimeTotal() {
  return currentEra().timeTotal;
}

// ── End of cycle ──────────────────────────────────────────────────────────────
function endCycle() {
  const M = currentEra().mechanics;
  S.char.age += 2;

  const healthRegenPct = skillEffectSum('healthRegenPct');
  if (healthRegenPct > 0) {
    const regen = Math.round(S.resources.health.max * healthRegenPct);
    S.resources.health.value = clamp(S.resources.health.value + regen, 0, S.resources.health.max);
  }

  // Food cost: full time budget + childrenFoodCost per child, reduced by cooking destresa
  const baseFoodCost = Math.round(S.timeTotal * currentEra().foodPerTimePoint) + S.char.children.length * M.childrenFoodCost;
  const cookingReduction = skillEffectSum('foodCostReduction');
  const foodCost = Math.round(baseFoodCost * (1 - cookingReduction));
  const shortfall = Math.max(0, foodCost - S.resources.food.value);
  S.resources.food.value = Math.max(0, S.resources.food.value - foodCost);

  if (shortfall > 0) {
    const shortfallPct = shortfall / foodCost;
    const familySize = 1 + S.char.children.length;
    const healthLoss = Math.max(2, Math.round((shortfall / familySize) * M.famineHealthMult * 1.5));
    S.resources.health.value = clamp(S.resources.health.value - healthLoss, 0, S.resources.health.max);

    if (shortfallPct >= M.famineModerate) {
      const maxLoss = shortfallPct >= M.famineSevere ? M.famineMaxLossSevere + 2 : M.famineMaxLossModerate + 1;
      S.resources.health.max = Math.max(M.healthMaxFloor, S.resources.health.max - maxLoss);
    }

    if (shortfallPct >= M.famineChildDeathRisk && S.char.children.length > 0) {
      const youngest = S.char.children.reduce((a, b) =>
        (b.bornCycle || 0) > (a.bornCycle || 0) ? b : a
      );
      S.char.children = S.char.children.filter(c => c !== youngest);
      S.resources.familyReputation.value = clamp(S.resources.familyReputation.value - 5, 0, 100);
      S.pendingDeaths.push(youngest);
    }

    S.pendingDeaths.push({ _isFamine: true, shortfallPct, healthLoss });
  }

  // Aging curve: cap pla fins al llindar, exponencial a partir d'aquí
  const ac = currentEra().agingCurve;
  if (S.cycle > ac.threshold) {
    let ageLoss = Math.round(ac.baseLoss * Math.pow(ac.acceleration, S.cycle - ac.threshold - 1));
    if (S.char.traitAgingResist) ageLoss = Math.round(ageLoss * S.char.traitAgingResist);
    const agingReduction = skillEffectSum('agingDamageReduction');
    if (agingReduction > 0) ageLoss = Math.round(ageLoss * (1 - agingReduction));
    S.resources.health.value = clamp(S.resources.health.value - ageLoss, 0, S.resources.health.max);
  }

  // Preservation bonus decay
  if (S.resources.food.preserveBonus > 0) {
    S.resources.food.preserveBonus = Math.max(0, S.resources.food.preserveBonus - (M.preserveDecay || 8));
    const foodMax = S.resources.food.max + S.resources.food.preserveBonus;
    S.resources.food.value = Math.min(S.resources.food.value, foodMax);
  }

  // Happiness drift
  S.resources.happiness.value = clamp(S.resources.happiness.value + M.happinessDrift, M.happinessMin, 100);

  const happinessBonus = skillEffectSum('happinessCycleBonus');
  if (happinessBonus > 0) S.resources.happiness.value = clamp(S.resources.happiness.value + happinessBonus, 0, 100);

  // Family reputation bonus for 2+ children
  if (S.char.children.length >= 2) S.resources.familyReputation.value = clamp(S.resources.familyReputation.value + M.familyRepBonus, 0, 100);

  checkMilestones();

  if (S.resources.health.value <= 0 || S.cycle >= S.maxCycles) {
    triggerDeath();
    return;
  }

  S.cycle++;
  S.eraCycle++;
  S.timeTotal = calcTimeTotal();
  S.timeLeft = S.timeTotal;
  checkTechUnlock();
  checkSkillUnlock();
  saveGame();

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
  S.resources.health.value = 0;

  S.genealogy.push({
    name: S.char.name,
    gender: S.char.gender,
    age: S.char.age,
    generation: S.generation,
    era: currentEra().name,
    cause: S.cycle >= S.maxCycles ? 'Mort natural' : 'Salut esgotada',
    knowledgeIds: [...S.char.knowledgeIds],
  });

  S.phase = S.char.children.length > 0 ? 'succession' : 'gameover';
  saveGame();
  hide('overlay-zone-actions');
  renderMenuEra();
  updateContinueBtn();
  show('overlay-menu');
}

// ── Succession ────────────────────────────────────────────────────────────────
function doSuccession(child) {
  S.generation++;
  earnMilestone('dynasty_founded');

  S.resources = Object.fromEntries(
    GAME_DATA.resources.map(r => [r.id, { value: r.initial, max: r.max, preserveBonus: 0 }])
  );
  S.resources.familyReputation.value = child.familyReputation;

  S.char = {
    name: child.name,
    gender: child.gender,
    age: 15,
    physical:     child.physical,
    intelligence: child.intelligence,
    social:       child.social,
    knowledgeIds: [...new Set([
      ...child.knowledgeIds,
      ...S.char.knowledgeIds.filter(kId => { const k = getKnowledge(kId); return k?.inheritanceRate === 1.0; }),
    ])],
    partner: null,
    children: [],
    huntCount: 0,
    learnedSkillIds: child.learnedSkillIds || [],
    traitIds: child.traitIds || [],
    traitAgingResist: 0,
    traitDiscoveryBonus: 0,
    traitStatGainBonus: 0,
    traitOutputBonuses: {},
    bornEraCycle: child.bornEraCycle || 0,
    statGained: { physical: 0, intelligence: 0, social: 0 },
  };
  for (const tId of S.char.traitIds) applyTrait(tId);

  S.cycle = 1;
  S.eraCycle = child.bornEraCycle || 0;
  S.pendingDeaths = [];
  S.pendingBirths = [];
  S._showingDeath = false;
  S.pendingDiscoveries = [];
  S.pendingEvent = null;
  if (child.bornEraId && child.bornEraId !== S.currentEraId) {
    const newEra = GAME_DATA.eras.find(e => e.id === child.bornEraId);
    if (newEra) {
      transitionEra(child.bornEraId);
      S.timeTotal = currentEra().timeTotal;
      S.timeLeft  = S.timeTotal;
      S.maxCycles = currentEra().cyclesPerLife.base + Math.round(S.char.physical * currentEra().mechanics.successionPhysicalFactor);
      S.phase = S.pendingDiscoveries.length > 0 ? 'discovery' : 'select';
      saveGame();
      hide('overlay-succession');
      renderMenuEra();
      updateContinueBtn();
      renderEraTransitionOverlay(newEra);
      show('overlay-era-transition');
      return;
    } else {
      S._victoryEnding = true;
      S.phase = 'end';
      saveGame();
      hide('overlay-succession');
      renderEndOverlay();
      show('overlay-end');
      return;
    }
  } else {
    checkZoneDiscoveries();
  }
  S.timeTotal = currentEra().timeTotal;
  S.timeLeft = S.timeTotal;
  S.maxCycles = currentEra().cyclesPerLife.base + Math.round(S.char.physical * currentEra().mechanics.successionPhysicalFactor);
  S.phase = S.pendingDiscoveries.length > 0 ? 'discovery' : 'select';
  saveGame();
  hide('overlay-succession');
  renderMenuEra();
  updateContinueBtn();
  show('overlay-menu');
}

function renderEraTransitionOverlay(era) {
  el('era-transition-icon').textContent = era.icon;
  el('era-transition-name').textContent = era.name;

  const trans = era.transition || {};
  const quoteWrap = el('era-trans-quote-wrap');
  if (trans.quote) {
    el('era-trans-quote').textContent = `"${trans.quote}"`;
    el('era-trans-attribution').textContent = trans.attribution || '';
    quoteWrap.classList.remove('hidden');
  } else {
    quoteWrap.classList.add('hidden');
  }
  const descEl = el('era-trans-desc');
  if (trans.desc) {
    descEl.textContent = trans.desc;
    descEl.classList.remove('hidden');
  } else {
    descEl.classList.add('hidden');
  }

  const M = era.mechanics;
  const gameplay = el('era-trans-gameplay');
  gameplay.innerHTML = '';
  const zoneNames = (era.zones || []).map(z => `${z.icon} ${z.name}`).join('  ');
  if (zoneNames) addGameplayRow(gameplay, 'Zones', zoneNames);
  const caps = M.statGainCaps || {};
  const capParts = [];
  if (caps.physical    !== undefined) capParts.push(`💪 màx ${caps.physical}`);
  if (caps.intelligence !== undefined) capParts.push(`🧠 màx ${caps.intelligence}`);
  if (caps.social      !== undefined) capParts.push(`👥 màx ${caps.social}`);
  if (capParts.length) addGameplayRow(gameplay, 'Límit d\'atributs', capParts.join(' · '));
  if (M.maxLearnedSkills) addGameplayRow(gameplay, 'Habilitats', `màx ${M.maxLearnedSkills} per personatge`);
  addGameplayRow(gameplay, 'Esperança de vida', `${era.lifeExpectancy.base}–${era.lifeExpectancy.max} anys`);
}

function addGameplayRow(container, label, value) {
  const row = document.createElement('div');
  row.className = 'era-trans-row';
  row.innerHTML = `<span class="era-trans-row-label">${label}</span><span class="era-trans-row-val">${value}</span>`;
  container.appendChild(row);
}

function transitionEra(newEraId) {
  S.currentEraId = newEraId;
  S.eraCycle = 0;
  S.pendingEraTransition = null;
  S.discoveredZoneIds = [];
  S.unlockedSkillIds = [];
  checkSkillUnlock();
  checkZoneDiscoveries();
}

// ── Scoring ───────────────────────────────────────────────────────────────────
function calcScore() {
  const era = currentEra() || GAME_DATA.eras[GAME_DATA.eras.length - 1];
  const M = era.mechanics;
  let score = 0;
  score += S.generation * M.scorePerGeneration;
  score += S.resources.familyReputation.value * M.scorePerRep;
  score += S.char.knowledgeIds.length * M.scorePerKnowledge;
  for (const mId of S.milestones) {
    const m = GAME_DATA.milestones.find(x => x.id === mId);
    if (m) score += m.points;
  }
  if (S._victoryEnding) score += 10000;
  return Math.round(score);
}

function dynastyTitle() {
  const m = S.milestones;
  for (const t of GAME_DATA.dynastyTitles) {
    if (t.default) return t.label;
    if (t.minMilestones && m.length >= t.minMilestones) return t.label;
    if (t.requires && t.requires.every(id => m.includes(id))) return t.label;
  }
  return '';
}

function renderStatChips() {
  const vitalContainer    = el('stats-vital');
  const resourceContainer = el('stats-resources');
  vitalContainer.innerHTML = '';
  if (resourceContainer) resourceContainer.innerHTML = '';
  for (const res of GAME_DATA.resources) {
    const chip = document.createElement('div');
    chip.className = 'stat-chip hidden';
    chip.id = 'chip-' + res.id;
    const span = document.createElement('span');
    span.id = 's-' + res.id;
    span.textContent = '0';
    chip.textContent = res.icon + ' ';
    chip.appendChild(span);
    if (res.isResource) {
      const maxSpan = document.createElement('small');
      maxSpan.id = 'max-' + res.id;
      maxSpan.className = 'res-max';
      chip.appendChild(maxSpan);
    }
    if (res.hasForecast) {
      const fc = document.createElement('small');
      fc.id = 'fc-' + res.id;
      fc.className = 'fc-delta';
      chip.appendChild(fc);
    }
    const target = (res.isResource && resourceContainer) ? resourceContainer : vitalContainer;
    target.appendChild(chip);
  }

  const skillsContainer = el('stats-skills');
  skillsContainer.innerHTML = '';
  for (const stat of GAME_DATA.charStats) {
    const chip = document.createElement('div');
    chip.className = 'stat-chip hidden';
    chip.id = 'chip-stat-' + stat.id;
    const span = document.createElement('span');
    span.id = 's-' + stat.id;
    span.textContent = '1';
    chip.textContent = stat.icon;
    chip.appendChild(span);
    skillsContainer.appendChild(chip);
  }
}

function renderMenuEra() {
  const era = currentEra() || GAME_DATA.eras[0];
  const icon = el('menu-era-icon');
  const badge = el('menu-era-badge');
  if (icon) icon.textContent = era.icon;
  if (badge) {
    badge.textContent = era.name;
    badge.classList.toggle('hidden', !hasSave());
  }
}

// ── Rendering ─────────────────────────────────────────────────────────────────
function syncStatVisibility() {
  for (const res of GAME_DATA.resources) {
    const chip = el('chip-' + res.id);
    if (!chip) continue;
    chip.classList.toggle('hidden', !(!res.visibleAfterTech || hasKnowledge(res.visibleAfterTech)));
  }
  for (const stat of GAME_DATA.charStats) {
    const chip = el('chip-stat-' + stat.id);
    if (!chip) continue;
    chip.classList.toggle('hidden', !(!stat.visibleAfterTech || hasKnowledge(stat.visibleAfterTech)));
  }
  // Progressive UI: hide header elements and buttons until relevant progress
  const hasTechs = S.char.knowledgeIds.length > 0;
  const hasMilestones = S.milestones.length > 0;
  const btnTech = el('btn-tech');
  const btnMilestones = el('btn-milestones');
  const hdrEraCycle = el('hdr-era-cycle');
  if (btnTech) btnTech.classList.toggle('hidden', !hasTechs);
  if (btnMilestones) btnMilestones.classList.toggle('hidden', !hasMilestones);
  if (hdrEraCycle) hdrEraCycle.classList.toggle('hidden', S.eraCycle === 0);
}

function renderAll() {
  renderHeader();
  renderStats();
  syncStatVisibility();
  renderTraits();
  renderPartner();
  renderPhase();
}

function renderCycleForecast() {
  const M = currentEra().mechanics;
  const baseProjected = Math.round(S.timeTotal * currentEra().foodPerTimePoint) + S.char.children.length * M.childrenFoodCost;
  const cookingReduction = skillEffectSum('foodCostReduction');
  const projectedFood = Math.round(baseProjected * (1 - cookingReduction));

  const ac = currentEra().agingCurve;
  const ageLoss = S.cycle > ac.threshold
    ? Math.round(ac.baseLoss * Math.pow(ac.acceleration, S.cycle - ac.threshold - 1))
    : 0;
  let displayAgeLoss = ageLoss;
  if (S.char.traitAgingResist) displayAgeLoss = Math.round(displayAgeLoss * S.char.traitAgingResist);
  const agingReduction = skillEffectSum('agingDamageReduction');
  if (agingReduction > 0) displayAgeLoss = Math.round(displayAgeLoss * (1 - agingReduction));

  const fcFood = el('fc-food');
  fcFood.textContent = `(-${projectedFood})`;
  fcFood.className = 'fc-delta' + (S.resources.food.value - projectedFood < 15 ? ' danger' : '');

  const artBonus = skillEffectSum('happinessCycleBonus');
  const hapDelta = M.happinessDrift + artBonus;
  const fcHap = el('fc-happiness');
  fcHap.textContent = hapDelta === 0 ? '(=)' : `(${hapDelta > 0 ? '+' : ''}${hapDelta})`;
  fcHap.className = 'fc-delta' + (hapDelta > 0 ? ' pos' : '');

  const fcHealth = el('fc-health');
  const foodAfter = S.resources.food.value - projectedFood;
  const shortfallAmt = foodAfter < 0 ? -foodAfter : 0;
  const shortfallHealthLoss = shortfallAmt > 0
    ? Math.max(1, Math.round((shortfallAmt / (1 + S.char.children.length)) * M.famineHealthMult))
    : 0;
  const totalHealthLoss = displayAgeLoss + shortfallHealthLoss;
  if (totalHealthLoss > 0) {
    fcHealth.textContent = `(-${totalHealthLoss})`;
    fcHealth.className = 'fc-delta danger';
    const reasons = [];
    if (displayAgeLoss > 0) reasons.push(`Envelliment -${displayAgeLoss}`);
    if (shortfallHealthLoss > 0) reasons.push(`Fam est. -${shortfallHealthLoss}`);
    fcHealth.title = reasons.join(' · ');
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
  el('hdr-ec').textContent = S.eraCycle + 1;
}

function renderStats() {
  const hp = S.resources.health.value;
  el('s-health').textContent = Math.round(hp);
  el('chip-health').classList.toggle('low',      hp < 40 && hp >= 20);
  el('chip-health').classList.toggle('critical', hp < 20);

  const food = S.resources.food.value;
  el('s-food').textContent = Math.round(food);
  const maxFoodEl = el('max-food');
  if (maxFoodEl) maxFoodEl.textContent = '/' + (S.resources.food.max + (S.resources.food.preserveBonus || 0));
  el('chip-food').classList.toggle('low',      food < 30 && food >= 15);
  el('chip-food').classList.toggle('critical', food < 15);

  el('s-happiness').textContent        = Math.round(S.resources.happiness.value);
  el('s-familyReputation').textContent = Math.round(S.resources.familyReputation.value);
  el('s-physical').textContent         = S.char.physical.toFixed(1);
  el('s-intelligence').textContent     = S.char.intelligence.toFixed(1);
  el('s-social').textContent           = S.char.social.toFixed(1);
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
    const s = getSkillGlobal(sId);
    if (!s) continue;
    const pill = document.createElement('div');
    pill.className = 'skill-pill';
    pill.textContent = s.icon + ' ' + s.name;
    pill.onclick = () => {
      const skillEra = GAME_DATA.eras.find(e => e.destreses?.some(d => d.id === sId));
      const lines = s.transversal === false
        ? [`Era: ${skillEra?.name || '?'} · No es transfereix als cicles futurs`]
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
    const fills = S.char.children.length;
    el('partner-label').textContent = `💑 ${S.char.partner.name} · ${fills} fill${fills !== 1 ? 's' : ''}`;
  } else {
    row.classList.add('hidden');
  }
}

function renderPhase() {
  const panes = ['pane-select','pane-sliders','pane-executing','pane-result','pane-birth','pane-discovery','pane-event','pane-ev-result','pane-teach'];
  panes.forEach(p => hide(p));

  const overlays = ['overlay-succession','overlay-gameover','overlay-end','overlay-milestones'];
  overlays.forEach(o => hide(o));

  switch (S.phase) {
    case 'select':     renderSelectPane(); show('pane-select'); break;
    case 'intensity':  renderIntensityPane(); show('pane-sliders'); break;
    case 'executing':  renderExecutingPane(); show('pane-executing'); break;
    case 'result':     renderResultPane();    show('pane-result');    break;
    case 'birth':      renderBirthPane();     show('pane-birth');     break;
    case 'ev-result':  show('pane-ev-result'); break;
    case 'teach':      renderTeachPane();     show('pane-teach');     break;
    case 'discovery':  renderDiscoveryPane(); show('pane-discovery'); break;
    case 'event':      renderEventPane(); show('pane-event'); break;
    case 'succession': renderSuccessionOverlay(); show('overlay-succession'); break;
    case 'gameover':   renderGameOverOverlay(); show('overlay-gameover'); break;
    case 'end':        renderEndOverlay(); show('overlay-end'); break;
  }
}

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

  // Famine warning banner
  const M = currentEra().mechanics;
  const cookingRed = skillEffectSum('foodCostReduction');
  const projFoodCost = Math.round((S.timeTotal * currentEra().foodPerTimePoint + S.char.children.length * M.childrenFoodCost) * (1 - cookingRed));
  let famineWarn = el('famine-warning');
  if (!famineWarn) {
    famineWarn = document.createElement('div');
    famineWarn.id = 'famine-warning';
    famineWarn.className = 'famine-warning';
    el('pane-select').insertBefore(famineWarn, el('zone-cards'));
  }
  if (S.resources.food.value < projFoodCost) {
    const deficit = projFoodCost - S.resources.food.value;
    famineWarn.textContent = `⚠️ Fam imminent — falten ${deficit} de menjar per cobrir el cicle`;
    famineWarn.classList.remove('hidden');
  } else {
    famineWarn.classList.add('hidden');
  }

  const container = el('zone-cards');
  container.innerHTML = '';

  for (const zone of currentEra().zones.filter(z => S.discoveredZoneIds.includes(z.id))) {
    const zoneProjects = currentEra().actions.filter(p => p.zone === zone.id);
    const availCount = zoneProjects.filter(p => isProjectUnlocked(p)).length;
    const locked = availCount === 0;
    const card = document.createElement('div');
    card.className = 'zone-card' + (locked ? ' zone-card-locked' : '');
    card.innerHTML = `
      <span class="zone-card-icon">${zone.icon}</span>
      <div class="zone-card-info">
        <span class="zone-card-name">${zone.name}</span>
        <span class="zone-card-hint">${locked ? 'Cap acció disponible encara' : zone.description}</span>
      </div>
      <span class="zone-card-count">${locked ? '—' : availCount + ' activ.'}</span>
    `;
    if (!locked) card.addEventListener('click', () => openZoneSheet(zone.id));
    container.appendChild(card);
  }

  const restBtn = el('btn-rest-cycle');
  if (S.timeLeft < S.timeTotal) {
    restBtn.classList.remove('hidden');
  } else {
    restBtn.classList.add('hidden');
  }
}

function openZoneSheet(zoneId) {
  const zone = currentEra().zones.find(z => z.id === zoneId);
  el('zone-sheet-icon').textContent = zone.icon;
  el('zone-sheet-name').textContent = zone.name;

  const grid = el('zone-sheet-grid');
  grid.innerHTML = '';

  const statIcons = { physical: '💪', intelligence: '🧠', social: '👥' };
  for (const proj of currentEra().actions.filter(p => p.zone === zoneId && isProjectUnlocked(p))) {
    const blocked = blockedReason(proj);
    const card = document.createElement('div');
    card.className = 'proj-card' + (blocked ? ' proj-card-disabled' : '');
    const riskHtml = proj.healthRisk > 0 ? `<div class="proj-impact"><span class="impact-tag risk">⚠️ Risc</span></div>` : '';
    const gainParts = Object.entries(proj.statGain || {}).map(([s, v]) => `${statIcons[s] || s}+${v}`);
    const gainHtml  = gainParts.length > 0 ? `<span class="proj-stat-gain">${gainParts.join(' ')}</span>` : '';
    const mLvl  = getMasteryLevel(proj.id);
    const mUses = getMasteryUses(proj.id);
    const nextT = MASTERY_THRESHOLDS[mLvl];
    let masteryHtml = '';
    if (mLvl > 0 || mUses > 0) {
      const stars = mLvl > 0 ? '★'.repeat(mLvl) : '☆';
      const pct   = mLvl > 0 ? ` +${Math.round(mLvl * MASTERY_BONUS_LEVEL * 100)}%` : '';
      const prog  = nextT ? ` · ${mUses}/${nextT}` : ' · màx';
      const barPct = nextT ? Math.round((mUses / nextT) * 100) : 100;
      const barHtml = nextT
        ? `<div class="mastery-bar"><div class="mastery-bar-fill mastery-fill-${mLvl}" style="width:${barPct}%"></div></div>`
        : '';
      masteryHtml = `<div class="proj-mastery-wrap"><span class="proj-mastery mastery-${mLvl}">${stars}${pct}${prog}</span>${barHtml}</div>`;
    }
    card.innerHTML = `
      <span class="proj-icon">${proj.icon}</span>
      <span class="proj-name">${proj.name}</span>
      <span class="proj-desc">${proj.description}</span>
      ${blocked ? `<span class="proj-blocked-reason">${blocked}</span>` : `${gainHtml}${masteryHtml}${riskHtml}`}
    `;
    if (!blocked) {
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

  const M = currentEra().mechanics;
  const costs = M.intensityTimeCosts;
  const names = M.intensityLabels;

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
  if (currentEra().mechanics.intensityTimeCosts[n - 1] > S.timeLeft) return;
  S.intensity = n;
  document.querySelectorAll('.int-btn').forEach(b => {
    b.classList.toggle('active', +b.dataset.int === n);
  });
  if (S.activeProject) renderImpactPreview(S.activeProject);
}

function calcImpactPreview(proj, intensity) {
  const M = currentEra().mechanics;
  const mult    = M.intensityOutputMults[intensity - 1];
  const statVal = S.char[proj.statKey] || 1;
  const statMod = clamp(M.statModBase + (statVal - 1) * M.statModPerStat, M.statModMin, M.statModMax);
  let knowMod = 1.0;
  for (const kId of (proj.knowledgeBonus || [])) { if (hasKnowledge(kId)) knowMod += M.knowledgeBonusPerTech; }
  const masteryMult = 1 + getMasteryLevel(proj.id) * MASTERY_BONUS_LEVEL;
  const finalMult = mult * statMod * knowMod * masteryMult;
  const mults = { intensity: mult, stat: statMod, knowledge: knowMod, mastery: masteryMult, final: finalMult };
  const preview = {};
  for (const [key, val] of Object.entries(proj.outputs || {})) {
    preview[key] = Math.round(val * (val < 0 ? mult : finalMult));
  }
  const flatBonuses = {};
  const baseFood = preview.food || 0;
  const gatherPct = skillEffectSum('gatherFoodPct');
  if (gatherPct > 0 && proj.id === 'gather') {
    const b = Math.round(baseFood * gatherPct);
    flatBonuses.food = (flatBonuses.food || 0) + b;
    preview.food = (preview.food || 0) + b;
  }
  const farmPct = skillEffectSum('farmFoodPct');
  if (farmPct > 0 && proj.zone === 'fields' && baseFood > 0) {
    const b = Math.round(baseFood * farmPct);
    flatBonuses.food = (flatBonuses.food || 0) + b;
    preview.food = (preview.food || 0) + b;
  }
  for (const [techId, bonus] of Object.entries(proj.techBonuses || {})) {
    if (hasKnowledge(techId) && bonus.foodPct) {
      const b = Math.round(baseFood * bonus.foodPct);
      flatBonuses.food = (flatBonuses.food || 0) + b;
      preview.food = (preview.food || 0) + b;
    }
  }
  const hasTracking = skillEffectSum('huntMultBonus') > 0 && (proj.id === 'hunt' || proj.id === 'explore');
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
  const labels = { food: '🍖 Aliment', health: '❤️ Salut', happiness: '😊 Felicitat', familyReputation: '🏛️ Reputació', preserveFood: '🏺 Reserva màx.' };
  for (const [key, val] of Object.entries(preview)) {
    if (val === 0) continue;
    const row = document.createElement('div');
    row.className = 'preview-row';
    const sign = val > 0 ? '+' : '';
    const valStr = `<span class="preview-val ${val > 0 ? 'pos' : 'neg'}">${sign}${val}</span>`;
    row.innerHTML = `<span>${labels[key] || key}</span>${valStr}`;
    container.appendChild(row);
  }
  if (hasTracking) {
    const row = document.createElement('div');
    row.className = 'preview-row';
    row.innerHTML = `<span>🐾 Rastre</span><span class="preview-bonus">+20% tot</span>`;
    container.appendChild(row);
  }
  if (hasRisk) {
    const M = currentEra().mechanics;
    const chances = M.intensityFailChances.map(c => Math.round(c * 100) + '%');
    const row = document.createElement('div');
    row.className = 'preview-row';
    const note = riskReduced ? ' ↓ eines' : '';
    row.innerHTML = `<span>⚠️ Risc lesió${note}</span><span class="preview-val risk">${chances[S.intensity - 1]}</span>`;
    container.appendChild(row);
  }

  // Mastery hint
  const mLvl  = getMasteryLevel(proj.id);
  const mUses = getMasteryUses(proj.id);
  const nextT = MASTERY_THRESHOLDS[mLvl];
  if (mLvl > 0 || mUses > 0) {
    const row = document.createElement('div');
    row.className = 'preview-row preview-mastery';
    if (mLvl > 0) {
      const pct = Math.round(mLvl * MASTERY_BONUS_LEVEL * 100);
      const prog = nextT ? ` · ${mUses}/${nextT}` : ' · màx';
      row.innerHTML = `<span>${'★'.repeat(mLvl)} Mestratge${prog}</span><span class="preview-bonus">+${pct}%</span>`;
    } else {
      row.innerHTML = `<span>☆ Mestratge ${mUses}/${nextT}</span><span class="preview-bonus">—</span>`;
    }
    container.appendChild(row);
  }

  // U3: expandable multiplier detail
  const detailToggle = document.createElement('button');
  detailToggle.className = 'preview-detail-toggle';
  detailToggle.textContent = '⌄ Detall';
  const detailBox = document.createElement('div');
  detailBox.className = 'preview-detail hidden';
  const { intensityLabels, intensityOutputMults } = currentEra().mechanics;
  const shortLabels = ['Suau', 'Normal', 'Intens'];
  const intNames = shortLabels.map((n, i) => `${n} ×${intensityOutputMults[i]}`);
  const statLabel = { physical: '💪 Físic', intelligence: '🧠 Intel·l.', social: '👥 Social' };
  const flatBonusRows = Object.entries(flatBonuses).map(([key, bonus]) =>
    `<div class="detail-row"><span>${labels[key] || key} (hab.)</span><span>+${bonus}</span></div>`
  ).join('');
  detailBox.innerHTML = `
    <div class="detail-row"><span>Intensitat</span><span>${intNames[S.intensity - 1]}</span></div>
    <div class="detail-row"><span>${statLabel[proj.statKey] || proj.statKey} ${(S.char[proj.statKey] || 1).toFixed(1)}</span><span>×${mults.stat.toFixed(2)}</span></div>
    ${mults.knowledge > 1 ? `<div class="detail-row"><span>Coneixement</span><span>×${mults.knowledge.toFixed(2)}</span></div>` : ''}
    ${mults.mastery > 1 ? `<div class="detail-row"><span>⭐ Mestratge</span><span>×${mults.mastery.toFixed(2)}</span></div>` : ''}
    <div class="detail-row detail-total"><span>Multiplicador final</span><span>×${mults.final.toFixed(2)}</span></div>
    ${flatBonusRows}
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
  const timeCostCheck = currentEra().mechanics.intensityTimeCosts[S.intensity - 1];
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

    if (!S.actionMastery) S.actionMastery = {};
    S.actionMastery[proj.id] = (S.actionMastery[proj.id] || 0) + 1;

    if (proj.id === 'hunt' && result.quality !== 'poor') S.char.huntCount++;
    if (proj.generatesPartner && result.quality !== 'poor' && !S.char.partner) S.char.partner = generatePartner();
    if (proj.generatesChild && result.quality !== 'poor' && S.char.partner) {
      if (S.char.children.length < currentEra().maxChildren) {
        const newChild = generateChild();
        S.char.children.push(newChild);
        S.pendingBirths.push(newChild);
      }
    }

    const timeCost = currentEra().mechanics.intensityTimeCosts[S.intensity - 1];
    S.timeLeft = Math.max(0, S.timeLeft - timeCost);

    const discovered = tryDiscoverSkill(proj, result.finalMult);
    const event = tryTriggerEvent(proj, result.quality);
    if (discovered.length > 0) S.pendingDiscoveries.push(...discovered);
    checkZoneDiscoveries();
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
  const M = currentEra().mechanics;
  let cost = 0;
  for (let i = 0; i < n; i++) cost += M.teachCostBase + i * M.teachCostIncrement;
  return cost;
}

function renderTeachPane() {
  const c = S.char;
  if (!c.teachChildIndices) c.teachChildIndices = [];
  const n = c.teachChildIndices.length;
  const { teachCostBase, teachCostIncrement } = currentEra().mechanics;
  const cost = calcTeachCost(Math.max(1, n));
  const costBreakdown = n > 1
    ? Array.from({ length: n }, (_, i) => teachCostBase + i * teachCostIncrement).join('+') + ` = ${calcTeachCost(n)}`
    : n === 1 ? String(teachCostBase) : `${teachCostBase} per fill`;
  el('teach-cost-label').textContent = `Cost: ${costBreakdown} · Temps: ${S.timeLeft}`;

  // Skill picker
  const skillList = el('teach-skill-list');
  skillList.innerHTML = '';
  for (const sId of c.learnedSkillIds) {
    const s = getSkillGlobal(sId);
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
    const sev = item.shortfallPct || 1;
    let icon, text, extraLine;
    if (sev < 0.3) {
      icon = '🌾';
      text = 'Les provisions escassegen. La família s\'apanya amb el que té.';
      extraLine = '';
    } else if (sev < 0.6) {
      icon = '🍖';
      text = 'La fam comença a colpejar. Les reserves s\'esgoten i tothom en pateix.';
      extraLine = '<div class="fx-line"><span>Salut màxima (permanent)</span><span class="fx-neg">-2</span></div>';
    } else {
      icon = '💀';
      text = 'La fam s\'apodera del campament. No hi ha prou menjar per a tothom.';
      extraLine = '<div class="fx-line"><span>Salut màxima (permanent)</span><span class="fx-neg">-5</span></div>';
    }
    el('evr-icon').textContent = icon;
    el('evr-text').textContent = text;
    el('evr-fx').innerHTML = `
      <div class="fx-line"><span>Salut</span><span class="fx-neg">-${item.healthLoss}</span></div>
      ${extraLine}
    `;
  } else {
    el('evr-icon').textContent = childAvatar(item);
    el('evr-text').textContent = `${item.name} no ha sobreviscut a la fam. La família porta el dol.`;
    el('evr-fx').innerHTML = '<div class="fx-line"><span>Reputació familiar</span><span class="fx-neg">-5</span></div>';
  }
  S._showingDeath = true;
  S.phase = 'ev-result';
  clearTimeout(_timer);
  el('evr-auto-bar').style.display = 'none';
  el('btn-dismiss-ev-result').style.display = 'block';
  renderAll();
}

function afterNotifications() {
  const minCost = currentEra().mechanics.intensityTimeCosts[0];
  if (S.timeLeft >= minCost) {
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

  const efxEl = el('disc-effects');
  efxEl.innerHTML = '';

  if (item._type === 'zone') {
    el('disc-badge').textContent = '🗺️ Nova zona descoberta';
    el('disc-name').textContent = item.discoveryTitle;
    el('disc-desc').textContent = item.discoveryText;
    const zoneActions = currentEra().actions.filter(p => p.zone === item.id && isProjectUnlocked(p));
    for (const action of zoneActions) {
      const div = document.createElement('div');
      div.className = 'fx-line';
      div.innerHTML = `<span>${action.icon} ${action.name}</span><span class="fx-pos">${action.description}</span>`;
      efxEl.appendChild(div);
    }
  } else if (item._type === 'skill') {
    el('disc-badge').textContent = '📚 Nova destresa apresa';
    el('disc-name').textContent = item.name;
    el('disc-desc').textContent = item.description;
    const div = document.createElement('div');
    div.className = 'fx-line';
    div.innerHTML = `<span>Efecte</span><span class="fx-pos">${item.effectDesc}</span>`;
    efxEl.appendChild(div);
  } else if (item._type === 'habilitat') {
    el('disc-badge').textContent = '🔓 Nova habilitat del llinatge';
    el('disc-name').textContent = item.name;
    el('disc-desc').textContent = item.description;
    for (const actionId of (item.unlocksActionIds || [])) {
      const action = getProject(actionId);
      if (!action) continue;
      const div = document.createElement('div');
      div.className = 'fx-line';
      div.innerHTML = `<span>🔓 Desbloqueja</span><span class="fx-pos">${action.icon} ${action.name}</span>`;
      efxEl.appendChild(div);
    }
  } else {
    el('disc-badge').textContent = '✨ Nova tecnologia descoberta';
    el('disc-name').textContent = item.name;
    el('disc-desc').textContent = item.description;
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
    for (const actionId of (item.unlocksActionIds || [])) {
      const action = getProject(actionId);
      if (!action) continue;
      const div = document.createElement('div');
      div.className = 'fx-line';
      div.innerHTML = `<span>🔓 Desbloqueja</span><span class="fx-pos">${action.icon} ${action.name}</span>`;
      efxEl.appendChild(div);
    }
  }
}

function renderBirthPane() {
  const child = S.pendingBirths[0];
  el('birth-avatar').textContent = childAvatar(child);
  el('birth-name').textContent = child.name;
  el('birth-virtue').textContent = child.virtueLabel;

  const statsEl = el('birth-stats');
  statsEl.innerHTML = `
    <div class="birth-stat"><span>💪</span><span>${child.physical}</span></div>
    <div class="birth-stat"><span>🧠</span><span>${child.intelligence}</span></div>
    <div class="birth-stat"><span>👥</span><span>${child.social}</span></div>
  `;

  const traitsEl = el('birth-traits');
  traitsEl.innerHTML = '';
  for (const tId of child.traitIds) {
    const t = getTrait(tId);
    if (!t) continue;
    const span = document.createElement('span');
    span.className = 'birth-trait-pill';
    span.textContent = t.icon + ' ' + t.name;
    traitsEl.appendChild(span);
  }
}

function advanceFromBirth() {
  S.pendingBirths.shift();
  if (S.pendingBirths.length > 0) { renderAll(); return; }
  const minCost = currentEra().mechanics.intensityTimeCosts[0];
  if (S.timeLeft >= minCost && S.pendingDiscoveries.length > 0) {
    S.phase = 'discovery'; renderAll();
  } else if (S.timeLeft >= minCost && S.pendingEvent) {
    S.phase = 'event'; renderAll();
  } else {
    afterNotifications();
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
  const labels = { food: '🍖 Aliment', health: '❤️ Salut', happiness: '😊 Felicitat', familyReputation: '🏛️ Reputació', preserveFood: '🏺 Reserva màx.' };
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

  el('result-discoveries').innerHTML = '';

  const goNext = () => {
    const minCost = currentEra().mechanics.intensityTimeCosts[0];
    const canContinue = S.timeLeft >= minCost;
    if (S.pendingBirths.length > 0) {
      S.phase = 'birth'; renderAll();
    } else if (canContinue && S.pendingDiscoveries.length > 0) {
      S.phase = 'discovery'; renderAll();
    } else if (canContinue && S.pendingEvent) {
      S.phase = 'event'; renderAll();
    } else if (canContinue) {
      S.phase = 'select'; renderAll();
    } else {
      endCycle();
    }
  };

  // Reset barra de progrés per reiniciar l'animació
  const fill = el('result-auto-fill');
  if (fill) { fill.style.animation = 'none'; void fill.offsetWidth; fill.style.animation = ''; }
  gameDelay(1600, goNext);
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
  if (fx.clearPartner) S.char.partner = null;
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
  const fxLines = Object.entries(fx).filter(([k]) => !k.startsWith('_gain_') && k !== 'clearPartner');
  el('evr-fx').innerHTML = fxLines.map(([k, v]) => {
    const labels = { food: '🍖', health: '❤️', happiness: '😊', familyReputation: '🏛️' };
    return `<span class="${v > 0 ? 'fx-pos' : 'fx-neg'}">${labels[k] || k} ${v > 0 ? '+' : ''}${v}</span>`;
  }).join('  ');

  el('btn-dismiss-ev-result').style.display = 'none';
  el('evr-auto-bar').style.display = '';
  const evrFill = el('evr-auto-fill');
  if (evrFill) { evrFill.style.animation = 'none'; void evrFill.offsetWidth; evrFill.style.animation = ''; }
  gameDelay(1100, afterNotifications);
}

// ── Succession overlay ────────────────────────────────────────────────────────
function childSuccessionScore(child) {
  return (child.physical || 0) + (child.intelligence || 0) + (child.social || 0)
    + (child.learnedSkillIds || []).length * 1.5
    + (child.traitIds || []).length * 0.5;
}

function buildChildCard(child, isBest) {
  const skillsHtml = (child.learnedSkillIds || []).map(sId => {
    const s = getSkillGlobal(sId); return s ? `<span class="skill-pill">${s.icon} ${s.name}</span>` : '';
  }).join('');
  const traitsHtml = (child.traitIds || []).map(id => {
    const t = getTrait(id); return t ? `<span class="trait-pill" title="${t.desc}">${t.icon} ${t.name}</span>` : '';
  }).join('');
  const card = document.createElement('div');
  card.className = 'succ-child-card' + (isBest ? ' succ-child-best' : '');
  const isEraTransition = child.bornEraId && child.bornEraId !== S.currentEraId;
  const nextEraObj = isEraTransition ? GAME_DATA.eras.find(e => e.id === child.bornEraId) : null;
  const eraBadgeHtml = isEraTransition
    ? (nextEraObj
        ? `<span class="succ-era-badge">🌿 Portarà el llinatge a ${nextEraObj.name}</span>`
        : `<span class="succ-era-badge succ-era-final">🏆 Completarà el llinatge</span>`)
    : '';
  const bestBadge = isBest ? `<span class="succ-best-badge">⭐ Millor opció</span>` : '';
  const bornAge = child.bornCycle ? `Nascut al cicle ${child.bornCycle}` : '';
  card.innerHTML = `
    ${bestBadge}
    <span class="succ-child-avatar">${childAvatar(child)}</span>
    <span class="succ-child-name">${child.name}</span>
    <span class="succ-child-virtue">"${child.virtueLabel}"</span>
    ${bornAge ? `<span class="succ-child-born">${bornAge}</span>` : ''}
    ${eraBadgeHtml}
    <div class="succ-child-stats">
      <span title="Físic">💪 ${(child.physical||0).toFixed(1)}</span>
      <span title="Intel·ligència">🧠 ${(child.intelligence||0).toFixed(1)}</span>
      <span title="Social">👥 ${(child.social||0).toFixed(1)}</span>
    </div>
    <div class="succ-child-traits">${traitsHtml}${skillsHtml}</div>
    <button class="btn-choose-child">Continua amb ${child.name} →</button>
  `;
  card.querySelector('.btn-choose-child').onclick = () => doSuccession(child);
  return card;
}

function renderSuccessionOverlay() {
  const last = S.genealogy[S.genealogy.length - 1];
  el('succ-death-msg').innerHTML = `
    <strong>${last.name}</strong> ha mort als <strong>${last.age} anys</strong>.<br>
    <em>${last.cause}.</em>
  `;

  const children = S.char.children;
  el('succ-title').textContent = children.length > 1
    ? `Tria el Successor (${children.length} fills)`
    : 'El Llinatge Continua';

  const scores = children.map(c => childSuccessionScore(c));
  const maxScore = Math.max(...scores);

  const list = el('succ-children-list');
  list.innerHTML = '';
  for (let i = 0; i < children.length; i++) {
    const isBest = children.length > 1 && scores[i] === maxScore;
    list.appendChild(buildChildCard(children[i], isBest));
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

  const banner = el('end-victory-banner');
  if (S._victoryEnding) {
    banner.classList.remove('hidden');
    const list = el('victory-eras-list');
    list.innerHTML = '';
    for (const era of GAME_DATA.eras) {
      const div = document.createElement('div');
      div.className = 'victory-era-item';
      div.innerHTML = `<span class="victory-era-icon">${era.icon}</span><span>${era.name}</span><span class="victory-check">✓</span>`;
      list.appendChild(div);
    }
  } else {
    banner.classList.add('hidden');
  }

  el('end-dynasty').textContent = S.dynastyName;
  el('end-tagline').textContent = `"${title}"`;

  const era = currentEra() || GAME_DATA.eras[GAME_DATA.eras.length - 1];
  const totalTechs = GAME_DATA.eras.reduce((sum, e) => sum + (e.techs?.length || 0), 0);
  const grid = el('end-stats-grid');
  grid.innerHTML = `
    <div class="end-stat"><span>Generacions</span><span class="end-stat-val">${S.generation}</span></div>
    <div class="end-stat"><span>Fills totals</span><span class="end-stat-val">${S.char.children.length}</span></div>
    <div class="end-stat"><span>Reputació</span><span class="end-stat-val">${Math.round(S.resources.familyReputation.value)}</span></div>
    <div class="end-stat"><span>Tecnologies</span><span class="end-stat-val">${S.char.knowledgeIds.length}/${S._victoryEnding ? totalTechs : era.techs.length}</span></div>
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
    if (val) parts.push(`+${val} ${labels[stat] || stat}`);
  }
  for (const actionId of (k.unlocksActionIds || [])) {
    const p = getProject(actionId);
    parts.push(`Desbloqueja "${p?.name || actionId}"`);
  }
  for (const action of currentEra().actions) {
    if (action.riskReductions?.[k.id]) {
      parts.push(`-${Math.round(action.riskReductions[k.id] * 100)}% risc a ${action.name}`);
    }
  }
  return parts.join(' · ') || k.description;
}

function renderTechOverlay(tab) {
  const activeTab = tab || 'techs';
  el('tab-techs').classList.toggle('active', activeTab === 'techs');
  el('tab-skills').classList.toggle('active', activeTab === 'skills');

  const list = el('tech-list');
  list.innerHTML = '';

  if (activeTab === 'techs') {
    // Discovered technologies (all eras)
    const allDiscovered = GAME_DATA.eras.flatMap(era => (era.techs || []).filter(t => hasKnowledge(t.id)));
    if (allDiscovered.length === 0) {
      list.innerHTML = '<p class="tech-empty">Cap tecnologia descoberta encara.</p>';
    } else {
      for (const k of allDiscovered) {
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

    // Upcoming technologies (names hidden)
    const upcoming = currentEra().techs.filter(t => !hasKnowledge(t.id));
    if (upcoming.length > 0) {
      const secHeader = document.createElement('p');
      secHeader.className = 'tech-section-header';
      secHeader.textContent = 'Per descobrir';
      list.appendChild(secHeader);

      for (const tech of upcoming) {
        const reqMet = !tech.requiresTech || hasKnowledge(tech.requiresTech);
        const cyclesLeft = Math.max(0, tech.eraCycleAppears - S.eraCycle);
        const wrap = document.createElement('div');
        wrap.className = 'tech-progress-wrap';
        let hint;
        if (!reqMet) {
          hint = 'Requereix altres coneixements primer';
        } else if (cyclesLeft > 0) {
          hint = `En ${cyclesLeft} cicle${cyclesLeft !== 1 ? 's' : ''} d'era`;
        } else {
          hint = 'A punt de descobrir-se';
        }
        wrap.innerHTML = `
          <div class="tech-progress-label">🔒 ???</div>
          <div class="tech-progress-hint">${hint}</div>
        `;
        list.appendChild(wrap);
      }
    }
  } else {
    // Skills tab — lineage skills for the current era
    const eraSkills = currentEra().skills || [];
    if (eraSkills.length === 0) {
      list.innerHTML = '<p class="tech-empty">Cap habilitat de llinatge en aquesta era.</p>';
    } else {
      for (const skill of eraSkills) {
        const unlocked = hasUnlockedSkill(skill.id);
        const row = document.createElement('div');
        if (unlocked) {
          row.className = 'tech-row';
          row.innerHTML = `
            <span class="tech-icon">${skill.icon}</span>
            <div class="tech-info">
              <strong>${skill.name}</strong>
              <small>${skill.description}</small>
            </div>
          `;
        } else {
          const techMet = !skill.requiresTech || hasKnowledge(skill.requiresTech);
          const reqTech = skill.requiresTech ? getKnowledge(skill.requiresTech) : null;
          let hint;
          if (!techMet) {
            hint = `Requereix tecnologia: ${reqTech ? reqTech.name : skill.requiresTech}`;
          } else if (skill.requiresMinStat) {
            const unmet = Object.entries(skill.requiresMinStat)
              .filter(([k, v]) => (S.char[k] || 0) < v)
              .map(([k, v]) => `${k} ${v}`)
              .join(', ');
            hint = unmet ? `Requereix: ${unmet}` : 'Pendent de desbloquejar';
          } else {
            hint = 'Pendent de desbloquejar';
          }
          row.className = 'tech-progress-wrap';
          row.innerHTML = `
            <div class="tech-progress-label">${skill.icon} ${skill.name}</div>
            <div class="tech-progress-hint">${hint}</div>
          `;
        }
        list.appendChild(row);
      }
    }
  }

  show('overlay-tech');
}

// ── Save overlay ──────────────────────────────────────────────────────────────
function renderSaveOverlay(tab) {
  const activeTab = tab || 'export';
  el('tab-export').classList.toggle('active', activeTab === 'export');
  el('tab-import').classList.toggle('active', activeTab === 'import');
  el('save-export-panel').classList.toggle('hidden', activeTab !== 'export');
  el('save-import-panel').classList.toggle('hidden', activeTab !== 'import');

  if (activeTab === 'export') {
    const code = exportSaveCode();
    el('save-export-code').value = code || '';
    el('btn-copy-code').textContent = 'Copiar codi';
  } else {
    el('save-import-code').value = '';
    el('save-import-error').classList.add('hidden');
  }
  show('overlay-save');
}

// ── Milestones overlay ────────────────────────────────────────────────────────
function renderMilestonesOverlay() {
  const list = el('milestones-list');
  list.innerHTML = '';
  const earnedMilestones = S?.milestones || [];
  for (const m of GAME_DATA.milestones) {
    const earned = earnedMilestones.includes(m.id);
    const row = document.createElement('div');
    row.className = 'milestone-row ' + (earned ? 'earned' : 'locked');
    row.innerHTML = `<span class="ms-icon">${earned ? m.icon : '⬜'}</span><span><strong>${m.name}</strong><br><small>${m.desc}</small></span>`;
    list.appendChild(row);
  }
  show('overlay-milestones');
}

// ── Event listeners ───────────────────────────────────────────────────────────
function bindEvents() {
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
  el('btn-rest-cycle').addEventListener('click', endCycle);
  el('btn-dismiss-birth').addEventListener('click', advanceFromBirth);
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
  el('btn-tech').addEventListener('click', () => { renderTechOverlay('techs'); });
  el('btn-close-tech').addEventListener('click', () => hide('overlay-tech'));
  el('tab-techs').addEventListener('click', () => renderTechOverlay('techs'));
  el('tab-skills').addEventListener('click', () => renderTechOverlay('skills'));
  el('btn-restart').addEventListener('click', () => {
    hide('overlay-end');
    clearSave();
    renderMenuEra();
    updateContinueBtn();
    show('overlay-menu');
  });

  // Save / Load
  el('btn-save').addEventListener('click', () => renderSaveOverlay('export'));
  el('btn-close-save').addEventListener('click', () => hide('overlay-save'));
  el('tab-export').addEventListener('click', () => renderSaveOverlay('export'));
  el('tab-import').addEventListener('click', () => renderSaveOverlay('import'));
  el('btn-copy-code').addEventListener('click', () => {
    const code = el('save-export-code').value;
    navigator.clipboard.writeText(code).then(() => {
      el('btn-copy-code').textContent = '✓ Copiat!';
      setTimeout(() => { el('btn-copy-code').textContent = 'Copiar codi'; }, 2000);
    }).catch(() => {
      el('save-export-code').select();
    });
  });
  el('btn-load-code').addEventListener('click', () => {
    const code = el('save-import-code').value;
    const ok = importSaveCode(code);
    if (!ok) el('save-import-error').classList.remove('hidden');
  });
  el('btn-continue-game').addEventListener('click', () => loadSavedGame());
  el('btn-new-game').addEventListener('click', () => { clearSave(); updateContinueBtn(); startGame(); });

  // Era transition
  el('btn-era-transition-continue').addEventListener('click', () => {
    hide('overlay-era-transition');
    show('overlay-menu');
  });

  // Main menu extras
  el('btn-menu-badges').addEventListener('click', () => { renderMilestonesOverlay(); });
  el('btn-menu-shop').addEventListener('click', () => { show('overlay-shop'); });
  el('btn-menu-settings').addEventListener('click', () => { show('overlay-settings'); });
  el('btn-close-settings').addEventListener('click', () => hide('overlay-settings'));
  el('btn-close-shop').addEventListener('click', () => hide('overlay-shop'));
  el('btn-clear-save-settings').addEventListener('click', () => {
    clearSave();
    updateContinueBtn();
    renderMenuEra();
    hide('overlay-settings');
  });
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
  initDiscoveredZones();
  S.phase = 'select';
  hide('overlay-menu');
  renderAll();
}

document.addEventListener('DOMContentLoaded', () => {
  renderStatChips();
  renderMenuEra();
  bindEvents();
  updateContinueBtn();
  if (typeof initDevPanel === 'function') initDevPanel();
});
