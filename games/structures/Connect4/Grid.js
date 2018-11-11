import { Cell } from './Cell'
import { Matrix } from '../Matrix'

export class Grid extends Matrix {
    constructor (rows, cols) {
        super(rows, cols)

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) 
                this[i][j] = new Cell(0)
        }
    }

    get full () {
        return this.some(c => c.some(h => h.color === 0))
    }

    get freeCols () {
        return this[0].map((c, i) => c.color === 0 && i).filter(i => !!i)
    }
}
