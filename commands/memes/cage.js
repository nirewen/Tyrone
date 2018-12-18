import { MessageAttachment } from 'discord.js'
import request from 'request-promise-native'

export const desc = 'Manda uma imagem aleatória com o Nicolas Cage nela'
export async function run (msg) {
    const image = await request({ url: `http://cageme.herokuapp.com/specific/${Math.floor(Math.random() * 79)}`, encoding: null })

    msg.send(new MessageAttachment(image, 'cage.png'))
}
