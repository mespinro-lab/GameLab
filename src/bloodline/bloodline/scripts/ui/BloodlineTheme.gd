extends Node

## Generates and returns the LT1-style Theme for Bloodline.
## Call BloodlineTheme.build() and assign to the root Control.theme.

const C_BG       := Color(0.059, 0.067, 0.090)
const C_SURFACE  := Color(0.102, 0.114, 0.153)
const C_SURFACE2 := Color(0.145, 0.157, 0.212)
const C_BORDER   := Color(0.180, 0.196, 0.275)
const C_ACCENT   := Color(0.914, 0.271, 0.376)
const C_GOLD     := Color(0.961, 0.651, 0.137)
const C_TEXT     := Color(0.910, 0.910, 0.941)
const C_DIM      := Color(0.420, 0.431, 0.522)
const C_GREEN    := Color(0.306, 0.871, 0.502)
const C_BLUE     := Color(0.376, 0.647, 0.980)


static func build() -> Theme:
	var t := Theme.new()

	# ── Default font size ─────────────────────────────────────────────────
	t.default_font_size = 12

	# ── Label ─────────────────────────────────────────────────────────────
	t.set_color("font_color",          "Label", C_TEXT)
	t.set_color("font_shadow_color",   "Label", Color(0, 0, 0, 0))
	t.set_font_size("font_size",       "Label", 12)

	# ── Button ────────────────────────────────────────────────────────────
	t.set_color("font_color",          "Button", C_TEXT)
	t.set_color("font_hover_color",    "Button", C_TEXT)
	t.set_color("font_pressed_color",  "Button", C_TEXT)
	t.set_color("font_disabled_color", "Button", C_DIM)
	t.set_color("font_focus_color",    "Button", C_TEXT)
	t.set_font_size("font_size",       "Button", 12)

	t.set_stylebox("normal",   "Button", _btn(C_SURFACE2, C_BORDER))
	t.set_stylebox("hover",    "Button", _btn(C_SURFACE2, C_DIM))
	t.set_stylebox("pressed",  "Button", _btn(C_SURFACE,  C_DIM))
	t.set_stylebox("focus",    "Button", _btn(C_SURFACE2, C_BORDER))
	t.set_stylebox("disabled", "Button", _btn(C_BG,       C_BORDER))

	# ── PanelContainer ────────────────────────────────────────────────────
	t.set_stylebox("panel", "PanelContainer", _panel(C_SURFACE))

	# ── Panel ─────────────────────────────────────────────────────────────
	t.set_stylebox("panel", "Panel", _flat(C_SURFACE2))

	# ── ScrollContainer ───────────────────────────────────────────────────
	t.set_stylebox("panel", "ScrollContainer", _flat(C_BG))

	# ── LineEdit ──────────────────────────────────────────────────────────
	t.set_color("font_color",           "LineEdit", C_TEXT)
	t.set_color("font_placeholder_color","LineEdit", C_DIM)
	t.set_color("caret_color",          "LineEdit", C_GOLD)
	t.set_stylebox("normal", "LineEdit", _panel(C_SURFACE2, C_BORDER))
	t.set_stylebox("focus",  "LineEdit", _panel(C_SURFACE2, C_GOLD))
	t.set_font_size("font_size", "LineEdit", 14)

	# ── HSeparator ────────────────────────────────────────────────────────
	t.set_color("color",     "HSeparator", C_BORDER)
	t.set_constant("separation", "HSeparator", 1)

	# ── VSeparator ────────────────────────────────────────────────────────
	t.set_color("color",     "VSeparator", C_BORDER)
	t.set_constant("separation", "VSeparator", 1)

	# ── VBoxContainer / HBoxContainer ─────────────────────────────────────
	t.set_constant("separation", "VBoxContainer", 4)
	t.set_constant("separation", "HBoxContainer", 8)

	return t


static func _btn(bg: Color, border: Color) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = bg
	s.border_width_left   = 1; s.border_width_right  = 1
	s.border_width_top    = 1; s.border_width_bottom = 1
	s.border_color = border
	s.corner_radius_top_left     = 6; s.corner_radius_top_right    = 6
	s.corner_radius_bottom_left  = 6; s.corner_radius_bottom_right = 6
	s.content_margin_left  = 10; s.content_margin_right  = 10
	s.content_margin_top   =  6; s.content_margin_bottom =  6
	return s


static func _panel(bg: Color, border: Color = Color(0,0,0,0)) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = bg
	if border.a > 0:
		s.border_width_left   = 1; s.border_width_right  = 1
		s.border_width_top    = 1; s.border_width_bottom = 1
		s.border_color = border
	s.corner_radius_top_left     = 6; s.corner_radius_top_right    = 6
	s.corner_radius_bottom_left  = 6; s.corner_radius_bottom_right = 6
	return s


static func _flat(bg: Color) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = bg
	return s
