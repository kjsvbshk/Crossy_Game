import * as THREE from "three";
import { WORLD, COLORS, COIN_CONFIG } from "../../core/Constants";
import { clayMaterial } from "../../render/MaterialLibrary";

// A walkable pickup: a fat gold disc standing upright, spinning about the
// world Z axis (LevelBuilder tags it userData.spin and turns it in
// updateSway). Collected in Player._stepCompleted when a hop lands on its tile.

const { RADIUS, THICKNESS } = COIN_CONFIG;
// Cylinder axis is local Y; leave it — the disc faces the camera (±Y) at rest
// and the whole group spins about Z, so it sweeps face → edge → face.
const discGeometry = new THREE.CylinderGeometry(RADIUS, RADIUS, THICKNESS, 20);
const rimGeometry = new THREE.CylinderGeometry(RADIUS * 1.12, RADIUS * 1.12, THICKNESS * 0.55, 20);
// A little self-glow so coins read as "grab me" against the ground.
const discMaterial = clayMaterial({ color: COLORS.COIN, roughness: 0.35, emissive: 0x6b4e10, emissiveIntensity: 0.6 });
const rimMaterial = clayMaterial({ color: COLORS.COIN_RIM, roughness: 0.4 });

export function Coin(tileIndex) {
  const coin = new THREE.Group();
  coin.position.set(tileIndex * WORLD.TILE_SIZE, 0, COIN_CONFIG.Z);

  const rim = new THREE.Mesh(rimGeometry, rimMaterial);
  coin.add(rim);

  const disc = new THREE.Mesh(discGeometry, discMaterial);
  disc.castShadow = true;
  coin.add(disc);

  coin.userData.spin = true;
  return coin;
}
