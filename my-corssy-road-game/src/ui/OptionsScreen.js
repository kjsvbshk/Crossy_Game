import { eventBus, Events } from "../core/EventBus";
import { gameState } from "../core/GameState";
import * as Persistence from "../systems/Persistence";

// Settings modal. Toggles write straight into gameState.options and emit
// OPTIONS_CHANGED; Game.js applies + persists. Reachable from the menu and
// from the pause screen — open(onClose) says where "Volver" goes back to.

export class OptionsScreen {
  constructor() {
    this.el = document.getElementById("options-screen");
    this.postfx = document.getElementById("opt-postfx");
    this.reduced = document.getElementById("opt-reduced");
    this._onClose = null;

    this.postfx?.addEventListener("change", () => {
      gameState.options.postfx = this.postfx.checked;
      eventBus.emit(Events.OPTIONS_CHANGED);
    });
    this.reduced?.addEventListener("change", () => {
      gameState.options.reducedMotion = this.reduced.checked;
      eventBus.emit(Events.OPTIONS_CHANGED);
    });
    document.getElementById("opt-clear")?.addEventListener("click", () => this._clearProgress());
    document.getElementById("options-back")?.addEventListener("click", () => {
      this.hide();
      const cb = this._onClose;
      this._onClose = null;
      cb?.();
    });
  }

  open(onClose) {
    this._onClose = onClose ?? null;
    if (this.postfx) this.postfx.checked = gameState.options.postfx;
    if (this.reduced) this.reduced.checked = gameState.options.reducedMotion;
    this.el.hidden = false;
  }

  hide() {
    this.el.hidden = true;
  }

  _clearProgress() {
    const btn = document.getElementById("opt-clear");
    if (btn.dataset.confirm !== "1") {
      btn.dataset.confirm = "1";
      btn.textContent = "¿Seguro? Toca de nuevo";
      setTimeout(() => {
        btn.dataset.confirm = "0";
        btn.textContent = "Borrar progreso";
      }, 3000);
      return;
    }
    Persistence.clear();
    gameState.coins = 0;
    gameState.highScore = 0;
    gameState.unlocked = ["dough"];
    gameState.characterId = "dough";
    eventBus.emit(Events.CHARACTER_SELECTED, "dough");
    eventBus.emit(Events.COIN_COLLECTED, 0);
    btn.dataset.confirm = "0";
    btn.textContent = "Progreso borrado";
    setTimeout(() => (btn.textContent = "Borrar progreso"), 2000);
  }
}
