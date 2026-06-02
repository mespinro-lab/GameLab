# Life Tycoon 2 — Era System

**Depèn de**: `_overview.md`
**Usat per**: `branch-system.md`, `action-economy.md`, `event-system.md`, `scoring-system.md`

---

## 1. Overview

Una era és la unitat modular principal del joc. Cada era és un fitxer de
dades que defineix un context històric complet: branques disponibles, zones
del mapa, tecnologies universals i la seva cadència, condicions d'entrada i
sortida, i la pressió ambiental del món. Les eres s'encadenen formant la
cadena de joc; inserir o eliminar una era és una operació de dades que no
toca el codi del motor.

---

## 2. Player Fantasy (d'aquest sistema)

*"Cada era se sent com una partida diferent, però el meu llinatge porta
la memòria de tot el que ha viscut. Quan es fa la transició, reconec
patrons de les decisions passades en les primeres accions que tinc disponibles."*

El jugador ha de sentir que cada era és un repte nou però coherent amb
l'anterior, i que el sistema de connectors garanteix que no hi ha salts
arbitraris — cada era té sentit on és.

---

## 3. Regles Detallades

### 3.1 Cadena d'Eres

Les eres formen una cadena lineal ordenada. L'ordre es defineix a un fitxer
de registre central. El motor llegeix aquest registre per determinar la
seqüència de joc.

**Fitxer**: `data/era_registry.json`

```json
{
  "era_chain": [
    "era_id_1",
    "era_id_2",
    "era_id_3"
  ]
}
```

**Inserir una era nova** entre dues existents:
1. Crear el fitxer de l'era nova amb els connectors adequats.
2. Afegir el seu `id` a la posició correcta de `era_chain`.
3. Actualitzar els connectors de les eres adjacent (veure 3.3).
4. Zero canvis de codi.

### 3.2 Schema JSON — Era

Fitxer de referència: `data/eras/[era_id]/era.json`

```json
{
  "id": "era_id",
  "name": "Nom narratiu de l'era",
  "description": "Una frase que descriu el context.",
  "icon": "icon_key",
  "dlc": false,

  "entry_connector": {
    "universal_tech_ids": ["tech_id"],
    "description": "Condició per iniciar aquesta era."
  },

  "exit_connector": {
    "universal_tech_ids": ["tech_id"],
    "description": "Tecnologia que desencadena la transició a la siguiente era."
  },

  "life_expectancy": {
    "base_cycles": 12,
    "max_cycles": 20
  },

  "universal_tech_schedule": [
    { "at_cycle": 3,  "tech_id": "universal_tech_A" },
    { "at_cycle": 7,  "tech_id": "universal_tech_B" },
    { "at_cycle": 12, "tech_id": "universal_tech_C" }
  ],

  "zones_ref": ["zone_id_1", "zone_id_2", "zone_id_3"],
  "pressure_event_pool_id": "pressure_pool_id",

  "indicator_names": {
    "health":   "Nom era-específic per a Salut",
    "happiness":"Nom era-específic per a Felicitat",
    "security": "Nom era-específic per a Seguretat",
    "social":   "Nom era-específic per a Social"
  },

  "resource_names": {
    "primary": "Nom del recurs principal de l'era",
    "secondary": "Nom del recurs secundari (opcional)"
  },

  "starting_conditions": {
    "indicators": {
      "health": 80, "happiness": 60, "security": 40, "social": 30
    },
    "resources": {
      "primary": 10
    }
  },

  "assets": {
    "map_background": "asset_key",
    "transition_scene": "asset_key"
  }
}
```

| Camp | Tipus | Descripció |
|---|---|---|
| `entry_connector.universal_tech_ids` | string[] | Tecns. universals que han d'existir per iniciar l'era. Buit = primera era. |
| `exit_connector.universal_tech_ids` | string[] | Tecns. universals que, en aparèixer, marquen la fi de l'era. |
| `life_expectancy.base_cycles` | int | Cicles base per vida de personatge. |
| `life_expectancy.max_cycles` | int | Màxim cicles amb indicadors òptims. |
| `universal_tech_schedule` | object[] | Cicle en que apareix cada tecnologia universal. Relatiu a l'inici de l'era (no de la vida del personatge). |
| `indicator_names` | object | Noms era-específics dels indicadors universals. El motor usa sempre els IDs interns. |
| `resource_names` | object | Noms era-específics dels recursos. |
| `starting_conditions` | object | Valors inicials d'indicadors i recursos al començar l'era (primera vida). |
| `dlc` | bool | `true` = era de pagament. |

### 3.3 Connectors

Els connectors son el mecanisme d'encadenament entre eres. Un connector és
simplement una referència a una o més tecnologies universals.

**Regla de coherència**: l'`exit_connector` de l'era N ha de coincidir
exactament amb l'`entry_connector` de l'era N+1. Si no coincideixen, el
motor reporta un error de configuració en arrencar.

**Primera era**: `entry_connector.universal_tech_ids = []` (buit). No té
prerequisit.

**Inserir una era entre N i N+1**:
- L'era nova rep com a `entry_connector` l'exit_connector de N.
- L'era nova defineix un nou `exit_connector` (una tech nova o existent).
- L'era N+1 actualitza el seu `entry_connector` al nou exit de l'era inserida.

*[exemple il·lustratiu — el contingut real es definirà al content plan]*
> Prehistòria surt per "Agricultura". Neolític entra per "Agricultura" i surt
> per "Metal·lúrgia". Inserir "Era de la Pedra Polida" entre elles:
> Prehistòria ja surt per "Talla de pedra avançada" (nova tech), la nova era
> entra per "Talla de pedra avançada" i surt per "Agricultura".
> Neolític segueix entrant per "Agricultura" — no canvia.

### 3.4 Tecnologies Universals

**Fitxer**: `data/eras/[era_id]/universal_techs/[tech_id].json`

```json
{
  "id": "universal_tech_id",
  "era_id": "era_id",
  "name": "Nom narratiu",
  "description": "Efecte en una frase.",
  "icon": "icon_key",
  "appears_at_cycle": 7,
  "is_exit_connector": false,
  "one_time_effects": {
    "indicator_deltas": { "health": 5 },
    "unlocks_zone_ids": []
  },
  "derived_branch_tech_ids": [
    "branch_tech_id_A",
    "branch_tech_id_B",
    "bridge_tech_id_C"
  ]
}
```

| Camp | Tipus | Descripció |
|---|---|---|
| `appears_at_cycle` | int | Cicle de l'era (no de la vida) en que apareix. Persistent entre generacions. |
| `is_exit_connector` | bool | `true` si aquesta tech desencadena la transició d'era. |
| `one_time_effects` | object | Efectes aplicats una sola vegada en aparèixer. |
| `derived_branch_tech_ids` | string[] | Tecns. de branca que aquesta universal habilita com a prerequisit. Cada jugador veurà les que coincideixen amb la seva inclinació actual. |

**Important**: el cicle `appears_at_cycle` és un comptador de l'era, no del
personatge. Persita entre generacions: si un personatge mor al cicle 5 de
l'era i el fill comença, el cicle de l'era continua a 6. Les tecnologies
universals apareixen independentment de quants personatges hagin viscut.

**En aparèixer una tecnologia universal**, el motor avalua quines de les seves
`derived_branch_tech_ids` el jugador pot desbloquejar (prerequisit complert +
inclinació coincident) i notifica la UI amb "Noves habilitats disponibles". El
jugador no veu automàticament quantes hi ha ni quines son les ocultes (`is_hidden: true`).

### 3.5 Zones

Les zones son àrees del mapa on viuen les accions. El jugador descobreix
zones durant el joc; algunes estan disponibles des del principi, d'altres
requereixen condicions.

**Fitxer**: `data/eras/[era_id]/zones/[zone_id].json`

```json
{
  "id": "zone_id",
  "era_id": "era_id",
  "name": "Nom narratiu",
  "description": "Una frase.",
  "icon": "icon_key",
  "asset": "asset_key",

  "discovery_condition": {
    "type": "initial",
    "at_cycle": null,
    "requires_universal_tech_id": null,
    "requires_action_id": null
  },

  "available_action_ids": ["action_id_1", "action_id_2", "action_id_3"]
}
```

**Tipus de `discovery_condition`**:

| Tipus | Descripció |
|---|---|
| `initial` | Disponible des del principi de l'era. |
| `cycle` | S'activa quan `era_cycle ≥ at_cycle`. |
| `universal_tech` | S'activa quan la tecnologia universal `requires_universal_tech_id` apareix. |
| `action` | S'activa quan el jugador executa per primera vegada l'acció `requires_action_id`. |

### 3.6 Events de Pressió del Món

Els events de pressió son situacions que el motor genera periòdicament o
condicionalment, independentment de les accions del jugador. Creen tensió
i escassetat sense dependre de competència amb altres personatges.

**Fitxer**: `data/eras/[era_id]/pressure_events.json`

```json
{
  "pool_id": "pressure_pool_id",
  "era_id": "era_id",
  "events": [
    {
      "id": "pressure_event_id",
      "name": "Nom narratiu",
      "description": "Situació narrada en una o dues frases.",
      "icon": "icon_key",
      "trigger": {
        "type": "periodic",
        "base_probability_per_cycle": 0.15,
        "min_era_cycle": 3,
        "condition": {
          "indicator_below": { "food": 30 }
        }
      },
      "is_blockable": true,
      "block_condition": {
        "indicator_above": { "security": 50 }
      },
      "effects": {
        "indicators": { "food": -15, "happiness": -10 },
        "options": [
          {
            "id": "option_id",
            "text": "Opció de resposta.",
            "cost": { "resource_primary": 5 },
            "outcome": {
              "indicators": { "food": 5 }
            }
          }
        ]
      }
    }
  ]
}
```

| Camp de trigger | Descripció |
|---|---|
| `type: "periodic"` | S'avalua cada cicle amb `base_probability_per_cycle`. |
| `type: "conditional"` | S'activa quan la condició es compleix, una sola vegada. |
| `type: "scheduled"` | S'activa exactament al cicle `at_cycle` de l'era. |
| `min_era_cycle` | No pot aparèixer abans d'aquest cicle de l'era. |
| `condition` | Condició addicional sobre indicadors o tecns. |
| `is_blockable` | Si `true`, el jugador pot evitar l'event si compleix `block_condition`. |

### 3.7 Transició d'Era

Quan la tecnologia universal `is_exit_connector: true` apareix, l'era entra
en estat **"transició pendent"**. La transició es completa a la **propera
successió** (mort o retirada del personatge actual).

**Flux de transició**:

```
Exit connector apareix al cicle N
         ↓
[Estat: transició pendent]
  → El jugador ho veu indicat a la UI
  → El personatge actual pot continuar fins morir/retirar-se
         ↓
Successió del personatge
         ↓
[Pantalla de puntuació d'era]
  → Score detallat (veure scoring-system.md)
  → Títol obtingut
  → Tecnologies de branca descobertes en aquesta era
         ↓
[Crònica narrativa de l'era]
  → Fets clau generats a partir de decisions reals
         ↓
[Nova era comença]
  → Els 4 eixos d'inclinació es transfereixen directament sense conversió
  → Les branques de la nova era emergeixen dels mateixos valors d'inclinació
  → starting_conditions de la nova era aplicades
  → Tecnologies universals: cap (nova era, comptador a 0)
  → Tecnologies de branca de l'era anterior: no es traslladen
  → Aprenentatges heretats: parcials (KNOWLEDGE_INHERITANCE_RATE)
```

**Important**: les tecnologies universals **no es traslladen** d'una era a
l'altra. Cada era té el seu propi `universal_tech_schedule` i comença des de
zero. Les tecnologies de branca tampoc es traslladen — la nova era comença
sense cap tecnologia de branca descoberta. La inclinació, en canvi, es
transfereix íntegrament: els mateixos 4 valors d'eixos, sense transformació.

### 3.8 Estructura de Fitxers d'una Era

```
data/eras/[era_id]/
    era.json                          ← definició principal de l'era
    universal_techs/
        [tech_id].json                ← una per tecnologia universal
    branches/
        [branch_id].json              ← una per branca (branch-system.md)
    branch_techs/
        [tech_id].json                ← una per tecnologia de branca
    zones/
        [zone_id].json                ← una per zona
    pressure_events.json              ← pool d'events de pressió
```

Afegir una era nova = crear aquesta estructura de fitxers + afegir l'id a
`era_registry.json`. El motor la detecta automàticament.

---

## 4. Fórmules

### Cicle de l'Era

```
era_cycle = cicle acumulat des de l'inici de l'era
            (continua entre generacions; no es reinicia en successió)
```

### Aparició de Tecnologia Universal

```
per cada tech en universal_tech_schedule:
    if era_cycle == tech.at_cycle AND tech.id ∉ player.universal_techs:
        player.universal_techs.add(tech.id)
        apply(tech.one_time_effects)
        check_branch_tech_pending_unlocks()
        if tech.is_exit_connector:
            era.transition_pending = true
```

### Probabilitat d'Event de Pressió

```
per cada event en pressure_pool (evaluat cada cicle):
    if era_cycle < event.trigger.min_era_cycle: skip
    if event.is_blockable AND block_condition_met: skip
    if random() < event.trigger.base_probability_per_cycle
       AND condition_met(event.trigger.condition):
        trigger(event)
```

---

## 5. Casos Extrems

- **Personatge que mor just quan apareix el exit connector**: la transició es
  completa en aquesta mateixa successió. No cal un cicle addicional.

- **Jugador que es nega a succir indefinidament** (si el joc ho permet): el
  personatge actual esgota `max_cycles` i mor forçosament. La transició es
  processa aleshores.

- **Era sense exit connector** (última era del joc): `exit_connector.universal_tech_ids = []`.
  L'era acaba quan el jugador no té més successors (game over/victòria final).

- **Dues tecnologies universals al mateix cicle**: s'apliquen les dues en
  ordre d'aparició al `universal_tech_schedule`. Si les dues derivin branch
  techs per la mateixa branca, els dos desbloqueigs s'avaluen seqüencialment.

- **Era DLC no comprada**: si `era.dlc = true` i l'usuari no la té, la cadena
  salta a la era DLC a la siguiente era no-DLC disponible. L'exit connector
  de l'era anterior ha de ser compatible amb l'entry connector de la primera
  era no-DLC que segueixi.

- **Era inserida retroactivament en una partida en curs**: no s'aplica.
  Les partides en curs segueixen la cadena d'eres que tenien en iniciar-se.
  Les eres noves s'apliquen a partides noves.

---

## 6. Dependències

| Sistema | Relació |
|---|---|
| `branch-system.md` | Cada era defineix les seves branques (zones sobre els eixos globals d'inclinació) |
| `action-economy.md` | Les zones de l'era contenen les accions disponibles |
| `event-system.md` | Els events post-acció usen pools d'events era-específics; els events de pressió son era-específics |
| `scoring-system.md` | La puntuació d'era usa cicles transcorreguts i tecns. de branca descobertes |
| `lineage-chronicle.md` | La crònica es genera en la transició d'era |
| `tech-architecture.md` | El motor ha de detectar eres dinàmicament llegint `era_registry.json` |

---

## 7. Tuning Knobs

| Knob | Default | Rang segur | Efecte |
|---|---|---|---|
| `BASE_CYCLES_PER_ERA` | Per era (era.json) | 8–25 | Durada d'una vida dins l'era. |
| `MAX_CYCLES_PER_ERA` | Per era (era.json) | base+4 – base+12 | Durada màxima amb indicadors òptims. |
| `PRESSURE_EVENT_GLOBAL_MULTIPLIER` | 1.0 | 0.5–2.0 | Escala la freqüència de tots els events de pressió. |
| `ERA_CYCLE_CONTINUATION` | true | — | Si `true`, el cicle de l'era continua entre generacions (recomanat). Si `false`, cada personatge comença el cicle de l'era a zero (no recomanat). |

---

## 8. Criteris d'Acceptació

- [ ] Afegir una era nova al joc requereix únicament crear els fitxers de
      `data/eras/[nova_era_id]/` i afegir l'id a `era_registry.json`
- [ ] Si l'`exit_connector` de l'era N no coincideix amb l'`entry_connector`
      de l'era N+1, el motor reporta un error clar en arrencar
- [ ] Les tecnologies universals apareixen al cicle correcte de l'era
      independentment de quantes generacions hagin passat
- [ ] La transició d'era es completa a la propera successió un cop el exit
      connector ha aparegut, no immediatament
- [ ] Una zona amb `discovery_condition.type = "action"` no apareix al mapa
      fins que el jugador executa l'acció requerida per primera vegada
- [ ] Un event de pressió amb `is_blockable: true` no s'activa si el jugador
      compleix la `block_condition`
- [ ] Les `starting_conditions` de la nova era s'apliquen correctament al
      primer personatge de la nova era, independentment de l'estat del
      personatge anterior
