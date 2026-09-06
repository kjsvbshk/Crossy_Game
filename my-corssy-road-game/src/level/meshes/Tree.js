import * as THREE from "three";
import { WORLD, COLORS, FOREST_CONFIG } from "../../core/Constants";

const { width: tw, depth: td, height: th } = FOREST_CONFIG.TRUNK_SIZE;
const trunkGeometry = new THREE.BoxGeometry(tw, td, th);
const trunkMaterial = new THREE.MeshLambertMaterial({ color: COLORS.TREE_TRUNK, flatShading: true });
const crownMaterial = new THREE.MeshLambertMaterial({ color: COLORS.TREE_CROWN, flatShading: true });

// Only a handful of discrete crown heights exist (FOREST_CONFIG.CROWN_HEIGHTS),
// so one geometry per height is cached and reused rather than created per tree.
const crownGeometryByHeight = new Map();
function getCrownGeometry(height) {
  let geometry = crownGeometryByHeight.get(height);
  if (!geometry) {
    geometry = new THREE.BoxGeometry(FOREST_CONFIG.CROWN_WIDTH, FOREST_CONFIG.CROWN_DEPTH, height);
    crownGeometryByHeight.set(height, geometry);
  }
  return geometry;
}

export function Tree(tileIndex, height) {
  const tree = new THREE.Group();
  tree.position.x = tileIndex * WORLD.TILE_SIZE;

  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.z = FOREST_CONFIG.TRUNK_Z;
  tree.add(trunk);

  const crown = new THREE.Mesh(getCrownGeometry(height), crownMaterial);
  crown.position.z = height / 2 + FOREST_CONFIG.TRUNK_SIZE.height;
  crown.castShadow = true;
  crown.receiveShadow = true;
  tree.add(crown);

  tree.userData.swayPhase = Math.random() * Math.PI * 2; // offsets each tree so they don't sway in lockstep
  return tree;
}
