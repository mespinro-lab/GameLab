using System;
using UnityEngine.UIElements;
using Spin.App;
using Spin.Model;
using Spin.Tutorial;

namespace Spin.View.Tutorial
{
    /// <summary>
    /// Renders the anchored tooltip + pulse highlight for the current tip (§9.5). Never blocks
    /// input: dismissal listens in the capture (trickle-down) phase and never stops propagation,
    /// so the same tap that dismisses a tip also still reaches normal gameplay input handling.
    /// </summary>
    public sealed class TutorialOverlayController
    {
        private const int PulseIntervalMillis = 450;

        private readonly Label _bubble;
        private readonly TutorialManager _tutorial;
        private readonly Func<string, VisualElement> _resolveAnchor;

        private VisualElement _highlighted;

        public TutorialOverlayController(VisualElement screenRoot, TutorialManager tutorial, Func<string, VisualElement> resolveAnchor)
        {
            _tutorial = tutorial;
            _resolveAnchor = resolveAnchor;

            _bubble = new Label();
            _bubble.AddToClassList("tooltip");
            _bubble.style.display = DisplayStyle.None;
            _bubble.pickingMode = PickingMode.Ignore;
            screenRoot.Add(_bubble);

            _tutorial.TipReady += OnTipReady;
            screenRoot.RegisterCallback<PointerDownEvent>(_ => Dismiss(), TrickleDown.TrickleDown);
        }

        public void OnTurnResolved(TurnResult result) => Dismiss();

        private void OnTipReady(TutorialDefinition tip)
        {
            _bubble.text = GameServices.Localization.GetText(tip.Key);
            _bubble.style.display = DisplayStyle.Flex;

            _highlighted?.RemoveFromClassList("tutorial-highlight");
            _highlighted?.RemoveFromClassList("tutorial-highlight-pulse");

            _highlighted = _resolveAnchor(tip.AnchorId);
            if (_highlighted != null)
            {
                _highlighted.AddToClassList("tutorial-highlight");
                SchedulePulse(_highlighted, true);
            }

            PositionNear(_highlighted);
        }

        private void PositionNear(VisualElement anchor)
        {
            if (anchor == null)
            {
                _bubble.style.left = 20;
                _bubble.style.top = 20;
                return;
            }

            var bound = anchor.worldBound;
            _bubble.style.left = bound.x;
            _bubble.style.top = bound.yMax + 8;
        }

        private void SchedulePulse(VisualElement element, bool on)
        {
            element.schedule.Execute(() =>
            {
                if (!ReferenceEquals(_highlighted, element)) return; // dismissed or replaced — stop the loop.

                if (on) element.AddToClassList("tutorial-highlight-pulse");
                else element.RemoveFromClassList("tutorial-highlight-pulse");

                SchedulePulse(element, !on);
            }).ExecuteLater(PulseIntervalMillis);
        }

        public void Dismiss()
        {
            if (_bubble.style.display == DisplayStyle.None) return;

            _bubble.style.display = DisplayStyle.None;
            _highlighted?.RemoveFromClassList("tutorial-highlight");
            _highlighted?.RemoveFromClassList("tutorial-highlight-pulse");
            _highlighted = null;

            _tutorial.DismissCurrent();
        }
    }
}
