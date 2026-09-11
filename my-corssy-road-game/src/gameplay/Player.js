import * as THREE from "three";
import { PLAYER_CONFIG, CHARACTER, WORLD } from "../core/Constants";
import { gameState } from "../core/GameState";
import { eventBus, Events } from "../core/EventBus";
import { endsUpInValidPosition } from "./movementRules";
import { colliderFromSize } from "./collision";
import { buildCharacter } from "./characters/buildCharacter";
import { DEFAULT_CHARACTER_ID } from "./characters/CharacterDefinitions";

export class Player {
  constructor(levelBuilder) {
    this.levelBuilder = levelBuilder;
    this.characterId = null;
    this._stepElapsed = 0; // seconds into the current hop; see update()
    // True only on the frame a hop lands (currentRow/currentTile just
    // updated), even if the next hop is already buffered and about to start.
    // RideSystem needs this: with PLAYER_CONFIG.MAX_QUEUED_MOVES > 1 the
    // moves queue is no longer empty right after landing, so it can't use
    // "queue empty" alone as its landing signal.
    this.justLanded = false;

    // The container never gets rebuilt — Game.js parents the camera and the
    // lighting rig to it. Only its inner character group is swapped when the
    // player picks a different skin. The shared collider lives on the
    // container: one hitbox for every skin, and it never rotates or rises
    // with the hop.
    this.object3D = new THREE.Group();
    const c = CHARACTER.COLLIDER;
    this.object3D.userData.collider = colliderFromSize(
      { width: c.width, depth: c.depth, height: c.height },
      { x: 0, y: 0, z: c.centerZ },
    );

    this._mountCharacter(gameState.characterId ?? DEFAULT_CHARACTER_ID);
  }

  _mountCharacter(id) {
    if (this.inner) this.object3D.remove(this.inner);

    // Geometries/materials come from shared caches (roundedBox / clayMaterial),
    // so the detached group is just dropped, never disposed.
    const built = buildCharacter(id);
    this.inner = built.group;
    this._feet = built.feet;
    this._laggers = [...built.ears, ...(built.tail ? [built.tail] : [])];
    this._feetBaseZ = this._feet.map((f) => f.position.z);
    this._laggerBaseRotX = this._laggers.map((m) => m.rotation.x);
    this._juice = {
      hopHeight: built.juice?.hopHeight ?? PLAYER_CONFIG.HOP_HEIGHT,
      squash: built.juice?.squash ?? PLAYER_CONFIG.SQUASH_STRETCH_AMOUNT,
    };

    this.object3D.add(this.inner);
    this.characterId = id;
    this._resetPose();
  }

  /** Public: called by the character-select screen. */
  setCharacter(id) {
    if (id !== this.characterId) this._mountCharacter(id);
  }

  _resetPose() {
    this.inner.position.set(0, 0, 0);
    this.inner.rotation.z = 0;
    this.inner.scale.set(1, 1, 1);
    this._feet.forEach((foot, i) => (foot.position.z = this._feetBaseZ[i]));
    this._laggers.forEach((m, i) => (m.rotation.x = this._laggerBaseRotX[i]));
  }

  reset() {
    const wanted = gameState.characterId ?? DEFAULT_CHARACTER_ID;
    if (wanted !== this.characterId) this._mountCharacter(wanted);

    this.object3D.position.set(0, 0, 0); // z too — clears any leftover log ride-lift
    this._resetPose();
    this._stepElapsed = 0;
    this.justLanded = false;

    gameState.reset();
    eventBus.emit(Events.SCORE_CHANGED, gameState.score);
  }

  queueMove(direction) {
    if (!gameState.isPlaying()) return;

    // Cap how far ahead input can buffer. Without this, mashing the keyboard
    // queues a dozen hops that keep playing after the keys are released — the
    // player overshoots and can slide across a vehicle row faster than
    // collision (which only samples the committed row) can react.
    if (gameState.movesQueue.length >= PLAYER_CONFIG.MAX_QUEUED_MOVES) return;

    // Rows more than ROWS_KEPT_BEHIND_PLAYER behind the furthest point reached
    // this run have been culled (LevelBuilder.cullRowsBehind) — block moving
    // back into that void rather than letting the player walk into empty air.
    const minRowIndex = gameState.score - WORLD.ROWS_KEPT_BEHIND_PLAYER;

    // While riding a river log, currentTile stays frozen at the landing tile
    // and the real X lives in rideOffsetX. Validate from where the player
    // actually is (matching the rounding _stepCompleted uses on landing), or a
    // prop stays "blocking" forever even after the log has drifted the player
    // clear of it. Off-river rideOffsetX is 0, so this is a no-op there.
    const effectiveTile = Math.round(
      (gameState.currentTile * WORLD.TILE_SIZE + gameState.rideOffsetX) / WORLD.TILE_SIZE,
    );

    const isValidMove = endsUpInValidPosition(
      { rowIndex: gameState.currentRow, tileIndex: effectiveTile },
      [...gameState.movesQueue, direction],
      this.levelBuilder.metadata,
      minRowIndex
    );

    if (!isValidMove) return;

    gameState.idleTime = 0; // committing to a move counts as not idling
    gameState.movesQueue.push(direction);
  }

  update(delta) {
    this.justLanded = false;
    const movesQueue = gameState.movesQueue;
    if (!movesQueue.length) {
      this._stepElapsed = 0;
      return;
    }

    this._stepElapsed += delta;
    const progress = Math.min(1, this._stepElapsed / PLAYER_CONFIG.STEP_DURATION_S);

    this._setPosition(progress, movesQueue[0]);
    this._setRotation(progress, movesQueue[0]);

    if (progress >= 1) {
      this._stepCompleted();
      this.justLanded = true;
      this._stepElapsed = 0;
    }
  }

  _setPosition(progress, direction) {
    const tileSize = WORLD.TILE_SIZE;
    // rideOffsetX is the continuous drift a river log has added; hops start
    // from wherever the player actually is, not the bare tile centre.
    const startX = gameState.currentTile * tileSize + gameState.rideOffsetX;
    const startY = gameState.currentRow * tileSize;
    let endX = startX;
    let endY = startY;

    if (direction === "left") endX -= tileSize;
    if (direction === "right") endX += tileSize;
    if (direction === "forward") endY += tileSize;
    if (direction === "backward") endY -= tileSize;

    this.object3D.position.x = THREE.MathUtils.lerp(startX, endX, progress);
    this.object3D.position.y = THREE.MathUtils.lerp(startY, endY, progress);

    const hop = Math.sin(progress * Math.PI); // 0 at takeoff/landing, 1 at the peak
    this.inner.position.z = hop * this._juice.hopHeight;

    // Squash/stretch, feet splaying down, ears + tail lagging back — all off
    // the same hop curve, no separate animation state.
    const stretch = hop * this._juice.squash;
    this.inner.scale.set(1 - stretch * 0.5, 1 - stretch * 0.5, 1 + stretch);
    this._feet.forEach((foot, i) => {
      foot.position.z = this._feetBaseZ[i] - hop * PLAYER_CONFIG.FEET_BOB;
    });
    this._laggers.forEach((m, i) => {
      m.rotation.x = this._laggerBaseRotX[i] - hop * PLAYER_CONFIG.APPENDAGE_LAG;
    });
  }

  _setRotation(progress, direction) {
    let endRotation = 0;
    if (direction === "forward") endRotation = 0;
    if (direction === "left") endRotation = Math.PI / 2;
    if (direction === "right") endRotation = -Math.PI / 2;
    if (direction === "backward") endRotation = Math.PI;

    this.inner.rotation.z = THREE.MathUtils.lerp(this.inner.rotation.z, endRotation, progress);
  }

  _stepCompleted() {
    const direction = gameState.movesQueue.shift();
    if (!direction) return;

    if (direction === "forward") gameState.currentRow += 1;
    if (direction === "backward") gameState.currentRow -= 1;
    if (direction === "left") gameState.currentTile -= 1;
    if (direction === "right") gameState.currentTile += 1;

    gameState.idleTime = 0; // a real move — the eagle's timer restarts
    eventBus.emit(Events.PLAYER_MOVED);

    // Landing on solid ground snaps the log-drift offset back onto the grid;
    // landing on another river row keeps it so RideSystem stays continuous.
    const landedRow = this.levelBuilder.metadata[gameState.currentRow - 1];
    if (!landedRow || landedRow.type !== "river") {
      const worldX = gameState.currentTile * WORLD.TILE_SIZE + gameState.rideOffsetX;
      gameState.currentTile = Math.round(worldX / WORLD.TILE_SIZE);
      gameState.rideOffsetX = 0;
    }

    // Coin pickup — walk over it, it's yours.
    if (landedRow && landedRow.type === "scenery") {
      const coin = landedRow.props.find(
        (p) => p.coin && !p.collected && p.tileIndex === gameState.currentTile,
      );
      if (coin) {
        coin.collected = true;
        this.levelBuilder.collectCoin(gameState.currentRow, coin);
        gameState.coins += 1;
        gameState.coinsThisRun += 1;
        eventBus.emit(Events.COIN_COLLECTED, gameState.coins);
      }
    }

    // Update score if current row is a new high point for this run
    if (gameState.currentRow > gameState.score) {
      gameState.score = gameState.currentRow;
      eventBus.emit(Events.SCORE_CHANGED, gameState.score);
    }

    // Add new rows if the player is running out of them
    if (gameState.currentRow > this.levelBuilder.metadata.length - WORLD.ROWS_REMAINING_BEFORE_REFILL) {
      this.levelBuilder.addRows();
    }

    // Culls relative to the high-water mark (score), not the live row: once a
    // row is culled it's gone for good, so the boundary must never retreat
    // just because the player steps backward.
    this.levelBuilder.cullRowsBehind(gameState.score);
  }
}
