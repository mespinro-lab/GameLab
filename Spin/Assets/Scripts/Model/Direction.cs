using System;

namespace Spin.Model
{
    public enum Direction
    {
        Up,
        Down,
        Left,
        Right
    }

    public static class DirectionExtensions
    {
        public static Direction Opposite(this Direction direction)
        {
            switch (direction)
            {
                case Direction.Up: return Direction.Down;
                case Direction.Down: return Direction.Up;
                case Direction.Left: return Direction.Right;
                case Direction.Right: return Direction.Left;
                default: throw new ArgumentOutOfRangeException(nameof(direction), direction, null);
            }
        }

        public static Axis ToAxis(this Direction direction)
        {
            return direction == Direction.Up || direction == Direction.Down
                ? Axis.Vertical
                : Axis.Horizontal;
        }
    }
}
