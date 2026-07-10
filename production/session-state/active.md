<!-- STATUS -->
Epic: Bloodline — Feedback 2026-07-10
Feature: STANDALONE-TDB + HEIR-WARN + UPG-UX + agents en curs
Task: Commit 6db0229 pujat; agents SEQ-ARCH i BALANCE-REVIEW en background
<!-- /STATUS -->

## Resum sessió 2026-07-10

### Implementat avui (commit 6db0229)
- ✅ STANDALONE-TDB: 4 standalones gatiades per TdBs (caca_llanca→tdb_02; ritual_foc+ahumar_carn→tdb_03; assecar_provisions→tdb_04)
- ✅ HEIR-WARN: threshold edat >= 8 → >= 10
- ✅ UPG-UX: upgrade s'aplica al descartar la card (_pendingUpgradeId), no al moment de pagar
- ✅ 22/22 tests passes

### Agents en background (en curs)
- SEQ-ARCH: agent gameplay-programmer (Sonnet) dissenyant spec per refactor turn pipeline → `design/gdd/bloodline/seq-arch-spec.md`
- BALANCE-REVIEW: agent economy-designer (Fable) revisant balanç 128 accions + 16 TdBs → `production/playtests/2026-07-10-balance-review.md`

### Pendent de revisar quan agents acabin
1. `design/gdd/bloodline/seq-arch-spec.md` — aprovar i planificar implementació SEQ-ARCH
2. `production/playtests/2026-07-10-balance-review.md` — llegir i prioritzar issues de balanç

### Backlog obert real
- SEQ-ARCH: disseny llest per implementar (pendent aprovació spec)
- DESIGN-02-IMPL [7]: Cadena lliure d'eines + "eines conegudes" (complex)
- DESIGN-02-IMPL [8]: Panell d'identitat de branca (UI)
- S3-06: Dead zone Gen 2 cicles 16-36

### DEFERRED
- ECON-03, ECON-04 (fins que playtest ho justifiqui)
