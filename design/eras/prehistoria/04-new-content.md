> ⚠️ OBSOLET (2026-06-06) — Font de veritat: `prototypes/bloodline/data.js`. Reescriure quan el prototip passi a producció.

# Paleolític — Contingut Nou Aprovat
**Estat**: APROVAT 2026-06-02
**Origen**: era-writer proposta + revisió del dissenyador
**Implementació**: data.js

---

## Passive Effects Aprovats (7 habilitats)

| Habilitat | Passive Effect | Tipus |
|---|---|---|
| bt_punta_llanca | +1 output_min a `act_espiar_ramat` | bonus_action_output |
| bt_buri | +1 output_min a `act_faonar_eines` | bonus_action_output |
| bt_trampes | +1 output_min a `act_parar_trampes` | bonus_action_output |
| bt_guariment_plantes | +8 Salut one-time | grant_health |
| bt_marques_territori | unlock_zone "Bosc" | unlock_zone |
| bt_ornaments | +3 Provisions one-time | grant_material |
| bt_coneixement_plantes | +2 output_max a `act_recollida_bolets` | bonus_action_output (max) |

**No aprovat**: bt_llavor_selectiva (passive effect aplaçat)

---

## Noves Accions Aprovades (4 accions)

### act_revisar_trampes — Revisar les Trampes
- **Habilitat**: `bt_trampes`
- **Zona**: Bosc
- **Cost**: 0 Aliment
- **Output**: 1–4 Aliment + side_effect: health -3
- **Stat**: enginy +0.15
- **Deltes**: impuls -0.01, intel·lecte +0.02, espiritualitat 0, sociabilitat 0
- **Pool**: pool_caca
- **Descripció**: "Fas la ronda matinal per les trampes. Algunes han funcionat. Una t'ha agafat el dit."

### act_preparar_ungüent — Preparar un Ungüent
- **Habilitat**: `bt_guariment_plantes`
- **Zona**: Campament
- **Cost**: 1 Aliment
- **Output**: 6–10 Salut
- **Stat**: enginy +0.15
- **Deltes**: impuls 0, intel·lecte +0.02, espiritualitat +0.02, sociabilitat 0
- **Pool**: pool_ritual
- **Descripció**: "Maceres arrels i fulles fins que la pasta agafa color. Dures hores, però el resultat guareix."

### act_preparar_terreny — Preparar el Terreny
- **Habilitat**: `bt_llavor_selectiva`
- **Zona**: Planes
- **Cost**: 1 Aliment
- **Output**: 2–4 Aliment + side_effect: health -5
- **Stat**: forca +0.15
- **Deltes**: impuls +0.01, intel·lecte +0.02, espiritualitat 0, sociabilitat 0
- **Pool**: pool_recollecta
- **Descripció**: "Neteges una petita parcel·la de pedres i males herbes. El terra nu et sembla prometedor."

### act_negociar_pastures — Negociar les Pastures
- **Habilitat**: `bt_domini_terra`
- **Zona**: Planes
- **Cost**: 1 Aliment
- **Output**: 3–6 Aliment + side_effect: health +3
- **Stat**: vincle +0.15
- **Deltes**: impuls 0, intel·lecte 0, espiritualitat 0, sociabilitat +0.04
- **Pool**: pool_social
- **Descripció**: "Trobes els rastres d'un altre grup a les teves zones. T'aproximes amb gestos oberts. Acabeu repartint el territori."

---

## Notes de Disseny

- **act_revisar_trampes**: Stat `enginy` diferencia-la de `act_parar_trampes` (forca). Zona Bosc ↔ Planes.
- **act_preparar_ungüent**: Místic tècnic (enginy) vs Místic social (vincle de `act_curar_herbes`).
- **act_preparar_terreny**: Cost Salut -5 narrativament important — treballar la terra és diferent de caçar.
- **act_negociar_pastures**: Versió social de `act_control_territori`. Caçador → control; Recol·lector → negociació.
