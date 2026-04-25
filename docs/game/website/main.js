import { mat4, vec3 } from '../node_modules/gl-matrix/esm/index.js'
import { CollisionPerventer } from '../objects/collisionPerventerObject.js';
import { MazeGenerator } from "../objects/mazeObject.js";
import { Renderer } from '../objects/renderer.js';
import { Game } from '../objects/gameObject.js';

const canvas = document.querySelector("canvas");
const maze = new MazeGenerator();
await maze.init();
const renderer = new Renderer(maze, canvas);
const collisionPerventer = new CollisionPerventer();
const gameLoop = new Game(maze, renderer, collisionPerventer, 0.03);

document.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        gameLoop.stop();
        gameLoop.loop();
    } 

    else if (event.key === "ArrowRight" || event.key === "d") gameLoop.updateKey("d", true);
    else if (event.key === "ArrowLeft"  || event.key === "a") gameLoop.updateKey("a", true);
    else if (event.key === "ArrowUp"    || event.key === "w") gameLoop.updateKey("w", true);
    else if (event.key === "ArrowDown"  || event.key === "s") gameLoop.updateKey("s", true);
    else if (event.key === "Escape") 
        document.exitPointerLock();
});

document.addEventListener("keyup", async (event) => {
    if (event.key === "ArrowRight"      || event.key === "d") gameLoop.updateKey("d", false);
    else if (event.key === "ArrowLeft"  || event.key === "a") gameLoop.updateKey("a", false);
    else if (event.key === "ArrowUp"    || event.key === "w") gameLoop.updateKey("w", false);
    else if (event.key === "ArrowDown"  || event.key === "s") gameLoop.updateKey("s", false);
});

document.addEventListener("click", () => {
    canvas.requestPointerLock();
});

document.addEventListener("mousemove", (event) => {
    if (document.pointerLockElement === canvas)
        gameLoop.updateMouse(event.movementX, event.movementY);
});