import * as THREE from "three";
import { WORLD, PROP_CONFIG } from "../../core/Constants";
import { clayMaterial } from "../../render/MaterialLibrary";

const { MAIN_RADIUS, SIDE_RADIUS, SIDE_OFFSET_X } = PROP_CONFIG.DEAD_BUSH;

// A dry tumbleweed-ish clump: one angular blob plus a few crooked twigs
// jabbing out of it. Icosahedron (no axis issue); twig cylinders baked upright
// then splayed per instance.
const blobGeometry = new THREE.IcosahedronGeometry(MAIN_RADIUS, 0);
const sideScale = SIDE_RADIUS / MAIN_RADIUS;
const twigGeometry = new THREE.CylinderGeometry(0.8, 1.4, MAIN_RADIUS * 1.6, 5);
twigGeometry.rotateX(Math.PI / 2);

function getMaterial(color) {
  return clayMaterial({ color, roughness: 1.0, flatShading: true });
}

export function DeadBush(tileIndex, color) {
  const bush = new THREE.Group();
  bush.position.x = tileIndex * WORLD.TILE_SIZE;

  const material = getMaterial(color);

  const main = new THREE.Mesh(blobGeometry, material);
  main.position.z = MAIN_RADIUS * 0.9;
  main.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  main.castShadow = true;
  main.receiveShadow = true;
  bush.add(main);

  const side = new THREE.Mesh(blobGeometry, material);
  side.scale.setScalar(sideScale);
  side.position.set(SIDE_OFFSET_X, 0, SIDE_RADIUS);
  side.rotation.y = Math.random() * Math.PI;
  side.castShadow = true;
  bush.add(side);

  for (let i = 0; i < 4; i++) {
    const twig = new THREE.Mesh(twigGeometry, material);
    const a = Math.random() * Math.PI * 2;
    twig.position.set(Math.cos(a) * 4, Math.sin(a) * 3, MAIN_RADIUS);
    twig.rotation.x = Math.cos(a) * 0.9;
    twig.rotation.y = Math.sin(a) * 0.9;
    bush.add(twig);
  }

  return bush;
}
