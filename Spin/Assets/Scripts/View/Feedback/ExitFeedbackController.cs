using UnityEngine;
using Spin.Model;
using Spin.View.Grid;

namespace Spin.View.Feedback
{
    /// <summary>
    /// Player-facing "no" feedback (§9.4): exit-without-gem (vibration + sound + door wobble +
    /// gem silhouette, repeats every attempt) and generic illegal-action rejection (shake + sound).
    /// </summary>
    public sealed class ExitFeedbackController
    {
        private const int DoorWobbleMillis = 1000;

        private readonly GridView _gridView;
        private readonly AudioSource _audioSource;

        public AudioClip RejectionSound;
        public AudioClip DoorWobbleSound;

        public ExitFeedbackController(GridView gridView, AudioSource audioSource)
        {
            _gridView = gridView;
            _audioSource = audioSource;
        }

        public void OnTurnResolved(TurnResult result)
        {
            if (result.ExitAttemptedWithoutGem)
                PlayDoorWobble();
        }

        public void OnActionRejected(PlayerAction action)
        {
            if (_audioSource != null && RejectionSound != null)
                _audioSource.PlayOneShot(RejectionSound);
        }

        private void PlayDoorWobble()
        {
            Handheld.Vibrate();
            if (_audioSource != null && DoorWobbleSound != null)
                _audioSource.PlayOneShot(DoorWobbleSound);

            if (_gridView.Grid == null) return;

            var cell = _gridView.GetCell(_gridView.Grid.ExitCoord);
            cell.SetGlyph("💎");
            cell.AddToClassList("door-wobble");

            cell.schedule.Execute(() =>
            {
                cell.RemoveFromClassList("door-wobble");
                _gridView.RenderAll();
            }).ExecuteLater(DoorWobbleMillis);
        }
    }
}
