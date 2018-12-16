import Canvas from 'canvas'
import { MessageAttachment } from 'discord.js'
import { searchImage } from '../../utils/utils'

export const desc = 'Faz uma imagem ficar pixelada'
export const help = 'A imagem pode ser o avatar de @algúem, um anexo, ou uma imagem enviada previamente no chat'
export const usage = '[imagem | --fator n|10]'
export const aliases = ['pixel']
export async function run (msg) {
    let { file } = await searchImage(msg)
    let image = await Canvas.loadImage(file)

    let canvas = new Canvas(image.width, image.height)
    let ctx = canvas.getContext('2d')
    let size = (isNaN(msg.flags.get('fator')) || !msg.flags.has('fator') ? 10 : msg.flags.get('fator')) / 100
    let w = canvas.width * size
    let h = canvas.height * size

    ctx.drawImage(image, 0, 0, w, h)
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(canvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height)

    msg.send(new MessageAttachment(canvas.toBuffer(), 'pixelate.png'))
}
