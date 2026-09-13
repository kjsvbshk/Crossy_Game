import * as THREE from "three";
import { WORLD, COLORS, FOREST_CONFIG, CONTACT_SHADOW } from "../../core/Constants";
import { box } from "../../render/geometry";
import { flatMaterial } from "../../render/MaterialLibrary";
import { contactShadow } from "../../render/contactShadow";

const { width: tw, depth: td, height: th } = FOREST_CONFIG.TRUNK_SIZE;
const trunkGeometry = box(tw, td, th);
const trunkMaterial = flatMaterial({ color: COLORS.TREE_TRUNK });
const crownMaterial = flatMaterial({ color: COLORS.TREE_CROWN });

function lighten(hex, amount) {
  return new THREE.Color(hex).lerp(new THREE.Color(0xffffff), amount).getHex();
}

// The crown is two stacked boxes, not one flat block: a lighter, slightly
// narrower cap on top reads as sunlight catching the canopy. `box()` already
// memoizes by dimensions, so no per-height geometry cache is needed here.
const CROWN_CAP_RATIO = 0.38;
const CROWN_CAP_INSET = 0.8;
const crownCapMaterial = flatMaterial({ color: lighten(COLORS.TREE_CROWN, 0.28) });

export function Tree(tileIndex, height) {
  const tree = new THREE.Group();
  tree.position.x = tileIndex * WORLD.TILE_SIZE;

  tree.add(contactShadow(FOREST_CONFIG.CROWN_WIDTH / 2, FOREST_CONFIG.CROWN_DEPTH / 2, { z: CONTACT_SHADOW.Z_ON_GRASS }));

  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.z = FOREST_CONFIG.TRUNK_Z;
  tree.add(trunk);

  const baseZ = FOREST_CONFIG.TRUNK_SIZE.height;
  const capHeight = height * CROWN_CAP_RATIO;
  const bodyHeight = height - capHeight;

  const crownBody = new THREE.Mesh(box(FOREST_CONFIG.CROWN_WIDTH, FOREST_CONFIG.CROWN_DEPTH, bodyHeight), crownMaterial);
  crownBody.position.z = baseZ + bodyHeight / 2;
  crownBody.castShadow = true;
  crownBody.receiveShadow = true;
  tree.add(crownBody);

  const crownCap = new THREE.Mesh(
    box(FOREST_CONFIG.CROWN_WIDTH * CROWN_CAP_INSET, FOREST_CONFIG.CROWN_DEPTH * CROWN_CAP_INSET, capHeight),
    crownCapMaterial,
  );
  crownCap.position.z = baseZ + bodyHeight + capHeight / 2;
  crownCap.castShadow = true;
  tree.add(crownCap);

  tree.userData.swayPhase = Math.random() * Math.PI * 2; // offsets each tree so they don't sway in lockstep
  return tree;
}
