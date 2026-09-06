import * as THREE from "three";
import { WORLD, COLORS, FOREST_CONFIG } from "../core/Constants";

export function Tree(tileIndex, height) {
    const tree = new THREE.Group();
    tree.position.x = tileIndex * WORLD.TILE_SIZE;

    const { width: tw, depth: td, height: th } = FOREST_CONFIG.TRUNK_SIZE;
    const trunk = new THREE.Mesh(
        new THREE.BoxGeometry(tw, td, th),
        new THREE.MeshLambertMaterial({
            color: COLORS.TREE_TRUNK,
            flatShading: true,
        })
    );
    trunk.position.z = FOREST_CONFIG.TRUNK_Z;
    tree.add(trunk);

    const crown = new THREE.Mesh(
        new THREE.BoxGeometry(30, 30, height),
        new THREE.MeshLambertMaterial({
            color: COLORS.TREE_CROWN,
            flatShading: true,
        })
    );

    crown.position.z = height / 2 + 20;
    crown.castShadow = true;
    crown.receiveShadow = true;
    tree.add(crown);

    return tree;
}