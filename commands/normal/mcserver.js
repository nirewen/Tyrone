import { MessageAttachment, MessageEmbed, Util } from 'discord.js'
import { MCServerStatus } from '../../utils/MCServerStatus'

export const desc = 'Mostra as informações de um servidor Minecraft'
export const usage = '<ip do servidor>'
export const aliases = ['mcstatus']
export async function run (msg, suffix) {
    if (!suffix)
        return 'wrong usage'
    
    msg.channel.startTyping()

    let server = await MCServerStatus.get(suffix)
    let embed = new MessageEmbed()
        .setAuthor(server.hostname || suffix, 'attachment://icon.png')
        .setThumbnail('attachment://icon.png')
        .setColor('RED')

    if (!server.offline) {
        embed
            .setDescription(server.motd.raw)
            .addField(`Jogadores online:   ${server.players.online} / ${server.players.max}`, server.players.list.slice(0, 15).map(s => Util.escapeMarkdown(s)).join(', '))
            .setColor('GREEN')
        
        if (server.software)
            embed.addField('Sistema', server.software, true)

        embed.addField('Versão', server.version, true)
    } else
        embed.setDescription('O servidor está offline')

    embed.attachFiles([new MessageAttachment(server.icon, 'icon.png')])

    await msg.send(embed)

    msg.channel.stopTyping()
}