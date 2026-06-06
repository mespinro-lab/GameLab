extends Node

## Handles event triggering, option resolution, and chain decay.

signal event_triggered(event: Dictionary)
signal event_resolved(event_id: String, option_index: int, effects: Array)
signal skill_discovered(skill_id: String)

var _pending_event: Dictionary = {}


func try_trigger_event(pool_id: String) -> bool:
	if _pending_event.size() > 0:
		return false

	var pool: Array = DataLoader.events.get(pool_id, [])
	if pool.is_empty():
		return false

	var trigger_chance: float = DataLoader.config.get("events", {}).get("trigger_chance", 0.35)
	if randf() >= trigger_chance:
		return false

	var eligible: Array = _get_eligible_events(pool)
	if eligible.is_empty():
		return false

	_pending_event = eligible[randi() % eligible.size()]
	GameState.pending_event = _pending_event
	event_triggered.emit(_pending_event)
	return true


func resolve_option(option_index: int) -> void:
	if _pending_event.is_empty():
		return
	var options: Array = _pending_event.get("options", [])
	if option_index < 0 or option_index >= options.size():
		return

	var opt: Dictionary = options[option_index] as Dictionary
	var applied: Array = []

	# Apply option effects
	var food_delta: float = float(opt.get("food_delta", 0))
	var health_delta: float = float(opt.get("health_delta", 0))
	var token_delta: float = float(opt.get("token_delta", opt.get("material_delta", 0)))

	var era: Dictionary = DataLoader.eras.get(GameState.current_era_id, {})
	var max_food: float = float(era.get("food", {}).get("max_val", 20.0))
	var max_hp: float = float(era.get("health", {}).get("max_val", 100.0))
	if food_delta != 0.0:
		GameState.food = clampf(GameState.food + food_delta, 0.0, max_food)
		applied.append({"resource": "food", "delta": food_delta})
	if health_delta != 0.0:
		GameState.health = clampf(GameState.health + health_delta, 0.0, max_hp)
		applied.append({"resource": "health", "delta": health_delta})
	if token_delta != 0.0:
		GameState.tokens = maxf(GameState.tokens + token_delta, 0.0)
		applied.append({"resource": "tokens", "delta": token_delta})

	# Skill discovery
	if opt.get("discovers", false):
		var skill_id: String = _pending_event.get("discovery_skill_id", "")
		if skill_id != "" and skill_id not in GameState.unlocked_skill_ids:
			GameState.unlocked_skill_ids.append(skill_id)
			_apply_skill_passive_effect(skill_id)
			skill_discovered.emit(skill_id)

	# skill_modifier: conditional health effect based on skill possession
	var modifier: Dictionary = opt.get("skill_modifier", {})
	if not modifier.is_empty():
		var has_skill: bool = modifier.get("skill_id", "") in GameState.unlocked_skill_ids
		var h_delta: float = 0.0
		if has_skill:
			h_delta = float(modifier.get("present_health_delta", 0))
		else:
			var absent_options: Array = modifier.get("absent_health_options", [])
			if absent_options.is_empty():
				h_delta = float(modifier.get("absent_health_delta", 0))
			else:
				h_delta = float(absent_options[randi() % absent_options.size()])
		if h_delta != 0.0:
			GameState.health = clampf(GameState.health + h_delta, 0.0, 100.0)
			applied.append({"resource": "health", "delta": h_delta})

	var event_id: String = _pending_event.get("id", "")
	if _pending_event.get("is_single_use", false) and event_id not in GameState.fired_single_use_event_ids:
		GameState.fired_single_use_event_ids.append(event_id)

	event_resolved.emit(event_id, option_index, applied)
	_clear_event()


func dismiss_simple_event() -> void:
	if _pending_event.is_empty():
		return
	var era: Dictionary = DataLoader.eras.get(GameState.current_era_id, {})
	var max_food: float = float(era.get("food", {}).get("max_val", 20.0))
	var max_hp: float = float(era.get("health", {}).get("max_val", 100.0))
	var effects: Dictionary = _pending_event.get("effects", {})
	if effects.has("food"):
		GameState.food = clampf(GameState.food + float(effects["food"]), 0.0, max_food)
	if effects.has("health"):
		GameState.health = clampf(GameState.health + float(effects["health"]), 0.0, max_hp)
	var ev_id: String = _pending_event.get("id", "")
	if _pending_event.get("is_single_use", false) and ev_id not in GameState.fired_single_use_event_ids:
		GameState.fired_single_use_event_ids.append(ev_id)
	event_resolved.emit(ev_id, -1, [])
	_clear_event()


func has_pending_event() -> bool:
	return _pending_event.size() > 0


func get_pending_event() -> Dictionary:
	return _pending_event


func _apply_skill_passive_effect(skill_id: String) -> void:
	var skill: Dictionary = DataLoader.skills.get(skill_id, {})
	var effect: Variant = skill.get("passive_effect", null)
	if effect == null or not (effect is Dictionary):
		return
	var e: Dictionary = effect as Dictionary
	match e.get("type", ""):
		"unlock_zone":
			var zone: String = e.get("unlocks_zone", "")
			if zone != "" and zone not in GameState.discovered_zone_ids:
				GameState.discovered_zone_ids.append(zone)


func _clear_event() -> void:
	_pending_event = {}
	GameState.pending_event = {}


func _get_eligible_events(pool: Array) -> Array:
	var eligible: Array = []
	for ev: Variant in pool:
		var event: Dictionary = ev as Dictionary
		if _is_blocked(event):
			continue
		# Skip dynasty-fired single-use events
		var ev_id: String = event.get("id", "")
		if event.get("is_single_use", false) and ev_id in GameState.fired_single_use_event_ids:
			continue
		if event.get("is_discovery_event", false):
			var skill_id: String = event.get("discovery_skill_id", "")
			if skill_id in GameState.unlocked_skill_ids:
				continue
			# Check skill's universal tech prerequisite before allowing discovery
			var skill: Dictionary = DataLoader.skills.get(skill_id, {})
			var prereq: String = skill.get("universal_prereq", "")
			if prereq != "" and prereq not in GameState.discovered_universal_tech_ids:
				continue
		eligible.append(event)
	return eligible


func _is_blocked(event: Dictionary) -> bool:
	var blocked_if: Array = event.get("blocked_if", [])
	for cond: Variant in blocked_if:
		var c: Dictionary = cond as Dictionary
		match c.get("type", ""):
			"has_skill":
				if c.get("id", "") in GameState.unlocked_skill_ids:
					return true
			"not_has_skill":
				if c.get("id", "") not in GameState.unlocked_skill_ids:
					return true
			"axis_above":
				if GameState.inclination.get(c.get("axis", ""), 0.0) >= float(c.get("value", 1.0)):
					return true
			"resource_below":
				var res: String = c.get("resource", "")
				var val: float = float(c.get("value", 0))
				match res:
					"food":   if GameState.food < val: return true
					"health": if GameState.health < val: return true
	return false
