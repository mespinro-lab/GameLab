using System;
using System.Collections.Generic;

namespace Spin.Level
{
    /// <summary>Raw level shape from JSON (§10), deserialized via JsonUtility before validation.</summary>
    [Serializable]
    public sealed class LevelDataDto
    {
        public int id;
        public int group;
        public string nameKey;
        public string[] grid;
        public string diamond;
        public List<EnemyDto> enemies;
    }
}
