import * as THREE from "three";
import { COLORS, VEHICLE_CONFIG } from "../../core/Constants";
import { roundedBox } from "../../render/geometry";
import { clayMaterial } from "../../render/MaterialLibrary";
import { Car } from "./Car";

const cabinCfg = VEHICLE_CONFIG.CAR;
const signCfg = VEHICLE_CONFIG.TAXI_SIGN;

const { width: sw, depth: sd, height: sh } = signCfg.SIZE;
const signGeometry = roundedBox(sw, sd, sh);
const signMaterial = clayMaterial({ color: COLORS.TAXI_SIGN });

/** A Car with a fixed cab color and a roof sign — reuses Car() instead of duplicating its geometry. */
export function Taxi(initialTileIndex, direction) {
  const taxi = Car(initialTileIndex, direction, COLORS.TAXI_BODY);

  const cabinTopZ = cabinCfg.CABIN_POSITION.z + cabinCfg.CABIN_SIZE.height / 2;
  const sign = new THREE.Mesh(signGeometry, signMaterial);
  sign.position.set(cabinCfg.CABIN_POSITION.x, 0, cabinTopZ + signCfg.Z_OFFSET + sh / 2);
  taxi.add(sign);

  return taxi;
}
