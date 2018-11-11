export class AbstractPlayer {
    constructor (user, game) {
        this.user = user
        this.game = game
        this.id = user.id
    }
}
