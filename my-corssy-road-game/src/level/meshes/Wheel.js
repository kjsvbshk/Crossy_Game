import * as THREE from "three";
import { COLORS, VEHICLE_CONFIG } from "../../core/Constants";
import { clayMaterial } from "../../render/MaterialLibrary";

const { depth, height } = VEHICLE_CONFIG.WHEEL.SIZE;
// One cylinder stands in for a whole axle (both wheels + the bar between
// them), spanning the vehicle's lateral width — same simplification the old
// box used. CylinderGeometry's own height axis is already local Y, which is
// exactly the roll axis VehicleController spins this mesh around, so no
// rotateX bake is needed (unlike the upright props). Radius = height/2
// matches WHEEL_RADIUS in VehicleController's spin-speed math.
const geometry = new THREE.CylinderGeometry(height / 2, height / 2, depth, VEHICLE_CONFIG.WHEEL.SEGMENTS);
const material = clayMaterial({ color: COLORS.WHEEL });

export function Wheel(x) {
  const wheel = new THREE.Mesh(geometry, material);
  wheel.position.x = x;
  wheel.position.z = VEHICLE_CONFIG.WHEEL.Z;
  return wheel;
}
