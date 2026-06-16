# Bloodline — Proposta d'events per a l'Era 1

**Tipus de document**: Proposta de contingut (events). No és un GDD de sistema.
**Rol d'autoria**: arqueòleg del Paleolític Superior + game designer d'events.
**Data**: 2026-06-11
**Fonts**: `prototypes/bloodline-v2/data.js` (post-lots A–D), `design/gdd/bloodline/content-review-era1.md` (§4.3, §9), `_overview.md`

> ⚠️ **Nota (2026-06-16)**: La `reputació` com a recurs persistent ha estat eliminada del joc (D3, 2026-06-14).
> Els camps `reputacio` i `reputacio_delta` en els efectes d'events d'aquest document son propostes de disseny
> pendents de migrar. En implementar-los, substituir per efectes de `salut`, `material` o efectes narratius purs.
**Escala canònica**: cicle *c* ≈ 50.000 − 400·*c* AEC (Era 1: 100 cicles)

---

## 1. Diagnòstic dels pools existents

### 1.1 Inventari (data.js, 2026-06-11)

El joc té **56 events** en 6 pools, més 7 `EXPLORATION_EVENTS` (sistema a part,
fora d'aquest diagnòstic). Classificació segons `classifyEvent()` del motor
(descoberta → positiu; amb opcions → neutre; resolutius → puntuació per efectes):

| Pool | Events | Pos / Neg / Neutre | Accions que hi apunten | Branca servida | Valoració |
|------|--------|--------------------|------------------------|----------------|-----------|
| `pool_caca` | 11 | 5 / 2 / 4 | 12 | Caçador | **Bo.** Els 4 opcionals (bisó, mamut, grup estrany, trampa rival) són específics i ben documentats; els 4 resolutius són genèrics però funcionals |
| `pool_recollecta` | 10 | 5 / 1 / 4 | 11 | Recol·lector | **Bo.** Opcionals excel·lents (ossa, fong, esbarzer); 1 sol negatiu resolutiu |
| `pool_artesania` | 10 | 4 / 0* / 6 | **19** | Artesà | **Infraservit i desbalancejat.** El pool més carregat d'accions amb la pitjor ràtio events/acció; *cap negatiu efectiu (vegeu E2) |
| `pool_ritual` | 11 | 6 / 0 / 5 | 18 | Místic | **Cap negatiu resolutiu** — el deute negatiu del balancejador no es pot pagar mai dins del pool (vegeu E3) |
| `pool_social` | 9 | 4 / 1 / 4 | 15 | totes | **Correcte** però el contacte intergrupal és prim (2 events) per a una era definida per xarxes socials extenses |
| `pool_familia` | 5 | 1 / 0 / 4 | **1** | totes | Sobre-servit (5 events per 1 acció) però el contingut és bo; no és prioritat |

*(3 accions tenen `event_pool_id: null` i no disparen events.)*

### 1.2 Troballes

- **E1 — Resolutius genèrics sense ancoratge**: 12 events resolutius
  (`ev_rastre_fresc`, `ev_caca_abundant`, `ev_tecnica_nova`, `ev_lider_respectat`,
  `ev_visio_profunda`…) tenen textos vàlids per a qualsevol era ("El respecte
  augmenta. El grup treballa millor."). No són bugs — donen textura ràpida —
  però són l'oportunitat més barata de pujar la densitat paleolítica del joc.
  Aquesta proposta **no** els reescriu (cost/benefici baix); els nous resolutius
  proposats fixen l'estàndard per si mai es revisen.
- **E2 — Bug de classificació: `pedra` i `eina` no puntuen**. La fórmula de
  `classifyEvent()` és `food + health·0,5 + reputacio·2 + material·0,5` — no
  inclou `pedra` ni `eina`. Conseqüència: `ev_eina_trencada` (eina −1) i
  `ev_eina_trencada_material` (eina −1, pedra −1) **es classifiquen com a
  neutres**: el balancejador creu que `pool_artesania` no té cap event negatiu
  i mai no els selecciona per pagar deute negatiu. Fix d'1 línia proposat a §7.3.
- **E3 — `pool_ritual` sense negatius**: cap event del pool puntua negatiu
  (l'únic event dur, `pe_malaltia`, té opcions → neutre). El Místic juga
  estructuralment protegit del deute negatiu. Fix de contingut immediat
  (1 event, codi a §1.3) sense tocar el motor.
- **E4 — El contingut del Lot C no té cap event**: cap event no referencia
  `bt_pesca`, `bt_terrissa`, `bt_musica_os` ni `bt_adhesius`, ni cap de les
  seves 8 accions. Les situacions de joc noves (riu, forn, flauta, quitrà)
  no tenen cobertura narrativa. És el forat anticipat pel §9.5 del
  content-review i el cor d'aquesta proposta (§3).
- **E5 — Successió muda**: la mort del personatge no dispara cap event
  (`triggerSuccession()` va directe al resum de defunció). `ev_dol_enterrament`
  — el millor event del joc segons §4.3 — només cobreix la mort d'un *membre
  anònim* del clan. El §9.2 (funerals dinàstics Sungir) hi té la resposta
  completa; §4 d'aquest document en proposa el pont barat.
- **E6 — Clima i megafauna absents**: l'era cobreix el Darrer Màxim Glacial
  (cicles ~64–82 sota l'escala canònica) i l'extinció de la megafauna, i cap
  event no ho reflecteix. `ev_mamut_sol` és l'única peça de megafauna. El
  motor no pot disparar events per rang de cicle (vegeu §7.3).

### 1.3 Fix immediat per a E3 (codi llest)

Negatiu resolutiu per a `pool_ritual` — el mal auguri, omnipresent en
l'etnografia de caçadors-recol·lectors i coherent amb la sensibilitat als
senyals que el joc ja dona al Místic:

```js
{ id: "ev_mal_auguri", text: "Un duc ha cantat tres nits seguides sobre el campament. Ningú no en parla en veu alta, però el clan treballa encongit i la llenya sembla cremar més de pressa.", effects: { health: -3, reputacio: -1 } },
```

---

## 2. Principis de disseny d'events

Sis principis, derivats del que el codi ja fa bé (§4.3 del content-review) i
dels límits reals del motor.

**P1 — Opcions només quan hi ha dilema; resolutius per a textura.**
Un event té opcions quan cap tria no és estrictament millor: cada opció ha de
servir un *perfil* diferent (risc/recompensa, ara/després, jo/clan). Si la
situació només té una sortida raonable, és resolutiu (efectes automàtics).
Regla pràctica: en un event amb opcions, la suma de "valor esperat" de cada
opció ha de ser semblant — el que canvia és la *forma* del retorn, no la mida.
Cal recordar que el motor classifica tot event amb opcions com a **neutre**:
només els resolutius alimenten el balanç positiu/negatiu.

**P2 — Cada pool ha de poder pagar deute negatiu.**
`selectBalancedEvent()` espera ~5 positius i ~4 negatius per vida, però el
deute només es pot cobrar amb events del pool de l'acció executada. Tot pool
ha de tenir **com a mínim 1 negatiu resolutiu efectiu** (que puntuï negatiu a
`classifyEvent()` — compte amb E2: `pedra`/`eina` no puntuen). Aquesta
proposta deixa tots els pools amb ≥2 negatius reals.

**P3 — Els events reforcen la inclinació pel perfil de recompensa, no per deltas.**
El motor **no aplica deltas d'inclinació en events** (només les accions en
tenen). La coherència es construeix d'una altra manera: l'opció "impulsiva"
d'un event ha d'oferir el perfil de recompensa de les accions impulsives
(menjar alt, salut en risc), i l'opció "reflexiva", el de les accions
reflexives (retorn moderat i segur). Així l'event *ressona* amb la branca del
jugador sense empènyer eixos. Les opcions amb `requires_skill` són l'eina
fina: premien la branca mostrant-li una sortida que els altres no tenen
(patró `ev_pluja_tardor` / `ev_fong_blanc`).

**P4 — To narratiu: primera persona, present, sensorial, sense xifres.**
L'estàndard el marquen `ev_bison_ferit` i `ev_dol_enterrament`: primera
persona del present, frases curtes, percepció abans que explicació ("La sang
és fresca — el rastre no té més d'una hora"). Mai xifres mecàniques al text
(el motor ja pinta els deltas als botons), mai noms propis de persones
(la successió els faria incoherents), mai termes moderns ("clan veí", no
"tribu enemiga"; "el vell que fa els rituals", no "el xaman" — el títol és
del jugador, no del text).

**P5 — Els altres membres del clan són rols, no personatges.**
"L'ancià", "una dona del clan", "el company de cacera", "un infant": rols
que sobreviuen qualsevol successió. Els fills propis es tracten exclusivament
via `requires_children` / `requires_no_children` per variar opcions (patró
`ev_criatura_dificil`), mai al text principal de l'event — el text ha de
funcionar amb i sense descendència.

**P6 — Tot event nou porta guarda per no diluir els pools.**
Els events de descoberta competeixen amb la resta del pool a
`getEligiblePoolEvents()`: cada event nou sense guarda redueix la probabilitat
que una descoberta aparegui. Per això tot event d'aquesta proposta porta
`blocked_if` (habilitat o cicle) sempre que sigui temàticament defensable, de
manera que **a l'inici de partida els pools queden quasi intactes** — els nous
events s'activen quan el contingut que els justifica ja existeix. El
balancejador amorteix la resta (les descobertes són "positives" i el deute
positiu inicial les sobrepondera).

### 2.1 Límits del motor que aquesta proposta respecta (verificats al codi)

| Límit | Detall | Conseqüència |
|---|---|---|
| Efectes resolutius | `effects` accepta `food`, `health`, `material`, `reputacio`, `pedra`, `eina` | — |
| Deltas d'opcions | Només `food_delta`, `health_delta`, `material_delta`, `reputacio_delta` (+ `skill_modifier` per a salut). **No existeixen `pedra_delta` ni `eina_delta`** | Cap opció proposada toca pedra/eina |
| Inclinació | Els events no poden modificar eixos | P3 |
| `blocked_if` | OR de bloquejadors: `has_skill`, `not_has_skill`, `has_destresa`, `stat_min`, `axis_above`, `resource_below`. **No hi ha condicions de cicle ni d'edat** | Extensió mínima proposada a §7.3 |
| `is_single_use` + opcions | El motor només consumeix el single-use si `opt.discovers !== false`. **Convenció**: en events single-use sense descoberta, les opcions han d'OMETRE el camp `discovers` (no escriure `discovers: false`, o l'event es repetiria) | Aplicat a tots els single-use nous |
| Disparador | Els events només es disparen post-acció des del pool de l'acció (60%) | Cap event "espontani"; els funerals del §4 usen pools d'alta freqüència |

---

## 3. Events nous per al contingut del Lot C

15 events. Tots porten `blocked_if: [{ type: "not_has_skill", id: ... }]` —
només es disparen quan el personatge té l'habilitat (P6). Nota de funcionament:
les accions de pesca apunten a `pool_caca` i les de terrissa/adhesius/flauta a
`pool_artesania`/`pool_ritual`, de manera que aquests events també poden sortir
després d'altres accions del mateix pool — acceptable: qui té `bt_pesca` viu a
prop del riu encara que aquell dia caci rens.

### 3.1 `bt_pesca` — Pesca amb Arpó i Xarxa (→ `pool_caca`)

**Base arqueològica**: Ohalo II (~21.000 AEC): >40 tàxons de peix a les
escombraries domèstiques, pesca intensiva amb xarxa i llinya. Arpons de banya
magdalenians (La Madeleine, ~15.000 AEC). El salmó del fris de l'Abri du
Poisson (Dordonya, ~23.000 AEC) — la remuntada anual com a esdeveniment
econòmic. Pesca sota gel documentada etnogràficament en tot el subàrtic.

```js
{
  id: "ev_remuntada_salmons",
  blocked_if: [{ type: "not_has_skill", id: "bt_pesca" }],
  text: "El riu ha canviat de so aquesta nit. Al matí, l'aigua bull d'esquenes brillants que empenyen riu amunt, tantes que les pedres del gual no es veuen. Això no durarà gaires dies.",
  options: [
    { text: "Pescar sense parar fins que es faci fosc", food_delta: +6, health_delta: -2, discovers: false },
    { text: "Agafar només el que podem menjar fresc", food_delta: +2, health_delta: +1, discovers: false },
    { text: "Fumar la pesca a la mateixa riba, dia i nit", requires_skill: "bt_cuina_conservacio", food_delta: +5, material_delta: +1, discovers: false }
  ]
},
{
  id: "ev_riuada_xarxa",
  blocked_if: [{ type: "not_has_skill", id: "bt_pesca" }],
  text: "Ha plogut tres dies a les muntanyes i el riu baixa marró i gras. La xarxa és allà on la vaig calar, però l'aigua ja li passa per sobre i el nus de la roca treballa. Cada batec del corrent l'afluixa una mica més.",
  options: [
    { text: "Entrar a l'aigua ara, abans que se l'endugui", food_delta: +1, health_delta: -5, material_delta: +2, discovers: false },
    { text: "Deixar-la anar. Cap xarxa no val un home", material_delta: -3, health_delta: +1, discovers: false },
    { text: "Esperar la baixada i resseguir la riba demà", food_delta: -1, material_delta: -1, discovers: false }
  ]
},
{
  id: "ev_gel_prim",
  blocked_if: [{ type: "not_has_skill", id: "bt_pesca" }],
  text: "El riu s'ha tancat amb la primera gelada forta. Sota el gel fosc es veuen ombres lentes, peixos grossos i adormits. Al mig del corrent el gel canta quan hi poso el peu.",
  options: [
    { text: "Caminar fins al mig, on l'aigua és fonda", food_delta: +4, health_delta: -3, discovers: false },
    { text: "Obrir un forat a tocar de la vora", food_delta: +1, discovers: false },
    { text: "Tornar d'aquí a uns dies, quan el gel s'endureixi", food_delta: -1, health_delta: +1, discovers: false }
  ]
},
{ id: "ev_toll_aillat", blocked_if: [{ type: "not_has_skill", id: "bt_pesca" }], text: "La crescuda de fa dies ha deixat un toll tancat al meandre vell. A dins, peixos atrapats que cap riu no vindrà a salvar. Només cal ajupir-se a collir-los.", effects: { food: +4 } },
```

### 3.2 `bt_musica_os` — Flautes d'Os (→ `pool_artesania` i `pool_ritual`)

**Base arqueològica**: flautes de radi de voltor de Hohle Fels (~40.000 AEC,
Conard et al. 2009) i flautes d'**ivori de mamut** de Geissenklösterle — l'ivori
no és buit: cal partir-lo longitudinalment, buidar-lo i tornar-lo a segellar
amb adhesiu (la síntesi música+adhesius és literal en el registre). Estudis
d'acústica de coves (Reznikoff & Dauvois): les zones pintades coincideixen amb
els màxims de ressonància — la música i l'art parietal compartien espai.

```js
// → pool_ritual
{
  id: "ev_ressonancia_caverna",
  blocked_if: [{ type: "not_has_skill", id: "bt_musica_os" }],
  text: "He bufat la flauta a l'entrada de la cova gran per provar-la, i la cova ha contestat. El so torna més gros, més fondo, com si algú altre toqués des de dins de la pedra. Se m'eriça la pell dels braços.",
  options: [
    { text: "Entrar més endins i tocar fins que la cova calli", health_delta: +2, reputacio_delta: +1, discovers: false },
    { text: "Aturar-me. Aquest so no és per despertar-lo sol", health_delta: +1, discovers: false },
    { text: "Córrer a buscar el clan perquè ho senti", food_delta: -1, reputacio_delta: +2, discovers: false }
  ]
},
// → pool_ritual
{
  id: "ev_disputa_apaivagada",
  blocked_if: [{ type: "not_has_skill", id: "bt_musica_os" }],
  text: "Dos homes s'han alçat l'un contra l'altre vora el foc, i aquesta vegada hi ha una fulla a la mà d'un. El cercle s'ha obert. Ningú no diu res. La flauta em pesa al sarró com si em cridés.",
  options: [
    { text: "Tocar fluix, des del meu lloc, sense mirar ningú", reputacio_delta: +2, health_delta: +1, discovers: false },
    { text: "Posar-me entremig amb la flauta alçada", reputacio_delta: +1, health_delta: -2, discovers: false },
    { text: "No moure'm. Que ho resolguin els punys", health_delta: -1, reputacio_delta: -1, discovers: false }
  ]
},
// → pool_artesania
{ id: "ev_flauta_es_clivella", blocked_if: [{ type: "not_has_skill", id: "bt_musica_os" }], text: "He deixat la flauta nova massa a prop del caliu mentre treballava. En collir-la, una clivella fina li corre de forat a forat. El so que en surt ara és el d'un os trencat.", effects: { material: -2 } },
// → pool_artesania
{
  id: "ev_flauta_ivori", is_single_use: true,
  blocked_if: [{ type: "not_has_skill", id: "bt_musica_os" }],
  text: "Tinc un fragment d'ullal de mamut, llis i dens. Una flauta d'ivori sonaria com cap altra — però l'ivori no és buit com l'os d'ala: caldria partir-lo pel mig, buidar les dues meitats i tornar-les a tancar sense que perdin l'alè.",
  options: [
    { text: "Partir-lo, buidar-lo i segellar-lo amb quitrà", requires_skill: "bt_adhesius", material_delta: +3, reputacio_delta: +2 },
    { text: "Provar de tancar-lo amb tendons i paciència", material_delta: -2, health_delta: -1 },
    { text: "Guardar l'ullal. Encara no en sé prou", material_delta: +1 }
  ]
},
```

*(`ev_flauta_ivori` és single-use sense descoberta: les opcions ometen
`discovers` perquè el motor el consumeixi — vegeu §2.1.)*

### 3.3 `bt_adhesius` — Adhesius i Emmanegament (→ `pool_artesania`)

**Base arqueològica**: el quitrà de bedoll exigeix cocció anaeròbica a
340–370 °C (experiments de Kozowyk et al. 2017) — una finestra tèrmica
estreta, sense termòmetre: la fallada de fornada era rutina. Adhesius
compostos carregats amb ocre (Sibudu, Wadley 2009): el mineral redueix la
fragilitat. L'emmanegament és el servei tècnic de tot el grup de caça.

```js
{
  id: "ev_quitra_es_crema",
  blocked_if: [
    { type: "not_has_skill", id: "bt_adhesius" },
    { type: "stat_min", stat: "enginy", min: 4.0 }
  ],
  text: "El munt tapat amb terra fumeja pels llocs equivocats. Massa aire: l'escorça crema en lloc de suar. Si l'obro ara salvaré poc; si el tapo més fort, potser l'ofego — o potser ja és tot cendra allà dins.",
  options: [
    { text: "Obrir el caliu ara i salvar el que quedi", material_delta: -1, discovers: false },
    { text: "Tapar-ho més fort amb terra molla i esperar", material_delta: +2, health_delta: -2, discovers: false },
    { text: "Donar-ho per perdut i tornar a apilar escorça", food_delta: -1, material_delta: -2, discovers: false }
  ]
},
{ id: "ev_ocre_al_quitra", blocked_if: [{ type: "not_has_skill", id: "bt_adhesius" }], text: "M'han caigut restes d'ocre mòlt dins la pasta de quitrà calenta. En refredar-se, la barreja no es trenca com sempre: flecta i torna, tossuda com un tendó. L'error d'avui és la recepta de demà.", effects: { material: +2, reputacio: +1 } },
{
  id: "ev_llanca_del_company",
  blocked_if: [{ type: "not_has_skill", id: "bt_adhesius" }],
  text: "El company de cacera m'ha portat la seva llança com qui porta un fill malalt. La punta balla dins l'encaix: el seu adob de resina no ha aguantat el fred. Demà surt a caçar amb el grup, amb o sense punta ferma.",
  options: [
    { text: "Refer-li l'emmanegament aquesta nit mateix", material_delta: -1, food_delta: +3, discovers: false },
    { text: "Ensenyar-li a fer-ho ell, pas a pas", material_delta: -1, reputacio_delta: +2, discovers: false },
    { text: "Que esperi: la meva feina va primer", material_delta: +1, reputacio_delta: -1, discovers: false }
  ]
},
```

*(`ev_quitra_es_crema` reutilitza el patró de `ev_eina_trencada`: el segon
bloquejador fa que els mestres amb enginy ≥ 4.0 ja no el pateixin.)*

### 3.4 `bt_terrissa` — Terrissa (→ `pool_artesania`)

**Base arqueològica**: les figurines de Dolní Věstonice (~26.000 AEC)
presenten fractures d'esclat tèrmic que Vandiver et al. (1989) interpreten com
a **cocció explosiva deliberada** — l'esclat al forn podia ser l'acte, no
l'accident. Vasos utilitaris més tardans (Xianrendong ~18.000 AEC, dins
l'escala de `ut_ceramica` cicle 80). L'argila bona és un recurs localitzat
(els loess del Danubi mitjà).

```js
{
  id: "ev_figura_esclata",
  blocked_if: [{ type: "not_has_skill", id: "bt_terrissa" }],
  text: "La figura ha petat dins del forn amb un crac sec que ha fet callar el campament. Els fragments encara cremen entre les brases. El vell dels rituals s'ha inclinat a mirar-los amb els ulls mig clucs, esperant a veure què hi llegeixo jo.",
  options: [
    { text: "Llegir el senyal en la forma dels fragments", reputacio_delta: +2, material_delta: -1, discovers: false },
    { text: "Buscar la causa: l'argila era massa humida", material_delta: +2, discovers: false },
    { text: "Recollir els trossos en silenci i tornar a pastar", health_delta: +1, discovers: false }
  ]
},
{ id: "ev_veta_argila", blocked_if: [{ type: "not_has_skill", id: "bt_terrissa" }], text: "El talús que la riuada ha mossegat deixa al descobert una veta d'argila grisa, neta i greixosa com sèu. N'omplo dos sarrons i marco el lloc amb tres pedres.", effects: { material: +2 } },
{ id: "ev_pluja_sobre_forn", blocked_if: [{ type: "not_has_skill", id: "bt_terrissa" }], text: "La pluja ha arribat de nit, sense vent que l'anunciés, i ha trobat la fossa de cocció oberta. Al matí els vasos són crostes esquerdades i el caliu, fang negre.", effects: { material: -2, health: -1 } },
{
  id: "ev_vas_demanat",
  blocked_if: [{ type: "not_has_skill", id: "bt_terrissa" }],
  text: "Una dona del clan m'ha portat greix de rens embolicat en pell, i el greix sua i es perd. Vol un vas dels meus, dels que passen pel foc. M'ofereix part del que hi guardarà.",
  options: [
    { text: "Fer-l'hi a canvi d'una part de cada cacera", food_delta: +3, material_delta: -1, discovers: false },
    { text: "Fer-l'hi com a regal, davant de tothom", reputacio_delta: +2, material_delta: -1, discovers: false },
    { text: "Dir-li que esperi: el forn ja és ple", material_delta: +1, reputacio_delta: -1, discovers: false }
  ]
},
```

---

## 4. Events dinàstics (funerals simplificats)

**Base arqueològica**: Sungir (~32.000 AEC): un home adult enterrat amb ~3.000
denes d'ivori cosides a la roba; dos infants cap contra cap amb >10.000 denes,
llances d'ivori de mamut redreçat i ocre — mesos de treball artesà invertits
en morts que no tornarien res. Arene Candide ("Il Principe", ~21.000 AEC):
casquet de centenars de closques perforades. El funeral d'estatus és
exactament una **conversió de riquesa material en capital social** — i el joc
ja té la maquinària per modelar-ho.

**Lectura mecànica (per què això bonifica l'hereu sense tocar `game.js`)**: en
la successió, `material` passa al 30% (`inheritDecay: 0.3`) i `reputacio` al
60% (`FAMILY_REP_INHERITANCE`). Gastar 4 de material per guanyar 3 de
reputació és canviar 1,2 de material heretat per 1,8 de reputació heretada —
**el funeral car és la millor inversió transgeneracional del joc**, exactament
com ho era a Sungir. La decisió simbòlica té fonament econòmic real sense cap
canvi de motor.

Dos events compatibles avui (la mort d'altres membres del clan, complementant
`ev_dol_enterrament` que es manté intacte) + un tercer que necessita
l'extensió `age_below` (§7.3) per disparar-se només al capvespre de la vida.

```js
// → pool_ritual — repetible: els ancians moren a cada generació
{
  id: "ev_funeral_ancia",
  text: "L'ancià que ensenyava els nusos i els noms de les estrelles no s'ha despertat. El clan s'ha aturat sense que ningú ho mani. A la seva pell de dormir hi ha les seves coses: un punxó, mitja dotzena de denes, un còdol vermell. Tothom em mira a mi.",
  options: [
    { text: "Funeral gran: denes, ocre i les seves eines a la fossa", material_delta: -4, reputacio_delta: +3, health_delta: +2, discovers: false },
    { text: "Enterrar-lo com sempre s'ha fet, amb el seu punxó", health_delta: +1, discovers: false },
    { text: "El gel no espera: ritu breu i seguir camí", food_delta: +1, reputacio_delta: -1, health_delta: -1, discovers: false }
  ]
},
// → pool_social — single-use (les opcions OMETEN discovers: vegeu §2.1)
{
  id: "ev_funeral_dos_infants", is_single_use: true,
  text: "La febre se'ls ha endut tots dos en una sola nit, l'un darrere l'altre. La mare no plora: trena. Ha demanat que els enterrin cap contra cap, com dormien. El clan sencer talla denes d'ivori a la llum del foc, i les mans no donen l'abast.",
  options: [
    { text: "Donar les meves millors peces per a l'aixovar", material_delta: -5, reputacio_delta: +4 },
    { text: "Tallar denes tres nits seguides, fins que sagnin els dits", health_delta: -3, reputacio_delta: +3 },
    { text: "Seure amb la mare i trenar amb ella", health_delta: +1, reputacio_delta: +1 }
  ]
},
// → pool_ritual — REQUEREIX extensió age_below (§7.3): només els últims ~5 cicles de vida
{
  id: "ev_comiat_propi",
  blocked_if: [{ type: "age_below", value: 15 }],
  text: "Els dits ja no obeeixen com abans i el fred em viu als genolls tot l'any. Aquesta nit he tret les meves coses bones i les he esteses sobre la pell: les denes, l'ocre, la fulla que no s'ha trencat mai. Algú les haurà de posar amb mi. Millor triar-les jo.",
  options: [
    { text: "Apartar el millor per al meu aixovar i dir-ho al clan", material_delta: -3, reputacio_delta: +4, discovers: false },
    { text: "Donar-ho tot ara, en vida, a qui ha de venir darrere", requires_children: true, material_delta: -2, reputacio_delta: +2, health_delta: +2, discovers: false },
    { text: "Tornar-ho a embolicar. Encara hi soc", food_delta: +1, discovers: false }
  ]
},
```

*(Amb `LIFE_EXPECTANCY = 20`, `age_below: 15` obre la finestra als últims ~5
cicles. `ev_comiat_propi` queda fora del joc fins que s'apliqui l'extensió —
un `blocked_if` amb tipus desconegut retorna `false` i **l'event es dispararia
sempre**: no incloure'l a `data.js` abans del canvi de motor.)*

---

## 5. Events de clima i megafauna

### 5.1 Clima (4 events — requereixen l'extensió de cicle, §7.3)

**Base**: el Darrer Màxim Glacial (LGM, ~26.500–19.000 BP) cau als cicles
**~64–82** de l'escala canònica, amb el pic vora el cicle 75 (~20.000 AEC).
Les poblacions europees es contrauen als refugis del sud (franco-cantàbric,
ibèric, italià, balcànic) — la "migració al sud" està documentada
genèticament i arqueològica. L'escalfament de Bølling–Allerød (~12.700 AEC)
cau al cicle ~93: boscos que avancen, rens que marxen al nord. Finestres:

| Event | Finestra (cicles) | Ancoratge |
|---|---|---|
| `ev_hivern_sense_fi` | 58–76 | entrada al LGM |
| `ev_estepa_oberta` | 64–84 | màxim glacial: estepa-tundra, grans ramats |
| `ev_tempesta_blanca` | 58–85 | clima LGM |
| `ev_desglac` | 86–100 | Bølling–Allerød, final d'era |

```js
// → pool_recollecta — single-use (opcions sense discovers)
{
  id: "ev_hivern_sense_fi", is_single_use: true,
  blocked_if: [{ type: "cycle_below", value: 58 }, { type: "cycle_above", value: 76 }],
  text: "La neu d'enguany no ha marxat. Els avellaners no han tret fulla, les baies no han vingut, i el vent del nord talla com sílex nou fins i tot al migdia. Els vells diuen que els seus vells ja en parlaven, d'hiverns que es queden. Aquest s'ha quedat.",
  options: [
    { text: "Aixecar el campament i baixar cap a les valls del sud", food_delta: -3, health_delta: +3 },
    { text: "Excavar la cabana, doblar les pells i resistir aquí", material_delta: -3, health_delta: -3 },
    { text: "Quedar-nos, però enviar exploradors a buscar el sud", food_delta: -1, reputacio_delta: +1 }
  ]
},
// → pool_caca — repetible: textura recurrent del màxim glacial
{
  id: "ev_estepa_oberta",
  blocked_if: [{ type: "cycle_below", value: 64 }, { type: "cycle_above", value: 84 }],
  text: "On abans hi havia bosc ara hi ha herba groga fins a l'horitzó, i sobre l'herba, rens: més rens que mai no n'havia vist junts, una taca que es mou com un sol cos. La terra s'ha tornat dura i generosa alhora — tot per a qui camini, res per a qui culli.",
  options: [
    { text: "Seguir el ramat setmanes enllà, dormint on toqui", food_delta: +6, health_delta: -2, discovers: false },
    { text: "Caçar només la vora del ramat i tornar aviat", food_delta: +2, discovers: false },
    { text: "Recollir líquens i escorça dolça per als dies dolents", food_delta: +1, health_delta: +1, discovers: false }
  ]
},
// → pool_caca
{ id: "ev_tempesta_blanca", blocked_if: [{ type: "cycle_below", value: 58 }, { type: "cycle_above", value: 85 }], text: "El cel i la terra s'han tornat la mateixa cosa blanca que xiula. Hem perdut el rastre, el sol i el camí. Quan la tempesta ens deixa anar, dos dits no em responen i el sarró pesa la meitat.", effects: { food: -2, health: -4 } },
// → pool_recollecta — single-use (opcions sense discovers)
{
  id: "ev_desglac", is_single_use: true,
  blocked_if: [{ type: "cycle_below", value: 86 }],
  text: "El riu baixa gros des de fa una lluna i la neu recula muntanya amunt com una bèstia ferida. Als vessants surten brots que els vells no saben anomenar. Els rens se'n van cap al nord, més lluny cada any — i alguna cosa em diu que no tornaran.",
  options: [
    { text: "Seguir el bosc nou que puja: fruits, brots, senglars", food_delta: +3 },
    { text: "Seguir els rens cap al nord, com sempre hem fet", food_delta: +2, health_delta: -2 },
    { text: "Quedar-nos al riu: el salmó sí que torna", requires_skill: "bt_pesca", food_delta: +4, health_delta: +1 }
  ]
},
```

### 5.2 Megafauna (4 events — compatibles avui, → `pool_caca`)

**Base**: Kraków Spadzista (Polònia, ~25.000 AEC): restes de >100 mamuts en
un sol jaciment — caça/aprofitament **col·lectiu**, no gesta individual.
Mezhirich (Ucraïna, ~15.000 AEC): cabanes fetes amb ossos de desenes de
mamuts (l'os com a material de construcció). Chauvet: 65 rinoceronts llanuts
pintats (l'animal imposava) i cranis d'ós de les cavernes, un de col·locat
sobre un bloc de pedra caigut. L'ós de les cavernes s'extingeix ~24.000 AEC
(cicle ~65): si s'adopta l'extensió de cicle, `ev_cranis_de_los` pot portar
finestra; sense extensió funciona igualment (el text parla de cranis vells,
no d'óssos vius).

```js
{
  id: "ev_pas_dels_mamuts",
  text: "La terra ho ha dit abans que els ulls: un tremolor llarg, fondo, que puja pels talons. Mamuts. No un — un riu sencer de mamuts baixant cap al gual, amb cries al mig. El clan sencer cabria darrere el primer mascle. Una sola bèstia és menjar per a una lluna.",
  options: [
    {
      text: "Reunir tothom: encerclar la cria que coixeja",
      requires_skill: "bt_punta_llanca",
      food_delta: +10, health_delta: -3, reputacio_delta: +2, discovers: false
    },
    {
      text: "Atacar ara, amb els qui som",
      food_delta: +5, discovers: false,
      skill_modifier: { skill_id: "bt_punta_llanca", present_health_delta: -3, absent_health_delta: -8 }
    },
    { text: "Deixar-los passar i resseguir el rastre després", food_delta: +2, discovers: false }
  ]
},
{
  id: "ev_rinoceront_llanut",
  text: "El rinoceront pastura sol a la clariana, la banya més llarga que el meu braç. He vist què va quedar de l'últim home que en va subestimar un: el vam enterrar en dues vegades. Però hi ha carn per a mig hivern sota tota aquella llana.",
  options: [
    {
      text: "Plantar cara des de les roques, llances a punt",
      food_delta: +7, discovers: false,
      skill_modifier: { skill_id: "bt_punta_llanca", present_health_delta: -2, absent_health_delta: -7 }
    },
    { text: "Empènyer-lo crit a crit cap al vessant trencat", requires_skill: "bt_trampes", food_delta: +8, health_delta: -1, discovers: false },
    { text: "Apartar-se del seu camí, de pressa i amb respecte", health_delta: +1, discovers: false }
  ]
},
{
  id: "ev_cranis_de_los",
  text: "La cova és seca, fonda i plena d'ossos d'ós: cranis grossos com pedres de riu, urpes que encara ratllen. Cap és recent. Al fons, un crani descansa sol dalt d'una roca plana, mirant l'entrada — i juraria que ningú no l'hi ha deixat per casualitat.",
  options: [
    { text: "Endur-me un ullal com a amulet de caça", material_delta: +2, reputacio_delta: -1, discovers: false },
    { text: "Deixar una ofrena davant del crani i sortir d'esquena", food_delta: -1, health_delta: +2, reputacio_delta: +1, discovers: false },
    { text: "És seca i defensable: hi dormirem aquesta nit", health_delta: +2, discovers: false }
  ]
},
{ id: "ev_ossera_del_meandre", text: "El riu, en menjar-se el talús, ha tret a la llum un jaç d'ossos grans: costelles com bigues, un ullal sencer corbat com una lluna. Fa anys que són morts, però la cabana nova ja té esquelet.", effects: { material: +3 } },
```

---

## 6. Events de tensió social

**Base arqueològica**: els enterraments diferencials de Sungir i Dolní
Věstonice impliquen jerarquia i rols marcats. Sungir 1 va morir d'un cop
tallant a la primera vèrtebra toràcica — **mort violenta** (Trinkaus &
Buzhilova 2012). Els genomes de Sungir mostren parentiu llunyà entre els
enterrats junts: xarxes d'intercanvi de parelles entre bandes per evitar la
consanguinitat (Sikora et al. 2017, *Science*) — l'exogàmia era
infraestructura social, no excepció. Les "coves d'agregació" (Altamira,
Mas d'Azil, Isturitz; Conkey 1980) suggereixen trobades estacionals
multibanda: fires, aliances, ritus. I al final de l'era, el cementiri de
Jebel Sahaba (~11.600 AEC, cicle ~96) documenta el primer conflicte letal
recurrent entre grups.

### 6.1 Tensió interna del clan (→ `pool_social`)

```js
{
  id: "ev_desafiament_jove",
  text: "El jove que millor llança del clan s'ha aixecat quan jo parlava. Diu que fa dues llunes que tornem mig buits dels llocs que jo trio. Ho diu fort, perquè tothom ho senti. Té la veu del seu pare i la paciència de ningú.",
  options: [
    { text: "Sostenir-li la mirada i el lloc: que ho demostri caçant", reputacio_delta: +2, health_delta: -2, discovers: false },
    { text: "Donar-li la cacera de demà: que triï ell el terreny", reputacio_delta: +1, food_delta: +1, discovers: false },
    { text: "No contestar. Els crits no omplen sarrons", reputacio_delta: -2, discovers: false }
  ]
},
{
  id: "ev_reserva_buidada",
  text: "Algú ha anat obrint el clot de les reserves, un grapat cada nit, amb compte de tapar-ho bé. Aquesta nit el fred m'ha tret de la pell de dormir i l'he vist: és l'home del racó, el que va arribar prim fa dos hiverns. Els seus fills ja no ploren de gana.",
  options: [
    { text: "Despertar el clan: que la norma parli per tots", food_delta: +1, reputacio_delta: +1, health_delta: -2, discovers: false },
    { text: "Fer-li tornar el doble en feina, en silenci", material_delta: +2, reputacio_delta: +1, discovers: false },
    { text: "Tornar a la pell de dormir. Era per als seus fills", food_delta: -2, health_delta: +2, discovers: false }
  ]
},
{
  id: "ev_adopcio_forastera",
  text: "L'han trobada els gossos abans que nosaltres: una noia d'una banda que no coneixem, mig gelada sota un cingle, sense ningú. Duu denes que no són d'aquí i paraules que no entenem. El clan discuteix en veu baixa: una boca més és una boca més — i una esquena més, també.",
  options: [
    { text: "Acollir-la al meu foc fins que es valgui sola", food_delta: -2, reputacio_delta: +2, discovers: false },
    { text: "Donar-li menjar i abric per al camí, i que segueixi", food_delta: -1, discovers: false },
    { text: "Reunir el clan i que decideixi tothom", reputacio_delta: +1, food_delta: -1, discovers: false }
  ]
},
```

### 6.2 Contacte amb altres grups (→ `pool_social`)

```js
{
  id: "ev_alianca_matrimonial",
  text: "La banda del riu gran ha vingut amb regals i paraules lentes: volen que un dels seus joves i una de les nostres facin foc comú. Són bona gent de tracte, i les seves pedres venen de lluny. Però cada tracte amb ells ens lliga una mica més al seu camí.",
  options: [
    { text: "Acceptar i enviar regals de prometatge generosos", material_delta: -3, reputacio_delta: +3, discovers: false },
    { text: "Acceptar, però que el jove visqui un hivern amb nosaltres primer", food_delta: -2, reputacio_delta: +1, health_delta: +1, discovers: false },
    { text: "Declinar amb regals petits i paraules llargues", material_delta: -1, discovers: false }
  ]
},
{
  id: "ev_gran_trobada",
  text: "Quan els salmons pugen, les bandes baixen: és l'any de la trobada a la cova gran. S'hi canvien pedres, denes, gendres i cançons; s'hi acaben velles disputes i se n'hi comencen de noves. Tres dies de camí, i la tardor que no espera ningú.",
  options: [
    { text: "Anar-hi amb les millors peces per bescanviar", material_delta: -2, food_delta: +4, reputacio_delta: +1, discovers: false },
    { text: "Anar-hi a escoltar, mirar i deixar-se veure", health_delta: +1, reputacio_delta: +1, discovers: false },
    { text: "No anar-hi: la tardor mana i el clot és mig buit", food_delta: +2, reputacio_delta: -1, discovers: false }
  ]
},
{
  id: "ev_sang_a_la_frontera",
  text: "Han trobat el nostre parador de l'est desfet i les trampes buidades, i a l'arbre gros hi ha marques noves tallades sobre les nostres. A l'altra banda del torrent, tres homes ens miren sense amagar-se. No vénen a parlar.",
  options: [
    {
      text: "Respondre ara, llança per llança",
      food_delta: +2, reputacio_delta: +1, discovers: false,
      skill_modifier: { skill_id: "bt_punta_llanca", present_health_delta: -3, absent_health_delta: -7 }
    },
    { text: "Avançar sol i assenyalar les marques velles, les nostres", requires_skill: "bt_marques_territori", reputacio_delta: +2, health_delta: +1, discovers: false },
    { text: "Cedir la vall aquesta lluna i caçar a ponent", food_delta: -3, health_delta: +1, discovers: false }
  ]
},
```

---

## 7. Resum i integració

### 7.1 Volum i distribució

**33 events nous** (32 de les seccions §3–§6 + `ev_mal_auguri` de §1.3).
El joc passa de 56 a **89 events**.

| Pool | Avui | Nous | Total | Nous: pos/neg/neutre | D'on venen |
|------|------|------|-------|---------------------|------------|
| `pool_caca` | 11 | 10 | 21 | 2 / 1 / 7 | 4 pesca (§3.1) + 2 clima (§5.1) + 4 megafauna (§5.2) |
| `pool_artesania` | 10 | 9 | 19 | 2 / 2 / 5 | 2 música (§3.2) + 3 adhesius (§3.3) + 4 terrissa (§3.4) |
| `pool_ritual` | 11 | 5 | 16 | 0 / 1 / 4 | 2 música (§3.2) + 2 funerals (§4) + `ev_mal_auguri` (§1.3) |
| `pool_social` | 9 | 7 | 16 | 0 / 0 / 7 | 1 funeral (§4) + 6 socials (§6) |
| `pool_recollecta` | 10 | 2 | 12 | 0 / 0 / 2 | 2 clima (§5.1) |
| `pool_familia` | 5 | 0 | 5 | — | es deixa intacte (sobre-servit, §1.1) |

Després de la proposta, tots els pools tenen ≥1 negatiu resolutiu efectiu
(P2): artesania en guanya 2 de reals (`ev_flauta_es_clivella`,
`ev_pluja_sobre_forn` — i el fix E2 de §7.3 reclassifica com a negatius els
2 d'`eina` existents), ritual passa de 0 a 1 (`ev_mal_auguri`) i caça en
guanya 1 (`ev_tempesta_blanca`).

### 7.2 Cobertura per branca

| Branca | Cobertura nova | Mecanisme |
|---|---|---|
| Caçador | megafauna col·lectiva, clima glacial, conflicte fronterer | `pool_caca` + `skill_modifier`/`requires_skill` amb `bt_punta_llanca`, `bt_trampes`, `bt_marques_territori` |
| Recol·lector | clima (LGM i desglaç), pesca si vira cap a `bt_pesca` | finestres de cicle a `pool_recollecta`; `bt_pesca` és pont OR (impuls o intel·lecte) |
| Artesà | 9 events de taller (quitrà, forn, encàrrecs, ivori) | `pool_artesania` gated per `bt_adhesius`/`bt_terrissa`/`bt_musica_os` |
| Místic | ressonància, disputa apaivagada, funerals, mal auguri | `pool_ritual`/`pool_social`; el funeral converteix material→reputació (la seva moneda) |
| Totes | tensió social, exogàmia, gran trobada, funerals | `pool_social` sense guardes d'habilitat |

La dilució dels pools a l'inici de partida és continguda: **21 dels 33
events porten guarda** (15 d'habilitat del Lot C, 4 de cicle, 1 d'edat,
1 single-use), i dels 12 sense guarda, 10 són opcionals (neutres) que el
balancejador no sobrepondera mai per damunt de les descobertes pendents (P6).

### 7.3 Canvis a `game.js`

**(a) Imprescindible per a 5 events — extensió de `blocked_if` (3 línies).**
Sense això, els 4 events climàtics (§5.1) i `ev_comiat_propi` (§4) **no es
poden incloure a `data.js`** (un tipus desconegut de `blocked_if` retorna
`false` i l'event es dispararia sempre, fora de finestra). Afegir dins
`evaluateBlockedIf()`:

```js
    if (cond.type === 'cycle_below') return state.cycle < cond.value;
    if (cond.type === 'cycle_above') return state.cycle > cond.value;
    if (cond.type === 'age_below')   return characterAge() < cond.value;
```

**(b) Recomanat — fix del bug E2 (1 línia).** A `classifyEvent()`, incloure
`pedra` i `eina` a la puntuació perquè `ev_eina_trencada` i companyia comptin
com a negatius:

```js
  const score = (fx.food || 0) + (fx.health || 0) * 0.5 + (fx.reputacio || 0) * 2 + (fx.material || 0) * 0.5 + (fx.pedra || 0) * 0.5 + (fx.eina || 0) * 1.0;
```

**(c) La resta — 28 events copiar-pegables avui** sense tocar res: només usen
camps verificats al motor (`blocked_if` de tipus existents, deltas d'opcions
suportats, `skill_modifier`, `requires_skill`, `requires_children`,
`is_single_use` amb la convenció del camp `discovers` de §2.1).

### 7.4 Ordre d'aplicació suggerit

1. **Lot E1** (compatible avui): els 15 events del Lot C (§3) + 3 funerals−1
   (`ev_funeral_ancia`, `ev_funeral_dos_infants`) + 4 megafauna (§5.2) +
   6 socials (§6) + `ev_mal_auguri` = **28 events**, només `data.js`.
2. **Lot E2** (amb el canvi (a) de motor): 4 climàtics + `ev_comiat_propi` =
   **5 events** + 3 línies a `game.js`. Opcionalment, afegir llavors finestres
   de cicle a `ev_cranis_de_los` (`cycle_above: 80` com a bloquejador no cal:
   els cranis vells funcionen tota l'era) — no és necessari.
3. **Fix (b)** en qualsevol moment; no depèn de cap contingut.

### 7.5 Validació proposada

- `playtester-tycoon`: passada de format sobre els 33 events (camps vàlids,
  ids únics, pools existents, convenció `discovers`/single-use).
- `playtester-branch-path`: amb el Lot E1 aplicat, verificar que la
  freqüència de descobertes als cicles 1–30 no baixa (P6) i que el deute
  negatiu es paga ara també dins `pool_artesania` i `pool_ritual`.
- `playtester-optimizer`: buscar loops a `ev_funeral_ancia` (repetible:
  material→reputació amb cap 20/personatge — el `REPUTACIO_PER_CHAR_CAP`
  ja limita l'exploit) i a `ev_toll_aillat`/`ev_ossera_del_meandre`
  (positius purs amb guarda d'habilitat).

