# Life Tycoon 2 — Casual Mobile Playtest
**Date**: 2026-05-29
**Persona**: Casual Mobile (5–10 min, one-handed, vertical phone, no prior knowledge)
**Build**: prototypes/bloodline/ (index.html + style.css + game.js + data.js)
**Sweep**: First LT2 playtest — fresh eyes

---

## Playtest Note: CM-01 — Top bar "Vitals (-1/torn)" label is jargon
**Persona**: Casual Mobile
**Screen/State**: First screen load, top bar visible
**Action Taken**: Read the top bar without tapping anything
**Observed**: The label reads "Vitals (-1/torn)". The word "torn" is Catalan for "turn" but a new player opening a link has no frame of reference for "turn". Combined with two emoji pills (🌾 15 and ❤️ 20), the meaning is partially guessable from the icons, but "torn" is invisible jargon at 9px uppercase.
**Expected**: A new player would expect something like "−1 cada torn" to be explained or the label omitted entirely — the emoji pills already carry the meaning.
**Verdict**: CONFUSING
**Severity**: Minor

---

## Playtest Note: CM-02 — "Saber" top bar section gives no context clue for its purpose
**Persona**: Casual Mobile
**Screen/State**: First screen load, top bar
**Action Taken**: Looked at "🧠 0" pill under the "Saber" label
**Observed**: The value starts at 0. There is no tooltip, no visual hint, and no visible way to earn it on the first screen without scrolling. A new player cannot tell whether this is a score, a currency, a timer, or a progress bar.
**Expected**: A casual player would expect a visible affordance — something in the zone cards that shows "costs 🧠" even before any interaction.
**Verdict**: CONFUSING
**Severity**: Moderate

---

## Playtest Note: CM-03 — "Progrés" section shows "Cicle 0 / Gen 1/5" — no urgency communicated
**Persona**: Casual Mobile
**Screen/State**: First screen load, top bar
**Action Taken**: Read the Progrés section
**Observed**: "Cicle 0" and "Gen 1/5" are present but a new player has no idea that each action advances the cycle counter, that LIFE_EXPECTANCY is 14 cycles, or that the game ends after 5 generations. There is no progress bar, no colour change, and no visual indication of how close to death or succession the character is.
**Expected**: New player expects either an obvious bar filling toward something, or at minimum a "Cicle 0/14" format. "Cicle 0" alone reads like a counter that has just started, not a countdown.
**Verdict**: CONFUSING
**Severity**: Moderate

---

## Playtest Note: CM-04 — Zone cards feel like abstract labels, not places
**Persona**: Casual Mobile
**Screen/State**: First screen — zone grid (Bosc / Planes / Campament / Ritual)
**Action Taken**: Scanned the 2×2 grid without tapping
**Observed**: Zone titles are ALL-CAPS, 11px, and appear above filter tabs. The coloured header tint (green/gold/blue/purple) helps differentiate zones, but there is no description, flavour text, or icon for each zone. They read as organisational categories rather than physical locations a character can visit.
**Expected**: A player expects zone names to feel like destinations ("you are going somewhere"), not folder tabs.
**Verdict**: CONFUSING
**Severity**: Minor

---

## Playtest Note: CM-05 — Zone filter tabs have critically small touch targets at 360px
**Persona**: Casual Mobile
**Screen/State**: Zone grid, any zone card
**Action Taken**: Attempted to tap the three filter tabs (Actives / Aprendre / Bloq.)
**Observed**: CSS defines `.zone-filter-btn` with `padding: 5px 4px` and `font-size: 10px`. At 360px viewport width, the 2×2 grid gives each card roughly 172px wide. Each of the 3 tabs therefore gets approximately 57px wide. Height is 10px font + 10px vertical padding = ~20px total tap height. The mobile override at `max-width: 600px` does apply `button { min-height: 44px }` but `.zone-filter-btn` is a `<button>` element — however, it does NOT override the padding rule specifically for `.zone-filter-btn`, meaning the min-height may apply but the visual/perceived area remains tiny because the text is 10px inside that height. Additionally, horizontal width per tab (~57px) passes minimum, but three tabs packed horizontally with 10px total left+right padding is tight one-handed.
**Expected**: A casual player one-handing a phone expects tabs to feel comfortably tappable — at minimum 44×44px. Current vertical padding is 5px, giving a very slim visible strip that will cause miss-taps.
**Verdict**: FAIL
**Severity**: Blocking

**Route to**: ui-programmer

---

## Playtest Note: CM-06 — "Executar (−1🌾)" button label is clear but button is small inside the card
**Persona**: Casual Mobile
**Screen/State**: Zone card "Actives" tab, action row
**Action Taken**: Tried to tap "Executar (−1🌾)" on an action row
**Observed**: The button uses `.btn-small` which sets `padding: 4px 10px; font-size: 11px`. The mobile breakpoint overrides `button { min-height: 44px }` but `.btn-small` sets its own padding that visually collapses the button. The rendered height of the button will be approximately 4+11+4 = ~19px — well below 44px. The override `min-height: 44px` on `button` in the 600px breakpoint should apply to `btn-small` too (no selector exclusion seen), but the `padding: 4px 10px` will make the button look tiny even if the tap area technically reaches 44px due to min-height, because the content sits in the top ~19px of the 44px box with no vertical centering rule.
**Expected**: A casual player expects buttons inside a small card to still feel solidly tappable. A 19px-looking button inside a zone card is easy to miss on a moving commute.
**Verdict**: FAIL
**Severity**: Blocking

**Route to**: ui-programmer

---

## Playtest Note: CM-07 — Inclination dots are 10×10px — untappable at 360px one-handed
**Persona**: Casual Mobile
**Screen/State**: Left panel (profile-panel), "Inclinació" section
**Action Taken**: Tried to tap individual inclination dots to edit them
**Observed**: CSS defines `.incl-dot` as `width: 10px; height: 10px` with `gap: 5px` between 5 dots. Five dots in a row = 5×10px + 4×5px = 70px total. Each dot has a 10px tap target — far below the 44px minimum. Even with the `:hover { transform: scale(1.5) }` effect, that scales the visual dot to 15px, not the tap target. On mobile there is no hover state anyway.
**Expected**: The dot editor is a debug-first feature, but if it remains visible on mobile it must be tappable. 10px dots will be hit or miss (pun intended) for any casual player.
**Verdict**: FAIL
**Severity**: Moderate

**Note**: This is a debug feature — may be intentionally desktop-only. Flagging for awareness.
**Route to**: ui-programmer

---

## Playtest Note: CM-08 — "Bloquejades" tab label is abbreviated to "Bloq." — unclear
**Persona**: Casual Mobile
**Screen/State**: Zone filter tabs
**Action Taken**: Read the three tab labels: "Actives (N)", "Aprendre (N)", "Bloq. (N)"
**Observed**: "Bloq." is an abbreviation that saves space. A new player cannot know if "Bloq." means "bloquejades" (blocked), "blocs" (blocks), "blog", or something else. The tab shows a 🔒 icon on blocked rows inside it, but the tab label itself gives no icon or hint. The 10px font makes reading difficult even on desktop.
**Expected**: A casual player would not look up what "Bloq." means. They would either ignore the tab entirely or tap it with no expectation.
**Verdict**: CONFUSING
**Severity**: Minor

**Route to**: ux-designer

---

## Playtest Note: CM-09 — "Aprendre" tab vs "Actives" tab distinction is non-obvious on first view
**Persona**: Casual Mobile
**Screen/State**: Zone filter tabs
**Action Taken**: Looked at "Actives (N)" and "Aprendre (N)" tabs side by side
**Observed**: Both tabs show action names inside when active. The distinction is that "Actives" shows things you can execute now (purchased actions), while "Aprendre" shows things you can buy with 🧠. A new player who doesn't know the currency system will not understand why some actions are here and others are there. The button text on "Aprendre" rows reads "Aprendre (−N🧠)" which is consistent, but a player who starts on "Actives" and sees only base actions may never discover "Aprendre" exists.
**Expected**: A new player expects a single list of everything. The tab metaphor requires them to discover that there is more content hidden under other tabs.
**Verdict**: CONFUSING
**Severity**: Moderate

**Route to**: ux-designer

---

## Playtest Note: CM-10 — Tech strip pills: "c2", "c5", "c8" are meaningless to a new player
**Persona**: Casual Mobile
**Screen/State**: Tech status strip above zone grid
**Action Taken**: Read the pill labels (e.g. "🗣️ Llengua Bàsica c2")
**Observed**: The `.ts-cycle` span renders as a small subscript showing "c2", "c5", "c8". These are cycle threshold numbers (the tech unlocks at cycle 2, 5, or 8). But "c2" with no label reads as an abbreviation for "cycle 2" only if you already know the mechanic. The visual difference between green (ts-discovered), gold (ts-available), and grey (ts-pending) pills is reasonable as a traffic light, but without a legend the meaning of gold ("available now — go discover it!") vs grey ("not yet") is guesswork.
**Expected**: A new player would see three coloured labels and have no idea what to do with them. The gold one might catch attention but there is no call-to-action on the pill itself — the actual "Descobrir" button appears in a separate card above (universal-techs-section).
**Verdict**: CONFUSING
**Severity**: Minor

**Route to**: ux-designer

---

## Playtest Note: CM-11 — Destresa progress bar (52px, 3px height, 0.6 opacity) is invisible to casual player
**Persona**: Casual Mobile
**Screen/State**: Action row, under an action with a destresa_id (e.g. "Espiar el Ramat")
**Action Taken**: Looked at the row after executing the action
**Observed**: The `.zar-destresa-bar-track` is 52px wide and 3px tall with `opacity: 0.6`. On a dark background at 360px width with the overall dense layout, a 3px horizontal line at 60% opacity is essentially invisible at arm's length on a phone. It shows "0/5" in 9px monospace next to it. No label explains what this bar is for. The destresa name only appears once the destresa is fully unlocked (shown as "⭐ Name").
**Expected**: A casual player will not notice this bar at all. It is a debug artefact that communicates nothing actionable without prior knowledge of the destresa system.
**Verdict**: CONFUSING
**Severity**: Minor

**Note**: This is marked in game.js comments as "debug — player visibility TBD". Confirming: not visible to casual player, not distracting either — it disappears into noise.
**Route to**: ux-designer

---

## Playtest Note: CM-12 — Health warning uses CSS class changes only — no text warning before critical
**Persona**: Casual Mobile
**Screen/State**: Top bar, ❤️ counter approaching critical
**Action Taken**: Played several cycles and watched health decrease
**Observed**: The health counter changes CSS class: `stat-warning` at ≤8 (amber colour) and `stat-critical` at ≤4 (red/accent colour). There is no accompanying text warning, no animation, and no sound. The pill text simply changes colour from green to amber to red. On a busy mobile screen, a colour shift on a small pill at the top of the page may not register with a player focused on the action cards below.
**Expected**: A casual player expects a screen shake, a banner, or text that says "your character is dying" before it's too late. Colour alone on a 12px pill is insufficient warning.
**Verdict**: CONFUSING
**Severity**: Moderate

**Route to**: ux-designer

---

## Playtest Note: CM-13 — Succession warning appears but uses game jargon ("cicles", "successió")
**Persona**: Casual Mobile
**Screen/State**: Right panel, succession-warning banner (appears when ≤4 cycles left and no children)
**Action Taken**: Read the warning text: "⚠ Queden N cicles. Cal tenir fills per assegurar la successió."
**Observed**: The warning is visible (red-tinted banner) and the ⚠ icon catches attention. However, "Cal tenir fills per assegurar la successió" assumes the player knows: (1) what "successió" means in this context, (2) that there is a "Tenir Fills" action somewhere, (3) that not having it causes game over, not just loss of a bonus. The word "successió" is used as-is in both the warning and the modal title — no plain-language explanation anywhere.
**Expected**: A new player seeing this warning would not know what to do unless they happened to find the "Tenir Fills" action in Campament. They might think "successió" is a good thing that completes naturally.
**Verdict**: CONFUSING
**Severity**: Moderate

**Route to**: ux-designer

---

## Playtest Note: CM-14 — Succession modal "65% herència" is abstract without context
**Persona**: Casual Mobile
**Screen/State**: Succession modal (shown when cycle >= 14 or health <= 0, character has children)
**Action Taken**: Read the modal content
**Observed**: The modal text reads: "El fill hereta habilitats, destreses i stats (65%), i el 65% de les inclinacions." The number "65%" appears twice in the same sentence, once for stats and once for inclination. A casual player has not seen the term "stats" used (the UI shows "Atributs") or "inclinació" (shown as a dot visualiser). There is also a modal-summary block showing "Eix dominant: impuls (0.45)" — "eix" (axis) is untranslated jargon for a new player.
**Expected**: A casual player picking up the phone expects to understand immediately whether the succession event is good (a reward) or bad (a penalty). The 65% number sounds like a partial loss — players may feel punished. The concept is not framed positively as "your legacy continues".
**Verdict**: CONFUSING
**Severity**: Moderate

**Route to**: ux-designer

---

## Playtest Note: CM-15 — Game over "no heir" path gives no warning path — sudden death
**Persona**: Casual Mobile
**Screen/State**: Game over modal (no_heir path)
**Action Taken**: Let health reach 0 or cycle reach 14 without having children
**Observed**: The triggerSuccession() function checks `state.character.hasChildren`. If false, `state.gameOver = true` with reason `no_heir`. The succession warning only appears if `cyclesLeft <= 4 && !state.character.hasChildren`. If the player's health hits 0 before cycle 10, they get zero warning. The game over text "El personatge ha mort sense fills. El llinatge s'extingeix en aquesta generació." appears in the modal with no preceding visible alert on the main game screen.
**Expected**: A casual player expects death to be telegraphed — some kind of escalating warning before the game ends. A sudden modal saying "your lineage is extinct" on the second play session (before the player understands the mechanic) will feel unfair.
**Verdict**: FAIL
**Severity**: Blocking

**Route to**: ux-designer

---

## Playtest Note: CM-16 — "Inclinació" section in left panel: no explanation of what the dots mean
**Persona**: Casual Mobile
**Screen/State**: Left profile panel, "Inclinació" section
**Action Taken**: Looked at the four rows of five dots with left/right labels
**Observed**: Each row shows a left pole label (e.g. "Reflexiu") and right pole label (e.g. "Impulsiu") with 5 dots between them. One dot is lit (blue = left, grey = centre, gold = right). A new player can intuit "spectrum" from the dots, but the label "Inclinació" at the section header and the axis names ("impuls", "intel·lecte", etc.) are not on screen — only the human-readable poles are. This is actually the clearest part of the profile panel.
**Expected**: Most casual players will correctly read this as a personality slider. The two-pole labelling approach works without explanation.
**Verdict**: PASS
**Severity**: N/A

---

## Playtest Note: CM-17 — "Executar" button communicates cost but not reward before tapping
**Persona**: Casual Mobile
**Screen/State**: Action row, "Actives" tab
**Action Taken**: Read "Executar (−1🌾)" button and the zar-meta text above it
**Observed**: The meta line shows (e.g.) "1🌾→+2–5🌾 · Forca 1.0 · → Reflexiu" at 10px monospace. The cost-arrow-range pattern "1🌾→+2–5🌾" is readable if you stop to parse it, but on mobile at 10px with monospace font in dim colour on dark background, a casual player will not process this before tapping. The button shows the cost but not the expected gain. A new player will just tap "Executar" because it's the only green button.
**Expected**: A casual player taps the most obvious interactive element. The green "Executar" button is correctly prominent. The meta text is too small to read on mobile but it is supplementary info — core loop still works without it.
**Verdict**: PASS
**Severity**: N/A

---

## Playtest Note: CM-18 — "Cap branca activa" in profile panel — meaningless to new player
**Persona**: Casual Mobile
**Screen/State**: Left panel, "Branques actives" section at game start
**Action Taken**: Read the text "Cap branca activa" (no active branch)
**Observed**: The game starts with all inclination values at 0 (centre), so no branch conditions are met. The left panel shows "Cap branca activa" in italic grey. The profile label shows "Explorador". A new player has no idea that actions they take will change these values, that branches are personality archetypes, or that "Explorador" will change. The section exists but is visually dead on first load.
**Expected**: A casual player sees this text and ignores it. It does not prompt any action. The cause-effect relationship (execute actions → inclination shifts → branches appear) is invisible on first screen.
**Verdict**: CONFUSING
**Severity**: Minor

**Route to**: ux-designer

---

## Playtest Note: CM-19 — Top bar wraps unpredictably at 360px due to flex-wrap
**Persona**: Casual Mobile
**Screen/State**: Top bar at 360px viewport
**Action Taken**: Loaded the game on a narrow phone screen
**Observed**: `#top-bar` uses `display: flex; flex-wrap: wrap`. At 360px, the bar has 4 sections (Joc/Vitals/Saber/Progrés) plus 3 dividers. Each `.top-section` has `padding: 9px 16px` = 32px horizontal padding per section. Vitals section alone contains two pills side-by-side. At 360px, the combined min-width of all sections (4 × roughly 80–100px = 320–400px) is likely to cause one or two sections to wrap to a second line, making the top bar 2 rows tall and stealing 30–40px of screen real estate from the already cramped main panel.
**Expected**: A player on a 360px phone expects a single-line top bar. Wrapping creates a confusing visual hierarchy where the game title may appear on a different row than the stat pills.
**Verdict**: FAIL
**Severity**: Moderate

**Route to**: ui-programmer

---

## Playtest Note: CM-20 — Left panel renders BEFORE right panel on mobile (order: 1 / order: 2 swap)
**Persona**: Casual Mobile
**Screen/State**: Full game view at max-width 600px
**Action Taken**: Loaded on mobile and scrolled
**Observed**: The mobile breakpoint correctly applies `#actions-panel { order: 1; }` and `#profile-panel { order: 2; }` — meaning the zone grid (right panel on desktop) appears first on mobile, and the profile/stats panel appears below. This is the correct priority ordering for mobile. However, the profile panel is 260px wide on desktop (`grid-template-columns: 260px 1fr`) and switches to full-width single column on mobile. The profile panel contains many sections (Atributs, Inclinació, Llinatge, Família, Branques, Habilitats, Destreses) that stack vertically — this becomes a very long scroll at the bottom of the page, below all zone cards.
**Expected**: A casual player will likely never scroll down to see the profile panel on mobile. The character stats, inclination dots, and branch status are all invisible unless the player actively scrolls past all four zone cards and the action log.
**Verdict**: CONFUSING
**Severity**: Moderate

**Route to**: ui-programmer

---

## Summary
- Total notes: 20 (PASS: 2 · CONFUSING: 11 · FAIL: 4 · N/A: 3)
- Blocking issues:
  - CM-05: Zone filter tabs — ~20px tap height at 360px, well below 44px minimum
  - CM-06: "Executar/Aprendre" btn-small — visually collapses to ~19px height inside zone cards
  - CM-15: Health-reaches-0 game over has no warning path before sudden death modal
- Most pressing UX concern: The three filter tabs per zone card (CM-05) are the most-tapped element in the game and currently have approximately 20px effective tap height — a casual player one-handing a phone will miss-tap constantly, destroying the session.

---

**Routing summary**:
- **ui-programmer**: CM-05, CM-06, CM-07, CM-19, CM-20
- **ux-designer**: CM-08, CM-09, CM-10, CM-11, CM-12, CM-13, CM-14, CM-15, CM-18
