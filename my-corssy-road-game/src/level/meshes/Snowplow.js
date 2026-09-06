import * as THREE from "three";
import { WORLD, COLORS, VEHICLE_CONFIG } from "../../core/Constants";
import { attachHeadlights, attachTaillights, attachCabin, attachWheels } from "./VehicleDetails";

const cfg = VEHICLE_CONFIG.SNOWPLOW;

const { width: gw, depth: gd, height: gh } = cfg.CARGO_SIZE;
const cargoGeometry = new THREE.BoxGeometry(gw, gd, gh);
const cargoMaterial = new THREE.MeshLambertMaterial({ color: COLORS.TRUCK_CARGO, flatShading: true });

const { width: blw, depth: bld, height: blh } = cfg.BLADE_SIZE;
const bladeGeometry = new THREE.BoxGeometry(blw, bld, blh);
const bladeMaterial = new THREE.MeshLambertMaterial({ color: COLORS.SNOWPLOW_BLADE, flatShading: true });

export function Snowplow(initialTileIndex, direction, color) {
  const plow = new THREE.Group();
  plow.position.x = initialTileIndex * WORLD.TILE_SIZE;
  if (!direction) plow.rotation.z = Math.PI;

  const cargo = new THREE.Mesh(cargoGeometry, cargoMaterial);
  cargo.position.x = cfg.CARGO_POSITION.x;
  cargo.position.z = cfg.CARGO_POSITION.z;
  cargo.castShadow = true;
  cargo.receiveShadow = true;
  plow.add(cargo);

  // Angled blade at the front — the plow's signature feature.
  const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
  blade.position.x = cfg.BLADE_POSITION.x;
  blade.position.z = cfg.BLADE_POSITION.z;
  blade.rotation.y = cfg.BLADE_TILT;
  blade.castShadow = true;
  blade.receiveShadow = true;
  plow.add(blade);

  attachCabin(plow, cfg.CABIN_POSITION, cfg.CABIN_SIZE, color);
  attachHeadlights(plow, cfg.HEADLIGHT_X, cfg.HEADLIGHT_SPREAD_Y, cfg.HEADLIGHT_Z);
  attachTaillights(plow, cfg.TAILLIGHT_X, cfg.TAILLIGHT_SPREAD_Y, cfg.TAILLIGHT_Z);

  attachWheels(plow, [cfg.FRONT_WHEEL_X, cfg.MIDDLE_WHEEL_X, cfg.BACK_WHEEL_X]);

  return plow;
}
