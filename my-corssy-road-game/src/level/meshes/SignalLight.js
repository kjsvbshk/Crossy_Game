import * as THREE from "three";
import { COLORS, RAILWAY_CONFIG } from "../../core/Constants";
import { clayMaterial } from "../../render/MaterialLibrary";

// Level-crossing signal: a pole with one lamp. TrainController flips the lamp's
// colour (userData.lamp) between SIGNAL_OFF and SIGNAL_ON while a train is
// warned/passing.

const { SIGNAL } = RAILWAY_CONFIG;
// Cylinder axis is local Y; bake the pole upright (Z-up scene).
const poleGeometry = new THREE.CylinderGeometry(SIGNAL.POLE.radius, SIGNAL.POLE.radius, SIGNAL.POLE.height, 8);
poleGeometry.rotateX(Math.PI / 2);
const poleMaterial = clayMaterial({ color: COLORS.SIGNAL_POLE });
const lampGeometry = new THREE.SphereGeometry(SIGNAL.HEAD_RADIUS, 12, 8);

export function SignalLight() {
  const group = new THREE.Group();

  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  pole.position.z = SIGNAL.POLE.height / 2;
  pole.castShadow = true;
  group.add(pole);

  // Own (non-shared) material so blinking one signal doesn't blink them all.
  const lampMat = clayMaterial({ color: COLORS.SIGNAL_OFF }).clone();
  const lamp = new THREE.Mesh(lampGeometry, lampMat);
  lamp.position.z = SIGNAL.POLE.height + 2;
  group.add(lamp);

  group.userData.lamp = lamp;
  return group;
}
