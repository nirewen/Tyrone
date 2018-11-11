import { AbstractPlayer } from '../AbstractPlayer'

export class Player extends AbstractPlayer {
    constructor (user, game, color) {
        super(user, game)
    
        this.color = color
    }

    get label () {
        return [':white_circle:', ':large_blue_circle:', ':red_circle:'][this.color]
    }
}
