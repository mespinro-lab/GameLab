# Playtest Report — Tycoon (Audit Codi) — Bloodline v2 — 2026-06-14

**Fitxers analitzats**: `prototypes/bloodline-v2/game.js`, `prototypes/bloodline-v2/data.js`
**Total: 12 issues — S1: 1 · S2: 3 · S3: 4 · S4: 4**

---

## S1 — Critical

### V2-01 — `state.reputacio` no es guarda — reset a 0 a cada recàrrega

`saveGame()` (game.js:107–146) serialitza `pedra` i `eina` explícitament però omet `reputacio`. `loadGame()` (game.js:157–192) reconstrueix l'estat camp a camp sense clau `reputacio`. A la pròxima acció que produeixi reputació després de recarregar, `(state['reputacio'] || 0) + output` comença des de 0. La herència cross-gen via `inheritDecay: FAMILY_REP_INHERITANCE` també falla silenciosament.

**Fix directe**: afegir `reputacio: state.reputacio || 0` al save i restore al load. (O eliminar el sistema sencer, solució recomanada).

---

## S2 — Major

### V2-02 — `applyEventEffects()` descarta silenciosament els deltes de reputació

game.js:1644–1657 gestiona food/health/material/pedra/eina però no té branca de `reputacio`. Cinc events amb `effects: { reputacio: +/-N }`: `ev_ritual_cohesio` (+1), `ev_dispute_interna` (-1), `ev_aliat_nou` (+2), `ev_lider_respectat` (+1), `ev_llegat_familiar` (+1). Tots els deltes de reputació es descarten silenciosament.

### V2-03 — Botó de shop mostra 🪨 però cobra material (🔵)

game.js:2023: ``🪨${action.purchase_cost}``. El pagament a game.js:2038–2039 deduce de `state.material`. L'overlay d'upgrade mostra correctament 🔵 (game.js:2349). Inconsistència: la pedra és `state.pedra`, no `state.material`. El jugador veu pedra però perd material.

### V2-04 — Ghost pill desapareix un cop hi ha qualsevol branca activa

game.js:1491: `if (activeBranches.length === 0)` gatea el pill de formació. La pill desapareix exactament quan una segona branca seria més accionable. Un jugador al 90% cap a Artesà mentre té Caçador actiu no veu cap indicador.

---

## S3 — Minor

### V2-05 — `REPUTACIO_PER_CHAR_CAP = 20` definit però mai referenciat a game.js v2

El cap de reputació per personatge no s'aplica. El spam d'accions de reputació acumula indefinidament.

### V2-06 — `reputacio` és un recurs viu fantasma

En RESOURCE_DEFS, a state, escrit per 19+ accions, heretat a successió, però invisible al HUD. Ni el brief ni game.js el reconeixen. Solució: eliminar de RESOURCE_DEFS o reconnectar a calculateScore().

### V2-07 — `act_gran_ritual` té clau `requires` duplicada

data.js:1267–1268: dues entrades `requires` idèntiques. JS descarta la primera silenciosament. Latent però trampa de manteniment.

### V2-08 — Barra de salut usa `HEALTH_MAX` (40) com a divisor en lloc de `healthMax()`

game.js:2415: a edat 0, la barra mostra ~75% quan el personatge és al màxim per al seu cap actual (30).

---

## S4 — Trivial

### V2-09 — `FAMILY_REP_INHERITANCE` enganya mainteners

Usat únicament per `inheritDecay` de reputació en una versió on rep és nominalment eliminat.

### V2-10 — `renderSky()` usa `skyEl.className =` (sobreescriu totes les classes)

game.js:1116. Inofensiu ara però fràgil si s'afegeixen altres classes al sky.

### V2-11 — Accions de reputació no produeixen floater

`snapshotNums()` no rastreja reputació — accions com `act_ritual_foc` no donen feedback visual.

### V2-12 — `ev_fissura_pedra` opció 1: `material_delta: -4` molt sever

data.js:1457. `Math.max(0, ...)` guarda de material negatiu però -4 sobre balanç típic de 2-4 és inusualment dur.

---

## Finding clau

El cluster de reputació (V2-01 a V2-06) és el problema dominant. La resolució directa: eliminar `reputacio` de `RESOURCE_DEFS` i canviar tots els `output_resource: "reputacio"` a `"material"` — resolt V2-02, V2-05, V2-06, V2-09, V2-11 en un sol pas. Fix addicional prioritari: shop 🪨 → 🔵 (V2-03).
