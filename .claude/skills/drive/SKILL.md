---
name: drive
description: "Orquestrador autònom del backlog. Llegeix production/backlog.md, selecciona la tasca OPEN de màxima prioritat, la ruta a l'agent correcte, l'executa i actualitza l'estat. Ideal per a /loop 0 /drive — pipeline semi-autònom."
argument-hint: "[--dry-run] [--priority P0|P1|P2|P3] [--type BUG|FEAT|BALANCE|CONTENT|DESIGN|QA] [--auto-defer]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Task, AskUserQuestion
---

# Drive — Orquestrador de Backlog

Executa una iteració del pipeline de desenvolupament:
```
Backlog OPEN → Selecció → Routing → Execució → Actualització backlog → Resum
```

Per a mode continu: `/loop 0 /drive` — avança tasca a tasca fins que l'usuari atura el loop.

---

## Phase 0: Parse Arguments

Arguments vàlids (tots opcionals):
- `--dry-run` → mostra quina tasca s'executaria i amb quin agent, però no la llança. Atura aquí.
- `--priority P0|P1|P2|P3` → limita la selecció a tasques d'aquella prioritat exacta.
- `--type BUG|FEAT|BALANCE|CONTENT|DESIGN|QA|DOCS` → limita per tipus de tasca.
- `--auto-defer` → ajorna automàticament totes les tasques amb `Decision: (pendent)` sense preguntar. Ideal per a `/loop 0 /drive --auto-defer` quan es vol avançar sense interrupcions.

Si `--dry-run` és present, executa les Phases 1–2 i atura a Phase 2 (mostra la selecció sense fer res).

---

## Phase 1: Llegir el Backlog

Llegir `production/backlog.md`.

Parsejar totes les tasques buscant línies que comencin per `## P` i tinguin el format:
```
## [PRIOR] [ESTAT] [TIPUS] — [ID] — Títol
```

Extreure per a cada tasca:
- **PRIOR**: P0, P1, P2 o P3
- **ESTAT**: OPEN, IN-PROGRESS, DONE, BLOCKED o DEFERRED
- **TIPUS**: BUG, FEAT, BALANCE, CONTENT, DESIGN, QA, DOCS
- **ID**: identificador de la tasca (ex: S1-02, D-01, C-01)
- **Títol**: text descriptiu
- **Agent**: camp `**Agent**:` sota la capçalera
- **File**: camp `**File**:`
- **Fix**: camp `**Fix**:`
- **Acceptance**: camp `**Acceptance**:`
- **Source**: camp `**Source**:`

Extreure també, per a cada tasca:
- **Decision**: camp `**Decision**:` — si existeix i val `(pendent)`, la tasca necessita decisió de l'usuari abans d'executar-se
- **Options**: camp `**Options**:` — llista d'opcions A/B/C per presentar a l'usuari

Filtrar: quedar-se **només** amb tasques d'ESTAT = `OPEN`.

Si s'han passat filtres (`--priority`, `--type`), aplicar-los adicionalment.

Si no hi ha tasques OPEN (ni amb els filtres aplicats): informar "Backlog buit — no hi ha tasques OPEN." i aturar.

---

## Phase 2: Seleccionar la Tasca

Ordenar les tasques OPEN per prioritat: P0 > P1 > P2 > P3.

**Si hi ha múltiples P0**: mostrar-les totes i usar `AskUserQuestion`:
- Pregunta: "Hi ha [N] tasques P0 obertes. Quina executem primer?"
- Opcions: les primeres 3 tasques P0 amb ID + títol (màx 4 opcions).

**Si hi ha exactament 1 OPEN (o 1 P0)**: seleccionar-la automàticament. Informar: "Tasca seleccionada: [ID] — [títol] ([tipus], [agent])".

**Si `--dry-run`**: mostrar la tasca seleccionada amb tots els camps i aturar aquí. No continuar a Phase 3.

---

## Phase 2b: Gate de Decisió

**Abans de continuar**, comprovar si la tasca seleccionada té el camp `**Decision**: (pendent)`.

**Si Decision és `(pendent)`**: la tasca no pot executar-se fins que l'usuari triï.

**Si `--auto-defer` és actiu**: saltar directament al pas 3 (ajornar) sense preguntar res. No mostrar cap missatge — simplement passar a la pròxima tasca sense Decision pendent.

1. Presentar la decisió pendent via `AskUserQuestion` (només si NO és `--auto-defer`):
   - Capçalera: "[ID] — [Títol]"
   - Pregunta: "Aquesta tasca requereix una decisió de disseny. Quina opció tries?"
   - Opcions: les lletres A/B/C del camp `**Options**:` (fins a 4). Afegir sempre "Ajornar — decidir més endavant" com a última opció.

2. Si l'usuari tria una opció (A/B/C):
   - Editar `production/backlog.md`: substituir `**Decision**: (pendent)` per `**Decision**: [lletra triada] — [resum de l'opció en 1 línia]`
   - Actualitzar el camp `**Fix**:` de la tasca amb la instrucció concreta corresponent a l'opció triada
   - Informar: "Decisió registrada. Continuant amb l'execució..."
   - Continuar a Phase 3.

3. Si l'usuari tria "Ajornar":
   - No modificar el backlog.
   - Seleccionar la pròxima tasca OPEN **sense** Decision pendent i continuar amb ella.
   - Si totes les tasques OPEN tenen Decision pendent: informar "Totes les tasques obertes requereixen decisió de disseny. Usa `/drive` per resoldre-les una a una." i aturar.

---

## Phase 3: Carregar Context del Fitxer

Llegir el fitxer especificat al camp `**File**:` per preparar el context per a l'agent.

Si el fitxer és `game.js`: llegir les primeres 50 línies per veure les constants globals.
Si el fitxer és `data.js`: llegir les primeres 30 línies.
Si el fitxer inclou número de línia (ex: `game.js:194`): llegir ±20 línies al voltant de la línia indicada.

Si el fitxer no existeix: avisar i preguntar si volem continuar igualment (`AskUserQuestion`).

---

## Phase 4: Routing — Escollir l'Agent

Determinar l'agent a partir del camp `**Agent**:` de la tasca. Si el camp és buit o absent, usar la taula de routing per defecte:

### Taula de routing per a Life Tycoon 2 (HTML/JS prototip)

| Tipus de tasca | Fitxer principal | Agent |
|---|---|---|
| BUG / FEAT | `game.js` (lògica de joc) | `gameplay-programmer` |
| BUG / FEAT | `style.css`, `index.html` | `ui-programmer` |
| BUG / FEAT | `data.js` (contingut) | `gameplay-programmer` |
| CONTENT | `data.js` | `gameplay-programmer` |
| BALANCE | qualsevol | `economy-designer` |
| DESIGN | GDD `.md` | `game-designer` |
| QA | qualsevol | `qa-tester` |
| DOCS | `.md` | `game-designer` |

**Nota de projecte**: L'engine és HTML5 / Vanilla JS. No usar agents Godot/Unity/Unreal. Fitxers a modificar estan a `prototypes/bloodline/`.

---

## Phase 5: Construir el Briefing de l'Agent

Construir un missatge complet per a l'agent (no resumir — donar tot el context):

```
TASCA: [ID] — [Títol]
TIPUS: [TIPUS]
PRIORITAT: [PRIOR]

FITXER A MODIFICAR: [File]
[contingut llegit a Phase 3 — les línies rellevants del fitxer]

INSTRUCCIÓ:
[contingut del camp Fix]

CRITERI DE FINALITZACIÓ:
[contingut del camp Acceptance]

REFERÈNCIA ORIGINAL:
[contingut del camp Source]

CONTEXT DE PROJECTE:
- Prototip HTML/Vanilla JS a prototypes/bloodline/
- Cap framework. ES2022 strict mode.
- Naming: camelCase per funcions/variables, UPPER_SNAKE_CASE per constants.
- No deixis comentaris que expliquin el "què"; escriu codi llegible per si sol.
- Demana permís explícit ("May I write to [path]?") abans de cada escriptura.
- Escriu al fitxer la solució mínima que resol el Fix sense tocar altres sistemes.

ENTREGABLES ESPERATS:
1. Fitxer modificat (diff mínim)
2. Breu resum: línies canviades, per què, i com verificar el criteri d'acceptació
```

---

## Phase 6: Executar

Marcar la tasca com `IN-PROGRESS` al backlog **abans** de llançar l'agent:
- Editar `production/backlog.md`: canviar `OPEN` → `IN-PROGRESS` a la capçalera de la tasca seleccionada.

Spawnar l'agent via Task amb el briefing complet de Phase 5.

Esperar que l'agent retorni.

---

## Phase 7: Actualitzar el Backlog

Segons el resultat de l'agent:

**Agent completà amb èxit** (retorna fitxers modificats + resum):
- Editar la capçalera de la tasca: `IN-PROGRESS` → `DONE`
- Afegir sota la tasca un camp nou:
  ```
  - **Completada**: [data] — [1 línia de resum del que va fer l'agent]
  ```
- Actualitzar el comentari `<!-- STATS -->` al final del backlog (comptar OPEN/DONE/BLOCKED).

**Agent bloquejat o retorna error**:
- Editar la capçalera: `IN-PROGRESS` → `BLOCKED`
- Afegir:
  ```
  - **Bloqueig**: [data] — [raó del bloqueig]
  ```

**Pendent de verificació manual** (tasques FEAT o BALANCE que necessiten revisió humana):
- Editar: `IN-PROGRESS` → `OPEN` (torna a OPEN fins que l'usuari confirmi)
- Afegir nota:
  ```
  - **Pendent revisió**: [data] — implementat per agent, pendent confirmació visual/playtest
  ```

---

## Phase 8: Resum Final

Presentar:

```
## Drive completat — [ID] [Títol]

**Resultat**: DONE / BLOCKED / PENDENT REVISIÓ
**Agent executat**: [nom]
**Fitxers canviats**: [llista]

**Criteri d'acceptació**:
- [x] [criteri] — verificat / pendent verificació manual

**Tasca pendent prioritat**: [ID del pròxim P0 o P1 OPEN, o "Backlog buit"]

---
Per continuar: `/drive`
Per verificar el fix: `/playtest targeted: [sistema]`
Per veure l'estat complet: `Read production/backlog.md`
```

---

## Protocol Col·laboratiu

- **Mai escriure fitxers directament** — tots els canvis de codi els fa l'agent subspawned via Task.
- **Sempre demanar permís** si la tasca seleccionada és DESIGN o BALANCE (impacte de disseny alt): usar `AskUserQuestion` per confirmar abans de llançar l'agent.
- **No tocar tasques DONE/BLOCKED/DEFERRED** — mai reobrir automàticament una tasca tancada.
- **Una tasca per execució** — no intentar resoldre dues tasques en paral·lel al mateix `/drive`.
- **Si l'agent fa canvis fora de l'scope del Fix**: reportar-ho explícitament al resum i no marcar com DONE fins que l'usuari confirmi.

---

## Recomanacions post-execució

- `/drive` — continuar amb la pròxima tasca
- `/playtest targeted: [sistema]` — verificar que el fix no ha introduït regressions
- `/loop 0 /drive` — mode continu (avança fins que el backlog és buit o l'usuari atura)
- `Read production/backlog.md` — veure l'estat complet del backlog
