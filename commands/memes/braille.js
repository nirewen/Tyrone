import Canvas from 'canvas'
import { Brailler } from '../../utils/Brailler'
import { searchImage } from '../../utils/utils'

export const desc = 'Tranforme suas imagens em Braille'
export const help = 'Você pode anexar uma imagem ou usar em uma imagem do chat. \nSe nenhuma imagem for encontrada no chat, ele vai usar o seu avatar por padrão'
export const flags = true
export async function run (msg) {
    let { file } = await searchImage(msg)
    let image = await Canvas.loadImage(file)
    let inverted = msg.flags.has('inverted')
    let maxWidth = parseInt(msg.flags.get('max')) || 50

    let brailled = new Brailler({ image, inverted, maxWidth }).convert()

    msg.send(brailled)
}
