> ⚠️ OBSOLET (2026-06-06) — Font de veritat: `prototypes/bloodline/data.js`. Reescriure quan el prototip passi a producció.

# Life Tycoon 2 — Lineage & Chronicle

**Depèn de**: `_overview.md`, `branch-system.md`, `scoring-system.md`, `event-system.md`
**Usat per**: `badge-system.md`

---

## 1. Overview

El sistema de llinatge defineix com la informació del personatge actual es
transmet als descendents (herència generacional dins una era) i com s'adapta
en la transició entre eres (veure `branch-system.md` i `era-system.md`).
La crònica és el document narratiu generat automàticament en acabar cada era
a partir de les decisions reals del jugador. És exportable i única per partida.

---

## 2. Player Fantasy (d'aquest sistema)

*"La crònica del meu llinatge explica la meva partida millor que jo ho podria
fer. Cada decisió important hi és. I és diferent de la de qualsevol altra persona."*

El jugador ha de sentir que la crònica és el seu trofeu narratiu: una prova
tangible i compartible del camí que ha recorregut.

---

## 3. Regles Detallades

### 3.1 Herència Generacional (dins la mateixa era)

En la successió d'un personatge al fill dins la mateixa era:

| Element | Herència |
|---|---|
| **Inclinació** | Parcial: `inclinació_fill[a] = inclinació_pare[a] × BRANCH_INHERITANCE_RATE + contribució_destresa[a]` |
| **Tecnologies universals** | 100% (l'era les acumula, no el personatge) |
| **Tecnologies de branca** | 100% (descobriment permanent del llinatge) |
| **Accions comprades** | 100% (inventari permanent del llinatge) |
| **Aprenentatges** | Parcial: `KNOWLEDGE_INHERITANCE_RATE` |
| **Destreses** | 100% (innates, heretades íntegrament per genètica) |
| **Característiques** | Parcial (herència + atzar en néixer) |
| **Indicadors** | No (els fills comencen amb `starting_indicators_on_succession`) |
| **Recursos** | Parcial: `RESOURCE_INHERITANCE_RATE` |
| **Reputació** | Parcial: `REPUTATION_INHERITANCE_RATE` (dinàstica, persisteix) |

**`starting_indicators_on_succession`**: valors d'indicadors amb que comença
el fill, definits per era a `era.json`. Son fixos i no depenen dels indicadors
finals del pare (per evitar efecte "morir sa / néixer malalt").

### 3.2 Herència entre Eres

En la transició entre eres:

| Element | Herència inter-era |
|---|---|
| **Inclinació** | 100% — els 4 eixos es transfereixen directament sense conversió |
| **Tecnologies universals** | No (cada era té el seu schedule, comença a 0) |
| **Tecnologies de branca** | No (la nova era comença sense cap tec. de branca descoberta) |
| **Accions comprades** | No (la nova era té les seves pròpies accions i zones) |
| **Aprenentatges** | Parcial: `KNOWLEDGE_INHERITANCE_RATE` |
| **Destreses** | 100% |
| **Característiques** | Parcial |
| **Indicadors** | No (starting_conditions de la nova era) |
| **Recursos** | No (starting_conditions de la nova era) |
| **Reputació** | Parcial: `REPUTATION_ERA_DECAY` |

### 3.3 Schema JSON — Personatge

El personatge és l'entitat que juga cada vida. Es genera en runtime però
segueix aquest schema (persistit en el save):

```json
{
  "id": "char_uuid",
  "name": "Nom del personatge",
  "generation": 3,
  "era_id": "era_id",
  "parent_id": "parent_uuid",
  "portrait_seed": 12345,

  "destreses": ["destresa_id_1", "destresa_id_2"],
  "characteristics": ["char_id_1"],
  "knowledge_ids": ["aprenentatge_id_1", "aprenentatge_id_2"],

  "inclination": {
    "impuls":        0.65,
    "intel·lecte":  -0.20,
    "espiritualitat":-0.10,
    "sociabilitat":  0.40
  },

  "cycles_lived": 9,
  "cause_of_death": "old_age",

  "chronicle_events": [
    {
      "cycle": 3,
      "type": "rare_event",
      "event_id": "event_id",
      "option_chosen": "option_id",
      "narrative_tag": "tag"
    }
  ]
}
```

`chronicle_events`: registre de moments clau del personatge, usats per
generar la crònica. Es guarden:
- Events rars disparats i opció triada.
- Tecnologies de branca descobertes (first discovery).
- Títols obtinguts.
- Opcions d'events amb `narrative_tag`.
- Transicions d'era.

### 3.4 Generació de la Crònica

La crònica s'assembla a partir de plantilles de text parametritzades. Cada
entrada de `chronicle_events` pot generar una frase o paràgraf de la crònica.

**Fitxer de plantilles**: `data/eras/[era_id]/chronicle_templates.json`

```json
{
  "era_id": "era_id",
  "era_intro_template": "El llinatge {dynasty_name} va viure l'era de {era_name} durant {generations} generacions.",
  "event_templates": {
    "rare_event": {
      "event_id": {
        "option_id": "Plantilla narrativa: {dynasty_name} va {verb} davant {situation}."
      }
    },
    "branch_tech_discovered": {
      "branch_tech_id": "Plantilla: El llinatge va descobrir {tech_name}."
    },
    "title_unlocked": {
      "title_id": "El llinatge va ser reconegut com {title_name}."
    }
  },
  "era_closing_template": "Amb {era_score} punts, {title_name} va ser el llegat d'aquesta era.",
  "dominant_branch_template": "El camí del {branch_name} va definir aquesta generació."
}
```

Les plantilles usen variables entre `{}` que el motor substitueix en
generar la crònica. El contingut de les plantilles és era-específic i
pot ser narrativament ric sense tocar codi.

### 3.5 Format de la Crònica

La crònica d'era és un document curt (5–10 frases) que inclou:
1. **Intro d'era**: generació, era, nom del llinatge.
2. **Branca dominant**: el camí que ha definit l'era.
3. **Fets clau** (cronològics): events rars, descobriments, títols. Màxim 5.
4. **Tancament**: score, títol de l'era.

La crònica de partida completa és la concatenació de les cròniques de cada era.

**Exportació**: la crònica completa s'exporta com a text pla o imatge (format
decidit a `tech-architecture.md`).

### 3.6 Genealogia

El joc manté un arbre genealògic de tots els personatges jugats en la partida.
Cada node inclou: nom, era, branca dominant, durada de vida, i un indicador
visual de com ha anat (score de la seva vida en relació a l'era).

L'arbre és navegable a la UI (veure `ux-design` per a la pantalla de genealogia).

---

## 4. Fórmules

### Aprenentatge Heretat

```
// En successió generacional (dins era):
child_knowledge = [k for k in parent_knowledge
                   if random() < KNOWLEDGE_INHERITANCE_RATE]
```

### Recurs Heretat

```
child_resources = floor(parent_resources × RESOURCE_INHERITANCE_RATE)
```

### Característiques del Fill

```
// Cada característica del pare té probabilitat d'heretar-se:
inherited = [c for c in parent_characteristics if random() < c.inheritance_chance]
// Més una característica nova per atzar:
new_char = random_from(era.characteristic_pool, excluding=inherited)
child_characteristics = inherited + [new_char]   // màxim 2
```

---

## 5. Casos Extrems

- **Successor sense destreses** (pare sense destreses i fill amb herència 0):
  el fill comença sense destreses. No és un error. Cal assegurar que el joc
  sigui jugable sense elles.

- **Crònica buida** (cap `chronicle_event` registrat): s'usa la plantilla
  `era_intro_template` + `era_closing_template` com a mínim. Sempre hi ha
  alguna cosa.

- **Múltiples hereus** (el jugador tria entre fills): tots els fills generats
  tenena les mateixes regles d'herència aplicades en néixer. El jugador tria
  qui continua; els altres fills no escollits quedan com a "no jugats" en la
  genealogia.

- **Personatge que mor sense fills directes**: no és game over automàtic.
  El jugador pot continuar amb qualsevol altre membre viu de l'arbre
  genealògic (germà, cosí, nebod...). El game over es produeix únicament
  quan tot l'arbre genealògic queda sense membres vius.

- **Tot l'arbre genealògic extinct**: game over. La crònica es tanca amb
  la plantilla de final de llinatge. Si la transició d'era estava pendent,
  es processa igualment (puntuació d'era + tancament de crònica) abans
  de mostrar la pantalla de game over.

- **Aprenentatge heretat que no existeix a la nova era**: l'aprenentatge
  queda al registre del personatge però no té efectes de joc. El motor
  l'ignora en calcular bonificacions si l'ID no existeix a l'era actual.

---

## 6. Dependències

| Sistema | Relació |
|---|---|
| `branch-system.md` | Herència d'inclinació i regles de transició d'era. |
| `era-system.md` | `starting_conditions` en successió i transició d'era. |
| `event-system.md` | `chronicle_events` es pobla amb events rars i `narrative_tag`. |
| `scoring-system.md` | Score i títols apareixen a la crònica. |
| `badge-system.md` | Alguns badges es desbloquegen per condicions de la genealogia. |

---

## 7. Tuning Knobs

| Knob | Default | Rang segur | Efecte |
|---|---|---|---|
| `KNOWLEDGE_INHERITANCE_RATE` | 0.70 | 0.40–0.90 | % d'aprenentatges transmesos per generació. |
| `RESOURCE_INHERITANCE_RATE` | 0.50 | 0.00–0.80 | % de recursos transmesos en successió. **Prototip usa 0.00** (C3-06, 2026-05-30). |
| `REPUTATION_INHERITANCE_RATE` | 0.85 | 0.60–1.00 | % de reputació mantinguda entre generacions dins era. |
| `REPUTATION_ERA_DECAY` | 0.70 | 0.50–0.90 | % de reputació mantinguda en transició d'era. |
| `MAX_CHRONICLE_EVENTS` | 5 | 3–8 | Màxim d'events que apareixen a la crònica d'era. |
| `MAX_CHILDREN` | Per era (era.json) | 1–6 | Màxim de fills que pot tenir un personatge. |

---

## 8. Criteris d'Acceptació

- [ ] Un fill heretat comença amb la inclinació del pare aplicant
      `BRANCH_INHERITANCE_RATE` (± 5% de tolerància)
- [ ] Les accions comprades i les tecnologies de branca descobertes
      estan disponibles per al fill sense cap acció addicional del jugador
- [ ] La crònica d'una era conté com a mínim un event rar (si s'ha trigat)
      i el títol obtingut (si n'hi ha)
- [ ] Dues partides amb decisions molt diferents generen cròniques
      clarament diferents
- [ ] La crònica és exportable com a text des de la pantalla de fi d'era
- [ ] L'arbre genealògic mostra correctament 3 generacions amb les dades
      bàsiques de cada personatge
