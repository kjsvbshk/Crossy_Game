import * as THREE from "three";
import { WORLD, PROP_CONFIG } from "../../core/Constants";

const { TRUNK, ARM, ARM_OFFSET_X, ARM_OFFSET_Z, ARM_TILT } = PROP_CONFIG.CACTUS;

const trunkGeometry = new THREE.CylinderGeometry(TRUNK.radiusTop, TRUNK.radiusBottom, TRUNK.height, 7);
const armGeometry = new THREE.CylinderGeometry(ARM.radiusTop, ARM.radiusBottom, ARM.height, 6);

const materialByColor = new Map();
function getMaterial(color) {
  let material = materialByColor.get(color);
  if (!material) {
    material = new THREE.MeshLambertMaterial({ color, flatShading: true });
    materialByColor.set(color, material);
  }
  return material;
}

export function Cactus(tileIndex, color) {
  const cactus = new THREE.Group();
  cactus.position.x = tileIndex * WORLD.TILE_SIZE;

  const material = getMaterial(color);

  const trunk = new THREE.Mesh(trunkGeometry, material);
  trunk.position.z = TRUNK.height / 2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  cactus.add(trunk);

  [-1, 1].forEach((side) => {
    const arm = new THREE.Mesh(armGeometry, material);
    arm.position.set(side * ARM_OFFSET_X, 0, ARM_OFFSET_Z);
    arm.rotation.z = side * ARM_TILT;
    arm.castShadow = true;
    arm.receiveShadow = true;
    cactus.add(arm);
  });

  return cactus;
}
