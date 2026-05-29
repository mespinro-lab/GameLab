# Playtest Report — New Player (Mobile, 390 px)
**Date**: 2026-05-29
**Prototype**: `prototypes/life-tycoon-2/`
**Persona**: Native Catalan speaker, zero tycoon/dynasty experience, mobile phone 390 px, no tutorial
**Sweep type**: First-session UX — confusion mapping

---

## Confusion Note: NP-01 — Top bar label "Vitals (-1/torn)"

**When**: Game opens for the first time. Top bar shows: `Vitals (-1/torn)` followed by `🌾 15` and `❤️ 20`.

**What confused me**: The label "Vitals (-1/torn)" sitting above two number pills.

**My naive interpretation**: "Vitals" might be a section header like "statistics". The "(-1/torn)" looks like a fraction or ratio — maybe it means "1 out of torn (broken)?" The word "torn" is not obviously a time unit to someone without game experience. I assumed it was an adjective meaning "torn/damaged" rather than a noun meaning "turn". The minus sign is also ambiguous — does it mean these values are decreasing right now, or that something is already negative?

**Correct meaning**: `-1/torn` means both 🌾 Aliment and ❤️ Salut lose 1 point every cycle (called a "torn" = turn). The label is a parenthetical warning, not a ratio. Source: `game.js` constants `FOOD_UPKEEP = 1` and `HEALTH_UPKEEP = 1`, applied each cycle in `executeAction()`.

**Suggested fix**: Replace with two inline decay labels: `🌾 15 (-1/cicle)` and `❤️ 20 (-1/cicle)` — dropping the shared label header entirely and using the more self-evident "cicle" instead of "torn".

**Priority**: High

---

## Confusion Note: NP-02 — "Progrés" with "Cicle 0" and "Gen 1/5"

**When**: Same top bar, right section. Two pills: `Cicle 0` and `Gen 1/5`.

**What confused me**: The header "Progrés" (Progress) covers two pills that seem to track two completely different things. "Cicle 0" — progress toward what? A round? A day? "Gen 1/5" — generations? It looks like a pagination indicator ("page 1 of 5"), not a multi-life dynasty structure.

**My naive interpretation**: "Gen 1/5" means "level 1 of 5" or "generation 1 of 5 in this round". I had no way to know that 5 generations is the entire game length — that dying and passing to a child is the core mechanic. I assumed "Gen" was an abbreviation of a word I didn't recognise.

**Correct meaning**: `Cicle` is the character's age in turns (0–14 before succession). `Gen 1/5` is the dynasty generation counter — the game ends after 5 generations. Source: `LIFE_EXPECTANCY = 14` and `MAX_GENERATIONS = 5` in `game.js`.

**Suggested fix**: Label each pill directly: `⏳ Cicle 0/14` and `👨‍👩‍👧 Gen 1/5`. Consider a one-line tooltip or onboarding note: "El personatge viu 14 cicles i passa el llegat als fills."

**Priority**: High

---

## Confusion Note: NP-03 — Profile label "Explorador"

**When**: Left panel, top of the profile column. Large bold label showing "Explorador".

**What confused me**: Is this the character's name? A job class I chose? A button that does something? Nothing around it suggests it changes dynamically. There is no subtitle, no tooltip, no icon hinting at identity vs. class vs. status.

**My naive interpretation**: I thought "Explorador" was the character's given name, set by the game, not editable. It reads like a proper noun at that visual weight. I would not expect it to silently change as I play.

**Correct meaning**: It is the name of the first active branch (from `BRANCHES`). It defaults to "Explorador" when no branch is active. It automatically changes to "Caçador", "Artesà", etc. as the character's inclination shifts into a branch threshold. Source: `renderProfilePanel()` in `game.js` — `activeBranchesNow[0].name` or `"Explorador"` fallback.

**Suggested fix**: Add a micro-label above or below it: `Rol actual` in a dimmer style so the player understands it describes who they are becoming, not a name. A subtle transition animation when it changes would also help signal that it is dynamic.

**Priority**: High

---

## Confusion Note: NP-04 — Zone card filter tabs "Actives / Aprendre / Bloq."

**When**: Inside any zone card (e.g., Bosc). Three compact tabs appear below the zone header.

**What confused me**: "Actives" is reasonably clear — things I can do now. "Aprendre" (Learn) is the purchase/unlock tab. "Bloq." is an abbreviation. The badge counts on the header (e.g., `3▶ 2🧠 4🔒`) appear before I know what those symbols mean in this context, so the numbers look like decorative scoring rather than actionable navigation.

**My naive interpretation**: I assumed "Aprendre" was a tab showing a tutorial or hints, not a list of actions I can spend resources to unlock. "Bloq." I parsed as "Bloquejades" (blocked) but did not know blocked by what — currency, time, or something I hadn't done yet? The 🧠 icon on the badge hinted at a cost but the connection was not obvious until I tapped "Aprendre" and saw the `Aprendre (−N🧠)` button.

**Correct meaning**: "Actives" = owned and usable actions; "Aprendre" = purchasable actions costing Saber (🧠); "Bloq." = locked behind branch tech not yet unlocked. Source: `buildZoneCard()` tabs loop in `game.js`.

**Suggested fix**: Expand the "Bloq." tab label to "Bloquejades" (it fits on 390 px if the count badge is moved inside the tab). Add a one-line hint under the zone header on first visit: "Aprèn accions amb 🧠 Saber. Les bloq. s'obren amb habilitats."

**Priority**: Medium

---

## Confusion Note: NP-05 — Left panel "Inclinació" — dot rows with pole labels

**When**: Left panel, section labelled "Inclinació". Four rows, each with two text poles and five dots. At game start all dots are at centre position.

**What confused me**: The five dots don't have a visible numeric scale, direction arrows, or a legend. The leftmost and rightmost labels (e.g., "Reflexiu — Impulsiu") hint at a spectrum, but I did not know what "active dot" meant — does the lit dot show where I am, or where I want to go? And the section label "Inclinació" is not explained anywhere: is it a mood bar? An alignment? Does it matter for gameplay?

**My naive interpretation**: I thought the dots were a decorative "personality radar" that showed a fixed archetype chosen at game start, not a value that shifts continuously as I execute actions. I had no idea that action choices would move the dots — I thought I might need to tap them to set a preference. (In fact the dots ARE tappable — a debug feature — which adds to the confusion for a real player.)

**Correct meaning**: Each row is a personality axis (Impuls, Intel·lecte, Espiritualitat, Sociabilitat) with a value from −1.0 to +1.0. The active dot shows current position. The value shifts with every action executed via `applyInclinationDeltas()`. The current position controls which actions are visible/faded and which branches are active. The dots being tappable is a debug-only shortcut (`inclination-rows` click listener in `game.js`).

**Suggested fix**: Add a one-line descriptor under "Inclinació": "Les teves accions modelen com ets. Determina quines accions veus i quin rol adoptes." Remove or gate the debug dot-click in production. Add a tiny arrow indicator (◄►) at the active dot to make "position on a spectrum" legible.

**Priority**: High

---

## Confusion Note: NP-06 — "Cap branca activa" and "Branques actives" section

**When**: Left panel, "Branques actives" section. Shows the text "Cap branca activa" in a dimmed style.

**What confused me**: "Branca" (branch) in Catalan means a tree branch or a fork in a road. In this context it could mean a family branch, a skill tree branch, or a career path. The empty state gives no hint of how to get one. There is no "how to unlock" affordance — just an empty label with no call to action.

**My naive interpretation**: I thought branches were unlock tiers like "skill trees" in RPGs — something I'd buy with currency. I did not connect "branches" to my inclination dots at all. I tried tapping "Aprendre" tabs looking for a "buy branch" button.

**Correct meaning**: A branch becomes "active" automatically when the character's inclination values cross specific thresholds (e.g., Caçador requires `impuls ≥ 0.30` AND `sociabilitat ≤ 0.30`). No purchase needed — it unlocks by playing actions that push inclination. Source: `getActiveBranches()` and `BRANCHES` array in `game.js` / `data.js`.

**Suggested fix**: Replace "Cap branca activa" with "Cap rol definit encara — les teves accions ho determinaran." This primes the player to understand branches are earned through behaviour. A small callout the first time a branch activates ("Has adoptat el rol de Caçador!") would reinforce the discovery.

**Priority**: High

---

## Confusion Note: NP-07 — First action feedback: log entry format

**When**: After tapping "Executar" on "Espiar el Ramat" for the first time. The last-result banner and the log update.

**What confused me**: The last-result banner says something like: "Cicle 1 — Espiar el Ramat: +3 Aliment". The log shows "[1] Espiar el Ramat: +3 Aliment". Both are readable for the action itself. However, there is no indication that 🌾 and ❤️ each silently lost 1 point (upkeep). The net change to food may actually be +2 (earned 3, spent 1 execute cost, lost 1 upkeep = +1 net) but the banner only shows the gross output. The player has no way to reconcile the top-bar numbers with the log entry.

**My naive interpretation**: I see "+3 Aliment" in the banner and assume the food counter went up by 3. I check the top bar and see the number is not +3 from where it started. I cannot understand why. I suspect a bug.

**Correct meaning**: Execute cost (1 🌾) is deducted first (`state.food -= action.execute_cost`), then output is added (+3), then upkeep deducted (−1 FOOD_UPKEEP). Net: −1 + 3 − 1 = +1. The log only shows the output, not the full accounting. Source: `executeAction()` in `game.js`.

**Suggested fix**: Log the net change or show a compact breakdown: "Espiar el Ramat: +3🌾 (−1 cost, −1 upkeep = +1 net)" or simply add a persistent "canvi net" value to the last-result banner. Alternatively, show a brief "+3 / −2" delta flash on the food pill itself.

**Priority**: Medium

---

## Confusion Note: NP-08 — Tech strip pills above zone grid

**When**: A horizontal strip of coloured pill badges sits above the zone cards. At game start, all pills are gray with "c2", "c5", "c8" suffixes.

**What confused me**: I see small coloured capsules labelled "🗣️ Llengua Bàsica c2", "🪨 Eines de Pedra c5", "🔥 Domini del Foc c8". I have no idea what this strip is. Are these achievements? A timeline? A requirements checklist? The "c2" suffix is opaque — it looks like a version number or a category code.

**My naive interpretation**: I thought "c2" meant "category 2" or "tier 2". I thought the strip was a legend or key for the zone cards. I did not connect these pills to the "Tecnologies noves" cards that appear as the game progresses or to the "Descobrir" button.

**Correct meaning**: This is the technology status strip. Each pill represents a universal technology. Gray = not yet available (cycle number shows when it becomes available). Gold = available to discover now. Green = already discovered. "c2" = "available at cycle 2". Source: `renderTechStrip()` in `game.js`.

**Suggested fix**: Add a section label above the strip: "Tecnologies del llinatge" (matching the "Tecnologies noves" panel label when discoveries appear). Change "c2" to "Cicle 2" or "disponible al cicle 2" on hover/tap. Consider adding a one-word status badge: "Pendent" / "Disponible" / "Descoberta" visible on each pill.

**Priority**: Medium

---

## Confusion Note: NP-09 — Catalan vocabulary audit

**When**: Throughout the full session.

**What confused me**: Multiple domain-specific Catalan terms appear without in-game definition.

**My naive interpretation vs. Correct meaning for each term**:

| Term | Naive interpretation | Correct meaning | Clear to a Catalan native? |
|------|---------------------|-----------------|---------------------------|
| **Torn** | "torn" = past participle of "tornar" (returned) or the adjective "torn/damaged" | time unit = a game turn/cycle | No — "torn" as noun meaning "turn" is used colloquially but not in formal Catalan. "Cicle" is used elsewhere and is clearer. |
| **Inclinació** | A preference or angle; possibly a menu category | The personality axis system; affects action visibility and branch activation | Partially — the word is correct Catalan for "inclination/tendency" but its mechanical role is not explained. |
| **Branca** | Family branch (genealogy) or tree branch | Career/personality archetype that activates automatically with inclination thresholds | Partially — evokes the right metaphor but the activation mechanism is invisible. |
| **Destresa** | Sounds archaic/formal; could mean "dexterity" or "skill" | A personal mastery bonus earned by repeating an action N times | Yes — "destresa" is valid Catalan for "dexterity/skill" but feels literary; "habilitat" (used elsewhere for branch techs) might be more immediately readable. |
| **Saber 🧠** | "Saber" = "to know" (infinitive verb) or knowledge (noun) | The currency used to purchase/learn actions | Ambiguous — used as both a noun label ("Saber" in the top bar) and as a cost label ("−4🧠"). The verb reading ("to know") can confuse. Consider "Coneixement" or keeping "Saber" but always paired with 🧠 and a coin-like icon. |

**Suggested fix**: Add a very short glossary tooltip (one tap on a term reveals a one-line definition) or a first-session "Com funciona" overlay covering these 5 terms. Unify "Saber" / "🧠" consistently — always show both together. Replace "torn" with "cicle" globally.

**Priority**: Medium

---

## Confusion Note: NP-10 — Succession modal copy

**When**: After 14 cycles, the succession modal appears with the title "Successió".

**What confused me**: The body text reads: "El personatge ha completat la seva vida." followed by "El fill hereta habilitats, destreses i stats (65%), i el 65% de les inclinacions."

**My naive interpretation**: "El personatge ha completat la seva vida" — I understand the character has died/finished their life. But "El fill hereta habilitats, destreses i stats (65%)" mixes Catalan nouns with an English loanword ("stats") in parentheses and then a raw percentage that explains the inheritance mechanic but feels cold and numerical. I did not know what "stats" were (this is the first time the word appears) nor what 65% of "inclinacions" means concretely: does the son start at half my personality progress?

**Correct meaning**: The child inherits `forca`, `enginy`, `vincle` stats at 65% of parent values (decayed toward baseline). Inclination values are multiplied by `BRANCH_INHERITANCE_RATE = 0.65`. All purchased actions and branch techs carry over fully. Source: `continueSuccession()` in `game.js`.

**Suggested fix**: Replace the mechanical description with a narrative one: "El teu fill neix amb la memòria del llinatge. Recorda el 65% de les teves habilitats i inclinacions, però ha de forjar el seu propi camí." Then list the inherited items as a visual summary card (icons + values) rather than a prose sentence with English loanwords. Replace "stats" with "atributs" (already used in the left panel).

**Priority**: Medium

---

## Summary

- **Total notes**: 10 (High: 4 · Medium: 6 · Low: 0)
- **Most confusing single element**: Profile label "Explorador" (NP-03) — it looks like a fixed character name but changes silently based on invisible inclination thresholds, making the core personality-loop mechanic completely opaque on first session.
- **Onboarding verdict**: OPAQUE

### Top 4 High-Priority Fixes (ux-designer + ui-programmer)

1. **NP-03** — Label "Explorador" as `Rol actual` to signal it is dynamic (ux-designer: copy; ui-programmer: style treatment)
2. **NP-05** — Add one-line explanation under "Inclinació" and remove tappable dots from production build (ux-designer: copy; ui-programmer: remove debug listener)
3. **NP-06** — Replace "Cap branca activa" with behaviour-priming copy (ux-designer: copy)
4. **NP-01** — Replace "Vitals (-1/torn)" with per-pill decay labels using "cicle" not "torn" (ui-programmer: top bar layout; ux-designer: copy)

### Routing

- **ux-designer**: NP-01 (copy), NP-02 (copy), NP-03 (copy + motion), NP-04 (copy), NP-05 (copy), NP-06 (copy), NP-09 (glossary/copy), NP-10 (copy)
- **ui-programmer**: NP-01 (top bar layout), NP-02 (pill labels), NP-04 (tab label width), NP-05 (remove debug dot-click), NP-07 (log/banner accounting), NP-08 (strip label + "c2" readability)

> Note: No UI copy was rewritten in production files. All suggestions above are recommendations pending ux-designer approval per collaboration protocol.
