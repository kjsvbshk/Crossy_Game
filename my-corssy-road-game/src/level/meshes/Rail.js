import * as THREE from "three";
import { WORLD, COLORS, RAILWAY_CONFIG } from "../../core/Constants";
import { clayMaterial } from "../../render/MaterialLibrary";
import { scaleUV } from "../../render/geometry";
import { getBiomeById } from "../biomes/BiomeDefinitions";
import { SignalLight } from "./SignalLight";

// A railway row: ground bed + two rails + evenly spaced sleepers + a warning
// signal at one edge. Structurally a sibling of Road.js — LevelBuilder adds a
// Train onto it. The signal mesh is returned via userData so TrainController
// can blink it.

const { RAIL } = RAILWAY_CONFIG;
const rowWidth = WORLD.TILES_PER_ROW * WORLD.TILE_SIZE;

// The bed (background ground) bleeds well past the playable strip so a wide
// viewport never shows bare background; the actual track — rails, sleepers,
// signal — stays sized to the playable rowWidth above, untouched.
const bedGeometry = scaleUV(
  new THREE.PlaneGeometry(WORLD.VISUAL_ROW_WIDTH, WORLD.TILE_SIZE),
  WORLD.VISUAL_ROW_WIDTH / WORLD.TILE_SIZE,
);
const bedMaterialByBiome = new Map();
function getBedMaterial(biomeId) {
  let m = bedMaterialByBiome.get(biomeId);
  if (!m) {
    m = clayMaterial({ color: getBiomeById(biomeId).colors.road, roughness: 1.0 });
    bedMaterialByBiome.set(biomeId, m);
  }
  return m;
}

const railGeometry = new THREE.BoxGeometry(rowWidth, RAIL.RAIL_WIDTH, RAIL.RAIL_HEIGHT);
const railMaterial = clayMaterial({ color: COLORS.RAIL_METAL, roughness: 0.5, flatShading: true });

const sleeperGeometry = new THREE.BoxGeometry(RAIL.SLEEPER.width, RAIL.SLEEPER.depth, RAIL.SLEEPER.height);
const sleeperMaterial = clayMaterial({ color: COLORS.SLEEPER });

export function Rail(rowIndex, biomeId) {
  const rail = new THREE.Group();
  rail.position.y = rowIndex * WORLD.TILE_SIZE;

  const bed = new THREE.Mesh(bedGeometry, getBedMaterial(biomeId));
  bed.receiveShadow = true;
  rail.add(bed);

  const gauge = RAIL.GAUGE_TILES * WORLD.TILE_SIZE;
  [-1, 1].forEach((side) => {
    const r = new THREE.Mesh(railGeometry, railMaterial);
    r.position.set(0, side * gauge / 2, RAIL.RAIL_HEIGHT / 2 + 0.1);
    rail.add(r);
  });

  const step = RAIL.SLEEPER.width + RAIL.SLEEPER.gap;
  for (let x = -rowWidth / 2 + step / 2; x < rowWidth / 2; x += step) {
    const sleeper = new THREE.Mesh(sleeperGeometry, sleeperMaterial);
    sleeper.position.set(x, 0, RAIL.SLEEPER.height / 2);
    rail.add(sleeper);
  }

  // Centred on the row, just off the approach edge — visible wherever the
  // player is crossing, not hidden away in a corner.
  const signal = SignalLight();
  signal.position.set(0, RAILWAY_CONFIG.SIGNAL.Y_OFFSET, 0);
  rail.add(signal);
  rail.userData.signal = signal;

  return rail;
}
