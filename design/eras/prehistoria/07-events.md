# Paleolític — Events
**Estat**: PARCIAL 2026-06-02 (pool_caca + pool_ritual completats)
**Agents**: era-historian (rigor) + era-writer (veu narrativa)

---

## Pools generats

| Pool | Events existents | Events nous | Total | Estat |
|---|---|---|---|---|
| `pool_caca` | 7 (4 simples + 3 discovery) | 4 narratius amb opcions | 11 | ✅ COMPLET |
| `pool_ritual` | 7 (4 simples + 3 discovery) | 4 narratius amb opcions | 11 | ✅ COMPLET |
| `pool_artesania` | 5 (3 simples + 2 discovery) | — | 5 | ⏳ PENDENT |
| `pool_recollecta` | 6 (3 simples + 3 discovery) | — | 6 | ⏳ PENDENT |
| `pool_social` | 5 (3 simples + 2 discovery) | — | 5 | ⏳ PENDENT |

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

## Pendents

- [ ] `pool_artesania` — 3 events narratius nous (eines trencades amb opcions, intercanvi forçat, aprenentatge accidental)
- [ ] `pool_recollecta` — 3 events narratius nous (planta desconeguda amb opcions, temporal de pluja, descoberta d'un jardí natural)
- [ ] `pool_social` — 3 events narratius nous (negociació fallida, primer bebè del clan, conflicte de lideratge)
