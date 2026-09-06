import * as THREE from "three";
import { WORLD, VEHICLE_CONFIG } from "../../core/Constants";
import { attachHeadlights, attachTaillights, attachCabin, attachWheels } from "./VehicleDetails";

const cfg = VEHICLE_CONFIG.CAR;

const { width: mw, depth: md, height: mh } = cfg.MAIN_SIZE;
const mainGeometry = new THREE.BoxGeometry(mw, md, mh);

// Body color is one of a small fixed palette (COLORS.VEHICLE_BODY) — cache one
// material per color instead of creating a new one for every car.
const bodyMaterialByColor = new Map();
function getBodyMaterial(color) {
  let material = bodyMaterialByColor.get(color);
  if (!material) {
    material = new THREE.MeshLambertMaterial({ color, flatShading: true });
    bodyMaterialByColor.set(color, material);
  }
  return material;
}

export function Car(initialTileIndex, direction, color) {
  const car = new THREE.Group();
  car.position.x = initialTileIndex * WORLD.TILE_SIZE;
  if (!direction) car.rotation.z = Math.PI;

  const main = new THREE.Mesh(mainGeometry, getBodyMaterial(color));
  main.position.z = cfg.MAIN_Z;
  main.castShadow = true;
  main.receiveShadow = true;
  car.add(main);

  attachCabin(car, cfg.CABIN_POSITION, cfg.CABIN_SIZE);
  attachHeadlights(car, cfg.HEADLIGHT_X, cfg.HEADLIGHT_SPREAD_Y, cfg.MAIN_Z);
  attachTaillights(car, cfg.TAILLIGHT_X, cfg.TAILLIGHT_SPREAD_Y, cfg.MAIN_Z);

  attachWheels(car, [cfg.FRONT_WHEEL_X, cfg.BACK_WHEEL_X]);

  return car;
}
