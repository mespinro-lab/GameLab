# Revisió de Coherència — Life Tycoon 2 — 2026-05-29

## Resum executiu

El conjunt de documentació de LT2 és **estructuralment sòlid** però mostra **desfasament significatiu entre el GDD, el prototip i les decisions adoptades als playtests**. La distància més important és que el GDD descriu una arquitectura JSON data-driven completa amb era-system, score d'era, crònica, badges, reputació i events de pressió, mentre que el **prototip implementa només una versió simplificada del nucli de mecàniques d'inclinació + branch techs + successió generacional**, sense eres múltiples ni el bucle de puntuació. A més, durant els playtests del 2026-05-29 s'han adoptat decisions de balance (5 universal techs vs 3, 13 branch techs, llindar `intel·lecte ≤ 0.05` problemàtic, etc.) que el GDD encara descriu de forma genèrica o no documenta.

Hi ha **inconsistències crítiques de terminologia** (Saber / Provisions / Recursos / 🧠 / Aliment / Menjar), **noms d'eixos d'inclinació amb el caràcter especial `intel·lecte`** que apareix amb i sense punt volat segons el document, i **discrepàncies de constants** entre GDD i codi (LIFE_EXPECTANCY=14 al codi vs base_cycles=12 al GDD; HEALTH com a estat -1/torn al codi però com a indicador sense decay automàtic al GDD).

Els problemes més greus per a la jugabilitat no són tècnics sinó **decisions de disseny obertes sense documentar**: quina és la relació entre el sistema d'1 era simplificada del prototip i el sistema multi-era del GDD, si el prototip ha de implementar el sistema de score i crònica (avui absents), i si els llindars d'inclinació actuals (que fan inalcançables 4 de 13 branch techs en Gen 1) son intencionals com a contingut multi-generacional o son errors de balance.

L'arquitectura JSON descrita al GDD encara **no existeix al prototip** (tot són constants JS); s'haurà de redissenyar el contingut quan es migri a Godot. Les fórmules del GDD i les del codi coincideixen substancialment en la inèrcia d'inclinació i l'herència generacional, però el GDD descriu un sistema d'events amb cadenes, pesos i triggers que el codi implementa de forma molt més simple (un event aleatori del pool, sense encadenament, sense `chain_probability` ni `is_skippable`).

---

## Problemes per categoria

### 1. Contradiccions entre GDD documents

#### C1-01 — `BRANCH_INHERITANCE_RATE` aplicat a stats no consta a `lineage-chronicle.md`
**Gravetat**: Mitjana
**Tipus**: Contradicció GDD↔GDD (omissió)

`lineage-chronicle.md §3.1` defineix la taula d'herència generacional amb 9 categories (inclinació, tecnologies, accions, aprenentatges, destreses, característiques, indicadors, recursos, reputació). **No menciona stats** (Força/Enginy/Vincle). El prototip (`game.js:466`) hereta stats al `BRANCH_INHERITANCE_RATE` però el sistema d'stats com a tal no existeix al GDD (vegeu C7-01).

**Recomanació**: Decidir si els stats viuen al GDD o no. Si sí: afegir-los a `lineage-chronicle.md §3.1` amb la fracció d'herència. Si no: documentar al `tech-architecture.md` o crear `character-stats.md` com a sistema nou.

#### C1-02 — `MIN_BRANCH_INCLINATION` (0.20) vs `BRANCH_TECH_MIN_INCLINATION` (0.25) — distinció no usada
**Gravetat**: Baixa
**Tipus**: Contradicció GDD↔GDD (constant orfe)

`_overview.md §7` defineix dos knobs separats: `MIN_BRANCH_INCLINATION = 0.20` (activar branca) i `BRANCH_TECH_MIN_INCLINATION = 0.25` (desbloquejar tec. de branca). Però `branch-system.md` defineix branques i branch techs com a evaluacions de **condicions per eix** (`min`/`max` per axis), no com a llindars globals. Aquests dos knobs no s'usen enlloc més al GDD ni al prototip.

**Recomanació**: Eliminar de `_overview.md §7` aquests dos knobs orfes, o documentar com s'haurien d'aplicar si han de tenir efecte.

#### C1-03 — Fórmules d'inclinació duplicades amb micro-diferències entre `_overview.md` i `branch-system.md`
**Gravetat**: Baixa
**Tipus**: Contradicció GDD↔GDD (duplicació)

`_overview.md §4` i `branch-system.md §3.2` defineixen la mateixa fórmula d'inèrcia amb el mateix paràmetre `INERTIA_FACTOR`, però la duplicació crea risc futur de desfasament. La taula d'efecte pràctic només existeix a `branch-system.md §3.2`.

**Recomanació**: A `_overview.md §4`, substituir la fórmula completa per una referència: "Vegeu `branch-system.md §3.2` per a la fórmula d'actualització d'inclinació". Mantenir una única font de veritat.

#### C1-04 — `era-system.md` defineix `BASE_CYCLES_PER_ERA` i `MAX_CYCLES_PER_ERA` però `_overview.md §7` defineix `BASE_CYCLES_PER_ERA` "Per era"
**Gravetat**: Baixa
**Tipus**: Terminologia inconsistent

`era-system.md §3.2` usa `life_expectancy.base_cycles` i `life_expectancy.max_cycles` com a noms de camp del JSON. `_overview.md §7` usa `BASE_CYCLES_PER_ERA` com a tuning knob. `scoring-system.md §3.1` fórmula usa `era.life_expectancy.max_cycles`. El nom canònic no està fixat.

**Recomanació**: Fixar `era.life_expectancy.base_cycles` i `era.life_expectancy.max_cycles` com a noms canònics (són els que apareixen al JSON). Renomenar `BASE_CYCLES_PER_ERA` a `LIFE_EXPECTANCY` o eliminar-lo del knob global, ja que cada era el defineix.

#### C1-05 — Numeració de seccions a `event-system.md` salta de 3.7 a 3.9 i torna a 3.8
**Gravetat**: Baixa
**Tipus**: Terminologia inconsistent (estructural)

`event-system.md`: §3.7 (Events Rars), §3.9 (Events de Descoberta), §3.8 (Events de Pressió - referència). L'ordre numèric s'ha trencat.

**Recomanació**: Renumerar §3.9 → §3.8 i §3.8 → §3.9, o reordenar lògicament.

---

### 2. Divergències GDD vs prototip

#### C2-01 — El prototip implementa només Era 1 implícitament; cap concepte de `era_registry`, `era_id`, transicions
**Gravetat**: Alta
**Tipus**: Funcionalitat absent (GDD descriu, codi no implementa)

`era-system.md` és el segon document més detallat del GDD: cadena d'eres, schemes JSON d'era, connectors entry/exit, life_expectancy per era, transicions d'era, validació de coherència. **El prototip no té cap d'aquests conceptes**: no hi ha `era_id` ni a `game.js` ni a `data.js`, `LIFE_EXPECTANCY = 14` és una constant global, `MAX_GENERATIONS = 5` és global, i el game over es produeix a la 5a generació sense transició a l'Era 2.

**Recomanació**: Documentar explícitament l'**estat del prototip al GDD** — afegir una nota a `_overview.md` o crear `production/prototype-scope.md` que digui: "El prototip valida només el bucle d'una sola era amb 5 generacions. Les transicions multi-era es validaran després". Sense això, el lector del GDD pot pensar que el codi és incomplet quan és intencional.

#### C2-02 — Sistema de score d'era completament absent del prototip
**Gravetat**: Alta
**Tipus**: Funcionalitat absent

`scoring-system.md` és un document complet (8 seccions) amb fórmules per `era_score`, `run_score`, `dominant_branch_bonus`, `coherence_bonus`, títols de dinastia, reputació amb decay, pantalla de score. **Cap línia del prototip implementa res d'això**. El prototip mostra `gameover-modal` amb un text fix sense puntuació.

**Recomanació**: Confirmar si el sistema de score forma part del MVP del prototip o és post-prototip. Si post-prototip, marcar `scoring-system.md` amb un banner "[NO IMPLEMENTAT AL PROTOTIP — POST-MVP]". Si MVP, és un blocant immediat.

#### C2-03 — Crònica del llinatge absent del prototip
**Gravetat**: Alta
**Tipus**: Funcionalitat absent

`lineage-chronicle.md §3.4-3.5` defineix `chronicle_templates.json`, generació de crònica amb plantilles parametritzades, format de 5-10 frases, exportació. El prototip té `state.log` (8 entrades en memòria) i prou. El glossari mostra "Crònica del Llinatge: Pendent" (`game.js:1306`), confirmant que el codi ho sap.

**Recomanació**: Igual que C2-02: marcar com a post-MVP del prototip, o blocar com a tasca. Decidir explícitament.

#### C2-04 — Sistema de badges absent del prototip
**Gravetat**: Mitjana
**Tipus**: Funcionalitat absent

`badge-system.md` complet (7 categories, 8 tipus de condicions de desbloqueig, persistència separada). Cap implementació al prototip. No causa cap problema immediat però el prototip no pot validar la fantasia de meta-col·lecció.

**Recomanació**: Post-MVP confirmar i documentar.

#### C2-05 — Events de pressió del món absents del prototip
**Gravetat**: Alta
**Tipus**: Funcionalitat absent

`era-system.md §3.6` defineix `pressure_events` amb triggers periòdics, condicionals i programats, blocatges, `pe_malaltia`, `pe_hivern_dur`, etc. **El prototip no implementa cap event de pressió**. `content-plan-era1.md §8` llista 6 events de pressió definits però cap apareix a `data.js`. El passive_effect `event_block` de `bt_guariment_plantes` apunta a `pe_malaltia` (data.js:81) — un event que no existeix al codi. Confirmat al playtest com a **S3-12**.

**Recomanació**: Decidir prioritat. Si els events de pressió no son al MVP del prototip, eliminar el `passive_effect: { type: "event_block", event_id: "pe_malaltia" }` o marcar-ho com a placeholder. El glossari pot mostrar "Pressió del món: pendent".

#### C2-06 — Sistema d'events: cadenes (`chain_pool_id`, `chain_probability`) i `is_skippable` absents al prototip
**Gravetat**: Mitjana
**Tipus**: Funcionalitat absent (parcial)

`event-system.md §3.3` defineix events amb `is_skippable`, `chain_pool_id`, `chain_probability`, `narrative_tag`. El prototip implementa només events simples (`text` + `effects` o `options`), sense encadenament, sense skippable, sense narrative_tag. `EVENT_CHAIN_DECAY` (al GDD) no existeix al codi.

**Recomanació**: Marcar l'event-system com a "implementació simplificada al prototip — sense cadenes". Decidir si les cadenes són MVP de prototip o post-prototip.

#### C2-07 — Tecnologies universals: GDD diu `universal_tech_schedule` per era; codi té array global
**Gravetat**: Baixa
**Tipus**: GDD↔Codi (diferent estructura, equivalent funcional)

`era-system.md §3.2` descriu `universal_tech_schedule` com a camp de l'era. El prototip té `UNIVERSAL_TECHS` com a array global (`data.js:7-33`). Funcionalment equivalent (una sola era) però estructuralment diferent — el prototip no està preparat per a múltiples eres sense refactor.

**Recomanació**: Acceptable per al prototip. Documentar com a "shortcut del prototip; producció seguirà `era-system.md`".

#### C2-08 — `inclination_requirements` amb `min`/`max` per eix al GDD — codi implementa correctament però no usat a la majoria d'accions
**Gravetat**: Baixa
**Tipus**: GDD↔Codi (funcionalitat present, ús limitat)

`branch-system.md §3.6` i `action-economy.md §3.6` defineixen `inclination_requirements` per fer accions FADED/HIDDEN. El codi (`getActionVisibility`, `game.js:101-123`) ho implementa correctament. Però la majoria d'accions a `data.js` **no declaren `inclination_requirements`** — només la visibilitat per branch tech (`unlocks_action_ids`). El sistema FADED/HIDDEN del GDD només s'activaria si s'afegissin `inclination_requirements` a les accions.

**Recomanació**: Decidir disseny: ¿les accions tenen `inclination_requirements` per fer-se atenuades quan vires de branca, o la mecànica de "perdre accions en virar" es delega només al fet que els outputs son baixos? Si la primera, afegir `inclination_requirements` a totes les accions de branca. Si la segona, eliminar el sistema FADED del GDD.

#### C2-09 — Stats (Força/Enginy/Vincle) presents al codi, absents al GDD
**Gravetat**: Alta
**Tipus**: Funcionalitat present però no dissenyada

El prototip té `stats: { forca, enginy, vincle }` (`game.js:39`), amb `STAT_MAX=5.0`, `STAT_OUTPUT_FACTOR=0.15`, `stat_gain` per acció, multiplicador d'output, herència al 65%, problemes detectats al playtest (S2-21 stats max a Gen 3 cicle 7). **Cap GDD documenta el sistema d'stats**. El més proper és `lineage-chronicle.md §3.1` que menciona "Destreses (innates, heretades íntegrament per genètica)" i "Característiques (Parcial)" — ambdós conceptes diferents de stats.

**Recomanació**: Decisió de disseny urgent. Si els stats són MVP: crear `design/gdd/life-tycoon-2/character-stats.md` documentant Força/Enginy/Vincle, multiplicadors, creixement, herència, balance (S2-21). Si no són MVP: eliminar-los del prototip i tornar a destreses+característiques com diu el GDD.

#### C2-10 — Destreses al codi com a flat bonus + threshold, al GDD com a "aptitud innata era-nomenada"
**Gravetat**: Mitjana
**Tipus**: GDD↔Codi (concepte diferent)

`_overview.md §3.10` defineix Destresa com "Aptitud innata. Era-nomenada (mateixa destresa, nom de l'època). Herència: Sí, íntegra". El codi (`game.js:325-336`) implementa destreses com a **habilitats descobertes per ús repetit** (`DESTRESA_THRESHOLD = 5` usos per descobrir). Conceptualment diferent: el GDD diu innates, el codi diu apreses.

**Recomanació**: Reconciliar. El comportament del codi (apreses per repetició) és més interessant per al gameplay però contradiu la definició del GDD. Recomanació: actualitzar `_overview.md §3.10` per reflectir l'aproximació "apreses per ús", o crear `character-stats.md` amb la nova definició.

#### C2-11 — `act_tallar_pedra` defineix `output_resource: "eines"` però `_overview.md §3` parla de "Provisions" com a recurs d'acció
**Gravetat**: Mitjana
**Tipus**: GDD↔Codi (nom de recurs)

`data.js:171`: `output_resource: "eines"`. `game.js:325`: `if (outRes === 'eines') { state.materials += output; }`. Però `state.materials` es renderitza amb `🧠` (`game.js:606`) i es mostra com "Provisions" al glossari (`game.js:1191`). El recurs intern es diu `materials` al state, `eines` als outputs, `Provisions` a la UI. Tres noms per al mateix.

**Recomanació**: Vegeu C4-01 (terminologia). Unificar a "Provisions" als logs, "materials" o "provisions" al codi, "🧠" al render.

#### C2-12 — `FOOD_UPKEEP = 1` i `HEALTH_UPKEEP = 1` per torn — no consta al GDD
**Gravetat**: Mitjana
**Tipus**: GDD↔Codi (mecànica no documentada)

El codi consumeix Aliment -1 i Salut -1 cada cicle (`game.js:401-402`). Els playtests han confirmat que Salut -1 per cicle és **envelliment**. El GDD `_overview.md` indica que Salut és un indicador base i que arribar a 0 = mort, però **no documenta el decay automàtic per cicle**. Tampoc la conversió Aliment esgotat → Salut decreix consta com a fórmula.

**Recomanació**: Afegir a `_overview.md §3` (jerarquia de recursos) o a `action-economy.md`: secció "Upkeep per cicle" amb Aliment -1 i Salut -1 com a regles de manteniment universal. Especificar Aliment esgotat → Salut -X/cicle (si aplica).

#### C2-13 — `MAX_GENERATIONS = 5` al codi, no consta al GDD
**Gravetat**: Mitjana
**Tipus**: GDD↔Codi (limitació no documentada)

El prototip acaba el joc a la generació 5 (`game.js:13, 459`). El GDD no menciona cap límit fix de generacions; al contrari, `_overview.md §5` diu que el game over és "Game over únicament quan s'extingeix tot l'arbre del llinatge" i no menciona límit numèric.

**Recomanació**: Decidir si `MAX_GENERATIONS = 5` és una limitació del prototip (per fer sessions curtes de playtest) o una regla de disseny. Si la primera, documentar al README del prototip. Si la segona, afegir al GDD `_overview.md §5` i `era-system.md`.

#### C2-14 — `MAX_CHILDREN = 3` al codi, GDD diu 1-6 segons era
**Gravetat**: Baixa
**Tipus**: GDD↔Codi (constants no coincidents)

`lineage-chronicle.md §7` diu `MAX_CHILDREN`: "Per era (era.json) 1–6". El codi (`game.js:28`) fixa 3.

**Recomanació**: Acceptable com a valor de prototip. Documentar al README del prototip.

#### C2-15 — Discovery action: GDD diu "una sola acció era-específica", codi té `act_escoltar_estrangers` amb selecció múltiple
**Gravetat**: Mitjana
**Tipus**: GDD↔Codi (semantica diferent)

`branch-system.md §3.5.1 Via 1`: "Cada era té exactament una acció de descoberta. Quan el jugador l'executa: 1. S'avaluen totes les branch techs elegibles. 2. Es desbloqueja la que té la maduresa més alta". El codi (`performDiscoveryAction`, `game.js:220-240`) accepta un paràmetre `chosenBtId` i el render permet **al jugador escollir** quina tech aprendre quan n'hi ha múltiples (`buildZoneActionRow`, game.js:961-980). Això **contradiu el GDD** que diu que es desbloqueja automàticament la de maduresa més alta.

A més, l'algoritme de maduresa (`getBranchTechMaturity`, `game.js:193-201`) té un **biaix sistemàtic** confirmat al playtest **S2-02**: condicions `max` puntuen positivament per estar lluny del max, fent que sempre guanyin enfront de condicions `min`.

**Recomanació**: Decisió de disseny. (A) El GDD diu auto-select per maduresa — actualitzar codi per treure la selecció manual i corregir el biaix de maduresa. (B) El codi vol que el jugador esculli — actualitzar `branch-system.md §3.5.1` per permetre selecció del jugador, eliminar la fórmula de maduresa, fer-la merament suggerent. Recomanació personal: **opció B**, perquè el playtest sembla preferir aquest enfocament.

#### C2-16 — Universal tech `effect.healthBonus` al codi vs `one_time_effects.indicator_deltas.health` al GDD
**Gravetat**: Baixa
**Tipus**: Terminologia inconsistent

`era-system.md §3.4` defineix l'efecte d'una universal tech com `one_time_effects: { indicator_deltas: { health: 5 } }`. El codi (`data.js:16`, `game.js:162-167`) usa `effect: { healthBonus: 2, desc: "..." }`.

**Recomanació**: Acceptable al prototip; quan es migri a JSON, seguir el schema del GDD.

#### C2-17 — `is_hidden: true` a branch techs documentat al GDD però mai aplicat al codi
**Gravetat**: Mitjana
**Tipus**: GDD↔Codi (flag no implementat). Confirmat al playtest com **S2-09**.

`branch-system.md §3.5`: `"is_hidden": false`. `content-plan-era1.md`: marca `bt_guariment_plantes` i `bt_calendari_natural` com `is_hidden: true` amb la intenció que siguin "descobriment sorpresa". El codi (`game.js:184-191`) NO filtra per `is_hidden` a `getEligibleBranchTechs()` — les techs ocultes apareixen al glossari i poden ser seleccionades per `performDiscoveryAction()` igual que qualsevol altra.

**Recomanació**: Implementar al codi `getEligibleBranchTechs()` el filtre `!bt.is_hidden`, o eliminar la propietat del schema.

---

### 3. Decisions de sessió no reflectides al GDD

#### C3-01 — Decisió de 5 universal techs als cicles 2, 4, 6, 9, 12 vs documentació antiga "3 universals als cicles 2, 5, 8"
**Gravetat**: Alta
**Tipus**: Decisió pendent. Confirmat al playtest com **S3-14**.

`content-plan-era1.md §3` ja documenta els 5 universals als cicles 2, 4, 6, 9, 12. Però el playtest report (línia 16) avisa: "El briefing i qualsevol document anterior indiquen 3 universal techs (cicles 2, 5, 8)". `_overview.md §3` no concreta cap nombre. Memory.md d'usuari no consta.

**Recomanació**: Confirmar que `content-plan-era1.md` és la font de veritat (els 5 als cicles 2, 4, 6, 9, 12). Actualitzar memory.md i qualsevol briefing antic. Afegir un changelog a `content-plan-era1.md` indicant la data del canvi (de 3 a 5).

#### C3-02 — Decisió sobre llindars d'inclinació problemàtics (intel·lecte ≤ 0.05) pendent
**Gravetat**: Alta
**Tipus**: Decisió pendent. Confirmat al playtest com **S1-03**.

El playtest demostra matemàticament que `bt_coneixement_plantes`, `bt_llavor_selectiva`, `bt_calendari_natural` (que requereixen `intel·lecte ≤ 0.05`) són inalcançables en Gen 1 si el jugador crafta 3+ vegades. També `bt_pintura_rupestre` (`espiritualitat ≥ 0.30`) és inalcançable. El playtest pregunta: ¿multi-generacional intencional o error?

**Recomanació**: Documentar la decisió al GDD. Si **multi-generacional intencional**: afegir secció a `branch-system.md` o `content-plan-era1.md` titulada "Branches multi-generacionals" llistant quines branques son de Gen 2+ per disseny, i comunicar-ho a la UI ("Aquesta tecnologia la podran aprofitar els teus hereus"). Si **error de balance**: ajustar `intel·lecte ≤ 0.05` a `≤ 0.15` o `≤ 0.20` i baixar `bt_pintura_rupestre` a `espiritualitat ≥ 0.20`.

#### C3-03 — Decisió sobre recurs secundari "Pells" pendent (proposta del GDD, no implementat)
**Gravetat**: Mitjana
**Tipus**: Decisió pendent

`content-plan-era1.md §1` proposa Pells com a recurs secundari de l'Era 1 amb `[PROPOSTA]`. El codi no l'implementa. Algunes accions del content-plan (`Cosir Pells`, `Escorxar i Preparar`, `Gravar Os i Ivori`) generen Pells segons el GDD però al codi (`data.js`) cap acció té `output_resource: "pells"` — totes usen "food", "eines" o "health".

**Recomanació**: Decidir explícitament: (A) **descartar Pells per a l'Era 1** (recomanació del playtest) — netejar `content-plan-era1.md §1` i §6 per treure totes les referències a Pells. (B) **mantenir Pells** — implementar al codi i actualitzar el glossari.

#### C3-04 — `discoveredZoneIds` persistent entre generacions — política de disseny no decidida
**Gravetat**: Mitjana
**Tipus**: Decisió pendent. Confirmat al playtest com **S3-11**.

El codi (`game.js:65`) inicialitza `discoveredZoneIds` amb {Campament, Planes}. Al `continueSuccession()`, l'estat de zones descobertes **no es reseteja** — passa a la generació següent. El GDD no especifica si les zones són "coneixement clànic" persistent o "coneixement personal" per generació.

**Recomanació**: Documentar a `era-system.md §3.5` o a `lineage-chronicle.md §3.1` la política: zones descobertes són **coneixement clànic, persistent entre generacions**. Afegir-la a la taula d'herència generacional.

#### C3-05 — `firedSingleUseEventIds` per personatge — events de descoberta es repeteixen cada generació
**Gravetat**: Mitjana
**Tipus**: Decisió pendent. Confirmat al playtest com **S3-16**.

El codi (`game.js:43`) reseteja `firedSingleUseEventIds` per personatge. Conseqüència: els events de descoberta (que son `is_single_use: true`) tornen a aparèixer cada generació, fins i tot després de descobrir la tech. El GDD `event-system.md §3.9` diu "d'un sol ús: s'exclou del pool en quant la branch tech queda descoberta" — però com que la generació següent ja té la branch tech (heretada), el filtre de `is_discovery_event` (`getEligiblePoolEvents`, game.js:248) **sí l'exclou correctament**.

**Recomanació**: El comportament actual és coherent (els events es filtren per branch tech, no per `firedSingleUseEventIds`). La variable `firedSingleUseEventIds` és essencialment redundant si tot single-use és discovery. Documentar o eliminar.

#### C3-06 — `state.materials = 0` a successió — disseny no documentat
**Gravetat**: Mitjana
**Tipus**: Decisió pendent. Confirmat al playtest com **S3-23 / S2-04**.

El codi (`game.js:528`) reseteja materials a 0 al canvi de generació. El GDD `lineage-chronicle.md §3.1` indica "Recursos: Parcial: `RESOURCE_INHERITANCE_RATE`". El prototip implementa **0%** d'herència, no `RESOURCE_INHERITANCE_RATE = 0.50` com indica `lineage-chronicle.md §7`.

**Recomanació**: Reconciliar. Opcions: (A) Aplicar `RESOURCE_INHERITANCE_RATE = 0.50` al codi tal com diu el GDD. (B) Documentar al GDD que recursos = 0 a successió (recursos = circumstància vital del personatge, no es transmeten). (C) Cosa intermèdia: heretar una fracció però avisar al jugador. El playtest recomana avisar.

#### C3-07 — `DESTRESA_MAX = 2` per personatge — limitació problemàtica no documentada
**Gravetat**: Mitjana
**Tipus**: Decisió pendent. Confirmat al playtest com **S3-17**.

El codi limita destreses a 2 per personatge. Conseqüència: si Gen 1 omple els 2 slots amb destreses base (Rastreig, Botànica), de Gen 2 endavant els slots arriben plens hereditàriament i mai es pot aprendre destreses noves de les accions de branca. El GDD no menciona cap límit. `_overview.md §3.10` diu "Destresa: Aptitud innata. Herència: Sí, íntegra". Implícitament suggereix que les destreses són un nombre fix per personatge.

**Recomanació**: Decisió de disseny. (A) Permetre acumular destreses (eliminar `DESTRESA_MAX` o pujar-lo). (B) Mantenir el límit però "buidar" slots a successió per a noves destreses. (C) Mantenir el límit i acceptar que les destreses de Gen 1 s'imprimeixen al llinatge. Documentar la decisió al GDD.

#### C3-08 — Stats al màxim a Gen 3 cicle 7 — balance no documentat
**Gravetat**: Mitjana
**Tipus**: Decisió pendent. Confirmat al playtest com **S2-21**.

El sistema d'stats no està al GDD (vegeu C2-09) i té problemes de balance.

**Recomanació**: Quan es decideixi documentar el sistema d'stats, incloure secció de balance: thresholds de creixement, decay opcional, política d'herència. Resoldre simultàniament C2-09 i C3-08.

---

### 4. Terminologia inconsistent

#### C4-01 — El recurs 🧠 té cinc noms en circulació: Saber / Provisions / Recursos / materials / eines
**Gravetat**: Alta
**Tipus**: Terminologia inconsistent. Confirmat al playtest com **S1-01**.

- `game.js:282`: `"Aprendre"` ✓ (correcte: comprar acció)
- `game.js:282`: `"−${action.purchase_cost} 🧠"` ✓ (usa el símbol)
- `game.js:268`: `"Provisions insuficients"` (fix del playtest, OK)
- `game.js:325`: `outRes === 'eines'` (camp intern dels outputs)
- `game.js:606`: render mostra `🧠 ${state.materials}` (variable interna)
- `game.js:1191`: glossari diu "Provisions (Era 1)"
- `index.html:29`: capçalera diu "Recursos"
- `content-plan-era1.md §1`: "Provisions"
- `_overview.md §3 Nivell 3`: "Recursos d'acció" (categoria genèrica)
- `data.js:171`: `output_resource: "eines"` (output type id)
- Playtest 2026-05-29 línia 22: confirma 3+ noms simultanis

**Recomanació canònica**:
- **Nom player-facing (Era 1)**: "Provisions" (català, evocador, ja consensuat)
- **Icona**: 🧠
- **Camp intern de state**: `provisions` (renomenar `state.materials`)
- **Output type id**: `provisions` (renomenar `"eines"` a `"provisions"` als output_resource — o millor, deixar genèric: `"primary"` com diu `era-system.md §3.2`)
- **Documentació**: actualitzar `index.html` ("Provisions" no "Recursos"), `_overview.md` (clarificar que el nivell 3 té noms era-específics i el de l'Era 1 és "Provisions"), `action-economy.md` (referenciar com `primary_resource`).

#### C4-02 — Aliment / Menjar — dos noms per al mateix
**Gravetat**: Mitjana
**Tipus**: Terminologia inconsistent

- `game.js:373`: log diu "Aliment"
- `game.js:1196`: glossari diu "Aliment"
- `content-plan-era1.md §1`: el "Nivell 2" (necessitats) no anomena explícitament Aliment, però `event-system.md §3.3` usa `food` com a indicador
- `_overview.md §3 Nivell 2`: "Elements com Menjar o Riquesa"
- `data.js:484`: `effects: { food: +3 }` (camp intern)

**Recomanació**: Nom canònic = **"Aliment"** (consensuat al UI). Actualitzar `_overview.md §3 Nivell 2` per fer servir "Aliment" en lloc de "Menjar". El camp intern `food` es manté (és l'identificador del Nivell 1).

#### C4-03 — `intel·lecte` amb punt volat — encoding inconsistent
**Gravetat**: Baixa
**Tipus**: Terminologia inconsistent

`_overview.md`, `branch-system.md`, GDD: usen `intel·lecte` (amb punt volat U+00B7).
`data.js:16, 39, 47, ...`: usa `"intel·lecte"` (correcte).
`game.js:16`: `AXES = [..., "intel·lecte", ...]` (correcte).
`content-plan-era1.md §2`: `intel·lecte ≤ +0.10` (correcte).

Aparentment tot consistent. Però val la pena verificar que `game.js:564` `AXIS_LABELS["intel·lecte"]` use exactament la mateixa cadena. Verificat: sí, usa el caràcter punt volat (U+00B7).

**Recomanació**: No-op. Manté la consistència però documentar a `_overview.md` que el nom canònic és `intel·lecte` (no `intel.lecte` ni `intellecte` ni `intellect`) per evitar futurs errors d'encoding.

#### C4-04 — Indicadors base: noms al codi vs noms al content-plan
**Gravetat**: Baixa
**Tipus**: Terminologia inconsistent

- `_overview.md §3 Nivell 1`: Salut / Felicitat / Seguretat / Social
- `content-plan-era1.md §1 (Indicadors base era-específics)`: Salut / Benestar / Protecció / Vincles
- Codi: només implementa `health` (Salut). Els altres tres NO existeixen al prototip.

**Recomanació**: Decisió de noms canònics. L'`era-system.md §3.2` defineix `indicator_names` era-específics, així que el GDD ja preveu noms diferents per era. Però "Felicitat → Benestar" i "Social → Vincles" és més que renoming era-específic — semblen redenominacions globals. Confirmar al `_overview.md` quins són els noms globals (defaults) i quins són era-específics. **Recomanació**: actualitzar `_overview.md §3 Nivell 1` per usar els noms del content-plan (Benestar, Protecció, Vincles), perquè son més precisos.

#### C4-05 — Branca / Habilitat / Tecnologia de Branca — tres conceptes barrejats
**Gravetat**: Mitjana
**Tipus**: Terminologia inconsistent

- `_overview.md §3`: "Tecnologies de branca: capacitats permanents"
- `branch-system.md §3.5`: "Tecnologia de Branca (Habilitat)"
- `action-economy.md §3.2`: "tecnologies de branca (habilitats)"
- Codi `game.js:206`: `addLog('Nova habilitat: ${bt.name}')` (UI: "Habilitat")
- Codi `game.js:1335`: `"Tecnologies de Branca — Habilitats"`

Els tres noms (Tecnologia de Branca, Habilitat, branch tech) son intercanviables al GDD i al codi, però el jugador només veu "Habilitat" a la UI. El glossari combina els dos termes.

**Recomanació**: Adoptar la convenció: **player-facing = "Habilitat"**, **GDD/code = "Tecnologia de Branca (branch tech)"**. Documentar-ho a `_overview.md` com a nota: "El terme tècnic és Tecnologia de Branca; la UI usa Habilitat per simplicitat".

#### C4-06 — "Tribus", "Clan", "Grup", "Llinatge" — vocabulari narratiu inconsistent
**Gravetat**: Baixa
**Tipus**: Terminologia inconsistent

`content-plan-era1.md`: "grups veïns", "tribus veïnes", "clan", "llinatge", "grup", "tribu" — barrejats sense criteri.

**Recomanació**: Decidir convenció narrativa. Recomanació: **llinatge** per al subjecte del jugador (el grup propi és el llinatge); **clan** o **grup** per a altres grups; evitar "tribu" (potencialment problemàtic culturalment al Paleolític). Documentar al `content-plan-era1.md`.

---

### 5. Fórmules o constants que no coincideixen

#### C5-01 — `LIFE_EXPECTANCY = 14` al codi vs `life_expectancy.base_cycles: 12` al GDD
**Gravetat**: Mitjana
**Tipus**: Fórmula/constant incorrecta

- `game.js:12`: `LIFE_EXPECTANCY = 14`
- `content-plan-era1.md §1`: `life_expectancy.base_cycles = 12`, `max_cycles = 18`
- `era-system.md §3.2`: defineix els dos camps separats

El prototip usa un únic valor (14) que cau entre base i max. No té el concepte de "viure més enllà de base_cycles si indicadors òptims".

**Recomanació**: Decisió. (A) Implementar el sistema base/max amb risc d'envelliment accelerat sota base_cycles. (B) Simplificar al GDD a un únic `life_expectancy` per era; eliminar `max_cycles`. Documentar la decisió a `era-system.md`.

#### C5-02 — `INERTIA_FACTOR = 2.0` — consistent ✓
**Gravetat**: —
**Tipus**: OK

Codi (`game.js:8`) i GDD (`branch-system.md §7`) coincideixen.

#### C5-03 — `BRANCH_INHERITANCE_RATE = 0.65` — consistent ✓
**Gravetat**: —
**Tipus**: OK

Codi (`game.js:9`) i GDD (`_overview.md §7`, `branch-system.md §7`) coincideixen.

#### C5-04 — `FADE_MARGIN = 0.05` al codi vs `FADE_MARGIN = 0.10` al GDD
**Gravetat**: Baixa
**Tipus**: Constant incorrecta

- `game.js:10`: `FADE_MARGIN = 0.05`
- `branch-system.md §7`: default `0.10`

**Recomanació**: Decidir el valor canònic. Si 0.05 és el resultat del playtest, actualitzar el GDD. Si 0.10 és el target, actualitzar el codi.

#### C5-05 — `EVENT_BASE_TRIGGER_CHANCE = 0.35` al GDD — codi no usa cap global, només per-event probability
**Gravetat**: Baixa
**Tipus**: Fórmula no implementada

`_overview.md §7` defineix `EVENT_BASE_TRIGGER_CHANCE = 0.35`. El codi (`game.js:407-412`) **sempre** dispara un event si el pool té events elegibles, sense aplicar cap probabilitat global. El GDD parla d'una probabilitat per acció (`trigger.base_probability`); el prototip ho ignora completament.

**Recomanació**: Decisió. (A) Implementar al codi `if (Math.random() < EVENT_BASE_TRIGGER_CHANCE)` abans de seleccionar event. (B) Simplificar el GDD: events sempre disparen si el pool té elegibles, eliminar `EVENT_BASE_TRIGGER_CHANCE`. **Recomanació**: opció A per donar més espai a accions sense event.

#### C5-06 — `EVENT_CHAIN_DECAY = 0.50` — no implementat al codi
**Gravetat**: Baixa
**Tipus**: Fórmula no implementada

Vegeu C2-06: events encadenats absents del prototip.

#### C5-07 — `STARTING_FOOD = 15`, `STARTING_HEALTH = 20`, `HEALTH_MAX = 20` — no consten al GDD
**Gravetat**: Mitjana
**Tipus**: Constants no documentades

Codi (`game.js:14, 19, 20`). GDD `era-system.md §3.2` defineix `starting_conditions` però amb valors molt diferents (health: 80, happiness: 60). El prototip usa escala 0-20 per a salut, no 0-100.

**Recomanació**: Decidir l'escala. (A) Mantenir escala 0-20 al prototip i actualitzar GDD per dir "indicadors 0-20" (no 0-100). (B) Migrar el prototip a 0-100 per coherència amb el GDD. **Recomanació A** (simpler).

#### C5-08 — Stats: `STAT_MAX = 5.0`, `STAT_OUTPUT_FACTOR = 0.15`, `STAT_STARTING_VALUE = 1.0`, `DESTRESA_THRESHOLD = 5`, `DESTRESA_MAX = 2`, `DESTRESA_BONUS = 1` — no consten al GDD
**Gravetat**: Alta
**Tipus**: Constants no documentades

Vegeu C2-09. Tot el sistema d'stats no està al GDD.

**Recomanació**: Quan es creï `character-stats.md`, incloure totes aquestes constants als tuning knobs.

#### C5-09 — Algoritme de maduresa té biaix matemàtic
**Gravetat**: Mitjana
**Tipus**: Fórmula incorrecta. Confirmat al playtest com **S2-02**.

`branch-system.md §4 (Maduresa)`:
```
score = 0
per cada condició c en tech.inclination_conditions.conditions:
    val = inclinació[c.axis]
    si c.min definit: score += max(0, val − c.min)
    si c.max definit: score += max(0, c.max − val)
```

El codi (`game.js:194-201`) implementa exactament aquesta fórmula. Però la fórmula té un biaix sistemàtic: una condició `max: 0.05` amb val=0.0 puntua 0.05; una condició `min: 0.25` amb val=0.26 puntua 0.01. Les techs amb condicions `max` sempre puntuen més.

**Recomanació**: Reformular la fórmula al GDD perquè sigui equitativa. Possibilitats:
- **Normalitzar pel rang**: `score = max(0, val − c.min) / (1 - c.min)` per a `min`.
- **Usar distància negativa al llindar**: `score = max(0, val − c.min)` per a `min`, `score = max(0, c.max − val)` per a `max`, normalitzant ambdós al mateix rang [0,1].
- **Eliminar l'auto-selecció** i deixar que el jugador trii (vegeu C2-15).

#### C5-10 — `getEligibleBranchTechs()` filtra `!bt.is_hidden` al codi, però al GDD `branch-system.md §3.5.1` diu el contrari
**Gravetat**: Mitjana
**Tipus**: Fórmula incorrecta. Confirmat al playtest com **S2-09**.

`branch-system.md §3.5.1 Via 1` diu: "S'avaluen totes les branch techs elegibles". No exclou les ocultes — el seu propòsit és precisament que les ocultes s'amaguen al jugador, no que no es puguin descobrir per `performDiscoveryAction()`.

Però `branch-system.md §3.5.1 Via 2` (Event de descoberta) sembla suggerir que les ocultes es descobreixin **només via event**. El text no és explícit.

**Recomanació**: Aclarir al GDD: les `is_hidden: true` branch techs **NO** son visibles ni descobribles via discovery action; només via discovery event. Si això és la intenció, afegir al codi `.filter(bt => !bt.is_hidden)` (S2-09 fix).

---

### 6. Funcionalitat dissenyada però absent al prototip

Resum dels grans absents (ja detallats a §2):

| ID | Sistema absent | Document GDD origen | Gravetat |
|---|---|---|---|
| C6-01 | Era system: cadena d'eres, connectors, transicions | `era-system.md` | Alta |
| C6-02 | Score d'era i de partida | `scoring-system.md` | Alta |
| C6-03 | Títols de dinastia | `scoring-system.md §3.2`, `content-plan-era1.md §9` | Mitjana |
| C6-04 | Reputació dinàstica | `scoring-system.md §3.5` | Mitjana |
| C6-05 | Crònica del llinatge | `lineage-chronicle.md` | Alta |
| C6-06 | Plantilles de crònica | `lineage-chronicle.md §3.4` | Mitjana |
| C6-07 | Genealogia visual | `lineage-chronicle.md §3.6` | Mitjana |
| C6-08 | Sistema de badges | `badge-system.md` | Mitjana |
| C6-09 | Events de pressió del món | `era-system.md §3.6`, `content-plan-era1.md §8` | Alta |
| C6-10 | Events encadenats | `event-system.md §3.5` | Mitjana |
| C6-11 | Events rars (`is_rare: true`) | `event-system.md §3.7` | Mitjana |
| C6-12 | Localització i18n (ca/es/en) | `tech-architecture.md §3.9` | Mitjana |
| C6-13 | Sistema d'àudio amb senyals | `tech-architecture.md §3.10` | Baixa |
| C6-14 | Save system | `tech-architecture.md §3.6` | Baixa |
| C6-15 | Validació de dades en arrencar | `tech-architecture.md §3.8` | Mitjana |
| C6-16 | Característiques (innates + atzar) | `_overview.md §3.10`, `lineage-chronicle.md §4` | Mitjana |
| C6-17 | Aprenentatges (knowledge_ids) | `_overview.md §3.10`, `lineage-chronicle.md §3.3` | Mitjana |
| C6-18 | Pells (recurs secundari) | `content-plan-era1.md §1` | Mitjana |
| C6-19 | Característiques d'event: `narrative_tag`, `is_skippable`, `option.requirement` | `event-system.md §3.3` | Mitjana |
| C6-20 | Schema JSON de dades (tot data-driven) | `tech-architecture.md §3.3` | Alta (per producció) |

**Recomanació general**: Crear un document `production/prototype-scope.md` que enumeri quins sistemes del GDD són **dins** del MVP del prototip i quins són **post-prototip**. Sense això, qualsevol revisió del codi en relació al GDD genera centenars d'issues "absents".

---

### 7. Funcionalitat present però no dissenyada (al codi però no al GDD)

#### C7-01 — Sistema d'stats (Força/Enginy/Vincle)
**Gravetat**: Alta
**Tipus**: Funcionalitat present però no dissenyada

Vegeu C2-09. Aquest és l'absent més gran al GDD.

#### C7-02 — Sistema de destreses per ús repetit (`actionUseCounts`, `destresa_threshold`, `DESTRESA_BONUS`)
**Gravetat**: Mitjana
**Tipus**: Funcionalitat present però no dissenyada

Vegeu C2-10. El sistema del codi és diferent del que diu el GDD.

#### C7-03 — Sistema de família (`act_cercar_parella`, `act_tenir_fills`, `hasPartner`)
**Gravetat**: Mitjana
**Tipus**: Funcionalitat present però no dissenyada

El GDD `lineage-chronicle.md §3` parla d'herència de pare a fill però **no documenta cap mecànica explícita de "buscar parella + tenir fills"**. El codi té dues accions específiques (`act_cercar_parella`, `act_tenir_fills`) amb lògica especial (`hasPartner`, `MAX_CHILDREN`, `pendingSuccession`). Sense parella, no hi ha successió possible — és una mecànica completament nova respecte al GDD.

**Recomanació**: Documentar al `lineage-chronicle.md` el sistema de família: acció de buscar parella, condicions, conseqüències si no es busca. O eliminar del prototip i implementar successió automàtica com diu el GDD.

#### C7-04 — Sistema de "germans" (`siblingPool`) — fills no escollits passen a la generació següent
**Gravetat**: Mitjana
**Tipus**: Funcionalitat present però no dissenyada

`continueSuccession()` (`game.js:516-525`) implementa una mecànica on els fills no escollits queden al `siblingPool` per a successions futures. El GDD `_overview.md §5` diu: "Múltiples fills vius: el jugador tria quina branca del llinatge és l'activa. Les altres continuen com a 'branca latent' de l'arbre genealògic". El concepte de "branca latent" no està desenvolupat enlloc més. El codi ho implementa però sense l'arbre genealògic visual.

**Recomanació**: Decisió. Si el sistema de germans és intencional, expandir a `lineage-chronicle.md` la mecànica completa: ¿els germans tenen edat? ¿poden morir abans de ser elegits? ¿quants es poden acumular? Si és simplificació de prototip, marcar al README del prototip.

#### C7-05 — Upgrades d'acció (`is_upgrade`, `upgrades_action_id`)
**Gravetat**: Baixa
**Tipus**: Funcionalitat present, parcialment dissenyada

`action-economy.md §3.4` defineix `upgrade_to`, `upgrade_cost`, `upgrade_condition`. El codi implementa `is_upgrade` + `upgrades_action_id` (estructura inversa). Funcionalment equivalent però estructura JSON diferent.

**Recomanació**: Quan es migri a JSON, seguir el schema del GDD (`upgrade_to` com a referència forward).

#### C7-06 — `unlocks_zone` com a propietat d'acció
**Gravetat**: Baixa
**Tipus**: Funcionalitat present, dissenyada parcialment

El codi (`data.js:199`) usa `unlocks_zone: "Bosc"` directament a l'acció `act_explorar_voltants`. El GDD `era-system.md §3.5` defineix `discovery_condition.type = "action"` amb `requires_action_id` com el mecanisme correcte (la zona declara qui la desbloqueja, no l'acció).

**Recomanació**: Migrar a la convenció del GDD quan es passi a JSON.

#### C7-07 — Onboarding panel + localStorage (`lt2_skip_onboarding`)
**Gravetat**: Baixa
**Tipus**: Funcionalitat present, no al GDD

El codi té un onboarding panel (`game.js:74, 78-82, 798-800`) amb persistència de "skip" a localStorage. Cap GDD ho documenta. Pot ser scoped al prototip.

**Recomanació**: Marcar al README del prototip.

#### C7-08 — `discovery-notification` (text daurat)
**Gravetat**: Baixa
**Tipus**: Funcionalitat present, parcialment al GDD

`branch-system.md §3.5.1` menciona una notificació "narrativa era-específica" per a la discovery action. El codi ho implementa amb un text fix ("Hi ha estrangers al poblat que expliquen tècniques noves"). Quan es generalitzi a múltiples eres, caldrà passar a contingut data-driven.

---

### 8. Preguntes de disseny obertes sense resposta

| ID | Pregunta | Origen |
|---|---|---|
| Q1 | ¿Quines branches són intencionalment multi-generacionals al GDD? | Playtest S1-03 |
| Q2 | ¿El prototip ha d'implementar el sistema de score d'era abans de passar a producció? | Prototip ha desplaçat aquesta tasca |
| Q3 | ¿Pells és recurs de l'Era 1 o no? Decidir-ho ara per no haver de re-dissenyar accions | content-plan-era1.md §1 marca [PROPOSTA] |
| Q4 | ¿`MAX_GENERATIONS = 5` és regla de joc o límit de prototip? | game.js vs GDD |
| Q5 | ¿Stats al codi (Força/Enginy/Vincle) reemplacen Destreses+Característiques del GDD, o son addicionals? | C2-09 |
| Q6 | ¿La mecànica de família (parella → fills) entra al GDD? | C7-03 |
| Q7 | ¿Els upgrades són estrictament millors (com avui) o tenen trade-off? | Playtest S3-18 |
| Q8 | ¿Quan es virà de branca, l'acció antiga es manté comprable per sempre o pot tornar a aprendre's? | branch-system.md §3.6 diu permanent però no diu si es "reaprèn" si oblides |
| Q9 | ¿La discovery action permet escollir manualment o auto-seleccionar per maduresa? | C2-15 |
| Q10 | ¿`is_hidden` branch techs es descobreixen via discovery action o només via events? | C5-10 |
| Q11 | ¿`event_block` (passive effect) s'implementa? Si sí, sobre quins events? | S3-12 |
| Q12 | Quina és l'escala dels indicadors: 0-20 (codi) o 0-100 (GDD)? | C5-07 |
| Q13 | ¿Reputació dinàstica entra al MVP del prototip? | C6-04 |
| Q14 | ¿Els 4 eixos d'inclinació mantenen els seus noms tant a Era 1 com a Era 2+, o son era-específics? | branch-system.md §3.1 diu globals, però content-plan podria voler renoms narratius |
| Q15 | ¿Stats es reseteja a la successió o es manté? Quant es transmet? | C3-08 |

---

### 9. Risc per al loop de jugabilitat

#### R1 — Jugador nou no pot accedir al 30% de les branch techs en Gen 1 sense saber-ho
**Gravetat**: Alta
**Vegeu**: S1-03, C3-02

`bt_coneixement_plantes`, `bt_llavor_selectiva`, `bt_calendari_natural`, `bt_pintura_rupestre` (4 de 13) són inalcançables per acció deliberada en Gen 1. El jugador prova, no veu progrés, no sap si ha de canviar d'estratègia o esperar la generació següent. **Erosiona la sensació de control i la causalitat de les decisions** — pilar fonamental del gènere tycoon.

#### R2 — Inconsistència de noms (Saber/Provisions/🧠) confon el jugador
**Gravetat**: Alta
**Vegeu**: S1-01, C4-01

Tres noms per al mateix recurs. Especialment greu si el jugador veu "Saber insuficient" en un context i "+3 Provisions" en un altre — pensa que són dos recursos diferents.

#### R3 — Branch tech "ocultes" (`is_hidden: true`) apareixen al glossari, eliminant la sorpresa
**Gravetat**: Mitjana
**Vegeu**: S2-09, C2-17

El playtest report indica que `is_hidden: true` no es filtra. Si la idea és el "descobriment sorpresa" del `bt_calendari_natural` i `bt_guariment_plantes`, aquesta intenció no s'aplica. El jugador veu les llistes completes al glossari.

#### R4 — Doble aplicació de passive effects (S1-02) trenca la integritat del balance
**Gravetat**: Alta
**Vegeu**: S1-02

Si un jugador desbloqueja simultàniament una branch tech via discovery action + event de descoberta (cas raris però possible), els efectes passius s'apliquen el doble. Trenca l'equilibri d'una mecànica clau.

#### R5 — Materials = 0 a successió sorprèn el jugador (perd recursos no gastats)
**Gravetat**: Mitjana
**Vegeu**: S2-04, C3-06

Si el jugador acumula 20🧠 i no compra accions abans de morir, els perd. Sense avís previ, és una traïció d'expectatives.

#### R6 — Místic estructuralment de Gen 2+ però no comunicat → percepció de "branca trencada"
**Gravetat**: Alta
**Vegeu**: S2-19, S2-23, R1

Un jugador que prova el rol Místic en Gen 1 no veu cap recompensa de branca pròpia (les úniques branch techs accessibles via inclinació son `bt_guariment_plantes` i `bt_pintura_rupestre`, totes dues amb llindars `espiritualitat ≥ 0.25-0.30` inalcançables en 14 cicles). Sensació de "el joc està roto".

#### R7 — Accions dominants (`act_emboscada_nocturna`, `act_seleccionar_llavors`) col·lapsen l'espai de decisió
**Gravetat**: Mitjana
**Vegeu**: S2-22

Un cop aconsegueixes una d'aquestes accions, no tornes a usar res més per Aliment. Vivim ja al pic — la fantasia de "descoberta constant" del GDD `_overview.md §2` queda buida.

#### R8 — `act_curar_herbes` permet immortalitat → trenca la pressió de successió
**Gravetat**: Alta
**Vegeu**: S2-24

Si un personatge Místic pot mantenir la salut indefinidament, la mecànica de successió generacional (pilar central del joc) deixa de ser pressió. Soluciona amb el ràpid fix del playtest (cap output max 2).

---

## Taula de prioritats

| ID | Gravetat | Tipus | Descripció curta | Acció recomanada |
|---|---|---|---|---|
| C4-01 | Alta | Terminologia | 🧠 té 5 noms simultanis | Fixar "Provisions" + actualitzar UI, codi, GDD |
| C3-02 | Alta | Decisió pendent | Llindars `intel·lecte ≤ 0.05` inalcançables | Documentar multi-gen al GDD o ajustar llindars |
| C2-09 | Alta | Codi sense disseny | Stats (Força/Enginy/Vincle) no al GDD | Crear `character-stats.md` o eliminar del codi |
| C2-01 | Alta | GDD sense codi | Era-system absent al prototip | Crear `prototype-scope.md` clarificant scope |
| C2-02 | Alta | GDD sense codi | Score d'era absent al prototip | Igual que C2-01 |
| C2-03 | Alta | GDD sense codi | Crònica absent al prototip | Igual que C2-01 |
| C2-05 | Alta | GDD sense codi | Events de pressió del món absents | Igual que C2-01; netejar `event_block` referencies |
| R8 | Alta | Risc gameplay | `act_curar_herbes` permet immortalitat | Aplicar fix de playtest (output max 2) |
| R6 | Alta | Risc gameplay | Místic estructuralment Gen 2+ | Decisió C3-02 |
| C5-09 | Mitjana | Fórmula | Biaix de la fórmula de maduresa | Reformular GDD o eliminar auto-select |
| C2-15 | Mitjana | GDD↔Codi | Discovery action: auto vs manual | Decidir i alinear |
| C2-17 | Mitjana | Flag no implementat | `is_hidden` no filtrat al codi | Fix playtest S2-09 |
| C3-01 | Alta | Decisió pendent | 5 universal techs vs 3 antics | Confirmar i actualitzar memory/briefings |
| C3-03 | Mitjana | Decisió pendent | Pells: mantenir o eliminar? | Decisió + neteja del content-plan |
| C2-10 | Mitjana | GDD↔Codi | Destreses: apreses vs innates | Decidir i alinear |
| C2-12 | Mitjana | Codi sense GDD | FOOD_UPKEEP, HEALTH_UPKEEP no documentats | Afegir a `_overview.md` o `action-economy.md` |
| C2-13 | Mitjana | Codi sense GDD | `MAX_GENERATIONS = 5` no al GDD | Documentar al README del prototip |
| C3-04 | Mitjana | Decisió pendent | Zones persisteixen entre gens? | Documentar com a coneixement clànic |
| C3-06 | Mitjana | Decisió pendent | materials=0 a successió | Decidir herència parcial vs zero |
| C3-07 | Mitjana | Decisió pendent | `DESTRESA_MAX = 2` problemàtic | Decisió de disseny i documentar |
| C4-04 | Mitjana | Terminologia | Indicadors: Felicitat vs Benestar | Decidir noms canònics |
| C4-05 | Mitjana | Terminologia | Tecnologia de Branca vs Habilitat | Fixar convenció |
| C5-01 | Mitjana | Constants | LIFE_EXPECTANCY=14 vs base/max GDD | Decidir model | 
| C5-05 | Baixa | Fórmula no implementada | `EVENT_BASE_TRIGGER_CHANCE` no aplicat | Decidir si implementar |
| C5-07 | Mitjana | Escala | Indicadors 0-20 vs 0-100 | Decidir escala canònica |
| C7-03 | Mitjana | Codi sense disseny | Sistema família no documentat | Afegir a `lineage-chronicle.md` |
| C7-04 | Mitjana | Codi sense disseny | `siblingPool` no documentat | Afegir a `lineage-chronicle.md` |
| C1-01 | Mitjana | GDD↔GDD | Stats no a taula d'herència | Coordinat amb C2-09 |
| C1-02 | Baixa | GDD↔GDD | Knobs orfes a `_overview.md` | Netejar |
| C5-04 | Baixa | Constants | `FADE_MARGIN` 0.05 vs 0.10 | Decidir |
| C4-02 | Baixa | Terminologia | Aliment vs Menjar | Fixar "Aliment" |
| C4-06 | Baixa | Terminologia | Tribu/Clan/Grup/Llinatge | Fixar convenció narrativa |

---

## Recomanacions de pròxims passos

1. **Fixar terminologia canònica del recurs 🧠 abans de res** (C4-01, S1-01). És el bug més visible per al jugador i toca 4 fitxers (codi, HTML, GDD, glossari). 30 minuts de feina, gran impacte de coherència.

2. **Crear `production/prototype-scope.md`** que llisti explícitament quins sistemes del GDD són **dins** del MVP del prototip i quins son **post-prototip**. Sense això, qualsevol revisió genera centenars de falsos positius "absents". Aquest doc ha de cobrir: era-system, score, crònica, badges, events de pressió, i18n, save, característiques, aprenentatges.

3. **Decisió crítica de balance: branques multi-generacionals** (C3-02, R1, R6). Reunir-se i decidir per a cada branch tech inalcançable en Gen 1 si és intencional (multi-gen) o error. Per a les multi-gen, documentar al GDD i comunicar-ho a la UI ("Aquesta tecnologia la podran aprofitar els teus hereus"). Per a les error, ajustar llindars. Recomanació concreta:
   - `bt_pintura_rupestre`: baixar a `espiritualitat ≥ 0.20`
   - `bt_coneixement_plantes`, `bt_llavor_selectiva`, `bt_calendari_natural`: pujar `intel·lecte ≤ 0.05` a `≤ 0.15`
   - Documentar que `ut_recollida_sistematica` (cicle 9) i `ut_conreu_incipient` (cicle 12) són intencionalment de Gen 2

4. **Documentar o eliminar el sistema d'stats** (C2-09, C7-01). Crear `design/gdd/life-tycoon-2/character-stats.md` o decidir que els stats no formen part del joc i eliminar-los del prototip. Aquesta decisió afecta C1-01 i C3-08 simultàniament.

5. **Aplicar els fixes immediats del playtest** (1-5 línies de codi cadascun):
   - S2-01 (zone_id mismatch — bloqueja zona Ritual)
   - S1-02 (doble passive effect — afegir guard d'idempotència a `unlockBranchTech`)
   - S2-04 (avís de materials a successió)
   - S2-09 (filtre `is_hidden` a `getEligibleBranchTechs`)
   - S2-22 (cap a `act_emboscada_nocturna` output_max=11, `act_seleccionar_llavors` execute_cost=1)
   - S2-24 (`act_curar_herbes` output max=2)

6. **Decidir la mecànica de descoberta de branch techs** (C2-15, C5-09). Decisió binària: ¿discovery action selecciona automàticament per maduresa (corregir la fórmula) o el jugador escull (eliminar la fórmula)? Recomanació: el jugador escull — més control, més comprensible, i el codi ja ho permet parcialment.

7. **Reconciliar família + germans amb el GDD** (C7-03, C7-04). El sistema de buscar parella + tenir fills + germans és bo per al gameplay però no està documentat. Afegir-ho a `lineage-chronicle.md` com a §3.7 (Mecànica de Família).

8. **Decidir Pells** (C3-03). Recomanació: descartar Pells per a l'Era 1 (un sol recurs simplifica). Netejar `content-plan-era1.md`.

9. **Actualitzar memory.md de l'usuari**: el `MEMORY.md` cita "Era 1 detallat" i estat del prototip. Considerar afegir nota: "Coherence review 2026-05-29: 32 issues identificats, blocants pendents són C3-02 i C4-01".

10. **Programar una sessió de polish documental** un cop preses les decisions claves (3, 4, 6, 7, 8). Actualitzar GDD per reflectir les decisions, fixar terminologia, corregir numeració (`event-system.md`), eliminar knobs orfes. 2-3 hores de feina.

---

## Notes finals

- **Punts forts**: El GDD és **excepcionalment complet** per a un projecte indie en aquesta fase. La separació de sistemes és neta, les fórmules estan ben definides, els casos extrems es consideren. El `content-plan-era1.md` mostra recerca seriosa.

- **Punts febles**: La distància entre GDD (ambició) i prototip (realitat) no està documentada enlloc. Si demà s'incorpora un programador nou al projecte, llegirà el GDD i pensarà que el codi és incomplet, quan és intencional. Aquesta és la fallada més comuna en projectes indie i és corregible amb el `prototype-scope.md` recomanat.

- **Risc principal**: Sense decidir Q1 (multi-gen intencional?) i Q5 (stats al joc?), no es pot fer balance del prototip. El joc actual pot arribar a estar bé per als jugadors "optimitzadors" però es trenca per als jugadors "exploradors" que no saben per què algunes branques no funcionen.
