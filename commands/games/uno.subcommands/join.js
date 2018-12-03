import { UNO } from '../../../games/UNO'

export const aliases = ['enter']
export async function run (msg) {
    let game = this.bot.games.get('uno').get(msg.channel.id)

    if (!game) {
        game = this.bot.games.get('uno').set(msg.channel.id, new UNO(msg.channel))
        game.generateDeck()
    }

    if (game.started)
        return msg.send('Desculpa, esse jogo já começou!')

    let res = game.addPlayer(msg.author)
    if (res === null)
        return msg.channel.send('Você já entrou nesse jogo!')
    else if (game.queue.length === 1)
        return msg.channel.send('Um jogo foi registrado! Assim que todos os jogadores entrarem, digite `ty.uno start` para começar o jogo.')
    else
        return msg.channel.send('Você entrou no jogo! Por favor, aguarde ele começar.')
}
