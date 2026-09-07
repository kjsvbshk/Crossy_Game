import * as THREE from "three";
import { WORLD, COLORS, RIVER_CONFIG } from "../../core/Constants";
import { clayMaterial } from "../../render/MaterialLibrary";

// A floating log — the river's moving platform. Lies along X (direction of
// drift). One geometry per discrete length (in tiles), cached like the other
// mesh factories. Lighter end-cap rings hint at cut wood.

const { LOG } = RIVER_CONFIG;
const barkMaterial = clayMaterial({ color: COLORS.LOG_BARK });
const ringMaterial = clayMaterial({ color: COLORS.LOG_RING });

const bodyGeometryByLength = new Map();
function getBodyGeometry(lengthTiles) {
  let geo = bodyGeometryByLength.get(lengthTiles);
  if (!geo) {
    const len = lengthTiles * WORLD.TILE_SIZE * 0.92;
    geo = new THREE.CylinderGeometry(LOG.radius, LOG.radius, len, 14);
    geo.rotateZ(Math.PI / 2); // barrel lies along X
    bodyGeometryByLength.set(lengthTiles, geo);
  }
  return geo;
}
const ringGeometry = new THREE.CylinderGeometry(LOG.radius * 1.03, LOG.radius * 1.03, 2.5, 14);
ringGeometry.rotateZ(Math.PI / 2);

export function Log(initialTileIndex, lengthTiles) {
  const log = new THREE.Group();
  log.position.x = initialTileIndex * WORLD.TILE_SIZE;
  log.position.z = LOG.z;

  const body = new THREE.Mesh(getBodyGeometry(lengthTiles), barkMaterial);
  body.castShadow = true;
  body.receiveShadow = true;
  log.add(body);

  const halfLen = lengthTiles * WORLD.TILE_SIZE * 0.92 / 2;
  [-1, 1].forEach((side) => {
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.x = side * (halfLen - 1.5);
    log.add(ring);
  });

  // Half-length in world units, for RideSystem's "is the player aboard?" test.
  log.userData.halfLength = halfLen;
  return log;
}
