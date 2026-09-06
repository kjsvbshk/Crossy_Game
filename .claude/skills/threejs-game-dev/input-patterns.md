# Input Patterns — Gyroscope, Virtual Joystick, Unified InputSystem

Game logic should never know whether the player is on keyboard, gyroscope, or a touch joystick. It reads two normalized values, `moveX` and `moveZ`, each in `-1..1`, from a single `InputSystem`.

## Priority model

1. **Keyboard** — always active as an override, even on devices that also report touch/gyro. If any movement key is down, keyboard wins that frame.
2. **Gyroscope** — used on mobile when available and permission granted (game types: marble/tilt/balance).
3. **Virtual joystick** — fallback when gyroscope is unavailable, denied, or not appropriate for the game type (runner/platformer/shooter).

## `systems/InputSystem.js`

```js
import { GyroscopeInput } from './GyroscopeInput.js';
import { VirtualJoystick } from './VirtualJoystick.js';

export class InputSystem {
  constructor({ useGyro = false, joystickZoneEl = null } = {}) {
    this.moveX = 0;
    this.moveZ = 0;
    this._keys = new Set();

    this._onKeyDown = (e) => this._keys.add(e.code);
    this._onKeyUp = (e) => this._keys.delete(e.code);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);

    this.gyro = useGyro ? new GyroscopeInput() : null;
    this.joystick = !useGyro && joystickZoneEl ? new VirtualJoystick(joystickZoneEl) : null;
  }

  /** Call once, from a user gesture (tap "Play"), before relying on gyro. */
  async requestPermissions() {
    if (this.gyro) await this.gyro.requestPermission();
  }

  update() {
    const kx = (this._keys.has('KeyD') || this._keys.has('ArrowRight') ? 1 : 0)
             - (this._keys.has('KeyA') || this._keys.has('ArrowLeft') ? 1 : 0);
    const kz = (this._keys.has('KeyS') || this._keys.has('ArrowDown') ? 1 : 0)
             - (this._keys.has('KeyW') || this._keys.has('ArrowUp') ? 1 : 0);

    if (kx !== 0 || kz !== 0) {
      // Keyboard override
      this.moveX = kx;
      this.moveZ = kz;
      return;
    }

    if (this.gyro?.available) {
      this.moveX = this.gyro.x;
      this.moveZ = this.gyro.z;
      return;
    }

    if (this.joystick) {
      this.moveX = this.joystick.x;
      this.moveZ = this.joystick.y;
      return;
    }

    this.moveX = 0;
    this.moveZ = 0;
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this.gyro?.dispose();
    this.joystick?.dispose();
  }
}
```

## `systems/GyroscopeInput.js`

```js
export class GyroscopeInput {
  constructor({ maxTiltDeg = 25 } = {}) {
    this.x = 0;
    this.z = 0;
    this.available = false;
    this.maxTiltDeg = maxTiltDeg;
    this._onOrientation = (e) => this._handleOrientation(e);
  }

  /** Must be called from a user gesture on iOS 13+. */
  async requestPermission() {
    const DOE = window.DeviceOrientationEvent;
    if (!DOE) return false;

    if (typeof DOE.requestPermission === 'function') {
      try {
        const result = await DOE.requestPermission();
        if (result !== 'granted') return false;
      } catch {
        return false;
      }
    }

    window.addEventListener('deviceorientation', this._onOrientation);
    this.available = true;
    return true;
  }

  _handleOrientation(e) {
    // beta: front-back tilt (-180..180), gamma: left-right tilt (-90..90)
    const clampedGamma = Math.max(-this.maxTiltDeg, Math.min(this.maxTiltDeg, e.gamma ?? 0));
    const clampedBeta = Math.max(-this.maxTiltDeg, Math.min(this.maxTiltDeg, (e.beta ?? 0) - 45));
    this.x = clampedGamma / this.maxTiltDeg;
    this.z = clampedBeta / this.maxTiltDeg;
  }

  dispose() {
    window.removeEventListener('deviceorientation', this._onOrientation);
  }
}
```

## `systems/VirtualJoystick.js`

```js
export class VirtualJoystick {
  constructor(zoneEl, { radius = 60 } = {}) {
    this.zoneEl = zoneEl;
    this.radius = radius;
    this.x = 0; // -1..1
    this.y = 0; // -1..1
    this._active = false;
    this._origin = { x: 0, y: 0 };

    this._onStart = (e) => this._start(e);
    this._onMove = (e) => this._move(e);
    this._onEnd = () => this._end();

    zoneEl.addEventListener('touchstart', this._onStart, { passive: true });
    zoneEl.addEventListener('touchmove', this._onMove, { passive: true });
    zoneEl.addEventListener('touchend', this._onEnd);
    zoneEl.addEventListener('touchcancel', this._onEnd);
  }

  _start(e) {
    const t = e.touches[0];
    this._origin = { x: t.clientX, y: t.clientY };
    this._active = true;
  }

  _move(e) {
    if (!this._active) return;
    const t = e.touches[0];
    const dx = t.clientX - this._origin.x;
    const dy = t.clientY - this._origin.y;
    const dist = Math.min(Math.hypot(dx, dy), this.radius);
    const angle = Math.atan2(dy, dx);
    this.x = (Math.cos(angle) * dist) / this.radius;
    this.y = (Math.sin(angle) * dist) / this.radius;
  }

  _end() {
    this._active = false;
    this.x = 0;
    this.y = 0;
  }

  dispose() {
    this.zoneEl.removeEventListener('touchstart', this._onStart);
    this.zoneEl.removeEventListener('touchmove', this._onMove);
    this.zoneEl.removeEventListener('touchend', this._onEnd);
    this.zoneEl.removeEventListener('touchcancel', this._onEnd);
  }
}
```

## Choosing the mobile input by game type

| Game Type | Primary Mobile Input | Fallback |
|---|---|---|
| Marble/tilt/balance | Gyroscope (DeviceOrientation) | Virtual joystick |
| Runner/endless | Tap zones (left/right half) | Swipe gestures |
| Puzzle/turn-based | Tap targets (44px min) | Drag & drop |
| Shooter/aim | Virtual joystick + tap-to-fire | Dual joysticks |
| Platformer | Virtual D-pad + jump button | Tilt for movement |

**For a Crossy-Road-style game specifically:** movement is discrete (one grid hop per input), not analog — so `InputSystem` here should also expose a `tap:direction` style discrete event (`up`/`down`/`left`/`right`) fed by keyboard arrow/WASD, swipe gestures, or on-screen D-pad buttons, rather than continuous `moveX`/`moveZ`. Keep the same priority rule (keyboard overrides touch) and the same permission/dispose lifecycle.
