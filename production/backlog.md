# Production Backlog — Bloodline (JS prototype)

<!-- GESTIONAT per /drive i /feedback-loop. Editable a mà; mantén el format de capçalera de tasca. -->
<!--                                                                                                  -->
<!-- FORMAT DE CAPÇALERA: ## [PRIOR] [ESTAT] [TIPUS] — [ID] — Títol                                 -->
<!--   PRIOR: P0 (aquesta sessió) | P1 (propera sessió) | P2 (pròximament) | P3 (backlog llunyà)     -->
<!--   ESTAT: OPEN | IN-PROGRESS | DONE | BLOCKED | DEFERRED                                         -->
<!--   TIPUS: BUG | FEAT | BALANCE | CONTENT | DESIGN | QA | DOCS                                    -->
<!--                                                                                                  -->
<!-- TARGET: prototypes/bloodline-v2/ (game.js, data.js, index.html, style.css)                      -->
<!-- prototypes/bloodline/ (sense -v2) ABANDONAT — no tocar                                          -->
<!-- GODOT (src/bloodline/) ABANDONAT — no afegir tasques que apuntin a fitxers Godot                -->

---

## P1 DONE BUG — BL2-01 — Meta bar no mostra menjar ni salut

- **File**: `prototypes/bloodline-v2/index.html`, `prototypes/bloodline-v2/game.js`
- **Issue**: La barra superior no té indicadors visuals de menjar ni salut. El jugador no veu l'estat crític dels recursos principals sense obrir el panell de personatge.
- **Source**: Playtest 2026-06-14, S1 CM (casual-mobile)
- **Acceptance**: Menjar i salut visibles a la meta bar en tot moment, sense obrir cap overlay.

---

## P1 DONE UX — BL2-02 — Ghost pill no tappable ni explicada

- **File**: `prototypes/bloodline-v2/game.js`, `prototypes/bloodline-v2/style.css`
- **Issue**: La ghost pill (branca en formació) és purament visual. No es pot tocar ni mostra cap explicació. El jugador no sap que es pot activar o com progressa.
- **Source**: Playtest 2026-06-14, S5 CM (casual-mobile)
- **Acceptance**: Tap a la ghost pill mostra info breu: nom de la branca en formació i progrés cap al llindar d'activació.

---

## P1 DONE BALANCE — BL2-03 — act_emboscada_nocturna letal sense avis (-14 HP)

- **File**: `prototypes/bloodline-v2/data.js`, `prototypes/bloodline-v2/game.js`
- **Issue**: act_emboscada_nocturna costa -14 health per us. Tres usos = mort a Gen 2+ (STARTING_HEALTH=30). No hi ha avis de risc al carrusel.
- **Source**: Playtest 2026-06-14, D6
- **Decision**: Badge de risc visible al cost de l'accio al carrusel quan health_delta <= -10. Mante el balanco, avisa el jugador.
- **Acceptance**: Jugador veu indicador de risc al card de l'accio quan el cost de salut es alt.

---

## P1 DONE BALANCE — BL2-04 — Pacing late-game: ut_ceramica/ut_agricultura comprimits

- **File**: `prototypes/bloodline-v2/data.js`
- **Issue**: ut_ceramica (cicle 80) i ut_agricultura (cicle 92) deixen 20 cicles per explorar 4 techs noves. Si Gen 4 mor al cicle 77-78, Gen 5 no arriba al cicle 100.
- **Source**: Playtest 2026-06-14, D4
- **Decision**: Avançar ut_ceramica a cicle 70, ut_agricultura a cicle 85. Preserva ERA_CYCLES=100.
- **Acceptance**: Un personatge que arrenqui al cicle 78 pot assolir i usar les techs finals.

---

## P1 DONE BUG — BL2-05 — Constants zombie reputacio al codi

- **File**: `prototypes/bloodline-v2/game.js`
- **Issue**: Constants obsoletes del sistema de reputacio eliminat (FAMILY_REP_INHERITANCE i similars) sobreviuen al codi sense efecte.
- **Source**: Playtest 2026-06-14, S4 (V2-09/10/11 tycoon)
- **Acceptance**: Cap referencia a reputation, reputacio, FAMILY_REP_INHERITANCE al codi de game.js.
- **Completada**: 2026-06-16 (grep confirmat — cap referencia trobada)

---

## P2 DONE BALANCE — BL2-06 — Loop pedra-faonar: font de material sense cost real

- **File**: `prototypes/bloodline-v2/data.js`
- **Issue**: act_recollectar_pedra (gratuita) + act_faonar_eines (pedra -2, material +4/+7) genera 2x material que qualsevol altra accio sense cost d'inclinacio.
- **Source**: Playtest 2026-06-14, D7 (optimizer)
- **Options**:
  - A) Afegir execute_cost: { material: 1 } a act_faonar_eines
  - B) Reduir output de act_faonar_eines de +4/+7 a +3/+5
- **Decision**: (pendent)
- **Acceptance**: El material acumulat per hora de joc amb el loop pedra no supera en 2x la mitjana de les altres rutes.

---

## P2 DONE DESIGN — BL2-07 — Scoring path Mistic/Social sense diferenciacio

- **File**: `prototypes/bloodline-v2/game.js` → calculateScore()
- **Issue**: Jugadors Mistics i de pura supervivencia amb el mateix nombre de techs puntuen igual. El scoring no distingeix playstyle.
- **Source**: Playtest 2026-06-14, D1
- **Options**:
  - A) Bonus per diversitat de branques desbloq.
  - B) Titol especial per Mistics si >2 techs de la branca Mistic
- **Decision**: (pendent)

---

## P2 DONE FEAT — BL2-08 — Ghost pill sense avis de proximitat a condicions max

- **File**: `prototypes/bloodline-v2/game.js` → getFormingBranch()
- **Issue**: La pill no avisa quan s'acosta a violar una condicio max d'inclinacio (ex: sociabilitat > 0.40 bloquejarà el Caçador).
- **Source**: Playtest 2026-06-14, D2
- **Acceptance**: Quan l'inclinacio es a <0.05 d'una condicio max, la ghost pill canvia de color/estat.

---

## P3 DONE CONTENT — C-01 — Passive effects de les branch techs sense efecte

- **File**: `prototypes/bloodline-v2/data.js` → SKILL_DEFS passive_effects
- **Issue**: Vuit de les 30 branch techs no tenen passive_effect tangible: bt_punta_llanca, bt_buri, bt_trampes, bt_guariment_plantes, bt_marques_territori, bt_ornaments, bt_coneixement_plantes, bt_llavor_selectiva.
- **Source**: design/eras/prehistoria/03-skills.md §7
- **Acceptance**: Totes les 30 branch techs amb passive_effect documentat i implementat.
- **Completada**: 2026-06-17 (confirmada per grep — totes les 8 ja tenien efectes al codi)

---

## P3 DONE CONTENT — C-02 — Titols de dinastia amb condicions verificables

- **File**: `prototypes/bloodline-v2/game.js` → calculateScore()
- **Issue**: El scoring final te 5 titols basics sense condicions numeriques precises. No hi ha badges.
- **Options**:
  - A) 3 narratius (branca dominant) + 3 mecanics (fites) + secrets
  - B) Titols per fites numeriques (X generacions, Y techs)
- **Decision**: (pendent)
- **Acceptance**: >=6 titols amb condicions verificables; almenys 1 secret.

---

## P3 DONE DESIGN — PT-16 — Incentiu per vides llargues

- **File**: `prototypes/bloodline-v2/game.js`
- **Issue**: No hi ha incentiu per viure fins al limit de LIFE_EXPECTANCY. L'optim es successio anticipada.
- **Options**:
  - A) Bonus puntuacio per cicles viscuts
  - B) Tokens extra per edat avançada
  - C) Herencia d'inclinacio proporcional a l'edat del difunt
- **Decision**: (pendent)

---

---

## P1 OPEN DESIGN — DESIGN-01 — Rethinking complet accions + habilitats Era 1

- **Fitxers**: `prototypes/bloodline-v2/data.js`, `design/gdd/bloodline/action-economy.md`,
  `design/eras/prehistoria/03-skills.md`
- **Issue**: El disseny actual de les accions de la branca Místic (i potencialment totes les branques)
  té tres problemes fonamentals:
  1. **Justificació temàtica feble**: accions com `narrar_llegendes` i `cants_grup` generen menjar
     sense que la narrativa ho justifiqui de manera creïble. La regla és: si no pots explicar en
     una frase PER QUÈ una acció dona el recurs que dona, el disseny és incorrecte.
  2. **Diferenciació risc/recompensa insuficient**: `narrar_llegendes` (🌾 1–3, sense risc) vs
     `cants_grup` (🌾 2–4, sense risc) vs `transit_nocturn` (🌾 2–4, −5 salut) — el primer i el
     segon son massa similars, el tercer s'hauria de diferenciar més que amb un simple −HP.
  3. **Absència de transicions entre branques via accions**: cada acció hauria de poder empentar
     la inclinació cap a la seva branca principal PERÒ algunes accions haurien d'actuar com a ponts
     naturals cap a altres branques (vegeu la filosofia a `action-economy.md §RETHINKING`).
- **Filosofia de disseny (nova)**: Una persona espiritual té accions espirituals, però el xamanisme
  la pot aproximar a l'enginy (intel·lecte); el sacrifici ritual la pot aproximar al guerrer (impuls);
  la cerimònia col·lectiva la pot aproximar al recol·lector social (sociabilitat). Les accions son el
  mecanisme de transició entre branques, no la confirmació de la branca actual.
- **Abast**: totes les accions de la branca Místic (16 accions + 8 branch techs) han de ser
  revisades. Potencialment totes les branques si s'aplica el mateix criteri de coherència.
- **Prerequisit**: decisió de disseny prèvia sobre quines transicions son possibles per branca
  (veure `action-economy.md §RETHINKING` per les preguntes obertes).
- **Acceptance**: cada acció té una justificació narrativa d'una frase per al seu output principal;
  cap dues accions de la mateixa branca donen el mateix recurs amb el mateix perfil de risc;
  almenys 2 accions per branca actuen com a ponts temàtics cap a altres branques.

---

---

## P0 DONE BUG — BL2-09 — Upkeep s'aplica abans de l'event

- **Resolt**: 2026-06-18. `beginEndOfTurnPhase()` mou upkeep al 3r donut (🌙), sempre després de l'event.

---

## P0 DONE BUG — BL2-10 — Fases del torn no comproven mort

- **Resolt**: 2026-06-18. `beginEndOfTurnPhase()` fa succession check al final de tot; age-gate checks comproven `state.health > 0` primer.

---

## P1 DONE UX — BL2-11 — Menjar i salut sense upkeep ni límit visible

- **Resolt**: 2026-06-18. Vital cells mostren `4/8` (valor/límit) i `↓2` (upkeep). Menjar i salut eliminats de la meta bar superior.

---

## P1 DONE BUG — BL2-12 — Capacitat menjar incorrecta al panell de debug

- **Resolt**: 2026-06-18. `showStatTooltip('food')` usa `foodMax()` en lloc de `FOOD_MAX`.

---

## P1 DONE UX — BL2-13 — Fases del torn invisibles

- **Resolt**: 2026-06-18. 3 donuts separats: acció → event → 🌙 fi de torn. Cada fase té la seva animació i efectes diferenciats.

---

## P1 DONE UX — BL2-14 — Alertes crítiques sense explicació

- **Resolt**: 2026-06-18. `!` parpelleja DINS del requadre de menjar/salut quan hi ha perill. Clic → tooltip explicatiu amb desglossament complet i missatge de mort si toca.

---

## P1 DONE UX — BL2-15 — Naix un fill sense avís d'augment de consum

- **Resolt**: 2026-06-18. `pane-birth` mostra el nou upkeep total de menjar per torn.

---

## P1 DONE BALANCE — BL2-16 — Febre pot aparèixer dues vegades seguides

- **Resolt**: 2026-06-18. `pe_malaltia` té `is_single_use: true`. Anti-repeat via `state.recentEventIds` (últims 4 events).

---

## P1 DONE BUG — BL2-17 — Copy incorrecte destreses

- **Resolt**: 2026-06-18. Missatge actualitzat a "Has despertat la capacitat innata de X. Es manifesta per la teva inclinació."

---

## P1 DONE UX — BL2-18 — Selecció hereu sense destreses ni aprenentatges

- **Resolt**: 2026-06-18. Botons d'hereu mostren ⭐ destreses i icones aprenentatges. Pantalla nou personatge mostra destreses inicials.

---

## P2 DONE UX — BL2-19 — Recursos sense indicadors de tendència visual

- **Resolt**: 2026-06-18. Carrusel d'accions usa `▲▼` per magnitud en tots els recursos (menjar, salut, pedra, eina, execute_cost, side_effects). Consistent amb les stats.

---

## P2 DONE UX — BL2-20 — Historial de torns no accessible

- **Resolt**: 2026-06-18. Log bar és clicable → overlay historial últims 10 torns (acció + event + upkeep per torn).

---

## P2 DONE CSS — BL2-21 — Targeta cicles de vida solapa amb Planes

- **Resolt**: 2026-06-18. `sun-cap` eliminat completament (era innecessari). Posicionament del logbar corregit.

---

## P1 OPEN DESIGN — DESIGN-01 — Rethinking complet accions + habilitats Era 1

- **Fitxers**: `prototypes/bloodline-v2/data.js`, `design/gdd/bloodline/action-economy.md`,
  `design/eras/prehistoria/03-skills.md`
- **Issue**: El disseny actual de les accions de la branca Místic (i potencialment totes les branques)
  té tres problemes fonamentals:
  1. **Justificació temàtica feble**: accions com `narrar_llegendes` i `cants_grup` generen menjar
     sense que la narrativa ho justifiqui de manera creïble. La regla és: si no pots explicar en
     una frase PER QUÈ una acció dona el recurs que dona, el disseny és incorrecte.
  2. **Diferenciació risc/recompensa insuficient**: `narrar_llegendes` (🌾 1–3, sense risc) vs
     `cants_grup` (🌾 2–4, sense risc) vs `transit_nocturn` (🌾 2–4, −5 salut) — el primer i el
     segon son massa similars, el tercer s'hauria de diferenciar més que amb un simple −HP.
  3. **Absència de transicions entre branques via accions**: cada acció hauria de poder empentar
     la inclinació cap a la seva branca principal PERÒ algunes accions haurien d'actuar com a ponts
     naturals cap a altres branques.
- **Abast**: totes les accions de la branca Místic (16 accions + 8 branch techs) han de ser
  revisades. Potencialment totes les branques si s'aplica el mateix criteri de coherència.
- **Acceptance**: cada acció té una justificació narrativa d'una frase per al seu output principal;
  cap dues accions de la mateixa branca donen el mateix recurs amb el mateix perfil de risc;
  almenys 2 accions per branca actuen com a ponts temàtics cap a altres branques.

---

## P2 DEFERRED BALANCE — BL2-06 — Loop pedra-faonar: font de material sense cost real

- **Fitxers**: `prototypes/bloodline-v2/data.js`
- **Issue**: `act_recollectar_pedra` (gratuïta) + `act_faonar_eines` (pedra -2, material +4/+7) genera 2x material que qualsevol altra acció sense cost d'inclinació.
- **Decisió pendent**:
  - A) Afegir `execute_cost: { material: 1 }` a `act_faonar_eines`
  - B) Reduir output de `act_faonar_eines` de +4/+7 a +3/+5

---

## P2 DEFERRED DESIGN — BL2-07 — Scoring Místic/Social sense diferenciació

- **Fitxers**: `prototypes/bloodline-v2/game.js` → `calculateScore()`
- **Issue**: Jugadors Místics i de pura supervivència amb el mateix nombre de techs puntuen igual.
- **Decisió pendent**:
  - A) Bonus per diversitat de branques desbloq.
  - B) Títol especial Místic si >2 techs de la branca Místic

---

## P3 DEFERRED CONTENT — C-02 — Títols de dinastia amb condicions verificables

- **Fitxers**: `prototypes/bloodline-v2/game.js` → `calculateScore()`
- **Issue**: 5 títols bàsics sense condicions numèriques precises; no hi ha badges.
- **Decisió pendent**:
  - A) 3 narratius (branca dominant) + 3 mecànics (fites) + secrets
  - B) Títols per fites numèriques (X generacions, Y techs)

---

<!-- HISTORIAL (prototypes/bloodline/ ABANDONAT) -->
<!-- DONE sessions 2026-06-06: PT-01..PT-13, D-01..D-03, SAVE, SCORE, BALANCE-EV, B-01 (20 tasques) -->
<!-- DONE sessions 2026-06-14/16: aprenentatge, redesign pantalla, S3/S4 -->
<!-- DONE sessió 2026-06-17: branques %normalitzats, tooltips, two-phase upkeep, material d'events -->
<!-- DONE sessió 2026-06-18 (mati): 9 fixes playtest + 5 UI (zones, menjar barra, icones) -->
<!-- DONE sessió 2026-06-18 (tarda): BL2-09..21, PT-16:A, assecar_provisions, 11 fixes UI -->
<!-- OPEN: DESIGN-01, BL2-06 (dec.), BL2-07 (dec.), C-02 (dec.) -->
<!-- STATS: actualitzat 2026-06-18 nit -->
