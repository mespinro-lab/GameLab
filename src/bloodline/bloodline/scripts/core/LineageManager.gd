extends Node

## Manages succession, inheritance, genealogy, and game-over conditions.

signal succession_required(successors: Array)
signal new_generation_started(character_label: String, generation: int)
signal lineage_extinct()
signal era_ended(summary: Dictionary)

const CHILD_NAMES: Array[String] = [
	"Auri", "Brant", "Cels", "Dorma", "Elva",
	"Fura", "Gall", "Hern", "Ibra", "Jord",
	"Kela", "Llor", "Marn", "Nela", "Orx",
	"Pell", "Raul", "Sena", "Tirsa", "Ursa",
]


func character_age() -> int:
	return GameState.era_cycle - GameState.character_birth_cycle


func should_trigger_succession() -> bool:
	var era: Dictionary = DataLoader.eras.get(GameState.current_era_id, {})
	var life_exp: int = int(era.get("life_expectancy", 20))
	return character_age() >= life_exp or GameState.health <= 0.0


func trigger_succession() -> void:
	# Era complete check first
	if EraManager.check_era_complete():
		var summary: Dictionary = _build_era_summary()
		GameState.genealogy.append(_snapshot_current_character())
		era_ended.emit(summary)
		return

	var successors: Array = _build_successors()
	if successors.is_empty():
		GameState.game_over = true
		GameState.game_over_reason = "no_heir"
		lineage_extinct.emit()
		return

	GameState.genealogy.append(_snapshot_current_character())
	GameState.pending_succession = {"successors": successors}
	succession_required.emit(successors)


func choose_successor(successor_id: String) -> void:
	var pending: Dictionary = GameState.pending_succession
	if pending.is_empty():
		return

	var successors: Array = pending.get("successors", [])
	var chosen: Dictionary = {}
	for s: Variant in successors:
		var sdict: Dictionary = s as Dictionary
		if sdict.get("id", "") == successor_id:
			chosen = sdict
			break

	if chosen.is_empty():
		return

	# Unchosen children → sibling pool for next generation
	GameState.sibling_pool = []
	for s: Variant in successors:
		var sdict: Dictionary = s as Dictionary
		if sdict.get("id", "") != successor_id and not sdict.get("is_sibling", false):
			GameState.sibling_pool.append(sdict)

	GameState.pending_succession = {}
	GameState.generation += 1

	_apply_new_character(chosen)
	new_generation_started.emit(chosen.get("label", ""), GameState.generation)


func create_child() -> Dictionary:
	var config: Dictionary = DataLoader.config.get("succession", {})
	var max_children: int = int(config.get("max_children", 4))
	var current_children: int = GameState.children.size()
	if current_children >= max_children:
		return {}

	var name_idx: int = (GameState.generation * 7 + current_children * 3) % CHILD_NAMES.size()
	var child: Dictionary = {
		"id": "child_%d_%d" % [GameState.generation, GameState.era_cycle],
		"label": CHILD_NAMES[name_idx],
		"is_sibling": false,
	}
	GameState.children.append(child)
	return child


# ── Private ───────────────────────────────────────────────────────────────────

func _build_successors() -> Array:
	var successors: Array = []
	var incl_rate: float = DataLoader.config.get("inclination", {}).get("inheritance_rate", 0.65)

	var inherited_incl: Dictionary = {}
	for axis: String in BranchManager.AXES:
		inherited_incl[axis] = GameState.inclination.get(axis, 0.0) * incl_rate

	for child: Variant in GameState.children:
		var c: Dictionary = (child as Dictionary).duplicate()
		c["inherited_inclination"] = inherited_incl
		c["inherited_stats"] = _inherit_stats()
		c["inherited_skill_ids"] = _inherit_skills()
		successors.append(c)

	for sibling: Variant in GameState.sibling_pool:
		var s: Dictionary = (sibling as Dictionary).duplicate()
		s["is_sibling"] = true
		successors.append(s)

	return successors


func _inherit_stats() -> Dictionary:
	var rate: float = DataLoader.config.get("inclination", {}).get("inheritance_rate", 0.65)
	var start: float = DataLoader.config.get("stats", {}).get("starting_value", 1.0)
	var result: Dictionary = {}
	for stat: String in GameState.character_stats:
		result[stat] = GameState.character_stats[stat] * rate + start * (1.0 - rate)
	return result


func _inherit_skills() -> Array[String]:
	var inherited: Array[String] = []
	for skill_id: String in GameState.unlocked_skill_ids:
		var skill: Dictionary = DataLoader.skills.get(skill_id, {})
		var rate: float = float(skill.get("inheritance_rate", 0.0))
		if randf() < rate:
			inherited.append(skill_id)
	return inherited


func _apply_new_character(chosen: Dictionary) -> void:
	# Reset resources
	var era: Dictionary = DataLoader.eras.get(GameState.current_era_id, {})
	GameState.food = float(era.get("food", {}).get("start_val", 12))
	GameState.health = float(era.get("health", {}).get("start_val", 100))
	GameState.tokens = float(era.get("token", {}).get("start_val", 10))

	# Apply inheritance
	var incl: Dictionary = chosen.get("inherited_inclination", {})
	for axis: String in incl:
		GameState.inclination[axis] = float(incl[axis])

	var stats: Dictionary = chosen.get("inherited_stats", {})
	for stat: String in stats:
		GameState.character_stats[stat] = float(stats[stat])

	GameState.unlocked_skill_ids = chosen.get("inherited_skill_ids", [])
	GameState.character_label = chosen.get("label", "")
	GameState.character_birth_cycle = GameState.era_cycle
	GameState.children = []


func _snapshot_current_character() -> Dictionary:
	return {
		"label": GameState.character_label,
		"generation": GameState.generation,
		"era_id": GameState.current_era_id,
		"age": character_age(),
		"inclination": GameState.inclination.duplicate(),
		"unlocked_skill_ids": GameState.unlocked_skill_ids.duplicate(),
	}


func _build_era_summary() -> Dictionary:
	return {
		"era_id": GameState.current_era_id,
		"generations": GameState.generation,
		"total_cycles": GameState.era_cycle,
		"discovered_techs": GameState.discovered_universal_tech_ids.duplicate(),
		"unlocked_skills": GameState.unlocked_skill_ids.duplicate(),
		"genealogy": GameState.genealogy.duplicate(),
	}
