import { Util } from 'discord.js'
import { Connect4 } from '../../games/Connect4'

export const desc = 'Jogue Connect 4 pelo Discord'
export const usage = '<@usuário>'
export const aliases = ['c4']
export async function run (msg, suffix) {
    if (!suffix)
        return 'wrong usage'

    let mention = msg.mentions.users.first()

    if (mention && mention.id !== msg.author.id) {
        if (mention.bot)
            return 'wrong usage'

        let type = msg.flags.get('type') || '1'
        let jogoUser = this.bot.games.findGame('connect4', msg.author.id)
        let jogoOponente = this.bot.games.findGame('connect4', mention.id)

        if (jogoUser && jogoUser.started)
            return msg.send('Você já está em jogo')

        if (jogoOponente)
            if (jogoOponente.started)
                return msg.send('Esse usuário já está em jogo')
            else
                return msg.send('Esse usuário já tem um pedido pendente')

        if (msg.guild && !msg.channel.permissionsFor(msg.guild.me).has('MANAGE_MESSAGES'))
            return msg.send('Não tenho permissão de remover reações aqui...')

        let game = this.bot.games.get('connect4').set(msg.author.id, new Connect4(msg.author.id))
        game.addPlayer(msg.author, type)
        game.addPlayer(mention, type === '1' ? '2' : '1')

        let m = await msg.send(`Você convidou ${Util.escapeMarkdown(mention.username)} para jogar Connect 4!\nPara aceitar, clique na reação abaixo.`)

        let reaction = await m.react('✅')

        if (mention.id !== this.bot.user.id)
            try {
                await m.awaitReactions((r, u) => r.me && u.id === mention.id, { max: 1, time: 15E3, errors: ['time'] })
            } catch (e) {
                reaction.users.remove()
                return this.bot.games.get('connect4').delete(msg.author.id)
            }
        else
            reaction.users.remove()

        game.started = true

        let message = await msg.channel.send('Preparando jogo...')

        for (let i = 1; i <= 7; i++)
            await message.react(i + '\u20E3')

        message.edit(`${game.player.label} ${game.player.user}\n\n${game.render()}`)

        msg.collector = message.createReactionCollector((r, u) => r.me && game.players.has(u.id), { idle: 180000 })

        msg.collector.on('collect', async function (r, u) {
            if (game && game.player.id === u.id) {
                let supported = game.holes.freeCols
                let number = parseInt(r.emoji.name, 10)

                if (supported.includes(--number)) {
                    let win = game.play(number)
                    if (win) {
                        message.edit(`${game.player.label}:crown: ${game.player.user}\n\n${game.render()}`)
                        return this.stop()
                    } else if (game.holes.full) {
                        message.edit(`:skull:\n\n${game.render()}`)
                        return this.stop()
                    }

                    await game.next()

                    message.edit(`${game.player.label} ${game.player.user}\n\n${game.render()}`)

                    if (message.channel.guild)
                        r.users.remove(u.id)

                    if (!game.holes.freeCols.includes(number))
                        r.users.remove()
                }
            }
        })

        msg.collector.on('end', () => {
            this.bot.games.get('connect4').delete(msg.author.id)
            message.reactions.removeAll()
        })
    }
}
