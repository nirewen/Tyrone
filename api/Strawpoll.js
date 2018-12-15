import Canvas from 'canvas'
import request from 'request-promise-native'

const colors = ['#3EB991', '#FF7563', '#AA66CC', '#FFBB33', '#FF8800', '#33B5E5']

export class Strawpoll {
    static post (question, options) {
        let form = {
            question, 
            priv: 'on',
            ...options.reduce((c, n, i) => (c[`a${i}`] = n) && c, {})
        }

        return request.post({
            url: 'https://strawpoll.com/new', 
            form, 
            followAllRedirects: true, 
            resolveWithFullResponse: true 
        }).then(r => r.request.uri)
    }

    static get (pid) {
        return request({
            url: `https://strawpoll.com/results`, 
            qs: { pid },
            json: true
        })
    }

    static render (body) {
        let chart = Canvas.createCanvas(260, 260)
        let ctx = chart.getContext('2d')
        let start = -(Math.PI / 2)
        let radius = chart.width / 2
        let total = body.total_votes
        let getColor = i => {
            let color = colors[i % 6]

            if ((i === (body.data.length - 1)) && color === colors[0])
                return getColor(i + 1)

            return color
        }
            
        ctx.translate(chart.width / 2, chart.height / 2)

        ctx.strokeStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.lineWidth = 2
        ctx.moveTo(0, 0)
        ctx.lineTo(Math.cos(start) * radius, Math.sin(start) * radius)
        ctx.stroke()
            
        for (let [i, data] of body.data.entries()) {
            if (data.votes === 0)
                continue
                
            let end = Math.PI * 2 * (data.votes / total)
            
            ctx.fillStyle = getColor(i)
            ctx.beginPath()
            ctx.arc(0, 0, chart.height / 2, start, start + end, false)
            ctx.lineTo(0, 0)
            ctx.fill()
            ctx.strokeStyle = '#FFFFFF'
            ctx.beginPath()
            ctx.lineWidth = 2
            ctx.moveTo(0, 0)
            ctx.lineTo(Math.cos(start) * radius, Math.sin(start) * radius)
            ctx.moveTo(0, 0)
            ctx.lineTo(Math.cos(start + end) * radius, Math.sin(start + end) * radius)
            ctx.stroke()
            ctx.fillStyle = '#444'
            
            let angle = (end / 2) + start
            
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            
            if (end > 0.28) {
                ctx.save()
                ctx.translate(Math.cos(angle) * (radius / 1.8), Math.sin(angle) * (radius / 1.8))
                ctx.rotate(angle < Math.PI / 2 ? angle : angle - Math.PI)
                ctx.font = '16px Lato'
                ctx.fillText(data.name.slice(0, 11), 0, 0)
                ctx.restore()
            }
            
            start += Math.PI * 2 * (data.votes / total)
        }

        ctx.beginPath()
        ctx.fillStyle = '#FFFFFF'
        ctx.arc(0, 0, 2, 0, 2 * Math.PI, false)
        ctx.fill()

        return chart.toBuffer()
    }
}
