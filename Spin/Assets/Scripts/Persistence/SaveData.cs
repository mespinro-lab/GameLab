using System;
using System.Collections.Generic;

namespace Spin.Persistence
{
    /// <summary>Local save shape (§11.2): last level beaten, revealed pieces, language, sound, tutorial flags.</summary>
    [Serializable]
    public sealed class SaveData
    {
        public int lastLevelBeaten;
        public List<int> revealedPieces = new List<int>();

        /// <summary>Language code ("ca"/"es"/"en"), or null/empty on first run (use device default).</summary>
        public string language;

        public bool soundOn = true;
        public List<string> tutorialTipsShown = new List<string>();

        public bool IsLevelBeaten(int levelId) => levelId <= lastLevelBeaten;

        public void MarkLevelBeaten(int levelId)
        {
            if (levelId > lastLevelBeaten) lastLevelBeaten = levelId;
            if (!revealedPieces.Contains(levelId)) revealedPieces.Add(levelId);
        }

        public bool IsTutorialTipShown(string tipKey) => tutorialTipsShown.Contains(tipKey);

        public void MarkTutorialTipShown(string tipKey)
        {
            if (!tutorialTipsShown.Contains(tipKey)) tutorialTipsShown.Add(tipKey);
        }
    }
}
