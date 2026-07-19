using UnityEngine;
using UnityEngine.UIElements;
using Spin.Model;
using Spin.View.Grid;

namespace Spin.View.Input
{
    public enum InputMode
    {
        Normal,
        PlacingSpike
    }

    /// <summary>
    /// The only class that reads raw pointer input on the Game screen (§9.1). Registers on the
    /// whole screen root so "swipe anywhere" works; resolves taps to a specific cell via the
    /// pointer event's own bubbled target rather than manual geometry/coordinate math.
    /// </summary>
    public sealed class GameInputController
    {
        private const float TapMaxDistance = 24f;

        private readonly GridView _gridView;
        private TurnManager _turns;

        private Vector2 _pointerDownPosition;
        private bool _pointerActive;

        public InputMode Mode { get; private set; } = InputMode.Normal;

        public GameInputController(VisualElement screenRoot, GridView gridView)
        {
            _gridView = gridView;

            screenRoot.RegisterCallback<PointerDownEvent>(OnPointerDown);
            screenRoot.RegisterCallback<PointerUpEvent>(OnPointerUp);
        }

        public void Bind(TurnManager turns)
        {
            _turns = turns;
            Mode = InputMode.Normal;
        }

        public void ToggleSpikePlacementMode()
        {
            if (_turns == null) return;

            if (Mode == InputMode.PlacingSpike)
            {
                Mode = InputMode.Normal;
                return;
            }

            if (_turns.CurrentState.SpikeInventory <= 0) return;
            Mode = InputMode.PlacingSpike;
        }

        public void RequestWait()
        {
            if (Mode == InputMode.PlacingSpike)
            {
                Mode = InputMode.Normal; // any other input cancels placement without consuming a turn.
                return;
            }

            _turns?.ExecuteTurn(PlayerAction.Wait());
        }

        private void OnPointerDown(PointerDownEvent evt)
        {
            _pointerDownPosition = evt.position;
            _pointerActive = true;
        }

        private void OnPointerUp(PointerUpEvent evt)
        {
            if (!_pointerActive) return;
            _pointerActive = false;
            if (_turns == null || _gridView.Grid == null) return;

            Vector2 delta = (Vector2)evt.position - _pointerDownPosition;

            if (delta.magnitude >= TapMaxDistance)
            {
                Mode = InputMode.Normal; // a swipe always cancels spike-placement mode.
                Direction direction = Mathf.Abs(delta.x) > Mathf.Abs(delta.y)
                    ? (delta.x > 0 ? Direction.Right : Direction.Left)
                    : (delta.y > 0 ? Direction.Down : Direction.Up);
                _turns.ExecuteTurn(PlayerAction.Move(direction));
                return;
            }

            var cell = FindCellVisual(evt.target as VisualElement);
            if (cell == null)
            {
                Mode = InputMode.Normal;
                return;
            }

            if (Mode == InputMode.PlacingSpike)
            {
                _turns.ExecuteTurn(PlayerAction.PlaceSpike(cell.Coord));
                Mode = InputMode.Normal;
                return;
            }

            var spinPosition = _gridView.Grid.SpinPosition;
            if (!IsOrthogonallyAdjacent(spinPosition, cell.Coord))
                return; // not adjacent — not a recognized attempt at all, silently ignored.

            if (_gridView.Grid.GetCellType(cell.Coord) == CellType.ThinWall)
                _turns.ExecuteTurn(PlayerAction.BreakWall(cell.Coord));
            else
                _turns.ExecuteTurn(PlayerAction.Move(DirectionFromTo(spinPosition, cell.Coord)));
        }

        private static Direction DirectionFromTo(Coord from, Coord to)
        {
            if (to.Col > from.Col) return Direction.Right;
            if (to.Col < from.Col) return Direction.Left;
            if (to.Row > from.Row) return Direction.Down;
            return Direction.Up;
        }

        private static CellVisual FindCellVisual(VisualElement element)
        {
            while (element != null)
            {
                if (element is CellVisual cell) return cell;
                element = element.parent;
            }

            return null;
        }

        private static bool IsOrthogonallyAdjacent(Coord a, Coord b)
        {
            int dc = Mathf.Abs(a.Col - b.Col);
            int dr = Mathf.Abs(a.Row - b.Row);
            return (dc == 1 && dr == 0) || (dc == 0 && dr == 1);
        }
    }
}
