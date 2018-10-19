import {Game} from './structures/Game';
import {AbstractPlayer} from './structures/AbstractPlayer';

const emojify = i => [':zero:', ':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:', ':nine:'][i];

export class TicTacToe extends Game {
    constructor(opponent, mode = 'hard') {
        super();

        this.opponent = opponent;
        this.matrix = new Matrix();
        this.mode = mode;
    }

    addPlayer(user, type) {
        if (!this.players[user.id]) {
            let player = this.players[user.id] = new Player(user, this, type);
            this.queue.push(player);
            return player;
        } else
            return null;
    }

    play(position, player = this.player) {
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                if ((i * 3 + j + 1) == position)
                    return this.matrix[i][j].claim(player);
    }
    
    playBot(player = this.player) {
        // ganhar
        for (let win of this.matrix.winPatterns)
            // pra cada padrão de ganho, se 2 casas estiverem ocupadas por mim, colocar a terceira
            if (win.filter(c => c.occupied && c.owner && c.owner.id == player.id).length == 2 && win.find(c => !c.occupied))
                return this.play(win.find(c => !c.occupied).position, player);
        
        // bloquear
        for (let win of this.matrix.winPatterns)
            // se o oponente tem 2 casas ocupadas em sequencia, colocar a terceira
            if (this.mode !== 'easy' && win.filter(c => c.occupied && c.owner && c.owner.id !== player.id).length == 2 && win.find(c => !c.occupied))
                return this.play(win.find(c => !c.occupied).position, player);
        
        if (this.mode == 'hard') {
            for (let triangle of this.matrix.triangles) {
                // se duas arestas do triangulo estiverem ocupadas, e uma das arestas é do bot
                if (!triangle[1].occupied && triangle[0].occupied && triangle[2].occupied && triangle[0].owner.id !== triangle[2].owner.id) {
                    // se o centro é do oponente
                    if (this.matrix.center.occupied && this.matrix.center.owner.id == this.opponent.id) {
                        // jogar em um canto cuja canto vizinho é meu para obrigar o oponente a se defender
                        let corner = triangle.find(c => c.owner.id == player.id).adjacents.find(c => !this.getCell(c).occupied);
                        if (corner)
                            return this.play(corner, player);
                        else
                            return this.play(triangle.find(c => !c.occupied).position, player);
                    }
                }
                // se duas arestas do triangulo estao ocupadas, a do meio não e os donos delas forem o oponente
                if (!triangle[1].occupied && triangle[0].occupied && triangle[2].occupied && triangle[0].owner.id == triangle[2].owner.id) {
                    // se o centro estiver ocupado por mim
                    if (this.matrix.center.occupied && this.matrix.center.owner.id == player.id) {
                        // jogar em uma borda cuja casa oposta esteja livre, para obrigar o oponente a se defender e não completar o triangulo
                        let border = this.matrix.borders.find(c => !c.occupied && !this.getCell(c.opposite).occupied);
                        if (border)
                            return this.play(border.position, player);
                        else
                            return this.play(this.matrix.borders.find(c => !c.occupied).position, player);
                    }
                }
            }
        }
        
        if (this.mode == 'hard' || this.mode == 'medium') {
            for (let corner of this.matrix.corners) {
                // pra cada canto, pegar a casa oposta para montar um triangulo
                let oposto = this.getCell(corner.opposite);
                if (corner.occupied && oposto.occupied && corner.owner.id == oposto.owner.id && corner.owner.id == player.id) {
                    let adjacent = corner.adjacents.find(c => !this.getCell(c).occupied);
                    if (adjacent)
                        return this.play(adjacent, player);
                }
            }
        }
            
        // centro
        if (!this.matrix.center.occupied)
            return this.play(this.matrix.center.position, player);
            
        // canto contrario
        else if (this.matrix.corners.find(c => c.owner && c.owner.id == this.opponent.id) && this.matrix.center.occupied && this.matrix.center.owner.id == this.opponent.id) {
            let casa = this.matrix.corners.find(c => c.owner && c.owner.id == this.opponent.id),
                contrario = this.getCell(casa.opposite);
                
            if (contrario && !contrario.occupied)
                return this.play(contrario.position, player);
        } 
        
        // canto vazio
        else if (this.matrix.corners.find(c => !c.occupied))
            return this.play(this.matrix.corners.find(c => !c.occupied).position, player);
        
        // se nenhuma das opções acima se aplica, jogar em uma
        // casa aleatoria
        return this.play(this.matrix.randomSpot.position, player);
    }
    
    render() {
        return this.matrix.map((e, i) => 
            e.map((_n, j) =>
                this.matrix[i][j].occupied ? this.matrix[i][j].owner.label : emojify(i * 3 + j + 1)
            )
        ).map(e => e.join('')).join('\n');
    }
    
    isGameWon() {
        let won = false, wins = this.matrix.winPatterns;
        for (let i in wins) {
            won = wins[i].every(a => 
                a.type && wins[i][0].type && a.type == wins[i][0].type
            );
            if (won)
                return won;
        }
        return won;
    }
    
    getCell(position) {
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                if ((i * 3 + j + 1) == position)
                    return this.matrix[i][j];
    }
}

class Player extends AbstractPlayer {
    constructor(user, game, type) {
        super(user, game);

        this.type = type;
    }
    
    play(position) {
        this.game.play(position, this);
    }
    
    get label() {
        return `:${this.type}:`;
    }
}

class Cell {
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

class Matrix extends Array {
    // ┌          ┐
    // │ 00 01 02 │
    // │ 10 11 12 │
    // │ 20 21 22 │
    // └          ┘
    
    constructor() {
        super([], [], []);

        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                this[i][j] = new Cell(i, j);
    }

    get freeSpots() {
        let free = [];
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                if (!this[i][j].occupied)
                    free.push(this[i][j]);
        
        return free;
    }
    get corners() {
        return [
            this[0][0],
            this[0][2],
            this[2][0],
            this[2][2]
        ];
    }
    
    get borders() {
        return [
            this[0][1],
            this[1][0],
            this[2][1],
            this[1][2]
        ];
    }
    
    get triangles() {
        return [
            // pontas 1 e 9
            [this[0][0], this[0][2], this[2][2]],
            [this[0][0], this[2][0], this[2][2]],

            // pontas 3 e 7
            [this[2][0], this[0][0], this[0][2]],
            [this[2][0], this[2][2], this[0][2]],

            // bordas com pontas
            [this[1][2], this[2][2], this[2][1]],
            [this[1][2], this[0][2], this[0][1]],
            [this[1][0], this[2][0], this[2][1]],
            [this[0][1], this[0][0], this[1][0]],

            // bordas e pontas
            [this[0][2], this[2][2], this[2][1]],
            [this[1][2], this[2][2], this[2][0]],
            
            [this[2][2], this[0][2], this[0][1]],
            [this[0][0], this[0][2], this[1][2]],
            
            [this[0][0], this[2][0], this[2][1]],
            [this[1][0], this[2][0], this[2][2]],
            
            [this[0][1], this[0][0], this[2][0]],
            [this[1][0], this[0][0], this[0][2]]
        ];
    }
    
    get center() {
        return this[1][1];
    }
    
    get randomSpot() {
        let options = this.freeSpots;
        if (options.length > 0)
            return options[Math.floor(options.length * Math.random())];
    }

    get winPatterns() {
        return [
            // linhas
            [this[0][0], this[0][1], this[0][2]],
            [this[1][0], this[1][1], this[1][2]],
            [this[2][0], this[2][1], this[2][2]],
            // colunas
            [this[0][0], this[1][0], this[2][0]],
            [this[0][1], this[1][1], this[2][1]],
            [this[0][2], this[1][2], this[2][2]],
            // diagonais
            [this[0][0], this[1][1], this[2][2]],
            [this[2][0], this[1][1], this[0][2]],
        ];
    }
}