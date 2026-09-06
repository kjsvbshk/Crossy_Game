import * as THREE from "three";
import { WORLD, PROP_CONFIG } from "../../core/Constants";

const { MAIN_RADIUS, SIDE_RADIUS, SIDE_OFFSET_X } = PROP_CONFIG.BUSH;

// One sphere geometry reused at different scales instead of one geometry per size.
const sphereGeometry = new THREE.SphereGeometry(MAIN_RADIUS, 6, 4);
const sideScale = SIDE_RADIUS / MAIN_RADIUS;

const materialByColor = new Map();
function getMaterial(color) {
  let material = materialByColor.get(color);
  if (!material) {
    material = new THREE.MeshLambertMaterial({ color, flatShading: true });
    materialByColor.set(color, material);
  }
  return material;
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

  bush.userData.swayPhase = Math.random() * Math.PI * 2;
  return bush;
}
