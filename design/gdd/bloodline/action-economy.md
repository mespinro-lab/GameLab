# Bloodline — Action Economy

> **ACTUALITZAT PARCIALMENT 2026-06-06** — §3.1 (schema JSON) i §3.3 (execució) reflecteixen el disseny conceptual original.
> El sistema de material ha canviat significativament: veure §NOTA IMPLEMENTACIÓ al final.

---

**Depèn de**: `_overview.md`, `era-system.md`, `branch-system.md`
**Usat per**: `event-system.md`, `scoring-system.md`

---

## 1. Overview

Les accions son la unitat d'interacció principal del jugador cada cicle. Viuen
dins de zones del mapa, es compren amb recursos i queden disponibles
permanentment un cop adquirides. Cada acció empenta els eixos d'inclinació
globals, genera recursos i indicadors, i pot desencadenar events.

**La gran majoria d'accions s'obtenen a través de les tecnologies de branca
(habilitats)**. Una tecnologia universal que apareix al cicle N posa a
l'abast del jugador les tecnologies de branca que coincideixen amb la seva
inclinació actual. Cadascuna d'aquestes habilitats, en ser desbloquejada,
revela les accions que li corresponen i les fa comprables. Dos jugadors amb
la mateixa tecnologia universal però inclinacions diferents descobriran
habilitats —i per tant accions— completament distintes.

Les accions base de supervivència (visibles des del principi) son l'excepció:
no requereixen habilitat, cobreixen les necessitats mínimes i empenten els
eixos molt lleugerament, donant al jugador una inclinació inicial que
determinarà quines habilitats pot desbloquejar primer.

Dues accions amb reward similar no son duplicats — reflecteixen orientacions
d'inclinació i habilitats de branca diferents. La tria entre elles és la
decisió que empeny la partida cap a una inclinació o una altra.

---

## 2. Player Fantasy (d'aquest sistema)

*"Tinc menys accions disponibles del que voldria — he de triar on invertir
els recursos. Quan en desbloquejo una de nova, el primer cicle que la provo
és un moment d'expectativa. I de vegades em sorprèn."*

El jugador ha de sentir que cada acció nova és una inversió estratègica, no
una col·lecció automàtica. L'escassetat d'accions disponibles en qualsevol
moment és el que fa que cada cicle tingui decisió real.

---

## 3. Regles Detallades

### 3.1 Schema JSON — Acció

Fitxer de referència: `data/eras/[era_id]/actions/[action_id].json`

```json
{
  "id": "action_id",
  "era_id": "era_id",
  "zone_id": "zone_id",
  "name": "Nom narratiu",
  "description": "Una frase que descriu l'acció.",
  "icon": "icon_key",
  "is_hidden": false,

  "purchase_cost": {
    "primary": 5,
    "secondary": 0
  },

  "inclination_deltas": {
    "impuls":         +0.05,
    "intel·lecte":    -0.01,
    "espiritualitat":  0.00,
    "sociabilitat":   +0.02
  },

  "inclination_requirements": {
    "impuls": { "min": 0.10, "max": 1.00 }
  },

  "base_output": {
    "indicators": {
      "food":     { "min": 5,  "max": 12 },
      "health":   { "min": -3, "max": 0  },
      "happiness":{ "min": 0,  "max": 2  },
      "security": { "min": 0,  "max": 0  },
      "social":   { "min": 0,  "max": 0  }
    },
    "resources": {
      "primary": { "min": 1, "max": 4 }
    }
  },

  "event_pool_id": "event_pool_id",

  "is_discovery_action": false,

  "discovery_condition": { "type": "branch_tech", "branch_tech_id": "branch_tech_id" },

  "upgrade_to": null,
  "upgrade_cost": null,
  "upgrade_condition": null
}
```

| Camp | Tipus | Descripció |
|---|---|---|
| `zone_id` | string | Zona del mapa on viu aquesta acció. |
| `is_hidden` | bool | `true` = no visible fins que es descobreix. |
| `purchase_cost` | object | Recursos necessaris per comprar l'acció. Un cop comprada, queda per sempre. |
| `inclination_deltas` | object | Quant empenta cada eix global en executar l'acció. Positiu = cap a +1, negatiu = cap a -1. Eixos absents = delta 0. |
| `inclination_requirements` | object | Rang d'eixos dins del qual l'acció és visible i executable. Eixos absents = sense restricció. |
| `base_output` | object | Rang de sortida base (indicadors i recursos). El resultat real s'obté per `lerp` dins del rang. |
| `event_pool_id` | string\|null | Pool d'events que pot desencadenar aquesta acció. |
| `is_discovery_action` | bool | `true` = acció era-específica de descoberta de branch techs. Vegeu §3.2.1. |
| `discovery_condition` | object\|null | Com es descobreix si `is_hidden: true`. |
| `upgrade_to` | string\|null | ID de l'acció que la substitueix quan es fa upgrade. |
| `upgrade_cost` | object\|null | Recursos necessaris per fer l'upgrade. |
| `upgrade_condition` | object\|null | Condicions per poder fer l'upgrade. |

### 3.2 Descoberta i Compra d'Accions

Les accions es **compren** amb recursos. La compra és permanent: un cop
comprada, el jugador la té per a sempre (generació rere generació, mentre
estigui a la mateixa era).

**Dos tipus d'accions pel que fa a la descoberta**:

**1. Accions base** (`is_hidden: false`, sense `discovery_condition`)
Visibles a la zona des que la zona es descobreix. Son les accions de
supervivència disponibles per a tothom des del principi. En nombre reduït;
no requereixen cap habilitat.

**2. Accions d'habilitat** (`is_hidden: true`, `discovery_condition: {type: "branch_tech", ...}`)
No apareixen a la UI fins que el jugador desbloqueja la tecnologia de branca
especificada. Quan la desbloqueja, l'acció apareix a la seva zona com a
comprable. Constitueixen el gruix de les accions especialitzades del joc.

El flux complet de descoberta:
```
Tecnologia Universal apareix al cicle N
         ↓
Tecnologies de branca accessibles (prerequisit complert + inclinació coincident)
apareixen com a desbloquejables a la UI → "Noves habilitats disponibles"
         ↓
Jugador desbloqueja una tecnologia de branca (paga cost si n'hi ha)
         ↓
Les accions associades a aquesta branch_tech apareixen a les seves zones
         ↓
Jugador pot comprar les accions noves amb recursos
```

**Altres tipus de `discovery_condition`** (menys freqüents, per a casos especials):

| Tipus | Descripció |
|---|---|
| `branch_tech` | **(principal)** Es descobreix en desbloquejar la tecnologia de branca. |
| `action_executions` | Es descobreix quan una acció concreta s'ha executat N vegades. |
| `event_trigger` | Es descobreix quan s'ha trigat un event concret. |
| `destresa` | Es descobreix quan el personatge té una destresa específica. |

### 3.2.1 Acció de Descoberta de Tecnologia de Branca

Cada era té **exactament una** acció amb `is_discovery_action: true`. És
l'eina activa del jugador per desbloquejar branch techs.

**Comportament**:
1. En executar-la, el motor avalua les branch techs elegibles (prereq descobert
   + inclinació satisfeta + no desbloquejada).
2. Desbloqueja la que té la **maduresa** més alta (veure `branch-system.md §4`).
3. Si no n'hi ha cap d'elegible, consumeix el cicle sense efecte.

**Visibilitat especial**: ignorant les regles d'`inclination_requirements`,
l'acció de descoberta és `OCULTA` quan no hi ha cap branch tech elegible, i
`ACTIVA` quan n'hi ha almenys una. No té `inclination_requirements` pròpis.

**Notificació de disponibilitat**: quan l'acció passa de OCULTA a ACTIVA, la
UI mostra un indicador narratiu era-específic (un text curt al panell de
l'esquerra, ex.: "Hi ha estrangers al poblat que expliquen tècniques noves").
Quan l'acció torna a OCULTA (totes les elegibles descobertes), la notificació
desapareix.

Exemples d'acció de descoberta per era:

| Era | Nom | Narrativa |
|---|---|---|
| Paleolític | Escoltar els Estrangers | Grups forans visiten el campament |
| Neolític | Observar el Veí | Tribus veïnes amb noves pràctiques |
| Modern | Llegir la Premsa | Articles sobre noves tendències |
| Futur | Cercar a la Xarxa | Comunitats online compartint tècniques |

### 3.3 Execució d'Accions

Un cicle = el jugador executa **una acció** de la zona activa. L'output es
calcula com:

```
valor_output[key] = lerp(base_output[key].min, base_output[key].max, roll)
```

on `roll` és un valor [0.0, 1.0] que combina un component aleatori amb
modificadors de destreses, característiques i tecnologies de branca actives.

El resultat base es modifica addicionalment pels events encadenats (veure
`event-system.md`).

### 3.4 Upgrades

Una acció pot tenir un upgrade: una versió millorada que la substitueix quan
es compleixen condicions.

```json
{
  "upgrade_to": "action_upgraded_id",
  "upgrade_cost": { "primary": 10 },
  "upgrade_condition": {
    "requires_universal_tech_id": "universal_tech_id",
    "requires_branch_tech_id": null,
    "requires_min_executions": 5
  }
}
```

Quan les condicions es compleixen, a la UI apareix l'opció d'upgrade al
costat de l'acció original. El jugador l'accepta pagant el `upgrade_cost`.
En fer l'upgrade:
- L'acció original desapareix de la zona.
- L'acció upgraded apareix al seu lloc (mateixa zona, nou ID, nous paràmetres).
- L'upgrade és permanent per al llinatge.

**Una acció pot tenir una cadena d'upgrades**: A → B → C, on B té al seu torn
un `upgrade_to: C`. El jugador sempre veu la versió més avançada que ha
aconseguit.

### 3.5 Accions Bifurcades (Mateixa necessitat, camí diferent)

Dues accions que satisfan la mateixa necessitat base (ex: les dues generen
menjar) no son duplicats. Cada una té `inclination_deltas` i
`inclination_requirements` clarament diferenciats. Tenir les dues disponibles
i executar-ne una o l'altra empeny la inclinació en direccions oposades; a
mesura que la inclinació deriva, una de les dues pot entrar en estat atenuat
o desaparèixer, forçant una decisió real.

El dissenyador ha d'assegurar-se que, per a cada necessitat base (indicador),
hi hagi almenys dues accions amb orientacions d'inclinació clarament
diferenciades. Això garanteix que el jugador sempre tingui decisions de
bifurcació reals.

*[exemple il·lustratiu]*
> Dues accions amb output similar, una amb `inclination_deltas.impuls: +0.06`
> (l'orienta cap a acció directa) i l'altra amb `inclination_deltas.intel·lecte: +0.05`
> (l'orienta cap a analítica). El jugador tria cada cicle; la tria acumula
> inclinació diferent i pot acabar fent desaparèixer la opció alternativa.

### 3.6 Visibilitat d'Accions per Inclinació

Les accions declaren `inclination_requirements`: el rang d'eixos dins del
qual son visibles i executables. Quan la inclinació surt del rang, l'acció
passa per tres estats (veure `branch-system.md` per a la fórmula completa):

| Estat | Condició | Presentació |
|---|---|---|
| **Activa** | Inclinació dins del rang | Visible, executable |
| **Atenuada** | Inclinació fora del rang en ≤ `FADE_MARGIN` | Visible, grisa, no executable |
| **Oculta** | Inclinació fora del rang en > `FADE_MARGIN` | No visible |

**Una acció comprada no es perd mai**: si la inclinació torna al rang,
l'acció es reactiva automàticament. El cost real de canviar d'orientació
és que les accions antigues van quedant inactives i deixant de generar recursos.

*[exemple il·lustratiu]*
> Un jugador amb 4 accions d'`impuls` alt que vira cap a `intel·lecte` veu
> com les accions d'`impuls` s'atenuen una a una. Pot mantenir un mínim
> d'`impuls` per conservar-ne algunes actives, o deixar que totes s'apaguin.

### 3.7 Modificadors sobre Outputs

Les tecnologies de branca actives poden modificar els outputs de certes
accions. El modificador s'aplica com a multiplicador sobre el rang
`base_output`:

```json
// En branch_tech:
"effects": {
  "action_modifiers": [
    {
      "action_id": "action_id",
      "output_multiplier": 1.30
    }
  ]
}
```

El modificador s'aplica **abans** dels events encadenats, de manera que els
events treballen sobre el valor ja modificat.

---

## 4. Fórmules

### Roll d'Execució

```
base_roll = random(0.0, 1.0)

destresa_bonus = Σ (char.destresa[d].branch_affinity_with_action × DESTRESA_WEIGHT)

roll = clamp(base_roll + destresa_bonus, 0.0, 1.0)
```

### Output Base

```
output[key] = lerp(action.base_output[key].min,
                   action.base_output[key].max,
                   roll)
```

### Modificador de Tecnologia de Branca

```
modified_output[key] = output[key]
                       × Π branch_tech_modifier.output_multiplier
                         ∀ active_branch_tech with modifier for this action
```

### Output Final (post-events)

```
final_output[key] = modified_output[key] + Σ event_chain.effect[key]
```

(El sumatori d'events pot ser negatiu si l'event perjudica.)

---

## 5. Casos Extrems

- **Acció comprada però zona no descoberta**: no pot passar per disseny —
  les accions d'una zona no son visibles fins que la zona es descobreix.
  El motor ha de validar coherència en carregar.

- **Upgrade disponible però sense recursos per pagar-lo**: l'opció d'upgrade
  es mostra però desactivada. El jugador ho veu i sap que li falten recursos.

- **Acció upgraded comprada directament** (via DLC o bonus inicial):
  l'original no cal que hagi estat comprada. L'original no apareix si ja
  tens la versió upgraded.

- **Dos upgrades disponibles simultàniament** (si el dissenyador ho permet):
  el jugador veu les dues opcions. Ha de triar o esperar. El motor no força
  ordre d'upgrade.

- **Acció oculta amb `discovery_condition` de tipus `event_trigger`**:
  si l'event es pot trigat moltes vegades, cal assegurar que la condició
  marca "ja descobert" en el primer trigger. No ha de re-descobrir-se.

- **`inclination_deltas` tots a zero** (o camp absent): acció neutral que no
  empenta cap eix. Vàlid per a accions de "manteniment" base, sense
  orientació clara. Ha de ser intencionat i documentat. Combinat amb
  `inclination_requirements` absent = acció visible sempre, sigui quina sigui la inclinació.

---

## 6. Dependències

| Sistema | Relació |
|---|---|
| `era-system.md` | Les zones de l'era contenen les accions. El cicle de l'era afecta disponibilitat d'upgrades. |
| `branch-system.md` | `inclination_deltas` de les accions empenten els eixos globals; `inclination_requirements` determinen la visibilitat; les tecns. de branca modifiquen outputs. |
| `event-system.md` | Cada acció té un `event_pool_id`; els events modifiquen el resultat final. |
| `lineage-chronicle.md` | Les accions més executades apareixen a la crònica. |
| `scoring-system.md` | L'eficiència s'avalua en part per com s'usen els recursos i accions. |

---

## 7. Tuning Knobs

| Knob | Default | Rang segur | Efecte |
|---|---|---|---|
| `DESTRESA_WEIGHT` | 0.10 | 0.05–0.25 | Quant afecten les destreses al roll d'execució. |
| `ACTION_BASE_ROLL_VARIANCE` | 0.30 | 0.10–0.50 | Amplitud de la variació aleatòria del roll. Alt = resultats més impredictibles. |
| `UPGRADE_MIN_EXECUTIONS_DEFAULT` | 5 | 2–15 | Execucions mínimes per poder fer upgrade (si no especificat per acció). |

---

## 8. Criteris d'Acceptació

- [ ] Una acció comprada queda disponible per a totes les generacions
      mentre estiguin a la mateixa era
- [ ] Dues accions amb el mateix indicador objectiu però `inclination_deltas`
      oposats empenten els eixos en direccions clarament diferenciades
- [ ] Un upgrade apareix a la UI quan es compleixen les `upgrade_condition`,
      desactivat si no hi ha prou recursos, actiu si n'hi ha
- [ ] Una acció `is_hidden: true` no apareix a cap zona fins que la
      `discovery_condition` es compleix
- [ ] Un modificador d'una tecnologia de branca incrementa visiblement
      l'output d'una acció quan la tecnologia de branca és activa

---

## NOTA D'IMPLEMENTACIÓ — Sistema Material (2026-06-06)

**Canvi decisiu respecte al disseny original:**

El sistema de `resources.primary` del schema JSON conceptual **no s'ha implementat tal com estava dissenyat**. La decisió de disseny ha evolucionat:

### Material (🧠) és moneda universal, no output d'acció

- **Totes** les accions generen material, independentment del seu output primari.
- El rang per acció depèn de la seva intensitat física:
  - Alt (accions físiques): `material_min: 2, material_max: 4`
  - Mig (artesania, família): `material_min: 2, material_max: 3`
  - Baix (ritual, contemplació): `material_min: 1, material_max: 2`
- **Cap acció** té `output_resource: "material"` — el material no és el premi d'una acció específica.
- Material **persisteix entre generacions** (moneda del llinatge, no del personatge).

### Outputs primaris de les accions

Les accions es categoritzen per output primari:

| Tipus | Output primari | Exemples |
|-------|---------------|---------|
| Supervivència | `food` | espiar_ramat, recollectar_arrels, intercanviar_eines |
| Recuperació | `health` | cosir_pells, construir_refugi, curar_herbes |
| Progressió pura | cap output de recurs | tallar_pedra, faonar_eines, gravar_os, contemplació |

Les accions de "progressió pura" (artesania, contemplació) donen stat growth +
inclinació + material universal. No donen food/health.

### Diferenciació accions similars

Accions que satisfan la mateixa necessitat han de tenir un trade-off clar:
- `espiar_ramat`: food 3–8 + side_effect −5 health (risc de ferides)
- `recollectar_arrels`: food 1–3, sense risc

### Zona Llar

Nova zona que apareix quan el personatge troba parella. Conté:
- `tenir_fills` (risc basat en salut)
- `ensenyar_fill` (millora herència de skills)
