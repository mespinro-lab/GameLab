# Life Tycoon 2 — Event System

**Depèn de**: `_overview.md`, `action-economy.md`
**Usat per**: `scoring-system.md`, `lineage-chronicle.md`

---

## 1. Overview

Els events son situacions que ocorren **desprès d'executar una acció** i que
modifiquen el resultat final del cicle. Son probabilístics, presenten opcions
al jugador i poden encadenar-se en nous events. El resultat d'un cicle no és
determinista: la mateixa acció pot donar resultats molt diferents depenent
dels events que dispari. Aquesta imprevisibilitat és la font de tensió
principal del joc.

Els events post-acció son diferents dels **events de pressió del món**
(definits a `era-system.md`), que ocorren independentment de les accions.

---

## 2. Player Fantasy (d'aquest sistema)

*"He executat la mateixa acció deu vegades i les deu han sigut diferents.
De vegades la cadena d'events em du cap a llocs que no esperava — i quan
surt bé, la satisfacció és enorme."*

El jugador ha de sentir que cada cicle té incertesa genuïna, no per
aleatorietat pura sinó perquè les seves destreses, inclinació i decisions
pasades condicionen quins events poden ocórrer i com de bé pot resoldre'ls.

---

## 3. Regles Detallades

### 3.1 Flux d'un Event Post-Acció

```
Jugador executa Acció A
         ↓
Resultat base calculat (action-economy.md)
         ↓
¿Event disparat? (probabilitat event_pool)
    NO → resultat base és el resultat final
    SÍ → es presenta event al jugador
              ↓
         Jugador tria opció
              ↓
         Efectes de l'opció aplicats al resultat base
              ↓
         ¿Event encadenat? (probabilitat chain × EVENT_CHAIN_DECAY)
              NO → resultat final
              SÍ → nou event → ...
```

La cadena pot continuar indefinidament teòricament, però la probabilitat
decau multiplicativament per `EVENT_CHAIN_DECAY` a cada pas. En pràctica,
rarament supera 2–3 events encadenats.

### 3.2 Schema JSON — Event Pool

Un event pool és un conjunt d'events associats a una acció concreta o a
un context (zona, branca).

**Fitxer**: `data/eras/[era_id]/event_pools/[pool_id].json`

```json
{
  "id": "event_pool_id",
  "era_id": "era_id",
  "events": [
    "event_id_1",
    "event_id_2",
    "event_id_3"
  ]
}
```

Els events individuals estan en fitxers separats. El pool és simplement una
llista de referències.

### 3.3 Schema JSON — Event

**Fitxer**: `data/eras/[era_id]/events/[event_id].json`

```json
{
  "id": "event_id",
  "era_id": "era_id",
  "name": "Nom narratiu breu",
  "description": "Situació narrada en una o dues frases.",
  "icon": "icon_key",
  "is_rare": false,

  "trigger": {
    "base_probability": 0.30,
    "conditions": {
      "requires_branch_tech_id": null,
      "requires_inclination": null,
      "requires_indicator_above": null,
      "requires_indicator_below": null,
      "requires_destresa_id": null
    }
  },

  "is_skippable": false,

  "options": [
    {
      "id": "option_id",
      "text": "Text breu de l'opció.",
      "requirement": {
        "indicator_min": null,
        "resource_min": null,
        "branch_tech_id": null
      },
      "cost": {
        "resources": { "primary": 0 }
      },
      "effects": {
        "indicators": { "food": 0, "health": 0, "happiness": 0, "security": 0, "social": 0 },
        "resources": { "primary": 0 },
        "inclination_boost": {},
        "unlocks_action_id": null,
        "unlocks_branch_tech_id": null
      },
      "chain_pool_id": null,
      "chain_probability": 0.0,
      "narrative_tag": null
    }
  ]
}
```

| Camp | Tipus | Descripció |
|---|---|---|
| `is_rare` | bool | Events rars aporten punts extra al score d'era i apareixen a la crònica. |
| `trigger.base_probability` | float | Probabilitat base de disparar-se quan l'acció associada s'executa. |
| `trigger.conditions` | object | Condicions addicionals que han de complir-se. Totes s'han de satisfer. |
| `is_skippable` | bool | `false` = el jugador ha de triar una opció obligatòriament. |
| `option.requirement` | object | L'opció no és seleccionable si no es compleix el requisit. Es mostra però desactivada. |
| `option.cost` | object | Recursos consumits en escollir l'opció. |
| `option.chain_pool_id` | string\|null | Pool d'events del qual pot disparar-se un event encadenat. |
| `option.chain_probability` | float | Probabilitat base de l'event encadenat (modificada per `EVENT_CHAIN_DECAY`). |
| `option.narrative_tag` | string\|null | Tag per a la crònica. Permet identificar decisions clau. |

### 3.4 Condicions de Disparament

Un event es dispara quan:
1. `random() < trigger.base_probability` — el rol superà la probabilitat base.
2. Totes les condicions a `trigger.conditions` es compleixen.
3. L'event no ha superat el seu límit d'aparicions en la sessió actual
   (si el dissenyador defineix un `max_triggers_per_era`, opcional).

Si múltiples events del pool compleixen condicions, se n'escull un
aleatòriament entre els elegibles (ponderació per `base_probability`
normalitzada).

### 3.5 Events Encadenats

Quan el jugador resol un event triant una opció amb `chain_pool_id`,
s'avalua si es dispara un event encadenat:

```
chain_trigger_prob = option.chain_probability × (EVENT_CHAIN_DECAY ^ chain_depth)
```

On `chain_depth` comença a 1 per al primer encadenament i s'incrementa
en cada encadenament addicional. Quan `chain_trigger_prob < CHAIN_MIN_PROBABILITY`,
la cadena s'atura.

L'event encadenat s'escull del `chain_pool_id` seguint les mateixes regles
de condicions i pes.

### 3.6 Opcions No Disponibles

Si una opció té un `requirement` que el jugador no compleix, es mostra a la
UI però desactivada, amb un indicador de per què no és accessible. Sempre
hi ha com a mínim una opció disponible (l'opció per defecte/passiva).

**Opció per defecte**: Si `is_skippable: false`, sempre ha d'existir una
opció sense requisits. El dissenyador és responsable de garantir-ho.

### 3.7 Events Rars

Els events amb `is_rare: true` son events poc comuns que:
- Contribueixen a la puntuació d'era (`× W_RARE`).
- Apareixen a la crònica del llinatge.
- Alguns desbloquegen accions o tecnologies de branca inaccessibles
  per altres camins.

Els events rars haurien de tenir `trigger.base_probability` baix (< 0.10)
i condicions específiques (inclinació, destreses, tecnologies).

### 3.8 Events de Pressió del Món (referència)

Els events de pressió son gestionats per `era-system.md`. La diferència
arquitectural és:
- **Events post-acció**: disparats per l'execució d'una acció, usant el
  pool d'events de l'acció.
- **Events de pressió**: disparats pel motor cada cicle de forma autònoma,
  usant el pool d'events de pressió de l'era.

Ambdós tipus usen el mateix schema d'opcions i efectes.

---

## 4. Fórmules

### Probabilitat de Disparo

```
// Pes normalitzat per selecció entre events elegibles:
eligible_events = [e for e in pool.events if conditions_met(e) AND random() < e.trigger.base_probability]
if eligible_events:
    selected = weighted_random(eligible_events, weights=[e.trigger.base_probability for e in eligible_events])
    trigger(selected)
```

### Probabilitat d'Encadenament

```
chain_prob(depth) = option.chain_probability × (EVENT_CHAIN_DECAY ^ depth)
fire_chain = random() < chain_prob(current_depth)
```

### Output Final del Cicle

```
cycle_output = action.modified_output                  // de action-economy.md
             + Σ event_option.effects.indicators       // per cada event resolt
             + Σ event_option.effects.resources        // per cada event resolt
```

---

## 5. Casos Extrems

- **Pool d'events buit o cap event elegible**: l'acció s'executa sense event.
  Normal i esperat per a accions que rarament disparen events.

- **Event amb totes les opcions desactivades** per requisits no complerts:
  no pot passar per disseny — sempre cal una opció sense requisits. El motor
  valida això en carregar els fitxers d'events.

- **Cadena de 5+ events**: possible matemàticament però improbable. El motor
  no té cap límit fix, però `EVENT_CHAIN_DECAY` garanteix que la probabilitat
  acumulada sigui negligible. Es pot afegir un `MAX_CHAIN_DEPTH` com a
  safeguard si el disseny ho requereix.

- **Event que desbloqueja una acció ja comprada**: efecte ignorat. El motor
  comprova si l'acció ja existeix a l'inventari del jugador abans d'aplicar
  l'`unlocks_action_id`.

- **Event que millora un indicador per sobre del màxim**: el motor aplica
  `clamp(new_value, 0, INDICATOR_MAX)`. El `INDICATOR_MAX` és un tuning knob.

- **Event `is_skippable: true` i jugador no pot prendre cap acció** (per
  exemple, sense recursos per cap opció): el jugador pot tancar l'event i
  continuar. Cap efecte aplicat. L'event es considera "resolt per omissió".

---

## 6. Dependències

| Sistema | Relació |
|---|---|
| `action-economy.md` | Cada acció referencia un `event_pool_id`. |
| `era-system.md` | Els events de pressió usen el mateix schema d'opcions/efectes. |
| `branch-system.md` | Les condicions de trigger i les opcions poden requerir o modificar inclinació. |
| `scoring-system.md` | Events rars (`is_rare: true`) contribueixen al score d'era. |
| `lineage-chronicle.md` | Events rars i opcions amb `narrative_tag` apareixen a la crònica. |

---

## 7. Tuning Knobs

| Knob | Default | Rang segur | Efecte |
|---|---|---|---|
| `EVENT_BASE_TRIGGER_CHANCE` | 0.35 | 0.20–0.55 | Probabilitat global que qualsevol acció dispari algun event. Multiplicador global sobre `base_probability`. |
| `EVENT_CHAIN_DECAY` | 0.50 | 0.25–0.75 | Factor de reducció per cada event encadenat. Baix = cadenes curtes. Alt = cadenes llargues. |
| `CHAIN_MIN_PROBABILITY` | 0.05 | 0.01–0.10 | Sota aquest valor, la cadena s'atura incondicionalment. |
| `INDICATOR_MAX` | 100 | — | Valor màxim de qualsevol indicador. |

---

## 8. Criteris d'Acceptació

- [ ] Executant la mateixa acció 10 vegades, com a mínim 3 vegades es
      dispara un event diferent
- [ ] Un event encadenat (profunditat 1) ocorre en < 30% dels cicles
      (amb `EVENT_CHAIN_DECAY: 0.50` i `chain_probability` típica de 0.40)
- [ ] Una opció desactivada per requisit mostra clarament al jugador
      per quin motiu no és accessible
- [ ] Un event rar apareix a la crònica de l'era quan s'ha disparat
- [ ] El motor reporta error en carregar si un event `is_skippable: false`
      no té cap opció sense requisits
- [ ] Una cadena de events s'atura per `CHAIN_MIN_PROBABILITY` sense
      desbordament de pila ni bucle infinit
