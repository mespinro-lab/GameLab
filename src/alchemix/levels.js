'use strict';

const LEVELS = [
  {
    id: 1,
    name: 'Novice',
    subtitle: 'Discover the harmony',
    elements:  ['fire', 'water', 'earth'],
    catalysts: ['copper', 'silver', 'gold'],
    color: '#27ae60',
    difficulty: 1,
    icon: '◇',
  },
  {
    id: 2,
    name: 'Apprentice',
    subtitle: 'A new catalyst appears',
    elements:  ['fire', 'water', 'earth'],
    catalysts: ['copper', 'silver', 'gold', 'mercury'],
    color: '#2980b9',
    difficulty: 2,
    icon: '◈',
  },
  {
    id: 3,
    name: 'Adept',
    subtitle: 'A new element joins',
    elements:  ['fire', 'water', 'earth', 'air'],
    catalysts: ['copper', 'silver', 'gold', 'mercury'],
    color: '#8e44ad',
    difficulty: 3,
    icon: '◆',
  },
  {
    id: 4,
    name: 'Scholar',
    subtitle: 'Iron enters the mix',
    elements:  ['fire', 'water', 'earth', 'air'],
    catalysts: ['copper', 'silver', 'gold', 'mercury', 'iron'],
    color: '#d35400',
    difficulty: 4,
    icon: '⬡',
  },
  {
    id: 5,
    name: 'Alchemist',
    subtitle: 'All forces converge',
    elements:  ['fire', 'water', 'earth', 'air', 'aether'],
    catalysts: ['copper', 'silver', 'gold', 'mercury', 'iron'],
    color: '#c0392b',
    difficulty: 5,
    icon: '★',
  },
];

// ── Stars: based on elapsed time (untimed levels only) ────────────────────────
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
