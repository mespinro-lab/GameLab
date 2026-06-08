# Branch Emergence Revalidation — 2026-06-08

**Tested against**: `prototypes/bloodline/data.js` + `game.js`
**Changes in scope**: INCLINATION_INHERITANCE_RATE 1.00→0.85 · Místic soc threshold 0.25→0.19 · execute_cost food gate · base deltas ×1.5–2× (prior session)
**Formula**: `applyDelta(c, d) = c + d / (1 + |c| × 2.0)` (INERTIA_FACTOR=2.0)

---

## Q1 — Does gen 2 enter with Caçador active if gen 1 ends at impuls=0.35?

Caçador requires impuls >= 0.22 AND sociabilitat <= 0.30.

| Generation | Inherited impuls | Caçador active? |
|---|---|---|
| Gen 1 end | 0.3500 | YES |
| Gen 2 start | 0.35 × 0.85 = **0.2975** | YES (0.2975 ≥ 0.22) |
| Gen 3 start | 0.2975 × 0.85 = **0.2529** | YES (0.2529 ≥ 0.22) |

Both gen 2 and gen 3 inherit Caçador identity from cycle 0 with no additional actions required. The 0.85 rate preserves branch identity robustly for at least 2 generational handoffs.

---

## Q2 — Dynasty branch decay: 5 generations, zero impuls actions

Starting from gen 1 end at impuls=0.35, applying 0.85 decay each generation:

| Generation start | Impuls | Caçador? |
|---|---|---|
| Gen 2 | 0.2975 | YES |
| Gen 3 | 0.2529 | YES |
| Gen 4 | 0.2149 | **NO** (< 0.22) |
| Gen 5 | 0.1827 | NO |
| Gen 6 | 0.1552 | NO |

**Finding**: A dynasty that does ZERO impuls actions loses Caçador identity at gen 4. This is exactly the intended design signal — identity must be actively maintained, but it is not stripped overnight. Three generations of passive play before loss is a reasonable inertia window. No design concern here.

---

## Q3 — All 4 branches achievable from neutral (fresh start, no inheritance)?

Traced minimum-action paths using pure axis-focused base actions only.

**Caçador** — repeat `act_espiar_ramat` (impuls +0.05):
Impuls values: 0.050 → 0.095 → 0.137 → 0.177 → 0.214 → **0.249** (action 6 ≥ 0.22)
Sociabilitat stays at 0, well under 0.30 cap. **Branch emerges at action 6.**

**Recol·lector** — repeat `act_recollectar_arrels` (intel·lecte +0.04, impuls −0.03):
Intel·lecte: 0.040 → 0.077 → 0.112 → 0.144 → **0.175** (action 5 ≥ 0.15)
Impuls: −0.030 → −0.058 → −0.085 → −0.111 → −0.135 (well ≤ 0.10). **Branch emerges at action 5.**

**Artesà** — repeat `act_tallar_pedra` (intel·lecte +0.05, impuls −0.03):
Intel·lecte: 0.050 → 0.095 → 0.137 → 0.177 → **0.214** (action 5 ≥ 0.18)
Impuls: −0.030 → −0.058 → −0.085 → −0.111 → −0.135 (well ≤ 0.20). **Branch emerges at action 5.**

**Místic** — repeat `act_contemplacio` (espiritualitat +0.08, sociabilitat +0.04). No ut_foc required.
Espiritualitat: 0.080 → 0.149 → 0.211 → **0.267** (action 4 ≥ 0.22)
Sociabilitat with mixed `act_cercar_parella` (soc +0.06) cross-path reaches ≥ 0.19 at action 5.
Pure contemplació only: sociabilitat reaches ≥ 0.19 at action 6. **Branch emerges at action 5–6.**

**All 4 branches are reachable from neutral in 5–6 focused actions. No dead zones found.**

---

## Summary verdict

| Question | Result |
|---|---|
| Gen 2 Caçador active at cycle 0? | YES — impuls 0.2975 ≥ threshold 0.22 |
| Gen 3 Caçador active at cycle 0? | YES — impuls 0.2529 ≥ threshold 0.22 |
| Branch lost after 5 zero-action gens? | Lost at gen 4 (not gen 2 or 3) — expected, by design |
| All 4 branches reachable from neutral? | YES — all in 5–6 actions |
| Any branch with dead zone? | NO |

The 0.85 inheritance rate is well-calibrated. It preserves identity for two full generational handoffs, creates meaningful decay pressure without punishing casual play in the short run, and does not lock any branch behind the early game. The lowered Místic sociabilitat threshold (0.19) closes the previously identified gap and makes that branch reachable without ut_foc dependency.

**No blocking issues found. Branch emergence timing validated.**
