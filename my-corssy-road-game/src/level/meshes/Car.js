import * as THREE from "three";
import { WORLD, VEHICLE_CONFIG } from "../../core/Constants";
import { roundedBox } from "../../render/geometry";
import { clayMaterial } from "../../render/MaterialLibrary";
import {
  attachHeadlights,
  attachTaillights,
  attachCabin,
  attachWheels,
  attachContactShadow,
  attachCollider,
  attachMirrors,
  attachGrille,
} from "./VehicleDetails";

const cfg = VEHICLE_CONFIG.CAR;

const { width: mw, depth: md, height: mh } = cfg.MAIN_SIZE;
const mainGeometry = roundedBox(mw, md, mh);

// Body color is one of a small fixed palette (COLORS.VEHICLE_BODY); clayMaterial
// caches one shared material per color.
function getBodyMaterial(color) {
  return clayMaterial({ color });
}

export function Car(initialTileIndex, direction, color) {
  const car = new THREE.Group();
  car.position.x = initialTileIndex * WORLD.TILE_SIZE;
  if (!direction) car.rotation.z = Math.PI;

  attachContactShadow(car, cfg.MAIN_SIZE.width, cfg.MAIN_SIZE.depth);
  attachCollider(car, "car");

  const main = new THREE.Mesh(mainGeometry, getBodyMaterial(color));
  main.position.z = cfg.MAIN_Z;
  main.castShadow = true;
  main.receiveShadow = true;
  car.add(main);

  attachCabin(car, cfg.CABIN_POSITION, cfg.CABIN_SIZE);
  attachHeadlights(car, cfg.HEADLIGHT_X, cfg.HEADLIGHT_SPREAD_Y, cfg.MAIN_Z);
  attachTaillights(car, cfg.TAILLIGHT_X, cfg.TAILLIGHT_SPREAD_Y, cfg.MAIN_Z);
  attachGrille(car, mw / 2, 22, mh * 0.7, cfg.MAIN_Z);
  attachMirrors(car, cfg.CABIN_POSITION.x + cfg.CABIN_SIZE.width / 2, cfg.CABIN_SIZE.depth / 2, cfg.CABIN_POSITION.z - 2);

  attachWheels(car, [cfg.FRONT_WHEEL_X, cfg.BACK_WHEEL_X]);

  return car;
}
