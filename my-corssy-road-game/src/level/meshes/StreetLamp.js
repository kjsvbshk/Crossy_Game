import * as THREE from "three";
import { WORLD, COLORS, PROP_CONFIG } from "../../core/Constants";

const { POLE, HEAD_RADIUS } = PROP_CONFIG.STREET_LAMP;

const poleGeometry = new THREE.CylinderGeometry(POLE.radius, POLE.radius, POLE.height, 6);
const poleMaterial = new THREE.MeshLambertMaterial({ color: COLORS.LAMP_POLE, flatShading: true });

const headGeometry = new THREE.SphereGeometry(HEAD_RADIUS, 8, 6);
const headMaterial = new THREE.MeshLambertMaterial({ color: COLORS.LAMP_HEAD, flatShading: true });

export function StreetLamp(tileIndex) {
  const lamp = new THREE.Group();
  lamp.position.x = tileIndex * WORLD.TILE_SIZE;

  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  pole.position.z = POLE.height / 2;
  pole.castShadow = true;
  lamp.add(pole);

  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.z = POLE.height + HEAD_RADIUS * 0.5;
  lamp.add(head);

  return lamp;
}
