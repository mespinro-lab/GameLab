# Technical Preferences

<!-- Populated by /setup-engine. Updated as the user makes decisions throughout development. -->
<!-- All agents reference this file for project-specific standards and conventions. -->

## Engine & Language

- **Engine**: HTML5 / Vanilla JavaScript (browser-based, no framework)
- **Language**: JavaScript (ES2022, `'use strict'`, no transpiler)
- **Rendering**: DOM + CSS (SVG/Canvas considered for M1 polish)
- **Physics**: N/A

## Input & Platform

- **Target Platforms**: Web (desktop primary, mobile secondary)
- **Input Methods**: Mouse/Keyboard (desktop), Touch (mobile)
- **Primary Input**: Mouse click / tap
- **Gamepad Support**: None
- **Touch Support**: Partial (tap-to-select works via click events; no drag gestures)
- **Platform Notes**: Must run from `file://` without a server in M0/M1. Responsive
  from 360 px (mobile) to 1440 px (desktop).

## Naming Conventions

- **Functions**: `camelCase` (e.g. `isValidSet`, `toggleTile`)
- **Variables**: `camelCase` (e.g. `hintSet`, `selected`)
- **Constants / config**: `UPPER_SNAKE_CASE` (e.g. `ELEMENTS`, `CATALYST_NAMES`)
- **Files**: `kebab-case` (e.g. `game.js`, `style.css`, `level-config.js`)
- **Scenes/Prefabs**: N/A (DOM-based)
- **HTML IDs**: `kebab-case` (e.g. `check-btn`, `hint-btn`)

## Performance Budgets

- **Target Framerate**: 60 fps (CSS transitions only; no rAF loop in M0)
- **Frame Budget**: N/A (no game loop)
- **JS Bundle Size**: < 30 KB unminified per file (M0 target)
- **Memory Ceiling**: No explicit ceiling; avoid DOM node accumulation on re-renders

## Testing

- **Framework**: Vanilla Node.js test runner (no Jest/Vitest until M2 when test
  complexity warrants it). Unit tests in `tests/unit/alchemix/`.
- **Minimum Coverage**: Core logic functions (`isValidSet`, `findSet`) — 100%.
  DOM-dependent code excluded from unit coverage.
- **Required Tests**: `isValidSet` all 9 attribute combinations, `findSet`
  returns null for boards with no valid SET, board-empty win detection.

## Forbidden Patterns

- No UI frameworks (React, Vue, etc.) — vanilla DOM only through M1
- No module bundlers (Webpack, Vite) through M1 — plain `<script src="">` tags
- No hardcoded game values in JS — tuning knobs must be `const` declarations at
  the top of the file or in a separate `config.js`
- No inline styles on tiles — use CSS classes; JS only adds/removes class names

## Allowed Libraries / Addons

- None approved yet. CSS animations via native `@keyframes` only.

## Architecture Decisions Log

- [No ADRs yet — use /architecture-decision to create one]

## Engine Specialists

- **Primary**: `gameplay-programmer` (vanilla JS game logic)
- **Language/Code Specialist**: `gameplay-programmer`
- **Shader Specialist**: `technical-artist` (CSS/SVG visual effects)
- **UI Specialist**: `ui-programmer`
- **Additional Specialists**: N/A
- **Routing Notes**: No Godot/Unity/Unreal specialists needed for this project.

### File Extension Routing

| File Extension / Type | Specialist to Spawn |
|-----------------------|---------------------|
| `.js` (game logic) | `gameplay-programmer` |
| `.css` (visual/layout) | `ui-programmer` |
| `.html` (structure/screens) | `ui-programmer` |
| `.svg` (icons/art) | `technical-artist` |
| Config / balance JSON | `economy-designer` |
| General architecture review | `lead-programmer` |
