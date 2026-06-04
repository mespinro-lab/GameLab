extends Node

## Computes era score. Pure function — reads GameState + DataLoader, writes nothing.
## Formula: score_tech + score_skills + score_gens + score_efficiency


func calculate_era_score() -> Dictionary:
	var cfg: Dictionary = DataLoader.config.get("scoring", {})
	var w_tech: int = int(cfg.get("w_tech", 50))
	var w_rare: int = int(cfg.get("w_rare", 200))
	var w_eff: int = int(cfg.get("w_eff", 30))
	var eff_per_cycle: int = int(cfg.get("efficiency_per_cycle", 10))

	var era: Dictionary = DataLoader.eras.get(GameState.current_era_id, {})
	var era_cycles: int = int(era.get("era_cycles", 100))

	var score_tech: int = GameState.discovered_universal_tech_ids.size() * w_tech
	var score_skills: int = GameState.unlocked_skill_ids.size() * w_rare
	var cycles_remaining: int = maxi(0, era_cycles - GameState.era_cycle)
	var score_efficiency: int = cycles_remaining * eff_per_cycle * w_eff / 100
	var score_gens: int = (GameState.generation - 1) * 50

	var total: int = score_tech + score_skills + score_efficiency + score_gens

	return {
		"total": total,
		"score_tech": score_tech,
		"score_skills": score_skills,
		"score_efficiency": score_efficiency,
		"score_gens": score_gens,
		"techs": GameState.discovered_universal_tech_ids.size(),
		"skills": GameState.unlocked_skill_ids.size(),
		"generations": GameState.generation,
	}


func get_dynasty_title(score: int) -> String:
	if score >= 2000: return "Llinatge Llegendari"
	if score >= 1500: return "Llinatge Honorable"
	if score >= 1000: return "Llinatge Establert"
	if score >= 500:  return "Llinatge Jove"
	return "Llinatge Incipient"
