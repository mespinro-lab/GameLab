# Bloodline — Brief de la pantalla principal (per a Claude Code)

> Referència visual: `bloodline-v9.html` (mock d'estat **Gen 5 ple**, en ocàs).
> Aquest document descriu **estructura, capes i comportament**, no l'art final.

---

## 0. Objectiu i filosofia

Redissenyar la pantalla principal del prototip actual. Principis que han de quedar implementats:

- **Identitat a dalt, món a sota.** El bloc superior diu "qui ets" (personatge, característiques, coneixement); la resta de pantalla és "on actues" (món + nodes).
- **Supervivència mana.** Menjar i salut sempre visibles i prominents.
- **Els números es veuen, però el que crida és el CANVI.** L'estat en repòs és tranquil; en executar una acció, els deltes salten i les caselles afectades s'encenen. (No amagar números: en un tycoon, veure'ls evolucionar és el premi.)
- **Vida = ambient diegètic.** La mortalitat es comunica pel **color del cel** (fons), no per un número.

---

## 1. Canvis de JOC (no només UI)

- **La reputació desapareix del joc.** S'elimina la mecànica i la UI. Si contribuïa a la puntuació final o a modificar events, cal redistribuir-ho (p. ex. la puntuació final passa a dependre de generacions assolides, branques desbloquejades i destreses). Eliminar `reputation` de l'estat, dels càlculs d'events i de qualsevol vista.

---

## 2. Arquitectura de capes (IMPORTANT)

El fons és **una imatge**, no HTML. Estructurar en capes independents perquè l'art final s'intercanviï sense tocar la lògica:

| Capa | Contingut | Implementació ara (placeholder) | Implementació final |
|------|-----------|----------------------------------|---------------------|
| L0 · Món | Escena de fons (terra, riu, muntanyes) | Gradient/CSS simple o imatge temporal | `world.png` (una imatge) |
| L1 · Cel/Vida | To del cel segons etapa de vida | **Overlay de color** semi-transparent damunt L0 | Possible art per etapa, o capa de cel pròpia |
| L2 · Sol | Sol baix a l'horitzó + posta prevista | Sprite/SVG posicionat | Sprite final |
| L3 · Nodes | Campament, Planes, Bosc, Llar (tappables) | Sprites/botons posicionats en **%** | Sprites finals, coords alineades amb `world.png` |
| L4 · HUD | Bloc d'identitat, vitals, etiquetes, meta, log | DOM/UI | Igual |

**Clau d'implementació:** la imatge de fons s'assigna a una sola variable/asset (`--world-bg` o `<img id="world">`). Canviar-la = una línia. Les coordenades dels nodes en **percentatges**, perquè es mantinguin en posar l'art definitiu (cal dissenyar art i coords junts).

---

## 3. Layout (zones, de dalt a baix)

1. **Barra meta** (sobreposada): esquerra `Partida X/100` (progrés global, discret); dreta `🔵 tokens` + menú `☰`.
2. **Bloc d'identitat** (targeta, 50/50):
   - **Meitat esquerra (jugador):**
     - *A sobre:* característiques **només icona + número** (`💪 3.8 · 🧠 2.5 · 🔗 4.1`). Sense text FOR/ENG/VIN.
     - *A sota:* retrat + nom + `Gen N`.
   - **Meitat dreta (vitals):** `🌾 menjar` i `❤️ salut`, números grans.
3. **Etiquetes de coneixement** (FORA de la targeta, surant sobre el món, just sota): branques + branca en formació + habilitats + destreses.
4. **Món** (capes L0–L3): nodes + magatzem del camp + família.
5. **Log** (sobreposat a baix): últimes accions/events, 1 línia.

---

## 4. Mapping de cada indicador

| Indicador | On viu | Visibilitat | Persistència entre gen. |
|-----------|--------|-------------|--------------------------|
| 🌾 Menjar (actual/màx + ↓consum) | Vitals (dreta) | Sempre, prominent. Palpita si actual < consum | — |
| ❤️ Salut (valor + ↑/↓ del torn) | Vitals (dreta) | Sempre. El delta s'amaga si és 0 | — |
| 💪🧠🔗 Característiques | Capçalera del jugador | Sempre, icona+núm. S'animen en canviar | 50% |
| 🪨 Pedra / ⚒️ Eines | Magatzem discret al Campament | Tènue al món + **s'il·luminen al carrusel** quan una acció els gasta | 100% / 30% |
| Branques | Etiquetes surant | Apareixen en emergir (veure §6) | herència de descobriments |
| Branca en formació | Etiquetes surant | Quan hi ha deriva cap a un eix (veure §6) | — |
| Habilitats / Destreses | Etiquetes surant | Apareixen en descobrir-se | permanents |
| Inclinació (4 eixos crus) | **Fitxa (tap del retrat)** com a radar | No a la pantalla principal | 85% |
| 🔵 Tokens de material | Barra meta | Sempre | 30% |
| Vida / mortalitat | Color del cel + sol | Sempre (veure §5) | — |
| Partida X/100 | Barra meta | Sempre, discret | — |
| ~~Reputació~~ | **Eliminada** | — | — |

---

## 5. Vida i mortalitat (cel + sol)

La vida del personatge **no és un nombre fix de cicles**: depèn de com es jugui (la salut marca la velocitat).

**Color del cel = etapa de vida** (capa L1, overlay de to sobre el fons):

| Etapa | To | Significat |
|-------|----|-----------|
| Albada | rosat/càlid clar | jove |
| Dia | blau clar | plenitud |
| Ocàs | porpra→taronja | envellint |
| Nit | blau fosc/porpra | mort a prop |

Com que el cel és el fons, **mai queda tapat per la UI** — aquesta és la raó del canvi respecte al sol-en-arc anterior.

**Sol baix a l'horitzó** (capa L2, a la franja lliure entre etiquetes i muntanyes): dona la precisió que el color no dona. Posició del sol = progrés de vida; marca de **posta prevista** = on projecta morir al ritme actual. Tap → `~N cicles a aquest ritme`.

**Model (ajustable):**
```
// progrés de vida 0..1 (1 = mort)
incPerCicle = base * agingFactor(edat) * healthPenalty(salut)
//  - agingFactor creix amb l'edat
//  - healthPenalty > 1 quan la salut és baixa  → el cel s'enfosqueix més de pressa
lifeProgress += incPerCicle
ciclesRestants  = (1 - lifeProgress) / incPerCicle   // per a la "posta prevista"
etapaCel        = mapa(lifeProgress → albada|dia|ocàs|nit)
posicioSol      = lifeProgress  // al llarg de l'arc baix
```
Quan `lifeProgress >= 1` → mort → herència (fill segons regles: inclinació 85%, stats 50%, habilitats descobertes).

---

## 6. Branques i evolució cap a branques  ← (punt que cal documentar)

**Eixos d'inclinació → branques** (confirmar el mapatge al joc):
`Impuls → Caçador` · `Intel·lecte → Artesà` · `Espiritualitat → Místic` · `Sociabilitat → Recol·lector`.

Cada acció empeny un o més eixos. Quan un eix supera el seu llindar, **emergeix** la branca corresponent.

**Com es mostra a la pantalla principal (a les etiquetes surant):**

- **Branca emergida** = píndola sòlida de color (blau). Es queda allà (és permanent del llinatge).
- **Evolució cap a una possible branca** = **píndola "fantasma" que s'omple**. Mostra el nom de la branca i el % cap al llindar.

**Estats de la píndola en formació:**
```
pct = valorEix / llindarEix
- formant-se   (pct baix)    : contorn discontinu, ompliment parcial
- a prop        (pct ≥ 80%)  : glow suau
- emergeix      (pct ≥ 100%) : "pop" → es torna píndola sòlida; es retira la fantasma
```
- Es mostra la branca de **l'eix amb el pct més alt** encara sense emergir (la deriva dominant) = la "pista suau".
- **Opcional:** si la deriva es reparteix entre dos eixos, mostrar-ne dues fantasma competint (més expressiu, ocupa més). Decidir segons freqüència real.
- El detall complet (els 4 eixos crus, valors i taxes d'herència) viu al **radar de la fitxa** (tap del retrat), no a la vista principal.

**Habilitats** (verd) i **destreses** (groc) també són etiquetes, però són mecàniques diferents de les branques (no surten de la inclinació): apareixen en descobrir-se / per repetició. Mantenir el codi de color per distingir-les.

---

## 7. Feedback de canvi en actuar

En executar una acció (al carrusel del node):
- Els **deltes salten** prop de l'element afectat: `+3 🌾`, `+0.1 🧠`, `⭐ Botànica ▲`.
- La **característica/recurs afectat s'encén** un instant (p. ex. verd) allà on viu.
- Com que les característiques són tocant el retrat, l'evolució es veu just on mires el personatge.

Aquest moment és el cor de la sensació de progrés; no l'estalviïs.

---

## 8. Estat Gen 1 buit (degradació)

El layout ha de funcionar buit, **sense mostrar contenidors buits**:

- Cel = **albada** (personatge jove), sol alt/lent.
- Sense família → **node Llar absent**, sense `👶`.
- Sense branques → cap píndola sòlida; com a molt una **fantasma** quan comença la deriva.
- Sense habilitats/destreses → sense aquelles etiquetes.
- Característiques al valor base; recursos a 0 → magatzem del camp ocult o molt tènue.
- Sempre presents: retrat + nom + vitals (menjar/salut).

Regla general: el que encara no existeix **no apareix** (ni com a "0/—" ni com a caixa buida).

---

## 9. Interaccions / fitxa

- **Tap al retrat / bloc d'identitat** → fitxa completa: radar dels 4 eixos d'inclinació, característiques exactes + taxes d'herència, edat exacta en cicles, detall de família. (Reputació ja no hi és.)
- **Tap a un node** → carrusel d'accions de la zona; els **recursos necessaris s'hi il·luminen**.
- **Tap al sol** → `~N cicles a aquest ritme`.

---

## 10. Notes d'implementació

- Separar **estat de joc** (model) de la **capa de render**. La UI llegeix l'estat; l'estat no sap de píxels.
- To del cel via variable CSS (`--sky-stage`) o classe (`.albada/.dia/.ocas/.nit`) sobre l'overlay L1 — fàcil d'animar en transició d'etapa.
- Coordenades de nodes i sol en **%** respecte al contenidor del món.
- Placeholder de fons ara; deixar un punt únic de canvi d'asset documentat al codi.
- Stack actual: HTML5 / Vanilla JS (mantenir).

---

### Resum del que canvia respecte al prototip actual
1. Reputació **eliminada** del joc.
2. Bloc d'identitat 50/50 (característiques només icona, sobre el retrat) + vitals grans.
3. Coneixement com a etiquetes **surant** fora de la targeta.
4. Recursos **discrets** al camp + contextuals al carrusel.
5. Vida = **color del cel** (etapes) + sol baix amb posta prevista, lligat a la salut.
6. Inclinació = **píndola de branca en formació**; radar dels 4 eixos només a la fitxa.
7. **Deltes animats** en executar accions.
8. Fons com a **imatge en capes**, swappable.
