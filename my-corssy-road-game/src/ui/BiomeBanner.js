import { eventBus, Events } from "../core/EventBus";

const VISIBLE_MS = 2400;

export class BiomeBanner {
  constructor() {
    this.el = document.getElementById("biome-banner");
    this._hideTimeout = null;
    eventBus.on(Events.BIOME_CHANGED, this._onBiomeChanged);
  }

  _onBiomeChanged = (biome) => {
    if (!this.el) return;
    this.el.textContent = biome.name;
    this.el.classList.add("visible");
    clearTimeout(this._hideTimeout);
    this._hideTimeout = setTimeout(() => {
      this.el.classList.remove("visible");
    }, VISIBLE_MS);
  };
}
