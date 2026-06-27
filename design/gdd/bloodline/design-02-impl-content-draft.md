# DESIGN-02-IMPL — Draft de contingut (per revisar)

> **ESTAT: DRAFT — NO IMPLEMENTAT.** Generat 2026-06-27 (sessió autònoma). Specs concretes
> per a les decisions de DESIGN-02 (vegeu `branch-model-redesign.md` §7 i `progression-distribution.md` §9).
> **No s'ha tocat `data.js`.** Revisa, ajusta valors i aprova abans d'implementar.
> Valors de balanç = punts de partida; cal validar amb `/playtest` un cop dins.

---

## 1. Eliminar (Q2)
- `act_narrar_llegendes` i `act_cants_grup` — fora del catàleg. Substituïdes per §2.

## 2. Accions-pont del Místic (3 noves) — substitueixen les eliminades

### 2.1 `act_sacrifici_ritual` — "Sacrifici Ritual" (Místic → Caçador)
- zona: Campament · `inclination_requirements: { espiritualitat: { min: 0.15 } }` · purchase_cost: 0 (lliure)
- output_resource: food, output_min: 2, output_max: 4 · material_min: 1, material_max: 2
- inclination_deltas: `{ impuls: +0.06, espiritualitat: +0.02 }`
- Narrativa: ofereixes part del menjar als esperits per la seva protecció; menys avui, però el clan va fort.
  És un acte de **decisió i risc** → empenta cap al Caçador. **Cobreix la food pròpia del Místic pre-cicle 36.**

### 2.2 `act_curacio_col·lectiva` — "Curació Col·lectiva" (Místic/Social → Recol·lector/Artesà)
- zona: Campament · `{ espiritualitat: { min: 0.12 }, sociabilitat: { min: 0.10 } }` · purchase_cost: 3
- output_resource: health, output_min: 8, output_max: 12 · material_min: 1, material_max: 2
- inclination_deltas: `{ sociabilitat: +0.06, "intel·lecte": +0.03 }`
- Narrativa: curar el grup requereix observació sistemàtica de cada membre. No usa eina, escala menys que
  `act_curar_herbes` però és accessible més aviat.

### 2.3 `act_narrar_territori` — "Narrar el Territori" (Místic → Artesà) — successor de narrar_llegendes
- zona: Campament · `{ espiritualitat: { min: 0.10 }, sociabilitat: { min: 0.08 } }` · purchase_cost: 3
- output_resource: material, output_min: 2, output_max: 4
- inclination_deltas: `{ "intel·lecte": +0.05, espiritualitat: +0.01 }`
- Narrativa: les llegendes sobre llocs sagrats són **cartografia oral**; coneixement = recurs de grup.
  Resol DESIGN-01 (narrar deixa de donar food sense raó → dona material).

## 3. Accions-pont noves per tancar la roda (Q3)

### 3.1 `act_intercanviar_idees` — Caçador → Artesà (proposta de nom)
- zona: Campament · `{ impuls: { min: 0.10 } }` · purchase_cost: 0
- output_resource: material, output_min: 2, output_max: 3
- inclination_deltas: `{ "intel·lecte": +0.06, impuls: -0.02 }`
- Narrativa: un caçador que estudia el rastre i la peça aprèn a **pensar abans d'actuar**; el cos ensenya la ment.

### 3.2 `act_repartir_collita` — Recol·lector → Místic (proposta de nom)
- zona: Campament · `{ sociabilitat: { min: 0.10 } }` · purchase_cost: 0
- output_resource: health, output_min: 3, output_max: 6
- inclination_deltas: `{ espiritualitat: +0.06, sociabilitat: +0.01 }`
- Narrativa: compartir el que s'ha recollit crea un vincle que va més enllà del menjar; el gest obre a allò invisible.

## 4. Dead zone Artesà a `ut_art` (Q1) — nova habilitat

### `bt_mapa_recursos` — "Mapa de Recursos" (SKILL_DEF)
- universal_prereq: `ut_art` · `inclination_conditions: { operator: 'AND', conditions: [{ axis: "intel·lecte", min: 0.20 }] }`
- Narrativa: l'art simbòlic inclou **cartografia, comptatge i mesura**: l'Artesà guanya el seu lloc a l'era de l'art.
- Desbloqueja:
  - `act_gravar_mapa` (lliure, signatura): output material 2–4 · `{ "intel·lecte": +0.05 }` — gravar rutes i jaços.
  - `act_comptar_estacions` (purchase_cost 3): output food 3–5 (preveure millor la collita) · `{ "intel·lecte": +0.04, espiritualitat: +0.01 }`.

## 5. Família de foc del Caçador a `ut_foc` (Q4)

### `bt_carn_al_foc` — "Carn al Foc" (SKILL_DEF)
- universal_prereq: `ut_foc` · `{ operator: 'OR', conditions: [{ axis: "impuls", min: 0.12 }] }`
- Narrativa: el moment icònic Caçador+foc — processar i conservar la presa.
- Desbloqueja:
  - `act_coure_cacera` (lliure): output food 4–7 · `{ impuls: +0.04 }` — coure la presa, més nodriment.
  - `act_fumar_carn` (purchase_cost 3): food_cap_delta +2 (conservar) · `{ impuls: +0.02, "intel·lecte": +0.02 }`.
  - `act_endurir_punta` (purchase_cost 3): millora la llança (output eina o bonus a `act_caca_llanca`) ·
    `{ impuls: +0.05 }` — endurir la punta al foc.
- *(Caça amb foc: `act_batuda_torxa` — empènyer la presa amb torxa — es pot afegir com a acció exclusiva
  d'alt risc/recompensa; opcional, valorar amb playtest.)*

## 6. Reubicar `bt_coneixement_plantes` (Q3 progressió)
- Moure `universal_prereq` de `ut_corda` (c65) → `ut_foc` (c10). Partir el contingut:
  - **A `ut_foc`** (versió bàsica): accions d'arrels/plantes comestibles/infusions simples. Justificació =
    *hipòtesi de la cuina* (el foc fa comestibles plantes crues tòxiques/indigestes).
  - **A `ut_corda`** (versió expandida, habilitat separada o condicionada): bolets, medicinals, pesca.
- Dona al Recol·lector arc narratiu des de Gen 1.

## 7. Nota transversal
- Documentar a la UI/glossari que el **foc és una UT transversal**: cada branca l'aprofita al seu estil
  (Caçador→processar presa, Recol·lector→conservar, Artesà→adhesius/terrissa, Místic→ritual).

---

## Ordre d'implementació suggerit (un cop aprovat)
1. Eliminar narrar_llegendes/cants_grup + afegir les 3 accions-pont Místic (§1-2) — tanca DESIGN-01 food Místic.
2. 2 ponts nous (§3) — roda completa.
3. `bt_mapa_recursos` (§4) i família de foc Caçador (§5) — dead zones.
4. Reubicar coneixement_plantes (§6).
5. Afegir un `check(...)` al harness per cada peça nova (p.ex. accessibilitat per inclinació, deltes).

> **Per a tu**: noms entre cometes ("proposta de nom") i tots els valors numèrics són per ajustar.
> Si vols, ho passo a `era-writer`/`era-historian` per polir la veu narrativa abans d'implementar.
