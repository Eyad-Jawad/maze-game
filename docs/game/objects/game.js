import { mat4, vec3 } from '../node_modules/gl-matrix/esm/index.js'
import { CollisionPerventer } from './collisionPerventer.js';
import { MazeGenerator } from './maze.js';
import { Renderer } from './renderer.js';

class Game {
    constructor(maze, renderer, collisionPerventer, speed) {
        this.maze = maze;
        this.renderer = renderer;
        this.collisionPerventer = collisionPerventer;

        this.fps = 60;
        this.stopped = false;
        this.intervalId = null;
        
        this.speed = speed;
        this.forward = null;
        this.right = null;

        this.mouseMovementX = 0;
        this.mouseMovementY = 0;
        this.sensitivity = -0.005;

        this.keys = {
            "w": false,
            "s": false,
            "d": false,
            "a": false
        };
    }

    update() {
        this.makeForward();
        this.makeRight();

        const _keysComponents = {
            "w": [this.forward,  this.speed],
            "s": [this.forward, -this.speed],
            "d": [this.right,    this.speed],
            "a": [this.right,   -this.speed]
        };

        for (const key in this.keys) {
            if (!this.keys[key]) continue;

            vec3.scaleAndAdd(
                this.renderer.cameraPositions, 
                this.renderer.cameraPositions, 
                _keysComponents[key][0],
                _keysComponents[key][1]
            );

            const reScale = this.collisionPerventer.reScale;
            const offset = this.maze.side - 1;

            const x = this.renderer.cameraPositions[0] * reScale - offset;
            const y = this.renderer.cameraPositions[2] * reScale - offset;

            const distance = Math.sqrt(x * x + y * y);
            const WIN_RADUIS = 1

            if (distance < WIN_RADUIS) {
                this.stop();
                window.alert("You won!\nClick Enter to start a new game");
            }

            this.renderer.cameraPositions[1] = 1.0;
            if (this.collisionPerventer.check(this.renderer.cameraPositions) === false)
                this.renderer.cameraPositions = [...this.collisionPerventer.lastCoordinates];
        }
        this.handleMouse();
    }

    draw() {
        this.renderer.updateMazeView(this.forward);
    }

    run() {
        this.update();
        this.draw();
    }

    loop() {
        this.maze.make3DMaze(1);

        this.renderer.cameraPositions = vec3.fromValues(
            0.9,
            1.0,
            0.9 
        );
        this.renderer.cameraAngles = vec3.fromValues(
            0.0, 
            0.0, 
            0.0
        );


        this.renderer.initMaze();
        this.makeForward();
        this.makeRight();
        this.renderer.updateMazeView(this.forward);
        this.collisionPerventer.inputNewMaze(this.maze.maze2D, 1);
        this.intervalId = setInterval(() => this.run(), 1000 / this.fps);
    }

    stop() {
        if (this.intervalId === null) return;
        clearInterval(this.intervalId);
    }

    updateKey(key, isPressed) {
        if (this.keys[key] === undefined) return;

        this.keys[key] = isPressed;
    }

    updateMouse(eventX, eventY) {
        this.mouseMovementX += eventX * this.sensitivity;
        this.mouseMovementY += eventY * this.sensitivity;
    }

    handleMouse() {
        this.renderer.cameraAngles[0] += this.mouseMovementY;
        this.renderer.cameraAngles[2] += this.mouseMovementX;
        
        const maxPitch = Math.PI / 2 - 0.01;
        this.renderer.cameraAngles[0] = Math.max(
            -maxPitch, 
            Math.min(
                maxPitch, 
                this.renderer.cameraAngles[0]
            )
        );
        
        this.mouseMovementX = 0;
        this.mouseMovementY = 0;
    }

    makeForward() {
        this.forward = vec3.fromValues(
            Math.cos(this.renderer.cameraAngles[0]) * Math.sin(this.renderer.cameraAngles[2]),
            Math.sin(this.renderer.cameraAngles[0]),
            Math.cos(this.renderer.cameraAngles[0]) * Math.cos(this.renderer.cameraAngles[2])  
        );
        vec3.normalize(this.forward, this.forward);
    }

    makeRight() {
        if (this.forward === null) throw new Error("Forward vector is null, cannot generate Right vector");

        const up = vec3.fromValues(0, 1, 0);
        this.right = vec3.create();
        vec3.cross(this.right, this.forward, up);
        vec3.normalize(this.right, this.right);
    }
}

export { Game };