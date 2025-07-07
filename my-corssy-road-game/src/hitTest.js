import * as THREE from "three";
import { metadata as rows } from "./components/Map";
import { player, position, setGameActive } from "./components/Player";

const resultDOM = document.getElementById("result-container");
const finalScoreDOM = document.getElementById("final-score");

export function hitTest() {
  const row = rows[position.currentRow - 1];
  if (!row) return;

  if (row.type === "car" || row.type === "truck") {
    const playerBoundingBox = new THREE.Box3();
    playerBoundingBox.setFromObject(player);

    row.vehicles.forEach(({ ref }) => {
      if (!ref) throw Error("Vehicle reference is missing");

      const vehicleBoundingBox = new THREE.Box3();
      vehicleBoundingBox.setFromObject(ref);

      if (playerBoundingBox.intersectsBox(vehicleBoundingBox)) {
        if (!resultDOM || !finalScoreDOM) return;
        resultDOM.style.visibility = "visible";
        finalScoreDOM.innerText = position.currentRow.toString();
        setGameActive(false); // Desactivar el juego cuando hay colisión
      }
    });
  }

  // Verificar colisión en carriles mixtos
  if (row.type === "mixed") {
    const playerBoundingBox = new THREE.Box3();
    playerBoundingBox.setFromObject(player);

    // Verificar carros
    row.cars.forEach(({ ref }) => {
      if (!ref) throw Error("Vehicle reference is missing");
      const vehicleBoundingBox = new THREE.Box3();
      vehicleBoundingBox.setFromObject(ref);
      if (playerBoundingBox.intersectsBox(vehicleBoundingBox)) {
        if (!resultDOM || !finalScoreDOM) return;
        resultDOM.style.visibility = "visible";
        finalScoreDOM.innerText = position.currentRow.toString();
        setGameActive(false);
      }
    });
    // Verificar camiones
    row.trucks.forEach(({ ref }) => {
      if (!ref) throw Error("Vehicle reference is missing");
      const vehicleBoundingBox = new THREE.Box3();
      vehicleBoundingBox.setFromObject(ref);
      if (playerBoundingBox.intersectsBox(vehicleBoundingBox)) {
        if (!resultDOM || !finalScoreDOM) return;
        resultDOM.style.visibility = "visible";
        finalScoreDOM.innerText = position.currentRow.toString();
        setGameActive(false);
      }
    });
  }
}