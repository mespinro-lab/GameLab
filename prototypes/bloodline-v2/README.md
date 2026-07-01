# Bloodline — Prototip HTML/JS

## Hipòtesi

L'eix d'inclinació impulsat per accions crea un bucle de joc auto-dirigit que se sent com una evolució natural del llinatge. Les branques emergeixen de les decisions del jugador al llarg de generacions, no s'escullen.

## Com executar

**Opció 1 — GitHub Pages (recomanat per a testing en mòbil):**
Desplegat automàticament a: [GameLab Pages](https://mespinro-lab.github.io/GameLab/)

**Opció 2 — Local:**
Obre `index.html` directament al navegador (no cal servidor).

## Estat actual

**En actiu** (2026-06-16). Versió jugable completa de l'Era 1 (Paleolític Superior).

### Contingut implementat

| Element | Nombre |
|---|---|
| Accions totals | 79 (11 base auto-desbloq. + 68 comprables) |
| Tecnologies de branca (branch techs) | 30 |
| Tecnologies universals | 7 |
| Zones del mapa | 5 (Campament, Planes, Bosc, Mercat, Llar) |
| Destreses | 5 |
| Recursos actius | 5 (menjar, salut, token, pedra, eines) |

### Sistemes implementats

- **Core loop**: accions → inclinació → branques → habilitats → noves accions
- **4 branques actives**: Caçador, Recol·lector, Artesà, Místic
- **30 branch techs** amb passive_effects i herència probabilística
- **79 accions** en 4 zones; visibilitat condicionada per inclinació (fade/ocultes)
- **7 tecnologies universals** (foc cicle 10, eines 16, art 36, vestimenta 50, corda 65, ceràmica 80, agricultura 92)
- **5 destreses**: aptituds desbloq. per repetició (llindar configurable)
- **Cadena d'eines**: Recollir Pedra → Tallar Pedra (🪨→⚒️) → Talla Avançada (+30% output eines)
- **Menjar dinàmic**: cap inicial 8, creix fins a 20 amb Assecar Provisions (×3); consum reduïble
- **Recursos persistents**: token (30%), pedra (100%), eines (30%) hereten entre generacions
- **Successió generacional**: fills hereten inclinació (85%) i stats (50%)
- **Sistema d'events** balancejat dinàmicament (positius/negatius per historial)
- **Zona Llar**: apareix en trobar parella; indicador família visible al panell
- **Detall del personatge**: panell complet (stats, inclinació, família, habilitats, destreses)
- **Save/load** via localStorage (auto-save cada acció, sobreviu background-kill mòbil)
- **Scoring final** amb 5 títols de dinastia basats en la inclinació dominant

### Paràmetres clau

| Paràmetre | Valor |
|---|---|
| `ERA_CYCLES` | 100 cicles per era (~5 generacions) |
| `LIFE_EXPECTANCY` | 20 cicles per personatge |
| `STARTING_FOOD` | 4 |
| `FOOD_MAX_START` | 8 (cap. inicial d'emmagatzematge) |
| `FOOD_MAX` | 20 (sostre absolut) |
| `FOOD_UPKEEP` | 2/torn (reduïble fins a 1.1 amb Assecar Provisions) |
| `STARTING_HEALTH` | 30 (pic a 40; +25% immediat en descobrir foc) |
| `HEALTH_POST_FIRE` | 50 (gens posteriors al foc) |
| `INCLINATION_INHERITANCE_RATE` | 85% |
| `STAT_INHERITANCE_RATE` | 50% |
| `DESTRESA_INHERIT_RATE` | 60% |
| `EVENT_TRIGGER_CHANCE` | 60% |
| `INERTIA_FACTOR` | 2.0 |

### Token de compra

El **token (🔵)** és la moneda universal generada per TOTES les accions (quantitat variable per intensitat). No és el menjar — és el token per comprar noves accions (estil Game Dev Tycoon). Persists entre generacions (30% de retenció).

### Explorar els Voltants

Acció generadora d'events, no de stats directes. Quan hi ha zones per descobrir: probabilitat creixent per intents acumulats (20% base +15% per intent). Quan no descobreix: dispara sempre un event aleatori (rati 2:1 positiu/negatiu). `act_escoltar_estrangers` és acció de descoberta de branch techs (pendent fusió).

## Backlog obert

Veure `production/backlog.md`.

## Findings (en curs)

- El core loop inclinació → branca funciona; thresholds ajustats −25% en sessions anteriors
- Token universal millora molt la sensació de progrés per acció
- Cadena pedra→eines aporta decisió real (quant gasto vs acumulo)
- Menjar escàs des del principi (4 inicial) crea tensió autèntica als primers torns
- Assecar Provisions és l'acció que transforma la supervivència → viabilitat
- Llar zone i família al panell clarifiquen la narrativa intergeneracional
- Save/load necessari per testing en mòbil (GitHub Pages)
