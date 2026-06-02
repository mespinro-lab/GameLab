extends Node

# Loaded data (populated by load_all)
var config: Dictionary = {}
var eras: Dictionary = {}          # era_id -> era data
var universal_techs: Dictionary = {} # tech_id -> tech data
var branches: Dictionary = {}      # branch_id -> branch data
var skills: Dictionary = {}        # skill_id -> skill data
var actions: Dictionary = {}       # action_id -> action data
var events: Dictionary = {}        # event_id -> event data
var locales: Dictionary = {}       # locale_code -> flat dict of keys


func load_all() -> void:
	_load_config()
	_load_locale("ca")
	_load_era("prehistoria")
	print("[DataLoader] Loaded OK — era: prehistoria")


func loc(key: String, locale: String = "ca") -> String:
	if not locales.has(locale):
		return "[MISSING LOCALE: %s]" % locale
	return locales[locale].get(key, "[MISSING: %s]" % key)


func _load_config() -> void:
	config = _read_json("res://data/config.json")


func _load_locale(code: String) -> void:
	var data: Dictionary = _read_json("res://data/locales/%s.json" % code)
	locales[code] = data


func _load_era(era_id: String) -> void:
	var era: Dictionary = _read_json("res://data/eras/%s/era.json" % era_id)
	eras[era_id] = era
	for action: Variant in era.get("actions", []):
		var a: Dictionary = action as Dictionary
		var action_id: String = a.get("id", "")
		if action_id != "":
			actions[action_id] = a


func _read_json(path: String) -> Dictionary:
	if not FileAccess.file_exists(path):
		push_error("[DataLoader] File not found: %s" % path)
		return {}
	var file: FileAccess = FileAccess.open(path, FileAccess.READ)
	var text: String = file.get_as_text()
	file.close()
	var parsed: Variant = JSON.parse_string(text)
	if parsed == null or not (parsed is Dictionary):
		push_error("[DataLoader] Invalid JSON: %s" % path)
		return {}
	return parsed as Dictionary
