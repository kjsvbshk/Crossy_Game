import * as THREE from "three";
import { WORLD, VEHICLE_CONFIG } from "../../core/Constants";
import { attachHeadlights, attachTaillights, attachCabin, attachWheels } from "./VehicleDetails";

const cfg = VEHICLE_CONFIG.PICKUP;

const { width: mw, depth: md, height: mh } = cfg.MAIN_SIZE;
const mainGeometry = new THREE.BoxGeometry(mw, md, mh);

const { width: bw, depth: bd, height: bh } = cfg.BED_SIZE;
const bedGeometry = new THREE.BoxGeometry(bw, bd, bh);

const bodyMaterialByColor = new Map();
function getBodyMaterial(color) {
  let material = bodyMaterialByColor.get(color);
  if (!material) {
    material = new THREE.MeshLambertMaterial({ color, flatShading: true });
    bodyMaterialByColor.set(color, material);
  }
  return material;
}

export function Pickup(initialTileIndex, direction, color) {
  const pickup = new THREE.Group();
  pickup.position.x = initialTileIndex * WORLD.TILE_SIZE;
  if (!direction) pickup.rotation.z = Math.PI;

  const bodyMaterial = getBodyMaterial(color);

  const main = new THREE.Mesh(mainGeometry, bodyMaterial);
  main.position.z = cfg.MAIN_Z;
  main.castShadow = true;
  main.receiveShadow = true;
  pickup.add(main);

  // Open bed behind the cabin — lower than the cabin, unlike Truck's boxed cargo.
  const bed = new THREE.Mesh(bedGeometry, bodyMaterial);
  bed.position.x = cfg.BED_POSITION.x;
  bed.position.z = cfg.BED_POSITION.z;
  bed.castShadow = true;
  bed.receiveShadow = true;
  pickup.add(bed);

  // No bodyColor here — the cabin sits directly on the already-colored main
  // body, so a two-tier (windows + roof) cabin reads fine on its own.
  attachCabin(pickup, cfg.CABIN_POSITION, cfg.CABIN_SIZE);
  attachHeadlights(pickup, cfg.HEADLIGHT_X, cfg.HEADLIGHT_SPREAD_Y, cfg.MAIN_Z);
  attachTaillights(pickup, cfg.TAILLIGHT_X, cfg.TAILLIGHT_SPREAD_Y, cfg.MAIN_Z);

  attachWheels(pickup, [cfg.FRONT_WHEEL_X, cfg.BACK_WHEEL_X]);

  return pickup;
}
