<!-- STATUS -->
Epic: Bloodline — Era 1 Content
Feature: S1/S2-PATCH (TD-01..11)
Task: DONE — tots els bugs S1/S2 del playtest 2026-07-02 resolts
<!-- /STATUS -->

## Resum sessió 2026-07-02 (continuació)

### Tot completat avui
- ✅ Playtest ERA1-CONTENT (5 agents): 20 issues detectats (S1:4 · S2:7 · S3:7 · S4:2)
- ✅ S1-PATCH (commit 74c866f → rebased a 0b...):
  - TD-01: act_escoltar_estrangers executable (basePurchased + is_discovery_action)
  - TD-02: 13 discovery_skill_id bt_* → tdb_NN als EVENT_POOLS
  - TD-03: getActionUpgrade() guarda always-true eliminada (13 upgrades accessibles)
  - S3-04: null guard getEligiblePoolEvents per tdb_01/tdb_02 (universal_prereq nul)
- ✅ S2-PATCH (commit 72152ea → rebased):
  - TD-04: apr_veu_clan discovery_action_ids → accions TdB 8 existents
  - TD-05: ev_mamut_sol skill_modifier bt_punta_llanca → tdb_01
  - TD-06: pe_malaltia requires_skill bt_guariment_plantes → tdb_03
  - TD-07: dead code act_talla_avancada eliminat (3 llocs a game.js)
  - TD-08: 3 aprenentatges bonus_action_output → accions existents
  - TD-10: ev_tecnica_subtil not_has_skill bt_buri → tdb_07
  - TD-11: isSupersededByUpgrade() — cadena transitiva a getZoneActions
  - S3-03: requires_skill bt_coneixement_plantes (×2) → tdb_04
  - bt_guariment_plantes skill_modifier (×2) → tdb_03
- ✅ Push + deploy a GitHub Pages (main → origin)
- 22/22 tests passes

### Estat del backlog (P1/P2 obert)
- S1 bugs: ✅ TOTS RESOLTS
- S2 bugs: ✅ TOTS RESOLTS
- DESIGN-02-IMPL (mecànica, items 7-9): OPEN
  - [7] Cadena lliure d'eines + registre "eines conegudes" heretat
  - [8] Panell d'identitat de branca (frase/verb/risc)
  - [9] act_recollir_branques threshold fix (impuls max 0.50)
- TOKEN-FLIGHT (P2): OPEN
- UX-01 (P2): OPEN (distinció visual TdBs vs accions al Mercat)
- UX-02 (P3): OPEN (avís mort sense hereu)
- S3 bugs (no bloquejants): S3-01 (axis_above ja implementat — fals positiu),
  S3-02 (ev_eina_trencada ID duplicat), S3-05 (apr IDs parcials)
  S3-06 (dead zone Gen 2 c16-36), S3-07 (Místic domina salut tardà)
- S4 bugs: S4-01 (~30 IDs act_* obsolets a ACTION_ICONS), S4-02 (apr IDs morts parcials)

### Decisions preses (sessió anterior)
- FOC-PREREQ: opció B (accions lliures per inclinació)
- Contingut Fable: substitució completa (16 TdBs + 128 accions)
- upgrade vs obsoleta: upgrade = botó; obsoleta = avís ⚠️ al Mercat
- Standalone conservats: ritual_foc, ahumar_carn, assecar_provisions, gran_ritual, caca_llanca

### Pròxims passos recomanats
1. DESIGN-02-IMPL item [9]: threshold fix (trivial, 1 línia)
2. DESIGN-02-IMPL item [7]: cadena lliure d'eines (complex, game.js + data.js)
3. DESIGN-02-IMPL item [8]: panell d'identitat de branca (UI)
4. S3-02: ev_eina_trencada ID duplicat (1 línia data.js)
5. Playtest post-patch per verificar TdBs/upgrades accessibles en joc real
