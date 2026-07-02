# Optimizer Analysis — ERA1-CONTENT — 2026-07-02

**Scope**: `prototypes/bloodline-v2/game.js` + `prototypes/bloodline-v2/data.js` (commit 5964ebd)
**Auditor**: playtester-optimizer

> ⚠️ Discrepàncies de briefing detectades: DESTRESA_MAX=4 (no 2), LIFE_EXPECTANCY=20 (no 14), INCLINATION_INHERITANCE_RATE=0.85 (no 0.65). Anàlisi usa valors reals del codi.

---

## S2 — Exploits Majors

### E-01 — Single-axis unlock de tots els 16 TdBs

**Categoria**: Axis Dominance | **Reproduïble**: Sempre

Tots els TdBs defineixen `inclination_conditions` amb `operator: "OR"` sobre qualsevol dels 4 eixos. Un jugador que especialitza únicament l'eix impuls als llindars (0.12, 0.15, 0.20, 0.25, 0.30, 0.35, 0.38, 0.42, 0.45) desbloqueja els 16 TdBs sense necessitar cap altre eix. Un caçador pur pot desbloquejar TdBs de Místic i accedir-hi si té el mínim d'un eix secundari.

**Impacte**: HIGH — La premissa de diversificació multi-eix per accedir a TdBs tardans no existeix mecànicament.

**Fix proposat**: Canviar les `inclination_conditions` de TdBs 5-16 de `OR` a `AND` amb un eix secundari diferent, o introduir un cost de llindar acumulat que requereixi diversificació real.

**Ruta**: `economy-designer`

---

### E-02 — Snowball de successió (inheritance rate 85%, no 65%)

**Categoria**: Succession | **Reproduïble**: Sempre

El codi mostra `INCLINATION_INHERITANCE_RATE = 0.85` (el briefing documentava 0.65). Amb 85%:
- Gen 2 amb pare a impuls=0.45 neix a 0.3825 → supera el llindar de TdB 9-10 al torn 2.
- Gen 3 neix a 0.325 → sobre el llindar de TdB 7-8.
La tensió de "guanyar inclinació" desapareix a partir de Gen 2 per a branques especialitzades.

**Nota**: La memòria del projecte indica que "herència forta és intencionada". Si 0.85 és el disseny objectiu, cal documentar explícitament que TdBs 9+ estan dissenyats per a Gen 2+, no Gen 1.

**Impacte**: HIGH — Les generacions 2-5 salten directament al contingut tardà.

**Ruta**: `economy-designer` (decisió de disseny)

---

### E-03 — Upgrade chain skip: accions base i tier-4 visibles simultàniament (Bug)

**Categoria**: Action Visibility | **Reproduïble**: Sempre (si es compra upgrade no seqüencial)

`getZoneActions()` verifica el vincle directe `upgrades_action_id` però no de forma transitiva. Si un jugador compra act_forn_terra (TdB 14, tier-4) sense tenir act_taller_percussio (tier-2), aleshores act_tallar_ascles (base) i act_forn_terra apareixen simultàniament al carousel.

**Cadenes afectades**:
- act_tallar_ascles → act_taller_percussio → act_obrar_plegats → act_forn_terra
- act_recollectar_pedra → act_llegir_veta → act_palanca_pedrera

**Impacte**: MEDIUM — Bug de lògica de visualització + potencial doble benefici d'inclinació.

**Ruta**: `qa-lead`

---

### E-04 — Food cap nulla les millors accions de caça en situació no-crítica

**Categoria**: Resource Ceiling

Fórmula efectiva: `valor_efectiu = min(cap, food + output) - food - upkeep`. Per a les millors accions de caça (8-15 aliment) amb food_cap=10, el valor efectiu és mai superior a `cap - food`. Quan food=5, act_darrera_cacera (cost: −7 salut, −1 eina, execute_cost 1) genera el mateix net que una acció base act_espiar_ramat (3-8 food sense cost). act_calendari_collita (Recol·lector, TdB 16): 7-10 food, sense penalitzacions, resulta mecànicament superior en quasi totes les situacions.

**Impacte**: HIGH — Desincentiva el game plan del Caçador fora d'estat crític. Les accions de Recol·lector tardà dominen per absència de costos.

**Ruta**: `economy-designer`

---

## S3 — Preocupacions de Balanç

### B-01 — Espiritualitat domina recuperació de salut en joc tardà

Accions Místic de TdB 10-16 recuperen 7-12 salut/torn a cost de 2-3 aliment. Cap acció de Caçador en TdBs 5-16 té recuperació directa de salut. Penalització d'envelliment a edat 15+: ~7.9 salut/torn. El Místic pot neutralitzar l'envelliment indefinidament; el Caçador no.

**Impacte**: MEDIUM — El Místic és el winner en longevitat. Ruta: `economy-designer`.

---

### B-02 — Recol·lector: branca més segura i sostenible

act_calendari_collita (TdB 16): 7-10 food, sense health_delta, sense execute_cost. vs. act_darrera_cacera (TdB 16): 9-15 food, −7 salut, −1 eina, execute_cost 1. Per food cap (=10), outputs nets equivalents. Caçador queda definit pel risc però si el risc no genera reward diferencial, perd atractiu.

**Impacte**: MEDIUM. Ruta: `economy-designer`.

---

### B-03 — act_relat_gesta: acció anòmala a mid-game

TdB 8, impuls min 0.10, purchase_cost 4. Output: 5-8 tokens + 1 salut. **Sense cap cost de recurs**. Comparable a millors token-actions de TdBs 9-10 que requereixen eines o pedra. Punt de compra òbvia per a qualsevol jugador optimitzador.

**Impacte**: LOW-MEDIUM. Ruta: `economy-designer`.

---

### B-04 — TdBs 13-16 accessibles principalment via snowball

Llindars 0.42-0.45. Sense snowball d'herència, un jugador necessita quasi tota una vida per arribar-hi. Amb snowball (0.85), Gen 2 hi arriba en 1-2 accions. El contingut nou de TdBs 9-16 serà invisible per a jugadors casuals de primera generació.

**Impacte**: MEDIUM. Ruta: `economy-designer`.

---

### B-05 — Mecànica obsoleta: cobertura insuficient

Accions amb `obsoletes_action_id`: 3 (totes en TdBs 13-16, cicles 70-85+). TdBs 1-12 no generen cap obsolescence. No hi ha pressió de substitució al llarg del joc principal.

**Impacte**: LOW. Ruta: `economy-designer`.

---

### B-06 — BRANCHES.conditions: camp definit però no avaluat (dead code)

Els objectes `BRANCHES` defineixen un camp `conditions` (AND complex, p.ex. branch_hunter: impuls >= 0.18 AND sociabilitat <= 0.40) que `getActiveBranches()` NO avalua. Usa exclusivament `BRANCH_AXIS` + `BRANCH_ACTIVATION_PCT = 0.34`. Les condicions semblen ser codi legat.

**Impacte**: LOW. Ruta: `qa-lead` (dead code) / `economy-designer` (si eren intencionals).

---

## S4 — Observacions Cosmètiques

### C-01 — ID duplicat a pool_artesania

Dues entrades a `pool_artesania` comparteixen `id: "ev_eina_trencada"`. El sistema `recentEventIds` pot tractar-les com el mateix event. Ruta: `qa-lead`.

### C-02 — Briefing desactualitzat

DESTRESA_MAX=4 (no 2), LIFE_EXPECTANCY=20 (no 14), INCLINATION_INHERITANCE_RATE=0.85 (no 0.65). Cal actualitzar els briefs de playtester.

### C-03 — TdB discovery en llindar exacte

`getSkillMaturity()` retorna 0 quan el valor de l'eix és exactament al llindar mínim. La selecció és aleatòria entre múltiples TdBs a maturity=0. El joc no comunica que cal superar el llindar, no simplement arribar-hi.

---

## Sistemes Verificats OK

- **Token economy general**: cap de 35 + inheritDecay=0.3 conté el creixement inter-generacional. ✓
- **Destresa rush contenida**: DESTRESA_MAX=4, DESTRESA_THRESHOLD=5 → 20 torns per maximitzar totes. Impossible en una vida. ✓
- **Stat multiplier contingut**: `1 + (stat - 1.0) * 0.15`, STAT_MAX=5.0 → max 1.60. Regressa amb herència 0.50. ✓
- **INERTIA_FACTOR=2.0**: Limita adequadament l'escalada. Impuls=1.0 requeriria 25-30 execucions dedicades. ✓
- **Upgrade chains (seqüencials)**: Funcionen correctament quan es compren en ordre. ✓
- **Food starvation → health drain**: Penalització severa per quedar sense menjar. Correcte. ✓

---

*Fitxers: `prototypes/bloodline-v2/game.js`, `prototypes/bloodline-v2/data.js`*
*Rutes: `qa-lead` (E-03, B-06, C-01) · `economy-designer` (E-01, E-02, E-04, B-01, B-02, B-03, B-04, B-05)*
