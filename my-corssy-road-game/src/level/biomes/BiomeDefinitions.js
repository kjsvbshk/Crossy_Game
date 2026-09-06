// Progressive biomes — the world's theme shifts as the player's score climbs.
// Each biome's ground/road/sky colors, fog range, light tint, and scenery
// props live here; level/meshes/* and level/RowGenerator.js read from this
// table instead of a single fixed palette/prop list.

export const BIOMES = [
  {
    id: "meadow",
    name: "Pradera",
    scoreThreshold: 0,
    colors: {
      ground: 0xbaf455,
      road: 0x454a59,
      sky: 0xbef1ff,
    },
    fog: { near: 300, far: 900 },
    light: { ambient: 0xffffff, directional: 0xffffff },
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
    scoreThreshold: 150,
    colors: {
      ground: 0xe3c16f,
      road: 0x8a7a5c,
      sky: 0xffe3a3,
    },
    fog: { near: 300, far: 900 },
    light: { ambient: 0xfff1d6, directional: 0xffe9c2 },
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
    scoreThreshold: 300,
    colors: {
      ground: 0xf2f6fa,
      road: 0x6b7480,
      sky: 0xe8f0f7,
    },
    fog: { near: 250, far: 850 },
    light: { ambient: 0xeaf4ff, directional: 0xdfefff },
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
    scoreThreshold: 450,
    colors: {
      ground: 0x8fae6b,
      road: 0x3a3d42,
      sky: 0xc9d6e3,
    },
    fog: { near: 280, far: 900 },
    light: { ambient: 0xdfe6ec, directional: 0xe6ecf2 },
    props: [
      { type: "streetlamp" },
      { type: "bush", color: 0x4d6b3a },
      { type: "hydrant" },
    ],
    vehicleKinds: ["car", "bus", "taxi"],
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
