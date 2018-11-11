export class Matrix extends Array {
    constructor (rows, cols) {
        super(rows)

        this.rows = rows
        this.cols = cols

        this.fill([])
    }
}
