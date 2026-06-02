extends Node


func _ready() -> void:
	DataLoader.load_all()

	# Smoke test: print loaded era token name
	var era: Dictionary = DataLoader.eras.get("prehistoria", {})
	var token: Dictionary = era.get("token", {})
	var token_key: String = token.get("name_key", "")
	print("[Main] Era: ", DataLoader.loc("era.prehistoria.name"))
	print("[Main] Token: ", DataLoader.loc(token_key))
	print("[Main] Config inertia: ", DataLoader.config.get("inclination", {}).get("inertia_factor", "?"))
	print("[Main] Ready.")
