import * as THREE from "three";
import { WORLD, COLORS, ROAD_CONFIG } from "../../core/Constants";
import { getBiomeById } from "../biomes/BiomeDefinitions";

const geometry = new THREE.PlaneGeometry(WORLD.TILES_PER_ROW * WORLD.TILE_SIZE, WORLD.TILE_SIZE);

const materialByBiome = new Map();
function getMaterial(biomeId) {
  let material = materialByBiome.get(biomeId);
  if (!material) {
    material = new THREE.MeshLambertMaterial({ color: getBiomeById(biomeId).colors.road });
    materialByBiome.set(biomeId, material);
  }
  return material;
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
