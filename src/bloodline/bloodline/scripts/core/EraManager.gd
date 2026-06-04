extends Node

## Manages era progression: universal tech auto-discovery and era transitions.

signal universal_tech_discovered(tech: Dictionary)
signal era_completed(era_id: String)


func start_era(era_id: String) -> void:
	GameState.current_era_id = era_id
	var era: Dictionary = DataLoader.eras.get(era_id, {})
	GameState.food = float(era.get("food", {}).get("start_val", 12))
	GameState.health = float(era.get("health", {}).get("start_val", 100))
	GameState.tokens = float(era.get("token", {}).get("start_val", 10))
	var entry_zone: String = era.get("entry_zone", "Campament")
	if entry_zone not in GameState.discovered_zone_ids:
		GameState.discovered_zone_ids.append(entry_zone)


func check_universal_techs() -> void:
	var era: Dictionary = DataLoader.eras.get(GameState.current_era_id, {})
	var techs: Array = era.get("universal_techs", [])
	for tech: Variant in techs:
		var t: Dictionary = tech as Dictionary
		var tech_id: String = t.get("id", "")
		if tech_id in GameState.discovered_universal_tech_ids:
			continue
		if GameState.era_cycle >= int(t.get("cycle", 999)):
			GameState.discovered_universal_tech_ids.append(tech_id)
			_apply_tech_effect(t)
			universal_tech_discovered.emit(t)


func check_era_complete() -> bool:
	var era: Dictionary = DataLoader.eras.get(GameState.current_era_id, {})
	var exit_connector: String = era.get("exit_connector", "")
	if exit_connector == "":
		return GameState.era_cycle >= int(era.get("era_cycles", 100))
	return exit_connector in GameState.discovered_universal_tech_ids


func _apply_tech_effect(tech: Dictionary) -> void:
	var effect: Dictionary = tech.get("effect", {})
	if effect.is_empty():
		return
	var health_bonus: int = int(effect.get("healthBonus", 0))
	if health_bonus > 0:
		GameState.health = minf(GameState.health + health_bonus, 100.0)


func get_era_progress_pct() -> float:
	var era: Dictionary = DataLoader.eras.get(GameState.current_era_id, {})
	var total: int = int(era.get("era_cycles", 100))
	return clampf(float(GameState.era_cycle) / float(total), 0.0, 1.0)
