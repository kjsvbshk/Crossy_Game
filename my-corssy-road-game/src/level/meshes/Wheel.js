import * as THREE from "three";
import { COLORS, VEHICLE_CONFIG } from "../../core/Constants";
import { roundedBox } from "../../render/geometry";
import { clayMaterial } from "../../render/MaterialLibrary";

const { width, depth, height } = VEHICLE_CONFIG.WHEEL.SIZE;
const geometry = roundedBox(width, depth, height);
const material = clayMaterial({ color: COLORS.WHEEL });

export function Wheel(x) {
  const wheel = new THREE.Mesh(geometry, material);
  wheel.position.x = x;
  wheel.position.z = VEHICLE_CONFIG.WHEEL.Z;
  return wheel;
}
