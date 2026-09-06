import { eventBus, Events } from "../core/EventBus";
import { gameState } from "../core/GameState";

// Attract-mode start screen. The world keeps simulating behind it (vehicles
// drive, water drifts) because only input / collisions / the eagle are gated
// on gameState.isPlaying().

export class StartScreen {
  constructor({ onPlay, onCharacters }) {
    this.el = document.getElementById("start-screen");
    this.highScoreEl = document.getElementById("start-highscore");

    document.getElementById("play-btn")?.addEventListener("click", onPlay);
    document.getElementById("characters-btn")?.addEventListener("click", onCharacters);

    eventBus.on(Events.GAME_MENU, () => this.show());
    if (gameState.status === "menu") this.show();
  }

  show() {
    if (this.highScoreEl) {
      this.highScoreEl.textContent = gameState.highScore ? `Mejor puntuación: ${gameState.highScore}` : "";
    }
    this.el.hidden = false;
  }

  hide() {
    this.el.hidden = true;
  }
}
