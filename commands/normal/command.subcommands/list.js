import { MessageEmbed, Util } from 'discord.js'
import TatsuScript from '../../../structures/interpreter/TatsuScript'

export const desc = 'Mostra a lista de comandos customizados do servidor'
export const guildOnly = true
export const aliases = ['ls']
export async function run (msg) {
    let commands = await this.bot.database.get(`guilds/${msg.guild.id}/commands`).then(d => d.val())
    let embed = new MessageEmbed()
        .setTitle(`Comandos personalizados de ${Util.cleanContent(msg.guild.name)}`)
        .setColor('ORANGE')

    if (!commands)
        return msg.send(embed
            .setDescription('Nenhum'))

    commands = Object.entries(commands).reduce((c, [name, command]) => {
        msg.command = { name }

        let { prefix } = TatsuScript.run(command.script, msg)

        if (!c[prefix])
            c[prefix] = ''

        c[prefix] += '`' + name + '` '

        return c
    }, {})

    embed.fields = Object.entries(commands).map(([name, value]) => ({ name, value }))

    msg.send(embed)
}
