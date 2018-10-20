import {Cell} from './Cell';
import {Matrix} from '../Matrix';

export class Grid extends Matrix {
    // ┌          ┐
    // │ 00 01 02 │
    // │ 10 11 12 │
    // │ 20 21 22 │
    // └          ┘
    
    constructor(rows, cols) {
        super(rows, cols);

        for (let i = 0; i < this.rows; i++)
            for (let j = 0; j < this.cols; j++)
                this[i][j] = new Cell(i, j);
    }

    get freeSpots() {
        return this.reduce((arr, r) => {
            arr.push(...r.filter(c => !c.occupied));
        }, []);
    }

    get corners() {
        return [
            this[0][0], this[0][2],
            this[2][0], this[2][2]
        ];
    }
    
    get borders() {
        return [
            this[0][1],
            this[1][0],
            this[2][1],
            this[1][2]
        ];
    }
    
    get triangles() {
        return [
            // pontas 1 e 9
            [this[0][0], this[0][2], this[2][2]],
            [this[0][0], this[2][0], this[2][2]],

            // pontas 3 e 7
            [this[2][0], this[0][0], this[0][2]],
            [this[2][0], this[2][2], this[0][2]],

            // bordas com pontas
            [this[1][2], this[2][2], this[2][1]],
            [this[1][2], this[0][2], this[0][1]],
            [this[1][0], this[2][0], this[2][1]],
            [this[0][1], this[0][0], this[1][0]],

            // bordas e pontas
            [this[0][2], this[2][2], this[2][1]],
            [this[1][2], this[2][2], this[2][0]],
            
            [this[2][2], this[0][2], this[0][1]],
            [this[0][0], this[0][2], this[1][2]],
            
            [this[0][0], this[2][0], this[2][1]],
            [this[1][0], this[2][0], this[2][2]],
            
            [this[0][1], this[0][0], this[2][0]],
            [this[1][0], this[0][0], this[0][2]]
        ];
    }
    
    get center() {
        return this[1][1];
    }
    
    get randomSpot() {
        let options = this.freeSpots;
        if (options.length > 0)
            return options[Math.floor(options.length * Math.random())];

        return null;
    }

    get winPatterns() {
        return [
            // linhas
            [this[0][0], this[0][1], this[0][2]],
            [this[1][0], this[1][1], this[1][2]],
            [this[2][0], this[2][1], this[2][2]],
            // colunas
            [this[0][0], this[1][0], this[2][0]],
            [this[0][1], this[1][1], this[2][1]],
            [this[0][2], this[1][2], this[2][2]],
            // diagonais
            [this[0][0], this[1][1], this[2][2]],
            [this[2][0], this[1][1], this[0][2]],
        ];
    }
}