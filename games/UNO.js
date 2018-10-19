import {Game} from './structures/Game';
import {AbstractPlayer} from './structures/AbstractPlayer';
import {RichEmbed, Attachment} from 'discord.js';
import Canvas from 'canvas';
import fs from 'fs';

const s = n => n == 1 ? '' : 's';

export class UNO extends Game {
    constructor(channel) {
        super();

        this.channel = channel;
        this.deck = [];
        this.discard = [];
        this.finished = [];
        this.confirm = false;
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
            },
        }
    }

    get flipped() {
        return this.discard[this.discard.length - 1];
    }

    async next() {
        this.queue.push(this.queue.shift());
        this.queue = this.queue.filter(p => !p.finished);
        this.player.sendHand(true);
    }

    send(content) {
        this.channel.send(content);
    }

    addPlayer(user) {
        if (!this.players[user.id]) {
            let player = this.players[user.id] = new Player(user, this);
            this.queue.push(player);
            return player;
        }
        else return null;
    }

    async dealAll(number, players = this.queue) {
        let cards = {};
        for (let i = 0; i < number; i++)
            for (const player of players) {
                if (this.deck.length === 0) {
                    if (this.discard.length === 1) 
                        break;
                    this.shuffleDeck();
                }
                let c = this.deck.pop();
                if (!cards[player.id]) 
                    cards[player.id] = [];

                cards[player.id].push(c);
                player.hand.push(c);
            }
        for (const player of players) {
            player.called = false;
            if (cards[player.id].length > 0) {
                let len = (cards[player.id].length * 112) + 130,
                    canvas = new Canvas(len, 362),
                    ctx = canvas.getContext('2d');
                    
                for (let i in cards[player.id]) {
                    let card = cards[player.id][i],
                        image = new Canvas.Image;
                    image.src = card.URL;
                    ctx.drawImage(image, i * 112, 0, 242, 362);
                }
                await player.send(new RichEmbed()
                    .setAuthor('UNO', 'https://i.imgur.com/Zzs9X74.png')
                    .setDescription(`Você recebeu a${s(cards[player.id].length)} seguinte${s(cards[player.id].length)} carta${s(cards[player.id].length)}:\n${cards[player.id].map(c => `**${c}**`).join(' | ')}`)
                    .setImage('attachment://cards.png')
                    .setColor('#E67E22')
                    .attachFile(new Attachment(canvas.toBuffer(), 'cards.png')));
            }
        }
    }

    async deal(player, number) {
        let cards = [];
        for (let i = 0; i < number; i++) {
            if (this.deck.length === 0) {
                if (this.discard.length === 1) break;
                this.shuffleDeck();
            }
            let c = this.deck.pop();
            cards.push(c);
            player.hand.push(c);
        }
        player.called = false;
        if (cards.length > 0) {
            let len = (cards.length * 112) + 130,
                    canvas = new Canvas(len, 362),
                    ctx = canvas.getContext('2d');
                    
            for (let i in cards) {
                let card = cards[i],
                    image = new Canvas.Image;
                image.src = card.URL;
                ctx.drawImage(image, i * 112, 0, 242, 362);
            }
            await player.send(new RichEmbed()
                .setAuthor('UNO', 'https://i.imgur.com/Zzs9X74.png')
                .setDescription(`Você recebeu a${s(cards.length)} seguinte${s(cards.length)} carta${s(cards.length)}:\n${cards.map(c => `**${c}**`).join(' | ')}`)
                .setThumbnail('attachment://cards.png')
                .setColor('#E67E22')
                .attachFile(new Attachment(canvas.toBuffer(), 'cards.png')));
        }
    }

    generateDeck() {
        for (const color of ['R', 'Y', 'G', 'B']) {
            this.deck.push(new Card('0', color));
            for (let i = 1; i < 10; i++)
                for (let j = 0; j < 2; j++)
                    this.deck.push(new Card(i.toString(), color));
            for (let i = 0; i < 2; i++)
                this.deck.push(new Card('SKIP', color));
            for (let i = 0; i < 2; i++)
                this.deck.push(new Card('REVERSE', color));
            for (let i = 0; i < 2; i++)
                this.deck.push(new Card('+2', color));
        }
        for (let i = 0; i < 4; i++) {
            this.deck.push(new Card('WILD'));
            this.deck.push(new Card('WILD+4'));
        }

        this.shuffleDeck();
    }

    shuffleDeck() {
        var j, x, i, a = [...this.deck, ...this.discard];
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        this.deck = a;
        for (const card of this.deck.filter(c => c.wild))
            card.color = undefined;
        this.send('O baralho foi embaralhado.');
    }
}

class Player extends AbstractPlayer {
    constructor(user, game) {
        super(user, game);
        
        this.hand = [];
        this.called = false;
        this.finished = false;
    }

    sortHand() {
        this.hand.sort((a, b) => {
            return a.value > b.value;
        });
    }

    parseColor(color) {
        switch ((color || '').toLowerCase()) {
            case 'vermelho':
            case 'red':
            case 'r':
                color = 'R';
                break;
            case 'amarelo':
            case 'yellow':
            case 'y':
                color = 'Y';
                break;
            case 'verde':
            case 'green':
            case 'g':
                color = 'G';
                break;
            case 'azul':
            case 'blue':
            case 'b':
                color = 'B';
                break;
            default:
                color = '';
                break;
        }
        return color;
    }

    getCard(words) {
        let color, id;
        if (words.length === 1) {
            id = words[0];
        } else {
            color = words[0];
            id = words[1];
        }
        let _color = this.parseColor(color);
        if (!_color) {
            let temp = color;
            color = id;
            id = temp;
            _color = this.parseColor(color);
            if (!_color) {
                this.game.send('Você precisa especificar uma cor! As cores são **red**, **yellow**, **green**, e **blue**.\n`ty.uno play <cor> <valor>`');
                return null;
            }
        }
        color = _color;
        if (['WILD', 'WILD+4'].includes(id.toUpperCase())) {
            let card = this.hand.find(c => c.id === id.toUpperCase());
            if (!card) return undefined;
            card.color = color;
            return card;
        } else {
            return this.hand.find(c => c.id === id.toUpperCase() && c.color === color);
        }
    }

    send(content) {
        this.user.send(content);
    }

    async sendHand(turn = false) {
        this.sortHand();
        let len = (this.hand.length * 112) + 130,
            canvas = new Canvas(len, 362),
            ctx = canvas.getContext('2d');
                
        for (let i in this.hand) {
            let card = this.hand[i],
                image = new Canvas.Image;
            image.src = card.URL;
            ctx.drawImage(image, i * 112, 0, 242, 362);
        }
        await this.send(new RichEmbed()
            .setAuthor('UNO', 'https://i.imgur.com/Zzs9X74.png')
            .setDescription(`${turn ? "É seu turno! " : ''}Aqui está sua mão:\n\n${this.hand.map(h => `**${h}**`).join(' | ')}\n\nVocê tem ${this.hand.length} carta${s(this.hand.length)}.`)
            .setThumbnail('attachment://cards.png')
            .setColor('#E67E22')
            .attachFile(new Attachment(canvas.toBuffer(), 'cards.png')));
    }
}

class Card {
    constructor(id, color) {
        this.id = id;
        this.wild = false;
        this.color = color;
        if (!this.color) this.wild = true;
    }

    get colorName() {
        return {
            R: 'Vermelho',
            Y: 'Amarelo',
            G: 'Verde',
            B: 'Azul'
        }[this.color];
    }

    get colorCode() {
        return {
            R: '#ff5555',
            Y: '#ffaa00',
            G: '#55aa55',
            B: '#5555ff'
        }[this.color] || '#080808';
    }

    get URL() {
        return fs.readFileSync(`src/img/UNO/${this.color || ''}${this.id}.png`);
    }

    get value() {
        let val = 0;
        switch (this.color) {
            case 'R': val += 100000; break;
            case 'Y': val += 10000; break;
            case 'G': val += 1000; break;
            case 'B': val += 100; break;
            default: val += 1000000; break;
        }
        switch (this.id) {
            case 'SKIP': val += 10; break;
            case 'REVERSE': val += 11; break;
            case '+2': val += 12; break;
            case 'WILD': val += 13; break;
            case 'WILD+4': val += 14; break;
            default: val += parseInt(this.id); break;
        }
        return val;
    }

    toString() {
        if (this.color)
            return this.colorName + ' ' + this.id;
        else return this.id;
    }
}