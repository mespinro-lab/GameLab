using System.Collections.Generic;
using System.IO;
using NUnit.Framework;
using UnityEngine;
using Spin.Persistence;
using Spin.Tutorial;

namespace Spin.Tests.EditMode
{
    public class TutorialManagerTests
    {
        private static string SaveFilePath => Path.Combine(Application.persistentDataPath, "spin_save.json");

        [SetUp]
        public void ClearSaveFile()
        {
            if (File.Exists(SaveFilePath)) File.Delete(SaveFilePath);
        }

        [Test]
        public void Tutorial_TipShownOnce_NeverRepeatsAfterFlagPersisted()
        {
            var save = new SaveManager();
            var tutorial = new TutorialManager(save);
            TutorialDefinition shown = null;
            tutorial.TipReady += tip => shown = tip;

            tutorial.NotifyLevelStarted(1);
            Assert.IsNotNull(shown);
            Assert.AreEqual("tut.move", shown.Key);

            tutorial.DismissCurrent();
            Assert.IsTrue(save.IsTutorialTipShown("tut.move"));

            // A brand new session (new SaveManager + TutorialManager) reading the same persisted flag.
            var save2 = new SaveManager();
            var tutorial2 = new TutorialManager(save2);
            shown = null;
            tutorial2.TipReady += tip => shown = tip;

            tutorial2.NotifyLevelStarted(1);
            Assert.IsNull(shown, "A tip already marked shown must never fire again.");
        }

        [Test]
        public void Tutorial_MultipleDueSimultaneously_QueuesAndShowsOnlyOneAtATime()
        {
            var save = new SaveManager();
            var tutorial = new TutorialManager(save);
            var seen = new List<string>();
            tutorial.TipReady += tip => seen.Add(tip.Key);

            tutorial.NotifyLevelStarted(1); // enqueues tut.move, shows it immediately
            tutorial.NotifyEvent(TutorialTrigger.GemCollected); // tut.gem_found becomes due while tut.move is still showing

            Assert.AreEqual(1, seen.Count, "Only one tip may be visible at a time.");
            Assert.AreEqual("tut.move", tutorial.Current.Key);

            tutorial.DismissCurrent();

            Assert.AreEqual(2, seen.Count);
            Assert.AreEqual("tut.gem_found", tutorial.Current.Key);
        }

        [Test]
        public void Tutorial_ClosingBadgerTip_ImmediatelyShowsWaitTip()
        {
            var save = new SaveManager();
            var tutorial = new TutorialManager(save);

            tutorial.NotifyLevelStarted(3);
            Assert.AreEqual("tut.badger", tutorial.Current.Key);

            tutorial.DismissCurrent();

            Assert.AreEqual("tut.wait", tutorial.Current.Key, "tut.wait must appear the instant tut.badger closes (§9.5).");
        }

        [Test]
        public void Tutorial_Levels5To7_NeverTriggerAnyTip()
        {
            var save = new SaveManager();
            var tutorial = new TutorialManager(save);
            bool fired = false;
            tutorial.TipReady += _ => fired = true;

            tutorial.NotifyLevelStarted(5);
            tutorial.NotifyLevelStarted(6);
            tutorial.NotifyLevelStarted(7);

            Assert.IsFalse(fired);
        }
    }
}
