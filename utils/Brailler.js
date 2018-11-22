import Canvas from 'canvas'

export class Brailler {
    constructor ({ image, inverted = false, maxWidth = 50 }) {
        this.img = image
        this.inverted = inverted
        this.maxWidth = maxWidth
    }

    convert () {
        let canvas = Canvas.createCanvas()
        let width = this.img.width
        let height = this.img.height
        if (this.img.width !== (this.maxWidth * 2)) {
            width = this.maxWidth * 2
            height = width * this.img.height / this.img.width
        }

        canvas.width = this.nearestMultiple(width, 2)
        canvas.height = this.nearestMultiple(height, 4)

        let ctx = canvas.getContext('2d')
        ctx.fillStyle = '#FFFFFF' // remover alpha
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.imageSmoothingEnabled = false

        ctx.drawImage(this.img, 0, 0, canvas.width, canvas.height)

        let output = ''

        for (let imgy = 0; imgy < canvas.height; imgy += 4) {
            for (let imgx = 0; imgx < canvas.width; imgx += 2) {
                let current = [0, 0, 0, 0, 0, 0, 0, 0]
                let cindex = 0
                for (let x = 0; x < 2; x++) {
                    for (let y = 0; y < 4; y++) {
                        let { data } = ctx.getImageData(imgx + x, imgy + y, 1, 1)
                        let avg = (data[0] + data[1] + data[2]) / 3
                        if (this.inverted) {
                            if (avg > 128)
                                current[cindex] = 1
                        } else if (avg < 128)
                            current[cindex] = 1
                        cindex++
                    }
                }
                output += this.char(current)
            }

            output += '\n'
        }

        return output
    }

    nearestMultiple (num, mult) {
        return num - (num % mult)
    }

    char (current) {
        let allzeros = true
        let total

        for (var i = 0; i < current.length; i++)
            if (current[i] !== 0) {
                allzeros = false
                break
            }

        if (!allzeros)
            total = (current[0] << 0) + (current[1] << 1) + (current[2] << 2) + (current[4] << 3) + (current[5] << 4) + (current[6] << 5) + (current[3] << 6) + (current[7] << 7)
        else
            total = 4

        return String.fromCharCode(0x2800 + total)
    }
}
