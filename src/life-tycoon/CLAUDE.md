# Life Tycoon — Source Directory

Vanilla JS browser game. Dynasty simulation in Catalan.

## Stack

- `index.html` — app shell, DOM structure
- `game.js` — all game logic (state, turns, events, lineage)
- `style.css` — layout and theming
- `data.js` — static data bridge
- `data/eras/prehistoria.json` — era definitions, zone actions, events

## Key DOM Landmarks

| ID | Purpose |
|----|---------|
| `#overlay-menu` | Main menu |
| `#overlay-new-game` | New game form |
| `#btn-new-game` / `#btn-start-new-game` | Menu entry points |
| `.zone-node` | Clickable map zones |
| `#overlay-zone-actions` | Zone action sheet |
| `#zone-carousel-viewport .zc-item` | Carousel items (tap, not click) |
| `#panel-top-resources` | Resource bar (food, health) |
| `#char-dashboard` | Character stats panel |
| `#btn-rest-cycle` | Pass to next cycle |
| `#btn-lineage-toggle` | Open lineage panel |

## Behaviour Notes

- `body.donut-active` intercepts all pointer events during loading animations —
  wait for it to clear before clicking anything.
- The carousel only fires on `touchend`, not `click` — always use `.tap()` in tests.
- `localStorage` keys: `lifetycoon_autosave`, `lifetycoon_history`, `lifetycoon_unlocks`

## Coding Rules

- Language: Catalan (UI strings, comments, variable names may be English)
- No frameworks — vanilla DOM only
- Gameplay values as `const` at top of file, never inline magic numbers
- No module bundler — plain `<script src="">` tags

## Tests

Visual QA lives in `tests/visual-qa/`. Run locally with:
```
npx playwright test tests/visual-qa/ --config tests/visual-qa/playwright.config.js
```
