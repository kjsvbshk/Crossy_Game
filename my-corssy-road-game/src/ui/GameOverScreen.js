import { eventBus, Events } from "../core/EventBus";

export class GameOverScreen {
  constructor() {
    this.resultDOM = document.getElementById("result-container");
    this.finalScoreDOM = document.getElementById("final-score");

    eventBus.on(Events.GAME_OVER, this._onGameOver);
    eventBus.on(Events.GAME_RESET, this._onGameReset);
  }

  _onGameOver = (finalScore) => {
    if (!this.resultDOM) return;
    this.resultDOM.style.visibility = "visible";
    if (this.finalScoreDOM) this.finalScoreDOM.innerText = finalScore.toString();
  };

  _onGameReset = () => {
    if (this.resultDOM) this.resultDOM.style.visibility = "hidden";
  };
}
