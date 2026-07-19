namespace Spin.Model
{
    /// <summary>One enemy's resolved move within a turn (R14-R17), for animation/View use.</summary>
    public sealed class EnemyMoveOutcome
    {
        public EnemyEntity Enemy { get; }
        public Coord From { get; }
        public Coord To { get; }
        public bool Moved { get; }
        public bool Bounced { get; }
        public bool CapturedSpin { get; }

        public EnemyMoveOutcome(EnemyEntity enemy, Coord from, Coord to, bool moved, bool bounced, bool capturedSpin)
        {
            Enemy = enemy;
            From = from;
            To = to;
            Moved = moved;
            Bounced = bounced;
            CapturedSpin = capturedSpin;
        }
    }
}
