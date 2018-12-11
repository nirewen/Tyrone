import { Chess } from '../../games/Chess'
import { schemes } from '../../games/structures/Chess/schemes'
import { MessageEmbed, Util, MessageAttachment } from 'discord.js'

export const desc = 'Jogue Xadrez com seus amigos'
export const help = 'Use `ty.chess move` para mover uma peça'
export const usage = '<@usuário | move a1 b2>'
export const flags = true
export async function run (msg, suffix) {
    let mention = msg.mentions.users.first()

    if (!suffix || !mention || (mention && mention.bot))
        return 'wrong usage'

    if (mention.id !== msg.author.id) {
        let jogoOponente = this.bot.games.findGame('chess', mention.id)
        let jogoUser = this.bot.games.findGame('chess', msg.author.id)

        if (jogoOponente)
            if (jogoOponente.started)
                return msg.send('Esse usuário já está em jogo')
            else
                return msg.send('Esse usuário já tem um pedido pendente')

        if (jogoUser && jogoUser.started)
            return msg.send('Você já está em jogo')

        let scheme = msg.flags.has('scheme') && schemes[msg.flags.get('scheme')] ? msg.flags.get('scheme') : 'emerald'
        let game = this.bot.games.get('chess').set(msg.author.id, new Chess(msg.author.id, scheme))

        game.addPlayer(msg.author)
        game.addPlayer(mention)

        let m = await msg.send(`Você convidou ${Util.escapeMarkdown(mention.username)} para jogar Xadrez!\nPara aceitar, clique na reação abaixo.`)
        let reaction = await m.react('✅')

        if (mention.id !== this.bot.user.id)
            try {
                await m.awaitReactions((r, u) => r.me && u.id === mention.id, { max: 1, time: 15E3, errors: ['time'] })
            } catch (e) {
                reaction.users.remove()
                return this.bot.games.get('chess').delete(msg.author.id)
            }
        else
            reaction.users.remove()

        game.started = true

        let canvas = await game.render()
        let embed = new MessageEmbed()
            .setAuthor('Xadrez', 'https://png.icons8.com/windows/100/d5d5d5/queen-uk.png')
            .setColor(schemes[scheme][2])

        game.game.on('check', async attacker => {
            canvas = await game.render(attacker)

            return msg.channel.send(embed
                .setDescription('Check!')
                .setImage('attachment://board.png')
                .attachFiles([new MessageAttachment(canvas.toBuffer(), 'board.png')]))
        })

        return msg.channel.send(embed
            .setDescription(`É o turno de ${game.player.user}`)
            .setFooter('Use ty.chess move A1 A2 para mover A1 para A2, por exemplo')
            .setImage('attachment://board.png')
            .attachFiles([new MessageAttachment(canvas.toBuffer(), 'board.png')]))
    }
}
