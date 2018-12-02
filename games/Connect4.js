import { Player } from './structures/Connect4/Player'
import { Grid } from './structures/Connect4/Grid'
import { Game } from './structures/Game'

export class Connect4 extends Game {
    constructor (opponent) {
        super()

        this.opponent = opponent
        this.holes = new Grid(6, 7)
    }

    addPlayer (member, type) {
        if (!this.players.has(member.id)) {
            let player = new Player(member, this, type)
            this.players.set(member.id, player)

            this.queue.push(player)
            return player
        } else
            return null
    }

    render () {
        let rendered = this.holes.map(r => r.map(c => c.toString()).join(''))

        rendered.push(':one::two::three::four::five::six::seven:')
        return rendered.join('\n')
    }

    play (col, player = this.player) {
        const target = this.holes.slice(0).reverse().map(c => c[col]).find(h => h.color === 0)

        if (target)
            target.claim(player)

        return this.checkWin()
    }

    // TODO: REFACTOR

    checkWin () {
        // check linhas
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.holes[i][j].color === this.holes[i][j + 1].color &&
                    this.holes[i][j].color === this.holes[i][j + 2].color &&
                    this.holes[i][j].color === this.holes[i][j + 3].color &&
                    this.holes[i][j].color !== 0)
                    return this.holes[i][j]
            }
        }

        // check colunas
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.holes[j][i].color === this.holes[j + 1][i].color &&
                    this.holes[j][i].color === this.holes[j + 2][i].color &&
                    this.holes[j][i].color === this.holes[j + 3][i].color &&
                    this.holes[j][i].color !== 0)
                    return this.holes[j][i]
            }
        }

        // check diagonais ->
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.holes[i][j].color === this.holes[i + 1][j + 1].color &&
                    this.holes[i][j].color === this.holes[i + 2][j + 2].color &&
                    this.holes[i][j].color === this.holes[i + 3][j + 3].color &&
                    this.holes[i][j].color !== 0)
                    return this.holes[i][j]
            }
        }

        // check diagonais <-
        for (let i = 0; i < 3; i++) {
            for (let j = 3; j < 7; j++) {
                if (this.holes[i][j].color === this.holes[i + 1][j - 1].color &&
                    this.holes[i][j].color === this.holes[i + 2][j - 2].color &&
                    this.holes[i][j].color === this.holes[i + 3][j - 3].color &&
                    this.holes[i][j].color !== 0)
                    return this.holes[i][j]
            }
        }

        return false
    }
}
