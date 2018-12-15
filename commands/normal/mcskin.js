import { MessageAttachment, MessageEmbed } from 'discord.js'
import request from 'request-promise-native'
import { Visage } from '../../api/Visage'

const MOJANG = 'https://api.mojang.com/users/profiles/minecraft/'

export const desc = 'Veja sua skin do Minecraft!'
export const usage = '<username>'
export const aliases = ['mcs']
export async function run (msg, suffix) {
    if (!suffix)
        return 'wrong usage'

    let [username] = suffix.split(' ')
    let mojang = await request({ url: `${MOJANG}${username}`, json: true })

    if (!mojang)
        return msg.send(new MessageEmbed()
            .setDescription('Este usuário não existe')
            .setColor('RED'))

    let image = await request({ url: Visage.full(mojang.id), encoding: null })

    if (image)
        return msg.send(new MessageAttachment(image, `${username}.png`))
}
