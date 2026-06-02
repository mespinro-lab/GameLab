extends Node


func _ready() -> void:
	DataLoader.load_all()

	# Smoke test: print loaded era token name
	var era := DataLoader.eras.get("prehistoria", {})
	var token_key: String = era.get("token", {}).get("name_key", "")
	print("[Main] Era: ", DataLoader.loc("era.prehistoria.name"))
	print("[Main] Token: ", DataLoader.loc(token_key))
	print("[Main] Config inertia: ", DataLoader.config.get("inclination", {}).get("inertia_factor", "?"))
	print("[Main] Ready.")
