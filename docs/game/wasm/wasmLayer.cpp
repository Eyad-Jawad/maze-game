#include "../../../project/maze/mazeGenerator.h"

std::vector <uint8_t> maze;

extern "C" {
    uint8_t * run(int dimensions) {
        mazeGrid m(dimensions);
        m.makeMaze();
        maze = m.getMaze();
        return maze.data();
    }

    int size(int dimensions) {
        return (2 * dimensions + 1) * (2 * dimensions + 1);
    }

    uint8_t * setSeed(int dimensions, int seed) {
        mazeGrid m(dimensions);
        m.setSeed(seed);
        m.makeMaze();
        maze = m.getMaze();
        return maze.data();
    }
}