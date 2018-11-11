/* eslint-disable no-unused-vars */

import Canvas from 'canvas'

export const CanvasUtils = {
    printText: function (ctx, text, x, y, lH, fit) {
        fit = fit || 0

        if (fit <= 0) {
            ctx.fillText(text, x, y)
            return
        }

        let words = text.split(' ')
        let currentLine = 0
        let idx = 1

        while (words.length > 0 && idx <= words.length) {
            let str = words.slice(0, idx).join(' ')
            let w   = ctx.measureText(str).width
            if (w > fit) {
                if (idx === 1) {
                    idx = 2
                }
                let { width } = ctx.measureText(words.slice(0, idx - 1).join(' '))

                ctx.fillText(words.slice(0, idx - 1).join(' '), x + (fit - width) / 2, y + (lH * currentLine))
                currentLine++
                words = words.splice(idx - 1)
                idx = 1
            }
            else idx++
        }
        if  (idx > 0) {
            let { width } = ctx.measureText(words.join(' '))
            ctx.fillText(words.join(' '), x + (fit - width) / 2, y + (lH * currentLine))
        }
    },

    applyShadow: function (img, offset = { x: 1, y: 1 }, blur = 5, opacity = 0.8) {
        let canvas = Canvas.createCanvas(img.width, img.height)
        let ctx    = canvas.getContext('2d')

        ctx.shadowColor = `rgba(0, 0, 0, ${opacity})`
        ctx.shadowOffsetX = offset.x || 1
        ctx.shadowOffsetY = offset.y || 1
        ctx.shadowBlur = blur
        ctx.drawImage(img, 0, 0)
        return canvas
    },

    square: function (ctx, x, y, r, style) {
        if (style) 
            ctx.fillStyle = style

        ctx.fillRect(x, y, r, r)
    },

    circle: function (ctx, x, y, r, a1, a2, opts = { style: null, fill: false }) {
        if (opts.style) {
            ctx.strokeStyle = opts.style
            ctx.fillStyle = opts.style
        }

        ctx.beginPath()
        ctx.arc(x, y, r, a1, a2)
        ctx.stroke()

        if (opts.fill)
            ctx.fill()
    },

    ellipse: function (ctx, x, y, r, style, opts = { stroke: true, fill: false }) {
        if (style) {
            ctx.strokeStyle = style
            ctx.fillStyle = style
        }
        
        ctx.beginPath()
        ctx.arc(x, y, r, 0, 2 * Math.PI)
        
        if (opts.stroke)
            ctx.stroke()
            
        if (opts.fill)
            ctx.fill()
    },

    getPolygonImage: async function (url, x, sides, startAngle, style) {
        if (url) {
            let img = Canvas.loadImage(url)

            let canvas = Canvas.createCanvas(x, x)
            let ctx = canvas.getContext('2d')

            ctx.drawImage(this.polygon(img, x, sides, startAngle), 0, 0)

            return canvas
        } else {
            let canvas = Canvas.createCanvas(x, x)
            let ctx = canvas.getContext('2d')

            if (style) ctx.fillStyle = style
            ctx.fillRect(0, 0, x, x)
            
            return this.polygon(canvas, x, sides, startAngle)
        }
    },

    polygon: function (img, x, sides, startAngle, counterClockwise) {
        let canvas = Canvas.createCanvas(x, x)
        let ctx = canvas.getContext('2d')
            
        // > implying a zero-sided polygon is a circle | DON'T @ ME

        if (sides === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.globalCompositeOperation = 'source-over'

            ctx.drawImage(img, 0, 0, x, x)

            ctx.fillStyle = '#fff'
            ctx.globalCompositeOperation = 'destination-in'
            ctx.beginPath()
            ctx.arc(canvas.width / 2, canvas.height / 2, x / 2, 0, 2 * Math.PI, true)
            ctx.closePath()
            ctx.fill()

            return canvas
        } else {
            if (sides < 3 || sides > 1000) 
                return canvas

            var a = (Math.PI * 2) / sides
            a = counterClockwise ? -a : a
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            ctx.globalCompositeOperation = 'source-over'

            ctx.drawImage(img, 0, 0, x, x)

            ctx.fillStyle = '#fff'
            ctx.globalCompositeOperation = 'destination-in'
            
            ctx.translate(x / 2, x / 2)
            ctx.rotate(startAngle || 0)
            ctx.moveTo(x / 2, 0)
            ctx.beginPath()
            
            for (var i = 1; i <= sides; i++)
                ctx.lineTo(x / 2 * Math.cos(a * i), x / 2 * Math.sin(a * i))

            ctx.closePath()
            ctx.fill()
            return canvas
        }
    },

    compress: function (canvas, quality) {
        if (isNaN(quality))
            quality = 100
            
        return new Promise(resolve => {
            let buffered = []
            canvas.jpegStream({ quality })
                .on('data', data => buffered.push(data))
                .on('end', () => {
                    resolve(Buffer.concat(buffered))
                })
        })
    },

    brightness: function (canvas, adjust) {
        adjust = Math.floor(255 * (adjust / 100))
        
        let d      = 4 * canvas.width * canvas.height
        let ctx    = canvas.getContext('2d')
        let data   = ctx.getImageData(0, 0, canvas.width, canvas.height)
        let pixels = data.data

        for (let i = 0; i < d; i += 4) {
            let r = pixels[  i  ]
            let g = pixels[i + 1]
            let b = pixels[i + 2]

            r += adjust
            g += adjust
            b += adjust

            pixels[  i  ] = r
            pixels[i + 1] = g
            pixels[i + 2] = b
        }

        ctx.putImageData(data, 0, 0)

        return canvas
    },

    saturation: function (canvas, factor) {
        factor *= -0.01
        
        let d      = 4 * canvas.width * canvas.height
        let ctx    = canvas.getContext('2d')
        let data   = ctx.getImageData(0, 0, canvas.width, canvas.height)
        let pixels = data.data

        for (let i = 0; i < d; i += 4) {
            let r = pixels[  i  ]
            let g = pixels[i + 1]
            let b = pixels[i + 2]

            let max = Math.max(r, g, b)
            if (r !== max)
                r += (max - r) * factor

            if (g !== max)
                g += (max - g) * factor

            if (b !== max)
                b += (max - b) * factor

            pixels[  i  ] = r
            pixels[i + 1] = g
            pixels[i + 2] = b
        }

        ctx.putImageData(data, 0, 0)

        return canvas
    },

    grayscale: function (canvas) {
        let d      = 4 * canvas.width * canvas.height
        let ctx    = canvas.getContext('2d')
        let data   = ctx.getImageData(0, 0, canvas.width, canvas.height)
        let pixels = data.data

        for (let i = 0; i < d; i += 4) {
            let r = pixels[  i  ]
            let g = pixels[i + 1]
            let b = pixels[i + 2]

            pixels[  i  ] = (r + g + b) / 3
            pixels[i + 1] = (r + g + b) / 3
            pixels[i + 2] = (r + g + b) / 3
        }

        ctx.putImageData(data, 0, 0)

        return canvas
    },

    contrast: function (canvas, adjust = 2) {
        adjust = Math.pow((adjust + 100) / 100, 2)
        
        let d      = 4 * canvas.width * canvas.height
        let ctx    = canvas.getContext('2d')
        let data   = ctx.getImageData(0, 0, canvas.width, canvas.height)
        let pixels = data.data

        for (let i = 0; i < d; i += 4) {
            let r = pixels[  i  ]
                
            let g = pixels[i + 1]
                
            let b = pixels[i + 2]

            r /= 255
            r -= 0.5
            r *= adjust
            r += 0.5
            r *= 255
            g /= 255
            g -= 0.5
            g *= adjust
            g += 0.5
            g *= 255
            b /= 255
            b -= 0.5
            b *= adjust
            b += 0.5
            b *= 255

            pixels[  i  ] = r
            pixels[i + 1] = g
            pixels[i + 2] = b
        }

        ctx.putImageData(data, 0, 0)

        return canvas
    },

    sharpen: function (canvas, mix = 0.9) {
        mix = isNaN(mix) ? 0.9 : mix
        let ctx = canvas.getContext('2d')
        let w = canvas.width
        let h = canvas.height
        let x 
        let sx 
        let sy 
        let r 
        let g 
        let b 
        let a
        let dstOff 
        let srcOff 
        let wt 
        let cx 
        let cy 
        let scy 
        let scx
        let weights = [0, -1, 0, -1, 5, -1, 0, -1, 0]
        let katet = Math.round(Math.sqrt(weights.length))
        let half = (katet * 0.5) | 0
        let dstData = ctx.createImageData(w, h)
        let dstBuff = dstData.data
        let srcBuff = ctx.getImageData(0, 0, w, h).data
        let y = h

        while (y--) {
            x = w
            while (x--) {
                sy = y
                sx = x
                dstOff = (y * w + x) * 4
                r = 0
                g = 0
                b = 0
                a = 0

                for (cy = 0; cy < katet; cy++) {
                    for (cx = 0; cx < katet; cx++) {
                        scy = sy + cy - half
                        scx = sx + cx - half

                        if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
                            srcOff = (scy * w + scx) * 4
                            wt = weights[cy * katet + cx]

                            r += srcBuff[srcOff] * wt
                            g += srcBuff[srcOff + 1] * wt
                            b += srcBuff[srcOff + 2] * wt
                            a += srcBuff[srcOff + 3] * wt
                        }
                    }
                }

                dstBuff[dstOff] = r * mix + srcBuff[dstOff] * (1 - mix)
                dstBuff[dstOff + 1] = g * mix + srcBuff[dstOff + 1] * (1 - mix)
                dstBuff[dstOff + 2] = b * mix + srcBuff[dstOff + 2] * (1 - mix)
                dstBuff[dstOff + 3] = srcBuff[dstOff + 3]
            }
        }

        ctx.putImageData(dstData, 0, 0)
        return canvas
    }
}
