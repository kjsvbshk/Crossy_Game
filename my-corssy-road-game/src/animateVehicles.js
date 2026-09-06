import * as THREE from "three";
import { metadata as rows } from "./components/Map";
import { WORLD } from "./core/Constants";

const clock = new THREE.Clock();

export function animateVehicles() {
  const delta = Math.min(clock.getDelta(), 0.1);
  const { MIN_TILE_INDEX, MAX_TILE_INDEX, TILE_SIZE, VEHICLE_ROW_EDGE_BUFFER_TILES } = WORLD;

  // Animate cars, trucks, and mixed rows
  rows.forEach((rowData) => {
    if (rowData.type === "car" || rowData.type === "truck") {
      const beginningOfRow = (MIN_TILE_INDEX - VEHICLE_ROW_EDGE_BUFFER_TILES) * TILE_SIZE;
      const endOfRow = (MAX_TILE_INDEX + VEHICLE_ROW_EDGE_BUFFER_TILES) * TILE_SIZE;

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
      const beginningOfRow = (MIN_TILE_INDEX - VEHICLE_ROW_EDGE_BUFFER_TILES) * TILE_SIZE;
      const endOfRow = (MAX_TILE_INDEX + VEHICLE_ROW_EDGE_BUFFER_TILES) * TILE_SIZE;

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