import * as THREE from "three";
import { WORLD, VEHICLE_CONFIG, SCENERY_CONFIG, FOREST_CONFIG, COLORS } from "../core/Constants";
import { getBiomeForScore, getBiomeById } from "./biomes/BiomeDefinitions";

const { MIN_TILE_INDEX: minTileIndex, MAX_TILE_INDEX: maxTileIndex } = WORLD;

export function generateRows(amount, startRowIndex) {
  const rows = [];
  for (let i = 0; i < amount; i++) {
    const rowIndex = startRowIndex + i;
    // A row's biome is fixed at generation time by its own position — it
    // never changes retroactively once generated.
    const biomeId = getBiomeForScore(rowIndex).id;
    const row = Math.random() < 0.33 ? generateSceneryRow(biomeId) : generateVehicleRow();
    row.biomeId = biomeId;
    rows.push(row);
  }
  return rows;
}

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateVehicleRow() {
  // Mezcla de carros y camiones en el mismo carril
  const occupiedTiles = new Set();
  const vehicles = [];
  const minSpace = minTileIndex;
  const maxSpace = maxTileIndex;
  const { MIN_COUNT_PER_ROW, MAX_COUNT_PER_ROW, MIN_SEPARATION_TILES, EDGE_MARGIN_TILES, PLACEMENT_ATTEMPTS, SPEEDS, CAR_LENGTH_TILES, TRUCK_LENGTH_TILES } = VEHICLE_CONFIG;

  // Dirección y velocidad únicas para todo el carril — si cada vehículo
  // tuviera su propia velocidad, uno más rápido spawneado detrás terminaría
  // alcanzando y atravesando a uno más lento con el tiempo.
  const direction = randomElement([true, false]);
  const speed = randomElement(SPEEDS);

  // Decidir cuántos vehículos en total (para garantizar mezcla)
  const numVehicles = THREE.MathUtils.randInt(MIN_COUNT_PER_ROW, MAX_COUNT_PER_ROW);
  let attempts = 0;
  let placed = 0;
  const minSeparation = MIN_SEPARATION_TILES;

  // Generar posiciones posibles para vehículos
  let possiblePositions = [];
  for (let i = minSpace + EDGE_MARGIN_TILES; i <= maxSpace - EDGE_MARGIN_TILES; i++) {
    possiblePositions.push(i);
  }
  // Barajar posiciones para aleatoriedad
  possiblePositions = possiblePositions.sort(() => Math.random() - 0.5);

  const placedKinds = new Set();

  while (placed < numVehicles && attempts < PLACEMENT_ATTEMPTS && possiblePositions.length > 0) {
    attempts++;

    // Decidir el tipo de vehículo
    let isTruck;
    if (placed < 2) {
      // Para los primeros 2 vehículos, garantizar que sean tipos diferentes
      if (placed === 0) {
        isTruck = Math.random() < 0.5;
      } else {
        // El segundo debe ser del tipo opuesto al primero
        isTruck = !placedKinds.has("truck");
      }
    } else {
      // Para vehículos adicionales, aleatorio pero con sesgo hacia el tipo menos común
      const carCount = placedKinds.has("car") ? 1 : 0;
      const truckCount = placedKinds.has("truck") ? 1 : 0;
      if (carCount === 0) {
        isTruck = false; // Forzar carro si no hay ninguno
      } else if (truckCount === 0) {
        isTruck = true; // Forzar camión si no hay ninguno
      } else {
        // Si ya hay ambos tipos, aleatorio
        isTruck = Math.random() < 0.5;
      }
    }

    const length = isTruck ? TRUCK_LENGTH_TILES : CAR_LENGTH_TILES;
    const halfLen = Math.floor(length / 2);
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
          (pos) => Math.abs(pos - candidate) > halfLen + minSeparation
        );
        break;
      }
    }

    if (initialTileIndex === null) continue;

    const kind = isTruck ? "truck" : "car";
    vehicles.push({
      initialTileIndex,
      color: randomElement(COLORS.VEHICLE_BODY),
      kind,
      speed,
      ref: null,
    });

    placedKinds.add(kind);
    placed++;
  }

  return { type: "vehicles", direction, vehicles };
}

function generateSceneryRow(biomeId) {
  const biome = getBiomeById(biomeId);
  const occupiedTiles = new Set();

  const props = Array.from({ length: SCENERY_CONFIG.PROPS_PER_ROW }, () => {
    let tileIndex;
    do {
      tileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
    } while (occupiedTiles.has(tileIndex));
    occupiedTiles.add(tileIndex);

    const propDef = randomElement(biome.props);
    // "tree" is the only prop type with per-instance height variety today.
    const extra = propDef.type === "tree" ? { height: randomElement(FOREST_CONFIG.CROWN_HEIGHTS) } : {};
    return { tileIndex, type: propDef.type, color: propDef.color, ...extra };
  });

  return { type: "scenery", props };
}
