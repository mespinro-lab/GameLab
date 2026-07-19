using UnityEngine.UIElements;
using Spin.App;
using Spin.Localization;

namespace Spin.View
{
    /// <summary>Builds the language + sound controls used by both the Main Menu and the in-game pause overlay.</summary>
    internal static class OptionsPanelBuilder
    {
        public static VisualElement Build()
        {
            var panel = new VisualElement();
            panel.AddToClassList("sub-panel");
            panel.style.display = DisplayStyle.None;

            var langLabel = new Label();
            var soundLabel = new Label();
            Button soundToggle = null;

            var langCa = UiFactory.ActionButton(string.Empty, () => SetLanguage(Language.Ca, RefreshLocal));
            var langEs = UiFactory.ActionButton(string.Empty, () => SetLanguage(Language.Es, RefreshLocal));
            var langEn = UiFactory.ActionButton(string.Empty, () => SetLanguage(Language.En, RefreshLocal));
            soundToggle = UiFactory.ActionButton(string.Empty, () => ToggleSound(RefreshLocal));

            panel.Add(langLabel);
            panel.Add(langCa);
            panel.Add(langEs);
            panel.Add(langEn);
            panel.Add(soundLabel);
            panel.Add(soundToggle);

            void RefreshLocal()
            {
                langLabel.text = GameServices.Localization.GetText("ui.language");
                langCa.text = GameServices.Localization.GetText("lang.ca.name");
                langEs.text = GameServices.Localization.GetText("lang.es.name");
                langEn.text = GameServices.Localization.GetText("lang.en.name");
                soundLabel.text = GameServices.Localization.GetText("ui.sound");
                soundToggle.text = GameServices.Save.Load().soundOn
                    ? GameServices.Localization.GetText("ui.on")
                    : GameServices.Localization.GetText("ui.off");
            }

            GameServices.Localization.LanguageChanged += RefreshLocal;
            RefreshLocal();

            return panel;
        }

        private static void SetLanguage(Language language, System.Action refresh)
        {
            GameServices.Localization.LoadLanguage(language);
            var data = GameServices.Save.Load();
            data.language = LocalizationManager.LanguageCode(language);
            GameServices.Save.Save(data);
            refresh();
        }

        private static void ToggleSound(System.Action refresh)
        {
            var data = GameServices.Save.Load();
            data.soundOn = !data.soundOn;
            GameServices.Save.Save(data);
            refresh();
        }
    }
}
