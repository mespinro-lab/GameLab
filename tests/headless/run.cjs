// Bloodline — harness de regressió headless (prototips JS). Executa: node tests/headless/run.cjs
// Arrenca un servidor estàtic, carrega el joc a Chromium (Playwright) i comprova invariants clau
// + els fixos recents. Determinista (crida funcions internes, sense esperar animacions).
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 5599;
const ROOT = path.resolve(__dirname, '../../prototypes/bloodline-v2');
const SERVE = path.resolve(__dirname, '../../node_modules/serve/build/main.js');
const URL = `http://localhost:${PORT}/`;

let passed = 0, failed = 0;
function check(name, cond, detail) {
  if (cond) { passed++; console.log(`  ✓ ${name}`); }
  else { failed++; console.log(`  ✗ ${name}${detail !== undefined ? ' — ' + JSON.stringify(detail) : ''}`); }
}
async function gotoRetry(page, n = 24) {
  for (let i = 0; i < n; i++) { try { await page.goto(URL, { waitUntil: 'load', timeout: 2000 }); return; } catch (e) { await page.waitForTimeout(400); } }
  throw new Error('server not reachable');
}

(async () => {
  const serve = spawn(process.execPath, [SERVE, ROOT, '-l', String(PORT)], { stdio: 'ignore' });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  try {
    await gotoRetry(page);
    await page.waitForTimeout(300);

    const start = await page.evaluate(() => { initState('T', 'MED'); return { soc: state.character.inclination.sociabilitat }; });
    check('START-01: sociabilitat inicial 0.05 (Recol·lector determinista)', start.soc === 0.05, start);

    const hm = await page.evaluate(() => { initState('T', 'MED'); state.currentHealthMax = 40; return healthMax(); });
    check('2a: healthMax = pic (40) en creixement (no clawback)', hm === 40, hm);

    const evt = await page.evaluate(() => {
      initState('T', 'MED'); state.material = 10;
      state._pendingTurnEntry = { cycle: 1, action: { name: 'X', delta: '' }, events: [], upkeep: null };
      state.pendingEvent = { id: 'e', text: 'Test', options: [{ text: 'O', material_delta: -4, food_delta: 3 }] };
      resolveDiscoveryOption(0); return state.material;
    });
    check('EVT-OPT-MAT: material_delta d\'opció aplicat (10→6)', evt === 6, evt);

    const fc = await page.evaluate(() => {
      initState('T', 'MED'); state.discoveredUniversalTechIds.add('ut_foc');
      state.character.purchasedActionIds.add('act_assecar_provisions');
      const a = ACTIONS.find(x => x.id === 'act_assecar_provisions');
      state.foodMax = 20; const maxed = getActionVisibility(a);
      state.foodMax = 8; const ok = getActionVisibility(a);
      return { maxed, ok };
    });
    check('FOOD-CAP-01: Assecar deshabilitada (FADED) al cap màxim', fc.maxed === 'FADED' && fc.ok === 'ACTIVE', fc);

    const bal = await page.evaluate(() => { const c = ACTIONS.find(x => x.id === 'act_coure_ceramica'); return [c.material_min, c.material_max]; });
    check('BAL-01: coure_ceramica genera material (2/3)', bal[0] === 2 && bal[1] === 3, bal);

    const log2 = await page.evaluate(() => {
      initState('T', 'MED'); state.material = 20; state._turnExtras = [];
      buyAction('act_ritual_foc'); return state._turnExtras.map(x => x.text);
    });
    check('LOG-02: compra capturada a _turnExtras', log2.some(t => /Comprat/.test(t)), log2);

    const teach = await page.evaluate(() => {
      initState('T', 'MED');
      state.character.aprenentatges = new Set([APRENENTATGE_DEFS[0].id]);
      state.character.children = [{ id: 'c1', label: 'A' }, { id: 'c2', label: 'B' }];
      state._turnExtras = [];
      const ens = ACTIONS.find(a => a.id === 'act_ensenyar');
      const a0 = evaluateCharacterRequires(ens);
      applyCharacterEffect(ens); applyCharacterEffect(ens);
      const aEnd = evaluateCharacterRequires(ens);
      return { a0, aEnd, taught: state.character.children.map(c => !!c.taughtApr) };
    });
    check('TEACH-01: per-fill + deshabilitat quan tots han après', teach.a0 === true && teach.aEnd === false && teach.taught.every(Boolean), teach);

    const succ = await page.evaluate(() => {
      initState('T', 'MED');
      const aprId = APRENENTATGE_DEFS[0].id;
      state.character.children = [{ id: 'c1', label: 'A', taughtApr: aprId }];
      state.character.aprenentatges = new Set([aprId]);
      triggerSuccession(); saveGame(); loadGame();
      const s = state.pendingDeath && state.pendingDeath.successionPayload.successors[0];
      return { hasPD: !!state.pendingDeath, isSet: s ? (s.inheritedAprenentatges instanceof Set) : false, n: s ? [...s.inheritedAprenentatges].length : 0 };
    });
    check('SUCC-01: successió pendent sobreviu save/load', succ.hasPD && succ.isSet && succ.n === 1, succ);

    const fiber = await page.evaluate(() => {
      initState('T', 'MED'); state.discoveredZoneIds.add('Bosc'); state.branques = 3; renderAll();
      const a = ACTIONS.find(x => x.id === 'act_recollir_branques');
      return { gives: a.output_resource === 'branques' && a.output_min > 0, chip: document.body.innerHTML.includes('🌿 3') };
    });
    check('FIBER-01: Recollir Fibres dona branques i es mostra (🌿)', fiber.gives && fiber.chip, fiber);

    const apr01 = await page.evaluate(() => APRENENTATGE_DEFS.find(a => a.id === 'apr_plantes_medicinals').effect.action_id);
    check('APR-01: Plantes Medicinals diferenciat de Botànica (bolets, no arrels)', apr01 === 'act_recollida_bolets', apr01);

    const skilldisc = await page.evaluate(() => {
      initState('T', 'MED'); state.discoveredUniversalTechIds.add('ut_foc');
      const shown = getZoneActions('Campament').some(a => a.is_discovery_action);
      state.character.inclination.impuls = 0.12; // jugador modest amb un eix lleugerament marcat
      return { shown, eligibleModest: getEligibleSkills().map(s => s.id) };
    });
    check('SKILL-DISC-01: visible + habilitat elegible amb inclinació modesta (≥0.10)', skilldisc.shown && skilldisc.eligibleModest.includes('bt_guardia_flama'), skilldisc);

    const food02 = await page.evaluate(() => {
      initState('T', 'MED');
      const cap0 = FOOD_MAX_START;
      const assecarMax = ACTIONS.find(a => a.id === 'act_assecar_provisions').max_executions;
      state.foodMax = 6; state.food = 14; state.cycle++; applyTurnUpkeep(); // overflow → retall a l'EOT
      return { cap0, assecarMax, afterEOT: Math.round(state.food), basic: FOOD_MAX_BASIC };
    });
    check('FOOD-02: cap inicial 6, assecat → 10, overflow retallat a l\'EOT', food02.cap0 === 6 && food02.assecarMax === 2 && food02.afterEOT <= 6 && food02.basic === 10, food02);

    const dmsg = await page.evaluate(() => {
      initState('T', 'MED');
      state.discoveredUniversalTechIds.add('ut_foc'); state.character.purchasedActionIds.add('act_assecar_provisions');
      state.foodMax = 10; state.character.actionUseCounts['act_assecar_provisions'] = 2;
      const assecarMsg = disableReason(ACTIONS.find(a => a.id === 'act_assecar_provisions'));
      state.cycle = 10; // edat ≥ minAge(8) de "Ensenyar el Fill"
      state.character.children = [{ id: 'c', label: 'A', taughtApr: 'apr_cures_basiques' }];
      state.character.aprenentatges = new Set(['apr_cures_basiques']);
      const ensMsg = disableReason(ACTIONS.find(a => a.id === 'act_ensenyar'));
      return { assecarMsg, ensMsg };
    });
    check('DISABLE-MSG-01: motius contextuals (magatzem / fills ensenyats)', /[Mm]agatzem/.test(dmsg.assecarMsg) && /han après/.test(dmsg.ensMsg), dmsg);

    const log03 = await page.evaluate(() => {
      initState('T', 'MED');
      state.turnHistory = [{ cycle: 5, action: { name: 'Contemplació', delta: '+5❤️' }, events: [{ name: 'Event X', choice: 'A', delta: '+2🌾' }], extras: [{ icon: '🛒', text: 'Comprat: Y' }], upkeep: '-2🌾' }];
      openTurnHistory();
      const html = el('th-list').innerHTML;
      return { hasRows: html.includes('th-rows'), types: (html.match(/th-type/g) || []).length, cycles: (html.match(/C5/g) || []).length };
    });
    check('LOG-03: 3 columnes (cicle un cop, files tipus|fet)', log03.hasRows && log03.types === 4 && log03.cycles === 1, log03);

    const actdiff = await page.evaluate(() => {
      const v = ACTIONS.find(a => a.id === 'act_ritual_foc');
      const c = ACTIONS.find(a => a.id === 'act_contemplacio');
      return { vMax: v.output_max, vSoc: v.inclination_deltas.sociabilitat, cMax: c.output_max, cEsp: c.inclination_deltas.espiritualitat };
    });
    check('ACT-DIFF-01: Vetlla (5-8, social) ≠ Contemplació (2-4, espiritual)', actdiff.vMax === 8 && actdiff.vSoc >= 0.08 && actdiff.cMax === 4 && actdiff.cEsp >= 0.08, actdiff);

    const tools01 = await page.evaluate(() => {
      const t = ACTIONS.find(a => a.id === 'act_tallar_pedra');
      const forja = ACTIONS.find(a => a.id === 'act_forjar_punta');
      return { tallaNoOut: !t.output_resource, forjaRecipe: (forja.requires || []).some(r => r.resource === 'pedra') && (forja.requires || []).some(r => r.resource === 'branques'), forjaOut: forja.output_resource, forjaPrereq: forja.universal_prereq || (SKILL_DEFS.find(s => (s.unlocks_action_ids || []).includes('act_forjar_punta')) || {}).id };
    });
    check('TOOLS-01 (revisat): eines per habilitat — talla=pràctica (sense output), forjar_punta=recepta→eina', tools01.tallaNoOut && tools01.forjaRecipe && tools01.forjaOut === 'eina', tools01);

    const fb = await page.evaluate(() => {
      const hunt = ACTIONS.find(a => a.id === 'act_espiar_ramat');
      const arr = ACTIONS.find(a => a.id === 'act_recollectar_arrels');
      const cont = ACTIONS.find(a => a.id === 'act_contemplacio');
      return { huntName: hunt.name, huntAssist: !!(hunt.assist && hunt.assist.health_delta === 1 && hunt.assist.consume === 1), arrAssist: !!(arr.assist && arr.assist.output_delta === 1 && arr.assist.consume === 1), contMax: cont.output_max };
    });
    check('FEEDBACK 0630: caça renom + assist (−4, gasta 1 recurs) + contemplació 2-4', fb.huntName === 'Abatre una Presa' && fb.huntAssist && fb.arrAssist && fb.contMax === 4, fb);

    const floater = await page.evaluate(async () => {
      initState('T', 'MED'); renderAll();
      const before = snapshotNums();
      state.food = (state.food || 0) + 3;
      spawnResBalls(before);
      await new Promise(r => setTimeout(r, 260));
      return { balls: document.querySelectorAll('.res-ball').length, pos: document.querySelectorAll('.res-ball-pos').length, donut: !!document.getElementById('exec-donut-wrap') };
    });
    check('FLOATER-01: icones de recurs volen al comptador (res-ball + glow)', floater.balls >= 1 && floater.pos >= 1, floater);

    const lifespan = await page.evaluate(() => {
      initState('T', 'MED'); let age = 0;
      for (let i = 0; i < 30; i++) { state.cycle++; state.food = 50; state.health = 38; applyTurnUpkeep(); age = characterAge(); if (age >= LIFE_EXPECTANCY || state.health <= 0 || state.lifeProgress >= 1) break; }
      return age;
    });
    check('HEALTH-02: personatge sa viu ~LIFE_EXPECTANCY (≥18)', lifespan >= 18, lifespan);

    check('Sense errors de pàgina al carregar/executar', pageErrors.length === 0, pageErrors);
  } catch (e) {
    failed++; console.log('  ✗ HARNESS ERROR — ' + e.message);
  } finally {
    await browser.close();
    serve.kill();
  }
  console.log(`\n${passed} passats, ${failed} fallits`);
  process.exit(failed ? 1 : 0);
})();
