extends Node

## Persists GameState to disk. Survives OS background-kill on iOS/Android.
## Schema version 1 — migrator slot ready for future versions.

const SAVE_PATH: String = "user://bloodline_save.json"
const SCHEMA_VERSION: int = 1

signal game_saved()
signal game_loaded()


func save() -> void:
	var data: Dictionary = _serialize()
	var json: String = JSON.stringify(data, "\t")
	var file: FileAccess = FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file == null:
		push_error("[SaveSystem] Cannot open save file for writing")
		return
	file.store_string(json)
	file.close()
	game_saved.emit()


func load_save() -> bool:
	if not FileAccess.file_exists(SAVE_PATH):
		return false
	var file: FileAccess = FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file == null:
		return false
	var text: String = file.get_as_text()
	file.close()

	var parsed: Variant = JSON.parse_string(text)
	if parsed == null or not (parsed is Dictionary):
		push_error("[SaveSystem] Corrupt save file")
		return false

	var data: Dictionary = parsed as Dictionary
	var version: int = int(data.get("schema_version", 0))
	_migrate(data, version)
	_deserialize(data)
	game_loaded.emit()
	return true


func has_save() -> bool:
	return FileAccess.file_exists(SAVE_PATH)


func delete_save() -> void:
	if FileAccess.file_exists(SAVE_PATH):
		DirAccess.remove_absolute(SAVE_PATH)


# ── Serialization ─────────────────────────────────────────────────────────────

func _serialize() -> Dictionary:
	return {
		"schema_version": SCHEMA_VERSION,
		"current_era_id": GameState.current_era_id,
		"era_cycle": GameState.era_cycle,
		"generation": GameState.generation,
		"food": GameState.food,
		"health": GameState.health,
		"tokens": GameState.tokens,
		"inclination": GameState.inclination.duplicate(),
		"character_label": GameState.character_label,
		"character_birth_cycle": GameState.character_birth_cycle,
		"character_stats": GameState.character_stats.duplicate(),
		"discovered_universal_tech_ids": GameState.discovered_universal_tech_ids.duplicate(),
		"unlocked_skill_ids": GameState.unlocked_skill_ids.duplicate(),
		"purchased_action_ids": GameState.purchased_action_ids.duplicate(),
		"discovered_zone_ids": GameState.discovered_zone_ids.duplicate(),
		"children": GameState.children.duplicate(true),
		"sibling_pool": GameState.sibling_pool.duplicate(true),
		"dynasty_name": GameState.dynasty_name,
		"genealogy": GameState.genealogy.duplicate(true),
	}


func _deserialize(data: Dictionary) -> void:
	GameState.current_era_id = data.get("current_era_id", "")
	GameState.era_cycle = int(data.get("era_cycle", 0))
	GameState.generation = int(data.get("generation", 1))
	GameState.food = float(data.get("food", 12.0))
	GameState.health = float(data.get("health", 100.0))
	GameState.tokens = float(data.get("tokens", 0.0))
	GameState.character_label = data.get("character_label", "")
	GameState.character_birth_cycle = int(data.get("character_birth_cycle", 0))
	GameState.dynasty_name = data.get("dynasty_name", "")

	var incl: Variant = data.get("inclination", {})
	if incl is Dictionary:
		GameState.inclination = incl as Dictionary

	var stats: Variant = data.get("character_stats", {})
	if stats is Dictionary:
		GameState.character_stats = stats as Dictionary

	GameState.discovered_universal_tech_ids = _to_string_array(data.get("discovered_universal_tech_ids", []))
	GameState.unlocked_skill_ids = _to_string_array(data.get("unlocked_skill_ids", []))
	GameState.purchased_action_ids = _to_string_array(data.get("purchased_action_ids", []))
	GameState.discovered_zone_ids = _to_string_array(data.get("discovered_zone_ids", []))

	GameState.children = _to_dict_array(data.get("children", []))
	GameState.sibling_pool = _to_dict_array(data.get("sibling_pool", []))
	GameState.genealogy = _to_dict_array(data.get("genealogy", []))


func _migrate(data: Dictionary, from_version: int) -> void:
	# No-op migrator slot — extend when schema changes in future versions
	if from_version == SCHEMA_VERSION:
		return
	push_warning("[SaveSystem] Save schema v%d → v%d (no migration defined)" % [from_version, SCHEMA_VERSION])


func _to_string_array(raw: Variant) -> Array[String]:
	var result: Array[String] = []
	if not (raw is Array):
		return result
	for item: Variant in (raw as Array):
		result.append(str(item))
	return result


func _to_dict_array(raw: Variant) -> Array[Dictionary]:
	var result: Array[Dictionary] = []
	if not (raw is Array):
		return result
	for item: Variant in (raw as Array):
		if item is Dictionary:
			result.append(item as Dictionary)
	return result
