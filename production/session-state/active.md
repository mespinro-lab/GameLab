<!-- STATUS -->
Epic: Spín — Fase 2 (prototip Unity)
Feature: Grup 1 complet (nivells 1-7), tots els sistemes de §12
Task: Implementació completa escrita; pendent d'obrir a Unity Editor (mai compilat/provat aquí)
<!-- /STATUS -->

## Resum sessió 2026-07-19 — Spín, implementació inicial del prototip

Nou joc, nou projecte Unity a `Spin/` (independent de Bloodline). Implementat directament
seguint `design/spin.md` v1.1 sencer, sense passar per `/create-epics`/`/create-stories`.

### Restricció clau d'aquesta sessió
Cap Unity Editor, dotnet, ni compilador de C# disponibles a l'entorn. Tot el codi s'ha escrit
"a cegues" i verificat només per lectura/traça manual — mai compilat. Vegeu
`docs/architecture/ADR-002-spin-unity-ui-architecture.md` per les decisions tècniques que això
va motivar (escena única, UI Toolkit construïda per codi en lloc de UXML, etc.) i la checklist
de verificació pendent.

### Implementat
- **Model pur** (R1-R19 complet): `GridModel`, `TurnManager`, `PatrolStrategy`, tipus de suport
- **7 nivells del Grup 1**: JSON a `StreamingAssets/Levels/`, verificats per script contra §8
- **Localització**: ca/es/en completes (40 claus), parser JSON flat propi (JsonUtility no
  suporta Dictionary), fallback per clau a `en`
- **Persistència**: `SaveData`/`SaveManager`, reset silenciós si corromput
- **Tutorial**: `TutorialManager` amb cua d'un sol tip visible, els 8 tips de §9.5
- **Vista/UI**: `ScreenManager` + 6 `IScreenController` (MainMenu/LevelMap/Game/Victory/Defeat/
  PuzzleComplete), tots construïts per codi (UI Toolkit sense fitxers .uxml), `GridView`+
  `GameInputController` (swipe+tap via `PointerEvent.target`, sense paquet Input System)
- **Tests EditMode**: 6 fitxers, cobreixen totes les regles R1-R17 explícitament
- **ADR-002**: documenta les decisions tècniques i el risc de coneixement (Unity 6.3 post-cutoff)

### Pendent (acció de Marc, no de Claude Code)
1. Crear el projecte buit amb Unity Hub (plantilla 3D Core/Built-in RP, Unity 6.3 LTS) a la
   mateixa carpeta `Spin/` — vegeu ADR-002 i el missatge final de la sessió per instruccions
2. Obrir a l'Editor, afegir `Bootstrap.unity` a Build Settings com a escena 0
3. Córrer el Test Runner (EditMode) — primera verificació real de tot el codi escrit
4. Provar els 7 nivells de principi a fi; verificar 60fps en mòbil (criteri 6 de §12)

### Desviacions del pla aprovat (documentades a ADR-002)
- Pantalles construïdes per codi (VisualElement en C#) en lloc de fitxers `.uxml`/`.uss` per
  pantalla — mateixa funcionalitat, menys risc de path/schema no verificable a cegues

---

## Bloodline — estat anterior (preservat, no tocat aquesta sessió)

<!-- El joc actiu principal segueix sent Bloodline (prototypes/bloodline-v2/); aquesta sessió
     ha estat íntegrament sobre Spín, un projecte nou i separat. -->

### Resum sessió 2026-07-11
- ✅ EVENT-DISC-RACE: alineament ordre drain/render (commit ffa124e), 22/22 tests passen

### Sessions anteriors (commits 5a0b9d7, 73b6ede)
- SEQ-ARCH: pipeline async complet (TOKEN-FLIGHT eliminat, SEQ-01 resolt)
- BALANCE R1–R8: 24 canvis (Místic food, risc Caçador, eines, tokens, UTs)
- SEQ-02: renderAll() al final de drainPendingCards (partner warning)
- PIPELINE-BLOCK: _pipelineRunning guard a handlers de zones/shop

### Backlog obert
- DESIGN-02-IMPL [7]: Cadena lliure d'eines + "eines conegudes" (complex)
- DESIGN-02-IMPL [8]: Panell d'identitat de branca (UI)
- S3-06: Dead zone Gen 2 cicles 16–36 (parcialment millorat per R6 ut_art 36→34)

### DEFERRED
- ECON-03, ECON-04 (fins que playtest ho justifiqui)
