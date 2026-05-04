# Era 1 — Prehistòria

**Vida base**: 30 anys · **Vida màxima**: 45 anys  
**Slider dominant**: Físic (×1.3 en totes les fórmules)  
**Social**: secundari  
**DLC**: No (core)

---

## Context narratiu

La supervivència ho és tot. La tribu és la teva xarxa de seguretat, el foc és el teu actiu més valuós, i un mamut mal caçat pot acabar-ho tot. No hi ha diners, hi ha recursos. No hi ha carrera, hi ha rol dins la tribu.

---

## Escena animada

**3 zones actives:**

| Zona | Icona | Slider que l'activa | Idle | Intensiu |
|---|---|---|---|---|
| Llar / Foc | 🏠🔥 | Social | Fum suau | Família al voltant del foc |
| Recol·lecció | 🌿🍄 | Intel·ligència | Herba movent-se | Personatge recollint, tokens pujant |
| Caça | 🦣⚡ | Físic + Risc | Silueta animal lluny | Persecució activa, tokens grans |

---

## Projectes

### Categoria: Supervivència

| ID | Nom | Req | Sliders clau | Output principal | Risc |
|---|---|---|---|---|---|
| `gather` | Recol·lectar | — | Intel 0.4, Social 0.3 | +Menjar/Riquesa (baix, estable) | Molt baix |
| `hunt` | Caçar | Físic 2 | Físic 0.6, Risc 0.3 | +Riquesa (variable) | Mig (−Salut si falla) |
| `explore` | Explorar | Físic 3 | Físic 0.5, Risc 0.4 | +Riquesa rara, +Coneixement possible | Alt |

### Categoria: Coneixement

| ID | Nom | Req | Sliders clau | Output principal |
|---|---|---|---|---|
| `craft_tools` | Fabricar eines | Intel 1 | Intel 0.7, Físic 0.2 | Coneixement (eines de pedra, foc) |
| `observe_nature` | Observar natura | — | Intel 0.6, Social 0.2 | +Intel stat, coneixement lent |

### Categoria: Estatus

| ID | Nom | Req | Output principal |
|---|---|---|---|
| `lead_tribe` | Liderar tribu | Social 3 + Reputació 10 | +Reputació gran, +Social stat |

### Categoria: Llar

| ID | Nom | Req | Output principal |
|---|---|---|---|
| `find_partner` | Buscar parella | Social 2 | Parella (traits parcials) |
| `have_children` | Tenir fills | Parella + Salut 3 | 1 fill generat |
| `raise_children` | Criar fills | Fills | +Potencial fills |
| `care_home` | Cuidar llar | — | +Salut, +Felicitat |

---

## Coneixements desbloqueables

| ID | Nom | Via | Desbloqueja | Herència |
|---|---|---|---|---|
| `fire` | Foc | `craft_tools` (30%) | `cook_food`, +5 Salut permanent | 40% |
| `stone_tools` | Eines de pedra | `craft_tools` (50%) | `hunt` millorat, `explore` accessible | 35% |
| `language_basics` | Llengua bàsica | `socialize` × 3 cicles | `lead_tribe`, Social +1 | 50% |

---

## Events (pool `prehistoria_events`)

| ID | Nom | Trigger | Decisió |
|---|---|---|---|
| `rival_hunter` | Caçador rival | Hunt (25%) | Confrontar (risc Físic) vs Cedir (−Riquesa) |
| `harsh_winter` | Hivern dur | Qualsevol cicle (15%) | Estalviar vs Compartir amb tribu |
| `injured_companion` | Company ferit | Explore (30%) | Ajudar (−Salut pròpia) vs Abandonar (−Reputació) |
| `good_harvest` | Collita abundant | Gather (20%) | Guardar vs Celebrar (−Riquesa, +Moral) |
| `tribe_conflict` | Conflicte tribal | Cicle 5+ (10%) | Mediar (Social) vs Ignorar (−Reputació) |

---

## Fites especials (milestones)

| ID | Nom | Condició | Punts finals |
|---|---|---|---|
| `first_fire` | Mestre del Foc | Descobrir coneixement `fire` | +200 |
| `great_hunter` | Gran Caçador | 5 caceres exitoses | +150 |
| `tribe_elder` | Ancià de la Tribu | Arribar a `lead_tribe` | +300 |
| `long_lived` | Longeu | Sobreviure fins als 40+ anys | +250 |

---

## Notes de disseny

- **Sense diners literals**: la riquesa representa recursos (pells, carn, sílex). El valor és abstracte.
- **Físic és vida**: un Físic baix = Salut es buida més ràpid en projectes de risc.
- **Gate cap a era 2**: per avançar a Antiguitat cal tenir almenys `language_basics` + 1 fill.
