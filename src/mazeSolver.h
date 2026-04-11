#pragma once

#include <limits>
#include "mazeGenerator.h"
#include <map>
#include <queue>

class pathFinder {
private:
    int side;
    int goal;
    std::vector <uint8_t> & maze;
    static constexpr std::pair <int, int> directions[] = {
            {0, 1},  // right
            {0, -1}, // left
            {1, 0},  // up
            {-1, 0}  // down
        };

        static constexpr int MAX_SIZE = (2 * 255 + 1) * (2 * 255 + 1);

        int cameFrom[MAX_SIZE];
        int currentCost[MAX_SIZE];
        int expectedCost[MAX_SIZE];

    std::vector <int> 
        reconstructPath (
            int current
        ) 
        {
            std::vector <int> path = {current};
            path.reserve(side);

            // while there's a cell that this one comes from, make the path
            while (cameFrom[current] != -1)
            {
                current = cameFrom[current];
                path.push_back(current);
            }

            std::reverse(path.begin(), path.end());
            return path;
        }

        int heuristic (int row, int col) {
            return abs(row - (side - 2)) +
                   abs(col - (side - 2));
        }

        std::vector <int> aStar () {
            // ==============================
            //         INITIALIZATION        
            // ==============================
            
            for (int i = 0, size = side * side; i < size; i++) {
                cameFrom[i] = -1;
                currentCost[i] = -1;
                expectedCost[i] = std::numeric_limits <int>::max();
            }

            auto pqComp = [this] (
                const int & a, const int & b
            ) {
                return expectedCost[a] > expectedCost[b];
            };

            std::priority_queue <
                int,
                std::vector <int>, 
                decltype(pqComp)
            > openSet(pqComp);

            int startRow = 1;
            int startCol = 1;
            int startIdx = index(startRow, startCol, side);
            openSet.push(startIdx);
            currentCost[startIdx] = 0;
            expectedCost[startIdx] = heuristic(startRow, startCol);

            // ==============================
            //         MAZE SOLVING          
            // ==============================
            while (!openSet.empty()) {
                if (openSet.top() == goal) {
                    return reconstructPath(openSet.top());
                }

                for (auto & [y, x] : directions) {
                    int discoverRow = openSet.top() / side + y;
                    int discoverCol = openSet.top() % side + x;
                    int discoverIdx = index(discoverRow, discoverCol, side);

                    if (discoverCol < 0 || discoverCol >= side || 
                        discoverRow < 0 || discoverRow >= side ||
                        !maze[discoverIdx]) 
                        continue;

                    int score = currentCost[openSet.top()] + 1;

                    int it = currentCost[discoverIdx];
                    int discoverCost = (
                        it != -1
                        ? it : 
                        std::numeric_limits <int>::max());

                    if (score < discoverCost) {
                       cameFrom[discoverIdx] = openSet.top();
                       currentCost[discoverIdx] = score;
                       expectedCost[discoverIdx] = currentCost[discoverIdx] + heuristic(discoverRow, discoverCol);

                        openSet.push(discoverIdx);
                    }
                }
                openSet.pop();
            }
            return {};
        }
    
public:
    pathFinder(mazeGrid & m) : maze(m.getMaze()) {
        side = m.getSide();
        goal = index(side - 2, side - 2, side);
    }

    void solveMaze() {
        std::vector <int> solution = aStar();
        for (auto const & i : solution) {
            maze[i] = 2;
        }
    }

    void printBoard() {
        for (int i = 0; i < side; i++) {
            for (int j = 0; j < side; j++) {
                int idx = index(i, j, side);
                if (!maze[idx]) {
                    std::cout << "██";
                } else if (maze[idx] == 1) {
                    std::cout << "  ";
                } else {
                    std::cout << "..";
                }
            }
            std::cout << '\n';
        }
    }
    // ==============================
    //            GETTERS
    // ==============================
    int getGoal() {
        return goal;
    }

    std::vector <uint8_t> & getMaze() {
        return maze;
    }

    int getSide() {
        return side;
    }
};