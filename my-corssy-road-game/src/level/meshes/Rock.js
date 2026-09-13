import * as THREE from "three";
import { WORLD, PROP_CONFIG } from "../../core/Constants";
import { flatMaterial } from "../../render/MaterialLibrary";

const geometry = new THREE.IcosahedronGeometry(PROP_CONFIG.ROCK.RADIUS, 0);

function getMaterial(color) {
  return flatMaterial({ color, roughness: 1.0 });
}

export function Rock(tileIndex, color) {
  const rock = new THREE.Mesh(geometry, getMaterial(color));
  rock.position.x = tileIndex * WORLD.TILE_SIZE;
  rock.position.z = PROP_CONFIG.ROCK.RADIUS * 0.7;
  // Per-instance rotation so a row of rocks doesn't look copy-pasted.
  rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  rock.castShadow = true;
  rock.receiveShadow = true;
  return rock;
}
