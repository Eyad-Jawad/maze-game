class CollisionPerventer {
    inputNewMaze(maze2D, blockSize) {
        this.lastCoordinates = [0.9, 1.0, 0.9];
        this.blockSize = blockSize;
        this._maze2D = maze2D;
        this.side = Math.sqrt(maze2D.length);
        this.reScale = 1 / (1 / (this.side * blockSize) + 0.5);
    }

    index(row, col) {
        const x = Math.floor(row * this.reScale);
        const y = Math.floor(col * this.reScale);
        return y * this.side + x;
    }

    check(cameraPositions) {
        const offset = 0.15;
        const tests = [
            [cameraPositions[0], cameraPositions[2]],
            [cameraPositions[0] + offset, cameraPositions[2]],
            [cameraPositions[0] - offset, cameraPositions[2]],
            [cameraPositions[0], cameraPositions[2] + offset],
            [cameraPositions[0], cameraPositions[2] - offset]
        ];

        for (const [x, z] of tests) {
            const idx = this.index(x, z);
    
            // outside the maze
            if (
                x < 0 || z < 0 ||
                Math.floor(x * this.reScale) >= this.side ||
                Math.floor(z * this.reScale) >= this.side ||
                idx >= this._maze2D.length ||
                this._maze2D[idx] === 0
            ) 
                return false;
        }

        this.lastCoordinates = [...cameraPositions];
        return true
    }
}

export { CollisionPerventer };