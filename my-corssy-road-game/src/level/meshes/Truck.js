import * as THREE from "three";
import { WORLD, COLORS, VEHICLE_CONFIG } from "../../core/Constants";
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
  attachExhaust,
} from "./VehicleDetails";

const cfg = VEHICLE_CONFIG.TRUCK;

const { width: gw, depth: gd, height: gh } = cfg.CARGO_SIZE;
const cargoGeometry = roundedBox(gw, gd, gh);
const cargoMaterial = clayMaterial({ color: COLORS.TRUCK_CARGO });

export function Truck(initialTileIndex, direction, color) {
  const truck = new THREE.Group();
  truck.position.x = initialTileIndex * WORLD.TILE_SIZE;
  if (!direction) truck.rotation.z = Math.PI;

  attachContactShadow(truck, 100, cfg.CARGO_SIZE.depth);
  attachCollider(truck, "truck");

  const cargo = new THREE.Mesh(cargoGeometry, cargoMaterial);
  cargo.position.x = cfg.CARGO_POSITION.x;
  cargo.position.z = cfg.CARGO_POSITION.z;
  cargo.castShadow = true;
  cargo.receiveShadow = true;
  truck.add(cargo);

  attachCabin(truck, cfg.CABIN_POSITION, cfg.CABIN_SIZE, color);
  attachHeadlights(truck, cfg.HEADLIGHT_X, cfg.HEADLIGHT_SPREAD_Y, cfg.HEADLIGHT_Z);
  attachTaillights(truck, cfg.TAILLIGHT_X, cfg.TAILLIGHT_SPREAD_Y, cfg.TAILLIGHT_Z);
  attachMirrors(truck, cfg.CABIN_POSITION.x + cfg.CABIN_SIZE.width / 2, cfg.CABIN_SIZE.depth / 2, cfg.CABIN_POSITION.z + 4);
  attachExhaust(truck, cfg.CARGO_POSITION.x - cfg.CARGO_SIZE.width / 2, -cfg.CARGO_SIZE.depth / 2 + 4, 6);

  attachWheels(truck, [cfg.FRONT_WHEEL_X, cfg.MIDDLE_WHEEL_X, cfg.BACK_WHEEL_X]);

  return truck;
}
