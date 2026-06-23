# Catàleg de feedback manual — Bloodline (2026-06-22)

> **Estat: RECOLLIT i CONTRASTAT. Cap decisió presa, cap canvi implementat.**
> Aquest document cataloga el feedback de joc rebut, el contrasta contra el codi
> actual i en deixa constància per a triatge posterior. NO és un pla d'implementació.

- **Build contrastada:** `prototypes/bloodline-v2/` (prototip HTML/JS actiu).
- **Fitxers clau:** `game.js`, `data.js`, `style.css`.
- **Mètode:** lectura directa del codi font; cada veredicte porta referència `fitxer:línia`.

## Llegenda de veredictes

| Veredicte | Significat |
|---|---|
| ✅ **CONFIRMAT (bug)** | El codi reprodueix el problema; comportament no desitjat. |
| 🟡 **CONFIRMAT (per disseny, però confús)** | El codi fa el que toca segons el disseny actual, però xoca amb l'expectativa del jugador. Qüestió de claredat/UX, no de correcció. |
| ❓ **QÜESTIÓ DE DISSENY** | El codi és consistent amb un model; el feedback en proposa un altre. Cal decisió de disseny, no correcció. |
| ⚠️ **MATÍS** | El feedback és cert en part; hi ha precisions importants. |

## Resum executiu

Els 7 punts es repleguen en **3 clústers** amb arrels comunes:

- **Clúster A — Seqüència i floaters de torn** (punts 1, 2): l'animació d'efectes
  d'acció i la d'upkeep de final de torn no tenen separació visual clara, i el
  resultat narratiu d'"Explorar els Voltants" surt *després* del donut de fi de torn.
- **Clúster B — Model de fabricació d'eines** (punts 3, 5, 6, 7): "Tallar Pedra"
  (que el jugador anomena "Polir pedra") fabrica eines sense cap restricció de
  branca; les accions d'eina de branca s'amaguen o es regalen segons regles que
  el jugador no veu; cap d'aquests camins passa pel mercat.
- **Clúster C — Les eines no fan res** (punt 4): el recurs `eina` no dóna cap
  bonus passiu; només és consumible-porta d'accions concretes.

---

## Decisions de disseny (2026-06-22) — IMPLEMENTADES (2026-06-23)

Preses després d'obrir les qüestions del catàleg i **implementades el 2026-06-23**
(veure secció "Implementació" més avall). Els detalls oberts marcats sota es van
resoldre durant la implementació.

**D1 (Punt 3) — Fabricació d'eines: NOMÉS PER BRANCA.**
S'elimina l'output d'`eina` de les accions base universals. Implica:
- Treure `side_effects: eina +1` de `act_tallar_pedra` (`data.js:684`) i repensar-ne
  el rol (queda com a font de material/pedra/stat, o es retira).
- Revisar `act_preparar_eina` (base, `make_tool`, `requires ut_eines`, `data.js:744-748`):
  sota aquest model deixa de tenir sentit com a acció universal de fabricació; cal
  retirar-la o convertir-la en acció de branca.
- Conseqüència: la fabricació d'eines passa a dependre de la branca → reforça D3
  (substitució automàtica) com a necessària per no deixar el jugador sense eines.
- **Detall obert:** ¿es pot fer eines abans de tenir la tech de branca, o són
  estrictament un desbloqueig de progressió? (Recomanació: progressió pura.)

**D2 (Punt 4) — Eines: CONSUMIBLE-PORTA + SENYALITZACIÓ.**
Es manté la mecànica actual (les eines es gasten en accions concretes per a gran
output; cap canvi de fórmula). Feina: UI/UX que comuniqui (a) que tenir eines soles
no fa res, i (b) quines accions les consumeixen i què donen. Lliga amb el renaming del Punt 5.

**D3 (Punt 6) — Canvi de branca: SUBSTITUCIÓ AUTOMÀTICA.**
En canviar de branca primària, l'acció d'eina equivalent de la nova branca substitueix
la de l'antiga. Implica:
- Definir el **mapatge d'equivalències** entre les 4 accions d'eina de branca
  (llança / garbell / estris / ungüent) — un rol compartit (`tool_action_role`) o taula explícita.
- Modificar `getActionVisibility` (`game.js:366-371`) perquè substitueixi en lloc de només amagar.
- **Detall obert (interacció amb D4):** si les accions de branca ara es COMPREN (D4),
  ¿la substitució regala l'equivalent o cal recomprar-lo? Recomanació: si ja havies
  comprat el rol d'eina d'una branca, l'equivalent de la nova es concedeix sense recompra.

**D4 (Punt 7) — Adquisició d'accions de branca: COMPRAR AL MERCAT.**
La branch tech fa l'acció **visible al mercat**; el jugador paga `purchase_cost` en material. Implica:
- `unlockSkill` (`game.js:491`): deixar d'afegir `unlocks_action_ids` a `purchasedActionIds`.
- `getBuyableActions` (`game.js:2540`): deixar d'excloure accions desbloquejades per skill;
  en canvi, gate-jar la visibilitat al mercat segons la tech desbloquejada.
- El `purchase_cost: 3` torna a ser **dades vives** (ja no mort).
- **Detall obert:** migració de saves amb accions ja "regalades" (probablement irrellevant en prototip).

**Punts sense decisió (bugs/execució, no disseny):** 1 i 2 (Clúster A — seqüència/floaters)
i el 5 (renaming) — implementats com a feina tècnica (veure sota).

---

## Implementació (2026-06-23)

Tot el feedback (punts 1-7) i les decisions (D1-D4) s'han implementat a
`prototypes/bloodline-v2/`. Verificat amb checks de dades (Node) i amb el joc real
en navegador headless (Playwright, 10/10 checks, 0 errors de runtime).

**Clúster A — seqüència/floaters (punts 1, 2):**
- Nou gate `proceedToEndOfTurn()` / `afterDismiss()` (`game.js`): el final de torn (cycle++,
  upkeep) espera que es resolguin tots els descobriments/events/naixements generats per
  l'acció. Així el resultat d'"Explorar els Voltants" surt ABANS de l'EOT, no després.
  Els 4 antics punts de crida a `beginEndOfTurnPhase` passen ara pel gate.
- `clearFloaters()` al començament de `beginEndOfTurnPhase`: neteja els floaters de l'acció
  abans de mostrar els d'upkeep, perquè el −1 d'acció i el −2 d'upkeep no es barregin.
- El gate difereix sense desar: el torn és atòmic (només es desa quan l'EOT acaba) → no
  introdueix cap exploit de tancar l'app a mig torn.

**D1 — eines només per branca (punts 3):**
- `act_tallar_pedra` → renombrada "Practicar la Talla"; ja no fa `eina` ni gasta pedra:
  és una acció de pràctica (enginy + destresa `d_talla_silex`).
- `act_preparar_eina` retirada (era el fabricant d'eines base universal).
- `act_talla_avancada` ja no produeix `eina`; conserva el bonus passiu `quality_tools` (×1.3
  a accions que gasten eines).
- Resultat: l'únic origen d'`eina` són les 4 accions d'eina de branca. *Detall obert resolt:*
  progressió pura — no hi ha fabricació d'eines abans de tenir-ne la branca.

**D2 — eines consumible + senyalització (punt 4):** glossari d'`eina` reescrit per deixar
clar que tenir eines no fa res per si sol i que es GASTEN en accions concretes. Mecànica
sense canvis.

**Punt 5 — nomenclatura:** "Tallar Pedra" → "Practicar la Talla" amb descripció honesta
(ja no enganya sobre fabricar eines). Les 4 accions d'eina de branca ja comuniquen l'output.

**D3 — substitució automàtica en canvi de branca (punt 6):** nous helpers
`getPrimaryToolActionId()`, `ownsBranchToolRole()`, `isActionOwned()`. Només es mostra
l'acció d'eina de la branca primària; les altres queden ocultes. *Detall obert resolt:*
posseir el rol d'eina (haver comprat l'acció d'eina de qualsevol branca) el substitueix
gratis en qualsevol branca primària — no es recompra.

**D4 — accions de branca al mercat (punt 7):** `unlockSkill` ja no regala les accions amb
cost (només les gratuïtes); `getBuyableActions` mostra l'acció al mercat un cop desbloquejada
la seva branch tech. El `purchase_cost` torna a ser dades vives.
- ⚠️ **Risc de balanç a vigilar:** ara **les 65 accions desbloquejables per branch tech tenen
  cost** → totes passen pel mercat. Material esdevé la porta de tota la progressió de branca.
  És el model decidit (alenteix la progressió), però cal un playtest per confirmar que
  l'economia de material el sosté i ajustar `purchase_cost` si cal.
- *Detall obert (migració de saves):* no gestionat; partides velles amb accions ja regalades
  les conserven (inofensiu en prototip).

---

## Punt 1 — Seqüència d'"Explorar els Voltants": −1 menjar es barreja amb −2 d'upkeep i l'event surt després del donut

**Feedback:** en fer "Explorar voltants", el −1 de menjar s'ajunta visualment amb
el −2 de final de torn; després es mostra el donut de fi de torn i, a continuació,
es produeix l'esdeveniment derivat de l'acció. Ja s'ha intentat corregir diverses vegades.

**Veredicte: ✅ CONFIRMAT (bug) — i s'explica per què els intents anteriors no van funcionar.**

**Evidència:**
- `data.js:716-724` — `act_explorar_voltants`: `execute_cost: 1`, **`event_pool_id: null`**,
  `character_effect: { type: 'explore_zone' }`. **No té pool d'events.**
- `game.js:634-666` — `explore_zone`: en cas de no descobrir zona, dispara un
  `EXPLORATION_EVENTS`, n'aplica els efectes **immediatament** (`applyEventEffects`,
  línia 659) i empeny una targeta a `state.pendingDiscoveries` (línia 661). En cas
  de descobrir zona, empeny una targeta `_isZone` (línia 645).
- `game.js:1019` + `1068` — el snapshot del cost es pren *abans* de
  `applyCharacterEffect`, així que `applyFxFloaters(snapCost)` (línia 1068) agrupa
  en **un sol lot** el −1 de cost + el menjar/salut de l'event d'exploració + el material.
- `game.js:1148-1149` — sense `pendingEvent` (perquè `event_pool_id` és null), passa
  per `setTimeout(200ms) → beginEndOfTurnPhase()`.
- `game.js:937-943` — `beginEndOfTurnPhase` mostra el donut 🌙 i després
  `applyTurnUpkeep()` aplica el −2 d'upkeep amb els seus floaters.
- `game.js:1943-2028` + `975` — les targetes de `pendingDiscoveries` (la narrativa
  de l'exploració) **només es renderitzen via `renderAll()`**, que s'invoca al final
  de `beginEndOfTurnPhase` (línia 975). Per tant la targeta surt **després** del donut d'EOT.

**Per què els intents previs no van resoldre-ho:** el commit recent
`f5883e8 "resequencia execució — output diferit fins OK de l'event"` difereix
l'output pel camí de **`state.pendingEvent`** (events de pool; `game.js:1116-1124`,
`dismissEvent` a `2068`). Però "Explorar els Voltants" **no usa aquest camí** —
usa `pendingDiscoveries` via `explore_zone`, que és un flux separat i no diferit.
Els arranjaments han tocat el camí equivocat.

**Severitat suggerida (per triatjar):** Alta — toca el primer minut de joc i ja
s'ha intentat resoldre sense èxit.

---

## Punt 2 — Els indicadors numèrics de l'acció es barregen amb els del final de torn (flux general)

**Feedback:** en executar qualsevol acció, els floaters dels efectes de l'acció es
barregen visualment amb els del final de torn. No és exclusiu d'"Explorar voltants".

**Veredicte: ✅ CONFIRMAT (bug) — problema estructural de timing/agrupació.**

**Evidència:**
- Dos punts d'origen de floaters d'acció: `game.js:1068` (fase cost: cost + material + stats)
  i `game.js:1140` (fase output: recurs produït).
- Floaters d'upkeep d'EOT: `game.js:943` (`applyFxFloaters(snapEot)`).
- Separació temporal entre output d'acció i upkeep d'EOT: només `setTimeout(200ms)`
  (`game.js:1149`) + durada del donut (**1.25s**, `game.js:1296`) ≈ **1.45s**.
- Durada de l'animació del floater: **1.4s** (`style.css:1111`, `animation: floatUp 1.4s`).
- Conseqüència: un floater nascut a la fase output (1.4s de vida) encara s'està
  animant quan apareixen els d'upkeep → solapament a les mateixes cel·les (`hex-food`, etc.).
- A més, dins de la fase cost, **múltiples efectes diferents es fusionen en un sol
  lot** (`applyFxFloaters` calcula deltes per stat entre dos snapshots; `game.js:1168-1200`),
  així que cost + material + (efectes d'event d'exploració) surten com un bloc indistingible.

**Matís:** no és un error de càlcul; els números són correctes. És que **no hi ha
separació visual ni semàntica** entre "el que ha fet la teva acció" i "el cost de
viure aquest torn". Arrel compartida amb el Punt 1.

**Severitat suggerida:** Mitjana-Alta (claredat de feedback de joc, transversal).

---

## Punt 3 — "Polir pedra" executable sense branques

**Feedback:** es permet executar "Polir pedra" encara que no es disposi de branques;
sembla que no es validen prerequisits.

**Veredicte: ✅ CONFIRMAT — amb un matís de nomenclatura important.**

**Matís de nom:** **no existeix cap acció anomenada "Polir pedra".** El jugador es
refereix gairebé segur a **`act_tallar_pedra` ("Tallar Pedra")** (`data.js:680`), que
és l'acció base que fabrica eines a partir de pedra. (Que el jugador no en recordi
bé el nom alimenta directament el Punt 5.)

**Evidència:**
- `data.js:680-690` — `act_tallar_pedra`: `is_base: true`, `zona: "Campament"`,
  únic gate `requires: [{ resource: 'pedra', min: 1 }]`, `side_effects` produeix
  `eina +1`. **Sense `universal_prereq`, sense requisit d'inclinació, sense branca.**
- `game.js:313` — totes les accions `is_base` s'afegeixen automàticament a
  `purchasedActionIds` (sempre disponibles).
- Cap entrada per a `act_tallar_pedra` a `ACTION_INCLINATION_REQUIREMENTS`
  (verificat: no hi és) → `getActionVisibility` retorna `ACTIVE` sempre (`game.js:373-374`).
- Nota sobre "sense branques": `getActiveBranches` (`game.js:400-413`) **sempre**
  retorna almenys una branca (fallback a la de % més alt). Així que tècnicament el
  personatge sempre "té" una branca activa; el que és cert és que **la fabricació
  d'eines no està lligada a cap branca ni requisit** i és accessible des del torn 1.

**Relació:** és l'arrel del Clúster B. "Tallar Pedra" regala fabricació d'eines
universal i gratuïta, cosa que soscava les accions d'eina específiques de branca
(que sí estan gated). Lliga amb Punts 6 i 7.

**Severitat suggerida:** Mitjana (decisió de disseny: ha de ser gated la fabricació base d'eines?).

---

## Punt 4 — Les eines no tenen efecte a les accions

**Feedback:** sent recol·lector i amb eines, en executar "Recol·lectar" no s'observa
cap benefici. Cal verificar si els efectes de les eines s'apliquen.

**Veredicte: 🟡 CONFIRMAT (per disseny, però confús) — amb un possible forat de disseny.**

**Evidència:**
- El recurs `eina` **no dóna cap bonus passiu** a cap acció. No hi ha cap codi que
  llegeixi la quantitat d'`eina` per millorar outputs.
- L'acció base "Recol·lectar Arrels" (`data.js:670-678`) **no referencia `eina`**
  en absolut (ni `requires`, ni `side_effects`). Per tant, tenir eines i fer la
  recol·lecta base → cap efecte. **Això és correcte segons el disseny actual.**
- Les eines només actuen com a **consumible-porta** d'accions concretes:
  - `act_recollectar_garbell` "Recol·lectar amb Garbell" (`data.js:901-911`):
    `requires eina≥1`, consumeix `eina −1`, output `food 4-8` (vs. 1-3 de la base).
  - `act_caça_llanca` (`data.js:803-807`): `requires eina≥1`, consumeix `eina −1`.
  - Bonus de qualitat `×1.3` només per accions que `requires eina` i només amb
    l'upgrade `act_talla_avancada` comprat (`game.js:1093`).
- L'stat `enginy` ("Millora outputs d'accions d'eines i artesania", `data.js:218`)
  és un **atribut del personatge**, no el recurs `eina`; no es guanya per tenir eines.

**Interpretació:** el benefici de les eines existeix però **només via l'acció
específica que les consumeix** (p.ex. "Recol·lectar amb Garbell"), no com a bonus
passiu de tenir-les. Si el jugador executa la recol·lecta base mentre té eines a
l'inventari, és correcte que no passi res — però és **profundament poc intuïtiu**.
Possible forat: si el jugador no té desbloquejada/comprada l'acció que consumeix
l'eina, les eines acumulades no serveixen per res i no hi ha cap senyal d'això.

**Severitat suggerida:** Alta (el jugador percep una mecànica trencada; cal o bé
un bonus passiu, o bé senyalització clara de "per a què serveixen les eines").

---

## Punt 5 — El nom "Polir/Tallar Pedra" no comunica que serveix per fabricar eines

**Feedback:** el nom no comunica que serveix per fabricar/millorar eines; poc intuïtiu.

**Veredicte: ✅ CONFIRMAT — i reforçat per evidència indirecta.**

**Evidència:**
- Nom real: "Tallar Pedra" (`data.js:680`). Descripció: *"Talles sílex per fabricar
  eines bàsiques. Gasta pedra, produeix eines."* — la descripció **sí** ho explica,
  però al carrusel d'accions normalment només es veu el **nom**, no la descripció.
- **Evidència indirecta forta:** el propi feedback l'anomena "Polir pedra", un nom
  que no existeix. Si el jugador no recorda ni el nom correcte ni que fabrica eines,
  el nom no compleix la seva funció comunicativa.

**Relació:** lliga amb Punt 6 — si "Tallar Pedra" fos clarament "fabricar eines",
el jugador veuria que encara pot fer eines després de canviar de branca.

**Severitat suggerida:** Baixa-Mitjana (renaming + possible icona/etiqueta d'output al carrusel).

---

## Punt 6 — En canviar de branca, les accions no mantenen equivalència funcional

**Feedback:** sent caçador es pot crear una eina; després de transformar-se en
artesà ja no és possible. Quan una acció té equivalent en una altra branca, hauria
de substituir-se automàticament o mantenir la funcionalitat.

**Veredicte: ❓ QÜESTIÓ DE DISSENY — el comportament és intencionat al codi, però el feedback en proposa un altre model.**

**Evidència:**
- `game.js:366-371` — `getActionVisibility`: una acció amb `is_tool_action: true` i
  `tool_branch` s'**amaga** (`HIDDEN`) quan hi ha 2+ branques actives i el seu
  `tool_branch` no és la branca primària.
- Accions d'eina per branca (cadascuna `is_tool_action`, `tool_branch` propi):
  - Caçador: façona de llança (`data.js:822-833`, `tool_branch: 'branch_hunter'`).
  - Recol·lector: `act_trenar_garbell` (`data.js:867-878`, `'branch_gatherer'`).
  - Artesà: `act_faonar_eines` "Façonar Estris" (`data.js:952-960`, `'branch_craftsman'`).
  - Místic: `act_preparar_ungüent` (`data.js:1015-1023`, `'branch_mystic'`).
- L'equivalent d'artesà (`act_faonar_eines`) requereix a més desbloqueig de la seva
  branch tech (apareix a `unlocks_action_ids`, `data.js:304`). **No hi ha substitució
  automàtica:** en passar a artesà-primari, l'acció de caçador s'amaga i la d'artesà
  només apareix si s'ha desbloquejat la tech corresponent.

**Matís important:** la fabricació d'eines **no es perd del tot** — "Tallar Pedra"
(base, sempre disponible, Punt 3) segueix produint `eina`. Però com que el jugador
no associa "Tallar Pedra" amb fabricar eines (Punt 5), **percep** que ha perdut la
capacitat. Els tres punts (3, 5, 6) es retroalimenten.

**Decisió pendent:** ¿es vol substitució automàtica d'accions equivalents en canviar
de branca, o es manté el model actual (cada branca té la seva acció d'eina, gated)?
És una qüestió de disseny, no un bug.

**Severitat suggerida:** Mitjana (afecta la sensació de progressió en transicions de branca).

---

## Punt 7 — Accions noves ("Crear eines") s'haurien d'haver comprat al mercat abans d'usar-les

**Feedback:** accions com "Crear eines" haurien d'adquirir-se al mercat abans
d'usar-se; actualment sembla que es poden usar sense aquest pas.

**Veredicte: ❓ QÜESTIÓ DE DISSENY — conflicte entre dos models d'adquisició al codi.**

**Matís de nom:** no hi ha cap acció "Crear eines" literal. Candidates: les accions
d'eina de branca (p.ex. `act_faonar_eines` "Façonar Estris").

**Evidència del conflicte:**
- `game.js:486-492` — `unlockSkill`: en desbloquejar una branch tech, **afegeix
  automàticament** els seus `unlocks_action_ids` a `purchasedActionIds` (línia 491).
  → l'acció queda **usable de franc** en el moment de desbloquejar la tech.
- `game.js:2530-2542` — `getBuyableActions`: exclou del mercat qualsevol acció que
  estigui en algun `unlocks_action_ids` d'una skill (línia 2540,
  `if (skillUnlockedIds.has(a.id)) return false;`). → aquestes accions **mai apareixen
  a la botiga**.
- `data.js:954` (i altres) — `act_faonar_eines` **encara porta `purchase_cost: 3`**,
  però aquest cost **no es cobra mai** perquè l'acció es regala via tech i s'exclou del mercat.

**Conclusió:** el model actual és "les branch techs regalen les seves accions; el
mercat només ven accions que cap tech desbloqueja". El feedback assumeix el model
contrari ("primer compra al mercat, després usa"). El `purchase_cost: 3` d'aquestes
accions és **dades mortes** (vestigial) sota el model actual — font probable de la
confusió, ja que la UI/dades suggereixen un cost que mai s'aplica.

**Decisió pendent:** triar un model i fer-lo consistent:
- (A) Branch tech regala l'acció → **eliminar** `purchase_cost` d'aquestes accions.
- (B) Branch tech desbloqueja-per-comprar → la tech fa l'acció **visible al mercat**
  però NO l'afegeix a `purchasedActionIds`; el jugador paga.

**Severitat suggerida:** Mitjana (consistència del model d'economia/progressió + dades mortes).

---

## Apèndix — Mapa de clústers per a triatge

| Punt | Veredicte | Clúster | Arrel tècnica | Severitat suggerida |
|---|---|---|---|---|
| 1 | ✅ Bug | A | `pendingDiscoveries` renderitzat post-EOT; flux `explore_zone` no diferit | Alta |
| 2 | ✅ Bug | A | floaters 1.4s vs. donut 1.25s + 200ms; agrupació en un sol snap | Mitjana-Alta |
| 3 | ✅ Confirmat → **DECIDIT (D1: només per branca)** | B | `act_tallar_pedra` `is_base` sense cap gate, produeix `eina` | Mitjana |
| 4 | 🟡 Per disseny/confús → **DECIDIT (D2: consumible + senyalització)** | C | `eina` no és bonus passiu; només consumible-porta | Alta |
| 5 | ✅ Confirmat (renaming, depèn de D1/D2) | B | nom "Tallar Pedra" no comunica output; només es veu el nom al carrusel | Baixa-Mitjana |
| 6 | ❓ Disseny → **DECIDIT (D3: substitució automàtica)** | B | `is_tool_action` + `tool_branch` s'amaga; sense substitució automàtica | Mitjana |
| 7 | ❓ Disseny → **DECIDIT (D4: comprar al mercat)** | B | `unlockSkill` regala accions vs. `getBuyableActions` les exclou; `purchase_cost` mort | Mitjana |

**Observació transversal:** quatre dels set punts (3, 5, 6, 7) són símptomes d'un
únic tema de disseny no resolt — **com s'adquireix i com es comunica la fabricació
d'eines** (base universal vs. específica de branca vs. comprada al mercat). Una
decisió de disseny coherent sobre aquest eix probablement tanca els quatre alhora.
Recomanació per a la propera sessió: resoldre primer el model de fabricació d'eines
(Clúster B) com a decisió de disseny abans de tocar codi, i tractar el Clúster A
(seqüència/floaters) com a feina tècnica independent.
