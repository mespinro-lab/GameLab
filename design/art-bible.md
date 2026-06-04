# Life Tycoon 2 — Art Bible

**Versió**: 1.0  
**Data**: 2026-06-02  
**Responsable**: Art Director  
**Plataforma**: iOS + Android (portrait, 9:16)  
**Engine**: Godot 4.6 + GDScript  
**Eina d'assets**: Recraft AI v4.1 (personatges i entorns) + edició manual

> **Propòsit d'aquest document**: és la font de veritat visual del projecte.
> Tota decisió d'asset, UI i composició ha de ser coherent amb el que hi ha
> definit aquí. En cas de dubte, aquest document guanya.

---

## Índex

1. [Pilars Visuals](#1-pilars-visuals)
2. [Estil i Proporcions](#2-estil-i-proporcions)
3. [Paletes de Color per Era](#3-paletes-de-color-per-era)
4. [Composició per Capes (Godot 4)](#4-composicio-per-capes-godot-4)
5. [Especificacions d'Assets](#5-especificacions-dassets)
6. [Disseny de UI](#6-disseny-de-ui)
7. [Jerarquia Visual i Llegibilitat](#7-jerarquia-visual-i-llegibilitat)
8. [Decisions que Necessiten Il·lustrador](#8-decisions-que-necessiten-illustrador)

---

## 1. Pilars Visuals

Tres principis que guien tota decisió visual. Si una proposta visual no pot
justificar-se amb almenys un d'aquests pilars, és una pista que no pertany
al joc.

### 1.1 Càlidament Humà

El joc narra una dinastia humana a través d'eres. L'art ha de reflectir
humanitat: cara a la càmera, expressió llegible, diversitat ètnica honesta.
Cap element visual ha de sentir-se fred, tècnic o distanciat.

- **Implicació**: els personatges sempre porten expressió facial visible i
  positiva (curiosa, contenta, orgullosa). Evitar expressions neutres o
  intimidants tret de contextos molt específics (event de catàstrofe).
- **Implicació**: la paleta global tendeix als tons càlids. El fred s'usa per
  contrast narratiu (perill, hivern, mort), mai com a to base.

### 1.2 Densitat Lleugera

El joc és estratègic i pot tenir molts elements en pantalla (accions, stats,
zones, personatge actiu, inclinació). El repte visual és que res se senti
aclaparador. La solució és la simplicitat formal: formes planes, contorns
clars, molt poc soroll.

- **Implicació**: els assets d'entorn i UI usen flat illustration, no textures
  complexes ni degradats múltiples. Un màxim de 3 plans de color per element.
- **Implicació**: els contorns (outline) estan sempre presents als personatges
  i als elements interactius. Els fons no porten outline (Gestalt: els elements
  amb outline "floten" per sobre i es perceben com a interactius).

### 1.3 Temps Llegible

L'era en curs ha de ser percebuda a cop d'ull sense llegir text. El canvi
d'era és un dels moments emocionals més forts del joc; ha de ser perceptible
fins i tot de reüll.

- **Implicació**: cada era té la seva paleta d'accent (color dominant de la
  UI i dels nodes de zona). El canvi de paleta és el senyal visual d'era.
- **Implicació**: el vestuari i accessoris dels personatges evolucionen de
  manera visible entre eres. No n'hi ha prou que canviïn — han de canviar
  de manera reconeixable (pell/pedra → lli → bronzes → toga).

---

## 2. Estil i Proporcions

### 2.1 Estil General: Chibi Expressiu Pla

L'estil base és **chibi cartoon flat illustration**: proporcions exagerades
(cap gran, cos petit), línies netes, ombres planes sense degradat, colors
saturats però no fluorescents.

Referència principal: `PRE-MED-M` (el primer personatge generat i aprovat
del projecte). Tot asset nou s'ha de poder "creure al costat" d'aquest
personatge sense desentonar.

**No és**: anime pur, realisme, pixel art, watercolor, pastel suau, estil
de joc de guerra.

### 2.2 Proporcions del Personatge Adult

```
Cap     : 40% de l'alçada total
Tors    : 30% de l'alçada total
Cames   : 30% de l'alçada total

Amplada del cap  ≈ 1.2× amplada del tors
Mans             : grans, sense dits individuals definits (puny/silueta)
Peus             : petits, arrodonits
```

Els personatges adults se situen sempre de peu, cos complet, centrats
horitzontalment a la imatge. La postura per defecte és dreta i lleugerament
frontofacial (3/4 o frontal). No s'usen poses de combat ni postures de
tensió com a estat "repòs".

### 2.3 Proporcions del Personatge Infant

```
Cap     : 50% de l'alçada total  (cap més gran que l'adult)
Tors    : 25% de l'alçada total
Cames   : 25% de l'alçada total  (braços i cames curt i gruixuts)
```

Els infants sempre porten una expressió de curiositat o alegria. Sostenent
un objecte petit relacionat amb l'era (pal, pedra, tauleta, joguina d'argila).

### 2.4 Diversitat Ètnica

El joc cobreix la humanitat global. Cada era presenta fins a 6 variants
ètniques per personatge (MED, AFR, IND, ORI, ASI, AME). La diversitat és
un tret narratiu del joc, no decorativa.

**Regla**: cap variant ètnica pot quedar subrepresentada en qualitat, roba,
o accessoris respecte a les altres variants de la mateixa era. Si una variant
porta accessoris distintius, totes en porten (adaptats al seu context cultural).

### 2.5 Nodes de Zona: Vista Cenital

Els nodes de zona del mapa usen **vista cenital (bird's eye view)** estrictament.
Han de seguir la perspectiva i escala del `MAP-PRE.png` de referència. La
zona temàtica ocupa el centre i es fon naturalment cap als marges sense
vores dures.

- Sense marc, sense filet, sense ombra de retall.
- Els nodes son quadrats (1:1).
- El terreny és sempre reconeixible a cop d'ull sense text: herba, bosc,
  foc de campament, cova.

### 2.6 Icones de Stats i Recursos

Icones simples, de lectura immediata a 48×48 dp (mida mínima d'ús en UI).
Fons transparent (PNG amb canal alfa). Línies gruixudes, formes icòniques
universals. L'estil segueix el personatge base (`PRE-MED-M`): chibi, clar,
sense detalls innecessaris.

---

## 3. Paletes de Color per Era

Cada era té una paleta de **4 colors funcionals** + **1 color d'accent**.
La paleta és la identitat visual de l'era.

### 3.1 Sistema de Paleta Funcional

| Rol | Descripció |
|-----|-----------|
| `ERA_BASE` | Color de fons de la pantalla principal d'era |
| `ERA_PANEL` | Color de fons dels panels (zones, cards d'acció) |
| `ERA_TEXT` | Color del text principal (alt contrast sobre ERA_PANEL) |
| `ERA_ACCENT` | Color dominant dels elements interactius (botons, barra d'inclinació, notificacions) |
| `ERA_DANGER` | Color d'alerta (indicadors en perill, events negatius) |

`ERA_DANGER` és constant entre eres: **#D63031** (vermell càlid). Cap altra
cosa usa aquest color. Principi de semafor: el jugador aprèn una vegada i
ja sempre sap que vermell = risc.

### 3.2 Paletes per Era

#### Era 1 — Prehistòria

```
ERA_BASE    #3D2B1F  — marró fosc terra
ERA_PANEL   #5C3D2E  — marró càlid fusta
ERA_TEXT    #F5E6D3  — crema ossos
ERA_ACCENT  #E8A838  — ambre foc
ERA_DANGER  #D63031  — vermell (constant)
```

Temperatura: molt càlida. Textures evocades però renderitzades planes.
El foc i la pedra son la referència emocional.

#### Era 2 — Neolític

```
ERA_BASE    #2D4A3E  — verd fosc terra cultivada
ERA_PANEL   #3D6B5A  — verd herba ombrejat
ERA_TEXT    #E8F0E0  — blanc herba sec
ERA_ACCENT  #8BC34A  — verd brot nou
ERA_DANGER  #D63031
```

Temperatura: freda-neutre. La transició de la cacera a l'agricultura es
llegeix en el verd dominant enfront del marró de la Prehistòria.

#### Era 3 — Edat Antiga

```
ERA_BASE    #1A2744  — blau nit mediterrani
ERA_PANEL   #2A3F6F  — blau cobalte
ERA_TEXT    #F0E8C8  — ivori papir
ERA_ACCENT  #C9A227  — or bronze
ERA_DANGER  #D63031
```

Temperatura: freda però daurada. L'accent d'or reforça la metalurgia i el
comerç com a fites de l'era.

#### Era 4 — Antiguitat Clàssica

```
ERA_BASE    #F5F0E8  — blanc marbre (inversió: fons clar)
ERA_PANEL   #FFFFFF  — blanc pur
ERA_TEXT    #2C2C2C  — gris molt fosc (no negre pur)
ERA_ACCENT  #8B0000  — porpra imperial
ERA_DANGER  #D63031
```

L'Antiguitat Clàssica és l'única era amb fons clar. L'inversió és
intencional: el jugador percep immediatament el canvi d'escala i
civilització. El blanc és el marbre, la toga, la llum mediterrània.

### 3.3 Transicions de Paleta

Quan el joc transita d'una era a la següent, la pantalla de puntuació
d'era i la crònica narrativa fan una dissolució de 0.8s entre les dues
paletes. No hi ha tall brusc.

La transició ha de ser visible però no estrident. Si es nota com un
"flash", és massa ràpida. Si el jugador no la nota, és massa lenta.

### 3.4 Colors d'Inclinació (constants entre eres)

Els 4 eixos d'inclinació tenen colors assignats permanentment. Aquests
colors apareixen a la barra d'inclinació i a qualsevol indicador
d'eix al llarg de tot el joc:

| Eix | Color | Hex | Raó |
|-----|-------|-----|-----|
| `impuls` | Taronja | #F57C00 | Energia, acció immediata |
| `intel·lecte` | Blau | #1976D2 | Fredor, racionalitat |
| `espiritualitat` | Violeta | #7B1FA2 | Místic, profunditat |
| `sociabilitat` | Verd | #388E3C | Creixement, connexió |

Quan un eix és positiu, s'usa el color ple. Quan és negatiu, s'usa una
versió desaturada al 40% del mateix color. El neutre (0) és gris #9E9E9E.

---

## 4. Composició per Capes (Godot 4)

### 4.1 Stack de Capes de l'Escena Principal

L'escena d'era (`era_scene.tscn`) usa el sistema de `CanvasLayer` de Godot
per mantenir la separació visual clara i la rendibilitat del renderitzat.

```
CanvasLayer z=10  — ui_overlay
    ├── HUD (stats, inclinació, recursos)
    ├── event_overlay.tscn (quan actiu)
    └── notification_bar (tecn. universals, alerts)

CanvasLayer z=5   — character_layer
    └── Node2D: character_portrait (retrat procedural per capes)
        ├── Sprite2D: body_base        (cos + pell base)
        ├── Sprite2D: clothing         (vestimenta per era)
        ├── Sprite2D: accessories      (accessoris per era/branca)
        └── Sprite2D: face_expression  (expressió animada)

CanvasLayer z=2   — zone_map_layer
    ├── Node2D: map_background (textura de fons d'era, ERA_BASE)
    └── GridContainer: zone_nodes
        └── [ZONA_ID]: TextureRect (node de zona, vista cenital)

CanvasLayer z=0   — background_layer
    └── ColorRect: era_background_color (ERA_BASE solid fill)
```

### 4.2 Retrat Procedural per Capes

El personatge actiu no és una sola imatge. Es construeix en temps real
combinant sprites independents. Això permet:
- Canviar el vestuari en transicionar d'era sense crear un asset complet nou.
- Animar l'expressió facial de manera independent.
- Afegir accessoris de branca per damunt del cos base.

```
Nomenclatura dels sprites de retrat:
  char_[ERA]_[RACE]_[GENDER]_body.[ext]        ← cos + pell, invariant per era
  char_[ERA]_[RACE]_[GENDER]_clothing.[ext]    ← vestuari canvia per era
  char_[ERA]_[RACE]_[GENDER]_acc_[ITEM].[ext]  ← accessori específic
  char_[ERA]_[RACE]_[GENDER]_face_[EXPR].[ext] ← expressió (happy, worried, proud)
```

**Exemple complet**:
```
char_pre_med_m_body.png
char_pre_med_m_clothing.png
char_pre_med_m_acc_spear.png
char_pre_med_m_face_happy.png
```

**Regla de pivot**: tots els sprites d'un personatge usen el mateix punt
de pivot (centre baix del cos base). Canviar un layer no desplaça els
altres layers.

### 4.3 Animació d'Expressió

Les expressions facials s'animen amb `AnimationPlayer` de Godot usant
interpolació de `modulate.a` (fade entre sprites) o `offset` (micro-
moviment de rebote). No s'usa esquelet ni deformació de malla per mantenir
el cost baix i l'estil pla.

**3 expressions base obligatòries** per cada personatge (adult i infant):

| Expressió | Trigger |
|-----------|---------|
| `face_happy` | Estat per defecte, resultat positiu d'acció |
| `face_worried` | Indicador base (salut, seguretat) per sota del 30% |
| `face_proud` | Descoberta de tecnologia de branca |

Expressions opcionals (post-prototip):
- `face_determined` — execució d'acció d'alt risc
- `face_sad` — mort imminent (últim cicle de vida)

### 4.4 Cards d'Acció

Les `action_card.tscn` usen una composició de 3 zones verticals:

```
┌─────────────────────────┐
│ [ICON 48×48] [NOM]      │  ← capçalera: ERA_ACCENT sobre ERA_PANEL
│ [COST]  [DELTA INKLIN.] │
├─────────────────────────┤
│ Descripció breu         │  ← cos: ERA_TEXT sobre ERA_PANEL
│ (màx 2 línies)          │
├─────────────────────────┤
│ [BASE OUTPUT resumit]   │  ← peu: recursos generats
└─────────────────────────┘
```

Les accions bloquejabes per inclinació insuficient porten un overlay
semitransparent (ERA_PANEL al 60% d'opacitat) per sobre de la card.
No es canvia el color del text — es perd visibilitat per opacitat, no
per recolorat.

Les accions completament ocultes (fora del rang d'inclinació) simplement
no existeixen al DOM/node tree. No hi ha placeholder buit ni "???" com a
card (les accions [???] a les dades son les secretes desbloquejables per
branch tech, i apareixeran com a cards especials quan es descobreixin).

---

## 5. Especificacions d'Assets

### 5.1 Personatges (Retrats per Capes)

| Paràmetre | Valor |
|-----------|-------|
| Format | PNG amb canal alfa |
| Resolució base | 512×512 px per capa (body, clothing, accessories) |
| Resolució cara | 256×256 px (face_expression) |
| Rati | 1:1 (quadrat) |
| Color profile | sRGB |
| Fons | Transparent (eliminat amb remove.bg) |
| Generació | Recraft AI v4.1, style reference PRE-MED-M o variant de la mateixa raça |

**Nomenclatura de fitxer**:
```
char_[era]_[race]_[gender]_[layer].[ext]
char_[era]_[race]_[gender]_[layer]_[variant].[ext]  ← per expressions i accessoris

era     : pre | neo | ant | cla | ...
race    : med | afr | ind | ori | asi | ame
gender  : m | f | c (child)
layer   : body | clothing | acc | face
variant : happy | worried | proud | spear | basket | ...

Exemple: char_cla_ori_f_face_proud.png
```

### 5.2 Nodes de Zona

| Paràmetre | Valor |
|-----------|-------|
| Format | PNG amb canal alfa |
| Resolució | 1024×1024 px |
| Rati | 1:1 |
| Color profile | sRGB |
| Perspectiva | Bird's eye view (cenital) |
| Estil de ref | MAP-PRE.png (generat ChatGPT, aprovat) |
| Fons | Blanc → eliminar amb remove.bg (soft edges) |

**Nomenclatura de fitxer**:
```
env_[era]_[zone]_node.png

Exemple: env_pre_forest_node.png
         env_neo_farm_node.png
         env_cla_forum_node.png
```

### 5.3 Icones de Stats i Recursos

| Paràmetre | Valor |
|-----------|-------|
| Format | PNG amb canal alfa |
| Resolució màster | 512×512 px |
| Mida d'ús en UI | 48×48 dp (drawable a 48dp, 72dp, 96dp per DPI) |
| Color profile | sRGB |
| Estil | Chibi monocrom (tintable per codi si cal) |
| Fons | Transparent |

**Nomenclatura de fitxer**:
```
ui_icon_[stat]_[variant].png

stat    : health | happiness | security | social | food | wealth | ...
variant : default | active | danger (per stats en perill)

Exemple: ui_icon_health_default.png
         ui_icon_health_danger.png
```

### 5.4 Icones d'Eixos d'Inclinació

Les icones d'inclinació son les mateixes entre eres però es tintegen
amb el color de l'eix (`modulate` a Godot). Generar en blanc (blanc pur
sobre transparent): el codi aplica el color de l'eix per damunt.

```
ui_icon_axis_impuls.png         → tint #F57C00 (taronja)
ui_icon_axis_intel·lecte.png    → tint #1976D2 (blau)
ui_icon_axis_espiritualitat.png → tint #7B1FA2 (violeta)
ui_icon_axis_sociabilitat.png   → tint #388E3C (verd)
```

### 5.5 Fons d'Era (Background)

El fons d'era és un `ColorRect` pur amb `ERA_BASE`. No s'usa imatge de
fons en MVP per mantenir la llegibilitat i el rendiment. Si en una fase
de polish es vol afegir una textura subtil, ha de tenir opacitat màxima
del 10% sobre `ERA_BASE` i no pot tenir elements figuratius (res que
competeixi amb el retrat del personatge o els nodes de zona).

### 5.6 Budgets de Resolució per Escena

| Categoria | Límit |
|-----------|-------|
| Sprites de personatge en memòria | 6 capes × 512px = ~3MB per personatge actiu |
| Nodes de zona en escena | Màx 6 nodes × 1024px → redimensionar a 256×256 en runtime (Godot Import settings) |
| Icones de stats/recursos | 48px en ús; asset a 512px per DPI alts |
| Total textures per escena | < 32 MB descomprimides en memòria |

---

## 6. Disseny de UI

### 6.1 Principis de UI

**Tipografia sobre color**: tots els textos han de passar un contrast mínim
de 4.5:1 (WCAG AA) sobre el seu fons. Usar `ERA_TEXT` sobre `ERA_PANEL`
garanteix sempre el contrast per disseny.

**Touch targets**: tota àrea interactiva (botons, cards, nodes de zona)
ha de tenir una mida mínima tocable de 48×48 dp. Els elements visuals
poden ser menors, però l'àrea de toc sempre ha de ser 48dp mínim.

**Densitat de pantalla**: el joc és portrait, 9:16. La pantalla principal
d'era ha de funcionar des de 360px d'ample (Android baix). Cap element
horitzontal pot ser mai ample fix de més de 320px.

### 6.2 Jerarquia Visual de la Pantalla Principal d'Era

```
PANTALLA PRINCIPAL D'ERA (portrait, 9:16)
─────────────────────────────────────────
[ ZONA ACTIVA — 40% alçada ]
  Nom de la zona + node cenital gran
  Accions disponibles en scroll horitzontal

[ PERSONATGE — 25% alçada, superposat al marge inferior de la zona ]
  Retrat procedural per capes
  Nom + era + branca activa (text petit)

[ STATS I RECURSOS — 20% alçada ]
  Fila d'icones de stats base (health, happiness, security, social)
  Fila d'icones de recursos (menjar, riquesa... era-named)

[ INCLINACIÓ — 10% alçada ]
  4 barres d'eixos en horitzontal (colors per eix)
  Branca activa mostrada com a etiqueta sobre la barra dominant

[ BARRA NAVEGACIÓ — 5% alçada ]
  Icones: Mapa de zones | Genealogia | Badges | Menú
─────────────────────────────────────────
```

El personatge és l'element de major jerarquia emocional: ocupa el límit
entre la zona i els stats, creuant les dues bandes, per actuar de pont
visual entre "el món" (zones) i "el ser" (stats).

### 6.3 Colors Semàntics de la UI (constants entre eres)

| Ús | Color | Hex |
|----|-------|-----|
| Botó primari (acció comprar/executar) | `ERA_ACCENT` de l'era | varia |
| Botó desactivat | Gris | #9E9E9E |
| Indicador en perill (< 30%) | `ERA_DANGER` | #D63031 |
| Notificació positiva (tec. desbloquejada) | Or | #FFB300 |
| Text d'ajuda/secundari | `ERA_TEXT` al 60% opacitat | varia |
| Overlay d'event | Negre al 70% + panel ERA_PANEL centrat | — |

### 6.4 Pantalla d'Overlay d'Event

L'overlay d'event és el moment de màxima atenció del jugador. La composició:

```
┌──────────────────────────────┐
│  [NOM DE L'EVENT]            │  ← títol gran, ERA_ACCENT
│  ─────────────────────────── │
│  [TEXT NARRATIU]             │  ← 3-4 línies màxim, ERA_TEXT
│                              │
│  [PERSONATGE — petit, 3/4]   │  ← expressió rellevant a l'event
│                              │
│  [OPCIÓ A]  [OPCIÓ B]        │  ← botons grans, 48dp alçada mínima
└──────────────────────────────┘
```

L'overlay usa Negre al 70% sobre la pantalla anterior per crear context
de "pausa" sense eliminar completament el fons.

### 6.5 Pantalla de Puntuació d'Era

La pantalla de puntuació d'era és el moment de reflexió. Ha de sentir-se
solemne però accessible. Composició:

- Fons transitat a la paleta de la nova era (si n'hi ha) o fade out de
  l'era actual.
- Títol gran: nom del títol obtingut (en `ERA_ACCENT` de l'era acabada).
- Desglossament de punts per categoria (tecns. de branca, events rars,
  eficiència, reputació): cada línia amb la seva icona i color de categoria.
- Botons: "Veure Crònica" (primari) i "Continuar" (secundari, text simple).

### 6.6 Tipografia

**Font body**: inter-plataforma sans-serif de sistema (San Francisco en iOS,
Roboto en Android). Godot 4 carrega `ThemeDB` amb la font del sistema.

**Mides de font (dp)**:
```
Títols de pantalla    : 22dp bold
Títols de card/zona   : 16dp semibold
Cos de text           : 14dp regular
Text secundari/ajuda  : 12dp regular
Números de stat/recurs: 14dp bold (monoespai opcional per alineació)
```

**No usar fonts decoratives** (no lletra manuscrita, no serif elaborat).
La llegibilitat a mides petites és prioritat absoluta en mobile.

---

## 7. Jerarquia Visual i Llegibilitat

### 7.1 Principi Gestalt aplicat

**Similitud**: tots els elements tocables (cards d'acció, nodes de zona,
botons) porten outline negre de 2px. Els elements purament informatius
(stats, inclinació) no porten outline. El jugador aprèn en 30 segons
"si té vora negra, es pot tocar".

**Proximitat**: els stats base (salut, felicitat...) son visuals sempre
junts. Els recursos (menjar, riquesa...) formen un grup visual separat.
L'agrupació per proximitat comunica la jerarquia del sistema (indicadors
base > necessitats > recursos).

**Figura-fons**: el personatge actiu és sempre l'element de figura sobre
qualsevol fons. El retrat procedural porta drop shadow suau (3px, negre
al 30%) per separar-lo del node de zona que hi ha darrere.

### 7.2 Flow Visual en Pantalla Principal

L'ull del jugador ha de seguir aquest camí sense esforç:

```
1. PERSONATGE (centre emocional, element de figura)
      ↓
2. ZONA ACTIVA (context del món, on estic)
      ↓
3. ACCIONS DISPONIBLES (scroll horitzontal; "què puc fer")
      ↓
4. STATS (perifèric, sempre visible però no dominant)
      ↓
5. INCLINACIÓ (la menys urgent; consulta deliberada)
```

Si en un test d'usuari el primer element que l'ull troba no és el
personatge o la zona activa, la composició s'ha de revisar.

### 7.3 Alertes i Urgència Visual

El sistema d'urgència usa 3 nivells, cadascun amb el seu senyal visual
exclusiu:

| Nivell | Senyal | Trigger |
|--------|--------|---------|
| Informatiu | Punt verd sobre icona (badge verd #4CAF50) | Nova tecnologia disponible |
| Atenció | Icona amb pols (escala 1.0→1.1, 1s loop) | Stat entre 30-10% |
| Crític | Icona vermella (#D63031) + vibració de pantalla (shake 2px, 0.3s) | Stat < 10% |

**Regla del semàfor**: el vermell `ERA_DANGER` (#D63031) s'usa ÚNICA I
EXCLUSIVAMENT per a alertes crítiques. Cap altre element del joc
(incloent decoració, branques, avatars) usa un vermell similar.
Excepcions: sangoneres de l'era medieval (futura), que usaran un vermell
molt fosc (#8B0000) per diferenciar-se.

### 7.4 Accessibilitat de Color

Tots els elements informatius criticals no depenen exclusivament del color.
Si s'usa color com a senyal, hi ha sempre un segon canal:

| Situació | Color | Segon canal |
|----------|-------|-------------|
| Stat en perill | Vermell | Icona canvia a crani/trencada |
| Inclinació positiva/negativa | Color ple / desaturat | Direcció de la barra (esquerra/dreta) |
| Acció bloquejada per inclinació | Overlay opac | Icona de cadenat (si acció comprada) |
| Tecnologia disponible | Badge verd | Número sobre la icona |

---

## 8. Decisions que Necessiten Il·lustrador

Aquesta secció documenta els punts del projecte on es requereix una decisió
visual que no pot ser presa unilateralment per l'Art Director ni generada
automàticament per Recraft. Cada ítem és una consulta pendent.

### 8.1 Transició Visual entre Eres [PENDENT]

**Pregunta**: quin tipus de transició visual volem en el moment de canvi
d'era?

**Opcions**:
- **A — Dissolució de paleta pura**: no hi ha cap asset especial. El fons
  canvia de color i el personatge fa un crossfade al nou retrat. Simple,
  ràpid d'implementar.
- **B — Scroll vertical**: la pantalla fa scroll cap amunt mentre el
  personatge "creix" i el vestuari canvia. Evoca el pas del temps físic.
- **C — Il·lustració de transició (fullscreen)**: una imatge específica
  per a cada transició d'era (Prehistòria→Neolític, etc.) que dura 2-3
  segons. El cost és 4 il·lustracions (MVP 4 eres).

**Recomanació AD**: opció A per al MVP per cost zero d'assets. Opció C per
al launch si el projecte té pressupost d'il·lustració.

### 8.2 Mapa de Zones: Connexió entre Nodes [PENDENT]

**Pregunta**: com es visualitza el mapa de zones? Els nodes son elements
solts o estan connectats en un mapa il·lustrat?

**Opcions**:
- **A — Grid de nodes solts**: nodes sobre fons d'era, sense connexions
  visuals. Simple, fàcil d'escalar.
- **B — Mapa il·lustrat d'era**: una imatge de mapa (com MAP-PRE.png)
  amb els nodes col·locats al damunt. Requereix un asset de mapa per era
  (4 en MVP).
- **C — Mapa il·lustrat procedural**: zones apareixen i desapareixen amb
  animació, el mapa "creix" amb cada descoberta de zona.

**Recomanació AD**: opció B. El `MAP-PRE.png` ja existeix i s'ha aprovat.
Cal crear `MAP-NEO.png`, `MAP-ANT.png`, `MAP-CLA.png`. El generador ChatGPT
que va produir `MAP-PRE.png` és la referència d'estil.

### 8.3 Visualització de la Branca Activa [PENDENT]

**Pregunta**: com es mostra que el personatge pertany a una branca concreta?
(ex. "Guerrer Tribal" vs "Xamàn")

**Opcions**:
- **A — Text sota el nom**: la branca apareix com a text petit. Zero cost
  d'assets.
- **B — Color d'accent de branca**: cada branca té un color secundari que
  tenyeix l'accent de la card d'acció. Comunica branca sense text.
- **C — Badge/insígnia de branca**: una petita icona sobre el personatge
  (escudo, totem, etc.) que identifica la branca.

**Recomanació AD**: opció A (MVP) + opció C (post-prototip). L'opció C
requereix icones de branca per a totes les branques de totes les eres,
cosa que és fora de scope per al MVP.

### 8.4 Genealogia Visual: Arbre del Llinatge [PENDENT]

**Pregunta**: com es representa visualment l'arbre genealògic?

La funcionalitat és clara (llista de generacions amb nom i era). La
pregunta és el registre visual:

**Opcions**:
- **A — Scroll vertical de cards**: cada generació és una card petita amb
  el retrat miniatura, nom, era, branca. Sense grafs.
- **B — Arbre horitzontal**: nodes connectats per línies, expandible. El
  clàssic arbre genealògic.
- **C — Línia del temps horitzontal**: scroll horitzontal, cada generació
  és un "punt" a la línia, expandible en tocar.

**Recomanació AD**: opció A per al MVP (cost 0 d'assets nous), opció B
per al launch (visualment icònic per a la fantasia del jugador).

### 8.5 Icones de Tecnologies de Branca [PENDENT]

**Pregunta**: les tecnologies de branca necessiten icona pròpia?

Les tecnologies de branca son descobriments permanents i clau del loop de
meta-progressió. Tenir una icona pròpia les fa col·leccionables visualment.

**Opcions**:
- **A — Sense icona pròpia**: text + color de branca.
- **B — Icona genèrica per categoria** (combat, espiritual, social, etc.):
  un conjunt de 6-8 icones cobreix totes les branques.
- **C — Icona única per tecnologia**: el màxim impacte emocional en el
  moment de descoberta, però cost d'assets molt alt.

**Recomanació AD**: opció B. 8 icones de categoria cobreix el MVP i pot
escalar a opció C en expansions.

---

*Fi del document — versió 1.0*
*Revisar i actualitzar en iniciar cada nova era de contingut.*
