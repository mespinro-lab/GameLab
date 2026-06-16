# Dynasty-Builder Playtest — Bloodline v2 — visibilitat d'accions per inclinació

**Build**: `prototypes/bloodline-v2/data.js` + `game.js`, commit `97c2c73`
**Focus**: herència d'inclinació, transicions de branca entre generacions, risc de lock-in

## PASS — Herència d'inclinació activa accions immediatament

`continueSuccession()` crida `createCharacter(inheritedInclination, ...)`, que assigna la inclinació heretada directament — sense necessitat que el fill "torni a guanyar-se" cap acció. `getActionVisibility()` només consulta el valor actual d'inclinació, no l'historial d'ús. Si el pare acaba amb `impuls = 0.6`, el fill neix amb `0.6 × INCLINATION_INHERITANCE_RATE` i qualsevol acció amb llindar per sota d'aquest valor és ACTIVE des del cicle 0. Funciona tal com s'esperava pel disseny de continuïtat de llinatge.

## S3 — MEDIUM: les transicions ACTIVE→HIDDEN poden saltar-se l'estat FADED en un sol torn

`applyDelta()` (inèrcia) pot moure la inclinació més de `FADE_MARGIN` (0.05) en una sola acció quan el valor actual és proper a zero (poca inèrcia encara) — p. ex. `act_emboscada_nocturna` (delta brut impuls +0.10) pot moure 0.10 en un torn amb `current≈0`. Si un personatge està just per sobre del llindar ACTIVE i una acció amb delta gran l'empeny cap avall, pot caure directament a HIDDEN sense que el jugador vegi l'estat FADED intermedi en cap frame. No és un bug de lògica (el codi és determinista i correcte), però l'experiència pot sentir-se com un salt brusc en lloc d'una decadència gradual. Afecta sobretot accions amb deltes ≥0.08 quan la inclinació encara és propera a zero.

## S2 — Risc de lock-in d'identitat de llinatge (disseny, no bug)

Amb `INERTIA_FACTOR=2.0` i `INCLINATION_INHERITANCE_RATE=0.85`, un cop un eix supera ~0.5 és pràcticament irreversible dins la vida d'un sol personatge: cada delta nou es divideix per `(1+|current|×2)`, i el fill hereta el 85% del valor ja extrem del pare, partint gairebé del mateix punt d'inèrcia. Exemple: amb `impuls=0.8`, una acció contrària de delta -0.03 només mou -0.0115/torn — calen ~70 torns per revertir a zero, molt per sobre de `LIFE_EXPECTANCY`. **Aquest és exactament el comportament que es buscava** ("un cop et comprometeixes amb una branca, el cost de pivotar és real"), però convé que `economy-designer` confirmi explícitament que la irreversibilitat pràctica a partir de generació 2-3 és la intenció i no una deriva accidental de les constants.

## Confirmat: cap skill desbloquejat queda amb TOTES les seves accions HIDDEN (després de la correcció d'aquesta sessió)

Es van trobar 2 casos on això sí passava abans de la correcció (`bt_calendari_natural`, `bt_marques_territori` — veure informe de `speed-runner.md`, ja corregits a `data.js`). Després de revisar tots els `SKILL_DEFS` amb `operator: "OR"`, la resta de casos sempre deixaven com a mínim una de les dues accions desbloquejades en estat ACTIVE o FADED (mai les dues HIDDEN simultàniament), incloent `bt_construccio_refugis` que, tot i semblar problemàtic a primer cop d'ull, està ben dissenyat: cada acció de la parella cobreix exactament una branca de l'OR.

## Recomanacions

- Escalar a `economy-designer`: confirmar si la irreversibilitat pràctica de la inclinació a partir de gen 2-3 és la intenció de disseny.
- Escalar a `game-designer`: valorar si cal una transició visual (animació o avís) quan una acció compromesa passa de ACTIVE a HIDDEN en un sol torn, per evitar que es llegeixi com un bug.
