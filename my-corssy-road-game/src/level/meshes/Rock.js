import * as THREE from "three";
import { WORLD, PROP_CONFIG } from "../../core/Constants";

const geometry = new THREE.IcosahedronGeometry(PROP_CONFIG.ROCK.RADIUS, 0);

const materialByColor = new Map();
function getMaterial(color) {
  let material = materialByColor.get(color);
  if (!material) {
    material = new THREE.MeshLambertMaterial({ color, flatShading: true });
    materialByColor.set(color, material);
  }
  return material;
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
