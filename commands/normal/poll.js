import { MessageEmbed } from 'discord.js'
import { Strawpoll } from '../../api/Strawpoll'

export const desc = 'Crie enquetes pelo Discord'
export const help = 'Crie uma enquete com ao menos duas opções e veja as pessoas votar'
export const usage = '<título> | <opção> | <opção> [| opção...]'
export async function run (msg, suffix) {
    const [question, ...options] = suffix.split(/\s*\|\s*/)

    if (!question || options.length < 2)
        return 'wrong usage'

    const { pathname, href } = await Strawpoll.post(question, options)

    msg.send(new MessageEmbed()
        .setAuthor('strawpoll', 'https://strawpoll.com/images/pie-chart-small.png', href)
        .setDescription(`${msg.author} criou uma enquete!\n\nPara acessar, clique [aqui](${href})`)
        .addField(`${question} - opções:`, options.map(o => `◽ ${o}`))
        .setFooter(`ID: ${pathname.slice(1)}`))
}
