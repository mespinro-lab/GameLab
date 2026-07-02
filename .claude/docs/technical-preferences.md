# Technical Preferences

> Stack actiu: HTML/CSS/JS (vanilla). Prototip a `prototypes/bloodline-v2/`.
> Engine de producció pendent de decisió — vegeu `CLAUDE.md`.

## Stack i fitxers clau

- **Stack**: HTML/CSS/JS pur (sense framework, sense build step)
- **Fitxers clau**:
  - `prototypes/bloodline-v2/data.js` — contingut del joc (accions, branch techs, events, recursos)
  - `prototypes/bloodline-v2/game.js` — tota la lògica de joc
  - `prototypes/bloodline-v2/index.html` — UI i estructura
  - `prototypes/bloodline-v2/style.css` — estils
- **Deploy**: GitHub Pages des de `main` (auto-deploy)
- **Testing**: `node tests/headless/run.cjs` (Playwright headless, auto-arrenca servidor al port 5599)

## Plataforma i input

- **Target actual**: navegador mòbil (iOS/Android, portrait) + desktop per a dev
- **Input primari**: tap/click
- **Deploy mòbil**: GitHub Pages (no cal instal·lació)

## Convenció de noms (JS)

- **Funcions i variables**: `camelCase` (e.g. `executeAction`, `getActiveBranches`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g. `LIFE_EXPECTANCY`, `FOOD_MAX_START`)
- **IDs de contingut**: `snake_case` amb prefix de tipus (e.g. `act_espiar_ramat`, `bt_guardia_flama`, `ut_foc`)
- **Fitxers**: `snake_case` per a JS/HTML/CSS

## Patrons prohibits

- **Cap valor de contingut al codi** — accions, branch techs, events, recursos: tot a `data.js`
- **Cap string hardcoded visible** — tota la UI genera contingut des de les definicions de `data.js`
- **Cap import de `src/`** — el prototip és autònom; `src/bloodline/` és Godot abandonat

## Godot (arxivat)

El port a Godot 4.6 (`src/bloodline/`) va ser l'intent inicial d'engine (ADR-001, acceptat 2026-02-12).
**Abandonat 2026-07-01** en favor del prototip JS. No modificar `src/bloodline/`.
La futura decisió d'engine de producció és nova i s'escollirà quan el joc estigui validat.

## Agents recomanats per a tasques de codi

| Tasca | Agent |
|---|---|
| Lògica de joc (`game.js`) | `gameplay-programmer` o directament en sessió principal |
| Contingut i dades (`data.js`) | `economy-designer` per a balanç; `era-writer`/`era-historian` per a contingut narratiu |
| UI i estils (`index.html`, `style.css`) | `ui-programmer` |
| Tests headless | `qa-tester` |
| Arquitectura i decisions | `technical-director` (si cal ADR nou) |
