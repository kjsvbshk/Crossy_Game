import * as THREE from "three";
import { WORLD, COLORS, ROAD_CONFIG, RIVER_CONFIG } from "../../core/Constants";
import { clayMaterial } from "../../render/MaterialLibrary";

// A river row: a lethal water surface with foam strips along both banks. Logs
// (level/meshes/Log.js) are added on top by LevelBuilder, exactly like
// vehicles are added onto a Road. Structurally a sibling of Road.js.

const rowWidth = WORLD.TILES_PER_ROW * WORLD.TILE_SIZE;
const geometry = new THREE.PlaneGeometry(rowWidth, WORLD.TILE_SIZE);
// Slightly glossier than the matte ground so the key light catches it.
const waterMaterial = clayMaterial({ color: COLORS.WATER, roughness: 0.55 });

const foamGeometry = new THREE.PlaneGeometry(rowWidth, ROAD_CONFIG.LANE_LINE_DEPTH + 1);
const foamMaterial = new THREE.MeshBasicMaterial({ color: COLORS.WATER_FOAM });

export function Water(rowIndex) {
  const river = new THREE.Group();
  river.position.y = rowIndex * WORLD.TILE_SIZE;

  const surface = new THREE.Mesh(geometry, waterMaterial);
  surface.position.z = RIVER_CONFIG.WATER_Z;
  surface.receiveShadow = true;
  river.add(surface);

  const edgeOffset = WORLD.TILE_SIZE / 2 - ROAD_CONFIG.LANE_LINE_INSET;
  [-1, 1].forEach((side) => {
    const foam = new THREE.Mesh(foamGeometry, foamMaterial);
    foam.position.set(0, side * edgeOffset, RIVER_CONFIG.WATER_Z + 0.1);
    river.add(foam);
  });

  return river;
}
