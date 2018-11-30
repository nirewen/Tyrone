import moment from 'moment'
import request from 'request-promise-native'
import { MessageEmbed, Util } from 'discord.js'
import { Visage } from '../../utils/Visage'
import { NameMC } from '../../utils/NameMC'

const MINECRAFT = 'https://minecraft.net/en-us/profile/skin/remote'

export const desc = 'Mostra as informações de um usuário Minecraft'
export const usage = '<username>'
export const aliases = ['mci']
export async function run (msg, suffix) {
    if (!suffix)
        return 'wrong usage'
    
    let [username] = suffix.split(' ')
    let mojang = await request({ url: `https://api.mojang.com/users/profiles/minecraft/${username}`, json: true })
    
    if (!mojang)
        return msg.send(new MessageEmbed()
            .setDescription('Usuário não encontrado')
            .setColor('RED'))

    let { id } = mojang
    let nicknames = await NameMC.getNicknames(id)
    let embed = new MessageEmbed()
        .setAuthor(username, Visage.avatar(id))
        .setThumbnail(Visage.avatar(id))
        .setImage(Visage.full(id))
        .addField('Nickname', username, true)
        .addField('UUID', id, true)
        .setColor('BLUE')

    if (nicknames.length > 0) {
        embed.addField('Histórico de nomes', nicknames.map(n => Util.escapeMarkdown(n.username)), true)
        if (nicknames.map(n => n.date).length > 0)
            embed.addField('\u200b', nicknames.map(n => n.date && moment(n.date).format('DD/MM/YYYY [-] HH:mm')), true)
    }

    embed.addField('Skin', `[Baixar](${Visage.skin(id)} "Clique para baixar a skin") | [Aplicar](${MINECRAFT}?url=${Visage.skin(id)} "Clique para aplicar a skin à sua conta")`)
    
    msg.send(embed)
}
