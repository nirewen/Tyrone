export const aliases = ['enter']
export async function run (msg) {
    let game = this.bot.games.get('hangman').get(msg.channel.id)
    
    if (game) {
        if (!game.word)
            return msg.send('Aguarde o jogo ser criado para poder entrar')

        if (game.started)
            return msg.send('Esse jogo já começou')

        if (game.players.has(msg.author.id))
            return msg.send('Você já entrou no jogo')

        if (game.author.id === msg.author.id)
            return msg.send('Você criou o jogo e escolheu a palavra, então não pode entrar nele')

        game.addPlayer(msg.author)
        
        return msg.channel.send('Você entrou no jogo! Aguarde ele começar')
    } else
        return msg.send('Não tem nenhum jogo nesse canal... Você pode criar um usando `ty.hangman`')
}
