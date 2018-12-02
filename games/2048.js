import { Game } from './structures/Game'
import { Grid } from './structures/2048/Grid'
import { AbstractPlayer as Player } from './structures/AbstractPlayer'

export class G2048 extends Game {
    constructor (score = 0, grid) {
        super()

        this.score = score
        this.grid = grid || this.blankGrid
    }

    addPlayer (member) {
        if (!this.players.has(member.id)) {
            let player = new Player(member, this)
            this.players.set(member.id, player)

            this.queue.push(player)
            return player
        } else
            return null
    }

    move (direction) {
        let past = this.copy(this.grid)
        for (let row = 0; row < this.grid.rows; row++) {
            switch (direction) {
                case '⬅':
                    this.grid[row] = this.operate(this.grid[row].reverse()).reverse()
                    break
                case '⬆':
                    this.grid = this.transpose(this.grid)
                    this.grid[row] = this.operate(this.grid[row].reverse()).reverse()
                    this.grid = this.transpose(this.grid)
                    break
                case '⬇':
                    this.grid = this.transpose(this.grid)
                    this.grid[row] = this.operate(this.grid[row])
                    this.grid = this.transpose(this.grid)
                    break
                case '➡':
                    this.grid[row] = this.operate(this.grid[row])
                    break
            }
        }
        if (this.compare(past, this.grid))
            this.grid.spawnTile()

        return this.grid
    }

    operate (row) {
        row = this.slide(row)
        row = this.combine(row)
        row = this.slide(row)
        return row
    }

    slide (row) {
        row = row.filter(x => x)
        let missing = 4 - row.length

        let zeros = Array(missing).fill(0)
        row = zeros.concat(row)
        return row
    }

    combine (row) {
        for (let i = 3; i >= 1; i--) {
            let a = row[i]

            let b = row[i - 1]
            if (a === b) {
                row[i] = a + b
                this.score += row[i]
                row[i - 1] = 0
            }
        }
        return row
    }

    copy (grid) {
        let temp = this.blankGrid

        for (let i = 0; i < 4; i++)
            for (let j = 0; j < 4; j++)
                temp[i][j] = grid[i][j]

        return temp
    }

    transpose (grid) {
        let temp = new Grid(grid.rows, grid.cols)

        for (let i = 0; i < grid.rows; i++)
            for (let j = 0; j < grid.cols; j++)
                temp[i][j] = grid[j][i]

        return temp
    }

    reset () {
        this.score = 0
        this.grid = this.blankGrid
    }

    compare (a, b) {
        for (let i = 0; i < 4; i++)
            for (let j = 0; j < 4; j++)
                if (a[i][j] !== b[i][j])
                    return true

        return false
    }

    get blankGrid () {
        return new Grid(4, 4)
    }
}
