# Playtest Era 1 — 2026-06-02
**Tester**: mespinro (autor)
**Prototip**: prototypes/life-tycoon-2/index.html
**Durada**: sessió curta exploratòria

---

## Issues trobats

### P1-UX-01 — Cost d'executar accions no té sentit narratiu
**Problema**: executar accions costa 1 Aliment. No queda clar per què *executar* (no comprar) costa recursos.
**Impacte**: confusió sobre el model econòmic bàsic.
**Possible solució**: revisar si el cost d'execució és necessari mecànicament, o si s'hauria de reformular com a "energia" o eliminar per a accions senzilles.

### P1-UX-02 — No hi ha feedback visual en executar una acció
**Problema**: el jugador prem "Vigilar el Campament" repetidament perquè no veu que passi res. En realitat el torn avança i dona aliment, però el net és zero (el cost iguala el guany) i la UI no reflecteix el canvi.
**Impacte**: confusió severa — el jugador pensa que l'acció no funciona.
**Possible solució**: animació/sumatori visible dels recursos guanyats (+3 Aliment) i perduts (-1 cost) en executar. Inspiració: LT1. Possiblement un resum de fi de torn clar.

### P1-UX-03 — Massa accions visibles des del principi
**Problema**: al inici de partida hi ha moltes accions descobertes. Hauria d'haver-hi poques accions bàsiques i la resta s'aniria desblocant.
**Impacte**: sensació d'overwhelming, pèrdua del arc de descoberta.
**Possible solució**: revisar quines accions son "base" visibles d'inici vs. quines requereixen descoberta progressiva.

### P1-UX-04 — Scroll a la pantalla
**Problema**: la UI no cap a la pantalla — cal fer scroll per veure tot el contingut.
**Impacte**: experiència trencada, especialment en mòbil.
**Possible solució**: redisseny del layout per encabir tot a una pantalla (portrait). Revisar LT1 com a referència.

### P1-BUG-05 — Clicks múltiples sense resposta seguida de torns acumulats
**Problema**: a vegades clicar una acció no fa res visible, i quan es torna a premer s'executen 2+ torns alhora.
**Impacte**: pèrdua de control del jugador, possiblement pèrdua d'aliment inesperada.
**Possible causa**: event listener duplicat o race condition en el renderitzat.

### P1-UX-06 — Descobriments (Universal Techs) sense notificació
**Problema**: "El Foc" es descobreix al cicle 10 sense cap indicació visible. El jugador no s'assabenta.
**Impacte**: pèrdua del moment "wow" dels descobriments — un dels pilars de la fantasy del jugador.
**Possible solució**: targetes de descobriment que interrompin el flux i expliquin la tech descoberta (com les targetes d'events). Inspiració: LT1.

### P1-UX-07 — LT1 com a referència d'UX i jugabilitat
**Nota**: LT1 té interaccions que donaven molt de sentit i jugabilitat. Cal revisar-lo com a referència per al redisseny de la UX del prototip (sabent que el visual canviarà completament per a LT2).

---

## Observació general
La mecànica funciona però la UI no comunica prou bé el que passa cada torn. El bucle bàsic (acció → recursos → inclinació) no és llegible visualment. Cal un redisseny de la capa de feedback abans de poder avaluar si la jugabilitat és divertida.

---

## Prioritat suggerida d'abordatge
1. **P1-BUG-05** (bug d'clicks acumulats) — bloca el testing
2. **P1-UX-02** (feedback visual per acció) — bloca l'avaluació del loop
3. **P1-UX-06** (targetes de descobriment) — bloca l'avaluació de la progressió
4. **P1-UX-04** (layout sense scroll) — necessari per provar en mòbil
5. **P1-UX-03** (massa accions inicials) — disseny de progressió
6. **P1-UX-01** (cost d'execució) — decisió de disseny
7. **P1-UX-07** (revisar LT1) — recerca de referència
