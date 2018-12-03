import { MessageAttachment, MessageEmbed } from 'discord.js'
import { schemes } from '../../../games/structures/Chess/schemes'

export const aliases = ['mesa']
export async function run (msg, args) {
    let game = this.bot.games.findGame('chess', msg.author.id)

    if (game) {
        let canvas = await game.render()

        return msg.channel.send(new MessageEmbed()
            .setAuthor('Xadrez', 'https://png.icons8.com/windows/100/d5d5d5/queen-uk.png')
            .setDescription(`É o turno de ${game.player.user}`)
            .setColor(schemes[game.scheme][2])
            .setFooter('Use ty.chess move A1 A2 para mover A1 para A2, por exemplo')
            .setImage('attachment://board.png')
            .attachFiles([new MessageAttachment(canvas.toBuffer(), 'board.png')]))
    } else
        msg.send('Você não está em jogo!')
}
