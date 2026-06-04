# Paleolític — Balance Report
**Estat**: APROVAT 2026-06-02
**Iteracions**: 1
**Agent**: economy-designer
**Veredicte**: AJUSTOS MENORS NECESSARIS → aplicats → APROVAT

---

## Resum per Branca

| Branca | Aliment | Pressió Salut | Coherència Eixos | Estat |
|---|---|---|---|---|
| Caçador | SOSTENIBLE (+4.5 a +6.5 net/acció) | RISC MODERAT | Bona (1 trampa) | ✅ |
| Recol·lector | SOSTENIBLE (+3.0 a +4.0 net/acció) | BAIX RISC | Resolt amb ajustos | ✅ |
| Artesà | AJUSTAT (+0.5 a +2.5 depenent del mix) | BAIX RISC | Excel·lent | ✅ |
| Místic | AJUSTAT (-1.0 si cura activament) | BAIX RISC | Excel·lent | ✅ |

---

## Anàlisi per Branca

### Caçador
- **Aliment**: el millor food brut de l'era. `act_caca_llanca` (+6.5 net) i `act_rastreig_rutes` (+3.5 net) ofereixen marge ampli.
- **Salut**: risc moderat-alt si abusa de `act_emboscada_nocturna`. Compensat per `act_negociar_pastures` (+3 Salut) i `act_ritual_foc` (+5 Salut base).
- **Trampa identificada**: `act_negociar_pastures` era la millor eina de recuperació de Salut però empenyia sociabilitat +0.04 per ús → podia treure el jugador de la branca. **Resolt: sociabilitat +0.04 → +0.02.**

### Recol·lector
- **Aliment**: molt estable gràcies a 4 accions de cost 0 (`assecament_plantes`, `ornamentar_se`, `observar_cel`, `revisar_trampes`).
- **Salut**: el millor recuperador del joc (`ornamentar_se` +5 Salut gratuïts, `recollida_bolets` +5 Salut).
- **Problema crític resolt**: 5 accions pròpies empenyien intel·lecte cap al límit superior (≤ 0.10), fent que la branca s'autodestruís per ús normal. **Resolt amb 4 ajustos d'eixos.**

### Artesà
- **Aliment**: ajustat però manejable. L'Artesà genera material en lloc d'Aliment; l'Aliment ve de les accions base.
- **Salut**: cap risc. Zero side_effects negatius de Salut en accions pròpies.
- **Nota de jugabilitat**: L'Artesà és un multiplicador de les altres branques (les seves eines milloren el rendiment compartit). Cal comunicació UX que el jugador entengui el valor del material com a eina de millora, no de supervivència directa.

### Místic
- **Aliment**: ajustat quan cura activament. `act_curar_herbes` costa 2 food sense retorn alimentari; `act_preparar_ungüent` costa 1 food. El Místic necessita 1-2 accions base per cicle quan vol curar.
- **Salut**: el millor guaridor del joc. Pot mantenir qualsevol personatge al màxim de Salut si li dedica accions.
- **Trade-off intencional**: el Místic cura a costa d'Aliment. El difícil équilibre és el disseny de la branca.

---

## Ajustos Aplicats

| Acció | Camp | Valor Anterior | Valor Nou | Raó |
|---|---|---|---|---|
| `act_emboscada_nocturna` | side_effect Salut | -15 | **-10** | Massa punitiva; diferenciació vs `act_caca_llanca` en cost de food (3 vs 2), no en Salut doble |
| `act_negociar_pastures` | sociabilitat delta | +0.04 | **+0.02** | Reduir trampa de sortida de branca Caçador |
| `act_revisar_trampes` | intel·lecte delta | +0.02 | **0** | Revisar trampes és rastreig, no anàlisi — elimina empenta d'eix Recol·lector |
| `act_observar_cel` | intel·lecte delta | +0.01 | **0** (+espiritualitat +0.04) | Observar el cel és contemplació, no ciència; espiritualitat és l'eix Recol·lector-Místic correcte |
| `act_seleccionar_llavors` | intel·lecte delta | +0.02 | **0** | Selecció instintiva, no analítica — elimina empenta d'eix |
| `act_preparar_terreny` | intel·lecte delta | +0.02 | **0** | Treballar la terra és esforç físic; manté impuls +0.01 |
| `act_control_territori` | impuls delta | +0.02 | **+0.01** | Reduir pressió cap al límit ≤ 0.10 d'impuls per al Recol·lector |
| `act_curar_herbes` | output_min Salut | 5 | **6** | Millora el ratio Salut/cost food per fer el trade-off menys punitiu |
| `act_ornamentar_se` | side_effect | ja tenia +5 Salut | sense canvi | Inconsistència era de l'anàlisi; ja estava correcte |
| `act_contemplacio` | output_min food | 0 | **1** | Output mig 0.5 per 1 food inviable; mínim = cost |

**Total ajustos aplicats a data.js**: 9 canvis efectius (1 ja estava correcte).

---

## Branques Especials

### Artesà — Circuit Material
El fluxe economic de l'Artesà és diferent dels altres: produeix Material que usa per comprar noves accions. Això és intencional però crea una sensació de "joc diferent" que pot desorientar a Gen 1. Recomanació: text d'onboarding o tooltip que expliqui que Material = moneda d'aprenentatge.

### Místic — Trade-off aliment↔Salut
La branca de dificultat alta intencionada. El Místic és la branca "de prestigi" del Paleolític: accessible per a jugadors que entenen el sistema, difícil per als que juguen de manera naïf. El déficit d'Aliment quan cura activament és un cost de disseny deliberat.

### Recol·lector — Paradoxa de les Techs Avançades
Les habilitats de Gen 4-5 (bt_calendari_natural, bt_llavor_selectiva) estaven dissenyades per a un Recol·lector "purista" (intel·lecte ≤ 0.10), però les seves accions acabaven empenyent intel·lecte cap amunt. Resolt eliminant les empentes d'intel·lecte d'aquestes accions — ara el Recol·lector de final d'era pot usar les seves millors techs sense sortir de la branca.

---

## Notes Post-Balanç

- **HEALTH_MAX = 100, STARTING_HEALTH = 100**: constants verificades en data.js. L'anàlisi és coherent.
- **`act_ornamentar_se`**: l'acció compartida ja tenia `+5 Salut` per a totes les branques. Cap inconsistència real.
- **Properament**: Fase 7 (Events) — generar contingut narratiu per als pools `pool_caca`, `pool_ritual`, `pool_artesania`, `pool_recollecta`, `pool_social`.
