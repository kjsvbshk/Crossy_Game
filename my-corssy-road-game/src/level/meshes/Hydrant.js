import * as THREE from "three";
import { WORLD, COLORS, PROP_CONFIG, CONTACT_SHADOW } from "../../core/Constants";
import { roundedBox } from "../../render/geometry";
import { clayMaterial } from "../../render/MaterialLibrary";
import { contactShadow } from "../../render/contactShadow";

const { BODY, CAP_RADIUS, NUB, NUB_OFFSET_X, NUB_OFFSET_Z } = PROP_CONFIG.HYDRANT;

// Cylinder axis is local Y. The body barrel is baked upright; the two side
// nubs stay horizontal (baked along X); the cap dome is a sphere.
const bodyGeometry = new THREE.CylinderGeometry(BODY.radiusTop, BODY.radiusBottom, BODY.height, 12);
bodyGeometry.rotateX(Math.PI / 2);
const collarGeometry = new THREE.CylinderGeometry(BODY.radiusBottom + 2, BODY.radiusBottom + 2, 4, 12);
collarGeometry.rotateX(Math.PI / 2);
const capGeometry = new THREE.SphereGeometry(CAP_RADIUS, 12, 8);
const nubGeometry = new THREE.CylinderGeometry(NUB.radius, NUB.radius, NUB.height, 8);
nubGeometry.rotateZ(Math.PI / 2); // stick out along X
const boltGeometry = roundedBox(6, 6, 5);

const material = clayMaterial({ color: COLORS.HYDRANT_BODY });

export function Hydrant(tileIndex) {
  const hydrant = new THREE.Group();
  hydrant.position.x = tileIndex * WORLD.TILE_SIZE;

  hydrant.add(contactShadow(BODY.radiusBottom + 4, BODY.radiusBottom + 4, { z: CONTACT_SHADOW.Z_ON_GRASS }));

  const body = new THREE.Mesh(bodyGeometry, material);
  body.position.z = BODY.height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  hydrant.add(body);

  const collar = new THREE.Mesh(collarGeometry, material);
  collar.position.z = BODY.height * 0.62;
  hydrant.add(collar);

  const cap = new THREE.Mesh(capGeometry, material);
  cap.position.z = BODY.height + CAP_RADIUS * 0.3;
  cap.castShadow = true;
  hydrant.add(cap);

  const bolt = new THREE.Mesh(boltGeometry, material);
  bolt.position.z = BODY.height + CAP_RADIUS;
  hydrant.add(bolt);

  [-1, 1].forEach((side) => {
    const nub = new THREE.Mesh(nubGeometry, material);
    nub.position.set(side * NUB_OFFSET_X, 0, NUB_OFFSET_Z);
    hydrant.add(nub);
  });

  return hydrant;
}
