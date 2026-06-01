---
name: era-design
description: "Pipeline de disseny d'eres per a Life Tycoon 2. Orquestra 7 fases: tecnologies → branques → habilitats → accions → balanç → documentació → events. Amb checkpointing per reprendre des de qualsevol fase. Usa era-historian i era-writer com a agents especialitzats."
argument-hint: "[era-name] [--phase N] [--reset]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Task, AskUserQuestion
---

# Era Design — Pipeline de 7 Fases

Dissenya una era completa per a Life Tycoon 2 de forma iterativa i documentada.
Cada fase genera un document de disseny que has d'aprovar abans de continuar.
El sistema desa l'estat a `design/eras/[era-name]/state.md` per poder reprendre en qualsevol moment.

```
Fase 1: Tecnologies → Fase 2: Branques → Fase 3: Habilitats
→ Fase 4: Accions → Fase 5: Balanç → Fase 6: Documentació → Fase 7: Events
```

---

## Phase 0: Parse Arguments i Carregar Estat

**Arguments**:
- `[era-name]`: nom curt de l'era (ex: `neolitic`, `edat-bronze`, `antiguitat`). Si no es dona, preguntar.
- `--phase N`: forçar l'inici a la fase N (per saltar o repetir una fase)
- `--reset`: esborrar l'estat i tornar a la fase 1 (demanar confirmació primer)

**Passos**:
1. Si no hi ha `era-name`, usar `AskUserQuestion`: "Quin és el nom curt d'aquesta era? (ex: neolitic, edat-bronze)"
2. Llegir `design/eras/[era-name]/state.md` si existeix
3. Si no existeix: és una era nova → crear el directori i iniciar des de la fase 1
4. Si existeix: mostrar l'estat actual i preguntar si continuar des d'on s'havia deixat o forçar una fase concreta

**Format del state.md:**
```markdown
# Era Design State — [Era Name]

## Metadades
- **Era ID**: `era_[id]`
- **Nom Display**: [nom per mostrar al jugador]
- **Període Històric**: [dates i civilitzacions]
- **Era precedent**: [era_id | cap]
- **Creat**: [data]
- **Actualitzat**: [data]

## Progrés de Fases
- [ ] Fase 1: Tecnologies → `design/eras/[era]/01-technologies.md`
- [ ] Fase 2: Branques → `design/eras/[era]/02-branches.md`
- [ ] Fase 3: Habilitats → `design/eras/[era]/03-skills.md`
- [ ] Fase 4: Accions → `design/eras/[era]/04-actions.md`
- [ ] Fase 5: Balanç → `design/eras/[era]/05-balance.md`
- [ ] Fase 7: Events → `design/eras/[era]/07-events.md`

## Decisions Clau
- **Nombre de tecnologies**: [N]
- **Branques**: [llista]
- **Habilitats totals**: [N] ([N] compartides)
- **Accions totals**: [N base + N de branca]

## Notes
[Qualsevol decisió de disseny important que no encaixi als documents de fase]
```

---

## Phase 1: Tecnologies Universals

**Prerequisit**: era-name conegut, context del període definit

### Pas 1.1 — Definir el context de l'era
Usar `AskUserQuestion`:
- "Quin és el nom display de l'era? (ex: Neolític, Edat del Bronze)"
- "Quin és el període (dates aproximades i civilització de referència)?"
- "Quina era el precedeix? (per saber quin és el exit_connector)"
- "Quantes tecnologies universals vols per aquesta era? (recomanació: 5–9)"

### Pas 1.2 — Spawnar era-historian
Via Task, amb briefing complet:

```
TASCA: Proposta de [N] Universal Techs per a l'era [Era Name]

CONTEXT DE L'ERA:
- Nom: [Era Name]
- Període: [dates i civilització]
- Era precedent: [era anterior] amb exit_connector: [tech anterior]
- Nombre de techs demanat: [N]

CONTEXT DEL JOC (Life Tycoon 2):
- Les Universal Techs es descobreixen automàticament quan el personatge arriba al cicle corresponent
- Cada tech pot tenir prerequisits de techs anteriors (universal_prereq)
- La darrera tech de l'era hauria de ser el "connector" cap a la pròxima era
- Cicles per era: aproximadament 20 cicles per vida, les eres duren generacions
- Format de dades: { id, name, cycle, icon, description, era }

REFERÈNCIA ERA 1 (Paleolític):
El Foc (cicle 2), Eines de Pedra (4), Cesteria (6), Art Rupestre (7),
L'Atlatl (9), La Ceràmica (12), L'Agricultura Incipient (16 — connector)

INSTRUCCIÓ: Proposa [N] Universal Techs amb justificació històrica i cicle suggerit.
Distribueix-les de manera que cobreixin els 4 perfils d'inclinació del joc.
Inclou una tech-connector cap a la pròxima era.
Presenta el resultat en format Markdown estructurat.
```

### Pas 1.3 — Presentar propostes a l'usuari
Mostrar la proposta de l'historiador i preguntar:
- "Quines d'aquestes tecnologies vols incloure? Pots seleccionar-ne totes, algunes, o demanar alternatives."

Usar `AskUserQuestion` de manera iterativa fins que l'usuari tingui el conjunt definitiu.

**Si l'usuari demana alternatives**: tornar a spawnar era-historian amb les techs rebutjades i la raó.

**Si l'usuari vol modificar una tech**: permetre edició directa del nom/cicle.

### Pas 1.4 — Escriure `01-technologies.md`
Demanar: "May I write the selected technologies to `design/eras/[era]/01-technologies.md`?"

Format del fitxer:
```markdown
# [Era Name] — Universal Technologies
**Estat**: APROVAT [data]
**Nombre de techs**: [N]

## Llista de Tecnologies

| ID | Nom | Cicle | Branca/Eix afavorit | Connector |
|---|---|---|---|---|
| ut_[id] | [nom] | [N] | [eix] | [sí/no] |

## Detalls

### [Nom Tech]
- **ID**: `ut_[id]`
- **Cicle**: [N]
- **Prerequisit**: [ut_id | cap]
- **Eix afavorit**: [eix]
- **Justificació**: [text de l'historiador]
- **Format data.js**:
  ```js
  { id: "ut_[id]", name: "[nom]", cycle: N, icon: "🔥", description: "[desc]" }
  ```

[repetir per a cada tech]

## Notes de Distribució
[Notes de l'historiador sobre cobertura de branques]
```

Actualitzar `state.md`: marcar Fase 1 com ✅ COMPLETA.

---

## Phase 2: Branques

**Prerequisit**: `01-technologies.md` aprovat

### Pas 2.1 — Spawnar era-historian i era-writer en paral·lel
Dos Tasks simultanis:

**era-historian**: "Proposa 4 branques per a [Era Name] ([dates]) coherents amb la vida social del període. Per a cada branca: nom, descripció, rol social real, eixos d'inclinació dominants."

**era-writer**: "Per a [Era Name], proposa 4 branques amb fort arc narratiu de jugabilitat. Per a cada branca: fantasia del jugador, nom en català evocador, com es diferencia de les branques de l'Era 1 (Caçador/Recol·lector/Artesà/Místic)."

### Pas 2.2 — Sintetitzar i presentar
Combinar les propostes dels dos agents: l'historiador dona rigor, l'escriptor dona fantasia.
Per a cada branca proposta, mostrar:
- Nom + descripció (historiador)
- Fantasia del jugador (escriptor)
- Eixos d'inclinació suggerits

Preguntar: "Quines branques vols per a [Era Name]? Pots acceptar les propostes, modificar-ne el nom, ajustar els eixos, o demanar alternatives."

### Pas 2.3 — Definir condicions d'inclinació
Per a cada branca acceptada, presentar els eixos suggerits i confirmar els llindars:
- "La branca [Nom] té eixos [A ≥ X] AND [B ≥ Y]. Vols ajustar els llindars?"
- Recordar que han de crear zones d'intersecció natural (branques híbrides assolibles)

### Pas 2.4 — Escriure `02-branches.md`
Format:
```markdown
# [Era Name] — Branches
**Estat**: APROVAT [data]

## Branques

### [Nom Branca]
- **ID**: `[branch_id]`
- **Condicions**: `[eix] ≥ [X]` AND `[eix] ≥ [Y]`
- **Descripció**: [qui és en la seva societat]
- **Fantasia**: [com s'ha de sentir el jugador]
- **Arc de l'era**: [inici → progrés → connexió a pròxima era]

[repetir per a les 4 branques]

## Zones d'intersecció
[Quines parelles de branques son híbrids assolibles i per quines condicions]

## Format data.js
[Codi de les condicions per copiar a BRANCHES]
```

Actualitzar `state.md`: marcar Fase 2 com ✅ COMPLETA.

---

## Phase 3: Habilitats

**Prerequisit**: `02-branches.md` aprovat

### Pas 3.1 — Spawnar era-writer
Via Task:

```
TASCA: Proposta d'habilitats per a [Era Name]

BRANQUES APROVADES:
[contingut de 02-branches.md]

TECNOLOGIES UNIVERSALS:
[contingut de 01-technologies.md — per saber els prerequisits possibles]

INSTRUCCIÓ:
Per a cada branca, proposa 2–4 habilitats. Indica quines son compartides entre branques.
Per a cada habilitat: ID, nom, condicions d'inclinació, accions que desbloquearà (noms provisionals),
efecte passiu opcional, branca(ques).
Recorda: les habilitats compartides entre branques han de tenir sentit narratiu i mecànic.
Format: plantilla d'habilitat del manual de l'agent.
```

### Pas 3.2 — Revisar i aprovar iterativament
Mostrar cada habilitat proposta i permetre:
- Acceptar tal qual
- Modificar nom, condicions o efecte passiu
- Rebutjar i demanar alternativa
- Marcar com a "pendent" (per revisar amb el balanç de la Fase 5)

### Pas 3.3 — Escriure `03-skills.md`
Format similar al de l'era 1 (`content-plan-era1.md`), secció habilitats.
Incloure taula-resum amb habilitats compartides clarament marcades.

Actualitzar `state.md`: marcar Fase 3 com ✅ COMPLETA.

---

## Phase 4: Accions

**Prerequisit**: `03-skills.md` aprovat

### Pas 4.1 — Spawnar era-writer per a cada branca
Per eficiència: spawnar un Task per branca en paral·lel (4 Tasks simultanis).

Per a cada branca, el briefing inclou:
- Les habilitats de la branca (de 03-skills.md)
- Les accions base ja existents de l'era (si n'hi ha)
- Guies de mecànica: cost/output típic, stat_keys, pools d'events

### Pas 4.2 — Revisar acció per acció
Mostrar per branca. Per a cada acció:
- Verificar que el nom sigui en català i evocador
- Confirmar que els `inclination_deltas` siguin coherents amb la branca
- Acceptar / modificar / rebutjar

### Pas 4.3 — Escriure `04-actions.md`
Format: taula-resum + fitxa detallada per acció.
Incloure les accions base de l'era al principi.

Actualitzar `state.md`: marcar Fase 4 com ✅ COMPLETA.

---

## Phase 5: Balanç Iteratiu

**Prerequisit**: `04-actions.md` aprovat

Aquesta fase comprova que cada camí de joc (seguir qualsevol branca) sigui viable
i divertit. Les branques poden tenir dificultats diferents, però han de compensar-se.

### Pas 5.1 — Anàlisi per branca
Per a cada branca, calcular o estimar:

**Sostenibilitat alimentaria**:
- Output d'Aliment de les accions base: `Σ output_min a output_max` per acció disponible
- Upkeep per cicle: `FOOD_UPKEEP` (valor de data.js)
- Marge: `output_mig - upkeep` — ha de ser positiu per a joc normal

**Compensació per dificultat**:
- Si una branca té marge baix: ha de tenir algun bonus que justifiqui la dificultat
  (Salut alta, Provisions extra, creixement ràpid de stats, etc.)
- Si una branca és massa fàcil: és menys interessant estratègicament

**Cobertura d'inclinació**:
- Cada acció empeny l'eix de la branca? (coherència)
- Hi ha accions "trampa" que empenyin fora de la branca sense compensació?

### Pas 5.2 — Spawnar economy-designer
Via Task amb l'anàlisi:

```
TASCA: Anàlisi de balanç de [Era Name]

DADES D'ACCIONS:
[contingut de 04-actions.md]

CONSTANTS DEL JOC:
- FOOD_UPKEEP: 2/cicle
- LIFE_EXPECTANCY: 20 cicles
- DESTRESA_THRESHOLD: 5 usos

PER A CADA BRANCA, analitza:
1. Sostenibilitat alimentaria (output mig - upkeep)
2. Compensació si la dificultat és alta (quins beneficis alternatius hi ha)
3. Coherència dels deltes d'inclinació (les accions empenyen cap a la branca?)
4. Existència d'accions trampa (perjudiquen sense compensació)
5. Comparació entre branques (cap branca ha de ser clarament dominada per una altra)

Presenta els resultats per branca: SOSTENIBLE / DIFICULTAT ALTA / TRAMPA.
Per als casos problemàtics, proposa ajustos mínims (canviar un valor, no redissenyar).
```

### Pas 5.3 — Iteració amb l'usuari
Per a cada problema detectat:
1. Mostrar el problema i la proposta d'ajust
2. `AskUserQuestion`: "Acceptes l'ajust [descripció]? O prefereixes [alternativa] o deixar-ho com està?"
3. Aplicar els ajustos aprovats a `04-actions.md`
4. Tornar al Pas 5.2 si hi ha canvis significatius

La iteració continua fins que l'usuari digui "el balanç és acceptable".

### Pas 5.4 — Escriure `05-balance.md`
```markdown
# [Era Name] — Balance Report
**Estat**: APROVAT [data]
**Iteracions**: [N]

## Resum per Branca

| Branca | Sostenibilitat | Compensació | Estat |
|---|---|---|---|

## Ajustos Aplicats
[Llista de canvis fets a 04-actions.md amb justificació]

## Branches Especials
[Notes sobre branques de dificultat alta intencionada i la seva compensació]
```

Actualitzar `state.md`: marcar Fase 5 com ✅ COMPLETA.

---

## Phase 6: Punt de Documentació

**Automàtic — no requereix agents**

Actualitzar `state.md` amb el resum complet de l'era:
- Nombre final de techs, branques, habilitats, accions
- Decisió de disseny més important de cada fase
- Advertències o pendents identificats

Mostrar a l'usuari:
```
## Era [Name] — Resum de Disseny

Fase 1 ✅  [N] Universal Techs (connector: [tech])
Fase 2 ✅  [N] Branques: [llista]
Fase 3 ✅  [N] Habilitats ([N] compartides)
Fase 4 ✅  [N] Accions ([N] base + [N] de branca)
Fase 5 ✅  Balanç aprovat ([N] ajustos)

Pendents de Fase 7 (Events): [pools d'events identificats]

---
Continuar amb la Fase 7 (Events)? o aturar aquí i continuar en una sessió futura?
```

---

## Phase 7: Events

**Prerequisit**: Fases 1–5 completades

### Pas 7.1 — Identificar els pools d'events necessaris
De `04-actions.md`, extreure tots els valors únics de `event_pool_id`.
Típicament: `pool_caca`, `pool_ritual`, `pool_artesania`, `pool_recollecta`, `pool_social`, `pool_exploracio`...

Mostrar la llista a l'usuari: "Aquests son els pools d'events que necessiten contingut. Vols generar-los tots ara o en fases? (recomanat: 1–2 pools per sessió)"

### Pas 7.2 — Spawnar era-historian + era-writer per cada pool
Per a cada pool seleccionat, dos Tasks en paral·lel:

**era-historian**: "Per al pool [pool_id] de l'era [Name] ([dates]), proposa 3 situacions reals que podien passar en aquell context. Per a cada una: escena, 2–3 opcions amb dilema real, conseqüència plausible."

**era-writer**: "Per al pool [pool_id], dona veu narrativa a les situacions de l'historiador. Escriu els textos en català, to íntim, primera persona. Afegeix 1 event de descoberta d'habilitat si escau."

### Pas 7.3 — Revisar events
Per a cada event proposat:
- Verificar coherència amb el període
- Confirmar que les opcions son genuïnament interessants (dilema real, no una opció clarament millor)
- Ajustar els valors mecànics si cal

### Pas 7.4 — Escriure `07-events.md`
Format compatible amb l'estructura d'events del joc (basat en `event-system.md`).

Actualitzar `state.md`: marcar Fase 7 com ✅ COMPLETA.

---

## Phase Final: Era Completa

Quan totes les fases estan marcades com a ✅ en `state.md`:

```
## Era [Name] — DISSENY COMPLET

Tots els documents de disseny estan aprovats:
- design/eras/[era]/01-technologies.md ✅
- design/eras/[era]/02-branches.md ✅
- design/eras/[era]/03-skills.md ✅
- design/eras/[era]/04-actions.md ✅
- design/eras/[era]/05-balance.md ✅
- design/eras/[era]/07-events.md ✅

---
Pròxims passos:
1. /era-implement [era-name] → genera el codi data.js a partir dels documents
2. /playtest → verifica que el contingut funciona en el prototip
3. /era-design [pròxima-era] → comença el disseny de la pròxima era
```

---

## Protocol Col·laboratiu

- **Mai escriure codi** — aquest skill genera documents de disseny, no data.js. La implementació és un skill separat (`/era-implement`).
- **Sempre mostrar les propostes** dels agents abans d'escriure cap fitxer.
- **Respectar el ritme de l'usuari**: si diu "atura aquí", guardar l'estat i sortir. La propera crida reprendrà on s'havia deixat.
- **Una fase per sessió** si l'usuari ho prefereix — cada fase és independent i checkpointable.
- **Si un agent retorna una proposta massa extensa**: resumir en un primer missatge, oferir llegir el detall sota petició.
