import { Card } from './structures/UNO/Card'
import { Table } from './structures/UNO/Table'
import { Game } from './structures/Game'
import { Player } from './structures/UNO/Player'
import { MessageEmbed, MessageAttachment } from 'discord.js'
import Canvas from 'canvas'

const s = n => n === 1 ? '' : 's'

export class UNO extends Game {
    constructor (channel) {
        super()

        this.channel = channel
        this.deck = []
        this.table = new Table(this)
        this.finished = []
        this.confirm = false
        this.rules = {
            drawSkip: {
                desc: 'Quando comprar pula a vez de quem comprou',
                value: false,
                name: 'Compra-Pula'
            },
            initialCards: {
                desc: 'Quantas cartas pegar de início.',
                value: 7,
                name: 'Cartas iniciais'
            }
        }
    }

    async next () {
        this.queue.push(this.queue.shift())
        this.queue = this.queue.filter(p => !p.finished)
        this.player.sendHand(true)
    }

    send (content) {
        this.channel.send(content)
    }

    addPlayer (member) {
        if (!this.players.has(member.id)) {
            let player = new Player(member, this)
            this.players.set(member.id, player)

            this.queue.push(player)
            return player
        } else
            return null
    }

    async dealAll (number, players = this.queue) {
        let cards = {}
        for (let i = 0; i < number; i++)
            for (const [id, player] of players.entries()) {
                if (this.deck.length === 0) {
                    if (this.table.discard.length === 1)
                        break
                    this.shuffleDeck()
                }
                let c = this.deck.pop()
                if (!cards[id])
                    cards[id] = []

                cards[id].push(c)
                player.hand.push(c)
            }
        for (const [id, player] of players.entries()) {
            player.called = false
            if (cards[id].length > 0) {
                let len = (cards[id].length * 112) + 130
                let canvas = Canvas.createCanvas(len, 362)
                let ctx = canvas.getContext('2d')

                for (let i in cards[id]) {
                    let card = cards[id][i]
                    let image = await Canvas.loadImage(card.URL)

                    ctx.drawImage(image, i * 112, 0, 242, 362)
                }
                await player.send(new MessageEmbed()
                    .setAuthor('UNO', 'https://i.imgur.com/Zzs9X74.png')
                    .setDescription(`Você recebeu a${s(cards[id].length)} seguinte${s(cards[id].length)} carta${s(cards[id].length)}:\n${cards[id].map(c => `**${c}**`).join(' | ')}`)
                    .setImage('attachment://cards.png')
                    .setColor('#E67E22')
                    .attachFiles([new MessageAttachment(canvas.toBuffer(), 'cards.png')]))
            }
        }
    }

    async deal (player, number) {
        let cards = []
        for (let i = 0; i < number; i++) {
            if (this.deck.length === 0) {
                if (this.table.discard.length === 1) break
                this.shuffleDeck()
            }
            let c = this.deck.pop()
            cards.push(c)
            player.hand.push(c)
        }
        player.called = false
        if (cards.length > 0) {
            let len = (cards.length * 112) + 130
            let canvas = Canvas.createCanvas(len, 362)
            let ctx = canvas.getContext('2d')

            for (let i in cards) {
                let card = cards[i]
                let image = await Canvas.loadImage(card.URL)

                ctx.drawImage(image, i * 112, 0, 242, 362)
            }
            await player.send(new MessageEmbed()
                .setAuthor('UNO', 'https://i.imgur.com/Zzs9X74.png')
                .setDescription(`Você recebeu a${s(cards.length)} seguinte${s(cards.length)} carta${s(cards.length)}:\n${cards.map(c => `**${c}**`).join(' | ')}`)
                .setThumbnail('attachment://cards.png')
                .setColor('#E67E22')
                .attachFiles([new MessageAttachment(canvas.toBuffer(), 'cards.png')]))
        }
    }

    generateDeck () {
        for (let color of ['R', 'Y', 'G', 'B']) {
            this.deck.push(new Card('0', color))
            for (let i = 1; i < 10; i++)
                for (let j = 0; j < 2; j++)
                    this.deck.push(new Card(i.toString(), color))
            for (let i = 0; i < 2; i++)
                this.deck.push(new Card('SKIP', color))
            for (let i = 0; i < 2; i++)
                this.deck.push(new Card('REVERSE', color))
            for (let i = 0; i < 2; i++)
                this.deck.push(new Card('+2', color))
        }
        for (let i = 0; i < 4; i++) {
            this.deck.push(new Card('WILD'))
            this.deck.push(new Card('WILD+4'))
        }

        this.shuffleDeck()
    }

    shuffleDeck () {
        let j, x, i, a = [...this.deck, ...this.table.discard]
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1))
            x = a[i]
            a[i] = a[j]
            a[j] = x
        }
        this.deck = a
        for (const card of this.deck.filter(c => c.wild))
            card.color = undefined
        this.send('As cartas foram embaralhadas.')
    }
}
