# Tycoon Audit — ERA1-CONTENT — 2026-07-02

**Fitxers**: `prototypes/bloodline-v2/data.js` + `prototypes/bloodline-v2/game.js` (commit 5964ebd)
**Auditor**: playtester-tycoon
**Total**: 14 issues (S1: 2 · S2: 6 · S3: 5 · S4: 1)

---

## S1 — Crítics (bloquegen release)

### ERA-01 🚨 — `getActionUpgrade()` retorna null per a TOTES les accions del carrusel

`getActionUpgrade(actionId)` té una guarda d'entrada (game.js:1742):
```js
if (state.character.purchasedActionIds.has(actionId)) return null;
```
Però `actionId` és l'ID de l'acció BASE que ja és al carrusel — és a dir, sempre comprada. El carrusel (`getZoneActions()`) filtra amb `isActionOwned(a)`, de manera que **tota acció al carrusel** és sempre a `purchasedActionIds`. La condició és always-true → retorna `null` immediatament. El botó `↑` no apareix mai. A més, `getBuyableActions()` exclou explícitament els `is_upgrade` del Mercat (game.js:2822). No hi ha cap altra via de compra.

**13 accions afectades**: act_collita_guiada, act_llegir_veta, act_pelar_escorca, act_basto_cavador, act_taller_percussio, act_vetlla_flames, act_llanca_emmanegada, act_gravar_patrons, act_palanca_pedrera, act_obrar_plegats, act_forn_terra, act_fumador, act_gran_ritual.

**Fix**: Eliminar la guarda o invertir-la per comprovar si l'UPGRADE (no la base) ja és comprat.

**Ruta**: `gameplay-programmer`

---

### ERA-02 🚨 — `apr_veu_clan` completament inaccessible

`apr_veu_clan` (`token_bonus: +1`, el millor bonus d'aprenentatge) té `discovery_action_ids: ["act_narrar_llegendes", "act_explicar_orígens", "act_cants_grup"]`. Cap d'aquestes IDs existeix a ACTIONS. Via `act_ensenyar` requereix que un avantpassat l'hagi descobert primer — cap Gen 1 pot tenir-lo. Aprenentatge permanentment inaccessible.

**Ruta**: `economy-designer` (reassignar a accions TdB existents, ex. act_relat_gesta, act_canco_collita)

---

## S2 — Majors (corregir abans del milestone)

### ERA-03 — 13 `discovery_skill_id` a EVENT_POOLS referencien IDs `bt_*` obsolets

(Equivalent a BUG-02 de speed-runner/dynasty). `getEligiblePoolEvents()` filtra silenciosament `SKILL_DEFS.find(t => t.id === ev.discovery_skill_id)` — cap `bt_*` existeix. 13 events de descoberta mai no disparen. **Ruta**: `economy-designer`

### ERA-04 — `ev_tecnica_subtil` permanentment bloquejat per `bt_buri` inexistent

`blocked_if: [{type:"not_has_skill", id:"bt_buri"}]` → sempre bloquejat. **Ruta**: `economy-designer`

### ERA-05 — `pe_malaltia` sempre mostra l'opció brutal (−15 salut)

Opció guaridora (`requires_skill: "bt_guariment_plantes"`) sempre amagada. Jugador veu únicament −15 salut. Risc de fals game-over. **Ruta**: `economy-designer`

### ERA-06 — `ev_mamut_sol` sempre aplica −12 salut en lloc de −6

`skill_modifier: {skill_id: "bt_punta_llanca", absent_health_delta: -12}` → com `bt_punta_llanca` no existeix, sempre aplica `absent_health_delta`. Doble penalització permanent. **Ruta**: `economy-designer`

### ERA-07 — 3 aprenentatges amb `bonus_action_output` apuntant a accions inexistents

- `apr_cures_basiques`: action_id `act_curar_herbes` (no existeix) → bonus mort
- `apr_treball_pedra`: action_id `act_faonar_eines` (no existeix) → bonus mort
- `apr_plantes_medicinals`: action_id `act_recollida_bolets` (no existeix) → bonus mort

Jugadors veuen la descripció del benefici però mai el reben. **Ruta**: `economy-designer`

### ERA-08 — `evaluateBlockedIf()` no gestiona `resource_below`

2 events d'ERA1-CONTENT usen `resource_below`: `ev_fill_orfe` (food < 3) i `ev_estrany_a_la_vora` (health < 3). Tipus no reconegut → mai bloquejats → poden disparar en crisi de recursos. **Ruta**: `gameplay-programmer`

---

## S3 — Menors

### ERA-09 — `evaluateBlockedIf()` no gestiona `axis_above`

`ev_transicio_xaman`: `blocked_if: [{type:"axis_above", axis:"impuls", value:0.70}]` → ignora restricció. Un Caçador extrem veu un event de transició xamànica. **Ruta**: `gameplay-programmer`

### ERA-10 — ID duplicat `ev_eina_trencada` a pool_artesania

2 events comparteixen l'ID. El filtre `recentEventIds` tracta ambdós com el mateix. El segon variant apareixerà rarament. **Ruta**: `economy-designer` (canviar a `ev_eina_trencada_b`)

### ERA-11 — `requires_skill` amb IDs `bt_*` en 3 events de pool_recollecta/ritual

`ev_pluja_tardor`, `ev_fong_blanc`, `ev_planta_amarga` oculten opcions avançades permanentment. **Ruta**: `economy-designer`

### ERA-12 — `Set.has(null)` filtra events de tdb_01/tdb_02 (latent)

`state.discoveredUniversalTechIds.has(null)` → sempre `false`. Si ERA-03 es corregeix i s'afegeixen discovery events per tdb_01/tdb_02, quedaran silenciats. **Fix**: afegir guarda nul·la a game.js:846. **Ruta**: `gameplay-programmer`

### ERA-13 — `discovery_action_ids` parcials amb IDs morts en 2 aprenentatges

`apr_orientacio` i `apr_lectura_senyals` mantenen almenys 1 ID vàlid. Taxa de descoberta menor de la prevista. **Ruta**: `economy-designer`

---

## S4 — Trivials

### ERA-14 — ~30 IDs `act_*` obsolets a `ACTION_ICONS`

Dades mortes; `getActionIcon()` les ignora via fallback. Confusió per a futurs mantenidors. **Ruta**: `gameplay-programmer` (deute tècnic)

---

## Sense incidències — Verificats OK

- **16 TdBs (SKILL_DEFS)**: estructura correcta, 0 duplicats d'ID, tots `universal_prereq` vàlids. ✓
- **128 accions TdB (`unlocks_action_ids`)**: tots els 128 IDs apunten a ACTIONS reals. ✓
- **Mecànica `obsoletes_action_id`**: 3 relacions correctes al Mercat i carrusel. ✓
- **FOC-PREREQ-B**: `act_ritual_foc` i `act_assecar_provisions` sense `universal_prereq`. ✓
- **0 duplicats d'ID a ACTIONS** (143 accions auditades). ✓
- **`evaluateConditions()` per inclination_conditions**: OR lògic correcte. ✓
- **`DESTRESA_DEFS`**: 4 entrades, totes apunten a accions existents. ✓
- **`apr_conservar_provisions`**: tots `discovery_action_ids` existents. ✓
