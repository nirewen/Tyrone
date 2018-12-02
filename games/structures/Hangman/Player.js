import { AbstractPlayer } from '../AbstractPlayer'

export class Player extends AbstractPlayer {
    constructor (user, game) {
        super(user, game)

        this.guesses = []
        this.score = 0
    }
}
