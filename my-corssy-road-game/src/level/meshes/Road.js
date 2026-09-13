import * as THREE from "three";
import { WORLD, COLORS, ROAD_CONFIG } from "../../core/Constants";
import { flatMaterial } from "../../render/MaterialLibrary";
import { getBiomeById } from "../biomes/BiomeDefinitions";

// Bleeds past the playable strip (see WORLD.GROUND_VISUAL_MARGIN_TILES) so a
// wide viewport, or a vehicle mid-wrap beyond the board edge, never shows
// bare background.
const geometry = new THREE.PlaneGeometry(WORLD.VISUAL_ROW_WIDTH, WORLD.TILE_SIZE);

function getMaterial(biomeId) {
  return flatMaterial({ color: getBiomeById(biomeId).colors.road, roughness: 1.0 });
}

// Lane-divider stripes along both edges of the row — without them every road
// row reads as one flat, undifferentiated color block instead of a lane.
const laneLineGeometry = new THREE.PlaneGeometry(WORLD.TILES_PER_ROW * WORLD.TILE_SIZE, ROAD_CONFIG.LANE_LINE_DEPTH);
const laneLineMaterial = new THREE.MeshBasicMaterial({ color: COLORS.LANE_LINE });

export function Road(rowIndex, biomeId) {
  const road = new THREE.Group();
  road.position.y = rowIndex * WORLD.TILE_SIZE;

  const foundation = new THREE.Mesh(geometry, getMaterial(biomeId));
  foundation.receiveShadow = true;
  road.add(foundation);

  const edgeOffset = WORLD.TILE_SIZE / 2 - ROAD_CONFIG.LANE_LINE_INSET;
  [-1, 1].forEach((side) => {
    const line = new THREE.Mesh(laneLineGeometry, laneLineMaterial);
    line.position.set(0, side * edgeOffset, ROAD_CONFIG.LANE_LINE_Z);
    road.add(line);
  });

  return road;
}
