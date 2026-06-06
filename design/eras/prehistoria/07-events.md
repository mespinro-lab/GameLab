> ⚠️ OBSOLET (2026-06-06) — Font de veritat: `prototypes/bloodline/data.js`. Reescriure quan el prototip passi a producció.

# Paleolític — Events
**Estat**: COMPLET 2026-06-02 (tots 5 pools generats)
**Agents**: era-historian (rigor) + era-writer (veu narrativa)

---

## Pools generats

| Pool | Events existents | Events nous | Total | Estat |
|---|---|---|---|---|
| `pool_caca` | 7 (4 simples + 3 discovery) | 4 narratius amb opcions | 11 | ✅ COMPLET |
| `pool_ritual` | 7 (4 simples + 3 discovery) | 4 narratius amb opcions | 11 | ✅ COMPLET |
| `pool_artesania` | 5 (3 simples + 2 discovery) | 4 narratius amb opcions | 9 | ✅ COMPLET |
| `pool_recollecta` | 6 (3 simples + 3 discovery) | 4 narratius amb opcions | 10 | ✅ COMPLET |
| `pool_social` | 5 (3 simples + 2 discovery) | 4 narratius amb opcions | 9 | ✅ COMPLET |

---

## Extensions del motor implementades (2026-06-02)

Per als nous events narratius es van estendre les capacitats del motor (`game.js`):

| Camp nou | Suport | Descripció |
|---|---|---|
| `opt.health_delta` | ✅ | Canvi de Salut en triar una opció |
| `opt.material_delta` | ✅ | Canvi de Provisions en triar una opció |
| `opt.skill_modifier` | ✅ | Efecte condicional depenent de skill (`present_health_delta`, `absent_health_options`) |
| `blocked_if.axis_above` | ✅ | L'event no dispara si un eix d'inclinació supera un valor |

---

## pool_caca — Events nous

### ev_bison_ferit — La bèstia que resisteix
- **Dilema**: rastres de sang d'un bisont ferit, llum declinant. Seguir de nit (risc/reward alt), esperar l'alba (moderat), o abandonar (segur).
- **Eixos implicats**: impuls vs. prudència temporal
- **Ancoratge**: seguiment de bèsties ferides, tàctica documentada en art cantàbric

### ev_grup_estrany — Foc llunyà a la vall
- **Dilema**: un grup desconegut ocupa la zona de caça prevista. Contacte amistós, retirada, o observació.
- **Eixos implicats**: sociabilitat, risc territorial
- **Ancoratge**: superposició de zones de caça entre grups del Paleolític Superior

### ev_mamut_sol — L'ancià separat del ramat
- **Dilema**: mamut vell i sol, atac directe vs. conducció al barranc vs. presa menor.
- **Mecànica especial**: sense `bt_punta_llanca`, l'atac directe fa el doble de mal (`absent_health_delta: -12` vs. `-6`)
- **Ancoratge**: caça col·lectiva de mamuts per conducció a trampes naturals

### ev_trampa_rival — Trampa que no és teva
- **Dilema**: presa en una trampa aliena. Agafar tot (risc futur), deixar-ho (neutre), o compartir la meitat (millor a llarg termini).
- **Eixos implicats**: present vs. capital social futur
- **Ancoratge**: propietat de trampes i zones, conflicte vs. reciprocitat intergrupal

---

## pool_ritual — Events nous

### ev_dol_enterrament — La terra que guareix els morts
- **Dilema**: mort al clan sense protocol fix. Enterrament complet amb ofrenes (cost material, guany salut), simple (neutre), o exposició a l'aire (pèrdua salut).
- **Ancoratge**: enterraments de Qafzeh (~90.000 AEC) i Sungir (~30.000 AEC)

### ev_figura_venus — La dona de pedra
- **Dilema**: crear una figurina d'ivori. Donar-la al grup (salut col·lectiva), guardar-la (salut personal alta), o destruir-la (neutre).
- **Ancoratge**: figurines de Venus (~40.000–11.000 AEC), objectes personals o de grup petit

### ev_transicio_xaman — L'altre que hi ha dins
- **Dilema**: visió iniciàtica. Dejuni sol a la caverna (cost alt, transformació), o acompanyat pel clan (cost menor).
- **Mecànica especial**: `blocked_if axis_above impuls 0.70` — personatge impulsiu no experimenta el procés
- **Ancoratge**: figura xaman-bisó de Les Trois-Frères, transformació identitaria com a ritual social

### ev_planta_amarga — El que et dóna la febre
- **Dilema**: infant malalt, rel desconeguda. Provar-la (efecte condicionat per `bt_guariment_plantes`), continuar amb el que saps (segur), o deixar-ho al vell (bo, costa material).
- **Mecànica especial**: amb `bt_guariment_plantes` → +3 Salut; sense → +1 o -2 aleatori
- **Ancoratge**: transmissió de coneixement botànic intergrupal, enterrament de Shanidar IV

---

## pool_artesania — 4 events nous

| ID | Dilema | Especial |
|---|---|---|
| `ev_fissura_pedra` | Fissura oculta al sílex — continuar, adaptar o descartar | — |
| `ev_aprenent_observa` | Infant observa mentre tallo — ensenyar, fer marxar o donar rebuig | — |
| `ev_fulla_prestada` | Company demana una fulla per caçar — donar, donar de rebuig, negar | — |
| `ev_tecnica_subtil` | Artesà visitant sap el secret del burí — preguntar, experimentar sol, compartir primer | `blocked_if: not_has_skill bt_buri` |

## pool_recollecta — 4 events nous

| ID | Dilema | Especial |
|---|---|---|
| `ev_pluja_tardor` | Tempesta imminent, cistella a la meitat | Opció 3 `requires_skill bt_coneixement_plantes` |
| `ev_ossa_amb_cries` | Ossa al roure que volia collir — retirada, espantar, esperar | — |
| `ev_fong_blanc` | Fong desconegut quan el grup té gana | Opció 3 `requires_skill bt_coneixement_plantes` |
| `ev_arbust_espinos` | Baies darrere d'esbarzer, es faran malbé demà | — |

## pool_social — 4 events nous

| ID | Dilema | Especial |
|---|---|---|
| `ev_fill_orfe` | Dona sola amb fills, caçador mort | `blocked_if resource_below food 3` |
| `ev_rancor_ancians` | Dos ancians enfrontats per la distribució d'una cacera | — |
| `ev_estrany_a_la_vora` | Estranger esgotat amb sílex exòtic | Opció C `requires_children`; `blocked_if resource_below health 3` |
| `ev_criatura_dificil` | Infant que no parla — ritual o esperar | Opcions A/B `requires_children` / `requires_no_children` |

## Extensions del motor afegides (2026-06-02 — 2a iteració)

| Cap nou | Descripció |
|---|---|
| `blocked_if: not_has_skill` | Bloca l'event si el jugador NO té la habilitat indicada |
| `blocked_if: resource_below` | Bloca si food/health < valor |
| `opt.requires_skill` | Opció visible sols si el jugador té la habilitat |
| `opt.requires_children` | Opció visible sols si el personatge té fills |
| `opt.requires_no_children` | Opció visible sols si el personatge NO té fills |
