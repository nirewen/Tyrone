import { MessageEmbed } from 'discord.js'
import request from 'request-promise-native'

const requestDog = async () => {
    let { url } = await request({ url: 'https://random.dog/woof.json', json: true })

    if (/(.gif|.png|.jpg)$/.test(url.toLowerCase()))
        return url
    else
        return requestDog()
}

export const desc = 'Envia a imagem de um cachorro'
export async function run (msg) {
    let url = await requestDog()
    let message = await msg.send(new MessageEmbed()
        .setDescription(':dog: Woof!')
        .setImage(url)
        .setColor('ORANGE'))

    await message.react('🔄')
    await message.react('⏹')
    await message.react('🗑')

    msg.collector = message.createReactionCollector((r, u) => r.me && u.id === msg.author.id)

    msg.collector.on('collect', async function (r, u) {
        if (r.emoji.name === '🔄') {
            let url = await requestDog()
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
