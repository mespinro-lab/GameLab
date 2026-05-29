# Life Tycoon 2 — Content Plan: Era 1

> **ESTAT**: Proposta completa. Contingut basat en recerca del Paleolític Superior
> (50.000–10.000 AEC). Tot marcat `[PROPOSTA]` requereix validació de jugabilitat.
> Les justificacions històriques estan incloses per facilitar la validació.

**Depèn de**: `era-system.md`, `branch-system.md`, `action-economy.md`, `event-system.md`

---

## 1. Definició de l'Era

| Camp | Valor |
|---|---|
| `id` | `era_prehistoria` |
| `name` | Paleolític |
| `slot_order` | 1 (primera era) |
| `entry_connector` | Buit (primera era) |
| `exit_connector` | `ut_conreu_incipient` — "Conreu Incipient" |
| `life_expectancy.base_cycles` | 12 |
| `life_expectancy.max_cycles` | 18 |
| `dlc` | false (era gratuïta) |

> **Per què "Paleolític" i no "Prehistòria"**: Prehistòria engloba Paleolític + Neolític + Edat dels Metalls. El nom "Paleolític" és precís, evocador i diferencia l'era de les següents.
>
> **Per què cicle 12/18**: Al Paleolític Superior, l'esperança de vida adulta era 25–35 anys. 12 cicles = vida adulta estàndard; 18 = vida excepcional. Compatible amb sessions de 45–90 min.

### Indicadors base (noms era-específics)

| ID intern | Nom Paleolític |
|---|---|
| `health` | Salut |
| `happiness` | Benestar |
| `security` | Protecció |
| `social` | Vincles |

### Recursos d'acció

| ID intern | Nom Paleolític | Notes |
|---|---|---|
| `primary` | Provisions | Menjar acumulat; gastat en comprar/executar accions. Si s'esgota, `Salut` decreix. |
| `secondary` | `[PROPOSTA]` Pells | Generat per caça i trampatge; gastat en cosit i intercanvi. Opcional: simplificar a 1 recurs per a l'Era 1. |

---

## 2. Branques de l'Era 1

### Noms i estil de joc

| ID | Nom | Estil de joc |
|---|---|---|
| `hunter` | Caçador | Risc alt, reward alt. Acció física, territori, caça a distància |
| `gatherer` | Recol·lector | Sostenibilitat, paciència, coneixement del terreny |
| `craftsman` | Artesà | Eines especialitzades, millores, intercanvi |
| `mystic` | Místic | Guariment, ritual, influència social sense combat |

### Condicions d'inclinació per branca

```
hunter (Caçador):
  impuls      ≥ +0.30
  sociabilitat ≤ +0.30   [AND]

gatherer (Recol·lector):
  impuls      ≤ +0.10
  intel·lecte ≤ +0.10   [AND]

craftsman (Artesà):
  intel·lecte ≥ +0.25
  impuls      ≤ +0.20   [AND]

mystic (Místic):
  espiritualitat ≥ +0.30
  sociabilitat   ≥ +0.25  [AND]
```

> **[PROPOSTA] — Llindars a validar en prototip.** Dissenyats per crear zones d'intersecció
> natural: hunter+mystic, gatherer+mystic i gatherer+craftsman son híbrids assolibles.
> Hunter+craftsman NO se solapen directament per disseny (valors d'`impuls` incompatibles)
> — el pont entre ells és la branch tech `bt_rasclador_fi`.

### Zones híbrides previstes

| Combinació | Narrativa |
|---|---|
| Caçador + Místic | El guerrer-xaman; `impuls ≥ 0.30` + `espiritualitat ≥ 0.30` + `sociabilitat ≥ 0.25` |
| Recol·lector + Místic | La guardiana de les plantes; zona d'intersecció ampla i natural |
| Recol·lector + Artesà | El coneixedor de plantes que millora les eines; molt accessible |

### Transició Era 1 → Era 2

Els 4 eixos d'inclinació es transfereixen directament sense conversió. Les branques del Neolític
emergiran dels mateixos valors que tenia el jugador al final del Paleolític.

`[PENDENT]` — cal definir les branques de l'Era 2 per validar la continuïtat narrativa.

---

## 3. Tecnologies Universals

> Revisió històrica: "Llengua Bàsica" i "Foc" eliminats — al Paleolític Superior (50.000 AEC)
> ja eren universals i preexistents. Les techs en joc son les que **emergien i es descobrien**
> durant aquest període.

| Cicle | ID | Nom | `is_exit_connector` | Justificació |
|---|---|---|---|---|
| 2 | `ut_talla_laminar` | Talla en Làmines | false | Mode 4 del Paleolític Superior (~45.000 BP): làmines de sílex primes. Diferenciador clau de l'era. |
| 4 | `ut_vestimenta` | Cosit i Vestimenta | false | Agulles d'os (~45.000 BP, Yana). Permet colonitzar climes freds; transforma la supervivència. |
| 6 | `ut_art_simbolic` | Art i Símbol | false | Art rupestre de Chauvet (~36.000 BP), Venus de Hohle Fels (~40.000 BP). Pensament abstracte. |
| 9 | `ut_recollida_sistematica` | Recol·lecció Sistemàtica | false | Mòlta de plantes salvatges documentada ~30.000 BP. Predecessor directe de l'agricultura. |
| 12 | `ut_conreu_incipient` | Conreu Incipient | **true** | Proto-agricultura Natufiense (~11.500 BP). Primera sembra intencional. Exit cap al Neolític. |

> **Per què "Conreu Incipient" i no "Agricultura"**: l'arqueologia és clara que la transició
> fou gradual. "Conreu Incipient" reflecteix el primer gest de sembrar intencionalment,
> que és el llindar correcte entre Paleolític i Neolític. "Agricultura" implica camps plens,
> que és el Neolític establert, no la seva llavor.

---

## 4. Tecnologies de Branca (Habilitats)

Cada `universal_tech` deriva 2–3 branch techs. El jugador desbloqueja les que coincideixen
amb la seva inclinació actual. Desbloquejant una habilitat → les seves accions apareixen
a les zones corresponents com a comprables.

### Derivades de `ut_talla_laminar` (Talla en Làmines)

| ID | Nom | Branques | Pont? | `is_hidden` | Accions desbloq. | Justificació |
|---|---|---|---|---|---|---|
| `bt_punta_llanca` | Punta de Llança | `hunter` | No | false | Caça amb Llança, Emboscada Nocturna | Làmines de sílex → puntes de projectil. Caça a distància revolucionada. |
| `bt_rasclador_fi` | Rasclador Fi | `gatherer`, `craftsman` | **Sí** | false | Mòlta de Grans, Façonar Eines | Eina de raspat per a arrels i per a preparació de pells. Pont natural. |
| `bt_buri` | Burí i Gravat | `craftsman` | No | false | Gravar Os i Ivori, Intercanviar Eines | Eina especialitzada per gravar os i ivori. Artesania fina. |

### Derivades de `ut_vestimenta` (Cosit i Vestimenta)

| ID | Nom | Branques | Pont? | `is_hidden` | Accions desbloq. | Justificació |
|---|---|---|---|---|---|---|
| `bt_agulla_os` | Agulla d'Os | `craftsman` | No | false | Cosir Pells, Construir Refugi | Agulles d'os per cosir pells d'animal. Base de la vestimenta de temps fred. |
| `bt_trampes` | Trampes i Llaços | `hunter`, `gatherer` | **Sí** | false | Parar Trampes, Millorar Trampes | Llaços i trampes de fibra natural. Les fan i les posen Caçadors i Recol·lectors. |
| `bt_guariment_plantes` | Guariment amb Plantes | `mystic` | No | **true** | Curar amb Herbes | Coneixement herbari ritual. Descobriment sorpresa — el Místic pot sobreviure sense caça. |

### Derivades de `ut_art_simbolic` (Art i Símbol)

| ID | Nom | Branques | Pont? | `is_hidden` | Accions desbloq. | Justificació |
|---|---|---|---|---|---|---|
| `bt_pintura_rupestre` | Pintura Rupestre | `mystic` | No | false | Pintar les Parets, Narrar les Llegendes | Art de les cavernes com a ritual i comunicació social. Dona accés al Lloc Sagrat. |
| `bt_marques_territori` | Marques de Territori | `hunter` | No | false | Marcar Territori, Rastreig de Rutes | Senyalitzar zones de caça. Evidència arqueològica de marques territorials. |
| `bt_ornaments` | Ornaments i Adorn | `gatherer`, `mystic` | **Sí** | false | Ornamentar-se, Consagrar Ornaments | Collars de closques i dents (~130.000 BP). Adorn social i ritual alhora. |

### Derivades de `ut_recollida_sistematica` (Recol·lecció Sistemàtica)

| ID | Nom | Branques | Pont? | `is_hidden` | Accions desbloq. | Justificació |
|---|---|---|---|---|---|---|
| `bt_coneixement_plantes` | Coneixement de Plantes | `gatherer` | No | false | Recollida de Bolets, Assecament de Plantes | Identificar, collir i emmagatzemar plantes comestibles. |
| `bt_calendari_natural` | Calendari Natural | `gatherer`, `mystic` | **Sí** | **true** | Observar el Cel Nocturn, Trànsit Nocturn | Seguiment de cicles lunars. Os de Lebombo (~44.000 BP). Pont recol·lector-místic. Hidden = descobriment sorpresa. |

### Derivades de `ut_conreu_incipient` (Conreu Incipient — exit connector)

| ID | Nom | Branques | Pont? | `is_hidden` | Accions desbloq. | Justificació |
|---|---|---|---|---|---|---|
| `bt_llavor_selectiva` | Llavor Selectiva | `gatherer` | No | false | Seleccionar Llavors | Triar les millors llavors per sembrar. Proto-agricultora. |
| `bt_domini_terra` | Domini de la Terra | `hunter`, `gatherer` | **Sí** | false | Control del Territori | Control i delimitació d'àrees de recursos. Pont exit connector. |

**Resum: 13 branch techs** (5 ponts + 8 exclusives). Distribució per branca:
- Caçador: `bt_punta_llanca`, `bt_trampes`, `bt_marques_territori`, `bt_domini_terra` (4)
- Recol·lector: `bt_rasclador_fi`, `bt_trampes`, `bt_ornaments`, `bt_coneixement_plantes`, `bt_calendari_natural`, `bt_llavor_selectiva`, `bt_domini_terra` (7)
- Artesà: `bt_rasclador_fi`, `bt_buri`, `bt_agulla_os` (3)
- Místic: `bt_guariment_plantes`, `bt_pintura_rupestre`, `bt_ornaments`, `bt_calendari_natural` (4)

> El Recol·lector té 7 habilitats intencionalment: és la branca amb més amplada de coneixement
> però menor risc/reward individual. L'Artesà té poques habilitats pròpies però les seves
> accions milloren els outputs d'altres branques via `action_modifiers`.

---

## 4b. Efectes Passius per Branch Tech

Cada habilitat desbloqueja accions (§4). Aquí es defineix el `passive_effect` —
efecte que s'aplica automàticament quan la tech és descoberta o posseïda,
sense intervenció del jugador.

### Format de dades (`passive_effect` a data.js)

Tipus parametritzats — el motor llegeix el `type` i aplica l'efecte genèricament:

| `type` | Camps addicionals | Semàntica |
|---|---|---|
| `one_time_health` | `amount` | Suma `amount` a Salut en el moment del descobriment |
| `one_time_materials` | `amount` | Suma `amount` a Provisions en el moment del descobriment |
| `event_block` | `event_id` | L'event indicat mai no es dispara mentre el personatge té la tech |
| `unlock_zone` | `zone_id` | Desbloqueja la zona indicada immediatament en descobrir la tech |
| `action_output_bonus` | `action_id`, `output_min_bonus` | Suma `output_min_bonus` al `output_min` de l'acció indicada (permanent) |

Totes les techs sense efecte passiu declaren `passive_effect: null`.

### Efectes per tech

| ID | `passive_effect` | `desc` | Nota disseny |
|---|---|---|---|
| `bt_punta_llanca` | `null` | — | El valor és en les accions d'alt risc/reward |
| `bt_rasclador_fi` | `action_output_bonus · act_recollectar_arrels · +1` | "+1 mínim recol·lecta (eina millora el raspat)" | Pont: beneficia dos perfils sense condicionals |
| `bt_buri` | `null` | — | El valor és en l'intercanvi d'eines |
| `bt_agulla_os` | `one_time_health · +3` | "+3 Salut (vestimenta protegeix del fred)" | Únic tech d'artesà amb passiu directe — Salut, no Provisions |
| `bt_trampes` | `null` | — | El valor és en l'acció passiva de trampes |
| `bt_guariment_plantes` | `event_block · pe_malaltia` | "Presència del guaridor: la febre no s'estén" | Bloqueig dur. Si el personatge té la tech, l'event no es dispara mai |
| `bt_pintura_rupestre` | `unlock_zone · zone_ritual` | "El Místic descobreix el Lloc Sagrat" | La zona existeix en dades des del principi; la tech la fa accessible |
| `bt_marques_territori` | `null` | — | El valor és en Marcar Territori i Rastreig de Rutes |
| `bt_ornaments` | `null` | — | El valor és en les accions socials |
| `bt_coneixement_plantes` | `null` | — | El valor és en les tres accions del Bosc |
| `bt_calendari_natural` | `one_time_materials · +2` | "+2 Provisions (previsió de cicles millora les reserves)" | Simplificació de prototip: el warning d'event previ requereix engine nou |
| `bt_llavor_selectiva` | `null` | — | L'efecte diferit es codifica com output_max ampliat (8) a l'acció |
| `bt_domini_terra` | `one_time_health · +2` | "+2 Salut (domini del territori = seguretat del grup)" | Exit connector tech: el passiu és discret intencionalment |

### Principi de disseny

Només 5 de les 13 techs tenen passiu. La resta donen valor exclusivament
via accions. Ràtio intencionada: el passiu és una sorpresa, no l'expectativa.
Les branques amb passiu: Artesà (×1), Místic (×2), exit connector (×1), pont (×1).

---

## 5. Zones del Mapa

| ID | Nom | Discovery condition | Accions principals |
|---|---|---|---|
| `zone_home` | Campament | `initial` | Supervivència base, rituals, cosit, intercanvi |
| `zone_wild` | Territori Salvatge | `initial` | Caça, trampes, marques, exploració |
| `zone_forest` | Bosc | `action: explorar_voltants` (acció base de zone_wild) | Recol·lecta avançada, plantes, animals petits |
| `zone_ritual` | Lloc Sagrat | `branch_tech: bt_pintura_rupestre` | Pintura, trànsit, cerimònia, calendari |

---

## 6. Accions

### Accions base (sense prereq, visibles des del principi)

| Nom | Zona | Incl. push | Output principal | Notes |
|---|---|---|---|---|
| Espiar el Ramat | `zone_wild` | `impuls` +0.02 | Provisions+ | Observar animals de lluny. Risc 0. Punt de partida del Caçador. |
| Recol·lectar Arrels | `zone_wild` | `impuls` -0.02 | Provisions+ | Estable, risc baix. Punt de partida del Recol·lector. |
| Tallar Pedra | `zone_home` | `intel·lecte` +0.01 | _(genera eines, millora roll d'altres accions)_ | Punt de partida de l'Artesà. |
| Ritual del Foc | `zone_home` | `espiritualitat` +0.02, `sociabilitat` +0.02 | Benestar+, Vincles+ | Punt de partida del Místic. No requereix prereq. |
| Vigilar el Campament | `zone_home` | `sociabilitat` +0.02 | Protecció+, Vincles+ | Acció social/base. Qualsevol branca. |
| Explorar els Voltants | `zone_wild` | `intel·lecte` -0.01 | _(desbloqueja zone_forest)_ | Primera vegada: descobreix el Bosc. |
| Buscar Fruits del Bosc | `zone_forest` | `intel·lecte` -0.01 | Provisions+ | Disponible quan el Bosc es descobreix. |
| **Escoltar els Estrangers** | `zone_home` | _(sense delta)_ | _(desbloqueja branch tech)_ | `is_discovery_action: true`. OCULTA si no hi ha branch techs elegibles. Quan és visible: notificació "Hi ha estrangers al poblat que expliquen tècniques noves". |

### Caçador — accions d'habilitat

| Nom | Zona | Prereq | Incl. push | Output principal |
|---|---|---|---|---|
| Caça amb Llança | `zone_wild` | `bt_punta_llanca` | `impuls` +0.05 | Provisions++ (alt risc, alt reward) |
| Emboscada Nocturna | `zone_wild` | `bt_punta_llanca` | `impuls` +0.04, `sociabilitat` -0.02 | Provisions+++ (molt alt risc, molt alt reward) |
| Parar Trampes | `zone_wild` | `bt_trampes` | `impuls` -0.02 | Provisions+ (passiu, baix risc) |
| Marcar Territori | `zone_wild` | `bt_marques_territori` | `sociabilitat` +0.02 | Protecció++ |
| Escorxar i Preparar | `zone_home` | `bt_punta_llanca` | `intel·lecte` -0.01 | Pells+ (processa la caça) |
| Rastreig de Rutes | `zone_forest` | `bt_marques_territori` | `intel·lecte` +0.02 | Protecció+, pot revelar zones |
| Control del Territori | `zone_wild` | `bt_domini_terra` | `impuls` +0.02, `sociabilitat` +0.01 | Protecció+++, Provisions+ |
| Caça de Mamut `[PROPOSTA]` | `zone_wild` | `bt_punta_llanca` + `bt_marques_territori` | `impuls` +0.06 | Provisions++++ (risc extrem, event obligatori) |

### Recol·lector — accions d'habilitat

| Nom | Zona | Prereq | Incl. push | Output principal |
|---|---|---|---|---|
| Mòlta de Grans | `zone_home` | `bt_rasclador_fi` | `intel·lecte` -0.01 | Provisions++ (estable) |
| Recollida de Bolets | `zone_forest` | `bt_coneixement_plantes` | `intel·lecte` -0.02 | Provisions+, Salut+ (risc moderat) |
| Assecament de Plantes | `zone_home` | `bt_coneixement_plantes` | `intel·lecte` -0.01 | Provisions+ (efecte diferit: reserves a llarg termini) |
| Ornamentar-se | `zone_home` | `bt_ornaments` | `espiritualitat` +0.02, `sociabilitat` +0.02 | Benestar++, Vincles+ |
| Observar el Cel Nocturn | `zone_ritual` | `bt_calendari_natural` | `espiritualitat` +0.03, `intel·lecte` +0.01 | Benestar+, cicle predictible |
| Seleccionar Llavors | `zone_home` | `bt_llavor_selectiva` | `intel·lecte` +0.02 | Provisions++ (diferit, prepara el futur) |
| Parar Trampes | `zone_wild` | `bt_trampes` | `impuls` -0.02 | Provisions+ (compartit amb Caçador) |
| Explorar el Bosc en Profunditat | `zone_forest` | `bt_coneixement_plantes` | `intel·lecte` -0.01 | _(pot revelar recursos o events rars)_ |

### Artesà — accions d'habilitat

| Nom | Zona | Prereq | Incl. push | Output principal |
|---|---|---|---|---|
| Façonar Eines de Sílex | `zone_home` | `bt_rasclador_fi` | `intel·lecte` +0.03 | _(modifica output d'altres accions del grup)_ |
| Gravar Os i Ivori | `zone_home` | `bt_buri` | `espiritualitat` +0.02, `intel·lecte` +0.02 | Pells++ via intercanvi |
| Cosir Pells | `zone_home` | `bt_agulla_os` | `intel·lecte` +0.02 | Salut+, Provisions+ via intercanvi |
| Construir Refugi | `zone_home` | `bt_agulla_os` | `sociabilitat` +0.01 | Protecció++ (permanent mentre estiguis a l'era) |
| Millorar les Trampes | `zone_wild` | `bt_trampes` + `bt_rasclador_fi` | `intel·lecte` +0.03 | Millora el roll de "Parar Trampes" permanentment |
| Intercanviar Eines | `zone_wild` | `bt_buri` | `sociabilitat` +0.03 | Provisions+, Vincles++ |
| Preparar Provisions de Reserva | `zone_home` | `bt_agulla_os` | `intel·lecte` +0.01 | Provisions++ (emmagatzemat; resistència a hivern dur) |

### Místic — accions d'habilitat

| Nom | Zona | Prereq | Incl. push | Output principal |
|---|---|---|---|---|
| Curar amb Herbes | `zone_home` | `bt_guariment_plantes` | `espiritualitat` +0.03 | Salut++ (sense risc) |
| Pintar les Parets | `zone_ritual` | `bt_pintura_rupestre` | `espiritualitat` +0.04 | Benestar++, possibles events rars |
| Narrar les Llegendes | `zone_home` | `bt_pintura_rupestre` | `sociabilitat` +0.04 | Vincles++, Protecció+ |
| Consagrar Ornaments | `zone_ritual` | `bt_ornaments` | `espiritualitat` +0.03, `sociabilitat` +0.02 | Benestar+, Vincles+ |
| Trànsit Nocturn | `zone_ritual` | `bt_calendari_natural` | `espiritualitat` +0.05 | Benestar+++ (risc moderat: fora de nit) |
| Cerimonial de Caça | `zone_ritual` | `bt_guariment_plantes` + `bt_pintura_rupestre` | `espiritualitat` +0.03, `impuls` +0.01 | Millora output de la propera acció de caça del grup |
| Ornamentar-se | `zone_home` | `bt_ornaments` | `espiritualitat` +0.02, `sociabilitat` +0.02 | Benestar++, Vincles+ (compartit amb Recol·lector) |

> **Verificació de viabilitat del Místic**: `Curar amb Herbes` (Salut) + `Ritual del Foc`
> (Benestar+Vincles) + `Narrar les Llegendes` (Vincles+Protecció) cobreixen totes les
> necessitats base sense necessitat de caça. ✓

---

## 7. Events Post-Acció

Cada acció referencia un `event_pool_id`. Els pools compartits permeten reutilitzar
events entre accions similars. Probabilitat base orientativa — a ajustar en playtest.

---

### Pool: `pool_caca` — Caça amb Llança, Emboscada Nocturna, Espiar el Ramat

#### `ev_presa_inesperada` — Presa Inesperada (prob: 0.35)
La presa era més gran del que semblava. Pots arriscar-te a un combat més dur.
- **Força total** _(req: Provisions ≥ 5)_: cost Provisions×3 → Provisions +15, risc Salut -8 (50%)
- **Pren el que pots**: → Provisions +5 (segur)

#### `ev_herida_caca` — Ferida en la Caça (prob: 0.25)
Un dent, una banya. No és greu, però et fa mal.
- **Curar-se al campament** _(req: bt_guariment_plantes)_: → Salut -3 (mitiga)
- **Continuar sense aturar-se**: → Salut -10, Provisions +5 (ignores el dolor)

#### `ev_ramat_fuig` — El Ramat Fuig (prob: 0.30)
La presa ha detectat la teva presència i ha fugit. Cicle de caça magre.
- **Perseguir** _(req: impuls ≥ 0.3)_: → 50% Provisions +8 / 50% Provisions +0 + Salut -5
- **Tornar al campament**: → Provisions +2 (el mínim del dia)

#### `ev_rastres_depredador` — Rastres d'un Depredador (prob: 0.20)
Petjades fresques. Hi ha alguna cosa gran per aquí.
- **Seguir el rastre** _(req: impuls ≥ 0.4)_: inclination `impuls +0.03`, → Provisions +20 (50%) / Salut -20 (50%)  `chain_pool: pool_caca`
- **Evitar la zona**: → Protecció -5 (zona menys segura temporalment)

#### `ev_caça_perfecta` — La Caçada Perfecta ⭐ (prob: 0.08, `is_rare: true`)
Tot ha anat com havia d'anar. La presa era gran, l'angle era perfecte, el grup ha actuat com un sol cos.
- **Celebrar al campament** _(opció única)_: → Provisions +25, Benestar +10, Vincles +5. `narrative_tag: cacada_perfecta`

---

### Pool: `pool_trampes` — Parar Trampes, Millorar Trampes

#### `ev_trampa_buida` — Trampa Buida (prob: 0.40)
Res a la trampa. Potser l'animal ho ha olorat.
- **Reposicionar** _(req: intel·lecte ≤ 0.1 o bt_marques_territori)_: → proper cicle +15% output trampa
- **Deixar-ho estar**: → Provisions +1 (mínim)

#### `ev_animal_inesperat` — Animal Inesperat a la Trampa (prob: 0.30)
No és el que esperaves — però és menjar.
- **Quedar-te'l**: → Provisions +6, Benestar +3
- **Alliberar-lo** _(opcio místic, req: espiritualitat ≥ 0.2)_: → Benestar +8, inclination `espiritualitat +0.02`

#### `ev_trampa_trencada` — La Trampa Trencada (prob: 0.25)
Alguna cosa grossa ha passat per aquí i ha trencat el llaç. Preocupant.
- **Inspeccionar els voltants**: → Protecció -5, 30% descobreix `ev_rastres_depredador` encadenat
- **Ignorar-ho**: → Provisions +0 aquest cicle

#### `ev_aprenent_trampes` — Un Jove Aprenent (prob: 0.20)
Un membre jove del grup t'ha seguit i observa com pares les trampes.
- **Ensenyar-li**: → Vincles +8, proper cicle `bt_trampes` millor efecte (temporal)
- **Continuar sol**: → Provisions +3

---

### Pool: `pool_recollecta` — Recol·lectar Arrels, Buscar Fruits, Mòlta de Grans, Assecament

#### `ev_zona_rica` — Zona Rica (prob: 0.30)
Has trobat un indret especialment productiu. Pots quedar-te a explotar-lo.
- **Quedar-t'hi un bon rato**: → Provisions +12
- **Marcar-lo per tornar-hi** _(req: bt_marques_territori)_: → Provisions +6, proper cicle +20% output en aquesta zona

#### `ev_planta_desconeguda` — Planta Desconeguda (prob: 0.25)
Has trobat quelcom que no havies vist. Podria ser útil o podria ser tòxic.
- **Tastar-la** _(risc)_: → 60% Provisions +8, Salut +3 / 40% Salut -12
- **Portar-la al místic** _(req: bt_guariment_plantes actiu al grup)_: → Salut +5, Benestar +3, pot desbloquejar event rar
- **Deixar-la**: → Provisions +2

#### `ev_rastres_altres` — Rastres d'Altres (prob: 0.20)
Algú altre recol·lectava aquí recentment. Potser hi ha competència.
- **Seguir ràpid i acabar primer**: inclination `impuls +0.02` → Provisions +8
- **Esperar i observar**: inclination `sociabilitat +0.02` → 50% contacte amistós (Vincles +5) / 50% res

#### `ev_bosc_parla` — El Bosc Parla ⭐ (prob: 0.10, `is_rare: true`, `req: espiritualitat ≥ 0.15`)
Mentre recol·lectaves, un moment de quietud absoluta. Quelcom ha canviat en com veus el món.
- **Romandre en silenci** _(opció única)_: → Benestar +12, inclination `espiritualitat +0.04`. `narrative_tag: bosc_parla`

---

### Pool: `pool_ritual` — Ritual del Foc, Pintar les Parets, Narrar Llegendes, Cerimonial

#### `ev_grup_sareplega` — El Grup S'Arreplega (prob: 0.35)
Altres membres del grup s'han acostat espontàniament al ritual. El cercle creix.
- **Deixar-los participar**: → Vincles +10, Benestar +5, inclination `sociabilitat +0.02`
- **Continuar sol**: → Benestar +8 (menys, però més intens)

#### `ev_esceptic` — L'Escèptic (prob: 0.25)
Un membre del grup qüestiona públicament el valor del que fas. Tensió.
- **Argumentar amb paraules** _(req: sociabilitat ≥ 0.2)_: → Vincles -3, 60% convèncer (Vincles +8) / 40% tensió persistent
- **Ignorar-lo**: → Benestar +3, Vincles -5
- **Invitar-lo a provar** _(req: bt_pintura_rupestre)_: → Vincles +5, inclination `sociabilitat +0.03`

#### `ev_visio` — Visió (prob: 0.15, `req: espiritualitat ≥ 0.30`)
Durant el ritual, una imatge nítida. Un animal, un lloc, un signe.
- **Seguir la visió**: → Benestar +15, inclination `espiritualitat +0.05`, `chain_pool: pool_explorar`
- **Guardar-la per tu**: → Benestar +10

#### `ev_foc_parla` — El Foc Parla ⭐ (prob: 0.08, `is_rare: true`, `req: espiritualitat ≥ 0.40`)
Les flames han dibuixat formes que tots han vist. Ningú no ho oblidarà.
- **Interpretar les flames** _(opció única, req: bt_pintura_rupestre)_: → Benestar +20, Vincles +15, inclination `espiritualitat +0.06`. `narrative_tag: foc_parla`
- **Deixar que el moment parli**: → Benestar +15, Vincles +10

#### `ev_canco_antiga` — La Cançó que Ningú Recorda (prob: 0.20)
Mentre narres, en surt una melodia que no sabies que coneixies. Ha sortit sola.
- **Cantar fins al final**: → Vincles +12, Benestar +6
- **Ensenyar-la al grup**: → Vincles +8, Benestar +4, proper cicle Vincles +5

---

### Pool: `pool_artesania` — Façonar Eines, Cosir Pells, Gravar Os, Construir Refugi

#### `ev_eina_excepcional` — Eina de Qualitat Excepcional (prob: 0.20)
La pedra era perfecta, el tall ha sortit net. Has creat alguna cosa realment bona.
- **Quedar-te-la**: → proper cicle acció de caça/trampa output ×1.3 (temporal)
- **Oferir-la en intercanvi** _(req: bt_buri)_: → Provisions +12, Vincles +8

#### `ev_material_deficient` — Material Deficient (prob: 0.35)
La pedra tenia una fractura oculta. Resultat per sota del normal.
- **Tornar a buscar material** _(cost: Provisions×3)_: → output normal
- **Treballar amb el que hi ha**: → output -30%, Salut -2

#### `ev_aprenent_artesa` — Un Jove Observa (prob: 0.25)
Un membre jove s'ha assegut al teu costat i et mira treballar amb admiració.
- **Deixar-li provar**: → Vincles +6, 30% millora futura (temporal)
- **Continuar sol**: → output +5% (no perds temps ensenyant)

#### `ev_descobriment_tecnic` — Descobriment per Accident ⭐ (prob: 0.10, `is_rare: true`)
Mentre treballaves, has fet quelcom que mai havies fet. Una tècnica nova, inesperada.
- **Documentar-ho** _(req: bt_buri)_: → Benestar +10, inclination `intel·lecte +0.04`, `narrative_tag: descobriment_tecnic`
- **Incorporar-ho instintivament**: → output +20% proper cicle, inclination `intel·lecte +0.02`

---

### Pool: `pool_social` — Vigilar Campament, Intercanviar Eines, Ornamentar-se

#### `ev_disputa` — Disputa al Campament (prob: 0.30)
Dos membres del grup han discutit per recursos. L'ambient és tens.
- **Mediar** _(req: sociabilitat ≥ 0.2)_: → Vincles -3, 70% resolució (Vincles +10) / 30% empitjora
- **Prendre partit**: → Vincles +5 amb un subgrup, Vincles -8 global
- **Ignorar-ho**: → Vincles -5, Protecció -3 (conflicte sense resoldre)

#### `ev_nouvingut` — Un Estranger al Campament (prob: 0.20)
Ha aparegut algú d'un altre grup. Vine sol, sembla pacífic.
- **Oferir menjar** _(cost: Provisions×5)_: → Vincles +10, 40% intercanvi (Provisions +8 o Pells +3)
- **Observar i escoltar**: inclination `sociabilitat +0.02` → Vincles +3, possible intel·ligència
- **Fer-lo fora** _(req: impuls ≥ 0.3)_: → Protecció +5, Vincles -8

#### `ev_historia_del_grup` — La Història que Tots Recorden ⭐ (prob: 0.08, `is_rare: true`)
Mentre narres, el grup calla d'una forma que no havies vist mai. Tots estan escoltant de debò.
- **Arribar fins al final** _(opció única)_: → Vincles +20, Benestar +12, inclination `sociabilitat +0.05`. `narrative_tag: historia_grup`

#### `ev_aliança` — Proposta d'Aliança (prob: 0.12, `req: vincles ≥ 50`)
Un grup veí ha enviat un missatger. Volen establir un acord de col·laboració.
- **Acceptar** _(cost: Provisions×8)_: → Vincles +15, Protecció +10, proper era pressió territorial reduïda
- **Negociar** _(req: sociabilitat ≥ 0.3)_: → Vincles +10, Protecció +5, cost menor
- **Declinar educadament**: → Vincles +2 (respecte mutu), res més

---

### Pool: `pool_explorar` — Explorar els Voltants, Rastreig de Rutes, Observar el Cel

#### `ev_pas_desconegut` — Un Pas Desconegut (prob: 0.30)
Has trobat una ruta que no apareixia als teus rastres habituals. Porta cap a on no saps.
- **Seguir-la** _(req: impuls ≥ 0.2)_: → 50% descubres zona/recurs / 50% Provisions -5 (perdut i tornant)
- **Marcar-la per tornar** _(req: bt_marques_territori)_: → proper cicle +40% explorar

#### `ev_ossada` — Ossada d'un Animal Gran (prob: 0.25)
Les restes d'un mamut o ós de les cavernes. Queden coses aprofitables.
- **Extreure'n material** _(req: bt_rasclador_fi)_: → Pells +3, output artesania proper cicle millor
- **Deixar-ho intacte** _(req: espiritualitat ≥ 0.2)_: → Benestar +5, inclination `espiritualitat +0.02`
- **Agafar el que hi ha**: → Provisions +4

#### `ev_lloc_elevat` — Des Dalt del Turó (prob: 0.20)
Has pujat a un punt elevat. Des d'aquí pots veure tot el territori.
- **Memoritzar el paisatge**: → Protecció +8, Provisions +4 (coneixes millor on caçar)
- **Buscar senyal de ramats**: → 60% Provisions +6 (coneixes on és la caça)

---

### Events de Descoberta (`is_discovery_event: true`)

Variants narratives disfressades dins dels pools normals. Apareixen ÚNICAMENT
quan el jugador és elegible per a la branch tech referenciada. D'un sol ús.

#### En `pool_caca` — descobreix `bt_punta_llanca`

**`ev_desc_caca_llancador`** (prob: 0.18, `req: bt_punta_llanca eligible`)
Mentre espies el ramat, veus de lluny un caçador d'un altre grup. Llança
una pedra amb un pal llarg i abat la presa des d'una distància increïble.
- **Apropar-te a observar** _(cost: Provisions×2)_: → `unlocks: bt_punta_llanca`
- **Seguir el teu camí**: → Provisions +2

#### En `pool_recollecta` — descobreix `bt_rasclador_fi`

**`ev_desc_rasclador`** (prob: 0.18, `req: bt_rasclador_fi eligible`)
Recolles arrels prop d'un grup estranger. Una dona rasca una arrel amb
un fragment de sílex molt fi que mai no havies vist —surt una polpa perfecta.
- **Preguntar-li com ho fa** _(cost: Provisions×2)_: → `unlocks: bt_rasclador_fi`
- **Continuar amb la teva tècnica**: → Provisions +2

#### En `pool_artesania` — descobreix `bt_agulla_os`

**`ev_desc_agulla`** (prob: 0.18, `req: bt_agulla_os eligible`)
Mentre talles os, un fragment llarg i fi queda perfectament aguillonat.
Un membre del grup el recull i pensa en veu alta: *"Amb un forat aquí..."*
- **Experimentar plegats** _(cost: Provisions×2)_: → `unlocks: bt_agulla_os`
- **Deixar-ho per a un altre moment**: → output +1 (el fragment és útil igualment)

#### En `pool_ritual` — descobreix `bt_guariment_plantes`

**`ev_desc_herbes`** (prob: 0.18, `req: bt_guariment_plantes eligible`)
Durant el ritual, un vell del grup crema certes herbes que no has vist
mai cremar. Olora diferent. Sembla que algú amb mal de ventre s'ha millorat.
- **Demanar-li que t'ho expliqui**: → `unlocks: bt_guariment_plantes`
- **Observar en silenci**: → Benestar +2

#### En `pool_social` — descobreix `bt_ornaments`

**`ev_desc_ornaments`** (prob: 0.18, `req: bt_ornaments eligible`)
L'estranger que ha visitat el campament porta closques foradades lligades
al coll. Tothom els mira. L'home somriu i te n'ofereix un.
- **Acceptar-lo i preguntar-li** _(cost: Provisions×3)_: → `unlocks: bt_ornaments`
- **Agrair-ho però declinar**: → Vincles +3

#### En `pool_ritual` — descobreix `bt_pintura_rupestre`

**`ev_desc_pintura`** (prob: 0.15, `req: bt_pintura_rupestre eligible`)
En un moment de meditació prop d'una paret de roca, veus les ombres que
fa el foc. Per un instant, sembles veure-hi formes d'animals. Ningú més ha
estat aquí.
- **Intentar fixar les formes amb fang**: → `unlocks: bt_pintura_rupestre`
- **Guardar el moment per tu**: → Benestar +5, inclination `espiritualitat +0.02`

---

## 8. Events de Pressió del Món

### Event 1 — Migració del Gran Ramat

- **ID**: `pe_migracio_ramat`
- **Nom**: Migració del Gran Ramat
- **Descripció**: Els ramats han seguit les pastures cap al nord. La caça es torna escassa.
- **Trigger**: `periodic`, prob. 0.20/cicle, `min_era_cycle: 3`
- **Bloqueig**: `security ≥ 50` (territori conegut i marcat)
- **Efecte**: Provisions -20. Opció: gastar Provisions×10 per seguir el ramat (un cicle fora; events encadenats de caça).
- **Base**: Les migracions de rens i mamuts eren el centre de l'economia de caça. Grups humans seguien els ramats o caient en escassetat.

### Event 2 — L'Estació dels Ossos (hivern dur)

- **ID**: `pe_hivern_dur`
- **Nom**: L'Estació dels Ossos
- **Descripció**: Una onada de fred inusual cau sobre el territori. Les reserves s'esgoten més de pressa.
- **Trigger**: `scheduled`, `at_cycle: 5` (primer hivern dur)
- **Bloqueig**: Salut ≥ 60 (grup saludable resisteix millor)
- **Efecte**: Provisions -25, Salut -10. Opció: gastar Provisions×15 per evitar la pitjor part (+5 Salut).
- **Base**: El Darrer Màxim Glacial (26.500–19.000 BP) era el context climàtic del Paleolític Superior. Els hiverns podien ser letals per a grups sense reserves.

### Event 3 — La Font s'Asseca

- **ID**: `pe_sequera`
- **Nom**: La Font s'Asseca
- **Descripció**: La principal font d'aigua del territori s'ha assecat. Cal trobar alternatives.
- **Trigger**: `conditional`, quan Provisions < 40
- **Bloqueig**: Protecció ≥ 40 (coneixement del territori)
- **Efecte**: Provisions -15, Vincles -10. Opció: gastar Provisions×8 per descobrir nova font (si `zone_forest` no descoberta, la descobreix).
- **Base**: Les sequeres periòdiques forçaven desplaçaments. Molts canvis de jaciment arqueològic es relacionen amb canvis hidrològics.

### Event 4 — La Febre del Campament

- **ID**: `pe_malaltia`
- **Nom**: La Febre del Campament
- **Descripció**: Un membre del grup ha caigut malalt. Si no s'actua, la malaltia s'estendrà.
- **Trigger**: `periodic`, prob. 0.15/cicle, `min_era_cycle: 4`
- **Bloqueig**: Místic actiu amb `bt_guariment_plantes` (bloqueja automàticament — narrativament coherent)
- **Efecte**: Salut -20, Vincles -5. Opció A (Provisions×8): guariment ràpid. Opció B (esperar): 50% guariment natural / 50% Salut -10 addicional.
- **Base**: Infeccions bacterianes afectaven els grups del Paleolític. L'evidència de cures (restes amb lesions curades, herbes medicinals) és àmpliament documentada.

### Event 5 — Estrangers a la Vora

- **ID**: `pe_conflicte_territorial`
- **Nom**: Estrangers a la Vora
- **Descripció**: Un altre grup ha establert camp prop del vostre territori de recol·lecció.
- **Trigger**: `periodic`, prob. 0.12/cicle, `min_era_cycle: 6`
- **Bloqueig**: Protecció ≥ 60 (territori ben delimitat)
- **Efecte base**: Provisions -10 (recursos compartits). Tres opcions de resposta:
  - **Confrontació** (`impuls_delta: +0.03`, Protecció +15, risc Salut -15)
  - **Negociació** (`sociabilitat_delta: +0.03`, Vincles +10, cost Provisions×5)
  - **Retirada** (`impuls_delta: -0.02`, Protecció -10, evita conflicte)
- **Base**: Conflictivitat territorial documentada arqueològicament (puntes incrustades en cossos). Intercanvi pacífic també documentat (sílex i closques marines a centenars de km).
- **Nota disseny**: L'event que millor empenta `impuls` i `sociabilitat`. Les tres opcions generen inclinacions radicalment distintes.

### Event 6 (Rar) — El Cel Es Tanca

- **ID**: `pe_hivern_volcanic`
- **Nom**: El Cel Es Tanca
- **`is_rare`: true**
- **Descripció**: Durant setmanes, el sol no brilla amb força. Les plantes s'apaguen. Un fred que no és d'hivern.
- **Trigger**: `scheduled`, `at_cycle: 7`, prob. 0.30 (no garantit)
- **Bloqueig**: cap (event climàtic no blocat)
- **Efecte**: Provisions -30, Salut -15, Benestar -20. Opció (si tens `bt_pintura_rupestre`): ritual col·lectiu que mitiga Benestar -10.
- **Base**: Episodis volcànics (com la teoria Toba, ~74.000 BP) creaven hiverns volcànics regionals. Els humans sobrevivien adaptant-se. Clímax emocional de l'era.

---

## 9. Títols de Dinastia (Era 1)

> `[PENDENT]` — condicions exactes a definir. Orientació:

| ID | Nom `[PROPOSTA]` | Raritat | Condicions orientatives |
|---|---|---|---|
| `title_gran_cacador` | El Gran Caçador | `common` | Completar era amb `impuls ≥ 0.5` com a eix dominant |
| `title_guardiana` | La Guardiana del Bosc | `common` | Completar era amb `intel·lecte ≤ -0.3` i recol·lector actiu |
| `title_forjador` | El Forjador | `uncommon` | Desbloquejar les 3 branch techs de l'Artesà |
| `title_xaman` | El Xaman del Clan | `uncommon` | Descobrir `bt_calendari_natural` (hidden) + `bt_guariment_plantes` (hidden) |
| `title_guerrer_xaman` | Guerrer i Xaman | `rare` | Tenir actives simultàniament branques hunter + mystic |
| `title_llavor` | El Qui Porta la Llavor | `legendary` | `[PENDENT]` — condició molt específica lligada a `bt_llavor_selectiva` + era completada amb `intel·lecte ≥ 0.3` |

---

## 10. Badges (Era 1)

> `[PENDENT]` — distribució orientativa: 4 `discovery` + 2 `path` + 2 `combination` + 1 `efficiency` + 1 `meta`

| ID `[PROPOSTA]` | Nom | Categoria | Condició orientativa |
|---|---|---|---|
| `badge_primera_llanca` | Primera Llança | `discovery` | Desbloquejar `bt_punta_llanca` per primera vegada |
| `badge_lloc_sagrat` | El Lloc Sagrat | `discovery` | Descobrir `zone_ritual` en qualsevol partida |
| `badge_calendari` | Llegidor de Llunes | `discovery` | Descobrir `bt_calendari_natural` (hidden) |
| `badge_guariment` | La Planta que Cura | `discovery` | Descobrir `bt_guariment_plantes` (hidden) |
| `badge_cami_xaman` | El Camí del Xaman | `path` | Completar una era en branca mystic pur (`espiritualitat ≥ 0.6`) |
| `badge_cami_solitari` | El Caçador Solitari | `path` | Completar una era amb `sociabilitat ≤ -0.3` |
| `badge_hibrid` | Dues Natures | `combination` | Tenir actives dues branques simultàniament |
| `badge_tots_els_ponts` | Constructor de Ponts | `combination` | Desbloquejar els 5 ponts en qualsevol nombre de partides |
| `badge_sense_caça` | Sense Derramar Sang | `efficiency` | Completar era sense executar mai "Caça amb Llança" ni "Emboscada Nocturna" |
| `badge_col_leccio` | `[PENDENT]` | `meta` | Desbloquejar tots els altres badges de l'Era 1 |

---

## 11. Checklist de Completesa del Contingut

Abans de passar a implementació, aquest document ha d'estar complet:

- [x] Noms definitius de les 4 branques validats
- [x] Condicions d'inclinació de les 4 branques definides
- [x] Cadència de tecnologies universals validada (cicles 2, 4, 6, 9, 12)
- [x] Noms de les 13 tecnologies de branca definits
- [x] Efectes passius de les 13 branch techs especificats (§4b) — 5 actius, 8 null, format parametritzat
- [x] 4 zones amb condicions de descoberta validades
- [x] ~32 accions definides (7 base + 8+8+7+7 per branca)
- [x] 6 events de pressió del món definits (1 rar inclòs)
- [x] Pools d'events post-acció: 7 pools, 29 events post-acció (6 rars marcats ⭐)
- [ ] 6 títols de dinastia amb condicions exactes
- [ ] 10 badges amb condicions exactes
- [ ] Recurs secundari (Pells) confirmat o descartat
- [ ] Mapa de transició Era 1 → Era 2 (un cop l'Era 2 tingui les seves branques)
