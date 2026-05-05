# Life Tycoon — Punts Oberts i Futures Millores

## Pendents de disseny

### [DISSENY] Habilitats innates vs. apreses
La fila de coneixements (knowledge-row) hauria de diferenciar dues capes:
- **Trets innats** (biologia, al caràcter): allà on ara hi ha els pills de coneixement. Exemples: força excepcional, intuïció, resistència.
- **Coneixements apresos** (ensenyables, al llinatge): accessible via botó de Tecnologia. Inclou foc, eines, llengua.
- El pare pot ensenyar coneixements al fill explícitament (acció "Educar fills").
- Trets innats poden ser heretables o no, depenent del tipus.
- Punt obert: com mostrar visualment la diferència entre tots dos tipus.

### [DISSENY] Fills: cost i benefici
- **Cost per fill**: +2 menjar/cicle per fill (implementat 2026-05-05).
- **Benefici**: amb 2+ fills, bonus de reputació familiar. Amb 3+, possibilitat de "repartir tasques" (fer dues accions en un cicle?). A la successió, triar entre fills dona més flexibilitat.
- Decidir quan els fills participen activament (ara mateix no fan res fins que es fa la successió).



### [DISSENY] Panell de Tecnologia
Botó accessible des de la pantalla principal que mostra:
- **Coneixements del llinatge** (descoberts en qualsevol generació, permanents).
- **Habilitats apreses** que el pare pot transmetre al fill.
- Efectes clars de cada coneixement (ara parcialment definits a data.js, incomplerts).

## Correccions pendents (bugs coneguts)

*(cap ara mateix)*

## Decisions tancades

- Coneixements sempre heretables al 100% (implementat 2026-05-05).
- Flux sense result pane: acció → descobriment → event → ubicacions.
- Floaters apareixen en tornar a la pantalla d'ubicacions.
- Fills costen +2 menjar/cicle; tenir fills no costa salut (implementat 2026-05-05).
- Riquesa eliminada de l'era prehistòrica (implementat 2026-05-05).
