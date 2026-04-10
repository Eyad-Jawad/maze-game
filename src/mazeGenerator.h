#pragma once

#include <algorithm>
#include <iostream>
#include <optional>
#include <random>

inline int index(int row, int col, int N) { return row * N + col; }

class mazeGrid {
private:
    int side;
    int mazeSize;
    int dimensions;
    std::optional <int> _seed;

    std::vector <uint8_t> maze;
    std::vector <std::pair <int, int>> directions;

public:
    mazeGrid(int N) {
        dimensions = N;
        validDimensions();

        side = (2 * N + 1); // couting the walls
        mazeSize = side * side;
        
        maze.assign(mazeSize, 0);

        directions = {
            {0, 2},  // right
            {0, -2}, // left
            {2, 0},  // up
            {-2, 0}  // down
        };

        _seed = std::nullopt; // for seedded mazes (testing)
    }

    void makeMaze() {
        validDimensions(); // raise an error if they are not valid

        // ==============================
        //         INITIALIZATION        
        // ==============================
        std::mt19937 gen(
            _seed.has_value() ? _seed.value() : std::random_device {} ()
        );

        std::vector <std::pair <int, int>> cellStack;
        cellStack.push_back({1, 1});
        maze[index(1, 1, side)] = 1;
        
        // ==============================
        //         MAZE GENERATION       
        // ==============================
        while (!cellStack.empty()) {
            auto [row, col] = cellStack.back();
            cellStack.pop_back();

            std::shuffle(directions.begin(), directions.end(), gen);

            // choose a random direction from your current cell
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

                cellStack.push_back({row, col}); 

                // collapse the wall between your current cell and this cell
                int wall = index(row + direction.first / 2, col + direction.second / 2, side);
                maze[wall] = 1;

                // mark this cell as visited (path)
                maze[index(discoverRow, discoverCol, side)] = 1;
                cellStack.push_back({discoverRow, discoverCol});
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

    void validDimensions() {
        if (dimensions <= 0)
            throw std::runtime_error("Invalid maze dimensions: Maze dimensions less than 1");
        else if (dimensions >= 256)
            throw std::runtime_error("Invalid maze dimensions: Maze size too big (bigger than 255)");
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

    int getDimensions() {
        return dimensions;
    }

    std::vector <uint8_t> & getMaze() {
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
