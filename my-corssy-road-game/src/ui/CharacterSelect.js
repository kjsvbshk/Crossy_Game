import { eventBus, Events } from "../core/EventBus";
import { gameState } from "../core/GameState";
import { CHARACTERS, DEFAULT_CHARACTER_ID } from "../gameplay/characters/CharacterDefinitions";

// Grid of playable characters. Owned ones equip on tap; locked ones show a
// coin price and unlock+equip when affordable. Purchases and selection write
// straight into gameState; Game.js persists on OPTIONS/CHARACTER events.

export class CharacterSelect {
  constructor({ player, onClose }) {
    this.player = player;
    this.onClose = onClose;
    this.el = document.getElementById("character-select");
    this.grid = document.getElementById("character-grid");
    this.coinsEl = document.getElementById("select-coins");

    document.getElementById("select-back")?.addEventListener("click", () => {
      this.hide();
      this.onClose?.();
    });
  }

  open() {
    this._render();
    this.el.hidden = false;
  }

  hide() {
    this.el.hidden = true;
  }

  _render() {
    if (this.coinsEl) this.coinsEl.textContent = gameState.coins;
    this.grid.innerHTML = "";
    const activeId = gameState.characterId ?? DEFAULT_CHARACTER_ID;

    for (const c of CHARACTERS) {
      const owned = gameState.unlocked.includes(c.id);
      const affordable = owned || gameState.coins >= c.unlockCost;

      const card = document.createElement("button");
      card.type = "button";
      card.className = "char-card";
      if (owned) card.classList.add("owned");
      if (c.id === activeId) card.classList.add("active");
      card.disabled = !affordable;
      card.setAttribute("role", "listitem");
      card.innerHTML =
        `<span class="char-name">${c.name}</span>` +
        `<span class="char-cost">${c.unlockCost} ◉</span>`;
      card.addEventListener("click", () => this._pick(c, owned));
      this.grid.appendChild(card);
    }
  }

  _pick(c, owned) {
    if (!owned) {
      if (gameState.coins < c.unlockCost) return;
      gameState.coins -= c.unlockCost;
      gameState.unlocked.push(c.id);
    }
    gameState.characterId = c.id;
    this.player.setCharacter(c.id);
    eventBus.emit(Events.CHARACTER_SELECTED, c.id);
    eventBus.emit(Events.COIN_COLLECTED, gameState.coins); // refresh HUD coin count
    this._render();
  }
}
