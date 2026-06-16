# Speed-Runner Playtest — Bloodline v2 — visibilitat d'accions per inclinació

**Build**: `prototypes/bloodline-v2/data.js` + `game.js`, commit `97c2c73`
**Focus**: regressió del nou sistema `ACTION_INCLINATION_REQUIREMENTS` / `getActionVisibility()` (ACTIVE/FADED/HIDDEN)

## S1 — BLOCKING: desbloquejar un skill amb condició OR no garanteix que les seves accions quedin ACTIVE

Per a tot `SKILL_DEFS` amb `inclination_conditions.operator === "OR"`, si l'eix que satisfà l'OR és diferent de l'eix que exigeix l'acció desbloquejada a `ACTION_INCLINATION_REQUIREMENTS`, l'acció pot aparèixer HIDDEN/FADED en el mateix moment de desbloquejar l'habilitat — contradient el toast "Nova habilitat desbloquejada".

**Casos pitjors confirmats (totes dues accions desbloquejades queden afectades):**
- `bt_calendari_natural` — OR(intel·lecte≥0.18, espiritualitat≥0.20) → `act_observar_cel` i `act_transit_nocturn` (totes dues exigien espiritualitat). Desbloquejar via intel·lecte amb espiritualitat=0 deixava ambdues HIDDEN.
- `bt_marques_territori` — OR(impuls≥0.20, intel·lecte≥0.18) → `act_marcar_territori` i `act_rastreig_rutes` (totes dues exigien impuls≥0.10). Desbloquejar via intel·lecte amb impuls=0 deixava ambdues HIDDEN.

**Casos menors (una de les dues accions sempre queda ACTIVE, l'altra pot fer FADED/HIDDEN):** `bt_rasclador_fi`, `bt_guardia_flama`, `bt_ornaments`, `bt_adobament_pells`, `bt_pigments_tintures`, `bt_pesca`, `bt_narracio_oral`, `bt_construccio_refugis` (aquest últim, revisat amb detall, és en realitat correcte per disseny — cada acció cobreix una branca de l'OR).

**Estat**: CORREGIT en aquesta sessió. S'ha eliminat el requisit d'inclinació de l'acció "pont/lleugera" de cada parella problemàtica (`act_observar_cel`, `act_marcar_territori`), deixant-la sempre ACTIVE un cop comprat el skill, mentre l'acció "avançada" de la parella manté el seu requisit (continua fent fade/reactivate amb la inclinació, que és el comportament desitjat). També s'ha simplificat `act_explicar_orígens` (eliminat el requisit d'espiritualitat no garantit per `bt_narracio_oral`).

## S2 — HIGH: accions "pont" no eren realment bidireccionals

De les accions marcades com a "pont" als comentaris, només `act_tallar_flauta` (AND intel·lecte+espiritualitat, ambdós llindars per sota dels del skill que la desbloqueja) complia el disseny original de "pont accessible des de dues branques". Les altres usaven un únic eix, que en la pràctica les feia accessibles només des d'UNA branca:

- `act_practicar_tir` (pont caçador/artesà): només testava impuls — invisible per un Artesà pur.
- `act_preparar_ungüent` (pont místic/artesà): només testava espiritualitat — invisible per un Artesà pur.
- `act_modelar_argila` (pont artesà/místic): només testava intel·lecte — invisible per un Místic pur.
- `act_observar_cel` (pont místic/artesà): mateix problema, ja cobert a S1.

**Estat**: CORREGIT — s'ha eliminat el requisit d'inclinació d'aquestes 3 accions pont (`act_practicar_tir`, `act_preparar_ungüent`, `act_modelar_argila`), de manera que un cop el skill corresponent es desbloqueja (per qualsevol branca de l'OR/AND), l'acció pont queda sempre ACTIVE — això és coherent amb la seva funció de "pont" (no hauria de fer fade mai, és precisament l'acció que manté la transició suau entre branques).

## S3 — MEDIUM: `bt_trampes` — finestra estreta entre desbloqueig i pèrdua per inèrcia

`bt_trampes` (impuls≥0.10) desbloqueja `act_parar_trampes`/`act_revisar_trampes` (impuls≤0.35). Un jugador que segueix desenvolupant Caçador després de desbloquejar-ho pot superar 0.35+marge en pocs usos d'accions de caça intenses, fent que l'acció "desaparegui" (HIDDEN) tot i haver-la comprat. Comportament correcte pel disseny (les accions desbloquejades poden fer fade si t'allunyes massa), però sense cap avís a la UI. **No corregit aquesta sessió** — escalat a `game-designer`/`economy-designer` per valorar si cal un avís visual abans que una acció comprada caigui a HIDDEN.

## S3 — MEDIUM: gating de tecnologies universals és per cicle d'era (no per generació)

`UNIVERSAL_TECHS` es desbloqueja per `state.cycle` (comptador d'era, mai es reinicia entre generacions). Confirmat: la Gen 1 només pot arribar a `ut_foc`/`ut_eines`; la resta de tecnologies (`ut_art`, `ut_vestimenta`, `ut_corda`, `ut_ceramica`, `ut_agricultura`) depenen de quanta era ha transcorregut, no de l'esforç del jugador. Consistent amb un disseny de "dinastia de diverses generacions", però val la pena confirmar amb `game-designer` que és la intenció.

## Confirmat correcte (sense canvis)

- Cap acció base de supervivència té requisit d'inclinació — sempre ACTIVE, sense "dead zone" a l'inici de cap generació.
- La distinció visual FADED (`zc-faded`, vora puntejada) vs. HIDDEN (exclosa del carrusel) funciona tal com especificat a `getZoneActions()` / `buildCarouselItems()` / `executeAction()`.
- Tots els skills amb `operator: "AND"` (excepte `bt_narracio_oral`, ja corregit) tenen requisits d'acció estrictament més laxos que la pròpia condició del skill — garantit ACTIVE en desbloquejar.
