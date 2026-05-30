# Dynasty Builder Playtester Report — Life Tycoon 2
**Date**: 2026-05-29
**Sweep**: #29b — Post-Content-Migration
**Prototype**: prototypes/life-tycoon-2/ (game.js + data.js)
**Session type**: Code trace — inheritance, succession, zone discovery, siblingPool, passive effects
**Story type**: Integration (multi-system: succession × zone state × passive effects × siblingPool)
**Gate level**: ADVISORY (prototype)

Previously reported and excluded: FOOD-01, SUCC-01, GATE-01, SABER-01, DISC-01, EVENT-01, FADE-01, RENDER-01, DEBUG-01, TRV-02.

---

## DYN-01 — Ritual Zone Permanently Inaccessible: zone_id Mismatch in bt_pintura_rupestre

**Severity**: S2
**Frequency**: Always

**Description**:
`bt_pintura_rupestre` declares a `passive_effect` of type `unlock_zone` with `zone_id: "zone_ritual"` (data.js line 89). `unlockBranchTech()` in game.js line 201 executes:

```js
if (pe.type === 'unlock_zone') state.discoveredZoneIds.add(pe.zone_id);
```

This adds the string `"zone_ritual"` to `state.discoveredZoneIds`.

However, `renderZoneGrid()` at game.js line 777 iterates over `ZONE_ORDER = ["Bosc", "Planes", "Campament", "Ritual"]` (game.js line 754) and calls:

```js
if (state.discoveredZoneIds.has(zona)) grid.appendChild(buildZoneCard(zona, tables));
```

The string being checked is `"Ritual"`, not `"zone_ritual"`. Because `"zone_ritual" !== "Ritual"`, the Ritual zone card is never rendered regardless of whether bt_pintura_rupestre is unlocked. The actions that live in the Ritual zone (`act_pintar_parets`, `act_consagrar_ornaments`, `act_observar_cel`, `act_transit_nocturn`) are permanently unreachable in normal play.

The same mismatch affects the Glossary's zone discovery display (game.js line 1259: `state.discoveredZoneIds.has(zona)` using the same ZONE_ORDER array).

This also means: after succession, `discoveredZoneIds` correctly carries `"zone_ritual"` forward (since `continueSuccession()` does not reset it), but the bug still blocks Ritual zone rendering in every generation.

**Reproduction steps**:
1. Start the game. Build espiritualitat ≥ 0.30 and sociabilitat ≥ 0.20 across early cycles.
2. Discover universal tech `ut_art_simbolic` (cycle 6+).
3. Trigger the discovery action — unlock `bt_pintura_rupestre`.
4. Observe: log shows "Nova habilitat: Pintura Rupestre" and "Efecte passiu: Desbloqueja el Lloc Sagrat".
5. Observe: `state.discoveredZoneIds` now contains `"zone_ritual"` (verifiable via browser console: `state.discoveredZoneIds`).
6. Observe: no Ritual zone card appears in the zone grid.
7. Check ZONE_ORDER (game.js line 754): `["Bosc", "Planes", "Campament", "Ritual"]`. The string `"Ritual"` is never found in `discoveredZoneIds`.

**Impact**:
4 actions in the Ritual zone are entirely unreachable — `act_pintar_parets` (Ritual zone, bt_pintura_rupestre unlock), `act_consagrar_ornaments` (Ritual zone, bt_ornaments unlock), `act_observar_cel` (Ritual zone, bt_calendari_natural unlock), `act_transit_nocturn` (Ritual zone, bt_calendari_natural unlock). The Místic branch effectively loses its core actions. The discovery events for `bt_pintura_rupestre` (ev_desc_pintura) and `bt_calendari_natural` (ev_desc_calendari) reward the player with techs whose actions are permanently locked behind the broken zone. The glossary reports the zone as "No descoberta" even after the player explicitly unlocked it.

**Fix pointer**: In data.js line 89, change `zone_id: "zone_ritual"` to `zone_id: "Ritual"` to match the ZONE_ORDER strings. Alternatively, normalize all zone IDs to use the same string format throughout; ZONE_ORDER is the authoritative list.

---

## DYN-02 — discoveredZoneIds Persists Across Succession (Design Ambiguity — Confirm or Constrain)

**Severity**: S3
**Frequency**: Always

**Description**:
`state.discoveredZoneIds` is initialized in `initState()` at game.js line 65 as `new Set(["Campament", "Planes"])`. The `continueSuccession()` function (game.js lines 471-503) replaces `state.character`, resets `state.health`, `state.food`, `state.materials`, `state.cycle`, and increments `state.generation`, but it does NOT touch `state.discoveredZoneIds`. Zone discovery therefore persists silently across all generations.

This means: if gen 1 unlocks the Bosc zone via `act_explorar_voltants` (game.js line 338-342, which calls `state.discoveredZoneIds.add(action.unlocks_zone)`), all subsequent generations begin with Bosc already discovered, with no narrative acknowledgment. Similarly, if DYN-01 is fixed and Ritual becomes discoverable, Ritual would persist post-succession.

By contrast, `state.discoveredUniversalTechIds` also persists on the state object — this is the established precedent, and it is consistent. The question is whether zone persistence is intentional design or an oversight.

**The code does not produce incorrect behavior in isolation** — it produces a design-ambiguous outcome. However, if the design intent is that each generation starts with only the zones their parent "passed down" through explicit inheritance (not accumulated state), then the current code silently over-shares.

**Reproduction steps**:
1. Start gen 1. Execute `act_explorar_voltants` until Bosc is discovered (log: "Nova zona descoberta: Bosc").
2. Proceed to succession without children (force via health depletion).
3. Gen 2 starts. Observe the zone grid: Bosc is displayed even though gen 2 performed no exploration.
4. Open browser console: `state.discoveredZoneIds` contains `"Bosc"` at cycle 0 of gen 2.

**Impact**:
If intentional (zones are collective clan knowledge, not personal), no bug — but needs documenting in the GDD. If unintentional (each generation should rediscover zones), then Bosc exploration and any future zone unlocks need to be either reset to a "starting set" at succession or handed off via an explicit inheritance list (analogous to `inheritedBranchTechs`). As-is, the succession screen cannot communicate zone inheritance to the player because it does not enumerate zones.

---

## DYN-03 — Inherited Branch Tech Passive Effects Do Not Re-Apply on Succession (Correct for one_time_*, Silent Gap for event_block)

**Severity**: S3
**Frequency**: Always (for event_block passive effects)

**Description**:
When a new character is created at succession via `createCharacter()` (game.js lines 492-498), inherited branch tech IDs are stored in the character's `unlockedBranchTechIds` set. `unlockBranchTech()` is never called for inherited techs — only `createCharacter()` is called directly.

For `one_time_health` (bt_agulla_os: +3 Salut, bt_domini_terra: +2 Salut) and `one_time_materials` (bt_calendari_natural: +2 Provisions), not re-applying at succession is correct: these are one-time bonuses that should not recur. The behavior is correct.

For `action_output_bonus` (bt_rasclador_fi: +1 mínim recol·lecta for act_recollectar_arrels), the bonus is applied dynamically at execute time at game.js lines 290-294 by iterating `state.character.unlockedBranchTechIds`. Since the set is inherited, this bonus correctly persists for all generations. Correct.

For `unlock_zone` (bt_pintura_rupestre), the zone persist via `discoveredZoneIds` as noted in DYN-02 — not re-applied but already present on state. Correct (pending DYN-01 fix).

**The gap**: `bt_guariment_plantes` has `passive_effect: { type: "event_block", event_id: "pe_malaltia", ... }` (data.js line 81). `unlockBranchTech()` at game.js lines 194-203 has no handler for `event_block`:

```js
if (pe.type === 'one_time_health')    state.health    = ...
if (pe.type === 'one_time_materials') state.materials += ...
if (pe.type === 'unlock_zone')        state.discoveredZoneIds.add(...)
```

There is no `if (pe.type === 'event_block')` branch. Furthermore, `getEligiblePoolEvents()` at game.js lines 229-240 filters events by `is_single_use` and `is_discovery_event` conditions but has no code that checks the `event_block` passive effects of any unlocked branch tech. The event `pe_malaltia` is not defined in any EVENT_POOLS pool in data.js (searched: it does not appear as any event `id`). The passive effect is entirely declared but never implemented — neither at unlock time nor at event draw time.

This is not a regression from the post-migration data.js; the gap existed before. But with 13 branch techs now in scope and one carrying a unique passive type, the gap is more visible.

**Reproduction steps**:
1. Build espiritualitat ≥ 0.25 and sociabilitat ≥ 0.20 by cycle 4+.
2. Unlock bt_guariment_plantes via discovery action or ritual event.
3. Log shows "Nova habilitat: Guariment amb Plantes" but the passive effect desc "Bloqueja la Febre del Campament" is logged (game.js line 203 logs `pe.desc` without type-gating — it runs for all pe that have a desc).
4. Attempt to verify that "Febre del Campament" (event id `pe_malaltia`) is blocked in pool events — the event does not exist in any pool, so blocking never fires.
5. At succession, the inherited character retains `bt_guariment_plantes` in their `unlockedBranchTechIds` but the block is still never applied, since there is no runtime enforcement.

**Impact**:
Minor now (the blocked event does not exist in pools so the player cannot tell the passive is broken). Becomes S2 if `pe_malaltia` is later added to a pool — the unlock would appear to work (log message fires) but the block would never take effect, leading to a confusing player experience.

---

## DYN-04 — Siblings in siblingPool Carry Stale Inherited Data From the Generation They Were Born In

**Severity**: S3
**Frequency**: Always when siblingPool entries survive more than 1 generation gap

**Description**:
When `triggerSuccession()` fires and more than one child is available (MAX_CHILDREN=3), `continueSuccession()` pushes unchosen children into `state.siblingPool` (game.js lines 479-484). The stored objects carry the `inheritedInclination`, `inheritedStats`, `inheritedPurchased`, `inheritedBranchTechs`, and `inheritedDestreses` computed at the time `triggerSuccession()` was called for their parent generation.

If a sibling from gen 1 is still in the pool at gen 3:
- Their `inheritedInclination` reflects gen 1's parent's inclination × 0.65 — not gen 2 or gen 3.
- Their `inheritedPurchased` reflects gen 1's parent's purchased action set — not the actions purchased in gen 2.
- Their `inheritedBranchTechs` reflects gen 1's parent's branch tech set — new techs discovered in gen 2 are missing.

The succession modal renders the sibling's dominant axis and value from their stored `inheritedInclination` (game.js lines 1096-1099), which the player sees as the heir's preview inclination. This value is outdated by 1–2 generations of drift.

This is the most significant dynasty dynamics issue after DYN-01. A gen 3 player choosing between their own child (inheriting gen 3 inclination × 0.65) and a gen 1 sibling (carrying gen 1 inclination × 0.65, which was computed 2 generations ago) cannot make an informed choice: the sibling's displayed inclination is stale by 2 inheritance steps.

Additionally, a sibling added to the pool in gen 1 does NOT carry the `inheritedBranchTechs` that gen 2 discovered. If gen 2 unlocked bt_agulla_os (Agulla d'Os) and gen 3 chooses the gen 1 sibling, that sibling's character will not inherit bt_agulla_os even though the clan has used that knowledge for one full generation.

**Reproduction steps**:
1. Gen 1: Have 3 children (requires hasPartner=true + 3 executions of act_tenir_fills). End gen 1 with impuls ≈ +0.5.
2. Succession modal: choose child 1. Children 2 and 3 go to siblingPool with inheritedInclination = {impuls: 0.5 × 0.65 = 0.325, ...}.
3. Gen 2: Push impuls further to +0.7. Unlock bt_punta_llanca (new tech). Have 2 children.
4. Succession modal: see 4 successors (2 children + 2 siblings). The 2 siblings still display impuls: 0.325 (gen 1 data). Gen 2 children display impuls: 0.7 × 0.65 = 0.455.
5. Choose one of the gen 1 siblings: the resulting gen 3 character has impuls = 0.325 as starting value — not the expected value, and does NOT have bt_punta_llanca despite the clan having used it since gen 2.

**Impact**:
Medium-term dynasty planning is distorted. The player cannot tell from the succession UI that a sibling is "out of date." The sibling label format is `Fill (cicle X)` (game.js line 351), which only tells what cycle of what generation they were born in — not that their inheritance data is frozen. If siblings persist for 2+ generations (which is possible: MAX_CHILDREN=3 at gen 1 → 2 remain in pool → if gen 2 also takes 1 child, 3 siblings may now be pooled → by gen 3, pool can hold 5 entries), the disparity in inheritance quality between fresh children and stale siblings becomes a silent strategy trap.

---

## DYN-05 — All Children Share Same inheritedInclination Object Reference in triggerSuccession

**Severity**: S3
**Frequency**: Always when 2+ children exist at succession time

**Description**:
In `triggerSuccession()` at game.js lines 438-458, the inheritance data objects are computed once and shared across all children via spread:

```js
const inheritedInclination = Object.fromEntries(...);  // one plain object
const inheritedStats = Object.fromEntries(...);          // one plain object
const inheritedPurchased    = new Set(...);              // one Set instance
const inheritedBranchTechs  = new Set(...);              // one Set instance
const inheritedDestreses    = new Set(...);              // one Set instance

const childSuccessors = children.map(c => ({
  ...c,
  is_sibling: false,
  inheritedInclination,   // <-- same object ref for all children
  inheritedStats,          // <-- same object ref for all children
  inheritedPurchased,      // <-- same Set ref for all children
  inheritedBranchTechs,    // <-- same Set ref for all children
  inheritedDestreses,      // <-- same Set ref for all children
}));
```

All 3 children point to the same `inheritedBranchTechs` Set, the same `inheritedPurchased` Set, etc.

In `continueSuccession()` (game.js line 492), the chosen child's data is passed to `createCharacter()`. Inside `createCharacter()` (game.js lines 34-46), the Sets are re-wrapped:
```js
purchasedActionIds: new Set(inheritedPurchased),       // new Set from iterable — safe
unlockedBranchTechIds: new Set(inheritedBranchTechs),  // new Set from iterable — safe
destreses: new Set(inheritedDestreses),                 // new Set from iterable — safe
```

And the inclination/stats are spread-copied:
```js
inclination: { ...inheritedInclination },  // shallow copy — safe for flat objects
stats: inheritedStats ? { ...inheritedStats } : ...  // shallow copy — safe
```

So in the current code, the shared references are safe because `createCharacter()` always copies before use, and the original objects are never mutated after `triggerSuccession()` returns.

However, the unchosen children stored in `siblingPool` (lines 479-484) retain the raw shared references:

```js
const unchosenChildren = s.successors.filter(c => !c.is_sibling && c.id !== successorId);
state.siblingPool = [...unchosenChildren, ...];
```

These sibling entries in `siblingPool` share the same `inheritedBranchTechs` Set instance. If any code path ever mutated one sibling's `inheritedBranchTechs` directly (rather than going through `createCharacter()`), all siblings from the same generation would be affected. No current code mutates sibling inheritance data in place, so this is a latent bug rather than an active one.

**The active risk**: future code that upgrades a sibling's stored inheritance between generations (e.g., "if a sibling has been in the pool for 2+ generations, update their branchTechs") could accidentally mutate the shared Set, corrupting all siblings from that generation at once.

**Reproduction steps**:
Open browser console while having 3 children at succession:
```js
const succs = state.pendingSuccession.successors;
succs[0].inheritedBranchTechs === succs[1].inheritedBranchTechs  // true
succs[0].inheritedBranchTechs === succs[2].inheritedBranchTechs  // true
```

**Impact**:
Currently latent — no active data corruption. The bug becomes active if any future iteration logic modifies sibling inheritance data in place. Recommend defensively copying the Sets per child at triggerSuccession to isolate each successor's data.

---

## DYN-06 — Game Over Reason Incorrect When Generation 5 Dies With No Heirs

**Severity**: S4
**Frequency**: Always in the specific edge case: generation 5 + no heirs

**Description**:
`triggerSuccession()` checks `state.generation >= MAX_GENERATIONS` FIRST (game.js line 419) and returns immediately with reason `'max_generations'`. It never reaches the heir check at lines 428-432.

If generation 5 has no children AND no siblings in the pool, the game over reason shown is `'max_generations'` ("Cinc generacions han passat. El coneixement del teu llinatge queda gravat a les roques.") instead of the more accurate `'no_heir'` ("El personatge ha mort sense fills. El llinatge s'extingeix en aquesta generació.").

The `'no_heir'` path would only fire for gen 5 if the `max_generations` check were moved AFTER the heir check — which is not clearly the right priority either, since gen 5 with or without heirs always ends the game. The message accuracy issue is: dying childless in gen 5 is a dynasty failure; the current message frames it as a dynasty completion.

**Reproduction steps**:
1. Play 4 generations normally, always choosing one child as successor.
2. In gen 5, deliberately avoid having children (never execute act_tenir_fills).
3. Reach cycle 14 or health 0 — succession fires.
4. Game over modal shows: "Cinc generacions han passat. El coneixement del teu llinatge queda gravat a les roques."
5. The `no_heir` framing is never shown even though the dynasty ended without propagation.

**Impact**:
Cosmetic / narrative only. The game ends correctly in all cases — only the modal text is misleading in this specific edge case. No mechanical impact.

---

## DYN-07 — act_tenir_fills Uses state.generation Instead of state.cycle for Child ID

**Severity**: S4
**Frequency**: Always — low collision risk, but incorrect field reference

**Description**:
`executeAction()` at game.js lines 350-358 creates child objects as:

```js
const child = { id: `child_${state.generation}_${state.cycle}`, label: `Fill (cicle ${state.cycle})` };
```

The ID uses `state.generation` (the current generation number) and `state.cycle` (current cycle within this generation). This is functionally unique across a single playthrough because each generation starts at cycle 0 and no two children in the same generation can be born on the same cycle (each birth requires one action = one cycle). The ID will never collide in normal play.

However, there is a correctness edge case: if `state.generation` and `state.cycle` happen to match values from a prior generation (e.g., gen 1 cycle 3 and gen 2 cycle 3 produce IDs `child_1_3` and `child_2_3` respectively — distinct), the system works. The real concern is if the siblingPool retains `child_1_3` from gen 1 and gen 2 also produces `child_2_3`, then at gen 3 succession, `continueSuccession()` calls `s.successors.find(c => c.id === successorId)` — these IDs are distinct, so no false match occurs.

The label `Fill (cicle ${state.cycle})` is displayed in the succession modal and is the only human-readable identifier for each child. With up to 3 children possible and MAX_CHILDREN=3, two children born at different cycles have distinct labels. With the siblingPool potentially accumulating siblings from prior generations, a label like "Fill (cicle 3)" does not indicate which generation the child is from. The is_sibling display adds a "Germà" tag but does not show the origin generation.

**Reproduction steps**:
1. Gen 1: have 3 children at cycles 3, 5, 7. IDs: child_1_3, child_1_5, child_1_7.
2. Choose child_1_3. Siblings child_1_5 and child_1_7 go to pool.
3. Gen 2: have 2 children at cycles 3 and 5. IDs: child_2_3, child_2_5.
4. Succession modal shows 4 successors with labels: "Fill (cicle 3)" [gen 2], "Fill (cicle 5)" [gen 2], "Fill (cicle 5)" [gen 1 sibling], "Fill (cicle 7)" [gen 1 sibling].
5. Two entries show "Fill (cicle 5)" — one is a child, one is a sibling from gen 1. Player cannot distinguish by label alone; the "Germà" tag distinguishes sibling vs. child but not their birth generation.

**Impact**:
Cosmetic / UX. No data corruption. ID uniqueness is preserved. The label ambiguity is a minor information loss for the player comparing heirs, not a code bug.

---

## Summary

| ID | Title | Severity | Type |
|---|---|---|---|
| DYN-01 | Ritual zone permanently inaccessible: zone_id mismatch | S2 | Bug |
| DYN-02 | discoveredZoneIds persists across succession — confirm design intent | S3 | Design Ambiguity |
| DYN-03 | event_block passive effect (bt_guariment_plantes) never implemented | S3 | Bug (latent) |
| DYN-04 | Siblings in siblingPool carry stale inherited data from birth generation | S3 | Bug / Design |
| DYN-05 | All children share same inheritedInclination/BranchTechs object references | S3 | Latent Bug |
| DYN-06 | Game over reason incorrect for gen 5 + no heirs edge case | S4 | Cosmetic |
| DYN-07 | Child label "Fill (cicle X)" ambiguous when siblings from multiple gens coexist | S4 | UX |

**Blocking issues**: 1 (DYN-01 — Ritual zone unreachable, blocks all Místic branch gameplay)

**Design ambiguities to confirm with game-designer**: DYN-02 (zone persistence intent), DYN-04 (sibling staleness — intentional freeze or oversight?)

### Inheritance Correctness Status After Migration

| Mechanism | Correct? | Notes |
|---|---|---|
| discoveredZoneIds reset on succession | N/A — does not reset | Persists; design ambiguity (DYN-02) |
| discoveredZoneIds for Ritual after bt_pintura_rupestre | BROKEN | zone_id mismatch "zone_ritual" vs "Ritual" (DYN-01) |
| one_time_health passive re-applies on succession | CORRECT | Does not re-apply — by design |
| one_time_materials passive re-applies on succession | CORRECT | Does not re-apply — by design |
| action_output_bonus persists via inherited set | CORRECT | Applied dynamically at execute time |
| event_block passive enforced at runtime | BROKEN | No handler in unlockBranchTech or getEligiblePoolEvents (DYN-03) |
| unlockedBranchTechIds inherits 100% | CORRECT | Proper Set copy in createCharacter line 36 |
| siblingPool persists across generations | CORRECT | State-level, never reset |
| Unchosen children go to siblingPool | CORRECT | Lines 479-484 filter and store correctly |
| Sibling inheritance data frozen at birth generation | BY DESIGN? | Stale after 2+ generations (DYN-04) |
| gen 5 → game over | CORRECT | max_generations check fires before heir check |
| gen 5 + no heirs → correct reason | COSMETIC BUG | Shows max_generations instead of no_heir (DYN-06) |
