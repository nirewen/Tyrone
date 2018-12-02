import { Collection } from 'discord.js'

export class GameManager extends Collection {
    constructor (...games) {
        super()

        for (let game of games)
            this.set(game, new GameManager())
    }

    findGame (type, id) {
        return this.get(type).find(game => game.players && game.players.has(id))
    }

    findGameKey (type, id) {
        return this.get(type).findKey(game => game.players && game.players.has(id))
    }

    set (key, game) {
        super.set(key, game)
        return game
    }
}
