import * as THREE from "three";
import { WORLD, VEHICLE_CONFIG, SCENERY_CONFIG, FOREST_CONFIG, BUILDING_CONFIG, RIVER_CONFIG, RAILWAY_CONFIG, COIN_CONFIG, COLORS } from "../core/Constants";
import { getBiomeForScore, getBiomeById } from "./biomes/BiomeDefinitions";

const { MIN_TILE_INDEX: minTileIndex, MAX_TILE_INDEX: maxTileIndex } = WORLD;

export function generateRows(amount, startRowIndex) {
  const rows = [];
  let prevType = null;
  for (let i = 0; i < amount; i++) {
    const rowIndex = startRowIndex + i;
    // A row's biome is fixed at generation time by its own position — it
    // never changes retroactively once generated.
    const biomeId = getBiomeForScore(rowIndex).id;
    const row = pickRow(rowIndex, biomeId, prevType);
    row.biomeId = biomeId;
    prevType = row.type;
    rows.push(row);
  }
  return rows;
}

/**
 * Row-type mix. The first few rows are always gentle scenery, and a river is
 * never placed straight after another river (chaining log→log→log across two
 * unrelated currents is unfair).
 */
function pickRow(rowIndex, biomeId, prevType) {
  if (rowIndex < 6) return generateSceneryRow(biomeId);

  const r = Math.random();
  if (r < 0.3) return generateSceneryRow(biomeId);
  if (r < 0.44 && prevType !== "river") return generateRiverRow(biomeId);
  if (r < 0.54) return generateRailwayRow(biomeId);
  return generateVehicleRow(biomeId);
}

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/** A random tile index not already in `occupied`, or null after 10 misses. */
function pickFreeTile(occupied) {
  for (let tries = 0; tries < 10; tries++) {
    const tileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
    if (!occupied.has(tileIndex)) {
      occupied.add(tileIndex);
      return tileIndex;
    }
  }
  return null;
}

function generateVehicleRow(biomeId) {
  const biome = getBiomeById(biomeId);
  const kinds = biome.vehicleKinds;

  // Mezcla de vehículos disponibles en este bioma en el mismo carril
  const occupiedTiles = new Set();
  const vehicles = [];
  const minSpace = minTileIndex;
  const maxSpace = maxTileIndex;
  const { MIN_COUNT_PER_ROW, MAX_COUNT_PER_ROW, MIN_SEPARATION_TILES, EDGE_MARGIN_TILES, PLACEMENT_ATTEMPTS, SPEEDS, LENGTH_TILES } = VEHICLE_CONFIG;

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

    // Decidir el tipo de vehículo: sesgo hacia los tipos del bioma que aún no aparecieron
    const unusedKinds = kinds.filter((kind) => !placedKinds.has(kind));
    const kind = unusedKinds.length > 0 ? randomElement(unusedKinds) : randomElement(kinds);

    const length = LENGTH_TILES[kind];
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

function generateRiverRow() {
  const {
    MIN_LOG_COUNT, MAX_LOG_COUNT, LOG_LENGTHS_TILES, MIN_SEPARATION_TILES,
    EDGE_MARGIN_TILES, PLACEMENT_ATTEMPTS, SPEEDS,
  } = RIVER_CONFIG;

  // One current for the whole row — same reasoning as vehicles: mixed speeds
  // in a lane let a fast log overtake and merge into a slow one.
  const direction = randomElement([true, false]);
  const speed = randomElement(SPEEDS);

  const occupied = new Set();
  const logs = [];
  const target = THREE.MathUtils.randInt(MIN_LOG_COUNT, MAX_LOG_COUNT);

  let positions = [];
  for (let i = minTileIndex + EDGE_MARGIN_TILES; i <= maxTileIndex - EDGE_MARGIN_TILES; i++) positions.push(i);
  positions.sort(() => Math.random() - 0.5);

  let attempts = 0;
  while (logs.length < target && attempts < PLACEMENT_ATTEMPTS && positions.length) {
    attempts++;
    const lengthTiles = randomElement(LOG_LENGTHS_TILES);
    const halfLen = Math.floor(lengthTiles / 2);
    const spread = halfLen + MIN_SEPARATION_TILES;

    const idx = positions.findIndex((candidate) => {
      for (let j = -spread; j <= spread; j++) if (occupied.has(candidate + j)) return false;
      return true;
    });
    if (idx === -1) continue;

    const tile = positions[idx];
    for (let j = -spread; j <= spread; j++) occupied.add(tile + j);
    positions = positions.filter((p) => Math.abs(p - tile) > spread);
    logs.push({ initialTileIndex: tile, lengthTiles, ref: null });
  }

  // A river with no landable log is a guaranteed drown — never ship one.
  if (logs.length === 0) logs.push({ initialTileIndex: 0, lengthTiles: 3, ref: null });

  return { type: "river", direction, speed, logs };
}

function generateRailwayRow() {
  const direction = randomElement([true, false]);
  return {
    type: "railway",
    direction,
    train: {
      state: "idle",
      timer: THREE.MathUtils.randFloat(RAILWAY_CONFIG.IDLE_MIN_S, RAILWAY_CONFIG.IDLE_MAX_S),
      ref: null,
      signalRef: null,
    },
  };
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
    // Props with per-instance height variety.
    let extra = {};
    if (propDef.type === "tree") extra = { height: randomElement(FOREST_CONFIG.CROWN_HEIGHTS) };
    else if (propDef.type === "building") extra = { height: randomElement(BUILDING_CONFIG.HEIGHTS) };
    return { tileIndex, type: propDef.type, color: propDef.color, ...extra };
  });

  // Walkable grass tufts on the leftover tiles — decoration only, they never
  // block the player (movementRules checks `walkable`).
  if (biome.decorColor) {
    for (let i = 0; i < SCENERY_CONFIG.DECOR_PER_ROW; i++) {
      const tileIndex = pickFreeTile(occupiedTiles);
      if (tileIndex === null) break;
      props.push({ tileIndex, type: "tuft", color: biome.decorColor, walkable: true });
    }
  }

  // Desert dunes / snow drifts — walkable terrain relief.
  if (biome.moundColor && Math.random() < 0.6) {
    const count = 1 + (Math.random() < 0.35 ? 1 : 0);
    for (let i = 0; i < count; i++) {
      const tileIndex = pickFreeTile(occupiedTiles);
      if (tileIndex === null) break;
      props.push({ tileIndex, type: "mound", color: biome.moundColor, walkable: true });
    }
  }

  // At most one coin per scenery row, on a free tile.
  if (Math.random() < COIN_CONFIG.SPAWN_CHANCE_PER_SCENERY_ROW) {
    const tileIndex = pickFreeTile(occupiedTiles);
    if (tileIndex !== null) props.push({ tileIndex, type: "coin", walkable: true, coin: true });
  }

  return { type: "scenery", props };
}
