using UnityEngine;
using UnityEngine.UIElements;
using Spin.App;
using Spin.Model;
using Spin.Tutorial;
using Spin.View.Feedback;
using Spin.View.Grid;
using Spin.View.Input;
using Spin.View.Tutorial;

namespace Spin.View.Screens
{
    /// <summary>§9.2/§9.3 screen 3: the actual gameplay — grid, HUD, input, feedback, tutorial overlay.</summary>
    public sealed class GameScreenController : IScreenController
    {
        private readonly ScreenManager _screens;
        private readonly GridView _gridView;
        private readonly GameInputController _input;
        private readonly ExitFeedbackController _feedback;
        private readonly EnemyAnimationController _enemyAnimation;
        private readonly TutorialOverlayController _tutorialOverlay;

        private readonly Label _turnLabel;
        private readonly Label _gemLabel;
        private readonly Button _spikeButton;
        private readonly Button _waitButton;
        private readonly Button _pauseButton;

        private readonly VisualElement _pauseOverlay;
        private readonly Button _resumeButton;
        private readonly Button _restartButton;
        private readonly Button _exitButton;
        private readonly Button _pauseOptionsButton;
        private readonly VisualElement _pauseOptionsPanel;

        private TurnManager _turns;

        public VisualElement Root { get; }

        public GameScreenController(ScreenManager screens)
        {
            _screens = screens;
            Root = UiFactory.Screen();
            Root.AddToClassList("game-screen");

            var hud = new VisualElement();
            hud.AddToClassList("hud-bar");

            _turnLabel = new Label();
            _gemLabel = new Label();
            _spikeButton = UiFactory.ActionButton("🌵", OnSpikeButton);
            _waitButton = UiFactory.ActionButton("⏳", OnWaitButton);
            _pauseButton = UiFactory.ActionButton("⏸", OnPauseButton);

            hud.Add(_turnLabel);
            hud.Add(_gemLabel);
            hud.Add(_spikeButton);
            hud.Add(_waitButton);
            hud.Add(_pauseButton);
            Root.Add(hud);

            _gridView = new GridView();
            Root.Add(_gridView);

            var audioSource = new GameObject("SpinFeedbackAudio").AddComponent<AudioSource>();

            _input = new GameInputController(Root, _gridView);
            _feedback = new ExitFeedbackController(_gridView, audioSource);
            _enemyAnimation = new EnemyAnimationController(_gridView);
            _tutorialOverlay = new TutorialOverlayController(Root, GameServices.Tutorial, ResolveAnchor);

            _pauseOverlay = new VisualElement();
            _pauseOverlay.AddToClassList("sub-panel");
            _pauseOverlay.style.display = DisplayStyle.None;

            _resumeButton = UiFactory.ActionButton(string.Empty, OnResume);
            _restartButton = UiFactory.ActionButton(string.Empty, OnRestart);
            _exitButton = UiFactory.ActionButton(string.Empty, OnExitToMap);
            _pauseOptionsButton = UiFactory.ActionButton(string.Empty, TogglePauseOptions);
            _pauseOptionsPanel = OptionsPanelBuilder.Build();

            _pauseOverlay.Add(_resumeButton);
            _pauseOverlay.Add(_restartButton);
            _pauseOverlay.Add(_exitButton);
            _pauseOverlay.Add(_pauseOptionsButton);
            _pauseOverlay.Add(_pauseOptionsPanel);
            Root.Add(_pauseOverlay);

            GameServices.Localization.LanguageChanged += RefreshHudText;
        }

        public void OnShow()
        {
            int levelId = _screens.PendingLevelId;
            _screens.Session.StartLevel(levelId);
            BindToCurrentTurns();

            _pauseOverlay.style.display = DisplayStyle.None;
            _pauseOptionsPanel.style.display = DisplayStyle.None;
            RefreshHudText();
            GameServices.Tutorial.NotifyLevelStarted(levelId);
        }

        public void OnHide() => UnbindFromCurrentTurns();

        private void BindToCurrentTurns()
        {
            _turns = _screens.Session.Turns;
            _gridView.Bind(_screens.Session.Grid);
            _input.Bind(_turns);
            _turns.TurnResolved += OnTurnResolved;
            _turns.ActionRejected += _feedback.OnActionRejected;
        }

        private void UnbindFromCurrentTurns()
        {
            if (_turns == null) return;
            _turns.TurnResolved -= OnTurnResolved;
            _turns.ActionRejected -= _feedback.OnActionRejected;
        }

        private void OnTurnResolved(TurnResult result)
        {
            _gridView.RenderAll();
            _enemyAnimation.OnTurnResolved(result);
            _feedback.OnTurnResolved(result);
            _tutorialOverlay.OnTurnResolved(result);
            RefreshHudText();

            if (result.GemCollectedThisTurn)
            {
                GameServices.Tutorial.NotifyEvent(TutorialTrigger.GemCollected);
                _gemLabel.AddToClassList("gem-pulse");
                _gemLabel.schedule.Execute(() => _gemLabel.RemoveFromClassList("gem-pulse")).ExecuteLater(600);
            }

            if (result.WildSpikeCollectedThisTurn)
                GameServices.Tutorial.NotifyEvent(TutorialTrigger.WildSpikeCollected);

            if (result.ExitAttemptedWithoutGem)
                GameServices.Tutorial.NotifyEvent(TutorialTrigger.ExitEnteredWithoutGem);

            if (result.Status == GameStatus.Victory) _screens.Show(ScreenId.Victory);
            else if (result.Status == GameStatus.Defeat) _screens.Show(ScreenId.Defeat);
        }

        private void OnSpikeButton() => _input.ToggleSpikePlacementMode();
        private void OnWaitButton() => _input.RequestWait();

        private void OnPauseButton()
        {
            bool showing = _pauseOverlay.style.display == DisplayStyle.Flex;
            _pauseOverlay.style.display = showing ? DisplayStyle.None : DisplayStyle.Flex;
        }

        private void TogglePauseOptions()
        {
            bool showing = _pauseOptionsPanel.style.display == DisplayStyle.Flex;
            _pauseOptionsPanel.style.display = showing ? DisplayStyle.None : DisplayStyle.Flex;
        }

        private void OnResume() => _pauseOverlay.style.display = DisplayStyle.None;

        private void OnRestart()
        {
            _pauseOverlay.style.display = DisplayStyle.None;
            UnbindFromCurrentTurns();
            _screens.Session.RestartCurrentLevel();
            BindToCurrentTurns();
            RefreshHudText();
        }

        private void OnExitToMap()
        {
            _pauseOverlay.style.display = DisplayStyle.None;
            UnbindFromCurrentTurns();
            _screens.Show(ScreenId.LevelMap);
        }

        private void RefreshHudText()
        {
            if (_turns == null) return;

            var state = _turns.CurrentState;
            _turnLabel.text = $"{GameServices.Localization.GetText("hud.turns")}: {state.TurnCount}";
            _spikeButton.text = $"🌵 {state.SpikeInventory}";
            _spikeButton.SetEnabled(state.SpikeInventory > 0);
            _gemLabel.text = state.HasGem ? GameServices.Localization.GetText("hud.diamond_found") : string.Empty;
            _waitButton.text = "⏳";

            _resumeButton.text = GameServices.Localization.GetText("ui.resume");
            _restartButton.text = GameServices.Localization.GetText("ui.restart");
            _exitButton.text = GameServices.Localization.GetText("ui.exit");
            _pauseOptionsButton.text = GameServices.Localization.GetText("ui.options");
        }

        private VisualElement ResolveAnchor(string anchorId)
        {
            if (_gridView.Grid == null) return null;

            switch (anchorId)
            {
                case "spin":
                    return _gridView.GetCell(_gridView.Grid.SpinPosition);
                case "exitDoor":
                    return _gridView.GetCell(_gridView.Grid.ExitCoord);
                case "badger":
                    return _gridView.Grid.Enemies.Count > 0 ? _gridView.GetCell(_gridView.Grid.Enemies[0].Position) : null;
                case "waitButton":
                    return _waitButton;
                case "spikeButton":
                    return _spikeButton;
                case "spikes":
                    return FindNearestCellOfType(CellType.WildSpike);
                case "nearestThinWall":
                    return FindNearestCellOfType(CellType.ThinWall);
                default:
                    return null;
            }
        }

        private VisualElement FindNearestCellOfType(CellType type)
        {
            var grid = _gridView.Grid;
            var spin = grid.SpinPosition;
            Coord? best = null;
            int bestDistance = int.MaxValue;

            for (int row = 0; row < GridModel.Size; row++)
            {
                for (int col = 0; col < GridModel.Size; col++)
                {
                    var c = new Coord(col, row);
                    if (grid.GetCellType(c) != type) continue;

                    int distance = System.Math.Abs(c.Col - spin.Col) + System.Math.Abs(c.Row - spin.Row);
                    if (distance < bestDistance)
                    {
                        bestDistance = distance;
                        best = c;
                    }
                }
            }

            return best.HasValue ? _gridView.GetCell(best.Value) : null;
        }
    }
}
