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
  EYE: {
    SIZE: { width: 3, depth: 2, height: 3 },
    OFFSET_X: 4,
    OFFSET_Z: 15,
  },
  // Stretches taller/narrower at the peak of the hop, back to normal at
  // takeoff/landing — reuses the same sin(progress*PI) curve as the hop
  // height, so it's a one-line addition rather than a separate animation.
  SQUASH_STRETCH_AMOUNT: 0.25,
};

export const VEHICLE_CONFIG = {
  MIN_COUNT_PER_ROW: 3,
  MAX_COUNT_PER_ROW: 5,
  MIN_SEPARATION_TILES: 2,
  EDGE_MARGIN_TILES: 3, // how far from the board edge vehicles may spawn
  PLACEMENT_ATTEMPTS: 100,
  SPEEDS: [125, 156, 188],
  // How many board tiles each vehicle kind occupies, for spacing purposes.
  LENGTH_TILES: {
    car: 3,
    truck: 5,
    pickup: 3,
    tanker: 5,
    snowplow: 5,
    bus: 5,
    taxi: 3,
  },
  // Small shared greebles (headlights/taillights/cabin) applied to every
  // vehicle kind so none of them reads as plain stacked boxes.
  DETAILS: {
    HEADLIGHT: { size: { width: 3, depth: 6, height: 6 } },
    TAILLIGHT: { size: { width: 3, depth: 6, height: 5 } },
    // Two-tier cabins (sit on an already-colored main body): window band + roof.
    CABIN_WINDOW_BAND_RATIO: 0.4,
    // Three-tier cabins (stand on their own): colored body + window band + roof.
    CABIN_THREE_TIER_RATIOS: { body: 0.3, window: 0.35, roof: 0.35 },
  },
  CAR: {
    MAIN_SIZE: { width: 60, depth: 30, height: 15 },
    MAIN_Z: 12,
    CABIN_SIZE: { width: 33, depth: 24, height: 12 },
    CABIN_POSITION: { x: -6, z: 25.5 },
    FRONT_WHEEL_X: 18,
    BACK_WHEEL_X: -18,
    HEADLIGHT_X: 29,
    HEADLIGHT_SPREAD_Y: 10,
    TAILLIGHT_X: -29,
    TAILLIGHT_SPREAD_Y: 10,
  },
  TRUCK: {
    CARGO_SIZE: { width: 70, depth: 35, height: 35 },
    CARGO_POSITION: { x: -15, z: 25 },
    CABIN_SIZE: { width: 30, depth: 30, height: 30 },
    CABIN_POSITION: { x: 35, z: 20 },
    FRONT_WHEEL_X: 37,
    MIDDLE_WHEEL_X: 5,
    BACK_WHEEL_X: -35,
    HEADLIGHT_X: 49,
    HEADLIGHT_SPREAD_Y: 12,
    HEADLIGHT_Z: 8, // bumper height, below the cabin's window band
    TAILLIGHT_X: -49,
    TAILLIGHT_SPREAD_Y: 14,
    TAILLIGHT_Z: 14,
  },
  PICKUP: {
    MAIN_SIZE: { width: 65, depth: 30, height: 14 },
    MAIN_Z: 11,
    CABIN_SIZE: { width: 26, depth: 26, height: 16 },
    CABIN_POSITION: { x: 10, z: 26 },
    BED_SIZE: { width: 30, depth: 28, height: 9 },
    BED_POSITION: { x: -18, z: 18.5 },
    FRONT_WHEEL_X: 24,
    BACK_WHEEL_X: -20,
    HEADLIGHT_X: 32,
    HEADLIGHT_SPREAD_Y: 10,
    TAILLIGHT_X: -32,
    TAILLIGHT_SPREAD_Y: 12,
  },
  TANKER: {
    TANK_RADIUS: 17,
    TANK_LENGTH: 55,
    TANK_POSITION: { x: -14, z: 24 },
    CABIN_SIZE: { width: 30, depth: 30, height: 30 },
    CABIN_POSITION: { x: 35, z: 20 },
    FRONT_WHEEL_X: 37,
    MIDDLE_WHEEL_X: 5,
    BACK_WHEEL_X: -35,
    HEADLIGHT_X: 49,
    HEADLIGHT_SPREAD_Y: 12,
    HEADLIGHT_Z: 8, // bumper height, below the cabin's window band
    TAILLIGHT_X: -40,
    TAILLIGHT_SPREAD_Y: 15,
    TAILLIGHT_Z: 14,
  },
  SNOWPLOW: {
    CARGO_SIZE: { width: 40, depth: 33, height: 24 },
    CARGO_POSITION: { x: -25, z: 17 },
    CABIN_SIZE: { width: 30, depth: 30, height: 30 },
    CABIN_POSITION: { x: 25, z: 20 },
    BLADE_SIZE: { width: 6, depth: 50, height: 26 },
    BLADE_POSITION: { x: 48, z: 15 },
    BLADE_TILT: 0.18,
    FRONT_WHEEL_X: 40,
    MIDDLE_WHEEL_X: 5,
    BACK_WHEEL_X: -35,
    HEADLIGHT_X: 42,
    HEADLIGHT_SPREAD_Y: 12,
    HEADLIGHT_Z: 8, // bumper height, below the cabin's window band
    TAILLIGHT_X: -44,
    TAILLIGHT_SPREAD_Y: 15,
    TAILLIGHT_Z: 14,
  },
  BUS: {
    BODY_SIZE: { width: 95, depth: 32, height: 32 },
    BODY_Z: 18,
    WINDOW_STRIP_SIZE: { width: 82, depth: 33, height: 10 },
    WINDOW_STRIP_Z: 26,
    ROOF_SIZE: { width: 88, depth: 30, height: 6 },
    ROOF_Z: 37,
    FRONT_WHEEL_X: 32,
    BACK_WHEEL_X: -32,
    HEADLIGHT_X: 46.5,
    HEADLIGHT_SPREAD_Y: 12,
    HEADLIGHT_Z: 12,
    TAILLIGHT_X: -46.5,
    TAILLIGHT_SPREAD_Y: 12,
    TAILLIGHT_Z: 12,
  },
  TAXI_SIGN: {
    SIZE: { width: 10, depth: 14, height: 8 },
    Z_OFFSET: 6, // above the car's cabin roof
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

export const SCENERY_CONFIG = {
  PROPS_PER_ROW: 4,
};

export const ANIMATION_CONFIG = {
  SWAY_AMPLITUDE: 0.05, // radians
  SWAY_SPEED: 1.4, // radians/sec
};

export const ROAD_CONFIG = {
  LANE_LINE_DEPTH: 2, // how thick (along Y) each lane-divider stripe is
  LANE_LINE_INSET: 1, // how far the stripe sits from the tile's true edge
  LANE_LINE_Z: 0.1, // just above the road surface, avoids z-fighting
};

export const PROP_CONFIG = {
  BUSH: {
    MAIN_RADIUS: 14,
    SIDE_RADIUS: 10,
    SIDE_OFFSET_X: 12,
  },
  ROCK: {
    RADIUS: 16,
  },
  CACTUS: {
    TRUNK: { radiusTop: 8, radiusBottom: 10, height: 45 },
    ARM: { radiusTop: 4, radiusBottom: 5, height: 20 },
    ARM_OFFSET_X: 11,
    ARM_OFFSET_Z: 26,
    ARM_TILT: Math.PI / 5,
  },
  DEAD_BUSH: {
    MAIN_RADIUS: 10,
    SIDE_RADIUS: 7,
    SIDE_OFFSET_X: 9,
  },
  PINE: {
    TRUNK: { radiusTop: 4, radiusBottom: 5, height: 15 },
    CROWN_TIERS: [
      { radius: 18, height: 22 },
      { radius: 14, height: 18 },
      { radius: 9, height: 14 },
    ],
    CROWN_OVERLAP: 6, // how much each tier sinks into the one below, for a fuller silhouette
  },
  SNOWMAN: {
    TIER_RADII: [16, 12, 8], // bottom to top
    NOSE: { radius: 2, height: 8 },
  },
  STREET_LAMP: {
    POLE: { radius: 3, height: 60 },
    HEAD_RADIUS: 8,
  },
  HYDRANT: {
    BODY: { radiusTop: 9, radiusBottom: 11, height: 28 },
    CAP_RADIUS: 7,
    NUB: { radius: 3, height: 8 },
    NUB_OFFSET_X: 12,
    NUB_OFFSET_Z: 18,
  },
};

export const CAMERA = {
  ORTHO_SIZE: 300,
  NEAR: 100,
  FAR: 900,
  POSITION: { x: 300, y: -300, z: 300 },
  UP: { x: 0, y: 0, z: 1 },
};

export const WEATHER_CONFIG = {
  FOG_PROBABILITY: 1 / 6, // rolled once per run — not every game has fog
  CLEAR_INTENSITY_MULTIPLIER: 1.3, // brighter/more dynamic light when there's no fog to compensate
  CLEAR_WARM_TINT: 0xfff2d9,
  CLEAR_WARM_TINT_STRENGTH: 0.25,
};

export const RENDERER = {
  MAX_PIXEL_RATIO: 2,
  SHADOWS_ENABLED: true, // deliberate: kept on to preserve current look; revisit in a perf pass
  // Deliberate departure from the skill's "no postprocessing by default" —
  // requested explicitly, but turned off for now: at daytime brightness it
  // blooms the light-colored lane lines more than intended. Re-enable once
  // night biomes/maps land, where bloom on lit surfaces will actually read
  // as intentional instead of an odd glow on the road markings.
  POSTFX_ENABLED: false,
  BLOOM: {
    strength: 0.35,
    radius: 0.4,
    threshold: 0.82, // high on purpose — only real highlights (headlights, lamps, snow) should glow
  },
};

export const LIGHT = {
  POSITION: { x: -100, y: -100, z: 200 },
  UP: { x: 0, y: 0, z: 1 },
  SHADOW_MAP_SIZE: 2048,
  SHADOW_CAMERA: { up: { x: 0, y: 1, z: 0 }, left: -400, right: 400, top: 400, bottom: -400, near: 50, far: 400 },
};

export const COLORS = {
  WHEEL: 0x333333,
  PLAYER_BODY: 'white',
  PLAYER_CAP: 0xf0619a,
  PLAYER_EYE: 0x1c1c1c,
  TRUCK_CARGO: 0xb4c6fc,
  VEHICLE_BODY: [0xa52523, 0xbdb638, 0x78b14b],
  CABIN_WHITE: 'white',
  // Props exclusive to a single biome — a fixed palette each, no per-biome tinting needed.
  TREE_TRUNK: 0x4d2926,
  TREE_CROWN: 0x7aa21d,
  PINE_TRUNK: 0x5a4638,
  PINE_CROWN: 0x2f6b4f,
  SNOWMAN_BODY: 0xfafcff,
  SNOWMAN_NOSE: 0xe6822e,
  LAMP_POLE: 0x3a3d42,
  LAMP_HEAD: 0xfff4d6,
  HYDRANT_BODY: 0xc23b3b,
  LANE_LINE: 0xf5f0dc,
  // Shared vehicle greebles + new vehicle kinds.
  HEADLIGHT: 0xfff6d1,
  TAILLIGHT: 0xb3221c,
  WINDSHIELD: 0x2b3a4a,
  TANKER_TANK: 0xd8dde2,
  SNOWPLOW_BLADE: 0xe87a1c,
  TAXI_BODY: 0xf4c430,
  TAXI_SIGN: 0x1c1c1c,
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
