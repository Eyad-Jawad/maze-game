import createMazeModule from "./maze.js";
import {mat4, vec3} from './node_modules/gl-matrix/esm/index.js'

let maze2DGlobal;

async function createMazeInfo(blockSize) {
    const Module = await createMazeModule();
    
    const ptr = Module._run(10);
    const mazeSize = Module._size(10);
    const maze2D = new Uint8Array(Module.HEAPU8.buffer, ptr, mazeSize);
    maze2DGlobal = maze2D;
    
    const index = (row, col, N) => { return row * N + col; }

    let side = Math.sqrt(mazeSize);
    
    const scale = 1 / (side * blockSize) + 0.5;

    let maze3D = [];

    for(let y = 0; y < side; y++) {
        for(let x = 0; x < side; x++) {

            const startX = (x * blockSize) * scale;
            const startY = (y * blockSize) * scale;
            const endX   = (x * blockSize + blockSize) * scale;
            const endY   = (y * blockSize + blockSize) * scale;

            let left = [
                [startX, 0,         startY], 
                [endX,   0,         startY], 
                [startX, blockSize, startY],

                [endX,   0,         startY], 
                [startX, blockSize, startY],
                [endX,   blockSize, startY],
            ];

            let near = [
                [startX, 0,         startY],
                [startX, 0,         endY],
                [startX, blockSize, startY],

                [startX, 0,         endY],
                [startX, blockSize, startY],                
                [startX, blockSize, endY]
            ];

            let far = [
                [endX, 0,         startY],
                [endX, 0,         endY],
                [endX, blockSize, startY],

                [endX, 0,         endY],
                [endX, blockSize, startY],                
                [endX, blockSize, endY]
            ]

            let right = [
                [startX, 0,         endY],
                [endX,   0,         endY],
                [startX, blockSize, endY],

                [endX,   0,         endY],
                [startX, blockSize, endY],
                [endX,   blockSize, endY]
            ];

            let up = [
                [startX, blockSize, startY],
                [endX,   blockSize, startY],
                [startX, blockSize, endY],

                [endX,   blockSize, startY],
                [startX, blockSize, endY],
                [endX,   blockSize, endY]
            ];

            let down = [
                [startX, 0, startY],
                [endX,   0, startY],
                [startX, 0, endY],

                [endX,   0, startY],
                [startX, 0, endY],                
                [endX,   0, endY]
            ];

            if (maze2D[index(y, x, side)] === 1) {
                maze3D.push(right);
                maze3D.push(left);
                maze3D.push(up);
                maze3D.push(down);
                maze3D.push(near);
                maze3D.push(far);
            }
            else
                maze3D.push(down);
        }
    }
    return maze3D.flat(Infinity);
}

let maze;
let vertexCount;
let cameraPositions = vec3.fromValues(0.5, 1.0, -0.5);
let cameraAngles = vec3.fromValues(0.0, 0.0, 0.0);
//                              [pitch, roll, yaw]

const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");

if (!gl) {
    throw new Error("WebGl was not found.");
}

gl.enable(gl.DEPTH_TEST);
canvas.width = 1920;
canvas.height = 1080;

gl.viewport(0, 0, canvas.width, canvas.height);

function createMaze(maze, cameraPositions, cameraAngles, perspectiveMatrix, forward) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(maze), gl.DYNAMIC_DRAW);
    
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    
    gl.shaderSource(vertexShader, `
        attribute vec3 position;
        uniform vec3 camera;
        uniform mat4 view;
        uniform mat4 model;
        uniform mat4 projection;
        varying float depth;
    
        void main() {
            vec3 pos = position - camera;
            depth = sqrt(pos.x * pos.x + pos.z * pos.z);
            
            gl_Position = projection * view * model * vec4(position, 1.0);
        }
    `);
    
    gl.compileShader(vertexShader);
    
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `
        precision mediump float;
    
        varying float depth;
    
        void main() {
            float brightness = 1.0 / (1.0 + depth * 0.8) + 0.3;
            gl_FragColor = vec4(0, brightness, brightness, 1);
        }
    `);
    
    gl.compileShader(fragmentShader);
    
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    const positionLocation = gl.getAttribLocation(program, `position`);
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    const modelMatrix = mat4.create();
    mat4.identity(modelMatrix);

    const view = mat4.create();
    const target = vec3.create();
    vec3.add(target, cameraPositions, forward);
    mat4.lookAt(view, cameraPositions, target, vec3.fromValues(0.0, 1.0, 0.0));    

    gl.uniformMatrix4fv(gl.getUniformLocation(program, `projection`), false, perspectiveMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, `model`), false, modelMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, `view`), false, view);
    gl.uniform3fv(gl.getUniformLocation(program, `camera`), new Float32Array(cameraPositions));

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
    
    console.log(gl.getShaderInfoLog(vertexShader));
    console.log(gl.getShaderInfoLog(fragmentShader));
    console.log(gl.getProgramInfoLog(program));
}

let perspectiveMatrix = mat4.create();
mat4.perspective(perspectiveMatrix, Math.PI / 3, canvas.width / canvas.height, 0.1, 100.0);

const speed = 0.05;

document.addEventListener("keydown", async (event) => {
    const forward = vec3.fromValues(
        Math.cos(cameraAngles[0]) * Math.sin(cameraAngles[2]),
        Math.sin(cameraAngles[0]),
        Math.cos(cameraAngles[0]) * Math.cos(cameraAngles[2])
    );
    vec3.normalize(forward, forward);
    const up = vec3.fromValues(0, 1, 0);
    const right = vec3.create();
    vec3.cross(right, forward, up);
    vec3.normalize(right, right);

    if (event.key === "Enter") {
        maze = await createMazeInfo(1);
        vertexCount = maze.length / 3;

        cameraPositions = vec3.fromValues(0.5, 1.0, -0.5);
        
        cameraAngles = vec3.fromValues(0.0, 0.0, 0.0);

        createMaze(maze, cameraPositions, cameraAngles, perspectiveMatrix, forward);
    } else if (event.key === "ArrowRight" || event.key === "d") {
        vec3.scaleAndAdd(cameraPositions, cameraPositions, right, speed);
        cameraPositions[1] = 1.0;
        createMaze(maze, cameraPositions, cameraAngles, perspectiveMatrix, forward);
    } else if (event.key === "ArrowLeft" || event.key === "a") {
        vec3.scaleAndAdd(cameraPositions, cameraPositions, right, -speed);
        cameraPositions[1] = 1.0;
        createMaze(maze, cameraPositions, cameraAngles, perspectiveMatrix, forward);
    } else if (event.key === "ArrowUp" || event.key === "w") {
        vec3.scaleAndAdd(cameraPositions, cameraPositions, forward, speed);
        cameraPositions[1] = 1.0;
        createMaze(maze, cameraPositions, cameraAngles, perspectiveMatrix, forward);
    } else if (event.key === "ArrowDown" || event.key === "s") {
        vec3.scaleAndAdd(cameraPositions, cameraPositions, forward, -speed);
        cameraPositions[1] = 1.0;
        createMaze(maze, cameraPositions, cameraAngles, perspectiveMatrix, forward);
    } else if (event.key === "escape") {
        document.exitPointerLock();
    }
});

document.addEventListener("click", async () => {
    await canvas.requestPointerLock();
});

document.addEventListener("mousemove", (event) => {
    const forward = vec3.fromValues(
        Math.cos(cameraAngles[0]) * Math.sin(cameraAngles[2]),
        Math.sin(cameraAngles[0]),
        Math.cos(cameraAngles[0]) * Math.cos(cameraAngles[2])  
    );
    
    if (document.pointerLockElement === canvas) {
        const sensitivity = 0.005;
        cameraAngles[0] -= event.movementY * sensitivity;
        cameraAngles[2] -= event.movementX * sensitivity;
        
        const maxPitch = Math.PI / 2 - 0.01;
        cameraAngles[0] = Math.max(-maxPitch, Math.min(maxPitch, cameraAngles[0]));

        createMaze(maze, cameraPositions, cameraAngles, perspectiveMatrix, forward);
    }
});