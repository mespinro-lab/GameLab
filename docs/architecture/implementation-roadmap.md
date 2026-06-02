# Life Tycoon 2 — Implementation Roadmap (Godot 4.6)

**Status**: Living document
**Owner**: Technical Director
**Companion to**: `ADR-001-engine-godot4.md`, `design/gdd/life-tycoon-2/tech-architecture.md`
**Purpose**: an order-and-dependency guide for moving from validated prototype to
production. This is **not** an exhaustive task list — it defines *what depends on
what*, *what is reused vs. rewritten*, the *MVP cut*, *blocking unknowns*, and
*relative complexity*.

> **Hard rule** (`.claude/rules/prototype-code.md`): prototype code is **rewritten**,
> never ported. The prototype is a *specification source* — its data shapes and
> formulas are reused; its JS is not.

> **Hard rule** (knowledge gap): every Godot 4.4–4.6 API call must be cross-checked
> against `docs/engine-reference/godot/`. The LLM's Godot knowledge is ~4.3.

---

## 1. Build Order (least → most dependent)

The eight core systems are not equal peers — they form a dependency chain. Build
bottom-up so each layer can be tested before the next depends on it.

```
Layer 0  FOUNDATION ─ no game logic, everything depends on it
   data schemas (JSON) ──► DataLoader (+ startup validation) ──► GameState (autoload)
                                                                      │
Layer 1  STATE MECHANICS ─ pure logic, unit-testable in isolation     ▼
   BranchManager (inclination, branches, branch-tech eligibility)
   ScoringManager (era score, formulas)
                                                                      │
Layer 2  PLAY LOOP ─ depends on state + data                          ▼
   ActionManager (purchase, execute, upgrades, side_effects)
   EventManager (trigger, chains, resolution)
                                                                      │
Layer 3  PROGRESSION ─ depends on the loop running                    ▼
   EraManager (era load, connectors, transitions)
   LineageManager (succession, inheritance, genealogy, chronicle)
                                                                      │
Layer 4  PERSISTENCE & SUPPORT ─ cross-cuts all above                 ▼
   SaveSystem · LocalizationManager · AudioManager (signals) · BadgeManager
                                                                      │
Layer 5  PRESENTATION ─ depends on everything emitting state          ▼
   scenes/ + ui/ scripts (era_scene, zone_panel, action_card, event_overlay,
   era_score, chronicle, genealogy, main_menu)
```

**Why this order**: DataLoader + GameState are the spine — no system can be tested
without data and a state container. BranchManager and ScoringManager are pure
functions of state and are the most testable code in the project, so they come
first as confidence-builders. The play loop (Action/Event) is where the game
becomes interactive. Progression (Era/Lineage) only matters once a loop produces
state to carry forward. Persistence and i18n cross-cut everything and are added
once there is state worth saving and strings worth localizing. UI comes last so it
binds to stable signals, not moving targets.

---

## 2. Reuse vs. Rewrite (prototype → production)

| Prototype asset | Disposition | Notes |
|---|---|---|
| **Data shapes** in `data.js` (RESOURCE_DEFS, AXIS_DEFS, ZONE_DEFS, action/event/tech objects) | **REUSE as spec** → migrate to JSON | The object shapes are the de-facto schema. Translate each `const […]_DEFS` into the JSON layout of tech-architecture §3.3. Field names carry over. |
| **Tuning constants** (INERTIA_FACTOR, EVENT_TRIGGER_CHANCE, aging params, inheritance rates…) | **REUSE values** → `data/config.json` + `era.json` | Validated numbers. Do not re-derive; copy them, then re-tune in Godot. |
| **Formulas** (inclination delta w/ inertia, aging curve, output w/ stat multiplier + skill bonuses, succession inheritance) | **REUSE as spec** → reimplement typed in GDScript | The math is validated; the implementation is rewritten. Each formula becomes a unit-tested function. |
| **Game logic** in `game.js` (getActionVisibility, applyDelta, executeAction, triggerSuccession, event resolution…) | **REWRITE** | Reference for behavior only. Reimplement against the 8-system architecture with static typing and DI, not as one flat file. |
| **Era 1 content** (techs, branches, skills, actions, events as JS) | **MIGRATE** to per-entity JSON | Mechanical translation; highest-volume task. Candidate for the data editor. |
| **DOM/CSS UI** (`index.html`, `style.css`) | **REWRITE** as Godot scenes | Layout intent and information hierarchy are reusable as UX reference; markup is not. |
| **localStorage save** | **REWRITE** | Replaced by `user://save_game.json` + schema version + migrators. |
| **Debug tools** (DEBUG_MODE, debug panel) | **REWRITE** if needed | Rebuild as a Godot debug overlay only if it earns its keep. |
| **`tools/data-editor.html`** | **REUSE / EVOLVE** | Engine-agnostic (reads/writes JSON). Adapt to LT2's per-file structure; no engine coupling. |

**One-line heuristic**: *data and math are reused; behavior and presentation are
rewritten.*

---

## 3. MVP Definition (Godot parity with the prototype)

The MVP is the smallest Godot build that reproduces what the prototype already
proved is fun. It maps to the GDD acceptance criteria (§8, "MVP — Era 1 with 3
branches").

**In scope for MVP:**
- DataLoader + startup validation, loading **Era 1 only** from JSON.
- GameState autoload, serializable.
- Inclination (4 axes, inertia) + branch emergence + branch-tech unlock.
- Actions: purchase, execute, output w/ stat multiplier, side_effects, upgrades,
  inclination-based visibility (fade/hide).
- Events: post-action trigger, chain decay, option resolution, branch-tech
  discovery via event.
- Universal techs on schedule; skills/destreses by condition.
- Succession: children, inheritance, sibling pool, game over on lineage extinction.
- Era score screen + chronicle text.
- Save/load (single slot) surviving an app background-kill.
- i18n wired with `ca` as the authored locale (even if `es`/`en` are stubs).
- Playable touch UI for the above on a portrait device.

**Explicitly out of MVP (defer):**
- Eras 2+ and inter-era connector chaining (architecture supports it; content
  doesn't exist yet).
- BadgeManager / meta-collection across runs.
- AudioManager assets (signals defined now; `.ogg`/`.wav` are Polish-phase).
- `es`/`en` full translations.
- Characteristics / Learnings (GDD marks these *post-prototype*).
- Run history, iCloud/Drive backup verification.

**MVP done when**: a new player completes Era 1 with a dominant inclination on a
real iOS and Android device, the save survives a kill, and two runs with different
dominant inclinations feel notably different (GDD §8).

---

## 4. Blocking Technical Decisions (not resolved in the GDD)

These must be decided before the dependent system is implemented. Listed with the
gate they block.

| # | Open decision | Blocks | TD recommendation |
|---|---|---|---|
| D1 | **Data object representation**: Resource vs Dictionary vs hybrid (architecture §3.4 leaves this open) | DataLoader, every consumer | **Hybrid** — typed `Resource` for stable entities, `Dictionary` for irregular payloads. Recorded in ADR-001 §Decision.4 as default; confirm before DataLoader. |
| D2 | **Save schema versioning & migration**: format is decided, but the migrator strategy and the v1 schema freeze are not | SaveSystem | Freeze a `schema_version` field now; ship MVP with v1 and a no-op migrator slot. Cheap insurance; reversible. |
| D3 | **i18n mechanism**: custom `tr(key)` over JSON dicts (per arch §3.9) vs Godot's built-in `TranslationServer`/CSV | LocalizationManager, all UI binding | Lean to the **custom JSON `tr()`** in the arch doc — keys live with content, matches the data-driven principle. Confirm vs. engine-native tooling cost. |
| D4 | **UI architecture pattern**: how scenes bind to GameState — direct reads, signals-only, or a thin view-model layer | All Layer-5 scenes | Decide before building the second screen. **Signals from managers → UI listeners** keeps logic out of scenes and matches the audio-anchor pattern already in the arch. |
| D5 | **Content authoring path**: hand-write JSON vs extend `tools/data-editor.html` vs `/era-design` pipeline output | Era 1 content migration (the bulkiest task) | Use the **`/era-design` pipeline → JSON** as the canonical output; data editor for fast edits. Lock the JSON schema (depends on D1) before mass authoring. |
| D6 | **Test harness**: GUT vs gdUnit4 for GDScript unit tests (coding-standards mandates blocking unit tests for logic) | CI gate, Layer-1 onward | Pick one before the first BranchManager test. Either is fine; decide for consistency, not capability. |

**D1, D5, and D6 are the critical path** — they block the foundation and the
highest-volume work. Resolve these first.

---

## 5. Relative Complexity (S / M / L / XL)

Complexity is *relative effort + risk*, not hours. Risk drivers noted.

| Block | Size | Risk drivers |
|---|---|---|
| JSON schema design + Era 1 content migration | **XL** | Volume (whole era), schema must be right before mass authoring (D1, D5). The single biggest chunk. |
| DataLoader + startup validation | **L** | Validation rules are extensive (arch §3.8); depends on D1. Foundation — must be solid. |
| EventManager (chains, conditional options, discovery) | **L** | Most irregular data shapes; conditional options by skill/children; chain decay state. |
| LineageManager (succession, inheritance, chronicle) | **L** | Inheritance math + genealogy state + chronicle text generation; many edge cases (GDD §5). |
| ActionManager (purchase, execute, upgrades, side_effects, visibility) | **M** | Core loop; logic is validated in prototype; fade/freeze visibility rules need care. |
| UI scenes + scripts (all screens) | **L** | Volume of screens; touch/portrait layout; binding pattern (D4). Spread across MVP. |
| BranchManager (inclination, branches, eligibility) | **M** | Pure, testable; inertia formula validated. Lower risk despite centrality. |
| SaveSystem (+ versioning) | **M** | Background-kill survival on mobile is the real test (D2). |
| LocalizationManager | **S** | Mechanism is simple once D3 is chosen; volume is in content, not code. |
| GameState (autoload, serializable) | **S** | Pure container, no logic. |
| ScoringManager | **S** | Closed-form formulas, fully validated. Trivial to unit-test. |
| AudioManager (signals only, MVP) | **S** | Signal wiring only; assets deferred to Polish. |
| BadgeManager | **S** | Out of MVP; isolated, separate save file. |

**Reading the table**: the cost center is **content + the foundation it sits on**
(XL + L), not the gameplay logic (mostly M/S, because the prototype de-risked it).
Protect schema-design time; rushing D1/D5 will tax every later block.

---

## 6. Suggested Milestone Slicing

A pragmatic cut of the above into shippable increments:

- **M-Foundation**: D1/D5/D6 decided → JSON schema frozen → DataLoader + validation
  + GameState. Exit: Era 1 data loads and validates, no UI.
- **M-Logic**: BranchManager + ScoringManager + ActionManager + EventManager,
  driven by tests / a debug harness. Exit: a full cycle resolves in code with
  correct state, no real UI.
- **M-Progression**: EraManager + LineageManager. Exit: succession and era-end
  work headlessly.
- **M-Playable (MVP)**: UI scenes + SaveSystem + i18n(ca) + audio signals. Exit:
  GDD §8 MVP criteria met on device.
- **Post-MVP**: Eras 2+, Badges, full i18n, audio assets, characteristics/learnings.
