# Playtest Report — Optimizer — Bloodline v2 — 2026-06-14

**Fitxers analitzats**: `prototypes/bloodline-v2/game.js`, `prototypes/bloodline-v2/data.js`
**Perspectiva**: Min-max, exploits, estratègies degenerades

---

## [V2-01] Reputació acumula sense cap ni efecte — 15+ accions amb output mort

Totes les accions amb `output_resource: "reputacio"` acumulen `state.reputacio` indefinidament (no hi ha `REPUTACIO_PER_CHAR_CAP` aplicat — la constant existeix però no es referencia a game.js). El recurs no contribueix a `calculateScore()`, no apareix al HUD com a indicador útil, i `applyEventEffects` descarta silenciosament els deltes d'events de reputació. 15+ accions produeixen output mort. **Impacte: Medium**.

---

## [V2-02] act_gran_ritual: `requires` duplicat (bug latent)

`data.js` línies 1266–1268: clau `requires` declarada dues vegades. Idèntiques ara, però qualsevol futura edició de la primera s'ignorarà. **Impacte: Low (bug latent)**.

---

## [V2-03] Herència d'inclinació 85% regala el gate de branca a Gen 2

Gen 1 construeix impuls a ≥ 0.22 (~6-8 usos d'espiar_ramat). Successió: Gen 2 neix amb `impuls = 0.22 × 0.85 = 0.187`, que ja compleix el threshold Caçador (0.18). La branca activa des del primer cicle de Gen 2 sense cap acció. El loop "explorar eix → activar branca" s'elimina per a les generacions hereves. **Suggeriment**: reduir `INCLINATION_INHERITANCE_RATE` a 0.65–0.70. **Impacte: Medium**.

---

## [V2-04] getFormingBranch() cega per a Caçador i Recol·lector

`getFormingBranch()` (game.js:1153–1159): `if (cond.min !== undefined && cond.min > 0) pct = Math.min(pct, val / cond.min)`. Condicions sense `min` (ex: `sociabilitat max: 0.40` a Caçador) no actualitzen `pct`. `if (violated || pct === Infinity) continue` salta la branca. Resultat: Caçador i Recol·lector mai apareixen com a "en formació". Místic (dues condicions min) sí funciona. **Impacte: Medium (UX/feedback)**.

---

## [V2-05] act_emboscada_nocturna: -14 health per ús, 3 usos = mort garantida

`side_effects: [{ resource: 'health', delta: -14 }]`. Spam de 2 usos: -28 health. Tercer ús: mort. L'acció és accesible a Gen 2+ (on `ut_eines` pot arribar mentre el personatge té edat < 12). El -14 no té avís addicional visible al carrusel fins obrir la info. **Impacte: Medium (risc desorientador)**.

---

## [V2-06] act_coure_ceramica genera material net: late-game trivialitzat

`act_coure_ceramica` (bt_terrissa, cicle 80): `output_resource: "material"`, `output_min: 2`, `output_max: 4`, sense `execute_cost`. Convertir pedra acumulada via `act_faonar_eines` + `act_coure_ceramica` permet omplir el material (cap 35) en 5-10 torns, comprar tot el catàleg restant. **Impacte: Medium (late-game trivialitzat)**.

---

## [V2-07] Mystic/Social path: scoring 0 contribució extra

`calculateScore()`: cicles × 2 + genScore + techs × 100 + skills × 30 + branches × 40 + heirBonus. Cap factor influenciat per reputació ni per accions socials/místiques. Un jugador Místic i un de pura supervivència amb mateix nombre de tècniques obtenen puntuació idèntica. 15+ accions de reputació no compensen en scoring. **Impacte: High (diferenciació de playstyle eliminada)**.

---

## [V2-08] Destresa rush cicle 15: DESTRESA_MAX = 3 de 5 possibles

Omplir les 3 ranures amb d_rastreig + d_botanica + d_talla_silex (cicles 1–15) bloqueja permanentment d_custodi_foc i d_guardia → bloqueja act_gran_ritual i act_defensa_activa per sempre. No hi ha avís pre-bloqueig. La herència 60% pot no alliberar ranures si el fill hereta les mateixes 3. **Impacte: Medium**.

---

## [V2-09] Loop pedra → faonar: millor font de material sense cost de food

`act_recollectar_pedra` (Planes, gratuïta) + `act_faonar_eines` (Campament, `pedra -2`, `material +4/+7`): genera 2× material que qualsevol acció estàndard. 5 cicles alternant les dues accions = cap de material (35) sense gastar food. Trivialitza la compra d'accions. **Impacte: Medium**.

---

## [V2-10] Skills heretades sense re-check d'inclinació

`continueSuccession()` hereta habilitats via probabilitat `inheritanceRate` sense verificar que la inclinació heretada satisfaci els requisits de la habilitat. Un fill pot tenir `bt_pintura_rupestre` (requereix `espiritualitat ≥ 0.30`) amb inclinació heretada `0.30 × 0.85 = 0.255`. Trenca coherència narrativa. **Impacte: Low-Medium**.

---

## [V2-11] foodUpkeepReduction: doble protecció fràgil

`act_assecar_provisions` (`food_upkeep_delta: -0.3`, `max_executions: 3`) redueix upkeep en 0.9 total. El sistema té doble protecció (`min(FOOD_UPKEEP - 0.5, ...)` + `max(0.5, ...)`), però si alguna s'elimina per manteniment l'upkeep podria arribar a 0. **Impacte: Low (bug latent)**.

---

## [V2-12] Mort intencionada cicle 12 dona més punts que viure 20 cicles

Estratègia A (vida completa, Gen 1): cicles(40) + genScore(50) + heirBonus(20) = 110.
Estratègia B (mort cicle 12, Gen 2 completa): cicles(24+40=64) + genScore(30+50=80) + heirBonus(20+20=40) = 184. La mort intencional per avançar generacions és l'estratègia de scoring òptima — contraèpica per a un joc de dynasties. **Impacte: Medium (design concern)**.

---

## Resum

| ID | Títol | Impacte |
|----|-------|---------|
| V2-01 | Reputació output mort | Medium |
| V2-02 | gran_ritual requires duplicat | Low (latent) |
| V2-03 | Herència 85% regala gate Gen 2 | Medium |
| V2-04 | Ghost pill cega Caçador/Recol·lector | Medium (UX) |
| V2-05 | Emboscada nocturna spam = mort | Medium |
| V2-06 | Ceramica material loop late-game | Medium |
| V2-07 | Mystic/Social scoring = 0 | **High** |
| V2-08 | Destresa rush cicle 15 | Medium |
| V2-09 | Pedra→faonar millor loop | Medium |
| V2-10 | Skills heretades sense re-check | Low-Medium |
| V2-11 | foodUpkeepReduction doble-cap fràgil | Low (latent) |
| V2-12 | Mort intencional > viure en scoring | Medium |
