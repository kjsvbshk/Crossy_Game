import * as THREE from "three";
import { WORLD, COLORS, VEHICLE_CONFIG } from "../../core/Constants";
import { attachHeadlights, attachTaillights, attachCabin, attachWheels } from "./VehicleDetails";

const cfg = VEHICLE_CONFIG.TRUCK;

const { width: gw, depth: gd, height: gh } = cfg.CARGO_SIZE;
const cargoGeometry = new THREE.BoxGeometry(gw, gd, gh);
const cargoMaterial = new THREE.MeshLambertMaterial({ color: COLORS.TRUCK_CARGO, flatShading: true });

export function Truck(initialTileIndex, direction, color) {
  const truck = new THREE.Group();
  truck.position.x = initialTileIndex * WORLD.TILE_SIZE;
  if (!direction) truck.rotation.z = Math.PI;

  const cargo = new THREE.Mesh(cargoGeometry, cargoMaterial);
  cargo.position.x = cfg.CARGO_POSITION.x;
  cargo.position.z = cfg.CARGO_POSITION.z;
  cargo.castShadow = true;
  cargo.receiveShadow = true;
  truck.add(cargo);

  attachCabin(truck, cfg.CABIN_POSITION, cfg.CABIN_SIZE, color);
  attachHeadlights(truck, cfg.HEADLIGHT_X, cfg.HEADLIGHT_SPREAD_Y, cfg.HEADLIGHT_Z);
  attachTaillights(truck, cfg.TAILLIGHT_X, cfg.TAILLIGHT_SPREAD_Y, cfg.TAILLIGHT_Z);

  attachWheels(truck, [cfg.FRONT_WHEEL_X, cfg.MIDDLE_WHEEL_X, cfg.BACK_WHEEL_X]);

  return truck;
}
