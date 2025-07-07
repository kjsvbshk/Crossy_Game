import * as THREE from "three";
import { minTileIndex, maxTileIndex } from "../constants";

export function generateRows(amount) {
  const rows = [];
  for (let i = 0; i < amount; i++) {
    // Aleatoriamente decidir si la fila es forest o carretera
    if (Math.random() < 0.33) {
      rows.push(generateForesMetadata());
    } else {
      const vehicleRow = generateMixedVehicleRow();
      console.log(`Fila ${i}: tipo = ${vehicleRow.type}, carros = ${vehicleRow.cars?.length || 0}, camiones = ${vehicleRow.trucks?.length || 0}`);
      rows.push(vehicleRow);
    }
  }
  return rows;
}

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateMixedVehicleRow() {
  // Mezcla de carros y camiones en el mismo carril
  const occupiedTiles = new Set();
  const vehicles = [];
  const minSpace = minTileIndex;
  const maxSpace = maxTileIndex;

  // Decidir dirección única para todo el carril
  const direction = randomElement([true, false]);

  // Decidir cuántos vehículos en total (3 a 5 para garantizar mezcla)
  const numVehicles = THREE.MathUtils.randInt(3, 5);
  let attempts = 0;
  let placed = 0;
  const minSeparation = 2; // bloques de separación mínima entre vehículos

  // Generar posiciones posibles para vehículos
  let possiblePositions = [];
  for (let i = minSpace + 3; i <= maxSpace - 3; i++) {
    possiblePositions.push(i);
  }
  // Barajar posiciones para aleatoriedad
  possiblePositions = possiblePositions.sort(() => Math.random() - 0.5);

  // Garantizar que al menos haya un carro y un camión
  const requiredTypes = ["car", "truck"];
  let placedTypes = new Set();

  while (placed < numVehicles && attempts < 100 && possiblePositions.length > 0) {
    attempts++;
    
    // Decidir el tipo de vehículo
    let isTruck;
    if (placed < 2) {
      // Para los primeros 2 vehículos, garantizar que sean tipos diferentes
      if (placed === 0) {
        isTruck = Math.random() < 0.5;
      } else {
        // El segundo debe ser del tipo opuesto al primero
        isTruck = !placedTypes.has("truck");
      }
    } else {
      // Para vehículos adicionales, aleatorio pero con sesgo hacia el tipo menos común
      const carCount = placedTypes.has("car") ? 1 : 0;
      const truckCount = placedTypes.has("truck") ? 1 : 0;
      if (carCount === 0) {
        isTruck = false; // Forzar carro si no hay ninguno
      } else if (truckCount === 0) {
        isTruck = true; // Forzar camión si no hay ninguno
      } else {
        // Si ya hay ambos tipos, aleatorio
        isTruck = Math.random() < 0.5;
      }
    }

    const length = isTruck ? 5 : 3;
    const halfLen = Math.floor(length / 2);
    const speed = randomElement([125, 156, 188]);
    let initialTileIndex = null;
    
    // Buscar una posición válida
    for (let idx = 0; idx < possiblePositions.length; idx++) {
      const candidate = possiblePositions[idx];
      let valid = true;
      // Verificar que todos los espacios estén libres (vehículo + separación)
      for (let j = -halfLen - minSeparation; j <= halfLen + minSeparation; j++) {
        if (occupiedTiles.has(candidate + j)) {
          valid = false;
          break;
        }
      }
      if (valid) {
        initialTileIndex = candidate;
        // Marcar espacios ocupados (vehículo + separación)
        for (let j = -halfLen - minSeparation; j <= halfLen + minSeparation; j++) {
          occupiedTiles.add(candidate + j);
        }
        // Eliminar posiciones demasiado cercanas para el siguiente vehículo
        possiblePositions = possiblePositions.filter(
          pos => Math.abs(pos - candidate) > halfLen + minSeparation
        );
        break;
      }
    }
    
    if (initialTileIndex === null) continue;
    
    const color = randomElement([0xa52523, 0xbdb638, 0x78b14b]);
    const vehicleType = isTruck ? "truck" : "car";
    
    vehicles.push({
      initialTileIndex,
      color,
      type: vehicleType,
      direction,
      speed,
    });
    
    placedTypes.add(vehicleType);
    placed++;
  }

  // Separar los vehículos por tipo para la lógica de renderizado y animación
  const cars = vehicles.filter(v => v.type === "car").map(({initialTileIndex, color, direction, speed}) => ({initialTileIndex, color, direction, speed}));
  const trucks = vehicles.filter(v => v.type === "truck").map(({initialTileIndex, color, direction, speed}) => ({initialTileIndex, color, direction, speed}));

  console.log(`Vehículos generados: total=${vehicles.length}, carros=${cars.length}, camiones=${trucks.length}`);
  console.log('Vehículos:', vehicles.map(v => ({type: v.type, pos: v.initialTileIndex, speed: v.speed})));

  // Para compatibilidad con el sistema de animación, si solo hay carros o solo camiones, usar el tipo clásico
  if (cars.length > 0 && trucks.length === 0) {
    console.log('Retornando tipo: car');
    return { type: "car", direction: cars[0].direction, speed: cars[0].speed, vehicles: cars };
  }
  if (trucks.length > 0 && cars.length === 0) {
    console.log('Retornando tipo: truck');
    return { type: "truck", direction: trucks[0].direction, speed: trucks[0].speed, vehicles: trucks };
  }
  // Si hay mezcla, usar el tipo mixed
  console.log('Retornando tipo: mixed');
  return {
    type: "mixed",
    cars,
    trucks,
  };
}

function generateForesMetadata() {
  const occupiedTiles = new Set();
  const trees = Array.from({ length: 4 }, () => {
    let tileIndex;
    do {
      tileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
    } while (occupiedTiles.has(tileIndex));
    occupiedTiles.add(tileIndex);
    const height = randomElement([20, 45, 60]);
    return { tileIndex, height };
  });
  return { type: "forest", trees };
}