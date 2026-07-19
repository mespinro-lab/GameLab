using NUnit.Framework;
using Spin.Model;
using Spin.Model.Strategies;

namespace Spin.Tests.EditMode
{
    /// <summary>Direct unit tests of the bounce logic (R14-R15), independent of TurnManager.</summary>
    public class PatrolStrategyTests
    {
        private static readonly string[] OpenGrid =
        {
            "#######",
            "#S....#",
            "#.....#",
            "#.....#",
            "#.....#",
            "#....E#",
            "#######"
        };

        private static readonly string[] SingleBounceGrid =
        {
            "#######",
            "#S....#",
            "#.....#",
            "#.#...#",
            "#.....#",
            "#....E#",
            "#######"
        };

        private static readonly string[] AlcoveGrid =
        {
            "#######",
            "#S....#",
            "#.....#",
            "#.#.#.#",
            "#.....#",
            "#....E#",
            "#######"
        };

        private static readonly PatrolStrategy Strategy = new PatrolStrategy();

        [Test]
        public void ComputeMove_ForwardOpen_MovesForwardKeepingDirection()
        {
            var level = TestLevelBuilder.Build(OpenGrid, "D4",
                new TestLevelBuilder.EnemySpec(1, "D4", Axis.Horizontal, Direction.Left));
            var grid = new GridModel(level);

            var result = Strategy.ComputeMove(grid.Enemies[0], grid);

            Assert.IsTrue(result.Moved);
            Assert.IsFalse(result.Bounced);
            Assert.AreEqual(Coord.ParseLabel("C4"), result.Destination);
            Assert.AreEqual(Direction.Left, result.NewDirection);
        }

        [Test]
        public void ComputeMove_ForwardBlocked_ReversesAndMoves()
        {
            var level = TestLevelBuilder.Build(SingleBounceGrid, "F2",
                new TestLevelBuilder.EnemySpec(1, "D4", Axis.Horizontal, Direction.Left));
            var grid = new GridModel(level);

            var result = Strategy.ComputeMove(grid.Enemies[0], grid);

            Assert.IsTrue(result.Moved);
            Assert.IsTrue(result.Bounced);
            Assert.AreEqual(Coord.ParseLabel("E4"), result.Destination);
            Assert.AreEqual(Direction.Right, result.NewDirection);
        }

        [Test]
        public void ComputeMove_BothDirectionsBlocked_StaysPutKeepingReversedDirection()
        {
            var level = TestLevelBuilder.Build(AlcoveGrid, "B6",
                new TestLevelBuilder.EnemySpec(1, "D4", Axis.Horizontal, Direction.Left));
            var grid = new GridModel(level);

            var result = Strategy.ComputeMove(grid.Enemies[0], grid);

            Assert.IsFalse(result.Moved);
            Assert.IsTrue(result.Bounced);
            Assert.AreEqual(Coord.ParseLabel("D4"), result.Destination);
            Assert.AreEqual(Direction.Right, result.NewDirection);
        }

        [Test]
        public void ComputeMove_TowardSpinCell_IsNotTreatedAsBlocked()
        {
            var level = TestLevelBuilder.Build(OpenGrid, "F2",
                new TestLevelBuilder.EnemySpec(1, "C2", Axis.Horizontal, Direction.Left));
            var grid = new GridModel(level);

            var result = Strategy.ComputeMove(grid.Enemies[0], grid);

            Assert.IsTrue(result.Moved);
            Assert.IsFalse(result.Bounced, "Spín is never a bounce obstacle (R15) — this is a clean forward move, not a reversal.");
            Assert.AreEqual(grid.SpinPosition, result.Destination);
        }
    }
}
