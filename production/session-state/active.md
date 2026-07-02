<!-- STATUS -->
Epic: Bloodline — Era 1 Content
Feature: ERA1-CONTENT
Task: DONE — 128 accions + 16 TdBs implementades
<!-- /STATUS -->

## Resum sessió 2026-07-02

### Tot completat avui
- ✅ TALLA-OUT + FOC-PREREQ-B + ESTRANGERS-UX (commit 8a2838f)
- ✅ DOCS-SYNC: CLAUDE.md + technical-preferences.md + READMEs (commit 5f138b3)
- ✅ ERA1-CONTENT: 16 TdBs + 128 accions + mecànica obsoleta (commit 5964ebd) — 22/22 tests

### Decisions preses
- FOC-PREREQ: opció B (accions lliures per inclinació, sense prereq UT)
- Contingut Fable: substitució completa de les 48 branques tech + accions antigues
- upgrade vs obsoleta: upgrade = botó a l'acció; obsoleta = avís ⚠️ al Mercat
- Llar: ja existia com a zona, no calien canvis
- act_ritual_terra no existia → act_pintar_esperits marcada com a `nova`
- Standalone conservats: ritual_foc, ahumar_carn, assecar_provisions, gran_ritual, caca_llanca

### Estat del backlog (P0/P1 obert)
- ERA1-CONTENT: ✅ DONE
- DESIGN-02-IMPL (mecànica, items 7-9): OPEN
  - [7] Cadena lliure d'eines + registre "eines conegudes" heretat
  - [8] Panell d'identitat de branca (frase/verb/risc)
  - [9] act_recollir_branques threshold fix (impuls max 0.50)
- DOCS-SYNC: ✅ DONE
- UX-01: OPEN (distinció visual TdBs vs accions al Mercat)
- TOKEN-FLIGHT: OPEN (animació icones)
- UX-02: OPEN (avís mort sense hereu)

### Pròxims passos recomanats
1. Playtest del nou contingut (16 TdBs, 128 accions) — pot revelar problemes de balanç
2. DESIGN-02-IMPL items 7-9 (mecànica eines + UI)
3. ID mapping complet del doc Fable a la taula d'assumpcions (act_abatre_presa → act_espiar_ramat, etc.)
