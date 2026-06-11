import { hasAnyValidCombo, findFirstValidCombo, findFirstValidComboWithPositions } from '../engine/SolvabilityChecker.js';
import { Piece } from '../engine/Piece.js';
import { assert, assertEqual, describe, it } from './test-helpers.js';

function p(...attrs) { return new Piece(attrs); }

// Build a minimal 3-row × 3-col grid from a flat array of pieces (row-major)
function makeGrid(rows, cols, pieces) {
  const grid = [];
  for (let r = 0; r < rows; r++) {
    grid.push(pieces.slice(r * cols, r * cols + cols));
  }
  return grid;
}

describe('hasAnyValidCombo', () => {
  it('detects valid combo in a simple 1×3 grid', () => {
    // All three pieces have element=0 (all-same on attr 0)
    const grid = makeGrid(1, 3, [p(0,0,0,0), p(0,1,2,0), p(0,2,1,0)]);
    assert(hasAnyValidCombo(grid, [0]), '3 same-element pieces → solvable');
  });

  it('returns false when no combo exists', () => {
    // 3 pieces: elements 0,0,1 → not all-same (1≠3), not all-diff → invalid
    const grid = makeGrid(1, 3, [p(0,0,0,0), p(0,1,0,0), p(1,2,0,0)]);
    // attr 0 values: 0,0,1 → unique=2, not 1 (all-same) and not 3 (all-diff) → invalid
    assert(!hasAnyValidCombo(grid, [0]), 'mixed elements → not solvable');
  });

  it('detects a hidden valid triple in a larger grid', () => {
    // 3×3 grid where only positions (0,0),(1,0),(2,0) form a valid combo
    const pieces = [
      p(0,0,0,0), p(1,0,0,0), p(2,0,0,0),  // col 0: elem 0,1,2
      p(0,0,0,0), p(0,0,0,0), p(1,0,0,0),  // cols 1-2: mixed on row
      p(0,0,0,0), p(1,0,0,0), p(0,0,0,0),
    ];
    // col0 (row0-row2) = [p(0,...),p(1,...),p(2,...)] → all-diff on attr 0 → valid
    const grid = makeGrid(3, 3, pieces);
    assert(hasAnyValidCombo(grid, [0]), 'col-0 all-diff triple found');
  });

  it('handles null cells', () => {
    const grid = [[p(0,0,0,0), null, p(0,0,0,0)], [p(0,0,0,0), null, null]];
    assert(hasAnyValidCombo(grid, [0]), 'nulls ignored; 3 same-element pieces found');
  });
});

describe('findFirstValidCombo', () => {
  it('returns null when no combo exists', () => {
    const grid = makeGrid(1, 2, [p(0,0,0,0), p(1,0,0,0)]);
    assertEqual(findFirstValidCombo(grid, [0]), null, 'size-2 grid → null');
  });

  it('returns size-3 combo when available', () => {
    const grid = makeGrid(1, 3, [p(0,0,0,0), p(0,1,0,0), p(0,2,0,0)]);
    const result = findFirstValidCombo(grid, [0]);
    assert(result !== null, 'combo found');
    assertEqual(result.length, 3, 'combo size is 3');
  });

  it('prefers smaller combo over larger one', () => {
    // 5 pieces all with elem=0 → valid combos of size 3,4,5 all exist;
    // function should return size 3
    const grid = makeGrid(1, 5, [p(0,0,0,0), p(0,1,0,0), p(0,2,0,0), p(0,0,1,0), p(0,1,1,0)]);
    const result = findFirstValidCombo(grid, [0]);
    assert(result !== null, 'combo found');
    assertEqual(result.length, 3, 'size 3 returned first');
  });
});

describe('findFirstValidComboWithPositions', () => {
  it('returns positions alongside pieces', () => {
    const grid = makeGrid(2, 3, [
      p(0,0,0,0), p(1,0,0,0), p(2,0,0,0),
      p(0,0,0,0), p(0,0,0,0), p(0,0,0,0),
    ]);
    const result = findFirstValidComboWithPositions(grid, [0]);
    assert(result !== null, 'result found');
    assert(Array.isArray(result.positions), 'positions is array');
    assertEqual(result.positions.length, result.pieces.length, 'pieces and positions same length');
    // Each position should be a valid grid coordinate
    for (const { row, col } of result.positions) {
      assert(row >= 0 && row < 2 && col >= 0 && col < 3, `position [${row},${col}] in bounds`);
    }
  });
});

describe('solvability invariant — Board._ensureSolvable', () => {
  it('a Board constructed with default settings is always solvable', async () => {
    // Dynamic import to avoid polluting this module with Board side-effects
    const { Board } = await import('../engine/Board.js');
    let allSolvable = true;
    for (let i = 0; i < 20; i++) {
      const board = new Board({ cols: 5, rows: 6, activeAttributes: [0, 1] });
      if (!board.isSolvable()) { allSolvable = false; break; }
    }
    assert(allSolvable, '20 fresh boards all solvable');
  });

  it('a Board remains solvable after refill', async () => {
    const { Board } = await import('../engine/Board.js');
    const board = new Board({ cols: 5, rows: 6, activeAttributes: [0, 1] });
    // Remove an arbitrary row to force a refill
    board.removePieces([[0,0],[0,1],[0,2]]);
    board.applyGravity();
    board.refill();
    assert(board.isSolvable(), 'board solvable after removePieces + gravity + refill');
  });
});
