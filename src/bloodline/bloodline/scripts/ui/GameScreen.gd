extends Control

## Main game screen — portrait layout, touch-first.
## Visual style: dark navy cards with borders (inspired by LT1 prototype).
## All game logic delegated to autoloads — this file is presentation only.

signal request_new_game()

# ── Palette (matches LT1 prototype CSS) ──────────────────────────────────────
const C_BG       := Color(0.059, 0.067, 0.090)   # #0f1117
const C_SURFACE  := Color(0.102, 0.114, 0.153)   # #1a1d27
const C_SURFACE2 := Color(0.145, 0.157, 0.212)   # #252836
const C_BORDER   := Color(0.180, 0.196, 0.275)   # #2e3246
const C_ACCENT   := Color(0.914, 0.271, 0.376)   # #e94560
const C_GOLD     := Color(0.961, 0.651, 0.137)   # #f5a623
const C_TEXT     := Color(0.910, 0.910, 0.941)   # #e8e8f0
const C_DIM      := Color(0.420, 0.431, 0.522)   # #6b6e85
const C_GREEN    := Color(0.306, 0.871, 0.502)   # #4ade80
const C_BLUE     := Color(0.376, 0.647, 0.980)   # #60a5fa
const C_PURPLE   := Color(0.671, 0.482, 0.980)   # #ab7bfa

const AXIS_COLORS: Dictionary = {
	"impuls":         C_ACCENT,
	"intel_lectus":   C_BLUE,
	"espiritualitat": C_PURPLE,
	"sociabilitat":   C_GREEN,
}
const AXIS_LABELS: Dictionary = {
	"impuls": "Impuls", "intel_lectus": "Intel·lecte",
	"espiritualitat": "Espiritualitat", "sociabilitat": "Sociabilitat",
}
const BRANCH_COLORS: Dictionary = {
	"branch_cacador":    C_ACCENT,
	"branch_recollector":C_GREEN,
	"branch_artesa":     C_BLUE,
	"branch_mistic":     C_PURPLE,
}
const ZONE_ICONS: Dictionary = {
	"Campament": "🏕", "Planes": "🌾", "Bosc": "🌲", "Ritual": "🔥",
}

# ── Node refs ─────────────────────────────────────────────────────────────────
# Top bar
var _pill_food: Label
var _pill_health: Label
var _pill_tokens: Label
var _era_fill: Panel
# Left panel (player)
var _label_char: Label
var _label_meta: Label
var _branch_bar: VBoxContainer
var _incl_bars: Dictionary = {}
var _family_bar: Label
var _skills_bar: VBoxContainer
# Right panel (zones)
var _zone_scroll: ScrollContainer
var _zone_container: VBoxContainer
# Log
var _log_label: Label
var _log_entries: Array[String] = []
var _overlay: Control
var _ov_tag: Label
var _ov_icon: Label
var _ov_title: Label
var _ov_sub: Label
var _ov_btn: Button
var _ov_vbox: VBoxContainer
var _suppress_next_result: bool = false
var _pending_pool_id: String = ""


const BloodlineThemeScript = preload("res://scripts/ui/BloodlineTheme.gd")

func _ready() -> void:
	theme = BloodlineThemeScript.build()
	_build_layout()
	_connect_signals()
	_refresh()


# ══ LAYOUT ════════════════════════════════════════════════════════════════════

func _build_layout() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)

	var bg := ColorRect.new()
	bg.color = C_BG
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(bg)

	# Root: vertical stack — topbar / era strip / middle / log
	var root := VBoxContainer.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.add_theme_constant_override("separation", 0)
	add_child(root)

	root.add_child(_build_top_bar())
	root.add_child(_build_era_strip())

	# ── Middle: 1/3 player  |  2/3 zones ──────────────────────────────────
	var middle := HBoxContainer.new()
	middle.size_flags_vertical = Control.SIZE_EXPAND_FILL
	middle.add_theme_constant_override("separation", 0)
	root.add_child(middle)

	# Left panel: player info (1 part)
	var left_scroll := ScrollContainer.new()
	left_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	left_scroll.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	left_scroll.size_flags_stretch_ratio = 1.0
	left_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	var left_border := StyleBoxFlat.new()
	left_border.bg_color = C_SURFACE
	left_border.border_width_right = 1
	left_border.border_color = C_BORDER
	left_scroll.add_theme_stylebox_override("panel", left_border)
	middle.add_child(left_scroll)
	left_scroll.add_child(_build_left_panel())

	# Right panel: zones (2 parts)
	_zone_scroll = ScrollContainer.new()
	_zone_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_zone_scroll.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_zone_scroll.size_flags_stretch_ratio = 2.0
	_zone_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	middle.add_child(_zone_scroll)
	_zone_container = VBoxContainer.new()
	_zone_container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_zone_container.add_theme_constant_override("separation", 6)
	var zm := MarginContainer.new()
	zm.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	zm.add_theme_constant_override("margin_left", 8)
	zm.add_theme_constant_override("margin_right", 8)
	zm.add_theme_constant_override("margin_top", 8)
	zm.add_theme_constant_override("margin_bottom", 4)
	zm.add_child(_zone_container)
	_zone_scroll.add_child(zm)

	root.add_child(_build_log_strip())

	_overlay = _build_overlay()
	add_child(_overlay)


func _build_left_panel() -> Control:
	var col := VBoxContainer.new()
	col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	col.add_theme_constant_override("separation", 0)

	# ── Character name + gen ───────────────────────────────────────────────
	var char_mc := MarginContainer.new()
	char_mc.add_theme_constant_override("margin_left", 10)
	char_mc.add_theme_constant_override("margin_right", 6)
	char_mc.add_theme_constant_override("margin_top", 10)
	char_mc.add_theme_constant_override("margin_bottom", 4)
	var char_col := VBoxContainer.new()
	char_col.add_theme_constant_override("separation", 2)
	char_mc.add_child(char_col)

	_label_char = Label.new()
	_label_char.add_theme_color_override("font_color", C_ACCENT)
	_label_char.add_theme_font_size_override("font_size", 14)
	char_col.add_child(_label_char)

	_label_meta = Label.new()
	_label_meta.add_theme_color_override("font_color", C_DIM)
	_label_meta.add_theme_font_size_override("font_size", 9)
	_label_meta.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	char_col.add_child(_label_meta)

	_family_bar = Label.new()
	_family_bar.add_theme_color_override("font_color", C_DIM)
	_family_bar.add_theme_font_size_override("font_size", 10)
	char_col.add_child(_family_bar)
	col.add_child(char_mc)

	col.add_child(_h_sep())

	# ── Section: Branques ──────────────────────────────────────────────────
	col.add_child(_section_label("Branques"))
	var branch_mc := MarginContainer.new()
	branch_mc.add_theme_constant_override("margin_left", 10)
	branch_mc.add_theme_constant_override("margin_right", 6)
	branch_mc.add_theme_constant_override("margin_bottom", 6)
	_branch_bar = VBoxContainer.new()
	_branch_bar.add_theme_constant_override("separation", 3)
	branch_mc.add_child(_branch_bar)
	col.add_child(branch_mc)

	col.add_child(_h_sep())

	# ── Section: Inclinació ────────────────────────────────────────────────
	col.add_child(_section_label("Inclinació"))
	var incl_mc := MarginContainer.new()
	incl_mc.add_theme_constant_override("margin_left", 10)
	incl_mc.add_theme_constant_override("margin_right", 6)
	incl_mc.add_theme_constant_override("margin_bottom", 6)
	var incl_col := VBoxContainer.new()
	incl_col.add_theme_constant_override("separation", 5)
	incl_mc.add_child(incl_col)
	col.add_child(incl_mc)

	for axis: String in ["impuls", "intel_lectus", "espiritualitat", "sociabilitat"]:
		var row := VBoxContainer.new()
		row.add_theme_constant_override("separation", 2)

		var label_row := HBoxContainer.new()
		label_row.add_theme_constant_override("separation", 4)
		var lbl := Label.new()
		lbl.text = AXIS_LABELS[axis]
		lbl.add_theme_color_override("font_color", C_DIM)
		lbl.add_theme_font_size_override("font_size", 9)
		lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		label_row.add_child(lbl)
		var val_lbl := Label.new()
		val_lbl.add_theme_color_override("font_color", AXIS_COLORS[axis])
		val_lbl.add_theme_font_size_override("font_size", 9)
		val_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
		label_row.add_child(val_lbl)
		row.add_child(label_row)

		var track := Panel.new()
		track.custom_minimum_size = Vector2(0, 5)
		track.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		track.add_theme_stylebox_override("panel", _flat(C_SURFACE2))
		var center_line := Panel.new()
		center_line.add_theme_stylebox_override("panel", _flat(C_BORDER))
		center_line.custom_minimum_size = Vector2(1, 5)
		track.add_child(center_line)
		var fill := Panel.new()
		fill.add_theme_stylebox_override("panel", _flat(AXIS_COLORS[axis]))
		fill.custom_minimum_size.y = 5
		track.add_child(fill)
		row.add_child(track)

		_incl_bars[axis] = {"track": track, "center": center_line, "fill": fill, "val": val_lbl}
		incl_col.add_child(row)

	col.add_child(_h_sep())

	# ── Section: Habilitats ────────────────────────────────────────────────
	col.add_child(_section_label("Habilitats"))
	var skills_mc := MarginContainer.new()
	skills_mc.add_theme_constant_override("margin_left", 10)
	skills_mc.add_theme_constant_override("margin_right", 6)
	skills_mc.add_theme_constant_override("margin_bottom", 8)
	_skills_bar = VBoxContainer.new()
	_skills_bar.add_theme_constant_override("separation", 2)
	skills_mc.add_child(_skills_bar)
	col.add_child(skills_mc)

	# Reset button at bottom
	var reset_mc := MarginContainer.new()
	reset_mc.add_theme_constant_override("margin_left", 10)
	reset_mc.add_theme_constant_override("margin_bottom", 8)
	var reset_btn := Button.new()
	reset_btn.text = "↺ Reset"
	reset_btn.flat = true
	reset_btn.add_theme_color_override("font_color", C_DIM)
	reset_btn.add_theme_font_size_override("font_size", 10)
	reset_btn.pressed.connect(func() -> void:
		SaveSystem.delete_save()
		request_new_game.emit())
	reset_mc.add_child(reset_btn)
	col.add_child(reset_mc)

	return col


func _h_sep() -> HSeparator:
	var s := HSeparator.new()
	s.add_theme_color_override("color", C_BORDER)
	return s


func _section_label(text: String) -> Control:
	var mc := MarginContainer.new()
	mc.add_theme_constant_override("margin_left", 10)
	mc.add_theme_constant_override("margin_top", 8)
	mc.add_theme_constant_override("margin_bottom", 4)
	var lbl := Label.new()
	lbl.text = text.to_upper()
	lbl.add_theme_color_override("font_color", C_DIM)
	lbl.add_theme_font_size_override("font_size", 9)
	mc.add_child(lbl)
	return mc


func _build_top_bar() -> Control:
	# Compact top bar: game title | vitals | resources | cycle
	var style := StyleBoxFlat.new()
	style.bg_color = C_SURFACE
	style.border_width_bottom = 1; style.border_color = C_BORDER
	style.content_margin_left = 12; style.content_margin_right = 12
	style.content_margin_top = 6; style.content_margin_bottom = 6
	var bar := PanelContainer.new()
	bar.add_theme_stylebox_override("panel", style)

	var hbox := HBoxContainer.new()
	hbox.add_theme_constant_override("separation", 10)
	bar.add_child(hbox)

	# Game name
	var title_col := VBoxContainer.new()
	title_col.add_theme_constant_override("separation", 1)
	var game_lbl := Label.new()
	game_lbl.text = "Bloodline"
	game_lbl.add_theme_color_override("font_color", C_ACCENT)
	game_lbl.add_theme_font_size_override("font_size", 13)
	title_col.add_child(game_lbl)
	hbox.add_child(title_col)

	var div1 := _v_div()
	hbox.add_child(div1)

	# Vitals section
	var vitals_col := VBoxContainer.new()
	vitals_col.add_theme_constant_override("separation", 2)
	var vitals_lbl := Label.new()
	vitals_lbl.text = "VITALS"
	vitals_lbl.add_theme_color_override("font_color", C_DIM)
	vitals_lbl.add_theme_font_size_override("font_size", 8)
	vitals_col.add_child(vitals_lbl)
	var vitals_pills := HBoxContainer.new()
	vitals_pills.add_theme_constant_override("separation", 4)
	_pill_food   = _resource_pill("🌾", "0", C_GOLD)
	_pill_health = _resource_pill("❤️", "0", C_GREEN)
	vitals_pills.add_child(_pill_food)
	vitals_pills.add_child(_pill_health)
	vitals_col.add_child(vitals_pills)
	hbox.add_child(vitals_col)

	var div2 := _v_div()
	hbox.add_child(div2)

	# Resources section
	var res_col := VBoxContainer.new()
	res_col.add_theme_constant_override("separation", 2)
	var res_lbl := Label.new()
	res_lbl.text = "RECURSOS"
	res_lbl.add_theme_color_override("font_color", C_DIM)
	res_lbl.add_theme_font_size_override("font_size", 8)
	res_col.add_child(res_lbl)
	var res_pills := HBoxContainer.new()
	res_pills.add_theme_constant_override("separation", 4)
	_pill_tokens = _resource_pill("🦴", "0", C_GOLD)
	res_pills.add_child(_pill_tokens)
	res_col.add_child(res_pills)
	hbox.add_child(res_col)

	return bar


func _v_div() -> Control:
	var sep := Panel.new()
	sep.custom_minimum_size = Vector2(1, 32)
	var sep_style := StyleBoxFlat.new()
	sep_style.bg_color = C_BORDER
	sep.add_theme_stylebox_override("panel", sep_style)
	return sep


func _resource_pill(icon: String, value: String, col: Color) -> Label:
	var lbl := Label.new()
	lbl.text = "%s %s" % [icon, value]
	lbl.add_theme_color_override("font_color", col)
	lbl.add_theme_font_size_override("font_size", 12)
	var style := StyleBoxFlat.new()
	style.bg_color = C_SURFACE2
	style.border_width_left = 1; style.border_width_right = 1
	style.border_width_top = 1; style.border_width_bottom = 1
	style.border_color = C_BORDER
	style.corner_radius_top_left = 20; style.corner_radius_top_right = 20
	style.corner_radius_bottom_left = 20; style.corner_radius_bottom_right = 20
	style.content_margin_left = 8; style.content_margin_right = 8
	style.content_margin_top = 3; style.content_margin_bottom = 3
	lbl.add_theme_stylebox_override("normal", style)
	return lbl


func _build_era_strip() -> Control:
	var wrap := PanelContainer.new()
	wrap.add_theme_stylebox_override("panel", _flat(C_SURFACE, 0))

	var track := Panel.new()
	track.custom_minimum_size = Vector2(0, 3)
	track.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	track.add_theme_stylebox_override("panel", _flat(C_SURFACE2))
	_era_fill = Panel.new()
	_era_fill.add_theme_stylebox_override("panel", _flat(C_GOLD))
	_era_fill.custom_minimum_size = Vector2(0, 3)
	track.add_child(_era_fill)
	wrap.add_child(track)
	return wrap




func _build_log_strip() -> Control:
	var wrap := PanelContainer.new()
	var style := StyleBoxFlat.new()
	style.bg_color = C_SURFACE
	style.border_width_top = 1; style.border_color = C_BORDER
	style.content_margin_left = 12; style.content_margin_right = 12
	style.content_margin_top = 6; style.content_margin_bottom = 6
	wrap.add_theme_stylebox_override("panel", style)
	wrap.custom_minimum_size.y = 58

	_log_label = Label.new()
	_log_label.add_theme_color_override("font_color", C_DIM)
	_log_label.add_theme_font_size_override("font_size", 10)
	_log_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	wrap.add_child(_log_label)
	return wrap


func _build_overlay() -> Control:
	var overlay := Control.new()
	overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	overlay.visible = false

	var dimmer := ColorRect.new()
	dimmer.color = Color(0.0, 0.0, 0.0, 0.80)
	dimmer.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	overlay.add_child(dimmer)

	var center := CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	overlay.add_child(center)

	var box := PanelContainer.new()
	box.custom_minimum_size = Vector2(320, 0)
	var box_style := StyleBoxFlat.new()
	box_style.bg_color = C_SURFACE
	box_style.border_width_left = 1; box_style.border_width_right = 1
	box_style.border_width_top = 1; box_style.border_width_bottom = 1
	box_style.border_color = C_BORDER
	box_style.corner_radius_top_left = 12; box_style.corner_radius_top_right = 12
	box_style.corner_radius_bottom_left = 12; box_style.corner_radius_bottom_right = 12
	box_style.content_margin_left = 20; box_style.content_margin_right = 20
	box_style.content_margin_top = 20; box_style.content_margin_bottom = 20
	box.add_theme_stylebox_override("panel", box_style)
	center.add_child(box)

	_ov_vbox = VBoxContainer.new()
	_ov_vbox.add_theme_constant_override("separation", 12)
	box.add_child(_ov_vbox)

	_ov_tag = Label.new()
	_ov_tag.add_theme_color_override("font_color", C_DIM)
	_ov_tag.add_theme_font_size_override("font_size", 9)
	_ov_tag.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_ov_vbox.add_child(_ov_tag)

	_ov_icon = Label.new()
	_ov_icon.add_theme_font_size_override("font_size", 44)
	_ov_icon.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_ov_vbox.add_child(_ov_icon)

	_ov_title = Label.new()
	_ov_title.add_theme_color_override("font_color", C_TEXT)
	_ov_title.add_theme_font_size_override("font_size", 17)
	_ov_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_ov_title.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_ov_vbox.add_child(_ov_title)

	_ov_sub = Label.new()
	_ov_sub.add_theme_color_override("font_color", C_DIM)
	_ov_sub.add_theme_font_size_override("font_size", 12)
	_ov_sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_ov_sub.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_ov_vbox.add_child(_ov_sub)

	_ov_btn = Button.new()
	_ov_btn.add_theme_color_override("font_color", C_GOLD)
	_ov_btn.add_theme_font_size_override("font_size", 14)
	_ov_btn.custom_minimum_size.y = 44
	var btn_style := StyleBoxFlat.new()
	btn_style.bg_color = C_SURFACE2
	btn_style.border_width_left = 1; btn_style.border_width_right = 1
	btn_style.border_width_top = 1; btn_style.border_width_bottom = 1
	btn_style.border_color = C_BORDER
	btn_style.corner_radius_top_left = 8; btn_style.corner_radius_top_right = 8
	btn_style.corner_radius_bottom_left = 8; btn_style.corner_radius_bottom_right = 8
	_ov_btn.add_theme_stylebox_override("normal", btn_style)
	_ov_vbox.add_child(_ov_btn)

	return overlay


# ══ SIGNALS ═══════════════════════════════════════════════════════════════════

func _connect_signals() -> void:
	ActionManager.action_executed.connect(_on_action_executed)
	ActionManager.zone_unlocked.connect(_on_zone_unlocked)
	EraManager.universal_tech_discovered.connect(_on_tech_discovered)
	LineageManager.succession_required.connect(_on_succession_required)
	LineageManager.lineage_extinct.connect(_on_lineage_extinct)
	LineageManager.era_ended.connect(_on_era_ended)
	EventManager.event_triggered.connect(_on_event_triggered)
	EventManager.event_resolved.connect(_on_event_resolved)
	EventManager.skill_discovered.connect(_on_skill_discovered)


# ══ REFRESH ════════════════════════════════════════════════════════════════════

func _refresh() -> void:
	_refresh_top_bar()
	_refresh_branches()
	call_deferred("_refresh_incl_bars")
	call_deferred("_refresh_era_fill")
	_refresh_zones()


func _refresh_top_bar() -> void:
	_pill_food.text   = "🌾 %d" % int(GameState.food)
	_pill_health.text = "❤️ %d" % int(GameState.health)
	_pill_tokens.text = "🦴 %d" % int(GameState.tokens)
	_set_pill_state(_pill_food,   GameState.food   <= 3.0,  C_GOLD)
	_set_pill_state(_pill_health, GameState.health <= 20.0, C_GREEN)

	# Left panel char info
	var age: int = LineageManager.character_age()
	var partner: String = " 💑" if GameState.has_partner else ""
	var kids: String = " 👶×%d" % GameState.children.size() if not GameState.children.is_empty() else ""
	_label_char.text  = GameState.character_label + partner + kids
	_label_meta.text  = "Gen %d · Edat %d · %s" % [GameState.generation, age, GameState.dynasty_name]
	var era_pct: int  = int(EraManager.get_era_progress_pct() * 100)
	_family_bar.text  = "Era %d%%" % era_pct


func _set_pill_state(pill: Label, critical: bool, normal_col: Color) -> void:
	var col: Color = C_ACCENT if critical else normal_col
	pill.add_theme_color_override("font_color", col)
	var raw: StyleBox = pill.get_theme_stylebox("normal")
	var style: StyleBoxFlat = raw.duplicate() as StyleBoxFlat
	style.border_color = C_ACCENT.lerp(C_BORDER, 0.0 if critical else 1.0)
	pill.add_theme_stylebox_override("normal", style)


func _refresh_branches() -> void:
	for child: Node in _branch_bar.get_children():
		child.queue_free()

	var era: Dictionary = DataLoader.eras.get(GameState.current_era_id, {})
	var branches: Array = era.get("branches", [])
	var active_ids: Array = BranchManager.get_active_branch_ids()

	for branch: Variant in branches:
		var b: Dictionary = branch as Dictionary
		var bid: String = b.get("id", "")
		var is_active: bool = bid in active_ids
		var bcol: Color = BRANCH_COLORS.get(bid, C_DIM)

		var chip := Label.new()
		chip.text = b.get("name", bid)
		chip.add_theme_font_size_override("font_size", 10)
		if is_active:
			chip.add_theme_color_override("font_color", bcol)
		else:
			chip.add_theme_color_override("font_color", C_DIM)
		_branch_bar.add_child(chip)

	# Skills
	for child: Node in _skills_bar.get_children():
		child.queue_free()
	if GameState.unlocked_skill_ids.is_empty():
		var none_lbl := Label.new()
		none_lbl.text = "—"
		none_lbl.add_theme_color_override("font_color", C_DIM)
		none_lbl.add_theme_font_size_override("font_size", 10)
		_skills_bar.add_child(none_lbl)
	else:
		for skill_id: String in GameState.unlocked_skill_ids:
			var sk: Dictionary = DataLoader.skills.get(skill_id, {}) as Dictionary
			var skill_name: String = sk.get("name", skill_id.replace("bt_", "").replace("_", " ").capitalize())
			var sl := Label.new()
			sl.text = "• " + skill_name
			sl.add_theme_color_override("font_color", C_GOLD)
			sl.add_theme_font_size_override("font_size", 10)
			_skills_bar.add_child(sl)


func _refresh_incl_bars() -> void:
	for axis: String in _incl_bars:
		var val: float = GameState.inclination.get(axis, 0.0)
		var entry: Dictionary = _incl_bars[axis]
		var track: Panel = entry["track"]
		var center: Panel = entry["center"]
		var fill: Panel = entry["fill"]
		var val_lbl: Label = entry["val"]
		val_lbl.text = "%+.2f" % val
		var tw: float = track.size.x
		if tw <= 0.0:
			continue
		center.position.x = tw * 0.5 - 0.5
		var fw: float = absf(val) * tw * 0.5
		fill.size.x = fw
		fill.position.x = tw * 0.5 if val >= 0.0 else tw * 0.5 - fw


func _refresh_era_fill() -> void:
	if _era_fill == null:
		return
	var tw: float = _era_fill.get_parent().size.x
	if tw <= 0.0:
		return
	_era_fill.size.x = tw * EraManager.get_era_progress_pct()
	_era_fill.position.x = 0.0


func _refresh_zones() -> void:
	for child: Node in _zone_container.get_children():
		child.queue_free()

	var era: Dictionary = DataLoader.eras.get(GameState.current_era_id, {})
	var zone_order: Array = era.get("zone_order", ["Campament", "Planes", "Bosc", "Ritual"])

	for zone_id: String in zone_order:
		_zone_container.add_child(_build_lt1_zone_card(zone_id))


## Zone colors per LT1 (header bg + border accent)
const ZONE_COLORS: Dictionary = {
	"Campament": Color(0.376, 0.647, 0.980),  # blue
	"Planes":    Color(0.961, 0.651, 0.137),  # gold
	"Bosc":      Color(0.306, 0.871, 0.502),  # green
	"Ritual":    Color(0.753, 0.510, 0.988),  # purple
}


func _build_lt1_zone_card(zone_id: String) -> Control:
	var discovered: bool = zone_id in GameState.discovered_zone_ids
	var zone_col: Color = ZONE_COLORS.get(zone_id, C_DIM)
	var actions: Array = _get_zone_actions(zone_id) if discovered else []
	var n_active: int = 0
	var n_buy: int = 0
	for a: Variant in actions:
		var vis: ActionManager.Visibility = ActionManager.get_action_visibility(a as Dictionary)
		if vis == ActionManager.Visibility.ACTIVE:  n_active += 1
		elif vis == ActionManager.Visibility.LOCKED: n_buy   += 1

	# Outer card
	var card := PanelContainer.new()
	card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var card_style := StyleBoxFlat.new()
	card_style.bg_color = C_SURFACE
	card_style.border_width_left = 1; card_style.border_width_right = 1
	card_style.border_width_top = 1; card_style.border_width_bottom = 1
	card_style.border_color = C_BORDER if discovered else C_BORDER.darkened(0.4)
	card_style.corner_radius_top_left = 8; card_style.corner_radius_top_right = 8
	card_style.corner_radius_bottom_left = 8; card_style.corner_radius_bottom_right = 8
	card.add_theme_stylebox_override("panel", card_style)
	if not discovered:
		card.modulate = Color(1, 1, 1, 0.45)

	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 0)
	card.add_child(col)

	# ── Header (coloured) ──────────────────────────────────────────────────
	var header_style := StyleBoxFlat.new()
	header_style.bg_color = zone_col.darkened(0.88) if discovered else C_SURFACE2
	header_style.border_width_bottom = 1
	header_style.border_color = zone_col.darkened(0.5) if discovered else C_BORDER
	header_style.content_margin_left = 12; header_style.content_margin_right = 12
	header_style.content_margin_top = 7;   header_style.content_margin_bottom = 7
	header_style.corner_radius_top_left = 8; header_style.corner_radius_top_right = 8
	var header := PanelContainer.new()
	header.add_theme_stylebox_override("panel", header_style)

	var hrow := HBoxContainer.new()
	hrow.add_theme_constant_override("separation", 6)
	header.add_child(hrow)

	var icon_lbl := Label.new()
	icon_lbl.text = ZONE_ICONS.get(zone_id, "📍")
	icon_lbl.add_theme_font_size_override("font_size", 13)
	hrow.add_child(icon_lbl)

	var title_lbl := Label.new()
	title_lbl.text = zone_id.to_upper()
	title_lbl.add_theme_color_override("font_color", zone_col if discovered else C_DIM)
	title_lbl.add_theme_font_size_override("font_size", 11)
	title_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hrow.add_child(title_lbl)

	if discovered and not actions.is_empty():
		var summary_lbl := Label.new()
		var parts: Array[String] = []
		if n_active > 0: parts.append("%d act" % n_active)
		if n_buy   > 0: parts.append("%d comp" % n_buy)
		summary_lbl.text = "  ·  ".join(parts)
		summary_lbl.add_theme_color_override("font_color", C_DIM)
		summary_lbl.add_theme_font_size_override("font_size", 10)
		hrow.add_child(summary_lbl)
	elif not discovered:
		var hint_lbl := Label.new()
		hint_lbl.text = "per descobrir"
		hint_lbl.add_theme_color_override("font_color", C_DIM)
		hint_lbl.add_theme_font_size_override("font_size", 10)
		hrow.add_child(hint_lbl)

	col.add_child(header)

	if not discovered:
		return card

	# ── Action rows ────────────────────────────────────────────────────────
	var content := VBoxContainer.new()
	content.add_theme_constant_override("separation", 0)
	col.add_child(content)

	if actions.is_empty():
		var em := Label.new()
		em.text = "Sense accions disponibles"
		em.add_theme_color_override("font_color", C_DIM)
		em.add_theme_font_size_override("font_size", 10)
		var em_mc := MarginContainer.new()
		em_mc.add_theme_constant_override("margin_left", 12)
		em_mc.add_theme_constant_override("margin_top", 8)
		em_mc.add_theme_constant_override("margin_bottom", 8)
		em_mc.add_child(em)
		content.add_child(em_mc)
	else:
		for action: Variant in actions:
			content.add_child(_build_lt1_action_row(action as Dictionary))

	return card


func _build_lt1_action_row(action: Dictionary) -> Control:
	var action_id: String = action.get("id", "")
	var name_str: String  = action.get("name_key", action.get("name", action_id))
	var out_min: int      = int(action.get("output_min", 0))
	var out_max: int      = int(action.get("output_max", 0))
	var vis: ActionManager.Visibility = ActionManager.get_action_visibility(action)
	var cost: int         = int(action.get("purchase_cost", 0))
	var side_str: String  = _side_effect_badge(action)
	var is_upgrade: bool  = action.get("is_upgrade", false)

	# Row outer container
	var row_mc := MarginContainer.new()
	row_mc.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row_mc.add_theme_constant_override("margin_left", 8)
	row_mc.add_theme_constant_override("margin_right", 8)
	row_mc.add_theme_constant_override("margin_top", 4)
	row_mc.add_theme_constant_override("margin_bottom", 4)

	# Inner styled panel
	var row_bg := PanelContainer.new()
	var row_style := StyleBoxFlat.new()
	if is_upgrade:
		row_style.bg_color = Color(C_GREEN.r, C_GREEN.g, C_GREEN.b, 0.04)
		row_style.border_color = Color(C_GREEN.r, C_GREEN.g, C_GREEN.b, 0.30)
	else:
		row_style.bg_color = C_SURFACE2
		row_style.border_color = C_BORDER
	row_style.border_width_left = 1; row_style.border_width_right = 1
	row_style.border_width_top = 1; row_style.border_width_bottom = 1
	row_style.corner_radius_top_left = 5; row_style.corner_radius_top_right = 5
	row_style.corner_radius_bottom_left = 5; row_style.corner_radius_bottom_right = 5
	row_style.content_margin_left = 8; row_style.content_margin_right = 8
	row_style.content_margin_top = 5; row_style.content_margin_bottom = 5
	row_bg.add_theme_stylebox_override("panel", row_style)
	row_mc.add_child(row_bg)

	var hbox := HBoxContainer.new()
	hbox.add_theme_constant_override("separation", 8)
	row_bg.add_child(hbox)

	# Left: name + meta
	var info_col := VBoxContainer.new()
	info_col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	info_col.add_theme_constant_override("separation", 2)
	hbox.add_child(info_col)

	var name_lbl := Label.new()
	name_lbl.text = name_str
	name_lbl.add_theme_font_size_override("font_size", 12)
	if vis == ActionManager.Visibility.ACTIVE:
		name_lbl.add_theme_color_override("font_color", C_TEXT)
	else:
		name_lbl.add_theme_color_override("font_color", C_DIM)
	info_col.add_child(name_lbl)

	var meta_lbl := Label.new()
	meta_lbl.text = "+%d–%d 🦴%s" % [out_min, out_max, side_str]
	meta_lbl.add_theme_color_override("font_color", C_DIM)
	meta_lbl.add_theme_font_size_override("font_size", 10)
	info_col.add_child(meta_lbl)

	# Right: button
	if vis == ActionManager.Visibility.ACTIVE:
		var exec_btn := Button.new()
		exec_btn.text = "▶"
		exec_btn.add_theme_font_size_override("font_size", 13)
		exec_btn.custom_minimum_size = Vector2(36, 36)
		exec_btn.add_theme_color_override("font_color", Color(0.03, 0.10, 0.03))
		exec_btn.add_theme_stylebox_override("normal", _btn_style(C_GREEN.darkened(0.2), C_GREEN))
		exec_btn.add_theme_stylebox_override("hover",  _btn_style(C_GREEN.darkened(0.1), C_GREEN))
		exec_btn.pressed.connect(func() -> void: _on_action_pressed(action_id))
		hbox.add_child(exec_btn)
	elif vis == ActionManager.Visibility.LOCKED and cost > 0:
		var can_buy: bool = GameState.tokens >= float(cost)
		var buy_btn := Button.new()
		buy_btn.text = "🦴%d" % cost
		buy_btn.add_theme_font_size_override("font_size", 11)
		buy_btn.custom_minimum_size = Vector2(48, 36)
		buy_btn.disabled = not can_buy
		buy_btn.add_theme_color_override("font_color",
			Color(0.03, 0.06, 0.14) if can_buy else C_DIM)
		buy_btn.add_theme_stylebox_override("normal",
			_btn_style(C_BLUE.darkened(0.2) if can_buy else C_SURFACE2,
			C_BLUE if can_buy else C_BORDER))
		buy_btn.pressed.connect(func() -> void:
			ActionManager.purchase_action(action_id)
			_refresh_zones())
		hbox.add_child(buy_btn)

	return row_mc


func _btn_style(bg: Color, border: Color) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = bg
	s.border_width_left = 1; s.border_width_right = 1
	s.border_width_top = 1; s.border_width_bottom = 1
	s.border_color = border
	s.corner_radius_top_left = 6; s.corner_radius_top_right = 6
	s.corner_radius_bottom_left = 6; s.corner_radius_bottom_right = 6
	s.content_margin_left = 8; s.content_margin_right = 8
	s.content_margin_top = 4; s.content_margin_bottom = 4
	return s


func _get_zone_actions(zone_id: String) -> Array:
	var result: Array = []
	for action_id: String in DataLoader.actions:
		var action: Dictionary = DataLoader.actions[action_id]
		if action.get("zona", "") != zone_id:
			continue
		if action.get("is_discovery_action", false):
			continue
		var vis: ActionManager.Visibility = ActionManager.get_action_visibility(action)
		if vis != ActionManager.Visibility.HIDDEN:
			result.append(action)
	result.sort_custom(func(a: Dictionary, b: Dictionary) -> bool:
		if a.get("is_base", false) != b.get("is_base", false):
			return a.get("is_base", false)
		return int(a.get("purchase_cost", 0)) < int(b.get("purchase_cost", 0)))
	return result


# ══ EVENT HANDLERS ════════════════════════════════════════════════════════════

func _on_action_pressed(action_id: String) -> void:
	ActionManager.execute_action(action_id)
	EraManager.check_universal_techs()
	var action: Dictionary = DataLoader.actions.get(action_id, {})
	_pending_pool_id = action.get("event_pool_id", "")
	if LineageManager.should_trigger_succession():
		LineageManager.trigger_succession()
	SaveSystem.save()


func _on_action_executed(action_id: String, output: float, side_effects: Array) -> void:
	if action_id == "child_born":
		_suppress_next_result = true
		var child_label: String = ""
		for se: Variant in side_effects:
			var s: Dictionary = se as Dictionary
			if s.get("resource") == "child":
				child_label = s.get("label", "")
		_show_overlay("NOU MEMBRE", "👶", child_label,
			"Fill/a de %s" % GameState.character_label, "Benvingut →",
			func() -> void:
				_refresh())
		return
	if _suppress_next_result:
		_suppress_next_result = false
		_refresh()
		return
	var action: Dictionary = DataLoader.actions.get(action_id, {})
	var name_str: String = action.get("name_key", action.get("name", action_id))
	var output_str: String = "+%d 🦴" % int(output) if output > 0 else "—"
	_add_log("[C%d] %s  %s" % [GameState.era_cycle, name_str, output_str])
	_show_overlay("RESULTAT", "", name_str, output_str, "Continuar →",
		func() -> void:
			_refresh()
			if _pending_pool_id != "":
				var pool: String = _pending_pool_id
				_pending_pool_id = ""
				EventManager.try_trigger_event(pool))



func _on_zone_unlocked(zone_id: String) -> void:
	_add_log("🗺️ Nova zona: %s" % zone_id)
	_refresh_zones()


func _on_tech_discovered(tech: Dictionary) -> void:
	var icon: String = tech.get("icon", "⭐")
	var name_str: String = tech.get("name", tech.get("name_key", ""))
	_show_overlay("NOVA TECNOLOGIA", icon, name_str, "", "Entès →",
		func() -> void: _refresh())


func _on_succession_required(successors: Array) -> void:
	var dying_label: String = GameState.character_label
	var dying_age: int = LineageManager.character_age()
	var cause: String = "Salut esgotada" if GameState.health <= 0.0 else "Vida complerta"
	_show_overlay("FI D'UNA VIDA", _char_emoji(), dying_label,
		"%d cicles  ·  %s" % [dying_age, cause],
		"El llinatge continua →",
		func() -> void: _show_succession_overlay(successors))


func _on_lineage_extinct() -> void:
	_show_overlay("FI DEL LLINATGE", "💀", "El llinatge s'extingeix",
		"El personatge ha mort sense hereus.", "Nova Partida",
		func() -> void: request_new_game.emit())


func _on_era_ended(_summary: Dictionary) -> void:
	var score: Dictionary = ScoringManager.calculate_era_score()
	var title: String = ScoringManager.get_dynasty_title(int(score.get("total", 0)))
	var sub: String = "%s\n%d punts  ·  %dG  ·  %dT  ·  %dH" % [
		title,
		int(score.get("total", 0)),
		int(score.get("generations", 1)),
		int(score.get("techs", 0)),
		int(score.get("skills", 0))
	]
	_show_overlay("ERA COMPLETA", "🌾", GameState.dynasty_name, sub,
		"Nova Partida",
		func() -> void:
			SaveSystem.delete_save()
			request_new_game.emit())


func _on_event_triggered(event: Dictionary) -> void:
	if event.get("options", []).size() > 0:
		_show_event_overlay(event)
	else:
		var effects: Dictionary = event.get("effects", {})
		var fx: String = ""
		if effects.has("food"):   fx += " %+d 🌾" % int(effects["food"])
		if effects.has("health"): fx += " %+d ❤️" % int(effects["health"])
		var text: String = event.get("text", "")
		var short: String = text.substr(0, 72) + ("…" if text.length() > 72 else "")
		_show_overlay("ESDEVENIMENT", "📜", short, fx.strip_edges(), "Continuar →",
			func() -> void:
				EventManager.dismiss_simple_event()
				_refresh())


func _on_event_resolved(event_id: String, _opt: int, effects: Array) -> void:
	var fd: float = 0.0
	var hd: float = 0.0
	for e: Variant in effects:
		var ef: Dictionary = e as Dictionary
		if ef.get("resource") == "food":   fd += float(ef.get("delta", 0))
		if ef.get("resource") == "health": hd += float(ef.get("delta", 0))
	var parts: Array[String] = []
	if fd != 0.0: parts.append("%+d🌾" % int(fd))
	if hd != 0.0: parts.append("%+d❤️" % int(hd))
	if not parts.is_empty():
		_add_log("📜 %s" % "  ".join(parts))
	_refresh()


func _on_skill_discovered(skill_id: String) -> void:
	var name_str: String = skill_id.replace("bt_", "").replace("_", " ").capitalize()
	_show_overlay("NOVA HABILITAT", "✨", name_str,
		"Has après una nova habilitat.", "Entès →",
		func() -> void: _refresh())


# ══ OVERLAY HELPERS ════════════════════════════════════════════════════════════

func _show_overlay(tag: String, icon: String, title: String, sub: String,
		btn_text: String, on_dismiss: Callable) -> void:
	_ov_tag.text = tag
	_ov_icon.text = icon
	_ov_title.text = title
	_ov_sub.text = sub
	_ov_sub.visible = sub != ""
	_ov_btn.text = btn_text
	_ov_btn.visible = true
	if _ov_btn.pressed.get_connections().size() > 0:
		_ov_btn.pressed.disconnect(_ov_btn.pressed.get_connections()[0]["callable"])
	_ov_btn.pressed.connect(func() -> void:
		_overlay.visible = false
		on_dismiss.call())
	_overlay.visible = true


func _show_succession_overlay(successors: Array) -> void:
	_ov_tag.text = "SUCCESSIÓ"
	_ov_icon.text = "👥"
	_ov_title.text = "Tria el successor"
	_ov_sub.text = "L'esperit del llinatge continua."
	_ov_sub.visible = true
	_ov_btn.visible = false

	for child: Node in _ov_vbox.get_children():
		if child.name.begins_with("S_"):
			child.queue_free()

	var axis_icons: Dictionary = {
		"impuls": "🏹", "intel_lectus": "🪨",
		"espiritualitat": "🔥", "sociabilitat": "👥"
	}
	for s: Variant in successors:
		var sd: Dictionary = s as Dictionary
		var incl: Dictionary = sd.get("inherited_inclination", {})
		var dom_axis: String = "impuls"
		var dom_val: float = 0.0
		for ax: String in incl:
			if absf(float(incl[ax])) > absf(dom_val):
				dom_axis = ax
				dom_val = float(incl[ax])
		var icon_chr: String = axis_icons.get(dom_axis, "?")
		var tag_str: String = " (Germà)" if sd.get("is_sibling", false) else ""
		var succ_btn := Button.new()
		succ_btn.name = "S_" + sd.get("id", "?")
		succ_btn.text = "%s  %s  %s%s" % [icon_chr, sd.get("label", "?"), "%+.2f" % dom_val, tag_str]
		succ_btn.add_theme_font_size_override("font_size", 13)
		succ_btn.custom_minimum_size.y = 46
		var dom_col: Color = AXIS_COLORS.get(dom_axis, C_GOLD)
		succ_btn.add_theme_color_override("font_color", dom_col)
		succ_btn.add_theme_stylebox_override("normal", _btn_style(C_SURFACE2, dom_col.darkened(0.4)))
		succ_btn.add_theme_stylebox_override("hover",  _btn_style(dom_col.darkened(0.65), dom_col))
		var sid: String = sd.get("id", "")
		succ_btn.pressed.connect(func() -> void:
			_ov_btn.visible = true
			for child: Node in _ov_vbox.get_children():
				if child.name.begins_with("S_"):
					child.queue_free()
			_overlay.visible = false
			LineageManager.choose_successor(sid)
			_refresh())
		_ov_vbox.add_child(succ_btn)

	_overlay.visible = true


func _show_event_overlay(event: Dictionary) -> void:
	_ov_tag.text = "ESDEVENIMENT"
	_ov_icon.text = ""
	_ov_title.text = ""
	_ov_sub.text = event.get("text", "")
	_ov_sub.visible = true
	_ov_btn.visible = false

	for child: Node in _ov_vbox.get_children():
		if child.name.begins_with("O_"):
			child.queue_free()

	var options: Array = event.get("options", [])
	for i: int in range(options.size()):
		var opt: Dictionary = options[i] as Dictionary
		if opt.get("requires_skill", "") != "" and opt["requires_skill"] not in GameState.unlocked_skill_ids:
			continue
		if opt.get("requires_children", false) and GameState.children.is_empty():
			continue
		if opt.get("requires_no_children", false) and not GameState.children.is_empty():
			continue
		var opt_btn := Button.new()
		opt_btn.name = "O_%d" % i
		opt_btn.text = opt.get("text", "Opció %d" % (i + 1))
		opt_btn.add_theme_font_size_override("font_size", 12)
		opt_btn.custom_minimum_size.y = 42
		opt_btn.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		opt_btn.add_theme_color_override("font_color", C_TEXT)
		opt_btn.add_theme_stylebox_override("normal", _btn_style(C_SURFACE2, C_BORDER))
		opt_btn.add_theme_stylebox_override("hover",  _btn_style(C_SURFACE2, C_GOLD))
		var idx: int = i
		opt_btn.pressed.connect(func() -> void:
			_ov_btn.visible = true
			for child: Node in _ov_vbox.get_children():
				if child.name.begins_with("O_"):
					child.queue_free()
			_overlay.visible = false
			EventManager.resolve_option(idx)
			_refresh())
		_ov_vbox.add_child(opt_btn)

	_overlay.visible = true


# ══ HELPERS ════════════════════════════════════════════════════════════════════

func _add_log(entry: String) -> void:
	_log_entries.append(entry)
	if _log_entries.size() > 4:
		_log_entries.pop_front()
	_log_label.text = "\n".join(_log_entries)


func _dominant_axis_color(action: Dictionary) -> Color:
	var deltas: Dictionary = action.get("inclination_deltas", {})
	var best_axis: String = ""
	var best_val: float = 0.015
	for ax: String in deltas:
		if absf(float(deltas[ax])) > best_val:
			best_axis = ax
			best_val  = absf(float(deltas[ax]))
	return AXIS_COLORS.get(best_axis, C_TEXT)


func _side_effect_badge(action: Dictionary) -> String:
	var ses: Array = action.get("side_effects", [])
	var parts: PackedStringArray = []
	for se: Variant in ses:
		var s: Dictionary = se as Dictionary
		var d: int = int(s.get("delta", 0))
		if s.get("resource") == "food"   and d != 0: parts.append("%+d🌾" % d)
		if s.get("resource") == "health" and d != 0: parts.append("%+d❤️" % d)
	return ("  " + "  ".join(parts)) if not parts.is_empty() else ""


func _char_emoji() -> String:
	var inc: Dictionary = GameState.inclination
	if float(inc.get("impuls",         0.0)) > 0.3: return "🏹"
	if float(inc.get("intel_lectus",   0.0)) > 0.3: return "🪨"
	if float(inc.get("espiritualitat", 0.0)) > 0.3: return "🔥"
	if float(inc.get("sociabilitat",   0.0)) > 0.3: return "👥"
	return "🦴"


func _flat(color: Color, border_width: int = 1) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = color
	if border_width > 0:
		s.border_width_left = border_width; s.border_width_right = border_width
		s.border_width_top  = border_width; s.border_width_bottom = border_width
		s.border_color = C_BORDER
	return s


func _card(bg: Color, _border: int = 1) -> MarginContainer:
	var mc := MarginContainer.new()
	mc.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var style := StyleBoxFlat.new()
	style.bg_color = bg
	style.border_width_bottom = 1; style.border_color = C_BORDER
	mc.add_theme_stylebox_override("panel", style)
	return mc
