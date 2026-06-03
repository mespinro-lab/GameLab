extends GutTest
## Unit tests for BranchManager — inclination math, branch conditions, skill eligibility.
## All tests are deterministic: no random seeds, no time-dependent logic.

var bm: BranchManager


func before_each() -> void:
	bm = BranchManager.new()
	# Reset inclination to zero before each test
	GameState.inclination = {"impuls": 0.0, "intel_lectus": 0.0, "espiritualitat": 0.0, "sociabilitat": 0.0}
	# Stub config
	DataLoader.config = {
		"inclination": {
			"inertia_factor": 2.0,
			"inheritance_rate": 0.65,
			"branch_tech_min": 0.15,
			"min_branch_inclination": 0.20,
		}
	}


func after_each() -> void:
	bm.free()


# ── Inclination delta ─────────────────────────────────────────────────────────

func test_delta_from_zero_applies_fully() -> void:
	bm.apply_inclination_delta("impuls", 0.10)
	# At 0.0 with inertia 2.0: effective = 0.10 / (1 + 0*2) = 0.10
	assert_almost_eq(GameState.inclination["impuls"], 0.10, 0.001)


func test_inertia_reduces_delta_at_high_inclination() -> void:
	GameState.inclination["impuls"] = 0.80
	bm.apply_inclination_delta("impuls", 0.10)
	# effective = 0.10 / (1 + 0.8*2) = 0.10 / 2.6 ≈ 0.0385
	assert_almost_eq(GameState.inclination["impuls"], 0.8385, 0.001)


func test_inclination_clamped_at_plus_one() -> void:
	GameState.inclination["impuls"] = 0.99
	bm.apply_inclination_delta("impuls", 1.0)
	assert_almost_eq(GameState.inclination["impuls"], 1.0, 0.001)


func test_inclination_clamped_at_minus_one() -> void:
	GameState.inclination["impuls"] = -0.99
	bm.apply_inclination_delta("impuls", -1.0)
	assert_almost_eq(GameState.inclination["impuls"], -1.0, 0.001)


func test_multiple_deltas_applied_correctly() -> void:
	bm.apply_inclination_deltas({"impuls": 0.05, "espiritualitat": -0.03})
	assert_almost_eq(GameState.inclination["impuls"], 0.05, 0.001)
	assert_almost_eq(GameState.inclination["espiritualitat"], -0.03, 0.001)
	assert_almost_eq(GameState.inclination["intel_lectus"], 0.0, 0.001)


# ── Branch conditions ─────────────────────────────────────────────────────────

func test_hunter_branch_active_when_impuls_above_threshold() -> void:
	GameState.inclination["impuls"] = 0.35
	GameState.inclination["sociabilitat"] = 0.10
	var branch := {
		"id": "branch_hunter",
		"conditions": {
			"operator": "AND",
			"conditions": [
				{"axis": "impuls", "min": 0.30},
				{"axis": "sociabilitat", "max": 0.30}
			]
		}
	}
	assert_true(bm._branch_conditions_met(branch, 0.20))


func test_hunter_branch_inactive_below_threshold() -> void:
	GameState.inclination["impuls"] = 0.15  # below 0.30
	var branch := {
		"id": "branch_hunter",
		"conditions": {
			"operator": "AND",
			"conditions": [{"axis": "impuls", "min": 0.30}]
		}
	}
	assert_false(bm._branch_conditions_met(branch, 0.20))


func test_or_branch_active_if_any_condition_met() -> void:
	GameState.inclination["espiritualitat"] = 0.25
	GameState.inclination["sociabilitat"] = 0.05
	var branch := {
		"id": "branch_ornaments",
		"conditions": {
			"operator": "OR",
			"conditions": [
				{"axis": "espiritualitat", "min": 0.20},
				{"axis": "sociabilitat", "min": 0.25}
			]
		}
	}
	assert_true(bm._branch_conditions_met(branch, 0.20))


# ── Branch conditions — edge cases ───────────────────────────────────────────

func test_branch_inactive_when_conditions_list_empty() -> void:
	var branch := {"id": "b_empty", "conditions": {"operator": "AND", "conditions": []}}
	assert_false(bm._branch_conditions_met(branch, 0.20))


func test_and_branch_fails_if_one_condition_fails() -> void:
	# Arrange: impuls OK, sociabilitat too high
	GameState.inclination["impuls"] = 0.40
	GameState.inclination["sociabilitat"] = 0.35  # exceeds max 0.30
	var branch := {
		"id": "branch_cacador",
		"conditions": { "operator": "AND", "conditions": [
			{"axis": "impuls", "min": 0.30},
			{"axis": "sociabilitat", "max": 0.30}
		]}
	}
	assert_false(bm._branch_conditions_met(branch, 0.20))


func test_or_branch_fails_if_no_condition_met() -> void:
	GameState.inclination["espiritualitat"] = 0.05
	GameState.inclination["sociabilitat"] = 0.05
	var branch := {
		"id": "b_or",
		"conditions": { "operator": "OR", "conditions": [
			{"axis": "espiritualitat", "min": 0.20},
			{"axis": "sociabilitat", "min": 0.20}
		]}
	}
	assert_false(bm._branch_conditions_met(branch, 0.20))


func test_get_active_branch_ids_returns_matching_branches() -> void:
	# Arrange: inclination matching "branch_cacador" (impuls >= 0.30, sociabilitat <= 0.20)
	GameState.inclination["impuls"] = 0.40
	GameState.inclination["sociabilitat"] = 0.05
	DataLoader.eras = {
		"prehistoria": {
			"branches": [{
				"id": "branch_cacador",
				"conditions": { "operator": "AND", "conditions": [
					{"axis": "impuls", "min": 0.30},
					{"axis": "sociabilitat", "max": 0.20}
				]}
			}]
		}
	}
	var active: Array = bm.get_active_branch_ids()
	assert_true("branch_cacador" in active)


func test_get_active_branch_ids_empty_when_no_match() -> void:
	# All inclination at 0 — no branch threshold met
	DataLoader.eras = {
		"prehistoria": {
			"branches": [{
				"id": "branch_cacador",
				"conditions": { "operator": "AND", "conditions": [
					{"axis": "impuls", "min": 0.30}
				]}
			}]
		}
	}
	var active: Array = bm.get_active_branch_ids()
	assert_true(active.is_empty())


# ── Skill eligibility ─────────────────────────────────────────────────────────

func test_skill_unlockable_when_prereq_met_and_inclination_sufficient() -> void:
	GameState.discovered_universal_tech_ids.append("ut_foc")
	GameState.inclination["espiritualitat"] = 0.25
	DataLoader.skills = {
		"bt_guariment_plantes": {
			"id": "bt_guariment_plantes",
			"universal_prereq": "ut_foc",
			"inclination_conditions": [{"axis": "espiritualitat", "min": 0.20}]
		}
	}
	var unlockable: Array = bm.get_unlockable_skill_ids()
	assert_true("bt_guariment_plantes" in unlockable)


func test_skill_not_unlockable_when_prereq_missing() -> void:
	# ut_foc not discovered
	GameState.inclination["espiritualitat"] = 0.40
	DataLoader.skills = {
		"bt_guariment_plantes": {
			"id": "bt_guariment_plantes",
			"universal_prereq": "ut_foc",
			"inclination_conditions": [{"axis": "espiritualitat", "min": 0.20}]
		}
	}
	var unlockable: Array = bm.get_unlockable_skill_ids()
	assert_false("bt_guariment_plantes" in unlockable)


func test_skill_not_unlockable_when_inclination_insufficient() -> void:
	GameState.discovered_universal_tech_ids.append("ut_foc")
	GameState.inclination["espiritualitat"] = 0.10  # below 0.20
	DataLoader.skills = {
		"bt_guariment_plantes": {
			"id": "bt_guariment_plantes",
			"universal_prereq": "ut_foc",
			"inclination_conditions": [{"axis": "espiritualitat", "min": 0.20}]
		}
	}
	var unlockable: Array = bm.get_unlockable_skill_ids()
	assert_false("bt_guariment_plantes" in unlockable)


func test_skill_not_unlockable_when_already_unlocked() -> void:
	GameState.discovered_universal_tech_ids.append("ut_foc")
	GameState.unlocked_skill_ids.append("bt_guariment_plantes")
	GameState.inclination["espiritualitat"] = 0.40
	DataLoader.skills = {
		"bt_guariment_plantes": {
			"id": "bt_guariment_plantes",
			"universal_prereq": "ut_foc",
			"inclination_conditions": [{"axis": "espiritualitat", "min": 0.20}]
		}
	}
	var unlockable: Array = bm.get_unlockable_skill_ids()
	assert_false("bt_guariment_plantes" in unlockable)


# ── Inheritance ───────────────────────────────────────────────────────────────

func test_inheritance_applies_rate() -> void:
	var parent := {"impuls": 0.60, "intel_lectus": -0.20, "espiritualitat": 0.0, "sociabilitat": 0.40}
	var child := bm.inherit_inclination(parent)
	assert_almost_eq(child["impuls"], 0.60 * 0.65, 0.001)
	assert_almost_eq(child["intel_lectus"], -0.20 * 0.65, 0.001)
	assert_almost_eq(child["sociabilitat"], 0.40 * 0.65, 0.001)


func test_inheritance_preserves_all_axes() -> void:
	var parent := {"impuls": 0.0, "intel_lectus": 0.0, "espiritualitat": 0.50, "sociabilitat": 0.0}
	var child := bm.inherit_inclination(parent)
	assert_almost_eq(child["espiritualitat"], 0.50 * 0.65, 0.001)
	assert_almost_eq(child["impuls"], 0.0, 0.001)


func test_inheritance_with_negative_inclination() -> void:
	var parent := {"impuls": -0.80, "intel_lectus": 0.0, "espiritualitat": 0.0, "sociabilitat": 0.0}
	var child := bm.inherit_inclination(parent)
	assert_almost_eq(child["impuls"], -0.80 * 0.65, 0.001)


func test_inertia_zero_inclination_applies_full_delta() -> void:
	# Special case: starting from 0.0 should apply delta fully
	bm.apply_inclination_delta("sociabilitat", 0.05)
	assert_almost_eq(GameState.inclination["sociabilitat"], 0.05, 0.001)


func test_inertia_symmetric_for_negative_values() -> void:
	# Negative inclination should have same inertia behaviour
	GameState.inclination["impuls"] = -0.80
	bm.apply_inclination_delta("impuls", -0.10)
	# effective = -0.10 / (1 + 0.8*2) = -0.10 / 2.6 ≈ -0.0385
	assert_almost_eq(GameState.inclination["impuls"], -0.8385, 0.001)
