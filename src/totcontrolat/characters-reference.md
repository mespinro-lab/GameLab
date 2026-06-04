# Referència d'imatges de personatges — Tot Controlat

## Patró de nom de fitxer

```
char_{facció}_{versió}_{estat}.png
```

| Variable    | Descripció                                              |
|-------------|---------------------------------------------------------|
| `{facció}`  | `residents`, `hostalers`, `ecologistes`                 |
| `{versió}`  | `01` per defecte · `02`, `03`… per variants per món    |
| `{estat}`   | `1`–`5` (1 = molt enfadat, 5 = molt content)           |

---

## Posicions a la pantalla

| Posició      | Facció       | ID intern    |
|--------------|--------------|--------------|
| Esquerra     | Residents    | `veins`      |
| Dreta        | Hostalers    | `mercat`     |
| Baix-centre  | Ecologistes  | `activistes` |

---

## Estats d'ànim (`{estat}`)

| `{estat}` | Rang del valor | Descripció       |
|-----------|----------------|------------------|
| `1`       | 0 – 20         | Molt enfadats     |
| `2`       | 21 – 40        | Enfadats          |
| `3`       | 41 – 60        | Neutres / normals |
| `4`       | 61 – 80        | Contents          |
| `5`       | 81 – 100       | Molt contents     |

---

## Llista completa versió 01 (15 imatges)

Carpeta: `src/totcontrolat/`

### Residents (slot esquerra)
```
char_residents_01_1.png   → molt enfadats  (valor ≤ 20)
char_residents_01_2.png   → enfadats       (valor ≤ 40)
char_residents_01_3.png   → normals        (valor ≤ 60)  ← estat inicial
char_residents_01_4.png   → contents       (valor ≤ 80)
char_residents_01_5.png   → molt contents  (valor > 80)
```

### Hostalers (slot dreta)
```
char_hostalers_01_1.png   → molt enfadats  (valor ≤ 20)
char_hostalers_01_2.png   → enfadats       (valor ≤ 40)
char_hostalers_01_3.png   → normals        (valor ≤ 60)  ← estat inicial
char_hostalers_01_4.png   → contents       (valor ≤ 80)
char_hostalers_01_5.png   → molt contents  (valor > 80)
```

### Ecologistes (slot baix-centre)
```
char_ecologistes_01_1.png → molt enfadats  (valor ≤ 20)
char_ecologistes_01_2.png → enfadats       (valor ≤ 40)
char_ecologistes_01_3.png → normals        (valor ≤ 60)  ← estat inicial
char_ecologistes_01_4.png → contents       (valor ≤ 80)
char_ecologistes_01_5.png → molt contents  (valor > 80)
```

---

## Mides recomanades

| Slot         | Amplada | Alçada | Notes                             |
|--------------|---------|--------|-----------------------------------|
| Esquerra     | 80 px   | 100 px | `object-fit: contain`             |
| Dreta        | 80 px   | 100 px | Pot mirar cap a l'esquerra        |
| Baix-centre  | 70 px   | 88 px  | Lleugerament més petit            |

Format: **PNG amb fons transparent**.

---

## Afegir una nova versió de personatge

1. Crea les 5 imatges amb el nou número de versió, p. ex. `char_residents_02_*.png`
2. A `events.js`, afegeix `charVersion` al `factionConfig` del món:
   ```js
   factionConfig: {
     veins: { icon: '🏠', name: 'Residents', charVersion: '02' },
     ...
   }
   ```
3. Actualitza `CHAR_BASES` a `game.js` perquè llegeixi `charVersion` de `S.worldConfig`.
