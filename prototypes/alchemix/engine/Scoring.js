import { comboType } from './ComboValidator.js';
import { SCORE_BY_SIZE, SCORE_TYPE_MULT, SCORE_CASCADE_BASE } from './constants.js';

/**
 * Calculate score for a single combo.
 *
 * @param {Piece[]} pieces
 * @param {number[]} activeAttributes
 * @param {number} cascadeLevel - 0 for the first (player-triggered) combo
 * @returns {number}
 */
export function calculateComboScore(pieces, activeAttributes, cascadeLevel = 0) {
  const size  = pieces.length;
  const type  = comboType(pieces, activeAttributes);
  const base  = SCORE_BY_SIZE[size] ?? 100;
  const mult  = SCORE_TYPE_MULT[type] ?? 1.0;
  const casc  = cascadeLevel > 0 ? Math.pow(SCORE_CASCADE_BASE, cascadeLevel) : 1.0;

  return Math.round(base * mult * casc);
}
