extends GutTest
## Unit tests for ScoringManager.

var sm: ScoringManager


func before_each() -> void:
	sm = ScoringManager.new()
	GameState.reset()
	GameState.current_era_id = "prehistoria"
	DataLoader.config = {
		"scoring": {
			"w_tech": 50,
			"w_rare": 200,
			"w_eff": 30,
			"efficiency_per_cycle": 10
		}
	}
	DataLoader.eras = {
		"prehistoria": { "era_cycles": 100 }
	}


func after_each() -> void:
	sm.free()


func test_zero_score_on_empty_state() -> void:
	GameState.era_cycle = 100  # no cycles remaining
	var score: Dictionary = sm.calculate_era_score()
	assert_eq(int(score["score_tech"]), 0)
	assert_eq(int(score["score_skills"]), 0)
	assert_eq(int(score["score_efficiency"]), 0)


func test_score_tech_counts_discovered_techs() -> void:
	GameState.discovered_universal_tech_ids = ["ut_foc", "ut_eines", "ut_art"]
	GameState.era_cycle = 100
	var score: Dictionary = sm.calculate_era_score()
	assert_eq(int(score["score_tech"]), 150)  # 3 × 50


func test_score_skills_counts_unlocked_skills() -> void:
	GameState.unlocked_skill_ids = ["bt_guariment", "bt_pintura"]
	GameState.era_cycle = 100
	var score: Dictionary = sm.calculate_era_score()
	assert_eq(int(score["score_skills"]), 400)  # 2 × 200


func test_score_efficiency_when_cycles_remain() -> void:
	GameState.era_cycle = 70  # 30 cycles remaining
	var score: Dictionary = sm.calculate_era_score()
	# 30 * 10 * 30 / 100 = 90
	assert_eq(int(score["score_efficiency"]), 90)


func test_title_incipient_for_zero_score() -> void:
	assert_eq(sm.get_dynasty_title(0), "Llinatge Incipient")


func test_title_llegendari_for_high_score() -> void:
	assert_eq(sm.get_dynasty_title(2000), "Llinatge Llegendari")


func test_title_honorable_for_mid_score() -> void:
	assert_eq(sm.get_dynasty_title(1600), "Llinatge Honorable")
