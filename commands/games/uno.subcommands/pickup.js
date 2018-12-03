import { MessageAttachment, MessageEmbed, Util } from 'discord.js'

export const aliases = ['pick', 'd', 'draw', 'c', 'comprar']
export async function run (msg) {
    let game = this.bot.games.get('uno').get(msg.channel.id)
    
    if (game) {
        if (!game.started)
            return 'Desculpa, mas o jogo ainda não começou!'

        if (game.player.id !== msg.author.id)
            return `Não é seu turno ainda! É a vez de ${Util.escapeMarkdown(game.player.user.username)}.`

        game.deal(game.player, 1)

        let { player } = game

        await game.next()
        
        return msg.channel.send(new MessageEmbed()
            .setAuthor('UNO', 'https://i.imgur.com/Zzs9X74.png')
            .setDescription(`${Util.escapeMarkdown(player.user.username)} comprou uma carta.\n\n**${game.table.flipped}** foi jogada por último. \n\nAgora é o turno de ${Util.escapeMarkdown(game.player.user.username)}!`)
            .setThumbnail('attachment://card.png')
            .setColor(game.table.flipped.colorCode)
            .attachFiles([new MessageAttachment(game.table.flipped.URL, 'card.png')]))
    }
    else
        return msg.send('Desculpa, mas um jogo não foi criado ainda! Você pode criar um com `ty.uno join`')
}
