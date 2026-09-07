import { eventBus, Events } from "../core/EventBus";
import { gameState } from "../core/GameState";

const VISIBLE_MS = 2400;

export class BiomeBanner {
  constructor() {
    this.el = document.getElementById("biome-banner");
    this._hideTimeout = null;
    eventBus.on(Events.BIOME_CHANGED, this._onBiomeChanged);
  }

  _onBiomeChanged = (biome) => {
    this._flash(biome);
    if (!this.el) return;
    this.el.textContent = biome.name;
    this.el.classList.add("visible");
    clearTimeout(this._hideTimeout);
    this._hideTimeout = setTimeout(() => {
      this.el.classList.remove("visible");
    }, VISIBLE_MS);
  };

  _flash(biome) {
    if (gameState.options.reducedMotion) return;
    const el = document.getElementById("flash");
    if (!el) return;
    el.style.background = "#" + (biome.colors?.sky ?? 0xffffff).toString(16).padStart(6, "0");
    el.classList.add("on");
    clearTimeout(this._flashTimeout);
    this._flashTimeout = setTimeout(() => el.classList.remove("on"), 70);
  }
}
