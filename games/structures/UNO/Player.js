import Canvas from 'canvas'
import { MessageEmbed, MessageAttachment } from 'discord.js'
import { AbstractPlayer } from '../AbstractPlayer'

const s = n => n === 1 ? '' : 's'

export class Player extends AbstractPlayer {
    constructor (user, game) {
        super(user, game)

        this.hand = []
        this.called = false
        this.finished = false
    }

    sortHand () {
        this.hand.sort((a, b) => {
            return a.value > b.value
        })
    }

    parseColor (color) {
        switch ((color || '').toLowerCase()) {
            case 'vermelho':
            case 'red':
            case 'r':
                color = 'R'
                break
            case 'amarelo':
            case 'yellow':
            case 'y':
                color = 'Y'
                break
            case 'verde':
            case 'green':
            case 'g':
                color = 'G'
                break
            case 'azul':
            case 'blue':
            case 'b':
                color = 'B'
                break
            default:
                color = ''
                break
        }
        return color
    }

    getCard (words) {
        let color, id
        if (words.length === 1) {
            id = words[0]
        } else {
            color = words[0]
            id = words[1]
        }
        let _color = this.parseColor(color)
        if (!_color) {
            let temp = color
            color = id
            id = temp
            _color = this.parseColor(color)
            if (!_color) {
                this.game.send('Você precisa especificar uma cor! As cores são **red**, **yellow**, **green**, e **blue**.\n`ty.uno play <cor> <valor>`')
                return null
            }
        }
        color = _color
        if (['WILD', 'WILD+4'].includes(id.toUpperCase())) {
            let card = this.hand.find(c => c.id === id.toUpperCase())
            
            if (!card) 
                return

            card.color = color
            
            return card
        } else {
            return this.hand.find(c => c.id === id.toUpperCase() && c.color === color)
        }
    }

    send (content) {
        this.user.send(content)
    }

    async sendHand (turn = false) {
        this.sortHand()
        let len = (this.hand.length * 112) + 130
        let canvas = Canvas.createCanvas(len, 362)
        let ctx = canvas.getContext('2d')

        for (let i in this.hand) {
            let card = this.hand[i]
            let image = await Canvas.loadImage(card.URL)

            ctx.drawImage(image, i * 112, 0, 242, 362)
        }
        await this.send(new MessageEmbed()
            .setAuthor('UNO', 'https://i.imgur.com/Zzs9X74.png')
            .setDescription(`${turn ? 'É seu turno! ' : ''}Aqui está sua mão:\n\n${this.hand.map(h => `**${h}**`).join(' | ')}\n\nVocê tem ${this.hand.length} carta${s(this.hand.length)}.`)
            .setImage('attachment://cards.png')
            .setColor('#E67E22')
            .attachFiles([new MessageAttachment(canvas.toBuffer(), 'cards.png')]))
    }

    toString () {
        return this.user
    }
}
