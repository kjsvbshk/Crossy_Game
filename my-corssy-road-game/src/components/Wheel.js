import * as THREE from "three";
import { COLORS, VEHICLE_CONFIG } from "../core/Constants";

export function Wheel(x) {
  const { width, depth, height } = VEHICLE_CONFIG.WHEEL.SIZE;
  const wheel = new THREE.Mesh(
    new THREE.BoxGeometry(width, depth, height),
    new THREE.MeshLambertMaterial({
      color: COLORS.WHEEL,
      flatShading: true,
    })
  );
  wheel.position.x = x;
  wheel.position.z = VEHICLE_CONFIG.WHEEL.Z;
  return wheel;
}