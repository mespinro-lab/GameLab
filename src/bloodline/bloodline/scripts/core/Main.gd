extends Node


const GameScreenScript = preload("res://scripts/ui/GameScreen.gd")


func _ready() -> void:
	DataLoader.load_all()

	if SaveSystem.has_save():
		SaveSystem.load_save()
	else:
		EraManager.start_era("prehistoria")
		GameState.dynasty_name = "Llinatge"
		GameState.character_label = "Auri"
		# Start with Campament discovered
		if "Campament" not in GameState.discovered_zone_ids:
			GameState.discovered_zone_ids.append("Campament")
		# Base actions pre-purchased
		for action_id: String in DataLoader.actions:
			var action: Dictionary = DataLoader.actions[action_id]
			if action.get("is_base", false):
				if action_id not in GameState.purchased_action_ids:
					GameState.purchased_action_ids.append(action_id)

	var screen := GameScreenScript.new()
	add_child(screen)
