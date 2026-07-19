using UnityEngine.UIElements;
using Spin.App;

namespace Spin.View.Screens
{
    /// <summary>§9.3 screen 6: full Group 1 puzzle mosaic + celebration + Continue back to the map.</summary>
    public sealed class PuzzleCompleteScreenController : IScreenController
    {
        private readonly ScreenManager _screens;
        private readonly Label _message;
        private readonly VisualElement _fullPiece;
        private readonly Button _continueButton;

        public VisualElement Root { get; }

        public PuzzleCompleteScreenController(ScreenManager screens)
        {
            _screens = screens;
            Root = UiFactory.Screen();

            _message = UiFactory.Title(string.Empty);
            Root.Add(_message);

            _fullPiece = new VisualElement();
            _fullPiece.AddToClassList("puzzle-piece-revealed");
            _fullPiece.AddToClassList("puzzle-complete-mosaic");
            Root.Add(_fullPiece);

            _continueButton = UiFactory.ActionButton(string.Empty, () => _screens.Show(ScreenId.LevelMap));
            Root.Add(_continueButton);
        }

        public void OnShow()
        {
            _message.text = GameServices.Localization.GetText("msg.group_complete");
            _continueButton.text = GameServices.Localization.GetText("ui.continue");
        }

        public void OnHide()
        {
        }
    }
}
