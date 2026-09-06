import * as THREE from "three";
import { WORLD, COLORS, PROP_CONFIG, CONTACT_SHADOW } from "../../core/Constants";
import { clayMaterial } from "../../render/MaterialLibrary";
import { contactShadow } from "../../render/contactShadow";
import { applyHandmadeJitter } from "../../render/geometry";

const { TRUNK, CROWN_TIERS, CROWN_OVERLAP } = PROP_CONFIG.PINE;
const BASE_RADIUS = CROWN_TIERS[0].radius;

// Cylinder/cone axes are local Y; bake them upright once (Z-up scene).
const trunkGeometry = new THREE.CylinderGeometry(TRUNK.radiusTop, TRUNK.radiusBottom, TRUNK.height, 10);
trunkGeometry.rotateX(Math.PI / 2);
const trunkMaterial = clayMaterial({ color: COLORS.PINE_TRUNK });

const crownGeometries = CROWN_TIERS.map((tier) => {
  const g = new THREE.ConeGeometry(tier.radius, tier.height, 10);
  g.rotateX(Math.PI / 2); // apex points +Z
  return g;
});
const crownMaterial = clayMaterial({ color: COLORS.PINE_CROWN });

export function Pine(tileIndex) {
  const pine = new THREE.Group();
  pine.position.x = tileIndex * WORLD.TILE_SIZE;

  pine.add(contactShadow(BASE_RADIUS * 0.9, BASE_RADIUS * 0.9, { z: CONTACT_SHADOW.Z_ON_GRASS }));

  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.z = TRUNK.height / 2;
  pine.add(trunk);

  let z = TRUNK.height;
  crownGeometries.forEach((geometry, i) => {
    const tierHeight = CROWN_TIERS[i].height;
    z += tierHeight / 2 - (i === 0 ? 0 : CROWN_OVERLAP);
    const tier = new THREE.Mesh(geometry, crownMaterial);
    tier.position.z = z;
    tier.castShadow = true;
    tier.receiveShadow = true;
    pine.add(tier);
    z += tierHeight / 2;
  });

  applyHandmadeJitter(pine);
  pine.userData.swayPhase = Math.random() * Math.PI * 2;
  return pine;
}
