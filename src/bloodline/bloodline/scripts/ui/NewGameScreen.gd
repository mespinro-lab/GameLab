extends Control

## New game screen — dynasty name input + era selection (Era 1 only for now).

signal game_started(dynasty_name: String)

var _name_input: LineEdit
var _start_btn: Button
var _error_label: Label

const PLACEHOLDER_NAMES: Array[String] = [
	"Braven", "Oscura", "Llum", "Ferro", "Drac",
	"Pedra", "Flama", "Vent", "Nit", "Sol"
]


const BloodlineThemeScript = preload("res://scripts/ui/BloodlineTheme.gd")

func _ready() -> void:
	theme = BloodlineThemeScript.build()
	_build_layout()


func _build_layout() -> void:
	anchor_right = 1.0
	anchor_bottom = 1.0
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)

	var bg := ColorRect.new()
	bg.color = Color(0.07, 0.05, 0.03)
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(bg)

	var center := CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(center)

	var box := VBoxContainer.new()
	box.custom_minimum_size = Vector2(320, 0)
	box.add_theme_constant_override("separation", 20)
	center.add_child(box)

	# Title
	var hero := Label.new()
	hero.text = "✦"
	hero.add_theme_font_size_override("font_size", 48)
	hero.add_theme_color_override("font_color", Color(0.95, 0.88, 0.50))
	hero.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(hero)

	var title := Label.new()
	title.text = "Bloodline"
	title.add_theme_font_size_override("font_size", 28)
	title.add_theme_color_override("font_color", Color(0.95, 0.88, 0.70))
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(title)

	var tagline := Label.new()
	tagline.text = "Construeix el teu llinatge a través de les eres"
	tagline.add_theme_font_size_override("font_size", 12)
	tagline.add_theme_color_override("font_color", Color(0.50, 0.45, 0.38))
	tagline.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	tagline.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	box.add_child(tagline)

	# Separator
	var sep := HSeparator.new()
	box.add_child(sep)

	# Name field
	var lbl := Label.new()
	lbl.text = "Nom del llinatge"
	lbl.add_theme_font_size_override("font_size", 12)
	lbl.add_theme_color_override("font_color", Color(0.65, 0.58, 0.48))
	box.add_child(lbl)

	_name_input = LineEdit.new()
	_name_input.placeholder_text = PLACEHOLDER_NAMES[randi() % PLACEHOLDER_NAMES.size()]
	_name_input.max_length = 24
	_name_input.custom_minimum_size.y = 48
	_name_input.add_theme_font_size_override("font_size", 16)
	_name_input.text_submitted.connect(_on_start)
	box.add_child(_name_input)

	var sublbl := Label.new()
	sublbl.text = "Si el deixes en blanc, s'assigna un nom aleatori."
	sublbl.add_theme_font_size_override("font_size", 10)
	sublbl.add_theme_color_override("font_color", Color(0.40, 0.36, 0.30))
	sublbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	box.add_child(sublbl)

	_error_label = Label.new()
	_error_label.add_theme_color_override("font_color", Color(0.90, 0.30, 0.30))
	_error_label.add_theme_font_size_override("font_size", 11)
	_error_label.visible = false
	box.add_child(_error_label)

	_start_btn = Button.new()
	_start_btn.text = "Comença l'aventura →"
	_start_btn.custom_minimum_size.y = 52
	_start_btn.add_theme_font_size_override("font_size", 15)
	_start_btn.add_theme_color_override("font_color", Color(0.95, 0.88, 0.50))
	_start_btn.pressed.connect(func() -> void: _on_start(""))
	box.add_child(_start_btn)

	# Era info
	var era_label := Label.new()
	era_label.text = "Era 1 · Paleolític · 50.000–10.000 AEC"
	era_label.add_theme_font_size_override("font_size", 10)
	era_label.add_theme_color_override("font_color", Color(0.35, 0.31, 0.26))
	era_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(era_label)

	# Focus input
	_name_input.grab_focus()


func _on_start(_submitted_text: String) -> void:
	var name_val: String = _name_input.text.strip_edges()
	if name_val.is_empty():
		name_val = _name_input.placeholder_text
	if name_val.length() < 2:
		_error_label.text = "El nom ha de tenir almenys 2 caràcters."
		_error_label.visible = true
		return
	_error_label.visible = false
	game_started.emit(name_val)
