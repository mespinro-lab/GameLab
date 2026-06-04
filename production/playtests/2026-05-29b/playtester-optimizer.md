# Playtest Report — Economy Optimizer (Sweep #29b)
**Date**: 2026-05-29
**Sweep**: #29b — Post-Content-Migration
**Game**: Life Tycoon 2 (prototype)
**Files audited**: `prototypes/bloodline/game.js`, `prototypes/bloodline/data.js`
**Tester role**: economy-designer / playtester-optimizer
**Story type**: Config/Data (balance audit)
**Gate level**: ADVISORY (prototype)

Previously reported — excluded from this sweep: FOOD-01, SUCC-01, GATE-01, SABER-01, DISC-01, EVENT-01, FADE-01, RENDER-01, DEBUG-01, TRV-02.
Prior sweep OPT-01 through OPT-14 (2026-05-29) also excluded — those findings remain valid but were filed against old data.js (6 branch techs). This sweep targets the migrated 13-branch-tech system.

---

## Preliminary: Briefing Corrections (data.js vs. stated constants)

The briefing states "Universal techs: 3 (automatic at cycles 2, 5, 8)." This is incorrect against the current `data.js`. There are **5 universal techs** with the following cycle gates:

| ID | Name | Cycle |
|----|------|-------|
| ut_talla_laminar | Talla en Làmines | 2 |
| ut_vestimenta | Cosit i Vestimenta | 4 |
| ut_art_simbolic | Art i Símbol | 6 |
| ut_recollida_sistematica | Recol·lecció Sistemàtica | 9 |
| ut_conreu_incipient | Conreu Incipient | 12 |

This matters: two branch tech trees (`bt_coneixement_plantes`, `bt_llavor_selectiva`, `bt_calendari_natural`, `bt_domini_terra`) are gated behind universal techs at cycles 9 and 12, which significantly constrains late-game reachability within LIFE_EXPECTANCY=14. All OPT findings below use the 5-tech schedule.

---

## OPT-15 — Branch Tech Inclination Prerequisites: Reachability Analysis

**Severity**: S1 Critical
**Title**: Three branch techs require inclination thresholds mathematically unreachable within 14 cycles via organic play

**Description**:

The inertia formula at `game.js:78` is:
```
effectiveDelta = delta / (1 + |current| * INERTIA_FACTOR)
```
With INERTIA_FACTOR=2.0, every point of existing inclination reduces future movement on that axis by a factor. Effective deltas at key thresholds:

| Current value | Multiplier on raw delta |
|---|---|
| 0.0 | 1.00 |
| 0.20 | 0.71 |
| 0.30 | 0.63 |
| 0.50 | 0.50 |
| 0.70 | 0.42 |

The highest single-action delta on any axis is:
- `act_emboscada_nocturna`: impuls +0.07 (`data.js:247`)
- `act_narrar_llegendes`: espiritualitat +0.03 + sociabilitat +0.04
- `act_transit_nocturn`: espiritualitat +0.05

Simulation: reaching `espiritualitat >= 0.30` from 0.0 using the highest spiritual delta available (`act_transit_nocturn`, +0.05, unlocked via `bt_calendari_natural` which requires `ut_recollida_sistematica` at cycle 9):

- Cycles 1-8: spiritual delta only available from `act_ritual_foc` (+0.03) or `act_tenir_fills` (+0.02).
- Fastest path using `act_ritual_foc` every cycle for 8 cycles: each cycle adds approximately 0.03/(1 + current*2). Running the sum from 0.0 through 8 steps: estimated accumulation ~0.14-0.18 by cycle 8.
- `bt_pintura_rupestre` requires BOTH espiritualitat >= 0.30 AND sociabilitat >= 0.20, gated behind `ut_art_simbolic` (cycle 6).
- To reach espiritualitat 0.30 before cycle 6: using `act_ritual_foc` (+0.03 espiritualitat, +0.02 sociabilitat, costs 1 food, execute_cost=1): cycles 1–5 devoted entirely to ritual. Estimated accumulation by cycle 5: ~0.11 espiritualitat. This falls short by ~0.19 absolute.

**The three branch techs with unreachable prerequisites in a standard single-generation playthrough are:**

**1. `bt_pintura_rupestre`** (`data.js:85`)
- Requires: espiritualitat >= 0.30 AND sociabilitat >= 0.20
- Universal prereq: `ut_art_simbolic` (cycle 6)
- Problem: The only espiritualitat-growing base actions are `act_ritual_foc` (+0.03) and `act_tenir_fills` (+0.02). `act_ritual_foc` at cycle 1: full delta = 0.03. At cycle 3 (est. 0.06): delta ≈ 0.024. By cycle 5 (est. ~0.10): delta ≈ 0.020. To reach 0.30 from 0.0 with only ritual_foc (+0.03 base, decaying) would require approximately 18-22 cycles — exceeding LIFE_EXPECTANCY=14. Even if sociabilitat rises simultaneously (ritual_foc also gives +0.02 sociabilitat), the double-threshold makes this unreachable in Gen 1 without inheriting inclination from a prior generation. The tech is structurally Gen-2+ only.
- Impact: All 4 Ritual zone actions (`act_pintar_parets`, `act_consagrar_ornaments`, `act_observar_cel`, `act_transit_nocturn`) are inaccessible in Gen 1 even before the known DYN-01 zone_id bug. The Místic branch is Gen-2 locked by design — but this is not communicated to the player.

**2. `bt_guariment_plantes`** (`data.js:77`)
- Requires: espiritualitat >= 0.25 AND sociabilitat >= 0.20
- Universal prereq: `ut_vestimenta` (cycle 4)
- Same structural problem as bt_pintura_rupestre. Is hidden (`is_hidden: true` — `data.js:83`). Reaching both thresholds simultaneously by cycle 4 from 0.0 is not feasible through available base actions. Unlockable in Gen 2+ only.

**3. `bt_coneixement_plantes`** (`data.js:109`)
- Requires: intel·lecte <= 0.05 AND impuls <= 0.10
- Universal prereq: `ut_recollida_sistematica` (cycle 9)
- Problem is the inverse: this is a "stay near center" requirement. Any action taken over 9 cycles that touches either axis risks overshooting. `act_tallar_pedra` gives intel·lecte +0.02 each use — just 3 uses push intel·lecte to ~0.05. After 5 uses, ~0.08. After 9 cycles of diverse play, staying below 0.05 on BOTH axes simultaneously requires extreme action restraint that conflicts with survival (no food-generating action keeps both axes below 0.05). `act_recollectar_arrels` gives impuls -0.01, intel·lecte +0.01 — even collecting food gently raises intel·lecte.
- This is the same structural problem as OPT-09 (Recol·lector branch) from the prior sweep: a "near-zero" condition conflicts with normal play. The difference is `bt_coneixement_plantes` is gated at cycle 9, making the restraint requirement cover 9 full cycles of non-polluting play.

**Impact on player experience**: The Místic branch is a 2-generation investment, not a single-generation choice. Players who intend to play a spiritual/healer character in Gen 1 will spend the entire lifespan building toward thresholds they cannot reach, then succeed partially in Gen 2. This is either an intended design (multi-generational identity building) or an unintended barrier. It is not communicated to the player in any UI element.

**Suggested fix direction**: Either (a) document and surface as design intent — "this branch unfolds across 2 generations" — and lower thresholds for cycle-6 techs (e.g., espiritualitat >= 0.20 for bt_pintura_rupestre), or (b) add a mid-weight spiritual action to the base set that provides +0.05 espiritualitat, making the threshold reachable in 8-10 cycles.

---

## OPT-16 — STAT_OUTPUT_FACTOR: Output Variance Is Meaningful but Not Exploitable

**Severity**: S3 Minor
**Title**: Stat multiplier (0.15/point) creates legitimate variance but caps at 1.60x — not a balance break

**Description**:

The stat multiplier formula at `game.js:136`:
```js
return 1 + (stats[stat_key] - STAT_STARTING_VALUE) * STAT_OUTPUT_FACTOR;
```
With STAT_STARTING_VALUE=1.0, STAT_MAX=5.0, STAT_OUTPUT_FACTOR=0.15:
- At stat 1.0 (starting): multiplier = 1.00
- At stat 2.0: multiplier = 1.15 (+15%)
- At stat 3.0: multiplier = 1.30 (+30%)
- At stat 5.0 (max): multiplier = 1.60 (+60%)

For representative actions:

| Action | Output range (stat 1.0) | Output range (stat 5.0) | Net gain |
|--------|------------------------|------------------------|----------|
| act_espiar_ramat | 2–5 food | 3–8 food (×1.60 + round) | +1–3 food |
| act_caca_llanca | 5–12 food | 8–19 food | +3–7 food |
| act_emboscada_nocturna | 6–15 food | 10–24 food (capped by rounding) | +4–9 food |
| act_curar_herbes | 3–7 health | 5–11 health | +2–4 health |

The variance between stat 1.0 and stat 5.0 is real (approximately 50-60% more output at max), which creates meaningful progression for dedicated players. However, at stat gain of 0.10-0.20 per action use and STAT_MAX=5.0, reaching max stat requires 20-40 uses of a single action — well within one generation for a focused player.

The formula is not exploitable in the sense of producing infinite resources: output is always bounded by `Math.round(randInt(min, max) * multiplier)`. The multiplication is applied before rounding, so at max stat and max roll (output_max * 1.60), the ceiling is deterministic and finite.

**One genuine concern**: `Math.round()` applied to the entire expression (not to the raw roll before multiplication) means that at stat 1.0, the roll is an integer (randInt returns integer). At stat 5.0, the roll × 1.60 may produce a fractional result that rounds up: e.g., `randInt(5,12)` returns 9; 9 × 1.60 = 14.4; round → 14. This is correct. But for output_min: `randInt(5 + outputMinBonus, 12)` — if outputMinBonus is 1 (from bt_rasclador_fi passive), the floor rises. The interaction of outputMinBonus + stat multiplier creates a slightly elevated floor, which is fine and not exploitable.

**The actual exploit risk** from STAT_OUTPUT_FACTOR is not the formula itself but stat accumulation speed (see OPT-17 below).

**Impact**: Acceptable. The 1.60x ceiling creates clear end-game power without infinite scaling. No fix recommended on STAT_OUTPUT_FACTOR itself.

---

## OPT-17 — Stat Accumulation Rate: Focused Players Max Out by Cycle 7-10

**Severity**: S2 Major
**Title**: Single-action stat farming reaches STAT_MAX before mid-game, collapsing output variance for the rest of the generation

**Description**:

Stat gain per action execution from `data.js`:
- Base actions: stat_gain = 0.10 (most), one exception: `act_cercar_parella` = 0.20
- Branch tech actions: stat_gain = 0.15 (most)
- High-risk hunter actions (`act_caca_llanca`, `act_emboscada_nocturna`): stat_gain = 0.20
- Upgrade actions: stat_gain = 0.10

Starting stat = 1.0, STAT_MAX = 5.0. Gap to fill = 4.0.

Cycles to reach STAT_MAX:
- At 0.10/use: 40 uses (impossible in 14 cycles if any other action is taken)
- At 0.15/use: 27 uses (still spans 2 generations)
- At 0.20/use: 20 uses (reachable in ~14 cycles if player uses this action exclusively)

In practice, a player who uses one action as their primary (e.g., `act_espiar_ramat` 10x, `act_aguait_coordinat` upgrade 10x) accumulates: 10 × 0.10 + 10 × 0.10 = 2.0 stat gain → stat = 3.0 by cycle 20. Across generations with inheritance at 65%: Gen 1 ends at 3.0 → Gen 2 inherits 3.0 × 0.65 + 1.0 × 0.35 = 2.30 → only needs 1.70 more points to re-max (17 uses at 0.10/use).

For high-gain actions (0.20/use): Gen 1 uses `act_caca_llanca` 14 times (one per cycle): stat at end = 1.0 + 14 × 0.20 = 3.80. Gen 2 inherits 3.80 × 0.65 + 1.0 × 0.35 = 2.82. Reaches STAT_MAX (5.0) in just 11 more uses — by cycle 11 of Gen 2. Gen 3 inherits 5.0 × 0.65 + 0.35 = 3.60. Reaches max in 7 uses — by cycle 7. **From Gen 3 onward, the stat multiplier is permanently locked at 1.60x for any focused dynasty.**

This means the stat system provides progression tension for Gen 1 only. By Gen 3, every action this character type takes is already at max multiplier from the start of the generation. The game's survival math is then always computed at ceiling values, eliminating the mid-game resource ramp.

**Impact**: Moderate — removes output-scaling tension in later generations. Players who focus early feel permanently powerful, which is partially intentional (dynasty progression), but the speed of reaching the ceiling (Gen 3, cycle 7) means half the game's generations play with no remaining stat growth to pursue. Late-game actions with stat_gain = 0.15 are irrelevant if the stat is already at 5.0.

**Suggested fix direction**: Lower STAT_OUTPUT_FACTOR to 0.10 (max multiplier 1.40x) and increase STAT_MAX to 8.0 or 10.0, spreading the same power curve over a longer accumulation period. Alternatively, introduce diminishing stat gain per action past a threshold (e.g., gain halves above stat 3.0).

---

## OPT-18 — Provisions (Materials) Generation vs. Purchase Costs: Economy Viable but Tight

**Severity**: S3 Minor
**Title**: Provisions economy is balanced for 1-2 branch tech purchases per generation; 3+ requires dedicated farming

**Description**:

**Provisions (materials) generation rates** from base and zero-cost actions:

| Action | Cost | Output (min–max) | Expected value (stat 1.0) |
|--------|------|-------------------|--------------------------|
| act_tallar_pedra | 0 food | 1–3 eines | 2.0 |
| act_faonar_eines (bt_rasclador_fi) | 0 food | 2–5 eines | 3.5 |
| act_gravar_os (bt_buri) | 0 food | 2–4 eines | 3.0 |
| act_cosir_pells (bt_agulla_os) | 0 food | 2–4 eines | 3.0 |
| act_assecament_plantes (bt_coneixement_plantes) | 0 food | 2–4 eines | 3.0 |
| act_narrar_llegendes (bt_pintura_rupestre) | 0 food | 1–3 eines | 2.0 |

The primary provisions source in Gen 1 (before any branch techs) is `act_tallar_pedra` at 2.0 EV per cycle.

**Branch tech action purchase costs:**

| Cost tier | Actions |
|---|---|
| 3 Provisions | act_molda_grans, act_parar_trampes, act_marcar_territori, act_rastreig_rutes, act_recollida_bolets, act_assecament_plantes, act_faonar_eines, act_cosir_pells, act_intercanviar_eines, act_observar_cel, act_ornamentar_se, act_curar_herbes |
| 4 Provisions | act_caca_llanca, act_gravar_os, act_construir_refugi, act_pintar_parets, act_consagrar_ornaments, act_transit_nocturn, act_seleccionar_llavors |
| 5 Provisions | act_emboscada_nocturna, act_control_territori |
| Upgrades: 4–5 | All 5 upgrades (4 or 5 each) |

**Budget analysis for a 14-cycle generation:**

Cycle budget allocation: assume 7 cycles produce food (survival), 7 cycles produce provisions (via act_tallar_pedra).
- 7 cycles × 2.0 EV provisions = 14 provisions
- Survival check: 7 food-producing cycles generating avg 3.5 food (act_espiar_ramat) = 24.5 food earned. Starting food 15, upkeep 14 cycles = 14 food consumed. Net: 15 + 24.5 - 14 = 25.5 food remaining. This is comfortable.

So a standard Gen 1 player can realistically generate **12-16 provisions** in one generation while keeping food positive. This allows purchasing **2-3 branch tech actions at cost 3-4** each, or **1 premium action (cost 5) + 1 standard action (cost 3)**.

**The tight scenario:** A player who wants both a food branch action AND an upgrade in the same generation: e.g., `act_caca_llanca` (4) + upgrade `act_aguait_coordinat` (5) = 9 provisions. Requires 9/2.0 = 4.5 cycles of pure provisions grinding — feasible within 14 cycles, but leaves only 3-4 cycles for food production, which is pressure but not fatal with 15 starting food.

**The degenerate scenario:** All five upgrades total 23 provisions (4+4+5+4+5). Acquiring all upgrades in one generation is impossible (would require 11-12 cycles of provisions farming, leaving only 2-3 cycles for food — insufficient to survive 14 cycles of upkeep). This is a healthy natural ceiling.

**One imbalance found**: `act_seleccionar_llavors` (bt_llavor_selectiva, `data.js:309`) costs 4 provisions and is gated behind `ut_conreu_incipient` at cycle 12. With 2 cycles remaining after cycle 12, the player has at most 2 cycles to purchase and use this action. Its output (3-8 food, zero food cost) makes it excellent, but the purchase opportunity window is just 2 cycles. This action is effectively Gen-2 locked by its universal tech gate timing, not by inclination.

**Impact**: Economy is tight but functional. 14 cycles support 2-3 meaningful purchases per generation, which creates real choice. No urgent fix needed on the overall economy. The `ut_conreu_incipient` timing (cycle 12) renders its associated branch techs effectively inaccessible in Gen 1.

---

## OPT-19 — Late Universal Techs (Cycle 9, Cycle 12) Are Effectively Gen-2 Unlocks

**Severity**: S2 Major
**Title**: ut_recollida_sistematica (cycle 9) and ut_conreu_incipient (cycle 12) gate 4 branch techs that cannot be meaningfully used within Gen 1

**Description**:

With LIFE_EXPECTANCY=14, the two late universal techs gate content as follows:

**ut_recollida_sistematica** (cycle 9):
- Unlocks: `bt_coneixement_plantes` and `bt_calendari_natural`
- Remaining cycles after cycle 9: 5 cycles
- `bt_coneixement_plantes` (data.js:109): requires intel·lecte <= 0.05 AND impuls <= 0.10 simultaneously. After 9 cycles of any normal play, both axes will have drifted from 0.0. The "stay near zero" requirement (see OPT-15 and the prior OPT-09 note on Recol·lector) is hardest to maintain over a long play period. Realistically unreachable at cycle 9 unless the player specifically avoided all intel·lecte-modifying actions for 9 cycles (which means never using `act_tallar_pedra`, the primary provisions source, since it gives intel·lecte +0.02).
- `bt_calendari_natural` (data.js:117, `is_hidden: true`): requires espiritualitat >= 0.20 AND intel·lecte <= 0.05. Same intel·lecte ceiling problem. Also requires espiritualitat >= 0.20, which contradicts the intel·lecte <= 0.05 constraint (both axes must be moved in specific directions). Discovery event `ev_desc_calendari` fires from pool_ritual, which requires using ritual actions — which push espiritualitat but don't move intel·lecte. Marginally more reachable than bt_coneixement_plantes but still constrained.
- Even if unlocked at cycle 9, only 5 cycles remain to purchase (3-4 provisions needed) AND use the unlocked actions.

**ut_conreu_incipient** (cycle 12):
- Unlocks: `bt_llavor_selectiva` and `bt_domini_terra`
- Remaining cycles: 2
- `bt_llavor_selectiva` actions (act_seleccionar_llavors): purchase cost 4. Generating 4 provisions in 2 remaining cycles is possible but leaves no room for other play.
- `bt_domini_terra` (act_control_territori): purchase cost 5, execute_cost 1, health_delta -1. Requires 5 provisions in 2 cycles. Essentially unreachable in Gen 1 — even with provisions stockpiled, the health cost and the window of 2 cycles make it a footnote action.

**Impact**: The 5-tech universal tree creates a 3-tier system:
- Tiers 1-3 (cycles 2, 4, 6): Reachable in Gen 1, provide meaningful branch tech access.
- Tiers 4-5 (cycles 9, 12): Function as Gen-2 prerequisites — they make branch techs discoverable in Gen 2 from the start (since `discoveredUniversalTechIds` persists across succession per DYN-02). This is potentially intentional as a multi-generational design, but it is not communicated and creates a dead-end feeling when Gen 1 cycles 9-14 are spent watching techs unlock that cannot be acted upon.

**Suggested fix direction**: If multi-generational gating is intentional, document it and surface it in the UI ("This technology will be available to your heirs"). If not intentional, shift `ut_recollida_sistematica` to cycle 7 and `ut_conreu_incipient` to cycle 10, giving 7 and 4 cycles respectively to engage with the unlocked content.

---

## OPT-20 — Destresa System: DESTRESA_THRESHOLD=5 Is Achievable but Tight; Only 2 Actions Have Lower Thresholds

**Severity**: S3 Minor
**Title**: Destresa timing is generally sound; DESTRESA_MAX=2 creates a first-action-wins slot problem

**Description**:

`DESTRESA_THRESHOLD = 5` from `game.js:24`. In `data.js`, only one action has a non-default threshold:
- `act_ritual_foc`: `destresa_threshold: 4` (`data.js:182`)
- All others: use the default 5 (inherited from DESTRESA_THRESHOLD)

At threshold=5, a player who uses the same action 5 times earns the destresa. With LIFE_EXPECTANCY=14, using one action 5 times = 36% of the lifespan. A player running two primary actions can reach the threshold for each by cycle 10 (5+5 uses = 10 cycles, cycling between them).

**Achievability within 14 cycles**: Yes. A player who commits to 1-2 primary actions can earn 1-2 destresas before cycle 10. This leaves 4 cycles to use the bonus (DESTRESA_BONUS=1 flat per-use bonus).

**The DESTRESA_MAX=2 slot problem**: With 13 branch techs and 6 base actions having destresa entries, there are far more potential destresas than the 2-slot cap allows. A player who earns d_rastreig (act_espiar_ramat, 5 uses) and d_botanica (act_recollectar_arrels, 5 uses) in Gen 1 has both slots filled. All subsequent actions with destresa potential (including high-value ones like destresa from `act_gravar_os` or `act_narrar_llegendes`) contribute 0 bonus even after threshold. The system rewards early commitment but creates a "slot tax" where late-unlocking branch tech destresas are never usable if base action destresas were claimed first.

**Inheritance**: `state.character.destreses` are inherited 100% via `createCharacter()` at `game.js:40`. Gen 2 begins with the same 2 destresas, both slots filled. Since DESTRESA_MAX=2 is a hard cap and destresas do not expire, the heir inherits filled slots and can never earn new destresas. The destresa system becomes a Gen-1-only progression mechanic — every subsequent generation simply inherits the fixed 2 destresas and has no destresa-related goal.

**Impact**: Minor for Gen 1, but the Gen-2+ destresa stagnation means the system provides zero ongoing engagement signal after Gen 1. The progress bars (game.js:933-938) displayed for destresa accumulation are permanently hidden for inherited destresas because `state.character.actionUseCounts` resets to `{}` at `createCharacter()` — heir starts with slots full but counts at zero, so the inherited destresas show as achieved without the bar having filled.

**Suggested fix direction**: Either increase DESTRESA_MAX to 3-4 (allowing later destresas to displace or coexist with early ones), or make destresa slots branch-category-specific (one physical slot, one social slot, one craft slot) so late-game branch techs are always relevant.

---

## OPT-21 — Action Output vs. Resource Consumption: Food Economy Is Safe; Two Actions Are Clear Outliers

**Severity**: S2 Major
**Title**: act_emboscada_nocturna and act_seleccionar_llavors have output ranges that are disproportionately powerful relative to their gate requirements

**Description**:

**Food consumption baseline**: FOOD_UPKEEP=1/cycle, STARTING_FOOD=15. Over 14 cycles, total food consumed by upkeep = 14. Starting food covers it all — a player who generates zero food survives the full 14 cycles on starting food alone (barely). Any food generation is surplus.

**Action output survey** (at stat 1.0, no bonuses):

| Action | Execute cost | Net food EV | Health delta | Gate |
|--------|-------------|-------------|--------------|------|
| act_espiar_ramat | 1 | (2+5)/2 - 1 = +2.5 | — | Base |
| act_recollectar_arrels | 1 | (2+4)/2 - 1 = +2.0 | — | Base |
| act_ritual_foc | 1 | (1+3)/2 - 1 = +1.0 | +1 health | Base |
| act_vigilar_campament | 1 | (2+4)/2 - 1 = +2.0 | — | Base |
| act_explorar_voltants | 1 | (1+3)/2 - 1 = +1.0 | — | Base |
| act_caca_llanca | 2 | (5+12)/2 - 2 = +6.5 | -2 health | bt_punta_llanca |
| act_emboscada_nocturna | 2 | **(6+15)/2 - 2 = +8.5** | -3 health | bt_punta_llanca |
| act_parar_trampes | 1 | (2+6)/2 - 1 = +3.0 | — | bt_trampes |
| act_molda_grans | 1 | (3+7)/2 - 1 = +4.0 | — | bt_rasclador_fi |
| act_recollida_bolets | 1 | (2+5)/2 - 1 = +2.5 | +1 health | bt_coneixement_plantes |
| act_seleccionar_llavors | 0 | **(3+8)/2 - 0 = +5.5** | — | bt_llavor_selectiva |
| act_rastreig_rutes | 1 | (3+6)/2 - 1 = +3.5 | — | bt_marques_territori |
| act_control_territori | 1 | (3+7)/2 - 1 = +4.0 | -1 health | bt_domini_terra |

**Outlier 1: `act_emboscada_nocturna`** (`data.js:244`)
- Net food EV: +8.5/cycle at stat 1.0, rising to +8.5 × 1.60 - 2 = +11.6 at stat 5.0 (forca)
- Health penalty: -3/cycle. HEALTH_UPKEEP is also -1/cycle. Combined health drain: -4/cycle. At STARTING_HEALTH=20 and assuming no healing, the character dies in cycle 5 from health alone (20 / 4 = 5 cycles). This is a deliberate high-risk/high-reward action. However: if the player also uses `act_ritual_foc` (+1 health) or `act_curar_herbes` (+3-7 health), the health drain is trivially offset. An emboscada-nocturna + ritual_foc alternating strategy generates: avg +4.75 food/cycle net, +0 health/cycle net. This produces food at nearly 2x any safe alternative, with no long-term penalty if health sources are available.
- The output ceiling at max stat (output_max=15 × 1.60 = 24, then subtract 2 execute cost = +22 net food in one cycle) is the highest single-action food generation in the game by a large margin.

**Outlier 2: `act_seleccionar_llavors`** (`data.js:309`)
- Zero execute cost, 5.5 EV food per cycle.
- Gated behind `ut_conreu_incipient` (cycle 12), only 2 cycles of use in Gen 1.
- In Gen 2 (cycle 0, universal tech already unlocked): available from cycle 0 if inclination condition is met. Condition: intel·lecte <= 0.05 AND impuls <= 0.10. In Gen 2 with BRANCH_INHERITANCE_RATE=0.65, inherited inclination values from a diverse Gen 1 likely drift away from this near-zero window. But a player who deliberately avoided both axes in Gen 1 can pass near-zero inheritance to Gen 2, allowing act_seleccionar_llavors from cycle 0 of Gen 2. 5.5 food/cycle with zero execute cost, zero health risk, and positive intel·lecte delta (+0.02) makes this the safest high-yield food action in the game once accessible.

**Compared to base actions**: Base action best is +2.5 EV (act_espiar_ramat). `act_seleccionar_llavors` at +5.5 is 2.2x better with zero cost. `act_emboscada_nocturna` at +8.5 is 3.4x better (with health risk). The magnitude jump from base to branch tech is steep.

**Impact**: The outlier actions do not create infinite resource loops (both have finite outputs) but they do create a strong "get to this branch tech and spam it" incentive that overrides all other action choices once available. The economic decision space collapses around 1-2 dominant actions.

**Suggested fix direction**: Reduce `act_emboscada_nocturna` output_max from 15 to 11 (bringing EV to +6.5, matching act_caca_llanca). Give `act_seleccionar_llavors` an execute_cost of 1 to bring its EV to +4.5, still clearly superior to base but not free.

---

## OPT-22 — Upgrade Power Step: Significant but Not Game-Breaking; Upgrades Lack Tradeoffs

**Severity**: S3 Minor
**Title**: All 5 upgrades provide +1 to +3 food EV improvement over base; no tradeoffs exist

**Description**:

Upgrade comparison (at stat 1.0):

| Base action | Base EV | Upgrade | Upgrade EV | Purchase cost | Net gain per use |
|-------------|---------|---------|------------|--------------|-----------------|
| act_espiar_ramat | +2.5 | act_aguait_coordinat | +4.5 | 5 | +2.0 |
| act_recollectar_arrels | +2.0 | act_recollecta_metodica | +4.5 | 4 | +2.5 |
| act_tallar_pedra | EV 2.0 eines | act_talla_avancada | EV 4.5 eines | 5 | +2.5 eines |
| act_ritual_foc | +1.0 food +1 health | act_gran_ritual | +2.5 food +2 health | 4 | +1.5 food +1 health |
| act_vigilar_campament | +2.0 | act_defensa_activa | +3.5 | 5 | +1.5 |

All upgrades are strictly better than their base on all output dimensions. This confirms the prior-sweep finding OPT-13. None add an execute_cost penalty, inclination restriction, or health risk.

**The provisions opportunity cost calculation**: An upgrade costing 5 provisions represents 2.5 cycles of act_tallar_pedra farming (at 2.0 EV). The payback period for an upgrade providing +2.0 food/use: at 1 use per cycle, the upgrade pays back in 2.5 cycles and then generates surplus for the remaining cycles. For a player who gets an upgrade at cycle 5, they have 9 cycles of surplus — the investment is clearly worthwhile every time.

**Notable exception**: `act_gran_ritual` is NOT a clear dominant over `act_ritual_foc` in all contexts — `act_gran_ritual` gives +2 health_delta vs +1, which is the prior-sweep OPT-02 "health immortality" issue. As a food generator it is only marginally better (+2.5 EV vs +1.0). But the health bonus makes it disproportionately powerful for health management, which OPT-02 already flagged.

**Impact**: Low-moderate. Upgrades make the economy feel rewarding (deliberate investment → clear improvement) but the absence of any tradeoff means the only interesting question is "when" not "whether." This is a design concern, not a balance break. Consistent with prior sweep findings.

---

## OPT-23 — BRANCH_INHERITANCE_RATE=0.65: Dynasty Progression Is Meaningful but Converges Too Fast

**Severity**: S2 Major
**Title**: At 0.65 inheritance, axis values converge to functional branch thresholds within 2 generations and stat values reach ceiling by Gen 3, collapsing late-dynasty tension

**Description**:

**Inclination convergence**:
- If Gen 1 ends with impuls = 0.70 (strong hunter), Gen 2 inherits impuls = 0.70 × 0.65 = 0.455.
- Caçador branch threshold: impuls >= 0.30. Gen 2 starts above threshold — Caçador active immediately.
- Gen 3 inherits: 0.70 × 0.65 (if Gen 2 also pushed to 0.70) = 0.455. Still above 0.30.
- The branch remains active with no play required through Gen 3 and beyond (as long as each gen maintains the axis).

For axes with stricter thresholds (espiritualitat >= 0.30 + sociabilitat >= 0.20 for Místic):
- Gen 1 achieves both at end of Gen 2-style play (as noted OPT-15, Gen 1 barely reaches these).
- Gen 2 inherits e.g. espiritualitat = 0.25 × 0.65 = 0.1625 — BELOW threshold. Místic resets.
- This means Místic requires Gen 1 to significantly overshoot the threshold (reach ~0.45) before Gen 2 can inherit above 0.30.
- Requiring Gen 1 to reach 0.46 on espiritualitat from 0.0 via ritual_foc (+0.03 per cycle, decaying): approx 30+ cycles needed. Impossible in 14. Místic dynasty is a 3+ generation investment.

**Stat convergence** (confirms and extends OPT-17):
- Gen 1 forca = 3.0 at end → Gen 2 inherits 3.0 × 0.65 + 1.0 × 0.35 = 2.30
- Gen 2 reaches forca 5.0 (uses 14 cycles of act_caca_llanca) → Gen 3 inherits 3.60
- Gen 3 reaches 5.0 in 7 cycles → Gen 4 inherits 3.60 again → same loop
- **Steady state**: From Gen 3 onward, every generation starts at 3.60 stat and maxes by cycle 7, then plays the remaining 7 cycles at max multiplier with no progression goal.

**BRANCH_INHERITANCE_RATE at 0.65 analysis**:
- 0.65 preserves cultural memory (dynasties feel meaningful — you can see your ancestor's choices)
- 0.65 decays fast enough that inclination is not permanent (avoids lock-in from OPT-08)
- The problem: at 0.65, a single axis pushed to 1.0 still transmits 0.65 — well above the 0.30 threshold for both hunter branches. The inheritance rate protects against full lock-in but not against above-threshold inheritance for the easier-to-reach thresholds.

**Comparison to branch conditions**:
- Caçador: impuls >= 0.30. Activation requires Gen 1 to reach impuls > 0.46 (0.46 × 0.65 = 0.30) — achievable in ~8-10 cycles.
- Artesà: intel·lecte >= 0.25. Requires Gen 1 to reach 0.38 — achievable in ~10-12 cycles.
- Recol·lector: impuls <= 0.10 AND intel <= 0.10 — any inheritance of axes disrupts this. Cannot inherit Recol·lector.
- Místic: espiritualitat >= 0.30 AND sociabilitat >= 0.20. Requires Gen 1 to reach ~0.46 and ~0.31 simultaneously — see OPT-15, effectively impossible in Gen 1.

**Impact**: The inheritance rate creates a 2-speed dynasty: hunter/craftsman dynasties unlock their identity by Gen 2 with minimal effort; mystic dynasties require 3+ generations of focused play. This asymmetry is large and unintentional in feel — the Místic branch appears to be designed as an equivalent alternative but plays as a much longer investment.

**Suggested fix direction**: Raise mystic/spiritual branch thresholds to match difficulty to access (espiritualitat >= 0.25 instead of 0.30 for bt_pintura_rupestre) OR lower BRANCH_INHERITANCE_RATE slightly (to 0.55) so hunter branches don't auto-activate in Gen 2 either, requiring each generation to commit somewhat.

---

## OPT-24 — Destresa System: act_ritual_foc Has Threshold 4 (Faster Than All Others)

**Severity**: S4 Trivial
**Title**: Ritual destresa unlocks 1 use earlier than all other actions — minor inconsistency

**Description**:

`act_ritual_foc` at `data.js:182` sets `destresa_threshold: 4`, while `DESTRESA_THRESHOLD = 5` is the default (`game.js:24`) and all other base actions use the default. The ritual destresa (`d_custodi_foc`) is reachable in 4 executions vs. 5 for all other destresas.

Given that ritual_foc also has the lowest food output EV of all base food actions (+1.0 after upkeep), the faster threshold could be read as compensation — ritual play is less efficient, but you earn the destresa bonus sooner. This is a plausible design intent. However the threshold value is not surfaced to the player (the UI shows the count bar `X/threshold` but not why the threshold differs from others), so players will not perceive it as a meaningful choice signal.

**Impact**: Trivial. No balance consequence — 1 cycle difference in destresa timing is negligible. Document as intentional or standardize to 5.

---

## OPT-25 — Provisions Output Actions: act_intercanviar_eines and act_construir_refugi Output "eines" With No Execute Cost Advantage

**Severity**: S3 Minor
**Title**: Two branch tech actions output provisions (eines) with execute costs while zero-cost provisions actions exist — making them weak choices

**Description**:

Provisions-generating branch tech actions with execute_cost > 0:

| Action | Cost | Output | EV | Gate |
|--------|------|--------|----|------|
| act_intercanviar_eines | 1 food | 2–5 eines | 3.5 | bt_buri |
| act_construir_refugi | 1 food | 3–6 eines | 4.5 | bt_agulla_os |

Zero-cost provisions actions:
| Action | Cost | Output | EV | Gate |
|--------|------|--------|----|------|
| act_tallar_pedra | 0 food | 1–3 eines | 2.0 | Base |
| act_faonar_eines | 0 food | 2–5 eines | 3.5 | bt_rasclador_fi |
| act_gravar_os | 0 food | 2–4 eines | 3.0 | bt_buri |
| act_cosir_pells | 0 food | 2–4 eines | 3.0 | bt_agulla_os |
| act_assecament_plantes | 0 food | 2–4 eines | 3.0 | bt_coneixement_plantes |

`act_intercanviar_eines` costs 1 food and produces 2-5 eines (EV 3.5) — identical EV to `act_faonar_eines` which costs 0 food. The cost penalizes it without increasing output. The inclination bonus (sociabilitat +0.03) is its only differentiator, but a player who wants sociabilitat can get it from other zero-cost actions. `act_intercanviar_eines` is weakly dominated.

`act_construir_refugi` at EV 4.5 with cost 1 food is better than `act_faonar_eines` by +1.0 EV but requires burning food. Given that food is the primary survival resource, paying food for provisions is a contextual trade — reasonable in food-surplus runs. Not dominated, just situational.

**Impact**: Minor design inefficiency. `act_intercanviar_eines` is weakly dominated. Could be given a higher output range (3-6 eines) to justify the food cost, or the food cost could be removed.

---

## OPT-26 — act_curar_herbes Health Output Offsets Aging Upkeep by 3-7x

**Severity**: S2 Major
**Title**: Health-generating action eliminates health pressure independently of Gran Ritual — confirmed second path to health immortality

**Description**:

This confirms and extends the prior sweep's OPT-02 (Gran Ritual) and OPT-03 (Curar Grup, which was a pre-migration action name). In the migrated data.js, the relevant action is `act_curar_herbes` (`data.js:366`).

`act_curar_herbes`:
- Execute cost: 2 food
- Output: 3-7 health (EV 5.0 at stat 1.0; at stat 5.0 vincle: 5.0 × 1.60 = 8.0)
- HEALTH_UPKEEP: 1/cycle
- Net health per use: +4.0 (stat 1.0) to +7.0 (stat 5.0) after upkeep
- Execute_cost: 2 food — requires a food source to sustain

The health output is 4-7x the upkeep drain. Even at stat 1.0, one use of act_curar_herbes offsets 4 cycles of health upkeep. A player who uses it every 4 cycles (3 food-producing cycles + 1 healing cycle) maintains health at ceiling indefinitely. The food cost (2/use) is covered by any food-positive action.

Combined with `act_gran_ritual` (upgrade, health_delta +2 per cycle, net +1 above upkeep): these two healing sources provide redundant health immortality. Either one alone eliminates health pressure; together they make health a non-resource.

**Inclination gate check**: `bt_guariment_plantes` requires espiritualitat >= 0.25 AND sociabilitat >= 0.20, locked behind `ut_vestimenta` (cycle 4). As noted in OPT-15, this is unlikely to be reachable in Gen 1. But in Gen 2 with inherited inclination from a spiritual Gen 1, it becomes available early and provides healing that permanently solves health pressure for the rest of the run.

**Impact**: Significant. Health is the only natural pressure system aside from food. Eliminating it (which any healing action does) removes the succession urgency mechanic. A player who stabilizes both food and health has zero reasons to trigger succession before cycle 14, and the dynasty system becomes a mechanical formality rather than an emotional climax.

**Suggested fix direction**: Cap `act_curar_herbes` to restore at most 2 health per use (matching the upkeep + a small net positive for risk relief), or tie healing effectiveness to a condition (e.g., can only heal if health is below 12). This preserves the action's usefulness without making it a health printer.

---

## OPT-27 — Recol·lector Branch: Confirmed Design Dead-End in Migrated Data

**Severity**: S2 Major
**Title**: Recol·lector branch conditions (impuls <= 0.10, intel·lecte <= 0.10) are impossible to hold while accessing any branch tech — branch has no functional identity in 13-tech system

**Description**:

This extends the prior sweep's OPT-09 finding to the post-migration 13-branch-tech data.

Recol·lector branch activation conditions (`data.js:634`): impuls <= 0.10 AND intel·lecte <= 0.10.

All 13 branch techs have inclination prerequisites. Audit for compatibility with Recol·lector state (impuls <= 0.10, intel <= 0.10):

| Branch tech | Condition | Compatible with Recol·lector? |
|-------------|-----------|-------------------------------|
| bt_punta_llanca | impuls >= 0.25, sociabilitat <= 0.30 | NO (impuls too low) |
| bt_rasclador_fi | impuls <= 0.10 OR intel >= 0.20 | PARTIAL (only via impuls arm, intel stays low) |
| bt_buri | intel >= 0.25, impuls <= 0.20 | NO (intel must be high) |
| bt_agulla_os | intel >= 0.20, impuls <= 0.20 | NO (intel must be high) |
| bt_trampes | impuls >= 0.10 | BORDERLINE (impuls exactly 0.10) |
| bt_guariment_plantes | espiritualitat >= 0.25, sociabilitat >= 0.20 | POSSIBLE (neither axis is impuls or intel) |
| bt_pintura_rupestre | espiritualitat >= 0.30, sociabilitat >= 0.20 | POSSIBLE |
| bt_marques_territori | impuls >= 0.20, intel >= 0.05 | NO |
| bt_ornaments | espiritualitat >= 0.20 OR sociabilitat >= 0.25 | POSSIBLE |
| bt_coneixement_plantes | intel <= 0.05, impuls <= 0.10 | YES — designed for Recol·lector |
| bt_calendari_natural | espiritualitat >= 0.20, intel <= 0.05 | POSSIBLE |
| bt_llavor_selectiva | intel <= 0.05, impuls <= 0.10 | YES |
| bt_domini_terra | impuls >= 0.10 OR intel <= 0.05 | PARTIAL (via intel arm) |

**Finding**: The migrated data.js includes exactly 2 branch techs explicitly designed for the Recol·lector low-impuls/low-intel condition: `bt_coneixement_plantes` and `bt_llavor_selectiva`. Both require universal techs at cycles 9 and 12 respectively. 3 more branch techs are compatible if the player pushes espiritualitat/sociabilitat without touching impuls/intel (bt_guariment_plantes, bt_pintura_rupestre, bt_ornaments). This is actually a partial Recol·lector identity — a spiritual-gatherer hybrid — but it requires espiritualitat and sociabilitat to rise to 0.20-0.30 levels, which means the character will likely transition out of Recol·lector branch label (Recol·lector requires intel <= 0.10; the spiritual actions don't touch intel, so the label can persist — verified).

**Conclusion update from prior sweep**: The migration improved the situation. In the original 6-tech system, Recol·lector was a complete dead-end. In the 13-tech system, 2 branch techs (bt_coneixement_plantes, bt_llavor_selectiva) are explicitly designed for it, and a mystic hybrid path exists. However, both Recol·lector-native branch techs are gated at cycles 9+ and have the near-zero inclination ceiling problem (see OPT-19). The branch still lacks a Gen-1 accessible payoff.

**Impact**: Recol·lector is no longer a complete dead-end but remains the weakest branch in Gen 1. Players who identify as Recol·lector in Gen 1 have no branch tech reward until cycle 9-12. Reducing from S2 to S2 (still major due to Gen-1 experience, but the Gen-2+ picture is better).

---

## Summary Table

| ID | Severity | Title |
|----|----------|-------|
| OPT-15 | S1 Critical | Three branch techs have inclination prerequisites unreachable in Gen 1 |
| OPT-16 | S3 Minor | STAT_OUTPUT_FACTOR (0.15) is balanced — not exploitable |
| OPT-17 | S2 Major | Stat accumulation reaches STAT_MAX by Gen 3, cycle 7; removes late-dynasty tension |
| OPT-18 | S3 Minor | Provisions economy is tight but viable for 2-3 purchases/generation |
| OPT-19 | S2 Major | Universal techs at cycles 9 and 12 gate 4 branch techs that cannot be used in Gen 1 |
| OPT-20 | S3 Minor | DESTRESA_THRESHOLD=5 is achievable; DESTRESA_MAX=2 creates first-slot-wins problem |
| OPT-21 | S2 Major | act_emboscada_nocturna (EV +8.5) and act_seleccionar_llavors (EV +5.5 zero cost) are outlier actions |
| OPT-22 | S3 Minor | All 5 upgrades are strictly dominant; no tradeoffs exist |
| OPT-23 | S2 Major | BRANCH_INHERITANCE_RATE=0.65 collapses stat ceiling by Gen 3; asymmetric branch activation |
| OPT-24 | S4 Trivial | act_ritual_foc destresa threshold=4 vs. default 5 — minor inconsistency |
| OPT-25 | S3 Minor | act_intercanviar_eines weakly dominated by act_faonar_eines |
| OPT-26 | S2 Major | act_curar_herbes restores 4-7x health upkeep — second confirmed health immortality path |
| OPT-27 | S2 Major | Recol·lector branch improved but still lacks Gen-1 accessible branch tech payoff |

**Critical issues**: 1 (OPT-15)
**Major issues**: 6 (OPT-17, OPT-19, OPT-21, OPT-23, OPT-26, OPT-27)
**Minor issues**: 5 (OPT-16, OPT-18, OPT-20, OPT-22, OPT-25)
**Trivial issues**: 1 (OPT-24)

---

## Balance Verdict

The 13-branch-tech migration substantially improves content breadth. The Recol·lector dead-end is partially resolved. The discovery event system is coherent and well-populated. However, three systemic issues remain:

1. **Místic branch is structurally Gen-2+** — the inclination thresholds cannot be reached in Gen 1, making this branch invisible to players in their first session (OPT-15).

2. **Two healing paths eliminate health pressure** — once either act_gran_ritual or act_curar_herbes is available, succession urgency is player-controlled rather than system-driven (OPT-26, confirmed from prior OPT-02).

3. **Late universal techs (cycles 9, 12) create dead-end cycles** — the content is visible but unengageable in Gen 1, reducing the last 5 cycles to maintenance rather than discovery (OPT-19).

These are not fatal for a prototype — the core loop (inclination → branch discovery → succession) is functional and legible. But they should inform the GDD balance pass before the game exits prototype stage.
