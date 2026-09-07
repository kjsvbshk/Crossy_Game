import { eventBus, Events } from "../core/EventBus";
import { gameState } from "../core/GameState";

export class CoinCounter {
  constructor() {
    this.el = document.getElementById("coin-count");
    this._render();
    [Events.COIN_COLLECTED, Events.CHARACTER_SELECTED, Events.GAME_RESET, Events.GAME_MENU].forEach((e) =>
      eventBus.on(e, this._render),
    );
  }

  _render = () => {
    if (this.el) this.el.textContent = `🪙 ${gameState.coins}`;
  };
}
