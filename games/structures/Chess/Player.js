import { AbstractPlayer } from '../AbstractPlayer'

export class Player extends AbstractPlayer {
    constructor (user, game) {
        super()
        
        this.user = user
        this.game = game
        this.id = user.id
    }
    
    play (src, dest) {
        return this.game.play(src, dest)
    }
}
