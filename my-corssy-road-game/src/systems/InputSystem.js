import { eventBus, Events } from "../core/EventBus";
import { gameState } from "../core/GameState";
import { INPUT_CONFIG } from "../core/Constants";

const KEY_TO_DIRECTION = {
  ArrowUp: "forward",
  KeyW: "forward",
  ArrowDown: "backward",
  KeyS: "backward",
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
};

const BUTTON_IDS = {
  forward: "forward",
  backward: "backward",
  left: "left",
  right: "right",
};

/**
 * Unified input: keyboard (arrows + WASD), on-screen buttons, and touch
 * swipe all funnel into the same `input:direction` event. Game logic (and
 * anything else that cares) only ever sees that event — it never knows
 * which source triggered it.
 */
export class InputSystem {
  constructor() {
    this._pressedKeys = new Set();
    this._touchStart = null;
    this._buttonHandlers = [];

    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);
    window.addEventListener("blur", this._onBlur);
    window.addEventListener("touchstart", this._onTouchStart, { passive: true });
    window.addEventListener("touchend", this._onTouchEnd, { passive: true });

    Object.entries(BUTTON_IDS).forEach(([direction, elementId]) => this._bindButton(elementId, direction));
  }

  _bindButton(elementId, direction) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const handler = () => this._emit(direction);
    el.addEventListener("click", handler);
    this._buttonHandlers.push({ el, handler });
  }

  _emit(direction) {
    if (!gameState.isPlaying()) return;
    eventBus.emit(Events.INPUT_DIRECTION, direction);
  }

  _onKeyDown = (event) => {
    const direction = KEY_TO_DIRECTION[event.code];
    if (!direction || this._pressedKeys.has(event.code)) return;
    event.preventDefault();
    this._pressedKeys.add(event.code);
    this._emit(direction);
  };

  _onKeyUp = (event) => {
    if (!KEY_TO_DIRECTION[event.code]) return;
    event.preventDefault();
    this._pressedKeys.delete(event.code);
  };

  _onBlur = () => {
    this._pressedKeys.clear();
  };

  _onTouchStart = (event) => {
    const touch = event.touches[0];
    this._touchStart = { x: touch.clientX, y: touch.clientY };
  };

  _onTouchEnd = (event) => {
    if (!this._touchStart) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - this._touchStart.x;
    const dy = touch.clientY - this._touchStart.y;
    this._touchStart = null;

    if (Math.max(Math.abs(dx), Math.abs(dy)) < INPUT_CONFIG.SWIPE_THRESHOLD_PX) return; // tap, not a swipe

    if (Math.abs(dx) > Math.abs(dy)) {
      this._emit(dx > 0 ? "right" : "left");
    } else {
      this._emit(dy > 0 ? "backward" : "forward");
    }
  };

  dispose() {
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);
    window.removeEventListener("blur", this._onBlur);
    window.removeEventListener("touchstart", this._onTouchStart);
    window.removeEventListener("touchend", this._onTouchEnd);
    this._buttonHandlers.forEach(({ el, handler }) => el.removeEventListener("click", handler));
    this._buttonHandlers.length = 0;
  }
}
