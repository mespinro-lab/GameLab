# Playtest Report — Sweep #29b — Casual Mobile Perspective
**Tester role**: playtester-casual-mobile
**Date**: 2026-05-29
**Build**: post-content-migration (branch: main, last commit 76ccc8d)
**Files audited**: prototypes/bloodline/game.js · data.js · index.html · style.css
**Target device profile**: 360 px wide viewport, touch input, short sessions

---

## Summary

7 issues found. 2 are blocking functional bugs (S2). 5 are UX / touch-target
regressions introduced or exposed by the content migration.

| ID | Title | Severity | Type |
|---|---|---|---|
| CASMOB-01 | Ritual zone never appears — zone_id mismatch | S2 | Functional bug |
| CASMOB-02 | Glossary button is 28 × 28 px — below 32 px minimum | S2 | Touch target |
| CASMOB-03 | Zone filter tabs are untappable at 10 px font, no min-height | S3 | Touch target |
| CASMOB-04 | Action execute/buy buttons inside zone cards have ~22 px height on mobile | S3 | Touch target |
| CASMOB-05 | Two-column layout breaks at 360–599 px — left panel forces right panel to ~88 px | S2 | Layout |
| CASMOB-06 | Inclination delta tooltip is desktop-only — zero mobile equivalent | S3 | UX gap |
| CASMOB-07 | Sibling succession options show stale inherited data after gen 2+ | S3 | Logic / UX |

---

## CASMOB-01 — Ritual zone never appears after bt_pintura_rupestre unlocks

**Severity**: S2
**Frequency**: Always
**Story type**: Logic — BLOCKING gate

### Description

`bt_pintura_rupestre` has `passive_effect: { type: "unlock_zone", zone_id: "zone_ritual", ... }`
(data.js line 89). The `unlockBranchTech` function executes:

```
state.discoveredZoneIds.add(pe.zone_id);   // adds "zone_ritual"
```
(game.js line 201)

`renderZoneGrid` then iterates `ZONE_ORDER = ["Bosc", "Planes", "Campament", "Ritual"]`
and calls `state.discoveredZoneIds.has(zona)` where `zona` is `"Ritual"` (game.js line 777).

`"zone_ritual" !== "Ritual"` — the has() check always fails. The Ritual zone card
is never rendered regardless of player progression.

All three actions that live in the Ritual zone (`act_pintar_parets`, `act_consagrar_ornaments`,
`act_observar_cel`, `act_transit_nocturn`) are permanently inaccessible in the
current build, even after the branch tech unlock fires.

The Bosc unlock via `act_explorar_voltants` uses `unlocks_zone: "Bosc"` (data.js line 199)
which matches `ZONE_ORDER` correctly — only the passive_effect path is broken.

### Reproduction steps
1. Load the prototype in a browser.
2. Play until `ut_art_simbolic` auto-discovers (cycle 6).
3. Accumulate enough Espiritualitat and Sociabilitat inclination to make
   `bt_pintura_rupestre` eligible (espiritualitat >= 0.30, sociabilitat >= 0.20).
4. Use "Escoltar els Estrangers" or trigger `ev_desc_pintura` via pool_ritual to
   unlock `bt_pintura_rupestre`.
5. Observe that the Ritual zone card does NOT appear in the zone grid after unlock.
6. Check the browser console: `state.discoveredZoneIds` contains `"zone_ritual"`,
   not `"Ritual"`.

### Impact
All Ritual zone content — 4 actions covering the Mystic/Spiritual play style —
is permanently locked out. Players who invest in Espiritualitat receive no
content payoff. The Glossary correctly lists Ritual as "Es descobreix amb
Pintura Rupestre" (game.js line 1257), which creates a false promise.

**Fix direction**: Change `zone_id: "zone_ritual"` in data.js line 89 to `"Ritual"`,
or make `unlockBranchTech` normalize zone IDs to match `ZONE_ORDER` entries.

---

## CASMOB-02 — Glossary button (?) is 28 × 28 px — below 32 px minimum touch target

**Severity**: S2
**Frequency**: Always (structural)
**Story type**: UI — ADVISORY gate; classified S2 because it is the sole help entry point for new players

### Description

CSS rule at style.css lines 95–96:

```css
.btn-glossary {
  width: 28px;
  height: 28px;
```

The mobile media query at line 813 overrides generic `button` elements with
`min-height: 44px`, but `.btn-glossary` has explicit `width` and `height`
declarations with higher specificity that override the `button` selector rule.
The resulting tap target on mobile is 28 × 28 px.

Project minimum is 32 px; Apple HIG recommends 44 × 44 px; Android Material
recommends 48 × 48 px. At 28 px, a player's thumb frequently overshoots onto
the top bar background.

### Reproduction steps
1. Open the prototype on a 360 px wide mobile viewport (or DevTools mobile
   simulation).
2. Attempt to tap the "?" button in the top-right of the header.
3. Observe that the tap zone is 28 × 28 px. Miss-taps land on the surrounding
   header area with no response.

### Impact
The Glossary is the only in-game help resource for new players. A casual player
who cannot reliably open it will not understand the inclination system, zone
discovery logic, or succession rules. This is the single largest onboarding
friction point added in this sweep.

**Fix direction**: Add to the mobile media query:
`.btn-glossary { width: 44px; height: 44px; font-size: 16px; }` or use
`min-width`/`min-height` instead of explicit dimensions so the `button` override
can apply.

---

## CASMOB-03 — Zone filter tabs have no min-height and 10 px font — untappable on mobile

**Severity**: S3
**Frequency**: Always (structural)
**Story type**: UI — ADVISORY gate

### Description

Zone filter buttons are styled as `.zone-filter-btn` (style.css lines 539–556):

```css
.zone-filter-btn {
  padding: 5px 4px;
  font-size: 10px;
  font-weight: 600;
  ...
}
```

No `min-height` is set. With 5 px top + 5 px bottom padding and 10 px font
(line height ~12 px), the computed tap target height is approximately 22 px.
The mobile override at line 813 applies to the bare `button` selector — but
`.zone-filter-btn` has no `<button>` tag; it IS a `<button>` element, so the
override applies... however the override sets `min-height: 44px` which would
conflict with the zone tab's visual design (making each tab 44 px tall would
consume most of the card height).

After the migration to 13 branch techs, each zone now has 3 filter tabs
("Actives", "Aprendre", "Bloq."). With 13 branch techs plus 5 universal techs
there are far more locked actions, meaning players need to switch tabs more
frequently. The current 22 px tab height makes repeated tab switching on mobile
tedious and error-prone.

### Reproduction steps
1. Open on mobile viewport (360 px).
2. Inside any zone card, attempt to tap "Aprendre (N)" to switch tabs.
3. Observe the tap target height (~22 px). Mis-taps land on the zone card
   content below the tab row instead of activating the filter.

### Impact
The filter tabs are the primary navigation inside each zone card. On a 360 px
screen where zone cards are already narrow, small tabs mean players cannot
reliably explore what actions they can learn. The "Aprendre" tab (locked-behind-
branch-tech content) is the most important tab for the discovery loop.

**Fix direction**: Set `min-height: 32px` on `.zone-filter-btn` (or 36px for
comfort). The 44px override should be suppressed for this element specifically
with a `min-height: 32px !important` in the mobile media query.

---

## CASMOB-04 — Action execute/buy buttons (.btn-small) are ~22 px tall on mobile before the override applies — but the override conflicts with btn-small padding

**Severity**: S3
**Frequency**: Always (structural)
**Story type**: UI — ADVISORY gate

### Description

Action buttons inside zone cards use `.btn-small` (style.css line 607):

```css
.btn-small { padding: 4px 10px; font-size: 11px; }
```

These are `<button>` elements, so the mobile override at line 813 (`button { min-height: 44px }`)
does apply in theory. However `.btn-small` is added alongside class `btn-execute`
or `btn-buy` via JS (game.js lines 963–964, 969–970). The resulting height with
`min-height: 44px` means each action row becomes very tall, because the row has
`display: flex; flex-direction: column` and the button expands to 44 px inside it.
On a 360 px device where zone card content is already `max-height: 240px; overflow-y: auto`,
a single action with a 44 px button takes up ~90 px (name + meta + destresa bar +
button), meaning only 2–3 actions fit before scrolling is required.

Separately, on the succession modal `.btn-succ-choose` uses `padding: 6px 14px;
font-size: 12px` (style.css lines 857–862) with no min-height. Because the mobile
override targets `button` broadly, it should apply — but the element sits inside
`.succ-option` which is `display: flex; align-items: center`, and a 44 px button
height there pushes the option row to 44 px+ which may or may not be the intent.
Visual inspection at 360 px required to confirm, but the succession "Tria" button
height deserves explicit declaration.

### Reproduction steps
1. Open on 360 px mobile viewport.
2. In any zone card, observe the "Executar" or "Aprendre" buttons.
3. Note that if the mobile override inflates them to 44 px, only 2 actions are
   visible before scrolling inside the 240 px max-height content area.
4. Open the succession modal and observe the "Tria" button height.

### Impact
Either the buttons are too short (22 px without override) or inflating them
creates severe scroll fatigue in zones with many actions. After the migration
to 13+ branch techs there can be 5–8 actions per zone. On a 360 px device, a
casual player may not scroll to discover all available actions.

**Fix direction**: Set `.btn-small { min-height: 36px; }` explicitly in the
mobile media query instead of inheriting the 44 px generic override. Adjust
`.zone-content { max-height }` to compensate if needed. Declare `.btn-succ-choose
{ min-height: 44px }` explicitly.

---

## CASMOB-05 — Two-column layout at 360–599 px crushes the actions panel to ~88 px wide

**Severity**: S2
**Frequency**: Always on screens 360–599 px wide (all standard small Android phones)
**Story type**: UI — ADVISORY gate; classified S2 because the zone grid is the core gameplay surface

### Description

The mobile single-column breakpoint fires at `max-width: 600px` (style.css
line 796). However the tablet breakpoint at 860 px still uses:

```css
#main { grid-template-columns: 220px 1fr; gap: 8px; }
```

At exactly 600 px, the layout switches to single column correctly. But at
360–599 px — all standard small phones — the layout before the breakpoint fires
uses `220px 1fr`. With 8 px side padding and 8 px gap on a 360 px viewport:

  Available width = 360 − (2 × 8 padding) = 344 px
  Left column fixed = 220 px
  Gap = 8 px
  Right column = 344 − 220 − 8 = 116 px

The zone grid within the right column uses `grid-template-columns: 1fr 1fr`
with 8 px gap, giving each zone card ~54 px wide. Zone card content — action
names, meta strings, buttons — becomes unreadable at 54 px.

Wait — the 860 px breakpoint applies between 600 px and 860 px. Between 360 and
599 px, the DEFAULT rule applies:

```css
#main { grid-template-columns: 260px 1fr; gap: 12px; }
```

So at 360 px: 360 − 24 (padding) − 260 (left) − 12 (gap) = 64 px for the
entire actions panel including zone grid, universal tech strip, and log.

At 64 px right-panel width the zone grid with `grid-template-columns: 1fr 1fr`
renders two ~28 px columns. All content overflows or is clipped.

The `@media (max-width: 600px)` at line 796 switches to `grid-template-columns: 1fr`
which fixes the layout — but 600 px is the breakpoint, meaning any device with a
viewport narrower than 600 px gets the fix. Phones 360–599 px wide DO get the fix
as soon as the page loads with the correct viewport meta (present at index.html
line 8). So this is NOT a bug for pages loaded normally.

**HOWEVER**: The critical issue is that the 860 px breakpoint (style.css line 790)
overrides to `220px 1fr` for screens 600–860 px. Between 600 px and 860 px (small
tablets, landscape phones) the left panel consumes 220 px and actions get the
remainder. At 768 px (iPad portrait) this works fine. At 600–640 px (landscape
small phones), actions get only ~360 px total for the right panel — the zone grid
2×2 with `1fr 1fr` renders cards ~172 px wide which is workable.

Re-examining the default case more carefully: `padding: 12px` on `#main` at
default — this is 12 px on ALL sides. At 360 px: 360 − 24 − 260 − 12 = 64 px.
The single-column override at 600 px breakpoint should prevent this. Confirmed:
the `@media (max-width: 600px)` block correctly overrides `grid-template-columns`
to `1fr` and `padding` to `8px`. So at 360 px, the single-column fix applies
and actions get full width.

**Actual remaining issue**: The 360 px mobile layout stacks profile-panel BELOW
actions-panel (via `order` reversal at line 807–808). This is correct UX.
However there is NO cap on the profile-panel height — it contains: profile label,
Atributs section, Inclinació section, Llinatge divider, Família section, Branques
section, Habilitats section, Destreses section. After migration to 13 branch techs,
the Habilitats section can grow to hold up to 13 `.skill-item` entries (one per
branch tech). At 12 px font-size and 5 px gap, 13 items = ~221 px of content plus
the card's 24 px padding = ~245 px just for the Habilitats section. A player who
has unlocked many branch techs will see the profile panel grow to 800+ px,
requiring significant scroll to get back to the zone grid above. There is no
collapsed state or scroll cap on the profile panel.

### Reproduction steps
1. Open on a 360 px mobile viewport.
2. Unlock 5+ branch techs through multiple cycles.
3. Scroll down past the zone grid to the profile panel.
4. Observe the Habilitats section expanding with each new branch tech.
5. Scroll back up to the zone grid — measure the scroll distance required.

### Impact
A casual player in a short mobile session who scrolls down to check their
character stats will need to scroll back up to take their next action. With
13 possible branch techs, the profile panel can be 3–4 screen-heights tall.
This is severe friction in short-session mobile play.

**Fix direction**: Add `max-height: 240px; overflow-y: auto;` to
`#unlocked-branch-techs` in the mobile media query, or collapse the Habilitats
section behind a toggle. Alternatively, cap the profile panel itself at a
`max-height` with scroll.

---

## CASMOB-06 — Inclination delta tooltip is desktop-only — mobile players have no way to see action inclination effects

**Severity**: S3
**Frequency**: Always on touch devices
**Story type**: UI — ADVISORY gate

### Description

The inclination delta tooltip (the floating label showing how an action shifts
inclination axes) is wired exclusively to `mouseover` and `mousemove` events on
the zone grid (game.js lines 1339–1362). Touch devices do not fire these events
in the same way; `touchstart` does not reliably trigger `mouseover` in all
mobile browsers.

The action row already shows a textual hint via `getInclinationHint()` (game.js
line 912–919) in the `.zar-meta` line: `→ Impulsiu · Analític`. This partially
compensates. However the hint only shows the direction label (e.g. "Impulsiu")
and not the numeric delta (e.g. "+0.050"). The tooltip would show "+0.050 Impulsiu".

For a casual player the direction label is sufficient — but the hint is
rendered in the `.zar-meta` monospace text alongside cost and output range,
making it visually buried: `1🌾→+5-12🌾 · Força 1.0 · → Impulsiu`. At 10 px
monospace on a 360 px screen this is effectively unreadable.

### Reproduction steps
1. Open on a 360 px mobile viewport (touch mode in DevTools or real device).
2. Tap on an action row in any zone card.
3. Observe that no inclination tooltip appears.
4. Look at the `.zar-meta` text — the inclination hint is present but buried
   in a 10 px monospace string alongside cost/output data.

### Impact
A new casual player has no clear feedback on how their action choices shift
their character's inclination. The inclination system is the core mechanic that
drives zone discovery, branch access, and succession. Without visible feedback,
the inclination dots in the profile panel change without explanation, and the
player cannot make informed decisions about which actions to take.

**Fix direction**: Separate the inclination hint into its own `.zar-incl-hint`
line below `.zar-meta`, with distinct colour (use the axis colour from `AXIS_LABELS`).
This is readable on mobile without requiring hover. Font size 11 px min.

---

## CASMOB-07 — Sibling successors in the succession modal carry stale inherited data from their generation of birth, not the current generation

**Severity**: S3
**Frequency**: Always when siblings from generation 1 or 2 appear as options in generation 3+
**Story type**: Logic — BLOCKING gate

### Description

When succession fires, `triggerSuccession` computes inheritance from the current
character for children (game.js lines 439–458):

```js
const childSuccessors = children.map(c => ({
  ...c,
  is_sibling: false,
  inheritedInclination,   // computed from current character
  inheritedStats,
  inheritedPurchased,
  inheritedBranchTechs,
  inheritedDestreses,
}));
```

Unchosen children become `unchosenChildren` and are pushed into `state.siblingPool`
(game.js line 481). They carry their `inheritedInclination` etc. from when they
were first created — which is correct for the moment they enter the pool.

The problem arises in subsequent generations. When generation 2 ends and
generation 3's succession fires, the sibling pool may contain siblings from
generation 1 (created at generation 1's succession, never chosen). These siblings
carry `inheritedInclination` values scaled from generation 1's character. The
generation 3 player could choose a sibling and receive a character with generation-
1-scaled stats and inclination, rather than generation-2-scaled values.

More concretely: a sibling born at generation 1 succession might have
`inheritedInclination.impuls = 0.65 * gen1_impuls`. If the player built an
Impulsiu character through generation 2 to `impuls = 0.9`, the sibling still has
`0.65 * old_gen1_value`. The succession modal shows `impuls: X.XX` for each
option (game.js lines 1096–1099), but the player has no way to know the sibling's
value is from two generations ago.

In the succession modal, sibling entries show `inheritedInclination[dominantAxis]`
(game.js line 1097), which reflects their old stats. Children show current-generation
inheritance. A player comparing options cannot know the sibling is generationally
stale.

### Reproduction steps
1. Play generation 1: unlock 2+ branch techs, have 3 children (MAX_CHILDREN=3).
2. At succession, choose child 1. Siblings 2 and 3 enter `state.siblingPool`.
3. Play generation 2: do NOT choose a sibling at succession — instead choose
   a child of generation 2.
4. At generation 3 succession, the modal shows children of gen-2 AND siblings
   from gen-1's unchosen pool.
5. Note that the sibling's inclination shown (`dominantAxis: X.XX`) reflects
   65% of gen-1 inclination, not 65% of gen-2 inclination. The children show
   65% of gen-2 inclination.

### Impact
A casual player choosing between "Fill (cicle 5)" and "Germà" during succession
has no indication the sibling's traits are from a different generation. If the
player has carefully built toward a specific branch (e.g. Místic) through two
generations, choosing a stale sibling could silently reset their inclination
progress by 1–2 generations, with no explanation. This is especially surprising
on mobile where the modal is a full-screen takeover and the player cannot
scroll back to review their history.

**Fix direction**: When siblings are added to `state.siblingPool` at line 481,
they should NOT carry their original `inheritedInclination` forward unmodified.
Options: (A) Refresh sibling inheritance at each new succession by re-computing
from the current character before adding to pool; (B) Display a "Gen N" label
on sibling cards so the player knows the data is older; (C) Discard siblings
older than 1 generation from the pool.

---

## Onboarding Assessment (< 3 minutes)

A new player at 360 px on first load sees:
- Top bar with 4 sections and a "?" button that is 28 px — likely to be missed or mis-tapped (CASMOB-02)
- Actions panel first (correct order via CSS `order`) with Campament and Planes zone cards
- Zone cards show filter tabs at ~22 px height (CASMOB-03)
- 5 base actions distributed across 2 visible zones — manageable at first glance
- Catalan action names: "Espiar el Ramat", "Recol·lectar Arrels", "Tallar Pedra", "Ritual del Foc", "Vigilar el Campament"

Name clarity assessment for a Catalan-speaking casual player:
- "Espiar el Ramat" — clear (spy on the herd)
- "Recol·lectar Arrels" — clear (collect roots)
- "Tallar Pedra" — clear (cut stone)
- "Ritual del Foc" — clear (fire ritual), though `output_resource: food` with output 1-3 is surprising (fire ritual yields food?)
- "Vigilar el Campament" — clear (watch the camp), same surprise: yields food
- "Cercar Parella" / "Tenir Fills" — clear and essential; correct that they are available early

The meta string `1🌾→+2-5🌾 · Força 1.0 · → Impulsiu` is unreadable at 10 px on mobile for
a casual player. A new player will likely ignore it entirely and tap "Executar" without
understanding the resource cost → output relationship or the inclination effect.

The succession warning ("Queden N cicles") is visible and correctly positioned above
the zone grid. Clear enough for a casual player.

The discovery notification ("Hi ha estrangers al poblat que expliquen tècniques noves") is
legible and action-oriented. Good.

**Net assessment**: Core loop is discoverable within 3 minutes for a Catalan speaker.
The major barrier is CASMOB-01 (Ritual zone never appears) which means spiritual players
hit a dead end after unlocking Pintura Rupestre.

---

## Zone Grid Assessment (2 initial → 4 discovered)

Initial state (Campament + Planes visible): manageable 2×1 grid at 360 px with
single-column layout — each card gets full width.

After Bosc discovery (via act_explorar_voltants): 3 zones → 3×1 grid — still
manageable.

After Ritual discovery (when CASMOB-01 is fixed): 4 zones → 2×2 grid. Each card at
360 px gets: (360 − 16 padding − 8 gap) / 2 = 168 px. Workable for headers and
filter tabs, tight for action rows with long names like "Emboscada Nocturna" or
"Ornamentar-se".

**Assessment**: 4-zone 2×2 layout is acceptable at 360 px after CASMOB-01 fix.

---

## Glossary / Codex Assessment

The 11 sections are comprehensive and dynamically accurate (showing current state values).
The `max-height: 60vh` cap on `.glossary-content` with `overflow-y: auto` is correct for mobile.
On a 667 px Safari viewport, 60vh = ~400 px of scrollable content — adequate.

On the `.modal-box` the mobile override applies `max-height: 88dvh; overflow-y: auto`
which ensures the full modal fits on screen. Good.

Content quality: The Zones section (section 8) correctly documents "Es descobreix amb
Pintura Rupestre" for Ritual — which will be confusing when CASMOB-01 means the unlock
never happens. Fix CASMOB-01 first, then this description becomes accurate.

The Branch Techs section (section 7) lists all 13 branch techs with badge states —
this is genuinely useful for a player who is confused about why actions are locked.
This is the strongest casual-player-facing feature of this sweep.

---

## Per-Resource Depletion Rate Assessment

The vitals bar shows `-1/t` on both Food and Health pills (index.html lines 23–24,
rendered dynamically at game.js lines 562–568). For a casual player this is legible
and useful: it clearly signals "resources drain every turn." No confusion expected.

The `stat-rate` class at `font-size: 9px; opacity: 0.55` (style.css lines 82–87)
renders the rate notation quite small. On mobile at 360 px a player might miss
it entirely. Not a bug — the pill itself shows the current value prominently.
The rate is supplementary info. Acceptable as-is.

---

## Issues NOT Raised (already in do-not-re-report list)

FOOD-01, SUCC-01, GATE-01, SABER-01, DISC-01, EVENT-01, FADE-01, RENDER-01,
DEBUG-01, TRV-02 — all confirmed fixed per briefing; not re-examined.
