import { CollisionPerventer } from "../objects/collisionPerventer";
import { MazeGenerator } from "../objects/maze";

const invalidOutsideMaze = [
    [0, 0, 0],
    [-1, 1, -1],
    [15, 1, 15],
    [1.666666666666667, 1.0, 1.666666666666667],
    [144.324324242343241749803223479811714297381271294132746127, 1, 144.324324242343241749803223479811714297381271294132746127]
];

test.each(invalidOutsideMaze)("Invalid position of outside the map", async (x, z, y) => {
    const mazeObject = new MazeGenerator();
    await mazeObject.init();
    mazeObject._make2DMaze(1);

    const collisionPerventer = new CollisionPerventer();
    collisionPerventer.inputNewMaze(mazeObject.maze2D, 1);
    expect(collisionPerventer.check([x, z, y])).toBe(false);
});

const validInsideMazePositions = [
    [1.0, 1.0, 1.0],
    [1.45401381910052785, 1, 1.5705267261387434],
    [1.5490764054402179, 1, 1.1869406754800147],
    [1.4906987300545256, 1, 1.42340904536913615],
    [1.666666666666666, 1.0, 1.666666666666666]
];

test.each(validInsideMazePositions)("Valid inside maze positions", async (x, z, y) => {
    const mazeObject = new MazeGenerator();
    await mazeObject.init();
    mazeObject._make2DMaze(1);

    const collisionPerventer = new CollisionPerventer();
    collisionPerventer.inputNewMaze(mazeObject.maze2D, 1);
    expect(collisionPerventer.check([x, z, y])).toBe(true);
});