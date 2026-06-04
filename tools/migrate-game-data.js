/**
 * migrate-game-data.js
 * Llegeix src/life-tycoon/data.js i genera un JSON normalitzat
 * compatible amb l'editor (tools/data-editor.html).
 *
 * Ús:
 *   node tools/migrate-game-data.js > tools/lt-gamedata-migrated.json
 *
 * Després importa el JSON resultant a l'editor amb el botó ⬆⬇ → Importar.
 */

'use strict';
const fs   = require('fs');
const path = require('path');

// ── Llegir data.js com a text i extreure GAME_DATA ──
const dataPath = path.join(__dirname, '../src/life-tycoon/data.js');
const raw = fs.readFileSync(dataPath, 'utf8');

// Executem el fitxer en un context minimal per capturar GAME_DATA
const vm = require('vm');
const ctx = { GAME_DATA: null };
// data.js fa "const GAME_DATA = {...}; ..." — el capturem posant-lo en context
const wrappedCode = raw.replace(/^const GAME_DATA\s*=/, 'ctx.GAME_DATA =');
try {
  vm.runInNewContext(wrappedCode, { ctx, console });
} catch (e) {
  // Si falla per alguna raó, intentem eval parcial
  console.error('Avís: error parsejant data.js complet, intent parcial:', e.message);
}

if (!ctx.GAME_DATA) {
  console.error('Error: no s\'ha pogut extreure GAME_DATA de data.js');
  process.exit(1);
}

const GD = ctx.GAME_DATA;

// ── Estructura normalitzada ──
const DB = { entities: [], deps: [], effects: [], mechanics: [] };
let _id = 1;
const uid = () => 'e' + String(_id++).padStart(4, '0');

// Maps per evitar duplicats i per resoldre cross-references
const eraById    = {};  // era.id    → entity.id
const zoneById   = {};  // zone.id   → entity.id (per era)
const techById   = {};  // tech.id   → entity.id
const skillById  = {};  // skill.id  → entity.id
const destById   = {};  // destresa.id → entity.id
const actionById = {};  // action.id  → entity.id

function addE(type, props)  { const e={id:uid(),type,...props}; DB.entities.push(e); return e; }
function addD(oid,ot,rid,rt,cond,val) { DB.deps.push({id:uid(),owner_id:oid,owner_type:ot,req_id:rid,req_type:rt,cond:cond||'requires',value:val??null}); }
function addF(oid,ot,ft,tid,val) { DB.effects.push({id:uid(),owner_id:oid,owner_type:ot,effect_type:ft,target_id:tid,value:val??0,formula:null}); }
function addM(eraId,key,val) { DB.mechanics.push({id:uid(),era_id:eraId,key,value:val}); }

// ── 1. Eres ──
(GD.eras || []).forEach(era => {
  const le = era.lifeExpectancy || {};
  const mc = era.maxChildren    || {};
  const e = addE('era', {
    name:        era.name,
    icon:        era.icon,
    description: era.description || '',
    life_base:   le.base || 30,
    life_max:    le.max  || 50,
    health_loss_cycle: (era.mechanics && era.mechanics.agingHealthLossPerCycle) || 2,
    subsistence: era.subsistenceCostPerCycle || 5,
    background:  era.backgroundScene || '',
    dlc:         era.dlc || false,
  });
  eraById[era.id] = e.id;

  // Mecàniques
  if (era.mechanics) {
    const m = era.mechanics;
    if (m.actionSlots)          addM(e.id, 'action_slots',       m.actionSlots);
    if (m.intensityTimeCosts)   addM(e.id, 'intensity_time_costs', JSON.stringify(m.intensityTimeCosts));
    if (era.maxChildren)        addM(e.id, 'max_children',       mc.base||6);
    if (m.statGainCaps) {
      Object.entries(m.statGainCaps).forEach(([k,v]) => addM(e.id, `stat_cap_${k}`, v));
    }
  }

  // Era gate condition
  if (era.eraGateCondition) {
    (era.eraGateCondition.requiredKnowledgeIds || []).forEach(kid => {
      // Resolució diferida — necessitem ID entitat de la tech
      e._gate_tech_ids = e._gate_tech_ids || [];
      e._gate_tech_ids.push(kid);
    });
  }
});

// ── 2. Tecnologies / Coneixements ──
(GD.knowledgeItems || []).forEach(tech => {
  const e = addE('tech', {
    name:        tech.name,
    icon:        tech.icon,
    description: tech.description || '',
    quote:       tech.quote || '',
    cost_vigor:    (tech.tokenCost && tech.tokenCost.vigor)    || 0,
    cost_saber:    (tech.tokenCost && tech.tokenCost.saber)    || 0,
    cost_prestigi: (tech.tokenCost && tech.tokenCost.prestigi) || 0,
    effect_desc: tech.effectDesc || '',
  });
  techById[tech.id] = e.id;
  // prereq tech
  if (tech.requiresTech) {
    e._req_tech = tech.requiresTech;
  }
});

// Resolució de deps entre techs (ara que totes existeixen)
DB.entities.filter(e => e.type === 'tech' && e._req_tech).forEach(e => {
  const reqId = techById[e._req_tech];
  if (reqId) addD(e.id, 'tech', reqId, 'tech', 'requires');
  delete e._req_tech;
});

// Resolució gate_tech d'eres
DB.entities.filter(e => e.type === 'era' && e._gate_tech_ids).forEach(e => {
  e._gate_tech_ids.forEach(kid => {
    const tid = techById[kid];
    if (tid) addD(e.id, 'era', tid, 'tech', 'gate_tech');
  });
  delete e._gate_tech_ids;
});

// ── 3. Habilitats (Taller) ──
(GD.shopSkills || []).forEach(sk => {
  const e = addE('skill', {
    name:        sk.name,
    icon:        sk.icon,
    description: sk.description || '',
    quote:       sk.quote || '',
    cost_vigor:    (sk.tokenCost && sk.tokenCost.vigor)    || 0,
    cost_saber:    (sk.tokenCost && sk.tokenCost.saber)    || 0,
    cost_prestigi: (sk.tokenCost && sk.tokenCost.prestigi) || 0,
    disc_chance:   sk.discoveryChance || 0,
    effect_desc:   sk.effectDesc || '',
    transversal:   sk.transversal || false,
  });
  skillById[sk.id] = e.id;

  // Requisits
  if (sk.requires) {
    (sk.requires.techIds || []).forEach(tid => {
      e._req_techs = e._req_techs || []; e._req_techs.push(tid);
    });
  }
  if (sk.requiresTech) {
    e._req_techs = e._req_techs || []; e._req_techs.push(sk.requiresTech);
  }
});

// Resolució deps habilitats
DB.entities.filter(e => e.type === 'skill' && e._req_techs).forEach(e => {
  e._req_techs.forEach(tid => {
    const rid = techById[tid]; if (rid) addD(e.id, 'skill', rid, 'tech', 'requires');
  });
  delete e._req_techs;
});

// ── 4. Zones ──
// Les zones es defineixen dins de cada era com a zoneActions
(GD.eras || []).forEach(era => {
  const eraEntityId = eraById[era.id];
  (era.zoneActions || []).forEach(za => {
    const e = addE('zone', {
      name:    za.name  || za.id,
      icon:    za.icon  || '📍',
      description: za.description || '',
      era_id:  eraEntityId,
      map_x:   za.mapX  || 50,
      map_y:   za.mapY  || 50,
    });
    // Key per era+zone per a que les accions el puguin referenciar
    zoneById[`${era.id}:${za.id}`] = e.id;
    zoneById[za.id] = e.id; // fallback sense era
  });
});

// ── 5. Accions ──
// Les accions poden estar dins zoneActions.actions o a era.actions
const processAction = (action, eraId) => {
  const eraEntityId = eraById[eraId];
  const zoneKey = `${eraId}:${action.zone}`;
  const zoneEntityId = zoneById[zoneKey] || zoneById[action.zone] || null;

  const e = addE('action', {
    name:          action.name,
    icon:          action.icon,
    description:   action.description || '',
    quote:         action.quote || '',
    zone_id:       zoneEntityId,
    era_id:        eraEntityId,
    stat_key:      action.statKey || '',
    health_risk:   action.healthRisk  || 0,
    base_risk:     action.baseRiskChance || 1.0,
    opens_taller:  action.opensTaller || false,
    discovers_skill: action.discoversSkill || false,
    teaches_skill:   action.teachesSkill   || false,
    generates_partner: action.generatesPartner || false,
    generates_child:   action.generatesChild   || false,
    success_texts: JSON.stringify(action.successTexts || []),
    fail_texts:    JSON.stringify(action.failTexts || []),
    min_cycle_pct: action.minCyclePct  || null,
    max_cycle_pct: action.maxCyclePct  || null,
  });
  actionById[`${eraId}:${action.id}`] = e.id;
  actionById[action.id] = e.id;

  // — Requisits —
  if (action.requirements) {
    const r = action.requirements;
    if (r.physical)     addD(e.id,'action','physical','characteristic','min_stat',r.physical);
    if (r.intelligence) addD(e.id,'action','intelligence','characteristic','min_stat',r.intelligence);
    if (r.social)       addD(e.id,'action','social','characteristic','min_stat',r.social);
    if (r.health)       addD(e.id,'action','health','indicator','min_value',r.health);
    if (r.requiresPartner) addD(e.id,'action','has_partner','family_state','requires');
    if (r.requiresChild)   addD(e.id,'action','has_child','family_state','requires');
    if (r.requiresLearnedSkill) addD(e.id,'action','has_learned_skill','family_state','requires');
  }
  if (action.requiresTech) {
    e._req_tech = action.requiresTech;
  }
  if (action.requiresSkill) {
    e._req_skill = action.requiresSkill;
  }
  if (action.requiresNoPartner) addD(e.id,'action','no_partner','family_state','requires_not');
  if (action.requiresMinHappiness)      addD(e.id,'action','happiness','indicator','min_value',action.requiresMinHappiness);
  if (action.requiresMinFamilyReputation) addD(e.id,'action','familyRep','indicator','min_value',action.requiresMinFamilyReputation);

  // — Outputs —
  const out = action.outputs || {};
  Object.entries(out).forEach(([k, v]) => addF(e.id,'action','output',k,v));
  if (action.statGain) Object.entries(action.statGain).forEach(([k,v]) => addF(e.id,'action','stat_gain',k,v));

  // — Descobriments de destreses (descoberta passiva per acció) —
  (action.destreseDiscovery || []).forEach(did => {
    e._disc_destreses = e._disc_destreses || []; e._disc_destreses.push(did);
  });

  return e;
};

(GD.eras || []).forEach(era => {
  // Accions dins de zoneActions
  (era.zoneActions || []).forEach(za => {
    (za.actions || []).forEach(a => processAction(a, era.id));
  });
  // Accions directament a era.actions (compat)
  (era.actions || []).forEach(a => processAction(a, era.id));
});

// Resolució deps d'accions (ara que techs/skills/destreses existeixen)
DB.entities.filter(e => e.type === 'action').forEach(e => {
  if (e._req_tech) {
    const rid = techById[e._req_tech]; if (rid) addD(e.id,'action',rid,'tech','requires');
    delete e._req_tech;
  }
  if (e._req_skill) {
    const rid = skillById[e._req_skill]; if (rid) addD(e.id,'action',rid,'skill','requires_skill');
    delete e._req_skill;
  }
  if (e._disc_destreses) {
    // Les destreses es registren via effects (descoberta passiva)
    e._disc_destreses.forEach(did => {
      const rid = destById[did];
      if (rid) addF(e.id,'action','discovers_destresa',rid,0);
    });
    delete e._disc_destreses;
  }
});

// ── 6. Destreses ──
(GD.destreses || []).forEach(d => {
  const e = addE('destresa', {
    name:          d.name,
    icon:          d.icon,
    description:   d.description || '',
    quote:         d.quote || '',
    disc_chance:   d.discoveryChance || 0.2,
    effect_desc:   d.effectDesc || '',
  });
  destById[d.id] = e.id;
  // Efectes del bonus passiu
  if (d.effect) {
    Object.entries(d.effect).forEach(([k,v]) => addF(e.id,'destresa','bonus',k,v));
  }
  // Requisits per obtenir-la (si n'hi ha)
  if (d.requires && d.requires.techIds) {
    d.requires.techIds.forEach(tid => {
      const rid = techById[tid]; if (rid) addD(e.id,'destresa',rid,'tech','requires');
    });
  }
});

// ── 7. Events ──
(GD.events || []).forEach(ev => {
  addE('event', {
    name:        ev.name || ev.id,
    icon:        ev.icon || '🎭',
    description: ev.description || ev.text || '',
    choices:     JSON.stringify(ev.choices || []),
  });
});

// ── Neteja camps temporals interns ──
DB.entities.forEach(e => {
  Object.keys(e).filter(k => k.startsWith('_')).forEach(k => delete e[k]);
});

// ── Estadístiques de migració ──
const stats = {
  eres:      DB.entities.filter(e=>e.type==='era').length,
  zones:     DB.entities.filter(e=>e.type==='zone').length,
  techs:     DB.entities.filter(e=>e.type==='tech').length,
  skills:    DB.entities.filter(e=>e.type==='skill').length,
  actions:   DB.entities.filter(e=>e.type==='action').length,
  destreses: DB.entities.filter(e=>e.type==='destresa').length,
  events:    DB.entities.filter(e=>e.type==='event').length,
  deps:      DB.deps.length,
  effects:   DB.effects.length,
  mechanics: DB.mechanics.length,
};
process.stderr.write(`\n✓ Migració completada:\n`);
Object.entries(stats).forEach(([k,v]) => process.stderr.write(`  ${k}: ${v}\n`));
process.stderr.write(`\nImporta el JSON resultant a l'editor amb ⬆⬇ → Importar.\n\n`);

// ── Sortida ──
process.stdout.write(JSON.stringify(DB, null, 2));
