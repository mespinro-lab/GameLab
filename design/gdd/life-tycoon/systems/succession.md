# Sistema de Successió i Mort

---

## Mort per salut

La salut és una **barra visible** que es consumeix per:
- Projectes de risc fallats (caça, exploració)
- Events negatius
- Subsistència insuficient (riquesa < cost base)
- Envelliment: −2 salut/cicle un cop passat el 80% de la vida base de l'era

Quan la barra arriba a 0 → mort del personatge → **pantalla de successió**.

La salut NO es recupera automàticament. Es recupera via:
- Projecte `care_home`
- Alguns events positius
- Coneixements mèdics (eres posteriors)

---

## Retirada anticipada (mort voluntària)

El jugador pot tancar la vida d'un personatge abans que la salut arribi a 0.

**Efecte**: aplica el trait `dark_legacy` (Llegat Fosc) al fill escollit.
- `dark_legacy`: −15% Reputació familiar durant 3 cicles del fill
- Es revela com a trait visible a la carta del fill (no ocult)
- No bloqueja el joc — és un cost narratiu i estratègic

**Quan té sentit usar-la**: el personatge actual té stats pobres, el fill té molt potencial, i el jugador prefereix sacrificar reputació temporal per avançar la línia generacional.

---

## Pantalla de successió

S'activa quan el personatge mor (salut = 0 o retirada anticipada).

### Layout

```
┌─────────────────────────────────────────┐
│  [Nom] ha mort als [X] anys             │
│  [Era] · [Cicle X de Y]                 │
│                                         │
│  ┌──────────┐  ┌──────────┐             │
│  │ [retrat] │  │ [retrat] │  ...        │
│  │  Arn     │  │  Berta   │             │
│  │          │  │          │             │
│  │"Talent   │  │"Resolució│             │
│  │ innato   │  │ davant   │             │
│  │ lideratge│  │ l'adversi│             │
│  │          │  │ tat"     │             │
│  │ ✦ ?  ?  │  │ ✦ ✦  ?  │             │
│  └──────────┘  └──────────┘             │
│                                         │
│  [💾 Guarda abans d'escollir]           │
│                                         │
│  [Continua amb Arn →]  [Continua amb Berta →]
└─────────────────────────────────────────┘
```

### Carta de fill

- **Retrat procedural**: heretat dels pares amb variació
- **Nom**: generat per era i cultura
- **Virtut narrativa**: 1 frase que descriu el potencial sense numèrics
- **Traits**: 2–3 icones. Alguns visibles (✦), alguns ocults (?). Els ocults es revelen els primers 2–3 cicles de joc.
- **Cap barra de stats visible**: la carta és una promesa narrativa, no una fitxa de RPG

### Fills no disponibles

Si el jugador no té fills en el moment de morir → **Fi del llinatge** (game over real).

Si el jugador té 1 fill → no hi ha elecció, es continua directament.

---

## Sistema de Save / Reload

El joc suggereix guardar **just abans** de la pantalla de successió (botó prominent).

Si el fill escollit mor prematurament (sense fills propis):
1. El joc detecta la condició de Fi de llinatge
2. Ofereix tornar al darrer **checkpoint de successió**
3. El jugador pot escollir un fill diferent del que va prendre originalment

**Límit**: el reload de successió no és infinit. Si tots els fills han mort sense descendència → Fi del llinatge definitiu.

---

## Herència en el pas generacional

En iniciar el cicle amb el nou personatge, s'hereten:

| Recurs | % heretat | Modificador |
|---|---|---|
| Riquesa | 30–60% | Modificat per nombre de fills (es divideix) |
| Coneixement | 35–50% per element | Modificat per `raise_children` i Intel fill |
| Reputació familiar | 100% | No es divideix — és del llinatge |
| Stats físics/intel/social | No directes | Herència via traits i potencial del fill |

---

## Generació de fills

Els fills es generen quan el jugador executa el projecte `have_children`.

### Algorisme de generació

```
fill.physical   = clamp(avg(pare.physical, mare.physical) + random(-1, +1), 1, 10)
fill.intelligence = clamp(avg(pare.intel, mare.intel) + random(-1, +1), 1, 10)
fill.social     = clamp(avg(pare.social, mare.social) + random(-1, +1), 1, 10)
fill.traits     = [1 trait de pare, 1 trait de mare, 1 trait aleatori d'era]
```

La parella aporta els seus traits (desconeguts en part fins que es "descobreix" via el projecte `find_partner`).

### Virtut narrativa

Mapejada des del stat més alt del fill:

| Stat dominant | Virtut exemple |
|---|---|
| Físic | "La seva força és llegendària fins i tot de petit" |
| Intel·ligència | "Té un talent innato per entendre el món" |
| Social | "Fa amics allà on va, fins i tot entre desconeguts" |
| Equilibrat | "No destaca en res però mai falla en res" |
