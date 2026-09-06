class GameState {
  constructor() {
    this.movesQueue = [];
    this.reset();
  }

  reset() {
    // No menu/start screen exists yet — a fresh game is immediately playable,
    // matching the previous `gameActive = true` default.
    this.status = 'playing'; // 'playing' | 'gameover'
    this.currentRow = 0;
    this.currentTile = 0;
    this.score = 0;
    this.movesQueue.length = 0;
  }

  isPlaying() {
    return this.status === 'playing';
  }

  gameOver() {
    this.status = 'gameover';
  }
}

export const gameState = new GameState();
