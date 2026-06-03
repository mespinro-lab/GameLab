extends Node

const GameScreenScript = preload("res://scripts/ui/GameScreen.gd")
const NewGameScreenScript = preload("res://scripts/ui/NewGameScreen.gd")

var _current_screen: Control


func _ready() -> void:
	DataLoader.load_all()

	if SaveSystem.has_save():
		SaveSystem.load_save()
		_launch_game()
	else:
		_launch_new_game_screen()


func _launch_new_game_screen() -> void:
	var screen := NewGameScreenScript.new()
	screen.game_started.connect(_on_game_started)
	_swap_screen(screen)


func _on_game_started(dynasty_name: String) -> void:
	_init_new_game(dynasty_name)
	_launch_game()


func _init_new_game(dynasty_name: String) -> void:
	GameState.reset()
	EraManager.start_era("prehistoria")
	GameState.dynasty_name = dynasty_name
	GameState.character_label = _pick_starting_name()
	if "Campament" not in GameState.discovered_zone_ids:
		GameState.discovered_zone_ids.append("Campament")
	for action_id: String in DataLoader.actions:
		var action: Dictionary = DataLoader.actions[action_id]
		if action.get("is_base", false):
			if action_id not in GameState.purchased_action_ids:
				GameState.purchased_action_ids.append(action_id)


func _launch_game() -> void:
	var screen := GameScreenScript.new()
	screen.request_new_game.connect(func() -> void:
		SaveSystem.delete_save()
		GameState.reset()
		_launch_new_game_screen())
	_swap_screen(screen)


func _swap_screen(screen: Control) -> void:
	if _current_screen != null:
		_current_screen.queue_free()
	_current_screen = screen
	add_child(screen)


func _pick_starting_name() -> String:
	var names: Array[String] = [
		"Auri", "Brant", "Cels", "Dorma", "Elva",
		"Fura", "Gall", "Hern", "Ibra", "Jord"
	]
	return names[randi() % names.size()]
