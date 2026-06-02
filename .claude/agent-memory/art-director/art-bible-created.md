---
name: art-bible-created
description: Art Bible v1.0 escrita a design/art-bible.md — cobreix estil chibi expressiu pla, paletes per era, sistema de capes Godot 4, specs d'assets i 5 decisions pendents d'il·lustrador
metadata:
  type: project
---

L'Art Bible de Life Tycoon 2 va ser creada a `design/art-bible.md` (2026-06-02).

**Contingut cobert**:
- 3 pilars visuals: Càlidament Humà, Densitat Lleugera, Temps Llegible
- Estil: chibi expressiu pla, referència mestra PRE-MED-M (Recraft AI)
- Proporcions de personatge adult (cap 40%) i infant (cap 50%)
- 4 paletes completes per era (Prehistòria, Neolític, Edat Antiga, Antiguitat Clàssica)
- 4 colors d'eix d'inclinació constants entre eres
- Sistema de capes Godot 4: CanvasLayer z=0/2/5/10 + retrat procedural per sprites
- Nomenclatura de fitxers per a tots els tipus d'asset
- Resolucions: personatge 512px per capa, nodes zona 1024px, icones 512px màster
- Disseny de UI: jerarquia de pantalla principal, overlay events, pantalla puntuació
- Gestalt aplicat: outline 2px per a tocables, flow visual 5 passos
- 5 decisions pendents d'il·lustrador: transicions d'era, mapa de zones, branca activa, genealogia, icones tecns. de branca

**Why**: el joc necessitava una font de veritat visual per garantir coherència entre
personatges generats amb Recraft AI i la UI de Godot 4.

**How to apply**: qualsevol asset nou ha de ser validat contra les especificacions
d'aquest document. Les decisions pendents de la secció 8 han de ser resoltes
abans de produir assets de les categories corresponents.
