/*
    Add comments,
    and logs.

    check emscripten
    --Eyad
*/
#include <stdexcept>
#include <string>
#include "maze.h"
#include "pathFinder.h"

int main(int argc, char *argv[]) {
    if (argc != 2) {
        std::cout << "Usage: ./main.exe MazeDims\n";
        return 1;
    }

    int N = std::stoi(argv[1]); // turn the arg of mazedims into an int
    mazeGrid mazeGenerator = mazeGrid(N);

    mazeGenerator.makeMaze();
    mazeGenerator.printMaze();

    std::cout << "\n\n";

    pathFinder mazeSolver = pathFinder(mazeGenerator);
    mazeSolver.printBoard();
    
    return 0;
}