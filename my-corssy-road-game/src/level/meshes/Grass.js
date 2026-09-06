import * as THREE from "three";
import { WORLD, COLORS } from "../../core/Constants";

// Shared across every grass row — same dimensions and color every time, so
// one geometry/material pair is reused instead of one per row instance.
const geometry = new THREE.BoxGeometry(WORLD.TILES_PER_ROW * WORLD.TILE_SIZE, WORLD.TILE_SIZE, WORLD.GRASS_FOUNDATION_DEPTH);
const material = new THREE.MeshStandardMaterial({ color: COLORS.GRASS });

export function Grass(rowIndex) {
  const grass = new THREE.Group();
  grass.position.y = rowIndex * WORLD.TILE_SIZE;

  const foundation = new THREE.Mesh(geometry, material);
  foundation.position.z = WORLD.GRASS_FOUNDATION_DEPTH / 2;
  foundation.receiveShadow = true;
  grass.add(foundation);

  return grass;
}
