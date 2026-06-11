import { MAX_COMBO, MIN_COMBO } from '../engine/constants.js';
import { isValidCombo } from '../engine/ComboValidator.js';

export class InputHandler {
  /**
   * @param {Renderer} renderer
   * @param {function(positions:[number,number][], pieces:Piece[]): void} onTransmute
   * @param {function(): void} onHint
   * @param {function(selCount:number, valid:boolean): void} onSelectionChange
   *   Called after every tap so the game can update the UI reactively.
   */
  constructor(renderer, onTransmute, onHint, onSelectionChange) {
    this.renderer          = renderer;
    this.onTransmute       = onTransmute;
    this.onHint            = onHint;
    this.onSelectionChange = onSelectionChange ?? (() => {});
    this.selected          = []; // [{row, col}]
    this._activeAttrs      = [0, 1]; // updated by game on difficulty change

    this._bindCanvas();
  }

  setActiveAttributes(attrs) {
    this._activeAttrs = attrs;
  }

  _bindCanvas() {
    const c = this.renderer.canvas;
    c.addEventListener('click',    e => this._onClick(e));
    c.addEventListener('touchend', e => { e.preventDefault(); this._onTouch(e); }, { passive: false });
  }

  _onClick(e) {
    const rect = this.renderer.canvas.getBoundingClientRect();
    const scaleX = this.renderer.canvas.width  / rect.width;
    const scaleY = this.renderer.canvas.height / rect.height;
    this._handleTap((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
  }

  _onTouch(e) {
    const t    = e.changedTouches[0];
    const rect = this.renderer.canvas.getBoundingClientRect();
    const scaleX = this.renderer.canvas.width  / rect.width;
    const scaleY = this.renderer.canvas.height / rect.height;
    this._handleTap((t.clientX - rect.left) * scaleX, (t.clientY - rect.top) * scaleY);
  }

  _handleTap(px, py) {
    const cell = this.renderer.pixelToCell(px, py);
    if (!cell) return;
    const [row, col] = cell;

    const idx = this.selected.findIndex(s => s.row === row && s.col === col);
    if (idx >= 0) {
      this.selected.splice(idx, 1);
    } else if (this.selected.length < MAX_COMBO) {
      this.selected.push({ row, col });
    }

    this._syncHighlight();

    const n     = this.selected.length;
    const valid = n >= MIN_COMBO && this._isCurrentSelectionValid();
    this.onSelectionChange(n, valid);
  }

  _isCurrentSelectionValid() {
    if (this.selected.length < MIN_COMBO) return false;
    const pieces = this.selected.map(({ row, col }) => this.renderer.board.get(row, col));
    return isValidCombo(pieces, this._activeAttrs);
  }

  _syncHighlight() {
    this.renderer.selectedCells.clear();
    for (const { row, col } of this.selected) {
      this.renderer.selectedCells.add(`${row},${col}`);
    }
  }

  clearSelection() {
    this.selected = [];
    this._syncHighlight();
    this.onSelectionChange(0, false);
  }

  getPositions() {
    return this.selected.map(({ row, col }) => [row, col]);
  }

  canAttemptTransmute() {
    return this.selected.length >= MIN_COMBO && this._isCurrentSelectionValid();
  }
}
