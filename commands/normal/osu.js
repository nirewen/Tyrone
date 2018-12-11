import { osu } from '../../utils/utils.js'
import { MessageAttachment } from 'discord.js'

const modes = ['', 'taiko', 'catch', 'mania']

export const desc = 'Mostra a tua assinatura com dados do osu!'
export const usage = '<usuário>[ --color cor --mode modo]'
export const cooldown = 2
export const flags = true
export async function run (msg, suffix) {
    if (!suffix)
        return 'wrong usage'

    let user  = suffix
    let mode  = msg.flags.get('mode')
    let color = msg.flags.get('color') || 'pink'

    mode = modes.indexOf(mode) > -1 ? modes.indexOf(mode) : 0

    try {
        let img = await osu(user, mode, encodeURIComponent(color))

        msg.send(new MessageAttachment(img, `${suffix}.png`))
    } catch (e) {
        msg.send('Essa cor não existe')
    }
}
