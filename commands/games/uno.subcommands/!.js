import { Util } from 'discord.js'

export async function run (msg) {
    let game = this.bot.games.get('uno').get(msg.channel.id)
    if (game && game.started && game.players.has(msg.author.id) && game.players.get(msg.author.id).hand.length === 1) {
        let p = game.players.get(msg.author.id)
        
        if (!p.called) {
            p.called = true
            return msg.channel.send(`**UNO!!** ${Util.escapeMarkdown(p.user.username)} tem só uma carta!`)
        }
        else
            return msg.send(`Você já disse UNO!`)
    }
}
