using System;
using System.Collections.Generic;
using Spin.Persistence;

namespace Spin.Tutorial
{
    /// <summary>
    /// Decides which contextual tip (§9.5) to show, one at a time (queued if more become due),
    /// and persists "shown" flags via SaveManager so each tip appears at most once per saved
    /// game. Never reads TurnManager/GridModel directly — callers feed it named events instead.
    /// </summary>
    public sealed class TutorialManager
    {
        private static readonly TutorialDefinition Move = new TutorialDefinition("tut.move", "spin");
        private static readonly TutorialDefinition ExitLocked = new TutorialDefinition("tut.exit_locked", "exitDoor");
        private static readonly TutorialDefinition GemFound = new TutorialDefinition("tut.gem_found", "spin");
        private static readonly TutorialDefinition Wall = new TutorialDefinition("tut.wall", "nearestThinWall");
        private static readonly TutorialDefinition Badger = new TutorialDefinition("tut.badger", "badger");
        private static readonly TutorialDefinition Wait = new TutorialDefinition("tut.wait", "waitButton");
        private static readonly TutorialDefinition SpikesPickup = new TutorialDefinition("tut.spikes_pickup", "spikes");
        private static readonly TutorialDefinition SpikesPlace = new TutorialDefinition("tut.spikes_place", "spikeButton");

        private readonly SaveManager _save;
        private readonly Queue<TutorialDefinition> _queue = new Queue<TutorialDefinition>();

        public TutorialDefinition Current { get; private set; }

        public event Action<TutorialDefinition> TipReady;

        public TutorialManager(SaveManager save)
        {
            _save = save;
        }

        /// <summary>Call once a level's view has finished loading — covers every "Inici de nivell" trigger in §9.5.</summary>
        public void NotifyLevelStarted(int levelId)
        {
            switch (levelId)
            {
                case 1: Enqueue(Move); break;
                case 2: Enqueue(Wall); break;
                case 3: Enqueue(Badger); break;
                case 4: Enqueue(SpikesPickup); break;
                // Levels 5-7 intentionally show no tips (§9.5).
            }
        }

        public void NotifyEvent(TutorialTrigger trigger)
        {
            switch (trigger)
            {
                case TutorialTrigger.GemCollected: Enqueue(GemFound); break;
                case TutorialTrigger.ExitEnteredWithoutGem: Enqueue(ExitLocked); break;
                case TutorialTrigger.WildSpikeCollected: Enqueue(SpikesPlace); break;
            }
        }

        /// <summary>Any tap/action while a tip is showing calls this — it never blocks or consumes input.</summary>
        public void DismissCurrent()
        {
            if (Current == null) return;

            _save.MarkTutorialTipShown(Current.Key);
            bool wasBadger = ReferenceEquals(Current, Badger);
            Current = null;

            if (wasBadger)
                Enqueue(Wait); // §9.5: tut.wait triggers specifically when tut.badger closes.

            ShowNextIfIdle();
        }

        private void Enqueue(TutorialDefinition tip)
        {
            if (_save.IsTutorialTipShown(tip.Key)) return;
            if (ReferenceEquals(Current, tip) || _queue.Contains(tip)) return;

            _queue.Enqueue(tip);
            ShowNextIfIdle();
        }

        private void ShowNextIfIdle()
        {
            if (Current != null) return;
            if (_queue.Count == 0) return;

            Current = _queue.Dequeue();
            TipReady?.Invoke(Current);
        }
    }
}
