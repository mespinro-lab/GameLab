'use strict';

const LEVELS = [
  {
    id: 1,
    name: 'Novice',
    subtitle: 'Discover harmony',
    rows: 3, cols: 3,
    attributes: [
      { name: 'element',  visual: 'background', values: ['fire',   'water',  'earth']  },
      { name: 'catalyst', visual: 'symbol',     values: ['copper', 'silver', 'gold']   },
    ],
    minCombo: 3, maxCombo: 3,
    color: '#27ae60', difficulty: 1, icon: '◇',
  },
  {
    id: 2,
    name: 'Apprentice',
    subtitle: 'A third dimension',
    rows: 3, cols: 3,
    attributes: [
      { name: 'element',  visual: 'background', values: ['fire',   'water',  'earth']  },
      { name: 'catalyst', visual: 'symbol',     values: ['copper', 'silver', 'gold']   },
      { name: 'phase',    visual: 'phase',      values: ['I',      'II',     'III']    },
    ],
    minCombo: 3, maxCombo: 3,
    color: '#2980b9', difficulty: 2, icon: '◈',
  },
  {
    id: 3,
    name: 'Adept',
    subtitle: 'Four forces, two paths',
    rows: 4, cols: 4,
    attributes: [
      { name: 'element',  visual: 'background', values: ['fire',   'water',  'earth', 'air']     },
      { name: 'catalyst', visual: 'symbol',     values: ['copper', 'silver', 'gold',  'mercury'] },
    ],
    minCombo: 3, maxCombo: 4,
    color: '#8e44ad', difficulty: 3, icon: '◆',
  },
  {
    id: 4,
    name: 'Scholar',
    subtitle: 'Four forces, three dimensions',
    rows: 4, cols: 4,
    attributes: [
      { name: 'element',  visual: 'background', values: ['fire',   'water',  'earth', 'air']     },
      { name: 'catalyst', visual: 'symbol',     values: ['copper', 'silver', 'gold',  'mercury'] },
      { name: 'phase',    visual: 'phase',      values: ['I',      'II',     'III',   'IV']      },
    ],
    minCombo: 3, maxCombo: 4,
    color: '#d35400', difficulty: 4, icon: '⬡',
  },
  {
    id: 5,
    name: 'Alchemist',
    subtitle: 'All five forces converge',
    rows: 5, cols: 5,
    attributes: [
      { name: 'element',  visual: 'background', values: ['fire',   'water',  'earth', 'air',  'aether'] },
      { name: 'catalyst', visual: 'symbol',     values: ['copper', 'silver', 'gold',  'mercury', 'iron'] },
    ],
    minCombo: 3, maxCombo: 5,
    color: '#c0392b', difficulty: 5, icon: '★',
  },
];

// ── Board generation (guaranteed solvable) ────────────────────────────────────
function generateBoard(level) {
  const total  = level.rows * level.cols;
  const groups = partitionIntoGroups(total, level.minCombo, level.maxCombo);
  const tiles  = [];
  for (const size of groups) tiles.push(...generateGroup(size, level.attributes));
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
    const vals     = attr.values;
    const canDiff  = vals.length >= size;
    const allDiff  = canDiff && Math.random() < 0.5;
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
