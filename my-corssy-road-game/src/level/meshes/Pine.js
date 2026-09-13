import * as THREE from "three";
import { WORLD, COLORS, PROP_CONFIG, CONTACT_SHADOW } from "../../core/Constants";
import { flatMaterial } from "../../render/MaterialLibrary";
import { contactShadow } from "../../render/contactShadow";

const { TRUNK, CROWN_TIERS, CROWN_OVERLAP } = PROP_CONFIG.PINE;
const BASE_RADIUS = CROWN_TIERS[0].radius;

// Cylinder/cone axes are local Y; bake them upright once (Z-up scene).
const trunkGeometry = new THREE.CylinderGeometry(TRUNK.radiusTop, TRUNK.radiusBottom, TRUNK.height, 6);
trunkGeometry.rotateX(Math.PI / 2);
const trunkMaterial = flatMaterial({ color: COLORS.PINE_TRUNK });

const crownGeometries = CROWN_TIERS.map((tier) => {
  const g = new THREE.ConeGeometry(tier.radius, tier.height, 6);
  g.rotateX(Math.PI / 2); // apex points +Z
  return g;
});

function shade(hex, amount) {
  const c = new THREE.Color(hex);
  return amount >= 0 ? c.lerp(new THREE.Color(0xffffff), amount).getHex() : c.multiplyScalar(1 + amount).getHex();
}
// Each tier a touch lighter than the one below — reads as sunlight reaching
// higher up the tree instead of one flat green cone stack.
const crownMaterials = CROWN_TIERS.map((_, i) => {
  const t = CROWN_TIERS.length > 1 ? i / (CROWN_TIERS.length - 1) : 0;
  return flatMaterial({ color: shade(COLORS.PINE_CROWN, -0.15 + t * 0.35) });
});

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
    const tier = new THREE.Mesh(geometry, crownMaterials[i]);
    tier.position.z = z;
    tier.castShadow = true;
    tier.receiveShadow = true;
    pine.add(tier);
    z += tierHeight / 2;
  });

  pine.userData.swayPhase = Math.random() * Math.PI * 2;
  return pine;
}
