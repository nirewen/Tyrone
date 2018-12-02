export class Game {
    constructor () {
        this.players = new Map()
        this.queue = []
        this.started = false
    }

    get player () {
        return this.queue[0]
    }

    async next () {
        this.queue.push(this.queue.shift())
        return this.player.username
    }
}
