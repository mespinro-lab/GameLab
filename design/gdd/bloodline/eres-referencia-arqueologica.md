# Bloodline — Referència Arqueològica i Històrica de les Eres

**Tipus de document**: Referència de disseny (no és un GDD de sistema; queda exempt
de la plantilla de 8 seccions). Audiència: dissenyadors de contingut d'era.
**Data**: 2026-06-11
**Fonts de calibratge**: `design/gdd/bloodline/_overview.md`, `prototypes/bloodline/data.js` (Era 1 implementada)

---

## 0. Com llegir aquest document

Cada era es desenvolupa amb 8 seccions fixes: avaluació del connector d'entrada,
fites definitòries amb evidència concreta, escala temporal, 4 branques, 5–7
tecnologies universals, mecànica signature, riscos de disseny i connector de
sortida. L'Era 1 (implementada) s'inclou com a referència de format i escala,
sense redissenyar-la.

### Principis per a connectors d'era

1. **Desbloqueig actiu**: un connector és una tecnologia o pràctica que el
   llinatge *desbloqueja*, mai un esdeveniment que li passa al món (la caiguda
   de Roma o la Pesta Negra no poden ser connectors; són events de pressió).
2. **Artefacte abans que procés**: "el telèfon intel·ligent" és millor connector
   que "la socialització d'internet" — un artefacte és aprenible, comprable,
   representable en una carta; un procés no.
3. **Porta de la fantasia següent**: el connector ha d'obrir directament la
   fantasia central de l'era següent. El Primer Conreu obre el Neolític perquè
   *sembrar* és el gest que defineix tota l'era que ve.

### Canvis proposats sobre la taula original

Quatre connectors de la proposta inicial se substitueixen amb justificació
detallada a la secció corresponent:

| Era | Connector proposat originalment | Connector recomanat | Motiu resumit |
|-----|-------------------------------|---------------------|---------------|
| 4 → 5 | El Codi Escrit | **El Còdex** | Els codis legals són de mitjan era (Hammurabi és Era 3); el còdex (llibre enquadernat, s. I–IV EC) és l'artefacte que obre el món monàstic medieval |
| 5 → 6 | La Impremta | **L'Arada Pesada** | La impremta és de ~1450 (dins l'Era 6); el paquet agrari (arada + collar + rotació) és el que dispara el boom demogràfic post-1000 |
| 6 → 7 | La Màquina de Vapor | **La Nova Ciència** | El vapor és de 1712 (dins l'Era 7); el mètode científic (~1600–1620) és el llindar real que fa possible la industrialització |
| 9 → 10 | La Socialització d'Internet | **El Telèfon Intel·ligent** | És un procés, no un artefacte; l'smartphone (2007) és la forma material exacta d'aquell procés |

La resta de connectors es confirmen (amb matisos documentats a cada era).

---

## 1. Taula resum de l'arc complet

| Era | Nom | Període | Cicles | Anys/cicle | Model de llinatge | Connector de sortida | Token d'era* |
|-----|-----|---------|--------|-----------|-------------------|----------------------|--------------|
| 0 | Tutorial — L'Alba | ~200.000–50.000 AEC | ~30 | ~5.000 | 1 successió guiada | El Pensament Simbòlic | Provisions |
| 1 | Paleolític Superior | 50.000–10.000 AEC | 100 | 400 | Dinàstic (~5 gen.) | El Primer Conreu ✅ implementat | Provisions |
| 2 | Neolític | 10.000–3.500 AEC | 100 | 65 | Dinàstic (~5 gen.) | La Fosa del Coure | Gra |
| 3 | Edat del Bronze | 3.500–1.200 AEC | 90 | ~25 | Dinàstic (~5 gen.) | La Fosa del Ferro | Metall |
| 4 | Ferro i Món Clàssic | 1.200 AEC–500 EC | 100 | 17 | Dinàstic (~5 gen.) | El Còdex | Moneda |
| 5 | Alta Edat Mitjana | 500–1.000 EC | 80 | 6,25 | Dinàstic (~4 gen.) | L'Arada Pesada | Plata |
| 6 | Baix Medieval i Renaixement | 1.000–1.600 EC | 100 | 6 | Dinàstic (~5 gen.) | La Nova Ciència | Florins |
| 7 | Industrial i Imperialisme | 1.600–1.914 EC | 90 | 3,5 | Comprimit (~3 pers.) | L'Electrificació | Capital |
| 8 | Segle XX | 1.914–1.980 EC | 66 | 1 | Comprimit (2 pers.) | L'Ordinador Personal | Capital |
| 9 | Revolució Digital | 1.980–2.010 EC | 60 | 0,5 | Individu persistent | El Telèfon Intel·ligent | Dades |
| 10 | Era Contemporània | 2.010–2.050 EC | 80 | 0,5 | Individu persistent | L'Augment Cognitiu | Atenció |
| 11 | Futur Proper | 2.050–2.150 EC | 80 | ~1,25 | La Casa (2–3 simultanis) | La Transferència de Consciència | Energia |
| 12 | Transhumanisme | 2.150 EC+ | ~60 | abstracte | El Ramatge (bifurcació) | — (era final) | Còmput |

*\*Token: proposta de flavor per al recurs d'acumulació d'era (analogia diners
de Game Dev Tycoon, vegeu `_overview.md` §3). No vinculant.*

### Nota sobre l'escala temporal

El cicle és una **unitat de decisió**, no una unitat de temps simulat. A l'Era 1
implementada un personatge viu 20 cicles ≈ 8.000 anys: la correspondència
cicle↔anys és decoració narrativa, i el que es calibra de debò és (a) cicles
per era ≈ 60–100 (sessió de 45–90 min a ~0,6–0,9 min/cicle, mesurat a l'Era 1)
i (b) generacions per era ≈ 2–5 segons el model de llinatge. Cada era ajusta
`LIFE_EXPECTANCY` al seu model: ~20 cicles a les eres dinàstiques, ~30 a les
comprimides, tota l'era a les d'individu persistent.

Una segona conseqüència: les dates de cada tecnologia universal dins l'era es
poden mapar amb força fidelitat a l'evidència arqueològica (l'Era 1 ja ho fa
sense haver-ho buscat: `ut_art` al cicle 36 = ~35.600 AEC ≈ Chauvet, ~36.000 AEC).
Aquest document proposa cicle i data aproximada per a cada tecnologia.

---

## Era 0 — Tutorial: L'Alba (~200.000–50.000 AEC)

El Paleolític Mitjà / Middle Stone Age: *Homo sapiens* anatòmicament modern
existeix des de fa ~300.000 anys (Jebel Irhoud, el Marroc, ~315 ka; Hublin et
al. 2017), però la *modernitat conductual* — símbols, ornament, enterrament —
cristal·litza lentament al llarg d'aquest període. El tutorial cobreix
exactament aquest arc: d'un clan que sobreviu a un clan que *significa*.

### 1. Avaluació del connector d'entrada

No n'hi ha: és l'inici del joc. L'estat inicial assumit és coherent amb
l'arqueologia del ~200.000 AEC: el clan ja **manté** el foc (llars habituals
des de fa ~300–400 ka: Qesem Cave, Israel) però no sap **fer-lo néixer** —
exactament el que l'Era 1 desbloqueja amb `ut_foc` ("El clan sempre ha conegut
el foc; ara sap fer-lo néixer"). La cadena ja és consistent amb el text
implementat a `data.js`.

### 2. Fites definitòries

1. **Talla de nucli preparat (Levallois)** — planificar la forma de l'eina
   abans de colpejar. Difosa per Àfrica i Euràsia des de ~300 ka (Kapthurin,
   Kenya); és la primera tecnologia que exigeix *visualitzar el resultat futur*.
2. **Explotació costanera sistemàtica** — marisc, recursos previsibles per
   marees. Pinnacle Point PP13B, Sud-àfrica, ~164 ka (Marean et al. 2007),
   juntament amb tractament tèrmic del silcrete i ús d'ocre.
3. **Processament d'ocre** — pigment mòlt i barrejat; taller d'ocre amb
   contenidors d'orella de mar a Blombos, ~100 ka (Henshilwood et al. 2011).
   Primer "producte" sense valor calòric.
4. **Adhesius i emmanegament** — quitrà de beç (Campitello, Itàlia, ~200 ka,
   neandertals) i adhesius compostos ocre+goma (Sibudu, ~70 ka): tecnologia
   de diversos components i diversos passos.
5. **Ornament corporal** — denes de petxina *Nassarius* perforades: Bizmoune
   (el Marroc) ~142 ka, Skhul ~120 ka. La identitat es porta posada: primer
   missatge dirigit a desconeguts.
6. **Enterrament intencional** — Qafzeh i Skhul (Israel), ~120–90 ka; Qafzeh 11
   amb banyes de cérvol com a aixovar. El primer "després" imaginat.
7. **Gravat abstracte** — ocre gravat amb retícules de Blombos, ~75–73 ka
   (Henshilwood et al. 2002); closques d'ou d'estruç gravades de Diepkloof,
   ~60 ka. Marca convencional que *representa*: el llindar simbòlic.

### 3. Escala temporal

**~30 cicles, 1 cicle ≈ 5.000 anys. Sessió objectiu: 20–30 min** (per sota del
rang estàndard 45–90: és un tutorial, i ha de poder completar-se en una sola
seguda la primera nit). Una sola successió a mig tutorial (vegeu §6): dues
"generacions" de ~15 cicles. La compressió temporal extrema (150.000 anys) és
acceptable precisament perquè el període és el de canvi més lent de tota la
història humana.

### 4. Branques proposades

**Proposta: cap branca formal — i és una decisió de disseny, no una omissió.**
El tutorial ensenya els 4 eixos d'inclinació *abans* de posar-los etiqueta:
cada parell d'accions bifurca un eix (perseguir el ramat / parar trampes →
impuls; menjar les baies / assecar-les → intel·lecte; abandonar el mort /
enterrar-lo → espiritualitat; menjar a part / compartir la llar → sociabilitat).

Als últims ~5 cicles, la UI mostra una **"tendència"** (ombra de branca): un
text del tipus *"El teu llinatge comença a ser un poble de [paciència / fúria /
visions / vincles]"* que apunta cap a la branca de l'Era 1 que la inclinació
acumulada activaria. Revelar el sistema de branques complet és el premi
d'entrada a l'Era 1, no un concepte més a digerir al tutorial.

### 5. Tecnologies universals proposades

| id | Nom | Cicle | ≈ Data | Fita que representa | Beneficia |
|----|-----|-------|--------|---------------------|-----------|
| `ut0_nucli` | El Nucli Preparat | 3 | ~185.000 AEC | Tècnica Levallois (Kapthurin ~300 ka, difusió MSA) | totes (primera eina millor) |
| `ut0_marisc` | Els Fruits del Mar | 8 | ~160.000 AEC | Pinnacle Point ~164 ka: marisc, recurs previsible | eix intel·lecte (planificar marees) |
| `ut0_ocre` | L'Ocre | 12 | ~140.000 AEC | Taller de Blombos ~100 ka; Pinnacle Point ~164 ka | eix espiritualitat |
| `ut0_adhesiu` | L'Adhesiu | 15 | ~125.000 AEC | Quitrà de beç ~200 ka; compostos Sibudu ~70 ka | eix intel·lecte |
| `ut0_ornament` | L'Ornament | 20 | ~100.000 AEC | Denes de Bizmoune ~142 ka, Skhul ~120 ka | eix sociabilitat |
| `ut0_adeu` | El Primer Adéu | 24 | ~80.000 AEC | Enterraments de Qafzeh/Skhul ~120–90 ka | eix espiritualitat |
| `ut0_simbol` | El Pensament Simbòlic | 29 | ~55.000 AEC | Gravats de Blombos ~75 ka, Diepkloof ~60 ka | totes — **connector de sortida** |

El ritme (1 tecnologia cada ~4 cicles) és deliberadament més dens que a l'Era 1:
el tutorial ha de mostrar el mecanisme "el temps porta regals" diverses vegades
en pocs minuts.

### 6. Mecànica signature

**La Primera Mort.** El tutorial introdueix la successió — el cor emocional del
joc — de manera *guiada i única*: cap al cicle ~15, el personatge mor de manera
scriptada (edat, no error del jugador), i el joc dedica una seqüència completa
a mostrar què es transmet (inclinació parcial, allò ensenyat) i què es perd
(allò mai ensenyat). El jugador ha d'haver tingut abans l'opció d'ensenyar
exactament una cosa al fill — i la seqüència de mort li mostra la conseqüència
de la seva tria.

Bucle: viure → triar què ensenyar → morir → veure l'herència → continuar com
el fill. És la successió dinàstica de l'Era 1 reduïda a un sol cas controlat,
perquè la primera mort *real* (Era 1, evitable, amb pressió) ja no necessiti
explicació.

### 7. Riscos de disseny

1. **Tutorial massa llarg**: 150.000 anys conviden a ficar-hi contingut. La
   disciplina és inversa: màxim 30 cicles, una sola zona nova descoberta, cap
   sistema (botiga, upgrades, destreses) que no sigui imprescindible per a
   l'Era 1. Tot el que es pugui ensenyar a l'Era 1, s'ensenya a l'Era 1.
2. **La mort scriptada pot semblar un game over**: si el jugador no entén que
   la successió és *la mecànica* i no un fracàs, abandona. La seqüència ha de
   ser cerimonial i en positiu (l'enterrament que acabes de desbloquejar amb
   `ut0_adeu` és el del teu propi personatge — usar-ho).
3. **Eixos sense etiqueta poden semblar soroll**: si el jugador no veu cap
   conseqüència de la inclinació fins al final, els deltes semblen decoratius.
   La "tendència" (§4) ha d'aparèixer aviat en forma de text de flavor reactiu,
   no només al tancament.

### 8. Connector de sortida

**El Pensament Simbòlic — CONFIRMAT.** És el llindar correcte per tres raons:
(a) arqueològicament, la "modernitat conductual plena" és exactament el que
separa el MSA del Paleolític Superior — tant si fou gradual (McBrearty &
Brooks 2000) com sobtada (Klein, ~50 ka); (b) com a desbloqueig actiu funciona:
el llinatge *aprèn a marcar* (gravats, ocre, denes acumulats durant l'era);
(c) obre directament la fantasia de l'Era 1, l'explosió simbòlica del
Paleolític Superior (`ut_art`, Chauvet, flautes, Venus). El nom és exacte i
es manté.

---

## Era 1 — Paleolític Superior (50.000–10.000 AEC) ✅ IMPLEMENTADA

Es documenta com a referència de calibratge. **No es redissenya.** Font:
`prototypes/bloodline/data.js` (estat post-lots A–D, 2026-06).

### 1. Avaluació del connector d'entrada

**El Pensament Simbòlic** (sortida de l'Era 0) encaixa de manera neta: el tret
distintiu del Paleolític Superior respecte del Mitjà és exactament l'explosió
simbòlica i tècnica (art parietal, ornament sistemàtic, indústria laminar,
os/ivori treballat). L'era implementada arrenca amb el clan sabent *significar*
però no sabent encara *fer néixer el foc* (`ut_foc`, cicle 10) — coherent.

### 2. Fites definitòries (tal com les implementa el calendari de tecnologies)

El calendari implementat mapa sorprenentment bé a l'evidència real (cicle c =
50.000 − 400c AEC):

| Tecnologia implementada | Cicle | ≈ Data | Evidència real |
|------------------------|-------|--------|----------------|
| `ut_foc` (fer foc a voluntat) | 10 | ~46.000 AEC | Ús de diòxid de manganès per neandertals tardans; encenedors de sílex+pirita del PS |
| `ut_eines` (fulloles especialitzades) | 16 | ~43.600 AEC | Indústria laminar aurinyaciana, ~43.000 AEC |
| `ut_art` | 36 | ~35.600 AEC | Chauvet ~36.000 AEC; flautes de Hohle Fels ~40.000 AEC; Venus de Hohle Fels |
| `ut_vestimenta` (agulles) | 50 | ~30.000 AEC | Agulles d'os de Denisova ~45 ka BP; vestits amb denes de Sungir ~32.000 AEC |
| `ut_corda` | 65 | ~24.000 AEC | Fragment de corda de 3 caps d'Abri du Maras (~45 ka, neandertal); fibres d'Ohalo II |
| `ut_ceramica` (figures, primers vasos) | 80 | ~18.000 AEC | Dolní Věstonice (figures, ~26.000 AEC); Xianrendong, Xina (vasos, ~18.000 AEC) |
| `ut_agricultura` (El Primer Conreu) | 92 | ~13.200 AEC | Explotació de cereals silvestres a Ohalo II (~21.000 AEC); sègol cultivat a Abu Hureyra (~11.000 AEC) |

### 3. Escala temporal

100 cicles × 400 anys. `LIFE_EXPECTANCY = 20` cicles → ~5 generacions per era.
Sessió mesurada: 60–90 min. **Aquesta és la vara de mesurar de totes les eres.**

### 4. Branques (implementades)

| Branca | Condicions (data.js) | Estil |
|--------|---------------------|-------|
| Caçador | impuls ≥ 0,18 AND sociabilitat ≤ 0,40 | risc alt, menjar abundant, salut fràgil |
| Recol·lector | impuls ≤ 0,10 AND intel·lecte ≥ 0,15 | constància, transformació d'aliments |
| Artesà | intel·lecte ≥ 0,18 AND impuls ≤ 0,20 | material, eines, economia de compra |
| Místic | espiritualitat ≥ 0,22 AND sociabilitat ≥ 0,19 | reputació, cohesió, salut de grup |

### 5. Tecnologies universals

Les 7 de la taula del punt 2 (30 habilitats de branca penjant-ne, després dels
lots A–D).

### 6. Mecànica signature

**Successió dinàstica amb herència d'inclinació** (85% d'inclinació, destreses
al 60%, habilitats segons `inheritanceRate` + bonus d'ensenyança). És la
mecànica fundacional: totes les eres posteriors la transformen, cap no la
ignora.

### 7. Riscos de disseny (observats, no teòrics)

1. **Branca sense menjar propi**: el Místic va néixer sense font de food i va
   requerir rebalanç (lots B–C). Lliçó per a totes les eres: *cada branca ha de
   poder menjar sola*.
2. **Deserts de desbloqueig**: el Recol·lector va tenir 28 cicles sense cap
   habilitat nova (cicles 36–64) fins que el lot D va moure `bt_calendari_natural`.
   Lliçó: mapar la línia temporal de desbloquejos per branca abans d'implementar.
3. **Accions de cost zero**: tota acció amb `execute_cost: 0` necessita
   contrapartida (regla §7.4 del content review). Lliçó portable a totes les eres.

### 8. Connector de sortida

**El Primer Conreu** (`ut_agricultura`, cicle 92) — implementat i correcte:
no és "l'agricultura" feta, és el *gest* de seleccionar i sembrar, que és
exactament on comença l'Era 2.

---

## Era 2 — Neolític i Revolució Agrícola (10.000–3.500 AEC)

La transformació més profunda de la història de l'espècie: de 4 milions
d'humans mòbils a un món de pobles, ramats, graners, temples i desigualtat
heretable. No és un esdeveniment: són 6.500 anys de conseqüències en cadena
del gest de sembrar.

### 1. Avaluació del connector d'entrada

**El Primer Conreu — correcte i ja implementat.** Matís important que l'era ha
d'explotar: el sedentarisme *precedeix* l'agricultura (els natufians vivien en
poblats permanents caçant i recol·lectant, 'Ain Mallaha ~12.000 AEC), i el
monument precedeix el poblat agrícola (Göbekli Tepe, ~9.600 AEC, és obra de
caçadors-recol·lectors). L'Era 2 no comença amb camps: comença amb un poblat
que encara caça, i el conreu guanya pes cicle a cicle. Això dona una rampa
d'entrada suau des de les branques de l'Era 1.

### 2. Fites definitòries

1. **El poblat permanent** — Jericó PPNA (~9.500 AEC): muralla i torre de 8 m
   abans de la ceràmica. Çatalhöyük (7.100–5.700 AEC): ~5.000 habitants,
   cases adossades sense carrers, accés pel sostre.
2. **La domesticació animal** — cabra i ovella al Zagros/Anatòlia ~8.500–8.000
   AEC (Ganj Dareh); bou ~8.500 AEC; el ramat com a riquesa viva que camina.
3. **El monument ritual** — Göbekli Tepe (~9.600–8.000 AEC): pilars en T de
   10+ tones tallats per gent sense agricultura plena. El culte als
   avantpassats: cranis enguixats de Jericó (~9.000 AEC).
4. **La ceràmica utilitària** — Pròxim Orient ~7.000 AEC: l'olla canvia la
   dieta (bullir, fermentar, emmagatzemar líquids). Fermentació: beguda de
   Jiahu (Xina, ~7.000 AEC); vi de Hajji Firuz (~5.400 AEC).
5. **El teixit i el teler** — lli i llana; teles de Çatalhöyük ~6.000 AEC,
   fusaioles per tot arreu. Primera indústria domèstica.
6. **La irrigació** — canals de Choga Mami / cultura de Samarra ~6.000 AEC:
   l'aigua gestionada col·lectivament exigeix coordinació supra-familiar.
7. **El megàlit** — alineaments de Carnac ~4.500 AEC, sepulcres de corredor
   atlàntics: territori marcat amb morts; la terra té propietaris ancestrals.
8. **La violència organitzada** — fossa de Talheim (~5.000 AEC): 34 individus
   executats amb destrals de pedra. L'excedent es pot robar; apareix la guerra.

### 3. Escala temporal

**100 cicles, 1 cicle ≈ 65 anys** (10.000 → 3.500 AEC). Model dinàstic
estàndard: `LIFE_EXPECTANCY` ~20 cicles, ~5 generacions. Sessió: 60–90 min.
És l'era germana de l'Era 1 en estructura — deliberadament: el jugador acaba
de aprendre el joc i aquí ha de reconèixer-lo amb contingut nou.

### 4. Branques proposades

| Branca | Eix dominant | Estil de joc | Evolució des de l'Era 1 |
|--------|-------------|--------------|------------------------|
| **Pagès** | intel·lecte ↑, impuls ↓ | cicles de sembra/collita, gestió del graner, rendiment diferit | hereu directe del Recol·lector: la paciència es torna calendari |
| **Pastor** | impuls ↑, sociabilitat ↓ | mobilitat, transhumància, ramat com a banc ambulant, fricció amb pagesos | hereu del Caçador: l'animal perseguit es torna animal guiat |
| **Terrissaire** (artesà sedentari) | intel·lecte ↑, espiritualitat ↓ | transformació (olla, teler, obsidiana), comerç incipient | hereu de l'Artesà amb economia de taller fix |
| **Sacerdot dels Avantpassats** | espiritualitat ↑, sociabilitat ↑ | monument, festa, cohesió; mobilitza treball d'altres | hereu del Místic: el xaman itinerant es torna custodi d'un lloc sagrat |

La tensió estructural de l'era és **Pagès ↔ Pastor** (Caín i Abel: terra fixa
contra ramat mòbil, la primera guerra de classes de la història) amb el
Sacerdot com a àrbitre que captura excedent de tots dos. Cap branca no
desapareix de l'Era 1, però totes canvien d'ofici: és l'era que ensenya que
les branques són *etiquetes d'era sobre eixos persistents*.

### 5. Tecnologies universals proposades

| id | Nom | Cicle | ≈ Data | Fita que representa | Beneficia |
|----|-----|-------|--------|---------------------|-----------|
| `ut2_llar` | La Llar Permanent | 8 | ~9.500 AEC | Jericó PPNA: el poblat amb muralla | totes; activa la mecànica signature |
| `ut2_ramat` | El Ramat | 20 | ~8.700 AEC | Domesticació de cabra/ovella al Zagros | Pastor; Pagès (tracció, fem) |
| `ut2_olla` | L'Olla | 40 | ~7.400 AEC | Ceràmica utilitària del Pròxim Orient | Terrissaire; Pagès (emmagatzematge) |
| `ut2_teler` | El Teler | 55 | ~6.400 AEC | Teixits de Çatalhöyük | Terrissaire; Pastor (llana) |
| `ut2_canal` | El Canal | 65 | ~5.800 AEC | Irrigació de Choga Mami / Samarra | Pagès; Sacerdot (coordinar braços) |
| `ut2_megalit` | La Pedra Dreçada | 80 | ~4.800 AEC | Carnac, sepulcres de corredor | Sacerdot; totes (territori reclamat) |
| `ut2_coure` | La Fosa del Coure | 94 | ~3.900 AEC | Forn de Belovode (Sèrbia, ~5.000 AEC); difusió calcolítica | Terrissaire — **connector de sortida** |

### 6. Mecànica signature

**L'Assentament: el poblat i el graner.** El canvi social fonamental del
Neolític és l'*economia de retorn diferit*: treballes ara per menjar d'aquí
a mig any, i l'excedent emmagatzemat és alhora seguretat i temptació.

Bucle: les accions de Pagès produeixen **Gra al graner** (no menjar immediat);
cada cicle el graner alimenta el clan automàticament; els anys dolents
(events de pressió: secada, plaga, gelada) es mengen el graner — i un graner
gran atrau rosegadors i ràtzies (Talheim). En paral·lel, per primera vegada
hi ha **construccions persistents** (muralla, graner millorat, pou, santuari)
que es compren amb Gra, no es perden amb la successió i milloren el poblat per
a totes les generacions futures. És l'evolució natural de la persistència de
`material` entre generacions de l'Era 1, feta visible i espacial.

La successió dinàstica continua intacta — el que canvia és que ara *el lloc*
també hereta.

### 7. Riscos de disseny

1. **L'agricultura ho devora tot**: històricament el conreu va desplaçar la
   resta de modes de vida; mecànicament, si el graner és l'única seguretat
   real, Pastor i Sacerdot es tornen subòptims. Contramesura: el graner ha de
   tenir fallades catastròfiques periòdiques (males collites encadenades) que
   només el ramat (banc mòbil) i la xarxa ritual (redistribució del Sacerdot)
   amorteixen. La paradoxa històrica real — els primers pagesos eren més
   baixos, més malalts i amb més càries que els caçadors — és la guia de
   balanç: sembrar no ha de ser estrictament millor, ha de ser *diferent*.
2. **El sedentarisme mata l'exploració**: l'Era 1 té descoberta de zones com a
   motor de novetat; un poblat fix pot deixar el mapa mort. Contramesura: les
   zones es redefineixen com a *territoris d'ús* (pastures d'estiu, vetes
   d'obsidiana, aiguamolls) que el Pastor i el Terrissaire mantenen actius.
3. **Bola de neu del graner**: excedent → més braços → més excedent. Si no hi
   ha embornals, al cicle 60 el menjar és trivial. Els embornals històrics són
   exactament el contingut de l'era: el monument (el Sacerdot crema excedent en
   pedra i festa) i la guerra (la ràtzia escala amb la mida del graner).

### 8. Connector de sortida

**La Fosa del Coure — CONFIRMAT, amb precisió de nom.** Es recomana "La Fosa"
(reducció de mineral al forn) i no "La Metal·lúrgia" en general: el coure natiu
martellejat existeix des de ~8.000 AEC (Çayönü) sense canviar res socialment;
el que obre l'Edat del Bronze és el *forn que transforma pedra en metall* —
Belovode (Sèrbia, ~5.000 AEC, Radivojević et al. 2010) i la difusió
calcolítica posterior (Ötzi, ~3.300 AEC, ja porta una destral de coure quasi
pur). És desbloqueig actiu (forn + mineral + coneixement del foc extrem, una
extensió natural del forn ceràmic del Terrissaire), i obre directament la
fantasia de l'Era 3: el metall com a poder.

---

## Era 3 — Edat del Bronze (3.500–1.200 AEC)

L'era de la primera complexitat: ciutat, estat, escriptura, llei, imperi i
comerç a milers de quilòmetres — tot en 2.300 anys. I l'era del primer
col·lapse sistèmic: cap altre període acaba de manera tan dramàtica.

### 1. Avaluació del connector d'entrada

**La Fosa del Coure — correcte.** El bronze pròpiament dit (aliatge amb estany)
no és el connector sinó la primera tecnologia universal de l'era: la seqüència
coure → coure arsenical (Maykop, IV mil·lenni) → bronze d'estany (~3.000 AEC)
es desplega *dins* l'era. Això és fidel a l'arqueologia (el Calcolític és
transició, no era pròpia) i mecànicament dona a l'era una rampa: comences amb
coure tou i acabes amb panòplies de bronze.

### 2. Fites definitòries

1. **La ciutat** — Uruk: ~40.000 habitants cap a 3.100 AEC, temples
   monumentals, producció estandarditzada (els bols de vora bisellada com a
   ració de treballador). Per primer cop, la majoria dels teus veïns són
   desconeguts.
2. **L'escriptura** — cuneïforme d'Uruk IV (~3.300 AEC), nascuda de la
   comptabilitat de temple (fitxes d'argila → tauleta); jeroglífics d'Abidos
   (~3.250 AEC). Durant segles, escriure = comptar.
3. **La roda i el carro** — vas de Bronocice (~3.400 AEC), roda de Ljubljana
   (~3.150 AEC); el carro de guerra lleuger de Sintashta (~2.000 AEC)
   revoluciona la guerra i crea la primera aristocràcia internacional.
4. **El comerç interregional** — l'estany no és on és el coure: el bronze
   *obliga* a comerciar. Colònies mercantils assíries a Kanesh (~1.950–1.750
   AEC, 23.000 tauletes d'arxius privats); el derelicte d'Uluburun (~1.320
   AEC): 10 tones de coure, 1 d'estany, vidre, ivori, àmbar bàltic.
5. **La llei escrita** — codi d'Ur-Nammu (~2.100 AEC), codi d'Hammurabi
   (~1.754 AEC): la justícia deixa de dependre de qui ets per dependre —
   en teoria — del que està escrit.
6. **L'imperi** — Sargon d'Acad (~2.334 AEC): per primer cop, un poder governa
   gent que parla llengües diferents.
7. **La vela** — el Nil (~3.100 AEC) i després el Mediterrani: moure 10 tones
   per aigua costa el que en costa 1 per terra.
8. **El col·lapse final** — ~1.200–1.150 AEC: en 50 anys cauen l'imperi hitita,
   Ugarit, el sistema palatí micènic; Egipte sobreviu tocat ("Pobles del Mar",
   sequera, revoltes — col·lapse de sistema, no una sola causa).

### 3. Escala temporal

**90 cicles, 1 cicle ≈ 25 anys** (3.500 → 1.200 AEC). Dinàstic estàndard
(~18 cicles per personatge, ~5 generacions). Sessió: 55–80 min. Es retalla
lleugerament respecte de les eres 1–2 perquè el final de l'era (el col·lapse,
vegeu §6) concentra molta densitat de joc.

### 4. Branques proposades

| Branca | Eix dominant | Estil de joc | Evolució des de l'Era 2 |
|--------|-------------|--------------|------------------------|
| **Guerrer** | impuls ↑ | carro, panòplia, ràtzia i defensa; risc i botí | hereu del Pastor: les cultures del carro (Sintashta) *eren* ramaders; la mobilitat es fa militar |
| **Comerciant** | sociabilitat ↑, impuls ↑ | rutes, caravanes, contactes; riquesa que viatja | trenca del Pastor/Terrissaire: la mobilitat es fa mercantil. Branca nova de debò — l'eix sociabilitat estrena ofici |
| **Escriba** | intel·lecte ↑, impuls ↓ | comptabilitat, administració del palau, contractes | hereu del Terrissaire: literalment — l'escriptura neix de fitxes i tauletes d'*argila* |
| **Sacerdot del Temple** | espiritualitat ↑, sociabilitat ↑ | el temple com a banc i graner sagrat; festivals, oracles | continuïtat del Sacerdot dels Avantpassats, ara amb economia redistributiva pròpia |

**Nota de disseny — absorció de branca**: el Pagès no desapareix, *submergeix*:
l'agricultura es torna el substrat econòmic del món (qui juga és l'elit que en
viu). És un patró que es repetirà: quan un mode de vida es torna majoritari i
anònim, deixa de ser branca jugable i passa a ser simulació de fons. Cal
explicar-ho al jugador en la transició d'era (la crònica ho pot narrar: "els
nets dels teus camps ja no tenen nom").

### 5. Tecnologies universals proposades

| id | Nom | Cicle | ≈ Data | Fita que representa | Beneficia |
|----|-----|-------|--------|---------------------|-----------|
| `ut3_roda` | La Roda | 6 | ~3.350 AEC | Bronocice, Ljubljana | Comerciant, Pagès de fons (carro de bous) |
| `ut3_escriptura` | L'Escriptura | 10 | ~3.250 AEC | Uruk IV, Abidos | Escriba (el funda com a branca) |
| `ut3_bronze` | El Bronze | 20 | ~3.000 AEC | Aliatge d'estany, Mesopotàmia/Caucas | Guerrer, Comerciant (demanda d'estany) |
| `ut3_vela` | La Vela | 32 | ~2.700 AEC | Naus del Nil i del Mediterrani | Comerciant |
| `ut3_llei` | La Llei | 55 | ~2.100 AEC | Ur-Nammu, després Hammurabi | Escriba, Sacerdot (legitimitat) |
| `ut3_carro` | El Carro de Guerra | 60 | ~2.000 AEC | Sintashta; difusió a tot Euràsia | Guerrer |
| `ut3_ferro` | La Fosa del Ferro | 86 | ~1.300 AEC | Ferro hitita; difusió post-col·lapse | totes — **connector de sortida** |

### 6. Mecànica signature

**Rutes i Dependències.** El canvi social fonamental: per primer cop la teva
prosperitat depèn estructuralment de gent que no coneixeràs mai (l'estany ve
de mines a 2.000 km). 

Bucle: el jugador obre **rutes comercials** (riu, caravana, mar) cap a fonts
de recursos llunyanes; cada ruta oberta dona un multiplicador permanent a la
producció (el bronze necessita estany; el temple, lapislàtzuli; el palau,
cedre) — però cada ruta és també un punt de fallada: els events de pressió ja
no afecten només el clan, sinó la *xarxa* (pirates, guerra llunyana, sequera a
l'altre extrem). Com més rutes, més rica i més fràgil és la dinastia. L'últim
acte de l'era (cicles ~75–90) és el col·lapse del Bronze Final: les rutes
cauen una rere l'altra, i el joc avalua la *resiliència* construïda — el
jugador que ha diversificat (i el Guerrer que pot defensar; el Sacerdot que
manté la cohesió) travessa el col·lapse; el monocultiu de multiplicadors,
no. El col·lapse no és un final scriptat: és un estrès-test del que has
construït.

### 7. Riscos de disseny

1. **Bola de neu de multiplicadors**: les rutes que multipliquen producció són
   el primer mecanisme de creixement compost del joc. Si no tenen cost de
   manteniment per cicle i risc real de tall, el final d'era és trivial.
   El col·lapse final ha d'espantar de debò el jugador sobreestès.
2. **L'Escriba avorrit**: administrar i comptar pot ser mecànicament pla al
   costat del carro de guerra. L'Escriba necessita el seu moment de poder
   visible: contractes que asseguren rutes (assegurança contra el risc del
   Comerciant), i en el col·lapse, *l'arxiu* — la dinastia escriba conserva
   tecnologies de branca a través de la catàstrofe que les altres perden.
3. **El col·lapse com a càstig injust**: si el jugador percep el final d'era
   com un cop de guió inevitable, trenca el contracte de fairness (la pressió
   ve del món, però ha de ser *navegable*). Senyals d'avís des del cicle ~70
   (rutes que s'encareixen, refugiats, demandes del palau) i eines reals de
   mitigació són obligatoris.

### 8. Connector de sortida

**La Fosa del Ferro — CONFIRMAT.** És el connector perfecte per raons
històriques i mecàniques alhora: el ferro no va guanyar per ser millor (el
primer ferro és pitjor que el bon bronze), va guanyar per ser *democràtic* —
hi ha mineral de ferro pertot, i quan el col·lapse va tallar les rutes de
l'estany, fondre ferro local va ser la sortida. És a dir: el connector de
sortida és literalment *la resposta del llinatge al col·lapse de la mecànica
signature de l'era*. Desbloqueig actiu (forns de més temperatura, forja en
calent), i obre la fantasia de l'Era 4: eines i armes per a tothom.

---

## Era 4 — Edat del Ferro i Món Clàssic (1.200 AEC–500 EC)

L'era axial: moneda, alfabet, filosofia, ciutadania, imperi universal i
religió universal. La més llarga de les eres "històriques" (1.700 anys) i la
més densa en herència viva: dret romà, filosofia grega, religions del llibre.

### 1. Avaluació del connector d'entrada

**La Fosa del Ferro — correcte.** L'Edat del Ferro comença de debò amb la
difusió post-col·lapse (~1.200–1.000 AEC al Mediterrani oriental). El ferro
barat reestructura la societat de baix a dalt: l'hoplita i el legionari són
possibles perquè un pagès es pot pagar una panòplia — el guerrer aristocràtic
del carro mor amb el bronze. L'era arrenca en un món de regnes petits i pobres
sortits del col·lapse: bon contrast dramàtic amb l'esplendor final de l'Era 3.

### 2. Fites definitòries

1. **L'alfabet** — fenici (~1.050 AEC, sarcòfag d'Ahiram); els grecs hi
   afegeixen vocals (~800 AEC). De ~600 signes cuneïformes a ~22 lletres:
   l'escriptura deixa de ser monopoli de l'Escriba.
2. **La moneda** — Lídia, ~610–600 AEC (electre encunyat d'Aliates i Cresos).
   El valor es torna anònim, portàtil i estatal: mercat i mercenari neixen
   alhora.
3. **L'Era Axial** (Jaspers) — ~800–200 AEC: Buda, Confuci, Zoroastre, els
   profetes hebreus, la filosofia jònica — simultàniament i sense contacte.
   La saviesa es deslliga del ritual: pots *pensar* la teva pròpia ètica.
4. **La ciutadania** — reformes de Clístenes a Atenes (508 AEC), República
   romana (509 AEC): el poder com a càrrec rotatori i no com a propietat.
   El cursus honorum com a carrera d'estat.
5. **L'imperi universal** — Aquemènides (camí reial, sàtrapes), Qin/Han
   (unificació i estandardització, 221 AEC), Roma (80.000 km de calçades,
   formigó — el Panteó, 126 EC). L'estat com a infraestructura.
6. **La ciència hel·lenística** — Biblioteca d'Alexandria (s. III AEC),
   Arquimedes, el mecanisme d'Anticitera (~150–100 AEC): càlcul astronòmic
   amb engranatges. El coneixement com a institució finançada.
7. **La religió universal** — edictes d'Aixoka (~250 AEC) difonent el budisme;
   el cristianisme d'ecclesia perseguida a religió d'estat (Edicte de Milà
   313, Teodosi 380). La fe deixa de ser ètnica: es *tria*.
8. **El paper i el còdex** — paper de Cai Lun (105 EC); el còdex enquadernat
   substitueix el rotlle entre els s. I–IV EC. El llibre tal com el coneixem.

### 3. Escala temporal

**100 cicles, 1 cicle ≈ 17 anys** (1.200 AEC → 500 EC). Dinàstic estàndard,
~5 generacions. Sessió: 60–90 min. L'era és llarga i bicèfala (món arcaic /
món imperial); es recomana estructurar-la en **dos actes** amb la moneda i la
ciutadania (cicles ~35–42) com a frontissa — el mateix truc de canvi de
textura que l'Era 3 fa amb el col·lapse, aquí en positiu.

### 4. Branques proposades

| Branca | Eix dominant | Estil de joc | Evolució des de l'Era 3 |
|--------|-------------|--------------|------------------------|
| **Legionari** | impuls ↑ | la guerra com a carrera: campanyes, botí, terra de veterà, glòria | hereu del Guerrer, però plebeu: la panòplia barata de ferro el democratitza |
| **Magistrat** | sociabilitat ↑, intel·lecte ↑ | càrrecs, lleis, clienteles; el poder com a escala institucional | hereu de l'Escriba: de comptar gra a redactar lleis |
| **Filòsof** | intel·lecte ↑, espiritualitat ↑ | escola, deixebles, obres; pobre en moneda, ric en influència durable | **trencament axial**: se separa del Sacerdot — la saviesa ja no necessita el temple |
| **Mercader** | sociabilitat ↑, impuls ↑ | naus, mercats, moneda; el risc marítim com a aposta | continuïtat del Comerciant, ara amb moneda i assegurança (préstec a la gruixa) |

El Sacerdot del Temple submergeix parcialment: el sacerdoci clàssic és una
*magistratura* (pontifex maximus) — absorbit pel Magistrat — fins que al final
de l'era la religió universal el fa renéixer transformat (llavor de l'Era 5).

### 5. Tecnologies universals proposades

| id | Nom | Cicle | ≈ Data | Fita que representa | Beneficia |
|----|-----|-------|--------|---------------------|-----------|
| `ut4_alfabet` | L'Alfabet | 10 | ~1.030 AEC | Alfabet fenici, vocals gregues | Mercader, Filòsof (alfabetització barata) |
| `ut4_moneda` | La Moneda | 36 | ~590 AEC | Encunyacions lídies | Mercader, Legionari (la soldada) |
| `ut4_pensament` | El Pensament Axial | 42 | ~485 AEC | Filosofia jònica, Buda, Confuci | Filòsof (el funda com a branca) |
| `ut4_obra` | L'Obra Pública | 55 | ~265 AEC | Aqua Appia (312 AEC), calçades, formigó | Magistrat, totes (infraestructura) |
| `ut4_paper` | El Paper | 77 | ~109 EC | Cai Lun, 105 EC | Filòsof, Magistrat |
| `ut4_codex` | El Còdex | 95 | ~415 EC | El llibre enquadernat dominant (s. IV) | totes — **connector de sortida** |

### 6. Mecànica signature

**Càrrecs i Institucions (el cursus honorum).** El canvi social fonamental:
el poder deixa de ser una possessió personal i es torna un *càrrec* — una
posició dins d'una institució que sobreviu a qui l'ocupa.

Bucle: a partir del segon acte, el personatge pot presentar-se a **càrrecs**
(edil, jutge, estrateg, pontífex — flavor segons branca) gastant reputació i
cicles. Un càrrec dona poders d'era visibles mentre s'ocupa (l'edil programa
festes que pugen la cohesió; l'estrateg tria a quines campanyes va el
Legionari) i deixa **capital institucional** permanent a la dinastia quan
s'acaba: la família consular té descomptes de reputació per a tots els càrrecs
futurs. La reputació — que des de l'Era 1 és un comptador passiu — es torna
*moneda activa amb embornal*. La tensió: els cicles que passes en un càrrec no
els passes produint; el poder públic es paga amb la hisenda privada (com els
evergetes reals).

### 7. Riscos de disseny

1. **Era doble**: 1.700 anys que contenen Homer i sant Agustí. Sense els dos
   actes explícits (§3), el contingut queda o diluït o anacrònic (hoplites
   comprant còdexs). Cada tecnologia universal hauria de re-texturitzar
   visiblement les accions disponibles.
2. **El Filòsof sense economia**: és el Místic de l'Era 1 una altra vegada —
   branca d'influència sense font de recursos pròpia (lliçó §7.1 de l'Era 1:
   *cada branca ha de poder menjar sola*). Solució de partida: l'escola cobra
   matrícula (Isòcrates es va fer ric ensenyant retòrica) i les obres escrites
   són actius que rendeixen mentre la inclinació es manté.
3. **Eurocentrisme estructural**: l'era convida a fer "Roma: el joc". Les
   tecnologies proposades són deliberadament multiregionals (alfabet fenici,
   pensament axial euroasiàtic, paper xinès) i el flavor de càrrecs ha de
   funcionar igual per a un magistrat han que per a un romà. Regla: cap nom
   propi de civilització als ids ni als noms de tecnologia.

### 8. Connector de sortida

**Es proposa substituir "El Codi Escrit" per "El Còdex".** El nom original és
ambigu i, en les dues lectures possibles, cronològicament problemàtic: si
significa *codi legal*, arriba mil·lennis tard (Ur-Nammu i Hammurabi són Era 3;
les XII Taules, 450 AEC, són del primer acte d'aquesta era); si significa el
*Corpus Iuris* de Justinià (529–534 EC), és un sol esdeveniment bizantí que no
desbloqueja la fantasia medieval. **El còdex** — el llibre enquadernat de
pàgines, que entre els s. I i IV EC substitueix el rotlle — sí que ho fa tot:
és un artefacte (principi 2), s'adopta activament (principi 1), i és
literalment la tecnologia que el monjo de l'Era 5 copiarà durant cinc segles
(principi 3). A més inaugura la cadena material del llibre que vertebra mig
joc: còdex (E4) → scriptorium (E5) → impremta (E6) → premsa de masses (E7–8) →
web (E9). La descripció de la tecnologia pot abraçar les dues lectures: el
còdex és també el suport on es fixen el cànon bíblic *i* el dret romà.

---

## Era 5 — Alta Edat Mitjana (500–1.000 EC)

Mal anomenada "fosca": és l'era de la supervivència del coneixement en arxipèlag
— monestirs a Occident, Bagdad i Constantinoble a Orient, Chang'an a l'altre
extrem del món — i de la reconstrucció de l'ordre des de baix: el jurament
personal substitueix l'estat absent.

### 1. Avaluació del connector d'entrada

**El Còdex** (substituint "El Codi Escrit", vegeu Era 4 §8). Encaixa: l'Alta
Edat Mitjana occidental *és* l'era del còdex — Cassiodor funda el Vivarium
(~540) i Benet escriu la Regla (~530) en la mateixa generació; tot el que
sabem de la literatura antiga sobreviu perquè algú el va copiar en còdexs
entre els segles VI i IX. L'entrada a l'era és un món on l'estructura imperial
s'ha esvaït (a Occident) i el que el llinatge *té* és el llibre, la terra i
la paraula donada.

### 2. Fites definitòries

1. **El monaquisme** — Regla de sant Benet (~530): *ora et labora*, el monestir
   com a unitat econòmica autosuficient amb scriptorium. La minúscula
   carolíngia (~800) estandarditza l'escriptura de tot Occident.
2. **L'islam i la ciència de Bagdad** — hègira (622); Casa de la Saviesa
   d'al-Mamun (~830): al-Khwarizmí escriu el llibre que dona nom a l'àlgebra
   (~820), els números indis comencen el viatge cap a Occident.
3. **El vassallatge i el mas** — l'ordre carolingi: protecció a canvi de
   fidelitat jurada, la senyoria rural com a cèl·lula econòmica. L'estrep
   (difusió europea s. VII–VIII, via àvars) fa del genet cuirassat el centre
   del sistema militar.
4. **El paquet agrari nòrdic** — arada pesada de pala (s. VIII–X), collar
   d'espatlla (s. IX), rotació triennal (carolíngia): el sòl pesat del nord
   d'Europa, inservible per a l'arada mediterrània, es torna el graner del
   continent. (És el connector de sortida: vegeu §8.)
5. **Les rutes llunyanes** — víkings de l'Atlàntic al Volga (Islàndia 874;
   L'Anse aux Meadows, datat exactament al 1021 EC per tempesta solar),
   mercaders radhanites entre Al-Àndalus i la Xina, la ruta de la seda Tang.
   Chang'an i Bagdad, ciutats de prop d'un milió d'habitants.
6. **La impressió xilogràfica** — sutra del Diamant (868 EC, el llibre imprès
   datat més antic): a l'altre extrem d'Euràsia, el llibre ja es replica.
7. **El molí d'aigua pertot** — tecnologia romana (Barbegal) que ara es
   generalitza: el Domesday Book (1086) en censa ~6.000 només a Anglaterra.
   Primera font d'energia no muscular d'ús quotidià.

### 3. Escala temporal

**80 cicles, 1 cicle ≈ 6,25 anys** (500 → 1.000 EC). Dinàstic, ~4 generacions
(`LIFE_EXPECTANCY` ~20 cicles). Sessió: 50–70 min. Era deliberadament més
curta i recollida: després del fresc imperial de l'Era 4, aquesta és una era
de proximitat — poques zones, vincles densos.

### 4. Branques proposades

| Branca | Eix dominant | Estil de joc | Evolució des de l'Era 4 |
|--------|-------------|--------------|------------------------|
| **Monjo Copista** | espiritualitat ↑, intel·lecte ↑ | scriptorium, conservació, horta i cervesa del monestir | **fusió inversa de l'axial**: Filòsof + Sacerdot tornen a ser u — la saviesa torna a viure dins la fe |
| **Cavaller** | impuls ↑ | jurament d'armes, incursió i defensa del mas; honor com a recurs | hereu del Legionari, però el vincle és personal (al senyor), no institucional (a l'estat) |
| **Mercader de Rutes Llunyanes** | sociabilitat ↑, impuls ↑ | viatges llargs d'alt risc i alt marge (ambre, seda, esclaus, plata) | hereu del Mercader; sense estat que protegeixi, el risc es gestiona amb parentiu i juraments |
| **Senyor del Mas** | sociabilitat ↑, intel·lecte ↑ | gestió de terra i braços, hospitalitat, xarxa de fidelitats locals | hereu del Magistrat: la institució s'ha fet personal — *tu* ets la llei del teu territori |

### 5. Tecnologies universals proposades

| id | Nom | Cicle | ≈ Data | Fita que representa | Beneficia |
|----|-----|-------|--------|---------------------|-----------|
| `ut5_regla` | La Regla | 6 | ~540 EC | Regla de Benet, Vivarium de Cassiodor | Monjo (el funda com a branca) |
| `ut5_estrep` | L'Estrep | 30 | ~690 EC | Difusió europea via àvars, s. VII | Cavaller |
| `ut5_algebra` | Els Números Nous | 53 | ~830 EC | Casa de la Saviesa, al-Khwarizmí | Mercader, Monjo (còmput) |
| `ut5_collar` | El Collar d'Espatlla | 56 | ~850 EC | Tracció equina eficient, s. IX | Senyor del Mas |
| `ut5_xilografia` | La Xilografia | 59 | ~868 EC | Sutra del Diamant, Tang | Monjo, Mercader |
| `ut5_moli` | El Molí | 64 | ~900 EC | Generalització; Domesday en censa ~6.000 | Senyor del Mas, Monjo |
| `ut5_arada` | L'Arada Pesada | 76 | ~975 EC | Paquet arada+rotació triennal, s. VIII–X | totes — **connector de sortida** |

### 6. Mecànica signature

**Juraments i Fidelitats.** El canvi social fonamental: sense estat, l'ordre
es construeix de persona a persona — tota seguretat és un vincle jurat, i
trencar-lo és pitjor que perdre una batalla.

Bucle: el jugador pot **jurar vincles** amb entitats persistents del món (un
senyor, un monestir, una germandat mercantil, una vila) — cada jurament dona
protecció o accés (si cau la collita, el senyor t'avitualla; el monestir
ensenya a llegir als teus fills) a canvi d'**obligacions periòdiques** que el
joc cobra de debò (cicles d'hoste armada, delme, hospitalitat). Els vincles
sobreviuen a la successió: l'hereu hereta els juraments del pare, i *renegar-ne*
és possible però crema reputació dinàstica durant generacions. És l'evolució
directa del capital institucional de l'Era 4: la institució s'ha tornat una
persona amb nom, i la relació, bidireccional. Mecànicament, és la primera era
on el món conté actors persistents amb memòria — la llavor dels sistemes
socials de les eres modernes.

### 7. Riscos de disseny

1. **L'era del "mentrestant"**: si l'Alta Edat Mitjana es dissenya com a
   trànsit empobrit entre Roma i les catedrals, serà l'era que tothom voldrà
   saltar-se. La resposta és el to: és l'era més íntima del joc (vincles amb
   nom i cara), i Bagdad/Chang'an existeixen al contingut — la "foscor" és
   una perspectiva, no un fet.
2. **El Cavaller depredador òptim**: si la incursió rendeix més que el vincle,
   el sistema de juraments queda en flavor. La ràtzia ha de tenir retorn
   decreixent dur (represàlies amb memòria — els actors persistents recorden)
   i el camí d'honor, recompenses creixents per antiguitat de vincle.
3. **Asimetria d'informació religiosa**: el Monjo concentra lectura, còmput i
   xilografia — pot esdevenir la branca "completa". Contramesura: el monestir
   imposa obligacions reals (els seus juraments són els més cars en cicles) i
   la seva riquesa és comunal, no dinàstica — convertir-la en patrimoni
   familiar ha de costar reputació (la simonia té nom per alguna cosa).

### 8. Connector de sortida

**Es proposa substituir "La Impremta" per "L'Arada Pesada".** La impremta de
tipus mòbils és de ~1440–1455: és el cor de l'Era 6, no la seva porta (hi
apareix com a `ut6_impremta`, cicle 75). El que realment obre el món de
1000–1300 — viles noves, catedrals, universitats, fires de Xampanya — és
l'excedent agrari del nord: arada de pala + collar + rotació triennal dupliquen
la productivitat i la població europea es duplica entre el 1000 i el 1300. És
desbloqueig actiu del llinatge (adoptar el paquet agrari al teu mas), artefacte
concret, i és la *condició material* de tota la fantasia de l'era següent: no
hi ha burgs sense gra que els alimenti. Com a bonus de coherència, el connector
surt de la branca més humil (Senyor del Mas / pagesia) — bon contrapès al
protagonisme del Monjo i el Cavaller.

---

## Era 6 — Baix Medieval i Renaixement (1.000–1.600 EC)

L'era de l'acceleració: en sis segles, Europa passa de perifèria rural a
connectar tots els continents. Universitats, banca, rellotge, impremta,
caravel·la — i pel mig, la mortaldat més gran de la història documentada.

### 1. Avaluació del connector d'entrada

**L'Arada Pesada** (substituint "La Impremta", vegeu Era 5 §8). L'era s'obre
amb el boom material que l'excedent agrari fa possible: rompudes, viles
franques, mercats setmanals. El jugador entra amb el rebost ple per primer
cop en tot el joc — i descobreix que l'abundància crea problemes nous (on
inverteixo l'excedent?) que són exactament la fantasia d'aquesta era.

### 2. Fites definitòries

1. **La universitat** — Bolonya (1088), París (~1150), Oxford: corporació
   autònoma de mestres i estudiants amb títol reconegut. El coneixement surt
   del claustre.
2. **La revolució comercial** — lletra de canvi (s. XIII), banca Medici (1397),
   partida doble (Gènova 1340, codificada per Pacioli 1494), la Hansa. El
   diner es mou sense moure monedes; el crèdit es torna infraestructura.
3. **El rellotge mecànic** — ~1280–1300 (a la Xina, Su Song ja el 1092):
   el temps es torna públic, uniforme i laic — les hores del campanar
   substitueixen les hores canòniques.
4. **La Pesta Negra** — 1347–1351: mor el 30–60% d'Europa. Conseqüència
   paradoxal: el treball es torna car, el servatge s'enfonsa a Occident,
   els salaris reals pugen — el supervivent viu millor que el seu avi.
5. **La impremta** — Gutenberg, Magúncia (~1440–1455, Bíblia de 42 línies):
   cap a 1500 ja s'han imprès milions de volums. El preu del llibre cau en
   picat; Luter (1517) és impensable sense ella.
6. **La pólvora a Europa** — canons (~1320s); Constantinoble cau davant la
   bombarda d'Urban (1453). El castell del Cavaller queda obsolet.
7. **L'oceà** — caravel·la, brúixola (Xina ~1040s, Mediterrani ~1190),
   portolans: Dias (1488), Colom (1492), Gama (1498), la volta d'Elcano
   (1522). Per primer cop, totes les costes del món es toquen — amb
   conseqüències demogràfiques i colonials brutals al continent americà.
8. **L'ull nou** — perspectiva de Brunelleschi (~1415–1436, cúpula de
   Florència), anatomia de Vesali (1543), heliocentrisme de Copèrnic (1543):
   mirar el món directament, mesurar-lo, dibuixar-lo com és.

### 3. Escala temporal

**100 cicles, 1 cicle ≈ 6 anys** (1.000 → 1.600 EC). Dinàstic, ~5 generacions.
Sessió: 60–90 min. Tres actes naturals: el boom (cicles 1–57), la Pesta i el
trasbals (58–70), el Renaixement i l'oceà (71–100).

### 4. Branques proposades

| Branca | Eix dominant | Estil de joc | Evolució des de l'Era 5 |
|--------|-------------|--------------|------------------------|
| **Banquer** | intel·lecte ↑, sociabilitat ↑ | crèdit, fires, lletres de canvi; riquesa abstracta que treballa sola | hereu del Mercader de Rutes: el viatge s'ha sedentaritzat en taula de canvi — el risc ja no es corre, es calcula |
| **Mestre Enginyer** | intel·lecte ↑, impuls ↑ | gremi, taller, obra: catedrals, cúpules, màquines; el saber fer com a monopoli | hereu del Monjo pel costat del saber i de l'Artesà profund: Brunelleschi, Leonardo |
| **Navegant** | impuls ↑ | expedicions d'alt risc i retorn extrem; descoberta de zones literals al mapa | hereu del Cavaller: la petita noblesa sense herència és exactament qui embarca |
| **Reformador** | espiritualitat ↑, sociabilitat ↑ | predicació, impremta, comunitat de fe; la convicció com a força de masses | hereu del Monjo pel costat de la fe: la crisi de l'Església (cisma, indulgències) el llança fora del claustre |

El Monjo es bifurca (Mestre Enginyer / Reformador) i el Senyor del Mas
submergeix — la senyoria persisteix però deixa de ser on passa la història.

### 5. Tecnologies universals proposades

| id | Nom | Cicle | ≈ Data | Fita que representa | Beneficia |
|----|-----|-------|--------|---------------------|-----------|
| `ut6_universitat` | La Universitat | 15 | ~1.090 EC | Bolonya 1088 | Mestre Enginyer, Reformador |
| `ut6_lletra` | La Lletra de Canvi | 45 | ~1.270 EC | Banca italiana del s. XIII | Banquer (el funda com a branca) |
| `ut6_rellotge` | El Rellotge | 48 | ~1.290 EC | Rellotges de torre, ~1280–1300 | totes (el cicle es subdivideix: +1 slot d'acció?) |
| `ut6_polvora` | La Pólvora | 55 | ~1.330 EC | Canons europeus, 1320s | Navegant; obsolescència del castell |
| `ut6_impremta` | La Impremta | 75 | ~1.450 EC | Gutenberg, 42 línies | Reformador, Mestre Enginyer |
| `ut6_caravella` | La Caravel·la | 80 | ~1.480 EC | Dias 1488, Colom 1492 | Navegant |
| `ut6_ciencia` | La Nova Ciència | 97 | ~1.585 EC | Copèrnic/Vesali 1543 → Galileu 1609 | totes — **connector de sortida** |

### 6. Mecànica signature

**Mecenatge i Llegat.** El canvi social fonamental: per primer cop a la
història, una família privada pot comprar la immortalitat cultural — els
Medici són banquers, i són recordats per Botticelli.

Bucle: l'excedent (Florins) es pot invertir en **obres** — una capella, un
retaule, una expedició, una edició impresa, una càtedra. Cada obra és un
projecte de diversos cicles amb cost alt i cap retorn material… però genera
**Llegat**: reputació dinàstica *permanent* que persisteix entre eres i
alimenta directament la crònica del llinatge (cada obra hi queda inscrita amb
nom). És el primer embornal de riquesa del joc el retorn del qual és
explícitament narratiu i meta (la puntuació d'era pondera `W_REP`). Tensió de
disseny deliberada: el jugador optimitzador ha de decidir si "malgasta" en
bellesa — i el joc li ensenya que la dinastia que només acumula no deixa res.
És l'evolució del monument del Sacerdot neolític, ara individual i signada.

### 7. Riscos de disseny

1. **La Pesta com a cop de guió**: matar mig món per calendari trenca el
   contracte de fairness pitjor que el col·lapse del Bronze (allà el jugador
   gestionava rutes; aquí ningú no tria la pandèmia). S'ha de dissenyar com a
   *transformació*, no com a càstig: pèrdues dures scriptades amb senyals
   previs (rumors de l'est, cicles 55+), però el món post-pesta ha d'oferir
   millors oportunitats (salaris alts, terra barata, mobilitat social) — que
   és exactament el que va passar.
2. **L'interès compost del Banquer**: el crèdit és la primera mecànica del
   joc on els diners fan diners sense acció del jugador. Sense embornals
   (mecenatge car, fallides sobiranes — Eduard III va arruïnar els Bardi i
   els Peruzzi el 1345 —, usura penalitzada en reputació), al cicle 70 el
   Banquer juga sol. Les fallides de prestataris han de ser un risc real i
   periòdic.
3. **La conquesta com a contingut**: el Navegant toca l'inici del colonialisme
   i del comerç d'esclaus. Decisió de to necessària abans de produir contingut:
   les expedicions del joc són descoberta, comerç i naufragi; l'extracció
   colonial violenta no es modela com a acció comprable — apareix, si apareix,
   com a event amb conseqüències morals i de reputació, mai com a estratègia
   òptima silenciosa. Deixar-ho per escrit al content plan de l'era.

### 8. Connector de sortida

**Es proposa substituir "La Màquina de Vapor" per "La Nova Ciència".** El
vapor és de 1712 (Newcomen) — un segle dins de l'Era 7 — i saltar del 1600 al
vapor esborraria el pas real: la revolució científica. Entre 1543 (Copèrnic,
Vesali) i 1687 (els *Principia* de Newton) canvia la *manera de saber*:
experiment, instrument, publicació, societat científica (Royal Society, 1660).
És desbloqueig actiu perfecte (el llinatge adopta el mètode: telescopi,
dissecció, assaig), i és la porta exacta de la fantasia industrial — la
màquina de Watt neix d'un laboratori universitari (Watt era fabricant
d'instruments a Glasgow i treballava amb el químic Joseph Black). El vapor
passa a ser `ut7_vapor`, cicle ~38 de l'Era 7. El nom evita "El Mètode
Científic" (escolar) a favor de "La Nova Ciència" (és com en deien: *nuova
scienza*, Galileu 1638).

---

## Era 7 — Era Industrial i Imperialisme (1.600–1.914 EC)

L'era del despegament: després de deu mil anys en què la renda per càpita
mundial amb prou feines es mou, la corba es dispara. Carbó, vapor, fàbrica,
ferrocarril — i la pregunta social que encara dura: per a qui creix tot això?

### 1. Avaluació del connector d'entrada

**La Nova Ciència** (substituint el vapor, vegeu Era 6 §8). L'era s'obre el
1600 amb un segle i mig de ciència, agricultura millorada i comerç atlàntic
*abans* de la primera fàbrica — exactament el que la historiografia demana
(la revolució agrícola anglesa i la "industriosa" precedeixen la industrial).
El vapor arriba a mitja era com a tecnologia universal, no com a porta.

### 2. Fites definitòries

1. **La mecànica del món** — Newton, *Principia* (1687): el cel i la terra
   obeeixen la mateixa llei calculable. El paradigma de la màquina.
2. **La revolució agrícola** — sembradora de Tull (1701), rotació de Norfolk,
   tancaments (enclosures): menys braços per alimentar més gent — la mà
   d'obra "alliberada" (sovint expulsada) que la fàbrica absorbirà.
3. **El vapor** — Newcomen (1712) drenant mines; el condensador separat de
   Watt (1769): energia fòssil a voluntat, per primer cop la força no depèn
   de múscul, vent o aigua.
4. **La fàbrica** — filatura de Cromford d'Arkwright (1771): el treball
   sincronitzat al ritme de la màquina i del rellotge (l'eco de `ut6_rellotge`).
   Manchester, "Cottonopolis"; el cotó que lliga fàbrica anglesa i esclavitud
   americana.
5. **El ferrocarril i el telègraf** — Liverpool–Manchester (1830), Morse
   (1844), cable transatlàntic (1866): l'espai es contrau; el preu del blat
   de Chicago es sap a Londres el mateix dia.
6. **La qüestió social** — jornades de 14 hores, treball infantil (Factory
   Act, 1833), cartisme, sindicats, *Manifest* (1848): la classe obrera
   s'organitza com a actor històric nou.
7. **La salut pública** — Jenner (1796), Snow i la bomba de Broad Street
   (1854), Pasteur (1860s), Koch (1882): la mortalitat infantil comença a
   caure — arrenca la transició demogràfica.
8. **L'imperi global** — de les companyies (EIC, VOC) al repartiment d'Àfrica
   (Conferència de Berlín, 1884–85): el 1914, Europa controla ~84% de la
   superfície terrestre. La cara fosca del despegament.

### 3. Escala temporal

**90 cicles, 1 cicle ≈ 3,5 anys** (1.600 → 1.914 EC). **Primer canvi de model
de llinatge: el llinatge comprimit** — `LIFE_EXPECTANCY` puja a ~30 cicles
(les vides s'allarguen) i l'era es juga amb ~3 personatges. Cada successió
pesa més: menys morts, més transmissió en vida (el fill treballa al costat
del pare durant cicles abans d'heretar). Sessió: 60–90 min.

### 4. Branques proposades

| Branca | Eix dominant | Estil de joc | Evolució des de l'Era 6 |
|--------|-------------|--------------|------------------------|
| **Magnat Industrial** | impuls ↑, intel·lecte ↑ | fàbrica, capital, expansió; decisions d'escala amb conseqüències socials | fusió Banquer + Mestre Enginyer: el diner i la màquina es casen |
| **Enginyer Científic** | intel·lecte ↑ | laboratori, patent, obra pública; resol problemes que desbloquegen tothom | hereu directe del Mestre Enginyer via la Nova Ciència |
| **Tribú del Poble** | sociabilitat ↑, espiritualitat ↑ | organitzar: sindicat, cooperativa, premsa obrera; el poder dels números | **hereu del Reformador** — històricament exacte: del metodisme al sindicalisme anglès hi ha continuïtat documentada de quadres i formes |
| **Oficial d'Imperi** | impuls ↑, sociabilitat ↑ | carrera colonial i militar: destins, campanyes, administració ultramarina | hereu del Navegant: l'expedició s'ha tornat aparell d'estat |

La tensió estructural és **Magnat ↔ Tribú** (capital i treball): per primer
cop, dues branques són *antagonistes mecànics* directes — les accions de l'una
generen els events de pressió de l'altra (vegeu §7.3).

### 5. Tecnologies universals proposades

| id | Nom | Cicle | ≈ Data | Fita que representa | Beneficia |
|----|-----|-------|--------|---------------------|-----------|
| `ut7_calcul` | El Càlcul | 25 | ~1.687 EC | *Principia* de Newton | Enginyer Científic |
| `ut7_vapor` | La Màquina de Vapor | 38 | ~1.733 EC | Newcomen 1712 → Watt 1769 | Magnat, Enginyer |
| `ut7_fabrica` | La Fàbrica | 49 | ~1.771 EC | Cromford, Arkwright | Magnat (el funda); crea la Tribú per reacció |
| `ut7_ferrocarril` | El Ferrocarril | 66 | ~1.831 EC | Liverpool–Manchester 1830 | Magnat, Oficial (logística imperial) |
| `ut7_telegraf` | El Telègraf | 70 | ~1.845 EC | Morse 1844; cable 1866 | totes (informació instantània) |
| `ut7_germens` | La Teoria dels Gèrmens | 75 | ~1.862 EC | Pasteur, Koch | totes (+salut global); Tribú (sanejament urbà) |
| `ut7_electricitat` | L'Electrificació | 85 | ~1.897 EC | Pearl Street 1882; AC de Tesla/Westinghouse 1893 | totes — **connector de sortida** |

### 6. Mecànica signature

**La Companyia.** El canvi social fonamental: neix la persona jurídica
immortal — una entitat que posseeix, contracta i sobreviu als seus fundadors.
És el reflex mecànic exacte del nou model de llinatge comprimit: si les
persones duren més i les famílies transmeten menys biologia i més estructura,
el que hereta l'hereu ja no és una inclinació — és *una organització*.

Bucle: a mitja era, el jugador pot fundar una **Companyia** (fàbrica, gabinet
d'enginyeria, casa editorial, sindicat — el flavor segueix la branca): un
segon "cos" del llinatge amb els seus propis comptadors (actius, treballadors,
reputació pública) que genera producció passiva cada cicle i *no es reseteja
amb la successió*. Les decisions de gestió són el nou espai de joc: créixer
ràpid explotant (marges alts → events de vaga, accidents, escàndol de premsa)
o créixer net (marges curts → estabilitat i Llegat). La Companyia és també el
primer actor que pot sobreviure a la dinastia — i l'era pot acabar amb la
pregunta de si la Companyia serveix el llinatge o a l'inrevés.

### 7. Riscos de disseny

1. **El compost definitiu**: el capital industrial creix exponencialment de
   debò. Els embornals han de ser sistèmics i periòdics: pànics financers
   (1873, 1893 — el cicle econòmic com a event de pressió recurrent),
   competència que erosiona marges, i la qüestió social com a cost real de
   l'explotació.
2. **L'imperialisme com a decorat**: l'Oficial d'Imperi no pot ser "el
   Navegant amb uniforme" — la seva carrera es construeix sobre dominació de
   pobles reals. Mateixa política de contingut que el Navegant (Era 6 §7.3):
   les conseqüències humanes apareixen al joc (revoltes, fams colonials,
   veus dels colonitzats als events) i el cost moral es cobra en la crònica.
   Si l'equip no pot produir aquest contingut amb cura, és millor retallar la
   branca que blanquejar-la.
3. **L'antagonisme Magnat–Tribú en un joc d'un sol jugador**: les dues branques
   es defineixen una contra l'altra, però el jugador només n'encarna una. La
   contrapart ha d'existir com a actor del món (si jugues Magnat, la Tribú
   són els teus events; si jugues Tribú, els Magnats són la patronal del teu
   mapa) — primera era on el sistema d'actors persistents de l'Era 5 es torna
   antagonista actiu.

### 8. Connector de sortida

**L'Electrificació — CONFIRMAT.** Tancament correcte per sobre de
l'alternativa òbvia (la cadena de muntatge, Ford 1913): l'electricitat és més
fonamental — la cadena de Ford *és* possible perquè la fàbrica electrificada
allibera la disposició de les màquines de l'eix de transmissió del vapor. A
més, l'electrificació és la tecnologia que defineix la textura sencera del
s. XX (llum, ràdio, electrodomèstic, i més tard l'electrònica), i és
desbloqueig actiu net: el llinatge electrifica la seva fàbrica, la seva
ciutat, casa seva. Data de tancament natural: ~1897–1914, la Belle Époque
il·luminada que s'apaga a Sarajevo.

---

## Era 8 — Segle XX (1.914–1.980 EC)

L'era dels extrems: les dues guerres més mortíferes de la història, els
totalitarismes, l'àtom — i alhora la penicil·lina, el sufragi, l'estat del
benestar, l'home a la Lluna. Tot en 66 anys: menys d'una vida humana.

### 1. Avaluació del connector d'entrada

**L'Electrificació — correcte.** El segle XX comença amb la fàbrica
electrificada (la cadena de Ford arrenca el 1913, cicle 0 de l'era) i la
ràdio a punt de néixer. L'era hereta del jugador una Companyia i un món ja
modern — i li ensenya immediatament que la modernitat no protegeix de res.

### 2. Fites definitòries

1. **La guerra total** — 1914–18 i 1939–45: la mobilització de societats
   senceres; ~17 i ~60 milions de morts. L'Holocaust: la modernitat
   industrial aplicada a l'extermini — el límit absolut del segle.
2. **La producció en massa** — cadena de Highland Park (Ford, 1913): el Model
   T passa de 12 h a 93 min de muntatge; el 1924, la meitat dels cotxes del
   món són Ford T. Neix el consumidor de masses.
3. **Els mitjans de masses** — ràdio (BBC, 1922), cinema sonor (1927), TV
   (servei regular BBC, 1936): per primer cop, milions de persones viuen el
   mateix moment alhora — i la propaganda ho sap.
4. **La medicina que guanya** — penicil·lina (Fleming 1928, producció en massa
   1943–44), vacuna de la pòlio (Salk, 1955), antibiòtics: l'esperança de vida
   mundial passa de ~32 anys (1900) a ~60 (1980).
5. **L'àtom** — Trinity (16 de juliol de 1945), Hiroshima i Nagasaki: per
   primer cop, l'espècie pot extingir-se a si mateixa. La Guerra Freda com a
   equilibri del terror.
6. **Drets en expansió** — sufragi femení (onades: 1893 NZ → 1918–28 UK →
   1944 França), descolonització (Índia 1947, ~17 estats africans el 1960),
   drets civils (1964–65 als EUA): el cercle de "qui compta" s'eixampla a
   batzegades.
7. **La revolució verda** — blat nan de Borlaug (Mèxic, anys 50–60; Nobel de
   la Pau 1970): la fam massiva retrocedeix on arriba el paquet llavor-adob-reg.
8. **El silici** — transistor (Bell Labs, des. 1947), circuit integrat
   (Kilby/Noyce, 1958–59), microprocessador (Intel 4004, 1971), Altair (1975),
   Apple II (1977): la corba de Moore (1965) ja gira — la porta de sortida.

### 3. Escala temporal

**66 cicles, 1 cicle = 1 any** (1.914 → 1.980). La compressió arriba al límit
elegant: **un cicle, un any**. Llinatge comprimit amb **2 personatges** (~33
cicles cadascun: la generació del 1914 i la del baby boom). Sessió: 45–65 min.
L'era més curta i densa fins ara — deliberat: ha de *sentir-se* com un segle
que no et deixa respirar.

### 4. Branques proposades

| Branca | Eix dominant | Estil de joc | Evolució des de l'Era 7 |
|--------|-------------|--------------|------------------------|
| **Científic** | intel·lecte ↑ | laboratori, beca, descobriment; del radi a l'ADN (Watson-Crick-Franklin, 1953) | hereu de l'Enginyer Científic; la ciència ja és professió d'estat |
| **Tecnòcrata d'Estat** | sociabilitat ↑, intel·lecte ↑ | planificació, ministeri, programa (New Deal, NHS, Apollo); el poder de l'aparell | hereu de l'Oficial d'Imperi: l'imperi exterior es torna administració interior |
| **Activista** | sociabilitat ↑, espiritualitat ↑ | moviment, vaga, marxa, opinió pública; la convicció contra l'aparell | hereu directe de la Tribú del Poble, ara amb causes plurals (treball, sufragi, drets civils, pau) |
| **Magnat dels Mitjans** | impuls ↑, sociabilitat ↑ | diari, ràdio, estudi, cadena; l'atenció com a mercaderia nova | hereu del Magnat Industrial: l'acer era el poder del XIX; el relat és el del XX |

L'eix espiritualitat completa aquí la seva mutació de llarg recorregut: de la
fe (E5) a la convicció reformadora (E6–7) a la **ideologia** (E8) — el segle
de les religions polítiques. Mateixa mecànica, significat nou (vegeu Fils
transversals).

### 5. Tecnologies universals proposades

| id | Nom | Cicle | ≈ Data | Fita que representa | Beneficia |
|----|-----|-------|--------|---------------------|-----------|
| `ut8_cadena` | La Cadena de Muntatge | 1 | 1915 | Highland Park, 1913 | Magnat dels Mitjans (indústria cultural inclosa) |
| `ut8_radio` | La Ràdio | 8 | 1922 | BBC, ràdio comercial | Magnat, Activista, Tecnòcrata (propaganda) |
| `ut8_antibiotic` | L'Antibiòtic | 28 | 1942 | Penicil·lina en producció (1943–44) | totes (+salut); Científic |
| `ut8_atom` | L'Àtom | 31 | 1945 | Trinity | Científic, Tecnòcrata; por global permanent |
| `ut8_transistor` | El Transistor | 33 | 1947 | Bell Labs | Científic; prepara la sortida |
| `ut8_helix` | La Doble Hèlix | 39 | 1953 | Watson, Crick, Franklin | Científic; llavor de les eres 10–11 |
| `ut8_ordinador` | L'Ordinador Personal | 63 | 1977 | Altair 1975, Apple II 1977 | totes — **connector de sortida** |

### 6. Mecànica signature

**Les Onades del Segle.** El canvi fonamental: per primer cop, la força que
domina la vida del llinatge no és la natura ni el veí — és la *Història* en
majúscula, sistèmica, global i més gran que ningú. Cap dinastia no va causar
el 1914, el 1929 o el 1939; totes van haver de decidir on eren quan va passar.

Bucle: l'era conté **onades** semi-scriptades (guerra mundial, crac, guerra
total, postguerra daurada, xoc del petroli) que el joc anuncia amb
**presagis** uns cicles abans (titulars, mobilitzacions, mercats nerviosos).
El jugador no pot evitar l'onada; pot **posicionar-s'hi**: liquidar actius o
comprar a la baixa, exposar el fill a la mobilització o pagar-ne l'exempció
amb reputació, posar la Companyia a fer material de guerra (lucratiu,
moralment car a la crònica) o resistir. Cada branca llegeix millor certs
presagis (el Magnat veu el crac; l'Activista, la guerra). És la inversió
exacta de la mecànica de l'Era 3: allà el col·lapse testava la teva xarxa;
aquí les onades testen el teu *judici* — i la crònica recorda què vas fer
cada vegada que el món va girar.

### 7. Riscos de disseny

1. **El to davant l'abisme**: un tycoon que "juga" les guerres mundials i
   l'Holocaust pot resultar obscè. Línia editorial necessària per escrit:
   les atrocitats no són mecàniques ni oportunitats — són context que els
   events presenten amb gravetat, i certes opcions (lucrar-se de l'extermini)
   o no existeixen o marquen la crònica de manera indeleble. El joc tracta el
   segle des d'una família que el travessa, no des dels despatxos on es
   decideix.
2. **El guió contra l'agència**: 66 cicles amb 5 onades scriptades pot
   semblar un passadís. Les onades han de ser fixes en *existència* però no
   en *resultat per al jugador* — tot l'espai de joc és la preparació i la
   resposta. I el contingut entre onades (els anys 20, els 50–60) ha de ser
   joc ple, no espera.
3. **Dos personatges, dues eres mentals**: amb només una successió, l'hereu
   del baby boom pot ser redundant. La successió ha de canviar la textura:
   el segon personatge neix en un món d'antibiòtics, TV i universitat de
   masses — accions noves, valors en fricció amb els del pare (events de
   conflicte generacional: la primera era on el fill *discuteix* l'herència).

### 8. Connector de sortida

**L'Ordinador Personal — CONFIRMAT.** La tria fina és entre el transistor
(1947), el microprocessador (1971) i el PC (1977): es confirma el PC perquè és
el moment en què el còmput entra a *casa del llinatge* — els altres dos són
fites d'infraestructura que el joc ja recull com a tecnologies universals
internes. És artefacte pur (es compra, literalment), desbloqueig actiu, i obre
exactament la fantasia de l'Era 9: el garatge, el codi, la xarxa. 1977–1981
(Apple II → IBM PC) clava la frontera del 1980.

---

## Era 9 — Revolució Digital (1.980–2.010 EC)

Trenta anys en què la informació es desmaterialitza: el PC al despatx, la web
al món, el mòbil a la butxaca. L'era més curta del joc i la primera que molts
jugadors hauran viscut.

### 1. Avaluació del connector d'entrada

**L'Ordinador Personal — correcte.** L'era comença amb l'ordinador com a
objecte domèstic estrany (1980: ningú no sap encara per a què serveix a casa)
i acaba amb la xarxa com a medi vital. Aquest arc — de joguina de garatge a
sistema nerviós del món — és la corba emocional de l'era.

### 2. Fites definitòries

1. **El PC s'estandarditza** — IBM PC (1981), Macintosh i la interfície
   gràfica (1984): la metàfora de l'escriptori fa el còmput usable per a
   no-programadors.
2. **La xarxa de xarxes** — TCP/IP com a estàndard d'ARPANET (1983), la World
   Wide Web de Berners-Lee al CERN (1989–91, alliberada al domini públic el
   1993), el navegador Mosaic (1993): la informació mundial es torna un sol
   espai adreçable.
3. **El programari com a moviment** — GNU (1983), Linux (1991), Wikipedia
   (2001): milers de desconeguts construeixen béns comuns que competeixen amb
   corporacions. Una utopia pràctica i funcional.
4. **El mòbil** — GSM (1991), primer SMS (1992): la persona, no el lloc, es
   torna el node de comunicació. El 2002 hi ha més línies mòbils que fixes
   al món.
5. **La globalització logística** — el contenidor culmina (els 90), OMC
   (1995), la Xina hi entra (2001): les cadenes de subministrament es teixen
   planetàries — la fàbrica de l'Era 7 es deslocalitza.
6. **El genoma** — Projecte Genoma Humà (1990–2003): l'ésser humà es llegeix
   a si mateix com a text. Llavor directa de les eres 10–11.
7. **La bombolla i la lliçó** — el crac puntcom (2000): la primera correcció
   del nou paradigma; n'emergeixen els supervivents que definiran l'era
   següent (Google, 1998; Amazon, 1994).

### 3. Escala temporal

**60 cicles, 1 cicle = 6 mesos** (1.980 → 2.010). **Segon canvi de model:
l'individu persistent** — un sol personatge juga tota l'era (qui té 20 anys
el 1980 en té 50 el 2010). No hi ha successió: hi ha **reinvencions** (vegeu
§6). Sessió: 40–60 min — l'era més àgil, amb cicles densos.

### 4. Branques proposades

| Branca | Eix dominant | Estil de joc | Evolució des de l'Era 8 |
|--------|-------------|--------------|------------------------|
| **Enginyer de Programari** | intel·lecte ↑ | codi, sistemes, elegància tècnica; construir coses que funcionen | hereu del Científic: el laboratori es torna terminal |
| **Fundador** | impuls ↑, intel·lecte ↑ | startup: aposta, pivot, escala o mor; el garatge contra el món | hereu del Magnat dels Mitjans pel costat del risc — però jove, descapitalitzat i tècnic |
| **Evangelista del Coneixement Lliure** | espiritualitat ↑, sociabilitat ↑ | comunitat, llicències lliures, wikis; la convicció feta infraestructura | hereu de l'Activista: la causa del segle nou és l'accés — la ideologia es torna llicència de programari |
| **Teixidor Global** | sociabilitat ↑ | xarxes, consultoria, ONG, mercats emergents; el valor d'estar connectat | hereu del Tecnòcrata: l'aparell d'estat es torna xarxa transnacional |

### 5. Tecnologies universals proposades

| id | Nom | Cicle | ≈ Data | Fita que representa | Beneficia |
|----|-----|-------|--------|---------------------|-----------|
| `ut9_gui` | La Interfície Gràfica | 8 | 1984 | Macintosh; l'escriptori metafòric | totes (el còmput per a tothom) |
| `ut9_web` | La Web | 22 | 1991 | Berners-Lee, CERN | totes; Evangelista (la web neix oberta) |
| `ut9_mobil` | El Mòbil | 25 | 1992–93 | GSM, SMS | Teixidor, Fundador |
| `ut9_cercador` | El Cercador | 37 | 1998 | Google; la web es torna navegable | Enginyer, Fundador |
| `ut9_genoma` | El Genoma | 46 | 2003 | Projecte Genoma Humà complet | Enginyer (bioinformàtica); llavor E10–11 |
| `ut9_smartphone` | El Telèfon Intel·ligent | 55 | 2007 | iPhone 2007, Android 2008 | totes — **connector de sortida** |

### 6. Mecànica signature

**Escalabilitat i Obsolescència.** El canvi econòmic fonamental: el cost
marginal zero — un programa escrit una vegada serveix un milió de persones.
I la seva ombra: tot el que construeixes caduca en anys, no en generacions.

Bucle: certes accions ja no produeixen recursos — produeixen **productes**
(un programa, un web, una base de dades, una comunitat) que generen output
passiu cada cicle… i es deprecien ràpid (cada producte té una corba
d'obsolescència; el mercat se'l menja si no l'actualitzes o el reinventes).
El jugador gestiona un *portafoli* que demana decisions de tall: mantenir,
vendre o matar. I com que no hi ha successió, l'obsolescència afecta el
*personatge mateix*: les seves destreses caduquen (el COBOL del 1985 no et
salva el 2005), i el joc ofereix **reinvencions** — pivots de carrera que
sacrifiquen part de la inclinació i les destreses acumulades a canvi d'accés
al paradigma nou. La reinvenció és la successió interioritzada: ja no mor el
pare; mor una versió de tu.

### 7. Riscos de disseny

1. **La renda passiva trivialitza l'economia**: si els productes renden sense
   manteniment, el final d'era és un clicker resolt. La depreciació ha de ser
   agressiva i el crac puntcom (cicle ~40) ha de podar de debò els portafolis
   inflats — és l'onada del segle d'aquesta era, amb presagis i tot.
2. **Sense mort, sense tensió**: l'individu persistent elimina la pressió de
   la successió, el cor del joc. La substitueix l'obsolescència personal —
   però cal que mossegui: destreses que caduquen visiblement, events
   d'edatisme al sector, el Fundador de 45 anys davant nois de 22. Si
   l'obsolescència és cosmètica, l'era perd el conflicte central.
3. **La nostàlgia com a trampa de contingut**: l'era que el jugador ha viscut
   convida a l'acudit referencial (disquets, mòdems, Y2K). Una picada d'ullet
   per cicle, d'acord; un museu de memes, no — la força de l'era és la corba
   de transformació, no el catàleg de relíquies.

### 8. Connector de sortida

**Es proposa substituir "La Socialització d'Internet" pel "Telèfon
Intel·ligent".** El nom original descriu un procés social — i els processos
no es desbloquegen, passen (principi 2 dels connectors). L'smartphone és la
forma material exacta d'aquell procés: el dispositiu que posa la xarxa a
totes les butxaques (iPhone 2007, Android 2008; el 2010 la corba d'adopció ja
és vertical) i que fa possibles les xarxes socials ubiqües, l'economia de
l'atenció i la identitat digital permanent — és a dir, tota la fantasia de
l'Era 10. Artefacte comprable, desbloqueig actiu, datació impecable a la
frontera 2007–2010.

---

## Era 10 — Era Contemporània (2.010–2.050 EC)

L'era del present estès: la primera meitat és història documentada
(2010–2026), la segona és projecció. El llinatge viu connectat, observat i
quantificat — i el món li demana respostes a dues escales alhora: l'atenció
de cada minut i el clima de cada dècada.

### 1. Avaluació del connector d'entrada

**El Telèfon Intel·ligent** (substituint "La Socialització d'Internet",
vegeu Era 9 §8). L'era s'obre el 2010 amb l'smartphone esdevenint pròtesi
universal (més de la meitat de la humanitat en té un cap a 2017–2020) i la
vida social migrant a les plataformes. El personatge comença l'era amb un
segon jo: el seu perfil.

### 2. Fites definitòries

1. **L'aprenentatge profund** — AlexNet guanya ImageNet (2012), l'arquitectura
   Transformer (2017), els grans models de llenguatge arriben al públic
   (2020–23): la màquina aprèn de dades el que ningú no sap programar.
   AlphaFold resol l'estructura de proteïnes (2020–21).
2. **L'edició genètica** — CRISPR-Cas9 (Doudna i Charpentier, 2012; Nobel
   2020); el escàndol de He Jiankui (2018) marca la línia vermella germinal;
   la primera teràpia CRISPR aprovada (Casgevy, 2023). Llegir el genoma
   (Era 9) es torna escriure'l.
3. **L'energia que canvia de signe** — el cost del solar cau >90% (2009–2020);
   l'AIE declara el solar "l'electricitat més barata de la història" (2020);
   Acord de París (2015). La transició energètica passa de moral a econòmica.
4. **L'economia de l'atenció** — el feed algorítmic, la polarització mesurable,
   la desinformació industrial: l'atenció humana com a recurs extractiu. La
   plaça pública té amo privat.
5. **La pandèmia** — COVID-19 (2020): vacunes d'ARNm en 11 mesos (rècord
   absolut), teletreball massiu, i una demostració global de fragilitat i de
   capacitat alhora.
6. **L'espai reutilitzable** — primer aterratge orbital del Falcon 9 (des.
   2015): el cost d'accés a l'òrbita cau un ordre de magnitud; programa
   Artemis; el JWST (2021) mira l'origen del temps.
7. **La interfície neural** — BrainGate (assajos des de 2004), Synchron
   (2022), primer implant humà de Neuralink (gener 2024): la senda
   teràpia→millora que defineix la sortida de l'era.

*(Fites 2026–2050: projecció ancorada en aquestes trajectòries — IA com a
infraestructura general, teràpies gèniques rutinàries, neurotecnologia
clínica madura, crisi climàtica gestionada amb adaptació desigual.)*

### 3. Escala temporal

**80 cicles, 1 cicle = 6 mesos** (2.010 → 2.050). Individu persistent (model
de l'Era 9 consolidat): un personatge, tota l'era. Sessió: 55–75 min.

### 4. Branques proposades

| Branca | Eix dominant | Estil de joc | Evolució des de l'Era 9 |
|--------|-------------|--------------|------------------------|
| **Arquitecte d'IA** | intel·lecte ↑ | models, dades, agents; construir la màquina que aprèn — i contenir-la | hereu de l'Enginyer de Programari: del codi explícit al model entrenat |
| **Influent** | sociabilitat ↑, impuls ↑ | audiència, marca personal, viralitat; l'atenció com a collita diària | hereu del Teixidor i del Fundador: la xarxa es torna escenari |
| **Regenerador** | espiritualitat ↑, sociabilitat ↑ | clima, sòl, comunitat resilient; reparar com a projecte vital | hereu de l'Evangelista: la causa migra del coneixement lliure al planeta habitable |
| **Biohacker** | impuls ↑, intel·lecte ↑ | el cos com a projecte: mètrica, teràpia, millora; risc personal directe | branca nova: la convergència genoma (E9) + clínica de consum no té precedent dinàstic |

### 5. Tecnologies universals proposades

| id | Nom | Cicle | ≈ Data | Fita que representa | Beneficia |
|----|-----|-------|--------|---------------------|-----------|
| `ut10_feed` | La Plaça Algorítmica | 4 | 2012 | El feed personalitzat universal | Influent (el funda com a branca) |
| `ut10_aprenentatge` | L'Aprenentatge Profund | 5 | 2012–17 | AlexNet → Transformer | Arquitecte d'IA |
| `ut10_solar` | El Sol Barat | 20 | 2020 | Solar com a electricitat més barata (AIE) | Regenerador; totes (energia) |
| `ut10_crispr` | El Bisturí Genètic | 26 | 2023 | Casgevy: primera teràpia CRISPR | Biohacker |
| `ut10_copilot` | La IA de Companyia | 30 | 2025 | LLMs com a eina quotidiana de treball | totes (amplificador transversal) |
| `ut10_neural` | La Interfície Neural | 52 | ~2036 | BCI clínica madura (projecció des de Neuralink/Synchron 2022–24) | Biohacker, Arquitecte |
| `ut10_augment` | L'Augment Cognitiu | 75 | ~2047 | BCI de millora, no de teràpia (projecció) | totes — **connector de sortida** |

### 6. Mecànica signature

**El Bessó Digital.** El canvi social fonamental: la identitat es desdobla —
existeixes tu i existeix el teu rastre (perfil, reputació algorítmica, marca
personal), i el segon té vida pròpia.

Bucle: el personatge té un **avatar públic** amb els seus propis comptadors
(audiència, credibilitat, exposició) que evoluciona semi-independentment: les
accions l'alimenten, però els events virals el mouen sol — amunt (un moment de
glòria que no has triat) i avall (un context tret de lloc, una cancel·lació).
La tensió de joc és la **divergència**: si la imatge projectada s'allunya
massa de la inclinació real del personatge (l'Influent espiritualment buit,
el Regenerador amb jet privat), els events de crisi es multipliquen i la
reconciliació costa cicles. És la primera era on la *reputació* — acumulativa
des de l'Era 1 — es torna volàtil i amb agència pròpia. I és l'assaig general
del Ramatge de l'Era 12: aprendre a gestionar un segon jo abans que el segon
jo sigui literal.

### 7. Riscos de disseny

1. **El present polaritzat**: l'era toca política viva (plataformes, clima,
   IA). El joc no pot ser un pamflet ni un both-sides buit: la línia editorial
   és sistèmica, no partidista — es modelen incentius (l'atenció paga,
   l'extracció costa) i conseqüències, mai actors reals amb nom. Cap
   personatge, empresa o partit real al contingut.
2. **Especulació que envelleix malament**: la meitat 2026–2050 quedarà
   desmentida per la realitat (tota futurologia ho fa). Dissenyar les fites
   projectades com a *escenaris* amb data tova (la taula usa "~") i el flavor
   en condicional; preveure que el contingut d'aquesta era es revisi a cada
   gran actualització del joc.
3. **El comptador del clima com a sermó**: si el Regenerador és "la branca
   bona" i el joc renya el jugador que no la tria, es perd tothom. El clima
   ha de ser pressió de fons que afecta totes les branques (assegurances,
   migracions, estius d'events extrems) amb respostes viables des de
   qualsevol perfil — l'Arquitecte optimitza xarxes, el Biohacker adapta
   cossos, l'Influent mou opinió.

### 8. Connector de sortida

**L'Augment Cognitiu — CONFIRMAT.** El llindar teràpia→millora és la frontera
moral i tècnica correcta: tota la neurotecnologia actual (BrainGate, Synchron,
Neuralink) es justifica clínicament — paràlisi, ELA, ceguesa — i el moment en
què una persona sana s'implanta per *ser més* és un canvi de categoria, no de
grau. És desbloqueig actiu màximament personal (el llinatge decideix
augmentar-se), i obre la fantasia exacta de l'Era 11: la condició humana com a
variable. Datació ~2047–2050: especulativa però dins del corredor de les
fulles de ruta BCI actuals (dècades, no anys).

---

## Era 11 — Futur Proper (2.050–2.150 EC)

El segle en què la humanitat negocia els seus límits: la mort com a malaltia
tractable, la Terra com a pacient, l'espai com a segona residència i la ment
com a frontera final. Especulació, però ancorada: cada fita d'aquesta era és
l'extrapolació d'un programa de recerca que ja existeix el 2026.

### 1. Avaluació del connector d'entrada

**L'Augment Cognitiu — correcte.** L'era comença amb la primera generació
augmentada conviviente amb la no augmentada: la desigualtat ja no és només de
riquesa sinó de *capacitats* — la tensió social que vertebra el segle.

### 2. Fites definitòries (projecció ancorada)

1. **La longevitat estesa** — dels senolítics i la reprogramació epigenètica
   parcial (factors de Yamanaka; assajos en ratolins des de ~2020; Altos Labs,
   2022) a teràpies que aturen — no reverteixen — l'envelliment: vides
   funcionals de 110–130 anys. Les generacions se superposen.
2. **La fusió comercial** — de la ignició del NIF (des. 2022) i ITER a les
   primeres centrals comercials: energia abundant que canvia l'economia de
   l'aigua (dessalinització), del clima (captura directa) i de l'espai.
3. **L'hàbitat extraterrestre** — d'Artemis a la primera base lunar permanent
   i l'avançada marciana: no colònies de masses, sinó l'equivalent de les
   bases antàrtiques — i les primeres persones que neixen fora de la Terra.
4. **La restauració climàtica** — el segle de pagar el deute: captura de
   carboni a escala de gigatona, rewilding continental, gestió d'una migració
   climàtica de centenars de milions. La política del segle.
5. **El connectoma humà** — del mapa complet de la mosca (FlyWire, 2024,
   ~140.000 neurones) al mapa de cervells de mamífer i, al final del segle,
   l'humà: la lectura estructural completa d'una ment concreta. Prerequisit
   tècnic del connector de sortida.
6. **La intel·ligència no humana madura** — la IA com a soci civilitzacional
   (recerca, govern, companyia) i el problema permanent de l'alineació: la
   primera era en què el llinatge conviu amb ments que no són de la família.

### 3. Escala temporal

**80 cicles, 1 cicle ≈ 15 mesos** (2.050 → 2.150). **Tercer canvi de model:
la Casa** — la longevitat superposa generacions i el llinatge ja no és una
fila, és una llar: el jugador gestiona **2–3 membres vius simultàniament**
(vegeu §6). Sessió: 60–90 min — l'era torna a créixer perquè el model de Casa
multiplica les decisions per cicle.

### 4. Branques proposades

| Branca | Eix dominant | Estil de joc | Evolució des de l'Era 10 |
|--------|-------------|--------------|------------------------|
| **Simbiont** | intel·lecte ↑ | fusió de treball amb IA: amplificació, delegació, risc de dependència | hereu de l'Arquitecte d'IA: de construir la màquina a pensar amb ella |
| **Pioner Orbital** | impuls ↑ | la frontera literal: base, nau, regolita; risc físic en un món que l'ha abolit | hereu del Biohacker i de tota la línia del risc (Caçador→Navegant→Fundador): l'últim lloc on el coratge físic compta |
| **Custodi de la Terra** | espiritualitat ↑, sociabilitat ↑ | restauració, bioregió, govern del comú; pensar en segles | hereu del Regenerador, ara amb eines a l'altura del problema |
| **Eternalista** | intel·lecte ↑, impuls ↓ | la pròpia continuïtat com a obra: teràpies, còpies de seguretat de memòria, patrimoni multigeneracional viu | branca nova: només pot existir quan la mort es torna opcional-ish |

### 5. Tecnologies universals proposades

| id | Nom | Cicle | ≈ Data | Fita que representa | Beneficia |
|----|-----|-------|--------|---------------------|-----------|
| `ut11_fusio` | La Fusió | 12 | ~2065 | Primera generació de centrals comercials | totes (energia abundant) |
| `ut11_longevitat` | La Joventut Estesa | 24 | ~2080 | Teràpies d'aturada de l'envelliment | Eternalista (el funda); activa la Casa plena |
| `ut11_habitat` | L'Hàbitat | 40 | ~2100 | Base permanent fora de la Terra | Pioner Orbital |
| `ut11_restauracio` | La Restauració | 50 | ~2112 | Balanç de carboni negatiu sostingut | Custodi |
| `ut11_connectoma` | El Connectoma | 64 | ~2130 | Mapa complet d'un cervell humà concret | Simbiont, Eternalista |
| `ut11_transferencia` | La Transferència de Consciència | 76 | ~2145 | Primera còpia funcional d'una ment | totes — **connector de sortida** |

### 6. Mecànica signature

**La Casa.** El canvi fonamental: quan els avis viuen tant com els nets, el
llinatge deixa de ser una cursa de relleus i es torna un equip que conviu.

Bucle: el jugador gestiona simultàniament 2–3 **membres** de la Casa, cadascun
amb edat, inclinació pròpia (divergent! cada membre deriva segons les accions
que li assignes) i destreses pròpies. Cada cicle s'assignen les accions entre
membres: l'àvia eternalista investiga, el fill pioner és a la base lunar, la
neta simbiont negocia amb la IA de la Casa. La successió es torna **electiva i
contínua**: no hi ha mort que forci el relleu — hi ha la decisió periòdica de
*qui parla en nom de la Casa* (qui és el personatge actiu a la crònica), i els
membres no escollits acumulen el seu propi fil narratiu. La mort encara
existeix (accident, rebuig de teràpia per conviccions — l'opció del membre
que *tria* envellir és contingut d'or) però ja no és el metrònom. És
l'evolució final de la successió dinàstica abans que l'Era 12 la trenqui.

### 7. Riscos de disseny

1. **Perdre la mort és perdre el joc**: la successió forçada és el cor
   emocional de Bloodline des de l'Era 0. Si la Casa la dilueix en gestió de
   plantilla, l'era es torna un RTS petit. Contramesura: la *continuïtat
   d'identitat* substitueix la supervivència com a tensió — divergència
   d'inclinació entre membres (la Casa es pot trencar: cisma familiar com a
   game-over parcial), i cada membre és insubstituïble (no es "recluta").
2. **Postescassetat = postjoc**: amb fusió i longevitat, els comptadors de
   supervivència queden obsolets i el joc pot quedar sense fricció. Els
   recursos escassos de l'era són uns altres i cal implementar-los de debò:
   temps d'atenció dels membres, confiança social (qui decideix per la Casa),
   i accés (les teràpies i l'espai no són universals — la desigualtat
   d'augment del §1 és el mercat negre de l'era).
3. **Deriva estètica cap al sci-fi genèric**: l'era pot perdre l'ancoratge
   "històric" que dona identitat al joc. Regla de contingut: cada tecnologia,
   acció i event ha de poder citar el programa de recerca de 2026 del qual
   descendeix (la taula del §5 ho fa); si una idea no té llavor documentada
   avui, no entra.

### 8. Connector de sortida

**La Transferència de Consciència — CONFIRMADA, amb una precisió.** És el
llindar correcte perquè trenca l'últim invariant del joc: des de l'Era 0, el
llinatge és *cossos que es transmeten coses*; la transferència fa el suport
opcional i obre exactament la pregunta de l'Era 12 (què és el llinatge quan
no hi ha sang?). Precisió recomanada: presentar-la com a **còpia funcional**
(whole brain emulation — full de ruta acadèmic: Sandberg & Bostrom, 2008) i
no com a "trasllat" — la qüestió de si la còpia ets *tu* no s'ha de resoldre:
és literalment el contingut dramàtic de l'era següent. El membre de la Casa
que es transfereix primer és l'últim gran event de l'era — i la primera
escena de la següent.

---

## Era 12 — Transhumanisme (2.150 EC+)

L'era final i oberta: el llinatge ja no està fet de cossos sinó de
continuïtat — memòria, valors, inclinació — corrent sobre substrats diversos.
El joc fa la seva última pregunta, que és la primera: què transmets, quan ho
pots transmetre tot?

### 1. Avaluació del connector d'entrada

**La Transferència de Consciència — correcta.** L'era comença amb la primera
ment del llinatge corrent fora d'un cos i la resta de la Casa mirant-s'ho.
No cal que la transferència sigui ja universal ni perfecta: l'era és
precisament el seu desplegament i les seves conseqüències.

### 2. Fites definitòries (especulació estructurada)

Ancoratge intel·lectual: la literatura acadèmica i assagística existent
(Moravec, *Mind Children*, 1988; Bostrom, *Superintelligence*, 2014; el full
de ruta WBE de Sandberg & Bostrom, 2008; Breakthrough Starshot, 2016, per a
la vela estel·lar).

1. **La independència de substrat** — la ment del llinatge pot córrer en
   biologia, silici o el que vingui: la mort per fallada de suport desapareix;
   la mort per *decisió* o per *deriva* no.
2. **La bifurcació** — una ment es pot copiar: dues instàncies divergeixen
   des del segon zero. El llinatge ja no és un arbre per descendència — és
   un arbre per *còpia*. La pregunta hereditària es torna recursiva.
3. **La vela estel·lar** — sondes lleugeres a una fracció de c (concepte
   Starshot): instàncies del llinatge viatgen dècades subjectives cap a
   altres estrelles. La dinastia es torna interestel·lar — i les branques
   perden el contacte en temps real.
4. **L'ecopoesi** — dissenyar biosferes: la Terra restaurada (herència del
   Custodi) i els primers mons sembrats. El jardí com a forma d'art dinàstic.
5. **L'Arxiu de l'Espècie** — la memòria total: tot el que la humanitat ha
   estat, indexat i viu. La crònica del llinatge — la mecànica meta del joc
   des de l'Era 1 — es revela com el que sempre havia estat: l'ànima del joc.
6. **El retorn voluntari al límit** — comunitats que trien la mortalitat, el
   cos únic, el temps finit: no per pobresa sinó per convicció. La tradició
   com a avantguarda.

### 3. Escala temporal

**~60 cicles, escala temporal abstracta** (un cicle és "un pols" — pot
narrar anys o segles segons el fil). Model de llinatge: **el Ramatge** (vegeu
§6). Sessió: 45–70 min, amb final de partida inclòs: aquesta era tanca la run
completa i desemboca a la crònica final.

### 4. Branques proposades

| Branca | Eix dominant | Estil de joc | Evolució |
|--------|-------------|--------------|----------|
| **Explorador Estel·lar** | impuls ↑ | instàncies enviades als estels; decisions amb retorn a dècades vista | terminal de la línia del risc: Caçador → Navegant → Pioner → estrelles |
| **Arxiver de l'Espècie** | intel·lecte ↑, espiritualitat ↑ | memòria, curadoria, sentit; decidir què es recorda | terminal de la línia del saber: Escriba → Monjo → Científic → Arxiver |
| **Jardiner de Mons** | sociabilitat ↑, espiritualitat ↑ | ecopoesi, comunitats, biosferes; crear llars per a altres | terminal de la línia del vincle: Sacerdot → Senyor del Mas → Custodi |
| **Asceta Biològic** | espiritualitat ↑, impuls ↓ | un cos, una vida, cap còpia: la finitud com a pràctica | **la inversió final**: la branca "tradicional" de l'era és la que es nega a l'era — i custodia el que el joc havia estat fins ara |

L'Asceta és la branca de disseny més important: dona veu mecànica al jugador
que troba la transferència una pèrdua, i manté viva dins del joc la tesi
contrària al seu propi final. Si l'Asceta és viable i digne, l'Era 12 és un
diàleg; si no, és un fulletó.

### 5. Tecnologies universals proposades

| id | Nom | Cicle | Fita que representa | Beneficia |
|----|-----|-------|---------------------|-----------|
| `ut12_substrat` | La Independència de Substrat | 8 | Mort per fallada de suport abolida | totes excepte Asceta (per elecció) |
| `ut12_bifurcacio` | La Bifurcació | 20 | La primera còpia divergent legal | activa la mecànica signature |
| `ut12_vela` | La Vela Estel·lar | 32 | Primera instància en ruta interestel·lar | Explorador |
| `ut12_ecopoesi` | L'Ecopoesi | 40 | Primera biosfera dissenyada estable | Jardiner |
| `ut12_arxiu` | L'Arxiu de l'Espècie | 48 | La memòria total accessible | Arxiver; prepara el final |
| `ut12_cronica` | La Crònica Eterna | 58 | El llinatge componça el seu propi relat | **tancament final del joc** (vegeu §8) |

### 6. Mecànica signature

**El Ramatge.** La successió dinàstica, transformada per últim cop: el
personatge es pot **bifurcar** — crear una instància que parteix de la seva
inclinació exacta i diverdeix des d'aleshores (l'exploradora que marxa a la
vela, la que es queda al jardí). El jugador segueix *una* instància activa
alhora (com sempre des de l'Era 1), però les altres branques del ramatge
viuen, deriven i de tant en tant **retornen**: una instància que torna després
de 40 cicles de divergència és l'event més potent de l'era — porta inclinació
aliena, records que no tens i la pregunta de si encara és família. La
**fusió** (reintegrar una instància divergent) és possible i costosa: les
inclinacions es barregen amb la fórmula d'herència de tota la vida — la
successió de l'Era 1 reapareix, ara entre tu i tu.

El final de partida: amb `ut12_cronica`, el joc proposa el **rite de la
Crònica** — el ramatge sencer es reuneix (instàncies, l'Asceta amb la seva
única vida, els fils estel·lars que responen amb dècades de retard) per
compondre la crònica final del llinatge des de l'Era 0: el jugador cura,
ordena i titula els moments que el joc ha anat registrant. L'exportable final
és el premi de tota la run.

### 7. Riscos de disseny

1. **Abstracció total**: sense fam, mort ni diners, el jugador pot no saber
   què vol. Cada branca necessita un *desig* mecànic concret i mesurable
   (arribar a l'estrella; completar l'arxiu; estabilitzar la biosfera; acabar
   una vida bona) — l'era es juga per objectius, no per supervivència, i això
   s'ha de dir explícitament al jugador.
2. **El final que no aterra**: dotze eres mereixen alguna cosa millor que una
   pantalla de score. El rite de la Crònica és car de produir (UI pròpia,
   text generat de qualitat) però és el pagament de tota la promesa del joc
   ("una crònica del llinatge única i exportable" — _overview.md §1); si s'ha
   de retallar alguna cosa de l'era, que no sigui això.
3. **Els números no signifiquen res**: a aquesta escala, +3 de material és
   ridícul. L'era ha de renormalitzar dur (token Còmput nou, comptadors
   nous) i la puntuació final ha de pesar la *run sencera* (badges, crònica,
   tecnologies descobertes), no l'acumulació local de l'era.

### 8. Tancament final (sense connector)

**Correcte que no n'hi hagi.** El joc no acaba amb una porta sinó amb un
mirall: `ut12_cronica` no desbloqueja l'era següent — desbloqueja el relat de
totes les anteriors. Si mai es volgués contingut post-final (New Game+), el
ganxo natural ja existeix: una instància del ramatge en ruta estel·lar pot
ser la "llavor" d'una nova run amb herència cosmètica (la crònica vella com a
mite fundacional de la nova partida). No es proposa com a feature: es deixa
anotat com a porta tancada però no tapiada.

---

## Fils transversals

Cinc elements que travessen les tretze eres i que, si es dissenyen com a
sistemes (no com a contingut per era), donen al joc la seva columna vertebral.

### 1. La mutació de l'eix espiritualitat

El mateix eix [-1, +1] significa una cosa diferent a cada era, i aquesta
mutació és la història cultural de la humanitat en un sol número: animisme
(E0–1) → culte als avantpassats (E2) → temple d'estat (E3) → saviesa axial
(E4) → fe del llibre (E5) → reforma i convicció (E6–7) → ideologia (E8) →
causa (E9–10) → sentit i límits (E11–12). El disseny ho explota: el jugador
amb espiritualitat alta sempre té branca, però l'ofici d'aquesta branca canvia
radicalment — i l'Asceta de l'Era 12 és el mateix impuls que el xaman de
l'Era 0, tancant el cercle. Cap altre eix no muta tant: és l'eix que dona
més rejugabilitat temàtica.

### 2. La cadena del llibre (i de la memòria)

Una sola línia tecnològica travessa el joc sencer: marca simbòlica (E0) → art
parietal (E1) → fitxa d'argila (E2) → escriptura (E3) → alfabet i còdex (E4) →
scriptorium (E5) → impremta (E6) → premsa i telègraf (E7) → ràdio i TV (E8) →
web (E9) → feed (E10) → connectoma (E11) → Arxiu de l'Espècie (E12). Tres
connectors d'era en formen part (Pensament Simbòlic, Còdex, Telèfon
Intel·ligent). És el fil que justifica la mecànica meta de la **crònica**: el
llinatge sempre està aprenent a recordar millor, i el final del joc (el rite
de la Crònica) és l'última baula. Recomanació: que les tecnologies d'aquesta
cadena tinguin sempre un efecte sobre la crònica o la transmissió
(inheritanceRate, ensenyança), perquè el fil sigui mecànic i no només temàtic.

### 3. Innovació contra tradició

Cada connector de sortida és, per definició, una ruptura — i a cada era hi ha
qui hi perd: l'aristòcrata del bronze davant el ferro, el monjo copista davant
la impremta, el gremi davant la fàbrica, l'asceta davant la transferència.
Recomanació de sistema: a cada era, almenys una branca ha de tenir incentius
*reals* per resistir el connector (bonus de tradició creixents fins al moment
de la transició), de manera que adoptar-lo sigui una decisió i no un tràmit.
La tensió "ho adopto ara o esgoto la via vella" és el dilema de tempo més
barat i rejugable que té el joc, i culmina en l'Asceta de l'Era 12, que
converteix la resistència en branca completa.

### 4. La reputació dinàstica i els actors amb memòria

La reputació evoluciona de comptador passiu (E1) a moneda de càrrecs (E4), a
vincle jurat amb actors persistents (E5), a llegat de mecenatge (E6), a
reputació de Companyia (E7), a opinió pública (E8), a avatar amb vida pròpia
(E10), a confiança dins la Casa (E11) i a identitat del ramatge (E12). El
patró de fons és un sol sistema que es va enriquint: *el món recorda el
llinatge cada cop amb més resolució*. La inversió tècnica que ho sosté és el
sistema d'actors persistents amb memòria introduït a l'Era 5 (senyor,
monestir) i reutilitzat després (la contrapart Magnat/Tribú a l'E7, les
plataformes a l'E10, la IA de la Casa a l'E11).

### 5. L'escalada del risc col·lectiu

La pressió del món creix d'escala amb el poder del jugador: depredador (E0–1)
→ mala collita i ràtzia (E2) → col·lapse de xarxa (E3) → pesta (E6) → cicle
econòmic i guerra total (E7–8) → risc sistèmic difús (clima, IA, E10–11) →
deriva existencial (E12). Regla de disseny extreta de les eres 3, 6 i 8: el
xoc gran és legítim si (a) té presagis llegibles, (b) hi ha posicionament
possible encara que no evitació, i (c) el món posterior conté oportunitats
noves. El joc no castiga: posa a prova el que has construït.

---

## Advertències de disseny globals

Els cinc reptes més grans d'implementar tretze eres tan diverses en un sol
sistema coherent — ordenats de més estructural a més editorial.

### 1. Un motor, tretze mecàniques signature

Cada era afegeix una mecànica nova (graner, rutes, càrrecs, juraments,
mecenatge, companyia, onades, productes, bessó, casa, ramatge). Si cadascuna
és un sistema de codi nou, el motor es fragmenta i el cost de cada era creix
sense límit. La defensa és arquitectònica i s'ha de decidir aviat: cada
signature s'ha d'expressar com a *configuració de dades dels sistemes
existents* (accions, events, actors, recursos persistents, successió
parametritzada) amb el mínim de codi nou possible. Test de viabilitat
recomanat abans de produir l'Era 2: el graner ha de ser implementable amb
recursos + events + un upgrade persistent, sense tocar el motor. Si no ho és,
el motor necessita el hook genèric (p. ex. "recurs amb regla de cicle"), no
el graner el seu codi propi.

### 2. La successió canvia quatre vegades

Dinàstic (E0–6) → comprimit (E7–8) → individu persistent (E9–10) → Casa (E11)
→ Ramatge (E12). La successió és el cor emocional del joc, i cada canvi de
model arrisca diluir-lo. El marc que ho manté coherent: a cada era, la
pregunta mecànica és la mateixa — *què transmet el llinatge i què es perd en
la transmissió* (gens → valors → obres → memòria) — i la fórmula d'herència
d'inclinació ha de sobreviure reconeixible a tots els models (la fusió del
Ramatge usa la mateixa fórmula que la successió de l'Era 1). Prototipar els
dos trencaments grans (E8→E9: morir deixa de passar; E10→E11: gestionar més
d'un personatge) molt abans de produir-ne el contingut.

### 3. La inflació entre eres

Tretze eres d'acumulació amb recursos persistents (material/token, reputació,
tecnologies de branca) garanteixen una bola de neu intergeneracional si no hi
ha renormalització. El patró ja existeix al joc (token nou per era;
`inheritDecay` en successió) i s'ha d'elevar a regla: **cada transició d'era
renormalitza** — el token vell es converteix amb pèrdua narrativitzada (la
plata medieval no compra florins renaixentistes a la par), la reputació es
reinterpreta (vegeu fil transversal 4), i només la crònica, els badges i les
tecnologies descobertes travessen intactes. El que persisteix és identitat,
no poder.

### 4. La densitat històrica creix i el cicle no

L'Era 1 cobreix 40.000 anys amb 7 tecnologies; l'Era 8 en cobreix 66 amb 7.
La temptació a les eres modernes és la checklist enciclopèdica (cada any té
tres fites documentades). La disciplina editorial: per era, 5–7 tecnologies
universals i 5–8 fites — *la resta és flavor d'events*, no estructura. El
criteri de tall no és la importància històrica sinó la **jugabilitat de la
tensió**: la fita entra si crea o resol una tensió de branca (el transistor
entra perquè prepara la sortida; la conquesta de l'Everest, no, per molt 1953
que sigui).

### 5. El to davant la història real (i la futura)

A partir de l'Era 6 el joc toca ferides obertes: colonialisme, esclavitud,
guerres mundials, Holocaust, política contemporània. Un tycoon de llinatge no
pot fingir que no hi són (seria blanquejar) ni gamificar-les (seria obscè).
La política de contingut, escrita una vegada i aplicada a cada content plan
d'era: (a) la perspectiva és sempre la d'una família que travessa la història,
mai la del despatx on es decideix l'atrocitat; (b) les conseqüències humanes
apareixen als events i a la crònica; (c) cap atrocitat no és mai l'estratègia
òptima silenciosa — el cost moral es cobra en reputació i en tinta; (d) cap
actor real amb nom a les eres vives (E9+). I per a les eres futures (E10–12),
l'equivalent: tot contingut especulatiu ha de citar la llavor real de 2026 de
la qual descendeix, o no entra.

