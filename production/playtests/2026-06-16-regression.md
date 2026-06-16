# Playtest Report — Regressió: visibilitat d'accions per inclinació — 2026-06-16

## Summary
- **Agents run**: playtester-speed-runner, playtester-dynasty-builder
- **Scope**: Regressió targeted — canvi `ACTION_INCLINATION_REQUIREMENTS` + `getActionVisibility()` (commit `97c2c73`, implementació del sistema ACTIVE/FADED/HIDDEN descrit a `design/gdd/bloodline/branch-system.md` §3.6)
- **Total issues**: 5 (S1: 1 · S2: 2 · S3: 2)
- **Nota de procés**: la primera tongada d'agents va llegir per error el directori antic i abandonat `prototypes/bloodline/` (últim commit 13/06) en lloc de `prototypes/bloodline-v2/` (l'actiu). Es van rellançar amb instruccions explícites de directori; els resultats d'aquest informe són només de la segona tongada, contra el codi correcte.

## S1 — Critical (corregit en aquesta sessió)

**ID S1-1** — Desbloquejar un skill (`SKILL_DEFS`) amb condició `operator: "OR"` no garantia que les accions que desbloquejava (`unlocks_action_ids`) quedessin ACTIVE, quan l'acció exigia a `ACTION_INCLINATION_REQUIREMENTS` un eix diferent del que va satisfer la branca de l'OR realment usada.
- **Reportat per**: speed-runner, dynasty-builder (independentment, mateixa conclusió)
- **Pitjor cas**: `bt_calendari_natural` (OR intel·lecte≥0.18 / espiritualitat≥0.20) i `bt_marques_territori` (OR impuls≥0.20 / intel·lecte≥0.18) — en ambdós, desbloquejar via la branca "equivocada" de l'OR deixava **les dues** accions desbloquejades HIDDEN simultàniament, contradient el toast "Nova habilitat desbloquejada".
- **Impacte**: el jugador veu que ha desbloquejat una habilitat però no pot fer-ne res — llegeix com un bug greu.
- **Fix aplicat**: eliminat el requisit d'inclinació de l'acció "pont/lleugera" de cada parella (`act_observar_cel`, `act_marcar_territori`), que ara queda sempre ACTIVE en comprar el skill. L'acció "avançada" de la parella manté el seu requisit i continua fent fade/reactivate amb la inclinació real — comportament desitjat pel disseny.

## S2 — Major

**ID S2-1** — Accions marcades com a "pont" entre branques (comentari al codi) usaven un sol eix d'inclinació, fent-les accessibles només des d'UNA de les dues branques que suposadament unien — no eren bidireccionals.
- **Reportat per**: speed-runner
- **Casos**: `act_practicar_tir` (pont caçador/artesà, només testava impuls), `act_preparar_ungüent` (pont místic/artesà, només espiritualitat), `act_modelar_argila` (pont artesà/místic, només intel·lecte), `act_observar_cel` (cobert a S1-1).
- **Únic pont ben dissenyat trobat**: `act_tallar_flauta` (AND intel·lecte+espiritualitat, ambdós llindars per sota dels del skill que la desbloqueja).
- **Fix aplicat**: eliminat el requisit d'inclinació de les 3 accions pont confirmades trencades — un cop el skill es desbloqueja (per qualsevol branca), l'acció pont queda sempre ACTIVE, sense fer mai fade. Coherent amb la seva funció: és precisament l'acció que ha de mantenir la transició suau entre dues branques.

**ID S2-2** — Risc de "lock-in" d'identitat de llinatge: combinació d'`INERTIA_FACTOR=2.0` + `INCLINATION_INHERITANCE_RATE=0.85` fa que, a partir de generació 2-3, sigui pràcticament impossible pivotar cap a una altra branca dins la vida d'un sol personatge un cop un eix supera ~0.5.
- **Reportat per**: dynasty-builder
- **No corregit** — sembla coherent amb la intenció de disseny ("comprometre's amb una branca té un cost real de pivot"), però cal confirmació explícita d'`economy-designer` que no és deriva accidental de les constants.

## S3 — Minor

**ID S3-1** — `bt_trampes` (impuls≥0.10) desbloqueja accions amb sostre `impuls≤0.35`; un jugador que segueix reforçant Caçador després de desbloquejar-ho pot superar el sostre en pocs usos i veure l'acció comprada desaparèixer (HIDDEN), sense cap avís previ a la UI.
- **Reportat per**: speed-runner
- **No corregit** — escalat a `game-designer`/`economy-designer`.

**ID S3-2** — Les transicions ACTIVE→FADED→HIDDEN poden saltar-se l'estat FADED en un sol torn quan una acció de delta gran (≥0.08) actua sobre un eix encara proper a zero (poca esmorteïment per inèrcia). Tècnicament correcte i determinista, però pot sentir-se com un salt brusc en lloc d'una decadència gradual visible.
- **Reportat per**: dynasty-builder
- **No corregit** — escalat a `game-designer` per valorar si cal una transició visual/avís.

## Design Concerns

- **Gating de tecnologies universals per cicle d'era, no per generació** (`UNIVERSAL_TECHS`): la Gen 1 només pot arribar a `ut_foc`/`ut_eines`; tecnologies posteriors depenen del cicle global de l'era, no de l'esforç del jugador en aquella generació. Coherent amb un disseny de dinastia multi-generacional, però val la pena confirmar amb `game-designer` que és la intenció (routed: `game-designer`).
- **S2-2 (lock-in d'identitat)** — routed: `economy-designer`.
- **S3-1, S3-2** — routed: `game-designer`.

## Open Points Status

| Item | Status |
|---|---|
| Sistema ACTIVE/FADED/HIDDEN (branch-system.md §3.6) | IMPLEMENTAT — 2 bugs S1 trobats i corregits, 1 bug S2 (ponts no bidireccionals) trobat i corregit |
| Accions pont accessibles des de dues branques (requisit explícit de l'usuari) | CORREGIT per a 3 de 4 casos trencats (`act_practicar_tir`, `act_preparar_ungüent`, `act_modelar_argila`); `act_tallar_flauta` ja estava bé |
| Cap branca queda sense accions executables en cap moment de Gen 1 | CONFIRMAT — accions base sempre ACTIVE, sense dead zones |

## Recommended Next Actions

1. Provar manualment (mòbil/navegador) que els 6 fixes a `data.js` no han introduït cap regressió visual al carrusel d'accions.
2. Decidir amb `economy-designer` si la irreversibilitat pràctica de la inclinació a partir de gen 2-3 (S2-2) és intencionada.
3. Valorar amb `game-designer` un avís de UI per a accions comprades que estan a punt de caure a HIDDEN (S3-1, S3-2).
