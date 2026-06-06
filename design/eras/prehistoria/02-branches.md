> ⚠️ OBSOLET (2026-06-06) — Font de veritat: `prototypes/bloodline/data.js`. Reescriure quan el prototip passi a producció.

# Paleolític — Branches
**Estat**: IMPORTAT de data.js — 2026-06-02
**Font**: `prototypes/bloodline/data.js` (BRANCHES)

---

## Branques

### Caçador
- **ID**: `branch_hunter`
- **Condicions**: `impuls ≥ 0.30` AND `sociabilitat ≤ 0.30`
- **Descripció**: Especialista en la caça activa. Risc alt, reward alt. Acció física, territori, caça a distància.
- **Fantasia**: *"El meu llinatge és impulsiu i independent. Cacem sols o en parelles, espreitem preses grans, assumim riscos que els altres rebutgen. Cada generació és una mica més valenta."*
- **Arc de l'era**: Caçador oportunista (Gen 1) → especialista en llança i territori (Gen 2-3) → xaman-guerrer si combina amb Místic (Gen 4-5)
- **Ancoratge**: Societats de caçadors del Paleolític Superior, caça de mamuts i bissonts. Territorialitat i mobilitat estacional.

### Recol·lector
- **ID**: `branch_gatherer`
- **Condicions**: `impuls ≤ 0.10` AND `intel·lecte ≤ 0.10`
- **Descripció**: Sostenibilitat, paciència, coneixement del terreny. Amplada màxima d'habilitats.
- **Fantasia**: *"El meu llinatge és pacient i intuïtiu. Coneixem el bosc millor que ningú. No fem gestos grans, però mai passem gana."*
- **Arc de l'era**: Recol·lector generalista (Gen 1) → expert en plantes i trampes (Gen 2-3) → proto-agricultora que descobre les llavors (Gen 5)
- **Ancoratge**: Les dones recol·lectores del Paleolític com a columna vertebral de la dieta (70% de calories en moltes societats caçadores-recol·lectores). Coneixement herbari transgeneracional.
- **Nota de disseny**: Branca amb 7 habilitats — la més àmplia. Compensa amb menor risc i menor reward per acció individual.

### Artesà
- **ID**: `branch_craftsman`
- **Condicions**: `intel·lecte ≥ 0.25` AND `impuls ≤ 0.20`
- **Descripció**: Eines especialitzades, millores, intercanvi. Pocs habilitats pròpies però millora els altres.
- **Fantasia**: *"El meu llinatge pensa abans d'actuar. Fabriquem les millors eines del territori. Tothom ve a nosaltres."*
- **Arc de l'era**: Tallador de sílex (Gen 1) → artesà especialitzat en vestimenta i gravat (Gen 2-3) → xarxa d'intercanvi (Gen 4-5)
- **Ancoratge**: Especialistes en talla de sílex del Paleolític (mode 4, làmines de precisió). Evidència d'intercanvi de materials a llarga distància (~300 km).
- **Nota de disseny**: Branca amb 3 habilitats pròpies — la més petita. Els `action_output_bonus` dels artesans milloren l'eficàcia d'accions d'altres branques (via eines compartides).

### Místic
- **ID**: `branch_mystic`
- **Condicions**: `espiritualitat ≥ 0.30` AND `sociabilitat ≥ 0.25`
- **Descripció**: Guariment, ritual, influència social sense combat. Dificultat alimentaria alta, compensació social i de salut.
- **Fantasia**: *"El meu llinatge veu el que els altres no veuen. Curem, expliquem el món, parlem als esperits. El clan ens necessita."*
- **Arc de l'era**: Curador de plantes (Gen 1) → artista i narrador (Gen 2-3) → xaman-sacerdot amb influència territorial (Gen 4-5)
- **Ancoratge**: Evidència de rituals funeraris al Paleolític (~100.000 BP, Qafzeh). Figures de xaman-animal (Hohle Fels). Música i narració com a tecnologia social.
- **Nota de disseny**: Dificultat alimentaria alta (poques accions d'Aliment directes). Compensació: Salut alta, influència social, accés a zones rituals.

---

## Zones d'Intersecció

| Combinació | Condicions de solapament | Narrativa |
|---|---|---|
| Caçador + Místic | `impuls ≥ 0.30` + `espiritualitat ≥ 0.30` + `sociabilitat ≥ 0.25` | El guerrer-xaman. Caça i ritual. Difícil però poderós. |
| Recol·lector + Místic | `impuls ≤ 0.10` + `espiritualitat ≥ 0.30` + `sociabilitat ≥ 0.25` | La guardiana de les plantes. Zona àmplia i natural. |
| Recol·lector + Artesà | `impuls ≤ 0.10` + `intel·lecte ≥ 0.25` | El coneixedor de plantes que millora les eines. Molt accessible. |
| Caçador + Artesà | NO POSSIBLE (impuls incompatible: ≥0.30 vs ≤0.20) | Pont via `bt_rasclador_fi` (compartit). No branca híbrida directa. |

---

## Format data.js

```js
const BRANCHES = [
  {
    id: "branch_hunter",
    name: "Caçador",
    conditions: { operator: "AND", conditions: [
      { axis: "impuls", min: 0.30 },
      { axis: "sociabilitat", max: 0.30 }
    ]}
  },
  {
    id: "branch_gatherer",
    name: "Recol·lector",
    conditions: { operator: "AND", conditions: [
      { axis: "impuls", max: 0.10 },
      { axis: "intel·lecte", max: 0.10 }
    ]}
  },
  {
    id: "branch_craftsman",
    name: "Artesà",
    conditions: { operator: "AND", conditions: [
      { axis: "intel·lecte", min: 0.25 },
      { axis: "impuls", max: 0.20 }
    ]}
  },
  {
    id: "branch_mystic",
    name: "Místic",
    conditions: { operator: "AND", conditions: [
      { axis: "espiritualitat", min: 0.30 },
      { axis: "sociabilitat", min: 0.25 }
    ]}
  }
];
```

---

## Pendents de Revisió

- [ ] La condició Recol·lector (`impuls ≤ 0.10` AND `intel·lecte ≤ 0.10`) és molt restrictiva.
  Un jugador que processa bé l'entorn però no és impulsiu ja no pot ser Recol·lector.
  Verificar si el playtest confirma que la branca s'activa prou sovint.
- [ ] Comunicació de la branca Artesà com a "multiplicador" (millora output dels altres)
  — els jugadors poden no entendre el valor de tenir poques habilitats pròpies.
