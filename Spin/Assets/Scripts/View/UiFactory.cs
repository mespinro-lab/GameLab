using System;
using UnityEngine.UIElements;

namespace Spin.View
{
    /// <summary>Small helpers to keep screen controllers terse — no design-system ambition beyond that.</summary>
    internal static class UiFactory
    {
        public static VisualElement Screen()
        {
            var root = new VisualElement();
            root.AddToClassList("screen");
            return root;
        }

        public static Label Title(string text)
        {
            var label = new Label(text);
            label.AddToClassList("title");
            return label;
        }

        public static Button ActionButton(string text, Action onClick)
        {
            var button = new Button(onClick) { text = text };
            button.AddToClassList("action-button");
            return button;
        }
    }
}
