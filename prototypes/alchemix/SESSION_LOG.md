# Alchemix — Session Log

## Sessió de construcció MVP (2026-06-11)

### Decisions de disseny preses

**D1 — Indexació de la graella**
`grid[row][col]`, row 0 = part superior (canvas), row (rows-1) = inferior.
Gravetat: les peces cauen cap a row índexs més alts.
Motivació: coincideix amb la coordenada Y del canvas, simplifica el mapatge render↔engine.

**D2 — "All-different" per combos de ≥4 peces**
Amb 3 valors per atribut, "tots-diferents" és impossible per combos de 4-5 peces.
Decisió: es considera vàlid igualment (la validació simplement no trobaria cap combo de mida 4 "caos" fins que valuesPerAttr=4 al nivell de dificultat 3).
Motivació: la regla SET és la mateixa; l'escala de valors fa la diferència natural sense canviar codi.

**D3 — Cascades automàtiques**
Implementades com: després de gravetat, `findFirstValidCombo` escaneja TOT el board.
Si en troba un, l'auto-executa (fins a 5 nivells de cascada màxim per evitar loops infinits teòrics).
Motivació: simplifica la implementació. Sacrifica que el jugador "triï" el combo de cascada,
però és coherent amb l'estètica flow i fa els combos en cadena molt satisfactoris.
**Dubte obert**: pot ser massa agressiu (board mai queda quiet). Revisar amb playtest.

**D4 — Invariant de solvability via injecció forçada**
Estratègia: primer intent = injectar un triple vàlid generat per `_generateValidTriple` en 3 posicions aleatòries. Si en MAX_INJECT_ATTEMPTS intents no s'aconsegueix, es regenera el board sencer.
Motivació: pitjor cas de complexitat molt millor que el reshuffle peça-a-peça, i el board sencer rarament caldria regenerar (perquè un board de 30+ peces casi sempre té almenys un SET vàlid).

**D5 — Puntuació**
| Mida | Punts base |
|------|-----------|
| 3    | 100       |
| 4    | 250       |
| 5    | 600       |
× 2.0 per "pur" (tots-iguals en tots els atributs)
× 1.5 per "caos" (tots-diferents en tots els atributs)
× 1.5^cascadeLevel per cascades

**D6 — Sense campanya hand-made**
Mode únic: endless amb objectives procedurals. Ramp de dificultat automàtica per score.
Thresholds: 1 000 → Aprenent, 5 000 → Alquimista, 15 000 → Mestre.

**D7 — Atributs actius al nivell 0**
Nivell 0 (Principiant): actius [Element, Potència] (índexs 0,1).
Afegir Estat al nivell 1, tots quatre al nivell 2, + 4 valors/atribut al nivell 3.
Coincideix exactament amb l'spec §2.2.

**D8 — Catalyst al size-5**
Un combo de 5 peces genera un "Catalitzador del Filòsof": neteja tota la fila on estava la primera peça eliminada.
Motivació: efecte espectacular per al combo màxim, consistent amb §4 de l'spec.

**D9 — Pours vs time**
Pressió via límit de "abocaments" (refills), no temps.
Principiant: sense límit (aprendre la mecànica).
Aprenent: 25 abocaments.
Alquimista: 20. Mestre: 15.

**D10 — InputHandler: selecció manual + botó Transmuta**
Taps seleccionen/deseleccionen peces (fins a 5). El botó "Transmuta" s'activa quan n∈[3,5].
No hi ha auto-validació en arribar a 3 (permet planificar combos de 4-5 sense accident).

---

### Dubtes oberts per revisar

1. **Cascades massa greedy**: `findFirstValidCombo` agafa qualsevol combo al board, no "els que van caure". Pot resultar en cascades infinites si el board sempre té alguna cosa. Cal testar amb playtest.

2. **Restart no recrea el Renderer/InputHandler**: el `_restart()` reutilitza les instàncies existents. Cal verificar que `this.renderer.board = newBoard` és suficient.

3. **Fonts pixel art**: la llegenda usa text CSS monospaced, no fonts de pixel art. Podria millorar l'estètica.

4. **No hi ha so ni vibració**: l'arquitectura suporta events d'àudio però no hi ha AudioDirector integrat.

5. **Tests de Board**: el test de gravetat és feble (no verifica ordre exacte de peces, depèn de la construcció interna). Reescriure quan Board permeti injectar peces de test manualment.

6. **Solvability auditor extern (Fable)**: `findFirstValidCombo` i `hasAnyValidCombo` a `SolvabilityChecker.js` estan deliberadament aïllats com funcions pures. Fable pot invocar-les directament amb un grid arbitrari per a la validació formal.

---

### Arquitectura resultant

```
prototypes/alchemix/
├── engine/          ← lògica pura, zero DOM ✓
│   ├── constants.js
│   ├── Piece.js
│   ├── ComboValidator.js
│   ├── SolvabilityChecker.js
│   ├── Board.js
│   ├── Scoring.js
│   ├── ObjectiveGenerator.js
│   └── DifficultyRamp.js
├── tests/           ← tests unitaris del motor ✓
│   ├── test-helpers.js
│   ├── test-runner.html
│   ├── combo-validator.test.js
│   ├── board.test.js
│   └── solvability.test.js
├── render/          ← canvas + input + animació ✓
│   ├── Renderer.js
│   ├── InputHandler.js
│   └── Animator.js
├── game.js          ← wiring del game loop ✓
├── index.html       ← entry point ✓
├── style.css        ← dark alchemical theme ✓
├── SESSION_LOG.md
└── README.md
```
