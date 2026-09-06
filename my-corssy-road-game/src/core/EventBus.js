class EventBus {
  constructor() {
    this._listeners = new Map(); // event -> Set<fn>
  }

  on(event, fn) {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add(fn);
    return () => this.off(event, fn); // returns an unsubscribe fn
  }

  once(event, fn) {
    const wrapped = (...args) => {
      this.off(event, wrapped);
      fn(...args);
    };
    return this.on(event, wrapped);
  }

  off(event, fn) {
    this._listeners.get(event)?.delete(fn);
  }

  emit(event, payload) {
    this._listeners.get(event)?.forEach((fn) => fn(payload));
  }

  /** Remove ALL listeners for every event. Call on full game teardown. */
  clear() {
    this._listeners.clear();
  }
}

export const eventBus = new EventBus();

// Central registry of event names — domain:action naming.
// Add new events here as new systems need to react to them.
export const Events = {
  GAME_OVER: 'game:over',
  GAME_RESET: 'game:reset',
  SCORE_CHANGED: 'score:changed',
  INPUT_DIRECTION: 'input:direction',
};
