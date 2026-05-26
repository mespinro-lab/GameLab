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

## 7. Events de Pressió del Món

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

## 8. Títols de Dinastia (Era 1)

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

## 9. Badges (Era 1)

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

## 10. Checklist de Completesa del Contingut

Abans de passar a implementació, aquest document ha d'estar complet:

- [x] Noms definitius de les 4 branques validats
- [x] Condicions d'inclinació de les 4 branques definides
- [x] Cadència de tecnologies universals validada (cicles 2, 4, 6, 9, 12)
- [x] Noms de les 13 tecnologies de branca definits
- [ ] Efectes de cada tecnologia de branca especificats completament (action_modifiers, indicator_modifiers)
- [x] 4 zones amb condicions de descoberta validades
- [x] ~32 accions definides (7 base + 8+8+7+7 per branca)
- [x] 6 events de pressió del món definits (1 rar inclòs)
- [ ] Pools d'events post-acció per a cada acció (mínim 15–20 events post-acció)
- [ ] 6 títols de dinastia amb condicions exactes
- [ ] 10 badges amb condicions exactes
- [ ] Recurs secundari (Pells) confirmat o descartat
- [ ] Mapa de transició Era 1 → Era 2 (un cop l'Era 2 tingui les seves branques)
