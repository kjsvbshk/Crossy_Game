import { eventBus, Events } from "../core/EventBus";
import { gameState } from "../core/GameState";

// Main menu. The world keeps simulating behind it (attract mode) because
// input / collisions / the eagle are all gated on gameState.isPlaying().

export class StartScreen {
  constructor({ onPlay, onCharacters, onOptions }) {
    this.el = document.getElementById("start-screen");
    this.bestEl = document.getElementById("menu-best");
    this.coinsEl = document.getElementById("menu-coins");

    document.getElementById("play-btn")?.addEventListener("click", onPlay);
    document.getElementById("characters-btn")?.addEventListener("click", onCharacters);
    document.getElementById("options-btn")?.addEventListener("click", onOptions);

    eventBus.on(Events.GAME_MENU, () => this.show());
    eventBus.on(Events.GAME_RESET, () => this.hide());
  }

  show() {
    if (this.bestEl) this.bestEl.textContent = gameState.highScore;
    if (this.coinsEl) this.coinsEl.textContent = gameState.coins;
    this.el.hidden = false;
  }

  hide() {
    this.el.hidden = true;
  }
}
