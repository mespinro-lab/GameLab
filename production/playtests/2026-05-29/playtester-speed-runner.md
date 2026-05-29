# Playtest Report — Speed Runner
**Date**: 2026-05-29
**Tester persona**: Speed Runner — minimum-action optimiser, full source knowledge
**Game**: Life Tycoon 2 prototype
**Files analysed**: `prototypes/life-tycoon-2/game.js`, `prototypes/life-tycoon-2/data.js`

---

## TEST 1 — Universal Tech Timeline

### Finding: Universal techs are NOT automatic

**Verdict: DEAD ZONE FOUND + GATE INTEGRITY RISK**

The spec says techs fire "automatically at cycles 2, 5, 8." The code says otherwise.

```js
// game.js getDiscoverableTechs()
return UNIVERSAL_TECHS.filter(t =>
  state.cycle >= t.cycle && !state.discoveredUniversalTechIds.has(t.id)
);
// discoverTech() is called by player button click only:
btn.onclick = () => discoverTech(tech.id);
```

Universal techs become **available** at their cycle but are never applied until the player clicks "Descobrir." Nothing forces that click. A confused player can complete the entire 14-cycle life with `discoveredUniversalTechIds` empty, locking out every branch tech permanently. The health bonuses from `ut_eines_pedra` (+2) and `ut_foc` (+3) are also never received.

### Phase-by-phase analysis

| Phase | Cycles | Content | Dead zone? |
|-------|--------|---------|-----------|
| Early | 0 → 2 | 5 base actions, family actions, no branch techs | YES — no progression feedback |
| Early | 2 | ut_llengua available (button) | N/A — passive unless clicked |
| Mid | 2 → 5 | bt_cacera_coordinada + bt_pintura_rupestre eligible (if ut_llengua clicked) | TIGHT |
| Mid | 5 | ut_eines_pedra available (+2 health) | N/A — passive unless clicked |
| Mid | 5 → 8 | bt_agulla_os + bt_punt_llanca eligible | BALANCED |
| Late | 8 | ut_foc available (+3 health) | N/A — passive unless clicked |
| Late | 8 → 14 | bt_curar_herbes + bt_figuretes_venus eligible | TOO LOOSE (6 free cycles) |

### ut_llengua (cycle 2): branch techs immediately eligible

After clicking Descobrir at c2:
- `bt_cacera_coordinada`: requires impuls≥0.15 AND sociabilitat≥0.10 — **not yet met** at c2 (need ~9 espiar + social actions)
- `bt_pintura_rupestre`: requires espirit≥0.30 AND sociabilitat≥0.20 — **not yet met** at c2 (need 13+ ritual_foc)

Zero branch techs unlock the moment ut_llengua fires. The tooltip "Hi ha estrangers al poblat" will not appear until inclinations are built.

### Cycles 8 → 14: dead zone assessment

With 6 free cycles and only two branch techs gated behind ut_foc (`bt_curar_herbes`, `bt_figuretes_venus`), a player who has already secured succession at c12 has 2 genuinely free cycles with no escalating content. **Dead zone: cycles 12–14 in most routes.**

---

## TEST 2 — Branch Tech Unlock Speed

All values computed with `applyDelta(v, d) = v + d / (1 + |v| × 2.0)`, starting from 0.0.

### bt_cacera_coordinada
**Universal prereq**: ut_llengua (c2) — EARLIEST gate
**Conditions**: impuls ≥ 0.15 AND sociabilitat ≥ 0.10
**Best actions**: espiar_ramat (+0.02 impuls), cercar_parella (+0.04 social, once only), recollectar (+0.01 social)

| Action path | Steps to impuls 0.15 | Steps to social 0.10 | Total actions |
|-------------|---------------------|---------------------|---------------|
| espiar + cercar + recollectar | 9 | 1 cercar + 7 recollectar | 18 minimum |

**Earliest possible unlock**: cycle 18 — **exceeds LIFE_EXPECTANCY=14.**
**Verdict: BROKEN GATE** — bt_cacera_coordinada is unreachable in a single generation through action building alone. It requires inheritance or lucky event discovery (`ev_desc_caca_coord` in pool_caca).

Note: The event path (`ev_desc_caca_coord`) can bypass this if conditions are met by the time the event fires and the player chooses "Quedar-te a observar." This is the only viable gen-1 path to this tech.

---

### bt_punt_llanca
**Universal prereq**: ut_eines_pedra (c5)
**Conditions**: impuls ≥ 0.25 AND sociabilitat ≤ 0.20

| Action path | Steps to impuls 0.25 | Min cycles |
|-------------|---------------------|-----------|
| espiar_ramat only (+0.02) | 16 | 16 |
| 9x espiar → unlock cacera_gran → 3x cacera_gran (+0.05) | 9 + discovery + 3 = 14 | ~16 with family |

Full chain requires bt_cacera_coordinada first (already broken), plus purchase cost (4 materials), plus social must stay ≤ 0.20.
**Earliest possible**: cycle 24+ in a single gen.
**Verdict: BROKEN GATE** — bt_punt_llanca requires 2+ generations minimum.

---

### bt_agulla_os
**Universal prereq**: ut_eines_pedra (c5)
**Conditions**: intel ≥ 0.15 AND impuls ≤ 0.20

| Action | intel delta | Steps to 0.15 |
|--------|-------------|---------------|
| tallar_pedra | +0.02 | 9 |

impuls starts at 0.0 ≤ 0.20 and tallar_pedra pushes it to -0.084 after 9 uses (fine).
After 9x tallar_pedra at cycle 9: intel = 0.1579 ≥ 0.15. ut_eines_pedra available since c5.
**Earliest unlock**: cycle 10 (9x tallar + 1 discovery).
**Verdict: TIGHT** — achievable, requires no food income (tallar has execute_cost=0).

Note: intel at cycle 5 is only 0.0931 — bt_agulla_os is NOT eligible the moment ut_eines_pedra fires. Player waits 4 more cycles.

---

### bt_curar_herbes
**Universal prereq**: ut_foc (c8)
**Conditions**: espirit ≥ 0.20 AND intel ≥ 0.10

| Action | espirit delta | Steps to 0.20 |
|--------|---------------|---------------|
| ritual_foc | +0.03 | 8 |
| tallar_pedra | +0.02 intel | 6 for intel 0.10 |

ritual_foc has execute_cost=1, output=food (1-3 avg 2), health_delta=+1. Net food: -1+2-1=0. Sustainable.
8x ritual + 6x tallar = 14 combined cycles, but both run in parallel.
**Earliest unlock**: cycle 14 — exactly life expectancy. Extremely tight.
**Verdict: TOO LOOSE** — gated behind ut_foc at c8, then needs 8+ ritual actions. With only 6 cycles remaining after c8, barely reachable if player does nothing else.

---

### bt_pintura_rupestre
**Universal prereq**: ut_llengua (c2) — EARLIEST gate
**Conditions**: espirit ≥ 0.30 AND sociabilitat ≥ 0.20

| Action | espirit/social delta | Steps needed |
|--------|---------------------|-------------|
| ritual_foc | +0.03 espirit, +0.02 social | 13 for espirit 0.30, 12 for social 0.20 |

13 ritual_foc to reach espirit ≥ 0.30. ritual_foc execute_cost=1 food/cycle, upkeep=1. Net 0 food (avg output 2).
**Earliest unlock**: cycle 14 — again exactly at life expectancy.
**Verdict: TOO LOOSE** — prereq fires at c2 but conditions not met until c13. 11-cycle gap. Discovery notification fires at c13, leaving only 1 cycle to act on it.

---

### bt_figuretes_venus
**Universal prereq**: ut_foc (c8)
**Conditions**: intel ≥ 0.20 AND espirit ≥ 0.25

| Action | Steps needed |
|--------|-------------|
| tallar_pedra (+0.02 intel) | 12 for intel 0.20 |
| ritual_foc (+0.03 espirit) | 11 for espirit 0.25 |

12 + 11 = 23 combined, but overlap helps. Even with perfect alternation this needs ~16 cycles.
**Earliest unlock**: cycle 18–20 realistically.
**Verdict: BROKEN GATE** — unreachable in a single generation by action-building alone. Requires inheritance or event discovery.

---

## Speed Route: SR-01 — Fastest branch tech unlock (bt_agulla_os)

**Target**: Unlock bt_agulla_os, secure succession, survive to cycle 14
**Starting state**: Generation 1, inclination all 0.0, food 15, health 20

| Cycle | Action | Food cost | Food output | Net food | Health | Intel | Impuls | Result |
|-------|--------|-----------|-------------|----------|--------|-------|--------|--------|
| 1 | tallar_pedra | 0 | 0 (eines) | -1 | 19 | 0.020 | -0.010 | |
| 2 | tallar_pedra | 0 | 0 (eines) | -1 | 18 | 0.039 | -0.020 | ut_llengua available |
| 3 | tallar_pedra | 0 | 0 (eines) | -1 | 17 | 0.058 | -0.029 | **click Descobrir (ut_llengua)** |
| 4 | tallar_pedra | 0 | 0 (eines) | -1 | 16 | 0.076 | -0.039 | |
| 5 | tallar_pedra | 0 | 0 (eines) | -1 | 15 | 0.093 | -0.048 | ut_eines_pedra available |
| 6 | tallar_pedra | 0 | 0 (eines) | -1 | 14 | 0.110 | -0.057 | **click Descobrir (ut_eines_pedra)** |
| 7 | tallar_pedra | 0 | 0 (eines) | -1 | 13 | 0.126 | -0.066 | |
| 8 | tallar_pedra | 0 | 0 (eines) | -1 | 12 | 0.142 | -0.075 | |
| 9 | tallar_pedra | 0 | 0 (eines) | -1 | 11 | 0.158 | -0.084 | intel ≥ 0.15 — bt_agulla_os eligible |
| 10 | escoltar_estrangers (discovery) | 0 | 0 | **0** | **11** | 0.158 | -0.084 | **bt_agulla_os UNLOCKED** (no upkeep!) |
| 11 | cercar_parella | 1 | avg 1 | -1 | 10 | 0.158 | -0.092 | **hasPartner = true** |
| 12 | tenir_fills | 0 | avg 0.5 | -0.5 | 9 | 0.158 | -0.092 | **hasChildren = true** |

**State at succession**: cycle 12, food ≈ 4.5, health 9, 1 branch tech unlocked, 18 materials accumulated

**Post-succession cycles 13–14**: viable with recollectar_arrels (avg +1 net food/cycle)

**Total cycles to achieve all 3 goals**: 12
**Bottleneck**: intel must reach 0.15 (9x tallar) AFTER ut_eines_pedra fires at c5 — bt_agulla_os not eligible at c5 (intel=0.093), only at c9
**Gate verdict**: TIGHT

---

## Speed Route: SR-02 — Rush succession (skip all content)

**Target**: Secure succession with zero branch engagement
**Starting state**: Generation 1

| Cycle | Action | Food net | Health | Result |
|-------|--------|----------|--------|--------|
| 1 | cercar_parella | -1 (avg) | 19 | hasPartner = true |
| 2 | tenir_fills | -0.5 (avg) | 18 | hasChildren = true |

**Total cycles**: 2
**Bottleneck**: None. Both actions are available from cycle 0. No prerequisites.
**Gate verdict**: BROKEN — succession requires zero content engagement. A player can skip every branch, every tech, and every mechanic and still "win" the generation.

---

## Speed Route: SR-03 — Minimum Mystic (bt_pintura_rupestre)

**Target**: Unlock bt_pintura_rupestre (earliest ut_llengua prereq, highest thresholds)
**Starting state**: Generation 1

- ritual_foc: execute_cost=1, output avg 2 food, health_delta=+1, net food=0, net health=0
- Cycles 1–13: 13x ritual_foc → espirit = 0.305, sociabilitat = 0.217
- Cycle 2: ut_llengua available → click Descobrir
- Cycle 13: espirit ≥ 0.30 — bt_pintura_rupestre eligible (social still 0.217 ≥ 0.20)
- Cycle 14 (discovery): **bt_pintura_rupestre UNLOCKED**
- **No cycles left for cercar_parella or tenir_fills**

**Result**: Branch tech unlocked at cycle 14 but no succession = **GAME OVER** (no heir)
**Bottleneck**: bt_pintura_rupestre takes 13 cycles to build, leaving 1 discovery cycle and 0 family cycles
**Gate verdict**: TOO LOOSE — tech barely reachable, but incompatible with succession in generation 1

---

## TEST 3 — Minimum Succession Route

**Absolute earliest succession**: cycle 2 (SR-02 above)
**Earliest succession WITH content**: cycle 12 (SR-01 above)

**Succession feasibility in 14 cycles**: YES, but with tension

The single constraint is that `act_tenir_fills` is hidden until `hasPartner = true` (via `renderZoneGrid` filter), and `cercar_parella` disappears after one use. So the path is deterministic: cercar_parella must fire before tenir_fills, consuming 2 cycles minimum for the family arc. With any branch investment, this pushes succession to cycle 10–12.

**Health survival**: with ut_eines_pedra (+2 at c5) and ut_foc (+3 at c8) clicked promptly, health at cycle 14 is approximately 20 - 14 + 5 = 11. Without clicking, health = 6. Both are viable, but forgetting the health bonuses creates false scarcity.

**Food survival**: Starting food 15 + food income. tallar_pedra is the only zero-food-cost base action; spamming it burns 1 food/cycle. 9 cycles of tallar drains food to 6 — survivable but alarming. Food warning threshold at health≤4 is generous.

---

## TEST 4 — Destresa Timing

**Verdict: ACCESSIBLE IN MINIMUM ROUTE, 2ND DESTRESA REQUIRES SACRIFICE**

In SR-01 (9x tallar_pedra), `d_talla_silex` triggers at the 5th use (cycle 5). The player earns 1 destresa automatically while building intel. No extra actions needed.

A second destresa requires 5 more uses of a different action. From cycle 6 onward, 8 cycles remain (6–13) before succession at 12. Possible, but only if the player allocates 5 of those 8 cycles to a single action rather than intel building.

**2-destresa feasibility**: 5 (intel build) + 5 (second destresa action) + 1 (discovery) + 1 (parella) + 1 (fills) = 13 cycles. Achievable with 1 cycle to spare.

`act_ritual_foc` has `destresa_threshold=4` (lower than default 5) for `d_custodi_foc`. This makes it the best target for a second destresa: 4 uses instead of 5, saving 1 cycle. Combined with intel build, the 2-destresa route fits in 13 cycles.

**Verdict**: Destresa system is accessible in normal play for 1 destresa. A 2-destresa run is a meaningful constraint requiring deliberate planning. BALANCED.

---

## TEST 5 — Discovery Action Gate Integrity

**Verdict: POTENTIAL SOFTLOCK**

### What getEligibleBranchTechs() checks
```js
return BRANCH_TECHS.filter(bt =>
  state.discoveredUniversalTechIds.has(bt.universal_prereq) &&  // (1) universal prereq discovered
  !state.character.unlockedBranchTechIds.has(bt.id) &&          // (2) not already owned
  evaluateConditions(bt.inclination_conditions)                  // (3) inclination met
);
```

All three checks are correct. Event-based discovery (`getEligiblePoolEvents`) applies the same prereq check. Gate integrity is solid — no branch tech can be unlocked before its universal prereq.

### Softlock scenario

`getEligibleBranchTechs().length === 0` when any of these is true:
1. All universal techs with discoverable branch techs are not yet discovered (player skipped buttons)
2. Inclinations have not reached any branch tech threshold
3. All eligible branch techs are already owned

In scenario 1: the "Hi ha estrangers" notification never appears. The `act_escoltar_estrangers` action never appears in the Campament zone. The player has **no way to know** that clicking the universal tech Descobrir button is the prerequisite. This is a **silent soft-lock** — the discovery mechanic is completely invisible until universal techs are clicked.

In scenario 3: once a player owns all 2–3 branch techs they can reach, discovery disappears and never returns. No fallback content is offered.

**Additional finding**: `act_tenir_fills` is gated behind `hasPartner`, which is set by `act_cercar_parella`. But `act_cercar_parella` disappears from the UI after use (`renderZoneGrid` filter). If a player somehow ends a generation with `hasPartner=false` despite the action having been available, and succession fires, they hit `gameOverReason='no_heir'`. This is intended, but the window to take the action closes permanently after one use with no "you only have one chance" warning.

---

## Additional Finding: Gatherer Branch is a Dead End

`branch_gatherer` conditions: impuls ≤ 0.10 AND intel ≤ 0.10.
At game start (all inclinations 0.0), Gatherer is **active from cycle 0** with no player effort.

No `BRANCH_TECHS` entry has a `branch_id` field at all — branch techs are gated by `universal_prereq` and inclination only, not by which branch is active. There are zero branch techs associated with the Gatherer. A player in the Gatherer branch sees a "Recol·lector" label in the profile panel but has no exclusive actions to unlock and no tech tree to pursue.

The branch deactivates as soon as either impuls or intel exceeds 0.10. After 6 uses of tallar_pedra, intel=0.110 — Gatherer is gone, with no notification. The player profile silently shifts to "Explorador."

**This means**: a player who does nothing (or only recol·lecta) is in "Gatherer" but has no branch content. The game starts with an active branch that is meaningless.

---

## Additional Finding: Craftsman Branch Active Threshold Unreachable in Gen 1

`branch_craftsman`: intel ≥ 0.25 AND impuls ≤ 0.20
Requires 16x tallar_pedra → cycle 16 > LIFE_EXPECTANCY 14.

`bt_agulla_os` (the Craftsman branch tech) requires intel ≥ 0.15 — reachable at cycle 9.
This means the player unlocks a Craftsman branch tech while the Craftsman branch label has not yet appeared. The profile still shows "Explorador" when bt_agulla_os is discovered.

---

## Summary

| | |
|---|---|
| **Critical gate violations** | (1) Universal techs require player click — not automatic; silent if ignored. (2) Succession rush possible at cycle 2 with zero content engagement. (3) bt_cacera_coordinada unreachable by inclination-building in gen 1 (needs 18 cycles). (4) bt_figuretes_venus unreachable by inclination-building in gen 1. (5) Gatherer branch has no branch techs — dead end. |
| **Pacing dead zones** | Cycles 0–2: no branch feedback; only base actions with no progression signal. Cycles 12–14: all content reachable has been reached; 2 idle cycles for most routes. |
| **Succession feasibility** | YES (but too easy — cycle 2 rush available) |
| **Overall pacing verdict** | CONCERNING |

### Route to game-designer
- Succession has no minimum content requirement. A player who does cercar_parella and tenir_fills at cycles 1–2 advances a generation with no engagement. Consider a minimum cycle gate or content requirement before succession is available.
- Gatherer branch has zero branch techs. It is visible from cycle 0 but offers no progression. Either add Gatherer-specific content or remove the branch label.
- bt_cacera_coordinada and bt_figuretes_venus are designed as inclination-build targets but their thresholds (18+ cycles) exceed the generation length. They are effectively inheritance-only techs. If that is intentional, the design should communicate it.
- Cycles 12–14 are idle for most realistic routes. The late-game universal tech (ut_foc at c8) unlocks two hard-to-reach branch techs but leaves nothing else to pursue.
- Branch active thresholds and branch tech thresholds are misaligned: bt_agulla_os (Craftsman) can be discovered before the Craftsman branch label appears.

### Route to gameplay-programmer
- Universal tech discovery is voluntary (button click). The spec implies automatic. Clarify intent: if techs should auto-apply, move `discoverTech()` into `executeAction()` or a cycle-advance hook. If manual is intentional, add a forced pop-up or block cycle advance until discovered.
- `performDiscoveryAction()` advances `state.cycle` without applying food or health upkeep (lines 194–197 in game.js). This is an asymmetry with all other cycle-advancing code paths. Verify if this is intentional (free cycle as reward) or an omission.
- `act_cercar_parella` is permanently removed from the UI after first use (renderZoneGrid line 742). If the player uses it at cycle 1 and succession requires children before cycle 14, the window is large — but there is no in-game hint that the action is gone forever.
