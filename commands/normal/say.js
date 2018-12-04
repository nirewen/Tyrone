import { Util } from 'discord.js'

export const desc = 'Faz o bot dizer alguma coisa'
export const usage = '<texto>'
export const flags = false
export async function run (msg, suffix) {
    if (!suffix)
        return 'wrong usage'

    suffix = Util.cleanContent(suffix, msg)

    msg.send(`\u200B${suffix}`, { disableEveryone: true })
}
