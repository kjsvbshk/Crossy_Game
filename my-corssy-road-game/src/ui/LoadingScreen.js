import { eventBus, Events } from "../core/EventBus";
import { gameState } from "../core/GameState";

// A short branded loading beat. The game builds synchronously, so this is
// mostly a hold so the title registers; it clears once the first frame is up
// (GAME_READY) and a minimum time has passed, then hands off to the menu.

const MIN_VISIBLE_MS = 750;

export class LoadingScreen {
  constructor({ onDone }) {
    this.el = document.getElementById("loading-screen");
    this.onDone = onDone;
    this._shownAt = performance.now();
    this._ready = false;
    eventBus.on(Events.GAME_READY, () => {
      this._ready = true;
      this._maybeFinish();
    });
  }

  _maybeFinish() {
    if (!this._ready) return;
    const wait = Math.max(0, MIN_VISIBLE_MS - (performance.now() - this._shownAt));
    setTimeout(() => {
      if (this.el) this.el.hidden = true;
      gameState.status = "menu";
      eventBus.emit(Events.GAME_MENU);
      this.onDone?.();
    }, wait);
  }
}
