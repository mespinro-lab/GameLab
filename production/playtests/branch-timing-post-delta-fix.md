# Branch Timing Analysis — Post Delta Fix
**Date:** 2026-06-07
**Analyst:** branch-path-analyst
**Prototype:** prototypes/bloodline/
**Hypothesis:** Do the increased inclination deltas bring first branch activation into the 4–6 action target window?

---

## Parameters Used

| Constant | Value |
|---|---|
| INERTIA_FACTOR | 2.0 |
| FADE_MARGIN | 0.05 |
| Formula | `new = current + delta / (1 + |current| * 2.0)` |
| ERA_CYCLES | 100 |
| LIFE_EXPECTANCY | 20 |

Branch thresholds (from BRANCHES, post ×0.73 playtest reduction):

| Branch | Condition A | Condition B | Operator |
|---|---|---|---|
| Caçador | impuls >= 0.22 | sociabilitat <= 0.30 | AND |
| Recol·lector | impuls <= 0.10 | intel·lecte >= 0.15 | AND |
| Artesà | intel·lecte >= 0.18 | impuls <= 0.20 | AND |
| Místic | espiritualitat >= 0.22 | sociabilitat >= 0.25 | AND |

---

## Arc 1 — Pure Single-Action Runs (Zero to First Branch)

### Branch: Caçador — pure espiar_ramat (impuls +0.05, intel +0.03)

sociabilitat stays at 0.0, so condition `soc <= 0.30` is always satisfied.
Threshold: impuls >= 0.22.

| Action # | impuls value | Branch active? |
|---|---|---|
| 0 (start) | 0.00000 | NONE |
| 1 | 0.05000 | NONE |
| 2 | 0.09545 | NONE |
| 3 | 0.13744 | NONE |
| 4 | 0.17666 | NONE |
| 5 | 0.21361 | NONE |
| 6 | 0.24864 | **Caçador ACTIVE** |

**First branch at action 6.** Target is 4–6. This is at the boundary — acceptable but tight.

### Branch: Recol·lector — pure recollectar_arrels (impuls -0.03, intel +0.04, soc +0.03)

impuls goes negative immediately, so `impuls <= 0.10` is satisfied from action 1.
Threshold: intel·lecte >= 0.15.

| Action # | intel·lecte value | Branch active? |
|---|---|---|
| 0 (start) | 0.00000 | NONE |
| 1 | 0.04000 | NONE |
| 2 | 0.07704 | NONE |
| 3 | 0.11170 | NONE |
| 4 | 0.14440 | NONE |
| 5 | 0.17544 | **Recol·lector ACTIVE** |

**First branch at action 5.** Target is 4–6. This is inside the window.

### Branch: Artesà — pure tallar_pedra (impuls -0.03, intel +0.05)

impuls goes negative, so `impuls <= 0.20` is satisfied immediately.
Threshold: intel·lecte >= 0.18.

| Action # | intel·lecte value | Branch active? |
|---|---|---|
| 0 (start) | 0.00000 | NONE |
| 1 | 0.05000 | NONE |
| 2 | 0.09545 | NONE |
| 3 | 0.13744 | NONE |
| 4 | 0.17666 | NONE |
| 5 | 0.21361 | **Artesà ACTIVE** |

**First branch at action 5.** Target is 4–6. Inside the window.

### Branch: Místic — pure contemplacio (espit +0.08, soc +0.04)

Both axes pushed simultaneously. BOTH espit >= 0.22 AND soc >= 0.25 must be met.
The bottleneck is sociabilitat (smaller delta, higher threshold relative to its delta).

espiritualitat trace:
| Action # | espiritualitat | Condition met? |
|---|---|---|
| 1 | 0.08000 | No |
| 2 | 0.14897 | No |
| 3 | 0.21061 | No |
| 4 | 0.26690 | YES (>= 0.22) |

sociabilitat trace:
| Action # | sociabilitat | Condition met? |
|---|---|---|
| 1 | 0.04000 | No |
| 2 | 0.07704 | No |
| 3 | 0.11170 | No |
| 4 | 0.14440 | No |
| 5 | 0.17544 | No |
| 6 | 0.20505 | No |
| 7 | 0.23342 | No |
| 8 | 0.26069 | YES (>= 0.25) |

**First branch at action 8.** This is OUTSIDE the 4–6 target window. The sociabilitat threshold (0.25) is structurally too high relative to the delta that contemplacio applies (+0.04). Espiritualitat is already satisfied by action 4, but the player must wait 4 more actions before the branch appears. This is the only branch that misses the target.

---

## Branch Timing Summary

| Branch | Key Action | Target Delta | Threshold | First Active (Action #) | In 4–6 Window? |
|---|---|---|---|---|---|
| Caçador | espiar_ramat | impuls +0.05 | 0.22 | 6 | YES (boundary) |
| Recol·lector | recollectar_arrels | intel +0.04 | 0.15 | 5 | YES |
| Artesà | tallar_pedra | intel +0.05 | 0.18 | 5 | YES |
| Místic | contemplacio | espit +0.08 / soc +0.04 | 0.22 / 0.25 | 8 | NO — 2 actions late |

---

## Arc 2 — Inertia Feel

### Pure Axis Pump: espiar_ramat x14 (impuls, delta +0.05)

| Action # | impuls value | Incremental gain |
|---|---|---|
| 1 | 0.05000 | +0.05000 |
| 2 | 0.09545 | +0.04545 |
| 3 | 0.13744 | +0.04199 |
| 4 | 0.17666 | +0.03922 |
| 5 | 0.21361 | +0.03695 |
| 6 | 0.24864 | +0.03503 |
| 7 | 0.28204 | +0.03340 |
| 8 | 0.31401 | +0.03197 |
| 9 | 0.34472 | +0.03071 |
| 10 | 0.37431 | +0.02959 |
| 11 | 0.40291 | +0.02860 |
| 12 | 0.43060 | +0.02769 |
| 13 | 0.45747 | +0.02687 |
| 14 | 0.48359 | +0.02612 |

**14-action ceiling with pure focus: ~0.484.** The curve decelerates smoothly and asymptotically. Incremental gain drops from +0.050 to +0.026 over 14 actions — a 48% reduction in per-action gain. The resistance feels like natural diminishing returns, not arbitrary cutoff. The curve is legible and communicates "you are approaching your identity ceiling" rather than a hard wall.

### Direction Switch: push impuls to +0.374 (10 espiar_ramat), then reverse with tallar_pedra (impuls -0.03)

From impuls = 0.374, applying tallar_pedra repeatedly:

| Reverse # | impuls value |
|---|---|
| 0 (start of switch) | 0.37431 |
| 5 | 0.28489 |
| 10 | 0.18417 |
| 15 | 0.06643 |
| 17 | 0.01216 |
| 18 | -0.01713 (zero crossed) |

**18 reverse actions to cross zero from impuls ~0.374.** The inertia formula makes reversal slow and deliberate. From the player's perspective: identity built over 10 actions takes 18 to undo. This feels "sticky" — identity is preserved under mild pressure. A player would need to make 18 consecutive anti-Caçador choices to neutralise an established Caçador inclination. This is intentional and positive for bloodline identity, but could feel punishing if a player wants to pivot branches mid-life (a 20-cycle character has fewer than 18 turns remaining after action 10).

---

## Arc 3 — Branch Co-existence

To find the maximum simultaneous active branches, we need to satisfy all four branch conditions at once. Examining the overlap:

- Caçador needs: impuls >= 0.22, soc <= 0.30
- Recol·lector needs: impuls <= 0.10, intel >= 0.15
- Artesà needs: intel >= 0.18, impuls <= 0.20
- Místic needs: espit >= 0.22, soc >= 0.25

Caçador requires impuls >= 0.22. Recol·lector requires impuls <= 0.10. These are mutually exclusive — no game state can simultaneously satisfy both. Caçador + Recol·lector is IMPOSSIBLE.

Similarly, Caçador (impuls >= 0.22) + Artesà (impuls <= 0.20): IMPOSSIBLE — impuls cannot be both >= 0.22 and <= 0.20.

Possible simultaneous combinations:
- **Recol·lector + Artesà**: impuls <= 0.10 (satisfies both), intel >= 0.18. POSSIBLE. This is the clearest hybrid state.
- **Recol·lector + Místic**: impuls <= 0.10, intel >= 0.15, espit >= 0.22, soc >= 0.25. POSSIBLE.
- **Artesà + Místic**: intel >= 0.18, impuls <= 0.20, espit >= 0.22, soc >= 0.25. POSSIBLE.
- **Recol·lector + Artesà + Místic**: impuls <= 0.10, intel >= 0.18, espit >= 0.22, soc >= 0.25. POSSIBLE. This is the maximum: 3 branches.
- Caçador can only combine with Místic (impuls >= 0.22, soc must be >= 0.25 but Místic has no conflict with Caçador's impuls). However Caçador requires soc <= 0.30 and Místic requires soc >= 0.25. This combination requires 0.25 <= soc <= 0.30 — a narrow band, but POSSIBLE.

**Maximum achievable: 3 simultaneous branches (Recol·lector + Artesà + Místic).**

The impuls axis acts as the primary branch discriminator: negative impuls opens the intellectual/spiritual cluster; positive impuls gates the Caçador. This structure makes multi-branch activation feel intentional — a player leaning anti-impuls can build a rich triple identity, while the Caçador path is a distinct singular fork.

---

## Arc 4 — FADE and HIDDEN Transitions

FADE_MARGIN = 0.05 (from data.js, line 50).

Only one action currently has `inclination_requirements`: **act_recollecta_avancada** (intel·lecte min: 0.15).

Transition points for act_recollecta_avancada:
- ACTIVE: intel >= 0.15
- FADED: 0.10 <= intel < 0.15 (margin zone = 0.05 wide)
- HIDDEN: intel < 0.10

Using the Recol·lector pure-pump trace:
| Action # | intel value | Visibility |
|---|---|---|
| 0 | 0.00000 | HIDDEN |
| 1 | 0.04000 | HIDDEN |
| 2 | 0.07704 | HIDDEN |
| 3 | 0.11170 | FADED (0.10–0.15 zone) |
| 4 | 0.14440 | FADED (0.10–0.15 zone) |
| 5 | 0.17544 | ACTIVE |

The FADED zone spans actions 3 and 4 — a 2-action warning window. This is narrow but functional: the player sees the action approaching before it unlocks. However, since this action requires purchase (from the shop), the FADED signal may appear before the player can afford it, which is actually positive UX — it signals what to invest toward.

There is no mid-use-disappearance risk for this action. Once intel crosses 0.15 and the action is active, the inertia formula means the axis decelerates slowly. To drop back below 0.15, the player would need to spam actions with large negative intel deltas (only explorar_voltants has intel -0.02). The return path is extremely slow, making mid-run loss of access to this action practically impossible.

**Concern:** FADE_MARGIN of 0.05 is narrow relative to the small deltas in play (0.03–0.08). A single action step often moves 0.03–0.04 on an axis. The margin covers roughly 1–2 action steps before activation, which is minimal but present. No actions are at risk of disappearing unexpectedly mid-use.

---

## Arc 5 — Branch Tech Emergence Timing

For each SKILL_DEF: minimum actions to reach inclination threshold from neutral, plus the universal_prereq cycle gate.

Notation: "incl actions" = minimum pure-pump actions to satisfy inclination conditions from zero.
"prereq cycle" = era cycle at which the universal tech auto-discovers.
"window" = ERA_CYCLES (100) - prereq_cycle - incl_actions (approximate earliest eligible cycle).

| Skill | prereq | prereq cycle | Key inclination condition | Min incl actions | Earliest eligible cycle | Window (to cycle 100) |
|---|---|---|---|---|---|---|
| bt_punta_llanca | ut_eines | 16 | impuls >= 0.25 | 6 | 22 | 78 |
| bt_rasclador_fi | ut_eines | 16 | intel >= 0.20 OR impuls <= 0.10 | 5 (intel) or 1 (impuls negative) | 17–21 | 79–83 |
| bt_buri | ut_eines | 16 | intel >= 0.25 AND impuls <= 0.20 | 7 (intel is bottleneck) | 23 | 77 |
| bt_agulla_os | ut_vestimenta | 50 | intel >= 0.20 AND impuls <= 0.20 | 5 | 55 | 45 |
| bt_trampes | ut_corda | 65 | impuls >= 0.10 | 3 | 68 | 32 |
| bt_guariment_plantes | ut_foc | 10 | espit >= 0.25 AND soc >= 0.20 | 4 (espit) + 6 (soc bottleneck) = 6 combined | 16 | 84 |
| bt_pintura_rupestre | ut_art | 36 | espit >= 0.30 AND soc >= 0.20 | 5 (espit) + 6 (soc) = 6 combined | 42 | 58 |
| bt_marques_territori | ut_art | 36 | impuls >= 0.20 AND intel >= 0.05 | 5 (impuls) + 1 (intel) = 5 combined | 41 | 59 |
| bt_ornaments | ut_art | 36 | espit >= 0.20 OR soc >= 0.25 | 3 (espit) or 8 (soc) = 3 (OR, take easier) | 39 | 61 |
| bt_coneixement_plantes | ut_corda | 65 | intel >= 0.10 AND impuls <= 0.20 | 3 (intel) + impuls trivially negative | 68 | 32 |
| bt_calendari_natural | ut_ceramica | 80 | espit >= 0.20 AND soc >= 0.10 | 3 (espit) + 3 (soc) = 3 combined | 83 | 17 |
| bt_llavor_selectiva | ut_ceramica | 80 | intel >= 0.10 AND impuls <= 0.20 | 3 | 83 | 17 |
| bt_domini_terra | ut_ceramica | 80 | impuls >= 0.10 OR soc >= 0.10 | 3 | 83 | 17 |

**Techs with window under 3 cycles:** None — the tightest windows are 17 cycles (the three ceramica-gated techs). These are still accessible but represent late-era specialization only; a player would need to be actively pursuing those inclination axes well before cycle 80.

**Techs with very tight timing relative to character lifespan (LIFE_EXPECTANCY = 20 cycles):** The ceramica techs (cycle 80) become available in era-cycle terms, but within a single character's 20-cycle lifespan, these are impossible from generation 1. By generation 5 (era cycle ~80), a character born at cycle 80 has 20 cycles — sufficient to build intel/espit/soc to threshold and benefit from the tech. Inclination inheritance at 100% means preceding generations pre-build the inclination, so the gen-5 character starts already eligible if the bloodline was consistent.

---

## Arc Report: 1 — Zero to First Branch

**Hypothesis tested:** Do the updated deltas bring first branch emergence into the 4–6 action window?

**Action sequences traced:** 4 pure-axis runs (one per branch)

**Key finding:** Three of four branches (Recol·lector, Artesà, Caçador) activate within the 4–6 window. Místic is the outlier, activating at action 8 due to sociabilitat's 0.25 threshold combined with a +0.04 delta — the axis gains too slowly relative to the threshold.

**Dead zones found:** NO — all four branches are reachable from neutral. No inclination state makes a branch permanently inaccessible.

**Verdict:** NATURAL for three branches, AWKWARD for Místic.

**Design concern:** The Místic branch's sociabilitat threshold (0.25) is disproportionately high relative to the delta available from its primary action (contemplacio soc +0.04). Even running contemplacio exclusively, the player must wait until action 8. The fix options are: (A) lower the soc threshold from 0.25 to 0.18–0.20 — this would bring Místic to action 5–6; (B) add a small soc delta to a second easily-accessible action (e.g., act_vigilar_campament already has soc +0.04, but a player pursuing the Místic path may not naturally use it); (C) slightly increase contemplacio's soc delta from +0.04 to +0.06. Option A is cleanest — it changes one number in the BRANCHES data and costs nothing in action design.

---

## Arc Report: 2 — Inertia Feel

**Hypothesis tested:** Does the inertia formula produce resistance that feels natural and communicates identity persistence?

**Action sequences traced:** 2 (14-action pump; 18-action reversal)

**Key finding:** The 14-action ceiling of ~0.484 is well within bounds — the axis never locks at 1.0 and keeps advancing, but with diminishing returns that a player can feel. Reversal from +0.374 takes 18 actions to cross zero — this is strongly "sticky." For a 20-cycle character life, this means pivoting identity mid-life is functionally impossible if 10+ cycles have been spent in one direction.

**Dead zones found:** NO

**Verdict:** NATURAL for identity preservation. AWKWARD for players who want to pivot branches intentionally within one life (the reversal cost exceeds typical remaining lifespan).

**Design concern:** The stickiness is by design for bloodline continuity, but within a single character's 20-cycle life, a player who "makes a mistake" in the first 10 actions has no way to correct their branch. The succession system (inclination inherits at 100%) means errors propagate to children. Consider adding a narrative event or explicit mechanic that allows partial inclination reset once per life ("rite of change"), or document in the game's design intent that in-life identity is permanent — only new generations can shift the bloodline.

---

## Arc Report: 3 — Branch Co-existence

**Hypothesis tested:** Is multi-branch activation intentional (hybrid identity) or diluted noise?

**Action sequences traced:** Analytical — all pairwise and triple combinations examined.

**Key finding:** The impuls axis acts as a hard discriminator. Caçador (impuls >= 0.22) is structurally isolated from Recol·lector and Artesà (which both need impuls <= 0.10 or 0.20). The intellectual-spiritual cluster (Recol·lector + Artesà + Místic) can all activate simultaneously at impuls <= 0.10, intel >= 0.18, espit >= 0.22, soc >= 0.25. This triple combination is achievable and feels like a coherent "wise gatherer-mystic" identity.

**Dead zones found:** NO

**Verdict:** NATURAL — multi-branch activation is coherent, not diluted. The impuls axis cleanly separates hunter identity from the rest.

---

## Arc Report: 4 — FADE and HIDDEN Transitions

**Hypothesis tested:** Does the FADE_MARGIN give adequate warning before action disappearance?

**Action sequences traced:** 1 (act_recollecta_avancada, the only action with inclination_requirements)

**Key finding:** FADE_MARGIN = 0.05 provides a 2-action warning window for the only conditional action in the current dataset. No actions can disappear unexpectedly mid-use due to the high reversal cost of inclination axes.

**Dead zones found:** NO

**Verdict:** NATURAL — no mid-use disappearance risk. However, only one action currently uses inclination_requirements, so this arc is under-tested. The margin may become too narrow as more conditional actions are added in future eras.

**Design concern:** As content expands to Era 2+, each new inclination_requirements action should be evaluated with this same trace. FADE_MARGIN of 0.05 is adequate given current deltas (0.03–0.08 per action), but if Era 2 introduces higher-delta actions, a margin revisit may be needed.

---

## Arc Report: 5 — Branch Tech Emergence Timing

**Hypothesis tested:** Are branch techs discoverable within a reasonable window relative to their prereq cycle?

**Action sequences traced:** 13 (all SKILL_DEFs)

**Key finding:** No branch tech has a window under 3 cycles. All techs gated behind ut_foc (cycle 10), ut_eines (cycle 16), ut_art (cycle 36) have generous windows (45–84 cycles). The late-era ceramica techs (cycle 80) have 17-cycle windows — tight but not broken, since inclination is inherited at 100% and prior generations pre-build the axis values.

**Dead zones found:** NO

**Verdict:** NATURAL — timing is well-spaced across the era. The ceramica techs are appropriately endgame.

---

## Core Loop Hypothesis Assessment

**Question:** Does inclination → branch → action → succession feel natural?

**Evidence FOR:**
- Three of four branches activate within the 4–6 action target window (Caçador: 6, Recol·lector: 5, Artesà: 5)
- The inertia curve decelerates smoothly — no arbitrary wall, visible as diminishing returns
- No branch is unreachable from neutral — all four are accessible
- Branch co-existence is coherent: the impuls axis cleanly discriminates hunter from the intellectual-spiritual cluster
- No action can disappear mid-use due to inclination reversal cost
- No branch tech has a window under 3 cycles — all discovery windows are generous
- Inclination inheritance at 100% makes bloodline identity self-reinforcing — each generation starts closer to branch eligibility

**Evidence AGAINST:**
- Místic activates at action 8 (target: 4–6) — the sociabilitat threshold of 0.25 is too high for its contemplacio delta (+0.04); player experiences a 2-action "dead waiting period" where espiritualitat is already qualifying but the branch hasn't appeared
- Direction reversal (identity pivot) from an established inclination (~+0.374) takes 18 reverse actions to cross zero — within a 20-cycle character life, mid-life branch pivot is structurally impossible
- FADE_MARGIN = 0.05 provides only a 2-action warning window and is not stress-tested beyond the single existing inclination_requirements action
- Caçador activates at the boundary of the target window (action 6) — one more delta reduction on impuls would push it outside

**Verdict:**
PARTIAL: The core mechanism works for three of four branches. The Místic branch has a structurally late activation caused by the mismatch between sociabilitat threshold (0.25) and contemplacio's soc delta (+0.04). **Recommended fix before proceeding to Godot migration:** lower the Místic sociabilitat threshold from 0.25 to 0.19–0.20 in the BRANCHES array. This is a single-line data change that would bring Místic into the window at action 6–7 without touching action design or the inertia formula.

The identity-stickiness finding (18 actions to reverse) is a design property, not a bug — it should be explicitly documented in the GDD as intentional bloodline permanence. A deliberate "rite of change" mechanic would be a worthy addition in production if the team wants to support in-life identity exploration.
