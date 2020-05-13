import { Dicio } from '../../api/Dicio'
import { MessageEmbed } from 'discord.js'

export const desc = 'Procure significados de palavras'
export const help = 'Forneça uma palavra para ver o significado dela'
export const usage = '<palavra>'
export async function run (msg, suffix) {
    if (!suffix)
        return 'wrong usage'

    const result = await Dicio.fetch(suffix, msg.props.has('first')).catch(e => e)
    const embed = new MessageEmbed()
        .setTitle('\uD83D\uDCD6 Dicio')
        .setColor('#91D3FF')

    if (result.error)
        embed
            .setDescription(`Esta palavra não foi encontrada...\n\nVocê quis dizer **${result.error.suggestions.join('**, **')}**?`)
            .setColor('#FF9C91')
    else {
        embed
            .setTitle(`${embed.title} — Significado de **${result.word}**`)
            .setDescription(result.meaning.map(m => `*${m.type}*\n\n${m.description.join('\n')}\n${m.etymology ? '\n__' + m.etymology + '__' : ''}`))

        if (result.synonyms.length)
            embed.addField(`<:synonym:393098157132611594> Sinônimos de **${result.word}**`, result.synonyms.join(', '))
        if (result.antonyms.length)
            embed.addField(`<:antonym:393098156855787541> Antônimos de **${result.word}**`, result.antonyms.join(', '))

        if (result.examples.length)
            embed.addField(':pen_fountain: Exemplos em frases', result.examples.join(`\n\n`))
        
        if (result.image)
            embed.setImage(result.image)
    }

    msg.send(embed)
}
