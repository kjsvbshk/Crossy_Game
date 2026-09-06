import { eventBus, Events } from "../core/EventBus";
import { gameState } from "../core/GameState";
import { CHARACTERS, DEFAULT_CHARACTER_ID } from "../gameplay/characters/CharacterDefinitions";

// Grid of playable characters. Owned ones can be equipped; locked ones show a
// coin price and unlock (then equip) when the player can afford them.
// Purchases + selection go straight into gameState; Game.js persists them.

export class CharacterSelect {
  constructor({ player, onClose }) {
    this.player = player;
    this.onClose = onClose;
    this.el = document.getElementById("character-select");
    this.grid = document.getElementById("character-grid");
    this.coinsEl = document.getElementById("select-coins");

    document.getElementById("select-back")?.addEventListener("click", () => {
      this.hide();
      this.onClose();
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
    if (this.coinsEl) this.coinsEl.textContent = `🪙 ${gameState.coins}`;
    this.grid.innerHTML = "";
    const activeId = gameState.characterId ?? DEFAULT_CHARACTER_ID;

    for (const c of CHARACTERS) {
      const owned = gameState.unlocked.includes(c.id);
      const card = document.createElement("button");
      card.className = "char-card" + (c.id === activeId ? " active" : "");
      card.textContent = owned ? c.name : `${c.name} · ${c.unlockCost}🪙`;
      card.disabled = !owned && gameState.coins < c.unlockCost;
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
    this._render();
  }
}
