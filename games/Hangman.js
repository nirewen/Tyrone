/* eslint-disable eqeqeq */

import { Game } from './structures/Game'
import { Player } from './structures/Hangman/Player'
import { Word } from './structures/Hangman/Word'
import { Words } from './structures/Hangman/Words'

export class Hangman extends Game {
    constructor (author) {
        super()

        this.author = author
        this.misses = []
        this.guesses = []
    }

    get man () {
        return `https://raw.githubusercontent.com/nirewen/Tyrone/master/src/img/hangman/${this.misses.length}.png`
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

    setWord (word) {
        this.word = new Word(word)
    }

    play (letter, player = this.player) {
        letter = Words.clean(letter.toUpperCase())

        if (!letter)
            throw new Error('Você precisa jogar uma letra válida')

        if (letter.length > 1)
            throw new Error('Você só pode jogar uma letra por vez')

        if (this.guesses.includes(letter))
            throw new Error('Essa letra já foi jogada')
        else {
            this.guesses.push(letter)
            player.guesses.push(letter)
        }

        if (this.word.letters.find(l => l == letter)) {
            this.word.letters.filter(l => l == letter).forEach(l => l.show())
            player.score += 10
        } else
            this.misses.push(letter)

        if (this.misses.length >= 6) {
            this.word.letters.forEach(l => l.show())
            throw new Error('man hang')
        }

        if (this.word.letters.filter(l => l.hidden).length < 1)
            return true

        return false
    }

    guess (word) {
        word = word.toUpperCase()

        if (word.length !== this.word.length)
            throw new Error('O tamanho da palavra não é o mesmo da palavra do jogo')

        if (word == this.word)
            this.word.letters.forEach(l => l.show())
        else
            throw new Error('Palavra incorreta')

        return true
    }
}
