import { Tree } from "./Tree";
import { Bush } from "./Bush";
import { Rock } from "./Rock";
import { Cactus } from "./Cactus";
import { DeadBush } from "./DeadBush";
import { Pine } from "./Pine";
import { Snowman } from "./Snowman";
import { StreetLamp } from "./StreetLamp";
import { Hydrant } from "./Hydrant";

/** Builds the THREE.Object3D for one scenery-row prop entry. */
export function buildProp(prop) {
  switch (prop.type) {
    case "tree":
      return Tree(prop.tileIndex, prop.height);
    case "bush":
      return Bush(prop.tileIndex, prop.color);
    case "rock":
      return Rock(prop.tileIndex, prop.color);
    case "cactus":
      return Cactus(prop.tileIndex, prop.color);
    case "deadbush":
      return DeadBush(prop.tileIndex, prop.color);
    case "pine":
      return Pine(prop.tileIndex);
    case "snowman":
      return Snowman(prop.tileIndex);
    case "streetlamp":
      return StreetLamp(prop.tileIndex);
    case "hydrant":
      return Hydrant(prop.tileIndex);
    default:
      throw new Error(`Unknown prop type: ${prop.type}`);
  }
}
