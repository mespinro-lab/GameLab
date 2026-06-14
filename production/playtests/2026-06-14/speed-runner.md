# Playtest Report — Speed Runner — Bloodline v2 — 2026-06-14

**Fitxers analitzats**: `prototypes/bloodline-v2/game.js`, `prototypes/bloodline-v2/data.js`
**Perspectiva**: Speed-run, pacing, gates de tècniques, branques mínimes

---

## [BUG — Visual] S1 — sun-death-line x2/y2 fixos al HTML, mai actualitzats per JS

`renderSky()` (game.js:1132–1136) actualitza `x1`/`y1` de `#sun-death-line` cada torn però mai toca `x2`/`y2`. La línia de projecció sempre apunta des de la posició actual del sol cap a un punt fix en pantalla — no cap al destí real calculat pel bezier. A mesura que el sol avança, la línia dona informació enganyosa sobre quant de temps li queda. **Severitat: S2** (enganyós, no crític).

---

## [DESIGN CONCERN] S2 — getFormingBranch() desapareix en activar la primera branca

`renderCharPanel()` (game.js:1491) condiciona el pill de "branca en formació" a `if (activeBranches.length === 0)`. Un cop s'activa qualsevol branca, el feedback de progrés cap a les branques restants desapareix completament. La branca Caçador s'activa en 5 cicles (veure speed route), eliminant el feedback durant els 95 cicles restants.

**Severitat: S2** (afecta pacing i percepció de profunditat).

---

## [DESIGN CONCERN] S3 — Finestra cercar_parella/tenir_fills sense avís visible

`act_cercar_parella`: `minAge: 5, maxAge: 14`. `act_tenir_fills`: `maxAge: 15`. Cap warning visible in-game quan s'apropa el maxAge. `sun-cap` mostra cicles de vida restants però no el deadline d'acció. Extinció per `no_heir` pot semblar injusta. **Severitat: S2**.

---

## [BUG — Latent] S4 — act_gran_ritual: camp `requires` duplicat

`data.js` línies 1266–1268: `requires` declarat dues vegades idèntic. JS descarta silenciosament la primera. Comportament actual correcte per accident. **Severitat: S1 (latent)**.

---

## Speed Route: SR-01 — Primera branca en mínim cicles (Caçador)

`act_espiar_ramat` (+0.05 impuls, INERTIA_FACTOR=2.0):

| Cicle | Impuls (inici) | Delta efectiu | Impuls (fi) | Branca? |
|-------|---------------|---------------|-------------|---------|
| 1 | 0.0000 | 0.0500 | 0.0500 | No |
| 2 | 0.0500 | 0.0455 | 0.0955 | No |
| 3 | 0.0955 | 0.0420 | 0.1374 | No |
| 4 | 0.1374 | 0.0392 | 0.1767 | No |
| 5 | 0.1767 | 0.0369 | 0.2136 | **SÍ** |

**Mínim: 5 cicles**. Al cicle 5, `d_rastreig` (destresa) s'activa simultàniament (5 usos, impuls ≥ 0.10). El jugador rep branca + destresa + upgrade disponible al mateix torn — possible sobrecàrrega.

---

## Speed Route: SR-02 — Universal techs (temporals pures)

`ut_foc` apareix al cicle 10 (+25% salut). No hi ha cap acció que acceleri la seva aparició. Cap acció pot saltar-se els gates temporals. **Mínim absolut: 10 accions per veure ut_foc.**

Compressió late-game crítica:
| Tech | Cicle global | Generació mínima |
|------|-------------|------------------|
| ut_ceramica | 80 | Gen 4 (darrer torn) |
| ut_agricultura | 92 | Gen 5 (cicle 12) |

Les skills de ceràmica (4 habilitats) queden comprimides en ~20 cicles, deixant poc marge per desbloquejar-les. **MASSA AJUSTAT** en les darreres dues generacions.

---

## Speed Route: SR-03 — Destresa en mínim cicles

`d_rastreig` al cicle 5 (coincideix amb SR-01). `DESTRESA_MAX = 3` de 5 disponibles: un jugador que ompli les 3 ranures amb d_rastreig + d_botanica + d_talla_silex bloqueja permanentment `d_custodi_foc` i `d_guardia`, impedint `act_gran_ritual` i `act_defensa_activa` per sempre. Herència 60% pot no alliberar ranures. **Exclusió permanent opaca**.

---

## Validació etapes cel

Thresholds correctes: albada < edat 5, dia < 12, ocas < 17, nit ≥ 17. `sun-core`/`sun-glow` actualitzats correctament. `sun-traveled` usa control point aproximat que divergeix lleugerament del bezier real a t > 0.5 — impacte visual menor.

---

## Pot el jugador completar l'era (ERA_CYCLES=100)?

5 generacions × 20 cicles = 100. Si Gen 4 mor al cicle 78 (molt probable: a edat 18, pèrdua ≈ `3 + 0.35 × 8^1.8 ≈ 19.7`), Gen 5 neix al 78 i ha de sobreviure 22 cicles, impossible amb LIFE_EXPECTANCY=20. **Final frustrant a 2 cicles de la meta**.

---

## Resum

| ID | Títol | Severitat |
|----|-------|-----------|
| S1 | sun-death-line x2/y2 fixos | S2 |
| S2 | Ghost pill invisible post-branca | S2 |
| S3 | cercar_parella maxAge sense avís | S2 |
| S4 | act_gran_ritual requires duplicat | S1 latent |
| — | ut_ceramica/agricultura comprimits cicles 80/92 | Design |
| — | DESTRESA_MAX=3 de 5: exclusió permanent | Design |
| — | ERA_CYCLES=100 + LIFE_EXPECTANCY=20: Gen 4 tardana bloqueja final | Design |
