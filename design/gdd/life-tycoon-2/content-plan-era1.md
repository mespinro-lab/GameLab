# Life Tycoon 2 — Content Plan: Era 1

> **ESTAT**: Esquelet pendent de validació de contingut.
> Tot el contingut marcat `[PROPOSTA]` és tentativa i requereix revisió
> de coherència argumental i històrica. Els noms definitius s'han de decidir
> conjuntament. Els marcats `[PENDENT]` no tenen proposta i cal omplir-los.

**Depèn de**: `era-system.md`, `branch-system.md`, `action-economy.md`, `event-system.md`

---

## 1. Definició de l'Era

| Camp | Valor |
|---|---|
| `id` | `era_prehistoria` |
| `name` | `[PROPOSTA]` Prehistòria |
| `slot_order` | 1 (primera era) |
| `entry_connector` | Buit (primera era) |
| `exit_connector` | `[PROPOSTA]` Tecnologia universal "Agricultura" |
| `life_expectancy.base_cycles` | `[PENDENT]` ~10–14 cicles |
| `life_expectancy.max_cycles` | `[PENDENT]` ~18–20 cicles |
| `dlc` | false (era gratuïta) |

### Indicadors (noms era-específics)
| ID intern | `[PROPOSTA]` Nom Prehistòria |
|---|---|
| `food` | Menjar |
| `health` | Salut |
| `happiness` | Benestar |
| `security` | Protecció |
| `social` | Vincles |

### Recursos
| ID intern | `[PROPOSTA]` Nom Prehistòria |
|---|---|
| `primary` | Provisions |
| `secondary` | `[PENDENT]` (necessari? quin?) |

---

## 2. Branques de l'Era 1

> Els noms son propostes. Cal validar si el naming és el correcte.

| ID | `[PROPOSTA]` Nom | Estil de joc |
|---|---|---|
| `hunter` | Caçador | Força física, caça, territori, risc alt/reward alt |
| `gatherer` | Recol·lector | Acumulació, terreny, sostenibilitat, risc baix |
| `craftsman` | Artesà | Eines, fabricació, millores, eficiència |
| `mystic` | Místic | Coneixement espiritual, guariment, influència social |

### Transició Era 1 → Era 2

No cal cap mapa de transició. Els 4 eixos d'inclinació es transfereixen
directament sense conversió. Les branques de l'Era 2 (Neolític) emergiran
dels mateixos valors d'eixos que tenia el jugador al final de l'Era 1.

> Exemple: un jugador amb `impuls: 0.65, sociabilitat: 0.40` al final
> de la Prehistòria entrarà al Neolític amb exactament aquells valors.
> Les branques del Neolític que tinguin condicions compatibles
> (`impuls ≥ 0.4` o `sociabilitat ≥ 0.3`) s'activaran automàticament.

`[PENDENT]` — cal definir les branques de l'Era 2 per saber quines
condicions d'inclinació tindran i si hi ha continuïtat narrativa clara.

---

## 3. Tecnologies Universals (Universal Tech Schedule)

> `[PROPOSTA]` — els noms i cicles son orientatius.
> Cal validar la cadència i si el nombre de tecns. és adequat.

| Cicle | ID | `[PROPOSTA]` Nom | `is_exit_connector` |
|---|---|---|---|
| 2 | `ut_language` | Llengua Bàsica | false |
| 4 | `ut_fire` | Foc | false |
| 6 | `ut_stone_tools` | Eines de Pedra | false |
| 9 | `ut_symbolic_thinking` | Pensament Simbòlic | false |
| 12 | `ut_agriculture` | Agricultura | **true** |

---

## 4. Tecnologies de Branca

> `[PROPOSTA]` — taula esquelet. Cal definir noms definitius,
> efectes (accions desbloquejades, modificadors), i confirmar quines
> son compartides (ponts) i quines exclusives.
> Cada tech universal hauria de derivar 2–3 branch techs (1–2 exclusives + 1 pont).

### Derivades de `ut_language` (Llengua Bàsica)
| ID | `[PROPOSTA]` Nom | Branques | Compartida? | `is_hidden` |
|---|---|---|---|---|
| `bt_war_cry` | Crit de Guerra | `hunter` | No | false |
| `bt_negotiation` | Negociació Bàsica | `gatherer`, `mystic` | **Sí (pont)** | false |
| `bt_oral_tradition` | Tradició Oral | `mystic` | No | false |

### Derivades de `ut_fire` (Foc)
| ID | `[PROPOSTA]` Nom | Branques | Compartida? | `is_hidden` |
|---|---|---|---|---|
| `bt_fire_weapon` | `[PENDENT]` | `hunter` | No | false |
| `bt_cooking` | `[PENDENT]` | `gatherer`, `craftsman` | **Sí (pont)** | false |
| `bt_ritual_fire` | `[PENDENT]` | `mystic` | No | true |

### Derivades de `ut_stone_tools` (Eines de Pedra)
| ID | `[PROPOSTA]` Nom | Branques | Compartida? | `is_hidden` |
|---|---|---|---|---|
| `bt_hunting_tools` | `[PENDENT]` | `hunter` | No | false |
| `bt_tool_mastery` | `[PENDENT]` | `craftsman` | No | false |
| `bt_shared_tools` | `[PENDENT]` | `hunter`, `craftsman` | **Sí (pont)** | false |

### Derivades de `ut_symbolic_thinking` (Pensament Simbòlic)
| ID | `[PROPOSTA]` Nom | Branques | Compartida? | `is_hidden` |
|---|---|---|---|---|
| `bt_territory_marks` | `[PENDENT]` | `hunter` | No | false |
| `bt_healing_rituals` | `[PENDENT]` | `mystic` | No | false |
| `bt_shared_knowledge` | `[PENDENT]` | `gatherer`, `mystic` | **Sí (pont)** | true |

### Derivades de `ut_agriculture` (Agricultura — exit connector)
| ID | `[PROPOSTA]` Nom | Branques | Compartida? | `is_hidden` |
|---|---|---|---|---|
| `bt_crop_knowledge` | `[PENDENT]` | `gatherer` | No | false |
| `bt_land_control` | `[PENDENT]` | `hunter`, `gatherer` | **Sí (pont)** | false |

---

## 5. Zones del Mapa

> `[PROPOSTA]` — 4 zones. Cal validar els noms i condicions de descoberta.

| ID | `[PROPOSTA]` Nom | Discovery condition | Accions previstes |
|---|---|---|---|
| `zone_home` | Campament | `initial` (des del principi) | accions de base, família, descans |
| `zone_wild` | Territori Salvatge | `initial` | caça, explorar, recol·lectar |
| `zone_forest` | Bosc | `action`: primera exploració | recol·lectar avançat, plantes, animals |
| `zone_ritual` | Lloc Sagrat | `branch_tech: bt_oral_tradition` | accions místiques, rituals |

---

## 6. Accions (Esquelet)

> `[PENDENT]` — a definir amb la taula completa.
> Cadascuna necessita: nom, `habilitat_prereq` (quin branch_tech la desbloqueja),
> `inclination_deltas`, `inclination_requirements`, `base_output`, `event_pool_id`, upgrade opcional.

### Principis de disseny per a les accions de l'Era 1:

**Accions base** (visibles des del principi, sense habilitat prerequisit):
- 2–3 accions per zona inicial (Campament, Territori Salvatge)
- Cobreixen les necessitats mínimes de supervivència de forma neutral
- Empenten els eixos molt lleugerament o gens — son el punt de partida

**Accions d'habilitat** (revelades per branch techs, constitueixen el gruix del joc):
- Cada branch tech desbloqueja 2–4 accions pròpies
- Cada necessitat base (Menjar, Salut, Felicitat, Seguretat, Social) ha de
  tenir com a mínim 2 accions d'habilitat amb `inclination_deltas` clarament
  diferenciats (una per orientació d'inclinació)
- Les accions de la zona Campament son majoritàriament de baix risc / baix reward
- Les accions de Territori Salvatge son d'alt risc / alt reward
- El Místic ha de poder subsistir completament des de les zones Campament i Bosc
- El Caçador ha de trobar les millors accions al Territori Salvatge

### Taula d'accions (les 4 branques):
`[PENDENT]` — taula a completar amb contingut validat. ~8–10 accions per branca.

---

## 7. Events (Esquelet)

> `[PENDENT]` — a definir els pools d'events per a cada acció.
> Mínim 15–20 events per a l'Era 1.

### Principis de disseny per als events de l'Era 1:
- Events post-acció de caça: alt risc (animal ferit, emboscada, cova).
- Events post-acció de recol·lecta: descoberta de nous recursos o zones.
- Events post-acció de rituals místics: efectes en Vincles i Benestar, possibles descobertes.
- Events de pressió del món: sequera (−Menjar), hivern dur (−Salut), migració animal
  (+Menjar temporal però competència).

### Events rars previstos (mínim 3):
`[PENDENT]` — a definir. Han de ser moments de descoberta amb `is_rare: true`.

---

## 8. Títols de Dinastia (Era 1)

> `[PENDENT]` — a definir un mínim de 5 títols per a l'Era 1.

| Raritat | Condicions orientatives |
|---|---|
| `common` (x2) | Completar era amb inclinació dominant clara a qualsevol branca |
| `uncommon` (x2) | Descobrir totes les branch techs d'una branca |
| `rare` (x1) | Tenir 3 branch techs actives simultàniament |
| `legendary` (x1) | `[PENDENT]` — condició molt específica a definir |

---

## 9. Badges (Era 1)

> `[PENDENT]` — a definir un mínim de 10 badges per a l'Era 1.
> Distribució orientativa: 4 `discovery` + 2 `path` + 2 `combination` + 1 `efficiency` + 1 `meta`.

---

## 10. Checklist de Completesa del Contingut

Abans de passar a implementació, aquest document ha d'estar complet:

- [ ] Noms definitius de les 4 branques validats
- [ ] Cadència de tecnologies universals validada (cicles)
- [ ] Noms de les ~12–14 tecnologies de branca definits
- [ ] Efectes de cada tecnologia de branca especificats (accions desbloquejades / modificadors)
- [ ] 4 zones amb condicions de descoberta validades
- [ ] ~32–40 accions definides (8–10 per branca, visibles i ocultes)
- [ ] Mínims 15–20 events definits
- [ ] Mínims 5 títols de dinastia definits
- [ ] Mínims 10 badges de l'era definits
- [ ] Mapa de transició Era 1 → Era 2 definit (un cop l'Era 2 tingui les seves branques)
