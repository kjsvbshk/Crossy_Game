import * as THREE from "three";
import { metadata as rows } from "./components/Map";
import { minTileIndex, maxTileIndex, tileSize } from "./constants";

const clock = new THREE.Clock();

export function animateVehicles() {
  const delta = clock.getDelta();

  // Animate cars, trucks, and mixed rows
  rows.forEach((rowData) => {
    if (rowData.type === "car" || rowData.type === "truck") {
      const beginningOfRow = (minTileIndex - 2) * tileSize;
      const endOfRow = (maxTileIndex + 2) * tileSize;

      rowData.vehicles.forEach(({ ref }) => {
        if (!ref) throw Error("Vehicle reference is missing");

        if (rowData.direction) {
          ref.position.x =
            ref.position.x > endOfRow
              ? beginningOfRow
              : ref.position.x + rowData.speed * delta;
        } else {
          ref.position.x =
            ref.position.x < beginningOfRow
              ? endOfRow
              : ref.position.x - rowData.speed * delta;
        }
      });
    }
    // Animar filas mixtas
    if (rowData.type === "mixed") {
      const beginningOfRow = (minTileIndex - 2) * tileSize;
      const endOfRow = (maxTileIndex + 2) * tileSize;
      
      // Animar carros
      rowData.cars.forEach((vehicle) => {
        if (!vehicle.ref) throw Error("Vehicle reference is missing");
        if (vehicle.direction) {
          vehicle.ref.position.x =
            vehicle.ref.position.x > endOfRow
              ? beginningOfRow
              : vehicle.ref.position.x + vehicle.speed * delta;
        } else {
          vehicle.ref.position.x =
            vehicle.ref.position.x < beginningOfRow
              ? endOfRow
              : vehicle.ref.position.x - vehicle.speed * delta;
        }
      });
      
      // Animar camiones
      rowData.trucks.forEach((vehicle) => {
        if (!vehicle.ref) throw Error("Vehicle reference is missing");
        if (vehicle.direction) {
          vehicle.ref.position.x =
            vehicle.ref.position.x > endOfRow
              ? beginningOfRow
              : vehicle.ref.position.x + vehicle.speed * delta;
        } else {
          vehicle.ref.position.x =
            vehicle.ref.position.x < beginningOfRow
              ? endOfRow
              : vehicle.ref.position.x - vehicle.speed * delta;
        }
      });
    }
  });
}