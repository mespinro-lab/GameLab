# Life Tycoon — Punts Oberts i Futures Millores

## Pendents de disseny

### [DISSENY] Tres capes de coneixement — estructura pendent d'implementar

El joc ha de tenir tres capes diferenciades de coneixement, de les quals només la primera i la tercera estan implementades:

**Capa 1 — Trets innats** (biologia, per individu, no ensenyables)
Exemples: fusta de líder, força excepcional, intuïció. ✅ Implementat com a pills verdes.

**Capa 2 — Habilitats apreses** (per individu, ensenyables al fill)
Exemples: conèixer les plantes medicinals, rastrejar, pescar, cuinar.
- Es descobreixen durant la vida via accions (com ara els coneixements actuals).
- El pare les pot transmetre al fill via l'acció "Educar fills".
- Visibles a la pantalla principal (pills d'un color diferent dels trets).
- **No existeixen encara — tot el sistema és nou.**

**Capa 3 — Tecnologia** (saber col·lectiu del llinatge, permanent, no per individu)
Exemples: foc, eines de pedra, eines de metall.
- Descoberta per qualsevol generació, queda al llinatge per sempre.
- Visible al panell 📜. ✅ Implementat.
- Pendent: progrés incremental d'eines (vegeu punt d'eines a baix).

### [DISSENY] Dos trets innats per personatge
Ara cada personatge té 1 tret innat. La proposta és tenir-ne 2:
- **Tret heretat**: prové del pare (si l'herència té èxit) o de la mare/atzar.
- **Tret propi**: generat aleatòriament en néixer, independent de l'herència.
Això dona més varietat i fa que cada personatge se senti únic fins i tot si hereta trets.

### [DISSENY] Successió: escollir entre fills
Ara la successió tria automàticament l'únic fill (o el primer si n'hi ha més d'un). La proposta:
- Mostrar tots els fills disponibles amb les seves estadístiques, trets i coneixements heretats.
- El jugador tria quin fill continua el llinatge.
- Amb 1 fill no hi ha elecció. Amb 2+ fills es pot optimitzar el llinatge.
- Ja implementat en part: `renderSuccessionOverlay` mostra 1 fill. Cal ampliar.

### [DISSENY] Acció: Educar Fills
Falta una acció de "passar temps amb els fills" / "educar". Possible disseny:
- Zona: Llar.
- Requisit: tenir almenys 1 fill.
- Efecte: millora les estadístiques o trets del fill que succeirà (physical/intelligence/social +0.5 al fill, no al pare). Potser augmenta la probabilitat d'heretar un tret concret.
- Cost: temps (com qualsevol acció), potser +felicitat com a subproducte.

### [DISSENY] Eines: progrés incremental i beneficis graduals
L'acció "Fabricar Eines" no té prou lògica. Proposta de redisseny:
- **Eliminar** el +5 felicitat com a output; no té sentit.
- **Fer-la més cara** en temps (potser Suau no hauria de ser disponible, o costa més).
- **Efectes graduals** en funció del temps invertit al llarg del llinatge:
  - Eines bàsiques (nivell 1): lleuger bonus a Recol·lectar (+food) i -10% risc a Caçar.
  - Eines de pedra (nivell 2, ja existent): -50% risc a Caçar, desbloqueja Explorar.
  - Eines de metall (nivell 3, era futura): per definir.
- El progrés d'eines hauria d'acumular-se al llinatge, no resetejar-se.

### [DISSENY] Fills: benefici al llinatge (pendent)
- Amb 2+ fills, bonus de reputació familiar.
- Amb 3+ fills, possibilitat de repartir tasques (fer dues accions en un cicle?).
- Decidir quan els fills participen activament més enllà de la successió.

## Correccions pendents (bugs coneguts)

*(cap ara mateix)*

## Decisions tancades

- Coneixements sempre heretables al 100% (implementat 2026-05-05).
- Flux sense result pane: acció → descobriment → event → ubicacions.
- Floaters apareixen en tornar a la pantalla d'ubicacions.
- Fills costen +2 menjar/cicle; tenir fills no costa salut (implementat 2026-05-05).
- Riquesa eliminada de l'era prehistòrica (implementat 2026-05-05).
- Trets innats amb efectes reals implementats (implementat 2026-05-05).
- Panell de Tecnologia del Llinatge implementat (implementat 2026-05-05).
