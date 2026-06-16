# Bloodline — Aprenentatge System

**Depèn de**: `_overview.md`, `branch-system.md`, `destresa-system.md`
**Usat per**: `action-economy.md`, `scoring-system.md`

---

## 1. Overview

Un aprenentatge és un bonus permanent adquirit durant la vida del personatge,
de natura diferent a la destresa (innat) i a l'habilitat (del llinatge).
L'aprenentatge representa el coneixement *après*, la saviesa *transmesa*, el
saber *cultivat*. Un personatge pot tenir fins a 2 aprenentatges:

1. **Ensenyat**: transmès explícitament pel predecessor via `act_ensenyar`
   ("Ensenyar el Fill"). Requereix que el predecessor hagi executat aquesta
   acció almenys un cop durant la seva vida i tingui almenys un aprenentatge.
2. **Descobert**: après durant la vida del personatge a través de la pràctica
   repetida d'accions relacionades (≥ `APRENENTATGE_THRESHOLD` usos + roll de
   probabilitat `discoveryChance`).

---

## 2. Player Fantasy

*"El meu pare em va ensenyar a llegir els núvols — una cosa que ell havia
après d'un vell que va passar pel campament quan era jove. Ara jo ho sé. I
potser algun dia podré ensenyar-ho al meu fill, si tinc temps."*

L'aprenentatge ha de sentir-se com una cadena: una saviesa que pot saltar de
generació en generació, però que no és garantida — cal l'acte conscient
d'ensenyar, i cal viure prou per aprendre.

---

## 3. Regles Detallades

### 3.1 Adquisició

| Via | Mecànica | Límit |
|---|---|---|
| **Ensenyat** | Predecessor executa `act_ensenyar` → fill rep 1 aprenentatge aleatori del predecessor en successió | 1 per personatge |
| **Descobert** | ≥ `APRENENTATGE_THRESHOLD` usos d'una `discovery_action_id` + roll de `discoveryChance` | 1 per personatge |

El límit total és **`APRENENTATGE_MAX = 2` aprenentatges per personatge**.

### 3.2 Herència

A diferència de les habilitats (100% heretades), els aprenentatges **no
s'hereten automàticament**. El fill rep l'aprenentatge ensenyat ÚNICAMENT si
el predecessor va executar `act_ensenyar` i tenia ≥ 1 aprenentatge. L'aprenentatge
descobert pel predecessor **no es transmet** — el fill haurà de descobrir el seu propi.

### 3.3 Efectes implementats

| id | Nom | Icon | Efecte |
|---|---|---|---|
| `apr_cures_basiques` | Cures Bàsiques | 🩹 | +2 aliment en `act_curar_herbes` |
| `apr_conservar_provisions` | Conservació | 🧂 | −0.5 aliment/torn en upkeep |
| `apr_orientacio` | Orientació | 🧭 | +1/+2 material en `act_explorar_voltants` |
| `apr_treball_pedra` | Treball de la Pedra | 🪨 | +2 material en `act_faonar_eines` |
| `apr_lectura_senyals` | Lectura de Senyals | 👣 | +1/+2 aliment en `act_espiar_ramat` |
| `apr_plantes_medicinals` | Plantes Medicinals | 🌿 | +1/+2 aliment en `act_recollectar_arrels` |
| `apr_veu_clan` | La Veu del Clan | 🗣️ | +1 material a totes les accions |

### 3.4 Distinció respecte a destresa i habilitat

| Concepte | Ve de | Pot perdre's | Passa al fill |
|---|---|---|---|
| **Habilitat** | Descoberta activa (inclinació) | Mai | Sempre (100%) |
| **Destresa** | Innat (nàixer) + pràctica | Mai (d'un personatge concret) | 1 passa al fill (pick aleatori) |
| **Aprenentatge** | Ensenyança explícita o descoberta | Mai (d'un personatge concret) | 1 pot passar si `act_ensenyar` executat |

---

## 4. Fórmules

### Descoberta durant la vida

```
per cada acció executada (executedActionId):
  per cada def in APRENENTATGE_DEFS:
    si character.aprenentatges.size >= APRENENTATGE_MAX → break
    si character.aprenentatges.has(def.id) → skip
    si executedActionId NOT in def.discovery_action_ids → skip
    si actionUseCounts[executedActionId] < APRENENTATGE_THRESHOLD → skip
    si random() >= def.discoveryChance → skip
    → character.aprenentatges.add(def.id)
```

### Transferència en successió

```
si predecessor.charState.ensenyat >= 1 AND predecessor.aprenentatges.size > 0:
    fill.aprenentatges.add(randomPick(predecessor.aprenentatges))
```

### Reducció d'upkeep alimentari

```
aprUpkeepReduction = sum(def.effect.value for def in APRENENTATGE_DEFS
                         if def.id in character.aprenentatges
                         and def.effect.type == 'food_upkeep_reduction')
totalUpkeep = max(0.5, FOOD_UPKEEP - foodUpkeepReduction - aprUpkeepReduction) + childCount
```

### Bonus d'output per acció

```
outMinBonus += sum(def.effect.output_min_bonus for def in APRENENTATGE_DEFS
                   if def.id in character.aprenentatges
                   and def.effect.type == 'bonus_action_output'
                   and def.effect.action_id == executedActionId)
outMaxBonus += (idem per output_max_bonus)
```

### Bonus de material global

```
aprMatBonus = sum(def.effect.value for def in APRENENTATGE_DEFS
                  if def.id in character.aprenentatges
                  and def.effect.type == 'material_bonus')
material += aprMatBonus
```

---

## 5. Casos Extrems

- **Predecessor no va ensenyar**: fill rep 0 aprenentatges ensenyats. Pot aprendre fins a 2 durant la vida.
- **Predecessor va ensenyar però tenia 0 aprenentatges**: `act_ensenyar` requereix `has_any_aprenentatge` → no es pot executar si no en tens cap.
- **Gen 1**: no té predecessor, comença amb 0 aprenentatges. Pot aprendre fins a 2 durant la vida.
- **2 aprenentatges assolits**: `checkAprenentagesAfterAction` deixa de comprovar un cop `aprenentatges.size >= APRENENTATGE_MAX`.
- **Aprenentatge que redueix upkeep per sota de 0.5**: el `max(0.5, ...)` garanteix un mínim d'upkeep base.

---

## 6. Dependències

| Sistema | Relació |
|---|---|
| `branch-system.md` | Aprenentatges son independents de branques però les accions de descoberta son les mateixes que les d'inclinació |
| `destresa-system.md` | Mecànica paral·lela de descoberta per pràctica; però destreses son innates, aprenentatges son apresos |
| `action-economy.md` | `act_ensenyar` és l'acció de transmissió; les `discovery_action_ids` son accions de l'era actual |

---

## 7. Tuning Knobs

| Knob | Constant | Default | Notes |
|---|---|---|---|
| Màxim per personatge | `APRENENTATGE_MAX` | 2 | Revisable en eres posteriors |
| Usos mínims per descoberta | `APRENENTATGE_THRESHOLD` | 4 | Puja per fer la descoberta més difícil |
| Probabilitat de descoberta | `def.discoveryChance` | 0.20–0.30 | Per aprenentatge; `apr_veu_clan` 0.20 (més rar) |
| Accions de descoberta | `def.discovery_action_ids` | 2–3 accions | Permeten múltiples camins a cada aprenentatge |

---

## 8. Criteris d'Acceptació

- [x] Un personatge pot tenir com a màxim 2 aprenentatges (`APRENENTATGE_MAX`)
- [x] Si el predecessor va executar `act_ensenyar` (i tenia ≥ 1 aprenentatge), el fill rep 1 aprenentatge aleatori
- [x] Si el predecessor no va ensenyar, el fill comença amb 0 aprenentatges ensenyats
- [x] L'aprenentatge descobert del predecessor NO es transmet al fill
- [x] El jugador pot descobrir 1 aprenentatge durant la vida via pràctica d'accions (≥ threshold + roll)
- [x] Els efectes dels aprenentatges son visibles a la UI (badges al panel principal + detail overlay)
- [x] `act_ensenyar` requereix `has_any_aprenentatge` — no es pot executar amb 0 aprenentatges
- [x] La reducció d'upkeep d'`apr_conservar_provisions` es reflecteix al tooltip de menjar
- [x] El panel de debug (test panel) mostra tots els aprenentatges disponibles i els descoberts
