using System.Collections;
using UnityEngine;
using UnityEngine.UIElements;
using Spin.Level;
using Spin.Localization;
using Spin.Persistence;
using Spin.Tutorial;
using Spin.View;

namespace Spin.App
{
    /// <summary>
    /// Composition root — the only MonoBehaviour that wires every system together at startup.
    /// Lives on the single GameObject in Bootstrap.unity. Builds PanelSettings in code (no
    /// hand-authored .asset file) and loads all level/localization content before showing the menu.
    /// </summary>
    public sealed class GameBootstrap : MonoBehaviour
    {
        private const int LevelCount = 7;

        private UIDocument _uiDocument;
        private ScreenManager _screenManager;

        private void Awake()
        {
            var panelSettings = ScriptableObject.CreateInstance<PanelSettings>();
            panelSettings.scaleMode = PanelScaleMode.ScaleWithScreenSize;
            panelSettings.referenceResolution = new Vector2Int(1080, 1920);
            panelSettings.screenMatchMode = PanelScreenMatchMode.MatchWidthOrHeight;
            panelSettings.match = 0.5f;

            _uiDocument = gameObject.AddComponent<UIDocument>();
            _uiDocument.panelSettings = panelSettings;

            GameServices.Save = new SaveManager();
            GameServices.Localization = new LocalizationManager();
            GameServices.Levels = new LevelCatalog();
            GameServices.Tutorial = new TutorialManager(GameServices.Save);

            var session = new GameSession();
            _screenManager = new ScreenManager(_uiDocument.rootVisualElement, session);

            LoadThemeStylesheet();

            StartCoroutine(LoadContentAndShowMenu());
        }

        private void LoadThemeStylesheet()
        {
            var theme = Resources.Load<StyleSheet>("Theme");
            if (theme != null)
                _uiDocument.rootVisualElement.styleSheets.Add(theme);
            else
                Debug.LogWarning("Theme.uss not found under Assets/UI/Resources — UI will render unstyled.");
        }

        private IEnumerator LoadContentAndShowMenu()
        {
            var localizationLoader = new LocalizationFileLoader();
            foreach (var language in new[] { Language.Ca, Language.Es, Language.En })
            {
                string error = null;
                string text = null;
                yield return localizationLoader.LoadLanguageText(language, s => text = s, e => error = e);

                if (error != null) { Debug.LogError(error); continue; }
                GameServices.Localization.RegisterLanguage(language, text);
            }

            var saveData = GameServices.Save.Load();
            var savedLanguage = LocalizationManager.ParseLanguageCode(saveData.language);
            var initialLanguage = savedLanguage ?? LocalizationManager.ResolveDeviceDefaultLanguage();
            GameServices.Localization.LoadLanguage(initialLanguage);

            var levelLoader = new LevelFileLoader();
            for (int id = 1; id <= LevelCount; id++)
            {
                string fileName = $"level_{id:D2}.json";
                string error = null;
                string json = null;
                yield return levelLoader.LoadLevelText(fileName, s => json = s, e => error = e);

                if (error != null) { Debug.LogError(error); continue; }

                try
                {
                    GameServices.Levels.Add(LevelParser.Parse(json));
                }
                catch (LevelValidationException ex)
                {
                    Debug.LogError($"Level {fileName} failed validation: {ex.Message}");
                }
            }

            _screenManager.ShowMainMenu();
        }
    }
}
