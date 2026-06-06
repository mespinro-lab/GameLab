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

## P2 DONE DESIGN — D-01 — Universal Techs cicles 9+12 avançar a cicles 7+10 (Gen1 assequible)

- **Agent**: economy-designer
- **File**: `src/bloodline/bloodline/data/` (universal techs config)
- **Source**: `production/playtests/2026-05-29b-full.md` (design decisions section)
- **Fix**: Avançar universal techs: cicle 9→7 i cicle 12→10. Gen 1 pot assolir-les amb joc normal.
- **Decision**: B — avançar techs. **DECIDIT 2026-06-06.**

---

## P2 DONE DESIGN — D-02 — discoveredZoneIds persisteix entre generacions (coneixement clànic)

- **Agent**: gameplay-programmer
- **File**: `src/bloodline/bloodline/scripts/core/LineageManager.gd`
- **Source**: `production/playtests/2026-05-29b-full.md` (design decisions section)
- **Fix**: Assegurar que `discoveredZoneIds` NO es reinicia a `continue_succession()`. Les zones explorades per la dinastia persisteixen. Afegir text a la UI de successió: "El clan recorda els territoris explorats."
- **Decision**: A — persistència. **DECIDIT 2026-06-06.**

---

## P2 DONE DESIGN — D-03 — Events de descoberta: per dinastia (no per personatge)

- **Agent**: gameplay-programmer
- **File**: `src/bloodline/bloodline/scripts/core/EventManager.gd`
- **Source**: `production/playtests/2026-05-29b-full.md` (design decisions section)
- **Fix**: `firedSingleUseEventIds` persisteix a `continue_succession()`. Un event de descoberta (single_use) es dispara una sola vegada per tota la dinastia.
- **Decision**: B — per dinastia. **DECIDIT 2026-06-06.**

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

---

## P0 OPEN BUG — PT-01 — Double count visual de tokens en executar acció (0→2→1)

- **Agent**: gameplay-programmer
- **File**: `src/bloodline/bloodline/scripts/ui/GameScreen.gd` → `_on_action_executed`, `_refresh_top_bar`
- **Source**: `production/playtests/2026-06-06/summary.md#BUG-PT1`
- **Fix**: Verificar quan s'actualitza el display de tokens: l'overlay mostra "+N🦴" i `_refresh()` es crida en tancar. Assegurar que el token count no es mostra com a actualitzat ABANS de l'overlay (perquè sembla que suma dos cops). Opció: refrescar el top bar només DESPRÉS de tancar l'overlay, no dins `_on_action_executed`.
- **Acceptance**: Executar una acció que dona +1 token: el top bar passa de 0 a 0 (o es congela) fins que l'overlay es tanca; en tancar, passa a 1. Cap moment on es vegi 2.

---

## P0 OPEN BUG — PT-02 — Acció ritual de foc disponible sense prerequisit de foc

- **Agent**: gameplay-programmer
- **File**: `src/bloodline/bloodline/scripts/core/ActionManager.gd`, `src/bloodline/bloodline/data/` (accions era 1)
- **Source**: `production/playtests/2026-06-06/summary.md#BUG-PT2`
- **Fix**: Afegir a l'acció de ritual de foc un prerequisit de tecnologia universal `"requires_universal_tech": "ut_descoberta_foc"` (o el nom corresponent). Verificar que `get_action_visibility()` avalua aquest prerequisit i retorna `HIDDEN` si la tech no s'ha assolit.
- **Acceptance**: Cicle 0 → ritual de foc NO apareix. Après descobrir el foc → sí apareix.

---

## P0 OPEN BUG — PT-03 — Skill "Custodi del Foc" elegible sense foc descobert

- **Agent**: gameplay-programmer
- **File**: `src/bloodline/bloodline/scripts/core/EventManager.gd` (o on s'avaluen els skills elegibles), data/ skills
- **Source**: `production/playtests/2026-06-06/summary.md#BUG-PT3`
- **Fix**: Afegir a la skill `bt_custodi_del_foc` (o equivalent) un prerequisit de tech universal de foc. La funció que calcula skills elegibles ha de filtrar per `requires_universal_tech` igual que `get_action_visibility()` ho fa per accions.
- **Acceptance**: Intentar descobrir skill "Custodi del Foc" sense foc descobert → skill NO apareix com a elegible.

---

## P0 OPEN DESIGN — PT-04 — Tokens (🦴) no han de reiniciar entre personatges

- **Agent**: gameplay-programmer
- **File**: `src/bloodline/bloodline/scripts/core/LineageManager.gd` → `continue_succession()`
- **Source**: `production/playtests/2026-06-06/summary.md#DESIGN-PT1`
- **Fix**: Verificar que `continue_succession()` NO posa tokens a 0. Els tokens s'han d'acumular durant tota la dinastia. Si s'estan reiniciant, eliminar el reset. Si `GameState.tokens` ja persisteix, confirmar i documentar.
- **Decision**: A — tokens acumulen tota la dinastia (currency de progressió a llarg termini). **DECIDIT 2026-06-06.**
- **Acceptance**: Gen 1 acumula 20 tokens, Gen 2 comença amb 20 tokens + els que genera.

---

## P0 OPEN DESIGN — PT-05 — Totes les accions han de generar ≥1 token

- **Agent**: economy-designer
- **File**: `src/bloodline/bloodline/data/` (accions era 1)
- **Source**: `production/playtests/2026-06-06/summary.md#DESIGN-PT2`
- **Fix**: Revisar totes les accions de l'era 1. Qualsevol acció amb `output_min: 0` i `output_max: 0` o similar s'ha de modificar per garantir com a mínim `output_min: 1`. El jugador ha de sentir que cada acció li aporta alguna cosa cap a la progressió.
- **Acceptance**: Executar qualsevol acció disponible dona ≥1 token. No existeix cap acció amb output 0 net de tokens.

---

## P0 OPEN DESIGN — PT-06 — Sistema de salut: no penalitza la fam, baixa sempre

- **Agent**: game-designer
- **File**: `src/bloodline/bloodline/scripts/core/GameState.gd` o `ActionManager.gd` (lògica de torn), data/ config
- **Source**: `production/playtests/2026-06-06/summary.md#DESIGN-PT3`
- **Fix**: Redissenyar la degradació de salut per l'era prehistòria:
  1. Salut base prehistòria: **60** — configurable a config.json
  2. Cada torn sense inanició: salut **estable** (0/torn)
  3. Edat avançada (a partir cicle 11): −2/torn addicionals
  4. Inanició (menjar = 0 al final de torn): −10/torn extra
- **Decision**: B — Salut base 60. **DECIDIT 2026-06-06.**
- **Acceptance**: Jugador que menja correctament: salut estable fins edat avançada (cicle 11+). Jugador sense menjar: salut cau ~10/torn (mort en ~3 cicles d'inanició a partir de HP 60).

---

## P1 OPEN BUG — PT-07 — Zones es descobreixen sense accions disponibles

- **Agent**: game-designer + gameplay-programmer
- **File**: `src/bloodline/bloodline/scripts/core/ActionManager.gd`, data/ zones i accions
- **Source**: `production/playtests/2026-06-06/summary.md#BUG-PT4`
- **Fix**: Eliminar zona Ritual. 3 zones estàndard: Campament, Planes, Bosc. Campament+Planes disponibles des del cicle 0. Bosc apareix en comprar la primera acció de Bosc. discoveredZoneIds persisteix entre generacions. **DECIDIT 2026-06-06.**
- **Decision**: Zones estàndard + Ritual migra a Campament/Bosc/Planes. Bosc descobert per primera compra d'acció de Bosc.

---

## P1 OPEN DESIGN — PT-08 — Fills han de costar menjar extra per torn

- **Agent**: gameplay-programmer
- **File**: `src/bloodline/bloodline/scripts/core/GameState.gd` o manager de torn, data/ config
- **Source**: `production/playtests/2026-06-06/summary.md#DESIGN-PT4`
- **Fix**: Afegir lògica: `food_drain_per_turn += children.size() * CHILD_FOOD_COST`. Valor suggerit: `CHILD_FOOD_COST = 1`. Ha d'afectar el display de consum per torn (UX-PT4). Configurable a config.json.
- **Acceptance**: 0 fills: consum base (p.ex. 2/torn). 1 fill: 3/torn. 2 fills: 4/torn. Visible a la UI.

---

## P1 OPEN BALANCE — PT-09 — Inclinació massa lenta: 3 vides sense cap branca activa

- **Agent**: economy-designer
- **File**: `src/bloodline/bloodline/data/` (accions era 1, config branques)
- **Source**: `production/playtests/2026-06-06/summary.md#DESIGN-PT5`
- **Fix**: Pujar inclination_delta de les accions base 0.05→0.08 (+50%) I baixar threshold d'activació de branca 0.30→0.22 (−25%). Gen 1: ~4 cicles especialitzats per branca activa. **DECIDIT 2026-06-06.**
- **Decision**: C — ambdós: deltes +50% + threshold −25%.

---

## P1 OPEN BUG — PT-10 — Successió: pool de successors acumula germans de generacions anteriors

- **Agent**: gameplay-programmer
- **File**: `src/bloodline/bloodline/scripts/core/LineageManager.gd` → `get_available_successors()` o equivalent
- **Source**: `production/playtests/2026-06-06/summary.md#DESIGN-PT6`
- **Fix**: La llista de successors a la mort ha de ser SEMPRE els fills del personatge actual. Els germans d'una generació anterior (fills no escollits) NOMÉS entren al pool si el personatge mor sense fills. Revisar la lògica que construeix la llista i eliminar l'acumulació de germans.
- **Acceptance**: Gen 1 mor amb 3 fills → pool: 3 fills. Triats fill A. Fill A mor amb 2 fills → pool: 2 fills de A (no 2 fills + 2 germans no triats).

---

## P1 OPEN UX — PT-11 — Layout barra superior i botó d'execució d'acció

- **Agent**: ui-programmer
- **File**: `src/bloodline/bloodline/scripts/ui/GameScreen.gd` → `_build_top_bar()`, `_build_lt1_action_row()`
- **Source**: `production/playtests/2026-06-06/summary.md#UX-PT1`
- **Fix**: (1) Top bar: moure la secció RECURSOS (🦴 tokens) al centre entre VITALS i el nom del joc (o centrar-la). (2) `_build_lt1_action_row()`: moure el botó ▶ / compra a l'ESQUERRA de la fila, abans de `info_col`.
- **Acceptance**: Top bar: Recursos al centre. Fila d'acció: botó a l'esquerra, info a la dreta.

---

## P1 OPEN UX — PT-12 — Menjar redundant; afegir consum per torn i límit d'emmagatzematge

- **Agent**: ui-programmer
- **File**: `src/bloodline/bloodline/scripts/ui/GameScreen.gd`
- **Source**: `production/playtests/2026-06-06/summary.md#UX-PT2, UX-PT3, UX-PT4`
- **Fix**: (1) Eliminar la pill de 🌾 menjar del top bar (ja es veu al panell esquerre). (2) Al panell esquerre, mostrar: `🌾 X/MAX  (−Y/torn)` on MAX = límit d'emmagatzematge actual, Y = consum per torn actual (base + fills). (3) El consum per torn ha de venir de GameState o d'un mètode de càlcul centralitzat.
- **Acceptance**: Top bar: no té pill de menjar. Panell esquerre: mostra `🌾 8/20  (−3/torn)` actualitzat en temps real.

---

## P1 OPEN UX — PT-13 — Descobriments majors (foc, eines) necessiten anunci dramàtic

- **Agent**: ui-programmer
- **File**: `src/bloodline/bloodline/scripts/ui/GameScreen.gd` → `_on_tech_discovered()`
- **Source**: `production/playtests/2026-06-06/summary.md#UX-PT5`
- **Fix**: Millorar l'overlay de tecnologia universal per als descobriments de foc i eines: icona gegant (64px), color de fons distintiu (daurat o vermell), text explicatiu de 2 línies sobre la importància del descobriment, animació de fade-in si és possible. Diferenciar visualment de l'overlay d'event normal.
- **Acceptance**: Descobrir el foc mostra un overlay que ocupa la pantalla amb icona gran i text explicatiu. Clarament diferent dels events normals.

---

## P2 OPEN DESIGN — PT-14 — Zones: revisar estructura (Ritual injusta, inici amb poques zones)

- **Agent**: game-designer
- **File**: `design/gdd/bloodline/content-plan-era1.md`, data/ zones
- **Source**: `production/playtests/2026-06-06/summary.md#DESIGN-PT8`
- **Fix**: (pendent decisió — veure Decision)
- **Decision**: (pendent)
- **Options**:
  - A) Zona Ritual es manté però totes les branques hi tenen accions (no és exclusiva de mística)
  - B) Accions de ritual migren a Campament i Bosc; la zona Ritual desapareix
  - C) Redisseny complet: 3 zones estàndards (Campament, Bosc, Planes) + zona especial per branca dominant (desblocat en branca ≥0.5)

---

## P2 OPEN DESIGN — PT-15 — Events random: sistema de balanceig de probabilitats

- **Agent**: game-designer
- **File**: `src/bloodline/bloodline/scripts/core/EventManager.gd`, `design/gdd/bloodline/event-system.md`
- **Source**: `production/playtests/2026-06-06/summary.md#DESIGN-PT7`
- **Fix**: Definir i implementar un sistema de balanceig d'events:
  1. Definir `target_positive_pct` i `target_negative_pct` per era a config.json
  2. Fer seguiment de quants events positius/negatius han succeït a l'era actual
  3. Si no han passat suficients negatius → augmentar probabilitat d'event negatiu en el próxim tick
  4. Si n'han passat molts → baixar probabilitat
- **Acceptance**: En una partida de 14 cicles, la ràtio positius/negatius s'aproxima al target definit (±20%).

---

## P3 OPEN DESIGN — PT-16 — Incentiu per vides llargues del personatge

- **Agent**: game-designer
- **File**: `design/gdd/bloodline/content-plan-era1.md`, `src/bloodline/bloodline/scripts/core/ScoringManager.gd`
- **Source**: `production/playtests/2026-06-06/summary.md#DESIGN-PT10`
- **Fix**: (pendent decisió — veure Decision). Referència: revisar costos i implicacions de LT1 com a model.
- **Decision**: (pendent)
- **Options**:
  - A) Bonus de puntuació per cicles viscuts (p.ex. +5 punts per cicle a partir del cicle 10)
  - B) Tokens extra generats per cicle en edat avançada (+2 tokens/cicle a partir del cicle 11)
  - C) Herència d'inclinació proporcional a l'edat (morir als 14: 100% herència; morir als 8: 57%)

---

<!-- STATS: actualitzat 2026-06-06 -->
<!-- OPEN: D2+D3 pendents (antics) + PT: P0=6 · P1=7 · P2=2 · P3=1 (nous) | NEEDS-DECISION: PT-07, PT-09, PT-14, PT-15, PT-16, D-01, D-02, D-03, B-01, C-01, C-02 -->
