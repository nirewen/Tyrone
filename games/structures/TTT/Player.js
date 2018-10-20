import {AbstractPlayer} from '../AbstractPlayer';

export class Player extends AbstractPlayer {
    constructor(user, game, type) {
        super(user, game);

        this.type = type;
    }
    
    play(position) {
        this.game.play(position, this);
    }
    
    get label() {
        return `:${this.type}:`;
    }
}