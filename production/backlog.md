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

<!-- HISTORIAL (prototypes/bloodline/ ABANDONAT) -->
<!-- DONE sessions 2026-06-06: PT-01..PT-13, D-01..D-03, SAVE, SCORE, BALANCE-EV, B-01 (20 tasques) -->
<!-- DONE sessions 2026-06-14/16: aprenentatge, redesign pantalla, S3/S4 (commits 16fef8d, ce20117, a120039) -->

<!-- STATS: actualitzat 2026-06-17 -->
<!-- DONE: BL2-01..08 + C-01, C-02, PT-16 (backlog complet, 2026-06-16/17) -->
<!-- DONE sessió 2026-06-17: branques %normalitzats, tooltips destresa/apr, two-phase upkeep, act_ensenyar visible, material eliminat d'events -->
<!-- OPEN: cap -->
