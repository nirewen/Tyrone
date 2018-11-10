import request from 'request-promise-native'
import { MessageEmbed } from 'discord.js'

export const desc = 'Envia imagens com citações inspiracionais (às vezes)'
export const aliases = ['inspiro', 'quote']
export async function run (msg) {
    let url = await request({ url: 'http://inspirobot.me/api?generate=true&oy=vey' })

    msg.send(new MessageEmbed()
        .setAuthor('InspiroBot', 'http://inspirobot.me/website/images/inspirobot-dark-green.png', 'http://inspirobot.me')
        .setImage(url)
        .setColor('#1B3715'))
}
