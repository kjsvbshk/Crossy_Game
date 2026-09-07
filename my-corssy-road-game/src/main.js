import { Game } from "./core/Game";
import { Hud } from "./ui/Hud";
import { GameOverScreen } from "./ui/GameOverScreen";
import { BiomeBanner } from "./ui/BiomeBanner";
import { CoinCounter } from "./ui/CoinCounter";
import { StartScreen } from "./ui/StartScreen";
import { CharacterSelect } from "./ui/CharacterSelect";
import "./style.css";

const canvas = document.querySelector("canvas.game");
if (!canvas) throw new Error("Canvas not found");

new Hud();
new GameOverScreen();
new BiomeBanner();
new CoinCounter();

const game = new Game(canvas);
game.init();

let startScreen;
const characterSelect = new CharacterSelect({
  player: game.player,
  onClose: () => startScreen.show(),
});
startScreen = new StartScreen({
  onPlay: () => {
    startScreen.hide();
    game.start();
  },
  onCharacters: () => {
    startScreen.hide();
    characterSelect.open();
  },
});

document.querySelector("#retry")?.addEventListener("click", () => game.reset());
document.querySelector("#to-menu")?.addEventListener("click", () => game.toMenu());
