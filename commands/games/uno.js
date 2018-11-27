import { UNO } from '../../games/UNO'
import { MessageEmbed, Util, MessageAttachment } from 'discord.js'

const s = n => n === 1 ? '' : 's'
const games = {}

export const desc = 'Jogue UNO com seus amigos'
export const help = `\`\`\`
join       | Cria um jogo ou entra em um já criado
quit       | Sai de um jogo
play       | Joga uma carta na mesa
draw       | Compra uma carta do baralho
mesa       | Mostra os jogadores
start      | Inicia o jogo que você criou
contra-uno | Penaliza um jogador com uma carta na mão,
           | mas que não disse UNO!\`\`\``
export const usage = 'help'
export async function run (msg, suffix) {
    if (!suffix)
        return 'wrong usage'

    let [name] = suffix.split(/\s+/)

    let cmd = this.find(name.toLowerCase())

    if (cmd)
        return cmd.run.call(this, msg, suffix.split(/\s+/).slice(1))
    else
        return 'wrong usage'
}

export const subcommands = {
    help: {
        aliases: ['h'],
        run: async function (msg) {
            return msg.channel.send(this.helpMessage)
        }
    },
    join: {
        aliases: ['enter'],
        run: async function (msg) {
            let game = games[msg.channel.id]
            if (!game) {
                game = games[msg.channel.id] = new UNO(msg.channel)
                game.generateDeck()
            }
            if (game.started) {
                return msg.channel.send('Desculpa, esse jogo já começou!')
            }
            let res = game.addPlayer(msg.author)
            if (res === null)
                return msg.channel.send('Você já entrou nesse jogo!')
            else {
                if (game.queue.length === 1) {
                    return msg.channel.send('Um jogo foi registrado! Assim que todos os jogadores entrarem, digite `ty.uno start` para começar o jogo.')
                }
                else {
                    return msg.channel.send('Você entrou no jogo! Por favor, aguarde ele começar.')
                }
            }
        }
    },
    quit: {
        run: async function (msg) {
            let { id } = msg.author
            let game = games[msg.channel.id]

            if (game && game.players.hasOwnProperty(id)) {
                let out = 'Você não está mais participando do jogo.\n\n'
                if (game.started && game.queue.length <= 2) {
                    game.queue = game.queue.filter(p => p.id !== id)
                    game.finished.push(game.queue[0])
                    out += 'O jogo acabou. Obrigado por jogar! Aqui está o placar:\n'
                    for (let i = 0; i < game.finished.length; i++) {
                        out += `#${i + 1} **${Util.escapeMarkdown(game.finished[i].user.username)}**\n`
                    }
                    delete games[game.channel.id]
                    return msg.channel.send(out)
                }
                if (game.started && game.player.user.id === id) {
                    game.next()
                    out = new MessageEmbed()
                        .setAuthor('UNO', 'https://i.imgur.com/Zzs9X74.png')
                        .setDescription(`${out}Um **${game.flipped}** foi jogado por último. \n\nAgora é a vez de ${Util.escapeMarkdown(game.player.user.username)}!`)
                        .setThumbnail('attachment://card.png')
                        .setColor(game.flipped.colorCode)
                        .attachFiles([new MessageAttachment(game.flipped.URL, 'card.png')])
                }
                delete game.players[id]
                game.queue = game.queue.filter(p => p.id !== id)
                if (game.players.length === 0)
                    delete games[msg.channel.id]
                return msg.channel.send(out)
            }
            else
                return msg.channel.send('Cê nem entrou!')
        }
    },
    play: {
        aliases: ['p'],
        run: async function (msg, words) {
            let game = games[msg.channel.id]
            if (game) {
                if (!game.started)
                    return msg.channel.send('Desculpa, mas o jogo ainda não começou!')
                if (game.player.id !== msg.author.id)
                    return msg.channel.send(`Não é seu turno ainda! É a vez de ${Util.escapeMarkdown(game.player.user.username)}.`)
                let card = game.player.getCard(words)
                if (card === null)
                    return
                if (!card)
                    return msg.channel.send('CÊ É CEGO??? TU N TEM ESSA CARTA BURRO. Tente de novo c:')
                if (!game.flipped.color || card.wild || card.id === game.flipped.id || card.color === game.flipped.color) {
                    game.discard.push(card)
                    game.player.hand.splice(game.player.hand.indexOf(card), 1)
                    let pref = ''
                    if (game.player.hand.length === 0) {
                        game.finished.push(game.player)
                        game.player.finished = true
                        pref = `${Util.escapeMarkdown(game.player.user.username)} não tem mais cartas! Terminou no **Rank #${game.finished.length}**! :tada:\n\n`
                        if (game.queue.length === 2) {
                            game.finished.push(game.queue[1])
                            pref += 'O jogo acabou. Obrigado por jogar! Aqui está o placar:\n'
                            for (let i = 0; i < game.finished.length; i++) {
                                pref += `${i + 1}. **${Util.escapeMarkdown(game.finished[i].member.user.username)}**\n`
                            }
                            delete games[game.channel.id]
                            return msg.channel.send(pref)
                        }
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
                            extra = `${Util.escapeMarkdown(game.queue[1].member.user.username)} compra ${amount} cartas! `
                            if (game.rules.drawSkip.value === true) {
                                extra += ' Ah, e pula a vez!'
                                game.queue.push(game.queue.shift())
                            }
                            break
                        case 'WILD':
                            extra = `Caso não tenha notado, a cor agora é **${card.colorName}**! `
                            break
                        case 'WILD+4': {
                            await game.deal(game.queue[1], 4)
                            extra = `${Util.escapeMarkdown(game.queue[1].member.user.username)} compra 4! A cor atual é **${card.colorName}**! `
                            if (game.rules.drawSkip.value === true) {
                                extra += ' Ah, e pula a vez!'
                                game.queue.push(game.queue.shift())
                            }
                            break
                        }
                    }
                    if (game.player.hand.length === 1) {
                        game.player.immune = true
                        setTimeout(() => {
                            game.player.immune = false
                        }, 3000)
                    }
                    await game.next()

                    return msg.channel.send(new MessageEmbed()
                        .setAuthor('UNO', 'https://i.imgur.com/Zzs9X74.png')
                        .setDescription(`${Util.escapeMarkdown(msg.author.username)} jogou **${game.flipped}**. ${extra}\n\nAgora é a vez de ${Util.escapeMarkdown(game.player.user.username)}!`)
                        .setThumbnail('attachment://card.png')
                        .setColor(game.flipped.colorCode)
                        .attachFiles([new MessageAttachment(game.flipped.URL, 'card.png')]))
                }
                else
                    return msg.channel.send('Desculpa, você não pode jogar esta carta aqui!')
            }
            else
                return msg.channel.send('Desculpa, mas um jogo não foi criado ainda! Você pode criar um com `ty.uno join`')
        }
    },
    pickup: {
        aliases: ['d', 'draw', 'c', 'comprar'],
        run: async function (msg) {
            let game = games[msg.channel.id]
            if (game) {
                if (!game.started)
                    return 'Desculpa, mas o jogo ainda não começou!'
                if (game.player.id !== msg.author.id)
                    return `Não é seu turno ainda! É a vez de ${Util.escapeMarkdown(game.player.user.username)}.`
                game.deal(game.player, 1)
                let player = game.player
                await game.next()
                return msg.channel.send(new MessageEmbed()
                    .setAuthor('UNO', 'https://i.imgur.com/Zzs9X74.png')
                    .setDescription(`${Util.escapeMarkdown(player.user.username)} comprou uma carta.\n\n**${game.flipped}** foi jogada por último. \n\nAgora é o turno de ${Util.escapeMarkdown(game.player.user.username)}!`)
                    .setThumbnail('attachment://card.png')
                    .setColor(game.flipped.colorCode)
                    .attachFiles([new MessageAttachment(game.flipped.URL, 'card.png')]))
            }
            else
                return msg.channel.send('Desculpa, mas um jogo não foi criado ainda! Você pode criar um com `ty.uno join`')
        }
    },
    start: {
        aliases: ['s'],
        run: async function (msg) {
            let game = games[msg.channel.id]
            if (!game)
                return msg.channel.send('Nenhum jogo foi registrado nesse canal.')

            if (game.queue.length > 1) {
                if (game.player.id !== msg.author.id)
                    return msg.channel.send('Você não pode iniciar um jogo que não criou!')

                await game.dealAll(game.rules.initialCards.value)
                game.discard.push(game.deck.pop())
                game.started = true
                let extra = ''
                if (['WILD', 'WILD+4'].includes(game.flipped.id))
                    extra += '\n\nVocê pode jogar qualquer carta.'

                return msg.channel.send(new MessageEmbed()
                    .setAuthor('UNO', 'https://i.imgur.com/Zzs9X74.png')
                    .setDescription(`O jogo começou com ${game.queue.length} jogadores! A carta à mesa é **${game.flipped}**. \n\nAgora é o turno de ${Util.escapeMarkdown(game.player.user.username)}!${extra}`)
                    .setThumbnail('attachment://card.png')
                    .setColor(game.flipped.colorCode)
                    .attachFiles([new MessageAttachment(game.flipped.URL, 'card.png')]))
            }
            else {
                return 'Não há pessoas suficientes pra jogar!'
            }
        }
    },
    mesa: {
        run: async function (msg) {
            let game = games[msg.channel.id]
            let embed = new MessageEmbed()
                .setAuthor('UNO', 'https://i.imgur.com/Zzs9X74.png')

            if (!game) {
                return msg.channel.send('Não há nenhum jogo nesse canal ainda.')
            }
            else if (!game.started) {
                return msg.channel.send(embed
                    .addField('Jogadores à mesa', game.queue.map(p => `**${Util.escapeMarkdown(p.user.username)}**`).join('\n'))
                    .setColor('ORANGE'))
            }
            else {
                return msg.channel.send(embed
                    .addField('Jogadores à mesa', game.queue.map(p => `${p.id === game.player.id ? '• ' : '↓ '}**${Util.escapeMarkdown(p.user.username)}** | ${p.hand.length} carta${s(p.hand.length)}`).join('\n'))
                    .addField('Última carta jogada', `${game.flipped}`)
                    .setThumbnail('attachment://card.png')
                    .setColor(game.flipped.colorCode)
                    .attachFiles([new MessageAttachment(game.flipped.URL, 'card.png')]))
            }
        }
    },
    '!': {
        run: async function (msg) {
            let game = games[msg.channel.id]
            if (game && game.started && game.players[msg.author.id] && game.players[msg.author.id].hand.length === 1) {
                let p = game.players[msg.author.id]
                if (!p.called) {
                    p.called = true
                    return msg.channel.send(`**UNO!!** ${Util.escapeMarkdown(p.user.username)} tem só uma carta!`)
                }
                else
                    return msg.channel.send(`Cê já disse UNO!`)
            }
        }
    },
    'contra-uno': {
        run: async function (msg) {
            let game = games[msg.channel.id]
            if (game && game.started && game.players[msg.author.id]) {
                let baddies = game.queue.filter(player => player.hand.length === 1 && !player.called && !player.immune)

                baddies.forEach(player => {
                    player.called = true
                })

                game.dealAll(2, baddies)
                if (baddies.length > 0)
                    return msg.channel.send(`Uh oh! ${baddies.map(p => `**${Util.escapeMarkdown(p.member.user.username)}**`).join(', ')}, você não disse UNO! Pegue 2 cartas!`)
                else
                    return msg.channel.send('Não tem ninguém pra dedurar!')
            }
            else
                return msg.channel.send('Cê não tá nem no jogo!')
        }
    }
}
