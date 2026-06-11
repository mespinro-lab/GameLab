import { Board }                           from './engine/Board.js';
import { isValidCombo, comboType }         from './engine/ComboValidator.js';
import { findFirstValidComboWithPositions } from './engine/SolvabilityChecker.js';
import { calculateComboScore }             from './engine/Scoring.js';
import { generateObjective, checkObjective } from './engine/ObjectiveGenerator.js';
import { getPreset, scoreToLevel }         from './engine/DifficultyRamp.js';
import { CATALYST_SIZE, MIN_COMBO }        from './engine/constants.js';

import { Renderer }     from './render/Renderer.js';
import { InputHandler } from './render/InputHandler.js';
import { Animator }     from './render/Animator.js';

export class AlchemixGame {
  constructor(canvas, startDifficulty = 0) {
    this.difficulty = startDifficulty;
    this.preset     = getPreset(startDifficulty);
    this._busy      = false;

    this.board    = new Board(this.preset);
    this.renderer = new Renderer(canvas, this.board);
    this.animator = new Animator(this.renderer);
    this.input    = new InputHandler(
      this.renderer,
      () => this._onTransmuteRequest(),
      () => this._onHintRequest(),
      (n, valid) => this._onSelectionChange(n, valid),
    );
    this.input.setActiveAttributes(this.preset.activeAttributes);

    this._initState();
    this._bindUI();

    // Defer first resize one frame so the layout is painted
    requestAnimationFrame(() => {
      this.renderer._resize();
      this._loop(performance.now());
    });
  }

  // ── state ──────────────────────────────────────────────────────────────────

  _initState() {
    this.state = {
      score:           0,
      totalCombos:     0,
      maxComboSize:    0,
      comboTypeCounts: { pure: 0, chaos: 0, mixed: 0 },
      poursUsed:       0,
      gameOver:        false,
      objectives:      [generateObjective(this.difficulty)],
    };
  }

  // ── RAF loop ───────────────────────────────────────────────────────────────

  _loop(now) {
    this.animator.tick(now);
    this.renderer.render();
    this.renderer.renderPopups(now);
    requestAnimationFrame(t => this._loop(t));
  }

  // ── selection feedback (called on every tap) ───────────────────────────────

  _onSelectionChange(count, valid) {
    const btn   = document.getElementById('btn-transmute');
    const info  = document.getElementById('sel-info');

    if (info) {
      if (count === 0) {
        info.textContent = 'Selecciona 3–5 peces';
        info.style.color = '#64748b';
      } else if (count < MIN_COMBO) {
        info.textContent = `${count} seleccionada${count > 1 ? 'des' : ''} — en calen ${MIN_COMBO - count} més`;
        info.style.color = '#94a3b8';
      } else if (valid) {
        info.textContent = `✓ ${count} peces — combo vàlid!`;
        info.style.color = '#4ade80';
      } else {
        info.textContent = `✗ ${count} peces — combo invàlid`;
        info.style.color = '#f87171';
      }
    }

    if (btn) {
      btn.disabled = !valid || this._busy;
      btn.classList.toggle('active', valid && !this._busy);
    }
  }

  // ── transmutation ──────────────────────────────────────────────────────────

  _onTransmuteRequest() {
    if (this._busy || this.state.gameOver) return;
    if (!this.input.canAttemptTransmute()) return;

    const positions = this.input.getPositions();
    const pieces    = positions.map(([r, c]) => this.board.get(r, c));

    // Double-check (safety; InputHandler already validates)
    if (!isValidCombo(pieces, this.preset.activeAttributes)) {
      this.animator.playInvalidFeedback(positions);
      this.input.clearSelection();
      return;
    }

    this.input.clearSelection();
    this._busy = true;
    document.getElementById('btn-transmute').disabled = true;

    this._executeCombo(positions, pieces).then(() => {
      this._busy = false;
      this._onSelectionChange(0, false);
      this._updateScoreUI();
      this._checkObjectives();
      this._checkDifficultyRamp();
      this._checkGameOver();
    });
  }

  async _executeCombo(positions, pieces) {
    const score = calculateComboScore(pieces, this.preset.activeAttributes, 0);
    const type  = comboType(pieces, this.preset.activeAttributes);
    const size  = pieces.length;

    this.state.score         += score;
    this.state.totalCombos   += 1;
    this.state.maxComboSize   = Math.max(this.state.maxComboSize, size);
    this.state.comboTypeCounts[type] = (this.state.comboTypeCounts[type] ?? 0) + 1;

    const [pr, pc] = positions[0];
    const colorByType = { pure: '#ffd700', chaos: '#a78bfa', mixed: '#4ade80' };
    this.renderer.showScorePopup(pr, pc, `+${score}`, colorByType[type]);

    // Remove + animate
    await this.animator.playComboRemove(positions);
    this.board.removePieces(positions);

    // Catalyst: size-5 clears the row of the first removed piece
    if (size >= CATALYST_SIZE) {
      await this._triggerCatalyst(pr);
    }

    // Gravity
    const movements = this.board.applyGravity();
    if (movements.length > 0) await this.animator.playGravity(movements);

    // Refill — always; no auto-cascade (would remove player agency)
    const newPieces = this.board.refill();
    this.state.poursUsed++;
    if (newPieces.length > 0) await this.animator.playRefill(newPieces);
  }

  async _triggerCatalyst(targetRow) {
    const positions = [];
    for (let col = 0; col < this.board.cols; col++) {
      if (this.board.get(targetRow, col)) positions.push([targetRow, col]);
    }
    if (!positions.length) return;
    await this.animator.playComboRemove(positions);
    this.board.removePieces(positions);
    this._flash('⚗️ Catalitzador del Filòsof!', '#ffd700');
  }

  // ── hint ───────────────────────────────────────────────────────────────────

  _onHintRequest() {
    if (this._busy) return;
    this.input.clearSelection();
    const hint = findFirstValidComboWithPositions(this.board.grid, this.preset.activeAttributes);
    if (hint) this.animator.playHint(hint.positions);
  }

  // ── objectives & difficulty ────────────────────────────────────────────────

  _checkObjectives() {
    for (const obj of this.state.objectives) {
      if (!obj.done && checkObjective(obj, this.state)) {
        obj.done = true;
        this._flash(`🏆 ${obj.label}`, '#ffd700');
        this.state.objectives.push(generateObjective(this.difficulty));
        this._updateObjectiveUI();
      }
    }
  }

  _checkDifficultyRamp() {
    const newLevel = scoreToLevel(this.state.score);
    if (newLevel > this.difficulty) {
      this.difficulty                  = newLevel;
      this.preset                      = getPreset(newLevel);
      this.board.activeAttributes      = this.preset.activeAttributes;
      this.board.valuesPerAttr         = this.preset.valuesPerAttr;
      this.input.setActiveAttributes(this.preset.activeAttributes);
      this._flash(`⬆️ ${this.preset.label}!`, '#a78bfa');
      this._updateDifficultyUI();
    }
  }

  _checkGameOver() {
    const { preset, state } = this;
    if (preset.pourLimit !== null && state.poursUsed >= preset.pourLimit) {
      state.gameOver = true;
      document.getElementById('final-score').textContent = state.score.toLocaleString();
      document.getElementById('game-over').classList.remove('hidden');
    }
  }

  // ── UI helpers ─────────────────────────────────────────────────────────────

  _bindUI() {
    document.getElementById('btn-transmute')
      ?.addEventListener('click', () => this._onTransmuteRequest());
    document.getElementById('btn-hint')
      ?.addEventListener('click', () => this._onHintRequest());
    document.getElementById('btn-restart')
      ?.addEventListener('click', () => this._restart());
    document.getElementById('go-restart')
      ?.addEventListener('click', () => this._restart());

    this._updateScoreUI();
    this._updateObjectiveUI();
    this._updateDifficultyUI();
  }

  _updateScoreUI() {
    const el = id => document.getElementById(id);
    if (el('score'))  el('score').textContent  = this.state.score.toLocaleString();
    if (el('pours'))  el('pours').textContent  = this.preset.pourLimit !== null
      ? `${this.state.poursUsed} / ${this.preset.pourLimit}`
      : `${this.state.poursUsed}`;
  }

  _updateObjectiveUI() {
    const pending = this.state.objectives.find(o => !o.done);
    const el = document.getElementById('objective');
    if (el) el.textContent = pending ? pending.label : '—';
  }

  _updateDifficultyUI() {
    const el = document.getElementById('difficulty');
    if (el) el.textContent = this.preset.label;

    // Update attribute badge list
    const names = ['Element', 'Potència', 'Estat', 'Origen'];
    const el2 = document.getElementById('active-attrs');
    if (el2) el2.textContent = this.preset.activeAttributes.map(i => names[i]).join(' + ');
  }

  _flash(text, color) {
    const msg = document.getElementById('msg');
    if (!msg) return;
    msg.textContent = text;
    msg.style.color = color;
    msg.style.opacity = '1';
    clearTimeout(this._msgTimer);
    this._msgTimer = setTimeout(() => { msg.style.opacity = '0'; }, 2500);
  }

  _restart() {
    document.getElementById('game-over')?.classList.add('hidden');
    this.difficulty              = 0;
    this.preset                  = getPreset(0);
    this.board                   = new Board(this.preset);
    this.renderer.board          = this.board;
    this.input.setActiveAttributes(this.preset.activeAttributes);
    this.input.clearSelection();
    this._busy                   = false;
    this._initState();
    this._updateScoreUI();
    this._updateObjectiveUI();
    this._updateDifficultyUI();
    this._onSelectionChange(0, false);
  }
}
