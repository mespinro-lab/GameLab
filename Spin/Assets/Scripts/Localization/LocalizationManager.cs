using System;
using System.Collections.Generic;

namespace Spin.Localization
{
    /// <summary>
    /// Active-language text lookup (§11.1). Fallback is per-key to English, not per-language,
    /// so a single missing translation never blanks out the rest of a language.
    /// </summary>
    public sealed class LocalizationManager
    {
        private readonly Dictionary<Language, Dictionary<string, string>> _tables =
            new Dictionary<Language, Dictionary<string, string>>();

        public Language CurrentLanguage { get; private set; } = Language.En;

        public event Action LanguageChanged;

        public void RegisterLanguage(Language language, string rawJson)
        {
            _tables[language] = LocalizationParser.Parse(rawJson);
        }

        public void LoadLanguage(Language language)
        {
            CurrentLanguage = language;
            LanguageChanged?.Invoke();
        }

        public string GetText(string key)
        {
            if (_tables.TryGetValue(CurrentLanguage, out var table) && table.TryGetValue(key, out var value))
                return value;

            if (_tables.TryGetValue(Language.En, out var fallbackTable) && fallbackTable.TryGetValue(key, out var fallbackValue))
                return fallbackValue;

            return key;
        }

        public static string LanguageCode(Language language)
        {
            switch (language)
            {
                case Language.Ca: return "ca";
                case Language.Es: return "es";
                default: return "en";
            }
        }

        public static Language? ParseLanguageCode(string code)
        {
            switch (code)
            {
                case "ca": return Language.Ca;
                case "es": return Language.Es;
                case "en": return Language.En;
                default: return null;
            }
        }

        public static Language ResolveDeviceDefaultLanguage()
        {
            var systemLanguage = UnityEngine.Application.systemLanguage;
            if (systemLanguage == UnityEngine.SystemLanguage.Catalan) return Language.Ca;
            if (systemLanguage == UnityEngine.SystemLanguage.Spanish) return Language.Es;
            return Language.En;
        }
    }
}
