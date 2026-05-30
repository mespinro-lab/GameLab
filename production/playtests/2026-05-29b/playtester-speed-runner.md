# Speed-Runner Pacing Report — Life Tycoon 2
**Date**: 2026-05-29
**Sweep**: #29b — Post-Content-Migration
**Prototype**: prototypes/life-tycoon-2/ (game.js + data.js)
**Session type**: Code trace — speed-run pacing, tech tree reachability, action economy, inclination gate analysis
**Story type**: Logic (formulas, state machines) + Integration (multi-system: tech unlocks × inclination × action economy × succession timing)
**Gate level**: BLOCKING (Logic) / ADVISORY (Integration prototype)

Previously reported and excluded: FOOD-01, SUCC-01, GATE-01, SABER-01, DISC-01, EVENT-01, FADE-01, RENDER-01, DEBUG-01, TRV-02, DYN-01 through DYN-07, NP-01 through NP-17.

---

## SR-01 — Universal Tech Schedule Changed From 3 to 5 Techs; Briefing and Any Prior Documentation Is Now Stale

**Severity**: S3 (documentation / pacing awareness)
**Frequency**: Always

**Description**:
The player briefing and prior sweep documentation describe the universal tech schedule as "cycles 2, 5, 8" (3 techs). The post-migration data.js now defines 5 universal techs at cycles 2, 4, 6, 9, and 12:

```js
// data.js lines 7-33
ut_talla_laminar:       cycle: 2
ut_vestimenta:          cycle: 4
ut_art_simbolic:        cycle: 6
ut_recollida_sistematica: cycle: 9
ut_conreu_incipient:    cycle: 12
```

No game.js code contains hardcoded cycle numbers — the `autoDiscoverUniversalTechs()` function at game.js line 163 iterates `UNIVERSAL_TECHS` dynamically using `state.cycle >= t.cycle`. The engine handles the new 5-tech schedule correctly.

The pacing implication is significant, however (see SR-02 and SR-03).

**Reproduction steps**:
1. Start a new game.
2. Execute any action to reach cycle 2 — `ut_talla_laminar` fires.
3. Execute actions to reach cycle 4 — `ut_vestimenta` fires automatically.
4. Continue to cycle 6, 9, 12 — each fires automatically.
5. Observe: 5 universal tech unlock events occur within a 14-cycle generation.

**Impact**:
All prior speed-run estimates, GDD references, and QA briefings that cite "cycles 2, 5, 8" are outdated. Update documentation and the GDD to reflect the 5-tech schedule at cycles 2, 4, 6, 9, 12. No code fix required — the engine is correct.

---

## SR-02 — Late Universal Techs (Cycles 9 and 12) Leave Insufficient Cycles to Use Their Branch Techs in Gen 1

**Severity**: S2 (pacing dead-end — full tech branches unreachable in generation 1)
**Frequency**: Always

**Description**:
With LIFE_EXPECTANCY=14, universal techs at cycles 9 and 12 unlock branch tech categories that a speed-runner cannot meaningfully exploit within the same generation:

**`ut_recollida_sistematica` (cycle 9) — 5 cycles remaining (cycles 9-13):**
- Unlocks: `bt_coneixement_plantes` and `bt_calendari_natural`
- Each branch tech must first be discovered via `performDiscoveryAction()` (1 cycle, game.js line 217), then its actions purchased (3🧠 each minimum), then executed.
- Best case from cycle 9: cycle 9 = discovery action, cycle 10-13 = execute new actions. That is 4 cycles of use at most, after which succession fires at cycle 14.
- Generating enough materials in cycles 1-9 to afford the purchase is feasible (see SR-06), but the window is tight.

**`ut_conreu_incipient` (cycle 12) — 2 cycles remaining (cycles 12-13):**
- Unlocks: `bt_llavor_selectiva` and `bt_domini_terra`
- `bt_llavor_selectiva` unlocks `act_seleccionar_llavors` (purchase cost: 4🧠). `bt_domini_terra` unlocks `act_control_territori` (purchase cost: 5🧠).
- Cycle 12: universal tech fires automatically.
- Cycle 12 still (same cycle): player must spend the discovery action as an additional cycle — pushes to cycle 13.
- Cycle 13: purchase and execute one new action. Succession fires at cycle 14.
- Result: a speed-runner gets at most 1 execution of any `ut_conreu_incipient` branch tech action in gen 1. The action `act_seleccionar_llavors` produces 3-8 food with 0 execute cost — one use provides minor benefit but does not justify the 1-cycle discovery overhead.

The branch techs requiring `ut_conreu_incipient` are effectively **gen 2+ content** by design or by oversight.

**Reproduction steps**:
1. Play gen 1 normally, reaching cycle 12 with health > 0.
2. At cycle 12, `ut_conreu_incipient` fires in the log.
3. Execute the discovery action at cycle 13 — bt_llavor_selectiva or bt_domini_terra unlocks.
4. Succession fires at cycle 14 before any action unlocked by these techs can be purchased or executed (unless materials were pre-stockpiled and purchase is instant, i.e., 0 cycles).

Note: purchasing an action (game.js `purchaseAction()`) does NOT advance the cycle — it is not a cycle action. Only `executeAction()` and `performDiscoveryAction()` advance the cycle (lines 217 and 331). So a speed-runner CAN: cycle 12 (discovery action) → purchase act_seleccionar_llavors immediately (0 cycles) → cycle 13 execute it → succession at 14. This yields exactly 1 use.

**Impact**:
The `bt_llavor_selectiva` and `bt_domini_terra` branch techs provide no multi-cycle payoff in gen 1. Their inherited status (carried forward to gen 2 at 100% via `inheritedBranchTechs`) means their value is entirely in generational carry-over, not gen 1 utility. This may be intentional design (late-game techs seed gen 2 capability) but it should be explicit. The speed-runner experience of "tech I unlocked this generation was useless" creates negative feedback.

---

## SR-03 — bt_coneixement_plantes, bt_llavor_selectiva, and bt_calendari_natural Require intel·lecte MAX 0.05 — This Threshold Is Broken By Normal Play After 3 Crafting Uses

**Severity**: S1 (gate permanently closed by normal play patterns)
**Frequency**: Always when player executes act_tallar_pedra 3+ times before cycle 9

**Description**:
Three branch techs require `intel·lecte` to stay at or below 0.05:

```js
// data.js line 111
bt_coneixement_plantes: { axis: "intel·lecte", max: 0.05 }
// data.js line 127
bt_llavor_selectiva:    { axis: "intel·lecte", max: 0.05 }
// data.js line 119
bt_calendari_natural:   { axis: "intel·lecte", max: 0.05 }
```

`act_tallar_pedra` (data.js line 174) applies `intel·lecte: +0.02` per execution. The `applyDelta` formula (game.js line 78) is:

```js
deltaEfectiu = delta / (1 + Math.abs(current) * INERTIA_FACTOR)
```

With INERTIA_FACTOR=2.0, starting from intel·lecte=0.0:

| Use | deltaEfectiu | intel·lecte after |
|-----|-------------|-------------------|
| 1 | 0.02 / (1 + 0*2) = 0.0200 | 0.0200 |
| 2 | 0.02 / (1 + 0.020*2) = 0.0192 | 0.0392 |
| 3 | 0.02 / (1 + 0.039*2) = 0.0186 | 0.0578 |

After just 3 executions of `act_tallar_pedra`, intel·lecte = 0.058, exceeding the 0.05 maximum. The player is permanently ineligible for all three branch techs. This threshold is also exceeded by:
- `act_recollectar_arrels`: +0.01 intel·lecte — after 5 executions: ~0.049, after 6: ~0.059. Exceeds max after 6 uses.
- `act_explorar_voltants`: -0.01 intel·lecte — actually HELPS stay below 0.05.
- `act_faonar_eines` (bt_rasclador_fi): +0.03 intel·lecte — exceeds 0.05 after just 2 uses of this branch tech action.

`act_tallar_pedra` is a BASE action available from game start and is the PRIMARY source of materials (🧠) in early game. Any player who spends more than 2 cycles crafting before cycle 9 has permanently closed the Gatherer-Naturalist sub-path.

The intel·lecte max 0.05 threshold is effectively a "never touched crafting or gathering knowledge" constraint that is incompatible with the game's other resource incentives.

**Reproduction steps**:
1. Start a new game.
2. Execute `act_tallar_pedra` 3 times (cycles 1, 2, 3).
3. Proceed to cycle 9 when `ut_recollida_sistematica` fires.
4. Open browser console: `state.character.inclination["intel·lecte"]` — value ≈ 0.058.
5. Call `getEligibleBranchTechs()` — `bt_coneixement_plantes`, `bt_llavor_selectiva`, and `bt_calendari_natural` are all absent.
6. The player receives no feedback explaining why these techs are unavailable.

**Impact**:
S1. The Naturalist sub-branch (3 of 13 branch techs, covering 5 actions: `act_recollida_bolets`, `act_assecament_plantes`, `act_seleccionar_llavors`, `act_observar_cel`, `act_transit_nocturn`) is inaccessible to any player who follows the natural resource incentive to craft tools. Additionally, `bt_calendari_natural` is `is_hidden: true` (data.js line 123) but the only meaningful strategy to reach it (avoid ALL intel·lecte-positive actions for 9+ cycles while building espiritualitat ≥ 0.20) conflicts with every other early-game objective. Recommend raising the threshold to 0.15-0.20 or replacing the `max` condition with a different differentiator.

---

## SR-04 — bt_punta_llanca Requires impuls ≥ 0.25 But Maximum Reachable impuls From Available Pre-Unlock Actions Is ~0.23 in 14 Cycles

**Severity**: S2 (inclination gate unreachable in optimal solo-building play)
**Frequency**: Always — single-axis impuls build cannot reach 0.25 within LIFE_EXPECTANCY=14

**Description**:
`bt_punta_llanca` (data.js line 39) requires `impuls ≥ 0.25 AND sociabilitat ≤ 0.30`. Its universal prereq is `ut_talla_laminar` (cycle 2), so the inclination gate is the binding constraint.

The highest impuls-positive delta available before any impuls branch tech is unlocked is `act_espiar_ramat` at +0.02/cycle (data.js line 156). No other base action provides more than +0.01 impuls (`act_explorar_voltants`, `act_vigilar_campament`). Simulating exclusive use of `act_espiar_ramat` (the best single source) with INERTIA_FACTOR=2.0:

| Cycle | intel·lecte(impuls after) |
|-------|---------------------------|
| 1  | 0.0200 |
| 2  | 0.0392 |
| 3  | 0.0578 |
| 4  | 0.0757 |
| 5  | 0.0931 |
| 6  | 0.1098 |
| 7  | 0.1258 |
| 8  | 0.1411 |
| 9  | 0.1558 |
| 10 | 0.1699 |
| 11 | 0.1833 |
| 12 | 0.1961 |
| 13 | 0.2083 |
| 14 | 0.2200 (succession fires) |

Maximum impuls reachable in 14 cycles using only `act_espiar_ramat`: approximately **0.220**, which is below the 0.25 threshold. Even mixing `act_espiar_ramat` (+0.02) and `act_explorar_voltants` (+0.01) at 14 cycles with full split does not reach 0.25 (average delta ≈ 0.015/cycle, even worse due to inertia compounding).

The only path to bt_punta_llanca in gen 1 requires the `ev_desc_llancador` discovery event (pool_caca), which bypasses the inclination check entirely — but this event route has a `food_delta: -2` cost and is `is_single_use`. Event-driven discovery is RNG-dependent and therefore unavailable as a reliable speed-run strategy.

Actually, re-checking: `ev_desc_llancador` calls `resolveDiscoveryOption()` which calls `unlockBranchTech(bt)` directly (game.js line 409) without checking inclination conditions. So the event CAN unlock bt_punta_llanca regardless of impuls value. This means bt_punta_llanca has two unlock paths: (a) discovery action (inclination-gated, unreachable in gen 1), and (b) random event in pool_caca (RNG, no inclination gate). Path (b) is the only reliable gen-1 route.

**Reproduction steps**:
1. Start a new game. Spend all 14 cycles on `act_espiar_ramat`.
2. At cycle 14, succession fires. Open browser console: `state.character.inclination.impuls` ≈ 0.220.
3. `getEligibleBranchTechs()` returns no result for bt_punta_llanca (impuls < 0.25 required).
4. Verify that bt_punta_llanca never appeared as eligible via the discovery action.

**Impact**:
S2. A Hunter-path player who attempts to unlock `bt_punta_llanca` via the discovery action in gen 1 cannot succeed through deliberate action optimization. Only RNG event draw (ev_desc_llancador) provides a gen-1 unlock. This makes the Hunter branch effectively a gen 2+ deliberate path. The inherited impuls at gen 2 start (gen 1 impuls 0.22 × 0.65 = 0.143) still requires 6+ more cycles to reach 0.25 — manageable but expensive. Speed-runners targeting the full Hunter branch in gen 2 should be aware of this compound delay.

---

## SR-05 — bt_buri Requires intel·lecte ≥ 0.25 AND impuls ≤ 0.20 — Requires ~14 Cycles of Pure Crafting, Leaving No Cycles for Other Activities

**Severity**: S2 (single-branch monopoly — cannot unlock bt_buri AND maintain survival + succession prep in one generation)
**Frequency**: Always — bt_buri requires full lifecycle dedication

**Description**:
`bt_buri` (data.js line 53) requires `intel·lecte ≥ 0.25 AND impuls ≤ 0.20`. Its universal prereq is `ut_talla_laminar` (cycle 2).

`act_tallar_pedra` provides +0.02 intel·lecte per cycle with -0.01 impuls (keeps impuls low). Simulating 14 cycles of exclusive `act_tallar_pedra`:

After 3 uses intel·lecte ≈ 0.058 (see SR-03 table). After ~14 uses:

| Cycle | intel·lecte approx |
|-------|---------------------|
| 6  | 0.110 |
| 9  | 0.158 |
| 12 | 0.202 |
| 14 | ~0.230 |

Intel·lecte 0.25 requires approximately **15-16 cycles** of exclusive crafting — exceeding the 14-cycle lifecycle. A speed-runner cannot reach intel·lecte ≥ 0.25 using only `act_tallar_pedra` within a single generation.

If the player supplements with `act_faonar_eines` (bt_rasclador_fi, +0.03 intel·lecte) — but this requires bt_rasclador_fi to already be unlocked, which requires inclination conditions of its own. Even if unlocked: using `act_faonar_eines` (+0.03 intel·lecte) the ceiling is reachable in ~10 cycles but bt_rasclador_fi discovery costs 1 cycle, and the OR condition for bt_rasclador_fi is trivially met at start (see SR-07), so this combined path is viable.

The pure bt_buri path without bt_rasclador_fi as a stepping stone is effectively a 2-generation investment.

**Reproduction steps**:
1. Execute only `act_tallar_pedra` from cycle 0 to cycle 13 (14 cycles total).
2. At succession (cycle 14), open console: `state.character.inclination["intel·lecte"]` ≈ 0.230.
3. `getEligibleBranchTechs()` — bt_buri not eligible (0.230 < 0.25 required).

**Impact**:
S2. bt_buri is a gen 2+ unlock unless the player first takes bt_rasclador_fi (which boosts intel·lecte gain). The cascade dependency (bt_rasclador_fi → faster intel·lecte growth → bt_buri) is not documented in-game. The Craftsman branch requires 2 generations to fully develop, which is intended in a 5-generation game but creates a specific expectation mismatch for players who try to specialize quickly.

---

## SR-06 — Action Economy: Materials Budget Is Sufficient for 1-2 Branch Tech Purchases Per Generation But Requires Trading Off Food Safety

**Severity**: S3 (balance observation — advisory)
**Frequency**: Always

**Description**:
Materials (🧠, output_resource: "eines") are generated exclusively by crafting actions. Food (🌾) is the survival resource with FOOD_UPKEEP=1/cycle. Starting food: 15. A generation lasts 14 cycles. At minimum, the player must not let food reach 0 (game.js line 375 does NOT trigger succession on food=0 — food=0 only logs "⚠ Provisions crítiques." at line 363. Health at 0 DOES trigger succession at line 375). So food reaching 0 is survivable if health remains above 0.

Materials budget analysis for a Craftsman speed-runner:

- `act_tallar_pedra`: execute_cost=0, output 1-3 eines (avg 2). 14 cycles exclusive use = ~28 eines.
- With 28 materials: can purchase `act_faonar_eines` (3🧠) + `act_gravar_os` (4🧠) + `act_intercanviar_eines` (3🧠) + `act_cosir_pells` (3🧠) = 13🧠, leaving 15🧠.
- Upgrades cost 4-5🧠 each. Can afford 3 upgrades from remaining budget.
- However: crafting exclusively means 0 food income. Starting food 15 − 14 upkeep = 1 food at end of lifecycle. Exactly survivable, but ANY food-cost action (e.g., act_cercar_parella costs 1🌾, act_caca_llanca costs 2🌾) depletes the buffer.

For succession (finding partner and having children):
- `act_cercar_parella`: execute_cost=1 food. Requires 1 cycle.
- `act_tenir_fills`: execute_cost=0. Requires 1 cycle per child (after hasPartner=true).
- Minimum succession setup: 2 cycles (1 for partner, 1 for child). Food cost: 1 food (cercar_parella) + 2 FOOD_UPKEEP = 3 food total for these 2 cycles.

A pure craftsman who switches 2 cycles to family setup: 12 crafting cycles = ~24 materials, 3 food consumed for family setup, end food = 15 − 14 − 1 = 0. Exactly survivable. Materials = 24🧠, sufficient for ~2-3 branch tech action purchases.

**Key finding**: The food economy forces a trade-off between materials accumulation and survival actions, but the trade-off is solvable. The speed-runner path is: craft exclusively until cycle 10, purchase branch tech actions (0 cycles), spend cycles 11-12 on family setup, use remaining cycles 13-14 on the new branch actions. This is tight but feasible.

**Reproduction steps**:
1. Execute `act_tallar_pedra` for cycles 1-12 (12 cycles). Materials ≈ 24. Food = 15-12-0 = 3.
2. Execute `act_cercar_parella` (cycle 13). Food = 3-1-1 = 1. hasPartner = true.
3. Execute `act_tenir_fills` (cycle 14 = LIFE_EXPECTANCY). Succession fires.
4. Character has 1 child (succession guaranteed) and 24 materials (but materials reset at succession, game.js line 489).

**Impact**:
S3 advisory. Materials reset to 0 at succession (game.js line 489) — ALL unspent materials are lost. A speed-runner who accumulates 24 materials but forgets to purchase actions before succession loses all of it. There is no warning that materials do not carry over. This is a hidden pacing trap: the correct strategy is to purchase actions IMMEDIATELY when eligible (purchase is instantaneous — 0 cycles), not to save up.

---

## SR-07 — bt_rasclador_fi OR Condition Is Trivially Met at Game Start (impuls ≤ 0.10 at cycle 0)

**Severity**: S3 (balance observation — unintended easy path)
**Frequency**: Always

**Description**:
`bt_rasclador_fi` (data.js line 46) uses an OR condition:

```js
{ operator: "OR", conditions: [{ axis: "impuls", max: 0.10 }, { axis: "intel·lecte", min: 0.20 }] }
```

At game start, all inclination axes are 0.0 (game.js line 49: `freshInclination()`). The condition `impuls ≤ 0.10` is immediately satisfied (0.0 ≤ 0.10 = true). Combined with the universal prereq `ut_talla_laminar` unlocking automatically at cycle 2, bt_rasclador_fi becomes eligible from cycle 2 with ZERO deliberate inclination investment.

A speed-runner can: execute any action for cycles 1-2 → cycle 2 universal tech fires → discovery action immediately eligible (since impuls=0 ≤ 0.10) → bt_rasclador_fi unlocked at cycle 2 or 3.

This means bt_rasclador_fi is not an inclination-gated tech in practice — it is a universal tech gated only by cycle 2. The intended design (OR: either low impuls OR high intellect) collapses into a trivially met first condition for any player who has not deliberately pushed impuls above 0.10.

Any player who executes `act_espiar_ramat` more than 5 times in their first 5 cycles will have impuls > 0.10 (see SR-04 table: after 5 uses impuls ≈ 0.093, after 6 ≈ 0.110) — at which point they would need the intel·lecte ≥ 0.20 branch instead, requiring more investment. But even an aggressive hunter build takes 6 cycles to close off the easy path.

**Reproduction steps**:
1. Start a new game.
2. Execute `act_recollectar_arrels` once (cycle 1). Check inclination: impuls = 0.0 (this action gives -0.01 impuls → impuls = -0.01, which is ≤ 0.10, condition still met).
3. Cycle 2: `ut_talla_laminar` auto-discovers. Discovery action button appears.
4. Execute discovery action. bt_rasclador_fi unlocks. No inclination gating occurred.

**Impact**:
S3. bt_rasclador_fi is effectively the "free" first branch tech for any non-Hunter build. This may be intentional as an accessible entry point, but the OR condition's first branch makes the second branch (`intel·lecte ≥ 0.20`) unreachable as a meaningful differentiation path — if you have high intellect by cycle 2, you ALSO have low impuls (you avoided impuls actions to build intellect), so the OR is redundant. The condition collapses to "practically always true unless you have been aggressively building impuls." Recommend reviewing whether the OR first branch threshold should be lower (e.g., max: -0.05 or max: 0.0) to create meaningful differentiation.

---

## SR-08 — performDiscoveryAction() Uses getBranchTechMaturity() Scoring That Systematically Favors max-Condition Techs Over min-Condition Techs

**Severity**: S2 (algorithm error — wrong tech selected for speed-runner's intended build)
**Frequency**: Always when multiple branch techs are eligible simultaneously

**Description**:
When multiple branch techs are eligible, `performDiscoveryAction()` selects the "best" tech using `getBranchTechMaturity()` (game.js lines 184-191):

```js
function getBranchTechMaturity(bt) {
  let score = 0;
  for (const cond of bt.inclination_conditions.conditions) {
    const val = state.character.inclination[cond.axis];
    if (cond.min !== undefined) score += Math.max(0, val - cond.min);
    if (cond.max !== undefined) score += Math.max(0, cond.max - val);
  }
  return score;
}
```

For a `min` condition: score = `val - min`. Higher is better (further above the threshold).
For a `max` condition: score = `max - val`. Higher is better (further below the threshold).

This scoring creates a systematic bias: a tech with a `max: 0.05` condition where current inclination is 0.0 scores `0.05 - 0.0 = 0.05`. A tech with a `min: 0.25` condition where current inclination is 0.26 scores `0.26 - 0.25 = 0.01`. The "max" condition tech scores higher despite the player having invested significantly more effort into the "min" condition tech.

Practical example: at cycle 2 with inclination all at 0.0, if both bt_rasclador_fi (OR: `impuls max 0.10`) and bt_coneixement_plantes (AND: `intel·lecte max 0.05, impuls max 0.10`) are eligible:
- bt_rasclador_fi: conditions = [impuls max 0.10] → score = max(0, 0.10 - 0.0) = 0.10
- bt_coneixement_plantes: conditions = [intel·lecte max 0.05, impuls max 0.10] → score = max(0, 0.05-0.0) + max(0, 0.10-0.0) = 0.05 + 0.10 = 0.15

bt_coneixement_plantes wins by having MORE max conditions — even though the player may be aiming for bt_rasclador_fi. The player has no control over which tech is selected; `performDiscoveryAction()` makes the choice autonomously.

Furthermore, the discovery action gives the player no preview of which tech will be unlocked — they must check the Glossary to infer eligible techs and guess which the algorithm will select.

**Reproduction steps**:
1. Start a new game. Execute any non-impuls action for 2 cycles (e.g., act_recollectar_arrels).
2. At cycle 2, ut_talla_laminar fires. Discovery action appears.
3. If both bt_rasclador_fi and bt_coneixement_plantes are eligible (both have impuls ≤ 0.10), call `getBranchTechMaturity()` for each via browser console.
4. bt_coneixement_plantes scores higher due to having 2 max conditions. It gets selected despite the player potentially wanting bt_rasclador_fi.
5. Player has no UI indication that the tech selection was made by algorithm, not by them.

**Impact**:
S2. Speed-runners cannot reliably target a specific branch tech via the discovery action when multiple techs are eligible. For a 5-generation run where each generation's tech unlock is critical, losing 1 cycle to an unintended tech unlock wastes a full generation slot. The algorithm penalizes players who have built toward a min-condition tech by scoring max-condition techs higher. Recommend either (a) showing the player which tech will be unlocked before they confirm, or (b) letting the player choose from all eligible techs.

---

## SR-09 — Bosc Zone Prerequisite (act_explorar_voltants) Competes With All Other Cycle Actions — Bosc Branch Tech Actions Have No Guaranteed Unlock Path

**Severity**: S2 (zone access dependency not surfaced to player)
**Frequency**: Always when player does not execute act_explorar_voltants in gen 1

**Description**:
Three branch tech actions require the Bosc zone to be accessible:
- `act_rastreig_rutes` (bt_marques_territori, data.js line 261): `zona: "Bosc"`
- `act_recollida_bolets` (bt_coneixement_plantes, data.js line 291): `zona: "Bosc"`

Bosc zone is unlocked by executing `act_explorar_voltants` (data.js line 199: `unlocks_zone: "Bosc"`). This action produces only 1-3 food with execute_cost=1 — a poor food return ratio versus `act_espiar_ramat` (2-5 food, same cost) or `act_recollectar_arrels` (2-4 food, same cost).

A speed-runner optimizing for food security will naturally skip `act_explorar_voltants`. The Bosc zone then remains locked, and `act_rastreig_rutes` and `act_recollida_bolets` appear in the "Bloq." (other) tab forever — but the blocked row display shows the zone lock as a branch tech lock chain (game.js lines 998-1017), not as a zone availability issue. The player sees "Via: Marques de Territori → Requereix: Art i Símbol (Cicle 6)" — correct for the universal prereq, but does not mention that the Bosc zone itself also needs to be unlocked.

Note: `state.discoveredZoneIds` does not reset at succession (confirmed: DYN-02). If gen 1 discovers Bosc, all subsequent generations inherit it. If gen 1 does not, all subsequent generations also do not have Bosc — until any character in any generation eventually executes `act_explorar_voltants`. But there is no in-game prompt telling the player that Bosc must be manually unlocked per playthrough (not per character).

**Reproduction steps**:
1. Play a full gen 1 without executing `act_explorar_voltants`.
2. Unlock `bt_marques_territori` (requires ut_art_simbolic at cycle 6, impuls ≥ 0.20, intel·lecte ≥ 0.05).
3. Observe the zone grid: no Bosc card appears. `act_rastreig_rutes` does not appear in any zone's "Aprendre" tab.
4. Open console: `state.discoveredZoneIds` — "Bosc" absent.
5. Proceed to gen 2. Bosc still absent. The player is silently locked out for the entire run unless they explicitly execute act_explorar_voltants.

**Impact**:
S2. The Bosc zone dependency is a silent prerequisite for 2 specific branch tech actions. Speed-runners who skip exploration are not informed that these actions are locked behind a zone they must discover, not just a branch tech they must unlock. The blocked row UI misleads by showing only the universal tech prereq chain, not the zone prerequisite.

---

## SR-10 — Materials Reset to 0 at Succession With No Warning — Speed-Runner Loses All Unspent Materials

**Severity**: S2 (silent resource loss on succession)
**Frequency**: Always when materials > 0 at succession time

**Description**:
`continueSuccession()` at game.js line 489 unconditionally sets `state.materials = 0`:

```js
state.materials = 0;
```

By contrast, `inheritedPurchasedActionIds` and `inheritedBranchTechIds` carry over in full (100% inheritance). Actions already PURCHASED with materials carry over, but unspent materials do not.

A player who accumulated 15🧠 to buy an action (e.g., act_emboscada_nocturna costs 5🧠 — but realistically a player stockpiling for multiple purchases) and dies with 14🧠 unspent loses all of it. The succession modal (game.js lines 1087-1115, index.html succession-modal) shows cycle count and dominant axis but does NOT show the materials balance about to be lost.

There is no "spend materials before succession" prompt or warning. The succession warning UI (game.js lines 708-715) warns about succession and children but not about materials.

Purchasing actions is 0-cycle (does not advance the clock). A speed-runner in the final cycle who still has materials can purchase all eligible actions immediately before succession, but only if they know to do so. Nothing in the UI communicates this urgency.

**Reproduction steps**:
1. Play gen 1. Execute `act_tallar_pedra` repeatedly. Accumulate 20🧠.
2. At cycle 13, succession warning fires ("Queden 1 cicle..."). Materials = 20.
3. Execute one final action to reach cycle 14. Succession fires.
4. Succession modal appears. Accept succession.
5. Gen 2 starts with materials = 0. The 20🧠 is gone.
6. Any branch tech action that was purchasable (bt_rasclador_fi unlocked → act_molda_grans available for 3🧠) was never purchased.

**Impact**:
S2. Speed-runners who "save up" for expensive actions lose unspent materials at succession. The correct strategy (purchase immediately when eligible) is not communicated. This creates a knowledge gap that punishes first-time speed-runners silently. Recommend adding a materials balance line to the succession modal ("🧠 15 Provisions sense gastar — compra accions ara!") or adding the current materials balance to the succession warning text when materials > 0 in the final cycles.

---

## SR-11 — firedSingleUseEventIds Resets at Succession — Discovery Events Can Repeat Each Generation, Making Branch Tech Unlock Deterministic Over Multiple Generations

**Severity**: S3 (design observation — confirms speed-run strategy; flag for GDD alignment)
**Frequency**: Always

**Description**:
`createCharacter()` at game.js lines 34-46 initializes `firedSingleUseEventIds: new Set()` — always a fresh empty set. `firedSingleUseEventIds` is stored on the character, not on the state root. Since `state.character` is fully replaced at succession (game.js line 492), all single-use event history is lost each generation.

This means: if gen 1 saw and declined `ev_desc_llancador` (the bt_punta_llanca discovery event in pool_caca), gen 2 can see and accept it again. Over 5 generations, each discovery event for each branch tech resets and can fire again for each generation.

For a speed-runner this is a significant finding: if a branch tech could not be unlocked via the discovery ACTION (inclination gate not met — see SR-04 for bt_punta_llanca), the player can wait for the event to fire again in the next generation, costing no deliberate cycles. The event-based unlock routes are effectively unlimited retries across generations.

The `is_single_use` flag appears designed to ensure each event fires only once per character. This intent is correctly preserved: within a single generation, the event won't repeat. But the per-character scope means it resets at succession by design of the data structure.

**Reproduction steps**:
1. Gen 1, pool_caca event `ev_desc_llancador` fires. Choose "Seguir el teu camí" (decline).
2. Event is marked in `state.character.firedSingleUseEventIds` as fired.
3. Gen 2 starts. `createCharacter()` called with fresh `firedSingleUseEventIds: new Set()`.
4. Pool_caca events pool is searched again — `ev_desc_llancador` is NOT in the new character's fired set.
5. `ev_desc_llancador` can fire again in gen 2.

**Impact**:
S3. If intentional, this is a valid design where each generation gets fresh chances at discovery. If unintentional, it trivializes the "single use" intent across the dynasty run. Speed-runners exploiting this will ensure bt_punta_llanca (unreachable via discovery action in gen 1 per SR-04) can be unlocked via event in gen 2 without any inclination pre-build. Flag for GDD alignment. No code emergency — document the intended scope explicitly.

---

## Speed-Run Pacing Summary

### Tech Tree Reachability — Gen 1 Analysis

| Branch Tech | Universal Prereq (cycle) | Inclination Gate | Gen 1 Reachable? | Notes |
|---|---|---|---|---|
| bt_rasclador_fi | ut_talla_laminar (2) | OR: impuls ≤ 0.10 (trivially met) | YES — cycle 2 | See SR-07: gate is trivially met at start |
| bt_trampes | ut_vestimenta (4) | AND: impuls ≥ 0.10 | YES — cycle 4+ | Low threshold; ≥5 espiar uses |
| bt_agulla_os | ut_vestimenta (4) | AND: intel·lecte ≥ 0.20, impuls ≤ 0.20 | MARGINAL — cycle 8-10 | Requires crafting focus; achievable |
| bt_guariment_plantes | ut_vestimenta (4) | AND: espiritualitat ≥ 0.25, sociabilitat ≥ 0.20 | MARGINAL — cycle 10-12 | Hidden tech; high dual thresholds |
| bt_pintura_rupestre | ut_art_simbolic (6) | AND: espiritualitat ≥ 0.30, sociabilitat ≥ 0.20 | MARGINAL — cycle 12-13 | Ritual zone moot (DYN-01 bug) |
| bt_marques_territori | ut_art_simbolic (6) | AND: impuls ≥ 0.20, intel·lecte ≥ 0.05 | YES — cycle 8-10 | Bosc zone dependency hidden (SR-09) |
| bt_ornaments | ut_art_simbolic (6) | OR: espiritualitat ≥ 0.20 OR sociabilitat ≥ 0.25 | YES — cycle 8-10 | Accessible OR gate |
| bt_buri | ut_talla_laminar (2) | AND: intel·lecte ≥ 0.25, impuls ≤ 0.20 | NO — cycle 14+ | Requires 15+ crafting cycles (SR-05) |
| bt_punta_llanca | ut_talla_laminar (2) | AND: impuls ≥ 0.25, sociabilitat ≤ 0.30 | NO via action — RNG event only | Max reachable impuls = 0.22 (SR-04) |
| bt_coneixement_plantes | ut_recollida_sistematica (9) | AND: intel·lecte ≤ 0.05, impuls ≤ 0.10 | NO — 3 crafting uses close gate (SR-03) | Extremely fragile; broken by normal play |
| bt_calendari_natural | ut_recollida_sistematica (9) | AND: espiritualitat ≥ 0.20, intel·lecte ≤ 0.05 | NO — same issue as above (SR-03) | Hidden tech; same fragile constraint |
| bt_llavor_selectiva | ut_conreu_incipient (12) | AND: intel·lecte ≤ 0.05, impuls ≤ 0.10 | NO — cycle 12 prereq + SR-03 gate | Only 2 cycles left; gate already broken |
| bt_domini_terra | ut_conreu_incipient (12) | OR: impuls ≥ 0.10 OR intel·lecte ≤ 0.05 | MARGINAL — 1 use max | 2 cycles left at prereq unlock |

### Critical Pacing Issues by Priority

| ID | Severity | Title |
|---|---|---|
| SR-03 | S1 | bt_coneixement_plantes / bt_llavor_selectiva / bt_calendari_natural intel·lecte max 0.05 broken by normal play after 3 uses |
| SR-01 | S3 | Universal tech schedule changed from 3 to 5 techs; documentation stale |
| SR-02 | S2 | Late universal techs (cycles 9, 12) give insufficient time for meaningful use in gen 1 |
| SR-04 | S2 | bt_punta_llanca impuls 0.25 gate unreachable via discovery action in 14 cycles |
| SR-05 | S2 | bt_buri intel·lecte 0.25 gate requires 15+ cycles; unreachable in single generation |
| SR-08 | S2 | getBranchTechMaturity() systematically selects wrong tech when multiple are eligible |
| SR-09 | S2 | Bosc zone prerequisite not surfaced in blocked-action UI; hidden dependency |
| SR-10 | S2 | Materials reset to 0 at succession with no warning; unspent budget silently lost |
| SR-06 | S3 | Action economy tight but feasible; materials must be spent before succession fires |
| SR-07 | S3 | bt_rasclador_fi OR gate trivially met at start; effectively no inclination gate in practice |
| SR-11 | S3 | firedSingleUseEventIds resets per character — discovery events repeat each generation |

### Speed-Runner Optimal Gen 1 Route (Findings-Informed)

1. Cycle 1: `act_recollectar_arrels` (food income, avoids impuls, keeps intel·lecte below 0.05 critical threshold)
2. Cycle 2: `ut_talla_laminar` auto-fires. Execute discovery action immediately — bt_rasclador_fi unlocks (OR gate trivially met, SR-07). Purchase `act_molda_grans` (3🧠) and `act_faonar_eines` (3🧠) immediately — 0 cycles.
3. Cycles 3-9: alternate food actions with crafting for materials. Monitor intel·lecte stays below 0.05 if Naturalist branch is desired.
4. Cycle 4: `ut_vestimenta` auto-fires. bt_trampes or bt_agulla_os may become eligible.
5. Cycle 6: `ut_art_simbolic` auto-fires. bt_ornaments (OR gate, easy) likely becomes eligible.
6. Cycles 10-11: family setup (cercar_parella + tenir_fills). Spend any remaining materials NOW before succession.
7. Cycle 12: `ut_conreu_incipient` fires — ignore for gen 1 (no time for meaningful use).
8. Cycles 12-13: execute highest-output purchased actions.
9. Cycle 14: succession fires. 1 child guaranteed; materials = 0 (reset).

**Critical pitfall**: Any player who executes `act_tallar_pedra` 3+ times in cycles 1-9 has permanently closed the Naturalist sub-branch (SR-03). This conflict between the Craftsman path and the Naturalist path is the most severe pacing issue in the current build.
