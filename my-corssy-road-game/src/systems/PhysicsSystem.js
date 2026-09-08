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

    // `gameState.currentRow` only advances once a hop fully lands, so mid-hop
    // it still points at the row the player is leaving. Also test the row the
    // active hop is heading into — otherwise the player can be visually inside
    // a vehicle/railway row for the whole 0.2s hop without any collision check
    // ever looking at it, and a fast car or train passes straight through.
    const pending = gameState.movesQueue[0];
    const rowIndices = [gameState.currentRow];
    if (pending === "forward") rowIndices.push(gameState.currentRow + 1);
    else if (pending === "backward") rowIndices.push(gameState.currentRow - 1);

    let playerBoxRead = false;
    for (const rowIndex of rowIndices) {
      const row = rows[rowIndex - 1];
      if (!row) continue;
      if (row.type !== "vehicles" && row.type !== "railway") continue;

      if (!playerBoxRead) {
        readCollider(player.object3D, this._playerBox);
        playerBoxRead = true;
      }

      if (row.type === "vehicles") {
        for (const { ref } of row.vehicles) {
          if (!ref) throw Error("Vehicle reference is missing");
          readCollider(ref, this._vehicleBox);
          if (this._playerBox.intersectsBox(this._vehicleBox)) return this._kill();
        }
        continue;
      }

      // Railway: safe to stand on unless a train is sweeping through right now.
      const t = row.train;
      if (t.state === "passing" && t.ref?.visible) {
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
