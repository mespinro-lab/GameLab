using Spin.Model;

namespace Spin.Model.Strategies
{
    /// <summary>
    /// Enemy movement decision, swappable per enemy type (§6, §12). PatrolStrategy is the
    /// only implementation in this prototype; ChaseStrategy (fox) and TunnelStrategy (snake)
    /// are Group 2/3, out of scope — this seam exists so adding them never touches TurnManager.
    /// </summary>
    public interface IMovementStrategy
    {
        EnemyMoveResult ComputeMove(EnemyEntity self, GridModel grid);
    }
}
