/**
 * Difficulty presets for endless mode auto-ramp.
 *
 * activeAttributes: which attribute indices are enforced by the SET rule.
 *   Level 0-1: only Element + Potency (indices 0,1) → easy to scan
 *   Level 2:   + State (index 2) → medium
 *   Level 3:   all four (indices 0-3) + 4 values per attr → hard
 *
 * pourLimit: max refills before game-over in a session (null = unlimited).
 */
export const DIFFICULTY_PRESETS = [
  {
    level: 0, label: 'Principiant',
    activeAttributes: [0, 1],
    valuesPerAttr: 3,
    boardCols: 5, boardRows: 6,
    pourLimit: null,
  },
  {
    level: 1, label: 'Aprenent',
    activeAttributes: [0, 1, 2],
    valuesPerAttr: 3,
    boardCols: 5, boardRows: 7,
    pourLimit: 25,
  },
  {
    level: 2, label: 'Alquimista',
    activeAttributes: [0, 1, 2, 3],
    valuesPerAttr: 3,
    boardCols: 5, boardRows: 8,
    pourLimit: 20,
  },
  {
    level: 3, label: 'Mestre',
    activeAttributes: [0, 1, 2, 3],
    valuesPerAttr: 4,
    boardCols: 6, boardRows: 8,
    pourLimit: 15,
  },
];

/** @param {number} level */
export function getPreset(level) {
  return DIFFICULTY_PRESETS[Math.min(Math.max(0, level), DIFFICULTY_PRESETS.length - 1)];
}

/**
 * Score thresholds for automatic level-up in endless mode.
 * The UI can use this to suggest bumping difficulty mid-session.
 */
export function scoreToLevel(score) {
  if (score < 1000)  return 0;
  if (score < 5000)  return 1;
  if (score < 15000) return 2;
  return 3;
}
