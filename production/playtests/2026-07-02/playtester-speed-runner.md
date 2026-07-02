# Speed-Runner Audit — ERA1-CONTENT — 2026-07-02

**Fitxers**: `prototypes/bloodline-v2/game.js` + `prototypes/bloodline-v2/data.js` (commit 5964ebd)
**Auditor**: playtester-speed-runner

> ⚠️ Discrepàncies de briefing: LIFE_EXPECTANCY=20 (no 14), INCLINATION_INHERITANCE_RATE=0.85 (no 0.65), FOOD_UPKEEP=2, 7 UTs (cicles 10/16/36/50/65/70/85), ERA_CYCLES=100.

---

## S1 — Bloqueigs de Progressió CRÍTICS

### BUG-01 🚨 — act_escoltar_estrangers mai no s'executa (BLOQUEJADOR)

**La porta principal de descoberta de TdBs és completament trencada.**

`getZoneActions()` afegeix l'acció al carousel sense comprovar ownership:
```js
const disc = ACTIONS.find(a => a.is_discovery_action && a.zona === zoneId);
if (disc && state.discoveredUniversalTechIds.size > 0) base.unshift(disc);
```

Però `executeAction()` comprova `isActionOwned()` primer:
```js
if (!action || !isActionOwned(action)) return;
```

`isActionOwned()` sempre retorna `false` per `act_escoltar_estrangers` perquè:
- No és `is_base` → no entra a `purchasedActionIds` a `initState()`
- `getBuyableActions()` filtra explícitament `if (a.is_discovery_action) return false`
- Cap TdB la inclou en `unlocks_action_ids`

**Resultat**: El jugador veu l'acció, fa clic, i no passa res. Cap log, cap feedback, el torn NO avança. Bug completament mut.

---

### BUG-02 🚨 — Events de descoberta referencien IDs de skill obsolets (BLOQUEJADOR)

6 events a `EVENT_POOLS` referencien `discovery_skill_id` amb format `bt_xxx` (vell):

| Event | Pool | ID referenciada (no existeix) |
|---|---|---|
| ev_desc_llancador | pool_caca | bt_punta_llanca |
| ev_desc_trampes | pool_caca | bt_trampes |
| ev_desc_marques | pool_caca | bt_marques_territori |
| ev_desc_rasclador | pool_recollecta | bt_rasclador_fi |
| ev_desc_coneixement_plantes | pool_recollecta | bt_coneixement_plantes |
| ev_desc_llavor | pool_recollecta | bt_llavor_selectiva |

`SKILL_DEFS` ara usa `tdb_01`…`tdb_16`. `getEligiblePoolEvents()` els filtra silenciosament:
```js
const bt = SKILL_DEFS.find(t => t.id === ev.discovery_skill_id);
if (!bt) return false;
```

**Resultat**: els 6 events de descoberta mai no es disparen.

---

### Resultat combinat BUG-01 + BUG-02

**Amb ERA1-CONTENT, el sistema de TdBs és completament inassolible.** Les dues úniques vies de desbloqueig (acció directa + events) estan trencades. Un jugador pot jugar les 100 cicles sense desbloquejar cap dels 16 TdBs ni cap de les 128 accions noves.

**Gate verdict: BROKEN — Patch immediatament necessari.**

---

## S2 — Gates / Skip Exploits

### S2-A: FOC-PREREQ-B (intencional, correcte)
`act_ritual_foc` sense `universal_prereq` és accessible a espiritualitat ≥ 0.05 (torn 1). TdBs 03/04 conserven `universal_prereq: "ut_foc"` com a gate de contingut. **Gate tight. ✓**

### S2-B: Skip per herència d'inclinació (futur risc)
Amb 0.85 herència: si Gen 1 acaba a impuls=0.45, Gen 2 neix a 0.38 (sobre el llindar de TdBs 11/12). TdBs 13-16 accessibles en 2-3 torns de Gen 2. Si el sistema es repara, una dinastia especialitzada podria tenir accés a contingut d'agricultura (cicle 85) des del torn 1 de Gen 5.

### S2-C: Discovery action visible però inoperable
`getZoneActions()` bypassa `isActionOwned` per a la discovery action. Inconsistència de codi que confirma BUG-01.

### S2-D: Game over per manca d'hereu
`cercar_parella` (maxAge 14), `tenir_fills` (maxAge 15). Warning de parella a edat 12 → 2 torns de marge. Speed-runners ho gestionen; jugadors nous risc real.

---

## S3 — Timing Concerns

### S3-A: Dead zone Gen 2 (cicles 16-36)
Entre `ut_eines` (cicle 16) i `ut_art` (cicle 36) hi ha 20 cicles sense nova UT. Gen 2 viu ~cicles 20-40 i no veu cap nova UT fins a l'edat 16 (final de vida). Buit de progressió perceptible.

### S3-B: Inclinació mai no és el coll d'ampolla
`act_contemplacio` (+0.08 espiritualitat, sense cost) arriba a llindar TdB 13 (0.42) en 8 torns. El jugador pot tenir la inclinació necessària per TdBs tardans molt abans que les UTs prereq arribin. Les UTs, no la inclinació, són el verdader gate temporal.

### S3-C: Destreses — no degeneratiu
DESTRESA_MAX=4, DESTRESA_THRESHOLD=5 → 20 torns per maximitzar-les totes. No és exploitable sense sacrificar diversitat de branques.

---

## Gates Verificades OK

- **Inclination curve**: INERTIA_FACTOR=2.0 produeix corba saturable però assequible. ✓
- **UT timing intern**: 7 UTs en 100 cicles s'ajusta a 5 generacions. ✓
- **FOC-PREREQ-B**: Accés narrativament just al foc bàsic; TdBs 03/04 gated per UT. ✓
- **Succession timeout**: Finestra cercar_parella suficient per a jugadors atenents. ✓
- **Health budget**: FOOD_UPKEEP=2, STARTING_HEALTH=30. Pressió real però equilibrada. ✓

---

## Resum per QA

| # | Severitat | Descripció |
|---|---|---|
| BUG-01 | 🚨 S1 BLOQUEJADOR | `act_escoltar_estrangers` mai no s'executa (`isActionOwned` fals) |
| BUG-02 | 🚨 S1 BLOQUEJADOR | 6 events de descoberta referencien IDs `bt_xxx` que no existeixen |
| CONCERN-01 | S3 | Dead zone Gen 2 (cicles 16-36): 20 cicles sense nova UT |
| CONCERN-02 | S3 | Herència 0.85 + TdBs tardans: Gen 4-5 parteix sobre molts llindars |
| CONCERN-03 | S4 | Warning de parella a edat 12 → 2 torns de marge és poc per a nous |

**Acció immediata**: BUG-01 i BUG-02 han de quedar resolts en el mateix patch. Sense ells, ERA1-CONTENT desactiva completament el nucli del sistema TdBs.

**Fitxers afectats**: `game.js` (`getZoneActions`, `isActionOwned`, `getBuyableActions`, `getEligiblePoolEvents`) · `data.js` (`EVENT_POOLS`, `SKILL_DEFS`)
