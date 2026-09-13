import * as THREE from "three";
import { COLORS, VEHICLE_CONFIG } from "../../core/Constants";
import { flatMaterial } from "../../render/MaterialLibrary";

const { depth, height } = VEHICLE_CONFIG.WHEEL.SIZE;
// One cylinder stands in for a whole axle (both wheels + the bar between
// them), spanning the vehicle's lateral width — same simplification the old
// box used. CylinderGeometry's own height axis is already local Y, which is
// exactly the roll axis VehicleController spins this mesh around, so no
// rotateX bake is needed (unlike the upright props). Radius = height/2
// matches WHEEL_RADIUS in VehicleController's spin-speed math.
const geometry = new THREE.CylinderGeometry(height / 2, height / 2, depth, VEHICLE_CONFIG.WHEEL.SEGMENTS);
const material = flatMaterial({ color: COLORS.WHEEL });

// A chrome hubcap disc near each end of the shared axle cylinder, at roughly
// where a real left/right wheel would sit — breaks up the plain dark tire.
const { RADIUS_RATIO, DEPTH: hubDepth, INSET } = VEHICLE_CONFIG.HUBCAP;
const hubcapGeometry = new THREE.CylinderGeometry(height * RADIUS_RATIO, height * RADIUS_RATIO, hubDepth, VEHICLE_CONFIG.WHEEL.SEGMENTS);
const hubcapMaterial = flatMaterial({ color: COLORS.RAIL_METAL });

export function Wheel(x) {
  const wheel = new THREE.Group();
  wheel.position.x = x;
  wheel.position.z = VEHICLE_CONFIG.WHEEL.Z;

  const tire = new THREE.Mesh(geometry, material);
  wheel.add(tire);

  const hubOffset = depth / 2 - INSET;
  [-1, 1].forEach((side) => {
    const hub = new THREE.Mesh(hubcapGeometry, hubcapMaterial);
    hub.position.y = side * hubOffset;
    wheel.add(hub);
  });

  return wheel;
}
