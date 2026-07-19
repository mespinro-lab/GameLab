using System.Collections.Generic;
using UnityEngine.UIElements;
using Spin.App;

namespace Spin.View.Screens
{
    /// <summary>§9.3 screen 2: the Group 1 puzzle as a mosaic, one tile/piece per level.</summary>
    public sealed class LevelMapScreenController : IScreenController
    {
        private const int LevelCount = 7;

        private readonly ScreenManager _screens;
        private readonly Label _groupTitle;
        private readonly Button _backButton;
        private readonly VisualElement _tileRow;
        private readonly List<Button> _tileButtons = new List<Button>();
        private readonly List<VisualElement> _pieceSwatches = new List<VisualElement>();

        public VisualElement Root { get; }

        public LevelMapScreenController(ScreenManager screens)
        {
            _screens = screens;
            Root = UiFactory.Screen();

            _groupTitle = UiFactory.Title(string.Empty);
            Root.Add(_groupTitle);

            _tileRow = new VisualElement();
            _tileRow.AddToClassList("level-tile-row");
            Root.Add(_tileRow);

            for (int id = 1; id <= LevelCount; id++)
            {
                int capturedId = id;
                var tile = new VisualElement();
                tile.AddToClassList("level-tile");

                var piece = new VisualElement();
                piece.AddToClassList("puzzle-piece");
                tile.Add(piece);
                _pieceSwatches.Add(piece);

                var button = new Button(() => OnTileTapped(capturedId));
                button.AddToClassList("action-button");
                tile.Add(button);
                _tileButtons.Add(button);

                _tileRow.Add(tile);
            }

            _backButton = UiFactory.ActionButton(string.Empty, () => _screens.Show(ScreenId.MainMenu));
            Root.Add(_backButton);

            GameServices.Localization.LanguageChanged += RefreshText;
        }

        private void OnTileTapped(int levelId)
        {
            if (!IsUnlocked(levelId)) return; // locked tiles: no-op (decisions log #4)
            _screens.StartLevel(levelId);
        }

        private static bool IsUnlocked(int levelId)
        {
            if (levelId == 1) return true;
            return GameServices.Save.Load().IsLevelBeaten(levelId - 1);
        }

        private void RefreshText()
        {
            _groupTitle.text = GameServices.Localization.GetText("group.1.name");
            _backButton.text = GameServices.Localization.GetText("ui.exit");

            var save = GameServices.Save.Load();
            for (int i = 0; i < LevelCount; i++)
            {
                int levelId = i + 1;
                bool unlocked = IsUnlocked(levelId);
                bool beaten = save.IsLevelBeaten(levelId);

                _tileButtons[i].text = unlocked ? GameServices.Localization.GetText($"level.{levelId}.name") : "🔒";
                _tileButtons[i].SetEnabled(unlocked);

                _pieceSwatches[i].EnableInClassList("puzzle-piece-revealed", beaten);
            }
        }

        public void OnShow() => RefreshText();
        public void OnHide() { }
    }
}
