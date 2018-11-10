import { MessageAttachment } from 'discord.js'
import Canvas from 'canvas'

Canvas.registerFont('src/font/coolvetica.ttf', { family: 'Coolvetiva' })

export const desc = 'Mostra as coisas mais quentes do mundo'
export const usage = '<@user>'
export async function run (msg, suffix) {
    if (!msg.mentions.members.first())
        return 'wrong usage'

    let member = msg.mentions.members.first()
    let bg     = await Canvas.loadImage('src/img/hot.jpg')
    let avatar = await Canvas.loadImage(member.user.avatarURL({ format: 'png', size: 2048 }))
    let canvas = Canvas.createCanvas(bg.width, bg.height)
    let ctx    = canvas.getContext('2d')

    ctx.drawImage(bg, 0, 0)
    ctx.drawImage(avatar, 271, 470, 197, 197)
    ctx.font = '30px Coolvetica'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.translate(369, 665)
    ctx.fillText(member.displayName, 0, 0)
    ctx.font = '500 25px Coolvetica'
    ctx.fillText((Number(member.user.discriminator) * 100000).toLocaleString('pt-BR') + '°C', 0, 34)

    msg.send(new MessageAttachment(canvas.toBuffer(), 'hot.png'))
}
