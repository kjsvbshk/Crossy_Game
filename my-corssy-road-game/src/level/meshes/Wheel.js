import * as THREE from "three";
import { COLORS, VEHICLE_CONFIG } from "../../core/Constants";

const { width, depth, height } = VEHICLE_CONFIG.WHEEL.SIZE;
const geometry = new THREE.BoxGeometry(width, depth, height);
const material = new THREE.MeshLambertMaterial({ color: COLORS.WHEEL, flatShading: true });

export function Wheel(x) {
  const wheel = new THREE.Mesh(geometry, material);
  wheel.position.x = x;
  wheel.position.z = VEHICLE_CONFIG.WHEEL.Z;
  return wheel;
}
