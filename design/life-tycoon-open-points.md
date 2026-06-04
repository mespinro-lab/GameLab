# Life Tycoon — Punts Oberts i Futures Millores

## Pendents de disseny

### [ERA 4] Antiguitat Clàssica — pendent d'implementar

L'era 4 (`antiguitat_classica`) és referenciada com a `nextEra` de la tech gate
`iron_smelting` (Edat Antiga), però **no existeix a `data.js`**.

Cal dissenyar i implementar:
- Zones, techs, destreses, accions, events, mecàniques
- Tech gate final cap a l'era 5 (si n'hi ha)

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
- Tres capes de coneixement implementades (implementat 2026-05-13):
  - Capa 1 — Trets innats (2 per personatge: heretat + propi).
  - Capa 2 — Habilitats apreses (descobertes via accions, ensenyables via "Educar Fills").
  - Capa 3 — Tecnologia del llinatge (permanent, visible al panell 📜).
- Dos trets innats per personatge (implementat 2026-05-13): `traitIds[0]` = heretat, `traitIds[1]` = propi.
- Successió amb elecció entre fills (implementat 2026-05-13): `renderSuccessionOverlay` mostra tots els fills, marca el millor, el jugador tria.
- Acció "Educar Fills" implementada a les 3 eres (implementat 2026-05-13).
