# Referència d'imatges de personatges — Tot Controlat

## Posicions a la pantalla

| Posició      | Facció (Vilaturisme) | ID intern   |
|--------------|----------------------|-------------|
| Esquerra     | Residents            | `veins`     |
| Dreta        | Hostalers            | `mercat`    |
| Baix-centre  | Ecologistes          | `activistes`|

---

## Estats d'ànim (variable `{estat}` al nom del fitxer)

| `{estat}` | Rang del valor | Descripció        |
|-----------|----------------|-------------------|
| `1`       | 0 – 20         | Molt enfadats      |
| `2`       | 21 – 40        | Enfadats           |
| `3`       | 41 – 60        | Neutres / normals  |
| `4`       | 61 – 80        | Contents           |
| `5`       | 81 – 100       | Molt contents      |

---

## Llista completa de fitxers (15 imatges)

Carpeta: `src/totcontrolat/`

### Residents (slot esquerra)
```
char_residents_1.png   → molt enfadats  (valor ≤ 20)
char_residents_2.png   → enfadats       (valor ≤ 40)
char_residents_3.png   → normals        (valor ≤ 60)  ← estat inicial
char_residents_4.png   → contents       (valor ≤ 80)
char_residents_5.png   → molt contents  (valor > 80)
```

### Hostalers (slot dreta)
```
char_hostalers_1.png   → molt enfadats  (valor ≤ 20)
char_hostalers_2.png   → enfadats       (valor ≤ 40)
char_hostalers_3.png   → normals        (valor ≤ 60)  ← estat inicial
char_hostalers_4.png   → contents       (valor ≤ 80)
char_hostalers_5.png   → molt contents  (valor > 80)
```

### Ecologistes (slot baix-centre)
```
char_ecologistes_1.png → molt enfadats  (valor ≤ 20)
char_ecologistes_2.png → enfadats       (valor ≤ 40)
char_ecologistes_3.png → normals        (valor ≤ 60)  ← estat inicial
char_ecologistes_4.png → contents       (valor ≤ 80)
char_ecologistes_5.png → molt contents  (valor > 80)
```

---

## Mides recomanades

| Slot         | Amplada | Alçada | Notes                        |
|--------------|---------|--------|------------------------------|
| Esquerra     | 80 px   | 100 px | `object-fit: contain`        |
| Dreta        | 80 px   | 100 px | Pot anar mirant cap a l'esquerra |
| Baix-centre  | 70 px   | 88 px  | Lleugerament més petit        |

Format recomanat: **PNG amb fons transparent**.  
El codi canvia automàticament la imatge quan el valor de la facció canvia de rang.
