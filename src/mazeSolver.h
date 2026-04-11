#pragma once

#include <limits>
#include "mazeGenerator.h"
#include <map>
#include <queue>

struct pair {
    int x, y;

    // for the map
    bool operator < (const pair & other) const {
        return std::tie(x, y) < std::tie(other.x, other.y);
    }

    bool operator == (const pair & other) const {
        return x == other.x && y == other.y;
    }
};

inline int index(pair cell, int N) { return cell.y * N + cell.x; }

class pathFinder {
private:
    int side;
    pair goal;
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

        int heuristic (pair current) {
            return abs(current.x - goal.x) +
                   abs(current.y - goal.y);
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
                const pair & a, const pair & b
            ) {
                return expectedCost[index(a, side)] > expectedCost[index(b, side)];
            };

            std::priority_queue <
                pair, std::vector <pair>, 
                decltype(pqComp)
            > openSet(pqComp);

            pair start;
            start.x = start.y = 1;
            openSet.push(start);
            currentCost[index(start, side)] = 0;
            expectedCost[index(start, side)] = heuristic(start);

            // ==============================
            //         MAZE SOLVING          
            // ==============================
            while (!openSet.empty()) {
                pair current = openSet.top();
                if (current == goal) {
                    return reconstructPath(index(current, side));
                }

                openSet.pop();
                for (auto & [y, x] : directions) {
                    pair discoverCell;
                    discoverCell.x = current.x + x;
                    discoverCell.y = current.y + y;

                    if (discoverCell.x < 0 || discoverCell.x >= side || 
                        discoverCell.y < 0 || discoverCell.y >= side ||
                        !maze[index(discoverCell, side)]) 
                        continue;

                    int score = currentCost[index(current, side)] + 1;

                    int it = currentCost[index(discoverCell, side)];
                    int discoverCost = (
                        it != -1
                        ? it : 
                        std::numeric_limits <int>::max());

                    if (score < discoverCost) {
                       cameFrom[index(discoverCell, side)] = index(current, side);
                       currentCost[index(discoverCell, side)] = score;
                       expectedCost[index(discoverCell, side)] = currentCost[index(discoverCell, side)] + heuristic(discoverCell);

                        openSet.push(discoverCell);
                    }
                }
            }
            return {};
        }
    
public:
    pathFinder(mazeGrid & m) : maze(m.getMaze()) {
        side = m.getSide();
        goal.x = goal.y = side - 2;
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
    pair getGoal() {
        return goal;
    }

    std::vector <uint8_t> & getMaze() {
        return maze;
    }

    int getSide() {
        return side;
    }
};