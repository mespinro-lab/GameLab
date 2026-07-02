# Dynasty Analysis — ERA1-CONTENT — 2026-07-02

**Scope**: 16 TdBs + 128 accions (commit 5964ebd), sistema d'herència complet
**Auditor**: playtester-dynasty-builder
**Fitxers**: `prototypes/bloodline-v2/game.js` (3437 línies) + `prototypes/bloodline-v2/data.js` (2401 línies)

> ⚠️ Discrepàncies de briefing: INCLINATION_INHERITANCE_RATE=0.85 (no 0.65), STAT_INHERITANCE_RATE=0.50, DESTRESA_MAX=4 (no 2).

---

## S1 — Bloqueigs de Successió CRÍTICS

### BUG-01 🚨 — `act_escoltar_estrangers` visible però inexecutable (BLOQUEJADOR)

`getZoneActions()` afegeix l'acció al carrusel saltant-se el check de propietat, però `executeAction()` comprova `isActionOwned()` primer i sempre retorna `false`: no és `is_base`, `getBuyableActions()` la filtra explícitament (`if (a.is_discovery_action) return false`), cap TdB l'inclou a `unlocks_action_ids`.

Resultat: el jugador veu l'acció des del cicle 10, fa tap, i no passa res. Bug mut. La via principal de descoberta de TdBs és no funcional.

**Fix**: afegir `act_escoltar_estrangers` al `basePurchased` d'`initState`, o exemptar `is_discovery_action` del check d'ownership a `executeAction`.

---

### BUG-02 🚨 — Events de descoberta amb IDs de habilitat obsolets (BLOQUEJADOR)

15 events `is_discovery_event: true` a EVENT_POOLS referencien `discovery_skill_id` en format `bt_*` (bt_punta_llanca, bt_trampes, bt_agulla_os, bt_buri, bt_guariment_plantes, bt_pintura_rupestre, bt_calendari_natural, bt_ornaments, bt_domini_terra, etc.). `SKILL_DEFS` usa `tdb_01`…`tdb_16`. `getEligiblePoolEvents()` els filtra silenciosament — mai no disparen.

---

### BUG-03 — `act_talla_avancada` referenciada però absent de ACTIONS

`executeAction()` (game.js ~1231) comprova:
```js
const _qualBonus = (state.character.purchasedActionIds.has('act_talla_avancada') && ...) ? 1.3 : 1.0;
```
`act_talla_avancada` no existeix. El bonus de qualitat d'eines (+30%) mai no s'activa. Feature morta en codi.

---

### BUG-04 — `ev_tecnica_subtil` permanentment bloquejat

`blocked_if: [{ type: "not_has_skill", id: "bt_buri" }]` — "bloqueja si NO té bt_buri". Cap personatge pot tenir `bt_buri` (ID inexistent). L'event mai no dispara.

---

### BUG-05 — Camins de descoberta d'aprenentatges parcialment trencats

| Aprenentatge | IDs absents a ACTIONS | Camí restant |
|---|---|---|
| `apr_veu_clan` | act_narrar_llegendes, act_explicar_orígens, act_cants_grup | Cap — **inaccessible** |
| `apr_cures_basiques` | act_curar_herbes, act_preparar_ungüent | act_contemplacio (únic) |
| `apr_plantes_medicinals` | act_assecament_plantes, act_preparar_ungüent | act_recollectar_arrels (únic) |
| `apr_treball_pedra` | act_faonar_eines | act_recollectar_pedra (únic) |

`apr_veu_clan` no té cap acció existent que el pugui desencadenar. Cap Gen 1 pot tenir-lo — efectivament inaccessible.

---

## S2 — Herència

### Inclinació al 85% — identitat de llinatge molt robusta

Cadena per dinastia Caçador (impuls=1.0 a Gen 1):

| Gen | Impuls inicial | TdBs per llindar |
|---|---|---|
| Gen 2 | 0.850 | Tots els 16 per sobre del llindar màxim (0.45) |
| Gen 3 | 0.723 | Tots els 16 per sobre |
| Gen 4 | 0.614 | Tots els 16 per sobre |
| Gen 5 | 0.522 | Tots els 16 per sobre |

Des de Gen 2, totes les portes d'inclinació estan obertes per defecte. La reconversió de llinatge requereix treballar activament contra la inèrcia i probablement no s'aconsegueix en una sola generació. La identitat és quasi immutable. Cf. memòria `bloodline-lineage-design-philosophy.md`: "herència forta = intencionada".

### Stats al 50% — convergència cap a baseline

Fórmula: `stat × 0.50 + 1.0 × 0.50`. Força des de 5.0: Gen 2 → 3.0, Gen 3 → 2.0, Gen 4 → 1.5, Gen 5 → 1.25. Les stats no s'acumulen com a llegat.

### TdBs i actions al 100% — correcte per filosofia de llinatge

`inheritedSkills` i `inheritedPurchased` hereten completament. Gen 5 pot tenir 130+ accions heretades actives (112 de TdBs + base + standalones), totes actives per inclinació. La botiga perd significat si tot ja és heretat.

### Destreses — sense lock-in

`pickInitialDestreses()`: 1 del pare + 1 global = 2 initials. DESTRESA_MAX=4, pot adquirir 2 més. 4 DESTRESA_DEFS, simètric. ✓

---

## S3 — Progressió per Generació

### D-01: Mecànica obsoleta — correcta però escassa
3 accions amb `obsoletes_action_id`, totes en TdBs 13-16 (cicles 70-85). Cap obsolescència en TdBs 1-12. `getZoneActions()` oculta l'acció antiga quan la nova és comprada. La botiga mostra "Fa obsoleta". Herència correcta. **Cobertura insuficient per crear patrons de substitució.**

### D-02: Gat temporal de TdBs — aguanta

Distribució per generació (si BUG-01/02 fossin resolts):
- Gens 1-2: TdBs 1-6 (cicles 0-36)
- Gens 3-4: TdBs 7-12 (cicles 36-70)
- Gen 5: TdBs 13-16 (cicles 70-100)

No hi ha snowball. El gat temporal separa correctament el contingut per generació.

### D-03: No hi ha `MAX_GENERATIONS`
El joc finalitza per cicle (100) o extinció. 5 generacions és emergent de `ERA_CYCLES / LIFE_EXPECTANCY`. No es comunica com a objectiu.

### D-04: Cap distinció visual llegat/progrés propi
Accions heretades i comprades és visualment idèntiques. No hi ha etiqueta "descoberta per [ancestre]", ni historial de quina generació va desbloquejar cada TdB. El llinatge és mecànic però no narratiu.

---

## Sistemes Verificats OK

- **`triggerSuccession()` / `continueSuccession()`**: transmissió completa i correcta. ✓
- **`obsoletes_action_id`**: `getZoneActions()` i botiga funcionen. ✓
- **Tokens entre generacions**: `inheritDecay: 0.3` equilibrat. ✓
- **Destresa discovery**: `checkDestresesAfterAction()` correcte. ✓
- **TEACH-01**: `act_ensenyar` → `c.taughtApr` → `inheritedAprenentatges`. Correcte. ✓
- **Successió sense fills**: extinció correcta. ✓
- **Serialització**: Sets ↔ arrays a `saveGame()` / `loadGame()`. Correcte. ✓
- **Upgrades**: oculten acció base quan comprats. Correcte (see E-03 de optimizer per al skip). ✓

---

## Resum per QA

| # | Severitat | Descripció |
|---|---|---|
| BUG-01 | 🚨 S1 | `act_escoltar_estrangers` inexecutable |
| BUG-02 | 🚨 S1 | 15 discovery events amb IDs `bt_*` obsolets |
| BUG-03 | S2 | `act_talla_avancada` absent — bonus d'eines mort |
| BUG-04 | S2 | `ev_tecnica_subtil` permanentment bloquejat (`bt_buri`) |
| BUG-05 | S2 | `apr_veu_clan` inaccessible; 3 aprenentatges sense camí complet |
| D-01 | S3 | Mecànica obsoleta: 3 accions en cicles 70-85 — insuficient per crear pressió |
| D-02 | S3 | Gen 5: 130+ accions heretades — botiga perd significat |
| D-04 | S4 | Cap distinció visual entre llegat ancestral i progrés propi |
