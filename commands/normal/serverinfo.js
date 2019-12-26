import { MessageEmbed, Util } from 'discord.js'
import { format, regions, regionEmojis } from './serverinfo.utils/utils'
import moment from 'moment'

export const desc = 'Exibe um card de informações do servidor'
export const guildOnly = true
export const aliases = ['server', 'si']
export async function run (msg) {
    const findEmoji = name => this.bot.emojis.find(e => e.name === name && e.guild.id === '199330631061078017')
    let { name, id, icon, members, region, roles, channels, owner, joinedAt, createdAt } = msg.guild
    let guildIcon = icon ? msg.guild.iconURL({ format: 'png', size: 2048 }) : `https://guild-default-icon.herokuapp.com/${msg.guild.nameAcronym}`
    let statuses = msg.guild.members.reduce((c, n) => {
        c[n.presence.status] = (c[n.presence.status] || 0) + 1

        if (n.user.bot)
            c.bots = (c.bots || 0) + 1
        else
            c.users = (c.users || 0) + 1

        return c
    }, {})
    let regionEmoji = Object.entries(regionEmojis).find(([e, v]) => v.includes(region))
    let serverEmoji = ':earth_americas: Desconhecida'

    if (!regionEmoji)
        console.warn(region)
    else
        serverRegion = regions[region]

    msg.send(new MessageEmbed()
        .setTitle(`${findEmoji('discord')} ${Util.escapeMarkdown(name)}`)
        .setThumbnail(guildIcon)
        .addField(':snowflake: ID', id, true)
        .addField(':crown: Dono', owner, true)
        .addField(`${regionEmoji} Região`, serverRegion, true)
        .addField(':speech_balloon: Canais', [
            `${findEmoji('text')}` + channels.filter(c => c.type === 'text').size,
            `${findEmoji('voice')}` + channels.filter(c => c.type === 'voice').size
        ], true)
        .addField(':date: Criado em', moment(createdAt).format(format))
        .addField(':star2: Entrei aqui em', moment(joinedAt).format(format))
        .addField(`:busts_in_silhouette: Membros [${members.size}]`, [
            `${findEmoji('online')} ${statuses.online || 0}\t\t`,
            `${findEmoji('idle')} ${statuses.idle || 0}\t\t`,
            `${findEmoji('dnd')} ${statuses.dnd || 0}\t\t`,
            `${findEmoji('offline')} ${statuses.offline || 0}\n`,
            `:man_in_tuxedo: **Pessoas**: ${members.filter(m => !m.user.bot).size}\n`,
            `:robot: **Bots**: ${members.filter(m => m.user.bot).size}`
        ].join(''))
        .addField(`:briefcase: Cargos [${roles.size}]`, roles.size > 0 ? Util.discordSort(roles).map(r => r).reverse().slice(0, 15).join(', ') : 'Nenhum')
        .setColor(owner.displayColor))
}
