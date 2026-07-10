# Production Backlog — Bloodline (JS prototype)

<!-- GESTIONAT per /drive i /feedback-loop. Editable a mà; mantén el format de capçalera de tasca. -->
<!--                                                                                                  -->
<!-- FORMAT DE CAPÇALERA: ## [PRIOR] [ESTAT] [TIPUS] — [ID] — Títol                                 -->
<!--   PRIOR: P0 (aquesta sessió) | P1 (propera sessió) | P2 (pròximament) | P3 (backlog llunyà)     -->
<!--   ESTAT: OPEN | IN-PROGRESS | DONE | BLOCKED | DEFERRED | WONTFIX                                -->
<!--   TIPUS: BUG | FEAT | BALANCE | CONTENT | DESIGN | QA | DOCS | NETEJA                            -->
<!--                                                                                                  -->
<!-- TARGET: prototypes/bloodline-v2/ (game.js, data.js, index.html, style.css)                      -->
<!-- prototypes/bloodline/ (sense -v2) ABANDONAT — no tocar                                          -->
<!-- GODOT (src/bloodline/) ABANDONAT — no afegir tasques que apuntin a fitxers Godot                -->
<!--                                                                                                  -->
<!-- ÍNDEX: 🔴 Prioritari · 🎨 Decidir (disseny) · 🔧 Desenvolupar (codi) · ✅ Resolt · ⛔ Wontfix    -->
<!-- Reorganitzat i deduplicat 2026-06-24. Tasques OBERTES amb cos complet; RESOLTES condensades.    -->

---
<!-- ════════════════════════════ 🔴 PRIORITARI ════════════════════════════ -->

## P1 OPEN DESIGN — SEQ-ARCH — Refactor arquitectural del turn sequence pipeline

- **Origen**: feedback recurrent usuari (SEQ-01 × 4 vegades). Decisió 2026-07-10: cal disseny formal.
- **Issue**: `executeAction()` usa setTimeout encadenats ad-hoc. El pipeline
  acció→animació→event→EOT no és explícitament seqüencial; cada fix ha afegit un nou pegat visual.
- **Estat**: agent de disseny llançat (2026-07-10) → output a `design/gdd/bloodline/seq-arch-spec.md`.
  Implementació pendent d'aprovació del doc.
- **Acceptance**: pipeline seqüencial explícit (callback/promise); acció→animació completa→event→EOT;
  sense setTimeout ad-hoc; verificat headless.

## P1 DONE BUG — STANDALONE-TDB — 4 accions al mercat sense gate TdB

- **Origen**: feedback usuari 2026-07-10. Vetlla al Foc i 3 més disponibles des del torn 1.
- **✅ RESOLT 2026-07-10** (commit 6db0229):
  - `act_caca_llanca` → `tdb_02` (La Pedra que Talla)
  - `act_ritual_foc` + `act_ahumar_carn` → `tdb_03` (El Cercle del Foc, requereix ut_foc)
  - `act_assecar_provisions` → `tdb_04` (La Nit Domada, requereix ut_foc)

## P2 DONE UX — HEIR-WARN — Warning hereu apareix massa aviat (edat 8)

- **Origen**: feedback usuari 2026-07-10.
- **✅ RESOLT 2026-07-10** (commit 6db0229): threshold canviat a `>= 10` (LIFE_EXPECTANCY 14).

## P2 DONE UX — UPG-UX — Upgrade actualitza el carrusel immediatament (no espera card)

- **Origen**: feedback usuari 2026-07-10. "No s'ha d'actualitzar l'acció en si" — el canvi ha
  de ser visible al tornar, no en el moment de pagar.
- **✅ RESOLT 2026-07-10** (commit 6db0229): `doUpgrade()` usa `_pendingUpgradeId` a la discovery card;
  `dismissDiscovery()` aplica `purchasedActionIds.add()` al descartar la card.

## P2 OPEN QA — BALANCE-REVIEW-0710 — Revisió balanç 128 accions + 16 TdBs (Fable)

- **Origen**: proposta usuari 2026-07-10.
- **Estat**: agent Fable llançat (2026-07-10) → output a `production/playtests/2026-07-10-balance-review.md`.
  Pendent de llegir informe i prioritzar issues.

## P0 DONE BUG — SEQ-01 — Els efectes de l'acció es veuen al fi de torn, no al fi d'acció

- **✅ RESOLT 2026-06-25** (commit 17462e9): output aplicat + `renderAll()` al fi d'acció; eliminat el
  diferiment d'output en events; tret `clearFloaters()` de l'inici de l'EOT. Verificat amb Playwright al
  RENDER VISIBLE (#hex-health mostra el +salut al fi d'acció amb el cicle sense avançar). 4t intent, ara sí.
  Diagnòstic original conservat sota per història.
- **🔴 REOBERT 2026-06-26 (test usuari a Pages)** — nova faceta de SALUT (2a): Contemplació mostra +6 (30→36)
  al fi d'ACCIÓ, però al fi de torn cau a 31. CAUSA: `game.js:954` `Math.min(cap, state.health)` s'aplica
  també en fase de CREIXEMENT (retalla la salut guanyada al cap jove ~31), mentre el fi d'acció clampa al max
  estàtic 40 (`game.js:1178`, `outDef.max`). El comentari del codi diu "decline phase" → el clamp no hauria
  d'actuar en creixement. Decisió de disseny pendent (clawback de salut jove: sí/no).
  · **2b NO és bug**: Recol·lectar Arrels 0→4, event +2, upkeep −2 = 4 és correcte (output aplicat 1 sol cop,
  `game.js:1176-1188`; sense doble compte). La confusió ve de LOG-01 (números no separats).
- **⚠️ 1r fix 2a INCOMPLET (commit 4efb4d7)**: `applyTurnUpkeep` deixava de retallar al fi de torn, però la
  salut guanyada per **events/tecnologies/habilitats** encara es retallava perquè `healthMax()` retornava el
  cap rampat (test usuari: Contemplació + event "+3❤️" → 30→31, el +3 es perdia).
- **✅ RESOLT 2026-06-26 (2n fix, complet)** — `healthMax()` redefinida: retorna el **pic** (40, o
  `currentHealthMax`) durant creixement/estabilitat i només baixa en declivi; `getHealthCap(age)` (rampa
  30→40) queda només com a deriva passiva de +1/torn. Ara totes les vies de guany (acció, event, tech,
  habilitat, fi de torn) respecten "no clawback". Verificat headless multi-torn: event +3❤️ es manté; la
  caiguda dels torns 3+ amb Contemplació-sol era **gana** (menjar a 0, −10), comportament correcte.
- **Fitxers**: `prototypes/bloodline-v2/game.js` (`executeAction`, `beginEndOfTurnPhase`,
  `proceedToEndOfTurn`, `clearFloaters`, `dismissEvent`, `applyFxFloaters`, `renderAll`)
- **Queixa recurrent de l'usuari** (3a+ vegada; encara trencat després de BL2-09, BL2-13 i el fix Clúster A del 2026-06-23):
  - **Repro A** — Triar "Contemplació" (output salut +3..6). El +6 de salut apareix quan acaba el
    donut de **fi de torn** (🌙), quan hauria d'aparèixer en acabar el donut de **fi d'acció**.
  - **Repro B** — "Recol·lectar Arrels" amb 1 de menjar → salta un event ("troballa inesperada") →
    **no s'actualitza res** fins que acaba el torn.
- **Diagnòstic (causa arrel)**:
  1. El render visible dels comptadors només passa a `renderAll()`. En el flux acció→fi-de-torn
     NO hi ha cap `renderAll()` entre aplicar l'output de l'acció i el donut de fi de torn → els
     comptadors no s'actualitzen visualment fins al `renderAll()` final de l'EOT.
  2. `clearFloaters()` a l'inici de `beginEndOfTurnPhase()` ESBORRA els floaters de l'acció (p.ex.
     el +6 de Contemplació) ~200 ms després d'aparèixer, abans que l'usuari els registri. El fix
     del 2026-06-23 va empitjorar això.
  3. En accions amb event de pool, l'output es DIFEREIX (`pendingActionResult`) fins que es descarta
     l'event (intencional, commit f5883e8). Combinat amb (1), l'usuari percep "res no s'actualitza".
- **Direcció de fix (NO implementar fins que l'usuari ho demani)**:
  - Afegir un "beat" visible al fi d'acció: `renderAll()` (actualització de comptadors) just després
    d'aplicar output/side_effects, i deixar que els floaters de l'acció es reprodueixin SENCERS abans
    del donut de fi de torn.
  - NO esborrar amb `clearFloaters()` els efectes propis de l'acció; només garantir que els floaters
    d'upkeep del donut 🌙 surten visualment separats.
  - Reconsiderar el model d'output diferit en events: l'usuari espera veure el resultat de l'acció al
    fi d'acció, DESPRÉS l'event (com a beat separat amb el seu impacte numèric — vegeu EVT-01),
    i només l'upkeep al donut 🌙 final.
- **Acceptance**:
  - Contemplació: el +salut es veu (floater + comptador) en acabar el donut d'ACCIÓ.
  - Acció amb event: el resultat de l'acció es veu al fi d'acció; l'event és un beat separat; l'upkeep
    només es veu al donut 🌙.
  - Cap efecte propi de l'acció "apareix" durant la fase d'upkeep.
- **Història**: BL2-09 (2026-06-18, upkeep després de l'event), BL2-13 (3 donuts), Clúster A
  (2026-06-23, gate `proceedToEndOfTurn` + `clearFloaters`) — tots insuficients. Aquest és el problema
  de fons (timing de render), no la seqüència de fases.

---
<!-- ════════════════════════════ 🎨 DECIDIR (disseny obert) ════════════════════════════ -->

## P1 DONE DESIGN — DESIGN-02 — Replantejament del model de progressió (branques × techs × habilitats × accions)

- **Fitxers**: `prototypes/bloodline-v2/data.js`, `design/eras/prehistoria/`, `design/gdd/bloodline/`
- **Origen (usuari 2026-06-24)**: ECON-01 i ECON-02 revelen que el problema de fons no és de tuning sinó
  d'**arquitectura**. Cal replantejar de manera holística:
  - Com funcionen les **4 branques** (Caçador, Recol·lector, Artesà, Místic) i la seva identitat.
  - Com es relacionen **tecnologies → habilitats → accions** (habilitats lligades a techs; accions a habilitats)
    i com es reparteixen al llarg de la línia de cicles de l'era (perquè cada generació tingui progressió real).
  - Com d'**intercanviables/compartibles** són habilitats i accions entre branques (p.ex. eines com a
    upgrades en canviar de branca — vegeu ECON-02).
- **Assignació**: **agent especialitzat** — disseny de sistemes (`game-designer` / `systems-designer`)
  per a l'arquitectura, amb `era-writer` + `era-historian` per al contingut. Possiblement via `/era-design`.
- **Absorbeix / dona marc a**: ECON-01 (sostenibilitat inter-generacional), ECON-02 (eines com a upgrade),
  i precedeix DESIGN-01 (justificació temàtica de les accions, passada posterior dins d'aquest marc).
- **Acceptance**: un document de disseny que defineixi el model branques/techs/habilitats/accions i la seva
  intercanviabilitat, ABANS de tocar `data.js`. Cap canvi de codi fins que el marc estigui aprovat.
- **✅ DECISIONS PRESES 2026-06-25** (sessió de revisió amb l'usuari; les 10 preguntes resoltes):
  - Doc 1 `branch-model-redesign.md` §7 i Doc 2 `progression-distribution.md` §9 contenen les
    decisions completes. Resum:
    - **Eines**: cadena **lliure** (1 eina activa, qualsevol eina upgrade de qualsevol altra);
      retorn a una eina ja coneguda pel llinatge = **gratuït** (cal set "eines conegudes" heretat).
    - **Místic**: **eliminar** `act_narrar_llegendes` + `act_cants_grup`; food del Místic via les
      3 accions-pont noves.
    - **Ponts**: afegir `Caçador→Artesà` i `Recol·lector→Místic` (roda completa).
    - **UI branca**: indicació actual + panell d'identitat (frase/verb/risc) en **tocar** la branca.
    - **Dead zones**: nova `bt_mapa_recursos` a `ut_art` (Artesà); família de foc del Caçador a
      `ut_foc` (`bt_carn_al_foc` + caça amb foc); `bt_coneixement_plantes` → `ut_foc` (bàsica) /
      `ut_corda` (expandida).
    - **Material**: **sense canvis** de knobs (cap 35 / decay 0.3 / min 2). El material no és tensió
      argumental: recurs de llinatge conservat + palanca de pacing futura via `purchase_cost`.
    - **Foc = UT transversal**: cada branca l'aprofita al seu estil (documentat a Doc 1 §2.3).
  - ECON-01 i ECON-02 queden **resolts** aquí. La feina de contingut/codi passa a **DESIGN-02-IMPL**.

## P0 DONE BUG — S1S2-PATCH — Bugs del playtest ERA1-CONTENT (TD-01..11)

- **✅ RESOLT 2026-07-02** (commits 74c866f + 72152ea, 22/22 tests):
  - **TD-01** `act_escoltar_estrangers` no s'executava → `basePurchased` inclou `is_discovery_action`
  - **TD-02** 13 `discovery_skill_id` bt_* → tdb_NN (EVENT_POOLS + null guard prereq)
  - **TD-03** `getActionUpgrade()` guarda always-true eliminada → 13 upgrades accessibles
  - **TD-04** `apr_veu_clan` discovery_action_ids morts → accions TdB 8 existents
  - **TD-05** `ev_mamut_sol` skill_modifier bt_punta_llanca → tdb_01
  - **TD-06** `pe_malaltia` requires_skill bt_guariment_plantes → tdb_03
  - **TD-07** Dead code `act_talla_avancada` eliminat (ACTION_ICONS + _qualBonus + badge)
  - **TD-08** 3 aprenentatges `bonus_action_output` morts → accions existents
  - **TD-10** `ev_tecnica_subtil` not_has_skill bt_buri → tdb_07
  - **TD-11** `isSupersededByUpgrade()` — cadena transitiva a `getZoneActions`
  - **S3-03** requires_skill bt_coneixement_plantes (×2) → tdb_04
  - Tots els bt_* restants en skill_modifier → tdb_NN equivalent
- **Nota**: TD-09 (resource_below) i S3-01 (axis_above) ja estaven implementats a `evaluateBlockedIf` — falsos positius del playtest.

## P0 DONE CONTENT — ERA1-CONTENT — Implementar contingut Era 1 de Fable (128 accions + 16 TdBs)

- **Origen**: document `design/gdd/bloodline/bloodline_era1_contingut.md` (Fable 5, 2026-07-02).
- **Abast**: substitució completa del contingut de branch-techs/habilitats/accions existent.
  Les 9 accions base i les 7 tecnologies universals es mantenen sense canvis.
- **Nou contingut**: 16 Tecnologies de Branca × 4 branques × 2 accions = 128 accions noves.
- **Mecànica nova**: tipus `obsoleta:` (compra al Mercat + avís) diferent de `upgrade:` (botó a l'acció).
- **Zona Llar**: ja existeix al codi (starts_discovered: false, apareix amb parella). ✓
- **IDs**: cal mapejar IDs assumits del doc contra els reals (`act_espiar_ramat`, `act_caca_llanca`, etc.)
- **Checklist**:
  1. [ ] Mapeig d'IDs base (acció base real → ID assumit al doc Fable)
  2. [ ] Eliminar branch techs i accions comprables existents (mantenir base + UT)
  3. [ ] Afegir les 16 entrades TdB a SKILL_DEFS (una per TdB, 4 branques cadascuna)
  4. [ ] Afegir les 128 accions a ACTIONS (format existent)
  5. [ ] Implementar mecànica `obsoleta:` a game.js (Mercat + avís que fa obsoleta altra)
  6. [ ] Verificar headless
- **Absorbeix**: DESIGN-02-IMPL items 1–6, DESIGN-01, PACE-01 (TdBs 1-2 cobreixen c0–c16)
- **✅ RESOLT 2026-07-02** (commit 5964ebd): 16 TdBs (tdb_01–tdb_16) + 128 accions + mecànica obsoleta_action_id.
  22/22 tests passes. Accions standalone conservades (ritual_foc, ahumar_carn, assecar_provisions, gran_ritual, caca_llanca).

## P1 DEFERRED CONTENT — DESIGN-02-IMPL — Aplicar les decisions de DESIGN-02 al contingut

- **⛔ ABSORBIDA per ERA1-CONTENT (2026-07-02)**: els items 1–6 (contingut d'accions) queden
  substituïts pel contingut de Fable (128 accions + 16 TdBs). Els items 7–9 segueixen vius:
  - [7] Cadena lliure d'eines + registre "eines conegudes" → DESIGN-02-IMPL-MECH
  - [8] Panell d'identitat de branca → DESIGN-02-IMPL-MECH
  - [9] `act_recollir_branques` threshold fix → DESIGN-02-IMPL-MECH
- **Fitxers**: `prototypes/bloodline-v2/data.js` (contingut), `prototypes/bloodline-v2/game.js`
  (eines/UI), `design/gdd/bloodline/`.
- **Assignació**: contingut (accions/habilitats a `data.js`) via `era-writer` + `era-historian`
  (`/era-design`); lògica d'eines i UI a `game.js` directament. Target = prototip JS (NO Godot).
- **Checklist**:
  1. [ ] **Eliminar** `act_narrar_llegendes` i `act_cants_grup` de `data.js` (Q2).
  2. [ ] **3 accions-pont del Místic** (`act_sacrifici_ritual`, `act_curacio_col·lectiva`,
     `act_narrar_territori`) com a substitut complet (Doc 1 §4.3).
  3. [ ] **2 accions-pont noves**: `Caçador→Artesà` i `Recol·lector→Místic` (Q3).
  4. [ ] **`bt_mapa_recursos`** a `ut_art` (Artesà): cartografia/comptatge/mesura + 1-2 accions (Doc 2 Q1).
  5. [ ] **Reubicar `bt_coneixement_plantes`** → `ut_foc`, partint accions bàsiques (`ut_foc`) vs
     expandides (`ut_corda`) (Doc 2 Q3).
  6. [ ] **Família de foc del Caçador** a `ut_foc`: `bt_carn_al_foc` + caça amb foc (torxa/batuda,
     endurir punta, fumar) (Doc 2 Q4).
  7. [ ] **Cadena lliure d'eines** (Q4) + **registre "eines conegudes"** heretat per a retorn gratuït
     (Q1) — `game.js` (`is_upgrade`/`upgrades_action_id` + nou set heretat al 100%).
  8. [ ] **Panell d'identitat de branca** en tocar la branca (frase/verb/risc) — UI (Q5).
  9. [ ] `act_recollir_branques`: ampliar threshold a `impuls max 0.50` (fix BRN-05, Doc 1 §6.3).
- **NO canviar**: knobs de material (cap/decay/min) — Q2/Q5 = sense canvis.
- **Acceptance**: les decisions de §7/§9 reflectides a `data.js`/`game.js`; cap dead zone d'Artesà
  (c36-49) ni Caçador (c10-15); `narrar_llegendes`/`cants_grup` fora; eines amb cadena lliure i retorn
  gratuït verificat; panell d'identitat accessible des de la branca.
- **Relació**: precedeix/absorbeix DESIGN-01 (justificació temàtica fina de cada acció dins d'aquest marc).

## P1 DONE DESIGN — ECON-01 — Sostenibilitat de la progressió entre generacions (→ DESIGN-02)

- **Font**: Playtest 2026-06-23, "Decisió #1".
- **Premissa del playtester**: el mercat queda buit a Gen 2 perquè l'hereu hereta totes les accions comprades.
- **CORRECCIÓ (usuari + codi, 2026-06-24)**: premissa **INVALIDADA**. `continueSuccession` (game.js:877)
  NO reinicia `state.cycle`; l'hereu neix amb `birthCycle = state.cycle` i el comptador és de tota l'era.
  Les tecnologies es descobreixen per cicle (`autoDiscoverUniversalTechs`), així que Gen 2+ ARRIBA a
  tecnologies → habilitats → accions noves que Gen 1 mai va assolir → el mercat NO està buit. Dir el
  contrari implicaria que en ~15-20 cicles passen TOTES les techs i es descobreixen TOTES les habilitats.
- **El que SÍ cal garantir**: que cada branca tingui accions repartides al llarg de la línia de tecnologies
  (no totes concentrades a les techs primerenques), perquè el mercat es mantingui viu cada generació.
- **✅ RESOLT 2026-06-25 (via DESIGN-02)**: les decisions de dead zones (Artesà a `ut_art`, Caçador a
  `ut_foc`, `bt_coneixement_plantes` a `ut_foc`) garanteixen accions repartides al llarg de la línia de
  techs per a cada branca → el mercat es manté viu cada generació. Implementació a DESIGN-02-IMPL.

## P1 DONE DESIGN — ECON-02 — Confirmar la força del rol d'eina (D3)

- **Font**: Playtest 2026-06-23, Decisió #2 (convergència de 3 agents).
- **Issue**: `ownsBranchToolRole()` fa que comprar 1 acció d'eina (cost 3) doni la fabricació de les 4
  branques gratis i salti el gate de tech de les secundàries. És el comportament decidit a D3, però cal
  confirmar si és la generositat desitjada.
- **Exemple concret**: compres "Forjar Punta" (eina del Caçador, 3 material). Si després derives cap a
  Artesà, pots usar "Façonar Estris" (eina d'Artesà) GRATIS, sense comprar-la ni desbloquejar la seva tech.
  Pagues 1 eina i tens les 4 branques cobertes. ¿És el que vols, o cal que cada branca es pagui la seva?
- **Direcció proposada (usuari 2026-06-24)**: tractar la substitució com una **acció d'UPGRADE**, no com
  "totes gratis". Igual que pujar de "caça d'animals petits" a "caça d'animals grans" és un upgrade de
  l'acció (no una acció nova), passar de fabricar llances (Caçador) a fabricar garbells (Recol·lector) és
  un upgrade: l'acció nova surt **deshabilitada** al carrusel (cal adquirir-la) i l'antiga desapareix.
  Reutilitza el sistema `is_upgrade`/`upgrades_action_id` existent.
- **Relació**: la "intercanviabilitat entre branques" és el cor de DESIGN-02; ECON-02 n'és el cas concret de les eines.
- **Acceptance**: la transició de l'eina d'una branca a l'altra es viu com un upgrade explícit (adquirible), no com una concessió gratuïta silenciosa.
- **✅ RESOLT 2026-06-25 (DESIGN-02 Q1+Q4)**: **cadena lliure** (1 eina activa; qualsevol eina és upgrade
  de qualsevol altra) + **retorn gratuït** a una eina ja coneguda pel llinatge (set "eines conegudes"
  heretat al 100%). Implementació a DESIGN-02-IMPL ítem 7.

## P1 DONE DESIGN — DESIGN-01 — Rethinking complet d'accions + habilitats (Era 1)

- **Fitxers**: `prototypes/bloodline-v2/data.js`, `design/gdd/bloodline/action-economy.md`,
  `design/eras/prehistoria/03-skills.md`
- **Issue**: el disseny d'accions (especialment branca Místic, potencialment totes) té 3 problemes:
  1. **Justificació temàtica feble**: si no pots explicar en una frase PER QUÈ una acció dona el recurs
     que dona, el disseny és incorrecte (p.ex. `narrar_llegendes`/`cants_grup` donen menjar sense raó creïble).
  2. **Diferenciació risc/recompensa insuficient** entre accions similars de la mateixa branca.
  3. **Falten accions-pont** que empentin la inclinació cap a ALTRES branques (les accions són el
     mecanisme de transició entre branques, no la confirmació de la branca actual).
- **Abast**: tota la branca Místic (16 accions + 8 habilitats); potencialment totes les branques.
- **Subtasca absorbida**: el redisseny d'eines per branca de l'antic BL2-06 (benefici d'eina diferent
  per Caçador/Artesà/Recol·lector/Místic) — parcialment fet via D1-D4; el matís per branca queda aquí.
- **Acceptance**: cada acció té justificació narrativa d'una frase per al seu output; cap dues accions de
  la mateixa branca donen el mateix recurs amb el mateix perfil de risc; ≥2 accions/branca són ponts temàtics.
- **Assignació (2026-06-24)**: a executar per **agent especialitzat** (`era-writer` + `era-historian`,
  via la skill `/era-design`), per indicació de l'usuari. No fer-ho manualment.
- **✅ RESOLT 2026-07-02 (via ERA1-CONTENT)**: Fable 5 ha generat les 128 accions amb justificació
  narrativa completa per acció, diferenciació risc/recompensa per branca, i ponts temàtics integrats.

---
<!-- ════════════════════════════ 🔧 DESENVOLUPAR (codi obert) ════════════════════════════ -->

<!-- ▼▼▼ NIT 2026-06-27 — lot autoritzat per treball autònom ▼▼▼ -->

## P1 DONE FEAT — TEACH-01 — Ensenyament d'aprenentatges per-fill (random apr → fill random no-ensenyat)

- **Origen**: feedback usuari 2026-06-27. Substitueix el model actual de flag `ensenyat` per personatge.
- **Fitxers**: `game.js` (triggerSuccession/herència 846-854, executeAction, nova card/discovery, log),
  `data.js` (`act_ensenyar` requires/effect 767-772), estructura `children` (afegir `taughtApr` per fill).
- **Model nou**:
  - Cada fill pot aprendre **1** aprenentatge → camp per-fill `child.taughtApr`.
  - "Ensenyar el Fill" ensenya **1 aprenentatge random** (dels que sap el pare) a **1 fill random** d'entre
    els fills que **encara no han après** cap aprenentatge.
  - Mentre quedi ≥1 fill no-ensenyat → acció ACTIVE. Quan no en quedi cap → **DESHABILITADA** amb indicació
    a la descripció ("Tots els fills ja han après").
  - Després d'ensenyar: **card** "Has ensenyat [aprenentatge] a [nom del fill]".
  - **Log**: fila del torn (tipus "aprenentatge ensenyat") — lligat a LOG-02.
  - Successió: cada fill-successor hereta **el seu** `taughtApr` (no un set compartit).
- **Tanca**: la confusió #4 (la transmissió ja funcionava; el flag d'1-cop despistava).
- **Acceptance**: ensenyes a cada fill un cop (random apr→fill random no-ensenyat); card + fila de log per
  ensenyament; acció deshabilitada+explicada quan tots han après; cada hereu neix amb el seu aprenentatge.
  Verificat headless (cadena gen→gen).
- **✅ RESOLT 2026-06-27**: `child.taughtApr` per fill; req `has_untaught_child`; `character_effect: teach_child`
  (random apr→fill no-ensenyat) + card `_isTeach` + fila de log (bucket `_turnTeachings`); `always_show_locked`
  ja deshabilita l'acció quan tots han après; successió → cada fill hereta `new Set([taughtApr])`. Substitueix el
  flag `ensenyat`. Verificat headless: avail before/mid=true, after-all=false; herència per-fill correcta;
  render del log mostra la fila d'ensenyament.

## P1 DONE FEAT — LOG-02 — Historial amb N registres per cicle (tots els tipus)

- **Origen**: feedback usuari 2026-06-27 (amplia LOG-01).
- **Issue**: ara 1 entrada/torn amb subcamps; cal **N línies per cicle**, una per cada cosa: acció, event,
  descobriment, habilitat apresa, **aprenentatge** (descobert i ensenyat-a-fill TEACH-01), **acció comprada**,
  **upgrade**.
- **Falta capturar**: aprenentatges (`checkAprenentagesAfterAction`), compres al mercat, upgrades, ensenyar.
- **Fitxers**: `game.js` (turnHistory schema + `openTurnHistory` render; punts de captura).
- **Acceptance**: per a un cicle amb diverses coses, l'historial mostra una fila per cada una amb el seu
  impacte. Verificat headless.
- **✅ RESOLT 2026-06-27**: refactor a un únic `entry.extras = [{icon,text}]` (helper `pushExtra`), buidat al
  **fi de torn** (no a l'inici), de manera que les **compres fetes entre torns** entren al cicle correcte.
  Captura: descobriments (foc/zones), habilitats (🧩), **aprenentatge descobert** (📖 Après), **aprenentatge
  ensenyat** (TEACH-01), **acció comprada** (🛒, `buyAction`), **upgrade** (⬆️, `doUpgrade`). Render amb
  compat per a entrades antigues (discoveries/skills/teachings). Verificat headless: 🔥 foc + 📖 aprenentatges
  + 🛒 compra apareixen a l'historial; render `th-extra` OK.

## P2 DONE BUG — FOOD-CAP-01 — "Assecar Provisions" no es deshabilita al cap màxim

- **Origen**: feedback usuari 2026-06-27.
- **Issue**: `act_assecar_provisions` puja el cap de magatzem (`food_cap_delta`). Amb `foodMax == FOOD_MAX`
  (20) ja no aporta res però segueix oferint-se → ha d'aparèixer **deshabilitada**.
- **Fitxers**: `game.js` (gate de visibilitat/disponibilitat; check `foodMax >= FOOD_MAX` o `max_executions`).
- **Acceptance**: amb foodMax al màxim, "Assecar Provisions" surt deshabilitada i explicada.
- **✅ RESOLT 2026-06-27**: `getActionVisibility` retorna FADED (no executable) per a accions amb
  `food_cap_delta` quan els usos s'esgoten (`>= max_executions`) o `foodMax >= FOOD_MAX`. Verificat headless:
  baseline ACTIVE, cap-màxim→FADED, usos-esgotats→FADED.

## P2 DONE BUG — EVT-OPT-MAT — Opcions d'event amb material_delta no apliquen material

- **Origen**: revisió EVT-01 (2026-06-26).
- **Issue**: `resolveDiscoveryOption` aplicava food/health_delta però **no** material_delta (ni pedra/eina).
- **✅ RESOLT 2026-06-27**: `resolveDiscoveryOption` aplica ara material/pedra/eina_delta (amb clamp) i ho
  registra al delta de l'event a l'historial. Verificat headless: material 10→6 (−4), log `+3🌾 -4🔵`.

## P1 DONE QA — TEST-HARNESS — Suite de tests headless reproduïble (tests/)

- **Origen**: petició usuari 2026-06-27 ("tests autònoms").
- **Objectiu**: convertir els scripts headless throwaway (verify-bl*.cjs) en un `tests/` real + runner.
  Cobertura: lògica pura (inclinació, cap de salut/no-clawback, herència aprenentatges, scoring) +
  integració headless (torn complet, log, successió). Servidor estàtic + Playwright.
- **Fitxers**: `tests/headless/*.cjs`, `tests/unit/*.js`, npm scripts existents (`test:unit`, `test:visual`).
- **Acceptance**: un comando executa la suite i passa; inclou casos dels fixos recents (2a, EVT-01, LOG-01/02,
  TEACH-01).
- **✅ RESOLT 2026-06-27**: `tests/headless/run.cjs` (+ `npm run test:headless`, + README). Arrenca servidor
  intern + Chromium, crida funcions internes (determinista, ràpid), surt ≠0 si falla (apte CI). 9 checks:
  START-01, 2a, EVT-OPT-MAT, FOOD-CAP-01, BAL-01, LOG-02, TEACH-01, SUCC-01, sense errors. **9/9 passats.**

## P1 DONE DOCS — DOCS-SYNC — Actualitzar docu + eliminar Godot del projecte

- **Origen**: petició usuari 2026-06-27. Decisió Godot: usuari 2026-07-01.
- **Decisió engine (2026-07-01)**: **Godot eliminat**. El joc viu és el prototip JS; Godot no s'usarà.
  La futura decisió d'engine (si cal un engine per a "gràfics xulos") és nova i s'escollirà quan toqui.
- **Tasques**:
  1. Eliminar o arxivar `src/bloodline/` (port Godot abandonat).
  2. Reescriure `CLAUDE.md` i `.claude/docs/technical-preferences.md`: treure totes les referències Godot;
     declarar JS/HTML com a stack actiu del prototip; deixar la decisió d'engine futura com a P3 oberta.
  3. Arxivar/eliminar `docs/engine-reference/godot/`, `docs/architecture/ADR-001-engine-godot4.md`.
  4. Actualitzar recomptes del README bloodline-v2 (~104 accions / 48 branch-techs reals vs 79/30 declarats).
  5. Actualitzar systems-index si escau.
- **Acceptance**: cap referència activa a Godot a CLAUDE.md ni technical-preferences; docu coherent amb
  la realitat (prototip JS actiu); recomptes correctes; `src/bloodline/` arxivat o eliminat.
- **✅ RESOLT 2026-07-02** (commit 5f138b3): CLAUDE.md i technical-preferences.md reescrits (JS actiu,
  Godot abandonat); README bloodline-v2 amb recomptes correctes; src/bloodline/README.md d'arxiu.

## P1 DONE QA — TEST-PLAN — Pla de proves manual per a l'usuari

- **Origen**: petició usuari 2026-06-27.
- **✅ RESOLT 2026-06-27**: `production/qa/test-plan.md` — checklist per 9 sistemes + taula de fixos recents
  amb commits + secció de pendents.

## P2 DONE DOCS — NEXT-STEPS — Roadmap/next-steps prioritzat

- **Origen**: petició usuari 2026-06-27.
- **✅ RESOLT 2026-06-27**: `production/next-steps.md` — roadmap P0→P4 (qualitat, DESIGN-02-IMPL, UX, docs,
  decisió d'engine, mitjà termini) + recomanació d'ordre.

<!-- ▲▲▲ NIT 2026-06-27 ▲▲▲ -->

<!-- ▼▼▼ PLAYTEST 2026-06-27 (matí) — 15 punts de l'usuari, agrupats en 10 ▼▼▼ -->

## P1 DONE BUG — HEALTH-02 — Mort amb salut suficient (#5)
- **Origen**: usuari 2026-06-27. Tenia 18 salut, baixava ~7, menjar suficient → quedava 11, però ha mort.
- **DIAGNÒSTIC (simulació headless)**: NO és un bug de salut. La mort ve de `lifeProgress≥1` (pressupost de
  vida), no de salut≤0. La matemàtica 18→11 és correcta. PERÒ `agingFactor` inflava `lifeProgress` → fins i
  tot un personatge sa moria a edat ~15 (no 20), trencant el ritme de ~5 generacions/era.
- **✅ RESOLT 2026-06-28**: recalibrat `BASE_LIFE_INC = 1/(LIFE_EXPECTANCY * AGING_FACTOR_MEAN(1.3))` per
  compensar la mitjana d'agingFactor. Ara: **sa→~19-20**, malalt→~15, crític→~13 (la penalització per salut
  baixa es manté). Verificat headless (harness: personatge sa ≥18). 
- **⏳ Follow-up recomanat (no urgent)**: **visibilitat** — mostrar el `lifeProgress` (barra de vida/edat) i
  una causa de mort clara ("Vida complerta" vs "Salut esgotada") perquè la mort per edat no sorprengui. La
  causa ja es distingeix al codi; falta destacar-la i fer visible el progrés de vida. → veure DISABLE-MSG-01/UI.

## P1 DONE BUG — FIBER-01 — "Recollir fibres" no fa res (#6)
- **Origen**: usuari 2026-06-27. L'acció de recollir fibres no té efecte visible.
- **DIAGNÒSTIC**: `act_recollir_branques` SÍ dona el recurs `branques` (Fibres 🌿, 2-4), però aquest recurs
  **no es mostrava enlloc** a la UI (pedra/eina sí, com a chips al Campament; fibres no) → "no passa res".
- **✅ RESOLT 2026-06-28**: afegit el chip de fibres (🌿) al Campament (amb pedra/eina) i al **Bosc** (on es
  recullen), perquè l'acció tingui feedback visible. Verificat headless (chip 🌿 al DOM + output a `branques`).
- **Nota**: una visualització unificada de recursos secundaris (pedra/fibres/eina) seria una millora futura.

## P1 DONE BUG — SKILL-DISC-01 — No es poden descobrir les habilitats de branca (#2) [escala UX-01]
- **Origen**: usuari 2026-06-27 (recurrent).
- **DIAGNÒSTIC (headless)**: el mecanisme funciona (executar "Escoltar els Estrangers" desbloqueja la habilitat
  més madura elegible). PERÒ l'acció **només es mostrava si ja hi havia habilitats elegibles** (game.js:1700) →
  amb inclinació inicial ~0.05 cap n'és elegible → l'acció quedava OCULTA i el jugador no veia la via.
- **✅ RESOLT 2026-06-28**: l'acció es mostra ara **sempre que hi hagi ≥1 tecnologia descoberta**; si encara no
  hi ha cap habilitat elegible, en executar-la rep un missatge guia ("apuja una inclinació…") i NO gasta torn.
  Descripció reescrita ("aquí es desbloquegen les habilitats; cal una inclinació marcada"). Verificat headless.

## P1 DONE UX — DISABLE-MSG-01 — Motius de deshabilitació contextuals (#3, #11)
- **Origen**: usuari 2026-06-27. Una acció FADED mostrava sempre "t'allunyes de la branca".
- **✅ RESOLT 2026-06-28**: nova funció `disableReason(action)` que dona el motiu REAL segons la causa:
  magatzem al màxim (assecat), "tots els fills ja han après" (ensenyar), edat insuficient, inclinació
  insuficient/al límit, requisits de recurs/destresa/aprenentatge/parella/fill. Substitueix el ternari genèric
  de `updateCarouselInfo`. Verificat headless (magatzem + fills ensenyats).

## P1 DONE FEAT — FOOD-02 — Economia de menjar: cap, progressió i overflow (#13, #14)
- **✅ RESOLT 2026-06-28**: (#13) `FOOD_MAX_START` 8→**6**; `act_assecar_provisions` `max_executions` 3→**2**
  (assecat bàsic puja 6→8→10, després deshabilitat via FOOD-CAP-01; més ampliació = upgrades futurs).
  (#14) **Overflow temporal**: el menjar generat (acció/event/opció) pot **superar el cap durant el torn**
  (no es clampa al moment) i només es retalla al cap **al fi de torn** (després de l'upkeep). Verificat headless.
- **Origen**: usuari 2026-06-27.
- **#13 progressió del cap**: començar la partida amb cap **6** (no 8); l'assecat bàsic puja fins a **~10** (no 20);
  ampliacions majors només via **upgrade d'acció** o **habilitat nova** (encara no previst). Descripció correcta al màxim.
- **#14 overflow temporal**: generar menjar per sobre del cap s'ha de **permetre durant el torn** (per poder gastar-lo);
  només al **fi de torn** es retalla fins al cap. (Mateix principi que la salut 2a: no clampar abans d'hora.)
- **Acceptance**: cap inicial 6; assecat bàsic ≤10; menjar pot superar el cap dins del torn i es retalla a l'EOT.

## P1 DONE UX — LOG-03 — Layout del log en 3 columnes (#4, #12)
- **✅ RESOLT 2026-06-28**: render reescrit a **3 columnes** — cicle (esquerra, **un sol cop** per cicle) +
  graella `tipus | fet+delta`. Cada cosa del cicle (acció, event, descoberta, habilitat, aprenentatge, compra,
  upgrade, ensenyament, upkeep) és **una fila pròpia** amb la seva etiqueta de tipus. Layout flex + sub-grid
  (`.th-rows`). Verificat headless (4 files, cicle un cop). #12 (categories a línies separades) queda cobert
  per al log; si es vol també al panell de personatge, és un retoc menor a part.
- **Origen**: usuari 2026-06-27. Estructura: **col 1 = cicle** (fusionada si el cicle té diverses files, es veu un
  cop); **col 2 = tipus** (acció / descoberta / esdeveniment / compra / upgrade / aprenentatge / habilitat…);
  **col 3 = el fet** amb recompensa i cost si té sentit. #12: categories (branca/destresa/aprenentatge) cada una a
  la seva línia — *confirmar si és el log o el panell de personatge*.
- **Relació**: refà la presentació de LOG-02 (dades ja capturades a `entry.extras`).

## P1 DONE BUG — APR-01 — Botànica/plantes medicinals: outputs i categoria (#8, #9, #10)
- **Origen**: usuari 2026-06-27.
- **DIAGNÒSTIC**: `d_botanica` (DESTRESA "Botànica", +1 DESTRESA_BONUS) i `apr_plantes_medicinals` (APRENENTATGE)
  bufaven **tots dos** `act_recollectar_arrels` → "donen el mateix" (#8) i s'apilaven: 1-3 base +1 destresa +1/+2
  apr = fins a 6 menjar a una acció base (#10).
- **✅ RESOLT 2026-06-28 (#8, #10)**: `apr_plantes_medicinals` reorientat a buffar `act_recollida_bolets`
  (recollida medicinal, food+salut), **no** arrels. Ara: Botànica (destresa) = +food a arrels (màx ~4);
  Plantes Medicinals (aprenentatge) = +recollida de bolets. Rols distints, sense doble stacking. Verificat headless.
- **#9 (clarificat, no era bug)**: "Botànica" ÉS una destresa (correcte); les destreses també s'aprenen jugant.
  La confusió ve de no distingir destresa vs aprenentatge a la UI. → la separació visual clara (destresa /
  aprenentatge cada un a la seva línia) es fa a **LOG-03** (#12).

## P2 DONE DESIGN — ACT-DIFF-01 — Vetlla al Foc vs Contemplació competeixen (#1)
- **Origen**: usuari 2026-06-27. Totes dues donaven ~+5 salut sense diferència.
- **✅ RESOLT 2026-06-28**: diferenciades per rol/perfil. **Contemplació**: lliure, base, salut 3-6, espiritualitat
  +0.08 (Místic), individual/introspectiva. **Vetlla al Foc**: de pagament (4) + requereix foc, salut **5-8**
  (cura tot el grup, més), sociabilitat +0.08 (Recol·lector/social), construeix vincle. Spiritual-petit-lliure
  vs social-gran-gated. Verificat headless.

## P1 DONE DESIGN/CONTENT — TOOLS-01 — Acció de crear eines (#7) [→ DESIGN-02-IMPL eines]
- **Origen**: usuari 2026-06-27. "Practicar la Talla" sense output (D1) → inútil; calia una acció de crear eines.
- **✅ RESOLT 2026-06-28**: "Practicar la Talla" → **"Tallar una Eina"** (base, accessible): recepta **2 pedra +
  1 fibra** → crea **eina** (consumeix els recursos). Les accions per-branca (Forjar Punta, etc.) ja existien amb
  receptes 2pedra+1fibra / 2fibra+1pedra i ara són **descobribles** (gràcies a SKILL-DISC-01) → queden com les
  eines especialitzades. Bonus: `d_talla_silex` (CLEAN-01) ja no és inert (l'acció torna a tenir output → la
  destresa dona +1 eina). Verificat headless.
- **Nota**: el model complet "cadena lliure + retorn gratuït" segueix al draft **DESIGN-02-IMPL** (pendent
  d'aprovació); això n'és la part accessible/bàsica.

## P2 DONE FEEL — FLOATER-01 — Animació de floaters per recurs (#15)
- **Origen**: usuari 2026-06-27.
- **✅ RESOLT 2026-06-28**: `spawnResBalls` estès de només-material a **menjar/salut/material**: spawna tantes
  icones (emoji del recurs) com unitats generades/perdudes, volant del donut al seu comptador, amb **glow verd**
  (guany) o **vermell** (pèrdua). El popup **+N/−N** al comptador el segueix fent `applyFxFloaters`. Verificat
  headless (res-ball + res-ball-pos creats).
- **Follow-up menor**: pedra/eina/fibres encara no tenen icones volant (es mostren com a chips de mapa, sense
  comptador fix d'ancoratge); i el +N podria sincronitzar-se a l'arribada de les icones (ara surt alhora).

<!-- ▲▲▲ PLAYTEST 2026-06-27 (matí) ▲▲▲ -->

<!-- ▼▼▼ FEEDBACK 2026-06-29 (revisió del mapa de contingut) ▼▼▼ -->
## ✅ DONE — Feedback 2026-06-29 (5 punts, tots verificats harness 20/20)
- **F1**: "Espiar el Ramat" → **"Abatre una Presa"** (nom que implica caça).
- **F2 (revisa TOOLS-01)**: les eines NO es fan amb una acció base. "Tallar una Eina" revertida a **"Practicar la
  Talla"** (pràctica, sense output — guanya enginy/destresa). Les eines vénen de les **habilitats per-branca**
  sota `ut_eines` (Forjar Punta, etc.), com volies.
- **F3**: nou mecanisme **assist** — tenir **pedra** ajuda a caçar (**−3 salut en lloc de −5**) abans de saber fer eines.
- **F4**: tenir **fibres** ajuda a recol·lectar arrels (**+1 output**, cistell improvisat).
- **F5**: **Contemplació** penalitzada vs Vigilar — cura més (3-6) però **0 material**; Vigilar cura menys (2-4)
  però rendeix material + cohesió social. Diferenciades.
- **Mecanisme assist** (`game.js executeAction`): `action.assist = { resource, min, output_delta?, health_delta?, desc }`
  — si tens el recurs, modifica output/side_effect i ho registra. Reutilitzable.
<!-- ▲▲▲ FEEDBACK 2026-06-29 ▲▲▲ -->

## P1 DONE BUG — START-01 — La branca inicial ha de ser sempre Recol·lector

- **✅ RESOLT 2026-06-25** (commit 17462e9): `freshInclination()` dona `sociabilitat: 0.05` → Recol·lector
  actiu i determinista des del torn 1. Verificat (5/5 partides noves → branch_gatherer).
- **✅✅ VERIFICAT PER USUARI 2026-06-26 (Pages)**: sempre Recol·lector en partides noves. TANCAT.

- **Fitxers**: `prototypes/bloodline-v2/game.js` (`freshInclination`, `initState`, `getActiveBranches`)
- **Issue**: En començar partida, `freshInclination()` posa tots els eixos a 0.0 → totes les branques
  empatades a 0% → `getActiveBranches()` cau al fallback i tria una branca **aleatòria**.
- **DECIDIT (usuari 2026-06-24)**: la branca inicial ha de ser SEMPRE **Recol·lector** (eix `sociabilitat`,
  confirmat a `BRANCH_AXIS`). Si cal desviar les inclinacions del centre absolut a l'inici, fer-ho. → llest per implementar.
- **Direcció**: a l'inici de partida (Gen 1), donar a `sociabilitat` un valor positiu petit perquè
  Recol·lector sigui la branca activa des del torn 1. (Els hereus per successió hereten inclinació, així
  que això només afecta l'arrencada de Gen 1.)
- **Acceptance**: nova partida → Recol·lector és la branca activa/primària des del primer torn, de manera determinista.

## P1 DONE FEAT — EVT-01 — Els events han de mostrar l'impacte numèric real a la targeta

- **✅ RESOLT 2026-06-25** (commit 17462e9): les targetes d'event mostren l'impacte numèric
  (food/health/material/pedra/eina) tant per opcions com per events de descartar/troballa. Verificat ("+3🌾").
- **🔴 REOBERT 2026-06-26 (test usuari)**: en events AMB opcions, el div `ev-impact-hint` NO es neteja → es
  queda un impacte ranci d'un event anterior SENSE opcions (p.ex. "+3❤️") imprès a la targeta del fong, aliè a
  les 2 opcions, i que no s'aplica. CAUSA: `renderInMapOverlay` només amaga `ev-impact-hint` a la branca sense
  opcions (`game.js:2107-2108`), mai a la branca amb opcions (`game.js:2061-2088`). Cal amagar-lo sempre que
  l'event tingui opcions (o al principi del render d'event).
- **✅ RESOLT 2026-06-26 (working tree, pendent de commit/deploy)**: `renderInMapOverlay` amaga `ev-impact-hint`
  al principi del render d'event → cap impacte ranci en events amb opcions. Verificat headless (`display:none`
  amb event d'opcions després d'un impacte previ).

- **Fitxers**: `prototypes/bloodline-v2/game.js` (`renderInMapOverlay` pane-event), `index.html`
- **Issue (usuari 2026-06-24)**: quan passa un event, la targeta no diu l'impacte real en números
  (p.ex. +3 menjar, −5 salut). Els events amb opcions mostren un hint per opció, però els de descartar
  i els de "troballa" no mostren el resultat concret.
- **Acceptance**: tota targeta d'event mostra clarament l'impacte numèric que tindrà (o ha tingut) sobre els recursos.
- **Relacionat**: SEQ-01 (timing del render de l'impacte).

## P1 DONE BUG — LOG-01 — El log/historial no desa els events, només les accions

- **✅ RESOLT 2026-06-25** (commit 17462e9): `dismissDiscovery`/`dismissEvent` registren l'event a
  `_pendingTurnEntry.event` → apareix al turn history. Verificat.
- **🔴 REOBERT 2026-06-26 (test usuari)**: incomplet. (a) Barreja números: `action` i event comparteixen camps
  i el "upkeep" suma el net del fi de torn (incloent el clamp de salut) → no es veu què ha donat l'acció vs
  l'event per separat. (b) Descobriments NO es desen: el foc (`autoDiscoverUniversalTechs`, `game.js:972`) crea
  un pendingDiscovery, però `_pendingTurnEntry` ja s'ha buidat (`game.js:998-1000`) abans que el jugador el
  descarti → `dismissDiscovery` (`game.js:2127`) no té on escriure. (c) Habilitats igual (es claven al camp
  `event`, first-wins). Cal esquema ric: `{action:{name,delta}, events:[{name,choice,delta}], discoveries:[], skills:[]}`.
- **✅ RESOLT 2026-06-26 (working tree, pendent de commit/deploy)**: esquema ric implementat —
  `action:{name,delta}`, `events:[{name,choice,delta}]`, `discoveries:[]`, `skills:[]`, `upkeep` separat.
  Descobriments/habilitats es capturen en un bucket transitori del torn (`_turnDiscoveries`/`_turnSkills`) i
  s'adjunten al fi de torn (resol el cas del foc, que es descobria després de buidar l'entrada). Render
  defensiu (compatible amb entrades antigues). Verificat headless: Contemplació → `action.delta "+3❤️"`,
  `events:[]`, `discoveries`/`skills` arrays, `upkeep "-2🌾"`.
- **✅ VERIFICAT 2026-06-26 (headless multi-torn fins al cicle 10)**: el **foc** (`🔥 El Foc`, cicle 10) i les
  **habilitats** (p.ex. `Rituals de la Flama`) es desen a l'historial com a entrades separades
  (`discoveries`/`skills`), a més d'acció+delta i events+delta. Si l'usuari no ho veu: cache/deploy o no
  haver arribat al foc (cicle 10) en aquella partida.

- **Fitxers**: `prototypes/bloodline-v2/game.js` (`addLog`, `turnHistory`, `_pendingTurnEntry`,
  `openTurnHistory`)
- **Issue (usuari 2026-06-24)**: el log guarda les accions però no els esdeveniments. Verificar tant
  el log d'accions (`addLog`) com l'historial de torns (`turnHistory`): els events de descobriment/
  exploració (`pendingDiscoveries`) en particular no semblen quedar registrats a `_pendingTurnEntry.event`.
- **Acceptance**: cada event que es dispara queda registrat al log/historial visible amb el seu nom i resultat.

## P1 DONE NETEJA — TALLA-OUT — Eliminar `act_tallar_pedra` ("Practicar la Talla") i netejar refs

- **Origen**: feedback usuari 2026-07-01. Decisió: l'acció va fora sense excepció.
- **Fitxers**: `prototypes/bloodline-v2/data.js`, `game.js`
- **Canvis necessaris**:
  1. Eliminar l'entrada `act_tallar_pedra` de `ACTIONS` (`data.js:667`).
  2. Eliminar `act_tallar_pedra` de `ACTION_INCLINATION_REQUIREMENTS` (`data.js:596`).
  3. Rerouting destresa `d_talla_silex` (`data.js:128`): el camp `action_id` apunta a `act_tallar_pedra`
     — canviar a `act_recollectar_pedra` (ja és a la mateixa descoberta) o eliminar el camp.
  4. Eliminar `act_tallar_pedra` de `discovery_action_ids` de `apr_treball_pedra` (`data.js:166`).
  5. Verificar que `act_talla_avancada` (upgrade que requereix `d_talla_silex`) segueixi funcionant
     (la destresa es pot adquirir per `act_recollectar_pedra` si es rerouting).
- **✅ RESOLT 2026-07-02** (commit 8a2838f): `act_tallar_pedra` i `act_talla_avancada` eliminades;
  `d_talla_silex` redirigida a `act_recollectar_pedra`; test TOOLS-01 actualitzat. 22/22 passes.

## P1 DONE DESIGN — FOC-PREREQ — Treure `universal_prereq: "ut_foc"` d'"Assecar Provisions" i "Vetlla al Foc"

- **Origen**: feedback usuari 2026-07-01. Decisió: cap acció depèn d'un descobriment universal.
- **Fitxers**: `prototypes/bloodline-v2/data.js`
- **Accions afectades**:
  - `act_assecar_provisions` "Assecar Provisions" (`data.js:1103`): treure `universal_prereq: "ut_foc"`.
  - `act_ritual_foc` "Vetlla al Foc" (`data.js:677`): treure `universal_prereq: "ut_foc"`.
- **Decisió pendent — com es desbloquegen ara?** Opcions:
  - (A) Via branch tech existent: "Assecar Provisions" → `bt_cuina_conservacio`; "Vetlla al Foc" → `bt_guardia_flama` o nova tech espiritual.
  - (B) Disponibles al mercat des del principi (gated només per `inclination_conditions` i `purchase_cost`).
  - Recomanació: opció (A) — és més coherent amb el model de progressió general.
- **Nota**: `act_ritual_foc` té `inclination_conditions: { espiritualitat: min: 0.05 }` via `ACTION_INCLINATION_REQUIREMENTS`; conservar-ho.
- **✅ RESOLT 2026-07-02** (commit 8a2838f): opció B aplicada — `universal_prereq: "ut_foc"` tret de
  `act_ritual_foc`, `act_assecar_provisions` i `act_gran_ritual`. Totes accessibles per inclinació.

## P2 DEFERRED BALANCE — ECON-03 — No hi ha sumiders reals de material (`material_min ?? 2`)

- **Font**: Playtest 2026-06-23, S3-01 (optimizer MAT-10).
- **Issue**: les accions sense `material_min/max` explícit generen 2-3 material per defecte
  (`(action.material_min ?? 2)`). Accions pensades com a cost net (p.ex. `act_alimentar_foc`,
  `act_parar_trampes`) en realitat generen material → cap sumider real tret de `material_min/max: 0` explícit.
- **Direcció**: canviar el default a `?? 0`, o marcar explícitament quines accions generen material.
- **Acceptance**: les accions que han de ser cost net de material no en generen; economia amb sumiders reals.
- **DECISIÓ 2026-06-25 (DESIGN-02 Q2/Q5) — DIFERIT**: el material **no és una tensió** (recurs de
  llinatge conservat + palanca de pacing via `purchase_cost`). El sumidor "per tensió" queda diferit.
  Es manté com a opció el fix de *correctness* (accions pensades com a cost net no haurien de generar
  material) si un playtest ho justifica.

## P2 DEFERRED BALANCE — ECON-04 — Cap de material (35) + decay 0.3 → riquesa plana entre generacions

- **Font**: Playtest 2026-06-23, S3-02/03 (dynasty, optimizer).
- **Issue**: `floor(35 × 0.3) = 10` tokens heretats fixos independentment de com jugui el jugador (sense
  arc de riquesa de dinastia); a més el cap s'assoleix massa ràpid → poca tensió de pressupost a Gen 2+.
- **DECISIÓ 2026-06-25 (DESIGN-02 Q2/Q5) — DIFERIT**: NO es toquen cap/decay/min ara. El material no és
  un arc de riquesa dinàstica per disseny; la palanca de pacing de reserva per al futur és `purchase_cost`
  (encarir late-tech), no el cap ni el decay. Aquesta tasca queda disponible si més endavant es vol
  convertir el material en una decisió real.

## P2 DONE DESIGN — PACE-01 — Dead zone pre-`ut_eines` (cicles ~6-16)

- **Font**: Playtest 2026-06-23, S2-01 (speed-runner).
- **Issue**: els perfils de branca d'eina (5 skills sota `ut_eines`, cicle 16) no tenen res nou a
  desbloquejar ni comprar entre el cicle ~6 i 16; el material s'acumula sense destí. A Gen 1 la branca
  només queda funcional ~cicle 18 de 20.
- **Direcció**: acostar `ut_eines` a cicle 10-12, o donar skills de 1a capa que no depenguin de `ut_eines`.
- **Acceptance**: cap tram llarg sense decisions/objectius de compra per a cap perfil de branca.
- **✅ RESOLT 2026-07-02 (via ERA1-CONTENT)**: TdBs 1–2 disponibles des del principi (c0, umbral ≥0.12/0.15)
  cobreixen el tram c0–c16. TdBs 3–4 al c10 (post-foc). Cap dead zone per a cap branca.

## P2 DONE UX — ESTRANGERS-UX — "Escoltar els Estrangers" silenciosa quan no hi ha habilitats elegibles

- **Origen**: feedback usuari 2026-07-01. Relacionat amb UX-01.
- **Issue**: l'acció és visible (fix SKILL-DISC-01 aplicat), però quan `getEligibleSkills()` retorna [] el
  codi fa `addLog(...)` i `return` sense cap feedback visual prominent. El jugador percep "no passa res".
- **Opcions**:
  - (A) Mostrar l'acció FADED (no executable) amb el missatge guia visible al carrusel sense clicar.
  - (B) Toast/overlay en clicar quan no hi ha elegibles (com el "No tens prou provisions" però visible).
  - (C) Abaixar el llindar d'alguna habilitat inicial per fer-la elegible des del torn 1.
- **✅ RESOLT 2026-07-02** (commit 8a2838f): opció A — FADED amb missatge guia "Apuja una inclinació
  cap a una branca per poder aprendre habilitats" quan `getEligibleSkills().length === 0`.

## P2 DONE UX — TOKEN-FLIGHT — Animació d'icones viatjant del donut als marcadors

- **Origen**: feedback usuari 2026-07-01. Distint del bug SEQ-01.
- **Descripció**: el jugador descriu icones que "surten del donut i es desplacen fins als marcadors
  corresponents"; l'efecte s'aplica quan l'icona arriba, i LLAVORS es dispara l'event o l'EOT.
  Els floaters actuals (fade-up in-place) no compleixen aquesta visió.
- **Abast**: nova feature d'animació — tween d'element des del centre del donut fins a cada marcador
  de recurs/stat; callback que aplica l'efecte a l'arribada. No és un fix del SEQ-01 existent.
- **Relació amb SEQ-01**: una implementació de token-flight resoldria el SEQ-01 de fons (la seqüència
  esdevé inherent a l'animació), però és una inversió de major abast.
- **Acceptance**: icones animades del donut → marcadors; efectes aplicats a l'arribada; events i EOT
  encadenats posteriorment.
- **✅ RESOLT 2026-07-03**: comptadors top-bar revertits als valors pre-acció immediatament després de renderAll(); boles volen 920ms; renderAll() als 920ms actualitza comptadors → event/EOT s'encadena just després.

## P2 DONE UX — UX-01 — Sense distinció visual al mercat entre accions gated-per-branca i universals

- **Font**: Playtest 2026-06-23, S2-02 (optimizer MAT-07 + claredat).
- **Issue**: sota D4 el jugador veu al mercat accions que requerien desbloquejar una branch tech i altres
  que apareixen en assolir una tech universal, sense distinció. Confusió: "he desbloquejat la tècnica però
  l'acció no apareix fins comprar-la".
- **Acceptance**: el mercat distingeix clarament "Disponible" vs "Requereix habilitat"; el flux desbloquejar→comprar és comprensible.
- **Relacionat #5 (2026-06-27)**: l'usuari no veu com s'obtenen les **habilitats de branca**. Mecanisme
  actual: l'única acció de descobriment és **"Escoltar els Estrangers"** (Campament), que apareix només quan
  hi ha habilitats elegibles (inclinació + tech universal complerta) i en desbloqueja la més madura → llavors
  les seves accions es fan comprables al mercat. NO es "compren" habilitats; es descobreixen via aquesta
  acció. Cal fer el flux molt més visible (o repensar-lo dins DESIGN-02-IMPL).
- **✅ RESOLT 2026-07-03** (commit 0d77c46): badge `shop-tdb-badge` afegit a `renderShop()` mostrant quin TdB desbloqueja cada acció del mercat. El jugador veu immediatament la TdB requerida per cada compra.

## P3 DONE BUG — SUCC-01 — pendingDeath/pendingSuccession no es desen (pèrdua en background-kill)

- **Font**: investigació #4 (2026-06-26/27). El save object (`game.js:147-186`) NO inclou `pendingDeath` ni
  `pendingSuccession`. Si l'app es tanca a la pantalla de mort/successió (abans de triar successor), en
  recarregar es perd la successió i l'herència associada (inclinació/habilitats/aprenentatges del successor).
- **#4 NO és bug de transmissió**: la re-transmissió d'aprenentatges heretats és CORRECTA — test headless
  gen1→gen2→gen3 (`apr_cures_basiques` arriba a gen3) i "Ensenyar el Fill" surt ACTIVE amb només un
  aprenentatge heretat. Si l'usuari ho va veure fallar: o gen2 no va completar "Ensenyar el Fill" (Llar,
  cal fill), o aquest edge de save a la pantalla de successió.
- **Acceptance**: una mort/successió pendent sobreviu un background-kill (desar pendingDeath/Succession, o
  re-derivar-la en carregar).
- **✅ RESOLT 2026-06-27**: save/load serialitzen `pendingSuccession` i `pendingDeath` (helpers
  `serialize/deserializeSuccessors` per als Sets dels successors) + `pendingNewGen`. Verificat headless:
  després de save→load la successió pendent es manté i `inheritedAprenentatges` torna a ser un Set correcte.

## P3 DONE UX — UX-02 — Avís de mort sense hereu poc visible

- **Font**: Playtest 2026-06-23, S3-04 (speed-runner).
- **Issue**: la finestra `act_cercar_parella` (edat 5-14) vs l'avís a edat 12; un jugador centrat en
  material pot perdre per extinció sense bloqueig clar.
- **Acceptance**: l'avís de risc d'extinció és prou visible/urgent abans que la finestra es tanqui.
- **✅ RESOLT 2026-07-03** (commit 0d77c46): pill `#heir-warn` afegida a `renderCharPanel()` que apareix quan el personatge té ≥8 cicles i cap fill. S'activa amb `classList.toggle('hidden', ...)`. Animació pulse vermella per cridar l'atenció.

## P3 DONE BALANCE — BAL-01 — `act_coure_ceramica` costa 5 al mercat però té `material 0/0`

- **Font**: Playtest 2026-06-23, S3-05 (optimizer MAT-04).
- **Issue**: inversió de 5 tokens que no contribueix a l'economia de material; probable omissió.
- **✅ RESOLT 2026-06-27**: `material_min/max` 0/0 → **2/3** (coherent amb "totes les accions donen
  material"). L'acció ja donava food 2-4; ara també material com la resta. Verificat.

## P3 DONE NETEJA — CLEAN-01 — `d_talla_silex` aplica DESTRESA_BONUS a una acció sense output

- **Font**: Playtest 2026-06-23, S4-01 (auditoria) — conseqüència de D1.
- **Issue**: amb D1, `act_tallar_pedra` ("Practicar la Talla") ja no té output, així que el DESTRESA_BONUS
  de `d_talla_silex` hi és inert. La destresa SEGUEIX valent com a prerequisit de l'upgrade `act_talla_avancada`.
- **✅ RESOLT 2026-06-27 (no-op)**: el `DESTRESA_BONUS` ja és **naturalment inert** — només s'aplica dins del
  bloc `if (outRes && action.output_min != null)` (game.js ~1150) i `act_tallar_pedra` no té output. Sense
  impacte funcional; cap canvi de codi necessari. La destresa segueix valent com a prereq de `act_talla_avancada`.

## P3 DONE CONTENT — C-02 — Títols de dinastia amb condicions verificables

- **Fitxers**: `prototypes/bloodline-v2/game.js` → `calculateScore()`
- **DECIDIT (2026-06-19)**: opció B — títols per fites numèriques (X generacions, Y techs). Falta NOMÉS
  implementar (prioritat baixa). Ja no és una decisió pendent.
- **Acceptance**: ≥6 títols amb condicions verificables; almenys 1 secret.
- **✅ RESOLT 2026-07-03**: 20 títols de dinastia (5 tiers × 4 eixos, condicions de score numèric) + 7 badges d'assoliment (5 normals + 2 secrets). Scores de TdBs corregit a `state.unlockedTdbIds.size` (únics, no sumats per gen). Breakdown end-screen: "habilitats" → "TdBs".

<!-- ▼▼▼ DISSENY 2026-07-03 — TdBs com a coneixement de llinatge ▼▼▼ -->

## P1 DONE DESIGN — TDB-LINEAGE — TdBs movent-se de personatge a llinatge

- **Origen**: discussió de disseny 2026-07-03 (usuari + agent).
- **Decisió**: les TdBs (Tecnologies de Branca) deixen de ser coneixement personal (`state.character.unlockedSkillIds`) i passen a ser coneixement col·lectiu del llinatge (`state.unlockedTdbIds`, top-level, com `discoveredUniversalTechIds`).
- **Implicacions implementades**:
  - `state.unlockedTdbIds` (top-level Set) reemplaça `state.character.unlockedSkillIds`
  - `createCharacter()` elimina `inheritedSkillIds`; successors no transporten TdBs
  - `unlockSkill()` escriu a `state.unlockedTdbIds`; log → "Nova Tecnologia de Branca"
  - Mercat, passive effects, events, score: tots llegeixen `state.unlockedTdbIds`
  - `getActionUpgrade()` afegit gate TdB (fix UPG-GATE)
  - Pills TdB al panell del personatge: secció "Llinatge sap:", click → tooltip (fix PILL-TOOLTIP)
  - Etiquetes UI: "Habilitats" → "Tecnologies de Branca"/"TdBs" (fix HABILITAT-RENAME)
  - Backwards compat: loadGame recupera TdBs de `d.character.unlockedSkillIds` (saves velles)
- **✅ RESOLT 2026-07-03**: 22/22 tests passats. Tanca UPG-GATE, PILL-TOOLTIP, HABILITAT-RENAME de passada.

<!-- ▲▲▲ DISSENY 2026-07-03 ▲▲▲ -->

<!-- ▼▼▼ FEEDBACK 2026-07-03 (7 punts del jugador) ▼▼▼ -->

## P1 DONE BUG — DISC-DOUBLE — Doble "Escoltar els Estrangers" al carrusel

- **Origen**: feedback usuari 2026-07-03, punt 5.
- **Root cause**: `getZoneActions()` (game.js:~1676-1695) fa `base.unshift(disc)` però `act_escoltar_estrangers`
  JA és a `base` perquè `basePurchased` l'inclou via el filtre `is_base || is_discovery_action`. Doble inserció.
- **Fix**: excloure `is_discovery_action` del filtre de `basePurchased`, o comprovar que `disc` no és ja present a `base` abans de fer `unshift`.
- **Fitxers**: `prototypes/bloodline-v2/game.js` (`getZoneActions`, ~1676)
- **Acceptance**: `act_escoltar_estrangers` apareix exactament 1 cop al carrusel.
- **✅ RESOLT 2026-07-03**: afegit `if (a.is_discovery_action) return false` al filtre de `getZoneActions()`. Les actions de descobriment s'exclouen del filtre base i s'afegeixen explícitament via `unshift`.

## P1 DONE BUG — ANIM-TIMING — L'event s'obre als 200ms mentre les boles de recurs volen fins a 880ms

- **Origen**: feedback usuari 2026-07-03, punt 7.
- **Root cause**: `setTimeout(() => { renderAll(); saveGame(); }, 200)` (game.js:~1264) obre l'event als 200ms,
  però `spawnResBalls` pot tardar fins a ~880ms (delay inicial + 700ms de vol).
- **Fix**: augmentar el timeout a ~700-900ms per deixar que l'animació acabi; o encadenar l'event a un callback de l'animació.
- **Fitxers**: `prototypes/bloodline-v2/game.js` (~1264)
- **Acceptance**: l'event (i el fi de torn) no apareix fins que totes les boles de recurs han aterrat als marcadors.
- **✅ RESOLT 2026-07-03**: ambdós `setTimeout` (event + EOT) canviats de 200ms a 920ms (bola màx: 4×80ms + 560ms vol = ~896ms).

## P1 DONE UX — UPG-GATE — El botó upgrade apareix sense tenir la TdB que el desbloqueja

- **Origen**: feedback usuari 2026-07-03, punt 2.
- **Root cause**: `getActionUpgrade()` (game.js:~1718-1726) no comprova si el personatge posseeix la TdB
  (`state.character.unlockedSkillIds`) que desbloqueja aquell upgrade via `unlocks_action_ids`.
- **Fix**: `const unlockingSkill = SKILL_DEFS.find(bt => (bt.unlocks_action_ids || []).includes(a.id));`
  `if (unlockingSkill && !state.character.unlockedSkillIds.has(unlockingSkill.id)) return false;`
- **Fitxers**: `prototypes/bloodline-v2/game.js` (`getActionUpgrade`, ~1718)
- **Acceptance**: el botó `↑` ONLY apareix quan el personatge té la TdB que desbloqueja aquell upgrade.
- **✅ RESOLT 2026-07-03**: `getActionUpgrade()` comprova `state.unlockedTdbIds`. Resolt de passada com a part de TDB-LINEAGE.

## P2 DONE UX — CHIP-ZONES — Chips de recursos apareixen en zones incorrectes

- **Origen**: feedback usuari 2026-07-03, punt 1.
- **Issue**: pedra (🪨) i fibra (🌿) apareixen als chips tant de Campament com de Bosc. Cada recurs hauria
  de mostrar-se ONLY a la zona on és la font primària.
- **Decisió pendent**: Campament → chip eina (🪃) only; Bosc → chip fibra (🌿) only; Planes → chip pedra (🪨) only.
- **Nota**: FIBER-01 (2026-06-28) va afegir 🌿 a Bosc i Campament per visibilitat. Ara cal acotar cada zona.
- **Fitxers**: `prototypes/bloodline-v2/game.js` (lògica de chips de zona, ~1584-1594)
- **Acceptance**: cada recurs secundari (pedra/fibra/eina) apareix com a chip ONLY en la zona on s'obté principalment.
- **✅ RESOLT 2026-07-03**: Campament → ⚒️ eina only; Bosc → 🌿 fibra only; Planes → 🪨 pedra only (afegida zona Planes). Pedra i fibra eliminades de Campament/Bosc on no s'obtenien.

## P2 DONE NETEJA — HABILITAT-RENAME — "Habilitats" → "Tecnologies de Branca" / "TdBs"

- **Origen**: feedback usuari 2026-07-03, punt 6.
- **Issue**: 5 llocs on el text visible o el log diu "habilitat/s" quan hauria de dir "Tecnologies de Branca" o "TdBs".
- **Llocs identificats**:
  1. `game.js:~540` — log d'unlock ("habilitat apresa" → "TdB desbloqueada")
  2. `index.html:~467` — panell de debug/test
  3. `index.html:~578` — panell de CD
  4. `game.js:~2721` — score (comptador d'habilitats → "TdBs")
  5. `game.js:~2112` — tipus al torn log (valor `'habilitat'` → pot quedar intern; el text visible sí)
- **Fitxers**: `prototypes/bloodline-v2/game.js`, `index.html`
- **Acceptance**: cap menció visible a la UI/log de "habilitat/s" referida a TdBs. El tipus intern `'skill'` pot mantenir-se per no trencar codi.
- **✅ RESOLT 2026-07-03**: log → "Nova Tecnologia de Branca"; panell test → "Tecnologies de Branca (TdBs)"; panell CD → "Tecnologies de Branca". Resolt de passada com a part de TDB-LINEAGE.

## P2 DONE UX — PILL-TOOLTIP — Les pills de TdB al panell de personatge no fan res en clicar

- **Origen**: feedback usuari 2026-07-03, punt 3.
- **Issue**: elements `pill-skill` (TdBs desbloquejades a `#layer-know`) no tenen `addEventListener`. L'usuari
  clica "els rastres del món" i no passa res. Les pills d'altres tipus (aprenentatge, destresa) sí que obren info.
- **Fix**: afegir click handler als `pill-skill` per mostrar nom + descripció de la TdB (tooltip/overlay existent).
- **Fitxers**: `prototypes/bloodline-v2/game.js` (`renderCharPanel`, ~2017-2025)
- **Acceptance**: clicar una pill de TdB obre un overlay/tooltip amb el nom i descripció de la tecnologia.
- **✅ RESOLT 2026-07-03**: pills TdB mostren emoji+nom i `addEventListener('click', showPillInfoTooltip(...))`. Resolt de passada com a part de TDB-LINEAGE.

## P3 DONE DESIGN — ESCOLTAR-LIMIT — "Escoltar els Estrangers" serveix ONLY per a descobrir TdBs

- **Origen**: feedback usuari 2026-07-03, punt 4.
- **Issue**: l'acció no té output ni side effect fora del flux de descobriment de TdBs. Un cop totes les
  TdBs estan descobertes (o l'acció és FADED per manca d'elegibles), no té cap altre propòsit.
- **Opcions**:
  - (A) Afegir output secundari (+saber o +inclinació social) per fer-la útil fora del context de TdBs.
  - (B) Limitar `max_executions` al nombre de TdBs descobertes (desapareix en acabar el seu cicle vital).
  - (C) Mantenir el disseny actual (acció de servei, no de producció) — documentar-ho millor a la UI.
- **Acceptance**: el jugador entén el propòsit de l'acció i no surt decebut si la crida quan no hi ha TdBs elegibles.
- **✅ RESOLT 2026-07-03 (opció C)**: descripció reescrita per deixar clar que és una "acció de coneixement, no de producció" i que "el que aprens queda al llinatge, no a la persona".

<!-- ▲▲▲ FEEDBACK 2026-07-03 ▲▲▲ -->

---
<!-- ════════════════════════════ ✅ RESOLT ════════════════════════════ -->

## ✅ RESOLT — Sessió 2026-06-23 (model d'eines + renaming)

- **DONE DESIGN — D1** — Fabricació d'eines NOMÉS per branca (`act_tallar_pedra`→"Practicar la Talla" sense
  eina; `act_preparar_eina` retirada; `act_talla_avancada` sense output d'eina). Commit 8770066.
- **DONE DESIGN — D2** — Eines = consumible-porta + glossari aclarit (no bonus passiu).
- **DONE DESIGN — D3** — Substitució automàtica de l'acció d'eina segons branca primària (helpers
  `isActionOwned`/`ownsBranchToolRole`/`getPrimaryToolActionId`). ⚠️ Força a confirmar → ECON-02.
- **DONE DESIGN — D4** — Accions de branca es compren al mercat (`unlockSkill` no les regala; `getBuyableActions`
  les mostra un cop desbloquejada la tech). ⚠️ Sostenibilitat inter-generacional → ECON-01.
- **DONE — Punt 5** — Renaming "Tallar Pedra" → "Practicar la Talla" amb descripció honesta.
- **⚠️ REOBERT — Punts 1/2 (seqüència de torn)** — el fix Clúster A (gate + `clearFloaters`) NO resol el
  problema de fons → vegeu **SEQ-01** (P0).
- Detall: `production/playtests/2026-06-22-manual-feedback.md` + `2026-06-23-targeted-tool-economy.md`.

## ✅ RESOLT — Sessions 2026-06-14 → 2026-06-18

- **BL2-01** Meta bar mostra menjar i salut · **BL2-02** Ghost pill tappable amb info ·
  **BL2-03** Badge de risc a accions amb cost de salut alt · **BL2-04** Pacing late-game
  (`ut_ceramica` cicle 70, `ut_agricultura` 85) · **BL2-05** Constants zombie de reputació eliminades
  (2026-06-16) · **BL2-08** Ghost pill avisa proximitat a condició max.
- **BL2-09** Upkeep després de l'event · **BL2-10** Fases comproven mort · **BL2-11** Menjar/salut amb
  upkeep i límit visibles · **BL2-12** Capacitat menjar al debug · **BL2-13** 3 donuts (acció/event/🌙) ·
  **BL2-14** Alertes crítiques explicades · **BL2-15** Avís d'augment de consum en néixer fill ·
  **BL2-16** Febre `is_single_use` + anti-repeat · **BL2-17** Copy destreses · **BL2-18** Hereu mostra
  destreses/aprenentatges · **BL2-19** Indicadors de tendència al carrusel · **BL2-20** Historial de torns
  accessible · **BL2-21** Targeta cicles de vida no solapa.
- **C-01** Passive effects de les 30 branch techs (2026-06-17) · **PT-16** Incentiu vides llargues (opció A).
- Sessions 2026-06-06 (PT-01..PT-13, D-01..D-03, SAVE, SCORE, BALANCE-EV, B-01) · 2026-06-17 (branques
  %normalitzats, two-phase upkeep, material d'events).

---
<!-- ════════════════════════════ ⛔ WONTFIX / SUPERAT ════════════════════════════ -->

## ⛔ WONTFIX DESIGN — BL2-07 — Scoring Místic/Social sense diferenciació

- **Decisió (2026-06-19)**: la diversitat de branques NO és un mèrit de scoring. El scoring ja recompensa
  profunditat (branch techs, coherència entre eres, branca dominant). Reflectit a `scoring-system.md §3.3`.

## ⛔ SUPERAT — BL2-06 — Loop pedra-faonar: font de material sense cost real

- **Estat**: l'antiga decisió (`act_faonar_eines` ha de generar `eina`, no material; eines consumides per
  accions de branca) s'ha **implementat via D1-D4** (2026-06-23). El matís de benefici d'eina diferent per
  branca queda absorbit a **DESIGN-01**. El residu d'economia de material es tracta a **ECON-03**.

<!-- STATS: 2026-06-25 DESIGN-02 decidit (10 preguntes) → DESIGN-02-IMPL obert; ECON-01/02 resolts; ECON-03/04 diferits. Reorganitzat 2026-06-24. -->
