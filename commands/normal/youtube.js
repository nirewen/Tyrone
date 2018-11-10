import YouTube from 'simple-youtube-api'
import { YOUTUBE_API_KEY } from '@env'

const youtube = new YouTube(YOUTUBE_API_KEY)

export const desc = 'Procura um vídeo no YouTube'
export const aliases = ['yt']
export const usage = '<termos>'
export async function run (msg, suffix) {
    if (!suffix)
        return 'wrong usage'

    let sentMsg = await msg.send('`Pesquisando vídeo/canal...`')
    let res = await youtube.search(suffix, 10)
    let i = 0

    if (!res[0])
        return sentMsg.edit('https://www.youtube.com/watch?v=61RWfl_m0Dc')

    await sentMsg.edit(`:mag: ${suffix}\n:hash: \`${i + 1}/${res.length}\`\n:link: ${res[i].url}`)

    if (msg.guild && msg.guild.me.permissions.has('MANAGE_MESSAGES'))
        for (let reaction of ['◀', '▶', '⏹'])
            await sentMsg.react(reaction)

    await sentMsg.react('🗑')

    msg.collector = sentMsg.createReactionCollector((r, u) => r.me && u.id === msg.author.id, { time: 6E4 })

    msg.collector.on('collect', async function (r, u) {
        if (r.emoji.name === '◀' && res[i - 1])
            i--

        if (r.emoji.name === '▶' && res[i + 1])
            i++

        if (r.emoji.name === '⏹')
            this.stop()

        if (r.emoji.name === '🗑') {
            this.stop()
            return r.message.delete()
        }

        await r.message.edit(`:mag: ${suffix}\n:hash: \`${i + 1}/${res.length}\`\n:link: ${res[i].url}`)

        await r.users.remove(u)
    })

    msg.collector.on('end', () => sentMsg.reactions.removeAll())
}
