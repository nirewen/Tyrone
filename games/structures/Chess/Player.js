import { AbstractPlayer } from '../AbstractPlayer'

export class Player extends AbstractPlayer {
    constructor (user, game) {
        super(user, game)

        this.user = user
        this.game = game
        this.id = user.id
    }

    play (src, dest) {
        return this.game.play(src, dest)
    }

    toString () {
        return this.user
    }
}
