#pragma once

#include <algorithm>
#include <array>
#include <fstream>
#include <iostream>
#include <limits>
#include <map>
#include <optional>
#include <queue>
#include <random>
#include <stdexcept>
#include <string>

enum Cell : uint8_t {
    WALL,
    PATH,
    SOLUTION
};

inline auto index(int row, int col, int N) -> int { return row * N + col; }