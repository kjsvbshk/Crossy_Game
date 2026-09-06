import * as THREE from "three";
import { WORLD, COLORS, PROP_CONFIG, CONTACT_SHADOW } from "../../core/Constants";
import { clayMaterial } from "../../render/MaterialLibrary";
import { contactShadow } from "../../render/contactShadow";
import { applyHandmadeJitter } from "../../render/geometry";

const { TIER_RADII, NOSE } = PROP_CONFIG.SNOWMAN;

const tierGeometries = TIER_RADII.map((radius) => new THREE.SphereGeometry(radius, 14, 10));
const bodyMaterial = clayMaterial({ color: COLORS.SNOWMAN_BODY });

// Cone apex is local +Y; bake it to point -Y (out of the face, toward camera).
const noseGeometry = new THREE.ConeGeometry(NOSE.radius, NOSE.height, 8);
noseGeometry.rotateX(Math.PI);
const noseMaterial = clayMaterial({ color: COLORS.SNOWMAN_NOSE, roughness: 0.6 });

const coalGeometry = new THREE.SphereGeometry(1.7, 6, 5);
const coalMaterial = clayMaterial({ color: 0x2a2a2a });

const armGeometry = new THREE.CylinderGeometry(1.3, 1, 22, 6);
armGeometry.rotateZ(Math.PI / 2);
const armMaterial = clayMaterial({ color: COLORS.TREE_TRUNK });

export function Snowman(tileIndex) {
  const snowman = new THREE.Group();
  snowman.position.x = tileIndex * WORLD.TILE_SIZE;

  snowman.add(contactShadow(TIER_RADII[0] + 2, TIER_RADII[0] + 2, { z: CONTACT_SHADOW.Z_ON_GRASS }));

  let z = 0;
  let topRadius = 0;
  let midZ = 0;
  tierGeometries.forEach((geometry, i) => {
    const radius = TIER_RADII[i];
    z += radius;
    const tier = new THREE.Mesh(geometry, bodyMaterial);
    tier.position.z = z;
    tier.castShadow = true;
    tier.receiveShadow = true;
    snowman.add(tier);
    if (i === 1) midZ = z;
    z += radius * 0.6; // overlap tiers slightly so the stack reads as one figure
    topRadius = radius;
  });
  const headZ = z - topRadius * 0.6;

  const nose = new THREE.Mesh(noseGeometry, noseMaterial);
  nose.rotation.x = 0.35; // slight droop
  nose.position.set(0, -topRadius, headZ + 1);
  snowman.add(nose);

  [-1, 1].forEach((side) => {
    const eye = new THREE.Mesh(coalGeometry, coalMaterial);
    eye.position.set(side * topRadius * 0.4, -topRadius * 0.86, headZ + topRadius * 0.35);
    snowman.add(eye);
  });

  for (let i = 0; i < 3; i++) {
    const button = new THREE.Mesh(coalGeometry, coalMaterial);
    button.position.set(0, -TIER_RADII[1] * 0.88, midZ + (i - 1) * 6);
    snowman.add(button);
  }

  [-1, 1].forEach((side) => {
    const arm = new THREE.Mesh(armGeometry, armMaterial);
    arm.position.set(side * TIER_RADII[1], 0, midZ + 2);
    arm.rotation.y = side * -0.5;
    snowman.add(arm);
  });

  applyHandmadeJitter(snowman);
  return snowman;
}
