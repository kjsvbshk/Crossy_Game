import { Game } from "./core/Game";
import { Hud } from "./ui/Hud";
import { GameOverScreen } from "./ui/GameOverScreen";
import "./style.css";

const canvas = document.querySelector("canvas.game");
if (!canvas) throw new Error("Canvas not found");

new Hud();
new GameOverScreen();

const game = new Game(canvas);
game.init();

document.querySelector("#retry")?.addEventListener("click", () => game.reset());
