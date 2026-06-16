# Bloodline — Game Design Document

**Nom comercial**: Bloodline
**Gènere**: Tycoon de llinatge humà, gestió estratègica per sessions llargues
**Plataforma**: iOS + Android, portrait, touch-first
**Engine (prototip)**: HTML/JS pur — `prototypes/bloodline-v2/` (Godot abandonat 2026-06)
**Art**: Reutilitza assets de Life Tycoon 1 (busts, zones, mapa)
**Sessions**: 30–90 min; múltiples eres per partida completa

> **NOTA D'ESTAT (2026-06-16)**: El prototip HTML/JS és el joc actiu.
> Els GDDs de `design/gdd/bloodline/` contenen el disseny conceptual i poden
> divergir del codi real. La font de veritat és `prototypes/bloodline-v2/data.js`
> i `prototypes/bloodline-v2/game.js`.
> Veure `prototypes/bloodline-v2/README.md` per a l'estat actual implementat.

> **Principi fonamental**: Tot el contingut del joc —eres, branques, accions,
> tecnologies, events— és completament parametritzat en fitxers de dades.
> Afegir una era, una branca o una acció nova és una operació de dades,
> sense modificar el codi del motor.

---

## 1. Overview

Life Tycoon 2 és un joc de gestió estratègica de llinatge on el jugador
construeix una dinastia humana al llarg d'eres històriques modulars. Cada era
és una **peça de puzzle**: té connectors d'entrada i sortida definits per
tecnologies universals, de manera que la cadena d'eres és extensible afegint
fitxers de dades.

Dins de cada era, el jugador executa **accions** que generen recursos i
acumulen **inclinació** cap a una o diverses **branques**. La branca emergeix
de les decisions del jugador, no s'escull. Quan la inclinació és suficient i
la tecnologia universal prerequisit existeix, es desbloquegen **tecnologies
de branca**: capacitats permanents, exclusives o compartides entre branques,
que obren noves accions i modifiquen resultats.

La recompensa ve de tres fonts: **puntuació per era** (com de bé has jugat
cada peça), **descobriment de tecnologies de branca** (meta-col·lecció entre
partides; no es poden descobrir totes en una sola partida), i una **crònica
del llinatge** única i exportable que narra la història de la seva dinastia.

---

## 2. Player Fantasy

*"Soc l'arquitecte d'una dinastia que ha evolucionat a través de les eres.
Cada generació he pres decisions que han marcat qui som — i en la propera
era, les meves accions passades obren camins que no havia vist venir."*

El jugador ha de sentir:
- **Descoberta constant**: cada partida revela tecnologies de branca i
  combinacions noves; no es poden descobrir totes en una sola partida
- **Decisions amb conseqüències reals**: els events encadenats fan que la
  mateixa acció doni resultats molt diferents segons el context
- **Progressió llegible**: les tecnologies universals arriben per temps;
  les de branca arriben per mèrits i inclinació
- **Narrativa pròpia**: la crònica del llinatge és única i exportable
- **Tensió autèntica**: la pressió ve del món (escassetat, fenòmens naturals,
  oportunitats temporals), no de rivals

---

## 3. Regles Detallades

### Core Game Loop (un cicle)

```
┌──────────────────────────────────────────────────────────┐
│ 1. ESTAT                                                 │
│    Indicadors actuals + pressió del món activa           │
│    (escassetat, fenomen natural, oportunitat temporal)   │
├──────────────────────────────────────────────────────────┤
│ 2. ACCIONS DISPONIBLES                                   │
│    Zona del mapa activa → accions comprades visibles     │
│    Algunes accions ocultes [???] fins que es descobreixen│
├──────────────────────────────────────────────────────────┤
│ 3. EXECUCIÓ                                              │
│    Resultat base → (probabilístic) Event encadenat       │
│    → (probabilístic) Segon event → Resultat final        │
│    Possible: descoberta de tecnologia de branca [!]      │
├──────────────────────────────────────────────────────────┤
│ 4. CONSEQÜÈNCIA                                          │
│    ±Indicadors  ±Recursos  ±Inclinació per branca        │
├──────────────────────────────────────────────────────────┤
│ 5. PROGRESSIÓ                                            │
│    Si cicle = N → apareix tecnologia universal           │
│    Si inclinació ≥ llindar + tec. universal = desbloq.   │
│         → nova tecnologia de branca disponible           │
│    Puntuació d'era actualitzada                          │
└──────────────────────────────────────────────────────────┘
```

### Eres com a Peces de Puzzle

Cada era és un fitxer de dades independent. El motor les encadena per ordre.

| Camp | Descripció |
|---|---|
| `entry_connector` | Tecnologia(es) universal(s) que han d'existir per iniciar l'era |
| `exit_connector` | Tecnologia(es) universal(s) que activen la transició a la següent era |
| `branches` | Branques disponibles en aquesta era (etiquetes sobre zones de l'espai d'inclinació) |
| `universal_tech_schedule` | Cicle en que apareix cada tecnologia universal |
| `zones` | Zones del mapa disponibles i en quins cicles es poden descobrir |
| `pressure_events` | Pool d'events de pressió del món (escassetat, fenòmens naturals) |

Les eres son encadenables lliurement: la `entry_connector` d'una era ha de
coincidir amb l'`exit_connector` de l'era anterior. Inserir una era nova entre
dues existents = redefinir connectors, sense tocar codi.

### Tecnologies Universals

Apareixen automàticament al cicle definit al `universal_tech_schedule` de
l'era. Son iguals per a totes les branques. No calen accions específiques per
descobrir-les. Actuen com a **prerequisit** per a les tecnologies de branca
derivades.

*[exemple il·lustratiu — el contingut real es definirà al content plan]*
> Una tecnologia universal del cicle 5 podria desbloquejar capacitats
> molt diferents depenent de la branca activa del jugador.

### Tecnologies de Branca

Requereixen dos condicions simultànies:
1. La tecnologia universal prerequisit existeix (ha aparegut al cicle corresponent)
2. La inclinació del jugador cap a la branca associada és ≥ `BRANCH_TECH_MIN_INCLINATION`

Cada tecnologia universal desbloqueja **2–3 tecnologies de branca**. Algunes
son exclusives d'una branca; d'altres son **compartides entre 2 branques**,
actuant com a ponts que permeten virar d'inclinació de manera natural.

```
TECNOLOGIA UNIVERSAL [exemple il·lustratiu]
    ├── Tecnologia de branca A  → branca: [X]         ← exclusiva
    ├── Tecnologia de branca B  → branques: [X, Y]    ← pont
    └── Tecnologia de branca C  → branca: [Z]         ← exclusiva
```

Les tecnologies de branca son descobriments permanents del llinatge. Un cop
descoberta, queda disponible per a tots els personatges futurs de la mateixa
branca.

### Inclinació i Branques

La **inclinació** és un conjunt de 4 eixos globals, persistents entre totes les
eres, que descriuen el perfil del llinatge. Cada eix va de -1 a +1:

| Eix | -1 | +1 |
|---|---|---|
| `impuls` | reflexiu / calculat | impulsiu / d'acció directa |
| `intel·lecte` | intuïtiu / instintiu | analític / científic |
| `espiritualitat` | material / pragmàtic | espiritual / místic |
| `sociabilitat` | solitari / independent | col·lectiu / líder social |

Les accions empenten gradualment els eixos. Com més profunda és la inclinació
en una direcció, més inèrcia té (és més lent de canviar), però mai és
irreversible.

Les **branques** son etiquetes era-específiques que el motor assigna quan els
valors d'inclinació cauen dins d'una zona de l'espai. La mateixa inclinació
pot derivar en branques de noms diferents a cada era. No cal cap mapa de
transició entre eres — les inclinacions travessen les eres tal qual.

```
Inclinació actual [exemple]:
  impuls: +0.65  ·  intel·lecte: -0.20  ·  espiritualitat: -0.30  ·  sociabilitat: +0.40
  → Branca activa (era X): "Guerrer Tribal"
  → Branca activa (era Y): "Capità de Milícies" (mateixos valors, nova era)
```

Els híbrids son naturals: un llinatge amb `impuls` alt i `sociabilitat` alta
estarà al punt d'intersecció entre branques guerreres i comercials, accedint
a accions de totes dues zones.

### Accions

Les accions viuen dins de **zones** del mapa. Es **compren amb recursos** i
queden disponibles permanentment un cop comprades. Poden tenir **upgrades**
(millores comprades progressivament de la mateixa acció).

Cada acció té:
- `base_output`: necessitats i recursos que genera (visibles acumulant-se, estil GDT)
- `inclination_deltas`: com empenta cada eix d'inclinació (+ o −)
- `inclination_requirements`: rang d'eixos necessari per ser visible/executable
- `event_pool`: pool d'events que pot desencadenar

**Visibilitat per inclinació**: una acció fora del rang d'inclinació s'apaga
gradualment (fade) i, si s'allunya prou, desapareix. Les accions comprades
no es perden — es "congelen" fins que la inclinació torni al rang. Virar de
branca té un cost real: les accions comprades de la branca anterior van
quedant inactives.

Dues accions amb reward similar son bifurcacions de camí: empenten els eixos
en direccions diferents. La tria entre elles és la decisió que forma la
inclinació del llinatge.

### Events

Els events son situacions que ocorren **desprès d'una acció** (o en cadena,
desprès d'un event anterior), de manera probabilística. Presenten opcions amb
conseqüències sobre indicadors, recursos i inclinació. El resultat final d'un
cicle és:

```
resultat_cicle = acció.base_output ± Σ events_encadenats.modificadors
```

La cadena d'events es va atenuant: cada event encadenat té menys probabilitat
de produir un nou event (`EVENT_CHAIN_DECAY`).

### Jerarquia de Recursos i Indicadors

El joc té tres nivells diferenciats:

**Nivell 1 — Indicadors base** (estats globals, universals entre eres):

| Indicador | Símbol | Efecte a 0 |
|---|---|---|
| Salut | ❤️ | Mort del personatge |
| Felicitat | ✨ | Penalització als resultats d'accions |
| Seguretat | 🛡️ | Augment de freqüència d'events de pressió |
| Social | 👥 | Pèrdua d'accés a accions socials |

**Nivell 2 — Necessitats** (consum periòdic; si s'esgoten, afecten indicadors base):
Elements com Menjar o Riquesa — no son estats fonamentals sinó mitjans.
Si Menjar s'esgota, Salut decreix. Els noms son era-específics.

**Nivell 3 — Recursos d'acció** (moneda acumuladora, estil GDT):
Generats per **totes** les accions en executar-se, en major o menor quantitat
depenent del tipus d'acció i la branca. Visibles acumulant-se. Es gasten per
comprar i millorar accions. **Un sol token per era** (noms era-específics):

| Era | Token | Símbol |
|---|---|---|
| Paleolític | Provisions | 🦴 |
| Neolític | Gra | 🌾 |
| Edat del Bronze | Metall | 🔶 |
| ... | ... | ... |

**Relació amb Nivell 2 (Menjar)**: el token de l'era NO és el Menjar. El Menjar
és un indicador de necessitat independent que disminueix cada cicle. Les accions
de caça/recol·lecta sí que generen Menjar com a side_effect (a més del token
principal). Si el Menjar s'esgota, la Salut baixa.

**Analogia Game Dev Tycoon**: els tokens d'acció = els diners del joc. El Menjar
= els sous del personal que has de pagar cada mes.

### Altres Conceptes del Personatge

| Concepte | Definició | Herència |
|---|---|---|
| **Inclinació** | 4 eixos globals [-1,+1]. Persistent entre eres i generacions. | Sí, parcial |
| **Atribut** | Força / Enginy / Vincle (1.0–5.0). Creix per ús, hereta al 65%. Veure `character-stats.md`. | Sí, parcial |
| **Destresa** | Aptitud apresa per repetició d'accions (threshold configurable). Era-nomenada. | Sí, íntegra |
| **Característica** | Tret innat. Herència + atzar en néixer. *Post-prototip.* | Parcial |
| **Aprenentatge** | Coneixement acumulat per experiència. *Post-prototip.* | Parcial |

### Transició d'Era

```
Exit connector assolit
         ↓
[Puntuació d'era]    — score, títol obtingut, tecn. de branca descobertes
         ↓
[Crònica narrativa]  — fets clau de l'era narrats a partir de decisions reals
         ↓
[Nova era comença]   — inclinació heretada tal qual (4 eixos globals)
                       branques de la nova era emergeixen dels mateixos valors
                       primeres accions visibles reflecteixen la inclinació actual
```

---

## 4. Fórmules

### Actualització d'Inclinació (per eix)

```
// En executar una acció:
per cada eix a in [impuls, intel·lecte, espiritualitat, sociabilitat]:
    delta_efectiu = action.inclination_deltas[a] / (1 + |inclinació[a]| × INERTIA_FACTOR)
    inclinació[a] = clamp(inclinació[a] + delta_efectiu, -1.0, 1.0)
```

Com més proper a ±1, més inèrcia (canvi més lent). Mai irreversible.

### Desbloqueig de Tecnologia de Branca

```
can_unlock(tech) = (tech.universal_prereq ∈ player.universal_techs)
                   AND condicions_inclinació_satisfetes(tech.inclination_conditions)
```

### Resultat d'un Cicle

```
result = action.base_output + Σ (event_i.modifier)   per cada event en la cadena
```

### Puntuació d'Era

```
era_score = (branch_techs_discovered × W_TECH)
          + (rare_events_triggered   × W_RARE)
          + (efficiency_bonus        × W_EFF)

efficiency_bonus = max(0, BASE_CYCLES_PER_ERA − cycles_used) × EFFICIENCY_PER_CYCLE
```

---

## 5. Casos Extrems

- **Inclinació zero** (primers cicles): cap tecnologia de branca es desbloqueja.
  El jugador veu les accions base disponibles a totes les branques actives sense
  restricció de branca.
- **Inclinació molt distribuïda**: branques per sota de `MIN_BRANCH_INCLINATION`
  no desbloquegen tecnologies pròpies. La tecnologia universal prerequisit queda
  en estat "pendent" fins que la inclinació ho permet.
- **Tecnologia universal apareix sense inclinació suficient**: es registra com
  a disponible i es desbloqueja automàticament quan la inclinació assoleixi el
  llindar.
- **Transició d'era sense branca dominant** (inclinació propera a 0 en tots
  els eixos): la nova era comença sense cap branca activa. Les branques
  emergiran quan les primeres accions de la nova era empentin els eixos.
- **Mort sense fills directes**: si existeixen altres branques vives del
  llinatge (cosins, nebots), el joc continua amb la branca més propera.
  Game over únicament quan s'extingeix tot l'arbre del llinatge.
- **Múltiples fills vius**: el jugador tria quina branca del llinatge és
  l'activa. Les altres continuen com a "branca latent" de l'arbre genealògic.
- **Mort amb fills però sense heir escollit**: l'únic fill viu s'activa
  automàticament.

---

## 6. Dependències

| Sistema | Document |
|---|---|
| Era System (connectors, transicions) | `era-system.md` |
| Branch System (branques, inclinació, mapes) | `branch-system.md` |
| Action Economy (zones, compra, upgrades) | `action-economy.md` |
| Event System (cadenes, pools, probabilitats) | `event-system.md` |
| Scoring System (fórmules detallades, títols) | `scoring-system.md` |
| Lineage & Chronicle (herència, crònica) | `lineage-chronicle.md` |
| Badge System (meta-col·lecció fora partida) | `badge-system.md` |
| Content Plan Era 1 | `content-plan-era1.md` |
| Tech Architecture | `tech-architecture.md` |

---

## 7. Tuning Knobs

| Knob | Default suggerit | Efecte |
|---|---|---|
| `MIN_BRANCH_INCLINATION` | 0.20 | % mínim per activar una branca |
| `BRANCH_TECH_MIN_INCLINATION` | 0.25 | % mínim per desbloquejar tec. de branca |
| `BRANCH_INHERITANCE_RATE` | 0.65 | % d'inclinació heretada entre generacions |
| `KNOWLEDGE_INHERITANCE_RATE` | 0.70 | % d'aprenentatges heretats per generació |
| `EVENT_BASE_TRIGGER_CHANCE` | 0.35 | Probabilitat base d'event post-acció |
| `EVENT_CHAIN_DECAY` | 0.50 | Reducció de probabilitat per event encadenat |
| `BASE_CYCLES_PER_ERA` | Per era | Cicles base disponibles per vida |
| `EFFICIENCY_PER_CYCLE` | 10 | Punts d'eficiència per cicle estalviat |
| `W_TECH` | 50 | Pes tecns. de branca en score d'era |
| `W_RARE` | 200 | Pes events rars en score d'era |
| `W_EFF` | 30 | Pes eficiència en score d'era |

---

## 8. Criteris d'Acceptació (MVP — Era 1 amb 3 branques)

- [ ] Jugador nou completa Era 1 amb inclinació dominant en menys de 90 min
- [ ] Dues partides amb inclinació dominant diferent ofereixen accions notablement
      diferents al llarg de l'era
- [ ] En una partida, el jugador descobreix ≥1 tecnologia de branca que no sabia
      que existia (efecte sorpresa funcional)
- [ ] La mateixa tecnologia universal genera tecnologies de branca amb efectes
      clarament diferenciats per branca
- [ ] Una tecnologia de branca compartida entre 2 branques és perceptible com a
      "pont" (la inclinació es mou cap a la branca secundària)
- [ ] La mort per escassetat d'indicadors és llegible i no se sent injusta
- [ ] La pantalla de score d'era desglossa per quins factors s'ha obtingut la puntuació
- [ ] Afegir una branca nova a Era 1 requereix únicament modificar fitxers de dades
