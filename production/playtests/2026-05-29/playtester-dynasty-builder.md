# Dynasty Builder Playtester Report — Life Tycoon 2
**Date**: 2026-05-29
**Prototype**: prototypes/bloodline/ (game.js + data.js)
**Session type**: Code trace — inheritance system, succession, multi-generation identity

---

## Dynasty Run: DB-01 — Inclination Decay Over 5 Generations (Hunter Dynasty)

**Generation**: 1→5 traced analytically
**Inherited inclination**: impuls traced from +0.6 at gen 1 end

**Key finding**:
The succession code at game.js:401–403 applies the formula exactly as specified:
`newInclination[axis] = state.character.inclination[axis] * BRANCH_INHERITANCE_RATE`
with `BRANCH_INHERITANCE_RATE = 0.65` (game.js:9). No floor, no bonus, no correction.

Decay trace for a hunter dynasty ending gen 1 with impuls = +0.60:

| Transition | impuls at gen start | Caçador threshold (≥0.30) | In branch? |
|---|---|---|---|
| Gen 1 end → Gen 2 start | +0.60 × 0.65 = **+0.390** | 0.390 ≥ 0.30 | YES |
| Gen 2 end → Gen 3 start | +0.390 × 0.65 = **+0.254** | 0.254 < 0.30 | **NO** |
| Gen 3 end → Gen 4 start | +0.254 × 0.65 = **+0.165** | 0.165 < 0.30 | **NO** |
| Gen 4 end → Gen 5 start | +0.165 × 0.65 = **+0.107** | 0.107 < 0.30 | **NO** |

The Caçador branch identity (impuls ≥ 0.30, sociabilitat ≤ 0.30) is lost at the start of gen 3 even when gen 1 pushed impuls to +0.6, which already requires heavy investment against inertia (see DB-03 for inertia context). A gen 1 ending with a modest impuls of +0.4 (more realistic) loses the branch at gen 2 start (+0.26 < 0.30).

The game provides no UI signal before succession that the child will lose branch identity. The succession modal shows "top axis" and its value but does not show whether the inherited value will be above or below any branch threshold. Players will experience a silent identity drop with no warning.

**Code source**: game.js:9 (BRANCH_INHERITANCE_RATE), game.js:395–403 (triggerSuccession + decay loop), data.js:393–395 (Caçador conditions)

**Verdict**: DESIGN CONCERN
**Severity if bug**: N/A

---

## Dynasty Run: DB-02 — Extreme Case: Gen 1 Impuls at +1.0

**Generation**: 1→5 traced analytically
**Inherited inclination**: impuls starting at +1.0 (achievable only via debug dot editor, game.js:1082)

**Key finding**:
Even at the absolute maximum, the hunter identity does not survive to gen 5:

| Transition | impuls at gen start | In branch? |
|---|---|---|
| Gen 1 end → Gen 2 start | +1.00 × 0.65 = **+0.650** | YES |
| Gen 2 end → Gen 3 start | +0.650 × 0.65 = **+0.423** | YES |
| Gen 3 end → Gen 4 start | +0.423 × 0.65 = **+0.275** | **NO** |
| Gen 4 end → Gen 5 start | +0.275 × 0.65 = **+0.179** | **NO** |

At max possible inclination, the branch identity is lost by gen 4. In normal gameplay the impuls ceiling is much lower because of inertia (see DB-03): a player executing act_caca_gran (best impuls driver at +0.05/use) against INERTIA_FACTOR=2.0 will be hard-capped around +0.6–0.7 for a full 14-cycle generation. The +1.0 case is only reachable via the debug dot editor.

This means: no normal play pattern preserves a hunter's branch identity beyond 2–3 generations without active reinforcement each generation. Whether this is intended ("earn your identity each generation") or a bug ("early decisions should shape late-game") is the core design question this prototype is testing.

**Code source**: game.js:1082 (debug dot editor), game.js:401–403 (decay), data.js:393–395 (branch threshold)

**Verdict**: DESIGN CONCERN
**Severity if bug**: N/A

---

## Dynasty Run: DB-03 — Destresa Inheritance Lock-In

**Generation**: 1→5, focusing on gen 1 acquiring both DESTRESA_MAX=2 slots
**Inherited inclination**: N/A

**Key finding**:
Destresa inheritance is unconditional and complete. game.js:416:
```js
const inheritedDestreses = new Set(state.character.destreses);
```
This is passed to `createCharacter` (game.js:420), which stores it as `new Set(inheritedDestreses)` (game.js:38) — a full deep copy.

The destresa acquisition check (game.js:286) is:
```js
state.character.destreses.size < DESTRESA_MAX
```
There is no "inherited" flag or partial slot. If gen 1 earns both destresa slots (e.g., Rastreig after 5 uses of act_espiar_ramat + Talla de Sílex after 5 uses of act_tallar_pedra), gen 2 inherits both and starts with `destreses.size === 2 === DESTRESA_MAX`. The size check immediately fails for all subsequent destresa-eligible actions. Gen 2, 3, 4, and 5 are permanently locked into gen 1's destreses.

**Scenario A (1 destresa inherited)**: Gen 2 starts with 1 destresa, can still earn 1 more. Partially flexible.

**Scenario B (2 destreses inherited)**: Gen 2+ can never earn new destreses. The dynasty's identity is frozen at gen 1's choices — for better or worse.

**Scenario B is the optimal play**: players who optimize will always fill both slots in gen 1, guaranteeing lock-in for all successors. This creates a permanent ceiling on dynasty evolution.

The tension: DESTRESA_MAX=2 is small enough that a competent gen 1 player will fill it within ~10 cycles (two actions × 5 uses threshold = 10 uses, or faster with lower thresholds like Custodi del Foc at 4). With LIFE_EXPECTANCY=14, a focused gen 1 player will almost certainly lock in both slots.

**Code source**: game.js:286–293 (acquisition check), game.js:416 (succession copy), game.js:38 (createCharacter), game.js:24 (DESTRESA_MAX)

**Verdict**: DESIGN CONCERN
**Severity if bug**: N/A

---

## Dynasty Run: DB-04 — Stat Inheritance Decay to Baseline

**Generation**: 1→5 traced from stat = 5.0 (STAT_MAX)
**Inherited inclination**: N/A

**Key finding**:
The stat inheritance formula at game.js:413:
```js
inheritedStats[k] = parentStats[k] * BRANCH_INHERITANCE_RATE + 1.0 * (1 - BRANCH_INHERITANCE_RATE);
```
Expanded: `stat * 0.65 + 1.0 * 0.35`. This matches the spec exactly.

Decay trace from a maxed stat of 5.0:

| Generation start | Forca (or any stat) | Notes |
|---|---|---|
| Gen 1 (earned) | 5.0 | 14 cycles of grinding forca |
| Gen 2 start | 5.0×0.65 + 0.35 = **3.60** | −1.40 drop |
| Gen 3 start | 3.60×0.65 + 0.35 = **2.69** | −0.91 drop |
| Gen 4 start | 2.69×0.65 + 0.35 = **2.10** | −0.59 drop |
| Gen 5 start | 2.10×0.65 + 0.35 = **1.72** | −0.38 drop |

Steady state: solving `x = x*0.65 + 0.35` → `x = 1.0` (STAT_STARTING_VALUE). Stats always converge to baseline if no generation reinvests.

The output multiplier from stats is `STAT_OUTPUT_FACTOR = 0.15` per point above 1.0 (game.js:22). At gen 5 with stat=1.72, that's only +0.108 output multiplier — negligible. Gen 1's stat investment provides meaningful benefit only in gen 2.

The decay is fast: a maxed stat (5.0) provides meaningful advantage (+0.60 multiplier) only in gen 1; by gen 3 it is down to +0.254 (25.4% output bonus); by gen 5 it is +0.108.

No stat floor exists above 1.0. The formula guarantees convergence to baseline regardless of how high the parent stat was. There is no "dynasty mastery" accumulation effect for stats.

**Code source**: game.js:22 (STAT_OUTPUT_FACTOR), game.js:409–414 (stat inheritance), game.js:130–133 (getStatMultiplier)

**Verdict**: DESIGN CONCERN
**Severity if bug**: N/A

---

## Dynasty Run: DB-05 — Succession Trigger Timing and Action Budget

**Generation**: 1 analyzed for action budget
**Inherited inclination**: fresh (all 0.0)

**Key finding**:
Starting resources: food=15, health=20, cycle=0 (game.js:56–57).
Upkeep per cycle: 1 food (FOOD_UPKEEP) + 1 health (HEALTH_UPKEEP) (game.js:17–18).
Succession triggers when `state.cycle >= LIFE_EXPECTANCY (14) || state.health <= 0` (game.js:329).

At 1 health lost per cycle with no health recovery: health at cycle 14 = 20 - 14 = 6. Health is not the binding constraint; cycle count is the binding constraint in normal play.

**Mandatory succession actions**:
- `act_cercar_parella` (game.js:303): is_base=true, execute_cost=1 food, gives +0.04 sociabilitat. Must be executed once before `act_tenir_fills` is available. Visible immediately (no inclination requirements).
- `act_tenir_fills` (game.js:308): is_base=true, execute_cost=0 food. Available only after hasPartner=true. Must be executed once.

These two actions consume 2 of the 14 cycles = **14.3% of the generation budget** is mandatory.

**Remaining budget**: 12 cycles to:
1. Build inclination to branch threshold (e.g., impuls ≥ 0.30 for Caçador)
2. Earn enough Saber (🧠) to purchase branch-relevant actions
3. Execute those purchased actions to reinforce inclination and grow stats
4. Discover universal techs if cycle milestones are reached

**Inclination budget analysis for Caçador (impuls target +0.30)**:
Starting at 0.0. Best base impuls action: act_espiar_ramat (+0.02 impuls/use, after inertia at 0.0: +0.02/1.0 = +0.02). With inertia at current value growing, rough estimate:
- Cycle 1: impuls ≈ +0.020
- Cycle 2: impuls ≈ +0.039
- Cycle 3: impuls ≈ +0.057
After ~10 uses of act_espiar_ramat: impuls ≈ +0.15–0.18 (inertia increasingly resists)
The delta formula at game.js:73: `deltaEfectiu = 0.02 / (1 + |current| * 2.0)`. At impuls=0.15: 0.02/(1+0.3) = +0.0154. At 0.25: 0.02/(1+0.5) = +0.0133. Reaching +0.30 from scratch with only act_espiar_ramat (+0.02 raw delta) in 12 available cycles is borderline — approximately 15+ uses needed, but only 12 cycles remain after the two family actions.

**The budget is tight for a generation that wants to**: (a) reach branch threshold, (b) purchase branch actions with earned Saber, AND (c) execute succession. Branch-specialized actions (act_cacera_gran at +0.05 impuls) require a branch tech unlock first (bt_cacera_coordinada requires ut_llengua discovered at cycle 2+, plus impuls ≥ 0.15 and sociabilitat ≥ 0.10) — a second-order dependency that takes several more cycles to satisfy.

**Sociabilitat interaction bug for Caçador**: act_cercar_parella pushes sociabilitat +0.04 per use (data.js:124). The Caçador branch requires sociabilitat ≤ 0.30. A player who must do cercar_parella is inadvertently pushing sociabilitat up, working against the Caçador branch upper-bound condition. One use adds +0.04; this is minor, but it is an invisible tension the player has no way to anticipate.

**Code source**: game.js:17–18 (upkeep), game.js:303–311 (family flags), game.js:329 (succession trigger), game.js:56–57 (starting resources), data.js:120–134 (family actions), game.js:73 (applyDelta)

**Verdict**: DESIGN CONCERN
**Severity if bug**: N/A

---

## Dynasty Run: DB-06 — Branch Tech Inheritance Integrity

**Generation**: 1→2 code trace
**Inherited inclination**: N/A

**Key finding**:
Branch tech inheritance at game.js:407:
```js
const inheritedBranchTechs = new Set(state.character.unlockedBranchTechIds);
```
Passed to `createCharacter` at game.js:420, stored as `new Set(inheritedBranchTechs)` at game.js:36.

This is a proper value copy (Set constructor from iterable), not a reference copy. Mutations on the child's set do not affect the parent's set. The inheritance is complete: all unlocked branch techs carry over with no decay.

There are 6 branch techs in data.js: bt_cacera_coordinada, bt_punt_llanca, bt_agulla_os, bt_curar_herbes, bt_pintura_rupestre, bt_figuretes_venus. All 6 would be inherited if unlocked. The `unlockedBranchTechIds` set on the character is the authoritative list (game.js:36); `discoveredUniversalTechIds` on the state object (not the character) is separate and does NOT inherit — it resets to an empty set at succession (game.js:60 shows `new Set()` only in initState, but succession at game.js:418 does not reset it — it persists on the state object untouched).

**Additional finding**: `state.discoveredUniversalTechIds` is on the top-level state object (game.js:61), not on `state.character`. Succession (game.js:395–425) only replaces `state.character` — it does not touch `state.discoveredUniversalTechIds`. Universal tech discoveries therefore **persist across all generations without decay**, which is correct and consistent.

Branch tech unlock check at game.js:161 requires `state.discoveredUniversalTechIds.has(bt.universal_prereq)`. Since universal techs persist, unlocked branch techs also remain valid across generations. The system is internally consistent.

**Code source**: game.js:36 (createCharacter), game.js:61 (discoveredUniversalTechIds on state), game.js:407–420 (succession), game.js:159–165 (getEligibleBranchTechs)

**Verdict**: PASS

---

## Dynasty Run: DB-07 — MAX_GENERATIONS=5 Cliff Behavior

**Generation**: 5 (terminal)
**Inherited inclination**: N/A

**Key finding**:
`triggerSuccession` (game.js:370) checks `state.generation >= MAX_GENERATIONS` (game.js:376) BEFORE checking for heirs.

Wait — the order is:
1. Line 371: if `!state.character.hasChildren` → game over `no_heir`
2. Line 376: if `state.generation >= MAX_GENERATIONS` → game over `max_generations`

So no-heir takes priority. If gen 5 has no children AND hits LIFE_EXPECTANCY, the reason shown is `no_heir`, not `max_generations`.

When gen 5 DOES have children and reaches LIFE_EXPECTANCY, `max_generations` fires. The game over modal text (game.js:1047): "Cinc generacions han passat. El coneixement del teu llinatge queda gravat a les roques." This is a narrative ending, not a victory screen. There is no score summary, no inheritance recap, no "dynasty legacy" display — the game simply stops and offers a restart.

The succession modal (`state.pendingSuccession`) is also never shown for gen 5: `triggerSuccession` sets `state.gameOver = true` without setting `state.pendingSuccession`, so `continueSuccession` is never called and the succession screen is skipped. The player goes directly from playing to game over with no transition summary for the final generation.

The gen 5 character's stats, inclinations, branch techs, and destreses are never displayed in any kind of "dynasty legacy" view — they are simply discarded on restart.

**Code source**: game.js:370–392 (triggerSuccession), game.js:1044–1055 (game over modal text), game.js:376–379 (max_generations check)

**Verdict**: DESIGN CONCERN
**Severity if bug**: N/A

---

## Dynasty Run: DB-08 — Inertia Factor vs. Inclination Ceiling

**Generation**: 1 analyzed for reachable inclination ceiling
**Inherited inclination**: N/A

**Key finding** (incidental — discovered during DB-01/02 analysis):
The `applyDelta` function (game.js:72–74) applies INERTIA_FACTOR=2.0:
```js
const deltaEfectiu = delta / (1 + Math.abs(current) * INERTIA_FACTOR);
```
At impuls = 0.0: a raw delta of +0.05 (act_caca_gran) → +0.050 effective
At impuls = 0.30: +0.05 / (1 + 0.60) = +0.031
At impuls = 0.60: +0.05 / (1 + 1.20) = +0.023
At impuls = 0.80: +0.05 / (1 + 1.60) = +0.019

Reaching +1.0 via gameplay actions requires many more cycles than LIFE_EXPECTANCY=14 provides. Practical ceiling for gen 1 impuls is approximately +0.55–0.65 with a dedicated hunter build. The test-2 "extreme case" (+1.0) is only reachable via the debug dot editor (game.js:1082, which directly sets `state.character.inclination[axis] = INCL_DOT_VALUES[idx]` bypassing applyDelta entirely).

This means DB-02 is not a realistic gameplay concern — it only applies to developer testing. The realistic hunter dynasty (DB-01, gen 1 ending ≈ +0.50–0.60) already loses branch identity by gen 3.

**Code source**: game.js:8 (INERTIA_FACTOR), game.js:72–74 (applyDelta), game.js:1082 (debug dot editor bypass)

**Verdict**: PASS (design is working as intended — inertia prevents runaway extremes)

---

## Summary

- **Total findings**: 8 (bugs: 0 · design concerns: 6 · passes: 2)
- **Blocking issues**: None (no code bugs found — all issues are design balance questions)

### Design Concerns (route to game-designer / economy-designer)

**DC-1 (HIGH)** — Hunter dynasty loses branch identity by gen 3 under realistic play. With gen 1 ending at impuls ≈ +0.55 (achievable), gen 3 starts at +0.232 — below the Caçador threshold of +0.30. The player has no warning before succession that the child will fail the branch condition. Route to: **game-designer**.

**DC-2 (HIGH)** — Destresa lock-in: a gen 1 player who fills both destresa slots (achievable in ~10 of 14 cycles) permanently locks all successors into those same destreses. No generation can ever diverge from gen 1's personal skills. The optimal strategy is to lock this in as early as possible, which is exactly the opposite of "dynasty that evolves." Route to: **game-designer** / **economy-designer**.

**DC-3 (MEDIUM)** — Stat inheritance decays to baseline (1.0) by gen 5 regardless of investment. A fully maxed stat (5.0) is worth only +0.108 output bonus multiplier by gen 5. Dynasty investment in stats provides no long-term compound advantage — only a 1-generation echo. Route to: **economy-designer**.

**DC-4 (MEDIUM)** — Action budget is tight for a first-generation player who wants to: reach branch threshold, purchase branch actions with Saber, and complete succession. 12 free cycles remain after mandatory family actions. For Caçador specifically, act_cercar_parella (mandatory) also pushes sociabilitat +0.04, working against the Caçador upper-bound condition (sociabilitat ≤ 0.30) invisibly. Route to: **game-designer**.

**DC-5 (LOW)** — No succession summary for gen 5: the terminal generation ends abruptly with a game over modal rather than a dynasty legacy view. The accumulated branch techs, destreses, and inclination of the final character are never surfaced. Route to: **game-designer**.

**DC-6 (LOW)** — Branch identity loss has no player-facing signal at succession. The succession modal shows the top axis value but does not compare it against branch thresholds or warn "your heir will not qualify as Caçador." Route to: **game-designer** (UI feedback).

### Passes

**P-1** — Branch tech inheritance is correctly implemented: full copy, no decay, proper Set cloning (not reference copy). Universal tech discoveries persist on `state` (not `state.character`) and correctly survive succession without explicit carry-over logic.

**P-2** — Inertia system works as intended: INERTIA_FACTOR=2.0 prevents inclination runaway and makes the +1.0 extreme case unreachable in normal play. The practical inclination ceiling (~0.6) is well-matched to the 14-cycle life expectancy.

### Dynasty Loop Verdict: PARTIAL

The succession and inheritance mechanics are correctly implemented and bug-free. The core design question ("do gen 1 choices still matter in gen 5?") receives a mixed answer from this trace:

- Branch techs and purchased actions: YES — fully inherited, no decay. Gen 1 choices persist all 5 generations. Strong.
- Branch identity (inclinations): NO — decays below threshold by gen 3 in realistic play. Gen 1's identity does not survive.
- Destreses: OVER-PERSIST — gen 1's destreses lock all successors. Too sticky, not enough evolution.
- Stats: NEGLIGIBLE by gen 5 — no compound advantage.

The system needs either: (a) a higher BRANCH_INHERITANCE_RATE for inclinations (e.g., 0.80) to preserve identity longer, or (b) an explicit mechanic for reinforcing branch identity each generation, or (c) branch thresholds recalibrated to match realistic inherited values. Without one of these, the dynasty fantasy of "gen 1 hunter → gen 5 master hunter" is not achievable.
