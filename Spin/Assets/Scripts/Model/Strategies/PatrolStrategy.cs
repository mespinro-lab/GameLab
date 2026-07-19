using Spin.Model;

namespace Spin.Model.Strategies
{
    /// <summary>
    /// Fixed-axis bounce patrol (§6.1, R14-R15). Tries the current direction; if blocked,
    /// reverses and retries once within the same turn; if that is also blocked, stays put
    /// while keeping the reversed direction, so it retries both sides every following turn
    /// until an obstacle clears (e.g. a wild spike gets picked up).
    /// </summary>
    public sealed class PatrolStrategy : IMovementStrategy
    {
        public EnemyMoveResult ComputeMove(EnemyEntity self, GridModel grid)
        {
            var forward = self.Position.Offset(self.CurrentDirection);
            if (!IsBlocked(forward, grid))
                return EnemyMoveResult.Forward(forward, self.CurrentDirection);

            var reversedDirection = self.CurrentDirection.Opposite();
            var reversed = self.Position.Offset(reversedDirection);
            if (!IsBlocked(reversed, grid))
                return EnemyMoveResult.Reversed(reversed, reversedDirection);

            return EnemyMoveResult.Stuck(reversedDirection, self.Position);
        }

        private static bool IsBlocked(Coord destination, GridModel grid)
        {
            if (!grid.IsInBounds(destination)) return true;

            var type = grid.GetCellType(destination);
            if (type == CellType.Fixed || type == CellType.ThinWall ||
                type == CellType.PlacedSpike || type == CellType.WildSpike)
                return true;

            // Spín is never a bounce obstacle (R15) — entering Spín's cell is a capture, not a bounce.
            return grid.HasEnemyAt(destination);
        }
    }
}
