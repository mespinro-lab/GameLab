# Alchemix — Prototip MVP

Puzzle d'alquímia basat en la regla SET generalitzada.
Construït sobre el disseny a `design/ALCHEMIX_REDESIGN.md`.

## Com jugar

1. Obre `index.html` en un navegador modern (Chrome/Firefox/Safari).
2. Selecciona 3-5 peces tocant/clicant.
3. Quan la selecció és vàlida (≥3 peces), el botó **Transmuta** s'activa.
4. Prem **Transmuta**: les peces desapareixen, les de sobre cauen, entren noves des de dalt.
5. Els combos en cascada es resolen automàticament amb multiplicador.

## Regla SET

Per a cada **atribut actiu**, totes les peces del combo han de tenir el valor:
- **Tots iguals** (ex: totes de foc), O
- **Tots diferents** (ex: foc, aigua, terra)

No hi ha cap altre resultat vàlid.

## Atributs visuals

| Atribut  | Canal visual           | Valors           |
|----------|------------------------|------------------|
| Element  | Icona central          | Foc·Aigua·Terra·Aire |
| Potència | Pips (1-3) baix dreta  | 1 · 2 · 3        |
| Estat    | Estil de vora          | Sòlid · Líquid · Gas |
| Origen   | Tint de fons           | Natural · Arcà · Buit |

## Dificultat (auto-ramp per puntuació)

| Nivell      | Puntuació | Atributs actius | Valors | Abocaments |
|-------------|-----------|-----------------|--------|------------|
| Principiant | 0         | Element+Potència | 3     | ∞          |
| Aprenent    | 1 000     | +Estat           | 3     | 25         |
| Alquimista  | 5 000     | tots 4           | 3     | 20         |
| Mestre      | 15 000    | tots 4           | 4     | 15         |

## Tests

Obre `tests/test-runner.html` al navegador (necessita servidor local per ES modules):

```bash
# Des del directori prototypes/alchemix/:
npx serve .
# o
python -m http.server 8080
```

Navega a `http://localhost:8080/tests/test-runner.html`.

## Arquitectura

```
engine/   ← lògica pura, zero DOM (testejable aïlladament)
tests/    ← tests unitaris del motor
render/   ← Canvas + input + animació
game.js   ← wiring game loop
```

La separació `engine/render` permet que Fable (validador de solvability)
i els 7 playtesters del pipeline inspeccionen la lògica sense passar per la UI.

Funcions d'entrada per a validators externs:
- `engine/SolvabilityChecker.js` → `hasAnyValidCombo(grid, activeAttributes)`
- `engine/ComboValidator.js` → `isValidCombo(pieces, activeAttributes)`
- `engine/Board.js` → `board.cloneGrid()` (snapshot immutable)

## Decisions de disseny

Veure `SESSION_LOG.md` per a totes les decisions preses durant la construcció.
