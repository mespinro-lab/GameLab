namespace Spin.Model
{
    /// <summary>Read-only snapshot for the View. Mutated only by TurnManager (same assembly).</summary>
    public sealed class GameState
    {
        public GameStatus Status { get; internal set; } = GameStatus.Playing;
        public int TurnCount { get; internal set; }
        public int SpikeInventory { get; internal set; }
        public bool HasGem { get; internal set; }
        public DefeatCause? DefeatCause { get; internal set; }
    }
}
