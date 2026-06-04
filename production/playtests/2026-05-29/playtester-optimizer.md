# Playtest Report — Optimizer / Min-Max Playtester
**Date**: 2026-05-29
**Game**: Life Tycoon 2 (prototype)
**Files audited**: `prototypes/bloodline/game.js`, `prototypes/bloodline/data.js`

---

## Exploit Report: OPT-01 — Impuls Over-Specialization Soft Lock

**Category**: Axis Dominance
**Reproducible**: Always
**Setup**: Gen 1, starting inclination 0.0.

**Steps**:
1. Unlock `act_caca_solitaria` (costs 3 Saber; requires impuls>=0.20).
2. Spam `act_caca_solitaria` for its +0.06 impuls delta (highest per-action delta on any axis).
3. After 7 executions impuls reaches +0.30; after 13 it reaches +0.50; after 24 it reaches +0.80.
4. Player is now Caçador-locked. `act_utensilis_os` (artisan, requires impuls<=0.25) goes HIDDEN.

**Exploit**: The return path from impuls=1.0 back below the Artesà/Recol·lector threshold (impuls<=0.20) requires ~162 executions of an impuls-reducing action. With 14 cycles per life, this is mathematically impossible in a single generation. A player who over-specializes impuls in generation 1 is permanently barred from the Artesà and Recol·lector branches for at least 2–3 generations.

**Impact**: Medium
**Suggested Fix Direction**: Add a "correction bonus" where negative deltas toward the center receive reduced inertia (i.e., inertia only resists movement away from center, not movement back toward it).

---

## Exploit Report: OPT-02 — Gran Ritual Infinite Health Loop

**Category**: Action Spam
**Reproducible**: Always (once upgrade is purchased)
**Setup**: Purchase `act_gran_ritual` (upgrade of `act_ritual_foc`, costs 4 Saber).

**Steps**:
1. Purchase `act_gran_ritual` (requires Saber; no inclination requirement).
2. Spam `act_gran_ritual` every cycle.
3. Each cycle: health_delta=+2 offsets HEALTH_UPKEEP=1 for a net **+1 health per cycle**.
4. At HEALTH_MAX=20 the upkeep drains to 19, then the next execution resets to 20.

**Exploit**: Health is permanently capped at 19–20 indefinitely. The aging/health pressure that drives succession urgency is entirely neutralized by a single zero-inclination-requirement upgrade. This action also produces 2–5 food and pushes espiritualitat/sociabilitat, making it a dominant action on every axis simultaneously.

**Impact**: High
**Suggested Fix Direction**: Cap health_delta healing to restore no more than what upkeep takes (i.e., net 0), or add a diminishing-returns mechanic where repeated ritual use yields less health.

---

## Exploit Report: OPT-03 — Curar Grup Health Overflow Spam

**Category**: Action Spam / Stat Stack
**Reproducible**: Always (once branch tech is unlocked)
**Setup**: Unlock `bt_curar_herbes`, purchase `act_curar_grup` (3 Saber).

**Steps**:
1. Unlock `act_curar_grup` (requires espiritualitat>=0.15 inclination).
2. Spam `act_curar_grup` each cycle.
3. Each execution outputs 3–6 health (capped at HEALTH_MAX=20), then -1 upkeep.
4. At max vincle stat (5.0) plus `d_guaridor` destresa (threshold=3 uses!): output = round((3+6)/2 * 1.60) + 1 = ~8.2 health/cycle vs. 1 upkeep.

**Exploit**: Health regeneration at max stat is 8x the upkeep rate. Combined with OPT-02, two separate action paths can each independently defeat health pressure. The cost of 2 food/execution is the only constraint, meaning it requires a food source to sustain — but any food-positive action (see OPT-07) covers this easily.

**Impact**: High
**Suggested Fix Direction**: Treat `output_resource: "health"` as not restoring above a threshold (e.g., 80% of HEALTH_MAX), or convert `act_curar_grup` to a group-benefit action with a cooldown condition.

---

## Exploit Report: OPT-04 — Destresa Threshold 3 Rush

**Category**: Destresa Rush
**Reproducible**: Always
**Setup**: Any branch with threshold-3 destresa actions purchased.

**Steps**:
1. Buy `act_cacera_gran` (4 Saber, requires `bt_cacera_coordinada`) OR `act_confeccio_roba` (4 Saber, requires `bt_agulla_os`).
2. Execute each exactly 3 times.
3. Both destreses (`d_cacador_expert` and `d_cosidor`) are earned by cycle 6 of 14.

**Exploit**: DESTRESA_MAX=2 slots are permanently filled by cycle 6 (43% of lifespan) using threshold-3 actions. All subsequent play has maximum destresa bonuses active. Late-game actions that would organically unlock and grant destresa — such as `d_narrador` and `d_comerciant` (also threshold 3) — are irrelevant because both slots are already taken. The DESTRESA_MAX cap creates a "first-come first-served" system where early branch access trivially claims the permanent bonuses.

**Impact**: Medium
**Suggested Fix Direction**: Raise minimum destresa threshold to 5 uniformly, or make DESTRESA_MAX slot assignment require specific branch alignment (e.g., a Caçador slot and a Místic slot as separate categories).

---

## Exploit Report: OPT-05 — Stat Inheritance Acceleration (Generational Power Creep)

**Category**: Stat Stack
**Reproducible**: Always
**Setup**: Focus a single stat to maximum across multiple generations.

**Steps**:
1. Gen 1: spam `act_cacera_gran` or `act_caca_solitaria` (stat_gain=0.20 forca). Max forca in 20 uses.
2. Gen 2 inherits: `forca = 5.0 * 0.65 + 1.0 * 0.35 = 3.60`. Only 7 more uses needed to re-max.
3. Gen 3: inherits 3.60 again (if gen 2 maxed). Only 7 uses to re-max.
4. At max forca=5.0 + `d_cacador_expert` destresa: `act_cacera_gran` yields round(12 * 1.60) + 1 = **20 food per execution** (max possible single roll), net +17 food after costs.

**Exploit**: From generation 2 onward, a player who focused a single stat in gen 1 only needs ~7 executions to reach max stat again. This means by cycle 7 of 14, survival is mathematically solved for the rest of the run: 17 net food/turn vs. 1 upkeep. No tension in any subsequent generation.

**Impact**: High
**Suggested Fix Direction**: Steepen the stat inheritance decay (e.g., reduce BRANCH_INHERITANCE_RATE for stats to 0.40), or introduce a stat ceiling that decreases each generation to prevent full stacking.

---

## Exploit Report: OPT-06 — Resources Do Not Reset on Succession

**Category**: Resource Ceiling
**Reproducible**: Always
**Setup**: Accumulate food or Saber in any generation before succession.

**Steps**:
1. Gen 1: spam `act_tallar_pedra` (free, 1–3 Saber/turn). Accumulate Saber.
2. Trigger succession (wait 14 cycles or die by health).
3. Gen 2 begins with all accumulated Saber AND food from Gen 1 intact.
4. Gen 2 can immediately buy every available branch action without earning a single Saber point.

**Exploit**: Total cost to buy all purchasable actions = 62 Saber. At average yield of 2 Saber/turn from `act_tallar_pedra`, this requires 31 cycles — impossible in 14. But across 3 generations of focused Saber farming, a player reaches 42–62 Saber and unlocks everything in generation 3's first few cycles. Food carried over removes the survival constraint entirely in early generations of a Saber-farming dynasty. This collapses the economic decision space.

**Impact**: High
**Suggested Fix Direction**: Reset `state.materials` to 0 on succession (knowledge doesn't physically pass to heirs), or cap the Saber carry-over at a modest inheritance amount (e.g., 5–10 Saber representing "tribal knowledge").

---

## Exploit Report: OPT-07 — Trampes Avançades Zero-Risk Food Loop

**Category**: Idle / Action Spam
**Reproducible**: Always
**Setup**: Push impuls to 0.10 and sociabilitat to 0.05.

**Steps**:
1. Execute `act_espiar_ramat` and `act_vigilar_campament` alternately for 6 cycles.
2. impuls reaches 0.10 and sociabilitat reaches 0.05 — `act_trampes_avancades` becomes visible.
3. Unlock `bt_cacera_coordinada` (requires `ut_llengua` at cycle 2), purchase `act_trampes_avancades` (3 Saber).
4. Spam `act_trampes_avancades` every cycle. No health_delta. Output 3–8 food, cost 1.

**Exploit**: Net average food per turn = 5.5 - 1 (cost) - 1 (upkeep) = **+3.5 food/turn**. At max enginy stat (5.0): (3+8)/2 * 1.60 - 2 = +6.8 net food/turn. No health risk. No inclination lock-in risk (action requires only min thresholds, not exclusive ranges). This single action trivializes survival for the entire game once accessible at cycle ~8–9. The player never needs to take a risky action again.

**Impact**: High
**Suggested Fix Direction**: Add a mild health_delta risk to `act_trampes_avancades` (e.g., -1 occasionally), or reduce output_max to 6 to narrow the expected value advantage.

---

## Exploit Report: OPT-08 — Gen 2/3 Start with Active Branch Unlocked

**Category**: Succession
**Reproducible**: Always (when any inclination axis reaches above threshold in parent)
**Setup**: Parent reaches impuls=1.0 (or above any branch threshold) before succession.

**Steps**:
1. Push parent to impuls=1.0, sociabilitat=0.0.
2. Trigger succession.
3. Gen 2 inherits: impuls = 1.0 * 0.65 = 0.650. Caçador requires impuls>=0.30.
4. Gen 2's `getActiveBranches()` fires on render immediately after `createCharacter()`.
5. Caçador branch is **active from cycle 0** of Gen 2, before any action is taken.
6. Gen 3 inherits impuls = 0.423 — still above 0.30 — Caçador active from cycle 0 again.

**Exploit**: The branch threshold for Caçador (0.30) is 54% below the inherited value (0.65). Generations 2 and 3 skip all early-game branch-building entirely. The "choose your path" narrative core of the game is bypassed for two of five generations. Mystic also auto-activates at gen 2 if both espiritualitat and sociabilitat were pushed to 1.0 (inherits 0.65 each, both above their thresholds of 0.30/0.25). All four branches auto-activate at gen 2 if all four axes were pushed in gen 1 (though this is geometrically difficult given axes work against each other).

**Impact**: Medium
**Suggested Fix Direction**: Raise branch activation thresholds, or apply a steeper inheritance decay specifically to the branch-condition axes (separate from stat inheritance rate).

---

## Exploit Report: OPT-09 — Recol·lector Is a Dead Branch (Design Concern)

**Category**: Axis Dominance (Design Concern)
**Reproducible**: Always
**Setup**: Starting game (inclination 0.0 on all axes).

**Steps**:
1. Start the game. Check active branches: Recol·lector is immediately active (impuls<=0.10 AND intel<=0.10 both satisfied at 0.0).
2. Do not push any axis. Recol·lector stays active all game.
3. Attempt to unlock any branch tech while staying Recol·lector.
4. All 6 branch techs require actively pushing an axis above a min threshold — none reward staying Recol·lector.

**Exploit**: Recol·lector activates by default at game start and is lost the moment any meaningful axis is pushed. No branch tech is reachable while maintaining Recol·lector identity (impuls<=0.10, intel<=0.10 simultaneously). The branch exists as a profile label with zero mechanical payoff — it cannot gate any content, unlock any tech, or provide any unique capability. A player who reads "Recol·lector" as their identity label has no way to play into it strategically.

**Impact**: Medium (Design Concern — route to: economy-designer)
**Suggested Fix Direction**: Create at least one branch tech that rewards low-impuls/low-intel play (e.g., `bt_knowledge_of_seasons` requiring impuls<=0.05 AND intel<=0.05), unlocking a dedicated Recol·lector action path.

---

## Exploit Report: OPT-10 — Discovery Event Repeats if Declined (Bug)

**Category**: Resource Ceiling (Bug)
**Reproducible**: Always
**Setup**: Any run where a discovery event is drawn and declined.

**Steps**:
1. Execute any action with event pool `pool_caca`, `pool_ritual`, or `pool_social`.
2. A discovery event fires (e.g., `ev_desc_llancador` offering `bt_punt_llanca`).
3. Choose the "decline" option (`food_delta: +2, discovers: false`).
4. `bt_punt_llanca` is NOT added to `unlockedBranchTechIds` (only happens on `discovers: true`).
5. `getEligiblePoolEvents()` checks `state.character.unlockedBranchTechIds.has(btId)` — still false.
6. On the next draw from `pool_caca`, the same discovery event is eligible again.

**Exploit**: The `is_single_use` flag is structurally misleading. It only prevents the event from firing once the tech is discovered — but if the player repeatedly declines, the event fires every time the pool is sampled. The "decline" option also gives +1 to +2 food bonus each time. A player can farm the decline path for small but free food bonuses on every hunt cycle. More critically, the event narrative breaks (the same "stranger with a spear" appears repeatedly).

**Impact**: Low (Bug — route to: gameplay-programmer)
**Suggested Fix Direction**: Track declined discovery events in a separate `declinedDiscoveryEventIds` set and filter them out of `getEligiblePoolEvents()`, preventing repeat offers.

---

## Exploit Report: OPT-11 — Free Discovery: ev_desc_herbes Has Zero Food Cost (Bug)

**Category**: Resource Ceiling (Bug)
**Reproducible**: Always
**Setup**: `pool_ritual` event fires and `ev_desc_herbes` is drawn.

**Steps**:
1. Execute `act_ritual_foc` or `act_gran_ritual` until `ev_desc_herbes` fires.
2. Choose option 0: "Demanar-li que t'ho expliqui" (food_delta: 0, discovers: true).
3. `resolveDiscoveryOption`: checks `if (opt.food_delta !== 0)` — false, no food is deducted.
4. `bt_curar_herbes` is unlocked. Player paid **zero food**.

**Exploit**: Every other discovery option with `discovers: true` has a negative food_delta (-1, -2, or -3). `ev_desc_herbes` is the only discovery that unlocks a branch tech at zero food cost. This is inconsistent with design intent (all other discoveries carry a food investment risk) and allows the Mystic healing branch to be unlocked for free during any ritual session.

**Impact**: Low (Bug — route to: gameplay-programmer)
**Suggested Fix Direction**: Set `food_delta: -2` on `ev_desc_herbes` option 0 to match the other discovery pricing conventions.

---

## Exploit Report: OPT-12 — Inclination Dot Editor Bypasses Inertia (Bug)

**Category**: Axis Dominance (Bug)
**Reproducible**: Always
**Setup**: Default UI (no special conditions required).

**Steps**:
1. In the profile panel, click any of the 5 inclination dots for any axis.
2. `game.js:1082` executes: `state.character.inclination[axis] = INCL_DOT_VALUES[idx]` directly.
3. Inclination jumps instantly to -1.0, -0.5, 0.0, +0.5, or +1.0 with no inertia applied.
4. Branch conditions are immediately re-evaluated on render — any branch becomes instantly accessible.

**Exploit**: This debug tool is visible and clickable in the shipped prototype UI with no guard or label. A player can use it to instantly set impuls to +1.0 (activating Caçador), then click `act_caca_solitaria` in the same cycle, circumventing the entire inclination-building progression that is the core loop of the game. All 7 exploit hunts above assume this editor is NOT used — with it, every exploit is trivially achievable in 0 cycles.

**Impact**: Critical (Bug — route to: gameplay-programmer)
**Suggested Fix Direction**: Gate the inclination dot editor behind a `DEBUG_MODE` flag that is false in the default build, or remove it from the rendered UI entirely until it has an explicit dev-panel toggle.

---

## Exploit Report: OPT-13 — All Upgrades Are Strictly Dominant Over Base Actions

**Category**: Resource Ceiling (Design Concern)
**Reproducible**: Always
**Setup**: Any run that reaches Saber to purchase an upgrade.

**Steps**:
1. Purchase any upgrade (4–5 Saber each).
2. Base action is replaced by upgrade.
3. Compare outputs: every upgrade has strictly higher output_min, output_max, and at least equal or better inclination deltas than the base it replaces.

**Exploit**: There is no upgrade that presents a meaningful tradeoff. `act_aguait_coordinat` is strictly better than `act_espiar_ramat` on every measurable dimension (food output, inclination deltas). Same for all five upgrade pairs. The economic decision is simply "do I have the Saber?" with no design tension about whether the upgrade is appropriate for the character's direction. This makes Saber generation a pure grind rather than a strategic resource.

**Impact**: Low (Design Concern — route to: economy-designer)
**Suggested Fix Direction**: Give each upgrade a meaningful tradeoff — for example, `act_aguait_coordinat` could require +1 food upkeep (group coordination cost) while delivering higher output, making it a deliberate investment rather than a free upgrade.

---

## Exploit Report: OPT-14 — Universal Tech Health Bonus Timing Exploit

**Category**: Resource Ceiling
**Reproducible**: Always
**Setup**: `ut_eines_pedra` becomes discoverable at cycle 5; `ut_foc` at cycle 8.

**Steps**:
1. Let health drop to 3 or lower through risky actions (e.g., `act_cacera_gran` spam).
2. Universal tech button is available (cycle has passed its threshold).
3. Click "Descobrir" on `ut_eines_pedra` (+2 health) at the exact moment health is critical.
4. Receive free health injection. Repeat with `ut_foc` (+3 health) at cycle 8.

**Exploit**: Universal tech discovery has no execute cost, no food cost, and no cycle cost. The +2 and +3 health bonuses are emergency medicine on demand — the player controls exactly when to consume them. A skilled player holds both discoveries as pocket heals, effectively giving themselves +5 health in reserve. Combined with the health loop from OPT-02, this makes death from health depletion nearly impossible for a prepared player.

**Impact**: Low
**Suggested Fix Direction**: Auto-apply universal tech health bonuses immediately when the cycle threshold is reached (on `executeAction` after cycle increment) rather than on player button click.

---

## Summary

- **Total exploits found**: 14 (Critical: 1 · High: 4 · Medium: 3 · Low: 6)
- **Most dangerous exploit**: OPT-12 — the inclination dot editor bypass is live in the player-facing UI and trivially circumvents every single progression system simultaneously.
- **Second most dangerous**: OPT-06 (resources persist across succession) combined with OPT-05 (stat acceleration) collapses all economic and survival pressure from generation 2 onward.
- **Balance verdict**: BROKEN

### Routing Summary

| ID | Type | Route to |
|----|------|----------|
| OPT-01 | Design Concern | economy-designer |
| OPT-02 | Design Concern | economy-designer |
| OPT-03 | Design Concern | economy-designer |
| OPT-04 | Design Concern | economy-designer |
| OPT-05 | Design Concern | economy-designer |
| OPT-06 | Bug (missing reset) | gameplay-programmer |
| OPT-07 | Design Concern | economy-designer |
| OPT-08 | Design Concern | economy-designer |
| OPT-09 | Design Concern | economy-designer |
| OPT-10 | Bug (repeat event) | gameplay-programmer |
| OPT-11 | Bug (free discovery) | gameplay-programmer |
| OPT-12 | Bug (debug UI exposed) | gameplay-programmer |
| OPT-13 | Design Concern | economy-designer |
| OPT-14 | Design Concern | economy-designer |
