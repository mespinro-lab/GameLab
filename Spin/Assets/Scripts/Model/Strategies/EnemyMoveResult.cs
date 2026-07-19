using Spin.Model;

namespace Spin.Model.Strategies
{
    /// <summary>
    /// Outcome of a single enemy's movement decision for this turn (R14).
    /// Bounced is true whenever the enemy's forward attempt was blocked, whether or not
    /// the subsequent reversed attempt succeeded — the View uses it to decide whether to
    /// play the "bounce" animation.
    /// </summary>
    public readonly struct EnemyMoveResult
    {
        public bool Moved { get; }
        public Coord Destination { get; }
        public Direction NewDirection { get; }
        public bool Bounced { get; }

        private EnemyMoveResult(bool moved, Coord destination, Direction newDirection, bool bounced)
        {
            Moved = moved;
            Destination = destination;
            NewDirection = newDirection;
            Bounced = bounced;
        }

        public static EnemyMoveResult Forward(Coord destination, Direction direction) =>
            new EnemyMoveResult(true, destination, direction, false);

        public static EnemyMoveResult Reversed(Coord destination, Direction newDirection) =>
            new EnemyMoveResult(true, destination, newDirection, true);

        public static EnemyMoveResult Stuck(Direction keepDirection, Coord currentPosition) =>
            new EnemyMoveResult(false, currentPosition, keepDirection, true);
    }
}
