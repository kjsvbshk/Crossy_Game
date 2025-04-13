import * as THREE from 'three';
import { Grass } from './Grass';

export const map = new THREE.Group();

export function initializeMap(){
    const grass = Grass(0);
    map.add(grass);
}