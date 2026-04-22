import createMazeModule from "./maze.js";

const index = (row, col, N) => { return row * N + col; }

class MazeGenerator {
    constructor() {
        this._mazeSize = null;
        this._maze2D   = null;
        this._side     = null;
    
        this._maze3D   = null;
    }
    
    async init() {
        this.__Module   = await createMazeModule();   
    }

    _make2DMaze() {
        const ptr = this.__Module._run(10);
        this._mazeSize = this.__Module._size(10);
        this._maze2D = new Uint8Array(
            this.__Module.HEAPU8.buffer, 
            ptr, 
            this._mazeSize
        );
        this._side = Math.sqrt(this._mazeSize);
    }

    make3DMaze(blockSize) {
        this._make2DMaze();

        const scale = 1 / (this._side * blockSize) + 0.5;
        this._maze3D = [];

        for(let y = 0; y < this._side; y++) {
            for(let x = 0; x < this._side; x++) {
                const startX = (x * blockSize) * scale;
                const startY = (y * blockSize) * scale;
                const endX   = (x * blockSize + blockSize) * scale;
                const endY   = (y * blockSize + blockSize) * scale;

                const down = [
                    startX, 0, startY,
                    endX,   0, startY,
                    startX, 0, endY,

                    endX,   0, startY,
                    startX, 0, endY,                
                    endX,   0, endY
                ];

                this._maze3D.push(...down);
                if (this._maze2D[index(y, x, this._side)] === 1) continue;

                const left = [
                    startX, 0,         startY, 
                    endX,   0,         startY, 
                    startX, blockSize, startY,

                    endX,   0,         startY, 
                    startX, blockSize, startY,
                    endX,   blockSize, startY,
                ];

                const near = [
                    startX, 0,         startY,
                    startX, 0,         endY,
                    startX, blockSize, startY,

                    startX, 0,         endY,
                    startX, blockSize, startY,
                    startX, blockSize, endY
                ];

                const far = [
                    endX, 0,         startY,
                    endX, 0,         endY,
                    endX, blockSize, startY,

                    endX, 0,         endY,
                    endX, blockSize, startY,
                    endX, blockSize, endY
                ]

                const right = [
                    startX, 0,         endY,
                    endX,   0,         endY,
                    startX, blockSize, endY,

                    endX,   0,         endY,
                    startX, blockSize, endY,
                    endX,   blockSize, endY
                ];

                const up = [
                    startX, blockSize, startY,
                    endX,   blockSize, startY,
                    startX, blockSize, endY,

                    endX,   blockSize, startY,
                    startX, blockSize, endY,
                    endX,   blockSize, endY
                ];

                this._maze3D.push(...right);
                this._maze3D.push(...left);
                this._maze3D.push(...up);
                this._maze3D.push(...down);
                this._maze3D.push(...near);
                this._maze3D.push(...far);
            }
        }
        return this._maze3D;
    }

    get mazeSize() {
        if (this._mazeSize === null) this._make2DMaze();
        return this._mazeSize;
    }

    get maze2D() {
        if (this._maze2D === null) this._make2DMaze();
        return this._maze2D;
    }

    get side() {
        if (this._side === null) this._make2DMaze();
        return this._side;
    }

    get maze3D() {
        if (this._maze3D === null) this.make3DMaze();
        return this._maze3D;
    }
}

export { MazeGenerator };