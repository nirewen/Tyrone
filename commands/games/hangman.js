import { Hangman } from '../../games/Hangman'
import { MessageEmbed } from 'discord.js'
import { Words } from '../../games/structures/Hangman/Words'

const DefaultEmbed = () => new MessageEmbed().setTitle('Jogo da Forca').setColor('BLUE')
const [greenTick, redTick] = ['313905428121780225', '314240199406387201']

export const desc = 'Jogue forca pelo Discord'
export const aliases = ['forca']
export const guildOnly = true
export async function run (msg, suffix) {
    const chooseWord = async (channel) => {
        let random = false
        let palavra = await channel.awaitMessages(m => m.author.id === msg.author.id, { max: 1 })
            .then(m => {
                if (m.first())
                    return Words.validate(m.first().content.split(/\s+/).join(' ').toUpperCase())
            })

        if (palavra) {
            if (palavra === '🔄') {
                palavra = Words.validate(Words.random().toUpperCase())
                random = true
            }

            if (!Words.has(palavra.toLowerCase()) && !palavra.includes(' ')) {
                let message = await channel.send('Essa palavra não é reconhecida pelo nosso dicionário, tem certeza que quer escolher ela?')

                for (let reaction of [greenTick, redTick])
                    await message.react(reaction)

                let reaction = await message.awaitReactions((r, u) => r.me && u.id === msg.author.id, { max: 1 }).then(c => {
                    message.delete()
                    return c.first()
                })

                if (reaction.emoji.id === redTick)
                    return chooseWord(channel)
            }

            if (!random) {
                let message = await channel.send(`Você escolheu a palavra \n\n${palavra}\n\nIsso está correto?`)
                for (let reaction of [greenTick, redTick])
                    await message.react(reaction)

                let reaction = await message.awaitReactions((r, u) => r.me && u.id === msg.author.id, { max: 1 }).then(c => {
                    message.delete()
                    return c.first()
                })

                if (reaction.emoji.id === redTick)
                    return chooseWord(channel)
            }

            return { palavra, random }
        }
    }

    if (!suffix) {
        let game = this.bot.games.get('hangman').get(msg.channel.id)

        if (game)
            return msg.send(`Já tem um jogo ${!game.word ? 'sendo ' : ''}criado nesse canal`)

        try {
            game = this.bot.games.get('hangman').set(msg.channel.id, new Hangman(msg.author))
            let palavra, random
            
            if (!msg.flags.has('random')) {
                let { channel } = await msg.author.send('Você criou um nogo Jogo da Forca!')
                await channel.send('Escolha a palavra que você quer que acertem\n\nUse :arrows_counterclockwise: para uma palavra aleatória\n\n:warning: Se você escolher a palavra, você não vai poder jogar');

                ({ palavra, random } = await chooseWord(channel))
            } else
                ({ palavra, random } = { palavra: Words.validate(Words.random().toUpperCase()), random: true })

            game.setWord(palavra)

            if (random)
                game.addPlayer(msg.author)

            return msg.channel.send(`${msg.author} escolheu ${random ? 'uma palavra aleatória' :  'a palavra'}! Digite \`ty.hangman start\` para iniciar o jogo, assim que todos tiverem entrado`)
        } catch (e) {
            return console.error(e)
        }
    }

    let [name] = suffix.split(/\s+/)

    let cmd = this.find(name.toLowerCase())

    if (cmd)
        return cmd.run.call(this, msg, suffix.split(/\s+/).slice(1).join(' '))
    else
        return 'wrong usage'
}
export const subcommands = {
    join: {
        aliases: ['enter'],
        run: async function (msg) {
            let game = this.bot.games.get('hangman').get(msg.channel.id)

            if (game) {
                if (!game.word)
                    return msg.send('Aguarde o jogo ser criado para poder entrar')

                if (game.started)
                    return msg.send('Esse jogo já começou')

                if (game.players.has(msg.author.id))
                    return msg.send('Você já entrou no jogo')
                
                if (game.author.id === msg.author.id)
                    return msg.send('Você criou o jogo e escolheu a palavra, então não pode entrar nele')

                game.addPlayer(msg.author)
                msg.channel.send('Você entrou no jogo! Aguarde ele começar')
            } else
                msg.send('Não tem nenhum jogo nesse canal... Você pode criar um usando `ty.hangman`')
        }
    },
    quit: {
        aliases: ['q', 'leave'],
        run: async function (msg) {
            let { id } = msg.author
            let game = this.bot.games.get('hangman').get(msg.channel.id)

            if (game) {
                if (!game.word)
                    return msg.send('Aguarde o jogo ser criado para poder entrar')

                if (game.author.id === id) {
                    if (msg.flags.has('y') || msg.flags.has('yes'))
                        this.bot.games.get('hangman').delete(msg.channel.id)
                    else {
                        let message = await msg.channel.send('Tem certeza que deseja deletar esse jogo?')

                        await message.react(greenTick)

                        try {
                            await message.awaitReactions((r, u) => r.me && u.id === id, { max: 1, time: 10000, errors: ['time'] })
                                .then(() => this.bot.games.get('hangman').delete(msg.channel.id))
                        } catch (_e) {
                            return
                        }
                        message.delete()
                    }

                    return msg.send('Jogo deletado pelo autor')
                }
                    
                if (game.players.has(id)) {
                    let out = 'Você não está mais participando do jogo.\n\n'
                    if (game.started && game.queue.length <= 2) {
                        game.queue = game.queue.filter(p => p.id !== id)

                        this.bot.games.get('hangman').delete(game.channel.id)
                        return msg.channel.send(DefaultEmbed()
                            .setDescription(`${out}\n${game.word}`)
                            .addField('Placar', Object.values(game.players).sort((p, n) => p.score > n.score).map((p, i) => `#${i + 1} - ${p.score} pontos - ${p.user}`))
                            .setColor('BLUE'))
                    }
                    if (game.started && game.player.user.id === id) {
                        game.next()
                        out = DefaultEmbed()
                            .setDescription(`${out}\n${game.word}`)
                            .setColor('BLUE')
                    }
                    game.players.delete(id)
                    game.queue = game.queue.filter(p => p.id !== id)

                    if (Object.keys(game.players).length === 0)
                        this.bot.games.get('hangman').delete(msg.channel.id)

                    return msg.channel.send(out)
                }
                else
                    return msg.send('Você não entrou no jogo ainda...')
            } else
                msg.send('Não tem nenhum jogo nesse canal... Você pode criar um usando `ty.hangman`')
        }
    },
    start: {
        run: async function (msg) {
            let game = this.bot.games.get('hangman').get(msg.channel.id)

            if (game) {
                if (!game.word)
                    return msg.send('Aguarde a palavra ser escolhida para começar')

                if (game.started)
                    return msg.send('Esse jogo já começou')

                if (game.author.id !== msg.author.id)
                    return msg.send('Você não pode começar um jogo que não é seu!')

                if (!game.players.has(msg.author.id) && game.queue.length < 2)
                    return msg.send('2 jogadores são necessários para jogar')
                
                game.started = true

                msg.channel.send(DefaultEmbed()
                    .setDescription(`Agora é a vez de ${game.player.user}\n\n${game.word}`)
                    .setFooter(game.misses)
                    .setThumbnail(`https://raw.githubusercontent.com/nirewen/Tyrone/master/src/img/hangman/${game.misses.length}.png`))
            } else
                msg.send('Não tem nenhum jogo nesse canal... Você pode criar um usando `ty.hangman`')
        }
    },
    play: {
        aliases: ['p'],
        run: async function (msg, letter) {
            let game = this.bot.games.get('hangman').get(msg.channel.id)

            if (game) {
                if (!game.started)
                    return msg.send('Esse jogo ainda não começou')

                if (!game.players.has(msg.author.id)) {
                    if (game.author.id === msg.author.id)
                        return msg.send('Você não poge jogar. Você já sabe a palavra! Não vale...')

                    return msg.send('Você nem tá no jogo!')
                }
                
                if (game.player.id !== msg.author.id)
                    return msg.send(`Não é a sua vez, é a vez de ${game.player.user.username}!`)

                try {
                    let won = game.play(letter)
                    let embed = DefaultEmbed()
                        .setFooter(game.misses)
                        .setThumbnail(`https://raw.githubusercontent.com/nirewen/Tyrone/master/src/img/hangman/${game.misses.length}.png`)

                    if (won) {
                        embed
                            .setDescription(`Parabéns ${game.player.user.username}! Você acertou a última letra\n\n${game.word}`)
                            .addField('Placar', Object.values(game.players).sort((p, n) => p.score > n.score).map((p, i) => `#${i + 1} - ${p.score} pontos - ${p.user}`))

                        this.bot.games.get('hangman').delete(msg.channel.id)
                    } else {
                        game.next()
                        embed.setDescription(`Agora é a vez de ${game.player.user}\n\n ${game.word}`)
                    }
                    
                    msg.channel.send(embed)
                } catch (e) {
                    if (e.message === 'man hang') {
                        this.bot.games.get('hangman').delete(msg.channel.id)
                        return msg.channel.send(DefaultEmbed()
                            .setDescription(`Muitas tentativas falhas... O homem foi enforcado... F\n\nA palavra era\n\n${game.word}`)
                            .setFooter(game.misses)
                            .setThumbnail(`https://raw.githubusercontent.com/nirewen/Tyrone/master/src/img/hangman/${game.misses.length}.png`))
                    }
                    msg.channel.send(e.message)
                }
            } else
                msg.send('Não tem nenhum jogo nesse canal... Você pode criar um usando `ty.hangman`')
        }
    },
    guess: {
        aliases: ['g'],
        run: async function run (msg, word) {
            let game = this.bot.games.get('hangman').get(msg.channel.id)

            if (game) {
                if (!game.started)
                    return msg.send('Esse jogo ainda não começou')

                if (!game.players.has(msg.author.id))
                    return msg.send('Você não tá participando desse jogo')

                try {
                    let guessed = game.guess(word)
                    let embed = DefaultEmbed()
                        .setDescription(game.word)
                        .setFooter(game.misses)

                    if (guessed) {
                        embed
                            .setDescription(`Parabéns ${msg.author.username}! Você acertou a palavra!\n\n` + embed.description)
                        
                        this.bot.games.get('hangman').delete(msg.channel.id)
                    }
                    
                    msg.channel.send(embed)
                } catch (e) {
                    msg.channel.send(e.message)
                }
            } else
                msg.send('Não tem nenhum jogo nesse canal... Você pode criar um usando `ty.hangman`')
        }
    }
}
