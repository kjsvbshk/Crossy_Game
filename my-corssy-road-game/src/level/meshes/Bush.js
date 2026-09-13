import * as THREE from "three";
import { WORLD, PROP_CONFIG } from "../../core/Constants";
import { flatMaterial } from "../../render/MaterialLibrary";

const { MAIN_RADIUS, SIDE_RADIUS, SIDE_OFFSET_X } = PROP_CONFIG.BUSH;

// One icosahedron geometry reused at different scales instead of one geometry
// per size — faceted, like Rock.js and DeadBush.js.
const blobGeometry = new THREE.IcosahedronGeometry(MAIN_RADIUS, 0);
const sideScale = SIDE_RADIUS / MAIN_RADIUS;

function getMaterial(color) {
  return flatMaterial({ color });
}

export function Bush(tileIndex, color) {
  const bush = new THREE.Group();
  bush.position.x = tileIndex * WORLD.TILE_SIZE;

  const material = getMaterial(color);

  const main = new THREE.Mesh(blobGeometry, material);
  main.position.z = MAIN_RADIUS;
  // Per-instance rotation so the facets don't line up identically on every
  // bush — same trick as Rock.js/DeadBush.js.
  main.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  main.castShadow = true;
  main.receiveShadow = true;
  bush.add(main);

  [-1, 1].forEach((side) => {
    const lobe = new THREE.Mesh(blobGeometry, material);
    lobe.scale.setScalar(sideScale);
    lobe.position.set(side * SIDE_OFFSET_X, 0, SIDE_RADIUS);
    lobe.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    lobe.castShadow = true;
    lobe.receiveShadow = true;
    bush.add(lobe);
  });

  bush.userData.swayPhase = Math.random() * Math.PI * 2;
  return bush;
}
