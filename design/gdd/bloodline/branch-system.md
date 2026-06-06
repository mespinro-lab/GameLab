> ⚠️ OBSOLET (2026-06-06) — Font de veritat: `prototypes/bloodline/data.js`. Reescriure quan el prototip passi a producció.

# Life Tycoon 2 — Branch System

**Depèn de**: `_overview.md`, `era-system.md`
**Usat per**: `action-economy.md`, `event-system.md`, `scoring-system.md`, `lineage-chronicle.md`

> **Revisió major (2026-05-26)**: el sistema de branques ha estat redissenyat.
> Les inclinacions son ara eixos globals persistents entre eres. Les branques
> son etiquetes era-específiques sobre zones de l'espai d'inclinació.
> Eliminat el `branch_transition_map` (ja no necessari).

---

## 1. Overview

La inclinació és el cor del sistema de branques. Quatre eixos globals i
persistents [-1, +1] descriuen el perfil del llinatge al llarg de tota la
partida. Les branques son etiquetes narratives que el motor assigna quan els
valors d'inclinació cauen dins d'una zona definida a cada era. La mateixa
inclinació pot tenir noms de branca molt diferents a eres distintes.

Les accions empenten els eixos gradualment. Com més profunda és la inclinació
en una direcció, més inèrcia té el canvi — però mai és irreversible. El
jugador pot reconduir un llinatge guerrer cap a una orientació científica amb
prou temps i accions coherents.

---

## 2. Player Fantasy (d'aquest sistema)

*"El meu llinatge porta el pes de generacions de guerrers. Però ara, en
l'era industrial, estoc prenent decisions que l'empenyen cap a la ciència.
Veig com les accions guerreres s'apaguen d'una a una i noves accions
científiques van sorgint. No és ràpid. Però és el meu camí."*

El jugador ha de sentir que la inclinació és una força real i persistent,
no un número abstracte. Ha de veure-la reflectida en quines accions té
disponibles i com van canviant mentre pren decisions.

---

## 3. Regles Detallades

### 3.1 Els Quatre Eixos d'Inclinació

Els eixos son globals — el mateix conjunt per a totes les eres. Els seus
valors persisteixen entre generacions i entre eres sense conversió.

| Eix | ID | Extrem -1 | Extrem +1 |
|---|---|---|---|
| Impuls | `impuls` | reflexiu · calculat · passiu | impulsiu · d'acció directa · agressiu |
| Intel·lecte | `intel·lecte` | intuïtiu · instintiu · pràctic | analític · científic · abstracte |
| Espiritualitat | `espiritualitat` | material · pragmàtic · terrenal | espiritual · místic · transcendent |
| Sociabilitat | `sociabilitat` | solitari · independent · introvertit | col·lectiu · líder social · extravertit |

El perfil d'inclinació és un vector de 4 valors:
```
inclinació = { impuls: 0.65, intel·lecte: -0.20, espiritualitat: -0.30, sociabilitat: 0.40 }
```

### 3.2 Inèrcia

Moure un eix és més costós com més extrem és el seu valor actual. Això
representa la profunditat acumulada del llinatge en una orientació.

```
delta_efectiu[a] = action.inclination_delta[a]
                   / (1 + |inclinació[a]| × INERTIA_FACTOR)

inclinació[a] = clamp(inclinació[a] + delta_efectiu[a], -1.0, 1.0)
```

**Efecte pràctic** (amb `INERTIA_FACTOR = 2.0`):

| Valor actual | Eficiència del canvi |
|---|---|
| 0.0 (neutre) | 100% |
| 0.5 | 67% |
| 0.8 | 45% |
| 0.95 | 34% |

Un llinatge molt marcat en una direcció necessita moltes accions coherents
per reconduir-se, però no és mai impossible.

### 3.3 Herència d'Inclinació entre Generacions

En la successió (fill succeeix pare, mateixa era):
```
inclinació_fill[a] = inclinació_pare[a] × BRANCH_INHERITANCE_RATE
                     + inclinació_fill_base[a]
```

`inclinació_fill_base[a]` és la contribució inicial de les destreses i
característiques del fill (valors petits, definits als fitxers de destresa).

En la transició d'era, la inclinació es transfereix directament sense
conversió. Les branques que en derivin en la nova era son les de la nova era.

### 3.4 Schema JSON — Branca

Una branca és una zona de l'espai d'inclinació amb un nom narratiu.
Era-específica.

**Fitxer**: `data/eras/[era_id]/branches/[branch_id].json`

```json
{
  "id": "branch_id",
  "era_id": "era_id",
  "name": "Nom narratiu de la branca",
  "description": "Una frase que descriu l'estil.",
  "icon": "icon_key",
  "color_hex": "#RRGGBB",

  "inclination_conditions": {
    "operator": "AND",
    "conditions": [
      { "axis": "impuls",      "min": 0.30 },
      { "axis": "sociabilitat","max": 0.20 }
    ]
  }
}
```

**Operadors**: `AND` (totes les condicions), `OR` (almenys una).

**Branques híbrides**: es defineixen amb condicions sobre múltiples eixos.
No hi ha límit en el nombre de condicions. Qualsevol combinació d'eixos
és vàlida.

*[exemple il·lustratiu]*
> Una branca "Inquisidor" podria requerir `impuls ≥ 0.4` AND
> `espiritualitat ≥ 0.4`. Un llinatge amb ambdós eixos alts entra en
> aquesta zona híbrida.

**Branques simultànies**: el jugador pot estar en múltiples branques a la
vegada si el seu perfil d'inclinació compleix les condicions de totes elles.
No hi ha exclusivitat.

### 3.5 Schema JSON — Tecnologia de Branca (Habilitat)

Una tecnologia de branca és la porta d'entrada a les accions especialitzades.
Requereix una tecnologia universal com a prerequisit **i** que el perfil
d'inclinació satisfaci les seves condicions. Quan el jugador la desbloqueja,
les accions associades apareixen a les seves zones com a comprables.

La mateixa tecnologia universal pot derivar múltiples tecnologies de branca
amb condicions d'inclinació distintes. Dos jugadors que descobreixen la
mateixa tecnologia universal veuran habilitats —i per tant accions— diferents
depenent d'on es troben en l'espai d'inclinació.

**Fitxer**: `data/eras/[era_id]/branch_techs/[tech_id].json`

```json
{
  "id": "branch_tech_id",
  "era_id": "era_id",
  "name": "Nom narratiu (player-facing: l'habilitat descoberta)",
  "description": "Efecte en una frase.",
  "icon": "icon_key",
  "universal_prereq": "universal_tech_id",

  "inclination_conditions": {
    "operator": "AND",
    "conditions": [
      { "axis": "impuls", "min": 0.25 }
    ]
  },

  "is_hidden": false,

  "effects": {
    "unlocks_action_ids": ["action_id_1", "action_id_2"],
    "action_modifiers": [],
    "indicator_modifiers": [],
    "unlocks_event_pool_ids": []
  }
}
```

**`unlocks_action_ids`**: llista de les accions que es fan comprables en
desbloquejar aquesta habilitat. Les accions referenciades han de tenir
`is_hidden: true` i `discovery_condition.branch_tech_id` apuntant a
aquest `branch_tech_id`.

Una tecnologia de branca accessible per a perfils híbrids (condicions sobre
múltiples eixos) actua com a **pont**: el jugador en zona híbrida l'obté
naturalment i accedeix a les accions de les dues orientacions.

### 3.5.1 Vies de Descoberta d'una Tecnologia de Branca

Una branch tech és **elegible** quan:
- El seu `universal_prereq` ja ha estat descobert pel jugador.
- L'`inclination_conditions` actual del jugador es satisfà.
- Encara no ha estat desbloquejada en aquesta generació.

Dues vies per desbloquejar-la:

**Via 1 — Acció de Descoberta** (activa, era-específica)

Cada era té exactament una acció de descoberta (`is_discovery_action: true`).
Quan el jugador l'executa:
1. S'avaluen totes les branch techs elegibles.
2. El jugador **tria** quina tech descobrir entre les elegibles (UI: un botó per opció).
   - Si només n'hi ha una d'elegible, es descobreix automàticament sense selecció.
   - Si cap és elegible, l'execució consumeix el cicle sense descoberta.

> **Nota de disseny (2026-05-30)**: el disseny original especificava selecció automàtica per maduresa màxima. Canvi al prototip (#29b S2-02): el jugador tria per evitar el biaix sistemàtic de l'algoritme de maduresa i donar agència explícita al jugador.

**Visibilitat de l'acció de descoberta**: OCULTA quan no hi ha cap branch tech
elegible. Visible quan n'hi ha almenys una. Quan passa a visible, la UI mostra
una notificació narrativa era-específica (ex.: "Hi ha estrangers al poblat que
expliquen tècniques noves"). La notificació desapareix quan totes les branch
techs elegibles han estat descobertes.

**Via 2 — Event de Descoberta** (passiva, narrativa)

Alguns events dels pools d'acció son `is_discovery_event: true`. Apareixen al
pool ÚNICAMENT quan el jugador és elegible per a la branch tech que referencien
(`discovery_branch_tech_id`). Son d'un sol ús: s'exclouen del pool en quant la
branch tech queda descoberta. El jugador no sap que l'event és especial —
apareix com una variant narrativa d'un event ordinari.

Un event de descoberta sempre té **almenys dues opcions**:
- Una opció activa (tria conscient del jugador, sovint amb un risc menor).
- Una opció passiva (sense descoberta, sense risc).

La descoberta no és automàtica: el jugador ha de triar l'opció activa.

### 3.6 Accions i Visibilitat per Inclinació

Les accions declaren `inclination_requirements`: el rang d'eixos dins del
qual l'acció és visible i executable. Quan la inclinació surt del rang, l'acció
passa per tres estats:

| Estat | Condició | Presentació |
|---|---|---|
| **Activa** | Inclinació dins del rang | Visible, executable |
| **Atenuada** (fade) | Inclinació fora del rang en ≤ `FADE_MARGIN` | Visible, grisa, no executable |
| **Oculta** | Inclinació fora del rang en > `FADE_MARGIN` | No visible |

**Les accions comprades no es perden**: la compra és permanent. Si la
inclinació torna al rang, l'acció es reactiva automàticament. El cost de
virar de branca és que les accions de la branca anterior van quedant
inactives i deixen de generar recursos.

*[exemple il·lustratiu]*
> Un jugador que ha comprat 5 accions guerreres i comença a virar cap al
> comerç veu com les accions guerreres s'apaguen una a una. Pot mantenir
> un mínim d'`impuls` per conservar-ne algunes actives, o pot deixar que
> s'apaguin totes i concentrar els recursos en les noves accions comercials.

### 3.7 Accions i Desplaçament d'Inclinació

Cada acció declara `inclination_deltas`: quant empenta cada eix en executar-la.
Els valors poden ser positius (empenta cap a +1) o negatius (empenta cap a -1).

```json
"inclination_deltas": {
  "impuls":       +0.04,
  "intel·lecte":  -0.01,
  "espiritualitat": 0.00,
  "sociabilitat": +0.02
}
```

Una acció pot desplaçar múltiples eixos simultàniament. Una acció "neutral"
(base de supervivència, sense empenta clara) té deltes petits i distribuïts.
Una acció especialitzada té un delta gran en un o dos eixos concrets.

---

## 4. Fórmules

### Actualització d'Inclinació

```
per cada eix a:
    delta_efectiu = action.inclination_deltas[a]
                    / (1 + |inclinació[a]| × INERTIA_FACTOR)
    inclinació[a] = clamp(inclinació[a] + delta_efectiu, -1.0, 1.0)
```

### Branca Activa

```
is_branch_active(branch) = evaluate(branch.inclination_conditions, inclinació)
```

### Tecnologia de Branca Elegible

```
is_eligible(tech) =
    tech.universal_prereq ∈ player.universal_techs
    AND evaluate(tech.inclination_conditions, inclinació)
    AND tech.id ∉ player.branch_techs_discovered

on_unlock(tech):
    player.branch_techs_discovered.add(tech.id)
    apply(tech.effects.indicator_modifiers)
    apply(tech.effects.action_modifiers)
    for action_id in tech.effects.unlocks_action_ids:
        player.discovered_actions.add(action_id)
    for pool_id in tech.effects.unlocks_event_pool_ids:
        player.available_event_pools.add(pool_id)
```

### Maduresa d'una Branch Tech

La maduresa quantifica quant *supera* el jugador els requisits mínims d'una
branch tech elegible. S'usa per triar quina desbloquejar via l'acció de descoberta.

```
maduresa(tech):
    score = 0
    per cada condició c en tech.inclination_conditions.conditions:
        val = inclinació[c.axis]
        si c.min definit: score += max(0, val − c.min)
        si c.max definit: score += max(0, c.max − val)
    return score

tech_a_desbloquejar =
    argmax(maduresa(t) per t en eligible_branch_techs)
```

### Visibilitat d'Acció

```
per cada eix a amb requirement action.inclination_requirements[a]:
    dins_rang     = inclinació[a] ∈ [req.min, req.max]
    zona_fade     = distància_al_rang(inclinació[a], req) ≤ FADE_MARGIN
    fora_de_rang  = distància_al_rang > FADE_MARGIN

estat_acció = ACTIVA  si tots els eixos estan dins_rang
            = ATENUADA si algun eix en zona_fade i cap fora_de_rang
            = OCULTA  si algun eix fora_de_rang
```

### Herència Generacional

```
inclinació_fill[a] = inclinació_pare[a] × BRANCH_INHERITANCE_RATE
                     + destresa_contribució[a]
```

---

## 5. Casos Extrems

- **Inclinació a 0 en tots els eixos** (inici de partida): el jugador veu les
  accions base de totes les zones, cap branca activa, cap tecnologia de branca
  desbloquejable. És l'estat inicial normal.

- **Múltiples branques actives simultàniament**: completament vàlid. El perfil
  híbrid és una de les experiències de joc previstes. El motor no força a
  escollir-ne una.

- **Acció sense `inclination_requirements`**: visible sempre, sigui quina sigui
  la inclinació. Reservat per a accions base de supervivència.

- **Tecnologia de branca desbloquejada però branca "inactiva"**: pot passar si
  les condicions de la branch_tech son més laxes que les de la branca. Vàlid
  per disseny — una tec. pot ser accessible a perfils de transició.

- **Inclinació molt alta en un eix, acció que empenta en sentit contrari**:
  la inèrcia fa que el canvi sigui molt lent però sempre possible. No hi ha
  cap bloqueig permanent.

- **Herència d'inclinació molt extrema** (pare a 0.95 en un eix): el fill
  comença a `0.95 × BRANCH_INHERITANCE_RATE`, que pot ser ~0.62. La inèrcia
  del fill és alta però menor que la del pare — natural i esperat.

---

## 6. Dependències

| Sistema | Relació |
|---|---|
| `era-system.md` | Cada era defineix les seves branques (zones sobre els mateixos eixos globals) |
| `action-economy.md` | Les accions declaren `inclination_deltas` i `inclination_requirements` |
| `event-system.md` | Les opcions d'events poden tenir `inclination_deltas` |
| `lineage-chronicle.md` | La inclinació s'hereta entre generacions i eres |
| `scoring-system.md` | Les branques actives i tecns. descobertes influeixen el score |
| `badge-system.md` | Badges per perfils d'inclinació específics o híbrids |

---

## 7. Tuning Knobs

| Knob | Default | Rang segur | Efecte |
|---|---|---|---|
| `INERTIA_FACTOR` | 2.0 | 0.5–4.0 | Resistència al canvi d'inclinació. Alt = canvis molt lents en zones extremes. |
| `BRANCH_INHERITANCE_RATE` | 0.65 | 0.40–0.85 | Fracció d'inclinació heretada entre generacions. |
| `FADE_MARGIN` | 0.10 | 0.05–0.20 | Zona de "fade" on l'acció es mostra grisa abans de desaparèixer. |

---

## 8. Criteris d'Acceptació

- [ ] Executar 10 accions de perfil alt en `impuls` mou l'eix visiblement
      cap a +1, però la velocitat decreix a mesura que s'aproxima a l'extrem
- [ ] Un llinatge a `impuls: 0.80` pot reduir-lo a 0.00 amb accions reflexives,
      però requereix notablement més accions que des de 0.40
- [ ] Un perfil híbrid (`impuls: 0.5`, `sociabilitat: 0.5`) activa
      simultàniament les branques "guerrer" i "comerciant" si ambdues
      estan definides amb llindars inferiors als valors actuals
- [ ] Una acció comprada que queda fora del rang d'inclinació es mostra
      grisa (fade) i després desapareix; es reactiva si la inclinació torna
- [ ] En la transició d'era, els 4 eixos d'inclinació es transfereixen sense
      conversió i les branques de la nova era emergeixen dels mateixos valors
- [ ] Afegir una branca nova a una era (fitxer JSON amb condicions) és
      reconegut automàticament sense canvis de codi
