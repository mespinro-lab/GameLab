/**
 * Animator — manages per-cell animated overrides consumed by Renderer.
 * All animations are Promise-based; awaiting them gives the game loop a clean
 * "animation done, proceed" signal.
 *
 * Technique: each animation writes into renderer.cellOverrides for the duration,
 * then removes itself on completion.
 */

export class Animator {
  /** @param {Renderer} renderer */
  constructor(renderer) {
    this.renderer = renderer;
    this._active  = []; // [{update, done, resolve}]
  }

  /**
   * Advance all active animations by one tick.
   * Called from the main RAF loop.
   */
  tick(now) {
    this._active = this._active.filter(anim => {
      const t = Math.min((now - anim.start) / anim.dur, 1);
      anim.update(t);
      if (t >= 1) { anim.resolve(); return false; }
      return true;
    });
  }

  /** Returns true while at least one animation is running. */
  get busy() { return this._active.length > 0; }

  // --- public animations ---

  /**
   * Flash selected cells, then fade them out (transmutation effect).
   * @param {[number,number][]} positions
   * @returns {Promise<void>}
   */
  playComboRemove(positions) {
    const { renderer } = this;
    const keys = positions.map(([r, c]) => `${r},${c}`);

    // Phase 1: flash bright (150ms)
    // Phase 2: fade out (300ms)
    return this._sequence([
      () => this._flash(keys, 150),
      () => this._fadeOut(keys, 300),
    ]).then(() => {
      for (const k of keys) renderer.cellOverrides.delete(k);
    });
  }

  /**
   * Animate gravity movements: pieces slide from their old positions to new ones.
   * @param {{from:[number,number], to:[number,number]}[]} movements
   * @returns {Promise<void>}
   */
  playGravity(movements) {
    const { renderer } = this;
    const { cellSize } = renderer;
    const dur = 250;
    const start = performance.now();

    return new Promise(resolve => {
      this._active.push({
        start, dur,
        update: t => {
          const ease = 1 - Math.pow(1 - t, 3); // cubic ease-out
          for (const { from, to } of movements) {
            const toKey = `${to[0]},${to[1]}`;
            const dy = (from[0] - to[0]) * cellSize * (1 - ease);
            renderer.cellOverrides.set(toKey, { dx: 0, dy, alpha: 1 });
          }
        },
        resolve: () => {
          for (const { to } of movements) renderer.cellOverrides.delete(`${to[0]},${to[1]}`);
          resolve();
        },
      });
    });
  }

  /**
   * New pieces fall in from above their final row.
   * @param {{row:number, col:number}[]} newPieces
   * @returns {Promise<void>}
   */
  playRefill(newPieces) {
    const { renderer } = this;
    const { cellSize } = renderer;
    const dur = 300;
    const start = performance.now();

    return new Promise(resolve => {
      this._active.push({
        start, dur,
        update: t => {
          const ease = 1 - Math.pow(1 - t, 2); // quadratic ease-out
          for (const { row, col } of newPieces) {
            const key = `${row},${col}`;
            const dy = -cellSize * (1 - ease);
            renderer.cellOverrides.set(key, { dx: 0, dy, alpha: ease });
          }
        },
        resolve: () => {
          for (const { row, col } of newPieces) renderer.cellOverrides.delete(`${row},${col}`);
          resolve();
        },
      });
    });
  }

  /**
   * Flash cells red briefly to signal an invalid selection.
   * @param {[number,number][]} positions
   * @returns {Promise<void>}
   */
  playInvalidFeedback(positions) {
    const { renderer } = this;
    const keys = positions.map(([r, c]) => `${r},${c}`);
    renderer.highlightColor = '#f87171';
    for (const k of keys) renderer.highlightCells.add(k);

    return this._delay(400).then(() => {
      for (const k of keys) renderer.highlightCells.delete(k);
      renderer.highlightColor = '#4ade80';
    });
  }

  /**
   * Pulse-highlight hint cells in green.
   * @param {{row:number,col:number}[]} positions
   * @returns {Promise<void>}
   */
  playHint(positions) {
    const { renderer } = this;
    const keys = positions.map(({ row, col }) => `${row},${col}`);
    renderer.highlightColor = '#4ade80';
    for (const k of keys) renderer.highlightCells.add(k);
    return this._delay(1200).then(() => {
      for (const k of keys) renderer.highlightCells.delete(k);
    });
  }

  // --- private helpers ---

  _flash(keys, dur) {
    const { renderer } = this;
    const start = performance.now();
    return new Promise(resolve => {
      this._active.push({
        start, dur,
        update: t => {
          const brightness = 0.5 + 0.5 * Math.sin(t * Math.PI);
          for (const k of keys) renderer.cellOverrides.set(k, { dx: 0, dy: 0, alpha: brightness + 0.5 });
        },
        resolve,
      });
    });
  }

  _fadeOut(keys, dur) {
    const { renderer } = this;
    const start = performance.now();
    return new Promise(resolve => {
      this._active.push({
        start, dur,
        update: t => {
          for (const k of keys) renderer.cellOverrides.set(k, { dx: 0, dy: 0, alpha: 1 - t });
        },
        resolve,
      });
    });
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  _sequence(fns) {
    return fns.reduce((p, fn) => p.then(fn), Promise.resolve());
  }
}
