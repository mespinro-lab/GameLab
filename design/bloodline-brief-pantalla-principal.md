# Bloodline — Brief de la pantalla principal (per a Claude Code)

> Referència visual: `bloodline-v13.html` (mock d'estat **Gen 5**, en dia per llegir el mapa; el cel és el que tenyeix la vida).
> Aquest document descriu **estructura, capes i comportament**, no l'art final.

---

## 0. Objectiu i filosofia

Redissenyar la pantalla principal del prototip actual. Principis que han de quedar implementats:

- **Identitat a dalt, món a sota.** El bloc superior diu "qui ets" (personatge, característiques, coneixement); la resta de pantalla és "on actues" (món + zones).
- **Supervivència mana.** Menjar i salut sempre visibles i prominents.
- **Els números es veuen, però el que crida és el CANVI.** L'estat en repòs és tranquil; en executar una acció, els deltes salten i les caselles afectades s'encenen.
- **Vida = ambient diegètic.** La mortalitat es comunica pel **color del cel** (fons), no per un número.

---

## 1. Canvis de JOC (no només UI)

- **La reputació desapareix del joc.** S'elimina la mecànica i la UI. Si contribuïa a la puntuació final o a modificar events, cal redistribuir-ho (p. ex. la puntuació final passa a dependre de generacions assolides, branques desbloquejades i destreses). Eliminar `reputation` de l'estat, dels càlculs d'events i de qualsevol vista.

---

## 2. Arquitectura de capes (IMPORTANT)

El fons és **una imatge**, no HTML. Estructurar en capes independents perquè l'art final s'intercanviï sense tocar la lògica:

| Capa | Contingut | Implementació ara (placeholder) | Implementació final |
|------|-----------|----------------------------------|---------------------|
| L0 · Món | Escena de fons: cel + muntanyes + terra (veure §11) | SVG/CSS en UNA capa | `world.png` (una imatge) |
| L1 · Cel/Vida | To del cel segons etapa de vida | **Overlay/gradient** de to | Possible art per etapa |
| L2 · Sol | Sol baix a l'horitzó + posta prevista | Sprite/SVG posicionat | Sprite final |
| L3 · Zones | Planes, Bosc, Mercat, Campament, Llar (tappables) | Indrets posicionats en **%** | Sprites finals, coords alineades amb `world.png` |
| L4 · HUD | Bloc d'identitat, vitals, etiquetes, meta, log | DOM/UI | Igual |

**Clau:** la imatge de fons s'assigna a una sola variable/asset. Canviar-la = una línia. Coordenades de zones en **percentatges** (veure §11) perquè es mantinguin amb l'art definitiu.

---

## 3. Layout (zones de pantalla, de dalt a baix)

1. **Barra meta** (sobreposada): esquerra `Partida X/100` (discret); dreta `🔵 tokens` + menú `☰`.
2. **Bloc d'identitat** (targeta, 50/50):
   - **Meitat esquerra (jugador):** característiques **només icona + número** (`💪 3.8 · 🧠 2.5 · 🔗 4.1`) **a sobre**, i a sota el retrat + nom + `Gen N`.
   - **Meitat dreta (vitals):** `🌾 menjar` i `❤️ salut`, números grans.
3. **Etiquetes de coneixement** (FORA de la targeta, surant sobre el món): branques + branca en formació + habilitats + destreses.
4. **Món** (capes L0–L3): zones com a indrets + info de zona en xips (veure §11).
5. **Log** (sobreposat a baix): 1 línia.

---

## 4. Mapping de cada indicador

| Indicador | On viu | Visibilitat | Persistència |
|-----------|--------|-------------|--------------|
| 🌾 Menjar (actual/màx + ↓consum) | Vitals (dreta) | Sempre, prominent. Palpita si actual < consum | — |
| ❤️ Salut (valor + ↑/↓ del torn) | Vitals (dreta) | Sempre. El delta s'amaga si és 0 | — |
| 💪🧠🔗 Característiques | Capçalera del jugador (icona+núm) | Sempre. S'animen en canviar | 50% |
| 🪨 Pedra / ⚒️ Eines | **Xip al Campament** + carrusel | Xip discret + s'il·luminen al carrusel quan es gasten | 100% / 30% |
| Branques | Etiquetes surant | En emergir (§6) | herència descobriments |
| Branca en formació | Etiquetes surant | Amb deriva (§6) | — |
| Habilitats / Destreses | Etiquetes surant | En descobrir-se | permanents |
| Inclinació (4 eixos crus) | **Fitxa (tap)** com a radar | No a la principal | 85% |
| 🔵 Tokens | Barra meta | Sempre | 30% |
| 👪 Família | **Xip a la Llar** | Quan hi ha família | — |
| Vida / mortalitat | Color del cel + sol | Sempre (§5) | — |
| Partida X/100 | Barra meta | Sempre, discret | — |
| ~~Reputació~~ | **Eliminada** | — | — |

---

## 5. Vida i mortalitat (cel + sol)

La vida **no és un nombre fix de cicles**: la salut marca la velocitat.

**Color del cel = etapa de vida** (mai queda tapat, és el fons): Albada (jove) · Dia (plenitud) · Ocàs (envellint) · Nit (mort a prop).

**Sol baix a l'horitzó**: posició = progrés de vida; marca de **posta prevista** = on projecta morir al ritme actual. Tap → `~N cicles a aquest ritme`.

**Model (ajustable):**
```
incPerCicle = base * agingFactor(edat) * healthPenalty(salut)
lifeProgress += incPerCicle
ciclesRestants = (1 - lifeProgress) / incPerCicle
etapaCel = mapa(lifeProgress → albada|dia|ocàs|nit)
posicioSol = lifeProgress
```
`lifeProgress >= 1` → mort → herència (inclinació 85%, stats 50%, habilitats descobertes).

---

## 6. Branques i evolució cap a branques

**Eixos d'inclinació → branques** (confirmar): `Impuls → Caçador` · `Intel·lecte → Artesà` · `Espiritualitat → Místic` · `Sociabilitat → Recol·lector`.

- **Branca emergida** = píndola sòlida (blau), permanent.
- **Evolució cap a branca** = píndola **fantasma** que s'omple amb el % cap al llindar.

```
pct = valorEix / llindarEix
- formant-se (pct baix)  : contorn discontinu, ompliment parcial
- a prop     (pct ≥ 80%) : glow suau
- emergeix   (pct ≥ 100%): "pop" → píndola sòlida; es retira la fantasma
```
- Es mostra la branca de l'eix amb el pct més alt sense emergir (deriva dominant). Opcional: dues fantasma si la deriva es reparteix.
- El radar dels 4 eixos viu a la **fitxa** (tap).
- **Habilitats** (verd) i **destreses** (groc) són etiquetes amb mecàniques pròpies (no surten de la inclinació). Mantenir codi de color.

---

## 7. Feedback de canvi en actuar

En executar una acció: **deltes salten** prop de l'element afectat (`+3 🌾`, `+0.1 🧠`, `⭐ Botànica ▲`) i la **característica/recurs s'encén** un instant. Com que les característiques toquen el retrat, l'evolució es veu on mires el personatge. És el cor de la sensació de progrés.

---

## 8. Estat Gen 1 buit (degradació)

Funcionar buit **sense contenidors buits**:
- Cel = **albada**; sol alt/lent.
- Sense família → **node Llar absent** i sense xip de família.
- Sense branques → cap píndola sòlida; com a molt una fantasma quan comença la deriva.
- Sense habilitats/destreses → sense aquelles etiquetes.
- Característiques al valor base; recursos a 0 → xip del camp ocult o molt tènue.
- Sempre presents: retrat + nom + vitals.

Regla: el que encara no existeix **no apareix**.

---

## 9. Interaccions / fitxa

- **Tap al retrat** → fitxa: radar dels 4 eixos, característiques + taxes d'herència, edat exacta, família.
- **Tap a una zona** → carrusel d'accions; els recursos necessaris s'hi il·luminen.
- **Tap al sol** → `~N cicles a aquest ritme`.

---

## 10. Notes d'implementació

- Separar **estat de joc** (model) de la **capa de render**.
- To del cel via variable CSS/classe sobre el cel — fàcil d'animar.
- Coordenades de zones i sol en **%**.
- Placeholder de fons ara; un sol punt de canvi d'asset.
- Stack: HTML5 / Vanilla JS.

---

## 11. Composició del mapa (món)

- **Fons en UNA capa**: cel (gradient) → muntanyes → terra. Les muntanyes seuen a l'horitzó amb les **bases cobertes per la terra** i els **cims contra el cel** (no tallades). El gradient del cel és el de la vida (§5).
- **Les zones són indrets, no discos**: cada zona és una clapa integrada al terreny, amb **terra de marge** al voltant (res trepitja res):
  - **Planes** — herba + roques.
  - **Bosc** — clapa d'arbres a la vora del riu.
  - **Mercat** — parada de troc (pals + tendal de pell + cistells).
  - **Campament** — cova + tenda + foguera.
  - **Llar** — cabana + fum + família.
- **Riu**: baixa de les muntanyes i serpenteja pel **corredor central buit**, sense tocar cap zona. Els senders el creuen per **guals** (pedres).
- **Info de zona en XIPS**: família (Llar) i recursos (Campament) en pastilles translúcides amb contorn, llegibles sobre qualsevol terreny — mai text solt.
- **Posicions de referència** (centre de cada zona, en % de la pantalla; alinear amb el `world.png` final):

| Zona | x | y |
|------|---|---|
| Horitzó (muntanyes) | — | ~46% |
| Planes | ~79% | ~52% |
| Bosc | ~18% | ~60% |
| Mercat | ~53% | ~66% |
| Campament | ~76% | ~76% |
| Llar | ~30% | ~78% |

- **Mercat**: decisió pendent — indret al mapa **o** lligar-lo al comptador 🔵 i treure'l. De moment, indret al mapa.

---

### Resum del que canvia respecte al prototip actual
1. Reputació **eliminada** del joc.
2. Bloc d'identitat 50/50 (característiques només icona, sobre el retrat) + vitals grans.
3. Coneixement com a etiquetes **surant** fora de la targeta.
4. Recursos i família **en xips** discrets a la seva zona; recursos també al carrusel.
5. Vida = **color del cel** (etapes) + sol baix amb posta prevista, lligat a la salut.
6. Inclinació = **píndola de branca en formació**; radar dels 4 eixos a la fitxa.
7. **Deltes animats** en executar accions.
8. Fons com a **imatge en una capa** (cel+muntanyes+terra), swappable.
9. Mapa: **5 zones com a indrets separats** (no discos), riu pels buits, muntanyes contra el cel (§11).
