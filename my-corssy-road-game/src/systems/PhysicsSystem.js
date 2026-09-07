import * as THREE from "three";
import { gameState } from "../core/GameState";
import { eventBus, Events } from "../core/EventBus";
import { readCollider } from "../gameplay/collision";

export class PhysicsSystem {
  constructor() {
    // Reused every check instead of allocating a new Box3 per vehicle per frame.
    this._playerBox = new THREE.Box3();
    this._vehicleBox = new THREE.Box3();
  }

  checkCollisions(player, rows) {
    if (!gameState.isPlaying()) return;

    const row = rows[gameState.currentRow - 1];
    if (!row) return;

    if (row.type === "vehicles") {
      readCollider(player.object3D, this._playerBox);
      for (const { ref } of row.vehicles) {
        if (!ref) throw Error("Vehicle reference is missing");
        readCollider(ref, this._vehicleBox);
        if (this._playerBox.intersectsBox(this._vehicleBox)) return this._kill();
      }
      return;
    }

    // Railway: safe to stand on unless a train is sweeping through right now.
    if (row.type === "railway") {
      const t = row.train;
      if (t.state === "passing" && t.ref?.visible) {
        readCollider(player.object3D, this._playerBox);
        readCollider(t.ref, this._vehicleBox);
        if (this._playerBox.intersectsBox(this._vehicleBox)) return this._kill();
      }
    }
  }

  _kill() {
    gameState.gameOver();
    eventBus.emit(Events.GAME_OVER, gameState.score);
  }
}
