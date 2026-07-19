using System.Collections.Generic;
using Spin.Model;

namespace Spin.Level
{
    /// <summary>Validated, immutable level definition — the only shape GridModel accepts.</summary>
    public sealed class LevelData
    {
        public int Id { get; }
        public int Group { get; }
        public string NameKey { get; }
        public IReadOnlyList<string> Grid { get; }
        public Coord Spawn { get; }
        public Coord Exit { get; }
        public Coord Diamond { get; }
        public IReadOnlyList<LevelEnemyData> Enemies { get; }

        public LevelData(
            int id,
            int group,
            string nameKey,
            IReadOnlyList<string> grid,
            Coord spawn,
            Coord exit,
            Coord diamond,
            IReadOnlyList<LevelEnemyData> enemies)
        {
            Id = id;
            Group = group;
            NameKey = nameKey;
            Grid = grid;
            Spawn = spawn;
            Exit = exit;
            Diamond = diamond;
            Enemies = enemies;
        }
    }
}
