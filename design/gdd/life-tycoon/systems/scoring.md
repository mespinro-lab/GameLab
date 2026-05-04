# Sistema de Puntuació Final i Arbre Genealògic

---

## Condicions de fi de partida

| Condició | Tipus |
|---|---|
| Fi del llinatge (sense descendència) | Game over |
| Jugador tria "acabar partida" des del menú | Voluntari |
| (Futur) Completar l'era Futurista | Victòria |

En tots els casos amb almenys 1 generació completada, es mostra la pantalla final.

---

## Pantalla Final — Estructura

### Bloc 1: Obituari del llinatge

```
╔══════════════════════════════════════╗
║  ELS [NOM DINÀSTIC]                  ║
║  [Era inicial] → [Era final]         ║
║  [N] generacions · [N] anys de llegat║
╚══════════════════════════════════════╝
```

El nom dinàstic es genera automàticament a partir del nom del primer personatge i un sufix cultural d'era: *"Els Ferrer de la Roca"*, *"La Casa Aldric"*.

### Bloc 2: Barres de llegat

```
Eres dominades          ████████░░  4 / 6
Herència de coneixement ███████░░░  14 / 20 descobriments
Riquesa màxima          █████░░░░░  4.200 monedes
Fites especials         🏛️ 🔥 ⚔️ ░ ░
Generacions de sang     ████░░░░░░  4 generacions
```

### Bloc 3: Títol de llegat (narratiu)

Calculat a partir del perfil dominant de joc:

| Perfil dominant | Títol |
|---|---|
| Riquesa alta | "Mercaders del Temps" |
| Reputació alta | "Constructors d'Imperis" |
| Coneixement alt | "La Línia dels Savis" |
| Supervivència extrema | "Els Que Resisteixen" |
| Moltes fites | "Llegenda Viva" |
| Equilibrat | "La Família Completa" |

### Bloc 4: Puntuació numèrica

```
PUNTUACIÓ FINAL
──────────────────────────────
Generacions:     4 × 500     = 2.000
Eres travessades: 4 × 800    = 3.200
Coneixements:   14 × 100     = 1.400
Riquesa màxima:  4.200 / 10  =   420
Fites especials: 3 × 300     =   900
Reputació final: 85 × 10     =   850
──────────────────────────────
TOTAL                          8.770
```

---

## Fites especials (Wonders)

Anàleg a les meravelles de Civilization. Desbloqueig únic per partida.

| ID | Nom | Condició | Icona | Punts |
|---|---|---|---|---|
| `first_fire` | Mestre del Foc | Descobrir foc a prehistòria | 🔥 | 300 |
| `dynasty_founder` | Fundador de Dinastia | Arribar a generació 3 | 🏛️ | 500 |
| `great_merchant` | Gran Mercader | Riquesa > 1000 en una vida | 💰 | 400 |
| `philosopher` | Filòsof | 5 coneixements en una vida | 📜 | 350 |
| `tribe_elder` | Ancià de la Tribu | Liderar tribu | 👑 | 300 |
| `war_hero` | Heroi de Guerra | Guanyar 3 confrontacions | ⚔️ | 350 |
| `peaceful_legacy` | Llegat Pacífic | 0 confrontacions en tota la partida | 🕊️ | 400 |
| `long_bloodline` | Sang Llarga | 6+ generacions | 🌳 | 600 |
| `era_traveler` | Viatger del Temps | Completar 4+ eres | ⏳ | 500 |

Les fites apareixen com a icones a la pantalla final i a l'arbre genealògic (al node de la generació que les va assolir).

---

## Arbre Genealògic

### Layout

```
Era 1           Era 2           Era 3
[Brac]──────►[Arn]──────►[Mira]
               │
               ├──►[?Elsa]    ← no escollida
               └──►[?Dali]    ← no escollida
```

- **Nodes horitzontals**: una generació per columna
- **Línia principal**: sempre visible, color de l'era
- **Fills no escollits**: nodes grisos amb `?` + virtut narrativa en tap
- **Branques tallades** (mort sense fills): node `✗` fosc
- **Scroll horitzontal** per navegar totes les generacions
- **Zoom out** per veure l'arbre complet

### Node de personatge

Tap en qualsevol node obre una mini-carta:

```
┌─────────────────────┐
│ [retrat]            │
│ Arn · Prehistòria   │
│ 34 anys             │
│ "Caçador llegendari"│
│                     │
│ 🔥 ⚔️              │  ← fites assolides
│ Causa de mort:      │
│ Hivern dur (cicle 9)│
└─────────────────────┘
```

### Exportació

Botó "Compartir arbre" → genera imatge plana de tot l'arbre genealògic amb logo del joc. Optimitzat per a stories d'Instagram (portrait) i Twitter (landscape).

---

## Nomenclatura dinàstica

El nom de la dinastia es construeix al primer fill:

```
[Nom_personatge_1] + [sufix_cultural_era_1]
```

Sufixos per era:
- Prehistòria: "de la Roca", "del Foc", "de la Tribu"
- Antiguitat: "d'Anatòlia", "del Delta", "de la Ruta"
- Medieval: "de la Torre", "del Castell", "del Gremio"
- Industrial: "& Fills", "Industries", "del Vapor"
- Moderna: família sense sufix formal (cognom evolucionat)
