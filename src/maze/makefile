dependincies = mazeGenerator.h mazeSolver.h inc.h
verArgs = -std=c++20
perArgs = -O2 -march=native # Performance Arguments
warArgs = -Wall -Wextra -Wpedantic # Extra Warnings Arguments


all: app tests

app: $(dependincies)
	g++ main.cpp $(verArgs) $(perArgs) $(warArgs) -o app

tests: $(dependincies)
	g++ testing.cpp $(verArgs) $(perArgs) $(warArgs) -lgtest -pthread -o tests

clean:
	rm -f app tests