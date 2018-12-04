import { Hangman } from '../../games/Hangman'
import { Words } from '../../games/structures/Hangman/Words'

const [greenTick, redTick] = ['313905428121780225', '314240199406387201']

export const desc = 'Jogue forca pelo Discord'
export const help = [
    'Como jogar:',
    'Cada jogador deve jogar uma letra.',
    'Se a letra tiver na palavra, ela é mostrada',
    'Se não tiver, o homem na forca é penalizado',
    'Se o número de letras erradas chegar a 6, o homem é morto',
    '',
    'Vence quem acertar a palavra'
]
export const aliases = ['forca']
export const guildOnly = true
export const usage = '[join | quit | start | play | guess]'
export async function run (msg, suffix) {
    const chooseWord = async (channel) => {
        await channel.send('Escolha a palavra que você quer que acertem\n\nUse :arrows_counterclockwise: para uma palavra aleatória\n\n:warning: Se você escolher a palavra, você não vai poder jogar')

        let random = false
        let palavra = await channel.awaitMessages(m => m.author.id === msg.author.id, { max: 1, time: 15E3, errors: ['time'] })
            .then(m => {
                if (m.first())
                    return Words.validate(m.first().content.split(/\s+/).join(' ').toUpperCase())
            })
            .catch(e => {
                this.bot.games.get('hangman').delete(msg.channel.id)
                channel.send('Você demorou demais para escolher a palavra...')
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
            let word

            if (!msg.flags.has('random')) {
                let { channel } = await msg.author.send('Você criou um novo Jogo da Forca!')

                word = await chooseWord(channel)
            } else
                word = { palavra: Words.validate(Words.random().toUpperCase()), random: true }

            if (!word)
                return this.bot.games.get('hangman').delete(msg.channel.id)

            let { palavra, random } = word

            game.setWord(palavra)

            if (random)
                game.addPlayer(msg.author)

            return msg.channel.send(`${msg.author} escolheu ${random ? 'uma palavra aleatória' :  'a palavra'}! Digite \`ty.hangman start\` para iniciar o jogo, assim que todos tiverem entrado`)
        } catch (e) {
            return console.error(e)
        }
    }
}
