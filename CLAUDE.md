# Claude Code Game Studios -- Game Studio Agent Architecture

Indie game development managed through 48 coordinated Claude Code subagents.
Each agent owns a specific domain, enforcing separation of concerns and quality.

> **Joc actiu**: **Bloodline** — dynasty tycoon (Paleolític), mòbil.
> El desenvolupament actiu és al **prototip JS** a `prototypes/bloodline-v2/`
> (jugable, desplegat a GitHub Pages). Engine de producció pendent de decidir
> quan el joc arribi a la fase de producció.
>
> ⚠️ **Godot abandonat** (2026-07-01): `src/bloodline/` és un port a Godot 4.6
> que **no s'usarà**. No modificar. La futura decisió d'engine és nova i s'escollirà
> quan toqui. ADR-001 (Godot) queda com a historial, no com a decisió activa.

## Technology Stack

- **Stack actiu**: HTML/CSS/JS (vanilla, sense framework) — prototip a `prototypes/bloodline-v2/`
- **Fitxers clau**: `game.js` (lògica), `data.js` (contingut), `index.html`, `style.css`
- **Testing**: `node tests/headless/run.cjs` (Playwright headless; auto-arrenca servidor)
- **Deploy**: GitHub Pages (desplegat automàticament des de `main`)
- **Version Control**: Git with trunk-based development
- **Engine de producció**: pendent de decisió (quan el prototip JS validi el joc complet)

## Project Structure

@.claude/docs/directory-structure.md

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
