import { MessageEmbed, Util } from 'discord.js'
import { MCServerStatus } from '../../api/MCServerStatus'

export const desc = 'Mostra as informações de um servidor Minecraft'
export const usage = '<ip do servidor>'
export const aliases = ['mcstatus']
export async function run (msg, suffix) {
    if (!suffix)
        return 'wrong usage'

    try {
        let server = await MCServerStatus.get(suffix)
        let embed = new MessageEmbed()
            .setAuthor(server.hostname || suffix, server.icon)
            .setThumbnail(server.icon)
            .setColor('RED')

        if (!server.offline) {
            embed
                .setDescription(server.motd.clean)
                .addField(`Jogadores online:   ${server.players.online} / ${server.players.max}`, server.players.list.slice(0, 15).map(s => Util.escapeMarkdown(s)).join(', '))
                .setColor('GREEN')
            
            if (server.software)
                embed.addField('Sistema', server.software, true)

            embed.addField('Versão', server.version, true)
        } else
            embed.setDescription('O servidor está offline')

        await msg.send(embed)
    } catch (e) {
        msg.send(e.message)
    }
}
