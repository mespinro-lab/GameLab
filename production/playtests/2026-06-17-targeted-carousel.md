# Playtest Report — Targeted: Accions / Carrusel — 2026-06-17

## Summary
- **Agents run**: playtester-casual-mobile, playtester-optimizer, playtester-tycoon
- **Scope**: Targeted — commit `420ff03` (tokens ocults, revert saluts, narrar_llegendes → menjar)
- **Total issues**: 4 (S1: 0 · S2: 0 · S3: 2 · S4: 0 + 3 Design Concerns)
- **New issues**: 4 | **Known / pre-existing**: 0
- **CD-PLAYTEST**: omès — mode lean

---

## Verificació de Focus (commit 420ff03)

| Pregunta | Resultat |
|---|---|
| `updateCarouselInfo()` sense cap bloc `🔵 +X–Y`? | ✅ CLEAN — cap referència a `material_min/max` |
| `act_narrar_llegendes` mostra `🌾 1–3` al carrusel? | ✅ PASS — food chip visible i correcte |
| 4 accions revertides sense side_effects de salut? | ✅ CLEAN — gravar_os, preparar_cuiro, tallar_flauta, tela_sagrada nets |
| Cap acció amb `output_resource: "material"`? | ✅ ZERO — únic hit és un comentari a línia 630 |
| Tokens ocults = DECISIÓ DE DISSENY, no bug | ✅ CONFIRMAT — totes les accions generen tokens silentment, és el comportament esperat |

---

## S1 — Critical
Cap.

## S2 — Major
Cap.

## S3 — Minor (fix when capacity allows)

**V2-TC-01 · 4 accions pures sense cap chip de recurs al carrusel**
- Reportat per: casual-mobile (TC-01..04, TC-07), optimizer (T-04 parcial)
- Descripció: `act_gravar_os`, `act_preparar_cuiro`, `act_tallar_flauta`, `act_tela_sagrada` mostren
  únicament el badge d'stat (triangle superíndex de 0.36rem) al carrusel. Cap chip de menjar, cap chip
  de salut. Un jugador casual que veu `🧠▲` com a únic output no té cap pista que l'acció faci quelcom
  útil en termes de supervivència. La cadena causal `stat → branca → nova acció` és completament opaca
  sense text de suport.
- Reproducció: desbloca `bt_buri` (gravar_os). Obre el carrusel a Campament. Navega fins a
  "Gravar Os i Ivori". La zona `#zc-benefits` mostra únicament `🧠▲`. Cap número visible.
- Impacte: el jugador evita sistemàticament les accions sense número visible quan hi ha alternatives amb
  `🌾 3–6` o `❤️ 5–10` adjacents, tot i que les accions pures construeixen la branca a mig termini.
- Ruta: **ui-programmer** — considerar afegir a `#zc-desc` una línia contextual per a accions sense
  output de supervivència (ex. "Construeix la branca Artesà"), o augmentar la visibilitat del badge d'stat.

**V2-TC-02 · Overlay d'Upgrades mostra `🔵 +X–Y` però el carrusel principal no**
- Reportat per: tycoon (S3-TC-01)
- Descripció: `actionStatSummary()` (`game.js:2699–2701`), usat a l'overlay d'Upgrades, renderitza
  `🔵 +material_min–material_max` per a accions amb `material_min` definit. `updateCarouselInfo()` no
  renderitza cap chip de tokens. Un jugador que obre l'overlay d'Upgrades veu tokens; al carrusel diari,
  no. Model mental contradictori en dos surfaces del mateix joc.
- Reproducció: obre l'overlay d'Upgrades per a `act_tallar_pedra`. La side esquerra del panell mostra
  `🔵 +1–2`. Torna al carrusel principal i cerca `act_tallar_pedra`. Cap chip de tokens.
- Impacte: baix individualment, però reforça la confusió sobre quan i on es veuen tokens.
- Ruta: **ui-programmer** — netejar `actionStatSummary()` per eliminar el chip de tokens, consistent
  amb la decisió de disseny de mantenir-los ocults.

---

## Design Concerns

**DC-01 · Branca Místic: 2 accions de menjar vs ~14 generadors de salut**
- Reportat per: optimizer (T-02)
- Descripció: post-correccions, la branca Místic té 2 fonts de menjar (`narrar_llegendes` 1–3,
  `transit_nocturn` 2–4 amb risc −5 salut) i aproximadament 14 generadors de salut (5 output directe
  + 9 side_effects). Un jugador Místic pot sobreviure en salut però pateix menjar estructuralment i ha
  de combinar accions d'altres branques per subsistir. Pot ser intencional (la branca social obté menjar
  via rituals i relacions) o un forat de disseny.
- Pregunta al dissenyador: és intencional que el Místic depengui de `narrar_llegendes` (poc menjar,
  segur) + `transit_nocturn` (menjar moderat, arriscat) com a únics fluxos de menjar? Si no, caldria
  un generador de menjar a una acció ritual mid-tier.
- Ruta: **economy-designer**

**DC-02 · `act_gravar_os` i `act_preparar_cuiro` dominades en late-game Artesà**
- Reportat per: optimizer (T-03)
- Descripció: un cop desbloquejat `act_faonar_eines` (material 3–5, avança intel·lecte +0.05),
  `act_gravar_os` (material 2–3, intel·lecte +0.03) queda dominada en material i inclinació.
  `act_preparar_cuiro` (material 2–4, forca) queda dominada per `act_destillar_quitra` (material 2–4 +
  enginy stat +0.20, intel·lecte +0.05). En late-game, no hi ha motiu per executar-les.
  `act_tallar_flauta` és un cas especial (gateway d'un sol ús, no spam) — no aplicable.
  `act_tela_sagrada` té nínxol legítim (material + vincle, no dominada).
- Ruta: **economy-designer** — considerar si `gravar_os`/`preparar_cuiro` necessiten un element únic
  (ex. requisit per alguna tech, o output secundari que les altres no tinguin).

**DC-03 · Cadena causal `stat pura → branca → nova acció` completament opaca**
- Reportat per: casual-mobile (TC-07)
- Descripció: el circuit d'informació per a un jugador casual davant d'una acció sense recurs:
  (1) nom, (2) badge d'stat de 0.36rem, (3) descripció en 0.7rem dim llegida rarament. No hi ha cap
  element de la pantalla que digui "això em desbloquejarà coses futures" o "construeix la branca X".
  El feedback post-execució (floater d'stat, `lit-flash` al chip) dura 1 segon i el jugador no pot
  connectar l'acció executada amb la stat que puja.
- Ruta: **ux-designer** — proposta: afegir a `#zc-benefits` per a accions pures un text mini de context
  (ex. "Branca Artesà ▲" quan l'acció avança principalment intel·lecte).

---

## Open Points Status
| Item | Estat |
|---|---|
| V2-01 (tokens invisibles al carrusel) | ✅ TANCADA PER DISSENY — tokens ocults intencionals |
| 4 reverts salut (gravar_os, preparar_cuiro, tallar_flauta, tela_sagrada) | ✅ VERIFICAT CLEAN |
| narrar_llegendes → food | ✅ CORRECTE — 🌾 1–3 visible al carrusel |

---

## Recommended Next Actions
1. **V2-TC-02** (S3) — netejar `actionStatSummary()` per eliminar `🔵` de l'overlay Upgrades, consistent
   amb la decisió de tokens ocults. Canvi mínim: eliminar les 3 línies `2699–2701` de `game.js`.
2. **V2-TC-01** (S3) — afegir context a les accions pures del carrusel. Opció mínima: una línia de text
   a `#zc-desc` que identifiqui la branca que construeix l'acció. Opció UX: el badge d'stat esdevé un
   element de 32px mínim amb etiqueta llegible.
3. **DC-01** (Design) — confirmar si la dependència alimentaria del Místic és intencional o un forat.
   Si forat: afegir menjar a una acció ritual mid-tier.
4. **DC-02** (Design) — decidir el nínxol de `gravar_os` i `preparar_cuiro` a late-game Artesà.
