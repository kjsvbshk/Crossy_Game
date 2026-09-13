import * as THREE from "three";
import { WORLD, COLORS, VEHICLE_CONFIG } from "../../core/Constants";
import { flatMaterial } from "../../render/MaterialLibrary";
import {
  attachHeadlights,
  attachTaillights,
  attachCabin,
  attachWheels,
  attachContactShadow,
  attachCollider,
  attachMirrors,
} from "./VehicleDetails";

const cfg = VEHICLE_CONFIG.TANKER;
const { WIDTH: bandWidth, RADIUS_RATIO: bandRadiusRatio, INSET: bandInset } = VEHICLE_CONFIG.TANK_BAND;

const tankGeometry = new THREE.CylinderGeometry(cfg.TANK_RADIUS, cfg.TANK_RADIUS, cfg.TANK_LENGTH, 8);
const tankMaterial = flatMaterial({ color: COLORS.TANKER_TANK });

// Two metal cinch bands near the tank's ends — break up what would otherwise
// be one flat-colored barrel.
const bandGeometry = new THREE.CylinderGeometry(cfg.TANK_RADIUS * bandRadiusRatio, cfg.TANK_RADIUS * bandRadiusRatio, bandWidth, 8);
const bandMaterial = flatMaterial({ color: COLORS.RAIL_METAL });

export function Tanker(initialTileIndex, direction, color) {
  const tanker = new THREE.Group();
  tanker.position.x = initialTileIndex * WORLD.TILE_SIZE;
  if (!direction) tanker.rotation.z = Math.PI;

  attachContactShadow(tanker, 100, cfg.TANK_RADIUS * 2);
  attachCollider(tanker, "tanker");

  const tank = new THREE.Mesh(tankGeometry, tankMaterial);
  tank.rotation.z = Math.PI / 2; // lay the cylinder on its side, along the direction of travel
  tank.position.x = cfg.TANK_POSITION.x;
  tank.position.z = cfg.TANK_POSITION.z;
  tank.castShadow = true;
  tank.receiveShadow = true;
  tanker.add(tank);

  const halfLen = cfg.TANK_LENGTH / 2 - bandInset;
  [-1, 1].forEach((side) => {
    const band = new THREE.Mesh(bandGeometry, bandMaterial);
    band.rotation.z = Math.PI / 2;
    band.position.set(cfg.TANK_POSITION.x + side * halfLen, 0, cfg.TANK_POSITION.z);
    tanker.add(band);
  });

  attachCabin(tanker, cfg.CABIN_POSITION, cfg.CABIN_SIZE, color);
  attachHeadlights(tanker, cfg.HEADLIGHT_X, cfg.HEADLIGHT_SPREAD_Y, cfg.HEADLIGHT_Z);
  attachTaillights(tanker, cfg.TAILLIGHT_X, cfg.TAILLIGHT_SPREAD_Y, cfg.TAILLIGHT_Z);
  attachMirrors(tanker, cfg.CABIN_POSITION.x + cfg.CABIN_SIZE.width / 2, cfg.CABIN_SIZE.depth / 2, cfg.CABIN_POSITION.z + 4);

  attachWheels(tanker, [cfg.FRONT_WHEEL_X, cfg.MIDDLE_WHEEL_X, cfg.BACK_WHEEL_X]);

  return tanker;
}
