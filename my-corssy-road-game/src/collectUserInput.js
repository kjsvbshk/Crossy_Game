import { queueMove, isGameActive } from "./components/Player";

// Variables para rastrear teclas presionadas
const pressedKeys = new Set();

// Event listeners para botones de pantalla
document
  .getElementById("forward")
  ?.addEventListener("click", () => {
    if (isGameActive()) queueMove("forward");
  });

document
  .getElementById("backward")
  ?.addEventListener("click", () => {
    if (isGameActive()) queueMove("backward");
  });

document
  .getElementById("left")
  ?.addEventListener("click", () => {
    if (isGameActive()) queueMove("left");
  });

document
  .getElementById("right")
  ?.addEventListener("click", () => {
    if (isGameActive()) queueMove("right");
  });

// Event listeners para teclado - un solo movimiento por tecla presionada
window.addEventListener("keydown", (event) => {
  if (!isGameActive()) return;
  
  if (event.key === "ArrowUp" && !pressedKeys.has("ArrowUp")) {
    event.preventDefault();
    pressedKeys.add("ArrowUp");
    queueMove("forward");
  } else if (event.key === "ArrowDown" && !pressedKeys.has("ArrowDown")) {
    event.preventDefault();
    pressedKeys.add("ArrowDown");
    queueMove("backward");
  } else if (event.key === "ArrowLeft" && !pressedKeys.has("ArrowLeft")) {
    event.preventDefault();
    pressedKeys.add("ArrowLeft");
    queueMove("left");
  } else if (event.key === "ArrowRight" && !pressedKeys.has("ArrowRight")) {
    event.preventDefault();
    pressedKeys.add("ArrowRight");
    queueMove("right");
  }
});

// Event listeners para teclado - permitir nuevo movimiento al soltar la tecla
window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    pressedKeys.delete("ArrowUp");
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    pressedKeys.delete("ArrowDown");
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    pressedKeys.delete("ArrowLeft");
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    pressedKeys.delete("ArrowRight");
  }
});

// Función para procesar movimientos continuos (ya no se usa)
export function processContinuousMoves() {
  // Esta función ya no hace nada, el movimiento es solo por tecla presionada
  return;
}

// Limpiar teclas cuando se pierde el foco
window.addEventListener("blur", () => {
  pressedKeys.clear();
});