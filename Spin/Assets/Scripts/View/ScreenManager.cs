using System.Collections.Generic;
using UnityEngine.UIElements;
using Spin.App;
using Spin.View.Screens;

namespace Spin.View
{
    /// <summary>
    /// Swaps between the 6 screens (§9.3) by toggling VisualElement visibility inside one
    /// persistent root — no per-screen scenes, no hand-authored scene YAML beyond Bootstrap.unity.
    /// </summary>
    public sealed class ScreenManager
    {
        private readonly VisualElement _root;
        private readonly Dictionary<ScreenId, IScreenController> _screens = new Dictionary<ScreenId, IScreenController>();
        private IScreenController _active;

        public GameSession Session { get; }

        /// <summary>Set right before showing the Game screen so GameScreenController knows which level to start.</summary>
        public int PendingLevelId { get; private set; }

        public ScreenManager(VisualElement root, GameSession session)
        {
            _root = root;
            Session = session;

            Register(ScreenId.MainMenu, new MainMenuScreenController(this));
            Register(ScreenId.LevelMap, new LevelMapScreenController(this));
            Register(ScreenId.Game, new GameScreenController(this));
            Register(ScreenId.Victory, new VictoryScreenController(this));
            Register(ScreenId.Defeat, new DefeatScreenController(this));
            Register(ScreenId.PuzzleComplete, new PuzzleCompleteScreenController(this));
        }

        private void Register(ScreenId id, IScreenController controller)
        {
            controller.Root.style.display = DisplayStyle.None;
            _root.Add(controller.Root);
            _screens[id] = controller;
        }

        public void Show(ScreenId id)
        {
            if (_active != null)
            {
                _active.Root.style.display = DisplayStyle.None;
                _active.OnHide();
            }

            _active = _screens[id];
            _active.Root.style.display = DisplayStyle.Flex;
            _active.OnShow();
        }

        public void ShowMainMenu() => Show(ScreenId.MainMenu);

        public void StartLevel(int levelId)
        {
            PendingLevelId = levelId;
            Show(ScreenId.Game);
        }
    }
}
