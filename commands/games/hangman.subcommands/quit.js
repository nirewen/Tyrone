import { MessageEmbed } from 'discord.js'

export const desc = 'Sai de uma partida de Jogo da Forca'
export const aliases = ['q', 'leave']
export const flags = true
export async function run (msg) {
    let { id } = msg.author
    let game = this.bot.games.get('hangman').get(msg.channel.id)

    if (game) {
        if (!game.word)
            return msg.send('Aguarde o jogo ser criado para poder entrar')

        if (game.author.id === id) {
            if (msg.props.has('y') || msg.props.has('yes'))
                this.bot.games.get('hangman').delete(msg.channel.id)
            else {
                let message = await msg.channel.send('Tem certeza que deseja deletar esse jogo?')
                await message.react('313905428121780225')
                try {
                    await message.awaitReactions((r, u) => r.me && u.id === id, { max: 1, time: 10000, errors: ['time'] })
                        .then(() => this.bot.games.get('hangman').delete(msg.channel.id))
                }
                catch (_e) {
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

                return msg.channel.send(new MessageEmbed()
                    .setTitle('Jogo da Forca')
                    .setDescription(`${out}\n${game.word}`)
                    .addField('Placar', Object.values(game.players).sort((p, n) => p.score > n.score).map((p, i) => `#${i + 1} - ${p.score} pontos - ${p.user}`))
                    .setThumbnail(game.man)
                    .setColor('BLUE'))
            }
            if (game.started && game.player.user.id === id) {
                game.next()
                out = new MessageEmbed()
                    .setTitle('Jogo da Forca')
                    .setDescription(`${out}\n${game.word}`)
                    .setThumbnail(game.man)
                    .setColor('BLUE')
            }

            game.players.delete(id)
            game.queue = game.queue.filter(p => p.id !== id)

            if (game.players.size === 0)
                this.bot.games.get('hangman').delete(msg.channel.id)

            return msg.channel.send(out)
        } else
            return msg.send('Você não entrou no jogo ainda...')
    } else
        return msg.send('Não tem nenhum jogo nesse canal... Você pode criar um usando `ty.hangman`')
}
