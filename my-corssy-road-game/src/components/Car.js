import * as THREE from "three";
import { WORLD, COLORS, VEHICLE_CONFIG } from "../core/Constants";
import { Wheel } from "./Wheel";

export function Car(initialTileIndex, direction, color) {
  const car = new THREE.Group();
  car.position.x = initialTileIndex * WORLD.TILE_SIZE;
  if (!direction) car.rotation.z = Math.PI;

  const cfg = VEHICLE_CONFIG.CAR;
  const { width: mw, depth: md, height: mh } = cfg.MAIN_SIZE;
  const main = new THREE.Mesh(
    new THREE.BoxGeometry(mw, md, mh),
    new THREE.MeshLambertMaterial({ color, flatShading: true })
  );
  main.position.z = cfg.MAIN_Z;
  main.castShadow = true;
  main.receiveShadow = true;
  car.add(main);

  const { width: cw, depth: cd, height: ch } = cfg.CABIN_SIZE;
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(cw, cd, ch),
    new THREE.MeshLambertMaterial({
      color: COLORS.CABIN_WHITE,
      flatShading: true,
    })
  );
  cabin.position.x = cfg.CABIN_POSITION.x;
  cabin.position.z = cfg.CABIN_POSITION.z;
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  car.add(cabin);

  const frontWheel = Wheel(cfg.FRONT_WHEEL_X);
  car.add(frontWheel);

  const backWheel = Wheel(cfg.BACK_WHEEL_X);
  car.add(backWheel);

  return car;
}