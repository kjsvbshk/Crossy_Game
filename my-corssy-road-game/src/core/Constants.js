// Every magic number, balance value, and asset color for the game lives here,
// organized by domain, per the threejs-game-dev skill.

export const WORLD = {
  MIN_TILE_INDEX: -8,
  MAX_TILE_INDEX: 8,
  TILE_SIZE: 42,
  ROWS_PER_BATCH: 20,
  ROWS_REMAINING_BEFORE_REFILL: 10,
  INITIAL_GRASS_ROWS_BEHIND: 5,
  ROWS_KEPT_BEHIND_PLAYER: 5, // rows further back than this are culled from the scene + metadata
  VEHICLE_ROW_EDGE_BUFFER_TILES: 2, // extra tiles past the board edge before a vehicle wraps
  GRASS_FOUNDATION_DEPTH: 3,
};
WORLD.TILES_PER_ROW = WORLD.MAX_TILE_INDEX - WORLD.MIN_TILE_INDEX + 1;

export const PLAYER_CONFIG = {
  STEP_DURATION_S: 0.2,
  HOP_HEIGHT: 8,
  BODY_SIZE: { width: 15, depth: 15, height: 20 },
  BODY_Z: 10,
  CAP_SIZE: { width: 2, depth: 4, height: 2 },
  CAP_Z: 21,
};

export const VEHICLE_CONFIG = {
  MIN_COUNT_PER_ROW: 3,
  MAX_COUNT_PER_ROW: 5,
  MIN_SEPARATION_TILES: 2,
  EDGE_MARGIN_TILES: 3, // how far from the board edge vehicles may spawn
  PLACEMENT_ATTEMPTS: 100,
  SPEEDS: [125, 156, 188],
  CAR_LENGTH_TILES: 3,
  TRUCK_LENGTH_TILES: 5,
  CAR: {
    MAIN_SIZE: { width: 60, depth: 30, height: 15 },
    MAIN_Z: 12,
    CABIN_SIZE: { width: 33, depth: 24, height: 12 },
    CABIN_POSITION: { x: -6, z: 25.5 },
    FRONT_WHEEL_X: 18,
    BACK_WHEEL_X: -18,
  },
  TRUCK: {
    CARGO_SIZE: { width: 70, depth: 35, height: 35 },
    CARGO_POSITION: { x: -15, z: 25 },
    CABIN_SIZE: { width: 30, depth: 30, height: 30 },
    CABIN_POSITION: { x: 35, z: 20 },
    FRONT_WHEEL_X: 37,
    MIDDLE_WHEEL_X: 5,
    BACK_WHEEL_X: -35,
  },
  WHEEL: {
    SIZE: { width: 12, depth: 33, height: 12 },
    Z: 6,
  },
};

export const INPUT_CONFIG = {
  SWIPE_THRESHOLD_PX: 30,
};

export const FOREST_CONFIG = {
  TREES_PER_ROW: 4,
  CROWN_HEIGHTS: [20, 45, 60],
  CROWN_WIDTH: 30,
  CROWN_DEPTH: 30,
  TRUNK_SIZE: { width: 15, depth: 15, height: 20 },
  TRUNK_Z: 10,
};

export const CAMERA = {
  ORTHO_SIZE: 300,
  NEAR: 100,
  FAR: 900,
  POSITION: { x: 300, y: -300, z: 300 },
  UP: { x: 0, y: 0, z: 1 },
};

export const RENDERER = {
  MAX_PIXEL_RATIO: 2,
  SHADOWS_ENABLED: true, // deliberate: kept on to preserve current look; revisit in a perf pass
};

export const LIGHT = {
  POSITION: { x: -100, y: -100, z: 200 },
  UP: { x: 0, y: 0, z: 1 },
  SHADOW_MAP_SIZE: 2048,
  SHADOW_CAMERA: { up: { x: 0, y: 1, z: 0 }, left: -400, right: 400, top: 400, bottom: -400, near: 50, far: 400 },
};

export const COLORS = {
  GRASS: 0xbaf455,
  ROAD: 0x454a59,
  TREE_TRUNK: 0x4d2926,
  TREE_CROWN: 0x7aa21d,
  WHEEL: 0x333333,
  PLAYER_BODY: 'white',
  PLAYER_CAP: 0xf0619a,
  TRUCK_CARGO: 0xb4c6fc,
  VEHICLE_BODY: [0xa52523, 0xbdb638, 0x78b14b],
  CABIN_WHITE: 'white',
};

// --- Play.fun safe zone (see .claude/skills/threejs-game-dev/SKILL.md) ---
function _readSafeInsets() {
  const s = getComputedStyle(document.documentElement);
  return {
    top: parseInt(s.getPropertyValue('--ogp-safe-top-inset')) || 0,
    bottom: parseInt(s.getPropertyValue('--ogp-safe-bottom-inset')) || 0,
  };
}
const _insets = _readSafeInsets();

export const SAFE_ZONE = {
  TOP_PX: Math.max(75, _insets.top),
  BOTTOM_PX: _insets.bottom,
  TOP_PERCENT: 8,
};
