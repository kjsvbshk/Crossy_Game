import { WEATHER_CONFIG } from './Constants';

class GameState {
  constructor() {
    this.movesQueue = [];
    // Meta-progression — persists across runs, loaded from Persistence by
    // Game.js on boot and saved back on coin/unlock/game-over.
    this.characterId = null; // null → default skin (CharacterDefinitions)
    this.coins = 0;
    this.highScore = 0;
    this.unlocked = ['dough'];
    this.reset();
    // Boot into the start screen, not straight into play.
    this.status = 'menu';
  }

  reset() {
    this.status = 'playing'; // 'menu' | 'playing' | 'gameover'
    this.currentRow = 0;
    this.currentTile = 0;
    this.score = 0;
    this.movesQueue.length = 0;
    // Continuous X carried by a river log, on top of currentTile * TILE_SIZE.
    // Snapped back to 0 the moment the player lands on solid ground.
    this.rideOffsetX = 0;
    // Seconds since the last forward step — drives the idle-death eagle.
    this.idleTime = 0;
    // Rolled once per run, not per biome — either the whole run is foggy or
    // it isn't. Game.js reads this to decide fog vs. brighter/warmer light.
    this.hasFog = Math.random() < WEATHER_CONFIG.FOG_PROBABILITY;
  }

  isPlaying() {
    return this.status === 'playing';
  }

  gameOver() {
    this.status = 'gameover';
  }
}

export const gameState = new GameState();
