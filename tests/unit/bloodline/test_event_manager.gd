extends GutTest
## Unit tests for EventManager — event triggering, option resolution, blocked_if.

var em: EventManager


func before_each() -> void:
	em = EventManager.new()
	GameState.reset()
	GameState.current_era_id = "prehistoria"
	GameState.food = 12.0
	GameState.health = 100.0
	GameState.tokens = 10.0
	DataLoader.config = {
		"events": { "trigger_chance": 1.0 }
	}
	DataLoader.skills = {}


func after_each() -> void:
	em.free()


# ── Trigger ───────────────────────────────────────────────────────────────────

func test_trigger_returns_false_when_pool_empty() -> void:
	DataLoader.events = {}
	assert_false(em.try_trigger_event("pool_caca"))


func test_trigger_returns_false_when_chance_zero() -> void:
	DataLoader.config = {"events": {"trigger_chance": 0.0}}
	DataLoader.events = {"pool_caca": [{"id": "ev_test", "text": "Test", "effects": {}}]}
	assert_false(em.try_trigger_event("pool_caca"))


func test_trigger_sets_pending_event() -> void:
	DataLoader.events = {"pool_caca": [{"id": "ev_test", "text": "Test", "effects": {}}]}
	em.try_trigger_event("pool_caca")
	assert_true(em.has_pending_event())


func test_second_trigger_blocked_while_pending() -> void:
	DataLoader.events = {"pool_caca": [{"id": "ev1", "text": "A", "effects": {}}]}
	em.try_trigger_event("pool_caca")
	var second: bool = em.try_trigger_event("pool_caca")
	assert_false(second)


# ── Simple event dismiss ──────────────────────────────────────────────────────

func test_dismiss_simple_applies_food_effect() -> void:
	DataLoader.events = {"pool": [{"id": "ev1", "text": "T", "effects": {"food": 3}}]}
	em.try_trigger_event("pool")
	em.dismiss_simple_event()
	assert_almost_eq(GameState.food, 15.0, 0.01)


func test_dismiss_simple_applies_health_effect() -> void:
	DataLoader.events = {"pool": [{"id": "ev1", "text": "T", "effects": {"health": -10}}]}
	em.try_trigger_event("pool")
	em.dismiss_simple_event()
	assert_almost_eq(GameState.health, 90.0, 0.01)


func test_dismiss_clears_pending_event() -> void:
	DataLoader.events = {"pool": [{"id": "ev1", "text": "T", "effects": {}}]}
	em.try_trigger_event("pool")
	em.dismiss_simple_event()
	assert_false(em.has_pending_event())


# ── Option resolution ─────────────────────────────────────────────────────────

func test_resolve_option_applies_food_delta() -> void:
	DataLoader.events = {"pool": [
		{"id": "ev1", "text": "T", "options": [
			{"text": "A", "food_delta": 4},
			{"text": "B", "food_delta": -2}
		]}
	]}
	em.try_trigger_event("pool")
	em.resolve_option(0)
	assert_almost_eq(GameState.food, 16.0, 0.01)


func test_resolve_option_applies_health_delta() -> void:
	DataLoader.events = {"pool": [
		{"id": "ev1", "text": "T", "options": [
			{"text": "A", "health_delta": -15}
		]}
	]}
	em.try_trigger_event("pool")
	em.resolve_option(0)
	assert_almost_eq(GameState.health, 85.0, 0.01)


func test_resolve_option_applies_token_delta() -> void:
	DataLoader.events = {"pool": [
		{"id": "ev1", "text": "T", "options": [
			{"text": "A", "token_delta": 5}
		]}
	]}
	em.try_trigger_event("pool")
	em.resolve_option(0)
	assert_almost_eq(GameState.tokens, 15.0, 0.01)


func test_resolve_option_out_of_bounds_does_nothing() -> void:
	DataLoader.events = {"pool": [
		{"id": "ev1", "text": "T", "options": [{"text": "A"}]}
	]}
	em.try_trigger_event("pool")
	em.resolve_option(5)
	assert_true(em.has_pending_event())


# ── Skill discovery ───────────────────────────────────────────────────────────

func test_discovers_skill_on_option_with_discovers_true() -> void:
	DataLoader.events = {"pool": [
		{"id": "ev1", "text": "T", "discovery_skill_id": "bt_test_skill",
		"options": [{"text": "A", "discovers": true}]}
	]}
	em.try_trigger_event("pool")
	em.resolve_option(0)
	assert_true("bt_test_skill" in GameState.unlocked_skill_ids)


func test_does_not_rediscover_known_skill() -> void:
	GameState.unlocked_skill_ids.append("bt_test_skill")
	DataLoader.events = {"pool": [
		{"id": "ev1", "text": "T", "discovery_skill_id": "bt_test_skill",
		"options": [{"text": "A", "discovers": true}]}
	]}
	em.try_trigger_event("pool")
	em.resolve_option(0)
	# Still only one entry (no duplicates)
	var count: int = GameState.unlocked_skill_ids.filter(func(s: String) -> bool: return s == "bt_test_skill").size()
	assert_eq(count, 1)


# ── blocked_if ────────────────────────────────────────────────────────────────

func test_blocked_if_has_skill_filters_event() -> void:
	GameState.unlocked_skill_ids.append("bt_guariment_plantes")
	DataLoader.events = {"pool": [
		{"id": "ev1", "text": "T", "effects": {},
		"blocked_if": [{"type": "has_skill", "id": "bt_guariment_plantes"}]}
	]}
	var triggered: bool = em.try_trigger_event("pool")
	assert_false(triggered)


func test_blocked_if_resource_below_filters_event() -> void:
	GameState.food = 2.0
	DataLoader.events = {"pool": [
		{"id": "ev1", "text": "T", "effects": {},
		"blocked_if": [{"type": "resource_below", "resource": "food", "value": 3}]}
	]}
	var triggered: bool = em.try_trigger_event("pool")
	assert_false(triggered)


func test_not_blocked_when_resource_above_threshold() -> void:
	GameState.food = 10.0
	DataLoader.events = {"pool": [
		{"id": "ev1", "text": "T", "effects": {},
		"blocked_if": [{"type": "resource_below", "resource": "food", "value": 3}]}
	]}
	var triggered: bool = em.try_trigger_event("pool")
	assert_true(triggered)
