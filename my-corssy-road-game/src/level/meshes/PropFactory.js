import { Tree } from "./Tree";
import { Bush } from "./Bush";
import { Rock } from "./Rock";
import { Cactus } from "./Cactus";
import { DeadBush } from "./DeadBush";
import { Pine } from "./Pine";
import { Snowman } from "./Snowman";
import { StreetLamp } from "./StreetLamp";
import { Hydrant } from "./Hydrant";
import { Tuft } from "./Tuft";
import { Coin } from "./Coin";
import { Building } from "./Building";
import { Mound } from "./Mound";

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
    case "tuft":
      return Tuft(prop.tileIndex, prop.color);
    case "coin":
      return Coin(prop.tileIndex);
    case "building":
      return Building(prop.tileIndex, prop.height);
    case "mound":
      return Mound(prop.tileIndex, prop.color);
    default:
      throw new Error(`Unknown prop type: ${prop.type}`);
  }
}
