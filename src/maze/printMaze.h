#pragma once

#include "inc.h"

void printBoard(const std::vector <uint8_t> & maze, const int side) {
    for (int i = 0; i < side; i++) {
        for (int j = 0; j < side; j++) {
            int idx = index(i, j, side);
            if (maze[idx] == WALL) {
                std::cout << "██";
            } else if (maze[idx] == PATH) {
                std::cout << "  ";
            } else {
                std::cout << "..";
            }
        }
        std::cout << '\n';
    }
}