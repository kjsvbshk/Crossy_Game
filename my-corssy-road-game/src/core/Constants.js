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
  // Fallbacks when a character def omits its own juice values. A character's
  // parts, palette and per-hop juice live in gameplay/characters/*.
  HOP_HEIGHT: 8,
  // Stretches taller/narrower at the peak of the hop, back to normal at
  // takeoff/landing — reuses the same sin(progress*PI) curve as the hop
  // height, so it's a one-line addition rather than a separate animation.
  SQUASH_STRETCH_AMOUNT: 0.25,
  // Feet splay down/out and ears+tail lag back at the hop peak — small,
  // cosmetic, driven by the same hop curve.
  FEET_BOB: 2.5,
  APPENDAGE_LAG: 0.5, // radians the ears/tail tilt back at peak
};

export const CHARACTER = {
  // ONE hitbox for every skin — collisions must not depend on cosmetic choice.
  // Sized to roughly the old player's effective AABB. Stamped on the player
  // container (no rotation, z fixed), so it also no longer grows mid-hop —
  // collisions are the same whether the player is airborne or grounded.
  COLLIDER: { width: 16, depth: 16, height: 24, centerZ: 12 },
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
  // Shared detail greebles added in the vehicle redesign pass.
  MIRROR: { size: { width: 4, depth: 3, height: 5 }, stalk: { width: 5, depth: 2, height: 1.5 } },
  GRILLE: { depthOut: 2 }, // how far a grille slab stands proud of the front face
  EXHAUST: { radius: 2.2, length: 8 },
  // Frozen hitbox per kind — X/Y footprint of the body as it stood before the
  // detail pass, so mirrors/exhaust/grille never inflate collisions. Z is
  // deliberately generous and shared: the player collider (z 0..24) always
  // overlaps a vehicle's Z range, so only the footprint matters.
  COLLIDER_Z: { height: 44, centerZ: 20 },
  COLLIDER: {
    car: { width: 62, depth: 33 },
    truck: { width: 101, depth: 36 },
    pickup: { width: 67, depth: 34 },
    tanker: { width: 101, depth: 36 },
    snowplow: { width: 102, depth: 52 },
    bus: { width: 96, depth: 34 },
    taxi: { width: 62, depth: 33 },
  },
};

export const INPUT_CONFIG = {
  SWIPE_THRESHOLD_PX: 30,
};

// Juice: pooled particle bursts + a short camera shake on death.
export const PARTICLE_CONFIG = {
  POOL_SIZE: 48,
};

export const CAMERA_SHAKE = {
  ON_DEATH: 7, // world-unit amplitude
  DECAY_PER_S: 30, // amplitude units shed per second
};

// --- River rows: water is lethal, logs are moving platforms you ride ---------
export const RIVER_CONFIG = {
  MIN_LOG_COUNT: 3,
  MAX_LOG_COUNT: 5,
  LOG_LENGTHS_TILES: [2, 3, 3, 4], // weighted toward 3
  MIN_SEPARATION_TILES: 2,
  EDGE_MARGIN_TILES: 3,
  PLACEMENT_ATTEMPTS: 80,
  SPEEDS: [70, 95, 120], // slower than road traffic — you have to time rides
  LOG: { radius: 8, z: 3 }, // crown sits at z ≈ 11
  WATER_Z: -1, // surface sits below the log centre so logs read as floating in it
  // The player container is lifted to this Z while riding so feet rest on the
  // log crown instead of sinking through a round barrel. Reset to 0 on landing
  // anywhere that isn't a river.
  RIDE_HEIGHT: 9,
  // How much of a tile's worth of slack around a log still counts as "aboard"
  // — a little forgiveness so a pixel-perfect landing isn't required.
  RIDE_TOLERANCE_TILES: 0.6,
};

// --- Railway rows: safe to stand on except while a train is passing ---------
export const RAILWAY_CONFIG = {
  IDLE_MIN_S: 3.0,
  IDLE_MAX_S: 7.0,
  WARNING_S: 1.6, // signal blinks before the train arrives
  TRAIN: {
    CAR_COUNT: 4,
    CAR_SIZE: { width: 78, depth: 30, height: 34 },
    CAR_GAP: 6,
    Z: 20,
    SPEED: 620, // very fast — the whole point is that you must not be on the tracks
  },
  SIGNAL: { POLE: { radius: 2.5, height: 46 }, HEAD_RADIUS: 5, EDGE_TILE_INSET: 1 },
  BLINK_HZ: 3,
  RAIL: { GAUGE_TILES: 0.5, RAIL_WIDTH: 3, RAIL_HEIGHT: 4, SLEEPER: { width: 8, gap: 18, depth: 34, height: 4 } },
};

// --- Collectible coins ----------------------------------------------------
export const COIN_CONFIG = {
  SPAWN_CHANCE_PER_SCENERY_ROW: 0.5,
  RADIUS: 10,
  THICKNESS: 3.5,
  Z: 15, // floats above the grass so it reads as a pickup, not scenery
  SPIN_SPEED: 2.6, // rad/s
};

// --- Idle-death eagle: linger too long and it snatches you ------------------
export const EAGLE_CONFIG = {
  GRACE_S: 8, // seconds of no forward progress before it launches
  SWOOP_S: 0.85, // dive duration
  START_ABOVE: 260, // world units above/ahead of the target it starts from
  BODY: { width: 16, depth: 22, height: 12 },
  WING: { width: 4, depth: 26, height: 16 },
  FLAP_HZ: 6,
};

export const FOREST_CONFIG = {
  TREES_PER_ROW: 4,
  CROWN_HEIGHTS: [20, 45, 60],
  CROWN_WIDTH: 30,
  CROWN_DEPTH: 30,
  TRUNK_SIZE: { width: 15, depth: 15, height: 20 },
  TRUNK_Z: 10,
};

export const BUILDING_CONFIG = {
  FOOTPRINT: { width: 37, depth: 34 },
  HEIGHTS: [52, 78, 104, 138],
  FLOOR_HEIGHT: 18, // window band pitch
  WINDOW_BAND: 9, // dark glass strip height within each floor
};

export const SCENERY_CONFIG = {
  PROPS_PER_ROW: 4,
  // Walkable grass tufts scattered on top of scenery rows to break up the
  // flat ground — never block movement (see gameplay/movementRules.js).
  DECOR_PER_ROW: 3,
};

export const ANIMATION_CONFIG = {
  SWAY_AMPLITUDE: 0.05, // radians
  SWAY_SPEED: 1.4, // radians/sec
};

// --- Claymation redesign, Phase 0 foundations ---------------------------------
// These blocks feed src/render/* helpers. They are consumed by the mesh
// factories starting in Phase 1; nothing reads BEVEL/MATERIAL_CONFIG yet, so
// the game looks identical until those factories migrate.

export const BEVEL = {
  // Corner radius as a fraction of a box's smallest dimension, then clamped.
  // Plasticine has no live edges — every box gets rounded via
  // render/geometry.js roundedBox().
  RADIUS_RATIO: 0.18,
  MIN_RADIUS: 1.5,
  MAX_RADIUS: 8,
  SEGMENTS: 2, // rounding segments — 2 is plenty at this camera distance
};

export const MATERIAL_CONFIG = {
  // A touch of sheen so shaped clay catches the key light instead of reading
  // as flat matte cardboard.
  CLAY_ROUGHNESS: 0.78,
  CLAY_METALNESS: 0.0,
  // One shared procedural bump texture (soft value noise) reused by every clay
  // material — reads as fingerprints / tool marks once lit, costs a single
  // GPU upload no matter how many objects use it.
  BUMP: {
    SIZE: 128,
    SCALE: 1.7, // MeshStandardMaterial.bumpScale
    CONTRAST: 0.8, // 0..1 noise strength in the source canvas
    REPEAT: 3,
  },
  // Per-instance "hecho a mano" wobble — kept tiny so silhouettes stay clean.
  JITTER: {
    SCALE: 0.04, // ±4% non-uniform scale
    ROTATION: 0.035, // ±~2° about Z
  },
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
  TUFT: {
    COUNT: 6,
    BLADE: { width: 2.6, height: 16, spread: 5 },
    FLOWER_CHANCE: 0.22,
    FLOWER_COLORS: [0xef6f8e, 0xf2c43d, 0xe98a3c, 0xb98cd6, 0xf0efe6],
  },
  // Low walkable terrain relief — desert dunes / snow drifts. Tinted from the
  // biome ground colour so it melts into the field.
  MOUND: { width: 40, depth: 30, height: 9 },
};

export const CAMERA = {
  ORTHO_SIZE: 300,
  NEAR: 100,
  FAR: 900,
  POSITION: { x: 300, y: -300, z: 300 },
  UP: { x: 0, y: 0, z: 1 },
};

export const WEATHER_CONFIG = {
  FOG_PROBABILITY: 1 / 8, // rolled once per run — not every game has fog
  CLEAR_INTENSITY_MULTIPLIER: 1.1, // slightly brighter/warmer light on a clear run
  CLEAR_WARM_TINT: 0xfff2d9,
  CLEAR_WARM_TINT_STRENGTH: 0.18,
};

export const RENDERER = {
  MAX_PIXEL_RATIO: 2,
  SHADOWS_ENABLED: true, // deliberate: kept on to preserve current look; revisit in a perf pass
  // Claymation redesign turns postprocessing back on: a gentle bloom plus a
  // single custom pass (vignette + film grain + a per-frame exposure flicker)
  // that sells the stop-motion feel. Still guarded — flip to false to ship a
  // plain render if a low-end device can't hold frame rate.
  POSTFX_ENABLED: true,
  BLOOM: {
    strength: 0.28,
    radius: 0.45,
    threshold: 0.8, // high on purpose — only real highlights (headlights, lamps, snow) should glow
  },
  // Custom ClaymationPass (render/postfx/ClaymationPass.js).
  GRADE: {
    VIGNETTE: 0.2, // 0 = none, 1 = heavy corners
    GRAIN: 0.026, // film-grain strength
    FLICKER: 0.012, // ± exposure wobble per frame — the "shot on twos" tell
    FLICKER_SPEED: 11, // Hz-ish; deliberately not a round number
    SATURATION: 1.22, // >1 boosts colour — pushes clay toward vivid plasticine
    CONTRAST: 1.1, // gentle S-curve around mid-grey
    WARMTH: 0.03, // tiny push toward warm (toy-diorama light)
  },
};

export const LIGHT = {
  POSITION: { x: -100, y: -100, z: 200 },
  UP: { x: 0, y: 0, z: 1 },
  SHADOW_MAP_SIZE: 2048,
  SHADOW_CAMERA: { up: { x: 0, y: 1, z: 0 }, left: -400, right: 400, top: 400, bottom: -400, near: 50, far: 400 },
};

// Three-point rig for the clay look — a shadow-casting key, a soft fill to
// lift the shadow side, and a warm rim/back light that traces a bright edge so
// entities separate from the sky. Built by render/LightingRig.js but NOT wired
// into Game.js until the lighting phase; biomes will override per-key color and
// intensity through a `lightingRig` block added later.
export const LIGHTING_RIG = {
  KEY: { color: 0xfff2e2, intensity: 1.7, position: { x: -100, y: -100, z: 200 } },
  FILL: { color: 0xbcd4e6, intensity: 0.45, position: { x: 120, y: 60, z: 90 } },
  RIM: { color: 0xffd9b0, intensity: 0.7, position: { x: 60, y: 160, z: 40 } },
  // Hemisphere ambient: sky tint from above, a warm bounce from the ground —
  // gives shaped clay a soft vertical gradient instead of flat fill.
  AMBIENT: { color: 0xdfe8ef, intensity: 0.9 },
  GROUND_BOUNCE: 0x6b5a44,
};

// Fake ambient-occlusion blob dropped under an entity — cheaper than a real
// shadow for small props, and gives the "sitting in a diorama" grounding the
// style needs. Consumed by render/contactShadow.js from Phase 1 on.
export const CONTACT_SHADOW = {
  BASE_OPACITY: 0.5,
  Z: 0.2, // just above a road plane (z = 0), avoids z-fighting
  // Grass rows are a solid slab GRASS_FOUNDATION_DEPTH tall; a blob for a prop
  // or the player standing on grass has to clear its top face to be visible.
  Z_ON_GRASS: 3.2,
};

export const COLORS = {
  WHEEL: 0x2b2b2f,
  PLAYER_BODY: 0xf3ede1, // warm off-white, not pure white — reads as pale clay
  PLAYER_CAP: 0xe0619a,
  PLAYER_EYE: 0x1c1c1c,
  TRUCK_CARGO: 0xaebede,
  // Plasticine body palette — muted-but-saturated, 12 hues so a road no longer
  // repeats the same 3 cars. RowGenerator picks one at random per vehicle.
  VEHICLE_BODY: [
    0xc74440, // terracotta red
    0xe08e45, // pumpkin orange
    0xe7c15a, // mustard yellow
    0x8bab54, // olive green
    0x4f9d6c, // clay green
    0x4a90a4, // dusty teal
    0x5878b0, // slate blue
    0x8f6cb0, // muted violet
    0xd98299, // dusty rose
    0x9c6b4a, // cocoa brown
    0xe8ddc7, // cream
    0x6b7078, // stone grey
  ],
  CABIN_WHITE: 0xf1ece2,
  // Props exclusive to a single biome — a fixed palette each, no per-biome tinting needed.
  TREE_TRUNK: 0x6b4230, // warmer, lighter — dark brown went muddy under the clay material
  TREE_CROWN: 0x86a94a,
  PINE_TRUNK: 0x6a5240,
  PINE_CROWN: 0x3d7357,
  SNOWMAN_BODY: 0xf4f7fa,
  SNOWMAN_NOSE: 0xe6822e,
  LAMP_POLE: 0x44474d,
  LAMP_HEAD: 0xffe9b8,
  HYDRANT_BODY: 0xc94b46,
  LANE_LINE: 0xefe7cf,
  // Shared vehicle greebles + new vehicle kinds.
  HEADLIGHT: 0xfff6d1,
  TAILLIGHT: 0xc23230,
  WINDSHIELD: 0x33485a,
  TANKER_TANK: 0xdadfe4,
  SNOWPLOW_BLADE: 0xe87a1c,
  TAXI_BODY: 0xefc03e,
  TAXI_SIGN: 0x24242a,
  // River
  WATER: 0x3f8fa6,
  WATER_FOAM: 0xd7ecef,
  LOG_BARK: 0x6b4a30,
  LOG_RING: 0xa9835c,
  // Railway
  RAIL_METAL: 0x8a8f98,
  SLEEPER: 0x5a4636,
  TRAIN_BODY: 0x9c3b3b,
  TRAIN_STRIPE: 0xf1ece2,
  SIGNAL_POLE: 0x3a3d42,
  SIGNAL_OFF: 0x4a4a4a,
  SIGNAL_ON: 0xff3b30,
  // Eagle
  EAGLE_BODY: 0x5b4636,
  EAGLE_WING: 0x6e5743,
  EAGLE_HEAD: 0xefe7d6,
  EAGLE_BEAK: 0xe8a53a,
  COIN: 0xf2c43d,
  COIN_RIM: 0xd89a2a,
  // City buildings — a few muted renders picked at random per building.
  BUILDING: [0xb9a48a, 0xc7c0b4, 0x9fb0b8, 0xd8b48c, 0xa8a2ad],
  BUILDING_WINDOW: 0x3b4a57,
  BUILDING_ROOF: 0x6f6a63,
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
