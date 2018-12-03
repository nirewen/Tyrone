export const aliases = ['q']
export async function run (msg) {
    let game = this.bot.games.findGame('chess', msg.author.id)

    if (game) {
        this.bot.games.get('chess').delete(this.bot.games.findGameKey('chess', msg.author.id))

        return msg.channel.send('Você saiu do jogo. Jogo cancelado')
    } else
        return msg.send('Você não está em jogo!')
}
