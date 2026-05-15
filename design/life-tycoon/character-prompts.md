# Life Tycoon — Prompts de personatges

## Sistema de referències

Cada prompt indica quina imatge carregar com a **Style Reference** a Recraft.
La cadena de referències garanteix coherència visual entre tots els personatges.

**Eina**: Recraft AI v4.1 · **Rati**: 3:4 · **Fons**: white background (eliminar després amb remove.bg)

```
PRE-MED-M (base)
├── PRE-AFR-M → PRE-AFR-F → PRE-AFR-C
├── PRE-IND-M → PRE-IND-F → PRE-IND-C
├── PRE-ORI-M → PRE-ORI-F → PRE-ORI-C
└── PRE-MED-F → PRE-MED-C
    │
    ▼ cada mascle prehistoric genera el seu equivalent de les altres eres
PRE-MED-M → NEO-MED-M → NEO-MED-F → NEO-MED-C
PRE-AFR-M → NEO-AFR-M → NEO-AFR-F → NEO-AFR-C
PRE-IND-M → NEO-IND-M → NEO-IND-F → NEO-IND-C
PRE-ORI-M → NEO-ORI-M → NEO-ORI-F → NEO-ORI-C
    (mateix patró per ANT i CLA)
```

**Codis**: PRE=Prehistòria · NEO=Neolític · ANT=Edat Antiga · CLA=Antiguitat Clàssica
**Races**: MED=Mediterrani · AFR=Africà · IND=Indoeuropeu · ORI=Orient Pròxim
**Gènere**: M=Mascle adult · F=Femella adulta · C=Infant (neutre)

---

## ERA 1 — PREHISTÒRIA

### Mascles adults

**PRE-MED-M** ✓ ja generat — és la imatge base de tot el projecte

---

**PRE-AFR-M** · Ref: PRE-MED-M
```
prehistoric male character, West African features, dark brown skin, black coiled hair, dark eyes, different face from reference, same chibi cartoon art style as reference, rough animal fur tunic, wooden spear, barefoot, bone necklace, full body standing pose, white background
```

---

**PRE-IND-M** · Ref: PRE-MED-M
```
prehistoric male character, Northern European features, fair skin, light brown hair, blue eyes, different face from reference, same chibi cartoon art style as reference, rough animal fur tunic, wooden spear, barefoot, full body standing pose, white background
```

---

**PRE-ORI-M** · Ref: PRE-MED-M
```
prehistoric male character, Near Eastern features, tan skin, dark straight hair, dark eyes, different face from reference, same chibi cartoon art style as reference, rough animal fur tunic, wooden spear, barefoot, bone bracelet, full body standing pose, white background
```

---

### Femelles adultes

**PRE-MED-F** · Ref: PRE-MED-M
```
prehistoric female character, Mediterranean features, olive skin, dark wavy hair, brown eyes, female face different from reference male, same chibi cartoon art style as reference, rough animal fur dress, woven basket, barefoot, bone hair pin, full body standing pose, white background
```

---

**PRE-AFR-F** · Ref: PRE-AFR-M
```
prehistoric female character, West African features, dark brown skin, black coiled hair, dark eyes, female face different from reference male, same chibi cartoon art style as reference, rough animal fur dress, woven basket, barefoot, full body standing pose, white background
```

---

**PRE-IND-F** · Ref: PRE-IND-M
```
prehistoric female character, Northern European features, fair skin, light brown hair, blue eyes, female face different from reference male, same chibi cartoon art style as reference, rough animal fur dress, woven basket, barefoot, full body standing pose, white background
```

---

**PRE-ORI-F** · Ref: PRE-ORI-M
```
prehistoric female character, Near Eastern features, tan skin, dark straight hair, dark eyes, female face different from reference male, same chibi cartoon art style as reference, rough animal fur dress, woven basket, barefoot, full body standing pose, white background
```

---

### Infants

**PRE-MED-C** · Ref: PRE-MED-M
```
prehistoric child character, Mediterranean features, olive skin, dark hair, brown eyes, younger smaller child face, same chibi cartoon art style as reference, small animal fur tunic, holding a stick, barefoot, curious happy expression, full body standing pose, white background
```

---

**PRE-AFR-C** · Ref: PRE-AFR-M
```
prehistoric child character, West African features, dark brown skin, black coiled hair, dark eyes, younger smaller child face, same chibi cartoon art style as reference, small animal fur tunic, holding a stone, barefoot, curious happy expression, full body standing pose, white background
```

---

**PRE-IND-C** · Ref: PRE-IND-M
```
prehistoric child character, Northern European features, fair skin, light hair, blue eyes, younger smaller child face, same chibi cartoon art style as reference, small animal fur tunic, holding a stick, barefoot, curious happy expression, full body standing pose, white background
```

---

**PRE-ORI-C** · Ref: PRE-ORI-M
```
prehistoric child character, Near Eastern features, tan skin, dark hair, dark eyes, younger smaller child face, same chibi cartoon art style as reference, small animal fur tunic, holding a small stone, barefoot, curious happy expression, full body standing pose, white background
```

---

## ERA 2 — NEOLÍTIC

### Mascles adults

**NEO-MED-M** · Ref: PRE-MED-M
```
Neolithic male character, Mediterranean features, olive skin, dark wavy hair, brown eyes, same chibi cartoon art style as reference, simple woven linen tunic with belt, holding a clay pot, leather sandals, clay bead necklace, full body standing pose, white background
```

---

**NEO-AFR-M** · Ref: PRE-AFR-M
```
Neolithic male character, West African features, dark brown skin, black coiled hair, dark eyes, same chibi cartoon art style as reference, simple woven linen tunic with belt, holding a clay pot, leather sandals, full body standing pose, white background
```

---

**NEO-IND-M** · Ref: PRE-IND-M
```
Neolithic male character, Northern European features, fair skin, light brown hair, blue eyes, same chibi cartoon art style as reference, simple woven linen tunic with belt, holding a sickle, leather sandals, full body standing pose, white background
```

---

**NEO-ORI-M** · Ref: PRE-ORI-M
```
Neolithic male character, Near Eastern features, tan skin, dark straight hair, dark eyes, same chibi cartoon art style as reference, simple woven linen tunic with belt, holding a clay pot, leather sandals, full body standing pose, white background
```

---

### Femelles adultes

**NEO-MED-F** · Ref: NEO-MED-M
```
Neolithic female character, Mediterranean features, olive skin, dark wavy hair, brown eyes, female face different from reference male, same chibi cartoon art style as reference, woven linen dress with belt, clay pot on hip, leather sandals, full body standing pose, white background
```

---

**NEO-AFR-F** · Ref: NEO-AFR-M
```
Neolithic female character, West African features, dark brown skin, black coiled hair, dark eyes, female face different from reference male, same chibi cartoon art style as reference, woven linen dress, clay pot on hip, leather sandals, full body standing pose, white background
```

---

**NEO-IND-F** · Ref: NEO-IND-M
```
Neolithic female character, Northern European features, fair skin, light brown hair, blue eyes, female face different from reference male, same chibi cartoon art style as reference, woven linen dress, holding grain sheaf, leather sandals, full body standing pose, white background
```

---

**NEO-ORI-F** · Ref: NEO-ORI-M
```
Neolithic female character, Near Eastern features, tan skin, dark straight hair, dark eyes, female face different from reference male, same chibi cartoon art style as reference, woven linen dress, clay pot on hip, leather sandals, full body standing pose, white background
```

---

### Infants

**NEO-MED-C** · Ref: NEO-MED-M
```
Neolithic child character, Mediterranean features, olive skin, dark hair, brown eyes, younger smaller child face, same chibi cartoon art style as reference, simple linen tunic, holding a small clay figure, barefoot, happy expression, full body standing pose, white background
```

---

**NEO-AFR-C** · Ref: NEO-AFR-M
```
Neolithic child character, West African features, dark brown skin, black coiled hair, dark eyes, younger smaller child face, same chibi cartoon art style as reference, simple linen tunic, holding a small clay figure, barefoot, happy expression, full body standing pose, white background
```

---

**NEO-IND-C** · Ref: NEO-IND-M
```
Neolithic child character, Northern European features, fair skin, light hair, blue eyes, younger smaller child face, same chibi cartoon art style as reference, simple linen tunic, holding a small clay figure, barefoot, happy expression, full body standing pose, white background
```

---

**NEO-ORI-C** · Ref: NEO-ORI-M
```
Neolithic child character, Near Eastern features, tan skin, dark hair, dark eyes, younger smaller child face, same chibi cartoon art style as reference, simple linen tunic, holding a small clay pot, barefoot, happy expression, full body standing pose, white background
```

---

## ERA 3 — EDAT ANTIGA

### Mascles adults

**ANT-MED-M** · Ref: NEO-MED-M
```
Ancient Age male character, Mediterranean features, olive skin, dark wavy hair, brown eyes, same chibi cartoon art style as reference, linen tunic with leather belt, leather sandals, holding a bronze short sword, headband, full body standing pose, white background
```

---

**ANT-AFR-M** · Ref: NEO-AFR-M
```
Ancient Age male character, West African features, dark brown skin, black coiled hair, dark eyes, same chibi cartoon art style as reference, linen tunic with leather belt, leather sandals, holding a bronze short sword, full body standing pose, white background
```

---

**ANT-IND-M** · Ref: NEO-IND-M
```
Ancient Age male character, Northern European features, fair skin, light brown hair, blue eyes, same chibi cartoon art style as reference, linen tunic with leather belt, leather sandals, holding a writing tablet, full body standing pose, white background
```

---

**ANT-ORI-M** · Ref: NEO-ORI-M
```
Ancient Age male character, Near Eastern features, tan skin, dark straight hair, dark eyes, same chibi cartoon art style as reference, linen tunic with leather belt, leather sandals, holding a clay writing tablet, full body standing pose, white background
```

---

### Femelles adultes

**ANT-MED-F** · Ref: ANT-MED-M
```
Ancient Age female character, Mediterranean features, olive skin, dark wavy hair, brown eyes, female face different from reference male, same chibi cartoon art style as reference, draped linen dress with belt, leather sandals, holding an oil lamp, full body standing pose, white background
```

---

**ANT-AFR-F** · Ref: ANT-AFR-M
```
Ancient Age female character, West African features, dark brown skin, black coiled hair, dark eyes, female face different from reference male, same chibi cartoon art style as reference, draped linen dress with belt, leather sandals, holding an amphora, full body standing pose, white background
```

---

**ANT-IND-F** · Ref: ANT-IND-M
```
Ancient Age female character, Northern European features, fair skin, light brown hair, blue eyes, female face different from reference male, same chibi cartoon art style as reference, draped linen dress with belt, leather sandals, holding an oil lamp, full body standing pose, white background
```

---

**ANT-ORI-F** · Ref: ANT-ORI-M
```
Ancient Age female character, Near Eastern features, tan skin, dark straight hair, dark eyes, female face different from reference male, same chibi cartoon art style as reference, draped linen dress with belt, leather sandals, holding a clay tablet, full body standing pose, white background
```

---

### Infants

**ANT-MED-C** · Ref: ANT-MED-M
```
Ancient Age child character, Mediterranean features, olive skin, dark hair, brown eyes, younger smaller child face, same chibi cartoon art style as reference, short linen tunic, small leather sandals, holding a wax tablet, happy expression, full body standing pose, white background
```

---

**ANT-AFR-C** · Ref: ANT-AFR-M
```
Ancient Age child character, West African features, dark brown skin, black coiled hair, dark eyes, younger smaller child face, same chibi cartoon art style as reference, short linen tunic, small leather sandals, holding a wax tablet, happy expression, full body standing pose, white background
```

---

**ANT-IND-C** · Ref: ANT-IND-M
```
Ancient Age child character, Northern European features, fair skin, light hair, blue eyes, younger smaller child face, same chibi cartoon art style as reference, short linen tunic, small leather sandals, holding a wax tablet, happy expression, full body standing pose, white background
```

---

**ANT-ORI-C** · Ref: ANT-ORI-M
```
Ancient Age child character, Near Eastern features, tan skin, dark hair, dark eyes, younger smaller child face, same chibi cartoon art style as reference, short linen tunic, small leather sandals, holding a small clay tablet, happy expression, full body standing pose, white background
```

---

## ERA 4 — ANTIGUITAT CLÀSSICA

### Mascles adults

**CLA-MED-M** · Ref: ANT-MED-M
```
Classical Antiquity male character, Mediterranean features, olive skin, dark wavy hair, brown eyes, same chibi cartoon art style as reference, white toga with colored border, leather sandals, holding a scroll, laurel wreath, full body standing pose, white background
```

---

**CLA-AFR-M** · Ref: ANT-AFR-M
```
Classical Antiquity male character, West African features, dark brown skin, black coiled hair, dark eyes, same chibi cartoon art style as reference, white toga with colored border, leather sandals, holding a scroll, full body standing pose, white background
```

---

**CLA-IND-M** · Ref: ANT-IND-M
```
Classical Antiquity male character, Northern European features, fair skin, light brown hair, blue eyes, same chibi cartoon art style as reference, white toga with colored border, leather sandals, holding a scroll, full body standing pose, white background
```

---

**CLA-ORI-M** · Ref: ANT-ORI-M
```
Classical Antiquity male character, Near Eastern features, tan skin, dark straight hair, dark eyes, same chibi cartoon art style as reference, white toga with colored border, leather sandals, holding a scroll, full body standing pose, white background
```

---

### Femelles adultes

**CLA-MED-F** · Ref: CLA-MED-M
```
Classical Antiquity female character, Mediterranean features, olive skin, dark wavy hair, brown eyes, female face different from reference male, same chibi cartoon art style as reference, flowing stola dress, leather sandals, holding an amphora, hair pinned up, full body standing pose, white background
```

---

**CLA-AFR-F** · Ref: CLA-AFR-M
```
Classical Antiquity female character, West African features, dark brown skin, black coiled hair, dark eyes, female face different from reference male, same chibi cartoon art style as reference, flowing stola dress, leather sandals, holding a scroll, full body standing pose, white background
```

---

**CLA-IND-F** · Ref: CLA-IND-M
```
Classical Antiquity female character, Northern European features, fair skin, light brown hair, blue eyes, female face different from reference male, same chibi cartoon art style as reference, flowing stola dress, leather sandals, holding an amphora, full body standing pose, white background
```

---

**CLA-ORI-F** · Ref: CLA-ORI-M
```
Classical Antiquity female character, Near Eastern features, tan skin, dark straight hair, dark eyes, female face different from reference male, same chibi cartoon art style as reference, flowing stola dress, leather sandals, holding a scroll, full body standing pose, white background
```

---

### Infants

**CLA-MED-C** · Ref: CLA-MED-M
```
Classical Antiquity child character, Mediterranean features, olive skin, dark hair, brown eyes, younger smaller child face, same chibi cartoon art style as reference, short toga, small leather sandals, holding a wax tablet, school bag, happy expression, full body standing pose, white background
```

---

**CLA-AFR-C** · Ref: CLA-AFR-M
```
Classical Antiquity child character, West African features, dark brown skin, black coiled hair, dark eyes, younger smaller child face, same chibi cartoon art style as reference, short toga, small leather sandals, holding a wax tablet, happy expression, full body standing pose, white background
```

---

**CLA-IND-C** · Ref: CLA-IND-M
```
Classical Antiquity child character, Northern European features, fair skin, light hair, blue eyes, younger smaller child face, same chibi cartoon art style as reference, short toga, small leather sandals, holding a wax tablet, happy expression, full body standing pose, white background
```

---

**CLA-ORI-C** · Ref: CLA-ORI-M
```
Classical Antiquity child character, Near Eastern features, tan skin, dark hair, dark eyes, younger smaller child face, same chibi cartoon art style as reference, short toga, small leather sandals, holding a small scroll, happy expression, full body standing pose, white background
```

---

## Resum

| | MED | AFR | IND | ORI |
|---|---|---|---|---|
| **PRE** M/F/C | ✓/·/· | ·/·/· | ·/·/· | ·/·/· |
| **NEO** M/F/C | ·/·/· | ·/·/· | ·/·/· | ·/·/· |
| **ANT** M/F/C | ·/·/· | ·/·/· | ·/·/· | ·/·/· |
| **CLA** M/F/C | ·/·/· | ·/·/· | ·/·/· | ·/·/· |

**Total: 48 personatges** · Marca ✓ quan cada un estigui generat i aprovat.
