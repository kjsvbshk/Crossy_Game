import { WORLD } from "../core/Constants";

export function updateVehicles(delta, rows) {
  const { MIN_TILE_INDEX, MAX_TILE_INDEX, TILE_SIZE, VEHICLE_ROW_EDGE_BUFFER_TILES } = WORLD;
  const beginningOfRow = (MIN_TILE_INDEX - VEHICLE_ROW_EDGE_BUFFER_TILES) * TILE_SIZE;
  const endOfRow = (MAX_TILE_INDEX + VEHICLE_ROW_EDGE_BUFFER_TILES) * TILE_SIZE;

  rows.forEach((rowData) => {
    if (!rowData || rowData.type !== "vehicles") return;

    rowData.vehicles.forEach(({ ref, speed }) => {
      if (!ref) throw Error("Vehicle reference is missing");

      if (rowData.direction) {
        ref.position.x = ref.position.x > endOfRow ? beginningOfRow : ref.position.x + speed * delta;
      } else {
        ref.position.x = ref.position.x < beginningOfRow ? endOfRow : ref.position.x - speed * delta;
      }
    });
  });
}
