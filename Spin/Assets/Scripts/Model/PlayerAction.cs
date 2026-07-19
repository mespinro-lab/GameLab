namespace Spin.Model
{
    public enum ActionKind
    {
        Move,
        BreakWall,
        PlaceSpike,
        Wait
    }

    /// <summary>One of R1-R4. Exactly one is chosen per turn.</summary>
    public readonly struct PlayerAction
    {
        public ActionKind Kind { get; }
        public Direction Direction { get; }
        public Coord Target { get; }

        private PlayerAction(ActionKind kind, Direction direction, Coord target)
        {
            Kind = kind;
            Direction = direction;
            Target = target;
        }

        public static PlayerAction Move(Direction direction) => new PlayerAction(ActionKind.Move, direction, default);
        public static PlayerAction BreakWall(Coord target) => new PlayerAction(ActionKind.BreakWall, default, target);
        public static PlayerAction PlaceSpike(Coord target) => new PlayerAction(ActionKind.PlaceSpike, default, target);
        public static PlayerAction Wait() => new PlayerAction(ActionKind.Wait, default, default);

        public override string ToString()
        {
            switch (Kind)
            {
                case ActionKind.Move: return $"Move({Direction})";
                case ActionKind.BreakWall: return $"BreakWall({Target})";
                case ActionKind.PlaceSpike: return $"PlaceSpike({Target})";
                default: return "Wait()";
            }
        }
    }
}
