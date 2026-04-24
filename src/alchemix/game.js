'use strict';

const CATALYST_NAMES = { copper: 'Copper', silver: 'Silver', gold: 'Gold', mercury: 'Mercury', iron: 'Iron' };

// ── SET logic ─────────────────────────────────────────────────────────────────
function isValidSet(...tiles) {
  const attrs = Object.keys(tiles[0]);
  return attrs.some(attr => {
    const vals = new Set(tiles.map(t => t[attr]));
    return vals.size === 1 || vals.size === tiles.length;
  });
}

// Find any valid combo of size between min and max; returns array of indices or null
function findCombo(board, min, max) {
  for (let size = min; size <= max; size++) {
    const result = searchCombo(board, [], 0, size);
    if (result) return result;
  }
  return null;
}

function searchCombo(board, current, start, target) {
  if (current.length === target) {
    return isValidSet(...current.map(i => board[i])) ? [...current] : null;
  }
  const needed = target - current.length;
  for (let i = start; i <= board.length - needed; i++) {
    const result = searchCombo(board, [...current, i], i + 1, target);
    if (result) return result;
  }
  return null;
}

// ── Tutorial helpers ──────────────────────────────────────────────────────────
function getValidTiles() {
  const { minCombo, maxCombo } = currentLevel;
  const validIdx = new Set();
  for (let i = 0; i < board.length; i++) {
    if (selected.includes(i)) { validIdx.add(i); continue; }
    if (selected.length >= maxCombo) continue;
    if (canExtendToValid(board, [...selected, i], minCombo, maxCombo)) validIdx.add(i);
  }
  return validIdx;
}

function canExtendToValid(board, partial, min, max) {
  if (partial.length >= min && isValidSet(...partial.map(i => board[i]))) return true;
  if (partial.length >= max) return false;
  const used = new Set(partial);
  for (let i = 0; i < board.length; i++) {
    if (used.has(i)) continue;
    if (canExtendToValid(board, [...partial, i], min, max)) return true;
  }
  return false;
}

// ── Game state ────────────────────────────────────────────────────────────────
let board         = [];
let selected      = [];
let score         = 0;
let hintSet       = null;
let busy          = false;
let currentLevel  = null;
let gameStartTime = 0;

// ── DOM ───────────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
function setMessage(text, cls) { const el = $('message'); el.textContent = text; el.className = cls || ''; }

function updateStatus() {
  $('status').textContent = `${board.length} tile${board.length !== 1 ? 's' : ''} restants`;
}

function updateSlots() {
  const min = currentLevel ? currentLevel.minCombo : 3;
  const max = currentLevel ? currentLevel.maxCombo : 3;
  const sel = selected.length;
  $('selection-slots').innerHTML = Array.from({ length: max }, (_, i) => {
    const filled   = i < sel;
    const optional = i >= min;
    return `<span class="slot${filled ? ' slot-filled' : ''}${optional ? ' slot-optional' : ''}"></span>`;
  }).join('');
  $('transmute-btn').disabled = sel < min || busy;
}

// ── Screen management ─────────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
  $(id).classList.remove('hidden');
}

// ── Menu ──────────────────────────────────────────────────────────────────────
function showMenu() {
  const grid = $('level-grid');
  grid.innerHTML = '';

  LEVELS.forEach((lvl, idx) => {
    const save   = getLevelSave(lvl.id);
    const stars  = save.stars || 0;
    const dots   = '◉'.repeat(lvl.difficulty) + '◎'.repeat(5 - lvl.difficulty);
    const bgAttr = lvl.attributes.find(a => a.visual === 'background');
    const symAttr= lvl.attributes.find(a => a.visual === 'symbol');
    const comboLabel = lvl.minCombo === lvl.maxCombo
      ? `×${lvl.minCombo}`
      : `×${lvl.minCombo}–${lvl.maxCombo}`;

    const elSwatches = (bgAttr?.values || []).map(v =>
      `<span class="el-swatch ${v}" title="${v}"></span>`
    ).join('');
    const catChars = (symAttr?.values || []).map(v =>
      `<span class="cat-char" title="${v}">${CATALYST_CHARS[v] || v[0].toUpperCase()}</span>`
    ).join('');

    const card = document.createElement('div');
    card.className = 'level-card';
    card.style.setProperty('--accent', lvl.color);
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label',
      `Level ${lvl.id}: ${lvl.name}, ${lvl.rows}×${lvl.cols}, difficulty ${lvl.difficulty}/5, ${stars} stars`);

    card.innerHTML = `
      <div class="lc-header">
        <span class="lc-icon">${lvl.icon}</span>
        <span class="lc-diff">${dots}</span>
      </div>
      <div class="lc-name">${lvl.name}</div>
      <div class="lc-sub">${lvl.subtitle}</div>
      <div class="lc-board-size">${lvl.rows}×${lvl.cols} · ${lvl.rows * lvl.cols} tiles</div>
      <div class="lc-preview">
        <div class="lc-elements">${elSwatches}</div>
        <div class="lc-catalysts">${catChars}</div>
        <span class="lc-combo-badge">${comboLabel}</span>
      </div>
      ${lvl.tutorial
        ? `<div class="lc-tutorial-badge">${save.completed ? '✓ Complet' : 'Tutorial'}</div>`
        : `<div class="lc-stars">${renderStars(stars)}</div>
           ${save.bestTime != null ? `<div class="lc-best">Best: ${formatTime(save.bestTime)}</div>` : ''}`
      }`;

    const go = () => startLevel(idx);
    card.addEventListener('click', go);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') go(); });
    grid.appendChild(card);
  });

  showScreen('screen-menu');
}

// ── Level start ───────────────────────────────────────────────────────────────
function startLevel(idx) {
  currentLevel = LEVELS[idx];
  $('level-title').textContent = `${currentLevel.id}. ${currentLevel.name}`;
  $('screen-game').style.setProperty('--level-accent', currentLevel.color);
  $('timer').classList.add('hidden');
  $('overlay').classList.add('hidden');

  const banner = $('tutorial-banner');
  if (currentLevel.tutorial && currentLevel.instruction) {
    banner.textContent = currentLevel.instruction;
    banner.classList.remove('hidden');
  } else {
    banner.classList.add('hidden');
  }

  showScreen('screen-game');
  newGame();
}

// ── New game ──────────────────────────────────────────────────────────────────
function newGame() {
  clearHint(true);
  board         = generateBoard(currentLevel);
  selected      = [];
  score         = 0;
  busy          = false;
  gameStartTime = Date.now();
  setMessage('');
  $('overlay').classList.add('hidden');

  $('board').style.gridTemplateColumns = `repeat(${currentLevel.cols}, 1fr)`;
  $('board').dataset.cols = currentLevel.cols;

  render(true);
}

// ── Hint ──────────────────────────────────────────────────────────────────────
function applyHintClasses() {
  const divs = $('board').querySelectorAll('.tile');
  divs.forEach(el => el.classList.remove('hint'));
  if (hintSet) hintSet.forEach(i => divs[i]?.classList.add('hint'));
}

function clearHint(clearMsg = false) {
  hintSet = null;
  $('board').querySelectorAll('.hint').forEach(el => el.classList.remove('hint'));
  if (clearMsg) setMessage('');
}

function showHint() {
  if (busy) return;
  if (hintSet) { clearHint(true); return; }
  const combo = findCombo(board, currentLevel.minCombo, currentLevel.maxCombo);
  if (!combo) { setMessage('No hi ha combinacions disponibles.', 'msg-hint'); return; }
  hintSet = combo;
  setMessage('Hint: toca les tiles ressaltades. Toca Hint per tancar.', 'msg-hint');
  applyHintClasses();
}

// ── Render ────────────────────────────────────────────────────────────────────
function render(animate = false) {
  const boardEl  = $('board');
  boardEl.innerHTML = '';

  const bgAttr    = currentLevel.attributes.find(a => a.visual === 'background');
  const symAttr   = currentLevel.attributes.find(a => a.visual === 'symbol');
  const phaseAttr = currentLevel.attributes.find(a => a.visual === 'phase');

  board.forEach((tile, idx) => {
    const bgVal    = bgAttr    ? tile[bgAttr.name]    : '';
    const symVal   = symAttr   ? tile[symAttr.name]   : null;
    const phaseVal = phaseAttr ? tile[phaseAttr.name] : null;

    const el = document.createElement('div');
    el.className = `tile${bgVal ? ` ${bgVal}` : ''}`;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');

    const attrDesc = currentLevel.attributes.map(a => `${a.name}:${tile[a.name]}`).join(' ');
    el.setAttribute('aria-label',
      `${attrDesc} — ${selected.includes(idx) ? 'selected' : 'unselected'}`);

    el.innerHTML = `
      ${bgVal  ? `<div class="element-badge">${ELEMENT_SVG[bgVal] || ''}</div>` : ''}
      ${symVal ? `<div class="catalyst-symbol">${CATALYST_SVG[symVal] || ''}</div>` : ''}
      ${symVal ? `<span class="tile-label">${CATALYST_NAMES[symVal] || symVal}</span>` : ''}
      ${phaseVal ? `<span class="phase-indicator">${phaseVal}</span>` : ''}`;

    if (selected.includes(idx)) el.classList.add('selected');
    if (animate) { el.style.animationDelay = `${idx * 35}ms`; el.classList.add('tile-entering'); }

    const toggle = () => { if (!busy) toggleTile(idx); };
    el.addEventListener('click', toggle);
    el.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && !busy) toggle(); });
    boardEl.appendChild(el);
  });

  if (currentLevel.tutorial) {
    const validSet = getValidTiles();
    boardEl.querySelectorAll('.tile').forEach((el, i) => {
      if (!validSet.has(i)) el.classList.add('tile-disabled');
    });
  }

  updateStatus();
  updateSlots();
  applyHintClasses();
}

// ── Interaction ───────────────────────────────────────────────────────────────
function toggleTile(idx) {
  if (busy) return;
  if (hintSet && !hintSet.includes(idx)) clearHint(true);

  const pos = selected.indexOf(idx);
  if (pos >= 0)                                          { selected.splice(pos, 1); }
  else if (selected.length < currentLevel.maxCombo)     { selected.push(idx); }
  render();
}

// ── Animations ────────────────────────────────────────────────────────────────
const REMOVE_DURATION  = 480;
const INVALID_DURATION = 520;

function animateRemove(indices, onDone) {
  const divs = [...$('board').querySelectorAll('.tile')];
  indices.forEach(i => divs[i]?.classList.add('tile-removing'));
  setTimeout(onDone, REMOVE_DURATION);
}

function animateInvalid(indices, onDone) {
  const divs = [...$('board').querySelectorAll('.tile')];
  indices.forEach(i => divs[i]?.classList.add('tile-invalid'));
  setTimeout(onDone, INVALID_DURATION);
}

// ── Transmute ─────────────────────────────────────────────────────────────────
function checkSet() {
  const { minCombo, maxCombo } = currentLevel;
  if (selected.length < minCombo || selected.length > maxCombo || busy) return;
  clearHint(true);

  const tiles = selected.map(i => board[i]);
  const valid = isValidSet(...tiles);

  if (valid) {
    busy = true;
    score++;
    setMessage('✓ Harmonia alquímica!', 'msg-success');
    updateSlots();

    const toRemove = [...selected].sort((x, y) => y - x);
    animateRemove(toRemove, () => {
      toRemove.forEach(i => board.splice(i, 1));
      selected = [];
      busy = false;

      if (board.length === 0) {
        const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
        const stars   = calcStars(elapsed);
        const save    = saveLevelResult(currentLevel.id, { time: elapsed, score, stars });
        showOverlay(elapsed, save, true);
      } else if (!findCombo(board, minCombo, maxCombo)) {
        showOverlay(null, null, false);
      } else {
        setMessage('');
        render();
      }
    });

  } else {
    busy = true;
    setMessage('✗ No és una combinació vàlida', 'msg-fail');
    updateSlots();
    const failing = [...selected];
    selected = [];
    animateInvalid(failing, () => { busy = false; setMessage(''); render(); });
  }
}

// ── Overlay (win + fail) ──────────────────────────────────────────────────────
function showOverlay(elapsed, save, win) {
  if (win) {
    if (currentLevel.tutorial) {
      $('overlay-icon').textContent  = '✓';
      $('overlay-title').textContent = 'Tutorial complet!';
      $('overlay-stats').innerHTML   = `<p>Has après la mecànica. Ara és el teu torn.</p>`;
    } else {
      const stars    = save.stars || 0;
      const isRecord = save.bestTime === elapsed;
      $('overlay-icon').textContent  = renderStars(stars);
      $('overlay-title').textContent = 'Harmonia aconseguida!';
      $('overlay-stats').innerHTML = `
        <p>Combinacions: <strong>${score}</strong></p>
        <p>Temps: <strong>${formatTime(elapsed)}</strong>${isRecord ? ' 🏆' : ''}</p>
        ${save.bestTime !== elapsed ? `<p>Millor: <strong>${formatTime(save.bestTime)}</strong></p>` : ''}`;
    }

    const nextIdx = LEVELS.findIndex(l => l.id === currentLevel.id) + 1;
    const hasNext = nextIdx < LEVELS.length;
    const nextBtn = $('overlay-next');
    if (hasNext) { nextBtn.classList.remove('hidden'); nextBtn.onclick = () => startLevel(nextIdx); }
    else         { nextBtn.classList.add('hidden'); }

  } else {
    $('overlay-icon').textContent  = '✗';
    $('overlay-title').textContent = 'Sense sortida!';
    $('overlay-stats').innerHTML = `
      <p>Combinacions trobades: <strong>${score}</strong></p>
      <p>Tiles restants: <strong>${board.length}</strong></p>`;
    $('overlay-next').classList.add('hidden');
  }

  $('overlay').classList.remove('hidden');
  $('overlay-retry').focus();
}

// ── Init ──────────────────────────────────────────────────────────────────────
$('back-btn').addEventListener('click', showMenu);
$('hint-btn').addEventListener('click', showHint);
$('restart-btn').addEventListener('click', newGame);
$('transmute-btn').addEventListener('click', () => { if (!busy) checkSet(); });
$('overlay-retry').addEventListener('click', newGame);
$('overlay-menu').addEventListener('click', showMenu);

showMenu();
