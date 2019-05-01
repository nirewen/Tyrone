import Canvas from 'canvas'
import { MessageAttachment } from 'discord.js'
import { searchImage } from '../../utils/utils'

export const desc = 'Faz uma imagem perguntando se quer um baseado'
export const aliases = ['boof', 'bufa']
export async function run (msg) {
    const boof = await Canvas.loadImage('src/img/memes/quieres.png')
    const image = await Canvas.loadImage(await searchImage(msg).then(r => r.file))

    let canvas = Canvas.createCanvas(image.width, image.height)
    let ctx = canvas.getContext('2d')

    let ratio = boof.width / boof.height
    let w = canvas.width
    let h = w / ratio
    
    if (h > canvas.height) {
        h = canvas.height
        w = h * ratio
    }

    let xoff = w < canvas.width ? ((canvas.width - w) / 2) : 0
    let yoff = h < canvas.height ? ((canvas.height - h) / 2) : 0

    ctx.drawImage(image, 0, 0)
    ctx.drawImage(boof, xoff, yoff, w, h)

    msg.send(new MessageAttachment(canvas.toBuffer(), 'quieres.png'))
}
