extends Node


func _ready() -> void:
	DataLoader.load_all()
	EraManager.start_era("prehistoria")
	GameState.dynasty_name = "Test"
	GameState.character_label = "Auri"

	print("[Main] Era: ", DataLoader.loc("era.prehistoria.name"))
	print("[Main] Token: ", DataLoader.loc("era.prehistoria.token.name"))
	print("[Main] Food: ", GameState.food, " | Health: ", GameState.health)

	# Save/load smoke test
	SaveSystem.save()
	var old_food: float = GameState.food
	GameState.food = 0.0
	SaveSystem.load_save()
	print("[Main] Save/Load OK: ", GameState.food == old_food)

	print("[Main] Ready.")
