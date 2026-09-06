import * as THREE from 'three';
import { CAMERA } from '../core/Constants';

export function Camera() {
    const size = CAMERA.ORTHO_SIZE;
    const viewRatio = window.innerWidth / window.innerHeight;
    const width = viewRatio < 1 ? size : size * viewRatio;
    const height = viewRatio < 1 ? size / viewRatio : size;

    const camera = new THREE.OrthographicCamera(
        width / -2, // left
        width / 2, // right
        height / 2, // top
        height / -2, // bottom
        CAMERA.NEAR,
        CAMERA.FAR
    );
    camera.up.set(CAMERA.UP.x, CAMERA.UP.y, CAMERA.UP.z);
    camera.position.set(CAMERA.POSITION.x, CAMERA.POSITION.y, CAMERA.POSITION.z);
    camera.lookAt(0, 0, 0);

    return camera;
}