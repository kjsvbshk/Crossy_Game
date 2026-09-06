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
} from "./VehicleDetails";

const cfg = VEHICLE_CONFIG.SNOWPLOW;

const { width: gw, depth: gd, height: gh } = cfg.CARGO_SIZE;
const cargoGeometry = roundedBox(gw, gd, gh);
const cargoMaterial = clayMaterial({ color: COLORS.TRUCK_CARGO });

const { width: blw, depth: bld, height: blh } = cfg.BLADE_SIZE;
const bladeGeometry = roundedBox(blw, bld, blh);
const bladeMaterial = clayMaterial({ color: COLORS.SNOWPLOW_BLADE });

export function Snowplow(initialTileIndex, direction, color) {
  const plow = new THREE.Group();
  plow.position.x = initialTileIndex * WORLD.TILE_SIZE;
  if (!direction) plow.rotation.z = Math.PI;

  attachContactShadow(plow, 100, cfg.CARGO_SIZE.depth);
  attachCollider(plow, "snowplow");

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
  attachMirrors(plow, cfg.CABIN_POSITION.x + cfg.CABIN_SIZE.width / 2, cfg.CABIN_SIZE.depth / 2, cfg.CABIN_POSITION.z + 4);

  attachWheels(plow, [cfg.FRONT_WHEEL_X, cfg.MIDDLE_WHEEL_X, cfg.BACK_WHEEL_X]);

  return plow;
}
