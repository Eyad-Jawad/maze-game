import createMazeModule from "./maze.js";

async function createMazeInfo(blockSize) {
    const Module = await createMazeModule();
    
    const ptr = Module._run(5);
    const mazeSize = Module._size(5);
    const maze2D = new Uint8Array(Module.HEAPU8.buffer, ptr, mazeSize);
    
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
let cameraPositions = [0.5, 1.0, -0.5];

const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");

if (!gl) {
    throw new Error("WebGl was not found.");
}

gl.enable(gl.DEPTH_TEST);
canvas.width = 1920;
canvas.height = 880;

gl.viewport(0, 0, canvas.width, canvas.height);

function createMaze(maze, cameraPositions) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(maze), gl.DYNAMIC_DRAW);
    
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    
    gl.shaderSource(vertexShader, `
        attribute vec3 position;
        uniform vec3 camera;
        varying float depth;
    
        void main() {
            float f = 1.0;
            vec3 pos = position - camera;    
        
            depth = sqrt(pos.x * pos.x + pos.z * pos.z);
            gl_Position = vec4(pos.x * f, pos.y * f, pos.z - 0.2, pos.z);
        }
    `);
    
    gl.compileShader(vertexShader);
    
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `
        precision mediump float;
    
        varying float depth;
    
        void main() {
            float brightness = 1.0 / (1.0 + depth * 0.8);
            gl_FragColor = vec4(brightness, brightness, brightness, 1);
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

    const cameraLocation = gl.getUniformLocation(program, `camera`);
    gl.uniform3fv(cameraLocation, new Float32Array(cameraPositions));

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
    
    console.log(gl.getShaderInfoLog(vertexShader));
    console.log(gl.getShaderInfoLog(fragmentShader));
    console.log(gl.getProgramInfoLog(program));
}

document.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        maze = await createMazeInfo(1);
        vertexCount = maze.length / 3;
        createMaze(maze, cameraPositions);
    } else if (event.key === "ArrowRight") {
        cameraPositions[0] += 0.03;
        createMaze(maze, cameraPositions);
    } else if (event.key === "ArrowLeft") {
        cameraPositions[0] -= 0.03;
        createMaze(maze, cameraPositions);
    } else if (event.key === "ArrowUp") {
        cameraPositions[2] += 0.03;
        createMaze(maze, cameraPositions);
    } else if (event.key === "ArrowDown") {
        cameraPositions[2] -= 0.03;
        createMaze(maze, cameraPositions);
    } 
});