const bindings = {
  ArrowLeft:'left', KeyA:'left', ArrowRight:'right', KeyD:'right',
  ArrowUp:'jump', KeyW:'jump', Space:'jump', KeyJ:'attack', KeyE:'interact',
  Escape:'pause', KeyR:'restart'
};

export class Input {
  constructor(target = window) {
    this.keys = new Set();
    this.edges = new Set();
    this.onDown = event => {
      const action = bindings[event.code];
      if (!action || (action !== 'pause' && event.target?.closest?.('button, input, textarea, select, a'))) return;
      event.preventDefault();
      if (!this.keys.has(event.code) && !event.repeat) this.edges.add(action);
      this.keys.add(event.code);
    };
    this.onUp = event => { this.keys.delete(event.code); };
    target.addEventListener('keydown', this.onDown);
    target.addEventListener('keyup', this.onUp);
    target.addEventListener('blur', () => this.clear());
  }
  down(action) { return [...this.keys].some(key => bindings[key] === action); }
  pressed(action) { const found = this.edges.has(action); this.edges.delete(action); return found; }
  endFrame() { this.edges.clear(); }
  clear() { this.keys.clear(); this.edges.clear(); }
}
