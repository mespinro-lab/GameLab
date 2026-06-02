# ADR-001 — Engine: Godot 4.6 + GDScript

**Status**: ACCEPTED
**Date**: 2026-06-02
**Decision owner**: Technical Director
**Supersedes**: implicit HTML5/Vanilla JS assumption inherited from the prototype

---

## Context

Life Tycoon 2 needs a definitive production engine. Two project states currently
disagree:

- A fully functional **HTML5 / Vanilla JS prototype** (`prototypes/life-tycoon-2/`)
  validated the entire game loop: inclination axes, branches, branch techs,
  actions with upgrades, event chains, succession, and a complete Era 1 design.
- The **GDD and tech architecture** (`design/gdd/life-tycoon-2/tech-architecture.md`)
  already assume **Godot 4 + GDScript** and specify directory layout, eight core
  systems, JSON-driven content, i18n, and save format.

The target platforms are **iOS and Android (portrait, touch-first)**. The prototype's
`file://`-runnable web stack cannot ship to native mobile stores, has no native
save/backup integration, and lacks an asset/export pipeline. A decision is required
to stop the two states from diverging further and to unblock production
implementation.

This ADR formalizes a decision already implied across the design documents, making
it explicit, reviewable, and reversible-by-record.

---

## Decision

Adopt **Godot 4.6 + GDScript with static typing** as the production engine and
language for Life Tycoon 2.

Scope of this decision:

1. **Engine**: Godot 4.6 (pinned — see `docs/engine-reference/godot/VERSION.md`).
2. **Language**: GDScript, static typing enforced (`var x: int`, typed returns,
   `class_name` for shared types).
3. **Content model**: all game content lives in JSON, loaded at startup by
   `DataLoader`. No content values in code.
4. **Data object representation** (resolving the ambiguity in tech-architecture.md
   §3.4): **hybrid** — structurally stable entities (EraData, BranchData,
   ActionData, BranchTechData, EventData) are typed `Resource` classes;
   irregular/variable payloads (event option lists, `side_effects`,
   `inclination_deltas`, requirement objects) are typed `Dictionary`. The boundary
   is: if the shape is fixed across all instances → `Resource`; if the shape varies
   per instance → `Dictionary`. This is a default recommendation and may be revised
   before `DataLoader` is implemented without affecting any other decision in this
   ADR.
5. **Build**: Godot export templates (iOS + Android).
6. **Asset pipeline**: Godot import system.

The prototype is **reference-only**. Per `.claude/rules/prototype-code.md`,
prototype code is **rewritten** to production standards, never migrated directly.
The validated data shapes and formulas are reused as a specification source.

---

## Alternatives Considered

### HTML5 / Vanilla JS (the prototype stack) — REJECTED
- **For**: already written and validated; zero engine learning curve; `file://`
  runnable.
- **Against**: no native iOS/Android store distribution path; no native save,
  backup (iCloud / Google Drive), audio, or input ecosystem; would require a
  wrapper (Capacitor/Cordova) that adds its own toolchain and performance tax.
  Validated as a *design* prototype, not a *shipping* foundation.

### Unity (C#) — REJECTED
- **For**: mature mobile export; large ecosystem; strong tooling.
- **Against**: heavier toolchain and licensing/runtime-fee uncertainty for an indie
  budget; more engine surface than a turn-based 2D UI game needs; team already
  oriented around Godot (engine pinned, reference docs maintained).

### Flutter (Dart) — REJECTED
- **For**: excellent declarative mobile UI; single codebase iOS/Android; strong
  for data-driven, list-and-card UIs (which this game largely is).
- **Against**: not a game engine — no native game loop, audio bus, scene system,
  or export-as-game tooling; would fight the engine on the 10% that is game-like
  (event overlays, audio anchors, future juice/VFX); diverges from the existing
  Godot-based architecture and reference material.

---

## Consequences

### Positive
- Native iOS + Android export with one engine; matches the target platforms.
- 2D + CanvasItem UI is mature in Godot 4.6; turn-based game has no rendering risk.
- Static typing improves maintainability and testability of the eight core systems.
- JSON-driven content keeps "add an era = add data files" achievable; the data
  editor (`tools/data-editor.html`) can be reused since it reads/writes JSON.
- The architecture document is already written against this engine — minimal
  re-planning.

### Negative
- **Knowledge gap risk**: the LLM's Godot knowledge is ~4.3; versions 4.4–4.6
  introduced breaking changes (Jolt default, D3D12 default on Windows, glow rework,
  shader changes). Every Godot API suggestion MUST be cross-referenced against
  `docs/engine-reference/godot/`. This is the single largest implementation risk.
- The validated prototype logic must be **rewritten**, not ported — real cost,
  but it buys production-grade structure (typed, tested, DI-friendly).
- GDScript has a smaller library ecosystem than JS/C#; some utilities may need
  hand-rolling.

### Performance Implications
- `DataLoader` must complete full content load in **< 2s** on a mid-tier device
  (iPhone 12 / equivalent Android) — already an acceptance criterion in the
  architecture doc. JSON parse of Era 1 content is well within budget; risk grows
  only as eras accumulate (mitigation: lazy per-era load if registry grows large).
- Turn-based loop has no frame-time budget pressure; UI animation stays within
  Godot's 2D draw budget at 60 fps on target hardware.
- Memory: in-memory indexed dictionaries of content are small (Era 1 < a few MB);
  no ceiling concern at current scope.

---

## Validation — "we'll know this was right if…"
- A native build installs and runs Era 1 on a physical iOS and Android device.
- `DataLoader` cold-load stays < 2s on a mid-tier device with all Era 1 content.
- A content designer adds a new action via JSON only, no code change, and it
  appears in-game.
- No Godot API regression slips through because reference docs were cross-checked.
