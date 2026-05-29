# Scope del Prototip — Life Tycoon 2

**Darrera actualització**: 2026-05-30
**Prototip**: `prototypes/life-tycoon-2/` (HTML5 / Vanilla JS)
**Pregunta que valida**: *"Does inclination-driven action visibility + branch tech discovery + succession feel engaging?"*

---

## Propòsit d'aquest document

El GDD de Life Tycoon 2 descriu un joc complet amb múltiples eres, sistema de puntuació, crònica dinàstica, badges i arquitectura data-driven. El prototip implementa deliberadament **una subconjunt del GDD** per validar el loop de jugabilitat nuclear amb el mínim cost.

Aquest document defineix el límit entre "implementat al prototip" i "post-prototip". Qualsevol divergència entre el GDD i el codi del prototip és **intencional** llevat que consti explícitament com a bug.

---

## Dins del prototip (MVP)

### Mecàniques nuclears
| Sistema | Notes |
|---|---|
| 4 eixos d'inclinació (impuls, intel·lecte, espiritualitat, sociabilitat) | Rang −1.0 a +1.0, 5 posicions discretes |
| Inèrcia d'inclinació (fórmula `INERTIA_FACTOR = 2.0`) | Tal qual GDD |
| Visibilitat d'accions per inclinació (ACTIVE / FADED / HIDDEN) | `FADE_MARGIN = 0.05` (GDD diu 0.10 — revisar) |
| 3 recursos: Aliment 🌾, Provisions 🧠, Salut ❤️ | Upkeep -1/torn cadascun |
| 4 zones: Campament, Planes, Bosc, Ritual | Descoberta per acció o branch tech |

### Progressió
| Sistema | Notes |
|---|---|
| 5 Universal Techs (cicles 2, 4, 6, 9, 12) | Auto-descobertes; `ut_recollida_sistematica` (c9) i `ut_conreu_incipient` (c12) són intencionalment de Gen 2+ |
| 13 Branch Techs amb prereq universal + condicions d'inclinació | `is_hidden: true` = descoberta só per event (pendent fix S2-09) |
| Discovery action (Escoltar Estrangers) — jugador tria quina tech aprendre | Refactoritzat al sweep #29b: el jugador veu les opcions |
| Upgrades d'acció (5 upgrades, substitueixen acció base) | Progrés destresa transferit a l'upgrade |

### Personatge i llinatge
| Sistema | Notes |
|---|---|
| Stats: Força / Enginy / Vincle (1.0–5.0) | **No documentat al GDD** (pendent crear `character-stats.md`) |
| Destreses: descobertes per ús repetit (threshold=5, màx 2) | GDD diu "innates"; codi diu "apreses" — pendent reconciliar |
| Successió generacional (5 generacions, herència 65%) | `MAX_GENERATIONS = 5` és limitació del prototip |
| Sistema de família: parella → fills (màx 3) → tria successor | **No documentat al GDD** (pendent afegir a `lineage-chronicle.md`) |
| Sibling pool: fills no escollits resten com a germans futurs | **No documentat al GDD** (pendent afegir a `lineage-chronicle.md`) |
| Zones descobertes persisteixen entre generacions (coneixement clànic) | Intencional — pendent documentar a `lineage-chronicle.md` |

### Events
| Sistema | Notes |
|---|---|
| Events de pool per acció (discovery + efecte simple) | Un event aleatori del pool si n'hi ha elegibles |
| `is_single_use` per personatge (reset a successió) | Intencional — events poden repetir-se entre generacions |

### UI / Debug
| Element | Notes |
|---|---|
| Glossari dinàmic (11 seccions live) | Inclou branques, techs, zones |
| Tech strip universal (always-visible) | Debug |
| Delta tooltip d'inclinació per acció (hover) | Debug |
| Dots d'inclinació clicables (forçar valors) | Desactivat (`DEBUG_MODE = false`) |
| Onboarding panel (cicle 0, skip persistent via localStorage) | Prototip only |
| Barra de progrés destresa per acció | Debug |

---

## Fora del prototip (post-prototip)

### Sistemes post-prototip — NO implementar fins a decisió explícita

| Sistema | Document GDD | Raó d'exclusió |
|---|---|---|
| **Era system** (múltiples eres, transicions, connectors) | `era-system.md` | El prototip valida una sola era; `LIFE_EXPECTANCY = 14` i `MAX_GENERATIONS = 5` són simplificacions |
| **Sistema de score** (era_score, run_score, dominant_branch_bonus, coherence_bonus) | `scoring-system.md` | Requereix era system complet; el game over actual mostra text fix |
| **Títols de dinastia** | `scoring-system.md §3.2`, `content-plan-era1.md §9` | Requereix score system |
| **Reputació dinàstica** | `scoring-system.md §3.5` | Requereix score system |
| **Crònica del llinatge** (plantilles, generació narrativa) | `lineage-chronicle.md §3.4-3.5` | Post-prototip; el log actual és suficient per al test |
| **Genealogia visual** | `lineage-chronicle.md §3.6` | Post-prototip |
| **Sistema de badges** | `badge-system.md` | No validable sense meta-sessió |
| **Events de pressió del món** (`pe_malaltia`, `pe_hivern_dur`, etc.) | `era-system.md §3.6`, `content-plan-era1.md §8` | No implementats; `event_block` passive effect actual és placeholder |
| **Events encadenats** (`chain_pool_id`, `chain_probability`) | `event-system.md §3.5` | Simplificació intencional |
| **Events rars** (`is_rare: true`) | `event-system.md §3.7` | Simplificació intencional |
| **Probabilitat global d'events** (`EVENT_BASE_TRIGGER_CHANCE`) | `_overview.md §7` | Avui: si hi ha events elegibles, sempre es dispara un |
| **Característiques** (innates, atzar) | `_overview.md §3.10`, `lineage-chronicle.md §4` | No implementat |
| **Aprenentatges** (`knowledge_ids`) | `_overview.md §3.10`, `lineage-chronicle.md §3.3` | No implementat |
| **Pells** (recurs secundari proposat) | `content-plan-era1.md §1` [PROPOSTA] | Decisió pendent — recomanació: descartar Era 1 |
| **Save / Load** | `tech-architecture.md §3.6` | Post-prototip |
| **i18n / Localització** (ca/es/en) | `tech-architecture.md §3.9` | Post-prototip; UI actual en català fix |
| **Àudio** | `tech-architecture.md §3.10` | Post-prototip |
| **Validació de dades en arrencar** | `tech-architecture.md §3.8` | Post-prototip |
| **Schema JSON data-driven** (eres, branques, accions com a fitxers JSON externs) | `tech-architecture.md §3.3` | Tot el contingut és JS inlin al prototip; s'ha de redissenyar per a Godot 4 |

---

## Simplificacions deliberades vs GDD

| Tema | GDD diu | Prototip fa | Decisió |
|---|---|---|---|
| `LIFE_EXPECTANCY` | `base_cycles = 12`, `max_cycles = 18` | Valor fix = 14 | Simplificació; revisar quan s'implementi era system |
| `MAX_GENERATIONS` | No definit (game over per extinció) | Fix = 5 (sessions curtes de test) | Limitació de prototip |
| `MAX_CHILDREN` | Per era, rang 1–6 | Fix = 3 | Simplificació |
| Escala indicadors | 0–100 (health: 80 a `era-system.md §3.2`) | 0–20 | Simplificació; pendent decidir escala canònica |
| Herència de recursos | `RESOURCE_INHERITANCE_RATE = 0.50` (`lineage-chronicle.md §7`) | materials = 0 a successió | Simplificació; GDD i codi no coincideixen — pendent decisió |
| `FADE_MARGIN` | Default 0.10 (`branch-system.md §7`) | 0.05 | Ajust de playtest; pendent actualitzar GDD |
| Destreses | "Innates" (`_overview.md §3.10`) | Apreses per ús repetit | Divergència conceptual; pendent reconciliar |

---

## Decisions de disseny obertes bloquejants

Decisions que cal prendre per poder continuar amb el prototip:

1. **C3-02** — Branches inalcançables Gen 1: ¿multi-generacionals per disseny o error de balance? (afecta `bt_coneixement_plantes`, `bt_llavor_selectiva`, `bt_calendari_natural`, `bt_pintura_rupestre`)
2. **C2-09** — Stats (Força/Enginy/Vincle): ¿entren al GDD o s'eliminen del prototip?
3. **C3-03** — Pells: ¿recurs de l'Era 1 o descartats?
4. **C5-01** — Escala d'indicadors: 0–20 (codi) o 0–100 (GDD)?
5. **C3-06** — Herència de materials a successió: 0% (avui) o 50% (GDD)?

---

## Constants del prototip (referència ràpida)

```
INERTIA_FACTOR       = 2.0
BRANCH_INHERITANCE_RATE = 0.65
FADE_MARGIN          = 0.05
LIFE_EXPECTANCY      = 14    # cicles per personatge
MAX_GENERATIONS      = 5     # límit de prototip
STARTING_FOOD        = 15
STARTING_HEALTH      = 20
HEALTH_MAX           = 20
STAT_MAX             = 5.0
STAT_STARTING_VALUE  = 1.0
STAT_OUTPUT_FACTOR   = 0.15
DESTRESA_THRESHOLD   = 5
DESTRESA_MAX         = 2
DESTRESA_BONUS       = 1
MAX_CHILDREN         = 3
FOOD_UPKEEP          = 1     # per torn
HEALTH_UPKEEP        = 1     # per torn (envelliment)
```
