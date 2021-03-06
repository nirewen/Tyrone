import { MessageAttachment, MessageEmbed } from 'discord.js'
import request from 'request-promise-native'
import * as util from './minecraft.utils/utils'
import { Visage } from '../../api/Visage'

const MOJANG = 'https://api.mojang.com/users/profiles/minecraft/'

export const desc = 'Veja seu avatar do Minecraft!'
export const usage = '<username>'
export const aliases = ['mca']
export async function run (msg, suffix) {
    if (!suffix)
        return 'wrong usage'

    let [username] = suffix.split(' ')

    if (!util.validateUsername(username))
        return msg.send('Nome do usuário inválido (somente A-Z, a-z, 0-9 e _ de 3-32 caracteres)')

    let mojang = await request({ url: `${MOJANG}${username}`, json: true })

    if (!mojang)
        return msg.send(new MessageEmbed()
            .setDescription('Este usuário não existe')
            .setColor('RED'))

    let image = await request({ url: Visage.avatar(mojang.id), encoding: null })

    if (image)
        return msg.send(new MessageAttachment(image, `${username}.png`))
}
