using System;

namespace Spin.Level
{
    /// <summary>Raw per-enemy shape from level JSON (§10), deserialized via JsonUtility.</summary>
    [Serializable]
    public sealed class EnemyDto
    {
        public int order;
        public string type;
        public string start;
        public string axis;
        public string initialDir;
    }
}
