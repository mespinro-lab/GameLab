using System;

namespace Spin.Model
{
    /// <summary>
    /// A cell on the 7x7 grid. Col 0-6 maps to A-G, Row 0-6 maps to 1-7 (§3).
    /// </summary>
    public readonly struct Coord : IEquatable<Coord>
    {
        public readonly int Col;
        public readonly int Row;

        public Coord(int col, int row)
        {
            Col = col;
            Row = row;
        }

        /// <summary>Parses labels like "D4" (letter A-G, digit 1-7).</summary>
        public static bool TryParseLabel(string label, out Coord coord)
        {
            coord = default;
            if (string.IsNullOrEmpty(label) || label.Length != 2) return false;

            char colChar = char.ToUpperInvariant(label[0]);
            char rowChar = label[1];
            if (colChar < 'A' || colChar > 'G') return false;
            if (rowChar < '1' || rowChar > '7') return false;

            coord = new Coord(colChar - 'A', rowChar - '1');
            return true;
        }

        public static Coord ParseLabel(string label)
        {
            if (!TryParseLabel(label, out var coord))
                throw new FormatException($"Invalid cell label '{label}'. Expected letter A-G followed by digit 1-7.");
            return coord;
        }

        public string Label => $"{(char)('A' + Col)}{Row + 1}";

        public Coord Offset(Direction direction)
        {
            switch (direction)
            {
                case Direction.Up: return new Coord(Col, Row - 1);
                case Direction.Down: return new Coord(Col, Row + 1);
                case Direction.Left: return new Coord(Col - 1, Row);
                case Direction.Right: return new Coord(Col + 1, Row);
                default: throw new ArgumentOutOfRangeException(nameof(direction), direction, null);
            }
        }

        public bool Equals(Coord other) => Col == other.Col && Row == other.Row;
        public override bool Equals(object obj) => obj is Coord other && Equals(other);
        public override int GetHashCode() => Col * 31 + Row;
        public override string ToString() => Label;

        public static bool operator ==(Coord a, Coord b) => a.Equals(b);
        public static bool operator !=(Coord a, Coord b) => !a.Equals(b);
    }
}
