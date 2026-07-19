using System;
using System.Collections.Generic;
using Spin.Level;
using Spin.Model.Strategies;

namespace Spin.Model
{
    /// <summary>Grid state + passability queries (§4, §12). Owns all cell/entity-position mutation.</summary>
    public sealed class GridModel
    {
        public const int Size = 7;

        private readonly CellType[,] _cells = new CellType[Size, Size];
        private readonly List<EnemyEntity> _enemies;
        private Coord? _gemCoord;

        public Coord SpinPosition { get; private set; }
        public Coord ExitCoord { get; }
        public IReadOnlyList<EnemyEntity> Enemies => _enemies;

        /// <summary>True while the gem is still on the board (uncollected).</summary>
        public bool HasUncollectedGem => _gemCoord.HasValue;

        public GridModel(LevelData level)
        {
            for (int row = 0; row < Size; row++)
            {
                string rowChars = level.Grid[row];
                for (int col = 0; col < Size; col++)
                    _cells[col, row] = CharToCellType(rowChars[col]);
            }

            SpinPosition = level.Spawn;
            _cells[level.Spawn.Col, level.Spawn.Row] = CellType.Floor;

            ExitCoord = level.Exit;
            _cells[level.Exit.Col, level.Exit.Row] = CellType.Exit;

            _gemCoord = level.Diamond;

            _enemies = new List<EnemyEntity>(level.Enemies.Count);
            foreach (var e in level.Enemies)
                _enemies.Add(new EnemyEntity(e.Order, e.Type, e.Start, e.Axis, e.InitialDirection, new PatrolStrategy()));
            _enemies.Sort((a, b) => a.Order.CompareTo(b.Order));
        }

        private static CellType CharToCellType(char c)
        {
            switch (c)
            {
                case '#': return CellType.Fixed;
                case '%': return CellType.ThinWall;
                case '.': return CellType.Floor;
                case 'S': return CellType.Floor;
                case 'E': return CellType.Exit;
                case '*': return CellType.WildSpike;
                default: throw new ArgumentOutOfRangeException(nameof(c), c, "Unknown grid character");
            }
        }

        public bool IsInBounds(Coord c) => c.Col >= 0 && c.Col < Size && c.Row >= 0 && c.Row < Size;

        public CellType GetCellType(Coord c) => _cells[c.Col, c.Row];

        /// <summary>R1, R10: floor, exit, and any spikes cell (Spín is immune to spikes).</summary>
        public bool CanSpinEnter(Coord c)
        {
            if (!IsInBounds(c)) return false;
            var t = GetCellType(c);
            return t == CellType.Floor || t == CellType.Exit || t == CellType.PlacedSpike || t == CellType.WildSpike;
        }

        /// <summary>R8, R9, R14: fixed blocks, thin walls, any spikes, off-grid, or another enemy.</summary>
        public bool IsEnemyObstacle(Coord c)
        {
            if (!IsInBounds(c)) return true;
            var t = GetCellType(c);
            if (t == CellType.Fixed || t == CellType.ThinWall || t == CellType.PlacedSpike || t == CellType.WildSpike)
                return true;
            return HasEnemyAt(c);
        }

        public bool HasEnemyAt(Coord c)
        {
            foreach (var e in _enemies)
                if (e.Position == c) return true;
            return false;
        }

        /// <summary>R5: clears the gem if present at c. Idempotent — returns false once already collected.</summary>
        public bool TryCollectGem(Coord c)
        {
            if (!_gemCoord.HasValue || _gemCoord.Value != c) return false;
            _gemCoord = null;
            return true;
        }

        public bool CanBreakWallAt(Coord c) => IsInBounds(c) && GetCellType(c) == CellType.ThinWall;

        /// <summary>R2: permanent, Spín does not move.</summary>
        public void BreakWall(Coord c) => _cells[c.Col, c.Row] = CellType.Floor;

        /// <summary>R3: adjacent, open floor, no enemy present, and never the exit cell.</summary>
        public bool CanPlaceSpikeAt(Coord c)
        {
            if (!IsInBounds(c)) return false;
            if (c == ExitCoord) return false;
            if (GetCellType(c) != CellType.Floor) return false;
            if (HasEnemyAt(c)) return false;
            return true;
        }

        /// <summary>R3, R7: permanent once placed.</summary>
        public void PlaceSpike(Coord c) => _cells[c.Col, c.Row] = CellType.PlacedSpike;

        /// <summary>R6: idempotent — returns false if c isn't (or is no longer) a wild spike cell.</summary>
        public bool CollectWildSpike(Coord c)
        {
            if (GetCellType(c) != CellType.WildSpike) return false;
            _cells[c.Col, c.Row] = CellType.Floor;
            return true;
        }

        public void MoveSpin(Coord to) => SpinPosition = to;

        public void MoveEnemy(EnemyEntity enemy, Coord to) => enemy.Position = to;
    }
}
