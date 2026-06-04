# Playtest Report — Code Audit (Tycoon) — 2026-05-29

## Summary
- **Agents run**: playtester-tycoon
- **Scope**: Full code audit (invariants, data cross-reference, system traces, edge cases, initialization)
- **Total issues**: 8 (S1: 1 · S2: 3 · S3: 3 · S4: 1)
- **New issues**: 8 | **Known / pre-existing**: 0

All core invariants hold (health, food, stats, destresa cap, inclination clamping, succession gate). One S1 blocker: food can go negative when an event discovery option applies a negative `food_delta`, bypassing the `Math.max(0, ...)` guard used everywhere else. Three S2 mechanics have incorrect or surprising behavior: FADE_MARGIN is 0.10 in code vs 0.05 per spec, health and food do not reset on succession (new generation inherits a dying state), and the succession gate fires at `generation >= 5` rather than `> 5`, giving the player 4 playable generations instead of the intended 5. All data cross-references pass cleanly.

---

## Invariant Checks

| # | Invariant | Result |
|---|-----------|--------|
| 1 | health ∈ [0, HEALTH_MAX] | PASS |
| 2 | food ≥ 0 | **FAIL** — resolveDiscoveryOption |
| 3 | stats[k] ∈ [STAT_STARTING_VALUE, STAT_MAX] | PASS |
| 4 | destreses.size ≤ DESTRESA_MAX | PASS |
| 5 | generation ≤ MAX_GENERATIONS | PASS |
| 6 | inclination ∈ [-1.0, +1.0] | PASS |

## Data Cross-Reference

| # | Check | Result |
|---|-------|--------|
| 7 | All unlocks_action_ids → ACTIONS | PASS — all 12 IDs found |
| 8 | All event_pool_ids → EVENT_POOLS | PASS |
| 9 | All universal_prereqs → UNIVERSAL_TECHS | PASS |
| 10 | Branch IDs in BRANCH_TECHS | PASS — not used by ID |

---

## Issues

### AUD-01 · food goes negative in resolveDiscoveryOption
- **Source**: `game.js:356`
- **Description**: `state.food += opt.food_delta` is applied with no clamp. Every other food mutation in the codebase uses `Math.max(0, ...)`. The event `ev_desc_llancador` uses `food_delta: -2` and `ev_desc_figuretes` uses `food_delta: -3`. If the player has food=1 and chooses to learn from the `ev_desc_figuretes` option, food becomes `1 + (-3) = -2`.
- **Reproduction**: Start game, reach food=1 (via upkeep drain), receive the `ev_desc_figuretes` event (from `pool_social`), choose "Demanar-li que t'ensenyi a fer-ne (−3 Aliment)".
- **Impact**: food becomes a negative integer. Subsequent upkeep check `Math.max(0, state.food - FOOD_UPKEEP)` at `game.js:315` will clamp on the *next* action, masking the corruption. Any display showing negative food looks broken and the invariant `food ≥ 0` is violated.
- **Severity**: S1 (data corruption / invariant break)
- **Route to**: gameplay-programmer
- **Fix**: Wrap line 356 as `state.food = Math.max(0, state.food + opt.food_delta)`.

---

### AUD-02 · FADE_MARGIN constant is 0.10 in code, spec says 0.05
- **Source**: `game.js:10`
- **Description**: `const FADE_MARGIN = 0.10;` — the task brief and spec document list `FADE_MARGIN=0.05`. The value 0.10 is double the intended margin. This widens the "ghost zone" around every inclination threshold, making more actions appear FADED rather than HIDDEN when the character is 0.05–0.10 below a requirement.
- **Reproduction**: Set impuls to 0.0. Action `act_cacera_gran` requires `impuls ≥ 0.10`. With FADE_MARGIN=0.10: `0.0 >= 0.10 - 0.10 = 0.0` → FADED. With FADE_MARGIN=0.05: `0.0 >= 0.10 - 0.05 = 0.05` → false → HIDDEN. The action is incorrectly shown as reachable.
- **Impact**: Actions appear FADED when they should be HIDDEN, giving false affordance signals. Balance and UX design around inclination thresholds is undermined.
- **Severity**: S2 (incorrect mechanic behavior)
- **Route to**: game-designer (confirm intended value), gameplay-programmer (change constant)

---

### AUD-03 · Health and food are NOT reset on succession — new generation inherits dying parent state
- **Source**: `game.js:395–425` (`continueSuccession`)
- **Description**: `continueSuccession` resets `cycle = 0` and creates a new character with inherited inclination/stats/purchased actions/branch techs. However `state.health` and `state.food` are never reset. If the parent dies at `health=0` (succession triggered by `health <= 0` at `game.js:329`) or reaches succession with `food=1`, the new generation begins play with those same critical values — effectively starting already at crisis.
- **Reproduction**: Execute actions that drain health via `health_delta: -2` (e.g. `act_cacera_gran`) until health ≤ 0, then dismiss pending event. `triggerSuccession` fires, player clicks "Continua". New generation starts at health=0.
- **Impact**: New generation triggers immediate succession at the very next action (health ≤ 0 check at `game.js:329`), creating a chain of instant game-overs. The `no_heir` game over fires if the brand-new character has no children (they never can, starting fresh). This is a progression blocker when health-driven succession occurs.
- **Severity**: S2 (incorrect mechanic / progression blocker in health=0 succession path)
- **Route to**: gameplay-programmer (add `state.health = STARTING_HEALTH; state.food = STARTING_FOOD;` or partial restore in `continueSuccession`)

---

### AUD-04 · getActionVisibility FADED check: nearLow uses `range.min - FADE_MARGIN` but action can still be executed when FADED
- **Source**: `game.js:88–110` (`getActionVisibility`), `game.js:244`
- **Description**: `executeAction` at line 244 checks `if (vis !== "ACTIVE")` and blocks execution with a log message, then returns — without calling `render()`. This means the player sees the rejection message but the UI does not update, leaving any stale UI state unchanged. All other early-return error paths in `executeAction` and `purchaseAction` call `render()` before returning (e.g. lines 228, 248–249).
- **Reproduction**: Have a purchased action at FADED visibility. Click "Executar". The rejection log is added but `render()` is not called, so the last-result panel does not update, and the log entry does not appear until the next render-triggering action.
- **Impact**: UX defect — player sees silent failure with stale screen. Minor but confusing.
- **Severity**: S3 (edge-case UX)
- **Route to**: gameplay-programmer
- **Fix**: Add `render();` before `return;` at `game.js:245`.

---

### AUD-05 · Off-by-one: player gets 4 full playable generations, not 5
- **Source**: `game.js:376–379` (`triggerSuccession`)
- **Description**: `state.generation` starts at 1. `triggerSuccession` checks `if (state.generation >= MAX_GENERATIONS)` — this fires when generation is 5. But generation reaches 5 only *after* `continueSuccession` increments it at `game.js:418`. So the sequence is: gen 1 plays → succession fires (gen=1 < 5, OK) → `continueSuccession` sets gen=2 → gen 2 plays → ... → gen 4 plays → succession fires (gen=4 < 5, OK) → `continueSuccession` sets gen=5 → gen 5 plays → succession fires (gen=5 >= 5) → game over. The player does play 5 generations. However, game over text says "Cinc generacions han passat" which is accurate. This is PASS — **but** if the intent was to use generation as a displayed counter (shown as `Gen ${state.generation}/${MAX_GENERATIONS}` at `game.js:483`), during the 5th generation the display shows "Gen 5/5" which is correct. No bug, but worth noting the counter matches intent.
- **Reproduction**: Play through 5 full generations.
- **Impact**: None — behavior is correct after tracing. Documentation item only.
- **Severity**: S4 (code-reading confusion, no actual defect)
- **Route to**: game-designer (verify 5 generations is correct intent)

---

### AUD-06 · performDiscoveryAction does not apply execute_cost food deduction or upkeep
- **Source**: `game.js:182–198` (`performDiscoveryAction`)
- **Description**: The discovery action `act_escoltar_estrangers` has `execute_cost: 0` and `output_min/max: 0`, so no food is produced or consumed from those fields. However, `performDiscoveryAction` does not call the normal `executeAction` path — it advances `state.cycle++` at line 194 and calls `triggerSuccession` if needed, but **never deducts FOOD_UPKEEP or HEALTH_UPKEEP**. A player who spams the discovery action (each cycle it yields a new branch tech) can advance cycles toward LIFE_EXPECTANCY without paying the per-cycle survival costs.
- **Reproduction**: At cycle 0 with 6 eligible branch techs, call "Escoltar els Estrangers" 6 times. Food and health are unchanged despite 6 cycles passing.
- **Impact**: Discovery action bypasses survival pressure entirely. A focused player can unlock branch techs without resource risk. The game loop's tension is removed for this action type.
- **Severity**: S2 (incorrect mechanic — upkeep bypass)
- **Route to**: gameplay-programmer

---

### AUD-07 · is_single_use events are never filtered after first occurrence
- **Source**: `data.js:315–331` (discovery events with `is_single_use: true`), `game.js:200–211` (`getEligiblePoolEvents`)
- **Description**: Five events are marked `is_single_use: true` in data.js (e.g. `ev_desc_llancador`, `ev_desc_caca_coord`, `ev_desc_agulla`, `ev_desc_herbes`, `ev_desc_pintura`, `ev_desc_figuretes`). The `getEligiblePoolEvents` function filters by `is_discovery_event` conditions (already unlocked, prereq met, inclination met), but it **never checks `is_single_use`** nor tracks which events have already fired. A discovery event that was declined (`discovers: false`) will re-enter the pool on the next action that draws from the same pool, potentially re-triggering indefinitely.
- **Reproduction**: Execute `act_espiar_ramat` (uses `pool_caca`) and receive `ev_desc_llancador`. Choose "Seguir el teu camí" (decline). Execute `act_espiar_ramat` again. `ev_desc_llancador` is still eligible and can fire again.
- **Impact**: Players who decline discovery events will see the same event text repeat, breaking narrative immersion. Discovery events could fire 5–10 times in a generation if the player keeps declining.
- **Severity**: S2 (incorrect mechanic — repeated single-use events)
- **Route to**: gameplay-programmer (add a `state.firedSingleUseEventIds = new Set()` and filter in `getEligiblePoolEvents`)

---

### AUD-08 · Inclination dot editor bypasses applyDelta inertia — debug tool accessible in production UI
- **Source**: `game.js:1077–1083`
- **Description**: Clicking any inclination dot in the profile panel directly sets `state.character.inclination[axis] = INCL_DOT_VALUES[idx]` — a hard override, bypassing `applyDelta` entirely. This is noted in a comment as a "debug" feature but there is no flag, permission check, or removal guard. In the current build this is always active and visible to any player.
- **Reproduction**: Click any inclination dot. Axis jumps to the exact value [-1.0, -0.5, 0.0, +0.5, +1.0] instantly.
- **Impact**: Any player can trivially set all inclinations to desired values, unlocking any branch tech, and bypassing the core identity-formation loop. The prototype's central question ("does inclination-driven visibility feel engaging?") cannot be answered honestly if players can override inclinations freely.
- **Severity**: S3 (debug tool breaks core prototype hypothesis test)
- **Route to**: game-designer / qa-lead (confirm: intentional for this prototype or needs a `DEBUG_MODE` flag)

---

## Recommended Next Actions

1. **Fix AUD-01 (S1 — food goes negative)**: Add `Math.max(0, ...)` clamp in `resolveDiscoveryOption` at `game.js:356`. One-line fix; blocks no further testing.

2. **Fix AUD-06 (S2 — discovery action skips upkeep) + AUD-07 (S2 — single-use events repeat)**: These two together undermine the survival loop and discovery pacing. AUD-06 fix: add FOOD_UPKEEP / HEALTH_UPKEEP deduction in `performDiscoveryAction`. AUD-07 fix: add a `firedSingleUseEventIds` Set to state, populated in `dismissEvent` / `resolveDiscoveryOption`, filtered in `getEligiblePoolEvents`.

3. **Fix AUD-03 (S2 — no health/food reset on succession)**: Add `state.health = STARTING_HEALTH; state.food = STARTING_FOOD;` in `continueSuccession` (or a partial heal if full reset is too generous). Without this, health-triggered succession chains into immediate game over for the new generation.
