#include <algorithm>
#include <cstdint>
#include <cstdlib>
#include <iostream>
#include <optional>
#include <random>
#include <stack>
#include <vector>

inline int index(int row, int col, int N) { return row * N + col; }

class mazeGrid {
private:
    int side;
    int mazeSize;
    int dimentions;
    std::optional <int> _seed;

    std::vector <int> maze;
    std::vector <std::pair <int, int>> directions;

public:
    mazeGrid(int N) {
        dimentions = N;
        if (!validDimentions()) {
            throw std::runtime_error("Invalid maze dimentions");
        }

        side = (2 * N + 1);
        mazeSize = side * side;
        
        maze.assign(mazeSize, 0);

        directions = {
            {0, 2},  // right
            {0, -2}, // left
            {2, 0},  // up
            {-2, 0}  // down
        };

        _seed = std::nullopt;
    }

    void makeMaze() {
        if (!validDimentions()) {
            throw std::runtime_error("Invalid maze dimentions");
        }

        std::mt19937 gen(
            _seed.has_value() ? _seed.value() : std::random_device {} ()
        );

        std::stack <std::pair <int, int>> cellStack;
        cellStack.push({1, 1});
        maze[index(1, 1, side)] = 1;
        
        while (!cellStack.empty()) {
            auto [row, col] = cellStack.top();
            cellStack.pop();

            maze[index(row, col, side)] = 1;

            std::shuffle(directions.begin(), directions.end(), gen);

            for (auto & direction : directions) {
                int discoverRow = row + direction.first;
                int discoverCol = col + direction.second;

                if (
                    discoverCol <= 0 || discoverCol >= side - 1 ||
                    discoverRow <= 0 || discoverRow >= side - 1 ||
                    maze[index(discoverRow, discoverCol, side)]
                ) {
                    continue;
                }

                cellStack.push({row, col});

                int wall = index(row + direction.first / 2, col + direction.second / 2, side);
                maze[wall] = 1;

                maze[index(discoverRow, discoverCol, side)] = 1;
                cellStack.push({discoverRow, discoverCol});
                break;
            }
        }
    }

    void printMaze() {
        for (int i = 0; i < side; i++) {
            for (int j = 0; j < side; j++) {
                if (maze[index(i, j, side)])
                    std::cout << "  ";
                else
                    std::cout << "██";
            }
            std::cout << '\n';
        }
    }

    bool validDimentions() {
        if (dimentions <= 0 || dimentions >= 256)
            return false;
        return true;
    }

    // ==============================
    //            GETTERS
    // ==============================
    int getSide() {
        return side;
    }

    int getMazeSize() {
        return mazeSize;
    }

    int getDimentions() {
        return dimentions;
    }

    std::vector <int> & getMaze() {
        return maze;
    }

    std::vector <std::pair <int, int>> 
        & getDirections() {
        return directions;
    }

    // ==============================
    //            SETTERS
    // ==============================    

    void setSeed(int seed) {
        _seed = seed;
    }
};
