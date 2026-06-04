# Life Tycoon — Game Design Document

**Gènere**: Tycoon de llinatge humà amb progressió històrica  
**Plataforma**: Mòbil (iOS / Android), portrait, touch-first  
**Art**: Flat il·lustrat, retrats procedurals per capes, escenes animades per era  
**MVP target**: Era 1 (Prehistòria), 1 transició generacional, ~10–15 cicles

---

## 1. Overview

Life Tycoon és un joc de gestió estratègica on el jugador construeix el millor llinatge humà possible al llarg de múltiples generacions i eres històriques. No es simula la vida minut a minut: el jugador executa **projectes de vida** assignant recursos entre 4 sliders i obté resultats clars. L'objectiu no és una vida perfecta, sinó el **llegat acumulat** del llinatge.

La inspiració directa és Game Dev Tycoon: projectes com a unitat d'acció, recursos distribuïts entre eixos, resultats via fórmula, desbloqueig progressiu d'opcions. Aplicat a la vida humana i a l'evolució de la humanitat.

---

## 2. Player Fantasy

*"Soc l'arquitecte d'una dinastia que ha travessat la prehistòria, l'antiguitat i la revolució industrial. Cada fill que he escollit, cada decisió de risc que he pres, cada era que he travessat, ha construït qui som."*

El jugador ha de sentir:
- **Orgull dinàstic**: l'arbre genealògic és el trofeu visible del joc
- **Decisió significativa**: cada cicle té trade-offs reals, no opcions òbvies
- **Progrés llegible**: les eres noves obren possibilitats que l'anterior no tenia
- **Sessió breu, arc llarg**: 3–5 min per cicle; una vida completa en múltiples sessions

---

## 3. Core Gameplay Loop

```
┌─────────────────────────────────────────┐
│  1. SELECCIÓ DE PROJECTE                │
│     Escull activitat del cicle (2–3 anys)│
├─────────────────────────────────────────┤
│  2. ASSIGNACIÓ DE SLIDERS               │
│     Distribueix esforç: Físic / Intel / │
│     Social / Risc-Capital               │
├─────────────────────────────────────────┤
│  3. EXECUCIÓ AUTOMÀTICA                 │
│     Fórmula: stats + sliders + era +    │
│     coneixement + reputació familiar    │
├─────────────────────────────────────────┤
│  4. RESULTAT                            │
│     ±Diners / ±Salut / ±Reputació /     │
│     ±Coneixement / desbloqueigs         │
├─────────────────────────────────────────┤
│  5. EVENT (no sempre)                   │
│     Decisió puntual amb trade-off real  │
├─────────────────────────────────────────┤
│  6. PROGRESSIÓ                          │
│     Nous projectes / coneixements /     │
│     oportunitats de parella / fills     │
└─────────────────────────────────────────┘
```

Un cicle = una sessió de 3–5 min. Una vida = 10–20 cicles (variable per era).

---

## 4. Stats

### Visibles (barra d'estat sempre visible)
| Stat | Descripció | Nota |
|---|---|---|
| Salut ❤️ | Barra que es buida. A 0 = mort | Mala salut accelera mort |
| Intel·ligència 🧠 | Gate per a projectes avançats | Acumulable, parcialment heretat |
| Social 👥 | Gate per a parella i negocis | Acumulable |
| Riquesa 💰 | Moneda principal | No heretada 100% |
| Felicitat ✨ | Modificador de resultats | Volàtil, no acumulable |

### Ocult (persistent entre generacions)
| Stat | Descripció |
|---|---|
| Reputació familiar 🏛️ | Desbloqueja oportunitats exclusives. Funciona com "fans" de GDT. |

---

## 5. Sliders

Cada cicle el jugador distribueix 10 punts entre 4 eixos:

| Slider | Afecta | Era dominant |
|---|---|---|
| Físic 💪 | Salut, projectes de força, caça | Prehistòria, Medieval |
| Intel·ligència 🧠 | Aprenentatge, negocis, ciència | Antiguitat+, Industrial+ |
| Social 👥 | Parella, comerç, política | Totes les eres |
| Risc / Capital 🎲 | Multiplicador de guanys i pèrdues | Industrial+, Moderna |

**Principi clau**: cada era reescriu quins sliders importa màxim, forçant el jugador a reapendre.

---

## 6. Categories de Projectes

Els projectes s'agrupen en categories. Cada era exposa un subconjunt:

| Categoria | Exemples | Gate típic |
|---|---|---|
| **Supervivència** | Recol·lectar, caçar | Era primerenca |
| **Coneixement** | Aprendre ofici, estudiar | Intel ≥ X |
| **Comerç** | Mercat local, ruta comercial | Social + Riquesa |
| **Llar** | Buscar parella, tenir fills, cuidar llar | Social + Salut |
| **Inversió** | Eines, propietats, negocis | Riquesa + Intel |
| **Estatus** | Servei militar, càrrec polític | Reputació + Social |

---

## 7. Sistema de Parella i Descendència

La parella i els fills son **projectes de la categoria Llar**, no un sistema separat.

### Flux
1. **Buscar parella** (projecte): requereix Social 2. Resulta en una parella amb traits parcialment revelats.
2. **Tenir fills** (projecte): requereix parella activa + Salut 3. Genera 1 fill amb stats heredats + variació.
3. **Criar fills** (projecte): millora el potencial dels fills existents.

### Fills
- Descripció per **virtut narrativa**, no stats numèrics: *"Té un talent innato per al lideratge"*, *"La seva curiositat el porta a llocs estranys"*
- Traits ocults: 1–2 per fill, revelats parcialment en la pantalla de successió
- Màxim de fills **decreixent per era i cost econòmic**:

| Era | Màxim fills | Cost per fill |
|---|---|---|
| Prehistòria | 6 | Baix (Salut) |
| Antiguitat | 5 | Baix-Mig |
| Medieval | 4 | Mig |
| Industrial | 3 | Mig-Alt |
| Moderna | 1–2 | Alt (Riquesa + carrera) |
| Futurista | 1–2 | Alt + decisions bioètiques |

### Condició de derrota
Morir sense fills viables = **fi del llinatge** = game over real.

---

## 8. Sistema de Mort i Successió

### Mort
- La salut és una **barra que es buida** gradualment i per decisions
- Quan arriba a 0: mort del personatge → pantalla de successió
- **Retirada anticipada** (opció voluntària): tanca la vida del personatge, però aplica el trait *Llegat Fosc* al fill escollit durant X cicles (−Reputació temporal)

### Pantalla de Successió
- Mostra tots els fills com a **cartes**
- Cada carta: retrat procedural + nom + virtut narrativa + 1–2 traits (alguns `?`)
- Suggeriment de guardar partida abans d'escollir
- El jugador escull qui continua el llinatge

### Save / Reload
- Si el fill escollit mor prematurament, el jugador pot tornar al punt de guarda de la successió i escollir un fill diferent

---

## 9. Sistema de Coneixement

Equivalent al "motor tecnològic" de GDT:
- Els projectes de **Coneixement** generen descobriments
- Cada descobriment desbloqueja nous projectes o millora fórmules existents
- Es **transmet parcialment** als fills (20–50% del coneixement acumulat, modificat per "Criar fills")

Exemples per era: veure `eras/XX-nom.md`

---

## 10. Reputació Familiar (meta-stat)

- **Persistent entre generacions** — no es reinicia mai
- Desbloqueja projectes d'alt nivell exclusius (càrrecs, aliances, mecenatge)
- Funciona com els "fans" de GDT: construïda lentament, perduda ràpidament
- La **Retirada anticipada** la redueix temporalment

---

## 11. Eres

### Core (base game)
| # | Era | Vida base | Slider dominant |
|---|---|---|---|
| 1 | Prehistòria | ~30a | Físic |
| 2 | Antiguitat Clàssica | ~40a | Físic + Social |
| 3 | Edat Mitjana | ~45a | Social + Reputació |
| 4 | Revolució Industrial | ~60a | Intel + Capital |
| 5 | Era Moderna *(90s)* | ~75a | Tots equilibrats |
| 6 | Era Futurista | ~90a | Intel + Capital extrems |

### DLC (extensions ~€1)
| Slot | Era | Entre |
|---|---|---|
| 1.5 | Era del Bronze i el Ferro | Prehistòria → Clàssica |
| 3.3 | Renaixement | Medieval → Industrial |
| 3.6 | Era de les Expedicions | Renaixement → Industrial |
| 4.5 | Era Digital | Moderna → Futurista |
| 6.5 | Era Post-humana | Després de Futurista |

Cada era és un **fitxer de config independent** (`src/life-tycoon/data/eras/`). DLC = afegir fitxer, sense modificar codi.

---

## 12. Pantalla Final i Puntuació

### Resum del Llinatge (scroll vertical)
- Generacions completades · Eres travessades
- Riquesa màxima assolida
- Coneixements transmesos al llarg del llinatge
- **Fites especials** (equivalent a maravelles de Civ 2): desbloqueig per accions úniques

### Puntuació estil Civ 2
```
LLINATGE: [nom dinàstic auto-generat]
Eres dominades:           ████████░░
Herència de coneixement:  ███████░░░
Riquesa acumulada:        █████░░░░░
Fites especials:          🏛️ 🔥 ⚔️
──────────────────────────────────────
LLEGAT: "Constructors d'Imperis"
PUNTS: 12.840
```

### Arbre genealògic
- Nodes horitzontals per generació, branques cap a fills
- Fills no escollits: node gris amb `?` + tret narratiu
- Branques sense descendència: node `✗`
- Tap a qualsevol node → mini-carta del personatge
- Exportable com a imatge (viral loop)

---

## 13. Disseny Visual

### Estil
Flat il·lustrat. Estètica Candy Crush / Farmer, calorosa i llegible en mobile.

### Retrats procedurals
Capes SVG superposades (per ordre):
1. Forma de cara
2. To de pell
3. Ulls (mapejat a Intel·ligència)
4. Nas
5. Boca (mapejat a Social)
6. Cabell
7. Accessori d'era (corona medieval, ulleres modernes...)
8. Roba d'era

Herència visible: fills comparteixen elements visuals amb pares.

### Escena animada d'era
- Cada era té 1 escena de fons amb **3–5 zones d'activitat**
- Cada zona té 3 estats: Idle / Actiu / Intensiu
- L'slider que el jugador mou activa la zona corresponent en temps real (feedback visual immediat)
- Recursos floten visualment de les zones cap al stats strip

**MVP**: escenes estàtiques amb animació CSS (partícules, respiració). **V1.0**: animació Spine 2D.

### Layout (portrait mobile)
```
┌─────────────────────────────┐
│ [Nom] · Era · Any    [🏅▼]  │  ← header + achievements drawer
│ ❤️████  💰████  🧠██  👥█  │  ← stats strip
├─────────────────────────────┤
│                             │
│    ESCENA ANIMADA D'ERA     │
│                             │
│  🏠💨   🌿🌿   🦣⚡        │
│  llar  recol·lecció  caça   │
│                             │
├─────────────────────────────┤
│ [▲ GESTIONAR CICLE]         │  ← drawer des de baix
│  Projecte: Caçar mamut      │
│  ●●●○ Físic  ●●○○ Risc      │
│  [EXECUTAR]                 │
└─────────────────────────────┘
```

---

## 14. Economia

- **Moneda**: Diners (€/equivalents per era)
- **Ingressos**: generats pels projectes
- **Despeses automàtiques**: subsistència bàsica cada cicle (escala per era)
- **Inversions opcionals**: eines, propietats, educació (canvien fórmules futures)
- **No realisme**: decisions significatives amb trade-offs, no comptabilitat

---

## 15. MVP Scope

| Àmbit | Contingut MVP |
|---|---|
| Eres | 1 (Prehistòria) |
| Cicles per vida | 10–12 |
| Projectes | 10–12 |
| Events | 10–15 |
| Transicions generacionals | 1 |
| Sliders | 4 |
| Sistema de parella | Simplificat (1 fill possible) |
| Art | Escenes estàtiques + CSS anim |

**Objectiu MVP**: validar que el loop d'un cicle és addictiu abans d'escalar.

---

## 16. Tuning Knobs

- `BASE_LIFE_EXPECTANCY` per era
- `MAX_LIFE_EXPECTANCY` per era (amb build òptima de salut)
- `SLIDER_POINTS_PER_CYCLE` (default: 10)
- `KNOWLEDGE_INHERITANCE_RATE` (default: 0.35)
- `REPUTATION_DECAY_ON_RETIRE` (default: −20%)
- `MAX_CHILDREN` per era (taula)
- Pes de cada slider en cada fórmula de projecte

---

## 17. Acceptance Criteria (MVP)

- [ ] Un jugador nou pot completar 10 cicles de prehistòria en menys de 45 min
- [ ] La mort per salut és llegible i no se sent injusta
- [ ] La pantalla de successió amb 1 fill és funcional i clara
- [ ] L'arbre genealògic mostra correctament 2 generacions
- [ ] Els sliders donen feedback visual immediat a l'escena
- [ ] El loop és jugable sense tutorial escrit
