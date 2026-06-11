import { isValidCombo, comboType } from '../engine/ComboValidator.js';
import { Piece } from '../engine/Piece.js';
import { assert, assertEqual, describe, it } from './test-helpers.js';

function p(...attrs) { return new Piece(attrs); }

describe('isValidCombo — size constraints', () => {
  it('rejects size 2', () => {
    assert(!isValidCombo([p(0,0,0,0), p(0,0,0,0)], [0]), 'size 2 → rejected');
  });
  it('accepts size 3', () => {
    assert(isValidCombo([p(0,0,0,0), p(0,0,0,0), p(0,0,0,0)], [0]), 'size 3 all-same → accepted');
  });
  it('accepts size 5', () => {
    assert(isValidCombo([p(0,0,0,0), p(0,0,0,0), p(0,0,0,0), p(0,0,0,0), p(0,0,0,0)], [0]), 'size 5 all-same → accepted');
  });
  it('rejects size 6', () => {
    assert(!isValidCombo(Array(6).fill(p(0,0,0,0)), [0]), 'size 6 → rejected');
  });
});

describe('isValidCombo — single active attribute', () => {
  it('all-same accepted', () => {
    assert(isValidCombo([p(0,1,2,0), p(0,2,0,1), p(0,0,1,2)], [0]), 'elem all-same');
  });
  it('all-diff accepted (size 3)', () => {
    assert(isValidCombo([p(0,0,0,0), p(1,0,0,0), p(2,0,0,0)], [0]), 'elem 0,1,2 all-diff');
  });
  it('mixed (2 same + 1 diff) rejected', () => {
    assert(!isValidCombo([p(0,0,0,0), p(0,0,0,0), p(1,0,0,0)], [0]), '0,0,1 → rejected');
  });
  it('all-diff impossible for size 4 with 3 values', () => {
    // 0,1,2,0 → 3 unique ≠ 4 pieces → not all-same (1), not all-diff (4) → invalid
    assert(!isValidCombo([p(0,0,0,0), p(1,0,0,0), p(2,0,0,0), p(0,0,0,0)], [0]), 'size 4 all-diff impossible with 3 values');
  });
  it('size 4 all-same accepted', () => {
    assert(isValidCombo([p(1,0,0,0), p(1,1,1,1), p(1,2,2,2), p(1,0,2,1)], [0]), 'size 4 all-same elem');
  });
});

describe('isValidCombo — two active attributes', () => {
  it('both all-same', () => {
    assert(isValidCombo([p(0,0,2,1), p(0,0,0,2), p(0,0,1,0)], [0,1]), 'elem 0,0,0 + pot 0,0,0');
  });
  it('both all-diff', () => {
    assert(isValidCombo([p(0,0,0,0), p(1,1,0,0), p(2,2,0,0)], [0,1]), 'elem 0,1,2 + pot 0,1,2');
  });
  it('one all-same, one all-diff', () => {
    assert(isValidCombo([p(0,0,0,0), p(0,1,0,0), p(0,2,0,0)], [0,1]), 'elem 0,0,0 + pot 0,1,2');
  });
  it('one attr mixed → rejected', () => {
    // elem: 0,1,0 → mixed (2+1)
    assert(!isValidCombo([p(0,0,0,0), p(1,1,0,0), p(0,2,0,0)], [0,1]), 'elem mixed → rejected');
  });
});

describe('isValidCombo — four active attributes', () => {
  it('chaos triple (all 4 attrs all-diff)', () => {
    assert(isValidCombo([p(0,0,0,0), p(1,1,1,1), p(2,2,2,2)], [0,1,2,3]), 'chaos triple');
  });
  it('pure triple (all 4 attrs all-same)', () => {
    assert(isValidCombo([p(1,2,0,1), p(1,2,0,1), p(1,2,0,1)], [0,1,2,3]), 'pure triple');
  });
  it('invalid when one attr mixed', () => {
    // origin: 0,1,0 → mixed
    assert(!isValidCombo([p(0,0,0,0), p(1,1,1,1), p(2,2,2,0)], [0,1,2,3]), 'one mixed attr → rejected');
  });
});

describe('comboType', () => {
  it('pure: all attrs same', () => {
    assertEqual(comboType([p(0,0,0,0), p(0,0,0,0), p(0,0,0,0)], [0,1,2,3]), 'pure', 'pure');
  });
  it('chaos: all attrs diff', () => {
    assertEqual(comboType([p(0,0,0,0), p(1,1,1,1), p(2,2,2,2)], [0,1,2,3]), 'chaos', 'chaos');
  });
  it('mixed: some same, some diff', () => {
    assertEqual(comboType([p(0,0,0,0), p(0,1,1,1), p(0,2,2,2)], [0,1,2,3]), 'mixed', 'mixed');
  });
  it('single active attr all-same → pure', () => {
    assertEqual(comboType([p(0,1,2,0), p(0,2,0,1), p(0,0,1,2)], [0]), 'pure', 'single attr same → pure');
  });
  it('single active attr all-diff → chaos', () => {
    assertEqual(comboType([p(0,0,0,0), p(1,0,0,0), p(2,0,0,0)], [0]), 'chaos', 'single attr diff → chaos');
  });
});
