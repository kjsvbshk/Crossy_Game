import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { CAMERA, RENDERER, LIGHT, WEATHER_CONFIG, EAGLE_CONFIG, CAMERA_SHAKE } from "./Constants";
import { eventBus, Events } from "./EventBus";
import { gameState } from "./GameState";
import { Player } from "../gameplay/Player";
import { Eagle } from "../gameplay/Eagle";
import { updateVehicles } from "../gameplay/VehicleController";
import { updateRivers, updateRailways } from "../gameplay/movers";
import { LevelBuilder } from "../level/LevelBuilder";
import { PhysicsSystem } from "../systems/PhysicsSystem";
import { RideSystem } from "../systems/RideSystem";
import { Particles } from "../systems/Particles";
import { InputSystem } from "../systems/InputSystem";
import { LightingRig } from "../render/LightingRig";
import { ClaymationShader } from "../render/postfx/ClaymationShader";
import { getBiomeForScore } from "../level/biomes/BiomeDefinitions";
import * as Persistence from "../systems/Persistence";

/**
 * Orchestrator: owns the renderer, scene, camera, lights, resize handling,
 * and the render loop. Absorbs what used to be components/Renderer.js,
 * components/Camera.js, and components/DirectionalLight.js.
 */
export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    this._elapsed = 0; // own accumulator, so it can't be thrown off by delta capping
    this._currentBiomeId = null;
    this._shake = 0;
    this._paused = false;
  }

  init() {
    // Load meta-progression before the Player is built — it picks the saved skin.
    const saved = Persistence.load();
    gameState.coins = saved.coins;
    gameState.highScore = saved.highScore;
    gameState.unlocked = saved.unlocked;
    gameState.characterId = saved.characterId;
    gameState.options = saved.options;

    this._initRenderer();
    this._initScene();
    this._initPostProcessing();
    this._initListeners();
    this._applyOptions();
    this._initGame();

    this.renderer.setAnimationLoop(() => this._tick());
    // First frame is on screen — the loading screen can go.
    eventBus.emit(Events.GAME_READY);
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, RENDERER.MAX_PIXEL_RATIO));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = RENDERER.SHADOWS_ENABLED;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  _initScene() {
    this.scene = new THREE.Scene();

    this.levelBuilder = new LevelBuilder();
    this.player = new Player(this.levelBuilder);
    this.physics = new PhysicsSystem();
    this.rideSystem = new RideSystem();
    this.eagle = new Eagle();
    this.particles = new Particles();

    this.scene.add(this.player.object3D);
    this.scene.add(this.levelBuilder.object3D);
    this.scene.add(this.eagle.object3D);
    this.scene.add(this.particles.object3D);

    // Three-point rig (key + fill + rim + ambient), parented to the player so
    // the shadow frustum and light directions travel with it. Only the key
    // casts shadows. Per-biome retint happens in _applyBiome via rig.apply().
    this.rig = new LightingRig();
    this.rig.configureShadow(LIGHT.SHADOW_CAMERA, LIGHT.SHADOW_MAP_SIZE);
    for (const light of [this.rig.key, this.rig.fill, this.rig.rim]) {
      light.target = this.player.object3D;
    }
    this.player.object3D.add(this.rig.group);

    this.camera = this._createCamera();
    this.player.object3D.add(this.camera);
  }

  _createCamera() {
    const { width, height } = this._computeOrthoFrustumSize();
    const camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      CAMERA.NEAR,
      CAMERA.FAR,
    );
    camera.up.set(CAMERA.UP.x, CAMERA.UP.y, CAMERA.UP.z);
    camera.position.set(CAMERA.POSITION.x, CAMERA.POSITION.y, CAMERA.POSITION.z);
    camera.lookAt(0, 0, 0);
    return camera;
  }

  _computeOrthoFrustumSize() {
    const size = CAMERA.ORTHO_SIZE;
    const viewRatio = window.innerWidth / window.innerHeight;
    const width = viewRatio < 1 ? size : size * viewRatio;
    const height = viewRatio < 1 ? size / viewRatio : size;
    return { width, height };
  }

  /**
   * Deliberate, explicitly-requested departure from the skill's "no
   * postprocessing by default" rule, for the claymation look: a subtle bloom
   * (threshold high so only real highlights glow) followed by one custom pass
   * — vignette + film grain + a per-frame exposure flicker (the shot-on-twos
   * tell). Guarded by RENDERER.POSTFX_ENABLED so it can be switched off
   * instantly on a lower-end device.
   */
  _initPostProcessing() {
    if (!RENDERER.POSTFX_ENABLED) return;

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    const { strength, radius, threshold } = RENDERER.BLOOM;
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      strength,
      radius,
      threshold,
    );
    this.composer.addPass(this.bloomPass);

    this.claymationPass = new ShaderPass(ClaymationShader);
    this.composer.addPass(this.claymationPass);

    this.composer.addPass(new OutputPass());
  }

  _initListeners() {
    window.addEventListener("resize", this._onResize);
    this.input = new InputSystem();
    eventBus.on(Events.INPUT_DIRECTION, (direction) => this.player.queueMove(direction));
    eventBus.on(Events.SCORE_CHANGED, (score) => this._applyBiome(getBiomeForScore(score)));
    eventBus.on(Events.EAGLE_STRIKE, () => {
      if (!gameState.isPlaying()) return;
      gameState.gameOver();
      eventBus.emit(Events.GAME_OVER, gameState.score);
    });

    const persist = () => Persistence.save({
      coins: gameState.coins,
      highScore: gameState.highScore,
      unlocked: gameState.unlocked,
      characterId: gameState.characterId ?? "dough",
      options: gameState.options,
    });
    this._persist = persist;
    eventBus.on(Events.COIN_COLLECTED, persist);
    eventBus.on(Events.CHARACTER_SELECTED, persist);
    eventBus.on(Events.OPTIONS_CHANGED, () => {
      this._applyOptions();
      persist();
    });
    eventBus.on(Events.GAME_OVER, (score) => {
      if (score > gameState.highScore) gameState.highScore = score;
      persist();
    });

    eventBus.on(Events.UI_PAUSE_TOGGLE, () => {
      if (gameState.status === "playing") this.pause();
      else if (gameState.status === "paused") this.resume();
    });

    // --- juice ---
    const at = () => this.player.object3D.position;
    eventBus.on(Events.PLAYER_MOVED, () => this.particles.burst(at(), "dust"));
    eventBus.on(Events.COIN_COLLECTED, () => this.particles.burst(at(), "sparkle"));
    eventBus.on(Events.PLAYER_DROWNED, () => this.particles.burst(at(), "splash"));
    eventBus.on(Events.GAME_OVER, () => {
      if (!gameState.options.reducedMotion) this._shake = CAMERA_SHAKE.ON_DEATH;
      this.particles.burst(at(), "crumble");
    });
  }

  /** Applies gameState.options to the renderer / postfx. */
  _applyOptions() {
    const o = gameState.options;
    this._postfxOn = o.postfx;
    if (this.claymationPass) {
      this.claymationPass.uniforms.uFlicker.value = o.reducedMotion ? 0 : RENDERER.GRADE.FLICKER;
      this.claymationPass.uniforms.uGrain.value = o.reducedMotion ? 0 : RENDERER.GRADE.GRAIN;
    }
  }

  pause() {
    if (this._paused) return;
    this._paused = true;
    gameState.status = "paused";
    eventBus.emit(Events.GAME_PAUSED);
  }

  resume() {
    if (!this._paused) return;
    this._paused = false;
    this.clock.getDelta(); // drop the long pause gap so nothing lurches
    gameState.status = "playing";
    eventBus.emit(Events.GAME_RESUMED);
  }

  /**
   * Applies a biome's sky/fog/light to the scene. The very first application
   * (game load or right after a reset) is silent — Events.BIOME_CHANGED only
   * fires for an actual mid-run transition, so the "entering a new biome"
   * banner doesn't also fire on every fresh start.
   *
   * Fog isn't permanent — GameState rolls it once per run (see GameState.reset,
   * WEATHER_CONFIG.FOG_PROBABILITY). Runs without fog get brighter, slightly
   * warmer light instead, so a clear run still feels distinct rather than
   * just "the foggy version with fog turned off".
   */
  _applyBiome(biome) {
    if (this._currentBiomeId === biome.id) return;
    const isInitial = this._currentBiomeId === null;
    this._currentBiomeId = biome.id;

    this.scene.background = new THREE.Color(biome.colors.sky);

    // apply() fully resets the rig from the biome each call (every biome
    // specifies key/fill/rim/ambient), so the clear-run tweak below never
    // compounds across transitions.
    this.rig.apply(biome.lightingRig);

    if (gameState.hasFog) {
      this.scene.fog = new THREE.Fog(biome.colors.sky, biome.fog.near, biome.fog.far);
    } else {
      this.scene.fog = null;
      // No fog to soften the scene — nudge the key + ambient up and warm the
      // key so a clear run still feels distinct rather than just "less foggy".
      this.rig.key.intensity *= WEATHER_CONFIG.CLEAR_INTENSITY_MULTIPLIER;
      this.rig.ambient.intensity *= WEATHER_CONFIG.CLEAR_INTENSITY_MULTIPLIER;
      this.rig.key.color.lerp(
        new THREE.Color(WEATHER_CONFIG.CLEAR_WARM_TINT),
        WEATHER_CONFIG.CLEAR_WARM_TINT_STRENGTH,
      );
    }

    if (!isInitial) {
      eventBus.emit(Events.BIOME_CHANGED, biome);
    }
  }

  _onResize = () => {
    const { width, height } = this._computeOrthoFrustumSize();
    this.camera.left = width / -2;
    this.camera.right = width / 2;
    this.camera.top = height / 2;
    this.camera.bottom = height / -2;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer?.setSize(window.innerWidth, window.innerHeight);
  };

  _initGame() {
    this.levelBuilder.build();
    this.player.reset();
    // Sit in "loading" until LoadingScreen hands off to the menu (GAME_MENU).
    // The world simulates behind both screens as attract mode; input, physics
    // and the eagle stay gated on isPlaying().
    gameState.status = "loading";
  }

  /** Public: Play button — start a fresh run from the menu. */
  start() {
    this.reset();
  }

  /** Public: game-over "Menú" button — rebuild the world and show the menu. */
  toMenu() {
    this.reset();
    gameState.status = "menu";
    eventBus.emit(Events.GAME_MENU);
  }

  /** Public: called by the Retry button; also the core of start()/toMenu(). */
  reset() {
    this._currentBiomeId = null; // fresh run always restarts silently in the first biome
    this._elapsed = 0;
    this._shake = 0;
    this._paused = false;
    this.camera.position.set(CAMERA.POSITION.x, CAMERA.POSITION.y, CAMERA.POSITION.z);
    this.levelBuilder.reset();
    this.player.reset();
    this.eagle.reset();
    this.particles.reset();
    eventBus.emit(Events.GAME_RESET);
  }

  _tick() {
    const delta = Math.min(this.clock.getDelta(), 0.1);

    // Paused: keep the frame on screen but freeze the simulation.
    if (this._paused) {
      this._render();
      return;
    }

    this._elapsed += delta;
    const meta = this.levelBuilder.metadata;

    updateVehicles(delta, meta);
    updateRivers(delta, meta);
    updateRailways(delta, this._elapsed, meta);
    this.player.update(delta);
    this.rideSystem.update(delta, this.player, meta);
    this.physics.checkCollisions(this.player, meta);
    this._updateEagle(delta);
    this.particles.update(delta);
    this.levelBuilder.updateSway(this._elapsed);
    this._updateShake(delta);
    this._render();
  }

  _render() {
    if (this.composer && this._postfxOn) {
      if (this.claymationPass) this.claymationPass.uniforms.uTime.value = this._elapsed;
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Idle-death eagle: while the player is alive, count time since their last
   * forward step (gameState.idleTime, zeroed in Player._stepCompleted). Past
   * the grace window the eagle launches at the player; its own update() emits
   * EAGLE_STRIKE on impact, which _initListeners turns into a game over. The
   * eagle keeps animating after death so the dive finishes on screen.
   */
  _updateEagle(delta) {
    if (gameState.isPlaying()) {
      gameState.idleTime += delta;
      if (!this.eagle.active && gameState.idleTime > EAGLE_CONFIG.GRACE_S) {
        this.eagle.trigger(this.player.object3D.position);
      }
    }
    this.eagle.update(delta);
  }

  /** Brief camera jolt on death, decaying back to the fixed iso position. */
  _updateShake(delta) {
    if (this._shake <= 0) return;
    this._shake = Math.max(0, this._shake - CAMERA_SHAKE.DECAY_PER_S * delta);
    const s = this._shake;
    this.camera.position.set(
      CAMERA.POSITION.x + (Math.random() - 0.5) * 2 * s,
      CAMERA.POSITION.y + (Math.random() - 0.5) * 2 * s,
      CAMERA.POSITION.z + (Math.random() - 0.5) * 2 * s,
    );
    if (this._shake === 0) {
      this.camera.position.set(CAMERA.POSITION.x, CAMERA.POSITION.y, CAMERA.POSITION.z);
    }
  }
}
