using UnityEngine.UIElements;
using Spin.App;

namespace Spin.View.Screens
{
    /// <summary>§9.3 screen 4: victory + revealed puzzle piece + Continue (decisions log #5-#6).</summary>
    public sealed class VictoryScreenController : IScreenController
    {
        private readonly ScreenManager _screens;
        private readonly Label _message;
        private readonly VisualElement _piece;
        private readonly Button _continueButton;

        public VisualElement Root { get; }

        public VictoryScreenController(ScreenManager screens)
        {
            _screens = screens;
            Root = UiFactory.Screen();

            _message = UiFactory.Title(string.Empty);
            Root.Add(_message);

            _piece = new VisualElement();
            _piece.AddToClassList("puzzle-piece");
            _piece.AddToClassList("puzzle-piece-revealed");
            _piece.AddToClassList("puzzle-piece-large");
            Root.Add(_piece);

            _continueButton = UiFactory.ActionButton(string.Empty, OnContinue);
            Root.Add(_continueButton);
        }

        private void OnContinue()
        {
            var level = _screens.Session.CurrentLevel;
            bool isLastOfGroup1 = level != null && level.Id == 7;
            _screens.Show(isLastOfGroup1 ? ScreenId.PuzzleComplete : ScreenId.LevelMap);
        }

        public void OnShow()
        {
            _message.text = GameServices.Localization.GetText("msg.victory");
            _continueButton.text = GameServices.Localization.GetText("ui.continue");
        }

        public void OnHide()
        {
        }
    }
}
