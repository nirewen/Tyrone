import { MessageAttachment, MessageEmbed, Util } from 'discord.js'

export const aliases = ['s']
export async function run (msg) {
    let game = this.bot.games.get('uno').get(msg.channel.id)

    if (!game)
        return msg.send('Nenhum jogo foi registrado nesse canal.')

    if (game.started)
        return msg.send('O jogo já começou')

    if (game.queue.length > 1) {
        if (game.player.id !== msg.author.id)
            return msg.send('Você não pode iniciar um jogo que não criou!')

        await game.dealAll(game.rules.initialCards.value)

        game.table.discard.push(game.deck.pop())
        game.started = true
        let extra = ''

        if (['WILD', 'WILD+4'].includes(game.table.flipped.id))
            extra += '\n\nVocê pode jogar qualquer carta.'

        return msg.channel.send(new MessageEmbed()
            .setAuthor('UNO', 'https://i.imgur.com/Zzs9X74.png')
            .setDescription(`O jogo começou com ${game.queue.length} jogadores! A carta à mesa é **${game.table.flipped}**. \n\nAgora é o turno de ${Util.escapeMarkdown(game.player.user.username)}!${extra}`)
            .setThumbnail('attachment://card.png')
            .setColor(game.table.flipped.colorCode)
            .attachFiles([new MessageAttachment(game.table.flipped.URL, 'card.png')]))
    }
    else
        return msg.send('Não há pessoas suficientes pra jogar!')
}
