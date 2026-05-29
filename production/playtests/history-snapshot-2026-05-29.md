# Playtest History Snapshot — 2026-05-29

## Coverage
- Reports analysed: 7 (consolidated report + 6 agent sub-reports; summary.md excluded per CI-failed status)
- Date range: 2026-05-29 → 2026-05-29
- Sessions: 1 (first LT2 playtest)
- Systems tested: Core loop (inclination → branch → action → succession), food/health survival, event discovery, universal techs, branch techs, succession/inheritance, dynasty multi-gen progression, mobile UX, onboarding/new-player UX, optimizer/exploit surface

---

## Open Issues

### S1 — Critical

| ID | Title | First seen | Agents |
|----|-------|-----------|--------|
| FOOD-01 | Food goes negative in event discovery resolution (`game.js:356` missing `Math.max` clamp) | 2026-05-29 | playtester-tycoon |
| SUCC-01 | Health and food not reset on succession — new generation inherits dying state, chains into immediate game-over | 2026-05-29 | playtester-tycoon |
| GATE-01 | Universal techs require player button click — permanently lockable by inaction; silently blocks all branch tech access | 2026-05-29 | playtester-speed-runner |

### S2 — Major

| ID | Title | First seen | Agents |
|----|-------|-----------|--------|
| SABER-01 | Saber (materials) not reset on succession — economic progression collapses from gen 2 onward | 2026-05-29 | playtester-optimizer |
| DISC-01 | Discovery action (`performDiscoveryAction`) advances cycle without applying food/health upkeep | 2026-05-29 | playtester-tycoon, playtester-speed-runner |
| EVENT-01 | `is_single_use` discovery events repeat indefinitely when declined — narrative breaks + minor food farm | 2026-05-29 | playtester-tycoon, playtester-optimizer |
| FADE-01 | `FADE_MARGIN` is 0.10 in code; spec says 0.05 — false affordance on inclination-gated actions | 2026-05-29 | playtester-tycoon |
| TOUCH-01 | Zone filter tabs (~20 px) and action buttons (~19 px) below 44 px touch minimum on mobile | 2026-05-29 | playtester-casual-mobile |
| IMMO-01 | Two independent paths to permanent health immunity (`act_gran_ritual` net +1/cycle; `act_curar_grup` net +8/cycle) | 2026-05-29 | playtester-optimizer |
| DEBUG-01 | Inclination dot editor live in player-facing UI — bypasses all inertia and trivializes every progression gate | 2026-05-29 | playtester-tycoon, playtester-optimizer |

### S3 — Minor

| ID | Title | First seen | Agents |
|----|-------|-----------|--------|
| RENDER-01 | FADED rejection in `executeAction` does not call `render()` — stale UI on rejection | 2026-05-29 | playtester-tycoon |
| WARN-01 | Health=0 death path has no escalating warning before sudden game-over modal | 2026-05-29 | playtester-casual-mobile |
| RUSH-01 | Succession achievable at cycle 2 with zero content engagement (`cercar_parella` + `tenir_fills` have no prereqs) | 2026-05-29 | playtester-speed-runner |
| DEAD-01 | Recol·lector branch active by default at game start, has zero branch techs — visible dead end | 2026-05-29 | playtester-optimizer, playtester-speed-runner |
| ALIGN-01 | `bt_agulla_os` (Craftsman tech) unlockable before the Artesà branch label activates — branch identity misaligned | 2026-05-29 | playtester-speed-runner |
| GATE-02 | `bt_cacera_coordinada` and `bt_figuretes_venus` unreachable via inclination-building in gen 1 (require 18–20 cycles vs. LIFE_EXPECTANCY=14) | 2026-05-29 | playtester-speed-runner |
| PACE-01 | Pacing dead zones at cycles 0–2 (no branch feedback) and 12–14 (no new content in most routes) | 2026-05-29 | playtester-speed-runner |
| DYN-01 | Hunter dynasty loses Caçador branch identity by gen 3 under realistic play (BRANCH_INHERITANCE_RATE=0.65 too aggressive) | 2026-05-29 | playtester-dynasty-builder |
| DYN-02 | Destresa lock-in: gen 1 choices permanently freeze both destresa slots for all successors | 2026-05-29 | playtester-dynasty-builder |
| DYN-03 | `act_cercar_parella` (mandatory succession action) silently pushes sociabilitat against Caçador's upper-bound condition | 2026-05-29 | playtester-dynasty-builder |
| DYN-04 | No dynasty legacy view at gen 5 — game ends abruptly with no summary of accumulated dynasty data | 2026-05-29 | playtester-dynasty-builder |
| OPT-01 | Inclination axis reversal mathematically impossible in 14 cycles — over-specialization is irreversible for 2–3 gens | 2026-05-29 | playtester-optimizer |

### S4 — Trivial

| ID | Title | First seen | Agents |
|----|-------|-----------|--------|
| TRV-01 | Generation counter code-reading confusion (no player-facing defect) | 2026-05-29 | playtester-tycoon |
| TRV-02 | `ev_desc_herbes` discovery costs zero food — inconsistent with all other discovery options | 2026-05-29 | playtester-optimizer |
| TRV-03 | Succession modal uses English loanword "stats" — UI elsewhere uses "Atributs" | 2026-05-29 | playtester-new-player |
| TRV-04 | Universal tech health bonuses (`ut_eines_pedra` +2, `ut_foc` +3) act as player-controlled pocket heals rather than passive rewards (downstream of GATE-01) | 2026-05-29 | playtester-optimizer |

---

## Resolved Since Last Snapshot
None — this is the first LT2 playtest session.

---

## Recurring Patterns

Issues flagged independently by 2 or more agents:

- **Debug dot editor in production UI (DEBUG-01)**: Both `playtester-tycoon` and `playtester-optimizer` independently identified the inclination dot editor as live and unguarded. The tycoon auditor found it as a code invariant concern; the optimizer confirmed it as the single exploit that trivializes every other finding. Also noted (as a confusion source) by `playtester-new-player`. Three agents, one unguarded listener.

- **Discovery upkeep bypass (DISC-01)**: `playtester-tycoon` found it via code audit of `performDiscoveryAction`; `playtester-speed-runner` confirmed it via a documented speed route (SR-01, cycle 10 free cycle). Both flag it as an asymmetry with every other cycle-advancing code path.

- **Single-use events repeat on decline (EVENT-01)**: `playtester-tycoon` found it as an invariant failure in `getEligiblePoolEvents`; `playtester-optimizer` documented it as a food-farming exploit (OPT-10). Both traced the same root cause: `is_single_use` is never checked at draw time, only at discovery time.

- **Recol·lector is a dead branch (DEAD-01 / OPT-09)**: `playtester-optimizer` and `playtester-speed-runner` both independently reached the same finding — the branch activates by default at game start, deactivates as soon as any axis moves, and has zero associated branch techs. It is a label with no mechanical payoff.

- **Mobile touch targets below minimum (TOUCH-01)**: `playtester-casual-mobile` documented all three failure points (filter tabs, Executar/Aprendre buttons, inclination dots) with measured pixel values. `playtester-new-player` corroborated the confusion from the inclination dot area. Both flagged the profile panel as scrolling off-screen on mobile.

---

## Loop Hypothesis Status

> Core question: "Does inclination → branch → action → succession feel natural across generations?"

- **Evidence FOR**:
  - Branch tech and purchased action inheritance is correctly implemented (full Set copy, no decay, no reference aliasing — confirmed by `playtester-dynasty-builder` DB-06 and `playtester-tycoon` data cross-reference pass).
  - Universal tech discoveries persist across successions on `state` (not `state.character`) — correct and consistent.
  - Inertia system (INERTIA_FACTOR=2.0) prevents inclination runaway and makes the realistic gen 1 ceiling ~0.55–0.65, well-matched to LIFE_EXPECTANCY=14.
  - The `bt_agulla_os` unlock route via 9× `tallar_pedra` is mechanically coherent and completable in a normal run (SR-01 speed route confirms cycle 10 achievable).
  - All data cross-references pass: action IDs, event pool IDs, and universal prereqs are all valid with no dangling references.

- **Evidence AGAINST**:
  - Three S1 blockers mean a normal player cannot experience the loop honestly before hitting a crash or silent lock: FOOD-01 (food corruption), SUCC-01 (succession chain game-over), GATE-01 (universal tech button never clicked → all branch techs locked forever).
  - Health pressure — the urgency driver behind succession decisions — is defeated by IMMO-01 from gen 1 (single zero-inclination-requirement upgrade yields net +1 health/cycle).
  - Economic pressure collapses from gen 2 via SABER-01 (Saber carry-over) and stat inheritance acceleration (OPT-05 — only 7 actions needed to re-max a stat in gen 2).
  - Branch identity does not survive: a realistic gen 1 hunter (impuls ≈ +0.55) loses Caçador status at gen 3 start (+0.232 < threshold 0.30) with no player warning.
  - Destresa system over-persists: gen 1 locks all 5 generations into the same two destresas, preventing dynasty evolution.
  - Stat investment provides no compound dynasty advantage — all stats converge to baseline by gen 5.

- **Verdict**: PARTIAL — The mechanical skeleton is correctly implemented and internally consistent, but four of five loop fronts (survival pressure, economic tension, branch identity persistence, dynasty evolution) are broken by a combination of bugs and balance issues. The loop cannot be honestly evaluated until S1 bugs are fixed and the debug editor is gated.

---

## Recommended Priorities

1. **Fix the S1 trio** (`gameplay-programmer`): FOOD-01 (one-line clamp at `game.js:356`), SUCC-01 (reset health/food in `continueSuccession`), GATE-01 (auto-apply universal techs on cycle advance, or force a modal). These three are the minimum required to run any honest playtest session — all other findings are downstream of these.

2. **Gate the debug dot editor** (`gameplay-programmer` + `qa-lead`): Add `DEBUG_MODE = false` and guard the inclination dot-click listener. Every exploit finding from `playtester-optimizer` assumes this tool is absent; with it active, all playtest data is meaningless. This is a single constant + conditional and unblocks all future playtests.

3. **Fix Saber carry-over and discovery upkeep** (`gameplay-programmer`): SABER-01 (reset `state.materials` in `continueSuccession`) and DISC-01 (add upkeep deductions in `performDiscoveryAction`). Both collapse economic and survival pressure from gen 2 onward; both are targeted single-function fixes.

4. **Fix EVENT-01** (`gameplay-programmer`): Track fired single-use events in state; filter at draw time in `getEligiblePoolEvents`. Repeated narrative events will break every future playtest session regardless of other fixes.

5. **Design review: branch inheritance rate and thresholds** (`game-designer` + `economy-designer`): With S1 fixes in place, run a targeted dynasty sweep. The core design question — "does gen 1 identity persist to gen 5?" — requires raising BRANCH_INHERITANCE_RATE for inclinations (current 0.65 → consider 0.80), recalibrating branch thresholds to match realistic inherited values, and addressing destresa lock-in (decay 1 slot on succession, or add branch-aligned slots). These are the tuning decisions that determine whether the dynasty fantasy is achievable.

6. **Mobile UX pass** (`ui-programmer` + `ux-designer`): TOUCH-01 (filter tabs + action buttons to 44 px), top-bar wrapping at 360 px (CM-19), profile panel scroll-off-screen (CM-20), and the succession modal "stats" → "atributs" rename (TRV-03) are a coherent single-session batch. Onboarding copy gaps (NP-01, NP-03, NP-05, NP-06) should accompany this pass to reduce first-session confusion from new and casual players.
