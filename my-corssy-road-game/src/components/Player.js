import * as THREE from "three";

export const player = Player();

function Player() {
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(15, 15, 24),
        new THREE.MeshStandardMaterial({
             color: "white",
             flatShading: true,
             })
    );
    body.position.z = 10;

    return body;
}