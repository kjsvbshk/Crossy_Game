import * as THREE from "three";
import { WORLD, COLORS } from "../core/Constants";

export function Grass(rowIndex) {
    const grass = new THREE.Group();
    grass.position.y = rowIndex * WORLD.TILE_SIZE;

    const foundation = new THREE.Mesh(
        new THREE.BoxGeometry(WORLD.TILES_PER_ROW * WORLD.TILE_SIZE, WORLD.TILE_SIZE, 3),
        new THREE.MeshStandardMaterial({ color: COLORS.GRASS })
    );
    foundation.position.z = 1.5;
    foundation.receiveShadow = true;
    grass.add(foundation);

    return grass;
}