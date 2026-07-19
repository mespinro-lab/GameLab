using UnityEngine.UIElements;

namespace Spin.View
{
    /// <summary>Builds and owns one screen's VisualElement tree; ScreenManager shows/hides it.</summary>
    public interface IScreenController
    {
        VisualElement Root { get; }
        void OnShow();
        void OnHide();
    }
}
