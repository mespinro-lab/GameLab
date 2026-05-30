# Playtest Report — New Player Comprehension
**Tester role**: playtester-new-player
**Sweep**: #29b — Post-Content-Migration
**Date**: 2026-05-29
**Story type**: UI (menus, HUD, screens) + Integration (zone unlock flow)
**Gate level**: ADVISORY

---

## NP-01 — No opening instruction or "start here" signal
**Severity**: S2
**Description**: The game loads directly into the main UI with no onboarding text, tooltip, or highlighted first action. A new player sees: four zone cards (Campament, Planes), a profile panel full of stats, an inclination section, and a tech strip. Nothing identifies where to click first. "Espiar el Ramat", "Recol·lectar Arrels", and "Explorar els Voltants" are presented as equals — the critical exploration action that unlocks the Bosc zone receives no emphasis whatsoever.
**Where it occurs**: `index.html` — initial render state; `game.js` `initState()` / `render()` — no welcome or hint text injected at cycle 0.
**Suggested fix**: At cycle 0, populate `last-result` with a one-sentence onboarding prompt, e.g., "Comença explorant i recollectant. Executa accions per guanyar Aliment i avançar cicles." Alternatively, add a `title` attribute or a subtle "→ Comença aquí" badge on `act_explorar_voltants` at cycle 0 only.

---

## NP-02 — "Explorar els Voltants" not visually distinguished as a critical early action
**Severity**: S2
**Description**: The description "T'aventures més lluny del campament. El que trobes pot canviar-ho tot." hints at importance but the action row is visually identical to all other base actions. There is no mechanical callout that this action is the only one that unlocks the Bosc zone. Players who skip it entirely will never see the Bosc zone in their first session and may not understand why.
**Where it occurs**: `data.js` line 197 (`act_explorar_voltants` description); `game.js` `buildZoneActionRow()` — no special rendering for zone-unlocking actions.
**Suggested fix**: Add a subtle visual indicator (e.g., a `🗺️` prefix or a `zona-unlock` CSS class) on actions that have `unlocks_zone` set. The description could be more explicit: "T'aventures més lluny del campament. El que trobes pot canviar-ho tot — inclosa una nova zona."

---

## NP-03 — Bosc zone discovery notification lacks explanation of what triggered it
**Severity**: S2
**Description**: When `act_explorar_voltants` is executed and Bosc is unlocked, `lastResult` is set to "Has explorat prou lluny — Bosc descobert!" (game.js line 341). This fires correctly but (a) `lastResult` is immediately overwritten by the action result on the same line (line 336 runs before line 341 in the same `executeAction` call, so the zone discovery message DOES win — but only because it is assigned last, not by design), and (b) the log entry "Nova zona descoberta: Bosc" is a single undifferentiated `log-entry` line indistinguishable from cost/output entries. A player who does not notice the new zone card appearing in the grid has no durable callout explaining the discovery.
**Where it occurs**: `game.js` lines 338–342 (`unlocks_zone` block); `game.js` line 719 (`discovery-notification` div, which is only used for branch tech eligibility, not zone discovery).
**Suggested fix**: Use the `discovery-notification` div (already styled in gold) for zone discoveries, and keep it visible for at least one cycle. Alternatively, log the zone unlock as a highlighted entry distinct from food/health entries (e.g., prefix with `🗺️` and a different CSS class).

---

## NP-04 — "Efecte passiu: +3 Salut (vestimenta)" is opaque without context
**Severity**: S3
**Description**: When `bt_agulla_os` (Agulla d'Os) is unlocked, the log reads "Efecte passiu: +3 Salut (vestimenta)" (`game.js` line 202). A new player has not been told what a "passive effect" is, that branch techs can have them, or that the parenthetical "(vestimenta)" is a source tag. The Glossary does not define "efecte passiu" as a concept — it describes individual branch techs via the Habilitats section but does not explain the passive effect category. The log message is the player's only signal that something systemic happened.
**Where it occurs**: `game.js` line 202 (`unlockBranchTech` — `addLog(\`Efecte passiu: ${pe.desc}\`)`); Glossary section 7 (`showGlossary` line 1231) — no passive effect explanation present.
**Suggested fix**: Expand the log message to: "Efecte passiu (Agulla d'Os): +3 Salut (millora de vestimenta)". Add a brief definition row to Glossary section 7: "Efectes Passius — Alguns habilitats apliquen bonificadors automàtics al desbloquejar-se o de forma contínua."

---

## NP-05 — "Provisions" used for two different resources
**Severity**: S1
**Description**: The word "Provisions" is used for the material/tool economy resource (🧠) in the action log (game.js line 334: `const resLabel = outRes === 'eines' ? 'Provisions' : ...`) AND for food in common Catalan usage. The top-bar header labels the 🧠 pill as "Recursos" (index.html line 29), but the Glossary labels it "Provisions (Era 1)" (game.js line 1191). The action log therefore reads "+3 Provisions" for a crafting output while the food pill labelled 🌾 is called "Aliment" in the log and UI. A player who reads the log entry "+3 Provisions" while looking at the food counter will be confused about which resource increased.

Additionally, in game.js line 254 there is a leftover string: `addLog(\`Saber insuficient per aprendre ${action.name}.\`)` — "Saber" is the old name for this resource before the rename to "Provisions", and this string was NOT updated.

**Where it occurs**:
- `game.js` line 334: `resLabel = 'Provisions'` for `outRes === 'eines'`
- `game.js` line 254: `"Saber insuficient"` — old resource name not updated
- `game.js` line 261: `addLog(\`Après: ${action.name} (−${action.purchase_cost} 🧠)\`)` — uses icon only, no label
- Glossary line 1191: "Provisions (Era 1)" — correct label
- Header (index.html line 29): "Recursos" section label for the 🧠 pill

**Suggested fix**: Decide on a single canonical name. If "Provisions" is correct, update game.js line 334 to use it consistently and rename the header section from "Recursos" to "Provisions". Fix line 254 to read "Provisions insuficients per aprendre". If the name is still in flux, use the icon (🧠) exclusively in log messages rather than a word label.

---

## NP-06 — Inclination mechanic (ACTIVE/FADED/HIDDEN) not explained in main UI
**Severity**: S2
**Description**: The inclination system is the core visibility mechanic for actions, but it is explained only in the Glossary (game.js line 1197) under "Com funciona". In-game, a player who sees an action become greyed out (FADED, 45% opacity per style.css line 584) gets no inline explanation. The "Faded reason" note (game.js lines 943–950, "Fora de rang: ...") only appears when `action.inclination_requirements` is set, but base actions and branch tech actions do not use `inclination_requirements` — they use the inclination as a filter for VISIBILITY before purchase. The mechanic that determines what you CAN see and buy is entirely invisible until you open the Glossary.
**Where it occurs**: `game.js` `getActionVisibility()` lines 93–115; `style.css` line 584 (`.zone-action-row.faded { opacity: 0.45; }`); `game.js` Glossary line 1197 (only explanation).
**Suggested fix**: Add a one-line hint beneath the "Inclinació" section header in the profile panel (e.g., "La inclinació determina quines accions pots veure i aprendre."). When a zone card's "Actives" count drops to 0, show a dim hint: "La teva inclinació actual amaga algunes accions. Consulta el Glossari."

---

## NP-07 — Branch tech unlock has no modal or persistent notification
**Severity**: S2
**Description**: When a branch tech is unlocked (via `performDiscoveryAction` or a discovery event), the feedback is: (1) log entry "Nova habilitat: [name]" and (2) `lastResult = "Habilitat nova apresa: [name]"`. No information is given about what new actions are now purchasable or in which zone they appear. A player who unlocks "Punta de Llança" has no prompt to check the Planes zone "Aprendre" tab for the two new actions. The discovery notification strip (gold bar) resets immediately since `getEligibleBranchTechs()` now returns an empty array (the tech was just unlocked), so the prompt disappears.
**Where it occurs**: `game.js` `unlockBranchTech()` lines 194–203; `game.js` `renderActionsPanel()` lines 719–724 (discovery notification disappears post-unlock); succession/discovery flow.
**Suggested fix**: After unlocking a branch tech, set `lastResult` to include the unlocked action names: "Habilitat nova: Punta de Llança. Noves accions disponibles a Planes: Caça amb Llança, Emboscada Nocturna. Ves a 'Aprendre' per comprar-les." Alternatively, briefly show the zone card(s) with the "Aprendre" tab pre-selected.

---

## NP-08 — Succession modal shows raw axis key, not human label
**Severity**: S3
**Description**: In the succession modal, the successor card displays `${dominantAxis}: ${dominantVal}` (game.js line 1098), where `dominantAxis` is the raw JS key (e.g., "intel·lecte", "espiritualitat"). The summary line also shows `succ-axis` as `topAxis (topAxisVal)` (line 1091) in the same raw format. The player must know the internal key names to understand which personality direction the successor leans toward. By contrast, the inclination panel (renderProfilePanel) maps each axis to human pole labels (Reflexiu/Impulsiu, Instintiu/Analític, etc.) but succession does not use `AXIS_LABELS`.
**Where it occurs**: `game.js` lines 1091, 1098 (succession modal render); `AXIS_LABELS` defined at line 522 but not referenced in succession rendering.
**Suggested fix**: Replace raw axis key with `AXIS_LABELS[dominantAxis].right` (for positive values) or `.left` (for negative). E.g., show "Analític: +0.42" instead of "intel·lecte: 0.42".

---

## NP-09 — Succession mechanic not explained before it triggers
**Severity**: S2
**Description**: The succession modal appears with "El personatge ha completat la seva vida." (index.html line 130) and a summary, but no prior explanation prepares the player for: (a) what succession IS, (b) why they must pick a child, (c) what the 65% inheritance means in practice. The warning "⚠ Queden N cicles. Cal tenir fills per assegurar la successió." (game.js line 711) appears only when 4 cycles remain. A player who has not found a partner by cycle 10 has no way to create heirs in time and may not understand why.

The Glossary section 11 (game.js line 1288) explains succession correctly, but requires the player to have already opened the Glossary, which has no in-game prompt.

**Where it occurs**: `game.js` `renderActionsPanel()` lines 708–715 (succession warning timing); `index.html` lines 127–139 (succession modal text); `game.js` `showGlossary()` line 1288 (only in Glossary).
**Suggested fix**: Show the succession warning earlier (at 6 cycles remaining, not 4). Add a one-sentence callout to the "Família" section in the profile panel at game start: "Busca parella i tingues fills abans que el cicle de vida s'acabi (cicle 14)."

---

## NP-10 — "Escoltar els Estrangers" action label does not communicate its function
**Severity**: S3
**Description**: The discovery action "Escoltar els Estrangers" (`act_escoltar_estrangers`) appears in the Campament zone when branch techs are eligible. The button label is "Escoltar". A new player does not know this action unlocks branch tech skills — the discovery notification reads "Hi ha estrangers al poblat que expliquen tècniques noves." which is informative, but the action row itself shows no output range, no cost, and no description when `isDiscovery` is true (game.js line 904: `if (!isDiscovery) { ... }` — meta block is skipped). A player may dismiss the notification bar, miss the action, or be uncertain what "Escoltar" achieves.
**Where it occurs**: `game.js` lines 787–789 (discovery action injected into Campament); lines 904, 955–959 (discovery row rendering — description and meta suppressed); `data.js` line 225 (`act_escoltar_estrangers` description not shown).
**Suggested fix**: Show the action description "Passes estona amb visitants d'un altre clan. Podries aprendre tècniques que no coneixies." in the discovery row even when `isDiscovery` is true. Change the button text from "Escoltar" to "Aprendre tècnica nova".

---

## NP-11 — Glossary zone descriptions contain spelling errors ("recolecta")
**Severity**: S3
**Description**: The `ZONE_INFO` object in `showGlossary()` (game.js lines 1254–1258) contains:
- `Bosc: 'Recolecta avançada i plantes. Es descobreix explorant les Planes.'` — "Recolecta" should be "Recol·lecta" (missing the interpunct and the doubled l).
- `Planes: 'Caça, exploració i recolecta exterior. Disponible des del principi.'` — same error: "recolecta" → "recol·lecta".
Both are inconsistent with the correct spelling used throughout data.js (e.g., "Recol·lectar Arrels", "Recol·lecció Sistemàtica", "act_recollectar_arrels").
**Where it occurs**: `game.js` lines 1255–1256 (`ZONE_INFO` constant inside `showGlossary()`).
**Suggested fix**: Change both instances of "recolecta" to "recol·lecta".

---

## NP-12 — data.js line 542: "Mòlts tots igual" — grammatical error
**Severity**: S4
**Description**: In `ev_desc_llavor` (pool_recollecta discovery event, data.js line 545), the second option reads: `{ text: "Mòlts tots igual", food_delta: +1, discovers: false }`. "Mòlts" is the past participle of "mòlts/molts" which in this imperative context should be "Mol-los tots igual" or "Mòl-los tots igual" (2nd person singular imperative of "mòldre" + clitic). The current form reads as a past-tense adjective, not an action the player is choosing to take, creating a jarring mismatch with the other option's imperative form ("Apartar-los i experimentar").
**Where it occurs**: `data.js` line 545 (`ev_desc_llavor`, option index 1).
**Suggested fix**: Change `"Mòlts tots igual"` to `"Mòl-los tots igual"` or `"Continuar molent tots igual"`.

---

## NP-13 — data.js line 556: possible English phrasing in Catalan context ("aquillonat")
**Severity**: S4
**Description**: In `ev_desc_agulla` (pool_artesania, data.js line 555–556), the event text reads: "un fragment llarg i fi queda perfectament aguillonat." The word "aguillonat" does not appear in standard Catalan dictionaries — it appears to be a nonce derivation from "agulla" (needle). The intended meaning is "amb forma d'agulla" or "com una agulla" (needle-shaped). While not an English leak, it is an invented word that may confuse players.
**Where it occurs**: `data.js` line 555.
**Suggested fix**: Replace "perfectament aguillonat" with "amb forma perfecta d'agulla" or "prim i llarg com una agulla".

---

## NP-14 — data.js: "son" missing accent in two action descriptions
**Severity**: S4
**Description**: The description for `act_recollida_bolets` (data.js line 292) reads: "Coneixes quins bolets del bosc son comestibles i quins cal evitar." The third-person plural of "ser" is "són" (with accent) in Catalan. The unaccented "son" means "sleep" (noun). Same error appears nowhere else in descriptions, but this is a visible, readable text string.
**Where it occurs**: `data.js` line 292.
**Suggested fix**: Change `"son comestibles"` to `"són comestibles"`.

---

## NP-15 — Glossary has no clear entry point prompt in the main UI
**Severity**: S3
**Description**: The Glossary button "?" (index.html line 45) is a small 28px circle in the top-right corner of the header. It has `title="Glossari del joc"` (shown on hover only) and no label. On mobile, `title` tooltips do not appear on tap. There is no in-game prompt at any point directing the player to open the Glossary, despite it being the only place that explains inclination, branches, zones, destreses, and succession mechanics. A player who ignores the "?" button will play the entire first session without understanding the core systems.
**Where it occurs**: `index.html` line 45 (Glossary button); `game.js` — no code ever surfaces a "Consulta el Glossari" prompt to the player.
**Suggested fix**: Add a visible text label "Glossari" next to the "?" button, or add a one-time tooltip/hint at cycle 0: "Primera vegada? Consulta el Glossari (?) per entendre les mecàniques."

---

## NP-16 — Ritual zone description in Glossary says "Pintura Rupestre" but branch tech is hidden
**Severity**: S3
**Description**: The Glossary (game.js line 1257) reads: `Ritual: 'Rituals i cerimònies. Es descobreix amb Pintura Rupestre.'` However, `bt_pintura_rupestre` has `is_hidden: false` in data.js (line 86), meaning it CAN appear to the player — but it requires `espiritualitat ≥ 0.30` AND `sociabilitat ≥ 0.20`, conditions that are not easily reached in a first session without deliberate play. A new player who has never heard of "Pintura Rupestre" has no way to know that this refers to a branch tech (habilitat), not a zone action. The Glossary gives no path to the prerequisite tech chain (`ut_art_simbolic`, cycle 6 → then inclination conditions → then the event discovery `ev_desc_pintura`).
**Where it occurs**: `game.js` line 1257 (Glossary ZONE_INFO for Ritual); `data.js` line 85–90 (`bt_pintura_rupestre`).
**Suggested fix**: Expand the Ritual zone description in the Glossary: "Rituals i cerimònies. Es descobreix en desbloquejar la habilitat Pintura Rupestre (requereix Art i Símbol al cicle 6 i alta espiritualitat)."

---

## NP-17 — "bt_guariment_plantes" and "bt_calendari_natural" are hidden (is_hidden: true) but Glossary shows them without marking them as hidden
**Severity**: S3
**Description**: `bt_guariment_plantes` (data.js line 82) and `bt_calendari_natural` (data.js line 123) both have `is_hidden: true`. The game code never filters on `is_hidden` (confirmed: there is no reference to `is_hidden` in game.js). The Glossary section 7 lists all 13 branch techs including these two, with badges "Elegible — descobrir!" or "Inclinació insuficient" or "Espera: [prereq]" — but no indication that some techs are intentionally hidden from the player in normal play. A player reading the Glossary will see all 13 techs listed and may be confused why certain ones never appear through the discovery action.
**Where it occurs**: `data.js` lines 82, 123 (`is_hidden: true`); `game.js` — no `is_hidden` filtering in `getEligibleBranchTechs()` (line 176) or glossary rendering (line 1231).
**Suggested fix**: Either (a) implement the `is_hidden` filter in `getEligibleBranchTechs()` (filter out `bt.is_hidden` techs), or (b) if hidden techs are discoverable only via specific events, remove `is_hidden` from those entries and add a condition to the event pool filtering instead. For the Glossary, mark hidden techs as "Descoberta especial" until unlocked.

---

## Summary Table

| ID | Title | Severity |
|----|-------|----------|
| NP-01 | No opening instruction or "start here" signal | S2 |
| NP-02 | "Explorar els Voltants" not visually distinguished as critical | S2 |
| NP-03 | Bosc zone discovery notification lacks trigger explanation | S2 |
| NP-04 | "Efecte passiu" log message opaque without context | S3 |
| NP-05 | "Provisions" used for two different resources; "Saber" leftover | S1 |
| NP-06 | Inclination mechanic not explained in main UI | S2 |
| NP-07 | Branch tech unlock has no modal or persistent notification | S2 |
| NP-08 | Succession modal shows raw axis key, not human label | S3 |
| NP-09 | Succession mechanic not explained before it triggers | S2 |
| NP-10 | "Escoltar els Estrangers" does not communicate its function | S3 |
| NP-11 | Glossary zone descriptions: "recolecta" spelling error (×2) | S3 |
| NP-12 | "Mòlts tots igual" — grammatical error in event option | S4 |
| NP-13 | "aguillonat" — invented word in event text | S4 |
| NP-14 | "son" missing accent → "són" in act_recollida_bolets | S4 |
| NP-15 | Glossary button has no label; never surfaced in-game | S3 |
| NP-16 | Ritual zone Glossary description gives no prereq path | S3 |
| NP-17 | is_hidden techs appear in Glossary without hidden marker | S3 |

**S1**: 1 | **S2**: 6 | **S3**: 7 | **S4**: 3
