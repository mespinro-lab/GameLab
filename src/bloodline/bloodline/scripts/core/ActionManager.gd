extends Node

## Handles action purchase, execution, output calculation, and visibility.
## Token system: every action generates tokens (era currency).
## Food/health changes come from side_effects only, not primary output.

signal action_executed(action_id: String, output: float, side_effects: Array)
signal action_purchased(action_id: String)
signal zone_unlocked(zone_id: String)


# ── Visibility ────────────────────────────────────────────────────────────────

enum Visibility { ACTIVE, LOCKED, HIDDEN }

func get_action_visibility(action: Dictionary) -> Visibility:
	var action_id: String = action.get("id", "")

	# Check requires conditions first (for base and branch actions)
	if not _check_requires(action):
		return Visibility.HIDDEN

	# Base actions are always visible if their zone is discovered
	if action.get("is_base", false):
		var zona: String = action.get("zona", "")
		if zona not in GameState.discovered_zone_ids:
			return Visibility.HIDDEN
		return Visibility.ACTIVE

	# Branch actions require purchase and inclination
	if action_id not in GameState.purchased_action_ids:
		return Visibility.LOCKED

	# Check inclination requirements
	var requirements: Array = action.get("inclination_requirements", [])
	for req: Variant in requirements:
		var r: Dictionary = req as Dictionary
		var axis: String = r.get("axis", "")
		var val: float = GameState.inclination.get(axis, 0.0)
		if r.has("min") and val < float(r["min"]):
			return Visibility.HIDDEN
		if r.has("max") and val > float(r["max"]):
			return Visibility.HIDDEN

	return Visibility.ACTIVE


func can_purchase(action: Dictionary) -> bool:
	var action_id: String = action.get("id", "")
	if action_id in GameState.purchased_action_ids:
		return false
	var cost: float = float(action.get("purchase_cost", 0))
	return GameState.tokens >= cost


# ── Purchase ──────────────────────────────────────────────────────────────────

func purchase_action(action_id: String) -> bool:
	var action: Dictionary = DataLoader.actions.get(action_id, {})
	if action.is_empty() or action.get("is_base", false):
		return false
	if not can_purchase(action):
		return false

	GameState.tokens -= float(action.get("purchase_cost", 0))
	GameState.purchased_action_ids.append(action_id)
	action_purchased.emit(action_id)
	return true


# ── Execute ───────────────────────────────────────────────────────────────────

func execute_action(action_id: String) -> bool:
	var action: Dictionary = _get_executable_action(action_id)
	if action.is_empty():
		return false

	var output: float = _roll_output(action)

	# Primary output → tokens
	GameState.tokens += output

	# Side effects (food, health, etc.)
	var applied_side_effects: Array = _apply_side_effects(action)

	# Inclination
	BranchManager.apply_inclination_deltas(action.get("inclination_deltas", {}))

	# Stat growth
	_apply_stat_growth(action)

	# Special effects (partner, children)
	_apply_special_effect(action)

	# Zone unlock
	var unlocks_zone: String = action.get("unlocks_zone", "")
	if unlocks_zone != "" and unlocks_zone not in GameState.discovered_zone_ids:
		GameState.discovered_zone_ids.append(unlocks_zone)
		zone_unlocked.emit(unlocks_zone)

	# Advance cycle
	GameState.era_cycle += 1
	_apply_food_upkeep()

	action_executed.emit(action_id, output, applied_side_effects)
	return true


func _get_executable_action(action_id: String) -> Dictionary:
	var action: Dictionary = DataLoader.actions.get(action_id, {})
	if action.is_empty():
		return {}
	var is_base: bool = action.get("is_base", false)
	if not is_base and action_id not in GameState.purchased_action_ids:
		return {}
	if get_action_visibility(action) == Visibility.HIDDEN:
		return {}
	return action


func _roll_output(action: Dictionary) -> float:
	var min_out: float = float(action.get("output_min", 0))
	var max_out: float = float(action.get("output_max", 0))
	var stat_key: String = action.get("stat_key", "")
	var stat_val: float = GameState.character_stats.get(stat_key, 1.0) if stat_key != "" else 1.0
	var stat_factor: float = DataLoader.config.get("stats", {}).get("output_factor", 0.1)
	var multiplier: float = 1.0 + (stat_val - 1.0) * stat_factor
	var rolled: float = randf_range(min_out, max_out)
	return roundf(rolled * multiplier)


func _apply_side_effects(action: Dictionary) -> Array:
	var applied: Array = []
	var side_effects: Array = action.get("side_effects", [])
	for se: Variant in side_effects:
		var effect: Dictionary = se as Dictionary
		var resource: String = effect.get("resource", "")
		var delta: float = float(effect.get("delta", 0))
		match resource:
			"food":
				GameState.food = clampf(GameState.food + delta, 0.0, 20.0)
			"health":
				GameState.health = clampf(GameState.health + delta, 0.0, 100.0)
		applied.append({"resource": resource, "delta": delta})
	return applied


func _apply_stat_growth(action: Dictionary) -> void:
	var stat_key: String = action.get("stat_key", "")
	var stat_gain: float = float(action.get("stat_gain", 0.0))
	if stat_key == "" or stat_gain == 0.0:
		return
	var max_stat: float = DataLoader.config.get("stats", {}).get("max_value", 5.0)
	var current: float = GameState.character_stats.get(stat_key, 1.0)
	GameState.character_stats[stat_key] = minf(current + stat_gain, max_stat)


func _check_requires(action: Dictionary) -> bool:
	var min_age: int = int(action.get("min_age", 0))
	if min_age > 0 and LineageManager.character_age() < min_age:
		return false
	var requires: Array = action.get("requires", [])
	for req: Variant in requires:
		var r: Dictionary = req as Dictionary
		match r.get("type", ""):
			"has_partner":
				if not GameState.has_partner:
					return false
			"no_partner":
				if GameState.has_partner:
					return false
			"has_children":
				if GameState.children.is_empty():
					return false
			"max_children":
				if GameState.children.size() >= int(r.get("value", 4)):
					return false
	return true


func _apply_special_effect(action: Dictionary) -> void:
	var effect: Dictionary = action.get("special_effect", {})
	if effect.is_empty():
		return
	match effect.get("type", ""):
		"find_partner":
			GameState.has_partner = true
		"have_child":
			var child: Dictionary = LineageManager.create_child()
			if not child.is_empty():
				action_executed.emit("child_born", 0.0, [{"resource": "child", "label": child.get("label", "")}])
		"teach_child":
			# Mark as having taught — improves inheritance rate
			GameState.has_taught_child = true


func _apply_food_upkeep() -> void:
	var era: Dictionary = DataLoader.eras.get(GameState.current_era_id, {})
	var upkeep: float = float(era.get("food", {}).get("upkeep_per_cycle", 2))
	GameState.food = maxf(GameState.food - upkeep, 0.0)
	if GameState.food <= 0.0:
		GameState.health = maxf(GameState.health - 5.0, 0.0)
