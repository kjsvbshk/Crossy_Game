import * as THREE from "three";
import { WORLD, COLORS, VEHICLE_CONFIG } from "../core/Constants";
import { Wheel } from "./Wheel";

export function Truck(initialTileIndex, direction, color) {
  const truck = new THREE.Group();
  truck.position.x = initialTileIndex * WORLD.TILE_SIZE;
  if (!direction) truck.rotation.z = Math.PI;

  const cfg = VEHICLE_CONFIG.TRUCK;
  const { width: gw, depth: gd, height: gh } = cfg.CARGO_SIZE;
  const cargo = new THREE.Mesh(
    new THREE.BoxGeometry(gw, gd, gh),
    new THREE.MeshLambertMaterial({
      color: COLORS.TRUCK_CARGO,
      flatShading: true,
    })
  );
  cargo.position.x = cfg.CARGO_POSITION.x;
  cargo.position.z = cfg.CARGO_POSITION.z;
  cargo.castShadow = true;
  cargo.receiveShadow = true;
  truck.add(cargo);

  const { width: cw, depth: cd, height: ch } = cfg.CABIN_SIZE;
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(cw, cd, ch),
    new THREE.MeshLambertMaterial({ color, flatShading: true })
  );
  cabin.position.x = cfg.CABIN_POSITION.x;
  cabin.position.z = cfg.CABIN_POSITION.z;
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  truck.add(cabin);

  const frontWheel = Wheel(cfg.FRONT_WHEEL_X);
  truck.add(frontWheel);

  const middleWheel = Wheel(cfg.MIDDLE_WHEEL_X);
  truck.add(middleWheel);

  const backWheel = Wheel(cfg.BACK_WHEEL_X);
  truck.add(backWheel);

  return truck;
}