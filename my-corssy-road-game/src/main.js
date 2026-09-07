import { Game } from "./core/Game";
import { Hud } from "./ui/Hud";
import { BiomeBanner } from "./ui/BiomeBanner";
import { LoadingScreen } from "./ui/LoadingScreen";
import { StartScreen } from "./ui/StartScreen";
import { CharacterSelect } from "./ui/CharacterSelect";
import { OptionsScreen } from "./ui/OptionsScreen";
import { PauseScreen } from "./ui/PauseScreen";
import { GameOverScreen } from "./ui/GameOverScreen";
import "./style.css";

const canvas = document.querySelector("canvas.game");
if (!canvas) throw new Error("Canvas not found");

// Persistent HUD / feedback widgets + the loading screen must exist before
// game.init() so they catch GAME_READY / early events.
new Hud();
new BiomeBanner();
new GameOverScreen();
new LoadingScreen({});

const game = new Game(canvas);
game.init();

// --- screens + navigation ------------------------------------------------
const options = new OptionsScreen();
let start;

const characters = new CharacterSelect({
  player: game.player,
  onClose: () => start.show(),
});

start = new StartScreen({
  onPlay: () => {
    start.hide();
    game.start();
  },
  onCharacters: () => {
    start.hide();
    characters.open();
  },
  onOptions: () => {
    start.hide();
    options.open(() => start.show());
  },
});

new PauseScreen({
  onResume: () => game.resume(),
  onMenu: () => game.toMenu(),
  onOptions: () => {
    document.getElementById("pause-screen").hidden = true;
    // Return to the pause screen (still paused) when Options closes.
    options.open(() => {
      document.getElementById("pause-screen").hidden = false;
    });
  },
});

document.getElementById("retry")?.addEventListener("click", () => game.start());
document.getElementById("to-menu")?.addEventListener("click", () => game.toMenu());
