using UnityEngine.UIElements;
using Spin.Model;

namespace Spin.View.Grid
{
    /// <summary>One rendered grid cell: a colored background (by CellType) plus a text glyph for any entity on it.</summary>
    public sealed class CellVisual : VisualElement
    {
        private static readonly string[] TypeClasses =
        {
            "cell-fixed", "cell-wall", "cell-floor", "cell-exit", "cell-spike", "cell-spike"
        };

        public Coord Coord { get; }
        private readonly Label _glyph;

        public CellVisual(Coord coord)
        {
            Coord = coord;
            AddToClassList("grid-cell");

            _glyph = new Label();
            _glyph.pickingMode = PickingMode.Ignore; // taps must resolve to this cell, not the label.
            Add(_glyph);
        }

        public void SetCellType(CellType type, bool highlighted)
        {
            foreach (var c in TypeClasses) RemoveFromClassList(c);
            RemoveFromClassList("cell-highlight");

            AddToClassList(TypeClasses[(int)type]);
            if (highlighted) AddToClassList("cell-highlight");
        }

        public void SetGlyph(string text) => _glyph.text = text ?? string.Empty;
    }
}
