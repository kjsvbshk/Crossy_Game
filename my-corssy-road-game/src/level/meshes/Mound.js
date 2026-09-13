import * as THREE from "three";
import { WORLD, PROP_CONFIG } from "../../core/Constants";
import { flatMaterial } from "../../render/MaterialLibrary";

// A low, wide, soft hump of ground — a desert dune or a snow drift. Walkable
// (RowGenerator tags it); the player just steps over it. Colour comes from the
// row's biome so it reads as terrain, not a prop.

const { width: W, depth: D, height: H } = PROP_CONFIG.MOUND;
// Half a squashed icosahedron: scale a unit blob, sink it so only the cap
// shows, faceted like Rock.js instead of smoothly round.
const geometry = new THREE.IcosahedronGeometry(1, 0);

export function Mound(tileIndex, color) {
  const mound = new THREE.Mesh(geometry, flatMaterial({ color, roughness: 1.0 }));
  mound.position.set(tileIndex * WORLD.TILE_SIZE, (Math.random() - 0.5) * 10, -H * 0.9);
  mound.scale.set(W / 2, D / 2, H * 1.9);
  mound.rotation.z = Math.random() * Math.PI * 2; // vary the facet pattern per instance
  mound.receiveShadow = true; // takes shadow, but doesn't cast a hard terrain shadow
  return mound;
}
