import { Akinator } from '../../games/Akinator'
import { MessageEmbed } from 'discord.js'

export const desc = 'Jogue Akinator pelo Discord'
export async function run (msg) {
    if (msg.guild && !msg.channel.permissionsFor(msg.guild.me).has('MANAGE_MESSAGES'))
        return msg.send('Não tenho permissão de remover reações aqui...')

    let game = this.bot.games.get('akinator').set(msg.author.id, new Akinator())
    let question = await game.create()
    let answers = ['Sim', 'Não', 'Não sei', 'Provavelmente sim', 'Provavelmente não']
    let embed = new MessageEmbed()
        .setAuthor('Akinator', 'https://raw.githubusercontent.com/nirewen/Tyrone/master/src/img/akinator_face.png')
        .setTitle(question)
        .setDescription(answers.map((answer, i) => `${i + 1}\u20E3 ${answer}`))
        .setThumbnail('https://raw.githubusercontent.com/nirewen/Tyrone/master/src/img/akinator.png')
        .setFooter(`${Math.floor(game.progression)}% ${game.progressionBar}`)
        .setColor('#149EFF')

    let message = await msg.send(embed)

    msg.collector = message.createReactionCollector((r, u) => r.me && u.id === msg.author.id, { idle: 18E4 })

    msg.collector.on('collect', async function (r, u) {
        let answer = parseInt(r.emoji.name) - 1
        if (r.emoji.name === '⏪')
            question = await game.cancel()
        else
            question = await game.answer(answer)

        if (question.expired) {
            embed
                .setTitle('')
                .setDescription('O jogo expirou...')
            
            this.stop()
        }

        if (question.finished) {
            embed
                .setTitle(question.name)
                .setDescription(question.description)
                .setImage(question.image)
                .setThumbnail()
                .setFooter(`Ranking: ${question.ranking} • Resposta alcançada em ${game.step} jogadas`)
            
            this.stop()
        } else
            embed
                .setTitle(question)
                .setFooter(`${Math.floor(game.progression)}% ${game.progressionBar}`)

        message.edit(embed)
        r.users.remove(u)
    })

    msg.collector.on('end', () => {
        this.bot.games.get('akinator').delete(msg.author.id)
        
        message.reactions.removeAll()
    })

    for (let [i] of answers.entries())
        await message.react(i + 1 + '\u20E3')

    await message.react('⏪')
}
