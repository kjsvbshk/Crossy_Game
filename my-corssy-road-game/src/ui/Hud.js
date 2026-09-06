import { eventBus, Events } from "../core/EventBus";

export class Hud {
  constructor() {
    this.scoreDOM = document.getElementById("score");
    eventBus.on(Events.SCORE_CHANGED, this._onScoreChanged);
  }

  _onScoreChanged = (score) => {
    if (this.scoreDOM) this.scoreDOM.innerText = `Score: ${score}`;
  };
}
