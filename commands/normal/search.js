import { Google } from '../../api/Google'
import { MessageEmbed } from 'discord.js'
import request from 'request-promise-native'

export const desc = 'Procure resultados no Google'
export const help = 'Forneça um termo para achar resultados no Google'
export const usage = '<termo>'
export const aliases = ['google']
export async function run (msg, suffix) {
    if (!suffix)
        return 'wrong usage'

    const sites = await Google.search(suffix).then(r => r.data.items)

    if (!sites.length)
        return msg.send('Nenhum resultado encontrado...')

    let page = 0

    const embed = new MessageEmbed()
        .setAuthor(sites[page].title, `https://www.google.com/s2/favicons?domain=${sites[page].displayLink}`, sites[page].link)
        .setDescription(sites[page].snippet)
        .setThumbnail(sites[page].pagemap.cse_image && sites[page].pagemap.cse_image[0].src)
        .setFooter(`${page + 1}/${sites.length}`)
        .setColor(sites[page].displayLink && await request(`https://theme-color-url.now.sh/${sites[page].displayLink}`))

    let sentMsg = await msg.send(embed)

    for (let reaction of ['⬅',  '➡', '⏹', '🗑'])
        await sentMsg.react(reaction)

    msg.collector = sentMsg.createReactionCollector((r, u) => r.me && u.id === msg.author.id, { idle: 30E3 })
    msg.collector.on('collect', async function (r, u) {
        let [embed] = sentMsg.embeds

        if (r.emoji.name === '⬅' && sites[page - 1])
            page--

        if (r.emoji.name === '➡' && sites[page + 1])
            page++

        if (r.emoji.name === '⏹')
            return this.stop()

        if (r.emoji.name === '🗑')
            return r.message.delete()

        await r.message.edit(embed
            .setAuthor(sites[page].title, `https://www.google.com/s2/favicons?domain=${sites[page].displayLink}`, sites[page].link)
            .setDescription(sites[page].snippet)
            .setThumbnail(sites[page].pagemap.cse_image && sites[page].pagemap.cse_image[0].src)
            .setFooter(`${page + 1}/${sites.length}`)
            .setColor(sites[page].displayLink && await request(`https://theme-color-url.now.sh/${sites[page].displayLink}`)))

        await r.users.remove(u)
    })
    msg.collector.on('end', () => sentMsg.reactions.removeAll())
}
