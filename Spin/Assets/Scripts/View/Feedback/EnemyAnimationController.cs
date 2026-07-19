using Spin.Model;
using Spin.View.Grid;

namespace Spin.View.Feedback
{
    /// <summary>
    /// Cosmetic-only sequential bounce flashes for enemy moves (§9.4), staggered by processing
    /// order (R17) so the turn's resolution order is readable. GridView.RenderAll already drew
    /// the authoritative final positions before this runs — this never delays or blocks input.
    /// </summary>
    public sealed class EnemyAnimationController
    {
        private const int StaggerMillis = 180;
        private const int FlashMillis = 220;

        private readonly GridView _gridView;

        public EnemyAnimationController(GridView gridView)
        {
            _gridView = gridView;
        }

        public void OnTurnResolved(TurnResult result)
        {
            int index = 0;
            foreach (var outcome in result.EnemyOutcomes)
            {
                if (!outcome.Bounced) { index++; continue; }

                var cell = _gridView.GetCell(outcome.To);
                int delay = index * StaggerMillis;

                cell.schedule.Execute(() =>
                {
                    cell.AddToClassList("cell-bounce");
                    cell.schedule.Execute(() => cell.RemoveFromClassList("cell-bounce")).ExecuteLater(FlashMillis);
                }).ExecuteLater(delay);

                index++;
            }
        }
    }
}
