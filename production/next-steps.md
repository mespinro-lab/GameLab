# Bloodline — Next steps (roadmap prioritzat)

> **Generat 2026-06-27** (sessió autònoma). Font de tasques detallades: `production/backlog.md`.
> Estat del joc: prototip JS jugable (`prototypes/bloodline-v2/`), desplegat a GitHub Pages.

## Estat actual (resum)
- **Era 1 (Paleolític) jugable**: core loop inclinació→branques→habilitats→accions, successió, scoring.
- **Decisions de disseny preses (DESIGN-02, 2026-06-25)**: model de branques, eines (cadena lliure + retorn
  gratuït), accions-pont, dead zones, material com a recurs de llinatge (no tensió). Vegeu
  `design/gdd/bloodline/branch-model-redesign.md` §7 i `progression-distribution.md` §9.
- **Fixos recents (2026-06-26/27) desplegats**: seqüència de torn (SEQ-01), salut sense clawback (2a),
  impacte numèric d'events (EVT-01), historial ric (LOG-01), material en opcions (EVT-OPT-MAT),
  Assecar Provisions deshabilitada (FOOD-CAP-01), coure_ceramica (BAL-01), ensenyament per-fill (TEACH-01).

---

## P0 — Tancar el cicle de qualitat actual (curt termini)
1. **LOG-02 (completar)** — afegir al log: aprenentatge **descobert**, **acció comprada** i **upgrade**.
   Recomanat: refactor a un únic `entry.extras = [{icon,text}]` per simplicitat i extensibilitat.
2. **SUCC-01** — desar `pendingDeath`/`pendingSuccession` (serialitzar Sets com a `siblingPool`) perquè una
   mort/successió pendent sobrevisqui un background-kill mòbil.
3. **TEST-HARNESS** — formalitzar els tests headless (els throwaway d'aquesta sessió) en `tests/` + runner,
   i afegir-los a CI (ja hi ha workflows). Base per no tornar a desplegar res sense verificar.

## P1 — DESIGN-02-IMPL (implementar les decisions de disseny)
Contingut a `data.js` (via `era-writer`/`era-historian`) + lògica a `game.js`:
1. **Eines**: cadena lliure (1 activa, qualsevol upgrade de qualsevol) + **retorn gratuït** (registre "eines
   conegudes" heretat).
2. **Accions-pont noves**: 3 del Místic (sacrifici ritual, curació col·lectiva, narrar territori) com a
   substitut de `narrar_llegendes`/`cants_grup` (a eliminar), + 2 noves (Caçador→Artesà, Recol·lector→Místic).
3. **Dead zones**: `bt_mapa_recursos` a `ut_art` (Artesà); família de foc del Caçador a `ut_foc`
   (`bt_carn_al_foc` + caça amb foc); reubicar `bt_coneixement_plantes` → `ut_foc` (bàsica) / `ut_corda` (expandida).
4. **Foc com a UT transversal**: cada branca l'aprofita al seu estil (ja documentat).
> Aquests són canvis de contingut/creativitat: millor amb drafts per a revisió teva abans de desplegar.

## P2 — UX i claredat
1. **Descobriment d'habilitats poc clar** (UX-01 + #5): el jugador no entén que les habilitats s'obtenen via
   "Escoltar els Estrangers". Fer el flux molt més visible, o repensar-lo dins DESIGN-02.
2. **Mercat**: distingir clarament "Disponible" vs "Requereix habilitat".
3. **Avís d'extinció** (UX-02): més visible abans que es tanqui la finestra de parella.
4. **PACE-01**: revisar la dead zone pre-`ut_eines` (cicles 6-16) després de DESIGN-02-IMPL.

## P3 — Documentació i decisió d'engine
1. **DOCS-SYNC (completar)**: actualitzar recomptes del README (ara ~104 accions / 48 branch-techs vs 79/30
   declarats) i systems-index.
2. **Decisió d'engine (per a tu)**: CLAUDE.md/technical-preferences declaren **Godot 4.6** però el joc viu és
   el **prototip JS** i Godot està en pausa. Cal decidir formalment: (a) consolidar el prototip JS com a
   producte i actualitzar tota la docu, o (b) reprendre el port a Godot. Mentrestant, s'ha afegit una nota
   d'estat a CLAUDE.md. **Aquesta és una decisió teva.**

## P4 — Més enllà (mitjà termini)
- Balanç fi de l'Era 1 amb playtests dirigits (els agents playtester ja existeixen; `/playtest`).
- Pla per a Eres 2+ (pipeline `/era-design`).
- Polish: feel d'animacions, àudio, persistència robusta, accessibilitat.
- Pre-producció del port a engine si es decideix (P3.2).

---

## Recomanació immediata (quan reprenguis)
Ordre suggerit: **LOG-02 → SUCC-01 → TEST-HARNESS** (tancar qualitat), després **DESIGN-02-IMPL** (el gros del
valor de disseny, amb drafts per revisar). La resta (UX, docs, engine) en paral·lel segons prioritat teva.
