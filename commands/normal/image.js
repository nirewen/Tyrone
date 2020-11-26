import { Google } from '../../api/Google'
import { MessageEmbed } from 'discord.js'

export const desc = 'Procure imagens no Google'
export const help = 'Forneça um termo para achar imagens no Google'
export const usage = '<termo>'
export const aliases = ['img']
export async function run (msg, suffix) {
    if (!suffix)
        return 'wrong usage'

    const images = await Google.image(suffix).then(r => r.data.items ? r.data.items.map(i => i.link) : [])

    if (!images.length)
        return msg.send('Nenhuma imagem encontrada...')

    let page = 0

    const embed = new MessageEmbed()
        .setAuthor(msg.author.username, msg.author.avatarURL())
        .setDescription(suffix)
        .setImage(images[page])
        .setFooter(`${page + 1}/${images.length}`)
        .setColor('BLUE')

    let sentMsg = await msg.send(embed)

    for (let reaction of ['⬅',  '➡', '⏹', '🗑'])
        await sentMsg.react(reaction)

    msg.collector = sentMsg.createReactionCollector((r, u) => r.me && u.id === msg.author.id, { idle: 30E3 })
    msg.collector.on('collect', async function (r, u) {
        let [embed] = sentMsg.embeds

        if (r.emoji.name === '⬅' && images[page - 1])
            page--

        if (r.emoji.name === '➡' && images[page + 1])
            page++

        if (r.emoji.name === '⏹')
            return this.stop()

        if (r.emoji.name === '🗑')
            return r.message.delete()

        await r.message.edit(embed
            .setImage(images[page])
            .setFooter(`${page + 1}/${images.length}`))

        await r.users.remove(u)
    })
    msg.collector.on('end', () => sentMsg.reactions.removeAll())
}
