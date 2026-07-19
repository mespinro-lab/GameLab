using System.Collections.Generic;
using Spin.Level;
using Spin.Model;

namespace Spin.Tests.EditMode
{
    /// <summary>
    /// Builds LevelData directly (bypassing LevelParser) so each test can set up a minimal,
    /// deterministic board. Spawn/Exit are derived from the 'S'/'E' characters in the grid;
    /// enemies are supplied explicitly since they are metadata, not grid characters (§4).
    /// </summary>
    internal static class TestLevelBuilder
    {
        public struct EnemySpec
        {
            public int Order;
            public EnemyType Type;
            public string Start;
            public Axis Axis;
            public Direction InitialDirection;

            public EnemySpec(int order, string start, Axis axis, Direction initialDirection, EnemyType type = EnemyType.Badger)
            {
                Order = order;
                Type = type;
                Start = start;
                Axis = axis;
                InitialDirection = initialDirection;
            }
        }

        public static LevelData Build(string[] grid, string diamondLabel, params EnemySpec[] enemies)
        {
            Coord spawn = default;
            Coord exit = default;

            for (int row = 0; row < grid.Length; row++)
            {
                for (int col = 0; col < grid[row].Length; col++)
                {
                    char c = grid[row][col];
                    if (c == 'S') spawn = new Coord(col, row);
                    if (c == 'E') exit = new Coord(col, row);
                }
            }

            var enemyList = new List<LevelEnemyData>();
            foreach (var e in enemies)
                enemyList.Add(new LevelEnemyData(e.Order, e.Type, Coord.ParseLabel(e.Start), e.Axis, e.InitialDirection));

            return new LevelData(1, 1, "level.test.name", grid, spawn, exit, Coord.ParseLabel(diamondLabel), enemyList);
        }
    }
}
