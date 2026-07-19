# ADR-002: Spín Unity prototype — single-scene, code-built UI Toolkit architecture

## Status

Accepted

## Date

2026-07-19

## Last Verified

2026-07-19

## Decision Makers

Marc (product/design authority), Claude Code (implementation, this session)

## Summary

Spín (`design/spin.md`) is implemented in a new Unity 6.3 LTS project at `Spin/`. The
implementing agent had no Unity Editor, no C# compiler, and no dotnet/mono available in its
environment, so every technical choice below optimizes for "must be correct without ever being
compiled or opened before hand-off," not for idiomatic Editor-first workflow.

## Engine Compatibility

| Field | Value |
|-------|-------|
| **Engine** | Unity 6.3 LTS |
| **Domain** | UI, Core, Scripting |
| **Knowledge Risk** | HIGH — Unity 6.3 postdates the implementing LLM's training cutoff |
| **References Consulted** | `docs/engine-reference/unity/VERSION.md`, `docs/engine-reference/unity/breaking-changes.md` |
| **Post-Cutoff APIs Used** | `PanelSettings`/`UIDocument` runtime UI Toolkit API (stable since ~2021-2022, believed unchanged in 6.3); `VisualElement.schedule` |
| **Verification Required** | First Editor open must confirm: project compiles clean, `Bootstrap.unity` opens without errors, `PanelSettings` fields (`scaleMode`, `referenceResolution`, `screenMatchMode`, `match`) still exist with these names, EditMode Test Runner discovers and passes all tests |

> Knowledge Risk is HIGH — re-validate this ADR against the actual Unity 6.3 Editor on first open,
> per the Verification Required list above, before treating any of it as trustworthy.

## ADR Dependencies

| Field | Value |
|-------|-------|
| **Depends On** | None |
| **Enables** | All future Spín Unity work (Group 2/3 content, real art/audio pass in Fase 4) |
| **Blocks** | Nothing currently — this is the only ADR for this game |
| **Ordering Note** | None |

## Context

### Problem Statement

`design/spin.md` §12 fixes the *model* architecture (`GridModel`, `TurnManager`,
`IMovementStrategy`) but leaves engine-level plumbing ("Claude Code té llibertat
d'implementació") open. Normally that plumbing (scenes, prefabs, `ProjectSettings/`,
`Packages/manifest.json`) is authored or at least verified inside the Unity Editor. That
verification loop was not available in this session.

### Current State

Greenfield — no prior Spín code existed. `docs/engine-reference/unity/VERSION.md` had already
pinned Unity 6.3 LTS (dated 2026-02-13), so the engine choice itself was not open; only *how* to
build inside it was.

### Constraints

- No Unity Editor, no C# compiler/runtime (dotnet/mono/csc all absent) in the implementing
  environment — nothing written could be compiled or run before hand-off.
- Mobile portrait target (iOS/Android), 60 fps criterion (§12 acceptance criterion 6).
- Must not silently invent unresolvable ambiguities — where the GDD was genuinely silent on an
  engineering choice, the decision had to be low-risk-to-reverse and documented, not just picked.

### Requirements

- Every acceptance criterion in `design/spin.md` §12 (1-8).
- Zero hardcoded UI text (technical-preferences.md).
- Deterministic model (R19) — no `Random` anywhere in `Model/`.

## Decision

### Architecture

```
Spin/Assets/
├── Scenes/Bootstrap.unity        <- the ONLY hand-authored scene (Main Camera + Bootstrap GO)
├── Scripts/
│   ├── Model/, Level/, Localization/, Persistence/, Tutorial/   <- pure-ish C#, per GDD §12
│   ├── App/            GameBootstrap (MonoBehaviour) -> GameServices, GameSession
│   └── View/            ScreenManager + 6 IScreenController implementations,
│                        all built as VisualElement trees IN CODE (no .uxml files)
├── UI/Resources/Theme.uss        <- one shared stylesheet, loaded via Resources.Load
└── StreamingAssets/{Levels,Localization}/*.json
```

`GameBootstrap.Awake()` creates a `PanelSettings` via `ScriptableObject.CreateInstance` (not a
serialized `.asset`), attaches a `UIDocument`, loads the theme stylesheet, then loads all level +
localization JSON via coroutines before calling `ScreenManager.ShowMainMenu()`.

### Key Interfaces

```
IScreenController { VisualElement Root; void OnShow(); void OnHide(); }
ScreenManager.Show(ScreenId) — toggles display:none/flex between the 6 pre-built screen roots
GameInputController — the only class registering PointerDown/PointerUp on the screen root;
  resolves taps to a specific cell via the bubbled PointerEvent.target, not manual geometry
```

### Implementation Guidelines

- Never add a second hand-authored `.unity` scene. New screens are new `IScreenController`s.
- Never load UXML/USS via a hand-typed path without a null-check + `Debug.LogWarning` fallback —
  a typo must degrade (unstyled UI) rather than throw.
- Any new script whose type is referenced by GUID from a scene/asset (there is currently exactly
  one: `GameBootstrap.cs` from `Bootstrap.unity`) must ship its own hand-written `.meta` file with
  a fixed GUID *before* the scene references it — do not rely on Unity to generate one first.

## Alternatives Considered

### Alternative 1: Hand-authored uGUI scenes (one per screen, per the original 6-screen plan)

- **Description**: A `.unity` scene per screen (§9.3), Canvas/Button/Text hierarchies.
- **Pros**: Conventional Unity workflow; visually editable later in the Editor.
- **Cons**: 6 scenes' worth of hand-typed YAML with cross-referencing `fileID`s and component
  GUIDs, none of it checkable before hand-off. A single transcription slip can make a scene fail
  to open or silently miswire a reference.
- **Estimated Effort**: Similar authoring effort, much higher failure risk.
- **Rejection Reason**: Verification cost. One mistake in 6 scene files is far more likely and far
  harder to locate than one mistake in reviewable, diffable C#.

### Alternative 2: UXML/USS per screen (as originally planned) instead of code-built VisualElement trees

- **Description**: Author `MainMenu.uxml`, `Game.uxml`, etc. under `Assets/UI/Resources/Screens/`,
  loaded via `Resources.Load<VisualTreeAsset>(...).CloneTree()`.
- **Pros**: Declarative, matches the original plan, keeps structure/logic separated.
- **Cons**: Introduces a `Resources.Load` path string per screen that fails silently (returns
  null) if mistyped, discovered only at runtime in the Editor — one more class of untestable
  failure on top of everything else already unverifiable.
- **Estimated Effort**: Comparable.
- **Rejection Reason**: Removing this path-lookup risk for the six most content-heavy files was
  judged worth deviating from the original plan's exact file list, since the *result* (6 working,
  localized, navigable screens using UI Toolkit) is unchanged — only whether the tree is declared
  in `.uxml` or in C#.

### Alternative 3: Unity Input System package for swipe/tap

- **Description**: Add `com.unity.inputsystem`, author `.inputactions`.
- **Cons**: Extra `Packages/manifest.json` dependency + another asset format to hand-author;
  UI Toolkit's own `PointerDownEvent`/`PointerUpEvent` already deliver both mouse and touch
  through the same code path with zero extra packages.
- **Rejection Reason**: No functional benefit for this input scheme; strictly more risk.

## Consequences

### Positive

- Every file that can be diffed and reasoned about in plain text was diffable in plain text;
  the only binary-adjacent risk (`Bootstrap.unity`) was minimized to two `GameObject`s.
- Adding Group 2/3 screens or content later means adding another `IScreenController`, not another
  scene file.

### Negative

- Marc cannot visually drag-and-drop UI in the Scene view the way a uGUI/UXML project would allow;
  all screen layout changes go through C#/USS.
- The one required hand-picked GUID (`GameBootstrap.cs.meta`) is a manual step that must not be
  regenerated/deleted before first Editor open, or the scene reference breaks.

### Neutral

- `PanelSettings` is created fresh every play session rather than being a shared, inspectable
  asset — functionally identical, just not visible in the Project window.

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| `PanelSettings` field names (`scaleMode`, `screenMatchMode`, `match`) changed in 6.3 | Low-Medium | Compile error on first open | First-open checklist item; fields are pre-2022 API, low churn expected |
| `Bootstrap.unity` YAML has a subtle structural error | Low | Scene fails to open / Editor recreates it | Kept to 2 GameObjects with only Camera + Transform + one MonoBehaviour; no lighting/occlusion/navmesh blocks included (Unity regenerates these silently if absent) |
| EditMode Test Runner doesn't pick up `Spin.Tests.EditMode.asmdef` | Low | Tests invisible, not failing | Manifest already includes `com.unity.test-framework` in modern default projects; documented fallback in hand-off notes |

## Performance Implications

Not measured — no Editor available. §12 acceptance criterion 6 (60 fps mid-range mobile) is
unverified pending first Editor/device run. The architecture has no per-frame allocation in the
model layer and redraws the 7×7 grid only once per turn (not per frame), which should leave
substantial headroom, but this is a design expectation, not a measurement.

## Migration Plan

N/A — greenfield.

## Validation Criteria

- [ ] Project opens in Unity 6.3 LTS without console errors
- [ ] `Bootstrap.unity` added to Build Settings as scene 0 runs and shows the Main Menu
- [ ] EditMode Test Runner: all tests in `Spin.Tests.EditMode` pass
- [ ] All 7 levels playable start-to-finish (§12 criterion 1)
- [ ] Language switch in Options updates all visible text immediately (§12 criterion 3)

## GDD Requirements Addressed

| GDD Document | System | Requirement | How This ADR Satisfies It |
|-------------|--------|-------------|--------------------------|
| `design/spin.md` §12 | Architecture | "Model separat de la vista" | `Model/`/`Level/`/`Localization/`/`Persistence/`/`Tutorial/` have no `MonoBehaviour` dependency; only `LevelFileLoader`/`LocalizationFileLoader`/`SaveManager` touch Unity I/O APIs |
| `design/spin.md` §9.3 | UI/UX | 6 screens, single navigable flow | `ScreenManager` + 6 `IScreenController`s in one scene |
| `design/spin.md` §11.1 | Localization | 3 languages, zero hardcoded text, hot-swap | `LocalizationManager` + per-key English fallback; every screen subscribes to `LanguageChanged` |

## Related

- Supersedes nothing; `ADR-001-engine-godot4.md` is for the unrelated, abandoned Bloodline Godot
  port and does not apply to Spín.
- Code: `Spin/Assets/Scripts/App/GameBootstrap.cs`, `Spin/Assets/Scripts/View/ScreenManager.cs`
