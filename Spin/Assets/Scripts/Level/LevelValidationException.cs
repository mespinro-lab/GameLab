using System;

namespace Spin.Level
{
    /// <summary>Thrown by LevelParser on any load-time validation failure (§10) — fail fast with a clear message.</summary>
    public sealed class LevelValidationException : Exception
    {
        public LevelValidationException(string message) : base(message)
        {
        }
    }
}
