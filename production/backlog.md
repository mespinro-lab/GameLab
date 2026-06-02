# Production Backlog — Life Tycoon 2

<!-- GESTIONAT per /drive i /feedback-loop. Editable a mà; mantén el format de capçalera de tasca. -->
<!--                                                                                                  -->
<!-- FORMAT DE CAPÇALERA: ## [PRIOR] [ESTAT] [TIPUS] — [ID] — Títol                                 -->
<!--   PRIOR: P0 (aquesta sessió) | P1 (propera sessió) | P2 (pròximament) | P3 (backlog llunyà)     -->
<!--   ESTAT: OPEN | IN-PROGRESS | DONE | BLOCKED | DEFERRED                                         -->
<!--   TIPUS: BUG | FEAT | BALANCE | CONTENT | DESIGN | QA | DOCS                                    -->
<!--                                                                                                  -->
<!-- CAMPS PER TASCA:                                                                                 -->
<!--   **Agent**: agent que ha d'executar-la (gameplay-programmer, ui-programmer, etc.)               -->
<!--   **File**: fitxer(s) a modificar                                                               -->
<!--   **Source**: referència a l'informe d'origen                                                   -->
<!--   **Fix**: instrucció específica de reparació (per a bugs) o descripció (per a feats)           -->
<!--   **Acceptance**: criteri de finalització verificable                                            -->
<!--   **Decision**: (pendent) → /drive s'atura i demana a l'usuari. Omplir per desbloquejar.        -->
<!--   **Options**: llista d'opcions quan Decision és pendent (A/B/C...)                              -->

---

## P0 DONE BUG — S1-02 — Passive effect doble a unlockBranchTech (guard idempotència)

- **Agent**: gameplay-programmer
- **File**: `prototypes/bloodline/game.js:194`
- **Source**: `production/playtests/2026-05-29b-full.md#S1-02`
- **Fix**: Afegir early-return al principi de `unlockBranchTech()`: `if (state.character.unlockedBranchTechIds.has(bt.id)) return;`
- **Acceptance**: Desbloquejar una branch tech via acció + event al mateix cicle aplica el passive_effect exactament una vegada.
- **Completada**: 2026-06-01 — Ja resolta pel commit fcaddc5 (refactor branchTechs→skills). unlockSkill() té el guard a la línia 199.

---

## P0 DONE BUG — S1-01 — Naming "Provisions"/"Saber" inconsistent en tres llocs

- **Agent**: gameplay-programmer
- **File**: `prototypes/bloodline/game.js:254`
- **Source**: `production/playtests/2026-05-29b-full.md#S1-01`
- **Fix**: Canviar `game.js:254` de `"Saber insuficient"` → `"Provisions insuficients"`. Verificar que tots els literals de recurs 🧠 al game.js usen "Provisions" (grep "Saber").
- **Acceptance**: Grep de "Saber" a game.js retorna 0 resultats. El log sempre mostra "Provisions".
- **Completada**: 2026-06-01 — Ja resolta en commits posteriors al playtest. grep "Saber" = 0 resultats. game.js:319 usa "Provisions insuficients".

---

## P0 DONE BALANCE — S1-03 — Branch techs estructuralment inalcançables en Gen 1

- **Agent**: economy-designer
- **File**: `prototypes/bloodline/data.js`, `design/gdd/bloodline/content-plan-era1.md`
- **Source**: `production/playtests/2026-05-29b-full.md#S1-03`
- **Fix**: Afegir a data.js una nova acció base a zona Campament: `id: "act_contemplacio"`, `name: "Contemplació"`, `is_base: true`, side_effect `espiritualitat: +0.05`. Sense prerequisits de skill ni universal tech. Coût d'Aliment baix (1). Documentar a content-plan-era1.md que bt_pintura_rupestre requereix ~6 usos d'act_contemplacio per arribar a espiritualitat ≥ 0.30.
- **Acceptance**: Simulació de 14 cicles amb act_contemplacio disponible des del cicle 0: espiritualitat pot arribar a ≥ 0.30 en Gen 1 dedicant ~6 cicles. bt_pintura_rupestre assequible sense modificar thresholds.
- **Decision**: B — Nova acció base espiritualitat +0.05, accessible des del principi. Thresholds sense canviar.
- **Completada**: 2026-06-01 — data.js afegida act_contemplacio (Campament, is_base, espiritualitat +0.05, cost 1 Aliment, output 0-1). ~8-10 cicles per arribar a 0.30 en Gen 1.

---

## P0 DONE BUG — REG-01 — getEligibleSkills() paràmetre `bt` vs `skill` — ReferenceError cada cicle

- **Agent**: gameplay-programmer
- **File**: `prototypes/bloodline/game.js:180`
- **Source**: Detectat durant audit /drive 2026-06-01 (regressió de commit fcaddc5)
- **Fix**: Canviar el paràmetre del filter de `bt` → `skill` a la línia 180: `return SKILL_DEFS.filter(skill =>`
- **Acceptance**: `getEligibleSkills()` s'executa sense ReferenceError. La discovery-notification apareix correctament quan hi ha skills elegibles.
- **Completada**: 2026-06-01 — game.js:180 `filter(bt =>` → `filter(skill =>`. 1 paraula canviada.

---

## P1 DONE BUG — S2-01 — Zona Ritual inaccessible (zone_id mismatch data.js vs game.js)

- **Agent**: gameplay-programmer
- **File**: `prototypes/bloodline/data.js:89`
- **Source**: `production/playtests/2026-05-29b-full.md#S2-01`
- **Fix**: `data.js:89` — canviar `zone_id: "zone_ritual"` → `zone_id: "Ritual"`.
- **Acceptance**: Desbloquejar bt_pintura_rupestre fa aparèixer la targeta "Ritual" a la graella de zones.
- **Completada**: 2026-06-01 — data.js:242 ja usa `unlocks_zone: "Ritual"`. ZONE_DEFS usa id "Ritual". Fix aplicat en commit anterior.

---

## P1 DONE BUG — S2-02 — getBranchTechMaturity selecciona tech incorrecta amb múltiples elegibles

- **Agent**: gameplay-programmer
- **File**: `prototypes/bloodline/game.js:184`
- **Source**: `production/playtests/2026-05-29b-full.md#S2-02`
- **Fix**: A `getSkillMaturity()`: sumar NOMÉS l'excés sobre condicions `min` (`val - min` quan val > min); condicions `max` puntuen 0. A `performDiscoveryAction()`: quan múltiples techs empaten al score màxim, triar-ne una aleatòriament.
- **Acceptance**: Una tech amb condicions `min` on el jugador ha invertit molt puntua més que una tech que es qualifica per defecte via `max` baix. Empats es trenquen aleatòriament.
- **Decision**: Custom — màxim excés sobre condicions min; empat aleatori.
- **Completada**: 2026-06-01 — getSkillMaturity elimina scoring de max conditions. performDiscoveryAction usa max+random-sample. Fix secundari skill.id→bt.id.

---

## P1 DONE DESIGN — DEST-01 — Redisseny sistema de destreses: condicions multi-acció

- **Agent**: game-designer
- **File**: `design/gdd/bloodline/content-plan-era1.md`, `prototypes/bloodline/data.js`, `prototypes/bloodline/game.js`
- **Source**: S2-06 — revelat durant sessió 2026-06-01
- **Fix**: (1) Definir condicions d'inclinació/stat per a cada destresa a data.js (substituir destresa_id/destresa_threshold per DESTRESA_DEFS amb inclination_conditions i stat_conditions). (2) A game.js: eliminar actionUseCounts per destreses; afegir checkDestresesAfterAction() que avalua condicions igual que getEligibleSkills(), descobreix automàticament les complides. (3) Herència a successió: es manté (destreses ja persisteixen com a Set).
- **Acceptance**: Destreses es descobreixen sense comptadors d'usos. Diverses accions que elevin els eixos correctes contribueixen igualment. El sistema s'integra amb el renderProfile de destreses existent.
- **Decision**: A — Destreses com a branch techs, condicions d'inclinació/stats, descoberta automàtica.
- **Completada**: 2026-06-01 — DESTRESA_DEFS a data.js (5 entrades). checkDestresesAfterAction() a game.js. Eliminat actionUseCounts. UI de progrés usa proximitat d'inclinació (%). Glossari actualitzat.

---

## P1 DONE BUG — S2-05 — randInt() comportament indefinit si min > max

- **Agent**: gameplay-programmer
- **File**: `prototypes/bloodline/game.js:512`
- **Source**: `production/playtests/2026-05-29b-full.md#S2-05`
- **Fix**: Afegir guard al principi de `randInt`: `if (min > max) return min;`
- **Acceptance**: `randInt(5, 3)` retorna 5 (no NaN ni valor negatiu).
- **Completada**: 2026-06-01 — game.js:630 ja té `if (min > max) return min;`. Fix aplicat en commit anterior.

---

## P1 DEFERRED BUG — S2-06 — Comprar upgrade elimina progrés destresa de l'acció base

- **Agent**: gameplay-programmer
- **File**: `prototypes/bloodline/game.js` (lògica compra upgrade)
- **Source**: `production/playtests/2026-05-29b-full.md#S2-06`
- **Fix**: (pendent decisió — veure Decision)
- **Acceptance**: Comprar un upgrade no fa perdre el progrés de destresa de l'acció base.
- **Decision**: (pendent)
- **Options**:
  - A) Transferir recompte: `actionUseCounts[base_id]` → `actionUseCounts[upgrade_id]` en comprar — el progrés continua amb l'upgrade
  - B) Concedir destresa immediatament si progrés ≥ DESTRESA_THRESHOLD-1 en el moment de compra — premia l'usuari que estava a punt
  - C) Les destreses s'obtenen per l'acció base i es conserven independentment — l'upgrade no les substitueix ni les bloqueja

---

## P1 DONE BUG — S2-07 — Modal successió crash si successor.inheritedInclination és undefined

- **Agent**: gameplay-programmer
- **File**: `prototypes/bloodline/game.js:1096`
- **Source**: `production/playtests/2026-05-29b-full.md#S2-07`
- **Fix**: Substituir `successor.inheritedInclination[a]` → `(successor.inheritedInclination ?? {})[a] ?? 0` al reduce.
- **Acceptance**: Crear un objecte successor sense `inheritedInclination` i obrir el modal no llança TypeError.
- **Completada**: 2026-06-01 — game.js:1316 usa `const incl = successor.inheritedInclination ?? {}` i `incl[a] ?? 0`. Fix aplicat en commit anterior.

---

## P1 DONE BUG — S2-08 — act_tenir_fills sense early-return a executeAction (explotable)

- **Agent**: gameplay-programmer
- **File**: `prototypes/bloodline/game.js:350`
- **Source**: `production/playtests/2026-05-29b-full.md#S2-08`
- **Fix**: Afegir al bloc `act_tenir_fills` dins `executeAction()`: `if (state.character.children.length >= MAX_CHILDREN) return;`
- **Acceptance**: Cridar `executeAction('act_tenir_fills')` amb 3 fills no avança el cicle ni executa efectes.
- **Completada**: 2026-06-01 — act_tenir_fills usa `requires: [{state: 'fills', lt_max: true}]` i executeAction() valida evaluateCharacterRequires() a la línia 367. Fix aplicat en commit anterior.

---

## P1 DONE BUG — S2-09 — Flag is_hidden mai llegit a game.js (codi mort a data.js)

- **Agent**: gameplay-programmer
- **File**: `prototypes/bloodline/game.js` (getEligibleBranchTechs), `prototypes/bloodline/data.js`
- **Source**: `production/playtests/2026-05-29b-full.md#S2-09`
- **Fix**: (pendent decisió — veure Decision)
- **Acceptance**: El comportament de bt_guariment_plantes i bt_calendari_natural és consistent amb la decisió presa.
- **Decision**: B — codi mort eliminat. bt_guariment_plantes i bt_calendari_natural ara is_hidden: false.
- **Completada**: 2026-06-01 — data.js: is_hidden true→false per les dues techs. Descoberta via getEligibleSkills() normal.

---

## P1 DONE FEAT — S2-10 — Text d'onboarding al cicle 0 (primer missatge orientatiu)

- **Agent**: ui-programmer
- **File**: `prototypes/bloodline/game.js` (init o renderAfterAction), `prototypes/bloodline/index.html`
- **Source**: `production/playtests/2026-05-29b-full.md#S2-10`
- **Fix**: Al cicle 0, injectar a `#last-result`: *"Comença explorant i recol·lectant. Executa accions per guanyar Aliment 🌾 i avançar cicles."*
- **Acceptance**: Al carregar el joc per primera vegada (o quan `state.cycle === 0`), el panell de resultat mostra el text d'onboarding.
- **Completada**: 2026-06-01 — game.js:891-896 té `onboarding-panel` que apareix quan `state.cycle === 0 && !state.onboardingDismissed`. Implementat en commit anterior.

---

## P1 DONE FEAT — S2-11 — Destacar visualment accions que desbloquegen zones

- **Agent**: ui-programmer
- **File**: `prototypes/bloodline/game.js` (buildZoneCard), `prototypes/bloodline/style.css`
- **Source**: `production/playtests/2026-05-29b-full.md#S2-11`
- **Fix**: Afegir classe CSS `action-unlocks-zone` a botons d'accions amb `unlocks_zone` definit. Afegir prefix 🗺️ al text del botó.
- **Acceptance**: act_explorar_voltants apareix amb prefix 🗺️ i estil visual distintiu. Cap altra acció del joc té aquest estil.
- **Completada**: 2026-06-01 — game.js:1088-1093 afegeix span.zar-zone-hint amb " 🗺️" suffix i tooltip. Implementat en commit anterior.

---

## P1 DONE BUG — S2-12 — Descoberta de zona no usa div de notificació en daurat

- **Agent**: ui-programmer
- **File**: `prototypes/bloodline/game.js` (lògica unlockZone / renderAfterAction)
- **Source**: `production/playtests/2026-05-29b-full.md#S2-12`
- **Fix**: Quan es descobreix una nova zona, usar el `#discovery-notification` div (daurat) igual que per a branch techs, i mantenir-lo visible un cicle.
- **Acceptance**: Descobrir zona Bosc mostra el div daurat: *"Nova zona descoberta: Bosc 🌲"*. Desapareix al cicle següent.
- **Completada**: 2026-06-01 — game.js:880-882 usa `#discovery-notification` per zones (`pendingZoneDiscovery`) amb prioritat sobre skills. Implementat en commit anterior.

---

## P1 DONE FEAT — S2-13 — Hint d'inclinació inline al panel de perfil

- **Agent**: ui-programmer
- **File**: `prototypes/bloodline/index.html` o `game.js` (renderProfile)
- **Source**: `production/playtests/2026-05-29b-full.md#S2-13`
- **Fix**: Afegir sota la secció "Inclinació" del panel de perfil: *"La inclinació determina quines accions veus i pots aprendre."*
- **Acceptance**: Text visible sense obrir el Glossari. Apareix des del cicle 0.
- **Completada**: 2026-06-01 — index.html afegit `<div class="section-hint">` sota label "Inclinació". style.css afegit `.section-hint` amb font-size 0.75rem, color var(--dim).

---

## P1 DONE FEAT — S2-14 — Notificació de branch tech unlock amb llista d'accions noves

- **Agent**: ui-programmer
- **File**: `prototypes/bloodline/game.js` (unlockBranchTech o renderAfterAction)
- **Source**: `production/playtests/2026-05-29b-full.md#S2-14`
- **Fix**: Expandir `lastResult` post-unlock: *"Habilitat nova: [nom]. Noves accions disponibles a [zona]: [accions]. Ves a 'Aprendre' per comprar-les."*
- **Acceptance**: Desbloquejar bt_rasclador_fi mostra en lastResult les accions que ara es poden comprar i a quina zona estan.
- **Completada**: 2026-06-01 — game.js:210-220 agrupa newActions per zona. bt_rasclador_fi mostra: "Habilitat nova: Rasclador Fi · Noves accions — Campament: Mòlta de Grans, Façonar Eines. Ves a 'Aprendre'."

---

## P1 DONE FEAT — S2-15 — Avís de successió anticipat i hint familiar des del principi

- **Agent**: gameplay-programmer
- **File**: `prototypes/bloodline/game.js:710`
- **Source**: `production/playtests/2026-05-29b-full.md#S2-15`
- **Fix**: (pendent decisió — veure Decision)
- **Acceptance**: El jugador rep avís de la successió amb prou temps per tenir fills. El panel de Família dona context des del principi.
- **Decision**: B — hint dinàmic amb cicles restants del personatge al panel de Família, sempre visible.
- **Completada**: 2026-06-01 — game.js:772 hint actualitzat: "Queden X cicles. Assegura la successió." (LIFE_EXPECTANCY − characterAge()). Visible des del cicle 0.

---

## P1 DONE BUG — S2-16 — Botó Glossari massa petit per toc mòbil (28px, mínim 32px)

- **Agent**: ui-programmer
- **File**: `prototypes/bloodline/style.css:95`
- **Source**: `production/playtests/2026-05-29b-full.md#S2-16`
- **Fix**: Al media query mòbil, afegir: `.btn-glossary { width: 44px; height: 44px; font-size: 16px; }`
- **Acceptance**: En viewport ≤ 768px, `.btn-glossary` mesura ≥ 44×44px. En desktop, manté les dimensions actuals.
- **Completada**: 2026-06-01 — style.css:872 té `.btn-glossary { width: 44px; height: 44px; font-size: 16px; }` dins media query mòbil. Implementat en commit anterior.

---

## P1 DONE BUG — S2-17 — Panel de perfil sense scroll amb 13 branch techs (mòbil)

- **Agent**: ui-programmer
- **File**: `prototypes/bloodline/style.css`
- **Source**: `production/playtests/2026-05-29b-full.md#S2-17`
- **Fix**: Al media query mòbil, afegir a `#unlocked-branch-techs`: `max-height: 240px; overflow-y: auto;`
- **Acceptance**: En mòbil amb 13 branch techs descobertes, el panel de perfil no excedeix l'altura de la pantalla. L'usuari pot fer scroll dins la secció d'habilitats.
- **Completada**: 2026-06-01 — style.css:874 té `#unlocked-branch-techs { max-height: 200px; overflow-y: auto; }` en media query mòbil. Implementat en commit anterior.

---

## P1 DONE BUG — S2-03 — Prerequisit de zona Bosc no apareix a pestanya "Bloq."

- **Agent**: ui-programmer
- **File**: `prototypes/bloodline/game.js` (buildZoneCard / renderBlocked)
- **Source**: `production/playtests/2026-05-29b-full.md#S2-03`
- **Fix**: Afegir a la descripció de l'acció bloquejada la condició de zona: *"Requereix zona [nom] ([acció de desbloqueig])"*.
- **Acceptance**: act_rastreig_rutes a "Bloq." mostra: *"Requereix zona Bosc (explorar els voltants)"* a més dels prereqs de branch tech.
- **Completada**: 2026-06-01 — 3 fixes: (1) buildLookupTables bt vs skill → tab "Aprendre" ara funciona; (2) buildBlockedRow bt vs skill → reasons correctes; (3) buildUndiscoveredCard mostra count d'accions disponibles + com descobrir la zona.

---

## P1 DONE FEAT — S2-04 — Avís de pèrdua de Provisions a successió (materials = 0)

- **Agent**: ui-programmer
- **File**: `prototypes/bloodline/game.js` (modal successió o avís últims cicles)
- **Source**: `production/playtests/2026-05-29b-full.md#S2-04`
- **Fix**: Si `state.materials > 0` quan s'activa el modal de successió, afegir: *"🧠 [N] Provisions sense gastar — compra accions ara, no passen a la generació!"*
- **Acceptance**: Jugador amb 10🧠 al modal de successió veu l'avís. Jugador amb 0🧠 no el veu.
- **Completada**: 2026-06-01 — game.js:864-866 mostra l'avís a l'àrea de warning quan `cyclesLeft <= 3 && state.material > 0`. Implementat pre-modal (millor UX). Commit anterior.

---

## P2 OPEN DESIGN — D-01 — Decidir si Universal Techs cicles 9 i 12 són intencionals Gen 2+

- **Agent**: game-designer
- **File**: `design/gdd/bloodline/content-plan-era1.md`
- **Source**: `production/playtests/2026-05-29b-full.md` (design decisions section)
- **Fix**: (pendent decisió — veure Decision)
- **Acceptance**: content-plan-era1.md té una secció "Universal Techs — Accessibilitat per Generació" amb la decisió documentada.
- **Decision**: (pendent)
- **Options**:
  - A) Intencional Gen 2+: documentar-ho al GDD + afegir hint a la UI ("Alguns coneixements s'hereden de la generació anterior")
  - B) Error de disseny: avançar les techs als cicles 7 i 10 perquè siguin assequibles en Gen 1 amb joc normal
  - C) Mantenir cicles però afegir una acció de "recerca intensiva" que permet accelerar-les 2 cicles

---

## P2 OPEN DESIGN — D-02 — Definir si discoveredZoneIds persisteix entre generacions (bug o feature)

- **Agent**: game-designer
- **File**: `design/gdd/bloodline/content-plan-era1.md`
- **Source**: `production/playtests/2026-05-29b-full.md` (design decisions section)
- **Fix**: (pendent decisió — veure Decision)
- **Acceptance**: Decisió documentada al GDD. Comportament al joc és consistent amb la decisió.
- **Decision**: (pendent)
- **Options**:
  - A) Feature ("coneixement clànic"): mantenir persistència + afegir text a la UI de successió ("El teu clan recorda els territoris explorats")
  - B) Bug: resetar discoveredZoneIds a continueSuccession() — cada generació comença de zero geogràficament
  - C) Persistència parcial: les zones principals (Bosc, Planes) persisteixen; les especials (Ritual) es reinicien

---

## P2 OPEN DESIGN — D-03 — Definir si events de descoberta es repeteixen intencionadament cada generació

- **Agent**: game-designer
- **File**: `design/gdd/bloodline/event-system.md`
- **Source**: `production/playtests/2026-05-29b-full.md` (design decisions section)
- **Fix**: (pendent decisió — veure Decision)
- **Acceptance**: event-system.md documenta el scope de single_use. El codi és consistent amb la decisió.
- **Decision**: (pendent)
- **Options**:
  - A) Per personatge (actual): cada generació pot viure els events de descoberta — es reforça la narrativa de "cada vida és nova"
  - B) Per dinastia: firedSingleUseEventIds persisteix a continueSuccession() — un event de descoberta només passa una vegada a tota la dinastia
  - C) Híbrid: events de descoberta de zona = per personatge; events de descoberta de branch tech = per dinastia

---

## P3 OPEN BALANCE — B-01 — Branca Recol·lector sense payoff accessible en Gen 1

- **Agent**: economy-designer
- **File**: `prototypes/bloodline/data.js`, `design/gdd/bloodline/content-plan-era1.md`
- **Source**: `production/playtests/2026-05-29b-full.md` (design decisions section)
- **Fix**: (pendent decisió — veure Decision)
- **Acceptance**: Hi ha almenys 1 payoff tangible de la branca Recol·lector accessible a Gen 1 amb estratègia normal.
- **Decision**: (pendent)
- **Options**:
  - A) Afegir una acció nova exclusiva de la branca Recol·lector amb bon rendiment d'Aliment — recompensa clara a Gen 1
  - B) Ajustar el passive_effect de les branch techs existents de Recol·lector per donar +Aliment passiu per cicle
  - C) Acceptar que Recol·lector és una branca de paciència: payoff a Gen 2 per acumulació d'habilitats heretades — documentar-ho

---

## P3 OPEN CONTENT — C-01 — Efectes de les 13 branch techs pendents de definir (content-plan-era1.md)

- **Agent**: game-designer
- **File**: `design/gdd/bloodline/content-plan-era1.md`
- **Source**: `production/playtests/2026-05-29b-full.md` (pending section)
- **Fix**: (pendent decisió — veure Decision)
- **Acceptance**: Totes les 13 branch techs de data.js tenen efectes documentats al GDD content-plan-era1.md.
- **Decision**: (pendent)
- **Options**:
  - A) Dissenyar efectes jo mateix en una sessió de disseny dedicada (game-designer els proposa, jo els aprovo)
  - B) Delegar al game-designer que proposi efectes basats en la identitat temàtica de cada branca, jo reviso el draft
  - C) Alinear primer les decisions D-01/D-02/D-03 i B-01 — els efectes haurien de ser coherents amb les decisions de persistència i accessibilitat

---

## P3 OPEN CONTENT — C-02 — Condicions exactes dels 6 títols de dinastia i 10 badges

- **Agent**: game-designer
- **File**: `design/gdd/bloodline/content-plan-era1.md`
- **Source**: `production/playtests/2026-05-29b-full.md` (pending section)
- **Fix**: (pendent decisió — veure Decision)
- **Acceptance**: content-plan-era1.md llista els 6 títols i 10 badges amb condicions numèriques/de branca verificables.
- **Decision**: (pendent)
- **Options**:
  - A) Dissenyar títols/badges basats en estil de joc (branca dominant, generacions completades, combinació de branques)
  - B) Dissenyar títols/badges basats en fites numèriques (X generacions, Y accions, Z habilitats heretades)
  - C) Híbrid: 3 títols per estil de joc (narratius) + 3 per fites (mecànics); 5 badges per assoliment normal + 5 secrets

---

<!-- STATS: actualitzat 2026-06-01 -->
<!-- OPEN: P0=3 · P1=17 · P2=3 · P3=3 | IN-PROGRESS=0 | DONE=0 | BLOCKED=0 | DEFERRED=0 -->
<!-- NEEDS-DECISION: S1-03, S2-02, S2-06, S2-09, S2-15, D-01, D-02, D-03, B-01, C-01, C-02 (11 tasques) -->
