import { Words } from './Words'

export class Letter {
    constructor (letter) {
        this.letter = letter.toUpperCase()
        this.hidden = letter !== '\u3000'
    }

    show () {
        this.hidden = false
    }

    valueOf () {
        return Words.clean(this.letter)
    }

    toString () {
        return this.hidden ? '\\_' : this.letter
    }
}
