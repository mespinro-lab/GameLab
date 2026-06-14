# Playtest Report — New Player — Bloodline v2 — 2026-06-14

**Fitxers analitzats**: `prototypes/bloodline-v2/index.html`, `style.css`, `game.js`, `data.js`
**Perspectiva**: Primer cop, cap context previ, mobile 390px portrait, parlant de català

---

## [S1] V2-01 — Cel com a signe de vida — ambigu a primera vista

El cel canvia de pink (albada) a blau (dia) a morat (ocas) a fosc (nit) via `.sky-albada/.sky-dia/.sky-ocas/.sky-nit`. Cap etiqueta diu "aquest és el teu estadi de vida". Les vitals numèriques (❤️ salut) continuen visibles però el color del cel fa el mateix. Ambigüitat: és estètic o gameplay? Un jugador nou no pot saber-ho sense context.

**Fix**: Afegir etiqueta de text de l'estadi de vida al marge superior de la pantalla, o un tooltip al cel.
**Severitat: S1** (sistema central que es comunica implícitament; jugadors nous no ho intuiran).

---

## [S2] V2-02 — Botó ⚑ ~N — el número és opac (cicles? anys?)

`#sun-cap` mostra "⚑ ~5". `aria-label="Posta prevista"`. "Posta prevista" és temàtic però opac. El número no s'explica. Es refereix a cicles restants de vida (`LIFE_EXPECTANCY - characterAge()`), però el jugador nou no ho sap.

**Fix**: Canviar a "⚑ ~N cicles" o afegir tooltip "Cicles restants de vida".
**Severitat: S2** (info útil però no descoberta sola).

---

## [S2] V2-03 — "Gen 1" — jugadors nous no saben què és "Gen"

El retrtat mostra "Gen 1" via `#char-gen-inlay`. Un jugador nou podria llegir-ho com "Gènere", "Gent", o un error. La mecànica de generació no s'explica fins que ocorre la successió.

**Fix**: Expandir a "Generació 1" (paraula completa) o eliminar fins al moment de la primera successió.
**Severitat: S2** (lèxic ambigú a primera vista).

---

## [S3] V2-04 — Bloc identitat 50/50 — jerarquia d'informació poc clara

LEFT: atributs (💪 🧠 🔗) + retrat + nom + gen. RIGHT: menjar + salut. Ordre de lectura ambigú. No hi ha caçapistes visuals per entendre que el RIGHT és prioritari (és el que pot matar el personatge).

**Fix**: Afegir etiquetes de secció subtils "Atributs" / "Vitalitat", o reordenar per posar Vitalitat primer.
**Severitat: S3** (confusió lleugera; el jugador s'adapta).

---

## [S3] V2-05 — Píndola ghost de branca en formació — sense context

`.pill-forming` amb vora discontínua i fill. Un jugador nou veu "Punta de Llança 45%". No sap si és una càrrega en curs, una tech quasi comprada, o una habilitat a meitat d'aprenentatge.

**Fix**: Afegir "🏗️" o "(X/5)" dins la píndola, o tooltip "En formació. Usa aquesta habilitat per desbloquejar-la."
**Severitat: S3** (feature cool però opaca).

---

## [S3] V2-06 — Layer-know sense capçaleres de secció

Tres files de píndoles (branques, destreses, en formació) sense cap etiqueta de secció. Colors diferencien (blau/verd/daurat) però no estan explicats. Si la Gen 1 no en té cap, la zona és buida sense anchor visual.

**Fix**: Afegir "Habilitats:", "Destreses:", "En formació:" quan cada secció té contingut.
**Severitat: S3** (cosmètic; jugadors aprenen per joc).

---

## [S2] V2-07 — Accessibilitat: cel sense backup per a daltonisme

El cel és l'únic senyal de l'estadi de vida. No hi ha `aria-label` ni equivalent textual. Jugadors que no distingeixen els quatre colors no tenen cap backup.

**Fix**: Afegir etiqueta textual de l'estadi al div del cel: `aria-label="Etapa de vida: [nom]"`.
**Severitat: S2** (disseny inclusiu; afecta accessibilitat).

---

## [S2] V2-08 — Material (🔵) al top bar sense etiqueta de text

`#tok-material` mostra "🔵 0". Cap text diu "Material" o "Provisions". El jugador veu un número però no sap el nom del recurs ni per a qué serveix fins que intenta comprar alguna cosa.

**Fix**: Afegir text "Material" o decidir entre "Material" i "Provisions" (inconsistència detectada vs glossari).
**Severitat: S2**.

---

## [S2] V2-09 — Llar: zona visible però bloquejada sense indicació

`Llar` té `starts_discovered: false` però podria ser visible al mapa com a zona. No hi ha 🔒 ni "(no disponible)". Un jugador pot clicar-la i no entendre per qué no fa res.

**Fix**: Mostrar 🔒 a la zona Llar fins que es desbloqueja, o afegir descripció "Busca parella per accedir a la Llar."
**Severitat: S2**.

---

## [S3] V2-10 — "Destreses" — terme formal, pot semblar arcaic

"Destreses" és català correcte però formal. Jugadors joves podrien trobar-lo estrany. El joc usa "Habilitats" per a les branch techs, i la distinció Habilitat/Destresa no s'explica en pantalla.

**Fix**: Considerar "Habilitats especials" o almenys definir la distinció al glossari.
**Severitat: S3** (terminologia; no bloqueja el joc).

---

## Taula resum

| ID | Títol | Severitat |
|----|-------|-----------|
| V2-01 | Cel com a vida — ambigu | **S1** |
| V2-02 | ⚑ ~N — número opac | S2 |
| V2-03 | "Gen 1" — lèxic ambigú | S2 |
| V2-07 | Accessibilitat cel daltonisme | S2 |
| V2-08 | Material 🔵 sense etiqueta | S2 |
| V2-09 | Llar visible però sense 🔒 | S2 |
| V2-04 | Identitat 50/50 jerarquia | S3 |
| V2-05 | Ghost pill sense context | S3 |
| V2-06 | Layer-know sense capçaleres | S3 |
| V2-10 | "Destreses" terme formal | S3 |
