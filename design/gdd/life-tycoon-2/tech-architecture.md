# Life Tycoon 2 — Tech Architecture

**Depèn de**: tots els GDDs de sistema
**Usat per**: implementació (Godot 4)

---

## 1. Overview

Life Tycoon 2 es construeix sobre Godot 4 + GDScript, exportant a iOS i
Android. Tot el contingut del joc viu en fitxers JSON que el motor carrega
en arrencar. El codi no conté cap valor de contingut: eres, branques, accions,
events, tecnologies, badges — tot és dades. Afegir contingut nou és una
operació de fitxers, sense modificar codi.

---

## 2. Player Fantasy (d'aquest sistema)

*[No aplicable — document tècnic intern]*

El criteri d'èxit d'aquesta arquitectura és: un dissenyador de contingut pot
afegir una era completa amb totes les seves branques, accions i events sense
tenir accés al codi font.

---

## 3. Decisions Arquitecturals

### 3.1 Engine i Plataforma

| Decisió | Valor |
|---|---|
| Engine | Godot 4.6 |
| Llenguatge | GDScript (tipat estàtic) |
| Plataforma target | iOS + Android (portrait) |
| Renderitzat | 2D (DOM/CanvasItem) |
| Física | No requerida |

**Per què Godot 4**: exportació nativa iOS/Android, ecosistema 2D madur,
codi obert, i el projecte ja té el motor configurat. El joc és turn-based,
sense requisits de renderitzat complex.

### 3.2 Estructura de Directoris del Projecte

```
src/life-tycoon-2/
    scenes/
        main.tscn               ← escena principal (autoload)
        game/
            era_scene.tscn      ← escena base d'era (reusada per totes les eres)
            zone_panel.tscn     ← panel de zona amb accions
            action_card.tscn    ← carta d'acció
            event_overlay.tscn  ← overlay d'event
        ui/
            era_score.tscn      ← pantalla de puntuació d'era
            chronicle.tscn      ← pantalla de crònica
            badge_map.tscn      ← mapa de badges
            genealogy.tscn      ← arbre genealògic
            main_menu.tscn      ← menú principal
    scripts/
        core/
            GameState.gd        ← estat de partida (singleton)
            DataLoader.gd       ← càrrega de tots els JSONs
            EraManager.gd       ← gestió d'eres, transicions
            BranchManager.gd    ← inclinació, branques, tecns. de branca
            ActionManager.gd    ← compra, execució, upgrades
            EventManager.gd     ← disparo, cadenes, resolució
            ScoringManager.gd   ← càlcul de scores i títols
            LineageManager.gd   ← herència, genealogia, crònica
            BadgeManager.gd     ← avaluació i persistència de badges
        ui/                     ← scripts de UI (un per escena)
        utils/
            SaveSystem.gd           ← save/load de partida i badges
            ChronicleGenerator.gd   ← generació de text de crònica
            LocalizationManager.gd  ← càrrega de locales, funció tr()
            AudioManager.gd         ← escolta senyals, reprodueix sons
```

### 3.3 Estructura de Dades (fitxers JSON)

```
data/
    era_registry.json           ← llista ordenada d'eres
    config.json                 ← tuning knobs globals
    audio_config.json           ← mapatge event → audio_clip_id
    locales/
        ca.json                 ← català (idioma per defecte)
        es.json
        en.json
    badges/
        [badge_id].json
    eras/
        [era_id]/
            era.json
            universal_techs/
                [tech_id].json
            branches/
                [branch_id].json
            branch_techs/
                [tech_id].json
            zones/
                [zone_id].json
            actions/
                [action_id].json
            event_pools/
                [pool_id].json
            events/
                [event_id].json
            pressure_events.json
            chronicle_templates.json
            titles/
                [title_id].json
```

### 3.4 Càrrega de Dades

`DataLoader.gd` carrega tots els JSONs en arrencar l'aplicació i els
indexa en diccionaris en memòria. El temps de càrrega ha de ser < 2s en
dispositius target.

```gdscript
# DataLoader.gd (esquema simplificat)
class_name DataLoader

var eras: Dictionary = {}         # era_id → EraData
var branches: Dictionary = {}     # branch_id → BranchData
var branch_techs: Dictionary = {} # tech_id → BranchTechData
var actions: Dictionary = {}      # action_id → ActionData
var events: Dictionary = {}       # event_id → EventData
var badges: Dictionary = {}       # badge_id → BadgeData
# ...

func load_all() -> void:
    _load_era_registry()
    for era_id in era_registry:
        _load_era(era_id)
    _load_badges()
```

Tots els objectes de dades son `Resource` de Godot (o diccionaris tipats).
El motor no crea classes de contingut — tot és dades llegides dels JSONs.

### 3.5 GameState (Singleton)

`GameState.gd` és l'autoload que conté tot l'estat de la partida en curs.
Es serialitza per al save. No conté lògica de joc — és un contenidor d'estat
pur.

```gdscript
# GameState.gd (camps principals)
var dynasty_name: String
var current_era_id: String
var era_cycle: int
var current_char: CharacterState
var universal_techs: Array[String]
var branch_techs_discovered: Array[String]
var actions_purchased: Array[String]
var discovered_actions: Array[String]    # acció revelada per branch_tech (comprable però no comprada)
var inclination: Dictionary              # axis_id → float [-1.0, 1.0]
var reputation: float
var resources: Dictionary               # resource_id → float
var genealogy: Array[CharacterState]
var chronicle_events: Array[Dictionary]
var era_scores: Array[Dictionary]
var current_locale: String               # "ca" | "es" | "en" (default: "ca")
```

### 3.6 Save System

**Partida**: `user://save_game.json` — serialització de `GameState`.
**Badges**: `user://badges_progress.json` — persistent entre partides.
**Historial**: `user://run_history.json` — últimes N partides completades.

Format: JSON (llegible, portable). Versió de schema inclosa per a migració futura.

### 3.7 Editor de Dades

L'editor de dades existent (`tools/data-editor.html`) pot evolucionar per
suportar l'estructura de fitxers de LT2. Com que tot és JSON, l'editor no
necessita canvis de motor — és un formulari web que llegeix/escriu els
mateixos fitxers que el joc.

Prioritat de l'editor per a producció:
1. Edició d'accions (el contingut més freqüent)
2. Edició d'events (segon més freqüent)
3. Edició de branques i tecnologies
4. Validació de connectors entre eres (alerta si no coincideixen)

### 3.8 Validació de Dades en Arrencar

`DataLoader` ha de validar en arrencar:
- Tots els `entry_connector` / `exit_connector` entre eres consecutives coincideixen.
- Tots els `universal_prereq` de branch techs referencien universals existents.
- Tots els `zone_id` de les accions referencien zones existents.
- Tots els `event_pool_id` de les accions referencien pools existents.
- Cap event `is_skippable: false` sense opció sense requisits.
- Tots els `unlocks_action_ids` de branch techs referencien accions existents.
- Tots els string keys de les dades existeixen al fitxer de localització per defecte (`ca`).

Errors de validació = crash intencional amb missatge clar. No silenciar.

### 3.9 Internacionalització (i18n)

**Principi**: cap string de jugador hardcoded. Tot text visible al jugador
(noms, descripcions, plantilles de crònica) és una clau de localització.

**Convenció de claus**:
```
[era_id].[entity_type].[entity_id].[field]

Exemples:
  era1.branch.hunter.name          → "Caçador"
  era1.branch.hunter.description   → "Força física, caça i territori."
  era1.action.hunt_deer.name       → "Caça de Cérvol"
  era1.branch_tech.war_cry.name    → "Crit de Guerra"
  global.indicator.health.name     → "Salut"
```

**Fitxers de localització**:
```
data/locales/
    ca.json      ← català (idioma per defecte i autoria)
    es.json      ← castellà
    en.json      ← anglès
```

Cada fitxer és un diccionari pla de `clau → string`:
```json
{
  "era1.branch.hunter.name": "Caçador",
  "era1.branch.hunter.description": "Força física, caça i territori."
}
```

**Flux de resolució** (en `DataLoader`):
```gdscript
func tr(key: String) -> String:
    var locale_dict = _locales[GameState.current_locale]
    return locale_dict.get(key, "[MISSING: %s]" % key)
```

Les claus absents retornen `[MISSING: key]` en loc de crashar — facilita la
detecció de strings no traduïts sense bloquejar el joc.

**Autoria de contingut**: tots els JSON de contingut usen claus als camps
player-facing (`name`, `description`, `text`, templates de crònica). El
fitxer `ca.json` és el que s'omple en paral·lel a la creació de contingut.

**Idiomes suportats en launch**: ca + es com a mínim. en opcionalment.
Afegir un idioma nou = crear el fitxer `[lang].json` sense tocar codi.

### 3.10 Sistema d'Àudio

**Principi**: el codi de joc emet senyals d'events d'àudio; `AudioManager.gd`
les escolta i reprodueix els assets corresponents. Cap so hardcoded al codi
de lògica.

**Senyals d'àudio (anchors)**:

| Event | Senyal | Moment |
|---|---|---|
| Acció comprada | `action_purchased(action_id)` | Confirmació de compra |
| Acció executada | `action_executed(action_id, roll)` | Inici d'execució |
| Habilitat desbloquejada | `branch_tech_unlocked(tech_id)` | En desbloquejar |
| Tecnologia universal apareix | `universal_tech_appeared(tech_id)` | Notificació UI |
| Event trigat | `event_triggered(event_id)` | Aparició de l'overlay |
| Era transition | `era_transition_started` / `era_transition_completed` | Pantalles de score/crònica |
| Successió | `succession_happened` | Mort del personatge |
| Game over | `game_over` | Arbre genealògic exhaurit |
| Noves habilitats disponibles | `new_branch_techs_available` | Notificació UI |

**`AudioManager.gd`** (singleton/autoload):
- Escolta les senyals globals.
- Mapeja `event → audio_clip_id` via `data/audio_config.json`.
- `data/audio_config.json` permet canviar qualsevol so sense tocar codi.

**Fase actual**: les senyals es defineixen ara. Els assets (`*.ogg`, `*.wav`)
i `audio_config.json` son tasca de la Fase de Polish.

---

## 4. Fórmules

*[No aplicable — document d'arquitectura, no de mecàniques]*

---

## 5. Casos Extrems

- **JSON malformat**: `DataLoader` reporta l'error amb el path del fitxer i
  la línia (si disponible). L'aplicació no arrenca fins que el JSON és vàlid.

- **Era DLC no carregada** (fitxers absents): `era_registry.json` referencia
  un `era_id` que no té directori. `DataLoader` ho marca com a "era no
  disponible" i el `EraManager` la salta en construir la cadena.

- **Migració de save** (nova versió del schema): `SaveSystem` comprova la
  versió del save. Si és anterior, aplica un migrador (un per versió). Si no
  hi ha migrador, avisa l'usuari que el save no és compatible.

- **Dispositiu sense espai per guardar**: `SaveSystem` retorna error i mostra
  missatge a l'usuari. El joc continua en memòria però avisa que no es guarda.

- **Clau de localització absent**: `tr(key)` retorna `[MISSING: key]` visible
  a la UI. No crasha. La validació de `DataLoader` avisa en arrencar.

- **Idioma no suportat** (ex. `fr` sense fitxer `fr.json`): `LocalizationManager`
  fa fallback a `ca`. Mai string buit ni crash.

- **Senyal d'àudio sense asset configurat**: `AudioManager` ignora l'event
  silenciosament. El joc no crasha per un so absent.

---

## 6. Dependències

| Sistema | Relació |
|---|---|
| Tots els GDDs | `DataLoader` llegeix tots els schemas definits als GDDs. |
| `badge-system.md` | `BadgeManager` usa fitxer de save separat. |
| `era-system.md` | `DataLoader` valida coherència de connectors. |

---

## 7. Tuning Knobs

| Knob | Fitxer | Descripció |
|---|---|---|
| Tots els knobs globals | `data/config.json` | Fitxer únic de configuració global (W_TECH, W_RARE, EVENT_CHAIN_DECAY, etc.). |
| Knobs per era | `data/eras/[era_id]/era.json` | Knobs específics de cada era (BASE_CYCLES, etc.). |

Tots els tuning knobs definits als GDDs de sistema han d'estar a `data/config.json`
o al `era.json` corresponent. Cap valor de tuning al codi.

---

## 8. Criteris d'Acceptació

- [ ] Afegir una era nova (fitxers JSON) és detectat automàticament pel motor
      sense canvis de codi
- [ ] `DataLoader` reporta error clar si un connector d'era no coincideix
      (no arrenca silenciosament amb dades inconsistents)
- [ ] El save de partida es carrega correctament després d'un tancament forçat
      de l'app (iOS/Android background kill)
- [ ] Els badges persisteixen en desinstal·lar i reinstal·lar (via iCloud/
      Google Drive backup) — o almenys es documenta que no persisten si
      el backup no és configurat
- [ ] El temps de càrrega inicial (DataLoader) és < 2s en un dispositiu de
      gamma mitjana (iPhone 12 / equivalent Android)
- [ ] Un canvi en qualsevol tuning knob de `data/config.json` es reflecteix
      en el joc sense recompilar
- [ ] Canviar l'idioma a `es` mostra tots els strings en castellà sense reiniciar
- [ ] Una clau absent als fitxers de localització mostra `[MISSING: key]`
      a la UI i és reportada per `DataLoader` en arrencar
- [ ] Un event de joc (acció executada, habilitat desbloquejada) emet la senyal
      d'àudio corresponent sense que el codi de lògica de joc en sàpiga res
