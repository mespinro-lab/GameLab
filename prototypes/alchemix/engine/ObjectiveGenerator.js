/**
 * Procedural objective generation for endless mode.
 * Objectives are checked against a GameState snapshot — no direct game coupling.
 */

const TYPES = ['score', 'combo_count', 'combo_size', 'combo_type'];

/**
 * Generate a random objective appropriate for the given difficulty level (0-3).
 * @param {number} difficulty
 * @returns {{type:string, label:string, [key:string]: any}}
 */
export function generateObjective(difficulty = 0) {
  const type = TYPES[Math.floor(Math.random() * TYPES.length)];

  switch (type) {
    case 'score': {
      const target = (difficulty + 1) * 500;
      return { type, target, label: `Arriba a ${target} punts` };
    }
    case 'combo_count': {
      const target = 5 + difficulty * 3;
      return { type, target, label: `Completa ${target} combos` };
    }
    case 'combo_size': {
      // Size 3 always achievable; size 4/5 require higher difficulty
      const target = Math.min(3 + difficulty, 5);
      return { type, target, label: `Fes un combo de ${target} peces` };
    }
    case 'combo_type': {
      // 'pure' or 'chaos' only when difficulty allows multi-attr combos
      const ctype = difficulty >= 1 ? (Math.random() < 0.5 ? 'pure' : 'chaos') : 'pure';
      const count = 2 + difficulty;
      return { type, comboType: ctype, count, label: `Fes ${count} combos "${ctype}"` };
    }
  }
}

/**
 * Check whether an objective has been met given a game state snapshot.
 *
 * @param {{type:string, [key:string]: any}} objective
 * @param {{score:number, totalCombos:number, maxComboSize:number, comboTypeCounts:{[t:string]:number}}} state
 * @returns {boolean}
 */
export function checkObjective(objective, state) {
  switch (objective.type) {
    case 'score':       return state.score >= objective.target;
    case 'combo_count': return state.totalCombos >= objective.target;
    case 'combo_size':  return state.maxComboSize >= objective.target;
    case 'combo_type':
      return (state.comboTypeCounts[objective.comboType] ?? 0) >= objective.count;
  }
  return false;
}
