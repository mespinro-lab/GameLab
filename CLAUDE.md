# Claude Code Game Studios -- Game Studio Agent Architecture

Indie game development managed through 48 coordinated Claude Code subagents.
Each agent owns a specific domain, enforcing separation of concerns and quality.

> **Joc actiu**: **Bloodline** — dynasty tycoon (Paleolític), mòbil.
> ⚠️ **Estat real (2026-06-27)**: el desenvolupament actiu és al **prototip JS** a
> `prototypes/bloodline-v2/` (jugable, desplegat a GitHub Pages). El **port a Godot**
> (`src/bloodline/`) està **EN PAUSA**. La resta d'aquest fitxer descriu la configuració
> Godot prevista per al port; per al treball actual, el target és el prototip JS.
> Decisió formal d'engine pendent — vegeu `production/next-steps.md` §P3.

## Technology Stack

- **Engine**: Godot 4
- **Language**: GDScript
- **Version Control**: Git with trunk-based development
- **Build System**: Godot export templates
- **Asset Pipeline**: Godot import system

> **Note**: Engine-specialist agents exist for Godot, Unity, and Unreal with
> dedicated sub-specialists. Use the set matching your engine.

## Project Structure

@.claude/docs/directory-structure.md

## Engine Version Reference

@docs/engine-reference/godot/VERSION.md

## Technical Preferences

@.claude/docs/technical-preferences.md

## Coordination Rules

@.claude/docs/coordination-rules.md

## Collaboration Protocol

**User-driven collaboration, not autonomous execution.**
Every task follows: **Question -> Options -> Decision -> Draft -> Approval**

- Agents MUST ask "May I write this to [filepath]?" before using Write/Edit tools
- Agents MUST show drafts or summaries before requesting approval
- Multi-file changes require explicit approval for the full changeset
- No commits without user instruction

See `docs/COLLABORATIVE-DESIGN-PRINCIPLE.md` for full protocol and examples.

> **First session?** If the project has no engine configured and no game concept,
> run `/start` to begin the guided onboarding flow.

## Coding Standards

@.claude/docs/coding-standards.md

## Context Management

@.claude/docs/context-management.md
