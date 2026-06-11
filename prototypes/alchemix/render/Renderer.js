/**
 * Renderer — draws the board onto an HTML5 Canvas.
 * Zero game logic; reads the Board model as a read-only data source.
 *
 * Visual encoding (spec §2.1):
 *   Element  → shape/icon drawn in cell centre
 *   Potency  → 1-3 pips (small circles) in bottom-right
 *   State    → border style  (solid / dashed / dotted)
 *   Origin   → background tint (warm / cool / dark)
 */

import { ELEMENT_NAMES, STATE_NAMES, ORIGIN_NAMES } from '../engine/constants.js';

// --- palette ---
const ORIGIN_BG   = ['#3d2b1f', '#1e1b38', '#101010']; // natural/arcane/void
const ELEMENT_CLR = ['#ff6b35', '#4fc3f7', '#8bc34a', '#b39ddb']; // fire/water/earth/air
const STATE_DASH  = [[], [6, 3], [2, 3]]; // solid / liquid / gas dash patterns

const CELL_PAD    = 6;   // px inside cell before drawing piece
const PIP_R       = 3;   // pip radius
const CORNER_R    = 8;   // cell corner radius
const SELECT_GLOW = 4;   // selection ring width
const BORDER_W    = 3;   // normal border width

export class Renderer {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {Board} board
   */
  constructor(canvas, board) {
    this.canvas = canvas;
    this.board  = board;
    this.ctx    = canvas.getContext('2d');

    // Selection state (managed externally by InputHandler)
    this.selectedCells  = new Set();  // "row,col" strings
    this.highlightCells = new Set();  // hint or invalid feedback
    this.highlightColor = '#4ade80';  // green for valid, red for invalid

    // Per-cell animated offsets (for gravity / refill animations)
    // Map "row,col" → {dx, dy, alpha}
    this.cellOverrides = new Map();

    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    const { board, canvas } = this;
    const maxW = Math.min(canvas.parentElement?.clientWidth ?? 400, 500);
    this.cellSize = Math.floor((maxW - 16) / board.cols);
    canvas.width  = this.cellSize * board.cols;
    canvas.height = this.cellSize * board.rows;
  }

  /** Full redraw — called every RAF tick. */
  render() {
    const { ctx, board, cellSize } = this;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let row = 0; row < board.rows; row++) {
      for (let col = 0; col < board.cols; col++) {
        this._drawCell(row, col);
      }
    }
  }

  _drawCell(row, col) {
    const { ctx, board, cellSize } = this;
    const piece = board.get(row, col);
    const key   = `${row},${col}`;

    const override = this.cellOverrides.get(key) ?? {};
    const alpha = override.alpha ?? 1;
    const dx    = override.dx ?? 0;
    const dy    = override.dy ?? 0;

    const x = col * cellSize + dx;
    const y = row * cellSize + dy;
    const s = cellSize;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Draw cell background (grid slot)
    ctx.fillStyle = '#1f1f2e';
    this._roundRect(x + 2, y + 2, s - 4, s - 4, CORNER_R);
    ctx.fill();

    if (piece) {
      // Origin background tint
      const originIdx = piece.attrs[3];
      ctx.fillStyle = ORIGIN_BG[originIdx] ?? ORIGIN_BG[0];
      this._roundRect(x + CELL_PAD, y + CELL_PAD, s - CELL_PAD*2, s - CELL_PAD*2, CORNER_R - 2);
      ctx.fill();

      // State border
      const stateIdx = piece.attrs[2];
      ctx.strokeStyle = '#888';
      ctx.lineWidth = BORDER_W;
      ctx.setLineDash(STATE_DASH[stateIdx] ?? []);
      this._roundRect(x + CELL_PAD, y + CELL_PAD, s - CELL_PAD*2, s - CELL_PAD*2, CORNER_R - 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Element icon
      this._drawElement(x + s/2, y + s/2 - 4, s * 0.32, piece.attrs[0], piece.special);

      // Potency pips
      this._drawPips(x, y, s, piece.attrs[1] + 1); // potency is 0-indexed internally
    }

    // Selection highlight
    if (this.selectedCells.has(key)) {
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = SELECT_GLOW;
      ctx.setLineDash([]);
      this._roundRect(x + CELL_PAD - 2, y + CELL_PAD - 2, s - CELL_PAD*2 + 4, s - CELL_PAD*2 + 4, CORNER_R);
      ctx.stroke();
    }

    // Hint / invalid feedback highlight
    if (this.highlightCells.has(key)) {
      ctx.strokeStyle = this.highlightColor;
      ctx.lineWidth = SELECT_GLOW + 2;
      ctx.setLineDash([4, 3]);
      this._roundRect(x + CELL_PAD - 3, y + CELL_PAD - 3, s - CELL_PAD*2 + 6, s - CELL_PAD*2 + 6, CORNER_R + 1);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  _drawElement(cx, cy, r, elemIdx, special) {
    const { ctx } = this;
    const clr = ELEMENT_CLR[elemIdx] ?? '#ccc';
    ctx.fillStyle = clr;
    ctx.strokeStyle = clr;
    ctx.lineWidth = 2;

    if (special) {
      // Philosopher's catalyst: star burst
      this._drawStar(cx, cy, r, 8);
      return;
    }

    switch (elemIdx) {
      case 0: this._drawFlame(cx, cy, r); break;   // fire
      case 1: this._drawDrop(cx, cy, r);  break;   // water
      case 2: this._drawHex(cx, cy, r);   break;   // earth
      case 3: this._drawSpiral(cx, cy, r); break;  // air
      default: this._drawCircle(cx, cy, r * 0.7); break;
    }
  }

  _drawFlame(cx, cy, r) {
    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.bezierCurveTo(cx + r*0.7, cy - r*0.3, cx + r*0.8, cy + r*0.4, cx, cy + r*0.8);
    ctx.bezierCurveTo(cx - r*0.8, cy + r*0.4, cx - r*0.7, cy - r*0.3, cx, cy - r);
    ctx.fill();
  }

  _drawDrop(cx, cy, r) {
    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.bezierCurveTo(cx + r, cy - r * 0.2, cx + r, cy + r * 0.6, cx, cy + r);
    ctx.bezierCurveTo(cx - r, cy + r * 0.6, cx - r, cy - r * 0.2, cx, cy - r);
    ctx.fill();
  }

  _drawHex(cx, cy, r) {
    const { ctx } = this;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 - Math.PI / 6;
      if (i === 0) ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
      else         ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    }
    ctx.closePath();
    ctx.fill();
  }

  _drawSpiral(cx, cy, r) {
    const { ctx } = this;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let t = 0; t <= 4 * Math.PI; t += 0.1) {
      const rad = (r * t) / (4 * Math.PI);
      const x = cx + rad * Math.cos(t);
      const y = cy + rad * Math.sin(t);
      t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  _drawStar(cx, cy, r, points) {
    const { ctx } = this;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const a   = (i * Math.PI) / points - Math.PI / 2;
      const rad = i % 2 === 0 ? r : r * 0.45;
      const x   = cx + rad * Math.cos(a);
      const y   = cy + rad * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  _drawCircle(cx, cy, r) {
    const { ctx } = this;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawPips(x, y, s, count) {
    const { ctx } = this;
    ctx.fillStyle = '#ffffffcc';
    const startX = x + s - CELL_PAD - PIP_R;
    const startY = y + s - CELL_PAD - PIP_R;
    for (let i = 0; i < count; i++) {
      ctx.beginPath();
      ctx.arc(startX - i * (PIP_R * 2 + 2), startY, PIP_R, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _roundRect(x, y, w, h, r) {
    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /** Convert canvas pixel coords to [row, col]. Returns null if out of bounds. */
  pixelToCell(px, py) {
    const col = Math.floor(px / this.cellSize);
    const row = Math.floor(py / this.cellSize);
    if (row < 0 || row >= this.board.rows || col < 0 || col >= this.board.cols) return null;
    return [row, col];
  }

  /** Show score popup at a cell position. Fades out over 900ms. */
  showScorePopup(row, col, text, color = '#ffd700') {
    const x = col * this.cellSize + this.cellSize / 2;
    const y = row * this.cellSize + this.cellSize / 2;
    const popup = { x, y: y - 10, text, color, alpha: 1, start: performance.now(), dur: 900 };
    if (!this._popups) this._popups = [];
    this._popups.push(popup);
  }

  renderPopups(now) {
    if (!this._popups?.length) return;
    const { ctx } = this;
    this._popups = this._popups.filter(p => {
      const t = (now - p.start) / p.dur;
      if (t >= 1) return false;
      ctx.save();
      ctx.globalAlpha = 1 - t;
      ctx.fillStyle = p.color;
      ctx.font = `bold ${Math.floor(this.cellSize * 0.3)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(p.text, p.x, p.y - t * 30);
      ctx.restore();
      return true;
    });
  }
}
