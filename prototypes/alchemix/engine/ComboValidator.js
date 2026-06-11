import { MIN_COMBO, MAX_COMBO } from './constants.js';

/**
 * A combo is valid when:
 *   - 3 to 5 pieces
 *   - For each active attribute: all values are equal OR all values are distinct
 *
 * Note: "all distinct" with N pieces requires N different values. With 3 values
 * per attribute, "all distinct" is only possible for combos of exactly 3 pieces.
 * For size 4-5, only "all same" satisfies the rule per attribute.
 * At difficulty 4 (valuesPerAttr=4), "all distinct" becomes possible for size 4.
 *
 * @param {Piece[]} pieces
 * @param {number[]} activeAttributes - attribute indices to check
 * @returns {boolean}
 */
export function isValidCombo(pieces, activeAttributes) {
  if (pieces.length < MIN_COMBO || pieces.length > MAX_COMBO) return false;

  for (const attrIdx of activeAttributes) {
    const values = pieces.map(p => p.attrs[attrIdx]);
    const uniqueCount = new Set(values).size;
    // Valid only if all-same (uniqueCount===1) or all-distinct (uniqueCount===pieces.length)
    if (uniqueCount !== 1 && uniqueCount !== pieces.length) return false;
  }

  return true;
}

/**
 * Returns 'pure' (all attrs same), 'chaos' (all attrs distinct), or 'mixed'.
 * Assumes the combo is already valid.
 *
 * @param {Piece[]} pieces
 * @param {number[]} activeAttributes
 * @returns {'pure'|'chaos'|'mixed'}
 */
export function comboType(pieces, activeAttributes) {
  let allSame = true;
  let allDiff = true;

  for (const attrIdx of activeAttributes) {
    const values = pieces.map(p => p.attrs[attrIdx]);
    const uniqueCount = new Set(values).size;
    if (uniqueCount !== 1)            allSame = false;
    if (uniqueCount !== pieces.length) allDiff = false;
  }

  if (allSame) return 'pure';
  if (allDiff) return 'chaos';
  return 'mixed';
}
