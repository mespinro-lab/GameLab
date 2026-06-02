extends Control

## Main game screen — portrait layout, touch-first.
## Builds UI programmatically; replace with .tscn when artist joins.

# UI node references
var _label_char: Label
var _label_gen: Label
var _label_resources: Label
var _incl_bars: Dictionary = {}
var _zone_container: VBoxContainer
var _log_label: Label
var _overlay: Control

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

	return bar


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
	var overlay := PanelContainer.new()
	overlay.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	overlay.custom_minimum_size = Vector2(320, 220)
	overlay.add_theme_stylebox_override("panel", _flat_style(Color(0.13, 0.10, 0.07)))
	overlay.visible = false

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 12)
	overlay.add_child(vbox)

	var tag := Label.new()
	tag.name = "Tag"
	tag.add_theme_color_override("font_color", Color(0.55, 0.50, 0.42))
	tag.add_theme_font_size_override("font_size", 10)
	tag.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vbox.add_child(tag)

	var icon := Label.new()
	icon.name = "Icon"
	icon.add_theme_font_size_override("font_size", 48)
	icon.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vbox.add_child(icon)

	var title := Label.new()
	title.name = "Title"
	title.add_theme_color_override("font_color", Color(0.95, 0.88, 0.70))
	title.add_theme_font_size_override("font_size", 18)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vbox.add_child(title)

	var sub := Label.new()
	sub.name = "Sub"
	sub.add_theme_color_override("font_color", Color(0.65, 0.58, 0.48))
	sub.add_theme_font_size_override("font_size", 13)
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	sub.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	vbox.add_child(sub)

	var btn := Button.new()
	btn.name = "Btn"
	btn.text = "Continuar →"
	btn.add_theme_color_override("font_color", Color(0.95, 0.88, 0.70))
	btn.add_theme_font_size_override("font_size", 14)
	vbox.add_child(btn)

	return overlay


# ── Signals ───────────────────────────────────────────────────────────────────

func _connect_signals() -> void:
	ActionManager.action_executed.connect(_on_action_executed)
	ActionManager.zone_unlocked.connect(_on_zone_unlocked)
	EraManager.universal_tech_discovered.connect(_on_tech_discovered)
	LineageManager.succession_required.connect(_on_succession_required)
	LineageManager.lineage_extinct.connect(_on_lineage_extinct)


# ── Refresh ───────────────────────────────────────────────────────────────────

func _refresh() -> void:
	_refresh_top_bar()
	_refresh_inclination()
	_refresh_zones()


func _refresh_top_bar() -> void:
	var age: int = LineageManager.character_age()
	_label_char.text = GameState.character_label
	_label_gen.text = "Gen %d  ·  Edat %d  ·  Cicle %d" % [
		GameState.generation, age, GameState.era_cycle]
	_label_resources.text = "🌾 %d   ❤️ %d   🦴 %d" % [
		int(GameState.food), int(GameState.health), int(GameState.tokens)]


func _refresh_inclination() -> void:
	for axis: String in _incl_bars:
		var val: float = GameState.inclination.get(axis, 0.0)
		var entry: Dictionary = _incl_bars[axis]
		var track: Panel = entry["track"]
		var fill: Panel = entry["fill"]
		var lbl: Label = entry["val"]
		lbl.text = "%+.2f" % val
		await get_tree().process_frame
		var track_w: float = track.size.x
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
	var btn := Button.new()
	var action_id: String = action.get("id", "")
	var name_key: String = action.get("name_key", action.get("name", action_id))
	var out_min: int = int(action.get("output_min", 0))
	var out_max: int = int(action.get("output_max", 0))
	var vis: ActionManager.Visibility = ActionManager.get_action_visibility(action)

	btn.text = "%s   +%d–%d 🦴" % [name_key, out_min, out_max]
	btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	btn.custom_minimum_size.y = 44
	btn.add_theme_font_size_override("font_size", 13)

	if vis == ActionManager.Visibility.ACTIVE:
		btn.add_theme_color_override("font_color", Color(0.92, 0.85, 0.68))
		btn.pressed.connect(_on_action_pressed.bind(action_id))
	else:
		btn.add_theme_color_override("font_color", Color(0.40, 0.36, 0.30))
		btn.disabled = true

	return btn


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
	return result


# ── Event handlers ────────────────────────────────────────────────────────────

func _on_action_pressed(action_id: String) -> void:
	ActionManager.execute_action(action_id)
	EraManager.check_universal_techs()
	if LineageManager.should_trigger_succession():
		LineageManager.trigger_succession()


func _on_action_executed(action_id: String, output: float, _side_effects: Array) -> void:
	var action: Dictionary = DataLoader.actions.get(action_id, {})
	var name_str: String = action.get("name_key", action.get("name", action_id))
	_log_label.text = "[Cicle %d] %s: +%d 🦴" % [GameState.era_cycle, name_str, int(output)]
	_show_overlay("Resultat", "", name_str, "+%d 🦴" % int(output), "Continuar →",
		func() -> void: _refresh())


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
		func() -> void: get_tree().reload_current_scene())


# ── Overlay helpers ───────────────────────────────────────────────────────────

func _show_overlay(tag: String, icon: String, title: String, sub: String,
		btn_text: String, on_dismiss: Callable) -> void:
	_overlay.get_node("VBoxContainer/Tag").text = tag.to_upper()
	_overlay.get_node("VBoxContainer/Icon").text = icon
	_overlay.get_node("VBoxContainer/Title").text = title
	_overlay.get_node("VBoxContainer/Sub").text = sub
	var btn: Button = _overlay.get_node("VBoxContainer/Btn")
	btn.text = btn_text
	if btn.pressed.get_connections().size() > 0:
		btn.pressed.disconnect(btn.pressed.get_connections()[0]["callable"])
	btn.pressed.connect(func() -> void:
		_overlay.visible = false
		on_dismiss.call())
	_overlay.visible = true


func _show_succession_overlay(successors: Array) -> void:
	_overlay.get_node("VBoxContainer/Tag").text = "SUCCESSIÓ"
	_overlay.get_node("VBoxContainer/Icon").text = "👥"
	_overlay.get_node("VBoxContainer/Title").text = "Tria el successor"
	_overlay.get_node("VBoxContainer/Sub").text = ""

	var btn: Button = _overlay.get_node("VBoxContainer/Btn")
	btn.visible = false

	# Add successor buttons dynamically
	var vbox: VBoxContainer = _overlay.get_node("VBoxContainer")
	for child: Node in vbox.get_children():
		if child.name.begins_with("SuccBtn"):
			child.queue_free()

	for s: Variant in successors:
		var sdict: Dictionary = s as Dictionary
		var succ_btn := Button.new()
		succ_btn.name = "SuccBtn_" + sdict.get("id", "")
		succ_btn.text = sdict.get("label", "?")
		succ_btn.add_theme_font_size_override("font_size", 14)
		succ_btn.custom_minimum_size.y = 44
		var sid: String = sdict.get("id", "")
		succ_btn.pressed.connect(func() -> void:
			btn.visible = true
			for child: Node in vbox.get_children():
				if child.name.begins_with("SuccBtn"):
					child.queue_free()
			_overlay.visible = false
			LineageManager.choose_successor(sid)
			_refresh())
		vbox.add_child(succ_btn)

	_overlay.visible = true


# ── Style helpers ─────────────────────────────────────────────────────────────

func _flat_style(color: Color) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = color
	return s
