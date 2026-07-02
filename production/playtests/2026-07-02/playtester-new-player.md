# New Player Audit — ERA1-CONTENT — 2026-07-02

**Scope**: 128 accions TdB + 16 TdBs (commit 5964ebd)
**Auditor**: playtester-new-player (parlant de català, sense experiència prèvia)

## Resum Executiu

Auditoria de **128 accions + 16 TdBs** afegits via ERA1-CONTENT.

**Veredicte**: ✅ **CLEAR TO SHIP** — Tots els noms i descripcions en català. Zero placeholders, zero text en anglès.

---

## S2 — Confusió Major (Acció sense nom / Text en anglès)

**Status**: ✅ ZERO issues

### Accions (128 verificades)
- **Tots 128 noms** (`name`): Català evocador ✓
- **Totes 128 descripcions**: Català narratiu en 1a persona ✓
- **Placeholders**: Cap ("TODO", "FIXME", "test", "unnamed") ✓
- **Text anglès al contingut jugable**: Cap ✓

**Mostra aleatòria de noms verificats:**
- "Caça a l'Aguait" (TdB 1)
- "Rostir la Caça" (TdB 3)
- "Marcar el Territori" (TdB 7)
- "La Veu que Perdura" (TdB 8)
- "L'Expedició" (TdB 10)
- "La Primera Espiga" (TdB 15)
- "La Roda de l'Any" (TdB 16)

### TdBs (16 verificats)
- **Noms TdB**: 16/16 en català, evocadors del Paleolític ✓
  - "Els Rastres del Món" (👣)
  - "La Pedra que Talla" (🪨)
  - "El Cercle del Foc" (🔥)
  - "La Nit Domada" (🌒)
  - "La Mà que Transforma" (🔧)
  - "El Pes i la Palanca" (⚖️)
  - "Els Símbols a la Pedra" (🎨)
  - "La Veu que Perdura" (🗣️)
  - "La Segona Pell" (🧵)
  - "El Camí Llarg" (🥾)
  - "El Nus que Reté" (🪢)
  - "Els Fils del Clan" (🤝)
  - "El Vas que Guarda" (🏺)
  - "El Fang i el Forn" (♨️)
  - "La Llavor Confiada" (🌱)
  - "El Cicle de les Estacions" (🌗)

---

## S3 — Issues de Claredat

**Status**: ✅ ZERO issues

### Terminologia Consistent
- **"Cicle"** (unitat de temps): No causa confusió ✓
- **"TdB"** (Tecnologia de Branca): Consistent ✓
- **"Destresa"**: Consistent ✓
- **"Branques"** (Caçador, Recol·lector, Artesà, Místic): Context clar ✓
- **"Aliment"** (no "Food"): Consistent ✓

### Missatges de Log
- Format: `[Cicle N] Nom Acció` (game.js ~1140)
- Idioma: Català ✓
- "Descoberta:", "Fill nascut:" — en català ✓

---

## S4 — Cosmètics

**Status**: ✅ EXCEL·LENT

### Emojis Consistents
- 🌾 Aliment · 🔵 Token · 🪨 Pedra · 🌿 Branques · 🔧 Eines ✓

### Descripcions Narratives
- Tonus immersiu, primera persona ✓
- Sense veu mecànica pura ✓
- Exemples excel·lents:
  - "Segueixes el ramat, esculls el moment i abats una presa a mans nues."
  - "Pintes la cacera a la paret. Cada visitant que la mira fa créixer el teu nom."
  - "El clan sencer estira les cordes i la pedra s'alça. Ara el cel sap que hi sou."

---

## Contingut Verificat OK

| TdB | Nom | Accions | Status |
|-----|-----|---------|--------|
| 1 | Els Rastres del Món | 8 | ✓ |
| 2 | La Pedra que Talla | 8 | ✓ |
| 3 | El Cercle del Foc | 8 | ✓ |
| 4 | La Nit Domada | 8 | ✓ |
| 5 | La Mà que Transforma | 8 | ✓ |
| 6 | El Pes i la Palanca | 8 | ✓ |
| 7 | Els Símbols a la Pedra | 8 | ✓ |
| 8 | La Veu que Perdura | 8 | ✓ |
| 9 | La Segona Pell | 8 | ✓ |
| 10 | El Camí Llarg | 8 | ✓ |
| 11 | El Nus que Reté | 8 | ✓ |
| 12 | Els Fils del Clan | 8 | ✓ |
| 13 | El Vas que Guarda | 8 | ✓ |
| 14 | El Fang i el Forn | 8 | ✓ |
| 15 | La Llavor Confiada | 8 | ✓ |
| 16 | El Cicle de les Estacions | 8 | ✓ |

**Total**: 128 accions TdB verificades. Camps verificats: `name`, `description`, `output_resource`, `side_effects`, `stat_key`.

### Issues NO Trobades
- ✅ Cap nom en anglès
- ✅ Cap descripció en anglès
- ✅ Cap placeholder
- ✅ Cap emoji inconsistent
- ✅ Cap camp `name` o `description` buit

## Recomanacions UX (no són bugs)
1. Tooltip o descripció visual per a les Branques quan apareixen per primera vegada (concepte abstracte).
2. Marcatge visual d'accions desbloqueades nouvingudes (⭐ o ⚡) si es vol destacar.
3. Verificar que la UI mostri clarament que la Llar apareix condicionalment.
