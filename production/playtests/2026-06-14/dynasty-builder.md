# Playtest Report — Dynasty Builder — Bloodline v2 — 2026-06-14

**Fitxers analitzats**: `prototypes/bloodline-v2/game.js`, `prototypes/bloodline-v2/data.js`
**Perspectiva**: Jugador multi-generació, traçat de successió, herència, branques

---

## [PASS] S1 — triggerSuccession() — reputació absent

`triggerSuccession()` (game.js:625–710) auditat línia per línia. Registra genealogia, construeix `inheritedInclination` a `INCLINATION_INHERITANCE_RATE = 0.85`, construeix `inheritedStats` a `STAT_INHERITANCE_RATE = 0.50`, filtra destreses probabilísticament a `DESTRESA_INHERIT_RATE = 0.60`. Zero referències a `inheritedReputacio`, `state.reputacio`, ni cap camp de reputació. `continueSuccession()` tampoc toca reputació. La remoció és neta i completa.

---

## [DESIGN CONCERN — ALTA] S2 — calculateScore() net, però reputació és recurs zombie

`calculateScore()` (game.js:1850–1863): `cycles * 2 + genScore + techs * 100 + skills * 30 + branches * 40 + heirBonus`. Cap menció de reputació a game.js. Però `data.js` defineix `reputacio` com a recurs complet amb `persistent: true`, `inheritDecay: FAMILY_REP_INHERITANCE`, i `startVal: 0`. Constants `REPUTACIO_PER_CHAR_CAP = 20` i `FAMILY_REP_INHERITANCE = 0.6` declarades. Almenys 15 accions produeixen `output_resource: "reputacio"`. Tres events modifiquen reputació (`ev_ritual_cohesio`, `ev_dispute_interna`, `ev_aliat_nou`, `ev_llegat_familiar`).

El recurs acumula a `state.reputacio` i persisteix generacionalment via `inheritDecay`, però `applyEventEffects()` no gestiona `reputacio` — els efectes d'events que el modifiquen es descarten silenciosament.

**Impacte**: El HUD mostra `state.reputacio` creixent (és `section: 'resources'`), el valor és invisible a la puntuació final, i els events que el modifiquen no fan res. Recurs completament desconnectat de conseqüències.

---

## [DESIGN CONCERN — BAIXA] S3 — getFormingBranch(): risc de desbordament Infinity + proximitat de màxims no visualitzada

`getFormingBranch()` (game.js:1144–1163): la variable `pct` s'inicialitza a `Infinity` i únicament s'actualitza quan `cond.min !== undefined && cond.min > 0`. Si una branca tingués NOMÉS condicions `max`, `pct` quedaria a `Infinity`, es clamparia a `1.5`, i apareixeria com a quasi-completa sense que el jugador hi hagi invertit res. Latent perquè totes les branques actuals tenen com a mínim una condició `min > 0`.

La condició `max` d'una branca (e.g. `branch_hunter`: `sociabilitat max: 0.40`) no genera cap senyal quan el jugador s'hi apropa. Un jugador a `sociabilitat = 0.38` amb `impuls = 0.19` veu 100% de progrés Caçador, però una sola acció social podria bloquejar-la. La pèndola no ho indica.

**Branques revisades**: totes (hunter, gatherer, craftsman, mystic) tenen una condició `min` com a mínim. El cas Infinity no es dona amb el dataset actual.

---

## [PASS] S4 — renderSky() / computeLifeProgress()

`computeLifeProgress()` (game.js:1096–1098): `Math.min(1, characterAge() / LIFE_EXPECTANCY)` on `LIFE_EXPECTANCY = 20`. Quatre etapes: albada < 0.25 (edat 0–4), dia < 0.60 (edat 5–11), ocas < 0.85 (edat 12–16), nit >= 0.85 (edat 17–20). `renderSky()` (game.js:1113–1141) targetes `layer-sky` (no `map-zone`). Sol seguit bezier amb `t = Math.min(0.985, progress)`. Cap referència a `map-zone` en tot game.js ni index.html.

---

## [PASS] S5 — Campament stash pedra/eina

`renderZoneNodes()` (game.js:1166–1230) targetes `el('layer-nodes')`. Stash HTML condicional per zona `Campament`: `(state.pedra || 0) > 0 || (state.eina || 0) > 0`. Llegeix `state.pedra` i `state.eina` correctament. Pedra `inheritDecay: 1.0` (100% cross-gen), eina `inheritDecay: 0.3` (30%). Correcte.

---

## [PASS] S6 — Zero referències v1 obsoletes

`map-zone`, `hex-reputation`, `inheritedReputaci`, `reputaci` — zero matches a game.js. `SAVE_KEY = 'bloodline_v2_save'`. `continueSuccession()` no conté cap `inheritedReputacio`.

---

## [BUG — LATENT, BAIXA] S7 — act_gran_ritual: camp `requires` duplicat

`data.js` línies 1265–1267: `requires` declarat dues vegades al mateix literal d'objecte. JS descarta silenciosament la primera. Les dues línies són idèntiques, de manera que el comportament actual és correcte per accident. Si una futura edició modifica la primera declaració però no la segona, el requisit s'ignorarà sense error.

---

## [PASS] S8 — Traçat multi-generació (3–5 gens)

**Herència d'inclinació (INCLINATION_INHERITANCE_RATE = 0.85)**:

| Gen | impuls inici | assolible en 20 torns |
|-----|-------------|----------------------|
| 1   | 0.00        | ~0.55 |
| 2   | 0.47        | ~0.70 |
| 3   | 0.60        | ~0.75 |
| 4   | 0.64        | ~0.78 |
| 5   | 0.66        | converge ~0.80 |

Identitat Caçador (impuls > 0.18) estabilitzada des de la gen 2. La taxa del 85% és robusta per preservar identitat de dinastia.

**Herència de stats (STAT_INHERITANCE_RATE = 0.50)**: `estat_fill = estat_pare * 0.50 + base * 0.50`. Plateau estable a llarg termini (si pare acaba a 3.0, fill comença a 2.0 — no desborda). Taxa conservadora; un jugador que portà forca a 5.0 veu el fill commençar a 3.0.

**Herència de destreses (DESTRESA_INHERIT_RATE = 0.60, DESTRESA_MAX = 3)**: amb 3 destreses, expectativa heretada = 1.8. Deixa ~1.2 ranures lliures per adquirir noves destreses. Equilibrat.

**Habilitats (probabilístic per `bt.inheritanceRate`, +0.5 amb `act_ensenyar`)**: Sense ensenyar, ~40% d'habilitats heretades. Amb ensenyar, 85-95% per habilitat. La mecànica d'ensenyament funciona com a amplificador d'herència intencional.

---

## [DESIGN CONCERN — MITJA] S9 — Finestra cercar_parella/tenir_fills sense avís

`act_cercar_parella`: `minAge: 5, maxAge: 14`. `act_tenir_fills`: `maxAge: 15`. Probabilitat de fracàs de l'embaràs: `1 - (0.30 + healthRatio * 0.65)`. Amb salut 30/40 (75%): ~21% fracàs. Encadenant 3 fracassos (probabilitat ~0.009), el jugador pot esgotar el maxAge:15 sense fills. Cap avís visible in-game quan `cercar_parella` s'acosta al maxAge. El `sun-cap` mostra cicles restants de vida però no el deadline d'acció.

**Impacte**: Extinció per `no_heir` pot semblar injusta — causada per una limitació d'edat no comunicada, no per una decisió explícita del jugador.

---

## [DESIGN CONCERN — ALTA] S10 — Recurs `reputacio` a RESOURCE_DEFS: render al top bar, zero impacte en puntuació

`reputacio` és `section: 'resources'` (data.js:100). El top bar renderitza tots els recursos per secció → `state.reputacio` acumula visualment. Però no contribueix a `calculateScore()` ni és referenciada a cap gate, condició de branca, requisit d'acció, ni resultat narratiu. Recurs complet sense efecte.

`applyEventEffects` (game.js:1644–1657) no gestiona `fx.reputacio`. Events com `ev_ritual_cohesio` amb `effects: { reputacio: +1 }` produeixen zero canvi observable. El text de l'event "El ritual reforça la cohesió del grup." no es correspon amb cap canvi numèric.

**Verdict**: Discrepància crítica entre brief ("Reputació ELIMINADA") i implementació (recurs zombie complet al data layer). Cal: (a) eliminar `reputacio` de `RESOURCE_DEFS`, de tots els `output_resource`, i dels tres efectes d'event, o (b) reconnectar a `calculateScore()` i `applyEventEffects`. Estat actual: split-brain.

---

## Taula resum

| ID | Àrea | Resultat | Severitat |
|----|------|----------|-----------|
| S1 | triggerSuccession() — sense reputació | PASS | — |
| S2 | calculateScore() / renderEndScreen() | PASS (score) / DESIGN CONCERN (zombie) | ALTA |
| S3 | getFormingBranch() — Infinity latent + gap max-bound | DESIGN CONCERN | BAIXA |
| S4 | renderSky() / computeLifeProgress() | PASS | — |
| S5 | Campament stash pedra/eina | PASS | — |
| S6 | Referències v1 obsoletes | PASS | — |
| S7 | Duplicate `requires` act_gran_ritual | BUG latent | BAIXA |
| S8 | Traçat 3–5 gens | PASS | — |
| S9 | cercar_parella maxAge sense avís | DESIGN CONCERN | MITJA |
| S10 | reputacio zombie, efectes events silenciats | DESIGN CONCERN | **ALTA** |
