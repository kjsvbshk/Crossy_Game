import * as THREE from "three";
import { WORLD, COLORS, PROP_CONFIG } from "../../core/Constants";

const { TIER_RADII, NOSE } = PROP_CONFIG.SNOWMAN;

const tierGeometries = TIER_RADII.map((radius) => new THREE.SphereGeometry(radius, 8, 6));
const bodyMaterial = new THREE.MeshLambertMaterial({ color: COLORS.SNOWMAN_BODY, flatShading: true });

const noseGeometry = new THREE.ConeGeometry(NOSE.radius, NOSE.height, 6);
const noseMaterial = new THREE.MeshLambertMaterial({ color: COLORS.SNOWMAN_NOSE, flatShading: true });

export function Snowman(tileIndex) {
  const snowman = new THREE.Group();
  snowman.position.x = tileIndex * WORLD.TILE_SIZE;

  let z = 0;
  let topRadius = 0;
  tierGeometries.forEach((geometry, i) => {
    const radius = TIER_RADII[i];
    z += radius;
    const tier = new THREE.Mesh(geometry, bodyMaterial);
    tier.position.z = z;
    tier.castShadow = true;
    tier.receiveShadow = true;
    snowman.add(tier);
    z += radius * 0.6; // overlap tiers slightly so the stack reads as one figure
    topRadius = radius;
  });

  const nose = new THREE.Mesh(noseGeometry, noseMaterial);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, -topRadius, z - topRadius * 0.6 + topRadius * 0.3);
  snowman.add(nose);

  return snowman;
}
