import { Car } from "./Car";
import { Truck } from "./Truck";
import { Pickup } from "./Pickup";
import { Tanker } from "./Tanker";
import { Snowplow } from "./Snowplow";
import { Bus } from "./Bus";
import { Taxi } from "./Taxi";

/** Builds the THREE.Object3D for one vehicle-row entry. */
export function buildVehicle(kind, initialTileIndex, direction, color) {
  switch (kind) {
    case "car":
      return Car(initialTileIndex, direction, color);
    case "truck":
      return Truck(initialTileIndex, direction, color);
    case "pickup":
      return Pickup(initialTileIndex, direction, color);
    case "tanker":
      return Tanker(initialTileIndex, direction, color);
    case "snowplow":
      return Snowplow(initialTileIndex, direction, color);
    case "bus":
      return Bus(initialTileIndex, direction, color);
    case "taxi":
      return Taxi(initialTileIndex, direction); // fixed livery, ignores the row's random color
    default:
      throw new Error(`Unknown vehicle kind: ${kind}`);
  }
}
