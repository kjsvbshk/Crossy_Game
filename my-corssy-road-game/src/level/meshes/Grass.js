import * as THREE from "three";
import { WORLD } from "../../core/Constants";
import { getBiomeById } from "../biomes/BiomeDefinitions";

// Same dimensions everywhere — only the color varies (by biome) — so one
// geometry is reused, with one cached material per biome instead of per row.
const geometry = new THREE.BoxGeometry(WORLD.TILES_PER_ROW * WORLD.TILE_SIZE, WORLD.TILE_SIZE, WORLD.GRASS_FOUNDATION_DEPTH);

const materialByBiome = new Map();
function getMaterial(biomeId) {
  let material = materialByBiome.get(biomeId);
  if (!material) {
    material = new THREE.MeshStandardMaterial({ color: getBiomeById(biomeId).colors.ground });
    materialByBiome.set(biomeId, material);
  }
  return material;
}

export function Grass(rowIndex, biomeId) {
  const grass = new THREE.Group();
  grass.position.y = rowIndex * WORLD.TILE_SIZE;

  const foundation = new THREE.Mesh(geometry, getMaterial(biomeId));
  foundation.position.z = WORLD.GRASS_FOUNDATION_DEPTH / 2;
  foundation.receiveShadow = true;
  grass.add(foundation);

  return grass;
}
