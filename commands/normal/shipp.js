import Canvas from 'canvas'
import { CanvasUtils } from '../../utils/CanvasUtils'
import { getMentions } from '../../utils/utils'
import { MessageAttachment, MessageEmbed } from 'discord.js'
import texts from '../../src/words/shipps.json'

const shipps = {}
const range = (start, stop, step = 1) => {
    if (!stop) {
        stop = start
        start = 0
    }

    if ((step > 0 && start >= stop) || (step < 0 && start <= stop))
        return []

    let result = []
    for (var i = start; step > 0 ? i < stop : i > stop; i += step)
        result.push(i)

    return result
}

export const cooldown = 5
export const usage = '<@pessoa1> <@pessoa2>'
export const aliases = ['ship']
export async function run (msg, suffix) {
    if (!suffix)
        return 'wrong usage'

    let shipp = (uke, seme = '') => uke.substr(0, uke.length / 2) + seme.substr(seme.length / 2)
    let match = (uke, seme) => {
        let id1 = uke.id + ' ' + seme.id
        let id2 = seme.id + ' ' + uke.id

        if (shipps[id1] || shipps[id2])
            return shipps[id1]

        let percentage = Math.floor(Math.random() * 100)

        shipps[id1] = shipps[id2] = percentage

        return percentage
    }
    let getIcon = (p) => {
        if (p >= 90) return 'cupid'
        if (p >= 60) return 'pulse'
        if (p >= 50) return 'beat'
        if (p >= 20) return 'revolving'
        if (p >= 0) return 'broken'
    }
    let mentions = getMentions(msg)
    let generateBar = async (perc, uke, seme) => {
        let percRad = (perc * 2 * Math.PI) / 100
        let canvas = Canvas.createCanvas(500, 250)
        let ctx = canvas.getContext('2d')

        ctx.lineWidth = 25
        ctx.translate(canvas.width / 2, canvas.height / 2)
        CanvasUtils.ellipse(ctx, 0, 0, 109, '#DEDEDC')
        CanvasUtils.ellipse(ctx, 0, 0, 85, '#E4E4E4')

        ctx.save()
        ctx.rotate(-(Math.PI / 2))
        CanvasUtils.circle(ctx, 0, 0, 109, 0, percRad, { style: '#E75A70' })
        CanvasUtils.circle(ctx, 0, 0, 85, 0, percRad, { style: '#F2ABBA' })
        ctx.restore()

        ctx.save()
        ctx.lineWidth = 5
        CanvasUtils.ellipse(ctx, -(canvas.width / 2.6), 0, 50, '#BB1A34', { fill: true })
        CanvasUtils.ellipse(ctx, canvas.width / 2.6, 0, 50, '#BB1A34', { fill: true })
        ctx.restore()

        let img1 = await CanvasUtils.getPolygonImage(uke.user.displayAvatarURL({ format: 'png', size: 2048 }), 92, 0)
        let img2 = await CanvasUtils.getPolygonImage(seme.user.displayAvatarURL({ format: 'png', size: 2048 }), 92, 0)
        let icon = await Canvas.loadImage(`src/img/hearts/${getIcon(perc)}.png`)

        ctx.drawImage(img1, -(canvas.width / 2.6) - 48, -48, 96, 96)
        ctx.drawImage(img2, (canvas.width / 2.6) - 48, -48, 96, 96)
        ctx.drawImage(icon, -46, -46, 92, 92)

        return canvas
    }

    if (mentions) {
        if (mentions.members.length < 2)
            return 'wrong usage'

        if (mentions.members[1]) {
            let shipName = shipp(mentions.members[0].displayName, mentions.members[1].displayName)
            let perc = match(mentions.members[0], mentions.members[1])
            let text = texts.shippStrings[range(0, perc, 10).pop()]

            if (mentions.members[0].id === mentions.members[1].id)
                text = texts.shippStrings.same[range(0, perc, 10).pop()]

            return generateBar(perc, mentions.members[0], mentions.members[1]).then(image => {
                return msg.channel.send(new MessageEmbed()
                    .setDescription(`**LOVE-O-METER**\n\n:sparkling_heart: ${shipName}\n:thermometer: ${perc}%\n${text[Math.floor(Math.random() * text.length)]}`)
                    .setImage('attachment://shipp.png')
                    .setColor('#F2ABBA')
                    .attachFiles([new MessageAttachment(image.toBuffer(), 'shipp.png')]))
            })
        }
    }
}
