// Importing scene modules from the 'scenes' directory
import TrainingScene from "./scenes/TrainingScene.js";
import IntroScene from "./scenes/IntroScene.js";
import EndScene from "./scenes/EndScene.js";
import GameScene from "./scenes/GameScene.js";
import ReadyScene from "./scenes/ReadyScene.js";  // Ensure consistent casing in file names

// Instantiating scene objects
const training = new TrainingScene("TrainingScene");
const intro = new IntroScene("IntroScene");
const ready = new ReadyScene("ReadyScene");
const game = new GameScene("GameScene");
const end = new EndScene("EndScene");

// Exporting Phaser game configuration
export default {
    type: Phaser.AUTO, // Automatically determine the best renderer (WebGL or Canvas)
    parent: "start", // ID of the DOM element to attach the game canvas
    width: 500, // Width of the game canvas in pixels
    height: 640, // Height of the game canvas in pixels
    backgroundColor: "#f0f0f0", // Background color of the game canvas
    scene: [intro, training, ready, game, end], // Array of scenes in the order they will be loaded
    physics: {
        default: "arcade", // Setting the default physics system to 'arcade'
        arcade: {
            gravity: { y: 0 }, // Disabling gravity in the arcade physics settings
        },
    },
};