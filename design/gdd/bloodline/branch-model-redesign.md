# DESIGN-02 — Branch Model Redesign (Part 1: Proposta)

> **Estat**: PROPOSTA per revisar — no és una decisió final.
> **Data**: 2026-06-24
> **Predecessor**: ECON-02 (eines com a upgrade), DESIGN-01 (identitat Místic)
> **Encàrrec**: model de branques, intercanviabilitat, accions-pont, compatibilitat herència.

---

## 1. Overview

Bloodline té quatre branques a l'Era de la Prehistòria: **Caçador**, **Recol·lector**,
**Artesà** i **Místic**. Cada branca s'activa quan l'eix corresponent supera el 34%
en el repartiment normalitzat de la inclinació (impuls → Caçador, sociabilitat →
Recol·lector, intel·lecte → Artesà, espiritualitat → Místic).

El problema que intenta resoldre aquest document és doble:

1. **Identitat difusa**: les quatre branques comparteixen massa accions i recursos
   sense una mecànica que les diferenciï de manera reconeixible. El jugador no sent
   que "ser Caçador" signifiqui res a part de tenir accés a certes accions.

2. **Intercanvi massa barat o massa bru**: avui, comprar 1 acció d'eina concedeix
   accés a les 4 eines sense fricció real (massa generós). Però no hi ha un camí
   natural per canviar de branca que no sigui bru ni obscur.

Aquesta proposta defineix:
- Què fa única cada branca (fantasia + mecànica diferenciadora)
- Quines accions son exclusives, quines son pont i quines son compartides
- Com s'implementa el canvi de branca via upgrade explícit (ECON-02)
- Com es preserva la filosofia d'herència forta del llinatge

---

## 2. Identitat de les Quatre Branques

### 2.1 Principi de disseny: una frase, un verb, un risc

Cada branca ha de respondre amb una frase d'una línia a la pregunta
"per a qui viu aquest personatge?". I ha de tenir un **verb de branca** —
l'acció que cap altra branca fa de la mateixa manera — i un **risc de branca**
— el que pots perdre per ser qui ets.

| Branca | Eix | Frase | Verb | Risc |
|--------|-----|-------|------|------|
| **Caçador** | impuls | "Faig servir la força allà on d'altres s'aparten" | **Aterrar** (atacar, empentar, tirar llança) | Salut — cada gran acció costa HP |
| **Recol·lector** | sociabilitat | "Trec el màxim del que hi ha sense trencar res" | **Acumular** (triar, separar, conservar) | Temps — les accions son lentes però segures |
| **Artesà** | intel·lecte | "Faig servir la ment allà on d'altres fan servir la força" | **Transformar** (convertir recursos en eines o formes noves) | Recursos — les accions consumeixen materials per crear valor |
| **Místic** | espiritualitat | "El que no es veu importa tant com el que es veu" | **Mediar** (sanar, pacificar, convocar) | Incertesa — les accions amb outcome variable però potencialment molt alt |

### 2.2 Descripció de cada branca

#### Caçador (eix impuls)

**Fantasia del jugador**: Soc la punta de llança del clan. Quan actuo, actuo
del tot. No espero la presa perfecta — la busco. El meu cos és el meu principal
actiu i el gasto consciència.

**Diferenciació mecànica**:
- Les accions del Caçador tenen el **rendiment més alt per torn** en food/salut
  bruta, però porten un **cost de salut** associat (side_effects de -HP).
- La eina del Caçador és la **Llança** (`act_forjar_punta`): l'acció de consum
  `act_caca_llanca` dona 5–12 food però costa –7hp.
- Les accions del Caçador **pugen impuls activament**: executar-les reforça
  la identitat de branca en lloc de diluir-la.
- **Nínxol d'accés**: el Caçador accedeix primer al **Bosc via marques de
  territori** (`bt_marques_territori`) i és el primer a obtenir accions de
  zona exterior.

**Accions representatives**:
- `act_espiar_ramat` (base, pont) → empenyen impuls +0.05
- `act_caca_llanca` (exclusiva) → high food, high cost HP, +0.08 impuls
- `act_emboscada_nocturna` (exclusiva) → very high food, very high HP cost, –sociabilitat
- `act_forjar_punta` (fabricació eina, exclusiva de branca)

**Problema actual identificat (BRN-05)**: el Caçador pot quedar sense accés
fluid a `act_recollir_branques` per impuls alt > 0.30. Proposta de resolució:
ampliar el threshold a `impuls: max 0.50` per a `act_recollir_branques`.
Veure Secció 4.

---

#### Recol·lector (eix sociabilitat)

**Fantasia del jugador**: No gasto res innecessàriament. Conec cada planta,
cada trampa, cada ruta. El meu clan sobreviu quan d'altres fallen perquè
jo asseguro el que hi ha.

**Diferenciació mecànica**:
- Les accions del Recol·lector tenen el **millor ratio seguretat/food**: output
  moderat però sense cost de salut, o amb side_effect positiu de salut.
- La eina del Recol·lector és el **Garbell** (`act_trenar_garbell`): l'acció de
  consum `act_recollectar_garbell` dona 4–8 food sense risc.
- Les accions del Recol·lector **pugen sociabilitat**: el perfil social és el de
  qui organitza i distribueix, no qui ataca.
- **Nínxol d'accés**: el Recol·lector és el camí natural cap a **accions de
  conservació** (assecar, moltre, seleccionar llavors) que allarguen la
  generació sense forçar la branca.

**Accions representatives**:
- `act_recollectar_arrels` (base, pont) → empenyen sociabilitat +0.05
- `act_recollectar_garbell` (exclusiva per eina) → stable high food
- `act_molda_grans` (exclusiva) → food sense risc, +sociabilitat
- `act_trenar_garbell` (fabricació eina, exclusiva de branca)

**Problema actual identificat (DESIGN-01/BRN-03)**: el Místic no té food pròpia
de branca fins al cicle 36. Parcialment relacionat amb el Recol·lector perquè les
seves accions base (`act_recollectar_arrels`) son el salvavides del Místic.
Veure Secció 4 (proposta: accions-pont Místic → Recol·lector).

---

#### Artesà (eix intel·lecte)

**Fantasia del jugador**: Les meves mans transformen el que d'altres veurien
com a pedres i branques en quelcom completament diferent. Cada cop que fabriques
quelcom bo, el clan avança.

**Diferenciació mecànica**:
- Les accions de l'Artesà **consumeixen recursos per crear eines o valor
  augmentat**: és l'única branca que converteix pedra + branques en alguna cosa
  nova de manera sistemàtica.
- La eina de l'Artesà és l'**Estri** (`act_faonar_eines`): l'acció de consum
  `act_treballar_estris` dona output augmentat en accions d'artesania.
- Les accions de l'Artesà **pugen intel·lecte**: el perfil és el del qui
  observa i planeja abans d'actuar.
- **Nínxol d'accés**: l'Artesà és qui **desbloqueja més branques tècniques**
  (bt_buri, bt_adhesius, bt_sembra_collita, bt_terrissa) perquè moltes
  requereixen `intel·lecte min`. L'amplada del seu arbre de skills és la seva
  força.

**Accions representatives**:
- `act_tallar_pedra` → "Practicar la Talla" (base, pont) → +intel·lecte +0.05
- `act_faonar_eines` (fabricació eina, exclusiva de branca)
- `act_treballar_estris` (exclusiva per eina) → output augmentat en artesania
- `act_gravar_os` (exclusiva) → +material, +intel·lecte

---

#### Místic (eix espiritualitat)

**Fantasia del jugador**: El clan m'escolta perquè veig el que d'altres no
veuen. La salut del grup, la cohesió del clan i la connexió amb el territori
depenen de la meva feina invisible.

**Diferenciació mecànica**:
- Les accions del Místic son les úniques que generen **salut grupal de forma
  fiable** i **material via vincle social** (no via treball físic).
- La eina del Místic és l'**Ungüent/Talisman**: `act_preparar_ungüent` fa
  l'ungüent, `act_crear_talisman` fa el talisman. Totes dues generen `eina`
  usada en rituals de curació/protecció.
- Les accions del Místic **pugen espiritualitat** i sovint **pugen sociabilitat**
  simultàniament: el Místic és el pont natural entre els eixos espirituals i
  els socials.
- **Nínxol d'accés**: el Místic té accés exclusiu als **events de pool_ritual**
  que poden generar sorpreses positives excepcionals (aparicions, visions,
  cuirasses narratives).

**Problema actual identificat**: les accions `act_narrar_llegendes` i
`act_cants_grup` generen food sense justificació narrativa clara (DESIGN-01).
Proposta de resolució: reorientar-les a **material o salut** i afegir una
font de food pròpia de branca accessible pre-cicle 36 via accions-pont.
Veure Seccions 3.3 i 4.

---

## 3. Intercanviabilitat i Model de Canvi de Branca

### 3.1 Tres categories d'accions

Per entendre la intercanviabilitat cal classificar les accions en tres
categories que coexisteixen al carrusel:

| Categoria | Descripció | Exemples |
|-----------|-----------|---------|
| **Base universal** | Sense requisit d'inclinació. Visibles sempre. Empenten lleugerament qualsevol eix. | `act_recollectar_arrels`, `act_tallar_pedra`, `act_contemplacio` |
| **Pont** | Amb requisit d'inclinació lleuger (min 0.05–0.15). Accessible des de 2+ branques. Empenten cap a una branca DIFERENT de la del context. | `act_amansar_animal` (Caçador → Social), `act_ornamentar_se` (Místic → accessible) |
| **Exclusiva** | Requisit d'inclinació alt (min 0.20+). Nucli de la fantasia de branca. Empenten la branca pròpia. | `act_emboscada_nocturna`, `act_faonar_eines`, `act_ritual_talisman` |

**Regla de disseny**: cada branca ha de tenir com a mínim:
- 1 acció d'**alta recompensa exclusiva** (la raó per ser en aquella branca)
- 1–2 accions **pont** cap a branques adjacents
- 1 acció de **fabricació d'eina** exclusiva (veure Secció 3.2)

### 3.2 ECON-02 — Eines com a Upgrade Explícit

**Problema actual**: comprar l'acció `act_forjar_punta` (o qualsevol acció
d'eina) no té conseqüències si canvies de branca. El jugador pot tenir les
4 eines actives a la vegada sense cap decisió real.

**Proposta (ECON-02, direcció de l'usuari)**: la substitució d'eina en
canviar de branca es fa com una **acció d'upgrade** reutilitzant el
mecanisme `is_upgrade` / `upgrades_action_id` existent.

**Funcionament concret**:

```
Escenari: Jugador Caçador (impuls 0.45) que vira cap a Artesà (intel·lecte 0.35)

1. Quan `bt_rasclador_fi` es desbloqueja (Artesà), `act_faonar_eines` apareix
   al carrusel marcada com a "upgrade disponible" de `act_forjar_punta`.
2. `act_faonar_eines` surt DESHABILITADA al carrusel (visible però no executable)
   fins que el jugador la compra amb el seu cost de material (3🔵).
3. En comprar `act_faonar_eines`:
   - `act_forjar_punta` DESAPAREIX del carrusel (ocultada via `upgrades_action_id`)
   - `act_faonar_eines` queda ACTIVA
4. El jugador no recupera cap eina fabricada amb la llança antiga; l'estoc
   d'`eina` es manté intacte (el que ja va fabricar és seu).
5. Si el jugador torna a virar cap al Caçador i desbloqueja `bt_punta_llanca`
   de nou (possible si l'inclinació torna > 0.25 en impuls), `act_forjar_punta`
   tornaria a ser disponible com a upgrade de `act_faonar_eines`.
```

**Per a la herència**: les accions comprades s'hereten al 100% (comportament
actual inalterat). Si el pare tenia `act_faonar_eines` activa (i `act_forjar_punta`
oculta), el fill hereta exactament el mateix estat. Això és coherent amb la
filosofia de "tecnologia del llinatge".

**Taula d'equivalències d'eines**:

| Branca | Acció de fabricació | Acció de consum | Eina narrativa |
|--------|-------------------|----------------|---------------|
| Caçador | `act_forjar_punta` | `act_caca_llanca` | Llança de sílex |
| Recol·lector | `act_trenar_garbell` | `act_recollectar_garbell` | Garbell de fibres |
| Artesà | `act_faonar_eines` | `act_treballar_estris` | Estris de precisió |
| Místic | `act_preparar_ungüent` / `act_crear_talisman` | `act_curar_herbes` / `act_ritual_talisman` | Ungüent / Talisman |

**Cadena d'upgrades** (el jugador pot seguir el camí que vulgui):

```
act_forjar_punta
    └── upgrades_to: act_faonar_eines (Artesà)
            └── upgrades_to: act_trenar_garbell (Recol·lector)
                    └── upgrades_to: act_preparar_ungüent (Místic)
                             [o bé en sentit invers]
```

**Nota de disseny**: la cadena d'upgrades no ha de ser lineal obligatòria.
Qualsevol eina de qualsevol branca pot ser upgrade de qualsevol altra, perquè
el mecanisme ja gestiona "ocultar l'anterior". El jugador decideix quin camí
segueix en funció de la seva inclinació.

### 3.3 Quan canvies de branca: què mantens, què perds, què s'actualitza

Canviar de branca és un procés gradual (l'eix d'inclinació es mou lentament
per inèrcia), però quan el llindar del 34% es creua, tenen lloc els canvis
següents:

**MANTENS (no canvia res)**:
- Totes les accions comprades (incloent les de la branca anterior)
- L'eina fabricada anteriorment (estoc d'`eina`)
- Totes les habilitats (branch techs) descobertes
- La inclinació acumulada (incluint la de la branca antiga, simplement
  ja no supera el 34%)

**PERDS ACCÉS (accions faden i s'oculten)**:
- Les accions exclusives de la branca anterior queden en estat **atenuat**
  (fade) quan la inclinació surt del rang, i s'oculten si s'allunya prou.
- L'acció de fabricació d'eina de la branca antiga queda oculta (substituïda
  per la nova via upgrade si el jugador la compra).

**S'ACTUALITZA (nova branca activa)**:
- Les accions exclusives de la nova branca es fan **visibles** (si ja estan
  comprades) o **comprables** (si no ho estan i la skill corresponent
  ha estat desbloquejada).
- La nova acció d'eina apareix al carrusel com a upgrade disponible.
- Els events de pool de la nova branca s'afegeixen al pool actiu.

**Cost real del canvi**:
- El jugador perd eficiència durant la transició (les accions antigues
  s'apaguen, les noves potser no estan comprades).
- Ha de pagar el cost de material de la nova acció d'eina (3🔵) si vol
  l'upgrade d'eina.
- **No recupera el material** ja gastat en l'eina anterior.

---

## 4. Accions-Pont: Mecanisme de Transició entre Branques

### 4.1 Principi

Les accions-pont son el mecanisme central de canvi de branca. No son
un add-on: son la resposta del disseny a "com fa el jugador per virar
la inclinació sense que sembli un clic de botó?".

Una acció-pont té dues propietats clau:
1. **Requisit d'inclinació bai**x (accessible per 2 o més perfils)
2. **Delta d'inclinació que empenta cap a una branca diferent** de la
   que l'originà narrativament

### 4.2 Mapa d'accions-pont actual (extrapolat del codi)

| Acció | Branca d'origen | Branca de destí | Delta clau | Justificació narrativa |
|-------|----------------|----------------|-----------|----------------------|
| `act_espiar_ramat` | Universal | Caçador (+impuls +0.05) | +impuls | Observar la presa activa el instint de caça |
| `act_recollectar_arrels` | Universal | Recol·lector (+soc +0.05) | +sociabilitat | Recollir en grup és naturalment social |
| `act_tallar_pedra` | Universal | Artesà (+intel +0.05) | +intel·lecte | La talla és pensament aplicat |
| `act_contemplacio` | Universal | Místic (+esp +0.08) | +espiritualitat | La quietud obre a allò invisible |
| `act_amansar_animal` | Caçador (imp>0.05) | → Social (+soc) | +sociabilitat | Dominar un animal implica crear un vincle |
| `act_pasturar_bestiar` | Caçador (imp>0.05) | → Social | +sociabilitat | Cuidar el ramat és feina comunitària |
| `act_intercanviar_eines` | Artesà (int>0.08) | → Social | +sociabilitat | L'intercanvi és acte social |
| `act_ornamentar_se` | Místic (esp>0.05) | → accessible | +sociabilitat | Adornar-se és mostrar-se als altres |
| `act_parar_trampes` | Recol·lector | → Recol·lector +social | +sociabilitat | La trampa col·lectiva requereix coordinació |
| `act_torxa_escolta` | Universal (imp>0.05) | → Caçador | +impuls | Estar alerta activa la vigilància activa |

### 4.3 Accions-pont que falten (proposta)

La branca **Místic cap a la resta** és la menys servida. Avui el Místic
tendeix a estar aïllat: les seves accions pugen espiritualitat però no
ofereixen portes naturals cap a altres branques.

**Proposta: 3 noves accions-pont Místic**:

**Sacrifici Ritual** (`act_sacrifici_ritual`, nova)
- Requisit: `espiritualitat min 0.15`
- Output: food 2–4 (narrativa: "ofreixes menjar als esperits per obtenir
  la seva protecció. Menys per avui, però el clan va fort")
- Delta: `impuls +0.06, espiritualitat +0.02`
- Justificació: el sacrifici ritual és un acte de **decisió** i **risc**
  calculat. Empenta cap al Caçador (un Místic que sacrifica aprèn a
  actuar decididament)
- Soluciona: BRN-03 (food pròpia Místic pre-cicle 36), i obre transició
  Místic → Caçador

**Curació Col·lectiva** (`act_curacio_col·lectiva`, nova)
- Requisit: `espiritualitat min 0.12, sociabilitat min 0.10`
- Output: salut +8–12
- Delta: `sociabilitat +0.06, intel·lecte +0.03`
- Justificació: curar el grup requereix observació sistemàtica de cada
  membre. Empenta cap al Recol·lector (cuidar) i lleugerament cap a
  l'Artesà (metodologia)
- Diferència de `act_curar_herbes`: no requereix eina, escala menys però
  és accessible més aviat

**Narrar el Territori** (`act_narrar_territori`, nova, substitueix
parcial de `act_narrar_llegendes`)
- Requisit: `espiritualitat min 0.10, sociabilitat min 0.08`
- Output: material 2–4 (narrativa: "les teves llegendes sobre llocs
  sagrats guien el clan. Coneixement és poder")
- Delta: `intel·lecte +0.05, espiritualitat +0.01`
- Justificació: narrar el territori és cartografia oral. Empenta cap a
  l'Artesà (pensament sistemàtic sobre el territori)
- Resol DESIGN-01: `act_narrar_llegendes` donava food sense raó; aquí
  dona material (coneixement = recursos de grup), i empenta intel·lecte

### 4.4 Accions-pont existents que necessiten revisió

**`act_narrar_llegendes` i `act_cants_grup`** (DESIGN-01 pendent):
- Avui donen food amb justificació feble.
- Proposta: reorientar a material/salut i deixar que `act_sacrifici_ritual`
  i `act_narrar_territori` (noves) cobreixin la necessitat de food Místic.
- Alternativament, si l'usuari vol mantenir-les com a food: donar-los
  un delta social fort i convertir-les en accions-pont Místic → Recol·lector
  (la narració comunitària reforça el teixit social).

---

## 5. Compatibilitat amb l'Herència Forta del Llinatge

Totes les decisions d'aquesta proposta son compatibles amb la filosofia
d'herència forta. Aquí s'explicita per què:

### 5.1 Inclinació heretada (INCLINATION_INHERITANCE_RATE = 0.85)

El fill hereta el 85% de la inclinació del pare. Això significa:

- Si el pare era Caçador pur (impuls 0.60), el fill neix amb impuls ~0.51.
  Amb el llindar del 34%, el fill és **immediatament Caçador** sense haver
  executat cap acció. Això és intencionat ("la gràcia del llinatge").
- Les accions-pont no trenquen això: si el fill vol mantenir la identitat,
  evita les accions-pont. Si vol canviar, les usa.
- La inèrcia (INERTIA_FACTOR) fa que un llinatge establert en una branca
  trigui múltiples generacions a canviar de branca completament. Això és
  la tensió dramàtica del joc.

### 5.2 Habilitats (SKILL_DEFS) heretades al 100%

Les branch techs descobertes s'hereten al 100% (via `inheritanceRate` que
és un residu no actiu; la còpia real és directa). Sota ECON-02, l'estat
d'upgrade d'eines (quina eina és activa, quina oculta) **també s'hereta**.
Això vol dir:

- Si el pare va virar a Artesà i tenia `act_faonar_eines` activa
  (amb `act_forjar_punta` oculta), el fill hereta exactament aquest estat.
- No cal recalcular l'arbre d'upgrades en successió.
- Si el fill vol tornar al Caçador i té la inclinació per fer-ho, pot
  desbloquejar `bt_punta_llanca` de nou i la UI li oferirà `act_forjar_punta`
  com a upgrade disponible de `act_faonar_eines`.

### 5.3 Accions comprades heretades al 100%

Totes les accions comprades passen al fill sense condicions. Combinat
amb ECON-02, el fill hereta el **portafoli d'eines de la trajectòria del
llinatge**, no sols de la generació anterior. Això crea perfils inter-
generacionals interessants: un llinatge que va ser Caçador, va virar a
Artesà i ara torna al Caçador té disponibles accions de les tres etapes.

### 5.4 Tensió de disseny: branques en conflicte

Una conseqüència del sistema d'upgrades és que un llinatge pot tenir
`act_faonar_eines` activa però `act_forjar_punta` oculta, inclús si la
inclinació ha tornat a Caçador. Per reactivar `act_forjar_punta` caldrà
que el fill compri l'upgrade de tornada (un cost addicional de material).

Això es pot veure com:
- **Problema**: el fill "paga dues vegades" per la mateixa eina.
- **Oportunitat de disseny**: el cost de "tornar enrere" és un incentiu
  natural per mantenir la identitat del llinatge. "El teu llinatge ja
  va deixar enrere la llança."

Caldria decidir si el cost de retorn és correcte o si caldria un
descnete o una via alternativa. Veure Secció 7 (Preguntes obertes).

---

## 6. Resum de Canvis Proposats

### 6.1 Canvis al model d'eines (ECON-02)
- Eines de les 4 branques son accions d'**upgrade explícit** (mecanisme
  `is_upgrade` / `upgrades_action_id`)
- Una branca activa ofereix la seva eina com a upgrade de l'eina anterior
- El jugador paga el cost de material de la nova eina
- L'eina anterior desapareix del carrusel (oculta)
- Herència: l'estat d'upgrade es copia directe al fill

### 6.2 Accions-pont noves (3)
- `act_sacrifici_ritual`: Místic → Caçador (+food escassa, +impuls)
- `act_curacio_col·lectiva`: Místic/Social → Recol·lector/Artesà (+salut)
- `act_narrar_territori`: Místic → Artesà (+material, +intel·lecte)

### 6.3 Revisions d'accions existents
- `act_narrar_llegendes`: reorientar output a material o salut (no food)
- `act_cants_grup`: reorientar cap a pont Místic → Recol·lector (social)
- `act_recollir_branques`: ampliar threshold a `impuls max 0.50` (fix BRN-05)

### 6.4 Documentació d'identitat de branca
- Cada branca té una **frase identitària**, un **verb** i un **risc** definits
- Cada branca té una **taula d'equivalències d'eines** clara

---

## 7. Preguntes Obertes / Decisions per a l'Usuari

Aquestes son les decisions de disseny que la proposta no pot prendre
unilateralment i que l'usuari ha de validar:

---

**Q1 — Cost de retorn d'eina**
En el model ECON-02, si un fill vol tornar a l'eina d'una branca anterior,
ha de pagar el cost de material de l'upgrade de tornada. Això és:
- **(A) Correcte** — el cost de tornada és la mecànica de "la identitat del
  llinatge té pes". Un llinatge Artesà que intenta tornar al Caçador
  ha d'esforçar-s'hi.
- **(B) Massa punitiu** — el fill no hauria de pagar res per reactivar
  una eina que el llinatge ja va tenir. El cost de la primera compra és
  suficient; les tornades son gratuïtes.
- **(C) Híbrid** — cost reduït de retorn (p.ex. 1🔵 en lloc de 3🔵).

---

**Q2 — `act_narrar_llegendes` i `act_cants_grup`: food o no food?**
Avui donen food sense justificació clara (DESIGN-01). Les opcions son:
- **(A) Reorientar** a material o salut i afegir les 3 accions-pont noves
  com a via alternativa de food Místic.
- **(B) Mantenir food** però convertir-les explícitament en accions-pont
  Místic → Recol·lector (la narració comunitària genera cohesió i
  cohesió dona recursos). Delta: afegir `sociabilitat +0.08` i
  `espiritualitat +0.02`.
- **(C) Eliminar-les** i substituir-les completament per les 3 accions
  noves.

---

**Q3 — Quantes accions-pont son "suficients"?**
La proposta afegeix 3 accions-pont noves per al Místic. Les altres branques
ja en tenen (vegeu taula 4.2). Cal afegir accions-pont per a:
- **(A) Caçador → Artesà** (avui no en té cap directe)
- **(B) Recol·lector → Místic** (avui no en té cap directe)
- **(C) Cap de les dues** — les existents son suficients, les branques
  adjacents cobreixen la transició indirectament

---

**Q4 — Llança de la cadena d'upgrades d'eines**
El model proposa que les eines formen una cadena d'upgrades. Cal decidir:
- **(A) Cadena lineal**: Caçador → Artesà → Recol·lector → Místic
  (o qualsevol ordre). L'acció nova always upgrades l'anterior.
- **(B) Cadena libre**: qualsevol eina pot ser upgrade de qualsevol altra.
  El jugador no segueix una cadena predefinida; cada branck tech nova
  que desbloqueja li ofereix l'upgrade de la seva eina actual.
- **(C) No hi ha cadena** — les eines son independents. Tenir `act_forjar_punta`
  no impedeix tenir `act_faonar_eines`. Senzillament el carrusel no les
  agrupa com a upgrades. El jugador tria quina usar.

---

**Q5 — Nom de les branques al UI**
La proposta usa "Caçador", "Recol·lector", "Artesà", "Místic" com a
identificadors narratius. Però el codi intern usa `branch_hunter`,
`branch_gatherer`, etc. Quan la branca activa es mostra al jugador:
- **(A) Nom narratiu** ("El teu personatge és un Caçador")
- **(B) Eix dominant** ("Inclinació dominant: Impuls")
- **(C) Cap dels dos** — no es mostra explícitament, el jugador ho
  dedueix de les accions disponibles

---

*Document de proposta completat. Pendent de revisió i aprovació de l'usuari.*
*Versió: 1.0 — 2026-06-24*
