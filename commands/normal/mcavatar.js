import { MessageAttachment, MessageEmbed } from 'discord.js'
import request from 'request-promise-native'
import { Visage } from '../../utils/Visage'

const MOJANG = 'https://api.mojang.com/users/profiles/minecraft/'

export const desc = 'Veja seu avatar do Minecraft!'
export const usage = '<nick>[ h]'
export const aliases = ['mca']
export async function run (msg, suffix) {
    if (!suffix)
        return 'wrong usage'

    let [username] = suffix.split(' ')
    let mojang = await request({ url: `${MOJANG}${username}`, json: true })

    if (!mojang)
        return msg.send(new MessageEmbed()
            .setDescription('Este usuário não existe')
            .setcolor('RED'))

    let image = await request({ url: Visage.avatar(mojang.id), encoding: null })
    
    if (image)
        return msg.send(new MessageAttachment(image, `${username}.png`))
}
