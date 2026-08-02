/*
    Add logs.
    --Eyad
*/

#include "inc.h"
#include "mazeGenerator.h"
#include "mazeSolver.h"
#include "printMaze.h"

void savePPM(const std::vector <uint8_t> & maze, int side);

auto main(int argc, char *argv[]) -> int {
    if (argc != 2) {
        std::cout << "Usage: ./app MazeDimensions\n";
        return 1;
    }

    int N = std::stoi(argv[1]); // turn the arg of mazedims into an int
    mazeGrid mazeGenerator = mazeGrid(N); // pass the dimensions
    mazeGenerator.makeMaze();

    auto mazeSolver = pathFinder(mazeGenerator);
    mazeSolver.solveMaze();

    savePPM(mazeSolver.getMaze(), mazeSolver.getSide());
    printBoard(mazeGenerator.getMaze(), mazeGenerator.getSide());
    
    return 0;
}

void savePPM(const std::vector <uint8_t> & maze, int side) {
    std::ofstream mazeImage("./mazeImage.ppm", std::ios::binary);

    mazeImage << "P6\n" << side << ' ' << side << "\n255\n";

    for (auto const & cell : maze) {
        uint8_t r, g, b;

        if (cell == WALL) {
            r = g = b = 0;
        } else if (cell == PATH) {
            r = g = b = 255;
        } else {
            r = b = 0;
            g = 255;
        }

        mazeImage.write(reinterpret_cast<char*>(&r), 1);
        mazeImage.write(reinterpret_cast<char*>(&g), 1);
        mazeImage.write(reinterpret_cast<char*>(&b), 1);
    }
}