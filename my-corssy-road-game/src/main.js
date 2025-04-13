import * as THREE from "three";
import { Renderer } from "./components/Renderer";
import { Camera } from "./components/Camera";
import { player } from "./components/Player";
import { map, initializeMap } from "./components/Maps";
import "./style.css";

const scene = new THREE.Scene();
scene.add(player);
scene.add(map);

// Set light scene
const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight();
dirLight.position.set(-100, -100, 200);
scene.add(dirLight);

// Set the camera position
const camera = Camera();
scene.add(camera);

// Initialize the game
initializeGame();
function initializeGame() {
    initializeMap();
}
// Initialize the renderer

const renderer = Renderer();
renderer.render(scene, camera);