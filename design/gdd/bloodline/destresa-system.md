# Bloodline — Destresa System

**Depèn de**: `_overview.md`, `branch-system.md`
**Usat per**: `action-economy.md`, `scoring-system.md`

---

## 1. Overview

Una destresa és un talent innat del personatge — no una tècnica apresa, sinó
una disposició natural que acompanya el llinatge des del primer cicle. Cada
personatge neix amb exactament 2 destreses: una heretada del personatge
predecessor, i una que apareix per atzar en el moment del naixement. Durant
la vida activa del personatge, pot descobrir destreses addicionals a través
de la pràctica repetida d'accions específiques.

---

## 2. Player Fantasy

*"El meu net ha heretat la mirada de la seva àvia — aquell ull agut per al
rastreig. Però porta una cosa nova: una paciència per a la flama que mai hem
tingut en aquest llinatge. No sé d'on ve. Però és seva."*

La destresa ha de sentir-se com quelcom definitiu i personal, no com un
recurs de gestió. El jugador no "tria" les destreses del fill — les rep,
les viu, i construeix al seu voltant.

---

## 3. Regles Detallades

### 3.1 Destreses Innates (Naixement)

Cada personatge nou rep exactament **2 destreses en nàixer**:

1. **Heretada**: una de les destreses del personatge predecessor, triada a l'atzar.
   - Si el predecessor tenia 0 destreses (Gen 1 sense precedent): es tracta com una destresa aleatòria.
2. **Innata nova**: una destresa triada a l'atzar del pool global de `DESTRESA_DEFS`,
   diferent de l'heretada.

La inclinació del nounat **no afecta** quin destresa innata rep — el talent
innat és independent de la trajectòria cultural del llinatge.

### 3.2 Destreses Descobertes (Durant la Vida)

A més de les 2 innates, un personatge pot descobrir destreses addicionals
durant la seva vida a través de la **pràctica repetida** (`DESTRESA_THRESHOLD`
usos de l'acció associada) combinada amb la **inclinació adequada**.

El límit per personatge és `DESTRESA_MAX` (incloses les 2 innates). Un cop
assolit el límit, cap acció addicional pot revelar noves destreses.

### 3.3 Efecte d'una Destresa

Cada destresa concedeix un **bonus de +`DESTRESA_BONUS`** a l'output d'una
acció específica (`destresa_id` de l'acció). A més, algunes destreses actuen
com a **prerequisit** per a certes accions avançades (`has_destresa` en
`requires`).

### 3.4 Persistència i Herència

- Una destresa mai es perd durant la vida del personatge que la porta.
- En la successió, **1 de les destreses del predecessor** es transmet al fill
  (tirada aleatòria entre totes les del predecessor). La resta no es transmeten.
- La destresa **innata nova** del fill és independent del predecessor.
- A diferència de les **habilitats** (`SKILL_DEFS`), les destreses **no
  s'hereten totes automàticament** — la transmissió és parcial per disseny.

### 3.5 Distinció de conceptes adjacents

| Concepte | Origen | Herència | Quantitat | Pertany a |
|---|---|---|---|---|
| **Habilitat** (`SKILL_DEFS`) | Descoberta activa (inclinació + acció) | 100% sempre | Sense límit | El llinatge |
| **Destresa** (`DESTRESA_DEFS`) | Innat (nàixer) + pràctica | 1 del predecessor + 1 nova | Fins a `DESTRESA_MAX` | El personatge |
| **Aprenentatge** (`APRENENTATGE_DEFS`) | Ensenyança (pare) o descoberta durant la vida | Via `act_ensenyar` (1) | Fins a 2 | El personatge |

---

## 4. Fórmules

### Assignació de Destreses en Nàixer

```
function pickInitialDestreses(parentDestreses):
    result = new Set()

    # 1 del predecessor (si en té)
    if parentDestreses.size > 0:
        result.add(randomPick(parentDestreses))

    # 1 aleatòria del pool global (diferent de l'heretada)
    remaining = DESTRESA_DEFS.ids - result
    if remaining.size > 0:
        result.add(randomPick(remaining))

    return result
```

### Descoberta per Pràctica

```
per cada def en DESTRESA_DEFS:
    si personatge.destreses.size >= DESTRESA_MAX: sortir
    si personatge.destreses.has(def.id): continuar
    si actionUseCounts[def.action_id] >= DESTRESA_THRESHOLD
       AND evaluateConditions(def.conditions, inclination):
        personatge.destreses.add(def.id)
```

---

## 5. Casos Extrems

- **Gen 1 sense avantpassat**: les 2 destreses inicials son totes dues aleatòries del pool.
- **Predecessor amb 0 destreses**: el fill rep 0 de l'herència + 1 aleatòria = 1 innata. Pot descobrir-ne més durant la vida.
- **Pool de destreses exhaurit** (pool té menys destreses que el màx): el personatge rebrà menys de 2 innates. Acceptable en eres futures amb pools grans.
- **DESTRESA_MAX assolit en nàixer**: les 2 innates omplen el límit i cap descoberta per pràctica serà possible. Implica que `DESTRESA_MAX ≥ 2` sempre.

---

## 6. Dependències

| Sistema | Relació |
|---|---|
| `branch-system.md` | Les destreses son independents de les habilitats de branca però coexisteixen en el mateix personatge |
| `action-economy.md` | Les accions declaren `destresa_id` (bonus) i `requires: has_destresa` (prerequisit) |
| `aprenentatge-system.md` | Sistema paral·lel amb mecànica d'adquisició diferent |

---

## 7. Tuning Knobs

| Knob | Default | Rang segur | Efecte |
|---|---|---|---|
| `DESTRESA_THRESHOLD` | 5 usos | 3–10 | Usos necessaris per descobrir una destresa per pràctica |
| `DESTRESA_MAX` | 4 | 2–6 | Màxim de destreses per personatge (incloses les innates). Ha de ser ≥ 2. |
| `DESTRESA_BONUS` | +1 output | +1–+3 | Bonus d'output que concedeix la destresa a l'acció associada |

---

## 8. Criteris d'Acceptació

- [ ] Un personatge de Gen 1 neix amb exactament 2 destreses (aleatòries del pool)
- [ ] Un personatge de Gen 2+ neix amb exactament 2 destreses: 1 del predecessor i 1 nova
- [ ] La destresa heretada apareix confirmada al log de successió
- [ ] Les destreses no canvien ni desapareixen durant la vida del personatge que les porta
- [ ] Executar una acció `DESTRESA_THRESHOLD` vegades amb la inclinació adequada desbloqueja la destresa corresponent (si no s'ha assolit `DESTRESA_MAX`)
- [ ] Una destresa concedeix `+DESTRESA_BONUS` a l'output de l'acció associada
- [ ] Una acció amb `requires: has_destresa` no és executable si el personatge no la porta
