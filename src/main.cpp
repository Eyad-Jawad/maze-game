/*
    Add comments,
    and logs.

    check emscripten
    --Eyad
*/
#include <fstream>
#include <stdexcept>
#include <string>
#include "maze.h"
#include "pathFinder.h"

void savePPM(const std::vector <uint8_t> & maze, int side);

int main(int argc, char *argv[]) {
    if (argc != 2) {
        std::cout << "Usage: ./main.exe MazeDims\n";
        return 1;
    }

    int N = std::stoi(argv[1]); // turn the arg of mazedims into an int
    mazeGrid mazeGenerator = mazeGrid(N);
    mazeGenerator.makeMaze();

    pathFinder mazeSolver = pathFinder(mazeGenerator);
    mazeSolver.solveMaze();

    savePPM(mazeSolver.getMaze(), mazeSolver.getSide());
    
    return 0;
}

void savePPM(const std::vector <uint8_t> & maze, int side) {
    std::ofstream mazeImage("mazeImage.ppm", std::ios::binary);

    mazeImage << "P6\n" << side << ' ' << side << "\n255\n";

    for (auto const & cell : maze) {
        uint8_t r, g, b;

        if (cell == 0) {
            r = g = b = 0;
        } else if (cell == 1) {
            r = g = b = 255;
        } else {
            r = b = 0;
            g = 255;
        }

        mazeImage.write((char*)&r, 1);
        mazeImage.write((char*)&g, 1);
        mazeImage.write((char*)&b, 1);
    }
}