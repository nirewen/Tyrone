import { Matrix } from '../Matrix'
import { emojis } from './emojis'

export class Grid extends Matrix {
    constructor (rows, cols) {
        super(rows, cols)

        this.populate(() => 0)
    }

    spawnTile () {
        let options = []

        for (let i = 0; i < this.rows; i++)
            for (let j = 0; j < this.cols; j++)
                if (this[i][j] === 0)
                    options.push({ i, j })

        if (options.length > 0) {
            let { i, j } = options[Math.floor(options.length * Math.random())]
            this[i][j] = Math.random() > 0.1 ? 2 : 4
            return this[i][j]
        }
    }

    // TODO: REFACTOR

    get over () {
        for (let i = 0; i < this.rows; i++)
            for (let j = 0; j < this.cols; j++) {
                if (this[i][j] === 0)
                    return false

                if (i !== 3 && this[i][j] === this[i + 1][j])
                    return false

                if (j !== 3 && this[i][j] === this[i][j + 1])
                    return false
            }

        return true
    }

    get won () {
        for (let i = 0; i < this.rows; i++)
            for (let j = 0; j < this.cols; j++)
                if (this[i][j] === 2048)
                    return true

        return false
    }

    render () {
        return this.map(row => {
            return row.map(k => emojis[k]).join('')
        }).join('\n')
    }
}
