# SPÍN — Game Design Document

**Versió:** 1.1 (MVP — Grup 1 complet, Grups 2-3 en esquelet)
**Data:** 2026-07-19
**Estat:** Validat per Marc. Decisions de disseny del §14 (nivell 6, nivell 7, acció Esperar, immunitat a espines) aprovades.
**Canvis v1.1:** feedback de sortida sense 💎 (§9.4, §12) · tutorial contextual (§9.5) · noms dels nivells 1-7 i textos de tutorial en 3 idiomes (§11.1) · validacions marcades al §14.

Aquest document és la font única de veritat per a la implementació. Claude Code ha d'implementar exactament el que s'hi especifica. Les seccions marcades com a **TBD** no s'implementen al prototip.

---

## 1. Visió general

| Camp | Valor |
|---|---|
| Nom | **Spín** (amb accent) |
| Gènere | Puzzle per torns, casual, trap-em-up |
| Referent mecànic | Boomer's Adventure in ASMIK World (Game Boy, 1990) |
| Referent de negoci/estructura | Candy Crush (nivells, grups, progressió) |
| Referent de to | Angry Birds / Pokémon (personatges per a nens, joc per a adults) |
| Plataforma | iOS + Android |
| Engine | Unity |
| Idiomes | Català (ca), Castellà (es), Anglès (en) — des del dia 1 |
| Abast MVP | 20 nivells (3 grups). Prototip (Fase 2): nivells 1-7 |

**Pitch:** Un eriçó adorable es mou per galeries subterrànies, esquiva depredadors, col·loca espines per blocar-los, troba una peça de puzzle amagada i escapa. Torns purs: el jugador pensa, el món respon. Zero pressió de temps real.

---

## 2. Personatge i narrativa

**Spín** és un eriçó super fluffy i rodó. L'antiSonic: lent, rodó, adorable.

- Forma quasi esfèrica, pilota de pèl
- Púes subtils al dors (no agressives)
- Ulls grans i expressius
- Paleta natural: marrons, beix, taronges suaus

**Narrativa:** Spín viu sota terra. Es mou per galeries preexistents (no excava el terreny), i puntualment trenca murs prims per obrir passos. És un animaló intentant sobreviure, no un heroi. Els depredadors (teixons, guineus, serps) el persegueixen; ell només té paciència, astúcia i les seves espines.

**Art del prototip:** formes simples o emojis (els de la taula d'elements §4). Art final: Fase 4.

---

## 3. La graella

- Mida fixa: **7×7 caselles**
- Coordenades: columnes **A-G** (esquerra→dreta), files **1-7** (dalt→avall). Casella = lletra+número (ex. `D4`)
- El perímetre (fila 1, fila 7, columnes A i G) sol ser bloc fix, però cada nivell ho defineix lliurement
- Moviment sempre ortogonal (4 direccions). No hi ha diagonals per a cap entitat

---

## 4. Elements del mapa

| Símbol | Char (level data) | Element | Transitable per Spín | Transitable per enemics | Notes |
|---|---|---|---|---|---|
| ⬛ | `#` | Bloc fix | No | No | Indestructible |
| 🟫 | `%` | Mur prim | No (fins trencat) | No | Spín el pot trencar (acció). En trencar-se → `.` permanentment |
| ⬜ | `.` | Galeria oberta | Sí | Sí | |
| 🦔 | `S` | Spawn de Spín | — | — | Exactament 1 per nivell |
| 💎 | (metadata) | Peça de puzzle | Sí | Sí | **Invisible al jugador.** Posició fixa definida al level data. Spín la recull automàticament en entrar a la casella. Els enemics no hi interactuen |
| 🚪 | `E` | Sortida | Sí | Sí | Casella transitable sempre. La victòria només es dispara si Spín hi entra (o hi és) amb el 💎 |
| 🌵 | `*` | Espines silvestres | Sí (les recull) | No (reboten) | Spín les recull automàticament en entrar-hi (+1 inventari); la casella passa a `.` |
| 🌵 | (runtime) | Espines col·locades | **Sí** (immune) | No (reboten) | Permanents. Vegeu R10 |
| 🦡 | (metadata) | Teixó | — | — | Enemic tipus 1 |
| 🦊 | (metadata) | Guineu | — | — | Enemic tipus 2 (TBD, grup 2) |
| 🐍 | (metadata) | Serp | — | — | Enemic tipus 3 (TBD, grup 3) |

Els enemics i el 💎 es defineixen com a **metadata**, no com a chars del grid (necessiten atributs: eix, direcció inicial, ordre).

---

## 5. Regles del joc (normativa numerada)

Aquestes regles són la referència d'implementació. Qualsevol conflicte amb altres seccions es resol a favor d'aquesta secció.

**Accions de Spín (una i només una per torn):**

- **R1 — Moure:** Spín es desplaça 1 casella ortogonal a una casella transitable per ell (`.`, sortida, espines col·locades, espines silvestres, casella amb 💎).
- **R2 — Trencar mur:** si hi ha un `%` ortogonalment adjacent, Spín el pot trencar. El mur passa a `.` permanentment. Spín no es mou.
- **R3 — Col·locar espines:** si inventari > 0, Spín col·loca 1 espina en una casella ortogonalment adjacent que sigui `.` i estigui lliure (sense enemic, sense espines prèvies, i que no sigui la sortida). Spín no es mou. Inventari −1.
- **R4 — Esperar:** Spín passa el torn sense fer res. *(Acció afegida al GDD: necessària per resoldre paritats de moviment contra enemics oscil·lants — sense ella hi ha situacions legals irresolubles. Vegeu §14.)*

**Recollida:**

- **R5:** En entrar a una casella amb 💎, Spín el recull automàticament (obligatori, sense acció extra). El HUD ho indica.
- **R6:** En entrar a una casella amb espines silvestres, Spín les recull automàticament. +1 a l'inventari (l'inventari és un comptador, sense límit al MVP).

**Espines:**

- **R7:** Les espines col·locades són **permanents**. No es poden recollir de nou ni destruir.
- **R8:** Tota casella amb espines (silvestres o col·locades) és un obstacle per als enemics: hi reboten (R14).
- **R9:** Les espines silvestres del disseny de nivell es comporten com a obstacle per als enemics mentre no hagin estat recollides.
- **R10:** Spín és **immune** a les espines: pot travessar i aturar-se en caselles amb espines col·locades. (És un eriçó — coherència temàtica; a més evita softlocks per auto-tancament.)

**Victòria i derrota:**

- **R11 — Derrota:** Spín és atrapat si (a) un enemic entra a la casella de Spín, o (b) Spín entra a la casella d'un enemic. En qualsevol dels dos casos: game over immediat; cap altra entitat mou.
- **R12 — Victòria:** Spín té el 💎 i és a la casella de la sortida. Es comprova immediatament després de l'acció de Spín. La derrota (R11b) es comprova abans que la victòria.
- **R13:** El 💎 mai es col·loca a la casella de la sortida ni al spawn de Spín (regla de validació de nivells).

**Moviment dels enemics:**

- **R14 — Rebot:** un enemic de patrulla intenta moure's 1 casella en la seva direcció actual. Si la casella de destí és bloc fix, mur prim, espines, un altre enemic, o fora de la graella → inverteix la direcció i intenta moure's immediatament en la nova direcció dins del mateix torn. Si també està blocada → es queda quiet aquest torn (mantenint l'última direcció, i ho reintenta cada torn).
- **R15:** Si la casella de destí conté Spín, l'enemic hi entra → captura (R11a). Spín **no** és un obstacle de rebot.
- **R16:** Els enemics travessen amb normalitat la casella de la sortida i la casella del 💎 (sense cap efecte).
- **R17:** L'ordre de moviment dels enemics és fix i es defineix al level data (`order`). Es processa seqüencialment: cada enemic veu les posicions ja actualitzades dels enemics anteriors del mateix torn.

**Seqüència de torn (estricta):**

```
1. INPUT       → el jugador tria acció (R1-R4); només s'accepten accions legals
2. SPÍN ACTUA  → resol R5/R6 si escau
3. CHECK       → derrota (R11b)? → GAME OVER
              → victòria (R12)? → NIVELL SUPERAT
4. ENEMIC 1    → mou (R14-R16) → derrota (R11a)? → GAME OVER (la resta no mou)
5. ENEMIC 2    → ídem
   ...         → (tots els enemics en ordre R17)
6. NOU TORN    → tornar a 1
```

**Meta:**

- **R18 — Reiniciar:** el jugador pot reiniciar el nivell en qualsevol moment, sense límit ni cost (MVP). No hi ha undo.
- **R19 — Determinisme:** al Grup 1 no hi ha cap element aleatori. Mateixa seqüència d'inputs ⇒ mateix resultat, sempre.

---

## 6. Enemics

### 6.1 Teixó 🦡 (Grup 1 — especificació completa)

| Atribut | Valor |
|---|---|
| Moviment | Patrulla de patró fix: eix `horizontal` o `vertical` (per nivell) |
| Velocitat | 1 casella/torn |
| Direcció inicial | Definida per nivell (`left/right/up/down`, coherent amb l'eix) |
| Rebot | Segons R14. Només rebota contra obstacles: no hi ha límits de patrulla invisibles |
| Murs | No en trenca cap |
| Blocat per espines | Si queda tancat, hi queda **permanentment** (segueix reintentant cada torn, R14) |
| Màxim per nivell (Grup 1) | 2 |

### 6.2 Guineu 🦊 (Grup 2 — **TBD**, no implementar al prototip)

Decisió pendent de Marc. Proposta preliminar per discutir: perseguidora amb pathfinding BFS sobre caselles obertes, 1 casella/torn, tria sempre el pas que redueix la distància de camí real a Spín; si no hi ha camí, espera. No trenca murs, rebota en espines (les espines tallen la seva ruta). Paràmetres oberts: rang de detecció (tot el mapa vs radi), desempat de rutes.

### 6.3 Serp 🐍 (Grup 3 — **TBD**, no implementar al prototip)

Decisió pendent de Marc. Proposta preliminar per discutir: 2 caselles/torn seguint túnels, comportament de "corrent" pels passadissos, tria pseudo-aleatòria determinista a les cruïlles (seed per nivell, per mantenir R19 o relaxar-lo conscientment al Grup 3).

**Nota d'arquitectura:** implementar el moviment enemic com a estratègia intercanviable (`IMovementStrategy`: `PatrolStrategy` ara; `ChaseStrategy` i `TunnelStrategy` després) perquè afegir guineu i serp no toqui el nucli.

---

## 7. Estructura de nivells i meta-progressió

### 7.1 Grups

| Grup | Nivells | Nom provisional (clau i18n) | Enemics |
|---|---|---|---|
| 1 | 1-7 | "Patapam!" (`group.1.name`) | Teixons |
| 2 | 8-14 | TBD (`group.2.name`) | Guineus + teixons |
| 3 | 15-20 | TBD (`group.3.name`) | Serps + guineus + teixons |

Tots els noms (grups i nivells) van per claus de traducció. Mai hardcodejats.

### 7.2 Meta-progressió: el puzzle

- Cada grup té una il·lustració (el "puzzle") dividida en tantes peces com nivells té el grup (7/7/6).
- Superar el nivell *n* del grup revela la peça *n*.
- Completar tots els nivells del grup completa el puzzle (pantalla de celebració).
- MVP: imatge placeholder per al puzzle del Grup 1. Art final: Fase 4.
- La progressió es desa localment (vegeu §11).

### 7.3 Desbloqueig

Nivells estrictament seqüencials: el nivell *n+1* es desbloqueja en superar el *n*. El nivell 1 comença desbloquejat.

---

## 8. Nivells 1-7 (Grup 1 — "Patapam!")

Convencions: el 💎 s'indica aquí a la fitxa (mai es mostra al jugador). Grids en notació d'emojis per llegibilitat; el level data canònic és el JSON de §10.

### Nivell 1 — Moviment pur

```
     A  B  C  D  E  F  G
  1  ⬛ ⬛ ⬛ ⬛ ⬛ ⬛ ⬛
  2  ⬛ 🦔 ⬜ ⬜ ⬜ ⬜ ⬛
  3  ⬛ ⬜ ⬛ ⬛ ⬛ ⬜ ⬛
  4  ⬛ ⬜ ⬜ ⬜ ⬜ ⬜ ⬛
  5  ⬛ ⬜ ⬛ ⬛ ⬛ ⬜ ⬛
  6  ⬛ ⬜ ⬜ ⬜ ⬜ 🚪 ⬛
  7  ⬛ ⬛ ⬛ ⬛ ⬛ ⬛ ⬛
```

- **💎:** `D4` · **Enemics:** cap · **Espines:** cap
- **Ensenya:** moure's i entendre que el 💎 està amagat i la porta no s'obre sense ell.
- **Solució esperada:** explorar; en passar per la fila 4 central es recull el 💎; sortir per `F6`.

### Nivell 2 — Trencar murs

```
     A  B  C  D  E  F  G
  1  ⬛ ⬛ ⬛ ⬛ ⬛ ⬛ ⬛
  2  ⬛ 🦔 ⬜ ⬜ ⬜ ⬜ ⬛
  3  ⬛ 🟫 ⬛ ⬛ ⬛ 🟫 ⬛
  4  ⬛ ⬜ ⬜ ⬜ ⬜ ⬜ ⬛
  5  ⬛ ⬜ ⬛ ⬛ ⬛ ⬜ ⬛
  6  ⬛ ⬜ ⬜ ⬜ ⬜ 🚪 ⬛
  7  ⬛ ⬛ ⬛ ⬛ ⬛ ⬛ ⬛
```

- **💎:** `C6` · **Enemics:** cap · **Espines:** cap
- **Ensenya:** l'acció de trencar mur (`B3` o `F3`, tria lliure).
- **Solució esperada:** trencar un mur, baixar, recollir el 💎 a la fila 6, sortir per `F6`.

### Nivell 3 — Primer teixó (esquivar)

```
     A  B  C  D  E  F  G
  1  ⬛ ⬛ ⬛ ⬛ ⬛ ⬛ ⬛
  2  ⬛ 🦔 ⬜ ⬜ ⬜ ⬜ ⬛
  3  ⬛ ⬜ ⬛ ⬛ ⬛ ⬜ ⬛
  4  ⬛ ⬜ ⬜ 🦡 ⬜ ⬜ ⬛
  5  ⬛ ⬜ ⬛ ⬛ ⬛ ⬜ ⬛
  6  ⬛ ⬜ ⬜ ⬜ ⬜ 🚪 ⬛
  7  ⬛ ⬛ ⬛ ⬛ ⬛ ⬛ ⬛
```

- **💎:** `C4` (dins la fila del teixó — obliga a entrar-hi) · **Espines:** cap
- **Enemics:** teixó a `D4`, horitzontal, direcció inicial `left`, patrulla `B4↔F4` (rebota als blocs `A4`/`G4`)
- **Ensenya:** observar el patró i calcular el moment d'entrar. Introdueix l'acció Esperar com a eina de timing.
- **Solució esperada:** baixar per la columna B, esperar el pas del teixó, entrar a `C4`, recollir, retirar-se i baixar per B fins a la fila 6 i sortir.

### Nivell 4 — Primeres espines (blocar)

```
     A  B  C  D  E  F  G
  1  ⬛ ⬛ ⬛ ⬛ ⬛ ⬛ ⬛
  2  ⬛ 🦔 ⬜ ⬜ ⬜ ⬜ ⬛
  3  ⬛ ⬜ ⬛ ⬛ ⬛ ⬜ ⬛
  4  ⬛ 🌵 ⬜ 🦡 ⬜ ⬜ ⬛
  5  ⬛ ⬜ ⬛ ⬛ ⬛ ⬜ ⬛
  6  ⬛ ⬜ ⬜ ⬜ ⬜ 🚪 ⬛
  7  ⬛ ⬛ ⬛ ⬛ ⬛ ⬛ ⬛
```

- **💎:** `D4` (al mig de la patrulla — obliga a neutralitzar el teixó) · **Espines silvestres:** `B4`
- **Enemics:** teixó a `D4`, horitzontal, direcció inicial `left`. Mentre `B4` té espines silvestres, patrulla `C4↔F4`; quan Spín les recull, la patrulla s'estén a `B4↔F4`
- **Ensenya:** recollir espines, col·locar-les per confinar el teixó, i que Spín pot caminar per sobre de les espines. Primera vegada que el jugador **actua** en lloc d'esperar.
- **Solució esperada:** baixar per B i recollir les espines a `B4`; retirar-se un torn si cal; col·locar l'espina a `C4` quan el teixó és a l'est; esperar que el teixó reboti cap a l'est; entrar per sobre de l'espina fins a `D4` (💎) i sortir per l'oest abans que torni; baixar per B fins a `F6`.

### Nivell 5 — Dos teixons, una espina (triar)

```
     A  B  C  D  E  F  G
  1  ⬛ ⬛ ⬛ ⬛ ⬛ ⬛ ⬛
  2  ⬛ 🦔 ⬜ ⬜ ⬜ ⬜ ⬛
  3  ⬛ ⬜ ⬛ ⬛ ⬛ ⬜ ⬛
  4  ⬛ ⬜ ⬜ 🌵 ⬜ ⬜ ⬛
  5  ⬛ 🦡 ⬛ ⬛ ⬛ 🦡 ⬛
  6  ⬛ ⬜ ⬜ ⬜ ⬜ 🚪 ⬛
  7  ⬛ ⬛ ⬛ ⬛ ⬛ ⬛ ⬛
```

- **💎:** `D6` · **Espines silvestres:** `D4` (una sola)
- **Enemics (ordre):** 1) teixó `B5`, vertical, inicial `down` (patrulla tota la columna B oberta: `B2↔B6`); 2) teixó `F5`, vertical, inicial `down` (patrulla `F2↔F6`, inclosa la casella de sortida)
- **Ensenya:** recurs escàs — una espina, dos passos vigilats. Tancar-ne un i esquivar l'altre. Truc avançat: col·locar l'espina *dins* el pas (ex. `B5` quan el teixó és a `B6`) tanca el teixó al fons i deixa el pas net per a Spín (immune).
- **Solució esperada:** recollir l'espina a `D4`, blocar un dels dos corredors, creuar-lo per sobre de l'espina, recollir el 💎 a `D6` i sortir per `F6` calculant el pas del segon teixó (que trepitja la porta periòdicament).

### Nivell 6 — Trencar el mur t'exposa

```
     A  B  C  D  E  F  G
  1  ⬛ ⬛ ⬛ ⬛ ⬛ ⬛ ⬛
  2  ⬛ 🦔 ⬜ ⬜ ⬜ ⬜ ⬛
  3  ⬛ ⬛ ⬛ 🌵 ⬛ 🦡 ⬛
  4  ⬛ ⬜ ⬜ ⬜ ⬛ ⬜ ⬛
  5  ⬛ ⬛ ⬛ 🟫 ⬛ ⬜ ⬛
  6  ⬛ ⬜ ⬜ ⬜ ⬛ ⬜ ⬛
  7  ⬛ 🦡 ⬜ ⬜ ⬜ 🚪 ⬛
```

- **💎:** `C6` · **Espines silvestres:** `D3`
- **Enemics (ordre):** 1) teixó `F3`, vertical, inicial `down` (patrulla `F2↔F7`, inclosa la porta); 2) teixó `B7`, horitzontal, inicial `right` (patrulla `B7↔F7` — sí, arriba a trepitjar la porta)
- **Ensenya:** conseqüències de trencar un mur. La zona superior (files 2-4 oest) és segura; el mur `D5` és l'únic pas cap avall, i en travessar-lo Spín queda exposat a les dues patrulles que dominen la zona inferior i la porta.
- **Solució esperada:** baixar per `D2→D3` (recollir espina) → `D4`; trencar `D5`; baixar a `D6` i recollir el 💎 a `C6`; usar l'espina per confinar el teixó de la fila 7 (ex. col·locar-la a `D7`/`E7` quan és a l'oest) i creuar per sobre; entrar a `F7` en el forat de la patrulla vertical.

### Nivell 7 — Boss del grup: tot combinat

```
     A  B  C  D  E  F  G
  1  ⬛ ⬛ ⬛ ⬛ ⬛ ⬛ ⬛
  2  ⬛ 🦔 ⬜ ⬜ ⬛ 🦡 ⬛
  3  ⬛ ⬛ ⬛ 🌵 ⬛ ⬜ ⬛
  4  ⬛ ⬜ ⬜ ⬜ ⬛ ⬜ ⬛
  5  ⬛ 🟫 ⬛ 🟫 ⬛ ⬜ ⬛
  6  ⬛ ⬜ ⬜ ⬜ 🟫 ⬜ ⬛
  7  ⬛ 🦡 ⬜ ⬜ ⬜ 🚪 ⬛
```

- **💎:** `D7` (en ple territori del teixó de la fila 7) · **Espines silvestres:** `D3` (una sola)
- **Enemics (ordre):** 1) teixó `F2`, vertical, inicial `down` (patrulla `F2↔F7`); 2) teixó `B7`, horitzontal, inicial `right` (patrulla `B7↔F7`)
- **Ensenya:** combinar-ho tot amb decisions reals: **dos** murs prims per baixar (`B5` o `D5`, tria de ruta), un mur drecera opcional (`E6`, dona accés directe a la columna F), una sola espina per a dos teixons, el 💎 dins la zona patrullada i la porta trepitjada per les dues patrulles.
- **Solució esperada (una de diverses):** recollir l'espina a `D3`; trencar `D5` i baixar; quan el teixó de la fila 7 és a l'est, col·locar l'espina per confinar-lo; recollir el 💎 a `D7` caminant per sobre l'espina; trencar `E6` o seguir per la fila 7, i entrar a `F7` sincronitzant-se amb la patrulla vertical.

---

## 9. UI/UX i controls

### 9.1 Input (mobile, tàctil)

Principi: gestos per a l'acció freqüent (moure), botons per a les esporàdiques. Cap gest multi-dit.

| Gest | Acció |
|---|---|
| Swipe en qualsevol punt de la pantalla (amunt/avall/esquerra/dreta) | Moure (R1) — **input principal** |
| Tap en casella oberta adjacent | Moure (R1) — equivalent al swipe, conviuen |
| Tap en mur prim adjacent | Trencar mur (R2) |
| Tap al botó 🌵 del HUD → tap en casella adjacent vàlida | Col·locar espines (R3). Les caselles vàlides es ressalten. Tap fora / tap de nou al botó cancel·la |
| Tap al botó ⏳ del HUD | Esperar (R4) |
| Swipe cap a direcció blocada / tap il·legal | Cap efecte (feedback subtil: shake o so suau) |

### 9.2 HUD del nivell

- Comptador d'espines a l'inventari (🌵 ×n) — també és el botó de col·locar
- Botó Esperar (⏳)
- Indicador de 💎: buit fins que es recull; en recollir-lo, animació + estat "tens la peça!" i la porta canvia visualment a oberta
- Botó de pausa → menú: Reprendre / Reiniciar nivell / Sortir al mapa / Opcions
- Comptador de torns (informatiu; sense límit)

### 9.3 Pantalles

1. **Main menu:** logo, Jugar, Opcions (idioma, so on/off), crèdits
2. **Mapa de grups/nivells:** el puzzle del grup com a fons; cada peça = un nivell (revelada si superat, silueta si no; cadenat si blocat)
3. **Joc** (§9.2)
4. **Victòria:** peça del puzzle revelant-se + Continuar
5. **Derrota:** missatge suau i simpàtic (mai punitiu — Spín es fa una bola i fuig) + Reintentar / Sortir
6. **Puzzle complet** (fi de grup): il·lustració sencera + celebració

### 9.4 Feedback essencial

- Moviment dels enemics animat seqüencialment (l'ordre de torn ha de ser llegible)
- Rebot d'enemic contra espines: animació clara (l'espina "punxa")
- Recollir 💎: moment de sorpresa (està amagat!) — so + partícules
- Trencar mur: animació de runa + so
- **Sortida sense 💎:** quan Spín entra a la casella de la sortida sense la peça → vibració curta del dispositiu (haptic lleuger), so de rebuig suau i animació: la porta trontolla i una silueta de 💎 parpelleja sobre seu durant ~1 segon. Sense text (el tutorial ho explica la primera vegada, §9.5). Es repeteix a cada intent

### 9.5 Tutorial contextual

Sistema lleuger i no intrusiu per introduir cada mecànica la primera vegada que apareix. Cap popup modal, cap pantalla de tutorial separada.

**Principis:**

- Format: **bocadill (tooltip) ancorat a l'element rellevant**, amb un highlight de pols suau (pulse) sobre l'element o botó. Text d'una sola línia curta
- Mai bloca l'input: el jugador pot ignorar-lo i jugar
- Es tanca amb qualsevol tap o en fer qualsevol acció; màxim un bocadill visible alhora (si n'hi ha més d'un pendent, es mostren en cua)
- Cada tip es mostra **una sola vegada per partida desada** (flags a la persistència, §11.2)
- Trigger per esdeveniment, no per temporitzador: el tip apareix just quan és rellevant

**Tips del Grup 1:**

| Nivell | Mecànica | Trigger | Clau i18n | Àncora |
|---|---|---|---|---|
| 1 | Moure's | Inici de nivell | `tut.move` | Spín |
| 1 | Porta tancada | Spín entra a la sortida sense 💎 (1a vegada) | `tut.exit_locked` | Porta |
| 1 | 💎 recollit | Spín recull el primer 💎 | `tut.gem_found` | Spín |
| 2 | Mur prim | Inici de nivell | `tut.wall` | Mur prim més proper a Spín |
| 3 | Teixó | Inici de nivell | `tut.badger` | Teixó |
| 3 | Esperar | En tancar-se `tut.badger` | `tut.wait` | Botó ⏳ (highlight) |
| 4 | Espines silvestres | Inici de nivell | `tut.spikes_pickup` | Espines |
| 4 | Col·locar espines | Spín recull espines (1a vegada) | `tut.spikes_place` | Botó 🌵 (highlight) |

**Nivells 5-7: cap tip.** No hi ha elements nous; el disseny dels nivells ja fa la feina. El tutorial acaba al nivell 4 i el jugador queda sol amb el puzzle — intencionat.

---

## 10. Format de dades de nivells

Un fitxer JSON per nivell a `StreamingAssets/Levels/` (o ScriptableObjects generats des de JSON — a criteri de Claude Code, però el JSON és el format d'autoria).

```json
{
  "id": 3,
  "group": 1,
  "nameKey": "level.3.name",
  "grid": [
    "#######",
    "#S....#",
    "#.###.#",
    "#.....#",
    "#.###.#",
    "#....E#",
    "#######"
  ],
  "diamond": "C4",
  "enemies": [
    { "order": 1, "type": "badger", "start": "D4", "axis": "horizontal", "initialDir": "left" }
  ]
}
```

**Especificació:**

- `grid`: 7 strings de 7 chars. Fila 1 = primer string. Chars: `#` bloc fix, `%` mur prim, `.` galeria, `S` spawn, `E` sortida, `*` espines silvestres
- `diamond`: coordenada `[A-G][1-7]`. Ha de ser una casella accessible, ≠ spawn, ≠ sortida (R13)
- `enemies[]`: `order` (1..n, únic), `type` (`badger` | `fox` | `snake`), `start` (coordenada sobre galeria), `axis` (`horizontal`|`vertical`), `initialDir` coherent amb l'eix
- Validacions en càrrega (fail fast amb error clar): mida 7×7, exactament 1 `S` i 1 `E`, `diamond` vàlid i accessible, enemics sobre `.`, nivell resoluble marcat com a revisat manualment (la validació automàtica de resolubilitat és opcional, no MVP)

**Els 7 nivells del Grup 1 s'han de crear exactament segons les fitxes de §8** (grids, diamants, espines i enemics inclosos).

---

## 11. Localització i persistència

### 11.1 Localització

- 3 idiomes: `ca` (per defecte si la locale del dispositiu és ca), `es`, `en`. Fallback: `en`
- Un fitxer per idioma: `StreamingAssets/Localization/{ca,es,en}.json` amb parelles clau→text pla
- **Cap literal de text al codi ni a prefabs.** Tot per clau. Inclou noms de nivells, grups, botons, missatges de victòria/derrota, opcions
- Selector d'idioma a Opcions, canvi en calent

Claus i textos definits (Claude Code ha de crear els 3 fitxers complets):

**Noms de grup i nivells:**

| Clau | ca | es | en |
|---|---|---|---|
| `app.name` | Spín | Spín | Spín |
| `group.1.name` | Patapam! | ¡Patapam! | Patapam! |
| `level.1.name` | Belluga't! | ¡En marcha! | Get Moving! |
| `level.2.name` | Crac! | ¡Crac! | Crack! |
| `level.3.name` | Ui, un teixó! | ¡Uy, un tejón! | Uh-oh, a Badger! |
| `level.4.name` | Punxa-punxa | Pincha-pincha | Prickle-Prickle |
| `level.5.name` | Només en tinc una! | ¡Solo tengo una! | Only Got One! |
| `level.6.name` | Compte a baix! | ¡Cuidado ahí abajo! | Watch Out Below! |
| `level.7.name` | El gran Patapam | El gran Patapam | The Big Patapam |

**Textos del tutorial (§9.5):**

| Clau | ca | es | en |
|---|---|---|---|
| `tut.move` | Llisca per moure't per les galeries | Desliza para moverte por las galerías | Swipe to move through the tunnels |
| `tut.exit_locked` | La porta no s'obre... Falta la peça del puzzle! | La puerta no se abre... ¡Falta la pieza del puzle! | The door won't open... You need the puzzle piece! |
| `tut.gem_found` | Has trobat la peça! Ara, cap a la porta! | ¡Has encontrado la pieza! ¡Ahora, a la puerta! | You found the piece! Now head for the door! |
| `tut.wall` | Un mur prim! Toca'l per trencar-lo | ¡Un muro fino! Tócalo para romperlo | A thin wall! Tap it to break it |
| `tut.badger` | Un teixó! Sempre es mou igual. Observa'l bé... | ¡Un tejón! Siempre se mueve igual. Obsérvalo bien... | A badger! It always moves the same way. Watch it closely... |
| `tut.wait` | Amb ⏳ pots esperar sense moure't | Con ⏳ puedes esperar sin moverte | Use ⏳ to wait without moving |
| `tut.spikes_pickup` | Espines! Passa-hi per sobre per recollir-les | ¡Espinas! Pasa por encima para recogerlas | Spikes! Walk over them to pick them up |
| `tut.spikes_place` | Col·loca-les amb 🌵 per tallar el pas als enemics. A tu no et punxen! | Colócalas con 🌵 para cortar el paso a los enemigos. ¡A ti no te pinchan! | Place them with 🌵 to block enemies. They can't hurt you! |

**Claus restants** (textos a proposar per Claude Code al primer commit, marcats per a revisió de Marc):

```
ui.play / ui.options / ui.language / ui.sound / ui.resume / ui.restart / ui.exit / ui.continue / ui.retry / ui.wait
hud.spikes / hud.turns / hud.diamond_found
msg.victory / msg.defeat / msg.group_complete
```

### 11.2 Persistència local (MVP)

JSON local (Application.persistentDataPath): últim nivell superat, peces revelades per grup, idioma triat, so on/off, tips de tutorial ja mostrats (un flag per clau `tut.*`). Sense backend, sense comptes.

---

## 12. Arquitectura tècnica (guia per a Claude Code)

Alt nivell — Claude Code té llibertat d'implementació mentre respecti això:

- **Model separat de la vista.** L'estat del joc (graella, entitats, inventari, torn) és pur C# testejable sense Unity. La vista (GameObjects, animacions) observa el model
- **`TurnManager`:** màquina d'estats que implementa exactament la seqüència de §5. Cap lògica de torn fora d'aquí
- **`GridModel`:** estat de caselles + consultes (transitable per Spín / per enemic)
- **`IMovementStrategy`** per enemic: `PatrolStrategy` (teixó). Preparat per a `ChaseStrategy` (guineu) i `TunnelStrategy` (serp) sense tocar el nucli
- **`LevelLoader`:** parseja i valida el JSON de §10
- **`LocalizationManager`:** §11.1
- **Determinisme (R19):** cap `Random` al Grup 1
- **Tests:** unit tests del model per a les regles R1-R17 (mínim: rebots, captura bidireccional, ordre de torn, espines, victòria amb/sense 💎). El model pur ho fa trivial

### Criteris d'acceptació del prototip (Fase 2)

1. Els 7 nivells jugables de principi a fi, amb victòria i derrota funcionals
2. Totes les regles R1-R19 implementades i testejades
3. 3 idiomes commutables en calent, zero text hardcodejat
4. Progressió desada (tancar i reobrir l'app conserva l'estat)
5. Mapa de nivells amb peces de puzzle (placeholder)
6. Corre a 60fps en un mòbil mid-range
7. Feedback de sortida sense 💎 implementat: vibració + so de rebuig + porta que trontolla amb silueta de 💎 (§9.4)
8. Tutorial contextual (§9.5) funcional: cada tip apareix un sol cop per partida desada, mai bloca l'input i respecta triggers i àncores de la taula

---

## 13. Pla de projecte

| Qui | Rol |
|---|---|
| Marc | Decisions finals, testing, validació, disseny creatiu |
| Claude Cowork | Disseny de joc, GDD, documentació, planificació |
| Claude Code (Donchito) | Implementació Unity, repositori |

| Fase | Contingut | Estat |
|---|---|---|
| 1 — Disseny | Mecànica core, nivells 1-7, torns, GDD | ✅ (GDD: pendent validació Marc) |
| 2 — Prototip | Unity, art provisional, 7 nivells, 3 idiomes, criteris §12 | ⬜ |
| 3 — Validació | Marc juga, feedback, iteració | ⬜ |
| 4 — Expansió | Nivells 8-20, guineu i serp, art real, so, publicació | ⬜ |

---

## 14. Registre de decisions preses en aquest GDD

Decisions que el resum original no fixava o on contenia contradiccions.

1. **✅ Validat per Marc — Nivell 6 — contradiccions al material original:** el grid proporcionat contradeia la seva descripció (teixó a `E3` segons el text, `F3` segons el grid; `E6` "galeria" segons el text, bloc segons el grid) i el mecanisme "trencar el mur allibera el teixó" és impossible amb aquell layout (el teixó de la columna F no està tancat per res que depengui del mur `D5`). A més, el grid del nivell 6 era **idèntic** al del nivell 7. **Resolució:** es manté el grid original per al nivell 6 i es reinterpreta la lliçó com a *"trencar el mur t'exposa"* (la zona superior és segura; travessar `D5` et posa dins el territori de les dues patrulles). Teixó a `F3` (mana el grid).
2. **✅ Validat per Marc — Nivell 7 redissenyat** perquè no fos un duplicat del 6: `E2` tancat, dos murs prims d'accés (`B5`/`D5`) que forcen una tria, mur drecera `E6`, teixó vertical arrencant a `F2` i 💎 a `D7` dins territori enemic.
3. **✅ Validat per Marc — Acció "Esperar" (R4) afegida.** Sense ella, hi ha paritats de moviment irresolubles contra enemics oscil·lants (fer marxa enrere i tornar sempre suma un nombre parell de torns; esperar-ne un de senar és impossible). És a més una acció natural en un puzzle per torns.
4. **✅ Validat per Marc — Spín és immune a les espines col·locades (R10)** i hi pot caminar per sobre. Temàticament impecable (és un eriçó) i mecànicament necessari: evita auto-softlocks i habilita la jugada elegant de "tancar l'enemic dins el corredor i passar-hi per sobre" (nivells 5-7 en depenen).
5. **Les espines silvestres també fan rebotar els enemics (R9)** mentre no s'han recollit — coherència: espina al tauler = obstacle per a enemics, sempre.
6. **Posicions del 💎 fixades per nivell** al level data (no aleatòries): L1 `D4`, L2 `C6`, L3 `C4`, L4 `D4`, L5 `D6`, L6 `C6`, L7 `D7`. Triades perquè el diamant formi part del repte (dins zones patrullades quan la lliçó ho demana). L'aleatorietat trencaria el disseny didàctic i R19.
7. **La porta és sempre transitable** per a tothom; només dispara la victòria si Spín hi és amb el 💎. Evita casos especials de rebot i permet que les patrulles la trepitgin (tensió a l'endgame dels nivells 5-7).
8. **Captura bidireccional (R11):** Spín entrant en una casella d'enemic també és derrota (no es bloca el moviment). Manté les regles simples i el risc llegible.
9. **Inventari d'espines sense límit** al MVP (al Grup 1 mai n'hi ha més d'una per nivell; el límit es decidirà si cal més endavant).

---

## 15. Decisions obertes (fora d'abast del prototip)

- Comportament exacte de la guineu 🦊 (proposta preliminar a §6.2)
- Comportament exacte de la serp 🐍 (proposta preliminar a §6.3)
- Noms definitius dels grups 2 i 3
- Art i estètica finals (les il·lustracions dels puzzles inclosos)
- Sistema de puntuació / estrelles (candidat natural: nombre de torns)
- Monetització i model de vides/energia (referent Candy Crush; decisió post-validació)
- So i música
