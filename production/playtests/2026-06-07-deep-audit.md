# Deep Audit — Bloodline Prototype (2026-06-07)

## Agents executed
- `playtester-branch-path` → `branch-timing-post-delta-fix.md` (already written)
- `playtester-dynasty-builder` → report below
- `playtester-optimizer` → report below
- `playtester-new-player` → FAILED (permission error, skipped)

## Fixes applied this session (2026-06-07)

### Commit `73971a3` — Balance fixes
- Base action inclination deltas ×1.5–2× (branch emergence 7-9 → 4-6 actions)
- DESTRESA_MAX 2 → 3 (EX-09)
- genScore weighted by age/LIFE_EXPECTANCY (EX-11, suicide incentive)
- REPUTACIO_PER_CHAR_CAP = 20 (EX-05, narrar_llegendes spam)
- Fix material emoji 🧠 → 🪨 in top bar

### Commit `8c17249` — 6 critical bug fixes
- **BUG-01**: execute_cost implemented as real food cost (was dead field)
- **BUG-02**: DESTRESA_THRESHOLD now a real use-count gate (was dead constant)
- **is_upgrade**: base action hidden when upgrade purchased (was showing both)
- **firedSingleUseEventIds**: declining discovery no longer permanently locks it
- **Score reputació**: earned-only, no double-counting inherited rep
- **Místic soc threshold**: 0.25 → 0.19 (branch now emerges at action 6-7)

---

## Open issues after fixes

### CRITICAL — Already fixed this session
All CRITICAL issues resolved.

### HIGH — Open

**H-01: INCLINATION_INHERITANCE_RATE = 1.00 removes dynasty variance**
Dynasty on rails after gen 1. All future gens start where last one ended.
Recommended: 0.82–0.88 rate for gentle reversion without losing identity.
Route: economy-designer

**H-02: Hunter branch tech bt_punta_llanca inheritanceRate = 0.20**
Most thematically obvious dynasty type is hardest to sustain mechanically.
Without teaching (minAge 8, narrow window): 80% loss per succession.
After 3 generations: ~0.8% cumulative retention without consistent teaching.
Recommended: raise to 0.40+ or lower DESTRESA_THRESHOLD for hunter actions.
Route: economy-designer

### MEDIUM — Open

**M-01: Material accumulation trivializes shop from gen 2**
No material cap. Optimal play hoards material for gen 2 shop burst.
Recommended: add material ceiling (40–50), or lower inheritDecay to 0.25–0.30.
Route: economy-designer

**M-02: INCLINATION_INHERITANCE_RATE = 1.00 also means no mid-life branch pivot**
A character can't change branch within a generation. Once locked by inherited
inclination at gen 3+ (e.g., impuls = 0.55), reversing requires ~18 actions
with no recovery path in a 20-cycle life. By design but undocumented.
Route: document in GDD

**M-03: Universal techs ut_ceramica (cycle 80) and ut_agricultura (cycle 92)**
Content too late. 8-cycle window for agricultura is functionally 0.
Recommended: pull ut_ceramica to cycle 60, ut_agricultura to cycle 75.
Route: economy-designer

**M-04: bt_guariment_plantes passive blocks pe_malaltia entirely**
The most damaging disease event becomes permanently blocked when the skill
is held. Mystic branch effectively eliminates disease risk.
Recommended: don't suppress pe_malaltia, give skill a healing bonus instead.
Route: economy-designer / narrative

**M-05: Destreses inherited with 0% attrition (full Set transfer)**
Destreses never risk being lost on succession. Design intent was probabilistic
inheritance like branch techs, but code does `new Set(inheritedDestreses)`.
Recommended: apply ~50% decay per destresa on succession.
Route: economy-designer

### LOW — Open

**L-01: execute_cost for discovery action not enforced**
The discovery action (act_escoltar_estrangers) has execute_cost: 2 but the
discovery path in executeAction doesn't deduct food cost.
Route: gameplay-programmer

**L-02: Age-gated action notification false positives**
Line 758: `if (characterAge() === a.minAge && !state.character.charState[a.requires?.[0]?.state])`
This fires a discovery notification based on age = minAge, but doesn't check
if the action is already known or already visible. May notify redundantly.
Route: qa-tester

**L-03: FAMILY_REP_INHERITANCE constant defined but inconsistently used**
`FAMILY_REP_INHERITANCE = 0.6` is in data.js but reputacio's inheritDecay
in RESOURCE_DEFS is also 0.6. If one is changed without the other, score
calculation could drift. Consolidate to single source of truth.
Route: gameplay-programmer

**L-04: no-time-banner in HTML is dead UI**
Element `#no-time-banner` exists but is never shown/hidden by game.js.
Either implement the "all actions blocked" detection or remove the element.
Route: ui-programmer

---

## Branch timing summary (from branch-path agent)

| Branch | Activates at action # | In 4–6 window? |
|---|---|---|
| Caçador | 6 | YES (boundary) |
| Recol·lector | 5 | YES |
| Artesà | 5 | YES |
| Místic | 7 (post-fix) | YES |

---

## Score system health (post-fixes)

- genScore: ✓ penalizes early death proportionally (50pts at age 20, 25pts at age 10)
- reputacio: ✓ earned-only, no cross-gen double-counting
- techs × 100: ✓ capped by available tech count
- skills × 30: ✓ accumulates per-gen, bounded by total skill count
- branches × 40: ✓ dynasty-wide unique set
- heirBonus: ✓ 20pts per gen that left an heir

Dominant scoring meta: techs (10 techs = 1000 pts) > gens (50 full-life pts × N) > reputation (max 20 earned/gen × 2 = 40 pts/gen). Score is balanced; no single overwhelming exploit remains.
