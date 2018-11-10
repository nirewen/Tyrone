import { MessageEmbed } from 'discord.js'
import request from 'request-promise-native'

const requestBunny = () => request({
    url: 'https://api.bunnies.io/v2/loop/random/?media=poster',
    json: true,
    transform: b => b.media.poster
})

export const desc = 'Envia a imagem de um coelho'
export async function run (msg) {
    let url = await requestBunny()
    let message = await msg.send(new MessageEmbed()
        .setDescription(':rabbit: Tee tee!')
        .setImage(url)
        .setColor('RED'))

    await message.react('🔄')
    await message.react('⏹')
    await message.react('🗑')

    msg.collector = message.createReactionCollector((r, u) => r.me && u.id === msg.author.id)

    msg.collector.on('collect', async function (r, u) {
        if (r.emoji.name === '🔄') {
            let url = await requestBunny()
            let [embed] = message.embeds

            embed.setImage(url)

            await message.edit(embed)
        }

        if (r.emoji.name === '⏹')
            this.stop()

        if (r.emoji.name === '🗑') {
            this.stop()
            return message.delete()
        }

        await r.users.remove(u)
    })

    msg.collector.on('end', () => message.reactions.removeAll())
}
