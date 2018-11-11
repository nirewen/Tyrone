export class Matrix extends Array {
    constructor (rows, cols) {
        super(rows)

        this.rows = rows
        this.cols = cols
    }

    populate (cb) {
        for (let i = 0; i < this.rows; i++) {
            this[i] = []
            for (let j = 0; j < this.cols; j++)
                this[i][j] = cb(i, j)
        }
    }
}
