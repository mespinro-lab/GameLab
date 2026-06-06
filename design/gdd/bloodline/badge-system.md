> ⚠️ OBSOLET (2026-06-06) — Font de veritat: `prototypes/bloodline/data.js`. Reescriure quan el prototip passi a producció.

# Life Tycoon 2 — Badge System

**Depèn de**: `_overview.md`, `scoring-system.md`, `lineage-chronicle.md`
**Usat per**: —

---

## 1. Overview

El sistema de badges és la capa de meta-col·lecció fora del joc: un conjunt
de reptes que es poden completar al llarg de múltiples partides. Els badges
son visibles des de la pantalla principal (fora de partida) i persisteixen
entre totes les partides del dispositiu. No tenen efecte sobre el gameplay —
son purament col·leccionables. Creen el meta-objectiu de "descobrir-ho tot"
que dóna vidilla a la repetició.

---

## 2. Player Fantasy (d'aquest sistema)

*"Hi ha badges que no puc desbloquejar fins que no sàpiga que existeixen
certes tecnologies de branca. Quan completo una secció del mapa de badges,
sento que he dominat aquella era."*

El jugador ha de sentir que el mapa de badges és un mapa de les possibilitats
del joc — una guia implícita cap a experiències que no ha tingut encara.

---

## 3. Regles Detallades

### 3.1 Propietats d'un Badge

Un badge és una condició que, si es compleix durant qualsevol partida, es
marca com a obtingut permanentment.

**Fitxer**: `data/badges/[badge_id].json`

```json
{
  "id": "badge_id",
  "era_id": "era_id",
  "name": "Nom del badge",
  "description": "Descripció breu del repte.",
  "hint": "Pista per a quan el badge és visible però no obtingut.",
  "icon": "icon_key",
  "category": "discovery",
  "rarity": "common",
  "is_secret": false,
  "unlock_condition": {
    "type": "branch_tech_discovered",
    "branch_tech_id": "branch_tech_id"
  }
}
```

| Camp | Descripció |
|---|---|
| `era_id` | Era a la qual pertany. `null` = badge de partida completa (multi-era). |
| `category` | Categoria del badge (veure 3.2). |
| `rarity` | `common`, `uncommon`, `rare`, `legendary`. |
| `is_secret` | `true` = el badge no apareix al mapa fins que s'obté. Ni el nom ni la pista son visibles. |
| `hint` | Text que es mostra quan el badge és visible però no obtingut. Pot ser vague per `rare`/`legendary`. |
| `unlock_condition` | Condició de desbloqueig (veure 3.3). |

### 3.2 Categories de Badges

| Categoria | Descripció | Exemples |
|---|---|---|
| `discovery` | Descobrir tecnologies de branca, zones o accions ocultes. | "Primera vegada que descobreixes X" |
| `path` | Completar una era amb una inclinació dominant específica. | "Completar era 1 amb >70% branca A" |
| `combination` | Tenir simultàniament certes branques, tecns. o destreses. | "Tenir branca A+B actives a la vegada" |
| `efficiency` | Completar una era en menys cicles dels habituals. | "Completar era 1 en < 8 cicles totals" |
| `title` | Obtenir un títol de dinastia específic. | "Obtenir el títol X" |
| `chronicle` | Condicions sobre la crònica del llinatge. | "Tenir 3 events rars en una era" |
| `meta` | Completar tots els badges d'una categoria o era. | "Completar tots els badges de l'era 1" |

### 3.3 Tipus de Condicions de Desbloqueig

```json
// Branch tech descoberta
{ "type": "branch_tech_discovered", "branch_tech_id": "id" }

// Inclinació dominant
{ "type": "branch_dominant", "branch_id": "id", "min_pct": 0.70 }

// Dues branques actives simultàniament
{ "type": "multi_branch", "branch_ids": ["id_A", "id_B"], "min_pct_each": 0.25 }

// Títol obtingut
{ "type": "title_earned", "title_id": "id" }

// Totes les zones descobertes en una era
{ "type": "all_zones_discovered", "era_id": "id" }

// Era completada en pocs cicles
{ "type": "era_efficiency", "era_id": "id", "max_total_cycles": 20 }

// Score d'era per sobre d'un valor
{ "type": "era_score", "era_id": "id", "min_score": 2000 }

// Event rar específic trigat
{ "type": "rare_event_triggered", "event_id": "id" }

// Completar tots els badges d'una era
{ "type": "era_badges_complete", "era_id": "id" }
```

### 3.4 Mapa de Badges

El mapa de badges és la pantalla principal de la meta-col·lecció. Organitza
els badges per era i categoria. Els badges obtinguts es mostren plens; els
no obtinguts es mostren en gris amb la pista (o completament ocults si
`is_secret: true`).

**Estructura visual**: graella per era. Cada era té les seves categories.
Els `meta` badges (completar tots els d'una era) estan al final de cada
secció.

### 3.5 Persistència

Els badges obtinguts es guarden localment al dispositiu en un fitxer separat
del save de la partida, de manera que persisteixen entre totes les partides.
En futures versions, es poden sincronitzar al núvol.

**Fitxer de save de badges**: `user_data/badges_progress.json`

```json
{
  "version": 1,
  "obtained": ["badge_id_1", "badge_id_2"],
  "seen": ["badge_id_1", "badge_id_2", "badge_id_3"]
}
```

`seen`: badges que l'usuari ha vist a la pantalla (per marcar com a "nous").

---

## 4. Fórmules

### Avaluació de Badges

```
// Al final de cada cicle, era i partida:
per cada badge no obtingut:
    if evaluate_condition(badge.unlock_condition, current_game_state):
        obtain_badge(badge.id)
        notify_player()
```

L'avaluació és incremental — no cal recalcular tots els badges en cada frame.
Només s'avaluen quan l'estat rellevant canvia (nova branch tech, nou event, etc.).

---

## 5. Casos Extrems

- **Badge `is_secret: true` obtingut**: apareix al mapa complet (nom, icona,
  descripció) i es notifica al jugador amb una animació especial. Fins aleshores,
  l'espai al mapa mostra un `?`.

- **Badge de categoria `meta` on falten badges `is_secret`**: el badge meta
  es desbloqueja quan tots els badges (incloent els secrets) de l'era estan
  obtinguts. No es pot completar sense haver descobert els secrets.

- **Condició de badge que depèn d'una era DLC no comprada**: el badge es
  mostra al mapa però amb una indicació que requereix la compra de l'era.
  No s'avalua fins que l'era és accessible.

- **Reset de partida**: els badges obtinguts no es perden en iniciar una
  partida nova. Son meta-joc, fora de partida.

---

## 6. Dependències

| Sistema | Relació |
|---|---|
| `scoring-system.md` | Condicions de badge basades en score i títols. |
| `lineage-chronicle.md` | Condicions basades en events de la crònica. |
| `branch-system.md` | Condicions basades en inclinació i tecnologies de branca. |
| `era-system.md` | Badges organitzats per era; condicions sobre zones. |
| `tech-architecture.md` | Persistència de badges en fitxer separat del save de partida. |

---

## 7. Tuning Knobs

| Knob | Default | Rang segur | Efecte |
|---|---|---|---|
| `BADGE_NOTIFY_DURATION` | 3s | 1–5s | Temps de visibilitat de la notificació de badge obtingut. |
| `SECRET_BADGE_REVEAL_ON_OBTAIN` | true | — | Si `false`, els badges secrets no revelen res en obtenir-se (mode ultra-misterios). |

---

## 8. Criteris d'Acceptació

- [ ] Obtenir un badge durant una partida mostra una notificació visible però
      no intrusiva
- [ ] Un badge `is_secret: true` no apareix al mapa fins que s'obté
- [ ] Els badges obtinguts persisteixen en iniciar una nova partida
- [ ] El mapa de badges d'una era és accessible des de la pantalla principal
      (fora de partida)
- [ ] Afegir un badge nou requereix únicament crear el seu fitxer JSON i
      afegir l'id al registre; zero canvis de codi
