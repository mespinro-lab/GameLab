extends Control

## Main game screen — portrait layout, touch-first.
## Builds UI programmatically; replace with .tscn when artist joins.

signal request_new_game()

# UI node references
var _label_char: Label
var _label_gen: Label
var _label_resources: Label
var _incl_bars: Dictionary = {}
var _branch_bar: HBoxContainer
var _zone_container: VBoxContainer
var _log_label: Label
var _overlay: Control
# Overlay child refs (direct, avoids get_node path issues)
var _ov_tag: Label
var _ov_icon: Label
var _ov_title: Label
var _ov_sub: Label
var _ov_btn: Button
var _ov_vbox: VBoxContainer

const AXIS_LABELS: Dictionary = {
	"impuls": "Impuls",
	"intel_lectus": "Intel·lecte",
	"espiritualitat": "Espiritualitat",
	"sociabilitat": "Sociabilitat",
}
const AXIS_COLORS: Dictionary = {
	"impuls": Color(0.94, 0.27, 0.37),
	"intel_lectus": Color(0.38, 0.65, 0.98),
	"espiritualitat": Color(0.67, 0.48, 0.98),
	"sociabilitat": Color(0.29, 0.87, 0.50),
}


func _ready() -> void:
	_build_layout()
	_connect_signals()
	_refresh()


# ── Layout builder ────────────────────────────────────────────────────────────

func _build_layout() -> void:
	anchor_right = 1.0
	anchor_bottom = 1.0
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)

	var bg := ColorRect.new()
	bg.color = Color(0.07, 0.05, 0.03)
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(bg)

	var root := VBoxContainer.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.add_theme_constant_override("separation", 0)
	add_child(root)

	root.add_child(_build_top_bar())
	root.add_child(_build_branch_bar())
	root.add_child(_build_incl_panel())
	root.add_child(_build_zone_area())
	root.add_child(_build_log_panel())

	_overlay = _build_overlay()
	add_child(_overlay)


func _build_top_bar() -> Control:
	var bar := PanelContainer.new()
	bar.add_theme_stylebox_override("panel", _flat_style(Color(0.10, 0.08, 0.05)))
	var hbox := HBoxContainer.new()
	hbox.add_theme_constant_override("separation", 8)
	bar.add_child(hbox)

	var left := VBoxContainer.new()
	left.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_label_char = Label.new()
	_label_char.add_theme_color_override("font_color", Color(0.95, 0.88, 0.70))
	_label_char.add_theme_font_size_override("font_size", 16)
	left.add_child(_label_char)
	_label_gen = Label.new()
	_label_gen.add_theme_color_override("font_color", Color(0.55, 0.50, 0.42))
	_label_gen.add_theme_font_size_override("font_size", 11)
	left.add_child(_label_gen)
	hbox.add_child(left)

	_label_resources = Label.new()
	_label_resources.add_theme_color_override("font_color", Color(0.85, 0.80, 0.65))
	_label_resources.add_theme_font_size_override("font_size", 13)
	_label_resources.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	hbox.add_child(_label_resources)

	var reset_btn := Button.new()
	reset_btn.text = "↺"
	reset_btn.add_theme_font_size_override("font_size", 14)
	reset_btn.custom_minimum_size = Vector2(32, 32)
	reset_btn.add_theme_color_override("font_color", Color(0.45, 0.40, 0.35))
	reset_btn.pressed.connect(func() -> void:
		SaveSystem.delete_save()
		request_new_game.emit())
	hbox.add_child(reset_btn)

	return bar


func _build_branch_bar() -> Control:
	var panel := PanelContainer.new()
	panel.add_theme_stylebox_override("panel", _flat_style(Color(0.11, 0.08, 0.05)))
	_branch_bar = HBoxContainer.new()
	_branch_bar.add_theme_constant_override("separation", 6)
	panel.add_child(_branch_bar)
	return panel


func _build_incl_panel() -> Control:
	var panel := PanelContainer.new()
	panel.add_theme_stylebox_override("panel", _flat_style(Color(0.09, 0.07, 0.04)))
	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 4)
	panel.add_child(vbox)

	for axis: String in ["impuls", "intel_lectus", "espiritualitat", "sociabilitat"]:
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 6)

		var lbl := Label.new()
		lbl.text = AXIS_LABELS[axis]
		lbl.add_theme_color_override("font_color", Color(0.55, 0.50, 0.42))
		lbl.add_theme_font_size_override("font_size", 10)
		lbl.custom_minimum_size.x = 90
		row.add_child(lbl)

		var track := Panel.new()
		track.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		track.custom_minimum_size.y = 6
		track.add_theme_stylebox_override("panel", _flat_style(Color(0.18, 0.15, 0.11)))

		var fill := Panel.new()
		fill.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		fill.custom_minimum_size.y = 6
		fill.add_theme_stylebox_override("panel", _flat_style(AXIS_COLORS[axis]))
		fill.name = "Fill"
		track.add_child(fill)
		row.add_child(track)

		var val_lbl := Label.new()
		val_lbl.add_theme_color_override("font_color", AXIS_COLORS[axis])
		val_lbl.add_theme_font_size_override("font_size", 10)
		val_lbl.custom_minimum_size.x = 38
		val_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
		val_lbl.name = "Val"
		row.add_child(val_lbl)

		_incl_bars[axis] = {"track": track, "fill": fill, "val": val_lbl}
		vbox.add_child(row)

	return panel


func _build_zone_area() -> Control:
	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED

	_zone_container = VBoxContainer.new()
	_zone_container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_zone_container.add_theme_constant_override("separation", 6)
	scroll.add_child(_zone_container)

	var wrapper := PanelContainer.new()
	wrapper.add_theme_stylebox_override("panel", _flat_style(Color(0.07, 0.05, 0.03)))
	wrapper.size_flags_vertical = Control.SIZE_EXPAND_FILL
	wrapper.add_child(scroll)
	return wrapper


func _build_log_panel() -> Control:
	var panel := PanelContainer.new()
	panel.add_theme_stylebox_override("panel", _flat_style(Color(0.08, 0.06, 0.04)))
	panel.custom_minimum_size.y = 60

	_log_label = Label.new()
	_log_label.add_theme_color_override("font_color", Color(0.55, 0.50, 0.42))
	_log_label.add_theme_font_size_override("font_size", 11)
	_log_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	panel.add_child(_log_label)
	return panel


func _build_overlay() -> Control:
	var overlay := Control.new()
	overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	overlay.visible = false

	var dimmer := ColorRect.new()
	dimmer.color = Color(0.0, 0.0, 0.0, 0.72)
	dimmer.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	overlay.add_child(dimmer)

	var center := CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	overlay.add_child(center)

	var box := PanelContainer.new()
	box.custom_minimum_size = Vector2(330, 0)
	box.add_theme_stylebox_override("panel", _flat_style(Color(0.13, 0.10, 0.07)))
	center.add_child(box)

	_ov_vbox = VBoxContainer.new()
	_ov_vbox.add_theme_constant_override("separation", 14)
	box.add_child(_ov_vbox)

	_ov_tag = Label.new()
	_ov_tag.add_theme_color_override("font_color", Color(0.55, 0.50, 0.42))
	_ov_tag.add_theme_font_size_override("font_size", 10)
	_ov_tag.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_ov_vbox.add_child(_ov_tag)

	_ov_icon = Label.new()
	_ov_icon.add_theme_font_size_override("font_size", 48)
	_ov_icon.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_ov_vbox.add_child(_ov_icon)

	_ov_title = Label.new()
	_ov_title.add_theme_color_override("font_color", Color(0.95, 0.88, 0.70))
	_ov_title.add_theme_font_size_override("font_size", 18)
	_ov_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_ov_vbox.add_child(_ov_title)

	_ov_sub = Label.new()
	_ov_sub.add_theme_color_override("font_color", Color(0.65, 0.58, 0.48))
	_ov_sub.add_theme_font_size_override("font_size", 13)
	_ov_sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_ov_sub.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_ov_vbox.add_child(_ov_sub)

	_ov_btn = Button.new()
	_ov_btn.text = "Continuar →"
	_ov_btn.add_theme_color_override("font_color", Color(0.95, 0.88, 0.70))
	_ov_btn.add_theme_font_size_override("font_size", 14)
	_ov_vbox.add_child(_ov_btn)

	return overlay


# ── Signals ───────────────────────────────────────────────────────────────────

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


# ── Refresh ───────────────────────────────────────────────────────────────────

func _refresh() -> void:
	_refresh_top_bar()
	_refresh_branches()
	call_deferred("_refresh_inclination")
	_refresh_zones()


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
		var pill := Label.new()
		pill.text = b.get("name", bid)
		pill.add_theme_font_size_override("font_size", 11)
		if is_active:
			pill.add_theme_color_override("font_color", Color(0.95, 0.88, 0.50))
		else:
			pill.add_theme_color_override("font_color", Color(0.35, 0.30, 0.25))
		_branch_bar.add_child(pill)
		if branches.find(branch) < branches.size() - 1:
			var sep := Label.new()
			sep.text = "·"
			sep.add_theme_font_size_override("font_size", 11)
			sep.add_theme_color_override("font_color", Color(0.30, 0.26, 0.22))
			_branch_bar.add_child(sep)


func _refresh_top_bar() -> void:
	var age: int = LineageManager.character_age()
	var partner_str: String = "💑" if GameState.has_partner else ""
	var children_str: String = "👶×%d" % GameState.children.size() if not GameState.children.is_empty() else ""
	_label_char.text = "%s  %s %s" % [GameState.character_label, partner_str, children_str]
	var era_pct: int = int(EraManager.get_era_progress_pct() * 100)
	_label_gen.text = "Gen %d · Edat %d · Era %d%%" % [GameState.generation, age, era_pct]
	_label_resources.text = "🌾%d  ❤️%d  🦴%d" % [
		int(GameState.food), int(GameState.health), int(GameState.tokens)]


func _refresh_inclination() -> void:
	for axis: String in _incl_bars:
		var val: float = GameState.inclination.get(axis, 0.0)
		var entry: Dictionary = _incl_bars[axis]
		var track: Panel = entry["track"]
		var fill: Panel = entry["fill"]
		var lbl: Label = entry["val"]
		lbl.text = "%+.2f" % val
		var track_w: float = track.size.x
		if track_w <= 0.0:
			continue
		var fill_w: float = abs(val) * track_w * 0.5
		fill.size.x = fill_w
		fill.position.x = track_w * 0.5 if val >= 0.0 else track_w * 0.5 - fill_w


func _refresh_zones() -> void:
	for child: Node in _zone_container.get_children():
		child.queue_free()

	var era: Dictionary = DataLoader.eras.get(GameState.current_era_id, {})
	var zone_order: Array = era.get("zone_order", ["Campament", "Planes", "Bosc", "Ritual"])

	for zone_id: String in zone_order:
		if zone_id not in GameState.discovered_zone_ids:
			continue
		_zone_container.add_child(_build_zone_card(zone_id))


func _build_zone_card(zone_id: String) -> Control:
	var card := VBoxContainer.new()
	card.add_theme_constant_override("separation", 4)

	var header := Label.new()
	header.text = zone_id.to_upper()
	header.add_theme_color_override("font_color", Color(0.55, 0.50, 0.42))
	header.add_theme_font_size_override("font_size", 10)
	card.add_child(header)

	var actions: Array = _get_zone_actions(zone_id)
	if actions.is_empty():
		var empty := Label.new()
		empty.text = "Cap acció disponible"
		empty.add_theme_color_override("font_color", Color(0.40, 0.36, 0.30))
		empty.add_theme_font_size_override("font_size", 11)
		card.add_child(empty)
		return card

	for action: Dictionary in actions:
		card.add_child(_build_action_row(action))

	return card


func _build_action_row(action: Dictionary) -> Control:
	var action_id: String = action.get("id", "")
	var name_str: String = action.get("name_key", action.get("name", action_id))
	var out_min: int = int(action.get("output_min", 0))
	var out_max: int = int(action.get("output_max", 0))
	var vis: ActionManager.Visibility = ActionManager.get_action_visibility(action)
	var cost: int = int(action.get("purchase_cost", 0))

	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 6)
	row.size_flags_horizontal = Control.SIZE_EXPAND_FILL

	var btn := Button.new()
	btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	btn.custom_minimum_size.y = 44
	btn.add_theme_font_size_override("font_size", 13)

	if vis == ActionManager.Visibility.ACTIVE:
		btn.text = "%s  +%d–%d 🦴" % [name_str, out_min, out_max]
		btn.add_theme_color_override("font_color", Color(0.92, 0.85, 0.68))
		btn.pressed.connect(_on_action_pressed.bind(action_id))
	elif vis == ActionManager.Visibility.LOCKED and cost > 0:
		btn.text = "%s  +%d–%d 🦴" % [name_str, out_min, out_max]
		btn.add_theme_color_override("font_color", Color(0.50, 0.44, 0.34))
		var buy_btn := Button.new()
		buy_btn.text = "Comprar %d🦴" % cost
		buy_btn.custom_minimum_size = Vector2(90, 44)
		buy_btn.add_theme_font_size_override("font_size", 11)
		if GameState.tokens >= float(cost):
			buy_btn.add_theme_color_override("font_color", Color(0.95, 0.88, 0.50))
			buy_btn.pressed.connect(func() -> void:
				ActionManager.purchase_action(action_id)
				_refresh_zones())
		else:
			buy_btn.add_theme_color_override("font_color", Color(0.40, 0.36, 0.30))
			buy_btn.disabled = true
		btn.disabled = true
		row.add_child(btn)
		row.add_child(buy_btn)
		return row
	else:
		btn.text = name_str
		btn.add_theme_color_override("font_color", Color(0.35, 0.31, 0.26))
		btn.disabled = true

	row.add_child(btn)
	return row


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
	# Sort: base actions first, then by purchase cost ascending
	result.sort_custom(func(a: Dictionary, b: Dictionary) -> bool:
		if a.get("is_base", false) != b.get("is_base", false):
			return a.get("is_base", false)
		return int(a.get("purchase_cost", 0)) < int(b.get("purchase_cost", 0)))
	return result


# ── Event handlers ────────────────────────────────────────────────────────────

var _pending_pool_id: String = ""

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
		var child_label: String = ""
		for se: Variant in side_effects:
			var s: Dictionary = se as Dictionary
			if s.get("resource") == "child":
				child_label = s.get("label", "")
		_show_overlay("Nou membre del llinatge", "👶", child_label,
			"Fill de %s" % GameState.character_label, "Benvingut →",
			func() -> void: _refresh())
		return
	var action: Dictionary = DataLoader.actions.get(action_id, {})
	var name_str: String = action.get("name_key", action.get("name", action_id))
	var output_str: String = "+%d 🦴" % int(output) if output > 0 else ""
	_log_label.text = "[Cicle %d] %s  %s" % [GameState.era_cycle, name_str, output_str]
	_show_overlay("Resultat", "", name_str, output_str, "Continuar →",
		func() -> void:
			_refresh()
			if _pending_pool_id != "":
				var pool: String = _pending_pool_id
				_pending_pool_id = ""
				EventManager.try_trigger_event(pool))


func _on_zone_unlocked(zone_id: String) -> void:
	_log_label.text = "Nova zona descoberta: %s" % zone_id


func _on_tech_discovered(tech: Dictionary) -> void:
	var icon: String = tech.get("icon", "⭐")
	var name_key: String = tech.get("name_key", tech.get("name", ""))
	_show_overlay("Nova tecnologia", icon, name_key, tech.get("description", ""), "Entès →",
		func() -> void: _refresh())


func _on_succession_required(successors: Array) -> void:
	_show_succession_overlay(successors)


func _on_lineage_extinct() -> void:
	_show_overlay("Fi del llinatge", "💀", "El llinatge s'extingeix",
		"El personatge ha mort sense hereus.", "Tornar a jugar",
		func() -> void: request_new_game.emit())


func _on_era_ended(_summary: Dictionary) -> void:
	var score: Dictionary = ScoringManager.calculate_era_score()
	var title: String = ScoringManager.get_dynasty_title(int(score.get("total", 0)))
	var sub: String = "%s\n\n%d punts\n%dG · %dT · %dH" % [
		title,
		int(score.get("total", 0)),
		int(score.get("generations", 1)),
		int(score.get("techs", 0)),
		int(score.get("skills", 0))
	]
	_show_overlay("Era completa", "🌾", GameState.dynasty_name, sub,
		"Jugar de nou",
		func() -> void:
			SaveSystem.delete_save()
			request_new_game.emit())


func _on_event_triggered(event: Dictionary) -> void:
	var has_options: bool = event.get("options", []).size() > 0
	if has_options:
		_show_event_overlay(event)
	else:
		var effects: Dictionary = event.get("effects", {})
		var effects_str: String = ""
		if effects.has("food"):   effects_str += " %+d 🌾" % int(effects["food"])
		if effects.has("health"): effects_str += " %+d ❤️" % int(effects["health"])
		_show_overlay("Esdeveniment", "📜", event.get("text", "").substr(0, 60) + "...",
			effects_str.strip_edges(), "Continuar →",
			func() -> void:
				EventManager.dismiss_simple_event()
				_refresh())


func _on_event_resolved(_event_id: String, _option_index: int, _effects: Array) -> void:
	_refresh()


func _on_skill_discovered(skill_id: String) -> void:
	# Format skill name from id: "bt_guariment_plantes" → "Guariment de Plantes"
	var name_str: String = skill_id.replace("bt_", "").replace("_", " ").capitalize()
	_show_overlay("Nova habilitat", "✨", name_str,
		"Has après una nova habilitat que et permet accedir a noves accions.",
		"Entès →", func() -> void: _refresh())


func _show_event_overlay(event: Dictionary) -> void:
	_ov_tag.text = "ESDEVENIMENT"
	_ov_icon.text = ""
	_ov_title.text = ""
	_ov_sub.text = event.get("text", "")
	_ov_btn.visible = false

	for child: Node in _ov_vbox.get_children():
		if child.name.begins_with("OptBtn"):
			child.queue_free()

	var options: Array = event.get("options", [])
	var has_partner: bool = GameState.has_partner
	var has_children: bool = not GameState.children.is_empty()

	for i: int in range(options.size()):
		var opt: Dictionary = options[i] as Dictionary
		# Check option visibility
		if opt.get("requires_skill", "") != "" and opt["requires_skill"] not in GameState.unlocked_skill_ids:
			continue
		if opt.get("requires_children", false) and not has_children:
			continue
		if opt.get("requires_no_children", false) and has_children:
			continue

		var opt_btn := Button.new()
		opt_btn.name = "OptBtn_%d" % i
		opt_btn.text = opt.get("text", "Opció %d" % (i + 1))
		opt_btn.add_theme_font_size_override("font_size", 12)
		opt_btn.custom_minimum_size.y = 40
		opt_btn.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		var idx: int = i
		opt_btn.pressed.connect(func() -> void:
			_ov_btn.visible = true
			for child: Node in _ov_vbox.get_children():
				if child.name.begins_with("OptBtn"):
					child.queue_free()
			_overlay.visible = false
			EventManager.resolve_option(idx)
			_refresh())
		_ov_vbox.add_child(opt_btn)

	_overlay.visible = true


# ── Overlay helpers ───────────────────────────────────────────────────────────

func _show_overlay(tag: String, icon: String, title: String, sub: String,
		btn_text: String, on_dismiss: Callable) -> void:
	_ov_tag.text = tag.to_upper()
	_ov_icon.text = icon
	_ov_title.text = title
	_ov_sub.text = sub
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
	_ov_sub.text = ""
	_ov_btn.visible = false

	# Remove previous successor buttons
	for child: Node in _ov_vbox.get_children():
		if child.name.begins_with("SuccBtn"):
			child.queue_free()

	var axis_icons: Dictionary = {
		"impuls": "🏹", "intel_lectus": "🪨", "espiritualitat": "🔥", "sociabilitat": "👥"
	}
	for s: Variant in successors:
		var sdict: Dictionary = s as Dictionary
		var incl: Dictionary = sdict.get("inherited_inclination", {})
		var dom_axis: String = "impuls"
		var dom_val: float = 0.0
		for ax: String in incl:
			if absf(float(incl[ax])) > absf(dom_val):
				dom_axis = ax
				dom_val = float(incl[ax])
		var icon: String = axis_icons.get(dom_axis, "?")
		var tag: String = " (Germà)" if sdict.get("is_sibling", false) else ""
		var succ_btn := Button.new()
		succ_btn.name = "SuccBtn_" + sdict.get("id", "")
		succ_btn.text = "%s %s  %s%s" % [icon, sdict.get("label", "?"), "%+.2f" % dom_val, tag]
		succ_btn.add_theme_font_size_override("font_size", 13)
		succ_btn.custom_minimum_size.y = 44
		var sid: String = sdict.get("id", "")
		succ_btn.pressed.connect(func() -> void:
			_ov_btn.visible = true
			for child: Node in _ov_vbox.get_children():
				if child.name.begins_with("SuccBtn"):
					child.queue_free()
			_overlay.visible = false
			LineageManager.choose_successor(sid)
			_refresh())
		_ov_vbox.add_child(succ_btn)

	_overlay.visible = true


# ── Style helpers ─────────────────────────────────────────────────────────────

func _flat_style(color: Color) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = color
	return s
