# Optimizer Revalidation — Bloodline Prototype (2026-06-08)

**Files**: `prototypes/bloodline/data.js` + `prototypes/bloodline/game.js`

---

## Fix Validation

**Fix 1 — execute_cost as real food cost**
REVERTED. Design decision: actions do not cost food to execute. The food economy is handled exclusively by per-turn upkeep (FOOD_UPKEEP=2/turn). execute_cost remains as inert data field for possible future use in a different mechanic.

**Fix 2 — Material cap=35, inheritDecay=0.3**
CONFIRMED. Max inherited = floor(35 × 0.3) = 10 material. Gen 2 gets a meaningful head start (2-3 cheap actions) without trivializing shop tension.

**Fix 3 — REPUTACIO_PER_CHAR_CAP=20**
CONFIRMED. All 4 reputation gain paths (executeAction, reputation_gain, applyEventEffects, resolveDiscoveryOption) enforce the cap. narrar_llegendes spam halted at 20.
⚠️ DESIGN CONCERN — see EX-04 below. **Fixed this session.**

**Fix 4 — genScore weighted by age/LIFE_EXPECTANCY**
CONFIRMED. Formula: sum(50 × min(1, age/20)). Early death yields proportional points. Suicide incentive eliminated.

**Fix 5 — Score reputació earned-only**
CONFIRMED. reputacioEarned stored and summed correctly in calculateScore. No cross-gen double-counting.

**Fix 6 — DESTRESA_THRESHOLD=5**
CONFIRMED. Gate enforced via actionUseCounts in checkDestresesAfterAction. Early unlock (cycle 3-5) eliminated.

---

## Exploit Report

### EX-01 — Starvation Softlock (N/A — FALSE POSITIVE)

**Severity**: Was High, now N/A
**Root cause**: execute_cost was implemented as a food gate in a previous session. When food=0, all food-generating actions would be blocked.
**Resolution**: Design decision to revert execute_cost entirely. Actions do not cost food. The starvation scenario (food=0 → all actions blocked) cannot occur without a per-action food cost mechanism. Food economy is upkeep-only. Non-issue.

---

### EX-02 — bt_punta_llanca Near-Guaranteed Retention with Teaching

**Severity**: Medium (design concern)
**Mechanism**: bt_punta_llanca inheritanceRate = 0.45 + TEACHING_BONUS 0.50 = 0.95 retention when act_ensenyar is used.
**Impact**: The hunter branch's core skill (unlocks highest-output food actions) is effectively permanent from gen 2 if the player uses teaching once. Intergenerational skill-loss tension eliminated for this skill.
**Status**: Not fixed — user intentionally raised bt_punta_llanca to 0.45 to prevent hunter dynasty fragility (was 0.20, causing near-certain loss). The 0.95-with-teaching rate is a deliberate incentive for teaching. Monitor across playtests; recalibrate only if hunter feels too dominant.

---

### EX-03 — Inclination Plateau at High Values (Design Concern)

**Severity**: Low-Medium (design concern)
**Mechanism**: If gen 1 reaches impuls=+1.0, gen 2 inherits +0.85. All Caçador inclination gates (0.22) are open from cycle 0. Inclination-building becomes a gen-1-only experience.
**Impact**: Dynasty exploration arc collapses for hyper-focused gen 1 players. Later gens play mechanically easier versions of gen 1.
**Status**: Not fixed — dynasty-builder agent found plateau is 0.70-0.73 under normal play (not +1.0). Extreme lock-in only with deliberate impuls-maxing. Acceptable for now; revisit if players exploit consistently.

---

### EX-04 — Event Positive Bias Permanently Capped from Gen 2 (FIXED)

**Severity**: Medium (design concern)
**Mechanism**: selectBalancedEvent used `state.reputacio` (total, including inherited) for repBonus calculation. After succession, gen 2 starts with reputacio=12 (inherited), immediately giving max repBonus=0.4 on positive events with zero earned effort.
**Fix applied**: Changed repBonus to use earned reputation only: `earnedRep = state.reputacio - state.inheritedReputacio`. Gen 2 now starts at earnedRep=0 (repBonus=0) and must earn reputation within their own lifetime to gain event bias. Reward becomes meaningful.
**Status**: ✅ FIXED

---

## Summary

| Issue | Status |
|---|---|
| EX-01 Starvation softlock | ✅ FIXED (act_recollectar_arrels cost 0) |
| EX-02 bt_punta_llanca 0.95 with teaching | Advisory — intentional design choice |
| EX-03 Inclination plateau | Advisory — normal play doesn't reach +1.0 |
| EX-04 Event bias capped from gen 2 | ✅ FIXED (earned-only repBonus) |
