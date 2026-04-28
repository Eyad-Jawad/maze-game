import * as mat4 from "../node_modules/gl-matrix/esm/mat4.js";
import * as vec3 from "../node_modules/gl-matrix/esm/vec3.js";
import { CollisionPerventer } from '../objects/collisionPerventer.js';
import { MazeGenerator } from "../objects/maze.js";
import { Renderer } from '../objects/renderer.js';
import { Game } from '../objects/game.js';

const canvas = document.querySelector("canvas");
const maze = new MazeGenerator();
await maze.init();
const renderer = new Renderer(maze, canvas);
const collisionPerventer = new CollisionPerventer();
const gameLoop = new Game(maze, renderer, collisionPerventer, 0.03);

document.addEventListener("keydown", async (event) => {
    if (gameLoop.stopped || event.key === "Enter") {
        gameLoop.stop();
        gameLoop.loop();
    } 

    else if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") gameLoop.updateKey("d", true);
    else if (event.key === "ArrowLeft"  || event.key === "a" || event.key === "A") gameLoop.updateKey("a", true);
    else if (event.key === "ArrowUp"    || event.key === "w" || event.key === "W") gameLoop.updateKey("w", true);
    else if (event.key === "ArrowDown"  || event.key === "s" || event.key === "S") gameLoop.updateKey("s", true);
    else if (event.key === "Escape") 
        document.exitPointerLock();
});

document.addEventListener("keyup", async (event) => {
    if (event.key === "ArrowRight"      || event.key === "d" || event.key === "D") gameLoop.updateKey("d", false);
    else if (event.key === "ArrowLeft"  || event.key === "a" || event.key === "A") gameLoop.updateKey("a", false);
    else if (event.key === "ArrowUp"    || event.key === "w" || event.key === "W") gameLoop.updateKey("w", false);
    else if (event.key === "ArrowDown"  || event.key === "s" || event.key === "S") gameLoop.updateKey("s", false);
});

document.addEventListener("click", () => {
    if (gameLoop.stopped) {
        gameLoop.loop();
    }
    
    canvas.requestPointerLock();
});

document.addEventListener("mousemove", (event) => {
    if (document.pointerLockElement === canvas)
        gameLoop.updateMouse(event.movementX, event.movementY);
});