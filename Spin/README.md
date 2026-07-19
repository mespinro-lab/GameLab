# Spín — Unity Prototype (Fase 2)

Implementació del Grup 1 (nivells 1-7) segons `design/spin.md` v1.1. Vegeu
`docs/architecture/ADR-002-spin-unity-ui-architecture.md` (a l'arrel del repo) per les decisions
tècniques i el seu raonament.

**Important:** aquest codi es va escriure sense Unity Editor, dotnet, ni cap compilador de C#
disponibles. **No s'ha compilat ni obert mai.** Els passos següents són la primera verificació real.

## Primer cop obrint el projecte

1. **Crear el projecte Unity Hub** (si `ProjectSettings/`/`Packages/` encara no existeixen aquí):
   - Unity Hub → New Project → Unity **6.3 LTS** → plantilla **"3D Core" (Built-in Render Pipeline)**
     — explícitament NO URP/HDRP/2D
   - Nom: `Spin`, ubicació: la carpeta pare d'aquest repo (`GameLab/`), de manera que el projecte
     quedi a `GameLab/Spin/` i es fusioni amb l'`Assets/` ja existent
   - Si Unity Hub es queixa de carpeta no buida: crea el projecte en una carpeta temporal i
     copia `ProjectSettings/` + `Packages/` cap aquí manualment
2. Un cop obert, verifica a **Window → Package Manager** que **Test Framework** estigui instal·lat
   (sol venir per defecte als projectes moderns)
3. **File → Build Settings** → afegeix `Assets/Scenes/Bootstrap.unity` com a escena 0
4. **Window → General → Test Runner → EditMode → Run All** — primera compilació i execució reals
   de tot el model i els tests

## Si alguna cosa no compila

- `PanelSettings`/`UIDocument` (`Assets/Scripts/App/GameBootstrap.cs`): si algun camp
  (`scaleMode`, `screenMatchMode`, `match`) ha canviat de nom a 6.3, l'error de compilació ho
  assenyalarà exactament — són els únics camps de risc "post-cutoff" (vegeu ADR-002)
- Si `Bootstrap.unity` no s'obre net: solució de reserva — crea una escena nova buida, afegeix
  un GameObject buit anomenat "Bootstrap" amb el component `GameBootstrap`, i una Main Camera
- Si el Test Runner no mostra `Spin.Tests.EditMode`: Package Manager → afegeix `Test Framework`

## Estructura

- `Assets/Scripts/Model/` — lògica pura (R1-R19), sense dependència de `MonoBehaviour`
- `Assets/Scripts/Level/`, `Localization/`, `Persistence/`, `Tutorial/` — capes de suport,
  només toquen Unity per I/O (StreamingAssets, persistentDataPath)
- `Assets/Scripts/App/` — `GameBootstrap` (arrel de composició), `GameServices`, `GameSession`
- `Assets/Scripts/View/` — tota la UI construïda **per codi** (UI Toolkit, sense fitxers `.uxml`)
- `Assets/Tests/EditMode/` — tests unitaris del model
- `Assets/StreamingAssets/{Levels,Localization}/` — dades i i18n en JSON pla

## Pendent (fora d'abast d'aquesta implementació)

- Art i so reals (Fase 4) — `AudioClip` deixats sense assignar a `ExitFeedbackController`
- Guineu i serp (Grup 2/3) — `IMovementStrategy` ja preparat, no implementat
- Verificació de 60fps en dispositiu real
