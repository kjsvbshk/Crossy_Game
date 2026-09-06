import * as THREE from "three";
import { WORLD, PROP_CONFIG } from "../../core/Constants";
import { clayMaterial } from "../../render/MaterialLibrary";
import { applyHandmadeJitter } from "../../render/geometry";

// A low, wide, soft hump of ground — a desert dune or a snow drift. Walkable
// (RowGenerator tags it); the player just steps over it. Colour comes from the
// row's biome so it reads as terrain, not a prop.

const { width: W, depth: D, height: H } = PROP_CONFIG.MOUND;
// Half a squashed sphere: scale a unit sphere, sink it so only the cap shows.
const geometry = new THREE.SphereGeometry(1, 14, 10);

export function Mound(tileIndex, color) {
  const mound = new THREE.Mesh(geometry, clayMaterial({ color, roughness: 1.0 }));
  mound.position.set(tileIndex * WORLD.TILE_SIZE, (Math.random() - 0.5) * 10, -H * 0.9);
  mound.scale.set(W / 2, D / 2, H * 1.9);
  mound.receiveShadow = true; // takes shadow, but doesn't cast a hard terrain shadow
  applyHandmadeJitter(mound);
  return mound;
}
