import { mat4, vec3 } from './node_modules/gl-matrix/esm/index.js';
import { MazeGenerator } from "./mazeObject.js";
import { Renderer } from './renderer.js';

const canvas = document.querySelector("canvas");
const maze = new MazeGenerator();
await maze.init();
const renderer = new Renderer(maze, canvas);

const speed = 0.05;

document.addEventListener("keydown", async (event) => {
    
    const forward = vec3.fromValues(
        Math.cos(renderer.cameraAngles[0]) * Math.sin(renderer.cameraAngles[2]),
        Math.sin(renderer.cameraAngles[0]),
        Math.cos(renderer.cameraAngles[0]) * Math.cos(renderer.cameraAngles[2])
    );

    vec3.normalize(forward, forward);
    const up = vec3.fromValues(0, 1, 0);
    const right = vec3.create();
    vec3.cross(right, forward, up);
    vec3.normalize(right, right);

    if (event.key === "Enter") {
        maze.make3DMaze(1);

        renderer.cameraPositions = vec3.fromValues(
            0.9,
            1.0,
            0.9 
        );
        renderer.cameraAngles = vec3.fromValues(
            0.0, 
            0.0, 
            0.0
        );

        renderer.initMaze();
        renderer.updateMazeView(forward);

    } else if (event.key === "ArrowRight" || event.key === "d") {
        vec3.scaleAndAdd(
            renderer.cameraPositions, 
            renderer.cameraPositions, 
            right, 
            speed
        );
    } else if (event.key === "ArrowLeft" || event.key === "a") {
        vec3.scaleAndAdd(
            renderer.cameraPositions, 
            renderer.cameraPositions, 
            right, 
            -speed
        );
    } else if (event.key === "ArrowUp" || event.key === "w") {
        vec3.scaleAndAdd(
            renderer.cameraPositions, 
            renderer.cameraPositions, 
            forward, 
            speed
        );
    } else if (event.key === "ArrowDown" || event.key === "s") {
        vec3.scaleAndAdd(
            renderer.cameraPositions, 
            renderer.cameraPositions, 
            forward, 
            -speed
        );
    } else if (event.key === "escape") {
        document.exitPointerLock();
    }

    renderer.cameraPositions[1] = 1.0;
    renderer.updateMazeView(forward);
});

document.addEventListener("click", async () => {
    await canvas.requestPointerLock();
});

document.addEventListener("mousemove", (event) => {

    const forward = vec3.fromValues(
        Math.cos(renderer.cameraAngles[0]) * Math.sin(renderer.cameraAngles[2]),
        Math.sin(renderer.cameraAngles[0]),
        Math.cos(renderer.cameraAngles[0]) * Math.cos(renderer.cameraAngles[2])  
    );
    
    if (document.pointerLockElement === canvas) {
        const sensitivity = 0.005;
        renderer.cameraAngles[0] -= event.movementY * sensitivity;
        renderer.cameraAngles[2] -= event.movementX * sensitivity;
        
        const maxPitch = Math.PI / 2 - 0.01;
        renderer.cameraAngles[0] = Math.max(
            -maxPitch, 
            Math.min(
                maxPitch, 
                renderer.cameraAngles[0]
            )
        );

        renderer.updateMazeView(forward);
    }
});