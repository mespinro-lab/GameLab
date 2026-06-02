# Character Stats — Life Tycoon 2

**Darrera actualització**: 2026-05-30
**Estat**: Draft — documentació de mecànica existent al prototip

---

## 1. Overview

Cada personatge té tres atributs numèrics que creixen per ús i afecten directament el rendiment de les accions. Els stats s'hereten parcialment a la successió, creant una progressió dinàstica tangible.

## 2. Player Fantasy

El jugador sent que el personatge es converteix en un expert quan practica. La filla d'un gran caçador comença ja amb avantatge en Força — el llegat es nota des del primer torn.

## 3. Detailed Rules

### 3.1 Els tres atributs

| Atribut | Emoji | Associat a | Descripció |
|---|---|---|---|
| Força | 💪 | `forca` | Capacitat física: caça, combat, construcció |
| Enginy | 🧠 | `enginy` | Habilitat manual i cognitiva: eines, recol·lecció, planificació |
| Vincle | 🤝 | `vincle` | Connexió social i espiritual: rituals, família, cohesió |

### 3.2 Rang i valors inicials

- **Rang**: 1.0 – `STAT_MAX` (5.0)
- **Valor inicial**: `STAT_STARTING_VALUE = 1.0` per a tots tres atributs en el personatge inicial
- **Valor heretat**: `valor_pare × BRANCH_INHERITANCE_RATE` (65%), mínim 1.0

### 3.3 Creixement per ús

Cada vegada que s'executa una acció amb `stat_key`, el stat corresponent creix:

```
nou_stat = min(STAT_MAX, stat_actual + action.stat_gain)
```

Valors típics de `stat_gain`: 0.10 – 0.20 per execució.

### 3.4 Efecte sobre l'output

Cada punt de stat per sobre de la línia de base (1.0) multiplica l'output de l'acció:

```
output_bonus = floor((stat - 1.0) × STAT_OUTPUT_FACTOR × base_output)
output_final = output_base + output_bonus
```

On `STAT_OUTPUT_FACTOR = 0.15` i `base_output` és el valor sense bonus.

**Exemple**: Força 3.0 executant Caça amb Llança (output base 8):
- Bonus = floor((3.0 - 1.0) × 0.15 × 8) = floor(2.4) = +2
- Output final = 8 + 2 = 10

## 4. Formulas

```
stat_gain_per_use    = action.stat_gain            # 0.10–0.20
stat_after_use       = min(STAT_MAX, stat + stat_gain)
output_bonus         = floor((stat - 1.0) × STAT_OUTPUT_FACTOR × raw_output)
inherited_stat       = max(1.0, parent_stat × BRANCH_INHERITANCE_RATE)
```

## 5. Edge Cases

- **Stat al màxim (5.0)**: Deixa de créixer però continua donant el bonus complet.
- **Stat heretat arrodoniment**: Si 3.5 × 0.65 = 2.275 → s'aplica directament com a float; no s'arrodoneix a entero.
- **Personatge sense herència (Gen 1)**: Tots els stats comencen a 1.0; cap bonus d'output al torn 1.

## 6. Dependencies

- `_overview.md §3.10` — Stats mencionats com a "Characteristics" (divergència de nomenclatura pendent reconciliar)
- `lineage-chronicle.md §4` — Herència de stats a successió
- `branch-system.md` — `stat_key` per branca determina quin stat creix

## 7. Tuning Knobs

| Constant | Valor actual | Efecte |
|---|---|---|
| `STAT_MAX` | 5.0 | Màxim assolible per qualsevol stat |
| `STAT_STARTING_VALUE` | 1.0 | Punt de partida per al personatge inicial |
| `STAT_OUTPUT_FACTOR` | 0.15 | Multiplica el bonus per punt de stat |
| `BRANCH_INHERITANCE_RATE` | 0.65 | % de stats que hereta el successor |

## 8. Acceptance Criteria

- [ ] Un personatge amb Força 5.0 fa més output en accions `stat_key: "forca"` que un amb Força 1.0
- [ ] Un successor hereta stats al 65% del progenitor
- [ ] Els stats no baixen mai per sota de 1.0 ni pugen per sobre de 5.0
- [ ] L'UI mostra els tres stats amb el valor actual

---

## Notes de disseny (prototip)

**Divergència amb `_overview.md`**: El GDD anomena el concepte "Innates" (trets innats) mentre el prototip implementa stats apresos per ús. Decisió del 2026-05-30: els stats apresos (Força/Enginy/Vincle) queden al joc. El concepte "Innates" del GDD es deixa per a una decisió futura (podria ser un sistema addicional, no substitut).

**No documentat al GDD original**: Aquest sistema va emergir durant el prototipat. Queda formalitzat aquí com a part del disseny de l'Era 1.
