import Canvas from 'canvas'
import { CanvasUtils } from './CanvasUtils'
import { DarkSky } from '../api/DarkSky'
import { GoogleMaps } from '../api/GoogleMaps'
import moment from 'moment-timezone'

moment.locale('pt-br')

Canvas.registerFont('src/font/Product Sans Regular.ttf', { family: 'Product' })

export class Weather {
    static async card (address) {
        const { location, lat, lng } = await GoogleMaps.reverse(address)
        const body = await DarkSky.forecast(lat, lng)

        let condition     = body.currently.summary.replace(/ligeiramente /gi, '').slice(0, 25)
        let temperature   = `${parseFloat(body.currently.temperature.toFixed(1))}°`
        let windSpeed     = `${body.currently.windSpeed} km/h`
        let windBearing   = body.currently.windBearing
        let windDirection = 'NW'
        let maxMin        = `${parseFloat(body.daily.data[0].temperatureMax.toFixed(1))}°↑ ${parseFloat(body.daily.data[0].temperatureMin.toFixed(1))}°↓ `
        let timeTz        = moment.unix(body.currently.time).tz(body.timezone)
        let time          = new Date(timeTz._d.valueOf() + timeTz._d.getTimezoneOffset() * 60000)
        let date          = moment(time).format('HH:mm').toLowerCase()
        let color         = [
            '#131862', '#11206f', '#0f287c', '#0e3189', '#0c3996',
            '#0b42a3', '#094ab0', '#0752bd', '#065bca', '#0463d7',
            '#036ce4', '#0174f1', '#007dff', '#0174f1', '#036ce4',
            '#0463d7', '#065bca', '#0752bd', '#094ab0', '#0b42a3',
            '#0c3996', '#0e3189', '#0f287c', '#11206f', '#131862', '#a1a9b1'
        ][condition === 'Nevoeiro' ? 25 : time.getHours()]

        if      (windBearing > 157 && windBearing <= 202) windDirection = 'N'
        else if (windBearing > 202 && windBearing <= 247) windDirection = 'NE'
        else if (windBearing > 247 && windBearing <= 292) windDirection = 'L'
        else if (windBearing > 292 && windBearing <= 337) windDirection = 'SE'
        else if (windBearing > 337 || windBearing <=  22) windDirection = 'S'
        else if (windBearing >  22 && windBearing <=  67) windDirection = 'SO'
        else if (windBearing > 967 && windBearing <= 157) windDirection = 'O'
        else windDirection = 'NO'

        body.daily.data.shift()

        let icon = await Canvas.loadImage(`src/img/weather/${body.currently.icon}.png`)

        let canvas = Canvas.createCanvas(400, 281)
        let ctx    = canvas.getContext('2d')

        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        ctx.shadowOffsetY = 1
        ctx.shadowBlur = 2
        ctx.fillStyle = color
        ctx.fillRect(7, 167, 386, 101)

        let curr  = ~~(body.currently.temperature * 50 / 100)
        let temps = body.daily.data.map(t => t.temperatureHigh)
        let min = Math.min(...temps)
        let max = Math.max(...temps) - min

        let points = temps.map((temp, i) => {
            return {
                x: (i * 55) + 35,
                y: 248 - ((temp - min) * 60) / max
            }
        })

        ctx.strokeStyle = '#ffcc00'
        ctx.shadowColor = 'rgba(0, 0, 0, 0)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(7, 248 - ((curr - (curr < min ? curr : min)) * 60) / max)

        points.push({
            x: 393,
            y: 248 - ((curr - (curr < min ? curr : min)) * 60) / max
        })

        for(let i = 0; i < points.length - 1; i++) {
            let x_mid = (points[i].x + points[i+1].x) / 2
            let y_mid = (points[i].y + points[i+1].y) / 2
            let cp_x1 = (x_mid + points[i].x) / 2
            let cp_x2 = (x_mid + points[i+1].x) / 2

            ctx.quadraticCurveTo(cp_x1, points[i].y, x_mid, y_mid)
            ctx.quadraticCurveTo(cp_x2, points[i+1].y, points[i+1].x, points[i+1].y)
        }

        // for (let [i, temp] of temps.entries()) {
        //     ctx.lineTo((i * 55) + 35, 255 - ((temp - min) * 73) / max)
        // }
        ctx.stroke()
        ctx.lineTo(393, 268)
        ctx.lineTo(7, 268)
        ctx.closePath()
        ctx.fillStyle = 'rgba(255, 204, 0, 0.2)'
        ctx.fill()

        ctx.fillStyle = '#ffffff'
        ctx.font = '15px Product'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
        ctx.shadowOffsetY = 1
        ctx.shadowBlur = 2

        for (let [i, { temperatureHigh }] of body.daily.data.entries())
            ctx.fillText(`${parseFloat(temperatureHigh.toFixed(1))}°`, (i * 55) + 38, 256)

        ctx.font = `12px Product`

        for (let [i, { time, icon }] of body.daily.data.entries()) {
            ctx.fillText(moment.unix(time).format('ddd').toUpperCase(), (i * 55) + 35, 181)
            let week = await Canvas.loadImage(`src/img/weather/${icon}.png`)
            ctx.drawImage(week, (i * 55) + 9, 189, 53, 53)
        }

        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        ctx.fillStyle = color
        ctx.fillRect(7, 8, 386, 160)

        ctx.drawImage(icon, 272, 35, 95, 95)

        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
        ctx.font = `16px Product`
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText(location, 20, 16)

        ctx.font = `98px Product`
        ctx.fillText(temperature, 20, 30)

        ctx.font = `13px Product`
        // ctx.textAlign = 'center'
        // ctx.textBaseline = 'top'
        // ctx.fillText(condition, 320, 140)
        CanvasUtils.printText(ctx, condition, 272, 130, 15, 95)

        ctx.font = `16px Product`
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        let length = ctx.measureText(maxMin).width + 22
        ctx.fillText(maxMin, 20, 142)

        let gps = await Canvas.loadImage('src/img/gps.png')
        let wind = await Canvas.loadImage('src/img/wind.png')

        ctx.save()

        ctx.shadowBlur = 1
        ctx.translate(length, 141)
        ctx.drawImage(wind, -4, 0, 20, 20)
        ctx.font = `14px Product`
        ctx.fillText(windSpeed, 20, 2)
        ctx.translate(ctx.measureText(windSpeed).width + 25, 3)
        if (windBearing > 0) {
            ctx.translate(6, 6)
            ctx.fillText(windDirection, 10, -7)
            ctx.rotate((windBearing + 180) * Math.PI / 180)
            ctx.drawImage(gps, -6, -6, 12, 12)
        }

        ctx.restore()

        ctx.font = `13px Product`
        ctx.textAlign = 'right'
        ctx.textBaseline = 'top'
        ctx.fillText(date, 372, 16)

        return canvas
    }
}
