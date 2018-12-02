import { Letter } from './Letter'

export class Word {
    constructor (word) {
        this.word = word
        this.letters = word.replace(/\s/g, '\u3000').split('').map(l => new Letter(l))
    }

    get length () {
        return this.word.length
    }

    valueOf () {
        return this.word
    }

    toString () {
        return this.letters.join(' ')
    }
}
