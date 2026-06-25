# Bloodline — Distribució de Progressió i Model Econòmic de l'Era 1

> **ESTAT**: PROPOSTA — Revisió pendent d'aprovació. Basada en l'anàlisi del
> prototip `prototypes/bloodline-v2/` + playtests 2026-06-17 i 2026-06-19.
> Correspon a **DESIGN-02 (Part 2)**.
>
> **Font de veritat del codi**: `prototypes/bloodline-v2/data.js` +
> `prototypes/bloodline-v2/game.js`

**Depèn de**: `action-economy.md`, `branch-system.md`, `era-system.md`
**Usat per**: disseny de contingut Era 1, `economic-model.md` (pendent)

---

## 1. Overview

Aquest document formalitza:

1. La cadena de dependències **Tecnologia Universal → Habilitat (SKILL_DEF) → Acció** i com s'ha d'estructurar perquè sigui llegible i coherent.
2. La **distribució temporal** d'habilitats i accions al llarg dels ~100 cicles de l'Era 1, amb granularitat per branca i per generació, i identificació de *dead zones* (trams sense contingut nou disponible).
3. El **model econòmic de material**: com encaixen la generació de material (totes les accions) i el seu consum (compra d'accions al Mercat) amb el pressupost de cicles per generació (~20 cicles × ~20 accions per vida).
4. **Recomanacions de re-distribució i re-balanç** en rang de valors.

L'objectiu mesurable és que cada generació (Gen 1–5) tingui almenys una acció nova comprable al Mercat que no estava disponible a la generació anterior, i que cap generació arribi al Mercat sense material suficient per comprar-la.

---

## 2. Player Fantasy (d'aquest sistema)

*"Cada generació hereva el que el llinatge ha aconseguit i descobreix quelcom nou que els seus avantpassats mai van poder fer."*

El jugador ha de sentir que el cicle de vida d'un personatge és curament calibrat: prou temps per aprofundir en una branca, però no tant com per exhaurir tot el contingut de l'era en una sola vida. La sensació de "mai arribo a tot" és intencionada i ha de conviure amb la sensació de "cada vida avança el llinatge una mica més".

---

## 3. Regles Detallades

### 3.1 Cadena de Dependències: la Fórmula de Desbloqueig

La cadena completa que governa quan un jugador pot **executar** una acció nova és:

```
Cicle N ≥ ut.cycle
  → autoDiscoverUniversalTechs() marca ut com descoberta
  → SKILL_DEFS elegibles = skill.universal_prereq == ut.id
                           AND evaluateConditions(skill.inclination_conditions)
                           AND skill no desbloquejada
  → Jugador executa act_escoltar_estrangers (discovery action)
  → unlockSkill() → accions sense purchase_cost s'afegeixen automàticament
                 → accions amb purchase_cost apareixen al Mercat com a comprables
  → Jugador acumula material
  → Jugador compra l'acció al Mercat (state.material -= purchase_cost)
  → Acció disponible per executar
```

**Observació crítica**: hi ha **dues portes** entre la UT i l'execució d'una acció de branca:
- **Porta 1** — condicions d'inclinació del SKILL_DEF (prerequisit per desbloquejar l'habilitat)
- **Porta 2** — purchase_cost de l'acció (prerequisit per usar-la un cop desbloquejada)

Les accions sense `purchase_cost` (*accions lliures*) salten la Porta 2: es concedeixen directament en desbloquejar l'habilitat.

**Regla de coherència (proposta)**:

| Tipus d'acció | Porta 2 recomanada |
|---|---|
| Acció de fabricació d'eina (tool_action) | `purchase_cost: 3` — eina nova implica inversió |
| Acció de consum d'eina o recurs (requires eina/pedra) | `purchase_cost: 3–4` — alta utilitat |
| Acció d'output de food/health sense risc especial | `purchase_cost: 3` |
| Acció d'output de food/health d'alt valor (> 8 EV) | `purchase_cost: 4–5` |
| Acció purament de material/inclinació (progressió pura) | `purchase_cost: 0` (lliure) — la barrera és la inclinació, no el material |
| Acció d'upgrade (is_upgrade: true) | `purchase_cost: 6–8` — requereix destresa/aprenentatge |

**Proposta de regla de llegibilitat**: tota habilitat (SKILL_DEF) hauria de desbloquejar com a mínim **una acció lliure** (la seva acció "signatura" que demostra la tècnica) i fins a dues accions de pagament (les aplicacions concretes). Exemple:

```
bt_rasclador_fi (ut_eines, cicle 16)
  → act_molda_grans:      purchase_cost: 3  (consum directe → food)
  → act_faonar_eines:     purchase_cost: 3  (fabricació eina)
  → act_treballar_estris: purchase_cost: 4  (consum eina → food millorat)
```

En comptes d'una sola acció cara, l'habilitat dona una decisió immediata i barata + una inversió posterior. Així el jugador veu progrés immediat i té un objectiu de mig termini.

---

### 3.2 Mapa de Distribució Temporal per Generació

#### 3.2.1 Paràmetres base (del codi actual)

| Paràmetre | Valor | Font |
|---|---|---|
| `ERA_CYCLES` | 100 | `data.js:8` |
| `LIFE_EXPECTANCY` | 20 | `data.js:9` |
| Generacions esperades | ~5 (100/20) | derivat |
| Tecnologies universals | 7 | `UNIVERSAL_TECHS`, `data.js:250–286` |
| Habilitats (SKILL_DEFs) | 33 | `SKILL_DEFS`, `data.js:288–564` |
| Accions de branca amb `purchase_cost` | ~55 | `ACTIONS` auditat |
| Accions base (sense purchase) | 9 | `ACTIONS.is_base` |

#### 3.2.2 Cicles de les Tecnologies Universals i la seva finestra

| UT ID | Cicle | Generació típica | Habilitats dependents (SKILL_DEFs) |
|---|---|---|---|
| `ut_foc` | 10 | Gen 1 (tard) | bt_cuina_conservacio, bt_guardia_flama, bt_guariment_plantes, bt_adhesius (×4) |
| `ut_eines` | 16 | Gen 1 (final) / Gen 2 (inici) | bt_punta_llanca, bt_rasclador_fi, bt_buri, bt_eines_cerimonials, bt_musica_os, bt_calendari_natural (×6) |
| `ut_art` | 36 | Gen 2 | bt_pintura_rupestre, bt_marques_territori, bt_ornaments, bt_narracio_oral (×4) |
| `ut_vestimenta` | 50 | Gen 2 (final) / Gen 3 | bt_agulla_os, bt_adobament_pells, bt_pigments_tintures (×3) |
| `ut_corda` | 65 | Gen 3 | bt_trampes, bt_arc_fletxes, bt_coneixement_plantes, bt_nusos_sagrats, bt_pesca (×5) |
| `ut_ceramica` | 70 | Gen 3 (tard) / Gen 4 | bt_llavor_selectiva, bt_domini_terra, bt_intercanvi_troc, bt_terrissa (×4) |
| `ut_agricultura` | 85 | Gen 4 (tard) / Gen 5 | bt_sembra_collita, bt_domesticacio_animals, bt_construccio_refugis, bt_ritus_sembra (×4) |

*Nota: una generació neix al cicle `state.cycle` en el moment de la successió; la generació N arriba al final de vida al voltant del cicle `birthCycle + LIFE_EXPECTANCY`. Amb LIFE_EXPECTANCY = 20 i 5 generacions, les successions cauen aproximadament als cicles 20, 40, 60, 80.*

#### 3.2.3 Distribució de contingut per generació (ESTAT ACTUAL)

La taula mostra quines UT es descobreixen durant la vida activa de cada generació i quants SKILL_DEFs/accions-de-pagament es fan disponibles:

| Generació | Cicles actius (aprox.) | UTs que arriben | SKILL_DEFs desblocables | Accions-Mercat noves potencials |
|---|---|---|---|---|
| Gen 1 | 0–20 | ut_foc (c10), ut_eines (c16) | fins a 10 | fins a ~20 |
| Gen 2 | 20–40 | ut_art (c36) | fins a 4 | fins a ~8 |
| Gen 3 | 40–60 | ut_vestimenta (c50), ut_corda (c65→tard) | fins a 8 | fins a ~16 |
| Gen 4 | 60–80 | ut_corda (c65), ut_ceramica (c70) | fins a 9 | fins a ~18 |
| Gen 5 | 80–100 | ut_agricultura (c85) | fins a 4 | fins a ~8 |

**Problema identificat — Desequilibri de densitat**: Gen 1 és excessivament rica en contingut nou (10 habilitats potencials en 20 cicles), mentre Gen 2 té un desert relatiu (cicles 20–35: cap UT nova fins al cicle 36). Les habilitats de `ut_eines` es desbloqueig als cicles 16–20, exactament a la transició Gen 1/Gen 2, i les accions les pagarà en la majoria dels casos Gen 2.

#### 3.2.4 Dead Zones identificades

**Dead Zone confirmada pel playtest: cicles 6–16 (pre-ut_eines)**

Durant els cicles 6–16, el jugador disposa exclusivament de:
- 9 accions base
- `act_ritual_foc` (ut_foc, cicle 10, purchase_cost: 4)
- `act_assecar_provisions` (ut_foc, cicle 10, purchase_cost: 5)
- Accions de les 4 habilitats de `ut_foc` (si l'inclinació és adequada)

Si el jugador no té inclinació adequada per a cap habilitat de `ut_foc` (p.ex. perfil Caçador pur, impuls alt + socialitat baixa), els cicles 10–16 no li ofereixen cap acció nova al Mercat. Sis cicles sense res a comprar.

**Dead Zone secundària: cicles 20–35 (post-eines, pre-art)**

Generació 2 (cicles ~20–40) arriba a un panorama estancat entre cicle 20–35:
- Les habilitats de `ut_eines` es van desbloquejar a la fin de Gen 1 (cicles 16–20)
- Gen 2 comença amb les accions heretades + les que compri del pool `ut_eines`
- La propera UT (`ut_art`) no arriba fins al cicle 36
- **16 cicles sense nova UT** → si el jugador ja ha comprat les accions prioritàries de `ut_eines`, no hi ha res nou al Mercat fins al c36

**Dead Zone terciària: cicles 65–70 (entre ut_corda i ut_ceramica)**

Només 5 cicles, però coincidint amb el canvi de generació Gen 3→4, pot deixar un buit si Gen 3 mor al cicle 60 i Gen 4 no veu cap nova UT fins al c65.

---

### 3.3 Distribució per Branca: Dead Zones Específiques

A continuació es detallen els trams en que cada branca no té cap acció nova disponible per comprar (suposa que el jugador ja té les habilitats actives i ha comprat les accions previes).

#### Caçador (eix: impuls)

| Tram | Contingut disponible | Dead zone? |
|---|---|---|
| c0–c9 | Accions base (espiar_ramat) | No (accions base funcionen) |
| c10–c15 | 0 habilitats Caçador a ut_foc | **Sí** — ut_foc no dona res al Caçador pur |
| c16–c35 | bt_punta_llanca (3 accions), bt_marques_territori via ut_art (c36) | Parcialment: 3 accions de una sola habilitat |
| c36–c49 | bt_marques_territori (2 accions) | Lleu — 2 accions noves |
| c50–c64 | bt_adobament_pells (2), bt_agulla_os (2 si inclinació) | Moderat — 4 accions |
| c65–c79 | bt_arc_fletxes (2), bt_trampes (2), bt_pesca (2) | Ric |
| c80–c100 | bt_domesticacio_animals (2), bt_construccio_refugis (2) | Moderat |

**Conclusió Caçador**: dead zone confirmada cicles 10–15. El Caçador no rep cap benefici de `ut_foc` tret d'`act_alimentar_foc` (guardia_flama, OR de condicions, accessible si impuls ≥ 0.15). Recomanació: afegir una habilitat de `ut_foc` que encaixi amb el perfil Caçador (veure §3.5).

#### Recol·lector (eix: sociabilitat)

| Tram | Contingut disponible | Dead zone? |
|---|---|---|
| c0–c9 | Accions base | No |
| c10–c15 | bt_cuina_conservacio (OR, accessible), bt_guardia_flama | Lleu |
| c16–c35 | bt_rasclador_fi (3 accions), bt_coneixement_plantes → pendent ut_corda (c65!) | **Parcialment** — bt_rasclador_fi ok, però bt_coneixement_plantes no arriba fins al c65 |
| c36–c49 | bt_ornaments (3 accions), bt_narracio_oral (2) | Ric |
| c50–c64 | bt_pigments_tintures (2) | Lleu |
| c65–c79 | bt_trampes (2), bt_coneixement_plantes (3), bt_pesca (2) | Ric |
| c80–c100 | bt_llavor_selectiva (3), bt_intercanvi_troc (2) | Moderat |

**Conclusió Recol·lector**: millor cobert que el Caçador, però `bt_coneixement_plantes` (que semblaria una habilitat natural Gen 1–2) no arriba fins al cicle 65 (`ut_corda`). Considerar avançar-la a `ut_art` (c36) o `ut_eines` (c16).

#### Artesà (eix: intel·lecte)

| Tram | Contingut disponible | Dead zone? |
|---|---|---|
| c0–c9 | act_tallar_pedra (base), act_recollectar_pedra (base) | Funcional però escàs |
| c10–c15 | bt_cuina_conservacio (AND intel·lecte ≥ 0.15, accessible), bt_adhesius (AND intel·lecte ≥ 0.20) | Moderat |
| c16–c35 | bt_rasclador_fi (3 acc), bt_buri (2 acc), bt_musica_os (2 acc), bt_calendari_natural (2 acc) | **Ric** — 9 accions potencials |
| c36–c49 | 0 habilitats d'Artesà a ut_art | **Dead zone** — ut_art dona habilitats de Místic/Social; cap per a l'Artesà pur |
| c50–c79 | bt_agulla_os (2), bt_adobament_pells (2) via ut_vestimenta | Moderat |
| c65–c79 | bt_arc_fletxes (parcialment), bt_pesca (parcialment) | Pont |
| c70–c100 | bt_terrissa (2), bt_sembra_collita (2), bt_construccio_refugis (2) | Moderat |

**Conclusió Artesà**: la dead zone cicles 36–49 (post-ut_eines, durant tota ut_art) és estructural. L'Artesà no té cap habilitat derivada de `ut_art`. Impacte: Gen 2 Artesà (cicles ~20–40) no veu res nou entre cicle 20–50. Recomanació: afegir una habilitat de `ut_art` per a l'Artesà (veure §3.5).

#### Místic (eix: espiritualitat)

| Tram | Contingut disponible | Dead zone? |
|---|---|---|
| c0–c9 | act_contemplacio (base), act_vigilar_campament (base) | Escàs de food (veure BRN-03) |
| c10–c15 | bt_guariment_plantes (2 acc), bt_guardia_flama (2 acc), bt_eines_cerimonials (2 acc pre-ut_eines) | Moderat |
| c16–c35 | bt_eines_cerimonials (2 acc, ut_eines), bt_musica_os (2 acc) | Lleu — 4 accions |
| c36–c49 | bt_pintura_rupestre (2 acc), bt_ornaments (3 acc), bt_narracio_oral (2 acc) | **Ric** |
| c50–c64 | bt_pigments_tintures (2 acc) | Lleu |
| c65–c79 | bt_nusos_sagrats (2 acc), bt_pesca (parcialment) | Moderat |
| c70–c100 | bt_ritus_sembra (2 acc), bt_intercanvi_troc (parcialment) | Moderat |

**Conclusió Místic**: la millor cobertura de totes les branques als cicles 36–49 (ut_art és la seva era). El problema és el tram inicial cicles 0–9: food crític (BRN-03 del playtest). No és una dead zone de compra sinó de supervivència.

---

### 3.4 Pressupost Econòmic de Material

#### 3.4.1 Generació de material per cicle (estat actual)

Totes les accions generen material. La fórmula actual és:
```
material_generat = randInt(material_min ?? 2, material_max ?? 3) + elderBonus + aprMatBonus
```

On `elderBonus = 1` si `characterAge() >= 11` (la meitat final de la vida).

Per a una vida de 20 cicles, estimant que el jugador executa 1 acció/cicle:

| Fase de vida | Cicles | material_min típic | material_max típic | Material esperat |
|---|---|---|---|---|
| Jove (0–10) | 10 | 2 | 3 | EV = 2.5 × 10 = **25** |
| Elder (+elderBonus, 11–20) | 10 | 3 | 4 | EV = 3.5 × 10 = **35** |
| **Total vida** | **20** | — | — | **~60 material** |

A aquest total cal restar el `inheritDecay: 0.3` de material en successió: el fill rep `floor(material_pare × 0.3)`.

Exemple:
- Gen 1 acumula 60 material, n'ha gastat per comprar accions.
- Si al final de Gen 1 queden 20 material, Gen 2 comença amb `floor(20 × 0.3) = 6`.

**Observació de disseny: sumidors de material insuficients (confirmat al playtest)**

El playtest va detectar que quasi tota acció dona `material_min ?? 2`, fet que genera un flux constant de material sense sumidors equivalents. Amb cap de 35 i accions típiques comprades als primers 10 cicles (5 accions × 3 cost mig = 15 material), el personatge arriba al cap ràpidament i el material generat es perd per `min()`.

**Quantificació del problema**:
- Flux d'entrada: ~2.5–3.5 material/cicle
- Flux de sortida (accions de Mercat): esporàdic (0 la majoria de cicles, 3–5 en cicles de compra)
- Cap de material: 35
- Material perdut per cicle un cop al cap: ~2.5 material/cicle

Efecte: ~15–20 cicles de vida "saturada" on el material generado es perd completament.

#### 3.4.2 Pressupost per generació: pot comprar el que vol?

La pregunta clau és: pot cada generació comprar les accions que arriben amb la seva UT sense quedar-se sense material?

Assumint un escenari model (branca única, inclinació ben establerta):

| Generació | Material disponible al inici | Accions noves comprables (aprox.) | Cost total estimat | Viable? |
|---|---|---|---|---|
| Gen 1 (hereda 0) | Genera ~25 (jove) + 35 (elder) = 60 | 4–6 accions × 3.5 mig = ~18 | 60 vs 18 | Sí, sobra molt |
| Gen 2 (hereda ~6) | 6 + 60 = 66 | 2–4 accions × 3.5 = ~11 | 66 vs 11 | Sí, sobra molt |
| Gen 3 (hereda ~6) | 66 típic | 4–6 accions × 4 = ~20 | Sí | — |
| Gen 4 (hereda ~6) | ~66 | 4–6 accions × 4 = ~20 | Sí | — |
| Gen 5 (hereda ~6) | ~66 | 2–4 accions × 4 = ~14 | Sí | — |

**Conclusió**: el pressupost de material és generós. L'estrangulament **no existeix** — el jugador sempre té material suficient per comprar tot el que vol. Això té dues conseqüències:

1. **Positiva**: no hi ha frustració per manca de material per comprar accions.
2. **Negativa**: el material perd significat estratègic. La decisió de compra mai és real perquè sempre hi ha material de sobra. El joc es buida d'una palanca de tensió.

#### 3.4.3 El cap de 35 és massa baix?

El cap actual de 35 (`RESOURCE_DEFS` → `material.max: 35`) combinat amb un flux de 2.5–3.5/cicle significa que el personatge arriba al cap als cicles 10–14 de la seva vida i el mantindrà ple la resta. La compra d'accions el drena breument, però es recupera en 2–4 cicles.

**Efecte del cap baix + decay 0.3**: el llinatge perd el 70% del material acumulat en cada successió. Combinat amb el flux ràpid de regeneració, el resultat és que cada generació "recomença" econòmicament, el que redueix la sensació de progrés dinàstic de l'acumulació de material.

---

### 3.5 Recomanacions de Re-Distribució i Re-Balanç

Les recomanacions següents son propostes en rang de valors, no implementació. El dissenyador ha d'avaluar l'impacte narratiu de cada canvi.

#### R1 — Cobrir la dead zone Caçador cicles 10–15

**Problema**: el Caçador no té cap habilitat a `ut_foc`.

**Opció A** (addició mínima): afegir una nova habilitat a `ut_foc` per al Caçador:
- Nom proposta: `bt_foc_campament` o similar
- Condicions d'inclinació: `impuls ≥ 0.12` (accessible al Caçador primerenc)
- Accions desbloqueig: 1 acció lliure + 1 acció de pagament
- La `bt_guardia_flama` actual (condicions OR, molt accessible) ja dona suport parcial, però el Caçador pur (impuls alt, sociabilitat baixa) no la tria com a prioritat

**Opció B** (re-condicionament): abaixar el llindar d'inclinació d'una habilitat de `ut_foc` existent perquè sigui accessible al Caçador:
- `bt_guardia_flama`: condicions actuals `OR [impuls ≥ 0.15, intel·lecte ≥ 0.15, sociabilitat ≥ 0.15]`
- Ja accessible amb impuls ≥ 0.15 — el Caçador a cicle 10 hauria de tenir impuls > 0.15 si ha executat `act_espiar_ramat` (+0.05/cop)
- Si la dead zone persisteix, simplificar a `impuls ≥ 0.10`

**Recomanació**: Opció B primer. Si no es suficient, considerar Opció A.

#### R2 — Cobrir la dead zone Artesà cicles 36–49 (ut_art)

**Problema**: `ut_art` dona 4 habilitats (pintura, marques, ornaments, narració oral), totes orientades a Místic/Social. Cap per a l'Artesà (intel·lecte alt, impuls baix).

**Opció A**: afegir una nova habilitat a `ut_art` per a l'Artesà:
- Nom proposta: `bt_gravat_sistematic` o `bt_mapa_recursos`
- Narrativa: l'art permet crear representacions de territori, instruments de mesura, o sistemes de comptatge
- Condicions: `intel·lecte ≥ 0.20`
- Accions: 1–2 accions d'artesania/exploració

**Opció B**: avançar `bt_adobament_pells` (ara a `ut_vestimenta`, cicle 50) a `ut_art` (cicle 36) amb condicions mixtes:
- Canvi: `universal_prereq: "ut_art"` + condicions que incloguin intel·lecte
- Risc: desplazar contingut de `ut_vestimenta` que ja cobreix adequadament Gen 3

**Recomanació**: Opció A. `ut_art` com a era de l'expressió simbòlica hauria de tenir una branca artesanal (l'art de la mesura, el sistema de compte, la cartografia nascent).

#### R3 — Avançar bt_coneixement_plantes

**Problema**: `bt_coneixement_plantes` (habilitat natural del Recol·lector, inclou accions com Recollida de Bolets) és prerequisit de `ut_corda` (cicle 65). Narrativament, el coneixement de plantes és una competència paleolítica bàsica, no tardana.

**Proposta**: moure `bt_coneixement_plantes` a `ut_foc` (cicle 10) o `ut_art` (cicle 36):
- Si a `ut_foc`: disponible des de Gen 1; la narrativa és "el foc permet cuinar noves plantes → incentiva l'estudi de plantes"
- Si a `ut_art`: disponible Gen 2; la narrativa és "el pensament simbòlic permet catalogar les plantes"
- Riscos: desplaça contingut de `ut_corda`; cal redistribuir les accions actuals entre `ut_corda` i la nova UT

**Recomanació**: moure a `ut_foc` (cicle 10). Retenir a `ut_corda` la versió expandida (bolets, pesca, etc.) i posar a `ut_foc` les accions bàsiques de plantes (arrels, infusions simples). Permet al Recol·lector tenir un arc narratiu coherent des de Gen 1.

#### R4 — Redistribuir el pes de Material: dels sumidors escassos a sumidors nous

**Problema**: el material s'acumula fins al cap ràpidament perquè les accions generen 2–3/cicle però les compres son esporàdiques.

**Opcions**:

**Opció A** (augmentar sumidors d'execució): algunes accions haurien de tenir `requires: [{ resource: 'material', min: 1 }]` i `side_effects: [{ resource: 'material', delta: -1 }]` — és a dir, gasten material en executar-les. Exemples candidats:
- `act_alimentar_foc`: ja gasta `side_effect material: -1`
- `act_torxa_escolta`: ja gasta `material: -1`
- Candidats nous: `act_destillar_quitra` (artesania complexa), `act_cerimonia_eines` (ritual social)
- Rang proposat: afegir 3–5 accions de branca amb cost de material en execució (cost: 1–2 material)

**Opció B** (abaixar `material_min` base a 1): reduir el flux de material a la meitat:
- Accions base: `material_min: 1, material_max: 2`
- Accions de branca normals: `material_min: 1, material_max: 3`
- Accions d'alt output (food > 8 EV): `material_min: 2, material_max: 4` (sense canvi)
- Efecte: EV material per vida baixa de ~60 a ~35–40, el que encaixa millor amb el cost total de compres

**Opció C** (augmentar el cap de material): pujar de 35 a 50–60. Permet acumular més entre successions, donant valor al `inheritDecay: 0.3` (ara heredes ~6, amb cap 60 heredes ~18 si el pare mor ric).

**Recomanació**: combinar Opció B (abaixar material_min base a 1) + Opció C (cap 50). Efecte net:
- Flux menor: menys material perdut per cap
- Cap més gran: l'acumulació inter-generacional té valor
- El jugador sent que "estalviar" material per a la propera generació és una decisió real

#### R5 — Establir densitat d'habilitats per finestra temporal

**Proposta de norma de disseny**: cada finestra de 20 cicles (una generació) hauria de contenir entre 6 i 10 habilitats potencialment desblocables (sumant totes les branques). La distribució actual:

| Finestra | Habilitats disponibles (totes branques) | Dens. per branca |
|---|---|---|
| c0–c20 | 10 (ut_foc×4 + ut_eines×6) | 2–4 per branca |
| c20–c40 | 4 (ut_art×4) | 1 per branca |
| c40–c60 | 3 (ut_vestimenta×3) | ~1 per branca |
| c60–c80 | 9 (ut_corda×5 + ut_ceramica×4) | 2–3 per branca |
| c80–c100 | 4 (ut_agricultura×4) | 1 per branca |

**Objectiu**: equilibrar a 5–8 per finestra eliminant els extrems (c0–c20 massa ric, c20–c40 massa pobre).

**Proposta de redistribució**:

| Finestra | Habilitats objectiu | Canvis proposats |
|---|---|---|
| c0–c20 | 7 | Moure 2–3 habilitats de ut_eines a ut_art o ut_vestimenta |
| c20–c40 | 6 | Afegir 2 habilitats a ut_art (R2) + retenir 4 actuals |
| c40–c60 | 6 | Afegir 2–3 habilitats a ut_vestimenta (p.ex. bt_coneixement_plantes de R3) |
| c60–c80 | 7 | Deixar com està (bt_corda + bt_ceramica ja ben distribuïdes) |
| c80–c100 | 5 | Pot quedar com està; afegir 1 habilitat si el playtest mostra dead zone |

---

## 4. Fórmules

### 4.1 Material Generat per Vida (EV)

```
EV_material_vida = Σ(t=0 → T) [E(material_t)]

On:
  T = LIFE_EXPECTANCY = 20 (cicles per vida)
  E(material_t) = (material_min_acció + material_max_acció) / 2
                  + elderBonus(t) + aprMatBonus_esperada
```

| Símbol | Tipus | Rang | Descripció |
|---|---|---|---|
| `T` | int | 1–100 | Durada de la vida en cicles (= LIFE_EXPECTANCY típicament) |
| `material_min_acció` | int | 0–4 | material_min de l'acció executada cada cicle |
| `material_max_acció` | int | 1–6 | material_max de l'acció executada cada cicle |
| `elderBonus(t)` | int | 0–1 | +1 si `characterAge() >= 11` (fase elder) |
| `aprMatBonus_esperada` | float | 0–1 | Valor esperat de `apr_veu_clan` (+1) si actiu; 0 altrament |
| `EV_material_vida` | float | 20–80 | Material total esperat acumulat durant una vida |

**Worked example** (accions normals, sense aprenentatge):
- Cicles jove (0–10): `(2+3)/2 = 2.5` × 10 = 25
- Cicles elder (11–20): `(2+3)/2 + 1 = 3.5` × 10 = 35
- **Total**: 25 + 35 = **60 material/vida**

### 4.2 Material Disponible per Compres (per generació)

```
M_compra_genN = M_heredat_genN + EV_material_vida - M_caps_perdut_genN

M_heredat_genN = floor(M_final_gen(N-1) × inheritDecay)
M_caps_perdut_genN = max(0, M_acumulat_en_pic - materialMax) × cicles_en_saturació

On:
  inheritDecay = 0.3 (RESOURCE_DEFS)
  materialMax = 35 (valor actual) | 50 (proposta R4)
```

| Símbol | Tipus | Rang | Descripció |
|---|---|---|---|
| `M_heredat_genN` | int | 0–15 | Material inicial de la generació N (heretat del pare) |
| `EV_material_vida` | float | 20–80 | Material esperat per vida (veure 4.1) |
| `M_caps_perdut_genN` | float | 0–40 | Material perdut per saturació del cap |
| `inheritDecay` | float | 0.0–1.0 | Factor de decadència inter-generacional (0.3 actual) |
| `materialMax` | int | 10–100 | Cap màxim del recurs material |
| `M_compra_genN` | float | 5–80 | Material efectivament disponible per comprar accions |

**Worked example** (estat actual, cap 35):
- Gen 1: hereda 0, genera 60, gasta 18 en compres, satura el cap als ~8 cicles
- M_caps_perdut ≈ 2.5/cicle × 10 cicles saturació = 25 perduts
- M_final_Gen1 = 0 + 60 - 25 - 18 = 17 → Gen 2 hereda floor(17 × 0.3) = **5**
- Gen 2 comença amb 5, genera 60, gasta ~11 en compres → similar

**Worked example** (proposta R4, cap 50, material_min base a 1):
- Flux reduït: EV = (1+3)/2 × 20 = 40 material/vida
- Gen 1: genera 40, gasta 18, satura als ~12 cicles, perd ~2/cicle × 8 = 16
- M_final_Gen1 = 40 - 18 - 16 = 6 → Gen 2 hereda floor(35 × 0.3) = 10 (si mor amb 35)
- Nota: amb cap 50, és possible acumular fins a 50 → Gen 2 hereda floor(50 × 0.3) = **15**

### 4.3 Cost Total d'una Branca (totes les accions)

```
Cost_branca = Σ purchase_cost de totes les accions amb purchase_cost ≥ 1
              per la branca primària + habilitats pont
```

Auditoria actual de costos per branca (sense habilitats pont):

| Branca | Accions-Mercat | Cost total (suma) | Rangs |
|---|---|---|---|
| Caçador | ~10 | ~38 | 3–8 per acció |
| Recol·lector | ~12 | ~42 | 3–5 per acció |
| Artesà | ~11 | ~42 | 3–5 per acció |
| Místic | ~10 | ~36 | 3–5 per acció |

Un jugador que seguís una única branca al 100% necessitaria ~36–42 material total per comprar tot el catàleg. Amb EV ~60/vida, cap al voltant de Gen 2 hauria de tenir tot comprat.

---

## 5. Casos Extrems

### 5.1 Jugador amb inclinació neutra (cap branca activa)

Si el jugador manté el personatge en inclinació neutra (tots els eixos < 34% normalitzat), cap habilitat pot ser desbloquejada. La dead zone és permanent per a ell.

**Resolució**: les condicions d'habilitat actuals accepten llindars baixos (moltes amb condicions OR i mínims de 0.10–0.15). Un jugador neutre pot desbloquejar `bt_guardia_flama` (OR ≥ 0.15 en qualsevol eix) o `bt_rasclador_fi` (OR ≥ 0.18). El punt de partida forçat de `sociabilitat = 0.05` (freshInclination a game.js:311) assegura que el Recol·lector és la branca inicial determinista.

### 5.2 Generació que mor molt jove (< cicle 5 de vida)

Si el personatge mor als cicles de joventut (salut esgotada per inanició o event), Gen 2 comença massa aviat i arriba a tecnologies que haurien estat de Gen 2.

**Resolució**: el sistema no preveu compensació. La successió és transparent: Gen 2 neix al cicle on va morir Gen 1 i s'enfronta al context d'aquell cicle. Si Gen 1 mor al cicle 8 (before ut_foc), Gen 2 tindrà ut_foc als 2 cicles de vida — no és una dead zone sinó una densitat comprimida.

### 5.3 Jugador que compra tot ràpidament (binge buyer)

Si el jugador compra totes les accions disponibles a Gen 1 (usant material acumulat), Gen 2 hereda les accions però no té res nou fins al cicle 36 (ut_art).

**Resolució**: les accions heretades segueixen essent útils; el jugador les usa i s'especialitza. La dead zone de compra no implica dead zone de joc. La recomanació R2 (habilitat Artesà a ut_art) atenuaria l'impacte per als jugadors d'Artesà.

### 5.4 Material al cap durant molts cicles

Si el jugador no visita el Mercat i acumula material fins al cap, el flux es perd.

**Resolució a curt termini**: no n'hi ha (és el problema R4). Recomanació: la UI hauria de notificar "Mercat amb noves accions disponibles" quan una nova habilitat es desbloqueja, incentivant la visita.

### 5.5 Branca canviada a mig vida (transició)

Si el jugador canvia de branca (p.ex. de Caçador a Místic) a mig vida, les accions comprades de la branca antiga segueixen heretades però les noves habilitats de Místic poden no ser disponibles fins a la propera UT. Pot quedar en un limbo sense habilitats actives de cap branca.

**Resolució**: les habilitats pont (OR de condicions) asseguren que hi ha sempre alguna opció accessible. Recomanació: garantir que cada UT té almenys una habilitat amb condicions OR i llindars baixos (≤ 0.15) accessible en transició.

---

## 6. Dependències

| Sistema | Relació |
|---|---|
| `era-system.md` | Defineix ERA_CYCLES, LIFE_EXPECTANCY i el cicle de cada UT |
| `action-economy.md` | Defineix purchase_cost, material_min/max, la cadena UT→SKILL→ACTION |
| `branch-system.md` | Defineix les condicions d'inclinació dels SKILL_DEFs; BRANCH_ACTIVATION_PCT = 0.34 |
| `destresa-system.md` | Les destreses desbloquegen upgrades; el cost d'upgrade (6–8) afecta el pressupost |
| `aprenentatge-system.md` | `apr_veu_clan` dona +1 material global; afecta EV_material_vida |

---

## 7. Tuning Knobs

| Knob | Valor Actual | Rang Segur | Efecte |
|---|---|---|---|
| `LIFE_EXPECTANCY` | 20 | 15–25 | Nombre de cicles per vida; afecta quantes UT veu cada gen |
| `material.max` | 35 | 30–60 | Cap de material; determina quant pot acumular el llinatge |
| `material.inheritDecay` | 0.3 | 0.2–0.5 | Fracció de material que hereta el fill; alt = més continuïtat |
| `material_min` base (accions normals) | 2 | 1–2 | Flux mínim de material/cicle; baix = menys saturació del cap |
| `purchase_cost` rang | 3–5 (normal), 8 (upgrade) | 2–5 (normal), 6–10 (upgrade) | Cost de cada acció al Mercat |
| `INERTIA_FACTOR` | 2.0 | 1.5–3.0 | Resistència de la inclinació a canviar; alt = branques més estables |
| `INCLINATION_INHERITANCE_RATE` | 0.85 | 0.70–0.95 | Fracció d'inclinació heretada; alt = llinatge molt estable |

---

## 8. Criteris d'Acceptació

- [ ] Cada generació (Gen 1–5) té com a mínim una habilitat desbloquejable a la seva UT primària, amb `purchase_cost` asequible amb el material acumulat en 5 cicles de vida
- [ ] Cap branca passa més de 20 cicles consecutius sense tenir cap habilitat nova potencialment accessible (mesurat des del cicle en que la inclinació de branca supera el 34%)
- [ ] El jugador amb material al cap (`material = materialMax`) no perd material durant més de 10 cicles consecutius sense que hi hagi almenys una acció comprable al Mercat
- [ ] El cost total de totes les accions d'una branca (purchase_cost acumulat) no supera el material esperat per 2 generacions completes (~120 EV actual, o ~80 EV amb la proposta R4)
- [ ] La dead zone Artesà cicles 36–49 queda coberta per almenys una habilitat/acció nova a `ut_art`
- [ ] La dead zone Caçador cicles 10–15 queda coberta per accés pràctic a almenys una habilitat de `ut_foc`
- [ ] `bt_coneixement_plantes` (o equivalent) és accessible a Gen 1–2 (cicle ≤ 36)

---

## 9. Preguntes Obertes — Decisions Pendents de l'Usuari

Les preguntes següents requereixen decisió de disseny i no han de ser resoltes autònomament:

### Q1 — Dead zone Artesà cicles 36–49 (PRIORITAT ALTA)

`ut_art` no dona cap habilitat al perfil Artesà (intel·lecte ≥ 0.20). Gen 2 d'Artesà va 16+ cicles sense contingut nou al Mercat.

**Opció A**: nova habilitat `bt_mapa_recursos` a `ut_art` (narrativa: l'art simbòlic inclou cartografia i comptatge)
**Opció B**: avançar `bt_adobament_pells` (ut_vestimenta → ut_art), mantenint una versió lleugera a ut_vestimenta
**Opció C**: acceptar la dead zone com a característica — l'Artesà es consolida i usa el que té, sense novetat fins a ut_vestimenta (c50)

### Q2 — Nivell del cap de material i inheritDecay (PRIORITAT ALTA)

El sistema actual (cap 35, decay 0.3, material_min 2) genera material que es perd per saturació i herències de poc valor. Les opcions son:

**Opció A**: `materialMax: 50, inheritDecay: 0.3, material_min base: 1` → acumulació més lenta, herències més valuoses
**Opció B**: `materialMax: 35, inheritDecay: 0.5, material_min base: 2` → augmentar el que s'hereta, no canviar el flux
**Opció C**: `materialMax: 35 (sense canvi), afegir sumidors d'execució` (accions que gasten material en executar-les)
**Opció D**: mantenir l'estat actual — el material no és una tensió central; la tensió és la inclinació

### Q3 — Avançar bt_coneixement_plantes (PRIORITAT MITJANA)

`bt_coneixement_plantes` és la habilitat "coneixement de plantes" del Recol·lector però arriba al cicle 65. Narrativament és una competència paleolítica bàsica.

**Opció A**: moure a `ut_foc` (cicle 10) — "el foc revela noves plantes comestibles"
**Opció B**: moure a `ut_art` (cicle 36) — "el pensament simbòlic permet catalogar plantes"
**Opció C**: deixar a `ut_corda` (cicle 65) — és acceptable; el Recol·lector ja té contingut adequat a Gen 1–2 via bt_rasclador_fi i bt_ornaments

### Q4 — Dead zone Caçador cicles 10–15 (PRIORITAT BAIXA)

`ut_foc` (cicle 10) no dona habilitats per al perfil Caçador pur. `bt_guardia_flama` ja té condicions OR accessibles, però la seva orientació és de suport (health), no de caça.

**Opció A**: abaixar el llindar de `bt_guardia_flama` a `impuls ≥ 0.10`
**Opció B**: nova habilitat mínima a `ut_foc` per al Caçador (p.ex. `bt_carn_al_foc`: cuinar/processar la caça amb el foc)
**Opció C**: acceptar la dead zone — els cicles 10–15 el Caçador usa les accions base (espiar_ramat) i espera ut_eines

### Q5 — Significat del material: tensió o conveniència? (PRIORITAT MITJANA)

Cal decidir si el material ha de ser:

**Opció A (tensió)**: el material és escàs, la compra d'accions és una decisió difícil, no totes les accions d'una branca son asequibles en una vida. Implica abaixar `material_min` i/o augmentar `purchase_cost`.

**Opció B (conveniència)**: el material és abundant, la compra mai és una barrera, la tensió ve de la inclinació (visibilitat d'accions) i no del material. El sistema actual s'apropa a aquest model.

**Opció C (hybrid)**: el material és abundant dins d'una generació, però l'inter-generacional és escàs (inheritDecay baix). La tensió no és "puc comprar?" sinó "quant puc deixar al fill?".

---

*Document generat: 2026-06-24. Revisar i aprovar sections Q1–Q5 per avançar a DESIGN-02 Phase 3 (redistribució de contingut).*
