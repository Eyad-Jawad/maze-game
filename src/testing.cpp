// check this out https://www.youtube.com/watch?v=nbFXI9SDfbk&list=PL_dsdStdDXbo-zApdWB5XiF2aWpsqzV55

#include <iostream>
#include <gtest/gtest.h>
#include "maze.h"
#include <vector>

class testingMaze : public ::testing::TestWithParam<int> {};
class testingInvalidMaze : public ::testing::TestWithParam<int> {};

TEST_P(testingMaze, testSide) {
    int N = GetParam();
    mazeGrid m(N);
    EXPECT_EQ(m.getSide(), 2 * N + 1);
}

TEST_P(testingMaze, testSize) {
    int N = GetParam();
    mazeGrid m(N);
    int side = 2 * N + 1;
    EXPECT_EQ(m.getMazeSize(), side * side);
}

TEST_P(testingMaze, testDimentions) {
    int N = GetParam();
    mazeGrid m(N);
    EXPECT_EQ(m.getDimentions(), N);
}

TEST(testingMaze, testMazeValues) {
    mazeGrid m(2);
    m.setSeed(0);
    m.makeMaze();

    std::vector <uint8_t> &maze = m.getMaze();
    std::vector <uint8_t> mazeDimTwoSeedZero = {0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0};

    for(int i = 0, size = maze.size(); i < size; i++) {
        EXPECT_EQ(maze[i], mazeDimTwoSeedZero[i]);
    }
}

TEST_P(testingInvalidMaze, testInvalidDimentions) {
    int invalidN = GetParam();
    EXPECT_THROW(
        {
            mazeGrid m(invalidN);
            m.makeMaze();
        }, 
        std::runtime_error
    );
}

INSTANTIATE_TEST_SUITE_P (
    attributes,
    testingMaze,
    ::testing::Values(1, 2, 3, 34, 234, 255, 99, 10)
);

INSTANTIATE_TEST_SUITE_P (
    invalidInputs, 
    testingInvalidMaze, 
    ::testing::Values(-1, 0, 23232, 256, -23432)
);

int main(int argc, char *argv[]) {
    testing::InitGoogleTest(&argc, argv);

    return RUN_ALL_TESTS();
}
