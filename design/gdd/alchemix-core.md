# Alchemix — Core Puzzle System GDD

**Version:** 0.2 — post-M0 validation  
**Date:** 2026-04-24  
**Status:** Active

---

## 1. Overview

Alchemix is a browser-based puzzle game built on the SET mechanic: the player
sees a board of tiles, each carrying two attributes (Element and Catalyst), and
must identify groups of three tiles where every attribute is either all-identical
or all-different across the three tiles. The game is played in discrete levels,
each introducing new visual polish, layout variation, and — in later levels —
additional attribute dimensions that increase combinatorial depth. The core loop
is: scan → select → validate → clear → repeat until the board is empty.

---

## 2. Player Fantasy

The player feels like an alchemist who perceives hidden order in apparent chaos.
Finding a SET is a "click moment" — a sudden pattern recognition that feels earned
rather than lucky. The game respects the player's intelligence: no hand-holding
beyond the initial tutorial, no timers in early levels, and progressive revelation
of complexity. Mastery is visible: the board empties faster as pattern recognition
improves.

---

## 3. Detailed Rules

### 3.1 Tile Attributes

| Attribute | Values (M0–M2) | Visual encoding |
|-----------|----------------|-----------------|
| Element   | fire / water / earth | Background colour (red / blue / green) |
| Catalyst  | copper / silver / gold | Symbol (● / ▲ / ■) |

Higher levels may introduce additional attribute dimensions (e.g. Intensity:
weak / medium / strong). New dimensions are never retrofitted into earlier levels.

### 3.2 Full Deck

A full deck for A attributes × V values each contains V^A tiles, each with a
unique combination. At M0 (A=2, V=3): 9 tiles.

### 3.3 Board Setup

All tiles from the full deck are placed on the board at game start. Layout is a
rectangular grid (3×3 for 9 tiles; 3×4 for 12 tiles, etc.).

### 3.4 SET Definition

Three tiles form a **valid SET** if and only if, for every attribute:
- all three values are **identical**, OR
- all three values are **distinct** (no two match).

Two-out-of-three (i.e. a pair) is always invalid.

### 3.5 Selection & Validation

1. The player selects tiles one at a time by clicking (or tapping).
2. Up to 3 tiles may be selected simultaneously.
3. Clicking a selected tile deselects it.
4. When exactly 3 tiles are selected, the **Check SET** button activates.
5. A successful SET removes those 3 tiles from the board.
6. A failed attempt deselects all 3 tiles; no penalty beyond lost time.

### 3.6 Win Condition

The board is cleared (all tiles removed by valid SETs). Each 9-tile board yields
exactly 3 SETs (9 ÷ 3 = 3 moves to clear), though the order matters.

### 3.7 Hint System

- The player may request one Hint at any time (no usage limit in M0).
- The Hint reveals one valid SET by highlighting those 3 tiles.
- Hint stays visible until: the player clicks a non-hinted tile, the player
  clicks Hint again (toggle-dismiss), or the player submits a Check.
- Clicking a hinted tile adds it to the selection without dismissing the hint.
- After a SET is removed and the board rebuilds, any active hint is cleared
  (board indices change; the hint cannot be safely preserved).
- **Design constraint:** the hint must never select tiles on behalf of the player
  or auto-submit — it is informational only.

---

## 4. Formulas

### 4.1 SET Probability

For a deck with A attributes and V values each, three randomly-chosen distinct
tiles form a valid SET with probability:

```
P(valid SET) = (1/V)^(A-1)
```

| A (attributes) | V=3 | Notes |
|----------------|-----|-------|
| 2 | 1/3 ≈ 33% | M0 baseline — generous |
| 3 | 1/9 ≈ 11% | Future mid-game depth |
| 4 | 1/27 ≈ 4% | Classic SET card game |

### 4.2 Expected SETs on a Board of N Tiles

```
E[SETs] = C(N, 3) × P(valid SET)
         = N! / (6 × (N-3)!) × (1/V)^(A-1)
```

| N | A=2, V=3 | A=3, V=3 |
|---|----------|----------|
| 9  | ~9.3  | ~3.1 |
| 12 | ~29.3 | ~9.8 |
| 15 | ~68.2 | ~22.7 |

At M0 (N=9, A=2): ~9 distinct SETs exist, giving the player ample choices and
ensuring the board is never unsolvable at start.

### 4.3 Score

```
score = number of valid SETs submitted
```

No bonus/penalty multipliers in M0. Score is informational — used for future
leaderboard and achievement hooks.

---

## 5. Edge Cases

| Situation | Handling |
|-----------|----------|
| Board has no valid SETs remaining | Cannot happen at M0 with full 9-tile deck (9 is divisible by 3 and deck is constructed). Hint button reports "No SETs available" as a guard. |
| Player submits same 3 tiles twice | Second submission fails identically — no special handling needed. |
| Player clicks Hint with 1–2 tiles already selected | Hint highlights 3 new tiles; current selection is not cleared. If selected tiles overlap with hint tiles, they remain selected and highlighted simultaneously. |
| Player clicks Hint when board has no SET | Message "No SETs available on this board" shown; no highlight. This state should not arise in M0 but is handled defensively. |
| Board cleared exactly | Win screen shown; Check and Hint buttons disabled. |
| Partial-level deck (future levels with non-9 tile counts) | `findSet` must handle N<3 gracefully (returns null); board shows win state. |

---

## 6. Dependencies

| System | Dependency type | Notes |
|--------|-----------------|-------|
| Tutorial (M3) | Consumes | Tutorial overlays the board; must not conflict with hint highlighting. Uses the same tile selection API. |
| Visual / UX layer (M1) | Consumes | Board layout, tile appearance, animations wrap this core logic. Core logic emits no DOM events — rendering is always triggered by state change. |
| Level Progression (M2) | Configures | Progression system sets `ELEMENTS`, `CATALYSTS`, grid size, and time limits per level. Core logic is agnostic to these values. |
| Score / Leaderboard (M3+) | Reads `score` | Core exposes `score` as a module-level value; caller reads it on win. |

---

## 7. Tuning Knobs

| Knob | Current value | Notes |
|------|---------------|-------|
| `ELEMENTS` | `['fire','water','earth']` | Array length = V for attribute 1 |
| `CATALYSTS` | `['copper','silver','gold']` | Array length = V for attribute 2 |
| Grid columns | 3 | Derived from `ceil(sqrt(N))` in future layout system |
| Hint: usage limit | Unlimited | Clamp to N hints/board in future levels |
| Hint: auto-dismiss | Never (manual only) | Could add 10-s timeout in speedrun mode |
| Fail animation delay | 1400 ms | Time board is locked after invalid SET |
| Success animation delay | 900 ms | Time before board rebuilds after valid SET |

---

## 8. Acceptance Criteria

### M0 (complete)
- [x] Board renders all 9 tiles in a 3×3 grid
- [x] Each tile displays both attributes (colour + symbol)
- [x] Player can select and deselect tiles by clicking
- [x] Check SET button activates only when exactly 3 tiles are selected
- [x] Valid SETs remove the 3 tiles and update the board
- [x] Invalid SETs show an error message and deselect without removing tiles
- [x] Hint highlights a valid SET; stays until dismissed (click outside, toggle, or Check)
- [x] Win state detected and shown when board is empty
- [x] New Game resets board to full 9-tile state

### M1 — Visual Polish (complete)
- [x] Tile graphics replaced with alchemical SVG icons (♀ copper, ☽ silver, ☉ gold)
- [x] Element badge (flame / drop / hexagon) as subtle corner icon per tile
- [x] Smooth tile-removal animation (flash → dissolve → shrink)
- [x] Board-entry animation on game start (staggered scale+rotate+fade)
- [x] Selection state has tactile feel (scale + gold glow border)
- [x] Invalid SET shake animation (left-right oscillation)
- [x] Responsive layout: board fits 360px–1440px viewports
- [x] `prefers-reduced-motion` respected (animations skipped, functional fade kept)
- [x] Touch-device hover fixed (`@media (hover: hover)` gate)
- [x] WCAG 2.5.5 touch target size (44px min-height on all buttons)
- [ ] Colour-blind accessible palette (symbol alone sufficient without colour) — deferred to M2 UX pass

### M2 — Level Progression
- [ ] Level select screen (at minimum: levels 1–5)
- [ ] Per-level config: tile deck composition, grid size, time limit (optional)
- [ ] Levels 1–3: 2 attributes, no timer (current ruleset)
- [ ] Levels 4–5: 2 attributes + optional countdown timer
- [ ] Level completion screen with score and time
- [ ] Persistent best-score per level (localStorage)

### M3 — Tutorial
- [ ] Tutorial overlay for level 1: guided selection of a pre-arranged valid SET
- [ ] Step-by-step explanation of the SET rule (one attribute at a time)
- [ ] Tutorial skippable for returning players (stored in localStorage)
- [ ] Tutorial does not conflict with Hint system
