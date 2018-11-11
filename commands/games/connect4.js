import { Util } from 'discord.js'
import { Connect4 } from '../../games/Connect4'

const games = {}
const getGame = id => Object.values(games).find(game => game.players && game.players.hasOwnProperty(id)) || null

export const desc = 'Jogue Connect 4 pelo Discord'
export const usage = '<@usuário> | aceitar | cancelar | recusar'
export const aliases = ['c4']
export async function run (msg, suffix) {
    if (!suffix)
        return 'wrong usage'
    
    let mention = msg.mentions.users.first()

    if (mention && mention.id !== msg.author.id) {
        if (mention.bot && mention.id !== this.bot.user.id)
            return 'wrong usage'

        let type = msg.flags.get('type') || '1'
        let jogoUser = getGame(msg.author.id)
        let jogoOponente = getGame(mention.id)

        if (jogoUser && jogoUser.started)
            return msg.send('Você já está em jogo')
            
        if (jogoOponente)
            if (jogoOponente.started)
                return msg.send('Esse usuário já está em jogo')
            else
                return msg.send('Esse usuário já tem um pedido pendente')

        let game = games[msg.author.id] = new Connect4(msg.author.id)
        game.addPlayer(msg.author, type)
        game.addPlayer(mention, type === '1' ? '2' : '1')

        let m = await msg.send(`Você convidou ${Util.escapeMarkdown(mention.username)} para jogar Connect 4!\nPara aceitar, clique na reação abaixo.`)

        let reaction = await m.react('✅')

        if (mention.id !== this.bot.user.id)
            try {
                await m.awaitReactions((r, u) => r.me && u.id === mention.id, { time: 15E3, errors: ['time'] })
            } catch (e) {
                reaction.remove()
                delete games[msg.author.id]
            }
        else
            reaction.remove()

        game.started = true

        let message = await msg.send('Preparando jogo...')

        for (let i = 1; i <= 7; i++)
            await message.react(i + '\u20E3')

        message.edit(`${game.player.label} ${game.player}\n\n${game.render()}`)

        msg.collector = message.createReactionCollector((r, u) => r.me && game.players.hasOwnProperty(u.id))

        msg.collector.on('collect', async function (r, u) {
            if (game && game.player.id === u.id) {
                let supported = game.freeCols
                let number = parseInt(r.emoji.name, 10)

                if (supported.includes(number)) {
                    game.play(number)
                    if (game.checkWin()) {
                        message.edit(`${game.player.label}:crown: ${game.player.user}\n\n${game.render()}`)
                        delete games[msg.author.id]
                        return this.stop()
                    } else if (game.full) {
                        message.edit(`:skull:\n\n${game.render()}`)
                        delete games[msg.author.id]
                        return this.stop()
                    }

                    await game.next()

                    message.edit(`${game.player.label} ${game.player.user.mention}\n\n${game.render()}`)

                    if (message.channel.guild)
                        r.users.remove(u.id)

                    if (!game.freeCols.includes(number))
                        r.users.remove()
                }
            }
        })

        msg.collector.on('end', () => message.reactions.removeAll())
    }
}
