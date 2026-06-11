/**
 * AlchemixGame — wires engine + render into a running endless game.
 *
 * Architecture:
 *   engine/* → pure logic (Board, ComboValidator, Scoring, …)
 *   render/*  → Canvas drawing + input
 *   game.js   → game-loop glue only; no business logic lives here
 */

import { Board }                      from './engine/Board.js';
import { isValidCombo, comboType }    from './engine/ComboValidator.js';
import { findFirstValidComboWithPositions } from './engine/SolvabilityChecker.js';
import { calculateComboScore }        from './engine/Scoring.js';
import { generateObjective, checkObjective } from './engine/ObjectiveGenerator.js';
import { getPreset, scoreToLevel }    from './engine/DifficultyRamp.js';
import { CATALYST_SIZE }              from './engine/constants.js';

import { Renderer }                   from './render/Renderer.js';
import { InputHandler }               from './render/InputHandler.js';
import { Animator }                   from './render/Animator.js';

export class AlchemixGame {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {HTMLElement}       ui      - container for score / objective / buttons
   * @param {number}            startDifficulty
   */
  constructor(canvas, ui, startDifficulty = 0) {
    this.ui         = ui;
    this.difficulty = startDifficulty;
    this.preset     = getPreset(startDifficulty);

    this.board    = new Board(this.preset);
    this.renderer = new Renderer(canvas, this.board);
    this.animator = new Animator(this.renderer);
    this.input    = new InputHandler(
      this.renderer,
      () => this._onTransmuteRequest(),
      () => this._onHintRequest(),
    );

    this._initState();
    this._bindUI();
    this._loop(performance.now());
  }

  // --- state ---

  _initState() {
    this.state = {
      score:            0,
      totalCombos:      0,
      maxComboSize:     0,
      comboTypeCounts:  { pure: 0, chaos: 0, mixed: 0 },
      cascadeLevel:     0,
      poursUsed:        0,
      gameOver:         false,
      objectives:       [generateObjective(this.difficulty)],
      objectivesDone:   0,
    };
  }

  // --- RAF loop ---

  _loop(now) {
    if (!this.state.gameOver) {
      this.animator.tick(now);
      this.renderer.render();
      this.renderer.renderPopups(now);
    }
    requestAnimationFrame(t => this._loop(t));
  }

  // --- transmutation ---

  _onTransmuteRequest() {
    if (this._busy) return;
    if (!this.input.canAttemptTransmute()) return;

    const positions = this.input.getPositions();
    const pieces    = positions.map(([r, c]) => this.board.get(r, c));

    if (!isValidCombo(pieces, this.preset.activeAttributes)) {
      this._busy = true;
      this.animator.playInvalidFeedback(positions).then(() => { this._busy = false; });
      this.input.clearSelection();
      this._showMsg('Combo invàlid', '#f87171');
      return;
    }

    this.input.clearSelection();
    this._busy = true;
    this._executeCombo(positions, pieces, 0).then(() => { this._busy = false; });
  }

  async _executeCombo(positions, pieces, cascadeLevel) {
    const score = calculateComboScore(pieces, this.preset.activeAttributes, cascadeLevel);
    const type  = comboType(pieces, this.preset.activeAttributes);
    const size  = pieces.length;

    // Update state
    this.state.score          += score;
    this.state.totalCombos    += 1;
    this.state.maxComboSize    = Math.max(this.state.maxComboSize, size);
    this.state.comboTypeCounts[type] = (this.state.comboTypeCounts[type] ?? 0) + 1;

    // Show score popup on first removed piece
    const [pr, pc] = positions[0];
    const label = cascadeLevel > 0 ? `+${score} ×${cascadeLevel + 1}` : `+${score}`;
    this.renderer.showScorePopup(pr, pc, label, type === 'pure' ? '#ffd700' : type === 'chaos' ? '#a78bfa' : '#4ade80');

    // Animate removal
    await this.animator.playComboRemove(positions);
    this.board.removePieces(positions);

    // Handle catalyst (size-5 combo)
    if (size >= CATALYST_SIZE) {
      await this._triggerCatalyst(pr);
    }

    // Gravity
    const movements = this.board.applyGravity();
    if (movements.length > 0) await this.animator.playGravity(movements);

    // Auto-cascade: check if any newly placed piece is in a valid combo
    const cascade = findFirstValidComboWithPositions(this.board.grid, this.preset.activeAttributes);
    if (cascade && cascadeLevel < 5) {
      await this._executeCombo(
        cascade.positions.map(({ row, col }) => [row, col]),
        cascade.pieces,
        cascadeLevel + 1,
      );
    } else {
      // Refill
      const newPieces = this.board.refill();
      this.state.poursUsed++;
      if (newPieces.length > 0) await this.animator.playRefill(newPieces);
    }

    this._updateUI();
    this._checkObjectives();
    this._checkDifficultyRamp();
    this._checkGameOver();
  }

  async _triggerCatalyst(targetRow) {
    // Clear the entire row
    const positions = [];
    for (let col = 0; col < this.board.cols; col++) {
      if (this.board.get(targetRow, col)) positions.push([targetRow, col]);
    }
    if (positions.length > 0) {
      await this.animator.playComboRemove(positions);
      this.board.removePieces(positions);
      this._showMsg('Catalitzador del Filòsof!', '#ffd700');
    }
  }

  // --- hint ---

  _onHintRequest() {
    if (this._busy) return;
    const hint = findFirstValidComboWithPositions(this.board.grid, this.preset.activeAttributes);
    if (hint) {
      this.animator.playHint(hint.positions);
    }
  }

  // --- objective & difficulty ---

  _checkObjectives() {
    const { state } = this;
    for (const obj of state.objectives) {
      if (!obj.done && checkObjective(obj, state)) {
        obj.done = true;
        state.objectivesDone++;
        this._showMsg(`Objectiu: ${obj.label}`, '#ffd700');
        // Add a fresh objective
        state.objectives.push(generateObjective(this.difficulty));
      }
    }
  }

  _checkDifficultyRamp() {
    const newLevel = scoreToLevel(this.state.score);
    if (newLevel > this.difficulty) {
      this.difficulty = newLevel;
      this.preset     = getPreset(newLevel);
      this.board.activeAttributes = this.preset.activeAttributes;
      this.board.valuesPerAttr    = this.preset.valuesPerAttr;
      this._showMsg(`Dificultat: ${this.preset.label}!`, '#a78bfa');
    }
  }

  _checkGameOver() {
    const { preset, state } = this;
    if (preset.pourLimit !== null && state.poursUsed >= preset.pourLimit) {
      state.gameOver = true;
      this._showGameOver();
    }
  }

  // --- UI ---

  _bindUI() {
    const el = id => this.ui.querySelector(`#${id}`);

    const transmuteBtn = el('btn-transmute');
    if (transmuteBtn) transmuteBtn.addEventListener('click', () => this._onTransmuteRequest());

    const hintBtn = el('btn-hint');
    if (hintBtn) hintBtn.addEventListener('click', () => this._onHintRequest());

    const restartBtn = el('btn-restart');
    if (restartBtn) restartBtn.addEventListener('click', () => this._restart());

    this._updateUI();
  }

  _updateUI() {
    const { state, preset, ui } = this;
    const el = id => ui.querySelector(`#${id}`);

    const scoreEl = el('score');
    if (scoreEl) scoreEl.textContent = state.score.toLocaleString();

    const pourEl = el('pours');
    if (pourEl) {
      pourEl.textContent = preset.pourLimit !== null
        ? `${state.poursUsed} / ${preset.pourLimit}`
        : `${state.poursUsed}`;
    }

    const diffEl = el('difficulty');
    if (diffEl) diffEl.textContent = preset.label;

    const objEl = el('objective');
    if (objEl) {
      const pending = state.objectives.find(o => !o.done);
      objEl.textContent = pending ? pending.label : '—';
    }

    const transBtn = ui.querySelector('#btn-transmute');
    if (transBtn) {
      const canTx = this.input.canAttemptTransmute();
      transBtn.disabled = !canTx;
      transBtn.classList.toggle('active', canTx);
    }
  }

  _showMsg(text, color = '#fff') {
    const msgEl = this.ui.querySelector('#msg');
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.style.color = color;
    msgEl.style.opacity = '1';
    clearTimeout(this._msgTimer);
    this._msgTimer = setTimeout(() => { msgEl.style.opacity = '0'; }, 2000);
  }

  _showGameOver() {
    const overlay = this.ui.querySelector('#game-over');
    if (!overlay) return;
    overlay.classList.remove('hidden');
    const finalScore = overlay.querySelector('#final-score');
    if (finalScore) finalScore.textContent = this.state.score.toLocaleString();
  }

  _restart() {
    const overlay = this.ui.querySelector('#game-over');
    if (overlay) overlay.classList.add('hidden');
    this.difficulty = 0;
    this.preset     = getPreset(0);
    this.board      = new Board(this.preset);
    this.renderer.board = this.board;
    this.input.renderer = this.renderer;
    this.input.clearSelection();
    this._initState();
    this._updateUI();
  }
}
