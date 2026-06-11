# Bloodline — Revisió de Contingut: Era 1 (Paleolític Superior)

> **Tipus de document**: revisió de contingut + proposta de canvis. No és un GDD
> de sistema (no segueix les 8 seccions); complementa `content-plan-era1.md`
> (OBSOLET, 2026-06-06) i pren com a font de veritat `prototypes/bloodline/data.js`.
>
> **Data**: 2026-06-10 · **Autor**: game designer / arqueologia del Paleolític Superior
> **Estat**: PROPOSTA — cap canvi aplicat a `data.js`

---

## 0. Marc de lectura: l'escala temporal implícita del codi

Abans del diagnòstic, una observació estructural que condiciona tota la revisió.

El content-plan treballava amb vides de 12–18 cicles i tecnologies als cicles
2–12. El codi actual treballa amb `ERA_CYCLES = 100`, `LIFE_EXPECTANCY = 20`
i **l'era no es reinicia entre generacions**: l'Era 1 és una cursa dinàstica de
~5 generacions, no una vida. Això invalida la cadència del content-plan i
explica per què el codi va refer el calendari sencer.

Si assumim que l'era cobreix el Paleolític Superior (~50.000 → ~10.000 AEC),
cada cicle equival a **~400 anys**. Sota aquesta lectura, el calendari del
codi mapeja amb una precisió notable al registre arqueològic:

| Tech (data.js) | Cicle | ≈ Data implícita | Fita arqueològica real |
|---|---|---|---|
| `ut_foc` | 10 | ~46.000 AEC | Encesa intencional (kits sílex+pirita); el foc *conservat* és molt anterior |
| `ut_eines` | 16 | ~43.600 AEC | Talla laminar Mode 4, Aurinyacià (~43.000–40.000 AEC) ✓ |
| `ut_art` | 36 | ~35.600 AEC | Chauvet (~36.000 AEC) ✓ — coincidència quasi exacta |
| `ut_vestimenta` | 50 | ~30.000 AEC | Agulles d'ull esteses al Gravetià–Solutrià (~30.000–21.000 AEC) ✓ |
| `ut_corda` | 65 | ~24.000 AEC | Cordes i xarxes d'Ohalo II (~23.000 AEC) ✓; fragment d'Abri du Maras és anterior |
| `ut_ceramica` | 80 | ~18.000 AEC | Vasos de Xianrendong (~20.000–19.000 AEC) ✓ |
| `ut_agricultura` | 92 | ~13.200 AEC | Natufià / proto-conreu (~14.500–11.500 AEC) ✓ |

**Recomanació transversal**: canonitzar "1 cicle ≈ 400 anys" com a regla de
disseny de l'Era 1. Dona un criteri objectiu per situar qualsevol contingut
futur (esdeveniments climàtics, tecnologies, megafauna) i resol per si sola
la majoria d'acusacions d'anacronisme — vegeu §4.

---

## 1. Diagnòstic — Divergències codi vs. disseny

### 1.1 Taula comparativa de tecnologies universals

| Content-plan (5) | Cicle pla | data.js (7) | Cicle codi | Veredicte |
|---|---|---|---|---|
| `ut_talla_laminar` — Talla en Làmines | 2 | `ut_eines` — Les Eines | 16 | **Renomenada i generalitzada**. Es perd la precisió "laminar" (Mode 4), però el nom curt és més llegible. |
| `ut_vestimenta` — Cosit i Vestimenta | 4 | `ut_vestimenta` — La Vestimenta | 50 | **Conservada**, recalendaritzada. El cicle 50 (~30.000 AEC) és fins i tot més rigorós que el cicle 4 del pla. |
| `ut_art_simbolic` — Art i Símbol | 6 | `ut_art` — L'Art | 36 | **Renomenada**. Cicle 36 ≈ Chauvet. Correcta. |
| `ut_recollida_sistematica` — Recol·lecció Sistemàtica | 9 | — | — | **Desapareguda**. Les seves branch techs (coneixement_plantes, calendari_natural) s'han redistribuït sota `ut_corda` i `ut_ceramica`. |
| `ut_conreu_incipient` — Conreu Incipient | 12 | `ut_agricultura` — L'Agricultura | 92 | **Renomenada, perdent rigor**. "Agricultura" implica camps establerts (Neolític); el contingut real del codi ("primera sembra intencional i selecció de llavors") és exactament "conreu incipient". |
| — | — | `ut_foc` — El Foc | 10 | **Nova**. El pla l'havia descartat explícitament ("el foc ja era universal el 50.000 AEC"). El codi el reintrodueix, però amb una descripció que el salva: "fabricació **intencional** del foc amb sílex i pirita" — el domini de la *ignició*, no del foc. |
| — | — | `ut_corda` — La Corda | 65 | **Nova**. Excel·lent addició: la tecnologia de fibres és un dels grans oblidats de la divulgació i està ben documentada (Ohalo II, Lascaux, Abri du Maras). |
| — | — | `ut_ceramica` — La Ceràmica | 80 | **Nova**. Defensable (vegeu §4), però la descripció actual ("emmagatzematge, cocció avançada") sona neolítica i **cap de les seves 4 habilitats té res a veure amb ceràmica**. |

### 1.2 Coherència interna de les 7 del codi

**Veredicte global: la seqüència és arqueològicament coherent** sota l'escala
de 400 anys/cicle (§0). No hi ha salts temporals greus:

- `ut_ceramica` + `ut_agricultura` coexistint amb `ut_foc` al "mateix
  Paleolític" **no és un anacronisme**: estan separades per 70–80 cicles
  (~30.000 anys de joc). La ceràmica de Xianrendong (~20.000–19.000 AEC) i el
  proto-conreu natufià són genuïnament pre-neolítics. El que sí cal és que
  noms i descripcions reflecteixin la versió *incipient* d'aquestes
  tecnologies, no la madura (§5).
- L'únic punt cronològicament tens és **`ut_foc` abans de `ut_eines`**:
  l'evidència directa de kits d'encesa (sílex + pirita) és tardana
  (~30.000 AEC, p.ex. Laussel). Es tolera com a llicència: com a primer
  "moment àlgid" de l'era als 10 cicles funciona molt bé mecànicament
  (`HEALTH_FIRE_BONUS`), i la distinció conservar/encendre és real.
- La **pèrdua de `ut_recollida_sistematica`** és l'única regressió de
  contingut: era el pont conceptual entre recol·lecció oportunista i conreu.
  La seva funció ha quedat òrfena — vegeu el forat del Recol·lector a §2.

### 1.3 Altres divergències estructurals rellevants

| Àmbit | Content-plan | data.js | Impacte |
|---|---|---|---|
| Branch techs | 13 (5 ponts, 8 exclusives) | **26 habilitats** | El codi ha doblat el contingut; els ponts ja no estan declarats, s'infereixen de condicions OR/AND. |
| Zones | 4 (`zone_ritual` inclosa) | 4, però **Zona Ritual eliminada** (playtest 2026-06-06) i substituïda per `Llar` | Les accions rituals viuen ara al Campament — concentració excessiva (§3.6). |
| Indicadors | health/happiness/security/social | Només `health` (+ `food` com a necessitat) | Benestar/Protecció/Vincles del pla no existeixen; moltes opcions d'events del pla són inaplicables. |
| Recursos | Provisions (+Pells pendent) | `material`, `reputacio`, `pedra`, `eina` | El codi té una economia més rica que el pla. "Pells" descartat de facto. |
| Branques | Llindars 0.25–0.30 | Llindars ×0.73 (0.18–0.22) | Rebalanç de playtest. El solapament Recol·lector/Artesà s'ha agreujat (§2.2). |
| `bt_guariment_plantes` | "Guariment amb Plantes", hidden, sota vestimenta | name **"Rituals de la Flama"**, sota `ut_foc` | **Id i nom divergents** — l'id parla de plantes, el nom de flames. Confús per a mantenibilitat (§6). |

---

## 2. Diagnòstic — Distribució de branques

Les condicions de les 4 branques (`BRANCHES`, data.js:1554):

| Branca | Condicions (AND) |
|---|---|
| Caçador | `impuls ≥ 0.18` ∧ `sociabilitat ≤ 0.40` |
| Recol·lector | `impuls ≤ 0.10` ∧ `intel·lecte ≥ 0.15` |
| Artesà | `intel·lecte ≥ 0.18` ∧ `impuls ≤ 0.20` |
| Místic | `espiritualitat ≥ 0.22` ∧ `sociabilitat ≥ 0.19` |

### 2.1 Taula branca × tecnologia universal × habilitats

Assignació inferida de les `inclination_conditions` de cada SKILL_DEF
(✦ = accessible a més d'una branca; — = cap habilitat accessible):

| UT | Caçador | Recol·lector | Artesà | Místic |
|---|---|---|---|---|
| `ut_foc` | guardia_flama ✦ | cuina_conservacio ✦, guardia_flama ✦ | cuina_conservacio ✦, guardia_flama ✦ | guariment_plantes, guardia_flama ✦ |
| `ut_eines` | **punta_llanca** | rasclador_fi ✦ | rasclador_fi ✦, **buri** | **eines_cerimonials** |
| `ut_art` | marques_territori ✦ | — | marques_territori ✦ | **pintura_rupestre**, ornaments ✦, narracio_oral ✦ |
| `ut_vestimenta` | adobament_pells ✦ | — | **agulla_os**, adobament_pells ✦ | pigments_tintures ✦ |
| `ut_corda` | trampes ✦, **arc_fletxes** | coneixement_plantes ✦ | coneixement_plantes ✦ | **nusos_sagrats** |
| `ut_ceramica` | domini_terra ✦ | llavor_selectiva ✦ | llavor_selectiva ✦ | **calendari_natural**, intercanvi_troc ✦, domini_terra ✦ |
| `ut_agricultura` | domesticacio ✦, construccio_refugis ✦ | sembra_collita ✦ | sembra_collita ✦, construccio_refugis ✦ | **ritus_sembra** |
| **Total (excl. + compart.)** | **2 + 7** | **0 + 7** | **2 + 8** | **6 + 6** |

(Negreta = exclusiva de la branca; les compartides es compten a cada branca on les condicions són assolibles per un build arquetípic.)

### 2.2 Troballes

**T2-1 (CRÍTIC) — El Recol·lector té zero habilitats exclusives.** Tota
habilitat accessible per a un build recol·lector arquetípic (imp ~0.00,
int ~0.25) és també accessible per a un build artesà (imp ~0.05, int ~0.30):
`coneixement_plantes` (int≥0.10 ∧ imp≤0.20), `llavor_selectiva` (idèntiques!),
`cuina_conservacio`, `rasclador_fi`, `sembra_collita` — totes les satisfà
l'Artesà. La causa arrel és que les condicions de branca se solapen quasi
totalment: Recol·lector = `imp≤0.10 ∧ int≥0.15`; Artesà = `int≥0.18 ∧
imp≤0.20`. Un personatge amb `imp 0.05, int 0.25` **és les dues branques
alhora, sempre**. Les branques es diferencien per *accions* (food vs material),
no per espai d'inclinació — el jugador no pot percebre-les com a camins
diferents a nivell d'habilitats.

**T2-2 (ALT) — El Místic està sobre-representat: 6 exclusives de 26 habilitats**
(pintura, guariment, eines_cerimonials, nusos_sagrats, calendari, ritus_sembra)
més 6 compartides socials. Cap altra branca passa de 2 exclusives. Conseqüència
directa: el glut d'accions de reputació (§3.5).

**T2-3 (ALT) — `ut_art` i `ut_vestimenta` ignoren el Recol·lector completament.**
Cap habilitat d'aquests dos techs és assolible per un build `imp≤0.10` que no
tingui també `int≥0.18` (i llavors és Artesà) o `esp/soc` alts (i llavors és
Místic). Entre els cicles 36 i 64 el Recol·lector pur no rep res. És
exactament el forat que deixà la mort de `ut_recollida_sistematica` (§1.2).

**T2-4 (MITJÀ) — `ut_ceramica` no té cap habilitat artesana.** La ironia
arqueològica màxima: la tecnologia *artesanal* per excel·lència del final del
Paleolític deriva en calendaris, llavors, territori i troc — i cap terrissa.
L'Artesà hi accedeix només via condicions solapades amb el Recol·lector.

**T2-5 (MITJÀ) — Dues habilitats quasi-universals dilueixen la identitat de
branca.** `bt_guardia_flama` (OR imp/int/soc ≥ 0.15) i `bt_domini_terra`
(OR imp≥0.10, soc≥0.10) les desbloqueja pràcticament qualsevol build amb 8–10
accions fetes. Si la intenció és "tech per a tothom", millor declarar-ho
(condicions buides o llindar simbòlic); si no, cal estrènyer (§6).

**T2-6 (BAIX) — Condicions duplicades exactes**: `bt_coneixement_plantes` i
`bt_llavor_selectiva` comparteixen `int≥0.10 ∧ imp≤0.20` literalment. Dues
habilitats que sempre arriben juntes se senten com una de sola partida en dos.

**T2-7 (BAIX) — Encaixos dubtosos de condició vs. fantasia**:
- `bt_buri` (Burí i Gravat) és accessible al build recol·lector arquetípic
  (int 0.25 ∧ imp 0.05) — un gravador d'ivori amb fantasia 100% artesana.
  Símptoma de T2-1 més que problema propi.
- `bt_calendari_natural` (esp≥0.20 ∧ soc≥0.10) és místic pur, però el
  content-plan el concebia com a pont Recol·lector–Místic (observació
  sistemàtica de cicles = coneixement, no només espiritualitat). La condició
  actual contradiu la fantasia "comptar llunes en un os".

---

## 3. Diagnòstic — Accions

### 3.1 Inventari per branca (resum)

Classificació de les ~50 accions per branca funcional, output principal i risc.
Cost = `execute_cost` en Aliment; risc = side_effects negatius.

**Caçador** (risc alt, food):

| Acció | Zona | Output | Cost | Risc |
|---|---|---|---|---|
| act_espiar_ramat (base) | Planes | food 3–8 + mat 2–4 | 1 | −5 ❤️ |
| act_caca_llanca | Planes | food 5–12 | 2 + 1🔧 | −7 ❤️ |
| act_emboscada_nocturna | Planes | food 8–16 | 2 | **−20 ❤️** |
| act_caçar_amb_arc | Planes | food 4–9 | 2 | −4 ❤️ |
| act_parar/revisar_trampes | Planes/Bosc | food 2–6 / 1–4 | 1 / 0 | 0 / −3 ❤️ |
| act_rastreig_rutes | Bosc | food 3–6 | 1 | — |
| act_marcar_territori | Planes | rep 1–3 | 1 | −3 ❤️ |
| act_torxa_escolta | Campament | rep 1–2 | 1 | −3 ❤️ |
| act_amansar/pasturar | Planes | food 2–5 / 3–7 | 2 / 1 | −2 ❤️ / — |
| act_control_territori | Planes | food 3–7 | 1 | −5 ❤️ |

**Recol·lector** (risc baix, food):

| Acció | Zona | Output | Cost | Risc |
|---|---|---|---|---|
| act_recollectar_arrels (base) | Planes | food 1–3 + mat 2–3 | 1 | — |
| act_molda_grans | Campament | food 3–7 | 1 | — |
| act_recollida_bolets | Bosc | food 2–5, +5 ❤️ | 1 | — |
| act_assecament_plantes | Campament | food 2–4 | **0** | — |
| act_cocinar_arrels | Campament | food 3–6 | **0** | — |
| act_ahumar_carn | Campament | food 4–8 | 1 | — |
| act_seleccionar_llavors | Campament | food 3–6 | 1 | — |
| act_sembrar/collita | Planes | food 3–7 / 5–9 | 1 | — |
| act_preparar_terreny | Planes | food 2–4 | 1 | −5 ❤️ |
| act_recollecta_avancada | Planes | food 4–8 | 1 | — |

**Artesà** (material + health):

| Acció | Zona | Output | Cost | Risc |
|---|---|---|---|---|
| act_tallar_pedra (base) | Campament | mat 2–3 | 0 | — |
| act_faonar_eines | Campament | mat 2–4 | 0 | — |
| act_gravar_os | Campament | mat 2–3 | 0 | — |
| act_preparar_cuiro | Campament | mat 2–4 | 0 | — |
| act_cosir_pells | Campament | ❤️ 3–6 + mat 1–2 | **0** | — |
| act_construir_refugi / roba_hivern | Campament | ❤️ 4–8 | 1 | — |
| act_intercanviar_eines | Planes | food 2–4 + mat | 1 | — |
| act_practicar_tir / tenyir_pells / tela_sagrada | Camp./Planes | mat 1–3 | 0–1 | — |
| act_edificar_cabana | Campament | ❤️ 5–10 | 2 | — |

**Místic** (reputació + health; **cap font de food pròpia**):

| Acció | Zona | Output | Cost | Risc |
|---|---|---|---|---|
| act_ritual_foc (base) | Campament | rep 1–2, +5 ❤️ | 1 | — |
| act_contemplacio (base) | Campament | ❤️ 3–6 | 1 | — |
| act_curar_herbes / preparar_ungüent | Campament | ❤️ 8–14 / 6–10 | 2 / 1 | — |
| act_pintar_parets | Bosc | rep 1–3, +5 ❤️ | 1 | — |
| act_narrar_llegendes / explicar_orígens / cants_grup | Campament | rep 1–3, +3/+5 ❤️ | 0–1 | — |
| act_ornamentar_se / decorar_cos / consagrar_ornaments | Campament | rep 1–4, +3/+5 ❤️ | 0–1 | — |
| act_ofrena_eines / cerimonia_eines / ritual_nusos | Campament | rep 1–4, +3/+5 ❤️ | 1 | — |
| act_observar_cel / transit_nocturn | Planes/Bosc | ❤️ 2–4 / rep 2–4 | 0 / 1 | — / −5 ❤️ |
| act_ofrena_terra / danses_fertilitat | Campament | rep 1–4, +5 ❤️ | 1 | — / −1 🌾 |
| act_fira_intercanvi / ceramica_regalada | Planes | mat 3–6 / rep 2–4 | 1 | — / −1 🪨 |

### 3.2 (a) Redundàncies dins de branca

**T3-1 (ALT) — Monocultiu de food del Recol·lector**: 10 accions amb el mateix
perfil (food 2–9, cost 0–1, risc nul, deltes int ±0.03). `molda_grans`,
`cocinar_arrels`, `seleccionar_llavors`, `sembrar_llavors` i
`recollecta_avancada` són mecànicament intercanviables — el jugador tria per
nom, no per estratègia. A més, `cocinar_arrels` (cost 0, 3–6) **domina
estrictament** `molda_grans` (cost 1, 3–7, valor esperat net inferior) i
`assecament_plantes` (cost 0, 2–4).

**T3-2 (ALT) — Glut de reputació del Místic**: 14 accions amb output
`reputacio 1–4` + `health +3/+5`, deltes `esp +0.04/.05, soc +0.03/.05`
quasi idèntics. Amb `REPUTACIO_PER_CHAR_CAP = 20`, després de ~8 accions de
reputació el jugador místic no obté res nou de cap d'elles excepte el +❤️.
La branca més rica en habilitats (T2-2) és la més pobra en *decisions*.

**T3-3 (MITJÀ) — Productors de material gratuïts duplicats**: `tallar_pedra`
(base, 2–3), `faonar_eines` (2–4), `gravar_os` (2–3), `preparar_cuiro` (2–4),
`practicar_tir` (1–2) — tots cost 0, sense risc. `faonar_eines` domina o
empata amb la resta; les altres aporten només el delta d'inclinació.

### 3.3 (b) Deltes d'inclinació incoherents amb la narrativa

**T3-4 (CRÍTIC) — Les accions del Recol·lector erosionen la seva pròpia
branca.** La branca exigeix `int·lecte ≥ 0.15`, però:

| Acció | Delta int actual | Coherència |
|---|---|---|
| act_molda_grans | **−0.02** | Moldre amb rasclador fi = tècnica metòdica. Hauria de pujar. |
| act_recollida_bolets | **−0.02** | Distingir bolets comestibles és coneixement expert pur. |
| act_assecament_plantes | **−0.02** | Conservació planificada = previsió analítica. |
| act_seleccionar_llavors | **0** | L'acció *més analítica del joc* (selecció artificial!) no empeny cap eix. |

Un jugador que juga el fantasma del Recol·lector amb les seves pròpies accions
**surt de la branca**: bucle d'auto-extinció. Sospito que és part del que els
playtests han llegit com a "dead zones". Cal invertir el signe (§7).

**T3-5 (BAIX)**: `act_explorar_voltants` amb `int −0.02` és discutible
(explorar sistemàticament també és cognició) però acceptable com a
contrapunt impulsiu. `act_cercar_parella`/`act_tenir_fills` amb deltes zero
és correcte per disseny (neutralitat reproductiva).

### 3.4 (c) Risc desproporcionat al reward

**T3-6 (ALT) — `act_emboscada_nocturna`: −20 ❤️ amb `HEALTH_MAX = 40`** és el
50% de la salut màxima per un guany esperat de 12 food (= 6 cicles d'upkeep).
Comparada amb `act_collita_sistematica` (7 food esperats, risc zero, cost 1),
l'emboscada és estrictament pitjor passada la primera meitat de la vida, quan
la corba de decaïment fa que −20 sigui letal. El "molt perillós però molt
rendible" de la descripció només compleix la primera meitat. Proposta: −14 (§7).

**T3-7 (BAIX)**: `act_caca_llanca` consumeix `eina` (−1 per ús) a més de
−7 ❤️ i cost 2: el cost real (eina = pedra + acció + risc de trencament) està
ben calibrat respecte a food 5–12. Correcte, és el patró a imitar.

### 3.5 (d) Bucles degenerats

Amb una acció per cicle, "degenerat" significa *dominància per slot*, no spam:

**T3-8 (ALT) — `act_cocinar_arrels`**: cost 0, food 3–6, risc zero, cap
requisit. Resol l'upkeep (2/cicle) per sempre amb marge. Per a qualsevol build
amb int≥0.15 (que la desbloqueja via `bt_cuina_conservacio`), és l'acció de
manteniment òptima incondicional — mai hi ha raó per usar `molda_grans`,
`assecament_plantes` ni `recollectar_arrels`. La supervivència deixa de ser
una pregunta.

**T3-9 (MITJÀ) — `act_cosir_pells`**: cost 0, ❤️ 3–6 **i** mat 1–2, risc zero.
Doble output gratuït; domina `act_construir_refugi` (cost 1, ❤️ 4–8, sense
material). Mitigat parcialment pel cap de salut decreixent amb l'edat, però
segueix sent dominant per a l'Artesà.

**T3-10 (MITJÀ) — `act_cants_grup` / `act_ornamentar_se`**: cost 0, rep + ❤️+5.
Un cop assolit el cap de reputació, segueixen sent "+5 ❤️ gratuïts" — anul·len
la pressió d'envelliment fins que el cap de salut cau per sota de ~30. El
Místic té 3 vàlvules de salut gratuïtes (amb `alimentar_foc`).

**Patró general**: tota acció amb `execute_cost: 0` + output positiu + risc
zero és candidata a dominància. Regla proposada (§7): **cost 0 exigeix o bé un
requisit de recurs, o bé un side-effect negatiu, o bé output només de
material** (el recurs que es gasta en compres i per tant té embornal natural).

### 3.6 (e) Perfil d'outputs per branca

| Branca | food | material | reputacio | health |
|---|---|---|---|---|
| Caçador | **dominant** (alt risc) | mitjà (espiar) | baix (marcar, torxa) | **sempre negatiu** — cap font pròpia |
| Recol·lector | **dominant** (risc zero) | residual | nul | baix (bolets +5) |
| Artesà | baix (intercanviar) | **dominant** | nul | mitjà (cosir, refugi, cabana) |
| Místic | **nul** | baix (fira, tela) | **dominant** | mitjà-alt (curar, +5 passius) |

- **Caçador sense vàlvula de salut**: totes les seves accions costen ❤️; per
  recuperar-se ha d'usar `contemplacio` (esp +0.08! — el treu de branca) o
  `ritual_foc`. El commit `cd41e9c` va corregir dead zones, però la recuperació
  segueix forçant deltes contra-branca. Una font de food/recuperació de baix
  risc coherent amb la fantasia (pesca, §7) ho resol sense regalar res.
- **Místic sense food**: depèn de les accions base (que el treuen de branca) o
  de `negociar_pastures` (via `bt_domini_terra`, encaix narratiu fluix).
  Tensió interessant — un místic ha de "cobrar" en menjar la seva influència —
  però actualment no hi ha cap acció que expressi aquest intercanvi
  explícitament; la `fira_intercanvi` dona material, no food.
- **Zona Campament saturada**: ~30 de 50 accions viuen al Campament (herència
  de l'eliminació de la Zona Ritual). El Bosc, que costa de descobrir, només
  té 5 accions. Les noves accions proposades (§7) s'assignen preferentment a
  Bosc/Planes.

### 3.7 Detalls de text i nomenclatura

- `act_ahumar_carn`: **castellanisme** — en català és "afumar". Renomenar (§7).
- `act_roba_hivern`, descripció: "com abir" → "com abans" (typo).
- `act_molda_grans`: id diu "molda", nom diu "Mòlta". Menor, no tocar l'id
  (estalvi de migracions), però anotat.
- Ids amb caràcters no ASCII (`act_caçar_amb_arc`, `act_explicar_orígens`,
  `act_reforçar_palissada`, `act_preparar_ungüent`): funcionen en JS, però són
  fràgils si mai migren a claus de fitxer/localització. No tocar ara; evitar
  en contingut nou.

---

## 4. Diagnòstic — Coherència arqueològica

### 4.1 Tecnologies universals, una a una

| Tech | Veredicte | Anàlisi |
|---|---|---|
| `ut_foc` | ✅ amb matís | El foc *conservat* és universal des de fa >400.000 anys; el descobriment paleolític real és la **ignició a voluntat** (percussió sílex–pirita; ús de MnO₂ pels neandertals com a accelerant). La descripció del codi ja diu "fabricació intencional" — correcte. Proposta menor: que nom/descripció subratllin "fer néixer el foc" vs "tenir foc" (§5). |
| `ut_eines` | ✅ | Talla laminar Mode 4: el marcador definitori del Paleolític Superior. La descripció ("fulloles de precisió, formes especialitzades") és exacta. |
| `ut_art` | ✅ | Chauvet ~36.000 AEC, Venus de Hohle Fels i flautes d'os ~40.000 AEC, Altamira/Lascaux més tardanes. La descripció ja menciona "flautes d'os" — **però cap habilitat ni acció del joc les implementa** (oportunitat, §6). |
| `ut_vestimenta` | ✅ | Agulles d'ull: Denisova ~45.000 AEC (aïllada), esteses al Gravetià-Solutrià. El cicle 50 (~30.000 AEC) captura la roba cosida *ajustada* que va permetre l'expansió àrtica. |
| `ut_corda` | ✅ | Fragment de cordeta de l'Abri du Maras (neandertal, ~45.000 AEC), xarxes i llinyes d'Ohalo II (~23.000 AEC), corda de Lascaux. Posar-hi l'arc a sota és defensable: puntes de Grotte Mandrin (~54.000 AEC, debatut) i evidència sòlida des del final del Paleolític. "Balses" a la descripció: la colonització d'Austràlia (~50.000 AEC) implica navegació — correcte encara que sorprenent. |
| `ut_ceramica` | ⚠️ reorientar | Defensable cronològicament (vasos de Xianrendong ~20.000–19.000 AEC; figurines de terracota de Dolní Věstonice ~29.000–25.000 AEC, **la ceràmica neix com a art**). Però la descripció actual ("emmagatzematge, cocció avançada, conservació de provisions") descriu la ceràmica neolítica utilitària, i les habilitats derivades no tenen res de ceràmic (T2-4). Reescriure descripció + afegir `bt_terrissa` (§5, §6). |
| `ut_agricultura` | ⚠️ renomenar | El contingut (sembra intencional, selecció de llavors) és correcte per al Natufià (~14.500–11.500 AEC), i Ohalo II documenta proto-cultiu fins i tot ~23.000 AEC. El **nom** "L'Agricultura" promet més del que és i trepitja el nom natural de l'Era 2 (Neolític). El content-plan tenia raó aquí: "Conreu Incipient" / "El Primer Conreu" és el terme rigorós (§5). |

### 4.2 Habilitats: anacronismes i denominacions

| Habilitat / acció | Problema | Gravetat |
|---|---|---|
| `act_pasturar_bestiar` ("Pasturar el Bestiar") | El pasturatge de ramats és Neolític (~10.500 AEC, cabra/ovella a Zagros). Al Paleolític només el **gos** (~15.000 AEC) i potser el ren en gestió laxa. "Bestiar" és la paraula equivocada. | MITJÀ — reescriptura de nom/descripció, no de mecànica (§7) |
| `act_reforçar_palissada` | Palissades defensives = poblats sedentaris neolítics. El campament paleolític es protegia amb foc, gossos i ubicació. | BAIX — reanomenar ("Barrera d'Espines": les *zeriba* de matolls espinosos són plausibles i documentades etnogràficament) |
| `bt_domesticacio_animals` | Acceptable si s'entén com el gos i l'amansiment puntual (l'acció `amansar_animal` ho fa bé); "Domesticació d'Animals" com a títol genèric sona neolític. | BAIX |
| `bt_guariment_plantes` name="Rituals de la Flama" | No és anacronisme sinó incoherència id/nom (§1.3). La medicina herbàcia està ben recolzada: Shanidar IV (~60.000 AEC, pol·len de plantes medicinals, interpretació debatuda però icònica), càlcul dental d'El Sidrón amb camamilla i aquil·lea. | MITJÀ |
| `act_edificar_cabana` | ✅ correcte — cabanes d'ossos de mamut de Mejíritx (~15.000 AEC), estructures de Terra Amata molt anteriors. | — |
| `bt_calendari_natural` sota `ut_ceramica` | L'os de Lebombo (~42.000 AEC) i la placa de Blanchard (~30.000 AEC) són **ossos gravats** = notació sobre art mobiliar. Hauria de penjar de `ut_art`, no de la ceràmica. | MITJÀ (§6) |

### 4.3 El que el codi ja fa bé (i cal preservar)

Els events escrits posteriorment al content-plan tenen un rigor notable:

- `ev_dol_enterrament` — enterrament amb **ocre vermell i cargol marí**:
  exactament el patró funerari del Paleolític Superior (Sungir, Arene Candide).
- `ev_figura_venus` — talla d'una figurina d'ivori amb ambigüitat
  agència/objecte: to perfecte.
- `ev_transicio_xaman` — iniciació amb aïllament i dejuni, bloquejada per
  `impuls > 0.70`: bona lectura del xamanisme com a vocació contemplativa.
- `ev_mamut_sol` / `ev_bison_ferit` — caça d'individus vells o ferits, no
  d'exemplars sans: és exactament com operava la caça real de megafauna.
- `ev_planta_amarga`, `ev_fong_blanc` — incertesa farmacològica amb
  `skill_modifier`: modelitza el coneixement com a reductor de risc. Excel·lent.

### 4.4 Pràctiques documentades absents (oportunitats)

Ordenades per encaix mecànic amb els forats detectats a §2–§3:

| Pràctica | Evidència | Forat que cobreix |
|---|---|---|
| **Adhesius i emmanegament** (quitrà de bedoll, ocre+resina) | Campitello/Königsaue ~80.000 AEC (neandertal!), Sibudu | Artesà sense habilitat de foc (T2-4 invers); tecnologia composta = fantasia artesana pura |
| **Pesca** (arpons, xarxes, llinyes) | Arpons magdalenians ~17.000 AEC; xarxes/peix d'Ohalo II ~23.000 AEC | Food de baix risc per al Caçador (§3.6); contingut per al Bosc |
| **Terrissa** (figurines + primers vasos) | Dolní Věstonice, Xianrendong | `ut_ceramica` sense habilitat ceràmica (T2-4) |
| **Música** (flautes d'os i ivori) | Hohle Fels, Geissenklösterle ~40.000 AEC | Pont Artesà–Místic inexistent; ja anunciada a la descripció de `ut_art` |
| Intercanvi a llarga distància (closques marines a >300 km, obsidiana) | Generalitzat | Parcialment cobert per `ev_estrany_a_la_vora`, `fira_intercanvi` — ampliar a futur (§9) |
| Llànties de greix | Lascaux (~130 llànties trobades) | Futur: zona "Cova Profunda" (§9) |
| Enterraments d'estatus (Sungir: ~10.000 denes d'ivori) | Sungir ~32.000 AEC | Futur: cerimònies funeràries dinàstiques (§9) |

---

## 5. Proposta — Tecnologies universals

**Veredicte: mantenir les 7 tecnologies, els 7 ids i els 7 cicles.** La
seqüència és arqueològicament sòlida sota l'escala 400 anys/cicle (§0) i el
calendari està calibrat pel playtest (no tocar `cycle` sense necessitat).
Només ajustos de presentació:

### 5.1 Canvis de `name` / `description` (sense tocar ids ni cycles)

```js
// ut_foc — èmfasi en ignició, no en el foc en si (el clan ja en tenia)
{
  id: "ut_foc", name: "El Foc", icon: "🔥", cycle: 10,
  description: "El clan sempre ha conegut el foc; ara sap fer-lo néixer. Sílex i pirita arrenquen espurnes a voluntat: cuina, calor, llum i protecció ja no depenen de cap brasa heretada.",
  effect: { healthPctBonus: HEALTH_FIRE_BONUS, nextGenHealthMax: HEALTH_POST_FIRE, desc: `+${Math.round(HEALTH_FIRE_BONUS*100)}% Salut immediata · Gens posteriors inicien amb ${HEALTH_POST_FIRE}❤️` }
},

// ut_ceramica — la ceràmica neix com a art (figurines), els vasos venen després
{
  id: "ut_ceramica", name: "La Ceràmica", icon: "🏺", cycle: 80,
  description: "L'argila passada pel foc es torna pedra. Primer figures que expliquen el món; després, els primers vasos que guarden el que abans es perdia.",
  effect: null
},

// ut_agricultura — display name corregit; l'id es manté per compatibilitat de saves
{
  id: "ut_agricultura", name: "El Primer Conreu", icon: "🌾", cycle: 92,
  description: "Llavors triades i sembrades a posta. Encara no hi ha camps — hi ha un gest nou que canviarà totes les eres que vindran.",
  effect: null
}
```

Justificació: §4.1. Cap canvi a `ut_eines`, `ut_art`, `ut_vestimenta`,
`ut_corda` (descripcions ja correctes).

### 5.2 Regla canònica nova

Afegir com a comentari de capçalera a `UNIVERSAL_TECHS`:

```js
// Escala temporal de l'Era 1: 1 cicle ≈ 400 anys (cicle c ≈ 50.000 − 400·c AEC).
// Tot contingut nou (techs, habilitats, events) s'ha de poder situar en aquesta línia.
```

### 5.3 Impacte en branques

Cap canvi de cycle ⇒ cap impacte en pacing. El reequilibri de branques es fa
a nivell d'habilitats (§6): `ut_foc` guanya una habilitat artesana,
`ut_eines` una de pont Artesà–Místic, `ut_corda` una de pont
Caçador–Recol·lector, `ut_ceramica` una d'artesana, i `bt_calendari_natural`
es trasllada de `ut_ceramica` a `ut_art`.

---

## 6. Proposta — Habilitats noves o modificades

### 6.1 Noves (4)

**N1 — `bt_adhesius` (Artesà, sota `ut_foc`)** — cobreix: Artesà sense
habilitat de foc pròpia (taula §2.1) + gap arqueològic dels adhesius (§4.4).
El quitrà de bedoll *requereix* foc controlat: l'encaix tech→habilitat és
perfecte.

```js
{
  id: "bt_adhesius", name: "Adhesius i Emmanegament",
  inheritanceRate: 0.35,
  universal_prereq: "ut_foc",
  inclination_conditions: { operator: "AND", conditions: [{ axis: "intel·lecte", min: 0.20 }, { axis: "impuls", max: 0.20 }] },
  unlocks_action_ids: ["act_destillar_quitra", "act_emmanegar_eines"],
  passive_effect: { type: "grant_material", amount: 2, desc: "+2 Material (les eines compostes duren més)" },
  is_hidden: false
},
```

**N2 — `bt_pesca` (pont Caçador–Recol·lector, sota `ut_corda`)** — cobreix:
vàlvula de food de baix risc per al Caçador (§3.6), contingut per al Bosc, i
el gap de la pesca (§4.4). Condició OR deliberadament simètrica als dos
perfils.

```js
{
  id: "bt_pesca", name: "Pesca amb Arpó i Xarxa",
  inheritanceRate: 0.45,
  universal_prereq: "ut_corda",
  inclination_conditions: { operator: "OR", conditions: [{ axis: "impuls", min: 0.12 }, { axis: "intel·lecte", min: 0.15 }] },
  unlocks_action_ids: ["act_pescar_riu", "act_xarxa_pesca"],
  passive_effect: { type: "bonus_action_output", action_id: "act_pescar_riu", output_min_bonus: 1, desc: "+1 mínim pesca (coneixes els passos del riu)" },
  is_hidden: false
},
```

**N3 — `bt_terrissa` (Artesà, sota `ut_ceramica`)** — cobreix T2-4: la
ceràmica per fi té una habilitat ceràmica, i és artesana.

```js
{
  id: "bt_terrissa", name: "Terrissa",
  inheritanceRate: 0.35,
  universal_prereq: "ut_ceramica",
  inclination_conditions: { operator: "AND", conditions: [{ axis: "intel·lecte", min: 0.22 }, { axis: "impuls", max: 0.20 }] },
  unlocks_action_ids: ["act_modelar_argila", "act_coure_ceramica"],
  passive_effect: { type: "grant_material", amount: 3, desc: "+3 Material (els vasos conserven el que abans es perdia)" },
  is_hidden: false
},
```

**N4 — `bt_musica_os` (pont Artesà–Místic, sota `ut_eines`)** — cobreix: no
existeix cap pont Artesà–Místic al joc (l'únic camí és via habilitats socials
genèriques); la combinació `int ∧ esp` no la fa servir cap altra habilitat,
així que obre una zona d'inclinació verge. Geissenklösterle (~42.000 AEC)
justifica el prereq `ut_eines` (cicle 16 ≈ 43.600 AEC): la flauta és,
abans que res, os treballat amb burí.

```js
{
  id: "bt_musica_os", name: "Flautes d'Os",
  inheritanceRate: 0.40,
  universal_prereq: "ut_eines",
  inclination_conditions: { operator: "AND", conditions: [{ axis: "intel·lecte", min: 0.15 }, { axis: "espiritualitat", min: 0.15 }] },
  unlocks_action_ids: ["act_tallar_flauta", "act_musica_vetlla"],
  passive_effect: { type: "grant_health", amount: 5, desc: "+5 Salut (la música calma el clan a les nits llargues)" },
  is_hidden: false
},
```

### 6.2 Modificades (4)

**M1 — `bt_calendari_natural`: trasllat a `ut_art` + condicions de pont
Recol·lector–Místic** — resol l'anacronisme d'associació (os de Lebombo =
os gravat, no ceràmica; §4.2), el forat del Recol·lector a `ut_art` (T2-3) i
la fantasia traïda (T2-7). Recupera la intenció original del content-plan.

```js
{
  id: "bt_calendari_natural", name: "Calendari Natural",
  inheritanceRate: 0.40,
  universal_prereq: "ut_art",   // abans: ut_ceramica
  inclination_conditions: { operator: "OR", conditions: [{ axis: "intel·lecte", min: 0.18 }, { axis: "espiritualitat", min: 0.20 }] },  // abans: AND esp≥0.20 ∧ soc≥0.10
  unlocks_action_ids: ["act_observar_cel", "act_transit_nocturn"],
  passive_effect: { type: "grant_material", amount: 2, desc: "+2 Provisions (previsió de cicles)" },
  is_hidden: false
},
```

Nota de pacing: `ut_art` passa de 4 a 6 derivades (amb N4 a `ut_eines`, no 7) i
`ut_ceramica` queda amb 4 (terrissa, llavor, domini, intercanvi). El cicle 36
és el centre de l'era; que sigui el moment més dens és desitjable.

**M2 — `bt_guariment_plantes`: reconciliar id i nom** — el nom torna a parlar
de guariment (l'id ja ho fa), mantenint el lligam amb el foc del seu prereq:

```js
  id: "bt_guariment_plantes", name: "Remeis de la Flama",  // abans: "Rituals de la Flama"
```

(La resta de camps, intactes. Justificació arqueològica: Shanidar IV i el
càlcul dental d'El Sidrón — el guariment herbaci passa per infusions i fums,
és a dir, pel foc.)

**M3 — `bt_llavor_selectiva`: trencar la duplicació amb
`bt_coneixement_plantes`** (T2-6) i fer-la el tram *profund* del Recol·lector:

```js
  inclination_conditions: { operator: "AND", conditions: [{ axis: "intel·lecte", min: 0.18 }, { axis: "impuls", max: 0.10 }] },
  // abans: int≥0.10 ∧ imp≤0.20 (idèntica a bt_coneixement_plantes)
```

Amb `imp ≤ 0.10` (el llindar exacte de la branca Recol·lector), un build
artesà amb una mica d'impuls acumulat ja no hi arriba: és la primera habilitat
*tendencialment* recol·lectora del joc. No és exclusivitat total (T2-1 és
estructural: les dues branques se solapen per definició de `BRANCHES`), però
crea gradient. La separació completa exigiria retocar `BRANCHES` mateix —
fora de l'abast d'aquesta revisió; anotat com a deute de disseny.

**M4 — `bt_domini_terra`: de quasi-universal a pont real** (T2-5):

```js
  inclination_conditions: { operator: "AND", conditions: [{ axis: "impuls", min: 0.12 }, { axis: "sociabilitat", min: 0.12 }] },
  // abans: OR imp≥0.10, soc≥0.10 (la desbloquejava gairebé qualsevol build)
```

Passa a ser el pont Caçador–social que el seu contingut (control de territori,
negociar pastures) descriu. `bt_guardia_flama` es manté quasi-universal
**deliberadament**: "el foc és de tothom" és bona narrativa; documentar-ho amb
un comentari al codi.

### 6.3 Resum d'impacte

| Branca | Habilitats noves/guanyades | Resultat |
|---|---|---|
| Artesà | +`bt_adhesius`, +`bt_terrissa`, +`bt_musica_os` (pont) | 2 → 4 exclusives + pont propi |
| Caçador | +`bt_pesca` (pont) | vàlvula de food sense risc extrem |
| Recol·lector | +`bt_pesca` (pont), +`bt_calendari_natural` (pont recuperat), `bt_llavor_selectiva` tendencialment pròpia | de 0 exclusives a 1 tendencial + 2 ponts nous; cobert el desert dels cicles 36–64 (T2-3) |
| Místic | +`bt_musica_os` (pont), −`bt_calendari_natural` (passa a pont) | de 6 exclusives a 5 — correcció suau de T2-2 sense treure contingut |

---

## 7. Proposta — Accions noves o modificades

Tot el codi en format exacte de `data.js`, copiar-pegable. Els pools d'events
referenciats existeixen tots.

### 7.1 Accions noves (8) — per a les habilitats de §6.1

```js
// ── bt_adhesius (El Foc — Artesà) ────────────────────────────────────────────
// Quitrà de bedoll: adhesiu destil·lat sota brases, documentat des de ~80.000 AEC (Campitello, Königsaue)
{
  id: "act_destillar_quitra", name: "Destil·lar Quitrà", is_base: false, zona: "Campament",
  description: "Cous escorça de bedoll sota brases tapades fins que en regalima una pasta negra i enganxosa. El que s'enganxa, no es perd.",
  purchase_cost: 4, execute_cost: 0, material_min: 2, material_max: 4,
  side_effects: [{ resource: 'health', delta: -2 }],
  stat_key: "enginy", stat_gain: 0.20,
  inclination_deltas: { impuls: -0.02, "intel·lecte": +0.05, espiritualitat: 0, sociabilitat: 0 },
  event_pool_id: "pool_artesania"
},
// Emmanegament: eines compostes (fulla + mànec + adhesiu), la gran revolució tècnica silenciosa del Paleolític
{
  id: "act_emmanegar_eines", name: "Emmanegar Eines", is_base: false, zona: "Campament",
  description: "Fixes una fulla de sílex a un mànec de fusta amb quitrà i tendons. L'eina composta multiplica la força de la mà.",
  purchase_cost: 4, execute_cost: 0,
  requires: [{ resource: 'pedra', min: 1 }],
  character_effect: { type: 'make_tool', pedra_cost: 1 },
  material_min: 2, material_max: 3,
  stat_key: "enginy", stat_gain: 0.20,
  inclination_deltas: { impuls: 0, "intel·lecte": +0.05, espiritualitat: 0, sociabilitat: 0 },
  event_pool_id: "pool_artesania"
},

// ── bt_pesca (La Corda — pont Caçador/Recol·lector) ──────────────────────────
// Arpons magdalenians (~17.000 AEC) i restes de peix d'Ohalo II (~23.000 AEC): proteïna de baix risc
{
  id: "act_pescar_riu", name: "Pescar al Riu", is_base: false, zona: "Bosc",
  description: "T'esperes immòbil al gual amb l'arpó alçat. El riu dona menjar sense exigir sang a canvi.",
  purchase_cost: 3, execute_cost: 1, output_resource: "food", output_min: 3, output_max: 6,
  stat_key: "forca", stat_gain: 0.10,
  inclination_deltas: { impuls: +0.02, "intel·lecte": +0.02, espiritualitat: 0, sociabilitat: 0 },
  event_pool_id: "pool_caca"
},
// Xarxes i llinyes de fibra vegetal conservades a Ohalo II (~23.000 AEC)
{
  id: "act_xarxa_pesca", name: "Calar la Xarxa", is_base: false, zona: "Bosc",
  description: "Cales la xarxa de fibra entre dues roques del riu i tornes l'endemà. La corda treballa mentre dorms.",
  purchase_cost: 5, execute_cost: 1, output_resource: "food", output_min: 4, output_max: 9,
  side_effects: [{ resource: 'health', delta: -2 }],
  stat_key: "enginy", stat_gain: 0.15,
  inclination_deltas: { impuls: +0.02, "intel·lecte": +0.03, espiritualitat: 0, sociabilitat: 0 },
  event_pool_id: "pool_caca"
},

// ── bt_terrissa (La Ceràmica — Artesà) ───────────────────────────────────────
// Figurines de terracota de Dolní Věstonice (~29.000–25.000 AEC): la ceràmica neix com a art, no com a vaixella
{
  id: "act_modelar_argila", name: "Modelar Argila", is_base: false, zona: "Campament",
  description: "Pastes argila humida i en surten formes: una dona, un bisó, un ós. Quan passen pel foc, es tornen pedra.",
  purchase_cost: 4, execute_cost: 1, material_min: 2, material_max: 4,
  stat_key: "enginy", stat_gain: 0.15,
  inclination_deltas: { impuls: 0, "intel·lecte": +0.04, espiritualitat: +0.02, sociabilitat: 0 },
  event_pool_id: "pool_artesania"
},
// Vasos de Xianrendong (~20.000–19.000 AEC): la ceràmica més antiga coneguda servia per coure i conservar
{
  id: "act_coure_ceramica", name: "Coure Vasos d'Argila", is_base: false, zona: "Campament",
  description: "Cous els vasos a la fossa del foc tota la nit. El que abans es feia malbé ara espera, tranquil, dins l'argila.",
  purchase_cost: 5, execute_cost: 1, output_resource: "food", output_min: 2, output_max: 5,
  material_min: 1, material_max: 2,
  stat_key: "enginy", stat_gain: 0.15,
  inclination_deltas: { impuls: -0.02, "intel·lecte": +0.04, espiritualitat: 0, sociabilitat: 0 },
  event_pool_id: "pool_artesania"
},

// ── bt_musica_os (Les Eines — pont Artesà/Místic) ────────────────────────────
// Flautes d'os de voltor i ivori de mamut: Hohle Fels i Geissenklösterle (~40.000 AEC)
{
  id: "act_tallar_flauta", name: "Tallar una Flauta d'Os", is_base: false, zona: "Campament",
  description: "Forades un os d'ala de voltor amb el burí, forat a forat. Quan hi bufes, en surt una veu que no és de ningú.",
  purchase_cost: 4, execute_cost: 0, material_min: 1, material_max: 2,
  reputation_gain: 1,
  stat_key: "enginy", stat_gain: 0.15,
  inclination_deltas: { impuls: 0, "intel·lecte": +0.03, espiritualitat: +0.03, sociabilitat: 0 },
  event_pool_id: "pool_artesania"
},
// La música com a cohesió de grup: l'evidència de flautes implica pràctica col·lectiva sostinguda
{
  id: "act_musica_vetlla", name: "Música a la Vetlla", is_base: false, zona: "Campament",
  description: "Toques la flauta quan el campament es recull. Els infants s'adormen abans i els vells parlen més fluix.",
  purchase_cost: 3, execute_cost: 1, output_resource: "health", output_min: 3, output_max: 6,
  reputation_gain: 1,
  stat_key: "vincle", stat_gain: 0.15,
  inclination_deltas: { impuls: -0.02, "intel·lecte": 0, espiritualitat: +0.03, sociabilitat: +0.04 },
  event_pool_id: "pool_ritual"
},
```

### 7.2 Accions modificades (12)

Cada bloc és l'objecte complet substitutiu; el comentari indica el canvi i el perquè.

```js
// CANVI: execute_cost 0 → 1. Resol T3-8 (acció dominant de manteniment infinit);
// segueix sent la millor acció de food segura del Recol·lector (net 2–5), però ja no és gratuïta.
{
  id: "act_cocinar_arrels", name: "Cuinar Arrels", is_base: false, zona: "Campament",
  description: "Coues arrels i tubercles al foc fins que es tornen tous i digeribles. El foc multiplica el valor dels aliments.",
  purchase_cost: 3, execute_cost: 1, output_resource: "food", output_min: 3, output_max: 6,
  stat_key: "enginy", stat_gain: 0.10,
  inclination_deltas: { impuls: -0.02, "intel·lecte": +0.04, espiritualitat: 0, sociabilitat: 0 },
  event_pool_id: "pool_recollecta"
},
// CANVI: output 2–4 → 2–3 + material 1–2; delta int −0.02 → +0.03. Resol part de T3-1
// (es diferencia com a híbrid food+material) i T3-4 (conservar planificant és analític).
{
  id: "act_assecament_plantes", name: "Assecament de Plantes", is_base: false, zona: "Campament",
  description: "Asseques les plantes recol·lectades per conservar-les. Reserves que aguanten setmanes.",
  purchase_cost: 3, execute_cost: 0, output_resource: "food", output_min: 2, output_max: 3,
  material_min: 1, material_max: 2,
  stat_key: "enginy", stat_gain: 0.15,
  inclination_deltas: { impuls: 0, "intel·lecte": +0.03, espiritualitat: 0, sociabilitat: 0 },
  event_pool_id: "pool_recollecta"
},
// CANVI: delta int −0.02 → +0.04. Resol T3-4: la mòlta metòdica reforça la branca, no l'erosiona.
{
  id: "act_molda_grans", name: "Mòlta de Grans", is_base: false, zona: "Campament",
  description: "Raspes grans silvestres amb el raspador fi per obtenir farina primitiva. Estable i nutritiu.",
  purchase_cost: 3, execute_cost: 1, output_resource: "food", output_min: 3, output_max: 7,
  stat_key: "enginy", stat_gain: 0.15,
  inclination_deltas: { impuls: 0, "intel·lecte": +0.04, espiritualitat: 0, sociabilitat: 0 },
  event_pool_id: "pool_recollecta"
},
// CANVI: delta int −0.02 → +0.03. Resol T3-4: identificar bolets és coneixement expert.
{
  id: "act_recollida_bolets", name: "Recollida de Bolets", is_base: false, zona: "Bosc",
  description: "Coneixes quins bolets del bosc són comestibles i quins cal evitar. Provisions i salut.",
  purchase_cost: 3, execute_cost: 1, output_resource: "food", output_min: 2, output_max: 5, side_effects: [{ resource: 'health', delta: +5 }],
  stat_key: "enginy", stat_gain: 0.15,
  inclination_deltas: { impuls: 0, "intel·lecte": +0.03, espiritualitat: 0, sociabilitat: 0 },
  event_pool_id: "pool_recollecta"
},
// CANVI: deltes zero → int +0.04. Resol T3-4: la selecció artificial és l'acte analític per excel·lència.
{
  id: "act_seleccionar_llavors", name: "Seleccionar Llavors", is_base: false, zona: "Campament",
  description: "Tries les millors llavors de la collita. Les plantes del proper cicle donaran més.",
  purchase_cost: 4, execute_cost: 1, output_resource: "food", output_min: 3, output_max: 6,
  stat_key: "enginy", stat_gain: 0.15,
  inclination_deltas: { impuls: 0, "intel·lecte": +0.04, espiritualitat: 0, sociabilitat: 0 },
  event_pool_id: "pool_recollecta"
},
// CANVI: health −20 → −14. Resol T3-6: manté el terror sense fer l'acció estrictament
// inferior a alternatives sense risc a mitja vida (HEALTH_MAX 40).
{
  id: "act_emboscada_nocturna", name: "Emboscada Nocturna", is_base: false, zona: "Planes",
  description: "La foscor és el teu aliat. Atacs per sorpresa quan la presa dorm. Molt perillós però molt rendible.",
  maxAge: 12,
  purchase_cost: 5, execute_cost: 2, output_resource: "food", output_min: 8, output_max: 16, side_effects: [{ resource: 'health', delta: -14 }],
  stat_key: "forca", stat_gain: 0.20,
  inclination_deltas: { impuls: +0.10, "intel·lecte": 0, espiritualitat: 0, sociabilitat: -0.08 },
  event_pool_id: "pool_caca"
},
// CANVI: execute_cost 0 → 1. Resol T3-9 (doble output gratuït que dominava construir_refugi).
{
  id: "act_cosir_pells", name: "Cosir Pells", is_base: false, zona: "Campament",
  description: "Cosius pells amb agulles d'os. La roba que protegeixes millora la salut de tot el clan.",
  purchase_cost: 3, execute_cost: 1, output_resource: "health", output_min: 3, output_max: 6,
  material_min: 1, material_max: 2,
  stat_key: "enginy", stat_gain: 0.15,
  inclination_deltas: { impuls: 0, "intel·lecte": +0.03, espiritualitat: 0, sociabilitat: 0 },
  event_pool_id: "pool_artesania"
},
// CANVI: side_effect health +5 → +3. Resol part de T3-10 (vàlvula de salut gratuïta del Místic).
{
  id: "act_cants_grup", name: "Cants de Grup", is_base: false, zona: "Campament",
  description: "Organitzes cants col·lectius al voltant del foc. El ritme compartit uneix el que les paraules no acaben de dir.",
  purchase_cost: 3, execute_cost: 0, output_resource: "reputacio", output_min: 1, output_max: 2,
  side_effects: [{ resource: "health", delta: +3 }],
  stat_key: "vincle", stat_gain: 0.10,
  inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.04, sociabilitat: +0.05 },
  event_pool_id: "pool_ritual"
},
// CANVI: alimentar el foc consumeix llenya (material −1). Resol part de T3-10 i dona
// coherència: mantenir el foc viu tota la nit té un cost material real.
{
  id: "act_alimentar_foc", name: "Alimentar el Foc", is_base: false, zona: "Campament",
  description: "Mantens el foc viu tota la nit amb fusta seca i cendra. El campament dorm segur i sa.",
  purchase_cost: 3, execute_cost: 0, output_resource: "health", output_min: 3, output_max: 5,
  side_effects: [{ resource: 'material', delta: -1 }],
  stat_key: "vincle", stat_gain: 0.10,
  inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.03, sociabilitat: +0.03 },
  event_pool_id: "pool_ritual"
},
// CANVI: "Ahumar" (castellanisme) → "Afumar"; afegit requires food ≥ 2 (per afumar carn, cal carn).
{
  id: "act_ahumar_carn", name: "Afumar Carn", is_base: false, zona: "Campament",
  description: "Pengeu la carn sobre el fum del foc durant hores. La carn fumada dura dies i us guanya temps.",
  purchase_cost: 4, execute_cost: 1, output_resource: "food", output_min: 4, output_max: 8,
  requires: [{ resource: 'food', min: 2 }],
  stat_key: "enginy", stat_gain: 0.10,
  inclination_deltas: { impuls: -0.02, "intel·lecte": +0.03, espiritualitat: 0, sociabilitat: 0 },
  event_pool_id: "pool_artesania"
},
// CANVI: l'ofrena consumeix una pedra (coherència: ofrenar eines té cost; precedent: ceramica_regalada gasta material).
{
  id: "act_ofrena_eines", name: "Ofrena d'Eines", is_base: false, zona: "Campament",
  description: "Ofreneu eines de sílex al foc com a ofrena als esperits de la terra. El que es dóna torna multiplicat.",
  purchase_cost: 3, execute_cost: 1, output_resource: "reputacio", output_min: 1, output_max: 3,
  requires: [{ resource: 'pedra', min: 1 }],
  side_effects: [{ resource: "health", delta: +5 }, { resource: "pedra", delta: -1 }],
  stat_key: "vincle", stat_gain: 0.10,
  inclination_deltas: { impuls: 0, "intel·lecte": 0, espiritualitat: +0.05, sociabilitat: +0.03 },
  event_pool_id: "pool_ritual"
},
// CANVI: nom i descripció des-neolititzats ("bestiar"/"pasturar" → gestió laxa de ramat salvatge, §4.2);
// typo "abir" corregit a act_roba_hivern (no reproduïda aquí: només canvia "com abir" → "com abans").
{
  id: "act_pasturar_bestiar", name: "Guiar el Ramat", is_base: false, zona: "Planes",
  description: "Acompanyes els animals mig amansits cap a bones pastures i els defenses dels depredadors. Encara són lliures; ja no són estranys.",
  purchase_cost: 3, execute_cost: 1, output_resource: "food", output_min: 3, output_max: 7,
  stat_key: "forca", stat_gain: 0.10,
  inclination_deltas: { impuls: +0.02, "intel·lecte": 0, espiritualitat: 0, sociabilitat: +0.03 },
  event_pool_id: "pool_caca"
},
```

### 7.3 Canvis menors sense bloc complet

- `act_roba_hivern.description`: "com abir" → "com abans" (typo).
- `act_reforçar_palissada`: renomenar display a **"Barrera d'Espines"** i
  descripció a to paleolític ("Claveu branques espinoses travades al voltant
  del campament...") — mecànica intacta (§4.2).
- `bt_domesticacio_animals`: display name → **"Amansiment d'Animals"**
  (la domesticació plena és neolítica; l'amansiment és el gest paleolític).

### 7.4 Regla de disseny derivada (per a contingut futur)

> Tota acció amb `execute_cost: 0` ha de complir almenys un de:
> (a) `requires` de recurs, (b) side-effect negatiu, (c) output exclusivament
> de `material`. Mai food o health gratuïts sense contrapartida.

Accions que queden legitimades per la regla: `tallar_pedra`, `faonar_eines`,
`gravar_os`, `preparar_cuiro`, `practicar_tir`, `tela_sagrada` (c),
`preparar_eina`, `emmanegar_eines` (a), `revisar_trampes`, `torxa_escolta`,
`destillar_quitra` (b). Queda un cas límit conegut: `act_observar_cel`
(cost 0, health 2–4) — acceptat de moment perquè el seu output és petit i la
fantasia (mirar el cel no costa res) ho justifica; revisar si el playtest
mostra spam.

---

## 8. Pla d'aplicació i validació

### 8.1 Resum quantitatiu de la proposta

| Àmbit | Canvis | Detall |
|---|---|---|
| Tecnologies universals | 3 retocs de text | `ut_foc`, `ut_ceramica`, `ut_agricultura` — només `name`/`description` (§5.1) + comentari de regla canònica (§5.2) |
| Habilitats | 4 noves + 4 modificades | N1–N4 (§6.1); M1–M4 (§6.2). Era 1 passa de 26 a **30 habilitats** |
| Accions | 8 noves + 12 modificades + 3 menors | §7.1, §7.2, §7.3. L'era passa de ~50 a **~58 accions** |
| Zones | redistribució lleu | El Bosc guanya `pescar_riu` i `xarxa_pesca` (5 → 7 accions); cap acció nova al Campament que no derivi d'habilitat de campament |
| Ids / cycles / `BRANCHES` | **cap canvi** | Tots els ids es conserven (compatibilitat de saves); el calendari de techs no es toca; el solapament de `BRANCHES` queda com a deute (§9.4) |

Cap dependència nova: tots els `event_pool_id` referenciats (`pool_caca`,
`pool_recollecta`, `pool_artesania`, `pool_ritual`) existeixen a `data.js`, i
cap acció nova introdueix tipus de `passive_effect` o `side_effect` que el
motor no suporti ja.

### 8.2 Ordre d'aplicació recomanat (4 lots independents)

Cada lot és aplicable i provable per separat; si un playtest detecta regressió,
es reverteix el lot sencer sense afectar els altres.

**Lot A — Text pur (risc zero)**: §5.1 (3 descripcions de tech), §5.2
(comentari de capçalera), M2 (`bt_guariment_plantes` → "Remeis de la Flama"),
§7.3 complet (typo "abir", "Barrera d'Espines", "Amansiment d'Animals"),
renoms de `act_ahumar_carn` → "Afumar Carn" i `act_pasturar_bestiar` →
"Guiar el Ramat" (la part de text de §7.2). Cap canvi mecànic; cap validació
més enllà d'una lectura.

**Lot B — Rebalanç d'accions existents**: la part mecànica de §7.2 — costos
(`cocinar_arrels`, `cosir_pells`), `requires` nous (`ahumar_carn`,
`ofrena_eines`), side-effects (`alimentar_foc` −1 material, `cants_grup`
+5→+3 ❤️, `emboscada_nocturna` −20→−14 ❤️) i la inversió dels deltes
d'intel·lecte del Recol·lector (T3-4). És el lot amb més impacte sobre saves
en curs: un personatge mig-vida pot veure accions ja comprades canviar de
cost. Acceptable en prototip; anotar-ho al changelog de playtest.

**Lot C — Habilitats noves + les seves accions**: N1–N4 (§6.1) amb les 8
accions de §7.1. Additiu pur: cap save existent es trenca, només apareix
contingut nou.

**Lot D — Canvis de condicions**: M1 (`bt_calendari_natural` canvia de
`universal_prereq` i de condicions), M3 (`bt_llavor_selectiva` s'estreny),
M4 (`bt_domini_terra` passa a AND). És l'únic lot que pot *treure* accés a
contingut a un build existent: un personatge que ja complia les condicions
velles pot deixar de complir les noves. Cal decidir la política de
retrocompatibilitat: l'opció simple (i recomanada en prototip) és que les
habilitats **ja desbloquejades es conserven** i les condicions noves només
regeixen desbloquejos futurs — verificar que el codi ja funciona així abans
d'aplicar.

### 8.3 Matriu de validació troballa → comprovació

Després d'aplicar cada lot, executar `/playtest` dirigit amb els agents
indicats i comprovar el criteri observable:

| Troballa | Lot | Criteri de validació | Agent |
|---|---|---|---|
| T3-4 (Recol·lector s'auto-extingeix) | B | Un build que només usa accions de Recol·lector **acaba la vida dins la branca** (int no decreix mai per accions pròpies) | `playtester-branch-path` |
| T3-6 (emboscada estrictament inferior) | B | A mitja vida, l'emboscada té valor esperat competitiu amb `collita_sistematica` sense ser dominant | `playtester-optimizer` |
| T3-8/T3-9/T3-10 (dominàncies cost-0) | B | Cap acció amb `execute_cost: 0` resol upkeep o salut indefinidament sense contrapartida (regla §7.4) | `playtester-optimizer` |
| T2-1/T2-3 (Recol·lector sense identitat, desert 36–64) | C+D | Entre els cicles 36 i 64 un Recol·lector pur desbloqueja ≥2 habilitats (`calendari_natural`, `pesca`); `llavor_selectiva` no l'assoleix un build artesà amb imp > 0.10 | `playtester-branch-path` |
| T2-2 (Místic sobre-representat) | C+D | Recompte d'exclusives per branca: cap branca amb 0; el Místic ≤ 5 | `playtester-branch-path` |
| T2-4 (ceràmica sense terrissa) | C | `bt_terrissa` accessible per un build artesà arquetípic al cicle 80 | `playtester-tycoon` |
| T2-5 (quasi-universals) | D | `bt_domini_terra` ja no es desbloqueja amb un build neutre de 10 accions | `playtester-optimizer` |
| Pacing global | tots | El nombre d'accions comprables per cicle no creix tant que trivialitzi la tria (l'era té ~16% més accions) | `playtester-speed-runner` |

### 8.4 Fora de l'abast d'aquest pla

- Redefinició de `BRANCHES` (causa arrel de T2-1) — deute de disseny, §9.4.
- Nous events per al contingut nou — les 8 accions reusen pools existents;
  events dedicats (pesca, terrissa, música) queden per a una iteració
  posterior si el playtest mostra que els pools genèrics hi encaixen malament.
- Qualsevol canvi a indicadors (`health`-only), recursos o zones — l'economia
  actual es manté intacta.

---

## 9. Contingut futur (fora de l'abast d'aquesta revisió)

Oportunitats detectades durant la revisió que **no** formen part de la
proposta (§5–§7) perquè exigeixen sistemes nous, no només contingut. Ordenades
per valor estimat. Cada entrada inclou l'ancoratge arqueològic i el ganxo
mecànic perquè qui les reprengui no hagi de refer la recerca.

### 9.1 Zona "Cova Profunda"

**Evidència**: les ~130 llànties de greix de Lascaux i l'art parietal de
galeries profundes (Chauvet, Niaux) demostren expedicions deliberades a
centenars de metres de la llum, amb logística pròpia (llum, cordes, bastides).

**Ganxo mecànic**: cinquena zona, descobrible tard (suggeriment: via
`bt_pintura_rupestre` o un event de `pool_ritual`, simètric a com
`marques_territori` revela el Bosc). Perfil: risc alt + reputació alta — el
mirall místic/artesà de l'emboscada del Caçador. Resoldria de retruc la
saturació del Campament (§3.6) donant una llar pròpia a les accions rituals
que hi van quedar en eliminar-se la Zona Ritual, i donaria ús a una acció
"Llàntia de Greix" (food → llum: un embornal de food alternatiu a l'upkeep).
Requereix sistema nou: cap mecànica actual modela "llum" ni zones amb cost
d'entrada.

### 9.2 Cerimònies funeràries dinàstiques

**Evidència**: els enterraments de Sungir (~32.000 AEC) — ~10.000 denes
d'ivori per individu, mesos de treball artesà — i Arene Candide demostren
funerals d'estatus amb inversió material massiva. El joc ja en té la llavor:
`ev_dol_enterrament` (ocre i cargol marí, §4.3).

**Ganxo mecànic**: la successió actual és un tall net (estats resetejats,
destreses heretades amb `DESTRESA_INHERIT_RATE`). Un funeral dinàstic la
convertiria en la **primera decisió de cada generació**: gastar material i
reputació acumulats del difunt per comprar bonificacions a l'hereu (denes
d'ivori = +reputació inicial; aixovar d'eines = +material; ocre = +salut).
Convertiria la reputació — que ara mor amb el `REPUTACIO_PER_CHAR_CAP` — en
un recurs amb embornal transgeneracional, el forat econòmic més evident del
prototip. Requereix tocar el flux de successió, per això és futur i no §7.

### 9.3 Intercanvi a llarga distància

**Evidència**: closques marines a >300 km de la costa, obsidiana i sílex
exòtics circulant per xarxes de mà en mà per tot el Paleolític Superior.

**Ganxo mecànic**: avui cobert puntualment per `ev_estrany_a_la_vora` i
`act_fira_intercanvi`. L'ampliació natural és una **cadena d'events**
(l'estrany torna cada N cicles si el vas tractar bé) que ofereixi intercanvis
asimètrics — material per food, pedra exòtica per reputació — i que doni al
Místic la font de food "cobrant la influència" que §3.6 troba a faltar.
Encaixa amb el sistema d'events existent (`EVENT_CHAIN_DECAY` ja existeix com
a knob), però demana estat persistent entre events que avui no es modela.

### 9.4 Deute de disseny: redefinir `BRANCHES`

T2-1 és estructural: Recol·lector (`imp≤0.10 ∧ int≥0.15`) i Artesà
(`int≥0.18 ∧ imp≤0.20`) ocupen quasi el mateix espai d'inclinació, i cap
retoc d'habilitats (M3 inclosa) ho cura del tot — només crea gradient.
La solució de fons és que les quatre branques particionin l'espai
d'inclinació amb regions disjuntes o quasi-disjuntes (p. ex. el Recol·lector
reclamant `int` alt amb `esp` baixa i l'Artesà exigint a més un llindar de
`material` produït, o introduint histèresi de branca). **No aplicar fins a
tenir dades de playtest posteriors al Lot D**: M3/M4 ja redistribueixen
l'espai i cal mesurar el resultat abans de refer els llindars, que el
playtest del 2026-06 ja va recalibrar una vegada (×0.73, §1.3).

### 9.5 Menors anotats

- **Gossos** (~15.000 AEC, final de l'era): companyia de caça que redueix el
  risc (side-effects de ❤️) de les accions de Planes — primer "upgrade
  d'acció" narrativament orgànic. Cicle ≈ 87 sota l'escala canònica.
- **Events dedicats al contingut nou**: pesca (riuada, pesca miraculosa),
  terrissa (vas esquerdat al foc), música (la flauta que calma una disputa) —
  només si els pools genèrics es queden curts (§8.4).
- **Enterraments com a event recurrent**: mentre 9.2 no existeixi, una
  variant de `ev_dol_enterrament` per a la mort del *protagonista* (no d'un
  membre del clan) seria el pont barat cap a les cerimònies dinàstiques.
