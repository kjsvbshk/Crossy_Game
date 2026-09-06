import { WORLD, VEHICLE_CONFIG } from "../core/Constants";

// Wheel meshes are boxes, not cylinders (see level/meshes/Wheel.js), but
// spinning one around its axle axis by distance/radius still reads as a
// rolling wheel — and it's free, since it's driven by the same speed*delta
// already used to move the vehicle.
const WHEEL_RADIUS = VEHICLE_CONFIG.WHEEL.SIZE.height / 2;

export function updateVehicles(delta, rows) {
  const { MIN_TILE_INDEX, MAX_TILE_INDEX, TILE_SIZE, VEHICLE_ROW_EDGE_BUFFER_TILES } = WORLD;
  const beginningOfRow = (MIN_TILE_INDEX - VEHICLE_ROW_EDGE_BUFFER_TILES) * TILE_SIZE;
  const endOfRow = (MAX_TILE_INDEX + VEHICLE_ROW_EDGE_BUFFER_TILES) * TILE_SIZE;

  rows.forEach((rowData) => {
    if (!rowData || rowData.type !== "vehicles") return;

    rowData.vehicles.forEach(({ ref, speed }) => {
      if (!ref) throw Error("Vehicle reference is missing");

      const distance = speed * delta;
      if (rowData.direction) {
        ref.position.x = ref.position.x > endOfRow ? beginningOfRow : ref.position.x + distance;
      } else {
        ref.position.x = ref.position.x < beginningOfRow ? endOfRow : ref.position.x - distance;
      }

      const spin = (distance / WHEEL_RADIUS) * (rowData.direction ? 1 : -1);
      ref.userData.wheels?.forEach((wheel) => {
        wheel.rotation.y += spin;
      });
    });
  });
}
