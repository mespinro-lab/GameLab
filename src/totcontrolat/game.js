'use strict';

// ── Constants ──────────────────────────────────────────────────────────────────
const MAX_WEEKS     = 26;
const TICK_MS       = 5000;
const INCOME        = 55;
const DANGER_LEVEL  = 40;
const DANGER_LIMIT  = 3;

const DRIFT = { veins: -1.2, mercat: -0.9, activistes: -1.4 };

const IDLE_MSGS = [
  'Setmana tranquil·la... de moment.',
  'El gat descansa sobre els expedients urgents.',
  'Cap queixa nova al grup de WhatsApp. Inusual.',
  'El semàfor parpelleja. Com sempre.',
  'Els Activistes estan "en reunió".',
  'El Mercat ha enviat un email marcat com a URGENT.',
  'Els Veïns observen. I comenten.',
  'Les rotondes resisteixen estoicament.',
  'El pressupost aguanta. Fins ara.',
  'Calma tensa. Clàssic.',
  'Ningú ha trucat. Sospitós.',
  'El gat ha destruït una planta d\'oficina. Ningú ha dit res.',
];

// ── State ──────────────────────────────────────────────────────────────────────
let S = {};
let cardCleanup = () => {};

function initState() {
  S = {
    week:        1,
    money:       450,
    factions:    { veins: 62, mercat: 60, activistes: 58 },
    tokens:      0,
    dangerWeeks: 0,
    phase:       'playing',
    tickTimer:   null,
    tickStart:   0,
    pausedAt:    0,
    pool:        shuffle([...EVENTS]),
    poolIdx:     0,
  };
}

// ── Derived ────────────────────────────────────────────────────────────────────
function happiness() {
  const f = S.factions;
  return Math.round(f.veins * 0.4 + f.mercat * 0.3 + f.activistes * 0.3);
}

// ── Tick loop ──────────────────────────────────────────────────────────────────
function startTick() {
  clearInterval(S.tickTimer);
  S.tickStart = Date.now();
  S.tickTimer = setInterval(() => {
    if (S.phase !== 'playing') return;
    const p = Math.min((Date.now() - S.tickStart) / TICK_MS, 1);
    $('tick-bar').style.width = (p * 100) + '%';
    if (p >= 1) { clearInterval(S.tickTimer); advanceWeek(); }
  }, 80);
}

function advanceWeek() {
  S.week++;
  S.money += INCOME;

  Object.keys(S.factions).forEach(k => {
    const noise = Math.random() * 1.6 - 0.8;
    S.factions[k] = clamp(S.factions[k] + DRIFT[k] + noise, 5, 96);
  });

  const h = happiness();
  if (h < DANGER_LEVEL) {
    S.dangerWeeks++;
    if (S.dangerWeeks >= DANGER_LIMIT) { endGame(false); return; }
  } else {
    S.dangerWeeks = 0;
  }

  if (S.week > MAX_WEEKS) { endGame(true); return; }
  if (h > 80) S.tokens++;

  render();

  const fireEvent = (S.week % 2 === 0) || Math.random() < 0.32;
  if (fireEvent) { showEvent(nextEvent()); }
  else           { showIdle(); startTick(); }
}

// ── Events ─────────────────────────────────────────────────────────────────────
function nextEvent() {
  if (S.poolIdx >= S.pool.length) { S.pool = shuffle([...EVENTS]); S.poolIdx = 0; }
  return S.pool[S.poolIdx++];
}

function showEvent(evt) {
  S.phase = 'event';
  clearInterval(S.tickTimer);
  $('tick-bar').style.width = '0%';

  $('event-icon').textContent  = evt.icon;
  $('event-title').textContent = evt.title;
  $('event-text').textContent  = evt.text;

  const [oL, oR] = evt.options;
  $('opt-left-name').textContent    = oL.label;
  $('opt-left-preview').textContent = oL.preview;
  $('opt-left-risk').textContent    = oL.risk || '';
  $('opt-right-name').textContent   = oR.label;
  $('opt-right-preview').textContent = oR.preview;
  $('opt-right-risk').textContent   = oR.risk || '';

  updateHighlight(0);
  hide('idle-state');
  show('event-card');

  cardCleanup = initCardDrag(oL, oR);
}

function initCardDrag(oL, oR) {
  const card = $('event-card');
  const THRESH = 75;
  let dragging = false, startX = 0, dx = 0;

  function px(e) { return e.touches ? e.touches[0].clientX : e.clientX; }

  function onStart(e) {
    if (e.type === 'mousedown') e.preventDefault();
    dragging = true; startX = px(e); dx = 0;
    card.style.transition = '';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  }

  function onMove(e) {
    if (!dragging) return;
    if (e.cancelable) e.preventDefault();
    dx = px(e) - startX;
    card.style.transform = `translateX(${dx}px) rotate(${dx * 0.06}deg)`;
    updateHighlight(dx);
  }

  function onEnd() {
    if (!dragging) return;
    dragging = false;
    rmDocListeners();
    if      (dx < -THRESH) flyOff('left',  oL);
    else if (dx >  THRESH) flyOff('right', oR);
    else                   snapBack();
  }

  function snapBack() {
    card.style.transition = 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)';
    card.style.transform  = '';
    updateHighlight(0);
    setTimeout(() => { card.style.transition = ''; }, 350);
  }

  function rmDocListeners() {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup',   onEnd);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend',  onEnd);
  }

  const onClickL = () => { if (!dragging) flyOff('left',  oL); };
  const onClickR = () => { if (!dragging) flyOff('right', oR); };
  const onKey    = e => {
    if (S.phase !== 'event') return;
    if (e.key === 'ArrowLeft')  flyOff('left',  oL);
    if (e.key === 'ArrowRight') flyOff('right', oR);
  };

  card.addEventListener('mousedown',  onStart);
  card.addEventListener('touchstart', onStart, { passive: true });
  $('choice-left').addEventListener('click', onClickL);
  $('choice-right').addEventListener('click', onClickR);
  document.addEventListener('keydown', onKey);

  return function cleanup() {
    dragging = false;
    rmDocListeners();
    card.removeEventListener('mousedown',  onStart);
    card.removeEventListener('touchstart', onStart);
    $('choice-left').removeEventListener('click', onClickL);
    $('choice-right').removeEventListener('click', onClickR);
    document.removeEventListener('keydown', onKey);
  };
}

function flyOff(direction, opt) {
  cardCleanup();
  const card = $('event-card');
  const tx   = direction === 'right' ? window.innerWidth : -window.innerWidth;
  const rot  = direction === 'right' ? 22 : -22;
  card.style.transition = 'transform 0.3s ease-in, opacity 0.3s ease-in';
  card.style.transform  = `translateX(${tx}px) rotate(${rot}deg)`;
  card.style.opacity    = '0';
  setTimeout(() => {
    card.style.transition = '';
    card.style.transform  = '';
    card.style.opacity    = '';
    hide('event-card');
    resolve(opt);
  }, 310);
}

function updateHighlight(dx) {
  $('choice-left').classList.toggle('choice-active',  dx < -75);
  $('choice-right').classList.toggle('choice-active', dx >  75);
}

function resolve(opt) {
  const fx = opt.fx || {};
  if (fx.veins)      S.factions.veins      = clamp(S.factions.veins      + fx.veins,      5, 96);
  if (fx.mercat)     S.factions.mercat     = clamp(S.factions.mercat     + fx.mercat,     5, 96);
  if (fx.activistes) S.factions.activistes = clamp(S.factions.activistes + fx.activistes, 5, 96);
  if (fx.money)      S.money = Math.max(0, S.money + fx.money);

  const h = happiness();
  if (h < DANGER_LEVEL) {
    S.dangerWeeks++;
    if (S.dangerWeeks >= DANGER_LIMIT) { endGame(false); return; }
  } else {
    S.dangerWeeks = 0;
  }

  render();
  showIdle();
  S.phase = 'playing';
  startTick();
}

function showIdle() {
  $('idle-message').textContent = IDLE_MSGS[Math.floor(Math.random() * IDLE_MSGS.length)];
  $('idle-state').classList.remove('hidden');
}

// ── End game ───────────────────────────────────────────────────────────────────
function endGame(win) {
  clearInterval(S.tickTimer);
  S.phase = win ? 'won' : 'lost';

  if (win) {
    const score = happiness() * MAX_WEEKS + S.tokens * 60;
    $('final-score').textContent =
      `Puntuació: ${score}  ·  Tokens: ${S.tokens}  ·  Diners finals: ${S.money}€`;
    show('overlay-won');
  } else {
    $('survive-weeks').textContent =
      `Has aguantat ${S.week - 1} de ${MAX_WEEKS} setmanes.`;
    show('overlay-lost');
  }
}

// ── Render ─────────────────────────────────────────────────────────────────────
function render() {
  const h = happiness();

  $('happiness-val').textContent  = h;
  $('happiness-face').textContent = h > 75 ? '😄' : h > 55 ? '😐' : h > 35 ? '😟' : '😱';
  $('week-val').textContent       = S.week;
  $('money-val').textContent      = S.money;
  $('token-val').textContent      = S.tokens;

  const skyH = h > 50 ? 30 + (h - 50) * 0.8  : h * 0.4;
  const skyS = h > 50 ? 18 + (h - 50) * 0.5  : 15;
  const skyL = h > 50 ? 10 + (h - 50) * 0.15 : 6 + h * 0.08;
  document.documentElement.style.setProperty('--sky-h', skyH);
  document.documentElement.style.setProperty('--sky-s', skyS + '%');
  document.documentElement.style.setProperty('--sky-l', skyL + '%');

  const bldAlpha = 0.35 + (1 - h / 100) * 0.3;
  document.documentElement.style.setProperty('--bld-alpha', bldAlpha);

  ['veins', 'mercat', 'activistes'].forEach(k => {
    const v = Math.round(S.factions[k]);
    $(`val-${k}`).textContent   = v;
    $(`bar-${k}`).style.width   = v + '%';
    $(`bar-${k}`).className = 'faction-bar-fill ' +
      (v > 60 ? 'bar-ok' : v > 35 ? 'bar-warn' : 'bar-bad');
  });

  if (S.dangerWeeks > 0) {
    $('danger-weeks-val').textContent = S.dangerWeeks;
    $('danger-indicator').classList.remove('hidden');
  } else {
    $('danger-indicator').classList.add('hidden');
  }

  $('pause-btn').textContent = S.phase === 'paused' ? '▶ Reprendre' : '⏸ Pausa';
}

// ── Controls ───────────────────────────────────────────────────────────────────
function togglePause() {
  if (S.phase === 'playing') {
    S.pausedAt = Date.now();
    S.phase = 'paused';
    clearInterval(S.tickTimer);
  } else if (S.phase === 'paused') {
    S.tickStart += Date.now() - S.pausedAt;
    S.phase = 'playing';
    startTick();
  }
  render();
}

function startGame() {
  hide('overlay-won'); hide('overlay-lost');
  hide('event-card');
  initState();
  render();
  showIdle();
  setTimeout(() => { if (S.phase === 'playing') { showEvent(nextEvent()); } }, 800);
}

// ── Utils ──────────────────────────────────────────────────────────────────────
const $     = id => document.getElementById(id);
const show  = id => $(id).classList.remove('hidden');
const hide  = id => $(id).classList.add('hidden');
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Init ───────────────────────────────────────────────────────────────────────
$('btn-retry').addEventListener('click', startGame);
$('btn-retry-lost').addEventListener('click', startGame);
$('pause-btn').addEventListener('click', togglePause);

startGame();
