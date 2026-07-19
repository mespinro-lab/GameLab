using System.Collections.Generic;

namespace Spin.Level
{
    /// <summary>In-memory store of parsed levels, keyed by id. Populated by GameSession at startup.</summary>
    public sealed class LevelCatalog
    {
        private readonly Dictionary<int, LevelData> _levels = new Dictionary<int, LevelData>();

        public void Add(LevelData level) => _levels[level.Id] = level;

        public bool TryGet(int id, out LevelData level) => _levels.TryGetValue(id, out level);

        public IReadOnlyCollection<int> LevelIds => _levels.Keys;

        public int Count => _levels.Count;
    }
}
