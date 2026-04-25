class CollisionPerventer {
    inputNewMaze(maze2D, blockSize) {
        this.lastCoordinates = null;
        this.blockSize = blockSize;
        this.maze2D = maze2D;
        this.side = Math.sqrt(maze2D.length);
        this.reScale = 1 / (1 / (this.side * blockSize) + 0.5);
    }

    index(row, col) {
        const x = Math.floor(row * this.reScale);
        const y = Math.floor(col * this.reScale);
        return y * this.side + x;
    }

    check(cameraPositions) {
        const idx = this.index(cameraPositions[0], cameraPositions[2]);

        if (this.lastCoordinates === null) {
            this.lastCoordinates = [...cameraPositions];
            return true;            
        }

        if (
            cameraPositions[0] < 0 || 
            cameraPositions[2] < 0 ||
            Math.floor(cameraPositions[0] * this.reScale) >= this.side ||
            Math.floor(cameraPositions[2] * this.reScale) >= this.side ||
            idx >= this.maze2D.length
        ) 
            return true;

        if (this.maze2D[idx] === 0) return false
        else this.lastCoordinates = [...cameraPositions];
        return true
    }
}

export { CollisionPerventer };