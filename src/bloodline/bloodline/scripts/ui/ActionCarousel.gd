extends Control

## Circular horizontal action carousel.
## Shows actions as icon discs — swipe left/right, wraps infinitely.
## Emits action_selected(index) when the selected action changes.

signal action_selected(index: int)

const SLOT_W: float = 80.0     # width per slot
const SLOT_GAP: float = 12.0   # gap between slots
const STEP: float = SLOT_W + SLOT_GAP
const VISIBLE_SLOTS: int = 5   # how many slots to render (-2..+2)

var actions: Array = []
var current_index: int = 0

var _offset: float = 0.0       # current scroll offset (pixels)
var _drag_start: float = 0.0
var _drag_active: bool = false
var _tween: Tween


func setup(p_actions: Array) -> void:
	actions = p_actions
	current_index = 0
	_offset = 0.0
	queue_redraw()


func get_selected_action() -> Dictionary:
	if actions.is_empty():
		return {}
	return actions[current_index] as Dictionary


func _draw() -> void:
	if actions.is_empty():
		return
	var cx: float = size.x * 0.5
	var cy: float = size.y * 0.5

	for slot: int in range(-2, 3):
		var real_idx: int = _wrap(current_index + slot)
		var action: Dictionary = actions[real_idx] as Dictionary
		var sx: float = cx + slot * STEP + _offset

		var dist: float = absf(slot * STEP + _offset) / STEP
		var scale: float = lerpf(1.0, 0.55, clampf(dist, 0.0, 1.0))
		var alpha: float = lerpf(1.0, 0.30, clampf(dist, 0.0, 1.2))

		var r: float = (SLOT_W * 0.5) * scale
		var center := Vector2(sx, cy)

		# Shadow for depth
		if dist < 0.5:
			draw_circle(center + Vector2(0, 2), r + 1, Color(0, 0, 0, 0.3 * alpha))

		# Background circle
		var bg_col: Color = _action_color(action)
		bg_col.a = alpha
		draw_circle(center, r, bg_col.darkened(0.55))

		# Border ring
		var ring_col: Color = bg_col
		ring_col.a = alpha
		draw_arc(center, r, 0, TAU, 48, ring_col, 2.0)

		# Icon text (emoji)
		var icon: String = _action_icon(action)
		var font: Font = ThemeDB.fallback_font
		var font_size: int = int(28.0 * scale)
		var text_size: Vector2 = font.get_string_size(icon, HORIZONTAL_ALIGNMENT_CENTER, -1, font_size)
		draw_string(font, center - text_size * 0.5 + Vector2(0, text_size.y * 0.4),
			icon, HORIZONTAL_ALIGNMENT_CENTER, -1, font_size,
			Color(1, 1, 1, alpha))


func _gui_input(event: InputEvent) -> void:
	if actions.size() <= 1:
		return
	if event is InputEventScreenTouch:
		var touch := event as InputEventScreenTouch
		if touch.pressed:
			_drag_start = touch.position.x
			_drag_active = true
			if _tween and _tween.is_running():
				_tween.kill()
		else:
			if _drag_active:
				_drag_active = false
				_snap_to_nearest()
	elif event is InputEventScreenDrag:
		if _drag_active:
			var drag := event as InputEventScreenDrag
			_offset += drag.relative.x
			queue_redraw()
	# Desktop mouse support for testing
	elif event is InputEventMouseButton:
		var mb := event as InputEventMouseButton
		if mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT:
			_drag_start = mb.position.x
			_drag_active = true
			if _tween and _tween.is_running():
				_tween.kill()
		elif not mb.pressed and _drag_active:
			_drag_active = false
			_snap_to_nearest()
	elif event is InputEventMouseMotion:
		if _drag_active:
			var mm := event as InputEventMouseMotion
			_offset += mm.relative.x
			queue_redraw()


func _snap_to_nearest() -> void:
	# Find how many steps we've moved
	var steps: int = roundi(-_offset / STEP)
	current_index = _wrap(current_index + steps)
	var target_offset: float = 0.0

	_tween = create_tween()
	_tween.set_ease(Tween.EASE_OUT)
	_tween.set_trans(Tween.TRANS_CUBIC)
	_tween.tween_method(_set_offset, _offset, target_offset, 0.25)
	_tween.tween_callback(func() -> void:
		action_selected.emit(current_index)
		queue_redraw())


func _set_offset(val: float) -> void:
	_offset = val
	queue_redraw()


func _wrap(idx: int) -> int:
	if actions.is_empty():
		return 0
	return ((idx % actions.size()) + actions.size()) % actions.size()


# ── Icon + color per action ────────────────────────────────────────────────────

func _action_icon(action: Dictionary) -> String:
	var aid: String = action.get("id", "")
	# Family actions
	if "parella" in aid: return "💑"
	if "fills" in aid:   return "👶"
	if "ensenyar" in aid: return "📖"
	# By dominant inclination delta
	var deltas: Dictionary = action.get("inclination_deltas", {})
	var best_axis: String = _dominant_axis(deltas)
	match best_axis:
		"impuls":         return "🏹"
		"intel_lectus":   return "🪨"
		"espiritualitat": return "🔥"
		"sociabilitat":   return "👥"
	# Fallback by zone
	match action.get("zona", ""):
		"Campament": return "🏕"
		"Planes":    return "🌾"
		"Bosc":      return "🌲"
		"Ritual":    return "⭐"
	return "•"


func _action_color(action: Dictionary) -> Color:
	var aid: String = action.get("id", "")
	if "parella" in aid or "fills" in aid or "ensenyar" in aid:
		return Color(0.29, 0.87, 0.50)
	var deltas: Dictionary = action.get("inclination_deltas", {})
	match _dominant_axis(deltas):
		"impuls":         return Color(0.914, 0.271, 0.376)
		"intel_lectus":   return Color(0.376, 0.647, 0.980)
		"espiritualitat": return Color(0.671, 0.482, 0.980)
		"sociabilitat":   return Color(0.306, 0.871, 0.502)
	return Color(0.961, 0.651, 0.137)


func _dominant_axis(deltas: Dictionary) -> String:
	var best: String = ""
	var best_val: float = 0.01
	for ax: String in deltas:
		if absf(float(deltas[ax])) > best_val:
			best = ax
			best_val = absf(float(deltas[ax]))
	return best
