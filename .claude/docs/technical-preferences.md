# Technical Preferences

<!-- Populated by /setup-engine. Updated as the user makes decisions throughout development. -->
<!-- All agents reference this file for project-specific standards and conventions. -->

> Engine decision recorded in `docs/architecture/ADR-001-engine-godot4.md`.
> Godot version pinned in `docs/engine-reference/godot/VERSION.md` (4.6).

## Engine & Language

- **Engine**: Godot 4.6 (pinned — see `docs/engine-reference/godot/VERSION.md`)
- **Language**: GDScript with **static typing enforced** (typed vars, typed
  returns, `class_name` for shared types). No GDScript without types.
- **Rendering**: 2D / CanvasItem (UI-driven, card-and-panel layout)
- **Physics**: N/A (turn-based; no physics simulation required)

> **Knowledge gap**: the LLM's Godot knowledge is ~4.3. Versions 4.4–4.6
> introduced breaking changes (Jolt default, D3D12 default on Windows, glow
> rework, shader/IK changes). **Cross-reference `docs/engine-reference/godot/`
> before suggesting any Godot API call.**

## Input & Platform

- **Target Platforms**: iOS + Android (portrait, touch-first). Web export usable
  as a development preview only — not a shipping target.
- **Input Methods**: Touch (primary); mouse/keyboard for desktop preview only
- **Primary Input**: Tap
- **Gamepad Support**: None
- **Touch Support**: Full (tap to select/purchase/execute; overlays for events)
- **Platform Notes**: Portrait orientation. Save must survive an OS background-kill
  (iOS/Android). Layout responsive within portrait phone form factors.

## Naming Conventions

- **Functions**: `snake_case` (e.g. `apply_inclination_deltas`, `can_unlock`)
- **Variables**: `snake_case` (e.g. `branch_tech`, `current_char`)
- **Constants / config**: `UPPER_SNAKE_CASE` (e.g. `INERTIA_FACTOR`, `EVENT_CHAIN_DECAY`)
- **Classes / `class_name`**: `PascalCase` (e.g. `DataLoader`, `ActionData`, `GameState`)
- **Files (scripts)**: `PascalCase.gd` for `class_name`-bearing core systems
  (e.g. `DataLoader.gd`); `snake_case.gd` acceptable for scene-bound scripts
- **Scenes (`.tscn`)**: `snake_case` (e.g. `era_scene.tscn`, `action_card.tscn`)
- **Signals**: `snake_case`, past-tense event names (e.g. `action_executed`,
  `branch_tech_unlocked`)
- **Node names**: `PascalCase` in the scene tree

## Performance Budgets

- **Target Framerate**: 60 fps (UI animation only; no simulation loop)
- **Frame Budget**: Turn-based — no per-frame logic budget pressure
- **DataLoader cold load**: < 2s on a mid-tier device (iPhone 12 / equivalent
  Android) with all loaded-era content
- **Memory Ceiling**: No explicit ceiling at current scope; in-memory content
  dictionaries are small (Era 1 < a few MB). Revisit if eras accumulate.

## Testing

- **Framework**: a single GDScript unit-test framework (GUT or gdUnit4 — choose
  one before the first core-system test; see roadmap decision D6).
- **Minimum Coverage**: all pure-logic functions (inclination delta, branch-tech
  eligibility, scoring formulas, succession inheritance) — must have unit tests.
- **Required Tests**: inclination inertia formula across axis ranges; branch-tech
  `can_unlock` (universal prereq × inclination threshold); era-score formula;
  succession inheritance + game-over on lineage extinction.
- **Determinism**: no random seeds or time-dependent assertions in tests; inject
  randomness so it can be controlled.

## Forbidden Patterns

- **No content values in code** — eras, branches, actions, events, techs, badges,
  tuning knobs all live in JSON. Adding content is a data operation.
- **No hardcoded tuning values** — all knobs in `data/config.json` or per-era
  `era.json`.
- **No hardcoded player-facing strings** — every visible string is a localization
  key resolved via `tr(key)` (see architecture §3.9). `ca` is the authored locale.
- **No untyped GDScript** — static typing is mandatory on vars, params, returns.
- **No singletons-as-logic** — `GameState` is a pure state container (autoload);
  game logic lives in managers and must be testable (favor injection over global
  reach where it aids testing).
- **No direct prototype migration** — prototype JS is reference-only; production
  code is rewritten (see `.claude/rules/prototype-code.md`).

## Allowed Libraries / Addons

- None approved yet. The chosen unit-test addon (GUT or gdUnit4) is the first
  expected approval. New addons require TD sign-off and an ADR if architectural.

## Architecture Decisions Log

- **ADR-001** — Engine: Godot 4.6 + GDScript (ACCEPTED) —
  `docs/architecture/ADR-001-engine-godot4.md`
- Implementation roadmap — `docs/architecture/implementation-roadmap.md`

## Engine Specialists

- **Primary**: `godot-gdscript-specialist` (core systems, GDScript logic)
- **Language/Code Specialist**: `godot-gdscript-specialist`
- **Scene/Node Specialist**: `godot-specialist` (`.tscn`, scene tree, UI nodes)
- **Shader/Visual Specialist**: `technical-artist` (2D shaders, visual effects)
- **UI Specialist**: `ui-programmer` (UI scene layout, touch interaction)
- **Routing Notes**: This is a Godot 4.6 project. Use the Godot specialist set.

### File Extension Routing

| File Extension / Type | Specialist to Spawn |
|-----------------------|---------------------|
| `.gd` (GDScript logic) | `godot-gdscript-specialist` |
| `.tscn` / `.tres` (scenes, resources) | `godot-specialist` |
| UI scene layout / interaction | `ui-programmer` |
| JSON content / data (`data/**`) | `economy-designer` |
| JSON balance / tuning (`config.json`, `era.json`) | `economy-designer` |
| `.gdshader` (visual effects) | `technical-artist` |
| General architecture review | `lead-programmer` |
