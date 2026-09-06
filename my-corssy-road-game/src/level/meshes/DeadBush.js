import * as THREE from "three";
import { WORLD, PROP_CONFIG } from "../../core/Constants";

const { MAIN_RADIUS, SIDE_RADIUS, SIDE_OFFSET_X } = PROP_CONFIG.DEAD_BUSH;

// Angular icosahedron instead of Bush's smooth spheres — reads as dry/twiggy.
const geometry = new THREE.IcosahedronGeometry(MAIN_RADIUS, 0);
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

export function DeadBush(tileIndex, color) {
  const bush = new THREE.Group();
  bush.position.x = tileIndex * WORLD.TILE_SIZE;

  const material = getMaterial(color);

  const main = new THREE.Mesh(geometry, material);
  main.position.z = MAIN_RADIUS;
  main.rotation.y = Math.random() * Math.PI;
  main.castShadow = true;
  main.receiveShadow = true;
  bush.add(main);

  const side = new THREE.Mesh(geometry, material);
  side.scale.setScalar(sideScale);
  side.position.set(SIDE_OFFSET_X, 0, SIDE_RADIUS);
  side.rotation.y = Math.random() * Math.PI;
  side.castShadow = true;
  side.receiveShadow = true;
  bush.add(side);

  return bush;
}
