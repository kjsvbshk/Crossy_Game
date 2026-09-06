import * as THREE from "three";
import { WORLD, COLORS, PROP_CONFIG, CONTACT_SHADOW } from "../../core/Constants";
import { clayMaterial } from "../../render/MaterialLibrary";
import { contactShadow } from "../../render/contactShadow";

const { POLE, HEAD_RADIUS } = PROP_CONFIG.STREET_LAMP;

// Cylinder axis is local Y; bake the pole upright. A proper street lamp:
// squat base, tall pole, a short arm reaching out, and a lantern head hanging
// off the end of it.
const baseGeometry = new THREE.CylinderGeometry(POLE.radius * 2.4, POLE.radius * 2.8, 6, 10);
baseGeometry.rotateX(Math.PI / 2);
const poleGeometry = new THREE.CylinderGeometry(POLE.radius, POLE.radius * 1.3, POLE.height, 10);
poleGeometry.rotateX(Math.PI / 2);
const armGeometry = new THREE.CylinderGeometry(POLE.radius * 0.8, POLE.radius * 0.8, 16, 8);
armGeometry.rotateZ(Math.PI / 2); // horizontal reach along X
const headGeometry = new THREE.BoxGeometry(HEAD_RADIUS * 1.6, HEAD_RADIUS * 1.4, HEAD_RADIUS * 1.8);

const metalMaterial = clayMaterial({ color: COLORS.LAMP_POLE });
const headMaterial = clayMaterial({ color: COLORS.LAMP_HEAD, roughness: 0.5 });

export function StreetLamp(tileIndex) {
  const lamp = new THREE.Group();
  lamp.position.x = tileIndex * WORLD.TILE_SIZE;

  lamp.add(contactShadow(HEAD_RADIUS, HEAD_RADIUS, { z: CONTACT_SHADOW.Z_ON_GRASS }));

  const base = new THREE.Mesh(baseGeometry, metalMaterial);
  base.position.z = 3;
  base.castShadow = true;
  lamp.add(base);

  const pole = new THREE.Mesh(poleGeometry, metalMaterial);
  pole.position.z = POLE.height / 2 + 4;
  pole.castShadow = true;
  lamp.add(pole);

  const arm = new THREE.Mesh(armGeometry, metalMaterial);
  arm.position.set(8, 0, POLE.height);
  lamp.add(arm);

  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.set(15, 0, POLE.height - 4);
  head.castShadow = true;
  lamp.add(head);

  return lamp;
}
