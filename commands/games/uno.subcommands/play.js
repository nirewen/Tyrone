import { MessageAttachment, MessageEmbed, Util } from 'discord.js'
import util from 'util'

const sleep = util.promisify(setTimeout)

export const desc = 'Joga uma carta na mesa'
export const help = [
    'Uma cor e um valor são necessários para identificar uma carta.',
    'Exemplos:',
    '> red 2',
    '> vermelho wild',
    '',
    'Se uma carta coringa (WILD) for jogada junto de uma cor, essa cor se torna a cor que rege o jogo'
]
export const aliases = ['p']
export const usage = '<cor> <valor>'
export async function run (msg, suffix) {
    if (!suffix)
        return 'wrong usage'
        
    let words = suffix.split(/\s/)
    let game = this.bot.games.get('uno').get(msg.channel.id)

    if (game) {
        if (!game.started)
            return msg.channel.send('Desculpa, mas o jogo ainda não começou!')
        if (game.player.id !== msg.author.id)
            return msg.channel.send(`Não é seu turno ainda! É a vez de ${Util.escapeMarkdown(game.player.user.username)}.`)

        let card = game.player.getCard(words)

        if (!card)
            return msg.channel.send('Você não tem essa carta... Tente novamente.')

        if (!game.table.flipped.color || card.wild || card.id === game.table.flipped.id || card.color === game.table.flipped.color) {
            game.table.discard.push(card)
            game.player.hand.splice(game.player.hand.indexOf(card), 1)
            let pref = ''

            if (game.player.hand.length === 0) {
                game.finished.push(game.player)
                game.player.finished = true
                pref = `${Util.escapeMarkdown(game.player.user.username)} não tem mais cartas! Terminou no **Rank #${game.finished.length}**! :tada:\n\n`
                if (game.queue.length === 2) {
                    game.finished.push(game.queue[1])
                    pref += 'O jogo acabou. Obrigado por jogar! Aqui está o placar:\n'

                    for (let [i] of game.finished.entries())
                        pref += `${i + 1}. **${Util.escapeMarkdown(game.finished[i].user.username)}**\n`

                    this.bot.games.get('uno').delete(game.channel.id)
                }
                return msg.channel.send(pref)
            }
            let extra = ''

            switch (card.id) {
                case 'REVERSE':
                    if (game.queue.length >= 2) {
                        let player = game.queue.shift()

                        game.queue.reverse()
                        game.queue.unshift(player)
                        extra = `Os turnos agora estão em ordem reversa! `
                    }
                    break
                case 'SKIP':
                    game.queue.push(game.queue.shift())
                    extra = `Foi mal, ${Util.escapeMarkdown(game.player.user.username)}! Pulou a vez! `
                    break
                case '+2':
                    let amount = 2

                    game.deal(game.queue[1], amount)
                    extra = `${Util.escapeMarkdown(game.queue[1].user.username)} compra ${amount} cartas! `
                    if (game.rules.drawSkip.value === true) {
                        extra += ' Ah, e pula a vez!'
                        game.queue.push(game.queue.shift())
                    }
                    break
                case 'WILD':
                    extra = `A cor agora é **${card.colorName}**! `
                    break
                case 'WILD+4': {
                    await game.deal(game.queue[1], 4)

                    extra = `${Util.escapeMarkdown(game.queue[1].user.username)} compra 4! A cor agora é **${card.colorName}**! `

                    if (game.rules.drawSkip.value === true) {
                        extra += ' Ah, e pula a vez!'
                        game.queue.push(game.queue.shift())
                    }
                    break
                }
            }
            let { player } = game

            if (player.hand.length === 1) {
                player.immune = true

                await sleep(3E3)
                
                player.immune = false
            }
            await game.next()

            return msg.channel.send(new MessageEmbed()
                .setAuthor('UNO', 'https://i.imgur.com/Zzs9X74.png')
                .setDescription(`${Util.escapeMarkdown(msg.author.username)} jogou **${game.table.flipped}**. ${extra}\n\nAgora é a vez de ${Util.escapeMarkdown(game.player.user.username)}!`)
                .setThumbnail('attachment://card.png')
                .setColor(game.table.flipped.colorCode)
                .attachFiles([new MessageAttachment(game.table.flipped.URL, 'card.png')]))
        }
        else
            return msg.send('Desculpa, você não pode jogar esta carta aqui!')
    }
    else
        return msg.send('Desculpa, mas um jogo não foi criado ainda! Você pode criar um com `ty.uno join`')
}
