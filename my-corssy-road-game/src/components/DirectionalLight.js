import * as THREE from "three";
import { LIGHT } from "../core/Constants";

export function DirectionalLight() {
    const dirLight = new THREE.DirectionalLight();

    dirLight.position.set(LIGHT.POSITION.x, LIGHT.POSITION.y, LIGHT.POSITION.z);
    dirLight.up.set(LIGHT.UP.x, LIGHT.UP.y, LIGHT.UP.z);
    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = LIGHT.SHADOW_MAP_SIZE;
    dirLight.shadow.mapSize.height = LIGHT.SHADOW_MAP_SIZE;

    const sc = LIGHT.SHADOW_CAMERA;
    dirLight.shadow.camera.up.set(sc.up.x, sc.up.y, sc.up.z);
    dirLight.shadow.camera.left = sc.left;
    dirLight.shadow.camera.right = sc.right;
    dirLight.shadow.camera.top = sc.top;
    dirLight.shadow.camera.bottom = sc.bottom;
    dirLight.shadow.camera.near = sc.near;
    dirLight.shadow.camera.far = sc.far;

    return dirLight;
}