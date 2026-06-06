# Playtest Report — 2026-06-06

**Game**: Bloodline (src/bloodline/ — versió Godot 4.6)
**Sessió**: Primera sessió de joc real — jugador humà (autor)
**Durada estimada**: Múltiples vides (≥3 personatges)
**Escenari**: Core loop — Era 1 Prehistòria

---

## Resum executiu

Sessió de joc real de l'autor. El core loop és jugable però amb buits crítics:
cap mecanisme clar per comprar accions ni descobrir habilitats des del punt de vista
del jugador; el sistema de salut no penalitza la fam; les inclinacions van massa lentes;
i diversos bugs de prerequisit trenquen la coherència narrativa.

---

## BUGS

### BUG-PT1 — Double count visual al executar acció (P0)
**Descripció**: En executar una acció que genera tokens (🦴), l'overlay mostra "+N 🦴"
i simultàniament (o en tornar a la pantalla principal) el comptador sembla fer 0→2→1
en lloc de 0→1. Confús: el jugador no sap si el sistema ha comptat dues vegades.
**Possible causa**: `_refresh()` es crida dins `_on_action_executed` i un cop més en
tancar l'overlay, però el state ja ha canviat. Pot ser que el display sigui correcte
però l'animació/transició de l'overlay el faci semblar incorrecte.
**Impacte**: Confusió sobre la quantitat real de recursos disponibles.

### BUG-PT2 — Acció ritual de foc disponible sense descobrir el foc (P0)
**Descripció**: L'acció de "ritual amb el foc" (o equivalent) apareix des del cicle 0,
sense que s'hagi descobert el foc. Incoherent narrativament.
**Causa**: La condició de prerequisit `requires_discovery: foc` (o equivalent) no
existeix o no és avaluada a `ActionManager.get_action_visibility()`.
**Impacte**: Trenca la coherència de l'era; accions anacròniques.

### BUG-PT3 — Habilitat "Custodi del Foc" descoberta sense prerequisit de foc (P0)
**Descripció**: La skill `bt_custodi_del_foc` (o equivalent) pot aparèixer com a
elegible abans que la tecnologia universal "Descoberta del Foc" estigui activa.
**Causa**: La condició de prerequisit de `skill` no comprova si la tech universal
associada ja ha estat assolida.
**Impacte**: Habilitat anacronica; trenca la progressió.

### BUG-PT4 — Zones es descobreixen buides (sense accions) (P1)
**Descripció**: Quan el Bosc o el Ritual es desbloquegen, la targeta mostra
"Sense accions disponibles". El jugador no pot fer res en una zona recén descoberta.
**Causa**: La zona s'activa per condicions de tecnologia universal, però les accions
d'aquella zona requereixen habilitats (skills) que el jugador no té, deixant la zona
efectivament buida.
**Impacte**: Sensació de zones "trampa" — el descobriment és anticlimàtic.

---

## UX / VISUAL

### UX-PT1 — Layout de la barra superior: tokens al centre, botó acció a l'esquerra (P1)
**Descripció**: Els recursos d'acció (🦴 tokens) han d'estar al mig de la barra
superior (entre VITALS i el títol, o centrats). El botó d'execució d'acció (▶) hauria
d'estar a l'ESQUERRA de la fila d'acció, no a la dreta.
**Fitxer**: `GameScreen.gd` → `_build_top_bar()` i `_build_lt1_action_row()`

### UX-PT2 — Menjar redundant (top bar + panell jugador) (P1)
**Descripció**: La comida (🌾) apareix al top bar pill I al panell esquerre. Un dels
dos sobra. Quedar-se amb el panell del jugador i afegir-hi: consum per torn + límit
d'emmagatzematge. El top bar pot mostrar només salut i tokens.
**Fitxer**: `GameScreen.gd` → `_build_top_bar()`, `_build_left_panel()`

### UX-PT3 — Límit d'emmagatzematge de recursos no visible (P1)
**Descripció**: El jugador no sap quant menjar pot acumular com a màxim. No hi ha
indicació de `N/MAX` ni de la despesa per torn actual.
**Necessitat**: Mostrar `🌾 X/MAX  (−Y/torn)` on MAX i Y canvien per efectes d'accions
(fills = +1/torn, etc.).

### UX-PT4 — Despesa per torn de recursos no visible (P1)
**Descripció**: No hi ha forma de saber quant menjar (o salut) es consumeix per torn.
Quan es fan fills, la despesa hauria de pujar i ser visible.
**Necessitat**: Panell del jugador o top bar ha de mostrar el consum actual.

### UX-PT5 — Descobriments majors sense anunci dramàtic (P1)
**Descripció**: Descobrir el foc, les eines o una nova tecnologia universal hauria de
tenir una targeta especial dramàtica (icona gran, text explicatiu, animació de color).
Ara queda silenciós o massa discret.
**Nota**: L'overlay existent (`_on_tech_discovered`) és un bon punt de partida però
s'ha de fer més espectacular visualment per a descobriments de foc/eines.

---

## DISSENY — SISTEMES

### DESIGN-PT1 — Recursos d'acció (tokens) NO han de reiniciar entre personatges (P0)
**Descripció**: Els 🦴 tokens s'acumulen durant TOTA la dinastia, no es reinicien
en cada personatge. Cada acció genera tokens; cada nova acció comprada té un preu.
Aquesta és la moneda de progressió a llarg termini de la dinastia.
**Decisió necessària**: Confirmar que tokens persisteixin a `LineageManager.continue_succession()`.
**Impacte**: Si es reinicien, la progressió de compra d'accions és impossible.

### DESIGN-PT2 — Totes les accions han de generar tokens (P0)
**Descripció**: "Qualsevol acció que generem o que fem ha de generar recursos de compra
d'accions. És la gràcia." — El jugador ha de sentir que cada acció li aporta alguna cosa
cap a la progressió. Cap acció hauria de retornar 0 tokens.
**Impacte**: Accions sense output de tokens desmotiven el jugador.

### DESIGN-PT3 — Salut no correlaciona amb fam; sistema de salut a redissenyar (P0)
**Descripció**: La salut baixa constantment independentment de si el personatge menja
o no. Això trenca la penalització per inanició. Proposta:
- Salut **base prehistòria**: ~40-60 (no 100) — vida dura, mort més propera
- Sense inanició: salut es manté estable (lleugera baixada per edat)
- Amb inanició (0 menjar per torn): salut baixa acceleradament
- A partir d'edat avançada: salut comença a caure de forma accentuada
- Eres posteriors: salut base més alta, caiguda per edat menys accentuada

### DESIGN-PT4 — Fills han de costar menjar extra per torn (P1)
**Descripció**: Tenir fills a la prehistòria és massa fàcil/gratis. Cada fill hauria
d'afegir +1 consum de menjar per torn. Incentiva la planificació de recursos.
**Integrar amb**: DESIGN-PT3 (sistema de consum per torn dinàmic) i UX-PT4.

### DESIGN-PT5 — Inclinació/branques massa lentes: 3 vides sense Recol·lector (P1)
**Descripció**: Després de 3 vides de 3 personatges no ha aparegut la branca
Recol·lector. Sense branca, no es descobreixen habilitats → no hi ha accions noves
→ estancament total.
**Possible causa**: Threshold d'inclinació per activar branca massa alt, o les
accions base no generen prou delta d'inclinació.
**Relacionat**: B-01 del backlog existent.

### DESIGN-PT6 — Successió: pool de successors incorrecte (P1)
**Descripció**: Si el personatge A té 3 fills → al morir es trien dels 3. El jugador
tria fill B. Fill B té 3 fills → al morir es presenten els 3 fills de B + els 2
germans no triats d'A. El pool creix indefinidament.
**Solució correcta**: A la mort, SEMPRE oferir els fills del personatge ACTUAL. Només
caure en germans si el personatge mor sense descendència.
**Impacte**: Confusió generacional; germans "estancats" sense envellir.

### DESIGN-PT7 — Sistema d'events random: necessita balancejador de probabilitats (P2)
**Descripció**: Els events positius i negatius s'han de balancejar per era. Proposta:
- Definir percentatge target d'events positius vs negatius per era
- Si no han passat suficients events negatius, augmentar probabilitat
- Si n'han passat molts, baixar probabilitat
- Garantir que l'impacte net dels events sigui similar per a tots els jugadors
**Objectiu**: Els events han de ser factor del joc, però no penalitzar arbitràriament.

### DESIGN-PT8 — Zones: estructura de zones a revisar (P2)
**Descripció**:
1. Inici amb només Campament és massa limitat vs LT1 (que tenia múltiples zones des del principi)
2. La zona Ritual és injusta: si no vas per inclinació mística, tens menys zones
3. Zones hauria de ser estàndards (tots els jugadors les tenen totes)
4. Les accions de cada branca han d'estar distribuïdes per les zones comunes
**Decisió necessària**: Definir quines zones estan disponibles des de l'inici; Ritual
ha de ser zona estàndard o les seves accions han de migrar a les altres zones.

### DESIGN-PT9 — Accions d'inici mal calibrades (P2)
**Descripció**:
- Acció d'alimentació HA D'ESTAR disponible des del cicle 0
- Acció de buscar parella NO hauria d'estar disponible tan aviat
- Acció de ritual de foc amb foc com a prerequisit (veure BUG-PT2)

### DESIGN-PT10 — Incentiu per vides llargues (P3)
**Descripció**: Cal beneficiar el jugador que manté personatges vius més temps.
Si morir ràpid i reiniciar és óptim, el disseny d'Era falla. Mecanismes possibles:
- Bonus de puntuació per cicles viscuts
- Tokens extra generats per edat avançada
- Herència d'habilitats proporcional a l'edat del difunt
**Referència**: Costos i implicacions de LT1 com a model de referència.

---

## Decisions pendents

| ID | Pregunta | Opcions |
|----|----------|---------|
| DP-01 | Tokens: persisteixen entre personatges? | A) Sí — currency dinàstica. B) No — reinici per gen |
| DP-02 | Zona Ritual: queda com a zona pròpia o migra accions? | A) Queda però totes les branques hi tenen accions. B) Accions migrades a zones estàndard |
| DP-03 | Salut prehistòrica base: quin valor (40/60/altre)? | A) 40 B) 60 C) Mantenir 100 |
| DP-04 | Zones inicials: Campament només o Campament+Planes des del cicle 0? | A) Campament+Planes. B) Campament sol però accions d'alimentació al Campament |

---

## Resum de prioritats

| Prior | Count | Tipus |
|-------|-------|-------|
| P0 | 4 | 3 BUG + 2 DESIGN crítics |
| P1 | 8 | 4 UX + 4 DESIGN |
| P2 | 3 | DESIGN estratègic |
| P3 | 1 | DESIGN a llarg termini |
