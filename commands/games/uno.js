export const desc = 'Jogue UNO com seus amigos'
export const help = [
    'Comandos:',
    '```',
    'join       | Cria um jogo ou entra em um já criado',
    'quit       | Sai de um jogo',
    'play       | Joga uma carta na mesa',
    'draw       | Compra uma carta do baralho',
    'mesa       | Mostra os jogadores',
    'start      | Inicia o jogo que você criou',
    'contra-uno | Penaliza um jogador com uma carta na mão,',
    '           | mas que não disse UNO!',
    '```'
]
export const usage = '<comando> [...argumentos]'
export const aliases = ['u']
export async function run (msg, suffix) {
    if (!suffix)
        return msg.send(this.helpMessage)
}
