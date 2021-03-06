import { MessageEmbed } from 'discord.js'

export const desc = 'Faz uma tentativa de acertar a palavra do jogo'
export const help = 'Esse comando pode ser usado em qualquer rodada, mesmo se não for sua vez. Não é contado como penalidade se você errar'
export const aliases = ['g']
export const usage = '<palavra>'
export async function run (msg, word) {
    if (!word)
        return 'wrong usage'
        
    let game = this.bot.games.get('hangman').get(msg.channel.id)

    if (game) {
        if (!game.started)
            return msg.send('Esse jogo ainda não começou')

        if (!game.players.has(msg.author.id))
            return msg.send('Você não tá participando desse jogo')

        try {
            let guessed = game.guess(word)
            let embed = new MessageEmbed()
                .setTitle('Jogo da Forca')
                .setDescription(game.word)
                .setFooter(game.misses.join(' '))

            if (guessed) {
                embed.setDescription(`Parabéns ${msg.author.username}! Você acertou a palavra!\n\n` + embed.description)
                this.bot.games.get('hangman').delete(msg.channel.id)
            }

            return msg.channel.send(embed)
        } catch (e) {
            return msg.channel.send(e.message)
        }
    } else
        return msg.send('Não tem nenhum jogo nesse canal... Você pode criar um usando `ty.hangman`')
}
