import * as THREE from "three";
import { WORLD, COLORS, VEHICLE_CONFIG } from "../../core/Constants";
import { roundedBox } from "../../render/geometry";
import { clayMaterial } from "../../render/MaterialLibrary";
import {
  attachHeadlights,
  attachTaillights,
  attachWheels,
  attachContactShadow,
  attachCollider,
  attachMirrors,
} from "./VehicleDetails";

const cfg = VEHICLE_CONFIG.BUS;

const { width: bw, depth: bd, height: bh } = cfg.BODY_SIZE;
const bodyGeometry = roundedBox(bw, bd, bh);

const { width: ww, depth: wd, height: wh } = cfg.WINDOW_STRIP_SIZE;
const windowStripGeometry = roundedBox(ww, wd, wh);
const windowStripMaterial = clayMaterial({ color: COLORS.WINDSHIELD });

const { width: rw, depth: rd, height: rh } = cfg.ROOF_SIZE;
const roofGeometry = roundedBox(rw, rd, rh);
const roofMaterial = clayMaterial({ color: COLORS.CABIN_WHITE });

function getBodyMaterial(color) {
  return clayMaterial({ color });
}

export function Bus(initialTileIndex, direction, color) {
  const bus = new THREE.Group();
  bus.position.x = initialTileIndex * WORLD.TILE_SIZE;
  if (!direction) bus.rotation.z = Math.PI;

  attachContactShadow(bus, cfg.BODY_SIZE.width, cfg.BODY_SIZE.depth);
  attachCollider(bus, "bus");

  const body = new THREE.Mesh(bodyGeometry, getBodyMaterial(color));
  body.position.z = cfg.BODY_Z;
  body.castShadow = true;
  body.receiveShadow = true;
  bus.add(body);

  const windowStrip = new THREE.Mesh(windowStripGeometry, windowStripMaterial);
  windowStrip.position.z = cfg.WINDOW_STRIP_Z;
  bus.add(windowStrip);

  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.z = cfg.ROOF_Z;
  bus.add(roof);

  attachHeadlights(bus, cfg.HEADLIGHT_X, cfg.HEADLIGHT_SPREAD_Y, cfg.HEADLIGHT_Z);
  attachTaillights(bus, cfg.TAILLIGHT_X, cfg.TAILLIGHT_SPREAD_Y, cfg.TAILLIGHT_Z);
  attachMirrors(bus, cfg.BODY_SIZE.width / 2 - 4, cfg.BODY_SIZE.depth / 2, cfg.BODY_Z + 6);

  attachWheels(bus, [cfg.FRONT_WHEEL_X, cfg.BACK_WHEEL_X]);

  return bus;
}
