import { WORLD, RIVER_CONFIG } from "../core/Constants";
import { gameState } from "../core/GameState";
import { eventBus, Events } from "../core/EventBus";

// River logic. Runs after the player's hop each frame: if the player is
// standing still on a river row, either carry them along with the log they
// landed on, or drown them if they landed on open water (or a log has since
// carried them off the board).
//
// The player's true X on a river row is `currentTile * TILE_SIZE +
// gameState.rideOffsetX`; Player.js snaps rideOffsetX back to 0 the moment a
// hop lands on solid ground.

export class RideSystem {
  update(delta, player, rows) {
    if (!gameState.isPlaying()) return;

    const row = rows[gameState.currentRow - 1];
    const onRiver = row && row.type === "river";

    // Off the water: make sure the ride-lift is cleared (e.g. just hopped ashore).
    if (!onRiver) {
      if (player.object3D.position.z !== 0) player.object3D.position.z = 0;
      return;
    }

    if (gameState.movesQueue.length) return; // mid-hop: neither carried nor drowned

    const worldX = gameState.currentTile * WORLD.TILE_SIZE + gameState.rideOffsetX;
    const tolerance = RIVER_CONFIG.RIDE_TOLERANCE_TILES * WORLD.TILE_SIZE;

    let log = null;
    for (const entry of row.logs) {
      const ref = entry.ref;
      if (ref && Math.abs(worldX - ref.position.x) <= ref.userData.halfLength + tolerance) {
        log = ref;
        break;
      }
    }

    if (!log) return this._drown();

    // Ride on top of the barrel, and drift with it.
    player.object3D.position.z = RIVER_CONFIG.RIDE_HEIGHT;
    gameState.rideOffsetX += row.speed * delta * (row.direction ? 1 : -1);
    player.object3D.position.x = gameState.currentTile * WORLD.TILE_SIZE + gameState.rideOffsetX;

    const limit = (WORLD.MAX_TILE_INDEX + 2) * WORLD.TILE_SIZE;
    if (Math.abs(player.object3D.position.x) > limit) this._drown();
  }

  _drown() {
    gameState.gameOver();
    eventBus.emit(Events.PLAYER_DROWNED);
    eventBus.emit(Events.GAME_OVER, gameState.score);
  }
}
