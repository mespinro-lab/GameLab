using System.Collections.Generic;
using UnityEngine.UIElements;
using Spin.Model;

namespace Spin.View.Grid
{
    /// <summary>Renders the 7x7 board (§3-4) from GridModel state. Full redraw each turn — cheap at this size.</summary>
    public sealed class GridView : VisualElement
    {
        private readonly CellVisual[,] _cells = new CellVisual[GridModel.Size, GridModel.Size];

        public GridModel Grid { get; private set; }

        public GridView()
        {
            AddToClassList("grid-container");

            for (int row = 0; row < GridModel.Size; row++)
            {
                var rowElement = new VisualElement();
                rowElement.AddToClassList("grid-row");

                for (int col = 0; col < GridModel.Size; col++)
                {
                    var cell = new CellVisual(new Coord(col, row));
                    _cells[col, row] = cell;
                    rowElement.Add(cell);
                }

                Add(rowElement);
            }
        }

        public void Bind(GridModel grid)
        {
            Grid = grid;
            RenderAll();
        }

        public CellVisual GetCell(Coord coord) => _cells[coord.Col, coord.Row];

        public void RenderAll(IReadOnlyCollection<Coord> highlighted = null)
        {
            if (Grid == null) return;

            for (int row = 0; row < GridModel.Size; row++)
            {
                for (int col = 0; col < GridModel.Size; col++)
                {
                    var coord = new Coord(col, row);
                    bool isHighlighted = highlighted != null && ContainsCoord(highlighted, coord);
                    var cell = _cells[col, row];
                    cell.SetCellType(Grid.GetCellType(coord), isHighlighted);
                    cell.SetGlyph(null);
                }
            }

            foreach (var enemy in Grid.Enemies)
                _cells[enemy.Position.Col, enemy.Position.Row].SetGlyph("B");

            _cells[Grid.SpinPosition.Col, Grid.SpinPosition.Row].SetGlyph("S");
        }

        private static bool ContainsCoord(IReadOnlyCollection<Coord> set, Coord value)
        {
            foreach (var c in set)
                if (c == value) return true;
            return false;
        }
    }
}
