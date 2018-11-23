import { MessageEmbed } from 'discord.js'
import request from 'request-promise-native'
import { Visage } from '../../utils/Visage'

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
    
    msg.send(new MessageEmbed()
        .setAuthor(username, Visage.avatar(id))
        .setThumbnail(Visage.avatar(id))
        .setImage(Visage.full(id))
        .addField('Nickname', username, true)
        .addField('UUID', id, true)
        .addField('Skin', `[Baixar](${Visage.skin(id)} "Clique para baixar a skin") | [Aplicar](${MINECRAFT}?url=${Visage.skin(id)} "Clique para aplicar a skin à sua conta")`)
        .setColor('BLUE'))
}
