'use strict';

// ── Tutorial levels ───────────────────────────────────────────────────────────
const TUTORIAL_LEVELS = [
  {
    id: 'T1', name: 'Tutorial I', subtitle: 'Tot igual',
    rows: 3, cols: 3, tutorial: true, boardPreset: 'allSame',
    instruction: 'Selecciona 3 tiles del mateix color i símbol. Quan almenys un atribut és tot igual, el grup és vàlid.',
    attributes: [
      { name: 'element',  visual: 'background', values: ['fire',   'water',  'earth']  },
      { name: 'catalyst', visual: 'symbol',     values: ['copper', 'silver', 'gold']   },
    ],
    minCombo: 3, maxCombo: 3, color: '#34495e', difficulty: 0, icon: '○',
  },
  {
    id: 'T2', name: 'Tutorial II', subtitle: 'Atributs independents',
    rows: 3, cols: 3, tutorial: true,
    instruction: 'Ara color i símbol no coincideixen sempre. Busca grups on almenys un atribut sigui tot igual o tot diferent.',
    attributes: [
      { name: 'element',  visual: 'background', values: ['fire',   'water',  'earth']  },
      { name: 'catalyst', visual: 'symbol',     values: ['copper', 'silver', 'gold']   },
    ],
    minCombo: 3, maxCombo: 3, color: '#34495e', difficulty: 0, icon: '○',
  },
  {
    id: 'T3', name: 'Tutorial III', subtitle: 'Tot diferent',
    rows: 3, cols: 3, tutorial: true,
    instruction: 'Prova ara a trobar grups on les 3 tiles siguin totes DIFERENTS en almenys un atribut.',
    attributes: [
      { name: 'element',  visual: 'background', values: ['fire',   'water',  'earth']  },
      { name: 'catalyst', visual: 'symbol',     values: ['copper', 'silver', 'gold']   },
    ],
    minCombo: 3, maxCombo: 3, color: '#34495e', difficulty: 0, icon: '○',
  },
  {
    id: 'T4', name: 'Tutorial IV', subtitle: 'Joc lliure',
    rows: 3, cols: 3, tutorial: true,
    instruction: 'Aplica tot el que has après. Les tiles grises no formen cap grup vàlid ara mateix. Buida el tauler!',
    attributes: [
      { name: 'element',  visual: 'background', values: ['fire',   'water',  'earth']  },
      { name: 'catalyst', visual: 'symbol',     values: ['copper', 'silver', 'gold']   },
    ],
    minCombo: 3, maxCombo: 3, color: '#34495e', difficulty: 0, icon: '○',
  },
  {
    id: 'T5', name: 'Tutorial V', subtitle: 'Tercer atribut',
    rows: 3, cols: 3, tutorial: true,
    instruction: 'La fase (I · II · III) és un tercer atribut. La mateixa regla s\'aplica: almenys un atribut ha de ser tot igual o tot diferent.',
    attributes: [
      { name: 'element',  visual: 'background', values: ['fire',   'water',  'earth']  },
      { name: 'catalyst', visual: 'symbol',     values: ['copper', 'silver', 'gold']   },
      { name: 'phase',    visual: 'phase',      values: ['I',      'II',     'III']    },
    ],
    minCombo: 3, maxCombo: 3, color: '#34495e', difficulty: 0, icon: '○',
  },
];

// ── Game levels ───────────────────────────────────────────────────────────────
const GAME_LEVELS = [
  {
    id: 1, name: 'Novice', subtitle: 'Discover harmony',
    rows: 3, cols: 3,
    attributes: [
      { name: 'element',  visual: 'background', values: ['fire',   'water',  'earth']  },
      { name: 'catalyst', visual: 'symbol',     values: ['copper', 'silver', 'gold']   },
    ],
    minCombo: 3, maxCombo: 3, color: '#27ae60', difficulty: 1, icon: '◇',
  },
  {
    id: 2, name: 'Apprentice', subtitle: 'A third dimension',
    rows: 3, cols: 3,
    attributes: [
      { name: 'element',  visual: 'background', values: ['fire',   'water',  'earth']  },
      { name: 'catalyst', visual: 'symbol',     values: ['copper', 'silver', 'gold']   },
      { name: 'phase',    visual: 'phase',      values: ['I',      'II',     'III']    },
    ],
    minCombo: 3, maxCombo: 3, color: '#2980b9', difficulty: 2, icon: '◈',
  },
  {
    id: 3, name: 'Adept', subtitle: 'Four forces, two paths',
    rows: 4, cols: 4,
    attributes: [
      { name: 'element',  visual: 'background', values: ['fire',   'water',  'earth', 'air']     },
      { name: 'catalyst', visual: 'symbol',     values: ['copper', 'silver', 'gold',  'mercury'] },
    ],
    minCombo: 3, maxCombo: 4, color: '#8e44ad', difficulty: 3, icon: '◆',
  },
  {
    id: 4, name: 'Scholar', subtitle: 'Four forces, three dimensions',
    rows: 4, cols: 4,
    attributes: [
      { name: 'element',  visual: 'background', values: ['fire',   'water',  'earth', 'air']     },
      { name: 'catalyst', visual: 'symbol',     values: ['copper', 'silver', 'gold',  'mercury'] },
      { name: 'phase',    visual: 'phase',      values: ['I',      'II',     'III',   'IV']      },
    ],
    minCombo: 3, maxCombo: 4, color: '#d35400', difficulty: 4, icon: '⬡',
  },
  {
    id: 5, name: 'Alchemist', subtitle: 'All five forces converge',
    rows: 5, cols: 5,
    attributes: [
      { name: 'element',  visual: 'background', values: ['fire',   'water',  'earth', 'air',  'aether'] },
      { name: 'catalyst', visual: 'symbol',     values: ['copper', 'silver', 'gold',  'mercury', 'iron'] },
    ],
    minCombo: 3, maxCombo: 5, color: '#c0392b', difficulty: 5, icon: '★',
  },
];

const LEVELS = [...TUTORIAL_LEVELS, ...GAME_LEVELS];

// ── Board generation (guaranteed solvable) ────────────────────────────────────
function generateBoard(level) {
  if (level.boardPreset === 'allSame') return generateAllSameBoard(level);
  const total  = level.rows * level.cols;
  const groups = partitionIntoGroups(total, level.minCombo, level.maxCombo);
  const tiles  = [];
  for (const size of groups) tiles.push(...generateGroup(size, level.attributes));
  return shuffle(tiles);
}

function generateAllSameBoard(level) {
  // Each group: all tiles identical (same value for every attribute, paired by index)
  const groupSize = level.minCombo;
  const numGroups = (level.rows * level.cols) / groupSize;
  const tiles = [];
  for (let g = 0; g < numGroups; g++) {
    const tile = {};
    level.attributes.forEach(attr => { tile[attr.name] = attr.values[g % attr.values.length]; });
    for (let k = 0; k < groupSize; k++) tiles.push({ ...tile });
  }
  return shuffle(tiles);
}

function partitionIntoGroups(total, min, max) {
  const groups = [];
  let rem = total;
  while (rem > 0) {
    const options = [];
    for (let s = min; s <= Math.min(max, rem); s++) {
      const left = rem - s;
      if (left === 0 || left >= min) options.push(s);
    }
    if (!options.length) throw new Error(`Cannot partition ${rem} (min=${min} max=${max})`);
    const pick = options[Math.floor(Math.random() * options.length)];
    groups.push(pick);
    rem -= pick;
  }
  return groups;
}

function generateGroup(size, attributes) {
  const tiles = Array.from({ length: size }, () => ({}));
  for (const attr of attributes) {
    const vals    = attr.values;
    const canDiff = vals.length >= size;
    const allDiff = canDiff && Math.random() < 0.5;
    if (allDiff) {
      const picked = shuffle([...vals]).slice(0, size);
      tiles.forEach((t, i) => { t[attr.name] = picked[i]; });
    } else {
      const val = vals[Math.floor(Math.random() * vals.length)];
      tiles.forEach(t => { t[attr.name] = val; });
    }
  }
  return tiles;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Stars ─────────────────────────────────────────────────────────────────────
function calcStars(elapsed) {
  if (elapsed < 60)  return 3;
  if (elapsed < 120) return 2;
  return 1;
}

// ── localStorage ──────────────────────────────────────────────────────────────
function getLevelSave(levelId) {
  try { return JSON.parse(localStorage.getItem(`alchemix_L${levelId}`)) || {}; }
  catch { return {}; }
}

function saveLevelResult(levelId, { time, score, stars }) {
  const prev = getLevelSave(levelId);
  const next = {
    completed: true,
    stars:     Math.max(prev.stars || 0, stars || 0),
    bestTime:  (prev.bestTime == null || time < prev.bestTime) ? time : prev.bestTime,
    bestScore: Math.max(prev.bestScore || 0, score || 0),
  };
  try { localStorage.setItem(`alchemix_L${levelId}`, JSON.stringify(next)); }
  catch {}
  return next;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function renderStars(n) {
  return '★'.repeat(n) + '☆'.repeat(3 - n);
}
