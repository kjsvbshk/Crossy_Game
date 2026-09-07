// Cyclic biomes. Every POINTS_PER_BIOME points the theme advances to the next
// biome in a per-run order that runs through all of them once (no repeats
// within a lap); when the lap ends the list is reshuffled at random for the
// next lap. So a long run keeps cycling with variety and never gets "stuck".
//
// Each biome's ground/road/sky colors, fog range, lighting rig, and scenery
// props live here; level/meshes/*, level/RowGenerator.js and core/Game.js read
// from this table instead of a single fixed palette/prop list.
//
// `lightingRig` retints the three-point rig (render/LightingRig.js): `key`
// casts shadows and is the sun; `fill` softens the shade side; `rim` traces a
// bright back edge so clay separates from the sky. Any sub-key omitted keeps
// the rig default from Constants.LIGHTING_RIG.

export const BIOME_CYCLE = { POINTS_PER_BIOME: 150 };

export const BIOMES = [
  {
    id: "meadow",
    name: "Pradera",
    colors: {
      ground: 0xa7c957,
      road: 0x4a4e57,
      sky: 0xcfe8ef,
    },
    fog: { near: 620, far: 1700 },
    lightingRig: {
      key: { color: 0xfff2e2, intensity: 1.65 },
      fill: { color: 0xbcd4e6, intensity: 0.5 },
      rim: { color: 0xffe4c0, intensity: 0.7 },
      ambient: { color: 0xffffff, intensity: 0.9 },
    },
    decorColor: 0x8fb43f,
    props: [
      { type: "tree" },
      { type: "bush", color: 0x5c8a3a },
      { type: "rock", color: 0x8b8b83 },
    ],
    vehicleKinds: ["car", "truck", "pickup"],
  },
  {
    id: "desert",
    name: "Desierto",
    colors: {
      ground: 0xdcbf87,
      road: 0x8a7a5c,
      sky: 0xf2dcb3,
    },
    fog: { near: 620, far: 1700 },
    lightingRig: {
      key: { color: 0xffe9cb, intensity: 1.8 },
      fill: { color: 0xe0d2b8, intensity: 0.55 },
      rim: { color: 0xffd9a0, intensity: 0.75 },
      ambient: { color: 0xfff1dd, intensity: 0.92 },
    },
    decorColor: 0xb89a5c,
    moundColor: 0xd0b478,
    props: [
      { type: "cactus", color: 0x4c7a3f },
      { type: "rock", color: 0xcbb994 },
      { type: "deadbush", color: 0x9c7b4f },
    ],
    vehicleKinds: ["car", "tanker", "pickup"],
  },
  {
    id: "snow",
    name: "Nieve",
    colors: {
      ground: 0xe6ebef,
      road: 0x707a86,
      sky: 0xe8f0f7,
    },
    fog: { near: 560, far: 1600 },
    lightingRig: {
      key: { color: 0xf3f8ff, intensity: 1.38 },
      fill: { color: 0xcfe0f0, intensity: 0.55 },
      rim: { color: 0xdff0ff, intensity: 0.7 },
      ambient: { color: 0xeef4ff, intensity: 0.95 },
    },
    decorColor: 0xd7e2e8,
    moundColor: 0xf4f8fb,
    props: [
      { type: "pine" },
      { type: "rock", color: 0xe8eef2 },
      { type: "snowman" },
    ],
    vehicleKinds: ["car", "snowplow", "pickup"],
  },
  {
    id: "city",
    name: "Ciudad",
    colors: {
      ground: 0x8ba36a,
      road: 0x3a3d42,
      sky: 0xc9d6e3,
    },
    fog: { near: 600, far: 1650 },
    lightingRig: {
      key: { color: 0xf5eff6, intensity: 1.5 },
      fill: { color: 0xc2cede, intensity: 0.5 },
      rim: { color: 0xe8e0ee, intensity: 0.7 },
      ambient: { color: 0xdfe6ec, intensity: 0.92 },
    },
    decorColor: 0x6f8f4a,
    props: [
      { type: "building" },
      { type: "building" },
      { type: "building" },
      { type: "streetlamp" },
      { type: "hydrant" },
      { type: "bush", color: 0x4d6b3a },
    ],
    vehicleKinds: ["car", "bus", "taxi"],
  },
  {
    id: "forest",
    name: "Bosque",
    colors: {
      ground: 0x5f8f43,
      road: 0x5a4a3a,
      sky: 0xd6e4d2,
    },
    fog: { near: 560, far: 1600 },
    lightingRig: {
      key: { color: 0xf6f1dc, intensity: 1.55 },
      fill: { color: 0xa9c4a0, intensity: 0.52 },
      rim: { color: 0xe6f0cf, intensity: 0.75 },
      ambient: { color: 0xe4ecdf, intensity: 0.9 },
    },
    decorColor: 0x7ea240,
    props: [
      { type: "tree" },
      { type: "pine" },
      { type: "bush", color: 0x3f6a2c },
      { type: "rock", color: 0x77786d },
    ],
    vehicleKinds: ["car", "truck", "pickup"],
  },
];

const biomesById = new Map(BIOMES.map((biome) => [biome.id, biome]));

// Per-run schedule of biome indices, one entry per POINTS_PER_BIOME segment.
// Built from back-to-back random permutations of [0..n-1] so every lap shows
// all biomes once; extended lazily as the score climbs, cleared per run.
let _schedule = [];

function shuffledIndices(n) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function extendSchedule(untilSegment) {
  const n = BIOMES.length;
  while (_schedule.length <= untilSegment) {
    const lap = shuffledIndices(n);
    if (_schedule.length === 0) {
      // First lap always opens in the home biome (index 0).
      const k = lap.indexOf(0);
      [lap[0], lap[k]] = [lap[k], lap[0]];
    } else if (lap[0] === _schedule[_schedule.length - 1]) {
      // Don't let a lap seam repeat the biome the player is just leaving.
      [lap[0], lap[1]] = [lap[1], lap[0]];
    }
    _schedule.push(...lap);
  }
}

/** Clears the per-run biome schedule. Called by LevelBuilder.reset(). */
export function resetBiomeCycle() {
  _schedule = [];
}

/**
 * The active biome for a given score / row-index — segment `floor(score /
 * POINTS_PER_BIOME)` of the per-run schedule. Deterministic within a run
 * (the schedule only ever grows), so a row generated ahead of time always
 * matches the biome shown when the player reaches it.
 */
export function getBiomeForScore(score) {
  const segment = Math.floor(Math.max(0, score) / BIOME_CYCLE.POINTS_PER_BIOME);
  extendSchedule(segment);
  return BIOMES[_schedule[segment]];
}

export function getBiomeById(biomeId) {
  return biomesById.get(biomeId) ?? BIOMES[0];
}
