using UnityEngine.UIElements;
using Spin.App;
using Spin.Localization;

namespace Spin.View.Screens
{
    /// <summary>§9.3 screen 1: logo, Play, Options (language + sound), Credits.</summary>
    public sealed class MainMenuScreenController : IScreenController
    {
        private readonly ScreenManager _screens;

        private readonly Label _title;
        private readonly Button _playButton;
        private readonly Button _optionsButton;
        private readonly Button _creditsButton;

        private readonly VisualElement _optionsPanel;
        private readonly Button _langCaButton;
        private readonly Button _langEsButton;
        private readonly Button _langEnButton;
        private readonly Button _soundToggleButton;
        private readonly Label _soundLabel;

        private readonly VisualElement _creditsPanel;
        private readonly Label _creditsBody;

        public VisualElement Root { get; }

        public MainMenuScreenController(ScreenManager screens)
        {
            _screens = screens;
            Root = UiFactory.Screen();

            _title = UiFactory.Title(Text("app.name"));
            Root.Add(_title);

            _playButton = UiFactory.ActionButton(Text("ui.play"), OnPlay);
            Root.Add(_playButton);

            _optionsButton = UiFactory.ActionButton(Text("ui.options"), ToggleOptions);
            Root.Add(_optionsButton);

            _creditsButton = UiFactory.ActionButton(Text("ui.credits"), ToggleCredits);
            Root.Add(_creditsButton);

            _optionsPanel = new VisualElement();
            _optionsPanel.AddToClassList("sub-panel");
            _optionsPanel.style.display = DisplayStyle.None;

            var langLabel = new Label(Text("ui.language"));
            _langCaButton = UiFactory.ActionButton(Text("lang.ca.name"), () => SetLanguage(Language.Ca));
            _langEsButton = UiFactory.ActionButton(Text("lang.es.name"), () => SetLanguage(Language.Es));
            _langEnButton = UiFactory.ActionButton(Text("lang.en.name"), () => SetLanguage(Language.En));

            _soundLabel = new Label();
            _soundToggleButton = UiFactory.ActionButton(string.Empty, ToggleSound);

            _optionsPanel.Add(langLabel);
            _optionsPanel.Add(_langCaButton);
            _optionsPanel.Add(_langEsButton);
            _optionsPanel.Add(_langEnButton);
            _optionsPanel.Add(_soundLabel);
            _optionsPanel.Add(_soundToggleButton);
            Root.Add(_optionsPanel);

            _creditsPanel = new VisualElement();
            _creditsPanel.AddToClassList("sub-panel");
            _creditsPanel.style.display = DisplayStyle.None;
            _creditsBody = new Label();
            _creditsPanel.Add(_creditsBody);
            Root.Add(_creditsPanel);

            GameServices.Localization.LanguageChanged += RefreshText;
            RefreshText();
        }

        private static string Text(string key) => GameServices.Localization.GetText(key);

        private void OnPlay() => _screens.Show(ScreenId.LevelMap);

        private void ToggleOptions()
        {
            bool showing = _optionsPanel.style.display == DisplayStyle.Flex;
            _optionsPanel.style.display = showing ? DisplayStyle.None : DisplayStyle.Flex;
            _creditsPanel.style.display = DisplayStyle.None;
        }

        private void ToggleCredits()
        {
            bool showing = _creditsPanel.style.display == DisplayStyle.Flex;
            _creditsPanel.style.display = showing ? DisplayStyle.None : DisplayStyle.Flex;
            _optionsPanel.style.display = DisplayStyle.None;
        }

        private void SetLanguage(Language language)
        {
            GameServices.Localization.LoadLanguage(language);
            var data = GameServices.Save.Load();
            data.language = LocalizationManager.LanguageCode(language);
            GameServices.Save.Save(data);
        }

        private void ToggleSound()
        {
            var data = GameServices.Save.Load();
            data.soundOn = !data.soundOn;
            GameServices.Save.Save(data);
            RefreshText();
        }

        private void RefreshText()
        {
            _title.text = Text("app.name");
            _playButton.text = Text("ui.play");
            _optionsButton.text = Text("ui.options");
            _creditsButton.text = Text("ui.credits");
            _creditsBody.text = Text("credits.body");

            _langCaButton.text = Text("lang.ca.name");
            _langEsButton.text = Text("lang.es.name");
            _langEnButton.text = Text("lang.en.name");

            _soundLabel.text = Text("ui.sound");
            bool soundOn = GameServices.Save.Load().soundOn;
            _soundToggleButton.text = soundOn ? Text("ui.on") : Text("ui.off");
        }

        public void OnShow() => RefreshText();
        public void OnHide() { }
    }
}
