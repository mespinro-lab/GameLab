# Bloodline — Mapa de contingut (Descobriments → Habilitats → Accions)

> **Generat automàticament del codi** (2026-06-29) — `prototypes/bloodline-v2/data.js`.
> Cadena: **Descobriment** (tec. universal, per cicle) → **Habilitat** (branch tech, descoberta amb "Escoltar els Estrangers" quan l'inclinació compleix les condicions) → **Accions** (que la habilitat desbloqueja; les que tenen cost es compren al mercat).
> Branques: impuls→Caçador · intel·lecte→Artesà · espiritualitat→Místic · sociabilitat→Recol·lector.

**Totals**: 7 descobriments · 30 habilitats · 84 accions.

## Accions base (sense habilitat — sempre disponibles)

| Acció | Zona | Output | Recepta/efecte |
|---|---|---|---|
| Espiar el Ramat | Planes | 3-8 food | -5 health |
| Recol·lectar Arrels | Planes | 1-3 food | — |
| Tallar una Eina | Campament | 1-1 eina | 2 pedra + 1 branques · -2 pedra, -1 branques |
| Contemplació | Campament | 3-6 health | — |
| Vigilar el Campament | Campament | 2-4 health | — |
| Explorar els Voltants | Planes | — | — |
| Recollir Pedra | Planes | 1-3 pedra | — |
| Recollir Fibres | Bosc | 2-4 branques | — |
| Cercar Parella | Campament | — | — |
| Tenir Fills | Llar | — | — |
| Ensenyar el Fill | Llar | — | — |

## 🔓 Descobriment: El Foc `(ut_foc, cicle 10)`

### Habilitat: **Cuina i Conservació** — _Artesà_ `(bt_cuina_conservacio)`
Condició d'inclinació: `AND [intel·lecte≥0.15, impuls≤0.2]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Cuinar Arrels | Campament | 🔵3 | 3-6 food | — |
| Ahumar Carn | Campament | 🔵4 | 4-8 food | 2 food |

### Habilitat: **Guàrdia de la Flama** — _Caçador / Artesà / Místic / Recol·lector_ `(bt_guardia_flama)`
Condició d'inclinació: `OR [impuls≥0.1, intel·lecte≥0.1, espiritualitat≥0.1, sociabilitat≥0.1]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Alimentar el Foc | Campament | 🔵3 | 3-5 health | -1 material |
| Torxa d'Escolta | Campament | 🔵3 | 2-5 health | 1 material · -3 health, -1 material |

### Habilitat: **Rituals de la Flama** — _Místic / Artesà_ `(bt_guariment_plantes)`
Condició d'inclinació: `AND [espiritualitat≥0.2, intel·lecte≥0.1]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Curar amb Herbes | Campament | 🔵3 | 8-14 health | — |
| Preparar un Ungüent | Campament | 🔵3 | 1-1 eina | 2 branques + 1 pedra · -2 branques, -1 pedra |

### Habilitat: **Adhesius i Emmanegament** — _Artesà_ `(bt_adhesius)`
Condició d'inclinació: `AND [intel·lecte≥0.2, impuls≤0.2]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Destil·lar Quitrà | Campament | 🔵4 | — | -2 health |
| Emmanegar Eines | Campament | 🔵4 | — | 1 pedra |

## 🔓 Descobriment: Les Eines `(ut_eines, cicle 16)`

### Habilitat: **Punta de Llança** — _Caçador_ `(bt_punta_llanca)`
Condició d'inclinació: `AND [impuls≥0.25, sociabilitat≤0.3]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Caça amb Llança | Planes | 🔵4 | 5-12 food | 1 eina · -7 health, -1 eina |
| Emboscada Nocturna | Planes | 🔵5 | 10-16 food | -14 health |
| Forjar Punta de Llança | Campament | 🔵3 | 1-1 eina | 2 pedra + 1 branques · -2 pedra, -1 branques |

### Habilitat: **Rasclador Fi** — _Artesà / Recol·lector_ `(bt_rasclador_fi)`
Condició d'inclinació: `OR [intel·lecte≥0.18, sociabilitat≥0.18]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Mòlta de Grans | Campament | 🔵3 | 3-7 food | — |
| Façonar Estris | Campament | 🔵3 | 1-1 eina | 2 pedra + 1 branques · -2 pedra, -1 branques |
| Treballar amb Estris | Campament | 🔵4 | 4-8 food | 1 eina · -1 eina |

### Habilitat: **Burí i Gravat** — _Artesà_ `(bt_buri)`
Condició d'inclinació: `AND [intel·lecte≥0.25, impuls≤0.2]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Gravar Os i Ivori | Campament | 🔵4 | — | — |
| Intercanviar Eines | Planes | 🔵3 | 2-4 food | 1 eina · -1 eina |

### Habilitat: **Eines Cerimonials** — _Místic / Recol·lector_ `(bt_eines_cerimonials)`
Condició d'inclinació: `AND [espiritualitat≥0.18, sociabilitat≥0.15]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Ofrena d'Eines | Campament | 🔵3 | — | 1 pedra · +5 health, -1 pedra |
| Cerimònia de les Eines | Campament | 🔵4 | — | +3 health |

### Habilitat: **Flautes d'Os** — _Artesà / Místic_ `(bt_musica_os)`
Condició d'inclinació: `AND [intel·lecte≥0.15, espiritualitat≥0.15]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Tallar una Flauta d'Os | Campament | 🔵4 | — | — |
| Música a la Vetlla | Campament | 🔵3 | 3-5 health | — |

### Habilitat: **Calendari Natural** — _Artesà / Místic_ `(bt_calendari_natural)`
Condició d'inclinació: `OR [intel·lecte≥0.18, espiritualitat≥0.2]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Observar el Cel Nocturn | Planes | 🔵3 | 4-7 food | — |
| Trànsit Nocturn | Bosc | 🔵4 | 6-12 food | -5 health |

## 🔓 Descobriment: L'Art `(ut_art, cicle 36)`

### Habilitat: **Pintura Rupestre** — _Místic / Recol·lector_ `(bt_pintura_rupestre)`
Condició d'inclinació: `AND [espiritualitat≥0.3, sociabilitat≥0.2]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Pintar les Parets | Bosc | 🔵4 | 2-3 pedra | — |
| Narrar les Llegendes | Campament | 🔵3 | 2-3 branques | — |

### Habilitat: **Marques de Territori** — _Caçador / Artesà_ `(bt_marques_territori)`
Condició d'inclinació: `OR [impuls≥0.2, intel·lecte≥0.18]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Marcar Territori | Planes | 🔵3 | 1-3 food | -3 health |
| Rastreig de Rutes | Bosc | 🔵3 | 3-6 food | — |

### Habilitat: **Ornaments i Adorn** — _Místic / Recol·lector_ `(bt_ornaments)`
Condició d'inclinació: `OR [espiritualitat≥0.2, sociabilitat≥0.25]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Ornamentar-se | Campament | 🔵3 | 2-4 health | — |
| Consagrar Ornaments | Campament | 🔵4 | 5-9 health | — |
| Ritual del Talisman | Campament | 🔵4 | 8-14 health | 1 eina · -1 eina |

### Habilitat: **Narració Oral** — _Recol·lector_ `(bt_narracio_oral)`
Condició d'inclinació: `AND [sociabilitat≥0.2]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Explicar els Orígens | Campament | 🔵3 | — | +3 health |
| Cants de Grup | Campament | 🔵3 | 3-5 health | — |

## 🔓 Descobriment: La Vestimenta `(ut_vestimenta, cicle 50)`

### Habilitat: **Agulla d'Os** — _Artesà_ `(bt_agulla_os)`
Condició d'inclinació: `AND [intel·lecte≥0.2, impuls≤0.2]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Cosir Pells | Campament | 🔵3 | 3-6 health | — |
| Construir Refugi | Campament | 🔵4 | 4-8 health | — |

### Habilitat: **Adobament de Pells** — _Caçador / Artesà_ `(bt_adobament_pells)`
Condició d'inclinació: `OR [impuls≥0.15, intel·lecte≥0.2]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Preparar Cuiro | Campament | 🔵3 | — | — |
| Roba d'Hivern | Campament | 🔵4 | 4-8 health | 2 material · -2 material |

### Habilitat: **Pigments i Tintures** — _Místic / Recol·lector_ `(bt_pigments_tintures)`
Condició d'inclinació: `OR [espiritualitat≥0.18, sociabilitat≥0.18]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Decorar el Cos | Campament | 🔵3 | 2-3 branques | — |
| Tenyir Pells | Campament | 🔵3 | — | — |

## 🔓 Descobriment: La Corda `(ut_corda, cicle 65)`

### Habilitat: **Trampes i Llaços** — _Recol·lector_ `(bt_trampes)`
Condició d'inclinació: `AND [sociabilitat≥0.1]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Parar Trampes | Planes | 🔵3 | 2-6 food | 1 material · -1 material |
| Revisar les Trampes | Bosc | 🔵3 | 1-4 food | -3 health |

### Habilitat: **Arc i Fletxes** — _Caçador / Artesà_ `(bt_arc_fletxes)`
Condició d'inclinació: `AND [impuls≥0.2, intel·lecte≥0.1]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Caçar amb Arc | Planes | 🔵4 | 4-9 food | -4 health |
| Practicar el Tir | Planes | 🔵3 | — | — |

### Habilitat: **Coneixement de Plantes** — _Recol·lector_ `(bt_coneixement_plantes)`
Condició d'inclinació: `AND [sociabilitat≥0.1]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Recollida de Bolets | Bosc | 🔵3 | 2-5 food | +5 health |
| Assecament de Plantes | Campament | 🔵3 | 1-3 food | -1 material |
| Trenar un Garbell | Campament | 🔵3 | 1-1 eina | 2 branques + 1 pedra · -2 branques, -1 pedra |

### Habilitat: **Nusos Sagrats** — _Místic / Recol·lector_ `(bt_nusos_sagrats)`
Condició d'inclinació: `AND [espiritualitat≥0.15, sociabilitat≥0.15]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Ritual dels Nusos | Campament | 🔵3 | — | +5 health |
| Tela Sagrada | Campament | 🔵3 | 3-5 health | — |

### Habilitat: **Pesca amb Arpó i Xarxa** — _Caçador / Recol·lector_ `(bt_pesca)`
Condició d'inclinació: `OR [impuls≥0.12, sociabilitat≥0.12]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Pescar al Riu | Bosc | 🔵3 | 3-6 food | — |
| Calar la Xarxa | Bosc | 🔵5 | 4-9 food | -2 health |

## 🔓 Descobriment: La Ceràmica `(ut_ceramica, cicle 70)`

### Habilitat: **Llavor Selectiva** — _Recol·lector_ `(bt_llavor_selectiva)`
Condició d'inclinació: `AND [sociabilitat≥0.15]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Seleccionar Llavors | Campament | 🔵4 | 3-6 food | — |
| Preparar el Terreny | Planes | 🔵4 | 2-4 food | -5 health |
| Recol·lectar amb Garbell | Planes | 🔵3 | 4-8 food | 1 eina · -1 eina |

### Habilitat: **Domini de la Terra** — _Caçador / Recol·lector_ `(bt_domini_terra)`
Condició d'inclinació: `AND [impuls≥0.12, sociabilitat≥0.12]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Control del Territori | Planes | 🔵5 | 3-7 food | -5 health |
| Negociar les Pastures | Planes | 🔵5 | 3-6 food | +3 health |

### Habilitat: **Intercanvi i Troc** — _Recol·lector_ `(bt_intercanvi_troc)`
Condició d'inclinació: `AND [sociabilitat≥0.2]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Fira d'Intercanvi | Planes | 🔵4 | — | — |
| Ceràmica Regalada | Planes | 🔵3 | 2-4 food | -1 material |

### Habilitat: **Terrissa** — _Artesà_ `(bt_terrissa)`
Condició d'inclinació: `AND [intel·lecte≥0.22, impuls≤0.2]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Modelar Argila | Campament | 🔵4 | — | — |
| Coure Vasos d'Argila | Campament | 🔵5 | 2-4 food | — |

## 🔓 Descobriment: El Primer Conreu `(ut_agricultura, cicle 85)`

### Habilitat: **Sembra i Collita** — _Artesà_ `(bt_sembra_collita)`
Condició d'inclinació: `AND [intel·lecte≥0.2, impuls≤0.15]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Sembrar Llavors | Planes | 🔵4 | 3-7 food | — |
| Collita Sistemàtica | Planes | 🔵5 | 5-9 food | — |

### Habilitat: **Domesticació d'Animals** — _Caçador / Recol·lector_ `(bt_domesticacio_animals)`
Condició d'inclinació: `AND [impuls≥0.1, sociabilitat≥0.15]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Amansar un Animal | Planes | 🔵4 | 2-5 food | -2 health |
| Pasturar el Bestiar | Planes | 🔵3 | 3-7 food | — |

### Habilitat: **Construcció de Refugis** — _Artesà / Caçador_ `(bt_construccio_refugis)`
Condició d'inclinació: `OR [intel·lecte≥0.2, impuls≥0.2]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Edificar una Cabana | Campament | 🔵5 | 5-10 health | 2 material · -2 material |
| Reforçar la Palissada | Campament | 🔵4 | 3-6 health | 1 material · -1 material |

### Habilitat: **Ritus de la Sembra** — _Místic / Recol·lector_ `(bt_ritus_sembra)`
Condició d'inclinació: `AND [espiritualitat≥0.25, sociabilitat≥0.15]`

| Acció desbloquejada | Zona | Cost | Output | Recepta/efecte |
|---|---|---|---|---|
| Ofrena a la Terra | Campament | 🔵4 | — | +5 health |
| Danses de Fertilitat | Campament | 🔵3 | 2-4 health | -1 food |

## Accions lligades directament a un descobriment (sense habilitat)

| Acció | Descobriment | Zona | Cost | Output |
|---|---|---|---|---|
| Vetlla al Foc | ut_foc | Campament | 🔵4 | 5-8 health |
| Assecar Provisions | ut_foc | Campament | 🔵5 | — |
| Gran Ritual | ut_foc | Campament | 🔵6 | — |

