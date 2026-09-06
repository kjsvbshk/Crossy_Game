import * as THREE from "three";
import { gameState } from "../core/GameState";
import { eventBus, Events } from "../core/EventBus";

export class PhysicsSystem {
  constructor() {
    // Reused every check instead of allocating a new Box3 per vehicle per frame.
    this._playerBox = new THREE.Box3();
    this._vehicleBox = new THREE.Box3();
  }

  checkCollisions(player, rows) {
    if (!gameState.isPlaying()) return;

    const row = rows[gameState.currentRow - 1];
    if (!row || row.type !== "vehicles") return;

    this._playerBox.setFromObject(player.object3D);

    for (const { ref } of row.vehicles) {
      if (!ref) throw Error("Vehicle reference is missing");

      this._vehicleBox.setFromObject(ref);
      if (this._playerBox.intersectsBox(this._vehicleBox)) {
        gameState.gameOver();
        eventBus.emit(Events.GAME_OVER, gameState.score);
        return;
      }
    }
  }
}
