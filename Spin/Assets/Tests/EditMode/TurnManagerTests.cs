using NUnit.Framework;
using Spin.Model;

namespace Spin.Tests.EditMode
{
    public class TurnManagerTests
    {
        // Spawn B2, gem C2, exit D2, fully open row — used by the simplest sequencing tests.
        private static readonly string[] Row2Grid =
        {
            "#######",
            "#S.E..#",
            "#.....#",
            "#.....#",
            "#.....#",
            "#.....#",
            "#######"
        };

        // Fully open interior (rows 2-6, cols B-F). Spawn B2, exit F6.
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

        // D4 open, flanked by fixed C4/E4 — used for the double-blocked bounce test.
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

        // D4 open, C4 fixed, E4 open — a single reversed bounce lands cleanly.
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

        // Spawn C2 directly adjacent to an enemy at D2.
        private static readonly string[] AdjacentEnemyGrid =
        {
            "#######",
            "#.S...#",
            "#.....#",
            "#.....#",
            "#.....#",
            "#....E#",
            "#######"
        };

        // Spawn B2, gem C2, exit D2 — like Row2Grid, but D3 is fixed so a vertical enemy
        // parked on the exit cell (D2) is permanently boxed in (D1 is the border, D3 is fixed).
        private static readonly string[] BoxedExitEnemyGrid =
        {
            "#######",
            "#S.E..#",
            "#..#..#",
            "#.....#",
            "#.....#",
            "#.....#",
            "#######"
        };

        // Spawn E6, exit F6 adjacent — for the exit-without-gem flag.
        private static readonly string[] ExitAdjacentGrid =
        {
            "#######",
            "#.....#",
            "#.....#",
            "#.....#",
            "#.....#",
            "#...SE#",
            "#######"
        };

        [Test]
        public void Turn_MoveOntoGemCell_AutoPicksUpGem()
        {
            var grid = new GridModel(TestLevelBuilder.Build(Row2Grid, "C2"));
            var turns = new TurnManager(grid);

            var result = turns.ExecuteTurn(PlayerAction.Move(Direction.Right));

            Assert.IsNotNull(result);
            Assert.IsTrue(result.GemCollectedThisTurn);
            Assert.IsTrue(turns.CurrentState.HasGem);
            Assert.AreEqual(GameStatus.Playing, turns.CurrentState.Status);
        }

        [Test]
        public void Turn_WaitAction_StillAdvancesEnemyPhase()
        {
            var level = TestLevelBuilder.Build(Row2Grid, "C2",
                new TestLevelBuilder.EnemySpec(1, "F2", Axis.Horizontal, Direction.Left));
            var grid = new GridModel(level);
            var turns = new TurnManager(grid);

            var result = turns.ExecuteTurn(PlayerAction.Wait());

            Assert.AreEqual(1, turns.CurrentState.TurnCount);
            Assert.AreEqual(Coord.ParseLabel("E2"), grid.Enemies[0].Position);
            Assert.AreEqual(GameStatus.Playing, result.Status);
        }

        [Test]
        public void Turn_EnemyBounceOffFixedBlock_ReversesDirection()
        {
            var level = TestLevelBuilder.Build(SingleBounceGrid, "F2",
                new TestLevelBuilder.EnemySpec(1, "D4", Axis.Horizontal, Direction.Left));
            var grid = new GridModel(level);
            var turns = new TurnManager(grid);

            var result = turns.ExecuteTurn(PlayerAction.Wait());

            var enemy = grid.Enemies[0];
            Assert.AreEqual(Coord.ParseLabel("E4"), enemy.Position);
            Assert.AreEqual(Direction.Right, enemy.CurrentDirection);
            Assert.IsTrue(result.EnemyOutcomes[0].Bounced);
            Assert.IsTrue(result.EnemyOutcomes[0].Moved);
        }

        [Test]
        public void Turn_DoubleBlockedEnemy_StaysPutAndRetriesEachSubsequentTurn()
        {
            var level = TestLevelBuilder.Build(AlcoveGrid, "B6",
                new TestLevelBuilder.EnemySpec(1, "D4", Axis.Horizontal, Direction.Left));
            var grid = new GridModel(level);
            var turns = new TurnManager(grid);

            var result1 = turns.ExecuteTurn(PlayerAction.Wait());
            var enemy = grid.Enemies[0];

            Assert.AreEqual(Coord.ParseLabel("D4"), enemy.Position, "A fully-boxed enemy never moves.");
            Assert.AreEqual(Direction.Right, enemy.CurrentDirection);
            Assert.IsTrue(result1.EnemyOutcomes[0].Bounced);
            Assert.IsFalse(result1.EnemyOutcomes[0].Moved);

            var result2 = turns.ExecuteTurn(PlayerAction.Wait());

            Assert.AreEqual(Coord.ParseLabel("D4"), enemy.Position, "Still boxed on the next turn.");
            Assert.AreEqual(Direction.Left, enemy.CurrentDirection, "Direction keeps flipping as it retries both sides every turn.");
            Assert.IsFalse(result2.EnemyOutcomes[0].Moved);
        }

        [Test]
        public void Turn_EnemyEntersSpinCell_CapturesImmediately()
        {
            var level = TestLevelBuilder.Build(AdjacentEnemyGrid, "B6",
                new TestLevelBuilder.EnemySpec(1, "D2", Axis.Horizontal, Direction.Left));
            var grid = new GridModel(level);
            var turns = new TurnManager(grid);

            var result = turns.ExecuteTurn(PlayerAction.Wait());

            Assert.AreEqual(GameStatus.Defeat, result.Status);
            Assert.AreEqual(DefeatCause.EnemyEnteredSpinCell, result.DefeatCause);
            Assert.AreEqual(1, result.EnemyOutcomes.Count);
            Assert.IsTrue(result.EnemyOutcomes[0].CapturedSpin);
        }

        [Test]
        public void Turn_DefeatMidEnemyPhase_StopsRemainingEnemiesFromMoving()
        {
            var level = TestLevelBuilder.Build(AdjacentEnemyGrid, "B6",
                new TestLevelBuilder.EnemySpec(1, "D2", Axis.Horizontal, Direction.Left),
                new TestLevelBuilder.EnemySpec(2, "F4", Axis.Horizontal, Direction.Left));
            var grid = new GridModel(level);
            var turns = new TurnManager(grid);

            var result = turns.ExecuteTurn(PlayerAction.Wait());

            Assert.AreEqual(GameStatus.Defeat, result.Status);
            Assert.AreEqual(1, result.EnemyOutcomes.Count, "Enemy 2 must never be evaluated once enemy 1 captures Spín (R17).");
            Assert.AreEqual(Coord.ParseLabel("F4"), grid.Enemies[1].Position, "Enemy 2 must not have moved.");
        }

        [Test]
        public void Turn_SpinMovesIntoEnemyCell_CapturesImmediately()
        {
            var level = TestLevelBuilder.Build(OpenGrid, "D4",
                new TestLevelBuilder.EnemySpec(1, "C2", Axis.Horizontal, Direction.Right));
            var grid = new GridModel(level);
            var turns = new TurnManager(grid);

            var result = turns.ExecuteTurn(PlayerAction.Move(Direction.Right));

            Assert.AreEqual(GameStatus.Defeat, result.Status);
            Assert.AreEqual(DefeatCause.SpinEnteredEnemyCell, result.DefeatCause);
            Assert.AreEqual(0, result.EnemyOutcomes.Count, "Enemy phase must never run once R11b fires (CHECK stops the turn at step 3).");
        }

        [Test]
        public void Turn_MultipleEnemies_LaterEnemySeesEarlierEnemysUpdatedPosition()
        {
            var level = TestLevelBuilder.Build(OpenGrid, "C6",
                new TestLevelBuilder.EnemySpec(1, "D4", Axis.Horizontal, Direction.Left),
                new TestLevelBuilder.EnemySpec(2, "B4", Axis.Horizontal, Direction.Right));
            var grid = new GridModel(level);
            var turns = new TurnManager(grid);

            turns.ExecuteTurn(PlayerAction.Wait());

            Assert.AreEqual(Coord.ParseLabel("C4"), grid.Enemies[0].Position, "Enemy 1 moves into the now-empty C4.");
            Assert.AreEqual(Coord.ParseLabel("B4"), grid.Enemies[1].Position,
                "Enemy 2 must see enemy 1's already-updated position at C4 and bounce off it instead of moving there (R17).");
        }

        [Test]
        public void Turn_EnemyMovesThroughExitAndGemCells_NoEffect()
        {
            var level = TestLevelBuilder.Build(OpenGrid, "F4",
                new TestLevelBuilder.EnemySpec(1, "E6", Axis.Horizontal, Direction.Right),
                new TestLevelBuilder.EnemySpec(2, "E4", Axis.Horizontal, Direction.Right));
            var grid = new GridModel(level);
            var turns = new TurnManager(grid);

            var result = turns.ExecuteTurn(PlayerAction.Wait());

            Assert.AreEqual(GameStatus.Playing, result.Status);
            Assert.AreEqual(Coord.ParseLabel("F6"), grid.Enemies[0].Position, "Enemy walks onto the exit with no special effect.");
            Assert.AreEqual(Coord.ParseLabel("F4"), grid.Enemies[1].Position, "Enemy walks onto the gem cell with no special effect.");
            Assert.IsTrue(grid.HasUncollectedGem, "Enemies do not interact with the gem (§4).");
        }

        [Test]
        public void Turn_DefeatCheckedBeforeVictoryCheck_WhenBothConditionsCoincide()
        {
            var level = TestLevelBuilder.Build(BoxedExitEnemyGrid, "C2",
                new TestLevelBuilder.EnemySpec(1, "D2", Axis.Vertical, Direction.Up));
            var grid = new GridModel(level);
            var turns = new TurnManager(grid);

            // Turn 1: collect the gem. The enemy at D2 (the exit cell) is boxed vertically
            // (D1 is the border, D3 is fixed per BoxedExitEnemyGrid) so it never actually leaves.
            var afterGem = turns.ExecuteTurn(PlayerAction.Move(Direction.Right));
            Assert.AreEqual(GameStatus.Playing, afterGem.Status);
            Assert.IsTrue(turns.CurrentState.HasGem);
            Assert.AreEqual(Coord.ParseLabel("D2"), grid.Enemies[0].Position, "Enemy stays boxed on the exit cell.");

            // Turn 2: moving onto D2 satisfies both "Spín entered an enemy's cell" (R11b)
            // and "gem held + at exit" (R12) simultaneously — defeat must win.
            var result = turns.ExecuteTurn(PlayerAction.Move(Direction.Right));

            Assert.AreEqual(GameStatus.Defeat, result.Status);
            Assert.AreEqual(DefeatCause.SpinEnteredEnemyCell, result.DefeatCause);
        }

        [Test]
        public void Turn_VictoryOnlyWhenGemHeldAndAtExit()
        {
            var grid = new GridModel(TestLevelBuilder.Build(Row2Grid, "C2"));
            var turns = new TurnManager(grid);

            var afterGem = turns.ExecuteTurn(PlayerAction.Move(Direction.Right));
            Assert.AreEqual(GameStatus.Playing, afterGem.Status, "Collecting the gem alone must not trigger victory.");

            var afterExit = turns.ExecuteTurn(PlayerAction.Move(Direction.Right));
            Assert.AreEqual(GameStatus.Victory, afterExit.Status);
        }

        [Test]
        public void Turn_ExitWithoutGem_DoesNotTriggerVictory_AndSetsExitAttemptedFlag()
        {
            var grid = new GridModel(TestLevelBuilder.Build(ExitAdjacentGrid, "B2"));
            var turns = new TurnManager(grid);

            var result = turns.ExecuteTurn(PlayerAction.Move(Direction.Right));

            Assert.AreEqual(GameStatus.Playing, result.Status);
            Assert.IsTrue(result.ExitAttemptedWithoutGem);
        }
    }
}
