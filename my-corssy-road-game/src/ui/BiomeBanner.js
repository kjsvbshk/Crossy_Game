import { eventBus, Events } from "../core/EventBus";
import { gameState } from "../core/GameState";

const VISIBLE_MS = 2400;

// Small per-biome glyph shown next to the name — purely decorative, falls
// back to a generic pin for any biome id not listed here.
const BIOME_ICONS = {
  meadow: "🌾",
  desert: "🌵",
  snow: "❄️",
  city: "🏙️",
  forest: "🌲",
};

export class BiomeBanner {
  constructor() {
    this.el = document.getElementById("biome-banner");
    this.iconEl = document.getElementById("biome-banner-icon");
    this.textEl = document.getElementById("biome-banner-text");
    this._hideTimeout = null;
    eventBus.on(Events.BIOME_CHANGED, this._onBiomeChanged);
  }

  _onBiomeChanged = (biome) => {
    this._flash(biome);
    if (!this.el) return;

    const accent = "#" + (biome.decorColor ?? biome.colors?.sky ?? 0xffffff).toString(16).padStart(6, "0");
    this.el.style.setProperty("--biome-accent", accent);
    if (this.iconEl) this.iconEl.textContent = BIOME_ICONS[biome.id] ?? "📍";
    if (this.textEl) this.textEl.textContent = biome.name;

    // Restart the pop-in animation even when it retriggers before the last
    // one finished hiding (fast biome changes at low POINTS_PER_BIOME).
    this.el.classList.remove("visible", "pop");
    void this.el.offsetWidth; // force reflow so the removed class actually resets
    this.el.classList.add("visible");
    if (!gameState.options.reducedMotion) this.el.classList.add("pop");

    clearTimeout(this._hideTimeout);
    this._hideTimeout = setTimeout(() => {
      this.el.classList.remove("visible", "pop");
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
