using System;
using Spin.Level;
using Spin.Model;

namespace Spin.App
{
    /// <summary>Owns the current level attempt: GridModel + TurnManager lifecycle, restart, and the beaten-level persistence side-effect.</summary>
    public sealed class GameSession
    {
        public LevelData CurrentLevel { get; private set; }
        public GridModel Grid { get; private set; }
        public TurnManager Turns { get; private set; }

        public void StartLevel(int levelId)
        {
            if (!GameServices.Levels.TryGet(levelId, out var level))
                throw new InvalidOperationException($"Level {levelId} is not loaded.");

            CurrentLevel = level;
            Grid = new GridModel(level);
            Turns = new TurnManager(Grid);
            Turns.TurnResolved += OnTurnResolved;
        }

        public void RestartCurrentLevel()
        {
            if (CurrentLevel != null) StartLevel(CurrentLevel.Id);
        }

        private void OnTurnResolved(TurnResult result)
        {
            if (result.Status == GameStatus.Victory)
                GameServices.Save.MarkLevelBeaten(CurrentLevel.Id);
        }
    }
}
