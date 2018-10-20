export class Cell {
    constructor(i, j) {
        this.i = i;
        this.j = j;
        this.type = null;
        this.owner = null;
        this.occupied = false;
        this.position = this.i * 3 + this.j + 1;
    }

    get opposite() {
        return {
            // corners
            1: 9, 3: 7,
            7: 3, 9: 1,
            // borders
                  2: 8,
            4: 6,       6: 4,
                  8: 2
        }[this.position];
    }
        
    get adjacents() {
        return {
            // borders
                   2: [1, 3],
            4: [1, 7],    6: [3, 9],
                   8: [7, 9],
            // corners
            1: [3, 7], 3: [1, 9],
            7: [1, 9], 9: [3, 7]
        }[this.position];
    }
        
    get closestBorders() {
        return {
            1: [2, 4], 3: [6, 2],
            7: [4, 8], 9: [8, 6]
        }[this.position];
    }
    
    claim(player) {
        this.type = player.type;
        this.occupied = true;
        this.owner = player;
        return this;
    }
}