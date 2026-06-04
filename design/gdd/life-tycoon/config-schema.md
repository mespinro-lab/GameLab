# Life Tycoon — Config Schema

Tots els fitxers de dades viuen a `src/life-tycoon/data/`. Estan dissenyats per ser DB-ready: cada fitxer JSON és equivalent a una taula o col·lecció. El codi del joc mai té valors hardcoded — tot ve dels JSONs.

Els fitxers `.md` de disseny (aquest directori) serveixen per a col·laboració humana i amb IA. Els `.json` són la font de veritat del joc.

---

## Era (`data/eras/[id].json`)

```json
{
  "id": "prehistoria",
  "name": "Prehistòria",
  "icon": "🦴",
  "dlc": false,
  "slotAfter": null,
  "lifeExpectancy": {
    "base": 30,
    "max": 45
  },
  "dominantSliders": ["physical", "social"],
  "maxChildren": {
    "base": 6,
    "perWealthUnit": -0.3,
    "minimum": 0
  },
  "projectIds": ["gather", "hunt", "craft_tools", "socialize_tribe", "explore"],
  "homeCategoryIds": ["find_partner", "have_children", "care_home"],
  "knowledgeUnlockIds": ["fire", "stone_tools", "language_basics"],
  "startingStats": {
    "health": 80,
    "intelligence": 1,
    "social": 1,
    "wealth": 0,
    "happiness": 60,
    "familyReputation": 0
  },
  "subsistenceCostPerCycle": 5,
  "backgroundScene": "prehistoria",
  "unlockCondition": null
}
```

### Camps d'era

| Camp | Tipus | Descripció |
|---|---|---|
| `id` | string | Identificador únic, kebab-case |
| `dlc` | bool | `true` = extensió de pagament |
| `slotAfter` | string\|null | ID de l'era anterior en la cadena |
| `lifeExpectancy.base` | int | Anys de vida sense modificadors |
| `lifeExpectancy.max` | int | Màxim assolible amb salut perfecta |
| `dominantSliders` | string[] | Sliders amb bonus ×1.3 en fórmules d'aquesta era |
| `maxChildren.base` | int | Màxim fills sense modificador econòmic |
| `maxChildren.perWealthUnit` | float | Ajust per unitat de riquesa (negatiu = més cars) |
| `projectIds` | string[] | Refs a `data/projects.json` |
| `homeCategoryIds` | string[] | Refs a `data/projects.json` (categoria Llar) |
| `knowledgeUnlockIds` | string[] | Coneixements disponibles en aquesta era |
| `subsistenceCostPerCycle` | int | Cost automàtic cada cicle (supervivència) |
| `backgroundScene` | string | ID de l'escena visual |
| `unlockCondition` | object\|null | Condició per desbloquejar l'era (null = sempre disponible) |

---

## Projecte (`data/projects.json`)

```json
{
  "id": "hunt",
  "name": "Caçar",
  "category": "survival",
  "icon": "🦣",
  "description": "Surts a caçar amb la tribu. L'èxit depèn de la força i la valentia.",
  "availableInEras": ["prehistoria", "bronze-ferro"],
  "requirements": {
    "physical": 2,
    "intelligence": 0,
    "social": 0,
    "wealth": 0,
    "knowledgeIds": []
  },
  "sliderWeights": {
    "physical": 0.6,
    "intelligence": 0.1,
    "social": 0.1,
    "risk": 0.2
  },
  "baseOutput": {
    "wealth": { "min": 5, "max": 25 },
    "health": { "min": -5, "max": 2 },
    "familyReputation": { "min": 0, "max": 3 }
  },
  "knowledgeGenerated": [],
  "eventPoolId": "hunt_events",
  "zones": ["hunt"]
}
```

### Camps de projecte

| Camp | Tipus | Descripció |
|---|---|---|
| `category` | string | `survival`, `knowledge`, `trade`, `home`, `investment`, `status` |
| `availableInEras` | string[] | Eres on apareix. Pot ser múltiple. |
| `requirements` | object | Stats mínims per desbloquejar. 0 = sense requisit. |
| `sliderWeights` | object | Suma = 1.0. Pes de cada slider en la fórmula. |
| `baseOutput` | object | Rang de resultat base (modificat per stats i sliders) |
| `knowledgeGenerated` | string[] | Coneixements que pot desbloquejar (amb probabilitat) |
| `eventPoolId` | string\|null | Pool d'events associats a aquest projecte |
| `zones` | string[] | Zones de l'escena animada que s'activen |

### Fórmula de resultat

```
score = Σ (slider_value[i] × slider_weight[i]) × stat_modifier × era_modifier × knowledge_bonus
output = lerp(baseOutput.min, baseOutput.max, clamp(score, 0, 1))
```

`stat_modifier`: (stat_actual / stat_requisit_maxim_era) clamped [0.5, 2.0]  
`era_modifier`: ×1.3 si el slider és `dominantSlider` de l'era activa  
`knowledge_bonus`: +0.1 per cada coneixement rellevant posseït

---

## Coneixement (`data/knowledge.json`)

```json
{
  "id": "fire",
  "name": "Foc",
  "icon": "🔥",
  "era": "prehistoria",
  "description": "Dominar el foc canvia les possibilitats de la tribu.",
  "unlocksProjectIds": ["cook_food", "forge_tools"],
  "statBonus": {
    "health": 5
  },
  "inheritanceRate": 0.4,
  "discoveryChance": 0.3,
  "requiredProjectId": "craft_tools"
}
```

| Camp | Tipus | Descripció |
|---|---|---|
| `inheritanceRate` | float | % que es transmet als fills (0.0–1.0) |
| `discoveryChance` | float | Probabilitat de descobrir-lo en cada execució del projecte associat |
| `requiredProjectId` | string | Projecte que pot generar aquest coneixement |

---

## Event (`data/events.json`)

```json
{
  "id": "rival_hunter",
  "name": "Caçador Rival",
  "icon": "⚔️",
  "projectId": "hunt",
  "eras": ["prehistoria"],
  "triggerChance": 0.25,
  "text": "Un altre caçador reclama el teu territori. Pots confrontar-lo o cedir.",
  "options": [
    {
      "id": "confront",
      "name": "Confrontar",
      "sliderRequirement": { "physical": 3 },
      "fx": {
        "onSuccess": { "familyReputation": 5, "wealth": 10 },
        "onFailure": { "health": -15, "familyReputation": -3 }
      },
      "successChance": "physical_score"
    },
    {
      "id": "yield",
      "name": "Cedir",
      "sliderRequirement": null,
      "fx": {
        "always": { "wealth": -5, "happiness": -5 }
      },
      "successChance": 1.0
    }
  ]
}
```

---

## Personatge / Fill (`data/` — generat en runtime, no fitxer estàtic)

Els fills es generen en runtime però segueixen aquest schema (persistit en save):

```json
{
  "id": "uuid",
  "name": "Arn",
  "generation": 2,
  "parentIds": ["uuid-pare", "uuid-mare"],
  "portraitLayers": {
    "faceShape": 3,
    "skinTone": 2,
    "eyes": 1,
    "nose": 4,
    "mouth": 2,
    "hair": 5,
    "eraAccessory": "medieval_hood",
    "eraClothing": "medieval_peasant"
  },
  "virtueLabel": "Té un talent innato pel lideratge",
  "hiddenTraits": ["resilient", "?", "?"],
  "stats": {
    "physical": 3,
    "intelligence": 2,
    "social": 4
  },
  "knowledgeInherited": ["fire", "language_basics"]
}
```

`hiddenTraits`: array de 2–3 traits. Alguns mostrats com `"?"` fins que es juguen X cicles.

---

## Save Game (schema de referència)

```json
{
  "version": 1,
  "dynastyName": "Els Ferrer",
  "currentCharacterId": "uuid",
  "currentEraId": "prehistoria",
  "cycle": 7,
  "characters": [ ],
  "genealogyTree": [ ],
  "knowledgeOwned": ["fire", "stone_tools"],
  "familyReputation": 45,
  "milestones": ["first_hunter", "fire_master"],
  "checkpointSuccessionCycle": 6
}
```

`checkpointSuccessionCycle`: cicle on es va fer el darrer save de successió (per al reload si el fill mor).

---

## Fitxers per era DLC

Cada DLC afegeix **exactament aquests fitxers**, sense tocar codi existent:

```
data/eras/bronze-ferro.json
data/events-bronze-ferro.json      (o afegir ids a events.json)
data/projects-bronze-ferro.json    (o afegir ids a projects.json)
assets/scenes/bronze-ferro/        (escena animada)
assets/portraits/bronze-ferro/     (capes de retrat específiques d'era)
```

El motor detecta eres disponibles llegint `data/eras/` i ordenant per `slotAfter`.
