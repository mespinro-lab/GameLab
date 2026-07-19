using Spin.Model.Strategies;

namespace Spin.Model
{
    public sealed class EnemyEntity
    {
        public int Order { get; }
        public EnemyType Type { get; }
        public Axis Axis { get; }
        public Coord Position { get; internal set; }
        public Direction CurrentDirection { get; internal set; }
        public IMovementStrategy Strategy { get; }

        public EnemyEntity(int order, EnemyType type, Coord start, Axis axis, Direction initialDirection, IMovementStrategy strategy)
        {
            Order = order;
            Type = type;
            Axis = axis;
            Position = start;
            CurrentDirection = initialDirection;
            Strategy = strategy;
        }
    }
}
