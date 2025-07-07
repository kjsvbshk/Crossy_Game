import * as THREE from "three";
import { generateRows } from "../utilities/generateRows";
import { Grass } from "./Grass";
import { Road } from "./Road";
import { Tree } from "./Tree";
import { Car } from "./Car";
import { Truck } from "./Truck";

export const metadata = [];

export const map = new THREE.Group();

export function initializeMap() {
  // Remove all rows
  metadata.length = 0;
  map.remove(...map.children);

  // Add grass rows behind the player (filas negativas)
  for (let rowIndex = -1; rowIndex >= -5; rowIndex--) {
    const grass = Grass(rowIndex);
    map.add(grass);
  }
  
  // Add initial grass row at position 0
  const grass = Grass(0);
  map.add(grass);
  
  // Add new rows ahead
  addRows();
}

export function addRows() {
  const newMetadata = generateRows(20);

  const startIndex = metadata.length;
  metadata.push(...newMetadata);

  newMetadata.forEach((rowData, index) => {
    const rowIndex = startIndex + index + 1;

    if (rowData.type === "forest") {
      const row = Grass(rowIndex);

      rowData.trees.forEach(({ tileIndex, height }) => {
        const three = Tree(tileIndex, height);
        row.add(three);
      });

      map.add(row);
    }

    if (rowData.type === "car") {
      const row = Road(rowIndex);

      rowData.vehicles.forEach((vehicle) => {
        const car = Car(
          vehicle.initialTileIndex,
          rowData.direction,
          vehicle.color
        );
        vehicle.ref = car;
        row.add(car);
      });

      map.add(row);
    }

    if (rowData.type === "truck") {
      const row = Road(rowIndex);

      rowData.vehicles.forEach((vehicle) => {
        const truck = Truck(
          vehicle.initialTileIndex,
          rowData.direction,
          vehicle.color
        );
        vehicle.ref = truck;
        row.add(truck);
      });

      map.add(row);
    }

    // NUEVO: Mezcla de carros y camiones en la misma fila
    if (rowData.type === "mixed") {
      const row = Road(rowIndex);
      // Renderizar carros
      rowData.cars.forEach((vehicle) => {
        const car = Car(
          vehicle.initialTileIndex,
          vehicle.direction,
          vehicle.color
        );
        vehicle.ref = car;
        row.add(car);
      });
      // Renderizar camiones
      rowData.trucks.forEach((vehicle) => {
        const truck = Truck(
          vehicle.initialTileIndex,
          vehicle.direction,
          vehicle.color
        );
        vehicle.ref = truck;
        row.add(truck);
      });
      map.add(row);
    }
  });
}