# Bloodline — Prototip HTML/JS

## Hipòtesi

L'eix d'inclinació impulsat per accions crea un bucle de joc auto-dirigit que se sent com una evolució natural del llinatge. Les branques emergeixen de les decisions del jugador al llarg de generacions, no s'escullen.

## Com executar

**Opció 1 — GitHub Pages (recomanat per a testing en mòbil):**
Desplegat automàticament a: [GameLab Pages](https://mespinro-lab.github.io/GameLab/)

**Opció 2 — Local:**
Obre `index.html` directament al navegador (no cal servidor).

## Estat actual

**En actiu** (2026-06-06). Versió jugable completa de l'Era 1 (Prehistòria).

### Sistemes implementats
- Core loop: accions → inclinació → branques → habilitats → noves accions
- 4 branques: Caçador, Recol·lector, Artesà, Místic
- 13 habilitats (branch techs) amb passive_effects
- ~40 accions en 4 zones (Campament, Planes, Bosc, Llar)
- 7 tecnologies universals (foc, eines, art, vestimenta, corda, ceràmica, agricultura)
- Sistema de successió: fills hereten inclinació (100%) i stats (50%)
- Save/load via localStorage (auto-save cada acció)
- Sistema d'events balancejat dinàmicament (positius/negatius)
- Zona Llar: apareix en trobar parella
- Scoring final amb 5 títols de dinastia

### Mecàniques clau (decisions de disseny confirmades)
- **Material (🧠)**: moneda universal generada per TOTES les accions (1-4 per intensitat). No és output d'accions específiques.
- **Inclinació de llinatge**: herència 100% — les branques no s'escullen, s'acumulen generació rere generació.
- **Salut**: base 40 (prehistòria dura). Descoberta del foc: +25% immediat, gens posteriors inicien a 50.
- **Fills**: probabilitat d'èxit basada en salut. Pèrdua d'embaràs possible.
- **Parella**: age gate cicle 5; 5% de fracàs; obre zona Llar.

## Backlog obert

Veure `production/backlog.md`. Items oberts actuals: C-02 (títols), PT-16 (vides llargues).

## Findings (en curs)

- El core loop d'inclinació → branca funciona però els thresholds inicials eren massa alts (ajustats −25%)
- Material universal millora molt la sensació de progrés en cada acció
- Save/load necessari per a testing en mòbil (GitHub Pages)
- Llar zone clarifica la progressió familiar
