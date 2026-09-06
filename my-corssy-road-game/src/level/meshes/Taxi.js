import * as THREE from "three";
import { COLORS, VEHICLE_CONFIG } from "../../core/Constants";
import { Car } from "./Car";

const cabinCfg = VEHICLE_CONFIG.CAR;
const signCfg = VEHICLE_CONFIG.TAXI_SIGN;

const { width: sw, depth: sd, height: sh } = signCfg.SIZE;
const signGeometry = new THREE.BoxGeometry(sw, sd, sh);
const signMaterial = new THREE.MeshLambertMaterial({ color: COLORS.TAXI_SIGN, flatShading: true });

/** A Car with a fixed cab color and a roof sign — reuses Car() instead of duplicating its geometry. */
export function Taxi(initialTileIndex, direction) {
  const taxi = Car(initialTileIndex, direction, COLORS.TAXI_BODY);

  const cabinTopZ = cabinCfg.CABIN_POSITION.z + cabinCfg.CABIN_SIZE.height / 2;
  const sign = new THREE.Mesh(signGeometry, signMaterial);
  sign.position.set(cabinCfg.CABIN_POSITION.x, 0, cabinTopZ + signCfg.Z_OFFSET + sh / 2);
  taxi.add(sign);

  return taxi;
}
