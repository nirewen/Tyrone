import { MessageEmbed } from 'discord.js'

export const aliases = ['p']
export async function run (msg, letter) {
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
            let embed = new MessageEmbed()
                .setTitle('Jogo da Forca')
                .setFooter(game.misses.join(' '))
                .setThumbnail(game.man)
                .setColor('BLUE')

            if (won) {
                embed
                    .setDescription(`Parabéns ${game.player.user.username}! Você acertou a última letra\n\n${game.word}`)
                    .addField('Placar', game.players.sort((p, n) => p.score > n.score).map((p, i) => `#${i + 1} - ${p.score} pontos - ${p.user}`))

                this.bot.games.get('hangman').delete(msg.channel.id)
            }
            else {
                game.next()
                embed.setDescription(`Agora é a vez de ${game.player.user}\n\n ${game.word}`)
            }

            return msg.channel.send(embed)
        } catch (e) {
            if (e.message === 'man hang') {
                this.bot.games.get('hangman').delete(msg.channel.id)
                
                return msg.channel.send(new MessageEmbed()
                    .setTitle('Jogo da Forca')
                    .setDescription(`Muitas tentativas falhas... O homem foi enforcado... F\n\nA palavra era\n\n${game.word}`)
                    .setFooter(game.misses.join(' '))
                    .setThumbnail(game.man)
                    .setColor('BLUE'))
            }

            return msg.channel.send(e.message)
        }
    } else
        return msg.send('Não tem nenhum jogo nesse canal... Você pode criar um usando `ty.hangman`')
}
