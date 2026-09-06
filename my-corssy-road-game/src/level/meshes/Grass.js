import * as THREE from "three";
import { WORLD } from "../../core/Constants";
import { clayMaterial } from "../../render/MaterialLibrary";
import { getBiomeById } from "../biomes/BiomeDefinitions";

// Same dimensions everywhere — only the color varies (by biome) — so one
// geometry is reused. Plain box (no bevel): the slabs butt against each other
// row-to-row and rounded edges would open visible grooves between them.
const geometry = new THREE.BoxGeometry(WORLD.TILES_PER_ROW * WORLD.TILE_SIZE, WORLD.TILE_SIZE, WORLD.GRASS_FOUNDATION_DEPTH);

// A few slightly different tints of each biome's ground, chosen at random per
// row, so the field reads as hand-laid strips rather than one flat plane.
const SHADES = [1.0, 0.94, 1.06, 0.9];
const materialsByBiome = new Map();
function getMaterials(biomeId) {
  let mats = materialsByBiome.get(biomeId);
  if (!mats) {
    const base = new THREE.Color(getBiomeById(biomeId).colors.ground);
    mats = SHADES.map((f) =>
      clayMaterial({ color: base.clone().multiplyScalar(f).getHex(), roughness: 1.0 }),
    );
    materialsByBiome.set(biomeId, mats);
  }
  return mats;
}

export function Grass(rowIndex, biomeId) {
  const grass = new THREE.Group();
  grass.position.y = rowIndex * WORLD.TILE_SIZE;

  const mats = getMaterials(biomeId);
  const foundation = new THREE.Mesh(geometry, mats[Math.floor(Math.random() * mats.length)]);
  foundation.position.z = WORLD.GRASS_FOUNDATION_DEPTH / 2;
  foundation.receiveShadow = true;
  grass.add(foundation);

  return grass;
}
