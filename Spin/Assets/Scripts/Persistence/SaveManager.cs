using System;
using System.IO;
using UnityEngine;

namespace Spin.Persistence
{
    /// <summary>
    /// Loads/saves SaveData as local JSON at Application.persistentDataPath (§11.2). A missing
    /// or corrupt save file silently resets to defaults rather than surfacing an error to the player.
    /// </summary>
    public sealed class SaveManager
    {
        private const string FileName = "spin_save.json";
        private string FilePath => Path.Combine(Application.persistentDataPath, FileName);

        private SaveData _cache;

        public SaveData Load()
        {
            if (_cache != null) return _cache;

            try
            {
                if (File.Exists(FilePath))
                {
                    string json = File.ReadAllText(FilePath);
                    _cache = JsonUtility.FromJson<SaveData>(json);
                }
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"Save data corrupt or unreadable, resetting to defaults: {ex.Message}");
            }

            if (_cache == null) _cache = new SaveData();
            return _cache;
        }

        public void Save(SaveData data)
        {
            _cache = data;
            try
            {
                string json = JsonUtility.ToJson(data, true);
                File.WriteAllText(FilePath, json);
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to write save data: {ex.Message}");
            }
        }

        public bool IsTutorialTipShown(string tipKey) => Load().IsTutorialTipShown(tipKey);

        public void MarkTutorialTipShown(string tipKey)
        {
            var data = Load();
            data.MarkTutorialTipShown(tipKey);
            Save(data);
        }

        public void MarkLevelBeaten(int levelId)
        {
            var data = Load();
            data.MarkLevelBeaten(levelId);
            Save(data);
        }
    }
}
