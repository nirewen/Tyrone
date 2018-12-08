import { MessageAttachment, MessageEmbed, Util } from 'discord.js'

const s = n => n === 1 ? '' : 's'

export const desc = 'Mostra a mesa de uma partida de UNO'
export const help = 'No centro da mesa tem o deck de cartas descartadas, a mais do topo é a que foi jogada por último. O jogador atual fica em laranja, enquanto os outros, em verde'
export const aliases = ['mesa']
export async function run (msg) {
    let game = this.bot.games.get('uno').get(msg.channel.id)
    let embed = new MessageEmbed()
        .setAuthor('UNO', 'https://i.imgur.com/Zzs9X74.png')

    if (!game)
        return msg.send('Não há nenhum jogo nesse canal ainda.')
    else if (!game.started)
        return msg.channel.send(embed
            .addField('Jogadores à mesa', game.queue.map(p => `**${Util.escapeMarkdown(p.user.username)}**`).join('\n'))
            .setColor('ORANGE'))
    else
        return msg.channel.send(embed
            .addField('Jogadores à mesa', game.queue.map(p => `${p.id === game.player.id ? '• ' : '↓ '}**${Util.escapeMarkdown(p.user.username)}** | ${p.hand.length} carta${s(p.hand.length)}`).join('\n'))
            .addField('Última carta jogada', `${game.table.flipped}`)
            .setThumbnail('attachment://card.png')
            .setImage('attachment://table.png')
            .setColor(game.table.flipped.colorCode)
            .attachFiles([
                new MessageAttachment(await game.table.render().then(c => c.toBuffer()), 'table.png'),
                new MessageAttachment(game.table.flipped.URL, 'card.png')
            ]))
}
