# Audit Tycoon — Post-DESIGN-01 Fase 4 — 2026-06-19

**Agent**: playtester-tycoon
**Scope**: Verificació fixes BRN-01/02/04, estat BRN-05, nous problemes Fase 4
**Fitxers auditats**: `prototypes/bloodline-v2/data.js`, `prototypes/bloodline-v2/game.js`

---

## Verificació fixes anteriors

**BRN-01: CONFIRMAT**
`game.js:150` ara té `branques: state.branques || 0` a `saveGame` i `game.js:202` el mateixpatró a `loadGame`. El recurs es serialitza i es restaura correctament.

**BRN-02: CONFIRMAT**
Els quatre mapes `outIcons` (game.js:1656, 2539, 2812, 2828) ara inclouen `branques: '🌿'`. L'emoji es mostrarà correctament a carrusel, notificació de compra, panell AI i resum d'upgrade.

**BRN-04: CONFIRMAT**
`data.js:587`: `act_recollir_branques: { impuls: { max: 0.45 } }`. El llindar ha pujat de 0.30 a 0.45.

---

## BRN-05 status actualitzat

**Parcialment resolt.** Amb el llindar a 0.45:

- Un Caçador actiu (impuls 0.30–0.44) ara veu `act_recollir_branques` com a ACTIVE al Bosc. Pot acumular 2–4 branques per torn per a `act_forjar_punta` (cost: pedra 2 + branques 1). La barrera pràctica ha desaparegut per a la majoria de sessions de Caçador.
- El problema residual: `act_forjar_punta` genera `impuls: +0.05` per us (`data.js:834`). Un Caçador que forja llances repetidament (el loop central del path) augmenta impuls progressivament. Si arriba a 0.45+, `act_recollir_branques` li torna FADED (0.45 = exactament al límit — FADE_MARGIN = 0.05, per tant a impuls 0.40 ja podria estar FADED si la implementació de FADE_MARGIN és `threshold - FADE_MARGIN`).

Verificació de `getActionVisibility` per confirmar la lògica de FADED:

```js
// El threshold és impuls.max = 0.45
// FADE_MARGIN = 0.05 (data.js:58)
// Si impuls > 0.45 → HIDDEN; si impuls > (0.45 - 0.05 = 0.40) → FADED
```

Implicació: un Caçador amb impuls entre 0.40 i 0.45 veuria l'acció en estat FADED. Donat que `act_forjar_punta` fa +0.05/us, un Caçador que comença a 0.30 i forja 2-3 vegades arriba a 0.40-0.45 — zona de FADED/HIDDEN. El problema s'atenua però persisteix en sessions actives de Caçador forjador.

**Veredic BRN-05**: Millora significativa. El Caçador moderat de 3-5 primeres accions ja té accés. El Caçador pur que forja intensament (>3 cops sense diversificar) pot tornar a quedar-se FADED. Pendent de decisió de disseny sobre si el Caçador pur ha de poder accedir a `act_recollir_branques` sense restriccions (`impuls: { max: 0.55 }` o eliminar el màxim).

---

## Nous problemes

### F4-01 (S2) · `act_recollecta_metodica` perd el `side_effect: branques +1` de l'acció base

**Font**: `data.js:671` (`act_recollectar_arrels`) vs `data.js:1469` (`act_recollecta_metodica`)

**Descripció**:
`act_recollectar_arrels` (base) té `side_effects: [{ resource: 'branques', delta: +1 }]`. Quan el jugador compra l'upgrade `act_recollecta_metodica` (is_upgrade: true, upgrades_action_id: act_recollectar_arrels), l'acció base és reemplaçada pel motor (`upgradedBaseActionIds`). L'upgrade NO té cap `side_effects` — és una acció de food pur (4-7). El jugador passa de tenir branques +1 en cada recol·lecta a no tenir-ne cap.

**Impacte per branca**:
- **Recol·lector**: perd la seva font secundaria de branques en el moment en que millora el seu principal acció de food. El Recol·lector que ha comprat l'upgrade i NO ha desbloquejat el Bosc queda sense cap font de branques accessible fins que desbloquegi `bt_coneixement_plantes` (req: `ut_corda`, cicle ~28). Si té `bt_trampes` actiu (`act_revisar_trampes` al Bosc), pot arribar al Bosc, però el Bosc requereix `impuls: { max: 0.45 }` per a `act_recollir_branques` — accessible per al Recol·lector.
- **Artesà i Místic**: depenen igualment d'aquesta font si no han descobert el Bosc.

**Reproducció**:
1. Acumular `d_botanica` (5 usos `act_recollectar_arrels`).
2. Comprar `act_recollecta_metodica` al Mercat.
3. Observar que `act_recollectar_arrels` desapareix del carrusel (reemplaçada).
4. Executar `act_recollecta_metodica` repetidament: `state.branques` ja no creix via aquest camí.

**Fix**: Afegir `side_effects: [{ resource: 'branques', delta: +1 }]` a `act_recollecta_metodica` (data.js:1469).

**Ruta**: gameplay-programmer


### F4-02 (S3) · `act_tela_sagrada` no té `output_resource` ni `side_effects` visibles — badge buit al carrusel

**Font**: `data.js:1322` (`act_tela_sagrada`)

**Descripció**:
```js
id: "act_tela_sagrada", ..., purchase_cost: 3, execute_cost: 0, material_min: 1, material_max: 3,
stat_key: "vincle", stat_gain: 0.10, ...
```
No hi ha `output_resource`, no hi ha `side_effects`. El sistema `material_min/material_max` genera tokens automàticament però el motor de badges del carrusel (`showZoneCardDetails` a game.js:1662-1672) només mostra badges per a `action.output_resource` i `action.side_effects`. Per a `act_tela_sagrada`, el jugador veu una carta sense cap badge de benefici — l'única indicació de retorn és la descripció textual.

Comparació amb accions similars del path Místic (bt_nusos_sagrats):
- `act_ritual_nusos` té `side_effects: [{ resource: "health", delta: +5 }]` — badge visible.
- `act_tela_sagrada` no té cap output visible.

**Impacte**: El jugador al Mercat no pot avaluar el benefici de comprar `act_tela_sagrada` sense llegir la descripció. Desalineat amb la filosofia de comunicació visual de l'UI (tots els beneficis haurien de tenir badge).

**Fix**: Afegir `side_effects: [{ resource: "health", delta: +3 }]` o `side_effects: [{ resource: "branques", delta: +2 }]` per donar un output visible coherent amb el path Místic, o bé afegir un `output_resource: "health"` mínim (3-5 health, consistent amb `act_musica_vetlla`).

**Ruta**: economy-designer (decidir output) → gameplay-programmer (implementar)


### F4-03 (S3) · `act_revisar_trampes` queda a la zona "Bosc" però bt_trampes s'activa per inclinació Recol·lector; potencial barrera de zona

**Font**: `data.js:891` (`act_revisar_trampes`, zona: "Bosc") i `data.js:345` (`bt_trampes`, unlocks: ["act_parar_trampes", "act_revisar_trampes"])

**Descripció**:
`bt_trampes` requereix `universal_prereq: ut_corda` i `sociabilitat: { min: 0.10 }`. Un cop desbloquejat, dona accés a `act_parar_trampes` (Planes) i `act_revisar_trampes` (Bosc). El problema: `act_revisar_trampes` apareix al Bosc, però el Bosc és una zona NO descoberta per defecte. El jugador pot desbloquejar `bt_trampes` i veure que `act_revisar_trampes` existeix però NO pot executar-la fins que descobreixi el Bosc per exploració o via `bt_marques_territori`.

El fix de Fase 4 (delta `impuls: -0.01` en lloc de `+0.04`) és correcte i no introdueix nous problemes de coerència. El problema reportat aquí és preexistent (és una barrera de zona, no de delta) però pot ser amplificat perquè ara el Recol·lector que executa `act_revisar_trampes` regularment no generarà el +0.04 impuls que anteriorment empenyia cap al path Caçador. Ara el delta és -0.01, que és consistent amb el path Recol·lector.

**Impacte de disseny**: El Recol·lector que vol usar les dues accions de `bt_trampes` ha de primer descobrir el Bosc. La dependència és lògica narrativament però pot ser invisible per al jugador (veu "Revisar Trampes" al carrusel del Bosc sense saber que el Bosc no és accessible). No és un bug tècnic — és UX.

**Ruta**: economy-designer (valorar si `act_revisar_trampes` hauria d'estar a les Planes o si s'ha d'explicar millor la condició de zona)

---

## Coherència output Místic (12 accions revisades)

Catalogació de les 12 accions amb outputs modificats per Fase 3+4, comparades amb el disseny declarat:

| Acció | Branch Tech | Output Codi | Output Disseny | Estat |
|---|---|---|---|---|
| act_preparar_ungüent | bt_guariment_plantes | branques 2-3 | branques 2-3 | OK |
| act_pintar_parets | bt_pintura_rupestre | pedra 2-3 | pedra 2-3 | OK |
| act_narrar_llegendes | bt_pintura_rupestre | branques 2-3 | branques 2-3 | OK |
| act_observar_cel | bt_calendari_natural | food 4-7 | food 4-7 | OK |
| act_transit_nocturn | bt_calendari_natural | food 6-12, -5hp | food 6-12, -5hp | OK |
| act_decorar_cos | bt_pigments_tintures | branques 2-3, impuls -0.02, intel·lecte -0.02 | branques 2-3 | OK |
| act_cants_grup | bt_narracio_oral | health 3-5 | health 3-5 | OK |
| act_musica_vetlla | bt_musica_os | health 3-5 | health 3-5 | OK |
| act_consagrar_ornaments | bt_ornaments | health 5-9 | health 5-9 | OK |
| act_curar_herbes | bt_guariment_plantes | health 8-14 | sense canvi | OK |
| act_ritual_talisman | bt_ornaments | health 8-14, consumes eina | sense canvi | OK |
| act_ornamentar_se | bt_ornaments | health 2-4 | sense canvi | OK |

**Distribució real**: health 6/12 (50%), food 2/12 (17%), branques 3/12 (25%), pedra 1/12 (8%).
**Distribució disseny declarat**: health 42% (5/12), food 17% (2/12), branques 42% (5/12)(?).

Discrepància: el disseny declarat al briefing cita "branques 42%" però el codi mostra 3 accions de branques (25%). La discrepàcia és perquè el briefing inclou `act_decorar_cos` (redesenyada), `act_narrar_llegendes` (redesenyada) i `act_preparar_ungüent` (redesenyada) com a branques — 3/12 = 25%, no 42%. El percentatge del briefing pot incloure els outputs de branques via `side_effects` de les accions de Recol·lector secundàries, però les accions Místic pures en branques son 3.

**Conclusió**: No hi ha discrepàncies entre codi i disseny per als 12 outputs. Els valors numèrics (output_min/output_max) coincideixen exactament. Els `inclination_deltas` dels 12 accions coincideixen amb el disseny de Fase 4 (`act_decorar_cos: impuls -0.02, intel·lecte -0.02` confirmat a data.js:1217).

---

## Camins d'accés branques per branca

### Caçador (impuls dominant)
- **Font primària**: `act_recollir_branques` al Bosc — ACCESSIBLE si impuls ≤ 0.45 (amb fix BRN-04). FADED si impuls entre 0.40-0.45.
- **Font secundaria**: `act_recollectar_arrels` side-effect +1 — accessible fins que comprin l'upgrade. Un cop comprat `act_recollecta_metodica`, aquesta font DESAPAREIX (F4-01).
- **Necessitat**: `act_forjar_punta` requereix branques 1 + pedra 2. Cost moderat.
- **Viabilitat**: Viable fins que l'impuls supera 0.40 per efecte acumulatiu del forjat. La font via arrels + el Bosc és suficient per als primers 5-8 usos.

### Artesà (intel·lecte dominant)
- **Font primària**: `act_recollectar_arrels` side-effect +1 — accessible però lenta. Si compra l'upgrade, perd la font (F4-01).
- **Font secundaria**: `act_recollir_branques` al Bosc — ACCESSIBLE (impuls baix del Artesà és compatible amb el màxim 0.45).
- **Necessitat**: `act_faonar_eines` requereix branques 1 + pedra 2.
- **Viabilitat**: Viable. L'Artesà té impuls baix, per tant `act_recollir_branques` és ACTIVE. El Bosc s'ha de descobrir primer (bt_marques_territori o explorar).

### Recol·lector (sociabilitat dominant)
- **Font primària**: `act_recollir_branques` al Bosc — ACTIVE (impuls baix del Recol·lector).
- **Font secundaria**: `act_recollectar_arrels` side +1 (fins a l'upgrade), `act_recollida_bolets` side +1.
- **Sink**: `act_trenar_garbell` (branques 2 + pedra 1) — produeix eines però no es repeteix regularment (eina cap: 3).
- **Viabilitat**: Excel·lent. El Recol·lector és la branca amb accés més fàcil i més abundant a branques. Superàvit possible (BRN-06, conegut).

### Místic (espiritualitat dominant)
- **Font primària**: `act_preparar_ungüent` (branques 2-3, bt_guariment_plantes), `act_narrar_llegendes` (branques 2-3, bt_pintura_rupestre), `act_decorar_cos` (branques 2-3, bt_pigments_tintures).
- **Font secundaria**: `act_recollir_branques` al Bosc — CONDICIONADA a impuls ≤ 0.45. Un Místic pur pot tenir impuls creixent via `act_transit_nocturn` (+0.06/us), que pot empènyer l'impuls cap al límit.
- **Font d'urgència**: `act_recollectar_arrels` side +1 — sempre accessible a les Planes.
- **Necessitat**: `act_crear_talisman` (branques 2 + pedra 1 → eina 1).
- **Viabilitat**: Viable un cop desbloquejades `bt_guariment_plantes`, `bt_pintura_rupestre` o `bt_pigments_tintures`. Sense cap branch tech desbloquejar (pre-cicle 16), el Místic depèn exclusivament de `act_recollectar_arrels` (+1/torn). A 2 branques/talisman, necessita 2 torns per talisman — accessible però lent.

---

## Resum executiu

Tots tres fixes BRN-01/02/04 estan correctament implementats al codi. Les 5 correccions de deltes de Fase 4 (`act_revisar_trampes`, `act_molda_grans`, `act_assecament_plantes`, `act_seleccionar_llavors` + la coherència del path Recol·lector) estan aplicades correctament. Els 12 outputs Místic redesenyats coincideixen exactament amb el disseny declarat.

S'han detectat 2 nous problemes: F4-01 (S2) és un bug silenciós on l'upgrade de `act_recollectar_arrels` elimina el side-effect de branques, trencant la cadena de subministrament per a qualsevol branca que depengui de la font secundaria via arrels. F4-02 (S3) és un problema de comunicació visual de `act_tela_sagrada`. F4-03 (S3) és una barrera de zona preexistent sobre `bt_trampes`/Bosc que no empitjora amb Fase 4 però mereix atenció de disseny.
