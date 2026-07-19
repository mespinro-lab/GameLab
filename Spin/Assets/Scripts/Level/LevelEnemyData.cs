using Spin.Model;

namespace Spin.Level
{
    /// <summary>Validated enemy definition, ready for GridModel to construct an EnemyEntity from.</summary>
    public sealed class LevelEnemyData
    {
        public int Order { get; }
        public EnemyType Type { get; }
        public Coord Start { get; }
        public Axis Axis { get; }
        public Direction InitialDirection { get; }

        public LevelEnemyData(int order, EnemyType type, Coord start, Axis axis, Direction initialDirection)
        {
            Order = order;
            Type = type;
            Start = start;
            Axis = axis;
            InitialDirection = initialDirection;
        }
    }
}
