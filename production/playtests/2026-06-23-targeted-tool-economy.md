# Playtest Report — Targeted: model d'eines (D1-D4) + seqüència de torn — 2026-06-23

## Summary
- **Agents run**: playtester-optimizer, playtester-dynasty-builder, playtester-speed-runner (complets);
  playtester-tycoon i playtester-new-player (es van aturar a mig camí; SendMessage no disponible
  per reprendre'ls → les seves dimensions —auditoria de codi i claredat— les cobreix l'orquestrador
  amb la verificació Playwright d'avui i la revisió de textos).
- **Scope**: Targeted — canvis d'avui (commit 8770066): D1-D4 (model de fabricació d'eines) +
  Clúster A (seqüència de torn). Build: `prototypes/bloodline-v2/`.
- **Total issues**: 8 (S1: 0 · S2: 2 · S3: 5 · S4: 1) + 2 concerns de disseny majors.
- **New (introduït pels canvis d'avui)**: 2 tensions de disseny · **Pre-existent (aflorat pel focus econòmic)**: 5.
- **CD gate**: omès (review-mode absent → lean).

### Veredicte
**Els canvis funcionen i NO introdueixen cap bug ni softlock** (Playwright 10/10, 0 errors;
els 3 agents complets no van trobar cap regressió a la lògica nova). El playtest, però, aflora
**una decisió de disseny important sobre D4** i confirma **dues característiques intencionades**
que cal validar, més diversos problemes d'economia **pre-existents** que el focus econòmic ha tret a la llum.

**Cap issue S1 (bloquejant).** No hi ha res que impedeixi desplegar; el que segueix són decisions
de disseny i ajustos de balanç.

---

## ⚠️ Decisió de disseny #1 (la important) — D4 perd sentit a partir de Gen 2

**Reportat per:** playtester-dynasty-builder (S2), corroborat per playtester-optimizer.

`purchasedActionIds` s'hereta al **100%** en la successió (`game.js`, `inheritedPurchased = new Set(...)`).
Com que D4 fa que les accions de branca es comprin al mercat, però l'hereu ja les té totes,
**el mercat queda buit per a la branca primària a partir de la Gen 2**. La "pressió de despesa
per generació" que perseguia D4 només existeix a la Gen 1. De Gen 2 endavant, el jugador hereta
l'arsenal complet i el material s'acumula sense destí (cap 35, es perd a la successió).

**Aquesta és la tensió central:** D4 (pressió econòmica per generació) ⟂ filosofia de llinatge
(les habilitats/accions són coneixement heretat — [[bloodline-lineage-design-philosophy]]).
Opcions per decidir:
- **(A) Acceptar-ho**: D4 és una mecànica de Gen 1; l'herència la transporta com a "saber del
  llinatge". Senzill, coherent amb la filosofia, però el mercat és irrellevant des de Gen 2.
- **(B) No heretar (o decandir) les accions comprades**: cada generació re-enganxa el mercat.
  Recupera la pressió de D4 cada generació, però contradiu la filosofia de llinatge i pot semblar punitiu.
- **(C) Híbrid**: les accions de branca base s'hereten; les avançades/late-tech NO (cal tornar-les
  a comprar) o el mercat afegeix accions exclusives de la generació / gated per era. Manté el mercat
  viu sense trencar la filosofia. (Recomanació dels agents.)

**Ruta:** decisió d'`economy-designer` + `game-designer`. És el punt que més condiciona si D4 val la pena.

---

## ⚠️ Decisió de disseny #2 — D3: el rol d'eina és (intencionadament) molt generós

**Reportat per:** playtester-optimizer (MAT-03), playtester-speed-runner (S2), playtester-dynasty (S4) — convergència de 3 agents.

`ownsBranchToolRole()` retorna cert si es té **qualsevol** acció d'eina; `isActionOwned()` fa que
**totes** les accions d'eina comptin com a posseïdes. Conseqüència: comprar UNA acció d'eina (la més
barata, cost 3) dona la fabricació d'eines de **les 4 branques** gratis, i fins i tot permet usar
l'eina d'una branca **sense desbloquejar-ne la branch tech** (només cal que sigui la branca primària).

**Això és exactament el comportament que vam decidir a D3** ("posseir el rol el substitueix gratis,
no es recompra" — [[bloodline-tool-fabrication-model]]). Els agents ho marquen com a concern econòmic
perquè elimina la decisió de compra de 3 de 4 eines i salta el gate de tech de les branques secundàries.

**A validar:** ¿És la força desitjada de la substitució? Si sí → cap canvi (potser baixar el cost de
la 1a eina a 2, ja que les altres 3 són gratis per disseny). Si es vol més fricció → la substitució
hauria de requerir la branch tech de la branca destí, o limitar `ownsBranchToolRole` a la branca primària.
**Ruta:** confirmació de l'usuari / `game-designer`.

---

## S2 — Major

**S2-01 · Dead zone estructural cicles ~6-16 (pre-`ut_eines`), lleugerament agreujada per D4**
*Reportat per: speed-runner (S2; també marca "branca funcional ~cicle 18 de 20" com a S1 de feel).*
Els perfils de branca d'eines (5 skills sota `ut_eines`, que arriba al cicle 16) no tenen res nou a
desbloquejar ni comprar entre ~cicle 6 i 16: el mercat és buit per a ells (cap acció de branca elegible
fins que la tech s'activa) i el material s'acumula sense destí. D4 ho agreuja lleugerament: abans la
branch tech regalava l'acció; ara cal 1-2 cicles extra acumulant material per comprar-la, deixant ~2
cicles útils de branca a la Gen 1. Pre-existent (calendari de techs), no introduït avui.
**Ruta:** `game-designer` (acostar `ut_eines` a cicle 10-12, o donar skills de 1a capa sense `ut_eines`).

**S2-02 · Sense distinció visual al mercat entre accions gated-per-branca i universals**
*Reportat per: optimizer (MAT-07), corroborat per revisió de claredat de l'orquestrador.*
Sota D4, el jugador veu al mercat dos tipus d'acció sense distinció: les que requerien desbloquejar
una branch tech i les que apareixen directament en assolir una tech universal (p.ex. `act_ritual_foc`).
Un jugador nou pot no entendre per què "he desbloquejat la tècnica però l'acció no apareix fins comprar-la".
**Ruta:** `ux-designer` / `ui-programmer` (etiqueta "Requereix habilitat" vs "Disponible" al mercat).

---

## S3 — Minor (balanç / disseny — majoria pre-existents)

**S3-01 · `material_min ?? 2`: no hi ha veritables "sumiders" de material** *(optimizer MAT-10, pre-existent)*
Les accions sense `material_min/max` explícit generen 2-3 material per defecte (`game.js`, `(action.material_min ?? 2)`).
Accions pensades com a cost net (p.ex. `act_alimentar_foc`, `act_parar_trampes`) en realitat generen material.
Cap acció és un sumider real tret de les que tenen `material_min: 0, material_max: 0` explícit. Afecta directament
l'economia que D4 vol fer significativa. **Ruta:** `economy-designer` (canviar default a `?? 0`, o marcar explícitament les que generen).

**S3-02 · Estat estacionari del material: cap 35 + inheritDecay 0.3 → 10 tokens fixos/generació** *(dynasty S3, optimizer MAT-02/06, pre-existent)*
`floor(35 × 0.3) = 10` independentment de com de bé jugui el jugador. No hi ha arc de riquesa entre
generacions; una dinastia brillant i una mediocre hereten el mateix. **Ruta:** `economy-designer`.

**S3-03 · Material assolible al cap (35) en ~6-15 torns → poca tensió de pressupost a Gen 2+** *(optimizer MAT-02/08, dynasty)*
Amb herència + bonus d'ancians (+1/acció a edat ≥11) + aprenentatge `apr_veu_clan` (+1/acció), el cap
s'assoleix ràpid i el material deixa de ser decisió. **Ruta:** `economy-designer` (escalar `purchase_cost`
de late-tech a 6-8, o baixar el cap a 20-25).

**S3-04 · Risc de mort sense hereu poc senyalitzat** *(speed-runner S3, pre-existent)*
Finestra `act_cercar_parella` (edat 5-14) vs avís a edat 12; un jugador centrat en material pot perdre
per extinció sense bloqueig clar. Pre-existent. **Ruta:** `ux-designer`.

**S3-05 · `act_coure_ceramica` té `material_min/max: 0` però costa 5 al mercat** *(optimizer MAT-04, pre-existent)*
Inversió de 5 tokens que no contribueix a l'economia de material; probablement omissió. **Ruta:** `economy-designer`.

---

## S4 — Trivial

**S4-01 · `d_talla_silex` aplica DESTRESA_BONUS a "Practicar la Talla", que ara no té output** *(auditoria orquestrador, conseqüència de D1)*
Amb D1, `act_tallar_pedra` ja no produeix recurs, així que el bonus de la destresa hi és inert. La destresa
SEGUEIX tenint sentit (és el prerequisit de l'upgrade `act_talla_avancada`), però el bonus a l'output és
codi mort cosmètic. Sense impacte funcional. **Ruta:** neteja menor (backlog).

---

## Auditoria de codi (cobreix playtester-tycoon — verificada amb Playwright avui)

Validat amb el joc real headless (10/10 checks, 0 errors de runtime) i revisió dels camins modificats:
- **Gate de torn** (`proceedToEndOfTurn`/`afterDismiss`/`clearFloaters`): no deixa el torn penjat, no
  hi ha doble EOT, i l'EOT corre en descartar el descobriment. El gate **difereix sense desar** → el torn
  és atòmic (últim desat = EOT anterior); recarregar a mig descobriment re-fa l'acció netament, sense exploit
  (tot i que `pendingEndOfTurn` no es persisteix, no cal: no hi ha estat parcial desat).
- **Punt 1 confirmat resolt**: a "Explorar els Voltants" el descobriment surt ABANS de l'EOT (cicle no avança
  fins descartar-lo). **Punt 2**: `clearFloaters` separa els floaters d'acció dels d'upkeep.
- **`isActionOwned`/`ownsBranchToolRole`/`getPrimaryToolActionId`**: casos límit OK; `getPrimaryToolActionId`
  només retorna null si no hi ha cap branca amb eix (no assolible en joc normal, ja que `getActiveBranches`
  té fallback). Cap acció de branca queda inaccessible sota D4 (verificat: amb cost → mercat; sense cost → concedida).
- **Cap regressió** a successió, events diferits (`pendingActionResult`) ni floaters.

> Nota: playtester-tycoon no va completar ni escriure el seu fitxer; aquesta secció el supleix amb la
> verificació executada. Si vols una auditoria de codi independent addicional, es pot tornar a llançar.

## Claredat (cobreix playtester-new-player — revisió de textos modificats)
- **"Practicar la Talla"** (abans "Tallar Pedra"): la descripció diu explícitament "Encara no en surten
  eines útils" → comunica bé el nou rol (resol el punt 5). ✓
- **Glossari d'`eina`**: "Tenir-ne no fa res per si sol: es GASTEN en accions concretes..." → aclareix el punt 4. ✓
- **Flux D4** (desbloquejar tech → comprar al mercat): possible confusió per a jugador nou (S2-02 sobre senyalització).
- **Substitució D3**: el canvi silenciós de l'acció d'eina en canviar de branca pot passar desapercebut o
  desconcertar lleugerament (S4, cosmètic).

---

## Recommended Next Actions
1. **Decidir D4 + herència (Decisió #1)** — és la que determina si D4 aporta valor més enllà de Gen 1.
   Recomanació dels agents: opció (C) híbrid (accions base s'hereten; mercat afegeix contingut nou per generació/era).
2. **Confirmar la força de D3 (Decisió #2)** — ¿el rol d'eina cross-branch gratis és el desitjat? Si sí, baixar el
   cost de la 1a eina; si no, requerir la tech de la branca destí.
3. **Arreglar S3-01 (`material_min ?? 2`)** — perquè l'economia que D4 vol fer significativa tingui sumiders reals.
4. **Pacing de la dead zone pre-`ut_eines` (S2-01)** — acostar `ut_eines` o afegir contingut de 1a capa.
5. La resta (S3-02/03/05, S2-02, S4-01) → backlog d'`economy-designer` / `ux-designer`.

## Routing
| Findings | Route |
|---|---|
| Decisió #1 (D4+herència), #2 (D3), S3-01/02/03/05 | `economy-designer` + `game-designer` |
| S2-01 dead zone / pacing | `game-designer` |
| S2-02 senyalització mercat, S3-04 avís hereu | `ux-designer` / `ui-programmer` |
| S4-01 neteja destresa inert | backlog |

**No blocking issues — segur per continuar.** Els canvis d'avui són estables; el següent pas és de disseny
(Decisions #1 i #2), no de correcció.
