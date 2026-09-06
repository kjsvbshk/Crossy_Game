// Progressive biomes — the world's theme shifts as the player's score climbs.
// Each biome's ground/road/sky colors, fog range, lighting rig, and scenery
// props live here; level/meshes/*, level/RowGenerator.js and core/Game.js read
// from this table instead of a single fixed palette/prop list.
//
// `lightingRig` retints the three-point rig (render/LightingRig.js): `key`
// casts shadows and is the sun; `fill` softens the shade side; `rim` traces a
// bright back edge so clay separates from the sky. Any sub-key omitted keeps
// the rig default from Constants.LIGHTING_RIG.

export const BIOMES = [
  {
    id: "meadow",
    name: "Pradera",
    scoreThreshold: 0,
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
    scoreThreshold: 10,
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
    scoreThreshold: 20,
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
    scoreThreshold: 30,
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
    scoreThreshold: 40,
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

/** The active biome for a given score/row-index — the highest threshold at or below it. */
export function getBiomeForScore(score) {
  let current = BIOMES[0];
  for (const biome of BIOMES) {
    if (score >= biome.scoreThreshold) current = biome;
  }
  return current;
}

export function getBiomeById(biomeId) {
  return biomesById.get(biomeId) ?? BIOMES[0];
}
