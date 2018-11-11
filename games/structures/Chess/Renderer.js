import Canvas from 'canvas'
import { schemes } from './schemes'

export class Renderer {
    static async render (game, check = {}) {
        let w = 40
        let canvas = Canvas.createBoard(8 * w + 20, 8 * w + 20)
        let ctx = canvas.getContext('2d')

        let { status, scheme } = game

        for (let square of status.board.squares) {
            let col = square.file.charCodeAt(0) - 97
            let row = [7, 6, 5, 4, 3, 2, 1, 0][square.rank - 1]
            let color = schemes[scheme][(row + col) % 2]

            if (check.attackingSquare &&
                square.rank === check.attackingSquare.rank &&
                square.file === check.attackingSquare.file)
                color = '#f04947'
            if (check.kingSquare &&
                square.rank === check.kingSquare.rank &&
                square.file === check.kingSquare.file)
                color = '#43b581'

            ctx.fillStyle = color
            ctx.fillRect(col * w, row * w, w, w)

            if (square.piece) {
                let image = await Canvas.loadImage(`img/chess/${square.piece.side.name}_${square.piece.type}.png`)
                ctx.drawImage(image, col * w, row * w, w, w)
            }

            ctx.font = '16px'
            ctx.fillStyle = '#d5d5d5'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            if (row === 7)
                ctx.fillText(square.file.toUpperCase(), col * w + w / 2, (row + 1) * w + 10)

            if (col === 7)
                ctx.fillText(square.rank, (col + 1) * w + 10, row * w + w / 2)
        }

        return canvas
    }
}
