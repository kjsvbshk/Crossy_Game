import * as THREE from "three";
import { WORLD, PROP_CONFIG, CONTACT_SHADOW } from "../../core/Constants";
import { clayMaterial } from "../../render/MaterialLibrary";
import { contactShadow } from "../../render/contactShadow";
import { applyHandmadeJitter } from "../../render/geometry";

const { TRUNK, ARM, ARM_OFFSET_X, ARM_OFFSET_Z } = PROP_CONFIG.CACTUS;

// CylinderGeometry's axis is local Y; this scene is Z-up, so every barrel gets
// baked upright once here. A saguaro = one tall trunk + two arms, each an
// L of a short horizontal elbow into a vertical limb, capped with a dome.
const trunkGeometry = new THREE.CylinderGeometry(TRUNK.radiusTop, TRUNK.radiusBottom, TRUNK.height, 12);
trunkGeometry.rotateX(Math.PI / 2);

const limbLen = ARM.height;
const limbGeometry = new THREE.CylinderGeometry(ARM.radiusTop, ARM.radiusBottom, limbLen, 10);
limbGeometry.rotateX(Math.PI / 2);

const elbowGeometry = new THREE.CylinderGeometry(ARM.radiusBottom, ARM.radiusBottom, ARM_OFFSET_X + 4, 10);
elbowGeometry.rotateZ(Math.PI / 2); // this one stays horizontal, along X

const capGeometry = new THREE.SphereGeometry(TRUNK.radiusTop, 10, 8);
const armCapGeometry = new THREE.SphereGeometry(ARM.radiusTop, 8, 6);

function getMaterial(color) {
  return clayMaterial({ color });
}

export function Cactus(tileIndex, color) {
  const cactus = new THREE.Group();
  cactus.position.x = tileIndex * WORLD.TILE_SIZE;

  const material = getMaterial(color);

  cactus.add(contactShadow(ARM_OFFSET_X + ARM.radiusBottom + 2, TRUNK.radiusBottom + 3, { z: CONTACT_SHADOW.Z_ON_GRASS }));

  const trunk = new THREE.Mesh(trunkGeometry, material);
  trunk.position.z = TRUNK.height / 2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  cactus.add(trunk);

  const trunkCap = new THREE.Mesh(capGeometry, material);
  trunkCap.position.z = TRUNK.height;
  cactus.add(trunkCap);

  [-1, 1].forEach((side, idx) => {
    const elbowZ = ARM_OFFSET_Z - idx * 9; // stagger the two arms so it isn't symmetric
    const elbow = new THREE.Mesh(elbowGeometry, material);
    elbow.position.set(side * (ARM_OFFSET_X / 2), 0, elbowZ);
    cactus.add(elbow);

    const limb = new THREE.Mesh(limbGeometry, material);
    limb.position.set(side * ARM_OFFSET_X, 0, elbowZ + limbLen / 2 - 2);
    limb.castShadow = true;
    cactus.add(limb);

    const limbCap = new THREE.Mesh(armCapGeometry, material);
    limbCap.position.set(side * ARM_OFFSET_X, 0, elbowZ + limbLen - 2);
    cactus.add(limbCap);
  });

  applyHandmadeJitter(cactus);
  return cactus;
}
