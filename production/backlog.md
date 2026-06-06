# Production Backlog — Bloodline (JS prototype)

<!-- GESTIONAT per /drive i /feedback-loop. Editable a mà; mantén el format de capçalera de tasca. -->
<!--                                                                                                  -->
<!-- FORMAT DE CAPÇALERA: ## [PRIOR] [ESTAT] [TIPUS] — [ID] — Títol                                 -->
<!--   PRIOR: P0 (aquesta sessió) | P1 (propera sessió) | P2 (pròximament) | P3 (backlog llunyà)     -->
<!--   ESTAT: OPEN | IN-PROGRESS | DONE | BLOCKED | DEFERRED                                         -->
<!--   TIPUS: BUG | FEAT | BALANCE | CONTENT | DESIGN | QA | DOCS                                    -->
<!--                                                                                                  -->
<!-- TARGET: prototypes/bloodline/ (game.js, data.js, index.html, style.css)                         -->
<!-- GODOT (src/bloodline/) ABANDONAT — no afegir tasques que apuntin a fitxers Godot                -->

---

## P1 DONE BUG — PT-01 — Double count visual de tokens (0→2→1)

- **File**: `prototypes/bloodline/game.js`
- **Fix**: Arrel: events amb `token_delta` negatiu eren invisibles al jugador. Ara els botons d'opció mostren `[+N🌾 −N🧠]` per cada opció. El 0→2→1 és comportament correcte (acció +2, event −1 = net 1).
- **Completada**: 2026-06-06

---

## P1 DONE BUG — PT-02 — Acció ritual de foc disponible sense prerequisit de foc

- **File**: `prototypes/bloodline/game.js` → `getActionVisibility()`
- **Fix**: Afegit `if (action.universal_prereq && !state.discoveredUniversalTechIds.has(...)) return 'HIDDEN'`.
- **Completada**: 2026-06-06

---

## P1 DONE BUG — PT-03 — Skill "Custodi del Foc" elegible sense foc descobert

- **File**: `prototypes/bloodline/game.js` → `getEligiblePoolEvents()`
- **Fix**: Filtre de `universal_prereq` ja existia; confirmat i verificat.
- **Completada**: 2026-06-06

---

## P1 DONE DESIGN — PT-04 — Tokens acumulen tota la dinastia

- **File**: `prototypes/bloodline/data.js` → `material` resource
- **Fix**: `persistent: true` afegit a `material` en RESOURCE_DEFS. `continueSuccession` respecta la flag.
- **Completada**: 2026-06-06

---

## P1 DONE DESIGN — PT-05 — Totes les accions generen ≥1 token

- **File**: `prototypes/bloodline/data.js`
- **Fix**: `output_min` ≥ 1 per totes les accions. `act_ensenyar`, `act_tenir_fills`, `act_cercar_parella` corregits.
- **Completada**: 2026-06-06

---

## P1 DONE DESIGN — PT-06 — Sistema de salut: inanició i envelliment

- **File**: `prototypes/bloodline/game.js` → `applyTurnUpkeep()`
- **Fix**: Inanició −10 HP si menjar insuficient. Edat avançada −2 HP/torn (cicle 11+). Fills costen +1 menjar/torn.
- **Completada**: 2026-06-06

---

## P1 DONE BUG — PT-07 — Zones es descobreixen buides

- **File**: `prototypes/bloodline/data.js`
- **Fix**: Zona Ritual eliminada. Campament i Planes `starts_discovered: true`. Bosc via `act_explorar_voltants`. Totes les zones comencen amb accions visibles (comprades o comprable).
- **Completada**: 2026-06-06

---

## P1 DONE DESIGN — PT-08 — Fills costen menjar extra per torn

- **File**: `prototypes/bloodline/game.js` → `applyTurnUpkeep()`
- **Fix**: `childUpkeep = children.length` sumat al consum base. Visible al bottom panel `−Y/t`.
- **Completada**: 2026-06-06

---

## P1 DONE BALANCE — PT-09 — Inclinació massa lenta

- **File**: `prototypes/bloodline/data.js`
- **Fix**: Deltes inclinació ×1.5. Thresholds branques −25% (cacador 0.30→0.22, recol·lector 0.20→0.15, artesà 0.25→0.18, místic 0.30→0.22).
- **Completada**: 2026-06-06

---

## P1 DONE BUG — PT-10 — Successió: pool acumula germans de generacions anteriors

- **File**: `prototypes/bloodline/game.js` → `triggerSuccession()`
- **Fix**: `successors = children.length > 0 ? childSuccessors : siblingSuccessors`. Germans mai es barregen amb fills.
- **Completada**: 2026-06-06

---

## P1 DONE UX — PT-11 — Tokens al centre del top bar

- **File**: `prototypes/bloodline/index.html`
- **Fix**: Reordenat HTML del top bar: `[🔬 Test] [🧠 Tokens center] [☰ Menú]`. Justify-content space-between ja centrava automàticament.
- **Completada**: 2026-06-06

---

## P1 DONE UX — PT-12 — Menjar X/MAX (−Y/torn) al panell inferior

- **File**: `prototypes/bloodline/game.js` → `renderBottomPanel()`
- **Fix**: `panel-food-val` mostra `X/20`, `panel-food-fc` mostra `−(base+fills)/t` dinàmic.
- **Completada**: 2026-06-06

---

## P1 DONE UX — PT-13 — Overlay dramàtic de descobriment de tecnologia

- **File**: `prototypes/bloodline/game.js`, `prototypes/bloodline/style.css`
- **Fix**: `autoDiscoverUniversalTechs` marca `_isTech: true`. Classe `.discovery-tech` aplica icona 4.5rem, nom 1.5rem, badge daurat, fons especial.
- **Completada**: 2026-06-06

---

## P1 DONE DESIGN — D-01 — Universal Techs cicle ut_eines avanç (22→16)

- **File**: `prototypes/bloodline/data.js`
- **Fix**: `ut_eines` ja estava a `cycle: 16` al JS prototype. Confirmat.
- **Completada**: 2026-06-06

---

## P1 DONE DESIGN — D-02 — discoveredZoneIds persisteix entre generacions

- **File**: `prototypes/bloodline/game.js` → `saveGame/loadGame`, `continueSuccession`
- **Fix**: `discoveredZoneIds` no es reinicia a successió. Persistit al save.
- **Completada**: 2026-06-06

---

## P1 DONE DESIGN — D-03 — Events single_use: per dinastia, no per personatge

- **File**: `prototypes/bloodline/game.js`
- **Fix**: `firedSingleUseEventIds` mogut de `state.character` a `state`. Reseteja al new game, no a successió.
- **Completada**: 2026-06-06

---

## P1 DONE FEAT — SAVE — Save/load via localStorage

- **File**: `prototypes/bloodline/game.js`
- **Fix**: `saveGame/loadGame/hasSave/clearSave`. Auto-save cada acció i event. "Continua" habilitat si hi ha save.
- **Completada**: 2026-06-06

---

## P1 DONE FEAT — SCORE — Pantalla scoring millorada

- **File**: `prototypes/bloodline/game.js`, `prototypes/bloodline/style.css`
- **Fix**: `calculateScore()` + `getDynastyTitle()`. 5 títols. Desglossat de punts visible.
- **Completada**: 2026-06-06

---

## P1 DONE FEAT — BALANCE-EV — Sistema de balanceig d'events dinàmic

- **File**: `prototypes/bloodline/game.js`, `prototypes/bloodline/data.js`
- **Fix**: `classifyEvent`, `trackEventFired`, `selectBalancedEvent`. Objectius: 5 positius / 4 negatius per vida. `EVENT_BALANCE_WEIGHT = 0.6`.
- **Completada**: 2026-06-06

---

## P2 DEFERRED BUG — S2-06 — Comprar upgrade elimina progrés de destresa de l'acció base

- **File**: `prototypes/bloodline/game.js`
- **Decision**: Deferred — amb el nou sistema de destreses per inclinació (no per acció), aquest bug no s'aplica. Les destreses es descobreixen per condicions d'inclinació, no per comptadors d'ús.

---

## P3 DONE BALANCE — B-01 — Branca Recol·lector sense payoff accessible en Gen 1

- **File**: `prototypes/bloodline/game.js` → `unlockSkill()`
- **Fix**: Implementat `unlocks_action_ids` a `unlockSkill()`: quan es descobreix una branch tech, les seves accions s'afegeixen a `purchasedActionIds`. Fix sistèmic: beneficia totes les branques. `bt_rasclador_fi` (accessible a Recol·lectors via `impuls < 0.10`) desbloqueja `act_molda_grans` (food 3-7).
- **Completada**: 2026-06-06

---

## P3 OPEN CONTENT — C-01 — Efectes de les 13 branch techs pendents de definir

- **File**: `prototypes/bloodline/data.js` → SKILL_DEFS passive_effects, `design/gdd/bloodline/content-plan-era1.md`
- **Fix**: (pendent decisió — veure Decision)
- **Acceptance**: Cada skill té un `passive_effect` tangible i documentat.
- **Decision**: (pendent)
- **Options**:
  - A) game-designer proposa efectes per branca, usuari els aprova
  - B) Implementar directament sense document previ

---

## P3 OPEN CONTENT — C-02 — Condicions dels 6 títols de dinastia i 10 badges

- **File**: `prototypes/bloodline/game.js` → `getDynastyTitle()`, scoring
- **Fix**: (pendent decisió — veure Decision)
- **Acceptance**: 6 títols amb condicions numèriques/branca verificables. 10 badges amb criteri.
- **Decision**: (pendent)
- **Options**:
  - A) Títols per estil de joc (branca dominant, combinació)
  - B) Títols per fites numèriques (X generacions, Y techs)
  - C) Híbrid: 3 narratius + 3 mecànics; 5 normals + 5 secrets

---

## P3 OPEN DESIGN — PT-16 — Incentiu per vides llargues del personatge

- **File**: `prototypes/bloodline/game.js` → scoring, upkeep
- **Fix**: (pendent decisió — veure Decision)
- **Decision**: (pendent)
- **Options**:
  - A) Bonus de puntuació per cicles viscuts (p.ex. +5 pts per cicle a partir del cicle 10)
  - B) Tokens extra generats per edat avançada (+2 tokens/torn a partir del cicle 11)
  - C) Herència d'inclinació proporcional a l'edat del difunt

---

<!-- STATS: actualitzat 2026-06-06 -->
<!-- DONE: 20 (PT-01..PT-13, D-01..D-03, SAVE, SCORE, BALANCE-EV, B-01) -->
<!-- OPEN: P3=3 (C-01, C-02, PT-16) | DEFERRED=1 (S2-06) -->
<!-- APARCAT: Era 2 -->
