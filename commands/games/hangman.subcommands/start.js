import { MessageEmbed } from 'discord.js'

export const des = 'Inicia a partida de Jogo da Forca'
export const help = 'O mínimo de 2 jogadores é necessário para jogar, se uma palavra for escolhida. Se uma palavra aleatória for escolhida, o dono do jogo pode jogar sozinho.'
export async function run (msg) {
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

        return msg.channel.send(new MessageEmbed()
            .setTitle('Jogo da Forca')
            .setDescription(`Agora é a vez de ${game.player.user}\n\n${game.word}`)
            .setFooter(game.misses.join(' '))
            .setThumbnail(game.man)
            .setColor('BLUE'))
    } else
        return msg.send('Não tem nenhum jogo nesse canal... Você pode criar um usando `ty.hangman`')
}
