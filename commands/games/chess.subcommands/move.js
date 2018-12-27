import { MessageAttachment, MessageEmbed } from 'discord.js'
import { schemes } from '../../../games/structures/Chess/schemes'

export const desc = 'Move uma peça em um jogo de Xadrez'
export const help = 'Use `ty.chess move A1 B1` para mover a peça `A1` para `B1`, no tabuleiro'
export const usage = '<de> <para>'
export const aliases = ['m', 'play', 'p']
export async function run (msg, suffix) {
    if (!suffix)
        return msg.send(this.helpMessage)

    let args = suffix.split(/\s+/)
    let game = this.bot.games.findGame('chess', msg.author.id)

    if (game) {
        if (game.player.id === msg.author.id) {
            try {
                game.player.play(args[0].toLowerCase(), args[1].toLowerCase())
            }
            catch (e) {
                return msg.send(`Movimento inválido ${args[0]} -> ${args[1] || '\\*ar\\*'}`)
            }

            if (game.game.isCheckmate)
                return

            game.next()

            if (game.game.isCheck)
                return

            let canvas = await game.render()

            return msg.channel.send(new MessageEmbed()
                .setAuthor('Xadrez', 'https://png.icons8.com/windows/100/d5d5d5/queen-uk.png')
                .setDescription(`É o turno de ${game.player.user}`)
                .setColor(schemes[game.scheme][2])
                .setFooter('Use ty.chess move A1 A2 para mover A1 para A2, por exemplo')
                .setImage('attachment://board.png')
                .attachFiles([new MessageAttachment(canvas.toBuffer(), 'board.png')]))
        }
    } else
        return msg.send('Você não está em jogo!')
}
