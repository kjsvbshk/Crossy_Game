// Límites de movimiento del jugador (originales)
export const minTileIndex = -8;
export const maxTileIndex = 8;

// Límites extendidos para generación del mapa (12 bloques adicionales en cada dirección)
export const minMapTileIndex = -20;
export const maxMapTileIndex = 20;

export const tilesPerRow = maxTileIndex - minTileIndex + 1;
export const tileSize = 42;