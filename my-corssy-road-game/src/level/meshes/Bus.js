import * as THREE from "three";
import { WORLD, COLORS, VEHICLE_CONFIG } from "../../core/Constants";
import { attachHeadlights, attachTaillights, attachWheels } from "./VehicleDetails";

const cfg = VEHICLE_CONFIG.BUS;

const { width: bw, depth: bd, height: bh } = cfg.BODY_SIZE;
const bodyGeometry = new THREE.BoxGeometry(bw, bd, bh);

const { width: ww, depth: wd, height: wh } = cfg.WINDOW_STRIP_SIZE;
const windowStripGeometry = new THREE.BoxGeometry(ww, wd, wh);
const windowStripMaterial = new THREE.MeshLambertMaterial({ color: COLORS.WINDSHIELD, flatShading: true });

const { width: rw, depth: rd, height: rh } = cfg.ROOF_SIZE;
const roofGeometry = new THREE.BoxGeometry(rw, rd, rh);
const roofMaterial = new THREE.MeshLambertMaterial({ color: COLORS.CABIN_WHITE, flatShading: true });

const bodyMaterialByColor = new Map();
function getBodyMaterial(color) {
  let material = bodyMaterialByColor.get(color);
  if (!material) {
    material = new THREE.MeshLambertMaterial({ color, flatShading: true });
    bodyMaterialByColor.set(color, material);
  }
  return material;
}

export function Bus(initialTileIndex, direction, color) {
  const bus = new THREE.Group();
  bus.position.x = initialTileIndex * WORLD.TILE_SIZE;
  if (!direction) bus.rotation.z = Math.PI;

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

  attachWheels(bus, [cfg.FRONT_WHEEL_X, cfg.BACK_WHEEL_X]);

  return bus;
}
