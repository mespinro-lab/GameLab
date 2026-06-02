# Paleolític — Universal Technologies
**Estat**: IMPORTAT de data.js — 2026-06-02
**Font**: `prototypes/bloodline/data.js` (UNIVERSAL_TECHS)
**Nombre de techs**: 7
**Escala**: ERA_CYCLES = 100 (cicles totals de l'era, multi-generació)

---

## Llista de Tecnologies

| ID | Nom | Cicle ERA | Generació aprox. | Eix afavorit | Connector |
|---|---|---|---|---|---|
| `ut_foc` | El Foc | 10 | Gen 1 | universal | no |
| `ut_eines` | Les Eines | 22 | Gen 2 | intel·lecte / impuls | no |
| `ut_art` | L'Art | 36 | Gen 2+ | espiritualitat | no |
| `ut_vestimenta` | La Vestimenta | 50 | Gen 3 | intel·lecte | no |
| `ut_corda` | La Corda | 65 | Gen 4 | impuls / intel·lecte | no |
| `ut_ceramica` | La Ceràmica | 80 | Gen 4+ | intel·lecte | no |
| `ut_agricultura` | L'Agricultura | 92 | Gen 5 | universal | **SÍ** |

---

## Detalls

### El Foc
- **ID**: `ut_foc`
- **Cicle ERA**: 10 (Gen 1)
- **Icona**: 🔥
- **Prerequisit**: cap
- **Eix afavorit**: universal (totes les branques se'n beneficien)
- **Descripció**: "Fabricació intencional del foc amb sílex i pirita. Cuina, calor, llum i protecció nocturna."
- **Efecte**: `healthBonus: 10` (+10 Salut — menjar cuit)
- **Justificació**: Control del foc (~400.000 BP, adoptat universalment al Paleolític Superior). Transforma la dieta, la protecció i els cicles socials nocturns.
- **Format data.js**:
  ```js
  { id: "ut_foc", name: "El Foc", icon: "🔥", cycle: 10,
    description: "...", effect: { healthBonus: 10, desc: "+10 Salut (menjar cuit)" } }
  ```

### Les Eines
- **ID**: `ut_eines`
- **Cicle ERA**: 22 (Gen 2)
- **Icona**: 🪨
- **Prerequisit**: `ut_foc`
- **Eix afavorit**: intel·lecte (artesans) + impuls (caçadors)
- **Descripció**: "Fulloles de sílex de precisió: formes especialitzades per a caça, tall i gravat."
- **Efecte**: null
- **Justificació**: Mode 4 del Paleolític Superior (~45.000 BP): làmines de sílex primes, puntes de projectil. Diferenciador tecnològic de l'era.
- **Format data.js**:
  ```js
  { id: "ut_eines", name: "Les Eines", icon: "🪨", cycle: 22,
    description: "...", effect: null }
  ```

### L'Art
- **ID**: `ut_art`
- **Cicle ERA**: 36 (Gen 2+)
- **Icona**: 🎨
- **Prerequisit**: `ut_foc`
- **Eix afavorit**: espiritualitat (místics) + sociabilitat (cohesió social)
- **Descripció**: "Pintures a les roques, figurines d'ivori, flautes d'os. El clan comença a explicar el món."
- **Efecte**: null
- **Justificació**: Art rupestre de Chauvet (~36.000 BP), Venus de Hohle Fels (~40.000 BP). Pensament simbòlic i abstracte.
- **Format data.js**:
  ```js
  { id: "ut_art", name: "L'Art", icon: "🎨", cycle: 36,
    description: "...", effect: null }
  ```

### La Vestimenta
- **ID**: `ut_vestimenta`
- **Cicle ERA**: 50 (Gen 3)
- **Icona**: 🧵
- **Prerequisit**: `ut_eines`
- **Eix afavorit**: intel·lecte (artesans tèxtils)
- **Descripció**: "Agulles d'os per cosir pells. Roba que protegeix del fred i permet explorar climes extrems."
- **Efecte**: `healthBonus: 15` (+15 Salut — abric del fred)
- **Justificació**: Agulles d'os (~45.000 BP, Yana, Sibèria). Permet colonitzar climes freds; transforma la supervivència.
- **Format data.js**:
  ```js
  { id: "ut_vestimenta", name: "La Vestimenta", icon: "🧵", cycle: 50,
    description: "...", effect: { healthBonus: 15, desc: "+15 Salut (abric del fred)" } }
  ```

### La Corda
- **ID**: `ut_corda`
- **Cicle ERA**: 65 (Gen 4)
- **Icona**: 🪢
- **Prerequisit**: `ut_vestimenta`
- **Eix afavorit**: impuls (caçadors, trampes) + intel·lecte (artesans)
- **Descripció**: "Fibres vegetals trenzades. Trampes, cistelles, arcs i balses transformen el territori."
- **Efecte**: null
- **Justificació**: Fibres vegetals trenzades (~28.000 BP, Dolní Věstonice). Trampes i arcs revolucionen la caça; cistelles permeten transport i emmagatzematge.
- **Format data.js**:
  ```js
  { id: "ut_corda", name: "La Corda", icon: "🪢", cycle: 65,
    description: "...", effect: null }
  ```

### La Ceràmica
- **ID**: `ut_ceramica`
- **Cicle ERA**: 80 (Gen 4+)
- **Icona**: 🏺
- **Prerequisit**: `ut_foc`
- **Eix afavorit**: intel·lecte + sociabilitat (intercanvi, emmagatzematge col·lectiu)
- **Descripció**: "Argila cuita al foc. Emmagatzematge, cocció avançada i conservació de provisions."
- **Efecte**: null
- **Nota de disseny**: Cicle 80 = Gen 4+. Contingut de progressió dinàstica intencional.
- **Justificació**: Ceràmica de Dolní Věstonice (~26.000 BP) i Xina (~20.000 BP). Emmagatzematge i cocció avançada.
- **Format data.js**:
  ```js
  { id: "ut_ceramica", name: "La Ceràmica", icon: "🏺", cycle: 80,
    description: "...", effect: null }
  ```

### L'Agricultura ⭐ CONNECTOR
- **ID**: `ut_agricultura`
- **Cicle ERA**: 92 (Gen 5)
- **Icona**: 🌾
- **Prerequisit**: `ut_corda` + `ut_ceramica`
- **Eix afavorit**: universal (porta a l'Era 2 — Neolític)
- **Descripció**: "Primera sembra intencional i selecció de llavors. L'era prehistòrica arriba al seu límit."
- **Efecte**: null (l'efecte és la transició d'era)
- **Connector**: SÍ — exit cap al Neolític
- **Nota de disseny**: Cicle 92 = Gen 5. Només assequible en la darrera generació de l'era. La descoberta és l'event de transició.
- **Format data.js**:
  ```js
  { id: "ut_agricultura", name: "L'Agricultura", icon: "🌾", cycle: 92,
    description: "...", effect: null }
  ```

---

## Notes de Distribució

**Cobertura per eix:**
- **Impuls** (caçadors, acció directa): ut_eines (puntes), ut_corda (trampes, arcs)
- **Intel·lecte** (artesans, anàlisi): ut_eines, ut_vestimenta, ut_corda, ut_ceramica
- **Espiritualitat** (místics): ut_art (pintura, ritual)
- **Sociabilitat** (lideratge social): ut_foc (cohesió nocturna), ut_ceramica (intercanvi)
- **Universal** (totes les branques): ut_foc, ut_agricultura

**Distribució temporal per generació:**
- Gen 1 (cicles 1-20): El Foc
- Gen 2 (cicles 21-40): Les Eines, L'Art
- Gen 3 (cicles 41-60): La Vestimenta
- Gen 4 (cicles 61-80): La Corda, La Ceràmica
- Gen 5 (cicles 81-100): L'Agricultura (connector)

**Nota**: La Ceràmica i L'Agricultura (Gen 4-5) son techs de progressió dinàstica intencional.
Un clan que arriba a l'Agricultura ha jugat ~4-5 generacions i té un llinatge establert.

---

## Pendents de Revisió

- [ ] Verificar si `ut_ceramica` i `ut_agricultura` necessiten un prerequisit mutu o
  si el jugador pot arribar a l'Agricultura sense Ceràmica
- [ ] Definir l'efecte de `ut_art`, `ut_corda`, `ut_ceramica` (ara null) — podrien
  tenir efectes passius menors (Salut, Provisions, o desbloqueig de zona)
- [ ] Comunicació al jugador que ut_ceramica i ut_agricultura son de Gen 4-5
  ("Llegat dinàstic" al Glossari)
