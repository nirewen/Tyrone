import { MessageEmbed } from 'discord.js'
import reddit from 'random-puppy'

export const desc = 'Procure imagens em um subreddit'
export const usage = '<subreddit>'
export async function run (msg, suffix) {
    if (!suffix)
        return 'wrong usage'

    let res = await reddit(suffix)
    let embed = new MessageEmbed()
        .setAuthor(`Reddit: ${suffix}`, 'https://www.redditstatic.com/desktop2x/img/favicon/apple-icon-114x114.png')
        .setColor('ORANGE')

    if (!res)
        return msg.send(embed
            .setDescription('Nenhuma imagem foi encontrada nesse subreddit')
            .setColor('RED'))

    let message = await msg.send(embed.setImage(res))

    await message.react('🔄')

    msg.collector = message.createReactionCollector((r, u) => r.me && u.id === msg.author.id, { idle: 3 * 60 * 1000 })

    msg.collector.on('collect', async function (r, u) {
        let [embed] = message.embeds

        res = await reddit(suffix)

        embed.setImage(res)

        r.users.remove(u)

        return message.edit(embed)
    })

    msg.collector.on('stop', (collected, reason) => {
        if (reason === 'idle')
            message.reactions.removeAll()
    })
}
