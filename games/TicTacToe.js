import {Game} from './structures/Game';
import {Grid} from './structures/TTT/Grid';
import {Player} from './structures/TTT/Player';

const emojify = i => [
    ':zero:', 
    ':one:', 
    ':two:', 
    ':three:', 
    ':four:', 
    ':five:', 
    ':six:', 
    ':seven:', 
    ':eight:', 
    ':nine:'
][i];

export class TicTacToe extends Game {
    constructor(opponent, mode = 'hard') {
        super();

        this.opponent = opponent;
        this.matrix = new Grid(3, 3);
        this.mode = mode;
    }

    addPlayer(user, type) {
        if (!this.players[user.id]) {
            let player = new Player(user, this, type);
            
            this.players[user.id] = player;
            this.queue.push(player);

            return player;
        }

        return null;
    }

    play(position, player = this.player) {
        let cell = this.getCell(position);

        return cell ? cell.claim(player) : null;
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
        return this.matrix
            .map((e, i) => 
                e.map((_n, j) =>
                    this.matrix[i][j].occupied ? this.matrix[i][j].owner.label : emojify(i * 3 + j + 1)
                )
            )
            .map(e => e.join(''))
            .join('\n');
    }
    
    isGameWon() {
        let won = false, 
            wins = this.matrix.winPatterns;

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
        let i = Math.ceil(position / 3) - 1,
            j = (position % 3 || 3) - 1;

        return this.matrix[i][j];
    }
}