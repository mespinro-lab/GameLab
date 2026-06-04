# Paleolític — Habilitats (Branch Techs)
**Estat**: IMPORTAT de data.js — 2026-06-02
**Font**: `prototypes/bloodline/data.js` (SKILL_DEFS)
**Total**: 13 habilitats (5 compartides entre branques)

---

## Taula Resum

| ID | Nom | Branca(ques) | Prereq Universal | Compartida | Passive Effect |
|---|---|---|---|---|---|
| `bt_punta_llanca` | Punta de Llança | Caçador | `ut_eines` | no | — |
| `bt_rasclador_fi` | Rasclador Fi | Recol·lector + Artesà | `ut_eines` | **SÍ** | +1 recol·lecta |
| `bt_buri` | Burí i Gravat | Artesà | `ut_eines` | no | — |
| `bt_agulla_os` | Agulla d'Os | Artesà | `ut_vestimenta` | no | +15 Salut |
| `bt_trampes` | Trampes i Llaços | Caçador + Recol·lector | `ut_corda` | **SÍ** | — |
| `bt_guariment_plantes` | Guariment amb Plantes | Místic | `ut_foc` | no | — |
| `bt_pintura_rupestre` | Pintura Rupestre | Místic | `ut_art` | no | unlock Zona Ritual |
| `bt_marques_territori` | Marques de Territori | Caçador | `ut_art` | no | — |
| `bt_ornaments` | Ornaments i Adorn | Recol·lector + Místic | `ut_art` | **SÍ** | — |
| `bt_coneixement_plantes` | Coneixement de Plantes | Recol·lector | `ut_corda` | no | — |
| `bt_calendari_natural` | Calendari Natural | Recol·lector + Místic | `ut_ceramica` | **SÍ** | +2 Provisions |
| `bt_llavor_selectiva` | Llavor Selectiva | Recol·lector | `ut_agricultura` | no | — |
| `bt_domini_terra` | Domini de la Terra | Caçador + Recol·lector | `ut_agricultura` | **SÍ** | +10 Salut |

**Distribució per branca:**
- Caçador: bt_punta_llanca, bt_trampes, bt_marques_territori, bt_domini_terra (4)
- Recol·lector: bt_rasclador_fi, bt_trampes, bt_ornaments, bt_coneixement_plantes, bt_calendari_natural, bt_llavor_selectiva, bt_domini_terra (7)
- Artesà: bt_rasclador_fi, bt_buri, bt_agulla_os (3)
- Místic: bt_guariment_plantes, bt_pintura_rupestre, bt_ornaments, bt_calendari_natural (4)

---

## Fitxes Detallades

### bt_punta_llanca — Punta de Llança
- **Branca**: Caçador
- **Prereq Universal**: `ut_eines` (Gen 2)
- **Condicions**: impuls ≥ 0.25 AND sociabilitat ≤ 0.30
- **InheritanceRate**: 0.20 (difícil de transmetre — habilitat física)
- **Desbloqueja**: `act_caca_llanca`, `act_emboscada_nocturna`
- **Passive effect**: null ⚠️ pendent
- **Nota**: Accés a caça de major risc/reward. Condiciona negativament sociabilitat (caçador solitari).

### bt_rasclador_fi — Rasclador Fi ⭐ PONT
- **Branca**: Recol·lector + Artesà (COMPARTIT)
- **Prereq Universal**: `ut_eines` (Gen 2)
- **Condicions**: impuls ≤ 0.10 OR intel·lecte ≥ 0.20
- **InheritanceRate**: 0.35
- **Desbloqueja**: `act_molda_grans`, `act_faonar_eines`
- **Passive effect**: `+1 output_min a act_recollectar_arrels`
- **Nota**: Pont Recol·lector↔Artesà. Immediat rendiment passiu (millora la recol·lecta base).

### bt_buri — Burí i Gravat
- **Branca**: Artesà
- **Prereq Universal**: `ut_eines` (Gen 2)
- **Condicions**: intel·lecte ≥ 0.25 AND impuls ≤ 0.20
- **InheritanceRate**: 0.30
- **Desbloqueja**: `act_gravar_os`, `act_intercanviar_eines`
- **Passive effect**: null ⚠️ pendent
- **Nota**: Eina d'artesania fina i intercanvi social. Pont potencial amb Místic (gravat ritual).

### bt_agulla_os — Agulla d'Os
- **Branca**: Artesà
- **Prereq Universal**: `ut_vestimenta` (Gen 3)
- **Condicions**: intel·lecte ≥ 0.20 AND impuls ≤ 0.20
- **InheritanceRate**: 0.35
- **Desbloqueja**: `act_cosir_pells`, `act_construir_refugi`
- **Passive effect**: `+15 Salut` (vestimenta de fred)
- **Nota**: Bonus de Salut fort. Gen 3 = impacte de supervivència significant per a llinatges artesans.

### bt_trampes — Trampes i Llaços ⭐ PONT
- **Branca**: Caçador + Recol·lector (COMPARTIT)
- **Prereq Universal**: `ut_corda` (Gen 4)
- **Condicions**: impuls ≥ 0.10 (condició mínima — accessible a quasi tothom)
- **InheritanceRate**: 0.25
- **Desbloqueja**: `act_parar_trampes`
- **Passive effect**: null ⚠️ pendent
- **Nota de disseny**: Condició molt laxa (impuls ≥ 0.10). Qualsevol branca que no sigui pura Místic pot accedir-hi. 1 sola acció desbloq. — podria necessitar més contingut.

### bt_guariment_plantes — Guariment amb Plantes
- **Branca**: Místic
- **Prereq Universal**: `ut_foc` (Gen 1 — accessible molt aviat)
- **Condicions**: espiritualitat ≥ 0.25 AND sociabilitat ≥ 0.20
- **InheritanceRate**: 0.45 (alt — coneixement oral)
- **Desbloqueja**: `act_curar_herbes`
- **Passive effect**: null ⚠️ pendent
- **Nota**: Prereq ut_foc fa que sigui accessible molt aviat per als Místics. 1 sola acció desbloq. — possiblement sparse.

### bt_pintura_rupestre — Pintura Rupestre
- **Branca**: Místic
- **Prereq Universal**: `ut_art` (Gen 2)
- **Condicions**: espiritualitat ≥ 0.30 AND sociabilitat ≥ 0.20
- **InheritanceRate**: 0.40
- **Desbloqueja**: `act_pintar_parets`, `act_narrar_llegendes`
- **Passive effect**: `unlock_zone: "Ritual"` (desbloqueja el Lloc Sagrat)
- **Nota**: La tech clau del Místic. Dona accés a la Zona Ritual exclusiva.

### bt_marques_territori — Marques de Territori
- **Branca**: Caçador
- **Prereq Universal**: `ut_art` (Gen 2)
- **Condicions**: impuls ≥ 0.20 AND intel·lecte ≥ 0.05
- **InheritanceRate**: 0.30
- **Desbloqueja**: `act_marcar_territori`, `act_rastreig_rutes`
- **Passive effect**: null ⚠️ pendent
- **Nota**: Condicions molt accessibles per a qualsevol Caçador. Genera accions de moviment i territori.

### bt_ornaments — Ornaments i Adorn ⭐ PONT
- **Branca**: Recol·lector + Místic (COMPARTIT)
- **Prereq Universal**: `ut_art` (Gen 2)
- **Condicions**: espiritualitat ≥ 0.20 OR sociabilitat ≥ 0.25
- **InheritanceRate**: 0.35
- **Desbloqueja**: `act_ornamentar_se`, `act_consagrar_ornaments`
- **Passive effect**: null ⚠️ pendent
- **Nota**: OR condition → molt accessible. Pont Recol·lector↔Místic amb tint social.

### bt_coneixement_plantes — Coneixement de Plantes
- **Branca**: Recol·lector
- **Prereq Universal**: `ut_corda` (Gen 4)
- **Condicions**: intel·lecte ≤ 0.05 AND impuls ≤ 0.10
- **InheritanceRate**: 0.45
- **Desbloqueja**: `act_recollida_bolets`, `act_assecament_plantes`
- **Passive effect**: null ⚠️ pendent
- **Nota de disseny**: Condicions molt restrictives (`intel·lecte ≤ 0.05`). Recol·lector molt intuïtiu. Gen 4+ fa que sigui un objectiu de llinatge.

### bt_calendari_natural — Calendari Natural ⭐ PONT
- **Branca**: Recol·lector + Místic (COMPARTIT)
- **Prereq Universal**: `ut_ceramica` (Gen 4+)
- **Condicions**: espiritualitat ≥ 0.20 AND intel·lecte ≤ 0.05
- **InheritanceRate**: 0.40
- **Desbloqueja**: `act_observar_cel`, `act_transit_nocturn`
- **Passive effect**: `+2 Provisions`
- **Nota de disseny**: Combinació rara (espiritualitat alta + intel·lecte molt baix). Místic intuïtiu, no analític. Gen 4+ → contenigt de progressió dinàstica.

### bt_llavor_selectiva — Llavor Selectiva
- **Branca**: Recol·lector
- **Prereq Universal**: `ut_agricultura` (Gen 5 — exit connector)
- **Condicions**: intel·lecte ≤ 0.05 AND impuls ≤ 0.10
- **InheritanceRate**: 0.35
- **Desbloqueja**: `act_seleccionar_llavors`
- **Passive effect**: null ⚠️ pendent
- **Nota**: Gen 5. 1 sola acció. Porta cap al Neolític. Podria tenir un passive_effect de transició.

### bt_domini_terra — Domini de la Terra ⭐ PONT
- **Branca**: Caçador + Recol·lector (COMPARTIT)
- **Prereq Universal**: `ut_agricultura` (Gen 5)
- **Condicions**: impuls ≥ 0.10 OR intel·lecte ≤ 0.05
- **InheritanceRate**: 0.25
- **Desbloqueja**: `act_control_territori`
- **Passive effect**: `+10 Salut`
- **Nota**: Prerequisit ut_agricultura = Gen 5. 1 sola acció. Compartit entre branques actives/físiques.

---

## Pendents i Oportunitats de Contingut Nou

### 7 habilitats sense passive_effect ⚠️
`bt_punta_llanca`, `bt_buri`, `bt_trampes`, `bt_guariment_plantes`, `bt_marques_territori`, `bt_ornaments`, `bt_coneixement_plantes`, `bt_llavor_selectiva`

Propostes per als que manquen de forma més flagrant:
- **bt_punta_llanca**: `+1 output_min a act_espiar_ramat` (millora la caça base amb puntes)
- **bt_buri**: `reputation_gain: +1 per cicle` o desbloqueja intercanvi especial
- **bt_guariment_plantes**: `+5 Salut one_time` (el primer guariment)
- **bt_marques_territori**: `unlock_zone: "Bosc"` si Bosc no es descobreix per altra via
- **bt_ornaments**: `+1 Salut per cicle` (benestar social) o `+1 reputation`

### 4 habilitats amb 1 sola acció ⚠️
`bt_trampes`, `bt_guariment_plantes`, `bt_llavor_selectiva`, `bt_domini_terra`

Candidates a afegir una 2a acció:
- **bt_trampes**: `act_millorar_trampes` (upgrade de parar trampes)
- **bt_guariment_plantes**: `act_preparar_ungüent` (Salut preventiva)
- **bt_llavor_selectiva**: `act_preparar_terreny` (proto-agricultura)
- **bt_domini_terra**: `act_marcar_fronteres` (protecció del territori)
