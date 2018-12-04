import { MessageAttachment, MessageEmbed, Util } from 'discord.js'

export const desc = 'Sai de uma partida de UNO'
export const aliases = ['q']
export async function run (msg) {
    let { id } = msg.author
    let game = this.bot.games.get('uno').get(msg.channel.id)

    if (game && game.players.has(id)) {
        let out = 'Você não está mais participando do jogo.\n\n'

        if (game.started && game.queue.length <= 2) {
            game.queue = game.queue.filter(p => p.id !== id)
            game.finished.push(game.queue[0])
            out += 'O jogo acabou. Obrigado por jogar! Aqui está o placar:\n'
            for (let i = 0; i < game.finished.length; i++) {
                out += `#${i + 1} **${Util.escapeMarkdown(game.finished[i].user.username)}**\n`
            }
            this.bot.games.get('uno').delete(game.channel.id)
            return msg.channel.send(out)
        }

        if (game.started && game.player.user.id === id) {
            game.next()
            out = new MessageEmbed()
                .setAuthor('UNO', 'https://i.imgur.com/Zzs9X74.png')
                .setDescription(`${out}Um **${game.table.flipped}** foi jogado por último. \n\nAgora é a vez de ${Util.escapeMarkdown(game.player.user.username)}!`)
                .setThumbnail('attachment://card.png')
                .setColor(game.table.flipped.colorCode)
                .attachFiles([new MessageAttachment(game.table.flipped.URL, 'card.png')])
        }

        game.players.delete(id)
        game.queue = game.queue.filter(p => p.id !== id)

        if (game.players.size === 0)
            this.bot.games.get('uno').delete(msg.channel.id)

        return msg.channel.send(out)
    } else
        return msg.send('Você não entrou no jogo ainda...')
}
