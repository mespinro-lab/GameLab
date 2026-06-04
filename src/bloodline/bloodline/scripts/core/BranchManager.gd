extends Node

## Manages inclination axes, active branches, and skill unlock eligibility.
## Pure logic — reads from GameState, writes to GameState, no UI calls.

const AXES: Array[String] = ["impuls", "intel_lectus", "espiritualitat", "sociabilitat"]


# ── Inclination ───────────────────────────────────────────────────────────────

func apply_inclination_delta(axis: String, raw_delta: float) -> void:
	var current: float = GameState.inclination.get(axis, 0.0)
	var inertia: float = DataLoader.config.get("inclination", {}).get("inertia_factor", 2.0)
	var effective: float = raw_delta / (1.0 + absf(current) * inertia)
	GameState.inclination[axis] = clampf(current + effective, -1.0, 1.0)


func apply_inclination_deltas(deltas: Dictionary) -> void:
	for axis: String in deltas:
		if axis in AXES:
			apply_inclination_delta(axis, float(deltas[axis]))


# ── Branches ──────────────────────────────────────────────────────────────────

func get_active_branch_ids() -> Array[String]:
	var active: Array[String] = []
	var min_incl: float = DataLoader.config.get("inclination", {}).get("min_branch_inclination", 0.20)
	for era_id: String in DataLoader.eras:
		var era: Dictionary = DataLoader.eras[era_id]
		for branch: Dictionary in era.get("branches", []):
			if _branch_conditions_met(branch, min_incl):
				active.append(branch.get("id", ""))
	return active


func _branch_conditions_met(branch: Dictionary, min_incl: float) -> bool:
	var conditions: Dictionary = branch.get("conditions", {})
	var op: String = conditions.get("operator", "AND")
	var cond_list: Array = conditions.get("conditions", [])
	if cond_list.is_empty():
		return false
	var results: Array[bool] = []
	for c: Variant in cond_list:
		var cond: Dictionary = c as Dictionary
		var axis: String = cond.get("axis", "")
		var val: float = GameState.inclination.get(axis, 0.0)
		var passes: bool = false
		if cond.has("min"):
			passes = val >= float(cond["min"])
		elif cond.has("max"):
			passes = val <= float(cond["max"])
		results.append(passes)
	if op == "OR":
		return results.any(func(r: bool) -> bool: return r)
	return results.all(func(r: bool) -> bool: return r)


# ── Skills ────────────────────────────────────────────────────────────────────

func get_unlockable_skill_ids() -> Array[String]:
	var unlockable: Array[String] = []
	var min_skill: float = DataLoader.config.get("inclination", {}).get("branch_tech_min", 0.15)
	for skill_id: String in DataLoader.skills:
		if skill_id in GameState.unlocked_skill_ids:
			continue
		var skill: Dictionary = DataLoader.skills[skill_id]
		if _skill_conditions_met(skill, min_skill):
			unlockable.append(skill_id)
	return unlockable


func _skill_conditions_met(skill: Dictionary, min_incl: float) -> bool:
	var prereq: String = skill.get("universal_prereq", "")
	if prereq != "" and prereq not in GameState.discovered_universal_tech_ids:
		return false
	var conditions: Array = skill.get("inclination_conditions", [])
	if conditions.is_empty():
		return false
	for c: Variant in conditions:
		var cond: Dictionary = c as Dictionary
		var axis: String = cond.get("axis", "")
		var val: float = GameState.inclination.get(axis, 0.0)
		if cond.has("min") and val < float(cond["min"]):
			return false
		if cond.has("max") and val > float(cond["max"]):
			return false
	return true


# ── Inheritance ───────────────────────────────────────────────────────────────

func inherit_inclination(parent: Dictionary) -> Dictionary:
	var rate: float = DataLoader.config.get("inclination", {}).get("inheritance_rate", 0.65)
	var result: Dictionary = {}
	for axis: String in AXES:
		result[axis] = float(parent.get(axis, 0.0)) * rate
	return result
