#include <gtest/gtest.h>
#include "mazeGenerator.h"
#include "mazeSolver.h"

class testingMaze : public ::testing::TestWithParam<int> {};
class testingInvalidMaze : public ::testing::TestWithParam<int> {};

class testingMazeSolver : public ::testing::TestWithParam <int> {};

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

TEST_P(testingMaze, testDimensions) {
    int N = GetParam();
    mazeGrid m(N);
    EXPECT_EQ(m.getDimensions(), N);
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

TEST_P(testingInvalidMaze, testInvalidDimensions) {
    int invalidN = GetParam();
    EXPECT_THROW(
        {
            mazeGrid m(invalidN);
            m.makeMaze();
        }, 
        std::runtime_error
    );
}

TEST_P(testingMazeSolver, testSolveability) {
    int N = GetParam();
    mazeGrid m(N);
    m.makeMaze();

    pathFinder s(m);
    s.solveMaze();
    std::vector <uint8_t> solvedMaze = s.getMaze();

    EXPECT_FALSE(solvedMaze.empty());
}

TEST_P(testingMazeSolver, testSolveabilityExetreme) {
    int N = GetParam();
    for (int _ = 0; _ < 10; _++) {
        mazeGrid m(N);
        m.makeMaze();
    
        pathFinder s(m);
        s.solveMaze();
        std::vector <uint8_t> solvedMaze = s.getMaze();
    
        EXPECT_FALSE(solvedMaze.empty());
    }
}

TEST_P(testingMazeSolver, testSide) {
    int N = GetParam();
    mazeGrid m(N);
    m.makeMaze();
    pathFinder s(m);

    int side = 2 * N + 1;

    EXPECT_EQ(s.getSide(), side);
}

TEST_P(testingMazeSolver, testGoal) {
    int N = GetParam();
    mazeGrid m(N);
    m.makeMaze();

    int side = 2 * N + 1;
    pathFinder s(m);
    pair g;
    g.x = g.y = side - 2;

    EXPECT_EQ(g, s.getGoal());
}

TEST(testingMazeSolver, testSolvingSeedeed) {
    std::vector <uint8_t> mazeDimTwoSeedZero = {0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 2, 0, 0, 1, 1, 2, 0, 0, 0, 0, 0, 0};

    mazeGrid m(2);
    m.setSeed(0);
    m.makeMaze();

    pathFinder s(m);
    s.solveMaze();
    std::vector <uint8_t> solvedMaze = s.getMaze();

    for (int i = 0, size = mazeDimTwoSeedZero.size(); i < size; i++) {
        EXPECT_EQ(mazeDimTwoSeedZero[i], solvedMaze[i]);
    }
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

INSTANTIATE_TEST_SUITE_P (
    solving,
    testingMazeSolver,
    ::testing::Values(1, 2, 10, 15, 20, 50, 100, 200, 255)
);

int main(int argc, char *argv[]) {
    testing::InitGoogleTest(&argc, argv);

    return RUN_ALL_TESTS();
}
