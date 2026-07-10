# Bloodline — Revisió de balanç d'accions i TdBs (2026-07-10)

**Àmbit**: `prototypes/bloodline-v2/data.js` (16 TdBs, 128 accions de branca + 12 base/standalone)
**Mecànica verificada a `game.js`**: `purchase_cost` es paga en tokens; `execute_cost` es paga en Aliment;
recompensa de token per defecte = 2–3/acció (`token_min ?? 2`, `token_max ?? 3`), ancians (edat ≥11) +1;
activació de branca = eix normalitzat ≥ 34% (`BRANCH_ACTIVATION_PCT`); `inheritDecay` = fracció **conservada**
en successió (tokens 30%, eines 30%, pedra/fibres 100%).

> ⚠️ **Discrepàncies brief ↔ dades**: el brief de la tasca deia `LIFE_EXPECTANCY = 14` i UTs a ~10/~20/~30.
> Els valors reals a `data.js` són: `LIFE_EXPECTANCY = 20`, `ERA_CYCLES = 100`, i UTs a
> foc 10 / eines 16 / art 36 / vestimenta 50 / corda 65 / ceràmica 70 / agricultura 85.
> Tota l'anàlisi usa els valors reals del fitxer.

---

## 1. Metodologia

**Unitats de Valor (VU)** per comparar outputs heterogenis (supòsits explícits, discutibles):

| Recurs | VU | Justificació |
|---|---|---|
| 1 Aliment 🌾 | 1.0 | Recurs de supervivència de referència (upkeep −2/torn) |
| 1 Salut ❤️ | 1.0 | Mateixa escala numèrica; vegeu caveat de sostre més avall |
| 1 Pedra 🪨 | 1.0 | 1 torn de `act_recollectar_pedra` en dona 1–3 |
| 1 Fibra 🌿 | 0.8 | Lleugerament més abundant (2–4/torn base) |
| 1 Eina ⚒️ | 2.5 | Cost de producció (2 pedra + 1 torn) ≈ valor marginal en consum (+3–5 output) |
| 1 Token 🔵 | comptat a part | Meta-moneda; no es barreja amb VU vitals |

- **VU net/execució** = E[output] + Σ(side_effects en VU) − execute_cost. Esperança amb stats = 1.0
  (sense multiplicador ×1.15–×1.6 de força/enginy/vincle, sense destreses, sense events).
- **Cost d'oportunitat de base**: cada torn consumeix 2 🌾 d'upkeep → una acció amb VU net < 2 és
  econòmicament deficitària si el seu output no és token/eina amb palanquejament posterior.
- **Caveat Salut**: 1❤️ = 1 VU sobrevalora la curació quan la salut és a prop del sostre (40/50) i la
  infravalora al final de vida (envelliment ~7–18❤️/torn a edats 14–18). Les mitjanes del Místic s'han
  de llegir amb aquest filtre.

---

## 2. Taula comparativa de valor per branca

Mitjanes sobre les 32 accions de slot de cada branca (2 × 16 TdBs). Les accions amb `output_resource: "token"`
es comptabilitzen a la columna de tokens, no a VU.

| Branca | Accions VU (n) | VU net mitjà /exec | PC mitjà (🔵) | **Ratio VU/PC** | Accions token dedicades | Token net mitjà (accions token) | Primera acció token pròpia |
|---|---|---|---|---|---|---|---|
| **Recol·lector** | 30 | **5.06** | 4.25 | **1.19** | 2 | 5.8 | `act_comptar_osques` (TdB7, ut_art, c.36) |
| **Místic** | 31 | 4.85 | 4.56 | 1.06 | 1 | 5.7 | `act_nusos_memoria` (TdB11, ut_corda, c.65) |
| **Caçador** | 29 | 4.50 | 4.69 | 0.96 | 3 | 6.5 | `act_mural_gesta` (TdB7, ut_art, c.36) |
| **Artesà** | 20 | **1.96** | 4.34 | **0.45** | **12** | 6.6 | `act_bescanviar_ascles` (TdB2, **cicle 0**) |

**Evolució temporal (VU net mitjà de les accions VU):**

| Branca | Primerenc (TdB1–6, cicles 0–16) | Tardà (TdB13–16, cicles 70–100) | Pendent |
|---|---|---|---|
| Recol·lector | 3.73 | 7.25 | ×1.9 |
| Místic | 3.87 | 6.28 | ×1.6 |
| Caçador | **2.96** | 6.55 | ×2.2 |
| Artesà | 1.55 | 2.98 (+ motor token 7–11) | ×1.9 |

**Lectura**:
- El **Recol·lector** és la branca més consistent i segura: mai la millor en burst, mai deficitària.
  Amb l'EV a stats=1, el "farming segur" del Recol·lector domina el joc de risc del Caçador (vegeu S2-1).
- L'**Artesà** té el VU vital més baix amb diferència, però és intencionalment una branca convertidora:
  posseeix **12 de les 18 accions de token** del joc i **11 de les 12 accions productores d'eina**.
  El seu 0.45 no és un bug per si sol — el problema és l'asimetria d'accés al token (S2-4).
- El **Caçador** compra variança: outputs bruts alts (fins a 9–15 🌾) pagats amb Salut. El seu VU net creix
  més que cap altre amb força alta (stat_gain 0.14–0.20, multiplicador fins ×1.6) — el disseny "el llinatge
  caçador millora amb les generacions" funciona. Però a stats baixos massa accions són EV-negatives (S2-1).
- El **Místic** té bona mitjana només perquè 1❤️=1VU; el 94% del seu output és Salut amb sostre 40/50,
  i **no té economia alimentària** (S1-1).

### Matriu de cobertura de recursos (accions de slot per branca)

| Output | Caçador | Recol·lector | Artesà | Místic |
|---|---|---|---|---|
| Menjar 🌾 | **27** | 19 | 3 | **2** |
| Salut ❤️ | 1 | 5 | 1 | **29** |
| Tokens 🔵 (dedicades) | 3 | 2 | **12** | 1 |
| Pedra 🪨 | 0 | 0 | 4 | 0 |
| Fibres 🌿 | 0 | 6 | 1 | 0 |
| Eines ⚒️ | 1 | 0 | **11** | 0 |

Les accions base (universals) cobreixen parcialment els zeros, amb una excepció important:
`act_recollir_branques` té `impuls: { max: 0.50 }` — un Caçador profund perd l'única font base de fibres
mentre les seves pròpies accions en consumeixen (`act_torxa_persecucio` −1, `act_parar_llacos` −2,
`act_xarxa_ocells` −1, `act_tanca_bestiar` −2). Vegeu S3-4.

---

## 3. Progressió de TdBs al llarg de l'era

Era = 100 cicles ≈ 5 generacions de ~20 cicles.

| Finestra | UT (cicle) | TdBs nous | Accions noves | Generació |
|---|---|---|---|---|
| c.0 | — (null) | tdb_01, tdb_02 | 16 | G1 |
| c.10 | ut_foc | tdb_03, tdb_04 | 16 | G1 |
| c.16 | ut_eines | tdb_05, tdb_06 | 16 | G1 |
| **c.16→36** | **— (desert)** | **0** | **0** | **final G1 + quasi tota G2** |
| c.36 | ut_art | tdb_07, tdb_08 | 16 | G2 (final) |
| c.50 | ut_vestimenta | tdb_09, tdb_10 | 16 | G3 |
| c.65 | ut_corda | tdb_11, tdb_12 | 16 | G4 |
| c.70 | ut_ceramica | tdb_13, tdb_14 | 16 | G4 |
| c.85 | ut_agricultura | tdb_15, tdb_16 | 16 | G5 (15 cicles restants) |

**Problemes de ritme** (detall a S2-5):
1. **Front-load**: 6 TdBs / 48 accions disponibles dins la G1 (cicles 0–16).
2. **Desert de 20 cicles** (16→36): una generació sencera sense contingut nou de TdB.
3. **Clúster 65/70**: 4 TdBs / 32 accions en 5 cicles.
4. **Cua impossible**: TdB15–16 arriben al c.85 → 16 accions × PC mitjà 5.7 ≈ **91 🔵** quan l'ingrés
   restant de la G5 és ~50–60 🔵 (3–4/torn × 15 torns) + ~10 🔵 heretats (30% de cap 35).
5. **Llindars d'inclinació**: l'escala OR puja 0.12 → 0.45. Per descobrir tdb_15/16 cal un eix al 45%
   (activació de branca = 34%) — exigeix sobre-especialització justament quan el Místic pur és
   econòmicament insostenible (composa amb S1-1).

**Cadència d'adquisició (sana en general)**: ingrés de token ≈ 2.5–3/torn (jove), 3.5–4/torn (ancià).
Una compra primerenca (PC 3–4) s'amortitza en 1–1.5 torns; tardana (PC 6) en ~2. Per era s'estimen
**55–65 compres sobre ~120 ofertes (~50%)** → escassetat significativa, decisions amb pes. El cap de 35 🔵
i l'`inheritDecay` 0.3 contenen la inflació inter-generacional. ✅

---

## 4. Problemes detectats per severitat

### S1 — Bloquejant

**S1-1 · El Místic no té economia alimentària (arquetip insostenible jugat pur)**
- Fonts de menjar pròpies en 85 cicles: **1** (`act_cami_ocells`, 2–4 🌾). La segona (`act_beneir_camps`)
  arriba al c.85 amb ut_agricultura.
- Alhora, **13 de les seves 29 accions de Salut consumeixen Aliment**: `act_cercle_vespre`* (soc),
  `act_vetlla_flames` −1, `act_dansa_ombres` −1, `act_lletania_clan` −1, `act_ofrena_feixuga` −1,
  `act_mantell_ritual` −1, `act_basto_esperits` −1, `act_pintar_esperits` −2, `act_vas_ofrenes` −2,
  `act_ritu_pas` −2, `act_forn_visions` −2, `act_roda_any` −2, `act_primera_espiga` −2,
  `act_pelegrinatge` −3, `act_festa_solstici` −3.
- Amb upkeep −2/torn, el Místic depèn estructuralment de les accions base (que desplacen la inclinació
  cap a impuls/sociabilitat i erosionen el 34%+ d'espiritualitat) o d'un llinatge híbrid.
- **Nota d'intenció**: si el disseny vol que cap branca sigui autosuficient (filosofia d'accions-com-a-transicions),
  rebaixeu-ho a S2 — però llavors cal reequilibrar la *magnitud*: el Caçador té 27 fonts de menjar i el
  Místic 2. La interdependència hauria de ser simètrica.

### S2 — Important

**S2-1 · Prima de risc invertida al Caçador: les accions segures dominen les arriscades**
El principi econòmic correcte és que l'EV d'una acció amb variança i cost de Salut ha de superar l'EV
de l'alternativa segura (aversió a la pèrdua: els jugadors exigeixen sobre-compensació per acceptar risc).
Aquí passa el contrari:

| Acció | PC | EV brut | Cost | **VU net** |
|---|---|---|---|---|
| `act_rostir_caca` (segura) | 4 | 5.5 🌾 | +2 ❤️ | **+7.5** |
| `act_foc_batuda` (risc) | 5 | 9.5 🌾 | −5 ❤️, −1 EC | +3.5 |
| `act_aguait_nocturn` (risc) | 5 | 8.0 🌾 | −6 ❤️ | +2.0 |
| `act_expedicio` (risc, PC màxim) | 6 | 11.0 🌾 | −8 ❤️, −1 EC | +2.0 |
| `act_caca_llanca` (risc + eina) | 4 | 8.5 🌾 | −7 ❤️, −1 ⚒️ | **−1.0** |
| `act_darrera_cacera` (risc + eina) | 6 | 12.0 🌾 | −7 ❤️, −1 ⚒️, −1 EC | +1.5 |

El multiplicador de força (fins ×1.6) redimeix aquestes accions a llinatges veterans (p.ex. `act_darrera_cacera`
a força 4+ ≈ +7 a +14 net), però el jugador les compra *abans* de tenir la força — i l'EV al moment de compra
és el que educa la percepció de valor.

**S2-2 · `act_esquarterar` és una acció morta (dominada estrictament)**
`act_esquarterar` (TdB2, PC4): 5–9 🌾, −4 ❤️, **−1 ⚒️** vs `act_caca_aguait` (TdB1, PC3): 4–8 🌾, −3 ❤️, sense eina.
Per +1 🌾 de mitjana pagues +1 PC, +1 ❤️ i una eina sencera. Cap situació on sigui òptima.

**S2-3 · Curtcircuit de l'economia d'eines: `act_reparar_vora` domina tota la cadena**
- `act_reparar_vora` (TdB4, **PC3**, cicle 10): 1 🌿 → 1 ⚒️. Input renovable i barat (fibres 2–4/torn).
- Competidors posteriors i més cars: `act_tallar_ascles` (PC4, 2 🪨), `act_taller_percussio` (PC5, 🪨+🌿),
  `act_forn_terra` (PC6, 2 🪨), `act_aixada` (PC5, 🪨+🌿), `act_eines_temps` (PC6, 1 🪨),
  i sobretot `act_trenar_corda` (TdB11, PC3, **3 🌿** → 1 ⚒️, token 1–2) que és estrictament la pitjor
  fàbrica d'eines del joc tot i arribar al cicle 65.
- Únic contrapès actual: `apr_treball_pedra` (+2 eines a `act_tallar_ascles` → 3 ⚒️ per 2 🪨), que sí
  que supera reparar_vora — però depèn d'un aprenentatge amb 30% de descoberta.

**S2-4 · Asimetria del motor de tokens (12 : 3 : 2 : 1)**
- Artesà: 12 accions token, la primera (`act_bescanviar_ascles`) **al cicle 0**; les tardanes rendeixen 7–11.
- Caçador: 3 (primera c.36) · Recol·lector: 2 (primera c.36) · **Místic: 1 (primera c.65)**.
- Guany marginal d'una acció token vs l'ingrés per defecte (2–3): **+2 a +7 🔵/execució**. Un Artesà compra
  el seu arbre ~30–40% més ràpid; el Místic és el més lent (i, per S1-1, també el més pobre en vitals).
- Mitigants existents: cap 35 🔵 (overflow malbaratat) i `inheritDecay` 0.3 (−70% en successió) frenen
  la bola de neu inter-generacional. El problema és el ritme *intra*-generacional.

**S2-5 · Ritme de progressió irregular** (detall a §3): desert c.16–36, clúster c.65–70, i TdB15–16
econòmicament inamortitzables (91 🔵 de cost total amb ~60–70 🔵 disponibles a la G5).

**S2-6 · `act_rostir_caca` és massa eficient pel seu punt de corba**
4–7 🌾 **+2 ❤️**, sense cap cost, PC4, disponible al cicle 10 amb ut_foc i gate d'inclinació mínim
(impuls ≥ 0.10 — el compleix quasi tothom amb eixos normalitzats). És l'acció de menjar amb millor VU net
(7.5) fins a TdB13+ (cicle 70). Domina 40 cicles de joc alimentari per a qualsevol perfil no-antihunter.

### S3 — Menor

**S3-1 · Deltes d'inclinació que no reforcen el cicle del seu slot** (¿transicions intencionades?)
Accions en slot Caçador (gate `impuls`) que empenyen *més* cap a un altre eix, erosionant la pertinença:
- `act_repartir_boti`: impuls +0.02 < sociabilitat +0.05
- `act_relat_gesta`: impuls +0.03 < sociabilitat +0.04
- `act_adobar_pell`, `act_greix_vas`, `act_fumador`: impuls +0.03 = intel·lecte +0.03
- `act_tanca_bestiar`: impuls +0.04 = intel·lecte +0.04
- I al Místic: `act_cami_ocells` espiritualitat +0.04 amb impuls +0.02 (reforç feble vs +0.06–0.08 habituals).
Segons la filosofia d'accions-com-a-transicions pot ser volgut; si és així, convindria que fos explícit
(camp `is_transition` o similar) perquè ara és indistingible d'un error de tuning.

**S3-2 · Dades mortes / text enganyós**
- `BRANCHES[].conditions` (AND amb min/max per eix) **no s'usa** per a l'activació — `getActiveBranches()`
  només mira eix ≥ 34%. Dades llegades que confondran el proper balancejador.
- `glossaryDesc` d'Eines diu "cada branca fabrica la seva (llança, estri, garbell o ungüent) i només pots
  fer la de la teva branca activa" — a les dades, 11 de 12 fàbriques d'eines són intel·lecte i no hi ha
  cap gating per branca activa. Text desalineat amb la implementació.

**S3-3 · `act_seguir_ramat` feble** (2–5 🌾, EC 1 → net 2.5) — just al llindar d'upkeep; el token 3–5 el
salva a mitges. Acceptable com a acció-pont primerenca, però queda obsoleta molt abans que
`act_llegir_migracions` (c.85) la substitueixi formalment.

**S3-4 · Caçador profund sense fibres**: `act_recollir_branques` (impuls max 0.50) + 4 accions de Caçador
que consumeixen 🌿 (S2 llistades a §2). Amb impuls > 50%, l'única entrada de fibres és el side-effect
+1 de `act_desollar_traca` i l'estoc heretat (inheritDecay 1.0 = es conserva tot).

**S3-5 · `act_punta_crua` vs `act_tallar_ascles`**: mateix output (1 ⚒️ per 2 🪨) amb PC 3 vs 4.
La versió Artesà només guanya per stat_gain (0.20) i sinergia amb `apr_treball_pedra`. Diferenciació
mínima; acceptable, però vigilar si mai s'afegeix un consum d'eina fort al Caçador primerenc.

---

## 5. Recomanacions específiques

Ordenades per impacte. Valors proposats com a punt de partida de playtest, no com a veritat.

### R1 (→ S1-1) Donar sòl alimentari al Místic
1. `act_cami_ocells`: output 2–4 → **3–6** 🌾 (segueix per sota del Caçador equivalent, però viu).
2. Reconvertir **un** slot Místic primerenc a menjar amb sabor espiritual — candidat natural:
   `act_cendres_sagrades` (TdB3) → "recol·lecta guiada pels esperits", output **3–5 🌾**, mantenint
   delta espiritualitat +0.05. El Místic conserva 28 accions de Salut.
3. Suavitzar els costos d'aliment dels rituals primerencs: `act_pelegrinatge` −3 → **−2**,
   `act_festa_solstici` −3 → **−2** (els tardans poden mantenir el cost alt: a c.85+ el menjar sobra).

### R2 (→ S2-1) Restaurar la prima de risc del Caçador (~+25% EV sobre l'alternativa segura)
- `act_caca_llanca`: health −7 → **−5** (net −1 → +1.5; amb força 3+ ja és clarament positiva).
- `act_llanca_emmanegada`: health −6 → **−4**.
- `act_expedicio`: output 8–14 → **10–16** (mantenir −8 ❤️: el drama és la seva identitat; net 2.0 → 4.0).
- `act_aguait_nocturn`: health −6 → **−4** (net 2.0 → 4.0).
- `act_darrera_cacera`: afegir **`minAge: 10`** (narrativament "la gesta final" i evita la trampa de
  comprar-la amb força 1; amb elder bonus i força alta és on brilla).

### R3 (→ S2-2) `act_esquarterar`: eliminar el consum d'eina **o** pujar output a **6–11** 🌾 i PC a 5.
Amb −1 ⚒️ mantingut, l'acció esdevé la manera del Caçador de "cobrar" les eines del llinatge — acceptable
si el seu net supera `act_caca_aguait` en ~2 VU.

### R4 (→ S2-3) Reparar la cadena d'eines
- `act_reparar_vora`: cost 1 🌿 → **2 🌿** i PC 3 → **4**. Continua sent el manteniment barat, deixa de
  ser la fàbrica dominant.
- `act_trenar_corda`: cost 3 🌿 → **2 🌿**, token 1–2 → **2–3**.
- Objectiu de corba: cost efectiu per eina lleugerament *decreixent* al llarg de l'era
  (2.0 VU → 1.6 VU), amb el salt real via `apr_treball_pedra` i upgrades (que substitueixen, no acumulen).

### R5 (→ S2-4) Reequilibrar l'accés al token
- Opció barata (recomanada): **+1** a `token_min`/`token_max` de 4–6 accions primerenques de
  Recol·lector i Místic (p.ex. `act_mapa_verd`, `act_partir_fruits`, `act_llegir_presagis`,
  `act_pedra_guardiana` → 3–5). No crea noves accions token, només tanca el 30% de gap.
- Opció estructural: retardar el motor Artesà — `act_bescanviar_ascles` PC 3 → **5**. El primer
  convertidor eina→token passa a costar 2 torns d'estalvi.
- No tocar el cap 35 ni l'inheritDecay 0.3: són els dos frens anti-inflació que ja funcionen.

### R6 (→ S2-5) Repartir el calendari d'UTs
Proposta: eines 16 → **24** (obre TdB5–6 a la G2), art 36 → **34**, ceràmica 70 → **72** (desfà el
clúster amb corda 65), agricultura 85 → **78** (dona ~22 cicles a la cua). Alternativa mínima si no es
vol tocar el calendari: rebaixar els llindars d'inclinació de tdb_13–16 de 0.42/0.45 → **0.38/0.40**.

### R7 (→ S2-6) `act_rostir_caca`: side effect +2 ❤️ → **+1 ❤️** i afegir `requires: [{ resource: 'food', min: 2 }]`
(coherent amb `act_ahumar_carn`: per rostir caça, cal caça). Net 7.5 → 6.0, segueix sent la millor
acció segura del seu tram però ja no domina 40 cicles.

### R8 (→ S3) Neteja
- Esborrar `BRANCHES[].conditions` o marcar-ho `// LEGACY — no usat per getActiveBranches()`.
- Actualitzar `glossaryDesc` d'Eines a la realitat implementada.
- Revisar els 8 deltes de S3-1: o reforçar l'eix del slot (+0.05 mínim) o marcar-les com a transicions.
- `act_seguir_ramat`: output 2–5 → **3–6** o EC 1 → 0.

---

## 6. Salut econòmica global (referència ràpida)

| Mètrica | Valor estimat | Estat |
|---|---|---|
| Ingrés token/torn (jove / ancià) | 2.5–3 / 3.5–4 🔵 | ✅ |
| Compres amortitzables per era | ~55–65 de ~120 ofertes (~50%) | ✅ escassetat significativa |
| Faucet vs sink de tokens (era completa) | ~300 🔵 vs ~550 🔵 de sink potencial | ✅ el sink domina |
| Frens anti-inflació | cap 35 + inheritDecay 0.3 (−70% en successió) | ✅ |
| Aliment: faucet vs upkeep | net +3–8/acció vs −2/torn | ✅ (cap 6→10 conté l'estoc) |
| Eines | cap 3, 12 fàbriques / 11 consumidors | ⚠️ dominància de reparar_vora (S2-3) |
| Paritat de branques (VU/PC) | 1.19 / 1.06 / 0.96 / 0.45* | ⚠️ *Artesà compensat per tokens; Místic per S1-1 no |

**Conclusió**: l'arquitectura macro (faucets/sinks, escassetat de tokens, decaïment successori) és sòlida.
Els problemes són micro i concentrats: (1) el Místic no menja, (2) el risc del Caçador no paga,
(3) dues cadenes amb accions dominants/mortes (rostir_caca, reparar_vora, esquarterar), i (4) un
calendari d'UTs amb desert i cua. Tots quatre són ajustables amb canvis de valors a `data.js` sense
tocar cap sistema.
