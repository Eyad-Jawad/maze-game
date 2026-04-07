/*
    Add comments,
    and logs.
    --Eyad
*/
#include <stdexcept>
#include <string>
#include "maze.h"

int main(int argc, char *argv[]) {
    if (argc != 2) {
        std::cout << "Usage: ./main.exe MazeDims\n";
        return 1;
    }

    int N = std::stoi(argv[1]); // turn the arg of mazedims into an int
    mazeGrid maze = mazeGrid(N);
    maze.makeMaze();

    maze.printMaze();
    
    return 0;
}

