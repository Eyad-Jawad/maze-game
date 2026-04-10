#pragma once

#include "mazeGenerator.h"
#include <map>
#include <queue>

struct pair {
    int x, y;

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
    std::vector <uint8_t> maze;
    std::vector <std::pair <int, int>> directions;

    std::vector <pair> 
        reconstructPath (
            pair &current, 
            std::map <pair, pair> &cameFrom
        ) 
        {
            std::vector <pair> keys;
            std::vector <pair> path = {current};
            keys.reserve(cameFrom.size());

            for (auto & e : cameFrom) {
                keys.push_back(e.first);
            }

            while (std::find(
                    keys.begin(), 
                    keys.end(), 
                    current) != keys.end())
            {
                current = cameFrom[current];
                path.insert(path.begin(), current);
            }

            return path;
        }

        int heuristic (pair current) {
            return abs(current.x - goal.x) +
                   abs(current.y - goal.y);
        }

        std::vector <pair> aStar () {

            std::map <pair, pair> cameFrom;
            std::map <pair, int> currentCost;
            std::map <pair, int> expectedCost;
            
            auto pqComp = [&expectedCost] (
                const pair & a, const pair & b
            ) {
                return expectedCost[a] > expectedCost[b];
            };

            std::priority_queue <
                pair, std::vector <pair>, 
                decltype(pqComp)
            > openSet(pqComp);

            pair start;
            start.x = start.y = 1;
            openSet.push(start);
            currentCost[start] = 0;
            expectedCost[start] = heuristic(start);

            while (!openSet.empty()) {
                pair current = openSet.top();
                if (current == goal) {
                    return reconstructPath(current, cameFrom);
                }

                openSet.pop();
                for (auto & [y, x] : directions) {
                    pair discoverCell;
                    discoverCell.x = current.x + x;
                    discoverCell.y = current.y + y;

                    if (discoverCell.x < 0 || discoverCell.x >= side || 
                        discoverCell.y < 0 || discoverCell.y >= side) 
                        continue;

                    if(!maze.at(index(discoverCell, side))) continue;

                    int score = currentCost[current] + 1;

                    auto it = currentCost.find(discoverCell);
                    int discoverCost = (
                        it != currentCost.end()) 
                        ? it->second : 
                        std::numeric_limits <int>::max();

                    if (score < discoverCost) {
                       cameFrom[discoverCell] = current;
                       currentCost[discoverCell] = score;
                       expectedCost[discoverCell] = currentCost[discoverCell] + heuristic(discoverCell);

                        openSet.push(discoverCell);
                    }
                }
            }
            return {};
        }
    
public:
    pathFinder(mazeGrid &m) {
        maze = m.getMaze();
        side = m.getSide();
        goal.x = goal.y = side - 2;
        directions = {
            {0, 1},  // right
            {0, -1}, // left
            {1, 0},  // up
            {-1, 0}  // down
        };
    }

    void solveMaze() {
        auto solution = aStar();
        for (auto const & p : solution) {
            int idx = index(p, side);
            maze[idx] = 2;
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