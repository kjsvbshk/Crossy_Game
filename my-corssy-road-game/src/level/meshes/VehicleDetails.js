import * as THREE from "three";
import { COLORS, VEHICLE_CONFIG } from "../../core/Constants";
import { Wheel } from "./Wheel";

// Small greebles shared by every vehicle kind (Car, Truck, Pickup, ...) so a
// vehicle reads as more than a couple of plain stacked boxes.

const { HEADLIGHT, TAILLIGHT, CABIN_WINDOW_BAND_RATIO, CABIN_THREE_TIER_RATIOS } = VEHICLE_CONFIG.DETAILS;

const headlightGeometry = new THREE.BoxGeometry(HEADLIGHT.size.width, HEADLIGHT.size.depth, HEADLIGHT.size.height);
const headlightMaterial = new THREE.MeshLambertMaterial({ color: COLORS.HEADLIGHT });

const taillightGeometry = new THREE.BoxGeometry(TAILLIGHT.size.width, TAILLIGHT.size.depth, TAILLIGHT.size.height);
const taillightMaterial = new THREE.MeshLambertMaterial({ color: COLORS.TAILLIGHT });

const windowMaterial = new THREE.MeshLambertMaterial({ color: COLORS.WINDSHIELD, flatShading: true });
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

const cabinTierGeometryCache = new Map();
function getCabinTierGeometry(width, depth, height) {
  const key = `${width}x${depth}x${height}`;
  let geometry = cabinTierGeometryCache.get(key);
  if (!geometry) {
    geometry = new THREE.BoxGeometry(width, depth, height);
    cabinTierGeometryCache.set(key, geometry);
  }
  return geometry;
}

/** Adds a symmetric pair of headlights at `x`, spread `spreadY` apart, at height `z`. */
export function attachHeadlights(group, x, spreadY, z) {
  [-1, 1].forEach((side) => {
    const light = new THREE.Mesh(headlightGeometry, headlightMaterial);
    light.position.set(x, side * spreadY, z);
    group.add(light);
  });
}

/** Adds a symmetric pair of taillights at `x`, spread `spreadY` apart, at height `z`. */
export function attachTaillights(group, x, spreadY, z) {
  [-1, 1].forEach((side) => {
    const light = new THREE.Mesh(taillightGeometry, taillightMaterial);
    light.position.set(x, side * spreadY, z);
    group.add(light);
  });
}

/**
 * Adds a wheel at each X position and records them on `group.userData.wheels`
 * so VehicleController can spin them as the vehicle moves.
 */
export function attachWheels(group, xPositions) {
  group.userData.wheels = xPositions.map((x) => {
    const wheel = Wheel(x);
    group.add(wheel);
    return wheel;
  });
}

function addCabinTier(group, geometry, material, x, centerZ) {
  const tier = new THREE.Mesh(geometry, material);
  tier.position.set(x, 0, centerZ);
  tier.castShadow = true;
  tier.receiveShadow = true;
  group.add(tier);
}

/**
 * Builds a cabin as stacked, contiguous tiers instead of one flat,
 * uniform-color box: a dark window band that wraps the whole footprint
 * (front, back, and sides all read as glass) topped with a lighter roof
 * cap — and, when `bodyColor` is given, a colored body band underneath the
 * windows too. This is what makes a cabin read as a real vehicle greenhouse
 * instead of a painted block. Tiers only ever touch at one shared boundary
 * (never overlap or share an outward-facing plane), so there's no
 * z-fighting risk the way a separately embedded windshield slab had.
 *
 * Pass `bodyColor` for a cabin that stands on its own (Truck, Tanker,
 * Snowplow) — omit it for a cabin that already sits on top of an
 * already-colored main body (Car, Pickup), where a two-tier cabin is enough.
 */
export function attachCabin(group, position, size, bodyColor) {
  const bottomZ = position.z - size.height / 2;

  if (!bodyColor) {
    const windowHeight = size.height * CABIN_WINDOW_BAND_RATIO;
    const roofHeight = size.height - windowHeight;
    addCabinTier(group, getCabinTierGeometry(size.width, size.depth, windowHeight), windowMaterial, position.x, bottomZ + windowHeight / 2);
    addCabinTier(group, getCabinTierGeometry(size.width, size.depth, roofHeight), roofMaterial, position.x, bottomZ + windowHeight + roofHeight / 2);
    return;
  }

  const bodyHeight = size.height * CABIN_THREE_TIER_RATIOS.body;
  const windowHeight = size.height * CABIN_THREE_TIER_RATIOS.window;
  const roofHeight = size.height - bodyHeight - windowHeight;

  addCabinTier(group, getCabinTierGeometry(size.width, size.depth, bodyHeight), getBodyMaterial(bodyColor), position.x, bottomZ + bodyHeight / 2);
  addCabinTier(group, getCabinTierGeometry(size.width, size.depth, windowHeight), windowMaterial, position.x, bottomZ + bodyHeight + windowHeight / 2);
  addCabinTier(group, getCabinTierGeometry(size.width, size.depth, roofHeight), roofMaterial, position.x, bottomZ + bodyHeight + windowHeight + roofHeight / 2);
}
