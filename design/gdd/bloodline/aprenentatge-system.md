# Bloodline — Aprenentatge System

**Depèn de**: `_overview.md`, `branch-system.md`, `destresa-system.md`
**Usat per**: `action-economy.md`, `scoring-system.md`

> **Estat**: PENDENT DE DISSENY. L'estructura de dades existeix al codi
> (`character.aprenentatges`, `APRENENTATGE_DEFS`) però no hi ha aprenentatges
> definits. `act_ensenyar` marca `charState.ensenyat = 1` com a indicador que
> el pare ha ensenyat, però la transferència real al fill és un stub. Dissenyar
> contingut i efectes concrets d'aprenentatge abans d'implementar.

---

## 1. Overview

Un aprenentatge és un bonus permanent adquirit durant la vida del personatge,
de natura diferent a la destresa (innat) i a l'habilitat (del llinatge).
L'aprenentatge representa el coneixement *après*, la saviesa *transmesa*, el
saber *cultivat*. Un personatge pot tenir fins a 2 aprenentatges:

1. **Ensenyat**: transmès explícitament pel predecessor via `act_ensenyar`
   ("Ensenyar el Fill"). Requereix que el predecessor hagi executat aquesta
   acció almenys un cop durant la seva vida.
2. **Descobert**: après durant la vida del personatge a través d'una acció
   o event específic (com les destreses per pràctica, però sense lligam
   necessari a un eix d'inclinació concret).

---

## 2. Player Fantasy

*"El meu pare em va ensenyar a llegir els núvols — una cosa que ell havia
après d'un vell que va passar pel campament quan era jove. Ara jo ho sé. I
potser algun dia podré ensenyar-ho al meu fill, si tinc temps."*

L'aprenentatge ha de sentir-se com una cadena: una saviesa que pot saltar de
generació en generació, però que no és garantida — cal l'acte conscient
d'ensenyar, i cal viure prou per aprendre.

---

## 3. Regles Detallades (Disseny Provisional)

### 3.1 Adquisició

| Via | Mecànica | Limit |
|---|---|---|
| **Ensenyat** | Predecessor executa `act_ensenyar` → fill rep 1 aprenentatge del predecessor | 1 per personatge |
| **Descobert** | Acció o event específic durant la partida | 1 per personatge |

El límit total és **2 aprenentatges per personatge** (1 ensenyat + 1 descobert).

### 3.2 Herència

A diferència de les habilitats (100% heretades), els aprenentatges **no
s'hereten automàticament**. El fill rep l'aprenentatge ensenyat ÚNICAMENT si
el predecessor va executar `act_ensenyar`. L'aprenentatge descobert pel
predecessor **no es transmet** — el fill haurà de descobrir el seu propi.

### 3.3 Efectes

Els efectes concrets de cada aprenentatge son **pendents de disseny**. Alguns
eixos possibles:
- Bonus permanent a un recurs (+X output d'una categoria d'accions)
- Desbloqueg d'accions especials (com les habilitats, però sense requisit d'inclinació)
- Modificador d'events (canvia probabilitats o opcions disponibles)
- Bonus narratiu (crònica, scoring de dinastia)

### 3.4 Distinció respecte a destresa i habilitat

| Concepte | Ve de | Pot perdre's | Pot ensenyar-se |
|---|---|---|---|
| **Habilitat** | Descoberta activa (inclinació) | Mai | No cal (100% herència) |
| **Destresa** | Innat (nàixer) + pràctica | Mai (d'un personatge concret) | Parcialment (1 passa al fill) |
| **Aprenentatge** | Ensenyança explícita o descoberta | Mai (d'un personatge concret) | 1 pot passar al fill via `act_ensenyar` |

---

## 4. Fórmules

### Transferència en Successió (stub actual)

```
si predecessor.charState.ensenyat == 1 AND predecessor.aprenentatges.size > 0:
    fill.aprenentatges.add(randomPick(predecessor.aprenentatges))
```

Implementació actual: stub buit (`inheritedAprenentatges = new Set()`).
La lògica real s'activarà quan `APRENENTATGE_DEFS` contingui definicions.

---

## 5. Casos Extrems

- **Predecessor no va ensenyar**: fill rep 0 aprenentatges ensenyats. Pot aprendre els 2 durant la seva vida.
- **Predecessor va ensenyar però tenia 0 aprenentatges**: `act_ensenyar` es pot executar però no transfereix res (cas a evitar amb un `requires: has_any_aprenentatge` futur).
- **Gen 1**: no té predecessor, comença amb 0 aprenentatges. Pot aprendre fins a 2 durant la seva vida.

---

## 6. Dependències

| Sistema | Relació |
|---|---|
| `branch-system.md` | Aprenentatges son independents de branques però poden tenir condicions d'era |
| `destresa-system.md` | Mecànica paral·lela; destreses son innates, aprenentatges son apresos |
| `action-economy.md` | `act_ensenyar` és l'acció de transmissió; futures accions de descoberta pendents |

---

## 7. Tuning Knobs

| Knob | Default | Notes |
|---|---|---|
| Màxim d'aprenentatges per personatge | 2 (1 ensenyat + 1 descobert) | Revisable en eres posteriors |
| `act_ensenyar` requereix fills | Sí (`fills ≥ 1`) | No té sentit ensenyar sense receptor |
| `act_ensenyar` és d'un sol ús per vida | Sí (`ensenyat ≤ 0`) | Evita spam; una sola transmissió conscient |

---

## 8. Criteris d'Acceptació

> Tots pendents fins que `APRENENTATGE_DEFS` estigui definit.

- [ ] Un personatge pot tenir com a màxim 2 aprenentatges
- [ ] Si el predecessor va executar `act_ensenyar`, el fill rep 1 aprenentatge ensenyat
- [ ] Si el predecessor no va ensenyar, el fill comença amb 0 aprenentatges ensenyats
- [ ] L'aprenentatge descobert del predecessor NO es transmet al fill
- [ ] El jugador pot descobrir 1 aprenentatge durant la vida via acció/event
- [ ] Els efectes dels aprenentatges son visibles i llegibles a la UI del personatge
