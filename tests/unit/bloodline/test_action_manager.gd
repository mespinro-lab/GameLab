extends GutTest

var am: ActionManager


func before_each() -> void:
	am = ActionManager.new()
	GameState.reset()
	GameState.current_era_id = "prehistoria"
	GameState.discovered_zone_ids = ["Campament"]
	DataLoader.config = {
		"stats": {"output_factor": 0.1, "max_value": 5.0},
		"inclination": {"inertia_factor": 2.0}
	}
	DataLoader.eras = {
		"prehistoria": {"food": {"upkeep_per_cycle": 2}}
	}


func after_each() -> void:
	am.free()


func test_base_action_visible_in_discovered_zone() -> void:
	var action := {"id": "act_test", "is_base": true, "zona": "Campament"}
	assert_eq(am.get_action_visibility(action), ActionManager.Visibility.ACTIVE)


func test_base_action_hidden_in_undiscovered_zone() -> void:
	var action := {"id": "act_test", "is_base": true, "zona": "Planes"}
	assert_eq(am.get_action_visibility(action), ActionManager.Visibility.HIDDEN)


func test_cannot_purchase_without_enough_tokens() -> void:
	GameState.tokens = 2.0
	var action := {"id": "act_test", "is_base": false, "purchase_cost": 5}
	assert_false(am.can_purchase(action))


func test_can_purchase_with_enough_tokens() -> void:
	GameState.tokens = 10.0
	var action := {"id": "act_test", "is_base": false, "purchase_cost": 5}
	assert_true(am.can_purchase(action))


func test_execute_base_action_generates_tokens() -> void:
	var action := {
		"id": "act_base", "is_base": true, "zona": "Campament",
		"output_min": 3.0, "output_max": 3.0,
		"stat_key": "", "stat_gain": 0.0,
		"inclination_deltas": {}, "side_effects": []
	}
	DataLoader.actions = {"act_base": action}
	GameState.food = 10.0
	am.execute_action("act_base")
	# Output is exactly 3.0 (min==max, stat 1.0 → multiplier 1.0)
	assert_almost_eq(GameState.tokens, 3.0, 0.01)


func test_execute_applies_food_upkeep() -> void:
	GameState.food = 10.0
	var action := {
		"id": "act_base", "is_base": true, "zona": "Campament",
		"output_min": 0.0, "output_max": 0.0,
		"stat_key": "", "stat_gain": 0.0,
		"inclination_deltas": {}, "side_effects": []
	}
	DataLoader.actions = {"act_base": action}
	am.execute_action("act_base")
	assert_almost_eq(GameState.food, 8.0, 0.01)  # 10 - 2 upkeep


func test_execute_applies_health_side_effect() -> void:
	GameState.health = 80.0
	var action := {
		"id": "act_risky", "is_base": true, "zona": "Campament",
		"output_min": 0.0, "output_max": 0.0,
		"stat_key": "", "stat_gain": 0.0,
		"inclination_deltas": {},
		"side_effects": [{"resource": "health", "delta": -10}]
	}
	DataLoader.actions = {"act_risky": action}
	GameState.food = 10.0
	am.execute_action("act_risky")
	assert_almost_eq(GameState.health, 70.0, 0.01)


func test_food_below_zero_drains_health() -> void:
	GameState.food = 1.0
	GameState.health = 100.0
	var action := {
		"id": "act_base", "is_base": true, "zona": "Campament",
		"output_min": 0.0, "output_max": 0.0,
		"stat_key": "", "stat_gain": 0.0,
		"inclination_deltas": {}, "side_effects": []
	}
	DataLoader.actions = {"act_base": action}
	am.execute_action("act_base")  # food 1 - 2 upkeep = 0, health -5
	assert_almost_eq(GameState.food, 0.0, 0.01)
	assert_almost_eq(GameState.health, 95.0, 0.01)
