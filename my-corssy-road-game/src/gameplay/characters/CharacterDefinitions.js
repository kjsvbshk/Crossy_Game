// Data-driven roster of playable characters — same idea as BiomeDefinitions.
// buildCharacter.js assembles a mesh from one of these; the character-select
// screen (Phase 7) reads names + unlock costs from here.
//
// IMPORTANT: every character shares ONE collider (CHARACTER.COLLIDER in
// Constants). Silhouettes, palettes and cosmetic juice vary; the hitbox never
// does, so no skin is easier or harder to play.
//
// Geometry note: all sizes are in world units, axis order (width X, depth Y,
// height Z), Z up. A part's z is derived by the builder from the parts below
// it, so only offsets/overrides live here.

export const CHARACTERS = [
  {
    id: "dough",
    name: "Masa",
    unlockCost: 0,
    palette: { body: 0xf0e2c9, head: 0xf6ecda, belly: 0xfff7ea, eye: 0x211c19, snout: 0xcf9a6f, foot: 0x8a6a4a, ear: 0xe9d8bd, hat: 0xe0619a, accent: 0xcaa77f },
    parts: {
      body: { w: 13, d: 12, h: 11 },
      head: { w: 17, d: 16, h: 15 }, // deliberately bigger than the body — chibi
      snout: { w: 5.5, d: 4.5, h: 4, dropZ: 3.5 },
      eyes: { w: 3.6, d: 3, h: 3.8, offsetX: 4.4, offsetZ: 2, shine: true },
      ears: { kind: "side", w: 4.5, d: 4, h: 5, offsetZ: 3 },
      hat: { w: 9, d: 9, h: 5, brim: 2 },
      feet: { w: 5, d: 6.5, h: 3.5, offsetX: 3.8 },
      tail: { w: 4.5, d: 4.5, h: 4.5, dropZ: 2 },
    },
    juice: { hopHeight: 8, squash: 0.25 },
  },
  {
    id: "fox",
    name: "Zorro",
    unlockCost: 40,
    palette: { body: 0xe0793a, head: 0xe78a4a, belly: 0xf4e9d8, eye: 0x201a17, snout: 0x2f2622, foot: 0x2f2622, accent: 0xf4e9d8 },
    parts: {
      body: { w: 13, d: 13, h: 11 },
      head: { w: 15, d: 14, h: 13 },
      snout: { w: 5, d: 6, h: 4, dropZ: 2 },
      eyes: { w: 3, d: 3, h: 3, offsetX: 4, offsetZ: 2.5 },
      ears: { kind: "up", w: 4, d: 3, h: 6, offsetX: 4.5, tilt: 0.25 },
      feet: { w: 4.5, d: 5.5, h: 3.5, offsetX: 3.6 },
      tail: { w: 6, d: 6, h: 8, dropZ: 1, bushy: true },
    },
    juice: { hopHeight: 9, squash: 0.28 },
  },
  {
    id: "frog",
    name: "Rana",
    unlockCost: 40,
    palette: { body: 0x6cae54, head: 0x77b85d, belly: 0xd8e6a8, eye: 0x1c1c14, snout: 0x6cae54, foot: 0x5c9a47, accent: 0x5c9a47 },
    parts: {
      body: { w: 16, d: 15, h: 8 },
      head: { w: 16, d: 15, h: 9, sinkZ: 2 },
      snout: { kind: "none" },
      eyes: { w: 4.5, d: 4.5, h: 4.5, offsetX: 4.5, offsetZ: 5, bulge: true },
      ears: { kind: "none" },
      feet: { w: 6, d: 7, h: 3, offsetX: 5 },
      tail: null,
    },
    juice: { hopHeight: 11, squash: 0.33 },
  },
  {
    id: "robot",
    name: "Robot",
    unlockCost: 80,
    palette: { body: 0x8b98a3, head: 0x9fb0bb, belly: 0x6f7d88, eye: 0x8ff0e0, snout: 0x6f7d88, foot: 0x5b666f, accent: 0xcfd8dd },
    parts: {
      body: { w: 14, d: 12, h: 12 },
      head: { w: 13, d: 12, h: 12 },
      snout: { w: 6, d: 3, h: 3, dropZ: 3 },
      eyes: { w: 4, d: 2.5, h: 2, offsetX: 3.2, offsetZ: 2 },
      ears: { kind: "antenna", h: 7 },
      feet: { w: 5, d: 5, h: 3.5, offsetX: 4 },
      tail: null,
    },
    juice: { hopHeight: 7, squash: 0.16 },
  },
  {
    id: "cat",
    name: "Gato",
    unlockCost: 80,
    palette: { body: 0x9a9088, head: 0xa89e95, belly: 0xe9e2d8, eye: 0x24321f, snout: 0xd98299, foot: 0x7f766e, accent: 0x7f766e },
    parts: {
      body: { w: 13, d: 13, h: 11 },
      head: { w: 14, d: 13, h: 12 },
      snout: { w: 3.5, d: 3, h: 2.5, dropZ: 2 },
      eyes: { w: 3, d: 3, h: 3.5, offsetX: 3.6, offsetZ: 2 },
      ears: { kind: "up", w: 4, d: 3, h: 5, offsetX: 4, tilt: 0.15 },
      feet: { w: 4.5, d: 5, h: 3.5, offsetX: 3.6 },
      tail: { w: 3.5, d: 3.5, h: 9, dropZ: 3, curl: true },
    },
    juice: { hopHeight: 9, squash: 0.24 },
  },
  {
    id: "duck",
    name: "Pato",
    unlockCost: 120,
    palette: { body: 0xf4efe4, head: 0xf8f4ea, belly: 0xf4efe4, eye: 0x1c1c1c, snout: 0xe8912e, foot: 0xe8912e, accent: 0xe8b94e },
    parts: {
      body: { w: 13, d: 14, h: 11 },
      head: { w: 12, d: 12, h: 11 },
      snout: { w: 7, d: 8, h: 3, dropZ: 2, flat: true },
      eyes: { w: 3, d: 3, h: 3, offsetX: 3.6, offsetZ: 2.5 },
      ears: { kind: "none" },
      feet: { w: 5.5, d: 7, h: 2.5, offsetX: 4 },
      tail: { w: 5, d: 4, h: 4, dropZ: 3, tiltUp: true },
    },
    juice: { hopHeight: 8, squash: 0.26 },
  },
];

const byId = new Map(CHARACTERS.map((c) => [c.id, c]));

export function getCharacter(id) {
  return byId.get(id) ?? CHARACTERS[0];
}

export const DEFAULT_CHARACTER_ID = CHARACTERS[0].id;
