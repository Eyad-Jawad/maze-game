import { CollisionPerventer } from '../objects/collisionPerventer.js';
import { MazeGenerator } from "../objects/maze.js";
import { Renderer } from '../objects/renderer.js';
import { Game } from '../objects/game.js';

const glCanvas = document.getElementById("glCanvas");
const uiCanvas = document.getElementById("uiCanvas");
const maze = new MazeGenerator();
await maze.init();
const renderer = new Renderer(maze, glCanvas, uiCanvas);
const collisionPerventer = new CollisionPerventer();
const gameLoop = new Game(maze, renderer, collisionPerventer, 0.03);

const inputKeys = {
    "w" : "w", 
    "s" : "s", 
    "a" : "a", 
    "d" : "d", 
    "W" : "w", 
    "S" : "s", 
    "A" : "a", 
    "D" : "d", 
    "ArrowUp" : "w", 
    "ArrowDown" : "s",
    "ArrowLeft" : "a", 
    "ArrowRight" : "d", 
};

document.addEventListener("keydown", async (event) => {
    if (gameLoop.stopped || event.key === "Enter") {
        gameLoop.stop();
        gameLoop.loop();
    } 

    else if (event.key in inputKeys) gameLoop.updateKey(inputKeys[event.key], true);
    else if (event.key === "Escape") document.exitPointerLock();
});

document.addEventListener("keyup", async (etruevent) => {
    if (event.key in inputKeys) gameLoop.updateKey(inputKeys[event.key], false);
});

document.addEventListener("click", () => {
    if (gameLoop.stopped) {
        gameLoop.loop();
    }
    
    glCanvas.requestPointerLock();
});

document.addEventListener("mousemove", (event) => {
    if (document.pointerLockElement === glCanvas)
        gameLoop.updateMouse(event.movementX, event.movementY);
});