# Playtest Report — ERA1-CONTENT targeted — 2026-07-02

## Summary
- **Agents run**: tycoon · optimizer · speed-runner · dynasty-builder · new-player
- **Scope**: Targeted — ERA1-CONTENT (16 TdBs + 128 accions + mecànica obsoleta + FOC-PREREQ-B)
- **Commit auditat**: 5964ebd
- **Total issues**: 20 (S1: 4 · S2: 7 · S3: 7 · S4: 2)
- **Nous**: 20 | **Coneguts / pre-existents**: 0

> ⚠️ **Veredicte: NO SHIP** — Els S1 TD-01 + TD-02 fan que cap dels 16 TdBs ni cap de les 128 accions noves sigui accessible en partides reals, tot i que els 22 tests unitaris passen. Patch mínim estimat: 1 sessió.

---

## S1 — Crítics (bloquegen release)

### TD-01 · `act_escoltar_estrangers` visible però inexecutable
**Reportat per**: speed-runner, dynasty-builder

`getZoneActions()` afegeix l'acció de descoberta al carrusel saltant-se el check d'ownership:
```js
if (disc && state.discoveredUniversalTechIds.size > 0) base.unshift(disc);
```
Però `executeAction()` comprova `isActionOwned()` primer, que sempre retorna `false`:
- No és `is_base` → no entra a `purchasedActionIds` a `initState()`
- `getBuyableActions()` la filtra explícitament: `if (a.is_discovery_action) return false`
- Cap TdB la inclou a `unlocks_action_ids`

**Resultat**: El jugador veu l'acció des del cicle 10, fa clic, i no passa res. Bug mut — cap log, cap feedback, el torn NO avança.

**Fix**: Afegir `act_escoltar_estrangers` al `basePurchased` d'`initState()`, o exemptar `is_discovery_action` del check d'ownership a `executeAction()`.

**Fitxers**: `game.js` (`getZoneActions`, `isActionOwned`, `executeAction`, `initState`)

---

### TD-02 · 15 discovery events amb `discovery_skill_id: "bt_*"` → mai no disparen
**Reportat per**: speed-runner, dynasty-builder, tycoon

ERA1-CONTENT va renombrar tots els SKILL_DEFS de `bt_*` a `tdb_NN` però no va actualitzar els 15 `discovery_skill_id` de EVENT_POOLS. `getEligiblePoolEvents()` els filtra silenciosament:
```js
const bt = SKILL_DEFS.find(t => t.id === ev.discovery_skill_id);
if (!bt) return false;
```

**Events afectats** (15): ev_desc_llancador, ev_desc_trampes, ev_desc_marques, ev_desc_rasclador, ev_desc_coneixement_plantes, ev_desc_llavor, ev_desc_agulla, ev_desc_buri, ev_desc_herbes, ev_desc_pintura, ev_desc_calendari, ev_desc_ornaments, ev_desc_domini_terra, i 2 més.

**Fix**: Remappejar cada `discovery_skill_id` de `bt_*` al seu equivalent `tdb_NN`. Alternativament, redissenyar el vincle events→TdBs.

**Fitxers**: `data.js` (EVENT_POOLS), `game.js` (`getEligiblePoolEvents`)

> **Impacte combinat TD-01 + TD-02**: Les dues úniques vies de desbloqueig de TdBs (acció directa + events) estan trencades simultàniament. Cap dels 16 TdBs ni cap de les 128 accions noves és accessible en partides noves. ERA1-CONTENT (commit 5964ebd) és efectivament nul en joc real.

---

### TD-03 · `getActionUpgrade()` retorna `null` per a totes les accions del carrusel → 13 upgrades inaccessibles
**Reportat per**: tycoon

La funció té una guarda d'entrada (game.js:1742):
```js
if (state.character.purchasedActionIds.has(actionId)) return null;
```
`actionId` és l'ID de l'acció BASE ja al carrusel — és a dir, sempre comprada. La condició és always-true → el botó `↑` mai no apareix. A més, `getBuyableActions()` exclou els `is_upgrade` del Mercat (game.js:2822). No hi ha cap altra via de compra.

**13 accions inaccessibles**: act_collita_guiada, act_llegir_veta, act_pelar_escorca, act_basto_cavador, act_taller_percussio, act_vetlla_flames, act_llanca_emmanegada, act_gravar_patrons, act_palanca_pedrera, act_obrar_plegats, act_forn_terra, act_fumador, act_gran_ritual.

**Fix**: Invertir la guarda per comprovar si l'UPGRADE (no la base) ja és comprat.

**Fitxers**: `game.js` (`getActionUpgrade`)

---

### TD-04 · `apr_veu_clan` completament inaccessible (token_bonus +1 mort)
**Reportat per**: tycoon

`apr_veu_clan` ("La Veu del Clan"), l'aprenentatge amb el millor bonus (`token_bonus: +1`), té `discovery_action_ids: ["act_narrar_llegendes", "act_explicar_orígens", "act_cants_grup"]`. Cap d'aquestes IDs existeix a ACTIONS. Via `act_ensenyar` requereix que un avantpassat l'hagi descobert primer — cap Gen 1 pot tenir-lo. Permanentment inaccessible.

**Fix**: Reassignar `discovery_action_ids` a accions TdB existents (ex. act_relat_gesta, act_crits_caca, act_canco_collita de TdB 8 "La Veu que Perdura").

**Fitxers**: `data.js` (APRENENTATGE_DEFS)

---

## S2 — Majors (corregir abans del milestone)

### TD-05 · `ev_mamut_sol` sempre aplica −12 salut en lloc de −6
**Reportat per**: tycoon

`skill_modifier: {skill_id: "bt_punta_llanca", absent_health_delta: -12}`. Com `bt_punta_llanca` no existeix a SKILL_DEFS, `hasSk` és sempre false → sempre aplica `absent_health_delta = -12`. L'opció "Atac directe amb llances" fa el doble de dany que el disseny preveu.

**Fix**: Actualitzar `skill_id: "bt_punta_llanca"` al tdb equivalent. **Fitxers**: `data.js`

---

### TD-06 · `pe_malaltia` sempre mostra l'opció brutal (−15 salut)
**Reportat per**: tycoon

Opció guaridora (`requires_skill: "bt_guariment_plantes"`) sempre amagada perquè `bt_guariment_plantes` no existeix. El jugador veu únicament −15 salut. Com és `is_single_use`, pot provocar un game-over inesperat si la salut és baixa.

**Fix**: Substituir `"bt_guariment_plantes"` per l'equivalent tdb, o reposar la condició via `has_aprenentatge`. **Fitxers**: `data.js`

---

### TD-07 · `act_talla_avancada` referenciada a `executeAction()` però absent d'ACTIONS
**Reportat per**: dynasty-builder

`game.js:~1231`:
```js
const _qualBonus = (state.character.purchasedActionIds.has('act_talla_avancada') && ...) ? 1.3 : 1.0;
```
`act_talla_avancada` no existeix a ACTIONS. El bonus de qualitat d'eines (+30%) mai no s'activa. Feature morta en codi.

**Fix**: Crear `act_talla_avancada` o actualitzar la referència a una acció existent. **Fitxers**: `game.js`, `data.js`

---

### TD-08 · 3 aprenentatges amb `bonus_action_output` apuntant a accions inexistents
**Reportat per**: tycoon

- `apr_cures_basiques`: `action_id: "act_curar_herbes"` (no existeix) → bonus +2 Salut mort
- `apr_treball_pedra`: `action_id: "act_faonar_eines"` (no existeix) → bonus +2 Eines mort
- `apr_plantes_medicinals`: `action_id: "act_recollida_bolets"` (no existeix) → bonus mort

Jugadors veuen la descripció del benefici però mai el reben. **Fix**: Reassignar a accions TdB existents. **Fitxers**: `data.js`

---

### TD-09 · `evaluateBlockedIf()` no gestiona `resource_below` → events disparen en crisi
**Reportat per**: tycoon

`ev_fill_orfe` (`blocked_if: resource_below food 3`) i `ev_estrany_a_la_vora` (`resource_below health 3`) usen un tipus no reconegut → `some()` retorna `undefined` (falsy) → mai bloquejats. Poden disparar quan els recursos estan críticament baixos.

**Fix**: Afegir handler `resource_below` a `evaluateBlockedIf()`. **Fitxers**: `game.js`

---

### TD-10 · `ev_tecnica_subtil` permanentment bloquejat per `bt_buri` inexistent
**Reportat per**: dynasty-builder, tycoon

`blocked_if: [{type:"not_has_skill", id:"bt_buri"}]` → sempre `true` → event mai no dispara.

**Fix**: Substituir `"bt_buri"` per l'equivalent tdb. **Fitxers**: `data.js`

---

### TD-11 · Upgrade chain skip: base + tier-4 apareixen simultàniament
**Reportat per**: optimizer

`getZoneActions()` comprova el vincle directe `upgrades_action_id` però no de forma transitiva. Comprar un upgrade de tier-4 sense el tier-2 mostra la base i el tier-4 simultàniament al carrusel. Cadenes afectades: act_tallar_ascles→act_taller_percussio→act_obrar_plegats→act_forn_terra, act_recollectar_pedra→act_llegir_veta→act_palanca_pedrera.

**Fix**: Recórrer la cadena d'upgrades transitivament per decidir la visibilitat. **Fitxers**: `game.js`

---

## S3 — Menors (corregir quan hi hagi capacitat)

| ID | Descripció | Fitxer | Ruta |
|---|---|---|---|
| S3-01 | `evaluateBlockedIf()` no gestiona `axis_above` → `ev_transicio_xaman` dispara sense restricció | game.js | gameplay-programmer |
| S3-02 | ID duplicat `ev_eina_trencada` a pool_artesania → anti-spam incorrecte | data.js | economy-designer |
| S3-03 | 3 events amb `requires_skill: "bt_*"` a pool_recollecta/ritual → opcions avançades ocultes | data.js | economy-designer |
| S3-04 | `Set.has(null)` filtraria discovery events de tdb_01/tdb_02 un cop TD-02 es corregeixi | game.js | gameplay-programmer |
| S3-05 | 2 aprenentatges amb `discovery_action_ids` parcials (alguns IDs morts, taxa de descoberta menor) | data.js | economy-designer |
| S3-06 | Dead zone Gen 2: cicles 16-36 sense nova UT (20 cicles sense progressió de descoberta) | — | game-designer |
| S3-07 | Espiritualitat domina recuperació de salut en joc tardà (7-12 salut/torn vs. cap per a Caçador) | data.js | economy-designer |

---

## S4 — Trivials

| ID | Descripció | Fitxer |
|---|---|---|
| S4-01 | ~30 IDs `act_*` obsolets a `ACTION_ICONS` (dead code, cap impacte en execució) | game.js |
| S4-02 | `apr_orientacio` / `apr_lectura_senyals`: IDs morts a discovery_action_ids (>1 camí vàlid restant) | data.js |

---

## Design Concerns (funcionen com a codi però plantegen qüestions)

| Concern | Descripció | Ruta |
|---|---|---|
| DC-01 | Tots els 16 TdBs desbloquejables amb un sol eix (OR lògica) — diversificació multi-eix no és necessària | game-designer |
| DC-02 | `INCLINATION_INHERITANCE_RATE = 0.85` (no 0.65 com documenta el briefing) — herència forta és intencionada (cf. `bloodline-lineage-design-philosophy.md`) però Gen 2+ no necessita construir inclinació | game-designer |
| DC-03 | Food cap + accions de Recol·lector tardà dominen Caçador en situació no-crítica — risc de desincentiu de la branca Caçador | economy-designer |
| DC-04 | Gen 5 hereta 130+ accions — botiga perd significat, no hi ha distinció visual entre llegat i progrés propi | ux-designer |
| DC-05 | `BRANCHES.conditions` definit però no avaluat a `getActiveBranches()` (dead code) | gameplay-programmer |

---

## Open Points Status

| Issue prèvia | Estat |
|---|---|
| SEQ-01 (floaters solapats) | NO REPRODUCED en aquest sweep (fora d'scope) |
| "Practicar la Talla" UX | NO REPRODUCED (fora d'scope) |
| "Escoltar Estrangers" feedback feble | SUPERAT — BUG és pitjor: l'acció no s'executa (TD-01) |
| Terminologia meta-tasca | NOT TESTED (fora d'scope) |

---

## Recommended Next Actions

1. **Patch immediat** (1 sessió): TD-01 (`isActionOwned` bypass per `is_discovery_action`) + TD-02 (remappejar 15 `discovery_skill_id` a `tdb_NN`) + TD-03 (`getActionUpgrade` guarda invertida). Sense aquests 3 fixes, ERA1-CONTENT no existeix en joc real.
2. **Patch S2** (1-2 sessions): TD-04 al TD-11 — IDs `bt_*` obsolets a data.js, handlers a `evaluateBlockedIf()`, `act_talla_avancada`.
3. **Actualitzar briefing** de playtester: LIFE_EXPECTANCY=20, DESTRESA_MAX=4, INCLINATION_INHERITANCE_RATE=0.85, 7 UTs (cicles 10/16/36/50/65/70/85).
4. **Design review**: DC-01 (OR lògica TdBs), DC-02 (herència 0.85), DC-03 (Recol·lector vs. Caçador).
5. **Rerun playtest** després del patch per verificar que els 16 TdBs i les 128 accions son accessibles.

---

## Routing

| Categoria | Destinatari |
|---|---|
| TD-01, TD-03, TD-09, S3-01, S3-04, DC-05 | `gameplay-programmer` |
| TD-02, TD-04, TD-06, TD-08, TD-10, S3-02, S3-03, S3-05, DC-03 | `economy-designer` |
| TD-05, TD-06, TD-07, TD-11 | `gameplay-programmer` (codi) / `economy-designer` (data) |
| DC-01, DC-02, S3-06 | `game-designer` |
| DC-04 | `ux-designer` |
| S4-01 | `gameplay-programmer` (deute tècnic) |
