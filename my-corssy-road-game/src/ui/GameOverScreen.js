import { eventBus, Events } from "../core/EventBus";
import { gameState } from "../core/GameState";

export class GameOverScreen {
  constructor() {
    this.el = document.getElementById("result-container");
    this.scoreEl = document.getElementById("final-score");
    this.bestEl = document.getElementById("final-best");
    this.coinsEl = document.getElementById("final-coins");

    eventBus.on(Events.GAME_OVER, this._onGameOver);
    eventBus.on(Events.GAME_RESET, () => (this.el.hidden = true));
  }

  _onGameOver = (finalScore) => {
    if (!this.el) return;
    if (this.scoreEl) this.scoreEl.textContent = finalScore;
    if (this.bestEl) this.bestEl.textContent = Math.max(finalScore, gameState.highScore);
    if (this.coinsEl) this.coinsEl.textContent = `+${gameState.coinsThisRun}`;
    // Small delay so the death shake/particles read before the modal covers it.
    setTimeout(() => (this.el.hidden = false), 260);
  };
}
