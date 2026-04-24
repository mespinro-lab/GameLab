'use strict';

const CATALYST_NAMES = { copper: 'Copper', silver: 'Silver', gold: 'Gold', mercury: 'Mercury', iron: 'Iron' };

// ── Tile model ────────────────────────────────────────────────────────────────
function makeTile(e, c) { return { element: e, catalyst: c }; }

function allTiles(level) {
  const t = [];
  for (const e of level.elements)
    for (const c of level.catalysts)
      t.push(makeTile(e, c));
  return t;
}

// ── SET logic ─────────────────────────────────────────────────────────────────
function isValidSet(a, b, c) {
  const ok = attr => { const s = new Set([a[attr], b[attr], c[attr]]); return s.size === 1 || s.size === 3; };
  return ok('element') && ok('catalyst');
}

function findSet(board) {
  for (let i = 0; i < board.length - 2; i++)
    for (let j = i + 1; j < board.length - 1; j++)
      for (let k = j + 1; k < board.length; k++)
        if (isValidSet(board[i], board[j], board[k])) return [i, j, k];
  return null;
}

// ── Game state ────────────────────────────────────────────────────────────────
let board         = [];
let selected      = [];
let score         = 0;
let hintSet       = null;
let busy          = false;
let checkTimeout  = null;
let currentLevel  = null;
let gameStartTime = 0;

// ── DOM ───────────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
function setMessage(text, cls) { const el = $('message'); el.textContent = text; el.className = cls || ''; }
function updateStatus() {
  const dots = '◆'.repeat(selected.length) + '◇'.repeat(3 - selected.length);
  $('status').textContent = `${board.length} tiles · ${dots}`;
}

// ── Screen management ─────────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
  $(id).classList.remove('hidden');
}

// ── Menu ──────────────────────────────────────────────────────────────────────
function showMenu() {
  if (checkTimeout) { clearTimeout(checkTimeout); checkTimeout = null; }

  const grid = $('level-grid');
  grid.innerHTML = '';

  LEVELS.forEach((lvl, idx) => {
    const save  = getLevelSave(lvl.id);
    const stars = save.stars || 0;
    const cols  = lvl.catalysts.length;
    const rows  = lvl.elements.length;
    const dots  = '◉'.repeat(lvl.difficulty) + '◎'.repeat(5 - lvl.difficulty);

    // Element swatches
    const elSwatches = lvl.elements.map(e =>
      `<span class="el-swatch ${e}" title="${e}"></span>`
    ).join('');

    // Catalyst chars — highlight the last one (newly added per level)
    const catChars = lvl.catalysts.map((c, i) => {
      const isNew = i === lvl.catalysts.length - 1 && lvl.id > 1;
      return `<span class="cat-char${isNew ? ' cat-new' : ''}" title="${c}">${CATALYST_CHARS[c]}</span>`;
    }).join('');

    // New element badge (last element, levels > 1 that add one)
    const newElIdx = lvl.elements.length - 1;
    const hasNewEl = lvl.id > 1 && lvl.elements.length > LEVELS[idx - 1]?.elements.length;
    const newElBadge = hasNewEl
      ? `<span class="el-new-badge ${lvl.elements[newElIdx]}">${lvl.elements[newElIdx]}</span>`
      : '';

    const card = document.createElement('div');
    card.className = 'level-card';
    card.style.setProperty('--accent', lvl.color);
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label',
      `Level ${lvl.id}: ${lvl.name}, ${rows}×${cols} board, difficulty ${lvl.difficulty}/5, ${stars} stars`);

    card.innerHTML = `
      <div class="lc-header">
        <span class="lc-icon">${lvl.icon}</span>
        <span class="lc-diff">${dots}</span>
      </div>
      <div class="lc-name">${lvl.name}</div>
      <div class="lc-sub">${lvl.subtitle}</div>
      <div class="lc-board-size">${rows}×${cols} · ${rows * cols} tiles</div>
      <div class="lc-preview">
        <div class="lc-elements">${elSwatches}${newElBadge}</div>
        <div class="lc-catalysts">${catChars}</div>
      </div>
      <div class="lc-stars">${renderStars(stars)}</div>
      ${save.bestTime != null ? `<div class="lc-best">Best: ${formatTime(save.bestTime)}</div>` : ''}`;

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
  $('timer').classList.add('hidden');   // no timers
  $('overlay').classList.add('hidden');
  showScreen('screen-game');
  newGame();
}

// ── New game ──────────────────────────────────────────────────────────────────
function newGame() {
  if (checkTimeout) { clearTimeout(checkTimeout); checkTimeout = null; }
  clearHint(true);
  board         = allTiles(currentLevel);
  selected      = [];
  score         = 0;
  busy          = false;
  gameStartTime = Date.now();
  setMessage('');
  $('overlay').classList.add('hidden');

  // Board grid columns = number of catalysts (one column per catalyst type)
  $('board').style.gridTemplateColumns = `repeat(${currentLevel.catalysts.length}, 1fr)`;
  $('board').dataset.cols = currentLevel.catalysts.length;

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
  const set = findSet(board);
  if (!set) { setMessage('No SETs available.', 'msg-hint'); return; }
  hintSet = set;
  setMessage('Hint: tap the highlighted tiles. Tap Hint again to dismiss.', 'msg-hint');
  applyHintClasses();
}

// ── Render ────────────────────────────────────────────────────────────────────
function render(animate = false) {
  const boardEl = $('board');
  boardEl.innerHTML = '';

  board.forEach((tile, idx) => {
    const el = document.createElement('div');
    el.className = `tile ${tile.element}`;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label',
      `${tile.element} ${CATALYST_NAMES[tile.catalyst]}, ${selected.includes(idx) ? 'selected' : 'unselected'}`);
    el.setAttribute('tabindex', '0');

    el.innerHTML = `
      <div class="element-badge">${ELEMENT_SVG[tile.element]}</div>
      <div class="catalyst-symbol">${CATALYST_SVG[tile.catalyst]}</div>
      <span class="tile-label">${CATALYST_NAMES[tile.catalyst]}</span>`;

    if (selected.includes(idx)) el.classList.add('selected');
    if (animate) { el.style.animationDelay = `${idx * 40}ms`; el.classList.add('tile-entering'); }

    const toggle = () => { if (!busy) toggleTile(idx); };
    el.addEventListener('click', toggle);
    el.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && !busy) toggle(); });
    boardEl.appendChild(el);
  });

  updateStatus();
  applyHintClasses();
}

// ── Interaction ───────────────────────────────────────────────────────────────
function toggleTile(idx) {
  if (checkTimeout) { clearTimeout(checkTimeout); checkTimeout = null; }
  if (hintSet && !hintSet.includes(idx)) clearHint(true);

  const pos = selected.indexOf(idx);
  if (pos >= 0)                 { selected.splice(pos, 1); }
  else if (selected.length < 3) { selected.push(idx); }
  render();

  if (selected.length === 3) {
    checkTimeout = setTimeout(() => { checkTimeout = null; checkSet(); }, 200);
  }
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

// ── Check SET ─────────────────────────────────────────────────────────────────
function checkSet() {
  if (selected.length !== 3 || busy) return;
  clearHint(true);

  const [a, b, c] = selected.map(i => board[i]);
  const valid = isValidSet(a, b, c);

  if (valid) {
    busy = true;
    score++;
    setMessage('✓ Alchemical harmony!', 'msg-success');

    const toRemove = [...selected].sort((x, y) => y - x);
    animateRemove(toRemove, () => {
      toRemove.forEach(i => board.splice(i, 1));
      selected = [];
      busy = false;

      if (board.length === 0) {
        const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
        const stars   = calcStars(elapsed);
        const save    = saveLevelResult(currentLevel.id, { time: elapsed, score, stars });
        showOverlay(elapsed, save);
      } else {
        setMessage('');
        render();
      }
    });

  } else {
    busy = true;
    setMessage('✗ Not a SET', 'msg-fail');
    const failing = [...selected];
    selected = [];
    animateInvalid(failing, () => { busy = false; setMessage(''); render(); });
  }
}

// ── Completion overlay ────────────────────────────────────────────────────────
function showOverlay(elapsed, save) {
  const stars   = save.stars || 0;
  const nextIdx = LEVELS.findIndex(l => l.id === currentLevel.id) + 1;
  const hasNext = nextIdx < LEVELS.length;

  $('overlay-icon').textContent  = renderStars(stars);
  $('overlay-title').textContent = 'Harmony achieved!';

  const isRecord = save.bestTime === elapsed;
  $('overlay-stats').innerHTML = `
    <p>SETs found: <strong>${score}</strong></p>
    <p>Time: <strong>${formatTime(elapsed)}</strong>${isRecord ? ' 🏆' : ''}</p>
    ${save.bestTime !== elapsed ? `<p>Best: <strong>${formatTime(save.bestTime)}</strong></p>` : ''}`;

  const nextBtn = $('overlay-next');
  if (hasNext) {
    nextBtn.classList.remove('hidden');
    nextBtn.onclick = () => startLevel(nextIdx);
  } else {
    nextBtn.classList.add('hidden');
  }

  $('overlay').classList.remove('hidden');
  $('overlay-retry').focus();
}

// ── Init ──────────────────────────────────────────────────────────────────────
$('back-btn').addEventListener('click', showMenu);
$('hint-btn').addEventListener('click', showHint);
$('restart-btn').addEventListener('click', newGame);
$('overlay-retry').addEventListener('click', newGame);
$('overlay-menu').addEventListener('click', showMenu);

showMenu();
