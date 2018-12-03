import { Util } from 'discord.js'

export const aliases = ['contra-uno', 'dedurar']
export async function run (msg) {
    let game = this.bot.games.get('uno').get(msg.channel.id)

    if (game && game.started && game.players.has(msg.author.id)) {
        let baddies = game.queue.filter(player => player.hand.length === 1 && !player.called && !player.immune)

        for (let player of baddies)
            player.called = true

        game.dealAll(2, baddies)

        if (baddies.length > 0)
            return msg.channel.send(`Uh oh! ${baddies.map(p => `**${Util.escapeMarkdown(p.user.username)}**`).join(', ')}, você não disse UNO! Pegue 2 cartas!`)
        else
            return msg.send('Não tem ninguém pra dedurar!')
    }
    else
        return msg.send('Você nem tá nem no jogo')
}
