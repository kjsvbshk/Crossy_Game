import * as THREE from "three";
import { WORLD, COLORS, VEHICLE_CONFIG } from "../../core/Constants";
import { Wheel } from "./Wheel";

const cfg = VEHICLE_CONFIG.CAR;

const { width: mw, depth: md, height: mh } = cfg.MAIN_SIZE;
const mainGeometry = new THREE.BoxGeometry(mw, md, mh);

const { width: cw, depth: cd, height: ch } = cfg.CABIN_SIZE;
const cabinGeometry = new THREE.BoxGeometry(cw, cd, ch);
const cabinMaterial = new THREE.MeshLambertMaterial({ color: COLORS.CABIN_WHITE, flatShading: true });

// Body color is one of a small fixed palette (COLORS.VEHICLE_BODY) — cache one
// material per color instead of creating a new one for every car.
const bodyMaterialByColor = new Map();
function getBodyMaterial(color) {
  let material = bodyMaterialByColor.get(color);
  if (!material) {
    material = new THREE.MeshLambertMaterial({ color, flatShading: true });
    bodyMaterialByColor.set(color, material);
  }
  return material;
}

export function Car(initialTileIndex, direction, color) {
  const car = new THREE.Group();
  car.position.x = initialTileIndex * WORLD.TILE_SIZE;
  if (!direction) car.rotation.z = Math.PI;

  const main = new THREE.Mesh(mainGeometry, getBodyMaterial(color));
  main.position.z = cfg.MAIN_Z;
  main.castShadow = true;
  main.receiveShadow = true;
  car.add(main);

  const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
  cabin.position.x = cfg.CABIN_POSITION.x;
  cabin.position.z = cfg.CABIN_POSITION.z;
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  car.add(cabin);

  car.add(Wheel(cfg.FRONT_WHEEL_X));
  car.add(Wheel(cfg.BACK_WHEEL_X));

  return car;
}
