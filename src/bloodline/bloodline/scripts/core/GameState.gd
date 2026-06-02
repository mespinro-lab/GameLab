extends Node

# Era state
var current_era_id: String = ""
var era_cycle: int = 0
var generation: int = 1

# Vital resources
var food: float = 12.0
var health: float = 100.0

# Action token (era-specific, e.g. "provisions" in Paleolithic)
var tokens: float = 0.0

# Inclination (4 axes, -1.0 to +1.0)
var inclination: Dictionary = {
	"impuls": 0.0,
	"intel_lectus": 0.0,
	"espiritualitat": 0.0,
	"sociabilitat": 0.0,
}

# Character
var character_label: String = ""
var character_stats: Dictionary = {
	"forca": 1.0,
	"enginy": 1.0,
	"vincle": 1.0,
}

# Progress
var discovered_universal_tech_ids: Array[String] = []
var unlocked_skill_ids: Array[String] = []
var purchased_action_ids: Array[String] = []
var discovered_zone_ids: Array[String] = []
var children: Array[Dictionary] = []

# Dynasty
var dynasty_name: String = ""
var genealogy: Array[Dictionary] = []

# Pending UI states
var pending_action_result: Dictionary = {}
var pending_event: Dictionary = {}
var pending_succession: Dictionary = {}
var game_over: bool = false
var game_over_reason: String = ""


func reset() -> void:
	era_cycle = 0
	generation = 1
	food = 12.0
	health = 100.0
	tokens = 0.0
	inclination = {"impuls": 0.0, "intel_lectus": 0.0, "espiritualitat": 0.0, "sociabilitat": 0.0}
	character_stats = {"forca": 1.0, "enginy": 1.0, "vincle": 1.0}
	discovered_universal_tech_ids = []
	unlocked_skill_ids = []
	purchased_action_ids = []
	discovered_zone_ids = []
	children = []
	genealogy = []
	pending_action_result = {}
	pending_event = {}
	pending_succession = {}
	game_over = false
	game_over_reason = ""
