import * as THREE from "three";
import { WORLD, COLORS, VEHICLE_CONFIG } from "../../core/Constants";
import { Wheel } from "./Wheel";

const cfg = VEHICLE_CONFIG.TRUCK;

const { width: gw, depth: gd, height: gh } = cfg.CARGO_SIZE;
const cargoGeometry = new THREE.BoxGeometry(gw, gd, gh);
const cargoMaterial = new THREE.MeshLambertMaterial({ color: COLORS.TRUCK_CARGO, flatShading: true });

const { width: cw, depth: cd, height: ch } = cfg.CABIN_SIZE;
const cabinGeometry = new THREE.BoxGeometry(cw, cd, ch);

// Cabin color is one of a small fixed palette (COLORS.VEHICLE_BODY) — cache
// one material per color instead of creating a new one for every truck.
const cabinMaterialByColor = new Map();
function getCabinMaterial(color) {
  let material = cabinMaterialByColor.get(color);
  if (!material) {
    material = new THREE.MeshLambertMaterial({ color, flatShading: true });
    cabinMaterialByColor.set(color, material);
  }
  return material;
}

export function Truck(initialTileIndex, direction, color) {
  const truck = new THREE.Group();
  truck.position.x = initialTileIndex * WORLD.TILE_SIZE;
  if (!direction) truck.rotation.z = Math.PI;

  const cargo = new THREE.Mesh(cargoGeometry, cargoMaterial);
  cargo.position.x = cfg.CARGO_POSITION.x;
  cargo.position.z = cfg.CARGO_POSITION.z;
  cargo.castShadow = true;
  cargo.receiveShadow = true;
  truck.add(cargo);

  const cabin = new THREE.Mesh(cabinGeometry, getCabinMaterial(color));
  cabin.position.x = cfg.CABIN_POSITION.x;
  cabin.position.z = cfg.CABIN_POSITION.z;
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  truck.add(cabin);

  truck.add(Wheel(cfg.FRONT_WHEEL_X));
  truck.add(Wheel(cfg.MIDDLE_WHEEL_X));
  truck.add(Wheel(cfg.BACK_WHEEL_X));

  return truck;
}
