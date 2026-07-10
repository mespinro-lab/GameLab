# Turn Sequence Pipeline — Architecture Specification

**Autor**: gameplay-programmer  
**Data**: 2026-07-10  
**Versió**: 1.0  
**Estat**: DRAFT — pendent d'aprovació per lead-programmer

---

## 1. Context i problema (SEQ-01)

El bug SEQ-01 s'ha intentat solucionar 4+ vegades amb pegats parcials:
canvis de valors de `setTimeout`, revertir comptadors, ajustos de timing.
Cap ha resolt el problema de fons perquè **el pipeline no és explícitament
seqüencial**: usa `setTimeout` encadenats ad-hoc que no composen bé i
creen condicions de carrera quan el jugador actua ràpid.

Fitxer afectat: `prototypes/bloodline-v2/game.js`  
Funcions afectades: `executeAction`, `proceedToEndOfTurn`, `beginEndOfTurnPhase`,
`spawnResBalls`, `dismissEvent`, `resolveDiscoveryOption`, `dismissDiscovery`,
`dismissBirth`, `afterDismiss`.

---

## 2. Anàlisi del pipeline actual (estat buggy)

### 2.1 Flux nominal (sense event)

```
t=0       Jugador toca l'acció
t=0       showDonutAnimation() — inicia animació del donut (1250ms, setTimeout intern)
t=1250ms  callback del donut:
            applyCostEffects()       — token, cost, inclinació, stats...
            spawnResBalls(snapCost)  — boles cost volen (fire-and-forget)
            applyFxFloaters(snapCost)
            applyOutputEffects()     — food, side_effects
            spawnResBalls(snapOut)   — boles output volen (fire-and-forget)
            applyFxFloaters(snapOut)
            renderAll()              — ① DOM actualitzat amb valors finals correctes
            TOKEN-FLIGHT HACK:       — ② DOM revertit manualment als valors pre-output
              el('hex-food').textContent   = snapOut.food
              el('hex-health').textContent = snapOut.health
              el('tok-token-val').textContent = snapOut.token
            setTimeout(() => { renderAll(); proceedToEndOfTurn(); }, 920)  ← TIMER A
t=2170ms  TIMER A: renderAll() + proceedToEndOfTurn() → beginEndOfTurnPhase()
t=2170ms  showDonutAnimation({icon:'🌙'}) — EOT donut (1250ms)
t=3420ms  callback EOT: cycle++, upkeep, renderAll(), saveGame()
```

### 2.2 Flux amb event (bug actiu)

```
t=0       Jugador toca l'acció
t=1250ms  callback del donut (igual que abans fins al TOKEN-FLIGHT):
            state.pendingEvent = {...}   ← s'ha disparat un event
            renderAll()                 — ① event card JA visible (overlay-action)
            TOKEN-FLIGHT HACK           — ② revert comptadors
            setTimeout(() => { renderAll(); saveGame(); }, 920)  ← TIMER A
            return  ← NO schedule TIMER B (proceedToEndOfTurn diferit)

t=1250ms  L'event card és visible. Jugador pot interactuar immediatament.

t=1250+ε  Jugador toca "Continua" (dismissEvent):
            applyEventEffects()
            spawnResBalls(snapDismiss)
            renderAll(); saveGame();     — ③ renderAll() trenca TOKEN-FLIGHT hack
            setTimeout(() => proceedToEndOfTurn(), 200)  ← TIMER B

t=1450+ε  TIMER B: proceedToEndOfTurn() → beginEndOfTurnPhase()
t=1450+ε  EOT donut comença

t=2170ms  TIMER A: renderAll(); saveGame()
          ← PROBLEMA: renderAll() s'executa ENMIG del donut EOT
          ← Pot desplaçar l'overlay, actualitzar comptadors amb valors incorrectes,
          ← o interferir amb l'animació CSS del donut
```

### 2.3 Problema TOKEN-FLIGHT

El truc TOKEN-FLIGHT (línies 1258–1261 del game.js actual) fa:
```js
renderAll();  // actualitza DOM correctament
// Immediatament SOBREESCRIU el DOM amb valors antics:
el('hex-food').textContent   = `${Math.round(snapOut.food)}/${foodMax()}`;
el('hex-health').textContent = `${Math.round(snapOut.health)}`;
el('tok-token-val').textContent = `${Math.round(snapOut.token)}`;
```

Fragilitats:
- Qualsevol `renderAll()` dins la finestra de 920ms (des de qualsevol ruta de codi)
  restaura els valors reals i trenca el truc visual.
- Cobreix només 3 dels 6 recursos de `snapshotNums()` (no cobreix forca/enginy/vincle).
- Els 920ms és una constant màgica: si l'animació CSS canvia, els 920ms es desincronitzen.

### 2.4 Codi mort identificat

- `state.pendingActionResult` i `applyPendingActionResult()`: mai cridats des de
  l'intent de fix parcial SEQ-01. Poden eliminar-se.
- `state.pendingEndOfTurn`: pot eliminar-se si `drainPendingCards()` gestiona
  l'espera de manera explícita (vegeu secció 4).

---

## 3. Comportament correcte (especificació de la UX)

```
1. Jugador toca l'acció.
2. Donut d'acció apareix i anima (1250ms).
3. Quan el donut acaba: efectes de cost s'apliquen, boles de cost volen cap als
   comptadors.
4. Efectes d'output s'apliquen, boles d'output volen cap als comptadors.
5. Quan TOTES les boles han aterrat: els comptadors s'actualitzen al valor final.
   [Sense revert manual del DOM. Sense setTimeout fixe de 920ms.]
6. Si hi ha event → l'event card apareix. El jugador escull/continua.
7. Quan l'event es resol → les boles de l'event effect volen i aterren.
8. Si hi ha descobriments pendents (pendingDiscoveries) → apareix cada targeta
   en seqüència; el jugador les dismisses una a una.
9. Quan no queda cap targeta pendent: donut de fi de torn (🌙) apareix.
10. Quan el donut EOT acaba: cycle++, upkeep, successió/mort si toca.
11. Nou torn.
```

---

## 4. Arquitectura proposada: pipeline Promise-based

### 4.1 Principi fonamental

Substituir els `setTimeout` ad-hoc encadenats per un `async function`
que expressa la seqüència com a codi lineal. Cada pas "espera" el pas
anterior sense conèixer els temps absoluts.

Tres tipus d'espera:
| Tipus | Mecanisme | Exemple |
|-------|-----------|---------|
| Animació CSS/Timer | `showDonutAnimationAsync()` wraps setTimeout en Promise | Donut 1250ms |
| Animació DOM (boles) | `waitForAllBalls()` — comptador de boles en vol | Res-balls 880ms màxim |
| Interacció jugador | `waitForEventResolution()` — Promise resolta per un botó | Event card |

### 4.2 Diagrama de seqüència

```
PLAYER TAP
    │
    ▼
executeAction(actionId)          [guards, find action, call runTurnPipeline]
    │
    ▼
runTurnPipeline(action)          [async]
    │
    ├─► await showDonutAnimationAsync(action)     [1250ms]
    │
    ├─► applyCostEffects(action, snapCost)        [sync]
    │   spawnResBalls(snapCost)                  [fire+forget, incrementa _ballCount]
    │   applyFxFloaters(snapCost)                [sync]
    │
    ├─► applyOutputEffects(action, snapOut)       [sync]
    │   spawnResBalls(snapOut)                   [fire+forget, incrementa _ballCount]
    │   applyFxFloaters(snapOut)                 [sync]
    │
    │   [check mort per cost/output → if dead: triggerSuccession(), return]
    │
    ├─► await waitForAllBalls()                  [espera que _ballCount torni a 0]
    │   renderAll()                              [ara, i NOMÉS ara, actualitza comptadors]
    │   saveGame()
    │
    ├─► await drainPendingCards()                [gestiona event + discoveries + births]
    │       │
    │       │   while (pendingEvent || pendingDiscoveries.length || pendingBirths.length)
    │       │       renderAll()
    │       │       if pendingEvent:
    │       │           await waitForEventResolution()
    │       │           [dismissEvent/resolveDiscoveryOption apliquen efectes + boles]
    │       │           await waitForAllBalls()
    │       │           renderAll()
    │       │           [check mort → if dead: triggerSuccession(), return false]
    │       │       elif pendingDiscoveries:
    │       │           await waitForDiscoveryDismiss()
    │       │       elif pendingBirths:
    │       │           await waitForBirthDismiss()
    │       │   return true
    │
    ├─► await delay(200)                         [pausa visual breu pre-EOT]
    │
    ├─► await runEndOfTurnPhase()                [async]
    │       │
    │       ├─► await showDonutAnimationAsync({_icon:'🌙', name:'Fi de torn'})
    │       │
    │       │   [rang EOT gris mentre gira]
    │       │
    │       ├─► [callback: cycle++, autoDiscoverUniversalTechs, applyTurnUpkeep]
    │       │   applyFxFloaters(snapEot)
    │       │   [age-gate notifications → push pendingDiscoveries]
    │       │   [partner warning → push pendingDiscoveries]
    │       │   [complete turn history entry]
    │       │   [succession/death check → triggerSuccession() if needed]
    │       │   renderAll()
    │       │   saveGame()
    │       │
    │       └─► [si hi ha pendingDiscoveries de l'EOT: drainPendingCards()]
    │
    └─► [torn acabat — jugador pot tornar a tocar]
```

---

## 5. API de les funcions noves

### 5.1 Capa d'animació (wraps en Promises)

```js
/**
 * Wraps showDonutAnimation en una Promise.
 * Resol quan el donut ha acabat d'animar (a l'interior del setTimeout de 1250ms).
 * Substitueix: showDonutAnimation(action, label, callback) amb callback inline.
 * @param {Object} action  — l'acció (o {_icon, name} per al donut EOT)
 * @param {string|null} label
 * @returns {Promise<void>}
 */
async function showDonutAnimationAsync(action, label)
```

```js
/**
 * Retorna una Promise que es resol quan TOTES les boles en vol hagin aterrat.
 * Si no hi ha boles en vol (_ballCount === 0), es resol immediatament.
 * @returns {Promise<void>}
 */
function waitForAllBalls()
```

### 5.2 Capa d'interacció (resolvers de jugador)

Cada funció retorna una Promise. El resolver es guarda en una variable de mòdul
i és cridat per la funció de dismiss corresponent quan el jugador interactua.

```js
/**
 * Retorna una Promise que es resol quan el jugador tanca l'event card
 * (via dismissEvent() o resolveDiscoveryOption()).
 * @returns {Promise<void>}
 */
function waitForEventResolution()

/**
 * Retorna una Promise que es resol quan el jugador tanca una discovery card
 * (via dismissDiscovery()).
 * @returns {Promise<void>}
 */
function waitForDiscoveryDismiss()

/**
 * Retorna una Promise que es resol quan el jugador tanca una birth card
 * (via dismissBirth()).
 * @returns {Promise<void>}
 */
function waitForBirthDismiss()

/**
 * Pausa de ms mil·lisegons. Utility per a les pauses visuals breus.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function delay(ms)
```

### 5.3 Pipeline principal

```js
/**
 * Orquestra tot el torn: donut acció → efectes → boles → event/descobriments → EOT.
 * Crida des d'executeAction() com a punt d'entrada únic.
 * @param {Object} action  — l'acció validada
 * @returns {Promise<void>}
 */
async function runTurnPipeline(action)

/**
 * Drena totes les targetes pendents (event, discoveries, births) en seqüència.
 * Cada targeta espera la interacció del jugador.
 * @returns {Promise<boolean>}  false si el personatge ha mort durant el drenatge
 */
async function drainPendingCards()

/**
 * Executa la fase EOT: donut 🌙, cycle++, upkeep, successió, guarda.
 * Substitueix beginEndOfTurnPhase() i proceedToEndOfTurn().
 * @returns {Promise<void>}
 */
async function runEndOfTurnPhase()
```

### 5.4 Variables de mòdul noves (fora de `state`)

```js
// Comptador de boles en vol. Incrementat per spawnResBalls(), decrementat
// en el setTimeout de cleanup de cada bola.
let _ballCount = 0;

// Resolver que waitForAllBalls() guarda. Cridat quan _ballCount arriba a 0.
let _allBallsResolver = null;

// Resolvers d'interacció de jugador (null quan no hi ha cap espera activa).
let _resolveEvent     = null;
let _resolveDiscovery = null;
let _resolveBirth     = null;
```

---

## 6. Pseudocodi de les funcions clau

### 6.1 `spawnResBalls` modificada

```js
function spawnResBalls(before) {
  const cur = snapshotNums();
  const resConfig = [
    { key: 'food',   targetId: 'hex-food',    emoji: '🌾' },
    { key: 'health', targetId: 'hex-health',  emoji: '❤️' },
    { key: 'token',  targetId: 'tok-token',   emoji: '🔵' },
  ];
  const sourceEl = el('exec-donut-wrap');
  if (!sourceEl) return;

  // ... [codi existent de geometria: srcRect, tRect, etc.] ...

  resConfig.forEach(({ key, targetId, emoji }) => {
    const delta = Math.round((cur[key] || 0) - (before[key] || 0));
    if (delta === 0) return;
    const targetEl = el(targetId);
    if (!targetEl) return;
    const count = Math.min(Math.abs(delta), 5);

    for (let i = 0; i < count; i++) {
      _ballCount++;                              // ← NOU: comptador global
      setTimeout(() => {
        const ball = document.createElement('div');
        // ... [codi existent de creació de ball] ...
        document.body.appendChild(ball);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          // ... [codi existent de transició CSS] ...
          setTimeout(() => {
            ball.remove();
            // ... [codi existent de tok-bump] ...
            _ballCount--;                        // ← NOU: decrementar
            if (_ballCount === 0 && _allBallsResolver) {
              const resolve = _allBallsResolver;
              _allBallsResolver = null;
              resolve();                         // ← NOU: desbloqueja waitForAllBalls
            }
          }, 560);
        }));
      }, i * 80);
    }
  });
}
```

### 6.2 `waitForAllBalls`

```js
function waitForAllBalls() {
  if (_ballCount === 0) return Promise.resolve();
  return new Promise(resolve => {
    _allBallsResolver = resolve;
  });
}
```

### 6.3 `showDonutAnimationAsync`

```js
function showDonutAnimationAsync(action, label) {
  return new Promise(resolve => {
    showDonutAnimation(action, label, resolve);
  });
}
```

La funció `showDonutAnimation` existent no canvia. Simplement es wraps.

### 6.4 `runTurnPipeline` (flux normal, sense discovery action)

```js
async function runTurnPipeline(action) {
  hide('overlay-zone-actions');
  await showDonutAnimationAsync(action, null);

  // ── FASE COST ──────────────────────────────────────────────────────────
  const snapCost = snapshotNums();
  applyCostEffects(action);          // token, food cost, inclination, stats,
                                     // character effects, counters, destreses,
                                     // zones, log
  spawnResBalls(snapCost);
  applyFxFloaters(snapCost);

  // Mort per cost (execute_cost) — exit primerenc
  if (state.health <= 0) {
    state._pendingTurnEntry = null;
    state.pendingEvent = null;
    triggerSuccession();
    renderAll(); saveGame();
    return;
  }

  // ── FASE OUTPUT ────────────────────────────────────────────────────────
  const snapOut = snapshotNums();
  applyOutputEffects(action);        // food, side_effects, assist consume
  spawnResBalls(snapOut);
  applyFxFloaters(snapOut);

  // Mort per output (side effect de salut negatiu)
  if (state.health <= 0) {
    state._pendingTurnEntry = null;
    triggerSuccession();
    renderAll(); saveGame();
    return;
  }

  // ── ESPERA BOLES ──────────────────────────────────────────────────────
  // Cap renderAll() fins que TOTES les boles hagin aterrat.
  // Elimina la necessitat del TOKEN-FLIGHT hack.
  await waitForAllBalls();
  renderAll();
  saveGame();

  // ── FASE TARGETES (event, descobriments, naixements) ──────────────────
  const survived = await drainPendingCards();
  if (!survived) return;

  // ── FASE EOT ──────────────────────────────────────────────────────────
  await delay(200);
  await runEndOfTurnPhase();
}
```

**Nota sobre `applyCostEffects` i `applyOutputEffects`:** Aquestes no son funcions
noves, son extraccions del bloc existent dins el callback de `showDonutAnimation`.
El refactor mou el codi, no el canvia. S'explica a la secció 8.

### 6.5 `drainPendingCards`

```js
async function drainPendingCards() {
  while (
    state.pendingEvent ||
    state.pendingDiscoveries.length > 0 ||
    state.pendingBirths.length > 0
  ) {
    renderAll();   // assegura que la targeta és visible

    if (state.pendingEvent) {
      await waitForEventResolution();
      // dismissEvent() o resolveDiscoveryOption() ja han aplicat efectes,
      // spawnejat boles i actualitzat state.pendingEvent = null
      await waitForAllBalls();
      renderAll();
      saveGame();
      if (state.health <= 0 || state.lifeProgress >= 1) {
        state._pendingTurnEntry = null;
        triggerSuccession();
        renderAll(); saveGame();
        return false;
      }
    } else if (state.pendingDiscoveries.length > 0) {
      await waitForDiscoveryDismiss();
      // dismissDiscovery() ja ha fet shift() i actualitzat l'estat
    } else if (state.pendingBirths.length > 0) {
      await waitForBirthDismiss();
    }
  }
  return true;
}
```

### 6.6 `runEndOfTurnPhase`

```js
async function runEndOfTurnPhase() {
  const ring = el('exec-donut-ring');
  if (ring) ring.style.stroke = '#888';

  await showDonutAnimationAsync({ _icon: '🌙', id: '_eot', name: 'Fi de torn' }, null);

  if (ring) ring.style.stroke = 'var(--gold)';
  const snapEot = snapshotNums();
  state.cycle++;
  autoDiscoverUniversalTechs();
  applyTurnUpkeep();
  applyFxFloaters(snapEot);

  // Age-gate notifications
  for (const a of ACTIONS.filter(x => x.is_base && x.minAge)) {
    // ... [codi existent] ...
  }
  // Partner warning
  // ... [codi existent] ...

  // Complete turn history entry
  // ... [codi existent] ...

  // Succession / death check
  if (characterAge() >= LIFE_EXPECTANCY || state.health <= 0 || state.lifeProgress >= 1) {
    triggerSuccession();
    return;
  }

  renderAll();
  saveGame();

  // Si l'EOT ha generat discoveries (age-gate, partner warning), drenatge addicional
  if (state.pendingDiscoveries.length > 0 || state.pendingBirths.length > 0) {
    await drainPendingCards();
  }
}
```

### 6.7 Dismiss handlers actualitzats

```js
function dismissEvent() {
  const ev = state.pendingEvent;
  if (!ev) return;
  // ... [codi existent: trackEventFired, applyEventEffects, spawnResBalls,
  //      applyFxFloaters, LOG-01 entry] ...
  state.pendingEvent = null;
  // ← ELIMINA: setTimeout(() => proceedToEndOfTurn(), 200)
  // ← AFEGEIX:
  if (_resolveEvent) { const r = _resolveEvent; _resolveEvent = null; r(); }
}

function resolveDiscoveryOption(optionIndex) {
  // ... [codi existent: aplica opcions, spawnResBalls, etc.] ...
  state.pendingEvent = null;
  // ← ELIMINA: setTimeout(() => proceedToEndOfTurn(), 200)
  // ← AFEGEIX:
  if (_resolveEvent) { const r = _resolveEvent; _resolveEvent = null; r(); }
}

function dismissDiscovery() {
  // ... [codi existent: LOG-01, shift()] ...
  state.pendingDiscoveries.shift();
  // ← ELIMINA: afterDismiss()
  // ← AFEGEIX:
  if (_resolveDiscovery) { const r = _resolveDiscovery; _resolveDiscovery = null; r(); }
}

function dismissBirth() {
  state.pendingBirths.shift();
  // ← ELIMINA: afterDismiss()
  // ← AFEGEIX:
  if (_resolveBirth) { const r = _resolveBirth; _resolveBirth = null; r(); }
}
```

### 6.8 `executeAction` simplificada

```js
function executeAction(actionId) {
  if (state.pendingEvent || state.pendingSuccession || state.gameOver) return;
  const action = ACTIONS.find(a => a.id === actionId);
  if (!action || !isActionOwned(action)) return;
  if (getActionVisibility(action) !== 'ACTIVE') return;
  const age = characterAge();
  if (isActionTooYoung(action)) return;
  if (action.maxAge !== undefined && age > action.maxAge) return;
  if (!evaluateCharacterRequires(action)) return;

  if ((action.execute_cost || 0) > 0 && state.food < action.execute_cost) {
    addLog('No tens prou provisions');
    renderAll();
    return;
  }

  // Discovery action — camí especial (manté el seu showDonutAnimation existent
  // o es migra a runDiscoveryPipeline(action) seguint el mateix patró)
  if (action.is_discovery_action) {
    runDiscoveryPipeline(action);  // async, mateixa estructura que runTurnPipeline
    return;
  }

  // Inicialitzar entry del torn
  // ... [codi existent per a _pendingTurnEntry] ...

  runTurnPipeline(action);  // async — no await (l'event loop gestiona la continuació)
}
```

---

## 7. Funcions i codi a eliminar

| Element | Motiu d'eliminació |
|---------|-------------------|
| `afterDismiss()` | Substituïda per `drainPendingCards()` |
| `proceedToEndOfTurn()` | Substituïda per `drainPendingCards()` + `runEndOfTurnPhase()` |
| `beginEndOfTurnPhase()` | Substituïda per `runEndOfTurnPhase()` |
| `state.pendingEndOfTurn` | Ja no cal: la seqüència és explícita |
| `state.pendingActionResult` | Codi mort; mai cridat des del fix parcial SEQ-01 |
| `applyPendingActionResult()` | Codi mort; ídem |
| TOKEN-FLIGHT hack (línies 1258–1261) | Substituït per `await waitForAllBalls()` |
| `setTimeout(() => proceedToEndOfTurn(), 200)` x2 | Substituïts per el resolver del dismiss |
| `setTimeout(() => { renderAll(); saveGame(); }, 920)` | Substituït per `await waitForAllBalls()` |
| `setTimeout(() => { renderAll(); proceedToEndOfTurn(); }, 920)` | Substituït per `await waitForAllBalls()` |

---

## 8. Notes d'implementació i efectes secundaris a vigilar

### 8.1 Extracció de `applyCostEffects` i `applyOutputEffects`

El cos del callback de `showDonutAnimation` en `executeAction` (aprox. línies
1121–1271) s'ha de dividir en dues funcions pures extretes:

- `applyCostEffects(action)`: tot des de "FASE COST" fins a `spawnResBalls(snapCost)`
  (token, execute_cost, elderBonus, aprMatBonus, foodUpkeepReduction, foodMax delta,
  inclination, stats, charEffect, actionUseCounts, destreses, aprenentatges, zones).
- `applyOutputEffects(action)`: càlcul i aplicació d'output + side_effects + assist.

Aquestes extraccions no canvien la lògica; reorganitzen el codi existent.

### 8.2 `_ballCount` pot quedar a 0 ràpidament si no hi ha deltes

Si cap recurs ha canviat (output = 0, sense side effects), `spawnResBalls` no
incrementa `_ballCount`. `waitForAllBalls()` retorna `Promise.resolve()` immediatament.
Comportament correcte — no cal gestió especial.

### 8.3 `_ballCount` acumulatiu entre cost i output

`spawnResBalls(snapCost)` i `spawnResBalls(snapOut)` s'executen una darrere l'altra
(síncronament, dins el mateix flux async). Ambdues incrementen `_ballCount`. Quan
arriba a 0 (l'última bola de qualsevol de les dues crides aterra), es resol. Això
és correcte: garanteix que TOTES les boles (tant cost com output) han aterrat
abans de cridar `renderAll()`.

### 8.4 Boles d'event dins `drainPendingCards`

`dismissEvent()` i `resolveDiscoveryOption()` criden `spawnResBalls(snapDismiss)`.
Dins `drainPendingCards`, el pipeline fa `await waitForAllBalls()` DESPRÉS de que
el dismiss hagi retornat. Perquè funcioni:
- El dismiss crida primer el resolver (`_resolveEvent()`)
- `drainPendingCards` desbloqueig de `waitForEventResolution()` i avança al `await waitForAllBalls()`
- `_ballCount` ja inclou les boles de l'event (spawnejades pel dismiss síncronament)

ATENCIÓ: `dismissEvent()` ha de cridar `spawnResBalls` ABANS de cridar el resolver,
perquè `_ballCount` ja estigui incrementat quan `drainPendingCards` arriba al
`await waitForAllBalls()`.

Ordre correcte dins `dismissEvent()`:
```
1. applyEventEffects()
2. spawnResBalls(snapDismiss)     ← _ballCount incrementat
3. applyFxFloaters(snapDismiss)
4. state.pendingEvent = null
5. _resolveEvent()                ← ÚLTIM: desbloqueja drainPendingCards
```

### 8.5 `saveGame()` dins el pipeline async

El `saveGame()` actual es crida en múltiples punts del flux. En la nova
arquitectura, el patró és: `await waitForAllBalls(); renderAll(); saveGame()`.
Assegurar que `saveGame()` NO és `async` i no conté `await` (ara és síncrona —
manté-la síncrona).

### 8.6 `renderAll()` dins callbacks `showDonutAnimationAsync`

`showDonutAnimationAsync` oculta el donut overlay i crida `onComplete()` (= resolve).
Dins `runEndOfTurnPhase`, el codi que segueix el `await` fa `applyFxFloaters` i
modificacions d'estat. Assegurar que `renderAll()` no és cridat des de `showDonutAnimation`
(la funció interna); el `renderAll()` el fa el codi que segueix l'`await`, de manera
explícita.

### 8.7 Discovery action (camí especial)

L'acció `is_discovery_action` té el seu propi camí a `executeAction`. S'ha de
migrar al patró async creant `runDiscoveryPipeline(action)`:

```js
async function runDiscoveryPipeline(action) {
  // ... getEligibleSkills, chose ...
  hide('overlay-zone-actions');
  await showDonutAnimationAsync(action, null);
  const snap = snapshotNums();
  unlockSkill(chosen);
  applyFxFloaters(snap);
  addLog(...);
  state._pendingTurnEntry = {...};
  await runEndOfTurnPhase();
}
```

### 8.8 No reentrància

Amb el pipeline async, un segon tap mentre el pipeline és en curs hauria de
ser blocat. El guard existent `if (state.pendingEvent || state.pendingSuccession
|| state.gameOver) return;` cobreix alguns casos, però no tots els estats intermedis
del pipeline (per exemple, mentre les boles volen).

Solució recomanada: afegir una variable de mòdul `_pipelineRunning = false` i
fer:
```js
function executeAction(actionId) {
  if (_pipelineRunning) return;
  // ...guards existents...
  _pipelineRunning = true;
  runTurnPipeline(action).finally(() => { _pipelineRunning = false; });
}
```

Alternativament, el guard `document.querySelector('#exec-donut-overlay:not(.hidden)')`
ja existeix en alguns llocs; però la variable explícita és més robusta.

### 8.9 Compatibilitat amb el sistema de tests

Els tests headless de Playwright (`tests/headless/run.cjs`) interactuen amb el
joc via clics. Amb el pipeline async, els events de clic que arriben als
handlers de dismiss (dismissEvent, dismissDiscovery, etc.) resoldran les Promises
de manera natural. No cal cap canvi als tests.

---

## 9. Fitxers afectats

| Fitxer | Canvis |
|--------|--------|
| `prototypes/bloodline-v2/game.js` | Totes les funcions de la secció 5 i 6. Eliminació de les funcions de la secció 7. |
| `prototypes/bloodline-v2/data.js` | Cap canvi (contingut no afectat) |
| `prototypes/bloodline-v2/index.html` | Cap canvi (HTML i event listeners no canvien) |
| `prototypes/bloodline-v2/style.css` | Cap canvi (animacions CSS no canvien) |
| `tests/headless/run.cjs` | Verificar compatibilitat post-refactor (esperem que cap canvi) |

---

## 10. Acceptance Criteria

### AC-1: Seqüència explícita sense setTimeout ad-hoc

- Cap `setTimeout` per a control de flux del torn (excepció: els `setTimeout`
  interns de `showDonutAnimation` i `spawnResBalls` per a timing d'animació).
- El pipeline és llegible com a codi lineal sense rastrejar timers manuals.

### AC-2: Comptadors actualitzats quan les boles aterren

- Executar una acció que generi +3 aliment.
- Els comptadors (hex-food) mostren el valor pre-acció mentre les boles volen.
- Exactament quan aterra la darrera bola, els comptadors mostren el valor correcte.
- Cap salt visual: el valor NO ha d'haver aparegut i desaparegut abans.

### AC-3: Token-flight eliminat

- No existeix cap bloc de codi que sobreescrigui `el('hex-food').textContent`,
  `el('hex-health').textContent`, o `el('tok-token-val').textContent` immediatament
  despres d'un `renderAll()` (el TOKEN-FLIGHT hack).

### AC-4: Sense condicions de carrera amb event

- Executar una acció que dispari un event.
- Tancar l'event card immediatament (< 500ms després que aparegui).
- Verificar que el donut EOT NO rep cap `renderAll()` extern mentre anima.
- Verificar que el cicle s'incrementa exactament +1 per torn.

### AC-5: Mort durant event gestionada correctament

- Configurar un event amb `fx.health = -99`.
- Executar l'acció i resoldre l'event.
- Verificar que `triggerSuccession()` s'executa i el pipeline no continua al EOT.

### AC-6: Discovery action segueix el flux correcte

- Executar l'acció "Escoltar els Estrangers".
- Verificar que el donut d'acció apareix, la skill s'assigna, i el donut EOT
  segueix sense setTimeout intermedis.

### AC-7: Múltiples targetes pendents resoltes en seqüència

- Configurar un estat amb 1 event + 2 pendingDiscoveries.
- Executar l'acció.
- Verificar que les 3 targetes apareixen en ordre: event → discovery[0] → discovery[1].
- Verificar que l'EOT comença NOMÉS quan les 3 targetes s'han tancat.

### AC-8: Tests headless passen

- `node tests/headless/run.cjs` no produeix cap fallada nova.

### AC-9: No reentrància

- Tocar dues accions ràpidament (< 100ms entre els dos taps).
- Verificar que el cicle s'incrementa exactament +1 (no +2).

---

## 11. Ordre d'implementació recomanat

1. Afegir `delay()` i `_ballCount` / `waitForAllBalls()` + modificar `spawnResBalls`
   (el canvi més petit i aïllat; testable immediatament).
2. Afegir `showDonutAnimationAsync` (wraps existent).
3. Afegir variables `_resolveEvent`, `_resolveDiscovery`, `_resolveBirth` i les
   funcions `waitForXxx()` corresponents.
4. Modificar `dismissEvent`, `resolveDiscoveryOption`, `dismissDiscovery`, `dismissBirth`
   per a cridar els resolvers en comptes dels `setTimeout`.
5. Extreure `applyCostEffects` i `applyOutputEffects` del cos del callback de donut.
6. Implementar `drainPendingCards` i `runEndOfTurnPhase`.
7. Implementar `runTurnPipeline` i `runDiscoveryPipeline`.
8. Modificar `executeAction` per a cridar `runTurnPipeline` / `runDiscoveryPipeline`.
9. Eliminar `afterDismiss`, `proceedToEndOfTurn`, `beginEndOfTurnPhase`,
   `applyPendingActionResult`, `state.pendingActionResult`, `state.pendingEndOfTurn`.
10. Verificar tots els AC. Executar `node tests/headless/run.cjs`.
