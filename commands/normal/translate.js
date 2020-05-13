import { GoogleTranslate, languages } from '../../api/GoogleTranslate'
import { MessageEmbed } from 'discord.js'

export const description = 'Traduz um texto de uma língua para outra'
export const usage = '<lingua> <texto>'
export const liases = ['tradutor', 'traduzir']
export async function run (msg, suffix) {
    if (!suffix)
        return 'wrong usage'

    const emojiTranslate = this.bot.emojis.cache.find(e => e.guild.id === '199330631061078017' && e.name === 'translate')
    let args = suffix.split(' ')
    let from = 'auto'
    let to = args[0]

    suffix = args.slice(1).join(' ')

    if (args[0].split(/-(.+)/).length > 1) {
        from = args[0].split(/-(.+)/)[0]
        to   = args[0].split(/-(.+)/)[1]
    }

    let res = await GoogleTranslate.translate(suffix, from, to)
        .catch(e => {
            msg.send(new MessageEmbed()
                .addField(`${emojiTranslate} Tradutor`, `Não foi possível traduzir de \`${from}\` para \`${to}\``)
                .setColor('RED'))
        })

    let message = await msg.send(new MessageEmbed()
        .addField(`${emojiTranslate} Tradutor`, `\u200b`)
        .addField(`${languages[res.sourceLanguage] || res.sourceLanguage}`, res.source, true)
        .addField(`${languages[res.outputLanguage] || res.outputLanguage}`, res.output, true)
        .setColor('BLUE'))

    await message.react(this.bot.emojis.cache.find(e => e.guild.id === '199330631061078017' && e.name === 'switch'))

    msg.collector = message.createReactionCollector((r, u) => r.me && u.id === msg.author.id, { idle: 3E4 })

    msg.collector.on('collect', async function (r, u) {
        res = await GoogleTranslate.translate(res.output, res.outputLanguage, res.sourceLanguage)

        message.edit(new MessageEmbed()
            .addField(`${emojiTranslate} Tradutor`, `\u200b`)
            .addField(`${languages[res.sourceLanguage] || res.sourceLanguage}`, res.source, true)
            .addField(`${languages[res.outputLanguage] || res.outputLanguage}`, res.output, true)
            .setColor('BLUE'))

        await r.users.remove(u)
    })

    msg.collector.on('end', () => message.reactions.removeAll())
}
