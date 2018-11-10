import { MessageEmbed } from 'discord.js'
import request from 'request-promise-native'

const requestBird = () => request({
    url: 'https://random.birb.pw/tweet.json',
    json: true,
    transform: b => `https://random.birb.pw/img/${b.file}`
})

export const desc = 'Envia a imagem de um pássaro'
export async function run (msg) {
    let url = await requestBird()
    let message = await msg.send(new MessageEmbed()
        .setDescription(':bird: Tweet!')
        .setImage(url)
        .setColor('GREEN'))

    await message.react('🔄')
    await message.react('⏹')
    await message.react('🗑')

    msg.collector = message.createReactionCollector((r, u) => r.me && u.id === msg.author.id)

    msg.collector.on('collect', async function (r, u) {
        if (r.emoji.name === '🔄') {
            let url = await requestBird()
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
