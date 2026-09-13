import * as THREE from "three";
import { COLORS, VEHICLE_CONFIG } from "../../core/Constants";
import { box } from "../../render/geometry";
import { flatMaterial } from "../../render/MaterialLibrary";
import { contactShadow } from "../../render/contactShadow";
import { colliderFromSize } from "../../gameplay/collision";
import { Wheel } from "./Wheel";

// Small greebles shared by every vehicle kind (Car, Truck, Pickup, ...) so a
// vehicle reads as more than a couple of plain stacked boxes.

const { HEADLIGHT, TAILLIGHT, CABIN_WINDOW_BAND_RATIO, CABIN_THREE_TIER_RATIOS } = VEHICLE_CONFIG.DETAILS;

const headlightGeometry = box(HEADLIGHT.size.width, HEADLIGHT.size.depth, HEADLIGHT.size.height);
const headlightMaterial = flatMaterial({ color: COLORS.HEADLIGHT });

const taillightGeometry = box(TAILLIGHT.size.width, TAILLIGHT.size.depth, TAILLIGHT.size.height);
const taillightMaterial = flatMaterial({ color: COLORS.TAILLIGHT });

const windowMaterial = flatMaterial({ color: COLORS.WINDSHIELD });
const roofMaterial = flatMaterial({ color: COLORS.CABIN_WHITE });
const darkTrimMaterial = flatMaterial({ color: COLORS.WHEEL });

const { MIRROR, GRILLE, EXHAUST, COLLIDER, COLLIDER_Z } = VEHICLE_CONFIG;
const mirrorArmGeometry = box(MIRROR.stalk.width, MIRROR.stalk.depth, MIRROR.stalk.height);
const mirrorHeadGeometry = box(MIRROR.size.width, MIRROR.size.depth, MIRROR.size.height);
const exhaustGeometry = new THREE.CylinderGeometry(EXHAUST.radius, EXHAUST.radius, EXHAUST.length, 8);

function getBodyMaterial(color) {
  return flatMaterial({ color });
}

function darken(hex, amount) {
  return new THREE.Color(hex).multiplyScalar(1 - amount).getHex();
}

/**
 * A darker strip along the bottom of a body panel — reads as a rocker/bumper
 * shadow so a single flat-colored box doesn't sit as one uniform slab. Sized
 * a touch wider than the panel it sits under so its side faces don't coincide
 * with the panel's (same trick as Building.js's wider ground floor).
 */
export function attachBodyAccent(group, size, position, color) {
  const { HEIGHT_RATIO, PROTRUDE, DARKEN } = VEHICLE_CONFIG.BODY_ACCENT;
  const stripHeight = size.height * HEIGHT_RATIO;
  const strip = new THREE.Mesh(
    box(size.width + PROTRUDE, size.depth + PROTRUDE, stripHeight),
    flatMaterial({ color: darken(color, DARKEN) }),
  );
  strip.position.set(position.x, 0, position.z - size.height / 2 + stripHeight / 2);
  strip.receiveShadow = true;
  group.add(strip);
}

function getCabinTierGeometry(width, depth, height) {
  return box(width, depth, height);
}

/**
 * Drops a soft fake-AO blob under the vehicle, sized a touch bigger than its
 * footprint so the edge stays soft. Add it last so it renders behind the body.
 */
export function attachContactShadow(group, width, depth) {
  group.add(contactShadow(width / 2 + 4, depth / 2 + 2));
}

/**
 * Freezes the vehicle's hitbox to its pre-detail footprint (VEHICLE_CONFIG
 * .COLLIDER[kind]) so mirrors, exhaust and grille never make it harder to
 * dodge. Read back by PhysicsSystem via gameplay/collision.readCollider().
 */
export function attachCollider(group, kind) {
  const footprint = COLLIDER[kind];
  if (!footprint) return;
  group.userData.collider = colliderFromSize(
    { width: footprint.width, depth: footprint.depth, height: COLLIDER_Z.height },
    { x: 0, y: 0, z: COLLIDER_Z.centerZ },
  );
}

/** A pair of wing mirrors on short stalks, at the cabin's front corners. */
export function attachMirrors(group, x, spreadY, z) {
  [-1, 1].forEach((side) => {
    const arm = new THREE.Mesh(mirrorArmGeometry, darkTrimMaterial);
    arm.position.set(x, side * (spreadY + MIRROR.stalk.width / 2), z);
    const head = new THREE.Mesh(mirrorHeadGeometry, darkTrimMaterial);
    head.position.set(x, side * (spreadY + MIRROR.stalk.width), z);
    group.add(arm, head);
  });
}

/** A dark slab standing just proud of the front face — a radiator grille. */
export function attachGrille(group, x, width, height, z) {
  const grille = new THREE.Mesh(box(GRILLE.depthOut, width, height), darkTrimMaterial);
  grille.position.set(x, 0, z);
  group.add(grille);
}

/** A stubby tailpipe poking out of the rear underside. */
export function attachExhaust(group, x, y, z) {
  const pipe = new THREE.Mesh(exhaustGeometry, darkTrimMaterial);
  pipe.rotation.z = Math.PI / 2; // lie flat, pointing backwards along X
  pipe.position.set(x, y, z);
  group.add(pipe);
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
