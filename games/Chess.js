import chess from 'chess'
import { Game } from './structures/Game'
import { Player } from './structures/Chess/Player'
import { Renderer } from './structures/Chess/Renderer'

export class Chess extends Game {
    constructor (opponent, scheme) {
        super()

        this.opponent = opponent
        this.game = chess.createSimple()
        this.game.scheme = scheme
    }
    
    get player () {
        return this.queue[0]
    }
    
    get status () {
        return this.game.getStatus()
    }
    
    get checkInfos () {
        return this.game.game.board
    }
    
    next () {
        this.queue.push(this.queue.shift())
        return this.player.username
    }
    
    addPlayer (member) {
        if (!this.players[member.id]) {
            let player = this.players[member.id] = new Player(member, this)
            this.queue.push(player)
            return player
        } else
            return null
    }
    
    play (src, dest) {
        return this.game.move(src, dest, true)
    }

    render (attacker) {
        return Renderer.render(this.game, attacker)
    }
}
