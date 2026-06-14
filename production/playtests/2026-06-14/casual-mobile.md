# Playtest Report — Casual Mobile — Bloodline v2 — 2026-06-14

**Fitxers analitzats**: `prototypes/bloodline-v2/index.html`, `style.css`, `game.js`, `data.js`
**Perspectiva**: Jugador casual, sessió mòbil 5-10 min, primera vegada

---

## [BLOCKING] S13 — Recurs `reputacio` invisible al HUD — accions base silencioses

**Descripció**: `data.js` defineix el recurs `reputacio` però l'únic token visible al top bar és `#tok-material` (🔵). Accions base disponibles des del primer cicle — "Vigilar el Campament", "Ritual del Foc", etc. — retornen `output_resource: "reputacio"` sense cap representació visual al HUD. El jugador executa l'acció, veu l'animació donut, i no veu cap canvi de nombre.
**Afecta**: `act_vigilar_campament`, `act_ritual_foc`, `act_consagrar_ornaments`, `act_narrar_llegendes`, `act_ornamentar_se`, `act_pintar_parets`, `act_transit_nocturn`, `act_marcar_territori`
**Impacte**: La conclusió natural del jugador: "l'acció no ha funcionat" o "el joc està trencat". Bloqueja la comprensió de la sessió zero.

---

## [BLOCKING] S14 — Primeres 3 accions — test de comprensió FALLA

**Descripció**: Sessió simulada: (1) Nova Partida OK. (2) Tap Planes → carousel → "Espiar el Ramat" → menjar puja, animació correcta ✅. (3) Tap Campament → "Vigilar el Campament" → reputació incrementa sense feedback visual ❌. "Cercar Parella" mostra "No tens edat per a això" sense context per saber per quants cicles.
**Impacte**: Una de les tres accions base principals produeix feedback mut. Primera sessió falla el test de comprensió bàsica.
**Causa arrel**: S13 (reputació invisible).

---

## [S2-Major] S3 — Solapament de tap-targets Campament/Planes a 360px

**Descripció**: Campament a `left:63%` (227px) i Planes a `left:80%` (288px). Diferència de centres: 61px. Cada node té hit-area de 130px → solapament horitzontal: 69px. Qualsevol toc entre x≈162px i x≈231px pot registrar el node equivocat.
**Impacte**: Tocs erronis freqüents en mòbils de 360px. No compleix Apple HIG (zones separades).

---

## [S2-Major] S7 — Botons info i upgrade del carousel a 22×22px

**Descripció**: `.zc-info-btn` i `.zc-upgrade-btn` mesuren 22×22px (menys de la meitat del mínim 44px). En un carousel 3D en rotació l'àrea tàctil és inestable.
**Impacte**: El jugador intentant tocar "ⓘ" per llegir una descripció dispararà l'acció en lloc d'obrir la info. Error d'interacció freqüent.

---

## [S3-Minor] S1 — Meta bar no mostra menjar ni salut

**Descripció**: `#bar-meta` mostra "Cicle 0" (9.5px, color apagat) i `🔵 0`. Les vitals estan sota al bloc identitat, però el jugador mira primer la barra de dalt.
**Impacte**: Primer 30 segons de confusió sobre on mirar els recursos crítics.

---

## [S3-Minor] S4 — Etiquetes de vitals a 8.5px — il·legibles al mòbil

**Descripció**: `.vital-label` ("🌾 menjar" / "❤️ salut") té `font-size: 8.5px`. El número gran (20px) és llegible però l'etiqueta de text és invisible a distància de braç.
**Impacte**: El jugador sap que hi ha un número gran però no pot llegir el label. L'emoji salva parcialment però "menjar" i "salut" escrits no es llegiran.

---

## [S3-Minor] S5 — Píndola ghost (branca en formació) no tappable ni explicada

**Descripció**: `.pill-forming` és visualment clara (vora discontinua + barra de progrés) però `#layer-know` té `pointer-events: none`. Cap píndola de coneixement és interactiva. Zero camí d'explicació des de la pantalla principal.
**Impacte**: Un jugador no pot tocar la píndola per saber "Caçador 47%". La mecànica central d'inclinació és invisible.

---

## [S3-Minor] S12 — Botó #sun-cap a ~13px d'alçada — intocable

**Descripció**: `#sun-cap` té `padding: 2px 7px; font-size: 9px`. Alçada computable: ~13px. Mostra "⚑ ~18" (cicles restants de vida).
**Impacte**: Potencialment útil però pràcticament inaccessible per toc.

---

## [S4-Trivial] S2 — Cel sky-albada renta el fons del món

**Descripció**: `#layer-sky.sky-albada` aplica gradient rosa (rgba 246,198,208, opacitat 0.82) sobre fons ocre. Resultat: rectangle salmó apagat, no un alba paleolítica reconeixible.
**Impacte**: Estètic però degradat — el món no es "llegeix" com a lloc.

---

## [S4-Trivial] S6 — Layer-know solapada amb node Planes a 640px

**Descripció**: `#layer-know` ocupa y:174px–206px. Planes node a `top:32%` = 205px en pantalla de 640px. Solapament de 1-2px en telèfons curts (budget Android, iPhone SE).
**Impacte**: El label "Planes" pot quedar tapat per una píndola de branca.

---

## [S4-Trivial] S8 — Animació donut bloqueja tota interacció 1.95s

**Descripció**: `body.donut-active * { pointer-events: none !important; }` actiu durant 1950ms per cada acció. No hi ha cap indicador de compte enrere visible.
**Impacte**: Sensació d'UI congelada. En sessions de 5-10 min el jugador passa ~30% del temps bloquejat.

---

## [S4-Trivial] S10 — Log bar — 9.5px text, ~38 chars visibles

**Descripció**: `font-size: 9.5px` en `#logbar`. Missatges llargs truncats amb el·lipsis. Missatges de descoberta clau poden ser retallats mid-word.

---

## [S4-Trivial] S11 — Successió no explica percentatge d'herència

**Descripció**: `#overlay-succession` mostra `.succ-child-btn` però no hi ha cap element que mostri "85% inclinació heretada" ni "50% stats heretats". La mecànica d'herència és invisible en el moment de triar successor.

---

## [PASS] S9 — Gen 1 buit — Llar absent correctament

Llar té `starts_discovered: false`. No apareix fins que `find_partner` crida `state.discoveredZoneIds.add('Llar')`. Correcte.

---

## Taula resum

| ID | Títol | Severitat |
|----|-------|-----------|
| S13 | Reputació invisible al HUD — accions silencioses | **BLOCKING** |
| S14 | Primeres 3 accions — test falla | **BLOCKING** |
| S3 | Solapament tap-targets Campament/Planes | S2-Major |
| S7 | Info/upgrade buttons 22×22px | S2-Major |
| S1 | Meta bar no mostra vitals | S3-Minor |
| S4 | Vital labels a 8.5px | S3-Minor |
| S5 | Ghost pill no tappable | S3-Minor |
| S12 | sun-cap 13px intocable | S3-Minor |
| S2 | Sky-albada renta el món | S4-Trivial |
| S6 | Layer-know / Planes overlap 640px | S4-Trivial |
| S8 | Donut 1.95s input lock | S4-Trivial |
| S10 | Log bar text truncat | S4-Trivial |
| S11 | Successió no explica herència | S4-Trivial |
| S9 | Gen 1 buit — Llar OK | PASS |

## Routing
- **S13, S14** → `qa-lead` (blocking, fix immediat: eliminar reputació de data.js o fer-la visible)
- **S3, S7** → `ui-programmer` (tap targets)
- **S4, S12** → `ui-programmer` (mides de font)
- **S5** → `game-designer` (affordance píndola ghost)
- **S1** → `ui-programmer` (meta bar o redisseny HUD)
