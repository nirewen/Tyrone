import { MessageEmbed } from 'discord.js'
import request from 'request-promise-native'
import { TCA_API_KEY } from '@env'

const BASE = 'http://thecatapi.com/api/images'

const requestCat = () => request({
    url: `${BASE}/get?format=json`,
    json: true,
    transform: ([b]) => b
})

export const desc = 'Envia a imagem de um pássaro'
export async function run (msg) {
    let { url, id } = await requestCat()
    let message = await msg.send(new MessageEmbed()
        .setDescription(':cat: Meow!')
        .setImage(url)
        .setFooter(`${msg.author.tag} • Use ⬆ ou ⬇ para aprovar ou rejeitar a imagem`, msg.author.avatarURL({ size: 2048 }))
        .setColor('BLUE'))

    await message.react('⬆')
    await message.react('⬇')

    if (msg.guild && msg.guild.me.permissions.has('MANAGE_MESSAGES')) {
        await message.react('🔄')
        await message.react('⏹')
    }

    await message.react('🗑')

    msg.collector = message.createReactionCollector((r, u) => r.me && u.id === msg.author.id)

    msg.collector.on('collect', async function (r, u) {
        if (['⬆', '⬇'].includes(r.emoji.name)) {
            let score = { '⬆': 10, '⬇': 1 }[r.emoji.name]

            let [embed] = message.embeds

            embed.setFooter(`${msg.author.tag} • ⭐ ${score}`, msg.author.avatarURL({ size: 2048 }))

            await message.edit(embed)

            request({
                url: `${BASE}/vote`,
                qs: {
                    api_key: TCA_API_KEY,
                    sub_id: msg.author.id,
                    image_id: id,
                    score
                }
            })
        }

        if (r.emoji.name === '🔄') {
            let { url, id: newId } = await requestCat()
            let [embed] = message.embeds

            embed.setImage(url)
            embed.setFooter(`${msg.author.tag} • Use ⬆ ou ⬇ para aprovar ou rejeitar a imagem`, msg.author.avatarURL({ size: 2048 }))

            await message.edit(embed)

            id = newId
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
