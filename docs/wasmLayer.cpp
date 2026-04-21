#include "../maze/mazeGenerator.h"

std::vector <uint8_t> maze;

extern "C" {
    uint8_t * run(int dimensions) {
        auto m = mazeGrid (dimensions);
        m.makeMaze();
        maze = m.getMaze();
        return maze.data();
    }

    int size(int dimensions) {
        return (2 * dimensions + 1) * (2 * dimensions + 1);
    }
}