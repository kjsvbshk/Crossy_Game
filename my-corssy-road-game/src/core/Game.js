import * as THREE from "three";
import { CAMERA, RENDERER, LIGHT } from "./Constants";
import { eventBus, Events } from "./EventBus";
import { Player } from "../gameplay/Player";
import { updateVehicles } from "../gameplay/VehicleController";
import { LevelBuilder } from "../level/LevelBuilder";
import { PhysicsSystem } from "../systems/PhysicsSystem";
import { InputSystem } from "../systems/InputSystem";
import { getBiomeForScore } from "../level/biomes/BiomeDefinitions";

/**
 * Orchestrator: owns the renderer, scene, camera, lights, resize handling,
 * and the render loop. Absorbs what used to be components/Renderer.js,
 * components/Camera.js, and components/DirectionalLight.js.
 */
export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    this._currentBiomeId = null;
  }

  init() {
    this._initRenderer();
    this._initScene();
    this._initListeners();
    this._initGame();

    this.renderer.setAnimationLoop(() => this._tick());
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
  }

  _initScene() {
    this.scene = new THREE.Scene();

    this.levelBuilder = new LevelBuilder();
    this.player = new Player(this.levelBuilder);
    this.physics = new PhysicsSystem();

    this.scene.add(this.player.object3D);
    this.scene.add(this.levelBuilder.object3D);

    this.ambientLight = new THREE.AmbientLight();
    this.scene.add(this.ambientLight);

    this.dirLight = this._createDirectionalLight();
    this.dirLight.target = this.player.object3D;
    this.player.object3D.add(this.dirLight);

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

  _createDirectionalLight() {
    const dirLight = new THREE.DirectionalLight();
    dirLight.position.set(LIGHT.POSITION.x, LIGHT.POSITION.y, LIGHT.POSITION.z);
    dirLight.up.set(LIGHT.UP.x, LIGHT.UP.y, LIGHT.UP.z);
    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = LIGHT.SHADOW_MAP_SIZE;
    dirLight.shadow.mapSize.height = LIGHT.SHADOW_MAP_SIZE;

    const sc = LIGHT.SHADOW_CAMERA;
    dirLight.shadow.camera.up.set(sc.up.x, sc.up.y, sc.up.z);
    dirLight.shadow.camera.left = sc.left;
    dirLight.shadow.camera.right = sc.right;
    dirLight.shadow.camera.top = sc.top;
    dirLight.shadow.camera.bottom = sc.bottom;
    dirLight.shadow.camera.near = sc.near;
    dirLight.shadow.camera.far = sc.far;

    return dirLight;
  }

  _initListeners() {
    window.addEventListener("resize", this._onResize);
    this.input = new InputSystem();
    eventBus.on(Events.INPUT_DIRECTION, (direction) => this.player.queueMove(direction));
    eventBus.on(Events.SCORE_CHANGED, (score) => this._applyBiome(getBiomeForScore(score)));
  }

  /**
   * Applies a biome's sky/fog/light to the scene. The very first application
   * (game load or right after a reset) is silent — Events.BIOME_CHANGED only
   * fires for an actual mid-run transition, so the "entering a new biome"
   * banner doesn't also fire on every fresh start.
   */
  _applyBiome(biome) {
    if (this._currentBiomeId === biome.id) return;
    const isInitial = this._currentBiomeId === null;
    this._currentBiomeId = biome.id;

    this.scene.background = new THREE.Color(biome.colors.sky);
    this.scene.fog = new THREE.Fog(biome.colors.sky, biome.fog.near, biome.fog.far);
    this.ambientLight.color.set(biome.light.ambient);
    this.dirLight.color.set(biome.light.directional);

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
  };

  _initGame() {
    this.levelBuilder.build();
    this.player.reset();
    eventBus.emit(Events.GAME_RESET);
  }

  /** Public: called by the Retry button. */
  reset() {
    this._currentBiomeId = null; // fresh run always restarts silently in the first biome
    this.levelBuilder.reset();
    this.player.reset();
    eventBus.emit(Events.GAME_RESET);
  }

  _tick() {
    const delta = Math.min(this.clock.getDelta(), 0.1);
    updateVehicles(delta, this.levelBuilder.metadata);
    this.player.update(delta);
    this.physics.checkCollisions(this.player, this.levelBuilder.metadata);
    this.renderer.render(this.scene, this.camera);
  }
}
