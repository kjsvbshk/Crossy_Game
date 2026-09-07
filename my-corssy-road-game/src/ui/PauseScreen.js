import { eventBus, Events } from "../core/EventBus";

// Pause modal — shown while Game is paused. Resume / Options / Menu.

export class PauseScreen {
  constructor({ onResume, onOptions, onMenu }) {
    this.el = document.getElementById("pause-screen");

    document.getElementById("resume-btn")?.addEventListener("click", onResume);
    document.getElementById("pause-options-btn")?.addEventListener("click", onOptions);
    document.getElementById("pause-menu-btn")?.addEventListener("click", onMenu);

    eventBus.on(Events.GAME_PAUSED, () => (this.el.hidden = false));
    eventBus.on(Events.GAME_RESUMED, () => (this.el.hidden = true));
    eventBus.on(Events.GAME_RESET, () => (this.el.hidden = true));
  }

  hide() {
    this.el.hidden = true;
  }
}
