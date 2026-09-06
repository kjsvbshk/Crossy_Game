import * as THREE from "three";
import { COLORS, PLAYER_CONFIG, WORLD } from "../core/Constants";
import { gameState } from "../core/GameState";
import { eventBus, Events } from "../core/EventBus";
import { endsUpInValidPosition } from "./movementRules";

export class Player {
  constructor(levelBuilder) {
    this.levelBuilder = levelBuilder;
    this.object3D = this._buildMesh();
    this._stepElapsed = 0; // seconds into the current hop; see update()
  }

  _buildMesh() {
    const player = new THREE.Group();

    const { width: bw, depth: bd, height: bh } = PLAYER_CONFIG.BODY_SIZE;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(bw, bd, bh),
      new THREE.MeshLambertMaterial({ color: COLORS.PLAYER_BODY, flatShading: true })
    );
    body.castShadow = true;
    body.receiveShadow = true;
    body.position.z = PLAYER_CONFIG.BODY_Z;
    player.add(body);

    const { width: cw, depth: cd, height: ch } = PLAYER_CONFIG.CAP_SIZE;
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(cw, cd, ch),
      new THREE.MeshLambertMaterial({ color: COLORS.PLAYER_CAP, flatShading: true })
    );
    cap.position.z = PLAYER_CONFIG.CAP_Z;
    cap.castShadow = true;
    cap.receiveShadow = true;
    player.add(cap);

    const playerContainer = new THREE.Group();
    playerContainer.add(player);
    return playerContainer;
  }

  reset() {
    this.object3D.position.x = 0;
    this.object3D.position.y = 0;
    this.object3D.children[0].position.z = 0;
    this._stepElapsed = 0;

    gameState.reset();
    eventBus.emit(Events.SCORE_CHANGED, gameState.score);
  }

  queueMove(direction) {
    if (!gameState.isPlaying()) return;

    // Rows more than ROWS_KEPT_BEHIND_PLAYER behind the furthest point reached
    // this run have been culled (LevelBuilder.cullRowsBehind) — block moving
    // back into that void rather than letting the player walk into empty air.
    const minRowIndex = gameState.score - WORLD.ROWS_KEPT_BEHIND_PLAYER;

    const isValidMove = endsUpInValidPosition(
      { rowIndex: gameState.currentRow, tileIndex: gameState.currentTile },
      [...gameState.movesQueue, direction],
      this.levelBuilder.metadata,
      minRowIndex
    );

    if (!isValidMove) return;

    gameState.movesQueue.push(direction);
  }

  update(delta) {
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
      this._stepElapsed = 0;
    }
  }

  _setPosition(progress, direction) {
    const tileSize = WORLD.TILE_SIZE;
    const startX = gameState.currentTile * tileSize;
    const startY = gameState.currentRow * tileSize;
    let endX = startX;
    let endY = startY;

    if (direction === "left") endX -= tileSize;
    if (direction === "right") endX += tileSize;
    if (direction === "forward") endY += tileSize;
    if (direction === "backward") endY -= tileSize;

    this.object3D.position.x = THREE.MathUtils.lerp(startX, endX, progress);
    this.object3D.position.y = THREE.MathUtils.lerp(startY, endY, progress);
    this.object3D.children[0].position.z = Math.sin(progress * Math.PI) * PLAYER_CONFIG.HOP_HEIGHT;
  }

  _setRotation(progress, direction) {
    let endRotation = 0;
    if (direction === "forward") endRotation = 0;
    if (direction === "left") endRotation = Math.PI / 2;
    if (direction === "right") endRotation = -Math.PI / 2;
    if (direction === "backward") endRotation = Math.PI;

    const inner = this.object3D.children[0];
    inner.rotation.z = THREE.MathUtils.lerp(inner.rotation.z, endRotation, progress);
  }

  _stepCompleted() {
    const direction = gameState.movesQueue.shift();
    if (!direction) return;

    if (direction === "forward") gameState.currentRow += 1;
    if (direction === "backward") gameState.currentRow -= 1;
    if (direction === "left") gameState.currentTile -= 1;
    if (direction === "right") gameState.currentTile += 1;

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
