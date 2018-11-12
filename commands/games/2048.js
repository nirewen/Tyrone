import { G2048 } from '../../games/2048'

const emojify = n => `${n}`.split('').map(d => d + '\u20E3').join('')

export const desc = 'Jogue 2048 pelo Discord'
export const help = 'Use as reações para jogar!'
export const guildOnly = true
export async function run (msg) {
    let game = new G2048()
    let message = await msg.channel.send(`:1234:${emojify(game.score)}\n\n${game.grid.render()}`)
    let moves = ['⬅', '⬆', '⬇', '➡']

    game.addPlayer(msg.author)

    game.grid.spawnTile()
    game.grid.spawnTile()

    for (let move of moves)
        await message.react(move)

    message.edit(`:1234:${emojify(game.score)}\n\n${game.grid.render()}`)

    msg.collector = message.createReactionCollector((r, u) => r.me && u.id === game.player.user.id, { idle: 18E4 })

    msg.collector.on('collect', async function (r, u) {
        game.move(r.emoji.name)

        let { won, over } = game.grid

        let shownEmoji = won
            ? ':crown:'
            : over
                ? ':skull:'
                : r.emoji.name

        message.edit(`${shownEmoji}${emojify(game.score)}\n\n${game.grid.render()}`)
        r.users.remove(u)

        if (won || over)
            return this.stop()
    })

    msg.collector.on('end', () => message.reactions.removeAll())
}
