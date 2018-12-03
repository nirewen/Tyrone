import { MessageAttachment, MessageEmbed } from 'discord.js'
import { schemes } from '../../../games/structures/Chess/schemes'

export async function run (msg, args) {
    let game = this.bot.games.findGame('chess', msg.author.id)
    if (game) {
        if (game.player.id === msg.author.id) {
            try {
                game.player.play(args[0].toLowerCase(), args[1].toLowerCase())
            }
            catch (e) {
                return msg.send(`Movimento inválido ${args[0]} -> ${args[1]}`)
            }
            
            game.next()

            if (game.game.isCheckmate || game.game.validMoves.length === 0) {
                this.bot.games.get('chess').delete(this.bot.games.findGameKey('chess', msg.author.id))

                return msg.channel.send('Check mate!')
            }
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
        msg.send('Você não está em jogo!')
}
