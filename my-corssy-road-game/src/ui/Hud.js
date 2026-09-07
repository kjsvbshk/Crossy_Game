import { eventBus, Events } from "../core/EventBus";
import { gameState } from "../core/GameState";

// In-game HUD: score + coin count pills and the pause button, plus ownership
// of when the HUD and the on-screen D-pad are visible (only during play).

export class Hud {
  constructor() {
    this.hud = document.getElementById("hud");
    this.controls = document.getElementById("controls");
    this.scoreEl = document.getElementById("score");
    this.coinEl = document.getElementById("coin-value");

    document.getElementById("pause-btn")?.addEventListener("click", () => {
      eventBus.emit(Events.UI_PAUSE_TOGGLE);
    });

    eventBus.on(Events.SCORE_CHANGED, this._onScore);
    eventBus.on(Events.COIN_COLLECTED, this._onCoins);
    eventBus.on(Events.GAME_RESET, () => this._setVisible(true));
    eventBus.on(Events.GAME_MENU, () => this._setVisible(false));
    eventBus.on(Events.GAME_OVER, () => this._setVisible(false));

    this._onCoins();
  }

  _setVisible(on) {
    if (this.hud) this.hud.hidden = !on;
    if (this.controls) this.controls.hidden = !on;
  }

  _onScore = (score) => {
    if (this.scoreEl) this.scoreEl.textContent = score;
  };

  _onCoins = () => {
    if (this.coinEl) this.coinEl.textContent = gameState.coins;
  };
}
