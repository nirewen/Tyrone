import { MessageEmbed } from 'discord.js'
import TatsuScript from '../../../structures/interpreter/TatsuScript'

export const desc = 'Teste um script antes de criar o comando'
export const guildOnly = true
export async function run (msg, suffix) {
    if (!suffix)
        return msg.send('Você precisa especificar um script')

    msg.command = { name: '' }

    let result = TatsuScript.run(suffix, msg)
    let embed = new MessageEmbed()
        .setTitle('Comando executado! Aqui está o resultado:')
        .setFooter('Você pode registrar o comando nesse servidor usando ty!cmd create <nome> <script>')
    
    for (let [name, value] of Object.entries(result)) {
        if (Array.isArray(value) && value.length > 0)
            value = '[' + value.join(', ') + ']'
        else if (!value || name === 'context' || !value.length)
            continue
            
        embed.fields.push({ name, value })
    }

    msg.send(embed)
}