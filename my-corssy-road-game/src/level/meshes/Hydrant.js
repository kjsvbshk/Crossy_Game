import * as THREE from "three";
import { WORLD, COLORS, PROP_CONFIG } from "../../core/Constants";

const { BODY, CAP_RADIUS, NUB, NUB_OFFSET_X, NUB_OFFSET_Z } = PROP_CONFIG.HYDRANT;

const bodyGeometry = new THREE.CylinderGeometry(BODY.radiusTop, BODY.radiusBottom, BODY.height, 8);
const capGeometry = new THREE.SphereGeometry(CAP_RADIUS, 8, 6);
const nubGeometry = new THREE.CylinderGeometry(NUB.radius, NUB.radius, NUB.height, 6);
const material = new THREE.MeshLambertMaterial({ color: COLORS.HYDRANT_BODY, flatShading: true });

export function Hydrant(tileIndex) {
  const hydrant = new THREE.Group();
  hydrant.position.x = tileIndex * WORLD.TILE_SIZE;

  const body = new THREE.Mesh(bodyGeometry, material);
  body.position.z = BODY.height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  hydrant.add(body);

  const cap = new THREE.Mesh(capGeometry, material);
  cap.position.z = BODY.height + CAP_RADIUS * 0.4;
  hydrant.add(cap);

  [-1, 1].forEach((side) => {
    const nub = new THREE.Mesh(nubGeometry, material);
    nub.rotation.z = Math.PI / 2;
    nub.position.set(side * NUB_OFFSET_X, 0, NUB_OFFSET_Z);
    hydrant.add(nub);
  });

  return hydrant;
}
