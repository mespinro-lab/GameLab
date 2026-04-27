'use strict';

// ── Constants ──────────────────────────────────────────────────────────────────
const MAX_WEEKS    = 6;
const MAX_LEVELS   = 5;
const TICK_MS         = 5000;
const EVENT_TIMER_MS  = 12000;
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

function initState(worldId, levelNum) {
  const world = WORLDS.find(w => w.id === worldId);
  S = {
    worldId,
    levelNum,
    worldConfig:     world,
    countryName:     world.name,
    week:            1,
    money:           world.startMoney,
    factions:        { ...world.startFactions },
    tokens:          0,
    dangerWeeks:     0,
    phase:           'playing',
    tickTimer:       null,
    tickStart:       0,
    pausedAt:        0,
    prePausePhase:   null,
    currentEvent:    null,
    pool:            shuffle([...world.events, ...EVENTS]),
    poolIdx:         0,
    tax:             world.startTax || 'mid',
    services:        false,
    comms:           false,
    conjunctureMods: { incomeMod: 0, driftMod: {} },
  };
  flushPendingTokens();
}

// ── Derived ────────────────────────────────────────────────────────────────────
function happiness() {
  const f = S.factions;
  return Math.round(f.veins * 0.4 + f.mercat * 0.3 + f.activistes * 0.3);
}

// ── Save system ────────────────────────────────────────────────────────────────
const WORLD_SAVE_KEY = id => `totcontrolat_world_${id}`;
const PROGRESS_KEY   = 'totcontrolat_progress';
const TOKEN_BANK     = 'totcontrolat_tokens';
const BADGES_KEY     = 'totcontrolat_badges';

function getProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); } catch(e) { return {}; }
}

function incrementWorldProgress(worldId, levelNum) {
  const p = getProgress();
  if ((p[worldId] || 0) < levelNum) {
    p[worldId] = levelNum;
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch(e) {}
  }
}

function getBadges() {
  try { return JSON.parse(localStorage.getItem(BADGES_KEY) || '[]'); } catch(e) { return []; }
}

function addBadge(id) {
  const b = getBadges();
  if (!b.includes(id)) { b.push(id); try { localStorage.setItem(BADGES_KEY, JSON.stringify(b)); } catch(e) {} }
}

function saveGame() {
  if (!S.worldId) return;
  try {
    localStorage.setItem(WORLD_SAVE_KEY(S.worldId), JSON.stringify({
      worldId:         S.worldId,
      levelNum:        S.levelNum,
      week:            S.week,
      money:           S.money,
      factions:        { ...S.factions },
      tokens:          S.tokens,
      dangerWeeks:     S.dangerWeeks,
      conjunctureMods: S.conjunctureMods,
      tax:             S.tax,
      services:        S.services,
      comms:           S.comms,
      happiness:       happiness(),
      savedAt:         Date.now(),
    }));
  } catch(e) {}
}

function deleteWorldSave(worldId) {
  try { localStorage.removeItem(WORLD_SAVE_KEY(worldId)); } catch(e) {}
}

function getWorldSave(worldId) {
  try { return JSON.parse(localStorage.getItem(WORLD_SAVE_KEY(worldId))); } catch(e) { return null; }
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
  const activePhase = S.phase === 'playing' || S.phase === 'event';
  if (S.worldId && activePhase) {
    S.pausedAt      = Date.now();
    S.prePausePhase = S.phase;
    S.phase         = 'paused';
    clearInterval(S.tickTimer);
    render();
  }
  fromIngame = !!S.worldId && (activePhase || S.phase === 'paused');
  openWorldMap();
}

function closeMainMenu() {
  hide('world-map-screen');
  if (fromIngame && S.phase === 'paused') {
    S.tickStart += Date.now() - S.pausedAt;
    S.phase = S.prePausePhase || 'playing';
    S.prePausePhase = null;
    resumeActiveTimer();
    render();
  }
}

function resumeActiveTimer() {
  if (S.phase === 'event') {
    S.tickTimer = setInterval(() => {
      const p = Math.max(0, 1 - (Date.now() - S.tickStart) / EVENT_TIMER_MS);
      $('tick-bar').style.width = (p * 100) + '%';
      if (p <= 0) { clearInterval(S.tickTimer); autoResolveEvent(); }
    }, 80);
  } else if (S.phase === 'playing') {
    startTick();
  }
}

const MENU_SCREENS = [
  'world-map-screen', 'botiga-screen', 'config-screen', 'badges-screen',
];

function showSub(id) {
  MENU_SCREENS.forEach(hide);
  show(id);
}

function showOnly(id) {
  MENU_SCREENS.forEach(x => x === id ? show(x) : hide(x));
}

// ── World map ──────────────────────────────────────────────────────────────────
function openWorldMap() {
  $('wmap-token-val').textContent = S.worldId ? S.tokens : getPendingTokens();
  $('btn-reprendre').classList.toggle('hidden', !fromIngame);
  renderWorldMap();
  showOnly('world-map-screen');
}

function renderWorldMap() {
  const progress = getProgress();
  const list = $('worlds-list');
  list.innerHTML = '';

  const CANVAS_W = 1200, CANVAS_H = 1400;
  const centers = [
    { x: 498, y: 941 },  // Vilaturisme  (bottom-left)
    { x: 698, y: 793 },  // Sleeptown    (middle-right)
    { x: 503, y: 617 },  // Technoburg   (top-left)
    { x: 690, y: 461 },  // Coming soon  (top-right)
  ];
  const segs = [
    { from: 0, to: 1, cp1: { x: 558, y: 973 }, cp2: { x: 660, y: 837 } },
    { from: 1, to: 2, cp1: { x: 683, y: 707 }, cp2: { x: 538, y: 664 } },
    { from: 2, to: 3, cp1: { x: 478, y: 529 }, cp2: { x: 655, y: 497 }, soon: true },
  ];

  const canvas = document.createElement('div');
  canvas.className = 'wmap-canvas';

  // ── SVG path ──
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'wmap-svg');
  svg.setAttribute('viewBox', `0 0 ${CANVAS_W} ${CANVAS_H}`);

  segs.forEach(seg => {
    const p1 = centers[seg.from], p2 = centers[seg.to];
    const d = `M ${p1.x} ${p1.y} C ${seg.cp1.x} ${seg.cp1.y} ${seg.cp2.x} ${seg.cp2.y} ${p2.x} ${p2.y}`;
    const isDone = !seg.soon && (progress[WORLDS[seg.from].id] || 0) >= 1;

    const base = document.createElementNS(NS, 'path');
    base.setAttribute('d', d);
    base.setAttribute('class', seg.soon ? 'wmap-path-soon' : 'wmap-path-base');
    svg.appendChild(base);

    if (isDone) {
      const glow = document.createElementNS(NS, 'path');
      glow.setAttribute('d', d);
      glow.setAttribute('class', 'wmap-path-done');
      glow.style.stroke = WORLDS[seg.from].color;
      svg.appendChild(glow);
    }
  });
  canvas.appendChild(svg);

  // ── World nodes ──
  // Current world = most advanced unlocked+incomplete world
  const currentWorldIdx = WORLDS.reduce((best, w, i) => {
    const unlocked = i === 0 || (progress[WORLDS[i - 1].id] || 0) >= 1;
    return (unlocked && (progress[w.id] || 0) < MAX_LEVELS) ? i : best;
  }, -1);

  WORLDS.forEach((world, i) => {
    const levelsCompleted = progress[world.id] || 0;
    const isUnlocked = i === 0 || (progress[WORLDS[i - 1].id] || 0) >= 1;
    const isComplete = levelsCompleted >= MAX_LEVELS;
    const isCurrent  = i === currentWorldIdx;
    const hasSave    = isUnlocked && !!getWorldSave(world.id);
    const c          = centers[i];
    const stars      = Math.round((levelsCompleted / MAX_LEVELS) * 3);

    const node = document.createElement('div');
    node.className = [
      'wmap-node',
      isUnlocked ? 'wmap-unlocked' : 'wmap-locked',
      isComplete ? 'wmap-done' : isCurrent ? 'wmap-current' : '',
    ].join(' ').trim();
    node.style.left = (c.x - 78) + 'px';
    node.style.top  = (c.y - 78) + 'px';
    node.style.setProperty('--wc', world.color);

    const imgSrc = isUnlocked ? `${world.id}.png` : 'unavailable.png';

    const showLabel = isUnlocked;
    node.innerHTML = `
      <div class="wmap-world-circle">
        <img src="${imgSrc}" alt="${world.name}">
      </div>
      ${showLabel ? `<div class="wmap-label">${world.name}</div>` : ''}
    `;

    if (isUnlocked) {
      node.addEventListener('click', () => {
        if (isComplete) {
          const p = getProgress();
          p[world.id] = 0;
          try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch(e) {}
          deleteWorldSave(world.id);
        }
        startWorld(world.id);
      });
    } else {
      node.addEventListener('click', () => {
        node.classList.add('wmap-shake');
        setTimeout(() => node.classList.remove('wmap-shake'), 380);
      });
    }

    canvas.appendChild(node);
  });

  // ── Coming soon node ──
  const cs = centers[3];
  const soonNode = document.createElement('div');
  soonNode.className = 'wmap-node wmap-soon';
  soonNode.style.left = (cs.x - 78) + 'px';
  soonNode.style.top  = (cs.y - 78) + 'px';
  soonNode.innerHTML = `<div class="wmap-world-circle wmap-circle-soon">
    <img src="coming_soon.png" alt="Coming Soon">
  </div>`;
  canvas.appendChild(soonNode);

  // Focus on the most advanced unlocked world
  const focusIdx = WORLDS.reduce((best, w, i) => {
    const unlocked = i === 0 || (progress[WORLDS[i - 1].id] || 0) >= 1;
    return unlocked ? i : best;
  }, 0);

  list.appendChild(canvas);
  initMapPan(canvas, $('wmap-scroll'), centers[focusIdx]);
}

function initMapPan(canvas, viewport, focus) {
  const CANVAS_H = 1400, CANVAS_W = 1200;
  const HUD_BOTTOM = 90;
  const MIN_SCALE = 0.4, MAX_SCALE = 1.2;
  let scale = 0.7;

  let isDragging = false, wasDrag = false;
  let pointerId = null;
  let startY = 0, startX = 0, downClientY = 0, downClientX = 0;
  let currentY = 0, currentX = 0;
  let velY = 0, velX = 0, lastY = 0, lastX = 0, lastT = 0;
  let rafId = null;

  // Pinch state
  const pointers = new Map();
  let pinchDist0 = 1, pinchScale0 = 1;

  function getMinY() { return Math.min(0, viewport.clientHeight - HUD_BOTTOM - CANVAS_H * scale); }
  function getMinX() { return -Math.max(0, CANVAS_W * scale - viewport.clientWidth) / 2; }
  function getMaxX() { return  Math.max(0, CANVAS_W * scale - viewport.clientWidth) / 2; }

  function rubberClamp(v, min, max) {
    if (v > max) return max + (v - max) * 0.28;
    if (v < min) return min + (v - min) * 0.28;
    return v;
  }

  function clampY(v) { return rubberClamp(v, getMinY(), 0); }
  function clampX(v) { return rubberClamp(v, getMinX(), getMaxX()); }

  function setPos(x, y, animate) {
    canvas.style.transition = animate ? 'transform 0.42s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none';
    canvas.style.transform  = `translateX(${x}px) translateY(${y}px) scale(${scale})`;
  }

  function snapToEdge() {
    const sy = Math.max(getMinY(), Math.min(0, currentY));
    const sx = Math.max(getMinX(), Math.min(getMaxX(), currentX));
    if (sy !== currentY || sx !== currentX) {
      currentY = sy; currentX = sx; setPos(currentX, currentY, true);
    }
  }

  canvas.addEventListener('pointerdown', e => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    canvas.setPointerCapture(e.pointerId);
    cancelAnimationFrame(rafId);
    canvas.style.transition = 'none';

    if (pointers.size === 1) {
      isDragging = true; wasDrag = false;
      pointerId   = e.pointerId;
      downClientY = e.clientY; downClientX = e.clientX;
      startY = e.clientY - currentY; startX = e.clientX - currentX;
      lastY  = e.clientY; lastX  = e.clientX; lastT = Date.now();
      velY = 0; velX = 0;
    } else if (pointers.size === 2) {
      isDragging = false;
      const [p1, p2] = [...pointers.values()];
      pinchDist0  = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
      pinchScale0 = scale;
    }
  });

  canvas.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 2) {
      wasDrag = true;
      const [p1, p2] = [...pointers.values()];
      const dist     = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, pinchScale0 * dist / pinchDist0));
      const ratio    = newScale / scale;
      scale = newScale;

      // Zoom toward pinch midpoint (transform-origin is 50% 0, so Y origin is canvas top)
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      currentX = (midX - viewport.clientWidth / 2) + (currentX - (midX - viewport.clientWidth / 2)) * ratio;
      currentY = midY + (currentY - midY) * ratio;
      currentX = Math.max(getMinX(), Math.min(getMaxX(), currentX));
      currentY = Math.max(getMinY(), Math.min(0, currentY));
      setPos(currentX, currentY, false);
    } else if (pointers.size === 1 && isDragging && e.pointerId === pointerId) {
      if (Math.abs(e.clientY - downClientY) > 6 || Math.abs(e.clientX - downClientX) > 6) wasDrag = true;
      currentY = clampY(e.clientY - startY);
      currentX = clampX(e.clientX - startX);
      const now = Date.now(), dt = Math.max(1, now - lastT);
      velY = (e.clientY - lastY) / dt; velX = (e.clientX - lastX) / dt;
      lastY = e.clientY; lastX = e.clientX; lastT = now;
      setPos(currentX, currentY, false);
    }
  });

  canvas.addEventListener('pointerup', e => {
    pointers.delete(e.pointerId);

    if (pointers.size === 0) {
      isDragging = false;
      cancelAnimationFrame(rafId);
      const FRICTION = 0.91;
      function momentum() {
        velY *= FRICTION; velX *= FRICTION;
        currentY = clampY(currentY + velY * 16);
        currentX = clampX(currentX + velX * 16);
        setPos(currentX, currentY, false);
        if (Math.abs(velY) > 0.15 || Math.abs(velX) > 0.15) rafId = requestAnimationFrame(momentum);
        else snapToEdge();
      }
      if (Math.abs(velY) > 0.2 || Math.abs(velX) > 0.2) momentum(); else snapToEdge();
    } else if (pointers.size === 1) {
      // Lift one finger: smoothly resume single-finger pan
      const [remId, remPos] = [...pointers.entries()][0];
      isDragging  = true;
      pointerId   = remId;
      downClientY = remPos.y; downClientX = remPos.x;
      startY = remPos.y - currentY; startX = remPos.x - currentX;
      lastY  = remPos.y; lastX  = remPos.x; lastT = Date.now();
      velY = 0; velX = 0;
    }
  });

  canvas.addEventListener('pointercancel', e => {
    pointers.delete(e.pointerId);
    if (pointers.size === 0) { isDragging = false; snapToEdge(); }
  });

  // Suppress clicks that follow a drag or pinch
  canvas.addEventListener('click', e => { if (wasDrag) { e.stopPropagation(); wasDrag = false; } }, true);

  // Initial position: world group centered between icon sidebar and right edge; focus node at 72% height
  requestAnimationFrame(() => {
    const fy = focus ? focus.y : CANVAS_H;
    // Icons take ~12px left margin + 73px width → sidebar right edge ≈ 85px.
    // To center canvas-center between sidebar and viewport right: tx = sidebarRightPx / 2
    const sidebarRightPx = 85;
    currentX = Math.max(getMinX(), Math.min(getMaxX(), sidebarRightPx / 2));
    currentY = Math.max(getMinY(), Math.min(0, viewport.clientHeight * 0.72 - fy * scale));
    setPos(currentX, currentY, false);
  });
}

// ── Start / load world ─────────────────────────────────────────────────────────
function startWorld(worldId) {
  hide('overlay-won'); hide('overlay-lost'); hide('overlay-world-done');
  hide('event-card');
  MENU_SCREENS.forEach(hide);

  const save = getWorldSave(worldId);
  if (save) {
    loadWorldSession(save);
  } else {
    const progress = getProgress();
    const levelNum = (progress[worldId] || 0) + 1;
    initState(worldId, levelNum);
    render();
    showIdle();
    setTimeout(() => { if (S.phase === 'playing') showEvent(nextEvent()); }, 800);
  }
}

function loadWorldSession(sv) {
  const world = WORLDS.find(w => w.id === sv.worldId);
  S = {
    worldId:         sv.worldId,
    levelNum:        sv.levelNum || 1,
    worldConfig:     world,
    countryName:     world.name,
    week:            sv.week,
    money:           sv.money,
    factions:        { ...sv.factions },
    tokens:          sv.tokens,
    dangerWeeks:     sv.dangerWeeks,
    conjunctureMods: sv.conjunctureMods || { incomeMod: 0, driftMod: {} },
    phase:           'playing',
    tickTimer:       null,
    tickStart:       0,
    pausedAt:        0,
    prePausePhase:   null,
    currentEvent:    null,
    pool:            shuffle([...world.events, ...EVENTS]),
    poolIdx:         0,
    tax:             sv.tax      || 'mid',
    services:        sv.services || false,
    comms:           sv.comms    || false,
  };
  flushPendingTokens();
  render();
  showIdle();
  startTick();
}

function retrySession() {
  if (S.worldId) startWorld(S.worldId);
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
  if (S.worldId) {
    S.tokens += n;
    saveGame();
    render();
    showShopConfirm(`✓ +${n} tokens afegits a ${S.worldConfig.name}!`);
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

  let income = TAX_INCOME[S.tax] + (S.conjunctureMods.incomeMod || 0);
  if (S.services) income -= POLICY_COSTS.services;
  if (S.comms)    income -= POLICY_COSTS.comms;
  S.money += income;

  const worldDrift = S.worldConfig.drift || DRIFT;
  Object.keys(S.factions).forEach(k => {
    const noise = Math.random() * 1.6 - 0.8;
    let delta = (worldDrift[k] !== undefined ? worldDrift[k] : DRIFT[k]) + noise;
    if (S.services && POLICY_FX.services[k]) delta += POLICY_FX.services[k];
    if (S.comms    && POLICY_FX.comms[k])    delta += POLICY_FX.comms[k];
    if (TAX_FX[S.tax]?.[k]) delta += TAX_FX[S.tax][k];
    if (S.conjunctureMods.driftMod[k]) delta += S.conjunctureMods.driftMod[k];
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
  if (S.poolIdx >= S.pool.length) {
    S.pool = shuffle([...S.worldConfig.events, ...EVENTS]);
    S.poolIdx = 0;
  }
  const remaining = S.pool.slice(S.poolIdx);
  const weights   = remaining.map(eventWeight);
  const total     = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total, chosen = 0;
  for (let i = 0; i < weights.length; i++) { r -= weights[i]; if (r <= 0) { chosen = i; break; } }
  const gi = S.poolIdx + chosen;
  [S.pool[S.poolIdx], S.pool[gi]] = [S.pool[gi], S.pool[S.poolIdx]];
  return S.pool[S.poolIdx++];
}

function eventWeight(evt) {
  let w = 1.0;
  const tone = evt.tone || 'neutral';
  (evt.factions || []).forEach(k => {
    const v = S.factions[k] || 50;
    if (tone === 'crisis') {
      if      (v < 35) w += 3.0;
      else if (v < 50) w += 1.5;
      else if (v < 65) w += 0.2;
    } else if (tone === 'opportunity') {
      if      (v > 70) w += 2.5;
      else if (v > 55) w += 1.2;
      else if (v > 40) w += 0.2;
    } else {
      w += 0.4;
    }
  });
  return w;
}

function showEvent(evt) {
  S.phase = 'event';
  S.currentEvent = evt;
  clearInterval(S.tickTimer);
  $('tick-bar').style.width      = '100%';
  $('tick-bar').style.background = 'var(--warn)';

  $('event-icon').textContent   = evt.icon;
  $('event-title').textContent  = evt.title;
  $('event-text').textContent   = evt.text;

  const [oL, oR] = evt.options;
  $('opt-left-name').textContent     = oL.label;
  $('opt-left-preview').textContent  = oL.preview;
  $('opt-right-name').textContent    = oR.label;
  $('opt-right-preview').textContent = oR.preview;

  const canAfford = opt => {
    const cost = opt.fx && opt.fx.money ? opt.fx.money : 0;
    return cost >= 0 || S.money + cost >= 0;
  };
  const lOk = canAfford(oL), rOk = canAfford(oR);
  $('opt-left-risk').textContent  = lOk ? (oL.risk || '') : '⚠ Sense fons suficients';
  $('opt-right-risk').textContent = rOk ? (oR.risk || '') : '⚠ Sense fons suficients';
  $('choice-left').classList.toggle('choice-disabled',  !lOk);
  $('choice-right').classList.toggle('choice-disabled', !rOk);

  $('event-card').classList.remove('insight-active');
  $('reveal-btn').disabled = S.tokens < 1;
  hide('idle-state');
  show('event-card');

  S.tickStart = Date.now();
  S.tickTimer = setInterval(() => {
    const p = Math.max(0, 1 - (Date.now() - S.tickStart) / EVENT_TIMER_MS);
    $('tick-bar').style.width = (p * 100) + '%';
    if (p <= 0) { clearInterval(S.tickTimer); autoResolveEvent(); }
  }, 80);

  const onClickL = () => {
    if (!$('choice-left').classList.contains('choice-disabled')) flyOff('left',  oL);
  };
  const onClickR = () => {
    if (!$('choice-right').classList.contains('choice-disabled')) flyOff('right', oR);
  };
  const onKey = e => {
    if (S.phase !== 'event') return;
    if (e.key === 'ArrowLeft'  && !$('choice-left').classList.contains('choice-disabled'))  flyOff('left',  oL);
    if (e.key === 'ArrowRight' && !$('choice-right').classList.contains('choice-disabled')) flyOff('right', oR);
  };
  $('choice-left').addEventListener('click',  onClickL);
  $('choice-right').addEventListener('click', onClickR);
  document.addEventListener('keydown', onKey);

  cardCleanup = function() {
    $('choice-left').removeEventListener('click',  onClickL);
    $('choice-right').removeEventListener('click', onClickR);
    document.removeEventListener('keydown', onKey);
  };
}

function autoResolveEvent() {
  if (S.phase !== 'event') return;
  cardCleanup();
  const card = $('event-card');
  card.style.transition = 'opacity 0.25s ease-out';
  card.style.opacity    = '0';
  setTimeout(() => {
    card.style.transition = '';
    card.style.opacity    = '';
    hide('event-card');
    $('choice-left').classList.remove('choice-disabled');
    $('choice-right').classList.remove('choice-disabled');
    resetTickBar();
    const ignore   = S.currentEvent && S.currentEvent.ignore || {};
    const fx       = ignore.fx || {};
    const idleMsg  = ignore.idleMsg || null;
    showResolveFeedback(fx);
    if (fx.veins)      S.factions.veins      = clamp(S.factions.veins      + fx.veins,      5, 96);
    if (fx.mercat)     S.factions.mercat     = clamp(S.factions.mercat     + fx.mercat,     5, 96);
    if (fx.activistes) S.factions.activistes = clamp(S.factions.activistes + fx.activistes, 5, 96);
    if (fx.money)      S.money = Math.max(0, S.money + fx.money);
    S.currentEvent = null;
    $('event-card').classList.remove('insight-active');
    const h = happiness();
    if (h < DANGER_LEVEL) {
      S.dangerWeeks++;
      if (S.dangerWeeks >= DANGER_LIMIT) { endGame(false); return; }
    } else {
      S.dangerWeeks = 0;
    }
    saveGame();
    render();
    showIdle(idleMsg);
    S.phase = 'playing';
    startTick();
  }, 280);
}

function flyOff(direction, opt) {
  if (S.phase !== 'event') return;
  clearInterval(S.tickTimer);
  cardCleanup();
  $('choice-left').classList.remove('choice-disabled');
  $('choice-right').classList.remove('choice-disabled');
  const card = $('event-card');
  const tx   = direction === 'right' ?  window.innerWidth * 1.2 : -window.innerWidth * 1.2;
  const rot  = direction === 'right' ? 25 : -25;
  card.style.transition = 'transform 0.28s ease-in, opacity 0.28s ease-in';
  card.style.transform  = `translateX(${tx}px) rotate(${rot}deg)`;
  card.style.opacity    = '0';
  setTimeout(() => {
    card.style.transition = '';
    card.style.transform  = '';
    card.style.opacity    = '';
    card.classList.remove('insight-active');
    hide('event-card');
    S.currentEvent = null;
    resetTickBar();
    resolve(opt);
  }, 300);
}

function resetTickBar() {
  $('tick-bar').style.width      = '0%';
  $('tick-bar').style.background = '';
}

function resolve(opt) {
  const fx = opt.fx || {};
  showResolveFeedback(fx);
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
  showIdle(opt.idleMsg);
  S.phase = 'playing';
  startTick();
}

function showIdle(msg) {
  $('idle-message').textContent = msg || IDLE_MSGS[Math.floor(Math.random() * IDLE_MSGS.length)];
  show('idle-state');
}

// ── Feedback juice ─────────────────────────────────────────────────────────────
function spawnFloat(text, anchorId, color) {
  const anchor = $(anchorId);
  if (!anchor) return;
  const rect   = anchor.getBoundingClientRect();
  const jitter = (Math.random() - 0.5) * 28;
  const el     = document.createElement('div');
  el.className = 'float-feedback';
  el.textContent = text;
  el.style.left  = (rect.left + rect.width / 2 + jitter) + 'px';
  el.style.top   = (rect.top  + rect.height / 2) + 'px';
  el.style.color = color;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

function shakeEl(id) {
  const el = $(id);
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 400);
}

function showResolveFeedback(fx) {
  const s = v => v > 0 ? '+' : '';
  const c = v => v > 0 ? 'var(--ok)' : 'var(--bad)';
  const fc = S.worldConfig ? S.worldConfig.factionConfig : {
    veins: { icon: '🏘️' }, mercat: { icon: '🏪' }, activistes: { icon: '✊' },
  };
  if (fx.veins)      spawnFloat(`${fc.veins.icon} ${s(fx.veins)}${fx.veins}`,             'bar-veins',      c(fx.veins));
  if (fx.mercat)     spawnFloat(`${fc.mercat.icon} ${s(fx.mercat)}${fx.mercat}`,           'bar-mercat',     c(fx.mercat));
  if (fx.activistes) spawnFloat(`${fc.activistes.icon} ${s(fx.activistes)}${fx.activistes}`, 'bar-activistes', c(fx.activistes));
  if (fx.money) {
    spawnFloat(`💰 ${s(fx.money)}${fx.money}€`, 'money-val', fx.money > 0 ? 'var(--gold)' : 'var(--bad)');
    if (fx.money < 0) shakeEl('money-display');
  }
}

// ── End game ───────────────────────────────────────────────────────────────────
function endGame(win) {
  clearInterval(S.tickTimer);
  deleteWorldSave(S.worldId);

  fromIngame = false;

  if (win) {
    incrementWorldProgress(S.worldId, S.levelNum);
    if (S.levelNum >= MAX_LEVELS) {
      S.phase = 'world-won';
      showWorldComplete();
    } else {
      S.phase = 'between';
      endMandate();
    }
  } else {
    S.phase = 'lost';
    $('survive-weeks').textContent = `${S.worldConfig.name} · Niv ${S.levelNum} · S${S.week - 1}/${MAX_WEEKS}`;
    show('overlay-lost');
  }
}

function showWorldComplete() {
  const h = happiness();
  const score = h * MAX_WEEKS * MAX_LEVELS + S.tokens * 60;
  const face  = h > 75 ? '😄' : h > 55 ? '😐' : h > 35 ? '😟' : '😱';
  $('world-done-title').textContent = `${S.worldConfig.icon} ${S.worldConfig.name} Completat!`;
  $('world-done-text').textContent  =
    `Has superat els ${MAX_LEVELS} nivells sense col·lapse visible. El poble et recordarà. Probablement.`;
  $('world-done-score').textContent = `Puntuació: ${score} · Niv ${MAX_LEVELS}/${MAX_LEVELS}`;
  show('overlay-world-done');
}

// ── Mandate chain ──────────────────────────────────────────────────────────────
function endMandate() {
  const conj = pickConjuncture();
  addBadge(conj.id);
  showConjunctureScreen(conj);
}

function pickConjuncture() {
  const seen   = getBadges();
  const unseen = CONJUNCTURES.filter(c => !seen.includes(c.id));
  const pool   = unseen.length > 0 ? unseen : CONJUNCTURES;
  return pool[Math.floor(Math.random() * pool.length)];
}

function showConjunctureScreen(conj) {
  const score = happiness() * MAX_WEEKS + S.tokens * 60;
  const h     = happiness();
  const face  = h > 75 ? '😄' : h > 55 ? '😐' : h > 35 ? '😟' : '😱';

  $('conj-mandate-done-num').textContent  = S.levelNum;
  $('conj-score-line').textContent        = `${S.worldConfig.icon} ${S.worldConfig.name} · ${score} pts`;
  $('conj-icon').textContent              = conj.icon;
  $('conj-title').textContent             = conj.title;
  $('conj-text').textContent              = conj.text;
  $('conj-carry-money').textContent       = S.money;
  $('conj-carry-happ').textContent        = `${face} ${h}`;
  $('conj-carry-tokens').textContent      = S.tokens;
  $('conj-mandate-next-num').textContent  = S.levelNum + 1;

  const fx   = conj.startFx || {};
  const parts = [];
  if (fx.money)         parts.push(`💰 ${fx.money > 0 ? '+' : ''}${fx.money}€`);
  if (conj.incomeMod)   parts.push(`📈 ${conj.incomeMod > 0 ? '+' : ''}${conj.incomeMod}€/setm.`);
  if (fx.veins)         parts.push(`${S.worldConfig.factionConfig.veins.icon} ${fx.veins > 0 ? '+' : ''}${fx.veins}`);
  if (fx.mercat)        parts.push(`${S.worldConfig.factionConfig.mercat.icon} ${fx.mercat > 0 ? '+' : ''}${fx.mercat}`);
  if (fx.activistes)    parts.push(`${S.worldConfig.factionConfig.activistes.icon} ${fx.activistes > 0 ? '+' : ''}${fx.activistes}`);
  $('conj-effects').textContent = parts.join('  ·  ');

  $('btn-start-mandate')._conj = conj;
  show('conjuncture-screen');
}

function startNextMandate() {
  const conj = $('btn-start-mandate')._conj;
  hide('conjuncture-screen');

  const fx = conj.startFx || {};
  if (fx.money)      S.money = Math.max(0, S.money + fx.money);
  if (fx.veins)      S.factions.veins      = clamp(S.factions.veins      + fx.veins,      5, 96);
  if (fx.mercat)     S.factions.mercat     = clamp(S.factions.mercat     + fx.mercat,     5, 96);
  if (fx.activistes) S.factions.activistes = clamp(S.factions.activistes + fx.activistes, 5, 96);

  S.levelNum++;
  S.week          = 1;
  S.dangerWeeks   = 0;
  S.phase         = 'playing';
  S.pool          = shuffle([...S.worldConfig.events, ...EVENTS]);
  S.poolIdx       = 0;
  S.currentEvent  = null;
  S.conjunctureMods = { incomeMod: conj.incomeMod || 0, driftMod: conj.driftMod || {} };

  hide('event-card');
  $('event-card').classList.remove('insight-active');
  saveGame();
  render();
  showIdle();
  setTimeout(() => { if (S.phase === 'playing') showEvent(nextEvent()); }, 800);
}

// ── Badges screen ──────────────────────────────────────────────────────────────
function openBadges() {
  renderBadges();
  showSub('badges-screen');
}

function renderBadges() {
  const earned = getBadges();
  const grid   = $('badges-grid');
  grid.innerHTML = '';
  CONJUNCTURES.forEach(conj => {
    const unlocked = earned.includes(conj.id);
    const div = document.createElement('div');
    div.className = 'badge-item' + (unlocked ? '' : ' badge-locked');
    div.innerHTML = `
      <span class="badge-icon">${unlocked ? conj.badge.icon : '🔒'}</span>
      <div class="badge-name">${unlocked ? conj.badge.name : '???'}</div>
      <div class="badge-desc">${unlocked ? conj.badge.desc : 'Encara per descobrir'}</div>
    `;
    grid.appendChild(div);
  });
}

// ── Render ─────────────────────────────────────────────────────────────────────
function render() {
  const h = happiness();

  $('happiness-val').textContent  = h;
  $('happiness-face').textContent = h > 75 ? '😄' : h > 55 ? '😐' : h > 35 ? '😟' : '😱';

  if (S.worldConfig) {
    $('week-display').innerHTML =
      `Niv ${S.levelNum} · S<span id="week-val">${S.week}</span>/${MAX_WEEKS}`;
    $('ring-country').textContent = `${S.worldConfig.icon} ${S.worldConfig.name}`;
    const fc = S.worldConfig.factionConfig;
    ['veins', 'mercat', 'activistes'].forEach(k => {
      const iconEl = $(`icon-${k}`), nameEl = $(`name-${k}`);
      if (iconEl) iconEl.textContent = fc[k].icon;
      if (nameEl) nameEl.textContent = fc[k].name;
    });
  } else {
    $('week-display').innerHTML = `S<span id="week-val">${S.week}</span>/${MAX_WEEKS}`;
    $('ring-country').textContent = '';
  }

  $('money-val').textContent = S.money;
  $('token-val').textContent = S.tokens;

  const ringColor = h > 60 ? 'var(--ok)' : h > 35 ? 'var(--warn)' : 'var(--bad)';
  const ringGlow  = h > 60 ? 'rgba(52,211,153,0.42)'  : h > 35 ? 'rgba(251,146,60,0.42)'  : 'rgba(244,63,94,0.42)';
  document.documentElement.style.setProperty('--hring',      ringColor);
  document.documentElement.style.setProperty('--hring-glow', ringGlow);

  const skyH = h > 50 ? 260 + (h - 50) * 1.4  : 245 + h * 0.3;
  const skyS = h > 50 ? 38  + (h - 50) * 1.0  : 30  + h * 0.16;
  const skyL = h > 50 ? 10  + (h - 50) * 0.18 : 6   + h * 0.08;
  document.documentElement.style.setProperty('--sky-h', skyH);
  document.documentElement.style.setProperty('--sky-s', skyS + '%');
  document.documentElement.style.setProperty('--sky-l', skyL + '%');

  const bldAlpha = (0.1 + (h / 100) * 0.22).toFixed(3);
  document.documentElement.style.setProperty('--bld-alpha', bldAlpha);

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
  $('reveal-btn').disabled   = S.phase !== 'event' || S.tokens < 1 ||
    $('event-card').classList.contains('insight-active');

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

function revealInsight() {
  if (S.phase !== 'event' || S.tokens < 1) return;
  S.tokens--;
  $('event-card').classList.add('insight-active');
  render();
}

function togglePause() {
  if (S.phase === 'playing' || S.phase === 'event') {
    S.pausedAt      = Date.now();
    S.prePausePhase = S.phase;
    S.phase         = 'paused';
    clearInterval(S.tickTimer);
  } else if (S.phase === 'paused') {
    S.tickStart += Date.now() - S.pausedAt;
    S.phase = S.prePausePhase || 'playing';
    S.prePausePhase = null;
    resumeActiveTimer();
  }
  render();
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
$('btn-retry').addEventListener('click', () => {
  hide('overlay-won');
  retrySession();
});
$('btn-retry-lost').addEventListener('click', () => {
  hide('overlay-lost');
  retrySession();
});
$('pause-btn').addEventListener('click',    togglePause);
$('spend-tokens').addEventListener('click', spendTokens);
$('reveal-btn').addEventListener('click',   revealInsight);
['low', 'mid', 'high'].forEach(t =>
  $(`tax-${t}`).addEventListener('click', () => setTax(t)));
$('toggle-services').addEventListener('click', () => togglePolicy('services'));
$('toggle-comms').addEventListener('click',    () => togglePolicy('comms'));

$('btn-menu-won').addEventListener('click',       openMainMenu);
$('btn-menu-lost').addEventListener('click',      openMainMenu);
$('btn-world-map-done').addEventListener('click', () => { hide('overlay-world-done'); openWorldMap(); });
$('btn-menu-world-done').addEventListener('click', openMainMenu);

$('menu-ingame-btn').addEventListener('click', openMainMenu);

$('btn-wmap-botiga').addEventListener('click', openBotiga);
$('btn-wmap-badges').addEventListener('click', openBadges);
$('btn-wmap-config').addEventListener('click', openConfig);
$('btn-reprendre').addEventListener('click',   closeMainMenu);
$('btn-start-mandate').addEventListener('click', startNextMandate);

$('btn-back-botiga').addEventListener('click', openWorldMap);
$('btn-back-config').addEventListener('click', openWorldMap);
$('btn-back-badges').addEventListener('click', openWorldMap);

$('btn-buy-10').addEventListener('click',  () => buyTokens(10));
$('btn-buy-100').addEventListener('click', () => buyTokens(100));

document.querySelectorAll('.lang-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lang-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ── Init ───────────────────────────────────────────────────────────────────────
openWorldMap();
