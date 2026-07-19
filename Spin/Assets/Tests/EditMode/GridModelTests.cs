using NUnit.Framework;
using Spin.Model;

namespace Spin.Tests.EditMode
{
    public class GridModelTests
    {
        private static readonly string[] SimpleGrid =
        {
            "#######",
            "#S....#",
            "#.....#",
            "#.....#",
            "#.....#",
            "#....E#",
            "#######"
        };

        private static readonly string[] WallGrid =
        {
            "#######",
            "#S....#",
            "#%###%#",
            "#.....#",
            "#.###.#",
            "#....E#",
            "#######"
        };

        private static readonly string[] SpikeGrid =
        {
            "#######",
            "#S....#",
            "#.###.#",
            "#*....#",
            "#.###.#",
            "#....E#",
            "#######"
        };

        [Test]
        public void BreakWall_OnThinWall_BecomesFloorPermanently()
        {
            var grid = new GridModel(TestLevelBuilder.Build(WallGrid, "C6"));
            var wall = Coord.ParseLabel("B3");

            Assert.AreEqual(CellType.ThinWall, grid.GetCellType(wall));
            Assert.IsTrue(grid.CanBreakWallAt(wall));

            grid.BreakWall(wall);

            Assert.AreEqual(CellType.Floor, grid.GetCellType(wall));
            Assert.IsFalse(grid.CanBreakWallAt(wall), "Already-broken wall should no longer be breakable.");
        }

        [Test]
        public void PlaceSpike_OnValidFloor_BecomesPermanentPlacedSpike()
        {
            var grid = new GridModel(TestLevelBuilder.Build(SimpleGrid, "D4"));
            var target = Coord.ParseLabel("C2");

            Assert.IsTrue(grid.CanPlaceSpikeAt(target));

            grid.PlaceSpike(target);

            Assert.AreEqual(CellType.PlacedSpike, grid.GetCellType(target));
            Assert.IsFalse(grid.CanPlaceSpikeAt(target), "An already-spiked cell cannot receive another spike (R7: permanent).");
        }

        [Test]
        public void PlaceSpike_OnExitCell_IsRejected()
        {
            var grid = new GridModel(TestLevelBuilder.Build(SimpleGrid, "D4"));

            Assert.IsFalse(grid.CanPlaceSpikeAt(grid.ExitCoord));
        }

        [Test]
        public void PlaceSpike_OnCellWithEnemy_IsRejected()
        {
            var level = TestLevelBuilder.Build(SimpleGrid, "D4",
                new TestLevelBuilder.EnemySpec(1, "D2", Axis.Horizontal, Direction.Left));
            var grid = new GridModel(level);

            Assert.IsFalse(grid.CanPlaceSpikeAt(Coord.ParseLabel("D2")));
        }

        [Test]
        public void CollectWildSpike_OnWildSpikeCell_ConvertsToFloorAndReturnsTrue()
        {
            var grid = new GridModel(TestLevelBuilder.Build(SpikeGrid, "D4"));
            var wild = Coord.ParseLabel("B4");

            Assert.AreEqual(CellType.WildSpike, grid.GetCellType(wild));
            Assert.IsTrue(grid.CollectWildSpike(wild));
            Assert.AreEqual(CellType.Floor, grid.GetCellType(wild));
        }

        [Test]
        public void CollectWildSpike_OnNonWildSpikeCell_ReturnsFalseAndNoChange()
        {
            var grid = new GridModel(TestLevelBuilder.Build(SpikeGrid, "D4"));
            var floor = Coord.ParseLabel("C4");

            Assert.IsFalse(grid.CollectWildSpike(floor));
            Assert.AreEqual(CellType.Floor, grid.GetCellType(floor));
        }

        [Test]
        public void TryCollectGem_OnGemCell_ClearsGemAndIsIdempotent()
        {
            var grid = new GridModel(TestLevelBuilder.Build(SimpleGrid, "D4"));
            var gemCell = Coord.ParseLabel("D4");

            Assert.IsTrue(grid.HasUncollectedGem);
            Assert.IsTrue(grid.TryCollectGem(gemCell));
            Assert.IsFalse(grid.HasUncollectedGem);
            Assert.IsFalse(grid.TryCollectGem(gemCell), "Collecting an already-collected gem must be a no-op.");
        }

        [Test]
        public void CanSpinEnter_TrueForFloorExitAndBothSpikeTypes_FalseForFixedAndThinWall()
        {
            var grid = new GridModel(TestLevelBuilder.Build(SpikeGrid, "D4"));
            grid.PlaceSpike(Coord.ParseLabel("C4"));

            Assert.IsTrue(grid.CanSpinEnter(Coord.ParseLabel("D4")), "Floor");
            Assert.IsTrue(grid.CanSpinEnter(grid.ExitCoord), "Exit");
            Assert.IsTrue(grid.CanSpinEnter(Coord.ParseLabel("B4")), "Wild spike (R10)");
            Assert.IsTrue(grid.CanSpinEnter(Coord.ParseLabel("C4")), "Placed spike (R10)");
            Assert.IsFalse(grid.CanSpinEnter(Coord.ParseLabel("A1")), "Fixed block");
        }

        [Test]
        public void IsEnemyObstacle_TrueForFixedThinWallAndBothSpikeTypes_FalseForFloorAndExit()
        {
            var grid = new GridModel(TestLevelBuilder.Build(WallGrid, "C6"));

            Assert.IsTrue(grid.IsEnemyObstacle(Coord.ParseLabel("A1")), "Fixed block (R14)");
            Assert.IsTrue(grid.IsEnemyObstacle(Coord.ParseLabel("B3")), "Thin wall (R14)");
            Assert.IsFalse(grid.IsEnemyObstacle(Coord.ParseLabel("C4")), "Floor");
            Assert.IsFalse(grid.IsEnemyObstacle(grid.ExitCoord), "Exit (R16)");

            var spikeGrid = new GridModel(TestLevelBuilder.Build(SpikeGrid, "D4"));
            Assert.IsTrue(spikeGrid.IsEnemyObstacle(Coord.ParseLabel("B4")), "Wild spike (R9)");
            spikeGrid.PlaceSpike(Coord.ParseLabel("C4"));
            Assert.IsTrue(spikeGrid.IsEnemyObstacle(Coord.ParseLabel("C4")), "Placed spike (R8)");
        }

        [Test]
        public void HasEnemyAt_DetectsEnemyPosition()
        {
            var level = TestLevelBuilder.Build(SimpleGrid, "D4",
                new TestLevelBuilder.EnemySpec(1, "D2", Axis.Horizontal, Direction.Left));
            var grid = new GridModel(level);

            Assert.IsTrue(grid.HasEnemyAt(Coord.ParseLabel("D2")));
            Assert.IsFalse(grid.HasEnemyAt(Coord.ParseLabel("E2")));
        }
    }
}
