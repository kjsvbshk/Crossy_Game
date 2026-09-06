import { WORLD } from "../core/Constants";

const { MIN_TILE_INDEX: minTileIndex, MAX_TILE_INDEX: maxTileIndex } = WORLD;

export function calculateFinalPosition(currentPosition, moves) {
  return moves.reduce((position, direction) => {
    if (direction === "forward")
      return {
        rowIndex: position.rowIndex + 1,
        tileIndex: position.tileIndex,
      };
    if (direction === "backward")
      return {
        rowIndex: position.rowIndex - 1,
        tileIndex: position.tileIndex,
      };
    if (direction === "left")
      return {
        rowIndex: position.rowIndex,
        tileIndex: position.tileIndex - 1,
      };
    if (direction === "right")
      return {
        rowIndex: position.rowIndex,
        tileIndex: position.tileIndex + 1,
      };
    return position;
  }, currentPosition);
}

export function endsUpInValidPosition(currentPosition, moves, rows, minRowIndex = 0) {
  // Calculate where the player would end up after the move
  const finalPosition = calculateFinalPosition(currentPosition, moves);

  // Detect if we hit the edge of the board, or backtrack past the rows
  // already culled behind the player (see LevelBuilder.cullRowsBehind) —
  // a soft limit standing in for the real game's eagle, until that lands.
  if (
    finalPosition.rowIndex === -1 ||
    finalPosition.tileIndex === minTileIndex - 1 ||
    finalPosition.tileIndex === maxTileIndex + 1 ||
    finalPosition.rowIndex < minRowIndex
  ) {
    // Invalid move, ignore move command
    return false;
  }

  // Detect if we hit a scenery prop (colisión solo cuando está exactamente en su casilla)
  const finalRow = rows[finalPosition.rowIndex - 1];
  if (
    finalRow &&
    finalRow.type === "scenery" &&
    finalRow.props.some((prop) => prop.tileIndex === finalPosition.tileIndex)
  ) {
    // Invalid move, ignore move command
    return false;
  }

  return true;
}
