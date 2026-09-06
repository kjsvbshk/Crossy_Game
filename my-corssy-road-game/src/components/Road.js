import * as THREE from "three";
import { WORLD, COLORS } from "../core/Constants";

export function Road(rowIndex) {
  const road = new THREE.Group();
  road.position.y = rowIndex * WORLD.TILE_SIZE;

  const foundation = new THREE.Mesh(
    new THREE.PlaneGeometry(WORLD.TILES_PER_ROW * WORLD.TILE_SIZE, WORLD.TILE_SIZE),
    new THREE.MeshLambertMaterial({ color: COLORS.ROAD })
  );
  
  foundation.receiveShadow = true;
  road.add(foundation);

  return road;
}