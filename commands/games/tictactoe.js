import Canvas from 'canvas'
import util from 'util'
import { Util, MessageAttachment } from 'discord.js'
import { CanvasUtils } from '../../utils/CanvasUtils'
import { TicTacToe } from '../../games/TicTacToe'

const modes = ['easy', 'medium', 'hard']
const sleep = util.promisify(setTimeout)

export const desc = 'Jogue jogo da velha pelo Discord'
export const usage = '<@usuário>'
export const aliases = ['jogodavelha', 'ttt', 'nac', 'noughtsandcrosses']
export const flags = true
export async function run (msg, suffix) {
    let mention = msg.mentions.users.first()

    if (!suffix || !mention || mention.id === msg.author.id || (mention.bot && mention.id !== this.bot.user.id))
        return 'wrong usage'

    let mode = modes.indexOf(msg.props.get('mode')) > -1 ? msg.props.get('mode') : 'hard'
    let type = msg.props.get('type') || 'x'
    let jogoUser = this.bot.games.findGame('tictactoe', msg.author.id)
    let jogoOponente = this.bot.games.findGame('tictactoe', mention.id)

    if (jogoUser && jogoUser.started)
        return msg.send('Você já está em jogo')

    if (jogoOponente)
        if (jogoOponente.started)
            return msg.send('Esse usuário já está em jogo')
        else
            return msg.send('Esse usuário já tem um pedido pendente')

    if (msg.guild && !msg.channel.permissionsFor(msg.guild.me).has('MANAGE_MESSAGES'))
        return msg.send('Não tenho permissão de remover reações aqui...')

    let game = this.bot.games.get('tictactoe').set(msg.author.id, new TicTacToe(msg.author.id, mode))
    game.addPlayer(msg.author, type)
    game.addPlayer(mention, type === 'o' ? 'x' : 'o')

    let m = await msg.send(`Você convidou ${Util.escapeMarkdown(mention.username)} para jogar Tic-Tac-Toe!\nPara aceitar, clique na reação abaixo.`)

    let reaction = await m.react('✅')

    if (mention.id !== this.bot.user.id)
        try {
            await m.awaitReactions((r, u) => r.me && u.id === mention.id, { max: 1, time: 15E3, errors: ['time'] })
        } catch (e) {
            reaction.users.remove()
            return this.bot.games.get('tictactoe').delete(msg.author.id)
        }
    else
        reaction.users.remove()

    game.started = true
    let [opponent, challenger] = game.queue

    let canvas = Canvas.createCanvas(104, 50)
    let ctx = canvas.getContext('2d')
    let challengerAvatar = await CanvasUtils.getPolygonImage(challenger.user.avatarURL({ format: 'png', size: 2048 }), 45, 0)
    let opponentAvatar = await CanvasUtils.getPolygonImage(opponent.user.avatarURL({ format: 'png', size: 2048 }), 45, 0)

    ctx.drawImage(opponentAvatar, 3, 3)
    ctx.drawImage(challengerAvatar, 56, 3)

    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    CanvasUtils.circle(ctx, 38, 38, 10, 0, 2 * Math.PI, { fill: 'red' })
    CanvasUtils.circle(ctx, 66, 38, 10, 0, 2 * Math.PI, { fill: 'red' })
    ctx.restore()

    let types = {
        x: await CanvasUtils.getPolygonImage('https://twemoji.maxcdn.com/2/72x72/274c.png', 16, 0),
        o: await CanvasUtils.getPolygonImage('https://twemoji.maxcdn.com/2/72x72/2b55.png', 16, 0)
    }

    ctx.drawImage(types[opponent.type], 30, 30)
    ctx.drawImage(types[challenger.type], 58, 30)

    let message = await msg.channel.send('Preparando jogo...', new MessageAttachment(canvas.toBuffer(), 'players.png'))

    for (let i = 1; i <= 9; i++)
        await message.react(i + '\u20E3')

    message.edit(`:hash:${game.player.label}\n\n${game.render()}`)

    msg.collector = message.createReactionCollector((r, u) => r.me && game.players.has(u.id), { idle: 12E4 })

    msg.collector.on('collect', async function (r, u) {
        if (game && game.player.id === u.id) {
            let supported = game.matrix.freeSpots.map(k => k.position)
            let number = parseInt(r.emoji.name, 10)

            if (supported.includes(number)) {
                game.play(number)
                if (game.isGameWon()) {
                    if (message.guild)
                        message.reactions.removeAll()
                    else
                        r.users.remove()

                    message.edit(`:hash:${game.player.label}:crown:\n\n${game.render()}`)
                    return this.stop()
                } else if (game.matrix.freeSpots.length === 0) {
                    if (message.guild)
                        message.reactions.removeAll()
                    else
                        r.users.remove()

                    message.edit(`:hash::older_woman:\n\n${game.render()}`)
                    return this.stop()
                }

                await game.next()

                message.edit(`:hash:${game.player.label}\n\n${game.render()}`)

                if (message.guild)
                    r.users.remove(u)

                r.users.remove()

                if (game.player.user.bot) {
                    await sleep(1E3)

                    let { position } = game.playBot()

                    if (game.isGameWon()) {
                        if (message.guild)
                            message.reactions.removeAll()
                        else
                            message.reactions.cache.get(position + '\u20E3').users.remove()

                        message.edit(`:hash:${game.player.label}:crown:\n\n${game.render()}`)
                        return this.stop()
                    } else if (game.matrix.freeSpots.length === 0) {
                        if (message.guild)
                            message.reactions.removeAll()
                        else
                            message.reactions.cache.get(position + '\u20E3').users.remove()

                        message.edit(`:hash::older_woman:\n\n${game.render()}`)
                        return this.stop()
                    }

                    await game.next()

                    message.edit(`:hash:${game.player.label}\n\n${game.render()}`)
                    message.reactions.cache.get(position + '\u20E3').users.remove()
                }
            }
        }
    })

    msg.collector.on('end', () => {
        this.bot.games.get('tictactoe').delete(msg.author.id)
    })
}
