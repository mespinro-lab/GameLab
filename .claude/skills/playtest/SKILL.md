---
name: playtest
description: "Run a coordinated playtest sweep of Life Tycoon 2 using all specialist playtester agents. Spawns agents in parallel, synthesizes findings, and writes a consolidated report to production/playtests/. Supports full sweeps and targeted sweeps when a specific system has changed."
argument-hint: "[full | targeted: system-name | casual | dynasty | optimizer | new-player | speed-runner | tycoon | historian | branch-path]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Task, AskUserQuestion
agent: playtester-orchestrator
---

## Phase 1: Parse Arguments

**Argument**: `$ARGUMENTS` (blank → ask user via AskUserQuestion)

Resolve the sweep mode:

| Argument | Agents to spawn | When to use |
|---|---|---|
| `full` | All 6 active + historian after | Milestone gate, new era added, significant feature shipped |
| `targeted: [system]` | Subset (see routing table) | One system changed |
| `casual` | playtester-casual-mobile only | Mobile UX / touch layout change |
| `dynasty` | playtester-dynasty-builder only | Inheritance or lineage system change |
| `optimizer` | playtester-optimizer only | Balance values or formula changed |
| `new-player` | playtester-new-player only | UI labels, onboarding, Catalan text |
| `speed-runner` | playtester-speed-runner only | Tech tree, era gates, pacing |
| `tycoon` | playtester-tycoon only | Code audit — logic bugs, balance, UX friction from source |
| `historian` | playtester-historian only | Cross-session QA health snapshot |
| *(blank)* | Ask user | — |

**Targeted sweep routing** — when `targeted: [system]` is given:

| System changed | Agents |
|---|---|
| Touch layout / UI | casual, new-player |
| Trait or inheritance | dynasty, optimizer |
| Tech tree / era gates | speed-runner, optimizer |
| Action costs / balance | optimizer, dynasty |
| Succession overlay | casual, new-player |
| New era added | ALL SIX active + historian |
| Save / load | dynasty, speed-runner |
| Code logic / formula | tycoon |
| QA health review | historian |

If no argument was provided, call `AskUserQuestion`:
- "What kind of playtest sweep would you like to run?"
- Options: "Full sweep (all 6 active + historian)", "Targeted (pick a system)",
  "Single agent (casual / dynasty / optimizer / new-player / speed-runner / tycoon / historian)"

---

## Phase 2: Load Context

Before spawning any agent, read:

1. `prototypes/bloodline/game.js` — current game logic
2. `prototypes/bloodline/data.js` — current actions, branch techs, universal techs, events
3. `production/playtests/` — list existing report files so agents know what has already been covered

Build a **briefing block** to pass to every spawned agent:

```
BRIEFING — Life Tycoon 2 (prototype):
- Engine: HTML5 / Vanilla JS, runs from file://, no framework
- Files: prototypes/bloodline/game.js + data.js
- Mobile target: 360px min width, touch via click events
- UI language: Catalan
- Core loop: Execute action → inclination shifts → branches emerge → branch tech unlocks → succession
- Resources: Aliment 🌾 (-1/turn), Saber 🧠 (buy/upgrade currency), Salut ❤️ (-1/turn aging)
- Key constants: LIFE_EXPECTANCY=14, MAX_GENERATIONS=5, INERTIA_FACTOR=2.0, BRANCH_INHERITANCE_RATE=0.65
- Branch techs: 6 in current data.js (simplified — GDD has 13, content migration pending)
- Universal techs: 3 (automatic at cycles 2, 5, 8)
- Destreses: discovered by repeating actions (threshold 5 uses, max 2, inherited intact)
- Upgrades: 5 upgrade actions that replace base actions when purchased
- Debug features active: inclination dot editor, delta tooltip on hover, tech strip
- KNOWN OPEN: data.js uses simplified content vs. design/gdd/bloodline/content-plan-era1.md
- KNOWN OPEN: recurs secundari (Pells) decision pending — currently not in prototype
- Do NOT re-report items already listed as S1/S2 in the latest playtest report
- Write your raw findings to: production/playtests/[session-date]/[your-agent-name].md
```

---

## Phase 3: Spawn Agents in Parallel

Spawn all required agents simultaneously — do NOT wait for one to finish before
starting the next. Pass the briefing block and the specific focus to each agent.

Each agent writes its own raw findings file to:
`production/playtests/[YYYY-MM-DD]/[agent-name].md`

Create the session directory before spawning:
`production/playtests/[YYYY-MM-DD]/`

---

## Phase 4: Synthesize Findings

After all agents complete, read each raw findings file and apply the
de-duplication and severity matrix from `playtester-orchestrator`:

**Severity matrix:**

| Issue type | Severity |
|---|---|
| Softlock / crash / progression blocker | S1 — Critical |
| Broken tech gate or missing era content | S1 — Critical |
| Exploit that trivializes core gameplay | S2 — Major |
| Touch target < 32px / tap mis-fire risk | S2 — Major |
| UI label confusion (wrong action taken) | S2 — Major |
| Balance concern (non-trivializing) | S3 — Minor |
| Cosmetic / text issue | S4 — Trivial |

De-duplication rule: if two agents report the same issue, merge into one entry
and note "Reported by: [agent1], [agent2]".

Present the synthesis in conversation: total issue count broken down by severity,
plus any S1 issues called out explicitly before writing the report.

---

## Phase 5: Creative Director Gate

**Review mode check** — read `production/review-mode.txt` if it exists:
- `solo` → skip CD gate. Note: "CD-PLAYTEST skipped — Solo mode."
- `lean` → skip CD gate. Note: "CD-PLAYTEST skipped — Lean mode."
- `full` → spawn `creative-director` via Task with gate **CD-PLAYTEST**
  (see `.claude/docs/director-gates.md`). Pass the synthesized findings and
  the game's core fantasy from `design/gdd/game-concept.md` if it exists.
- File absent → default to `lean` (skip).

If `full` mode and CD returns CONCERNS or REJECT, add a
`## Creative Director Assessment` section to the report before writing.

---

## Phase 6: Write Consolidated Report

Ask: "May I write the consolidated playtest report to
`production/playtests/[YYYY-MM-DD]-[scope].md`?"

Report structure:

```markdown
# Playtest Report — [scope] — [YYYY-MM-DD]

## Summary
- **Agents run**: [list]
- **Scope**: [Full sweep / Targeted: system-name / Single: agent-name]
- **Total issues**: N (S1: N · S2: N · S3: N · S4: N)
- **New issues**: N | **Known / pre-existing**: N

## S1 — Critical (block release)
[Each: ID · title · reported-by · description · reproduction · impact]

## S2 — Major (fix before milestone)
[Same format]

## S3 — Minor (fix when capacity allows)
[Same format]

## S4 — Trivial (polish backlog)
[Same format]

## Design Concerns
[Issues that work as coded but raise balance or UX questions]
[Routed to: economy-designer / game-designer / ux-designer]

## Open Points Status
[Items from design/life-tycoon-open-points.md checked this session]
| Item | Status |
|---|---|
| Era 4 missing | CONFIRMED PRESENT / NOT REPRODUCED / FIXED |
| Fabricar Eines +5 felicitat | … |
| Children lineage bonus | … |

## Recommended Next Actions
1. [Highest-priority action]
2. [Second priority]
3. [Third priority]
```

---

## Phase 7: Route Findings

After the report is written, state the routing for each finding category:

| Findings present | Route to |
|---|---|
| S1/S2 bugs | `qa-lead` for triage — run `/bug-triage` |
| S3/S4 bugs | Add to `production/qa/bugs/` backlog |
| Balance / economy concerns | `economy-designer` |
| UX / label confusion | `ux-designer` |
| Tech gate / pacing | `game-designer` |
| Touch target / layout | `ui-programmer` |
| Trait / formula bugs | `gameplay-programmer` |

If no S1/S2 issues were found: "No blocking issues found — safe to proceed to
next milestone gate."

---

## Collaborative Protocol

- Never spawn agents without confirming scope (Phase 1 AskUserQuestion if blank)
- Never write the report without explicit approval (Phase 6 ask)
- Do not re-report known issues from `design/life-tycoon-open-points.md` as new
- Always spawn agents in parallel — sequential spawning wastes time
- If an agent produces no output file, note it as BLOCKED and proceed with
  the agents that did complete
