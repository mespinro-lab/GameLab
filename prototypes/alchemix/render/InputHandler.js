/**
 * InputHandler — bridges pointer events on the canvas to game selection logic.
 * No game state mutation here; calls onSelect(positions) when the player
 * presses "Transmuta" with a valid-size selection.
 */

import { MAX_COMBO, MIN_COMBO } from '../engine/constants.js';

export class InputHandler {
  /**
   * @param {Renderer} renderer
   * @param {function(positions: [number,number][]): void} onTransmute
   *   Called when "Transmuta" is pressed with MIN_COMBO..MAX_COMBO pieces selected.
   * @param {function(): void} onHint - called when player taps the hint button
   */
  constructor(renderer, onTransmute, onHint = () => {}) {
    this.renderer    = renderer;
    this.onTransmute = onTransmute;
    this.onHint      = onHint;
    this.selected    = []; // [{row, col}]

    this._bindCanvas();
  }

  _bindCanvas() {
    const canvas = this.renderer.canvas;
    canvas.addEventListener('click',     e => this._onClick(e));
    canvas.addEventListener('touchend',  e => { e.preventDefault(); this._onTouch(e); }, { passive: false });
  }

  _onClick(e) {
    const rect = this.renderer.canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (this.renderer.canvas.width / rect.width);
    const py = (e.clientY - rect.top)  * (this.renderer.canvas.height / rect.height);
    this._handleTap(px, py);
  }

  _onTouch(e) {
    const t    = e.changedTouches[0];
    const rect = this.renderer.canvas.getBoundingClientRect();
    const px = (t.clientX - rect.left) * (this.renderer.canvas.width / rect.width);
    const py = (t.clientY - rect.top)  * (this.renderer.canvas.height / rect.height);
    this._handleTap(px, py);
  }

  _handleTap(px, py) {
    const cell = this.renderer.pixelToCell(px, py);
    if (!cell) return;
    const [row, col] = cell;
    const key = `${row},${col}`;

    const existingIdx = this.selected.findIndex(s => s.row === row && s.col === col);
    if (existingIdx >= 0) {
      // Deselect
      this.selected.splice(existingIdx, 1);
    } else if (this.selected.length < MAX_COMBO) {
      // Add to selection
      this.selected.push({ row, col });
    }

    this._syncHighlight();
  }

  _syncHighlight() {
    const { renderer, selected } = this;
    renderer.selectedCells.clear();
    for (const { row, col } of selected) {
      renderer.selectedCells.add(`${row},${col}`);
    }
  }

  /** Clear all selections — called by game after transmutation. */
  clearSelection() {
    this.selected = [];
    this._syncHighlight();
  }

  /** Returns current selection as [[row,col], ...] */
  getPositions() {
    return this.selected.map(({ row, col }) => [row, col]);
  }

  /** Returns true if selection count is in valid range for a transmutation attempt. */
  canAttemptTransmute() {
    return this.selected.length >= MIN_COMBO && this.selected.length <= MAX_COMBO;
  }
}
