'use strict';

// ── Constants ──────────────────────────────────────────────────────────────────
const MAX_WEEKS    = 26;
const TICK_MS      = 5000;
const DANGER_LEVEL = 40;
const DANGER_LIMIT = 3;

const TAX_INCOME   = { low: 30, mid: 55, high: 85 };
const POLICY_COSTS = { services: 35, comms: 25 };

const DRIFT = { veins: -1.2, mercat: -0.9, activistes: -1.4 };

const POLICY_FX = {
  services: { veins: 0.8, activistes: 0.4 },
  comms:    { veins: 0.4, mercat: 0.6 },
};

const TAX_FX = {
  high: { mercat: -0.5, veins: -0.3 },
  low:  { mercat:  0.4, veins:  0.3 },
};

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

function initState(countryName) {
  S = {
    countryName: countryName,
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
    tax:         'mid',
    services:    false,
    comms:       false,
  };
  flushPendingTokens();
}

// ── Derived ────────────────────────────────────────────────────────────────────
function happiness() {
  const f = S.factions;
  return Math.round(f.veins * 0.4 + f.mercat * 0.3 + f.activistes * 0.3);
}

// ── Save system ────────────────────────────────────────────────────────────────
const SAVE_KEY     = name => `totcontrolat_save_${name}`;
const TOKEN_BANK   = 'totcontrolat_tokens';

function saveGame() {
  if (!S.countryName) return;
  try {
    localStorage.setItem(SAVE_KEY(S.countryName), JSON.stringify({
      countryName: S.countryName,
      week:        S.week,
      money:       S.money,
      factions:    { ...S.factions },
      tokens:      S.tokens,
      dangerWeeks: S.dangerWeeks,
      tax:         S.tax,
      services:    S.services,
      comms:       S.comms,
      happiness:   happiness(),
      savedAt:     Date.now(),
    }));
  } catch(e) {}
}

function deleteSave(name) {
  try { localStorage.removeItem(SAVE_KEY(name)); } catch(e) {}
}

function listSaves() {
  const saves = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('totcontrolat_save_')) {
        try { saves.push(JSON.parse(localStorage.getItem(k))); } catch(e) {}
      }
    }
  } catch(e) {}
  return saves.sort((a, b) => b.savedAt - a.savedAt);
}

function getPendingTokens() {
  try { return Math.max(0, parseInt(localStorage.getItem(TOKEN_BANK) || '0', 10)); } catch(e) { return 0; }
}

function addPendingTokens(n) {
  try { localStorage.setItem(TOKEN_BANK, getPendingTokens() + n); } catch(e) {}
}

function flushPendingTokens() {
  const t = getPendingTokens();
  if (t > 0) { S.tokens += t; try { localStorage.removeItem(TOKEN_BANK); } catch(e) {} }
}

// ── Menu navigation ────────────────────────────────────────────────────────────
let fromIngame = false;

function openMainMenu() {
  if (S.countryName && S.phase === 'playing') {
    S.pausedAt = Date.now();
    S.phase    = 'paused';
    clearInterval(S.tickTimer);
    render();
  }
  fromIngame = !!S.countryName;
  $('btn-reprendre').classList.toggle('hidden', !fromIngame);
  showOnly('menu-screen');
}

function closeMainMenu() {
  hide('menu-screen');
  if (fromIngame && S.phase === 'paused') {
    S.tickStart += Date.now() - S.pausedAt;
    S.phase = 'playing';
    startTick();
    render();
  }
}

function showSub(id) {
  ['menu-screen','nova-screen','carregar-screen','botiga-screen','config-screen']
    .forEach(hide);
  show(id);
}

function showOnly(id) {
  ['menu-screen','nova-screen','carregar-screen','botiga-screen','config-screen']
    .forEach(x => x === id ? show(x) : hide(x));
}

// ── Nova partida ────────────────────────────────────────────────────────────────
function openNova() {
  $('country-input').value = '';
  hide('name-error');
  showSub('nova-screen');
  setTimeout(() => $('country-input').focus(), 100);
}

function confirmNova() {
  const name = $('country-input').value.trim();
  if (!name) { show('name-error'); return; }
  hide('name-error');
  startSession(name);
}

// ── Carregar partida ────────────────────────────────────────────────────────────
function openCarregar() {
  renderSaves();
  showSub('carregar-screen');
}

function renderSaves() {
  const saves = listSaves();
  const list  = $('saves-list');
  list.innerHTML = '';
  if (!saves.length) { show('no-saves-msg'); return; }
  hide('no-saves-msg');
  saves.forEach(sv => {
    const date = new Date(sv.savedAt).toLocaleDateString('ca-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const row  = document.createElement('div');
    row.className = 'save-item';
    row.innerHTML = `
      <div class="save-info">
        <div class="save-name">🏛️ ${sv.countryName}</div>
        <div class="save-meta">Setm. ${sv.week}/26 · Felicitat: ${sv.happiness} · ${date}</div>
      </div>
      <button class="save-load-btn">Carrega</button>
      <button class="save-del-btn" title="Suprimeix">✕</button>
    `;
    row.querySelector('.save-load-btn').addEventListener('click', () => loadSession(sv));
    row.querySelector('.save-del-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteSave(sv.countryName);
      row.remove();
      if (!$('saves-list').children.length) show('no-saves-msg');
    });
    list.appendChild(row);
  });
}

function loadSession(sv) {
  hide('overlay-won'); hide('overlay-lost');
  hide('event-card');
  S = {
    countryName: sv.countryName,
    week:        sv.week,
    money:       sv.money,
    factions:    { ...sv.factions },
    tokens:      sv.tokens,
    dangerWeeks: sv.dangerWeeks,
    phase:       'playing',
    tickTimer:   null,
    tickStart:   0,
    pausedAt:    0,
    pool:        shuffle([...EVENTS]),
    poolIdx:     0,
    tax:         sv.tax   || 'mid',
    services:    sv.services || false,
    comms:       sv.comms    || false,
  };
  flushPendingTokens();
  ['menu-screen','carregar-screen'].forEach(hide);
  render();
  showIdle();
  startTick();
}

// ── Botiga ─────────────────────────────────────────────────────────────────────
function openBotiga() {
  hide('shop-confirm');
  updatePendingInfo();
  showSub('botiga-screen');
}

function updatePendingInfo() {
  const t = getPendingTokens();
  $('pending-tokens-info').textContent = t > 0
    ? `🪙 ${t} token${t !== 1 ? 's' : ''} pendents d'assignar a la pròxima partida`
    : '';
}

function buyTokens(n) {
  if (S.countryName) {
    S.tokens += n;
    saveGame();
    render();
    showShopConfirm(`✓ +${n} tokens afegits a ${S.countryName}!`);
  } else {
    addPendingTokens(n);
    updatePendingInfo();
    showShopConfirm(`✓ +${n} tokens reservats per a la pròxima partida`);
  }
}

function showShopConfirm(msg) {
  const el = $('shop-confirm');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.add('hidden'), 2500);
}

// ── Configuració ───────────────────────────────────────────────────────────────
function openConfig() {
  showSub('config-screen');
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

  let income = TAX_INCOME[S.tax];
  if (S.services) income -= POLICY_COSTS.services;
  if (S.comms)    income -= POLICY_COSTS.comms;
  S.money += income;

  Object.keys(S.factions).forEach(k => {
    const noise = Math.random() * 1.6 - 0.8;
    let delta = DRIFT[k] + noise;
    if (S.services && POLICY_FX.services[k]) delta += POLICY_FX.services[k];
    if (S.comms    && POLICY_FX.comms[k])    delta += POLICY_FX.comms[k];
    if (TAX_FX[S.tax]?.[k]) delta += TAX_FX[S.tax][k];
    S.factions[k] = clamp(S.factions[k] + delta, 5, 96);
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

  saveGame();
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

  $('event-icon').textContent   = evt.icon;
  $('event-title').textContent  = evt.title;
  $('event-text').textContent   = evt.text;

  const [oL, oR] = evt.options;
  $('opt-left-name').textContent     = oL.label;
  $('opt-left-preview').textContent  = oL.preview;
  $('opt-left-risk').textContent     = oL.risk || '';
  $('opt-right-name').textContent    = oR.label;
  $('opt-right-preview').textContent = oR.preview;
  $('opt-right-risk').textContent    = oR.risk || '';

  updateHighlight(0);
  hide('idle-state');
  show('event-card');

  cardCleanup = initCardDrag(oL, oR);
}

function initCardDrag(oL, oR) {
  const card = $('event-card');
  const THRESH_DX = 60;
  const THRESH_VX = 0.35;
  let dragging = false, startX = 0, dx = 0, lastX = 0, lastT = 0, vx = 0;

  function px(e) { return e.touches ? e.touches[0].clientX : e.clientX; }

  function onStart(e) {
    if (e.type === 'mousedown') e.preventDefault();
    dragging = true;
    startX = lastX = px(e);
    lastT  = Date.now();
    dx = 0; vx = 0;
    card.style.transition = '';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onEnd);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend',  onEnd);
  }

  function onMove(e) {
    if (!dragging) return;
    if (e.cancelable) e.preventDefault();
    const now = Date.now();
    const cx  = px(e);
    const dt  = now - lastT || 1;
    vx    = (cx - lastX) / dt;
    lastX = cx; lastT = now;
    dx    = cx - startX;
    card.style.transform = `translateX(${dx * 1.15}px) rotate(${dx * 0.1}deg)`;
    updateHighlight(dx);
    setOverlays(dx);
  }

  function onEnd() {
    if (!dragging) return;
    dragging = false;
    rmDocListeners();
    setOverlays(0);
    if      (dx < -THRESH_DX || vx < -THRESH_VX) flyOff('left',  oL);
    else if (dx >  THRESH_DX || vx >  THRESH_VX) flyOff('right', oR);
    else                                           snapBack();
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
  $('choice-left').addEventListener('click',  onClickL);
  $('choice-right').addEventListener('click', onClickR);
  document.addEventListener('keydown', onKey);

  return function cleanup() {
    dragging = false;
    rmDocListeners();
    card.removeEventListener('mousedown',  onStart);
    card.removeEventListener('touchstart', onStart);
    $('choice-left').removeEventListener('click',  onClickL);
    $('choice-right').removeEventListener('click', onClickR);
    document.removeEventListener('keydown', onKey);
  };
}

function setOverlays(dx) {
  const ol = $('swipe-ol');
  const or = $('swipe-or');
  if (dx < -15) {
    ol.style.opacity = Math.min((-dx - 15) / 120, 0.6);
    or.style.opacity = '0';
  } else if (dx > 15) {
    or.style.opacity = Math.min((dx - 15) / 120, 0.6);
    ol.style.opacity = '0';
  } else {
    ol.style.opacity = '0';
    or.style.opacity = '0';
  }
}

function flyOff(direction, opt) {
  cardCleanup();
  const card = $('event-card');
  const tx   = direction === 'right' ?  window.innerWidth * 1.2 : -window.innerWidth * 1.2;
  const rot  = direction === 'right' ? 25 : -25;
  card.style.transition = 'transform 0.28s ease-in, opacity 0.28s ease-in';
  card.style.transform  = `translateX(${tx}px) rotate(${rot}deg)`;
  card.style.opacity    = '0';
  setOverlays(0);
  setTimeout(() => {
    card.style.transition = '';
    card.style.transform  = '';
    card.style.opacity    = '';
    hide('event-card');
    resolve(opt);
  }, 300);
}

function updateHighlight(dx) {
  $('choice-left').classList.toggle('choice-active',  dx < -60);
  $('choice-right').classList.toggle('choice-active', dx >  60);
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

  saveGame();
  render();
  showIdle();
  S.phase = 'playing';
  startTick();
}

function showIdle() {
  $('idle-message').textContent = IDLE_MSGS[Math.floor(Math.random() * IDLE_MSGS.length)];
  show('idle-state');
}

// ── End game ───────────────────────────────────────────────────────────────────
function endGame(win) {
  clearInterval(S.tickTimer);
  S.phase = win ? 'won' : 'lost';
  deleteSave(S.countryName);

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
  $('ring-country').textContent   = S.countryName || '';

  const ringColor = h > 60 ? 'var(--ok)' : h > 35 ? 'var(--warn)' : 'var(--bad)';
  const ringGlow  = h > 60 ? 'rgba(76,175,128,0.38)'  : h > 35 ? 'rgba(224,160,48,0.38)'  : 'rgba(224,64,64,0.38)';
  document.documentElement.style.setProperty('--hring',      ringColor);
  document.documentElement.style.setProperty('--hring-glow', ringGlow);

  const skyH = h > 50 ? 30 + (h - 50) * 0.8  : h * 0.4;
  const skyS = h > 50 ? 18 + (h - 50) * 0.5  : 15;
  const skyL = h > 50 ? 10 + (h - 50) * 0.15 : 6 + h * 0.08;
  document.documentElement.style.setProperty('--sky-h', skyH);
  document.documentElement.style.setProperty('--sky-s', skyS + '%');
  document.documentElement.style.setProperty('--sky-l', skyL + '%');

  ['veins', 'mercat', 'activistes'].forEach(k => {
    const v = Math.round(S.factions[k]);
    $(`val-${k}`).textContent = v;
    $(`bar-${k}`).style.width = v + '%';
    $(`bar-${k}`).className   = 'faction-bar-fill ' +
      (v > 60 ? 'bar-ok' : v > 35 ? 'bar-warn' : 'bar-bad');
  });

  if (S.dangerWeeks > 0) {
    $('danger-weeks-val').textContent = S.dangerWeeks;
    $('danger-indicator').classList.remove('hidden');
  } else {
    $('danger-indicator').classList.add('hidden');
  }

  $('pause-btn').textContent = S.phase === 'paused' ? '▶' : '⏸';
  $('spend-tokens').disabled = S.tokens < 3;

  renderControls();
}

function renderControls() {
  ['low', 'mid', 'high'].forEach(t => {
    $(`tax-${t}`).classList.toggle('active', S.tax === t);
  });
  $('toggle-services').classList.toggle('active', S.services);
  $('toggle-comms').classList.toggle('active',    S.comms);
}

// ── Controls ───────────────────────────────────────────────────────────────────
function setTax(level) { S.tax = level; renderControls(); }

function togglePolicy(policy) { S[policy] = !S[policy]; renderControls(); }

function spendTokens() {
  if (S.tokens < 3) return;
  S.tokens -= 3;
  S.factions.veins      = clamp(S.factions.veins      + 8, 5, 96);
  S.factions.mercat     = clamp(S.factions.mercat     + 6, 5, 96);
  S.factions.activistes = clamp(S.factions.activistes + 6, 5, 96);
  render();
}

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

// ── Start session ──────────────────────────────────────────────────────────────
function startSession(countryName) {
  hide('overlay-won'); hide('overlay-lost');
  hide('event-card');
  ['menu-screen','nova-screen','carregar-screen','botiga-screen','config-screen']
    .forEach(hide);
  initState(countryName);
  render();
  showIdle();
  setTimeout(() => { if (S.phase === 'playing') showEvent(nextEvent()); }, 800);
}

function retrySession() {
  startSession(S.countryName);
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

// ── Event listeners ────────────────────────────────────────────────────────────
// Game controls
$('btn-retry').addEventListener('click',      retrySession);
$('btn-retry-lost').addEventListener('click', retrySession);
$('pause-btn').addEventListener('click',      togglePause);
$('spend-tokens').addEventListener('click',   spendTokens);
['low', 'mid', 'high'].forEach(t =>
  $(`tax-${t}`).addEventListener('click', () => setTax(t)));
$('toggle-services').addEventListener('click', () => togglePolicy('services'));
$('toggle-comms').addEventListener('click',    () => togglePolicy('comms'));

// Win/lose → menu
$('btn-menu-won').addEventListener('click',  openMainMenu);
$('btn-menu-lost').addEventListener('click', openMainMenu);

// In-game menu button
$('menu-ingame-btn').addEventListener('click', openMainMenu);

// Main menu
$('btn-nova').addEventListener('click',     openNova);
$('btn-carregar').addEventListener('click', openCarregar);
$('btn-botiga').addEventListener('click',   openBotiga);
$('btn-config').addEventListener('click',   openConfig);
$('btn-reprendre').addEventListener('click', closeMainMenu);

// Nova partida
$('btn-back-nova').addEventListener('click',  () => showOnly('menu-screen'));
$('btn-start-new').addEventListener('click',  confirmNova);
$('country-input').addEventListener('keydown', e => { if (e.key === 'Enter') confirmNova(); });

// Carregar partida
$('btn-back-carregar').addEventListener('click', () => showOnly('menu-screen'));

// Botiga
$('btn-back-botiga').addEventListener('click', () => showOnly('menu-screen'));
$('btn-buy-10').addEventListener('click',  () => buyTokens(10));
$('btn-buy-100').addEventListener('click', () => buyTokens(100));

// Configuració
$('btn-back-config').addEventListener('click', () => showOnly('menu-screen'));
document.querySelectorAll('.lang-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lang-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ── Init ───────────────────────────────────────────────────────────────────────
openMainMenu();
