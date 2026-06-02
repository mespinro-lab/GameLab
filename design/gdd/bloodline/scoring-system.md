# Life Tycoon 2 — Scoring System

**Depèn de**: `_overview.md`, `era-system.md`, `branch-system.md`, `event-system.md`
**Usat per**: `lineage-chronicle.md`, `badge-system.md`

---

## 1. Overview

El joc puntua en dos nivells: **score d'era** (calculat al finalitzar cada era)
i **score de partida** (suma ponderada de totes les eres jugades). Cada era és
independent: pots tenir un score excel·lent a l'era 1 i dolent a l'era 2,
o remontar d'un inici difícil. A més del score numèric, el sistema atorga
**títols de dinastia** — reconeixements narratius per combinacions especials
de branques, tecnologies o decisions.

---

## 2. Player Fantasy (d'aquest sistema)

*"Vull saber per quin motiu he puntuat el que he puntuat. I vull intentar-ho
millor la propera vegada, ara que sé quins camins porten als títols més rars."*

El jugador ha de sentir que el score és una conseqüència llegible de les seves
decisions, no un número opac. La pantalla de score d'era ha d'explicar, no
només mostrar.

---

## 3. Regles Detallades

### 3.1 Score d'Era

El score d'era es calcula en completar la transició de l'era (veure
`era-system.md`). Els components son:

| Component | Descripció |
|---|---|
| **Tecnologies de branca descobertes** | Nombre de branch techs descobertes durant l'era. |
| **Events rars trigats** | Nombre d'events `is_rare: true` disparats durant l'era. |
| **Bonus d'eficiència** | Cicles estalviats respecte al màxim possible de l'era. |
| **Reputació dinàstica** | Valor de reputació acumulada al final de l'era. |
| **Bonus de branca dominant** | Bonus per tenir una branca dominant clara (inclinació > llindar). |

**Nota sobre independència**: el score d'era no té en compte el score d'eres
anteriors. Cada era es puntua des de zero. El score de partida agrega les eres.

### 3.2 Schema JSON — Títol de Dinastia

Els títols son reconeixements únics atorga ts al llinatge per condicions
específiques. Cada era pot tenir els seus propis títols.

**Fitxer**: `data/eras/[era_id]/titles/[title_id].json`

```json
{
  "id": "title_id",
  "era_id": "era_id",
  "name": "Nom del títol",
  "description": "Frase narrativa que descriu el títol.",
  "rarity": "common",
  "score_bonus": 500,
  "unlock_conditions": {
    "operator": "AND",
    "conditions": [
      { "type": "branch_inclination", "branch_id": "branch_id", "min_pct": 0.65 },
      { "type": "branch_tech_discovered", "branch_tech_id": "branch_tech_id" },
      { "type": "rare_event_triggered", "event_id": "event_id" },
      { "type": "min_era_score", "value": 1000 }
    ]
  }
}
```

| Camp | Valors de `rarity` | Descripció |
|---|---|---|
| `common` | — | Assolible en la majoria de partides d'una branca. |
| `uncommon` | — | Requereix especialització o decisions no trivials. |
| `rare` | — | Combinació específica poc probable. |
| `legendary` | — | Condicions molt restrictes. Pocs jugadors l'hauran vist. |

**Operadors de condicions**: `AND` (totes), `OR` (almenys una).
Les condicions poden niuar-se per a lògica complexa.

**Tipus de condicions disponibles**:

| Tipus | Paràmetres |
|---|---|
| `branch_inclination` | `branch_id`, `min_pct` |
| `branch_tech_discovered` | `branch_tech_id` |
| `rare_event_triggered` | `event_id` |
| `min_era_score` | `value` |
| `max_cycles_used` | `value` (eficiència alta) |
| `all_zones_discovered` | — |
| `specific_upgrade_completed` | `action_id` (versió upgradeada) |
| `multi_branch_active` | `min_branches`, `min_inclination_each` |

### 3.3 Score de Partida

El score de partida s'acumula a mesura que es completen eres. No es calcula
al final de la partida sinó que és un running total visible durant el joc.

```
run_score = Σ era_scores[i]
          + Σ title_bonuses
          + coherence_bonus
```

**Bonus de coherència**: si el jugador manté una orientació d'inclinació
consistent entre eres (els mateixos eixos dominants a cada era), s'aplica
un petit bonus. El motor compara els eixos més alts de l'última era amb
els de l'era anterior directament sobre els valors numèrics dels 4 eixos globals.

### 3.4 Pantalla de Score d'Era

La pantalla de score ha de mostrar:
1. Puntuació total d'era (número gran).
2. Desglosament per component (amb etiquetes clares).
3. Títols obtinguts en aquesta era (destacats visualment per `rarity`).
4. Comparativa amb la millor puntuació pròpia en aquesta era (si existeix).
5. **Quantes tecnologies de branca hi havia disponibles vs quantes s'han
   descobert** (incentiva tornar a jugar per descobrir les ocultes).

### 3.5 Reputació Dinàstica

La reputació és un indicador persistent entre generacions i eres. No es
reinicia en la transició d'era (a diferència dels altres indicadors). Contribueix
al score d'era i desbloqueja accions i events exclusius.

| Acció | Efecte sobre reputació |
|---|---|
| Resoldre events rars favorablement | +rep |
| Descobrir tecnologies de branca | +rep |
| Assolir un títol | +rep significatiu |
| Morir amb indicadors molt baixos | −rep |
| Opcions d'events "deshonoroses" | −rep (definit per event) |

La reputació **no es transmet al 100%** en la transició d'era. Es degrada
parcialment (controlat per `REPUTATION_ERA_DECAY`) — el llinatge ha de
guanyar-se el respecte en cada nova era.

---

## 4. Fórmules

### Score d'Era

```
era_score =
    (branch_techs_discovered_this_era × W_TECH)
  + (rare_events_triggered_this_era   × W_RARE)
  + (efficiency_bonus)
  + (dynasty_reputation_end_of_era    × W_REP)
  + (dominant_branch_bonus)
  + (Σ title.score_bonus for each title unlocked this era)

efficiency_bonus = max(0, era.life_expectancy.max_cycles − cycles_used_this_era)
                   × W_EFF

dominant_branch_bonus = (inclination_pct[dominant_branch] ≥ DOMINANT_BRANCH_THRESHOLD)
                        ? DOMINANT_BRANCH_BONUS
                        : 0
```

### Score de Partida

```
run_score = Σ era_score[i]
          + Σ title.score_bonus [títols multi-era, si n'hi ha]
          + coherence_bonus

coherence_bonus = (eres_amb_mateixa_branca_dominant_encadenades ≥ 2)
                  ? COHERENCE_BONUS_PER_ERA × eres_coherents
                  : 0
```

### Reputació — Transició d'Era

```
reputation_new_era = reputation_end_of_era × REPUTATION_ERA_DECAY
```

---

## 5. Casos Extrems

- **Era completada sense descobrir cap tecnologia de branca**: el component
  `W_TECH` és 0. El jugador pot compensar amb eficiència i events rars.

- **Score negatiu d'era**: possible si els penalitzadors superen els bonus
  (en la fórmula base no hi ha penalitzadors, però els títols podrien tenir
  `score_bonus` negatiu com a penalització per decisions dolentes, si el
  dissenyador ho decideix).

- **Múltiples títols obtinguts en una era**: s'acumulen tots els `score_bonus`.
  No hi ha límit de títols per era.

- **Partida finalitzada sense completar l'última era** (game over per manca
  de successors): el score de les eres completades es conserva. L'era en curs
  no puntua.

- **Coherence bonus entre eres**: les branques canvien de nom entre eres, però
  la inclinació és global i persistent. El motor compara els valors dels 4 eixos
  directament — no depèn de noms de branques ni de cap mapa de transició.

---

## 6. Dependències

| Sistema | Relació |
|---|---|
| `era-system.md` | La transició d'era dispara el càlcul de score d'era. |
| `branch-system.md` | `inclination_pct` i tecnologies de branca son inputs del score. |
| `event-system.md` | Events `is_rare: true` contribueixen al score. |
| `lineage-chronicle.md` | Els títols i el score apareixen a la crònica. |
| `badge-system.md` | Alguns badges es desbloquegen per score o títols obtinguts. |

---

## 7. Tuning Knobs

| Knob | Default | Rang segur | Efecte |
|---|---|---|---|
| `W_TECH` | 50 | 20–150 | Pes de cada tecnologia de branca descoberta. |
| `W_RARE` | 200 | 100–500 | Pes de cada event rar trigat. |
| `W_EFF` | 20 | 5–50 | Punts per cicle estalviat. |
| `W_REP` | 0.5 | 0.1–2.0 | Multiplicador de reputació al score d'era. |
| `DOMINANT_BRANCH_THRESHOLD` | 0.55 | 0.40–0.75 | % d'inclinació per activar el bonus de branca dominant. |
| `DOMINANT_BRANCH_BONUS` | 300 | 100–600 | Bonus fix per tenir branca dominant. |
| `COHERENCE_BONUS_PER_ERA` | 150 | 50–300 | Bonus per era coherent encadenada. |
| `REPUTATION_ERA_DECAY` | 0.70 | 0.50–0.90 | % de reputació que es manté en la transició d'era. |

---

## 8. Criteris d'Acceptació

- [ ] La pantalla de score d'era mostra el desglosament per component amb
      etiquetes comprensibles per a un jugador nou
- [ ] Un jugador que descobreix totes les tecnologies de branca d'una era
      puntua notablement més que un que no en descobreix cap
- [ ] Un títol de raritat `legendary` és visible però inassolible en una
      partida normal sense decisions molt específiques
- [ ] El score de partida augmenta en completar cada era, visible en temps real
- [ ] La pantalla de score mostra quantes branch techs s'han descobert vs
      quantes hi ha disponibles (incentiu de replayability)
- [ ] La reputació dinàstica al final d'una era és palpablement diferent
      entre un jugador que ha resolt events favorablement vs un que no
