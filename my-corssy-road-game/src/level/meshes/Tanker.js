import * as THREE from "three";
import { WORLD, COLORS, VEHICLE_CONFIG } from "../../core/Constants";
import { attachHeadlights, attachTaillights, attachCabin, attachWheels } from "./VehicleDetails";

const cfg = VEHICLE_CONFIG.TANKER;

const tankGeometry = new THREE.CylinderGeometry(cfg.TANK_RADIUS, cfg.TANK_RADIUS, cfg.TANK_LENGTH, 12);
const tankMaterial = new THREE.MeshLambertMaterial({ color: COLORS.TANKER_TANK, flatShading: true });

export function Tanker(initialTileIndex, direction, color) {
  const tanker = new THREE.Group();
  tanker.position.x = initialTileIndex * WORLD.TILE_SIZE;
  if (!direction) tanker.rotation.z = Math.PI;

  const tank = new THREE.Mesh(tankGeometry, tankMaterial);
  tank.rotation.z = Math.PI / 2; // lay the cylinder on its side, along the direction of travel
  tank.position.x = cfg.TANK_POSITION.x;
  tank.position.z = cfg.TANK_POSITION.z;
  tank.castShadow = true;
  tank.receiveShadow = true;
  tanker.add(tank);

  attachCabin(tanker, cfg.CABIN_POSITION, cfg.CABIN_SIZE, color);
  attachHeadlights(tanker, cfg.HEADLIGHT_X, cfg.HEADLIGHT_SPREAD_Y, cfg.HEADLIGHT_Z);
  attachTaillights(tanker, cfg.TAILLIGHT_X, cfg.TAILLIGHT_SPREAD_Y, cfg.TAILLIGHT_Z);

  attachWheels(tanker, [cfg.FRONT_WHEEL_X, cfg.MIDDLE_WHEEL_X, cfg.BACK_WHEEL_X]);

  return tanker;
}
