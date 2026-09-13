import * as THREE from "three";
import { WORLD, COLORS, ROAD_CONFIG, RIVER_CONFIG } from "../../core/Constants";
import { flatMaterial } from "../../render/MaterialLibrary";

// A river row: a lethal water surface with foam strips along both banks. Logs
// (level/meshes/Log.js) are added on top by LevelBuilder, exactly like
// vehicles are added onto a Road. Structurally a sibling of Road.js.

const rowWidth = WORLD.TILES_PER_ROW * WORLD.TILE_SIZE;
// The surface bleeds well past the playable strip so a wide viewport, or a
// log mid-wrap beyond the board edge, never shows bare background past the
// water.
const geometry = new THREE.PlaneGeometry(WORLD.VISUAL_ROW_WIDTH, WORLD.TILE_SIZE);
// Slightly glossier than the matte ground so the key light catches it.
const waterMaterial = flatMaterial({ color: COLORS.WATER, roughness: 0.55 });

const foamGeometry = new THREE.PlaneGeometry(rowWidth, ROAD_CONFIG.LANE_LINE_DEPTH + 1);
const foamMaterial = new THREE.MeshBasicMaterial({ color: COLORS.WATER_FOAM });

/**
 * @param {object} [opts]
 * @param {boolean} [opts.hidePrevEdge]  skip the foam strip toward the
 *   previous row (lower Y) — pass true when that row is also a river, so two
 *   chained river rows read as one continuous current instead of a road-style
 *   divider cutting across the water.
 * @param {boolean} [opts.hideNextEdge]  same, toward the next row (higher Y).
 */
export function Water(rowIndex, { hidePrevEdge = false, hideNextEdge = false } = {}) {
  const river = new THREE.Group();
  river.position.y = rowIndex * WORLD.TILE_SIZE;

  const surface = new THREE.Mesh(geometry, waterMaterial);
  surface.position.z = RIVER_CONFIG.WATER_Z;
  surface.receiveShadow = true;
  river.add(surface);

  const edgeOffset = WORLD.TILE_SIZE / 2 - ROAD_CONFIG.LANE_LINE_INSET;
  if (!hidePrevEdge) {
    const foam = new THREE.Mesh(foamGeometry, foamMaterial);
    foam.position.set(0, -edgeOffset, RIVER_CONFIG.WATER_Z + 0.1);
    river.add(foam);
  }
  if (!hideNextEdge) {
    const foam = new THREE.Mesh(foamGeometry, foamMaterial);
    foam.position.set(0, edgeOffset, RIVER_CONFIG.WATER_Z + 0.1);
    river.add(foam);
  }

  return river;
}
