import { isValidCombo } from './ComboValidator.js';
import { MIN_COMBO, MAX_COMBO } from './constants.js';

/**
 * Returns true if the board grid contains at least one valid combo.
 *
 * This is a pure function with zero DOM access — safe to call from tests
 * and from external validators (e.g. Fable solvability auditor).
 *
 * Complexity: O(N choose MIN_COMBO) in the worst case. For a 5×8 board
 * (40 pieces), C(40,3)=9 880 iterations — well under 1 ms in practice.
 * For MIN_COMBO=5: C(40,5)=658 008 — still fast enough for refill checks.
 *
 * @param {(Piece|null)[][]} grid  - 2-D array [row][col]
 * @param {number[]} activeAttributes
 * @returns {boolean}
 */
export function hasAnyValidCombo(grid, activeAttributes) {
  return findFirstValidCombo(grid, activeAttributes) !== null;
}

/**
 * Returns the first valid combo found as an array of Piece objects, or null.
 * Iterates combos from smallest size upward so callers get the tightest combo.
 *
 * @param {(Piece|null)[][]} grid
 * @param {number[]} activeAttributes
 * @returns {Piece[]|null}
 */
export function findFirstValidCombo(grid, activeAttributes) {
  const pieces = grid.flat().filter(p => p !== null);

  for (let size = MIN_COMBO; size <= MAX_COMBO; size++) {
    const result = _searchCombinations(pieces, size, activeAttributes);
    if (result) return result;
  }
  return null;
}

/**
 * Same as findFirstValidCombo but returns position indices [{row, col}] alongside pieces,
 * so callers can highlight the hint on the board.
 *
 * @param {(Piece|null)[][]} grid
 * @param {number[]} activeAttributes
 * @returns {{pieces: Piece[], positions: {row:number,col:number}[]}|null}
 */
export function findFirstValidComboWithPositions(grid, activeAttributes) {
  const flat = [];
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] !== null) flat.push({ piece: grid[row][col], row, col });
    }
  }

  for (let size = MIN_COMBO; size <= MAX_COMBO; size++) {
    const result = _searchCombinationsWithMeta(flat, size, activeAttributes);
    if (result) return result;
  }
  return null;
}

// --- internal helpers ---

function _searchCombinations(pieces, size, activeAttributes) {
  const n = pieces.length;
  if (n < size) return null;

  const idx = Array.from({ length: size }, (_, i) => i);

  while (true) {
    const combo = idx.map(i => pieces[i]);
    if (isValidCombo(combo, activeAttributes)) return combo;

    // Advance lexicographic combination
    let i = size - 1;
    while (i >= 0 && idx[i] === n - size + i) i--;
    if (i < 0) break;
    idx[i]++;
    for (let j = i + 1; j < size; j++) idx[j] = idx[j - 1] + 1;
  }

  return null;
}

function _searchCombinationsWithMeta(flat, size, activeAttributes) {
  const n = flat.length;
  if (n < size) return null;

  const idx = Array.from({ length: size }, (_, i) => i);

  while (true) {
    const entries = idx.map(i => flat[i]);
    const combo = entries.map(e => e.piece);
    if (isValidCombo(combo, activeAttributes)) {
      return {
        pieces: combo,
        positions: entries.map(e => ({ row: e.row, col: e.col })),
      };
    }

    let i = size - 1;
    while (i >= 0 && idx[i] === n - size + i) i--;
    if (i < 0) break;
    idx[i]++;
    for (let j = i + 1; j < size; j++) idx[j] = idx[j - 1] + 1;
  }

  return null;
}
