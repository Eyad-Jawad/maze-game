import { MazeGenerator } from "../objects/maze.js";
import fs from 'fs'
import { pathToFileURL } from "url";

/* boilerplate
test("", => () {
    expect().toBe();
});
*/

test("2D seeded maze generation", async () => {
    const mazeObject = new MazeGenerator();
    await mazeObject.init();
    mazeObject._make2DMaze(2, 0);

    let mazeDimTwoSeedZero = [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0];
    const maze2D = mazeObject.maze2D;

    expect([...maze2D]).toEqual(mazeDimTwoSeedZero);
});

test("3D seeded maze generation", async () => {
    const mazeObject = new MazeGenerator();
    await mazeObject.init();
    
    const fileUrl = new URL("maze3DDimTwoSeedZero.json", import.meta.url);
    const temp = fs.readFileSync(fileUrl, "utf-8");
    const maze3DDimTwoSeedZero = JSON.parse(temp);
    
    const maze3D = mazeObject.make3DMaze(1, 2, 0);
    expect(maze3D).toEqual(maze3DDimTwoSeedZero);
});

const validMazeDimensions = [
    1, 2, 5, 10, 25, 50, 100, 200, 255
];

test.each(validMazeDimensions)("No error when valid maze dimensions are input", async (dimensions) => {
    const mazeObject = new MazeGenerator();
    await mazeObject.init();

    expect(() => {
        mazeObject.make3DMaze(1, dimensions);
    }).not.toThrow();
});

test.each(validMazeDimensions)("Maze side value", async (dimensions) => {
    const mazeObject = new MazeGenerator();
    await mazeObject.init();
    mazeObject._make2DMaze(dimensions);
    expect(mazeObject.side).toEqual(2 * dimensions + 1);
});

test.each(validMazeDimensions)("Maze size value", async (dimensions) => {
    const mazeObject = new MazeGenerator();
    await mazeObject.init();
    mazeObject._make2DMaze(dimensions);
    expect(mazeObject.mazeSize).toEqual((2 * dimensions + 1) ** 2);
});

const invalidMazeDimensions = [
    -1, 0, 256, 1000, -20, 0.1
];

test.each(invalidMazeDimensions)("Error when invalid maze dimensions are inputs", async (dimensions) => {
    const mazeObject = new MazeGenerator();
    await mazeObject.init();

    expect(() => {
        mazeObject.make3DMaze(1, dimensions);
    }).toThrow();
});

