<!-- STATUS -->
Epic: Bloodline — SEQ-ARCH + BALANCE completats
Feature: Pipeline async + 24 correccions de balanç
Task: Commit 5a0b9d7 pujat; 22/22 tests
<!-- /STATUS -->

## Resum sessió 2026-07-10 (continuació)

### Implementat avui (commit 5a0b9d7)
- ✅ SEQ-ARCH: pipeline async complet (runTurnPipeline, drainPendingCards, runEndOfTurnPhase)
  - TOKEN-FLIGHT hack eliminat
  - Condicions de carrera SEQ-01 resoltes estructuralment
  - 12 funcions noves, 4 eliminades, 6 variables resolvers de Promise
- ✅ BALANCE R1–R8: 24 canvis de valor a data.js (Místic food, risc Caçador, eines, tokens, UTs)
- ✅ 22/22 tests passen

### Backlog obert real
- DESIGN-02-IMPL [7]: Cadena lliure d'eines + "eines conegudes" (complex)
- DESIGN-02-IMPL [8]: Panell d'identitat de branca (UI)
- S3-06: Dead zone Gen 2 cicles 16–36 (parcialment millorat per R6 ut_art 36→34)

### DEFERRED
- ECON-03, ECON-04 (fins que playtest ho justifiqui)
