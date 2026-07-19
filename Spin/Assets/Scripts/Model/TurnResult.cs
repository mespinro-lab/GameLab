using System.Collections.Generic;

namespace Spin.Model
{
    /// <summary>Full outcome of one ExecuteTurn call — broadcast via TurnManager.TurnResolved.</summary>
    public sealed class TurnResult
    {
        public GameStatus Status { get; }
        public DefeatCause? DefeatCause { get; }
        public int TurnCount { get; }
        public bool GemCollectedThisTurn { get; }
        public bool WildSpikeCollectedThisTurn { get; }
        public bool WallBrokenThisTurn { get; }
        public bool SpikePlacedThisTurn { get; }

        /// <summary>R11b/R12 precondition: Spín moved onto the exit cell this turn without the gem (§9.4 feedback).</summary>
        public bool ExitAttemptedWithoutGem { get; }

        public IReadOnlyList<EnemyMoveOutcome> EnemyOutcomes { get; }

        public TurnResult(
            GameStatus status,
            DefeatCause? defeatCause,
            int turnCount,
            bool gemCollectedThisTurn,
            bool wildSpikeCollectedThisTurn,
            bool wallBrokenThisTurn,
            bool spikePlacedThisTurn,
            bool exitAttemptedWithoutGem,
            IReadOnlyList<EnemyMoveOutcome> enemyOutcomes)
        {
            Status = status;
            DefeatCause = defeatCause;
            TurnCount = turnCount;
            GemCollectedThisTurn = gemCollectedThisTurn;
            WildSpikeCollectedThisTurn = wildSpikeCollectedThisTurn;
            WallBrokenThisTurn = wallBrokenThisTurn;
            SpikePlacedThisTurn = spikePlacedThisTurn;
            ExitAttemptedWithoutGem = exitAttemptedWithoutGem;
            EnemyOutcomes = enemyOutcomes;
        }
    }
}
