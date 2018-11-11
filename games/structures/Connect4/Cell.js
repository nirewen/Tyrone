export class Cell {
    constructor (color) {
        this.color = color
    }

    claim (player) {
        this.color = player.color
    }

    toString () {
        return ['⚪', '🔵', '🔴'][this.color]
    }

    valueOf () {
        return this.color
    }
}
