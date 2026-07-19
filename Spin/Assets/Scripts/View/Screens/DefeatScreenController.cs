using UnityEngine.UIElements;
using Spin.App;

namespace Spin.View.Screens
{
    /// <summary>§9.3 screen 5: gentle, never-punitive defeat message + Retry / Exit.</summary>
    public sealed class DefeatScreenController : IScreenController
    {
        private readonly ScreenManager _screens;
        private readonly Label _message;
        private readonly Button _retryButton;
        private readonly Button _exitButton;

        public VisualElement Root { get; }

        public DefeatScreenController(ScreenManager screens)
        {
            _screens = screens;
            Root = UiFactory.Screen();

            _message = UiFactory.Title(string.Empty);
            Root.Add(_message);

            _retryButton = UiFactory.ActionButton(string.Empty, OnRetry);
            _exitButton = UiFactory.ActionButton(string.Empty, OnExit);
            Root.Add(_retryButton);
            Root.Add(_exitButton);
        }

        // ScreenManager.PendingLevelId is still set to the level that was just being played,
        // so re-showing the Game screen re-triggers GameScreenController.OnShow -> StartLevel(same id).
        private void OnRetry() => _screens.Show(ScreenId.Game);

        private void OnExit() => _screens.Show(ScreenId.LevelMap);

        public void OnShow()
        {
            _message.text = GameServices.Localization.GetText("msg.defeat");
            _retryButton.text = GameServices.Localization.GetText("ui.retry");
            _exitButton.text = GameServices.Localization.GetText("ui.exit");
        }

        public void OnHide()
        {
        }
    }
}
