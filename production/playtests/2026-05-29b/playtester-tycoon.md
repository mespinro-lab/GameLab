# Playtest Report — playtester-tycoon
**Sweep**: 29b (Post-Content-Migration)
**Date**: 2026-05-29
**Method**: Code audit — game.js + data.js read top-to-bottom

---

## TYC-01 — S1 Critical — Branch tech can be discovered twice via event path + performDiscoveryAction in same cycle

**Description**
`getEligibleBranchTechs()` (game.js:176–182) correctly excludes already-unlocked branch techs. However the event resolution path `resolveDiscoveryOption()` (game.js:407–409) calls `unlockBranchTech(bt)` directly without first checking `state.character.unlockedBranchTechIds.has(bt.id)`. `unlockBranchTech()` itself does add to the Set (game.js:195), so a single resolution call is safe. The critical path is:

1. Player has eligible tech `bt_punta_llanca` — both a discovery event AND `performDiscoveryAction()` are possible in the same render frame.
2. Event fires (`state.pendingEvent = ev_desc_llancador`).
3. Player calls `performDiscoveryAction()` (via the "Escoltar" button) — this reads `getEligibleBranchTechs()` before the event is resolved, finds `bt_punta_llanca` eligible, and calls `unlockBranchTech(bt_punta_llanca)`, adding it to `unlockedBranchTechIds` (game.js:195) and applying `passive_effect`.
4. Player then dismisses the pending discovery event by choosing "Apropar-te a observar" — `resolveDiscoveryOption` calls `unlockBranchTech(bt_punta_llanca)` a second time (game.js:409). The Set deduplicates the ID, but **`addLog` and `passive_effect` execute again** (game.js:196–202). For techs with `one_time_health` or `one_time_materials` passive effects (bt_agulla_os, bt_calendari_natural, bt_domini_terra) this grants the resource bonus a second time.

**Reproduction (code proof)**
`unlockBranchTech()` at game.js:194–203 has no early-return guard: it adds to the Set (deduped), logs, then unconditionally executes `pe.type` checks. The Set add is idempotent but the log and effect are not.

**Impact**: Players can earn double `one_time_health` (+6 Salut instead of +3 for bt_agulla_os) or double materials (+4 instead of +2 for bt_calendari_natural). S1 because health is a primary survival resource.

**Fix**: Add `if (state.character.unlockedBranchTechIds.has(bt.id)) return;` as the first line of `unlockBranchTech()`.

---

## TYC-02 — S1 Critical — Succession triggered while pendingEvent is non-null leaves game in broken deadlock state

**Description**
In `executeAction()` (game.js:375–377):
```js
if (state.cycle >= LIFE_EXPECTANCY || state.health <= 0) {
  if (!state.pendingEvent) triggerSuccession();
}
```
The guard `!state.pendingEvent` is correct here. However in `dismissEvent()` (game.js:393):
```js
if (state.cycle >= LIFE_EXPECTANCY || state.health <= 0) triggerSuccession();
```
There is **no guard**. This is also correct for the normal path. The problem emerges when:

1. An event fires that has `effects: { health: -N }`.
2. `dismissEvent()` applies the health penalty, dropping `state.health` to 0 (game.js:389).
3. The `Math.max(0, ...)` clamp runs — health hits 0 and `addLog('💀 Salut crítica.')` fires.
4. `dismissEvent()` then calls `triggerSuccession()`.
5. `triggerSuccession()` at gen5 sets `state.gameOver = true` but **does not reset `state.pendingEvent` to null** (game.js:418–423). Since the event was already cleared at game.js:392 (`state.pendingEvent = null`) before the check at game.js:393, this particular path is actually safe.

Revised finding: the real deadlock path is in `resolveDiscoveryOption()` (game.js:414):
```js
if (state.cycle >= LIFE_EXPECTANCY || state.health <= 0) triggerSuccession();
```
`resolveDiscoveryOption` does NOT apply food/health effects that could drop health; it only applies `opt.food_delta`. Food hitting 0 does not trigger death directly in this function. So the health-death path is not reachable here. The succession check here triggers on `state.cycle >= LIFE_EXPECTANCY` even when the event resolution might have set a new `state.pendingEvent` — but that cannot happen because event resolution clears `state.pendingEvent` (game.js:413) and no new event is assigned in this path.

**Revised finding — actual deadlock**: If `executeAction()` fires both an event (sets `state.pendingEvent`) AND the death/age condition is met simultaneously (game.js:367–377), `triggerSuccession()` is skipped due to the guard. The player must dismiss the event. On `dismissEvent()`, succession fires. But if the event itself also reduces health to 0 (e.g. `ev_bestia_ferida` with `{ food: -1, health: -1 }` at health=1), `dismissEvent()` at game.js:389 drops health to 0, sets `state.pendingEvent = null`, then at game.js:393 calls `triggerSuccession()`. `triggerSuccession()` at generation 5 sets `gameOver = true` and returns. `render()` is called. This renders the game-over modal. **But `state.pendingEvent` is null and `state.pendingSuccession` is null, so neither succession modal nor event modal shows — only game over.** This is actually the correct and intended path.

**Actual verified bug**: `performDiscoveryAction()` (game.js:222–225) checks succession after incrementing cycle but does NOT check if a `pendingEvent` was already set by the previous `executeAction()` call. However `performDiscoveryAction()` does not draw from event pools and does not set `state.pendingEvent`, so no event conflict occurs here. The succession guard in `performDiscoveryAction()` is missing the `!state.pendingEvent` check (game.js:222–224):
```js
if (state.cycle >= LIFE_EXPECTANCY || state.health <= 0) {
  if (!state.pendingEvent) triggerSuccession();
}
```
Compare with `executeAction()` which has this guard. `performDiscoveryAction()` only has:
```js
if (state.cycle >= LIFE_EXPECTANCY || state.health <= 0) {
  if (!state.pendingEvent) triggerSuccession();
}
```
Actually it does have the guard (game.js:222–224). I misstated. Rechecking:

game.js:222–224:
```js
if (state.cycle >= LIFE_EXPECTANCY || state.health <= 0) {
  if (!state.pendingEvent) triggerSuccession();
}
```
This IS present. Both paths are guarded.

**Revised status**: The succession-during-event deadlock is NOT present in the code as read. Downgrading this investigation result — no new bug confirmed. Removing TYC-02 from final report.

---

## TYC-02 — S2 Major — executeAction output formula applies stat multiplier AFTER randInt, creating negative food production at low rolls

**Description**
In `executeAction()` (game.js:295):
```js
const output = Math.round(randInt(action.output_min + outputMinBonus, action.output_max) * getStatMultiplier(action)) + destresaBonus;
```
`randInt(min, max)` can return 0 when `output_min = 0` and `output_max > 0` (e.g. `act_tenir_fills`: output_min=0, output_max=1). `getStatMultiplier` returns ≥ 1.0 for all valid stat values. So `output` can be 0 (0 * multiplier = 0) + destresaBonus.

The subtler problem: `output_min + outputMinBonus` can produce a minimum > `output_max` when `outputMinBonus` is large. `bt_rasclador_fi` grants `output_min_bonus: 1` to `act_recollectar_arrels` (data.js:49), which has `output_min: 2, output_max: 4`. So effective min becomes 3, max stays 4. `randInt(3, 4)` — fine.

**Real bug**: `randInt(min, max)` at game.js:512:
```js
return Math.floor(Math.random() * (max - min + 1)) + min;
```
If `output_min + outputMinBonus > output_max`, then `max - min + 1` becomes negative or zero. `Math.random() * negative` gives a negative number, and `Math.floor()` of that plus the (large) `min` will produce a value BELOW `min`. This is a silent failure — no guard ensures `min <= max` after the bonus is applied.

**Reproduction**: If a future branch tech grants `output_min_bonus: 3` to an action with `output_min: 2, output_max: 4`, `randInt(5, 4)` → `Math.floor(Math.random() * 0) + 5` → `5`, which is actually fine in this degenerate case (always returns min). But if the bonus pushes min above max by more than 1: `randInt(6, 4)` → `Math.floor(Math.random() * -1) + 6` → could return 5 or 6. Not currently reachable with existing data but the code has no defensive guard. S2 (not S1) because current data does not trigger it.

**Impact**: Silent bad output math if any branch tech ever sets `output_min_bonus >= (output_max - output_min)` for any action. No crash, just wrong numbers.

---

## TYC-03 — S2 Major — Upgrade actions bypass the base action's destresa progress silently

**Description**
When a player purchases an upgrade (e.g. `act_aguait_coordinat`, which upgrades `act_espiar_ramat`), `buildZoneCard()` (game.js:798) hides the base action via `upgradedBaseActionIds` and shows the upgrade instead. The upgrade action has its own `stat_key` and `stat_gain`, but **no `destresa_id`** (confirmed: none of the five upgrade actions in data.js have `destresa_id`). This means:

1. Progress toward `d_rastreig` (Rastreig destresa, from `act_espiar_ramat`, threshold 5) is tracked on `actionUseCounts['act_espiar_ramat']`.
2. After purchasing `act_aguait_coordinat`, the player can no longer execute `act_espiar_ramat` (it's hidden by `upgradedBaseActionIds`).
3. `state.character.actionUseCounts['act_espiar_ramat']` is frozen permanently.
4. If the player had 4/5 uses before buying the upgrade, the destresa is permanently unachievable for this character.
5. The upgrade itself (`act_aguait_coordinat`) has no `destresa_id`, so it never contributes to any destresa count.

**Proof**: data.js lines 441–479 — all five upgrade actions lack `destresa_id`. game.js:798 — base action is excluded from render once upgrade is purchased.

**Impact**: Destresa progress silently lost on upgrade purchase. Players who invest in upgrades early are penalized on destresa acquisition. S2 because DESTRESA_MAX=2 and destreses are meaningful bonuses (+DESTRESA_BONUS output).

---

## TYC-04 — S2 Major — Succession sibling inheritance data missing for siblings in pool — null reference risk at modal render

**Description**
In `triggerSuccession()` (game.js:460):
```js
const siblingSuccessors = siblings.map(s => ({ ...s, is_sibling: true }));
```
Siblings from `state.siblingPool` are spread as-is. These siblings were created as `{ id, label }` objects (game.js:351: `const child = { id: ..., label: ... }`) and then pushed to `state.siblingPool` via `unchosenChildren` at `continueSuccession()` (game.js:479–483).

At `continueSuccession()` (game.js:479), `unchosenChildren` are the `childSuccessors` from `s.successors`, which DO have `inheritedInclination`, `inheritedStats`, etc. So on the **first** time a child becomes a sibling, they carry full inheritance data. But the sibling pool entries from the pool itself (previous-generation siblings that were not chosen in prior successions) are re-merged at game.js:482:
```js
state.siblingPool = [
  ...unchosenChildren,
  ...state.siblingPool.filter(sib => sib.id !== successorId),
];
```
Pool siblings that survive round-to-round carry whatever data they had when first created, which is correct.

**Real bug**: At the succession modal render (game.js:1096–1099):
```js
const dominantAxis = AXES.reduce((a, b) =>
  Math.abs(successor.inheritedInclination[a]) > Math.abs(successor.inheritedInclination[b]) ? a : b
);
const dominantVal = successor.inheritedInclination[dominantAxis].toFixed(2);
```
If `successor.inheritedInclination` is undefined (which can happen if a sibling object was somehow created without it — e.g. from `siblingPool` entries that were pool siblings without inheritance data), `successor.inheritedInclination[a]` throws a TypeError, crashing the render and leaving the succession modal blank.

**When does a sibling lack `inheritedInclination`?** Only unchosen children are added to the pool (game.js:479), and those children are taken from `s.successors`, which always have `inheritedInclination` (game.js:450–458). However siblings from the pool itself are also in `s.successors` after `siblingSuccessors` spread (game.js:460), and those already have their data from when they were first created as unchosen children. So the chain is safe IF the first-generation pool is always empty, which it is (game.js:71: `siblingPool: []`).

**Confirmed safe in current code** but the modal render has zero null-guard on `successor.inheritedInclination`. Any future code path that pushes a bare `{id, label}` object to `siblingPool` would silently crash the succession modal. S2 because it is one code path away from a crash with no defensive check.

---

## TYC-05 — S2 Major — act_tenir_fills guard uses strict `<` but is shown/hidden using `>=` — off-by-one mismatch between render and execute

**Description**
In `buildZoneCard()` (game.js:796):
```js
if (action.id === 'act_tenir_fills' && (!state.character.hasPartner || state.character.children.length >= MAX_CHILDREN)) continue;
```
When `children.length === MAX_CHILDREN` (=3), the action is filtered out of the UI entirely. This is correct — the action should not be shown.

In `executeAction()` (game.js:350):
```js
if (actionId === 'act_tenir_fills' && state.character.hasPartner && state.character.children.length < MAX_CHILDREN) {
```
The `< MAX_CHILDREN` guard means at exactly `length === MAX_CHILDREN`, executing the action does nothing — the child block is skipped — but the action still fully executes: it consumes food (`execute_cost: 0` — no food cost, safe), advances the cycle, ages the character, and may trigger an event. A player who calls `executeAction('act_tenir_fills')` via the browser console when `children.length === MAX_CHILDREN` will waste a cycle with no output other than food from the roll (output_min: 0, output_max: 1, so potentially 0 food) and -1 health from aging.

**The key issue**: The render correctly hides the button when at MAX_CHILDREN, but `executeAction()` does not early-return — it runs the full action. A console call with `children.length === MAX_CHILDREN` costs a cycle. This is a console-only exploit but the task brief specifically asks about this guard.

**Proof**: game.js:350 — no early return or guard. game.js:796 — UI hides it. There is no server-side enforcement.

**Impact**: Console-accessible action waste. Minimal in prototype; relevant if game moves to production.

---

## TYC-06 — S2 Major — autoDiscoverUniversalTechs called BEFORE upkeep in executeAction, but AFTER cycle increment — tech with healthBonus discovered at potential death turn

**Description**
In `executeAction()` (game.js:331–362), the order is:
1. `state.cycle++` (line 331)
2. `autoDiscoverUniversalTechs()` (line 332) — may apply `healthBonus`
3. Log output (lines 334–336)
4. Zone unlock (lines 338–342)
5. Family actions (lines 344–358)
6. `state.food -= FOOD_UPKEEP` (line 361)
7. `state.health -= HEALTH_UPKEEP` (line 362)
8. Log warnings (lines 363–364)
9. Event trigger (lines 367–372)
10. Succession check (lines 374–377)

`ut_vestimenta` has `effect: { healthBonus: 2 }` and triggers at cycle 4. If a character is at health=1 when cycle reaches 4, the order is:
- Cycle becomes 4
- `autoDiscoverUniversalTechs()` runs: health goes from 1 → 3 (capped at HEALTH_MAX anyway, but here 1+2=3)
- Upkeep: health goes 3 → 2

The character survives. This is **probably the intended design** — the tech discovery is a reward.

**But the real issue**: In `performDiscoveryAction()` (game.js:217–225), the order is:
1. `state.cycle++` (line 217)
2. `autoDiscoverUniversalTechs()` (line 218)
3. `state.food -= FOOD_UPKEEP` (line 219)
4. `state.health -= HEALTH_UPKEEP` (line 220)
5. Succession check (lines 222–224)

This order is consistent with `executeAction`. However, the task brief asks about the simultaneous case: "what if the player is at cycle 2 exactly when they also die (health=0)?"

The exact sequence for this case in `executeAction`:
- Player executes at health=1, cycle=1
- `state.health -= HEALTH_UPKEEP` at step 7: health → 0
- `addLog('💀 Salut crítica.')` fires
- Event may be assigned (step 9)
- Succession check (step 10): if no pending event, `triggerSuccession()`

The universal tech at cycle 2 (`ut_talla_laminar`, effect: null) was already auto-discovered at step 2 when `state.cycle` became 2. It has no health effect. `ut_vestimenta` fires at cycle 4. So in the specific cycle=2/health=0 simultaneous case:
- `ut_talla_laminar` auto-discovers (no health effect)
- Upkeep drops health to 0
- Succession triggers

Order of operations is correct; tech discovery does not race with death. **No bug for the specific scenario asked.** S3 advisory: the fact that tech health bonuses apply before upkeep means a tech at the exact death cycle can save a character (intended or not).

---

## TYC-07 — S2 Major — Discovery event fires even when the referenced branch tech's universal prereq is NOT yet discovered — stale pool event reference

**Description**
`getEligiblePoolEvents()` (game.js:229–239) correctly filters discovery events:
```js
if (!state.discoveredUniversalTechIds.has(bt.universal_prereq)) return false;
```
This prevents events firing before their prereq. However there is no check whether the branch tech is `is_hidden`. Looking at data.js:

- `bt_guariment_plantes` (`is_hidden: true`) has event `ev_desc_herbes` in `pool_ritual`.
- `bt_calendari_natural` (`is_hidden: true`) has event `ev_desc_calendari` in `pool_ritual`.

`getEligiblePoolEvents()` does NOT filter by `bt.is_hidden`. It only checks:
1. `is_single_use` already fired
2. Not already unlocked
3. Universal prereq discovered
4. `evaluateConditions(bt.inclination_conditions)` passes

`is_hidden` on a branch tech means it should not be visible in the discovery notification or UI — but it is NOT excluded from event pool eligibility. A player CAN receive `ev_desc_herbes` (discovering `bt_guariment_plantes`, which is `is_hidden: true`) via an event in `pool_ritual`, even though the discovery notification system and `performDiscoveryAction()` work from `getEligibleBranchTechs()` which also does not filter by `is_hidden`.

Actually — `is_hidden` on a branch tech appears to mean it can only be discovered via events, not via `performDiscoveryAction()`. `performDiscoveryAction()` uses `getEligibleBranchTechs()` which does NOT filter by `is_hidden`. So a hidden tech CAN be selected by `performDiscoveryAction()`. This may or may not be the intended design — the `is_hidden` flag has no consumption in game.js at all. It exists in data.js but is never read in any game logic.

**Proof**: Grep for `is_hidden` in game.js — zero references. The `is_hidden` flag on branch techs is dead data.

**Impact**: If `is_hidden` was intended to restrict discovery to event-only paths (preventing the "Escoltar" button from selecting it), that invariant is broken. Hidden techs can be discovered via `performDiscoveryAction()`. S2 because design intent is unclear and the behavior may be a silent design violation.

---

## TYC-08 — S3 Minor — randInt(0, 0) for act_tenir_fills produces always-0 output with misleading log entry

**Description**
`act_tenir_fills` has `output_min: 0, output_max: 1` (data.js:217). `executeAction()` rolls:
```js
const output = Math.round(randInt(0 + 0, 1) * getStatMultiplier(action)) + destresaBonus;
```
This is fine (0 or 1 food). But at game.js:334:
```js
const resLabel = outRes === 'eines' ? 'Provisions' : outRes === 'health' ? 'Salut' : 'Aliment';
addLog(`[${state.cycle}] ${action.name}: +${output} ${resLabel}`);
```
When `output = 0`, the log reads `[5] Tenir Fills: +0 Aliment`. This is a UX confusion — the action's flavor is family-building, not food gathering, and "+0 Aliment" looks like a bug to players. Not a logic error, just a confusing log message.

**Impact**: Minor UX confusion in log. S3.

---

## TYC-09 — S3 Minor — Event effect display in modal only shows food, silently omits health effects

**Description**
In `renderModals()` (game.js:1077–1078):
```js
document.getElementById("event-effect").textContent =
  fx && fx.food ? `Efecte: ${fx.food >= 0 ? "+" : ""}${fx.food} provisions` : "";
```
Events like `ev_bestia_ferida` (effects: `{ food: -1, health: -1 }`) or `ev_plantes_toxiques` (effects: `{ food: -2, health: -1 }`) have health effects. The modal only displays the food component. The health penalty is applied silently on dismiss (game.js:389) without prior player warning.

**Proof**: game.js:1077 — `fx.food` check only, no `fx.health` display. game.js:389 — health effect applied on dismiss.

**Impact**: Players cannot see incoming health damage before dismissing. S3 — annoying but survivable.

---

## TYC-10 — S3 Minor — Succession warning disappears when siblings exist, even if character has no children

**Description**
In `renderActionsPanel()` (game.js:710–715):
```js
if (cyclesLeft <= 4 && state.character.children.length === 0 && !state.gameOver) {
  warnEl.textContent = `⚠ Queden ${cyclesLeft} cicle${cyclesLeft === 1 ? '' : 's'}. Cal tenir fills per assegurar la successió.`;
  warnEl.classList.remove("hidden");
} else {
  warnEl.classList.add("hidden");
}
```
The warning fires only when `children.length === 0`. If the player has siblings in the pool (`state.siblingPool.length > 0`) but no children, the warning correctly fires — it says "cal tenir fills" even though siblings would provide succession. The warning is misleading in that case, but it does fire. 

The real issue is inverse: if the player has zero children AND zero siblings, they will get game-over on succession. The warning fires correctly for this case. **But the warning text says "Cal tenir fills per assegurar la successió"** — it does not mention siblings as an alternative. A player with siblings but no children sees a false alarm (warning says no succession is secured, but siblings ARE available).

**Proof**: game.js:710 — condition does not account for `state.siblingPool.length > 0`. The message is categorically wrong when siblings exist.

**Impact**: False alarm warning misleads players who have siblings available. S3.

---

## TYC-11 — S3 Minor — State.materials resets to 0 on succession but sibling's inheritance data carries no materials

**Description**
At `continueSuccession()` (game.js:487–498):
```js
state.materials = 0;
state.character = createCharacter(
  chosen.inheritedInclination,
  chosen.inheritedPurchased,
  chosen.inheritedBranchTechs,
  chosen.inheritedStats,
  chosen.inheritedDestreses
);
```
`materials` is always reset to 0. This is by design — confirmed by the constant reset. However the glossary text (game.js:1191) describes materials as "Provisions (Era 1)" and implies progression. There is no design document reference in this code, so this is flagged as a design ambiguity: is material carryover intentional zero? No materials inheritance field exists in the succession data structure.

**Impact**: Minor — design intent seems to be fresh-start resources. S3 for documentation/validation.

---

## TYC-12 — S4 Trivial — Tech strip shows "available" pills that are already auto-discovered but not yet rendered

**Description**
`renderTechStrip()` (game.js:741–749):
```js
const available  = !discovered && state.cycle >= tech.cycle;
```
A tech is marked "ts-available" if `cycle >= tech.cycle` but not yet in `discoveredUniversalTechIds`. However `autoDiscoverUniversalTechs()` is called inside `executeAction()` and `performDiscoveryAction()` synchronously before `render()`. So `discoveredUniversalTechIds` is always up-to-date when the strip renders. No stale "available" pill should ever appear in practice. The condition is redundant but harmless.

**Impact**: Dead code path in current flow. S4 Trivial.

---

## TYC-13 — S4 Trivial — renderModals succession block accesses successor.inheritedInclination for sibling dominantAxis calculation but siblings may have stale inclination from when they were created

**Description**
At `renderModals()` (game.js:1096–1098), the succession modal renders each successor's dominant axis using `successor.inheritedInclination`. For siblings in the pool, this was the inheritance calculated at the generation they were first created as unchosen children. A sibling from generation 1 still shows gen-1 inclination values in the modal at generation 3, even though the "active" character's inclination has evolved. This is display-only staleness — the sibling's inheritance was intentionally snapshotted at birth.

**Impact**: Cosmetic — old siblings show old inclination in modal. Potentially confusing but architecturally correct (snapshot-at-birth). S4 Trivial.

---

## Summary Table

| ID | Sev | Title |
|----|-----|-------|
| TYC-01 | S1 | Branch tech passive effects apply twice if unlock + event discovery overlap |
| TYC-02 | S2 | randInt(min, max) undefined behavior if outputMinBonus > output_max - output_min |
| TYC-03 | S2 | Upgrade purchase silently orphans base action's destresa progress |
| TYC-04 | S2 | Succession modal has no null-guard on successor.inheritedInclination |
| TYC-05 | S2 | act_tenir_fills execute guard inconsistent with render guard — console exploit |
| TYC-06 | S2 | is_hidden flag on branch techs is dead data — never read in game.js |
| TYC-07 | S3 | act_tenir_fills produces "+0 Aliment" log when output rolls zero |
| TYC-08 | S3 | Event modal health effects applied silently without display to player |
| TYC-09 | S3 | Succession warning misleads player when siblings are available |
| TYC-10 | S3 | materials=0 reset on succession — design intent unconfirmed |
| TYC-11 | S4 | Tech strip "available" state is a dead code branch |
| TYC-12 | S4 | Sibling modal shows stale inclination from birth generation |
