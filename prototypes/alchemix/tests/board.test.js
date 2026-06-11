import { Board } from '../engine/Board.js';
import { assert, assertEqual, describe, it } from './test-helpers.js';

describe('Board — gravity', () => {
  it('pieces fall to the bottom after removal', () => {
    const board = new Board({ cols: 1, rows: 4, activeAttributes: [0, 1] });
    // Force a known column: set col 0 to [A, B, null, C] (rows 0-3)
    const { Piece } = board.grid[0][0].constructor === Object
      ? { Piece: null }
      : { Piece: board.grid[0][0].constructor };

    // Directly set a predictable state
    const snapshot = board.grid.map(row => [...row]);
    board.grid[0][0] = snapshot[0][0]; // A (row 0)
    board.grid[1][0] = snapshot[1][0]; // B (row 1)
    board.grid[2][0] = null;           // empty
    board.grid[3][0] = snapshot[3][0]; // C (row 3, already at bottom)

    board.applyGravity();

    // After gravity: bottom (row 3) = C, row 2 = B, row 1 = A, row 0 = null
    assert(board.grid[0][0] === null, 'top cell empty after gravity');
    assert(board.grid[1][0] !== null, 'row 1 filled');
    assert(board.grid[2][0] !== null, 'row 2 filled');
    assert(board.grid[3][0] !== null, 'row 3 filled (was at bottom)');
  });

  it('gravity returns movement records', () => {
    const board = new Board({ cols: 1, rows: 3, activeAttributes: [0] });
    board.grid[0][0] = board.grid[0][0]; // leave as-is
    board.grid[1][0] = null;             // gap
    const movements = board.applyGravity();
    // At least the piece from row 0 should have moved (unless already at bottom)
    assert(Array.isArray(movements), 'returns array');
  });
});

describe('Board — removePieces', () => {
  it('sets removed cells to null', () => {
    const board = new Board({ cols: 3, rows: 3, activeAttributes: [0] });
    board.removePieces([[0,0],[1,1],[2,2]]);
    assert(board.grid[0][0] === null, 'row0,col0 null');
    assert(board.grid[1][1] === null, 'row1,col1 null');
    assert(board.grid[2][2] === null, 'row2,col2 null');
  });

  it('returns the removed pieces', () => {
    const board = new Board({ cols: 2, rows: 2, activeAttributes: [0] });
    const piece = board.grid[0][0];
    const removed = board.removePieces([[0,0]]);
    assertEqual(removed[0], piece, 'correct piece returned');
  });
});

describe('Board — refill', () => {
  it('fills all null cells', () => {
    const board = new Board({ cols: 3, rows: 3, activeAttributes: [0] });
    board.removePieces([[0,0],[1,1],[2,2]]);
    board.applyGravity();
    board.refill();
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        assert(board.grid[row][col] !== null, `cell [${row},${col}] refilled`);
      }
    }
  });

  it('returns list of new pieces with positions', () => {
    const board = new Board({ cols: 2, rows: 2, activeAttributes: [0] });
    board.removePieces([[0,0],[0,1]]);
    board.applyGravity();
    const newPieces = board.refill();
    assert(newPieces.length >= 1, 'at least 1 new piece reported');
    for (const np of newPieces) {
      assert('row' in np && 'col' in np && 'piece' in np, 'new piece has row/col/piece');
    }
  });
});

describe('Board — cloneGrid', () => {
  it('clone is independent from original', () => {
    const board = new Board({ cols: 2, rows: 2, activeAttributes: [0] });
    const clone = board.cloneGrid();
    const original = board.grid[0][0];
    board.grid[0][0] = null;
    assert(clone[0][0] !== null, 'clone not affected by mutation of original');
    assert(clone[0][0] !== original, 'clone is a deep copy (different object ref)');
  });
});
