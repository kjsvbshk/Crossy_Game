import * as THREE from "three";
import { WORLD, PROP_CONFIG } from "../../core/Constants";
import { clayMaterial } from "../../render/MaterialLibrary";
import { applyHandmadeJitter } from "../../render/geometry";

const { MAIN_RADIUS, SIDE_RADIUS, SIDE_OFFSET_X } = PROP_CONFIG.BUSH;

// One sphere geometry reused at different scales instead of one geometry per size.
const sphereGeometry = new THREE.SphereGeometry(MAIN_RADIUS, 8, 6);
const sideScale = SIDE_RADIUS / MAIN_RADIUS;

function getMaterial(color) {
  return clayMaterial({ color });
}

export function Bush(tileIndex, color) {
  const bush = new THREE.Group();
  bush.position.x = tileIndex * WORLD.TILE_SIZE;

  const material = getMaterial(color);

  const main = new THREE.Mesh(sphereGeometry, material);
  main.position.z = MAIN_RADIUS;
  main.castShadow = true;
  main.receiveShadow = true;
  bush.add(main);

  [-1, 1].forEach((side) => {
    const lobe = new THREE.Mesh(sphereGeometry, material);
    lobe.scale.setScalar(sideScale);
    lobe.position.set(side * SIDE_OFFSET_X, 0, SIDE_RADIUS);
    lobe.castShadow = true;
    lobe.receiveShadow = true;
    bush.add(lobe);
  });

  applyHandmadeJitter(bush);
  bush.userData.swayPhase = Math.random() * Math.PI * 2;
  return bush;
}
