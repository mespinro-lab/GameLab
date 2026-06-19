# Playtest Audit — 11 Fixes Post-Review — 2026-06-18

**Agent**: playtester-tycoon
**Scope**: Targeted audit of commit 5d34e6d (11 UI/UX fixes)
**Files audited**: game.js, data.js, index.html, style.css

---

## S1 — Critical

### AUD11-01 · `material_delta` en opcions d'event no s'aplica

**Status: INTENCIONAL** — l'usuari va demanar explícitament treure tokens dels events ("fora els tokens com a recompensa de tot arreu"). Els 14 `material_delta` en dades d'events són ara ignorats per disseny. Els valors queden a data.js com a informació narrativa però no s'apliquen.

---

## S2 — Major

### AUD11-03 · Hint de cost material no es mostra als botons d'event

**Status: INTENCIONAL** — mateixa raó que AUD11-01. Material eliminat de la UI d'events per disseny.

---

### AUD11-04 · `longLifeBonus` no apareix al resum de puntuació final

**Fitxer**: `game.js` → `renderEndScreen()` (breakdown de score)
**Issue**: `calculateScore()` retorna `longLifeBonus` i l'inclou a `total`, però el breakdown visible al game-over no té cap línia per aquest valor. Un run amb 3 generacions vivint fins a 14 cicles genera +150 pts de `longLifeBonus` sense que el jugador ho vegi.
**Fix**: Afegir línia `longLifeBonus` al breakdown igual que `fullLifeBonus`.
**Status: FIX PENDENT** ← resolt en commit posterior

---

### AUD11-05 · `act_assecar_provisions` no mostra cap badge al carrusel

**Fitxer**: `game.js` → `showZoneCardDetails()`
**Issue**: L'acció ara no té `output_resource` — el badge d'output és invisible. El benefici principal (ampliació de magatzem +2) no es reflecteix al carrusel.
**Fix**: Afegir badge específic per `food_cap_delta` al carrusel (p.ex. `📦+2`).
**Status: FIX PENDENT** ← resolt en commit posterior

---

## S3 — Minor

### AUD11-07 · Execute cost badge hardcoded a 1 triangle

`_resTri` no aplica al cost d'execució — hardcoded `▼`. Correcte per a totes les accions actuals (max cost = 2). No prioritari.

### AUD11-09 · `act_coure_ceramica` genera 0 material (explicit `material_min:0, material_max:0`)

Sembla intencional (artesania de ceràmica sense generació de tokens). Si és un error, cal eliminar els camps i usar defaults (2-3).

---

## Verificat OK

- `_resTri` helper: thresholds i direcció correctes
- `.vital-main` wrapper: selectors CSS `.vital-food .vital-num` funcionen correctament per descendència
- Scoping de `foodDanger`/`agingLoss`/`willDie` en `renderCharPanel()`: correcte
- `showStatTooltip` food/health: constants `HEALTH_GROW_TURNS`/`HEALTH_STABLE_TURNS` definides a data.js
- `act_assecar_provisions` execució: `food_cap_delta` s'aplica en 3 usos i para
- `longLifeBonus` inclòs en `total` i en l'objecte de retorn de `calculateScore()`
- `sun-cap` eliminat completament sense codi orfe
- `attr-delta` revertit completament
- `animateCounters` format `${Math.round(v)}/${foodMax()}` correcte i accessible en closure
