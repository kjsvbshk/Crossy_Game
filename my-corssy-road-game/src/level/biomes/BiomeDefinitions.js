// Cyclic biomes. Every POINTS_PER_BIOME points the theme advances to the next
// biome in a per-run order that runs through all of them once (no repeats
// within a lap); when the lap ends the list is reshuffled at random for the
// next lap. So a long run keeps cycling with variety and never gets "stuck".
//
// Each biome's ground/road/sky colors, lighting rig, and scenery props live
// here; level/meshes/*, level/RowGenerator.js and core/Game.js read from this
// table instead of a single fixed palette/prop list. Fog range is NOT
// per-biome — it's a function of the fixed camera offset, see
// Constants.WEATHER_CONFIG.FOG_NEAR/FOG_FAR.
//
// `colors.sky` is the zenith (top of screen) and `colors.skyHorizon` the pale
// stop near the horizon — render/skyGradient.js paints the two as a vertical
// gradient, and fog matches the horizon stop since that's what it sits in
// front of. `lightingRig` retints the three-point rig (render/LightingRig.js):
// `key` casts shadows and is the sun; `fill` softens the shade side; `rim`
// traces a bright back edge so flat-shaded faces separate from the sky. Any
// sub-key omitted keeps the rig default from Constants.LIGHTING_RIG.

export const BIOME_CYCLE = { POINTS_PER_BIOME: 50 };

export const BIOMES = [
  {
    id: "meadow",
    name: "Pradera",
    colors: {
      ground: 0x8dc152,
      road: 0x3d434a,
      sky: 0x7cc4e0,
      skyHorizon: 0xdff4e8,
    },
    lightingRig: {
      key: { color: 0xfff2e2, intensity: 2.2 },
      fill: { color: 0xbcd4e6, intensity: 0.33 },
      rim: { color: 0xffe4c0, intensity: 0.4 },
      ambient: { color: 0xffffff, intensity: 0.5 },
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
      ground: 0xe3c17c,
      road: 0x6e5c42,
      sky: 0xf0c98a,
      skyHorizon: 0xfff0d2,
    },
    lightingRig: {
      key: { color: 0xffe9cb, intensity: 2.4 },
      fill: { color: 0xe0d2b8, intensity: 0.37 },
      rim: { color: 0xffd9a0, intensity: 0.43 },
      ambient: { color: 0xfff1dd, intensity: 0.51 },
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
      road: 0x6b7682,
      sky: 0xbfe0f2,
      skyHorizon: 0xf2f8fc,
    },
    lightingRig: {
      key: { color: 0xf3f8ff, intensity: 1.84 },
      fill: { color: 0xcfe0f0, intensity: 0.37 },
      rim: { color: 0xdff0ff, intensity: 0.4 },
      ambient: { color: 0xeef4ff, intensity: 0.53 },
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
      ground: 0x7a9b5e,
      road: 0x2e3236,
      sky: 0x9fb8cc,
      skyHorizon: 0xdbe6ea,
    },
    lightingRig: {
      key: { color: 0xf5eff6, intensity: 2.0 },
      fill: { color: 0xc2cede, intensity: 0.33 },
      rim: { color: 0xe8e0ee, intensity: 0.4 },
      ambient: { color: 0xdfe6ec, intensity: 0.51 },
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
      ground: 0x5c8a45,
      road: 0x473c30,
      sky: 0xa8c9a0,
      skyHorizon: 0xe6f0da,
    },
    lightingRig: {
      key: { color: 0xf6f1dc, intensity: 2.07 },
      fill: { color: 0xa9c4a0, intensity: 0.35 },
      rim: { color: 0xe6f0cf, intensity: 0.43 },
      ambient: { color: 0xe4ecdf, intensity: 0.5 },
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
    if (_schedule.length > 0 && lap[0] === _schedule[_schedule.length - 1]) {
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
