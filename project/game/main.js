import createMazeModule from "./maze.js";

const Module = await createMazeModule();

const ptr = Module._run(3);
const mazeSize = Module._size(3);
const maze = new Uint8Array(Module.HEAPU8.buffer, ptr, mazeSize);
