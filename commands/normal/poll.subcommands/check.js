import { MessageAttachment, MessageEmbed } from 'discord.js'
import { Strawpoll } from '../../../api/Strawpoll'

export const desc = 'Verifique o estado de uma enquete'
export const help = 'Forneça um ID de uma enquete para ver o estado dela'
export const usage = '<ID>'
export const aliases = ['status']
export async function run (msg, pid) {
    if (!pid)
        return 'wrong usage'

    const body = await Strawpoll.get(pid)
    const chart = Strawpoll.render(body)

    const votes = body.data.map(vote => {
        let percentage = Math.round(((vote.votes * 100) / (body.total_votes || 1)) / 30)
        let remaining = 30 - percentage
        let bar = `${'█'.repeat(percentage)}${'_ '.repeat(remaining)}`

        return `${vote.name} - ${parseFloat(percentage.toFixed(2))}% (${vote.votes} votos)\n\`${bar}\``
    })

    msg.send(new MessageEmbed()
        .setAuthor('strawpoll', 'https://strawpoll.com/images/pie-chart-small.png', `http://strawpoll.com/${pid}`)
        .setDescription(`**${body.total_votes}** votos no total`)
        .addField(body.title, votes.map((e, i, a) => i >= 10 ? `e mais ${a.length - 10} opções` : e).slice(0, 11))
        .setImage('attachment://chart.png')
        .setFooter('Enquete criada em')
        .setTimestamp(new Date(body.date_created))
        .attachFiles([new MessageAttachment(chart, 'chart.png')]))
}
