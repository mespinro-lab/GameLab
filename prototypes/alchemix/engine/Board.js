import { Piece } from './Piece.js';
import { hasAnyValidCombo } from './SolvabilityChecker.js';
import { isValidCombo } from './ComboValidator.js';
import {
  DEFAULT_COLS, DEFAULT_ROWS, DEFAULT_VALUES_PER_ATTR, MAX_INJECT_ATTEMPTS,
} from './constants.js';

/**
 * Board model — pure logic, zero DOM.
 *
 * Grid convention:
 *   grid[row][col]  — row 0 = TOP (visually), row (rows-1) = BOTTOM
 *   Gravity moves pieces toward higher row indices (downward).
 *   After removal + gravity, nulls accumulate at the top and are filled by refill().
 */
export class Board {
  constructor({
    cols = DEFAULT_COLS,
    rows = DEFAULT_ROWS,
    activeAttributes = [0, 1],
    valuesPerAttr = DEFAULT_VALUES_PER_ATTR,
  } = {}) {
    this.cols = cols;
    this.rows = rows;
    this.activeAttributes = activeAttributes;
    this.valuesPerAttr = valuesPerAttr;
    this.grid = this._createEmptyGrid();
    this._fillAll();
  }

  // --- public API ---

  get(row, col) {
    return this.grid[row][col];
  }

  /**
   * Remove pieces at the given [row, col] positions.
   * @param {[number,number][]} positions
   * @returns {Piece[]} removed pieces (same order as positions)
   */
  removePieces(positions) {
    const removed = positions.map(([row, col]) => this.grid[row][col]);
    for (const [row, col] of positions) this.grid[row][col] = null;
    return removed;
  }

  /**
   * Apply gravity: non-null pieces fall toward the bottom (higher row index).
   * Nulls accumulate at the top.
   *
   * @returns {{from:[number,number], to:[number,number]}[]} movements for animation
   */
  applyGravity() {
    const movements = [];

    for (let col = 0; col < this.cols; col++) {
      // Collect non-null pieces from bottom to top (order = bottom-first)
      const stack = [];
      for (let row = this.rows - 1; row >= 0; row--) {
        if (this.grid[row][col] !== null) stack.push({ piece: this.grid[row][col], row });
      }

      // Rewrite column bottom-first; record movements
      for (let i = 0; i < this.rows; i++) {
        const targetRow = this.rows - 1 - i;
        const entry = stack[i] || null;
        const newPiece = entry ? entry.piece : null;
        if (entry && entry.row !== targetRow) {
          movements.push({ from: [entry.row, col], to: [targetRow, col] });
        }
        this.grid[targetRow][col] = newPiece;
      }
    }

    return movements;
  }

  /**
   * Fill all null cells with new random pieces.
   * Enforces the solvability invariant after filling.
   *
   * @returns {{row:number, col:number, piece:Piece}[]} newly placed pieces (for animation)
   */
  refill() {
    const newPieces = [];
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.grid[row][col] === null) {
          const piece = Piece.random(this.valuesPerAttr);
          this.grid[row][col] = piece;
          newPieces.push({ row, col, piece });
        }
      }
    }
    this._ensureSolvable();
    return newPieces;
  }

  isSolvable() {
    return hasAnyValidCombo(this.grid, this.activeAttributes);
  }

  /** Deep-copy the grid — used by the solvability auditor without mutating state. */
  cloneGrid() {
    return this.grid.map(row => row.map(p => (p ? p.clone() : null)));
  }

  // --- internal ---

  _createEmptyGrid() {
    return Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
  }

  _fillAll() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.grid[row][col] = Piece.random(this.valuesPerAttr);
      }
    }
    this._ensureSolvable();
  }

  /**
   * Guarantee ≥1 valid combo exists.
   * Strategy: try injecting a forced valid triple into 3 random positions.
   * Falls back to regenerating the full board after MAX_INJECT_ATTEMPTS failures.
   */
  _ensureSolvable() {
    if (hasAnyValidCombo(this.grid, this.activeAttributes)) return;

    for (let attempt = 0; attempt < MAX_INJECT_ATTEMPTS; attempt++) {
      this._injectForcedCombo();
      if (hasAnyValidCombo(this.grid, this.activeAttributes)) return;
    }

    // Hard fallback: regenerate entire board
    this._fillAll();
  }

  _injectForcedCombo() {
    const positions = this._pickRandomPositions(3);
    const triple = this._generateValidTriple();
    for (let i = 0; i < 3; i++) {
      const [row, col] = positions[i];
      this.grid[row][col] = triple[i];
    }
  }

  _pickRandomPositions(n) {
    const all = [];
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) all.push([row, col]);
    }
    // Fisher-Yates partial shuffle
    for (let i = 0; i < n; i++) {
      const j = i + Math.floor(Math.random() * (all.length - i));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all.slice(0, n);
  }

  /**
   * Generate 3 Pieces guaranteed to form a valid SET triple on all active attributes.
   * For each active attribute, independently decide all-same or all-different.
   */
  _generateValidTriple() {
    const attrMatrix = [[], [], [], []]; // attrMatrix[attrIdx][pieceIdx] = value

    for (let attrIdx = 0; attrIdx < 4; attrIdx++) {
      if (this.activeAttributes.includes(attrIdx)) {
        if (Math.random() < 0.5) {
          // all-same
          const v = Math.floor(Math.random() * this.valuesPerAttr);
          attrMatrix[attrIdx] = [v, v, v];
        } else {
          // all-different: values [0, 1, 2] (shuffled)
          const vals = [0, 1, 2];
          for (let i = 2; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [vals[i], vals[j]] = [vals[j], vals[i]];
          }
          attrMatrix[attrIdx] = vals;
        }
      } else {
        // non-active attribute: random, unconstrained
        attrMatrix[attrIdx] = Array.from({ length: 3 }, () =>
          Math.floor(Math.random() * this.valuesPerAttr)
        );
      }
    }

    return [0, 1, 2].map(i => new Piece([
      attrMatrix[0][i], attrMatrix[1][i], attrMatrix[2][i], attrMatrix[3][i],
    ]));
  }
}
