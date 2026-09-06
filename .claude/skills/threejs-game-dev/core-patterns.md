# Core Patterns — EventBus, GameState, Constants, Game.js

Reference implementations for the four non-negotiable core modules. Adapt names/domains to the specific game, but keep the shape.

## `core/EventBus.js`

```js
class EventBus {
  constructor() {
    this._listeners = new Map(); // event -> Set<fn>
  }

  on(event, fn) {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add(fn);
    return () => this.off(event, fn); // returns an unsubscribe fn
  }

  once(event, fn) {
    const wrapped = (...args) => {
      this.off(event, wrapped);
      fn(...args);
    };
    return this.on(event, wrapped);
  }

  off(event, fn) {
    this._listeners.get(event)?.delete(fn);
  }

  emit(event, payload) {
    this._listeners.get(event)?.forEach((fn) => fn(payload));
  }

  /** Remove ALL listeners for every event. Call on full game teardown. */
  clear() {
    this._listeners.clear();
  }
}

export const eventBus = new EventBus();

// Central registry of event names — domain:action naming.
// Add new events here so the whole team can see the contract at a glance.
export const Events = {
  PLAYER_MOVE: 'player:move',
  PLAYER_HIT: 'player:hit',
  PLAYER_SCORE: 'player:score',
  GAME_START: 'game:start',
  GAME_OVER: 'game:over',
  GAME_RESET: 'game:reset',
  INPUT_DIRECTION: 'input:direction',
};
```

**Rules:**
- Never `import` a gameplay module into another gameplay module just to call its methods. Emit an event instead.
- Every `on()` subscription made by a system must be undone on `reset()`/teardown (use the returned unsubscribe function) to avoid leaks and duplicate handlers across restarts.

## `core/GameState.js`

```js
import { PLAYER_CONFIG } from './Constants.js';

class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    this.status = 'idle'; // 'idle' | 'playing' | 'gameover'
    this.score = 0;
    this.highScore = this.highScore ?? 0; // survives reset, not full reload
    this.playerPosition = { x: 0, y: 0, z: 0 };
    this.isMuted = this.isMuted ?? false; // survives reset, user preference
  }

  start() {
    this.status = 'playing';
  }

  gameOver() {
    this.status = 'gameover';
    this.highScore = Math.max(this.highScore, this.score);
  }

  addScore(points = 1) {
    this.score += points;
  }
}

export const gameState = new GameState();
```

**Rules:**
- This is the ONE place game state lives. Don't let a system keep its own shadow copy of score/position/status.
- `reset()` must return every transient field to its start value. Persistent preferences (mute, high score, settings) may intentionally survive — comment why.

## `core/Constants.js`

```js
export const PLAYER_CONFIG = {
  MOVE_DISTANCE: 1,          // grid units per hop
  MOVE_DURATION_MS: 200,
  JUMP_HEIGHT: 0.5,
};

export const ENEMY_CONFIG = {
  CAR_SPEED_MIN: 2,
  CAR_SPEED_MAX: 4,
  TRUCK_SPEED_MIN: 1.5,
  TRUCK_SPEED_MAX: 3,
};

export const WORLD = {
  ROW_COUNT_INITIAL: 20,
  TILE_SIZE: 1,
};

export const CAMERA = {
  FOV: 75,
  NEAR: 0.1,
  FAR: 100,
  POSITION: { x: 0, y: 4, z: -4 },
};

export const COLORS = {
  GRASS: 0xbaf455,
  ROAD: 0x454a59,
  CAR_BODY: [0xa52523, 0xbdb638, 0x78b14b],
};

export const ASSET_PATHS = {
  CAR_MODEL: '/models/car.glb',
};

// --- Play.fun safe zone (see SKILL.md) ---
function _readSafeInsets() {
  const s = getComputedStyle(document.documentElement);
  return {
    top: parseInt(s.getPropertyValue('--ogp-safe-top-inset')) || 0,
    bottom: parseInt(s.getPropertyValue('--ogp-safe-bottom-inset')) || 0,
  };
}
const _insets = _readSafeInsets();

export const SAFE_ZONE = {
  TOP_PX: Math.max(75, _insets.top),
  BOTTOM_PX: _insets.bottom,
  TOP_PERCENT: 8,
};
```

**Rules:**
- If a number appears twice in game logic, it belongs here.
- Group by domain (`*_CONFIG`, `WORLD`, `CAMERA`, `COLORS`, `ASSET_PATHS`) so a reader can scan for the right bucket.

## `core/Game.js`

```js
import * as THREE from 'three';
import { eventBus, Events } from './EventBus.js';
import { gameState } from './GameState.js';
import { CAMERA } from './Constants.js';
import { InputSystem } from '../systems/InputSystem.js';
import { LevelBuilder } from '../level/LevelBuilder.js';
import { Player } from '../gameplay/Player.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    this.disposables = []; // geometries/materials/textures to dispose on teardown
  }

  init() {
    this._initRenderer();
    this._initScene();
    this._initSystems();
    this._initListeners();

    this.renderer.setAnimationLoop(() => this._tick());
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // Shadows off by default — enable deliberately once perf budget allows.
    this.renderer.shadowMap.enabled = false;
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      CAMERA.FOV,
      window.innerWidth / window.innerHeight,
      CAMERA.NEAR,
      CAMERA.FAR,
    );
    this.camera.position.set(CAMERA.POSITION.x, CAMERA.POSITION.y, CAMERA.POSITION.z);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(this.ambientLight);

    this.level = new LevelBuilder(this.scene);
    this.level.build();

    this.player = new Player(this.scene);
  }

  _initSystems() {
    this.input = new InputSystem();
  }

  _initListeners() {
    window.addEventListener('resize', this._onResize);
    eventBus.on(Events.GAME_RESET, () => this._reset());
  }

  _onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  _tick() {
    const delta = Math.min(this.clock.getDelta(), 0.1); // cap to avoid death spirals
    if (gameState.status === 'playing') {
      this.input.update(delta);
      this.player.update(delta, this.input);
      this.level.update(delta);
    }
    this.renderer.render(this.scene, this.camera);
  }

  _reset() {
    gameState.reset();
    this.player.reset();
    this.level.reset();
  }

  /** Full teardown — dispose GPU resources, remove listeners. */
  dispose() {
    window.removeEventListener('resize', this._onResize);
    this.renderer.setAnimationLoop(null);
    this.scene.traverse((obj) => {
      obj.geometry?.dispose();
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
      else obj.material?.dispose();
    });
    this.renderer.dispose();
    eventBus.clear();
  }
}
```

**Rules:**
- `Game.js` is the only place that touches renderer/scene/camera setup and the render loop. Systems and gameplay modules receive references, they don't create their own renderer/scene.
- Always cap delta time before using it for movement math.
- `dispose()` must leave zero dangling GPU resources or listeners — verify with the pre-ship checklist.
