import * as THREE from "three";
import { WORLD, COLORS, FOREST_CONFIG, CONTACT_SHADOW } from "../../core/Constants";
import { roundedBox, applyHandmadeJitter } from "../../render/geometry";
import { clayMaterial } from "../../render/MaterialLibrary";
import { contactShadow } from "../../render/contactShadow";

const { width: tw, depth: td, height: th } = FOREST_CONFIG.TRUNK_SIZE;
const trunkGeometry = roundedBox(tw, td, th);
const trunkMaterial = clayMaterial({ color: COLORS.TREE_TRUNK });
const crownMaterial = clayMaterial({ color: COLORS.TREE_CROWN });

// Only a handful of discrete crown heights exist (FOREST_CONFIG.CROWN_HEIGHTS),
// so one geometry per height is cached and reused rather than created per tree.
const crownGeometryByHeight = new Map();
function getCrownGeometry(height) {
  let geometry = crownGeometryByHeight.get(height);
  if (!geometry) {
    geometry = roundedBox(FOREST_CONFIG.CROWN_WIDTH, FOREST_CONFIG.CROWN_DEPTH, height);
    crownGeometryByHeight.set(height, geometry);
  }
  return geometry;
}

export function Tree(tileIndex, height) {
  const tree = new THREE.Group();
  tree.position.x = tileIndex * WORLD.TILE_SIZE;

  tree.add(contactShadow(FOREST_CONFIG.CROWN_WIDTH / 2, FOREST_CONFIG.CROWN_DEPTH / 2, { z: CONTACT_SHADOW.Z_ON_GRASS }));

  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.z = FOREST_CONFIG.TRUNK_Z;
  tree.add(trunk);

  const crown = new THREE.Mesh(getCrownGeometry(height), crownMaterial);
  crown.position.z = height / 2 + FOREST_CONFIG.TRUNK_SIZE.height;
  crown.castShadow = true;
  crown.receiveShadow = true;
  tree.add(crown);

  applyHandmadeJitter(tree);
  tree.userData.swayPhase = Math.random() * Math.PI * 2; // offsets each tree so they don't sway in lockstep
  return tree;
}
